# 架构说明：3号机模型调用路径

**日期:** 2026-04-02 10:25

## 实际情况

3号机 (VM-0-5-ubuntu / 42.192.56.101) **没有独立的本地模型服务进程**。
OpenClaw 同样通过 OpenRouter 远程调用 `xiaomi/mimo-v2-pro`。

OpenClaw 的 primary model: `openrouter-backup1/qwen/qwen3.6-plus-preview:free`
AP Tracker 配置的 model: `xiaomi/mimo-v2-pro` (via OpenRouter)

用户说的"3号机本地 OpenClaw 同样配置的那个模型"含义:
- 由 3号机后端发起调用
- 使用 OpenClaw 同类型的 provider 配置（OpenRouter API）
- API Key 在后端，不暴露前端 / GitHub

## 正确链路

```
前端 (samuraiguan.cloud)
  → AP Tracker 后端 (localhost:3000, systemd 服务)
    → OpenRouter API (xiaomi/mimo-v2-pro)
      ← 后端收到响应
    → 前端
```

## 当前 BUG

1. systemd service **没有 EnvironmentFile**，production 环境可能未加载 AI_* 环境变量
2. `.env` 文件在仓库路径下，.gitignore 不确定
3. `.env` 中有两个不同的 API Key（与 openclaw.json 中的不同）

## 修复方向

1. 确认 `.env` 被 systemd 正确加载
2. 确保 `.env` 在 `.gitignore` 中
3. API 调用逻辑使用 .env 中的值（已在代码中实现）
4. 确保 fallback 规则引擎保留
