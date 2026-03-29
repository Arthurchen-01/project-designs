# AP 学习平台 v1 开发路线图

> 基于 could-coding 现有项目 + 完整设计方案
> 更新时间：2026-03-29

---

## 📊 现状分析

### 已完成功能（could-coding）

| 模块 | 功能 | 状态 |
|------|------|------|
| **套题模考** | MCQ/FRQ/KaTeX/高亮/计时器/题号导航 | ✅ |
| **Dashboard** | 8 科目卡片/掌握度/错题追踪/AI 分析 | ✅ |
| **专项训练** | 科目→题型→策略漏斗式筛选 | ✅ |
| **AI 导师** | 明日香聊天/3 种模式/情绪系统 | ✅ |
| **数据层** | 15 套题库/1078 题/多模型 API 支持 | ✅ |
| **基础伴读** | 图片上传 + AI 阅读 | ⚠️ |

### 技术栈

- 前端：原生 HTML/CSS/JS（无框架）
- LaTeX：KaTeX
- AI：OpenAI / Gemini / Claude
- 存储：localStorage
- 部署：GitHub Pages

---

## 🎯 v1 开发目标

**距离最近考试：36 天（5月4日 微观经济）**

v1 的核心目标是在考试前实现 **最能提升学习效率** 的功能。

---

## 🔴 第一优先级：核心学习体验（本周）

### Task 1: PDF 伴读工作台

**重要性：** ⭐⭐⭐⭐⭐（设计方案的核心创新）

**功能要求：**
- 用户上传 PDF 后，左侧显示真正的 PDF 阅读区
- PDF 支持上下滚动浏览多页
- 左右分栏布局（PDF + AI 对话）
- 拖拽调整左右宽度
- 布局状态本地记忆

**技术方案：**
```
study-workspace/
├── index.html
├── css/
│   └── workspace.css
└── js/
    ├── workspace.js       ← 主逻辑
    ├── pdf-reader.js      ← pdf.js 封装
    ├── resizer.js         ← 拖拽分栏
    └── silent-reader.js   ← 静默识别
```

**依赖：**
- pdf.js（CDN: https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/）

**实现步骤：**
1. 创建 `study-workspace/` 目录结构
2. 引入 pdf.js 并实现基础 PDF 渲染
3. 实现左右分栏布局 + 拖拽功能
4. 接入现有 AI 对话系统（复用 `js/api-config.js`）
5. 实现布局状态 localStorage 保存

**预计工时：** 4-6 小时

---

### Task 2: 静默识别当前页

**重要性：** ⭐⭐⭐⭐⭐（让 AI 真正"看懂"内容）

**功能要求：**
- 用户点击"预读当前页"按钮
- 系统截图当前 PDF 页面
- 调用视觉模型识别内容
- 识别结果缓存在本地
- 用户提问时自动注入上下文

**技术方案：**
- 截图：html2canvas 或 canvas API
- 识别：调用 `callAPI()` 传入图片（已有 `buildMultimodalMessage()`）
- 缓存：Map 或对象存储识别结果

**实现步骤：**
1. 安装 html2canvas（CDN）
2. 实现页面截图功能
3. 调用视觉模型 API（Gemini Pro Vision / GPT-4V）
4. 缓存识别结果
5. 用户提问时自动附加上下文

**预计工时：** 3-4 小时

---

### Task 3: 问题记录系统

**重要性：** ⭐⭐⭐⭐（学习轨迹追踪）

**功能要求：**
- 保存每次问答的完整信息
- 本地存储 + JSON 导出
- 问题历史查看界面

**保存字段：**
```javascript
{
  timestamp: Date,
  subject: String,
  contextId: String,      // PDF 页码或题目 ID
  question: String,
  response: String,
  visionUsed: Boolean,
  pageSummary: String     // 可选
}
```

**技术方案：**
- 新建 `js/question-logger.js`
- 使用 IndexedDB 存储（容量更大）
- 提供导出 JSON 功能

**实现步骤：**
1. 创建 `js/question-logger.js`
2. 设计数据结构
3. 实现保存/查询/导出功能
4. 创建问题历史查看页面（可选）

**预计工时：** 2-3 小时

---

## 🟡 第二优先级：AI 能力升级（下周）

### Task 4: 人格系统扩展

**重要性：** ⭐⭐⭐⭐（增加学习趣味性）

**需要创建的人格：**

#### 1. 剑心（Kenshin）— 引路人
```json
{
  "id": "kenshin",
  "name": "剑心",
  "tone": "温和谦逊",
  "teachingStyle": "用武术类比解释经济学",
  "systemPrompt": "你是剑心，清华大学经济管理学院本科生..."
}
```

#### 2. 三笠（Mikasa）— 守护者
```json
{
  "id": "mikasa",
  "name": "三笠",
  "tone": "冷静沉稳",
  "teachingStyle": "极简与一针见血的苏格拉底提问",
  "systemPrompt": "你是三笠，Caltech 物理系本科生..."
}
```

