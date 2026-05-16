// ─── Configuration ───────────────────────────────────────────────────────────
const CONFIG = {
  // Polygon.io API key — enter yours here or in the Settings panel
  POLYGON_API_KEY: '',

  // Polygon WebSocket endpoint
  WS_URL: 'wss://socket.polygon.io/stocks',

  // REST base
  REST_URL: 'https://api.polygon.io',

  // Update interval for demo mode (ms)
  DEMO_INTERVAL: 2000,

  // Thresholds
  WHALE_TRADE_MIN_USD: 150000,   // $150K+ = whale trade
  LIQUIDITY_BLOCK_MIN: 50000,    // 50K+ shares = liquidity block
  HIGH_REL_VOL: 5,               // 5x relative volume = high
  EXTREME_REL_VOL: 20,           // 20x = extreme

  // Market hours (ET expressed as UTC offset -4/-5)
  MARKET_OPEN_HOUR: 9,
  MARKET_OPEN_MIN: 30,
  MARKET_CLOSE_HOUR: 16,
  MARKET_CLOSE_MIN: 0,

  // Sort defaults
  DEFAULT_SORT_COL: 'relVolume',
  DEFAULT_SORT_DIR: 'desc',

  // Max rows in scanner
  MAX_ROWS: 50,
};

// ─── i18n ────────────────────────────────────────────────────────────────────

let currentLang = 'en';

