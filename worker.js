// Cloudflare Worker entry point (Static Assets advanced mode).
//
// Static files (index.html, app.js, style.css…) are served by the ASSETS
// binding. Dynamic routes are handled here. The only dynamic route is the
// Solana RPC proxy: browsers are blocked from calling api.mainnet-beta.solana.com
// directly (HTTP 403), so the browser hits same-origin /api/solana and this
// Worker forwards the request from Cloudflare's edge, where that block does
// not apply.

const SOLANA_ALLOWED_METHODS = new Set([
  'getBalance',
  'getSignaturesForAddress',
  'getTransaction',
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/solana') {
      return handleSolana(request);
    }

    // Everything else → static assets
    return env.ASSETS.fetch(request);
  },
};

async function handleSolana(request) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'POST required' }, 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  if (!SOLANA_ALLOWED_METHODS.has(body?.method)) {
    return jsonResponse({ error: 'Method not allowed' }, 403);
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

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
