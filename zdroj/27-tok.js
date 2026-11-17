/* ==== js/tok.js ==== */
/* Jeden tok kola (v60): tlačidlo „Ďalej“, súhrn štvrťroka v pruhu, hromadné najímanie, kompaktná hlavička. Autor: Dávid Mucha. */
(function(){
"use strict";
const hasS=()=>{try{return !!S}catch(e){return false}};
const jedn=()=>{try{return window.JEDNODUCHE?JEDNODUCHE.mode()==="jedn":false}catch(e){return false}};
const esc2=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const cut=(t,n)=>t.length>n?t.slice(0,n-1).trimEnd()+"…":t;
function ws(){try{return myBall(P()).filter(b=>b.type!=="brloh"&&!b.halt)}catch(e){return[]}}
function canHire(b){try{const p=P();return S.ap>0&&b.city===CC().id&&b.w<slots(b)&&p.money>=HIRE+150}catch(e){return false}}
function profitable(b){try{return inCity(b.city,()=>estimate(P(),b)).profit>0}catch(e){return true}}
function next(){
 if(!hasS()||S.over)return{end:true,t:"Ukončiť štvrťrok"};
 const w=S.auto?null:ws().find(b=>canHire(b)&&profitable(b));
 if(w)return{t:`Najať robotníka · ${BT[w.type].n}`,run:()=>A.hire({b:String(w.id)})};
 S.tokSeen=S.tokSeen||{};if(S.tokTurn!==S.turn){S.tokTurn=S.turn;S.tokN=0}
 let a=[];try{a=advice()}catch(e){}
 const x=S.tokN>=1?null:a.find(i=>i&&i.v&&!S.tokSeen[S.turn+":"+i.t]);
 if(x)return{t:cut(x.t,38),key:S.turn+":"+x.t,go:x.v};
 return{end:true,t:"Ukončiť štvrťrok"};
}
A.tokNext=function(){
 const n=next();
 if(n.end){const b=document.querySelector('[data-a="end"]');if(b)b.click();return}
 if(n.run){n.run();render();return}
 if(n.go){S.tokSeen[n.key]=1;S.tokN=(S.tokN||0)+1;A.advgo({v:n.go});render()}
};
A.tokHireAll=function(){
 let n=0;
 for(const b of ws()){while(canHire(b)&&profitable(b)){const w0=b.w;try{A.hire({b:String(b.id)})}catch(e){break}if(b.w<=w0)break;n++}}
 try{toast(n?`Najal som ${n} robotníkov.`:"Nie je koho najať. Chýbajú peniaze, body činnosti alebo miesta.","good")}catch(e){}
 render()};

/* tlačidlo „Ďalej“ namiesto pevného „Ukončiť štvrťrok“ */
function relabel(){
 if(!jedn()||!hasS())return;
 const b=document.querySelector("button.end");if(!b)return;
 const n=next();const svg=b.querySelector("svg");
 if(n.end){if(b.dataset.a!=="end"){b.dataset.a="end"}b.innerHTML=(svg?svg.outerHTML:"")+"Ukončiť štvrťrok";return}
 b.dataset.a="tokNext";b.title="Odporúčaný ďalší krok";b.innerHTML=(svg?svg.outerHTML:"")+`<span class="tokl">Ďalej: ${esc2(n.t)}</span>`;
}

/* zmena pokladnice po štvrťroku: číslo krátko vyskočí nad pokladnicou */
function floatDelta(txt,good){const host=[...document.querySelectorAll('#hb [data-hb="statclick"],header.top .stat,header.top .chip')].find(e=>/pokladnic/i.test(e.textContent||""));
 const r=host&&host.getBoundingClientRect().width?host.getBoundingClientRect():{left:innerWidth-260,top:20,width:120,height:40};
 const d=document.createElement("div");d.className="tokfloat "+(good?"good":"bad");d.textContent=txt;d.setAttribute("aria-hidden","true");d.style.left=Math.round(r.left+r.width/2)+"px";d.style.top=Math.round(r.top+r.height)+"px";document.body.appendChild(d);setTimeout(()=>d.remove(),3200)}
if(!document.getElementById("tokfloatcss")){const st=document.createElement("style");st.id="tokfloatcss";st.textContent=`.tokfloat{position:fixed;z-index:9000;transform:translate(-50%,0);font:700 1.25rem/1 Georgia,serif;padding:6px 12px;border-radius:999px;pointer-events:none;box-shadow:0 4px 14px rgba(0,0,0,.35);animation:tokfl 3.2s ease-out forwards}.tokfloat.good{background:#f3e7c4;color:#2f6b2a;border:2px solid #6b8a3a}.tokfloat.bad{background:#f3e0d6;color:#8e1f1c;border:2px solid #a0463a}@keyframes tokfl{0%{opacity:0;transform:translate(-50%,-6px) scale(.8)}12%{opacity:1;transform:translate(-50%,8px) scale(1.08)}20%{transform:translate(-50%,8px) scale(1)}80%{opacity:1;transform:translate(-50%,14px)}100%{opacity:0;transform:translate(-50%,24px)}}@media (prefers-reduced-motion:reduce){.tokfloat{animation:none;opacity:1}}`;document.head.appendChild(st)}
{const o=window.endTurn;if(typeof o==="function")window.endTurn=function(){let m0=null;try{m0=P().money}catch(e){}const r=o.apply(this,arguments);
 try{const d=Math.round(P().money-m0);if(m0!=null&&d&&!S.over)setTimeout(()=>{try{floatDelta((d>0?"+":"−")+Math.abs(d).toLocaleString("sk")+" zl.",d>0)}catch(e){}},250)}catch(e){}return r}}
/* súhrn štvrťroka ako pruh */
let last=null,tmr=0;
function strip(label,html){
 const t=document.createElement("template");t.innerHTML=html;
 let lines=[...t.content.querySelectorAll("p,li,.row")].map(e=>e.textContent.replace(/\s+/g," ").trim()).filter(x=>x&&x.length>3);
 /* nový súhrn začína nadpismi („pokladnica“, „pohyb v sklade“) – do pruhu patrí výsledok a čakajúce rozhodnutia */
 const all=t.content.textContent.replace(/\s+/g," ");const res=(all.match(/[^.]*v pokladnici (?:pribudlo|ubudlo|ostalo)[^.]*\./)||[])[0];const dec=(all.match(/čaká rozhodnut[ií]a?: ?\d+/)||[])[0];
 if(res)lines=[res.replace(/^\s*\S+ \d{4}\.\s*/,"").trim()].concat(dec?[dec]:[]);
 let el=document.getElementById("tokstrip");if(!el){el=document.createElement("div");el.id="tokstrip";document.body.appendChild(el)}
 el.innerHTML=`<div class="tokt"><b>${esc2(label)}</b> ${esc2(cut(lines.slice(0,2).join(" · "),150))}</div><div class="tokb"><button class="btn sm" data-a="tokRep">Podrobnosti</button><button class="btn ghost sm" data-a="tokX" aria-label="Zavrieť">✕</button></div>`;
 el.hidden=false;clearTimeout(tmr);tmr=setTimeout(()=>{el.hidden=true},14000);
}
A.tokX=function(){const el=document.getElementById("tokstrip");if(el)el.hidden=true};
A.tokRep=function(){A.tokX();if(last&&last.q)last.q(last.label,last.html)};
{const q=window.quarterReport;
 if(typeof q==="function")window.quarterReport=function(label,html){
  try{if(jedn()&&hasS()&&!S.over){last={label,html,q:q.bind(this)};strip(label,html);return}}catch(e){console.warn("tok",e)}
  return q.apply(this,arguments)}}

/* hromadné najímanie v paneli a v dielňach */
function addBulk(){
 if(!hasS()||!jedn())return;
 const any=ws().some(b=>canHire(b)&&profitable(b));
 const tgt=[];if(S.view==="mesto"){const j=document.querySelector(".jtask .jbtns");if(j)tgt.push(j)}
 if(S.view==="dielne"){const m=document.querySelector("main");if(m&&!m.querySelector(".tokbulk")){const d=document.createElement("div");d.className="row tokbulk";m.insertBefore(d,m.firstChild);}const d=document.querySelector("main .tokbulk");if(d)tgt.push(d)}
 tgt.forEach(c=>{if(c.querySelector('[data-a="tokHireAll"]'))return;if(!any)return;c.insertAdjacentHTML("afterbegin",`<button class="btn sm" data-a="tokHireAll">Najať do všetkých dielní</button>`)});
}
{const o=window.render;window.render=function(){const r=o.apply(this,arguments);try{relabel();addBulk()}catch(e){console.warn("tok",e)}return r}}

if(!document.getElementById("tok-css")){const st=document.createElement("style");st.id="tok-css";st.textContent=`
#tokstrip{position:fixed;left:max(10px,env(safe-area-inset-left,0px));right:max(10px,env(safe-area-inset-right,0px));bottom:calc(138px + env(safe-area-inset-bottom,0px));z-index:40;background:#fff6dcf2;color:#2b2117;border:1px solid #b8862b;border-radius:10px;padding:8px 10px;display:flex;gap:8px;align-items:center;box-shadow:0 4px 14px #0006}
#tokstrip[hidden]{display:none}
#tokstrip .tokt{flex:1 1 auto;min-width:0;font-size:.9rem}#tokstrip .tokb{display:flex;gap:6px;flex:0 0 auto}
body:has(#modal:not([hidden])) #tokstrip,body.jmapon #tokstrip{display:none}
.tokl{display:inline-block;max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom}
.tokbulk{margin-bottom:8px}`;document.head.appendChild(st)}
window.TOK={next};
})();

;
