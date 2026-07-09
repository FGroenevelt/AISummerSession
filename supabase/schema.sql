-- ============================================================
-- KplusV Ideeën- & stemtool — databaseschema voor Supabase
-- Plak dit volledig in de Supabase SQL Editor en klik op "Run".
-- (Project → SQL Editor → New query)
-- ============================================================

-- 1) Tabellen ------------------------------------------------

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists ideas (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants (id) on delete cascade,
  title text not null,
  problem text not null,
  solution text not null,
  ai_challenges text, -- optioneel: waar loopt de indiener tegenaan bij AI-gebruik?
  session_goal text, -- optioneel: wanneer is de indiener tevreden over de sessie?
  created_at timestamptz not null default now()
);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references ideas (id) on delete cascade,
  voter_token text not null,
  created_at timestamptz not null default now(),
  -- Voorkomt dubbel stemmen op hetzelfde idee vanaf hetzelfde device.
  unique (idea_id, voter_token)
);

create index if not exists idx_ideas_participant on ideas (participant_id);
create index if not exists idx_votes_idea on votes (idea_id);

-- 2) Row Level Security --------------------------------------
-- De tool heeft geen login. We staan bewust publieke insert/select toe
-- met de anon-key. Bewust GEEN update/delete vanaf de client.

alter table participants enable row level security;
alter table ideas enable row level security;
alter table votes enable row level security;

-- participants: iedereen mag aanmaken en lezen.
create policy "participants_insert_anon" on participants
  for insert to anon, authenticated with check (true);
create policy "participants_select_anon" on participants
  for select to anon, authenticated using (true);

-- ideas: iedereen mag indienen en lezen.
create policy "ideas_insert_anon" on ideas
  for insert to anon, authenticated with check (true);
create policy "ideas_select_anon" on ideas
  for select to anon, authenticated using (true);

-- votes: iedereen mag stemmen en stemmen lezen (voor de tellers).
create policy "votes_insert_anon" on votes
  for insert to anon, authenticated with check (true);
create policy "votes_select_anon" on votes
  for select to anon, authenticated using (true);

-- ============================================================
-- Klaar. De bevestigingsmail (trigger + Edge Function) staat
-- apart in supabase/trigger.sql en supabase/functions/.
-- Voer trigger.sql pas uit NA het deployen van de Edge Function.
-- ============================================================
