-- Per-user learning progress. Guests stay in localStorage; this table backs signed-in users.
create table if not exists public.learn_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.learn_progress enable row level security;

drop policy if exists "read own progress" on public.learn_progress;
create policy "read own progress" on public.learn_progress
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "insert own progress" on public.learn_progress;
create policy "insert own progress" on public.learn_progress
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "update own progress" on public.learn_progress;
create policy "update own progress" on public.learn_progress
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update on public.learn_progress to authenticated;
