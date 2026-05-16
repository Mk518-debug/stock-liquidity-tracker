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
  // ── Originals ──────────────────────────────────────────────────────────────
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
    sector: 'Cannabis', price: 1.84, avgVol: 7200000, float: 490000000,
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

  // ── Meme / Retail-trader favourites ────────────────────────────────────────
  {
    ticker: 'GME',   company: 'GameStop Corp.',                country: 'US', exchange: 'NYSE',
    sector: 'Retail', price: 22.10, avgVol: 5200000, float: 304000000,
    sharesOut: 349000000, shortPct: 21.3, marketCap: 7713400000,
    catalyst: 'Roaring Kitty livestream announcement', liqCount: 0,
  },
  {
    ticker: 'AMC',   company: 'AMC Entertainment Holdings',   country: 'US', exchange: 'NYSE',
    sector: 'Entertainment', price: 4.82, avgVol: 9400000, float: 246000000,
    sharesOut: 280000000, shortPct: 17.6, marketCap: 1349600000,
    catalyst: 'Box office record weekend + APE dilution resolved', liqCount: 0,
  },
  {
    ticker: 'BB',    company: 'BlackBerry Limited',            country: 'CA', exchange: 'NYSE',
    sector: 'Technology', price: 2.68, avgVol: 11200000, float: 576000000,
    sharesOut: 583000000, shortPct: 8.4, marketCap: 1563840000,
    catalyst: 'QNX design win with major OEM', liqCount: 0,
  },
  {
    ticker: 'KOSS',  company: 'Koss Corporation',              country: 'US', exchange: 'NASDAQ',
    sector: 'Consumer Electronics', price: 5.40, avgVol: 820000, float: 6600000,
    sharesOut: 7200000, shortPct: 38.2, marketCap: 38880000,
    catalyst: 'Patent royalty settlement with Apple', liqCount: 0,
  },

  // ── EV / Clean Energy ──────────────────────────────────────────────────────
  {
    ticker: 'FFIE',  company: 'Faraday Future Intelligent EV', country: 'US', exchange: 'NASDAQ',
    sector: 'Automotive', price: 0.18, avgVol: 142000000, float: 3800000000,
    sharesOut: 4600000000, shortPct: 3.8, marketCap: 828000000,
    catalyst: 'First FF 91 delivery ceremony completed', liqCount: 0,
  },
  {
    ticker: 'GOEV',  company: 'Canoo Inc.',                    country: 'US', exchange: 'NASDAQ',
    sector: 'Automotive', price: 0.42, avgVol: 38000000, float: 620000000,
    sharesOut: 680000000, shortPct: 12.1, marketCap: 285600000,
    catalyst: 'USPS EV delivery contract expanded', liqCount: 0,
  },
  {
    ticker: 'WKHS',  company: 'Workhorse Group Inc.',          country: 'US', exchange: 'NASDAQ',
    sector: 'Automotive', price: 1.14, avgVol: 9100000, float: 132000000,
    sharesOut: 145000000, shortPct: 19.7, marketCap: 165300000,
    catalyst: 'W56 drone delivery FAA approval', liqCount: 0,
  },
  {
    ticker: 'LCID',  company: 'Lucid Group Inc.',              country: 'US', exchange: 'NASDAQ',
    sector: 'Automotive', price: 2.88, avgVol: 32000000, float: 2100000000,
    sharesOut: 2300000000, shortPct: 7.2, marketCap: 6624000000,
    catalyst: 'Saudi Aramco fleet order 10,000 units', liqCount: 0,
  },
  {
    ticker: 'RIVN',  company: 'Rivian Automotive Inc.',        country: 'US', exchange: 'NASDAQ',
    sector: 'Automotive', price: 13.20, avgVol: 22000000, float: 870000000,
    sharesOut: 950000000, shortPct: 9.8, marketCap: 12540000000,
    catalyst: 'Amazon delivery van milestone — 20K deployed', liqCount: 0,
  },
  {
    ticker: 'CHPT',  company: 'ChargePoint Holdings Inc.',     country: 'US', exchange: 'NYSE',
    sector: 'Energy', price: 1.62, avgVol: 14200000, float: 395000000,
    sharesOut: 418000000, shortPct: 13.6, marketCap: 677160000,
    catalyst: 'DOE charging network grant awarded', liqCount: 0,
  },

  // ── Biotech / Pharma ───────────────────────────────────────────────────────
  {
    ticker: 'SAVA',  company: 'Cassava Sciences Inc.',         country: 'US', exchange: 'NASDAQ',
    sector: 'Healthcare', price: 14.30, avgVol: 2800000, float: 28000000,
    sharesOut: 31000000, shortPct: 42.8, marketCap: 443300000,
    catalyst: 'Alzheimer Phase 3 interim positive read', liqCount: 0,
  },
  {
    ticker: 'AGEN',  company: 'Agenus Inc.',                   country: 'US', exchange: 'NASDAQ',
    sector: 'Healthcare', price: 1.74, avgVol: 6600000, float: 248000000,
    sharesOut: 268000000, shortPct: 11.2, marketCap: 466320000,
    catalyst: 'Boehringer Ingelheim milestone payment $80M', liqCount: 0,
  },
  {
    ticker: 'BFRI',  company: 'Biofrontera Inc.',              country: 'US', exchange: 'NASDAQ',
    sector: 'Healthcare', price: 2.12, avgVol: 1100000, float: 18000000,
    sharesOut: 20000000, shortPct: 6.4, marketCap: 42400000,
    catalyst: 'Ameluz new dermatology indication approved', liqCount: 0,
  },
  {
    ticker: 'NKTR',  company: 'Nektar Therapeutics',           country: 'US', exchange: 'NASDAQ',
    sector: 'Healthcare', price: 0.88, avgVol: 4800000, float: 178000000,
    sharesOut: 192000000, shortPct: 8.9, marketCap: 169000000,
    catalyst: 'NKTR-358 Phase 2 enrollment complete', liqCount: 0,
  },
  {
    ticker: 'ACAD',  company: 'ACADIA Pharmaceuticals',        country: 'US', exchange: 'NASDAQ',
    sector: 'Healthcare', price: 16.40, avgVol: 3100000, float: 158000000,
    sharesOut: 167000000, shortPct: 14.3, marketCap: 2738800000,
    catalyst: 'DAYBUE Rett syndrome script growth +40%', liqCount: 0,
  },

  // ── Cannabis ───────────────────────────────────────────────────────────────
  {
    ticker: 'TLRY',  company: 'Tilray Brands Inc.',            country: 'CA', exchange: 'NASDAQ',
    sector: 'Cannabis', price: 1.68, avgVol: 18500000, float: 680000000,
    sharesOut: 740000000, shortPct: 9.6, marketCap: 1243200000,
    catalyst: 'Federal SAFE Banking Act passes Senate', liqCount: 0,
  },
  {
    ticker: 'ACB',   company: 'Aurora Cannabis Inc.',          country: 'CA', exchange: 'NASDAQ',
    sector: 'Cannabis', price: 3.24, avgVol: 7200000, float: 196000000,
    sharesOut: 212000000, shortPct: 12.1, marketCap: 686880000,
    catalyst: 'Medical cannabis EU export licence granted', liqCount: 0,
  },
  {
    ticker: 'CGUS',  company: 'Canopy Growth Corporation',     country: 'CA', exchange: 'NASDAQ',
    sector: 'Cannabis', price: 4.10, avgVol: 5800000, float: 148000000,
    sharesOut: 162000000, shortPct: 16.4, marketCap: 664200000,
    catalyst: 'US market entry via Acreage option exercise', liqCount: 0,
  },

  // ── Crypto / Blockchain ────────────────────────────────────────────────────
  {
    ticker: 'RIOT',  company: 'Riot Platforms Inc.',           country: 'US', exchange: 'NASDAQ',
    sector: 'Technology', price: 9.84, avgVol: 21000000, float: 268000000,
    sharesOut: 290000000, shortPct: 14.2, marketCap: 2853600000,
    catalyst: 'Hashrate capacity doubled Q2 2026', liqCount: 0,
  },
  {
    ticker: 'COIN',  company: 'Coinbase Global Inc.',          country: 'US', exchange: 'NASDAQ',
    sector: 'Financial', price: 184.20, avgVol: 8400000, float: 228000000,
    sharesOut: 248000000, shortPct: 10.6, marketCap: 45681600000,
    catalyst: 'SEC dismisses remaining enforcement case', liqCount: 0,
  },
  {
    ticker: 'HUT',   company: 'Hut 8 Mining Corp.',           country: 'CA', exchange: 'NASDAQ',
    sector: 'Technology', price: 12.60, avgVol: 6200000, float: 128000000,
    sharesOut: 142000000, shortPct: 7.8, marketCap: 1789200000,
    catalyst: 'Acquired 200MW data center for AI workloads', liqCount: 0,
  },

  // ── Fintech ────────────────────────────────────────────────────────────────
  {
    ticker: 'SOFI',  company: 'SoFi Technologies Inc.',        country: 'US', exchange: 'NASDAQ',
    sector: 'Financial', price: 7.82, avgVol: 31000000, float: 920000000,
    sharesOut: 980000000, shortPct: 8.3, marketCap: 7663600000,
    catalyst: 'Bank charter enables student loan growth', liqCount: 0,
  },
  {
    ticker: 'HOOD',  company: 'Robinhood Markets Inc.',        country: 'US', exchange: 'NASDAQ',
    sector: 'Financial', price: 18.40, avgVol: 12000000, float: 604000000,
    sharesOut: 870000000, shortPct: 6.1, marketCap: 16008000000,
    catalyst: 'Crypto trading volume hits 2-year high', liqCount: 0,
  },
  {
    ticker: 'AFRM',  company: 'Affirm Holdings Inc.',          country: 'US', exchange: 'NASDAQ',
    sector: 'Financial', price: 32.10, avgVol: 8200000, float: 292000000,
    sharesOut: 316000000, shortPct: 15.8, marketCap: 10143600000,
    catalyst: 'Apple Pay Later partnership expansion', liqCount: 0,
  },
  {
    ticker: 'OPEN',  company: 'Opendoor Technologies Inc.',    country: 'US', exchange: 'NASDAQ',
    sector: 'Real Estate', price: 1.96, avgVol: 19000000, float: 640000000,
    sharesOut: 680000000, shortPct: 11.4, marketCap: 1332800000,
    catalyst: 'Housing inventory crunch drives iBuyer demand', liqCount: 0,
  },

  // ── Mining / Materials ─────────────────────────────────────────────────────
  {
    ticker: 'ABML',  company: 'American Battery Materials',    country: 'US', exchange: 'NASDAQ',
    sector: 'Materials', price: 0.38, avgVol: 8400000, float: 310000000,
    sharesOut: 350000000, shortPct: 4.2, marketCap: 133000000,
    catalyst: 'Lithium processing facility groundbreaking', liqCount: 0,
  },
  {
    ticker: 'MP',    company: 'MP Materials Corp.',            country: 'US', exchange: 'NYSE',
    sector: 'Materials', price: 18.60, avgVol: 4100000, float: 166000000,
    sharesOut: 178000000, shortPct: 9.3, marketCap: 3310800000,
    catalyst: 'DOD rare earth supply contract $500M', liqCount: 0,
  },
  {
    ticker: 'GORO',  company: 'Gold Resource Corporation',     country: 'US', exchange: 'NYSE',
    sector: 'Materials', price: 1.44, avgVol: 1600000, float: 62000000,
    sharesOut: 66000000, shortPct: 5.7, marketCap: 95040000,
    catalyst: 'Gold spot price breakout above $2,800', liqCount: 0,
  },

  // ── Aerospace / Defense ────────────────────────────────────────────────────
  {
    ticker: 'JOBY',  company: 'Joby Aviation Inc.',            country: 'US', exchange: 'NYSE',
    sector: 'Aerospace', price: 5.62, avgVol: 7200000, float: 486000000,
    sharesOut: 542000000, shortPct: 6.8, marketCap: 3046840000,
    catalyst: 'FAA Part 135 air carrier certificate received', liqCount: 0,
  },
  {
    ticker: 'RKLB',  company: 'Rocket Lab USA Inc.',           country: 'US', exchange: 'NASDAQ',
    sector: 'Aerospace', price: 8.94, avgVol: 9800000, float: 428000000,
    sharesOut: 484000000, shortPct: 12.6, marketCap: 4326960000,
    catalyst: 'NASA ESCAPADE Mars mission launch contract', liqCount: 0,
  },
  {
    ticker: 'ASTS',  company: 'AST SpaceMobile Inc.',          country: 'US', exchange: 'NASDAQ',
    sector: 'Telecom', price: 14.80, avgVol: 16000000, float: 152000000,
    sharesOut: 188000000, shortPct: 18.4, marketCap: 2782400000,
    catalyst: 'Verizon commercial broadband satellite deal', liqCount: 0,
  },

  // ── AI / Software ──────────────────────────────────────────────────────────
  {
    ticker: 'SOUN',  company: 'SoundHound AI Inc.',            country: 'US', exchange: 'NASDAQ',
    sector: 'Technology', price: 6.18, avgVol: 28000000, float: 328000000,
    sharesOut: 352000000, shortPct: 22.1, marketCap: 2175360000,
    catalyst: 'NVIDIA portfolio company — AI voice chip deal', liqCount: 0,
  },
  {
    ticker: 'GFAI',  company: 'Guardforce AI Co. Ltd.',        country: 'US', exchange: 'NASDAQ',
    sector: 'Technology', price: 0.94, avgVol: 4200000, float: 22000000,
    sharesOut: 26000000, shortPct: 3.1, marketCap: 24440000,
    catalyst: 'AI security robot deployment Thailand', liqCount: 0,
  },
  {
    ticker: 'INPX',  company: 'Inpixon Corp.',                 country: 'US', exchange: 'NASDAQ',
    sector: 'Technology', price: 1.08, avgVol: 3800000, float: 48000000,
    sharesOut: 52000000, shortPct: 7.2, marketCap: 56160000,
    catalyst: 'Indoor intelligence platform $8M enterprise deal', liqCount: 0,
  },
  {
    ticker: 'VERB',  company: 'Verb Technology Company',       country: 'US', exchange: 'NASDAQ',
    sector: 'Technology', price: 0.72, avgVol: 2900000, float: 84000000,
    sharesOut: 92000000, shortPct: 5.6, marketCap: 66240000,
    catalyst: 'AI-powered live commerce platform launch', liqCount: 0,
  },

  // ── Healthcare devices ─────────────────────────────────────────────────────
  {
    ticker: 'NURO',  company: 'NeuroMetrix Inc.',              country: 'US', exchange: 'NASDAQ',
    sector: 'Healthcare', price: 3.20, avgVol: 680000, float: 8400000,
    sharesOut: 9200000, shortPct: 4.8, marketCap: 29440000,
    catalyst: 'Quell 3.0 CMS reimbursement approved', liqCount: 0,
  },
  {
    ticker: 'AEYE',  company: 'AudioEye Inc.',                 country: 'US', exchange: 'NASDAQ',
    sector: 'Technology', price: 8.60, avgVol: 420000, float: 7800000,
    sharesOut: 8600000, shortPct: 9.4, marketCap: 73960000,
    catalyst: 'ADA compliance mandate drives enterprise growth', liqCount: 0,
  },

  // ── International cross-listed ─────────────────────────────────────────────
  {
    ticker: 'NIO',   company: 'NIO Inc.',                      country: 'CN', exchange: 'NYSE',
    sector: 'Automotive', price: 4.42, avgVol: 48000000, float: 1740000000,
    sharesOut: 1900000000, shortPct: 6.2, marketCap: 8398000000,
    catalyst: 'Onvo sub-brand launch — 10K pre-orders in 48h', liqCount: 0,
  },
  {
    ticker: 'XPEV',  company: 'XPeng Inc.',                    country: 'CN', exchange: 'NYSE',
    sector: 'Automotive', price: 8.78, avgVol: 21000000, float: 680000000,
    sharesOut: 820000000, shortPct: 7.4, marketCap: 7199600000,
    catalyst: 'MONA M03 hits 10K monthly deliveries', liqCount: 0,
  },
  {
    ticker: 'GRAB',  company: 'Grab Holdings Limited',         country: 'US', exchange: 'NASDAQ',
    sector: 'Technology', price: 3.96, avgVol: 9800000, float: 3600000000,
    sharesOut: 3800000000, shortPct: 2.8, marketCap: 15048000000,
    catalyst: 'SEA profitability milestone — first GAAP profit', liqCount: 0,
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
