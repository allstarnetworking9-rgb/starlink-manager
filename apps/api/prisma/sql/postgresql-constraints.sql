CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE UNIQUE INDEX IF NOT EXISTS customer_subscriptions_one_current_idx
ON customer_subscriptions (customer_id)
WHERE is_current = true;

ALTER TABLE customer_subscriptions
  ADD CONSTRAINT customer_subscriptions_billing_day_check
  CHECK (billing_day BETWEEN 1 AND 31);

ALTER TABLE customer_subscriptions
  ADD CONSTRAINT customer_subscriptions_duration_days_snapshot_check
  CHECK (duration_days_snapshot > 0);

ALTER TABLE customer_subscriptions
  ADD CONSTRAINT customer_subscriptions_expired_date_check
  CHECK (expired_date >= install_date);

ALTER TABLE packages
  ADD CONSTRAINT packages_price_check
  CHECK (price >= 0);

ALTER TABLE invoices
  ADD CONSTRAINT invoices_amount_check
  CHECK (
    subtotal >= 0
    AND discount_amount >= 0
    AND tax_amount >= 0
    AND total_amount >= 0
  );

ALTER TABLE invoices
  ADD CONSTRAINT invoices_due_date_check
  CHECK (due_date >= issue_date);

ALTER TABLE payments
  ADD CONSTRAINT payments_amount_check
  CHECK (amount >= 0);
