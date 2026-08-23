import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 为静态资源(src/href 等)补 basePath 前缀,避免在 GitHub Pages 子路径(如 /KnowFlow)下
 * 原生 <img src="/xxx.png"> 或 <a href="/xxx"> 请求到站点根路径而 404。
 *
 * 同时存在两处来源,保持统一即可:
 * - next.config.ts 的 basePath: `/${REPO_NAME}`
 * - 本函数的 NEXT_PUBLIC_BASE_PATH 默认值: /KnowFlow
 */
export function applyBasePath(src: string): string {
  if (!src) return src;
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("//")
  ) {
    return src;
  }
  if (!src.startsWith("/")) return src;
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "/KnowFlow";
  if (base && base !== "/") {
    if (src === base || src.startsWith(`${base}/`)) return src;
    return `${base}${src}`;
  }
  return src;
}
