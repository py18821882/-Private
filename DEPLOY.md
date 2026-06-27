# 部署文档 - AI 企业增长平台

## 目录

1. [架构概览](#架构概览)
2. [域名规划](#域名规划)
3. [环境变量配置](#环境变量配置)
4. [Vercel 部署（推荐，自动 HTTPS）](#vercel-部署推荐自动-https)
5. [国内服务器部署（Nginx + HTTPS）](#国内服务器部署nginx--https)
6. [微信支付配置](#微信支付配置)
7. [AI 模型配置](#ai-模型配置)
8. [常见问题](#常见问题)

---

## 架构概览

```
用户
  ↓
H5 页面 (Next.js SSR)
  ↓
API Routes (Next.js 服务端)
  ↓
Prisma ORM → SQLite / PostgreSQL
  ↓
AI API (DeepSeek / OpenAI)
  ↓
微信支付
```

- **前端 + 后端一体化**：Next.js App Router，前后端同项目部署
- **数据库**：开发用 SQLite，生产推荐 PostgreSQL
- **AI 服务**：后端统一调用，API Key 不暴露前端
- **支付**：微信支付 JSAPI，支持公众号内支付

---

## 域名规划

| 域名 | 用途 | 说明 |
|------|------|------|
| `https://h5.xxx.com` | H5 测评页 | 用户访问的主要入口 |
| `https://app.xxx.com` | 主应用/工作台 | 顾问后台（可选） |
| `https://api.xxx.com` | API 服务 | 如前后端分离使用 |
| `https://admin.xxx.com` | 管理后台 | 数据管理（可选） |

> 💡 **简化方案**：初期可只用一个域名 `https://h5.xxx.com`，所有功能都在上面。

---

## 环境变量配置

复制 `.env.example` 为 `.env`，然后修改以下配置：

```bash
cp .env.example .env
```

### 必须配置项

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | 数据库连接串 | `file:./prod.db` (SQLite) |
| `NEXT_PUBLIC_H5_DOMAIN` | H5 域名 | `https://h5.yourcompany.com` |
| `OPENAI_API_KEY` | AI API Key | `sk-xxxxxxxxxx` |
| `OPENAI_BASE_URL` | AI API 地址 | `https://api.deepseek.com` |
| `OPENAI_MODEL` | 默认模型 | `deepseek-chat` |
| `WECHAT_APP_ID` | 微信 AppID | `wx1234567890abcdef` |
| `WECHAT_MCH_ID` | 微信支付商户号 | `1600000000` |
| `WECHAT_API_KEY` | 微信支付 API Key | `32位密钥` |
| `REPORT_DEFAULT_PRICE` | 报告价格（分） | `19900` (199元) |

---

## Vercel 部署（推荐，自动 HTTPS）

Vercel 提供开箱即用的 HTTPS，无需自己配置证书。

### 步骤

**1. 准备代码仓库**

```bash
# 初始化 Git 仓库（如还没有）
git init
git add .
git commit -m "Initial commit"
git remote add origin <你的仓库地址>
git push -u origin main
```

**2. 导入 Vercel**

1. 登录 [vercel.com](https://vercel.com)
2. 点击 "Add New" → "Project"
3. 选择你的 Git 仓库
4. 配置项目：
   - **Framework Preset**: `Next.js`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

**3. 配置环境变量**

在 Vercel 项目后台 → Settings → Environment Variables 添加：

```
DATABASE_URL=file:./prod.db
NEXT_PUBLIC_H5_DOMAIN=https://h5.yourcompany.com
NEXT_PUBLIC_API_DOMAIN=https://h5.yourcompany.com
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_API_KEY=sk-xxxxxxxxxx
OPENAI_MODEL=deepseek-chat
WECHAT_APP_ID=wx1234567890abcdef
WECHAT_MCH_ID=1600000000
WECHAT_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REPORT_DEFAULT_PRICE=19900
APP_PASSWORD=你的管理后台密码
```

> ⚠️ SQLite 在 Vercel Serverless 环境下有局限，生产建议改用 **PostgreSQL**（如 Supabase、Neon 等）。

**4. 绑定自定义域名**

1. Vercel 项目 → Settings → Domains
2. 添加 `h5.yourcompany.com`
3. 按照提示配置 DNS 解析
4. Vercel 会自动颁发 HTTPS 证书（Let's Encrypt）

**5. 部署**

每次 push 到 main 分支会自动部署。也可以手动部署：

```bash
npm install -g vercel
vercel --prod
```

---

## 国内服务器部署（Nginx + HTTPS）

### 系统要求

- Ubuntu 20.04+ / CentOS 7+
- Node.js 18+
- 2核4G 最低配置

### 1. 安装 Node.js

```bash
# Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证
node -v
npm -v
```

### 2. 获取代码

```bash
cd /opt
git clone <你的仓库地址> ai-h5
cd ai-h5
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
vi .env
# 修改 DATABASE_URL、域名、AI Key、微信支付等配置
```

### 4. 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

### 5. 构建项目

```bash
npm run build
```

### 6. 使用 PM2 启动

```bash
npm install -g pm2

# 启动
pm2 start npm --name "ai-h5" -- start

# 查看状态
pm2 status

# 设置开机自启
pm2 startup
pm2 save
```

### 7. 安装 Nginx

```bash
# Ubuntu
sudo apt install -y nginx
```

### 8. 申请 SSL 证书（Let's Encrypt）

```bash
# 安装 certbot
sudo apt install -y certbot python3-certbot-nginx

# 申请证书（替换为你的域名）
sudo certbot --nginx -d h5.yourcompany.com
```

> 💡 证书会自动续期，无需手动操作。

### 9. 配置 Nginx

创建配置文件 `/etc/nginx/conf.d/ai-h5.conf`：

```nginx
server {
    listen 80;
    server_name h5.yourcompany.com;
    
    # HTTP 自动跳转 HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name h5.yourcompany.com;

    # SSL 证书路径（certbot 自动生成）
    ssl_certificate /etc/letsencrypt/live/h5.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/h5.yourcompany.com/privkey.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 客户端最大上传大小
    client_max_body_size 10M;

    # 反向代理到 Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态资源缓存
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 7d;
        expires 7d;
    }
}
```

测试配置并重启：

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 10. 配置域名解析

在 DNS 服务商添加 A 记录：

```
h5.yourcompany.com → 你的服务器IP
```

---

## 微信支付配置

### 1. 开通微信支付

1. 注册微信公众号（服务号）
2. 开通微信支付商户号
3. 完成商户认证

### 2. 获取支付参数

| 参数 | 位置 |
|------|------|
| AppID | 公众号后台 → 基本配置 |
| 商户号 | 微信支付商户平台 → 账户中心 |
| API Key | 商户平台 → 账户中心 → API 安全 → 设置 API Key |

### 3. 配置支付回调

在微信支付商户平台配置回调地址：

```
https://h5.yourcompany.com/api/payment/wechat/notify
```

### 4. 设置 JSAPI 支付授权目录

在商户平台 → 产品中心 → 开发配置 → JSAPI 支付：

```
https://h5.yourcompany.com/
```

---

## AI 模型配置

### DeepSeek（推荐，性价比高）

```env
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_API_KEY=sk-xxxxxxxxxx
OPENAI_MODEL=deepseek-chat
```

获取地址：https://platform.deepseek.com/

### OpenAI

```env
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=sk-xxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
```

### 其他兼容 OpenAI 格式的模型

Kimi、通义千问、文心一言等只要提供 OpenAI 兼容接口都可以用。

---

## 常见问题

### Q: SQLite 能支持多少用户？

A: 初期每天几千次访问没问题。如果用户量上来了，建议切换到 PostgreSQL。

### Q: 如何切换到 PostgreSQL？

A: 修改 `prisma/schema.prisma` 中的 provider 和 `DATABASE_URL`，然后执行 `npx prisma db push`。

### Q: 微信支付可以用个人号吗？

A: 不可以，必须是企业主体的公众号和商户号。

### Q: 开发环境如何测试支付？

A: 开发环境内置模拟支付功能，点击支付按钮后会提示"模拟支付成功"，确认后即可解锁报告。生产环境请设置 `ALLOW_MOCK_PAYMENT=false`。

### Q: 报告的 PDF 如何生成？

A: 当前版本使用浏览器打印功能（用户可选择"另存为 PDF"）。后续可接入服务端 PDF 生成（如 Puppeteer）。

### Q: 如何更新代码？

```bash
git pull
npm install
npm run build
pm2 restart ai-h5
```
