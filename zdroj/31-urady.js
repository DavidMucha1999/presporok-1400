/* ==== js/urady.js ==== */
/* Úrady a voľby (v74): rebríček úradov, odpočet a šanca vo voľbách, jasná kandidatúra, karta „Tvoj úrad“ s právomocami. Autor: Dávid Mucha. */
(function(){
"use strict";
const hasS=()=>{try{return !!S}catch(e){return false}};
const mode=()=>{try{return window.JEDNODUCHE?JEDNODUCHE.mode():"jedn"}catch(e){return "jedn"}};
const on=()=>hasS()&&mode()!=="vsetko";
const esc4=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const home=()=>{try{return P().city===CC().id}catch(e){return false}};
const tN=t=>TITLES[Math.min(TITLES.length-1,t)].n;
const short=t=>String(t).split(/\.\s/)[0].replace(/\.$/,"")+".";
const pct=x=>Math.round(x*100)+" %";
const myCand=()=>{const E=S.elec;if(!E)return null;const m=Object.entries(E.cand).find(([,a])=>a.includes(0));return m?m[0]:null};

/* ---------- voľby: kandidáti, postoje rodov, šanca ---------- */
function cands(id,withMe){
 const C=CC(),E=S.elec;let cs=(E&&E.cand[id]?E.cand[id]:[]).filter(c=>c!==0&&S.dyn[c]&&!S.dyn[c].gone&&S.dyn[c].title>=offT(id,C)&&S.dyn[c].city===C.id);
 if(withMe&&P().title>=offT(id,C))cs=[0].concat(cs);
 return cs}
function base(v,c){return(c===0?v.favor+(isAlly(v.id)?60:0):rel(v.id,c))+5*skill(S.dyn[c],"retorika")+6*S.dyn[c].title}
function weight(v){try{const o=officeOf(v.id);return o&&o.id==="purkmister"?2:1}catch(e){return 1}}
let cache={};
function chance(id){
 const fs=localDyn().reduce((s,d)=>s+(d.favor|0),0);
 const key=S.turn+"|"+id+"|"+fs+"|"+S.ally.length+"|"+(S.elec?JSON.stringify(S.elec.cand[id]||[]):"");
 if(cache[key])return cache[key];
 const cs=cands(id,true);
 if(!cs.includes(0))return(cache[key]={p:0,cs,st:{}});
 const voters=localDyn(),E=S.elec;
 const st={};
 for(const v of voters){if(v.id===0)continue;
  if(cs.includes(v.id)){st[v.id]=v.id===0?"za":"proti";continue}
  if(!v.ai){continue}
  const others=cs.filter(c=>c!==0);if(!others.length){st[v.id]="za";continue}
  const d=base(v,0)-Math.max(...others.map(c=>base(v,c)));
  st[v.id]=d>30?"za":d<-30?"proti":"vaha"}
 if(cs.length===1)return(cache[key]={p:1,cs,st});
 let win=0;const N=240;
 for(let i=0;i<N;i++){
  const vt={};cs.forEach(c=>vt[c]=0);
  for(const v of voters){let ch=null;
   if(cs.includes(v.id))ch=v.id;
   else if(!v.ai){const pv=E&&E.pv[id];if(pv!=null&&cs.includes(pv))ch=pv}
   else{let b=-1e9;for(const c of cs){const s=base(v,c)+Math.random()*30;if(s>b){b=s;ch=c}}}
   if(ch!=null)vt[ch]+=weight(v)}
  try{if(window.STAVBY&&STAVBY.isPatron(S.ci))vt[0]+=2}catch(e){}
  let w=cs[0];for(const c of cs){if(vt[c]>vt[w]||vt[c]===vt[w]&&skill(S.dyn[c],"retorika")>skill(S.dyn[w],"retorika"))w=c}
  if(w===0)win++}
 return(cache[key]={p:win/N,cs,st})}
function verdict(p){return p>=.8?["isto vyhráš","ok"]:p>=.55?["skôr vyhráš","ok"]:p>=.35?["tesné","mid"]:p>0?["skôr prehráš","bad"]:["nemáš šancu","bad"]}
function eligible(id){return P().title>=offT(id,CC())}
function recommend(){
 const E=S.elec;if(!E)return null;let best=null;
 for(const id of E.list){if(!eligible(id))continue;const c=chance(id).p,sc=(c>=.35?1:0)*1e6+c*offInc(id);if(!best||sc>best.sc)best={id,sc,p:c}}
 return best}
function nextElection(){
 const C=CC();if(S.elec)return{now:true};
 let mn=Math.min(...OFFICES.map(o=>S.off[o.id].end));
 let Y=Math.max(mn,S.season<2?S.year:S.year+1);
 const q=(Y-S.year)*4+2-S.season;
 return{now:false,Y,q}}
const qTxt=q=>q===1?"o 1 štvrťrok":q>=2&&q<=4?`o ${q} štvrťroky`:`o ${q} štvrťrokov`;

/* ---------- právomoci úradu ---------- */
const BASE={
 purkmister:[["oTax","Mestské dane","",0],["oFair","Vyhlásiť jarmok","Na budúci štvrťrok stúpne dopyt po výrobkoch o 60 %. Zaplatí mestská pokladnica {500} zl.",0],["oProp","Navrhnúť nariadenie rade","Rada hlasuje na konci štvrťroka. Ty máš dva hlasy.",0]],
 kapitan:[["oRaid","Razia na brlohy a pašerákov","Pokuta ide do mestskej pokladnice, ty dostaneš {100} zl. Priazeň rodu −20.","bad"]],
 sudca:[["oJudge","Rozsudok proti rodu","Pokuta 10 % majetku rodu, tebe pripadne 30 %. Priazeň rodu −25. Len raz za rok.","bad"]],
 vyberca:[["oAudit","Daňová kontrola","Polovičná šanca na pokutu, tebe pripadne pätina. Priazeň rodu −12.","bad"]],
 pisar:[["oCharter","Cechová listina","Tvoja ďalšia stavba v meste bude o 40 % lacnejšia.",0]]};
const SAFE=["oSeal","oChron","oFees","oOrder","oEmbassy","oCharter","oEscort"];
function usedKey(k){return({oAudit:"audit:"+S.turn,oRaid:"raid:"+S.turn,oJudge:"sudca:"+S.year,oTax:"tax:"+S.turn,oFair:"fair:"+S.turn,oCharter:"charter:"+S.turn})[k]||k+":"+S.turn}
function used(k){return!!(S.offUsed&&S.offUsed[usedKey(k)])}
function powers(){
 const my=officeOf(0);if(!my)return[];const C=CC(),p=P();
 const L=(BASE[my.id]||[]).map(([k,n,d,t])=>({k,n,d:otxt(d,C),t}));
 const O=(typeof OPOW!=="undefined"&&OPOW[my.id])?OPOW[my.id].act:[];
 O.forEach(([k,n,d,sel])=>L.push({k,n,d:otxt(d,C),t:sel?"good":0}));
 L.forEach(x=>{x.used=used(x.k);let why="";
  if(S.ap<1)why="Nemáš body činnosti.";
  if(x.k==="oFair"&&C.tre<500*C.tier)why="V mestskej pokladnici je málo peňazí.";
  if(x.k==="oCharter"&&p.cheap&&p.cheap[C.id])why="Listina je už vydaná.";
  if(x.k==="oProp"&&C.prop)why="O návrhu sa práve hlasuje.";
  x.why=why;x.ok=!x.used&&!why});
 return L}
function targets(t,k){
 let r=localDyn().filter(d=>d.ai&&!d.gone);
 if(k==="oRaid")r=r.filter(d=>{try{return myB(d).some(b=>(b.type==="brloh"||b.type==="pasovanie")&&b.w>0)}catch(e){return false}});
 if(t==="bad")r.sort((a,b)=>a.favor-b.favor);
 else r.sort((a,b)=>(isAlly(a.id)-isAlly(b.id))||a.favor-b.favor);
 return r}
A.uPow=function(e){
 const k=e.k;if(typeof A[k]!=="function")return;
 const sel=document.getElementById("ups-"+k);
 const arg={};if(sel){if(k==="oProp")arg.k=sel.value;else arg.d=sel.value}
 if(e.v!=null)arg.v=e.v;
 A[k](arg)};
A.uAuto=function(){S.autoPow=!S.autoPow;try{toast(S.autoPow?"Správca rodu použije bezpečné právomoci, keď ti na konci štvrťroka ostanú body.":"Právomoci používaš len ty.","good")}catch(e){}render()};
A.uApply=function(e){
 const cur=myCand(),C=CC();
 if(!eligible(e.o))return;
 if(cur&&cur!==e.o){S.__uo=e.o;queue({title:"Zmeniť kandidatúru?",html:`<p>Už kandiduješ na úrad <b>${esc4(offN(cur))}</b>. Kandidovať môžeš len na jeden úrad naraz.</p><p>Ak sa prihlásiš na <b>${esc4(offN(e.o))}</b>, prvá prihláška sa zruší a znova zaplatíš 1 bod a ${zl(50*C.tier)}.</p>`,btns:[{t:"Ponechať",a:"mclose"},{t:"Zmeniť kandidatúru",a:"uApplyGo",pri:1}]});return}
 A.apply({o:e.o})};
A.uApplyGo=function(){closeModal(true);if(S.__uo)A.apply({o:S.__uo});S.__uo=null};

/* ---------- karty ---------- */
function cardOffice(){
 const my=officeOf(0);if(!my||!home())return"";
 const C=CC(),off=S.off[my.id],L=powers(),free=L.filter(x=>x.ok).length;
 const ends=off.end===S.year?`<b>končí túto zimu</b>`:`do zimy ${off.end}`;
 const pas=(typeof OPOW!=="undefined"&&OPOW[my.id])?OPOW[my.id].pas:[];
 const warn=off.end===S.year?`<div class="uwarn">Úrad ti končí túto zimu. ${S.elec?(myCand()===my.id?"Kandiduješ znova, dobre.":`<button class="btn sm pri" data-a="uApply" data-o="${my.id}">Kandidovať znova · 1 bod, ${zl(50*C.tier)}</button>`):"Voľby sa vyhlásia na jeseň, potom sa prihlás znova."}</div>`:"";
 const row=x=>{
  let ctl="";
  if(x.used)ctl=`<span class="pill">použité</span>`;
  else if(x.k==="oTax")ctl=`<div class="utax">${[[.75,"Nízke 75 %","rody +6"],[1,"Bežné 100 %",""],[1.35,"Vysoké 135 %","rody −8"]].map(([v,n,h])=>`<button class="btn sm ${C.tax===v?"pri":""}" data-a="uPow" data-k="oTax" data-v="${v}" ${S.ap<1?"disabled":""}>${n}${h?`<small> · ${h}</small>`:""}</button>`).join("")}</div>`;
  else if(x.k==="oProp"){const E2=Object.entries(EDICTS);ctl=`<div class="urow2"><select id="ups-oProp" class="vsel" ${x.ok?"":"disabled"}>${E2.map(([k,e])=>`<option value="${k}">${esc4(e.n)}: ${esc4(e.d)}</option>`).join("")}</select><button class="btn sm pri" data-a="uPow" data-k="oProp" ${x.ok?"":"disabled"}>Navrhnúť</button></div>`}
  else if(x.t){const tg=targets(x.t,x.k);ctl=tg.length?`<div class="urow2"><select id="ups-${x.k}" class="vsel" ${x.ok?"":"disabled"}>${tg.map((d,i)=>`<option value="${d.id}">${esc4(d.name)} · priazeň ${Math.round(d.favor)}${i===0?" (odporúčam)":""}</option>`).join("")}</select><button class="btn sm ${x.t==="bad"?"red":"pri"}" data-a="uPow" data-k="${x.k}" ${x.ok?"":"disabled"}>Použiť</button></div>`:`<span class="muted">Žiadny vhodný rod.</span>`}
  else ctl=`<button class="btn sm pri" data-a="uPow" data-k="${x.k}" ${x.ok?"":"disabled"}>Použiť</button>`;
  const d=x.k==="oTax"?`Dnes ${Math.round(C.tax*100)} %. Nízke potešia rody, vysoké naplnia pokladnicu, no pohnevajú ich.`:x.d;
  return`<div class="upow ${x.used?"used":""}"><div class="upt"><b>${esc4(x.n)}</b> <span class="muted">· 1 bod</span></div><div class="upd">${esc4(d)}${x.why&&!x.used?` <i class="uwhy">${esc4(x.why)}</i>`:""}</div>${ctl}</div>`};
 return`<div class="sheet uoff"><div class="uhd"><h3>Tvoj úrad: ${esc4(offN(my.id))}</h3><span class="pill ok">${zl(offInc(my.id))} za štvrťrok</span></div>
 <p class="muted" style="margin:4px 0 6px">Obdobie ${ends}. ${pas.length?"Stále výhody: "+pas.map(esc4).join(", ")+".":""}</p>${warn}
 <p class="lbl">${free?`právomoci · ${free} ${free===1?"dostupná":free<5?"dostupné":"dostupných"} teraz, každá raz za štvrťrok`:"všetky právomoci na tento štvrťrok sú použité alebo nedostupné"}</p>
 <div class="upows">${L.map(row).join("")}</div>
 ${S.auto?`<label class="uauto"><input type="checkbox" data-a="uAuto" ${S.autoPow?"checked":""}> Správca rodu použije bezpečné právomoci (poplatky, kronika, poriadok, poselstvo…), keď ti na konci štvrťroka ostanú body. Útoky na rody nechá na teba.</label>`:""}
 </div>`}
function voterList(st){
 const g={za:[],vaha:[],proti:[]};
 Object.entries(st).forEach(([id,s])=>{const d=S.dyn[+id];if(d&&g[s])g[s].push(d)});
 const nm=a=>a.map(d=>esc4(d.name)).join(", ")||"nikto";
 return`<div class="uvot"><span class="uz">za teba: ${nm(g.za)}</span><span class="uv">váhajú: ${nm(g.vaha)}</span><span class="up">proti: ${nm(g.proti)}</span></div>`+
  ((g.vaha.length||g.proti.length)?`<p class="lbl" style="margin-top:8px">ako zlepšiť šancu</p><div class="ubtns">${g.vaha.concat(g.proti).slice(0,4).map(d=>{const n=150*CC().tier,gn=Math.round(n/(8*CC().tier)*(1+.06*skill(P(),"charizma")));return`<button class="btn sm" data-a="gift" data-d="${d.id}" data-n="${n}" ${S.ap<1||P().money<n?"disabled":""}>Dar rodu ${esc4(d.name)} · ${zl(n)} · priazeň +${gn}</button>`}).join("")}${S.vbY!==S.year+":"+CC().id?`<button class="btn sm" data-a="votesBuy" ${P().money<800*CC().tier?"disabled":""}>Pohostiť radných · ${zl(800*CC().tier)} · všetky rody +8</button>`:""}</div>`:"")}
function cardElec(){
 const C=CC(),E=S.elec,h=home();
 if(!E){const n=nextElection();
  return`<div class="sheet uel"><div class="uhd"><h3>Voľby</h3><span class="pill">${n.q>0?qTxt(n.q):"čoskoro"}</span></div><p>Najbližšie voľby sa vyhlásia na <b>jeseň ${n.Y}</b>. Prihlásiť sa dá v jeseni a v zime, hlasuje sa na konci zimy.</p><p class="muted" style="font-size:.92rem">Rody volia podľa priazne k tebe, tvojej rétoriky a titulu. Spojenci volia vždy teba. Do volieb si zlepši vzťahy s rodmi v meste.</p></div>`}
 const cur=myCand(),rec=recommend();
 let html=`<div class="sheet uel"><div class="uhd"><h3>Voľby ${E.year}</h3><span class="pill ok">prihlasovanie otvorené</span></div>
 <p class="muted" style="font-size:.92rem;margin:4px 0">Hlasuje sa na konci zimy. Kandidovať môžeš len na <b>jeden</b> úrad, len v domovskom meste. Prihláška stojí 1 bod a ${zl(50*C.tier)}.</p>`;
 if(!h)html+=`<p class="uwarn">Si mimo domovského mesta. Kandidovať môžeš len tam, kde sídli tvoj rod.</p>`;
 if(cur){const c=chance(cur),[vl,lv]=verdict(c.p);
  html+=`<div class="ucur"><b>Kandiduješ na úrad ${esc4(offN(cur))}</b><span class="uch ${lv}">${vl} · šanca asi ${pct(c.p)}</span>${voterList(c.st)}</div>`}
 else if(h&&rec)html+=`<div class="ucur"><b>Odporúčam: ${esc4(offN(rec.id))}</b> <span class="uch ${verdict(rec.p)[1]}">${verdict(rec.p)[0]} · šanca asi ${pct(rec.p)}</span><div class="ubtns"><button class="btn pri" data-a="uApply" data-o="${rec.id}" ${S.ap<1||P().money<50*C.tier?"disabled":""}>Kandidovať na ${esc4(offN(rec.id))}</button></div></div>`;
 html+=`<div class="ulist">`+E.list.map(id=>{
  const o=OF(id),el=eligible(id),c=el?chance(id):null,others=cands(id,false),mine=cur===id;
  const pv=E.pv[id];
  let right="";
  if(mine)right=`<span class="pill ok">kandiduješ</span>`;
  else if(!el)right=`<span class="pill">🔒 chýba titul ${esc4(tN(offT(id,C)))}</span>`;
  else if(h)right=`<button class="btn sm" data-a="uApply" data-o="${id}" ${S.ap<1||P().money<50*C.tier?"disabled":""}>Kandidovať · ${c?pct(c.p):""}</button>`;
  const vote=!mine&&others.length?`<div class="uvote"><span class="lbl">tvoj hlas</span>${others.map(d=>`<button class="btn sm ${pv===d?"pri":""}" data-a="vote" data-o="${id}" data-d="${d}">${esc4(S.dyn[d].name)}</button>`).join("")}<span class="muted" style="font-size:.85rem">Víťaz, ktorého podporíš, ťa obľúbi (+8), aj porazený trochu (+3).</span></div>`:"";
  return`<div class="uli"><div class="uln"><b>${esc4(offN(id))}</b> <span class="muted">· ${zl(offInc(id))}/štvrťrok</span><br><span class="muted" style="font-size:.88rem">${esc4(short(o.d))} Kandidujú: ${others.length?others.map(d=>esc4(S.dyn[d].name)).join(", "):"nikto"}.</span></div><div class="ulr">${right}</div>${vote}</div>`}).join("")+`</div></div>`;
 return html}
function cardLadder(){
 const C=CC(),E=S.elec,n=E?null:nextElection();
 return`<div class="sheet ulad"><h3>Úrady mesta</h3><div class="ulist">${OFFICES.map(o=>{
  const off=S.off[o.id],hd=off.h,d=hd!=null?S.dyn[hd]:null,el=eligible(o.id);
  let st;
  if(hd===0)st=`<span class="pill ok">tvoj úrad</span>`;
  else if(!el)st=`<span class="pill">🔒 ${esc4(tN(offT(o.id,C)))}</span>`;
  else if(E&&E.list.includes(o.id))st=`<span class="pill ok">✅ môžeš kandidovať</span>`;
  else st=`<span class="pill">voľby ${off.end<=S.year?(n?n.Y:S.year):off.end}</span>`;
  return`<div class="uli"><div class="uln"><b>${esc4(offN(o.id))}</b> <span class="muted">· ${zl(offInc(o.id))}/štvrťrok</span><br><span class="muted" style="font-size:.88rem">${esc4(short(o.d))} ${d?`Drží ${d.id===0?"tvoj rod":"rod "+esc4(d.name)} do zimy ${off.end}.`:"Neobsadený."}</span></div><div class="ulr">${st}</div></div>`}).join("")}</div></div>`}

/* ---------- vloženie do Radnice ---------- */
function apply(){
 if(!on())return;
 const main=document.querySelector("main");if(!main)return;
 if(S.view==="radnica"&&!main.querySelector(".uoff,.uel")){
  main.querySelectorAll(".vmain").forEach(x=>x.remove());
  main.querySelectorAll(".powsheet").forEach(x=>x.remove());
  main.querySelectorAll(".sheet").forEach(s=>{const h=s.querySelector(":scope > h3, :scope > .row h3");if(h&&/^Tvoj úrad:/.test(h.textContent.trim()))s.remove()});
  [...main.querySelectorAll(".vgrp")].filter(g=>{const h=g.querySelector(".vgh h3");return h&&/^Voľby/.test(h.textContent.trim())}).forEach(g=>g.remove());
  [...main.querySelectorAll(".sheet")].filter(s=>{const h=s.querySelector("h3");return h&&/^Voľby/.test(h.textContent.trim())&&!s.classList.contains("uel")}).forEach(s=>s.remove());
  const box=document.createElement("div");box.className="ubox";box.innerHTML=cardOffice()+cardElec()+(S.elec?"":cardLadder());
  const ref=main.querySelector(".vhall")||main.querySelector(".jvplyv");
  if(ref)ref.after(box);else main.prepend(box)}
 if(S.view==="rody"&&S.elec&&home()){
  const id=myCand()||(recommend()||{}).id;if(!id)return;const st=chance(id).st;
  main.querySelectorAll(".grid-cards .sheet.bcard").forEach(c=>{
   if(c.dataset.vu)return;c.dataset.vu="1";const h=c.querySelector("h3");if(!h)return;
   const nm=h.textContent.replace(/^[+\-−\d\s]+/,"").replace(/[▸▾]/g,"").trim().replace(/^Rod\s+/,"");
   const d=S.dyn.find(x=>x.name===nm&&!x.gone);if(!d||!st[d.id])return;
   const s=document.createElement("span");s.className="uvp "+st[d.id];s.textContent=st[d.id]==="za"?"volí ťa":st[d.id]==="proti"?"proti tebe":"váha";
   s.title="Voľby: "+offN(id);h.appendChild(s)})}
}
{const o=window.render;window.render=function(){const r=o.apply(this,arguments);try{apply()}catch(e){console.warn("urady",e)}return r}}

/* ---------- rady a pripomienky ---------- */
{const o=window.advice;
 if(typeof o==="function")window.advice=function(){const a=o.apply(this,arguments);
  try{if(!hasS()||!home())return a;
   const my=officeOf(0);
   if(my){const L=powers().filter(x=>x.ok&&!(S.auto&&S.autoPow&&SAFE.includes(x.k)));
    if(L.length&&S.ap>=1)a.push({pr:6,ic:"⚖",t:`Máš nevyužité právomoci úradu ${offN(my.id).toLowerCase()} (${L.length}). Na konci štvrťroka prepadnú.`,v:"radnica",lbl:"Radnica"});
    if(S.off[my.id].end===S.year&&S.elec&&myCand()!==my.id)a.push({pr:8,ic:"⚖",t:`Tvoj úrad ${offN(my.id).toLowerCase()} končí túto zimu. Prihlás sa znova vo voľbách.`,v:"radnica",lbl:"Radnica"})}
   if(S.elec&&!myCand()){const r=recommend();if(r)a.push({pr:7,ic:"⚖",t:`Voľby sú otvorené: môžeš kandidovať na úrad ${offN(r.id).toLowerCase()} (šanca asi ${pct(r.p)}).`,v:"radnica",lbl:"Radnica"})}
   a.sort((x,y)=>y.pr-x.pr)}catch(e){console.warn("urady adv",e)}
  return a}}

/* ---------- správca použije bezpečné právomoci ---------- */
{const o=window.endTurn;
 if(typeof o==="function")window.endTurn=function(){
  try{if(hasS()&&S.auto&&S.autoPow&&!S.over){const p=P();inCity(p.city,()=>{const my=officeOf(0);if(!my)return;const done=[];
   for(const x of powers()){if(S.ap<1)break;if(!x.ok||!SAFE.includes(x.k))continue;if(x.k==="oEscort"&&!(S.conv||[]).length)continue;
    const ap0=S.ap;try{const r0=window.render;window.render=()=>{};try{A[x.k]({})}finally{window.render=r0}}catch(e){}if(S.ap<ap0)done.push(x.n.toLowerCase())}
   if(done.length)msg("Správca rodu použil právomoci úradu: "+done.join(", ")+".","good")})}}catch(e){console.warn("urady auto",e)}
  return o.apply(this,arguments)}}

const st=document.createElement("style");st.textContent=`
.ubox{display:flex;flex-direction:column;gap:inherit}
.uhd{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}.uhd h3{margin:0}
.uoff{border:2px solid #d6aa4c!important}
.uwarn{background:#c43a2f1a;border:1px solid #c43a2f66;border-radius:8px;padding:8px 10px;margin:6px 0;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.upows{display:flex;flex-direction:column;gap:0}
.upow{padding:10px 0;border-top:1px solid #8a6a3a33;display:flex;flex-direction:column;gap:6px}
.upow.used{opacity:.6}
.upd{font-size:.92rem}.uwhy{color:#9a3b2f;font-style:italic}
.urow2{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.urow2 .vsel{flex:1 1 180px;min-width:0}
.utax{display:flex;gap:6px;flex-wrap:wrap}.utax small{opacity:.8}
.uauto{display:flex;gap:8px;align-items:flex-start;font-size:.9rem;margin-top:8px;padding-top:8px;border-top:1px solid #8a6a3a33}
.uauto input{width:20px;height:20px;flex:0 0 auto;margin-top:2px}
.ucur{background:rgba(214,170,76,.16);border:1px solid #d6aa4c;border-radius:8px;padding:10px;margin:8px 0;display:flex;flex-direction:column;gap:6px}
.uch{font-weight:600;font-size:.95rem}.uch.ok{color:#2f7a3a}.uch.mid{color:#9a6a12}.uch.bad{color:#a33a2f}
.uvot{display:flex;flex-direction:column;gap:2px;font-size:.9rem}.uz::before,.uv::before,.up::before{content:"";display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px}
.uz::before{background:#3a9a4a}.uv::before{background:#e2a81f}.up::before{background:#c43a2f}
.ubtns{display:flex;gap:6px;flex-wrap:wrap}
.ulist{display:flex;flex-direction:column}
.uli{display:grid;grid-template-columns:1fr auto;gap:6px 10px;align-items:center;padding:10px 0;border-top:1px solid #8a6a3a33}
.uln{min-width:0}.ulr{justify-self:end}
.uvote{grid-column:1/-1;display:flex;gap:6px;flex-wrap:wrap;align-items:center}

.uvp{display:inline-block;margin-left:8px;font-size:.78rem;font-family:"EB Garamond",Georgia,serif;padding:1px 7px;border-radius:10px;vertical-align:middle;color:#fff}
.uvp.za{background:#3a8a44}.uvp.vaha{background:#b8860b}.uvp.proti{background:#b23a2f}
`;document.head.appendChild(st);
window.URADY={chance,recommend,nextElection,powers};
})();

;
