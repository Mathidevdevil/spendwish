-- ==============================================================================
-- SPENDWISE DATABASE SCHEMA MIGRATION
-- Production-ready Personal Finance & Travel Management App
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  currency text not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  color text default '#64748b',
  icon text default 'tag',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. TRIPS TABLE
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  total_budget numeric(12,2) not null default 0.00 check (total_budget >= 0),
  status text not null default 'planned' check (status in ('planned', 'ongoing', 'completed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. TRIP ITINERARY ITEMS TABLE
create table if not exists public.trip_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  title text not null,
  location text,
  estimated_cost numeric(12,2) not null default 0.00 check (estimated_cost >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. TRANSACTIONS TABLE
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  trip_id uuid references public.trips(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12,2) not null check (amount > 0),
  date date not null default current_date,
  payment_method text not null check (payment_method in ('Cash', 'UPI', 'Card', 'Bank')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. BUDGETS TABLE
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  month integer not null check (month between 1 and 12),
  year integer not null check (year between 2000 and 2100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_user_category_month_year unique (user_id, category_id, month, year)
);

-- ==============================================================================
-- INDEXES
-- Optimized for high-throughput queries, filtering, and aggregates
-- ==============================================================================
create index if not exists idx_transactions_user_date on public.transactions(user_id, date desc);
create index if not exists idx_transactions_user_category on public.transactions(user_id, category_id);
create index if not exists idx_transactions_user_trip on public.transactions(user_id, trip_id);
create index if not exists idx_budgets_user_date on public.budgets(user_id, year, month);
create index if not exists idx_categories_user on public.categories(user_id);
create index if not exists idx_trips_user on public.trips(user_id, start_date desc);
create index if not exists idx_trip_items_trip on public.trip_items(trip_id, date asc);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict isolation: users can ONLY access and modify their own records
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.trips enable row level security;
alter table public.trip_items enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

-- Profiles Policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Categories Policies
create policy "Users can view their own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- Trips Policies
create policy "Users can view their own trips"
  on public.trips for select
  using (auth.uid() = user_id);

create policy "Users can insert their own trips"
  on public.trips for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own trips"
  on public.trips for update
  using (auth.uid() = user_id);

create policy "Users can delete their own trips"
  on public.trips for delete
  using (auth.uid() = user_id);

-- Trip Items Policies
create policy "Users can view their own trip items"
  on public.trip_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own trip items"
  on public.trip_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own trip items"
  on public.trip_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own trip items"
  on public.trip_items for delete
  using (auth.uid() = user_id);

-- Transactions Policies
create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Budgets Policies
create policy "Users can view their own budgets"
  on public.budgets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own budgets"
  on public.budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own budgets"
  on public.budgets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own budgets"
  on public.budgets for delete
  using (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC TRIGGERS
-- 1. Create Profile on Signup
-- 2. Seed Default Categories on User Creation:
--    Salary, Freelance, Food, Rent, Transport, Shopping, Bills, Health, Entertainment, Travel, Other
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- 1. Create Profile
  insert into public.profiles (id, email, full_name, currency)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'INR'
  )
  on conflict (id) do nothing;

  -- 2. Seed Default Categories
  insert into public.categories (user_id, name, type, color, icon, is_default) values
    -- Income categories
    (new.id, 'Salary', 'income', '#10b981', 'briefcase', true),
    (new.id, 'Freelance', 'income', '#06b6d4', 'laptop', true),
    -- Expense categories
    (new.id, 'Food', 'expense', '#f97316', 'utensils', true),
    (new.id, 'Rent', 'expense', '#8b5cf6', 'home', true),
    (new.id, 'Transport', 'expense', '#3b82f6', 'car', true),
    (new.id, 'Shopping', 'expense', '#ec4899', 'shopping-bag', true),
    (new.id, 'Bills', 'expense', '#eab308', 'receipt', true),
    (new.id, 'Health', 'expense', '#ef4444', 'heart-pulse', true),
    (new.id, 'Entertainment', 'expense', '#a855f7', 'film', true),
    (new.id, 'Travel', 'expense', '#14b8a6', 'plane', true),
    (new.id, 'Other', 'expense', '#64748b', 'more-horizontal', true);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger firing on auth.users creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger helper
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();
create trigger update_categories_updated_at before update on public.categories for each row execute function public.update_updated_at_column();
create trigger update_transactions_updated_at before update on public.transactions for each row execute function public.update_updated_at_column();
create trigger update_budgets_updated_at before update on public.budgets for each row execute function public.update_updated_at_column();
create trigger update_trips_updated_at before update on public.trips for each row execute function public.update_updated_at_column();
create trigger update_trip_items_updated_at before update on public.trip_items for each row execute function public.update_updated_at_column();

-- ==============================================================================
-- POSTGRES RPC AGGREGATE FUNCTIONS
-- Aggregation happens strictly in the database, avoiding browser load
-- ==============================================================================

-- 1. Monthly Totals Summary RPC
create or replace function public.get_monthly_summary(
  p_user_id uuid,
  p_month integer,
  p_year integer
)
returns table (
  total_income numeric(12,2),
  total_expense numeric(12,2),
  net_savings numeric(12,2),
  savings_rate numeric(5,2)
)
language plpgsql
security definer
as $$
declare
  v_income numeric(12,2) := 0.00;
  v_expense numeric(12,2) := 0.00;
  v_savings numeric(12,2) := 0.00;
  v_rate numeric(5,2) := 0.00;
begin
  -- Total Income
  select coalesce(sum(amount), 0.00)
  into v_income
  from public.transactions
  where user_id = p_user_id
    and type = 'income'
    and extract(month from date) = p_month
    and extract(year from date) = p_year;

  -- Total Expense
  select coalesce(sum(amount), 0.00)
  into v_expense
  from public.transactions
  where user_id = p_user_id
    and type = 'expense'
    and extract(month from date) = p_month
    and extract(year from date) = p_year;

  v_savings := v_income - v_expense;
  
  if v_income > 0 then
    v_rate := round(((v_savings / v_income) * 100)::numeric, 2);
  else
    v_rate := 0.00;
  end if;

  return query select v_income, v_expense, v_savings, v_rate;
end;
$$;

-- 2. Category Breakdown RPC for a given month
create or replace function public.get_category_breakdown(
  p_user_id uuid,
  p_month integer,
  p_year integer
)
returns table (
  category_id uuid,
  category_name text,
  category_color text,
  category_icon text,
  total_amount numeric(12,2),
  percentage numeric(5,2)
)
language plpgsql
security definer
as $$
declare
  v_total_expense numeric(12,2) := 0.00;
begin
  select coalesce(sum(amount), 0.00)
  into v_total_expense
  from public.transactions
  where user_id = p_user_id
    and type = 'expense'
    and extract(month from date) = p_month
    and extract(year from date) = p_year;

  return query
  select 
    c.id as category_id,
    c.name as category_name,
    c.color as category_color,
    c.icon as category_icon,
    coalesce(sum(t.amount), 0.00)::numeric(12,2) as total_amount,
    case 
      when v_total_expense > 0 then
        round(((sum(t.amount) / v_total_expense) * 100)::numeric, 2)
      else 0.00
    end as percentage
  from public.transactions t
  left join public.categories c on t.category_id = c.id
  where t.user_id = p_user_id
    and t.type = 'expense'
    and extract(month from t.date) = p_month
    and extract(year from t.date) = p_year
  group by c.id, c.name, c.color, c.icon
  order by total_amount desc;
end;
$$;

-- 3. Six-Month Trend RPC
create or replace function public.get_six_month_trend(
  p_user_id uuid,
  p_end_date date default current_date
)
returns table (
  month_label text,
  month_num integer,
  year_num integer,
  total_income numeric(12,2),
  total_expense numeric(12,2)
)
language plpgsql
security definer
as $$
begin
  return query
  with months as (
    select 
      to_char(d, 'Mon YY') as m_label,
      extract(month from d)::integer as m_num,
      extract(year from d)::integer as y_num,
      date_trunc('month', d)::date as m_start,
      (date_trunc('month', d) + interval '1 month - 1 day')::date as m_end
    from generate_series(
      date_trunc('month', p_end_date) - interval '5 months',
      date_trunc('month', p_end_date),
      interval '1 month'
    ) d
  )
  select 
    m.m_label as month_label,
    m.m_num as month_num,
    m.y_num as year_num,
    coalesce(sum(case when t.type = 'income' then t.amount else 0 end), 0.00)::numeric(12,2) as total_income,
    coalesce(sum(case when t.type = 'expense' then t.amount else 0 end), 0.00)::numeric(12,2) as total_expense
  from months m
  left join public.transactions t on t.user_id = p_user_id 
    and t.date >= m.m_start and t.date <= m.m_end
  group by m.m_label, m.m_num, m.y_num, m.m_start
  order by m.m_start asc;
end;
$$;

-- 4. Daily Spending for Month RPC
create or replace function public.get_daily_spend(
  p_user_id uuid,
  p_month integer,
  p_year integer
)
returns table (
  day integer,
  date date,
  total_expense numeric(12,2)
)
language plpgsql
security definer
as $$
declare
  v_start date := make_date(p_year, p_month, 1);
  v_end date := (v_start + interval '1 month - 1 day')::date;
begin
  return query
  with days as (
    select d::date as day_date, extract(day from d)::integer as day_num
    from generate_series(v_start, v_end, interval '1 day') d
  )
  select 
    days.day_num as day,
    days.day_date as date,
    coalesce(sum(t.amount), 0.00)::numeric(12,2) as total_expense
  from days
  left join public.transactions t on t.user_id = p_user_id
    and t.type = 'expense'
    and t.date = days.day_date
  group by days.day_num, days.day_date
  order by days.day_num asc;
end;
$$;

-- 5. Trip Planned vs Actual Spend RPC
create or replace function public.get_trip_summary(
  p_user_id uuid,
  p_trip_id uuid
)
returns table (
  trip_id uuid,
  name text,
  destination text,
  start_date date,
  end_date date,
  status text,
  total_budget numeric(12,2),
  itinerary_estimated_cost numeric(12,2),
  actual_spend numeric(12,2),
  remaining_budget numeric(12,2),
  percent_budget_used numeric(5,2)
)
language plpgsql
security definer
as $$
begin
  return query
  with trip_data as (
    select * from public.trips 
    where id = p_trip_id and user_id = p_user_id
  ),
  itinerary as (
    select coalesce(sum(estimated_cost), 0.00) as est_cost
    from public.trip_items
    where trip_id = p_trip_id and user_id = p_user_id
  ),
  actuals as (
    select coalesce(sum(amount), 0.00) as act_spend
    from public.transactions
    where trip_id = p_trip_id and user_id = p_user_id and type = 'expense'
  )
  select 
    t.id as trip_id,
    t.name,
    t.destination,
    t.start_date,
    t.end_date,
    t.status,
    t.total_budget,
    i.est_cost as itinerary_estimated_cost,
    a.act_spend as actual_spend,
    (t.total_budget - a.act_spend)::numeric(12,2) as remaining_budget,
    case 
      when t.total_budget > 0 then
        round(((a.act_spend / t.total_budget) * 100)::numeric, 2)
      else 0.00
    end as percent_budget_used
  from trip_data t
  cross join itinerary i
  cross join actuals a;
end;
$$;
