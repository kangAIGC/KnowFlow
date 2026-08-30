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
  doc: "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400",
  docx: "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400",
  txt: "bg-muted text-muted-foreground",
};

/** 初始数据:public/pdf 目录下的真实规范文档(全部归入「规范」知识库) */
export const INITIAL_FILES: KnowledgeFile[] = [
  { id: "kf-pdf-1", name: "!! GB 55037-2022 建筑防火通用规范-带条文说明", kind: "pdf", folder: "standard", sizeKB: 3930.2, modifiedLabel: "2026/7/27", modifiedTs: 1785157452500, fileName: "pdf/!! GB 55037-2022 建筑防火通用规范-带条文说明.pdf", content: "!! GB 55037-2022 建筑防火通用规范-带条文说明" },
  { id: "kf-pdf-2", name: "GB51073-2014 医药工业仓储工程设计规范", kind: "pdf", folder: "standard", sizeKB: 3240.7, modifiedLabel: "2026/8/29", modifiedTs: 1787986089838, fileName: "pdf/GB51073-2014 医药工业仓储工程设计规范.pdf", content: "GB51073-2014 医药工业仓储工程设计规范" },
  { id: "kf-pdf-3", name: "GB51107-2015 纤维增强硅酸钙板工厂设计规范", kind: "pdf", folder: "standard", sizeKB: 2913.4, modifiedLabel: "2026/8/29", modifiedTs: 1787986081657, fileName: "pdf/GB51107-2015 纤维增强硅酸钙板工厂设计规范.pdf", content: "GB51107-2015 纤维增强硅酸钙板工厂设计规范" },
  { id: "kf-pdf-4", name: "GB51112-2015 针织工厂设计规范", kind: "pdf", folder: "standard", sizeKB: 2858.9, modifiedLabel: "2026/8/29", modifiedTs: 1787986100652, fileName: "pdf/GB51112-2015 针织工厂设计规范.pdf", content: "GB51112-2015 针织工厂设计规范" },
  { id: "kf-pdf-5", name: "GB51123-2015 光纤器件生产厂工艺设计规范", kind: "pdf", folder: "standard", sizeKB: 3253.5, modifiedLabel: "2026/8/29", modifiedTs: 1787986129193, fileName: "pdf/GB51123-2015 光纤器件生产厂工艺设计规范.pdf", content: "GB51123-2015 光纤器件生产厂工艺设计规范" },
  { id: "kf-pdf-6", name: "GB51133-2015 医药工业环境保护设计规范", kind: "pdf", folder: "standard", sizeKB: 7468.3, modifiedLabel: "2026/8/29", modifiedTs: 1787986096715, fileName: "pdf/GB51133-2015 医药工业环境保护设计规范.pdf", content: "GB51133-2015 医药工业环境保护设计规范" },
  { id: "kf-pdf-7", name: "GB51143-2015 防灾避难场所设计规范", kind: "pdf", folder: "standard", sizeKB: 8304.4, modifiedLabel: "2026/8/29", modifiedTs: 1787986154881, fileName: "pdf/GB51143-2015 防灾避难场所设计规范.pdf", content: "GB51143-2015 防灾避难场所设计规范" },
  { id: "kf-pdf-8", name: "GB51157-2016 物流建筑设计规范", kind: "pdf", folder: "standard", sizeKB: 7817.1, modifiedLabel: "2026/8/29", modifiedTs: 1787986096088, fileName: "pdf/GB51157-2016 物流建筑设计规范.pdf", content: "GB51157-2016 物流建筑设计规范" },
  { id: "kf-pdf-9", name: "GB51179-2016 煤矿井下煤炭运输设计规范", kind: "pdf", folder: "standard", sizeKB: 3652.6, modifiedLabel: "2026/8/29", modifiedTs: 1787986109664, fileName: "pdf/GB51179-2016 煤矿井下煤炭运输设计规范.pdf", content: "GB51179-2016 煤矿井下煤炭运输设计规范" },
  { id: "kf-pdf-10", name: "GB51192-2016 公园设计规范", kind: "pdf", folder: "standard", sizeKB: 4502.3, modifiedLabel: "2026/8/29", modifiedTs: 1787986108760, fileName: "pdf/GB51192-2016 公园设计规范.pdf", content: "GB51192-2016 公园设计规范" },
  { id: "kf-pdf-11", name: "GB51202-2016 冰雪景观建筑技术标准", kind: "pdf", folder: "standard", sizeKB: 8878.4, modifiedLabel: "2026/8/29", modifiedTs: 1787986180053, fileName: "pdf/GB51202-2016 冰雪景观建筑技术标准.pdf", content: "GB51202-2016 冰雪景观建筑技术标准" },
  { id: "kf-pdf-12", name: "GB51213-2017 煤炭矿井通信设计规范", kind: "pdf", folder: "standard", sizeKB: 1474.1, modifiedLabel: "2026/8/29", modifiedTs: 1787986111356, fileName: "pdf/GB51213-2017 煤炭矿井通信设计规范.pdf", content: "GB51213-2017 煤炭矿井通信设计规范" },
  { id: "kf-pdf-13", name: "GBJ134-90人防工程施工及验收规范", kind: "pdf", folder: "standard", sizeKB: 587.1, modifiedLabel: "2026/8/29", modifiedTs: 1787986133460, fileName: "pdf/GBJ134-90人防工程施工及验收规范.pdf", content: "GBJ134-90人防工程施工及验收规范" },
  { id: "kf-pdf-14", name: "GBT18922-2008 建筑颜色的表示方法", kind: "pdf", folder: "standard", sizeKB: 3890.9, modifiedLabel: "2026/8/29", modifiedTs: 1787986137695, fileName: "pdf/GBT18922-2008 建筑颜色的表示方法.pdf", content: "GBT18922-2008 建筑颜色的表示方法" },
  { id: "kf-pdf-15", name: "GBT36876-2018 中小学校普通教室照明设计安装卫生要求", kind: "pdf", folder: "standard", sizeKB: 563, modifiedLabel: "2026/8/29", modifiedTs: 1787986138468, fileName: "pdf/GBT36876-2018 中小学校普通教室照明设计安装卫生要求.pdf", content: "GBT36876-2018 中小学校普通教室照明设计安装卫生要求" },
  { id: "kf-pdf-16", name: "GBT50006-2010 厂房建筑模数协调标准", kind: "pdf", folder: "standard", sizeKB: 1108.5, modifiedLabel: "2026/8/29", modifiedTs: 1787986138213, fileName: "pdf/GBT50006-2010 厂房建筑模数协调标准.pdf", content: "GBT50006-2010 厂房建筑模数协调标准" },
  { id: "kf-pdf-17", name: "GBT50087-2013 工业企业噪声控制设计规范", kind: "pdf", folder: "standard", sizeKB: 1516.9, modifiedLabel: "2026/8/29", modifiedTs: 1787986139261, fileName: "pdf/GBT50087-2013 工业企业噪声控制设计规范.pdf", content: "GBT50087-2013 工业企业噪声控制设计规范" },
  { id: "kf-pdf-18", name: "GBT50186-2013 港口工程基本术语标准", kind: "pdf", folder: "standard", sizeKB: 7239.6, modifiedLabel: "2026/8/29", modifiedTs: 1787986142490, fileName: "pdf/GBT50186-2013 港口工程基本术语标准.pdf", content: "GBT50186-2013 港口工程基本术语标准" },
  { id: "kf-pdf-19", name: "GBT50357-2018 历史文化名城保护规划标准", kind: "pdf", folder: "standard", sizeKB: 4079.8, modifiedLabel: "2026/8/29", modifiedTs: 1787986144955, fileName: "pdf/GBT50357-2018 历史文化名城保护规划标准.pdf", content: "GBT50357-2018 历史文化名城保护规划标准" },
  { id: "kf-pdf-20", name: "GBT50362-2005 住宅性能评定技术标准", kind: "pdf", folder: "standard", sizeKB: 2857.9, modifiedLabel: "2026/8/29", modifiedTs: 1787986144730, fileName: "pdf/GBT50362-2005 住宅性能评定技术标准.pdf", content: "GBT50362-2005 住宅性能评定技术标准" },
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

/**
 * 生成一个仅含 ASCII 占位文字的最小合法 PDF(字节偏移按 1 字节/字符计算,全 ASCII 安全)。
 * 用于虚拟(在线新建/模拟入库)PDF 文档的下载,保证下载得到可正常打开的 .pdf 文件。
 */
export function buildVirtualPdfBlob(): Blob {
  const stream = "BT /F1 18 Tf 72 770 Td (KnowFlow Virtual PDF Document) Tj ET";
  const objects = [
    "<</Type/Catalog/Pages 2 0 R>>",
    "<</Type/Pages/Kids[3 0 R]/Count 1>>",
    "<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>",
    `<</Length ${stream.length}>>\nstream\n${stream}\nendstream`,
    "<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    pdf += `${off.toString().padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

/** 虚拟文档下载:PDF 生成合法占位 PDF,其余类型回退纯文本(当前数据均为 PDF) */
export function downloadVirtualFile(file: KnowledgeFile): void {
  const isPdf = file.kind === "pdf";
  const blob = isPdf
    ? buildVirtualPdfBlob()
    : new Blob([file.content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${file.name}.${isPdf ? "pdf" : "txt"}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** 真实 PDF 在站点中的访问地址(按路径段编码,自动补 GitHub Pages basePath) */
export function realFileUrl(fileName: string): string {
  const encoded = fileName
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return applyBasePath(`/${encoded}`);
}

/** 客户端事件中使用的日期格式化(仅挂载后的交互调用,无水合风险) */
export function todayLabel(): string {
  const d = new Date();
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
