-- ==============================================================================
-- HIGH-PERFORMANCE INDEXES & AGGREGATE OPTIMIZATIONS
-- ==============================================================================

-- 1. Ensure composite indexes for user_id + date & user_id + category_id exist
create index if not exists idx_transactions_user_date_desc 
  on public.transactions (user_id, date desc);

create index if not exists idx_transactions_user_cat_date 
  on public.transactions (user_id, category_id, date desc);

create index if not exists idx_transactions_user_trip_date 
  on public.transactions (user_id, trip_id, date desc);

create index if not exists idx_budgets_user_month_year 
  on public.budgets (user_id, month, year);

create index if not exists idx_categories_user_type 
  on public.categories (user_id, type);

create index if not exists idx_trips_user_dates 
  on public.trips (user_id, start_date desc, end_date desc);

create index if not exists idx_trip_items_trip_user 
  on public.trip_items (trip_id, user_id, date asc);

