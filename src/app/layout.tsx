import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'KnowFlow - 图文规范RAG智能检索助手',
    template: '%s | KnowFlow',
  },
  description:
    '基于 RAG 架构的建筑图文规范检索智能体，融合 Agentic RAG 与多模态 RAG 双引擎，实现规范条文问答与图集详图双向检索',
  keywords: [
    'KnowFlow',
    'RAG',
    'Agentic RAG',
    '多模态RAG',
    '建筑规范',
    '图集检索',
    '智能体调度',
    '建筑检索',
    '规范问答',
    '建筑知识',
  ],
  openGraph: {
    title: 'KnowFlow - 图文规范RAG智能检索助手',
    description: '基于 RAG 架构的建筑图文规范检索智能体',
    locale: 'zh_CN',
    type: 'website',
  },
  icons: {
    icon: '/rag-icon.png',
    apple: '/rag-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning：Trae 预览运行时会在服务端向 <html>/<body> 注入
    // data-trae-ref 等属性及浏览器检查高亮节点，客户端水合时不复现，
    // 导致 React Hydration Error #185。根元素的属性注入无法通过组件门控规避，
    // 在此显式抑制水合告警（与 next-themes 等运行时注入的常规处理一致）。
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
