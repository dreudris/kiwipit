// Cloudflare Pages Function: same-origin proxy to api.mainnet-beta.solana.com
// Browsers are blocked from calling mainnet-beta directly (HTTP 403).
// This function runs on Cloudflare's edge so there are no browser restrictions.

const ALLOWED_METHODS = new Set([
  'getBalance',
  'getSignaturesForAddress',
  'getTransaction',
]);

export async function onRequestPost({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  if (!ALLOWED_METHODS.has(body?.method)) {
    return json({ error: 'Method not allowed' }, 403);
  }

  const upstream = await fetch('https://api.mainnet-beta.solana.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
