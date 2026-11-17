/* ==== js/jednoduche.js ==== */
/* Zjednodušenie rozhrania (v53): menej záložiek, prehľad „Tento štvrťrok“, odporúčané ťahy, stupne detailu. Šatník a vylepšenia ostávajú nedotknuté. Autor: Dávid Mucha. */
(function(){
"use strict";
const GROUPS=[
 {id:"mesto",n:"Mesto",m:["mesto","majetok"]},
 {id:"obchod",n:"Obchod",m:["dielne","trh","svet"],hideJ:["svet"]},
 {id:"rod",n:"Rod",m:["rod","kariera"]},
 {id:"vplyv",n:"Vplyv",m:["radnica","rody","dvor","cirkev"]},
 {id:"prehlad",n:"Prehľad",m:["kronika","stat"],hideJ:["stat"]}
];
const LBL={mesto:"Mapa",majetok:"Majetok",dielne:"Dielne",trh:"Trh",svet:"Svet",rod:"Rodina",kariera:"Postup",radnica:"Radnica",rody:"Rody",dvor:"Dvor",cirkev:"Cirkev",kronika:"Kronika",stat:"Štatistika"};
const MODES=[["jedn","Jednoduché"],["norm","Normálne"],["vsetko","Všetko"]];
function mode(){try{const v=localStorage.getItem("p1400detail");if(MODES.some(m=>m[0]===v))return v}catch(e){}return"jedn"}
function setMode(v){try{localStorage.setItem("p1400detail",v)}catch(e){}applyMode()}
function applyMode(){try{window.ADVON=mode()==="vsetko"}catch(e){}}
applyMode();
const last={};
const esc2=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function myW(){try{return myBall(P()).filter(b=>b.type!=="brloh")}catch(e){return[]}}

/* ---------- odporúčané ťahy ---------- */
function reco(){
 const p=P(),done=[];
 const ws=myW();
 if(ws.length&&!S.auto){S.auto={since:S.turn};done.push("zapol som správcu rodu")}
 if(S.auto){const m0=p.money;try{autoRun()}catch(e){console.warn(e)}if(p.money!==m0)done.push("dielne sú obsadené a zásobené")}
 if(p.debt>0&&p.money>p.debt+500){const d=p.debt;p.money-=d;p.debt=0;try{led(p,"ine",-d)}catch(e){}done.push("splatil som dlh")}
 return done}
A.reco=function(){if(!S||S.over)return;const d=reco();toast(d.length?"Hotovo: "+d.join(", ")+".":"Nie je čo zlepšiť, všetko beží.","good");render()};
A.recoEnd=function(){if(!S||S.over)return;reco();render();const b=document.querySelector('[data-a="end"]');if(b&&!b.disabled)b.click()};
A.detail=function(){const i=MODES.findIndex(m=>m[0]===mode());setMode(MODES[(i+1)%MODES.length][0]);toast("Detail hry: "+MODES[(i+1)%MODES.length][1],"good");render()};

/* ---------- prehľad „Tento štvrťrok“ ---------- */
function guide(){
 if(mode()!=="jedn"||S.turn>12)return"";
 const ws=myW();let t,b;
 if(!ws.length){t="Postav prvú dielňu. Klikni na voľnú parcelu na mape mesta.";b=["tab","dielne","Dielne"]}
 else if(ws.some(x=>x.w===0)){t="Dielňa nemá robotníkov. Najmi ich, inak nič nevyrába.";b=["tab","dielne","Dielne"]}
 else if(!S.auto){t="Zapni správcu rodu. Postará sa o robotníkov a suroviny, ty len ukončíš štvrťrok.";b=["reco",null,"Zapnúť správcu"]}
 else {t="Všetko beží. Ukonči štvrťrok a pozri, koľko dielne zarobili.";b=["end",null,"Ukončiť štvrťrok"]}
 return`<div class="jguide"><b>Čo teraz?</b><span>${esc2(t)}</span><button class="btn pri sm" data-a="${b[0]}"${b[1]?` data-v="${b[1]}"`:""}>${b[2]}</button></div>`}
function panel(){
 let a=[];try{a=advice()}catch(e){}
 const rows=a.slice(0,mode()==="jedn"?4:6).map(x=>`<li><span class="adi">${typeof icoOf==="function"?icoOf(x.ic):""}</span><span>${esc2(x.t)}</span><button class="btn sm" data-a="advgo" data-v="${x.v}">${x.lbl}</button></li>`).join("");
 let lot="";try{if(typeof freeLot==="function"&&freeLot()&&hasLic(S.ci)&&myBall(P()).length<maxB(P()))lot=`<li><span class="adi">⚒</span><span>V meste je voľná parcela. Môžeš postaviť ďalšiu dielňu.</span><button class="btn sm" data-a="tab" data-v="dielne">Dielne</button></li>`}catch(e){}
 const ap=S.ap,mx=apMax(P());
 return`<div class="sheet jtask"><div class="row between"><h3>Tento štvrťrok</h3><span class="muted">body činnosti ${ap}/${mx}</span></div>${guide()}
 ${(rows||lot)?`<ul class="adv">${rows}${lot}</ul>`:'<p class="muted">Nič nehorí. Dielne pracujú, rod je v bezpečí.</p>'}
 <div class="row jbtns"><button class="btn sm" data-a="reco" title="Zapne správcu, obsadí dielne a splatí dlh, ak sa dá">★ Odporúčané ťahy</button><button class="btn pri sm" data-a="recoEnd">⏩ Odporúčané a ukončiť</button><button class="btn sm ${S.auto?"pri":""}" data-a="autoT">${S.auto?"Správca rodu: zapnutý":"Správca rodu: vypnutý"}</button></div></div>`}

/* ---------- záložky ---------- */
function transform(){
 const md=mode();if(!S||md==="vsetko")return;
 const nav=document.querySelector("nav.tabs");if(!nav||nav.dataset.j)return;
 const btn={};nav.querySelectorAll("button.tab").forEach(b=>{if(!b.hidden)btn[b.dataset.v]=b});
 const cur=S.view;let curG=null;let h="";
 for(const g of GROUPS){
  let ms=g.m.filter(v=>btn[v]);
  if(md==="jedn"&&g.hideJ)ms=ms.filter(v=>!g.hideJ.includes(v)||v===cur);
  if(!ms.length)continue;
  const inG=ms.includes(cur);if(inG)curG={g,ms};
  if(inG)last[g.id]=cur;
  const tgt=inG?cur:(last[g.id]&&ms.includes(last[g.id])?last[g.id]:ms[0]);
  const first=btn[ms[0]];const badge=ms.some(v=>btn[v].querySelector(".badge"));
  const svg=first.querySelector("svg");
  h+=`<button class="tab ${inG?"on":""}" role="tab" aria-selected="${inG}" data-a="tab" data-v="${tgt}">${svg?svg.outerHTML:""}${g.n}${badge?'<span class="badge"></span>':""}</button>`;
 }
 nav.innerHTML=h;nav.dataset.j="1";
 const main=document.querySelector("main");if(!main)return;
 let pre="";
 if(curG&&curG.ms.length>1)pre+=`<div class="row jsub">${curG.ms.map(v=>`<button class="chip ${v===cur?"on":""}" data-a="tab" data-v="${v}">${LBL[v]||v}</button>`).join("")}</div>`;
 if(cur==="mesto"&&!S.over)pre+=panel();
 if(VPLYV.includes(cur)&&md!=="vsetko")pre+=vplyvHead();
 if(pre)main.insertAdjacentHTML("afterbegin",pre);
}
function tools(){
 const md=mode();const t=document.querySelector(".tools");if(!t)return;
 if(md==="jedn"){for(const a of["adv","art","fs","sfx"]){const b=t.querySelector(`[data-a="${a}"]`);if(b)b.hidden=true}}
 else if(md==="norm"){const b=t.querySelector('[data-a="adv"]');if(b)b.hidden=true}
 const l=MODES.find(m=>m[0]===md)[1];
 if(!t.querySelector('[data-a="detail"]'))t.insertAdjacentHTML("afterbegin",`<button class="btn ghost sm" data-a="detail" title="Zmeň, koľko možností hra ukazuje">Detail: ${l}</button>`);
}


/* ---------- správca dielne zrušený: všetko robí správca rodu ---------- */
A.mgr=function(){toast("Správcu dielne už niet. O všetko sa stará správca rodu.","good")};
window.autoRun=function(){
 const p=P();if(!S.auto)return;let ch=0,hired=0,fired=0,sw=0;
 for(const b of myBall(p)){
  if(b.type==="brloh"||b.halt)continue;
  const o={prod:b.prod,w:b.w};
  inCity(b.city,()=>{b.mgr=true;try{manage(p,b,true)}finally{b.mgr=false}});
  if(b.prod!==o.prod)sw++;if(b.w>o.w)hired+=b.w-o.w;if(b.w<o.w)fired+=o.w-b.w;
 }
 const t=[];if(hired)t.push(`najal ${hired} robotníkov`);if(fired)t.push(`prepustil ${fired}`);if(sw)t.push(`zmenil výrobu v ${sw} dielňach`);
 if(t.length)msg("Správca rodu: "+t.join(", ")+".","good");
};
function dropMgr(){
 try{let any=false;for(const b of S.bld||[]){if(b.owner===0&&b.mgr){b.mgr=false;any=true}}
  if(any&&!S.auto)S.auto={since:S.turn}}catch(e){}}
function stripMgr(h){return h.replace(/<div class="mgr [^"]*">[\s\S]*?<\/button><\/div>/,"")}

/* ---------- zbalené karty ---------- */
function isOpen(k){const v=(S.jOpen||{})[k];if(v!=null)return v;if(k[0]==="f"||k==="trhf")return false;return mode()!=="jedn"}
A.jtog=function(e){S.jOpen=S.jOpen||{};S.jOpen[e.k]=!isOpen(e.k);render()};
function wrapCard(k,sum,body,cls){
 if(mode()==="vsetko")return body;
 const op=isOpen(k);
 return`<div class="sheet jcard ${cls||""} ${op?"open":""}"><div class="jsum">${sum}<button class="btn ghost sm jtg" data-a="jtog" data-k="${k}" aria-expanded="${op}">${op?"Skryť detaily":"Detaily"}</button></div>${op?`<div class="jbody">${body}</div>`:""}</div>`}
window.JCARD={wrap:wrapCard,isOpen};
A.fixProd=function(e){const p=P(),b=bById(e.b);if(!b)return;inCity(b.city,()=>{const rs=(RECIPES[b.type]||[]).filter(r=>r.l<=b.lvl);let best=b.prod,bv=-1e9;for(const r of rs){b.prod=r.o;const e2=estimate(p,b);if(e2.profit>bv){bv=e2.profit;best=r.o}}b.prod=best;b.prog=0});toast("Výroba prepnutá na najziskovejší výrobok.","good");render()};
{const ob=window.bcard;if(typeof ob==="function")window.bcard=function(p,b){
 let h=ob.apply(this,arguments);
 try{h=stripMgr(h)}catch(e){}
 try{
  if(mode()==="vsetko")return h;
  let st="",big="";
  if(b.type==="brloh"){const e=lootEst(p,b);big=`<span class="jbig ${e>=0?"good":"bad"}">~${zl(Math.round(e))}</span>`}
  else{let e=null;try{e=estimate(p,b)}catch(x){}
   if(e)big=`<span class="jbig ${e.profit>=0?"good":"bad"}">${e.profit>=0?"+":"−"}${fmt(Math.abs(Math.round(e.profit)))} zl.</span><small class="muted">za štvrťrok</small>`;
   if(b.halt)st='<span class="pill warn">stojí</span>';else if(b.w===0)st='<span class="pill warn">bez robotníkov</span>';else if(e&&e.profit<0)st='<span class="pill warn">stratová</span>';else st='<span class="pill ok">beží</span>';
   if(e&&e.profit<0&&(RECIPES[b.type]||[]).length>1)st+=`<button class="btn sm pri" data-a="fixProd" data-b="${b.id}">Opraviť</button>`}
  const hire=b.w<slots(b)?`<button class="btn sm" data-a="hire" data-b="${b.id}" ${p.money<HIRE?"disabled":""}>+ Najať · ${HIRE} zl.</button>`:"";
  const sum=`<div class="jhead"><div><b class="jname">${BT[b.type].n}</b> <span class="muted">· ${esc2(CC().n)} · úr. ${ROMAN(b.lvl)}</span></div><div class="jstat">${big}</div></div><div class="row jmid"><span>${b.type==="brloh"?"Zbojníci":"Robotníci"} <b class="num">${b.w}/${slots(b)}</b></span>${st}${hire}</div>`;
  return wrapCard("b"+b.id,sum,h,"jb")
 }catch(e){console.warn("bcard",e);return h}}}

function collapseCards(){
 if(mode()==="vsetko")return;
 const main=document.querySelector("main");if(!main)return;
 let n=0;
 main.querySelectorAll(".sheet.bcard").forEach(c=>{
  if(c.closest(".jcard")||c.dataset.jc)return;
  if(c.querySelector(".foldb"))return; /* karta má vlastné zbaľovanie hry */
  const head=c.querySelector(":scope > .row.between");if(!head)return;
  const kids=[...c.children].filter(x=>x!==head);if(kids.length<2)return;
  const key="c"+S.view+":"+((head.querySelector("h3")||head).textContent||n).trim().slice(0,40);n++;
  c.dataset.jc="1";c.classList.add("jcard");
  const op=isOpen(key);
  const body=document.createElement("div");body.className="jbody";kids.forEach(k=>body.appendChild(k));
  const sum=document.createElement("div");sum.className="jsum";sum.appendChild(head);
  const bt=document.createElement("button");bt.className="btn ghost sm jtg";bt.dataset.a="jtog";bt.dataset.k=key;bt.setAttribute("aria-expanded",op);bt.textContent=op?"Skryť detaily":"Detaily";
  sum.appendChild(bt);c.appendChild(sum);if(op)c.appendChild(body);
 });
}

/* ---------- Vplyv: kratšie záložky ---------- */
const VPLYV=["radnica","rody","dvor","cirkev"];
const FOLDV=VPLYV.concat(["rod","trh","majetok","svet","kariera","kronika","stat"]);
{const of=window.foldify;if(typeof of==="function")window.foldify=function(view,html){
 try{if(S&&mode()==="jedn"&&VPLYV.includes(view)){
  S.fold=S.fold||{};S.foldInit=S.foldInit||{};
  const t=document.createElement("template");t.innerHTML=html;
  const sh=[...t.content.querySelectorAll(".sheet")].filter(e=>!(e.parentElement&&e.parentElement.closest(".sheet")));
  sh.forEach((e,i)=>{const hd=e.querySelector("h2,h3");if(!hd)return;const ttl=hd.textContent.replace(/\s+/g," ").trim().slice(0,40);if(!ttl)return;const key=view+":"+ttl;
   if(S.foldInit[key])return;S.foldInit[key]=1;if(i>0&&S.fold[key]==null)S.fold[key]=true})}}catch(e){console.warn("fold",e)}
 return of.apply(this,arguments)}}
function vplyvHead(){
 const p=P();let cl=0,al=0;try{cl=clergy().length}catch(e){}try{al=S.dyn.filter(d=>d.ai&&!d.royal&&!d.gone&&isAlly(d.id)).length}catch(e){}
 let a=[];try{a=advice().filter(x=>VPLYV.includes(x.v))}catch(e){}
 const x=a[0];
 const cell=(l,v)=>`<div class="jv"><span class="lbl">${l}</span><b>${v}</b></div>`;
 const pr=S.king===0?"Panovník":Math.round(p.rf);
 return`<div class="sheet jvplyv jvline"><div class="jvrow"><span title="priazeň kráľa">♛ <b>${pr}</b></span><span title="titul"><b>${esc2(TITLES[p.title].n)}</b></span><span title="spojenci">⚑ <b>${al}</b> ${al===1?"spojenec":al>=2&&al<=4?"spojenci":"spojencov"}</span><span title="duchovní v rode">✝ <b>${cl}</b></span></div>${x?`<div class="jguide"><b>Čo teraz?</b><span>${esc2(x.t)}</span>${x.v!==S.view?`<button class="btn pri sm" data-a="advgo" data-v="${x.v}">${x.lbl}</button>`:""}</div>`:""}</div>`}
function toTop(){
 if(document.getElementById("jtop"))return;
 const b=document.createElement("button");b.id="jtop";b.type="button";b.className="btn sm";b.textContent="↑ Hore";b.hidden=true;
 b.onclick=()=>window.scrollTo({top:0,behavior:"smooth"});document.body.appendChild(b);
 window.addEventListener("scroll",()=>{b.hidden=window.scrollY<700},{passive:true})}

function foldSheets(){
 if(mode()!=="jedn"||!FOLDV.includes(S.view))return;
 const main=document.querySelector("main");if(!main)return;
 const list=[...main.querySelectorAll("main > .stack > .sheet, main > .stack > .cols > .sheet, main .rodsec > .sheet")].filter(e=>!e.classList.contains("jvplyv")&&!e.querySelector(":scope > .foldhead, :scope > * > .foldb")&&!e.querySelector(".foldb"));
 list.forEach((sh,i)=>{
  if(sh.dataset.jf)return;
  const hd=sh.querySelector("h2,h3");if(!hd)return;
  let top=hd;while(top.parentElement&&top.parentElement!==sh)top=top.parentElement;if(top.parentElement!==sh)return;
  const rest=[...sh.children].filter(c=>c!==top);if(!rest.length)return;
  const key="f"+S.view+":"+hd.textContent.replace(/\s+/g," ").trim().slice(0,40);
  S.jOpen=S.jOpen||{};if(S.jOpen[key]==null&&(i===0||/^Členovia/.test(hd.textContent.trim())))S.jOpen[key]=true;const op=!!S.jOpen[key];
  sh.dataset.jf="1";
  const bt=document.createElement("button");bt.className="btn ghost sm jtg";bt.dataset.a="jtog";bt.dataset.k=key;bt.textContent=op?"Skryť":"Zobraziť";bt.setAttribute("aria-expanded",op);
  top.classList.add("jfoldtop");top.appendChild(bt);
  if(!op){rest.forEach(c=>c.hidden=true);sh.classList.add("jclosed")}
 })}

/* ---------- celá obrazovka pre siene a sídla ---------- */
function openFS(src){
 closeFS();
 const ov=document.createElement("div");ov.id="jfs";ov.setAttribute("role","dialog");ov.setAttribute("aria-label","Celá obrazovka");
 const box=document.createElement("div");box.className="jfsbox";
 const c=src.cloneNode(true);c.querySelectorAll(".jfsb").forEach(x=>x.remove());
 c.removeAttribute("id");box.appendChild(c);
 const x=document.createElement("button");x.type="button";x.className="btn pri sm jfsx";x.textContent="✕ Zavrieť";x.onclick=closeFS;
 ov.append(box,x);document.body.appendChild(ov);
 try{const r=ov.requestFullscreen&&ov.requestFullscreen();if(r&&r.catch)r.catch(()=>{});}catch(e){}
 
}
function closeFS(){
 const ov=document.getElementById("jfs");if(ov)ov.remove();
 try{if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{})}catch(e){}
 
}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest(".jfsb:not(.jmapb)");if(!b)return;e.preventDefault();e.stopPropagation();const w=b.parentElement;const t=w.querySelector("svg")||w;openFS(t)},true);
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeFS()});
document.addEventListener("fullscreenchange",()=>{if(!document.fullscreenElement&&document.getElementById("jfs")){const ov=document.getElementById("jfs");ov.remove();}});
function addFS(root){
 (root||document).querySelectorAll(".hallwrap, .streetwrap, .lifewrap, .kssheet").forEach(w=>{
  if(w.querySelector(":scope > .jfsb"))return;
  if(!w.querySelector("svg"))return;
  if(getComputedStyle(w).position==="static")w.style.position="relative";
  const b=document.createElement("button");b.type="button";b.className="jfsb";b.title="Zväčšiť na celú obrazovku";b.setAttribute("aria-label","Zväčšiť na celú obrazovku");b.textContent="⤢";w.appendChild(b);
 })}
{const mo=new MutationObserver(()=>{try{addFS();addMapBtn()}catch(e){}});const go=()=>{if(document.body)mo.observe(document.body,{childList:true,subtree:true})};if(document.body)go();else document.addEventListener("DOMContentLoaded",go)}

