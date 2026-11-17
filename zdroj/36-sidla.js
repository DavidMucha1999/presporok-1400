/* ==== js/sidla.js ==== */
/* Sídla rodu v každom meste (v78): hlavné sídlo a domy rodu, presun bez straty úradu, prenájom, vylepšenia podľa mesta,
   vzhľad sídla podľa mesta, bez opráv sídla. Autor: Dávid Mucha. */
(function(){
"use strict";
const hasS=()=>{try{return !!S&&!!S.dyn}catch(e){return false}};
const E7=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const keyOf=cid=>{try{return CITY_DEF[CITY(cid).def].key}catch(e){return"pre"}};
const tier=cid=>CITY(cid).tier||1;

/* ---------- vylepšenia podľa mesta ---------- */
const CUP={
 pre:[["pivnica","Vínna pivnica","trade",1500],["pavlac","Pavlač nad Dunajom","fav",1200]],
 kra:[["sol","Sklad soli z Wieličky","inc",2000],["cech","Tehlová cechová sieň","prod",1800]],
 vie:[["hudba","Hudobná sieň","skill:charizma",2500],["vinica","Vinica pod Kahlenbergom","inc",2200]],
 pra:[["rukopisy","Knižnica rukopisov","skill:retorika",2600],["alchym","Alchymistická dielňa","prod",2400]],
 ven:[["sklo","Sklárska dielňa z Murana","inc",3500],["molo","Vlastné mólo","trade",3000]],
 par:[["ilum","Iluminátorská dielňa","fame",3500],["tapis","Tapisérie z Arrasu","skill:charizma",3800]],
 lon:[["vlna","Vlnený sklad","trade",4000],["dub","Dubová sieň","fav",3600]],
 brn:[["sukno","Súkenícka dielňa","prod",1800],["pivb","Pivnica pod Petrovom","inc",1600]],
 bud:[["audien","Audienčná sieň","rf",3000],["kupele","Termálne kúpele","health",2600]],
 kut:[["mincovna","Podiel v mincovni","inc",3200],["banicka","Banícka kaplnka","fav",2400]],
 nur:[["hodiny","Hodinárska dielňa","prod",3000],["zbroj","Zbrojnica","skill:boj",2800]],
 gda:[["jantar","Jantárový sklad","inc",3000],["zuraw","Žeriav v podkroví","trade",2600]]};
const incOf=cid=>35*tier(cid),fameOf=cid=>150*tier(cid);
function cupText(t,cid){const n=CITY(cid).n;
 if(t==="trade")return`Na trhu v meste ${n} máš lepšie ceny.`;
 if(t==="fav")return"Rody v meste ťa majú každý rok o niečo radšej (+1).";
 if(t==="inc")return`Príjem ${zl(incOf(cid))} za štvrťrok.`;
 if(t==="prod")return"Tvoje dielne v meste vyrábajú o 5 % viac.";
 if(t==="fame")return`Sláva rodu +${fameOf(cid)}.`;
 if(t==="rf")return"Priazeň kráľa +2 každý rok.";
 if(t==="health")return"Zdravie hlavy rodu +5 ročne, kým tu má rod hlavné sídlo.";
 if(t.startsWith("skill:")){const k=t.slice(6);return`${(SK[k]||k)} +1, kým tu má rod hlavné sídlo.`}
 return""}
const cups=cid=>CUP[keyOf(cid)]||[];

/* ---------- údaje ---------- */
function seats(){S.seats=S.seats||{};return S.seats}
function seat(cid){return seats()[cid]||null}
function hasSeat(cid){return cid===P().city||!!seat(cid)}
const lvl=cid=>cid===P().city?P().house:(seat(cid)||{}).h||0;
const upOf=cid=>((seat(cid)||{}).up)||[];
const hasUp=(cid,k)=>upOf(cid).includes(k)&&!(cid!==P().city&&(seat(cid)||{}).rent);
function sync(){
 if(!hasS())return;const p=P();if(!p)return;const ss=seats();
 if(!ss[p.city])ss[p.city]={h:p.house,hu:[],up:[],lot:p.lot,main:1};
 for(const c in ss){ss[c].main=+c===p.city?1:0;if(!Array.isArray(ss[c].up))ss[c].up=[]}
 /* bez opráv: sídlo nechátra */
 S.decay=0}

/* ---------- akcie ---------- */
const domCost=cid=>Math.round(HOUSES[1].c*(1+.3*(tier(cid)-1)));
A.seatBuild=function(e){
 const p=P(),cid=+e.c;if(hasSeat(cid)||!hasLic(cid))return;const c=domCost(cid);if(p.money<c){toast("Nemáš dosť peňazí.","bad");return}
 let lot=null;inCity(cid,()=>{const l=freeLot();if(l){l.res=0;lot=l.id}});
 if(lot==null){toast("V meste nie je voľný pozemok.","bad");return}
 p.money-=c;led(p,"ine",-c);seats()[cid]={h:1,hu:[],up:[],lot,rent:false};
 chron(`Rod ${p.name} si postavil dom v meste ${CITY(cid).n}.`,"mesto","good");try{SND.play("fanfare")}catch(x){}
 toast(`Dom rodu v meste ${CITY(cid).n} stojí.`,"good");render()};
A.seatUp=function(e){
 const p=P(),cid=+e.c;if(cid===p.city){if(typeof A.house==="function")A.house({});return}
 const s=seat(cid);if(!s)return;const h=HOUSES[s.h+1];if(!h||s.h+1>4||p.money<h.c)return;
 p.money-=h.c;led(p,"ine",-h.c);s.h++;toast(`Dom rodu v meste ${CITY(cid).n}: ${h.n.toLowerCase()}.`,"good");render()};
A.seatRent=function(e){const s=seat(+e.c);if(!s||+e.c===P().city)return;s.rent=!s.rent;toast(s.rent?"Dom je prenajatý. Nájomné budeš dostávať každý štvrťrok.":"Nájom skončil, dom slúži rodu.","good");render()};
A.seatCup=function(e){
 const p=P(),cid=+e.c,d=cups(cid).find(x=>x[0]===e.k);if(!d||!hasSeat(cid))return;
 if(cid===p.city&&!seat(cid))sync();const s=seat(cid);if(s.up.includes(d[0]))return;
 const c=Math.round(d[3]);if(p.money<c){toast("Nemáš dosť peňazí.","bad");return}
 p.money-=c;led(p,"ine",-c);s.up.push(d[0]);
 if(d[2]==="fame")p.fameB=(p.fameB||0)+fameOf(cid);
 chron(`Rod ${p.name} pridal k svojmu sídlu v meste ${CITY(cid).n}: ${d[1].toLowerCase()}.`,"mesto","good");
 try{SND.play("fanfare")}catch(x){}toast(`${d[1]} je hotová.`,"good");try{kInv()}catch(x){}render()};
const rentOf=cid=>Math.round(HOUSES[lvl(cid)].u*1.6*(1+.3*(tier(cid)-1)));
const domUpk=cid=>Math.round(HOUSES[lvl(cid)].u*.4);

/* presun hlavného sídla: lacný, keď v meste už máš dom; úrad v starom meste ostáva */
{const o=window.moveCost;if(typeof o==="function")window.moveCost=function(p,c){try{if(hasS()&&p&&p.id===0){return hasSeat(c)?150*tier(c):domCost(c)+150*tier(c)}}catch(e){}return o(p,c)}}
{const o=A.move;if(typeof o==="function")A.move=function(e){
 const p=P(),old=p.city,c=+e.c;if(!hasLic(c)||old===c)return;
 sync();const ss=seats(),had=seat(c);
 let off=null;inCity(old,()=>{const x=officeOf(0);if(x)off={id:x.id,end:S.off[x.id].end}});
 ss[old]=Object.assign(ss[old]||{},{h:p.house,hu:(p.hu||[]).slice(),lot:p.lot,rent:false});
 if(had)inCity(c,()=>{const hl=S.lots.find(x=>x.id===had.lot);if(hl)hl.res=null});
 o(e);
 if(p.city!==c&&had)inCity(c,()=>{const hl=S.lots.find(x=>x.id===had.lot);if(hl)hl.res=0});
 if(p.city!==c){return}
 /* stará budova ostáva domom rodu */
 inCity(old,()=>{const l=S.lots.find(x=>x.id===ss[old].lot);if(l)l.res=0;if(off){S.off[off.id].h=0;S.off[off.id].end=off.end}});
 if(had){inCity(c,()=>{const nl=S.lots.find(x=>x.id===p.lot);if(nl&&nl.id!==had.lot)nl.res=null;const hl=S.lots.find(x=>x.id===had.lot);if(hl)hl.res=0});p.lot=had.lot;p.house=had.h;p.hu=(had.hu||[]).slice();had.rent=false}
 else{p.house=1;p.hu=[];ss[c]={h:1,hu:[],up:[],lot:p.lot,rent:false}}
 ss[c].main=1;ss[old].main=0;try{kInv()}catch(x){}
 if(off)msg(`Úrad v meste ${CITY(old).n} si ponechávaš, máš tam dom rodu. Plat ti chodí ďalej, právomoci úradu použiješ, keď tam budeš mať hlavné sídlo.`,"good");
 render()}}

/* ---------- účinky ---------- */
{const o=window.spr;if(typeof o==="function")window.spr=function(d){let s=o(d);try{if(d&&d.id===0&&hasS()&&cups(S.ci).some(x=>x[2]==="trade"&&hasUp(S.ci,x[0])))s-=.004}catch(e){}return Math.max(.005,s)}}
{const o=window.guildMul;if(typeof o==="function")window.guildMul=function(d,b){let m=o(d,b);try{if(d&&d.id===0&&b&&cups(b.city).some(x=>x[2]==="prod"&&hasUp(b.city,x[0])))m*=1.05}catch(e){}return m}}
{const o=window.huBonus;if(typeof o==="function")window.huBonus=function(d,k){let s=o(d,k);try{if(d&&d.id===0&&hasS()){const c=d.city;cups(c).forEach(x=>{if(x[2]==="skill:"+k&&hasUp(c,x[0]))s+=1})}}catch(e){}return s}}
{const o=window.upkeep;if(typeof o==="function")window.upkeep=function(d){o(d);try{if(d&&d.id===0&&hasS()){const ss=seats();let v=0;
 for(const c in ss){const cid=+c;if(cid===d.city)continue;v+=ss[c].rent?rentOf(cid):-domUpk(cid);
  cups(cid).forEach(x=>{if(x[2]==="inc"&&hasUp(cid,x[0]))v+=incOf(cid)});
  /* plat z úradu v meste s domom rodu */
  try{const C=CITY(cid);for(const id in C.off)if(C.off[id].h===0)v+=offInc(id,C)}catch(e){}}
 cups(d.city).forEach(x=>{if(x[2]==="inc"&&hasUp(d.city,x[0]))v+=incOf(d.city)});
 if(v){d.money+=v;led(d,v>0?"urady":"udrzba",v)}}}catch(e){console.warn("sidla upkeep",e)}}}
{const o=window.yearEnd;if(typeof o==="function")window.yearEnd=function(){const r=o.apply(this,arguments);try{if(hasS()){const p=P(),ss=seats();
 for(const c in ss){const cid=+c;cups(cid).forEach(x=>{if(!hasUp(cid,x[0]))return;if(x[2]==="fav")favAll(cid,1);if(x[2]==="rf")p_rf(2);if(x[2]==="health"&&cid===p.city)p.head.health=clamp(p.head.health+5,0,100)})}}}catch(e){}return r}}
/* titul: ktoré mesto ho dovolí */
function bestTitleCity(){const p=P();const L=S.cities.filter(C=>C.maxT>p.title).sort((a,b)=>(hasSeat(b.id)-hasSeat(a.id))||(hasLic(b.id)-hasLic(a.id))||a.tier-b.tier);return L[0]||null}

/* ---------- vzhľad sídla podľa mesta ---------- */
const STY={
 pre:{nb:["#efe3c4","#e7d2b0","#f1e8d6","#e4c9a8"],land:"hradpre",ban:["#c0262a","#f4ead0"],iw:"#efe2c4",roof:null,tint:"rgba(255,220,160,.10)",wp:["#ecd9a8","#a5402a","#4f6a2a"],fl:null},
 kra:{nb:["#c98a62","#d9b48c","#c4744e","#e2c8a0"],wall:"#c4744e",land:"mariacky",ban:["#2f5bb0","#f4ead0"],iw:"#ecd6b4",roof:null,tint:"rgba(255,200,170,.10)",wp:["#e9cfa8","#8a2a22","#3f5a2a"],fl:null},
 vie:{nb:["#efe9da","#e4dcc8","#d8d0bc","#ece2cc"],land:"stefan",ban:["#c0262a","#f4ead0"],iw:"#f0e8d8",roof:"#4f6a5a",tint:"rgba(220,230,255,.10)",wp:["#efe2c8","#2f5a3a","#c9971a"],fl:["#d8d0bc","#8a7a64"]},
 pra:{nb:["#eadfc6","#e6cfa8","#d9c6a0","#efe4cf"],land:"hradcany",ban:["#c0262a","#f4ead0"],iw:"#e6d8b8",roof:null,tint:"rgba(240,220,200,.10)",wp:["#e8d8b0","#6a2a52","#4f6a2a"],fl:null},
 ven:{nb:["#e9c8a8","#e6b48e","#efd8bc","#d99a7a"],land:"kampanila",ban:["#c0262a","#e3be4f"],iw:"#f1e2cf",canal:1,roof:"#c0703f",tint:"rgba(255,190,120,.16)",wp:["#f2dcc0","#1f6a5a","#c9971a"],fl:["#efe9de","#9aa4ae"]},
 par:{nb:["#ebe6da","#e2dccc","#d8d2c2","#efe9de"],slate:1,land:"notre",ban:["#2f5bb0","#e3be4f"],iw:"#ece4d2",roof:"#5a6272",tint:"rgba(200,210,235,.14)",wp:["#1f3b72","#e2b85a","#c9971a"],fl:["#e8e2d4","#3a4a7a"]},
 lon:{nb:["#efe9da","#e8dcc4","#ddd0b4","#f2ead8"],land:"tower",ban:["#c0262a","#f4ead0"],iw:"#e3d4b4",roof:"#5a4a3a",tint:"rgba(120,140,170,.26)",wp:["#5a3a22","#c9971a","#2f5a3a"],fl:["#6a4a2a","#4a301a"]},
 brn:{nb:["#e4d6b8","#dcc6a0","#e9dcc0","#d8c4a8"],land:"spilberk",ban:["#c0262a","#f4ead0"],iw:"#ead9b8",roof:null,tint:"rgba(255,220,180,.08)",wp:["#e6d2a6","#7a3a22","#4f6a2a"],fl:null},
 bud:{nb:["#e6dcc4","#dccaa8","#ece2cc","#d6c2a0"],land:"budin",ban:["#2f7d46","#f4ead0"],iw:"#eadfc8",roof:"#8a6a3a",tint:"rgba(255,210,150,.12)",wp:["#ead8b0","#2f6a3a","#b8241c"],fl:["#d8c49a","#8a5a2a"]},
 kut:{nb:["#e8ddc4","#dcd0b4","#efe6d2","#d4c6a6"],slate:1,land:"barbora",ban:["#5a6070","#e3be4f"],iw:"#e6d6b4",roof:"#5a6a5a",tint:"rgba(200,210,200,.14)",wp:["#d8d4c4","#4a4a5a","#c9971a"],fl:["#cfc8b4","#6a6a72"]},
 nur:{nb:["#efe4cf","#e6d6b6","#f2eadb","#e0caa6"],land:"kaiserburg",ban:["#c0262a","#e3be4f"],iw:"#ecdcbc",roof:null,tint:"rgba(230,210,180,.10)",wp:["#e8d8b4","#2f5a3a","#a5402a"],fl:["#2f6a4a","#e8dcc0"]},
 gda:{nb:["#b4573b","#c98a62","#a5482e","#d9b48c"],wall:"#b4573b",land:"zuraw",ban:["#c0262a","#e3be4f"],iw:"#ead8b6",roof:null,tint:"rgba(180,200,220,.18)",wp:["#e8c890","#a85a1a","#3f5a6a"],fl:["#c98a3a","#7a4a1a"]}};
const F1="#a7b0ba",F2="#949ea9";
function land(k){
 const T=(x,y,w,h,rh)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${F1}"/><path d="M${x-3} ${y}L${x+w/2} ${y-rh}L${x+w+3} ${y}Z" fill="${F2}"/>`;
 const hill=(cx,w)=>`<path d="M${cx-w} 400Q${cx} ${400-w*.45} ${cx+w} 400Z" fill="${F1}" opacity=".9"/>`;
 switch(k){
  case"hradpre":return hill(1010,190)+`<rect x="940" y="250" width="140" height="70" fill="${F1}"/>`+[940,1060].map(x=>T(x-6,226,26,94,30)).join("")+`<path d="M934 250H1086L1080 236H940Z" fill="${F2}"/>`;
  case"mariacky":return T(150,170,34,230,60)+T(196,205,30,195,26);
  case"stefan":return`<rect x="1000" y="250" width="110" height="150" fill="${F1}"/><path d="M996 250L1055 205L1114 250Z" fill="${F2}"/>`+T(1036,170,36,230,130);
  case"hradcany":return hill(1000,230)+`<rect x="850" y="270" width="300" height="60" fill="${F1}"/>`+T(960,200,30,130,90)+T(1010,215,26,115,70);
  case"kampanila":return T(1040,150,34,250,60)+`<path d="M120 330a60 60 0 0 1 120 0Z" fill="${F2}"/><rect x="110" y="330" width="140" height="70" fill="${F1}"/>`;
  case"notre":return`<rect x="960" y="260" width="180" height="140" fill="${F1}"/><rect x="960" y="190" width="54" height="90" fill="${F1}"/><rect x="1086" y="190" width="54" height="90" fill="${F1}"/>`+T(1040,230,20,40,60);
  case"tower":return`<rect x="130" y="230" width="120" height="170" fill="${F1}"/>`+[130,236].map(x=>`<rect x="${x-4}" y="208" width="22" height="30" fill="${F1}"/><circle cx="${x+7}" cy="204" r="11" fill="${F2}"/>`).join("");
  case"spilberk":return hill(1020,200)+`<rect x="940" y="262" width="160" height="60" fill="${F1}"/>`+T(1010,226,30,60,26);
  case"budin":return hill(1030,230)+`<rect x="900" y="250" width="260" height="70" fill="${F1}"/>`+T(1000,196,30,80,50)+T(1100,216,24,60,36);
  case"barbora":return`<rect x="960" y="270" width="170" height="130" fill="${F1}"/>`+[975,1025,1075].map(x=>`<path d="M${x-4} 270L${x+25} 196L${x+54} 270Z" fill="${F2}"/>`).join("");
  case"kaiserburg":return hill(190,200)+`<rect x="110" y="250" width="160" height="70" fill="${F1}"/><rect x="230" y="190" width="44" height="130" fill="${F1}"/><path d="M226 190L252 150L278 190Z" fill="${F2}"/>`;
  case"zuraw":return`<rect x="1000" y="200" width="70" height="200" fill="${F1}"/><path d="M996 200L1035 150L1074 200Z" fill="${F2}"/><path d="M1070 214L1150 190" stroke="${F2}" stroke-width="6"/><path d="M1150 190V250" stroke="${F2}" stroke-width="2"/>`;
 }return""}
function canal(){let s=`<g class="kanal"><rect x="0" y="508" width="1200" height="92" fill="#3f6f86"/><rect x="0" y="502" width="1200" height="8" fill="#cfc4aa"/>`;
 for(let i=0;i<14;i++){const x=(i*97)%1200,y=528+(i*13)%60;s+=`<path d="M${x} ${y}q14 -5 28 0" stroke="rgba(255,255,255,.35)" stroke-width="2" fill="none"/>`}
 s+=`<g transform="translate(820,560)"><path d="M-90 0Q0 18 90 0L84 -6Q0 8 -84 -6Z" fill="#141414"/><path d="M84 -6l10 -22" stroke="#141414" stroke-width="4"/><path d="M-30 -8v-46" stroke="#5a3a20" stroke-width="3"/><circle cx="-30" cy="-60" r="6" fill="#2b2117"/><rect x="-36" y="-54" width="12" height="26" fill="#2b2117"/></g></g>`;return s}
function curKey(){try{return window.__xCity!=null?keyOf(window.__xCity):keyOf(P().city)}catch(e){return"pre"}}
{const o=window.ext2;if(typeof o==="function")window.ext2=function(d){let s=o(d);try{if(!d||d.id!==0||!hasS())return s;const k=curKey(),st=STY[k];if(!st)return s;
 st.nb.forEach((c,i)=>{s=s.split(`fill="${["#e2c8a0","#c8d4c0","#e8d8b8","#d8b8a8"][i]}"`).join(`fill="${c}"`)});
 if(st.wall)s=s.split('fill="#d8ccb2"').join(`fill="${st.wall}"`);
 if(st.slate)s=s.replace(/url\(#(xe\d+)tl\)/g,(m,a)=>s.indexOf(`id="${a}sl"`)>=0?`url(#${a}sl)`:m);
 if(st.roof)["#a5402a","#c0453a"].forEach(c=>{s=s.split(`fill="${c}"`).join(`fill="${st.roof}"`)});
 if(st.tint){const m=s.match(/<rect[^>]*fill="url\(#xe\d+sk\)"[^>]*\/>/);if(m){const at=s.indexOf(m[0])+m[0].length;s=s.slice(0,at)+`<rect width="1200" height="600" fill="${st.tint}"/>`+s.slice(at)}}
 const L=land(st.land);if(L){const i=s.indexOf('<g class="plx-far">');if(i>0){const j=s.indexOf("</g>",i);if(j>0)s=s.slice(0,j)+`<g transform="translate(0,-150)">${L}</g>`+s.slice(j)}}
 if(st.canal&&d.house<5){const vi=s.search(/<rect width="1200" height="600" fill="url\(#xe\d+vg\)"/);const at=vi>0?vi:s.lastIndexOf("</svg>");s=s.slice(0,at)+canal()+s.slice(at)}
 }catch(e){console.warn("sidla ext",e)}return s}}
{const o=window.int2;if(typeof o==="function")window.int2=function(d,room){let s=o(d,room);try{if(!d||d.id!==0||!hasS()||room==="nadvorie")return s;const k=curKey(),st=STY[k];if(!st)return s;
 s=s.split('fill="#e8dbbb"').join(`fill="${st.iw}"`);
 const pm=s.match(/<pattern[^>]*id="xi\d+pm"[\s\S]*?<\/pattern>/);if(pm&&st.wp){const n=pm[0].split('fill="#e6cf9a"').join(`fill="${st.wp[0]}"`).split('fill="#a5402a"').join(`fill="${st.wp[1]}"`).split('#4f6a2a').join(st.wp[2]);s=s.replace(pm[0],n)}
 if(st.fl){s=s.split('fill="#a05232"').join(`fill="${st.fl[0]}"`).split('fill="#a8583a"').join(`fill="${st.fl[0]}"`).split('fill="#b86a42"').join(`fill="${st.fl[1]}"`).split('fill="#b8683a"').join(`fill="${st.fl[1]}"`)}
 const fe=s.lastIndexOf('<rect x="3" y="3" width="1194"');const at=fe>0?fe:s.lastIndexOf("</svg>");
 const [a,b]=st.ban;const ban=`<g class="cityban" transform="translate(1040,60)"><path d="M-34 0H34" stroke="#5a3a20" stroke-width="4"/><path d="M-28 2H28V120L0 104L-28 120Z" fill="${a}" stroke="#2b2117" stroke-width="2"/><path d="M-28 40H28V58H-28Z" fill="${b}" opacity=".9"/><circle cx="0" cy="22" r="9" fill="${b}" stroke="#2b2117"/></g>`;
 s=s.slice(0,at)+ban+s.slice(at)}catch(e){}return s}}

/* náhľad sídla v inom meste */
const PCACHE={};
function preview(cid){
 const p=P(),k=[cid,lvl(cid),S.season,typeof dayPhase==="function"?dayPhase():0].join("|");if(PCACHE[k])return PCACHE[k];
 const h0=p.house,hu0=p.hu,c0=window.__xCity;let svg="";
 try{p.house=lvl(cid);p.hu=cid===p.city?hu0:((seat(cid)||{}).hu||[]);window.__xCity=cid;svg=ext2(p)}catch(e){}finally{p.house=h0;p.hu=hu0;window.__xCity=c0}
 svg=svg.replace(/<svg /,'<svg preserveAspectRatio="xMidYMid slice" ');
 for(const kk in PCACHE)if(kk.split("|")[0]==String(cid))delete PCACHE[kk];
 return(PCACHE[k]=svg)}

/* ---------- karty ---------- */
function cityCard(cid){
 const p=P(),C=CITY(cid),main=cid===p.city,s=seat(cid),lic=hasLic(cid),has=hasSeat(cid);
 let act="";
 if(!has)act=lic?`<p class="muted">V meste ${E7(C.n)} zatiaľ nemáš dom.</p><div class="ubtns"><button class="btn sm pri" data-a="seatBuild" data-c="${cid}" ${p.money<domCost(cid)?"disabled":""}>Postaviť dom rodu · ${zl(domCost(cid))}</button><button class="btn sm" data-a="move" data-c="${cid}" ${p.money<moveCost(p,cid)?"disabled":""}>Presťahovať sem hlavné sídlo · ${zl(moveCost(p,cid))}</button></div>`:`<p class="muted">Na dom v meste ${E7(C.n)} potrebuješ obchodné právo.</p>`;
 else{const h=lvl(cid),nh=HOUSES[h+1];
  act=`<p><b>${main?"★ Hlavné sídlo":"Dom rodu"}: ${E7(HOUSES[h].n)}</b>${!main&&s.rent?` <span class="pill">prenajatý · +${zl(rentOf(cid))}/štvrťrok</span>`:""}</p>
  <div class="ubtns">${nh&&(main||h+1<=4)?`<button class="btn sm" data-a="seatUp" data-c="${cid}" ${p.money<nh.c?"disabled":""}>Prestavať na ${E7(nh.n.toLowerCase())} · ${zl(nh.c)}</button>`:""}${!main?`<button class="btn sm" data-a="seatRent" data-c="${cid}">${s.rent?"Ukončiť nájom":"Prenajať · +"+zl(rentOf(cid))+"/štvrťrok"}</button><button class="btn sm pri" data-a="move" data-c="${cid}" ${p.money<moveCost(p,cid)?"disabled":""}>Presťahovať sem rodinu · ${zl(moveCost(p,cid))}</button>`:""}</div>
  ${!main?`<p class="muted" style="font-size:.86rem">Údržba domu ${zl(domUpk(cid))} za štvrťrok. Úrad v tomto meste si s domom ponecháš aj po presťahovaní.</p>`:""}`}
 const cu=has?`<p class="lbl" style="margin-top:8px">vylepšenia typické pre ${E7(C.n)}</p>${cups(cid).map(x=>{const d=upOf(cid).includes(x[0]);return`<div class="sdrow"><div class="sdtx"><b>${d?"✓ ":""}${E7(x[1])}</b><span class="muted">${E7(cupText(x[2],cid))}${d&&!hasUp(cid,x[0])?" (neplatí, kým je dom prenajatý)":""}</span></div>${d?"":`<button class="btn sm" data-a="seatCup" data-c="${cid}" data-k="${x[0]}" ${p.money<x[3]?"disabled":""}>${zl(x[3])}</button>`}</div>`}).join("")}`:"";
 const img=has?`<div class="sdimg">${preview(cid)}</div>`:"";
 return{img,act,cu}}
function mestoCard(){
 const cid=S.ci,C=CITY(cid),x=cityCard(cid),key="mesto:Sidlo",op=(S.vOpen||{})[key]!=null?!!S.vOpen[key]:false;
 const lab=cid===P().city?"★ hlavné sídlo":hasSeat(cid)?"dom rodu":"bez domu";
 return`<div class="sheet vgrp sdcard${op?" open":""}"><div class="vgh"><h3>Sídlo v meste ${E7(C.n)}</h3><span class="pill">${lab}</span><button type="button" class="btn ghost sm" data-a="vtog" data-k="${key}" data-d="0" aria-expanded="${op}">${op?"Skryť":"Zobraziť"}</button></div><div class="vgb"${op?"":" hidden"}>${x.img}${x.act}${x.cu}</div></div>`}
function rodCard(){
 const p=P();const L=S.cities.filter(C=>hasSeat(C.id)||hasLic(C.id));
 const bt=bestTitleCity();const tok=titleOK(p);
 const hint=!tok.ok&&/kastelán/.test(tok.why||"")&&bt?`<p class="uwarn">V meste ${E7(CITY(p.city).n)} je najvyšší titul ${E7(TITLES[CITY(p.city).maxT].n)}. Vyšší titul získaš s hlavným sídlom napríklad v meste ${E7(bt.n)} (do titulu ${E7(TITLES[bt.maxT].n)}).</p>`:"";
 return`<div class="sheet sdrod"><div class="uhd"><h3>Sídla rodu</h3><span class="pill">${L.filter(C=>hasSeat(C.id)).length} ${L.filter(C=>hasSeat(C.id)).length===1?"sídlo":"sídla"}</span></div>${hint}
 <div class="sdlist">${L.map(C=>{const cid=C.id,main=cid===p.city,s=seat(cid),has=hasSeat(cid);
  return`<div class="sdrow"><div class="sdtx"><b>${main?"★ ":""}${E7(C.n)}</b><span class="muted">${has?`${E7(HOUSES[lvl(cid)].n)}${!main&&s&&s.rent?" · prenajatý":""} · vylepšenia ${upOf(cid).length}/${cups(cid).length} · najvyšší titul ${E7(TITLES[C.maxT].n)}`:`bez domu · najvyšší titul ${E7(TITLES[C.maxT].n)}`}</span></div><button class="btn sm" data-a="city" data-c="${cid}" data-v="mesto">Otvoriť</button></div>`}).join("")}</div>
 <p class="muted" style="font-size:.86rem">Dom rodu postavíš v karte Mesto daného mesta, v časti „Sídlo v meste“. Rodina žije v hlavnom sídle. Ostatné domy môžeš prenajať, alebo si v nich držať úrad a vylepšenia.</p></div>`}
function apply(){
 if(!hasS())return;sync();const main=document.querySelector("main");if(!main)return;
 if(S.view==="mesto"&&!main.querySelector(".sdcard")){const d=document.createElement("div");d.innerHTML=mestoCard();const ref=main.querySelector(".sbcard")||main.querySelector(".mapsheet");if(ref)ref.after(d.firstElementChild);else main.appendChild(d.firstElementChild)}
 if(S.view==="rod"&&!S.rodSec&&!main.querySelector(".sdrod")){const d=document.createElement("div");d.innerHTML=rodCard();const ref=main.querySelector(".tfam")||main.querySelector(".todopanel");if(ref)ref.after(d.firstElementChild);else main.appendChild(d.firstElementChild)}
 /* starý text pri presune v Svete */
 main.querySelectorAll('button[data-a="move"]').forEach(b=>{const sp=b.parentElement&&b.parentElement.querySelector("span.muted");if(sp&&/stratíš úrad/.test(sp.textContent))sp.textContent=`Presťahovať hlavné sídlo sem${hasSeat(+b.dataset.c)?" (máš tu dom rodu)":" (postaví sa meštiansky dom)"} · ${zl(moveCost(P(),+b.dataset.c))}`});
 /* bez opráv sídla */
 main.querySelectorAll(".decaybar").forEach(x=>x.remove());
}
{const o=window.render;window.render=function(){try{sync()}catch(e){}const r=o.apply(this,arguments);try{apply()}catch(e){console.warn("sidla",e)}return r}}
{const o=window.endTurn;if(typeof o==="function")window.endTurn=function(){const r=o.apply(this,arguments);try{if(hasS())S.decay=0}catch(e){}return r}}
{const o=window.prestige;if(typeof o==="function")window.prestige=function(d){let v=o(d);try{if(d&&d.id===0&&hasS()){const ss=seats();for(const c in ss)if(+c!==d.city)v+=lvl(+c)*35}}catch(e){}return v}}

/* ---------- slabé miesta: kratšie rady ---------- */
const mob=()=>false;
const md=()=>{try{return window.JEDNODUCHE?JEDNODUCHE.mode():"jedn"}catch(e){return"jedn"}};

/* kratší „Tento štvrťrok“: dve rady a zvyšok na ťuknutie */
A.sdAdvMore=function(){S.advMore=!S.advMore;render()};
function shortTask(){
 if(md()==="vsetko")return;const ul=document.querySelector(".jtask ul.adv");if(!ul||ul.dataset.sd)return;ul.dataset.sd="1";
 const li=[...ul.children];if(li.length<=2)return;
 if(!S.advMore)li.slice(2).forEach(x=>x.hidden=true);
 ul.insertAdjacentHTML("afterend",`<button type="button" class="btn ghost sm sdmore" data-a="sdAdvMore">${S.advMore?"Menej rád":"Ďalšie rady ("+(li.length-2)+")"}</button>`)}
{const o=window.render;window.render=function(){const r=o.apply(this,arguments);try{if(hasS()&&S.view==="mesto")shortTask()}catch(e){}return r}}

const st=document.createElement("style");st.textContent=`
.decaybar{display:none!important}
.sdcard .vgh{flex-wrap:wrap}
.sdimg{border-radius:8px;overflow:hidden;border:1px solid #8a6a3a66;margin:6px 0 8px;aspect-ratio:2/1;max-width:100%}
.sdimg svg{display:block;width:100%;height:100%}
.sdlist{display:flex;flex-direction:column}
.sdrow{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:8px 0;border-top:1px solid #8a6a3a33}
.sdtx{display:flex;flex-direction:column;min-width:0;flex:1 1 auto}.sdtx .muted{font-size:.86rem}
.sdmore{margin:2px 0 8px}

`;document.head.appendChild(st);
/* pozícia na stránke po akcii: obnoví sa až po všetkých úpravách stránky (karty vložené nad mapu ju inak posunú) */
let uTouch=0;["wheel","keydown"].forEach(t=>window.addEventListener(t,()=>{uTouch=Date.now()},{passive:true}));
{const o=window.render;window.render=function(){
 let y=0,v=null,c=null;try{y=window.scrollY;v=S&&S.view;c=S&&S.cur}catch(e){}
 const t0=Date.now();const r=o.apply(this,arguments);
 try{if(S&&S.view===v&&S.cur===c&&y>40){const fix=()=>{if(uTouch>t0)return;if(Math.abs(window.scrollY-y)>2){const h=document.documentElement.scrollHeight;if(h>=y+window.innerHeight*.3)window.scrollTo(0,y)}};fix();setTimeout(fix,0);setTimeout(fix,150)}}catch(e){}
 return r}}
window.SIDLA={seats,hasSeat,lvl,cups,hasUp,preview,bestTitleCity};
})();

;

