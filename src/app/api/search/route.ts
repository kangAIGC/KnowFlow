import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";

// Dify configuration from environment variables
const DIFY_API_BASE_URL = process.env.DIFY_API_BASE_URL || "http://127.0.0.1/v1";
const DIFY_API_KEY = process.env.DIFY_API_KEY;

// Simulated knowledge base for construction engineering documents
const knowledgeBase = [
  {
    code: "GB 50340-2016",
    title: "老年人居住建筑设计规范",
    category: "standard",
    content:
      "老年人居住建筑的套内楼梯净宽不应小于 0.90m；当楼梯一侧有扶手时，梯段净宽应为扶手中心线至另一侧墙面的距离。楼梯踏步宽度不应小于 0.28m，踏步高度不应大于 0.16m。",
    page: "第 3.2.5 条",
  },
  {
    code: "GB 50096-2011",
    title: "住宅设计规范",
    category: "standard",
    content:
      "住宅套内楼梯的梯段净宽，当一边临空时，不应小于 0.75m；当两侧有墙时，不应小于 0.90m。楼梯踏步宽度不应小于 0.26m，踏步高度不应大于 0.175m。",
    page: "第 6.3.1 条",
  },
  {
    code: "GB 50016-2014",
    title: "建筑设计防火规范（2018 年版）",
    category: "standard",
    content:
      "疏散楼梯的最小净宽度：高层医疗建筑 1.30m，其他高层公共建筑 1.20m，住宅建筑 1.10m，人员密集的公共建筑 1.40m。",
    page: "第 5.5.18 条",
  },
  {
    code: "GB 50176-2016",
    title: "民用建筑热工设计规范",
    category: "standard",
    content:
      "建筑热工设计应与地区气候相适应，保证室内基本热环境要求。严寒和寒冷地区应满足冬季保温要求，夏热冬冷和夏热冬暖地区应满足夏季防热要求。",
    page: "第 3.1.1 条",
  },
  {
    code: "JGJ 48-2014",
    title: "商店建筑设计规范",
    category: "standard",
    content:
      "商店建筑的疏散楼梯净宽度不应小于 1.20m。营业厅内通道最小净宽度：主通道 2.40m，次通道 1.50m。",
    page: "第 5.2.3 条",
  },
  {
    code: "JGJ 100-2015",
    title: "车库建筑设计规范",
    category: "standard",
    content:
      "机动车库坡道式直线坡道的坡度不应大于 15%，曲线坡道不应大于 12%。机动车库室内最小净高：微型车、小型车 2.20m，轻型车 2.95m。",
    page: "第 4.2.6 条",
  },
  {
    code: "JGJ 58-2008",
    title: "电影院建筑设计规范",
    category: "standard",
    content:
      "观众厅内走道宽度不应小于 1.00m，边走道不应小于 0.80m。疏散楼梯净宽度不应小于 1.20m。",
    page: "第 6.2.4 条",
  },
  {
    code: "JGJ 218-2010",
    title: "展览建筑设计规范",
    category: "standard",
    content:
      "展览厅内主通道净宽度不应小于 3.00m，次通道不应小于 2.00m。疏散楼梯最小净宽度不应小于 1.40m。",
    page: "第 5.3.2 条",
  },
  {
    code: "GB 51192-2016",
    title: "公园设计规范",
    category: "standard",
    content:
      "公园内园路宽度应根据通行需求确定，主园路不应小于 3.00m，次园路不应小于 2.00m，游步道不应小于 1.20m。",
    page: "第 5.1.3 条",
  },
  {
    code: "22G101-1",
    title: "混凝土结构施工图平面整体表示方法制图规则和构造详图",
    category: "atlas",
    content:
      "现浇混凝土框架、剪力墙、梁、板的平面整体表示方法制图规则。包括柱平法施工图、剪力墙平法施工图、梁平法施工图的表示方法。",
    page: "第 2-38 页",
  },
  {
    code: "23G101-2",
    title: "混凝土结构施工图平面整体表示方法制图规则和构造详图（楼梯）",
    category: "atlas",
    content:
      "现浇混凝土板式楼梯的平面整体表示方法。包括 AT~KT 型楼梯的平法施工图表示方法及构造详图。",
    page: "第 1-15 页",
  },
  {
    code: "20G101-5",
    title: "混凝土结构施工图平面整体表示方法制图规则和构造详图（地下室和地下结构）",
    category: "atlas",
    content:
      "地下室和地下结构的平面整体表示方法。包括地下室墙体、柱、梁、板的平法表示方法。",
    page: "第 3-22 页",
  },
];

const categoryLabels: Record<string, string> = {
  regulation: "建筑法规",
  standard: "建筑规范",
  atlas: "建筑图集",
};

function searchKnowledgeBase(
  question: string,
  categories: string[]
): typeof knowledgeBase {
  const query = question.toLowerCase();
  const keywords = query.split(/[\s,，、？?]+/).filter((k) => k.length > 1);

  return knowledgeBase
    .filter((doc) => {
      if (categories.length > 0 && !categories.includes(doc.category)) return false;
      return keywords.some(
        (keyword) =>
          doc.title.toLowerCase().includes(keyword) ||
          doc.content.toLowerCase().includes(keyword) ||
          doc.code.toLowerCase().includes(keyword)
      );
    })
    .slice(0, 4);
}

