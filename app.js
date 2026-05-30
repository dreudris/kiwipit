// ─── Chain Registry ───────────────────────────────────────────────────────────

const CHAINS = {
  btc: {
    name: 'Bitcoin',      symbol: 'BTC',  color: '#f7931a', icon: '₿',
    decimals: 8,  cgId: 'bitcoin',
    explorer: { tx: 'https://mempool.space/tx/', addr: 'https://mempool.space/address/' },
  },
  eth: {
    name: 'Ethereum',     symbol: 'ETH',  color: '#627eea', icon: 'Ξ',
    decimals: 18, cgId: 'ethereum', evmKey: 'eth',
    explorer: { tx: 'https://etherscan.io/tx/', addr: 'https://etherscan.io/address/' },
  },
  bnb: {
    name: 'BNB Chain',    symbol: 'BNB',  color: '#f3ba2f', icon: 'B',
    decimals: 18, cgId: 'binancecoin', evmKey: 'bnb',
    explorer: { tx: 'https://bscscan.com/tx/', addr: 'https://bscscan.com/address/' },
  },
  matic: {
    name: 'Polygon',      symbol: 'POL',  color: '#8247e5', icon: 'P',
    decimals: 18, cgId: 'matic-network', evmKey: 'matic',
    explorer: { tx: 'https://polygonscan.com/tx/', addr: 'https://polygonscan.com/address/' },
  },
  avax: {
    name: 'Avalanche',    symbol: 'AVAX', color: '#e84142', icon: 'A',
    decimals: 18, cgId: 'avalanche-2', evmKey: 'avax',
    explorer: { tx: 'https://snowtrace.io/tx/', addr: 'https://snowtrace.io/address/' },
  },
  arb: {
    name: 'Arbitrum',     symbol: 'ETH',  color: '#28a0f0', icon: 'Ↄ',
    decimals: 18, cgId: 'ethereum', evmKey: 'arb',
    explorer: { tx: 'https://arbiscan.io/tx/', addr: 'https://arbiscan.io/address/' },
  },
  op: {
    name: 'Optimism',     symbol: 'ETH',  color: '#ff0420', icon: 'O',
    decimals: 18, cgId: 'ethereum', evmKey: 'op',
    explorer: { tx: 'https://optimistic.etherscan.io/tx/', addr: 'https://optimistic.etherscan.io/address/' },
  },
  ltc: {
    name: 'Litecoin',     symbol: 'LTC',  color: '#b0b0b0', icon: 'Ł',
    decimals: 8,  cgId: 'litecoin',
    blockchairKey: 'litecoin',
    explorer: { tx: 'https://blockchair.com/litecoin/transaction/', addr: 'https://blockchair.com/litecoin/address/' },
  },
  doge: {
    name: 'Dogecoin',     symbol: 'DOGE', color: '#c2a633', icon: 'Ð',
    decimals: 8,  cgId: 'dogecoin',
    blockchairKey: 'dogecoin',
    explorer: { tx: 'https://blockchair.com/dogecoin/transaction/', addr: 'https://blockchair.com/dogecoin/address/' },
  },
  bch: {
    name: 'Bitcoin Cash', symbol: 'BCH',  color: '#8dc351', icon: 'Ƀ',
    decimals: 8,  cgId: 'bitcoin-cash',
    blockchairKey: 'bitcoin-cash',
    explorer: { tx: 'https://blockchair.com/bitcoin-cash/transaction/', addr: 'https://blockchair.com/bitcoin-cash/address/' },
  },
  dash: {
    name: 'Dash',         symbol: 'DASH', color: '#008ce7', icon: 'D',
    decimals: 8,  cgId: 'dash',
    blockchairKey: 'dash',
    explorer: { tx: 'https://blockchair.com/dash/transaction/', addr: 'https://blockchair.com/dash/address/' },
  },
  trx: {
    name: 'Tron',         symbol: 'TRX',  color: '#e50915', icon: 'T',
    decimals: 6,  cgId: 'tron',
    explorer: { tx: 'https://tronscan.org/#/transaction/', addr: 'https://tronscan.org/#/address/' },
  },
  xrp: {
    name: 'XRP',          symbol: 'XRP',  color: '#00aae4', icon: '◇',
    decimals: 6,  cgId: 'ripple',
    explorer: { tx: 'https://xrpscan.com/tx/', addr: 'https://xrpscan.com/account/' },
  },
  sol: {
    name: 'Solana',       symbol: 'SOL',  color: '#9945ff', icon: '◎',
    decimals: 9,  cgId: 'solana',
    explorer: { tx: 'https://solscan.io/tx/', addr: 'https://solscan.io/account/' },
  },
};

