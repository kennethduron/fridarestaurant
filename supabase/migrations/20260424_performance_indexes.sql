-- Performance indexes for higher order volume.
-- Safe to run multiple times.

create index if not exists idx_orders_created_at_desc
  on public.orders(created_at desc);

create index if not exists idx_orders_payment_method_created_at
  on public.orders(payment_method, created_at desc);

create index if not exists idx_orders_updated_at_desc
  on public.orders(updated_at desc);

create index if not exists idx_order_status_events_order_id_created_at
  on public.order_status_events(order_id, created_at desc);

create index if not exists idx_notification_tokens_active_order_id
  on public.notification_tokens(order_id)
  where active = true;

create index if not exists idx_staff_notification_tokens_active_updated_at
  on public.staff_notification_tokens(updated_at desc)
  where active = true;

create index if not exists idx_staff_notification_tokens_active_platform_updated_at
  on public.staff_notification_tokens(platform, updated_at desc)
  where active = true;
