// ══════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════
let lang = 'uk';
let selectedSeries = 'EC';
let labelSize = {w:148,h:105};
let sizeMode = 'A6';
let zoomLevel = 70;
let layoutMode = '1full';
let customPositions = {tl:true,tr:false,bl:false,br:false};

function t(k){ return (TR[lang]&&TR[lang][k]) || TR.en[k] || k; }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ══════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════
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
    d.innerHTML=`<div class="series-dot" style="background:${s.bg};border:2px solid ${s.border};"></div>
      <div><div class="series-name">${s.name}</div><div class="series-code">${code}</div></div>`;
    g.appendChild(d);
  });
}

function selectSeries(code){
  selectedSeries=code;
  document.querySelectorAll('.series-card').forEach(c=>c.classList.remove('active'));
  document.getElementById('sc_'+code)?.classList.add('active');
  renderPreview();
}

// ══════════════════════════════════════════════════════════
// LANG
// ══════════════════════════════════════════════════════════
function setLang(l){
  lang=l;
  document.querySelectorAll('.lang-btn').forEach(b=>{
    const txt=b.textContent.trim();
    b.classList.toggle('active',
      (l==='uk'&&txt==='УКР')||(l==='en'&&txt==='ENG')||(l==='pl'&&txt==='PL'));
  });
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    el.textContent=t(el.dataset.i18n);
  });
  renderPreview();
}

// ══════════════════════════════════════════════════════════
// SIZE
// ══════════════════════════════════════════════════════════
function setSize(mode){
  sizeMode=mode;
  ['A6','A5','custom'].forEach(m=>document.getElementById('size'+m)?.classList.toggle('active',m===mode));
  document.getElementById('customSizeField').style.display=mode==='custom'?'':'none';
  if(mode==='A6') labelSize={w:148,h:105};
  else if(mode==='A5') labelSize={w:210,h:148};
  else{
    labelSize.w=parseInt(document.getElementById('customW')?.value)||148;
    labelSize.h=parseInt(document.getElementById('customH')?.value)||105;
  }
  renderPreview();
}

// ══════════════════════════════════════════════════════════
// LAYOUT
// ══════════════════════════════════════════════════════════
function setLayout(mode){
  layoutMode=mode;
  ['1full','2horiz','2vert','4grid','custom'].forEach(m=>{
    document.getElementById('ly_'+m)?.classList.toggle('active',m===mode);
  });
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
      el.style.opacity=customPositions[p]?'1':'.35';
    }
  });
  renderPreview();
}
function updatePosBtns(){
  ['tl','tr','bl','br'].forEach(p=>{
    document.getElementById('pos_'+p)?.classList.toggle('active',customPositions[p]);
  });
}

// ══════════════════════════════════════════════════════════
// ZOOM
// ══════════════════════════════════════════════════════════
function zoom(d){ zoomLevel=Math.max(15,Math.min(200,zoomLevel+d)); applyZoom(); }
function zoomReset(){ zoomLevel=70; applyZoom(); }
function applyZoom(){
  document.getElementById('labelWrap').style.transform=`scale(${zoomLevel/100})`;
  document.getElementById('zoomVal').textContent=zoomLevel+'%';
}

