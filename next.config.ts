import type { NextConfig } from 'next';
import path from 'path';

const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME || 'KnowFlow';
// 静态导出 (output: "export") 用于 GitHub Pages：
// - basePath / assetPrefix 指向 /<仓库名> 让所有资源在 https://<user>.github.io/<仓库名>/ 下能正确加载
// - trailingSlash: true 保证所有路由导出为 xxx/index.html，避免 Pages 直接访问 xxx 报 404
// - images.unoptimized: true 静态导出下 Next Image Optimization 不可用，必须关闭
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: `/${REPO_NAME}`,
  assetPrefix: `/${REPO_NAME}/`,
  allowedDevOrigins: ['*.dev.coze.site'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
  // GitHub Pages 静态导出不支持 rewrites / 服务端代理，
  // 仅在未启用静态导出时（比如本地 next dev / SSR 部署）启用 Dify 代理。
  ...(process.env.NEXT_PUBLIC_STATIC_EXPORT !== 'true' && {
    async rewrites() {
      const difyBase = process.env.DIFY_API_BASE_URL || 'http://127.0.0.1/v1';
      const difyUrl = difyBase.replace(/\/v1\/?$/, '');
      return [
        {
          source: '/dify/:path*',
          destination: `${difyUrl}/:path*`,
        },
      ];
    },
  }),
};

export default nextConfig;

