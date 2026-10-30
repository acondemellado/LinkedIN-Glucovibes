// Dibuja dos curvas reales (ya digitalizadas o exportadas) lado a lado, en el estilo de las curvas de Glucovibes.
// Uso: node dibujar_curvas.js <datos.json> <salida.png>
// datos.json: {"paneles":[{"titulo","sub","puntos":[[horaDecimal,mgdl],...],"stats":[["Máximo","120 mg/dl"],...]}...],"x":[2,12,2],"y":[60,160,20]}
const { chromium } = require('playwright'); const fs = require('fs');
const [datos, salida] = process.argv.slice(2); const D = JSON.parse(fs.readFileSync(datos));
const W=480,H=280,ml=50,mr=16,mt=14,mb=38, [x0,x1,xs]=D.x, [y0,y1,ys]=D.y;
const px=t=>ml+(t-x0)/(x1-x0)*(W-ml-mr), py=v=>mt+(y1-v)/(y1-y0)*(H-mt-mb);
function svg(p){
  let g='';
  for(let v=y0;v<=y1;v+=ys) g+=`<line x1="${ml}" x2="${W-mr}" y1="${py(v)}" y2="${py(v)}" stroke="#E6E6E6"/><text x="${ml-8}" y="${py(v)+6}" text-anchor="end" font-size="19" fill="#555">${v}</text>`;
  for(let t=Math.ceil(x0/xs)*xs;t<=x1;t+=xs) g+=`<line x1="${px(t)}" x2="${px(t)}" y1="${mt}" y2="${H-mb}" stroke="#F0F0F0"/><text x="${px(t)}" y="${H-mb+26}" text-anchor="middle" font-size="18" fill="#555">${String(t).padStart(2,'0')}:00</text>`;
  const pts=p.puntos.map(([t,v])=>`${px(t).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
  const a=p.puntos[0], b=p.puntos[p.puntos.length-1];
  const area=`M${px(a[0])},${py(y0)} L${pts.replace(/ /g,' L')} L${px(b[0])},${py(y0)} Z`;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="g${p.titulo.length}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2594B" stop-opacity=".35"/><stop offset="1" stop-color="#F2594B" stop-opacity=".04"/></linearGradient></defs>${g}<path d="${area}" fill="url(#g${p.titulo.length})"/><polyline points="${pts}" fill="none" stroke="#E8392C" stroke-width="2.4" stroke-linejoin="round"/></svg>`;
}
const panel=p=>`<div class="p"><div class="t">${p.titulo}</div><div class="s">${p.sub}</div>${svg(p)}<table>${p.stats.map(([k,v])=>`<tr><td>${k}</td><td class="v">${v}</td></tr>`).join('')}</table></div>`;
const html=`<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:#fff;font-family:'Inter',sans-serif;color:#141414}
.w{display:flex;gap:28px;padding:18px 22px;width:${2*W+28}px}
.p{width:${W}px}.t{font-weight:800;font-size:32px;text-align:center}.s{color:#666;font-size:20px;text-align:center;margin:4px 0 8px}
table{width:100%;border-collapse:collapse;margin-top:6px;font-size:23px}td{padding:6px 4px;border-top:1px solid #EEE;font-weight:600}.v{text-align:right;color:#E8392C;font-weight:800}
</style></head><body><div class="w">${D.paneles.map(panel).join('')}</div></body></html>`;
(async()=>{const b=await chromium.launch();const pg=await b.newPage({deviceScaleFactor:2});await pg.setContent(html);
const el=await pg.$('.w');await el.screenshot({path:salida});await b.close();console.log('ok')})();