// ══════════════════════════════════════════════════════════
// BUILD LABEL HTML (з картинками GHS)
// ══════════════════════════════════════════════════════════
function getLabelHtml(data, scale_px_per_mm, forPrint){
  const {series,name,category,use,aspect,drying,weight,showSafety,showDistributor,showNote,distributor,producer,batchNo,expiryDate,date}=data;
  const s=scale_px_per_mm;
  const isLight=['#fbbf24','#a78bfa'].includes(series.bg);
  const tc=isLight?'#1e1e1e':'#ffffff';

  const safetyInfo=SAFETY[data.seriesId];
  const sd=safetyInfo?(safetyInfo[lang]||safetyInfo.en):null;
  let safetyBlock='';
  if(showSafety&&sd){
    // Заміна емодзі на картинки
    const ghsItems=(series.ghs||[]).map(c=>{
      let imgFile = '';
      if(c === 'GHS02') imgFile = 'ghs02.png';
      else if(c === 'GHS07') imgFile = 'ghs07.png';
      else if(c === 'GHS08') imgFile = 'ghs08.png';
      else if(c === 'GHS09') imgFile = 'ghs09.png';
      else imgFile = null;
      if(imgFile){
        return `<img src="${imgFile}" style="width:${s*14}px;height:${s*14}px;object-fit:contain;margin-right:${s*2}px;" alt="${c}">`;
      } else {
        return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${s*14}px;height:${s*14}px;border:${s*.5}px solid #c00;border-radius:${s*1}px;font-size:${s*8}px;background:white;flex-shrink:0;">⚠</span>`;
      }
    }).join('');
    const ghsRow=ghsItems?`<div style="display:flex;gap:${s*2}px;flex-wrap:wrap;margin:${s*2}px 0;">${ghsItems}</div>`:'';
    const fs=s*1.45; const lh=1.35;
    if(sd.nonHazardous){
      safetyBlock=`<div style="flex:1;border-left:${s*.4}px solid #ddd;padding:${s*3}px ${s*4}px;font-size:${fs}px;line-height:${lh};background:#fafafa;overflow:hidden;">
        <div style="font-weight:700;font-size:${fs*1.15}px;margin-bottom:${s*2}px;border-bottom:${s*.4}px solid #ddd;padding-bottom:${s*1}px;">${t('lbl_safety_name')}: ${series.name}</div>
        ${ghsRow}<p>${t('lbl_safety_nonhazardous')}</p><p><em>${t('lbl_safety_professional')}</em></p>
      </div>`;
    } else {
      const hz=(sd.hazards||[]).map(h=>`<p style="margin:${s*.4}px 0;">${h}</p>`).join('');
      const pr=(sd.precautions||[]).map(p=>`<p style="margin:${s*.4}px 0;">${p}</p>`).join('');
      safetyBlock=`<div style="flex:1;border-left:${s*.4}px solid #ddd;padding:${s*3}px ${s*4}px;font-size:${fs}px;line-height:${lh};background:#fafafa;overflow:hidden;">
        <div style="font-weight:700;font-size:${fs*1.15}px;margin-bottom:${s*1.5}px;border-bottom:${s*.4}px solid #ddd;padding-bottom:${s*1}px;">${t('lbl_safety_name')}: ${series.name}</div>
        ${ghsRow}
        <p style="margin:${s*.4}px 0;"><strong>${t('lbl_safety_contains')}:</strong> ${sd.contains||''}</p>
        <div style="margin-top:${s*1}px;"><strong>${t('lbl_safety_hazards')}</strong>${hz}</div>
        <div style="margin-top:${s*1}px;"><strong>${t('lbl_safety_precautions')}</strong>${pr}</div>
        <p style="margin-top:${s*1}px;"><em>${t('lbl_safety_professional')}</em></p>
      </div>`;
    }
  }

  let tech='';
  const ta=`style="margin-bottom:${s*.7}px;"`;
  const sb=`style="min-width:${s*18}px;display:inline-block;font-weight:600;"`;
  if(use)      tech+=`<div ${ta}><strong ${sb}>${t('lbl_use')}:</strong> ${esc(use)}</div>`;
  if(aspect)   tech+=`<div ${ta}><strong ${sb}>${t('lbl_aspect')}:</strong> ${esc(aspect)}</div>`;
  if(drying)   tech+=`<div ${ta}><strong ${sb}>${t('lbl_drying')}:</strong> ${esc(drying)}</div>`;
  if(batchNo)  tech+=`<div ${ta}><strong ${sb}>${t('lbl_batch')}:</strong> ${esc(batchNo)}</div>`;
  if(expiryDate)tech+=`<div ${ta}><strong ${sb}>${t('lbl_expiry')}:</strong> ${esc(expiryDate)}</div>`;

  const hasSafety=safetyBlock!=='';
  const mainFlex=hasSafety?'0 0 42%':'0 0 100%';
  const ca=(v)=>`-webkit-print-color-adjust:exact;print-color-adjust:exact;${v}`;
  const pw=data.w; const ph=data.h;

  return `<div style="${ca(`width:${pw}px;height:${ph}px;background:white;border-radius:${s*3}px;overflow:hidden;display:flex;flex-direction:column;font-family:'Inter',sans-serif;color:#000;position:relative;`)}">
    <div style="${ca(`background:${series.bg};border-bottom:${s*.5}px solid ${series.border};padding:${s*3}px ${s*10}px;text-align:center;flex-shrink:0;`)}">
      <div style="font-size:${s*2.5}px;font-weight:500;letter-spacing:.8px;color:${tc};opacity:.85;text-transform:uppercase;margin-bottom:${s*1}px;">SICO Polska Sp. z o.o.</div>
      <div style="font-size:${s*5}px;font-weight:800;text-transform:uppercase;color:${tc};line-height:1.1;">${series.name}</div>
      ${category?`<div style="font-size:${s*2.3}px;color:${tc};opacity:.8;margin-top:${s*1}px;">${esc(category)}</div>`:''}
    </div>
    <div style="display:flex;flex:1;min-height:0;">
      <div style="flex:${mainFlex};display:flex;flex-direction:column;align-items:center;padding:${s*4}px ${s*5}px;">
        ${name?`<div style="font-size:${s*4.5}px;font-weight:700;text-align:center;line-height:1.2;margin-bottom:${s*1}px;">${esc(name)}</div>`:''}
        <div style="font-size:${s*2.3}px;color:#666;margin-bottom:${s*3}px;">${t('lbl_date')}: ${date}</div>
        <div style="border-radius:${s*5}px;border:${s*.5}px solid ${series.bg};padding:${s*2}px ${s*8}px;text-align:center;margin-bottom:${s*4}px;">
          <div style="font-size:${s*7}px;font-weight:800;line-height:1;">${weight.toFixed(2).replace('.',',')}</div>
          <div style="font-size:${s*2.5}px;font-weight:500;color:#333;">kg</div>
        </div>
        ${tech?`<div style="width:100%;font-size:${s*2.4}px;border-top:${s*.3}px dashed #bbb;padding-top:${s*2}px;color:#333;line-height:1.5;">${tech}</div>`:''}
      </div>
      ${safetyBlock}
    </div>
    ${showDistributor&&(distributor||producer)?`<div style="${ca(`background:#f5f5f5;border-top:${s*.4}px solid #ddd;padding:${s*2}px ${s*8}px;text-align:center;font-size:${s*1.8}px;color:#444;line-height:1.4;`)}">
      ${distributor?`<div><strong>${t('lbl_distributor')}</strong> ${esc(distributor)}</div>`:''}
      ${producer?`<div>${t('lbl_producer')} ${esc(producer)}</div>`:''}
    </div>`:''}
    ${showNote?`<div style="${ca(`border-top:${s*.3}px dashed #bbb;padding:${s*1.5}px ${s*8}px;text-align:center;font-size:${s*1.6}px;font-weight:500;color:${series.bg};`)}">
      ${t('lbl_note')}
    </div>`:''}
  </div>`;
}

// ══════════════════════════════════════════════════════════
// COLLECT FORM DATA
// ══════════════════════════════════════════════════════════
function getFormData(){
  if(sizeMode==='custom'){
    labelSize.w=parseInt(document.getElementById('customW')?.value)||148;
    labelSize.h=parseInt(document.getElementById('customH')?.value)||105;
  }
  const dateLocale=lang==='uk'?'uk-UA':lang==='pl'?'pl-PL':'en-GB';
  return {
    series: SERIES[selectedSeries]||SERIES.EC,
    seriesId: selectedSeries,
    name: document.getElementById('productName')?.value||'',
    category: document.getElementById('productCategory')?.value||'',
    use: document.getElementById('productUse')?.value||'',
    aspect: document.getElementById('productAspect')?.value||'',
    drying: document.getElementById('productDrying')?.value||'',
    weight: parseFloat(document.getElementById('weightKg')?.value)||1.0,
    showSafety: document.getElementById('showSafety')?.checked,
    showDistributor: document.getElementById('showDistributor')?.checked,
    showNote: document.getElementById('showNote')?.checked,
    distributor: document.getElementById('distributorName')?.value||'',
    producer: document.getElementById('producerName')?.value||'',
    batchNo: document.getElementById('batchNo')?.value||'',
    expiryDate: document.getElementById('expiryDate')?.value||'',
    date: new Date().toLocaleDateString(dateLocale),
    w: 0, h: 0
  };
}

// ══════════════════════════════════════════════════════════
// RENDER PREVIEW
// ══════════════════════════════════════════════════════════
function renderPreview(){
  const data=getFormData();
  const PX_PER_MM=2.83;

  const lw=Math.round(labelSize.w*PX_PER_MM);
  const lh=Math.round(labelSize.h*PX_PER_MM);
  data.w=lw; data.h=lh;

  const positions=getPositions();
  const totalW=Math.round(positions.sheetW*PX_PER_MM);
  const totalH=Math.round(positions.sheetH*PX_PER_MM);

  let inner='';
  positions.cells.forEach(cell=>{
    const x=Math.round(cell.x*PX_PER_MM);
    const y=Math.round(cell.y*PX_PER_MM);
    inner+=`<div style="position:absolute;left:${x}px;top:${y}px;">${getLabelHtml(data,PX_PER_MM,false)}</div>`;
  });

  const preview=document.getElementById('labelPreview');
  preview.style.width=totalW+'px';
  preview.style.height=totalH+'px';
  preview.style.position='relative';
  preview.style.background='#d1d5db';
  preview.style.borderRadius='4px';
  preview.style.boxShadow='0 16px 50px rgba(0,0,0,.7)';
  preview.style.overflow='hidden';
  preview.innerHTML=inner;
}

// ══════════════════════════════════════════════════════════
// GET POSITIONS
// ══════════════════════════════════════════════════════════
function getPositions(){
  const lw=labelSize.w, lh=labelSize.h;
  const GAP=2;
  if(layoutMode==='1full') return {sheetW:lw,sheetH:lh,cells:[{x:0,y:0}]};
  if(layoutMode==='2horiz') return {sheetW:lw*2+GAP,sheetH:lh,cells:[{x:0,y:0},{x:lw+GAP,y:0}]};
  if(layoutMode==='2vert') return {sheetW:lw,sheetH:lh*2+GAP,cells:[{x:0,y:0},{x:0,y:lh+GAP}]};
  if(layoutMode==='4grid') return {sheetW:lw*2+GAP,sheetH:lh*2+GAP,cells:[{x:0,y:0},{x:lw+GAP,y:0},{x:0,y:lh+GAP},{x:lw+GAP,y:lh+GAP}]};
  if(layoutMode==='custom'){
    const posMap={tl:{x:0,y:0},tr:{x:lw+GAP,y:0},bl:{x:0,y:lh+GAP},br:{x:lw+GAP,y:lh+GAP}};
    const cells=Object.entries(customPositions).filter(([,v])=>v).map(([k])=>posMap[k]);
    const maxX=Math.max(...cells.map(c=>c.x));
    const maxY=Math.max(...cells.map(c=>c.y));
    const sheetW=maxX>0?lw*2+GAP:lw;
    const sheetH=maxY>0?lh*2+GAP:lh;
    return {sheetW,sheetH,cells};
  }
  return {sheetW:lw,sheetH:lh,cells:[{x:0,y:0}]};
}

// ══════════════════════════════════════════════════════════
// PRINT
// ══════════════════════════════════════════════════════════
function printLabel(){
  const data=getFormData();
  const PX_PER_MM=3.7795;
  const positions=getPositions();
  const sw=positions.sheetW, sh=positions.sheetH;

  const labelHtmlParts=positions.cells.map(cell=>{
    data.w=Math.round(labelSize.w*PX_PER_MM);
    data.h=Math.round(labelSize.h*PX_PER_MM);
    const x=Math.round(cell.x*PX_PER_MM);
    const y=Math.round(cell.y*PX_PER_MM);
    return `<div style="position:absolute;left:${x}px;top:${y}px;">${getLabelHtml(data,PX_PER_MM,true)}</div>`;
  }).join('');

  const pageW=sw+'mm', pageH=sh+'mm';
  const bodyW=Math.round(sw*PX_PER_MM)+'px', bodyH=Math.round(sh*PX_PER_MM)+'px';

  const html=`<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>Label — ${esc(data.name||selectedSeries)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:${bodyW};height:${bodyH};margin:0;padding:0;font-family:'Inter',sans-serif;background:white;}
@page{size:${pageW} ${pageH};margin:0;}
@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}.no-print{display:none!important;}}
.sheet{position:relative;width:${bodyW};height:${bodyH};background:white;}
.no-print{position:fixed;bottom:10px;right:10px;background:#e63946;color:white;border:none;border-radius:8px;padding:8px 16px;font-size:14px;font-weight:700;cursor:pointer;z-index:1000;font-family:'Inter',sans-serif;}
</style>
</head><body>
<button class="no-print" onclick="window.close()">${t('close_btn')}</button>
<div class="sheet">${labelHtmlParts}</div>
<script>
  document.fonts.ready.then(()=>{ setTimeout(()=>window.print(),350); });
<\/script>
</body></html>`;

  const win=window.open('','_blank');
  if(!win){alert('Дозвольте спливаючі вікна в браузері / Allow popups'); return;}
  win.document.write(html);
  win.document.close();
  win.focus();
  showToast(t('toast_print'));
}

// ══════════════════════════════════════════════════════════
// COPY / RESET
// ══════════════════════════════════════════════════════════
function copyHtml(){
  navigator.clipboard.writeText(document.getElementById('labelPreview').outerHTML)
    .then(()=>showToast(t('toast_copy')));
}

function resetForm(){
  ['productName','productCategory','productUse','productAspect','productDrying','batchNo','expiryDate']
    .forEach(id=>{ document.getElementById(id).value=''; });
  document.getElementById('weightKg').value='1.00';
  document.getElementById('showSafety').checked=true;
  document.getElementById('showDistributor').checked=true;
  document.getElementById('showNote').checked=true;
  selectedSeries='EC';
  layoutMode='1full';
  customPositions={tl:true,tr:false,bl:false,br:false};
  document.querySelectorAll('.series-card').forEach(c=>c.classList.remove('active'));
  document.getElementById('sc_EC')?.classList.add('active');
  ['1full','2horiz','2vert','4grid','custom'].forEach(m=>{
    document.getElementById('ly_'+m)?.classList.toggle('active',m==='1full');
  });
  document.getElementById('posPickerWrap').style.display='none';
  setSize('A6');
  showToast(t('toast_reset'));
}

function showToast(msg){
  const el=document.getElementById('toast');
  el.textContent=msg;
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),2500);
}

init();
