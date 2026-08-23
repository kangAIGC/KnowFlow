"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/header";
import { useMounted } from "@/hooks/use-mounted";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  Send,
  FileText,
  X,
  BookOpen,
  Loader2,
  AlertCircle,
  CheckCircle,
  Database,
  ImageIcon,
  Library,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { applyBasePath } from "@/lib/utils";

type Mode = "upload" | "standard" | "atlas";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachedFileName?: string;
  streaming?: boolean;
}

interface KnowledgeBaseItem {
  id: string;
  title: string;
  fileId?: string;
  category: "standard" | "atlas";
  /**
   * public 目录下真实 PDF 文件名(用于在线预览与下载)。
   * 仅对入库到本地 public 目录的初始规范/图集文档设置;
   * 用户通过 Dify 上传入库的条目不带该字段,因此不显示预览/下载按钮。
   */
  fileName?: string;
}

interface UploadStatus {
  status: "idle" | "uploading" | "success" | "error";
  message: string;
}

/**
 * 将 Dify 返回的图片/文件 URL 转换为通过 Next.js 代理的路径
 */
function transformDifyImageUrl(src: string): string {
  if (!src) return src;
  if (src.startsWith("/dify/")) return src;
  if (src.startsWith("https://")) return src;
  if (src.startsWith("data:")) return src;
  if (src.startsWith("http://127.0.0.1") || src.startsWith("http://localhost")) {
    try {
      const url = new URL(src);
      return `/dify${url.pathname}${url.search}${url.hash}`;
    } catch {
      return src;
    }
  }
  if (src.startsWith("/files/") || src.startsWith("/api/files/")) {
    return `/dify${src}`;
  }
  return src;
}

const MODE_LABELS: Record<Mode, string> = {
  upload: "上传知识库",
  standard: "规范检索",
  atlas: "图集检索",
};