// EVM chains that share the 0x address format
const EVM_CHAINS = ['eth', 'bnb', 'matic', 'avax', 'arb', 'op'];

// Multiple public RPC endpoints per EVM chain — tried in order until one succeeds
const EVM_RPCS = {
  eth:   [
    'https://cloudflare-eth.com',
    'https://rpc.ankr.com/eth',
    'https://ethereum.publicnode.com',
    'https://eth.llamarpc.com',
  ],
  bnb:   [
    'https://bsc-dataseed.binance.org',
    'https://bsc-dataseed1.defibit.io',
    'https://rpc.ankr.com/bsc',
  ],
  matic: [
    'https://polygon-rpc.com',
    'https://rpc.ankr.com/polygon',
    'https://polygon.publicnode.com',
  ],
  avax:  [
    'https://api.avax.network/ext/bc/C/rpc',
    'https://rpc.ankr.com/avalanche',
  ],
  arb:   [
    'https://arb1.arbitrum.io/rpc',
    'https://rpc.ankr.com/arbitrum',
  ],
  op:    [
    'https://mainnet.optimism.io',
    'https://rpc.ankr.com/optimism',
  ],
};

// ─── Prices ───────────────────────────────────────────────────────────────────

let prices = {};

async function fetchPrices() {
  try {
    const ids = [...new Set(Object.values(CHAINS).map(c => c.cgId))].join(',');
    const r   = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
    );
    if (r.ok) prices = await r.json();
  } catch { /* prices are optional */ }
}

function priceUsd(cgId) {
  return prices[cgId]?.usd ?? null;
}

// ─── Formatting ───────────────────────────────────────────────────────────────

function fmtAmount(raw, decimals, symbol) {
  if (raw === null || raw === undefined) return '—';
  const n = raw / Math.pow(10, decimals);
  const s = n.toFixed(decimals).replace(/\.?0+$/, '');
  return (s || '0') + ' ' + symbol;
}

function fmtUsd(raw, decimals, cgId) {
  const p = priceUsd(cgId);
  if (!p || !raw) return '';
  const usd = (raw / Math.pow(10, decimals)) * p;
  return '≈ $' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(ts) {
  if (!ts) return 'pending';
  return new Date(ts * 1000).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function shortId(id, n = 8) {
  if (!id) return '—';
  return id.slice(0, n) + '…' + id.slice(-n);
}

// ─── Chain Detection ──────────────────────────────────────────────────────────

function detectChain(s) {
  s = s.trim();
  if (!s) return null;

  // Bitcoin xpub/ypub/zpub
  if (/^[xyz]pub[A-Za-z0-9]{100,}/.test(s))         return 'btc-xpub';

  // Bitcoin addresses
  if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(s))  return 'btc';
  if (/^bc1[a-zA-Z0-9]{6,87}$/i.test(s))             return 'btc';

  // EVM (Ethereum, BNB Chain, Polygon, Avax, Arb, Op…)
  if (/^0x[0-9a-fA-F]{40}$/.test(s))                 return 'evm';

  // Tron  (T + 33 base58 chars)
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(s))         return 'trx';

  // XRP   (r + 24-34 alphanumeric)
  if (/^r[0-9a-zA-Z]{24,34}$/.test(s))               return 'xrp';

  // Litecoin
  if (/^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(s))  return 'ltc';
  if (/^ltc1[a-z0-9]{6,87}$/i.test(s))               return 'ltc';

  // Dogecoin  (D + 33 base58)
  if (/^D[a-km-zA-HJ-NP-Z1-9]{33}$/.test(s))         return 'doge';

  // Dash  (X + 33 base58)
  if (/^X[1-9A-HJ-NP-Za-km-z]{33}$/.test(s))         return 'dash';

  // Bitcoin Cash  (cashaddr or old format)
  if (/^(bitcoincash:)?[qp][0-9a-z]{41}$/.test(s))   return 'bch';

  // Solana  (base58, 32-44 chars — tested last to avoid false matches)
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s))       return 'sol';

  return null;
}