/* ---------- mapa mesta na celú obrazovku ---------- */
function mapFS(on){
 const k=document.getElementById("kcity");if(!k)return;
 const was=k.classList.contains("jmapfs");if(on===undefined)on=!was;
 k.classList.toggle("jmapfs",on);document.body.classList.toggle("jmapon",on);
 let x=document.getElementById("jmapx");
 if(on){if(!x){x=document.createElement("button");x.id="jmapx";x.type="button";x.className="btn pri sm";x.textContent="✕ Zavrieť mapu";x.onclick=()=>mapFS(false);document.body.appendChild(x)}
  try{const r=document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();if(r&&r.catch)r.catch(()=>{})}catch(e){}
  
 }else{if(x)x.remove();try{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})}catch(e){}}
}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest(".jmapb");if(b){e.preventDefault();e.stopPropagation();mapFS()}},true);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.body.classList.contains("jmapon"))mapFS(false)});
document.addEventListener("fullscreenchange",()=>{if(!document.fullscreenElement&&document.body.classList.contains("jmapon"))mapFS(false)});
function addMapBtn(){
 const k=document.getElementById("kcity");if(!k)return;if(document.body.classList.contains("jmapon")&&!k.classList.contains("jmapfs"))k.classList.add("jmapfs");if(k.querySelector(":scope > .jmapb"))return;
 const b=document.createElement("button");b.type="button";b.className="jfsb jmapb";b.title="Mapa na celú obrazovku";b.setAttribute("aria-label","Mapa na celú obrazovku");b.textContent="⤢";k.appendChild(b)}
