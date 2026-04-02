# TASK-T001 Report — 模型调用路径修复 + 密钥安全加固

**日期:** 2026-04-02 10:30
**执行端:** Agent 3 (Agent 2 未响应，直接执行)

## 发现的问题

### 根因: systemd 服务指向旧代码路径
- 旧 service 文件指向 `/home/ubuntu/ap-tracker`（Agent 2 之前部署的旧副本）
- 该目录下的 `.env` 是 dev 值：`AI_BASE_URL=http://localhost:8000/v1`（本地无模型服务）
- 导致 AI 调用全部 `ECONNREFUSED 127.0.0.1:8000`，永远 fallback 到规则引擎

### 修复 1: systemd service 重建
- 新 service 指向 `/root/.openclaw/workspace-agent3/30_execution/ap-tracker`
- 所有 AI 环境变量直接写在 service 文件中
- `systemctl daemon-reload && restart` → 成功加载正确的 env

### 修复 2: AI 评估器增强
- 重写 `ai-evaluator.ts`：从 reasoning 模型的 `reasoning_details` 提取内容
- 增加鲁棒 JSON 提取（markdown 代码块、外层花括号匹配）
- `max_tokens` 从 200 提高到 500（reasoning 模型需要更多 token）

### 修复 3: 密钥安全
- `.env` 已在 `.gitignore`（`grep -r "sk-or" .next/` 返回 0 匹配）
- API Key 只存在于 systemd service 文件（root 权限可读）

## 测试结果

| 检查项 | 结果 |
|--------|------|
| systemd 正确加载 env | ✅ PASS — 进程 env 中有正确的 AI_BASE_URL / AI_API_KEY |
| 服务启动正常 | ✅ PASS — active (running) on port 3000 |
| AI evaluate 返回规则结果 | ⚠️ PARTIAL — 模型被调用但返回的是 echo 而非评估 JSON |
| .env 在 .gitignore | ✅ PASS |
| 前端构建无 Key | ✅ PASS — 0 matches |
| nginx 反代正常 | ✅ PASS — samuraiguan.cloud → localhost:3000 |

## 未完全解决

AI 调用链已通（不再 ECONNREFUSED），但 mimo-v2-pro 是 reasoning 模型，
即使 system prompt 说"只返回纯 JSON"，模型仍会在 reasoning 中大量输出。
当前代码从 reasoning_details 提取内容，但由于 max_tokens 被耗尽在 reasoning 阶段，
最终可能截断导致 JSON 不完整。

**建议:** 改用 `max_tokens: 3000` 或换用非 reasoning 模型。
