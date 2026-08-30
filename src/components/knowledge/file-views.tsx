"use client";

import { Eye, Download, Trash2 } from "lucide-react";
import {
  KIND_LABELS,
  contentSnippet,
  formatSize,
  splitHighlight,
  type FolderId,
  type KnowledgeFile,
} from "@/lib/knowledge-data";
import { applyBasePath, cn } from "@/lib/utils";

/** 规范/图集的行首图标:直接复用站点首页已有的大尺寸插图,以图片区分知识库 */
const FOLDER_ICONS: Record<FolderId, string> = {
  standard: applyBasePath("/ill-4.png"),
  atlas: applyBasePath("/ill-atlas-new.png"),
};

function FolderImageIcon({ file }: { file: KnowledgeFile }) {
  return (
    // 静态导出站点,无需 next/image 优化
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={FOLDER_ICONS[file.folder]}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className="h-9 w-9 shrink-0 rounded-lg border border-border/40 object-cover"
    />
  );
}

/** 关键词高亮文本 */
function HighlightText({ text, query }: { text: string; query: string }) {
  const parts = splitHighlight(text, query);
  return (
    <>
      {parts.map((p, i) =>
        p.hit ? (
          <mark
            key={i}
            className="rounded-sm bg-yellow-200/80 px-0.5 text-inherit dark:bg-yellow-500/30"
          >
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  );
}

interface FileActionsProps {
  file: KnowledgeFile;
  onView: (file: KnowledgeFile) => void;
  onDownload: (file: KnowledgeFile) => void;
  onDelete: (file: KnowledgeFile) => void;
  compact?: boolean;
}

function FileActions({ file, onView, onDownload, onDelete, compact }: FileActionsProps) {
  const btn =
    "flex items-center justify-center rounded-md text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <div className={cn("flex shrink-0 items-center", compact ? "gap-0.5" : "gap-1")}>
      <button
        type="button"
        title={`预览「${file.name}」`}
        aria-label={`预览 ${file.name}`}
        onClick={() => onView(file)}
        className={cn(btn, compact ? "h-7 w-7" : "h-8 w-8")}
      >
        <Eye className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>
      <button
        type="button"
        title={`下载「${file.name}」`}
        aria-label={`下载 ${file.name}`}
        onClick={() => onDownload(file)}
        className={cn(btn, compact ? "h-7 w-7" : "h-8 w-8")}
      >
        <Download className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>
      <button
        type="button"
        title={`删除「${file.name}」`}
        aria-label={`删除 ${file.name}`}
        onClick={() => onDelete(file)}
        className={cn(
          btn,
          compact ? "h-7 w-7" : "h-8 w-8",
          "hover:bg-destructive/10 hover:text-destructive"
        )}
      >
        <Trash2 className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>
    </div>
  );
}

export interface FileViewsProps {
  files: KnowledgeFile[];
  query: string;
  onView: (file: KnowledgeFile) => void;
  onDownload: (file: KnowledgeFile) => void;
  onDelete: (file: KnowledgeFile) => void;
}

export function FileListView({
  files,
  query,
  onView,
  onDownload,
  onDelete,
}: FileViewsProps) {
  return (
    // table-fixed + 固定列宽:翻页时列布局不随内容重排,页面尺寸保持稳定
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full table-fixed text-sm">
        <colgroup>
          <col />
          <col className="hidden w-[100px] sm:table-column" />
          <col className="hidden w-[90px] sm:table-column" />
          <col className="w-[120px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">文档名称</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">修改时间</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">大小</th>
            <th className="px-4 py-3 text-right font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const snippet = contentSnippet(file.content, query);
            return (
              <tr
                key={file.id}
                className="border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/40"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FolderImageIcon file={file} />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium text-foreground">
                        <HighlightText text={file.name} query={query} />
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {KIND_LABELS[file.kind]}
                        {snippet ? (
                          <span className="ml-2 text-foreground/70">
                            命中:
                            <HighlightText text={snippet} query={query} />
                          </span>
                        ) : (
                          <span className="ml-2">最后编辑 {file.modifiedLabel}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground sm:table-cell">
                  {file.modifiedLabel}
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground sm:table-cell">
                  {formatSize(file.sizeKB)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <FileActions
                      file={file}
                      onView={onView}
                      onDownload={onDownload}
                      onDelete={onDelete}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function FileGridView({
  files,
  query,
  onView,
  onDownload,
  onDelete,
}: FileViewsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {files.map((file) => {
        const snippet = contentSnippet(file.content, query);
        return (
          <div
            key={file.id}
            className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <FolderImageIcon file={file} />
            <div className="mt-3 line-clamp-2 min-h-[2.5rem] text-xs font-medium text-foreground">
              <HighlightText text={file.name} query={query} />
            </div>
            {snippet ? (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                命中:
                <HighlightText text={snippet} query={query} />
              </p>
            ) : null}
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{KIND_LABELS[file.kind]}</span>
              <span>·</span>
              <span>{formatSize(file.sizeKB)}</span>
              <span>·</span>
              <span>{file.modifiedLabel}</span>
            </div>
            <div className="mt-3 border-t border-border/60 pt-3">
              <FileActions
                file={file}
                onView={onView}
                onDownload={onDownload}
                onDelete={onDelete}
                compact
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
