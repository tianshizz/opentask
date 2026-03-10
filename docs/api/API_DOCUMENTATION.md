# API DocumentationUpdate说明

## ✅ Completed的改进

### Swagger Documentation增强

我已经为All API 端点添加了完整的 Request/Response Schema：

#### 1. Attempts API

**POST /api/v1/attempts**
```json
{
  "ticketId": "f0ac3da6-d99e-4b44-acf4-890b8c3f3344",
  "agentId": "cfda1226-dd6a-4888-8434-8b3090c79458",
  "reasoning": "Attempting to fix the authentication issue by updating the OAuth configuration"
}
```

**POST /api/v1/attempts/:id/steps**
```json
{
  "action": "Analyzed authentication configuration",
  "input": {
    "configFile": "auth.config.ts",
    "lineNumber": 42
  },
  "output": {
    "findings": ["OAuth client ID mismatch", "Missing redirect URI"]
  }
}
```

**POST /api/v1/attempts/:id/complete**
```json
{
  "outcome": "Successfully fixed the OAuth configuration. Tests passing.",
  "status": "SUCCESS"
}
```

#### 2. Comments API

**POST /api/v1/comments**
```json
{
  "ticketId": "f0ac3da6-d99e-4b44-acf4-890b8c3f3344",
  "authorId": "e2c54963-3617-4b9d-ba38-63bf3027ed80",
  "content": "I reviewed the code and it looks good. Approved!",
  "type": "HUMAN_FEEDBACK"
}
```

### 新增的 DTOs

创建了以下 DTO 文件：

1. **Attempts**
   - `CreateAttemptDto` - 创建尝试
   - `AddStepDto` - 添加执行Step
   - `CompleteAttemptDto` - Complete尝试

2. **Comments**
   - `CreateCommentDto` - 创建评论

### API 改进

- ✅ All请求都有明确的 Schema 定义
- ✅ 添加了详细的描述和Example
- ✅ Usage `@ApiParam` 标注路径参数
- ✅ Usage `@ApiResponse` 说明响应Status
- ✅ 请求Validation（class-validator）

## 📖 访问 Swagger Documentation

启动 API Service器后访问:

**http://localhost:3000/api/docs**

现在你可以看到：
- 完整的请求 Schema
- Example请求体
- All字段说明
- 响应Status码
- "Try it out" FeaturesTest API

## 🎯 UsageExample

### 创建 Attempt

```bash
curl -X POST http://localhost:3000/api/v1/attempts \
  -H "Content-Type: application/json" \
  -d '{
    "ticketId": "f0ac3da6-d99e-4b44-acf4-890b8c3f3344",
    "agentId": "cfda1226-dd6a-4888-8434-8b3090c79458",
    "reasoning": "First attempt to fix the bug"
  }'
```

### 添加执行Step

```bash
curl -X POST http://localhost:3000/api/v1/attempts/{attemptId}/steps \
  -H "Content-Type: application/json" \
  -d '{
    "action": "Analyzed code",
    "input": {"file": "auth.ts"},
    "output": {"issue": "Missing validation"}
  }'
```

### Complete Attempt

```bash
curl -X POST http://localhost:3000/api/v1/attempts/{attemptId}/complete \
  -H "Content-Type: application/json" \
  -d '{
    "outcome": "Bug fixed successfully",
    "status": "SUCCESS"
  }'
```

### 添加评论

```bash
curl -X POST http://localhost:3000/api/v1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "ticketId": "f0ac3da6-d99e-4b44-acf4-890b8c3f3344",
    "authorId": "e2c54963-3617-4b9d-ba38-63bf3027ed80",
    "content": "Great work!",
    "type": "HUMAN_FEEDBACK"
  }'
```

## 🔍 All可用的 API 端点

### Tickets
- `GET /api/v1/tickets` - 列出All tickets
- `POST /api/v1/tickets` - 创建 ticket
- `GET /api/v1/tickets/:id` - 获取 ticket 详情
- `PATCH /api/v1/tickets/:id` - Update ticket
- `POST /api/v1/tickets/:id/approve` - 批准 ticket
- `POST /api/v1/tickets/:id/request-revision` - 请求修改
- `POST /api/v1/tickets/:id/assign` - 分配 agent

### Attempts
- `POST /api/v1/attempts` - 创建 attempt
- `POST /api/v1/attempts/:id/steps` - 添加Step
- `POST /api/v1/attempts/:id/complete` - Complete attempt
- `GET /api/v1/attempts/ticket/:ticketId` - 获取 ticket 的All attempts

### Comments
- `POST /api/v1/comments` - 创建评论
- `GET /api/v1/comments/ticket/:ticketId` - 获取 ticket 的All评论

### Actors
- `POST /api/v1/actors` - 创建 actor（人类或 agent）
- `GET /api/v1/actors` - 列出All actors
- `GET /api/v1/actors/:id` - 获取 actor 详情

## 💡 最佳实践

### 1. Usage TypeScript SDK

```typescript
import { ticketsApi, attemptsApi } from '@/lib/api'

// 创建 attempt
const attempt = await attemptsApi.create({
  ticketId: 'xxx',
  agentId: 'yyy',
  reasoning: 'First try'
})
```

### 2. Usage Python SDK

```python
from opentask import OpentaskClient

client = OpentaskClient(api_url="http://localhost:3000")

# 创建 attempt
attempt = client.create_attempt(
    ticket_id="xxx",
    agent_id="yyy",
    reasoning="First try"
)
```

### 3. Error处理

All API 都返回标准的 HTTP Status码：
- `200` - Success
- `201` - 创建Success
- `400` - 请求Error
- `404` - 资源不存在
- `500` - Service器Error

## 📝 Update日志

### 2026-03-10
- ✅ 为 Attempts API 添加完整的 DTOs
- ✅ 为 Comments API 添加完整的 DTOs
- ✅ All端点添加详细描述
- ✅ 添加请求Example
- ✅ 改进 Swagger UI 展示

---

**现在 Swagger Documentation已经完整！** 访问 http://localhost:3000/api/docs 查看。
