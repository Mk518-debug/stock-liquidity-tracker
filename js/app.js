// ─── Application Controller ────────────────────────────────────────────────────

let updateLoop  = null;   // demo ticker
let pollLoop    = null;   // REST API poll loop (live mode)
let liveMode    = false;

// ─── Boot ─────────────────────────────────────────────────────────────────────
function boot() {
  initState();
  renderTableHeaders();
  fullRender();

  // Start demo loop (replaced by real data once key is saved)
  startDemoLoop();

  // Wire up filter input
  const fi = document.getElementById('filter-input');
  if (fi) fi.addEventListener('input', e => {
    STATE.filterText = e.target.value;
    renderTable(getFilteredSorted ? getFilteredSorted() : getSortedStocks());
  });

  // Escape key closes panels
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('settings-modal').classList.contains('open')) closeSettings();
      else if (STATE.selectedTicker) closeDetail();
    }
  });

  setTimeout(() => showToast(t('toast_demo'), 'info'), 1200);
}

function startDemoLoop() {
  if (updateLoop) return;
  updateLoop = setInterval(() => { tickUpdate(); fullRender(); }, CONFIG.DEMO_INTERVAL);
}

function stopDemoLoop() {
  if (updateLoop) { clearInterval(updateLoop); updateLoop = null; }
}

// ─── Activate live Polygon.io data ───────────────────────────────────────────
function activateLive() {
  liveMode = true;
  stopDemoLoop();

  // 1. Fetch snapshot immediately for real prices
  fetchSnapshot().then(() => {
    // 2. After snapshot, fetch first-minute volumes (key metric)
    fetchFirstMinuteVolumes();
  });

  // 3. Fetch latest news
  fetchPolygonNews();

  // 4. Poll snapshot every 15 seconds (works on any plan tier)
  if (pollLoop) clearInterval(pollLoop);
  pollLoop = setInterval(async () => {
    await fetchSnapshot();
    fullRender();
  }, 15000);

  // 5. Also try WebSocket (works on Starter plan and above)
  WS.connect();
}

// ─── Polygon REST — Snapshot (all tickers at once) ────────────────────────────
async function fetchSnapshot() {
  if (!CONFIG.POLYGON_API_KEY) return;

  const tickers = Object.keys(STATE.stocks).join(',');
  const url = `${CONFIG.REST_URL}/v2/snapshot/locale/us/markets/stocks/tickers` +
              `?tickers=${encodeURIComponent(tickers)}&apiKey=${CONFIG.POLYGON_API_KEY}`;
  try {
    const res  = await fetch(url);
    const data = await res.json();

    if (!data.tickers) {
      if (data.error) showToast(`Polygon: ${data.error}`, 'error');
      return;
    }

    data.tickers.forEach(item => {
      const s = STATE.stocks[item.ticker];
      if (!s) return;

      const prev  = s.price;
      s.price     = item.day.c  || item.lastTrade?.p || s.price;
      s.open      = item.day.o  || s.open;
      s.change    = s.price - s.open;
      s.changePct = s.open ? (s.change / s.open) * 100 : s.changePct;
      s.volume    = item.day.v  || s.volume;
      s.marketCap = s.sharesOut * s.price;
      s.priceDir  = s.price > prev ? 'up' : s.price < prev ? 'down' : 'flat';
      s.prevPrice = prev;

      // Relative volume: day volume vs previous day volume scaled to time
      const et = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const minsOpen = Math.max(1, (et.getHours() * 60 + et.getMinutes()) - 570);
      const fraction = Math.min(minsOpen / 390, 1);
      const expectedVol = (item.prevDay?.v || s.avgVol) * fraction;
      s.relVolume = expectedVol > 0 ? s.volume / expectedVol : s.relVolume;

      // Activity score
      s.activity = Math.min(100, Math.floor(s.relVolume * 4 + Math.abs(s.changePct) * 2));

      // Sparkline
      s.sparkline.push(s.price);
      if (s.sparkline.length > 40) s.sparkline.shift();
    });

  } catch (e) {
    console.error('Snapshot error:', e);
  }
}

