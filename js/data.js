// ─── Mock Data & State ────────────────────────────────────────────────────────

const STATE = {
  stocks: {},          // ticker → stock object
  whales: [],          // recent whale trades (global list)
  halts: [],           // halt events
  news: [],            // aggregated news
  sortCol: CONFIG.DEFAULT_SORT_COL,
  sortDir: CONFIG.DEFAULT_SORT_DIR,
  filterText: '',
  selectedTicker: null,
  marketStatus: 'OPEN',
  lastUpdate: null,
};

// ─── Seed Universe ────────────────────────────────────────────────────────────

const SEED_STOCKS = [
  {
    ticker: 'SHOT',  company: 'Surf Air Mobility Inc.',        country: 'US', exchange: 'NASDAQ',
    sector: 'Industrials', price: 3.48, avgVol: 180000, float: 12400000,
    sharesOut: 14200000, shortPct: 44.2, marketCap: 49416000,
    catalyst: 'New DOT contract announcement', liqCount: 0,
  },
  {
    ticker: 'MARA',  company: 'Marathon Digital Holdings',     country: 'US', exchange: 'NASDAQ',
    sector: 'Technology', price: 18.72, avgVol: 28000000, float: 240000000,
    sharesOut: 261000000, shortPct: 16.8, marketCap: 4885920000,
    catalyst: 'BTC all-time high rally', liqCount: 0,
  },
  {
    ticker: 'NVAX',  company: 'Novavax Inc.',                  country: 'US', exchange: 'NASDAQ',
    sector: 'Healthcare', price: 7.14, avgVol: 3200000, float: 113000000,
    sharesOut: 120000000, shortPct: 29.1, marketCap: 856800000,
    catalyst: 'FDA fast-track vaccine designation', liqCount: 0,
  },
  {
    ticker: 'BBAI',  company: 'BigBear.ai Holdings Inc.',      country: 'US', exchange: 'NYSE',
    sector: 'Technology', price: 2.91, avgVol: 4500000, float: 188000000,
    sharesOut: 215000000, shortPct: 11.3, marketCap: 625650000,
    catalyst: 'DoD AI contract win', liqCount: 0,
  },
  {
    ticker: 'CLOV',  company: 'Clover Health Investments',     country: 'US', exchange: 'NASDAQ',
    sector: 'Healthcare', price: 1.48, avgVol: 6800000, float: 345000000,
    sharesOut: 410000000, shortPct: 7.9, marketCap: 606800000,
    catalyst: 'CMS reimbursement rate increase', liqCount: 0,
  },
  {
    ticker: 'SNDL',  company: 'SNDL Inc.',                     country: 'CA', exchange: 'NASDAQ',
    sector: 'Consumer', price: 1.84, avgVol: 7200000, float: 490000000,
    sharesOut: 540000000, shortPct: 5.4, marketCap: 993600000,
    catalyst: 'Cannabis rescheduling bill vote', liqCount: 0,
  },
  {
    ticker: 'MULN',  company: 'Mullen Automotive Inc.',        country: 'US', exchange: 'NASDAQ',
    sector: 'Automotive', price: 0.078, avgVol: 95000000, float: 4200000000,
    sharesOut: 5100000000, shortPct: 2.1, marketCap: 397800000,
    catalyst: 'Fleet order from national logistics co.', liqCount: 0,
  },
  {
    ticker: 'PRTY',  company: 'Party City Holdco Inc.',        country: 'US', exchange: 'NYSE',
    sector: 'Retail', price: 0.34, avgVol: 12000000, float: 82000000,
    sharesOut: 89000000, shortPct: 18.6, marketCap: 30260000,
    catalyst: 'Bankruptcy exit restructuring approved', liqCount: 0,
  },
  {
    ticker: 'DPST',  company: 'Direxion Daily Reg Banks 3X',   country: 'US', exchange: 'NYSE',
    sector: 'Financial ETF', price: 61.20, avgVol: 1100000, float: 18000000,
    sharesOut: 18000000, shortPct: 3.2, marketCap: 1101600000,
    catalyst: 'Fed surprise rate pause', liqCount: 0,
  },
  {
    ticker: 'PEGY',  company: 'Pineapple Energy Inc.',         country: 'US', exchange: 'NASDAQ',
    sector: 'Energy', price: 1.22, avgVol: 2100000, float: 28000000,
    sharesOut: 31000000, shortPct: 8.8, marketCap: 37820000,
    catalyst: 'Solar ITC extension bill passed', liqCount: 0,
  },
  {
    ticker: 'NKLA',  company: 'Nikola Corporation',            country: 'US', exchange: 'NASDAQ',
    sector: 'Automotive', price: 0.92, avgVol: 18000000, float: 750000000,
    sharesOut: 890000000, shortPct: 22.4, marketCap: 818800000,
    catalyst: 'H2 truck delivery milestone hit', liqCount: 0,
  },
  {
    ticker: 'SPCE',  company: 'Virgin Galactic Holdings',      country: 'US', exchange: 'NYSE',
    sector: 'Aerospace', price: 2.14, avgVol: 8900000, float: 310000000,
    sharesOut: 340000000, shortPct: 14.7, marketCap: 727600000,
    catalyst: 'Commercial flight reservation surge', liqCount: 0,
  },
  {
    ticker: 'MLGO',  company: 'MiLLiGen BioTherapeutics',     country: 'US', exchange: 'NASDAQ',
    sector: 'Healthcare', price: 5.60, avgVol: 900000, float: 9800000,
    sharesOut: 11000000, shortPct: 34.5, marketCap: 61600000,
    catalyst: 'Phase 2 trial primary endpoint met', liqCount: 0,
  },
  {
    ticker: 'PHUN',  company: 'Phunware Inc.',                 country: 'US', exchange: 'NASDAQ',
    sector: 'Technology', price: 1.18, avgVol: 3300000, float: 68000000,
    sharesOut: 72000000, shortPct: 9.2, marketCap: 84960000,
    catalyst: 'Government contract award $12M', liqCount: 0,
  },
  {
    ticker: 'HYMCL', company: 'Hycroft Mining Holding',        country: 'US', exchange: 'NASDAQ',
    sector: 'Materials', price: 0.29, avgVol: 1400000, float: 22000000,
    sharesOut: 24000000, shortPct: 6.1, marketCap: 6960000,
    catalyst: 'Gold & silver reserves reassessment', liqCount: 0,
  },
];

