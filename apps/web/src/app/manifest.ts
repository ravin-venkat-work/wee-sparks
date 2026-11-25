import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wee Sparks — NI CCEA Foundation Stage",
    short_name: "Wee Sparks",
    description:
      "Offline-first, audio-first literacy and numeracy quests for Northern Ireland Primary 1 & Primary 2.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#E0F2FE",
    theme_color: "#0284C7",
    lang: "en-GB",
    categories: ["education", "kids"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
