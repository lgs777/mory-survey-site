create extension if not exists pgcrypto;

create table if not exists public.opinions (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  category text not null default '기타',
  hashtags text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.opinions enable row level security;

drop policy if exists "Public can insert opinions" on public.opinions;
create policy "Public can insert opinions"
on public.opinions
for insert
to anon, authenticated
with check (true);

drop policy if exists "Public can read approved opinions" on public.opinions;
create policy "Public can read approved opinions"
on public.opinions
for select
to anon, authenticated
using (status = 'approved');
