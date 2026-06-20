// Supabase Edge Function — verstuurt een bevestigingsmail via Resend.
//
// Wordt aangeroepen door een database-trigger op de `ideas`-tabel (zie
// supabase/trigger.sql). Verwacht een JSON-body: { name, email, title }.
//
// Vereiste secrets (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY   je Resend API-key
//   MAIL_FROM        afzender, bijv. "KplusV Ideeëntool <noreply@jouwdomein.nl>"
//                    (tijdens testen mag dit "onboarding@resend.dev" zijn)
//
// Deploy:  supabase functions deploy send-confirmation --no-verify-jwt

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const MAIL_FROM =
  Deno.env.get('MAIL_FROM') ?? 'KplusV Ideeëntool <onboarding@resend.dev>'

serve(async (req) => {
  try {
    const { name, email, title } = await req.json()

    if (!email || !title) {
      return json({ error: 'email en title zijn verplicht' }, 400)
    }
    if (!RESEND_API_KEY) {
      return json({ error: 'RESEND_API_KEY ontbreekt' }, 500)
    }

    const veiligeNaam = escapeHtml(name ?? '')
    const veiligeTitel = escapeHtml(title)

    const html = `
      <div style="font-family: Inter, Arial, sans-serif; color:#1f2433; max-width:520px; margin:0 auto;">
        <div style="height:6px; background:linear-gradient(90deg,#0079AE,#545DA4,#8E61A2,#B0A9CE); border-radius:6px;"></div>
        <h1 style="font-size:20px; margin:24px 0 8px;">Bedankt voor je idee${
          veiligeNaam ? `, ${veiligeNaam}` : ''
        }!</h1>
        <p style="margin:0 0 16px; line-height:1.5;">
          We hebben je idee <strong>&ldquo;${veiligeTitel}&rdquo;</strong> goed ontvangen.
          Tijdens de KplusV AI-sessie gebruiken we de ingediende ideeën als input
          voor onderdeel 2 (vibe-coden) — één van de meest gekozen ideeën bouwen we
          daar live.
        </p>
        <p style="margin:0 0 16px; line-height:1.5;">
          Tip: bekijk het overzicht en stem ook op de ideeën van je collega&rsquo;s.
        </p>
        <p style="margin:24px 0 0; font-size:13px; color:#6b7280;">
          Deze mail is automatisch verstuurd — je hoeft er niet op te reageren.
        </p>
      </div>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [email],
        subject: 'Bedankt voor je idee — KplusV AI-sessie',
        html,
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      console.error('Resend-fout:', res.status, detail)
      return json({ error: 'mail kon niet worden verstuurd', detail }, 502)
    }

    return json({ ok: true })
  } catch (err) {
    console.error(err)
    return json({ error: String(err) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
