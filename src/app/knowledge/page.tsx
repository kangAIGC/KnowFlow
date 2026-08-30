"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Search,
  LayoutGrid,
  List,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
  SearchX,
  BookOpen,
  Image as ImageIcon,
} from "lucide-react";
import Header from "@/components/header";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FolderSidebar, {
  type SidebarSelection,
} from "@/components/knowledge/folder-sidebar";
import {
  FileListView,
  FileGridView,
} from "@/components/knowledge/file-views";
import { PreviewDialog } from "@/components/knowledge/knowledge-dialogs";
import {
  FOLDER_LABELS,
  INITIAL_FILES,
  downloadVirtualFile,
  realFileUrl,
  todayLabel,
  type FolderId,
  type KnowledgeFile,
} from "@/lib/knowledge-data";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

type SortKey = "modified-desc" | "modified-asc" | "name-asc" | "size-desc" | "size-asc";
type ViewMode = "list" | "grid";

interface UploadTask {
  name: string;
  progress: number;
}

interface StatusMessage {
  type: "success" | "error";
  message: string;
}

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "modified-desc", label: "修改时间(新→旧)" },
  { value: "modified-asc", label: "修改时间(旧→新)" },
  { value: "name-asc", label: "名称(A→Z)" },
  { value: "size-desc", label: "大小(大→小)" },
  { value: "size-asc", label: "大小(小→大)" },
];

