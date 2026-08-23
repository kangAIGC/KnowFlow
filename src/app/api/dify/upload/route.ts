import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";

const DIFY_API_BASE_URL = process.env.DIFY_API_BASE_URL || "http://127.0.0.1/v1";
const DIFY_API_KEY = process.env.DIFY_UPLOAD_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const user = (formData.get("user") as string) || "asa-user";
    const importCommand = (formData.get("import_command") as string) || "规范入库";

    if (!file) {
      return NextResponse.json({ error: "未找到文件" }, { status: 400 });
    }

    // Step 1: Upload file to Dify
    const difyFormData = new FormData();
    difyFormData.append("file", file);
    difyFormData.append("user", user);

    const uploadRes = await fetch(`${DIFY_API_BASE_URL}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
      },
      body: difyFormData,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error("Dify file upload error:", uploadRes.status, errorText);
      return NextResponse.json(
        { error: `文件上传至 Dify 失败: ${uploadRes.status}` },
        { status: uploadRes.status }
      );
    }

    const uploadData = await uploadRes.json();

    // Step 2: Send chat message with file to trigger knowledge import
    const chatRes = await fetch(`${DIFY_API_BASE_URL}/chat-messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {},
        query: importCommand,
        response_mode: "blocking",
        user,
        files: [
          {
            type: "document",
            transfer_method: "local_file",
            upload_file_id: uploadData.id,
          },
        ],
      }),
    });

    if (!chatRes.ok) {
      const errorText = await chatRes.text();
      console.error("Dify chat with file error:", chatRes.status, errorText);
      return NextResponse.json({
        success: true,
        file_id: uploadData.id,
        file_name: file.name,
        import_command: importCommand,
        message: "文件已上传，但知识入库流程可能未完成",
        warning: true,
      });
    }

    const chatData = await chatRes.json();

    return NextResponse.json({
      success: true,
      file_id: uploadData.id,
      file_name: file.name,
      import_command: importCommand,
      conversation_id: chatData.conversation_id || "",
      answer: chatData.answer || "",
      message: `文件已成功上传并${importCommand}`,
    });
  } catch (error) {
    console.error("Dify upload route error:", error);
    return NextResponse.json(
      { error: "文件上传服务暂时不可用" },
      { status: 500 }
    );
  }
}
