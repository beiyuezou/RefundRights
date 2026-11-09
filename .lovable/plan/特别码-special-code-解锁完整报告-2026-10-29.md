# 特别码（Special code）解锁完整报告

## 用户会看到什么
- 在付费遮罩的 "Unlock with PayPal" 按钮下方，加一个小链接 "Have a special code? / 有特别码？"。
- 点开后出现输入框 + "Redeem / 兑换" 按钮。码正确就立即解锁全文（和付款后一样）。
- 错误提示：码无效、已过期、已用完、尝试太频繁 — 全部有中英文（及其他界面语言）文案。

## 码怎么设定（你的选择）
- 一个固定通用码，直接免费解锁全文。
- 有总使用次数上限 + 到期日。
- 码本身由你通过安全表单填写（不出现在聊天和代码里）；次数上限和到期日存在后台，你告诉我数字，我来设置/修改。
- 同一个用户的同一个案件重复兑换不会重复扣次数。

## 需要你提供（开工后）
1. 码的内容（安全表单填写，建议 8 位以上、不易猜）。
2. 总次数上限（例如 100 次）。
3. 到期日（例如 2026-12-31）。

## 技术细节
- 秘密 `SPECIAL_UNLOCK_CODE`（add_secret）。
- 新表 `special_code_settings`（单行：max_uses, expires_at, active）和 `special_code_redemptions`（user_id, dispute_id 唯一, created_at），仅 service_role 可访问，RLS deny-all。
- 新 server fn `redeemSpecialCode`（requireSupabaseAuth）：校验案件归属、未付费；常数时间比较码；检查 active/到期/已用次数（在一个数据库函数里原子完成，防止并发超用）；写 redemption，`disputes.paid = true`，并在 `payments` 记一条 provider=`special_code`、金额 0 的记录便于对账；写审计 `special_code.redeemed` / `special_code.failed`；接入现有 rate-limit（每用户每小时 5 次失败）。
- `PaywallGate` 增加兑换 UI，成功后调用现有 `onPaid` 重新拉取报告。
- 所有 locale 文件加文案。
- 测试：错误码拒绝、过期拒绝、达上限拒绝、他人案件拒绝、同案重复兑换不扣次数。
- 更新 `AGENTS.md`：特别码只能在服务端校验，与 PayPal 共用 `paid` 标志。
