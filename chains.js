// ─── Chain Registry ───────────────────────────────────────────────────────────
//
// Pure data + pure detection logic. No DOM, no fetch — safe to import from
// Node-based tests as well as from the browser-side app.js.

export const CHAINS = {
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

// ─── Chain Detection ──────────────────────────────────────────────────────────

export function detectChain(s) {
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
