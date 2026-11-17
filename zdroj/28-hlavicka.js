/* ==== js/hlavicka.js ==== */
/* Hlavička (PC): ponuka, rada kancelára pri správcovi rodu. Autor: Dávid Mucha. */
/* jedna Ponuka: Denník, Hľadať a Detail hry sú v nej, nie v hlavičke */
(function(){
"use strict";

const st=document.createElement("style");st.textContent=``;document.head.appendChild(st);

/* v13: keď je zapnutý správca rodu, nerada o výrobe a najímaní, ktoré urobí sám */
(function(){
 const o=window.advice;if(typeof o!=="function")return;
 const RX=/ak prepneš výrobu|má voľné miesto pre r|nemá robotníkov/;
 window.advice=function(){const a=o.apply(this,arguments);try{if(S&&S.auto)return a.filter(x=>!(x&&x.ic==="⚒"&&RX.test(x.t)))}catch(e){}return a};
})();
})();

;
