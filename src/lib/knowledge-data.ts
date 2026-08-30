import { applyBasePath } from "@/lib/utils";

/** 知识库管理模块 - 类型与数据定义 */

export type FolderId = "standard" | "atlas";
export type FileKind = "pdf" | "doc" | "docx" | "txt";

export interface FolderNode {
  id: FolderId;
  name: string;
}

export interface KnowledgeFile {
  id: string;
  /** 展示名称(不含扩展名) */
  name: string;
  kind: FileKind;
  folder: FolderId;
  sizeKB: number;
  /** 展示用修改日期(固定字符串,避免 SSR/CSR 水合不一致) */
  modifiedLabel: string;
  /** 排序用时间戳 */
  modifiedTs: number;
  /**
   * public 目录下真实文件名;存在则支持浏览器原生 PDF 预览与原文件下载。
   * 虚拟(在线新建/模拟入库)文档不设置该字段。
   */
  fileName?: string;
  /** 文档内容,用于"内容"关键词搜索、虚拟文档预览与导出 */
  content: string;
}

export const FOLDERS: FolderNode[] = [
  { id: "standard", name: "规范" },
  { id: "atlas", name: "图集" },
];

export const FOLDER_LABELS: Record<FolderId, string> = {
  standard: "规范",
  atlas: "图集",
};

export const KIND_LABELS: Record<FileKind, string> = {
  pdf: "PDF",
  doc: "DOC",
  docx: "DOCX",
  txt: "TXT",
};

/** 文件类型图标配色(图标背景 / 图标前景) */
export const KIND_COLORS: Record<FileKind, string> = {
  pdf: "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400",
  doc: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
  docx: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
  txt: "bg-muted text-muted-foreground",
};

export const INITIAL_FILES: KnowledgeFile[] = [
  {
    id: "kf-1",
    name: "GB 55037-2022 建筑防火通用规范-带条文说明",
    kind: "pdf",
    folder: "standard",
    sizeKB: 3842,
    modifiedLabel: "2026/8/20",
    modifiedTs: 1787500000000,
    fileName: "!! GB 55037-2022 建筑防火通用规范-带条文说明.pdf",
    content:
      "建筑防火通用规范。总则:为预防建筑火灾、减小火灾危害,保护人身和财产安全,制定本规范。耐火等级:建筑构件的燃烧性能和耐火极限应符合规定。防火分区:高层民用建筑防火分区最大允许建筑面积应符合要求。安全疏散:疏散门应向疏散方向开启,疏散楼梯宽度应满足疏散时间要求。",
  },
  {
    id: "kf-2",
    name: "00SJ202 建筑坡屋面构造",
    kind: "pdf",
    folder: "atlas",
    sizeKB: 2610,
    modifiedLabel: "2026/8/20",
    modifiedTs: 1787500000000,
    fileName: "00SJ202建筑坡屋面构造.pdf",
    content:
      "建筑坡屋面构造图集。屋面檐沟详图:檐沟、天沟节点构造,卷材防水层收头处理。挂瓦条、顺水条安装间距要求。坡屋面排水坡度与瓦材选择对应表。",
  },
  {
    id: "kf-3",
    name: "建筑设计防火规范 GB50016 条文摘录",
    kind: "doc",
    folder: "standard",
    sizeKB: 96,
    modifiedLabel: "2026/8/12",
    modifiedTs: 1786500000000,
    content:
      "防火分区与防火间距摘录:厂房防火分区最大允许建筑面积与耐火等级对应关系。疏散楼梯的净宽度不应小于1.1米。消防车道净宽、净高均不应小于4米。",
  },
  {
    id: "kf-4",
    name: "民用建筑设计统一标准 GB50352 学习笔记",
    kind: "docx",
    folder: "standard",
    sizeKB: 148,
    modifiedLabel: "2026/8/8",
    modifiedTs: 1785900000000,
    content:
      "学习笔记:建筑物理环境、无障碍设计、楼梯台阶宽度和栏杆高度等通用规定摘录。坡屋面檐口、檐沟排水构造的相关条文引用。",
  },
  {
    id: "kf-5",
    name: "屋面工程技术规范 GB50340 要点整理",
    kind: "doc",
    folder: "standard",
    sizeKB: 88,
    modifiedLabel: "2026/7/30",
    modifiedTs: 1784800000000,
    content:
      "屋面工程防水等级与设防要求。卷材防水屋面檐沟、天沟纵向找坡不应小于1%。涂膜防水层的平均厚度应符合设计要求。",
  },
  {
    id: "kf-6",
    name: "坡屋面构造详图集摘要",
    kind: "docx",
    folder: "atlas",
    sizeKB: 132,
    modifiedLabel: "2026/7/26",
    modifiedTs: 1784400000000,
    content:
      "图集摘要:坡屋面檐沟详图索引、挂瓦条剖面、屋脊节点、泛水收头等常用构造做法一览。",
  },
  {
    id: "kf-7",
    name: "檐沟天沟构造节点手册",
    kind: "pdf",
    folder: "atlas",
    sizeKB: 640,
    modifiedLabel: "2026/7/18",
    modifiedTs: 1783600000000,
    content:
      "节点手册:金属檐沟安装节点、成品天沟与落水口连接、女儿墙泛水与天沟交接处防水增强处理。",
  },
  {
    id: "kf-8",
    name: "建筑坡屋面排水设计说明",
    kind: "txt",
    folder: "atlas",
    sizeKB: 24,
    modifiedLabel: "2026/7/10",
    modifiedTs: 1782800000000,
    content:
      "设计说明:屋面檐沟详图选用说明、雨水斗布置原则、有组织排水与自由落水适用条件、天沟容积计算方法。",
  },
];

