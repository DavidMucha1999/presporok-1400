/* ==== js/hra3d.js ==== */
/* Prešporok 1400 – celá hra v 3D (v299, etapa 1): hra sa spúšťa rovno v 3D meste. Úvodná obrazovka a založenie rodu sú pergamen nad
   mestom, ktoré krúži v pozadí; ponuka (Esc), uloženie a koniec štvrťroka sú v 3D. Pôvodné 2D rozhranie ostáva skryté ako dočasná záloha
   (ponuka → „Starý prehľad v 2D“, alebo adresa s ?2d; automatická kontrola ?kontrola beží v 2D). Herná logika sa nemení.
   Etapa 6 (v321): 2D záloha je preč – hra je len v 3D (pôvodné panely žijú už iba v knihe); návod v 3D (ovládanie krok za krokom, potom Prvé kroky rodu);
   automatická kontrola ?kontrola prechádza knihu, ponuku a 3D mesto. Autor: Dávid Mucha. */
(function(){"use strict";
 const P3D=true;window.P3D=true;
 document.body.classList.add("p3d");
 const css=document.createElement("style");css.textContent=`
body.p3d.p3d-menu #app{position:fixed;inset:0;z-index:57;overflow:auto;background:transparent!important}
body.p3d.p3d-menu .mainmenu,body.p3d.p3d-menu .newrod{background:transparent!important}
body.p3d.p3d-menu .mainmenu .mm-bg{display:none}
body.p3d.p3d-menu .mainmenu .mm-veil{background:radial-gradient(ellipse at 50% 45%,#0000 0,#0000 35%,#0008 100%)!important}
body.p3d.p3d-menu .mm-in{background:#f6ecd2ee;color:#2b2117;border:2px solid #b8862b;border-radius:12px;box-shadow:0 10px 40px #000b;padding:22px 26px}
body.p3d.p3d-menu .mm-in .mm-title,body.p3d.p3d-menu .mm-in .mm-kick,body.p3d.p3d-menu .mm-in .credit{color:#2b2117;text-shadow:none}
body.p3d.p3d-menu .newrod>*{background:#f6ecd2f2;color:#2b2117}
body.p3d:not(.p3d-menu) #app{display:none}
#p3dcoach{position:fixed;z-index:56;top:56px;left:50%;transform:translateX(-50%);width:min(560px,60vw);background:#f6ecd2f2;color:#2b2117;border:2px solid #b8862b;border-radius:10px;box-shadow:0 6px 24px #000a;padding:8px 12px;font:15px/1.35 "EB Garamond",Georgia,serif}
#p3dcoach .ch{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:3px}
#p3dcoach .ch b{font-family:"Almendra SC","EB Garamond",Georgia,serif;color:#7a4f12}
#p3dcoach .cb{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
#p3dcoach button{background:#fff8e4;color:#2b2117;border:1.5px solid #b8862b;border-radius:14px;padding:2px 10px;font:600 13px "EB Garamond",Georgia,serif;cursor:pointer}
#p3dcoach button.pri{background:#b8862b;color:#fff}
#p3dcoach kbd{font:700 13px Georgia,serif;background:#fff;border:1px solid #b8862b;border-radius:4px;padding:0 4px}
#p3dcoach .dots{display:flex;gap:4px}#p3dcoach .dots i{width:8px;height:8px;border-radius:50%;background:#d8c49a}#p3dcoach .dots i.on{background:#b8862b}
body.p3d-book #p3dcoach,body.p3d-menu #p3dcoach{display:none}
body:has(#m3d .m3panel:not([hidden])) #p3dcoach,body:has(#p3dreg) #p3dcoach{display:none}
body.p3d.p3d-menu #dside,body.p3d.p3d-menu #nreasel{z-index:58!important}
body.p3d.p3d-menu #dscene{visibility:hidden}
body.p3d.p3d-menu .mm-in .mm-title span{color:#9a6418!important}
body.p3d #modal .mbox{background:#f6ecd2;color:#2b2117;border:2px solid #b8862b;font-family:"EB Garamond",Georgia,serif}
#m3d.m3title>:not(canvas){display:none!important}
body.p3d.p3d-book #dside{z-index:58!important;left:auto!important;right:12px!important;top:54px!important;bottom:auto!important;transform:none!important;width:min(640px,50vw)!important;height:calc(100vh - 66px)!important;max-height:calc(100vh - 66px)!important;box-shadow:0 12px 40px #000b!important;border-radius:12px}
body.p3d-book #m3d .m3nav,body.p3d-book #m3d .m3help,body.p3d-book #m3d .m3hint,body.p3d-book #m3d .m3panel{display:none!important}
#p3dreg{position:fixed;z-index:58;right:12px;top:54px;width:min(420px,40vw);max-height:calc(100vh - 66px);overflow:auto;background:#f6ecd2f7;color:#2b2117;border:2px solid #b8862b;border-radius:12px;box-shadow:0 12px 40px #000b;padding:10px 12px;font:15px/1.3 "EB Garamond",Georgia,serif}
#p3dreg .rh{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}#p3dreg .rh b{font:700 19px "Almendra SC","EB Garamond",Georgia,serif;color:#7a4f12}
#p3dreg h4{margin:8px 0 3px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#8a6418}
#p3dreg .rr{display:flex;width:100%;gap:8px;align-items:center;text-align:left;background:#fff8e4;border:1px solid #c9b07a;border-radius:8px;padding:5px 8px;margin:3px 0;cursor:pointer;font:inherit;color:inherit}
#p3dreg .rr:hover{background:#ffeebc}#p3dreg .rr span{flex:1}#p3dreg .rr small{display:block;color:#6a5a3a}#p3dreg .rr em{font-style:normal;font-size:13px;color:#7a4f12;white-space:nowrap}
#p3dreg .rx{background:#fff8e4;border:1.5px solid #b8862b;border-radius:14px;padding:1px 9px;cursor:pointer;font:600 13px Georgia,serif}
body.p3d-book #p3dreg{display:none}
body:has(#p3dreg) #m3d .m3nav,body:has(#p3dreg) #m3d .m3panel{display:none!important}
body.p3d.p3d-book #dscene{visibility:hidden}
body.p3d.p3d-book.p3d-book2 #app{display:block!important;position:fixed;left:auto;right:12px;top:54px;transform:none;width:min(640px,50vw);height:calc(100vh - 66px);overflow:auto;z-index:58;background:#efe4c8;border:2px solid #b8862b;border-radius:12px;box-shadow:0 18px 60px #000c;padding:10px 6px}
body.p3d.p3d-book2 #app>header.top,body.p3d.p3d-book2 #app .mapsheet,body.p3d.p3d-book2 #app .navrow{display:none!important}
#p3dbookbg{position:fixed;inset:0;z-index:57;background:linear-gradient(90deg,#0000 0,#0000 40%,#0005 100%)}
#p3dbookx{position:fixed;z-index:59;top:48px;right:4px;left:auto;width:34px;height:34px;border-radius:50%;border:2px solid #b8862b;background:#f6ecd2;color:#2b2117;font:700 18px Georgia,serif;cursor:pointer;box-shadow:0 3px 10px #0008}
#p3dbookn{display:none!important;position:fixed;z-index:59;bottom:8px;max-width:94vw;left:50%;transform:translateX(-50%);display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
#p3dbookn button{background:#f6ecd2;color:#2b2117;border:1.5px solid #b8862b;border-radius:16px;padding:4px 12px;font:600 14px "EB Garamond",Georgia,serif;cursor:pointer}
#p3dbookn button.on{background:#b8862b;color:#fff}
#p3dload{position:fixed;inset:0;z-index:56;display:flex;align-items:center;justify-content:center;background:#1a120a;color:#e8d9b0;font:600 20px "EB Garamond",Georgia,serif;letter-spacing:.04em}`;document.head.appendChild(css);
 /* uloženie: ukážkový rod v pozadí úvodnej obrazovky sa nikdy neuloží */
 const save0=save;save=function(){if(S&&S.__demo)return;return save0.apply(this,arguments)};
 let busy=false,lastS=null,lastT=-1,lastC=null,pend=false;
 function demo(){try{newGame({name:"Bielik",first:"Ján",gender:"m",cls:START.cls,arms:Object.assign({},START.arms),look:Object.assign({},START.look,{g:"m"})});S.__demo=1;S.slot=0}catch(e){console.warn("3D úvod",e);S=null}}
 function cover(on){let d=document.getElementById("p3dload");if(on&&!d){d=document.createElement("div");d.id="p3dload";d.textContent="Prešporok 1400";document.body.appendChild(d)}if(!on&&d)d.remove()}
 /* otvorí 3D mesto pre aktuálny stav (pri ukážkovom rode ako úvodnú obrazovku) */
 function go(){if(busy||!S)return;busy=true;lastS=S;lastT=S.turn;lastC=S.cur;pend=false;try{A.m3title(!!S.__demo)}catch(e){}
  const op=()=>{try{A.m3d()}catch(e){}busy=false;let n=0;const w=setInterval(()=>{if(document.getElementById("m3d")||++n>60){clearInterval(w);cover(false)}},250)};
  if(document.getElementById("m3d")){try{A.m3dx()}catch(e){}setTimeout(op,40)}else setTimeout(op,0)}
 function sync(){if(busy)return;if(!S){demo();if(S)go();return}if(S!==lastS){cover(!S.__demo);go();return}if(S.turn!==lastT){lastT=S.turn;pend=true}if(!S.__demo&&S.cur!==lastC&&document.getElementById("m3d")){/* iné mesto (z knihy alebo mapy sveta): postav 3D mesto nanovo */bookOff();cover(true);go()}}
 const r0=render;render=function(){const dm=S&&S.__demo;document.body.classList.toggle("p3d-menu",!S||!!dm);let r;if(dm){const s=S;S=null;try{r=r0.apply(this,arguments)}finally{S=s}}else r=r0.apply(this,arguments);try{sync()}catch(e){console.warn("3D hra",e)}try{bookCheck()}catch(e){}return r};
 const m0=A.m3d;A.m3d=function(){if(S)lastC=S.cur;return m0.apply(this,arguments)};
 /* po konci štvrťroka (keď sa zavrú hlásenia) sa mesto postaví znova – nové ročné obdobie, počasie, stavby */
 setInterval(()=>{if(!pend||busy||!S||S.__demo)return;const md=document.getElementById("modal");if(md&&!md.hidden)return;if(!document.getElementById("m3d"))return;pend=false;try{window.__m3re&&window.__m3re()}catch(e){}},400);
 /* kniha (etapa 2, v302–v311): obsah kariet z pôvodného rozhrania (bočný panel #dside) v knihe nad 3D mestom; 2D panely sa vtedy smú stavať aj pri otvorenom 3D; dole záložky; Esc, B, krížik alebo klik mimo zatvorí; denník je samostatný pergamen */
 const BOOKT=[["mesto","Mesto"],["dielne","Dielne"],["trh","Trh a sklad"],["rod","Rod"],["dennik","Denník a kronika"]],
  /* inštitúcie (etapa 4): odomknú sa v roku 1405 alebo s titulom (rovnako ako v 2D) */
  BOOKW=[["svet","Svet"],["radnica","Radnica"],["rody","Rody"],["kariera","Kariéra"],["cirkev","Cirkev"],["dvor","Dvor"],["majetok","Majetok"],["stat","Štát"]],WGATE=BOOKW.map(x=>x[0]);
 const wOpen=()=>{try{if(S.rpg)return(S.rpg.rank|0)>=4;return S.year>=1405||((P()||{}).title||0)>=2}catch(e){return true}};let lastV="dielne",reqV="dielne";
 const bookOpen=()=>document.body.classList.contains("p3d-book");
 let bookW=null;function bookUI(){const wo=wOpen();if(bookW!==null&&bookW!==wo){["p3dbookbg","p3dbookx","p3dbookn"].forEach(id=>{const e=document.getElementById(id);if(e)e.remove()})}bookW=wo;if(!document.getElementById("p3dbookbg")){const bg=document.createElement("div");bg.id="p3dbookbg";bg.onclick=()=>A.p3dBook(null);document.body.appendChild(bg);const x=document.createElement("button");x.id="p3dbookx";x.title="Zavrieť knihu (Esc)";x.textContent="✕";x.onclick=()=>A.p3dBook(null);document.body.appendChild(x);const n=document.createElement("nav");n.id="p3dbookn";n.innerHTML=BOOKT.concat(wOpen()?BOOKW:[]).map(([v,l])=>'<button data-bv="'+v+'">'+l+'</button>').join("");n.onclick=e=>{const b=e.target.closest("[data-bv]");if(b)A.p3dBook(b.dataset.bv)};document.body.appendChild(n)}
  const v=reqV==="dennik"?"dennik":S&&S.view;document.querySelectorAll("#p3dbookn [data-bv]").forEach(b=>b.classList.toggle("on",b.dataset.bv===v))}
 function bookOff(){document.body.classList.remove("p3d-book","p3d-book2");try{window.__m3&&window.__m3.focus&&(window.__m3.focus(null),window.__m3.boards())}catch(e){}["p3dbookbg","p3dbookx","p3dbookn"].forEach(id=>{const e=document.getElementById(id);if(e)e.remove()});try{const c=document.querySelector("#m3d canvas");if(c)c.focus()}catch(e){}}
 function bookCheck(){if(!bookOpen())return;if(!S||S.__demo){bookOff();return}const ds=!!document.getElementById("dside");document.body.classList.toggle("p3d-book2",!ds&&S.view==="mesto");if(!ds&&S.view==="mesto"&&WGATE.includes(reqV)){toast(S.rpg?"Mestské knihy sú otvorené len mešťanom. Meštianske právo dostaneš ako majster s domom u mestského pisára.":"Táto časť sa otvorí v roku 1405 alebo s titulom šľachtica.","bad");reqV="mesto"}if(!ds&&S.view!=="mesto"){bookOff();toast("Túto časť knihy sa nepodarilo otvoriť.","bad");return}if(reqV!=="dennik"&&S.view)lastV=S.view;bookUI()}
 const PMAP={rody:"radnica",svet:"radnica",stat:"dvor",dennik:"rod",kronika:"rod"};
 const placeFor=v=>{try{const M=window.__m3;return M&&M.placeOf?M.placeOf(PMAP[v]||v):null}catch(e){return null}};
 let focT=null,focAt=0;function focusFor(v){try{const M=window.__m3;if(!M||!M.focus)return;if(!focT&&Date.now()-focAt<500)return;focAt=Date.now();if(focT){M.focus(focT);focT=null;return}const n=M.near&&M.near();if(n){M.focus(n);return}const pl=placeFor(v);if(pl&&!M.inRoom()){const q=M.pos();if(Math.hypot(pl.x-q[0],pl.z-q[1])<45){M.focus(pl);return}}M.focus(null)}catch(e){}}
 const tab0=A.tab;A.tab=function(e){if(e&&e.v)reqV=e.v;const on=S&&!S.__demo&&document.getElementById("m3d");if(on){if(!bookOpen())focusFor(e&&e.v);document.body.classList.add("p3d-book");regOff()}const r=tab0.apply(this,arguments);if(on)setTimeout(bookCheck,60);return r};
 A.p3dBook=function(e){if(e===null){bookOff();return}if(!S||S.__demo)return;const v=typeof e==="string"?e:(e&&e.v)||lastV;reqV=v;const jClose=()=>{const jc=[...document.querySelectorAll("#dside button")].find(b=>/Zavrieť/.test(b.textContent));if(jc)jc.click()};
  if(!bookOpen())focusFor(v);regOff();if(v==="dennik"){document.body.classList.add("p3d-book");if(!document.body.classList.contains("hb")||!document.getElementById("dside"))A.tab({v:lastV&&lastV!=="mesto"&&lastV!=="dennik"?lastV:"dielne"});reqV="dennik";try{A.journal()}catch(x){}setTimeout(bookCheck,80);return}
  if(reqV==="dennik"||document.body.classList.contains("hbj"))jClose();reqV=v;A.tab({v})};
 const REG=[["Tvoj rod",[["dielne","Dielne","výroba, robotníci, vylepšenia"],["trh","Trh","nákup a predaj pri stánkoch"],["cen","Tabuľa cien","porovnanie cien v mestách","cen"],["sklad","Sklad rodu","zásoby v meste, pri sídle"],["karavany","Vozáreň","karavány: vozy, trasy, lode","kar"],["kraj","Krajčír","odev rodu","kraj"],["rod","Sídlo rodu","rodina, rodokmeň, služby"],["dennik","Pisár s kronikou","ciele, kronika, noviny"]]],
  ["Mesto",[["mesto","Vývesná tabuľa","štvrťrok, ciele, príležitosti"],["radnica","Radnica","voľby, úrady",1],["rody","Rody mesta","hlavy rodov, spojenectvá",1],["svet","Mapa sveta","mestá Európy, obchodné práva",1],["cirkev","Kostol","cirkev a rod",1],["majetok","Úžerník","majetok a dlhy",1]]],
  ["Hrad",[["dvor","Dvor","tituly a priazeň",1],["kariera","Kariéra","postup rodu",1],["stat","Kancelária","štát a štatistika",1]]]];
 function regOff(){const r=document.getElementById("p3dreg");if(r)r.remove()}
 function regOpen(v,sub){const rv=v==="karavany"||v==="kraj"||v==="sklad"||v==="cen"?"trh":v;A.p3dBook(rv);if(sub)setTimeout(()=>{try{S.ttab=sub;render()}catch(x){}},60)}
 A.p3dSub=function(v,sub){A.p3dBook(v);setTimeout(()=>{try{S.ttab=sub;render()}catch(x){}},60)};
 A.p3dReg=function(){if(!S||S.__demo)return;if(document.getElementById("p3dreg")){regOff();return}if(bookOpen())bookOff();const M=window.__m3,me=M&&M.pos?M.pos():null,inR=M&&M.inRoom&&M.inRoom(),wo=wOpen();
  let h='<div class="rh"><b>📖 Kniha miest</b><button class="rx" data-r="x" title="Zavrieť (B alebo Esc)">✕</button></div><div class="muted" style="font-size:13px">Vyber, kam ísť – stránka sa otvorí pri predmete.</div>';
  REG.forEach(([g,rows])=>{const vis=rows.filter(x=>x[3]!==1||wo);if(!vis.length)return;h+="<h4>"+g+"</h4>";vis.forEach(([v,l,d,sub])=>{const pl=placeFor(v);const dd=pl&&me&&!inR?Math.round(Math.hypot(pl.x-me[0],pl.z-me[1])):null;
   h+='<button class="rr" data-r="'+v+'"'+(typeof sub==="string"?' data-s="'+sub+'"':"")+'><span>'+l+'<small>'+d+'</small></span><em>'+(dd==null?"otvoriť":dd<8?"tu":"ísť · "+dd+" m")+'</em></button>'})});
  if(!wo)h+='<div class="muted" style="font-size:13px;margin-top:6px">Radnica, dvor, kostol a ďalšie sa otvoria v roku 1405 alebo s titulom šľachtica.</div>';
  const d=document.createElement("div");d.id="p3dreg";d.innerHTML=h;d.onclick=e=>{const b=e.target.closest("[data-r]");if(!b)return;const v=b.dataset.r;if(v==="x"){regOff();return}regOff();
   const pl=placeFor(v);if(pl&&M&&!M.inRoom()){const q=M.pos();if(Math.hypot(pl.x-q[0],pl.z-q[1])>=8)M.goTo(pl);focT=pl;setTimeout(()=>regOpen(v,b.dataset.s),120)}else regOpen(v,b.dataset.s)};document.body.appendChild(d)};
 addEventListener("keydown",e=>{if(e.key==="Escape"&&document.getElementById("p3dreg")&&!document.querySelector("#modal:not([hidden])")){e.preventDefault();e.stopImmediatePropagation();regOff()}},true);
 /* sídlo: rodina, predkovia, kronika */
 A.p3dRod=function(sec){A.p3dBook("rod");if(sec)setTimeout(()=>{try{A.rodSec({v:sec})}catch(x){}},40)};
 /* ponuka (Esc) */
 const B=(a,t,c)=>'<button class="gm-b'+(c?" "+c:"")+'" data-a="'+a+'"><span>'+t+'</span></button>';
 A.gameMenu=function(){if(!S||S.__demo)return;queue({title:"Ponuka",html:'<div class="gm">'+B("mclose","▶ Pokračovať v hre")+B("gmSave","💾 Uložiť hru")+B("saves","📜 Uložené hry")+
  '<div class="gm-two">'+B("music","♪ Hudba")+B("sfx","🔔 Zvuky")+B("help","📖 Kniha vedomostí")+B("settings","⚙ Nastavenia")+'</div>'+
  B("toMenu","↩ Do hlavného menu")+B("menuQuit","🚪 Ukončiť hru","quit")+'</div><div class="muted gm-n">Klávesom Esc otvoríš túto ponuku kedykoľvek.</div>'})};
 /* návod v 3D (etapa 6): päť krokov ovládania (hotové sa uložia v S.tut3), potom Prvé kroky rodu s tlačidlom do knihy */
 const g0=A.gameMenu;let seenMenu=false;A.gameMenu=function(){seenMenu=true;return g0.apply(this,arguments)};
 const TUT=[["Chôdza","Choď po meste klávesmi <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> alebo šípkami. Ťahaním myši sa rozhliadneš, kolieskom priblížiš, <kbd>Shift</kbd> je beh."],
  ["Kniha miest","Stlač <kbd>B</kbd> alebo tlačidlo 📖 Kniha miest hore. Vyber miesto – dielne, trh, sídlo, vývesnú tabuľu – a hra ťa tam presunie a otvorí stránku pri ňom."],
  ["Miesta v meste","Prejdi k budove so žltým výkričníkom alebo k tabuli na trhu či námestí a stlač <kbd>E</kbd>. Stránka sa otvorí vpravo a kamera sa natočí na predmet."],
  ["Ponuka","<kbd>Esc</kbd> otvorí ponuku: uloženie, uložené hry, hudba, nastavenia a návrat do hlavného menu."],
  ["Koniec štvrťroka","Keď máš všetko pripravené, stlač <kbd>K</kbd> alebo ⏭ Ďalší štvrťrok. Robotníci vyrobia tovar, rod zarobí a mesto sa zmení podľa ročného obdobia."]];
 let tS=-1,tP=null,tT=-1,tB=false,tC=false,cH="";
 const cTop=d=>{try{const tb=document.querySelector("#m3d .m3top");let bt=0;if(tb)for(const c of tb.children){const r=c.getBoundingClientRect();if(r.height&&r.bottom>bt)bt=r.bottom}const v=Math.max(56,Math.round(bt+8))+"px";if(d.style.top!==v)d.style.top=v}catch(e){}};
 function coach(){const old=document.getElementById("p3dcoach");const hide=()=>{if(old)old.remove();cH=""};
  if(!S||S.__demo||!document.getElementById("m3d")||!window.__m3||!window.__m3.pos)return hide();
  const i=S.tut3==null?0:S.tut3;let h="";
  if(i<TUT.length){if(tS!==i){tS=i;tP=window.__m3.pos();tT=S.turn;tB=false;tC=false;seenMenu=false}
   const bo=document.body.classList.contains("p3d-book")||!!document.getElementById("p3dreg");if(!bo)tC=true;else if(tC)tB=true;
   let done=false;try{const q=window.__m3.pos();done=i===0?Math.hypot(q[0]-tP[0],q[1]-tP[1])>5:i===1?tB:i===2?(window.__m3.inRoom()||tB||!!document.querySelector("#m3d .m3panel:not([hidden])")):i===3?seenMenu:S.turn!==tT}catch(e){}
   if(done){S.tut3=i+1;if(S.tut3>=TUT.length)toast("Návod je hotový. Ďalej ťa povedú Prvé kroky rodu a úlohy vpravo hore.","good");return coach()}
   h='<div class="ch"><b>Návod · '+TUT[i][0]+'</b><span class="dots">'+TUT.map((_,k)=>'<i class="'+(k<=i?"on":"")+'"></i>').join("")+'</span></div><div>'+TUT[i][1]+'</div><div class="cb"><button data-c="skip">Preskočiť návod</button></div>'}
  else if(!S.guideOff&&typeof window.guideSteps==="function"&&S.year<(S.startY||1400)+4){let st=[];try{st=window.guideSteps()}catch(e){}const n=st.filter(x=>x[1]).length,nx=st.find(x=>!x[1]);
   if(nx)h='<div class="ch"><b>Prvé kroky rodu · '+n+' z '+st.length+'</b></div><div>Ďalší krok: <b>'+nx[0]+'</b></div><div class="cb">'+(nx[2]?'<button class="pri" data-c="g" data-v="'+nx[2]+'">📖 Otvoriť: '+nx[3]+'</button>':'<button class="pri" data-c="auto">Zapnúť správcu rodu</button>')+'<button data-c="off">Skryť</button></div>'}
  if(!h)return hide();if(h===cH&&old){cTop(old);return}cH=h;
  let d=old;if(!d){d=document.createElement("div");d.id="p3dcoach";d.onclick=e=>{const b=e.target.closest("[data-c]");if(!b||!S)return;const c=b.dataset.c;
   if(c==="skip")S.tut3=TUT.length;else if(c==="off")S.guideOff=1;else if(c==="auto"){try{A.autoT()}catch(x){}}else if(c==="g")A.p3dBook(b.dataset.v);try{save()}catch(x){}coach()};document.body.appendChild(d)}
  d.innerHTML=h;cTop(d)}
 setInterval(()=>{try{coach()}catch(e){}},300);
 cover(true);setTimeout(()=>{try{render()}catch(e){}},0);
})();
