# Project TODO

## Latest target
- Replace the **TransactionTable “Status”** column/filter/summary logic to show something else instead of `transaction.status`.

## Steps
1. Update `component/TransactionTable.jsx`
   - Replace `status` column with `type` (debit/credit) as the “something else”.
   - Update pill UI, filters, and summary cards accordingly.
2. Run `npm run lint -- --max-warnings=0`.
3. Run `npm run build`.