// ─── API: Bitcoin (mempool.space) ─────────────────────────────────────────────

async function apiBtcAddress(addr) {
  const BASE = 'https://mempool.space/api';
  const [info, txs] = await Promise.all([
    fetch(`${BASE}/address/${addr}`).then(r => {
      if (!r.ok) throw new Error('Bitcoin address not found.');
      return r.json();
    }),
    fetch(`${BASE}/address/${addr}/txs`).then(r => {
      if (!r.ok) throw new Error('Could not fetch Bitcoin transactions.');
      return r.json();
    }),
  ]);

  const received = info.chain_stats.funded_txo_sum   + info.mempool_stats.funded_txo_sum;
  const spent    = info.chain_stats.spent_txo_sum    + info.mempool_stats.spent_txo_sum;
  const txCount  = info.chain_stats.tx_count         + info.mempool_stats.tx_count;

  return {
    balance:  received - spent,
    received,
    spent,
    txCount,
    txs,
    txAddr:   addr,
  };
}

async function apiBtcXpub(xpub) {
  const BASE = 'https://mempool.space/api';
  const [info, txs] = await Promise.all([
    fetch(`${BASE}/v1/xpub/${xpub}`).then(r => {
      if (!r.ok) throw new Error('xpub not found or not yet indexed by mempool.space.');
      return r.json();
    }),
    fetch(`${BASE}/v1/xpub/${xpub}/txs`).then(r => {
      if (!r.ok) throw new Error('Could not fetch xpub transactions.');
      return r.json();
    }),
  ]);

  return {
    balance:  info.balance ?? (info.funded_txo_sum - info.spent_txo_sum),
    received: info.funded_txo_sum,
    spent:    info.spent_txo_sum,
    txCount:  info.tx_count,
    txs,
    txAddr:   null,
  };
}

// ─── API: EVM chains (public JSON-RPC eth_getBalance with fallbacks) ─────────

async function apiEvmBalance(evmKey, addr) {
  const rpcs = EVM_RPCS[evmKey] ?? [];
  let lastErr = new Error('No RPC endpoints configured.');

  for (const url of rpcs) {
    try {
      const r = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ jsonrpc: '2.0', method: 'eth_getBalance', params: [addr, 'latest'], id: 1 }),
      });
      if (!r.ok) { lastErr = new Error(`HTTP ${r.status} from ${url}`); continue; }
      const d = await r.json();
      if (d.error) { lastErr = new Error(d.error.message || 'RPC error.'); continue; }
      // hex string → BigInt → ETH float (avoids JS Number overflow for large wei values)
      const wei = BigInt(d.result);
      return Number(wei / 1000n) / 1e15;
    } catch (e) {
      lastErr = e;  // network / CORS error — try next endpoint
    }
  }

  throw new Error(`Could not reach the ${evmKey.toUpperCase()} network. All RPC endpoints failed. (${lastErr.message})`);
}

// ─── API: Blockchair multi-chain ──────────────────────────────────────────────

async function apiBlockchair(blockchairKey, addr) {
  const r = await fetch(`https://api.blockchair.com/${blockchairKey}/dashboards/address/${addr}`);
  if (!r.ok) throw new Error(`Address not found on ${blockchairKey}.`);
  const d = await r.json();
  if (d.context?.code !== 200) throw new Error(d.context?.error || 'Blockchair error.');
  const info = d.data[addr]?.address ?? d.data[addr.toLowerCase()]?.address;
  if (!info) throw new Error('Address not found.');
  return {
    balance:  info.balance  ?? 0,
    received: info.received ?? 0,
    spent:    info.spent    ?? 0,
    txCount:  info.transaction_count ?? 0,
  };
}

// ─── API: Tron (TronGrid) ────────────────────────────────────────────────────

