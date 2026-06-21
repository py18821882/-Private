# 个人智能体工作台

自用型效率工具 MVP，不是 SaaS。第一版目标是：

- 能录客户
- 能管理跟进
- 能配置 OpenAI-compatible 模型
- 能生成并购分析、话术、一页纸报告、国学文案、短视频脚本
- 能保存生成记录并复制结果

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- Supabase PostgreSQL
- OpenAI-compatible API

## 本地开发

1. 安装依赖

```bash
npm install
```

2. 创建环境变量

```powershell
Copy-Item .env.example .env
```

3. 在 `.env` 中填入 Supabase 连接串

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:YOUR_DB_PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:YOUR_DB_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"
```

4. 初始化数据库表

```bash
npm run db:push
```

5. 启动开发服务

```bash
npm run dev
```

打开：

```txt
http://localhost:3000/dashboard
```

## EdgeOne Pages + Supabase 部署

EdgeOne Pages 当前支持 Next.js App Router、SSR 和 Route Handlers。本项目的页面和 API Routes 可以直接部署。

### 你需要准备

- Supabase 项目
- Supabase 数据库密码
- Supabase `DATABASE_URL`
- Supabase `DIRECT_URL`
- EdgeOne Pages 账号
- 一个 GitHub / GitLab 仓库用于导入部署
- 一个公网访问密码 `APP_PASSWORD`
- 可选：OpenAI-compatible 模型配置

### Supabase 连接串

在 Supabase 后台进入：

```txt
Project Settings -> Database -> Connection string
```

建议：

- `DATABASE_URL` 使用 Transaction Pooler，适合线上 serverless / edge 平台连接。
- `DIRECT_URL` 使用 Direct connection，适合 Prisma 初始化表结构。

### 初始化 Supabase 表结构

在本地 `.env` 填好 Supabase 连接串后执行：

```bash
npm run db:push
```

这一步会把 Prisma schema 推到 Supabase PostgreSQL。

### EdgeOne Pages 构建配置

导入 Git 仓库后，构建配置建议：

```txt
Framework: Next.js
Install command: npm install
Build command: npm run build
Output directory: .next
```

### EdgeOne 环境变量

在 EdgeOne Pages 项目里配置：

```env
DATABASE_URL=你的 Supabase Transaction Pooler URL
DIRECT_URL=你的 Supabase Direct connection URL
APP_PASSWORD=你自己的访问密码
OPENAI_API_KEY=可选，也可以上线后在 /settings 填
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

如果用 DeepSeek：

```env
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_MODEL=deepseek-chat
```

如果用 Kimi：

```env
OPENAI_BASE_URL=https://api.moonshot.ai/v1
OPENAI_MODEL=moonshot-v1-8k
```

## 上线后的使用

1. 打开 EdgeOne 分配的访问地址。
2. 输入 `APP_PASSWORD`。
3. 进入 `/settings` 配置模型。
4. 进入 `/clients/new` 录入客户。
5. 在客户详情页或 `/agents` 生成话术、报告和分析。

## 业务边界

本项目没有支付、多租户、团队权限和插件市场。公网部署只增加了单密码保护，用于保护个人客户资料和模型配置。
