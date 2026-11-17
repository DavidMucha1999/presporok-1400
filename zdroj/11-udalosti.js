/* ==== js/udalosti.js ==== */
/* Udalosti v krajine (v16): lúpežníci, požiar, povodeň, sucho, vojsko – viditeľné na mape okolia a riešiteľné kliknutím */
(function(){
"use strict";
const KINDS={
 bandits:{n:"Lúpežníci na ceste",life:2},
 fire:{n:"Požiar v lese",life:2},
 flood:{n:"Povodeň",life:2},
 drought:{n:"Sucho na poliach",life:2},
 army:{n:"Vojsko pochoduje",life:1}};
const T=()=>Math.max(1,(typeof tierC==="function"?tierC():1));
const evs=()=>{S.okEv=S.okEv||[];return S.okEv};
const active=()=>{const c=CC().id;return evs().filter(e=>e.city===c)};
const loss=(p,pct,cap)=>Math.max(0,Math.min(Math.round(p.money*pct),cap*T()));
function pay(p,c){if(p.money<c)return false;p.money-=c;led(p,"ine",-c);return true}
function gain(p,c){p.money+=c;led(p,"ine",c)}
function ignorePenalty(e){const p=P();let c=0,txt="";
 if(e.k==="bandits"){c=loss(p,.05,700);txt=`Lúpežníci vyrabovali povozy na ceste a odniesli ${zl(c)}.`}
 else if(e.k==="fire"){c=loss(p,.06,800);txt=`Požiar v lese zničil drevo a časť porastu. Škoda ${zl(c)}.`}
 else if(e.k==="flood"){c=loss(p,.05,700);txt=`Rozvodnená rieka zaplavila mlyn a polia. Škoda ${zl(c)}.`}
 else if(e.k==="drought"){c=loss(p,.05,600);txt=`Sucho zničilo časť úrody. Škoda ${zl(c)}.`}
 else if(e.k==="army"){if(Math.random()<.3){c=loss(p,.03,400);txt=`Vojaci prechádzajúci krajom si vzali zásoby za ${zl(c)}.`}else txt="Vojsko prešlo krajom a pokračovalo ďalej."}
 if(c){p.money-=c;led(p,"ine",-c)}chron(txt,"titul",c?"bad":"")}
function spawn(){const p=P(),C=CC();if(C.id!==p.city)return;const cur=evs().filter(e=>e.city===C.id);if(cur.length>=2||Math.random()>.28)return;
 const se=S.season,w={bandits:1.2,fire:se===1||se===2?1.2:.2,flood:se===0||se===2?1:.15,drought:se===1?1.3:0,army:(typeof decreeOn==="function"&&decreeOn("vojna"))?1.8:.35};
 const tot=Object.values(w).reduce((a,b)=>a+b,0);let r=Math.random()*tot,k="bandits";for(const[kk,v]of Object.entries(w)){r-=v;if(r<=0){k=kk;break}}
 if(cur.some(e=>e.k===k))return;S.okEvN=(S.okEvN||0)+1;const e={id:S.okEvN,k,city:C.id,t0:S.turn,r:[0,1,4,5,6][(Math.random()*5)|0]};evs().push(e);
 chron(`V okolí mesta ${C.n}: ${KINDS[k].n}. Pozri si mapu okolia a rozhodni.`,"titul","")}
function expire(){const keep=[];for(const e of evs()){if(S.turn-e.t0>=KINDS[e.k].life){try{ignorePenalty(e)}catch(x){}}else keep.push(e)}S.okEv=keep}
{const o=estTurn;estTurn=function(){o();try{expire();spawn()}catch(x){console.warn("udalosti",x)}}}
const OPT={
 bandits:[["Najať stráž","c",400,"guard"],["Zaplatiť výpalné","c",200,"pay"],["Ignorovať","i"]],
 fire:[["Hasiť s poddanými","c",250,"put"],["Nechať vyhorieť","i"]],
 flood:[["Postaviť hrádzu","c",500,"dam"],["Zachrániť stáda a zásoby","c",100,"evac"],["Ignorovať","i"]],
 drought:[["Vykopať studne a polievať","c",300,"wells"],["Procesia za dážď","c",100,"pray"],["Ignorovať","i"]],
 army:[["Pohostiť vojakov","c",150,"feed"],["Zavrieť brány a nič nedať","i"]]};
const TXT={
 bandits:"Na ceste sa zdržiava banda lúpežníkov a prepadáva vozy. Môžeš najať stráž, ktorá ich vyženie, alebo sa vykúpiť.",
 fire:"V lese vypukol požiar. Plamene sa šíria k poľovníckym chatám a pílam. Poddaní čakajú na rozkaz.",
 flood:"Rieka sa vylieva z brehov a hrozí zatopiť mlyn, rybníky a polia pri brehu.",
 drought:"Dlhé sucho vysušilo polia. Roľníci prosia o vodu a o pomoc.",
 army:"Cez kraj pochoduje vojsko. Veliteľ žiada ubytovanie a jedlo pre vojakov."};
A.okEv=e=>{const ev=evs().find(x=>x.id==e.k);if(!ev)return;const Tt=T();const btns=OPT[ev.k].map(o=>({t:o[1]==="c"?`${o[0]} · ${zl(o[2]*Tt)}`:o[0],a:"okEvDo",d:{id:ev.id,v:o[3]||"ign"},pri:o[3]==="guard"||o[3]==="put"||o[3]==="dam"||o[3]==="wells"||o[3]==="feed"?1:0}));btns.push({t:"Zavrieť",a:"mclose"});
 const left=KINDS[ev.k].life-(S.turn-ev.t0);queue({title:KINDS[ev.k].n,html:`<p>${esc(TXT[ev.k])}</p><p class="muted">${left>0?"Ak nezasiahneš do konca "+(left>1?"budúceho štvrťroka":"tohto štvrťroka")+", škoda sa prejaví.":""}</p>`,btns})};
A.okEvDo=e=>{closeModal(true);const i=evs().findIndex(x=>x.id==e.id);if(i<0)return;const ev=evs()[i],p=P(),Tt=T();let ok=true,txt="",kind="good";const v=e.v;
 const cost={guard:400,pay:200,put:250,dam:500,evac:100,wells:300,pray:100,feed:150}[v];
 if(v==="ign"){ignorePenalty(ev);evs().splice(i,1);render();return}
 if(!pay(p,cost*Tt)){queue({title:"Nedostatok peňazí",html:`<p>Na to treba ${zl(cost*Tt)}.</p>`,btns:[{t:"Zavrieť",a:"mclose"}]});return}
 if(v==="guard"){if(Math.random()<.8){const g=Math.round(250*Tt);gain(p,g);txt=`Stráž vyhnala lúpežníkov a vrátila ukradnutý tovar za ${zl(g)}.`}else{const c=loss(p,.02,300);p.money-=c;led(p,"ine",-c);txt=`Stráž lúpežníkov nezastihla a ešte sa vrátila s ranenými. Strata ${zl(c)}.`;kind="bad"}}
 else if(v==="pay")txt="Lúpežníci vzali výpalné a odtiahli. Cesta je opäť bezpečná.";
 else if(v==="put"){if(Math.random()<.85)txt="Poddaní spolu uhasili požiar skôr, než napáchal veľké škody.";else{const c=loss(p,.03,400);p.money-=c;led(p,"ine",-c);txt=`Požiar sa napokon podarilo uhasiť, ale časť lesa zhorela. Škoda ${zl(c)}.`;kind="bad"}}
 else if(v==="dam")txt="Nová hrádza zadržala vodu. Mlyn aj polia sú v bezpečí.";
 else if(v==="evac"){const c=loss(p,.02,300);p.money-=c;led(p,"ine",-c);txt=`Stáda a zásoby sa podarilo zachrániť, voda však zaliala polia. Strata ${zl(c)}.`}
 else if(v==="wells")txt="Nové studne zachránili úrodu aj dobytok.";
 else if(v==="pray"){if(Math.random()<.5)txt="Po procesii sa zatiahlo a pršalo. Úroda je zachránená.";else{const c=loss(p,.03,400);p.money-=c;led(p,"ine",-c);txt=`Dážď neprišiel. Strata na úrode ${zl(c)}.`;kind="bad"}}
 else if(v==="feed"){const g=Math.round((100+Math.random()*450)*Tt);gain(p,g);txt=`Veliteľ sa odvďačil ${zl(g)} a pochválil rod pred ostatnými.`}
 chron(txt,"titul",kind);evs().splice(i,1);try{SND.play("coin")}catch(x){}
 queue({title:KINDS[ev.k].n,html:`<p class="${kind==="bad"?"bad":"good"}">${esc(txt)}</p>`,btns:[{t:"Pokračovať",a:"mclose",pri:1}]});render()};
/* ---------- grafika udalostí (SVG nad mapou okolia) ---------- */
const pt=(r,t)=>{const a=r[0],c=r[1],b=r[2],u=1-t;return[u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]]};
const lab=(x,y,txt)=>`<g pointer-events="none"><rect x="${x-46}" y="${y-9}" width="92" height="15" rx="3" fill="#f6e3a4" stroke="#a5312a" stroke-width="1"/><text x="${x}" y="${y+2}" text-anchor="middle" font-family="Almendra SC,serif" font-size="11" font-weight="700" fill="#a5312a">${txt}</text></g>`;
const flame=(x,y,s,d)=>`<g transform="translate(${x},${y}) scale(${s})"><g class="evfl" style="animation-delay:-${d||0}s"><path d="M-6 0Q-8 -10 0 -20Q8 -10 6 0Z" fill="#ff7a2a"/><path d="M-3 0Q-4 -6 0 -12Q4 -6 3 0Z" fill="#ffd070"/></g></g>`;
function svg(pos,home,C){if(!home)return"";const X=window.OKX;if(!X)return"";let s="";const RY=X.RY,RH=X.RH;
 for(const e of active()){const name=KINDS[e.k].n,hov=`<b>${name}</b><br>${esc(TXT[e.k])}<br><small>klikni a rozhodni</small>`;let body="",hx=600,hy=300,rx=50,ry=34;
  if(e.k==="bandits"){const r=X.ROADS[e.r],q=pt(r,.55);hx=q[0];hy=q[1];body=flame(hx+2,hy+6,.8)+[[-18,2],[16,4],[-2,12]].map(([dx,dy],i)=>`<g transform="translate(${hx+dx},${hy+dy})"><g class="wlk" style="animation-delay:-${i*.2}s">${X.pS("#4a2a2a","#222",'<path d="M2 -7L8 -12" stroke="#7a7a82" stroke-width="1.2"/>')}</g></g>`).join("")+lab(hx,hy-26,"Lúpežníci!")}
  else if(e.k==="fire"){const[x,y]=pos.les;hx=x;hy=y+10;rx=110;ry=50;for(let i=0;i<6;i++)body+=flame(x-60+i*28,y+(i%2)*22,1+(i%3)*.25,i*.2);body+=X.smk(x-20,y-10,3,true)+X.smk(x+40,y,3,true)+lab(x,y-52,"Požiar!")}
  else if(e.k==="flood"){let a="",b="";for(let x=-20;x<=1220;x+=20)a+=(x<0?"M":"L")+x+" "+(RY(x)-RH(x)-16);for(let x=1220;x>=-20;x-=20)b+="L"+x+" "+(RY(x)+RH(x)+14);hx=470;hy=RY(470);rx=170;ry=40;body=`<path class="evwater" d="${a}${b}Z" fill="rgba(110,160,210,.5)" stroke="rgba(255,255,255,.5)" stroke-width="1"/>`+lab(470,hy-56,"Povodeň!")}
  else if(e.k==="drought"){hx=300;hy=520;rx=260;ry=60;const ps=[[110,400],[200,405],[420,380],[130,540],[260,552],[400,545],[820,550],[960,548],[1090,545]];body=ps.map(p=>`<ellipse cx="${p[0]}" cy="${p[1]}" rx="48" ry="26" fill="rgba(200,160,70,.4)" pointer-events="none"/><path d="M${p[0]-20} ${p[1]}l10 -4l8 6l10 -5M${p[0]-8} ${p[1]+8}l12 -3l8 4" stroke="rgba(90,60,20,.5)" fill="none" stroke-width="1" pointer-events="none"/>`).join("")+`<circle class="flick" cx="1110" cy="44" r="30" fill="rgba(255,200,80,.55)" style="filter:blur(6px)" pointer-events="none"/>`+lab(300,hy-44,"Sucho!")}
  else if(e.k==="army"){const r=X.ROADS[e.r],q=pt(r,.5);hx=q[0];hy=q[1];body=X.mv(r,38,0,[0,1,2,3,4].map(i=>`<g transform="translate(${-i*13},${(i%2)*3})"><g class="wlk" style="animation-delay:-${i*.15}s">${X.pS("#7a8a96","#9aa0a8",'<path d="M3 -12L3 2" stroke="#6b4423" stroke-width="1"/>')}</g></g>`).join("")+`<g transform="translate(10,0)"><path d="M0 -4V-26" stroke="#2b2117" stroke-width="1.2"/><path d="M0 -26h14l-3 5 3 5H0z" fill="#a5312a" stroke="#2b2117" stroke-width=".5"/></g>`)+lab(hx,hy-34,"Vojsko!")}
  s+=`<g class="okop okev" data-a="okEv" data-k="${e.id}" ${hovAttr(hov)} role="button" tabindex="0">${body}<ellipse class="hit" cx="${hx}" cy="${hy}" rx="${rx}" ry="${ry}"/></g>`}
 return s}
window.OKEV={svg,spawn,expire,KINDS};
})();

;
