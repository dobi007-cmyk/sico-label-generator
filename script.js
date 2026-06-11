// ==================== STATE & HELPERS ====================
let lang = 'uk', selectedSeries = 'EC', labelSize = {w:148,h:105}, sizeMode = 'A6', zoomLevel = 70, layoutMode = '1full', customPositions = {tl:true,tr:false,bl:false,br:false};
function t(k){ return (TR[lang]&&TR[lang][k])||TR.en[k]||k; }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ==================== INIT ====================
function init(){
  buildSeriesGrid();
  setLang('uk');
  applyZoom();
}
function buildSeriesGrid(){
  const g = document.getElementById('seriesGrid');
  g.innerHTML = '';
  Object.entries(SERIES).forEach(([code,s])=>{
    const d = document.createElement('div');
    d.className='series-card'+(code===selectedSeries?' active':'');
    d.id='sc_'+code;
    d.onclick=()=>selectSeries(code);
    d.innerHTML=`<div class="series-dot" style="background:${s.bg};border:2px solid ${s.border};"></div><div><div class="series-name">${s.name}</div><div class="series-code">${code}</div></div>`;
    g.appendChild(d);
  });
}
function selectSeries(code){
  selectedSeries=code;
  document.querySelectorAll('.series-card').forEach(c=>c.classList.remove('active'));
  document.getElementById('sc_'+code)?.classList.add('active');
  renderPreview();
}
function setLang(l){
  lang=l;
  document.querySelectorAll('.lang-btn').forEach(b=>{
    const txt=b.textContent.trim();
    b.classList.toggle('active', (l==='uk'&&txt==='УКР')||(l==='en'&&txt==='ENG')||(l==='pl'&&txt==='PL'));
  });
  document.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent=t(el.dataset.i18n); });
  renderPreview();
}
function setSize(mode){
  sizeMode=mode;
  ['A6','A5','custom'].forEach(m=>document.getElementById('size'+m)?.classList.toggle('active',m===mode));
  document.getElementById('customSizeField').style.display=mode==='custom'?'':'none';
  if(mode==='A6') labelSize={w:148,h:105};
  else if(mode==='A5') labelSize={w:210,h:148};
  else{ labelSize.w=parseInt(document.getElementById('customW')?.value)||148; labelSize.h=parseInt(document.getElementById('customH')?.value)||105; }
  renderPreview();
}
function setLayout(mode){
  layoutMode=mode;
  ['1full','2horiz','2vert','4grid','custom'].forEach(m=>{ document.getElementById('ly_'+m)?.classList.toggle('active',m===mode); });
  document.getElementById('posPickerWrap').style.display=mode==='custom'?'':'none';
  renderPreview();
}
function togglePos(pos){
  customPositions[pos]=!customPositions[pos];
  if(!Object.values(customPositions).some(Boolean)) customPositions[pos]=true;
  updatePosBtns();
  ['tl','tr','bl','br'].forEach(p=>{
    const el=document.getElementById('li_'+p);
    if(el){
      el.classList.toggle('active',customPositions[p]);
      el.classList.toggle('empty',!customPositions[p]);
      el.style.background=customPositions[p]?'var(--accent)':'var(--border)';
    }
  });
  renderPreview();
}
function updatePosBtns(){
  ['tl','tr','bl','br'].forEach(p=>{ document.getElementById('pos_'+p)?.classList.toggle('active',customPositions[p]); });
}
function zoom(d){ zoomLevel=Math.max(15,Math.min(200,zoomLevel+d)); applyZoom(); }
function zoomReset(){ zoomLevel=70; applyZoom(); }
function applyZoom(){ document.getElementById('labelWrap').style.transform=`scale(${zoomLevel/100})`; document.getElementById('zoomVal').textContent=zoomLevel+'%'; }

