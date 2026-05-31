// ─── Chain Registry ───────────────────────────────────────────────────────────

const CHAINS = {
  btc: {
    name: 'Bitcoin',      symbol: 'BTC',  color: '#f7931a', icon: '₿',
    decimals: 8,  cgId: 'bitcoin',
    explorer: { tx: 'https://mempool.space/tx/', addr: 'https://mempool.space/address/' },
  },
  eth: {
    name: 'Ethereum',     symbol: 'ETH',  color: '#627eea', icon: 'Ξ',
    decimals: 18, cgId: 'ethereum', evmKey: 'eth', routescanId: 1,
    explorer: { tx: 'https://etherscan.io/tx/', addr: 'https://etherscan.io/address/' },
  },
  bnb: {
    name: 'BNB Chain',    symbol: 'BNB',  color: '#f3ba2f', icon: 'B',
    decimals: 18, cgId: 'binancecoin', evmKey: 'bnb', routescanId: 56,
    explorer: { tx: 'https://bscscan.com/tx/', addr: 'https://bscscan.com/address/' },
  },
  matic: {
    name: 'Polygon',      symbol: 'POL',  color: '#8247e5', icon: 'P',
    decimals: 18, cgId: 'matic-network', evmKey: 'matic', routescanId: 137,
    explorer: { tx: 'https://polygonscan.com/tx/', addr: 'https://polygonscan.com/address/' },
  },
  avax: {
    name: 'Avalanche',    symbol: 'AVAX', color: '#e84142', icon: 'A',
    decimals: 18, cgId: 'avalanche-2', evmKey: 'avax', routescanId: 43114,
    explorer: { tx: 'https://snowtrace.io/tx/', addr: 'https://snowtrace.io/address/' },
  },
  arb: {
    name: 'Arbitrum',     symbol: 'ETH',  color: '#28a0f0', icon: 'Ↄ',
    decimals: 18, cgId: 'ethereum', evmKey: 'arb', routescanId: 42161,
    explorer: { tx: 'https://arbiscan.io/tx/', addr: 'https://arbiscan.io/address/' },
  },
  op: {
    name: 'Optimism',     symbol: 'ETH',  color: '#ff0420', icon: 'O',
    decimals: 18, cgId: 'ethereum', evmKey: 'op', routescanId: 10,
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

// ─── Prices & currency ───────────────────────────────────────────────────────

const CURRENCIES = {
  usd: { code: 'USD', locale: 'en-US' },
  eur: { code: 'EUR', locale: 'de-DE' },
  brl: { code: 'BRL', locale: 'pt-BR' },
};

let prices = {};
let activeCurrency = localStorage.getItem('kp.currency') || 'usd';
if (!CURRENCIES[activeCurrency]) activeCurrency = 'usd';

async function fetchPrices() {
  try {
    const ids = [...new Set(Object.values(CHAINS).map(c => c.cgId))].join(',');
    const r   = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,eur,brl`
    );
    if (r.ok) prices = await r.json();
  } catch { /* prices are optional */ }
}

function priceFor(cgId) {
  return prices[cgId]?.[activeCurrency] ?? null;
}

// ─── Formatting ───────────────────────────────────────────────────────────────

function fmtAmount(raw, decimals, symbol) {
  if (raw === null || raw === undefined) return '—';
  const n = raw / Math.pow(10, decimals);
  const s = n.toFixed(decimals).replace(/\.?0+$/, '');
  return (s || '0') + ' ' + symbol;
}

function fmtFiat(raw, decimals, cgId) {
  const p = priceFor(cgId);
  if (!p || !raw) return '';
  const value = (raw / Math.pow(10, decimals)) * p;
  const { code, locale } = CURRENCIES[activeCurrency];
  return '≈ ' + new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
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

// ─── API: EVM full (Routescan Etherscan-compat: balance + txlist) ─────────────

async function apiEvmFull(chainKey, addr) {
  const c    = CHAINS[chainKey];
  const base = `https://api.routescan.io/v2/network/mainnet/evm/${c.routescanId}/etherscan/api`;

  const [balRes, txRes] = await Promise.all([
    fetch(`${base}?module=account&action=balance&address=${addr}`).then(r => r.json()),
    fetch(`${base}?module=account&action=txlist&address=${addr}&sort=desc&page=1&offset=25`).then(r => r.json()),
  ]);

  if (balRes.status !== '1') throw new Error(`${c.name} address not found.`);

  const weiBalance = BigInt(balRes.result || '0');
  const balanceRaw = Math.round(Number(weiBalance / 1000n) / 1e15 * Math.pow(10, c.decimals));

  const txList = Array.isArray(txRes.result) ? txRes.result : [];
  return {
    balanceRaw,
    txs: txList.map(tx => {
      const weiVal = BigInt(tx.value || '0');
      return {
        hash:      tx.hash,
        timestamp: Number(tx.timeStamp),
        valueRaw:  Math.round(Number(weiVal / 1000n) / 1e15 * Math.pow(10, c.decimals)),
        fromAddr:  (tx.from || '').toLowerCase(),
        toAddr:    (tx.to   || '').toLowerCase(),
        isError:   tx.isError === '1',
      };
    }),
  };
}

// ─── API: EVM balance-only fallback (public JSON-RPC eth_getBalance) ──────────

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
  const addrData = d.data[addr] ?? d.data[addr.toLowerCase()];
  if (!addrData) throw new Error('Address not found.');
  const info     = addrData.address;
  const txHashes = addrData.transactions ?? [];

  // Batch-fetch first 10 transaction details for amounts and dates
  let txs = [];
  if (txHashes.length > 0) {
    try {
      const batch  = txHashes.slice(0, 10).join(',');
      const txRes  = await fetch(`https://api.blockchair.com/${blockchairKey}/dashboards/transactions/${batch}`);
      if (txRes.ok) {
        const txData = await txRes.json();
        txs = txHashes.slice(0, 10)
          .map(hash => txData.data?.[hash] ? { hash, ...txData.data[hash] } : null)
          .filter(Boolean);
      }
    } catch { /* txs stays empty — explorer fallback shown */ }
  }

  return {
    balance:  info.balance  ?? 0,
    received: info.received ?? 0,
    spent:    info.spent    ?? 0,
    txCount:  info.transaction_count ?? 0,
    txs,
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
    hexAddr: acct.address ?? '',   // hex "41…" address for direction comparison
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

// ─── API: Solana (public RPC with fallbacks) ─────────────────────────────────

const SOL_RPCS = [
  '/api/solana',                   // same-origin Worker proxy → no browser 403
  'https://solana.publicnode.com', // fallback (balance works, tx history may be empty)
];

async function apiSol(addr) {
  let lastErr = new Error('No Solana RPC available.');

  for (const rpcUrl of SOL_RPCS) {
    try {
      const post = (method, params) => fetch(rpcUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} from ${rpcUrl}`);
        return r.json();
      });

      // Sequential calls so an error on sigs triggers fallback to next RPC
      const balRes = await post('getBalance', [addr]);
      if (balRes.error) throw new Error(balRes.error.message || 'Solana RPC error.');

      const sigRes = await post('getSignaturesForAddress', [addr, { limit: 50 }]);
      if (sigRes.error) throw new Error(sigRes.error.message || 'Transaction history unavailable on this RPC.');

      const sigs = sigRes.result ?? [];

      // Fetch up to 10 transaction details in parallel to compute net SOL change per tx
      const details = await Promise.all(
        sigs.slice(0, 10).map(s =>
          post('getTransaction', [s.signature, { encoding: 'json', maxSupportedTransactionVersion: 0 }])
            .catch(() => null)
        )
      );

      const txs = sigs.map((sig, i) => {
        let netLamports = null;
        const d = i < 10 ? details[i] : null;
        if (d?.result) {
          const keys = d.result.transaction?.message?.accountKeys ?? [];
          const idx  = keys.indexOf(addr);
          if (idx !== -1) {
            netLamports = (d.result.meta?.postBalances?.[idx] ?? 0) -
                          (d.result.meta?.preBalances?.[idx]  ?? 0);
          }
        }
        return { ...sig, netLamports };
      });

      return {
        balance: balRes.result?.value ?? 0,
        txs,
      };
    } catch (e) {
      lastErr = e;
    }
  }

  throw new Error(`Solana lookup failed. All RPC endpoints blocked. (${lastErr.message})`);
}

// ─── Tx normalization (for CSV export) ───────────────────────────────────────
//
// Flattens chain-specific raw tx shapes into uniform rows for CSV export.
// Render functions compute direction/amount inline against the same source data;
// keeping a second copy here avoids refactoring 6 render paths at once.
// `opts.hexAddr` is required for TRX (TronGrid returns hex `41…` addresses).

function normalizeTxs(chainKey, rawTxs, addr, opts = {}) {
  const c = CHAINS[chainKey];
  if (!c || !rawTxs?.length) return [];

  const mkRow = (txHash, timestamp, direction, amountRaw, status) => ({
    chain:       c.name,
    symbol:      c.symbol,
    address:     addr ?? '',
    txHash:      txHash ?? '',
    timestamp:   timestamp || null,
    isoDate:     timestamp ? new Date(timestamp * 1000).toISOString() : '',
    direction,                                                     // 'sent' | 'received' | 'self' | ''
    amountCoin:  amountRaw !== null && amountRaw !== undefined
                   ? Math.abs(amountRaw) / Math.pow(10, c.decimals)
                   : null,
    status,                                                        // 'confirmed' | 'pending' | 'failed'
    explorerUrl: txHash ? c.explorer.tx + txHash : '',
  });

  // BTC (mempool.space format)
  if (chainKey === 'btc') {
    return rawTxs.map(tx => {
      let received = 0, sent = 0;
      if (addr) {
        for (const o of tx.vout) if (o.scriptpubkey_address === addr) received += o.value;
        for (const i of tx.vin)  if (i.prevout?.scriptpubkey_address === addr) sent += i.value;
      }
      const net = addr ? received - sent : null;
      const dir = net === null ? '' : net > 0 ? 'received' : net < 0 ? 'sent' : 'self';
      return mkRow(tx.txid, tx.status.block_time, dir, net,
        tx.status.confirmed ? 'confirmed' : 'pending');
    });
  }

  // EVM (already pre-normalized by apiEvmFull)
  if (c.evmKey) {
    const addrLower = addr.toLowerCase();
    return rawTxs.map(tx => {
      const isSend    = tx.fromAddr === addrLower;
      const isReceive = tx.toAddr   === addrLower;
      const dir = tx.isError ? '' : isSend && !isReceive ? 'sent'
                  : isReceive && !isSend ? 'received' : 'self';
      return mkRow(tx.hash, tx.timestamp, dir, tx.valueRaw,
        tx.isError ? 'failed' : 'confirmed');
    });
  }

  // Blockchair chains (LTC, DOGE, BCH, DASH)
  if (c.blockchairKey) {
    return rawTxs.map(({ hash, transaction: txData, inputs = [], outputs = [] }) => {
      let received = 0, sent = 0;
      for (const o of outputs) if (o.recipient === addr) received += o.value;
      for (const i of inputs)  if (i.recipient === addr) sent     += i.value;
      const net = received - sent;
      const dir = net > 0 ? 'received' : net < 0 ? 'sent' : 'self';
      const confirmed = (txData?.block_id ?? 0) > 0;
      const ts = txData?.time
        ? Math.floor(new Date(txData.time.replace(' ', 'T') + 'Z').getTime() / 1000)
        : 0;
      return mkRow(hash, ts, dir, net, confirmed ? 'confirmed' : 'pending');
    });
  }

  // Tron (TronGrid) — direction needs hex `41…` address
  if (chainKey === 'trx') {
    const hexAddr = opts.hexAddr;
    return rawTxs.map(tx => {
      const contract  = tx.raw_data?.contract?.[0];
      const val       = contract?.parameter?.value ?? {};
      const amount    = val.amount ?? 0;
      const ownerAddr = val.owner_address ?? '';
      const toAddr    = val.to_address    ?? '';
      const isSend    = hexAddr && ownerAddr === hexAddr;
      const isReceive = hexAddr && toAddr    === hexAddr;
      const status    = tx.ret?.[0]?.contractRet ?? 'UNKNOWN';
      const ts        = tx.block_timestamp ? Math.floor(tx.block_timestamp / 1000) : 0;
      const dir       = isSend && !isReceive ? 'sent'
                        : isReceive && !isSend ? 'received' : 'self';
      return mkRow(tx.txID, ts, dir, amount, status === 'SUCCESS' ? 'confirmed' : 'failed');
    });
  }

  // XRP (XRPL)
  if (chainKey === 'xrp') {
    const XRPL_EPOCH = 946684800;
    return rawTxs.map(entry => {
      const tx     = entry.tx ?? entry;
      const meta   = entry.meta;
      const hash   = tx.hash ?? '';
      const ts     = tx.date ? tx.date + XRPL_EPOCH : 0;
      const isSend = tx.Account === addr;
      const amount = typeof tx.Amount === 'string' ? Number(tx.Amount) : 0;   // drops; non-XRP issuances → 0
      const ok     = meta?.TransactionResult === 'tesSUCCESS';
      const dir    = isSend ? 'sent' : 'received';
      return mkRow(hash, ts, dir, amount, ok ? 'confirmed' : 'failed');
    });
  }

  // Solana (only first ~10 sigs have netLamports; rest stay null)
  if (chainKey === 'sol') {
    return rawTxs.map(tx => {
      const net = tx.netLamports;
      const dir = net === null ? '' : net > 0 ? 'received' : net < 0 ? 'sent' : 'self';
      return mkRow(tx.signature, tx.blockTime, dir, net, tx.err ? 'failed' : 'confirmed');
    });
  }

  return [];
}

// RFC 4180 CSV: quote fields containing comma/quote/newline; double internal quotes.
function toCsv(rows) {
  const headers = ['Chain', 'Symbol', 'Address', 'Tx Hash', 'Timestamp (ISO)',
                   'Direction', 'Amount', 'Status', 'Explorer URL'];
  const esc = v => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([
      r.chain, r.symbol, r.address, r.txHash, r.isoDate, r.direction,
      r.amountCoin !== null ? r.amountCoin : '',
      r.status, r.explorerUrl,
    ].map(esc).join(','));
  }
  return lines.join('\r\n');
}

function downloadCsv(rows) {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `kiwipit-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Rendering ────────────────────────────────────────────────────────────────
//
// All render* functions take a `card` element (the .wallet-card root for one
// wallet) and use card.querySelector(...). This lets multiple wallets render
// independently into their own cards.

function paintCardAccent(chainKey, card) {
  const c = CHAINS[chainKey];
  if (c) card.style.setProperty('--accent', c.color);
}

function renderChainHeader(chainKey, addr, card) {
  const c = CHAINS[chainKey];
  const badge = card.querySelector('.chain-badge');
  badge.textContent       = `${c.icon} ${c.name}`;
  badge.style.color       = c.color;
  badge.style.borderColor = c.color;

  card.querySelector('.explorer-addr-link').href = c.explorer.addr + encodeURIComponent(addr);
}

function renderBalance(raw, chain, card) {
  const c = CHAINS[chain];
  card.querySelector('.balance-amount').textContent = fmtAmount(raw, c.decimals, c.symbol);
  card.querySelector('.balance-usd').textContent    = fmtFiat(raw, c.decimals, c.cgId);
}

function renderStats(received, sent, txCount, chain, card) {
  const c = CHAINS[chain];
  const row = card.querySelector('.stats-row');

  if (received === null && sent === null && txCount === null) {
    row.classList.add('hidden');
    return;
  }
  row.classList.remove('hidden');
  row.querySelector('.stat-received').textContent = received !== null ? fmtAmount(received, c.decimals, c.symbol) : '—';
  row.querySelector('.stat-sent').textContent     = sent     !== null ? fmtAmount(sent,     c.decimals, c.symbol) : '—';
  row.querySelector('.stat-txcount').textContent  = txCount  !== null ? txCount.toLocaleString() : '—';
}

// Bitcoin: full net-per-address tx list
function renderBtcTxs(txs, addr, chain, card) {
  const c    = CHAINS[chain];
  const list = card.querySelector('.tx-list');

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
    <div class="tx-usd">${absNet !== null ? fmtFiat(absNet, c.decimals, c.cgId) : ''}</div>
  </div>
</div>`;
  }).join('');
}

// Blockchair chains (LTC, DOGE, BCH, DASH): net-per-address tx list
function renderBlockchairTxs(txs, addr, chain, card) {
  const c    = CHAINS[chain];
  const list = card.querySelector('.tx-list');
  if (!txs?.length) { list.innerHTML = '<p class="tx-empty">No transactions found.</p>'; return; }

  list.innerHTML = txs.map(({ hash, transaction: txData, inputs = [], outputs = [] }) => {
    let received = 0, sent = 0;
    for (const o of outputs) if (o.recipient === addr) received += o.value;
    for (const i of inputs)  if (i.recipient === addr) sent     += i.value;

    const net       = received - sent;
    const absNet    = Math.abs(net);
    const cls       = net > 0 ? 'positive' : net < 0 ? 'negative' : 'neutral';
    const prefix    = net > 0 ? '+' : net < 0 ? '−' : '';
    const confirmed = (txData?.block_id ?? 0) > 0;
    const ts        = txData?.time
      ? Math.floor(new Date(txData.time.replace(' ', 'T') + 'Z').getTime() / 1000)
      : 0;

    return `<div class="tx-item">
  <div>
    <a class="tx-id" href="${c.explorer.tx}${hash}" target="_blank" rel="noopener">${shortId(hash)}</a>
    <span class="tx-badge ${confirmed ? 'confirmed' : 'unconfirmed'}">${confirmed ? 'confirmed' : 'pending'}</span>
    <div class="tx-meta">${fmtDate(ts)}</div>
  </div>
  <div class="tx-right">
    <div class="tx-amount ${cls}">${prefix}${fmtAmount(absNet, c.decimals, c.symbol)}</div>
    <div class="tx-usd">${fmtFiat(absNet, c.decimals, c.cgId)}</div>
  </div>
</div>`;
  }).join('');
}

// EVM: full transaction list (Routescan / Etherscan-compat)
function renderEvmTxs(txs, addr, chain, card) {
  const c    = CHAINS[chain];
  const list = card.querySelector('.tx-list');
  if (!txs?.length) { list.innerHTML = '<p class="tx-empty">No transactions found.</p>'; return; }

  const addrLower = addr.toLowerCase();
  list.innerHTML = txs.map(tx => {
    const isSend    = tx.fromAddr === addrLower;
    const isReceive = tx.toAddr   === addrLower;
    const cls    = tx.isError ? 'neutral' : isSend && !isReceive ? 'negative' : isReceive && !isSend ? 'positive' : 'neutral';
    const prefix = cls === 'negative' ? '−' : cls === 'positive' ? '+' : '';
    const badge  = tx.isError ? 'failed' : 'confirmed';

    return `<div class="tx-item">
  <div>
    <a class="tx-id" href="${c.explorer.tx}${tx.hash}" target="_blank" rel="noopener">${shortId(tx.hash)}</a>
    <span class="tx-badge ${badge}">${badge}</span>
    <div class="tx-meta">${fmtDate(tx.timestamp)}</div>
  </div>
  <div class="tx-right">
    <div class="tx-amount ${cls}">${prefix}${fmtAmount(tx.valueRaw, c.decimals, c.symbol)}</div>
    <div class="tx-usd">${fmtFiat(tx.valueRaw, c.decimals, c.cgId)}</div>
  </div>
</div>`;
  }).join('');
}

// TRX: transaction list from TronGrid (direction via hex address comparison)
function renderTrxTxs(txs, hexAddr, chain, card) {
  const c    = CHAINS[chain];
  const list = card.querySelector('.tx-list');
  if (!txs?.length) { list.innerHTML = '<p class="tx-empty">No transactions found.</p>'; return; }

  list.innerHTML = txs.map(tx => {
    const contract  = tx.raw_data?.contract?.[0];
    const val       = contract?.parameter?.value ?? {};
    const amount    = val.amount ?? 0;
    const ownerAddr = val.owner_address ?? '';
    const toAddr    = val.to_address    ?? '';
    const isSend    = hexAddr && ownerAddr === hexAddr;
    const isReceive = hexAddr && toAddr    === hexAddr;
    const type      = contract?.type ?? '';
    const status    = tx.ret?.[0]?.contractRet ?? 'UNKNOWN';
    const ts        = tx.block_timestamp ? tx.block_timestamp / 1000 : 0;
    const cls       = isSend && !isReceive ? 'negative' : isReceive && !isSend ? 'positive' : 'neutral';
    const prefix    = cls === 'negative' ? '−' : cls === 'positive' ? '+' : '';

    return `<div class="tx-item">
  <div>
    <a class="tx-id" href="${c.explorer.tx}${tx.txID}" target="_blank" rel="noopener">${shortId(tx.txID)}</a>
    <span class="tx-badge ${status === 'SUCCESS' ? 'success' : 'failed'}">${status}</span>
    <div class="tx-meta">${fmtDate(ts)} · ${type}</div>
  </div>
  <div class="tx-right">
    <div class="tx-amount ${cls}">${prefix}${fmtAmount(amount, c.decimals, c.symbol)}</div>
    <div class="tx-usd">${fmtFiat(amount, c.decimals, c.cgId)}</div>
  </div>
</div>`;
  }).join('');
}

// XRP: transaction list from XRPL
function renderXrpTxs(txs, addr, chain, card) {
  const c    = CHAINS[chain];
  const list = card.querySelector('.tx-list');
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
    <div class="tx-usd">${fmtFiat(amount, c.decimals, c.cgId)}</div>
  </div>
</div>`;
  }).join('');
}

// Solana: recent transactions with net SOL change per address
function renderSolTxs(txs, chain, card) {
  const c    = CHAINS[chain];
  const list = card.querySelector('.tx-list');
  if (!txs?.length) { list.innerHTML = '<p class="tx-empty">No transactions found.</p>'; return; }

  list.innerHTML = txs.map(tx => {
    const ok     = !tx.err;
    const net    = tx.netLamports;
    const absNet = net !== null ? Math.abs(net) : null;
    const cls    = net === null ? 'neutral' : net > 0 ? 'positive' : net < 0 ? 'negative' : 'neutral';
    const prefix = net > 0 ? '+' : net < 0 ? '−' : '';

    return `<div class="tx-item">
  <div>
    <a class="tx-id" href="${c.explorer.tx}${tx.signature}" target="_blank" rel="noopener">${shortId(tx.signature)}</a>
    <span class="tx-badge ${ok ? 'confirmed' : 'failed'}">${ok ? 'confirmed' : 'failed'}</span>
    <div class="tx-meta">${fmtDate(tx.blockTime)}</div>
  </div>
  <div class="tx-right">
    <div class="tx-amount ${cls}">${absNet !== null ? prefix + fmtAmount(absNet, c.decimals, c.symbol) : '—'}</div>
    <div class="tx-usd">${absNet !== null ? fmtFiat(absNet, c.decimals, c.cgId) : ''}</div>
  </div>
</div>`;
  }).join('');
}

// Explorer-link fallback for chains without a full tx list
function renderExplorerFallback(addr, chain, card) {
  const c    = CHAINS[chain];
  const list = card.querySelector('.tx-list');
  list.innerHTML = `<a class="explorer-btn" href="${c.explorer.addr}${encodeURIComponent(addr)}" target="_blank" rel="noopener noreferrer">
  View full transaction history on ${new URL(c.explorer.addr).hostname} ↗
</a>`;
}

// ─── Unified Lookup ───────────────────────────────────────────────────────────

async function lookupChain(rawInput, chainKey, card) {
  const input = rawInput.trim();
  const c     = CHAINS[chainKey];

  card.querySelector('.address-label').textContent =
    input.length > 60 ? input.slice(0, 24) + '…' + input.slice(-12) : input;

  paintCardAccent(chainKey, card);
  renderChainHeader(chainKey, input, card);

  // Each branch returns { chainKey, balanceRaw, txRows } — chainKey is a valid
  // CHAINS key (btc-xpub normalizes to 'btc'); balanceRaw is the smallest-unit
  // balance (sats / wei-equivalent / sun / drops / lamports); txRows is the flat
  // CSV-shaped tx list. handleLookupAll collects these and hands balances to
  // renderPortfolio and txRows to the CSV exporter.

  // ── Bitcoin ──
  if (chainKey === 'btc') {
    const d = await apiBtcAddress(input);
    renderBalance(d.balance, 'btc', card);
    renderStats(d.received, d.spent, d.txCount, 'btc', card);
    renderBtcTxs(d.txs, d.txAddr, 'btc', card);
    return { chainKey: 'btc', balanceRaw: d.balance, txRows: normalizeTxs('btc', d.txs, input) };
  }

  if (chainKey === 'btc-xpub') {
    const d = await apiBtcXpub(input);
    renderBalance(d.balance, 'btc', card);
    renderStats(d.received, d.spent, d.txCount, 'btc', card);
    renderBtcTxs(d.txs, null, 'btc', card);
    // xpub: per-address direction is unknowable without deriving each output script, so passes null addr → blank direction/amount in CSV
    return { chainKey: 'btc', balanceRaw: d.balance, txRows: normalizeTxs('btc', d.txs, input) };
  }

  // ── EVM chains (ETH, BNB, MATIC, AVAX, ARB, OP) ──
  if (c.evmKey) {
    const d = await apiEvmFull(chainKey, input);
    renderBalance(d.balanceRaw, chainKey, card);
    renderStats(null, null, null, chainKey, card);
    renderEvmTxs(d.txs, input, chainKey, card);
    return { chainKey, balanceRaw: d.balanceRaw, txRows: normalizeTxs(chainKey, d.txs, input) };
  }

  // ── Blockchair chains (LTC, DOGE, BCH, DASH) ──
  if (c.blockchairKey) {
    const d = await apiBlockchair(c.blockchairKey, input);
    renderBalance(d.balance, chainKey, card);
    renderStats(d.received, d.spent, d.txCount, chainKey, card);
    renderBlockchairTxs(d.txs, input, chainKey, card);
    return { chainKey, balanceRaw: d.balance, txRows: normalizeTxs(chainKey, d.txs, input) };
  }

  // ── Tron ──
  if (chainKey === 'trx') {
    const d = await apiTrx(input);
    renderBalance(d.balance, 'trx', card);
    renderStats(null, null, d.txCount || null, 'trx', card);
    renderTrxTxs(d.txs, d.hexAddr, 'trx', card);
    return { chainKey: 'trx', balanceRaw: d.balance, txRows: normalizeTxs('trx', d.txs, input, { hexAddr: d.hexAddr }) };
  }

  // ── XRP ──
  if (chainKey === 'xrp') {
    const d = await apiXrp(input);
    renderBalance(d.balance, 'xrp', card);
    renderStats(null, null, null, 'xrp', card);
    renderXrpTxs(d.txs, input, 'xrp', card);
    return { chainKey: 'xrp', balanceRaw: d.balance, txRows: normalizeTxs('xrp', d.txs, input) };
  }

  // ── Solana ──
  if (chainKey === 'sol') {
    const d = await apiSol(input);
    renderBalance(d.balance, 'sol', card);
    renderStats(null, null, null, 'sol', card);
    renderSolTxs(d.txs, 'sol', card);
    return { chainKey: 'sol', balanceRaw: d.balance, txRows: normalizeTxs('sol', d.txs, input) };
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

// ─── Wallet rows (multi-input) ────────────────────────────────────────────────

let nextWalletId = 1;

function makeWalletRow() {
  const id = nextWalletId++;
  const row = document.createElement('div');
  row.className = 'wallet-row';
  row.dataset.id      = String(id);
  row.dataset.evmChain = 'eth';
  row.innerHTML = `
    <div class="search-row">
      <div class="input-wrap">
        <input type="text" class="search-input wallet-input"
          placeholder="Paste any wallet address or public key…"
          autocomplete="off" spellcheck="false" />
        <span class="detected-chip hidden"></span>
      </div>
      <button type="button" class="remove-wallet" title="Remove wallet" aria-label="Remove wallet">×</button>
    </div>
    <div class="evm-selector hidden">
      <span class="evm-label">Select network:</span>
      <div class="evm-tabs">${EVM_CHAINS.map(key => {
        const c = CHAINS[key];
        return `<button type="button" class="evm-tab${key === 'eth' ? ' active' : ''}"
          data-chain="${key}" style="--tab-color:${c.color}">${c.symbol === 'ETH' ? c.name : c.symbol}</button>`;
      }).join('')}</div>
    </div>
  `;

  const tabs = row.querySelector('.evm-tabs');
  tabs.addEventListener('click', e => {
    const btn = e.target.closest('.evm-tab');
    if (!btn) return;
    tabs.querySelectorAll('.evm-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    row.dataset.evmChain = btn.dataset.chain;
  });

  const input = row.querySelector('.wallet-input');
  let timer = null;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => updateRowDetection(row), 150);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLookupAll();
  });

  row.querySelector('.remove-wallet').addEventListener('click', () => {
    row.remove();
    updateRemoveButtons();
  });

  return row;
}

function updateRowDetection(row) {
  const val      = row.querySelector('.wallet-input').value.trim();
  const detected = detectChain(val);
  const chip     = row.querySelector('.detected-chip');
  const evmSel   = row.querySelector('.evm-selector');

  if (!detected || detected === 'evm') {
    chip.classList.add('hidden');
  } else {
    const key = detected === 'btc-xpub' ? 'btc' : detected;
    const c   = CHAINS[key];
    if (c) {
      chip.textContent      = `${c.icon} ${c.symbol}`;
      chip.style.color      = c.color;
      chip.style.background = c.color + '22';
      chip.classList.remove('hidden');
    }
  }

  evmSel.classList.toggle('hidden', detected !== 'evm');
}

function updateRemoveButtons() {
  const rows = document.querySelectorAll('.wallet-row');
  rows.forEach(row => {
    row.querySelector('.remove-wallet').hidden = rows.length === 1;
  });
}

function addWalletRow(focus = true) {
  const row = makeWalletRow();
  document.getElementById('walletList').appendChild(row);
  updateRemoveButtons();
  if (focus) row.querySelector('.wallet-input').focus();
  return row;
}

// ─── Wallet result card ──────────────────────────────────────────────────────

function makeWalletCard() {
  const card = document.createElement('div');
  card.className = 'wallet-card';
  card.innerHTML = `
    <div class="chain-header">
      <div class="chain-badge"></div>
      <a class="explorer-addr-link" href="#" target="_blank" rel="noopener noreferrer">View on explorer ↗</a>
    </div>
    <p class="address-label"></p>
    <div class="balance-card">
      <span class="balance-label">Balance</span>
      <span class="balance-amount">—</span>
      <span class="balance-usd"></span>
    </div>
    <div class="stats-row hidden">
      <div class="stat-card"><span class="stat-label">Total Received</span><span class="stat-value green stat-received">—</span></div>
      <div class="stat-card"><span class="stat-label">Total Sent</span><span class="stat-value red stat-sent">—</span></div>
      <div class="stat-card"><span class="stat-label">Transactions</span><span class="stat-value stat-txcount">—</span></div>
    </div>
    <div class="tx-section">
      <h2 class="tx-header">Recent Transactions</h2>
      <div class="tx-list"></div>
    </div>
  `;
  return card;
}

// ─── Portfolio summary ───────────────────────────────────────────────────────
//
// Aggregates wallet balances by CoinGecko id (so ETH on mainnet/Arbitrum/Optimism
// — all cgId 'ethereum' — collapse into one slice). For each cgId group the
// display name and color come from the first chain in CHAINS matching that
// cgId; for 'ethereum' that's 'eth'.

function renderPortfolio(walletResults, exportRows = []) {
  const el = document.getElementById('portfolio');
  el.innerHTML = '';

  if (!walletResults.length) {
    el.classList.add('hidden');
    return;
  }

  const byCgId = new Map();
  for (const { chainKey, balanceRaw } of walletResults) {
    const c = CHAINS[chainKey];
    if (!c) continue;
    const coinAmount = balanceRaw / Math.pow(10, c.decimals);
    const p = priceFor(c.cgId);

    let slice = byCgId.get(c.cgId);
    if (!slice) {
      const refChain = Object.values(CHAINS).find(x => x.cgId === c.cgId);
      slice = {
        cgId:       c.cgId,
        name:       refChain.name,
        color:      refChain.color,
        coinAmount: 0,
        fiatValue:  0,
        hasPrice:   p !== null,
      };
      byCgId.set(c.cgId, slice);
    }
    slice.coinAmount += coinAmount;
    if (slice.hasPrice) slice.fiatValue += coinAmount * p;
  }

  const slices       = [...byCgId.values()].sort((a, b) => b.fiatValue - a.fiatValue);
  const pricedSlices = slices.filter(s => s.hasPrice && s.fiatValue > 0);
  const total        = pricedSlices.reduce((sum, s) => sum + s.fiatValue, 0);

  const { code, locale } = CURRENCIES[activeCurrency];
  const fmtCurrency = v => new Intl.NumberFormat(locale, {
    style: 'currency', currency: code,
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(v);

  const totalHtml = pricedSlices.length
    ? `<div class="portfolio-total">${fmtCurrency(total)}</div>`
    : `<div class="portfolio-total muted">Prices unavailable</div>`;

  let chartHtml = '';
  if (pricedSlices.length === 1) {
    // Single slice — render a full circle; SVG arc paths are undefined at 360°.
    chartHtml = `<svg viewBox="0 0 100 100" class="portfolio-pie" aria-hidden="true">
      <circle cx="50" cy="50" r="45" fill="${pricedSlices[0].color}"/>
    </svg>`;
  } else if (pricedSlices.length >= 2) {
    chartHtml = buildPieSvg(pricedSlices, total);
  }

  const legendHtml = slices.map(s => {
    const pctText = s.hasPrice && total > 0
      ? ((s.fiatValue / total) * 100).toFixed(1) + '%'
      : '—';
    const valText = s.hasPrice ? fmtCurrency(s.fiatValue) : 'no price';
    return `<div class="portfolio-row">
      <span class="portfolio-swatch" style="background:${s.color}"></span>
      <span class="portfolio-name">${s.name}</span>
      <span class="portfolio-value">${valText}</span>
      <span class="portfolio-pct">${pctText}</span>
    </div>`;
  }).join('');

  const exportBtnHtml = exportRows.length
    ? `<button type="button" class="export-csv-btn" id="exportCsvBtn">Export CSV ↓</button>`
    : '';

  el.innerHTML = `
    <div class="portfolio-header-row">
      <div class="portfolio-header">Portfolio</div>
      ${exportBtnHtml}
    </div>
    ${totalHtml}
    <div class="portfolio-body">
      ${chartHtml ? `<div class="portfolio-chart">${chartHtml}</div>` : ''}
      <div class="portfolio-legend">${legendHtml}</div>
    </div>
  `;
  el.classList.remove('hidden');

  if (exportRows.length) {
    document.getElementById('exportCsvBtn').addEventListener('click', () => downloadCsv(exportRows));
  }
}

function buildPieSvg(slices, total) {
  const cx = 50, cy = 50, r = 45;
  let angle = -Math.PI / 2;   // start at 12 o'clock
  const paths = slices.map(s => {
    const frac = s.fiatValue / total;
    const a2   = angle + frac * 2 * Math.PI;
    const x1   = cx + r * Math.cos(angle);
    const y1   = cy + r * Math.sin(angle);
    const x2   = cx + r * Math.cos(a2);
    const y2   = cy + r * Math.sin(a2);
    const largeArc = frac > 0.5 ? 1 : 0;
    angle = a2;
    return `<path d="M ${cx},${cy} L ${x1.toFixed(3)},${y1.toFixed(3)} A ${r},${r} 0 ${largeArc} 1 ${x2.toFixed(3)},${y2.toFixed(3)} Z" fill="${s.color}"/>`;
  });
  return `<svg viewBox="0 0 100 100" class="portfolio-pie" aria-hidden="true">${paths.join('')}</svg>`;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

async function handleLookupAll() {
  const rows  = [...document.querySelectorAll('.wallet-row')];
  const tasks = rows
    .map(row => ({ row, input: row.querySelector('.wallet-input').value.trim() }))
    .filter(t => t.input);

  const portfolio = document.getElementById('portfolio');

  if (tasks.length === 0) {
    portfolio.classList.add('hidden');
    portfolio.innerHTML = '';
    return;
  }

  setLoading(true);
  setError('');

  portfolio.classList.add('hidden');
  portfolio.innerHTML = '';

  const results = document.getElementById('results');
  results.innerHTML = '';
  results.classList.remove('hidden');

  const portfolioData = [];
  const allTxRows     = [];

  try {
    await fetchPrices();

    await Promise.all(tasks.map(async ({ row, input }) => {
      const card = makeWalletCard();
      results.appendChild(card);
      try {
        const detected = detectChain(input);
        if (!detected) throw new Error('Address format not recognised.');
        const chainKey = detected === 'evm' ? (row.dataset.evmChain || 'eth') : detected;
        const result = await lookupChain(input, chainKey, card);
        if (result) {
          portfolioData.push(result);
          if (result.txRows?.length) allTxRows.push(...result.txRows);
        }
      } catch (err) {
        const short = input.length > 50 ? input.slice(0, 24) + '…' + input.slice(-8) : input;
        card.innerHTML = `<div class="wallet-card-error"><strong>${short}</strong> — ${err.message || 'Lookup failed.'}</div>`;
      }
    }));

    allTxRows.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    renderPortfolio(portfolioData, allTxRows);
  } catch (err) {
    setError(err.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
}

// ─── Events ───────────────────────────────────────────────────────────────────

document.getElementById('lookupBtn').addEventListener('click', handleLookupAll);
document.getElementById('addWalletBtn').addEventListener('click', () => addWalletRow());

// ─── Currency switcher ───────────────────────────────────────────────────────

function paintCurrencyButtons() {
  document.querySelectorAll('#currencySwitch .currency-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.currency === activeCurrency);
  });
}

document.getElementById('currencySwitch').addEventListener('click', e => {
  const btn = e.target.closest('.currency-btn');
  if (!btn || btn.dataset.currency === activeCurrency) return;
  activeCurrency = btn.dataset.currency;
  localStorage.setItem('kp.currency', activeCurrency);
  paintCurrencyButtons();
  // Re-run the active lookup so all fiat values refresh in the new currency.
  if (!document.getElementById('results').classList.contains('hidden')) {
    handleLookupAll();
  }
});

// ─── Init ─────────────────────────────────────────────────────────────────────

addWalletRow(false);
paintCurrencyButtons();
