import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ನ್ಯಾಯಘರ್ಜನೆ - ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ",
    short_name: "ನ್ಯಾಯಘರ್ಜನೆ",
    description:
      "ನ್ಯಾಯಘರ್ಜನೆ — ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ | ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ",
    start_url: "/",
    display: "standalone",
    background_color: "#172B4D",
    theme_color: "#C62828",
    orientation: "portrait",
    lang: "kn",
    categories: ["news", "magazines", "newspapers", "books"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
