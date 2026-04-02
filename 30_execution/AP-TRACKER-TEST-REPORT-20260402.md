# AP Tracker 最终验收报告

**日期：** 2026-04-02  
**执行人：** Agent 2  
**部署：** 3号机 (42.192.56.101)，systemd 服务，https://samuraiguan.cloud

---

## 一、P0 状态 — 全部通过 ✅

| # | P0 任务 | 状态 | 详情 |
|---|---------|------|------|
| 1 | 后端服务稳定性 | ✅ | systemd (ap-tracker.service)，Active: running, WorkingDirectory: `/home/ubuntu/ap-tracker/`，直接 `node_modules/.bin/next` 启动 |
| 2 | 前端 Key 配置入口 | ✅ | 前端无任何 Key 输入框、无 localStorage 存 Key、HTML 源码零匹配 |
| 3 | 前后端字段映射 | ✅ | API: `fiveRate` + `confidenceLevel`(中文) 对齐 `personal/page.tsx` |
| 4 | 关键路径闭环 | ✅ | 首页 → login → class1/dashboard → class1/personal 全部 200 OK |

---

## 二、完整验收清单

### A. 注册/登录/权限

| # | 测试项 | 结果 | 备注 |
|---|--------|------|------|
| 1 | 用户注册成功 | ✅ PASS | POST /api/auth/register → {success:true, studentId, name} |
| 2 | 重复注册被拦截 | ✅ PASS | {error:"该邮箱已注册"} (409) |
| 3 | 非法输入拦截 | ✅ PASS | 缺字段→400, 邮箱格式→400, 密码<4位→400 |
| 4 | 登录成功 | ✅ PASS | email+password → {success:true, studentId, role} |
| 5 | 错误密码被拒 | ✅ PASS | {error:"密码错误"} (401) |
| 6 | 未注册邮箱被拒 | ✅ PASS | {error:"邮箱未注册"} (401) |
| 7 | 获取当前用户信息 | ✅ PASS | GET /api/auth/me → {studentId, name, classId} |
| 8 | 登出 | ✅ FIX DEPLOYED | cookie set to expires: new Date(0) |
| 9 | 未登录访问被拦截 | ✅ PASS | /api/auth/me 无 cookie → null |
| 10 | 普通用户访问管理员接口 | ✅ PASS | /api/admin/ai/providers → {error:"权限不足"} (403) |
| 11 | 密码不是明文存储 | ✅ PASS | scryptSync 哈希 (salt:hash) |
| 12 | 注册后数据库有用户记录 | ✅ PASS |
| 13 | 用户角色字段正确 | ✅ PASS | role="student" |

### B. 提交流程

| # | 测试项 | 结果 |
|---|--------|------|
| 1 | MCQ 提交+成绩 | ✅ PASS |
| 2 | FRQ 提交+成绩 | ✅ PASS |
| 3 | 无成绩只有描述 | ✅ PASS (notes="复习了") |
| 4 | 提交后 DB 真实写入 | ✅ PASS |
| 5 | 5分率/置信/趋势 计算 | ✅ PASS |
| 6 | 详细描述 vs 简短描述 | ✅ PASS |

### C. 数据库

| # | 测试项 | 结果 |
|---|--------|------|
| 1 | user/student/student_subject | ✅ PASS |
| 2 | daily_update | ✅ PASS |
| 3 | probability_snapshot | ✅ PASS |
| 4 | seed data (1 class, 6 subjects) | ✅ PASS |

### D. API

| # | 端点 | 结果 |
|---|------|------|
| 1-13 | 全部 13 个端点 | ✅ PASS |

### E. HTTPS + 安全

| # | 测试项 | 结果 |
|---|--------|------|
| 1 | HTTPS /api/health | ✅ |
| 2 | HTTPS /login 200 | ✅ |
| 3 | HTTPS /class1/dashboard 200 | ✅ |
| 4 | HTTPS /class1/personal 200 | ✅ |
| 5 | API Key 从 systemd 移除 | ✅ (之前硬编码 sk-or-v1-...，已清除) |
| 6 | 前端无 Key 泄露 | ✅ |

---

## 三、⚠️ 风险

| # | 风险 | 现状 | 缓解 |
|---|------|------|------|
| 1 | 3号机 MIMO 模型未部署 | 规则引擎 fallback 正常工作 | 后续部署本地模型/OpenRouter |
| 2 | 前端登录页仍用 studentId 下拉 | 后端已支持 email+password | 需要更新 login/page.tsx |
| 3 | 新注册用户 confidence="低" | 符合预期，数据积累后改善 | — |

---

## 四、接手说明（5分钟）

**A. 前端** — https://samuraiguan.cloud，选班级→选学生→登录→个人中心提交

**B. 后端** — `/home/ubuntu/ap-tracker/`，`sudo systemctl restart ap-tracker`

**C. DB** — `sqlite3 /home/ubuntu/ap-tracker/dev.db` (user/student/daily_update/probability_snapshot)

**D. 模型** — 后端 .env: `AI_BASE_URL=http://localhost:8000/v1`, 前端不可见 Key

**E. 日志** — `sudo journalctl -u ap-tracker.service -f`
