create table public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  title text not null,
  description text,
  category text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.timeline_events enable row level security;

create policy "select_own" on public.timeline_events
  for select using (auth.uid() = user_id);

create policy "insert_own" on public.timeline_events
  for insert with check (auth.uid() = user_id);

create policy "update_own" on public.timeline_events
  for update using (auth.uid() = user_id);

create policy "delete_own" on public.timeline_events
  for delete using (auth.uid() = user_id);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger timeline_events_updated_at
  before update on public.timeline_events
  for each row execute procedure update_updated_at();
