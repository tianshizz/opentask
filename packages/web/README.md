# Claw-Ticks Web UI

简约现代的 AI Agent Ticket 管理界面。

## 🎨 设计风格

- **简约现代**: 干净的界面，专注于内容
- **淡色调**: 柔和的配色，长时间Usage不疲劳
- **响应式**: 完美适配桌面和移动设备

## 🚀 Quick Start

### 1. Installation依赖

```bash
cd packages/web
pnpm install
```

### 2. 启动DevelopmentService器

```bash
# 确保 API Service器在运行（http://localhost:3000）
# 在项目根目录运行: pnpm dev

# 启动 Web UI
pnpm dev
```

### 3. 访问

打开浏览器访问: **http://localhost:3001**

Web UI 会自动代理 API 请求到 `http://localhost:3000`

## 📁 项目结构

```
packages/web/
├── src/
│   ├── components/          # React 组件
│   │   ├── ui/              # 基础 UI 组件
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Badge.tsx
│   │   ├── Layout.tsx       # 主布局
│   │   ├── TicketStatusBadge.tsx
│   │   └── PriorityBadge.tsx
│   ├── pages/               # 页面组件
│   │   ├── Dashboard.tsx    # Dashboard
│   │   ├── TicketList.tsx   # Ticket 列表
│   │   └── TicketDetail.tsx # Ticket 详情
│   ├── lib/
│   │   ├── api.ts           # API 客户端
│   │   └── utils.ts         # 工具函数
│   ├── App.tsx              # RouteConfiguration
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## 📄 Features页面

### 1. Dashboard (`/dashboard`)

- ✅ Tickets 统计（总数、Pending、In Progress、Completed）
- ✅ 最近的 Tickets 列表
- ✅ Awaiting Review提醒

### 2. Ticket 列表 (`/tickets`)

- ✅ 搜索Features（标题、描述、ID）
- ✅ Status过滤
- ✅ 优先级过滤
- ✅ 实时数据

### 3. Ticket 详情 (`/tickets/:id`)

- ✅ 完整的 Ticket 信息
- ✅ 执行尝试列表
- ✅ 评论系统
- ✅ 审核Features（批准/请求修改）
- ✅ 标签展示

## 🎯 核心Features

### 审核工作流

1. Agent Complete Ticket 后，Status变为 `WAITING_REVIEW`
2. 在详情页可以：
   - ✅ **批准**: 标记为Complete
   - ❌ **请求修改**: 返回给 Agent 重新处理
3. 可以添加审核意见

### 实时Update

Usage `@tanstack/react-query` Implementation：
- 自动Cache
- 后台轮询
- 乐观Update

## 🎨 设计系统

### 颜色

- **主色**: 蓝色（Blue-500）
- **Success**: 绿色（Green-50/700）
- **Warning**: 黄色（Yellow-50/700）
- **Error**: 红色（Red-50/700）
- **背景**: 浅灰（Gray-50）

### 组件

#### Button
```tsx
<Button variant="primary" size="md">
  点击
</Button>
```

变体: `default` | `primary` | `outline` | `ghost` | `danger`

#### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
  </CardHeader>
  <CardContent>
    内容
  </CardContent>
</Card>
```

#### Badge
```tsx
<Badge variant="success">Success</Badge>
```

变体: `default` | `success` | `warning` | `danger` | `info`

## 📊 API 集成

All API 调用都通过 `src/lib/api.ts` 统一管理：

```typescript
import { ticketsApi } from '@/lib/api'

// 获取 Tickets
const { data } = await ticketsApi.list()

// 批准 Ticket
await ticketsApi.approve(ticketId, '审核通过')
```

## 🔧 Development

### EnvironmentVariable

Web UI Usage Vite 的代理Features，自动转发 `/api` 请求到 `http://localhost:3000`

### 构建

```bash
pnpm build
```

构建产物在 `dist/` 目录

### 预览

```bash
pnpm preview
```

## 🚀 部署

### Usage Netlify

```bash
# 已Configuration在 ../../netlify.toml
# 运行部署命令
netlify deploy --prod
```

### Usage Vercel

```bash
vercel deploy
```

### Usage Nginx

```bash
# 构建
pnpm build

# 将 dist/ 目录部署到 Nginx
# nginx.conf Example:
server {
    listen 80;
    root /path/to/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
    }
}
```

## 🎯 Route

- `/` - 重定向到 `/dashboard`
- `/dashboard` - Dashboard
- `/tickets` - Ticket 列表
- `/tickets/:id` - Ticket 详情

## 🔍 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **TailwindCSS** - 样式
- **React Router** - Route
- **TanStack Query** - 数据管理
- **Axios** - HTTP 客户端
- **Lucide React** - 图标

## 💡 最佳实践

1. **组件复用**: Usage `src/components/ui` 中的基础组件
2. **类型安全**: All API 响应都有完整类型定义
3. **Error处理**: Usage React Query 的Error边界
4. **性能优化**: Usage React Query Cache和分页

## 📝 Development提示

### 添加新页面

1. 在 `src/pages/` 创建组件
2. 在 `src/App.tsx` 添加Route
3. 在 `src/components/Layout.tsx` 添加导航（如需要）

### 调用 API

```typescript
import { useQuery, useMutation } from '@tanstack/react-query'
import { ticketsApi } from '@/lib/api'

// 查询
const { data, isLoading } = useQuery({
  queryKey: ['tickets'],
  queryFn: () => ticketsApi.list(),
})

// 修改
const mutation = useMutation({
  mutationFn: ticketsApi.approve,
  onSuccess: () => {
    // 刷新数据
    queryClient.invalidateQueries({ queryKey: ['tickets'] })
  },
})
```

## 🐛 Troubleshooting

### API 请求Failed

检查：
1. API Service器是否运行（http://localhost:3000）
2. CORS Configuration是否正确
3. 浏览器控制台的网络请求

### 样式不生效

```bash
# 重新Installation依赖
rm -rf node_modules
pnpm install
```

### TypeScript Error

```bash
# 重新生成类型
pnpm tsc --noEmit
```

## 📚 相关Documentation

- [API Documentation](../../docs/api-reference.md)
- [React Query Documentation](https://tanstack.com/query)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)

---

**享受简约现代的 UI！** 🎨