const o=window.render;
window.render=function(){
 try{if(S&&mode()==="jedn"&&!S.greet)S.greet=1}catch(e){}
 dropMgr();
 const r=o.apply(this,arguments);
 try{if(S){tools();transform();collapseCards();foldSheets();toTop();addMapBtn()}}catch(e){console.warn("jednoduche",e)}
 return r};
if(!document.getElementById("jed-css")){const st=document.createElement("style");st.id="jed-css";st.textContent=`
.jsub{gap:6px;flex-wrap:wrap;margin-bottom:10px}
.jtask .jbtns{gap:8px;flex-wrap:wrap;margin-top:10px}
.jguide{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:rgba(214,170,76,.18);border:1px solid #d6aa4c;border-radius:6px;padding:8px 10px;margin:8px 0}
.jguide span{flex:1 1 220px;min-width:0}
.tabs .tab{flex:1 1 0}
#kcity.jmapfs{position:fixed!important;inset:0;margin:auto!important;z-index:1500;width:min(100vw,171.4vh)!important;height:min(58.3vw,100vh)!important;max-width:none!important;box-shadow:0 0 0 100vmax #000;overflow:hidden}
#kcity.jmapfs canvas{width:100%!important;height:100%!important}
#jmapx{position:fixed;z-index:1600;top:max(10px,env(safe-area-inset-top,0px));right:max(10px,env(safe-area-inset-right,0px))}
body.jmapon #jtop,body.jmapon #ktip{display:none!important}

body:has(#modal:not([hidden])) #ktip{display:none!important}
.jfsb{position:absolute;top:6px;right:6px;z-index:6;width:34px;height:34px;border-radius:8px;border:1px solid #0006;background:#fff8e8d9;color:#2b2117;font-size:1.2rem;line-height:1;cursor:pointer;padding:0}
.jfsb:hover{background:#fff}
#jfs{position:fixed;inset:0;z-index:2000;background:#0b0c12;display:flex;align-items:center;justify-content:center}
#jfs .jfsbox{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
#jfs .jfsbox>*{width:100%!important;height:100%!important;max-width:none!important;max-height:100%!important;margin:0!important}
#jfs svg{width:100%;height:100%}
#jfs .jfsx{position:absolute;top:max(10px,env(safe-area-inset-top,0px));right:max(10px,env(safe-area-inset-right,0px))}
#jfs .jfshint{position:absolute;left:0;right:0;bottom:max(10px,env(safe-area-inset-bottom,0px));text-align:center;color:#fff9;font-size:.85rem;pointer-events:none}



.jfoldtop{display:flex;justify-content:space-between;align-items:center;gap:8px}.jfoldtop .jtg{margin:0}
.jclosed{padding-bottom:10px}
.jvline{padding-block:8px!important}.jvrow{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;font-size:.95rem}.jvrow b{font-size:1rem}
.jvgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px}
.jv{display:flex;flex-direction:column}.jv b{font-size:1.2rem}
#jtop{position:fixed;right:max(12px,env(safe-area-inset-right,0px));bottom:calc(142px + env(safe-area-inset-bottom,0px));z-index:30}
@media (min-width:900px){#jtop{bottom:20px}}
.jcard .jhead{display:flex;justify-content:space-between;gap:10px;align-items:baseline;flex-wrap:wrap}
.jcard .jname{font-size:1.15rem}
.jcard .jstat{display:flex;gap:6px;align-items:baseline}
.jcard .jbig{font-size:1.5rem;font-weight:700}
.jcard .jbig.good{color:var(--good)}.jcard .jbig.bad{color:var(--bad)}
.jcard .jmid{gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px}
.jcard .jtg{margin-left:auto;margin-top:8px}
.jcard .jsum{display:flex;flex-direction:column}
.jcard .jbody{margin-top:10px;border-top:1px solid rgba(0,0,0,.15);padding-top:10px}
.jcard .jbody>.sheet{box-shadow:none;border:0;padding:0;background:none}
`;document.head.appendChild(st)}
window.JEDNODUCHE={mode,setMode,reco};
})();
/* ---------- skrátené popisy s „Viac“ ---------- */
(function(){
"use strict";
const hash=t=>{let h=0;for(let i=0;i<Math.min(t.length,200);i++)h=(h*31+t.charCodeAt(i))|0;return String(h)};
function shorten(){
 try{if(window.JEDNODUCHE.mode()!=="jedn")return}catch(e){return}
 const main=document.querySelector("main");if(!main)return;
 S.jMore=S.jMore||{};
 main.querySelectorAll("p").forEach(p=>{
  if(p.dataset.jm||p.closest(".jguide,.jtask,#modal,.jbtns,button,label"))return;
  if(p.querySelector("button,input,select,textarea,a,svg,img"))return;
  const txt=p.textContent.replace(/\s+/g," ").trim();if(txt.length<120)return;
  const k=hash(txt);p.dataset.jm=k;
  if(S.jMore[k])return;
  const m=txt.slice(0,110).match(/^[\s\S]*[.!?](?=\s|$)/);const cut=m&&m[0].length>40?m[0]:txt.slice(0,90).replace(/\s+\S*$/,"")+"…";
  if(cut.length>=txt.length-20)return;
  p.dataset.full=p.innerHTML;p.textContent=cut+" ";
  const b=document.createElement("button");b.type="button";b.className="jmore";b.dataset.jmk=k;b.textContent="Viac";p.appendChild(b);
 })}
document.addEventListener("click",e=>{
 const b=e.target.closest&&e.target.closest(".jmore");if(!b)return;e.preventDefault();e.stopPropagation();
 const p=b.parentElement;if(!p||!p.dataset.full)return;S.jMore=S.jMore||{};S.jMore[b.dataset.jmk]=1;p.innerHTML=p.dataset.full;delete p.dataset.full;
},true);
const o=window.render;
window.render=function(){const r=o.apply(this,arguments);try{if(S)shorten()}catch(e){console.warn("viac",e)}return r};
const st=document.createElement("style");st.textContent=`.jmore{border:0;background:none;color:var(--link,#1f4e9c);text-decoration:underline;font:inherit;cursor:pointer;padding:2px 4px;min-height:32px}`;document.head.appendChild(st);
})();
/* ---------- Trh: skupiny tovarov zbalené, stĺpce len to podstatné ---------- */
(function(){
"use strict";
let guard=false;
function trhInit(){
 try{if(window.JEDNODUCHE.mode()!=="jedn"||S.view!=="trh")return false}catch(e){return false}
 const secs=[...document.querySelectorAll("main table tr.sec .tsec")];if(!secs.length)return false;
 S.tfold=S.tfold||{};S.tfoldInit=S.tfoldInit||{};let ch=false;
 secs.forEach(b=>{
  const n=b.dataset.n;if(S.tfoldInit[n])return;S.tfoldInit[n]=1;
  let r=b.closest("tr").nextElementSibling,has=false;
  while(r&&!r.classList.contains("sec")){const td=r.querySelectorAll("td.r.num");const sk=td.length?td[td.length-1].textContent.trim():"";if(sk&&sk!=="—"&&sk!=="0"&&sk!=="-")has=true;r=r.nextElementSibling}
  if(!has&&!S.tfold[n]){S.tfold[n]=true;ch=true}
 });
 return ch}
const o=window.render;
window.render=function(){
 const r=o.apply(this,arguments);
 try{if(!guard&&trhInit()){guard=true;try{o.apply(this,arguments)}finally{guard=false}}}catch(e){guard=false;console.warn("trh",e)}
 return r};
const st=document.createElement("style");st.textContent=``;document.head.appendChild(st);
const sync=()=>{try{document.body.classList.toggle("jjedn",window.JEDNODUCHE.mode()==="jedn"&&S&&S.view==="trh")}catch(e){}};
const o2=window.render;window.render=function(){const r=o2.apply(this,arguments);sync();return r};
})();
(function(){
"use strict";
function filt(){
 try{if(window.JEDNODUCHE.mode()!=="jedn"||S.view!=="trh")return}catch(e){return}
 const f=document.querySelector("main .trhf");if(!f||f.dataset.jf)return;f.dataset.jf="1";
 S.jOpen=S.jOpen||{};const op=!!S.jOpen.trhf;
 const b=document.createElement("button");b.type="button";b.className="btn ghost sm";b.dataset.a="jtog";b.dataset.k="trhf";b.textContent=op?"Skryť filtre":"Filtre a zoradenie";b.style.margin="6px 0";
 f.parentNode.insertBefore(b,f);if(!op)f.hidden=true;
}
const o=window.render;window.render=function(){const r=o.apply(this,arguments);try{filt()}catch(e){console.warn("filtre",e)}return r};
})();

;
