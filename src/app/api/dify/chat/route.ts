import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";

const DIFY_API_BASE_URL = process.env.DIFY_API_BASE_URL || "http://127.0.0.1/v1";

const API_KEYS: Record<string, string | undefined> = {
  upload: process.env.DIFY_UPLOAD_API_KEY,
  standard: process.env.DIFY_STANDARD_API_KEY,
  atlas: process.env.DIFY_ATLAS_API_KEY,
};

export async function POST(request: NextRequest) {
  try {
    const { query, conversation_id, user, file_id, mode = "standard" } =
      await request.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ error: "请输入问题" }, { status: 400 });
    }

    const apiKey = API_KEYS[mode] || API_KEYS.standard;

    const files = file_id
      ? [{ type: "document", transfer_method: "local_file", upload_file_id: file_id }]
      : [];

    const response = await fetch(`${DIFY_API_BASE_URL}/chat-messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {},
        query,
        response_mode: "streaming",
        conversation_id: conversation_id || "",
        user: user || "asa-user",
        files,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Dify chat API error:", response.status, errorText);
      let errorMessage = `Dify API 调用失败: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // use default message
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith("data: ")) {
                const data = trimmed.slice(6);
                if (data === "[DONE]") {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  continue;
                }
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.event === "message" || parsed.event === "agent_message") {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          type: "answer",
                          content: parsed.answer || "",
                          conversation_id: parsed.conversation_id || "",
                        })}\n\n`
                      )
                    );
                  } else if (parsed.event === "message_end") {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          type: "done",
                          conversation_id: parsed.conversation_id || "",
                        })}\n\n`
                      )
                    );
                  } else if (parsed.event === "error") {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          type: "error",
                          content: parsed.message || "未知错误",
                        })}\n\n`
                      )
                    );
                  }
                } catch {
                  // skip unparseable lines
                }
              }
            }
          }
        } catch (err) {
          console.error("Stream read error:", err);
        } finally {
          controller.close();
        }
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
    console.error("Dify chat route error:", error);
    return NextResponse.json(
      { error: "聊天服务暂时不可用" },
      { status: 500 }
    );
  }
}
