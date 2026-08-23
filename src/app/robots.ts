import { MetadataRoute } from 'next';

// Next 16 `output: "export"` 静态导出模式下,MetadataRoute 文件(robots/sitemap/manifest)
// 需要显式声明为静态,否则会被归类为"动态 route handler"导致构建失败。
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/static/'],
    },
  };
}
