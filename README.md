# 企业资本合作初步评估 H5

这是一个面向客户的 H5 表单项目，用于收集企业并购、融资、股权出售、产业资源协同等合作需求，并生成初步评估结果。

## 技术栈

- Next.js 16
- React 18
- TypeScript
- Tailwind CSS
- Prisma

Node.js 建议使用 `20.9.0` 以上版本，和 Vercel 当前 Next.js 16 构建要求保持一致。

## 页面说明

- `/`：客户可见首页
- `/assessment`：客户提交企业发展需求
- `/assessment/[id]`：评估结果预览与付费解锁
- `/report/[id]`：完整评估报告

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开：

```bash
http://localhost:3000
```

## 构建验证

```bash
npm run lint
npm run build
npm run start
```

## 环境变量

复制 `.env.example` 为 `.env.local`，按需填写：

```bash
cp .env.example .env.local
```

第一阶段部署到 Vercel 时，至少建议配置：

- `DATABASE_URL`
- `OPENAI_BASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `NEXT_PUBLIC_H5_DOMAIN`
- `NEXT_PUBLIC_API_DOMAIN`
- `NEXT_PUBLIC_PRODUCT_NAME`
- `NEXT_PUBLIC_COMPANY_NAME`
- `NEXT_PUBLIC_PAYMENT_QR_URL`
- `APP_PASSWORD`

注意：项目已切换为 PostgreSQL。正式收集客户资料时，请在 Vercel 配置 PostgreSQL 连接串；如果数据库暂未连通，系统会启用人工承接兜底，并把提交内容写入 Vercel 日志/企业微信通知。

本地 Docker 默认连接串：

```bash
DATABASE_URL="postgresql://admin:admin123@localhost:5432/ai_system?schema=public"
```

初始化数据库表：

```bash
npx prisma db push
```

## Vercel 部署步骤

1. 把项目推送到 GitHub。
2. 登录 Vercel，选择 `Add New Project`。
3. 导入当前 GitHub 仓库。
4. Framework Preset 选择 `Next.js`。
5. Build Command 使用默认或填写：`npm run build`。
6. 在 Vercel 项目设置里添加环境变量。
7. 点击 Deploy，等待构建完成。
8. 使用 Vercel 默认域名先测试手机端页面。

## 绑定正式域名

第一阶段可以先使用 Vercel 默认域名测试。准备正式投放后：

1. 购买正式域名。
2. 将域名 DNS 托管到 Cloudflare。
3. 在 Vercel 项目中添加自定义域名。
4. 按 Vercel 提示配置 DNS 记录。
5. 等待 HTTPS 自动签发。

推荐访问路径：

```bash
https://你的域名.com/assessment
```

## 后续扩展路线

第一阶段：Vercel 部署 H5。

第二阶段：绑定正式域名，并通过 Cloudflare 管理 DNS、HTTPS 和基础安全。

第三阶段：接入数据库、企业微信通知、客户后台、文件上传和客户分层管理。

## 上线前检查

```bash
npm install
npm run lint
npm run build
npm run start
```

确保：

- 首页没有内部表达。
- `/assessment` 在手机微信内可正常填写。
- 收款码图片已配置。
- `APP_PASSWORD` 已设置为强密码。
- `.env`、`.env.local` 不要提交到 GitHub。
