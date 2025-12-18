-- Enable pgvector extension
create extension if not exists vector;

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  linkedin_url text,
  struggle text,
  helping_others text,
  expertise text[],
  hobbies text[],
  embedding vector(1536), -- assuming openai text-embedding-3-small
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

-- Matches (Triads)
create table public.matches (
  id uuid not null default gen_random_uuid(),
  community_id uuid references public.communities(id),
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
  query_embedding vector(1536),
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
