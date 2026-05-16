// ─── UI Rendering ─────────────────────────────────────────────────────────────

// ── Sparkline (inline SVG) ────────────────────────────────────────────────────
function renderSparkline(data, width = 80, height = 28, isPositive = true) {
  if (!data || data.length < 2) return '<svg></svg>';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const color = isPositive ? '#00e676' : '#ff3060';
  const polyline = pts.join(' ');
  const first = pts[0].split(',');
  const last  = pts[pts.length - 1].split(',');
  const areaPts = `${first[0]},${height} ${polyline} ${last[0]},${height}`;
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sg-${isPositive?'p':'n'}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <polygon points="${areaPts}" fill="url(#sg-${isPositive?'p':'n'})" />
      <polyline points="${polyline}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`;
}

// ── Activity bar ──────────────────────────────────────────────────────────────
function renderActivityBar(score) {
  const pct = Math.min(100, Math.max(0, score));
  let color;
  if (pct < 30)      color = '#3a5070';
  else if (pct < 55) color = '#ffcc00';
  else if (pct < 80) color = '#ff8c00';
  else               color = '#ff3060';
  return `
    <div class="activity-bar-wrap" title="Activity: ${pct}">
      <div class="activity-bar" style="width:${pct}%;background:${color}"></div>
      <span class="activity-label">${pct}</span>
    </div>`;
}

// ── Halt badge ────────────────────────────────────────────────────────────────
function renderHaltBadge(status) {
  if (!status) return `<span class="halt-none">${t('halt_none')}</span>`;
  const cls = status === 'UP' ? 'halt-up' : 'halt-down';
  const label = status === 'UP' ? t('halt_up') : t('halt_down');
  return `<span class="halt-badge ${cls}">${label}</span>`;
}

// ── Relative-volume badge ─────────────────────────────────────────────────────
function renderRelVol(rv) {
  let cls = 'rv-normal';
  if (rv >= CONFIG.EXTREME_REL_VOL) cls = 'rv-extreme';
  else if (rv >= CONFIG.HIGH_REL_VOL) cls = 'rv-high';
  return `<span class="${cls}">${rv.toFixed(1)}x</span>`;
}

// ── Change percent cell ───────────────────────────────────────────────────────
function renderChangePct(pct) {
  const cls = pct >= 0 ? 'pos' : 'neg';
  const sign = pct >= 0 ? '+' : '';
  return `<span class="${cls}">${sign}${pct.toFixed(2)}%</span>`;
}

// ── Liquidity count ───────────────────────────────────────────────────────────
function renderLiqCount(count) {
  const dots = Math.min(count, 8);
  let html = `<span class="liq-num">${count}</span> `;
  for (let i = 0; i < dots; i++) {
    html += `<span class="liq-dot${i < count ? ' active' : ''}"></span>`;
  }
  return `<div class="liq-wrap">${html}</div>`;
}

// ── Short percent indicator ───────────────────────────────────────────────────
function renderShortPct(pct) {
  let cls = 'short-low';
  if (pct >= 30) cls = 'short-extreme';
  else if (pct >= 15) cls = 'short-high';
  else if (pct >= 8) cls = 'short-mid';
  return `<span class="${cls}">${pct.toFixed(1)}%</span>`;
}

