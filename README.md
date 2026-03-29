# 互站风格虚拟商品交易平台（MVP）

基于 **Next.js 14 + TypeScript + Tailwind CSS + Prisma + MySQL + NextAuth** 的前后台一体化项目。

## 1. 项目目录结构（MVP）

```text
.
├─ app
│  ├─ (front)
│  │  ├─ page.tsx                 # 首页
│  │  ├─ login/page.tsx           # 登录/注册
│  │  ├─ products/page.tsx        # 商品列表
│  │  ├─ products/[id]/page.tsx   # 商品详情
│  │  ├─ user/page.tsx            # 用户中心
│  │  └─ merchant/page.tsx        # 商家中心
│  ├─ admin/page.tsx              # 后台首页
│  ├─ orders/page.tsx             # 订单管理
│  ├─ api
│  │  ├─ auth/[...nextauth]/route.ts
│  │  ├─ auth/register/route.ts
│  │  ├─ products/route.ts
│  │  └─ orders/route.ts
│  ├─ globals.css
│  └─ layout.tsx
├─ components
│  ├─ navbar.tsx
│  ├─ providers.tsx
│  ├─ sign-out-button.tsx
│  ├─ create-order-form.tsx
│  └─ merchant-product-form.tsx
├─ lib
│  ├─ auth.ts
│  ├─ prisma.ts
│  └─ constants.ts
├─ prisma
│  ├─ schema.prisma               # 数据模型设计
│  ├─ init.sql                    # 初始化 SQL 入口
│  └─ migrations/0001_init/migration.sql
├─ types/next-auth.d.ts
├─ .env.example
└─ README.md
```

## 2. Prisma 数据模型设计

包含核心实体：

- 用户 `User`（普通用户 / 商家 / 管理员）
- 商家资料 `MerchantProfile`（入驻申请）
- 分类 `Category`
- 商品 `Product`（支持审核状态）
- 订单 `Order`
- 订单项 `OrderItem`
- 文章 `Article`
- 网站设置 `SiteSetting`

并提供了枚举：

- `UserRole`
- `MerchantStatus`
- `ProductStatus`
- `OrderStatus`

详见：`prisma/schema.prisma`。

## 3. 初始化 SQL / 迁移方案

### 推荐方式（Prisma 迁移）

```bash
npx prisma generate
npx prisma migrate dev
```

### 直接 SQL 方式

- 迁移文件：`prisma/migrations/0001_init/migration.sql`
- 入口文件：`prisma/init.sql`

你也可以直接把 `migration.sql` 导入 MySQL 执行。

## 4. 前后台路由设计

### 前台

- `/` 首页
- `/products` 商品列表（支持 `?keyword=xx&category=xx`）
- `/products/[id]` 商品详情
- `/login` 登录 / 注册
- `/user` 用户中心
- `/merchant` 商家中心（发布商品）
- `/orders` 订单管理（买家/卖家视角）

### 后台

- `/admin` 后台首页（统计 + 待审核商品）

### API

- `POST /api/auth/register` 用户注册
- `GET/POST /api/products` 商品列表 / 商家发布商品
- `GET/POST /api/orders` 获取订单 / 下单
- `GET/POST /api/auth/[...nextauth]` NextAuth 登录鉴权

## 5. 已完成的基础页面

- 首页
- 商品列表页
- 商品详情页
- 登录页
- 用户中心
- 商家中心
- 后台首页

均为中文界面，风格简洁现代，可在此基础上扩展支付、余额、评价、投诉等模块。

## 6. 本地启动步骤

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

```bash
cp .env.example .env
```

并修改 `.env` 中 MySQL 账号密码。

3. 初始化数据库

```bash
npx prisma generate
npx prisma migrate dev
```

4. 启动项目

```bash
npm run dev
```

5. 访问

- 前台：http://localhost:3000
- 后台：http://localhost:3000/admin

## 7. 后续建议

- 增加 RBAC 中间件（按角色限制路由）
- 增加管理员审核 API（商品通过/驳回）
- 增加商家入驻申请提交/审核流程页面
- 增加支付流水、余额账户、评价、工单投诉、消息通知
- 增加对象存储（商品封面、附件）和风控日志