// ─── Polygon REST — First-Minute Volume (9:30 bar) ────────────────────────────
async function fetchFirstMinuteVolumes() {
  if (!CONFIG.POLYGON_API_KEY) return;

  const today   = new Date().toISOString().split('T')[0];
  const tickers = Object.keys(STATE.stocks);

  // Fetch in small parallel batches to respect rate limits
  const BATCH = 5;
  for (let i = 0; i < tickers.length; i += BATCH) {
    const batch = tickers.slice(i, i + BATCH);
    await Promise.all(batch.map(async ticker => {
      try {
        const url = `${CONFIG.REST_URL}/v2/aggs/ticker/${ticker}/range/1/minute/${today}/${today}` +
                    `?sort=asc&limit=1&apiKey=${CONFIG.POLYGON_API_KEY}`;
        const res  = await fetch(url);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
          const bar    = data.results[0];
          const barET  = new Date(new Date(bar.t).toLocaleString('en-US', { timeZone: 'America/New_York' }));
          // Accept any bar between 9:30–9:32 as the "first minute"
          const mins   = barET.getHours() * 60 + barET.getMinutes();
          if (mins >= 570 && mins <= 572) {
            STATE.stocks[ticker].firstMinVol = bar.v;
          }
        }
      } catch (_) { /* skip */ }
    }));
    // Tiny pause between batches — free plan is 5 calls/min, paid is unlimited
    await new Promise(r => setTimeout(r, CONFIG.POLYGON_API_KEY ? 200 : 2000));
  }

  fullRender();
}

// ─── Polygon REST — News ──────────────────────────────────────────────────────
async function fetchPolygonNews() {
  if (!CONFIG.POLYGON_API_KEY) return;

  const watchlist = Object.keys(STATE.stocks).join(',');
  const url = `${CONFIG.REST_URL}/v2/reference/news` +
              `?ticker.any_of=${encodeURIComponent(watchlist)}&limit=30&order=desc&apiKey=${CONFIG.POLYGON_API_KEY}`;
  try {
    const res  = await fetch(url);
    const data = await res.json();

    if (!data.results) return;

    data.results.forEach(n => {
      const ticker = n.tickers?.find(t => STATE.stocks[t]);
      if (!ticker) return;

      const item = {
        id:        n.id,
        ticker,
        headline:  n.title,
        time:      n.published_utc,
        sentiment: n.insights?.[0]?.sentiment === 'positive' ? 'bullish' : 'bearish',
        source:    n.publisher?.name || 'Polygon News',
      };

      // Deduplicate
      if (!STATE.news.find(x => x.id === item.id)) {
        STATE.news.unshift(item);
        STATE.stocks[ticker].news.unshift(item);
      }
    });

    STATE.news = STATE.news.slice(0, 30);

  } catch (e) {
    console.error('News error:', e);
  }
}

// ─── Polygon REST — Halt check (LULD via conditions) ─────────────────────────
async function checkHalts() {
  if (!CONFIG.POLYGON_API_KEY) return;
  // Polygon doesn't expose a halt endpoint directly — we infer from
  // zero volume + flatline price in the snapshot which is handled in tickUpdate.
}

