"use client";

import { BookOpen, FolderOpen, Image as ImageIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  FOLDERS,
  FOLDER_LABELS,
  type FolderId,
} from "@/lib/knowledge-data";
import { cn } from "@/lib/utils";

/** 两个顶级知识库的视觉区分:规范=蓝色书本,图集=橙色图片 */
const FOLDER_UI: Record<
  FolderId,
  { icon: LucideIcon; iconCls: string; activeCls: string }
> = {
  standard: {
    icon: BookOpen,
    iconCls: "text-blue-600 dark:text-blue-400",
    activeCls:
      "bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30",
  },
  atlas: {
    icon: ImageIcon,
    iconCls: "text-orange-600 dark:text-orange-400",
    activeCls:
      "bg-orange-500/10 text-orange-700 dark:text-orange-300 ring-1 ring-orange-500/30",
  },
};

interface FolderSidebarProps {
  /** 当前选中的知识库 id */
  selected: FolderId;
  onSelect: (id: FolderId) => void;
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
        <div className="flex items-center justify-between px-4 pb-2 pt-4 lg:pt-4">
          <span className="text-sm font-semibold text-foreground">文件夹</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            title="收起文件夹"
            aria-label="收起文件夹"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
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
                {active ? (
                  <FolderOpen className={cn("h-4 w-4 shrink-0", ui.iconCls)} />
                ) : (
                  <Icon className={cn("h-4 w-4 shrink-0", ui.iconCls)} />
                )}
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
