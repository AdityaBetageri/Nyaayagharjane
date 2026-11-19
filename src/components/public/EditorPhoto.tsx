"use client";

import { useState } from "react";
import { User } from "lucide-react";

interface EditorPhotoProps {
  src?: string;
  alt?: string;
  editorName?: string;
  className?: string;
}

export default function EditorPhoto({
  src = "/editor.jpg",
  alt = "ಹರೀಶ್ ಕಮ್ಮನಕೋಟೆ - ಪ್ರಧಾನ ಸಂಪಾದಕರು, ನ್ಯಾಯ ಘರ್ಜನೆ",
  editorName = "ಹರೀಶ್ ಕಮ್ಮನಕೋಟೆ",
  className = "",
}: EditorPhotoProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 border-[#172B4D]/15 shadow-md bg-gradient-to-b from-stone-100 to-stone-200 aspect-[4/5] flex items-center justify-center ${className}`}
    >
      {!imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-top transition-transform duration-300 hover:scale-[1.02]"
          loading="eager"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center text-[#172B4D]/60 space-y-2">
          <div className="w-20 h-20 rounded-full bg-white/90 border border-stone-300 flex items-center justify-center shadow-inner">
            <User className="w-10 h-10 text-[#172B4D]/70" />
          </div>
          <span className="text-sm font-bold text-[#172B4D]">{editorName}</span>
          <span className="text-xs font-medium text-[#C62828]">ಪ್ರಧಾನ ಸಂಪಾದಕರು</span>
          <span className="text-[10px] text-stone-500">ನ್ಯಾಯ ಘರ್ಜನೆ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ</span>
        </div>
      )}

      {/* Elegant bottom label */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#172B4D] via-[#172B4D]/85 to-transparent p-3 pt-6 text-white text-center">
        <p className="text-xs sm:text-sm font-bold leading-tight tracking-wide">{editorName}</p>
        <p className="text-[10px] text-[#FF8A80] font-medium">ಪ್ರಧಾನ ಸಂಪಾದಕರು • ನ್ಯಾಯ ಘರ್ಜನೆ</p>
      </div>
    </div>
  );
}
