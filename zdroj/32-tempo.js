/* ==== js/tempo.js ==== */
/* Tempo hry (v75): ciele, veľké kroky s odhadom času, investovanie prebytku, porovnanie so súpermi, jednoduchšie Mesto,
   voľné pozemky, Tento rok v číslach, súhrn roka, sprievodca začiatkom, pojmy, rodina na autopilote, prehľadnejšie udalosti. Autor: Dávid Mucha. */
(function(){
"use strict";
const hasS=()=>{try{return !!S}catch(e){return false}};
const mode=()=>{try{return window.JEDNODUCHE?JEDNODUCHE.mode():"jedn"}catch(e){return "jedn"}};
const on=()=>hasS()&&mode()!=="vsetko";
const phone=()=>false;
const E5=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const qTxt=q=>q<=0?"teraz":q===1?"o 1 štvrťrok":q<=4?`o ${q} štvrťroky`:q<=8?`o ${q} štvrťrokov`:(y=>y===1?"o 1 rok":y<=4?`o ${y} roky`:`o ${y} rokov`)(Math.round(q/4));
function ttl(sh){const h=sh.querySelector("h2,h3");if(!h)return"";const c=h.cloneNode(true);c.querySelectorAll("button,.pill").forEach(x=>x.remove());return c.textContent.replace(/[▸▾]/g,"").replace(/\s+/g," ").trim()}

/* ---------- čísla ---------- */
function income(){const W=S.wealth||[];if(W.length<2)return 0;const k=Math.min(4,W.length-1);return(W[W.length-1].m-W[W.length-1-k].m)/k}
function eta(cost){const p=P(),m=p.money-(p.debt||0);if(m>=cost)return 0;const inc=income();if(inc<=0)return Infinity;return Math.ceil((cost-m)/inc)}
function rivals(){const p=P();return S.dyn.filter(d=>!d.royal&&!d.gone&&d.city===p.city)}
function ranks(){const R=rivals(),p=P();const w=[...R].sort((a,b)=>netWorth(b)-netWorth(a)),f=[...R].sort((a,b)=>prestige(b)-prestige(a));return{w:w.indexOf(p)+1,f:f.indexOf(p)+1,n:R.length,wTop:w,fTop:f}}
function overtake(){
 const W=S.wealth||[];if(W.length<5)return null;const k=Math.min(8,W.length-1),a=W[W.length-1-k],b=W[W.length-1];
 const g1=(b.n-a.n)/k,g2=(b.r-a.r)/k;const p=P();const others=rivals().filter(d=>d!==p).sort((x,y)=>netWorth(y)-netWorth(x));const top=others[0];if(!top)return null;
 const me=netWorth(p),rv=netWorth(top);
 if(rv<me&&g2>g1){const q=(me-rv)/(g2-g1);if(q<40)return{t:`Rod ${top.name} rastie rýchlejšie a predbehne ťa asi ${qTxt(Math.ceil(q))}, ak nič nezmeníš.`,lv:"bad"}}
 if(rv>me&&g1>g2){const q=(rv-me)/(g1-g2);if(q<60)return{t:`Rod ${top.name} predbehneš asi ${qTxt(Math.ceil(q))}.`,lv:"ok"}}
 if(rv>me)return{t:`Rod ${top.name} je bohatší o ${zl(Math.round(rv-me))}.`,lv:"mid"};
 return{t:`Si najbohatší rod v meste. Rod ${top.name} je druhý.`,lv:"ok"}}

/* ---------- veľké kroky ---------- */
function bigSteps(){
 const p=P(),out=[];
 const nt=TITLES[p.title+1];
 if(nt&&p.title+1<11){const ok=titleOK(p);if(ok.ok||!/sídl|dom|Potre/i.test(ok.why||""))out.push({ic:"🛡",n:`Titul ${nt.n}`,c:nt.c,btn:ok.ok&&p.money>=nt.c?`<button class="btn sm pri" data-a="title">Kúpiť</button>`:"",why:ok.ok?"":ok.why})}
 const h=HOUSES[p.house+1];if(h)out.push({ic:"🏠",n:`Sídlo: ${h.n}`,c:h.c,btn:p.money>=h.c?`<button class="btn sm pri" data-a="house">Postaviť</button>`:"",why:nt&&p.title+1<11&&p.house<nt.h?`Bez neho nedostaneš titul ${nt.n}.`:""});
 try{const L=CITY_DEF.map((D,i)=>({D,i})).filter(x=>!p.lic.includes(x.i)&&x.D.req<=p.title).sort((a,b)=>a.D.lic-b.D.lic)[0];
  if(L)out.push({ic:"🗺",n:`Obchodné právo: ${L.D.n}`,c:L.D.lic,btn:p.money>=L.D.lic?`<button class="btn sm pri" data-a="lic" data-c="${L.i}">Kúpiť</button>`:""})}catch(e){}
 try{const SB=window.STAVBY,cid=S.ci;const ids=SB?SB.avail(cid).filter(id=>!SB.built(cid,id)):[];const w=ids.map(id=>({id,n:WORKS.find(x=>x.id===id).n,c:SB.cost(id,cid),pr:SB.fame(id,cid)})).sort((a,b)=>a.c-b.c)[0];
  if(w&&p.title>=2&&hasLic(cid))out.push({ic:"🏛",n:`${w.n} (${CITY(cid).n})`,c:w.c,extra:`sláva +${w.pr}`,btn:p.money>=w.c?`<button class="btn sm pri" data-a="work" data-k="${w.id}" data-c="${cid}">Postaviť</button>`:""})}catch(e){}
 out.forEach(x=>x.q=eta(x.c));
 return out.sort((a,b)=>a.c-b.c).slice(0,3)}
function surplus(){
 const p=P(),inc=Math.max(0,income());if(p.money<Math.max(3000,3*inc))return"";
 const ch=1+.06*skill(p,"charizma");
 const gift=[25000,8000,2000,500].find(n=>n<=p.money*.3);
 const w=(()=>{try{const SB=window.STAVBY,cid=S.ci;if(!SB||!hasLic(cid))return null;return SB.avail(cid).filter(id=>!SB.built(cid,id)).map(id=>{const x=WORKS.find(y=>y.id===id);return{id,n:x.n,c:SB.cost(id,cid),pr:SB.fame(id,cid),fav:x.fav}}).filter(x=>x.c<=p.money*.6).sort((a,b)=>b.pr-a.pr)[0]}catch(e){return null}})();
 const free=myBall(p).length<maxB(p);
 const opt=[];
 opt.push(`<div class="topt"><b>Zisk</b><span>${free?"Postav ďalšiu dielňu. Dobrá dielňa sa vráti asi za 4–6 štvrťrokov.":"Vylepši dielne, zvýši to výrobu."}</span><button class="btn sm" data-a="tab" data-v="dielne">Dielne</button></div>`);
 if(gift&&S.king!==0)opt.push(`<div class="topt"><b>Moc</b><span>Dar kráľovi ${zl(gift)}: priazeň kráľa +${Math.max(1,Math.round(gift/(150+p.title*120)*ch))}.</span><button class="btn sm" data-a="rgift" data-n="${gift}">Darovať</button></div>`);
 if(w)opt.push(`<div class="topt"><b>Sláva</b><span>${E5(w.n)} za ${zl(w.c)}: sláva +${w.pr}${w.fav?`, priazeň rodov +${w.fav}`:""}.</span><button class="btn sm" data-a="work" data-k="${w.id}" data-c="${S.ci}">Postaviť</button></div>`);
 return`<div class="tsub"><p class="lbl">máš prebytok ${zl(Math.round(p.money))} · kam s ním?</p>${opt.join("")}</div>`}
function goalsNear(){
 const p=P();S.goals=S.goals||{};
 return GOALS.filter(g=>!S.goals[g.id]).map(g=>{let pr=[0,1];try{pr=g.pr(p)}catch(e){}return{g,pr,pc:Math.max(0,Math.min(1,pr[0]/pr[1]))}}).sort((a,b)=>b.pc-a.pc).slice(0,3)}
function cardGoals(){
 const p=P(),R=ranks(),ov=overtake(),G=goalsNear(),B=bigSteps();
 const show=p.title>=1||p.money>=3000;
 return`<div class="sheet tgoal"><div class="thd"><h3>Ciele rodu</h3><span class="pill">${R.w}. najbohatší · ${R.f}. najslávnejší z ${R.n}</span></div>
 ${ov?`<p class="tov ${ov.lv}">${E5(ov.t)}</p>`:""}
 ${G.length?`<p class="lbl">najbližšie pečate</p>${G.map(x=>`<div class="tgr"><div class="tgn"><b>${E5(x.g.n)}</b><span class="muted">${E5(x.g.d)}</span></div><div class="tmeter"><i style="width:${Math.round(x.pc*100)}%"></i></div><span class="tgv">${x.pr[0]}/${x.pr[1]}</span></div>`).join("")}`:""}
 ${show&&B.length?`<p class="lbl" style="margin-top:10px">ďalší veľký krok</p>${B.map(x=>`<div class="tbig"><span class="tic">${x.ic}</span><div class="tbn"><b>${E5(x.n)}</b><span class="muted">${zl(x.c)}${x.extra?" · "+x.extra:""} · ${x.q===0?"<b class='good'>máš na to</b>":x.q===Infinity?"pri terajšom príjme ďaleko":"<b>"+qTxt(x.q)+"</b>"}${x.why?" · "+E5(x.why):""}</span>${x.q!==0&&x.q!==Infinity?`<div class="tmeter sm"><i style="width:${Math.round(Math.min(1,Math.max(0,p.money)/x.c)*100)}%"></i></div>`:""}</div>${x.btn||""}</div>`).join("")}`:""}
 ${surplus()}
 </div>`}

/* ---------- sprievodca začiatkom ---------- */
window.guideSteps=()=>guideSteps();function guideSteps(){
 const p=P();const bs=myBall(p);
 return[
  ["Vlastni dielňu",bs.length>0,"dielne","Dielne"],
  ["Najmi robotníkov",bs.some(b=>b.w>0),"dielne","Dielne"],
  ["Zapni správcu rodu",!!S.auto,null,null],
  ["Kúp titul Mešťan",p.title>=1,"rod","Rod"],
  ["Obchodné právo v druhom meste",p.lic.length>=2,"svet","Svet"],
  ["Získaj mestský úrad",!!officeOf(0),"radnica","Radnica"]]}
function cardGuide(){
 if(S.guideOff)return"";const st=guideSteps(),done=st.filter(x=>x[1]).length;
 if(done===st.length||S.year>=(S.startY||1400)+4)return"";
 const nx=st.find(x=>!x[1]);
 return`<div class="sheet tguide"><div class="thd"><h3>Prvé kroky rodu</h3><span class="pill">${done} z ${st.length}</span></div>
 <ol class="tsteps">${st.map(x=>`<li class="${x[1]?"done":x===nx?"next":""}">${x[1]?"✓ ":""}${E5(x[0])}</li>`).join("")}</ol>
 <div class="ubtns">${nx?(nx[2]?`<button class="btn sm pri" data-a="tab" data-v="${nx[2]}">Ďalší krok: ${E5(nx[3])}</button>`:`<button class="btn sm pri" data-a="autoT">Zapnúť správcu rodu</button>`):""}<button class="btn sm ghost" data-a="tGuideOff">Skryť</button></div></div>`}
A.tGuideOff=function(){S.guideOff=1;render()};

/* ---------- jednoduchšie Mesto ---------- */
function isOpenG(k,def){const v=(S.vOpen||{})[k];return v==null?!!def:!!v}
function group(main,key,title,rx,def){
 const found=[...main.querySelectorAll(".sheet")].filter(s=>!(s.parentElement&&s.parentElement.closest(".sheet"))&&!s.classList.contains("vgrp")&&rx.some(r=>r.test(ttl(s))));
 if(!found.length)return;const op=isOpenG(key,def);
 const g=document.createElement("div");g.className="sheet vgrp"+(op?" open":"");
 g.innerHTML=`<div class="vgh"><h3>${E5(title)}</h3><button type="button" class="btn ghost sm" data-a="vtog" data-k="${E5(key)}" data-d="${def?1:0}" aria-expanded="${op}">${op?"Skryť":"Zobraziť"}</button></div><div class="vgb"${op?"":" hidden"}></div>`;
 found[0].parentElement.insertBefore(g,found[0]);const b=g.querySelector(".vgb");found.forEach(s=>b.appendChild(s))}
if(typeof A.vtog!=="function")A.vtog=function(e){S.vOpen=S.vOpen||{};S.vOpen[e.k]=!isOpenG(e.k,e.d==="1");render()};
function mesto(main){
 main.querySelectorAll(":scope > .jumpbar").forEach(x=>x.remove());
 if(!main.querySelector(".tgoal")){const t=main.querySelector(".jtask");const box=document.createElement("div");box.innerHTML=cardGuide()+cardGoals();[...box.children].reverse().forEach(c=>{if(t)t.after(c);else main.prepend(c)})}
 if(phone()&&!main.querySelector(".vgrp")){
  const C=CC();S.mfInit=S.mfInit||{};const k="mesto:Okolie mesta "+C.n;if(!S.mfInit[k]){S.mfInit[k]=1;S.fold=S.fold||{};if(S.fold[k]==null){S.fold[k]=true;setTimeout(()=>render(),0)}}
  group(main,"mesto:Život v meste","Život v meste",[new RegExp("^"+C.n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"$"),/^Sláva rodov/,/^Kronika$/,/^Známi ľudia/],false);
  group(main,"mesto:Hry v krčme","Hry v krčme",[/^Hry v krčme/],false)}
 lotsBtn(main)}
/* voľné pozemky ako zoznam */
function lotsBtn(main){
 const ms=main.querySelector(".mapsheet");if(!ms||ms.querySelector(".tlots"))return;
 let L=[];try{L=S.lots.filter(l=>!l.pub&&l.b==null&&l.res==null)}catch(e){}
 const d=document.createElement("div");d.className="tlots";
 const op=!!S.tLotsOpen;
 d.innerHTML=`<button type="button" class="btn sm" data-a="tLots">${op?"Skryť zoznam":"Voľné pozemky ("+L.length+")"}</button>${op?`<div class="tlist">${L.length?L.slice(0,24).map(l=>`<button type="button" class="btn sm ghost ${S.sel===l.id?"pri":""}" data-a="tLot" data-l="${l.id}">Pozemok ${String.fromCharCode(65+l.r)}${l.c+1}</button>`).join(""):'<span class="muted">V meste nie je voľný pozemok.</span>'}</div>`:""}`;
 ms.appendChild(d)}
A.tLots=function(){S.tLotsOpen=!S.tLotsOpen;render()};
A.tLot=function(e){try{A.lot({l:e.l})}catch(x){}setTimeout(()=>{const t=document.querySelector(".lotpanel,.selpanel,.lotinfo,[data-a='build']");if(t)t.scrollIntoView({block:"center",behavior:"smooth"})},60)};

/* ---------- Tento rok v číslach + graf majetku ---------- */
function yearStats(){
 const W=S.wealth||[];if(W.length<2)return null;const y=S.year;
 const ix=W.findIndex(w=>/ (\d+)$/.test(w.lab)&&+w.lab.match(/ (\d+)$/)[1]===y);
 const a=W[Math.max(0,ix>0?ix-1:ix<0?W.length-2:0)],b=W[W.length-1];
 return{dn:b.n-a.n,dm:b.m-a.m,n:b.n,r:b.r}}
function chart(){
 const W=(S.wealth||[]).slice(-40);if(W.length<3)return"";
 const w=320,h=120,pad=4,mx=Math.max(1,...W.map(x=>Math.max(x.n,x.r)));
 const X=i=>pad+i*(w-2*pad)/(W.length-1),Y=v=>h-pad-(Math.max(0,v)/mx)*(h-2*pad);
 const line=k=>W.map((x,i)=>`${i?"L":"M"}${X(i).toFixed(1)},${Y(x[k]).toFixed(1)}`).join("");
 return`<figure class="tchart"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Majetok tvojho rodu a najbohatšieho súpera"><path d="${line("r")}" class="tr"/><path d="${line("n")}" class="tn"/></svg>
 <figcaption><span class="lg n">tvoj rod ${zl(Math.round(W[W.length-1].n))}</span><span class="lg r">najbohatší súper ${zl(Math.round(W[W.length-1].r))}</span><span class="muted">${E5(W[0].lab)} – ${E5(W[W.length-1].lab)}</span></figcaption></figure>`}
function cardYear(){
 const st=yearStats();if(!st)return"";const R=ranks(),inc=income();
 const c=(v)=>`<b class="${v>=0?"good":"bad"}">${v>=0?"+":""}${zl(Math.round(v))}</b>`;
 return`<div class="sheet tyear"><h3>Rok ${S.year} v číslach</h3><div class="tnum"><div><span class="lbl">majetok spolu</span>${c(st.dn)}</div><div><span class="lbl">pokladnica</span>${c(st.dm)}</div><div><span class="lbl">príjem za štvrťrok</span>${c(inc)}</div><div><span class="lbl">poradie v meste</span><b>${R.w}. bohatstvo · ${R.f}. sláva</b></div></div>${chart()}</div>`}

/* ---------- súhrn roka ---------- */
function yearSummary(y){
 const W=S.wealth||[];const R=ranks();
 const ys=W.filter(w=>/ (\d+)$/.test(w.lab)&&+w.lab.match(/ (\d+)$/)[1]===y);
 const a=ys[0],b=ys[ys.length-1];
 const dn=a&&b?b.n-a.n:0;
 const seals=(GOALS||[]).filter(g=>S.goals&&S.goals[g.id]===y).map(g=>g.n);
 const prev=S.tRank||{};S.tRank={w:R.w,f:R.f};
 const mv=(k,l)=>prev[k]?(R[k]<prev[k]?`↑ ${l}: ${R[k]}. miesto (predtým ${prev[k]}.)`:R[k]>prev[k]?`↓ ${l}: ${R[k]}. miesto (predtým ${prev[k]}.)`:`${l}: ${R[k]}. miesto`):`${l}: ${R[k]}. miesto`;
 return{title:`Rok ${y} v kronike rodu`,html:`<p>Majetok rodu ${dn>=0?"vzrástol":"klesol"} o <b>${zl(Math.abs(Math.round(dn)))}</b>.</p><ul><li>${mv("w","Bohatstvo")}</li><li>${mv("f","Sláva")}</li>${seals.length?`<li>Nové pečate: ${seals.map(E5).join(", ")}</li>`:""}${officeOf(0)?`<li>Úrad: ${E5(offN(officeOf(0).id))}</li>`:""}</ul>${(()=>{const o=overtake();return o?`<p class="muted">${E5(o.t)}</p>`:""})()}`}}
{const o=window.endTurn;if(typeof o==="function")window.endTurn=function(){
 const y0=hasS()?S.year:0;
 /* rodina na autopilote: s bodmi, ktoré ostali */
 try{if(hasS()&&S.auto&&S.autoFam&&!S.over)fam()}catch(e){console.warn("fam",e)}
 const r=o.apply(this,arguments);
 try{if(hasS()&&!S.over&&S.year>y0){if(!S.startY)S.startY=y0;queue(yearSummary(y0))}}catch(e){console.warn("rok",e)}
 return r}}

/* ---------- rodina na autopilote ---------- */
function fam(){
 const p=P();const done=[];
 for(const k of p.kids.filter(k=>!k.dead&&k.age>=6&&(k.edu||0)<3&&!k.spouse)){
  if(S.ap<1||p.money<450)break;const a0=S.ap;const r0=window.render;window.render=()=>{};try{A.edu({k:k.id})}catch(e){}finally{window.render=r0}if(S.ap<a0)done.push(k.name)}
 if(done.length)msg(`Správca rodu poslal na výchovu: ${done.join(", ")}.`,"good")}
function bestMatch(){
 const p=P();const kids=p.kids.filter(k=>!k.dead&&!k.spouse&&k.age>=16&&k.age<=40);if(!kids.length)return null;let best=null;
 for(const kid of kids)for(const d of S.dyn.filter(x=>x.ai&&!x.gone&&!x.royal&&x.city===p.city))for(const k of(d.kids||[]).filter(x=>!x.dead&&!x.spouse&&x.age>=16&&x.gender!==kid.gender)){
  const ch=Math.max(8,Math.min(95,40+d.favor/2+skill(p,"charizma")*3-(d.title-p.title)*10));
  const sc=ch+d.title*8+(isAlly(d.id)?10:0);if(!best||sc>best.sc)best={kid,d,k,ch,sc}}
 return best}
function cardFam(){
 const m=bestMatch();
 const tog=S.auto?`<label class="uauto"><input type="checkbox" data-a="tFam" ${S.autoFam?"checked":""}> Rodina na autopilote: správca pošle deti na výchovu (1 bod, 150 zl.), keď ti na konci štvrťroka ostanú body. Sobáše ti len navrhne.</label>`:`<p class="muted" style="font-size:.9rem">Keď zapneš správcu rodu, môže sa starať aj o výchovu detí.</p>`;
 return`<div class="sheet tfam"><h3>Rodina</h3>${m?`<div class="ucur"><b>Návrh sobáša: ${E5(m.kid.name)} (${m.kid.age} r.) a ${E5(m.k.name)} z rodu ${E5(m.d.name)}</b><span class="muted">${E5(TITLES[m.d.title].n)} · priazeň ${Math.round(m.d.favor)} · šanca, že prijmú, asi ${Math.round(m.ch)} %</span><div class="ubtns"><button class="btn sm pri" data-a="kidwed" data-kid="${m.kid.id}" data-d="${m.d.id}" data-k="${m.k.id}" ${S.ap<1?"disabled":""}>Navrhnúť sobáš · 1 bod</button></div></div>`:""}${tog}</div>`}
A.tFam=function(){S.autoFam=!S.autoFam;try{toast(S.autoFam?"Správca sa postará o výchovu detí.":"Výchovu riadiš ty.","good")}catch(e){}render()};

/* ---------- pojmy ---------- */
const POJMY=[["Pokladnica","Peniaze rodu. Zelené číslo vedľa je odhad zisku za štvrťrok."],["Body činnosti","Koľko vecí stihneš za štvrťrok (najímanie, dary, kandidatúra…). Obnovia sa na začiatku ďalšieho štvrťroka. Viac ich dáva manželstvo, lepšie sídlo, úrad pisára a vyšší titul."],["Priazeň kráľa (♛)","Ako ťa vidí kráľ. Zvyšujú ju dary, audiencia a poselstvo. Treba ju na vysoké tituly a dvor v Londýne."],["Priazeň rodu","Vzťah iného rodu k tebe od −100 do +100. Zelená: priateľ, žltá: neutrálny, červená: nepriateľ. Rody s vysokou priazňou ťa volia a posielajú dary."],["Sláva","Súčet titulu, sídla, úradov, dielní, majetku a veľkých diel. Určuje poradie rodov."],["Titul","Spoločenské postavenie. Vyšší titul odomyká úrady, väčšie mestá a sobáše s mocnejšími rodmi. Väčšina titulov vyžaduje aj lepšie sídlo."],["Správca rodu","Na konci štvrťroka sám zvolí najlepšiu výrobu, najme či prepustí robotníkov a podľa nastavenia obchoduje, používa právomoci úradu a vychováva deti."],["Štvrťrok","Jedno kolo hry: jar, leto, jeseň, zima. Voľby sa vyhlasujú na jeseň a rozhodujú na konci zimy."]];
A.tPojmy=function(){queue({title:"Pojmy v hre",html:`<dl class="tdl">${POJMY.map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join("")}</dl>`})};
{const q=window.queue;if(typeof q==="function")window.queue=function(m){try{if(m&&m.title==="Ponuka"&&typeof m.html==="string"&&m.html.indexOf('data-a="tPojmy"')<0){const k='<button class="gm-b" data-a="settings">';const add=`<button class="gm-b" data-a="tPojmy"><span>Vysvetlenie pojmov</span></button>`;if(m.html.indexOf(k)>=0)m=Object.assign({},m,{html:m.html.replace(k,add+k)})}}catch(e){}return q.call(this,m)}}

/* ---------- prehľadnejšie udalosti ---------- */
function updCount(){try{const box=document.getElementById("modal");if(!box||box.hidden)return;
  const rest=MQ.filter(m=>!isBig(m)).length;const h=document.querySelector("#mbody > h2");
  if(h){let s=h.querySelector(".tcnt");if(MQ.length){if(!s){s=document.createElement("span");s.className="tcnt";h.appendChild(s)}s.textContent=`ešte ${MQ.length}`}else if(s)s.remove()}
  const f=document.getElementById("mfoot");if(!f)return;let b=f.querySelector('[data-a="tRest"]');
  if(rest>=2&&!box.dataset.lock){if(!b){f.insertAdjacentHTML("afterbegin",`<button class="btn ghost" data-a="tRest"></button>`);b=f.querySelector('[data-a="tRest"]')}b.textContent=`Drobné správy neskôr (${rest})`}else if(b)b.remove()}catch(e){}}
{const o=window.nextModal;if(typeof o==="function")window.nextModal=function(){const r=o.apply(this,arguments);updCount();return r}}
{const q=window.queue;if(typeof q==="function")window.queue=function(){const r=q.apply(this,arguments);updCount();return r}}
A.tRest=function(){try{const keep=MQ.filter(m=>isBig(m)),rest=MQ.filter(m=>!isBig(m));LATER=LATER.concat(rest).slice(-30);MQ.length=0;keep.forEach(m=>MQ.push(m));toast(`${rest.length} správ si prečítaš neskôr cez „čo ťa čaká“.`,"good")}catch(e){}closeModal(true);render()};

/* ---------- ⏩ Rok sa zastaví pri voľbách ---------- */
{const o=window.openElection;if(typeof o==="function")window.openElection=function(){const r=o.apply(this,arguments);
 try{const p=P();if(S.elec&&S.ci===p.city&&S.elec.list.some(id=>p.title>=offT(id,CC())))queue({title:"Voľby na radnici",html:`<p>Radnica vyhlásila voľby. Prihlásiť sa môžeš v jeseni a v zime, hlasuje sa na konci zimy.</p><p class="muted">Na Radnici uvidíš svoju šancu a ktoré rody ťa volia.</p>`,btns:[{t:"Neskôr",a:"mclose"},{t:"Na radnicu",a:"tGoRad",pri:1}]})}catch(e){}
 return r}}
A.tGoRad=function(){closeModal(true);A.tab({v:"radnica"})};

/* ---------- poradie vo Vplyve ---------- */
function vplyvRank(main){const r=main.querySelector(".jvrow");if(!r||r.querySelector(".trk"))return;const R=ranks();const s=document.createElement("span");s.className="trk";s.innerHTML=`🏅 <b>${R.f}.</b> v slávе`.replace("slávе","sláve");r.appendChild(s)}

/* ---------- vloženie ---------- */
function apply(){
 if(!on())return;const main=document.querySelector("main");if(!main)return;
 const v=S.view;
 if(v==="mesto")try{mesto(main)}catch(e){console.warn("tempo mesto",e)}
 if(v==="kronika")try{const jb=main.querySelector(":scope > .jumpbar");if(jb){jb.querySelectorAll(":scope > .bookbar, :scope > .ksearch").forEach(x=>jb.before(x));jb.remove()}}catch(e){}
 if(v==="kronika"&&!main.querySelector(".tyear"))try{const h=cardYear();if(h){const d=document.createElement("div");d.innerHTML=h;const st=main.querySelector(":scope > .stack")||main;st.prepend(d.firstElementChild)}}catch(e){console.warn("tempo rok",e)}
 if(v==="rod"&&!main.querySelector(".tfam"))try{const d=document.createElement("div");d.innerHTML=cardFam();const ref=main.querySelector(".todopanel")||main.querySelector(".rodhead");if(ref)ref.after(d.firstElementChild);else main.prepend(d.firstElementChild)}catch(e){console.warn("tempo rod",e)}
 if(["radnica","rody","dvor","cirkev"].includes(v))try{vplyvRank(main)}catch(e){}
}
{const o=window.render;window.render=function(){const r=o.apply(this,arguments);try{apply()}catch(e){console.warn("tempo",e)}return r}}

const st=document.createElement("style");st.textContent=`
.thd{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}.thd h3{margin:0}
.tgoal,.tguide{border:2px solid #d6aa4c!important}
.tov{margin:6px 0;font-size:.93rem}.tov.bad{color:#a33a2f}.tov.ok{color:#2f7a3a}.tov.mid{color:#8a6a12}
.tgr{display:grid;grid-template-columns:1fr 70px auto;gap:8px;align-items:center;padding:6px 0;border-top:1px solid #8a6a3a33}
.tgn{display:flex;flex-direction:column;min-width:0}.tgn .muted{font-size:.85rem}.tgv{font-size:.85rem;white-space:nowrap}
.tmeter{height:8px;border-radius:4px;background:#8a6a3a2e;overflow:hidden}.tmeter i{display:block;height:100%;background:linear-gradient(90deg,#b9852a,#e8c360)}
.tmeter.sm{height:5px;margin-top:4px}
.tbig{display:grid;grid-template-columns:28px 1fr auto;gap:8px;align-items:center;padding:8px 0;border-top:1px solid #8a6a3a33}
.tic{font-size:1.3rem;text-align:center}.tbn{display:flex;flex-direction:column;min-width:0}.tbn .muted{font-size:.86rem}
.tsub{margin-top:10px;padding-top:8px;border-top:1px dashed #8a6a3a66}
.topt{display:grid;grid-template-columns:56px 1fr auto;gap:8px;align-items:center;padding:6px 0}.topt span{font-size:.9rem}
.tsteps{margin:6px 0 8px 1.2em;padding:0;display:flex;flex-direction:column;gap:3px}.tsteps li.done{opacity:.6;text-decoration:line-through}.tsteps li.next{font-weight:600}
.tlots{margin-top:8px;display:flex;flex-direction:column;gap:6px;align-items:flex-start}.tlist{display:flex;flex-wrap:wrap;gap:6px}
.tyear .tnum{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin:8px 0}.tyear .tnum div{display:flex;flex-direction:column}
.tchart{margin:6px 0 0}.tchart svg{width:100%;height:130px;display:block;background:#0000000a;border-radius:6px}
.tchart path{fill:none;stroke-width:2.2;vector-effect:non-scaling-stroke;stroke-linejoin:round}.tchart .tn{stroke:#b9852a}.tchart .tr{stroke:#5a6b8a;stroke-dasharray:4 3}
.tchart figcaption{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:.85rem;margin-top:4px}.lg::before{content:"";display:inline-block;width:14px;height:3px;margin-right:6px;vertical-align:middle;background:#b9852a}.lg.r::before{background:#5a6b8a}
.tdl dt{font-weight:700;margin-top:8px}.tdl dd{margin:2px 0 0}
.tcnt{font-size:.8rem;font-family:"EB Garamond",Georgia,serif;margin-left:10px;padding:2px 8px;border-radius:10px;background:#0000001a;vertical-align:middle;letter-spacing:0}
.trk{white-space:nowrap}
.ucur{background:rgba(214,170,76,.16);border:1px solid #d6aa4c;border-radius:8px;padding:10px;margin:8px 0;display:flex;flex-direction:column;gap:6px}
.ubtns{display:flex;gap:6px;flex-wrap:wrap}
.uauto{display:flex;gap:8px;align-items:flex-start;font-size:.9rem;margin-top:8px}.uauto input{width:20px;height:20px;flex:0 0 auto;margin-top:2px}

`;document.head.appendChild(st);
window.TEMPO={income,eta,ranks,overtake,bigSteps,bestMatch,yearSummary};
})();

;
