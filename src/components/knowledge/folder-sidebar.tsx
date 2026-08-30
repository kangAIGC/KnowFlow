"use client";

import { BookOpen, Image as ImageIcon, Library } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  FOLDERS,
  FOLDER_LABELS,
  type FolderId,
} from "@/lib/knowledge-data";
import { cn } from "@/lib/utils";

/** 侧栏可选项:全部(all,聚合两库)或单个知识库 */
export type SidebarSelection = "all" | FolderId;

/** 规范/图集统一红色系:仅以图标形状区分(书本/图片),配色与站点主色一致 */
const FOLDER_UI: Record<
  FolderId,
  { icon: LucideIcon; iconCls: string; activeCls: string }
> = {
  standard: {
    icon: BookOpen,
    iconCls: "text-destructive",
    activeCls:
      "bg-destructive/10 text-destructive dark:text-red-300 ring-1 ring-destructive/30",
  },
  atlas: {
    icon: ImageIcon,
    iconCls: "text-destructive",
    activeCls:
      "bg-destructive/10 text-destructive dark:text-red-300 ring-1 ring-destructive/30",
  },
};

interface FolderSidebarProps {
  /** 当前选中项:全部 或 某个知识库 */
  selected: SidebarSelection;
  onSelect: (id: SidebarSelection) => void;
  /** 各知识库的文件数量 */
  counts: Record<FolderId, number>;
  /** 移动端抽屉打开状态 */
  open?: boolean;
  onClose?: () => void;
}

export default function FolderSidebar({
  selected,
  onSelect,
  counts,
  open = false,
  onClose,
}: FolderSidebarProps) {
  const total = counts.standard + counts.atlas;

  return (
    <>
      {/* 移动端遮罩 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "z-50 flex w-64 shrink-0 flex-col rounded-xl border border-border bg-card transition-all duration-300",
          // 桌面端常驻;移动端固定抽屉
          "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:rounded-none max-lg:rounded-r-xl max-lg:transition-transform",
          open ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
        )}
      >
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4 pt-3">
          {/* 全部:聚合展示两个知识库的所有文件 */}
          <button
            type="button"
            onClick={() => onSelect("all")}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-all duration-150",
              selected === "all"
                ? "bg-destructive/10 font-semibold text-destructive ring-1 ring-destructive/30 dark:text-red-300"
                : "text-foreground hover:bg-muted"
            )}
            aria-current={selected === "all" ? "true" : undefined}
          >
            <Library
              className={cn(
                "h-4 w-4 shrink-0",
                selected === "all" ? "text-destructive dark:text-red-300" : "text-muted-foreground"
              )}
            />
            <span className="flex-1 text-left">全部</span>
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 text-xs",
                selected === "all"
                  ? "bg-background/70"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {total}
            </span>
          </button>

          <div className="mx-1 border-b border-border/60 pb-1" role="presentation" />

          {FOLDERS.map((folder) => {
            const ui = FOLDER_UI[folder.id];
            const Icon = ui.icon;
            const active = selected === folder.id;
            return (
              <button
                key={folder.id}
                type="button"
                onClick={() => onSelect(folder.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-all duration-150",
                  active
                    ? cn("font-semibold", ui.activeCls)
                    : "text-foreground hover:bg-muted"
                )}
                aria-current={active ? "true" : undefined}
              >
                {/* 选中/未选中恒定使用各自专属图标,仅切换颜色,避免图标跳变 */}
                <Icon className={cn("h-4 w-4 shrink-0", ui.iconCls)} />
                <span className="flex-1 truncate text-left">
                  {FOLDER_LABELS[folder.id]}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-1.5 py-0.5 text-xs",
                    active ? "bg-background/70" : "bg-muted text-muted-foreground"
                  )}
                >
                  {counts[folder.id]}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
