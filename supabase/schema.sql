-- Enable pgvector extension
create extension if not exists vector;

-- Profiles table (extends auth.users)
-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  availability_note text, -- General preferences for meeting times
  linkedin_url text,
  struggle text,
  helping_others text,
  expertise text[],
  hobbies text[],
  embedding vector(768), -- Gemini text-embedding-004
  role text default 'member' check (role in ('admin', 'member')),
  timezone text default 'UTC',
  created_at timestamptz default now(),
  updated_at timestamptz,
  primary key (id)
);

-- Invitations table (for bulk inviting users)
create table public.invitations (
  id uuid not null default gen_random_uuid(),
  email text unique not null,
  name text,
  linkedin_url text,
  community_id uuid references public.communities(id),
  status text default 'pending' check (status in ('pending', 'registered')),
  created_at timestamptz default now(),
  primary key (id)
);

-- App Config (Singleton for global settings like AI Prompts)
create table public.app_config (
  id int primary key default 1 check (id = 1), -- Enforce singleton
  ai_script jsonb, -- The facilitator instructions
  updated_at timestamptz default now()
);

-- Feedback (Post-meeting ratings)
create table public.feedback (
  id uuid not null default gen_random_uuid(),
  match_id uuid references public.matches(id),
  user_id uuid references public.profiles(id),
  rating int check (rating >= 1 and rating <= 5),
  did_connect boolean, -- "Did you make a meaningful connection?"
  comments text,
  created_at timestamptz default now(),
  primary key (id)
);

-- Communities table (for white-labeling)
create table public.communities (
  id uuid not null default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text,
  welcome_message text,
  created_at timestamptz default now(),
  primary key (id)
);

-- Time Slots (Menu of valid meeting times)
create table public.time_slots (
  id uuid not null default gen_random_uuid(),
  community_id uuid references public.communities(id),
  day_of_week int not null check (day_of_week between 0 and 6), -- 0=Sun
  time_utc time not null,
  created_at timestamptz default now(),
  primary key (id)
);

-- User Availability (Persistent weekly preferences)
create table public.user_availability (
  user_id uuid references public.profiles(id) on delete cascade,
  slot_id uuid references public.time_slots(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, slot_id)
);

-- Event Series (Themed campaigns spanning a date range)
create table public.event_series (
  id uuid not null default gen_random_uuid(),
  community_id uuid references public.communities(id),
  title text not null,
  slug text not null,
  description text, -- Rich text HTML
  poster_url text,
  start_date timestamptz not null,
  end_date timestamptz not null,
  location_type text default 'online' check (location_type in ('online', 'in_person')),
  location_address text,
  ai_script_override jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  primary key (id)
);

-- Matches (Triads)
create table public.matches (
  id uuid not null default gen_random_uuid(),
  community_id uuid references public.communities(id),
  event_series_id uuid references public.event_series(id), -- Link to specific event series
  scheduled_at timestamptz not null,
  status text default 'scheduled', -- scheduled, completed, cancelled
  created_at timestamptz default now(),
  primary key (id)
);

-- Match Participants (Join table for users in a match)
create table public.match_participants (
  match_id uuid references public.matches(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (match_id, user_id)
);

-- Meetings (Optional, but good for storing meeting metadata/summary)
create table public.meetings (
  id uuid not null default gen_random_uuid(),
  match_id uuid references public.matches(id),
  recording_url text,
  summary text,
  luck_score int,
  created_at timestamptz default now(),
  primary key (id)
);

-- Matching Function
create or replace function match_profiles (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  linkedin_url text,
  struggle text,
  helping_others text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    profiles.id,
    profiles.linkedin_url,
    profiles.struggle,
    profiles.helping_others,
    1 - (profiles.embedding <=> query_embedding) as similarity
  from profiles
  where 1 - (profiles.embedding <=> query_embedding) > match_threshold
  order by profiles.embedding <=> query_embedding
  limit match_count;
end;
$$;
