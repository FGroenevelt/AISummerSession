# KplusV — Ideeën- & stemtool

Webtool waarmee deelnemers van de KplusV AI-sessie vooraf een idee indienen
(tool/dashboard/automatisering) en anoniem op elkaars ideeën stemmen. De
prioritering is input voor onderdeel 2 (vibe-coden) van de sessie.

**Stack:** React + Vite + Tailwind CSS · Supabase (database) · Netlify (hosting)
· Resend (bevestigingsmail). Geen login — open link.

---

## Wat is er al gebouwd

- ✅ Indienformulier met validatie (naam, e-mail, titel, probleem, oplossing)
- ✅ Bevestigingsscherm met doorlink naar het overzicht
- ✅ Overzicht met kaarten, stemknop (anoniem, dubbel-stem-rem per device) en
  sortering op meeste stemmen / nieuwste
- ✅ Dashboard met kerncijfers + top-ideeën
- ✅ KplusV-huisstijl (logo + kleuren) centraal in `tailwind.config.js`
- ✅ Responsive (laptop + telefoon), Nederlandstalig
- ✅ Supabase-schema, RLS-policies, e-mail Edge Function + trigger als code
- ✅ Lokale testmodus met SQLite-in-de-browser (sql.js) — testen zonder Supabase

---

## Direct testen zonder Supabase (lokale testmodus)

Zolang er nog geen `.env` is, draait de tool automatisch in **lokale
testmodus**: inzendingen en stemmen worden opgeslagen in een echte SQLite-
database (sql.js) die volledig in je browser draait en bewaard blijft in
`localStorage`. Zo kun je het hele proces (indienen → overzicht → stemmen →
dashboard) testen zonder iets op te zetten.

```bash
npm install
npm run dev      # of dubbelklik de snelkoppeling op je bureaublad
```

> Wil je de testdata wissen? Leeg in de browser de `localStorage`-sleutel
> `kplusv_sqlite_db` (of gebruik een incognitovenster). Zodra je een geldige
> `.env` invult, schakelt de tool automatisch over naar Supabase.

---

## Wat moet jij nog doen (eenmalig)

Deze stappen vereisen accounts/keys en kan ik niet voor je aanmaken. Volg ze in
volgorde; je bent in ±30 minuten live.

### 1. Supabase-project + database

1. Maak een gratis project op <https://supabase.com> (regio Frankfurt/EU).
2. Open **SQL Editor → New query**, plak de inhoud van
   [`supabase/schema.sql`](supabase/schema.sql) en klik **Run**.
   Dit maakt de tabellen `participants`, `ideas`, `votes` + RLS-policies aan.
3. Ga naar **Project Settings → API** en noteer:
   - **Project URL** (bijv. `https://abcxyz.supabase.co`)
   - **anon public key**

### 2. Lokale .env

```bash
cp .env.example .env
```

Vul in `.env` je `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY` in. Daarna:

```bash
npm install
npm run dev
```

De tool draait nu lokaal op <http://localhost:5173>. Test een inzending en een
stem.

### 3. Bevestigingsmail (Resend + Edge Function)

> Wil je eerst zonder mail live? Sla dit over — de tool werkt volledig, alleen
> de bevestigingsmail wordt dan niet verstuurd. Voeg het later toe.

1. Maak een gratis account op <https://resend.com> en maak een **API key**.
   - Snel testen kan met afzender `onboarding@resend.dev` (alleen naar je eigen
     adres). Voor echte verzending: verifieer een domein in Resend en zet
     `MAIL_FROM` op bijv. `KplusV Ideeëntool <noreply@jouwdomein.nl>`.
2. Installeer de Supabase CLI en koppel je project:
   ```bash
   npm i -g supabase
   supabase login
   supabase link --project-ref <PROJECT_REF>
   ```
3. Zet de secrets en deploy de functie:
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxx MAIL_FROM="KplusV Ideeëntool <onboarding@resend.dev>"
   supabase functions deploy send-confirmation --no-verify-jwt
   ```
4. Open [`supabase/trigger.sql`](supabase/trigger.sql), vervang
   `<PROJECT_REF>` en `<ANON_KEY>`, en voer het uit in de Supabase SQL Editor.
   Vanaf nu krijgt elke indiener automatisch een bevestigingsmail.

### 4. Deploy naar Netlify

1. Zet deze map in een Git-repository en push naar GitHub (of gebruik
   `netlify deploy`).
2. Maak een site op <https://netlify.com>, koppel de repo. Build-instellingen
   staan al in [`netlify.toml`](netlify.toml) (`npm run build` → `dist`).
3. **Site settings → Environment variables**: voeg `VITE_SUPABASE_URL` en
   `VITE_SUPABASE_ANON_KEY` toe (dezelfde waarden als in je `.env`).
4. Deploy. Test de live link end-to-end met een paar testinzendingen.
5. Deel de link enkele dagen vóór de sessie, met een duidelijke deadline.

---

## Huisstijl aanpassen

Alle kleuren staan centraal in [`tailwind.config.js`](tailwind.config.js)
onder `colors.kplus`. Het logo staat in `public/logo-kplusv.webp`.

- Kleuren: `#0079AE` (primair), `#545DA4`, `#8E61A2`, `#B0A9CE`.
- **Lettertype:** nu staat Inter ingesteld als nette benadering. Zodra het
  exacte kplusv.nl-lettertype is aangeleverd, vervang je het in
  `tailwind.config.js` (`fontFamily.sans`) en de `@import` bovenin
  `src/index.css`.

---

## Projectstructuur

```
src/
  pages/        Home (formulier), Bedankt, Overzicht (stemmen), Dashboard
  components/   Layout (header/nav/footer met logo)
  lib/          supabase.js (client), api.js (data), voter.js (anon device-id)
supabase/
  schema.sql            tabellen + RLS-policies        → eenmalig runnen
  trigger.sql           mail-trigger op ideas          → runnen ná deploy functie
  functions/send-confirmation/  Edge Function (Resend)
netlify.toml            build + SPA-redirects
```

## Scripts

```bash
npm run dev       # lokale ontwikkelserver
npm run build     # productie-build naar dist/
npm run preview   # productie-build lokaal bekijken
```
