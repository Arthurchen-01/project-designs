# Task Card: TASK-T001 — 模型调用路径修复 + 密钥安全加固

**优先级:** P0 (BLOCKING) → FD 验收前置
**分发时间:** 2026-04-02 10:25
**执行端:** Agent 2

## 背景

用户最终验收要求: 后端调模型, 前端不接触模型和 Key。

3号机没有独立模型进程。OpenClaw 也通过 OpenRouter 调 mimo-v2-pro。
用户说的"3号机本地模型" = 后端发起调用 + Key 在后端 = 正确链路。

当前 BUG: systemd service 没有 EnvironmentFile, AI 环境变量未加载。

## 代码位置

- 部署目录: `/root/.openclaw/workspace-agent3/30_execution/ap-tracker`
- systemd: `/etc/systemd/system/ap-tracker.service`

## 具体工作

### Step 1: 修改 systemd 加载 .env

编辑 `/etc/systemd/system/ap-tracker.service`, 在 [Service] 段添加:
```
EnvironmentFile=/root/.openclaw/workspace-agent3/30_execution/ap-tracker/.env
```

保留现有 Environment 行。

### Step 2: .gitignore

在 ap-tracker 目录确认 `.gitignore` 内容:
```
.env
*.env*
node_modules/
.next/
```
如果 `.env` 已被 git 跟踪: `git rm --cached .env`

### Step 3: 确认 .env 配置

验证内容正确:
```
DATABASE_URL="file:./prisma/dev.db"
AI_BASE_URL="https://openrouter.ai/api/v1"
AI_MODEL="xiaomi/mimo-v2-pro"
AI_API_KEY="sk-or-..."
```

### Step 4: 重启并验证

```bash
systemctl daemon-reload
systemctl restart ap-tracker
sleep 3
systemctl status ap-tracker
journalctl -u ap-tracker -n 30 --no-pager
```

### Step 5: AI 接口测试

```bash
curl -s -X POST http://localhost:3000/api/ai/evaluate \
  -H "Content-Type: application/json" \
  -d '{"description":"复习了第二章"}' | head -c 500
```

### Step 6: 安全检查

- `git status` — .env 不在暂存区
- `grep -r "sk-or" .next/ 2>/dev/null` — 前端无 Key
- `grep -r "AI_KEY\|AI_API_KEY" src/ 2>/dev/null` — 源码无硬编码 Key

## 验收标准

- ✅ systemd 正确加载 .env
- ✅ 服务重启后正常运行
- ✅ `/api/ai/evaluate` 返回成功结果
- ✅ .env 在 .gitignore
- ✅ 前端构建产物无 Key
- ✅ 日志无明文 Key
