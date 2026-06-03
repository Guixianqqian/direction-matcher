# 方向匹配器 (Direction Matcher)

## 项目概述
AI 驱动的个人方向匹配测试工具。12 道题 → 匹配 25 个轻资产赛道 → Top 1 免费，Top 2-3 付费解锁（¥9.9）。

## 技术栈
- 纯前端：HTML + CSS + Vanilla JS（无框架，无构建工具）
- 暗色主题，紫色+金色品牌色，移动端优先
- 分析系统：localStorage 埋点，`#admin` 管理后台

## 部署
- 域名：www.topxnc.com
- GitHub Pages：Guixianqqian/direction-matcher（main 分支）
- CNAME 已配置

## 文件结构
```
index.html          — 入口，加载 CSS + JS
css/style.css       — 完整样式系统（Design Tokens + 响应式）
js/analytics.js     — localStorage 埋点分析（页面访问/转化漏斗/结果分布）
js/i18n.js          — 中英双语（中文先行）
js/data.js          — 12 题 + 25 赛道 + 匹配算法
js/app.js           — Store 状态管理 + Renderer 视图引擎
img/                — 微信/支付宝收款码 QR 图片
```

## 关键架构
- **Store**：单一状态源（currentStep, answers, results, paid, lang）
- **Matcher**：9 维度数值匹配 + 动机匹配 + 行业经验亲和 + 学习方式匹配
- **Renderer**：renderHome → renderQuiz → renderResult → showPayModal
- **Analytics**：全部事件存 localStorage，`#admin` 查看漏斗/热力图

## Git
```
路径：C:\Users\Money\tools\git\cmd\git.exe
Remote：https://github.com/Guixianqqian/direction-matcher.git
分支：main
```

## v1.0 已实现
- 12 题测评（全部 12 题参与匹配算法）
- 25 赛道库（含详细入门路径 + 用户画像）
- 付费墙 + 解锁码系统（UNLOCK_CODES: 2026, 1111-9999）
- Canvas 分享卡片（赚钱DNA）
- 管理后台（#admin）：转化漏斗/今日数据/热门结果/答题流失
- 案例墙 + 品牌标识 + 法律免责

## 已知改进方向 (v1.1+)
- 缺少 og-image.png（社交分享预览图）
- industryExp 和 learnStyle 匹配可进一步精细化
- 可添加英文完整支持
- 可对接真实支付（微信/支付宝 API）
