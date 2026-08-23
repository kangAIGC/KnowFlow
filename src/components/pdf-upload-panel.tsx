'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, Loader2 } from 'lucide-react';

interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export default function PdfUploadPanel() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const pdfFiles = Array.from(fileList).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    const newFiles: UploadFile[] = pdfFiles.map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      status: 'pending',
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // 逐个上传
    newFiles.forEach((file) => uploadFile(file, fileList));
  }, []);

  const uploadFile = async (file: UploadFile, fileList: FileList) => {
    const actualFile = Array.from(fileList).find((f) => f.name === file.name);
    if (!actualFile) return;

    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, status: 'uploading' as const } : f))
    );

    try {
      const formData = new FormData();
      formData.append('file', actualFile);

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('上传失败');

      // 模拟上传进度
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((r) => setTimeout(r, 100));
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, progress: i } : f))
        );
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, status: 'processing' as const, progress: 100 } : f
        )
      );

      // 模拟后台处理
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: 'completed' as const } : f
          )
        );
      }, 3000);
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? { ...f, status: 'error' as const, error: err instanceof Error ? err.message : '上传失败' }
            : f
        )
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return <FileText className="w-4 h-4 text-muted-foreground" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusText = (file: UploadFile) => {
    switch (file.status) {
      case 'pending':
        return '等待上传';
      case 'uploading':
        return `上传中 ${file.progress}%`;
      case 'processing':
        return '解析中...';
      case 'completed':
        return '已完成';
      case 'error':
        return file.error || '失败';
    }
  };

  return (
    <div className="space-y-4">
      {/* 拖拽上传区域 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${isDragging ? 'bg-primary/10' : 'bg-muted'}
          `}>
            <Upload className={`w-6 h-6 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {isDragging ? '松开鼠标上传' : '拖拽 PDF 文件到此处，或点击选择文件'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              支持批量上传，单个文件不超过 50MB
            </p>
          </div>
        </div>
      </div>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">上传队列</h4>
            <span className="text-xs text-muted-foreground">
              {files.filter((f) => f.status === 'completed').length}/{files.length} 已完成
            </span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border"
              >
                {getStatusIcon(file.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · {getStatusText(file)}
                  </p>
                </div>
                {file.status === 'error' && (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
