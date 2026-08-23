import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = "force-static";

// 异步任务队列（内存存储，生产环境应使用 Redis 等）
const taskQueue: Array<{
  id: string;
  fileName: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  createdAt: number;
}> = [];

// 后台处理流水线
async function processPdfTask(taskId: string, fileName: string, filePath: string) {
  // 更新任务状态为处理中
  const task = taskQueue.find((t) => t.id === taskId);
  if (task) task.status = 'processing';

  try {
    // 模拟 PDF 解析流程
    // 1. 提取文本内容
    await new Promise((r) => setTimeout(r, 2000));
    
    // 2. 识别图表和插图
    await new Promise((r) => setTimeout(r, 1500));
    
    // 3. 建立索引
    await new Promise((r) => setTimeout(r, 1000));
    
    // 4. 存入知识库
    await new Promise((r) => setTimeout(r, 500));

    if (task) task.status = 'completed';
    console.log(`[PDF Pipeline] ${fileName} 处理完成`);
  } catch (error) {
    if (task) task.status = 'error';
    console.error(`[PDF Pipeline] ${fileName} 处理失败:`, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '未找到文件' }, { status: 400 });
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: '仅支持 PDF 文件' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: '文件大小不能超过 50MB' }, { status: 400 });
    }

    // 保存文件到临时目录
    const uploadDir = path.join(process.cwd(), 'tmp', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // 创建异步任务
    const taskId = crypto.randomUUID();
    taskQueue.push({
      id: taskId,
      fileName: file.name,
      status: 'queued',
      createdAt: Date.now(),
    });

    // 异步处理（不阻塞响应）
    processPdfTask(taskId, file.name, filePath);

    return NextResponse.json({
      success: true,
      taskId,
      message: '文件已上传，正在后台处理',
    });
  } catch (error) {
    console.error('[Upload API] Error:', error);
    return NextResponse.json(
      { error: '上传失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 查询任务状态
export async function GET(request: NextRequest) {
  const taskId = request.nextUrl.searchParams.get('taskId');
  
  if (!taskId) {
    // 返回所有任务
    return NextResponse.json({ tasks: taskQueue });
  }

  const task = taskQueue.find((t) => t.id === taskId);
  if (!task) {
    return NextResponse.json({ error: '任务不存在' }, { status: 404 });
  }

  return NextResponse.json({ task });
}