const NEWS_TEMPLATES = [
  s => `${s.company} (${s.ticker}): ${s.catalyst} — shares surge on heavy volume`,
  s => `Breaking: $${s.ticker} sees unusual options activity ahead of catalyst`,
  s => `${s.ticker} trading halted by exchange — resume pending`,
  s => `Whale alert: $${(Math.random()*2+0.5).toFixed(1)}M block trade detected in ${s.ticker}`,
  s => `Short squeeze watch: ${s.ticker} short interest at ${s.shortPct}% of float`,
  s => `${s.company} reports ${(Math.random()*200+50).toFixed(0)}% volume increase in first minute`,
  s => `SEC filing: institutional buyer acquires ${(Math.random()*5+1).toFixed(1)}% stake in ${s.ticker}`,
  s => `${s.ticker} price target raised by analyst — momentum continues`,
];

const COMPANY_ACTIVITIES = [
  'Earnings beat reported',
  'FDA approval catalyst',
  'SEC 8-K filing',
  'DoD contract awarded',
  'Merger announcement',
  'Reverse stock split',
  'Share buyback program',
  'Executive insider buy',
  'Short report published',
  'Options unusual activity',
  'Analyst upgrade issued',
  'Patent awarded',
  'Clinical trial results',
  'Government contract',
  'Strategic partnership',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function formatNum(n, decimals = 2) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  if (n >= 1e12) return (n / 1e12).toFixed(decimals) + 'T';
  if (n >= 1e9)  return (n / 1e9).toFixed(decimals)  + 'B';
  if (n >= 1e6)  return (n / 1e6).toFixed(decimals)  + 'M';
  if (n >= 1e3)  return (n / 1e3).toFixed(decimals)  + 'K';
  return n.toFixed(decimals);
}