// Mock 规范检索回答：当用户在“规范检索”模式输入“建筑平面防火要求”时，
// 不调用 API，思考 2s 后直接流式输出以下内容（来源：public/mock-规范检索.doc）。
const MOCK_STANDARD_ANSWER = `# 建筑平面防火设计要求与规范条文整合解析

## 1. 建筑平面防火通用原则与功能要求

### 1.1 平面布置基本原则

**《建筑防火通用规范》GB 55037-2022 第4.1.1条**确立了建筑平面布置的核心原则。建筑内部应根据便于人员安全疏散与避难、有利于防止火灾和烟气在建筑内部蔓延扩大为原则，合理布置和分隔。由于建筑中不同功能区域内的用途多样，其火灾危险性、使用人数及人员特性各异，平面设计必须充分考虑这些差异进行针对性布局。

### 1.2 建筑防火基本功能要求

依据 **《建筑防火通用规范》GB 55037-2022 第2.1.3条**，建筑平面防火设计必须符合以下四项强制性功能要求：

- **建筑的承重结构应保证其在受到火或高温作用后，在设计耐火时间内仍能正常发挥承载功能。**
- **建筑应设置满足在建筑发生火灾时人员安全疏散或避难需要的设施。**
- **建筑内部和外部的防火分隔应能在设定时间内阻止火灾蔓延至相邻建筑或建筑内的其他防火分隔区域。**
- **建筑的总平面布局及与相邻建筑的间距应满足消防救援的要求。**

## 2. 防火分区划分与特殊场所规定

### 2.1 防火分区划分原则

**《建筑防火通用规范》GB 55037-2022 第4.1.2条**规定了各类工业与民用建筑、平时使用的人民防空工程、地铁车站等建筑划分防火分区的原则。这是控制火灾规模、保障平面防火安全的基础措施。同时该条文明确了例外情况：**交通隧道的车行区、地铁的区间隧道和车站轨行区可以不划分防火分区**。

### 2.2 临时建筑与过渡安置区防火分隔

针对赛事、博览、避险、救灾及灾区生活过渡期间建设的临时建筑或设施，**《建筑防火通用规范》GB 55037-2022 第2.1.4条**提出了明确的平面防火要求。**灾区过渡安置房集中布置区域应按照不同功能区域分别单独划分防火分隔区域。每个防火分隔区域的占地面积不应大于2500m²，且周围应设置可供消防车通行的道路。**

## 3. 工业与高层建筑平面防火专项要求

### 3.1 工业建筑工艺布置与安全出口

工业建筑的平面防火需紧密结合生产工艺。**《建筑防火通用规范》GB 55037-2022 第2.1.5条**规定，**厂房内的生产工艺布置和生产过程控制，工艺装置、设备与仪器仪表、材料等的设计和设置，应根据生产部位的火灾危险性采取相应的防火、防爆措施。**

在安全疏散方面，**《建筑防火通用规范》GB 55037-2022 第7.2.1条**明确了厂房内每个防火分区安全出口的基本数量要求，这是工业建筑平面设计中必须落实的强制性底线指标。

### 3.2 高层建筑避难层设置与电梯防火

对于建筑高度大于100m的高层建筑，**《建筑防火通用规范》GB 55037-2022 第7.1.14条**强制要求设置避难层。**建筑高度大于100m的建筑，使用人员多、竖向疏散距离长，导致人员的疏散时间长，应设置避难层，以便为人员安全疏散和避难提供必要的停留场所。** 第一个避难层的设置高度需适应目前我国主战举高消防车的救援能力。

关于竖向交通的平面防火，规范要求当采用电梯辅助人员疏散时，该电梯的性能和设置均需满足消防电梯要求。**在消防电梯前室内设置非消防电梯时，非消防电梯本身的防火性能也应符合消防电梯的要求，以防止非消防电梯发生火灾影响消防电梯的安全使用。**

## 4. 消防救援场地与关联规范执行

### 4.1 消防车登高救援场地性能

建筑总平面布局中的消防救援场地是平面防火的重要组成部分。**《建筑防火通用规范》GB 55037-2022 第3.4.7条**规定了消防车登高救援场地的基本性能要求。当利用建筑屋顶或高架桥等作为登高操作场地时，**应注意校核其下部承重结构的承载力，并设置保障消防车对建筑实施灭火救援的设施**。其他具体性能要求可结合国家现行相关技术标准确定。

### 4.2 规范体系衔接与执行依据

建筑平面防火设计涉及大量具体限值参数，除上述通用规范的顶层原则外，还需严格执行 **《建筑设计防火规范》GB 50016-2014（2018年版）** 中的详细技术指标。根据 **《建筑防火通用规范》GB 55037-2022** 的废止与替代说明，原GB 50016中关于防火分区面积（如3.3.1、5.3.1）、安全疏散距离（如3.7.6、5.4.9）、平面布置（如5.4.2、5.4.4）等大量条文仍具有效力或已被新规范吸纳转化。

在实际工程设计中，应以GB 55037-2022确立的强制性功能目标和原则为纲，结合GB 50016-2014（2018年版）中未被废止的具体量化指标共同执行，确保平面防火设计既符合通用规范的底线要求，又满足具体场景的技术落地需求。

本内容为建筑规范条文检索整合结果，仅作参考，不替代正式施工图审查与注册建筑师专业判定，工程落地请核对官方原版规范。`;

