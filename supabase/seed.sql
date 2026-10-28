-- ==============================================================================
-- SPENDWISE DEMO SEED DATA SCRIPT
-- Seeds realistic Indian Rupees (₹) transactions, categories, budgets, and trips
-- ==============================================================================

do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-000000000001';
  cat_salary uuid;
  cat_freelance uuid;
  cat_food uuid;
  cat_rent uuid;
  cat_transport uuid;
  cat_shopping uuid;
  cat_bills uuid;
  cat_health uuid;
  cat_entertainment uuid;
  cat_travel uuid;
  trip_goa uuid;
  cur_month integer := extract(month from current_date)::integer;
  cur_year integer := extract(year from current_date)::integer;
begin
  -- 1. Insert Profile
  insert into public.profiles (id, email, full_name, currency)
  values (demo_user_id, 'demo@spendwise.app', 'Aarav Sharma', 'INR')
  on conflict (id) do update set full_name = excluded.full_name;

  -- 2. Insert Categories
  delete from public.categories where user_id = demo_user_id;

  insert into public.categories (user_id, name, type, color, icon, is_default)
  values (demo_user_id, 'Salary', 'income', '#10b981', 'briefcase', true) returning id into cat_salary;

  insert into public.categories (user_id, name, type, color, icon, is_default)
  values (demo_user_id, 'Freelance', 'income', '#06b6d4', 'laptop', true) returning id into cat_freelance;

  insert into public.categories (user_id, name, type, color, icon, is_default)
  values (demo_user_id, 'Food & Dining', 'expense', '#f97316', 'utensils', true) returning id into cat_food;

  insert into public.categories (user_id, name, type, color, icon, is_default)
  values (demo_user_id, 'Rent & Housing', 'expense', '#8b5cf6', 'home', true) returning id into cat_rent;

  insert into public.categories (user_id, name, type, color, icon, is_default)
  values (demo_user_id, 'Transport', 'expense', '#3b82f6', 'car', true) returning id into cat_transport;

  insert into public.categories (user_id, name, type, color, icon, is_default)
  values (demo_user_id, 'Shopping', 'expense', '#ec4899', 'shopping-bag', true) returning id into cat_shopping;

  insert into public.categories (user_id, name, type, color, icon, is_default)
  values (demo_user_id, 'Bills & Utilities', 'expense', '#eab308', 'receipt', true) returning id into cat_bills;

  insert into public.categories (user_id, name, type, color, icon, is_default)
  values (demo_user_id, 'Health & Medical', 'expense', '#ef4444', 'heart-pulse', true) returning id into cat_health;

  insert into public.categories (user_id, name, type, color, icon, is_default)
  values (demo_user_id, 'Entertainment', 'expense', '#a855f7', 'film', true) returning id into cat_entertainment;

  insert into public.categories (user_id, name, type, color, icon, is_default)
  values (demo_user_id, 'Travel', 'expense', '#14b8a6', 'plane', true) returning id into cat_travel;

  -- 3. Insert Trip
  delete from public.trips where user_id = demo_user_id;

  insert into public.trips (user_id, name, destination, start_date, end_date, total_budget, status, notes)
  values (
    demo_user_id,
    'Goa Beach Holiday',
    'North Goa & Panaji',
    current_date - interval '2 days',
    current_date + interval '3 days',
    45000.00,
    'ongoing',
    'Stay at Candolim beach resort, water sports at Calangute and seafood dinner at Britto''s'
  ) returning id into trip_goa;

  -- 4. Trip Items (Itinerary)
  insert into public.trip_items (trip_id, user_id, date, title, location, estimated_cost, notes) values
    (trip_goa, demo_user_id, current_date - interval '2 days', 'Flight BLR to GOI', 'Bangalore Airport', 12000.00, 'Indigo morning flight 6E-241'),
    (trip_goa, demo_user_id, current_date - interval '1 days', 'Resort Check-in & Beachside Dinner', 'Candolim Beach', 18000.00, '3 nights sea view suite'),
    (trip_goa, demo_user_id, current_date, 'Scuba Diving & Watersports', 'Grand Island', 7500.00, 'Includes gear rental and underwater video'),
    (trip_goa, demo_user_id, current_date + interval '1 days', 'Old Goa Heritage Walk & Spice Plantation', 'Old Goa', 3500.00, 'Basilica of Bom Jesus & traditional buffet'),
    (trip_goa, demo_user_id, current_date + interval '2 days', 'Sunset Cruise & Souvenir Shopping', 'Mandovi River Panjim', 4000.00, 'Cashew nuts, feni, handicrafts');

  -- 5. Budgets for Current Month
  delete from public.budgets where user_id = demo_user_id;

  insert into public.budgets (user_id, category_id, amount, month, year) values
    (demo_user_id, cat_food, 18000.00, cur_month, cur_year),
    (demo_user_id, cat_rent, 32000.00, cur_month, cur_year),
    (demo_user_id, cat_transport, 6000.00, cur_month, cur_year),
    (demo_user_id, cat_shopping, 15000.00, cur_month, cur_year),
    (demo_user_id, cat_bills, 8000.00, cur_month, cur_year),
    (demo_user_id, cat_entertainment, 7000.00, cur_month, cur_year),
    (demo_user_id, cat_travel, 50000.00, cur_month, cur_year);

  -- 6. Insert Transactions
  delete from public.transactions where user_id = demo_user_id;

  -- Monthly Salaries & Incomes (last 3 months)
  insert into public.transactions (user_id, category_id, type, amount, date, payment_method, notes) values
    (demo_user_id, cat_salary, 'income', 125000.00, date_trunc('month', current_date)::date + 1, 'Bank', 'Monthly Tech Lead Salary credit'),
    (demo_user_id, cat_freelance, 'income', 35000.00, date_trunc('month', current_date)::date + 12, 'UPI', 'Full-stack consulting payout'),
    (demo_user_id, cat_salary, 'income', 125000.00, (date_trunc('month', current_date) - interval '1 month')::date + 1, 'Bank', 'Previous month salary'),
    (demo_user_id, cat_freelance, 'income', 28000.00, (date_trunc('month', current_date) - interval '1 month')::date + 15, 'UPI', 'Design system contract'),
    (demo_user_id, cat_salary, 'income', 120000.00, (date_trunc('month', current_date) - interval '2 months')::date + 1, 'Bank', 'Quarterly regular salary');

  -- Current Month Regular Expenses
  insert into public.transactions (user_id, category_id, type, amount, date, payment_method, notes) values
    (demo_user_id, cat_rent, 'expense', 32000.00, date_trunc('month', current_date)::date + 2, 'Bank', 'Apartment Rent via NEFT'),
    (demo_user_id, cat_bills, 'expense', 2450.00, date_trunc('month', current_date)::date + 5, 'UPI', 'Electricity bill BESCOM'),
    (demo_user_id, cat_bills, 'expense', 1199.00, date_trunc('month', current_date)::date + 6, 'UPI', 'Airtel Fiber 200Mbps broadband'),
    (demo_user_id, cat_food, 'expense', 1450.00, date_trunc('month', current_date)::date + 7, 'Card', 'Weekend groceries Nature''s Basket'),
    (demo_user_id, cat_food, 'expense', 860.00, date_trunc('month', current_date)::date + 9, 'UPI', 'Swiggy gourmet dinner order'),
    (demo_user_id, cat_transport, 'expense', 2500.00, date_trunc('month', current_date)::date + 10, 'Card', 'Shell Petrol bunk refill'),
    (demo_user_id, cat_shopping, 'expense', 5499.00, date_trunc('month', current_date)::date + 11, 'Card', 'Ergonomic keyboard from Amazon'),
    (demo_user_id, cat_entertainment, 'expense', 950.00, date_trunc('month', current_date)::date + 13, 'UPI', 'PVR IMAX movie tickets'),
    (demo_user_id, cat_food, 'expense', 1850.00, date_trunc('month', current_date)::date + 15, 'Card', 'Sunday brunch with friends');

  -- Trip-Tagged Expenses
  insert into public.transactions (user_id, category_id, trip_id, type, amount, date, payment_method, notes) values
    (demo_user_id, cat_travel, trip_goa, 'expense', 11800.00, current_date - interval '2 days', 'Card', 'Flight tickets Indigo return'),
    (demo_user_id, cat_travel, trip_goa, 'expense', 16500.00, current_date - interval '1 days', 'Card', 'Candolim Resort booking advance'),
    (demo_user_id, cat_food, trip_goa, 'expense', 2340.00, current_date - interval '1 days', 'UPI', 'Fisherman''s Wharf sea food dinner'),
    (demo_user_id, cat_travel, trip_goa, 'expense', 6500.00, current_date, 'Cash', 'Grand Island scuba diving package');

end $$;
