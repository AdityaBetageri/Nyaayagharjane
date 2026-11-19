import { Env, NewspaperItem, UploadCompletePayload } from "./types";

const CATALOGUE_KEY = "data/newspapers.json";

/**
 * Reads the newspapers catalogue directly from R2 via the bucket binding.
 * Safely parses and returns an array.
 */
export async function getCatalogueFromR2(env: Env): Promise<NewspaperItem[]> {
  try {
    const object = await env.NEWSPAPERS_BUCKET.get(CATALOGUE_KEY);
    if (!object) {
      return [];
    }

    const text = await object.text();
    if (!text || !text.trim()) {
      return [];
    }

    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed;
    }

    return [];
  } catch (err) {
    console.error("Error reading catalogue from R2:", err);
    return [];
  }
}

/**
 * Atomically writes the updated catalogue JSON into R2.
 */
export async function saveCatalogueToR2(
  env: Env,
  catalogue: NewspaperItem[]
): Promise<void> {
  const jsonString = JSON.stringify(catalogue, null, 2);
  await env.NEWSPAPERS_BUCKET.put(CATALOGUE_KEY, jsonString, {
    httpMetadata: {
      contentType: "application/json; charset=utf-8",
      cacheControl: "public, max-age=60, s-maxage=300",
    },
    customMetadata: {
      updatedAt: new Date().toISOString(),
      itemCount: String(catalogue.length),
    },
  });
}

/**
 * Verifies that the uploaded object exists in R2 and adds/updates its entry in newspapers.json.
 * Enforces deduplication and prevents data loss.
 */
export async function addUploadedNewspaperToCatalogue(
  env: Env,
  payload: UploadCompletePayload,
  adminUid: string
): Promise<{ item: NewspaperItem; totalItems: number }> {
  // 1. Verify object exists in R2 via Bucket Binding
  const head = await env.NEWSPAPERS_BUCKET.head(payload.objectKey);
  if (!head) {
    throw new Error(
      `Verification failed: Object "${payload.objectKey}" was not found in the R2 bucket. Did the upload finish?`
    );
  }

  const fileSizeBytes = head.size || 0;
  if (fileSizeBytes === 0) {
    throw new Error("Verification failed: Uploaded file is empty (0 bytes).");
  }

  // 2. Fetch existing catalogue
  const existingCatalogue = await getCatalogueFromR2(env);

  // Generate ID based on year and month, e.g. "news-2026-11"
  const paddedMonth = String(payload.month).padStart(2, "0");
  const editionId = `news-${payload.year}-${paddedMonth}`;
  const nowIso = new Date().toISOString();

  // Public PDF URL
  const publicBase = (env.R2_PUBLIC_DOMAIN || "").trim().replace(/\/+$/, "");
  const pdfUrl = publicBase
    ? `${publicBase}/${payload.objectKey}`
    : `/${payload.objectKey}`;

  const pdfFilename = payload.objectKey.split("/").pop() || "newspaper.pdf";

  // Build the new record
  const newItem: NewspaperItem = {
    id: editionId,
    title: payload.title?.trim() || `ನ್ಯಾಯ ಘರ್ಜನೆ — ${payload.year}-${paddedMonth}`,
    month: paddedMonth,
    year: Number(payload.year),
    edition: payload.editionArea?.trim() || "Karnataka State",
    language: payload.language?.trim() || "Kannada",
    publishedAt: nowIso,
    pdfUrl,
    pdfFilename,
    objectKey: payload.objectKey,
    fileSizeBytes,
    formattedFileSize:
      payload.formattedFileSize ||
      `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`,
    totalPages: Number(payload.totalPages) || 16,
    status: payload.status || "published",
    description:
      payload.description?.trim() ||
      "ನ್ಯಾಯಘರ್ಜನೆ ಅಧಿಕೃತ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ. ಸತ್ಯದ ಧ್ವನಿ, ನ್ಯಾಯದ ಘರ್ಜನೆ.",
    uploadedBy: adminUid,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // Check for duplicates by ID or objectKey
  const existingIndex = existingCatalogue.findIndex(
    (item) => item.id === editionId || item.objectKey === payload.objectKey
  );

  let updatedCatalogue: NewspaperItem[];
  if (existingIndex >= 0) {
    // Preserve original createdAt and update with new details
    const existing = existingCatalogue[existingIndex];
    newItem.createdAt = existing.createdAt || nowIso;
    updatedCatalogue = [...existingCatalogue];
    updatedCatalogue[existingIndex] = newItem;
  } else {
    // Prepend new item to the top of the list
    updatedCatalogue = [newItem, ...existingCatalogue];
  }

  // Save safely to R2
  await saveCatalogueToR2(env, updatedCatalogue);

  return { item: newItem, totalItems: updatedCatalogue.length };
}

/**
 * Deletes an edition from newspapers.json and removes the associated PDF object from R2.
 */
export async function deleteNewspaperFromR2(
  env: Env,
  editionId: string
): Promise<{ deletedItem: NewspaperItem | null; totalRemaining: number }> {
  const catalogue = await getCatalogueFromR2(env);
  const targetItem = catalogue.find((item) => item.id === editionId);

  if (!targetItem) {
    return { deletedItem: null, totalRemaining: catalogue.length };
  }

  // 1. Delete the PDF file from R2
  if (targetItem.objectKey) {
    try {
      await env.NEWSPAPERS_BUCKET.delete(targetItem.objectKey);
    } catch (err) {
      console.warn("Could not delete R2 object:", targetItem.objectKey, err);
    }
  }

  // 2. Remove from catalogue and save
  const remainingCatalogue = catalogue.filter((item) => item.id !== editionId);
  await saveCatalogueToR2(env, remainingCatalogue);

  return { deletedItem: targetItem, totalRemaining: remainingCatalogue.length };
}
