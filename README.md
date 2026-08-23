# KnowFlow — 图文规范 RAG 智能检索助手

> Architecture RAG-Based Intelligent Text-Image Specification Retrieval Agent

基于 **Next.js 16 App Router + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui (Radix UI)** 构建的建筑图文规范智能检索工作台。内置规范检索 / 图集检索 / 上传知识库三条独立流程,支持流式 Markdown 输出、半尺寸图集展示、以及前端纯交互级别的入库/删除(不依赖后端 API,便于静态托管演示)。

## 功能总览

| 模块 | 入口(底部三按钮) | 典型场景 |
|---|---|---|
| 上传知识库 | 「上传知识库」 | PDF + "规范入库" / "图集入库" 分类指令 → 预置条目追加到「已入库知识库」(纯前端 UI) |
| 规范检索 | 「规范检索」 | 输入"建筑平面防火要求" → 思考 2s → 流式输出 `public/mock-规范检索.doc` 条文化内容(Markdown H1~H3 / 加粗 / 列表) |
| 图集检索 | 「图集检索」 | 输入"屋面檐沟详图" → 思考 2s → 段落流式输出两组「图纸 + 半尺寸图片 + 解读 + 列表项」,图片来源 `public/mock-atlas/image1.jpeg`、`image2.jpeg` |

- 预置已入库 2 条:`GB 55037-2022 建筑防火通用规范-带条文说明`(规范)、`00SJ202建筑坡屋面构造`(图集);按钮角标会自动统计。
- 删除按钮仅为前端交互(确认弹窗 → 从 `useState` 过滤,不调用任何后端 API,刷新页面后恢复初始态)。
- 删除按钮采用异步 `window.confirm` + `stopPropagation` 模式,规避 React 19 同步阻塞下的 Hydration Error #185。

## 演示环境

本项目已通过 **GitHub Pages (Next.js 静态导出 `output: 'export'`)** 公开部署,默认 basePath 为 `/KnowFlow`:

```
https://<your-github-handle>.github.io/KnowFlow/
```

- 工作台直达:`https://<your-github-handle>.github.io/KnowFlow/search/?category=upload`
- 规范检索直达:`.../KnowFlow/search/?category=standard`
- 图集检索直达:`.../KnowFlow/search/?category=atlas`

> 静态导出模式下,Dify 代理 rewrites 会自动禁用(因为 Pages 不支持服务端代理);所有演示流程走纯前端 mock 分支。

## 本地开发

### 环境要求
- Node.js ≥ 18 (推荐 Node 24 LTS)
- **仅使用 pnpm** 作为包管理器(禁止 npm / yarn)
- Windows 11 / macOS 14+ / Ubuntu 22.04+

### 常用命令

```bash
# 1. 安装依赖
pnpm install

# 2. 本地开发(热更新,默认 http://localhost:5000,见 scripts/dev.sh)
pnpm dev

# 3. 以 GitHub Pages 静态导出形态本地生产构建(输出到 out/)
#    需显式告知 basePath 与构建形态,与 Actions 保持一致
NEXT_PUBLIC_BASE_PATH="/KnowFlow" \
NEXT_PUBLIC_REPO_NAME="KnowFlow" \
NEXT_PUBLIC_STATIC_EXPORT="true" \
pnpm build

# 4. 本地预览生产包(out/ 静态产物)
python3 -m http.server 8080 --directory out
# 访问 http://localhost:8080/KnowFlow/
```

## 分支策略(单 main 最简)

- **main = 生产分支**:任何 push 到 `main` 都会通过 GitHub Actions 自动构建静态产物并发布到 GitHub Pages。
- 日常开发建议:`git checkout -b feature/<描述> → commit → PR → review → merge main`。
- 不强制要求 PR,但禁止 force-push main。

## CI/CD:GitHub Actions 自动部署 Pages

工作流文件:`.github/workflows/deploy.yml`

触发条件:`push` 到 `main`,或手动 `workflow_dispatch`。

