create extension if not exists citext;
create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('member', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.space_status as enum ('available', 'unavailable');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.booking_status as enum (
    'pending',
    'approved',
    'rejected',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email citext not null unique,
  password_hash text not null,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  description text not null,
  capacity integer not null check (capacity > 0),
  status public.space_status not null default 'available',
  amenities text[] not null default '{}',
  image_url text,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete restrict,
  member_id uuid not null references public.users(id) on delete cascade,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  status public.booking_status not null default 'pending',
  reviewed_at timestamptz,
  reviewed_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_time_order check (end_time > start_time)
);

create table if not exists public.refresh_sessions (
  id uuid primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create unique index if not exists active_booking_slot_unique
  on public.bookings (space_id, booking_date, start_time, end_time)
  where status in ('pending', 'approved');

create index if not exists bookings_member_id_idx
  on public.bookings (member_id);
create index if not exists bookings_space_date_idx
  on public.bookings (space_id, booking_date);
create index if not exists bookings_status_idx
  on public.bookings (status);
create index if not exists refresh_sessions_user_id_idx
  on public.refresh_sessions (user_id);
create index if not exists refresh_sessions_expires_at_idx
  on public.refresh_sessions (expires_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists spaces_set_updated_at on public.spaces;
create trigger spaces_set_updated_at
before update on public.spaces
for each row execute function public.set_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.spaces enable row level security;
alter table public.bookings enable row level security;
alter table public.refresh_sessions enable row level security;

-- The Express backend uses the server-only secret client. No anon/authenticated
-- table policies are created, so application data cannot be changed directly
-- from the browser.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'space-images',
  'space-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