// ─── Main Scanner Table ───────────────────────────────────────────────────────
function renderTable(stocks) {
  const tbody = document.getElementById('scanner-tbody');
  if (!tbody) return;

  if (stocks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="13" class="empty-row">${t('no_stocks')}</td></tr>`;
    return;
  }

  const existingRows = {};
  tbody.querySelectorAll('tr[data-ticker]').forEach(tr => {
    existingRows[tr.dataset.ticker] = tr;
  });

  const tickers = stocks.map(s => s.ticker);
  Object.keys(existingRows).forEach(tk => {
    if (!tickers.includes(tk)) existingRows[tk].remove();
  });

  stocks.forEach((s, idx) => {
    const isPos = s.changePct >= 0;
    const isSelected = STATE.selectedTicker === s.ticker;

    const html = `
      <td class="col-rank">${idx + 1}</td>
      <td class="col-ticker">
        <div class="ticker-cell">
          <span class="flag">${countryFlag(s.country)}</span>
          <div class="ticker-info">
            <span class="ticker-sym">${s.ticker}</span>
            <span class="ticker-co">${s.company.length > 22 ? s.company.slice(0, 22) + '…' : s.company}</span>
          </div>
          <div class="sparkline">${renderSparkline(s.sparkline, 72, 26, isPos)}</div>
        </div>
      </td>
      <td class="col-price price-cell ${s.priceDir === 'up' ? 'flash-up' : s.priceDir === 'down' ? 'flash-down' : ''}">
        $${s.price < 1 ? s.price.toFixed(4) : s.price.toFixed(2)}
      </td>
      <td class="col-change">${renderChangePct(s.changePct)}</td>
      <td class="col-fmvol key-col"><span class="fmv-val">${formatNum(s.firstMinVol, 1)}</span></td>
      <td class="col-relvol">${renderRelVol(s.relVolume)}</td>
      <td class="col-vol">${formatNum(s.volume, 1)}</td>
      <td class="col-mktcap">${formatUSD(s.marketCap)}</td>
      <td class="col-float">${formatNum(s.float, 1)}</td>
      <td class="col-short">${renderShortPct(s.shortPct)}</td>
      <td class="col-liq">${renderLiqCount(s.liqCount)}</td>
      <td class="col-activity">${renderActivityBar(s.activity)}</td>
      <td class="col-halt">${renderHaltBadge(s.haltStatus)}</td>
    `;

    if (existingRows[s.ticker]) {
      const tr = existingRows[s.ticker];
      tr.innerHTML = html;
      if (isSelected) tr.classList.add('selected');
      else tr.classList.remove('selected');
    } else {
      const tr = document.createElement('tr');
      tr.id = `row-${s.ticker}`;
      tr.dataset.ticker = s.ticker;
      tr.innerHTML = html;
      if (isSelected) tr.classList.add('selected');
      tr.addEventListener('click', () => openDetail(s.ticker));
      tbody.appendChild(tr);
    }
  });

  const ordered = stocks.map(s => document.querySelector(`tr[data-ticker="${s.ticker}"]`)).filter(Boolean);
  ordered.forEach(tr => tbody.appendChild(tr));
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function openDetail(ticker) {
  STATE.selectedTicker = ticker;
  document.querySelectorAll('tr[data-ticker]').forEach(tr => {
    tr.classList.toggle('selected', tr.dataset.ticker === ticker);
  });
  renderDetailPanel(ticker);
  document.getElementById('detail-panel').classList.add('open');
}

function closeDetail() {
  STATE.selectedTicker = null;
  document.querySelectorAll('tr[data-ticker]').forEach(tr => tr.classList.remove('selected'));
  document.getElementById('detail-panel').classList.remove('open');
}

function renderDetailPanel(ticker) {
  const s = STATE.stocks[ticker];
  if (!s) return;
  const panel = document.getElementById('detail-panel');
  const isPos = s.changePct >= 0;

  panel.innerHTML = `
    <div class="detail-header">
      <div class="detail-title">
        <span class="flag">${countryFlag(s.country)}</span>
        <div>
          <span class="detail-sym">${s.ticker}</span>
          <span class="detail-exch">${s.exchange} · ${s.sector}</span>
        </div>
      </div>
      <button class="close-btn" onclick="closeDetail()">✕</button>
    </div>

    <div class="detail-price-row">
      <div class="detail-price ${isPos ? 'pos' : 'neg'}">
        $${s.price < 1 ? s.price.toFixed(4) : s.price.toFixed(2)}
      </div>
      <div class="detail-change ${isPos ? 'pos' : 'neg'}">
        ${isPos ? '+' : ''}${s.changePct.toFixed(2)}% ${t('today')}
      </div>
      ${renderHaltBadge(s.haltStatus)}
    </div>

    <div class="detail-spark">${renderSparkline(s.sparkline, 340, 70, isPos)}</div>

    <div class="detail-section-label">${t('key_metrics')}</div>
    <div class="detail-grid">
      <div class="metric-card key-metric">
        <div class="metric-label">${t('metric_firstMinVol')}</div>
        <div class="metric-val cyan">${formatNum(s.firstMinVol, 1)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">${t('metric_relVol')}</div>
        <div class="metric-val">${renderRelVol(s.relVolume)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">${t('metric_liqEvents')}</div>
        <div class="metric-val cyan">${s.liqCount}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">${t('metric_shortInt')}</div>
        <div class="metric-val">${renderShortPct(s.shortPct)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">${t('metric_mktCap')}</div>
        <div class="metric-val">${formatUSD(s.marketCap)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">${t('metric_floatShares')}</div>
        <div class="metric-val">${formatNum(s.float, 1)} / ${formatNum(s.sharesOut, 1)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">${t('metric_volume')}</div>
        <div class="metric-val">${formatNum(s.volume, 1)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">${t('metric_activity')}</div>
        <div class="metric-val">${renderActivityBar(s.activity)}</div>
      </div>
    </div>

    <div class="detail-section-label">${t('company_activity')}</div>
    <div class="company-activity">
      <span class="activity-tag">${s.companyActivity}</span>
      <span class="catalyst-text">${s.catalyst}</span>
    </div>

    ${renderDetailHalts(s)}
    ${renderDetailWhales(s)}
    ${renderDetailNews(s)}
  `;
}

function renderDetailHalts(s) {
  if (!s.haltHistory || s.haltHistory.length === 0) return '';
  const rows = s.haltHistory.map(h => `
    <div class="halt-row ${h.active ? 'halt-active' : ''}">
      <span class="halt-dir ${h.direction === 'UP' ? 'halt-up' : 'halt-down'}">${h.direction === 'UP' ? '▲ UP' : '▼ DOWN'}</span>
      <span class="halt-time">${new Date(h.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
      <span class="halt-reason">${h.direction === 'UP' ? t('halt_reason_up') : t('halt_reason_down')}</span>
      <span class="halt-dur">${h.active ? `<span class="pulse-dot"></span> ${t('halt_active')}` : h.duration + 'm'}</span>
    </div>`).join('');
  return `
    <div class="detail-section-label">${t('halt_history')}</div>
    <div class="halt-list">${rows}</div>`;
}

function renderDetailWhales(s) {
  if (!s.whales || s.whales.length === 0) return `
    <div class="detail-section-label">${t('whale_trades')}</div>
    <div class="empty-section">${t('no_whale_trades')}</div>`;
  const rows = s.whales.slice(0, 8).map(w => `
    <div class="whale-row">
      <span class="whale-side ${w.side === 'BUY' ? 'pos' : 'neg'}">${w.side === 'BUY' ? t('buy') : t('sell')}</span>
      <span class="whale-val">${formatUSD(w.value)}</span>
      <span class="whale-shares">${formatNum(w.shares, 0)}sh @ $${w.price.toFixed(w.price < 1 ? 4 : 2)}</span>
      <span class="whale-exch">${w.exchange}</span>
      <span class="whale-time">${new Date(w.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
    </div>`).join('');
  return `
    <div class="detail-section-label">${t('whale_trades')}</div>
    <div class="whale-list">${rows}</div>`;
}

function renderDetailNews(s) {
  if (!s.news || s.news.length === 0) return `
    <div class="detail-section-label">${t('news')}</div>
    <div class="empty-section">${t('no_news')}</div>`;
  const rows = s.news.slice(0, 5).map(n => `
    <div class="news-item ${n.sentiment}">
      <div class="news-source">${n.source} · ${new Date(n.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
      <div class="news-headline">${n.headline}</div>
    </div>`).join('');
  return `
    <div class="detail-section-label">${t('news')}</div>
    <div class="news-list">${rows}</div>`;
}

// ─── Bottom Panels ─────────────────────────────────────────────────────────────

function renderBottomWhales() {
  const el = document.getElementById('global-whales');
  if (!el) return;
  const top = STATE.whales.slice(0, 12);
  if (top.length === 0) {
    el.innerHTML = `<div class="empty-section">${t('no_whale_trades')}</div>`;
    return;
  }
  el.innerHTML = top.map(w => `
    <div class="whale-row-compact">
      <span class="ticker-tag">${w.ticker}</span>
      <span class="whale-side ${w.side === 'BUY' ? 'pos' : 'neg'}">${w.side === 'BUY' ? t('buy') : t('sell')}</span>
      <span class="whale-val">${formatUSD(w.value)}</span>
      <span class="whale-shares dim">${formatNum(w.shares, 0)}sh</span>
      <span class="whale-time dim">${new Date(w.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
    </div>`).join('');
}

function renderBottomNews() {
  const el = document.getElementById('global-news');
  if (!el) return;
  const top = STATE.news.slice(0, 8);
  if (top.length === 0) {
    el.innerHTML = `<div class="empty-section">${t('no_news')}</div>`;
    return;
  }
  el.innerHTML = top.map(n => `
    <div class="news-item-compact ${n.sentiment}">
      <span class="ticker-tag">${n.ticker}</span>
      <span class="news-src dim">${n.source}</span>
      <span class="news-hl">${n.headline}</span>
      <span class="news-time dim">${new Date(n.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
    </div>`).join('');
}

function renderHaltAlerts() {
  const el = document.getElementById('halt-ticker-bar');
  if (!el) return;
  const active = STATE.halts.filter(h => h.active);
  if (active.length === 0) {
    el.innerHTML = `<span class="halt-bar-empty">${t('no_active_halts')}</span>`;
    return;
  }
  el.innerHTML = active.map(h => `
    <div class="halt-bar-item">
      <span class="pulse-dot"></span>
      <span class="halt-bar-ticker">${h.ticker}</span>
      <span class="halt-dir ${h.direction === 'UP' ? 'halt-up' : 'halt-down'}">${h.direction === 'UP' ? '▲' : '▼'} ${h.direction}</span>
      <span class="halt-bar-reason">${h.direction === 'UP' ? t('halt_reason_up') : t('halt_reason_down')}</span>
    </div>`).join('');
}

// ─── Header stats ──────────────────────────────────────────────────────────────

function renderHeader() {
  const statusEl = document.getElementById('market-status');
  if (statusEl) {
    statusEl.textContent = STATE.marketStatus === 'OPEN' ? t('market_open') : t('market_closed');
    statusEl.className = 'market-status ' + (STATE.marketStatus === 'OPEN' ? 'open' : 'closed');
  }

  const timeEl = document.getElementById('market-time');
  if (timeEl) timeEl.textContent = timeNow();

  const countsEl = document.getElementById('stats-bar');
  if (countsEl) {
    const stocks = Object.values(STATE.stocks);
    const gainers = stocks.filter(s => s.changePct > 0).length;
    const losers  = stocks.filter(s => s.changePct < 0).length;
    const halted  = stocks.filter(s => s.haltStatus).length;
    const highVol = stocks.filter(s => s.relVolume >= CONFIG.HIGH_REL_VOL).length;
    countsEl.innerHTML = `
      <span class="stat-chip pos">▲ ${gainers} ${t('stat_gainers')}</span>
      <span class="stat-chip neg">▼ ${losers} ${t('stat_losers')}</span>
      <span class="stat-chip amber">⚡ ${highVol} ${t('stat_highvol')}</span>
      <span class="stat-chip ${halted > 0 ? 'halt-chip' : 'dim'}">⊘ ${halted} ${t('stat_halted')}</span>
    `;
  }
}

// ─── Column sort headers ───────────────────────────────────────────────────────
function renderTableHeaders() {
  const thead = document.getElementById('scanner-thead');
  if (!thead) return;
  thead.innerHTML = '<tr>' + COLUMNS.map(col => {
    const isSorted = STATE.sortCol === col.id;
    const arrow = isSorted ? (STATE.sortDir === 'asc' ? ' ↑' : ' ↓') : '';
    const sortable  = col.sortable ? 'sortable' : '';
    const active    = isSorted ? 'sorted' : '';
    const isKey     = col.id === 'firstMinVol' ? 'key-col-header' : '';
    const label     = t('col_' + col.id) || col.label;
    return `<th class="${sortable} ${active} ${isKey}" style="width:${col.width}"
              onclick="${col.sortable ? `sortBy('${col.id}')` : ''}">${label}${arrow}</th>`;
  }).join('') + '</tr>';
}

// ─── Sort handler ──────────────────────────────────────────────────────────────
function sortBy(col) {
  if (STATE.sortCol === col) {
    STATE.sortDir = STATE.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    STATE.sortCol = col;
    STATE.sortDir = 'desc';
  }
  renderTableHeaders();
  renderTable(getSortedStocks());
}

// ─── Settings modal ────────────────────────────────────────────────────────────
function openSettings() {
  document.getElementById('settings-modal').classList.add('open');
  document.getElementById('api-key-input').value = CONFIG.POLYGON_API_KEY;
}

function closeSettings() {
  document.getElementById('settings-modal').classList.remove('open');
}

function saveSettings() {
  CONFIG.POLYGON_API_KEY = document.getElementById('api-key-input').value.trim();
  closeSettings();
  if (CONFIG.POLYGON_API_KEY) {
    showToast(t('toast_key_saved'), 'success');
    activateLive();
  } else {
    showToast(t('toast_demo_mode'), 'info');
    startDemoLoop();
  }
}

// ─── Toast notifications ────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const t_el = document.createElement('div');
  t_el.className = `toast toast-${type}`;
  t_el.textContent = msg;
  container.appendChild(t_el);
  setTimeout(() => t_el.classList.add('show'), 10);
  setTimeout(() => { t_el.classList.remove('show'); setTimeout(() => t_el.remove(), 300); }, 3500);
}
