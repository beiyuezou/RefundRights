# PayPal: current status and next steps

## Where it stands
- Done: payments table, "paid" flag on each case, PayPal button inside an "Unlock full report" overlay on the analysis page, payment record + capture logic, PayPal notification receiver.
- Not done: PayPal keys are not saved, so the button shows "PayPal is not configured". No Sandbox payment has ever been tested.
- Known gaps:
  1. Locked content is only blurred — the full text still reaches the browser, so a savvy user can read it without paying.
  2. Payment confirmation does not double-check amount, currency and that the PayPal order belongs to that case.
  3. Price US$9.90 per case was never confirmed by you.

## What I need from you
1. PayPal Sandbox **Client ID** and **Client Secret** (developer.paypal.com > Apps & Credentials > Sandbox app).
2. **Webhook ID**: in the same app, add a webhook to `https://refund-right.lovable.app/api/public/paypal-webhook` with event `PAYMENT.CAPTURE.COMPLETED`, then copy its ID.
3. Confirm the price (US$9.90 one-time per case, or another amount).
4. A Sandbox buyer account (personal) to log in during the test checkout.

All keys go through the secure form, never in chat.

## Updates I will make
1. Request the four settings securely (Client ID, Secret, Webhook ID, mode = sandbox).
2. Server-side paywall: the analysis page receives only the free preview (verdict summary, risk level) until paid; full arguments, strategy, email draft and sources are sent only after payment.
3. Harden confirmation: verify amount, currency, order-to-case link; ignore repeat notifications; never mark a case paid twice.
4. Fix the PayPal button's leftover type issues and show translated error messages.
5. Add small tests for price/currency and "only the owner's paid case unlocks".
6. Run a full Sandbox purchase end to end and confirm the report unlocks instantly.
7. After you approve the Sandbox result, switch to Live by changing mode and Live keys.

Refund/cancellation policy stays out of scope for now.
