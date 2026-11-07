const { chromium } = require('playwright'); const fs = require('fs');
const D = JSON.parse(fs.readFileSync('curvas_delta.json'));
const b64 = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const W=720,H=400,ml=70,mr=20,mt=86,mb=44, X0=-15,X1=135,Y0=-10,Y1=70;
const px=t=>ml+(t-X0)/(X1-X0)*(W-ml-mr), py=v=>mt+(Y1-v)/(Y1-Y0)*(H-mt-mb);
function chart(pts,peak,walkT,walkLabel){
  let g='';
  for(let v=0;v<=60;v+=20) g+=`<line x1="${ml}" x2="${W-mr}" y1="${py(v)}" y2="${py(v)}" stroke="${v==0?'#cfcfcf':'#ececec'}" stroke-width="${v==0?1.5:1}"/><text x="${ml-10}" y="${py(v)+6}" text-anchor="end" font-size="17" fill="#777">${v>0?'+':''}${v}</text>`;
  for(let t=0;t<=120;t+=30) g+=`<text x="${px(t)}" y="${H-mb+28}" text-anchor="middle" font-size="17" fill="#777">${t} min</text>`;
  const p=pts.map(([t,v])=>`${px(t).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
  const a=pts[0], z=pts[pts.length-1];
  const area=`M${px(a[0])},${py(0)} L${p.replace(/ /g,' L')} L${px(z[0])},${py(0)} Z`;
  const pk=pts.reduce((m,q)=>q[1]>m[1]?q:m);
  // marcadores
  const desayuno=`<line x1="${px(0)}" x2="${px(0)}" y1="34" y2="${py(Y0)}" stroke="#141414" stroke-dasharray="4 4" stroke-width="1.5"/><rect x="${px(0)-52}" y="4" width="104" height="30" rx="15" fill="#141414"/><text x="${px(0)}" y="25" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">Desayuno</text>`;
  const paseo=`<line x1="${px(walkT)}" x2="${px(walkT)}" y1="72" y2="${py(Y0)}" stroke="#2E9E6B" stroke-dasharray="4 4" stroke-width="1.5"/><rect x="${px(walkT)-(walkLabel.length*5+18)}" y="42" width="${walkLabel.length*10+36}" height="30" rx="15" fill="#2E9E6B"/><text x="${px(walkT)}" y="63" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">${walkLabel}</text>`;
  const br=`<line x1="${px(pk[0])+14}" x2="${px(pk[0])+14}" y1="${py(0)}" y2="${py(pk[1])}" stroke="#141414" stroke-width="1.5"/><line x1="${px(pk[0])+8}" x2="${px(pk[0])+20}" y1="${py(0)}" y2="${py(0)}" stroke="#141414" stroke-width="1.5"/><line x1="${px(pk[0])+8}" x2="${px(pk[0])+20}" y1="${py(pk[1])}" y2="${py(pk[1])}" stroke="#141414" stroke-width="1.5"/><text x="${px(pk[0])+24}" y="${py(pk[1])-12}" font-size="26" font-weight="800" fill="#E8392C">${peak}</text>`;
  return `<svg width="${W}" height="${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2594B" stop-opacity=".38"/><stop offset="1" stop-color="#F2594B" stop-opacity=".05"/></linearGradient></defs>${g}<path d="${area}" fill="url(#g)"/><polyline points="${p}" fill="none" stroke="#E8392C" stroke-width="3.2" stroke-linejoin="round"/>${desayuno}${paseo}${br}</svg>`;
}
const card=(top,svg,face,name,orden)=>`<div class="card" style="top:${top}px"><div class="ord">${orden}</div>${svg}<div class="ph"><img src="${b64(face)}"><div class="nm">${name}</div></div></div>`;
const html=`<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;background:#FAF8F6;font-family:'Inter',sans-serif;color:#141414;position:relative;overflow:hidden}
h1{position:absolute;top:40px;left:50px;width:980px;text-align:center;font-weight:800;font-size:54px;line-height:1.1;letter-spacing:-1px}
h1 span{color:#F2594B}
.sub{position:absolute;top:180px;left:60px;width:960px;text-align:center;font-size:25px;color:#555;line-height:1.35}
.card{position:absolute;left:40px;width:1000px;height:470px;background:#fff;border-radius:28px;box-shadow:0 2px 16px rgba(0,0,0,.06);padding:44px 0 0 18px}
.ord{position:absolute;top:18px;left:40px;font-size:19px;font-weight:700;color:#666;letter-spacing:.5px}
.ph{position:absolute;right:34px;top:90px;width:210px;text-align:center}
.ph img{width:200px;height:222px;border-radius:22px;box-shadow:0 4px 18px rgba(0,0,0,.18)}
.nm{margin-top:12px;font-weight:800;font-size:24px}
.nota{position:absolute;bottom:30px;left:60px;width:960px;text-align:center;font-size:20px;color:#666;line-height:1.4}
</style></head><body>
<h1>¿Eres de los que copia lo que<br><span>le funciona a tu vecino?</span></h1>
<div class="sub">El mismo desayuno. La misma ración de hidratos por kilo de peso.<br>Dos personas, dos curvas de glucosa muy distintas.</div>
${card(268,chart(D.pico_alto,'+61 mg/dl',-10,'Paseo antes'),'foto_luis_enrique.png','Luis Enrique','PASEO → DESAYUNO')}
${card(758,chart(D.pico_bajo,'+12 mg/dl',33,'Paseo después'),'foto_alberto.png','Alberto Conde','DESAYUNO → PASEO')}
<div class="nota">Curvas reales. Desayuno: pudding de avena con chía y lino, aislado de proteína y arándanos + café sin leche.<br>Variación de glucosa (mg/dl) desde el inicio del desayuno.</div>
</body></html>`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350}});await p.setContent(html,{waitUntil:'load'});await p.screenshot({path:'infografia.png'});await b.close();console.log('ok')})();
