import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "@/lib/siteConfig";

export const runtime = "nodejs";

export const alt = "ನ್ಯಾಯಘರ್ಜನೆ | ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ | Kannada Monthly E-Newspaper";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#172B4D",
          color: "white",
          padding: "60px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                backgroundColor: "#C62828",
                color: "white",
                padding: "8px 18px",
                borderRadius: "8px",
                fontSize: "20px",
                fontWeight: 900,
                letterSpacing: "1px",
              }}
            >
              ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ
            </div>
            <div style={{ fontSize: "20px", color: "#FF8A80", fontWeight: 700 }}>
              KANNADA MONTHLY E-PAPER
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "18px",
              color: "#E2E8F0",
              fontWeight: 600,
            }}
          >
            ಕರ್ನಾಟಕ ರಾಜ್ಯ ಆವೃತ್ತಿ
          </div>
        </div>

        {/* Center Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", margin: "20px 0" }}>
          <div
            style={{
              fontSize: "76px",
              fontWeight: 900,
              color: "#FFFFFF",
              lineHeight: 1.1,
              letterSpacing: "-1px",
            }}
          >
            {SITE_CONFIG.name}
          </div>

          <div
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: "#FF8A80",
            }}
          >
            {SITE_CONFIG.tagline}
          </div>

          <div
            style={{
              fontSize: "22px",
              color: "#CBD5E1",
              maxWidth: "960px",
              lineHeight: 1.4,
              marginTop: "8px",
            }}
          >
            ಸಮಾಜದ ಧ್ವನಿ • ಜನರ ಸಮಸ್ಯೆಗಳು • ಭ್ರಷ್ಟಾಚಾರದ ವಿರುದ್ಧ ನಿರ್ಭೀತ ವರದಿಗಾರಿಕೆ
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(255,255,255,0.15)",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "18px",
                color: "#FFFFFF",
              }}
            >
              📖 ಉಚಿತ ಆನ್‌ಲೈನ್ ವಾಚಕ
            </div>
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "18px",
                color: "#FFFFFF",
              }}
            >
              ⚡ ಡೈರೆಕ್ಟ್ PDF ಡೌನ್‌ಲೋಡ್
            </div>
          </div>

          <div
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#F8FAFC",
              letterSpacing: "0.5px",
            }}
          >
            nyaayagharjane.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
