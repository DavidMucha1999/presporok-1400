/* ==== js/zoommesta.js ==== */
/* Priblíženie a posun mapy mesta (v32): koliesko / ťahanie / štipnutie / dvojklik – rovnako ako mapa okolia */
(function(){
"use strict";
const MIN=1,MAX=4,SEL=".map:not(.eu)";
let drag=null,moved=0,tp=null,tmr=0,cur=1;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mapOf=t=>{const m=t&&t.closest?t.closest(SEL):null;return m&&m.querySelector(".cmbox,svg")?m:null};
const boxOf=m=>m.querySelector(".cmbox,svg");
const zOf=m=>parseFloat(m.style.getPropertyValue("--z"))||1;
function style(){const st=document.createElement("style");st.textContent=".map.mapvp{overflow:auto;scrollbar-width:none;cursor:grab;overscroll-behavior:contain}.map.mapvp::-webkit-scrollbar{display:none}.map.mapdrag{cursor:grabbing}.map.mapdrag .lot{pointer-events:none}";document.head.appendChild(st)}
function viewport(m,z){const box=boxOf(m);if(z>1.01){if(!m.dataset.h0){m.dataset.h0=Math.round(box.getBoundingClientRect().height/Math.max(1,cur))}m.classList.add("mapvp");m.style.maxHeight=m.dataset.h0+"px"}else{m.classList.remove("mapvp");m.style.maxHeight="";delete m.dataset.h0}}
function setZoom(m,zn,px,py){zn=clamp(zn,MIN,MAX);if(Math.abs(zn-1)<.03)zn=1;
 const sw=m.scrollWidth||1,sh=m.scrollHeight||1,fx=(m.scrollLeft+px)/sw,fy=(m.scrollTop+py)/sh;
 cur=zOf(m);m.style.setProperty("--z",zn);viewport(m,zn);cur=zn;
 m.scrollLeft=fx*m.scrollWidth-px;m.scrollTop=fy*m.scrollHeight-py;
 const n=document.querySelector(".zoom .num");if(n)n.textContent=Math.round(zn*100)+" %";
 clearTimeout(tmr);tmr=setTimeout(()=>sync(m,zn),350)}
function sync(m,zn){try{if(typeof MAPZ==="undefined")return;const old=MAPZ;MAPZ=Math.round(zn*100)/100;
 if([1.6,2].some(t=>(old<t)!==(MAPZ<t))&&typeof render==="function"){const fx=(m.scrollLeft+m.clientWidth/2)/m.scrollWidth,fy=(m.scrollTop+m.clientHeight/2)/m.scrollHeight;render();const n=document.querySelector(SEL);if(n){reapply(n);n.scrollLeft=fx*n.scrollWidth-n.clientWidth/2;n.scrollTop=fy*n.scrollHeight-n.clientHeight/2}}}catch(e){console.warn("zoommesta",e)}}
function reapply(m){if(!m||!boxOf(m))return;const z=zOf(m);cur=z;if(z>1.01){m.classList.add("mapvp");const box=boxOf(m);m.dataset.h0=Math.round(box.getBoundingClientRect().height/z);m.style.maxHeight=m.dataset.h0+"px"}}
const rel=(m,x,y)=>{const r=m.getBoundingClientRect();return[x-r.left,y-r.top]};
document.addEventListener("wheel",e=>{const m=mapOf(e.target);if(!m)return;e.preventDefault();const[px,py]=rel(m,e.clientX,e.clientY);setZoom(m,zOf(m)*(e.deltaY<0?1.15:1/1.15),px,py)},{passive:false});
document.addEventListener("mousedown",e=>{const m=mapOf(e.target);if(!m||e.button!==0||zOf(m)<=1.01)return;drag={m,x:e.clientX,y:e.clientY};moved=0});
document.addEventListener("mousemove",e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;moved+=Math.abs(dx)+Math.abs(dy);if(moved>5){drag.m.scrollLeft-=dx;drag.m.scrollTop-=dy;drag.x=e.clientX;drag.y=e.clientY;drag.m.classList.add("mapdrag")}});
document.addEventListener("mouseup",()=>{if(drag){drag.m.classList.remove("mapdrag");drag=null;setTimeout(()=>moved=0,0)}});
window.addEventListener("click",e=>{if(moved>5&&mapOf(e.target)){e.stopPropagation();e.preventDefault();moved=0}},true);
document.addEventListener("dblclick",e=>{const m=mapOf(e.target);if(!m)return;if(e.target.closest&&e.target.closest(".lot"))return;const[px,py]=rel(m,e.clientX,e.clientY);setZoom(m,zOf(m)>1.01?1:2.2,px,py)});



style();
if(typeof render==="function"){const o=render;render=function(){const r=o.apply(this,arguments);try{reapply(document.querySelector(SEL))}catch(e){}return r}}
})();

;
