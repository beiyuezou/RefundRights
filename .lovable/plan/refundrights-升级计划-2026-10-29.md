# RefundRights 升级计划

目标：同时打动黑客松评委和真实付费用户。分 5 个阶段做，每个阶段完成后先检查，再进入下一阶段。

## 1. 语言精简（最先做，工作量小）
- 语言菜单只保留：简体中文、English、Nederlands。
- 删除泰语、印尼语、越南语、马来语的文字包；之前选了这些语言的用户自动改回英文。
- 荷兰语补齐目前缺少的界面文字。

## 2. 分析页视觉重做
- 页面顶部：案件标题、国家、金额，加上大号风险仪表（和首页示例卡风格一致）。
- "AI 结论"做成重点卡片；法律论点改为编号卡片，每张显示法条标签和来源。
- 邮件草稿放在像信纸一样的区域，编辑、复制、朗读按钮集中在一起。
- 未付费时：预览部分保持清楚，锁定部分做成模糊卡片，并显示"解锁后可获得"清单（PayPal 和特别码不变）。
- 手机端改成单列，主要操作按钮固定在底部。

## 3. 案件进度追踪
- 每个案件有状态：已提交 → 已发申诉 → 商家已回复 → 已升级投诉 → 已退款 / 已拒绝。
- 分析页加时间线：用户可以更新状态、写备注、记录退回金额。
- "我的案件"页面显示状态标签、下一步提示（例如"已发申诉 7 天，可以升级投诉了"）和追回总金额。

## 4. 导出 PDF 和发送申诉邮件
- **PDF**：付费后点击"下载报告"，生成排版好的报告（打印版式，浏览器"另存为 PDF"），内容包括结论、论点、来源和邮件。
- **发送邮件**：点击"用我的邮箱发送"，打开用户自己的邮箱，自动填好主题和正文；发送后案件状态自动变为"已发申诉"。邮件从用户本人邮箱发出，商家回复也直接到用户邮箱，不需要另外设置发信域名。

## 5. 信任与转化（首页 + 付款前）
- 新增"常见问题"板块：是否合法、数据安全、退款政策、AI 有哪些局限。
- "你会得到什么"对比：免费预览 vs 完整报告（US$9.90）。
- "由 NVIDIA Nemotron on Nebius 驱动"标识，以及"真实法律来源检索"说明（照顾评委）。
- **不编造**用户评价或成功率数字。等你有真实数据再加，现在先放已有的知识库示例案例。

## 需要你确认
- 售后退款政策目前还没定，常见问题里先写"联系我们处理"可以吗？
- 有没有真实的联系邮箱，可以放在常见问题里？

## Technical details
- Locales: drop th/id/vi/ms JSON + LANGUAGES entries; fallback unknown stored lang to `en`; AI output stays EN master + ZH translation (nl UI only, report language falls back to EN).
- Tracking: migration adding `disputes.status` (enum-like text with validation trigger), `recovered_amount`, plus `dispute_events` table (user_id uuid, dispute_id, status, note, created_at) with GRANTs + owner-only RLS.
- PDF: `/analysis/$disputeId/print` route with print stylesheet, content fetched via existing `getAnalysisReport` (paid only), `window.print()`.
- Email: `mailto:` with encoded subject/body from draft; on click, log a `dispute_events` row.
- Tests: status transition rules + paid-only print access added next to existing tests.
