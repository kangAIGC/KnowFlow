"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FOLDERS,
  FOLDER_LABELS,
  KIND_LABELS,
  buildVirtualContent,
  realFileUrl,
  type FileKind,
  type FolderId,
  type KnowledgeFile,
} from "@/lib/knowledge-data";

/* ---------------- 新建文件 ---------------- */

export interface NewFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 打开时默认选中的文件夹 */
  defaultFolder: FolderId;
  onCreate: (input: {
    name: string;
    kind: FileKind;
    folder: FolderId;
    content: string;
  }) => void;
}

const NEW_KINDS: FileKind[] = ["pdf", "doc", "docx", "txt"];

export function NewFileDialog({
  open,
  onOpenChange,
  defaultFolder,
  onCreate,
}: NewFileDialogProps) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<FileKind>("docx");
  const [folder, setFolder] = useState<FolderId>(defaultFolder);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 每次打开时重置表单,并同步默认文件夹
  useEffect(() => {
    if (open) {
      setName("");
      setKind("docx");
      setFolder(defaultFolder);
      setContent("");
      setError(null);
    }
  }, [open, defaultFolder]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("请输入文件名称");
      return;
    }
    onCreate({ name: trimmed, kind, folder, content });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-1">
          <DialogTitle className="pr-8 text-base font-semibold">新建文件</DialogTitle>
          <DialogDescription className="text-xs">
            在知识库中创建一个新文档,可稍后在检索中引用
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex min-h-0 flex-1 flex-col gap-4"
        >
          <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="new-file-name" className="text-sm font-medium">
              文件名称 <span className="text-destructive">*</span>
            </label>
            <Input
              id="new-file-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="例如:建筑防火规范读书笔记"
              maxLength={60}
              autoFocus
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-sm font-medium">文件类型</span>
              <Select value={kind} onValueChange={(v) => setKind(v as FileKind)}>
                <SelectTrigger aria-label="文件类型">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NEW_KINDS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {KIND_LABELS[k]} 文档
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <span className="text-sm font-medium">所属文件夹</span>
              <Select
                value={folder}
                onValueChange={(v) => setFolder(v as FolderId)}
              >
                <SelectTrigger aria-label="所属文件夹">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOLDERS.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new-file-content" className="text-sm font-medium">
              初始内容(可选)
            </label>
            <Textarea
              id="new-file-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入文档初始内容,内容将支持关键词检索"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="submit">创建</Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
