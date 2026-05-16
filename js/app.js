// ─── Application Controller ────────────────────────────────────────────────────

let updateLoop = null;

function boot() {
  // Initialize data
  initState();

  // Build table headers
  renderTableHeaders();

  // Initial render
  fullRender();

  // Start update loop
  updateLoop = setInterval(() => {
    tickUpdate();
    fullRender();
  }, CONFIG.DEMO_INTERVAL);

  // Filter input
  const filterInput = document.getElementById('filter-input');
  if (filterInput) {
    filterInput.addEventListener('input', e => {
      STATE.filterText = e.target.value;
      renderTable(getSortedStocks());
    });
  }

  // Close detail on backdrop click (only if clicking the backdrop itself)
  const panel = document.getElementById('detail-panel');
  if (panel) {
    panel.addEventListener('click', e => {
      if (e.target === panel) closeDetail();
    });
  }

  // Keyboard shortcut — Escape closes detail/settings
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('settings-modal').classList.contains('open')) closeSettings();
      else if (STATE.selectedTicker) closeDetail();
    }
  });

  // Show initial toast
  setTimeout(() => showToast(t('toast_demo'), 'info'), 1200);
}

function fullRender() {
  renderHeader();
  renderTable(getSortedStocks());
  renderBottomWhales();
  renderBottomNews();
  renderHaltAlerts();

  // Update detail panel if open
  if (STATE.selectedTicker) {
    renderDetailPanel(STATE.selectedTicker);
  }
}

// ─── Polygon.io WebSocket integration (activated when API key provided) ────────

const WS = {
  socket: null,
  authenticated: false,
  subscribed: new Set(),

  connect() {
    if (!CONFIG.POLYGON_API_KEY) return;
    this.socket = new WebSocket(CONFIG.WS_URL);

    this.socket.onopen = () => {
      showToast('Connected to Polygon.io', 'success');
    };

    this.socket.onmessage = (event) => {
      const messages = JSON.parse(event.data);
      messages.forEach(msg => this.handleMessage(msg));
    };

    this.socket.onerror = () => showToast('WebSocket error — check API key', 'error');
    this.socket.onclose = () => {
      showToast('WebSocket disconnected', 'error');
      setTimeout(() => this.connect(), 5000);
    };
  },

  handleMessage(msg) {
    switch (msg.ev) {
      case 'connected':
        // Authenticate
        this.socket.send(JSON.stringify({ action: 'auth', params: CONFIG.POLYGON_API_KEY }));
        break;

      case 'auth_success':
        this.authenticated = true;
        showToast('Polygon.io authenticated ✓', 'success');
        this.subscribeAll();
        break;

      case 'auth_failed':
        showToast('Polygon.io auth failed — check API key', 'error');
        break;

      case 'T': // Trade
        this.processTrade(msg);
        break;

      case 'AM': // Aggregate minute bar
        this.processMinuteBar(msg);
        break;

      case 'Q': // Quote
        this.processQuote(msg);
        break;
    }
  },

  subscribeAll() {
    const tickers = Object.keys(STATE.stocks);
    const subs = tickers.flatMap(t => [`T.${t}`, `AM.${t}`, `Q.${t}`]);
    this.socket.send(JSON.stringify({ action: 'subscribe', params: subs.join(',') }));
  },

  processTrade(msg) {
    const s = STATE.stocks[msg.sym];
    if (!s) return;
    const prev = s.price;
    s.price = msg.p;
    s.change = s.price - s.open;
    s.changePct = (s.change / s.open) * 100;
    s.volume = msg.av || s.volume;
    s.priceDir = msg.p > prev ? 'up' : msg.p < prev ? 'down' : 'flat';
    s.prevPrice = prev;
    s.lastTrade = Date.now();
    s.sparkline.push(s.price);
    if (s.sparkline.length > 40) s.sparkline.shift();

    // Detect whale trade
    const value = msg.s * msg.p;
    if (value >= CONFIG.WHALE_TRADE_MIN_USD) {
      const whale = {
        id: `${msg.sym}-${msg.t}`,
        ticker: msg.sym,
        shares: msg.s,
        price: msg.p,
        value,
        side: msg.c && msg.c.includes(1) ? 'BUY' : 'SELL',
        time: new Date(msg.t).toISOString(),
        exchange: msg.x,
      };
      s.whales.unshift(whale);
      STATE.whales.unshift(whale);
      STATE.whales = STATE.whales.slice(0, 50);
    }
  },

  processMinuteBar(msg) {
    const s = STATE.stocks[msg.sym];
    if (!s) return;
    // If this is the first minute bar (open of day), record first-minute volume
    const barTime = new Date(msg.s);
    const isFirstMin = barTime.getHours() === 9 && barTime.getMinutes() === 30;
    if (isFirstMin) s.firstMinVol = msg.av;

    s.volume = msg.av;
    const et = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const minsOpen = Math.max(1, (et.getHours() * 60 + et.getMinutes()) - (9 * 60 + 30));
    const expectedVol = s.avgVol * (minsOpen / 390);
    s.relVolume = expectedVol > 0 ? msg.av / expectedVol : s.relVolume;
  },

  processQuote(msg) {
    // Real-time quote updates (bid/ask) — can be used for spread analysis
  },
};

// ─── Entry point ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', boot);
