/* ==== js/vplyv.js ==== */
/* Jednoduchší Vplyv (v73): siene ako náhľad, hlavná akcia, spojené sekcie, zoznam rodov, bodky na podkartách. Autor: Dávid Mucha. */
(function(){
"use strict";
const VIEWS=["radnica","rody","dvor","cirkev"];
const hasS=()=>{try{return !!S}catch(e){return false}};
const mode=()=>{try{return window.JEDNODUCHE?JEDNODUCHE.mode():"jedn"}catch(e){return "jedn"}};
const on=()=>hasS()&&mode()!=="vsetko";
const esc3=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function ttl(sh){const h=sh.querySelector("h2,h3");if(!h)return"";const c=h.cloneNode(true);c.querySelectorAll("button,.pill").forEach(x=>x.remove());return c.textContent.replace(/[▸▾]/g,"").replace(/\s+/g," ").trim()}
function topSheets(main){return[...main.querySelectorAll(".sheet")].filter(e=>!(e.parentElement&&e.parentElement.closest(".sheet"))&&!e.classList.contains("vgrp")&&!e.classList.contains("jvplyv")&&!e.classList.contains("vmain"))}
function isOpenG(k,def){const v=(S.vOpen||{})[k];return v==null?!!def:!!v}
A.vtog=function(e){S.vOpen=S.vOpen||{};S.vOpen[e.k]=!isOpenG(e.k,e.d==="1");render()};

/* 1) siene ako úzky pás s tlačidlom */
const HALLN={radnica:"Radná sieň",rody:"Galéria rodov",dvor:"Trónna sála",cirkev:"Chrám"};
function halls(main,view){
 if(main.querySelector(".vhall"))return;
 const els=[...main.querySelectorAll(".hallwrap,.kssheet,.hallsheet")].filter(e=>!e.closest(".vgrp")&&e.querySelector("svg,canvas"));
 if(!els.length)return;
 const bar=document.createElement("div");bar.className="sheet vhall";
 const names=els.map((e,i)=>e.classList.contains("kssheet")?(ttl(e)||HALLN[view]):e.classList.contains("hallwrap")?"Pohľad zhora":"Podobizne");
 bar.innerHTML=`<span class="vhi">${esc3(HALLN[view]||"Sieň")}</span><span class="vhb">${els.map((e,i)=>`<button type="button" class="btn sm ${e.classList.contains("kssheet")?"pri":"ghost"}" data-vh="${i}">${i===els.findIndex(x=>x.classList.contains("kssheet"))?"Otvoriť sieň":esc3(names[i])}</button>`).join("")}</span>`;
 els.forEach(e=>{e.classList.add("vhid");if(window.__vshow===view+":"+(e.className.match(/kssheet|hallwrap|hallsheet/)||[""])[0])e.classList.add("vshow")});
 els[0].parentElement.insertBefore(bar,els[0]);
 bar.querySelectorAll("[data-vh]").forEach(b=>b.onclick=ev=>{ev.stopPropagation();const el=els[+b.dataset.vh];
  if(!el.querySelector("svg")){/* kreslená scéna: ukáž ju na mieste */const sh=el.classList.toggle("vshow");window.__vshow=sh?view+":"+(el.className.match(/kssheet|hallwrap|hallsheet/)||[""])[0]:null;b.textContent=sh?"Skryť sieň":"Otvoriť sieň";return}
  let f=el.querySelector(":scope > .jfsb");
  if(!f){f=document.createElement("button");f.type="button";f.className="jfsb";f.textContent="⤢";el.appendChild(f)}setTimeout(()=>f.click(),0)});
}

/* 2) hlavná akcia navrchu */
const MAIN={
 radnica:{t:"Radní rozhodujú o daniach a zákonoch. Sviatok a hlasy ti získajú ich priazeň.",a:["elVote","vote","cand","candidate","cFeast","votesBuy"]},
 rody:{t:"Hostina zlepší vzťahy so všetkými rodmi v meste naraz.",a:["feast","guard"]},
 dvor:{t:"Dary a audiencia zvyšujú priazeň kráľa.",a:["rgift","aud"]},
 cirkev:{t:"Odpustky a púte zvyšujú tvoje postavenie v Cirkvi.",a:["indulg","pilgGo"]}};
function mainAct(main,view){
 if(main.querySelector(".vmain"))return;const M=MAIN[view];if(!M)return;
 let btns=[];
 const vol=[...main.querySelectorAll(".sheet:not(.vgrp)")].find(s=>/^Voľby/.test(ttl(s)));
 if(view==="radnica"&&vol)btns=[...vol.querySelectorAll("button[data-a]")].filter(b=>!/^(fold|jtog)$/.test(b.dataset.a)).slice(0,2);
 for(const a of M.a){if(btns.length>=2)break;const b=main.querySelector(`button[data-a="${a}"]`);if(b&&!btns.includes(b))btns.push(b)}
 let adv=null;try{adv=advice().find(x=>x&&x.v===view)}catch(e){}
 const d=document.createElement("div");d.className="sheet vmain";
 d.innerHTML=`<b class="vmt">Hlavná akcia</b><p>${esc3(adv?adv.t:M.t)}</p><div class="vmb"></div>`;
 const box=d.querySelector(".vmb");btns.forEach(b=>{const c=b.cloneNode(true);c.classList.remove("ghost");box.appendChild(c)});
 if(!btns.length&&!adv)return;
 const bar=main.querySelector(".vhall"),head=main.querySelector(".jvplyv");
 const ref=bar||head;if(ref)ref.after(d);else main.prepend(d);
}

/* 3) spojené sekcie */
const GROUPS={
 radnica:[["Rada a zákony",[/^Rada mesta/,/^Mestská rada/,/^Rada a nariadenia/,/^Zákony a hlasy/]],["Voľby",[/^Voľby/]],["Cechy a stavby",[/^Cechy a frakcie/,/^Mestské stavby/]]],
 rody:[["Rody mesta",[/^Rody mesta/],1],["Ochrana rodu",[/^Ochrana rodu/]]],
 dvor:[["Priazeň kráľa",[/^Priazeň kráľa/]],["Kráľovský dvor",[/^Kráľovský dvor/,/^Platné kráľovské/,/^Najvýznamnejšie rody/]]],
 cirkev:[["Svätá stolica",[/^Svätá stolica/]],["Tvoj rod v Cirkvi",[/^Duchovní z tvojho/,/^Zasvätiť Cirkvi/,/^Hodnosti a výhody/]],["Púte",[/^Púte/]]]};
function group(main,view,title,rx,def){
 const key=view+":"+title;
 const found=topSheets(main).filter(s=>{const t=ttl(s);return rx.some(r=>r.test(t))});
 if(!found.length)return null;
 const op=isOpenG(key,def);
 const g=document.createElement("div");g.className="sheet vgrp"+(op?" open":"");
 g.innerHTML=`<div class="vgh"><h3>${esc3(title)}</h3><button type="button" class="btn ghost sm" data-a="vtog" data-k="${esc3(key)}" data-d="${def?1:0}" aria-expanded="${op}">${op?"Skryť":"Zobraziť"}</button></div><div class="vgb"${op?"":" hidden"}></div>`;
 found[0].parentElement.insertBefore(g,found[0]);
 const body=g.querySelector(".vgb");
 found.forEach(s=>{body.appendChild(s);
  /* jediná sekcia v skupine: rovno ju rozbaľ, nech netreba ťukať dvakrát */
  if(found.length===1){s.classList.remove("folded","jclosed");[...s.children].forEach(c=>{if(c.hidden&&!c.classList.contains("vhid"))c.hidden=false});s.querySelectorAll(":scope .foldb,:scope > * > .jtg,:scope .jfoldtop > .jtg").forEach(x=>x.hidden=true)}});
 return g}
function groups(main,view){
 if(main.querySelector(".vgrp"))return;
 (GROUPS[view]||[]).forEach(([t,rx,def])=>group(main,view,t,rx,def));
 /* veľké diela patria k rodu */
 if(view==="dvor")topSheets(main).filter(s=>/^Veľké diela rodu/.test(ttl(s))).forEach(s=>s.remove());
 /* rody zostanú pod zoznamom rodov */
 if(view==="rody"){const gg=[...main.querySelectorAll(".vgrp")].find(x=>/^Rody mesta/.test(ttl(x)));const g=gg&&gg.querySelector(".vgb");const sb=main.querySelector(".rsortbar"),gc=main.querySelector(".grid-cards");if(g){if(sb)g.appendChild(sb);if(gc)g.appendChild(gc);if(g.hidden){}}}
}

/* 4) rody ako krátky zoznam */
function rodList(main){
 const sb=main.querySelector(".rsortbar");
 if(sb&&!sb.querySelector("select")){
  const bs=[...sb.querySelectorAll('[data-a="rsort"]')];
  if(bs.length){const cur=(bs.find(b=>b.classList.contains("on"))||bs[0]).dataset.k;
   const sel=document.createElement("select");sel.className="vsel";sel.setAttribute("aria-label","Zoradiť rody");
   sel.innerHTML=bs.map(b=>`<option value="${esc3(b.dataset.k)}"${b.dataset.k===cur?" selected":""}>Zoradiť ${esc3(b.textContent.trim())}</option>`).join("");
   sel.onchange=()=>{try{A.rsort({k:sel.value})}catch(e){}};
   bs.forEach(b=>b.remove());const l=sb.querySelector(".lbl,span");if(l&&/zoradiť/i.test(l.textContent))l.remove();
   sb.prepend(sel)}}
 main.querySelectorAll(".grid-cards .sheet.bcard").forEach(c=>{
  if(c.dataset.vr)return;c.dataset.vr="1";
  const h=c.querySelector("h3");if(!h)return;const nm=ttl(c).replace(/^Rod\s+/,"");
  let d=null;try{d=S.dyn.find(x=>x.name===nm&&!x.gone)}catch(e){}
  if(!d||typeof d.favor!=="number")return;
  const f=Math.round(d.favor),lv=f>=30?"ok":f<=-30?"bad":"mid";
  const s=document.createElement("span");s.className="vfav "+lv;s.title="priazeň k tebe";s.innerHTML=`<i></i>${f>0?"+":""}${f}`;
  h.insertBefore(s,h.firstChild);
  /* ťuknutie na celý riadok rozbalí rod */
  const fh=c.querySelector(".foldhead");if(fh&&c.classList.contains("folded")){fh.style.cursor="pointer";fh.addEventListener("click",e=>{if(e.target.closest("button"))return;const b=fh.querySelector(".foldb");if(b)b.click()})}
 });
}

/* 5) Veľké diela v karte Rod */
function worksToRod(main){
 if(main.querySelector(".vworks"))return;
 let html="";for(const fn of ["worksSheet","grandView"]){try{if(typeof window[fn]==="function"){const h=window[fn]();if(/data-a="work"/.test(h)){html=h;break}}}catch(e){}}
 if(!html)return;
 const key="rod:Veľké diela rodu",op=isOpenG(key,false);
 const g=document.createElement("div");g.className="sheet vgrp vworks"+(op?" open":"");
 g.innerHTML=`<div class="vgh"><h3>Veľké diela rodu</h3><button type="button" class="btn ghost sm" data-a="vtog" data-k="${key}" data-d="0" aria-expanded="${op}">${op?"Skryť":"Zobraziť"}</button></div><div class="vgb"${op?"":" hidden"}>${html}</div>`;
 const st=main.querySelector(":scope > .stack")||main;st.appendChild(g);
 const inner=g.querySelector(".vgb > .sheet h3");if(inner)inner.remove();
}

/* 6) bodky na podkartách */
function dots(){
 let a=[];try{a=advice()}catch(e){}
 document.querySelectorAll('.jsub .chip[data-v]').forEach(c=>{
  const v=c.dataset.v;if(!VIEWS.includes(v))return;
  const need=a.some(x=>x&&x.v===v&&x.pr>=5);
  let d=c.querySelector(".vdot");
  if(need&&!d){d=document.createElement("i");d.className="vdot";d.setAttribute("aria-label","čaká tu niečo dôležité");c.appendChild(d)}
  if(!need&&d)d.remove()});
}

function apply(){
 if(!on())return;
 const main=document.querySelector("main");if(!main)return;
 const v=S.view;
 if(VIEWS.includes(v)){
  main.querySelectorAll(".jumpbar").forEach(j=>j.remove());
  try{halls(main,v)}catch(e){console.warn("vplyv halls",e)}
  try{groups(main,v)}catch(e){console.warn("vplyv groups",e)}
  try{mainAct(main,v)}catch(e){console.warn("vplyv main",e)}
  if(v==="rody")try{rodList(main)}catch(e){console.warn("vplyv rody",e)}
  try{dots()}catch(e){}
 }

}
{const o=window.render;window.render=function(){const r=o.apply(this,arguments);try{apply()}catch(e){console.warn("vplyv",e)}return r}}

const st=document.createElement("style");st.textContent=`
.vhid:not(.vshow){display:none!important}
.vhall{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding-block:10px!important}
.vhall .vhi{font-family:"Almendra SC","EB Garamond",Georgia,serif;font-size:1.05rem}
.vhall .vhb{display:flex;gap:6px;flex-wrap:wrap}
.vmain{border:2px solid #d6aa4c!important;padding-block:12px!important}
.vmain .vmt{display:block;font-family:"Almendra SC","EB Garamond",Georgia,serif;font-size:1.05rem;margin-bottom:2px}
.vmain p{margin:4px 0 10px}
.vmain .vmb{display:flex;gap:8px;flex-wrap:wrap}
.vgrp{padding-block:10px!important}
.vgrp .vgh{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:40px}
.vgrp .vgh h3{margin:0}
.vgrp .vgb{margin-top:8px}
.vgrp .vgb > .sheet,.vgrp .vgb > .grid-cards > .sheet{box-shadow:none!important;background:transparent!important;border:0!important;border-top:1px solid #8a6a3a44!important;border-radius:0!important;margin:0!important;padding:10px 0!important}
.vgrp .vgb > .sheet::before,.vgrp .vgb > .sheet::after{display:none!important}
.vgrp .vgb > .grid-cards{display:flex!important;flex-direction:column;gap:0}
.vgrp .vgb > .rsortbar{margin:4px 0 6px}
.vsel{font:inherit;padding:8px 10px;border-radius:8px;border:1px solid #8a6a3a;background:#fff8e8;color:#2b2117;min-height:40px;max-width:100%}
.vfav{display:inline-flex;align-items:center;gap:4px;font-size:.85rem;font-family:"EB Garamond",Georgia,serif;margin-right:8px;vertical-align:middle;padding:1px 7px;border-radius:10px;background:#0000000d}
.vfav i{width:10px;height:10px;border-radius:50%;background:#e2a81f;display:inline-block}
.vfav.ok i{background:#3a9a4a}.vfav.bad i{background:#c43a2f}
.jsub .chip{position:relative}
.vdot{position:absolute;top:3px;right:3px;width:9px;height:9px;border-radius:50%;background:#c43a2f;box-shadow:0 0 0 2px #fff8}
`;document.head.appendChild(st);
})();

;
