"use client";

import { useEffect, useState } from "react";

/**
 * 客户端挂载标志：SSR 与首帧统一返回 false，挂载后置 true。
 *
 * 用于在 Trae 预览运行时于服务端向 DOM 注入 `data-trae-ref` 等属性、
 * 而客户端水合时不复现，从而触发 React Hydration Error #185 的场景下，
 * 让受影响组件在服务端/首帧渲染稳定空内容，挂载后再渲染真实 UI，
 * 从根因上消除 SSR/CSR 不一致。
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
