let currentLang = 'uk';
let selectedSeries = 'EC';
let labelSize = { w: 148, h: 105 };
let sizeMode = 'A6';
let zoomLevel = 70;
let layoutMode = '1full';
let customPositions = { tl: true, tr: false, bl: false, br: false };

// DOM elements
const seriesGrid = document.getElementById('seriesGrid');
const labelPreview = document.getElementById('labelPreview');
const labelWrap = document.getElementById('labelWrap');
const zoomVal = document.getElementById('zoomVal');
const toastEl = document.getElementById('toast');

// Helper: translation
function t(key) {
  return (TR[currentLang] && TR[currentLang][key]) || TR.en[key] || key;
}

// Helper: escape HTML
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Show toast
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2500);
}

// Apply zoom
function applyZoom() {
  labelWrap.style.transform = `scale(${zoomLevel / 100})`;
  zoomVal.textContent = zoomLevel + '%';
}

// Build series buttons
function buildSeriesGrid() {
  seriesGrid.innerHTML = '';
  Object.entries(SERIES).forEach(([code, s]) => {
    const card = document.createElement('div');
    card.className = `series-card ${code === selectedSeries ? 'active' : ''}`;
    card.id = `sc_${code}`;
    card.innerHTML = `
      <div class="series-dot" style="background:${s.bg};border:2px solid ${s.border};"></div>
      <div><div class="series-name">${s.name}</div><div class="series-code">${code}</div></div>
    `;
    card.addEventListener('click', () => {
      selectedSeries = code;
      document.querySelectorAll('.series-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      renderPreview();
    });
    seriesGrid.appendChild(card);
  });
}

// Get form data
function getFormData() {
  if (sizeMode === 'custom') {
    const w = parseInt(document.getElementById('customW')?.value, 10);
    const h = parseInt(document.getElementById('customH')?.value, 10);
    if (!isNaN(w) && w > 0) labelSize.w = w;
    if (!isNaN(h) && h > 0) labelSize.h = h;
  }
  const dateLocale = currentLang === 'uk' ? 'uk-UA' : currentLang === 'pl' ? 'pl-PL' : 'en-GB';
  return {
    series: SERIES[selectedSeries] || SERIES.EC,
    seriesId: selectedSeries,
    name: document.getElementById('productName')?.value || '',
    category: document.getElementById('productCategory')?.value || '',
    use: document.getElementById('productUse')?.value || '',
    aspect: document.getElementById('productAspect')?.value || '',
    drying: document.getElementById('productDrying')?.value || '',
    weight: parseFloat(document.getElementById('weightKg')?.value) || 1.0,
    showSafety: document.getElementById('showSafety')?.checked,
    showDistributor: document.getElementById('showDistributor')?.checked,
    showNote: document.getElementById('showNote')?.checked,
    distributor: document.getElementById('distributorName')?.value || '',
    producer: document.getElementById('producerName')?.value || '',
    batchNo: document.getElementById('batchNo')?.value || '',
    expiryDate: document.getElementById('expiryDate')?.value || '',
    date: new Date().toLocaleDateString(dateLocale),
    w: 0, h: 0
  };
}

// Get sheet positions (mm)
function getPositions() {
  const lw = labelSize.w, lh = labelSize.h;
  const GAP = 2;
  if (layoutMode === '1full') return { sheetW: lw, sheetH: lh, cells: [{ x: 0, y: 0 }] };
  if (layoutMode === '2horiz') return { sheetW: lw * 2 + GAP, sheetH: lh, cells: [{ x: 0, y: 0 }, { x: lw + GAP, y: 0 }] };
  if (layoutMode === '2vert') return { sheetW: lw, sheetH: lh * 2 + GAP, cells: [{ x: 0, y: 0 }, { x: 0, y: lh + GAP }] };
  if (layoutMode === '4grid') return { sheetW: lw * 2 + GAP, sheetH: lh * 2 + GAP, cells: [{ x: 0, y: 0 }, { x: lw + GAP, y: 0 }, { x: 0, y: lh + GAP }, { x: lw + GAP, y: lh + GAP }] };
  if (layoutMode === 'custom') {
    const posMap = { tl: { x: 0, y: 0 }, tr: { x: lw + GAP, y: 0 }, bl: { x: 0, y: lh + GAP }, br: { x: lw + GAP, y: lh + GAP } };
    const cells = Object.entries(customPositions).filter(([, v]) => v).map(([k]) => posMap[k]);
    const maxX = Math.max(...cells.map(c => c.x), 0);
    const maxY = Math.max(...cells.map(c => c.y), 0);
    const sheetW = maxX > 0 ? lw * 2 + GAP : lw;
    const sheetH = maxY > 0 ? lh * 2 + GAP : lh;
    return { sheetW, sheetH, cells };
  }
  return { sheetW: lw, sheetH: lh, cells: [{ x: 0, y: 0 }] };
}

// Generate single label HTML
function getLabelHtml(data, pxPerMm) {
  const s = pxPerMm;
  const series = data.series;
  const isLight = ['#fbbf24', '#a78bfa'].includes(series.bg);
  const tc = isLight ? '#1e1e1e' : '#fff';
  const safetyInfo = SAFETY[data.seriesId] ? (SAFETY[data.seriesId][currentLang] || SAFETY[data.seriesId].en) : null;
  let safetyBlock = '';
  if (data.showSafety && safetyInfo) {
    const ghsItems = (series.ghs || []).map(c => `<span style="display:inline-flex;align-items:center;justify-content:center;width:${s*14}px;height:${s*14}px;border:${s*.5}px solid #c00;border-radius:${s*1}px;font-size:${s*8}px;background:#fff;margin-right:${s*2}px;">${GHS_EMOJI[c] || '⚠'}</span>`).join('');
    const ghsRow = ghsItems ? `<div style="margin:${s*2}px 0;">${ghsItems}</div>` : '';
    if (safetyInfo.nonHazardous) {
      safetyBlock = `<div style="flex:1;border-left:${s*.4}px solid #ddd;padding:${s*3}px ${s*4}px;font-size:${s*2.8}px;background:#fafafa;"><div style="font-weight:700;">${t('lbl_safety_name')}: ${series.name}</div>${ghsRow}<p>${t('lbl_safety_nonhazardous')}</p><p><em>${t('lbl_safety_professional')}</em></p></div>`;
    } else {
      safetyBlock = `<div style="flex:1;border-left:${s*.4}px solid #ddd;padding:${s*3}px ${s*4}px;font-size:${s*2.5}px;background:#fafafa;"><div style="font-weight:700;">${t('lbl_safety_name')}: ${series.name}</div>${ghsRow}<p><strong>${t('lbl_safety_contains')}:</strong> ${safetyInfo.contains || ''}</p><div><strong>${t('lbl_safety_hazards')}</strong>${(safetyInfo.hazards || []).map(h => `<p>${h}</p>`).join('')}</div><div><strong>${t('lbl_safety_precautions')}</strong>${(safetyInfo.precautions || []).map(p => `<p>${p}</p>`).join('')}</div><p><em>${t('lbl_safety_professional')}</em></p></div>`;
    }
  }
  let tech = '';
  if (data.use) tech += `<div><strong>${t('lbl_use')}:</strong> ${esc(data.use)}</div>`;
  if (data.aspect) tech += `<div><strong>${t('lbl_aspect')}:</strong> ${esc(data.aspect)}</div>`;
  if (data.drying) tech += `<div><strong>${t('lbl_drying')}:</strong> ${esc(data.drying)}</div>`;
  if (data.batchNo) tech += `<div><strong>${t('lbl_batch')}:</strong> ${esc(data.batchNo)}</div>`;
  if (data.expiryDate) tech += `<div><strong>${t('lbl_expiry')}:</strong> ${esc(data.expiryDate)}</div>`;
  const ca = (v) => `-webkit-print-color-adjust:exact;print-color-adjust:exact;${v}`;
  return `<div style="${ca(`width:${data.w}px;height:${data.h}px;background:white;border-radius:${s*3}px;display:flex;flex-direction:column;font-family:'Inter';color:#000;`)}">
    <div style="${ca(`background:${series.bg};border-bottom:${s*.5}px solid ${series.border};padding:${s*3}px ${s*8}px;text-align:center;`)}">
      <div style="font-size:${s*2.5}px;font-weight:500;color:${tc};">SICO Screen Inks</div>
      <div style="font-size:${s*5}px;font-weight:800;color:${tc};">${series.name}</div>
      ${data.category ? `<div style="font-size:${s*2.3}px;color:${tc};">${esc(data.category)}</div>` : ''}
    </div>
    <div style="display:flex;flex:1;">
      <div style="flex:${safetyBlock ? '0 0 42%' : '0 0 100%'};padding:${s*4}px ${s*5}px;text-align:center;">
        <div style="font-weight:700;font-size:${s*4}px;">${esc(data.name)}</div>
        <div style="font-size:${s*2.2}px;">${t('lbl_date')}: ${data.date}</div>
        <div style="border:${s*.5}px solid ${series.bg};border-radius:${s*5}px;padding:${s*2}px;margin:${s*2}px 0;">
          <span style="font-size:${s*7}px;font-weight:800;">${data.weight.toFixed(2).replace('.', ',')}</span>
          <span style="font-size:${s*2.5}px;"> kg</span>
        </div>
        ${tech ? `<div style="border-top:${s*.3}px dashed #bbb;padding-top:${s*2}px;font-size:${s*2.2}px;">${tech}</div>` : ''}
      </div>
      ${safetyBlock}
    </div>
    ${data.showDistributor && (data.distributor || data.producer) ? `<div style="background:#f5f5f5;border-top:${s*.4}px solid #ddd;padding:${s*2}px;font-size:${s*1.8}px;text-align:center;">${data.distributor ? `<div><strong>${t('lbl_distributor')}</strong> ${esc(data.distributor)}</div>` : ''}${data.producer ? `<div>${t('lbl_producer')} ${esc(data.producer)}</div>` : ''}</div>` : ''}
    ${data.showNote ? `<div style="border-top:${s*.3}px dashed #bbb;padding:${s*1.5}px;font-size:${s*1.7}px;text-align:center;color:${series.bg};">${t('lbl_note')}</div>` : ''}
  </div>`;
}

// Render preview
function renderPreview() {
  const data = getFormData();
  const PX_PER_MM = 2.83;
  const lw = Math.round(labelSize.w * PX_PER_MM);
  const lh = Math.round(labelSize.h * PX_PER_MM);
  data.w = lw;
  data.h = lh;
  const positions = getPositions();
  const totalW = Math.round(positions.sheetW * PX_PER_MM);
  const totalH = Math.round(positions.sheetH * PX_PER_MM);
  let inner = '';
  positions.cells.forEach(cell => {
    inner += `<div style="position:absolute;left:${Math.round(cell.x * PX_PER_MM)}px;top:${Math.round(cell.y * PX_PER_MM)}px;">${getLabelHtml(data, PX_PER_MM)}</div>`;
  });
  labelPreview.style.width = totalW + 'px';
  labelPreview.style.height = totalH + 'px';
  labelPreview.style.position = 'relative';
  labelPreview.style.background = '#d1d5db';
  labelPreview.style.borderRadius = '4px';
  labelPreview.innerHTML = inner;
}

// Print
function printLabel() {
  const data = getFormData();
  const PX_PER_MM = 3.7795;
  const positions = getPositions();
  let parts = '';
  positions.cells.forEach(cell => {
    data.w = Math.round(labelSize.w * PX_PER_MM);
    data.h = Math.round(labelSize.h * PX_PER_MM);
    parts += `<div style="position:absolute;left:${Math.round(cell.x * PX_PER_MM)}px;top:${Math.round(cell.y * PX_PER_MM)}px;">${getLabelHtml(data, PX_PER_MM)}</div>`;
  });
  const pageW = positions.sheetW + 'mm';
  const pageH = positions.sheetH + 'mm';
  const bodyW = Math.round(positions.sheetW * PX_PER_MM) + 'px';
  const win = window.open('', '_blank');
  if (!win) { alert('Allow popups'); return; }
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Print Labels</title><style>body{margin:0;padding:0;}@page{size:${pageW} ${pageH};margin:0;}.sheet{position:relative;width:${bodyW};height:${bodyH};background:white;}.close-btn{position:fixed;bottom:12px;right:12px;background:#e63946;color:white;border:none;border-radius:8px;padding:6px 14px;cursor:pointer;z-index:9999;}@media print{.close-btn{display:none;}}</style></head><body><button class="close-btn" onclick="window.close()">${t('close_btn')}</button><div class="sheet">${parts}</div><script>setTimeout(()=>window.print(),300);<\/script></body></html>`);
  win.document.close();
  showToast(t('toast_print'));
}

