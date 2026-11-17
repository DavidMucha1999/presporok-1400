/* ==== js/priblizenie.js ==== */
/* Priblíženie a posun mapy okolia (v18): koliesko / ťahanie / štipnutie / dvojklik = reset */
(function(){
"use strict";
const V=window.OKV={z:1,x:0,y:0};let W0=1200,H0=600;
const MAXZ=3.5;
function dims(sv){const b=(sv.getAttribute("viewBox")||"0 0 1200 600").split(/\s+/).map(Number);return[b[2]||1200,b[3]||600]}
function clamp(sv){const[W,H]=dims(sv);V.z=Math.max(1,Math.min(MAXZ,V.z));const w=W/V.z,h=H/V.z;V.x=Math.max(0,Math.min(W-w,V.x));V.y=Math.max(0,Math.min(H-h,V.y))}
function apply(sv){const[W,H]=base(sv);V.z=Math.max(1,Math.min(MAXZ,V.z));const ww=W/V.z,hh=H/V.z;V.x=Math.max(0,Math.min(W-ww,V.x));V.y=Math.max(0,Math.min(H-hh,V.y));sv.setAttribute("viewBox",`${V.x.toFixed(1)} ${V.y.toFixed(1)} ${(W/V.z).toFixed(1)} ${(H/V.z).toFixed(1)}`);sv.classList.toggle("okzoom",V.z>1.001)}
/* viewBox pre nové vykreslenie */
const o=window.okolieSVG;
window.okolieSVG=function(){let s=o.apply(this,arguments);{const m0=typeof s==="string"&&s.match(/viewBox="0 0 (\d+) (\d+)"/);if(m0){V.W=+m0[1];V.H=+m0[2]}}if(false){V.init=1;V.z=2.2;V.x=Math.max(0,Math.min(V.W-V.W/V.z,600-V.W/V.z/2));V.y=Math.max(0,Math.min(V.H-V.H/V.z,270-V.H/V.z/2))}
if(typeof s==="string"&&V.z>1.001){const m=s.match(/viewBox="0 0 (\d+) (\d+)"/);if(m){const W=+m[1],H=+m[2];s=s.replace(m[0],`viewBox="${V.x.toFixed(1)} ${V.y.toFixed(1)} ${(W/V.z).toFixed(1)} ${(H/V.z).toFixed(1)}"`);s=s.replace('class="okolie ','class="okolie okzoom ')}}return s};
const svgOf=t=>t&&t.closest?t.closest("svg.okolie"):null;
/* dim = pôvodné rozmery; pri zväčšení sú W,H v viewBoxe menšie, preto držíme originál */
function base(sv){if(V.W)return[V.W,V.H];const b=sv.__base;if(b)return b;const[w,h]=dims(sv);const z=V.z>1.001?V.z:1;return sv.__base=[w*z,h*z]}
function setView(sv,z,fx,fy){/* fx,fy = relatívna pozícia kurzora 0..1 vnútri svg */
 const[W,H]=base(sv);const ow=W/V.z,oh=H/V.z;const px=V.x+fx*ow,py=V.y+fy*oh;V.z=Math.max(1,Math.min(MAXZ,z));const nw=W/V.z,nh=H/V.z;V.x=px-fx*nw;V.y=py-fy*nh;
 V.x=Math.max(0,Math.min(W-nw,V.x));V.y=Math.max(0,Math.min(H-nh,V.y));sv.setAttribute("viewBox",`${V.x.toFixed(1)} ${V.y.toFixed(1)} ${nw.toFixed(1)} ${nh.toFixed(1)}`);sv.classList.toggle("okzoom",V.z>1.001)}
function panBy(sv,dx,dy){const[W,H]=base(sv),r=sv.getBoundingClientRect();const nw=W/V.z,nh=H/V.z;V.x=Math.max(0,Math.min(W-nw,V.x-dx*nw/r.width));V.y=Math.max(0,Math.min(H-nh,V.y-dy*nh/r.height));sv.setAttribute("viewBox",`${V.x.toFixed(1)} ${V.y.toFixed(1)} ${nw.toFixed(1)} ${nh.toFixed(1)}`)}
const rel=(sv,cx,cy)=>{const r=sv.getBoundingClientRect();return[(cx-r.left)/r.width,(cy-r.top)/r.height]};
document.addEventListener("wheel",e=>{const sv=svgOf(e.target);if(!sv)return;if(!(e.ctrlKey||e.shiftKey||V.z>1.001||e.altKey)&&false)return;e.preventDefault();const[fx,fy]=rel(sv,e.clientX,e.clientY);setView(sv,V.z*(e.deltaY<0?1.2:1/1.2),fx,fy)},{passive:false});
let drag=null,moved=0;
document.addEventListener("mousedown",e=>{const sv=svgOf(e.target);if(!sv||e.button!==0||V.z<=1.001)return;drag={sv,x:e.clientX,y:e.clientY};moved=0});
document.addEventListener("mousemove",e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;moved+=Math.abs(dx)+Math.abs(dy);if(moved>5){panBy(drag.sv,dx,dy);drag.x=e.clientX;drag.y=e.clientY;drag.sv.classList.add("okdrag")}});
document.addEventListener("mouseup",()=>{if(drag){drag.sv.classList.remove("okdrag");drag=null;setTimeout(()=>moved=0,0)}});
window.addEventListener("click",e=>{if(moved>5){e.stopPropagation();e.preventDefault();moved=0}},true);
document.addEventListener("dblclick",e=>{const sv=svgOf(e.target);if(!sv)return;if(e.target.closest&&e.target.closest(".okop"))return;if(V.z>1.001){V.z=1;V.x=0;V.y=0;apply(sv)}else{const[fx,fy]=rel(sv,e.clientX,e.clientY);setView(sv,2.2,fx,fy)}});
/* dotyk */
let tp=null;



})();

;