async function apiTrx(addr) {
  const [accRes, txRes] = await Promise.all([
    fetch(`https://api.trongrid.io/v1/accounts/${addr}`),
    fetch(`https://api.trongrid.io/v1/accounts/${addr}/transactions?limit=20&order_by=block_timestamp,desc`),
  ]);
  if (!accRes.ok) throw new Error('Tron address not found.');
  const accData = await accRes.json();
  const acct    = accData.data?.[0];
  if (!acct) throw new Error('Tron address not found or has no activity.');

  const txData = txRes.ok ? await txRes.json() : { data: [] };
  return {
    balance: acct.balance ?? 0,   // SUN (10^6 = 1 TRX)
    txCount: acct.trc20?.length ?? 0,
    txs:     txData.data ?? [],
  };
}

// ─── API: XRP (XRPL public cluster) ──────────────────────────────────────────

async function apiXrp(addr) {
  const post = body => fetch('https://xrplcluster.com', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  }).then(r => r.json());

  const [accInfo, txInfo] = await Promise.all([
    post({ method: 'account_info', params: [{ account: addr, ledger_index: 'validated' }] }),
    post({ method: 'account_tx',   params: [{ account: addr, limit: 20, ledger_index_min: -1, ledger_index_max: -1 }] }),
  ]);

  if (accInfo.result?.error) {
    throw new Error(accInfo.result.error === 'actNotFound'
      ? 'XRP address not found or unfunded.'
      : accInfo.result.error_message || 'XRPL error.');
  }

  const drops = Number(accInfo.result.account_data.Balance);
  return {
    balance: drops,   // 10^6 drops = 1 XRP
    txs:     txInfo.result?.transactions ?? [],
  };
}

// ─── API: Solana (public RPC) ─────────────────────────────────────────────────

async function apiSol(addr) {
  const post = (method, params) => fetch('https://api.mainnet-beta.solana.com', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  }).then(r => r.json());

  const [balRes, sigRes] = await Promise.all([
    post('getBalance',               [addr]),
    post('getSignaturesForAddress',  [addr, { limit: 20 }]),
  ]);

  if (balRes.error) throw new Error(balRes.error.message || 'Solana RPC error.');
  return {
    balance: balRes.result?.value ?? 0,   // lamports (10^9 = 1 SOL)
    sigs:    sigRes.result ?? [],
  };
}

// ─── Rendering ────────────────────────────────────────────────────────────────

function setChainTheme(chainKey) {
  const c = CHAINS[chainKey];
  if (!c) return;
  document.documentElement.style.setProperty('--accent', c.color);
}

function renderChainHeader(chainKey, addr) {
  const c = CHAINS[chainKey];
  const badge = document.getElementById('chainBadge');
  badge.textContent  = `${c.icon} ${c.name}`;
  badge.style.color  = c.color;
  badge.style.borderColor = c.color;

  const link = document.getElementById('explorerAddrLink');
  link.href = c.explorer.addr + encodeURIComponent(addr);
}

function renderBalance(raw, chain) {
  const c = CHAINS[chain];
  document.getElementById('balanceAmount').textContent = fmtAmount(raw, c.decimals, c.symbol);
  document.getElementById('balanceUsd').textContent    = fmtUsd(raw, c.decimals, c.cgId);
}

function renderStats(received, sent, txCount, chain) {
  const c = CHAINS[chain];
  const row = document.getElementById('statsRow');

  if (received === null && sent === null && txCount === null) {
    row.classList.add('hidden');
    return;
  }
  row.classList.remove('hidden');
  document.getElementById('statReceived').textContent = received !== null ? fmtAmount(received, c.decimals, c.symbol) : '—';
  document.getElementById('statSent').textContent     = sent     !== null ? fmtAmount(sent,     c.decimals, c.symbol) : '—';
  document.getElementById('statTxCount').textContent  = txCount  !== null ? txCount.toLocaleString() : '—';
}

