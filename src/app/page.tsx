'use client';

import Link from 'next/link';
import { BookOpen, Image as ImageIcon, Database } from 'lucide-react';
import Header from '@/components/header';
import SearchCard from '@/components/search-card';
import { useMounted } from '@/hooks/use-mounted';

export default function Home() {
  // 根因修复：Trae 预览运行时在服务端向 DOM 注入 data-trae-ref 等属性，
  // 客户端水合时不复现，触发 React Hydration Error #185。
  // 服务端/首帧统一返回 null，挂载后再渲染真实 UI，从根因上消除不一致。
  const mounted = useMounted();
  if (!mounted) return null;
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl">
          图文规范<span className="text-destructive">RAG</span>智能检索助手
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
          RAG-Based Intelligent Text-Image Specification Retrieval Agent for Architecture
        </p>
        <p className="mx-auto mt-3 max-w-3xl text-sm text-muted-foreground/80">
          智能体平台融合 Agentic RAG 与多模态 RAG 双引擎，帮助建筑师快速、准确检索建筑图文规范。
        </p>
      </section>

      {/* Search Cards */}
      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 知识库管理已迁至独立页面 */}
          <Link href="/knowledge" className="block cursor-pointer">
            <SearchCard
              title="知识库管理"
              description="统一管理建筑规范与标准图集，支持用户上传 PDF 等文件入库，支持分类浏览与快速定位"
              image="/ill-3.png"
              icon={<Database className="h-5 w-5" />}
              iconClassName="bg-destructive/10 text-destructive"
              imageHeight="h-40"
              hideWatermark
            />
          </Link>
          <Link href="/search?category=standard" className="block cursor-pointer">
            <SearchCard
              title="规范检索"
              description="基于 Agentic RAG 构建规范知识库，支持多轮推理与条文溯源，实现规范问答的智能回答"
              image="/ill-4.png"
              icon={<BookOpen className="h-5 w-5" />}
              iconClassName="bg-destructive/10 text-destructive"
              imageHeight="h-40"
            />
          </Link>
          <Link href="/search?category=atlas" className="block cursor-pointer">
            <SearchCard
              title="图集检索"
              description="基于多模态 RAG 处理国标图集，支持文字描述与图纸截图双向检索，快速找到相关构造详图"
              image="/ill-atlas-new.png"
              icon={<ImageIcon className="h-5 w-5" />}
              iconClassName="bg-destructive/10 text-destructive"
              imageHeight="h-40"
            />
          </Link>
        </div>

        {/* Search Input */}
        <div className="mt-16 mx-auto w-full max-w-2xl px-6">
          <Link
            href="/search"
            className="group block"
          >
            <div className="relative rounded-2xl border border-border bg-card shadow-sm transition-colors hover:border-primary/30 hover:shadow-md">
              {/* Placeholder Text */}
              <div className="min-h-[64px] p-5 pr-20 text-lg text-muted-foreground flex items-center">
                Ask KnowFlow anything…
              </div>
              {/* Send Button */}
              <div className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-lg bg-destructive text-white transition-all hover:bg-destructive/90">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m5 12 7-7 7 7" />
                  <path d="M12 19V5" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
