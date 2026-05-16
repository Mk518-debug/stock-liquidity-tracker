// ─── Application Controller ────────────────────────────────────────────────────

let demoLoop   = null;   // simulated tick loop
let pollLoop   = null;   // Yahoo quote poll loop
let newsLoop   = null;   // Yahoo news refresh loop
let yahooReady = false;  // true once first real quote lands

// ─── Boot ─────────────────────────────────────────────────────────────────────
function boot() {
  initState();
  renderTableHeaders();
  fullRender();

  // Start demo loop immediately — will be replaced by real data
  startDemoLoop();

  // Auto-connect Yahoo Finance (no key needed)
  activateYahoo();

  // Filter input
  const fi = document.getElementById('filter-input');
  if (fi) fi.addEventListener('input', e => {
    STATE.filterText = e.target.value;
    const fn = window.getFilteredSorted || getSortedStocks;
    renderTable(fn());
  });

  // Escape closes panels
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('settings-modal').classList.contains('open')) closeSettings();
      else if (STATE.selectedTicker) closeDetail();
    }
  });
}

function startDemoLoop() {
  if (demoLoop) return;
  demoLoop = setInterval(() => { tickUpdate(); fullRender(); }, CONFIG.DEMO_INTERVAL);
}

function stopDemoLoop() {
  if (demoLoop) { clearInterval(demoLoop); demoLoop = null; }
}

// ─── Yahoo Finance Activation ─────────────────────────────────────────────────
async function activateYahoo() {
  showToast('Connecting to Yahoo Finance…', 'info');

  const ok = await YAHOO.fetchQuotes();
  if (!ok) {
    showToast('Yahoo Finance unavailable — running demo mode', 'error');
    setBadge('error', 'DEMO');
    return;
  }

  yahooReady = true;
  stopDemoLoop();
  setBadge('live', 'YAHOO LIVE');
  showToast('Yahoo Finance connected — live data active', 'success');

  // Fetch first-minute volumes in background (slower, batched)
  YAHOO.fetchFirstMinuteVolumes();

  // Fetch news for top movers
  YAHOO.fetchNews();

  // Poll quotes every 20 seconds
  if (pollLoop) clearInterval(pollLoop);
  pollLoop = setInterval(() => YAHOO.fetchQuotes(), 20000);

  // Refresh news every 3 minutes
  if (newsLoop) clearInterval(newsLoop);
  newsLoop = setInterval(() => YAHOO.fetchNews(), 180000);

  // Keep a slow demo-like tick for visual smoothness between polls
  // (tiny price jiggles so the UI doesn't feel frozen)
  demoLoop = setInterval(() => {
    Object.values(STATE.stocks).forEach(s => {
      if (!s.price) return;
      const jiggle = s.price * (Math.random() - 0.5) * 0.0008;
      s.prevPrice = s.price;
      s.price    += jiggle;
      s.priceDir  = jiggle > 0 ? 'up' : jiggle < 0 ? 'down' : 'flat';
    });
    fullRender();
  }, 3000);
}