export async function POST(request: NextRequest) {
  try {
    const { question, category, categories } = await request.json();

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: "请输入检索问题" },
        { status: 400 }
      );
    }

    // Support both single category and multiple categories
    const selectedCategories = categories || (category ? [category] : ["standard"]);

    // Search knowledge base for results display
    const results = searchKnowledgeBase(question, selectedCategories);

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const sendSSE = (data: Record<string, unknown>) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        };

        // Send search results first
        if (results.length > 0) {
          sendSSE({
            type: "results",
            data: results.map((r, i) => ({
              id: `result-${i}`,
              code: r.code,
              title: r.title,
              page: r.page,
              imageUrl: "",
            })),
          });

          // Send sources
          sendSSE({
            type: "sources",
            data: results.slice(0, 2).map((r) => ({
              code: r.code,
              title: r.title,
              content: r.content,
              attachment: r.page,
            })),
          });

          // Send documents
          sendSSE({
            type: "documents",
            data: results.slice(0, 2).map((r) => ({
              id: `doc-${r.code}`,
              title: r.title,
              code: r.code,
              description: r.content.slice(0, 60) + "...",
              status: "valid" as const,
            })),
          });
        }

        // Call Dify API for streaming response
        if (DIFY_API_KEY) {
          try {
            console.log("Calling Dify API:", DIFY_API_BASE_URL);
            const response = await fetch(`${DIFY_API_BASE_URL}/chat-messages`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${DIFY_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                inputs: {},
                query: question,
                response_mode: "streaming",
                user: "archsa-user",
              }),
            });

            console.log("Dify response status:", response.status);

            if (response.ok && response.body) {
              const reader = response.body.getReader();
              const decoder = new TextDecoder();
              let buffer = "";
              let fullAnswer = "";

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                  const trimmedLine = line.trim();
                  if (trimmedLine.startsWith("data: ")) {
                    const data = trimmedLine.slice(6);
                    if (data === "[DONE]") {
                      sendSSE({ type: "answer", content: "[DONE]" });
                      controller.close();
                      return;
                    }

                    try {
                      const parsed = JSON.parse(data);
                      // Dify streaming response format
                      if (parsed.answer) {
                        fullAnswer += parsed.answer;
                        sendSSE({ type: "answer", content: parsed.answer });
                      } else if (parsed.event === "message" && parsed.answer) {
                        fullAnswer += parsed.answer;
                        sendSSE({ type: "answer", content: parsed.answer });
                      }
                    } catch (e) {
                      console.log("Dify parse error:", e, "data:", data);
                    }
                  }
                }
              }

              // If no streaming data received, send full answer
              if (!fullAnswer) {
                const mockAnswer = generateMockAnswer(question, results);
                for (const char of mockAnswer) {
                  sendSSE({ type: "answer", content: char });
                  await new Promise((resolve) => setTimeout(resolve, 10));
                }
              }
            } else {
              const errorText = await response.text();
              console.error("Dify API error:", response.status, errorText);
              throw new Error(`Dify API returned ${response.status}: ${errorText}`);
            }
          } catch (difyError) {
            console.error("Dify API error:", difyError);
            // Fallback to mock answer
            const mockAnswer = generateMockAnswer(question, results);
            for (const char of mockAnswer) {
              sendSSE({ type: "answer", content: char });
              await new Promise((resolve) => setTimeout(resolve, 10));
            }
          }
        } else {
          // No Dify API key, use mock answer
          const mockAnswer = generateMockAnswer(question, results);
          for (const char of mockAnswer) {
            sendSSE({ type: "answer", content: char });
            await new Promise((resolve) => setTimeout(resolve, 10));
          }
        }

        sendSSE({ type: "answer", content: "[DONE]" });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "检索服务暂时不可用，请稍后重试" },
      { status: 500 }
    );
  }
}

function generateMockAnswer(question: string, results: typeof knowledgeBase): string {
  if (results.length === 0) {
    return `关于"${question}"，目前知识库中暂无直接匹配的规范条文。\n\n建议您：\n1. 尝试使用更具体的关键词检索\n2. 查阅相关专业的国家标准全文\n3. 咨询当地建设主管部门获取最新政策`;
  }

  const mainResult = results[0];
  let answer = `根据检索结果，关于"${question}"的回答如下：\n\n`;
  answer += `**主要依据：${mainResult.code}《${mainResult.title}》**\n\n`;
  answer += `${mainResult.content}\n\n`;

  if (results.length > 1) {
    answer += `**相关规范参考：**\n`;
    for (let i = 1; i < results.length; i++) {
      answer += `- ${results[i].code}《${results[i].title}》：${results[i].content.slice(0, 50)}...\n`;
    }
  }

  answer += `\n以上信息来源于建筑工程知识库，具体以官方发布原文为准。`;
  return answer;
}
