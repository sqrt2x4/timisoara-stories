create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'ro')),
  created_at timestamptz not null default now()
);

create table if not exists public.locations (
  id text primary key,
  name_en text not null,
  name_ro text not null,
  description_en text not null,
  description_ro text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  proximity_radius_m integer not null default 100 check (proximity_radius_m > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.stories (
  id text primary key,
  title_en text not null,
  title_ro text not null,
  description_en text not null,
  description_ro text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.story_fragments (
  id text primary key,
  story_id text not null references public.stories(id) on delete cascade,
  title_en text not null,
  title_ro text not null,
  text_en text not null,
  text_ro text not null,
  fragment_order integer not null check (fragment_order > 0),
  unique (story_id, fragment_order)
);

create table if not exists public.challenges (
  id text primary key,
  location_id text not null references public.locations(id) on delete cascade,
  fragment_id text not null references public.story_fragments(id) on delete cascade,
  prompt_en text not null,
  prompt_ro text not null,
  hint_en text not null,
  hint_ro text not null,
  active boolean not null default true
);

create table if not exists public.challenge_answers (
  id uuid primary key default gen_random_uuid(),
  challenge_id text not null references public.challenges(id) on delete cascade,
  answer_hash bytea not null,
  unique (challenge_id, answer_hash)
);

create table if not exists public.user_collections (
  user_id uuid not null references public.users(id) on delete cascade,
  fragment_id text not null references public.story_fragments(id) on delete cascade,
  collected_at timestamptz not null default now(),
  primary key (user_id, fragment_id)
);

create table if not exists public.challenge_completions (
  user_id uuid not null references public.users(id) on delete cascade,
  challenge_id text not null references public.challenges(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, challenge_id)
);

-- These composite primary keys make reward insertion idempotent: a player can
-- complete a challenge repeatedly, but the database can store it only once.
create unique index if not exists user_collections_reward_once
  on public.user_collections (user_id, fragment_id);
create unique index if not exists challenge_completions_once
  on public.challenge_completions (user_id, challenge_id);

alter table public.users enable row level security;
alter table public.user_collections enable row level security;
alter table public.challenge_completions enable row level security;

drop policy if exists "Users can read their own profile" on public.users;
drop policy if exists "Users can read their own collection" on public.user_collections;
drop policy if exists "Users can read their own completions" on public.challenge_completions;
drop policy if exists "Anyone can read active locations" on public.locations;
drop policy if exists "Anyone can read stories" on public.stories;
drop policy if exists "Anyone can read story fragments" on public.story_fragments;
drop policy if exists "Anyone can read active challenges" on public.challenges;

create policy "Users can read their own profile"
  on public.users for select using (auth.uid() = id);
create policy "Users can read their own collection"
  on public.user_collections for select using (auth.uid() = user_id);
create policy "Users can read their own completions"
  on public.challenge_completions for select using (auth.uid() = user_id);

create policy "Anyone can read active locations"
  on public.locations for select using (true);
create policy "Anyone can read stories"
  on public.stories for select using (true);
create policy "Anyone can read story fragments"
  on public.story_fragments for select using (true);
create policy "Anyone can read active challenges"
  on public.challenges for select using (active = true);
