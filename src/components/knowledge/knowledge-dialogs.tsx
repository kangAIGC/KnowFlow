"use client";

import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FOLDER_LABELS,
  KIND_LABELS,
  realFileUrl,
  type KnowledgeFile,
} from "@/lib/knowledge-data";

/* ---------------- 文件预览 ---------------- */

export interface PreviewDialogProps {
  file: KnowledgeFile | null;
  onOpenChange: (open: boolean) => void;
}

export function PreviewDialog({ file, onOpenChange }: PreviewDialogProps) {
  return (
    <Dialog open={file !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[88vh] w-[calc(100%-2rem)] max-w-[1100px] flex-col gap-3 p-4 sm:p-5">
        <DialogHeader className="space-y-0.5">
          <DialogTitle className="truncate pr-8 text-base font-semibold">
            {file?.name ?? "文档预览"}
          </DialogTitle>
          <DialogDescription className="truncate pr-8 text-xs">
            {file
              ? `${KIND_LABELS[file.kind]} · ${FOLDER_LABELS[file.folder]}`
              : ""}
          </DialogDescription>
        </DialogHeader>

        {file?.fileName ? (
          // 真实 PDF:浏览器原生查看器在线预览完整内容
          <iframe
            src={realFileUrl(file.fileName)}
            title={file.name}
            className="h-full w-full flex-1 rounded-md border border-border bg-muted/30"
          />
        ) : file ? (
          // 虚拟文档:结构化文本预览
          <div className="flex h-full w-full flex-1 overflow-y-auto rounded-md border border-border bg-muted/20 p-5">
            <div className="mx-auto w-full max-w-2xl">
              <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  文档内容预览
                </span>
              </div>
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground">
                {file.content}
              </pre>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
