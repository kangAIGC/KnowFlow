import { MetadataRoute } from 'next';

// 与 robots.ts 同理:静态导出模式下 sitemap 也需显式声明为静态。
export const dynamic = "force-static";

const REPO = process.env.NEXT_PUBLIC_REPO_NAME || "KnowFlow";
const BASE = REPO ? `https://example.github.io/${REPO}` : "http://localhost:5000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${BASE}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/search/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
