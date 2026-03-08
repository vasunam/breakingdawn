import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Luna Cycle",
    short_name: "Luna",
    description: "Private cycle tracking with calm, mobile-first logging.",
    start_url: "/",
    display: "standalone",
    background_color: "#090B10",
    theme_color: "#090B10",
    icons: [
      {
        src: "/icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon?size=512",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
