-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Timeline events
create table public.timeline_events (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  title       text not null,
  description text,
  category    text not null check (category in ('pro', 'personnel', 'formation', 'famille', 'voyage', 'créatif', 'intime')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS
alter table public.timeline_events enable row level security;

create policy "users can manage their own events"
  on public.timeline_events
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_timeline_events_updated
  before update on public.timeline_events
  for each row execute function public.handle_updated_at();

-- Index for sorted queries
create index timeline_events_user_date on public.timeline_events(user_id, date desc);
