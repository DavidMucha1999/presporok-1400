/* ==== js/celamapa.js ==== */
/* Hlavná obrazovka „mapa cez celé okno“ (v164): na počítači je mapa mesta cez celé okno a ovládanie pláva nad ňou.
   Nič v hre nemení – tlačidlá len stláčajú pôvodné tlačidlá hlavičky a kariet. Dá sa vypnúť (Pôvodné rozloženie).
   Autor: Dávid Mucha. */
(function(){
"use strict";
const hasS=()=>{try{return !!S&&!!S.dyn}catch(e){return false}};
const desk=()=>true;
const pref=()=>{try{return localStorage.getItem("hbOn")!=="0"}catch(e){return true}};
const setPref=v=>{try{localStorage.setItem("hbOn",v?"1":"0")}catch(e){}};
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const q=s=>document.querySelector(s);
const txt=e=>e?e.textContent.replace(/\s+/g," ").trim():"";
const mode=()=>{if(!hasS()||!desk()||!pref()||(document.getElementById("m3d")&&!(document.body.classList.contains("p3d-book")&&S.view!=="mesto"))||document.body.classList.contains("jmapon"))return null;if(S.view==="mesto")return q(".mapsheet #kcity")?"map":null;return q("header.top .tabs .tab")&&q(".wrap.pad")?"sheet":null};
const active=()=>mode()!==null;
let open=false,lastH="";
const IC={book:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5c3-1 5-1 8 1v14c-3-2-5-2-8-1zM20 5c-3-1-5-1-8 1v14c3-2 5-2 8-1z"/></svg>',
 search:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/></svg>',
 menu:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
 list:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h11v13a3 3 0 0 1-3 3H6a2 2 0 0 1-2-2v-2h10v2M10 8h5M10 12h5"/></svg>',
 walk:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13" cy="4.5" r="1.8"/><path d="M13 8l-3 4 3 3v6M10 12l-3 1M13 10l4 3M10 15l-2 6"/></svg>',
 hour:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9"/></svg>'};
const svgOf=e=>{const s=e&&e.querySelector("svg");return s?s.outerHTML:""};

function build(){
 const h=[];const sheet=mode()==="sheet";
 /* vľavo hore: mesto, rok, rod */
 const brand=q("header.top .brand"),statp=q("header.top .statp"),sel=q("#city-sel");
 const yr=txt(q("header.top .yr")).replace(/\s*·\s*Anno Domini.*/i,"")+" "+(S.year||"");
 let opts="";if(sel)[...sel.options].forEach(o=>{opts+=`<option value="${esc(o.value)}"${o.selected?" selected":""}>${esc(o.textContent)}</option>`});
 h.push(`<div class="hbbox hbcity"><div class="hbcrest">${brand?svgOf(brand):""}</div><div class="hbct"><b>${esc(txt(q("header.top .brand h1")))}</b><span>${esc(yr.trim())}${statp?" · "+esc(txt(statp.querySelector(".lbl")).split("·")[0].trim()):""}</span>${sel?`<label class="hbsel"><span>mesto</span><select data-hb="city" aria-label="Zobraziť mesto">${opts}</select></label>`:""}</div>${statp?`<button type="button" class="hbprof" data-hb="click" data-q="header.top .statp" title="Profil hlavy rodu">${esc(txt(statp.querySelector("b")))}</button>`:""}</div>`);
 /* štítky mapy (úroveň, sviatok, počasie) */
 const pills=[...document.querySelectorAll(".mapsheet .maphead .pill")].map(p=>`<span title="${esc(p.title||"")}">${esc(txt(p))}</span>`).join("");
 if(pills&&!sheet)h.push(`<div class="hbpills">${pills}</div>`);
 /* vpravo hore: pokladnica, priazeň, body činnosti */
 let st="";[...document.querySelectorAll("header.top .stats .stat:not(.statp)")].forEach((s,i)=>{const lb=txt(s.querySelector(".lbl")),b=s.querySelector("b"),pips=s.querySelectorAll(".pip").length;
  let l=lb,v=b?[...b.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(" ").replace(/\s+/g," ").trim()||txt(b):"";if(!b&&pips){const m=lb.match(/^(.*?)(\d+\s*\/\s*\d+)\s*$/);if(m){l=m[1].trim();v=m[2].replace(/\s+/g,"").replace("/"," / ")}}
  st+=`<button type="button" class="hbstat" data-hb="statclick" data-i="${i}" title="${esc(s.title||"")}"><span>${esc(l)}</span><b>${esc(v)}</b></button>`});
 h.push(`<div class="hbbox hbstats">${st}</div>`);
 /* vľavo: záložky a nástroje */
 const tabs=[...document.querySelectorAll("header.top .tabs .tab")];let rl="";
 const KEYL={Mesto:"M",Rod:"R",Obchod:"T",Trh:"T",Dielne:"D","Štatistika":"S",Cirkev:"C",Majetok:"B"};
 tabs.forEach((t,i)=>{const on=t.classList.contains("on"),bd=t.querySelector(".badge");const nm=bd?txt(t).slice(0,txt(t).length-txt(bd).length).trim():txt(t);const kl=KEYL[nm];const kn=i<12?"1234567890-="[i]:"";rl+=`<button type="button" class="hbr${on?" on":""}" data-hb="tab" data-i="${i}" aria-pressed="${on}" title="${esc(nm)}${kn?` (kláves ${kn}${kl?" alebo "+kl:""})`:""}">${svgOf(t)}<span>${esc(nm)}</span>${bd?'<i class="hbdot"></i>':""}</button>`});
 const many=tabs.length>4;let tl="";
 if(!sheet)tl+=`<button type="button" class="hbr${open?" on":""}" data-hb="drawer" aria-pressed="${open}" title="Stavby, sídlo, okolie, ľudia a kronika mesta">${IC.list}<span>Prehľad</span></button>`;
 if(q('header.top [data-a="journal"]'))tl+=`<button type="button" class="hbr" data-hb="click" data-q='header.top [data-a="journal"]' title="Denník a kronika (kláves J)">${IC.book}<span>Denník</span></button>`;
 if(q('header.top [data-a="srchOpen"]'))tl+=`<button type="button" class="hbr" data-hb="click" data-q='header.top [data-a="srchOpen"]'>${IC.search}<span>Hľadať</span></button>`;
 if(q('header.top [data-a="gameMenu"]'))tl+=`<button type="button" class="hbr" data-hb="click" data-q='header.top [data-a="gameMenu"]' title="Ponuka: uložiť, nastavenia, klávesy (Esc)">${IC.menu}<span>Ponuka</span></button>`;
 {const fsOn=!!(document.fullscreenElement||document.webkitFullscreenElement);const fsOk=!!(document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen);
  if(fsOk&&q('header.top [data-a="fs"]'))tl+=`<button type="button" class="hbr${fsOn?" on":""}" data-hb="click" data-q='header.top [data-a="fs"]' aria-pressed="${fsOn}" title="${fsOn?"Ukončiť celú obrazovku (Esc alebo F)":"Zobraziť hru na celú obrazovku (kláves F)"}">${fsOn?'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>':'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>'}<span>${fsOn?"Zmenšiť":"Celá obr."}</span></button>`}
 h.push(many?`<nav class="hbrail many" aria-label="Záložky">${rl}</nav><nav class="hbtools" aria-label="Nástroje">${tl}</nav>`:`<nav class="hbrail" aria-label="Hlavná ponuka">${rl}<span class="hbgap"></span>${tl}</nav>`);
 /* dole: rada, Ďalej, kroky */
 let bl="";
 const jg=q("main .jtask .jguide"),adv=document.querySelectorAll("main .jtask ul.adv li").length;
 const advp=document.getElementById("advp");
 if(sheet){}
 else if(advp&&!advp.hidden&&advp.getBoundingClientRect().width>0)bl+='<div class="hbsp" aria-hidden="true"></div>';
 else if(jg){const b=jg.querySelector("button");bl+=`<section class="hbcard hbadv"><h2>Rada kancelára</h2><p><b>${esc(txt(jg.querySelector("b"))||"Čo teraz?")}</b> ${esc(txt(jg.querySelector("span")))}</p><div class="hbrow">${b?`<button type="button" class="btn pri sm" data-hb="click" data-q="main .jtask .jguide button">${esc(txt(b))}</button>`:""}${adv?`<button type="button" class="btn sm" data-hb="goto" data-q="main .jtask">Všetky rady (${adv})</button>`:""}</div></section>`}
 else if(q("main .jtask"))bl+=`<section class="hbcard hbadv"><h2>Rada kancelára</h2><div class="hbrow"><button type="button" class="btn sm" data-hb="goto" data-q="main .jtask">Otvoriť rady na tento štvrťrok</button></div></section>`;
 const tok=q("header.top button.end"),yrB=q('header.top [data-a="skipYear"]');
 bl+=`<div class="hbmid">${tok?`<button type="button" class="hbbig gold" data-hb="click" data-q="header.top button.end" title="${esc(txt(tok))}">${IC.hour}<span>${esc(txt(tok))}</span></button>`:""}${sheet?"":`<button type="button" class="hbbig blue" data-hb="m3d">${IC.walk}<span>Prejsť sa v 3D</span></button>`}${q('header.top [data-a="undo"]')?`<button type="button" class="hbbig dark" data-hb="click" data-q='header.top [data-a="undo"]'><span>${esc(txt(q('header.top [data-a="undo"]')))}</span></button>`:""}${yrB?`<button type="button" class="hbbig dark" data-hb="click" data-q='header.top [data-a="skipYear"]' title="${esc(yrB.title||"")}"><span>${esc(txt(yrB))}</span></button>`:""}</div>`;
 const tg=q("main .tguide"),jgo=q("main .jtask .jgoal");
 if(sheet){}
 else if(tg){const all=tg.querySelectorAll(".tsteps li").length,dn=tg.querySelectorAll(".tsteps li.done").length,nx=txt(tg.querySelector(".tsteps li.next"));
  bl+=`<button type="button" class="hbcard hbsteps" data-hb="goto" data-q="main .tguide"><h2>${esc(txt(tg.querySelector("h3")))} · ${dn} z ${all}</h2>${nx?`<p>Ďalší krok: <b>${esc(nx)}</b></p>`:""}<i class="hbbar"><i style="width:${all?Math.round(dn/all*100):0}%"></i></i></button>`}
 else if(jgo){const bar=jgo.querySelector(".jbar i");bl+=`<button type="button" class="hbcard hbsteps" data-hb="goto" data-q="main .jtask"><h2>${esc(txt(jgo.querySelector("b")))}</h2><p>${esc(txt(jgo.querySelector(".muted")))}</p><i class="hbbar"><i style="width:${bar?esc(bar.style.width):"0%"}"></i></i></button>`}
 h.push(`<div class="hbbot">${bl}</div>`);
 /* hlavička zásuvky */
 const det=q('header.top [data-a="detail"]'),news=q('header.top [data-a="news"]');
 h.push(`<div class="hbdh"><b>Prehľad mesta</b><span class="hbgapx"></span>${det?`<button type="button" class="btn sm" data-hb="click" data-q='header.top [data-a="detail"]' title="${esc(det.title||"")}">${esc(txt(det))}</button>`:""}${news?`<button type="button" class="btn sm" data-hb="click" data-q='header.top [data-a="news"]'>Noviny</button>`:""}<button type="button" class="btn sm" data-hb="classic" title="Vráti stránku s mapou medzi kartami">Pôvodné rozloženie</button><button type="button" class="btn sm pri" data-hb="drawer" aria-label="Zavrieť prehľad">✕ Zavrieť</button></div>`);
 return h.join("")}

const mark=()=>{try{document.querySelectorAll("main table").forEach(t=>{const th=t.querySelector("thead th");t.classList.toggle("hbtov",!!th&&txt(th)==="Tovar")})}catch(e){}};
function apply(){
 mark();
 try{const on=active(),b=document.body;let hud=document.getElementById("hb");
  if(!on){if(b.classList.contains("hb")){b.classList.remove("hb","hbopen","hbs");open=false}if(hud){hud.remove();lastH=""}addBtn();return}
  if(!b.classList.contains("hb")){b.classList.add("hb");try{scrollTo(0,0)}catch(e){}}
  const sh=mode()==="sheet";b.classList.toggle("hbs",sh);if(sh)b.dataset.hbv=S.view;else delete b.dataset.hbv;if(sh)open=false;b.classList.toggle("hbopen",open);
  if(hud&&hud.dataset.m!==(sh?"s":"m")){hud.dataset.m=sh?"s":"m";lastH=""}
  if(!hud){hud=document.createElement("div");hud.id="hb";b.appendChild(hud);lastH=""}
  const html=build();if(html!==lastH){hud.innerHTML=html;lastH=html}
 }catch(e){console.warn("celamapa",e)}}
/* v pôvodnom rozložení: tlačidlo späť na mapu cez celé okno */
function addBtn(){try{if(!hasS()||!desk()||S.view!=="mesto"||pref())return;const ms=q(".mapsheet");if(!ms||ms.querySelector(".hbbtn")||!ms.querySelector("#kcity"))return;
 const b=document.createElement("button");b.type="button";b.className="btn sm hbbtn";b.textContent="Mapa cez celé okno";b.title="Nové rozloženie: mapa cez celé okno a ovládanie nad ňou";b.style.marginLeft="8px";
 const m3=ms.querySelector(".m3btn");if(m3)m3.insertAdjacentElement("afterend",b);else ms.insertBefore(b,ms.querySelector(".map"))}catch(e){}}

document.addEventListener("click",e=>{
 const cb=e.target.closest&&e.target.closest(".hbbtn");if(cb){e.preventDefault();setPref(true);apply();return}
 const b=e.target.closest&&e.target.closest("#hb [data-hb]");if(!b||b.tagName==="SELECT")return;
 e.preventDefault();e.stopPropagation();const k=b.dataset.hb;
 try{
  if(k==="click"){const t=q(b.dataset.q);if(t)t.click()}
  else if(k==="statclick"){const t=document.querySelectorAll("header.top .stats .stat:not(.statp)")[+b.dataset.i];if(t)t.click()}
  else if(k==="tab"){const t=document.querySelectorAll("header.top .tabs .tab")[+b.dataset.i];if(t)t.click()}
  else if(k==="drawer"){open=!open;apply()}
  else if(k==="goto"){open=true;apply();const t=q(b.dataset.q),d=q(".wrap.pad");if(t&&d){d.scrollTop=Math.max(0,t.getBoundingClientRect().top-d.getBoundingClientRect().top+d.scrollTop-64)}}
  else if(k==="m3d"){A.m3d()}
  else if(k==="classic"){setPref(false);open=false;apply();try{render()}catch(x){}}
 }catch(x){console.warn("celamapa",x)}},true);
document.addEventListener("change",e=>{const s=e.target;if(s&&s.matches&&s.matches('#hb select[data-hb="city"]')){try{A.city({c:s.value})}catch(x){}}});
window.addEventListener("keydown",e=>{if(e.key==="Escape"&&open&&document.body.classList.contains("hb")){const m=document.getElementById("modal");if(m&&!m.hidden)return;e.preventDefault();e.stopImmediatePropagation();open=false;apply()}},true);
{const o=window.render;window.render=function(){const r=o.apply(this,arguments);apply();setTimeout(apply,0);setTimeout(apply,150);return r}}
addEventListener("resize",apply);
new MutationObserver(()=>apply()).observe(document.body,{childList:true});

const css=document.createElement("style");css.id="hb-css";css.textContent=`
html:has(body.hb),body.hb{overflow:hidden!important;height:100%}
body.hb header.top,body.hb #jtop{display:none!important}
body.hb #app{background:none!important;pointer-events:none;min-height:0}
body.hb main{animation:none!important}
body.hb #kcity{position:fixed!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:max(100vw,171.43vh)!important;height:max(58.34vw,100vh)!important;max-width:none!important;min-width:0!important;margin:0!important;z-index:-1;visibility:visible;pointer-events:auto}
body.hb #kcity canvas{width:100%!important;height:100%!important}
body.hb #kcity > .jmapb{display:none!important}
body.hb .wrap.pad{position:absolute;right:0;top:0;width:min(500px,94vw);height:100vh;max-width:none;margin:0;box-sizing:border-box;padding:104px 12px 24px;overflow:auto;background:#241910;border-left:3px solid #8a6a1e;box-shadow:-8px 0 24px #000a;visibility:hidden}
body.hb.hbopen .wrap.pad{visibility:visible;pointer-events:auto}
body.hb .mapsheet{padding:0!important;margin:0!important;border:0!important;height:0!important;min-height:0!important;background:none!important;box-shadow:none!important;overflow:visible!important}
body.hb .mapsheet > *:not(.map){display:none!important}
body.hb .mapsheet::before,body.hb .mapsheet::after{display:none!important}
body.hb .mapsheet .map{height:0!important;padding:0!important;border:0!important;overflow:visible!important}
body.hb .wrap.pad .cols3,body.hb .wrap.pad .cols,body.hb .wrap.pad .cols2{display:flex!important;flex-direction:column}
#hb{position:fixed;inset:0;z-index:20;pointer-events:none;font-family:"EB Garamond",Georgia,serif;color:#f4ead0}
#hb > *{pointer-events:auto}
#hb .hbbox{position:absolute;background:rgba(31,21,12,.92);border:1px solid #8a6a1e;border-radius:10px;box-shadow:0 4px 14px #0008}
#hb .hbcity{left:16px;top:14px;padding:8px 14px;display:flex;align-items:center;gap:12px;max-width:min(560px,46vw)}
#hb .hbcrest svg{width:38px;height:38px;display:block}
#hb .hbct{display:flex;flex-direction:column;line-height:1.1;min-width:0}
#hb .hbct b{font-family:"Almendra SC","EB Garamond",Georgia,serif;font-size:1.6rem;font-weight:400;color:#e2b85a}
#hb .hbct span{font-size:.92rem;color:#e6d8b4}
#hb .hbsel{display:flex;align-items:center;gap:6px;margin-top:3px}#hb .hbsel span{font-size:.8rem;color:#d9c9a3}
#hb .hbsel select{font:inherit;font-size:.85rem;padding:1px 4px;border-radius:4px;background:#f4ead0;color:#2b2117;border:1px solid #8a6a1e;max-width:150px}
#hb .hbprof{font:inherit;font-size:.95rem;font-weight:600;color:#f4ead0;background:#3a2817;border:1px solid #6b4f2a;border-radius:6px;min-height:44px;padding:0 12px;cursor:pointer;white-space:nowrap}
#hb .hbprof:hover,#hb .hbstat:hover{background:#4a3520}
#hb .hbpills{position:absolute;left:16px;top:106px;display:flex;gap:6px;flex-wrap:wrap;max-width:46vw}
#hb .hbpills span{background:rgba(244,234,208,.94);color:#2b2117;border:1px solid #8a6a1e;border-radius:999px;padding:2px 10px;font-size:.85rem}
#hb .hbstats{right:16px;top:14px;padding:6px 8px;display:flex;gap:4px}
#hb .hbstat{font:inherit;background:none;border:0;border-radius:6px;color:#f4ead0;min-height:48px;padding:2px 12px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;line-height:1.1;cursor:pointer}
#hb .hbstat span{font-size:.8rem;color:#d9c9a3;letter-spacing:.03em}#hb .hbstat b{font-size:1.12rem}
#hb .hbrail{position:absolute;left:16px;top:142px;bottom:16px;display:flex;flex-direction:column;gap:8px;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;padding-right:2px}
#hb .hbr{position:relative;flex:none;width:78px;height:62px;border-radius:10px;background:rgba(31,21,12,.9);color:#f4ead0;border:1px solid #8a6a1e;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-family:"Almendra SC","EB Garamond",Georgia,serif;font-size:.86rem;cursor:pointer;box-shadow:0 2px 8px #0007}
#hb .hbr svg{width:22px;height:22px;flex:none}
#hb .hbr:hover{background:#4a3520}
#hb .hbr.on{background:#f1e6c8;color:#2b2117;border:2px solid #e2b85a}
#hb .hbrail.many{gap:5px}#hb .hbrail.many .hbr{height:40px;flex-direction:row;width:150px;justify-content:flex-start;padding:0 10px;gap:8px}
#hb .hbtools{position:absolute;right:16px;top:86px;display:flex;gap:6px}#hb .hbtools .hbr{height:44px;width:auto;flex-direction:row;padding:0 12px;gap:6px}body.hbopen #hb .hbtools{right:calc(min(500px,94vw) + 14px)}
#hb .hbdot{position:absolute;right:6px;top:6px;width:9px;height:9px;border-radius:50%;background:#d8504a;border:1px solid #fff}
#hb .hbgap{flex:1 1 8px;min-height:4px}
#hb .hbbot{position:absolute;left:110px;right:16px;bottom:16px;display:flex;align-items:flex-end;gap:14px;pointer-events:none}
#hb .hbrail.many ~ .hbbot{left:182px}body.hb:has(#hb .hbrail.many) #advp{left:182px!important}body.hb:has(#hb .hbrail.many) #tokstrip{left:556px!important}
#hb .hbbot > *{pointer-events:auto}
#hb .hbcard{background:#f1e6c8;color:#2b2117;border:1px solid #8a6a1e;border-radius:10px;padding:12px 14px;box-shadow:0 6px 18px #0009;display:flex;flex-direction:column;gap:7px;text-align:left;font:inherit}
#hb .hbcard h2{margin:0;font-family:"Almendra SC","EB Garamond",Georgia,serif;font-size:1.05rem;font-weight:400}
#hb .hbcard p{margin:0;font-size:1rem;line-height:1.3}
#hb .hbadv{flex:0 1 400px;min-width:260px}
#hb .hbrow{display:flex;gap:8px;flex-wrap:wrap}
#hb .hbmid{flex:1 1 auto;display:flex;gap:10px;justify-content:center;align-items:center;flex-wrap:wrap;min-width:0}#hb .hbbig.gold{max-width:270px}#hb .hbdh .btn{background:#f4ead0;color:#2b2117;opacity:1}#hb .hbdh .btn.pri{background:#2c4a94;color:#fff}
#hb .hbbig{font-family:"Almendra SC","EB Garamond",Georgia,serif;font-size:1.12rem;min-height:54px;padding:0 20px;border-radius:8px;display:inline-flex;align-items:center;gap:8px;cursor:pointer;box-shadow:0 4px 12px #0009;max-width:340px}
#hb .hbbig span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#hb .hbbig.gold{background:#e2b85a;color:#2b2117;border:1px solid #8a6a1e}#hb .hbbig.gold:hover{background:#edc874}
#hb .hbbig.blue{background:#2c4a94;color:#fff;border:1px solid #1b2f66}#hb .hbbig.blue:hover{background:#3a5cb0}
#hb .hbbig.dark{background:rgba(31,21,12,.92);color:#f4ead0;border:1px solid #8a6a1e;font-size:.95rem;padding:0 14px}
#hb .hbsteps{flex:0 1 260px;min-width:200px;background:rgba(31,21,12,.92);color:#f4ead0;cursor:pointer}
#hb .hbsteps h2{color:#e2b85a}#hb .hbsteps p{font-size:.95rem}
#hb .hbbar{display:block;height:6px;border-radius:3px;background:#4a3520}#hb .hbbar i{display:block;height:6px;border-radius:3px;background:#e2b85a}
#hb .hbdh{position:absolute;right:0;top:0;width:min(500px,94vw);box-sizing:border-box;min-height:56px;padding:6px 12px;display:none;align-items:center;flex-wrap:wrap;gap:6px 8px;background:#1f150c;border-left:3px solid #8a6a1e;border-bottom:2px solid #8a6a1e;z-index:2}
#hb .hbdh b{font-family:"Almendra SC","EB Garamond",Georgia,serif;font-size:1.2rem;font-weight:400;color:#e2b85a}#hb .hbgapx{flex:1}
body.hbopen #hb .hbdh{display:flex}
body.hbopen #hb .hbstats,body.hbopen #hb .hbsteps{display:none}
body.hbopen #hb .hbbot{right:calc(min(500px,94vw) + 14px)}
body.hbopen #ktip{display:none!important}
body.hb #ktip{bottom:120px}
body.hb #tokstrip{left:484px!important;right:16px!important;bottom:156px!important;top:auto!important;width:auto!important}
body.hb #toast{top:auto!important;bottom:160px!important}
body.hb #advp{left:110px!important;bottom:16px!important;top:auto!important;z-index:21!important;max-height:calc(100vh - 170px);overflow:auto}
#hb .hbsp{flex:0 0 360px}
body:has(#m3d) #hb{display:none}
@media (max-width:1180px){#hb .hbsteps{display:none}#hb .hbadv{flex-basis:320px}}
`;document.head.appendChild(css);
/* ===== Vzhľad „Iluminovaný rukopis“: pergamen, zlaté rámy, voskové pečate ===== */
{const U=svg=>'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
 const parch=(seed,base)=>U(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><filter id="f" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".011 .016" numOctaves="4" seed="${seed}" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .52 0 0 0 0 .36 0 0 0 0 .14 0 0 0 .62 -.2"/></filter><filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${seed+4}" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .35 0 0 0 0 .24 0 0 0 0 .1 0 0 0 .5 -.2"/></filter><rect width="320" height="320" fill="${base}"/><rect width="320" height="320" filter="url(#f)"/><rect width="320" height="320" filter="url(#g)" opacity=".5"/></svg>`);
 const corner=(r)=>`<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26"><g transform="${r}"><path d="M2 24V8C2 4 4 2 8 2H24M2 14C6 14 8 12 8 8M14 2C14 6 12 8 8 8" fill="none" stroke="#b5892a" stroke-width="1.6" stroke-linecap="round"/><circle cx="8" cy="8" r="2.2" fill="#d9ab3e" stroke="#7a5a14" stroke-width=".7"/></g></svg>`;
 const cs=[corner(""),corner("translate(26 0) scale(-1 1)"),corner("translate(0 26) scale(1 -1)"),corner("translate(26 26) scale(-1 -1)")].map(U);
 const P1=parch(2,"#f4e7bf"),P2=parch(5,"#efdcab"),P3=parch(9,"#f7ecc9");
 const wax=U(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><defs><radialGradient id="w" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#e2574a"/><stop offset=".55" stop-color="#a3231d"/><stop offset="1" stop-color="#650f0c"/></radialGradient></defs><path d="M20 2c5 0 7 3 11 4s6 5 6 10-3 6-3 10 1 8-4 11-7 1-10 1-6 2-10-1-5-6-4-11-3-5-3-10 2-8 6-10 5-4 9-4z" fill="url(#w)" stroke="#4a0c0b" stroke-width="1"/><circle cx="20" cy="20" r="11" fill="none" stroke="#7a1512" stroke-width="1.4"/><circle cx="15" cy="13" r="3" fill="#fff" opacity=".25"/></svg>`);
 const k=document.createElement("style");k.id="hb-skin";k.textContent=`
#hb{--ink:#2a2016;--red:#8e1f1c;--gold:#b5892a;--blue:#27408b}
#hb .hbbox,#hb .hbcard:not(.hbsteps),#hb .hbsteps,#hb .hbr:not(.on),#hb .hbpills span,#hb .hbbig.dark,#hb .hbdh{background:${P1} 0 0/320px,linear-gradient(135deg,#fbf3d9,#e4cf9a);color:var(--ink);border:2px solid var(--gold);box-shadow:inset 0 0 0 3px rgba(244,231,191,.0),inset 0 0 0 4px rgba(142,31,28,.55),inset 0 0 26px rgba(120,80,20,.38),0 6px 16px rgba(0,0,0,.55)}
#hb .hbbox,#hb .hbcard,#hb .hbdh{position:absolute}
#hb .hbcard{position:relative}
#hb .hbbox::before,#hb .hbcard::before,#hb .hbdh::before{content:"";position:absolute;inset:-4px;pointer-events:none;background:${cs[0]} 0 0 no-repeat,${cs[1]} 100% 0 no-repeat,${cs[2]} 0 100% no-repeat,${cs[3]} 100% 100% no-repeat}
#hb .hbdh{border-radius:0}
#hb .hbbox,#hb .hbcard{border-radius:4px}
#hb .hbcity .hbct b,#hb .hbct b{color:var(--ink);font-size:1.65rem}
#hb .hbct b::first-letter{background:var(--blue);color:#fff3c4;border:2px solid #d9ab3e;padding:0 6px;margin-right:3px;font-weight:700;text-shadow:0 1px 0 #0006}
#hb .hbct span{color:#5a4526;font-size:.95rem}
#hb .hbsel span{color:#5a4526}
#hb .hbsel select{background:rgba(255,255,255,.4);border:1px solid #9a7b3c;color:var(--ink)}
#hb .hbprof{background:rgba(255,255,255,.4);color:var(--ink);border:1px solid #9a7b3c;box-shadow:inset 0 0 0 2px rgba(201,162,74,.5);border-radius:2px}
#hb .hbprof:hover,#hb .hbstat:hover{background:rgba(255,246,200,.75)}
#hb .hbpills span{border-radius:3px;padding:3px 12px;position:relative;padding-left:20px;box-shadow:0 3px 8px #0006;border-width:1px;border-color:#9a7b3c}
#hb .hbpills span::before{content:"";position:absolute;left:7px;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3c4,#b5892a 60%,#5e4410)}
#hb .hbstats{padding:6px 14px;gap:0}
#hb .hbstat{color:var(--ink);padding:2px 18px;position:relative}
#hb .hbstat + .hbstat::before{content:"";position:absolute;left:0;top:10%;bottom:10%;border-left:1px solid rgba(142,31,28,.55)}
#hb .hbstat span{color:#5a4526}#hb .hbstat b{font-size:1.25rem;color:var(--ink)}
#hb .hbr:not(.on){color:var(--ink);border-radius:4px;border:2px solid #b5892a;box-shadow:inset 0 0 0 3px rgba(244,231,191,.9),inset 0 0 0 4px rgba(154,123,60,.7),0 3px 8px rgba(0,0,0,.5)}
#hb .hbr:not(.on):hover{filter:brightness(1.08)}
#hb .hbr.on{background:linear-gradient(160deg,#f1d27a,#c99a34 55%,#9e741c);color:var(--red);border:2px solid #5e4410;border-radius:4px;box-shadow:inset 0 0 0 3px rgba(255,246,200,.5),inset 0 0 0 4px rgba(142,31,28,.7),0 4px 10px rgba(0,0,0,.6);font-weight:700}
#hb .hbr.on::after{content:"";position:absolute;right:-7px;top:-7px;width:22px;height:22px;background:${wax} center/contain no-repeat;filter:drop-shadow(0 1px 2px #0008)}
#hb .hbdot{border-color:#fff3c4}
#hb .hbcard h2{color:var(--red);font-size:1.12rem}
#hb .hbcard h2::first-letter{background:var(--blue);color:#fff3c4;border:1px solid #d9ab3e;padding:0 4px;margin-right:1px}
#hb .hbcard p{color:var(--ink)}
#hb .hbadv .btn,#hb .hbsteps .btn{font-family:"Almendra SC","EB Garamond",serif;border-radius:4px;border:1px solid #7a5a14;background:rgba(255,255,255,.35);color:var(--ink);box-shadow:inset 0 0 0 2px rgba(201,162,74,.55)}
#hb .hbadv .btn.pri{background:linear-gradient(#b13029,#7f1815);color:#fff3d6;border-color:#4a0c0b;box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 2px 4px #0006;text-shadow:0 1px 1px #4a0c0b}
#hb .hbsteps{color:var(--ink)}#hb .hbsteps h2{color:var(--red)}#hb .hbsteps p{color:var(--ink)}
#hb .hbbar{background:rgba(120,80,20,.28);box-shadow:inset 0 1px 2px rgba(0,0,0,.3)}#hb .hbbar i{background:linear-gradient(#d4453a,#8e1f1c)}
#hb .hbbig{border-radius:6px;font-weight:700}
#hb .hbbig.gold{position:relative;min-height:62px;padding:0 34px 0 70px;background:linear-gradient(#f3d98a,#d6aa44 50%,#b98a28);color:#3a2606;border:2px solid #5e4410;border-radius:30px 10px 10px 30px;box-shadow:inset 0 0 0 3px rgba(255,246,200,.45),inset 0 0 0 4px rgba(94,68,16,.65),0 6px 14px rgba(0,0,0,.65);text-shadow:0 1px 0 rgba(255,246,200,.8);font-size:1.25rem}
#hb .hbbig.gold:hover{filter:brightness(1.08)}
#hb .hbmid .hbbig.gold{max-width:360px;font-size:1.15rem;padding:0 24px 0 66px}
#hb .hbbig.gold svg{position:absolute;left:8px;top:50%;width:46px;height:46px;margin-top:-23px;padding:11px;box-sizing:border-box;color:#fff3d6;background:${wax} center/contain no-repeat;stroke:#fff3d6;filter:drop-shadow(0 2px 2px #0007)}
#hb .hbbig.blue{position:relative;padding:0 30px;min-height:56px;color:var(--blue);background:linear-gradient(90deg,#8a6a36 0,#f6e9c2 7px,#d9c08a 12px,transparent 14px,transparent calc(100% - 14px),#d9c08a calc(100% - 12px),#f6e9c2 calc(100% - 7px),#7a5a2a 100%),${P3} 0 0/320px,#f4e7bf;border:1px solid #6b5020;border-radius:8px;box-shadow:inset 0 0 0 5px rgba(0,0,0,0),0 5px 12px rgba(0,0,0,.6)}
#hb .hbbig.blue::before{content:"";position:absolute;left:18px;right:18px;top:5px;bottom:5px;border:1px solid var(--blue);pointer-events:none}
#hb .hbbig.blue:hover{filter:brightness(1.07)}
#hb .hbbig.dark{border-radius:3px;font-size:1rem;color:var(--ink)}
#hb .hbbig.dark:hover{filter:brightness(1.07)}
#hb .hbdh b{color:var(--red);font-size:1.3rem}
#hb .hbdh .btn{background:rgba(255,255,255,.4);border:1px solid #7a5a14;color:var(--ink);box-shadow:inset 0 0 0 2px rgba(201,162,74,.5)}
#hb .hbdh .btn.pri{background:linear-gradient(#b13029,#7f1815);color:#fff3d6;border-color:#4a0c0b}
body.hb:not(.hbs) .wrap.pad{border-left:3px solid #b5892a;box-shadow:-8px 0 24px #000a, inset 3px 0 0 #5e4410}
/* ===== ostatné záložky: rovnaké ovládanie, obsah v pergamenovom liste ===== */
body.hbs{background:radial-gradient(ellipse at 50% 30%,#4a3420 0,#241910 55%,#120b05 100%),#1a120a!important}
body.hbs #app{pointer-events:none}
body.hbs .wrap.pad{position:fixed!important;left:112px;right:16px;top:112px;bottom:92px;width:auto;height:auto;max-width:none;margin:0;box-sizing:border-box;padding:18px 20px 24px;overflow:auto;visibility:visible;pointer-events:auto;background:rgba(18,11,5,.55);border:3px solid #b5892a;border-radius:6px;box-shadow:inset 0 0 0 4px rgba(94,68,16,.7),0 10px 28px rgba(0,0,0,.7)}
body.hbs #kcity{display:none!important}

body.hbs table.hbtov,body.hbs table.hbtov tbody{display:block;width:100%}
body.hbs table.hbtov thead{display:none}
body.hbs table.hbtov tbody{display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));gap:10px}
body.hbs table.hbtov tr.sec{grid-column:1/-1;display:block}
body.hbs table.hbtov tr.sec td{display:block;padding:8px 0 2px!important;border:0!important}
body.hbs table.hbtov tr:not(.sec){display:grid;grid-template-columns:1fr 1fr;grid-template-areas:"n n" "k p" "z m" "t t" "s s" "a a";gap:3px 10px;padding:10px 12px;background:${P2} 0 0/320px,#f1e2b4;border:1px solid #9a7b3c;border-radius:3px;box-shadow:inset 0 0 0 2px rgba(201,162,74,.45),0 2px 5px rgba(0,0,0,.3);color:#2a2016}
body.hbs table.hbtov tr:not(.sec)>td{display:block;border:0!important;padding:0!important;text-align:left!important;min-width:0}
body.hbs table.hbtov tr:not(.sec)>td:nth-child(1){grid-area:n;display:flex;align-items:center;gap:8px;font-family:"Almendra SC","EB Garamond",Georgia,serif;font-size:1.12rem;margin-bottom:4px}
body.hbs table.hbtov tr:not(.sec)>td:nth-child(2){grid-area:k}
body.hbs table.hbtov tr:not(.sec)>td:nth-child(3){grid-area:p}
body.hbs table.hbtov tr:not(.sec)>td:nth-child(4){grid-area:z}
body.hbs table.hbtov tr:not(.sec)>td:nth-child(5){grid-area:t}
body.hbs table.hbtov tr:not(.sec)>td:nth-child(6){grid-area:m}
body.hbs table.hbtov tr:not(.sec)>td:nth-child(7){grid-area:s}
body.hbs table.hbtov tr:not(.sec)>td:nth-child(8){grid-area:a;margin-top:6px}
body.hbs table.hbtov tr:not(.sec)>td:nth-child(5):empty{display:none}
body.hbs table.hbtov tr:not(.sec)>td:nth-child(2),body.hbs table.hbtov tr:not(.sec)>td:nth-child(3){font-size:1.4rem;font-weight:700;line-height:1.05}
body.hbs table.hbtov tr:not(.sec)>td:nth-child(2)::before{content:"kúpa";display:block;font-size:.72rem;font-weight:400;color:#5a4526;letter-spacing:.05em}
body.hbs table.hbtov tr:not(.sec)>td:nth-child(3)::before{content:"predaj";display:block;font-size:.72rem;font-weight:400;color:#5a4526;letter-spacing:.05em}
body.hbs table.hbtov tr:not(.sec)>td:nth-child(4)::before{content:"zmena ";font-size:.8rem;color:#5a4526}
body.hbs table.hbtov tr:not(.sec)>td:nth-child(6)::before{content:"na trhu ";font-size:.8rem;color:#5a4526}
body.hbs table.hbtov tr:not(.sec)>td:nth-child(7)::before{content:"môj sklad ";font-size:.8rem;color:#5a4526}
body.hbs table.hbtov tr:not(.sec)>td:nth-child(4),body.hbs table.hbtov tr:not(.sec)>td:nth-child(6){font-size:.9rem}
body.hbs table.hbtov tr:not(.sec)>td:nth-child(7){font-size:.9rem;grid-column:1/-1}
body.hbs table.hbtov .tsec{font-family:"Almendra SC","EB Garamond",Georgia,serif;font-size:1.15rem;background:none;border:0;color:#8e1f1c;cursor:pointer}
body.hbs .tw{overflow:visible!important}

body.hbs .wrap.pad{overflow-x:hidden!important}
body.hbs[data-hbv="rod"] .wrap.pad{background:radial-gradient(ellipse at 50% 12%,#3a2a5a 0,#1c1430 58%,#0c0818 100%),repeating-linear-gradient(90deg,rgba(201,162,74,.06) 0 2px,transparent 2px 90px)}
body.hbs[data-hbv="rod"] .rodhub{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;align-items:start}
body.hbs[data-hbv="rod"] .rodhub>*{margin:0!important}
body.hbs[data-hbv="rod"] .rodhead,body.hbs[data-hbv="rod"] .rtiles{grid-column:1/-1}
body.hbs[data-hbv="rod"] .rodhead{text-align:center;padding-top:18px}
body.hbs[data-hbv="rod"] .rodhead .row{justify-content:center;align-items:center;gap:22px}
body.hbs[data-hbv="rod"] .rodhead .row>svg{width:104px!important;height:auto!important;filter:drop-shadow(0 8px 12px rgba(0,0,0,.55))}
body.hbs[data-hbv="rod"] .rodhead .row>div{font-size:1.3em;text-align:left}
body.hbs[data-hbv="rod"] .rodhead .row>div>*:first-child{font-size:2.3rem;line-height:1.1}
body.hbs[data-hbv="rod"] .rtiles{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
body.hbs[data-hbv="dielne"] main{display:grid!important;grid-template-columns:minmax(0,1.45fr) minmax(330px,1fr);gap:12px 16px;align-items:start}
body.hbs[data-hbv="dielne"] main>.tokbulk,body.hbs[data-hbv="dielne"] main>.jsub{grid-column:1/-1}
body.hbs[data-hbv="dielne"] main>.kssheet{grid-column:1;grid-row:3;position:sticky;top:0;margin:0!important}
body.hbs[data-hbv="dielne"] main>.jumpbar{display:none}
body.hbs[data-hbv="dielne"] main>.stack{grid-column:2;grid-row:3/span 3}
body.hbs[data-hbv="dielne"] main .stack{display:grid!important;grid-template-columns:minmax(0,1fr);gap:14px;align-items:start}
body.hbs[data-hbv="dielne"] main .stack>*{margin:0!important}
body.hbs[data-hbv="dielne"] main .stack>.bulkbar,body.hbs[data-hbv="dielne"] main .stack>#sx-dielne-1,body.hbs[data-hbv="dielne"] main .stack>.cityh,body.hbs[data-hbv="dielne"] main .stack>.grid-cards{grid-column:1/-1}

body.hbs #hb .hbdh{display:none!important}
body.hbs #hb .hbstats{right:16px}
body.hbs #hb .hbbot{left:auto;right:16px}
body.hbs #hb .hbrail.many ~ .hbbot{left:auto}
body.hbs #hb .hbtools{top:96px}
body.hbs #ktip,body.hbs #advp{display:none!important}
body.hbs #tokstrip{left:112px!important;right:16px!important;bottom:92px!important;top:auto!important}
body.hbs #toast{bottom:100px!important}

@media (max-width:1100px),(max-height:640px){
#hb .hbcity{padding:5px 10px;gap:8px;max-width:min(380px,50vw)}#hb .hbcrest svg{width:30px;height:30px}#hb .hbct b{font-size:1.25rem!important}#hb .hbct span{font-size:.8rem}#hb .hbsel{display:none}
#hb .hbprof{min-height:34px;font-size:.8rem;padding:0 8px}
#hb .hbpills{top:78px;gap:4px}#hb .hbpills span{font-size:.75rem;padding:1px 8px 1px 16px}
#hb .hbstats{padding:4px 6px}#hb .hbstat{min-height:40px;padding:2px 9px}#hb .hbstat span{font-size:.7rem}#hb .hbstat b{font-size:.98rem!important}
#hb .hbrail{top:112px;gap:6px}#hb .hbr{width:62px;height:50px;font-size:.72rem}#hb .hbr svg{width:18px;height:18px}
#hb .hbbot{left:90px;gap:8px}#hb .hbrail.many ~ .hbbot{left:166px}
#hb .hbbig{min-height:42px;font-size:.95rem;padding:0 12px}#hb .hbbig.gold{min-height:46px;padding:0 14px 0 52px!important;font-size:.98rem!important}#hb .hbbig.gold svg{width:36px!important;height:36px!important;padding:8px!important;margin-top:-18px!important}
#hb .hbadv{flex-basis:260px;min-width:200px;padding:8px 10px}#hb .hbadv p{font-size:.85rem}#hb .hbsteps{display:none}
body.hbs .wrap.pad{left:90px!important;top:92px!important;bottom:70px!important;padding:12px!important}
body.hbs #hb .hbbot{left:auto}
body.hbs[data-hbv="rod"] .rodhub{grid-template-columns:repeat(2,minmax(0,1fr))}
body.hbs[data-hbv="dielne"] main{grid-template-columns:minmax(0,1fr)}
body.hbs[data-hbv="dielne"] main>.kssheet{position:static}
body.hbs[data-hbv="dielne"] main>.stack{grid-column:1;grid-row:auto}
}
`;document.head.appendChild(k)}
apply();
window.CELAMAPA={apply,active};
})();

;
