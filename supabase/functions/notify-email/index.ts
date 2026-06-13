import nodemailer from 'npm:nodemailer@6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { title, body } = await req.json() as { title: string; body: string };

    const gmailUser = Deno.env.get('GMAIL_USER');
    const gmailPassword = Deno.env.get('GMAIL_APP_PASSWORD');
    const lisaEmail = Deno.env.get('LISA_EMAIL');
    const siteUrl = Deno.env.get('SITE_URL') ?? 'https://asklisa.vercel.app';

    if (!gmailUser || !gmailPassword || !lisaEmail) {
      console.error('notify-email: missing required environment variables');
      return new Response(JSON.stringify({ error: 'Missing email configuration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPassword },
    });

    await transporter.sendMail({
      from: `"AskLisa" <${gmailUser}>`,
      to: lisaEmail,
      subject: title,
      text: body,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
          <p style="font-size:12px;font-weight:600;letter-spacing:0.08em;color:#6b7280;text-transform:uppercase;margin:0 0 16px;">AskLisa Notification</p>
          <h2 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 12px;">${title}</h2>
          <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 28px;">${body}</p>
          <a href="${siteUrl}/admin"
             style="display:inline-block;background:#111827;color:#fff;font-size:14px;font-weight:500;text-decoration:none;padding:10px 20px;border-radius:6px;">
            Open Admin Panel →
          </a>
          <p style="font-size:12px;color:#9ca3af;margin:28px 0 0;">
            You're receiving this because a new question was submitted on AskLisa.
          </p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('notify-email error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