const TRANSLATIONS = {
  en: {
    // Topbar
    settings: '⚙ Settings',
    market_open: 'OPEN', market_closed: 'CLOSED',
    stat_gainers: 'Gainers', stat_losers: 'Losers',
    stat_highvol: 'High Vol', stat_halted: 'Halted',
    // Filter bar
    filter_placeholder: 'Search ticker or sector…',
    filter_all: 'ALL', filter_highvol: 'HIGH VOL',
    filter_highshort: 'HIGH SHORT', filter_halted: 'HALTED',
    filter_liq: 'LIQ 3+', filter_gainers: 'GAINERS',
    live: '● LIVE',
    // Halt bar
    halts_label: '⊘ HALTS', no_active_halts: 'No active halts',
    // Table columns
    col_rank: '#', col_ticker: 'TICKER', col_price: 'PRICE',
    col_changePct: 'CHNG %', col_firstMinVol: '1M VOL ★',
    col_relVolume: 'REL VOL', col_volume: 'VOLUME',
    col_marketCap: 'MKT CAP', col_float: 'FLOAT',
    col_shortPct: 'SHORT %', col_liqCount: 'LIQ #',
    col_activity: 'ACTIVITY', col_halt: 'HALT',
    // Detail panel sections
    key_metrics: 'KEY METRICS', company_activity: 'COMPANY ACTIVITY',
    halt_history: 'HALT HISTORY', whale_trades: 'WHALE TRADES', news: 'NEWS',
    // Metric labels
    metric_firstMinVol: '1st Min Volume ★', metric_relVol: 'Relative Volume',
    metric_liqEvents: 'Liquidity Events', metric_shortInt: 'Short Interest',
    metric_mktCap: 'Market Cap', metric_floatShares: 'Float / Shares',
    metric_volume: 'Volume', metric_activity: 'Activity Score',
    // Halt
    halt_up: 'HALT ▲', halt_down: 'HALT ▼', halt_active: 'ACTIVE', halt_none: '—',
    halt_reason_up: 'LULD Circuit Breaker (Limit Up)',
    halt_reason_down: 'LULD Circuit Breaker (Limit Down)',
    // Whale
    buy: 'BUY', sell: 'SELL',
    // Empty states
    no_whale_trades: 'No whale trades detected',
    no_news: 'No recent news', no_stocks: 'No stocks match your filter',
    // Bottom panels
    panel_whales: '🐋 Whale Trades', panel_news: '📰 News Feed',
    // Settings modal
    settings_title: '⚙ Scanner Settings',
    settings_api_key: 'Polygon.io API Key',
    settings_api_placeholder: 'Enter your Polygon.io API key…',
    settings_api_hint: 'Get a free key at polygon.io — required for live real-time data.',
    settings_api_hint2: 'Without a key the scanner runs in demo mode with simulated data.',
    settings_data_mode: 'Data Mode',
    settings_demo: 'Demo (simulated, no key needed)',
    settings_live: 'Live (Polygon.io WebSocket)',
    settings_whale_thresh: 'Whale Trade Threshold',
    settings_whale_hint: 'Minimum trade value (USD) to classify as a whale trade.',
    btn_cancel: 'Cancel', btn_save: 'Save & Apply',
    // Toasts
    toast_demo: 'Demo mode active — add a Polygon.io API key in Settings for live data',
    toast_key_saved: 'API key saved. Connecting to Polygon.io…',
    toast_demo_mode: 'Running in demo mode',
    // Misc
    today: 'today',
  },
  ar: {
    // Topbar
    settings: '⚙ الإعدادات',
    market_open: 'مفتوح', market_closed: 'مغلق',
    stat_gainers: 'الرابحون', stat_losers: 'الخاسرون',
    stat_highvol: 'حجم عالٍ', stat_halted: 'موقوف',
    // Filter bar
    filter_placeholder: 'ابحث عن رمز أو قطاع…',
    filter_all: 'الكل', filter_highvol: 'حجم عالٍ',
    filter_highshort: 'بيع مكشوف عالٍ', filter_halted: 'موقوف',
    filter_liq: 'سيولة 3+', filter_gainers: 'الرابحون',
    live: '● مباشر',
    // Halt bar
    halts_label: '⊘ التوقفات', no_active_halts: 'لا توجد توقفات نشطة',
    // Table columns
    col_rank: '#', col_ticker: 'الرمز', col_price: 'السعر',
    col_changePct: 'التغيير %', col_firstMinVol: 'حجم د١ ★',
    col_relVolume: 'الحجم النسبي', col_volume: 'الحجم',
    col_marketCap: 'القيمة السوقية', col_float: 'الأسهم الحرة',
    col_shortPct: 'المكشوف %', col_liqCount: 'السيولة #',
    col_activity: 'النشاط', col_halt: 'التوقف',
    // Detail panel sections
    key_metrics: 'المقاييس الرئيسية', company_activity: 'نشاط الشركة',
    halt_history: 'تاريخ التوقف', whale_trades: 'صفقات الحيتان', news: 'الأخبار',
    // Metric labels
    metric_firstMinVol: 'حجم الدقيقة الأولى ★', metric_relVol: 'الحجم النسبي',
    metric_liqEvents: 'أحداث السيولة', metric_shortInt: 'البيع على المكشوف',
    metric_mktCap: 'القيمة السوقية', metric_floatShares: 'الأسهم الحرة / الإجمالية',
    metric_volume: 'الحجم', metric_activity: 'درجة النشاط',
    // Halt
    halt_up: 'توقف ▲', halt_down: 'توقف ▼', halt_active: 'نشط', halt_none: '—',
    halt_reason_up: 'قاطع الدائرة - الحد الأعلى',
    halt_reason_down: 'قاطع الدائرة - الحد الأدنى',
    // Whale
    buy: 'شراء', sell: 'بيع',
    // Empty states
    no_whale_trades: 'لم يتم اكتشاف صفقات حيتان',
    no_news: 'لا توجد أخبار حديثة', no_stocks: 'لا توجد أسهم تطابق المرشح',
    // Bottom panels
    panel_whales: '🐋 صفقات الحيتان', panel_news: '📰 الأخبار',
    // Settings modal
    settings_title: '⚙ إعدادات الماسح',
    settings_api_key: 'مفتاح API لـ Polygon.io',
    settings_api_placeholder: 'أدخل مفتاح Polygon.io API…',
    settings_api_hint: 'احصل على مفتاح مجاني من polygon.io — مطلوب للبيانات الحية.',
    settings_api_hint2: 'بدون مفتاح يعمل الماسح في وضع تجريبي ببيانات محاكاة.',
    settings_data_mode: 'وضع البيانات',
    settings_demo: 'تجريبي (محاكاة، لا يحتاج مفتاح)',
    settings_live: 'مباشر (Polygon.io WebSocket)',
    settings_whale_thresh: 'حد صفقة الحيتان',
    settings_whale_hint: 'الحد الأدنى لقيمة الصفقة (دولار) لتصنيفها صفقة حيتان.',
    btn_cancel: 'إلغاء', btn_save: 'حفظ وتطبيق',
    // Toasts
    toast_demo: 'وضع تجريبي — أضف مفتاح Polygon.io في الإعدادات للبيانات المباشرة',
    toast_key_saved: 'تم حفظ المفتاح. جارٍ الاتصال بـ Polygon.io…',
    toast_demo_mode: 'تشغيل في الوضع التجريبي',
    // Misc
    today: 'اليوم',
  },
};