// Copy HTML
function copyHtml() {
  navigator.clipboard.writeText(labelPreview.outerHTML).then(() => showToast(t('toast_copy')));
}

// Reset form
function resetForm() {
  ['productName', 'productCategory', 'productUse', 'productAspect', 'productDrying', 'batchNo', 'expiryDate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('weightKg').value = '1.00';
  document.getElementById('showSafety').checked = true;
  document.getElementById('showDistributor').checked = true;
  document.getElementById('showNote').checked = true;
  selectedSeries = 'EC';
  layoutMode = '1full';
  customPositions = { tl: true, tr: false, bl: false, br: false };
  buildSeriesGrid();
  document.querySelectorAll('.layout-card').forEach(card => card.classList.remove('active'));
  document.querySelector('.layout-card[data-layout="1full"]').classList.add('active');
  document.getElementById('posPickerWrap').style.display = 'none';
  setSize('A6');
  renderPreview();
  showToast(t('toast_reset'));
}

// Set label size
function setSize(mode) {
  sizeMode = mode;
  document.querySelectorAll('.size-radio-btn').forEach(btn => btn.classList.remove('active'));
  if (mode === 'A6') {
    labelSize = { w: 148, h: 105 };
    document.getElementById('sizeA6').classList.add('active');
  } else if (mode === 'A5') {
    labelSize = { w: 210, h: 148 };
    document.getElementById('sizeA5').classList.add('active');
  } else {
    labelSize.w = parseInt(document.getElementById('customW')?.value) || 148;
    labelSize.h = parseInt(document.getElementById('customH')?.value) || 105;
    document.getElementById('sizeCustom').classList.add('active');
  }
  document.getElementById('customSizeField').style.display = mode === 'custom' ? '' : 'none';
  renderPreview();
}

// Set layout
function setLayout(mode) {
  layoutMode = mode;
  document.querySelectorAll('.layout-card').forEach(card => card.classList.remove('active'));
  document.querySelector(`.layout-card[data-layout="${mode}"]`).classList.add('active');
  document.getElementById('posPickerWrap').style.display = mode === 'custom' ? '' : 'none';
  renderPreview();
}

// Toggle custom position
function togglePos(pos) {
  customPositions[pos] = !customPositions[pos];
  if (!Object.values(customPositions).some(v => v)) customPositions[pos] = true;
  // update UI buttons
  document.querySelectorAll('.pos-btn').forEach(btn => {
    if (btn.dataset.pos === pos) btn.classList.toggle('active', customPositions[pos]);
  });
  // update mini icons in custom layout preview
  const cells = document.querySelectorAll('#customIconPreview .cell');
  cells.forEach(cell => {
    const p = cell.dataset.pos;
    if (customPositions[p]) {
      cell.classList.add('active');
      cell.classList.remove('empty');
      cell.style.background = 'var(--accent)';
    } else {
      cell.classList.remove('active');
      cell.classList.add('empty');
      cell.style.background = 'var(--border)';
    }
  });
  renderPreview();
}

// Update all UI texts when language changes
function updateUItexts() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
}