// Bitcoin: full net-per-address tx list
function renderBtcTxs(txs, addr, chain) {
  const c    = CHAINS[chain];
  const list = document.getElementById('txList');

  if (!txs?.length) { list.innerHTML = '<p class="tx-empty">No transactions found.</p>'; return; }

  list.innerHTML = txs.map(tx => {
    let received = 0, sent = 0;
    for (const o of tx.vout) if (o.scriptpubkey_address === addr) received += o.value;
    for (const i of tx.vin)  if (i.prevout?.scriptpubkey_address === addr) sent += i.value;
    const net     = addr ? received - sent : null;
    const cls     = net === null ? 'neutral' : net > 0 ? 'positive' : net < 0 ? 'negative' : 'neutral';
    const prefix  = net > 0 ? '+' : net < 0 ? '−' : '';
    const absNet  = net !== null ? Math.abs(net) : null;
    const confirmed = tx.status.confirmed;

    return `<div class="tx-item">
  <div>
    <a class="tx-id" href="${c.explorer.tx}${tx.txid}" target="_blank" rel="noopener">${shortId(tx.txid)}</a>
    <span class="tx-badge ${confirmed ? 'confirmed' : 'unconfirmed'}">${confirmed ? 'confirmed' : 'pending'}</span>
    <div class="tx-meta">${fmtDate(tx.status.block_time)}</div>
  </div>
  <div class="tx-right">
    <div class="tx-amount ${cls}">${absNet !== null ? prefix + fmtAmount(absNet, c.decimals, c.symbol) : '—'}</div>
    <div class="tx-usd">${absNet !== null ? fmtUsd(absNet, c.decimals, c.cgId) : ''}</div>
  </div>
</div>`;
  }).join('');
}

// TRX: transaction list from TronGrid
function renderTrxTxs(txs, addr, chain) {
  const c    = CHAINS[chain];
  const list = document.getElementById('txList');
  if (!txs?.length) { list.innerHTML = '<p class="tx-empty">No transactions found.</p>'; return; }

  list.innerHTML = txs.map(tx => {
    const contract = tx.raw_data?.contract?.[0];
    const val      = contract?.parameter?.value ?? {};
    const amount   = val.amount ?? 0;                // in SUN
    const toHex    = val.to_address ?? '';
    const fromHex  = val.owner_address ?? '';
    // TronGrid returns hex addresses prefixed with "41"
    const addrHex  = addr;  // user input is Base58, comparison unreliable; show direction from contract type
    const type     = contract?.type ?? '';
    const status   = tx.ret?.[0]?.contractRet ?? 'UNKNOWN';
    const ts       = tx.block_timestamp ? tx.block_timestamp / 1000 : 0;

    return `<div class="tx-item">
  <div>
    <a class="tx-id" href="${c.explorer.tx}${tx.txID}" target="_blank" rel="noopener">${shortId(tx.txID)}</a>
    <span class="tx-badge ${status === 'SUCCESS' ? 'success' : 'failed'}">${status}</span>
    <div class="tx-meta">${fmtDate(ts)} · ${type}</div>
  </div>
  <div class="tx-right">
    <div class="tx-amount neutral">${fmtAmount(amount, c.decimals, c.symbol)}</div>
    <div class="tx-usd">${fmtUsd(amount, c.decimals, c.cgId)}</div>
  </div>
</div>`;
  }).join('');
}

// XRP: transaction list from XRPL
function renderXrpTxs(txs, addr, chain) {
  const c    = CHAINS[chain];
  const list = document.getElementById('txList');
  if (!txs?.length) { list.innerHTML = '<p class="tx-empty">No transactions found.</p>'; return; }

  // XRPL epoch offset: Jan 1 2000 = 946684800 Unix
  const XRPL_EPOCH = 946684800;

  list.innerHTML = txs.map(entry => {
    const tx     = entry.tx ?? entry;
    const meta   = entry.meta;
    const hash   = tx.hash ?? '—';
    const ts     = tx.date ? tx.date + XRPL_EPOCH : 0;
    const isSend = tx.Account === addr;
    const amount = typeof tx.Amount === 'string' ? Number(tx.Amount) : 0;  // drops
    const cls    = isSend ? 'negative' : 'positive';
    const prefix = isSend ? '−' : '+';
    const ok     = meta?.TransactionResult === 'tesSUCCESS';

    return `<div class="tx-item">
  <div>
    <a class="tx-id" href="${c.explorer.tx}${hash}" target="_blank" rel="noopener">${shortId(hash)}</a>
    <span class="tx-badge ${ok ? 'success' : 'failed'}">${ok ? 'success' : 'failed'}</span>
    <div class="tx-meta">${fmtDate(ts)}</div>
  </div>
  <div class="tx-right">
    <div class="tx-amount ${cls}">${prefix}${fmtAmount(amount, c.decimals, c.symbol)}</div>
    <div class="tx-usd">${fmtUsd(amount, c.decimals, c.cgId)}</div>
  </div>
</div>`;
  }).join('');
}

