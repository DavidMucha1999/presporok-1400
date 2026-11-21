/* ==== js/byvanie.js ==== */
/* Prešporok 1400 – RPG, etapa 5 (v359): bývanie a majetok. Hráč začína bez strechy nad hlavou (senník je zadarmo).
   Nocľaháreň: prična za 1 zl alebo izba na 7 dní za 6 zl. Mestský pisár na námestí: kúpa chalupy v Podhradí alebo domu
   v Remeselníckej štvrti (dom dostane pozemok v meste a dá sa v ňom spať a prestavať ho) a pre majstra s domom otvorenie
   vlastnej dielne jeho remesla (stavia sa starým systémom dielní: robotníci, výroba, sklad).
   Stav: S.rpg.home = null | {t:"izba",until:deň} | {t:"dom"}. Autor: Dávid Mucha. */
(function(){"use strict";
 const R=()=>{try{return S&&S.rpg&&!S.__demo?S.rpg:null}catch(e){return null}};
 const pay=n=>{const p=P();p.money-=n;try{led(p,"ine",-n)}catch(e){}try{SND.play("coin")}catch(e){}};
 const hasRoom=r=>!!(r.home&&r.home.t==="izba"&&r.day<=r.home.until),own=r=>!!(r.home&&r.home.t==="dom"&&P().lot!=null);
 const menu=(a,b,c)=>window.RPG&&RPG.menu&&RPG.menu(a,b,c);
 function lodge(){const r=R();if(!r)return;const p=P(),o=[];
  if(hasRoom(r))o.push({t:"Ísť spať do svojej izby",s:"izbu máš zaplatenú do dňa "+r.home.until,f:()=>A.rpgSleep({w:"izba"})});
  else o.push({t:"Prespať na prični · 1 zl",s:"lepší spánok než na sene",off:p.money<1,f:()=>A.rpgSleep({w:"pricna",cost:1})});
  o.push({t:"Prenajať izbu na 7 dní · 6 zl",s:hasRoom(r)?"izbu už máš":own(r)?"máš vlastný dom":"vlastná posteľ, spíš zadarmo a dobre",off:hasRoom(r)||own(r)||p.money<6,g:1,f:()=>{pay(6);r.home={t:"izba",until:r.day+7};try{save()}catch(e){}toast("Izba je tvoja do dňa "+r.home.until+". Spať chodíš sem do nocľahárne.","good")}});
  menu("Nocľaháreň","„Prična za zlatku na noc, izba za šesť na týždeň. Platí sa vopred.“",o)}
 /* voľný pozemok v štvrti (obytné domy mešťanov sa rátajú ako voľné – pisár ti jeden odpredá) */
 function lotIn(zone){const C=S.cities[0],L=cityLayout(C),E=C.lots.filter(l=>{if(l.pub||l.b!=null||l.res!=null)return false;const q=L.pos[l.id];return q&&RPG.zoneAt(L,q.x,q.y)===zone});return E.length?E[Math.floor(Math.random()*E.length)]:null}
 function buyHouse(zone,lv,cost,name){const r=R(),p=P();if(!r||p.money<cost)return;const l=lotIn(zone);if(!l){toast("V tejto štvrti teraz nie je nič na predaj.","bad");return}
  const C=S.cities[0];if(p.lot!=null&&C.lots[p.lot]&&C.lots[p.lot].res===0)C.lots[p.lot].res=null;if(r.hs)delete r.hs[l.id];l.res=0;p.lot=l.id;p.house=lv;pay(cost);r.home={t:"dom"};try{save()}catch(e){}
  try{queue({title:name,html:"<p>Pisár zapísal kúpu do mestskej knihy. "+name+" – "+RPG.ZN[zone]+" – je tvoj.</p><p>Spíš vo vlastnej posteli zadarmo a ráno si menej hladný. Dom nájdeš v denníku (B) a pri dome ho môžeš dať prestavať.</p>"})}catch(e){}
  try{window.__m3re&&window.__m3re()}catch(e){}}
 function craftType(r){if(r.craftT)return r.craftT;try{return Object.keys(BT).find(k=>(BT[k].n||"").toLowerCase()===r.craft)||null}catch(e){return null}}
 function openShop(){const r=R(),p=P();if(!r)return;const t=craftType(r);if(!t){toast("Pisár nevie, aké remeslo máš zapísané.","bad");return}const l=lotIn("remeslo")||lotIn("trh");if(!l){toast("V meste teraz nie je voľný pozemok na dielňu.","bad");return}
  S.sel=l.id;let c=0;try{c=bcost(t)}catch(e){c=400}if(p.money<c){toast("Na dielňu treba "+c+" zl.","bad");return}if(r.hs)delete r.hs[l.id];
  try{build(p,t,l,false)}catch(e){console.warn("RPG dielňa",e);return}try{SND.play("coin")}catch(e){}try{save()}catch(e){}
  try{queue({title:"Vlastná dielňa",html:"<p>Cech ti povolil otvoriť vlastnú dielňu – "+((BT[t]||{}).n||"dielňa")+", "+RPG.ZN.remeslo+".</p><p>Môžeš v nej pracovať sám (najlepší zárobok) a pri pulte správy dielne najímať robotníkov a určovať výrobu. Dielňu nájdeš v denníku (B).</p>"})}catch(e){}
  try{window.__m3re&&window.__m3re()}catch(e){}}
 /* mešťan: meštianske právo, prvý zápis erbu zadarmo */
 function citizen(){const r=R(),p=P();if(!r||p.money<300)return;pay(300);r.rank=4;p.title=Math.max(1,p.title|0);S.armFree=1;try{chron(p.head.name+" z rodu "+p.name+" bol zapísaný medzi mešťanov Prešporka.","titul","good")}catch(e){}try{save()}catch(e){}
  try{queue({title:"Mešťan",html:"<p>Mestská rada ťa prijala medzi <b>mešťanov</b> Prešporka.</p><p>Smieš nosiť <b>vlastný erb</b> – herold ti ho hneď zapíše. Otvorili sa ti mestské knihy: v radnici voľby a úrady, v kostole kniha farnosti, na hrade kancelár. Doma v sieni nájdeš knihu rodu: sobáš, deti a dedičia.</p>"})}catch(e){}
  try{A.armsEd()}catch(e){}try{window.__m3re&&window.__m3re()}catch(e){}}
 /* radný = mestský úrad zo starých volieb, šľachtic = titul zeman a vyššie */
 setInterval(()=>{const r=R();if(!r||(r.rank|0)<4)return;try{const p=P();if(r.rank===4&&officeOf(0)){r.rank=5;queue({title:"Radný",html:"<p>Získal si mestský úrad. Odteraz patríš medzi <b>radných</b> mesta.</p>"});save()}
   if(r.rank>=4&&r.rank<6&&(p.title|0)>=2){r.rank=6;queue({title:"Šľachtic",html:"<p>Kráľ ti udelil šľachtický titul. Tvoj rod patrí medzi <b>šľachtu</b>.</p>"});save()}}catch(e){}},2500);
 function scribe(){const r=R();if(!r)return;const p=P(),rk=r.rank|0,o=[],hl=p.lot!=null&&own(r)?(p.house|0):-1;
  o.push({t:"Kúpiť chalupu v Podhradí · 120 zl",s:hl>=0?"dom už máš":"vlastná strecha nad hlavou",off:hl>=0||p.money<120,f:()=>buyHouse("podhradie",0,120,"Chalupa v Podhradí")});
  o.push({t:"Kúpiť dom v Remeselníckej štvrti · 320 zl",s:rk<2?"predáva sa len tovarišom a majstrom":hl>=1?"taký dom už máš":"murovaný dom remeselníka",off:rk<2||hl>=1||p.money<320,f:()=>buyHouse("remeslo",1,320,"Dom v Remeselníckej štvrti")});
  let c=0,t=craftType(r);try{if(t)c=bcost(t)}catch(e){}const mineN=S.bld.filter(b=>b.owner===0).length;
  o.push({t:"Otvoriť vlastnú dielňu"+(c?" · "+c+" zl":""),s:rk<3?"len pre majstrov":hl<0?"najprv treba vlastný dom":mineN>=1?"dielňu už máš":"dielňa tvojho remesla ("+r.craft+")",off:rk<3||hl<0||mineN>=1||!t||p.money<c,g:1,f:openShop});
  if(rk===3)o.push({t:"Meštianske právo · 300 zl",s:hl<0?"treba vlastný dom v meste":"zápis medzi mešťanov, vlastný erb, mestské knihy a voľby",off:hl<0||p.money<300,g:1,f:citizen});
  if(rk>=4&&S.armFree)o.push({t:"Dať si zapísať erb",s:"zápis erbu máš zaplatený",g:1,f:()=>{try{A.armsEd()}catch(e){}}});
  menu("Mestský pisár","„Kúpy domov a cechové povolenia sa zapisujú u mňa. Čo to bude?“",o)}
 if(window.RPG){RPG.lodge=lodge;RPG.scribe=scribe;RPG.homeTxt=()=>{const r=R();if(!r)return"";return own(r)?"vlastný dom":hasRoom(r)?"izba v nocľahárni do dňa "+r.home.until:"bez strechy nad hlavou"}}
})();
