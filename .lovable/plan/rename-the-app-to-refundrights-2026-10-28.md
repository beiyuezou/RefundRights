# Rename the app to RefundRights

Change every visible "RefundRight" to "RefundRights". That is 23 places across 11 files:
- Header logo text and footer
- Page titles and the descriptions shown when someone shares a link: home, wizard, dashboard, analysis, sign-in, knowledge base and articles
- English and Chinese interface text
- The PayPal checkout description, so buyers see the new name
- The README for the hackathon judges

## Not changed
- Your published web address (refund-right.lovable.app) stays the same. You can change it separately in the project settings.
- The internal project name in Lovable settings stays the same.
- Complaint emails already generated keep whatever text they had.

## Technical details
- Exact-word replace of `RefundRight` with `RefundRights` in all source files except the generated route tree. A word boundary stops "RefundRights" from becoming "RefundRightss".
- Update the project knowledge name and save the brand name to memory.
