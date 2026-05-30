const API = 'https://mempool.space/api';
let btcPrice = null;

// ── Helpers ────────────────────────────────────────────────

function satsToBtc(sats) {
  return sats / 1e8;
}

function fmtBtc(sats) {
  const n = satsToBtc(Math.abs(sats));
  // Trim trailing zeros but keep at least 2 decimals
  const s = n.toFixed(8).replace(/0+$/, '').replace(/\.$/, '.00');
  return s + ' BTC';
}

function fmtUsd(sats) {
  if (!btcPrice || sats === 0) return '';
  const usd = satsToBtc(Math.abs(sats)) * btcPrice;
  return '≈ $' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(ts) {
  if (!ts) return 'pending';
  return new Date(ts * 1000).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function shortId(id) {
  return id.slice(0, 8) + '…' + id.slice(-8);
}

// ── Input detection ────────────────────────────────────────

function classify(input) {
  if (/^[xyz]pub[A-Za-z0-9]{100,}/.test(input)) return 'xpub';
  if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(input)) return 'address';
  if (/^bc1[a-zA-Z0-9]{6,87}$/.test(input))             return 'address';
  return null;
}

// ── Net amount for a given address in a transaction ────────

function netAmount(tx, addr) {
  let received = 0;
  let sent = 0;
  for (const vout of tx.vout) {
    if (vout.scriptpubkey_address === addr) received += vout.value;
  }
  for (const vin of tx.vin) {
    if (vin.prevout && vin.prevout.scriptpubkey_address === addr) sent += vin.prevout.value;
  }
  return received - sent;
}

// ── Render ─────────────────────────────────────────────────

function renderStats(balance, received, spent, txCount) {
  document.getElementById('balanceBtc').textContent  = fmtBtc(balance);
  document.getElementById('balanceUsd').textContent  = fmtUsd(balance);
  document.getElementById('statReceived').textContent = fmtBtc(received);
  document.getElementById('statSent').textContent     = fmtBtc(spent);
  document.getElementById('statTxCount').textContent  = txCount.toLocaleString();
}

function renderTxList(txs, addr) {
  const list = document.getElementById('txList');

  if (!txs || txs.length === 0) {
    list.innerHTML = '<p class="tx-empty">No transactions found.</p>';
    return;
  }

  list.innerHTML = txs.map(tx => {
    const net        = addr ? netAmount(tx, addr) : null;
    const confirmed  = tx.status.confirmed;
    const date       = fmtDate(tx.status.block_time);

    let amtClass = 'neutral';
    let amtText  = '—';
    let usdText  = '';

    if (net !== null) {
      amtClass = net > 0 ? 'positive' : net < 0 ? 'negative' : 'neutral';
      const prefix = net > 0 ? '+' : net < 0 ? '−' : '';
      amtText  = prefix + fmtBtc(net);
      usdText  = fmtUsd(net);
    }

    return `
<div class="tx-item">
  <div>
    <a class="tx-id"
       href="https://mempool.space/tx/${tx.txid}"
       target="_blank" rel="noopener noreferrer"
    >${shortId(tx.txid)}</a>
    <span class="tx-badge ${confirmed ? 'confirmed' : 'unconfirmed'}">
      ${confirmed ? 'confirmed' : 'unconfirmed'}
    </span>
    <div class="tx-meta">${date}</div>
  </div>
  <div class="tx-right">
    <div class="tx-amount ${amtClass}">${amtText}</div>
    <div class="tx-usd">${usdText}</div>
  </div>
</div>`;
  }).join('');
}

// ── Lookup ─────────────────────────────────────────────────

async function fetchBtcPrice() {
  try {
    const r = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
    );
    if (r.ok) {
      const d = await r.json();
      btcPrice = d.bitcoin.usd;
    }
  } catch { /* price is optional */ }
}

async function lookupAddress(addr) {
  document.getElementById('addressLabel').textContent = addr;

  const [info, txs] = await Promise.all([
    fetch(`${API}/address/${addr}`).then(r => {
      if (!r.ok) throw new Error('Address not found. Double-check the address and try again.');
      return r.json();
    }),
    fetch(`${API}/address/${addr}/txs`).then(r => {
      if (!r.ok) throw new Error('Could not fetch transactions.');
      return r.json();
    }),
  ]);

  const received = info.chain_stats.funded_txo_sum  + info.mempool_stats.funded_txo_sum;
  const spent    = info.chain_stats.spent_txo_sum   + info.mempool_stats.spent_txo_sum;
  const balance  = received - spent;
  const txCount  = info.chain_stats.tx_count        + info.mempool_stats.tx_count;

  renderStats(balance, received, spent, txCount);
  renderTxList(txs, addr);
}

async function lookupXpub(xpub) {
  document.getElementById('addressLabel').textContent =
    xpub.slice(0, 16) + '…' + xpub.slice(-8);

  const [info, txs] = await Promise.all([
    fetch(`${API}/v1/xpub/${xpub}`).then(r => {
      if (!r.ok) throw new Error('Extended public key not found or not yet indexed. Try a specific address instead.');
      return r.json();
    }),
    fetch(`${API}/v1/xpub/${xpub}/txs`).then(r => {
      if (!r.ok) throw new Error('Could not fetch transactions for this xpub.');
      return r.json();
    }),
  ]);

  const received = info.funded_txo_sum;
  const spent    = info.spent_txo_sum;
  const balance  = info.balance ?? (received - spent);

  renderStats(balance, received, spent, info.tx_count);
  // For xpub we don't have a single address, show totals only
  renderTxList(txs, null);
}

// ── UI state ───────────────────────────────────────────────

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

// ── Main handler ───────────────────────────────────────────

async function handleLookup() {
  const input = document.getElementById('addressInput').value.trim();
  if (!input) return;

  setLoading(true);
  setError('');
  setResults(false);

  try {
    await fetchBtcPrice();

    const kind = classify(input);
    if (!kind) {
      throw new Error(
        'Unrecognised format. Enter a Bitcoin address (1…, 3…, or bc1…) or an extended public key (xpub / ypub / zpub).'
      );
    }

    if (kind === 'xpub') {
      await lookupXpub(input);
    } else {
      await lookupAddress(input);
    }

    setResults(true);
  } catch (err) {
    setError(err.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
}

// ── Events ─────────────────────────────────────────────────

document.getElementById('lookupBtn').addEventListener('click', handleLookup);
document.getElementById('addressInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleLookup();
});