// Solana: recent signature list (no amount — needs separate tx fetch per sig)
function renderSolSigs(sigs, chain) {
  const c    = CHAINS[chain];
  const list = document.getElementById('txList');
  if (!sigs?.length) { list.innerHTML = '<p class="tx-empty">No transactions found.</p>'; return; }

  list.innerHTML = sigs.map(s => {
    const ok = !s.err;
    return `<div class="tx-item">
  <div>
    <a class="tx-id" href="${c.explorer.tx}${s.signature}" target="_blank" rel="noopener">${shortId(s.signature)}</a>
    <span class="tx-badge ${ok ? 'confirmed' : 'failed'}">${ok ? 'confirmed' : 'failed'}</span>
    <div class="tx-meta">${fmtDate(s.blockTime)}</div>
  </div>
  <div class="tx-right">
    <div class="tx-amount neutral">—</div>
  </div>
</div>`;
  }).join('');
}

// Explorer-link fallback for chains without a full tx list
function renderExplorerFallback(addr, chain) {
  const c    = CHAINS[chain];
  const list = document.getElementById('txList');
  list.innerHTML = `<a class="explorer-btn" href="${c.explorer.addr}${encodeURIComponent(addr)}" target="_blank" rel="noopener noreferrer">
  View full transaction history on ${new URL(c.explorer.addr).hostname} ↗
</a>`;
}

// ─── Unified Lookup ───────────────────────────────────────────────────────────

async function lookupChain(rawInput, chainKey) {
  const input = rawInput.trim();
  const c     = CHAINS[chainKey];

  document.getElementById('addressLabel').textContent =
    input.length > 60 ? input.slice(0, 24) + '…' + input.slice(-12) : input;

  setChainTheme(chainKey);
  renderChainHeader(chainKey, input);

  const statsRow = document.getElementById('statsRow');
  const txSection = document.getElementById('txSection');
  statsRow.classList.remove('hidden');
  txSection.classList.remove('hidden');

  // ── Bitcoin ──
  if (chainKey === 'btc') {
    const d = await apiBtcAddress(input);
    renderBalance(d.balance, 'btc');
    renderStats(d.received, d.spent, d.txCount, 'btc');
    renderBtcTxs(d.txs, d.txAddr, 'btc');
    return;
  }

  if (chainKey === 'btc-xpub') {
    const d = await apiBtcXpub(input);
    renderBalance(d.balance, 'btc');
    renderStats(d.received, d.spent, d.txCount, 'btc');
    renderBtcTxs(d.txs, null, 'btc');
    return;
  }

  // ── EVM RPC chains (ETH, BNB, MATIC, AVAX, ARB, OP) ──
  if (c.evmKey) {
    const balEth = await apiEvmBalance(c.evmKey, input);
    // Convert float ETH to raw units for unified fmtAmount
    const balRaw = Math.round(balEth * Math.pow(10, c.decimals));
    renderBalance(balRaw, chainKey);
    renderStats(null, null, null, chainKey);
    statsRow.classList.add('hidden');
    renderExplorerFallback(input, chainKey);
    return;
  }

  // ── Blockchair chains (LTC, DOGE, BCH, DASH) ──
  if (c.blockchairKey) {
    const d = await apiBlockchair(c.blockchairKey, input);
    renderBalance(d.balance, chainKey);
    renderStats(d.received, d.spent, d.txCount, chainKey);
    renderExplorerFallback(input, chainKey);
    return;
  }

  // ── Tron ──
  if (chainKey === 'trx') {
    const d = await apiTrx(input);
    renderBalance(d.balance, 'trx');
    renderStats(null, null, d.txCount || null, 'trx');
    renderTrxTxs(d.txs, input, 'trx');
    return;
  }

  // ── XRP ──
  if (chainKey === 'xrp') {
    const d = await apiXrp(input);
    renderBalance(d.balance, 'xrp');
    renderStats(null, null, null, 'xrp');
    statsRow.classList.add('hidden');
    renderXrpTxs(d.txs, input, 'xrp');
    return;
  }

  // ── Solana ──
  if (chainKey === 'sol') {
    const d = await apiSol(input);
    renderBalance(d.balance, 'sol');
    renderStats(null, null, null, 'sol');
    statsRow.classList.add('hidden');
    renderSolSigs(d.sigs, 'sol');
    return;
  }

  throw new Error(`Chain ${chainKey} not implemented.`);
}

