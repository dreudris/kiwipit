// Cloudflare Worker entry point (Static Assets advanced mode).
//
// Static files (index.html, app.js, style.css…) are served by the ASSETS
// binding. Dynamic routes are handled here. The only dynamic route is the
// Solana RPC proxy: browsers can't call public Solana RPCs (mainnet-beta
// returns 403 to browsers; CORS-less RPCs are unreachable), so the browser
// hits same-origin /api/solana and this Worker forwards server-side.
//
// NOTE: mainnet-beta also blocks Cloudflare's egress IPs ("Your IP or
// provider is blocked"), so leorpc is the primary upstream — it's keyless
// (api_key=FREE), indexes history, and accepts datacenter IPs. mainnet-beta
// stays as a last-resort fallback in case leorpc is down.

const SOLANA_ALLOWED_METHODS = new Set([
  'getBalance',
  'getSignaturesForAddress',
  'getTransaction',
]);

const SOLANA_UPSTREAMS = [
  'https://solana.leorpc.com/?api_key=FREE',
  'https://api.mainnet-beta.solana.com',
];

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

  const payload = JSON.stringify(body);
  let lastText = '{"error":"All Solana upstreams failed"}';

  for (const url of SOLANA_UPSTREAMS) {
    try {
      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });

      const text = await upstream.text();
      lastText = text;

      // Accept only a real success; otherwise try the next upstream.
      // (Some RPCs return HTTP 200 with a JSON-RPC error like "IP blocked".)
      if (upstream.ok) {
        let parsed;
        try { parsed = JSON.parse(text); } catch { parsed = null; }
        if (parsed && !parsed.error) {
          return jsonResponse(parsed, 200);
        }
      }
    } catch {
      // network error — try next upstream
    }
  }

  // Nothing worked — surface the last response so the client sees the reason.
  return new Response(lastText, {
    status: 502,
    headers: { 'Content-Type': 'application/json' },
  });
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
