/* ==== js/kralovsky.js ==== */
/* Kráľovský dvor sídli tam, kde má sídlo panovník, ktorý si ho prerobil na palác (v40) */
(function(){
"use strict";
const COST=15000;
const KRAL=window.KRAL={
 court(){try{if(S.palaceCity!=null)return S.palaceCity;const k=S.dyn[S.king];return k?k.city:6}catch(e){return 6}},
 here(){try{const k=S.dyn[S.king];return !!k&&k.city===KRAL.court()}catch(e){return false}},
 key(cid){try{if(!S.dyn)return"";const c=KRAL.court(),k=S.dyn[S.king],p=S.dyn[0];
  if(cid===c)return["c",S.king,KRAL.here()?1:0,k&&k.head.gender,k&&(k.kids||[]).length,k&&k.spouse?1:0].join(".");
  if(S.king===0&&p&&p.city===cid)return"b"}catch(e){}return""},
 cost:COST
};
function scores(){
 const p=P(),out=[];
 try{
  const k=S.dyn[S.king];
  for(const x of S.dyn){
   if(x.royal||x.title<10)continue;
   const sc=x.id===0?p.rf+S.ally.length*8+skill(p,"charizma")*3+skill(p,"retorika")*3+(S.royalWed?40:0)+churchKing()+milKing():x.rf+prestige(x)/400;
   out.push({n:x.id===0?"tvoj rod":"rod "+x.name,sc:Math.round(sc),me:x.id===0});
  }
  const heir=k&&k.kids.filter(c=>c.age>=16).sort((a,b)=>b.age-a.age)[0];
  if(heir)out.push({n:"princ "+heir.name+" (dedič)",sc:62});
 }catch(e){console.warn("kral scores",e)}
 return out.sort((a,b)=>b.sc-a.sc);
}
function palac(){
 const k=S.dyn[S.king],p=P();if(!k)return;
 const cn=CITY_DEF[KRAL.court()].n,h=k.head,sp=k.spouse,kids=(k.kids||[]).length;
 const rows=scores().slice(0,6).map(c=>`<tr${c.me?' style="font-weight:700"':""}><td>${esc(c.n)}</td><td style="text-align:right">${c.sc}</td></tr>`).join("");
 let who,fam="";
 if(KRAL.here()){fam=`<p class="lbl" style="margin-top:8px">členovia kráľovského rodu v paláci</p><div style="display:flex;flex-wrap:wrap;gap:8px">${card(h,TT(11,h.gender),h.gender==="f"?"queen":"king")}${sp?card(sp,sp.gender==="f"?"Kráľovná":"Manžel kráľovnej",sp.gender==="f"?"queen":"king"):""}${(k.kids||[]).map(c=>card(c,c.gender==="f"?"Princezná":"Princ",c.age<15?"child":"prince")).join("")}</div>`}
 if(KRAL.here())who=`<p>V paláci sídli rod <b>${esc(k.name)}</b>.</p><p><b>${esc(TT(11,h.gender))} ${esc(h.name)}</b>, ${h.age} r.${sp?`<br>${esc(sp.gender==="f"?"Kráľovná":"Manžel")} ${esc(sp.name)}, ${sp.age} r.`:""}${kids?`<br>Detí na dvore: ${kids}`:""}</p>`;
 else{const kc=CITY_DEF[k.city]?CITY_DEF[k.city].n:"inde";who=`<p>Palác je prázdny. Panovník <b>${esc(TT(11,h.gender))} ${esc(h.name)}</b> z rodu ${esc(k.name)} sídli v meste ${esc(kc)} a zatiaľ si tam nepostavil palác.</p>`}
 const bn=KRAL.bonus();const dvor=KRAL.here()?`<p class="muted">Dvor v meste ${esc(cn)}: pokladnica mesta dostáva +${zl(bn.tre)} za štvrťrok a rody v meste majú o ${bn.pre} vyššiu prestíž. Ceny tovaru sú o 12 % vyššie (luxusný o 25 %) a dopyt je väčší.${P().city===KRAL.court()?" Ako obyvateľ mesta získavaš aj slávu.":""}</p>`:"";
 let me="";
 if(S.king===0)me=`<p class="good"><b>Kráľom si ty.</b> ${KRAL.here()?"Dvor sídli v tvojom meste.":`Dvor je zatiaľ v meste ${esc(cn)}. Svoje sídlo môžeš prerobiť na kráľovský palác v mapke okolia svojho mesta.`}</p>`;
 else if(p.title<10)me=`<p class="muted">Do voľby sa tvoj rod dostane od titulu Vojvoda (teraz: ${esc(TITLES[p.title].n)}).</p>`;
 else me=`<p>Tvoj rod je medzi kandidátmi. Voľba sa koná, keď panovník zomrie. Pomôže priazeň kráľa, spojenci, charizma, rétorika, sobáš s kráľovským rodom a podpora cirkvi a armády. Nový kráľ si môže sídlo prerobiť na palác a dvor sa presunie do jeho mesta.</p>`;
 queue({title:`Kráľovský palác · ${cn}`,html:`${who}${fam}${dvor}${me}<p class="lbl" style="margin-top:10px">kandidáti na trón (pri voľbe sa pridá náhoda)</p><table style="width:100%;font-size:.92rem">${rows||'<tr><td class="muted">Zatiaľ nie je žiadny kandidát.</td></tr>'}</table>`,btns:[{t:"Zavrieť",a:"mclose"}]});
}
function newPalac(){
 const p=P(),cn=CITY_DEF[p.city].n,cc=CITY_DEF[KRAL.court()].n;
 queue({title:"Prerobiť sídlo na kráľovský palác",html:`<p>Si kráľ. Dvor sídli v meste ${esc(cc)}. Ak si svoje sídlo v meste ${esc(cn)} prerobíš na kráľovský palác, dvor sa presunie k tebe a v ${esc(cc)} ostane po ňom prázdny palác.</p><p class="muted">Stavba stojí ${zl(COST)}.</p>`,
  btns:[{t:`Prerobiť za ${zl(COST)}`,a:"palacBuild",pri:1},{t:"Zavrieť",a:"mclose"}]});
}
A.palacBuild=()=>{
 const p=P();closeModal(true);
 if(S.king!==0||p.money<COST){toast("Na stavbu paláca nemáš dosť peňazí.");return}
 p.money-=COST;led(p,"ine",-COST);
 S.palaceCity=p.city;
 chron(`Tvoj rod prerobil sídlo v meste ${CITY_DEF[p.city].n} na kráľovský palác. Dvor sa presunul k tebe.`,"korunovacia","good");
 try{S.fameB=(S.fameB||0)+60}catch(e){}
 render();
};
/* dvor mestu prináša peniaze a prestíž */
const COURT_PRE=120,COURT_TRE=80;
KRAL.bonus=()=>{const c=S.cities[KRAL.court()];return{pre:COURT_PRE,tre:Math.round(COURT_TRE*(c?c.tier:1))}};
const op=window.prestige;
if(typeof op==="function")window.prestige=function(d){let v=op.apply(this,arguments);try{if(d&&!d.royal&&d.city===KRAL.court())v+=COURT_PRE}catch(e){}return v};
const oe=window.endTurn;
if(typeof oe==="function")window.endTurn=function(){
 const r=oe.apply(this,arguments);
 try{const c=S.cities[KRAL.court()];if(c&&KRAL.here()){c.tre+=KRAL.bonus().tre;const p=P();if(p.city===c.id)S.fameB=(S.fameB||0)+(S.king===0?15:5)}}catch(e){console.warn("kral tre",e)}
 return r};
/* dvor zvyšuje dopyt a ceny v meste, kde sídli */
const PM=1.12,PML=1.25,DEMX=.3,DEMXL=.6;
const oc=window.cpm;
if(typeof oc==="function")window.cpm=function(C,g){let v=oc.apply(this,arguments);try{if(C&&C.id===KRAL.court()&&KRAL.here())v*=(typeof LUX!=="undefined"&&LUX.has(g))?PML:PM}catch(e){}return v};
const om=window.marketTick;
if(typeof om==="function")window.marketTick=function(){
 const r=om.apply(this,arguments);
 try{const C=CC();if(C.id===KRAL.court()&&KRAL.here()){for(const[g,G]of Object.entries(GOODS)){if(G.raw)continue;const m2=S.mkt[g],lux=typeof LUX!=="undefined"&&LUX.has(g);m2.s=Math.max(1,m2.s-G.d*C.k*(lux?DEMXL:DEMX)*R(.85,1.15))}}}catch(e){console.warn("kral trh",e)}
 return r};
const OFT={king:{body:"b9",hat:"h7",jewel:"j0"},queen:{body:"b5",hat:"h6",jewel:"j0"},prince:{body:"b3",hat:"h3",jewel:"j0"},child:{body:"b1",hat:"h0",jewel:"j0"}};
function card(pr,role,kind){
 let img="";
 try{img=`<svg viewBox="0 0 100 120" width="58" height="70" style="border-radius:8px">${portrait(pr.look,pr.age,OFT[kind]||OFT.child,DC(S.king),100,{})}</svg>`}catch(e){img=""}
 return`<div style="text-align:center;width:84px">${img}<div style="font-size:.78rem;line-height:1.2"><b>${esc((pr.name||"").split(" ")[0])}</b><br><span class="muted">${role}${pr.age!=null?", "+pr.age+" r.":""}</span></div></div>`}
const o=A.okoPlace;
A.okoPlace=function(e){
 if(e&&e.k==="palac"){try{palac()}catch(x){console.warn("palac",x)}return}
 if(e&&e.k==="palacnew"){try{newPalac()}catch(x){console.warn("palacnew",x)}return}
 return o.apply(this,arguments)};
/* nový kráľ z AI rodu: dvor sa presunie do jeho mesta */
const kd=window.kingDies;
if(typeof kd==="function"){
 window.kingDies=function(d,old){
  if(S.palaceCity==null)S.palaceCity=KRAL.court();
  const before=S.king,r=kd.apply(this,arguments);
  try{
   if(S.king!==before&&S.king!==0){
    const nk=S.dyn[S.king];
    if(nk&&nk.city!==S.palaceCity){S.palaceCity=nk.city;chron(`Dvor sa presunul do mesta ${CITY_DEF[nk.city].n}, kde sídli rod ${nk.name}.`,"korunovacia")}
   }
  }catch(x){console.warn("kral court",x)}
  return r;
 };
}
})();

;