// ─── UI State ─────────────────────────────────────────────────────────────────

function setLoading(on) {
  document.getElementById('loading').classList.toggle('hidden', !on);
}

function setError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.classList.toggle('hidden', !msg);
}

function setResults(show) {
  document.getElementById('results').classList.toggle('hidden', !show);
}

// ─── EVM network selector ─────────────────────────────────────────────────────

let activeEvmChain = 'eth';

function buildEvmTabs() {
  const container = document.getElementById('evmTabs');
  container.innerHTML = EVM_CHAINS.map(key => {
    const c = CHAINS[key];
    return `<button class="evm-tab${key === 'eth' ? ' active' : ''}"
      data-chain="${key}"
      style="--tab-color:${c.color}"
    >${c.symbol === 'ETH' ? c.name : c.symbol}</button>`;
  }).join('');

  container.addEventListener('click', e => {
    const btn = e.target.closest('.evm-tab');
    if (!btn) return;
    container.querySelectorAll('.evm-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeEvmChain = btn.dataset.chain;
  });
}

function showEvmSelector(show) {
  document.getElementById('evmSelector').classList.toggle('hidden', !show);
}

function updateDetectedChip(detected) {
  const chip = document.getElementById('detectedChip');
  if (!detected || detected === 'evm') {
    chip.classList.add('hidden');
    return;
  }
  const key = detected === 'btc-xpub' ? 'btc' : detected;
  const c   = CHAINS[key];
  if (!c) { chip.classList.add('hidden'); return; }
  chip.textContent        = `${c.icon} ${c.symbol}`;
  chip.style.color        = c.color;
  chip.style.background   = c.color + '22';
  chip.classList.remove('hidden');
}

// ─── Main handler ─────────────────────────────────────────────────────────────

async function handleLookup() {
  const input    = document.getElementById('addressInput').value.trim();
  if (!input) return;

  const detected = detectChain(input);

  setLoading(true);
  setError('');
  setResults(false);

  try {
    await fetchPrices();

    if (!detected) {
      throw new Error('Address format not recognised. Supported: Bitcoin, Ethereum (0x…), Solana, Tron (T…), XRP (r…), Litecoin (L…/M…), Dogecoin (D…), Dash (X…), Bitcoin Cash, and xpub/ypub/zpub keys.');
    }

    const chainKey = detected === 'evm' ? activeEvmChain : detected;
    await lookupChain(input, chainKey);
    setResults(true);
  } catch (err) {
    setError(err.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
}

// ─── Input auto-detect ────────────────────────────────────────────────────────

let detectTimer = null;

document.getElementById('addressInput').addEventListener('input', () => {
  clearTimeout(detectTimer);
  detectTimer = setTimeout(() => {
    const val      = document.getElementById('addressInput').value.trim();
    const detected = detectChain(val);
    updateDetectedChip(detected);
    showEvmSelector(detected === 'evm');
  }, 150);
});

// ─── Events ───────────────────────────────────────────────────────────────────

document.getElementById('lookupBtn').addEventListener('click', handleLookup);
document.getElementById('addressInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleLookup();
});

// ─── Init ─────────────────────────────────────────────────────────────────────

buildEvmTabs();
