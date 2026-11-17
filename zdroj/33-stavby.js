/* ==== js/stavby.js ==== */
/* Stavby rodu v každom meste (v76): každé veľké dielo sa stavia v každom meste zvlášť, je vidieť na mape mesta
   a za všetky stavby v meste sa hlava rodu stane Patrónom mesta. Autor: Dávid Mucha. */
(function(){
"use strict";
const hasS=()=>{try{return !!S}catch(e){return false}};
const E6=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ORDER=["fontana","spital","veza","brana","most","trznica","pristav","kolegium","katedrala","pozicka","univerzita","hrad"];
const FX={
 fontana:"Rody v meste ťa majú radšej (+6) a ich priazeň každý rok mierne rastie (+1).",
 spital:"Ak tu žije tvoja rodina: hlava rodu a manžel/ka majú každý rok +5 zdravia.",
 veza:"Tvoje dielne v meste vyrábajú o 5 % viac.",
 brana:"Karavány do a z mesta sú o 40 % bezpečnejšie.",
 most:"Karavány do a z mesta sú o 40 % bezpečnejšie a platia polovičné clo.",
 trznica:"Na trhu v tomto meste máš lepšie ceny pri nákupe aj predaji.",
 pristav:"Tri tvoje lode nemusia platiť údržbu.",
 kolegium:"Každý rok sa jedno tvoje dieťa (6+ rokov) zlepší v jednej zručnosti. V meste sídla je aj školné polovičné.",
 katedrala:"Rodová kaplnka: priazeň kráľa a Cirkvi, veľká sláva.",
 pozicka:"Kráľ si požičia a nevráti, zato si ťa veľmi obľúbi.",
 univerzita:"Najväčšie dielo vzdelanosti s menom tvojho rodu.",
 hrad:"Kamenný hrad nad mestom. Najväčšia sláva, akú môže rod dosiahnuť stavbou."};
const W=id=>WORKS.find(w=>w.id===id);
const tierOf=cid=>CITY(cid).tier||1;
const cost=(id,cid)=>Math.round(W(id).c*(1+.6*(tierOf(cid)-1))/100)*100;
const fame=(id,cid)=>Math.round(W(id).pr*(1+.25*(tierOf(cid)-1)));
const isPort=cid=>{try{return waterTo(cid).length>0}catch(e){return false}};
function avail(cid){return ORDER.filter(id=>W(id)&&(id!=="pristav"||isPort(cid)))}
function cw(cid){S.cw=S.cw||{};return S.cw[cid]||(S.cw[cid]={})}
const built=(cid,id)=>!!(S.cw&&S.cw[cid]&&S.cw[cid][id]);
const SEAT_LEGACY=["spital","kolegium","hrad","katedrala","pozicka","univerzita","fontana","veza","trznica","most"];

/* S.works = diela v meste sídla (staré časti hry s ním počítajú); presné údaje sú v S.cw */
function derive(cid){return Object.keys(S.cw&&S.cw[cid]||{}).filter(id=>SEAT_LEGACY.includes(id))}
function sync(){
 if(!hasS()||!S.dyn)return;const p=P();if(!p)return;S.cw=S.cw||{};
 /* prevod starých hier a diel pridaných inou časťou hry (hrad z častí) */
 for(const id of (S.works||[])){const c=(S.workCity&&S.workCity[id]!=null)?S.workCity[id]:p.city;if(!built(c,id)&&!(S.__wsync||[]).includes(id))cw(c)[id]=S.year}
 if(S.workCity){S.workCity={}}
 S.works=derive(p.city);S.__wsync=S.works.slice();
 patronHeir()}
/* sláva zo všetkých miest */
{const o=window.worksPrest;window.worksPrest=function(){try{if(hasS()&&S.cw){let s=0;for(const c in S.cw)for(const id in S.cw[c])if(W(id))s+=fame(id,+c);return s}}catch(e){}return o?o():0}}

/* ---------- stavba ---------- */
A.work=function(e){
 const p=P(),cid=e.c!=null&&e.c!==""?+e.c:S.ci,id=e.k,w=W(id);
 if(!w||built(cid,id)||!avail(cid).includes(id))return;
 if(!hasLic(cid)){toast("Najprv potrebuješ obchodné právo v meste "+CITY(cid).n+".","bad");return}
 const c=cost(id,cid);if(p.money<c){toast("Nemáš dosť peňazí.","bad");return}
 p.money-=c;led(p,"ine",-c);cw(cid)[id]=S.year;
 if(w.fav)favAll(cid,w.fav);if(w.rf)p_rf(w.rf);
 chron(`Rod ${p.name} postavil v meste ${CITY(cid).n}: ${w.n.toLowerCase()}.`,"titul","good");
 try{SND.play("fanfare")}catch(x){}
 sync();bump();
 const n=avail(cid).filter(x=>built(cid,x)).length,m=avail(cid).length;
 queue({title:w.n,wide:1,html:`<div class="sbopen"><svg viewBox="-40 -40 80 60" width="160" height="120" aria-hidden="true">${typeof workIcon==="function"?`<g transform="scale(1.6)">${workIcon(id)}</g>`:""}</svg><div><p><b>${E6(w.n)}</b> stojí v meste ${E6(CITY(cid).n)}. Na mape mesta ju uvidíš s vlajkou tvojho rodu.</p><p>${E6(FX[id]||w.d)}</p><p class="good">Sláva rodu +${fame(id,cid)}${w.rf?`, priazeň kráľa +${w.rf}`:""}${w.fav?`, priazeň rodov v meste +${w.fav}`:""}.</p><p class="muted">Stavby rodu v meste ${E6(CITY(cid).n)}: ${n} z ${m}.${n<m?" Keď postavíš všetky, staneš sa Patrónom mesta.":""}</p></div></div>`});
 try{celebrate("stavba",w.n)}catch(x){}
 patronCheck(cid);render()};
/* mapa mesta sa prekreslí (prepnutie null/undefined nič nezmení na obraze, len zruší vyrovnávaciu pamäť) */
function bump(){try{if(S.sel==null)S.sel=S.sel===null?undefined:null}catch(e){}}

/* ---------- účinky ---------- */
/* trh: tržnica mimo mesta sídla (v meste sídla ju rieši pôvodná časť hry) */
{const o=window.spr;if(typeof o==="function")window.spr=function(d){let s=o(d);try{if(d&&d.id===0&&S&&S.ci!==P().city&&built(S.ci,"trznica"))s-=.006}catch(e){}return Math.max(.005,s)}}
/* veža: dielne +5 % */
{const o=window.guildMul;if(typeof o==="function")window.guildMul=function(d,b){let m=o(d,b);try{if(d&&d.id===0&&b&&built(b.city,"veza"))m*=1.05}catch(e){}return m}}
/* prístav: 3 lode na prístav bez údržby */
{const o=window.upkeep;if(typeof o==="function")window.upkeep=function(d){o(d);try{if(d&&d.id===0&&d.ships&&S.cw){let n=0;for(const c in S.cw)if(S.cw[c].pristav)n++;const free=Math.min(d.ships,n*3)*SHIP_UPK;if(free){d.money+=free;led(d,"udrzba",free)}}}catch(e){}}}
/* karavány: most alebo brána v meste odkiaľ alebo kam idú */
{const o=window.convoyTurn;if(typeof o==="function")window.convoyTurn=function(){
 if(!hasS()||!S.conv||!S.conv.length)return o.apply(this,arguments);
 const all=S.conv.slice(),keep=[],w0=S.works;
 try{for(const c of all){S.conv=[c];const safe=[c.from,c.to].some(x=>built(x,"most")||built(x,"brana"));S.works=safe?["most"]:[];o.apply(this,arguments);keep.push(...S.conv)}}
 finally{S.conv=keep.concat(S.conv.filter(x=>!keep.includes(x)&&!all.includes(x)));S.works=w0}}}
/* most: polovičné clo pri karaváne */
{const o=A.send;if(typeof o==="function")A.send=function(){const p=P(),m0=p.money,n0=S.conv.length;o.apply(this,arguments);try{const c=S.conv[S.conv.length-1];if(S.conv.length>n0&&(built(c.from,"most")||built(c.to,"most"))){const n=Object.values(c.goods).reduce((a,b)=>a+b,0),back=Math.round(n*.75);if(back>0&&m0-p.money>=back){p.money+=back;led(p,"ine",back);toast("Most rodu: polovičné clo.","good")}}}catch(e){}}}
/* ročné účinky: fontána, kolégium */
{const o=window.yearEnd;if(typeof o==="function")window.yearEnd=function(){const r=o.apply(this,arguments);try{if(hasS()&&S.cw){const p=P();
 for(const c in S.cw){if(S.cw[c].fontana)favAll(+c,1)}
 let k=0;for(const c in S.cw)if(S.cw[c].kolegium)k++;
 const kids=p.kids.filter(x=>!x.dead&&x.age>=6&&x.skills);for(let i=0;i<k&&kids.length;i++){const kid=kids[i%kids.length];const sk=pick(Object.keys(kid.skills));kid.skills[sk]++}
 }}catch(e){console.warn("stavby rok",e)}return r}}

/* ---------- Patrón mesta ---------- */
const headKey=()=>{const h=P().head;return h.name+"|"+(S.year-h.age)};
function isPatron(cid){return!!(S.patron&&S.patron[cid])}
function patronCheck(cid){
 if(isPatron(cid))return;const L=avail(cid);if(!L.every(id=>built(cid,id)))return;
 S.patron=S.patron||{};S.patron[cid]={hk:headKey(),since:S.year,dec:-1};
 const p=P();chron(`${p.head.name} z rodu ${p.name} sa stal Patrónom mesta ${CITY(cid).n}.`,"titul","good");
 queue({title:"Patrón mesta "+CITY(cid).n,wide:1,html:`<p>Mesto ${E6(CITY(cid).n)} stojí na stavbách tvojho rodu. Rada ti odovzdala kľúče od mesta a nad bránou visí tvoj erb.</p><p><b>${E6(p.head.name)} je odteraz doživotne Patrónom mesta.</b></p><ul><li>Raz do roka rozhodneš o jednej veci v meste: dane, jarmok zadarmo alebo zrušenie návrhu rady.</li><li>Vo voľbách máš dva hlasy navyše.</li><li>Mesto ti každý štvrťrok platí poctu ${zl(rent(cid))}.</li></ul><p class="muted">Po smrti hlavy rodu patronát zdedí dedič, ak ho rody v meste majú v priemere radi aspoň +20.</p>`});
 try{celebrate("stavba","Patrón mesta")}catch(x){}bump()}
const rent=cid=>60*tierOf(cid);
function avgFav(cid){const L=S.dyn.filter(d=>d.ai&&!d.royal&&!d.gone&&d.city===cid);return L.length?L.reduce((s,d)=>s+d.favor,0)/L.length:0}
function patronHeir(){
 if(!S.patron)return;const hk=headKey(),kept=[],lost=[];
 for(const c in S.patron){const pt=S.patron[c];if(pt.hk===hk)continue;
  const av=avgFav(+c);
  if(av>=20){pt.hk=hk;pt.dec=-1;kept.push(CITY(+c).n)}
  else{delete S.patron[c];lost.push(`${CITY(+c).n} (${Math.round(av)})`)}}
 if(!kept.length&&!lost.length)return;
 const nm=P().head.name;
 if(kept.length)chron(`${nm} zdedil patronát nad mestami: ${kept.join(", ")}.`,"titul","good");
 msg(`Patronát: ${kept.length?`zdedený v ${kept.length} ${kept.length===1?"meste":"mestách"}`:""}${kept.length&&lost.length?", ":""}${lost.length?`stratený v ${lost.length} ${lost.length===1?"meste":"mestách"}`:""}.`,lost.length?"bad":"good");
 queue({title:"Patronát po smrti hlavy rodu",html:`${kept.length?`<p><b>${E6(nm)}</b> zdedil patronát: ${kept.map(E6).join(", ")}.</p>`:""}${lost.length?`<p>Stratený: ${lost.map(E6).join(", ")}. <span class="muted">V zátvorke je priemerná priazeň rodov v meste, treba aspoň +20.</span></p><p class="muted">Stavby ostali stáť. Keď priazeň rodov stúpne nad +20, patronát sa vráti sám.</p>`:""}`})}
/* znovuzískanie patronátu po strate: všetky stavby stoja, stačí priazeň */
function regain(cid){if(isPatron(cid))return false;if(!avail(cid).every(id=>built(cid,id)))return false;if(avgFav(cid)<20)return false;S.patron=S.patron||{};S.patron[cid]={hk:headKey(),since:S.year,dec:-1};chron(`${P().head.name} znovu získal patronát nad mestom ${CITY(cid).n}.`,"titul","good");bump();return true}
function decide(cid,k,v,quiet){
 const pt=S.patron&&S.patron[cid];if(!pt||pt.dec===S.year)return false;let ok=false,t="";
 inCity(cid,()=>{const C=CC();
  if(k==="tax"){C.tax=+v;localDyn().filter(d=>d.ai).forEach(d=>d.favor=clamp(d.favor+(C.tax<1?6:C.tax>1?-8:0),-100,100));t=`dane ${Math.round(C.tax*100)} %`;ok=true}
  else if(k==="fair"){C.fair=S.turn+1;t="jarmok na budúci štvrťrok";ok=true}
  else if(k==="veto"){if(C.prop){t=`zrušený návrh „${EDICTS[C.prop.id].n}“`;C.prop=null;ok=true}}});
 if(ok){pt.dec=S.year;if(!quiet)msgNow(`Patrón mesta ${CITY(cid).n}: ${t}.`,"good")}
 return ok}
A.patDec=function(e){const cid=e.c!=null&&e.c!==""?+e.c:S.ci;if(decide(cid,e.k,e.v))render()};
A.patFairAll=function(){const L=Object.keys(S.patron||{}).map(Number).filter(c=>S.patron[c].dec!==S.year);let n=0;L.forEach(c=>{if(decide(c,"fair",0,true))n++});if(n)msgNow(`Jarmok vyhlásený v ${n} ${n===1?"meste":"mestách"} na budúci štvrťrok.`,"good");render()};
A.patAuto=function(){S.autoPat=!S.autoPat;try{toast(S.autoPat?"Správca vyhlási jarmok tam, kde do konca roka nerozhodneš.":"Rozhodnutia patróna sú len na tebe.","good")}catch(e){}render()};
/* renta a dedenie na konci štvrťroka */
{const o=window.endTurn;if(typeof o==="function")window.endTurn=function(){
 try{if(hasS()&&S.patron&&!S.over){const p=P();let s=0;for(const c in S.patron)s+=rent(+c);if(s){p.money+=s;led(p,"urady",s)}}}catch(e){}
 try{if(hasS()&&S.auto&&S.autoPat&&S.patron&&S.season===3&&!S.over){let n=0;for(const c in S.patron)if(S.patron[c].dec!==S.year&&decide(+c,"fair",0,true))n++;if(n)msg(`Správca rodu vyhlásil ako patrón jarmok v ${n} ${n===1?"meste":"mestách"}.`,"good")}}catch(e){}
 const r=o.apply(this,arguments);
 try{if(hasS()&&!S.over){sync();const g=S.cities.filter(C=>regain(C.id)).map(C=>C.n);if(g.length)msg(`Patronát sa vrátil: ${g.join(", ")}.`,"good")}}catch(e){}
 return r}}
/* dva hlasy navyše vo voľbách: dvaja „hlasujúci“ patróna pridaní len počas sčítania */
{const o=window.resolveElection;if(typeof o==="function")window.resolveElection=function(){
 if(!hasS()||!isPatron(S.ci)||!S.elec)return o.apply(this,arguments);
 const E=S.elec,pv0=Object.assign({},E.pv),fake=[];
 try{for(const id of E.list)if((E.cand[id]||[]).includes(0))E.pv[id]=0;
  for(let i=0;i<2;i++){const f={id:S.dyn.length,name:"patrón",city:S.ci,ai:false,royal:false,gone:false,favor:0,title:0,kids:[],head:{skills:{}},__fake:1};S.dyn.push(f);fake.push(f)}
  return o.apply(this,arguments)}
 finally{S.dyn=S.dyn.filter(d=>!d.__fake);E.pv=pv0}}}

/* ---------- prehľad v karte Mesto ---------- */
function etaQ(c){try{return window.TEMPO?TEMPO.eta(c):Infinity}catch(e){return Infinity}}
function card(cid){
 const p=P(),C=CITY(cid),L=avail(cid),n=L.filter(id=>built(cid,id)).length,lic=hasLic(cid);
 const pt=S.patron&&S.patron[cid];
 const key="mesto:Stavby rodu",op=(S.vOpen||{})[key]!=null?!!S.vOpen[key]:false;
 const rows=L.map(id=>{const w=W(id),b=built(cid,id),c=cost(id,cid),q=etaQ(c);
  return`<div class="sbrow ${b?"done":""}"><span class="sbico"><svg viewBox="-24 -26 48 34" width="44" height="32" aria-hidden="true">${typeof workIcon==="function"?workIcon(id):""}</svg></span><div class="sbtx"><b>${b?"✓ ":""}${E6(w.n)}</b><span class="muted">${E6(FX[id]||w.d)}</span><span class="muted">${b?`postavené ${S.cw[cid][id]} · sláva +${fame(id,cid)}`:`${zl(c)} · sláva +${fame(id,cid)} · ${q===0?"<b class='good'>máš na to</b>":q===Infinity?"pri terajšom príjme ďaleko":"o "+q+" štvrťr."}`}</span></div>${b?"":`<button class="btn sm ${p.money>=c&&lic?"pri":""}" data-a="work" data-k="${id}" data-c="${cid}" ${p.money>=c&&lic?"":"disabled"}>Postaviť</button>`}</div>`}).join("");
 let pat="";
 if(pt){const done=pt.dec===S.year;
  pat=`<div class="sbpat"><b>👑 Patrón mesta: ${E6(p.head.name)}</b><span class="muted">od roku ${pt.since} · pocta ${zl(rent(cid))} za štvrťrok · 2 hlasy navyše vo voľbách</span>
  ${cid===S.ci?(done?`<span class="pill">tohtoročné rozhodnutie je urobené</span>`:`<p class="lbl" style="margin-top:6px">rozhodnutie patróna · raz do roka, zadarmo</p><div class="ubtns">${[[.75,"Dane nízke"],[1,"Dane bežné"],[1.35,"Dane vysoké"]].map(([v,t])=>`<button class="btn sm ${CC().tax===v?"pri":""}" data-a="patDec" data-k="tax" data-v="${v}">${t}</button>`).join("")}<button class="btn sm" data-a="patDec" data-k="fair">Jarmok zadarmo</button>${CC().prop?`<button class="btn sm red" data-a="patDec" data-k="veto">Zrušiť návrh rady</button>`:""}</div>`):""}</div>`}
 else pat=`<p class="muted" style="font-size:.9rem">Keď postavíš všetky stavby, ${E6(p.head.name)} sa stane doživotne <b>Patrónom mesta</b>: raz do roka rozhodne o daniach, jarmoku alebo návrhu rady, dostane 2 hlasy navyše vo voľbách a poctu ${zl(rent(cid))} za štvrťrok.</p>`;
 return`<div class="sheet vgrp sbcard${op?" open":""}"><div class="vgh"><h3>Stavby rodu</h3><span class="pill ${pt?"ok":""}">${pt?"👑 ":""}${n} z ${L.length}</span><button type="button" class="btn ghost sm" data-a="vtog" data-k="${key}" data-d="0" aria-expanded="${op}">${op?"Skryť":"Zobraziť"}</button></div>
 <div class="tmeter"><i style="width:${Math.round(n/L.length*100)}%"></i></div>
 <div class="vgb"${op?"":" hidden"}>${lic?"":`<p class="uwarn">V meste ${E6(C.n)} nemáš obchodné právo, stavať tu zatiaľ nemôžeš.</p>`}${pat}<div class="sblist">${rows}</div></div></div>`}
function patCard(){
 const L=Object.keys(S.patron||{}).map(Number);if(!L.length)return"";
 const open=L.filter(c=>S.patron[c].dec!==S.year);
 const rows=L.map(cid=>{const C=CITY(cid),pt=S.patron[cid],done=pt.dec===S.year;
  return`<div class="patrow"><div class="pattx"><b>${E6(C.n)}</b><span class="muted">pocta ${zl(rent(cid))}/štvrťrok · dane ${Math.round((C.tax||1)*100)} %${C.prop?" · návrh rady čaká":""}</span></div>${done?`<span class="pill">rozhodnuté</span>`:`<div class="ubtns"><button class="btn sm" data-a="patDec" data-k="fair" data-c="${cid}">Jarmok</button><select class="vsel patsel" data-c="${cid}" aria-label="Dane v meste ${E6(C.n)}"><option value="">Dane…</option><option value=".75">nízke 75 %</option><option value="1">bežné 100 %</option><option value="1.35">vysoké 135 %</option></select>${C.prop?`<button class="btn sm red" data-a="patDec" data-k="veto" data-c="${cid}">Zrušiť návrh</button>`:""}</div>`}</div>`}).join("");
 return`<div class="sheet patcard"><div class="uhd"><h3>👑 Moje patronáty</h3><span class="pill">${L.length} ${L.length===1?"mesto":L.length<5?"mestá":"miest"} · ${zl(L.reduce((s,c)=>s+rent(c),0))}/štvrťrok</span></div>
 <p class="muted" style="font-size:.9rem;margin:4px 0">${open.length?`Tento rok ešte môžeš rozhodnúť v ${open.length} ${open.length===1?"meste":"mestách"}. Jedno rozhodnutie na mesto a rok, zadarmo.`:"Na tento rok máš všetko rozhodnuté."}</p>
 ${open.length>1?`<div class="ubtns"><button class="btn sm pri" data-a="patFairAll">Jarmok vo všetkých nerozhodnutých (${open.length})</button></div>`:""}
 <div class="patlist">${rows}</div>
 ${S.auto?`<label class="uauto"><input type="checkbox" data-a="patAuto" ${S.autoPat?"checked":""}> Správca rodu vyhlási jarmok tam, kde do konca roka nič nerozhodneš.</label>`:""}</div>`}
function apply(){
 if(!hasS())return;sync();
 const main=document.querySelector("main");if(!main)return;
 if(S.view==="mesto"&&!main.querySelector(".sbcard")){const d=document.createElement("div");d.innerHTML=card(S.ci);const ref=main.querySelector(".mapsheet");if(ref)ref.after(d.firstElementChild);else main.appendChild(d.firstElementChild)}
 /* staré prehľady diel nahradí prehľad mesta */
 main.querySelectorAll(".vworks").forEach(x=>x.remove());
 if(S.view==="majetok"&&(S.mtab||"prehlad")==="stavby"&&!main.querySelector(".sbcard")){const old=[...main.querySelectorAll(".mcards")];old.forEach(x=>x.remove());const d=document.createElement("div");d.innerHTML=card(S.ci).replace('class="vgb" hidden','class="vgb"');const st=main.querySelector(":scope > .stack")||main;st.appendChild(d.firstElementChild)}
 if(S.view==="radnica"&&S.patron&&Object.keys(S.patron).length&&!main.querySelector(".patcard")){const d=document.createElement("div");d.innerHTML=patCard();const ref=main.querySelector(".ubox")||main.querySelector(".vhall")||main.querySelector(".jvplyv");if(ref)ref.after(d.firstElementChild);else main.prepend(d.firstElementChild);main.querySelectorAll(".patsel").forEach(x=>x.onchange=()=>{if(x.value)A.patDec({k:"tax",v:x.value,c:x.dataset.c})})}
 if(["radnica","rody","dvor","cirkev"].includes(S.view)&&isPatron(S.ci)){const r=main.querySelector(".jvrow");if(r&&!r.querySelector(".sbpt")){const s=document.createElement("span");s.className="sbpt";s.innerHTML="👑 <b>Patrón mesta</b>";r.appendChild(s)}}
}
{const o=window.advice;if(typeof o==="function")window.advice=function(){const a=o.apply(this,arguments);try{if(hasS()&&S.patron&&S.season===3&&!(S.auto&&S.autoPat)){const n=Object.keys(S.patron).filter(c=>S.patron[c].dec!==S.year).length;if(n)a.push({pr:4,ic:"♛",t:`Ako patrón máš ešte nerozhodnuté ${n} ${n===1?"mesto":n<5?"mestá":"miest"}. Koncom roka rozhodnutie prepadne.`,v:"radnica",lbl:"Radnica"})}}catch(e){}return a}}
{const o=window.render;window.render=function(){try{sync()}catch(e){}const r=o.apply(this,arguments);try{apply()}catch(e){console.warn("stavby",e)}return r}}

/* ---------- kreslenie na mape mesta ---------- */
function flag(C,x,y,z,col){C.push(x+y+60,function(g){const P2=C.P,a=P2(x,y,z),b=P2(x,y,z+5);g.strokeStyle="#2b2117";g.lineWidth=1.4;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();g.fillStyle=col;g.beginPath();g.moveTo(b[0],b[1]);g.lineTo(b[0]+16,b[1]+4);g.lineTo(b[0],b[1]+9);g.closePath();g.fill();g.lineWidth=.8;g.stroke()})}
function draw(env){
 if(!hasS()||!window.ZNK)return;const cid=S.ci;const L=S.cw&&S.cw[cid];if(!L||!Object.keys(L).length)return;
 const Z=window.ZNK,E=(window.__zE&&window.__zE.L===env.L)?window.__zE:new Z.Env(env),C=(window.__zE&&window.__zE.L===env.L&&window.__zC)?window.__zC:new Z.Ctx(env);
 const pl=E.pl,ST=Z.STONE,col=(()=>{try{return DC(0)}catch(e){return "#a5312a"}})(),pat=isPatron(cid),fc=pat?"#e3be4f":col;
 const at=(id,fn)=>{if(L[id])try{fn()}catch(e){console.warn("kresba "+id,e)}};
 at("fontana",()=>{const s=E.spot(pl[0]-7,pl[1]+7,2.2,true);if(!s)return;C.box(s[0]-1.4,s[1]-1.4,2.8,2.8,0,.5,ST,{top:"#6fa6cf"});C.box(s[0]-.25,s[1]-.25,.5,.5,.5,1.6,ST,{});C.push(s[0]+s[1]+3,g=>{const q=C.P(s[0],s[1],2.3);g.fillStyle="rgba(140,190,230,.85)";g.beginPath();g.arc(q[0],q[1],3.2,0,7);g.fill()});flag(C,s[0]+1.4,s[1]-1.4,.5,fc)});
 at("veza",()=>{const s=E.spot(pl[0]+9,pl[1]-9,2.2,true,8);if(!s)return;Z.tower(C,s[0],s[1],2.6,14,"spire",ST,"#4f6a8a");C.push(s[0]+s[1]+40,g=>{const q=C.P(s[0]+1.3,s[1]+2.6,10.5);g.fillStyle="#f4ead0";g.beginPath();g.arc(q[0],q[1],5,0,7);g.fill();g.stroke();g.beginPath();g.moveTo(q[0],q[1]);g.lineTo(q[0],q[1]-3.6);g.moveTo(q[0],q[1]);g.lineTo(q[0]+2.6,q[1]);g.stroke()});flag(C,s[0]+1.3,s[1]+1.3,14+6,fc)});
 at("brana",()=>{let s=null;if(E.ring&&E.ring.length){let b=null;E.ring.forEach(p=>{const q=E.env.P2(p[0],p[1],0);if(!b||q[1]>b.y)b={p,y:q[1]}});s=b.p}else s=E.spot(pl[0],pl[1]+26,4,false);if(!s)return;const GW="#a99f8a";Z.tower(C,s[0]-3.4,s[1]-1,1.9,6.5,"flat",GW);Z.tower(C,s[0]+1.6,s[1]-1,1.9,6.5,"flat",GW);C.box(s[0]-1.5,s[1]-1,3.1,1.9,3.2,2.6,GW,{stone:1});C.crenel(s[0]-1.5,s[1]-1,3.1,1.9,5.8,GW);C.push(s[0]+s[1]+20,g=>{const a2=C.P(s[0]-1.4,s[1]+.9,0),b2=C.P(s[0]+1.5,s[1]+.9,0),t2=C.P(s[0],s[1]+.9,3.1);g.fillStyle="#2a2018";g.beginPath();g.moveTo(a2[0],a2[1]);g.lineTo(a2[0],a2[1]-14);g.quadraticCurveTo(t2[0],t2[1]-6,b2[0],b2[1]-14);g.lineTo(b2[0],b2[1]);g.closePath();g.fill()});flag(C,s[0],s[1],7.4,fc)});
 const any=(L2)=>{for(const q of L2){const r=E.spot(q[0],q[1],q[2],q[3],q[4]);if(r)return r}return null};
 at("trznica",()=>{const s=any([[pl[0]+10,pl[1]+9,5.5,true,8],[pl[0]-10,pl[1]+10,5,true,8],[pl[0],pl[1]+14,5,true],[pl[0]+20,pl[1]+20,5,false],[pl[0]-24,pl[1]+18,5,false]]);if(!s)return;C.shadow(s[0]-5,s[1]-2,10,4,4);C.box(s[0]-5,s[1]-2,10,4,0,3,"#e6d2a6",{win:[6,1]});C.gable(s[0]-5.3,s[1]-2.3,10.6,4.6,3,2.2,"#8a4a32","#e6d2a6","x",.2);C.arcade(s[0]-5,s[1]-2,10,4,1.8,6);flag(C,s[0]+5,s[1]-2,5.2,fc)});
 at("spital",()=>{const s=E.spot(pl[0]-12,pl[1]-10,4.5,true,8)||E.spot(pl[0]-20,pl[1]-14,4.5,false);if(!s)return;C.shadow(s[0]-4,s[1]-2,8,4,4);C.box(s[0]-4,s[1]-2,8,4,0,3,"#f2ece0",{win:[4,1]});C.gable(s[0]-4.3,s[1]-2.3,8.6,4.6,3,2.4,"#a5312a","#f2ece0","x",.2);C.push(s[0]+s[1]+8,g=>{const q=C.P(s[0],s[1]+2,2);g.fillStyle="#a5312a";g.fillRect(q[0]-1.5,q[1]-5,3,10);g.fillRect(q[0]-5,q[1]-1.5,10,3)});flag(C,s[0]+4,s[1]-2,5.4,fc)});
 at("kolegium",()=>{const s=E.spot(pl[0]-16,pl[1]+10,5,true,8)||E.spot(pl[0]-24,pl[1]+16,5,false);if(!s)return;C.shadow(s[0]-4.5,s[1]-2.4,9,4.8,5);C.box(s[0]-4.5,s[1]-2.4,9,4.8,0,3.8,Z.BRICK,{win:[5,2]});C.gable(s[0]-4.8,s[1]-2.7,9.6,5.4,3.8,2.4,"#5a5f6a",Z.BRICK,"x",.2);Z.tower(C,s[0]+4.5,s[1]-2.4,1.8,7,"tall",Z.BRICK,"#5a5f6a");flag(C,s[0]+5.4,s[1]-1.5,13,fc)});
 at("katedrala",()=>{const s=E.spot(pl[0]+16,pl[1]-2,4,true,10)||E.spot(pl[0]+24,pl[1]-6,4,false);if(!s)return;C.shadow(s[0]-3,s[1]-1.6,6,3.2,4);C.box(s[0]-3,s[1]-1.6,6,3.2,0,3.2,ST,{stone:1,win:[3,1]});C.gable(s[0]-3.3,s[1]-1.9,6.6,3.8,3.2,2.4,"#5a6070",ST,"x",.2);Z.tower(C,s[0]-4.4,s[1]-.8,1.6,6.5,"spire",ST,"#5a6070");flag(C,s[0]+3,s[1]-1.6,5.6,fc)});
 at("pozicka",()=>{const s=E.spot(pl[0]-3,pl[1]-12,2.4,true,6);if(!s)return;C.box(s[0]-1.2,s[1]-1.2,2.4,2.4,0,1,ST,{stone:1});flag(C,s[0],s[1],1,"#e3be4f");flag(C,s[0]+.9,s[1]+.9,1,col)});
 at("univerzita",()=>{const s=any([[pl[0]-2,pl[1]+22,8,false],[pl[0]+30,pl[1]+10,8,false],[pl[0]-30,pl[1]+20,8,false],[30,30,7.5,false],[-30,30,7.5,false],[pl[0]+20,pl[1]+18,7.5,true],[0,40,7.5]]);if(!s)return;C.shadow(s[0]-7,s[1]-2.6,14,5.2,6);C.box(s[0]-7,s[1]-2.6,14,5.2,0,4.4,"#e8dcc0",{win:[8,2]});C.gable(s[0]-7.3,s[1]-2.9,14.6,5.8,4.4,2.8,"#5a6070","#e8dcc0","x",.2);Z.tower(C,s[0]-8.6,s[1]-1.4,2.2,8,"spire","#e8dcc0","#5a6070");Z.tower(C,s[0]+6.4,s[1]-1.4,2.2,8,"spire","#e8dcc0","#5a6070");flag(C,s[0],s[1],7.2,fc)});
 at("hrad",()=>{const s=E.spot(-30,-30,11,false)||E.spot(30,-30,11,false);if(!s)return;Z.castleHill(C,s[0],s[1],"pre");flag(C,s[0],s[1],12,fc)});
 at("most",()=>{if(E.river&&E.river.length>4)Z.bridge(C,E,"pre")});
 at("pristav",()=>{if(!E.river||E.river.length<5)return;const rp=E.river[Math.floor(E.river.length*.7)];const s=E.spot(rp[0]+4,rp[1]+4,3,"river")||[rp[0]+4,rp[1]+4];C.box(s[0]-3,s[1]-.8,6,1.6,0,.5,"#8a6a44",{});C.box(s[0]+2,s[1]-.4,.5,.5,.5,5,"#6a4a2a",{});C.push(s[0]+s[1]+30,g=>{const a=C.P(s[0]+2.2,s[1],5.5),b=C.P(s[0]-1,s[1]-2,5.2);g.strokeStyle="#6a4a2a";g.lineWidth=2.4;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();g.lineWidth=1;g.beginPath();g.moveTo(b[0],b[1]);g.lineTo(b[0],b[1]+14);g.stroke()});flag(C,s[0]-3,s[1],.5,fc)});
 if(pat){/* erb patróna nad námestím */C.push(pl[0]+pl[1]+80,g=>{const q=C.P(pl[0],pl[1],9);g.fillStyle="#e3be4f";g.strokeStyle="#2b2117";g.lineWidth=1.2;g.beginPath();g.moveTo(q[0]-9,q[1]-10);g.lineTo(q[0]+9,q[1]-10);g.lineTo(q[0]+9,q[1]+2);g.quadraticCurveTo(q[0],q[1]+12,q[0]-9,q[1]+2);g.closePath();g.fill();g.stroke();g.fillStyle=col;g.beginPath();g.arc(q[0],q[1]-3,4,0,7);g.fill()})}
}
{const o=window.KPUB;window.KPUB=function(env){if(o)o.apply(this,arguments);try{draw(env)}catch(e){console.warn("stavby kresba",e)}}}

const st=document.createElement("style");st.textContent=`
.sbcard .vgh{flex-wrap:wrap}.sbcard .tmeter{margin-top:6px}
.sblist{display:flex;flex-direction:column}
.sbrow{display:grid;grid-template-columns:48px 1fr auto;gap:8px;align-items:center;padding:8px 0;border-top:1px solid #8a6a3a33}
.sbrow.done{opacity:.75}.sbtx{display:flex;flex-direction:column;min-width:0}.sbtx .muted{font-size:.86rem}
.sbico svg{display:block}
.sbpat{background:rgba(227,190,79,.18);border:1px solid #d6aa4c;border-radius:8px;padding:10px;margin:8px 0;display:flex;flex-direction:column;gap:4px}
.sbopen{display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap}.sbopen svg{flex:0 0 auto}.sbopen div{flex:1 1 220px;min-width:0}
.sbpt{white-space:nowrap}
.patcard{border:2px solid #e3be4f!important}
.patlist{display:flex;flex-direction:column;margin-top:6px}
.patrow{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;justify-content:space-between;padding:8px 0;border-top:1px solid #8a6a3a33}
.pattx{display:flex;flex-direction:column;min-width:0;flex:1 1 160px}.pattx .muted{font-size:.85rem}
.patsel{min-height:36px;padding:4px 8px}

`;document.head.appendChild(st);
window.STAVBY={avail,built,cost,fame,isPatron,patronCheck,card};
})();

;
