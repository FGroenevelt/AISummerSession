-- ============================================================
-- Bevestigingsmail-trigger op de `ideas`-tabel
-- Voer dit pas uit NA het deployen van de Edge Function
-- `send-confirmation` (zie README, stap "E-mail").
--
-- De trigger haalt naam + e-mail van de indiener op en roept de
-- Edge Function asynchroon aan via pg_net (net.http_post).
-- ============================================================

-- pg_net inschakelen (asynchrone HTTP vanuit Postgres).
create extension if not exists pg_net with schema extensions;

-- ⬇️ VERVANG deze twee placeholders door je eigen waarden ⬇️
--   <PROJECT_REF>  = je Supabase project-ref (subdomein van je project-URL)
--   <ANON_KEY>     = je Supabase anon public key (Project Settings → API)
-- Tip: in plaats van de waarden hier hard te coderen kun je ze ook in de
-- Supabase Vault zetten; voor deze kleine interne tool volstaat dit.

create or replace function public.notify_new_idea()
returns trigger
language plpgsql
security definer
as $$
declare
  v_name  text;
  v_email text;
begin
  select name, email into v_name, v_email
  from participants
  where id = new.participant_id;

  perform net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-confirmation',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <ANON_KEY>'
    ),
    body    := jsonb_build_object(
      'name', v_name,
      'email', v_email,
      'title', new.title
    )
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_new_idea on ideas;
create trigger trg_notify_new_idea
  after insert on ideas
  for each row
  execute function public.notify_new_idea();
