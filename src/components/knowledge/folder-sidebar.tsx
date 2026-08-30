"use client";

import { useState } from "react";
import { ChevronRight, FolderOpen, Folder, Library } from "lucide-react";
import {
  FOLDERS,
  FOLDER_LABELS,
  type FolderId,
} from "@/lib/knowledge-data";
import { cn } from "@/lib/utils";

interface FolderSidebarProps {
  /** 当前选中的文件夹 id */
  selected: FolderId;
  onSelect: (id: FolderId) => void;
  /** 各文件夹(含 all)的文件数量 */
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
  // 根节点"全部文件夹"的展开/折叠状态(仅影响子目录显示)
  const [expanded, setExpanded] = useState(true);

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

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
          {/* 顶级目录:全部文件夹 */}
          <button
            type="button"
            onClick={() => onSelect("all")}
            className={cn(
              "flex w-full items-center gap-1 rounded-lg px-2 py-2 text-sm transition-colors",
              selected === "all"
                ? "bg-primary/10 font-semibold text-primary"
                : "text-foreground hover:bg-muted"
            )}
          >
            <span
              role="button"
              tabIndex={-1}
              aria-label={expanded ? "折叠子目录" : "展开子目录"}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-transform duration-200 hover:bg-muted"
            >
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  expanded && "rotate-90"
                )}
              />
            </span>
            <Library className="h-4 w-4 shrink-0 text-primary" />
            <span className="flex-1 text-left">全部文件夹</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {counts.all}
            </span>
          </button>

          {/* 一级子目录 */}
          <div
            className={cn(
              "grid transition-all duration-200",
              expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <div className="ml-5 space-y-0.5 border-l border-border/70 pl-2 pt-0.5">
                {FOLDERS.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => {
                      onSelect(folder.id);
                      setExpanded(true);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
                      selected === folder.id
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {selected === folder.id ? (
                      <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="flex-1 truncate text-left">
                      {FOLDER_LABELS[folder.id]}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {counts[folder.id]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