function formatUSD(n) {
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
  return '$' + n.toFixed(2);
}

function countryFlag(code) {
  const flags = { US: '🇺🇸', CA: '🇨🇦', CN: '🇨🇳', GB: '🇬🇧', DE: '🇩🇪', JP: '🇯🇵' };
  return flags[code] || '🌐';
}

function timeNow() {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

function isMarketOpen() {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const h = et.getHours(), m = et.getMinutes(), day = et.getDay();
  if (day === 0 || day === 6) return false;
  const mins = h * 60 + m;
  return mins >= 9 * 60 + 30 && mins < 16 * 60;
}

// ─── Stock Initialization ─────────────────────────────────────────────────────

function initStock(seed) {
  const open = seed.price * rand(0.85, 1.15);
  const curPrice = open * rand(0.90, 1.30);
  const change = curPrice - open;
  const changePct = (change / open) * 100;

  // First-minute volume — heavily inflated vs. average for liquidity stocks
  const fmvMultiplier = rand(8, 120);
  const avgFirstMin = seed.avgVol / 390; // rough 390 trading minutes
  const firstMinVol = Math.floor(avgFirstMin * fmvMultiplier);

  // Current cumulative volume — scaled by time into session
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const minsOpen = Math.max(1, (et.getHours() * 60 + et.getMinutes()) - (9 * 60 + 30));
  const timeFraction = Math.min(minsOpen / 390, 1);
  const volume = Math.floor(firstMinVol + seed.avgVol * rand(0.4, 2.5) * timeFraction);

  // Relative volume vs. average volume for this same time window
  const expectedVol = seed.avgVol * timeFraction;
  const relVolume = expectedVol > 0 ? volume / expectedVol : rand(1, 20);

  // Generate whale trades
  const whales = generateWhales(seed.ticker, curPrice, volume);

  // Generate news
  const news = generateNews(seed);

  // Generate halt history
  const haltHistory = generateHaltHistory(seed.ticker);

  // Determine current halt status
  const recentHalt = haltHistory.length > 0 ? haltHistory[0] : null;
  const haltActive = recentHalt && recentHalt.active;

  // Sparkline data (last 20 price points)
  const sparkline = generateSparkline(open, curPrice, 20);

  return {
    ...seed,
    open,
    price: curPrice,
    change,
    changePct,
    volume,
    firstMinVol,
    relVolume,
    liqCount: randInt(0, 8),
    activity: Math.min(100, Math.floor(relVolume * 4 + Math.abs(changePct) * 2)),
    haltStatus: haltActive ? (changePct > 0 ? 'UP' : 'DOWN') : null,
    haltHistory,
    whales,
    news,
    sparkline,
    companyActivity: pick(COMPANY_ACTIVITIES),
    prevPrice: curPrice,
    priceDir: 'flat',
    lastTrade: Date.now(),
    firstUpdate: true,
  };
}

function generateSparkline(open, close, points) {
  const data = [open];
  for (let i = 1; i < points; i++) {
    const prev = data[i - 1];
    const drift = (close - open) / points;
    const noise = prev * rand(-0.008, 0.008);
    data.push(Math.max(0.001, prev + drift + noise));
  }
  data.push(close);
  return data;
}

function generateWhales(ticker, price, volume) {
  const whales = [];
  const numWhales = randInt(0, 5);
  const now = Date.now();
  for (let i = 0; i < numWhales; i++) {
    const shares = randInt(5000, 200000);
    const tradePrice = price * rand(0.98, 1.02);
    const value = shares * tradePrice;
    if (value < CONFIG.WHALE_TRADE_MIN_USD) continue;
    const side = Math.random() > 0.4 ? 'BUY' : 'SELL';
    whales.push({
      id: `${ticker}-${now}-${i}`,
      ticker,
      shares,
      price: tradePrice,
      value,
      side,
      time: new Date(now - randInt(0, 30) * 60000).toISOString(),
      exchange: pick(['NYSE', 'NASDAQ', 'ARCA', 'BATS', 'IEX']),
    });
  }
  return whales.sort((a, b) => b.value - a.value);
}

function generateNews(seed) {
  const items = [];
  const count = randInt(1, 4);
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    items.push({
      id: `${seed.ticker}-news-${i}`,
      ticker: seed.ticker,
      headline: pick(NEWS_TEMPLATES)(seed),
      time: new Date(now - randInt(0, 180) * 60000).toISOString(),
      sentiment: Math.random() > 0.3 ? 'bullish' : 'bearish',
      source: pick(['Reuters', 'Bloomberg', 'MarketWatch', 'Benzinga', 'PRNewswire', 'SEC Filing']),
    });
  }
  return items.sort((a, b) => new Date(b.time) - new Date(a.time));
}