/** KB / MB 格式化 */
export function formatSize(sizeKB: number): string {
  if (sizeKB < 1024) return `${sizeKB.toFixed(1)} KB`;
  return `${(sizeKB / 1024).toFixed(1)} MB`;
}

/** 将文本按命中关键词切分,用于高亮渲染 */
export function splitHighlight(
  text: string,
  query: string
): Array<{ text: string; hit: boolean }> {
  const q = query.trim();
  if (!q) return [{ text, hit: false }];
  const lowerText = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const parts: Array<{ text: string; hit: boolean }> = [];
  let from = 0;
  while (true) {
    const idx = lowerText.indexOf(lowerQ, from);
    if (idx === -1) {
      if (from < text.length) parts.push({ text: text.slice(from), hit: false });
      break;
    }
    if (idx > from) parts.push({ text: text.slice(from, idx), hit: false });
    parts.push({ text: text.slice(idx, idx + q.length), hit: true });
    from = idx + q.length;
  }
  return parts;
}

/** 取内容中首次命中的上下文片段,用于"内容"搜索结果的摘要展示 */
export function contentSnippet(content: string, query: string): string | null {
  const q = query.trim();
  if (!q) return null;
  const idx = content.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return null;
  const start = Math.max(0, idx - 24);
  const end = Math.min(content.length, idx + q.length + 36);
  return `${start > 0 ? "…" : ""}${content.slice(start, end)}${end < content.length ? "…" : ""}`;
}

/** 生成新建虚拟文件的默认内容 */
export function buildVirtualContent(
  name: string,
  kindLabel: string,
  folderLabel: string,
  extra?: string
): string {
  const base = `《${name}》\n类型:${kindLabel}\n所属:${folderLabel}\n\n`;
  return base + (extra?.trim() ? extra.trim() : "本文档为在 KnowFlow 中在线新建的文档。");
}

/** 虚拟文档以纯文本形式导出下载(真实 PDF 走原文件下载) */
export function downloadVirtualFile(file: KnowledgeFile): void {
  const blob = new Blob([file.content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${file.name}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** 真实 PDF 在站点中的访问地址(自动补 GitHub Pages basePath) */
export function realFileUrl(fileName: string): string {
  return applyBasePath(`/${encodeURIComponent(fileName)}`);
}

/** 客户端事件中使用的日期格式化(仅挂载后的交互调用,无水合风险) */
export function todayLabel(): string {
  const d = new Date();
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
