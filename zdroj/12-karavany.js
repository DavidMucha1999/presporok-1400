/* ==== js/karavany.js ==== */
/* Karavány (v17): obchodné karavány prichádzajú po cestách k mestu; clo, obchod alebo nechať prejsť */
(function(){
"use strict";
const T=()=>Math.max(1,(typeof tierC==="function"?tierC():1));
const cars=()=>{S.okCar=S.okCar||[];return S.okCar};
const mine=()=>cars().filter(c=>c.city===CC().id);
const GOODS=["súkno","korenie","soľ","víno","kože","železo"];
const FROM=["Viedne","Budína","Krakova","Prahy","Benátok","Norimbergu"];
function spawn(){const p=P(),C=CC();if(C.id!==p.city||mine().length>=2||Math.random()>.4)return;
 S.okCarN=(S.okCarN||0)+1;const c={id:S.okCarN,city:C.id,t0:S.turn,r:[0,1,2,4,5,6,7,8][(Math.random()*8)|0],g:GOODS[(Math.random()*GOODS.length)|0],f:FROM[(Math.random()*FROM.length)|0]};
 cars().push(c);chron(`Ku bránam mesta ${C.n} sa blíži obchodná karavána z ${c.f} (${c.g}). Pozri si mapu okolia.`,"titul","")}
function expire(){S.okCar=cars().filter(c=>S.turn-c.t0<2)}
{const o=estTurn;estTurn=function(){o();try{expire();spawn()}catch(x){console.warn("karavany",x)}}}
A.okCar=e=>{const c=cars().find(x=>x.id==e.k);if(!c)return;const t=T();
 queue({title:"Obchodná karavána",html:`<p>Karavána z ${esc(c.f)} vezie ${esc(c.g)}. Kupci žiadajú o prejazd cez tvoje územie.</p>`,
 btns:[{t:`Vybrať clo (zisk ~${zl(120*t)}–${zl(260*t)})`,a:"okCarDo",d:{id:c.id,v:"toll"},pri:1},{t:`Obchodovať · ${zl(250*t)}`,a:"okCarDo",d:{id:c.id,v:"trade"}},{t:"Nechať prejsť",a:"okCarDo",d:{id:c.id,v:"pass"}},{t:"Zavrieť",a:"mclose"}]})};
A.okCarDo=e=>{closeModal(true);const i=cars().findIndex(x=>x.id==e.id);if(i<0)return;const c=cars()[i],p=P(),t=T();let txt="",k="good";
 if(e.v==="toll"){const g=Math.round((120+Math.random()*140)*t);p.money+=g;led(p,"ine",g);txt=`Výber cla od karavány s tovarom (${c.g}) priniesol ${zl(g)}.`}
 else if(e.v==="trade"){const cost=250*t;if(p.money<cost){queue({title:"Nedostatok peňazí",html:`<p>Treba ${zl(cost)}.</p>`,btns:[{t:"Zavrieť",a:"mclose"}]});return}
  p.money-=cost;led(p,"ine",-cost);if(Math.random()<.75){const g=Math.round(cost*(1.4+Math.random()*.8));p.money+=g;led(p,"ine",g);txt=`Výhodný obchod s tovarom (${c.g}): predaj ti priniesol ${zl(g)}.`}else{txt=`Tovar (${c.g}) sa ukázal ako menejcenný. Peniaze sú preč.`;k="bad"}}
 else txt="Karavána pokojne prešla a pokračovala v ceste.";
 chron(txt,"titul",k);cars().splice(i,1);try{SND.play("coin")}catch(x){}
 queue({title:"Obchodná karavána",html:`<p>${esc(txt)}</p>`,btns:[{t:"Pokračovať",a:"mclose",pri:1}]});render()};
function svg(pos,home,C){let s="";const X=window.OKX;if(!home||!X)return"";
 for(const c of mine()){const r=X.ROADS[c.r];if(!r)continue;const q=(()=>{const a=r[0],m=r[1],b=r[2],t=.6,u=.4;return[u*u*a[0]+2*u*t*m[0]+t*t*b[0],u*u*a[1]+2*u*t*m[1]+t*t*b[1]]})();
  const wag=i=>`<g transform="translate(${-i*22},0)"><rect x="-9" y="-9" width="18" height="8" rx="1.5" fill="#d9c79a" stroke="#4a3520" stroke-width=".8"/><path d="M-9 -9Q0 -20 9 -9Z" fill="#efe6cf" stroke="#4a3520" stroke-width=".8"/><circle cx="-5" cy="0" r="3" fill="#5a3b1c"/><circle cx="5" cy="0" r="3" fill="#5a3b1c"/></g>`;
  s+=`<g class="okop okev okcar" data-a="okCar" data-k="${c.id}" ${hovAttr(`<b>Obchodná karavána</b><br>z ${esc(c.f)}: ${esc(c.g)}<br><small>klikni a rozhodni</small>`)} role="button" tabindex="0">`+X.mv(r,45,0,wag(0)+wag(1)+wag(2))+`<g pointer-events="none"><rect x="${q[0]-40}" y="${q[1]-32}" width="80" height="15" rx="3" fill="#f6e3a4" stroke="#6b4a0a"/><text x="${q[0]}" y="${q[1]-21}" text-anchor="middle" font-family="Almendra SC,serif" font-size="11" font-weight="700" fill="#6b4a0a">Karavána</text></g><ellipse class="hit" cx="${q[0]}" cy="${q[1]}" rx="48" ry="26" style="stroke:#b8862c;fill:rgba(214,170,76,.12);animation:none"/></g>`}
 return s}
if(window.OKEV){const o=OKEV.svg;OKEV.svg=function(a,b,c){return o(a,b,c)+svg(a,b,c)}}
window.OKCAR={spawn,svg};
})();

;