function generateHaltHistory(ticker) {
  const history = [];
  const numHalts = randInt(0, 3);
  const now = Date.now();
  for (let i = 0; i < numHalts; i++) {
    const dir = Math.random() > 0.5 ? 'UP' : 'DOWN';
    const startTime = new Date(now - randInt(5, 120) * 60000);
    const duration = randInt(1, 15);
    const endTime = new Date(startTime.getTime() + duration * 60000);
    const active = i === 0 && Math.random() > 0.7;
    history.push({
      direction: dir,
      startTime: startTime.toISOString(),
      endTime: active ? null : endTime.toISOString(),
      duration: active ? null : duration,
      active,
      reason: dir === 'UP' ? 'LULD Circuit Breaker (Limit Up)' : 'LULD Circuit Breaker (Limit Down)',
    });
  }
  return history;
}

// ─── State Initialization ─────────────────────────────────────────────────────

function initState() {
  SEED_STOCKS.forEach(seed => {
    STATE.stocks[seed.ticker] = initStock(seed);
    // Collect whales & news into global lists
    STATE.whales.push(...STATE.stocks[seed.ticker].whales);
    STATE.news.push(...STATE.stocks[seed.ticker].news);
  });

  STATE.whales.sort((a, b) => b.value - a.value);
  STATE.news.sort((a, b) => new Date(b.time) - new Date(a.time));
  STATE.whales = STATE.whales.slice(0, 50);
  STATE.news = STATE.news.slice(0, 30);

  STATE.marketStatus = isMarketOpen() ? 'OPEN' : 'CLOSED';
  STATE.lastUpdate = Date.now();
}

// ─── Tick Update (simulates live feed) ───────────────────────────────────────

