-- ============================================================
-- Migratie: twee optionele vragen toegevoegd aan het formulier.
-- Voer dit uit in de Supabase SQL Editor (New query -> Run) als je
-- schema.sql al eerder hebt gedraaid. Veilig: voegt alleen nullable
-- kolommen toe, raakt geen bestaande data.
-- ============================================================

alter table ideas add column if not exists ai_challenges text;
alter table ideas add column if not exists session_goal text;