// ─── Yahoo Finance API Object ─────────────────────────────────────────────────
const YAHOO = {

  // ── Batch quote snapshot ─────────────────────────────────────────────────────
  async fetchQuotes() {
    const tickers = Object.keys(STATE.stocks).join(',');
    try {
      const res  = await fetch(`/api/quotes?tickers=${encodeURIComponent(tickers)}`);
      if (!res.ok) return false;
      const data = await res.json();
      const quotes = data.quoteResponse?.result;
      if (!quotes || quotes.length === 0) return false;

      quotes.forEach(q => {
        const s = STATE.stocks[q.symbol];
        if (!s) return;

        const prev     = s.price;
        s.price        = q.regularMarketPrice        ?? s.price;
        s.open         = q.regularMarketOpen         ?? s.open;
        s.change       = q.regularMarketChange       ?? s.change;
        s.changePct    = q.regularMarketChangePercent ?? s.changePct;
        s.volume       = q.regularMarketVolume        ?? s.volume;
        s.marketCap    = q.marketCap                  ?? s.marketCap;
        s.float        = q.floatShares                ?? s.float;
        s.sharesOut    = q.sharesOutstanding          ?? s.sharesOut;
        // Yahoo returns short % as decimal (0.21 = 21%)
        s.shortPct     = q.shortPercentOfFloat != null
                         ? q.shortPercentOfFloat * 100
                         : s.shortPct;
        s.avgVol       = q.averageDailyVolume10Day    ?? s.avgVol;
        s.priceDir     = s.price > prev ? 'up' : s.price < prev ? 'down' : 'flat';
        s.prevPrice    = prev;
        s.lastTrade    = Date.now();

        // Real exchange name
        if (q.fullExchangeName) s.exchange = q.fullExchangeName;

        // Relative volume — compare day volume vs. expected volume at this time
        const et       = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const minsOpen = Math.max(1, (et.getHours() * 60 + et.getMinutes()) - 570);
        const fraction = Math.min(minsOpen / 390, 1);
        const expected = s.avgVol * fraction;
        s.relVolume    = expected > 0 ? s.volume / expected : s.relVolume;

        // Activity score
        s.activity = Math.min(100, Math.floor(s.relVolume * 4 + Math.abs(s.changePct) * 2));

        // Sparkline
        s.sparkline.push(s.price);
        if (s.sparkline.length > 40) s.sparkline.shift();

        // Liquidity event: large volume spike with upward price move
        if (s.relVolume > CONFIG.HIGH_REL_VOL && s.priceDir === 'up' && !s.firstUpdate) {
          s.liqCount = Math.max(s.liqCount, Math.floor(s.relVolume / 3));
        }
        s.firstUpdate = false;
      });

      fullRender();
      return true;
    } catch (e) {
      console.error('Yahoo quotes error:', e);
      return false;
    }
  },

  // ── First-minute volumes (9:30 ET bar from 1m chart) ──────────────────────
  async fetchFirstMinuteVolumes() {
    const tickers = Object.keys(STATE.stocks);

    for (let i = 0; i < tickers.length; i += 4) {
      const batch = tickers.slice(i, i + 4);
      await Promise.all(batch.map(ticker => this._fetchFirstMin(ticker)));
      await sleep(400); // small pause between batches
    }
    fullRender();
  },

  async _fetchFirstMin(ticker) {
    try {
      const res  = await fetch(`/api/chart/${encodeURIComponent(ticker)}?interval=1m&range=1d`);
      if (!res.ok) return;
      const data = await res.json();
      const result = data.chart?.result?.[0];
      if (!result) return;

      const timestamps = result.timestamp || [];
      const volumes    = result.indicators?.quote?.[0]?.volume || [];

      if (timestamps.length > 0 && volumes.length > 0) {
        // First bar — convert unix timestamp to ET and check it's near 9:30
        const firstET = new Date(
          new Date(timestamps[0] * 1000).toLocaleString('en-US', { timeZone: 'America/New_York' })
        );
        const mins = firstET.getHours() * 60 + firstET.getMinutes();
        // Accept 9:28 – 9:35 window as "first minute"
        if (mins >= 568 && mins <= 575 && volumes[0] > 0) {
          STATE.stocks[ticker].firstMinVol = volumes[0];
        }
      }
    } catch (_) {}
  },

  // ── News (top movers first) ───────────────────────────────────────────────
  async fetchNews() {
    // Sort by absolute % change — fetch news for the 12 biggest movers
    const sorted = Object.values(STATE.stocks)
      .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
      .slice(0, 12);

    for (const s of sorted) {
      await this._fetchNewsFor(s.ticker, s.changePct);
      await sleep(250);
    }
    fullRender();
  },

  async _fetchNewsFor(ticker, changePct) {
    try {
      const res  = await fetch(`/api/news/${encodeURIComponent(ticker)}`);
      if (!res.ok) return;
      const data = await res.json();
      const articles = data.news || [];

      articles.slice(0, 4).forEach(article => {
        const item = {
          id:        article.uuid,
          ticker,
          headline:  article.title,
          time:      new Date((article.providerPublishTime || Date.now() / 1000) * 1000).toISOString(),
          sentiment: changePct >= 0 ? 'bullish' : 'bearish',
          source:    article.publisher || 'Yahoo Finance',
        };

        // Deduplicate by uuid
        if (!STATE.news.find(x => x.id === item.id)) {
          STATE.news.unshift(item);
          if (STATE.stocks[ticker]) STATE.stocks[ticker].news.unshift(item);
        }
      });

      STATE.news = STATE.news.slice(0, 40);
    } catch (_) {}
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function setBadge(type, label) {
  const el = document.getElementById('data-source-badge');
  if (!el) return;
  el.className = `data-source-badge ${type}`;
  el.textContent = label;
}

// ─── Stub for WebSocket (kept for future Polygon use) ─────────────────────────
const WS = { connect() {}, handleMessage() {}, subscribeAll() {} };

// ─── Entry point ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', boot);
