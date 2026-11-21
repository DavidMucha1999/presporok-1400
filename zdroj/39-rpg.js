/* ==== js/rpg.js ==== */
/* Prešporok 1400 – stredoveké RPG (v344, etapa 1: základ). Hráč začína ako sedliak bez dielne a s pár grošmi, hra beží po dňoch:
   hodiny plynú, kým si v meste (1 herná minúta za sekundu, deň 6:00–22:00), fázy dňa menia svetlo, spánkom sa začne nový deň.
   Postava má hlad a únavu. Hrá sa len v Prešporku (cestovanie do iných miest je vypnuté). Pôvodné hospodárstvo mesta (ceny, rody,
   voľby) beží na pozadí ďalej: jedno ročné obdobie trvá 30 dní. Stav je v S.rpg; staré uložené hry bez S.rpg bežia po starom.
   Autor: Dávid Mucha. */
(function(){"use strict";
 const DAYS=30,PHN=["ráno","deň","večer","noc"],RANKS=["Sedliak","Nádenník","Tovariš","Majster","Mešťan","Radný","Šľachtic"];
 const R=()=>{try{return S&&S.rpg&&!S.__demo?S.rpg:null}catch(e){return null}};
 const phOf=m=>{const h=(m/60)%24;return h>=21||h<6?3:h<9?0:h<17?1:2};
 const hm=m=>{const h=Math.floor(m/60)%24,mi=Math.floor(m%60);return h+":"+String(mi).padStart(2,"0")};
 /* nová hra: bez dielne, 12 zl, deň 1 o šiestej ráno */
 /* veľký Prešporok (etapa 3, v353): 160 pozemkov namiesto 45, päť štvrtí podľa polohy */
 const ZN={okolie:"Okolie mesta",podhradie:"Podhradie",remeslo:"Remeselnícka štvrť",trh:"Trhová štvrť a prístav",horne:"Horné mesto"};
 const inPoly=(x,y,P2)=>{let c=false;for(let i=0,j=P2.length-1;i<P2.length;j=i++){const a=P2[i],b=P2[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
 function zoneAt(L,x,y){const ins=inPoly(x,y,L.wall),dw=dpoly(x,y,L.wall.concat([L.wall[0]]));if(!ins)return"okolie";
  if(L.hill&&Math.hypot(x-L.hill[0],y-L.hill[1])<Math.max(380,L.W*.19))return"horne";
  if(Math.hypot(x-L.pl[0],y-L.pl[1])<L.W*.13||(L.river&&dpoly(x,y,L.river)<L.H*.15))return"trh";
  if(dw<L.H*.2&&x<L.cx+L.W*.06)return"podhradie";return"remeslo"}
 function bigCity(){const C=S.cities[0],L=cityLayout(C),zl2=l=>{const p=L.pos[l.id];return p?zoneAt(L,p.x,p.y):"okolie"};
  const empty=z=>C.lots.filter(l=>!l.pub&&l.b==null&&l.res==null&&zl2(l)===z),take=z=>{const E=empty(z);return E.length?E[Math.floor(Math.random()*E.length)]:null};
  for(const d of S.dyn){if(d.city!==0||d.royal||d.lot==null)continue;if(d.id===0){/* hráč začína bez strechy nad hlavou */const o0=C.lots[d.lot];if(o0)o0.res=null;d.lot=null;continue}const want=d.title>=2?"horne":d.title>=1?"trh":"remeslo",old=C.lots[d.lot];if(!old||zl2(old)===want)continue;const nl=take(want);if(!nl)continue;old.res=null;nl.res=d.id;d.lot=nl.id}
  for(const b of S.bld){if(b.city!==0)continue;const want=/krcma|kupec|pivovar|vinar/.test(b.type)?"trh":b.type==="brloh"?"podhradie":"remeslo",old=C.lots[b.lot];if(!old||zl2(old)===want)continue;const nl=take(want);if(!nl)continue;old.b=null;nl.b=b.id;b.lot=nl.id}
  const hs={},PR={okolie:[.45,[0]],podhradie:[.85,[0,0,1]],remeslo:[.72,[1,1,0,2]],trh:[.72,[1,2,2]],horne:[.8,[2,3,3]]};
  for(const l of C.lots){if(l.pub||l.b!=null||l.res!=null)continue;const z=zl2(l),pr=PR[z];if(Math.random()<pr[0])hs[l.id]=pr[1][Math.floor(Math.random()*pr[1].length)]}
  S.rpg.hs=hs;S.rpg.big=1}
 let NEW=false;const b0=build;build=function(d){if(NEW&&d&&d.id===0)return{};return b0.apply(this,arguments)};
 const n0=newGame;newGame=function(o){const D=CITY_DEF[0],keep=[D.cols,D.rows,D.ai];["Bauer","Kováč","Molnár","Fischer","Wagner","Schmidt","Lang","Horvát"].forEach(n=>{if(!D.sur.includes(n))D.sur.push(n)});D.cols=16;D.rows=10;D.ai=Math.min(10,D.sur.length);
  NEW=true;try{n0.apply(this,arguments)}finally{NEW=false;D.cols=keep[0];D.rows=keep[1];D.ai=keep[2]}
  try{const p=P();p.money=12;p.title=0;S.rpg={day:1,min:360,hunger:25,tired:0,rank:0,sk:{},ph:0,tut:0};S.tut3=5;S.guideOff=1;S.ap=apMax(p);try{bigCity()}catch(x){console.warn("RPG mesto",x)}
   const e=S.log&&S.log[0];if(e&&/jedinou dielňou/.test(e.text||""))e.text="Rok Pána 1400. "+p.head.name+" z rodu "+p.name+" prichádza do Prešporka ako sedliak: bez majetku, s dvanástimi zlatými vo vrecku.";
   try{recordWealth();resetLed()}catch(x){}}catch(x){console.warn("RPG štart",x)}};
 /* fáza dňa podľa hodín (svetlo v 3D): noc = žiadne body činnosti */
 const dp0=dayPhase;dayPhase=function(){let r=null;try{r=S&&S.rpg}catch(e){}if(!r)return dp0.apply(this,arguments);const q=phOf(r.min);return q===3?2:q};
 const apSync=()=>{const r=S.rpg;S.ap=phOf(r.min)===3?0:Math.max(1,apMax(P()))};
 const M3=()=>window.__m3&&window.__m3.pos&&document.getElementById("m3d")?window.__m3:null;
 const busy=()=>!!document.querySelector("#modal:not([hidden])")||document.body.classList.contains("p3d-book")||!!document.getElementById("p3dload");
 let pendRe=false,warnH=0,warnT=0,warnZ=0,okPos=null;
 const rebuild=()=>{pendRe=true};
 function hud(){const r=R();if(!r)return"";const p=P();return"Deň "+r.day+" · "+hm(r.min)+" · 💰 "+Math.round(p.money)+" zl · 🍞 "+Math.round(r.hunger)+" % · 💤 "+Math.round(r.tired)+" %"}
 function hudUp(){try{const h=document.querySelector("#m3d .m3hud");if(h){const t=hud();if(h.textContent!==t)h.textContent=t;h.title="Deň, hodina, peniaze, hlad a únava"}const r=R(),b=document.querySelector("#m3d .m3top>b");if(b&&r){const n="Prešporok"+(r.zn&&ZN[r.zn]?" · "+ZN[r.zn]:"");if(b.textContent!==n)b.textContent=n}}catch(e){}}
 /* nový deň */
 function newDay(tired,msg){const r=S.rpg;r.day++;r.min=360;r.tired=tired;r.hunger=Math.min(100,r.hunger+18);r.ph=0;apSync();warnH=warnT=0;if(r.home&&r.home.t==="izba"&&r.day>r.home.until){r.home=null;setTimeout(()=>toast("Nájom izby sa skončil. Predĺž si ho v nocľahárni.","bad"),2500)}
  try{const p=P();if(r.hunger>=100){toast("Zobudil si sa hladný a zoslabnutý. Najedz sa čo najskôr.","bad")}else toast(msg||("Deň "+r.day+". Svitá."),"good");void p}catch(e){}
  try{save()}catch(e){}
  /* ročné obdobie = 30 dní: mesto, ceny, rody a voľby sa posunú starým kolom */
  if((r.day-1)%DAYS===0){const p=P(),m0=p.money,d0=p.debt;try{A.end()}catch(e){console.warn("RPG obdobie",e)}/* sedliak bez majetku neplatí štvrťročné výdavky starého hospodárstva */if((r.rank|0)<3){p.money=m0;p.debt=d0;try{save()}catch(e){}}}else rebuild();hudUp()}
 A.rpgSleep=function(e){const r=R();if(!r)return;const where=(e&&e.w)||"seno",h=(r.min/60)%24,p=P(),cost=(e&&e.cost)||0;
  if(h>=6&&h<18&&r.tired<60){toast("Ešte nie si unavený. Spať môžeš večer po šiestej, alebo keď budeš vyčerpaný.","bad");return}
  if(cost){if(p.money<cost){toast("Na nocľah nemáš peniaze.","bad");return}p.money-=cost;try{led(p,"ine",-cost)}catch(x){}}
  const T2={seno:[12,"Prespal si na sene."],pricna:[5,"Prespal si na prični v nocľahárni."],izba:[0,"Vyspal si sa vo svojej izbe."],lozko:[0,"Vyspal si sa vo vlastnej posteli."]}[where]||[12,"Prespal si."];
  if(where==="lozko")r.hunger=Math.max(0,r.hunger-8);newDay(T2[0],T2[1]+" Deň "+(r.day+1)+", svitá.")};
 A.rpgEat=function(){const r=R();if(!r)return;const p=P();if(r.hunger<15){toast("Nie si hladný.","bad");return}if(p.money<1){toast("Na jedlo nemáš ani zlatku. Najprv si niečo zarob.","bad");return}
  p.money-=1;try{led(p,"ine",-1)}catch(x){}r.hunger=Math.max(0,r.hunger-50);r.ate=1;try{SND.play("coin")}catch(x){}toast("Chlieb a miska polievky za 1 zl. Hlad "+Math.round(r.hunger)+" %.","good");try{save()}catch(x){}hudUp()};
 /* hodiny: 1 herná minúta za sekundu, kým je hráč v 3D meste a nič nie je otvorené */
 setInterval(()=>{let r=null;try{r=R()}catch(e){}document.body.classList.toggle("rpg",!!r);if(!r)return;const M=M3();if(!M)return;
  if(!r.intro&&!busy()){r.intro=1;try{save()}catch(e){}try{queue({title:"Sedliak v Prešporku",html:'<p>Píše sa rok 1400. Prišiel si do Prešporka <b>bez majetku</b>, s dvanástimi zlatými vo vrecku.</p><p><b>Deň</b> sa začína o šiestej ráno a hodiny plynú, kým chodíš po meste. Večer si nájdi nocľah – <b>senník pri bráne</b> je zadarmo, v <b>nocľahárni</b> je prična za zlatku – a spánkom začneš nový deň.</p><p>Sleduj <b>hlad</b> a <b>únavu</b> hore na lište. Najesť sa môžeš pri <b>pekárke na námestí</b> za 1 zl.</p><p><b>Zarobiť</b> si môžeš na poli a vo vinohrade za mestom, u rybára pri Dunaji, nosením vriec pre kupca alebo pomocnou prácou v dielňach rodov. Všetko nájdeš v denníku (B).</p><p class="muted">W A S D chôdza · myš pohľad · E použiť · B denník postavy · Esc ponuka</p>'})}catch(e){}return}
  if(!busy()&&!document.hidden){const p0=phOf(r.min);r.min+=1;r.hunger=Math.min(100,r.hunger+.07);r.tired=Math.min(100,r.tired+.1);const p1=phOf(r.min);
   if(p1!==p0){r.ph=p1;apSync();if(p1!==1)rebuild();toast(["Svitá, je ráno.","Slnko je vysoko, je deň.","Zvečerieva sa. Čas hľadať nocľah.","Padla noc."][p1],"info")}
   if(r.hunger>=80&&!warnH){warnH=1;toast("Si hladný. Najedz sa pri pekárke na námestí.","bad")}if(r.tired>=85&&!warnT){warnT=1;toast("Si veľmi unavený. Nájdi si nocľah.","bad")}
   if(r.min>=1560||r.tired>=100){newDay(35,"Od únavy si zaspal, kde si stál. Deň "+(r.day+1)+", bolí ťa celé telo.");return}}
  try{if(!M.inRoom()&&M.lay&&r.big){const q=M.pos(),a=M.toLay(q[0],q[1]),z=zoneAt(M.lay(),a[0],a[1]);if(z==="horne"&&(r.rank|0)<1){if(okPos){M.go(okPos[0],okPos[1])}if(!warnZ||Date.now()-warnZ>6000){warnZ=Date.now();toast("Stráž ťa do Horného mesta nepustí. Sedliaci tam nemajú čo hľadať – vráť sa ako nádenník.","bad")}}else{okPos=q;if(z!==r.zn){r.zn=z;if(!busy())toast(ZN[z],"info")}}}}catch(e){}
  if(pendRe&&!busy()&&!M.inRoom()&&!document.querySelector("#m3d .m3panel:not([hidden])")&&window.__m3re){pendRe=false;try{window.__m3re()}catch(e){}}
  hudUp()},1000);
 /* návod pre RPG (v363): päť krokov, ktoré sa odškrtnú samy; potom riadok s ďalším cieľom (dá sa skryť) */
 const TUT=[["Chôdza","Choď po meste klávesmi <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd>. Ťahaním myši sa rozhliadneš, kolieskom priblížiš, <kbd>Shift</kbd> je beh."],
  ["Denník postavy","Stlač <kbd>B</kbd>. V denníku vidíš peniaze, hlad, únavu, zručnosti a miesta, kam ísť – výber ťa tam hneď zavedie."],
  ["Prvá práca","V denníku vyber <b>Pole za bránou</b>. Pri každom trse obilia stlač <kbd>E</kbd> a keď je pokosené, vypýtaj si mzdu u gazdu, ktorý stojí vedľa."],
  ["Jedlo","Hlad rastie s časom a prácou. Najedz sa u <b>pekárky na námestí</b> – chlieb a polievka stoja 1 zl."],
  ["Nocľah","Večer po šiestej choď spať: <b>senník pri bráne</b> je zadarmo, v <b>nocľahárni</b> je prična za zlatku. Spánkom sa začne nový deň a hra sa uloží."]];
 let tS=-1,tP=null,tB=false,cH="";
 function coach(){const old=document.getElementById("rpgcoach"),hide=()=>{if(old)old.remove();cH=""};const r=R(),M=M3();if(!r||!M||!r.intro)return hide();const i=r.tut==null?TUT.length:r.tut;let h="";
  if(i<TUT.length){if(tS!==i){tS=i;tP=M.pos();tB=false}if(document.getElementById("p3dreg"))tB=true;let done=false;try{const q=M.pos();done=i===0?Math.hypot(q[0]-tP[0],q[1]-tP[1])>5:i===1?tB:i===2?(r.earned||0)>0:i===3?!!r.ate:r.day>1}catch(e){}
   if(done){r.tut=i+1;if(r.tut>=TUT.length)toast("Návod je hotový. Ďalší cieľ nájdeš hore a v denníku (B).","good");try{save()}catch(e){}return coach()}
   h='<div class="ch"><b>Návod · '+TUT[i][0]+'</b><span class="dots">'+TUT.map((_,k)=>'<i class="'+(k<=i?"on":"")+'"></i>').join("")+'</span></div><div>'+TUT[i][1]+'</div><div class="cb"><button data-c="skip">Preskočiť návod</button></div>'}
  else if(!r.goalOff&&window.RPG&&RPG.next&&RPG.next())h='<div class="ch"><b>Ďalší cieľ</b><button data-c="off" title="Skryť">✕</button></div><div>'+RPG.next()+'</div>';
  if(!h)return hide();if(h===cH&&old)return;cH=h;let d=old;if(!d){d=document.createElement("div");d.id="rpgcoach";d.onclick=e=>{const b=e.target.closest("[data-c]");const r2=R();if(!b||!r2)return;if(b.dataset.c==="skip")r2.tut=TUT.length;else r2.goalOff=1;try{save()}catch(x){}coach()};document.body.appendChild(d)}d.innerHTML=h}
 setInterval(()=>{try{coach()}catch(e){}},500);
 /* denník postavy (B) namiesto knihy miest */
 const reg0=A.p3dReg;A.p3dReg=function(){const r=R();if(!r)return reg0.apply(this,arguments);const old=document.getElementById("p3dreg");if(old){old.remove();return}try{A.p3dBook(null)}catch(e){}
  const p=P(),M=M3(),me=M?M.pos():null,bar=(v,c)=>'<div style="height:9px;background:#e2d4ae;border-radius:5px;overflow:hidden;margin:2px 0 7px"><i style="display:block;height:100%;width:'+Math.round(v)+'%;background:'+c+'"></i></div>';
  const PL=[["pole","Pole za bránou","kosenie obilia, mzdu vyplatí gazda"],["vino","Vinohrad za mestom","oberanie hrozna, mzdu vyplatí vinohradník"],["ryby","Rybár pri Dunaji","chytanie rýb"],["nosic","Kupec pri bráne","nosenie vriec na trh"],["dielna","Dielňa rodu","pomocná práca u majstra"],["jedlo","Pekárka na námestí","chlieb a polievka za 1 zl"],["sennik","Senník pri bráne","nocľah zadarmo"],["trh","Trh","stánky s tovarom"],["mesto","Vývesná tabuľa","čo sa v meste deje"],["nocl","Nocľaháreň","prična 1 zl, izba na týždeň 6 zl"],["pisar","Mestský pisár","kúpa domu, povolenie na dielňu"],["rod","Tvoj dom","lôžko, prestavba"],["dielne","Tvoja dielňa","práca, robotníci, výroba"]];
  let h='<div class="rh"><b>📖 Denník postavy</b><button class="rx" data-r="x" title="Zavrieť (B alebo Esc)">✕</button></div>'+
   '<div>'+((r.rank|0)>=4?(()=>{try{return shield(0,20)+" "}catch(e){return""}})():"")+'<b>'+p.head.name+" "+p.name+'</b> · '+RANKS[r.rank|0]+(r.craft?' ('+r.craft+')':'')+'</div>'+(window.RPG&&RPG.next&&RPG.next()?'<div style="font-size:13px;color:#7a4f12">'+RPG.next()+'</div>':'')+'<div hidden></div><div class="muted" style="font-size:13px">Deň '+r.day+" · "+hm(r.min)+" ("+PHN[phOf(r.min)]+") · "+["jar","leto","jeseň","zima"][S.season]+" "+S.year+'</div>'+
   '<h4>Stav</h4><div>Peniaze: <b>'+zl(Math.round(p.money))+'</b></div><div>Bývanie: '+(window.RPG&&RPG.homeTxt?RPG.homeTxt():"")+'</div><div>Hlad '+Math.round(r.hunger)+' %</div>'+bar(r.hunger,r.hunger>=80?"#a8321e":"#b8862b")+'<div>Únava '+Math.round(r.tired)+' %</div>'+bar(r.tired,r.tired>=85?"#a8321e":"#5a7a9a")+
   '<h4>Zručnosti</h4><div class="muted" style="font-size:13px">'+(Object.keys(r.sk||{}).length?Object.entries(r.sk).map(([k,v])=>k+" – úroveň "+Math.floor(v)+" ("+Math.round((v%1)*100)+" % k ďalšej)").join("<br>"):"Zatiaľ žiadne. Zručnosť rastie prácou.")+'</div>'+(window.RPG&&RPG.owed&&RPG.owed()?'<div>Nevyplatená mzda: <b>'+RPG.owed()+' zl</b></div>':"")+'<div class="muted" style="font-size:13px">Zarobené spolu: '+Math.round(r.earned||0)+' zl</div><h4>Kam ísť</h4>';
  PL.forEach(([v,l,d])=>{let pl=null;try{pl=M&&M.placeOf(v)}catch(e){}if(!pl)return;const dd=me&&!M.inRoom()?Math.round(Math.hypot(pl.x-me[0],pl.z-me[1])):null;h+='<button class="rr" data-r="'+v+'"><span>'+l+'<small>'+d+'</small></span><em>'+(dd==null?"":dd<8?"tu":"ísť · "+dd+" m")+'</em></button>'});
  const d=document.createElement("div");d.id="p3dreg";d.innerHTML=h;d.onclick=e=>{const b=e.target.closest("[data-r]");if(!b)return;const v=b.dataset.r;d.remove();if(v==="x")return;try{const pl=M&&M.placeOf(v);if(pl&&!M.inRoom())M.goTo(pl)}catch(x){}};document.body.appendChild(d)};
 const css=document.createElement("style");css.textContent="#rpgcoach{position:fixed;z-index:56;top:56px;left:50%;transform:translateX(-50%);width:min(560px,60vw);background:#f6ecd2f2;color:#2b2117;border:2px solid #b8862b;border-radius:10px;box-shadow:0 6px 24px #000a;padding:8px 12px;font:15px/1.35 \"EB Garamond\",Georgia,serif}#rpgcoach .ch{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:3px}#rpgcoach .ch b{font-family:\"Almendra SC\",\"EB Garamond\",Georgia,serif;color:#7a4f12}#rpgcoach .cb{margin-top:6px}#rpgcoach button{background:#fff8e4;color:#2b2117;border:1.5px solid #b8862b;border-radius:14px;padding:2px 10px;font:600 13px \"EB Garamond\",Georgia,serif;cursor:pointer}#rpgcoach kbd{font:700 13px Georgia,serif;background:#fff;border:1px solid #b8862b;border-radius:4px;padding:0 4px}#rpgcoach .dots{display:flex;gap:4px}#rpgcoach .dots i{width:8px;height:8px;border-radius:50%;background:#d8c49a}#rpgcoach .dots i.on{background:#b8862b}body.p3d-book #rpgcoach,body.p3d-menu #rpgcoach,body:has(#p3dreg) #rpgcoach,body:has(#rpgmini) #rpgcoach,body:has(#modal:not([hidden])) #rpgcoach,body:has(#m3d .m3panel:not([hidden])) #rpgcoach{display:none}body.rpg #m3d .m3tasks{display:none!important}body.rpg #m3d .m3top{flex-wrap:nowrap!important}body.rpg #m3d .m3top>*{white-space:nowrap;flex:0 0 auto}body.rpg #m3d .m3top>b{font-size:1rem}body.rpg #m3d .m3top>.m3fps,body.rpg #m3d .m3top>span{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis}";document.head.appendChild(css);
 window.RPG={on:()=>!!R(),hud,ZN,zoneAt,notice:()=>{const r=R();if(!r)return[];return["Deň "+r.day+" · "+["jar","leto","jeseň","zima"][S.season]+" "+S.year,"Do konca obdobia: "+(DAYS-((r.day-1)%DAYS))+" dní","Nocľah zadarmo: senník pri bráne.","Jedlo: pekárka na námestí, 1 zl.","Práca: pole, vinohrad, rybár, kupec pri bráne, dielne rodov."]}};
})();