export default function KnowledgePage() {
  // 与站内其他页面一致:挂载后才渲染,规避 SSR/CSR 水合不一致
  const mounted = useMounted();

  const [files, setFiles] = useState<KnowledgeFile[]>(INITIAL_FILES);
  const [selectedFolder, setSelectedFolder] = useState<SidebarSelection>("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("modified-desc");
  const [view, setView] = useState<ViewMode>("list");
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [uploadTask, setUploadTask] = useState<UploadTask | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [previewFile, setPreviewFile] = useState<KnowledgeFile | null>(null);
  // 本次导入的目标知识库,由「导入规范/导入图集」菜单项写入
  const importTargetRef = useRef<FolderId>("standard");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idRef = useRef(100);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 卸载时清理模拟上传/状态提示的定时器
  useEffect(() => {
    return () => {
      if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  /** 展示成功/失败反馈(成功 3 秒后自动消失) */
  const showStatus = useCallback((next: StatusMessage) => {
    setStatus(next);
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    statusTimerRef.current = setTimeout(() => setStatus(null), 3000);
  }, []);

  // 各知识库计数(实时派生,新增/删除后自动更新)
  const counts = useMemo(
    () => ({
      standard: files.filter((f) => f.folder === "standard").length,
      atlas: files.filter((f) => f.folder === "atlas").length,
    }),
    [files]
  );

  // 过滤(名称+内容联合匹配;选中「全部」时不限制知识库)→ 排序
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = files.filter((f) => {
      if (selectedFolder !== "all" && f.folder !== selectedFolder) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) || f.content.toLowerCase().includes(q)
      );
    });
    const sorted = [...list];
    switch (sortKey) {
      case "modified-desc":
        sorted.sort((a, b) => b.modifiedTs - a.modifiedTs);
        break;
      case "modified-asc":
        sorted.sort((a, b) => a.modifiedTs - b.modifiedTs);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"));
        break;
      case "size-desc":
        sorted.sort((a, b) => b.sizeKB - a.sizeKB);
        break;
      case "size-asc":
        sorted.sort((a, b) => a.sizeKB - b.sizeKB);
        break;
    }
    return sorted;
  }, [files, selectedFolder, query, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageFiles = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  // 筛选条件变化时回到第一页
  useEffect(() => {
    setPage(1);
  }, [selectedFolder, query, sortKey]);

  /* ---------------- 文件操作 ---------------- */

  const handleView = useCallback((file: KnowledgeFile) => {
    setPreviewFile(file);
  }, []);

  const handleDownload = useCallback((file: KnowledgeFile) => {
    if (file.fileName) {
      // 真实 PDF:通过隐藏 <a> 触发原文件下载,保留原始文件名
      const a = document.createElement("a");
      a.href = realFileUrl(file.fileName);
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      // 虚拟文档:导出为纯文本
      downloadVirtualFile(file);
    }
    showStatus({ type: "success", message: `已开始下载「${file.name}」` });
  }, [showStatus]);

  const handleDelete = useCallback(
    (file: KnowledgeFile) => {
      const ok = window.confirm(
        `确定要删除「${file.name}」吗?删除后不可恢复。`
      );
      if (!ok) return;
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      if (previewFile?.id === file.id) setPreviewFile(null);
      showStatus({ type: "success", message: `已删除「${file.name}」` });
    },
    [previewFile, showStatus]
  );

  /* ---------------- PDF 上传(模拟进度,静态站点无后端) ---------------- */

  const startSimulatedUpload = useCallback(
    (file: File) => {
      if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
      setUploadTask({ name: file.name, progress: 0 });
      uploadTimerRef.current = setInterval(() => {
        setUploadTask((task) => {
          if (!task) return task;
          const next = Math.min(100, task.progress + Math.ceil(Math.random() * 14));
          if (next >= 100) {
            if (uploadTimerRef.current) {
              clearInterval(uploadTimerRef.current);
              uploadTimerRef.current = null;
            }
            // 上传完成:入库(目标为菜单中选择的知识库)
            const rawName = file.name.replace(/\.pdf$/i, "") || "未命名文档";
            const folder: FolderId = importTargetRef.current;
            setFiles((prev) => [
              {
                id: `kf-upload-${++idRef.current}`,
                name: rawName,
                kind: "pdf",
                folder,
                sizeKB: Math.max(1, Math.round(file.size / 1024)),
                modifiedLabel: todayLabel(),
                modifiedTs: Date.now(),
                content: `用户上传的 PDF 文档:${rawName}。已加入${FOLDER_LABELS[folder]}。`,
              },
              ...prev,
            ]);
            setTimeout(() => setUploadTask(null), 400);
            showStatus({ type: "success", message: `「${file.name}」上传成功,已加入${FOLDER_LABELS[folder]}` });
            return { ...task, progress: 100 };
          }
          return { ...task, progress: next };
        });
      }, 120);
    },
    [showStatus]
  );

  /** 菜单选择导入目标后,打开文件选择器 */
  const handleImportInto = (folder: FolderId) => {
    importTargetRef.current = folder;
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 允许重复选择同一文件
    if (!file) return;
    if (!/\.pdf$/i.test(file.name)) {
      showStatus({ type: "error", message: "仅支持 PDF 文件,请重新选择" });
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      showStatus({ type: "error", message: "文件大小超过 100MB 限制" });
      return;
    }
    startSimulatedUpload(file);
  };

  if (!mounted) return null;

  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length);

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />

      {/* 顶部:面包屑 + 工具栏 */}
      <div className="border-b border-border bg-card/60">
        <div className="mx-auto w-full max-w-7xl space-y-3 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
              title="打开文件夹"
              aria-label="打开文件夹"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <span className="ml-auto text-xs text-muted-foreground sm:ml-0">
              共 {filtered.length} 个文档
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 搜索框(同时匹配名称与内容) */}
            <div className="relative min-w-[180px] flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索文件名称或内容关键词,如:防火分区、檐沟..."
                className="pl-9"
                aria-label="搜索文档"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="清空搜索"
                  aria-label="清空搜索"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              {/* 排序 */}
              <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                <SelectTrigger className="h-9 w-[150px] text-xs" aria-label="排序方式">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 视图切换 */}
              <div className="flex overflow-hidden rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  title="列表视图"
                  aria-label="列表视图"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center transition-colors",
                    view === "list"
                      ? "bg-destructive text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  title="网格视图"
                  aria-label="网格视图"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center transition-colors",
                    view === "grid"
                      ? "bg-destructive text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>

              {/* 导入文件:深红实心,点击弹出 导入规范/导入图集 两个选项 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-9 gap-1.5"
                    disabled={uploadTask !== null}
                  >
                    <Upload className="h-4 w-4" />
                    导入文件
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => handleImportInto("standard")}>
                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    导入规范
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleImportInto("atlas")}>
                    <ImageIcon className="h-4 w-4 text-destructive" />
                    导入图集
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={handleFileInputChange}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 主体:双列布局 */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-4 overflow-hidden px-4 py-4 lg:px-6">
        <FolderSidebar
          selected={selectedFolder}
          onSelect={(id) => {
            setSelectedFolder(id);
            setSidebarOpen(false);
          }}
          counts={counts}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* 右侧文件区域 */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* 上传进度条 */}
          {uploadTask && (
            <div className="mb-3 rounded-lg border border-border bg-card px-4 py-2.5">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="truncate font-medium text-foreground">
                  正在上传:{uploadTask.name}
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {uploadTask.progress}%
                </span>
              </div>
              <Progress value={uploadTask.progress} className="h-1.5" />
            </div>
          )}

          {/* 状态反馈 */}
          {status && (
            <div
              className={cn(
                "mb-3 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm",
                status.type === "success"
                  ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              )}
              role="status"
            >
              {status.type === "success" ? (
                <CheckCircle className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span className="flex-1">{status.message}</span>
              <button
                type="button"
                onClick={() => setStatus(null)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                aria-label="关闭提示"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* 文件列表(滚动区) */}
          <div className="flex-1 overflow-y-auto pb-2">
            {pageFiles.length === 0 ? (
              <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border text-center">
                <SearchX className="h-10 w-10 text-muted-foreground/50" />
                <div>
                  <p className="font-medium text-foreground">未找到匹配的文档</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    试试更换关键词或调整排序方式
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setQuery("")}
                >
                  清除筛选条件
                </Button>
              </div>
            ) : view === "list" ? (
              <FileListView
                files={pageFiles}
                query={query}
                onView={handleView}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ) : (
              <FileGridView
                files={pageFiles}
                query={query}
                onView={handleView}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            )}
          </div>

          {/* 分页 */}
          {filtered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">
                显示 {rangeStart}-{rangeEnd} 条,共 {filtered.length} 条
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage(safePage - 1)}
                  className="flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  上一页
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - safePage) <= 1
                  )
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-muted-foreground">…</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setPage(p)}
                        className={cn(
                          "h-8 w-8 rounded-md text-xs font-medium transition-colors",
                          p === safePage
                            ? "bg-destructive text-white"
                            : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                        aria-current={p === safePage ? "page" : undefined}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage(safePage + 1)}
                  className="flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  下一页
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 弹窗 */}
      <PreviewDialog file={previewFile} onOpenChange={(o) => !o && setPreviewFile(null)} />
    </div>
  );
}
