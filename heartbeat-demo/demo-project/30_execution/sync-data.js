#!/usr/bin/env node
/**
 * sync-data.js
 * 将 00_input/assets/questions.json 同步到 30_execution/index.html 的内嵌 script 中
 *
 * 用法：node sync-data.js
 * 前提：在 demo-project/ 目录下运行
 */

const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', '00_input', 'assets', 'questions.json');
const htmlPath = path.join(__dirname, 'index.html');

// 1. 读取 JSON
console.log('[sync] 读取题库:', jsonPath);
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
console.log(`[sync] 共 ${jsonData.length} 道题`);

// 2. 读取 HTML
let html = fs.readFileSync(htmlPath, 'utf-8');

// 3. 用正则替换内嵌的 questions 数组
//    匹配：const questions = [...];
const jsonStr = JSON.stringify(jsonData, null, 6)
  .split('\n')
  .map((line, i) => i === 0 ? line : '    ' + line) // 保持缩进
  .join('\n');

const pattern = /const questions = \[[\s\S]*?\];/;
const replacement = `const questions = ${jsonStr};`;

if (!pattern.test(html)) {
  console.error('[sync] 错误：在 index.html 中没有找到 "const questions = [...]"');
  process.exit(1);
}

html = html.replace(pattern, replacement);

// 4. 写回
fs.writeFileSync(htmlPath, html, 'utf-8');
console.log('[sync] 已同步到 index.html');
console.log('[sync] 完成！');