function tickUpdate() {
  const now = Date.now();
  STATE.marketStatus = isMarketOpen() ? 'OPEN' : 'CLOSED';
  STATE.lastUpdate = now;

  Object.values(STATE.stocks).forEach(s => {
    const prevPrice = s.price;

    // Price random walk — biased toward trend
    const trend = s.changePct > 0 ? 0.0002 : -0.0001;
    const shock = rand(-0.005, 0.005);
    s.price = Math.max(0.001, s.price * (1 + trend + shock));
    s.change = s.price - s.open;
    s.changePct = (s.change / s.open) * 100;

    // Detect price direction for flash animation
    s.priceDir = s.price > prevPrice ? 'up' : s.price < prevPrice ? 'down' : 'flat';
    s.prevPrice = prevPrice;

    // Volume accumulation
    const newShares = randInt(0, 15000);
    s.volume += newShares;

    // Relative volume update
    const et = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const minsOpen = Math.max(1, (et.getHours() * 60 + et.getMinutes()) - (9 * 60 + 30));
    const timeFraction = Math.min(minsOpen / 390, 1);
    const expectedVol = s.avgVol * timeFraction;
    s.relVolume = expectedVol > 0 ? s.volume / expectedVol : s.relVolume;

    // Activity score
    s.activity = Math.min(100, Math.floor(s.relVolume * 4 + Math.abs(s.changePct) * 2));

    // Occasionally add liquidity event
    if (Math.random() < 0.04) {
      s.liqCount += 1;

      // Add a whale trade on liquidity event
      if (Math.random() < 0.6) {
        const shares = randInt(10000, 250000);
        const value = shares * s.price;
        if (value >= CONFIG.WHALE_TRADE_MIN_USD) {
          const whale = {
            id: `${s.ticker}-${now}`,
            ticker: s.ticker,
            shares,
            price: s.price,
            value,
            side: 'BUY',
            time: new Date(now).toISOString(),
            exchange: pick(['NYSE', 'NASDAQ', 'ARCA', 'BATS']),
          };
          s.whales.unshift(whale);
          STATE.whales.unshift(whale);
          STATE.whales = STATE.whales.slice(0, 50);
        }
      }
    }

    // Occasionally add news
    if (Math.random() < 0.01) {
      const item = {
        id: `${s.ticker}-news-${now}`,
        ticker: s.ticker,
        headline: pick(NEWS_TEMPLATES)(s),
        time: new Date(now).toISOString(),
        sentiment: s.changePct > 0 ? 'bullish' : 'bearish',
        source: pick(['Reuters', 'Bloomberg', 'MarketWatch', 'Benzinga', 'SEC Filing']),
      };
      s.news.unshift(item);
      STATE.news.unshift(item);
      STATE.news = STATE.news.slice(0, 30);
    }

    // Halt simulation (rare)
    if (!s.haltStatus && Math.random() < 0.003) {
      s.haltStatus = s.changePct > 10 ? 'UP' : 'DOWN';
      const haltEvent = {
        direction: s.haltStatus,
        startTime: new Date(now).toISOString(),
        endTime: null,
        duration: null,
        active: true,
        reason: s.haltStatus === 'UP'
          ? 'LULD Circuit Breaker (Limit Up)'
          : 'LULD Circuit Breaker (Limit Down)',
      };
      s.haltHistory.unshift(haltEvent);
      STATE.halts.unshift({ ...haltEvent, ticker: s.ticker, company: s.company });
      STATE.halts = STATE.halts.slice(0, 20);
    }
    // Resolve old halts
    if (s.haltStatus && Math.random() < 0.08) {
      s.haltStatus = null;
      if (s.haltHistory.length && s.haltHistory[0].active) {
        const duration = Math.round((now - new Date(s.haltHistory[0].startTime).getTime()) / 60000);
        s.haltHistory[0].active = false;
        s.haltHistory[0].endTime = new Date(now).toISOString();
        s.haltHistory[0].duration = duration;
      }
    }

    // Update sparkline
    s.sparkline.push(s.price);
    if (s.sparkline.length > 40) s.sparkline.shift();

    s.lastTrade = now;
    s.firstUpdate = false;
  });
}

// ─── Sorted & filtered stock list ─────────────────────────────────────────────

function getSortedStocks() {
  let list = Object.values(STATE.stocks);

  // Text filter
  if (STATE.filterText) {
    const q = STATE.filterText.toUpperCase();
    list = list.filter(s =>
      s.ticker.includes(q) || s.company.toUpperCase().includes(q) || s.sector.toUpperCase().includes(q)
    );
  }

  // Sort
  list.sort((a, b) => {
    let va = a[STATE.sortCol] ?? 0;
    let vb = b[STATE.sortCol] ?? 0;
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return STATE.sortDir === 'asc' ? -1 : 1;
    if (va > vb) return STATE.sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return list.slice(0, CONFIG.MAX_ROWS);
}
