# 需求：AP 微积分刷题页

## 我想要什么
一个单页 HTML 刷题页面，打开就能做 AP Calculus BC 的选择题。

## 具体要求
1. 题目从 JSON 文件加载（我已经准备好了题库）
2. 每次显示 1 道题，4 个选项
3. 选完后显示对错 + 正确答案
4. 最后显示总分（如 "8/10"）
5. 页面风格简洁，白底黑字就行
6. 不需要后端，纯前端，直接浏览器打开

## 不需要的
- 不需要登录注册
- 不需要数据库
- 不需要部署到服务器
- 不需要手机适配（电脑用）

## 题库格式（我已经有的）
`assets/questions.json` 已经放好了，格式如下：

```json
[
  {
    "id": 1,
    "question": "What is the derivative of sin(x)?",
    "choices": ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"],
    "answer": 0,
    "explanation": "The derivative of sin(x) is cos(x)."
  }
]
```

共 10 道题，微积分 BC 基础题。
