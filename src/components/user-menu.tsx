'use client';

import { useState } from 'react';
import { User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  if (isLoggedIn) {
    return (
      <button className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-foreground" title="用户">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-xs bg-destructive/10 text-destructive">
            U
          </AvatarFallback>
        </Avatar>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
        title="我的"
      >
        <User className="h-5 w-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="items-center">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-destructive"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <DialogTitle className="text-xl">
              {isLogin ? '欢迎回来' : '创建账户'}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? '登录您的 KnowFlow 账户'
                : '注册 KnowFlow 账户'}
            </p>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4">
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  昵称
                </label>
                <input
                  type="text"
                  placeholder="请输入昵称"
                  className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-destructive focus:outline-none focus:ring-1 focus:ring-destructive"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">邮箱</label>
              <input
                type="email"
                placeholder="请输入邮箱"
                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-destructive focus:outline-none focus:ring-1 focus:ring-destructive"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">密码</label>
              <input
                type="password"
                placeholder="请输入密码"
                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-destructive focus:outline-none focus:ring-1 focus:ring-destructive"
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" className="rounded border-border" />
                  记住我
                </label>
                <button className="text-sm text-destructive hover:underline">
                  忘记密码？
                </button>
              </div>
            )}

            <button className="mt-2 h-11 w-full rounded-lg bg-destructive text-base font-semibold text-white shadow-lg shadow-destructive/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-destructive/30">
              {isLogin ? '登录' : '注册'}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? '还没有账户？' : '已有账户？'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 font-medium text-destructive hover:underline"
              >
                {isLogin ? '立即注册' : '去登录'}
              </button>
            </p>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs text-muted-foreground">
                  其他登录方式
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-all hover:bg-muted">
                <svg className="h-5 w-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-all hover:bg-muted">
                <svg className="h-5 w-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-all hover:bg-muted">
                <svg className="h-5 w-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.46 6c-.85.38-1.78.64-2.73.76 1-.6 1.76-1.54 2.12-2.67-.93.55-1.96.95-3.06 1.17-.88-.94-2.13-1.53-3.51-1.53-2.66 0-4.81 2.16-4.81 4.81 0 .38.04.75.13 1.1-4-.2-7.58-2.11-9.96-5.02-.42.72-.66 1.56-.66 2.46 0 1.68.85 3.16 2.14 4.02-.79-.02-1.53-.24-2.18-.6v.06c0 2.35 1.67 4.31 3.88 4.76-.4.1-.83.16-1.27.16-.31 0-.62-.03-.92-.08.63 1.96 2.45 3.39 4.61 3.43-1.69 1.32-3.83 2.1-6.15 2.1-.4 0-.8-.02-1.19-.07 2.19 1.4 4.78 2.22 7.57 2.22 9.07 0 14.02-7.52 14.02-14.02 0-.21 0-.42-.01-.63.96-.69 1.79-1.56 2.45-2.55z" />
                </svg>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
