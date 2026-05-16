const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml',
};

// ─── Yahoo Finance session (crumb + cookie) ────────────────────────────────────
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
let _cookie = '';
let _crumb  = '';

function httpsGet(opts, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const req = https.get(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.setTimeout(timeout, () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
  });
}

async function ensureSession() {
  if (_crumb) return;
  try {
    // Step 1: hit Yahoo to get cookies
    const r1 = await httpsGet({
      hostname: 'fc.yahoo.com', path: '/',
      headers: { 'User-Agent': UA },
    });
    _cookie = (r1.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');

    // Step 2: fetch crumb
    const r2 = await httpsGet({
      hostname: 'query2.finance.yahoo.com', path: '/v1/test/getcrumb',
      headers: { 'User-Agent': UA, 'Cookie': _cookie, 'Accept': '*/*' },
    });
    _crumb = r2.body.trim();
    console.log('Yahoo session ready, crumb:', _crumb ? '✓' : '✗');
  } catch (e) {
    console.warn('Yahoo session init failed:', e.message);
  }
}

function yahooHeaders() {
  return {
    'User-Agent': UA,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://finance.yahoo.com/',
    'Origin':  'https://finance.yahoo.com',
    'Cookie':  _cookie,
  };
}

async function proxyYahoo(yahooUrl, res) {
  await ensureSession();
  const sep = yahooUrl.includes('?') ? '&' : '?';
  const finalUrl = _crumb ? `${yahooUrl}${sep}crumb=${encodeURIComponent(_crumb)}` : yahooUrl;

  try {
    const parsed = new URL(finalUrl);
    const result = await httpsGet({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: yahooHeaders(),
    });

    // If Yahoo returns 401, reset session and try once more
    if (result.status === 401 || result.status === 403) {
      _crumb = ''; _cookie = '';
      await ensureSession();
      const parsed2  = new URL(finalUrl);
      const result2  = await httpsGet({
        hostname: parsed2.hostname,
        path: parsed2.pathname + parsed2.search,
        headers: yahooHeaders(),
      });
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
      return res.end(result2.body);
    }

    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
    res.end(result.body);
  } catch (e) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message }));
  }
}

// ─── HTTP Server ───────────────────────────────────────────────────────────────
http.createServer(async (req, res) => {
  const parsed   = url.parse(req.url, true);
  const pathname = parsed.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // ── Yahoo Finance proxy routes ──────────────────────────────────────────────

  // GET /api/quotes?tickers=AAPL,GME,...
  if (pathname === '/api/quotes') {
    const tickers = parsed.query.tickers || '';
    const fields  = [
      'regularMarketPrice', 'regularMarketOpen', 'regularMarketChange',
      'regularMarketChangePercent', 'regularMarketVolume', 'regularMarketPreviousClose',
      'averageDailyVolume10Day', 'averageDailyVolume3Month',
      'marketCap', 'floatShares', 'sharesOutstanding', 'shortPercentOfFloat',
      'regularMarketDayHigh', 'regularMarketDayLow',
      'shortName', 'longName', 'exchange', 'fullExchangeName',
    ].join(',');
    const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(tickers)}&fields=${fields}&lang=en-US&region=US&corsDomain=finance.yahoo.com`;
    return proxyYahoo(yahooUrl, res);
  }

  // GET /api/chart/GME?interval=1m&range=1d
  if (pathname.startsWith('/api/chart/')) {
    const ticker   = pathname.split('/')[3];
    const interval = parsed.query.interval || '1m';
    const range    = parsed.query.range    || '1d';
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${range}&includePrePost=false`;
    return proxyYahoo(yahooUrl, res);
  }

  // GET /api/news/GME
  if (pathname.startsWith('/api/news/')) {
    const ticker   = pathname.split('/')[3];
    const yahooUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(ticker)}&newsCount=6&enableFuzzyQuery=false&quotesCount=0&enableCb=false`;
    return proxyYahoo(yahooUrl, res);
  }

  // ── Static file serving ─────────────────────────────────────────────────────
  const filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  const ext      = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(__dirname, 'index.html'), (e2, d2) => {
        if (e2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(d2);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });

}).listen(PORT, () => {
  console.log(`LiquidFlow running on port ${PORT}`);
  ensureSession(); // warm up Yahoo session on startup
});
