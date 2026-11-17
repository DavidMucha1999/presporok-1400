/* ==== js/prilezitost.js ==== */
/* Obchodná príležitosť jedným ťuknutím (v72): nákup, karavána s ochrankou, automatický predaj v cieli. Autor: Dávid Mucha. */
(function(){
"use strict";
const hasS=()=>{try{return !!S}catch(e){return false}};
const RES=300; /* rezerva v pokladnici, ktorú obchod nikdy neminie */
function mostAB(o){try{return!!(window.STAVBY&&(STAVBY.built(o.a,"most")||STAVBY.built(o.b,"most")))}catch(e){return false}}
function opp(){
 const p=P();if(!p||!p.lic||p.lic.length<2)return null;let best=null;
 for(const g of Object.keys(GOODS))for(const a of p.lic)for(const b of p.lic){if(a===b)continue;
  const buyP=inCity(a,()=>bp(g,p)),sellP=inCity(b,()=>sp(g,p));const m=sellP-buyP-1.5-30/CART_CAP;
  if(!best||m>best.m)best={g,a,b,m,buyP,sellP}}
 return best&&best.m>2?best:null}
/* koľko kusov sa oplatí a dá kúpiť: vozy, peniaze, zásoba na trhu, a kým zisk na kuse neklesne */
function plan(){
 const o=opp();if(!o)return{why:"Momentálne nie je žiadna výhodná príležitosť."};
 const p=P(),carts=freeCarts();if(carts<1)return{o,why:"Nemáš voľný voz. Všetky sú na ceste."};
 const clo=typeof decreeOn==="function"&&decreeOn("clo");
 let best=null;
 inCity(o.a,()=>{
  const sup=Math.max(0,Math.floor((S.mkt[o.g]?S.mkt[o.g].s:0)-1.5));
  const maxN=Math.min(carts*CART_CAP,sup);
  for(let n=1;n<=maxN;n+=(n<5?1:5)){
   const cost=simBuy(o.g,n,p),c2=Math.ceil(n/CART_CAP),fee=30*c2+(clo?0:Math.round(n*1.5*(mostAB(o)?.5:1)));
   if(cost+fee>p.money-RES)break;
   const rev=inCity(o.b,()=>simSell(o.g,n,p));const prof=rev-cost-fee;
   if(!best||prof>best.prof)best={n,cost,fee,carts:c2,rev,prof}}
 });
 if(!best||best.prof<20)return{o,why:best?"Zisk by bol príliš malý.":"Na tento obchod ti chýbajú peniaze alebo tovar na trhu (ostáva rezerva "+RES+" zl.)."};
 return{o,...best,q:travelQ(o.a,o.b)}}
function run(pl){
 const p=P(),o=pl.o;let k=0,c=0;
 inCity(o.a,()=>{const r=buy(p,o.g,pl.n,true);k=r.k;c=r.c;
  if(k<1)return;const n=k,carts=Math.ceil(n/CART_CAP),clo=typeof decreeOn==="function"&&decreeOn("clo");
  const fee=30*carts+(clo?0:Math.round(n*1.5*(mostAB(o)?.5:1)));p.money-=fee;led(p,"ine",-fee);
  p.wh[o.g]-=n;
  S.conv.push({id:S.nconv++,from:o.a,to:o.b,goods:{[o.g]:n},carts,guard:true,start:S.turn,eta:S.turn+travelQ(o.a,o.b),opp:1})});
 return{k,c}}
A.oppGo=function(){
 if(!hasS())return;const pl=plan();
 if(pl.why){queue({title:"Obchodná príležitosť",html:`<p>${pl.why}</p>`,btns:[{t:"Dobre",a:"mclose",pri:1}]});return}
 const o=pl.o,G=GOODS[o.g].n.toLowerCase(),A1=CITY(o.a).n,B1=CITY(o.b).n;
 queue({title:"Využiť príležitosť",html:`<p>Nákup: <b>${pl.n} ks · ${G}</b></p>
 <ul><li>Kúpiš v meste <b>${A1}</b> za ${zl(Math.round(pl.cost))}</li>
 <li>Karavána (${pl.carts} ${pl.carts===1?"voz":"vozy"}, s ochrankou) a clá: ${zl(pl.fee)}</li>
 <li>Dorazí do mesta <b>${B1}</b> o ${pl.q} ${pl.q===1?"štvrťrok":"štvrťroky"} a tovar sa tam <b>sám predá</b></li>
 <li>Odhadovaný zisk: <b>${pl.prof>=0?"+":""}${zl(Math.round(pl.prof))}</b></li></ul>
 <p class="muted" style="font-size:.9rem">Ceny sa môžu do príchodu zmeniť. Ochranka znižuje riziko prepadu, ale úplne ho neodstráni. V pokladnici ti ostane aspoň ${RES} zl.</p>`,
 btns:[{t:"Zrušiť",a:"mclose"},{t:"Potvrdiť obchod",a:"oppOk",pri:1}]})};
A.oppOk=function(){
 const pl=plan();closeModal(true);
 if(pl.why){toast(pl.why,"bad");render();return}
 const r=run(pl);
 if(r.k){try{SND.play("coin")}catch(e){}toast(`Kúpené ${r.k} ks za ${zl(Math.round(r.c))}. Karavána vyrazila do mesta ${CITY(pl.o.b).n}.`,"good")}
 else toast("Nákup sa nepodaril. Na trhu už nie je tovar alebo peniaze.","bad");
 render()};
/* predaj po príchode */
{const o=window.convoyTurn;
 if(typeof o==="function")window.convoyTurn=function(){
  let arr=[];try{arr=S.conv.filter(c=>c.opp&&c.eta<=S.turn).map(c=>({to:c.to,goods:Object.assign({},c.goods)}))}catch(e){}
  const r=o.apply(this,arguments);
  try{const p=P();for(const c of arr)inCity(c.to,()=>{let k=0,s=0;for(const g in c.goods){const x=sell(p,g,Math.min(c.goods[g],p.wh[g]||0),false);k+=x.k;s+=x.c}
   if(k){const np=S.noPfx;S.noPfx=1;try{msg(`Obchodná príležitosť: v meste ${CITY(c.to).n} sa predalo ${k} ks za ${zl(Math.round(s))}.`,"good")}finally{S.noPfx=np}}})}catch(e){console.warn("opp",e)}
  return r}}
/* rada s presným odhadom (počíta s tým, že ceny sa pri nákupe aj predaji hýbu) */
{const o=window.advice;
 if(typeof o==="function")window.advice=function(){const a=o.apply(this,arguments);
  try{const i=a.findIndex(x=>x&&x.ic==="⛟"&&/Obchodná príležitosť/.test(x.t));if(i<0)return a;
   const pl=plan();
   if(pl.why||pl.prof<50){a.splice(i,1);return a}
   a[i]=Object.assign({},a[i],{t:`Obchodná príležitosť: ${GOODS[pl.o.g].n.toLowerCase()} z mesta ${CITY(pl.o.a).n} do mesta ${CITY(pl.o.b).n}, ${pl.n} ks, odhad zisku +${zl(Math.round(pl.prof))} po clách a ochranke.`})}catch(e){}
  return a}}
/* tlačidlo pri rade */
function addBtn(){
 if(!hasS())return;
 document.querySelectorAll('[data-a="advgo"][data-v="trh"]').forEach(b=>{
  const box=b.parentElement;if(!box||box.querySelector('[data-a="oppGo"]'))return;
  const card=b.closest("li,.adv,.jrec,div");if(!card||!/Obchodná príležitosť/.test(card.textContent))return;
  b.insertAdjacentHTML("beforebegin",`<button class="btn sm oppb" data-a="oppGo">Využiť</button>`)})}
{const o=window.render;window.render=function(){const r=o.apply(this,arguments);try{addBtn()}catch(e){console.warn("opp",e)}return r}}
const st=document.createElement("style");st.textContent=`.oppb{margin:0 0 6px}`;document.head.appendChild(st);

/* automatický obchodník (v75): správca využije príležitosť sám, s limitom */
{const o=window.endTurn;if(typeof o==="function")window.endTurn=function(){
 try{if(hasS()&&S.auto&&S.autoTrade&&!S.over){const p=P();const lim=S.tradeLim||3000;
  if(!(S.conv||[]).some(c=>c.opp)){const pl=plan();
   if(!pl.why&&pl.prof>=50&&pl.cost+pl.fee<=lim){const r=run(pl);if(r.k)msg(`Obchodník rodu: kúpil ${r.k} ks (${GOODS[pl.o.g].n.toLowerCase()}) v meste ${CITY(pl.o.a).n} a poslal ich do mesta ${CITY(pl.o.b).n}. Odhad zisku +${zl(Math.round(pl.prof))}.`,"good")}}}}catch(e){console.warn("obchodnik",e)}
 return o.apply(this,arguments)}}
A.oppAuto=function(){S.autoTrade=!S.autoTrade;try{toast(S.autoTrade?"Obchodník využije výhodnú príležitosť sám, najviac za "+zl(S.tradeLim||3000)+" naraz.":"Obchody robíš len ty.","good")}catch(e){}render()};
A.oppLim=function(e){S.tradeLim=+e.v;render()};
function tradeCard(){
 const lim=S.tradeLim||3000;
 return`<div class="sheet oppcard"><h3>Automatický obchodník</h3>${S.auto?`<label class="uauto"><input type="checkbox" data-a="oppAuto" ${S.autoTrade?"checked":""}> Na konci štvrťroka využiť najlepšiu obchodnú príležitosť: kúpiť, poslať karavánu s ochrankou a v cieli predať. Len keď je odhad zisku aspoň 50 zl. a jedna karavána naraz.</label><div class="ubtns" style="margin-top:6px"><span class="lbl">najviac naraz</span>${[1000,3000,10000,30000].map(v=>`<button class="btn sm ${lim===v?"pri":""}" data-a="oppLim" data-v="${v}">${zl(v)}</button>`).join("")}</div>`:`<p class="muted">Najprv zapni správcu rodu. Potom môže obchodovať aj sám.</p>`}</div>`}
{const o=window.render;window.render=function(){const r=o.apply(this,arguments);try{if(hasS()&&S.view==="trh"&&P().lic&&P().lic.length>=2){const m=document.querySelector("main");if(m&&!m.querySelector(".oppcard")){const d=document.createElement("div");d.innerHTML=tradeCard();const ref=m.querySelector(":scope > .row.jsub");if(ref)ref.after(d.firstElementChild);else m.prepend(d.firstElementChild)}}}catch(e){console.warn("opp card",e)}return r}}
window.PRILEZITOST={opp,plan};
})();

;