// ─── Polygon WebSocket ────────────────────────────────────────────────────────
const WS = {
  socket:        null,
  authenticated: false,
  subscribed:    new Set(),

  connect() {
    if (!CONFIG.POLYGON_API_KEY) return;
    if (this.socket && this.socket.readyState < 2) return; // already open/connecting

    this.socket = new WebSocket(CONFIG.WS_URL);

    this.socket.onopen = () => {
      showToast('Connected to Polygon.io WebSocket', 'success');
    };

    this.socket.onmessage = (event) => {
      try {
        const messages = JSON.parse(event.data);
        messages.forEach(msg => this.handleMessage(msg));
      } catch (_) {}
    };

    this.socket.onerror = () => showToast(t('toast_ws_error'), 'error');

    this.socket.onclose = () => {
      if (liveMode) {
        showToast(t('toast_ws_disconnected'), 'error');
        // Reconnect after 5 s
        setTimeout(() => this.connect(), 5000);
      }
    };
  },

  handleMessage(msg) {
    switch (msg.ev) {
      case 'connected':
        this.socket.send(JSON.stringify({ action: 'auth', params: CONFIG.POLYGON_API_KEY }));
        break;

      case 'auth_success':
        this.authenticated = true;
        showToast(t('toast_auth_ok'), 'success');
        // WebSocket is live — stop REST poll loop to save quota
        if (pollLoop) { clearInterval(pollLoop); pollLoop = null; }
        this.subscribeAll();
        break;

      case 'auth_failed':
        showToast(t('toast_auth_fail'), 'error');
        // Fall back to REST polling
        if (!pollLoop) {
          pollLoop = setInterval(async () => { await fetchSnapshot(); fullRender(); }, 15000);
        }
        break;

      case 'T':   this.processTrade(msg);   break;
      case 'AM':  this.processMinBar(msg);  break;
    }
  },

  subscribeAll() {
    const tickers = Object.keys(STATE.stocks);
    // Subscribe to trades + minute bars for all watched tickers
    const subs = tickers.flatMap(t => [`T.${t}`, `AM.${t}`]);
    this.socket.send(JSON.stringify({ action: 'subscribe', params: subs.join(',') }));
  },

  processTrade(msg) {
    const s = STATE.stocks[msg.sym];
    if (!s) return;

    const prev  = s.price;
    s.price     = msg.p;
    s.change    = s.price - s.open;
    s.changePct = s.open ? (s.change / s.open) * 100 : s.changePct;
    s.volume    = (msg.av || s.volume);
    s.marketCap = s.sharesOut * s.price;
    s.priceDir  = msg.p > prev ? 'up' : msg.p < prev ? 'down' : 'flat';
    s.prevPrice = prev;
    s.lastTrade = Date.now();

    // Sparkline
    s.sparkline.push(s.price);
    if (s.sparkline.length > 40) s.sparkline.shift();

    // Detect whale trade
    const value = (msg.s || 0) * msg.p;
    if (value >= CONFIG.WHALE_TRADE_MIN_USD) {
      const whale = {
        id:       `${msg.sym}-${msg.t}`,
        ticker:   msg.sym,
        shares:   msg.s,
        price:    msg.p,
        value,
        side:     (msg.c && Array.isArray(msg.c) && msg.c.includes(1)) ? 'BUY' : 'SELL',
        time:     new Date(msg.t).toISOString(),
        exchange: msg.x || '—',
      };
      s.whales.unshift(whale);
      STATE.whales.unshift(whale);
      STATE.whales = STATE.whales.slice(0, 50);
    }

    // Liquidity event: large trade pushes price up
    if (value >= CONFIG.LIQUIDITY_BLOCK_MIN * s.price && s.priceDir === 'up') {
      s.liqCount += 1;
    }

    s.activity = Math.min(100, Math.floor(s.relVolume * 4 + Math.abs(s.changePct) * 2));
    fullRender();
  },

  processMinBar(msg) {
    const s = STATE.stocks[msg.sym];
    if (!s) return;

    s.volume = msg.av || s.volume;

    // First-minute bar (9:30 ET)
    if (msg.s) {
      const barET = new Date(new Date(msg.s).toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const mins  = barET.getHours() * 60 + barET.getMinutes();
      if (mins >= 570 && mins <= 572) {
        s.firstMinVol = msg.av;
      }
    }

    // Update relative volume
    const et       = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const minsOpen = Math.max(1, (et.getHours() * 60 + et.getMinutes()) - 570);
    const expected = s.avgVol * (minsOpen / 390);
    s.relVolume    = expected > 0 ? s.volume / expected : s.relVolume;
  },
};

// ─── Entry point ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', boot);
