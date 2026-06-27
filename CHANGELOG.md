# CHANGELOG

## v1.0.0 - 2026-06-26

### 🎉 首个版本发布

首次实现 **AI 企业增长平台 H5 收钱闭环**，包含完整的用户转化路径：
进入 H5 → 完成测评 → AI 分析 → 微信支付 → 查看报告

---

### ✨ 新增内容

#### 1. H5 测评系统
- 首页：企业 AI 增长测评落地页，包含产品介绍、功能亮点、报告预览
- 测评表单：3 步式填写（企业信息 → 经营数据 → 发展目标），共 8 个字段
- 结果页：分析中状态、报告预览（30% 内容）、支付引导
- 移动端适配：iPhone 刘海屏安全区、触摸优化、渐变视觉设计

#### 2. AI 分析系统
- 后端统一封装 AI 调用（API Key 不暴露前端）
- 支持 OpenAI 兼容接口（DeepSeek / OpenAI / Kimi 等）
- 可配置模型：分析模型、报告模型分开配置
- 自动重试机制（指数退避，最多 3 次）
- 超时保护（60 秒）
- AI 返回 JSON 智能解析

#### 3. 支付系统
- 微信支付 JSAPI 封装（支持公众号内支付）
- 订单系统：创建、查询、状态管理
- 订单状态：待支付 / 已支付 / 已退款 / 已取消
- 支付回调处理（幂等设计）
- 支付流水记录
- 开发环境模拟支付功能

#### 4. 报告系统
- 6 大模块：企业情况、问题分析、企业优势、风险提示、发展建议、AI 总结
- 综合评分（0-100 分）+ 评级（A/B/C/D/E）
- 部分内容锁定（未支付只显示 30%）
- 支付后解锁完整报告
- 支持打印 / 另存为 PDF
- 手风琴式折叠展开交互

#### 5. 数据库设计
- 5 张核心表：Assessment（测评）、Order（订单）、Report（报告）、PaymentLog（支付流水）、SystemConfig（系统配置）
- 使用 Prisma ORM，支持 SQLite / PostgreSQL 切换
- 索引优化：状态、时间、订单号等常用查询字段

#### 6. 部署文档
- 完整部署文档 `DEPLOY.md`
- Vercel 部署指南（自动 HTTPS）
- 国内服务器 Nginx 部署指南
- SSL 证书配置（Let's Encrypt）
- HTTP 自动跳转 HTTPS
- 微信支付配置教程
- AI 模型配置教程

---

### 🔧 修改内容

| 文件 | 说明 |
|------|------|
| `prisma/schema.prisma` | 新增 - 数据库 Schema |
| `lib/prisma.ts` | 新增 - Prisma 客户端单例 |
| `lib/config.ts` | 新增 - 全局配置（域名/AI/支付/系统） |
| `lib/ai/index.ts` | 新增 - AI 服务封装 |
| `lib/payment/wechat.ts` | 新增 - 微信支付封装 |
| `lib/payment/index.ts` | 新增 - 订单服务 |
| `lib/report/index.ts` | 新增 - 报告服务 |
| `lib/utils/response.ts` | 新增 - API 响应格式 |
| `lib/utils/order.ts` | 新增 - 订单号生成工具 |
| `app/page.tsx` | 新增 - H5 首页 |
| `app/assessment/page.tsx` | 新增 - 测评表单页 |
| `app/assessment/[id]/page.tsx` | 新增 - 测评结果/预览页 |
| `app/report/[id]/page.tsx` | 新增 - 完整报告页 |
| `app/api/assessments/route.ts` | 新增 - 测评 API（列表/创建） |
| `app/api/assessments/[id]/route.ts` | 新增 - 测评详情 API |
| `app/api/orders/route.ts` | 新增 - 创建订单 API |
| `app/api/orders/[id]/route.ts` | 新增 - 查询订单 API |
| `app/api/reports/[id]/route.ts` | 新增 - 报告 API |
| `app/api/payment/wechat/notify/route.ts` | 新增 - 微信支付回调 |
| `app/api/payment/mock-success/route.ts` | 新增 - 模拟支付（开发用） |
| `app/globals.css` | 新增 - 全局样式 |
| `app/layout.tsx` | 新增 - 根布局 |
| `middleware.ts` | 修改 - H5 页面公开访问 |
| `.env.example` | 更新 - 完整环境变量示例 |
| `DEPLOY.md` | 新增 - 部署文档 |

---

### 📊 影响范围

| 模块 | 状态 | 说明 |
|------|------|------|
| H5 首页 | ✅ 完成 | 可正常访问 |
| 测评表单 | ✅ 完成 | 3 步式填写，参数校验 |
| AI 分析 | ✅ 完成 | 后端调用，异步生成 |
| 订单系统 | ✅ 完成 | 创建/查询/回调 |
| 微信支付 | ⚠️ 框架完成 | 已封装接口，需配置真实商户号 |
| 报告预览 | ✅ 完成 | 30% 内容锁定 |
| 完整报告 | ✅ 完成 | 支付后解锁 |
| PDF 导出 | ⚠️ 简化实现 | 使用浏览器打印/另存为 PDF |
| 公众号兼容 | ⚠️ 基础兼容 | HTTPS + 移动端适配，JS-SDK 待接入 |
| 性能优化 | ⚠️ 基础版 | 待优化（缓存/懒加载等） |
| 安全加固 | ⚠️ 基础版 | 待加固（限流/XSS/CSRF 等） |

---

### 🧪 测试方法

#### 1. 启动项目

```bash
# 安装依赖
npm install

# 初始化数据库
npx prisma db push

# 启动开发服务
npm run dev
```

#### 2. 测试完整流程

1. 打开 http://localhost:3000 → 查看首页
2. 点击"开始免费测评" → 填写表单（3 步）
3. 提交后等待分析 → 查看分析中状态
4. 分析完成后 → 查看预览报告（30% 内容）
5. 点击"查看完整报告" → 模拟支付
6. 支付成功后 → 自动跳转到完整报告页
7. 在完整报告页 → 测试打印/下载 PDF

#### 3. API 测试

```bash
# 提交测评
curl -X POST http://localhost:3000/api/assessments \
  -H "Content-Type: application/json" \
  -d '{"companyName":"测试公司","industry":"科技互联网","mainBusiness":"企业服务","revenue":"1000-3000万","profit":"10%-20%","employeeCount":"50-100人","bossGoal":"融资上市"}'

# 查询测评
curl http://localhost:3000/api/assessments/<id>
```

---

### 🚀 部署步骤

详见 `DEPLOY.md`，简要步骤：

1. 配置环境变量（.env）
2. 初始化数据库：`npx prisma db push`
3. 构建项目：`npm run build`
4. 启动服务：`npm start`
5. 配置 Nginx 反向代理 + HTTPS
6. 配置微信支付回调地址
7. 配置域名解析

---

### 📝 后续迭代建议

| 优先级 | 功能 | 说明 |
|--------|------|------|
| P0 | 接入真实微信支付 | 配置商户号、证书，对接 V3 API |
| P0 | 服务端 PDF 生成 | 使用 Puppeteer 生成精美 PDF |
| P1 | 公众号 JS-SDK | 分享配置、微信登录、openid 获取 |
| P1 | 管理后台 | 数据统计、订单管理、客户列表 |
| P1 | 限流 + 安全加固 | 防止刷接口、XSS/CSRF 防护 |
| P2 | 性能优化 | 缓存、图片懒加载、首屏优化 |
| P2 | 支付宝支付 | 扩展支付渠道 |
| P2 | 用户系统 | 手机号登录、历史报告查询 |
