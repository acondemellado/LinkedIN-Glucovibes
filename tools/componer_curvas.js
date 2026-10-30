// Uso: node componer_curvas.js <foto_3x2.png> <curvas.png> <salida.png> <chip> <titulo> <tituloResaltado> <nota> [recorteY0] [recorteY1]
const { chromium } = require('playwright'); const fs = require('fs');
const [foto, curvas, salida, chip, titulo, rojo, nota, y0='70', y1='990'] = process.argv.slice(2);
const b64 = f => fs.readFileSync(f).toString('base64');
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
// La foto (1536x1024) se recorta verticalmente entre y0 e y1 y se escala a 1000 px de ancho
const srcH = (+y1) - (+y0), scale = 1000/1536, boxH = Math.round(srcH*scale);
const cardH = 1350-(150+boxH+12)-84; const cardW = Math.min(1000, Math.round((cardH-16)*1000/640)+40);
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;background:#FAF8F6;font-family:'Inter','Inter Display',sans-serif;color:#141414;position:relative;overflow:hidden}
.chip{position:absolute;top:30px;left:0;width:1080px;text-align:center}
.chip span{display:inline-block;background:#FFE7E3;color:#D9473A;font-weight:700;font-size:20px;letter-spacing:2px;padding:9px 18px;border-radius:30px}
h1{position:absolute;top:76px;left:40px;width:1000px;text-align:center;font-family:'Inter Display','Inter';font-weight:800;font-size:50px;letter-spacing:-1px;text-wrap:balance}
h1 .r{color:#F2594B}
.photo{position:absolute;top:150px;left:40px;width:1000px;height:${boxH}px;border-radius:26px;overflow:hidden}
.photo img{position:absolute;left:0;top:${-Math.round(+y0*scale)}px;width:1000px}
.card{position:absolute;top:${150+boxH+12}px;left:${(1080-cardW)/2}px;width:${cardW}px;background:#fff;border-radius:26px;padding:10px 20px 6px;box-shadow:0 2px 14px rgba(0,0,0,.05)}
.card img{width:100%;display:block}
.nota{position:absolute;bottom:22px;left:70px;width:940px;text-align:center;font-size:19px;line-height:1.35;color:#6B6B6B;text-wrap:balance}
</style></head><body>
<div class="chip"><span>${esc(chip)}</span></div>
<h1>${esc(titulo)} <span class="r">${esc(rojo)}</span></h1>
<div class="photo"><img src="data:image/png;base64,${b64(foto)}"></div>
<div class="card"><img src="data:image/png;base64,${b64(curvas)}"></div>
<div class="nota">${esc(nota)}</div>
</body></html>`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350}});
await p.setContent(html,{waitUntil:'load'});
const h=await p.evaluate(()=>{const c=document.querySelector('.card').getBoundingClientRect();const n=document.querySelector('.nota').getBoundingClientRect();return {cardBottom:c.bottom,notaTop:n.top}});
console.log(JSON.stringify(h));await p.screenshot({path:salida});await b.close();})();
