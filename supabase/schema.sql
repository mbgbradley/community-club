-- Starter schema for the real (phase 2) version. Run in Supabase SQL Editor.
create extension if not exists postgis;

create table communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  center_point geography(point,4326),
  radius_meters int default 25000,
  is_private boolean default true
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  avatar_url text,
  bio text,
  verified_status boolean default false
);

create type member_role as enum ('local','weekender','visitor','business_owner','moderator');
create type member_status as enum ('pending','approved');

create table community_memberships (
  user_id uuid references profiles(id) on delete cascade,
  community_id uuid references communities(id) on delete cascade,
  role member_role not null default 'local',
  status member_status not null default 'pending',
  vouched_by_user_id uuid references profiles(id),
  trial_ends_at timestamptz default (now() + interval '30 days'),
  primary key (user_id, community_id)
);

create table invite_codes (
  code text primary key,
  community_id uuid references communities(id),
  created_by uuid references profiles(id),
  used_by uuid references profiles(id)
);

create table businesses (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) on delete cascade,
  owner_id uuid references profiles(id),
  name text not null,
  category text,
  description text,
  address text,
  location geography(point,4326),
  is_claimed boolean default false
);

create table business_follows (
  user_id uuid references profiles(id) on delete cascade,
  business_id uuid references businesses(id) on delete cascade,
  primary key (user_id, business_id)
);

create type post_type as enum ('qa','event','classified','garage_sale','deal');
create table posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) on delete cascade,
  author_id uuid references profiles(id),
  business_id uuid references businesses(id),
  type post_type not null,
  title text not null,
  body text,
  metadata jsonb default '{}'::jsonb,   -- start_time, price, promo_code, expires, etc.
  parent_id uuid references posts(id),  -- answers to a question
  created_at timestamptz default now()
);

create table rentals (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) on delete cascade,
  landlord_id uuid references profiles(id),
  title text, address text,
  coordinates geography(point,4326),
  monthly_rent int,
  availability_status text default 'available',
  specs jsonb default '{}'::jsonb
);

create table rental_tenancies (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid references rentals(id) on delete cascade,
  tenant_id uuid references profiles(id),
  start_date date, end_date date,
  confirmed_by_landlord boolean default false,
  confirmed_by_tenant boolean default false
);

create type review_target as enum ('business','landlord','tenant','driver');
create table reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid references profiles(id),
  target_type review_target not null,
  target_id uuid not null,
  rating int check (rating between 1 and 5),
  comment text,
  context_id uuid,  -- rental_tenancy or ride id; required for landlord/tenant/driver reviews
  created_at timestamptz default now()
);

create type ride_mode as enum ('request','offer');
create table rides (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) on delete cascade,
  author_id uuid references profiles(id),
  mode ride_mode not null,
  origin_point geography(point,4326), origin_text text,
  destination_point geography(point,4326), destination_text text,
  departure_window tstzrange,
  seats_available int, general_area_notes text,
  status text default 'open'
);

create table ride_responses (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid references rides(id) on delete cascade,
  responder_id uuid references profiles(id),
  message text,
  status text default 'pending'  -- pending, accepted, declined
);

-- ===== Row-Level Security: only approved members can read/write community content =====
create or replace function is_member(cid uuid) returns boolean
language sql stable security definer as $$
  select exists (select 1 from community_memberships m
    where m.user_id = auth.uid() and m.community_id = cid and m.status = 'approved');
$$;

alter table communities enable row level security;
alter table profiles enable row level security;
alter table community_memberships enable row level security;
alter table businesses enable row level security;
alter table business_follows enable row level security;
alter table posts enable row level security;
alter table rentals enable row level security;
alter table rental_tenancies enable row level security;
alter table reviews enable row level security;
alter table rides enable row level security;
alter table ride_responses enable row level security;

create policy "communities readable" on communities for select using (true);
create policy "own profile" on profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own memberships" on community_memberships for select using (user_id = auth.uid());

create policy "members read businesses" on businesses for select using (is_member(community_id));
create policy "members add businesses" on businesses for insert with check (is_member(community_id));
create policy "own follows" on business_follows for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Public teaser: events are visible to anyone; everything else is members only.
create policy "events public" on posts for select using (type = 'event');
create policy "members read posts" on posts for select using (is_member(community_id));
create policy "members write posts" on posts for insert with check (is_member(community_id) and author_id = auth.uid());

create policy "members read rentals" on rentals for select using (is_member(community_id));
create policy "landlord writes rentals" on rentals for insert with check (is_member(community_id) and landlord_id = auth.uid());
create policy "parties see tenancies" on rental_tenancies for select
  using (tenant_id = auth.uid() or exists (select 1 from rentals r where r.id = rental_id and r.landlord_id = auth.uid()));

create policy "members read reviews" on reviews for select using (auth.uid() is not null);
create policy "members write reviews" on reviews for insert with check (reviewer_id = auth.uid());

create policy "members read rides" on rides for select using (is_member(community_id));
create policy "members write rides" on rides for insert with check (is_member(community_id) and author_id = auth.uid());
create policy "ride parties read responses" on ride_responses for select
  using (responder_id = auth.uid() or exists (select 1 from rides r where r.id = ride_id and r.author_id = auth.uid()));
create policy "members respond" on ride_responses for insert with check (responder_id = auth.uid());

-- Spatial indexes for radius queries
create index on businesses using gist (location);
create index on rentals using gist (coordinates);
create index on rides using gist (origin_point);
