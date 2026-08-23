'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface VIPModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const plans = [
  {
    id: 'monthly',
    label: '月卡',
    period: '1个月',
    price: 29,
    originalPrice: 39,
    badge: null,
    features: ['无限次智能检索', '规范条文全文溯源', '图集截图高清下载', '优先客服响应'],
  },
  {
    id: 'quarterly',
    label: '季卡',
    period: '3个月',
    price: 69,
    originalPrice: 117,
    badge: '省40%',
    features: ['月卡全部权益', '案例素材库访问', '批量导出检索结果', '专属检索策略调优'],
  },
  {
    id: 'yearly',
    label: '年卡',
    period: '12个月',
    price: 199,
    originalPrice: 348,
    badge: '超值推荐',
    features: ['季卡全部权益', '新规范实时更新推送', '团队协作（5人）', 'API 接口调用额度'],
  },
];

export default function VIPModal({ open, onOpenChange }: VIPModalProps) {
  const [selected, setSelected] = useState('yearly');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            升级 VIP，解锁全部检索能力
          </DialogTitle>
          <DialogDescription className="text-center">
            选择适合您的订阅方案，随时可取消
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={cn(
                'relative flex flex-col rounded-xl border-2 p-5 text-left transition-all',
                selected === plan.id
                  ? 'border-destructive bg-destructive/5 shadow-md'
                  : 'border-border bg-card hover:border-muted-foreground/30'
              )}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-destructive px-2.5 py-0.5 text-xs font-semibold text-white">
                  {plan.badge}
                </span>
              )}
              <div className="mb-1 text-sm font-medium text-muted-foreground">
                {plan.label}
                <span className="ml-1 text-xs text-muted-foreground/60">
                  {plan.period}
                </span>
              </div>
              <div className="mb-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">
                  ¥{plan.price}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ¥{plan.originalPrice}
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {plan.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <div className="mt-2 flex flex-col items-center gap-3">
          <button className="w-full max-w-xs rounded-xl bg-destructive py-3 text-base font-semibold text-white shadow-lg shadow-destructive/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-destructive/30">
            立即充值 ¥{plans.find((p) => p.id === selected)?.price}
          </button>
          <p className="text-xs text-muted-foreground/60">
            支持微信支付 · 支付宝 · 对公转账
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