function t(key) {
  return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key])
      || TRANSLATIONS.en[key]
      || key;
}

function setLanguage(lang) {
  currentLang = lang;
  const isRTL = lang === 'ar';
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

  // Toggle active state on lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Update all static text in the DOM
  translateStaticDOM();

  // Re-render dynamic content
  renderTableHeaders();
  fullRender();
}

function translateStaticDOM() {
  // Filter chips
  const chipKeys = ['filter_all','filter_highvol','filter_highshort','filter_halted','filter_liq','filter_gainers'];
  document.querySelectorAll('.filter-chip').forEach((el, i) => {
    if (chipKeys[i]) el.textContent = t(chipKeys[i]);
  });

  // Filter search placeholder
  const fi = document.getElementById('filter-input');
  if (fi) fi.placeholder = t('filter_placeholder');

  // Halt bar label
  const hl = document.querySelector('#halt-bar .bar-label');
  if (hl) hl.textContent = t('halts_label');

  // Settings button in topbar
  const sb = document.getElementById('btn-settings');
  if (sb) sb.textContent = t('settings');

  // Bottom panel headers
  const bh = document.querySelectorAll('.bottom-section-header');
  if (bh[0]) bh[0].textContent = t('panel_whales');
  if (bh[1]) bh[1].textContent = t('panel_news');

  // Settings modal
  const refs = {
    'modal-title':          'settings_title',
    'modal-api-label':      'settings_api_key',
    'modal-data-label':     'settings_data_mode',
    'modal-whale-label':    'settings_whale_thresh',
    'modal-whale-hint':     'settings_whale_hint',
    'modal-btn-cancel':     'btn_cancel',
    'modal-btn-save':       'btn_save',
    'modal-radio-demo-lbl': 'settings_demo',
    'modal-radio-live-lbl': 'settings_live',
  };
  Object.entries(refs).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  });

  const apiInput = document.getElementById('api-key-input');
  if (apiInput) apiInput.placeholder = t('settings_api_placeholder');

  const hint1 = document.getElementById('modal-api-hint1');
  if (hint1) hint1.innerHTML = t('settings_api_hint');
  const hint2 = document.getElementById('modal-api-hint2');
  if (hint2) hint2.innerHTML = t('settings_api_hint2');
}

// ─── Column definitions (order = table order) ─────────────────────────────────
const COLUMNS = [
  { id: 'rank',         label: '#',          sortable: false, width: '40px'  },
  { id: 'ticker',       label: 'TICKER',      sortable: true,  width: '130px' },
  { id: 'price',        label: 'PRICE',       sortable: true,  width: '90px'  },
  { id: 'changePct',    label: 'CHNG %',      sortable: true,  width: '90px'  },
  { id: 'firstMinVol',  label: '1M VOL ★',   sortable: true,  width: '110px' },
  { id: 'relVolume',    label: 'REL VOL',     sortable: true,  width: '90px'  },
  { id: 'volume',       label: 'VOLUME',      sortable: true,  width: '100px' },
  { id: 'marketCap',    label: 'MKT CAP',     sortable: true,  width: '100px' },
  { id: 'float',        label: 'FLOAT',       sortable: true,  width: '90px'  },
  { id: 'shortPct',     label: 'SHORT %',     sortable: true,  width: '90px'  },
  { id: 'liqCount',     label: 'LIQ #',       sortable: true,  width: '70px'  },
  { id: 'activity',     label: 'ACTIVITY',    sortable: true,  width: '110px' },
  { id: 'halt',         label: 'HALT',        sortable: false, width: '90px'  },
];
