/* ==== js/detaily.js ==== */
/* Detailné okno miesta (v24): priblížený izometrický pohľad na panstvo s animáciou, stavom a vylepšeniami. Autor: Dávid Mucha. */
(function(){
"use strict";
const CW=960,CH=560,DZ=2.3;
const CACHE={};
function key(k){const own=(S.est||{})[k]||0,lv=((S.estL||{})[k])||1;let ph=1;try{ph=todPh()}catch(e){}return[k,CC().id,S.season,ph,own,lv,(window.PREF&&PREF.gfx)||0].join("|")}
function img(k){const kk=key(k);if(CACHE[kk])return CACHE[kk];try{const r=window.OKX&&OKX.paintDetail&&OKX.paintDetail(k);if(!r)return null;const keys=Object.keys(CACHE);if(keys.length>14)delete CACHE[keys[0]];return CACHE[kk]={url:r.url,fx:r.fx,fy:r.fy}}catch(e){console.warn("detail",e);return null}}
const rnd=(s=>()=>(s=(s*16807)%2147483647)/2147483647);
const BIRD='<g class="wing"><path d="M-5 0Q-2.5 -4 0 0Q2.5 -4 5 0" fill="none" stroke="#2b2117" stroke-width="1.1"/></g>';
function walker(col,hat,tool,r,x,y,dx,dy,dur,dl){return `<g class="okmv" style="offset-path:path('M${x} ${y}Q${x+dx/2} ${y+dy/2+r} ${x+dx} ${y+dy}');--d:${dur}s;animation-delay:-${dl}s"><g class="wlk" transform="scale(1.7)">${OKX.pS(col,hat,tool||"")}</g></g>`}
function overlay(k,own,lv,I){
 const X=window.OKX;if(!X)return"";const cx=I.fx,cy=I.fy,r=rnd(k.length*131+7);let s="";
 const col=["#8a3a2a","#2f5bb0","#5a6a3a","#6d3f92","#a07040","#b8362c"];
 const W=(n,spread,hat)=>{let o="";for(let i=0;i<n;i++){const x=cx-spread+r()*spread*2,y=cy-20+r()*80,dx=(r()-.5)*160,dy=(r()-.5)*40;o+=walker(col[i%6],hat,"",0,x,y,dx,dy,26+r()*24,r()*40)}return o};
 if(k==="dedina"){s+=W(5,230);s+=X.smk(cx-60,cy-72,3,true)+X.smk(cx+70,cy-64,3,true)}
 else if(k==="vinica"){s+=W(4,200,"#c9b46a")}
 else if(k==="les"){s+=W(3,180,"#3a5a2a")+X.smk(cx+10,cy-90,2,true)}
 else if(k==="rybnik"){s+=W(2,150);for(let i=0;i<4;i++)s+=`<circle class="rip" cx="${cx-80+i*55}" cy="${cy+10+(i%2)*18}" r="1" style="animation-delay:${i*.7}s;stroke-width:1.4"/>`}
 else if(k==="salas"){for(let i=0;i<9;i++){const x=cx-170+r()*340,y=cy+r()*70;s+=`<g class="shp" style="--t:${6+r()*6}s;--dl:-${r()*8}s;--dx:${(r()-.5)*70}px;--dy:${(r()-.5)*26}px" transform="translate(${x},${y})"><ellipse rx="9" ry="6" fill="#f2efe6" stroke="#2b2117" stroke-width=".8"/><circle cx="9" cy="-2" r="3.2" fill="#2b2117"/></g>`}s+=W(1,100,"#7a5a3a")}
 else if(k==="letohradok"){s+=W(3,170,"#d8c9a0");if(lv>=2)for(let i=0;i<5;i++)s+=`<circle class="flick" cx="${cx+60+i*6}" cy="${cy-16-i*3}" r="2" fill="#bfe6ff" style="animation-delay:${i*.2}s"/>`}
 else if(k==="klastor"){s+=W(4,150,"#3a2f26");s+=X.smk(cx-30,cy-110,2,true)}
 else if(k==="hostinec"){s+=W(3,180);s+=X.smk(cx+40,cy-100,3,true);s+=`<g class="okmv" style="offset-path:path('M ${cx-300} ${cy+70}Q ${cx} ${cy+120} ${cx+260} ${cy+60}');--d:20s"><g transform="scale(1.9)">${CARTG_()}</g></g>`}
 else if(k==="mlyn"){s+=W(2,120)+`<g class="okmv" style="offset-path:path('M ${cx-160} ${cy+90}Q ${cx} ${cy+110} ${cx+160} ${cy+90}');--d:30s"><g transform="scale(1.9)">${CARTG_()}</g></g>`}
 else if(k==="lom"){for(let i=0;i<4;i++){const x=cx-90+i*55,y=cy+10+(i%2)*26;s+=`<g transform="translate(${x},${y}) scale(1.7)"><g class="fm pk">${X.pS("#7a6a5a","#8a7a62",'<path d="M2 -7L9 -3" stroke="#5a3c22" stroke-width="1.1"/><path d="M8 -6L11 0" stroke="#7a7a82" stroke-width="1.6"/>')}</g></g>`}}
 /* vtáky */
 s+=`<g class="birds" style="animation-duration:50s;transform-origin:0 0"><g transform="translate(0,70)">${BIRD}</g><g transform="translate(34,52)">${BIRD}</g><g transform="translate(20,90)">${BIRD}</g></g>`;
 return s}
function CARTG_(){return `<ellipse cy="3" rx="13" ry="3" fill="rgba(0,0,0,.25)"/><rect x="-9" y="-8" width="18" height="8" fill="#9b6a3e" stroke="#2b2117" stroke-width=".6"/><path d="M-9 -8Q0 -18 9 -8Z" fill="#e8dcc0" stroke="#2b2117" stroke-width=".6"/><circle cx="-6" cy="1" r="3.2" fill="none" stroke="#2b2117" stroke-width=".8"/><circle cx="6" cy="1" r="3.2" fill="none" stroke="#2b2117" stroke-width=".8"/>`}
function stats(k){
 const E=window.EST&&EST[k],own=(S.est||{})[k]||0,lv=((S.estL||{})[k])||1,up=(window.ESTUP||{})[k];let h="";
 if(E&&own){const rent=Math.round(E.r*own+(lv>1?E.r*own*.4*(lv-1):0));h+=`<div class="okst"><span>Vlastníš</span><b>${own}×</b><span>Úroveň</span><b>${lv}/3</b><span>Renta</span><b>${rent?zl(rent)+"/štvrťrok":"–"}</b>${E.g?`<span>Tovar</span><b>${esc(E.g)}</b>`:""}</div>`}
 else if(E){h+=`<div class="okst"><span>Cena</span><b>${zl(E.c)}</b><span>Renta</span><b>${E.r?zl(E.r)+"/štvrťrok":"–"}</b>${E.g?`<span>Tovar</span><b>${esc(E.g)}</b>`:""}</div>`}
 if(up&&own){h+=`<ul class="okup">`+up.map((n,i)=>`<li class="${lv>i+1?"on":"off"}">${lv>i+1?"✔":"○"} ${esc(n)}</li>`).join("")+`</ul>`}
 return h}
function html(k){const own=(S.est||{})[k]||0,lv=((S.estL||{})[k])||1,I=img(k);if(!I)return"";const u=I.url;
 return `<div class="okdet"><img src="${u}" alt="Detail miesta"><svg viewBox="0 0 ${CW} ${CH}" preserveAspectRatio="none" aria-hidden="true">${overlay(k,own,lv,I)}</svg></div>`+stats(k)}
let pending=null;
{const o=A.okoPlace;A.okoPlace=function(e){pending=e&&e.k;try{return o.apply(this,arguments)}finally{pending=null}}}
{const q=window.queue;if(typeof q==="function")window.queue=function(m){try{if(pending&&m&&m.html!=null&&m.title!=null){const k=pending;pending=null;const d=html(k);if(d){m=Object.assign({},m,{html:d+m.html});const own=(S.est||{})[k]||0,lv=((S.estL||{})[k])||1,E=window.EST&&EST[k],up=(window.ESTUP||{})[k];
  if(E&&own&&lv<3&&up&&CC().id===P().city){const c=Math.round(E.c*.5*lv);const b={t:`Vylepšiť: ${up[lv-1]} · ${zl(c)}`,a:"estUp",d:{k}};const bt=(m.btns||[]).slice();const zi=bt.findIndex(x=>x.a==="mclose");if(zi>=0)bt.splice(zi,0,b);else bt.push(b);m.btns=bt}}}}catch(e){console.warn("detail modal",e)}
  return q.call(this,m)}}
window.OKDETAIL={html,img};
})();

;
