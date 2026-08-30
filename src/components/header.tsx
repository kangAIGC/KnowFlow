'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bot, Database, Bell, Settings, MoreHorizontal } from 'lucide-react';
import UserMenu from '@/components/user-menu';
import { useMounted } from '@/hooks/use-mounted';

export default function Header() {
  // 根因修复：Trae 预览运行时会在服务端向 DOM 注入 `data-trae-ref` 等属性，
  // 客户端水合时不复现，触发 React Hydration Error #185。
  // 服务端/首帧统一返回 null，挂载后再渲染真实 UI，从根因上消除不一致。
  const mounted = useMounted();
  const pathname = usePathname();
  const isActive = (target: string) => pathname === target;

  if (!mounted) return null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          {/* Left: Brand + Nav Icons */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                KnowFlow
              </span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                href="/"
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                  isActive('/')
                    ? 'bg-destructive text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title="首页"
              >
                <Home className="h-5 w-5" />
              </Link>
              <Link
                href="/knowledge"
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                  pathname.startsWith('/knowledge')
                    ? 'bg-destructive text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title="知识库管理"
              >
                <Database className="h-5 w-5" />
              </Link>
              <Link
                href="/search"
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                  isActive('/search')
                    ? 'bg-destructive text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title="智能检索"
              >
                <Bot className="h-5 w-5" />
              </Link>
            </nav>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-2">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              title="通知"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              title="设置"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              title="更多"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            <UserMenu />
          </div>
        </div>
      </header>
    </>
  );
}