流水线步骤:
1. `actions/checkout@v4` + 安装 Node.js 24
2. `pnpm install --frozen-lockfile`(严格按 `pnpm-lock.yaml` 安装)
3. 注入 Pages 所需环境变量:
   - `NEXT_PUBLIC_BASE_PATH = /${{ github.event.repository.name }}`
   - `NEXT_PUBLIC_REPO_NAME = ${{ github.event.repository.name }}`
   - `NEXT_PUBLIC_STATIC_EXPORT = true`
4. `pnpm build` → Next.js `output: 'export'` 生成 `out/`
5. `actions/configure-pages@v5` + `actions/upload-pages-artifact@v3` 上传 `out/`
6. `actions/deploy-pages@v4` 发布 Pages

仓库内一次性设置:仓库 `Settings → Pages → Source` 选择 **GitHub Actions**(见下一节「首次上线清单」)。

## 首次上线清单

1. 新建 GitHub 仓库 `KnowFlow`(public),初始化 README / 选 .gitignore 都**不要**勾,保持空仓库。
2. 推送本项目到 main:

```bash
cd project2
git init -b main
git add .
git commit -m "chore: init KnowFlow project"
git remote add origin https://github.com/<your-handle>/KnowFlow.git
git push -u origin main
```

3. 打开仓库 **Settings → Pages → Build and deployment → Source**,选择 **GitHub Actions**(保存即可,无需选 Branch)。
4. 回到 Actions 页面,会看到 `Deploy to GitHub Pages` 工作流自动运行。
5. 约 2~4 分钟完成后,相同页面会显示 `Your site is live at https://<your-handle>.github.io/KnowFlow/`。

## 安全与合规

- `.env*`、`.env.local` 与 `.env.*.local` 已在 `.gitignore` 中忽略,**严禁把任何 DIFY_API_KEY / 数据库密码 / access token 硬编码进源码或 public/** 。真实接入 Dify 时请通过平台 Secrets 注入环境变量。
- `.gitignore` 默认忽略 `*.pdf`,但特意白名单保留了 `public/*.pdf` 与 `public/**/*.pdf`(演示入库所需的预置 PDF 参考文件);如改做企业部署,请评估这些 PDF 文件的分发合规性。
- 静态导出站点完全公开可访问,请不要将仅内部可用的图文规范 PDF 放入 `public/`。

## 项目结构

```
├── public/                  静态资源(pdf、mock doc、mock-atlas/ 图集图片)
├── scripts/                 build/dev/prepare/start shell 脚本
├── src/
│   ├── app/
│   │   ├── page.tsx         首页(三大功能卡片入口)
│   │   ├── layout.tsx       全局布局(Header + Toaster + VIP/UserMenu Dialog Provider)
│   │   └── search/page.tsx  工作台:上传知识库 / 规范检索 / 图集检索
│   ├── components/ui/       shadcn/ui (Radix)
│   ├── components/{header,user-menu,vip-modal}.tsx
│   ├── hooks/
│   └── lib/utils.ts         cn() 等通用工具
├── next.config.ts           output:export + basePath + images.unoptimized
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── .github/workflows/deploy.yml   GitHub Pages CI/CD
```

## 后续接入真实后端/Dify

把 `src/app/search/page.tsx` 中所有"mock 分支"(含"建筑平面防火要求"/"屋面檐沟详图"/"规范入库"/"图集入库"的 `if` 守卫)移除或替换为真实的:
- 上传:`fetch('/api/dify/upload', ...)`
- 检索:`fetch('/api/dify/chat', { method: 'POST', ... })` 的 ReadableStream 解析(已有 streaming 循环的骨架,只需把 mock 的 setTimeout 替换成真 SSE/NDJSON 解析)

并在 `Settings → Secrets and variables → Actions → Secrets` 中添加:
- `DIFY_API_BASE_URL`
- `DIFY_API_KEY`

然后将部署切换到 Vercel/Netlify 这类支持 SSR / Edge Runtime 的平台,或把 Dify 代理 rewrites 改为在前端直连 Dify 公开域名(注意 CORS)。