// Mock 图集检索回答：当用户在“图集检索”模式输入“屋面檐沟详图”时，
// 不调用 API，思考 2s 后直接流式输出以下内容（含图片）。
// 文本来源：public/mock-图集检索.doc；图片：public/mock-atlas/image1.jpeg、image2.jpeg。
const MOCK_ATLAS_ANSWER = `**📐 图纸**

![块瓦屋面檐沟(砂浆卧瓦)](/mock-atlas/image1.jpeg)

**📋 解读**

- **图名：** 块瓦屋面檐沟(砂浆卧瓦)
- **尺寸：** 檐沟纵向坡度≥1%，沟底水落差≤200mm。
- **材料/做法：** 钢筋混凝土檐沟，内做高聚物改性沥青卷材防水（含附加层），1:3水泥砂浆找平，轻集料混凝土找坡；翻起部位卷材附加层空铺200宽。
- **要点：** 檐沟内外沟壁顶宜取平；防水卷材在阴角处R=50圆弧过渡。

---

**📐 图纸**

![块瓦屋面檐沟(木挂瓦条) / 块瓦屋面檐口(钢挂瓦条)](/mock-atlas/image2.jpeg)

**📋 解读**

- **图名：** 块瓦屋面檐沟(木挂瓦条) / 块瓦屋面檐口(钢挂瓦条)
- **尺寸：** 檐沟外壁高50+20+50mm，内壁高50mm，檐口挑出≥60mm。
- **材料/做法：** 采用木挂瓦条或钢挂瓦条固定块瓦，檐沟内砂浆卧牢封严。
- **要点：** 本图示意了挑檐的两种檐头形式，具体施工详见个体工程设计。`;

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeMode, setActiveMode] = useState<Mode>("standard");
  // 根因修复：Trae 预览运行时在服务端向 DOM 注入 `data-trae-ref` 等属性，
  // 客户端水合时不复现，触发 React Hydration Error #185。
  // 服务端/首帧统一返回 null，挂载后再渲染真实 UI，从根因上消除不一致。
  const mounted = useMounted();
  useEffect(() => {
    const fromUrl =
      (searchParams.get("category") as Mode | null) || "standard";
    if (["upload", "standard", "atlas"].includes(fromUrl)) {
      setActiveMode(fromUrl);
    }
  }, [searchParams]);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: "idle",
    message: "",
  });

  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseItem[]>([
    {
      id: "kb-init-1",
      title: "GB 55037-2022 建筑防火通用规范-带条文说明",
      category: "standard",
      fileName: "!! GB 55037-2022 建筑防火通用规范-带条文说明.pdf",
    },
    {
      id: "kb-init-2",
      title: "00SJ202建筑坡屋面构造",
      category: "atlas",
      fileName: "00SJ202建筑坡屋面构造.pdf",
    },
  ]);

  // 当前正在预览的知识库条目;为 null 时预览弹窗关闭。
  const [previewKb, setPreviewKb] = useState<KnowledgeBaseItem | null>(null);

  const [conversationId, setConversationId] = useState<Record<Mode, string>>({
    upload: "",
    standard: "",
    atlas: "",
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(0);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- File handling ---
  const validateFile = (file: File): string | null => {
    if (file.size > 50 * 1024 * 1024) return "文件大小不能超过 50MB";
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))
      return "仅支持 PDF 文件格式";
    return null;
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setUploadStatus({ status: "error", message: error });
        return;
      }
      setAttachedFile(file);
      setUploadStatus({ status: "idle", message: "" });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setUploadStatus({ status: "error", message: error });
        return;
      }
      setAttachedFile(file);
      setUploadStatus({ status: "idle", message: "" });
      // Switch to upload mode automatically
      setActiveMode("upload");
    }
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
    setUploadStatus({ status: "idle", message: "" });
  };

  // --- Mode switching ---
  const handleModeSwitch = (mode: Mode) => {
    setActiveMode(mode);
    setAttachedFile(null);
    setUploadStatus({ status: "idle", message: "" });
  };

  // --- Knowledge import ---
  const handleKnowledgeImport = useCallback(
    async (importCommand: "规范入库" | "图集入库", rawQuestion?: string) => {
      if (!attachedFile) {
        setUploadStatus({
          status: "error",
          message: "请先上传 PDF 文件",
        });
        return;
      }

      // 精确文件名 + 命令文本 匹配：命中则本地模拟入库，不调用 API
      const EXACT_PAIRS: Array<{
        fileName: string;
        command: "规范入库" | "图集入库";
        kb: KnowledgeBaseItem;
      }> = [
        {
          fileName: "!! GB 55037-2022 建筑防火通用规范-带条文说明.pdf",
          command: "规范入库",
          kb: {
            id: "kb-predefined-gb55037",
            title: "GB 55037-2022 建筑防火通用规范-带条文说明",
            category: "standard",
          },
        },
        {
          fileName: "00SJ202建筑坡屋面构造.pdf",
          command: "图集入库",
          kb: {
            id: "kb-predefined-00sj202",
            title: "00SJ202建筑坡屋面构造",
            category: "atlas",
          },
        },
      ];

      const matched = EXACT_PAIRS.find(
        (p) =>
          attachedFile.name === p.fileName && importCommand === p.command
      );

      // 命令文本存在时必须严格等于 importCommand；否则报错
      if (typeof rawQuestion === "string") {
        if (rawQuestion !== importCommand) {
          setUploadStatus({
            status: "error",
            message: `请在输入框中准确输入 "${importCommand}" 来执行该入库操作（当前输入不匹配）。`,
          });
          return;
        }
      }

      if (matched) {
        // 本地模拟入库：展示指定 KB tag（不调用 /api/dify/upload）
        setUploadStatus({
          status: "uploading",
          message: `正在上传文件并${importCommand}...`,
        });
        setIsLoading(true);
        await new Promise((r) => setTimeout(r, 800));

        setKnowledgeBases((prev) => {
          if (prev.some((k) => k.id === matched.kb.id)) return prev;
          return [...prev, { ...matched.kb }];
        });
        setUploadStatus({
          status: "success",
          message: `"${matched.kb.title}" 已成功${importCommand}`,
        });
        msgIdRef.current += 1;
        const systemMsg: Message = {
          id: `msg-${msgIdRef.current}`,
          role: "assistant",
          content: `文件 "${matched.kb.title}" 已成功${importCommand}。您可以在对应的检索模式中输入问题进行查询。`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, systemMsg]);
        setAttachedFile(null);
        setIsLoading(false);
        setTimeout(() => {
          setUploadStatus((prev) =>
            prev.status === "success" || prev.status === "error"
              ? { status: "idle", message: "" }
              : prev
          );
        }, 5000);
        return;
      }

      // 未命中：区分错误原因，给出精准错误提示
      const matchedName = EXACT_PAIRS.find(
        (p) => attachedFile.name === p.fileName
      );
      if (matchedName) {
        setUploadStatus({
          status: "error",
          message: `文件 "${attachedFile.name}" 只能用于 "${matchedName.command}"，当前选择的 "${importCommand}" 不匹配，请切换为 "${matchedName.command}" 后重试。`,
        });
        return;
      }
      const matchedCmd = EXACT_PAIRS.find((p) => importCommand === p.command);
      if (matchedCmd) {
        setUploadStatus({
          status: "error",
          message: `执行 "${importCommand}" 需要选择文件名完全为 "${matchedCmd.fileName}" 的 PDF，当前文件 "${attachedFile.name}" 不匹配。`,
        });
        return;
      }
      setUploadStatus({
        status: "error",
        message: `上传文件或入库指令不在预置列表中（支持 "${EXACT_PAIRS.map(
          (p) => p.fileName + " + " + p.command
        ).join("、")}"）。`,
      });
      return;
    },
    [attachedFile]
  );

  // --- Send message (search) ---
  const handleSend = useCallback(
    async (textOverride?: string) => {
      const question = textOverride || inputValue.trim();
      if (!question || isLoading) return;

      // Upload mode: check for import commands
      if (activeMode === "upload" && attachedFile) {
        if (question === "规范入库") {
          await handleKnowledgeImport("规范入库", question);
          setInputValue("");
          return;
        }
        if (question === "图集入库") {
          await handleKnowledgeImport("图集入库", question);
          setInputValue("");
          return;
        }
        // If in upload mode with file but no import command
        setUploadStatus({
          status: "error",
          message:
            '请在输入框中准确输入 "规范入库" 或 "图集入库" 来分类上传文件（注意：文本必须严格匹配，不含多余字符）。',
        });
        return;
      }

      // Search mode (standard / atlas)
      msgIdRef.current += 1;
      const userMsg: Message = {
        id: `msg-${msgIdRef.current}`,
        role: "user",
        content: question,
        timestamp: new Date(),
        attachedFileName: attachedFile?.name,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setIsLoading(true);

      msgIdRef.current += 1;
      const assistantId = `msg-${msgIdRef.current}-ai`;
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        streaming: true,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Mock 分支：规范检索输入“建筑平面防火要求”、图集检索输入“屋面檐沟详图”时，
      // 不调用 API，先思考 2 秒（loading 动画），再以流式方式输出 mock 内容（图集含图片）。
      const isStandardMock =
        activeMode === "standard" && question.includes("建筑平面防火要求");
      const isAtlasMock =
        activeMode === "atlas" && question.includes("屋面檐沟详图");
      if (isStandardMock || isAtlasMock) {
        const mockContent = isAtlasMock ? MOCK_ATLAS_ANSWER : MOCK_STANDARD_ANSWER;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (isAtlasMock) {
          // 图集按段落流式，保证图片标签整体出现不被截断
          const segments = mockContent.split("\n\n");
          for (let s = 1; s <= segments.length; s++) {
            const partial = segments.slice(0, s).join("\n\n");
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: partial } : m
              )
            );
            await new Promise((r) => setTimeout(r, 200));
          }
        } else {
          // 规范按字符流式
          const chunkSize = 10;
          for (let i = 0; i < mockContent.length; i += chunkSize) {
            const partial = mockContent.slice(0, i + chunkSize);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: partial } : m
              )
            );
            await new Promise((r) => setTimeout(r, 15));
          }
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, streaming: false } : m
          )
        );
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/dify/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: question,
            conversation_id: conversationId[activeMode],
            user: "asa-user",
            mode: activeMode,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `API 调用失败 (${response.status})`
          );
        }

        if (!response.body) throw new Error("响应流为空");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        const answerRef = { current: "" };
        let lastFlush = 0;
        const FLUSH_INTERVAL = 120;
        let difyError: string | null = null;

        const flushAnswer = (force = false, done = false) => {
          const now = Date.now();
          if (!force && now - lastFlush < FLUSH_INTERVAL) return;
          lastFlush = now;
          const currentAnswer = answerRef.current;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: currentAnswer, streaming: !done }
                : m
            )
          );
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                flushAnswer(true, true);
                setIsLoading(false);
                continue;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === "answer") {
                  answerRef.current += parsed.content;
                  flushAnswer();
                  if (parsed.conversation_id) {
                    setConversationId((prev) => ({
                      ...prev,
                      [activeMode]: parsed.conversation_id,
                    }));
                  }
                } else if (parsed.type === "done") {
                  flushAnswer(true, true);
                  setIsLoading(false);
                  if (parsed.conversation_id) {
                    setConversationId((prev) => ({
                      ...prev,
                      [activeMode]: parsed.conversation_id,
                    }));
                  }
                } else if (parsed.type === "error") {
                  difyError = parsed.content || "Dify 返回错误";
                  flushAnswer(true, true);
                  setIsLoading(false);
                }
              } catch {
                // skip parse errors
              }
            }
          }
        }

        if (difyError) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: `❌ ${difyError}` }
                : m
            )
          );
        } else if (!answerRef.current) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content:
                      "抱歉，未能获取到有效回答。请检查 Dify 服务是否正常运行，或稍后重试。",
                  }
                : m
            )
          );
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "检索服务暂时不可用";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: `❌ ${errorMsg}` } : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [inputValue, isLoading, attachedFile, activeMode, conversationId, handleKnowledgeImport]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBack = () => router.push("/");

  const handleModeButtonClick = (mode: Mode) => {
    if (mode !== activeMode) {
      handleModeSwitch(mode);
      return;
    }
    if (activeMode !== "upload" && inputValue.trim()) {
      handleSend();
    } else {
      textareaRef.current?.focus();
    }
  };

  const standardCount = knowledgeBases.filter(
    (kb) => kb.category === "standard"
  ).length;
  const atlasCount = knowledgeBases.filter(
    (kb) => kb.category === "atlas"
  ).length;

  const hasMessages = messages.length > 0;
  const modeLabel = MODE_LABELS[activeMode];

  const getPlaceholder = () => {
    if (activeMode === "upload") {
      if (attachedFile)
        return '输入"规范入库"或"图集入库"来分类上传文件...';
      return "点击上传按钮或拖入 PDF 文件，然后输入分类指令...";
    }
    if (activeMode === "standard") {
      return "规范检索——输入问题开始检索，例如建筑平面防火要求";
    }
    if (activeMode === "atlas") {
      return "图集检索——输入问题开始检索，例如屋面檐沟详图";
    }
    return `${modeLabel} — 输入问题开始检索...`;
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 shrink-0 border-r border-border bg-muted/20 overflow-y-auto">
          <div className="p-4">
            <button
              onClick={handleBack}
              className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              返回首页
            </button>

            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              历史对话
            </h3>
            <div className="space-y-1">
              {messages
                .filter((m) => m.role === "user")
                .slice(-5)
                .reverse()
                .map((msg) => (
                  <button
                    key={msg.id}
                    className="flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-foreground">
                        {msg.content}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {!hasMessages ? (
            <div className="flex flex-1 flex-col items-center px-6 pt-16" suppressHydrationWarning>
              <div className="mx-auto w-full max-w-5xl">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10" suppressHydrationWarning>
                    {activeMode === "atlas" ? (
                      <ImageIcon className="h-5 w-5 text-primary" />
                    ) : activeMode === "upload" ? (
                      <Library className="h-5 w-5 text-primary" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 rounded-2xl border border-border bg-card px-5 py-4" suppressHydrationWarning>
                    <div className="text-sm leading-relaxed text-foreground" suppressHydrationWarning>
                      您好，我是 KnowFlow Agent，您的智能检索助手。当前模式：
                      <span className="font-semibold text-primary" suppressHydrationWarning>
                        {modeLabel}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground" suppressHydrationWarning>
                      {activeMode === "upload" ? (
                        <>
                          <li>
                            • 点击上传按钮或将 PDF 文件拖入输入框区域
                          </li>
                          <li>
                            • 输入&quot;规范入库&quot;或&quot;图集入库&quot;分类入库
                          </li>
                          <li>• 入库后可在对应的检索模式中查询</li>
                        </>
                      ) : (
                        <>
                          <li>• 输入问题，点击&quot;{modeLabel}&quot;按钮检索</li>
                          <li>• 支持流式输出和 Markdown 格式渲染</li>
                          <li>• 图集检索模式支持图片展示</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex-1 overflow-y-auto px-6 py-8"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="mx-auto max-w-5xl space-y-6">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-foreground"
                      }`}
                    >
                      {msg.attachedFileName && (
                        <div className="mb-2 flex items-center gap-1.5 text-xs opacity-80">
                          <FileText className="h-3 w-3" />
                          <span>{msg.attachedFileName}</span>
                        </div>
                      )}
                      <div className="text-sm leading-relaxed">
                        {msg.role === "assistant" ? (
                          msg.streaming ? (
                          <span className="whitespace-pre-wrap break-words">
                            {msg.content}
                            {isLoading && msg.content === "" && (
                              <span className="inline-flex gap-1">
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                              </span>
                            )}
                          </span>
                        ) : (
                          <div className="prose prose-sm max-w-none dark:prose-invert prose-img:rounded-lg prose-img:border prose-img:border-border prose-headings:font-bold prose-headings:leading-tight prose-h1:text-2xl prose-h1:mt-6 prose-h1:mb-3 prose-h2:text-xl prose-h2:mt-5 prose-h2:mb-2 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2 prose-h4:text-base prose-h4:mt-3 prose-h4:mb-1 prose-p:my-3 prose-li:my-1 prose-strong:font-semibold">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw]}
                              components={{
                                h1: ({ children, ...props }) => (
                                  <h1 className="text-xl font-bold mt-6 mb-3 leading-tight tracking-tight" {...props}>
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children, ...props }) => (
                                  <h2 className="text-xl font-bold mt-5 mb-2 leading-tight tracking-tight" {...props}>
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children, ...props }) => (
                                  <h3 className="text-lg font-bold mt-4 mb-2 leading-tight" {...props}>
                                    {children}
                                  </h3>
                                ),
                                h4: ({ children, ...props }) => (
                                  <h4 className="text-base font-bold mt-3 mb-1 leading-tight" {...props}>
                                    {children}
                                  </h4>
                                ),
                                img: ({ src, alt, ...props }) => {
                                  const imgSrc =
                                    typeof src === "string" ? src : "";
                                  // 注意：isMockAtlas 基于原始 src（加 basePath 前）判断，
                                  // 因为 /KnowFlow/mock-atlas/... 仍然会命中 includes，后续同样成立。
                                  const isMockAtlas =
                                    imgSrc.includes("/mock-atlas/");
                                  const transformed = applyBasePath(
                                    transformDifyImageUrl(imgSrc)
                                  );
                                  return (
                                    <span
                                      key={transformed}
                                      className={`my-3 block overflow-hidden rounded-lg border border-border bg-muted/20 ${
                                        isMockAtlas ? "min-h-0" : "min-h-[120px]"
                                      }`}
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={transformed}
                                        alt={alt || ""}
                                        className={`block object-contain ${
                                          isMockAtlas
                                            ? "mx-auto w-1/2"
                                            : "max-w-full"
                                        }`}
                                        loading="eager"
                                        decoding="async"
                                        onLoad={(e) => {
                                          const target = e.currentTarget;
                                          target.parentElement!.style.minHeight =
                                            "";
                                          target.parentElement!.style.background =
                                            "";
                                          target.style.opacity = "1";
                                        }}
                                        style={{ opacity: "0", transition: "opacity 0.2s" }}
                                        onError={(e) => {
                                          const target = e.currentTarget;
                                          if (target.dataset.fallbackApplied)
                                            return;
                                          target.dataset.fallbackApplied = "true";
                                          target.parentElement!.style.minHeight =
                                            "";
                                          target.parentElement!.style.background =
                                            "";
                                          target.style.display = "none";
                                          const placeholder =
                                            document.createElement("div");
                                          placeholder.className =
                                            "flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground";
                                          placeholder.innerHTML = `<span>图片加载失败: ${alt || imgSrc}</span>`;
                                          target.parentElement!.appendChild(
                                            placeholder
                                          );
                                        }}
                                        {...props}
                                      />
                                    </span>
                                  );
                                },
                                a: ({ href, children, ...props }) => {
                                  const transformed =
                                    typeof href === "string"
                                      ? applyBasePath(transformDifyImageUrl(href))
                                      : href;
                                  return (
                                    <a
                                      href={transformed}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      {...props}
                                    >
                                      {children}
                                    </a>
                                  );
                                },
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                          )
                        ) : (
                          <span className="whitespace-pre-wrap">
                            {msg.content}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Upload Status Toast */}
          {uploadStatus.status !== "idle" && (
            <div className="mx-auto max-w-5xl px-6" suppressHydrationWarning>
              <div
                suppressHydrationWarning
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm ${
                  uploadStatus.status === "uploading"
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : uploadStatus.status === "success"
                      ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                      : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                }`}
              >
                {uploadStatus.status === "uploading" && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {uploadStatus.status === "success" && (
                  <CheckCircle className="h-4 w-4" />
                )}
                {uploadStatus.status === "error" && (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span suppressHydrationWarning>{uploadStatus.message}</span>
              </div>
            </div>
          )}

          {/* Bottom Chat Input Area */}
          <div className="mt-auto border-t border-border bg-background px-6 pb-5 pt-3">
            <div className="mx-auto max-w-5xl">
              {/* Attached File Display */}
              {attachedFile && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="truncate text-foreground">
                    {attachedFile.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({(attachedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <button
                    type="button"
                    onClick={removeAttachedFile}
                    className="ml-auto text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Input Box with drag-drop support */}
              <div
                className={`relative rounded-2xl border bg-card shadow-sm transition-all focus-within:shadow-md ${
                  isDragOver
                    ? "border-primary border-2 border-dashed"
                    : "border-border focus-within:border-primary/30"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isDragOver && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-primary/5">
                    <div className="flex flex-col items-center gap-2 text-primary">
                      <Upload className="h-8 w-8" />
                      <span className="text-sm font-medium">
                        释放鼠标上传 PDF 文件
                      </span>
                    </div>
                  </div>
                )}
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={getPlaceholder()}
                  rows={2}
                  suppressHydrationWarning
                  className="min-h-[80px] resize-none border-0 bg-transparent p-4 pr-24 text-base shadow-none focus-visible:ring-0"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5" suppressHydrationWarning>
                  {activeMode === "upload" && (
                    <button
                      type="button"
                      onClick={handleFileClick}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="上传 PDF 文件"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleSend()}
                    disabled={
                      isLoading || (!inputValue.trim() && !attachedFile)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive text-white transition-all hover:bg-destructive/90 disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Three Action Buttons */}
              <div className="mt-3 grid grid-cols-3 gap-2" suppressHydrationWarning>
                {/* Upload Knowledge Base */}
                <button
                  onClick={() => handleModeButtonClick("upload")}
                  disabled={isLoading}
                  suppressHydrationWarning
                  className={`group flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                    activeMode === "upload"
                      ? "border-destructive bg-destructive text-white shadow-sm"
                      : "border-border bg-card text-foreground hover:border-destructive/30 hover:bg-destructive/5"
                  }`}
                >
                  <Library className="h-4 w-4" />
                  上传知识库
                </button>
                {/* Standard Search */}
                <button
                  onClick={() => handleModeButtonClick("standard")}
                  disabled={isLoading}
                  suppressHydrationWarning
                  className={`group flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                    activeMode === "standard"
                      ? "border-destructive bg-destructive text-white shadow-sm"
                      : "border-border bg-card text-foreground hover:border-destructive/30 hover:bg-destructive/5"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    规范检索
                  </span>
                  <span
                    suppressHydrationWarning
                    className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-medium ${
                      activeMode === "standard"
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground group-hover:bg-destructive/10 group-hover:text-destructive"
                    }`}
                  >
                    {standardCount}
                  </span>
                </button>
                {/* Atlas Search */}
                <button
                  onClick={() => handleModeButtonClick("atlas")}
                  disabled={isLoading}
                  suppressHydrationWarning
                  className={`group flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                    activeMode === "atlas"
                      ? "border-destructive bg-destructive text-white shadow-sm"
                      : "border-border bg-card text-foreground hover:border-destructive/30 hover:bg-destructive/5"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    图集检索
                  </span>
                  <span
                    suppressHydrationWarning
                    className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-medium ${
                      activeMode === "atlas"
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground group-hover:bg-destructive/10 group-hover:text-destructive"
                    }`}
                  >
                    {atlasCount}
                  </span>
                </button>
              </div>

              {/* Knowledge Base List */}
              {knowledgeBases.length > 0 && (
                <div className="mt-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Database className="h-3.5 w-3.5" />
                    已入库知识库
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {knowledgeBases.map((kb) => (
                      <div
                        key={kb.id}
                        className={`group flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-all ${
                          kb.category === "atlas"
                            ? "border-orange/30 bg-orange/5 text-foreground"
                            : "border-blue/30 bg-blue/5 text-foreground"
                        }`}
                      >
                        {kb.category === "atlas" ? (
                          <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <FileText className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="truncate max-w-[260px]">{kb.title}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {kb.category === "atlas" ? "图集" : "规范"}
                        </span>
                        {kb.fileName && (
                          <>
                            <button
                              type="button"
                              title={`预览「${kb.title}」`}
                              aria-label={`预览 ${kb.title}`}
                              onClick={() => setPreviewKb(kb)}
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-60 transition-all hover:bg-primary/10 hover:text-primary hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                            <a
                              href={applyBasePath(
                                `/${encodeURIComponent(kb.fileName)}`
                              )}
                              download={kb.fileName}
                              title={`下载「${kb.title}」`}
                              aria-label={`下载 ${kb.title}`}
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-60 transition-all hover:bg-primary/10 hover:text-primary hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1"
                            >
                              <Download className="h-3 w-3" />
                            </a>
                          </>
                        )}
                        <button
                          type="button"
                          title={`从已入库中移除「${kb.title}」`}
                          aria-label={`移除知识库 ${kb.title}`}
                          onClick={() => {
                            const ok = window.confirm(
                              `确定要从已入库知识库中移除「${kb.title}」吗？移除后如需恢复，可重新上传对应 PDF 并执行入库指令。`
                            );
                            if (!ok) return;
                            setKnowledgeBases((prev) =>
                              prev.filter((item) => item.id !== kb.id)
                            );
                            setUploadStatus({
                              status: "success",
                              message: `已移除「${kb.title}」`,
                            });
                          }}
                          className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-60 transition-all hover:bg-destructive/10 hover:text-destructive hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 focus-visible:ring-offset-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* 文档在线预览弹窗:用 iframe 加载 public 目录下的 PDF,浏览器原生渲染 */}
      <Dialog
        open={previewKb !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewKb(null);
        }}
      >
        <DialogContent className="flex h-[88vh] w-[calc(100%-2rem)] max-w-[1100px] flex-col gap-3 p-4 sm:p-5">
          <DialogHeader className="space-y-0.5">
            <DialogTitle className="truncate pr-8 text-base font-semibold">
              {previewKb?.title ?? "文档预览"}
            </DialogTitle>
            <DialogDescription className="truncate pr-8 text-xs">
              {previewKb?.fileName ?? ""}
            </DialogDescription>
          </DialogHeader>
          {previewKb?.fileName && (
            <iframe
              src={applyBasePath(`/${encodeURIComponent(previewKb.fileName)}`)}
              title={previewKb.title}
              className="h-full w-full flex-1 rounded-md border border-border bg-muted/30"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-sm text-muted-foreground">加载中...</div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
