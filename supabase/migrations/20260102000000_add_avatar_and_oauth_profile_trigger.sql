-- ==============================================================================
-- ADD AVATAR_URL TO PROFILES & ENHANCE USER CREATION TRIGGER FOR OAUTH
-- ==============================================================================

-- 1. Add avatar_url column to profiles if not exists
alter table public.profiles
  add column if not exists avatar_url text;

-- 2. Update handle_new_user function to extract full_name and avatar_url from raw_user_meta_data
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_full_name text;
  user_avatar text;
begin
  user_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  user_avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture'
  );

  -- 1. Create or update profile
  insert into public.profiles (id, email, full_name, avatar_url, currency)
  values (
    new.id,
    new.email,
    user_full_name,
    user_avatar,
    'INR'
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    email = excluded.email,
    updated_at = now();

  -- 2. Seed Default Categories if user has none
  if not exists (select 1 from public.categories where user_id = new.id) then
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
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- 3. Ensure trigger is attached to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

