export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_KEEPALIVE_TABLE || 'users';

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ ok: false, error: 'Missing Supabase env vars' });
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}?select=*&limit=1`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    return res.status(500).json({ ok: false, status: response.status, error: text });
  }

  return res.status(200).json({ ok: true, checkedAt: new Date().toISOString() });
}