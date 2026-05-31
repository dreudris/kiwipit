// Cloudflare Worker entry point (Static Assets advanced mode).
//
// Static files (index.html, app.js, style.css…) are served by the ASSETS
// binding. Dynamic routes are handled here:
//   /api/solana      — JSON-RPC proxy to Solana (browsers can't call public
//                      Solana RPCs: mainnet-beta returns 403 to browsers,
//                      CORS-less RPCs are unreachable).
//   /api/evm/{id}    — Etherscan-compat proxy to Routescan. Direct browser
//                      calls succeed on desktop Chromium/Firefox but fail on
//                      iOS WebKit (every iOS browser uses WebKit per Apple
//                      policy) with the opaque "Load failed", so we proxy.
//
// Solana NOTE: mainnet-beta also blocks Cloudflare's egress IPs ("Your IP or
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

// EVM proxy: forwards same-origin /api/evm/{chainId}?... to Routescan's
// Etherscan-compat endpoint. Same-origin avoids iOS WebKit fetch quirks
// ("Load failed") and any third-party blocking (Brave Shields, corporate
// firewalls) that hit api.routescan.io directly.
const EVM_ALLOWED_CHAINS    = new Set(['1', '56', '137', '43114', '42161', '10']);
const EVM_ALLOWED_MODULES   = new Set(['account']);
const EVM_ALLOWED_ACTIONS   = new Set(['balance', 'txlist']);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/solana') {
      return handleSolana(request);
    }

    if (url.pathname.startsWith('/api/evm/')) {
      return handleEvm(url);
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

async function handleEvm(url) {
  // /api/evm/{chainId}?module=...&action=...&address=...&...
  const chainId = url.pathname.slice('/api/evm/'.length).split('/')[0];
  if (!EVM_ALLOWED_CHAINS.has(chainId)) {
    return jsonResponse({ status: '0', message: 'chain not allowed', result: null }, 400);
  }
  const params = url.searchParams;
  if (!EVM_ALLOWED_MODULES.has(params.get('module') || '')) {
    return jsonResponse({ status: '0', message: 'module not allowed', result: null }, 400);
  }
  if (!EVM_ALLOWED_ACTIONS.has(params.get('action') || '')) {
    return jsonResponse({ status: '0', message: 'action not allowed', result: null }, 400);
  }

  const target = `https://api.routescan.io/v2/network/mainnet/evm/${chainId}/etherscan/api?${params.toString()}`;
  try {
    const upstream = await fetch(target, {
      headers: { 'Accept': 'application/json' },
    });
    const text = await upstream.text();
    return new Response(text, {
      status:  upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return jsonResponse({ status: '0', message: `proxy error: ${e.message || e}`, result: null }, 502);
  }
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