function getLabelHtml(data, px){
  const s=px, series=data.series, isLight=['#fbbf24','#a78bfa'].includes(series.bg), tc=isLight?'#1e1e1e':'#fff';
  const sd=SAFETY[data.seriesId]?(SAFETY[data.seriesId][lang]||SAFETY[data.seriesId].en):null;
  let safetyBlock='';
  if(data.showSafety&&sd){
    const ghsItems=(series.ghs||[]).map(c=>{
      let f='';
      if(c==='GHS02') f='ghs02.png'; else if(c==='GHS07') f='ghs07.png'; else if(c==='GHS08') f='ghs08.png'; else if(c==='GHS09') f='ghs09.png';
      return f?`<img src="${f}" style="width:${s*14}px;height:${s*14}px;object-fit:contain;margin-right:${s*2}px;" alt="${c}">`:`<span style="display:inline-flex;width:${s*14}px;height:${s*14}px;border:${s*.5}px solid #c00;border-radius:${s*1}px;font-size:${s*8}px;background:white;">⚠</span>`;
    }).join('');
    const ghsRow=ghsItems?`<div style="margin:${s*2}px 0;">${ghsItems}</div>`:'';
    if(sd.nonHazardous){
      safetyBlock=`<div style="flex:1;border-left:${s*.4}px solid #ddd;padding:${s*3}px ${s*4}px;font-size:${s*2.8}px;background:#fafafa;"><div style="font-weight:700;">${t('lbl_safety_name')}: ${series.name}</div>${ghsRow}<p>${t('lbl_safety_nonhazardous')}</p><p><em>${t('lbl_safety_professional')}</em></p></div>`;
    } else {
      safetyBlock=`<div style="flex:1;border-left:${s*.4}px solid #ddd;padding:${s*3}px ${s*4}px;font-size:${s*2.5}px;background:#fafafa;"><div style="font-weight:700;">${t('lbl_safety_name')}: ${series.name}</div>${ghsRow}<p><strong>${t('lbl_safety_contains')}:</strong> ${sd.contains||''}</p><div><strong>${t('lbl_safety_hazards')}</strong>${(sd.hazards||[]).map(h=>`<p>${h}</p>`).join('')}</div><div><strong>${t('lbl_safety_precautions')}</strong>${(sd.precautions||[]).map(p=>`<p>${p}</p>`).join('')}</div><p><em>${t('lbl_safety_professional')}</em></p></div>`;
    }
  }
  let tech='';
  if(data.use) tech+=`<div><strong>${t('lbl_use')}:</strong> ${esc(data.use)}</div>`;
  if(data.aspect) tech+=`<div><strong>${t('lbl_aspect')}:</strong> ${esc(data.aspect)}</div>`;
  if(data.drying) tech+=`<div><strong>${t('lbl_drying')}:</strong> ${esc(data.drying)}</div>`;
  if(data.batchNo) tech+=`<div><strong>${t('lbl_batch')}:</strong> ${esc(data.batchNo)}</div>`;
  if(data.expiryDate) tech+=`<div><strong>${t('lbl_expiry')}:</strong> ${esc(data.expiryDate)}</div>`;
  const ca=v=>`-webkit-print-color-adjust:exact;print-color-adjust:exact;${v}`;
  return `<div style="${ca(`width:${data.w}px;height:${data.h}px;background:white;border-radius:${s*3}px;display:flex;flex-direction:column;font-family:'Inter';color:#000;`)}">
    <div style="${ca(`background:${series.bg};border-bottom:${s*.5}px solid ${series.border};padding:${s*3}px ${s*8}px;text-align:center;`)}">
      <div style="font-size:${s*2.5}px;font-weight:500;color:${tc};">SICO Polska Sp. z o.o.</div>
      <div style="font-size:${s*5}px;font-weight:800;color:${tc};">${series.name}</div>
      ${data.category?`<div style="font-size:${s*2.3}px;color:${tc};">${esc(data.category)}</div>`:''}
    </div>
    <div style="display:flex;flex:1;">
      <div style="flex:${safetyBlock?'0 0 42%':'0 0 100%'};padding:${s*4}px ${s*5}px;text-align:center;">
        <div style="font-weight:700;font-size:${s*4}px;">${esc(data.name)}</div>
        <div style="font-size:${s*2.2}px;">${t('lbl_date')}: ${data.date}</div>
        <div style="border:${s*.5}px solid ${series.bg};border-radius:${s*5}px;padding:${s*2}px;margin:${s*2}px 0;"><span style="font-size:${s*7}px;font-weight:800;">${data.weight.toFixed(2).replace('.',',')}</span><span style="font-size:${s*2.5}px;"> kg</span></div>
        ${tech?`<div style="border-top:${s*.3}px dashed #bbb;padding-top:${s*2}px;font-size:${s*2.2}px;">${tech}</div>`:''}
      </div>
      ${safetyBlock}
    </div>
    ${data.showDistributor&&(data.distributor||data.producer)?`<div style="background:#f5f5f5;border-top:${s*.4}px solid #ddd;padding:${s*2}px;font-size:${s*1.8}px;text-align:center;">${data.distributor?`<div><strong>${t('lbl_distributor')}</strong> ${esc(data.distributor)}</div>`:''}${data.producer?`<div>${t('lbl_producer')} ${esc(data.producer)}</div>`:''}</div>`:''}
    ${data.showNote?`<div style="border-top:${s*.3}px dashed #bbb;padding:${s*1.5}px;font-size:${s*1.7}px;text-align:center;color:${series.bg};">${t('lbl_note')}</div>`:''}
  </div>`;
}

function getFormData(){
  if(sizeMode==='custom'){ labelSize.w=parseInt(document.getElementById('customW')?.value)||148; labelSize.h=parseInt(document.getElementById('customH')?.value)||105; }
  const dateLocale=lang==='uk'?'uk-UA':lang==='pl'?'pl-PL':'en-GB';
  return {
    series: SERIES[selectedSeries]||SERIES.EC, seriesId:selectedSeries,
    name: document.getElementById('productName')?.value||'', category: document.getElementById('productCategory')?.value||'',
    use: document.getElementById('productUse')?.value||'', aspect: document.getElementById('productAspect')?.value||'',
    drying: document.getElementById('productDrying')?.value||'', weight: parseFloat(document.getElementById('weightKg')?.value)||1.0,
    showSafety: document.getElementById('showSafety')?.checked, showDistributor: document.getElementById('showDistributor')?.checked,
    showNote: document.getElementById('showNote')?.checked, distributor: document.getElementById('distributorName')?.value||'',
    producer: document.getElementById('producerName')?.value||'', batchNo: document.getElementById('batchNo')?.value||'',
    expiryDate: document.getElementById('expiryDate')?.value||'', date: new Date().toLocaleDateString(dateLocale), w:0, h:0
  };
}

function getPositions(){
  const lw=labelSize.w, lh=labelSize.h, GAP=2;
  if(layoutMode==='1full') return {sheetW:lw,sheetH:lh,cells:[{x:0,y:0}]};
  if(layoutMode==='2horiz') return {sheetW:lw*2+GAP,sheetH:lh,cells:[{x:0,y:0},{x:lw+GAP,y:0}]};
  if(layoutMode==='2vert') return {sheetW:lw,sheetH:lh*2+GAP,cells:[{x:0,y:0},{x:0,y:lh+GAP}]};
  if(layoutMode==='4grid') return {sheetW:lw*2+GAP,sheetH:lh*2+GAP,cells:[{x:0,y:0},{x:lw+GAP,y:0},{x:0,y:lh+GAP},{x:lw+GAP,y:lh+GAP}]};
  if(layoutMode==='custom'){
    const posMap={tl:{x:0,y:0},tr:{x:lw+GAP,y:0},bl:{x:0,y:lh+GAP},br:{x:lw+GAP,y:lh+GAP}};
    const cells=Object.entries(customPositions).filter(([,v])=>v).map(([k])=>posMap[k]);
    const maxX=Math.max(...cells.map(c=>c.x),0), maxY=Math.max(...cells.map(c=>c.y),0);
    return {sheetW:maxX>0?lw*2+GAP:lw, sheetH:maxY>0?lh*2+GAP:lh, cells};
  }
  return {sheetW:lw,sheetH:lh,cells:[{x:0,y:0}]};
}

function renderPreview(){
  const data=getFormData();
  const PX=2.83;
  data.w=Math.round(labelSize.w*PX); data.h=Math.round(labelSize.h*PX);
  const pos=getPositions();
  const totalW=Math.round(pos.sheetW*PX), totalH=Math.round(pos.sheetH*PX);
  let inner='';
  pos.cells.forEach(c=>{ inner+=`<div style="position:absolute;left:${Math.round(c.x*PX)}px;top:${Math.round(c.y*PX)}px;">${getLabelHtml(data,PX)}</div>`; });
  const p=document.getElementById('labelPreview');
  p.style.width=totalW+'px'; p.style.height=totalH+'px'; p.style.position='relative'; p.style.background='#d1d5db'; p.style.borderRadius='4px'; p.style.boxShadow='0 16px 50px rgba(0,0,0,.7)'; p.innerHTML=inner;
}

// -------------------- НОВА ВЕРСІЯ ДРУКУ (A4, автоматичне масштабування) --------------------
function printLabel() {
  const data = getFormData();
  const positions = getPositions();          // отримуємо макет в мм (без масштабу)
  const labelMM = { w: labelSize.w, h: labelSize.h };
  const A4_W = 210, A4_H = 297;
  const margin = 10; // мм з кожного боку

  // Обчислюємо необхідну ширину та висоту для розміщення всіх етикеток з проміжками
  let requiredW = positions.sheetW;
  let requiredH = positions.sheetH;

  // Якщо макет вміщається на A4 з полями – друкуємо без змін
  let scale = 1;
  if (requiredW > (A4_W - 2*margin) || requiredH > (A4_H - 2*margin)) {
    // Обчислюємо необхідне масштабування, щоб влізло в A4 з полями
    const scaleW = (A4_W - 2*margin) / requiredW;
    const scaleH = (A4_H - 2*margin) / requiredH;
    scale = Math.min(scaleW, scaleH);
    if (scale < 0.5) {
      alert(`Увага! Обраний макет занадто великий для аркуша A4. Буде застосовано масштаб ${Math.round(scale*100)}%. Рекомендуємо вибрати менший розмір етикетки або інший макет.`);
    } else {
      alert(`Обраний макет трохи більший за A4. Буде застосовано автоматичне масштабування ${Math.round(scale*100)}% для вміщення на аркуш.`);
    }
  }

  // Функція для генерації однієї етикетки з можливим масштабуванням (для друку)
  function getScaledLabelHtml(d, scaleFactor) {
    const PX_BASE = 3.7795; // 1 мм = 3.7795 px (96 dpi)
    const wPx = Math.round(labelMM.w * PX_BASE * scaleFactor);
    const hPx = Math.round(labelMM.h * PX_BASE * scaleFactor);
    const tempData = { ...d, w: wPx, h: hPx };
    // Тимчасово змінюємо px для генерації HTML з правильним розміром
    const originalW = d.w, originalH = d.h;
    d.w = wPx; d.h = hPx;
    const html = getLabelHtml(d, PX_BASE);
    d.w = originalW; d.h = originalH;
    return html;
  }

  // Розраховуємо положення кожної етикетки в міліметрах після масштабування
  const cellsScaled = positions.cells.map(cell => ({
    x: margin + cell.x * scale,
    y: margin + cell.y * scale,
    w: labelMM.w * scale,
    h: labelMM.h * scale
  }));

  // Генеруємо HTML для друку (A4, абсолютне позиціонування в мм)
  const style = `
    @page { size: A4; margin: 0; }
    body { margin: 0; padding: 0; background: white; width: 210mm; height: 297mm; overflow: hidden; position: relative; }
    .label { position: absolute; background: white; overflow: hidden; }
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none; }
    }
  `;
  let labelsHtml = '';
  for (let i = 0; i < cellsScaled.length; i++) {
    const c = cellsScaled[i];
    const leftMm = c.x;
    const topMm = c.y;
    const widthMm = c.w;
    const heightMm = c.h;
    // Генеруємо HTML конкретної етикетки з масштабом
    const labelHtml = getScaledLabelHtml(data, scale);
    labelsHtml += `<div class="label" style="left: ${leftMm}mm; top: ${topMm}mm; width: ${widthMm}mm; height: ${heightMm}mm;">${labelHtml}</div>`;
  }

  const html = `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Друк етикеток SICO</title>
    <style>${style}</style>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body>
    <button class="no-print" onclick="window.close()" style="position:fixed;bottom:10px;right:10px;z-index:1000;background:#e63946;color:white;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;">${t('close_btn')}</button>
    ${labelsHtml}
    <script>
      document.fonts.ready.then(() => { setTimeout(() => window.print(), 300); });
    <\/script>
  </body>
  </html>`;

  const win = window.open('', '_blank');
  if (!win) { alert('Дозвольте спливаючі вікна в браузері'); return; }
  win.document.write(html);
  win.document.close();
  showToast(t('toast_print'));
}
// ------------------------------------------------------------------

function copyHtml(){ navigator.clipboard.writeText(document.getElementById('labelPreview').outerHTML).then(()=>showToast(t('toast_copy'))); }
function resetForm(){
  ['productName','productCategory','productUse','productAspect','productDrying','batchNo','expiryDate'].forEach(id=>{ document.getElementById(id).value=''; });
  document.getElementById('weightKg').value='1.00';
  document.getElementById('showSafety').checked=true;
  document.getElementById('showDistributor').checked=true;
  document.getElementById('showNote').checked=true;
  selectedSeries='EC'; layoutMode='1full'; customPositions={tl:true,tr:false,bl:false,br:false};
  buildSeriesGrid();
  document.querySelectorAll('.layout-card').forEach(c=>c.classList.remove('active'));
  document.getElementById('ly_1full').classList.add('active');
  document.getElementById('posPickerWrap').style.display='none';
  setSize('A6');
  showToast(t('toast_reset'));
}
function showToast(msg){ const el=document.getElementById('toast'); el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2500); }
init();
