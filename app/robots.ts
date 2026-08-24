import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Konten personal & privat tidak diindex
        disallow: ["/t/", "/dashboard", "/admin", "/api/", "/checkout", "/buat"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://ucapanpacar.vercel.app"}/sitemap.xml`,
  };
}
