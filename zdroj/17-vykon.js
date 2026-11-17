/* ==== js/vykon.js ==== */
/* Výkon (v28): animácie SVG scén sa pozastavia, keď nie sú vidieť */
(function(){
"use strict";
if(!("IntersectionObserver" in window))return;
const seen=new WeakSet();
const io=new IntersectionObserver(es=>{es.forEach(e=>e.target.classList.toggle("vkpause",!e.isIntersecting))},{rootMargin:"60px"});
let busy=false;
function scan(){busy=false;try{document.querySelectorAll("svg").forEach(el=>{if(seen.has(el))return;seen.add(el);const r=el.getBoundingClientRect();if(r.width>=120||r.height>=120)io.observe(el)})}catch(e){}}
function sched(){if(!busy){busy=true;setTimeout(scan,200)}}
new MutationObserver(sched).observe(document.body,{childList:true,subtree:true});
document.addEventListener("visibilitychange",()=>{document.documentElement.classList.toggle("vkhid",document.hidden)});
const st=document.createElement("style");st.textContent=".vkpause,.vkpause *{animation-play-state:paused!important}.vkhid *{animation-play-state:paused!important}";document.head.appendChild(st);
sched();
/* automatický režim: ak je zariadenie pomalé a hráč si kvalitu nevybral, zníži sa na stredné efekty */
let low=0,tries=0;
function probe(){if(window.PREF&&PREF.gfx!=null)return;if(document.hidden){setTimeout(probe,3000);return}
 let n=0,t0=performance.now(),vis=true;const vh=()=>{vis=false};document.addEventListener("visibilitychange",vh,{once:true});
 (function f(t){n++;if(t-t0<3000&&vis)return requestAnimationFrame(f);
  if(!vis){setTimeout(probe,3000);return}
  const fps=n/((t-t0)/1000);tries++;
  if(fps<38){if(++low>=2&&window.A&&A.gfxSet){A.gfxSet({k:1});return}}else low=0;
  if(tries<6)setTimeout(probe,4000)})(t0)}
setTimeout(probe,12000);
})();

;