#### 3. 小樱（Sakura）— 陪伴者
```json
{
  "id": "sakura",
  "name": "小樱",
  "tone": "温柔灵动",
  "teachingStyle": "用生活点滴解释抽象概念",
  "systemPrompt": "你是小樱，清华大学心理学系本科生..."
}
```

**技术方案：**
- 新建 `js/persona-manager.js`
- 创建 `personas/*.json` 配置文件
- 在设置弹窗中增加人格选择器

**预计工时：** 3-4 小时

---

### Task 5: 全局悬浮插件完善

**重要性：** ⭐⭐⭐（随时随地调用 AI）

**功能要求：**
- 浮窗可拖拽位置
- 可调整大小
- 可展开/收起/最小化
- 与设置中心联动

**现有基础：**
- 已有 `components/ai-float.js/css`（需完善）

**实现步骤：**
1. 完善拖拽功能（mousedown/mousemove/mouseup）
2. 添加缩放功能
3. 实现最小化状态
4. 读取设置中的 API 配置

**预计工时：** 2-3 小时

---

### Task 6: 语音输入 v1

**重要性：** ⭐⭐⭐（提升输入效率）

**功能要求：**
- 用户点击麦克风按钮
- 浏览器语音识别启动
- 识别结果填入输入框
- 用户确认后发送

**技术方案：**
- Web Speech API (SpeechRecognition)
- 在 AI 导师页面集成

**实现步骤：**
1. 检测浏览器支持
2. 实现语音识别逻辑
3. 将结果填入输入框
4. 添加 UI 反馈（录音中...）

**预计工时：** 2 小时

---

## 🟢 第三优先级：增值功能（2-3 周后）

### Task 7: 建议提问与理解检测

**功能：**
- AI 根据当前页自动生成建议问题
- "考我这页"按钮生成小题
- 苏格拉底式追问链

**预计工时：** 3-4 小时

---

### Task 8: 8 维度评分系统

**评分维度：**
1. 知识理解深度
2. 底层逻辑掌握
3. 苏格拉底式追问表现
4. 提问质量
5. 学习连续性
6. 复习活跃度
7. 概念修正能力
8. 答题表现

**预计工时：** 4-5 小时

---

## 📅 开发时间表

### Week 1（3/29 - 4/4）
- [x] 创建项目设计方案文档
- [ ] PDF 伴读工作台（Task 1）
- [ ] 静默识别当前页（Task 2）
- [ ] 问题记录系统（Task 3）

### Week 2（4/5 - 4/11）
- [ ] 人格系统扩展（Task 4）
- [ ] 全局悬浮插件（Task 5）
- [ ] 语音输入 v1（Task 6）

### Week 3（4/12 - 4/18）
- [ ] 建议提问与理解检测（Task 7）
- [ ] 8 维度评分系统（Task 8）

### Week 4-5（4/19 - 5/3）
- [ ] 测试与优化
- [ ] 准备考试

---

## 🔧 技术债务

### 需要解决的问题

1. **微积分 BC MathType 数据**
   - 旧数据使用 `[⚠️公式待接入]` 占位
   - 等待 MinerU 输出纯净 LaTeX

2. **Cloudflare Worker 部署**
   - 代码已就绪（`api-proxy/worker.js`）
   - 需要部署以解决 CORS 问题

3. **图片粘贴/截屏识别**
   - 当前仅支持文件上传
   - 需要支持剪贴板粘贴

---

## 📝 关键设计原则

1. **优先复用现有资源**：不要推翻重做，基于 could-coding 扩展
2. **配置驱动**：人格、模型、能力都通过配置管理，不写死
3. **能力抽象**：统一按"能力"调用，不按"厂商"写死
4. **渐进式开发**：先跑通核心功能，再逐步组件化重构
5. **本地优先**：所有数据先存本地，减轻服务器负担，保护隐私
6. **苏格拉底式**：所有 AI 交互都偏引导式提问，不直接给答案

---

## 🚀 快速开始

### 1. 克隆现有项目

```bash
git clone https://github.com/Arthurchen-01/could-coding.git
cd could-coding
```

### 2. 创建新分支

```bash
git checkout -b v1-dev
```

### 3. 开始开发

按照上述任务清单逐个实现。

### 4. 测试

```bash
# 本地测试
python -m http.server 8000
# 或
npx http-server
```

### 5. 部署

```bash
git add .
git commit -m "v1: PDF workspace + silent reader"
git push origin v1-dev
```

---

## 📚 参考资料

- **pdf.js 文档：** https://mozilla.github.io/pdf.js/
- **Web Speech API：** https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **html2canvas：** https://html2canvas.hertzen.com/
- **现有项目：** https://arthurchen-01.github.io/could-coding/

---

## 💡 总结

v1 的核心是 **PDF 伴读工作台 + 静默识别**，这两个功能直接决定了学习效率的提升。

**预计效果：**
- 学习效率提升 2-3 倍
- 10 小时能顶过去 30 小时
- 学习变成一种享受，而不是负担

**时间紧迫，聚焦核心功能，快速迭代！**

---

*路线图更新 · 2026-03-29*