// Set language
function setLang(lang) {
  currentLang = lang;
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  updateUItexts();
  renderPreview();
}

// Event listeners
document.getElementById('printBtn').addEventListener('click', printLabel);
document.getElementById('copyBtn').addEventListener('click', copyHtml);
document.getElementById('resetBtn').addEventListener('click', resetForm);
document.getElementById('zoomIn').addEventListener('click', () => { zoomLevel = Math.min(200, zoomLevel + 10); applyZoom(); });
document.getElementById('zoomOut').addEventListener('click', () => { zoomLevel = Math.max(15, zoomLevel - 10); applyZoom(); });
document.getElementById('zoomReset').addEventListener('click', () => { zoomLevel = 70; applyZoom(); });
document.querySelectorAll('.size-radio-btn').forEach(btn => btn.addEventListener('click', () => setSize(btn.dataset.size)));
document.querySelectorAll('.layout-card').forEach(card => card.addEventListener('click', () => setLayout(card.dataset.layout)));
document.querySelectorAll('.pos-btn').forEach(btn => btn.addEventListener('click', () => togglePos(btn.dataset.pos)));
document.querySelectorAll('.lang-btn').forEach(btn => btn.addEventListener('click', () => setLang(btn.dataset.lang)));
document.getElementById('customW')?.addEventListener('input', () => setSize('custom'));
document.getElementById('customH')?.addEventListener('input', () => setSize('custom'));
document.querySelectorAll('input, select, textarea').forEach(el => el.addEventListener('input', renderPreview));

// Initialization
buildSeriesGrid();
setLang('uk');
setSize('A6');
setLayout('1full');
applyZoom();
renderPreview();
