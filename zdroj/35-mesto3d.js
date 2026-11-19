/* ==== js/mesto3d.js ==== */
/* Mesto v 3D – (v163, účes „na hrniec“ už nezakrýva tvár): prechádzka mestom postaveným podľa mapy mesta. Len na počítači. Autor: Dávid Mucha. */
(function(){
"use strict";
const THREE_URL="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
const hasS=()=>{try{return !!S&&!!S.dyn}catch(e){return false}};
const desk=()=>true;
const U=10;
let T=null,st=null,LABELS=[],CHIM=[],REST=null;

/* ---------- správa farieb (v102): rovnaký vzhľad v každej verzii knižnice ----------
   Staršia knižnica (r128) počíta svetlo priamo vo farbách obrazovky a výsledok je prepálený. Tu sa farby prevedú na lineárne, svetlá sa zoslabia a obraz sa na konci prevedie späť. */
let CMON=true;try{CMON=localStorage.getItem("m3cm")!=="0"}catch(e){}
const LEG0=()=>!!T&&(+T.REVISION<152||!!window.__m3legacy);const LEG=()=>LEG0()&&CMON;
function applyCM(){if(!LEG0()||T.__m3cm)return;T.__m3cm=1;try{
  const C=T.Color.prototype,sH=C.setHex,sS=C.setStyle;let inS=0;
  C.setHex=function(){const r=sH.apply(this,arguments);if(!inS&&CMON)this.convertSRGBToLinear();return r};
  C.setStyle=function(){inS++;let r;try{r=sS.apply(this,arguments)}finally{inS--}if(!inS&&CMON)this.convertSRGBToLinear();return r};
  const CT=T.CanvasTexture;const W=function(c,a,b,d,e,f,g2,h,i){const t=new CT(c,a,b,d,e,f,g2,h,i);if(CMON)t.encoding=T.sRGBEncoding;return t};W.prototype=CT.prototype;T.CanvasTexture=W}catch(e){console.warn("3D farby",e)}}
/* kvalita grafiky (v246): 0 nízka, 1 stredná, 2 vysoká; kláves Q */
function QL(){try{const v=localStorage.getItem("m3q");return v==null?2:Math.max(0,Math.min(2,+v||0))}catch(e){return 2}}
function shOn(){try{return localStorage.getItem("m3sh")!=="0"}catch(e){return true}}
function legLights(sc){if(!LEG())return;sc.traverse(o=>{if(o.isLight&&!o.userData.lg){o.userData.lg=1;o.intensity/=Math.PI}})}
function loadThree(){return new Promise((ok,no)=>{if(window.THREE)return ok();const s=document.createElement("script");s.src=THREE_URL;s.onload=()=>ok();s.onerror=()=>no(new Error("three"));document.head.appendChild(s)})}
A.m3d=function(){if(st)return;loadThree().then(()=>{T=window.THREE;applyCM();try{open()}catch(e){console.warn("3D",e);close();toast("3D mesto sa nepodarilo otvoriť.","bad")}}).catch(()=>toast("3D knižnica sa nenačítala. Skontroluj pripojenie.","bad"))};
A.m3dx=function(){close()};

/* ---------- pomocné tvary ---------- */
const M=(c,o)=>o&&o.flatShading?new T.MeshPhongMaterial(Object.assign({color:c,shininess:0,specular:0},o)):new T.MeshLambertMaterial(Object.assign({color:c},o||{}));
/* kreslené textúry: omietka, hrazdenie, škridla, kameň, dlažba, tráva, voda */
const TXC={};
function rgb(c){const n=parseInt(c.slice(1),16);return[n>>16&255,n>>8&255,n&255]}
const sh=(c,k)=>{const[r,g2,b]=rgb(c);const f=v=>Math.max(0,Math.min(255,Math.round(v*k)));return`rgb(${f(r)},${f(g2)},${f(b)})`};
function tx(kind,col,rx,ry){const key=[kind,col,rx,ry].join("|");if(TXC[key])return TXC[key];const bk=kind+"|"+col;let cv=TXC[bk];
 if(!cv){cv=document.createElement("canvas");cv.width=cv.height=128;const x=cv.getContext("2d");let sd=7;const R=()=>(sd=(sd*16807)%2147483647)/2147483647;
  x.fillStyle=col;x.fillRect(0,0,128,128);
  if(kind==="plaster"||kind==="timber"){for(let i=0;i<260;i++){x.fillStyle=sh(col,.9+R()*.2);x.fillRect(R()*128,R()*128,2+R()*5,1+R()*3)}
   if(kind==="timber"){x.strokeStyle="#4a3220";x.lineWidth=7;x.strokeRect(3,3,122,122);x.beginPath();x.moveTo(64,0);x.lineTo(64,128);x.moveTo(0,64);x.lineTo(128,64);x.stroke();x.lineWidth=5;x.beginPath();x.moveTo(6,122);x.lineTo(60,68);x.moveTo(122,122);x.lineTo(68,68);x.stroke()}}
  else if(kind==="roof"){for(let r=0;r<8;r++)for(let i=-1;i<9;i++){const ox=i*16+(r%2?8:0),oy=r*16;x.fillStyle=sh(col,.82+R()*.3);x.beginPath();x.moveTo(ox,oy);x.lineTo(ox+16,oy);x.lineTo(ox+16,oy+10);x.quadraticCurveTo(ox+8,oy+19,ox,oy+10);x.closePath();x.fill();x.strokeStyle="rgba(30,12,6,.35)";x.lineWidth=1;x.stroke()}}
  else if(kind==="stone"){for(let r=0;r<6;r++)for(let i=-1;i<5;i++){const ox=i*32+(r%2?16:0),oy=r*21.4;x.fillStyle=sh(col,.84+R()*.28);x.fillRect(ox+1,oy+1,30,19.4)}x.strokeStyle="rgba(40,32,24,.25)";x.strokeRect(0,0,128,128)}
  else if(kind==="cobble"){for(let i=0;i<150;i++){const px2=R()*128,py2=R()*128;x.fillStyle=sh(col,.8+R()*.36);x.beginPath();x.ellipse(px2,py2,5+R()*4,4+R()*3,R()*3,0,7);x.fill();x.strokeStyle="rgba(50,40,28,.3)";x.stroke()}}
  else if(kind==="grass"){for(let i=0;i<700;i++){x.fillStyle=sh(col,.82+R()*.34);x.fillRect(R()*128,R()*128,1.5,3+R()*4)}}
  else if(kind==="water"){for(let i=0;i<60;i++){x.strokeStyle=`rgba(255,255,255,${.1+R()*.22})`;x.lineWidth=1.5;const px2=R()*128,py2=R()*128;x.beginPath();x.moveTo(px2,py2);x.quadraticCurveTo(px2+9,py2-4,px2+18,py2);x.stroke()}}
  else if(kind==="wood"){for(let i=0;i<8;i++){x.fillStyle=sh(col,.85+R()*.25);x.fillRect(i*16,0,15,128)}}
  TXC[bk]=cv}
 const t=new T.CanvasTexture(cv);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx||1,ry||1);return(TXC[key]=t)}
const MT=(kind,col,rx,ry,o)=>new T.MeshLambertMaterial(Object.assign({color:"#ffffff",map:tx(kind,col,rx,ry)},o||{}));
function box(g,x,y,z,w,h,d,c,ry,t){const m=new T.Mesh(new T.BoxGeometry(w,h,d),t?MT(t,c,Math.max(1,Math.round(Math.max(w,d)/(t==="stone"?3:2.2))),Math.max(1,Math.round(h/(t==="stone"?2.2:2.4)))):M(c));m.position.set(x,y+h/2,z);if(ry)m.rotation.y=ry;m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
function pyr(g,x,y,z,w,h,d,c,ry){const m=new T.Mesh(new T.ConeGeometry(Math.max(w,d)*.72,h,4),M(c));m.position.set(x,y+h/2,z);m.rotation.y=(ry||0)+Math.PI/4;m.scale.set(w>d?1:w/d,1,d>w?1:d/w);m.castShadow=true;g.add(m);return m}
function gable(g,x,y,z,w,h,d,c,ry){/* sedlová strecha, hrebeň pozdĺž osi x */
 const geo=new T.BufferGeometry(),a=w/2+.25,b=d/2+.25;
 const v=[-a,0,-b, a,0,-b, a,0,b, -a,0,b, -a,h,0, a,h,0];
 const idx=[0,4,5, 0,5,1, 3,2,5, 3,5,4, 0,3,4, 1,5,2];
 geo.setAttribute("position",new T.Float32BufferAttribute(v,3));geo.setAttribute("uv",new T.Float32BufferAttribute([0,0,1,0,1,0,0,0,0,1,1,1],2));geo.setIndex(idx);geo.computeVertexNormals();
 const m=new T.Mesh(geo,MT("roof",c,Math.max(1,Math.round(w/1.6)),2,{side:T.DoubleSide}));m.position.set(x,y,z);if(ry)m.rotation.y=ry;m.castShadow=true;g.add(m);return m}
function cyl(g,x,y,z,r,h,c,seg){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,seg||12),M(c));m.position.set(x,y+h/2,z);m.castShadow=true;g.add(m);return m}
/* cedule (v159): každý druh má vlastný tvar a rám sa zlepšuje s bohatstvom či úrovňou */
function wTier(d){try{const m=Math.max(0,d.money||0);return m<1000?0:m<5000?1:m<20000?2:m<80000?3:m<400000?4:5}catch(e){return 0}}
function label(text,color,scale,o){o=o||{};const kd=o.k||"plain",rk=Math.max(0,Math.min(5,o.r|0));const c=document.createElement("canvas");c.width=512;c.height=128;const x=c.getContext("2d");
 const big=kd==="pub"||kd==="event";x.font=(kd==="bld"||kd==="pub"?"700 ":"600 ")+(kd==="npc"||kd==="note"?38:42)+"px Georgia,serif";const tw=x.measureText(text).width,pad=kd==="person"||kd==="seat"?(color?74:44):kd==="bld"?52:40,w=Math.min(500,tw+pad),l=(512-w)/2,T0=34,H0=68,B0=T0+H0,cy=T0+H0/2;
 const MET=[["#6b4a2a","#3a2a1a"],["#7a5a34","#3a2a1a"],["#a8703a","#5a3418"],["#c8ccd2","#6a6e78"],["#e3be4f","#8a6a1a"],["#f0d060","#8a6a1a"]][rk];
 const rr=(X,Y,W,H,r)=>{x.beginPath();x.moveTo(X+r,Y);x.lineTo(X+W-r,Y);x.quadraticCurveTo(X+W,Y,X+W,Y+r);x.lineTo(X+W,Y+H-r);x.quadraticCurveTo(X+W,Y+H,X+W-r,Y+H);x.lineTo(X+r,Y+H);x.quadraticCurveTo(X,Y+H,X,Y+H-r);x.lineTo(X,Y+r);x.quadraticCurveTo(X,Y,X+r,Y);x.closePath()};
 const studs=(col)=>{x.fillStyle=col;[[l+9,T0+9],[l+w-9,T0+9],[l+9,B0-9],[l+w-9,B0-9]].forEach(q=>{x.beginPath();x.arc(q[0],q[1],4,0,7);x.fill()})};
 const frame=(inset)=>{/* rám podľa stupňa */x.lineJoin="round";if(rk===0){x.strokeStyle=MET[1];x.lineWidth=3;x.stroke()}else{x.strokeStyle=MET[1];x.lineWidth=rk>=3?9:7;x.stroke();x.strokeStyle=MET[0];x.lineWidth=rk>=3?5:3;x.stroke();if(rk>=2){rr(l+inset,T0+inset,w-inset*2,H0-inset*2,4);x.strokeStyle=MET[rk>=4?0:1];x.lineWidth=1.5;x.stroke()}if(rk>=2)studs(MET[0]);
   if(rk>=4){x.fillStyle=MET[0];x.strokeStyle=MET[1];x.lineWidth=1.5;[l-2,l+w+2].forEach(X=>{x.beginPath();x.moveTo(X,cy-12);x.lineTo(X+(X<256?-10:10),cy);x.lineTo(X,cy+12);x.closePath();x.fill();x.stroke()})}
   if(rk>=5){/* koruna */const cx=256,by=T0-2;x.fillStyle=MET[0];x.strokeStyle=MET[1];x.lineWidth=2;x.beginPath();x.moveTo(cx-30,by);x.lineTo(cx-34,by-22);x.lineTo(cx-18,by-11);x.lineTo(cx-9,by-27);x.lineTo(cx,by-12);x.lineTo(cx+9,by-27);x.lineTo(cx+18,by-11);x.lineTo(cx+34,by-22);x.lineTo(cx+30,by);x.closePath();x.fill();x.stroke();x.fillStyle="#b8362c";[-9,9].forEach(q=>{x.beginPath();x.arc(cx+q,by-27,3,0,7);x.fill()});x.fillStyle="#2f5bb0";x.beginPath();x.arc(cx,by-6,3.2,0,7);x.fill()}}};
 let ink="#2b2117",tx=256;
 if(kd==="person"||kd==="seat"){/* stuha so zastrihnutými koncami a štítom rodu */const e=kd==="seat"?0:16;x.fillStyle=rk>=5?"#efe0f4":rk>=4?"#fbf0cc":"rgba(244,234,208,.96)";if(e){x.beginPath();x.moveTo(l-e,T0+8);x.lineTo(l,T0+8);x.lineTo(l,B0+6);x.lineTo(l-e,B0+6);x.lineTo(l-e+9,cy+7);x.closePath();x.moveTo(l+w+e,T0+8);x.lineTo(l+w,T0+8);x.lineTo(l+w,B0+6);x.lineTo(l+w+e,B0+6);x.lineTo(l+w+e-9,cy+7);x.closePath();x.fillStyle="#c9b890";x.fill();x.strokeStyle="#3a2a1a";x.lineWidth=2;x.stroke();x.fillStyle=rk>=5?"#efe0f4":rk>=4?"#fbf0cc":"rgba(244,234,208,.96)"}
   rr(l,T0,w,H0,kd==="seat"?4:10);x.fill();frame(6);
   if(color){const sx=l+12,sy=T0+11,sw=30,sh=46;x.beginPath();x.moveTo(sx,sy);x.lineTo(sx+sw,sy);x.lineTo(sx+sw,sy+sh*.55);x.quadraticCurveTo(sx+sw,sy+sh*.9,sx+sw/2,sy+sh);x.quadraticCurveTo(sx,sy+sh*.9,sx,sy+sh*.55);x.closePath();x.fillStyle=color;x.fill();x.strokeStyle=rk>=3?MET[0]:"#2b2117";x.lineWidth=2.5;x.stroke();x.strokeStyle="rgba(255,255,255,.55)";x.lineWidth=3;x.beginPath();x.moveTo(sx+7,sy+18);x.lineTo(sx+sw/2,sy+9);x.lineTo(sx+sw-7,sy+18);x.stroke();tx=256+19}}
 else if(kd==="bld"){/* drevený vývesný štít na reťaziach */x.strokeStyle="#2a2a2e";x.lineWidth=4;[l+26,l+w-26].forEach(X=>{x.beginPath();x.moveTo(X,T0);x.lineTo(X,10);x.stroke()});x.fillStyle="#3a3a42";x.fillRect(l+10,6,w-20,7);
   const g=x.createLinearGradient(0,T0,0,B0);g.addColorStop(0,"#8a6238");g.addColorStop(1,"#6a4626");rr(l,T0,w,H0,6);x.fillStyle=g;x.fill();x.save();x.clip();x.strokeStyle="rgba(40,24,10,.35)";x.lineWidth=1.5;for(let yy=T0+11;yy<B0;yy+=11){x.beginPath();x.moveTo(l,yy);x.bezierCurveTo(l+w*.3,yy+3,l+w*.6,yy-3,l+w,yy+1);x.stroke()}if(color){x.fillStyle=color;x.fillRect(l,T0,13,H0)}x.restore();rr(l,T0,w,H0,6);frame(7);if(rk<2){x.fillStyle="#2a2a2e";[[l+26,T0+8],[l+w-26,T0+8]].forEach(q=>{x.beginPath();x.arc(q[0],q[1],4,0,7);x.fill()})}ink=rk>=4?"#fbe9a8":"#f4ead0";tx=256+(color?5:0)}
 else if(kd==="pub"){/* kamenná tabuľa */const g=x.createLinearGradient(0,T0,0,B0);g.addColorStop(0,"#d8d2c4");g.addColorStop(1,"#a8a294");x.beginPath();x.moveTo(l+10,T0);x.lineTo(l+w-10,T0);x.lineTo(l+w,T0+10);x.lineTo(l+w,B0-10);x.lineTo(l+w-10,B0);x.lineTo(l+10,B0);x.lineTo(l,B0-10);x.lineTo(l,T0+10);x.closePath();x.fillStyle=g;x.fill();x.strokeStyle="#4a463e";x.lineWidth=4;x.stroke();rr(l+7,T0+7,w-14,H0-14,2);x.strokeStyle=color||"#7a746a";x.lineWidth=2.5;x.stroke();x.fillStyle="rgba(60,56,48,.25)";for(let i=0;i<14;i++)x.fillRect(l+12+((i*37)%(w-24)),T0+10+((i*23)%(H0-20)),2,2);ink="#2b2620"}
 else if(kd==="event"){x.beginPath();x.moveTo(l-12,T0);x.lineTo(l+w+12,T0);x.lineTo(l+w-2,cy);x.lineTo(l+w+12,B0);x.lineTo(l-12,B0);x.lineTo(l+2,cy);x.closePath();x.fillStyle=/Mor/.test(text)?"#2a2a2e":"#8a1f24";x.fill();x.strokeStyle="#e3be4f";x.lineWidth=3;x.stroke();ink="#fbe9a8"}
 else if(kd==="stall"){/* plátenná zástavka */x.beginPath();x.moveTo(l,T0+4);x.lineTo(l+w,T0+4);x.lineTo(l+w,B0-8);for(let k=6;k>=0;k--){const X=l+w*k/6;x.lineTo(X+(k<6?w/12:0),B0-8+(k<6?10:0));x.lineTo(X,B0-8)}x.closePath();x.fillStyle="#f1e6c8";x.fill();x.strokeStyle="#5a4028";x.lineWidth=2.5;x.stroke();if(color){x.fillStyle=color;x.fillRect(l+3,T0+7,w-6,9)}x.strokeStyle="#5a4028";x.lineWidth=3;x.beginPath();x.moveTo(l-6,T0+4);x.lineTo(l+w+6,T0+4);x.stroke();tx=256}
 else if(kd==="npc"){/* jednoduchý plátenný štítok */rr(l,T0+6,w,H0-12,(H0-12)/2);x.fillStyle="rgba(232,222,200,.92)";x.fill();x.strokeStyle="#7a6a50";x.lineWidth=2;x.setLineDash([6,4]);x.stroke();x.setLineDash([]);ink="#3a3024"}
 else if(kd==="note"){/* mosadzná tabuľka */const g=x.createLinearGradient(0,T0,0,B0);g.addColorStop(0,"#e8cf86");g.addColorStop(1,"#b8963a");rr(l,T0+5,w,H0-10,5);x.fillStyle=g;x.fill();x.strokeStyle="#5a4418";x.lineWidth=3;x.stroke();x.fillStyle="#5a4418";[[l+10,cy],[l+w-10,cy]].forEach(q=>{x.beginPath();x.arc(q[0],q[1],3.2,0,7);x.fill()});if(color){x.fillStyle=color;x.fillRect(l+18,T0+12,8,H0-24)}ink="#2b2117"}
 else{x.fillStyle="rgba(244,234,208,.94)";x.strokeStyle="#2b2117";x.lineWidth=4;x.beginPath();x.rect(l,T0,w,H0);x.fill();x.stroke();if(color){x.fillStyle=color;x.fillRect(l+6,T0+6,14,H0-12)}tx=256+(color?8:0)}
 x.fillStyle=ink;x.textAlign="center";x.textBaseline="middle";if(kd==="bld"){x.fillStyle="rgba(20,12,6,.55)";x.fillText(text,tx+1.5,cy+3.5,470);x.fillStyle=ink}x.fillText(text,tx,cy+2,470);
 const sp=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),depthTest:true,alphaTest:.4,transparent:true}));const k=scale||1;sp.scale.set(6.4*k,1.6*k,1);sp.renderOrder=5;LABELS.push(sp);return sp}
function ribbon(g,pts,w,c,y,closed,tk){const P=closed?pts.concat([pts[0]]):pts;const v=[],idx=[],uv=[];let len=0;
 for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)];let dx=b[0]-a[0],dz=b[1]-a[1];const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
  v.push(P[i][0]-dz*w/2,y,P[i][1]+dx*w/2,P[i][0]+dz*w/2,y,P[i][1]-dx*w/2);if(i)len+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);uv.push(len/6,0,len/6,w/6);if(i){const k=i*2;idx.push(k-2,k,k-1,k-1,k,k+1)}}
 const geo=new T.BufferGeometry();geo.setAttribute("position",new T.Float32BufferAttribute(v,3));geo.setAttribute("uv",new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
 const m=new T.Mesh(geo,tk?MT(tk,c,1,1,{side:T.DoubleSide}):M(c,{side:T.DoubleSide}));m.receiveShadow=true;g.add(m);return m}
/* mäkký pás (v241): stred plný, okraje sa plynulo strácajú do trávy; core = podiel plnej šírky */
const SOFTT={};function softTex(core,col){const key=core+"|"+col;if(SOFTT[key])return SOFTT[key];const c=document.createElement("canvas");c.width=64;c.height=64;const x=c.getContext("2d");let sd=5;const R=()=>(sd=(sd*16807)%2147483647)/2147483647;
 x.fillStyle=col;x.fillRect(0,0,64,64);for(let i=0;i<70;i++){const px=R()*64,py=R()*64,r=2+R()*6;x.fillStyle=R()<.5?"rgba(0,0,0,.10)":"rgba(255,255,255,.08)";x.beginPath();x.arc(px,py,r,0,7);x.fill()}
 const a=document.createElement("canvas");a.width=4;a.height=64;const y=a.getContext("2d"),gr=y.createLinearGradient(0,0,0,64),e=(1-core)/2;gr.addColorStop(0,"#000");gr.addColorStop(Math.max(.01,e),"#fff");gr.addColorStop(Math.min(.99,1-e),"#fff");gr.addColorStop(1,"#000");y.fillStyle=gr;y.fillRect(0,0,4,64);
 const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;const am=new T.CanvasTexture(a);am.wrapS=T.RepeatWrapping;return SOFTT[key]={t,am}}
function softRibbon(g,pts,w,col,y,closed,core){const P=closed?pts.concat([pts[0]]):pts;if(!P||P.length<2)return null;const v=[],idx=[],uv=[];let len=0;
 for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)];let dx=b[0]-a[0],dz=b[1]-a[1];const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
  v.push(P[i][0]-dz*w/2,y,P[i][1]+dx*w/2,P[i][0]+dz*w/2,y,P[i][1]-dx*w/2);if(i)len+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);uv.push(len/w,0,len/w,1);if(i){const k=i*2;idx.push(k-2,k,k-1,k-1,k,k+1)}}
 const geo=new T.BufferGeometry();geo.setAttribute("position",new T.Float32BufferAttribute(v,3));geo.setAttribute("uv",new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
 const st=softTex(core==null?.5:core,col),mat=new T.MeshLambertMaterial({map:st.t,alphaMap:st.am,transparent:true,depthWrite:false,side:T.DoubleSide});
 const m=new T.Mesh(geo,mat);m.receiveShadow=true;m.renderOrder=-1;g.add(m);return m}
function offPts(P,o){return P.map((q,i)=>{const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)];let dx=b[0]-a[0],dz=b[1]-a[1];const l=Math.hypot(dx,dz)||1;return[q[0]-dz/l*o,q[1]+dx/l*o]})}
const MUDC=()=>S.season===3?"#c9c9c2":["#6e5a3c","#9a8662","#6a5638"][S.season]||"#8a7450";
let FLAGS=[];
function flag(g,x,y,z,c){cyl(g,x,y,z,.05,2.2,"#3a2a1e",6);const geo=new T.PlaneGeometry(1.1,.7,6,1);geo.translate(.55,0,0);const m=new T.Mesh(geo,M(c,{side:T.DoubleSide}));m.position.set(x+.04,y+1.8,z);g.add(m);FLAGS.push(m);return m}

/* ---------- budovy ---------- */
function house(g,x,z,o){o=o||{};const w=o.w||4,d=o.d||3.2,h=o.h||2.6,ry=o.ry||0;
 box(g,x,0,z,w,h,d,o.wall||"#e6d8b8",ry,o.brick?"stone":o.timber?"timber":"plaster");gable(g,x,h,z,w,o.rh||1.7,d,o.roof||"#a5402a",ry);
 {const cs=Math.cos(ry),sn=Math.sin(ry),n=Math.max(2,Math.round(w/1.5));for(let i=0;i<n;i++){const u=(i+.5)/n*w-w/2;if(Math.abs(u)<.6)continue;[1,-1].forEach(sg=>{const wn=box(g,x+cs*u+sn*sg*(d/2+.03),h*.5,z-sn*u+cs*sg*(d/2+.03),.55,.7,.05,"#33405c",ry);wn.castShadow=false;const fr=box(g,x+cs*u+sn*sg*(d/2+.02),h*.5-.06,z-sn*u+cs*sg*(d/2+.02),.7,.82,.04,"#f4ead0",ry);fr.castShadow=false})}
  if(!o.noChim){const cx=x+cs*(w*.28),cz=z-sn*(w*.28);box(g,cx,h+(o.rh||1.7)*.45,cz,.45,1.1,.45,"#8a5a44");CHIM.push([cx,h+(o.rh||1.7)*.45+1.2,cz])}}
 const dr=box(g,x+Math.sin(ry)*(d/2+.02),0,z+Math.cos(ry)*(d/2+.02),.8,1.4,.08,"#5a3a20",ry);dr.castShadow=false;
}
/* ---------- budovy podľa mapy mesta (v85): rovnaké recepty, textúry, okná a dvere ako na mape ---------- */
let I3=null,I3S=-1,FC={},RC={},PC={},GL2=true;
let DARKW=false,NIGHT3=false,INDOOR=false,I3D=null,I3DS=-1;
const ISOCFG=()=>({W:2400,H:1400,s:12,ox:1200,oy:690,seed:9,moreTex:(paint,stone)=>({plasterB:paint(256,256,[214,186,150],{strokes:1800}),plasterG:paint(256,256,[196,206,178],{strokes:1800}),plasterR:paint(256,256,[206,160,140],{strokes:1800}),plasterW:paint(256,256,[238,232,214],{strokes:1400}),gold:paint(256,256,[214,168,52],{blocks:[12,8],l:[.4,-.2]}),brick:paint(256,256,[166,78,48],{blocks:[18,8],l:[.2,-.4]})})});
function isoDay(){if(!NIGHT3)return iso();if(I3D&&I3DS===S.season)return I3D;I3D=ISO(ISOCFG());I3D.begin(1,S.season);I3DS=S.season;return I3D}
function wainDraw(x,a,b,col){x.fillStyle=col;x.fillRect(0,0,a,1.15);x.strokeStyle="rgba(0,0,0,.35)";x.lineWidth=.05;x.beginPath();for(let q=.4;q<a;q+=.8){x.moveTo(q,.14);x.lineTo(q,1.02)}x.stroke();x.fillStyle="rgba(255,240,200,.28)";x.fillRect(0,1.15,a,.1);x.fillStyle="rgba(0,0,0,.3)";x.fillRect(0,0,a,.12);x.fillRect(0,1.05,a,.06)}
function wx3(){try{const w=wxOf();return/dážď|búrka/.test(w)?"dazd":w==="hmla"?"hmla":w==="sneženie"?"sneh":"jasno"}catch(e){return"jasno"}}
function iso(){const nk=S.season+"|"+(NIGHT3?1:0);if(I3&&I3S===nk)return I3;
 I3=ISO(ISOCFG());
 I3.begin(NIGHT3?3:1,S.season);I3S=nk;FC={};RC={};PC={};return I3}
const r2=v=>Math.round(v*100)/100;
/* jedna stena alebo strecha nakreslená tou istou funkciou ako na mape */
function faceMat(tex,lu,lv,n,opt,snowy,merl){const I=INDOOR?isoDay():iso();if(!I.TX[tex])tex="plaster";const o2={};for(const k in opt||{})if(opt[k]!=null&&opt[k]!==false&&opt[k]!==0&&typeof opt[k]!=="function")o2[k]=opt[k];
 const key=JSON.stringify([tex,r2(lu),r2(lv),n,o2,snowy?1:0,merl?1:0,INDOOR?1:0]);if(FC[key])return FC[key];
 const PX=INDOOR?Math.max(22,Math.min(52,2000/Math.max(lu,lv))):lu*lv>70?30:lu*lv>24?46:60;const c=document.createElement("canvas");c.width=Math.max(8,Math.round(lu*PX));c.height=Math.max(8,Math.round(lv*PX));const x=c.getContext("2d");
 const sx=c.width/lu,sy=c.height/lv,H=c.height,proto=CanvasRenderingContext2D.prototype;
 x.setTransform=function(){proto.setTransform.call(this,sx,0,0,-sy,0,H)};
 try{I.face(x,[0,0,0],[lu,0,0],[0,0,lv],n,tex,Object.assign({},o2,{noEdge:1},merl?{draw:(x3,a,b)=>{for(let m2=.25;m2<a;m2+=1.3)x3.clearRect(m2,b-.6,.62,.7)}}:o2.wain?{draw:(x3,a,b)=>wainDraw(x3,a,b,o2.wain)}:{}))}catch(e){proto.setTransform.call(x,1,0,0,1,0,0);x.fillStyle="#d8ccb0";x.fillRect(0,0,c.width,c.height)}
 delete x.setTransform;
 /* zašpinenie (v241): pri zemi odstreknuté blato, pod strechou tmavší pás */
 if(o2.grime&&!INDOOR){x.setTransform(1,0,0,1,0,0);const gH=Math.min(c.height*.42,PX*.8),gr=x.createLinearGradient(0,c.height,0,c.height-gH);gr.addColorStop(0,"rgba(62,46,28,.42)");gr.addColorStop(1,"rgba(62,46,28,0)");x.fillStyle=gr;x.fillRect(0,c.height-gH,c.width,gH);
  const tH=Math.min(c.height*.25,PX*.35),g2=x.createLinearGradient(0,0,0,tH);g2.addColorStop(0,"rgba(30,22,14,.30)");g2.addColorStop(1,"rgba(30,22,14,0)");x.fillStyle=g2;x.fillRect(0,0,c.width,tH);
  let sd=Math.round(lu*97+lv*31);const R=()=>(sd=(sd*16807)%2147483647)/2147483647;for(let i=0;i<Math.round(lu*1.4);i++){const sx2=R()*c.width,sl=c.height*(.25+R()*.4),gs=x.createLinearGradient(0,0,0,sl);gs.addColorStop(0,"rgba(40,32,22,.16)");gs.addColorStop(1,"rgba(40,32,22,0)");x.fillStyle=gs;x.fillRect(sx2,0,Math.max(2,PX*.08),sl)}}
 if(!INDOOR&&!merl){x.setTransform(1,0,0,1,0,0);x.strokeStyle="rgba(43,33,23,.5)";x.lineWidth=Math.max(2,PX*.07);x.strokeRect(0,0,c.width,c.height)}if(snowy){x.setTransform(1,0,0,1,0,0);x.fillStyle="rgba(248,252,255,.82)";x.fillRect(0,0,c.width,c.height)}
 const t=new T.CanvasTexture(c);if(!GL2){t.minFilter=T.LinearFilter;t.generateMipmaps=false}t.anisotropy=8;
 return FC[key]=new T.MeshLambertMaterial(Object.assign({map:t,side:T.DoubleSide,emissive:"#ffffff",emissiveMap:t,emissiveIntensity:INDOOR?.3:NIGHT3?.95:.1},merl?{alphaTest:.5}:{}))}
function repMat(tex,rx,ry,tint){const I=INDOOR?isoDay():iso();if(!I.TX[tex])tex="cyl";const key=[tex,r2(rx),r2(ry),tint||"",INDOOR?1:0].join("|");if(RC[key])return RC[key];
 const t=new T.CanvasTexture(I.TX[tex]);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx,ry);return RC[key]=new T.MeshLambertMaterial({map:t,color:tint||"#ffffff"})}
function quad3(g,P4,mat,cast){const B=g.userData.qb||(g.userData.qb=new Map()),key=mat.uuid+(cast===false?"n":"c");let q=B.get(key);if(!q)B.set(key,q={mat,cast:cast!==false,V:[],U:[],I:[]});
 const base=q.V.length/3,xf=g.userData.xf;P4.forEach(p=>{if(xf)p=xf(p);q.V.push(p[0],p[2],p[1])});if(P4.length===3){q.U.push(0,0,1,0,.5,1);q.I.push(base,base+1,base+2)}else{q.U.push(0,0,1,0,1,1,0,1);q.I.push(base,base+1,base+2,base,base+2,base+3)}}
function flushQuads(g){const B=g.userData.qb;if(!B)return;B.forEach(q=>{if(!q.I.length)return;const geo=new T.BufferGeometry();geo.setAttribute("position",new T.Float32BufferAttribute(q.V,3));geo.setAttribute("uv",new T.Float32BufferAttribute(q.U,2));geo.setIndex(q.I);geo.computeVertexNormals();
  const m=new T.Mesh(geo,q.mat);m.castShadow=q.cast;m.receiveShadow=q.cast;g.add(m)});g.userData.qb=null}
function parseCol(s){s=String(s||"#888");const m=s.match(/rgba?\(([^)]+)\)/);if(m){const q=m[1].split(",").map(Number);return{c:`rgb(${q[0]|0},${q[1]|0},${q[2]|0})`,a:q.length>3?q[3]:1}}return{c:s,a:1}}
function polyMat(fs){if(PC[fs])return PC[fs];const q=parseCol(fs);return PC[fs]=new T.MeshLambertMaterial({color:q.c,side:T.DoubleSide,transparent:q.a<1,opacity:q.a,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})}
/* adaptér: rovnaké volania ako kreslenie mapy (box, gable, cyl, house), výsledkom sú 3D telesá */
function mapKit(g){const I=iso(),snow=S.season===3,WN=[.857,-.515,0];
 function box(x0,y0,w,d,h,o){o=o||{};const z0=o.z||0,z1=z0+h,tex=o.tex||"wall";
  const tX=o.texX||(tex==="wall"?"wallX":tex==="plaster"?"plasterX":tex),tY=o.texY||(tex==="wall"?"wallY":tex==="plaster"?"plaster":tex);
  const cm={quoin:o.quoin,timber:o.timber,band:o.band,tpu:o.tpu,clean:1,grime:o.grime&&!z0?1:0};
  const oX=Object.assign({win:o.winX,sqwin:o.sqX,door:o.doorX,slits:o.slitsX},cm),oY=Object.assign({win:o.winY,sqwin:o.sqY,door:o.doorY,slits:o.slitsY},cm);
  const cast=!o.noCast;
  quad3(g,[[x0+w,y0+d,z0],[x0+w,y0,z0],[x0+w,y0,z1],[x0+w,y0+d,z1]],faceMat(tX,d,h,WN,oX),cast);
  quad3(g,[[x0,y0+d,z0],[x0+w,y0+d,z0],[x0+w,y0+d,z1],[x0,y0+d,z1]],faceMat(tY,w,h,WN,oY),cast);
  quad3(g,[[x0,y0,z0],[x0,y0+d,z0],[x0,y0+d,z1],[x0,y0,z1]],faceMat(tX,d,h,WN,Object.assign({},oX,{door:null})),cast);
  quad3(g,[[x0+w,y0,z0],[x0,y0,z0],[x0,y0,z1],[x0+w,y0,z1]],faceMat(tY,w,h,WN,Object.assign({},oY,{door:null})),cast);
  if(!o.noTop)quad3(g,[[x0,y0+d,z1],[x0+w,y0+d,z1],[x0+w,y0,z1],[x0,y0,z1]],faceMat(o.topTex||"top",w,d,[0,0,1],{tpu:o.tpu,clean:1}),cast);
  /* plastické detaily: parapety pod oknami a prah pred dverami */
  if(!INDOOR&&!o.plain){const sm=polyMatSolid("#d9cfb6"),sd=.13,sh=.08;const sill=(P0,U,N,a,b,ww)=>{const p=t=>[P0[0]+U[0]*t,P0[1]+U[1]*t],A=p(a-.1),B=p(a+ww+.1),zt=z0+b,ox=N[0]*sd,oy=N[1]*sd;
    quad3(g,[[A[0],A[1],zt],[B[0],B[1],zt],[B[0]+ox,B[1]+oy,zt],[A[0]+ox,A[1]+oy,zt]],sm,false);quad3(g,[[A[0]+ox,A[1]+oy,zt-sh],[B[0]+ox,B[1]+oy,zt-sh],[B[0]+ox,B[1]+oy,zt],[A[0]+ox,A[1]+oy,zt]],sm,false)};
   const glow=(P0,U,N,a,b,ww,hh)=>{if(!NIGHT3)return;if(DARKW){if(!GFX.darkM)GFX.darkM=new T.MeshBasicMaterial({color:"#10131c",side:T.DoubleSide});const p=t=>[P0[0]+U[0]*t+N[0]*.05,P0[1]+U[1]*t+N[1]*.05],A=p(a-.09),B=p(a+ww+.09),h2=hh||1;quad3(g,[[A[0],A[1],z0+b-.09],[B[0],B[1],z0+b-.09],[B[0],B[1],z0+b+h2+.09],[A[0],A[1],z0+b+h2+.09]],GFX.darkM,false);return}if(!GFX.glowM)GFX.glowM=new T.MeshBasicMaterial({map:new T.CanvasTexture(blobTex()),color:"#ffb648",transparent:true,opacity:.5,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false});const p=t=>[P0[0]+U[0]*t+N[0]*.07,P0[1]+U[1]*t+N[1]*.07],A=p(a-.55),B=p(a+ww+.55),z0g=z0+b-.5,z1g=z0+b+(hh||1)+.5;quad3(g,[[A[0],A[1],z0g],[B[0],B[1],z0g],[B[0],B[1],z1g],[A[0],A[1],z1g]],GFX.glowM,false)};
   /* plastické rámy, preklady a okenice (v125) */
   const slab=(P0,U,N,a0,a1,zb,zt,dep,mat)=>{const p=(t,k)=>[P0[0]+U[0]*t+N[0]*k,P0[1]+U[1]*t+N[1]*k],A=p(a0,0),B=p(a1,0),A2=p(a0,dep),B2=p(a1,dep);
     quad3(g,[[A2[0],A2[1],zb],[B2[0],B2[1],zb],[B2[0],B2[1],zt],[A2[0],A2[1],zt]],mat,false);quad3(g,[[A[0],A[1],zt],[B[0],B[1],zt],[B2[0],B2[1],zt],[A2[0],A2[1],zt]],mat,false);quad3(g,[[A[0],A[1],zb],[B[0],B[1],zb],[B2[0],B2[1],zb],[A2[0],A2[1],zb]],mat,false);
     quad3(g,[[A[0],A[1],zb],[A2[0],A2[1],zb],[A2[0],A2[1],zt],[A[0],A[1],zt]],mat,false);quad3(g,[[B[0],B[1],zb],[B2[0],B2[1],zb],[B2[0],B2[1],zt],[B[0],B[1],zt]],mat,false)};
   const hsh=(a,b)=>{const v=Math.sin(a*12.9898+b*78.233)*43758.5453;return v-Math.floor(v)};
   const stone=tex==="wall",SHC=["#3f6a4a","#7a2f2a","#2f4f7a","#6a4a2a","#8a6a2a","#4a5a3a"],shm=polyMatSolid(SHC[Math.abs(Math.round(x0*7+y0*13))%SHC.length]),fm=polyMatSolid(stone?"#c9c0aa":"#6a4a2c");
   const wl=(arrs,P0,U,N,len)=>arrs.forEach((ar,ai)=>(ar||[]).forEach(q=>{if(q&&q.length>=4&&q[1]>.3){sill(P0,U,N,q[0],q[1],q[2]);glow(P0,U,N,q[0],q[1],q[2],q[3]);const a=q[0],ww=q[2],hh=q[3]||1,zb=z0+q[1],zt=zb+hh;
     if(snow)slab(P0,U,N,a-.1,a+ww+.1,zb,zb+.07,.14,polyMatSolid("#f2f6f8"));
     else if(ai===0&&!stone&&ww<=1.3&&hsh(x0+a*3.1+P0[0],y0+q[1]*5.3+U[0])<.4){const k=hsh(a+x0,y0+q[1]),fc=["#d8453a","#e8b030","#c04a8a","#f0f0e8","#e07a30"];slab(P0,U,N,a,a+ww,zb-.16,zb-.02,.22,polyMatSolid("#6a4a2c"));const pp=(t,kk)=>[P0[0]+U[0]*t+N[0]*kk,P0[1]+U[1]*t+N[1]*kk];
       const blk=(a0,a1,zb2,zt2,d0,d1,mat)=>{const A=pp(a0,d0),B=pp(a1,d0),A2=pp(a0,d1),B2=pp(a1,d1);quad3(g,[[A2[0],A2[1],zb2],[B2[0],B2[1],zb2],[B2[0],B2[1],zt2],[A2[0],A2[1],zt2]],mat,false);quad3(g,[[A[0],A[1],zt2],[B[0],B[1],zt2],[B2[0],B2[1],zt2],[A2[0],A2[1],zt2]],mat,false)};
       blk(a+.03,a+ww-.03,zb-.02,zb+.09,.13,.24,polyMatSolid("#3f7a3a"));const n=Math.max(3,Math.round(ww/.2));for(let i=0;i<n;i++){const t=a+.08+(ww-.16)*i/(n-1);blk(t-.05,t+.05,zb+.07,zb+.16,.15+hsh(i,k)*.05,.25,polyMatSolid(fc[Math.floor(hsh(i+k*7,a)*5)]))}}
     if(ai===0){slab(P0,U,N,a-.13,a+ww+.13,zt,zt+.1,.1,fm);slab(P0,U,N,a-.1,a,zb,zt,.06,fm);slab(P0,U,N,a+ww,a+ww+.1,zb,zt,.06,fm);
      if(!stone&&ww<=1.15&&hh<=1.3){const sw=ww*.5,all=(arrs[0]||[]).concat(arrs[1]||[]),free=(l0,l1)=>l0>.08&&l1<len-.08&&!all.some(r=>r!==q&&r&&r[0]<l1+.05&&r[0]+r[2]>l0-.05&&r[1]<q[1]+hh&&r[1]+(r[3]||1)>q[1]);
       if(free(a-.12-sw,a-.12))slab(P0,U,N,a-.12-sw,a-.12,zb,zt,.045,shm);if(free(a+ww+.12,a+ww+.12+sw))slab(P0,U,N,a+ww+.12,a+ww+.12+sw,zb,zt,.045,shm)}}
     else slab(P0,U,N,a-.1,a+ww+.1,zb-.02,zb+.04,.09,fm)}}));
   wl([o.sqY,o.winY],[x0,y0+d],[1,0],[0,1],w);wl([o.sqX,o.winX],[x0+w,y0+d],[0,-1],[1,0],d);wl([o.sqY,o.winY],[x0+w,y0],[-1,0],[0,-1],w);wl([o.sqX,o.winX],[x0,y0],[0,1],[-1,0],d);
   if(z0===0&&o.noTop&&(o.sqY||o.winY)&&w>=3&&d>=2.6&&h>=2.3&&hsh(x0*1.7,y0*2.3)<.3){const iv=[polyMatSolid(snow?"#6a5a44":"#3f6f38"),polyMatSolid(snow?"#5a4a38":"#56883f")],P0=[x0+w,y0+d],U=[0,-1],N=[1,0],wins=(o.sqX||[]).concat(o.winX||[]),top=h*(.6+hsh(x0,y0)*.35),wd=Math.min(d*.42,1.9);
    for(let i=0;i<(snow?9:26);i++){const zz=hsh(i,x0)*top,sp=wd*(1-zz/top*.55),a=.06+hsh(i*3.3,y0)*sp,sz=.22+hsh(i,7)*.26;if(wins.some(r=>r&&a<r[0]+r[2]+.08&&a+sz>r[0]-.08&&zz<r[1]+(r[3]||1)+.08&&zz+sz>r[1]-.08))continue;if(a+sz>d-.05)continue;slab(P0,U,N,a,a+sz,zz,Math.min(h-.03,zz+sz*(snow?.35:1)),.04+hsh(i,3)*.05,iv[i%2])}}
   if(o.doorY&&z0===0&&o.doorY.length>=3){const dr=o.doorY,a=dr[0],dw=dr[1],dh=dr[2],P0=[x0,y0+d],U=[1,0],N=[0,1];slab(P0,U,N,a-.14,a,0,dh,.1,fm);slab(P0,U,N,a+dw,a+dw+.14,0,dh,.1,fm);if(!dr[3])slab(P0,U,N,a-.18,a+dw+.18,dh,dh+.14,.13,fm);
    if(!stone&&!dr[3]&&z0+h>dh+.75){const wm=polyMatSolid("#7a5234"),xa=x0+a-.3,xb=x0+a+dw+.3,yw=y0+d;quad3(g,[[xa,yw,dh+.62],[xb,yw,dh+.62],[xb,yw+.62,dh+.36],[xa,yw+.62,dh+.36]],wm,false);[xa+.08,xb-.08].forEach(x=>quad3(g,[[x,yw,dh+.2],[x,yw+.5,dh+.4],[x,yw+.56,dh+.36],[x,yw,dh+.1]],fm,false))}}
   if(o.doorY&&z0===0){const dr=o.doorY,st=polyMatSolid("#b9b0a0"),a=x0+dr[0]-.2,b=x0+dr[0]+dr[1]+.2,yy=y0+d;quad3(g,[[a,yy,.12],[b,yy,.12],[b,yy+.55,.12],[a,yy+.55,.12]],st,false);quad3(g,[[a,yy+.55,0],[b,yy+.55,0],[b,yy+.55,.12],[a,yy+.55,.12]],st,false)}}}
 /* ráz mesta (v160): sklon striech, stupňovité štíty severu, benátske komíny */
 const CST=(()=>{let k="pre";try{k=CKEY()}catch(e){}return{k,rm:{ven:.68,bud:.9,par:1.24,gda:1.26,kra:1.16,nur:1.26,lon:1.1,kut:1.08}[k]||1,step:k==="gda"||k==="kra"?"#a65238":k==="nur"?"#c9b89a":null}})();
 function gable(x0,y0,w,d,h,rh,tex,o){o=o||{};const main=!INDOOR&&w>=1.8&&d>=1.8;if(main&&tex!=="thatch")rh*=CST.rm;const z1=h+rh,e=.2,tpu=o.tpu||16,gt=o.gableTex||"plasterX";
  if(main&&CST.step&&tex!=="thatch"&&rh>.9&&(o.alongY?w:d)>=2.3&&(o.alongY?d:w)>=2.6){try{const sm=M(snow?"#d8dde0":CST.step),cap=M(snow?"#eef2f4":"#6a3a28"),n=4,span=o.alongY?w:d;for(let i=0;i<n;i++){const wi=(span+.5)*(1-i/n*.92),hh=rh*(i+1)/n*.93+.28;[0,1].forEach(q=>{const m=new T.Mesh(new T.BoxGeometry(o.alongY?wi:.26,hh,o.alongY?.26:wi),sm);if(o.alongY)m.position.set(x0+w/2,h+hh/2,q?y0+d+.08:y0-.08);else m.position.set(q?x0+w+.08:x0-.08,h+hh/2,y0+d/2);m.castShadow=true;g.add(m);const c2=new T.Mesh(new T.BoxGeometry(o.alongY?wi+.08:.34,.07,o.alongY?.34:wi+.08),cap);c2.position.set(m.position.x,h+hh+.035,m.position.z);g.add(c2)})}}catch(e){}}
  if(!INDOOR&&w>=1.8&&d>=1.8){const rm=polyMatSolid(snow?"#eef2f4":{tile:"#8a3a24",slate:"#454b54",thatch:"#8f7a3e",gold:"#b08a22",shingle:"#5f4a36"}[tex]||"#6a4a34"),ice=polyMatSolid("#dcecf5"),k=.17,up=.09;
   if(!o.alongY){const y=y0+d/2,xa=x0-e-.04,xb=x0+w+e+.04,sl=rh/(d/2)*k;quad3(g,[[xa,y-k,z1-sl+.03],[xb,y-k,z1-sl+.03],[xb,y,z1+up],[xa,y,z1+up]],rm,false);quad3(g,[[xb,y+k,z1-sl+.03],[xa,y+k,z1-sl+.03],[xa,y,z1+up],[xb,y,z1+up]],rm,false);
    if(snow&&tex!=="thatch"){const dz=e*rh/(d/2);for(let x=x0-e+.1;x<x0+w+e-.15;x+=.3){const ln=.14+Math.abs(Math.sin(x*7.3+y0))*.34;[y0+d+e,y0-e].forEach(yy=>quad3(g,[[x,yy,h-dz],[x+.11,yy,h-dz],[x+.055,yy,h-dz-ln]],ice,false))}}}
   else{const x=x0+w/2,ya=y0-e-.04,yb=y0+d+e+.04,sl=rh/(w/2)*k;quad3(g,[[x-k,ya,z1-sl+.03],[x-k,yb,z1-sl+.03],[x,yb,z1+up],[x,ya,z1+up]],rm,false);quad3(g,[[x+k,yb,z1-sl+.03],[x+k,ya,z1-sl+.03],[x,ya,z1+up],[x,yb,z1+up]],rm,false);
    if(snow&&tex!=="thatch"){const dz=e*rh/(w/2);for(let y=y0-e+.1;y<y0+d+e-.15;y+=.3){const ln=.14+Math.abs(Math.sin(y*7.3+x0))*.34;[x0+w+e,x0-e].forEach(xx=>quad3(g,[[xx,y,h-dz],[xx,y+.11,h-dz],[xx,y+.055,h-dz-ln]],ice,false))}}}}
  if(!o.alongY){const dz=e*rh/(d/2),ls=Math.hypot(d/2+e,rh+dz),m=faceMat(tex,w+2*e,ls,[0,0,1],{tpu,clean:1},snow);
   quad3(g,[[x0-e,y0+d+e,h-dz],[x0+w+e,y0+d+e,h-dz],[x0+w+e,y0+d/2,z1],[x0-e,y0+d/2,z1]],m);
   quad3(g,[[x0+w+e,y0-e,h-dz],[x0-e,y0-e,h-dz],[x0-e,y0+d/2,z1],[x0+w+e,y0+d/2,z1]],m);
   const gm=faceMat(gt,d,rh,WN,{tpu:14,clean:1});
   quad3(g,[[x0+w,y0+d,h],[x0+w,y0,h],[x0+w,y0+d/2,z1]],gm);quad3(g,[[x0,y0,h],[x0,y0+d,h],[x0,y0+d/2,z1]],gm)}
  else{const dz=e*rh/(w/2),ls=Math.hypot(w/2+e,rh+dz),m=faceMat(tex,d+2*e,ls,[0,0,1],{tpu,clean:1},snow);
   quad3(g,[[x0+w+e,y0+d+e,h-dz],[x0+w+e,y0-e,h-dz],[x0+w/2,y0-e,z1],[x0+w/2,y0+d+e,z1]],m);
   quad3(g,[[x0-e,y0-e,h-dz],[x0-e,y0+d+e,h-dz],[x0+w/2,y0+d+e,z1],[x0+w/2,y0-e,z1]],m);
   const gm=faceMat(gt==="plasterX"?"plaster":gt,w,rh,WN,{tpu:14,clean:1});
   quad3(g,[[x0,y0+d,h],[x0+w,y0+d,h],[x0+w/2,y0+d,z1]],gm);quad3(g,[[x0+w,y0,h],[x0,y0,h],[x0+w/2,y0,z1]],gm)}
  if(o.dormer&&!o.alongY){const dx=x0+w*.5,by=y0+d*.5+.9,bz=h+rh*.3;box(dx-.7,by-1.2,1.4,1.2,1.15,{z:bz,tex:"plaster",sqY:[[.35,.25,.7,.7]],noTop:1,tpu:12});gable(dx-.7,by-1.2,1.4,1.2,bz+1.15,.6,tex,{alongY:1,tpu:14})}
  if(!INDOOR&&rh>.7){const bm=polyMatSolid(snow?"#cfd8de":"#5a3a20"),rm=polyMatSolid(snow?"#e9eef3":"#4a342a"),bw=.16;
   if(!o.alongY){const ym=y0+d/2;quad3(g,[[x0-e,ym-.14,z1+.03],[x0+w+e,ym-.14,z1+.03],[x0+w+e,ym,z1+.1],[x0-e,ym,z1+.1]],rm,false);quad3(g,[[x0+w+e,ym+.14,z1+.03],[x0-e,ym+.14,z1+.03],[x0-e,ym,z1+.1],[x0+w+e,ym,z1+.1]],rm,false);
    [x0-e-.01,x0+w+e+.01].forEach(xx=>{[[y0+d+e,1],[y0-e,-1]].forEach(q=>{const dz=e*rh/(d/2);quad3(g,[[xx,q[0],h-dz],[xx,ym,z1],[xx,ym,z1-bw*1.4],[xx,q[0]-q[1]*bw,h-dz-bw*.2]],bm,false)})})}
   else{const xm=x0+w/2;quad3(g,[[xm-.14,y0-e,z1+.03],[xm-.14,y0+d+e,z1+.03],[xm,y0+d+e,z1+.1],[xm,y0-e,z1+.1]],rm,false);quad3(g,[[xm+.14,y0+d+e,z1+.03],[xm+.14,y0-e,z1+.03],[xm,y0-e,z1+.1],[xm,y0+d+e,z1+.1]],rm,false);
    [y0-e-.01,y0+d+e+.01].forEach(yy=>{[[x0+w+e,1],[x0-e,-1]].forEach(q=>{const dz=e*rh/(w/2);quad3(g,[[q[0],yy,h-dz],[xm,yy,z1],[xm,yy,z1-bw*1.4],[q[0]-q[1]*bw,yy,h-dz-bw*.2]],bm,false)})})}}
  for(const cx of o.chim||[]){box(cx,y0+d*.55,.8,.8,rh*.6+1,{z:h+rh*.35,tex:"wallX",plain:1});box(cx-.09,y0+d*.55-.09,.98,.98,.14,{z:h+rh*.95+1,tex:"wallX",plain:1});if(CST.k==="ven"&&!INDOOR){const fc=new T.Mesh(new T.CylinderGeometry(.66,.42,.6,10),M(snow?"#e8ecee":"#c9a088"));fc.position.set(cx+.4,h+rh*.95+1.5,y0+d*.55+.4);fc.castShadow=true;g.add(fc)}CHIM.push([cx+.4,h+rh*.95+1.3,y0+d*.55+.4])}}
 function cyl(cx,cy,r,h,o){o=o||{};const z0=o.z||0;const m=new T.Mesh(new T.CylinderGeometry(r,r,h,16),repMat(o.tex||"cyl",Math.max(1,Math.round(r*6.283*22/256*2)),Math.max(.3,r2(h*22/256*2))));
  m.position.set(cx,z0+h/2,cy);m.castShadow=true;m.receiveShadow=true;g.add(m);
  if(o.roof){const c=new T.Mesh(new T.ConeGeometry(r+.33,o.roof,16),repMat(o.roofTex||"slate",3,1,snow?"#ffffff":"#e8e8f0"));if(snow)c.material=polyMatSolid("#eef3f8");c.position.set(cx,z0+h+o.roof/2,cy);c.castShadow=true;g.add(c);
   if(o.finial!==false){const f=new T.Mesh(new T.CylinderGeometry(.04,.04,.7,5),M("#caa54a"));f.position.set(cx,z0+h+o.roof+.3,cy);g.add(f);const b=new T.Mesh(new T.SphereGeometry(.14,8,6),M("#e3be4f"));b.position.set(cx,z0+h+o.roof+.7,cy);g.add(b)}}}
 function house(x0,y0,w,d,h,o){const tex=o.tex||"plaster";
  if(!INDOOR&&w>=1.6&&d>=1.6&&tex!=="wood"){const pm=polyMatSolid(snow?"#9a9890":((Math.round(x0*3+y0*7)%2)?"#857c6a":"#7a7262")),e=.07,ph=.36,A=[x0-e,y0-e],B=[x0+w+e,y0-e],C=[x0+w+e,y0+d+e],D=[x0-e,y0+d+e];
   [[A,B],[B,C],[C,D],[D,A]].forEach(([a,b])=>quad3(g,[[a[0],a[1],0],[b[0],b[1],0],[b[0],b[1],ph],[a[0],a[1],ph]],pm,false));quad3(g,[[A[0],A[1],ph],[B[0],B[1],ph],[x0+w,y0,ph],[x0,y0,ph]],pm,false);quad3(g,[[C[0],C[1],ph],[D[0],D[1],ph],[x0,y0+d,ph],[x0+w,y0+d,ph]],pm,false);quad3(g,[[B[0],B[1],ph],[C[0],C[1],ph],[x0+w,y0+d,ph],[x0+w,y0,ph]],pm,false);quad3(g,[[D[0],D[1],ph],[A[0],A[1],ph],[x0,y0,ph],[x0,y0+d,ph]],pm,false)}
  box(x0,y0,w,d,h,{tex,timber:o.timber,quoin:o.quoin,sqX:o.sqX||[[w*.3-.4,h*.45,.8,.9]],sqY:o.sqY||[[w*.25,h*.45,.8,.9],[w*.65,h*.45,.8,.9]],doorY:o.door||[w*.5-.5,1,1.6,false],noTop:1,tpu:o.tpu||14,band:o.band,grime:INDOOR?0:1});
  gable(x0,y0,w,d,h,o.rh||w*.42,o.roof||"tile",{chim:o.chim,alongY:o.alongY,dormer:o.dormer,tpu:12,gableTex:tex==="wall"?"wallX":"plasterX"})}
 /* rekvizity z mapy: plochy v priestore ako plochy, drobnosti ako maľované tabuľky otočené k hráčovi */
 let curP=null;const zs=Math.abs(I.P(0,0,1)[1]-I.P(0,0,0)[1])||12;const BV=[],BC=[],BI=[];
 const BA={V:[],C:[],I:[]},BO={V:[],C:[],I:[]},SK={n:0,ground:false};
 function poly(pts,fs,ord){if(typeof fs!=="string")return;const q=parseCol(fs);if(q.a<.04)return;let nx=0,ny=0,nz=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];nx+=(a[1]-b[1])*(a[2]+b[2]);ny+=(a[2]-b[2])*(a[0]+b[0]);nz+=(a[0]-b[0])*(a[1]+b[1])}
  const ln=Math.hypot(nx,ny,nz);if(ln<1e-7)return;const ax=Math.abs(nx),ay=Math.abs(ny),az=Math.abs(nz);
  const c2=pts.map(p=>ax>=ay&&ax>=az?new T.Vector2(p[1],p[2]):ay>=az?new T.Vector2(p[0],p[2]):new T.Vector2(p[0],p[1]));let tri;try{tri=T.ShapeUtils.triangulateShape(c2,[])}catch(e){return}
  let col;try{col=new T.Color(q.c)}catch(e){return}const sg=(nx+ny+nz<0?-1:1)*.004*Math.min(ord||1,30)/ln,ox=nx*sg,oy=ny*sg,oz=nz*sg;
  const B=q.a>=.95?BO:BA,base=B.V.length/3;pts.forEach(p=>{B.V.push(p[0]+ox,p[2]+oz,p[1]+oy);B.C.push(col.r,col.g,col.b,q.a)});tri.forEach(t=>B.I.push(base+t[0],base+t[1],base+t[2]))}
 function push(o){if(!o||typeof o.draw!=="function")return;try{
   const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d");const map=new Map();let np=0,an=null,subs=[],cur=null,ok=true,cplx=0,ord=0,skip=SK.n;SK.n=0;
   curP=(px,py,pz)=>{pz=pz||0;np++;if(!an)an=[px,py,pz];const a=I.P(an[0],an[1],an[2]),q=I.P(px,py,pz);const r=[128+q[0]-a[0],208+q[1]-a[1]];map.set(r[0]+","+r[1],[px,py,pz]);return r};
   const W=(k,fn)=>{const f=x[k];x[k]=function(){fn.apply(this,arguments);return f.apply(this,arguments)}};
   W("beginPath",()=>{subs=[];cur=null;ok=true});W("moveTo",(a,b)=>{const w=map.get(a+","+b);cur=[];subs.push(cur);if(w)cur.push(w);else ok=false});W("lineTo",(a,b)=>{const w=map.get(a+","+b);if(!cur){cur=[];subs.push(cur)}if(w)cur.push(w);else ok=false});
   ["arc","ellipse","quadraticCurveTo","bezierCurveTo","rect","arcTo"].forEach(k=>W(k,()=>{ok=false}));["fillRect","strokeRect","fillText","drawImage"].forEach(k=>W(k,()=>{cplx++}));
   W("fill",function(){if(SK.pier&&an&&an[2]>=.4&&Math.hypot(an[0]-SK.pier[0],an[1]-SK.pier[1])<5.5)return;if(SK.skipAt&&an&&SK.skipAt(an))return;if(skip>0){skip--;return}if(ok&&subs.length){const fs=this.fillStyle;subs.forEach(sp=>{if(sp.length<3)return;if(SK.lmb&&sp.length===4&&fs==="#c9b890"&&sp.some(q=>Math.abs(q[2]-.2)<.02)&&sp.some(q=>!q[2]))return;if(SK.lmb&&sp.length===4&&(fs==="#e3dcc6"||fs==="#cfc6b0")){const l1=Math.hypot(sp[1][0]-sp[0][0],sp[1][1]-sp[0][1]),l2=Math.hypot(sp[2][0]-sp[1][0],sp[2][1]-sp[1][1]);if(Math.abs(Math.max(l1,l2)-16.4)<.3){if(fs==="#e3dcc6")SK.lmb.push(sp.map(q=>[q[0],q[1]]));return}}poly(sp,fs,++ord)})}else cplx++});
   x.save();x.translate(128,208);x.scale(4,4);x.translate(-128,-208);o.draw(x);x.restore();curP=null;
   if(!an||!cplx||np>2)return;if(SK.ground&&!an[2])return;if(SK.pier&&an[2]>=.4&&Math.hypot(an[0]-SK.pier[0],an[1]-SK.pier[1])<5.5)return;if(SK.skipAt&&SK.skipAt(an))return;
   const s=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),transparent:true,alphaTest:.08}));const k=256/(zs*4)*.62;s.scale.set(k,k,1);s.center.set(.5,1-208/256);s.position.set(an[0],an[2],an[1]);s.renderOrder=3;g.add(s)}catch(e){curP=null}}
 function flush(){flushQuads(g);[[BO,0],[BA,1]].forEach(([B,al])=>{if(!B.I.length)return;const geo=new T.BufferGeometry();geo.setAttribute("position",new T.Float32BufferAttribute(B.V,3));geo.setAttribute("color",new T.Float32BufferAttribute(B.C,4));geo.setIndex(B.I);geo.computeVertexNormals();
   const m=new T.Mesh(geo,new T.MeshLambertMaterial(al?{vertexColors:true,transparent:true,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}:{vertexColors:true,side:T.DoubleSide,emissive:"#ffffff",emissiveIntensity:.08}));m.renderOrder=al?2:0;m.receiveShadow=!al;g.add(m);B.V.length=B.C.length=B.I.length=0})}
 /* jednofarebné telesá (zadné steny stavieb kreslených perom) */
 function cbox(x,y,w,d,z0,h,col){if(w<=.1||d<=.1||h<=.05)return;const m=new T.Mesh(new T.BoxGeometry(w,h,d),polyMatSolid(col));m.receiveShadow=true;m.position.set(x+w/2,z0+h/2,y+d/2);m.castShadow=true;g.add(m)}
 function cpyr(x,y,w,d,z,rh,col){const m=new T.Mesh(new T.ConeGeometry(Math.SQRT1_2,rh,4),polyMatSolid(col));m.rotation.y=Math.PI/4;m.scale.set(w,1,d);m.position.set(x+w/2,z+rh/2,y+d/2);m.castShadow=true;g.add(m)}
 function cgable(x,y,w,d,z,rh,col,alongY,wall){const x1=x+w,y1=y+d;const mt=polyMatSolid(col),wm=polyMatSolid(wall||col);
  if(!alongY){const ym=(y+y1)/2;quad3(g,[[x,y1,z],[x1,y1,z],[x1,ym,z+rh],[x,ym,z+rh]],mt);quad3(g,[[x1,y,z],[x,y,z],[x,ym,z+rh],[x1,ym,z+rh]],mt);quad3(g,[[x1,y1,z],[x1,y,z],[x1,ym,z+rh]],wm);quad3(g,[[x,y,z],[x,y1,z],[x,ym,z+rh]],wm)}
  else{const xm=(x+x1)/2;quad3(g,[[x1,y1,z],[x1,y,z],[xm,y,z+rh],[xm,y1,z+rh]],mt);quad3(g,[[x,y,z],[x,y1,z],[xm,y1,z+rh],[xm,y,z+rh]],mt);quad3(g,[[x,y1,z],[x1,y1,z],[xm,y1,z+rh]],wm);quad3(g,[[x1,y,z],[x,y,z],[xm,y,z+rh]],wm)}}
 const P=(a,b,c)=>curP?curP(a,b,c):I.P(a,b,c||0);
 const KI=Object.create(I);KI.P=P;KI.push=push;
 /* hradba medzi dvoma bodmi: múr s cimburím z oboch strán a ochodza */
 function wallSeg(a,b,hgt,th){const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<.05)return;const nx=dy/len*th/2,ny=-dx/len*th/2;const m=faceMat("wallY",len,hgt+.6,WN,{tpu:14,clean:1,slits:len>3?[[len*.5,2,1]]:null},false,true);
  quad3(g,[[a[0]+nx,a[1]+ny,0],[b[0]+nx,b[1]+ny,0],[b[0]+nx,b[1]+ny,hgt+.6],[a[0]+nx,a[1]+ny,hgt+.6]],m);quad3(g,[[b[0]-nx,b[1]-ny,0],[a[0]-nx,a[1]-ny,0],[a[0]-nx,a[1]-ny,hgt+.6],[b[0]-nx,b[1]-ny,hgt+.6]],m);
  quad3(g,[[a[0]+nx,a[1]+ny,hgt],[b[0]+nx,b[1]+ny,hgt],[b[0]-nx,b[1]-ny,hgt],[a[0]-nx,a[1]-ny,hgt]],faceMat("cobble",len,th,[0,0,1],{tpu:12,clean:1},snow),false)}
 /* brána: dva piliere, nadbránie a dve veže; prejazd v smere von z mesta */
 function gate(gx,gy,alongX){const hh=7.5,ph=3.6;const o={tex:"wall",quoin:1,topTex:"cobble",tpu:14};
  if(alongX){box(gx-2.6,gy-2.6,5.2,1.6,hh,o);box(gx-2.6,gy+1,5.2,1.6,hh,o);box(gx-2.6,gy-1,5.2,2,hh-ph,Object.assign({z:ph,slitsX:[[1,1.2,1]]},o));cyl(gx+2.4,gy-2.4,1.1,8.5,{roof:2.8});cyl(gx+2.4,gy+2.4,1.1,8.5,{roof:2.8});cyl(gx-2.4,gy-2.4,1.1,8.5,{roof:2.8});cyl(gx-2.4,gy+2.4,1.1,8.5,{roof:2.8})}
  else{box(gx-2.6,gy-2.6,1.6,5.2,hh,o);box(gx+1,gy-2.6,1.6,5.2,hh,o);box(gx-1,gy-2.6,2,5.2,hh-ph,Object.assign({z:ph,slitsY:[[1,1.2,1]]},o));cyl(gx-2.4,gy+2.4,1.1,8.5,{roof:2.8});cyl(gx+2.4,gy+2.4,1.1,8.5,{roof:2.8});cyl(gx-2.4,gy-2.4,1.1,8.5,{roof:2.8});cyl(gx+2.4,gy-2.4,1.1,8.5,{roof:2.8})}}
 function tri(a,b,c,tex,bl,sl){quad3(g,[a,b,c],faceMat(tex,Math.max(.3,bl),Math.max(.3,sl),[0,0,1],{tpu:12,clean:1},snow))}
 return{I:KI,box,cyl,gable,house,flush,wallSeg,gate,poly,cbox,cpyr,cgable,SK,tri}}
function polyMatSolid(c){if(PC["s"+c])return PC["s"+c];let map=null;try{const I=iso();if(I.TX.plasterW){map=PC._pw||(PC._pw=new T.CanvasTexture(I.TX.plasterW));map.wrapS=map.wrapT=T.RepeatWrapping}}catch(e){}return PC["s"+c]=new T.MeshLambertMaterial({color:c,map,side:T.DoubleSide})}
function look3(){let k="pre",st={};try{k=CKEY();st=CSt()||{}}catch(e){}return{k,roof:st.slateAll?"slate":"tile",thatch:!st.noThatch,tex:k==="lon"?"timber":k==="kra"||k==="gda"?"brick":k==="pre"||k==="par"?"plasterW":k==="ven"?"plasterR":k==="nur"?"plasterB":k==="bud"?"plasterG":"plaster",timber:!!st.tudor,quoin:k==="pre"||k==="vie"||k==="pra"||k==="ven"}}
/* rekvizity pri dielňach ako plné telesá (v89) */
function hash3(n){const x=Math.sin(n*12.9898+4.1)*43758.5453;return x-Math.floor(x)}
function props3(g,t,lv,l,cx,cy,w,dd,h){const x0=cx-w/2,y0=cy-dd/2,rnd=hash3(l.id+1),rnd2=hash3(l.id*3+7),fx=x0+w+.9,sx=x0+w*.3,sy=y0+dd+.9;
 const add=(m,x,y,z)=>{m.position.set(x,y,z);m.castShadow=true;g.add(m);return m};
 const barrel=(x,y,tone)=>{add(new T.Mesh(new T.CylinderGeometry(.3,.3,.74,10),MT("wood",tone||"#8a5a32",2,1)),x,.37,y);[.2,.54].forEach(zz=>add(new T.Mesh(new T.CylinderGeometry(.315,.315,.05,10),M("#3a2410")),x,zz,y));add(new T.Mesh(new T.CylinderGeometry(.27,.27,.02,10),M("#a07040")),x,.75,y)};
 const crate=(x,y,k)=>{add(new T.Mesh(new T.BoxGeometry(.62,.46,.62),MT("wood","#a47c4c",1,1)),x,.23,y);if(k)[[-.14,-.1],[.15,.08],[0,.16],[-.1,.14]].forEach(o=>add(new T.Mesh(new T.SphereGeometry(.12,6,5),M(k)),x+o[0],.5,y+o[1]))};
 const sack=(x,y,tone)=>{const m=add(new T.Mesh(new T.SphereGeometry(.3,8,6),M(tone||"#d8c690")),x,.3,y);m.scale.set(1,1.15,.85);add(new T.Mesh(new T.CylinderGeometry(.05,.1,.14,6),M(tone||"#d8c690")),x,.68,y)};
 const pot=(x,y,tone)=>{const m=add(new T.Mesh(new T.SphereGeometry(.22,8,6),M(tone||"#c9752e")),x,.2,y);m.scale.y=1.1;add(new T.Mesh(new T.CylinderGeometry(.13,.1,.08,8),M(tone||"#c9752e")),x,.44,y)};
 const rack=(x,y,cols,hh)=>{[-.7,.7].forEach(o=>add(new T.Mesh(new T.CylinderGeometry(.04,.04,hh,5),M("#4a2e14")),x,hh/2,y+o));const b=add(new T.Mesh(new T.CylinderGeometry(.035,.035,1.5,5),M("#4a2e14")),x,hh-.05,y);b.rotation.x=Math.PI/2;
  cols.forEach((c,i)=>{const pm=add(new T.Mesh(new T.PlaneGeometry(.3,hh*.6),M(c,{side:T.DoubleSide})),x,hh*.66,y-.5+i*(1/Math.max(1,cols.length-1)));pm.rotation.y=Math.PI/2;pm.castShadow=false})};
 switch(String(t)){
  case"pekar":crate(sx+.4,sy,"#d8a24a");sack(sx+1.4,sy+.2);break;
  case"krcma":barrel(sx,sy);barrel(sx+.9,sy+.2);barrel(fx,y0+dd*.75,"#7a4a2a");break;
  case"vinar":barrel(sx,sy,"#6a3a2a");barrel(sx+.9,sy,"#6a3a2a");barrel(sx+.45,sy+.6,"#6a3a2a");break;
  case"tkac":rack(fx+.6,y0+dd*.7,["#2f5bb0","#b8362c","#e0b04a","#2f7d46"],1.8);break;
  case"kupec":crate(sx,sy,"#c9971a");crate(sx+.9,sy,null);sack(sx+.5,sy+.8);sack(fx,y0+dd*.8,"#c8b880");break;
  case"hrnciar":pot(sx,sy);pot(sx+.8,sy+.1,"#a8512a");pot(sx+.4,sy+.6,"#d08840");break;
  case"tesar":{const lx=fx+.3,ly=y0+dd*.45;for(let r=0;r<3;r++)for(let i=0;i<3-r;i++){const m=add(new T.Mesh(new T.CylinderGeometry(.17,.17,1.6,7),M("#9a6a3a")),lx,.17+r*.3,ly-.34+i*.36+r*.18);m.rotation.z=Math.PI/2}}break;
  case"garbiar":rack(fx+.4,y0+dd*.65,["#8a5a32","#a87444"],1.5);break;
  case"mlyn":{const wm=add(new T.Mesh(new T.CylinderGeometry(1.7,1.7,.5,14,1,true),MT("wood","#6a4422",6,1,{side:T.DoubleSide})),x0+w+.45,1.9,cy);wm.rotation.z=Math.PI/2;for(let k=0;k<4;k++){const sp=add(new T.Mesh(new T.BoxGeometry(.3,3.3,.12),M("#4a2e14")),x0+w+.45,1.9,cy);sp.rotation.x=k*Math.PI/4}sack(sx,sy)}break;
  case"zlatnik":add(new T.Mesh(new T.BoxGeometry(.4,.28,.3),M("#e3be4f")),sx+.3,.14,sy);break;
  case"pisaren":add(new T.Mesh(new T.BoxGeometry(.5,.4,.36),M("#f6efdc")),sx+.3,.2,sy);break;
  case"dom":if(lv>=2&&rnd>.5)barrel(sx,sy,"#8a5a32");if(rnd2>.5)pot(sx+.9,sy,"#c9752e");break;
  case"kovac":case"lekaren":break;
  default:if(rnd>.5)barrel(sx,sy)}}
function KH3(K,t,lv,cx,cy,w,dd,h,env,o){K.SK.ground=true;try{if(window.KHX&&KHX(t,lv,cx,cy,w,dd,h,Object.assign({},K,env),o)){try{if(K.g3)props3(K.g3,t,lv,env.l,cx,cy,w,dd,h)}catch(e){}return}}catch(e){console.warn("3D recept",e)}finally{K.SK.ground=false}K.house(cx-w/2,cy-dd/2,w,dd,h,o)}
/* dielňa presne ako na mape; vracia výšku po hrebeň */
function mapWorkshop(K,l,b,cx,cy){const lv=b.lvl||1,t=b.type,mine=b.owner===0;const w=3.8+lv*.4,dd=3+lv*.2,h=2.4+lv*.5;const look=look3();const dark=t==="brloh"||t==="pasovanie"||t==="bana";
 const craftTex={lekaren:"plasterG",pekar:"plasterR",hrnciar:"plasterR",tkac:"plasterB",pisaren:"plasterW",zlatnik:"plasterW",kupec:"plaster"}[t];
 const tex=dark?"wall":craftTex||(look.timber?"timber":lv>=3?["plaster","plasterB","plasterG"][l.id*3%3]:look.tex);
 const roof=mine||t==="zlatnik"?"gold":dark?"slate":lv>=2?look.roof:look.thatch?"thatch":look.roof;const rh=t==="pisaren"?w*.55:w*.38;
 KH3(K,t,lv,cx,cy,w,dd,h,{mine,look,l,b},{tex,timber:tex==="timber"||look.timber&&!craftTex,quoin:mine||look.quoin||t==="zlatnik"||t==="pisaren",roof,chim:(t==="kovac"||t==="pekar"||t==="hrnciar"||t==="krcma"||t==="lekaren"||t==="sklo")&&(b.w|0)>0?[cx+w*.25]:[],rh});
 try{if(!INDOOR&&K.g3){const g3=K.g3,x=cx-w*.36,yw=cy+dd/2,zt=Math.min(h-.25,2.5),ir=polyMatSolid("#2a2420");quad3(g3,[[x,yw,zt],[x,yw+.98,zt],[x,yw+.98,zt+.06],[x,yw,zt+.06]],ir,false);quad3(g3,[[x,yw,zt-.4],[x,yw+.42,zt],[x,yw+.47,zt],[x,yw,zt-.47]],ir,false);[.3,.84].forEach(o=>quad3(g3,[[x,yw+o,zt-.1],[x,yw+o+.03,zt-.1],[x,yw+o+.03,zt],[x,yw+o,zt]],ir,false));
   let prod=null;try{prod=recipe(b).o}catch(e){}const key="sign|"+(prod||t)+"|"+(mine?1:0);let sm=GFX[key];if(!sm){const c=document.createElement("canvas");c.width=c.height=96;const x2=c.getContext("2d"),bg=()=>{x2.fillStyle=mine?"#f3e2a8":"#efe3c2";x2.fillRect(0,0,96,96);x2.strokeStyle=mine?"#b8860b":"#5a3a20";x2.lineWidth=7;x2.strokeRect(3.5,3.5,89,89)};bg();const tx=new T.CanvasTexture(c);sm=GFX[key]=new T.MeshLambertMaterial({map:tx,side:T.DoubleSide});
     try{if(prod&&typeof gIcon==="function"){let sv=gIcon(prod,72);{const m=sv.match(/<svg[\s\S]*<\/svg>/);if(m)sv=m[0]}if(sv.indexOf("xmlns")<0)sv=sv.replace("<svg","<svg xmlns=\"http://www.w3.org/2000/svg\"");const im=new Image();im.onload=()=>{try{bg();x2.drawImage(im,12,12,72,72);tx.needsUpdate=true}catch(e){}};im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(sv)}}catch(e){}}
   quad3(g3,[[x,yw+.24,zt-.74],[x,yw+.9,zt-.74],[x,yw+.9,zt-.1],[x,yw+.24,zt-.1]],sm,false)}}catch(e){}
 if(t==="krcma"||t==="vinar"){K.box(cx+w/2+.2,cy-.6,.8,.8,1,{tex:"wood",clean:1,tpu:6});K.box(cx+w/2+.2,cy+.5,.8,.8,.9,{tex:"wood",clean:1,tpu:6})}
 return{w,dd,h:(lv>=3?h*1.21:h)+rh}}
/* dom rodu presne ako na mape (úroveň domu hl) */
function mapHome(K,l,d,hl,cx,cy){const mine=d.id===0;const w=4.6+hl*.3,dd=3.6+hl*.2,h=2.8+hl*.5;const look=look3();const vt=["plaster","plasterB","plasterG","plasterR"][l.id*7%4];
 const tex=mine?"plasterW":hl>=4?"wall":hl>=2?vt:look.timber?"timber":look.tex;
 KH3(K,"dom",hl+1,cx,cy,w,dd,h,{mine,look,l,b:null},{tex,timber:look.timber&&hl<2,quoin:mine||hl>=3||look.quoin,roof:mine?"gold":hl>=3?"slate":hl>=1?look.roof:look.thatch?"thatch":look.roof,chim:[cx+w*.2],band:hl>=2?h*.5:0,sqY:hl>=2?[[w*.2,h*.55,.8,1],[w*.5,h*.55,.8,1],[w*.75,h*.55,.8,1]]:void 0});
 if(hl>=3){K.box(cx+w/2-.1,cy-dd/2+.6,1,1.4,1.8,{z:h*.45,tex:tex==="wall"?"wall":vt,sqX:[[.3,.4,.8,.9]],tpu:10});K.cyl(cx+w/2-.6,cy-dd/2+.6,.7,h+2.5,{roof:1.8,finial:false,tex:"cyl"})}
 return{w,dd,h:(hl+1>=3?h*1.21:h)+w*.42}}
/* sídlo rodu podľa úrovne (v86): chalupa až hrad, z tých istých dielov ako mapa */
function mapSeat(K,l,d,hl,cx,cy){
 if(hl<4)return Object.assign(mapHome(K,l,d,hl,cx,cy),{ox:(4.6+hl*.3)/2,back:cy-(3.6+hl*.2)/2,front:cy+(3.6+hl*.2)/2});
 const mine=d.id===0,tex=mine?"plasterW":"wall",roof=mine?"gold":"slate";
 const W=hl>=6?7.4:6.6,D=3.8,H=hl>=6?5.4:4.6,x0=cx-W/2,y0=cy-D/2-.8,rh=2.3,up=H*.5+.6;
 const cols=[.1,.28,.62,.8].map(u=>W*u);
 K.box(x0,y0,W,D,H,{tex,quoin:1,band:H*.5,sqY:cols.map(a=>[a,.9,.8,1]),winY:[.1,.28,.455,.62,.8].map(u=>[W*u,up,.8,1.5,1]),doorY:[W/2-.65,1.3,2,true],sqX:[[D*.25,.9,.8,1],[D*.62,.9,.8,1]],winX:[[D*.25,up,.8,1.5,1],[D*.62,up,.8,1.5,1]],noTop:1,tpu:14});
 K.gable(x0,y0,W,D,H,rh,roof,{chim:[cx-W*.3,cx+W*.22],dormer:1,tpu:12,gableTex:tex==="wall"?"wallX":"plasterX"});
 /* dve krídla dopredu, medzi nimi dvor */
 const ww=1.9,wd=2.3,wh=H*.66,yw=y0+D;
 [x0,x0+W-ww].forEach(wx0=>{K.box(wx0,yw,ww,wd,wh,{tex,quoin:1,sqY:[[ww/2-.4,wh*.45,.8,1]],sqX:[[wd*.35,wh*.45,.8,1]],noTop:1,tpu:14});K.gable(wx0,yw,ww,wd,wh,1.1,roof,{alongY:1,tpu:12,gableTex:tex==="wall"?"wallY":"plaster"})});
 K.cyl(x0+W+.25,y0+.3,.85,H+1.8,{roof:2.4,tex:"cyl"});
 let top=H+rh,front=yw+wd;
 if(hl>=5){/* hradba s bránou a nárožnými vežami */
  const yf=yw+wd+2.2,xa=x0-.9,xb=x0+W+.9,th=.55,hh=2.3,gw=1.9;
  K.box(xa,yf,(xb-xa-gw)/2,th,hh,{tex:"wall",tpu:14});K.box(cx+gw/2,yf,(xb-xa-gw)/2,th,hh,{tex:"wall",tpu:14});
  K.box(cx-gw/2-.35,yf-.25,gw+.7,th+.5,1.3,{z:hh-.3,tex:"wall",quoin:1,tpu:14,slitsY:[[.6,.35,.6],[gw+.1,.35,.6]]});K.gable(cx-gw/2-.35,yf-.25,gw+.7,th+.5,hh+1,.8,"slate",{tpu:12,gableTex:"wallX"});
  K.box(xa,yw,th,yf-yw,hh,{tex:"wall",tpu:14});K.box(xb-th,yw,th,yf-yw,hh,{tex:"wall",tpu:14});
  [xa+.2,xb-.2].forEach(tx2=>K.cyl(tx2,yf+.3,.9,3.7,{roof:1.8,tex:"cyl"}));front=yf+1}
 if(hl>=6){/* hlavná veža s cimburím a zadné veže */
  const kx=x0-1.3,ky=y0-1.5,ks=2.8,kh=8.6;K.box(kx,ky,ks,ks,kh,{tex:"wall",quoin:1,tpu:14,slitsY:[[ks/2,3,1],[ks/2,6,1]],slitsX:[[ks/2,4.5,1]]});
  for(let i=0;i<3;i++)for(const s of[[kx+i*1.05,ky],[kx+i*1.05,ky+ks-.5]]){K.box(s[0],s[1],.7,.5,.6,{z:kh,tex:"wall",tpu:14})}
  K.cyl(x0+W+.9,y0-1,.95,6.6,{roof:2.4,tex:"cyl"});top=kh+1}
 return{w:W,dd:D,h:top,ox:W/2+(hl>=5?.9:0),back:y0-(hl>=6?1.5:0),front,flag:hl>=6?[x0+.1,kh0(hl),y0-.1]:null}}
function kh0(){return 9.2}
/* vylepšenia sídla pri dome */
function seatExtras(K,g,hu,m,cx,cy){const lk=look3(),snow=S.season===3,out=[];
 if(hu.includes("stajne")){const sx=cx+m.ox+.7,sy=cy+.2;K.box(sx,sy,3,2.2,1.7,{tex:"wood",doorY:[.4,1.3,1.4,false],sqY:[[2,.8,.6,.6]],noTop:1,tpu:8});K.gable(sx,sy,3,2.2,1.7,1,lk.thatch?"thatch":"tile",{tpu:12,gableTex:"wood"});K.box(sx+.3,sy+2.5,2.2,.12,.7,{tex:"wood",tpu:8,noTop:0});out.push([sx+1.5,sy+1.1,1.6])}
 if(hu.includes("kaplnka")){const kx=cx-m.ox-2.6,ky=m.back-.4;K.box(kx,ky,1.9,2.8,2.3,{tex:"plasterW",quoin:1,winX:[[.5,.6,.6,1.3,1],[1.6,.6,.6,1.3,1]],doorY:[.55,.8,1.4,true],noTop:1,tpu:14});K.gable(kx,ky,1.9,2.8,2.3,1.5,"slate",{alongY:1,tpu:12,gableTex:"plasterW"});
  K.cyl(kx+.95,ky+.5,.32,1.1,{z:3.4,roof:1,tex:"plasterW",finial:false});box(g,kx+.95,5.5,ky+.5,.07,.75,.07,"#e3be4f");box(g,kx+.95,5.95,ky+.5,.42,.07,.07,"#e3be4f");out.push([kx+.95,ky+1.4,1.5])}
 if(hu.includes("veza")&&!m.flag){const vx=cx+m.ox+1.3,vy=m.back-.2;K.cyl(vx,vy,.95,7,{roof:2.3,tex:"cyl"});[2.5,4.6].forEach((zz,i)=>{const b=box(g,vx+(i?.0:0),zz,vy+.96,.16,.7,.05,"#15151f");b.castShadow=false});out.push([vx,vy,1.1])}
 if(hu.includes("zahrada")){const zx=cx-m.ox-2.3,zy=cy+2.4;const gp=new T.Mesh(new T.CircleGeometry(2.3,18),snow?M("#eef2f6"):MT("grass","#5f9a4a",3,3));gp.rotation.x=-Math.PI/2;gp.position.set(zx,.09,zy);g.add(gp);
  K.cyl(zx,zy,.6,.4,{tex:"cyl",finial:false});const wt=new T.Mesh(new T.CircleGeometry(.5,12),M("#4f8fb6"));wt.rotation.x=-Math.PI/2;wt.position.set(zx,.42,zy);g.add(wt);K.cyl(zx,zy,.1,1,{tex:"cyl"});
  for(let i=0;i<10;i++){const a=i/10*6.283;if(Math.abs(a-1.57)<.4)continue;const hb=new T.Mesh(new T.SphereGeometry(.42,7,5),M(snow?"#dfe8ee":"#3f7a34"));hb.scale.y=.8;hb.position.set(zx+Math.cos(a)*2.1,.32,zy+Math.sin(a)*2.1);hb.castShadow=true;g.add(hb)}
  [[-1,.9,"#d8453a"],[1.1,-.7,"#f0d050"],[.9,1.1,"#e86a9a"]].forEach(q=>{const f=new T.Mesh(new T.SphereGeometry(.28,6,5),M(snow?"#e8eef2":q[2]));f.position.set(zx+q[0],.25,zy+q[1]);g.add(f)})}
 if(hu.includes("sien")&&m.ox<3.2){const hx=cx-m.ox+.3,hy=m.back-1.7;K.box(hx,hy,m.ox*2-.6,1.9,2.1,{tex:lk.tex,winY:[],sqX:[[.5,.8,.8,.9]],noTop:1,tpu:14});K.gable(hx,hy,m.ox*2-.6,1.9,2.1,.9,lk.roof,{tpu:12,chim:[hx+.5]})}
 return out}
/* námestie, predmestie, dominanty podľa veľkosti mesta a stavby rodu: tie isté recepty ako mapa */
function stallWares(g,i,sx,sy,cx,cy){const mk=(geo,c,x,y,z,rx,rz)=>{const m=new T.Mesh(geo,M(c));m.position.set(sx+x,1+y,sy+z);if(rx)m.rotation.x=rx;if(rz)m.rotation.z=rz;m.castShadow=true;g.add(m);return m},B=(w,h,d)=>new T.BoxGeometry(w,h,d),Cy=(r,h,r2)=>new T.CylinderGeometry(r2==null?r:r2,r,h,10),Sp=r=>new T.SphereGeometry(r,8,6);
 const W=[()=>{[-.4,-.15,.1].forEach((x,k)=>mk(Cy(.09,.9),"#8a5a30",x,.1,-.25+k*.02,1.57));mk(Cy(.09,.9),"#9a6a3a",-.27,.27,-.25,1.57);mk(B(.3,.04,.3),"#b98a55",.38,.3,.2);[[-.12,-.12],[.12,-.12],[.12,.12],[-.12,.12]].forEach(o=>mk(B(.04,.3,.04),"#8a5a30",.38+o[0],.15,.2+o[1]))},
  ()=>{[-.45,-.2].forEach((x,k)=>mk(B(.2,.1,.5),"#6a6f78",x,.05+k*.02,-.1));mk(B(.05,.02,.8),"#c8ccd2",.15,.03,0);mk(B(.22,.03,.05),"#8a6a2a",.15,.04,-.3);mk(Sp(.14),"#9aa0a8",.45,.14,.2);mk(B(.3,.3,.06),"#7a808a",.42,.16,-.3)},
  ()=>{[[-.4,-.2],[-.15,-.25],[-.3,.1],[.0,.05]].forEach((o,k)=>{const m=mk(Sp(.13),k%2?"#c89a50":"#b8823a",o[0],.08,o[1]);m.scale.set(1.3,.6,1)});mk(Cy(.18,.4,.14),"#cfc0a0",.4,.2,-.15);mk(Cy(.1,.16),"#e0b040",.38,.08,.3)},
  ()=>{[-.35,.05].forEach(x=>{mk(Cy(.17,.36,.17),"#7a4f28",x,.18,-.15);mk(Cy(.175,.03),"#3a3a3a",x,.08,-.15);mk(Cy(.175,.03),"#3a3a3a",x,.28,-.15)});[.38,.5].forEach((x,k)=>{mk(Cy(.07,.2,.04),k?"#2f5a3a":"#5a2030",x,.1,.2-k*.25)});mk(Cy(.06,.14),"#b8562c",-.2,.07,.32)},
  ()=>{["#b8362c","#2f5bb0","#2f7d46","#c9971a"].forEach((c,k)=>mk(Cy(.09,.7),c,-.42+k*.24,.09,-.1,1.57));mk(Cy(.09,.7),"#6d3f92",-.3,.26,-.1,1.57);mk(Cy(.09,.7),"#e8dcc0",-.06,.26,-.1,1.57);mk(B(.35,.05,.3),"#a03040",.42,.03,.3)},
  ()=>{[[-.4,-.2],[-.2,.1],[.0,-.2]].forEach(o=>{const m=mk(Sp(.13),"#4f8a3a",o[0],.1,o[1]);m.scale.set(1.2,.7,1)});[.3,.42,.54].forEach((x,k)=>{mk(Cy(.045,.16),["#3a6a8a","#8a3a3a","#c9a24a"][k],x,.08,-.2);mk(Cy(.02,.05),"#8a6a3a",x,.18,-.2)});mk(B(.3,.12,.22),"#8a6a3a",.4,.06,.25)},
  ()=>{[[-.42,-.2,.13],[-.15,-.22,.16],[.15,-.2,.12],[-.3,.2,.1],[.0,.22,.14]].forEach(o=>{mk(Cy(o[2]*.7,o[2]*1.5,o[2]),"#b8562c",o[0],o[2]*.75,o[1]);mk(Cy(o[2]*.8,.03),"#8a3a1c",o[0],o[2]*1.5,o[1])});mk(B(.3,.4,.25),"#3f6a4a",.45,.2,.15)},
  ()=>{[0,1,2].forEach(k=>mk(B(.5,.035,.4),["#7a5030","#8a5a34","#6a4426"][k],-.3,.02+k*.04,-.1));[.2,.36].forEach(x=>{mk(Cy(.06,.26),"#3a2a1e",x,.13,.2);mk(B(.1,.08,.2),"#3a2a1e",x,.04,.27)});mk(B(.3,.16,.4),"#8a5a30",.42,.2,-.25);mk(B(.3,.2,.1),"#8a5a30",.42,.12,-.25)},
  ()=>{mk(B(1.1,.02,.8),"#3a1f4a",0,.01,0);[[-.4,-.2],[-.2,-.25],[.0,-.2],[.2,-.22]].forEach((o,k)=>{const m=mk(new T.TorusGeometry(.045,.015,5,10),"#e3be4f",o[0],.04,o[1]);m.rotation.x=1.57});[[-.3,.15],[.1,.15]].forEach(o=>{mk(Cy(.04,.08),"#d8dce2",o[0],.05,o[1]);mk(Cy(.03,.1,.07),"#d8dce2",o[0],.15,o[1])});mk(B(.2,.16,.14),"#e3be4f",.42,.09,.1);[["#c03a3a",.3],["#3a7ac0",.42],["#3aa05a",.36]].forEach((c,k)=>mk(Sp(.03),c[0],c[1],.04,-.28+k*.03))},
  ()=>{[0,1,2].forEach(k=>mk(B(.3,.07,.22),["#7a2a2a","#2a4a7a","#3a5a2a"][k],-.38,.035+k*.07,-.15));mk(B(.3,.07,.22),"#8a6a2a",-.05,.035,-.2);mk(Cy(.18,.36,.13),"#eee8dc",.4,.18,-.15);[["#c9571a",-.3],["#a8321c",-.12],["#d8a020",.06]].forEach(c=>{mk(Cy(.09,.08),"#8a6a3a",c[1],.04,.25);mk(Cy(.08,.02),c[0],c[1],.085,.25)})}];
 (W[i]||W[0])();const st=STALLS[i];if(st){const s=label(st.n,st.c,.45,{k:"stall"});s.position.set(sx,3.4,sy);g.add(s)}}
function mapTown(K,g,C,L,solids,snow){const wc=p=>[(p[0]-L.cx)/U,(p[1]-L.cy)/U],pl=wc(L.pl),tier=(C&&C.tier)||1,out={log:[],env:null};let key="pre";try{key=CKEY()}catch(e){}
 /* stánky trhu a studňa */
 const cols=["#b8362c","#2f5bb0","#c9971a","#2f7d46","#6d3f92","#a8583a"];
 for(let i=0;i<10;i++){const a=i/10*6.283+.3,sx=pl[0]+Math.cos(a)*9,sy=pl[1]+Math.sin(a)*6.5,c=STALLS[i]?STALLS[i].c:cols[i%6];if(!NIGHT3)try{stallWares(g,i,sx,sy,pl[0],pl[1])}catch(e){console.warn("3D stánok",e)}K.box(sx-.7,sy-.6,1.4,1.2,1,{tex:"wood",clean:1,tpu:6,topTex:"wood"});
  [[-.9,-.8],[.9,-.8],[.9,.8],[-.9,.8]].forEach(o=>cyl(g,sx+o[0],0,sy+o[1],.05,2,"#5a3a20",5));
  if(NIGHT3){const tp=new T.Mesh(new T.BoxGeometry(1.75,.4,1.55),M("#857c68"));tp.position.set(sx,1.2,sy);tp.rotation.y=(i%3-1)*.12;tp.castShadow=true;g.add(tp);const tp2=new T.Mesh(new T.BoxGeometry(1.5,.22,1.2),M("#7a725f"));tp2.position.set(sx+.05,1.5,sy);tp2.rotation.y=(i%2)*.3;g.add(tp2)}const q=[[sx-1.1,sy-1,2],[sx+1.1,sy-1,2],[sx+1.1,sy+1,2],[sx-1.1,sy+1,2]],t=[sx,sy,2.9];for(let k=0;k<4;k++)K.poly([q[k],q[(k+1)%4],t],c,1);solids.push([sx,sy,.9])}
 K.cyl(pl[0],pl[1],1.6,.7,{tex:"cyl",finial:false});{const wt=new T.Mesh(new T.CircleGeometry(1.35,16),waterMat(1.2,snow));wt.rotation.x=-Math.PI/2;wt.position.set(pl[0],.72,pl[1]);g.add(wt)}K.cyl(pl[0],pl[1],.35,2.4,{tex:"cyl"});solids.push([pl[0],pl[1],1.8]);
 const tree=(x,y,r,h)=>{cyl(g,x,0,y,.14,h||2,"#5a3a20",6);const c=new T.Mesh(new T.SphereGeometry(r||1,8,6),M(snow?"#dfe8ea":S.season===2?"#c8782a":"#4f7a34"));c.position.set(x,(h||2)+(r||1)*.5,y);c.castShadow=true;g.add(c)};
 const Z=window.ZNK,pr=Z&&Z.Ctx&&Z.Ctx.prototype,sv={};
 /* stavby kreslené perom dostanú textúry mapy podľa farby (v107) */
 const lumOf=c=>{const q=rgb(c);return[q[0],q[1],q[2],(q[0]*.3+q[1]*.59+q[2]*.11)]},isHex=c=>typeof c==="string"&&/^#[0-9a-f]{6}$/i.test(c);
 const wallTex=(c,o)=>{if(o&&o.stone)return"wall";if(!isHex(c))return"plaster";const[r,g2,b,l]=lumOf(c);const sp=Math.max(r,g2,b)-Math.min(r,g2,b);if(sp<30)return l>185?"plasterW":"wall";if(r>g2*1.3&&r>b*1.4)return l<150?"brick":"plasterR";if(l>205)return"plasterW";if(l>165)return"plaster";if(r>=g2&&g2>=b)return l<135?"wood":"plasterB";return"wall"};
 const roofTex=c=>{if(snow)return"slate";if(!isHex(c))return"tile";const[r,g2,b,l]=lumOf(c);if(b>=r-6)return"slate";if(r>190&&g2>150&&b<110)return"gold";if(r>b*1.35)return l<70?"slate":"tile";return"slate"};
 if(pr){["box","pyr","gable","shadow"].forEach(k=>sv[k]=pr[k]);pr.shadow=function(){};
  pr.box=function(x,y,w,d,z0,h,col,o){if(K.SK.nopier&&((col==="#8a6a44"&&w===6&&d===1.6&&h===.5)||(col==="#6a4a2a"&&w===.5&&d===.5&&h===5))){if(w===6)K.SK.pier=[x+3,y+.8];return}let okb=0;try{if(typeof col==="string"&&w>.1&&d>.1&&h>.05){o=o||{};
     if(h>=1.2&&w>=1&&d>=1&&isHex(col)){const tex=wallTex(col,o),got=tex==="wall",op={z:z0,tex,quoin:got?1:0,tpu:14,topTex:"top"};
      if(o.win){const n=o.win[0],rows=o.win[1],wy=[],wxs=[],ww=Math.min(1.1,Math.max(.5,.28/n*1.6*w)),wh=Math.min(2.6,Math.max(.7,h/(rows+.3)*.5)),nx=Math.max(1,Math.round(n*d/w));for(let r=0;r<rows;r++){const b=h*((r+.5)/(rows+.3));for(let i=0;i<n;i++)wy.push(got||wh>1.3?[w*(i+.5)/n-ww/2,b,ww,wh,1]:[w*(i+.5)/n-ww/2,b,ww,wh]);for(let i=0;i<nx;i++)wxs.push(got||wh>1.3?[d*(i+.5)/nx-ww/2,b,ww,wh,1]:[d*(i+.5)/nx-ww/2,b,ww,wh])}
       if(got||wh>1.3){op.winY=wy;op.winX=wxs}else{op.sqY=wy;op.sqX=wxs}}
      else if(got&&h>3){op.slitsY=[[w/2,h*.55,Math.min(1.2,h*.2)]];op.slitsX=[[d/2,h*.55,Math.min(1.2,h*.2)]]}
      K.box(x,y,w,d,h,op);okb=99}
     else{K.cbox(x,y,w,d,z0,h,col);okb=3}
     if(o&&typeof o.top==="string")K.poly([[x,y,z0+h],[x+w,y,z0+h],[x+w,y+d,z0+h],[x,y+d,z0+h]],o.top,2)}}catch(e){console.warn("3D stavba",e)}K.SK.n=okb;try{return sv.box.apply(this,arguments)}finally{K.SK.n=0}};
  pr.pyr=function(x,y,w,d,z,rh,col){let okb=false;try{if(typeof col==="string"){const tx2=roofTex(col),ap=[x+w/2,y+d/2,z+rh],c4=[[x,y+d,z],[x+w,y+d,z],[x+w,y,z],[x,y,z]];for(let k=0;k<4;k++){const a=c4[k],b=c4[(k+1)%4],bl=Math.hypot(b[0]-a[0],b[1]-a[1]),sl=Math.hypot(rh,(k%2?w:d)/2);K.tri(a,b,ap,tx2,bl,sl)}okb=true}}catch(e){}K.SK.n=okb?9:0;try{return sv.pyr.apply(this,arguments)}finally{K.SK.n=0}};
  pr.gable=function(x,y,w,d,z,rh,col,wall,axis){let okb=false;try{if(typeof col==="string"){const wt=wallTex(typeof wall==="string"?wall:col,null);K.gable(x,y,w,d,z,rh,roofTex(col),{alongY:axis==="y",tpu:12,gableTex:wt==="wall"?(axis==="y"?"wallY":"wallX"):wt});okb=true}}catch(e){}K.SK.n=okb?9:0;try{return sv.gable.apply(this,arguments)}finally{K.SK.n=0}}}
 const sp0=Z&&Z.Env&&Z.Env.prototype.spot;if(sp0)Z.Env.prototype.spot=function(tx,ty){const r=sp0.apply(this,arguments);out.log.push([tx,ty,r]);return r};
 try{
  if(NIGHT3)K.SK.skipAt=an=>{const d=Math.hypot(an[0]-pl[0],an[1]-pl[1]);if(d<4.75)return Math.hypot(an[0]-(pl[0]-3.6),an[1]-(pl[1]+3.2))>1&&Math.hypot(an[0]-(pl[0]+3.8),an[1]-(pl[1]-3.3))>1.3;for(let i=0;i<10;i++){const a=i/10*6.283+.3,sx=pl[0]+Math.cos(a)*9,sy=pl[1]+Math.sin(a)*6.5;if(Math.hypot(an[0]-sx,an[1]-(sy+1.3))<.6||Math.hypot(an[0]-(sx-1.8),an[1]-(sy+1.4))<.6)return true}return false};
  try{window.KSQ&&KSQ({I:K.I,box:K.box,cyl:K.cyl,P2:K.I.P,pl,wc,L,U,tree,tier})}catch(e){console.warn("3D KSQ",e)}finally{K.SK.skipAt=null}
  try{window.KSUB&&KSUB({L,wc,house:K.subHouse||K.house,grow:tier-((CITY_DEF[C.def]&&CITY_DEF[C.def].tier)||1)})}catch(e){console.warn("3D KSUB",e)}
  const L2=Object.assign({},L);
  try{window.KPUB&&KPUB({L:L2,wc,house:K.house,I:K.I,P2:K.I.P,key,tier,roads:L.streets.map(r=>r.map(wc)),lots:S.lots})}catch(e){console.warn("3D KPUB",e)}
  if(window.__zE&&window.__zE.L===L2){out.env=window.__zE;(window.__zE.taken||[]).forEach(t=>{if(t&&t.length>2)solids.push([t[0],t[1],Math.max(1,t[2]*.7)])});window.__zE=null;window.__zC=null}
 }finally{if(pr)for(const k in sv)pr[k]=sv[k];if(sp0)Z.Env.prototype.spot=sp0}
 return out}
function mapFill(K,f,fx,fy){const lk=look3();K.house(fx-1.6,fy-1.2,3.2,2.4,2,{tex:f.k%2&&lk.timber?"timber":f.k%3?lk.tex:["plaster","plasterB","plasterG","plasterR"][f.k%4],timber:f.k%2===1&&lk.timber,roof:lk.thatch&&f.k%4===0?"thatch":lk.roof,rh:1.3,sqY:[[1,.9,.6,.7]],sqX:[[.8,.9,.6,.7]],door:[1.3,.9,1.2,false]})}
function tower(g,x,z,r,h,c,roof){cyl(g,x,0,z,r,h,c||"#b9b0a0",10);const m=new T.Mesh(new T.ConeGeometry(r*1.25,h*.45,10),M(roof||"#5a6070"));m.position.set(x,h+h*.225,z);m.castShadow=true;g.add(m)}
const WS={kovac:"#5a5a62",tkac:"#7a4a8a",pekar:"#c9882a",krcma:"#8a3a22",lekaren:"#3f7a5a",brloh:"#2a2a2a",hrnciar:"#b8683a",tesar:"#8a6a3a",garbiar:"#6a4a2a",zlatnik:"#c9a03a",vinar:"#7a1f3a",pisaren:"#3a4a7a",kupec:"#2f5bb0",pasovanie:"#3a3a3a",pivovar:"#b8862b",mlyn:"#cfc4aa",sklaren:"#5a9aa0",tlaciaren:"#4a4a5a",bana:"#6a6a6a"};
/* verejné budovy podľa mapy: najprv dominanta mesta (LMX), inak základný tvar z mapy */
function mapPub(K,k,l,cx,cy,C,L){const {box,cyl,gable,house}=K;let key="pre";try{key=CKEY()}catch(e){}
 if(k==="hrad"||k==="kostol"||k==="radnica"){try{const I=iso();if(window.LMX&&LMX(k,cx,cy,l,{I:K.I,box,cyl,gable,house,P2:K.I.P,key,C,L,T:I.T,SNOW:I.SNOW,lights:[],flags:[],SOLIDS:[],norm:I.norm,bright:I.bright,col:I.col,pat:I.pat,face:()=>{},shadowPoly:()=>{},sp2:I.sp,inkFolk:()=>{}}))return{r:k==="hrad"?5.2:k==="kostol"?4.4:4,lm:1}}catch(e){console.warn("3D dominanta",e)}}
 if(k==="hrad"){box(cx-4,cy-3,8,6,5,{tex:"wall",quoin:1,slitsY:[[2,2.2,1.2],[5.5,2.2,1.2]],topTex:"cobble"});cyl(cx-3.5,cy-2.5,1.6,8,{roof:3});cyl(cx+3.5,cy-2.5,1.6,8,{roof:3});cyl(cx+3.5,cy+2.5,1.6,7,{roof:3});cyl(cx-3.5,cy+2.5,1.6,7,{roof:3});cyl(cx,cy,2.4,11,{roof:4});return{r:5.2}}
 if(k==="kostol"){box(cx-2,cy-3.5,4,7,5,{tex:"wall",quoin:1,winX:[[1.2,1.4,1.2,2.6,true],[4.4,1.4,1.2,2.6,true]],winY:[[1.4,1.4,1.2,2.6,true]],noTop:1,band:3.2});gable(cx-2,cy-3.5,4,7,5,2.4,"slate",{alongY:1,gableTex:"wallY"});cyl(cx,cy+3.8,1.4,9,{roof:5,tex:"cyl"});return{r:4.4}}
 if(k==="radnica"){box(cx-3,cy-2.5,6,5,5.5,{tex:"plaster",quoin:1,winY:[[.8,3.2,1,1.8],[2.5,3.2,1,1.8],[4.2,3.2,1,1.8],[.8,.9,1,1.6],[4.2,.9,1,1.6]],winX:[[1,3.2,1,1.8],[3,3.2,1,1.8]],doorY:[2.4,1,1.3,true],noTop:1,band:2.8});gable(cx-3,cy-2.5,6,5,5.5,2.6,"tile",{chim:[cx+1.5]});cyl(cx+2,cy+1.5,.9,9,{roof:3.5,finial:true,tex:"cyl"});return{r:4}}
 if(k==="uzernik"){house(cx-2,cy-1.5,4,3,3.2,{tex:"wall",quoin:1,roof:"slate"});return{r:3}}
 if(k==="trh"&&window.ZNK)return{r:8,solid:.1};
 return null}
function pub(g,k,x,z){
 if(k==="hrad"){box(g,x,0,z,9,4.2,6,"#b9b0a0",0,"stone");gable(g,x,4.2,z,9,2.2,6,"#8a4a32");[[-5,-3.4],[5,-3.4],[-5,3.4],[5,3.4]].forEach(o=>tower(g,x+o[0],z+o[1],1.1,6.4,"#aaa294","#6f4a3a"));return 7}
 if(k==="kostol"){box(g,x,0,z,8,4.4,3.6,"#d6ccb4",0,"stone");gable(g,x,4.4,z,8,2.6,3.6,"#5a6070");box(g,x-4.8,0,z,2.4,9,2.4,"#cfc4aa",0,"stone");pyr(g,x-4.8,9,z,2.8,6,2.8,"#4f8a6a");return 6}
 if(k==="radnica"){box(g,x,0,z,7,4,4.4,"#e9dcc0",0,"plaster");gable(g,x,4,z,7,2.2,4.4,"#8a3a28");box(g,x+2.2,0,z-1,1.8,7.4,1.8,"#e2d4b6");pyr(g,x+2.2,7.4,z-1,2.2,2.6,2.2,"#8a3a28");const c=cyl(g,x+2.2,5.6,z-.06,.55,.1,"#f4ead0",16);c.rotation.x=Math.PI/2;return 5.5}
 if(k==="trh"){const cols=["#c0262a","#2f5bb0","#2f7d46","#d6a03a","#7a4a8a"];for(let i=0;i<6;i++){const a=i/6*6.283,sx=x+Math.cos(a)*3.2,sz=z+Math.sin(a)*3.2;box(g,sx,0,sz,1.5,.8,1,"#8a6a44");[[-.7,-.45],[.7,-.45],[-.7,.45],[.7,.45]].forEach(o=>cyl(g,sx+o[0],0,sz+o[1],.05,1.9,"#5a3a20",5));const t=box(g,sx,1.9,sz,1.8,.12,1.3,cols[i%5]);t.rotation.z=.12}cyl(g,x,0,z,.9,.5,"#b9b0a0",12);cyl(g,x,.5,z,.15,1.4,"#b9b0a0",8);return 5}
 if(k==="uzernik"){house(g,x,z,{w:3.6,d:3,h:2.8,wall:"#8f8778",roof:"#3a3a46"});return 3.2}
 house(g,x,z,{});return 3}
function workShape(g,id,x,z,col){
 const ST="#cfc4aa";
 switch(id){
  case"fontana":cyl(g,x,0,z,1.5,.5,ST,14);cyl(g,x,.5,z,1.25,.06,"#6fa6cf",14);cyl(g,x,.5,z,.18,1.6,ST,8);cyl(g,x,2.1,z,.5,.1,ST,10);break;
  case"veza":box(g,x,0,z,2.2,11,2.2,ST);pyr(g,x,11,z,2.8,5,2.8,"#4f6a8a");{const c=cyl(g,x,8.6,z+1.12,.7,.08,"#f4ead0",16);c.rotation.x=Math.PI/2}break;
  case"trznica":box(g,x,0,z,9,2.6,3.6,"#e6d2a6");gable(g,x,2.6,z,9,1.8,3.6,"#8a4a32");for(let i=-3;i<=3;i++)box(g,x+i*1.25,0,z+1.82,.7,1.5,.06,"#2a2018");break;
  case"spital":box(g,x,0,z,7,2.8,3.6,"#f2ece0");gable(g,x,2.8,z,7,2,3.6,"#a5312a");box(g,x,1,z+1.82,.3,1.2,.06,"#a5312a");box(g,x,1.45,z+1.83,.9,.3,.06,"#a5312a");break;
  case"kolegium":box(g,x,0,z,8,3.6,4.2,"#b4573b");gable(g,x,3.6,z,8,2,4.2,"#5a5f6a");box(g,x+4.6,0,z,1.6,6.4,1.6,"#b4573b");pyr(g,x+4.6,6.4,z,2,2.4,2,"#5a5f6a");break;
  case"katedrala":box(g,x,0,z,5,3,2.8,ST);gable(g,x,3,z,5,2,2.8,"#5a6070");box(g,x-3.2,0,z,1.4,6,1.4,ST);pyr(g,x-3.2,6,z,1.8,3.4,1.8,"#5a6070");break;
  case"pozicka":box(g,x,0,z,2,.8,2,ST);flag(g,x-.5,.8,z,"#e3be4f");flag(g,x+.5,.8,z,col);break;
  case"univerzita":box(g,x,0,z,13,4.2,4.6,"#e8dcc0");gable(g,x,4.2,z,13,2.4,4.6,"#5a6070");[-7.4,7.4].forEach(o=>{box(g,x+o,0,z,2,7.6,2,"#e8dcc0");pyr(g,x+o,7.6,z,2.4,3.2,2.4,"#5a6070")});break;
  case"hrad":cyl(g,x,-.2,z,11,1.6,"#7a9a58",20);box(g,x,1.4,z,11,4.6,6,"#d8cdb4");gable(g,x,6,z,11,2.4,6,"#8a4a32");[[-6.4,-3.6],[6.4,-3.6],[-6.4,3.6],[6.4,3.6]].forEach(o=>tower(g,x+o[0],z+o[1],1.2,8.4,"#cfc4aa","#6f4a3a"));break;
  default:box(g,x,0,z,3,2,3,ST)}
 flag(g,x+.2,id==="veza"?16:id==="univerzita"?6.6:id==="hrad"?8.4:4.8,z,col)}

/* ---------- postava a odev ---------- */
/* ---------- postavy (v100): zaoblené telo, ruky a nohy s krokom, tvár, vlasy ---------- */
let FG=null;const FMC={};const fmc=c=>FMC[c]||(FMC[c]=new T.MeshLambertMaterial({color:c}));
function figGeo(){if(FG)return FG;const Lt=(pts,seg)=>new T.LatheGeometry(pts.map(q=>new T.Vector2(q[0],q[1])),seg||12);
 /* záhyby látky (v267): polomer sa smerom k lemu vlní, svetlo potom kreslí záhyby samo */
 const fold=(geo,n,amp,y0,y1)=>{const pa=geo.attributes.position,ao=new Float32Array(pa.count).fill(1);for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i);if(Math.hypot(x,z)<1e-4)continue;const a=Math.atan2(z,x),k=Math.max(0,Math.min(1,(y1-y)/(y1-y0))),w=Math.sin(a*n)+.45*Math.sin(a*(2*n+1)+1.3),f=1+amp*k*w;pa.setX(i,x*f);pa.setZ(i,z*f);ao[i]=Math.max(.72,Math.min(1.08,1+.17*k*w))}geo.setAttribute("color",new T.Float32BufferAttribute(ao,1));geo.computeVertexNormals();return geo};
 FG={torso:Lt([[0,0],[.27,0],[.29,.08],[.27,.24],[.29,.38],[.31,.5],[.31,.58],[.27,.66],[.18,.74],[.09,.79],[0,.8]],18),skirt:fold(Lt([[0,0],[.46,0],[.43,.2],[.36,.5],[.29,.78],[.26,.92],[0,.92]],22),9,.045,0,.92),tunic:fold(Lt([[0,0],[.37,0],[.35,.1],[.31,.28],[.29,.45],[0,.45]],18),7,.05,0,.45),
  leg:new T.CylinderGeometry(.1,.08,.86,8),arm:new T.CylinderGeometry(.085,.07,.62,7),head:new T.SphereGeometry(.2,20,16),hand:new T.SphereGeometry(.075,8,6),shoe:new T.BoxGeometry(.15,.1,.3),eye:new T.SphereGeometry(.022,5,4),nose:new T.SphereGeometry(.03,5,4),
  hair:new T.SphereGeometry(.215,12,8,0,6.3,0,1.45),hairL:new T.CylinderGeometry(.2,.17,.46,10,1,true,Math.PI*.5,Math.PI),bowl:new T.CylinderGeometry(.213,.209,.2,14,1,true,.95,6.2832-1.9),beard:new T.SphereGeometry(.125,8,6),neck:new T.CylinderGeometry(.075,.085,.12,8)};
 FG.leg.translate(0,-.43,0);FG.arm.translate(0,-.31,0);FG.armU=new T.CylinderGeometry(.085,.079,.33,7);FG.armU.translate(0,-.155,0);FG.armL=new T.CylinderGeometry(.079,.07,.33,7);FG.armL.translate(0,-.155,0);FG.elb=new T.SphereGeometry(.08,7,6);FG.legU=new T.CylinderGeometry(.1,.091,.46,8);FG.legU.translate(0,-.215,0);FG.legL=new T.CylinderGeometry(.091,.08,.46,8);FG.legL.translate(0,-.215,0);FG.knee=new T.SphereGeometry(.092,7,6);FG.shoulder=new T.SphereGeometry(.088,10,8);FG.hcape=fold(Lt([[.54,0],[.52,.14],[.49,.26],[.44,.34],[.33,.4],[.2,.43],[.15,.46]],20),8,.035,0,.46);FLATG=new Set([FG.head,FG.nose,FG.hand,FG.neck,FG.hair,FG.hairL,FG.bowl,FG.beard,FG.eye]);return FG}
/* textúra látky (v267): jemná väzba nití a škvrny; pleť a vlasy dostanú rovnú plochu bez vzoru */
let FLATG=new Set(),WEAVE=null;
function weaveTex(){if(WEAVE)return WEAVE;const N=128,c=document.createElement("canvas");c.width=c.height=N;const x=c.getContext("2d"),im=x.createImageData(N,N),d=im.data;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){let v=238+6*Math.sin(i*Math.PI/4)*(((j>>2)&1)?1:-1)+5*Math.sin(j*Math.PI/4)*(((i>>2)&1)?-1:1)+((Math.sin(i*12.9898+j*78.233)*43758.5453)%1)*7+4*Math.sin(i*.19+j*.11)*Math.sin(j*.23-i*.07);
  if(i>=108&&j>=108)v=238;const o=(j*N+i)*4;d[o]=d[o+1]=d[o+2]=Math.max(0,Math.min(255,v));d[o+3]=255}
 x.putImageData(im,0,0);WEAVE=new T.CanvasTexture(c);WEAVE.wrapS=WEAVE.wrapT=T.RepeatWrapping;WEAVE.anisotropy=4;return WEAVE}
/* diely postavy zlúčené do piatich telies s farbami vo vrcholoch (v104) */
let FIGM=null;const FGC={};let AUD3=null;
function mergeParts(parts){const P=[],N=[],C=[],I=[],UV=[];let base=0;const m4=new T.Matrix4(),q4=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),n3=new T.Matrix3(),col=new T.Color();
 for(const pt of parts){const g0=pt[0],pa=g0.attributes.position,na=g0.attributes.normal;e.set(...(pt[4]||[0,0,0]));q4.setFromEuler(e);m4.compose(new T.Vector3(...pt[2]),q4,new T.Vector3(...(pt[3]||[1,1,1])));n3.getNormalMatrix(m4);col.set(pt[1]);
  const flat=pt[5]===1||FLATG.has(g0)||Math.max(...(pt[3]||[1,1,1]))<.06;
  const ca=g0.attributes.color;for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(m4);P.push(v.x,v.y,v.z);if(flat)UV.push(.92,.92);else UV.push((v.x*.8+v.z*.6)*2.6,v.y*2.6);if(na){v.fromBufferAttribute(na,i).applyMatrix3(n3).normalize();N.push(v.x,v.y,v.z)}else N.push(0,1,0);if(ca){const k=ca.getX(i);C.push(Math.min(1,col.r*k),Math.min(1,col.g*k),Math.min(1,col.b*k))}else C.push(col.r,col.g,col.b)}
  if(g0.index){const ix=g0.index;for(let i=0;i<ix.count;i++)I.push(base+ix.getX(i))}else for(let i=0;i<pa.count;i++)I.push(base+i);base+=pa.count}
 const g=new T.BufferGeometry();g.setAttribute("position",new T.Float32BufferAttribute(P,3));g.setAttribute("normal",new T.Float32BufferAttribute(N,3));g.setAttribute("color",new T.Float32BufferAttribute(C,3));g.setAttribute("uv",new T.Float32BufferAttribute(UV,2));g.setIndex(I);return g}
const ELB=.31,KNEE=.43;
/* hladké telo (v270): prstence okolo kostí pospájané do jedného povrchu; každý vrchol patrí jednej alebo dvom kostiam,
   takže sa lakeť, koleno, plece aj krk ohýbajú plynulo. Kosti: 0 trup, 1 hlava, 2–3 ľavá ruka, 4–5 pravá ruka, 6–9 nohy */
let FIGSK=null;const RIMU={value:null};
function rimify(mt){mt.onBeforeCompile=sh=>{if(!RIMU.value)RIMU.value=new T.Color(.36,.39,.44);sh.uniforms.rimC=RIMU;
  sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nvarying vec3 vRimN;varying vec3 vRimV;").replace("#include <project_vertex>","#include <project_vertex>\nvRimN=transformedNormal;vRimV=-mvPosition.xyz;");
  sh.fragmentShader=sh.fragmentShader.replace("#include <common>","#include <common>\nuniform vec3 rimC;varying vec3 vRimN;varying vec3 vRimV;").replace("#include <envmap_fragment>","#include <envmap_fragment>\n{vec3 rn=normalize(vRimN);if(!gl_FrontFacing)rn=-rn;float fr=pow(1.0-clamp(dot(rn,normalize(vRimV)),0.0,1.0),3.2);outgoingLight+=rimC*fr*(0.18+0.82*diffuseColor.rgb);}")};
 mt.customProgramCacheKey=()=>"rim1"+(mt.skinning?"s":"");return mt}
/* zatienenie tela (v278): miesta, kam sa svetlo z okolia dostane horšie */
function aoBody(bi,x,y,z){const cl=(q)=>Math.max(0,Math.min(1,q)),ax=Math.abs(x);let m=1;
 if(bi===0){m-=.24*cl((ax-.2)/.1)*cl(1-Math.abs(y-1.36)/.16);if(y>1.62&&y<1.75&&z>0)m-=.2*cl(z/.07)*cl(1-Math.abs(y-1.68)/.06)}
 else if(bi<=5){if(y>1.1)m-=.22*cl((.36-ax)/.07)*cl((y-1.1)/.35)}
 else{if(y>.35)m-=.2*cl((.12-ax)/.06)*cl((y-.35)/.4);if(y<.22)m-=.12*cl((.22-y)/.15)}
 return m}
function skinBody(B,o){const P=[],C=[],UV=[],SI=[],SW=[],IX=[],col=new T.Color(),v=new T.Vector3(),M=B.map(b=>b.matrixWorld.clone());
 const ring=(bi,cx,cy,cz,rx,rz,N,cl,wf)=>{const st=P.length/3,flat=cl===o.skin;col.set(cl);
  for(let i=0;i<N;i++){const a=i/N*6.2832,lx=cx+Math.cos(a)*rx,lz=cz+Math.sin(a)*rz;v.set(lx,cy,lz).applyMatrix4(M[bi]);P.push(v.x,v.y,v.z);const m=aoBody(bi,v.x,v.y,v.z);C.push(col.r*m,col.g*m,col.b*m);UV.push(flat?.92:(v.x*.8+v.z*.6)*2.6,flat?.92:v.y*2.6);
   const ws=wf?wf(lx,cy,lz):[[bi,1]],s4=[0,0,0,0],w4=[0,0,0,0];ws.slice(0,4).forEach((q,k)=>{s4[k]=q[0];w4[k]=Math.max(0,q[1])});const sm=w4[0]+w4[1]+w4[2]+w4[3]||1;SI.push(...s4);SW.push(...w4.map(x=>x/sm))}return st};
 const tube=(rs,N)=>{for(let r=0;r<rs.length-1;r++){const a=rs[r],b=rs[r+1];for(let i=0;i<N;i++){const j=(i+1)%N;IX.push(a+i,b+i,b+j,a+i,b+j,a+j)}}};
 const cl=(x,a,b)=>Math.max(a,Math.min(b,x));
 /* trup: výška, polovica šírky, polovica hĺbky; pri pleciach sa časť pohybu prenesie na rameno, krk sa otáča s hlavou */
 const TR=[[.85,.27,.22],[.93,.29,.235],[1.09,.27,.215],[1.23,.29,.235],[1.35,.31,.25],[1.43,.325,.255],[1.5,.355,.24],[1.56,.365,.21],[1.61,.3,.16],[1.63,.235,.138],[1.645,.17,.115],[1.67,.085,.08],[1.72,.075,.075],[1.77,.07,.07]];
 const SHK=y=>y<1.43?0:y<1.5?.3:y<1.6?.5:y<1.64?.3:0,TN=18,tr=[];
 for(const[y,rx,rz]of TR){const bust=o.fem&&y>1.2&&y<1.45?.025:0,c=y<1.62?o.body:y<1.64?(o.shirt||o.body):y<1.66&&o.shirt?o.shirt:o.skin;
  tr.push(ring(0,0,y,bust,rx,rz+bust,TN,c,(x,yy)=>{if(yy>=1.67){const wh=yy>=1.77?1:yy>=1.72?.55:.15;return[[0,1-wh],[1,wh]]}const k=SHK(yy);if(!k)return[[0,1]];const w=cl((Math.abs(x)-.2)/.16,0,1)*k;return[[0,1-w],[x<0?2:4,w]]}))}
 tube(tr,TN);
 /* ruky: rameno v kosti ramena, prstenec v lakti napoly, predlaktie v kosti predlaktia */
 const AN=10;[0,1].forEach(sd=>{const ua=2+sd*2,fa=3+sd*2,rs=[];
  [[.05,.09,.095,1],[0,.092,.098,1],[-.06,.09,.094,1],[-.12,.088,.09,1],[-.18,.082,.084,1],[-.24,.076,.078,.85],[-ELB,.072,.074,.5]].forEach(([y,rx,rz,w])=>rs.push(ring(ua,0,y,0,rx,rz,AN,o.slv||o.body,()=>[[ua,w],[fa,1-w]])));
  [[-.07,.073,.076,.85],[-.13,.07,.072,1],[-.19,.064,.066,1],[-.25,.057,.058,1],[-.3,.052,.052,1],[-.335,.05,.05,1]].forEach(([y,rx,rz,w])=>{const sv=o.slv||o.body;let c=sv,k=1;if(o.rl){if(y<-.1){if(y>-.16){c=mixHex(sv,"#ffffff",.18);k=1.14}else{c=o.skin;k=.9}}}else if(o.shirt&&y<-.28)c=o.shirt;rs.push(ring(fa,0,y,0,rx*k,rz*k,AN,c,()=>[[fa,w],[ua,1-w]]))});
  tube(rs,AN)});
 /* nohy: stehno pri bedre čiastočne s trupom, koleno napoly, lýtko vzadu plnšie */
 if(o.legs)[0,1].forEach(sd=>{const q=6+sd*2,sh=7+sd*2,rs=[];
  [[.06,.11,.11,.7,0],[0,.108,.108,1],[-.1,.104,.104,1],[-.2,.098,.098,1],[-.3,.09,.09,1],[-.37,.085,.085,.85],[-KNEE,.08,.082,.5]].forEach(([y,rx,rz,w,tb])=>rs.push(ring(q,0,y,0,rx,rz,AN,sd&&o.pc?o.pc:o.legc,()=>tb===0?[[q,w],[0,1-w]]:[[q,w],[sh,1-w]])));
  [[-.06,.082,.086,.85,0],[-.13,.085,.092,1,-.012],[-.2,.08,.085,1,-.01],[-.27,.07,.072,1,0],[-.33,.06,.062,1,0],[-.37,.057,.058,1,0]].forEach(([y,rx,rz,w,cz])=>rs.push(ring(sh,0,y,cz,rx,rz,AN,sd&&o.pc?o.pc:o.legc,()=>[[sh,w],[q,1-w]])));
  tube(rs,AN)});
 const g=new T.BufferGeometry();g.setAttribute("position",new T.Float32BufferAttribute(P,3));g.setAttribute("color",new T.Float32BufferAttribute(C,3));g.setAttribute("uv",new T.Float32BufferAttribute(UV,2));
 g.setAttribute("skinIndex",new T.Uint16BufferAttribute(SI,4));g.setAttribute("skinWeight",new T.Float32BufferAttribute(SW,4));g.setIndex(IX);g.computeVertexNormals();return g}
/* maľovaná tvár (v271): štyri políčka vedľa seba – pokoj, žmurknutie, úsmev, reč; tvár sedí na prednej časti hlavy */
const FACES={};let FACEGEO=null;
function faceSet(key,o){if(FACES[key])return FACES[key];const W=128,c=document.createElement("canvas");c.width=W*4;c.height=W;const x=c.getContext("2d");
 const rgb=h=>{const n=parseInt(String(h).replace("#",""),16);return[(n>>16)&255,(n>>8)&255,n&255]},rgba=(h,a)=>{const q=rgb(h);return"rgba("+q[0]+","+q[1]+","+q[2]+","+a+")"};
 const sh=mixHex(o.skin,"#5a2a18",.55),dark="#24160f",brow=o.age>58?mixHex(o.hc,"#d8d8d8",.5):mixHex(o.hc,"#000000",.12),lip=o.fem?mixHex(o.skin,"#b03a3a",.5):mixHex(o.skin,"#9a4a40",.45);
 for(let f=0;f<4;f++){const X=u=>f*W+u*W,Y=v=>v*W;x.save();x.beginPath();x.rect(f*W,0,W,W);x.clip();x.fillStyle=o.skin;x.fillRect(f*W,0,W,W);
  const soft=(u,v,rx,ry,col,a)=>{x.save();x.translate(X(u),Y(v));x.scale(1,ry/rx);const g=x.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,rgba(col,a));g.addColorStop(1,rgba(col,0));x.fillStyle=g;x.fillRect(-rx,-rx,2*rx,2*rx);x.restore()};
  const smile=f===2,talk=f===3,blink=f===1;
  /* tiene: očné jamky, boky nosa, pod perou; líca */
  [.34,.66].forEach(u=>soft(u,.52,15,9,sh,.22));soft(.455,.67,5,8,sh,.25);soft(.545,.67,5,8,sh,.25);soft(.5,.905,9,4,sh,.18);
  [.22,.78].forEach(u=>soft(u,.71,13,9,"#d86a6a",smile?.3:o.fem?.2:.12));
  /* vrásky podľa veku */
  x.lineCap="round";if(o.age>38){x.strokeStyle=rgba(sh,o.age>55?.38:.22);x.lineWidth=1.2;[[-1],[1]].forEach(([d])=>{x.beginPath();x.moveTo(X(.5+d*.07),Y(.7));x.quadraticCurveTo(X(.5+d*.11),Y(.79),X(.5+d*.095),Y(.87));x.stroke()})}
  if(o.age>55){x.strokeStyle=rgba(sh,.32);x.lineWidth=1;[.25,.29,.33].forEach(v=>{x.beginPath();x.moveTo(X(.4),Y(v));x.quadraticCurveTo(X(.5),Y(v-.012),X(.6),Y(v));x.stroke()});[-1,1].forEach(d=>{for(let k=0;k<3;k++){x.beginPath();x.moveTo(X(.5+d*.235),Y(.52+k*.02-.02));x.lineTo(X(.5+d*.27),Y(.51+k*.035-.03));x.stroke()}});[.34,.66].forEach(u=>soft(u,.6,9,4,sh,.25))}
  /* obočie */
  x.strokeStyle=brow;x.lineWidth=o.fem?2.4:3.6;[-1,1].forEach(d=>{const lift=smile?-.012:talk?-.02:0;x.beginPath();x.moveTo(X(.5+d*.075),Y(.415+lift));x.quadraticCurveTo(X(.5+d*.155),Y(.37+lift),X(.5+d*.23),Y(.405+lift));x.stroke()});
  /* oči */
  [-1,1].forEach(d=>{const cu=.5+d*.158,cv=.535,ex=10.5,ey=smile?4.2:5.6;
   if(blink){x.strokeStyle=dark;x.lineWidth=2;x.beginPath();x.moveTo(X(cu)-ex,Y(cv)+1);x.quadraticCurveTo(X(cu),Y(cv)+4,X(cu)+ex,Y(cv)+1);x.stroke();return}
   x.save();x.beginPath();x.ellipse(X(cu),Y(cv),ex,ey,0,0,6.2832);x.fillStyle="#f3eee6";x.fill();x.clip();
   x.fillStyle=o.ec;x.beginPath();x.arc(X(cu),Y(cv)+.5,5.2,0,6.2832);x.fill();x.fillStyle="#120c08";x.beginPath();x.arc(X(cu),Y(cv)+.5,2.4,0,6.2832);x.fill();
   x.fillStyle="rgba(255,255,255,.9)";x.beginPath();x.arc(X(cu)-1.6,Y(cv)-1.4,1.3,0,6.2832);x.fill();x.fillStyle=rgba(o.skin,.35);x.fillRect(X(cu)-ex,Y(cv)-ey,2*ex,ey*.55);x.restore();
   x.strokeStyle=dark;x.lineWidth=o.fem?2.4:1.9;x.beginPath();x.ellipse(X(cu),Y(cv),ex,ey,0,Math.PI*1.04,Math.PI*1.96);x.stroke();
   if(o.fem){x.lineWidth=1.3;x.beginPath();x.moveTo(X(cu)+d*ex*.95,Y(cv)-ey*.3);x.lineTo(X(cu)+d*(ex+3),Y(cv)-ey*.9);x.stroke()}
   x.strokeStyle=rgba(sh,.45);x.lineWidth=1;x.beginPath();x.ellipse(X(cu),Y(cv)+.6,ex*.85,ey,0,Math.PI*.15,Math.PI*.85);x.stroke()});
  /* nos: nosné dierky */
  x.fillStyle=rgba(dark,.45);[-1,1].forEach(d=>{x.beginPath();x.ellipse(X(.5+d*.03),Y(.705),2.2,1.3,0,0,6.2832);x.fill()});
  /* ústa */
  const mv=.85,mw=.075;x.lineCap="round";
  if(talk){x.fillStyle="#3a1612";x.beginPath();x.ellipse(X(.5),Y(mv)+1,7,4.6,0,0,6.2832);x.fill();x.fillStyle="#efe8dc";x.fillRect(X(.5)-5,Y(mv)-3,10,2.2);x.strokeStyle=lip;x.lineWidth=2.2;x.beginPath();x.ellipse(X(.5),Y(mv)+1,7.4,5,0,0,6.2832);x.stroke()}
  else{const up=smile?-4.5:0;x.strokeStyle=mixHex(lip,"#2a1410",.35);x.lineWidth=1.8;x.beginPath();x.moveTo(X(.5-mw),Y(mv)+up);x.quadraticCurveTo(X(.5),Y(mv)+(smile?4:1.2),X(.5+mw),Y(mv)+up);x.stroke();
   x.fillStyle=rgba(lip,.75);x.beginPath();x.moveTo(X(.5-mw*.75),Y(mv)+1.5+up*.5);x.quadraticCurveTo(X(.5),Y(mv)+(smile?8:6),X(.5+mw*.75),Y(mv)+1.5+up*.5);x.quadraticCurveTo(X(.5),Y(mv)+(smile?4.5:2.6),X(.5-mw*.75),Y(mv)+1.5+up*.5);x.fill();
   if(smile){x.strokeStyle=rgba(sh,.35);x.lineWidth=1.1;[-1,1].forEach(d=>{x.beginPath();x.moveTo(X(.5+d*(mw+.01)),Y(mv)-6);x.quadraticCurveTo(X(.5+d*(mw+.03)),Y(mv)-2,X(.5+d*(mw+.015)),Y(mv)+2);x.stroke()})}}
  x.restore()}
 if(!FACEGEO)FACEGEO=new T.SphereGeometry(.2028,26,18,Math.PI/2-1.1,2.2,.5,1.75);
 const kc=(T.__m3cm&&CMON)?.915:1,mats=[0,1,2,3].map(k=>{const t=new T.CanvasTexture(c);t.repeat.set(.25,1);t.offset.set(k*.25,0);t.anisotropy=4;const m=new T.MeshLambertMaterial({map:t,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});m.color.setScalar(kc);return m});
 return FACES[key]={geo:FACEGEO,mats}}
/* vlasy z prameňov (v276): pramene rastú z temena po tvare hlavy k línii vlasov; dlhé vlasy po bokoch a vzadu padajú
   za plecia na chrbát. Každý prameň je plochý pásik so zúženým koncom, s vlastným odtieňom a svetlejšou špičkou. Súradnice sú okolo stredu hlavy. */
const HAIRG={};
function hairGeo(bot,vr,vol){const key=[bot,vr,vol].join("|");if(HAIRG[key])return HAIRG[key];const P=[],C=[],I=[],R=.2;let rs=1234+vr*7919;const rnd=()=>{rs=(rs*16807)%2147483647;return rs/2147483647};
 const tmax=c=>c>=0?1.3-.36*c:1.3+.55*(-c),S=4,n=bot==null?84:100,v=new T.Vector3(),d=new T.Vector3(),nr=new T.Vector3(),sd=new T.Vector3();
 for(let k=0;k<n;k++){const a0=rnd()*6.2832,c=Math.cos(a0),tm=tmax(c),t0=Math.acos(1-rnd()*(1-Math.cos(tm*.8))),tw=(rnd()-.5)*.35,sh=.72+rnd()*.3,W=.033+rnd()*.014;
  const fall=bot!=null&&c<.45,pts=[];
  /* po hlave */
  const te=fall?Math.max(t0+.15,Math.min(tm,1.6)):tm+.05,ns=fall?3:S;
  for(let i=0;i<=ns;i++){const f=i/ns,t=t0+(te-t0)*f,a=a0+tw*f,r=R*(1.035+(.03+.03*vol)*Math.sin(Math.PI*Math.min(1,f*.9+.05))+(fall?.02*f:0)-(fall?0:.012*f*f));pts.push([-Math.sin(t)*Math.sin(a)*r*-1,Math.cos(t)*r,Math.sin(t)*Math.cos(a)*r])}
  /* dlhé vlasy padajú dole a dozadu za plecia */
  if(fall){const[x0,y0,z0]=pts[pts.length-1],zt=-(.255+rnd()*.04),xt=x0*.82,m=4;for(let i=1;i<=m;i++){const f=i/m,y=y0+(bot-y0)*f,kk=Math.min(1,(y0-y)/.22),e=kk*kk*(3-2*kk);pts.push([x0+(xt-x0)*e+(rnd()-.5)*.012,y,z0+(zt-z0)*e*(c>-.2?1:.6)+(c<=-.2?-.03*f:0)])}}
  /* pásik: šírka naprieč smerom rastu, hrúbka von z hlavy */
  const base=P.length/3,N=pts.length,shd=sh;
  for(let i=0;i<N;i++){const q=pts[i],q2=pts[Math.min(N-1,i+1)],q1=pts[Math.max(0,i-1)];d.set(q2[0]-q1[0],q2[1]-q1[1],q2[2]-q1[2]).normalize();nr.set(q[0],q[1]*.4,q[2]).normalize();sd.crossVectors(d,nr).normalize();
   const f=i/(N-1),w=W*(1-.75*f*f),th=.007*(1-.6*f);
   [[sd.x*w,sd.y*w,sd.z*w],[nr.x*th,nr.y*th,nr.z*th],[-sd.x*w,-sd.y*w,-sd.z*w]].forEach(o2=>{P.push(q[0]+o2[0],q[1]+o2[1],q[2]+o2[2]);const g=shd*(.82+.33*f);C.push(g,g,g)})}
  for(let i=0;i<N-1;i++)for(let j=0;j<3;j++){const a=base+i*3+j,b=base+i*3+(j+1)%3,c2=a+3,d2=b+3;I.push(a,c2,b,b,c2,d2)}}
 const g=new T.BufferGeometry();g.setAttribute("position",new T.Float32BufferAttribute(P,3));g.setAttribute("color",new T.Float32BufferAttribute(C,1));g.setIndex(I);g.computeVertexNormals();return HAIRG[key]=g}
/* odev vo vrstvách (v272): zástera, náprsenka, lem, gombíky, kožušinový golier a pokrývky hlavy; časti nad 1,69 m idú do hlavy */
function dressL(L,dr,o,G0,DG){const PI=Math.PI,dkc=(c,t)=>mixHex(c,"#000000",t||.3),LIN="#efe9dc";
 if(dr.ap){if(o.fem)L.push([DG.apronF,dr.ap,[0,.6,0]]);else if(!o.robe){L.push([DG.apronM,dr.ap,[0,.72,0]]);if(dr.bib)L.push([DG.box,dr.ap,[0,1.2,.25],[.24,.3,.022]],[DG.box,dkc(dr.ap),[0,1.345,.262],[.24,.018,.012]])}}
 if(dr.tr&&!o.fem&&!o.robe)L.push([DG.tube,dr.tr,[0,.655,0],[.392,.05,.392]]);
 if(dr.bt&&!o.fem)[[1.46,.257],[1.38,.26],[1.3,.252],[1.22,.242],[1.14,.23]].forEach(([y,z])=>L.push([DG.sph,dr.bt,[0,y,z],[.019,.019,.012]]));
 if(dr.fu)L.push([DG.torF,dr.fu,[0,1.6,0],[.31,.19,.45],[PI/2,0,0]]);
 const h=dr.hd,hc=dr.hc||"#5a3a2a";if(!h)return;
 if(h==="hood"||h==="hoodU"){L.push([G0.hcape,hc,[0,1.2,0],[1.08,1,.74]]);for(let i=0;i<14;i++){const a=i/14*6.283;L.push([DG.cone,hc,[Math.sin(a)*.585,1.165,Math.cos(a)*.405],[.042,.075,.042],[PI,0,0]])}
  if(h==="hood")L.push([DG.torF,dkc(hc,.12),[0,1.665,-.02],[.16,.14,.5],[PI/2,0,0]],[DG.sph,hc,[0,1.66,-.15],[.13,.07,.07]],[DG.cone,hc,[0,1.32,-.36],[.035,.6,.03],[PI-.1,0,0]]);
  else L.push([DG.hoodU,hc,[0,1.86,-.005],[1,1.08,1.05]])}
 else if(h==="coif")L.push([G0.hair,LIN,[0,1.86,-.01],[1.08,1.1,1.1],[-.3,0,0]],[DG.tor,LIN,[0,1.887,-.018],[.231,.231,.25],[-1.87,0,0]],[DG.box,LIN,[-.192,1.74,.03],[.018,.15,.04]],[DG.box,LIN,[.192,1.74,.03],[.018,.15,.04]]);
 else if(h==="veil")L.push([G0.hair,LIN,[0,1.86,-.01],[1.09,1.1,1.1],[-.25,0,0]],[DG.tor,LIN,[0,1.887,-.017],[.234,.234,.25],[-1.82,0,0]],[G0.hairL,LIN,[0,1.66,-.03],[1.2,.78,1.2]],[DG.cyl,LIN,[0,1.655,.005],[.112,.09,.104]],[DG.cyl,dkc(LIN,.12),[0,1.995,-.01],[.226,.018,.226]]);
 else if(h==="kerch")L.push([G0.hair,hc,[0,1.87,-.015],[1.07,1.08,1.1],[-.45,0,0]],[DG.sph,hc,[0,1.79,-.22],[.07,.06,.06]],[DG.box,hc,[0,1.7,-.25],[.05,.12,.02],[.2,0,0]]);
 else if(h==="felt")L.push([DG.cyl,hc,[0,1.995,.01],[.37,.02,.37],[.13,0,0]],[DG.sph,hc,[0,2.05,-.01],[.226,.2,.226]],[DG.cyl,dkc(hc),[0,2.03,0],[.232,.04,.232]],[DG.box,dkc(hc,.1),[.16,2.09,-.1],[.02,.16,.05],[-.4,0,-.5]]);
 else if(h==="straw")L.push([DG.cyl,"#d9b860",[0,2.0,0],[.4,.02,.4]],[DG.cone,"#cfae58",[0,2.1,0],[.24,.24,.24]],[DG.cyl,"#8a6a3a",[0,2.02,0],[.205,.03,.205]]);
 else if(h==="turban")L.push([DG.torF,hc,[0,2.0,0],[.2,.2,.38],[PI/2,0,.08]],[DG.sph,mixHex(hc,"#ffffff",.12),[0,2.08,0],[.17,.09,.17]],[DG.box,hc,[.2,1.8,-.06],[.07,.38,.12],[0,0,-.15]]);
 else if(h==="baker")L.push([DG.cyl,LIN,[0,2.06,0],[.222,.2,.222]],[DG.sph,LIN,[0,2.17,0],[.26,.1,.26]]);
 else if(h==="cap")L.push([DG.cyl,hc,[0,2.0,0],[.226,.1,.226]],[DG.sph,hc,[0,2.05,0],[.228,.08,.228]])}
/* ohyb lakťov a kolien (v270): počíta sa v chôdzi pred vykreslením, aby ho kostra stihla prevziať */
function bendJ(u){try{for(const q of u.arms){const ud=q.userData;if(!ud.ua)continue;const t=-q.rotation.x,dl=.08+(t>0?.4*Math.sin(Math.min(Math.PI,t)):0);ud.ua.rotation.x=dl;ud.fa.rotation.x=-2*dl-(ud.eb||0)}
 for(const q of u.legsP||[]){const sh=q.userData.sh;if(!sh)continue;const t=q.rotation.x,kn=q.userData.kn;sh.rotation.x=kn!=null?kn:t<0?Math.min(1.5,-t):t*.45}}catch(e){}}
function figure(o){const G0=figGeo(),g=new T.Group();if(!FIGM){FIGM=rimify(new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide,map:weaveTex()}));FIGM.color.setScalar(1.07)}
 const skin=o.skin||"#e8c4a0",feet=o.feet||"#6b4423",legc=o.legs||"#4a3a2a",hc=o.hair===null?null:(o.hair||"#5a3a20"),legsP=[];
 const cached=(key,fn)=>FGC[key]||(FGC[key]=mergeParts(fn()));const mesh=(geo,par)=>{const m=new T.Mesh(geo,FIGM);m.castShadow=true;(par||g).add(m);return m};
 const bt=o.boots||{},DG=dgeo(),dr=o.dr||{},COV=["hoodU","coif","veil","kerch","baker","cap"].includes(dr.hd),drK=[dr.sh,dr.slv,dr.sk,dr.ap,dr.bib?1:0,dr.hd,dr.hc,dr.tr,dr.bt,dr.fu,dr.ws?1:0].join(",");const hs=o.hs|0,bs=o.bs==null?(o.beard?2:0):o.bs|0,ec=o.eyes||"#4a3220";const HD=new T.Group();HD.position.set(0,HEADY,0);splitHead(cached,mesh,HD,g,["b",o.body,o.fem?1:0,o.robe?1:0,bt.beak?1:0,skin,feet,hc,bs,hs,ec,drK].join("|"),()=>{const L=[];
  if(o.fem||o.robe){const k=o.fem?1:.8;L.push([G0.skirt,o.fem&&dr.sk||o.body,[0,0,0],[k,1,k]],[G0.shoe,feet,[-.1,.05,.14*k+.02]],[G0.shoe,feet,[.1,.05,.14*k+.02]]);if(bt.beak)[-.1,.1].forEach(x=>L.push([DG.cone,feet,[x,.04,.14*k+.24],[.05,.2,.04],[Math.PI/2,0,0]]))}else L.push([G0.tunic,o.body,[0,.62,0],[1,1,.9]]);
  if(!(o.fem||o.robe)){const bc=mixHex(o.body,"#2a1a10",.68);L.push([DG.cyl,bc,[0,1.06,0],[.292,.06,.25]],[DG.box,"#c9a24a",[0,1.06,.243],[.055,.048,.016]],[DG.sph,mixHex(bc,"#7a5030",.4),[.235,.97,.1],[.06,.078,.05]])}else L.push([DG.cyl,mixHex(o.body,"#000000",.3),[0,1.1,0],[.284,.045,.245]]);
  L.push([DG.sph,skin,[0,1.712,.058],[.125,.076,.116],[0,0,0],1]);
  L.push([G0.head,skin,[0,1.84,0],[1,1.08,1]],[G0.nose,mixHex(skin,"#b0705a",.22),[0,1.815,.205],[.95,1.25,1.2]],[DG.box,mixHex(skin,"#b0705a",.12),[0,1.86,.196],[.03,.07,.02]]);
  [-1,1].forEach(q=>L.push([DG.sph,skin,[q*.198,1.845,.0],[.022,.05,.034]],[DG.sph,mixHex(skin,"#8a5040",.35),[q*.207,1.845,.006],[.01,.028,.018]]));
  if(hc){const hv=((hs*3+bs+(o.fem?5:0))%4),strands=(by,vol)=>L.push([hairGeo(by==null?null:+((by-1.84)/1.08).toFixed(3),hv,vol||0),hc,[0,1.84,0],[1,1.08,1],[0,0,0],1]),cap=()=>COV?0:strands(null,0),hd=mixHex(hc,"#000000",.18);
   if(o.fem){if(hs===3){L.push([G0.hair,"#f2ede0",[0,1.86,-.012],[1.04,1.08,1.08],[-.3,0,0]],[G0.hairL,"#f2ede0",[0,1.72,-.01],[1.03,.6,1.03]],[DG.box,hc,[0,1.965,.165],[.2,.02,.03]])}
    else{if(COV);else if(hs===0)strands(1.4,1);else if(hs===1){strands(1.66,0);[-.19,.19].forEach(x=>{for(let i=0;i<5;i++)L.push([DG.sph,i%2?hd:hc,[x,1.68-i*.085,.06],[.05,.055,.05]]);L.push([DG.sph,"#b8362c",[x,1.27,.06],[.03,.03,.03]])})}
     else if(hs===2)strands(null,0),L.push([DG.sph,hc,[0,1.93,-.2],[.11,.11,.1]],[DG.tor,hd,[0,1.93,-.2],[.09,.09,.2],[0,0,0]]);
     else{strands(null,0);for(let i=0;i<12;i++){const a=i/12*6.283;L.push([DG.sph,i%2?hd:hc,[Math.sin(a)*.17,1.985+Math.cos(a)*-.02,Math.cos(a)*.17-.02],[.05,.045,.05]])}}}}
   else{if(hs===4){L.push([G0.hairL,hc,[0,1.8,-.012],[1.04,.36,1.04]])}else{if(hs!==1)cap();if(hs===1&&!COV)strands(1.55,1);else if(hs===2)L.push([G0.bowl,hc,[0,1.82,-.012]],[DG.sph,hc,[0,1.962,.142],[.15,.034,.05]]);else if(hs===3)for(let k=0;k<2;k++)for(let i=0;i<9;i++){const a=i/9*6.283+k*.35,rr=k?.13:.2,y=k?2.02:1.93;if(!k&&Math.cos(a)>.55)continue;L.push([DG.sph,i%2?hd:hc,[Math.sin(a)*rr,y,Math.cos(a)*rr-.02],[.062,.058,.062]])}}
    if(bs===1)L.push([G0.beard,mixHex(skin,hc,.38),[0,1.735,.07],[1.18,.78,.98]]);else if(bs===2)L.push([G0.beard,hc,[0,1.72,.1],[1.05,.85,.8]]);else if(bs===3)L.push([G0.beard,hc,[0,1.72,.1],[1.08,.9,.82]],[DG.cone,hc,[0,1.56,.13],[.1,.3,.07],[Math.PI,0,0]]);
    if(bs>=2)L.push([DG.box,hc,[0,1.785,.19],[.11,.022,.02]]);if(bs===4)L.push([DG.box,hc,[0,1.785,.19],[.13,.026,.024]],[DG.sph,hc,[-.075,1.775,.18],[.022,.028,.018]],[DG.sph,hc,[.075,1.775,.18],[.022,.028,.018]])}}dressL(L,dr,o,G0,DG);return L});
 {const ag=o.age==null?30:o.age|0,fk=["f",skin,ec,hc||"",o.fem?1:0,ag>55?2:ag>38?1:0].join("|"),F=faceSet(fk,{skin,ec,hc:hc||"#5a3a20",fem:!!o.fem,age:ag>55?60:ag>38?45:25}),fm=new T.Mesh(F.geo,F.mats[0]);fm.position.y=.18;fm.scale.set(1,1.08,1);HD.add(fm);g.__face={m:fm,F}}
 if(!o.fem&&!o.robe)[-.13,.13].forEach(x=>{const q=new T.Group();q.position.set(x,.88,0);g.add(q);/* koleno (v151): stehno a predkolenie; ohyb sa dopočíta z q.rotation.x */
  const sh=new T.Group();sh.position.set(0,-KNEE,0);q.add(sh);
  mesh(cached(["ll2",legc,feet,bt.tall?1:0,bt.beak?1:0,bt.gold?1:0,bt.spur?1:0].join("|"),()=>{const L=[[G0.shoe,feet,[0,-.83+KNEE,.06]]];if(bt.tall)L.push([DG.cyl,feet,[0,-.62+KNEE,0],[.108,.38,.108]]);if(bt.beak)L.push([DG.cone,feet,[0,-.84+KNEE,.3],[.05,.2,.04],[Math.PI/2,0,0]]);if(bt.gold)L.push([DG.cyl,"#e2b85a",[0,-.44+KNEE,0],[.113,.03,.113]]);if(bt.spur)L.push([DG.box,"#e2b85a",[0,-.8+KNEE,-.13],[.025,.025,.12]],[DG.sph,"#e2b85a",[0,-.8+KNEE,-.2],[.03,.03,.012]]);return L}),sh);
  q.userData.sh=sh;legsP.push(q)});
 const arms=[-.37,.37].map(x=>{const q=new T.Group();q.position.set(x,1.54,0);q.rotation.z=x<0?-.08:.08;g.add(q);
  /* lakeť (v149): rameno a predlaktie; smer ruky určuje q.rotation.x, ohyb sa dopočíta */
  const ua=new T.Group(),fa=new T.Group();fa.position.set(0,-ELB,0);q.add(ua);ua.add(fa);mesh(cached(["al3",o.body,o.glove||skin,dr.ws?1:0,x<0?1:0].join("|"),()=>{const hc2=o.glove||skin,hd2=mixHex(hc2,"#6a3a28",.16),cs=x<0?1:-1,L=[[G0.hand,hc2,[cs*.004,-.37,.004],[.5,.82,.78]],[DG.sph,hc2,[cs*.004,-.345,0],[.04,.045,.052]]];
   [[.034,.042],[.012,.048],[-.01,.046],[-.031,.037]].forEach(([fz,l],i)=>{const y1=-.418;L.push([DG.sph,hc2,[cs*.002,y1-l*.45,fz],[.0125,l*.5+.006,.0125]],[DG.sph,hd2,[cs*.006,y1-.004,fz],[.013,.009,.0128]],[DG.sph,hc2,[cs*.013,y1-l*.9-.017,fz],[.011,.022,.011],[0,0,cs*.55]])});
   L.push([DG.sph,hc2,[cs*.018,-.388,.05],[.014,.032,.015],[.45,0,cs*.35]],[DG.sph,hc2,[cs*.028,-.418,.064],[.012,.021,.012],[.2,0,cs*.5]]);if(dr.ws)L.push([DG.bell,o.body,[0,-.26,0],[.12,.16,.12]]);return L}),fa);
  q.userData.ua=ua;q.userData.fa=fa;const add0=q.add.bind(q);q.add=function(ob){if(ob&&ob.position&&ob.position.y<-.2){ob.position.y+=ELB;fa.add(ob)}else ua.add(ob);return q};
  ua.rotation.x=.08;fa.rotation.x=-.16;return q});
 /* hladké telo na kostiach */
 try{const TB=new T.Group();g.add(TB);const bones=[TB,HD,arms[0].userData.ua,arms[0].userData.fa,arms[1].userData.ua,arms[1].userData.fa];legsP.forEach(q=>bones.push(q,q.userData.sh));g.updateMatrixWorld(true);
  const key=["sk",o.body,skin,legc,o.fem?1:0,legsP.length,dr.sh,dr.slv,dr.rl?1:0,dr.pc].join("|"),geo=FGC[key]||(FGC[key]=skinBody(bones,{body:o.body,skin,legc,fem:!!o.fem,legs:legsP.length>0,shirt:dr.sh,slv:dr.slv,rl:!!dr.rl,pc:dr.pc}));
  if(!FIGSK){FIGSK=rimify(new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide,map:weaveTex(),skinning:true}));FIGSK.color.setScalar(1.07)}
  const sm=new T.SkinnedMesh(geo,FIGSK);sm.castShadow=true;sm.frustumCulled=false;g.add(sm);g.updateMatrixWorld(true);sm.bind(new T.Skeleton(bones),sm.matrixWorld)}catch(e){console.warn("3D telo",e)}
 g.userData={arms,legsP,head:HD,face:g.__face||null,skirt:g.__sk||null,ph:Math.random()*6,st:{amp:.92+Math.random()*.16,rate:.94+Math.random()*.12,arm:1,hunch:0,stiff:0}};{const rg=rigify(g),bw=.93+Math.random()*.15;rg.scale.set(bw,.95+Math.random()*.09,(bw+1)/2)}return g}
/* kostra (v263): telo v jednej skupine, ktorú chôdza dvíha, kolíše a nakláňa; g.add pridáva do nej, aby sa hýbali aj klobúky a náradie */
/* hlava (v265): časti hlavy (tvár, vlasy, brada) idú do skupiny HD otočnej na krku */
const HEADY=1.66;
function splitHead(cached,mesh,HD,g,key,fn){const k=typeof key==="string"?key:key.join("|");let L=FGC[k+"#L"];if(!L)L=FGC[k+"#L"]=fn();const G0=figGeo(),HG=[G0.head,G0.hair,G0.hairL,G0.bowl,G0.beard,G0.nose];
 const isH=pt=>HG.includes(pt[0])||pt[2][1]>1.69||(pt[2][1]>1.5&&pt[2][2]>.09&&Math.abs(pt[2][0])<.16);
 const isS=pt=>pt[0]===G0.skirt||(DGC&&pt[0]===DGC.apronF),SL=L.filter(isS);
 mesh(cached(k+"#B",()=>L.filter(pt=>!isH(pt)&&!isS(pt))));g.add(HD);if(SL.length){const SK=new T.Group();SK.position.y=.92;g.add(SK);mesh(cached(k+"#S",()=>SL.map(pt=>{const q=pt.slice();q[2]=[pt[2][0],pt[2][1]-.92,pt[2][2]];return q})),SK);g.__sk=SK}const hm=mesh(cached(k+"#H",()=>L.filter(isH).map(pt=>{const q=pt.slice();q[2]=[pt[2][0],pt[2][1]-HEADY,pt[2][2]];return q})),HD);return hm}
function rigify(g){const rig=new T.Group();while(g.children.length)rig.add(g.children[0]);T.Object3D.prototype.add.call(g,rig);
 g.add=function(){for(const ob of arguments){const HD=g.userData&&g.userData.head;if(HD&&ob&&ob.position&&ob.position.y>1.7&&Math.abs(ob.position.x)<.35&&Math.abs(ob.position.z)<.35){ob.position.y-=HEADY;HD.add(ob)}else rig.add(ob)}return g};g.userData.rig=rig;return rig}
function turnY(o,a,dt){let d=a-o.rotation.y;while(d>Math.PI)d-=6.2832;while(d<-Math.PI)d+=6.2832;o.rotation.y+=Math.abs(d)>2.6&&dt>.2?d:d*Math.min(1,dt*9)}
/* chôdza (v263): krok sa riadi skutočnou rýchlosťou postavy, aby nohy nekĺzali; telo pri kroku klesá, kolíše a otáča boky, ruky sa kývu s oneskorením; rozbeh aj zastavenie sú plynulé */
const LEGL=.88,PLP=[0,0],CRW={cur:[],prev:[]};
/* obchádzanie (v269): chodec sa vyhne ľuďom pred sebou a hráčovi, keď je niekto tesne pred ním, spomalí */
function avoid(g,ux,uz){const x=g.position.x,z=g.position.z,nx=-uz,nz=ux;let sx=0,sz=0,slow=1;
 const chk=(qx,qz,R,wt)=>{const dx=qx-x,dz=qz-z,d=Math.hypot(dx,dz);if(d<.05||d>R)return;const ah=(dx*ux+dz*uz)/d;if(ah<-.1)return;const sd=dx*nx+dz*nz>=0?1:-1,k=(R-d)/R*wt*(.4+.6*ah);sx-=sd*nx*k;sz-=sd*nz*k;if(d<.85&&ah>.5)slow=Math.min(slow,.3+d*.7)};
 for(const A2 of[CRW.prev,CRW.cur])for(let i=0;i<A2.length;i+=3){if(A2[i+2]===g.id)continue;chk(A2[i],A2[i+1],1.5,1)}chk(PLP[0],PLP[1],2.2,1.6);
 let ax=ux+sx,az=uz+sz;const l=Math.hypot(ax,az)||1;return[ax/l,az/l,slow]}
function stride(g,moving,t,sp,inner){const u=g.userData;if(!u||!u.arms)return;if(!inner)u.ext=t;
 /* postavy ďalej od hráča sa animujú každý druhý (nad 45 m každý štvrtý) snímok */
 {const P0=g.position;CRW.cur.push(P0.x,P0.z,g.id);if(!u.isMe){const dP=Math.hypot(PLP[0]-P0.x,PLP[1]-P0.z);if(dP>26){u.sk=(u.sk||0)+1;if(u.sk%(dP>45?4:2))return}}}const st=u.st||{amp:1,rate:1,arm:1,hunch:0,stiff:0},rig=u.rig,sc=g.scale.y||1;
 const dt=u.lt!=null?Math.min(.1,Math.max(0,t-u.lt)):0;u.lt=t;const P=g.position;let v=-1;
 if(u.lp&&dt>0){const d=Math.hypot(P.x-u.lp[0],P.z-u.lp[1]);v=d/dt;if(d>3)v=-1}u.lp=[P.x,P.z];
 /* rýchlosť: zmeraná z pohybu; keď ju nevidno (stojí na mieste, ale „kráča“), odhad z tempa */
 const vt=moving?(v>.05?v:(sp||8)*.17*sc):0;u.vs=(u.vs||0)+(vt-(u.vs||0))*Math.min(1,dt*7);const vl=u.vs/sc;
 u.w=(u.w||0)+((moving&&vl>.08?1:0)-(u.w||0))*Math.min(1,dt*(moving?6:4.5));const w=u.w;
 const run=Math.max(0,Math.min(1,(vl-5.4)/2.4)),A=Math.min(.74,.2+vl*.085+run*.08)*st.amp*(1-st.stiff*.35);
 /* dĺžka kroku z uhla nôh; pri behu sa pridá let */
 const cyc=Math.max(4*LEGL*Math.sin(.9*A)*(1+run*.75),vl/(2.15*st.rate));if(w>.002)u.phs=((u.phs==null?u.ph:u.phs)+vl/cyc*6.2832*dt)%62.832;
 const ph=u.phs==null?u.ph:u.phs,sn=Math.sin(ph),cs=Math.cos(ph),Aw=A*w,sw=Aw*sn;
 /* ruky alebo nohy, ktoré nastavuje iný kód (predavač, stráž s kopijou, sediaci), sa v stoji nechajú tak */
 const a0=u.arms[0],a1=u.arms[1],L0=u.legsP&&u.legsP[0];if(!u.I){u.I={lk:[0,0],tg:[0,0],nl:t+1+Math.random()*3,pose:0,pv:[0,0,0],np:t+5+Math.random()*12,ws:0,wt:0,nw:t+2+Math.random()*5,gr:-99,nod:-99,az:[a0.rotation.z,a1.rotation.z]};
  u.I.stA=Math.abs(a0.rotation.x)>1e-3||Math.abs(a1.rotation.x)>1e-3;u.I.stL=!!L0&&Math.abs(L0.rotation.x)>1e-3}
 const I=u.I;if(I.ax!=null&&(Math.abs(a0.rotation.x-I.ax)>1e-4||Math.abs(a1.rotation.x-I.ax1)>1e-4))I.busyA=t+3;if(L0&&I.lx!=null&&Math.abs(L0.rotation.x-I.lx)>1e-4)I.busyL=t+3;
 const busyA=I.stA||I.busyA>t,busyL=I.stL||I.busyL>t,doL=w>.05||!busyL,doA=w>.05||!busyA;I.ax=I.lx=null;
 /* nohy a kolená: koleno sa ohne, keď noha ide dopredu (vo švihu), pri behu viac */
 if(doL&&u.legsP&&u.legsP.length){u.legsP[0].rotation.x=-sw*.9;u.legsP[1].rotation.x=sw*.9;
  if(w>.02){const k=(A/.55)*w,kb=.9+run*.7;u.legsP[0].userData.kn=.06*w+kb*k*Math.max(0,cs)+.1*run*w;u.legsP[1].userData.kn=.06*w+kb*k*Math.max(0,-cs)+.1*run*w}else u.legsP[0].userData.kn=u.legsP[1].userData.kn=null}
 /* ruky: kývanie z ramena s oneskorením, dopredu viac ako dozadu; pri behu ohnuté lakte */
 const sa=Aw*Math.sin(ph-.32)*(.95+run*.25)*st.arm,fw=x=>x<0?x*1.15:x*.72;if(doA){u.arms[0].rotation.x=fw(sa);u.arms[1].rotation.x=fw(-sa);
 u.arms[0].userData.eb=u.arms[1].userData.eb=run*w*1.25+st.stiff*.1}
 /* trup: pokles pri rozkročení (chodidlá ostanú na zemi), kolísanie do strán, natočenie bokov, predklon pri behu a v starobe */
 if(rig){const al=.9*A*Math.abs(sn)*w;rig.position.y=-LEGL*(1-Math.cos(al))*.92+run*w*.05*Math.abs(cs);rig.position.x=.024*w*sn*(1-run*.5);
  rig.rotation.z=-.03*w*sn*(1-run*.4);if(u.skirt){u.skirt.rotation.x=w*(.05+run*.09)+.022*w*Math.sin(2*ph);u.skirt.rotation.z=.04*w*cs}rig.rotation.y=.11*Aw*sn*(1-st.stiff);rig.rotation.x=w*(.025+run*.14)+st.hunch}
 try{idleL(g,u,rig,w,t,dt,doA&&!busyA,doL&&!busyL)}catch(e){}
 if(doA){I.ax=a0.rotation.x;I.ax1=a1.rotation.x}if(doL&&L0)I.lx=L0.rotation.x;bendJ(u);
 g.userData.bob=rig?-rig.position.y:0}
/* kľudový pohyb (v265): dýchanie, presúvanie váhy z nohy na nohu, pózy rúk, obzeranie sa, pohľad na hráča a pozdrav kývnutím */
function idleL(g,u,rig,w,t,dt,armsFree,legsFree){const I=u.I,iw=1-w;if(!rig)return;
 rig.position.y+=iw*.006*Math.sin(t*1.7+u.ph);
 /* váha na jednej nohe, druhá uvoľnená v kolene */
 if(t>I.nw){I.nw=t+3+Math.random()*6;I.wt=Math.random()<.35?0:Math.random()<.5?-1:1}I.ws+=(I.wt-I.ws)*Math.min(1,dt*1.4);
 if(legsFree&&u.legsP&&u.legsP.length>1){rig.position.x+=iw*.035*I.ws;rig.rotation.z-=iw*.028*I.ws;if(w<.05){const k=Math.abs(I.ws)*iw,r=I.ws>0?u.legsP[0]:u.legsP[1],s2=I.ws>0?u.legsP[1]:u.legsP[0];r.userData.kn=.04+.3*k;r.rotation.x=-.08*k;s2.userData.kn=.03;s2.rotation.x=.02*k}}
 /* pózy rúk: voľne, zopnuté vpredu pri opasku, za chrbtom */
 if(t>I.np){I.np=t+7+Math.random()*12;I.pose=Math.random()<.45?0:Math.random()<.55?1:2}const PZ=[[0,0,0],[-.16,.2,.95],[.42,.12,.7]][armsFree&&w<.1&&!u.isMe?I.pose:0];
 for(let k=0;k<3;k++)I.pv[k]+=(PZ[k]-I.pv[k])*Math.min(1,dt*2.2);
 if(armsFree){const a0=u.arms[0],a1=u.arms[1],br=.015*Math.sin(t*1.7+u.ph)*iw;a0.rotation.x+=I.pv[0]*iw;a1.rotation.x+=I.pv[0]*iw;a0.rotation.z=I.az[0]+I.pv[1]*iw-br;a1.rotation.z=I.az[1]-I.pv[1]*iw+br;a0.userData.eb=(a0.userData.eb||0)+I.pv[2]*iw;a1.userData.eb=(a1.userData.eb||0)+I.pv[2]*iw}
 /* hlava: obzeranie sa, pohľad na hráča, kývnutie na pozdrav */
 const e=g.matrixWorld.elements,x=e[12],z=e[14],dP=u.isMe?99:Math.hypot(PLP[0]-x,PLP[1]-z);
 /* výraz tváre (v271): žmurká, pri reči hýbe ústami, usmeje sa pri pozdrave a keď pri ňom stojíš */
 const FC=u.face;if(FC){if(!I.bl||t>I.bl){I.bl=t+2.2+Math.random()*3.8;I.be=t+.13}let fr=t<I.be?1:0;
  if(u.spk!=null&&t-u.spk<.2)fr=Math.sin(t*17+u.ph)>-.1?3:0;else if(I.sm>t&&fr!==1)fr=2;if(fr!==I.fr){I.fr=fr;FC.m.material=FC.F.mats[fr]}}
 const H=u.head;if(!H)return;let look=false;
 if(dP<7&&(!u.talk||dP<3.2)){let yw=g.rotation.y+(g.parent&&g.parent.rotation?g.parent.rotation.y:0),d=Math.atan2(PLP[0]-x,PLP[1]-z)-yw;while(d>Math.PI)d-=6.2832;while(d<-Math.PI)d+=6.2832;if(Math.abs(d)<1.9){look=true;I.tg[0]=Math.max(-1.05,Math.min(1.05,d));I.tg[1]=.04;if(dP<3.2&&t-I.gr>25){I.gr=t;I.nod=t+.35;I.sm=t+3}if(dP<4.2&&!u.talk)I.sm=Math.max(I.sm||0,t+.4)}}
 if(!look&&t>I.nl){I.nl=t+2.5+Math.random()*4.5;const m=u.talk?.25:u.isMe?.35:.65;I.tg[0]=(Math.random()*2-1)*m;I.tg[1]=-.04+Math.random()*.14}
 const kf=1-w*.7;I.lk[0]+=(I.tg[0]*kf-I.lk[0])*Math.min(1,dt*3.2);I.lk[1]+=(I.tg[1]*kf-I.lk[1])*Math.min(1,dt*3.2);
 const nk=(t-I.nod)/.8,nod=nk>0&&nk<1?.34*Math.sin(Math.PI*nk):0,ha=u.hadd||[0,0];H.rotation.y=I.lk[0]+ha[1];H.rotation.x=I.lk[1]+nod+ha[0]}
/* ---------- odev postáv podľa šatníka a krajčíra (v123) ---------- */
let DGC=null;
function dgeo(){if(DGC)return DGC;const arc=(rt,rb,h,a0,len,seg)=>new T.CylinderGeometry(rt,rb,h,seg||8,1,true,a0,len);
 DGC={box:new T.BoxGeometry(1,1,1),cyl:new T.CylinderGeometry(1,1,1,12),cone:new T.ConeGeometry(1,1,8),sph:new T.SphereGeometry(1,8,6),tor:new T.TorusGeometry(1,.1,5,18),torF:new T.TorusGeometry(1,.2,6,16),
  tube:new T.CylinderGeometry(1,1,1,10,1,true),bell:new T.CylinderGeometry(.45,1,1,9,1,true),
  frontL:arc(.275,.33,.86,-.62,.62),frontR:arc(.275,.33,.86,0,.62),backL:arc(.275,.33,.86,Math.PI-.62,.62),backR:arc(.275,.33,.86,Math.PI,.62),
  flapF:arc(.345,.36,.3,-.5,1),flapB:arc(.345,.36,.3,Math.PI-.5,1),
  mantle:arc(.3,.52,1.52,Math.PI*.5,Math.PI,10),mantleS:arc(.3,.44,1.1,Math.PI*.5,Math.PI,10),mantleW:arc(.31,.6,1.56,Math.PI*.42,Math.PI*1.16,12),cape:new T.CylinderGeometry(.14,.46,.36,12,1,true),hood:new T.SphereGeometry(.2,8,6,0,6.3,0,1.7),
  apronM:arc(.34,.44,.5,-.75,1.5),apronF:arc(.3,.47,.68,-.8,1.6),hoodU:new T.SphereGeometry(.235,14,10,Math.PI/2+1.2,Math.PI*2-2.4,0,2.3)};
 return DGC}
function person(d,role,isMe,femO){
 role=role||"head";const g=new T.Group(),G=dgeo(),PI=Math.PI;let o={};try{o=isMe&&d.outfit?d.outfit:outfitOf(d,role)}catch(e){}o=o||{};
 const pp=d.pp||(role==="head"?d.head:role==="spouse"?d.spouse:null);
 const dc=(()=>{try{return DC(d.id)}catch(e){return"#7a4a2a"}})();
 const fem=femO!=null?!!femO:(pp&&pp.gender?pp.gender==="f":(d.head&&d.head.gender)==="f"),kid=role==="kid";
 const icol=(id,def)=>{try{const it=id&&OUT[id];if(!it)return def;if(typeof itemCol==="function"&&(it.col||def==null))return itemCol(d,id,role);return it.col?(it.col==="dyn"?dc:it.col):def}catch(e){return def}};
 const tl=id=>{try{return(typeof tailorOf==="function"&&role==="head"&&tailorOf(d,id))||{}}catch(e){return{}}};
 const dk=(c,t)=>mixHex(c,"#000000",t),lt=(c,t)=>mixHex(c,"#ffffff",t);
 const GOLD="#e2b85a",SILV="#d0d5dc",FUR="#5a3a22",ERM="#f4f0e6";
 /* farby tela: pleť a vlasy z profilu */
 let skin="#e8c4a0",hair=null,beard=false,hs=0,bs=null,eyes=null;const age=pp?(pp.age|0):0;
 try{if(pp&&pp.look){skin=SKIN[pp.look.skin]||skin;hair=hairOf(pp);beard=!fem&&age>=18&&pp.look.beard>0;hs=pp.look.hair|0;bs=beard?pp.look.beard|0:0;eyes=EYEC[pp.look.eyes]||null}}catch(e){}
 if(!hair){const hs=["#5a3a20","#2b2117","#8a6a3a","#c9a24a","#6b4423"];hair=age>58?"#cfcfcf":hs[(Math.abs(d.id|0)+(fem?2:0)+(kid?1:0))%5];beard=!fem&&age>34}
 /* odev */
 const bid=OUT[o.body]?o.body:"b0",B0=OUT[bid]||{};let col=B0.col==="dyn"?dc:B0.col||"#cdbf9e";try{if(typeof dyeCol==="function")col=dyeCol(d,role,bid,col)}catch(e){}
 const long=fem||(!kid&&!["b0","b1","b7","b3"].includes(bid)),robe=long&&!fem;
 const F=OUT[o.feet]||{},fc=F.col||"#6b4423",GL=o.glove&&o.glove!=="r0"?OUT[o.glove]||{}:null;
 const f=figure({age,body:col,fem,robe,skin,hair,beard,hs,bs,eyes,feet:fc,legs:bid==="b0"?"#6a5a44":dk(col,.45),glove:GL?GL.col||"#8a6a4a":null,boots:{tall:F.tall?1:0,beak:F.beak?1:0,gold:F.gold?1:0,spur:F.spur?1:0},dr:{sh:"#ece4d2"}});
 while(f.children.length)g.add(f.children[0]);g.userData=f.userData;const arms=g.userData.arms;
 const Bd=[],AL=[],AR=[];const add=(L,geo,c,p,s,r)=>L.push([geo,c,p,s||[1,1,1],r||[0,0,0]]);
 const ring=(L,y,r,h,c)=>add(L,G.cyl,c,[0,y,0],[r,h,r]);
 const dots=(L,y,r,n,c,sz,ph)=>{for(let i=0;i<n;i++){const a=i/n*6.283+(ph||0);add(L,G.sph,c,[Math.sin(a)*r,y,Math.cos(a)*r],[sz,sz,sz])}};
 const hemY=long?.05:.66,hemR=long?(fem?.45:.365):.35,rAt=y=>long?(fem?1:.8)*(y<.25?.44-.16*y:y<.7?.4-.222*(y-.25):.3-.227*(y-.7)):.33;
 const hem=(c,h)=>ring(Bd,hemY,hemR,h||.08,c),cuffs=(c,h,r)=>[AL,AR].forEach(L=>add(L,G.cyl,c,[0,-.56,0],[r||.094,h||.07,r||.094])),collar=(c,r,h,y)=>ring(Bd,y||1.6,r||.14,h||.06,c);
 const ermDots=(L,y,r,n)=>dots(L,y,r,n,"#1d1d22",.016);
 const mantle=(c,geo,y)=>add(Bd,geo||G.mantle,c,[0,y||.86,-.02]);
 if(bid==="b1"){const t=B0.trim||"#5a3a20";hem(t);cuffs(t);collar(t)}
 else if(bid==="b7"){const c2=lt(dc,.72)==="#ffffff"?"#e8dcc0":"#eadfc4";add(Bd,G.frontL,dc,[0,1.14,0]);add(Bd,G.frontR,c2,[0,1.14,0]);add(Bd,G.backL,c2,[0,1.14,0]);add(Bd,G.backR,dc,[0,1.14,0]);add(Bd,G.flapF,dk(dc,.1),[0,.6,0]);add(Bd,G.flapB,dk(dc,.1),[0,.6,0]);
   add(Bd,G.box,GOLD,[0,1.3,.325],[.13,.16,.02]);add(Bd,G.box,dc,[0,1.3,.336],[.1,.13,.02]);collar(FUR,.2,.1,1.58);hem(dk(col,.25),.05)}
 else if(bid==="b2"){if(!fem)mantle(dk(col,.18));collar("#efe8d6",.2,.05,1.6);add(Bd,G.cone,"#efe8d6",[0,1.5,.2],[.1,.16,.03],[.25,0,PI]);hem(dk(col,.3),.06);cuffs(dk(col,.3))}
 else if(bid==="b3"){hem(FUR,.1);cuffs(FUR,.09,.1);collar(FUR,.19,.1,1.58);add(Bd,G.box,FUR,[0,1.2,.305],[.07,.72,.03])}
 else if(bid==="b8"){collar(dk(col,.2),.125,.14,1.66);hem(lt(col,.3),.07);ring(Bd,.9,.325,.07,dk(col,.4));
   [AL,AR].forEach(L=>{add(L,G.bell,col,[0,-.5,0],[.2,.38,.2]);add(L,G.bell,lt(col,.38),[0,-.51,0],[.18,.35,.18]);for(let i=0;i<6;i++){const a=i/6*6.283;add(L,G.cone,col,[Math.sin(a)*.19,-.69,Math.cos(a)*.19],[.06,.12,.06],[PI,0,0])}})}
 else if(bid==="b4"){hem(GOLD,.07);cuffs(GOLD,.05);collar(GOLD,.135,.05);[.3,.62].forEach((y,k)=>dots(Bd,y,rAt(y)+.005,9,GOLD,.028,k*.35));[1.08,1.34].forEach((y,k)=>dots(Bd,y,.312,8,GOLD,.026,k*.39+.2));ring(Bd,.92,.322,.06,GOLD)}
 else if(bid==="b5"||bid==="b9"){mantle(bid==="b9"?"#8e1424":dk(col,.2),G.mantleW,.88);hem(ERM,.12);ermDots(Bd,hemY+.01,hemR+.004,12);
   if(bid==="b9"){add(Bd,G.cape,ERM,[0,1.5,0]);ermDots(Bd,1.42,.4,10);ermDots(Bd,1.54,.24,7);ring(Bd,1.66,.115,.05,GOLD)}else{collar(ERM,.21,.12,1.58);ermDots(Bd,1.58,.214,8)}cuffs(ERM,.09,.1)}
 /* krajčír: lem a výšivka */
 {const t=tl(bid);if(t.trim&&t.trim!=="none"){const c=t.trim==="gold"?GOLD:SILV;ring(Bd,hemY+(long?.1:.07),hemR-.004,.03,c);[AL,AR].forEach(L=>add(L,G.cyl,c,[0,-.5,0],[.092,.025,.092]));ring(Bd,1.64,.125,.025,c)}
  if(t.emb==="arms"){add(Bd,G.box,GOLD,[-.12,1.34,.292],[.1,.12,.02],[0,-.38,0]);add(Bd,G.box,dc,[-.12,1.34,.3],[.075,.095,.02],[0,-.38,0])}else if(t.emb==="init")add(Bd,G.box,"#f1e6c8",[-.12,1.36,.295],[.07,.07,.015],[0,-.38,0])}
 /* zbroj */
 if(o.armor&&o.armor!=="a0"){const a=o.armor;if(a==="a1"){ring(Bd,1.2,.325,.72,"#b8a782");for(let i=0;i<10;i++){const an=i/10*6.283;add(Bd,G.box,"#8a7a5a",[Math.sin(an)*.327,1.2,Math.cos(an)*.327],[.012,.7,.012])}}
  else if(a==="a2"){ring(Bd,1.12,.325,.92,"#8a8e98");ring(Bd,.66,.34,.05,"#6a6e78");ring(Bd,1.6,.16,.1,"#8a8e98")}
  else{ring(Bd,1.2,.33,.7,"#b8c0c8");add(Bd,G.sph,"#c8d0d8",[0,1.36,.1],[.27,.22,.24]);[-.36,.36].forEach(x=>add(Bd,G.sph,"#aab2bc",[x,1.56,0],[.13,.1,.13]));ring(Bd,.82,.35,.14,"#9aa2ac");ring(Bd,1.62,.14,.08,"#9aa2ac");ring(Bd,.95,.335,.04,GOLD)}}
 /* opasok */
 {const bt=OUT[o.belt]||null,by=.93,br=.318;if(bt||bid==="b0"){const c=bt?bt.col||"#6b4423":"#b8a070";ring(Bd,by,br,bt&&bt.s==="belt"&&o.belt!=="g0"?.07:.04,c);
   if(bt){if(bt.purse){add(Bd,G.sph,dk(c,.15),[.24,.8,.2],[.07,.09,.06]);add(Bd,G.box,GOLD,[.24,.87,.2],[.03,.02,.03])}if(bt.studs)dots(Bd,by,br+.004,10,"#c9a24a",.022);if(bt.bells){dots(Bd,by-.07,br+.01,8,GOLD,.026);add(Bd,G.box,GOLD,[0,by,br+.01],[.07,.08,.02])}if(bt.gems){["#b8362c","#2f5bb0","#2f7d46","#b8362c","#2f5bb0","#2f7d46","#b8362c","#2f5bb0"].forEach((c2,i)=>{const a=i/8*6.283;add(Bd,G.sph,c2,[Math.sin(a)*(br+.008),by,Math.cos(a)*(br+.008)],[.026,.026,.026])});add(Bd,G.box,GOLD,[0,by,br+.012],[.08,.09,.02])}
    if(o.belt==="g1"||o.belt==="g2")add(Bd,G.box,"#c9a24a",[0,by,br+.008],[.06,.07,.02])}}}
 /* rukavice, sokol, prsteň */
 if(GL){if(GL.gold)[AL,AR].forEach(L=>add(L,G.cyl,GOLD,[0,-.6,0],[.084,.025,.084]));if(GL.falcon){add(AL,G.sph,"#7a5a3a",[0,-.78,.06],[.07,.1,.09]);add(AL,G.sph,"#5a4028",[0,-.9,.1],[.045,.045,.05]);add(AL,G.cone,"#d9b860",[0,-.9,.16],[.015,.04,.015],[PI/2,0,0]);add(AL,G.box,"#4a3220",[0,-.7,-.02],[.05,.02,.14],[-.5,0,0])}}
 {const rn=OUT[o.ring];if(rn&&o.ring!=="n0"){add(AR,G.sph,rn.col||GOLD,[.05,-.68,.04],[.022,.022,.022]);if(rn.stone)add(AR,G.sph,rn.stone,[.065,-.68,.05],[.016,.016,.016])}}
 /* pri boku a remeslo */
 {const sd=OUT[o.side];if(sd&&o.side!=="s0"){if(sd.rosary){for(let i=0;i<6;i++)add(Bd,G.sph,"#6b4423",[-.27,.86-i*.06,.2],[.02,.02,.02]);add(Bd,G.box,"#3a2414",[-.27,.47,.2],[.06,.02,.02]);add(Bd,G.box,"#3a2414",[-.27,.47,.2],[.02,.1,.02])}
   else{const len=(sd.len||12)/34,c=sd.col||"#5a3a20",hc=sd.gold?GOLD:"#b8bcc4",x=-.34,ty=.92,rz=-.22;add(Bd,G.box,c,[x-len*.11,ty-len/2,.02],[.05,len,.035],[0,0,rz]);add(Bd,G.box,hc,[x+.005,ty+.02,.02],[.16,.03,.04],[0,0,rz]);add(Bd,G.box,sd.gold?"#7a1f2b":"#3a2414",[x+.022,ty+.1,.02],[.035,.14,.035],[0,0,rz]);add(Bd,G.sph,hc,[x+.04,ty+.18,.02],[.03,.03,.03])}}
  const tt=o.tool;if(tt==="t1"){add(Bd,G.box,"#c9b07a",[.3,.78,.12],[.03,.16,.12]);add(Bd,G.sph,"#6b4423",[.26,.8,.24],[.06,.08,.05])}else if(tt==="t2"){add(Bd,G.box,"#5a2a1a",[.31,.76,.1],[.05,.2,.15]);add(Bd,G.box,GOLD,[.335,.76,.1],[.01,.14,.1]);add(Bd,G.tor,"#3a2414",[.07,1.44,.3],[.035,.035,.035]);add(Bd,G.tor,"#3a2414",[-.03,1.44,.3],[.035,.035,.035])}
  else if(tt==="t3"){add(Bd,G.cyl,"#5a3a20",[.33,.72,.05],[.018,.5,.018],[0,0,.2]);add(Bd,G.sph,"#8a8e98",[.38,.96,.05],[.06,.06,.06])}else if(tt==="t4"){add(Bd,G.box,"#3a2414",[.33,.74,.08],[.04,.3,.03],[0,0,.15]);add(Bd,G.cyl,"#b8bcc4",[.355,.9,.08],[.035,.015,.035])}}
 /* štít na ľavej ruke */
 if(o.shield&&o.shield!=="e0"){const m=o.shield==="e2";add(AL,G.box,m?"#b8bcc4":"#6b4423",[-.1,-.36,.02],[.04,.5,.4]);add(AL,G.box,dc,[-.125,-.36,.02],[.02,.44,.34]);add(AL,G.box,lt(dc,.6),[-.137,-.36,.02],[.012,.44,.07]);if(m)add(AL,G.sph,GOLD,[-.14,-.36,.02],[.03,.05,.05])}
 /* plášť */
 if(o.cloak&&o.cloak!=="c0"){const c=icol(o.cloak,"#6b5a46"),id=o.cloak;if(id==="c3"){add(Bd,G.cape,c,[0,1.47,0],[.95,.95,.95]);ring(Bd,1.3,.435,.025,lt(c,.35))}
  else{mantle(dk(c,.12),id==="c2"?G.mantleW:G.mantle,id==="c1"?.95:.88);if(id==="c1"){add(Bd,G.hood,dk(c,.25),[0,1.62,-.12],[1,1,1],[-1.25,0,0]);ring(Bd,1.6,.17,.07,c)}else{ring(Bd,1.6,.17,.05,c);add(Bd,G.sph,GOLD,[.12,1.56,.2],[.04,.04,.03]);add(Bd,G.sph,GOLD,[-.12,1.56,.2],[.04,.04,.03]);add(Bd,G.box,GOLD,[0,1.56,.22],[.24,.02,.015])}}}
 /* pokrývka hlavy */
 {const h=o.hat;if(h&&h!=="h0"&&OUT[h]){const hy=2.0;
  if(h==="h1"){ring(Bd,hy,.31,.03,"#5a4632");ring(Bd,hy+.09,.17,.17,"#5a4632");ring(Bd,hy+.03,.175,.04,"#3a2a1c")}
  else if(h==="h4"||h==="h8"){const c=h==="h8"?icol(h,dc):"#7a2f2f";add(Bd,G.torF,c,[0,hy+.02,0],[.19,.19,.3],[PI/2,0,0]);ring(Bd,hy+.06,.16,.08,dk(c,.15));if(h==="h4"){add(Bd,G.box,c,[.2,1.82,-.02],[.06,.42,.1],[0,0,-.12])}else{add(Bd,G.box,c,[.1,1.86,-.24],[.09,.5,.05],[.3,0,-.1]);add(Bd,G.box,c,[.12,1.52,-.34],[.07,.3,.04],[.15,0,-.1])}}
  else if(h==="h2"){add(Bd,G.sph,"#3a2a4a",[.03,hy+.04,0],[.26,.09,.25],[0,0,-.18]);ring(Bd,hy-.01,.2,.035,"#2a1c36");add(Bd,G.box,"#2f7d46",[.17,hy+.2,-.06],[.03,.34,.07],[-.3,0,-.45]);add(Bd,G.sph,"#2f5bb0",[.26,hy+.33,-.11],[.035,.045,.03])}
  else if(h==="h5"){ring(Bd,hy+.07,.22,.17,"#5a1a3a");ring(Bd,hy,.235,.05,"#3f1028");add(Bd,G.sph,GOLD,[0,hy+.06,.225],[.04,.04,.02]);add(Bd,G.sph,"#c0262a",[0,hy+.06,.24],[.024,.024,.02])}
  else if(h==="h3"||h==="h6"||h==="h7"){add(Bd,G.tor,GOLD,[0,1.98,0],[.185,.185,.3],[PI/2,0,0]);
   if(h!=="h3"){add(Bd,G.tube,GOLD,[0,2.03,0],[.185,.08,.185]);const n=h==="h7"?8:6;for(let i=0;i<n;i++){const a=i/n*6.283;add(Bd,G.cone,GOLD,[Math.sin(a)*.185,2.11,Math.cos(a)*.185],[.03,.1,.03]);add(Bd,G.sph,h==="h7"?(i%2?"#b8362c":"#2f5bb0"):"#f4f0e6",[Math.sin(a)*.185,h==="h7"?2.03:2.17,Math.cos(a)*.19],[.02,.02,.02])}
    if(h==="h7"){add(Bd,G.sph,"#8e1424",[0,2.06,0],[.17,.1,.17]);add(Bd,G.tor,GOLD,[0,2.07,0],[.18,.14,.25],[0,0,0]);add(Bd,G.tor,GOLD,[0,2.07,0],[.18,.14,.25],[0,PI/2,0]);add(Bd,G.sph,GOLD,[0,2.23,0],[.03,.03,.03]);add(Bd,G.box,GOLD,[0,2.3,0],[.02,.1,.02]);add(Bd,G.box,GOLD,[0,2.31,0],[.07,.02,.02])}}}
  else if(h==="h9"){const c=icol(h,"#6b2a2a");ring(Bd,hy+.04,.235,.15,"#6b4423");add(Bd,G.sph,c,[0,hy+.12,0],[.2,.1,.2]);dots(Bd,hy+.04,.238,9,"#3a2210",.03)}
  else if(h==="h10"){ring(Bd,hy,.4,.025,"#d9b860");ring(Bd,hy+.07,.18,.13,"#d9b860");ring(Bd,hy+.02,.185,.03,"#8a6a3a")}
  else if(h==="h11"){const c=icol(h,"#e2b85a");[-1,1].forEach(sx=>add(Bd,G.cone,c,[sx*.15,hy+.12,0],[.085,.36,.085],[0,0,-sx*.5]));add(Bd,G.sph,dk(c,.1),[0,hy-.02,0],[.2,.09,.2]);add(Bd,G.box,"#f6f1e6",[0,1.86,-.24],[.44,.6,.015],[.18,0,0])}
  else if(h==="h12"){const c=icol(h,dc);add(Bd,G.torF,c,[0,hy,0],[.17,.17,.34],[PI/2,0,.1]);add(Bd,G.torF,lt(c,.15),[0,hy+.07,0],[.14,.14,.3],[PI/2,0,-.1]);add(Bd,G.sph,c,[0,hy+.1,0],[.12,.08,.12]);add(Bd,G.box,"#f6f1e6",[0,1.76,-.22],[.3,.5,.015],[.15,0,0])}
  else{ring(Bd,hy+.04,.22,.14,icol(h,"#3a2a4a"))}}}
 /* šperky na krku */
 const chain=(c,r,y,tube)=>add(Bd,tube?G.torF:G.tor,c,[0,y||1.5,.07],[r,r,r],[PI/2+.36,0,0]);
 const cy=(r,y)=>(y||1.5)-.34*r-.02,cz=r=>.07+.94*r;
 {const j=o.jewel;if(j&&j!=="j0"&&OUT[j]){const r=.215;
  if(j==="j1")chain(SILV,r);else if(j==="j2"){chain(GOLD,r);add(Bd,G.cyl,GOLD,[0,cy(r)-.06,cz(r)+.03],[.055,.02,.055],[PI/2,0,0])}
  else if(j==="j4"){add(Bd,G.sph,GOLD,[.1,1.44,.275],[.045,.045,.02]);add(Bd,G.sph,"#c0262a",[.1,1.44,.29],[.028,.028,.02])}
  else if(j==="j5"){chain(GOLD,r);add(Bd,G.cyl,"#2f7d46",[0,cy(r)-.07,cz(r)+.03],[.06,.02,.06],[PI/2,0,0]);add(Bd,G.box,"#b8362c",[0,cy(r)-.07,cz(r)+.045],[.07,.02,.01]);add(Bd,G.box,"#b8362c",[0,cy(r)-.07,cz(r)+.045],[.02,.07,.01])}
  else if(j==="j3"){for(let i=0;i<16;i++){const a=i/16*6.283,rr=.2;add(Bd,G.sph,i%4===0?"#c0262a":"#f6f2ea",[Math.sin(a)*rr,1.5-.34*rr*Math.cos(a),.07+.94*rr*Math.cos(a)],[.024,.024,.024])}}
  else if(j==="j6"){chain(GOLD,.2,1.52,1);["#b8362c","#2f5bb0","#2f7d46","#b8362c","#2f5bb0"].forEach((c,i)=>{const a=(i-2)*.42,rr=.2;add(Bd,G.sph,c,[Math.sin(a)*rr*1.12,1.52-.34*rr*Math.cos(a),.07+.94*rr*Math.cos(a)+.045],[.028,.028,.02])})}
  else if(j==="j7"){chain("#8a6a3a",r);add(Bd,G.box,GOLD,[0,cy(r)-.06,cz(r)+.03],[.06,.08,.03]);add(Bd,G.sph,"#b8d0e0",[0,cy(r)-.06,cz(r)+.05],[.018,.024,.01])}
  else if(j==="j8"){chain(GOLD,r);add(Bd,G.cyl,"#8e1424",[0,cy(r)-.07,cz(r)+.03],[.06,.025,.06],[PI/2,0,0])}
  else if(j==="j9"){chain("#6b4423",r);add(Bd,G.sph,"#f4ecdc",[0,cy(r)-.06,cz(r)+.03],[.055,.06,.02])}
  else if(j==="j10"){for(let i=0;i<14;i++){const a=i/14*6.283,rr=.22;add(Bd,G.sph,"#d98a2a",[Math.sin(a)*rr,1.5-.34*rr*Math.cos(a),.07+.94*rr*Math.cos(a)],[.022,.022,.022])}add(Bd,G.box,"#8a5a1a",[0,cy(.22)-.08,cz(.22)+.02],[.02,.09,.015]);add(Bd,G.box,"#8a5a1a",[0,cy(.22)-.06,cz(.22)+.02],[.06,.02,.015])}
  else chain(GOLD,r)}}
 /* úradná reťaz podľa funkcie, ako na portréte */
 try{if(role==="head"&&typeof homeOffice==="function"&&!d.royal){const of=homeOffice(d);if(of){const gold=["sudca","kapitan","purkmister"].includes(of.id),c1=gold?"#e8c25a":"#e4e8ee",c2=gold?"#7a560f":"#6a707a",big=of.id==="purkmister";g.userData.office=of.id;
   (big?[[.275,1.52],[.305,1.46]]:[[.285,1.5]]).forEach((q,k)=>{const r=q[0],y0=q[1];add(Bd,G.tor,c2,[0,y0,.07],[r,r,r],[PI/2+.36,0,0]);for(let i=0;i<22;i++){const a=i/22*6.283;if(Math.cos(a)<-.55)continue;add(Bd,G.box,c1,[Math.sin(a)*r,y0-.34*r*Math.cos(a)+.004,.07+.94*r*Math.cos(a)],[.05,.03,.034],[.36,a,0])}});
   const r=big?.305:.285,my=(big?1.46:1.5)-.34*r-.1,mz=.07+.94*r+.012;add(Bd,G.cyl,c2,[0,my,mz],[.085,.02,.085],[PI/2,0,0]);add(Bd,G.cyl,c1,[0,my,mz+.008],[.07,.02,.07],[PI/2,0,0]);add(Bd,G.box,c2,[0,my,mz+.022],[.05,.05,.008],[0,0,PI/4]);add(Bd,G.box,c1,[0,my+.085,mz-.01],[.03,.07,.02]);if(big)add(Bd,G.sph,"#b8362c",[0,my+.1,mz+.01],[.022,.022,.018])}}}catch(e){}
 const mk=(L,par)=>{if(!L.length)return;const m=new T.Mesh(mergeParts(L),FIGM);m.castShadow=true;par.add(m)};
 try{const st=g.userData.st=Object.assign({},g.userData.st||{amp:1,rate:1,arm:1,hunch:0,stiff:0});if(age>58){st.amp*=.72;st.rate*=.85;st.arm*=.55;st.hunch=.11}else if(age>45){st.amp*=.9;st.hunch=.03}if(kid){st.rate*=1.25;st.amp*=1.08}}catch(e){}
 {const HD=g.userData.head;if(HD){mk(Bd.filter(pt=>!(pt[2][1]>1.7)),g);mk(Bd.filter(pt=>pt[2][1]>1.7).map(pt=>[pt[0],pt[1],[pt[2][0],pt[2][1]-HEADY,pt[2][2]],pt[3],pt[4]]),HD)}else mk(Bd,g)}
 if(arms)[[AL,arms[0]],[AR,arms[1]]].forEach(([L,a])=>{const ud=a.userData||{};if(!ud.fa){mk(L,a);return}mk(L.filter(pt=>pt[2][1]>-.34),ud.ua);mk(L.filter(pt=>pt[2][1]<=-.34).map(pt=>[pt[0],pt[1],[pt[2][0],pt[2][1]+ELB,pt[2][2]],pt[3],pt[4]]),ud.fa)});
 {const r0=g.userData.rig;if(r0)r0.scale.set(1,1,1);const hh=(n,k)=>{const v=Math.sin(n*12.9898+k*78.233)*43758.5453;return v-Math.floor(v)},sd=(d.id|0)*31+(pp&&pp.id!=null?String(pp.id).length*7+(parseInt(pp.id,36)||0)%997:0)+role.length*13,bw=.93+hh(sd,1)*.15,bh=kid?1:age>58?.95+hh(sd,2)*.04:.95+hh(sd,2)*.09;const rg=rigify(g);rg.scale.set(bw,bh,(bw+1)/2)}return g}

/* ---------- okná v 3D: trh a dielňa ---------- */
const STALLS=[{n:"Drevo a nábytok",v:"Stolár",c:"#a8583a",g:["drevo","stolicka","skrina","voz"]},{n:"Železo a zbroj",v:"Železiar",c:"#4a5568",g:["zelezo","naradie","mec","brnenie"]},{n:"Obilie a pečivo",v:"Pekárka",c:"#c9971a",g:["obilie","muka","jemna","med","chlieb","kolac","pernik","olej"]},{n:"Pivo a víno",v:"Vinár",c:"#7a2740",g:["chmel","hrozno","pivo","medovina","lezak","kpivo","vino","vyberove","vinovica"]},{n:"Súkno a šaty",v:"Súkenník",c:"#2f5bb0",g:["vlna","latka","saty","gobelin","hodvab"]},{n:"Byliny a lieky",v:"Bylinkárka",c:"#2f7d46",g:["byliny","mast","elixir","teriak"]},{n:"Hrnce a sklo",v:"Hrnčiar",c:"#b8562c",g:["hlina","hrnce","dzban","kachle","sklo","pohar","vitraz"]},{n:"Kože a obuv",v:"Garbiar",c:"#6b4423",g:["koza","usne","cizmy","sedlo"]},{n:"Zlato a klenoty",v:"Zlatníčka",c:"#6d3f92",g:["striebro","zlato","prsten","kalich","relikviar","drahokamy"]},{n:"Knihy, korenie a soľ",v:"Kramár",c:"#b8362c",g:["pergamen","tlac","kniha","biblia","rukopis","korenie","sol"]}];
function stallGoods(i){const used={};STALLS.forEach(q=>q.g.forEach(g=>used[g]=1));const st=STALLS[i];return st.g.concat(i===STALLS.length-1?Object.keys(GOODS).filter(g=>!used[g]):[]).filter(g=>GOODS[g]&&S.mkt[g])}
function marketHTML(si){
 const p=P(),C=CC(),ST=si!=null?STALLS[si]:null,hd=ST?`Stánok · ${ST.n}`:`Trh · ${C.n}`;if(!hasLic(S.ci))return`<h3>${hd}</h3><p>${ST?ST.v+" krúti hlavou: bez obchodného práva ti v tomto meste nič nepredá ani nekúpi.":"V tomto meste nemáš obchodné právo."} Kúpiš ho v karte Svet.</p>`;
 const gl=ST?stallGoods(si):Object.keys(GOODS).filter(g=>S.mkt[g]);if(ST&&!gl.length)return`<h3>${hd}</h3><p>${ST.v} dnes nemá čo ponúknuť.</p>`;
 const rows=gl.map(g=>{const G=GOODS[g],have=Math.floor(p.wh[g]||0),stock=Math.floor(S.mkt[g].s),b=bp(g,p),s2=sp(g,p);
  return`<tr><td><b>${G.n}</b><small>${G.raw?"surovina":"výrobok"} · na trhu ${stock} ks</small></td><td class="n">${fmt(b)}</td><td><button class="btn sm" data-m3="buy" data-g="${g}" data-n="1" ${p.money<b||stock<3?"disabled":""}>+1</button><button class="btn sm" data-m3="buy" data-g="${g}" data-n="10" ${p.money<b*10||stock<12?"disabled":""}>+10</button></td><td class="n">${have||"–"}</td><td class="n">${fmt(s2)}</td><td><button class="btn sm" data-m3="sell" data-g="${g}" data-n="1" ${have<1?"disabled":""}>−1</button><button class="btn sm" data-m3="sell" data-g="${g}" data-n="all" ${have<1?"disabled":""}>všetko</button></td></tr>`}).join("");
 return`<h3>${hd}</h3>${ST?`<p><i>${ST.v}:</i> „${gl.some(g=>S.mkt[g].s<12)?"Niečoho mám dnes málo, tak sa ponáhľaj.":"Pozri si tovar, lepší v meste nenájdeš."}“</p>`:""}<p class="m3money">Pokladnica: <b>${zl(Math.round(p.money))}</b></p><div class="m3scroll"><table><thead><tr><th>Tovar</th><th>Kúpa</th><th></th><th>Máš</th><th>Predaj</th><th></th></tr></thead><tbody>${rows}</tbody></table></div><p class="m3note">Ceny sa pri každom kuse posúvajú${ST?" a sú rovnaké ako v tržnici. Iný tovar majú ostatné stánky; všetko naraz nájdeš v budove Trh":""}. <button class="btn sm ghost" data-m3="tab" data-v="trh">Otvoriť celú kartu Trh</button></p>`}
function shopHTML(id){
 const p=P(),b=S.bld.find(v=>v.id===id);if(!b)return"<p>Dielňa tu už nestojí.</p>";const nm=(BT[b.type]||{}).n||b.type;let e={profit:0};try{e=estimate(p,b)}catch(x){}
 const sl=slots(b);
 return`<h3>${nm} · úroveň ${b.lvl}</h3><p class="m3money">Pokladnica: <b>${zl(Math.round(p.money))}</b></p>
 <dl class="m3dl"><dt>Vyrába</dt><dd>${GOODS[b.prod]?GOODS[b.prod].n:"–"}</dd><dt>Robotníci</dt><dd>${b.w} z ${sl}</dd><dt>Odhad zisku</dt><dd>${e.profit>=0?"+":""}${zl(Math.round(e.profit))} za štvrťrok</dd></dl>
 ${(()=>{try{const rs=(RECIPES[b.type]||[]).filter(r=>r.l<=b.lvl);if(rs.length<2)return"";return`<p class="m3note" style="margin:0 0 4px">Čo má dielňa vyrábať:</p><div class="m3btns" style="margin-bottom:10px">${rs.map(r=>`<button class="btn sm ${r.o===b.prod?"pri":""}" data-m3="prod" data-b="${b.id}" data-g="${r.o}">${GOODS[r.o].n}</button>`).join("")}</div>`}catch(e){return""}})()}<div class="m3btns"><button class="btn sm pri" data-m3="hire" data-b="${b.id}" ${b.w>=sl||p.money<HIRE?"disabled":""}>Najať robotníka · ${zl(HIRE)}</button><button class="btn sm" data-m3="fire" data-b="${b.id}" ${b.w<1?"disabled":""}>Prepustiť</button>${b.lvl<3?`<button class="btn sm" data-m3="upg" data-b="${b.id}" ${p.money<upcost(b)?"disabled":""}>Rozšíriť na úroveň ${b.lvl+1} · ${zl(upcost(b))}</button>`:""}<button class="btn sm ghost" data-m3="tab" data-v="dielne">Otvoriť kartu Dielne</button></div><p class="m3note">Po rozšírení sa dielňa v meste prestavia, keď zavrieš toto okno.</p>`}
function seatHTML(){const p=P(),cid=S.ci,home=cid===p.city;let lv=p.house|0,hu=p.hu||[];try{if(!home&&window.SIDLA){lv=SIDLA.lvl(cid)|0;hu=((S.seats||{})[cid]||{}).hu||[]}}catch(e){}
 const nh=HOUSES[lv+1];let h=`<h3>${home?"Sídlo rodu":"Dom rodu"} · ${HOUSES[lv]?HOUSES[lv].n:""}</h3><p class="m3money">Pokladnica: <b>${zl(Math.round(p.money))}</b></p>`;
 h+=nh?`<div class="m3btns" style="margin-bottom:10px"><button class="btn sm pri" data-m3="${home?"house":"seatup"}" ${p.money<nh.c?"disabled":""}>Prestavať na ${nh.n} · ${zl(nh.c)}</button></div>`:`<p class="m3note">Vyššie sídlo už nejestvuje.</p>`;
 if(home){const rows=Object.keys(HU).map(k=>{const u=HU[k],has=hu.includes(k);return`<tr><td><b>${u.n}</b><small>${u.d}</small></td><td class="n">${has?"máš":`<button class="btn sm" data-m3="hubuy" data-u="${k}" ${lv<u.h||p.money<u.c?"disabled":""}>${lv<u.h?"treba "+HOUSES[u.h].n:zl(u.c)}</button>`}</td></tr>`}).join("");h+=`<p class="m3note" style="margin:0 0 4px">Vylepšenia sídla:</p><div class="m3scroll"><table class="num"><tbody>${rows}</tbody></table></div>`}
 try{if(window.SIDLA){const cu=SIDLA.cups(cid).filter(x=>!SIDLA.hasUp(cid,x[0]));if(cu.length)h+=`<p class="m3note" style="margin:8px 0 4px">Vylepšenia v tomto meste:</p><div class="m3btns">${cu.map(x=>`<button class="btn sm" data-m3="cup" data-k="${x[0]}" ${p.money<x[3]?"disabled":""}>${x[1]} · ${zl(x[3])}</button>`).join("")}</div>`}}catch(e){}
 return h+`<p class="m3note">Zmeny sa na dome ukážu, keď zavrieš toto okno.</p>`}

const PAL={pre:{wall:"#efe3c4",roof:"#a5402a"},kra:{wall:"#c98a62",roof:"#8a3a28",brick:1},vie:{wall:"#efe9da",roof:"#4f6a5a"},pra:{wall:"#eadfc6",roof:"#8a3a28"},ven:{wall:"#e9c8a8",roof:"#c0703f"},par:{wall:"#ebe6da",roof:"#5a6272"},lon:{wall:"#efe9da",roof:"#5a4a3a",timber:1},brn:{wall:"#e4d6b8",roof:"#9a4630"},bud:{wall:"#e6dcc4",roof:"#8a6a3a"},kut:{wall:"#e8ddc4",roof:"#5a6a5a"},nur:{wall:"#efe4cf",roof:"#9a3e2a",timber:1},gda:{wall:"#b4573b",roof:"#7a3a2a",brick:1}};
function lenderHTML(){
 const p=P(),lim=creditLim(p),room2=Math.max(0,lim-p.debt);
 return`<h3>Úžerník</h3><p class="m3money">Pokladnica: <b>${zl(Math.round(p.money))}</b> · dlh: <b>${zl(Math.round(p.debt))}</b> z najviac ${zl(lim)}</p><p class="m3say">„Peniaze sú tovar ako každý iný. Úrok je 5 % za štvrťrok.“</p>
 <div class="m3btns">${[200,500,2000].map(n=>`<button class="btn sm" data-m3="borrow" data-n="${n}" ${room2<n?"disabled":""}>Požičať ${zl(n)}</button>`).join("")}</div>
 <div class="m3btns" style="margin-top:8px">${[200,1000].map(n=>`<button class="btn sm" data-m3="repay" data-n="${n}" ${p.debt<1||p.money<n?"disabled":""}>Splatiť ${zl(n)}</button>`).join("")}<button class="btn sm pri" data-m3="repay" data-n="all" ${p.debt<1?"disabled":""}>Splatiť všetko, čo sa dá</button></div>`}
/* zákazka od objednávateľa na námestí (v260) */
function ordHTML(){const O3=S.ord3,o=O3&&O3.o;if(!o)return"<p>Nikto tu nečaká.</p>";const C=CITY(o.c),T2=o.due-S.turn,se=(S.season+T2)%4,yr=S.year+Math.floor((S.season+T2)/4);
 if(O3.done)return`<h3>Objednávateľ · ${esc(o.from)}</h3><p class="m3say">„${O3.done===1?"Dohodnuté. Spolieham sa na teba.":"Škoda. Nabudúce snáď."}“</p>${O3.done===1?`<p class="m3note">Zákazku nájdeš na stránke Trh. Tovar odovzdáš zo skladu v meste ${esc(C.n)}.</p>`:""}`;
 return`<h3>Objednávateľ · ${esc(o.from)}</h3><p class="m3say">„Hľadám poctivého remeselníka. Potrebujem <b>${o.n}× ${GOODS[o.g].n.toLowerCase()}</b>${o.q?` v kvalite aspoň ${QN[o.q]}`:""}, dodať do skladu v meste ${esc(C.n)}.“</p>
 <p>Zaplatí <b>${zl(o.pay)}</b>, viac ako na trhu. Termín: do ${SEASONS[se].toLowerCase()} ${yr} (${T2} štvrťrokov). Ak termín nedodržíš, zaplatíš pokutu pätinu ceny.</p>
 <div class="m3btns"><button class="btn sm pri" data-m3="ordyes">Prijať zákazku</button><button class="btn sm" data-m3="ordno">Odmietnuť</button></div>
 <p class="m3note">Objednávateľ príde na námestie najviac raz za štvrťrok. Naraz môžeš mať dve zákazky.</p>`}
/* novinky od hlásnika (v260): posledné zápisy z kroniky */
function newsHTML(){const L2=(S.log||[]).slice(0,7);const tx=t=>String(t||"").replace(/<[^>]*>/g,"");
 return`<h3>Hlásnik</h3><p class="m3say">„Počujte, počujte, čo sa v kraji udialo!“</p><div class="m3scroll"><ul class="m3news">${L2.length?L2.map(e=>`<li><b>${esc(e.t||"")}</b> · ${esc(tx(e.text))}</li>`).join(""):"<li>Zatiaľ sa nič nové nestalo.</li>"}</ul></div>
 <div class="m3btns"><button class="btn sm ghost" data-m3="tab" data-v="kronika">Otvoriť celú kroniku</button></div>`}
function talkHTML(id){
 const d=S.dyn[id],p=P();if(!d)return"<p>Nikto tu nie je.</p>";const f=Math.round(d.favor),n=150*(CITY(d.city).tier||1),gn=Math.round(n/(8*(CITY(d.city).tier||1))*(1+.06*skill(p,"charizma")));
 const line=isAlly(d.id)?"Spojenec! Vždy ťa rád vidím. Môj dom je tvoj dom.":f>=40?"Rád ťa vidím, priateľu. Ako sa darí rodu?":f>=5?"Pozdrav Pán Boh. Čo ťa privádza?":f>-30?"Hm. Dobrý deň.":"Nemáme si čo povedať. Uhni z cesty.";
 const greeted=(S.m3g||{})[S.turn+":"+d.id];
 return`<h3>${d.head.name} · rod ${d.name}</h3><p class="m3money">${TITLES[d.title].n} · priazeň k tebe <b>${f>0?"+":""}${f}</b>${isAlly(d.id)?" · spojenec":""}</p><p class="m3say">„${line}“</p>
 <div class="m3btns"><button class="btn sm pri" data-m3="greet" data-d="${id}" ${greeted?"disabled":""}>${greeted?"Pozdravený":"Pozdraviť · priazeň +1"}</button><button class="btn sm" data-m3="gift" data-d="${id}" data-n="${n}" ${S.ap<1||p.money<n?"disabled":""}>Dať dar ${zl(n)} · priazeň +${gn} · 1 bod</button>${(()=>{let h="";try{const fc=feastCost(p);h+=`<button class="btn sm" data-m3="feast" ${S.ap<2||p.money<fc?"disabled":""}>Pozvať rody na hostinu · ${zl(fc)} · 2 body</button>`}catch(e){}
  try{const kids=p.kids.filter(k=>!k.dead&&!k.spouse&&k.age>=16&&k.age<=40);for(const kid of kids){const k2=(d.kids||[]).find(x=>!x.dead&&!x.spouse&&x.age>=16&&x.gender!==kid.gender);if(k2){const ch=Math.round(Math.max(8,Math.min(95,40+d.favor/2+skill(p,"charizma")*3-(d.title-p.title)*10)));h+=`<button class="btn sm" data-m3="wed" data-kid="${kid.id}" data-d="${id}" data-k="${k2.id}" ${S.ap<1?"disabled":""}>Navrhnúť sobáš: ${kid.name} a ${k2.name} · šanca ${ch} % · 1 bod</button>`;break}}}catch(e){}return h})()}<button class="btn sm ghost" data-m3="prof" data-d="${id}">Profil a rodina</button></div>
 <p class="m3note">Pozdraviť môžeš každý rod raz za štvrťrok, zadarmo.</p>`}
/* ---------- okolie mesta v 3D (v92): desať miest z mapy okolia za hradbami ---------- */
const OKPOS3={dedina:[190,330],vinica:[890,176],les:[140,160],rybnik:[318,410],salas:[1040,120],letohradok:[770,405],klastor:[590,102],hostinec:[975,395],lom:[1110,310],mlyn:[470,470]};
function okoSites(R0,L,wx,home){const out=[];let list=[];try{list=OKO.slice()}catch(e){return out}
 try{if(home&&S.town)list.push(["town",S.town.n,[300,232]]);if(home&&(S.castle||[]).length)list.push(["hrad","Hrad rodu",[452,150]])}catch(e){}
 const rv=(L.river||[]).map(wx);
 for(const o of list){const k=o[0],q=OKPOS3[k]||o[2];const dX=q[0]-600,dY=q[1]-285,u=dX+2*dY,v=2*dY-dX,len=Math.hypot(u,v)||1,d=R0+16+len*.1;let x=u/len*d,z=v/len*d;
  if(k==="mlyn"&&rv.length>3){let b=null;rv.forEach((p,i)=>{const dc=Math.hypot(p[0],p[1]);if(dc<R0+8||dc>R0+95)return;const dd=Math.hypot(p[0]-x,p[1]-z);if(!b||dd<b.d)b={d:dd,p,i}});if(b){const n=rv[Math.min(rv.length-1,b.i+1)],m=rv[Math.max(0,b.i-1)];let tx=n[0]-m[0],tz=n[1]-m[1];const tl=Math.hypot(tx,tz)||1;x=b.p[0]-tz/tl*8.5;z=b.p[1]+tx/tl*8.5;out.push({k,n:o[1],x,z,r:9,river:b.p});continue}}
  else{for(let t=0;t<12&&rv.some(p=>Math.hypot(p[0]-x,p[1]-z)<15);t++){x+=u/len*5;z+=v/len*5}}
  out.push({k,n:o[1],x,z,r:k==="les"?13:11})}
 return out}
function okolie3(K,g,X){const{sites,solids,add,snow,gates,wall,dc,home}=X;const lk=look3();let sd=X.cid*131+7;const R=()=>(sd=(sd*16807+11)%2147483647)/2147483647;
 const E0=home?(S.est||{}):{},UP=home?(S.estL||{}):{};
 const put=(m,x,y,z,noSh)=>{m.position.set(x,y,z);m.castShadow=!noSh;g.add(m);return m};
 const leafC=snow?"#dfe8ee":S.season===2?"#c8782a":"#4f7a34",pineC=snow?"#cfdde4":"#2f5a34",grassC=snow?"#eef2f6":"#6f9c42";
 const pine=(x,z,h)=>{put(new T.Mesh(new T.CylinderGeometry(.12,.16,h*.35,5),M("#4a2e14")),x,h*.17,z);[0,1,2].forEach(i=>put(new T.Mesh(new T.ConeGeometry(h*(.34-i*.07),h*.42,7),M(pineC,{flatShading:true})),x,h*(.42+i*.22),z))};
 const leafD=mixHex(leafC,"#1a2a10",.28),leafL=mixHex(leafC,"#f4f0a0",.22);const leaf=(x,z,r,h)=>{put(new T.Mesh(new T.CylinderGeometry(.1,.17,h,6),M("#4a2e14")),x,h/2,z);const c=put(new T.Mesh(new T.IcosahedronGeometry(r,1),M(leafD,{flatShading:true})),x,h+r*.4,z);c.scale.y=.85;put(new T.Mesh(new T.IcosahedronGeometry(r*.68,1),M(leafC,{flatShading:true})),x+r*.5,h+r*.3,z+r*.25);put(new T.Mesh(new T.IcosahedronGeometry(r*.62,1),M(leafL,{flatShading:true})),x+r*.1,h+r*.95,z-r*.05)};
 const hay=(x,z)=>put(new T.Mesh(new T.ConeGeometry(.75,1.3,8),M(snow?"#e8e4d0":"#d4b24c")),x,.65,z);
 const cot=(x,y,w,d,h,o)=>{o=o||{};K.house(x-w/2,y-d/2,w,d,h,Object.assign({tex:lk.timber?"timber":lk.tex,timber:lk.timber,roof:lk.thatch?"thatch":lk.roof,rh:w*.4,sqY:[[w*.62,h*.4,.6,.7]],sqX:[[d*.3,h*.4,.6,.7]],door:[w*.2,.8,1.25,false]},o));solids.push([x,y,Math.max(w,d)*.5])};
 const fence=(x,z,rx,rz,n)=>{const pm=M("#6a4a2a");for(let i=0;i<n;i++){const a=i/n*6.283;if(Math.abs(a-1.57)<.35)continue;const b=(i+1)/n*6.283,x0=x+Math.cos(a)*rx,z0=z+Math.sin(a)*rz,x1=x+Math.cos(b)*rx,z1=z+Math.sin(b)*rz;put(new T.Mesh(new T.CylinderGeometry(.05,.05,.9,4),pm),x0,.45,z0,1);const r=put(new T.Mesh(new T.BoxGeometry(Math.hypot(x1-x0,z1-z0),.07,.05),pm),(x0+x1)/2,.65,(z0+z1)/2,1);r.rotation.y=-Math.atan2(z1-z0,x1-x0)}};
 const patch=(x,z,rx,rz,col,y)=>{const m=new T.Mesh(new T.CircleGeometry(1,24),M(col));m.rotation.x=-Math.PI/2;m.scale.set(rx,rz,1);m.position.set(x,y||.04,z);m.receiveShadow=true;g.add(m);return m};
 const barrel=(x,z)=>put(new T.Mesh(new T.CylinderGeometry(.3,.3,.74,10),MT("wood","#8a5a32",2,1)),x,.37,z);
 const B={
  dedina(s,own){const n=5+own*2;K.box(s.x-1.2,s.z-2,2.4,4,2.6,{tex:"plasterW",winX:[[.8,.7,.6,1.2,1],[2.5,.7,.6,1.2,1]],doorY:[.6,1.2,1.5,true],noTop:1,tpu:14});K.gable(s.x-1.2,s.z-2,2.4,4,2.6,1.6,"slate",{alongY:1,tpu:12,gableTex:"plasterW"});
   K.box(s.x-.75,s.z-3.4,1.5,1.5,4.8,{tex:"plasterW",quoin:1,sqY:[[.45,3.6,.6,.7]],noTop:1,tpu:14});K.cpyr(s.x-.95,s.z-3.6,1.9,1.9,4.8,2.6,snow?"#e9eef3":"#5a6070");solids.push([s.x,s.z-.6,2.4]);
   K.cyl(s.x+3.2,s.z+3,.55,.6,{tex:"cyl",finial:false});solids.push([s.x+3.2,s.z+3,.7]);
   for(let i=0;i<n;i++){const a=i/n*6.283+.4,rr=6+(i%3)*1.9+R();cot(s.x+Math.cos(a)*rr,s.z+Math.sin(a)*rr*.85,2.8+R()*.6,2.2,1.8+(i%2)*.3,{tex:i%3===0?"timber":i%3===1?lk.tex:"plasterB",timber:i%3===0,roof:i%2?"thatch":lk.roof})}
   for(let i=0;i<3+own;i++)hay(s.x-7+i*1.3,s.z+9+((i*7)%3)*.6);
   if(own>=2){K.box(s.x+7,s.z+7.5,3.4,2.4,2,{tex:"wood",doorY:[1,1.4,1.6,false],noTop:1,tpu:8});K.gable(s.x+7,s.z+7.5,3.4,2.4,2,1.2,"thatch",{tpu:12,gableTex:"wood"});solids.push([s.x+8.7,s.z+8.7,1.9])}},
  vinica(s,own){const T2=3+Math.min(3,own),vc=snow?"#d8e2e6":S.season===2?"#b08a30":"#4f8a38";for(let i=0;i<T2;i++){const zz=s.z-5+i*2.2;const row=put(new T.Mesh(new T.BoxGeometry(13,.9,.4),M(vc)),s.x-1,.55,zz);row.receiveShadow=true;for(let j=0;j<7;j++)put(new T.Mesh(new T.CylinderGeometry(.04,.04,1.2,4),M("#5a3c22")),s.x-7.2+j*2.07,.6,zz,1)}
   patch(s.x-1,s.z-5+T2*1.1-1.1,8,T2*1.3+1,snow?"#e6ecee":"#7a6a3a",.035);
   K.house(s.x+6.4,s.z+T2*1.1-1.6,3,2.4,2,{tex:"wall",quoin:1,roof:lk.roof,rh:1.2,sqY:[[1.9,.8,.6,.7]],sqX:[[.8,.8,.6,.7]],door:[.5,.9,1.3,true]});solids.push([s.x+7.9,s.z+T2*1.1-.4,1.9]);barrel(s.x+6,s.z+T2*1.1+1.4);barrel(s.x+6.8,s.z+T2*1.1+1.6);if(own>=2)barrel(s.x+6.4,s.z+T2*1.1+2.2)},
  les(s,own){for(let i=0;i<34+own*4;i++){const a=R()*6.283,d=3.5+Math.sqrt(R())*9.5,x=s.x+Math.cos(a)*d,z=s.z+Math.sin(a)*d*.85;if(i%5===4)leaf(x,z,1+R()*.5,2+R());else pine(x,z,3.6+R()*2.4)}
   K.house(s.x-1.5,s.z-1.1,3,2.2,1.8,{tex:"wood",roof:"thatch",rh:1.2,sqY:[[1.9,.7,.6,.7]],sqX:[[.7,.7,.6,.7]],door:[.4,.8,1.3,false]});solids.push([s.x,s.z,1.9]);
   for(let r2=0;r2<3;r2++)for(let i=0;i<3-r2;i++){const m=put(new T.Mesh(new T.CylinderGeometry(.17,.17,1.8,7),M("#9a6a3a")),s.x+2.8,.17+r2*.3,s.z+1.4+i*.36+r2*.18);m.rotation.z=Math.PI/2}
   if(own>=1){put(new T.Mesh(new T.BoxGeometry(2.4,.12,.9),M("#8a6a44")),s.x-3,.9,s.z+2);[[-1,-.35],[1,-.35],[-1,.35],[1,.35]].forEach(o=>put(new T.Mesh(new T.CylinderGeometry(.06,.06,.9,4),M("#5a3c22")),s.x-3+o[0],.45,s.z+2+o[1],1))}},
  rybnik(s,own){const rx=7+own,rz=4.4+own*.5;patch(s.x,s.z,rx+.7,rz+.6,snow?"#dfe6ea":"#6a8a48",.035);{const pw=patch(s.x,s.z,rx,rz,"#ffffff",.06);pw.material=waterMat(2,snow)}
   for(let i=0;i<16;i++){const a=i/16*6.283+R()*.2;if(Math.abs(a-1.2)<.5)continue;put(new T.Mesh(new T.CylinderGeometry(.03,.03,1.1+R()*.5,3),M(snow?"#b8b090":"#6a8a3a")),s.x+Math.cos(a)*(rx+.1),.6,s.z+Math.sin(a)*(rz+.1),1)}
   const pier=put(new T.Mesh(new T.BoxGeometry(.9,.12,3),MT("wood","#8a6a44",1,2)),s.x+2,.3,s.z+rz-.6);pier.receiveShadow=true;cot(s.x+rx+2.4,s.z+1.5,2.8,2.2,1.8,{roof:"thatch"});
   if(own>=1&&!snow){const bt=put(new T.Mesh(new T.BoxGeometry(1.6,.25,.6),M("#7a4d2a")),s.x-1.5,.2,s.z+.5);bt.rotation.y=.5}
   for(let k2=0;k2<10;k2++){const a=k2/10*6.283;solids.push([s.x+Math.cos(a)*(rx-1.2),s.z+Math.sin(a)*(rz-1.2),1.3])}},
  salas(s,own){cot(s.x-2.5,s.z-1.5,3.4,2.4,1.7,{tex:"wood",timber:false,roof:"thatch"});fence(s.x+2.5,s.z+1.5,4.2,3.2,14);patch(s.x+2.5,s.z+1.5,4.3,3.3,grassC,.035);
   for(let i=0;i<6+own*2;i++){const x=s.x+2.5+(R()-.5)*6,z=s.z+1.5+(R()-.5)*4.4;const b=put(new T.Mesh(new T.SphereGeometry(.34,7,5),M("#f2eee2")),x,.42,z);b.scale.set(1.3,.9,.9);put(new T.Mesh(new T.SphereGeometry(.15,6,4),M("#3a3028")),x+.42,.52,z,1)}
   hay(s.x-5,s.z+2);if(own>=1)hay(s.x-5.9,s.z+2.9);for(let i=0;i<4;i++)pine(s.x-6+i*1.6+R(),s.z-5-R()*2,3.4+R()*2)},
  letohradok(s){K.house(s.x-2.7,s.z-1.9,5.4,3.8,3.4,{tex:"plasterW",quoin:1,roof:"slate",rh:2,band:1.7,chim:[s.x-1.4],sqY:[[.6,2.1,.8,1],[2.3,2.1,.8,1],[4,2.1,.8,1],[.6,.6,.8,.9],[4,.6,.8,.9]],sqX:[[.8,2.1,.8,1],[2.2,2.1,.8,1]],door:[2.1,1.2,1.7,true]});solids.push([s.x,s.z,3.1]);
   K.cyl(s.x+3.2,s.z-1.5,.85,5.6,{roof:2.2,tex:"cyl"});solids.push([s.x+3.2,s.z-1.5,1]);
   patch(s.x,s.z+5,4.2,2.6,snow?"#eef2f6":"#5f9a4a",.04);K.cyl(s.x,s.z+5,.6,.4,{tex:"cyl",finial:false});for(let i=0;i<12;i++){const a=i/12*6.283;if(Math.abs(a-4.71)<.4)continue;const hb=put(new T.Mesh(new T.SphereGeometry(.4,7,5),M(snow?"#dfe8ee":"#3f7a34")),s.x+Math.cos(a)*4,.3,s.z+5+Math.sin(a)*2.4);hb.scale.y=.8}
   leaf(s.x-4.6,s.z-1,1.3,2.4);leaf(s.x+5.2,s.z+2.4,1.1,2.2)},
  klastor(s){K.box(s.x-1.6,s.z-4,3.2,7.5,4.2,{tex:"wall",quoin:1,winX:[[1,1.2,.9,2.2,1],[3.3,1.2,.9,2.2,1],[5.6,1.2,.9,2.2,1]],winY:[[1.15,1.6,.9,2,1]],doorY:[1,1.2,1.2,true],noTop:1,band:0,tpu:14});K.gable(s.x-1.6,s.z-4,3.2,7.5,4.2,2.2,"slate",{alongY:1,tpu:12,gableTex:"wallY"});
   K.box(s.x-3.5,s.z-4.3,1.9,1.9,7,{tex:"wall",quoin:1,slitsY:[[.95,4.6,1]],slitsX:[[.95,4.6,1]],noTop:1,tpu:14});K.cpyr(s.x-3.7,s.z-4.5,2.3,2.3,7,3.2,snow?"#e9eef3":"#5a6070");solids.push([s.x,s.z-.3,3.4],[s.x-2.6,s.z-3.4,1.4]);
   K.house(s.x+1.6,s.z-.5,6,2.4,2.4,{tex:"plasterW",roof:lk.roof,rh:1.2,sqY:[[.7,.9,.6,.8],[2.2,.9,.6,.8],[3.7,.9,.6,.8]],sqX:[[.9,.9,.6,.8]],door:[5,.8,1.4,true],chim:[s.x+6]});solids.push([s.x+3.4,s.z+.7,1.7],[s.x+6,s.z+.7,1.7]);
   const bc=snow?"#e6ecee":"#7a5a38";for(let i=0;i<3;i++){const b=put(new T.Mesh(new T.BoxGeometry(1.5,.12,3),M(bc)),s.x+2.6+i*2,.07,s.z+4.2,1);b.receiveShadow=true}fence(s.x+4.6,s.z+4.2,4.2,2.5,14)},
  hostinec(s){const w=5,dd=3.4,h=3.1;KH3(K,"krcma",3,s.x,s.z,w,dd,h,{mine:false,look:lk,l:{id:9001+X.cid},b:{w:1,type:"krcma",lvl:3,owner:-1}},{tex:lk.timber?"timber":"plaster",timber:lk.timber,quoin:lk.quoin,roof:lk.roof,chim:[s.x+w*.25],rh:w*.38});solids.push([s.x,s.z,2.9]);
   K.box(s.x+3.4,s.z-1.3,3.2,2.3,1.7,{tex:"wood",doorY:[.5,1.4,1.4,false],noTop:1,tpu:8});K.gable(s.x+3.4,s.z-1.3,3.2,2.3,1.7,1,"thatch",{tpu:12,gableTex:"wood"});solids.push([s.x+5,s.z-.2,1.7]);
   K.box(s.x-3.6,s.z+1,.8,.8,1,{tex:"wood",clean:1,tpu:6});K.box(s.x-3.6,s.z+2.2,.8,.8,.9,{tex:"wood",clean:1,tpu:6})},
  mlyn(s){const w=4.6,dd=3.4,h=3.2;KH3(K,"mlyn",2,s.x,s.z,w,dd,h,{mine:false,look:lk,l:{id:9101+X.cid},b:{w:1,type:"mlyn",lvl:2,owner:-1}},{tex:"plaster",timber:lk.timber,quoin:1,roof:lk.roof,chim:[],rh:w*.4});solids.push([s.x,s.z,2.8]);
   for(let i=0;i<3;i++){const m=put(new T.Mesh(new T.SphereGeometry(.3,8,6),M("#d8cfae")),s.x-3.2+i*.5,.3,s.z+2.2+(i%2)*.4);m.scale.set(1,1.15,.85)}
   if(!s.river)patch(s.x+5.5,s.z,3.2,4.4,snow?"#c4d6e2":"#4f8fb6",.06)},
  town(s){const n=Math.max(6,Math.min(16,Math.round(((S.town&&S.town.pop)||300)/90)));K.box(s.x-1.4,s.z-1.6,2.8,3.2,3,{tex:"plasterW",quoin:1,winY:[[.5,1.6,.6,1,1],[1.7,1.6,.6,1,1]],doorY:[.9,1,1.4,true],noTop:1,tpu:14});K.gable(s.x-1.4,s.z-1.6,2.8,3.2,3,1.6,lk.roof,{tpu:12});K.cyl(s.x+1.6,s.z-1.4,.6,5,{roof:1.8,tex:"cyl"});solids.push([s.x,s.z,2.3]);
   for(let i=0;i<n;i++){const a=i/n*6.283+.3,rr=5.5+(i%3)*2.2;cot(s.x+Math.cos(a)*rr,s.z+Math.sin(a)*rr*.85,2.9+R()*.6,2.3,1.9+(i%3)*.35,{tex:i%3===0?"timber":i%3===1?lk.tex:"plasterG",timber:i%3===0,roof:lk.roof})}
   K.cyl(s.x+2.6,s.z+2.8,.55,.6,{tex:"cyl",finial:false})},
  hrad(s){const n=(S.castle||[]).length;patch(s.x,s.z,10,8,snow?"#e2ebee":"#7aa44c",.05);K.box(s.x-4,s.z-3,8,6,4.4,{tex:"wall",quoin:1,slitsY:[[2,2,1.2],[5.5,2,1.2]],doorY:[3.4,1.2,2,true],topTex:"cobble",tpu:14});
   [[-3.6,-2.6],[3.6,-2.6],[3.6,2.6],[-3.6,2.6]].forEach((o,i)=>{if(i<2+Math.min(2,n))K.cyl(s.x+o[0],s.z+o[1],1.4,6.6,{roof:2.6})});K.box(s.x-1.4,s.z-1.4,2.8,2.8,7.6+Math.min(3,n),{tex:"wall",quoin:1,slitsY:[[1.4,5,1]],slitsX:[[1.4,5,1]],topTex:"cobble",tpu:14});
   flag(g,s.x,7.6+Math.min(3,n),s.z,dc);solids.push([s.x,s.z,5])},
  lom(s,own){const rc=["#9a968c","#8a867c","#a8a49a","#7e7a70"];for(let i=0;i<12;i++){const a=3.6+i/12*3.2,d=6+R()*2.5,hh=2+R()*3.2;const m=put(new T.Mesh(new T.DodecahedronGeometry(1,0),M(snow&&i%2?"#dfe6ea":rc[i%4],{flatShading:true})),s.x+Math.cos(a)*d,hh*.45,s.z+Math.sin(a)*d*.8);m.scale.set(2.2+R(),hh,2+R());m.rotation.y=R()*3;solids.push([m.position.x,m.position.z,2])}
   for(let i=0;i<5+own*2;i++)put(new T.Mesh(new T.BoxGeometry(.9,.55,.6),MT("stone","#b9b0a0",1,1)),s.x-1.5+(i%3)*1.05,.28+Math.floor(i/3)*.56,s.z+1.5+(i%2)*.2);
   [[-.9,0],[.9,0]].forEach(o=>{const q=put(new T.Mesh(new T.CylinderGeometry(.07,.07,4.2,5),M("#5a3c22")),s.x+2.6+o[0]*.6,2,s.z-.5);q.rotation.z=-o[0]*.22});const arm=put(new T.Mesh(new T.CylinderGeometry(.06,.06,3.2,5),M("#5a3c22")),s.x+3.6,3.9,s.z-.5);arm.rotation.z=1.2;put(new T.Mesh(new T.CylinderGeometry(.015,.015,2.6,3),M("#2b2117")),s.x+5,2.6,s.z-.5,1);put(new T.Mesh(new T.BoxGeometry(.7,.5,.5),MT("stone","#b9b0a0",1,1)),s.x+5,1.1,s.z-.5);
   cot(s.x+4.5,s.z+4,2.8,2.2,1.7,{tex:"wood",timber:false,roof:"thatch"})}};
 /* cesty od najbližšej brány */
 const outs=(gates.length?gates:wall.filter((_,i)=>i%5===0)).map(q=>{const d=Math.hypot(q[0],q[1])||1;return[q[0]+q[0]/d*4,q[1]+q[1]/d*4]});
 for(const s of sites){const own=E0[s.k]|0;
  try{let b=null;outs.forEach(q=>{const d=Math.hypot(q[0]-s.x,q[1]-s.z);if(!b||d<b.d)b={d,q}});if(b){const mx=(b.q[0]+s.x)/2+(s.z-b.q[1])*.08,mz=(b.q[1]+s.z)/2-(s.x-b.q[0])*.08;const pts=[];for(let t=0;t<=1.001;t+=.1){const a=(1-t)*(1-t),c=2*t*(1-t),e=t*t;pts.push([a*b.q[0]+c*mx+e*s.x,a*b.q[1]+c*mz+e*s.z])}if(X.canal){ribbon(g,pts,2.3,"#8a6a44",.16,false,"wood");const pg2=new T.CylinderGeometry(.09,.09,.9,5),pm2=M("#4a2e14");pts.forEach((q,i)=>{if(i%2)return;[-1.15,1.15].forEach(o=>{const m=new T.Mesh(pg2,pm2);m.position.set(q[0]+o*.7,-.1,q[1]+o*.7);g.add(m)})})}else{softRibbon(g,pts,3.6,MUDC(),.04,false,.4);ribbon(g,pts,1.9,snow?"#d8d8d0":"#b39a6c",.045,false);if(!snow)[-.42,.42].forEach(o=>ribbon(g,offPts(pts,o),.2,S.season===1?"#7d6848":"#5e4a30",.05,false))}}}catch(e){}
  try{(B[s.k]||(()=>{}))(s,own)}catch(e){console.warn("3D okolie "+s.k,e)}
  const lb=label(s.n+(own?` · tvoje ${own}×`:""),own?dc:null,1.15,{k:"pub"});lb.position.set(s.x,s.k==="klastor"?12.5:s.k==="les"?9:8,s.z);g.add(lb);
  if(own)flag(g,s.x-3.5,0,s.z+3.5,dc);
  const lv=UP[s.k]|0;if(s.k==="town"||s.k==="hrad"){add(s.x,s.z,s.r,s.k==="town"?`${s.n}: spravovať mestečko`:"Hrad rodu: otvoriť",()=>{X.exit();try{A.okoPlace({k:s.k})}catch(e){}},"oko");continue}add(s.x,s.z,s.r,`${s.n}: ${own?"spravovať"+(lv>1?" (stupeň "+lv+")":""):home?"pozrieť a kúpiť":"pozrieť"}`,()=>{try{A.okoPlace({k:s.k})}catch(e){}},"oko")}}
/* ---------- grafika (v99): maľovaná tráva, mäkké škvrny, obloha ---------- */
let GFX={};
function grassMat(season,rep2){const key="g"+season;let cv=GFX[key];if(!cv){cv=document.createElement("canvas");cv.width=cv.height=512;const x=cv.getContext("2d");let sd=11;const R=()=>(sd=(sd*16807)%2147483647)/2147483647;
  const base=[[134,176,88],[122,160,80],[160,150,78],[238,243,247]][season]||[122,160,80];x.fillStyle=`rgb(${base})`;x.fillRect(0,0,512,512);
  for(let i=0;i<4200;i++){const k=.72+R()*.56,px=R()*512,py=R()*512,l=5+R()*9,a=-1.57+(R()-.5)*.9;x.strokeStyle=`rgba(${base.map(v=>Math.min(255,Math.round(v*k))).join(",")},.8)`;x.lineWidth=1.2+R()*1.6;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke()}
  for(let i=0;i<26;i++){const px=R()*512,py=R()*512,r=18+R()*40,gr=x.createRadialGradient(px,py,0,px,py,r),dk=R()<.5;gr.addColorStop(0,dk?"rgba(40,70,30,.16)":"rgba(240,240,170,.14)");gr.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=gr;x.fillRect(px-r,py-r,2*r,2*r)}
  if(season<2)for(let i=0;i<90;i++){x.fillStyle=["#f4f0e6","#f0d050","#e86a9a","#d8453a"][i%4];x.beginPath();x.arc(R()*512,R()*512,1.3,0,7);x.fill()}
  GFX[key]=cv}
 const t=new T.CanvasTexture(cv);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rep2,rep2);t.anisotropy=8;return new T.MeshLambertMaterial({map:t})}
function waterMat(rep2,ice,alpha){let cv=GFX[ice?"ice":"water"];if(!cv){cv=document.createElement("canvas");cv.width=cv.height=256;const x=cv.getContext("2d");let sd=3;const R=()=>(sd=(sd*16807)%2147483647)/2147483647;x.fillStyle=ice?"#c8dbe6":"#3f7fa6";x.fillRect(0,0,256,256);
  for(let i=0;i<26;i++){const px=R()*256,py=R()*256,r=20+R()*36,gr=x.createRadialGradient(px,py,0,px,py,r);gr.addColorStop(0,ice?"rgba(255,255,255,.35)":R()<.5?"rgba(30,70,110,.3)":"rgba(110,170,210,.3)");gr.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=gr;x.fillRect(px-r,py-r,2*r,2*r)}
  for(let i=0;i<(ice?40:130);i++){const px=R()*256,py=R()*256,l=10+R()*22;x.strokeStyle=`rgba(255,255,255,${ice?.5:.16+R()*.3})`;x.lineWidth=1+R()*1.4;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+l/2,py-3-R()*3,px+l,py);x.stroke()}
  GFX[ice?"ice":"water"]=cv}
 const t=new T.CanvasTexture(cv);t.wrapS=t.wrapT=T.RepeatWrapping;if(rep2)t.repeat.set(rep2,rep2);t.anisotropy=8;return new T.MeshPhongMaterial({map:t,specular:ice?"#ffffff":"#bfe0ff",shininess:ice?30:70,transparent:alpha!=null,opacity:alpha==null?1:alpha,side:T.DoubleSide})}
function blobTex(){if(GFX.blob)return GFX.blob;const c=document.createElement("canvas");c.width=c.height=128;const x=c.getContext("2d"),gr=x.createRadialGradient(64,64,4,64,64,62);gr.addColorStop(0,"rgba(255,255,255,1)");gr.addColorStop(.6,"rgba(255,255,255,.45)");gr.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=gr;x.fillRect(0,0,128,128);return GFX.blob=c}
function mixHex(a,b,t){const pa=rgb(a.length===7?a:"#888888"),pb=rgb(b);return"#"+pa.map((v,i)=>Math.round(v+(pb[i]-v)*t).toString(16).padStart(2,"0")).join("")}
/* ---------- maľovaný vzhľad (v102): obrysy perom podľa hĺbky, farby, papier, vineta ---------- */
function mkPost(renderer,tint){const gl2=renderer.capabilities.isWebGL2;if(!gl2&&!renderer.extensions.get("WEBGL_depth_texture"))return null;
 let hdr=false;try{hdr=gl2&&!!renderer.extensions.get("EXT_color_buffer_float")}catch(e){}
 const TY=hdr?T.HalfFloatType:T.UnsignedByteType;let ssK=1.35,bloomOn=true;
 const sz=new T.Vector2(),opt={minFilter:T.LinearFilter,magFilter:T.LinearFilter,format:T.RGBAFormat,type:TY};
 const mk=()=>{renderer.getDrawingBufferSize(sz);const ss=renderer.getPixelRatio()<1.5?ssK:1;const rt=new T.WebGLRenderTarget(Math.max(4,Math.round(sz.x*ss)),Math.max(4,Math.round(sz.y*ss)),opt);rt.depthTexture=new T.DepthTexture(rt.width,rt.height);rt.depthTexture.type=T.UnsignedIntType;return rt};
 const mkB=()=>{renderer.getDrawingBufferSize(sz);const w=Math.max(4,Math.round(sz.x/4)),h=Math.max(4,Math.round(sz.y/4));return[new T.WebGLRenderTarget(w,h,opt),new T.WebGLRenderTarget(w,h,opt)]};
 let rt=mk(),rb=mkB();const dec=(LEG0()&&!CMON)?2.2:1.;
 const VS="varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}";
 /* jas nad prahom, zmenšený na štvrtinu */
 const bright=new T.ShaderMaterial({uniforms:{tD:{value:rt.texture},px:{value:new T.Vector2()},thr:{value:.8},dec:{value:dec}},depthTest:false,depthWrite:false,vertexShader:VS,
  fragmentShader:"uniform sampler2D tD;uniform vec2 px;uniform float thr;uniform float dec;varying vec2 vUv;vec3 L(vec2 o){return pow(max(texture2D(tD,vUv+o*px).rgb,0.),vec3(dec));}void main(){vec3 c=(L(vec2(-1.,-1.))+L(vec2(1.,-1.))+L(vec2(-1.,1.))+L(vec2(1.,1.)))*.25;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(thr,thr*1.6+.05,l),1.);}"});
 const blur=new T.ShaderMaterial({uniforms:{tB:{value:null},dir:{value:new T.Vector2()}},depthTest:false,depthWrite:false,vertexShader:VS,
  fragmentShader:"uniform sampler2D tB;uniform vec2 dir;varying vec2 vUv;void main(){vec3 c=texture2D(tB,vUv).rgb*.227;c+=(texture2D(tB,vUv+dir*1.38).rgb+texture2D(tB,vUv-dir*1.38).rgb)*.316;c+=(texture2D(tB,vUv+dir*3.23).rgb+texture2D(tB,vUv-dir*3.23).rgb)*.07;gl_FragColor=vec4(c,1.);}"});
 const mat=new T.ShaderMaterial({uniforms:{tD:{value:rt.texture},tZ:{value:rt.depthTexture},tB:{value:rb[0].texture},bI:{value:0},res:{value:new T.Vector2(rt.width,rt.height)},near:{value:.1},far:{value:1500},tint:{value:new T.Vector3(tint[0],tint[1],tint[2])},ink:{value:1},dec:{value:dec},
   expo:{value:1.1},haze:{value:new T.Vector3(.8,.85,.9)},hz:{value:.3},hs:{value:18},split:{value:1},sunUV:{value:new T.Vector2(-9,-9)},sunC:{value:new T.Vector3(1,.85,.6)},sunA:{value:0},asp:{value:1},invPV:{value:new T.Matrix4()},cT:{value:0},cK:{value:0},wet:{value:0}},depthTest:false,depthWrite:false,vertexShader:VS,
  fragmentShader:`uniform sampler2D tD;uniform sampler2D tZ;uniform sampler2D tB;uniform float bI;uniform vec2 res;uniform float near;uniform float far;uniform float ink;uniform float dec;uniform vec3 tint;
  uniform float expo;uniform vec3 haze;uniform float hz;uniform float hs;uniform float split;uniform vec2 sunUV;uniform vec3 sunC;uniform float sunA;uniform float asp;uniform mat4 invPV;uniform float cT;uniform float cK;uniform float wet;varying vec2 vUv;
  float lin(vec2 uv){float z=texture2D(tZ,uv).x;float n=z*2.-1.;return 2.*near*far/(far+near-n*(far-near));}
  float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
  float fbm(vec2 p){return vn(p)*.55+vn(p*2.03+3.1)*.3+vn(p*4.1+7.7)*.15;}
  vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
  void main(){vec3 col=pow(max(texture2D(tD,vUv).rgb,0.),vec3(dec));vec2 px=1.4/res;float d=lin(vUv);float skyM=step(far*.92,d);
   float e=abs(lin(vUv+vec2(px.x,0.))+lin(vUv-vec2(px.x,0.))-2.*d)+abs(lin(vUv+vec2(0.,px.y))+lin(vUv-vec2(0.,px.y))-2.*d);
   float edge=smoothstep(.018,.06,e/max(d,1.))*ink*(1.-smoothstep(110.,300.,d));
   float ao=0.;if(d<160.){float rr=.95/(1.155*d);vec2 aspv=vec2(res.y/res.x,1.);for(int i=0;i<8;i++){float a=float(i)*.7854+hash(vUv*res)*.6;float ds=lin(vUv+vec2(cos(a),sin(a))*aspv*rr*(i<4?1.:.5));float df=d-ds;ao+=step(.04*d*.05+.03,df)*(1.-smoothstep(.6,2.2,df));}ao=ao/8.*(1.-smoothstep(90.,160.,d));}
   col*=1.-ao*.5*ink;
   /* tiene oblakov a mokrá zem: poloha bodu vo svete z hĺbky */
   if((cK>0.||wet>0.)&&skyM<.5){float zz=texture2D(tZ,vUv).x;vec4 wp=invPV*vec4(vUv*2.-1.,zz*2.-1.,1.);wp/=wp.w;
    if(cK>0.){float cl=smoothstep(.45,.72,fbm(wp.xz*.016+vec2(cT*.010,cT*.006)));col*=1.-cK*cl;}
    if(wet>0.&&wp.y<.3){float st=fbm(wp.xz*.9);col=col*mix(.5,.72,st)*vec3(.94,.97,1.02)+pow(haze,vec3(dec))*.012*wet;}}
   /* opar v diaľke: vzdialené domy a kopce blednú a modrejú */
   float l0=dot(col,vec3(.2126,.7152,.0722));float ha=smoothstep(hs,hs+175.,d)*hz*(1.-skyM);col=mix(col,mix(vec3(l0),col,.55)*.8+pow(haze,vec3(dec))*.32,ha);
   /* slnko alebo mesiac na oblohe a jemný závoj svetla okolo neho */
   vec2 sq=(vUv-sunUV)*vec2(asp,1.);float sd=length(sq);col+=sunC*sunA*(exp(-sd*sd*90.)*(.35+skyM*.9)+exp(-sd*5.)*.10+skyM*smoothstep(.028,.018,sd)*1.6);
   col+=texture2D(tB,vUv).rgb*bI;
   col*=tint*expo;
   /* teplé svetlo, chladnejšie tiene */
   float l1=dot(col,vec3(.2126,.7152,.0722));col*=mix(mix(vec3(1.),vec3(.93,.97,1.07),split),mix(vec3(1.),vec3(1.04,1.,.94),split),smoothstep(.04,.5,l1));
   col=pow(aces(col),vec3(.4545));
   float l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,1.12);col=mix(col,col*col*(3.-2.*col),.14);
   col=mix(col,vec3(.16,.11,.07),edge*.72);
   col+=(hash(floor(vUv*res/2.))-.5)*.03;vec2 q=vUv-.5;col*=1.-dot(q,q)*.34;
   gl_FragColor=vec4(col,1.);}`});
 const sc=new T.Scene(),quad=new T.Mesh(new T.PlaneGeometry(2,2),mat);quad.frustumCulled=false;sc.add(quad);const oc=new T.OrthographicCamera(-1,1,1,-1,0,1);
 const pass=(m,to)=>{quad.material=m;renderer.setRenderTarget(to);renderer.render(sc,oc)};
 const sunDir=new T.Vector3(0,1,0),v3=new T.Vector3(),cdir=new T.Vector3();let sunK=0,slow=0,tPrev=0;
 const sizeB=()=>{bright.uniforms.px.value.set(1/rt.width,1/rt.height)};sizeB();
 const P={lowQ(){bloomOn=false;if(ssK>1){ssK=1;P.resize()}},tint(v){mat.uniforms.tint.value.set(v[0],v[1],v[2])},
  /* nastavenie podľa dennej doby: expozícia, opar, sila žiary a jej prah, slnko */
  mood(o){const u=mat.uniforms;if(o.expo!=null)u.expo.value=o.expo;if(o.hz!=null)u.hz.value=o.hz;if(o.split!=null)u.split.value=o.split;if(o.bloom!=null)P.bloomI=o.bloom;if(o.thr!=null)bright.uniforms.thr.value=o.thr;
   if(o.haze){const c=new T.Color(o.haze);u.haze.value.set(c.r,c.g,c.b)}if(o.sunC){const c=new T.Color(o.sunC);u.sunC.value.set(c.r,c.g,c.b)}if(o.sun)sunDir.copy(o.sun).normalize();if(o.sunK!=null)sunK=o.sunK;if(o.cK!=null)P.cK=o.cK;if(o.wet!=null)P.wet=o.wet},bloomI:.2,cK:0,wet:0,
  render(scene,cam){const now=performance.now();if(tPrev){const ft=now-tPrev;slow=slow*.97+(ft>34?1:0)*.03;if(slow>.6&&bloomOn){bloomOn=false;slow=0;console.info("3D: žiara vypnutá kvôli rýchlosti")}else if(slow>.6&&ssK>1){ssK=1;slow=0;P.resize();console.info("3D: menšie prevzorkovanie kvôli rýchlosti")}}tPrev=now;
   renderer.setRenderTarget(rt);renderer.render(scene,cam);
   const u=mat.uniforms;u.asp.value=rt.width/rt.height;
   cam.getWorldDirection(cdir);if(sunK>0&&!P.room&&cdir.dot(sunDir)>0){v3.copy(cam.position).addScaledVector(sunDir,1000).project(cam);u.sunUV.value.set(v3.x*.5+.5,v3.y*.5+.5);u.sunA.value=sunK*Math.min(1,cdir.dot(sunDir)*3)}else u.sunA.value=0;
   if(bloomOn&&P.bloomI>0){pass(bright,rb[0]);const w=rb[0].width,h=rb[0].height;blur.uniforms.tB.value=rb[0].texture;blur.uniforms.dir.value.set(1/w,0);pass(blur,rb[1]);blur.uniforms.tB.value=rb[1].texture;blur.uniforms.dir.value.set(0,1/h);pass(blur,rb[0]);
    blur.uniforms.tB.value=rb[0].texture;blur.uniforms.dir.value.set(2/w,0);pass(blur,rb[1]);blur.uniforms.tB.value=rb[1].texture;blur.uniforms.dir.value.set(0,2/h);pass(blur,rb[0]);u.bI.value=P.bloomI}else u.bI.value=0;
   u.invPV.value.multiplyMatrices(cam.matrixWorld,cam.projectionMatrixInverse);u.cT.value=now/1000;u.cK.value=P.room?0:P.cK;u.wet.value=P.room?0:P.wet;
   pass(mat,null)},
  resize(){rt.dispose();rb.forEach(r=>r.dispose());rt=mk();rb=mkB();mat.uniforms.tD.value=rt.texture;mat.uniforms.tZ.value=rt.depthTexture;mat.uniforms.tB.value=rb[0].texture;bright.uniforms.tD.value=rt.texture;sizeB();mat.uniforms.res.value.set(rt.width,rt.height)},
  dispose(){try{rt.dispose();rb.forEach(r=>r.dispose());mat.dispose();bright.dispose();blur.dispose()}catch(e){}},hdr,u:mat.uniforms,bu:bright.uniforms};
 return P}
/* ---------- svet ---------- */
function open(){const QLV=QL();let FPSN=0;
 LABELS=[];CHIM=[];FLAGS=[];const PRE=[];const C=CC(),L=cityLayout(C),p=P(),cid=S.ci;const pal=PAL[L.key]||PAL.pre;
 const wx=q=>[(q[0]-L.cx)/U,(q[1]-L.cy)/U],snow=S.season===3;
 const root=document.createElement("div");root.id="m3d";
 root.innerHTML=`<canvas></canvas><div class="m3top"><b>${C.n}</b><span>${["jar","leto","jeseň","zima"][S.season]} ${S.year}${(()=>{try{const w=wx3(),p9=todPh();return p9===3?" · noc":[" · ráno",""," · večer"][p9]+(w==="dazd"?" · dážď":w==="sneh"?" · sneží":w==="hmla"?" · hmla":"")}catch(e){return""}})()}</span><i class="m3hud"></i><i class="m3fps" title="Snímky za sekundu a kvalita grafiky (kláves Q)"></i><button class="btn sm" data-m3end="1" title="Ukončiť štvrťrok (kláves K)">⏭ Ďalší štvrťrok</button><button class="btn sm pri" data-a="m3dx">✕ Späť do knihy rodu (Esc)</button></div>
 <div class="m3help"><b>W A S D</b> alebo šípky: chôdza · <b>myš</b> (ťahaj): pohľad · <b>koliesko</b>: priblíženie · <b>V</b>: pohľad z očí · <b>M</b>: pohľad z výšky · <b>G</b>: obrysy perom · <b>L</b>: svetlo a tiene · <b>H</b>: jemné alebo sýte farby · <b>Q</b>: kvalita grafiky · <b>Z</b>: zvuky · <b>K</b>: ďalší štvrťrok · <b>T</b>: miesta · <b>N</b>: mapka · <b>E</b>: použiť · <b>Shift</b>: beh</div><div class="m3hint" hidden></div><div class="m3panel" hidden></div>`;
 document.body.appendChild(root);
 const canvas=root.querySelector("canvas");canvas.tabIndex=0;canvas.style.outline="none";
 const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(QLV===0?1:Math.min(QLV===1?1.5:2,devicePixelRatio||1));renderer.setSize(innerWidth,innerHeight);renderer.info.autoReset=false;
 /* automatické rozlíšenie (v256): keď hra dlhšie beží pod 26 snímok za sekundu, zníži sa rozlíšenie; keď je rezerva, vráti sa */
 const PRMAX=renderer.getPixelRatio(),PRS=[PRMAX,PRMAX*.75,PRMAX*.6].filter((v,i,a)=>i===0||(v>=.6&&v<a[i-1]-.05));let DRL=0,DRC=0,DRW=false;
 const DRS=f=>{if(document.hidden)return;if(f<26)DRC=Math.min(0,DRC)-1;else if(f>52)DRC=Math.max(0,DRC)+1;else DRC=0;
  const setPR=()=>{renderer.setPixelRatio(PRS[DRL]);renderer.setSize(innerWidth,innerHeight);try{if(post)post.resize()}catch(e){}};
  if(DRC<=-3&&DRL<PRS.length-1){DRL++;DRC=0;setPR()}else if(DRC>=8&&DRL>0){DRL--;DRC=0;setPR()}
  else if(DRC<=-6&&DRL===PRS.length-1&&!DRW&&QLV>0){DRW=true;try{toast("3D mesto beží pomaly – skús nižšiu kvalitu grafiky (kláves Q).","info")}catch(e){}}};
 renderer.shadowMap.enabled=true;try{if(LEG())renderer.outputEncoding=T.sRGBEncoding}catch(e){}let post=null,postOn=true,postChk=0;try{postOn=localStorage.getItem("m3post")!=="0"}catch(e){}try{GL2=!!renderer.capabilities.isWebGL2}catch(e){GL2=false}
 const scene=new T.Scene();let ph=1;try{ph=todPh()}catch(e){}const night=ph===3;NIGHT3=night;try{if(!RIMU.value)RIMU.value=new T.Color();const wq=(()=>{try{return wx3()}catch(e){return"jasno"}})();RIMU.value.setRGB(...(night?[.06,.08,.14]:ph===2?[.36,.26,.17]:ph===0?[.3,.28,.27]:wq!=="jasno"?[.2,.22,.25]:[.3,.33,.37]))}catch(e){}try{post=mkPost(renderer,night?[.82,.9,1.12]:ph===2?[1.07,.96,.86]:ph===0?[1.04,.99,.94]:[1.02,1,.97])}catch(e){console.warn("3D vzhľad",e);post=null}const wxS=(()=>{try{return wx3()}catch(e){return"jasno"}})(),bad=wxS!=="jasno"&&!night;const TD=(()=>{try{return iso().TOD[night?1:ph]||iso().TOD[1]}catch(e){return null}})();
 const skyT=night?"#101a34":bad?"#8a96a2":snow?"#b9c8d8":TD?TD.sky[0]:"#8cbce4",sky=night?"#2a3654":bad?(wxS==="hmla"?"#cfd4d6":"#b4bdc4"):snow?"#e2e8ee":S.season===2&&ph===1?"#f0dcc0":TD?TD.sky[1]:"#eaf2f0";
 {const c=document.createElement("canvas");c.width=4;c.height=256;const x=c.getContext("2d"),gr=x.createLinearGradient(0,0,0,256);gr.addColorStop(0,skyT);gr.addColorStop(.52,sky);gr.addColorStop(1,sky);x.fillStyle=gr;x.fillRect(0,0,4,256);scene.background=new T.CanvasTexture(c)}
 scene.fog=new T.Fog(sky,60,210);try{renderer.shadowMap.type=T.PCFSoftShadowMap}catch(e){}
 const cam=new T.PerspectiveCamera(60,innerWidth/innerHeight,.1,1500);
 scene.add(new T.HemisphereLight(night?"#8fa0d8":"#f8f8ff",night?"#2a2a3a":"#8a7a5c",night?.55:bad?1.0:ph===2?.5:ph===0?.62:.6));
 const sun=new T.DirectionalLight(night?"#9ab0ff":TD?`rgb(${TD.sun.join(",")})`:"#fff1c8",night?.32:bad?.55:ph===2?1.85:ph===0?1.95:2.1);if(TD&&!night)sun.position.set(TD.L[0]*110,Math.max(.35,TD.L[2])*110,TD.L[1]*110);else sun.position.set(-60,90,40);sun.shadow.radius=3;sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
 const R0=Math.max(L.rx,L.ry)/U+20;{const fl2=new T.DirectionalLight(night?"#5a6aa0":"#bcd0ff",night?.12:.24);fl2.position.set(-sun.position.x,sun.position.y*.6,-sun.position.z);scene.add(fl2)}const SUND=sun.position.clone().normalize(),SUN0=SUND.clone(),RSW=R0+105;let shR=-1;{Object.assign(sun.shadow.camera,{left:-RSW,right:RSW,top:RSW,bottom:-RSW,near:10,far:520});try{if(renderer.capabilities.maxTextureSize>=4096&&QLV===2)sun.shadow.mapSize.set(4096,4096);if(QLV===0)sun.shadow.mapSize.set(1024,1024)}catch(e){}sun.shadow.bias=-.0004;try{sun.shadow.normalBias=.03}catch(e){}sun.position.multiplyScalar(2)}scene.add(sun);scene.add(sun.target);
 /* tiene sa počítajú len okolo hráča – sú ostrejšie; z výšky celé mesto */
 const shadowAt=(x,z,wide)=>{const R=wide?RSW:58;if(R!==shR){shR=R;Object.assign(sun.shadow.camera,{left:-R,right:R,top:R,bottom:-R});sun.shadow.camera.updateProjectionMatrix()}
  const tx2=wide?0:x,tz2=wide?0:z,q=wide?1:(2*R)/sun.shadow.mapSize.x,sx=Math.round(tx2/q)*q,sz2=Math.round(tz2/q)*q;sun.target.position.set(sx,0,sz2);sun.position.set(sx+SUND.x*260,SUND.y*260,sz2+SUND.z*260)};
 const wxM=(()=>{try{return wx3()}catch(e){return"jasno"}})(),badM=wxM!=="jasno";
 try{if(post&&QLV===0)post.lowQ()}catch(e){}
 try{if(post&&post.mood)post.mood(night?{expo:1.2,hz:.22,split:0,bloom:.55,thr:.5,haze:sky,sun:new T.Vector3(.35,.55,-.6),sunC:"#c8d4ff",sunK:badM?0:.4}
  :{expo:badM?1.1:1.05,hz:wxM==="hmla"?.65:badM?.42:.3,split:badM?.25:ph===2?1.25:1,bloom:snow?.12:.2,thr:snow?.95:.82,haze:sky,sun:SUND,sunC:ph===2?"#ffb070":ph===0?"#ffd8a8":"#fff2d6",sunK:badM?0:ph===2?1.1:ph===0?.8:.55,cK:badM||QLV===0?0:.26,wet:wxM==="dazd"?1:0})}catch(e){console.warn("3D nálada",e)}
 const g=new T.Group();scene.add(g);
 /* zem, rieka, ulice, námestie */
 const SITES=okoSites(R0,L,wx,cid===p.city);const R1=SITES.length?R0+125:R0*2.4;
 /* rieka predĺžená až po okraj sveta (v109), aby sa nedala obísť */
 let RVC=null;const RVX=()=>{if(RVC)return RVC;const rp=(L.river||[]).map(wx);if(rp.length<2||L.canal)return RVC=rp;const lim=R1+150;
  const ext=(p0,p1,sg)=>{let h=Math.atan2(p0[1]-p1[1],p0[0]-p1[0]),x=p0[0],z=p0[1];const o=[],near=(x,z)=>SITES.some(q=>Math.hypot(q.x-x,q.z-z)<q.r+13);for(let k=1;k<160;k++){const hw=h+Math.cos(k*.33)*.1*sg;let ok=null;for(const d of [0,.3,-.3,.6,-.6,.9,-.9,1.2,-1.2]){const nx=x+Math.cos(hw+d)*6,nz=z+Math.sin(hw+d)*6;if(!near(nx,nz)&&Math.hypot(nx,nz)>Math.hypot(x,z)-1){ok=[nx,nz];h+=d*.6;break}}if(!ok)break;x=ok[0];z=ok[1];o.push(ok);if(Math.hypot(x,z)>lim)break}return o};
  const n=rp.length;return RVC=ext(rp[0],rp[Math.min(2,n-1)],1).reverse().concat(rp,ext(rp[n-1],rp[Math.max(0,n-3)],-1))};
 const GR=720;let WAT0=null;const gr=new T.Mesh(new T.CircleGeometry(GR,72),L.canal?(()=>{const m=waterMat(GR*2/14,snow);WAT0=m.map;return m})():(()=>{const m=grassMat(S.season,GR*2/22);if(snow){m.emissive=new T.Color("#8a98a8");m.emissiveIntensity=.3}return m})());gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;g.add(gr);
 if(L.canal)try{const sh=new T.Shape();L.wall.forEach((p0,i)=>{const q=wx([L.cx+(p0[0]-L.cx)*1.3,L.cy+(p0[1]-L.cy)*1.3]);i?sh.lineTo(q[0],-q[1]):sh.moveTo(q[0],-q[1])});const land=new T.Mesh(new T.ShapeGeometry(sh),snow?M("#f4f7fa",{emissive:"#8a98a8",emissiveIntensity:.3}):MT("grass","#8aa860",.12,.12));land.rotation.x=-Math.PI/2;land.position.y=.025;land.receiveShadow=true;g.add(land)}catch(e){console.warn("3D ostrov",e)}
 /* ---------- Benátky (v108): ostrovčeky v lagúne, mosty cez kanály, móla, kotviace koly, plachetnice ---------- */
 const VEN={isles:[],piers:[],br:[],shore:null};
 if(L.canal)try{const landM=()=>snow?M("#f4f7fa",{emissive:"#8a98a8",emissiveIntensity:.3}):MT("grass","#8aa860",4,4),sandM=M(snow?"#dfe4e8":"#c8b888");
  const isle=(x,z,r)=>{const a=new T.Mesh(new T.CircleGeometry(r+1.4,28),sandM);a.rotation.x=-Math.PI/2;a.position.set(x,.024,z);g.add(a);const b2=new T.Mesh(new T.CircleGeometry(r,28),landM());b2.rotation.x=-Math.PI/2;b2.position.set(x,.03,z);b2.receiveShadow=true;g.add(b2);VEN.isles.push([x,z,r+1.2])};
  SITES.forEach(q=>isle(q.x,q.z,q.r+4));
  /* vzdialené ostrovčeky so stromami a domcami */
  for(let i=0;i<7;i++){const a=i*.9+.4,r=R1+18+((i*37)%30),x=Math.cos(a)*r,z=Math.sin(a)*r,rr=7+(i%3)*3;if(SITES.some(q=>Math.hypot(q.x-x,q.z-z)<q.r+rr+8))continue;isle(x,z,rr);
   for(let k=0;k<4+i%3;k++){const ta=k*1.7+i,tx2=x+Math.cos(ta)*rr*.6,tz2=z+Math.sin(ta)*rr*.6;cyl(g,tx2,0,tz2,.1,2.6,"#4a2e14",5);const c=new T.Mesh(new T.ConeGeometry(.55,3.4,7),M(snow?"#cfdde4":"#2f5a34",{flatShading:true}));c.position.set(tx2,3.2,tz2);c.castShadow=true;g.add(c)}
   if(i%2===0)box(g,x,0,z,2.6,1.9,2,"#e6d8b8",i,"plaster"),pyr(g,x,1.9,z,3,1.2,2.4,"#a5402a",i)}
  /* mosty tam, kde ulica kríži kanál */
  const segX=(a,b,c,d)=>{const r=[b[0]-a[0],b[1]-a[1]],s2=[d[0]-c[0],d[1]-c[1]],den=r[0]*s2[1]-r[1]*s2[0];if(Math.abs(den)<1e-6)return null;const t=((c[0]-a[0])*s2[1]-(c[1]-a[1])*s2[0])/den,u=((c[0]-a[0])*r[1]-(c[1]-a[1])*r[0])/den;return t>=0&&t<=1&&u>=0&&u<=1?[a[0]+r[0]*t,a[1]+r[1]*t,Math.atan2(r[1],r[0])]:null};
  const roads2=(L.streets||[]).map(s2=>s2.map(wx)).concat(L.ring&&L.ring.length>2?[L.ring.concat([L.ring[0]]).map(wx)]:[]),cans=(L.canals||[]).map(c=>(c||[]).map(wx)),br=[];
  roads2.forEach(rd=>{for(let i=0;i<rd.length-1;i++)cans.forEach(cn=>{for(let j=0;j<cn.length-1;j++){const q=segX(rd[i],rd[i+1],cn[j],cn[j+1]);if(q&&!br.some(o=>Math.hypot(o[0]-q[0],o[1]-q[1])<4))br.push(q)}})});
  VEN.br=br.slice(0,40);br.slice(0,40).forEach(q=>{const bg=new T.Group();box(bg,0,.08,0,5.4,.26,3,"#b9b0a0",0,"stone");box(bg,0,.3,0,3.2,.16,3,"#c4bba8",0,"stone");[-1.4,1.4].forEach(o=>{box(bg,0,.3,o,5.4,.55,.22,"#a99f8a",0,"stone")});box(bg,0,-.5,0,1.2,.6,3.1,"#8f8778");bg.position.set(q[0],0,q[1]);bg.rotation.y=-q[2];g.add(bg)});
  /* móla s kolmi a gondolami na okraji ostrova */
  const shore=L.wall.map(p0=>wx([L.cx+(p0[0]-L.cx)*1.3,L.cy+(p0[1]-L.cy)*1.3]));VEN.shore=shore;const pal=(x,z,h)=>{for(let k=0;k<4;k++){const m=new T.Mesh(new T.CylinderGeometry(.09,.09,h/4,6),M(k%2?"#f4ecd8":"#b8362c"));m.position.set(x,h/8+k*h/4-.2,z);g.add(m)}const t=new T.Mesh(new T.SphereGeometry(.13,6,5),M("#e3be4f"));t.position.set(x,h-.1,z);g.add(t)};
  for(let i=0;i<shore.length;i+=Math.max(2,Math.floor(shore.length/9))){const q=shore[i],d=Math.hypot(q[0],q[1])||1,ux=q[0]/d,uz=q[1]/d;if(SITES.some(o=>Math.hypot(o.x-q[0],o.z-q[1])<o.r+14))continue;const pg3=new T.Group();box(pg3,0,.22,0,1.6,.12,6.5,"#8a6a44",0,"wood");for(let k=-1;k<=1;k++)[-.75,.75].forEach(o=>box(pg3,o,-.5,k*2.8,.14,.8,.14,"#4a2e14"));pg3.position.set(q[0]+ux*2.6,0,q[1]+uz*2.6);pg3.rotation.y=Math.atan2(ux,uz);g.add(pg3);VEN.piers.push([[q[0]-ux*1.5,q[1]-uz*1.5],[q[0]+ux*6,q[1]+uz*6]]);
   pal(q[0]+ux*6.4-uz*1.5,q[1]+uz*6.4+ux*1.5,2.6);pal(q[0]+ux*6.4+uz*1.5,q[1]+uz*6.4-ux*1.5,2.2);
   if(!snow){const gd=new T.Group();box(gd,0,.1,0,.55,.22,2.9,"#1c1814");box(gd,0,.28,1.5,.16,.4,.3,"#1c1814");box(gd,0,.3,-1.5,.14,.5,.25,"#1c1814");gd.position.set(q[0]+ux*4.6-uz*1.5,0,q[1]+uz*4.6+ux*1.5);gd.rotation.y=Math.atan2(ux,uz)+.2;g.add(gd);PRE.push((dt,t)=>{gd.position.y=Math.sin(t*1.3+i)*.04;gd.rotation.z=Math.sin(t*1.1+i)*.03})}}
  /* plachetnice krúžiace lagúnou */
  if(!snow)for(let i=0;i<3;i++){const sg=new T.Group();box(sg,0,.15,0,1.2,.5,3.6,"#6b4423",0,"wood");box(sg,0,.6,0,.1,3.2,.1,"#4a2e14");const sl=new T.Mesh(new T.PlaneGeometry(1.9,2.4),M(["#f1e8d2","#e8d0a8","#d8453a"][i],{side:T.DoubleSide}));sl.position.set(0,2.3,.1);sl.rotation.y=Math.PI/2;sg.add(sl);g.add(sg);const rr=R0*1.5+i*22,sp=(.012+i*.004)*(i%2?1:-1);PRE.push((dt,t)=>{const a=t*sp*6+i*2.1;sg.position.set(Math.cos(a)*rr,Math.sin(t*1.2+i)*.05,Math.sin(a)*rr);sg.rotation.y=-a+(sp>0?0:Math.PI)})}
 }catch(e){console.warn("3D Benátky",e)}
 const WAT=[];let riverM=null;if(L.river&&L.river.length>1){const rp=RVX();softRibbon(g,rp,17,snow?"#d9dfe2":"#6f7f48",.05,false,.5);softRibbon(g,rp,12.2,snow?"#cfd6da":"#a8976a",.075,false,.68);
  try{if(!snow){const N=180,im=new T.InstancedMesh(new T.IcosahedronGeometry(.32,0),M("#8a8478"),N),dm=new T.Object3D();let n=0;let sd=17;const R=()=>(sd=(sd*16807)%2147483647)/2147483647;
   for(let i=1;i<rp.length-1&&n<N;i++){const a=rp[i-1],b=rp[i+1];let tx2=b[0]-a[0],tz2=b[1]-a[1];const tl=Math.hypot(tx2,tz2)||1;tx2/=tl;tz2/=tl;for(let k=0;k<3&&n<N;k++){const sd2=R()<.5?1:-1,off=4.35+R()*.6,al=(R()-.5)*5;
    dm.position.set(rp[i][0]-tz2*off*sd2+tx2*al,.1,rp[i][1]+tx2*off*sd2+tz2*al);const s2=.6+R()*1.1;dm.scale.set(s2*(1+R()*.6),s2*.45,s2);dm.rotation.set(0,R()*6.28,0);dm.updateMatrix();im.setMatrixAt(n++,dm.matrix)}}im.count=n;im.receiveShadow=true;g.add(im)}}catch(e){}riverM=ribbon(g,rp,9,"#ffffff",.1,false,"water");riverM.material=waterMat(0,snow);
  if(!snow){const r2=ribbon(g,rp,8.4,"#ffffff",.125,false,"water");r2.material=waterMat(0,false,.35);r2.material.map.repeat.set(.6,1.7);WAT.push([r2.material.map,.035,.02]);
   const N=260,im=new T.InstancedMesh(new T.ConeGeometry(.05,1,3),new T.MeshLambertMaterial({color:"#6a8a3a"}),N),dm=new T.Object3D();let n=0;for(let i=1;i<rp.length-1&&n<N;i++){const a=rp[i-1],b=rp[i+1];let tx2=b[0]-a[0],tz2=b[1]-a[1];const tl=Math.hypot(tx2,tz2)||1;tx2/=tl;tz2/=tl;for(let k=0;k<5&&n<N;k++){const sd2=(k%2?1:-1),off=4.7+((i*7+k*3)%5)*.12,al=((i*13+k*5)%10)/10*3;dm.position.set(rp[i][0]-tz2*off*sd2+tx2*al,.45,rp[i][1]+tx2*off*sd2+tz2*al);dm.scale.set(1,.7+((i+k)%4)*.25,1);dm.rotation.z=((i+k)%3-1)*.12;dm.updateMatrix();im.setMatrixAt(n++,dm.matrix)}}im.count=n;g.add(im)}}
 (L.canals||[]).forEach(cn=>{try{if(cn&&cn.length>1){ribbon(g,cn.map(wx),4,snow?"#cfd6da":"#a89a80",.075,false);const cm2=ribbon(g,cn.map(wx),3.2,"#ffffff",.08,false,"water");cm2.material=waterMat(0,snow);if(!snow)WAT.push([cm2.material.map,.03,0])}}catch(e){}});
 /* ---------- terén okolia (v105): mierne kopce mimo mesta, ciest, miest a rieky ---------- */
 let TH=()=>0;const cen0=wx([L.cx,L.cy]),wall0=L.wall.map(wx),gates0=(L.gates||[]).map(wx);
 /* hrad nad mestom (v253): tam, kde naozaj stál – na kopci za hradbami, najradšej pri rieke */
 let CASTLE=null;try{const CK=CKEY();const HN={pre:"Prešporský hrad",kra:"Wawel",pra:"Pražský hrad",bud:"Budínsky hrad",nur:"Norimberský hrad",brn:"Špilberk"}[CK];
  if(HN&&!L.canal&&!((S.cw||{})[cid]||{}).hrad){const rv0=(()=>{try{return RVX()||[]}catch(e){return[]}})(),dSg=(x,z,a,b)=>{const vx=b[0]-a[0],vz=b[1]-a[1],l2=vx*vx+vz*vz||1;let t=((x-a[0])*vx+(z-a[1])*vz)/l2;t=t<0?0:t>1?1:t;return Math.hypot(x-a[0]-vx*t,z-a[1]-vz*t)};
   let best=null;for(let i=0;i<36;i++){const a=i/36*6.283;let wr=0;wall0.forEach(q=>{const aq=Math.atan2(q[1]-cen0[1],q[0]-cen0[0]);let da=Math.abs(aq-a);if(da>3.1416)da=6.283-da;if(da<.2)wr=Math.max(wr,Math.hypot(q[0]-cen0[0],q[1]-cen0[1]))});if(!wr)continue;
    const x=cen0[0]+Math.cos(a)*(wr+19),z=cen0[1]+Math.sin(a)*(wr+19);let ok=true,rd=1e9;
    for(let j=0;j<rv0.length-1;j++){const d=dSg(x,z,rv0[j],rv0[j+1]);rd=Math.min(rd,d);if(d<22){ok=false;break}}if(!ok)continue;
    if(SITES.some(q=>Math.hypot(q.x-x,q.z-z)<q.r+22))continue;if(gates0.some(q=>dSg(x,z,q,[q[0]+(q[0]-cen0[0])*1.6,q[1]+(q[1]-cen0[1])*1.6])<20))continue;
    if(SITES.some(q=>{const o=gates0.length?gates0.reduce((b,gq)=>Math.hypot(gq[0]-q.x,gq[1]-q.z)<Math.hypot(b[0]-q.x,b[1]-q.z)?gq:b,gates0[0]):cen0;return dSg(x,z,o,[q.x,q.z])<18}))continue;
    const sc=-(rv0.length?rd:0)-i*.01;if(!best||sc>best.sc)best={x,z,sc,a}}
   if(best)CASTLE=[best.x,best.z,HN,best.a]}}catch(e){console.warn("3D hrad – miesto",e)}
 if(!L.canal&&SITES.length)try{const FL=[],sstep=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t)};
  SITES.forEach(q=>FL.push([q.x,q.z,q.r+3]));if(CASTLE)FL.push([CASTLE[0],CASTLE[1],21]);
  const outs=(gates0.length?gates0:wall0.filter((_,i)=>i%5===0)).map(q=>{const d=Math.hypot(q[0],q[1])||1;return[q[0]+q[0]/d*4,q[1]+q[1]/d*4]});
  SITES.forEach(q=>{let b=null;outs.forEach(o=>{const d=Math.hypot(o[0]-q.x,o[1]-q.z);if(!b||d<b.d)b={d,o}});if(!b)return;const mx=(b.o[0]+q.x)/2+(q.z-b.o[1])*.08,mz=(b.o[1]+q.z)/2-(q.x-b.o[0])*.08,n=Math.ceil(b.d/2.2);for(let i=0;i<=n;i++){const t=i/n,a=(1-t)*(1-t),c=2*t*(1-t),e=t*t;FL.push([a*b.o[0]+c*mx+e*q.x,a*b.o[1]+c*mz+e*q.z,2.4])}});
  gates0.forEach(q=>{const dx=q[0]-cen0[0],dz=q[1]-cen0[1],dl=Math.hypot(dx,dz)||1;for(let t=0;t<=52;t+=2.5)FL.push([q[0]+dx/dl*t,q[1]+dz/dl*t,2.6])});
  if(L.river){const rp=RVX();for(let i=0;i<rp.length-1;i++){const a=rp[i],b=rp[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3.5));for(let k=0;k<n;k++)FL.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n,11.5])}}
  const EH=R1+75;
  TH=(x,z)=>{const r=Math.hypot(x,z);if(r<R0+8)return 0;const ed=Math.max(Math.abs(x),Math.abs(z));if(ed>EH-3)return 0;let m=sstep(R0+8,R0+42,r)*(1-sstep(EH-28,EH-3,ed));if(m<=0)return 0;
   for(let i=0;i<FL.length;i++){const f=FL[i],dx=f[0]-x,dz=f[1]-z;if(dx>f[2]+11||dx<-f[2]-11||dz>f[2]+11||dz<-f[2]-11)continue;const d=Math.hypot(dx,dz);if(d<=f[2])return 0;const v=sstep(f[2],f[2]+11,d);if(v<m)m=v}
   const n=Math.sin(x*.031+1.7)*Math.cos(z*.027-.4)+Math.sin(x*.071+z*.053+2.1)*.5+Math.cos(x*.13-z*.11)*.22;return Math.max(0,n+.45)*(2.4+3.8*sstep(R0+60,R1+30,r))*m};
  const SEG=170,tg=new T.PlaneGeometry(EH*2,EH*2,SEG,SEG);tg.rotateX(-Math.PI/2);const pa=tg.attributes.position;for(let i=0;i<pa.count;i++)pa.setY(i,TH(pa.getX(i),pa.getZ(i)));tg.computeVertexNormals();
  const tm=grassMat(S.season,EH*2/22);if(snow){tm.emissive=new T.Color("#8a98a8");tm.emissiveIntensity=.3}const tmesh=new T.Mesh(tg,tm);tmesh.position.y=.02;tmesh.receiveShadow=true;g.add(tmesh);
  /* lesy a skaly na kopcoch */
  {let sd=cid*977+13;const R=()=>(sd=(sd*16807+7)%2147483647)/2147483647;const spots=[];for(let t=0;t<400&&spots.length<9;t++){const a=R()*6.283,r=R0+38+R()*(R1-R0-45),x=Math.cos(a)*r,z=Math.sin(a)*r;if(TH(x,z)<1.2)continue;if(spots.some(q=>Math.hypot(q[0]-x,q[1]-z)<22))continue;spots.push([x,z])}
   const trees=[];spots.forEach((q,si)=>{const n=14+Math.floor(R()*16);for(let i=0;i<n;i++){const a=R()*6.283,d=Math.sqrt(R())*11,x=q[0]+Math.cos(a)*d,z=q[1]+Math.sin(a)*d,h=TH(x,z);if(h<.5)continue;trees.push([x,h,z,3.4+R()*2.6,si%3===2])}});
   if(trees.length){const pineC=snow?[.8,.86,.9]:[.2,.36,.2],leafC2=snow?[.86,.9,.92]:S.season===2?[.78,.46,.16]:[.34,.52,.24];const cg=new T.ConeGeometry(1,1,7),cm2=new T.MeshPhongMaterial({flatShading:true,shininess:0,specular:0}),im=new T.InstancedMesh(cg,cm2,trees.length*3),tr=new T.InstancedMesh(new T.CylinderGeometry(.12,.17,1,5),new T.MeshLambertMaterial({color:"#4a2e14"}),trees.length),dm=new T.Object3D(),col=new T.Color();let n=0;
    trees.forEach((t,ti)=>{const[x,y,z,h,lf]=t;dm.position.set(x,y+h*.2,z);dm.scale.set(1,h*.4,1);dm.rotation.set(0,0,0);dm.updateMatrix();tr.setMatrixAt(ti,dm.matrix);for(let k=0;k<3;k++){const rr=lf?h*(.34-k*.04):h*(.34-k*.07),hh=lf?h*.36:h*.42;dm.position.set(x,y+h*(.42+k*.22),z);dm.scale.set(rr,hh,rr);dm.rotation.set(0,ti+k,0);dm.updateMatrix();im.setMatrixAt(n,dm.matrix);const kk=.8+((ti*7+k*3)%5)*.08,c0=lf?leafC2:pineC;col.setRGB(c0[0]*kk,c0[1]*kk,c0[2]*kk);im.setColorAt(n,col);n++}});
    im.castShadow=tr.castShadow=true;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;g.add(im);g.add(tr)}
   const rm2=new T.MeshPhongMaterial({color:snow?"#dfe6ea":"#8f8b80",flatShading:true,shininess:0,specular:0}),rgeo=new T.DodecahedronGeometry(1,0);for(let i=0;i<26;i++){const a=R()*6.283,r=R0+45+R()*(R1-R0-50),x=Math.cos(a)*r,z=Math.sin(a)*r,h=TH(x,z);if(h<2)continue;const m=new T.Mesh(rgeo,rm2);const sc=.6+R()*1.4;m.scale.set(sc*1.3,sc*.8,sc);m.rotation.set(R(),R()*6,R());m.position.set(x,h+sc*.25,z);m.castShadow=true;g.add(m)}}
  /* ---------- krajina (v244): lesnaté pohorie na pokojnej strane, polia v pásoch, vinice na svahoch ---------- */
  try{let sd=(cid|0)*613+29+(String(cid).length*7);const R=()=>(sd=(sd*16807+7)%2147483647)/2147483647;
   const freeFL=(x,z,pad)=>{for(let i=0;i<FL.length;i++){const f=FL[i];if(Math.abs(f[0]-x)>f[2]+pad||Math.abs(f[1]-z)>f[2]+pad)continue;if(Math.hypot(f[0]-x,f[1]-z)<f[2]+pad)return false}return true};
   const rv=(()=>{try{return RVX()||[]}catch(e){return[]}})();let bestA=0,bs=-1e9;
   for(let k=0;k<16;k++){const a=k/16*6.283;let sc=0;for(let r=R0+40;r<EH+150;r+=18){const x=Math.cos(a)*r,z=Math.sin(a)*r;if(!freeFL(x,z,4))sc-=1;for(let i=0;i<rv.length;i+=2)if(Math.hypot(rv[i][0]-x,rv[i][1]-z)<26){sc-=3;break}}if(sc>bs){bs=sc;bestA=a}}
   const adiff=a=>{let d=Math.abs(((a-bestA)%6.283+6.283)%6.283);return d>3.1416?6.283-d:d};
   /* vzdialené zalesnené kopce */
   const MND=[];for(let i=0;i<10;i++){const a=bestA+(R()-.5)*1.7,r=EH+25+R()*150;MND.push([Math.cos(a)*r,Math.sin(a)*r,38+R()*48,9+R()*17])}
   const mh=(x,z)=>{let h=0;for(const m of MND){const d=Math.hypot(x-m[0],z-m[1])/m[2];if(d<1)h=Math.max(h,m[3]*Math.sqrt(1-d*d))}return h};
   const hillC=snow?"#dfe6ea":S.season===2?"#6a6a34":"#3f5f30",hg=new T.SphereGeometry(1,28,10,0,6.283,0,Math.PI/2),hm=M(hillC);
   MND.forEach(m=>{const k=new T.Mesh(hg,hm);k.scale.set(m[2],m[3],m[2]);k.position.set(m[0],0,m[1]);k.receiveShadow=true;g.add(k)});
   /* les: stromy na kopcoch v smere pohoria a na vzdialených kopcoch */
   const TR=[];for(let t=0;t<9000&&TR.length<(QLV===0?900:QLV===1?1800:2600);t++){const a=bestA+(R()-.5)*2.1,r=R0+40+R()*(EH+175-R0-40),x=Math.cos(a)*r,z=Math.sin(a)*r;
    const nz=Math.sin(x*.045+1.3)*Math.cos(z*.04-.7)+Math.sin((x+z)*.021)*.6;if(nz<-.15)continue;let y;
    if(r<EH-4){const h=TH(x,z);if(h<.7||!freeFL(x,z,3))continue;y=h+.02}else{const h=mh(x,z);if(h<.8&&R()<.8)continue;y=h}
    TR.push([x,y,z,3.6+R()*3.4,R()<.35])}
   if(TR.length){const pineC=snow?[.82,.87,.9]:[.17,.31,.17],leafC=snow?[.86,.9,.92]:S.season===2?[.74,.42,.14]:S.season===0?[.42,.62,.28]:[.3,.47,.2];
    const im=new T.InstancedMesh(new T.ConeGeometry(1,1,6),new T.MeshPhongMaterial({flatShading:true,shininess:0,specular:0}),TR.length),dm=new T.Object3D(),col=new T.Color();
    TR.forEach((t,i)=>{const[x,y,z,h,lf]=t;dm.position.set(x,y+h*.45,z);const rr=lf?h*.36:h*.27;dm.scale.set(rr,h,rr);dm.rotation.set(0,i,0);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);const kk=.78+((i*7)%6)*.07,c0=lf?leafC:pineC;col.setRGB(c0[0]*kk,c0[1]*kk,c0[2]*kk);im.setColorAt(i,col)});
    im.castShadow=true;im.receiveShadow=true;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;g.add(im)}
   /* polia v pásoch okolo mesta (mimo ciest, miest, rieky a lesa) */
   const PAL3=snow?["#e9edef","#dfe5e8","#f2f4f5"]:[["#7fa04a","#8a6a44","#9ab858","#6f8f3e"],["#d8b850","#b8c058","#caa448","#9fb050"],["#9a7a48","#6a5030","#b89a58","#7d6a3c"]][S.season];
   const V=[],Cc=[],I=[],parcels=[];const cc=new T.Color();
   for(let t=0;t<500&&parcels.length<22;t++){const a=R()*6.283;if(adiff(a)<.75)continue;const r=R0+16+R()*72,x=Math.cos(a)*r,z=Math.sin(a)*r,W=16+R()*12,D=11+R()*8;
    if(parcels.some(q=>Math.hypot(q[0]-x,q[1]-z)<(q[2]+W)*.62))continue;const th=a+(R()<.5?0:Math.PI/2),ux=Math.cos(th),uz=Math.sin(th),vx=-uz,vz=ux;
    const pt=(u,v)=>[x+ux*u+vx*v,z+uz*u+vz*v];let ok=true;for(const[u,v]of[[-W/2,-D/2],[W/2,-D/2],[W/2,D/2],[-W/2,D/2],[0,0],[0,-D/2],[0,D/2],[-W/2,0],[W/2,0]]){const q=pt(u,v);if(!freeFL(q[0],q[1],1.5)||TH(q[0],q[1])>3.2||Math.hypot(q[0],q[1])<R0+9){ok=false;break}}if(!ok)continue;
    parcels.push([x,z,W]);const n=5+Math.floor(R()*4),NX=8;for(let si=0;si<n;si++){cc.set(PAL3[Math.floor(R()*PAL3.length)]);const v0=-D/2+D*si/n+.12,v1=-D/2+D*(si+1)/n-.12,base=V.length/3;
     for(let ix=0;ix<=NX;ix++){const u=-W/2+W*ix/NX;[v0,v1].forEach(v=>{const q=pt(u,v),k=.9+R()*.18;V.push(q[0],TH(q[0],q[1])+.075,q[1]);Cc.push(cc.r*k,cc.g*k,cc.b*k)})}
     for(let ix=0;ix<NX;ix++){const k=base+ix*2;I.push(k,k+1,k+2,k+1,k+3,k+2)}}}
   if(I.length){const geo=new T.BufferGeometry();geo.setAttribute("position",new T.Float32BufferAttribute(V,3));geo.setAttribute("color",new T.Float32BufferAttribute(Cc,3));geo.setIndex(I);geo.computeVertexNormals();
    const fm=new T.Mesh(geo,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));fm.receiveShadow=true;g.add(fm)}
   /* vinice na svahoch pod lesom */
   if(!snow){const VN=[];for(let t=0;t<400&&VN.length<900;t++){const a=bestA+(R()-.5)*1.4,r=R0+22+R()*55,x=Math.cos(a)*r,z=Math.sin(a)*r;if(TH(x,z)<.6)continue;
     const th=a+Math.PI/2,ux=Math.cos(th),uz=Math.sin(th),vx=-uz,vz=ux;let ok=true;for(const[u,v]of[[-7,-5],[7,-5],[7,5],[-7,5],[0,0]]){const qx=x+ux*u+vx*v,qz=z+uz*u+vz*v;if(!freeFL(qx,qz,1)||TH(qx,qz)<.3){ok=false;break}}if(!ok)continue;
     for(let rw=0;rw<7;rw++)for(let c2=0;c2<13;c2++){const u=-6+c2,v=-4.2+rw*1.4,qx=x+ux*u+vx*v,qz=z+uz*u+vz*v;VN.push([qx,TH(qx,qz),qz,th])}t+=40}
    if(VN.length){const vm=new T.InstancedMesh(new T.BoxGeometry(.9,.75,.42),M(S.season===2?"#b0782a":S.season===0?"#7a9a40":"#4f7a2e"),VN.length),dm=new T.Object3D();VN.forEach((q,i)=>{dm.position.set(q[0],q[1]+.42,q[2]);dm.rotation.set(0,-q[3],0);dm.scale.set(1,.85+((i*13)%5)*.06,1);dm.updateMatrix();vm.setMatrixAt(i,dm.matrix)});vm.castShadow=true;vm.receiveShadow=true;g.add(vm)}}
  }catch(e){console.warn("3D krajina",e)}
 }catch(e){console.warn("3D terén",e);TH=()=>0}
 if(!L.canal)try{const bt=new T.CanvasTexture(blobTex());for(let i=0;i<70;i++){const a=i*2.399,r=12+((i*53)%100)/100*(R1+40),dk=i%2;const m=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshLambertMaterial({map:bt,color:snow?(dk?"#c8d4de":"#ffffff"):dk?"#4f7a3a":"#c8d880",transparent:true,opacity:snow?.35:dk?.38:.3,depthWrite:false}));const sz=14+((i*37)%30);m.scale.set(sz,sz*(.6+((i*7)%5)*.1),1);m.rotation.x=-Math.PI/2;m.rotation.z=i;m.position.set(Math.cos(a)*r,.028+i*.0002,Math.sin(a)*r);if(TH(m.position.x,m.position.z)>.05)m.visible=false;g.add(m)}}catch(e){}
 (L.streets||[]).forEach(s=>ribbon(g,s.map(wx),3.1,snow?"#b8b8b0":"#8f7a54",.052,false));if(L.ring&&L.ring.length>2)ribbon(g,L.ring.map(wx),2.9,snow?"#b8b8b0":"#8f7a54",.045,true);
 (L.streets||[]).forEach(s=>ribbon(g,s.map(wx),2.4,snow?"#d8d8d0":"#cdb88a",.06,false,"cobble"));
 if(L.ring&&L.ring.length>2)ribbon(g,L.ring.map(wx),2.2,snow?"#d8d8d0":"#cdb88a",.05,true,"cobble");
 try{(L.streets||[]).forEach(s2=>softRibbon(g,s2.map(wx),5.6,MUDC(),.046,false,.45));if(L.ring&&L.ring.length>2)softRibbon(g,L.ring.map(wx),5,MUDC(),.04,true,.45)}catch(e){console.warn("3D okraje ulíc",e)}
 const pl=wx(L.pl);const plz=new T.Mesh(new T.CircleGeometry(9.5,28),MT("cobble",snow?"#d4d4cc":"#b9ad98",7,7));plz.rotation.x=-Math.PI/2;plz.position.set(pl[0],.07,pl[1]);plz.receiveShadow=true;g.add(plz);
 try{const wq=wx3(),np=wq==="dazd"?44:(S.season===0||S.season===2)&&wq!=="sneh"?16:0;if(np&&!snow){let sd=(cid|0)*977+S.year*13+S.season;const R=()=>(sd=(sd*16807+7)%2147483647)/2147483647;
  if(!GFX.pud){const c=document.createElement("canvas");c.width=c.height=64;const x=c.getContext("2d");x.fillStyle="#000";x.fillRect(0,0,64,64);for(let i=0;i<5;i++){const px=22+R()*20,py=22+R()*20,r=12+R()*10,gr=x.createRadialGradient(px,py,0,px,py,r);gr.addColorStop(0,"#fff");gr.addColorStop(.7,"#ddd");gr.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=gr;x.fillRect(0,0,64,64)}GFX.pud=new T.CanvasTexture(c)}
  const pm=new T.MeshPhongMaterial({color:"#56646e",specular:"#f4f8ff",shininess:140,transparent:true,opacity:.85,alphaMap:GFX.pud,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),pg=new T.CircleGeometry(1,18);
  const put=(x,z,y,s2)=>{const m=new T.Mesh(pg,pm);m.rotation.x=-Math.PI/2;m.rotation.z=R()*6.28;m.scale.set(s2*(.7+R()*.7),s2*(.45+R()*.4),1);m.position.set(x,y,z);m.receiveShadow=true;m.renderOrder=2;g.add(m)};
  const sts=(L.streets||[]).map(s2=>s2.map(wx));for(let i=0;i<np;i++){if(i%5===0){const a=R()*6.28,r=3+R()*3.5;put(pl[0]+Math.cos(a)*r,pl[1]+Math.sin(a)*r,.115,.9);continue}
   const st=sts[Math.floor(R()*sts.length)];if(!st||st.length<2)continue;const j=Math.floor(R()*(st.length-1)),t=R(),a=st[j],b=st[j+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,o=(R()-.5)*1.4;put(a[0]+dx*t-dz/l*o,a[1]+dz*t+dx/l*o,.1,.75)}}}catch(e){console.warn("3D kaluže",e)}
 /* hradby s vežami a bránami */
 const wall=L.wall.map(wx),gates=(L.gates||[]).map(wx),WSOL=[];
 const K=mapKit(g);K.g3=g;if(!L.canal)K.SK.lmb=[];try{if(!L.canal&&L.river&&L.river.length>3&&S.cw&&S.cw[cid]&&S.cw[cid].pristav)K.SK.nopier=true}catch(e){}
 const LMC=()=>(K.SK.lmb||[]).map(sp=>{const l1=Math.hypot(sp[1][0]-sp[0][0],sp[1][1]-sp[0][1]),l2=Math.hypot(sp[2][0]-sp[1][0],sp[2][1]-sp[1][1]),a=l1>l2?sp[0]:sp[1],b=l1>l2?sp[1]:sp[2];return[(sp[0][0]+sp[2][0])/2,(sp[0][1]+sp[2][1])/2,Math.atan2(b[1]-a[1],b[0]-a[0])]});const cen=wx([L.cx,L.cy]);
 /* vodné brány (v111): kde rieka pretína hradbu, múr sa preruší oblúkom s mrežou */
 const WG=[];if(!L.canal&&L.river&&L.river.length>1)try{const rv0=L.river.map(wx);for(let i=0;i<wall.length;i++){const a=wall[i],b=wall[(i+1)%wall.length];for(let j=0;j<rv0.length-1;j++){const c=rv0[j],d=rv0[j+1],r=[b[0]-a[0],b[1]-a[1]],s2=[d[0]-c[0],d[1]-c[1]],den=r[0]*s2[1]-r[1]*s2[0];if(Math.abs(den)<1e-6)continue;const t=((c[0]-a[0])*s2[1]-(c[1]-a[1])*s2[0])/den,u=((c[0]-a[0])*r[1]-(c[1]-a[1])*r[0])/den;if(t<0||t>1||u<0||u>1)continue;const x=a[0]+r[0]*t,z=a[1]+r[1]*t,an=Math.atan2(r[1],r[0]),sn=Math.abs(Math.sin(an-Math.atan2(s2[1],s2[0])));if(gates.some(q=>Math.hypot(q[0]-x,q[1]-z)<9)||WG.some(q=>Math.hypot(q[0]-x,q[1]-z)<14))continue;WG.push([x,z,an,Math.min(9,5.6/Math.max(.45,sn))])}}}catch(e){}
 const wgIn=q=>WG.some(w=>Math.hypot(w[0]-q[0],w[1]-q[1])<w[3]);
 const WSEG=[],wgClip=(a,b,LS)=>{let segs=[[0,1]];const dx=b[0]-a[0],dz=b[1]-a[1],A=dx*dx+dz*dz;LS.forEach(w=>{const fx=a[0]-w[0],fz=a[1]-w[1],B=2*(fx*dx+fz*dz),C=fx*fx+fz*fz-w[3]*w[3],D=B*B-4*A*C;if(D<=0)return;const t0=(-B-Math.sqrt(D))/(2*A),t1=(-B+Math.sqrt(D))/(2*A);segs=segs.flatMap(g2=>t1<=g2[0]||t0>=g2[1]?[g2]:[[g2[0],Math.min(g2[1],t0)],[Math.max(g2[0],t1),g2[1]]].filter(q=>q[1]-q[0]>.02))});return segs.map(g2=>[[a[0]+dx*g2[0],a[1]+dz*g2[0]],[a[0]+dx*g2[1],a[1]+dz*g2[1]]])};
 if(!L.canal){for(let i=0;i<wall.length;i++){const a=wall[i],b=wall[(i+1)%wall.length],mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;const len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<.01)continue;
  if(gates.some(q=>Math.hypot(q[0]-mx,q[1]-mz)<3.4))continue;
  WSEG.push([a,b]);if(i%6===0&&!wgIn(a))K.cyl(a[0],a[1],1.9,7.5,{roof:3});const n=Math.max(1,Math.ceil(len/1.3));for(let k=0;k<=n;k++)WSOL.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n,.95])}
  WG.forEach(w=>{try{const wg=new T.Group(),gl=w[3]*2,sm=MT("stone","#a8a294",3,1);const lin=new T.Mesh(new T.BoxGeometry(gl+.6,2.5,1.7),sm);lin.position.y=4.35;lin.castShadow=true;wg.add(lin);
    for(let k=0;k<5;k++){const vs=new T.Mesh(new T.BoxGeometry(gl/5+.02,.5-Math.abs(k-2)*.0+(k===2?0:(Math.abs(k-2)===1?.35:.9)),1.7),sm);vs.position.set(-gl/2+gl/5*(k+.5),3.1-vs.geometry.parameters.height/2,0);wg.add(vs)}
    for(let x=-gl/2+1;x<gl/2-.2;x+=3)[.86,-.86].forEach(o=>{const cr=new T.Mesh(new T.BoxGeometry(1.5,.6,.24),sm);cr.position.set(x+.5,5.9,o*.9);wg.add(cr)});
    const bm=M("#26221e");for(let x=-gl/2+.5;x<gl/2;x+=.8){const br=new T.Mesh(new T.BoxGeometry(.11,3,.11),bm);br.position.set(x,1.5,0);wg.add(br)}[.9,2].forEach(y=>{const hb=new T.Mesh(new T.BoxGeometry(gl,.11,.11),bm);hb.position.set(0,y,0);wg.add(hb)});
    wg.position.set(w[0],0,w[1]);wg.rotation.y=-w[2];g.add(wg);[-1,1].forEach(o=>K.cyl(w[0]+Math.cos(w[2])*w[3]*o,w[1]+Math.sin(w[2])*w[3]*o,1.5,6.6,{roof:3}))}catch(e){console.warn("3D vodná brána",e)}})
 gates.forEach(q=>{const ax=Math.abs(q[0]-cen[0])>Math.abs(q[1]-cen[1]);K.gate(q[0],q[1],ax);(ax?[[0,-1.8],[0,1.8],[-1.6,-1.8],[1.6,-1.8],[-1.6,1.8],[1.6,1.8]]:[[-1.8,0],[1.8,0],[-1.8,-1.6],[-1.8,1.6],[1.8,-1.6],[1.8,1.6]]).forEach(o=>WSOL.push([q[0]+o[0],q[1]+o[1],.85]))})}
 const MOSTK=()=>{const r0=(L.river||[]).map(wx),k0=Math.floor(r0.length*.45),ok=k=>{const a=r0[k],b=r0[k+1];const an=Math.atan2(b[1]-a[1],b[0]-a[0]);return!LMC().some(q=>Math.hypot(q[0]-a[0],q[1]-a[1])<16)&&[-11,-8,-5,5,8,11].every(o=>{const x=a[0]+Math.sin(an)*o,z=a[1]-Math.cos(an)*o;return!WSOL.some(w=>Math.hypot(w[0]-x,w[1]-z)<4.2)})};for(let d=0;d<r0.length;d++)for(const k of[k0+d,k0-d])if(k>=0&&k<r0.length-1&&ok(k))return k;let bk=k0,bs=-1;for(let k=Math.floor(r0.length*.15);k<r0.length*.85-1;k++){const a=r0[k],b=r0[k+1],an=Math.atan2(b[1]-a[1],b[0]-a[0]);if(LMC().some(q=>Math.hypot(q[0]-a[0],q[1]-a[1])<16))continue;let m=1e9;[-9,9].forEach(o=>{const x=a[0]+Math.sin(an)*o,z=a[1]-Math.cos(an)*o;WSOL.forEach(w=>{const d=Math.hypot(w[0]-x,w[1]-z);if(d<m)m=d})});if(m>bs){bs=m;bk=k}}return bk};
 const LMV=[];let CRC=null,CR0=null;const CROSSX=only=>{if(only&&CR0)return CR0;if(!only&&CRC)return CRC;const fin=q=>{const sn=Math.max(.28,Math.abs(Math.sin(q[2]-q[3]))),hl=Math.min(18,4.7/sn+4.2);q.hl=hl;q.a=[q[0]-Math.cos(q[2])*hl,q[1]-Math.sin(q[2])*hl];q.b=[q[0]+Math.cos(q[2])*hl,q[1]+Math.sin(q[2])*hl]};
  const outs=(gates.length?gates:wall.filter((_,i)=>i%5===0)).map(q=>{const d=Math.hypot(q[0],q[1])||1;return[q[0]+q[0]/d*4,q[1]+q[1]/d*4]});
  const siteRoads=SITES.map(q=>{let b=null;outs.forEach(o=>{const d=Math.hypot(o[0]-q.x,o[1]-q.z);if(!b||d<b.d)b={d,o}});if(!b)return null;const mx=(b.o[0]+q.x)/2+(q.z-b.o[1])*.08,mz=(b.o[1]+q.z)/2-(q.x-b.o[0])*.08,pts=[];for(let t=0;t<=1.001;t+=.1){const a=(1-t)*(1-t),c=2*t*(1-t),e=t*t;pts.push([a*b.o[0]+c*mx+e*q.x,a*b.o[1]+c*mz+e*q.z])}return pts}).filter(Boolean);
  const rv=RVX(),X=[];const segX=(a,b,c,d)=>{const r=[b[0]-a[0],b[1]-a[1]],s2=[d[0]-c[0],d[1]-c[1]],den=r[0]*s2[1]-r[1]*s2[0];if(Math.abs(den)<1e-6)return null;const t=((c[0]-a[0])*s2[1]-(c[1]-a[1])*s2[0])/den,u=((c[0]-a[0])*r[1]-(c[1]-a[1])*r[0])/den;return t>=0&&t<=1&&u>=0&&u<=1?[a[0]+r[0]*t,a[1]+r[1]*t,Math.atan2(r[1],r[0])]:null};
   const roads3=(L.streets||[]).map(s2=>s2.map(wx)).concat(L.ring&&L.ring.length>2?[L.ring.concat([L.ring[0]]).map(wx)]:[],siteRoads,gates.map(q=>{const dx=q[0]-cen[0],dz=q[1]-cen[1],dl=Math.hypot(dx,dz)||1;return[[q[0]-dx/dl*8,q[1]-dz/dl*8],[q[0]+dx/dl*52,q[1]+dz/dl*52]]}),gates.map(q=>{const dx=q[0]-cen[0],dz=q[1]-cen[1],dl=Math.hypot(dx,dz)||1;return[[pl[0]+dx/dl*11,pl[1]+dz/dl*11],[q[0],q[1]]]}));
   roads3.forEach(rd=>{for(let i=0;i<rd.length-1;i++)for(let j=0;j<rv.length-1;j++){const q=segX(rd[i],rd[i+1],rv[j],rv[j+1]);if(q)q[3]=Math.atan2(rv[j+1][1]-rv[j][1],rv[j+1][0]-rv[j][0]);if(q&&!X.some(o=>Math.hypot(o[0]-q[0],o[1]-q[1])<10))X.push(q)}});
   if(only){X.forEach(fin);return CR0=X}
   /* pamätný most sa posunie po rieke, ak by končil v múre bez bránky alebo v budove (v116) */
   const endOK=(e,ux,uz)=>{let best=null;for(let t=-4;t<=6;t+=.5){const x=e[0]+ux*t,z=e[1]+uz*t;for(const w of WSOL){const d=Math.hypot(w[0]-x,w[1]-z);if(d<1&&(!best||d<best.d))best={d,w}}}
     if(!best)return!solids.some(o=>o[2]>=1.6&&Math.hypot(o[0]-e[0],o[1]-e[1])<o[2]+1.6);const w=best.w,far=(L2,r)=>!L2.some(o=>Math.hypot(o[0]-w[0],o[1]-w[1])<r);if(!far(gates,8)||!far(WG,12)||!far(wall.filter((_,i)=>i%6===0),3.2))return false;
     const dl=Math.hypot(w[0]-cen[0],w[1]-cen[1])||1,ix=w[0]+(cen[0]-w[0])/dl*3.4,iz=w[1]+(cen[1]-w[1])/dl*3.4;return!solids.some(o=>o[2]>=1&&Math.hypot(o[0]-ix,o[1]-iz)<o[2]+2)};
   const lmFix=m=>{const mk=(x,z,an)=>{const ux=Math.cos(an+Math.PI/2),uz=Math.sin(an+Math.PI/2);return endOK([x-ux*8.9,z-uz*8.9],-ux,-uz)&&endOK([x+ux*8.9,z+uz*8.9],ux,uz)};if(mk(m[0],m[1],m[2]-Math.PI/2))return m;
     const c=[];for(let j=0;j<rv.length-1;j++){const a=rv[j],b=rv[j+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(l/2)),an=Math.atan2(b[1]-a[1],b[0]-a[0]);for(let k=0;k<n;k++){const x=a[0]+(b[0]-a[0])*k/n,z=a[1]+(b[1]-a[1])*k/n,d=Math.hypot(x-m[0],z-m[1]);if(d<48&&d>3)c.push([d,x,z,an])}}
     c.sort((a,b)=>a[0]-b[0]);for(const q of c)if(mk(q[1],q[2],q[3])){LMV.push(q[0]);return[q[1],q[2],q[3]+Math.PI/2]}LMV.push(-1);return m};
   try{LMC().forEach(m0=>{let m=m0;try{m=lmFix(m0)}catch(e){}for(let n=X.length-1;n>=0;n--)if(Math.hypot(X[n][0]-m[0],X[n][1]-m[1])<11)X.splice(n,1);const q=[m[0],m[1],m[2],m[2]+Math.PI/2];q.lm=1;X.push(q);m=m0;for(let n=solids.length-1;n>=0;n--)if(Math.hypot(solids[n][0]-m[0],solids[n][1]-m[1])<1.2)solids.splice(n,1)})}catch(e){}
   try{const cw=(S.cw&&S.cw[cid])||{};if(cw.most&&L.river.length>3&&!(town&&LMC().length)){const r0=L.river.map(wx),k=MOSTK(),a=r0[k],b=r0[k+1]||r0[k-1],an=Math.atan2(b[1]-a[1],b[0]-a[0]);for(let n=X.length-1;n>=0;n--)if(Math.hypot(X[n][0]-a[0],X[n][1]-a[1])<9)X.splice(n,1);const q=[a[0],a[1],an+Math.PI/2,an];q.fam=1;X.push(q)}}catch(e){}
   X.forEach(fin);
  return CRC=X};
 const nearBR=(x,z,r)=>{try{if(L.canal||!L.river||L.river.length<2)return false;return CROSSX(true).some(q=>{const vx=q.b[0]-q.a[0],vz=q.b[1]-q.a[1],l2=vx*vx+vz*vz||1;let t=((x-q.a[0])*vx+(z-q.a[1])*vz)/l2;t=t<-.15?-.15:t>1.15?1.15:t;return Math.hypot(x-q.a[0]-vx*t,z-q.a[1]-vz*t)<r+2.4})}catch(e){return false}};

 let PGS=[];let PRC=null;const PRIK=()=>{if(PRC)return PRC;const r0=(L.river||[]).map(wx),k0=Math.floor(r0.length*.7);const mk=(k,sg)=>{const a=r0[k],b=r0[k+1],ang=Math.atan2(b[1]-a[1],b[0]-a[0]),th=sg>0?Math.PI-ang:-ang,c=Math.cos(th),sn=Math.sin(th);return{k,sg,a,ang,th,W:(x,z)=>[a[0]+x*c+z*sn,a[1]-x*sn+z*c]}};
  const dS=(x,z,a,b)=>{const vx=b[0]-a[0],vz=b[1]-a[1],l2=vx*vx+vz*vz||1;let t=((x-a[0])*vx+(z-a[1])*vz)/l2;t=t<0?0:t>1?1:t;return Math.hypot(x-a[0]-vx*t,z-a[1]-vz*t)};
  const outs=(gates.length?gates:wall.filter((_,i)=>i%5===0)).map(q=>{const d=Math.hypot(q[0],q[1])||1;return[q[0]+q[0]/d*4,q[1]+q[1]/d*4]});
  const RD=(L.streets||[]).map(s2=>s2.map(wx)).concat(L.ring&&L.ring.length>2?[L.ring.concat([L.ring[0]]).map(wx)]:[],gates.map(q=>{const dx=q[0]-cen[0],dz=q[1]-cen[1],dl=Math.hypot(dx,dz)||1;return[[cen[0]+dx/dl*8,cen[1]+dz/dl*8],[q[0]+dx/dl*52,q[1]+dz/dl*52]]}),SITES.map(q=>{let b=null;outs.forEach(u=>{const d=Math.hypot(u[0]-q.x,u[1]-q.z);if(!b||d<b.d)b={d,u}});return b?[b.u,[(b.u[0]+q.x)/2+(q.z-b.u[1])*.08,(b.u[1]+q.z)/2-(q.x-b.u[0])*.08],[q.x,q.z]]:null}).filter(Boolean));
  const mk0=(()=>{try{return(S.cw&&S.cw[cid]||{}).most&&!(town&&LMC().length)?r0[MOSTK()]:null}catch(e){return null}})();
  const clear=(o,cd)=>cd<=0||[-9,-4.5,0,4.5,9].every(x=>{const q=o.W(x,0);return!(mk0&&Math.hypot(mk0[0]-q[0],mk0[1]-q[1])<14)&&!LMC().some(m=>Math.hypot(m[0]-q[0],m[1]-q[1])<16)&&RD.every(rd=>{for(let i=0;i<rd.length-1;i++)if(dS(q[0],q[1],rd[i],rd[i+1])<cd)return false;return true})});
  const BX=(()=>{try{return CROSSX()}catch(e){return[]}})();const offBr=o=>[-10,-5,0,5,10].every(x=>[0,4,8].every(z=>{const q=o.W(x,z);return BX.every(b=>dS(q[0],q[1],b.a,b.b)>5.5)}));
  const ok=(o,cd)=>offBr(o)&&clear(o,cd)&&[-8,-4,0,4,8].every(x=>[5,7.5,10,12.5].every(z=>{const q=o.W(x,z);return!WSOL.some(w=>Math.hypot(w[0]-q[0],w[1]-q[1])<3)&&!solids.some(w=>Math.hypot(w[0]-q[0],w[1]-q[1])<w[2]+1.5)&&!r0.some(w=>Math.hypot(w[0]-q[0],w[1]-q[1])<4.6)}));
  for(const cd of[10,7,4.5,0])for(let d=0;d<r0.length;d++)for(const k of[k0+d,k0-d])if(k>=0&&k<r0.length-1)for(const sg of[1,-1]){const o=mk(k,sg);if(ok(o,cd))return PRC=o}return PRC=mk(Math.min(r0.length-2,k0),1)};
 /* pozemky a budovy */
 const inter=[],solids=[];let room=null;WSOL.forEach(q=>solids.push(q));
 const add=(x,z,r,text,act,kind)=>inter.push({x,z,r,text,act,kind});
 const lots=S.lots;
 /* stavba a opustenie ako na mape (v260): lešenie s robotníkmi, keď sa dielňa tento štvrťrok stavia alebo rozširuje; burina a zabité dvere, keď stojí */
 const BUILDQ=[],LOTB=[];
 const scaf3=(x,z,mw)=>{const w=mw.w,dd=mw.dd,hh=Math.max(2.6,Math.min(mw.h-.8,4.4)),pc="#7d5f3c",pk="#a8895a",xf=[-w/2-.45,-w/6,w/6,w/2+.45],zf=z+dd/2+.55;
  xf.forEach(ox=>cyl(g,x+ox,0,zf,.06,hh+.7,pc,5));[[-w/2-.45,z],[-w/2-.45,z-dd/2-.4]].forEach(q=>cyl(g,x+q[0],0,q[1],.06,hh+.7,pc,5));
  [1.25,2.5].concat(hh>3.6?[3.75]:[]).forEach(y=>{box(g,x,y,zf,w+1.15,.07,.55,pk);box(g,x-w/2-.45,y,z-.2,.5,.07,dd+.9,pk)});
  const bx0=x+w/2+1.55,bz0=zf+1.15;for(let r2=0;r2<3;r2++)for(let j=0;j<3-r2;j++)box(g,bx0,r2*.16,bz0+(j-(2-r2)/2)*.2,2.1,.16,.18,"#9a7a4c");
  for(let j=0;j<4;j++)box(g,x-w/2-1.35+(j%2)*.46,(j>>1)*.36,zf+1.1,.42,.36,.42,"#b9b0a0");
  solids.push([bx0,bz0,1.15],[x-w/2-1.1,zf+1.1,.6]);BUILDQ.push([x,zf+1,w])};
 const aband3=(x,z,mw,id)=>{const w=mw.w,dd=mw.dd,yf=z+dd/2+.07,wm=M("#6a5030");[.75,1.45].forEach((y,i)=>{const b2=box(g,x+(i?.08:-.05),y,yf,1.25,.13,.05,"#6a5030");b2.rotation.z=i?.12:-.1});
  if(!snow){const wg=GFX.weedG||(GFX.weedG=new T.ConeGeometry(.22,.55,5)),wc=[M("#5d6b33"),M("#6f7a3a"),M("#7a6a3a")];for(let i=0;i<14;i++){const a=i*2.39+id,rr=Math.max(w,dd)/2+.25+((i*7+id)%5)*.18,m=new T.Mesh(wg,wc[i%3]);m.position.set(x+Math.cos(a)*rr*.95,.25,z+Math.sin(a)*rr*.8);m.scale.setScalar(.7+((i*3+id)%4)*.18);g.add(m)}}};
 for(const l of lots){const q=L.pos[l.id];if(!q)continue;const[x,z]=wx([q.x,q.y]);const ry=((l.id*37)%7-3)*.12;
  if(l.pub){const mp=mapPub(K,l.pub,l,x,z,C,L);const r=mp?mp.r:pub(g,l.pub,x,z);solids.push([x,z,mp&&mp.solid||r*.75]);const nm={hrad:"Hrad",kostol:"Kostol",radnica:"Radnica",trh:"Trh",uzernik:"Úžerník"}[l.pub]||l.pub;const s=label(nm,null,1.2,{k:"pub"});s.position.set(x,l.pub==="kostol"?16:l.pub==="trh"?4:9,z);g.add(s);
   const go={hrad:["Hrad: tituly a kráľ","dvor"],kostol:["Kostol: Cirkev a púte","cirkev"],radnica:["Radnica: voľby a úrady","radnica"],trh:["Trh: nakupovať a predávať","trh"],uzernik:["Úžerník: pôžičky","majetok"]}[l.pub];
   if(l.pub==="trh")add(x,z,r+2.5,"Trh: nakupovať a predávať",()=>panel(marketHTML),"pub");else if(l.pub==="uzernik")add(x,z,r+2.5,"Úžerník: vojsť",()=>enter("uzernik",{}),"pub");else if(["radnica","hrad","kostol"].includes(l.pub))add(x,z,r+2.5,{radnica:"Radnica: vojsť do radnej siene",hrad:"Hrad: vojsť do siene",kostol:"Kostol: vojsť"}[l.pub],()=>enter(l.pub,{}),"pub");else if(go)add(x,z,r+2.5,go[0],()=>{close();A.tab({v:go[1]})},"pub");continue}
  if(l.b!=null){const b=S.bld.find(v=>v.id===l.b);if(!b)continue;const mine=b.owner===0,col=(()=>{try{return DC(b.owner)}catch(e){return"#777"}})();
   DARKW=night&&!(b.type==="brloh"||b.type==="pasovanie"||b.type==="pivovar"||b.type==="krcma");let mw;try{mw=mapWorkshop(K,l,b,x,z)}finally{DARKW=false}solids.push([x,z,Math.max(2.4,mw.w*.55)]);LOTB.push([x,z,Math.max(mw.w,mw.dd)/2,l.id]);flag(g,x-mw.w/2+.3,mw.h-.4,z-mw.dd/2+.3,col);
   const bt3=b.bt===S.turn,ab3=!bt3&&((b.w|0)<1||!!b.halt);try{if(bt3)scaf3(x,z,mw);else if(ab3)aband3(x,z,mw,l.id)}catch(e){console.warn("3D lešenie",e)}
   if(bt3||ab3){const sn=label(bt3?"Stavia sa":"Stojí – bez robotníkov",null,.7,{k:"note"});sn.position.set(x,mw.h+3.3,z);g.add(sn)}
   const nm=(BT[b.type]||{}).n||b.type;const s=label(nm+(b.lvl>1?" "+["","I","II","III","IV","V"][b.lvl]:""),col,null,{k:"bld",r:(b.lvl||1)-1+((b.lvl||1)>=3?1:0)});s.position.set(x,mw.h+2.2,z);g.add(s);
   if(mine)add(x,z,4.2,`${/o$/.test(nm)?"Tvoje":/[aň]$/.test(nm)?"Tvoja":"Tvoj"} ${nm.toLowerCase()}: vojsť`,()=>enter("shop",{b}),"mine");
   else if(night&&!(b.type==="brloh"||b.type==="pasovanie"||b.type==="pivovar"||b.type==="krcma"))add(x,z,4.2,`${nm} rodu ${S.dyn[b.owner]?S.dyn[b.owner].name:""}: v noci zatvorené`,null,"info");else add(x,z,4.2,`${nm} rodu ${S.dyn[b.owner]?S.dyn[b.owner].name:""}: navštíviť`,()=>enter("shop",{b}),"info");continue}
  if(l.res!=null){const d=S.dyn[l.res];if(!d)continue;const hv=(d.id===0&&window.SIDLA?SIDLA.lvl(cid):d.house)||0,col=(()=>{try{return DC(d.id)}catch(e){return"#777"}})();
   const mh=mapSeat(K,l,d,hv,x,z);solids.push([x,z,Math.max(2.8,mh.w*.55)]);LOTB.push([x,z,Math.max(mh.w,mh.dd||mh.w)/2,l.id]);if(mh.flag)flag(g,mh.flag[0]+1.3,mh.flag[1]-1.2,mh.flag[2]+1.3,col);else flag(g,x-mh.w/2+.4,mh.h-.2,z-mh.dd/2+.4,col);
   const s=label((d.id===0?(cid===p.city?"Sídlo tvojho rodu":"Dom tvojho rodu"):"Rod "+d.name),col,1.1,{k:"seat",r:wTier(d)});s.position.set(x,mh.h+2.6,z);g.add(s);
   /* vylepšenia sídla viditeľné pri dome */
   try{const hu=d.id===0?(cid===p.city?(p.hu||[]):(((S.seats||{})[cid]||{}).hu||[])):(d.hu||[]);const ox=mh.ox+.4;
    seatExtras(K,g,hu,mh,x,z).forEach(q=>solids.push(q));
    if(d.id===0&&window.SIDLA){SIDLA.cups(cid).forEach((cu,i)=>{if(!SIDLA.hasUp(cid,cu[0]))return;const ax=x+(i?ox+1.6:-ox-1.6),az=mh.back-(hu.includes("kaplnka")&&!i?4.6:2.6);{const lk=look3();K.house(ax-1.3,az-1,2.6,2,1.8,{tex:lk.tex,timber:lk.timber,quoin:lk.quoin,roof:lk.roof,rh:1.1,sqY:[[1.7,.8,.6,.7]],sqX:[[.7,.8,.6,.7]],door:[.4,.9,1.3,false]})}const ls=label(cu[1],col,.7,{k:"note"});ls.position.set(ax,4.2,az);g.add(ls);if(cu[2]==="inc"||cu[2]==="trade"){cyl(g,ax+1.7,0,az+.6,.35,.7,"#7a4d23",10);cyl(g,ax+1.9,0,az-.3,.35,.7,"#7a4d23",10)}})}}catch(e){console.warn("3D sídlo",e)}
   if(d.id===0){const sx2=x-mh.w/2-2.2,sz2=(mh.front||z+2)+2.4;cyl(g,sx2,0,sz2,.06,1.5,"#6b4423",5);const bd=box(g,sx2,1.1,sz2,1,.55,.06,"#f4ead0");bd.castShadow=false;add(sx2,sz2,2.3,"Sídlo: prestavať a vylepšiť",()=>panel(seatHTML),"mine")}
   if(d.id===0)add(x,z,Math.max(5.4,mh.w*.55+3.4),cid===p.city?"Tvoje sídlo: vojsť":"Dom tvojho rodu: vojsť",()=>enter("home",{d:p,room:"sien"}),"home");
   else add(x,z,Math.max(5.4,mh.w*.55+3.4),`Sídlo rodu ${d.name}: navštíviť`,()=>enter("seat",{d}),"seat");continue}
  /* voľný pozemok */
  const fence=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(4,.5,3.2)),new T.LineBasicMaterial({color:"#6b4423"}));fence.position.set(x,.3,z);fence.rotation.y=ry;g.add(fence);
  cyl(g,x,0,z,.05,1.3,"#6b4423",5);const b2=box(g,x,1,z,.9,.45,.05,"#f4ead0");b2.castShadow=false;
  add(x,z,3.2,"Voľný pozemok: kúpiť alebo stavať",()=>{try{A.lot({l:l.id})}catch(e){}},"lot")}
 const SUBH=[],FILLH=[];K.subHouse=function(x,y,w,d){if(nearBR(x+w/2,y+d/2,Math.max(w,d)/2))return;SUBH.push([x+w/2,y+d/2,Math.max(w,d)/2+.3]);return K.house.apply(K,arguments)};
 let town=null;try{town=mapTown(K,g,C,L,solids,snow)}catch(e){console.warn("3D mesto",e)}
 /* hrad na kopci: zrezaný kopec, hradby s vežami, palác so štyrmi nárožnými vežami, cesta od brány */
 if(CASTLE)try{const[hx,hz,HN]=CASTLE,HH=7.5,TOP=9.2,BOT=17;
  const hill=new T.Mesh(new T.CylinderGeometry(TOP,BOT,HH,36,1,false),snow?M("#e8eef1"):grassMat(S.season,6));hill.position.set(hx,HH/2-.05,hz);hill.castShadow=hill.receiveShadow=true;g.add(hill);
  const rock=new T.Mesh(new T.CylinderGeometry(TOP+.4,TOP+2.6,2.2,36,1,true),MT("stone","#9a9284",6,1));rock.position.set(hx,HH-1,hz);rock.castShadow=true;g.add(rock);
  const ring=new T.Mesh(new T.CylinderGeometry(TOP-.35,TOP-.35,1.9,40,1,true),MT("stone","#c9c0aa",14,1,{side:T.DoubleSide}));ring.position.set(hx,HH+.95,hz);ring.castShadow=true;g.add(ring);
  for(let i=0;i<6;i++){const a=i/6*6.283+.3;K.cyl(hx+Math.cos(a)*(TOP-.4),hz+Math.sin(a)*(TOP-.4),.95,3.2,{z:HH,roof:1.8,tex:"cyl"})}
  const pw=10.5,pd=7.2,ph2=6,x0=hx-pw/2,y0=hz-pd/2,rows=[];for(let i=0;i<6;i++){rows.push([.75+i*1.55,1.2,.62,.95],[.75+i*1.55,3.6,.62,.95])}
  K.box(x0,y0,pw,pd,ph2,{z:HH,tex:"plasterW",quoin:1,sqY:rows,sqX:[[.8,1.2,.62,.95],[.8,3.6,.62,.95],[pd-1.4,1.2,.62,.95],[pd-1.4,3.6,.62,.95]],noTop:1,tpu:14,band:3});
  K.gable(x0,y0,pw,pd,HH+ph2,3,"tile",{tpu:12,gableTex:"plasterX"});
  [[x0-1.2,y0-1.2],[x0+pw-1.6,y0-1.2],[x0-1.2,y0+pd-1.6],[x0+pw-1.6,y0+pd-1.6]].forEach(([tx,ty])=>{K.box(tx,ty,2.8,2.8,ph2+3.2,{z:HH,tex:"plasterW",quoin:1,sqY:[[.9,ph2+1.6,.55,.8]],sqX:[[.9,ph2+1.6,.55,.8]],noTop:1,tpu:14});K.cpyr(tx-.15,ty-.15,3.1,3.1,HH+ph2+3.2,2.8,snow?"#eef2f4":"#8a3a24")});
  flag(g,hx,HH+ph2+3,hz,(()=>{try{return DC(0)}catch(e){return"#a5312a"}})());
  /* cesta hore od najbližšej brány */
  const gq=gates.length?gates.reduce((b,q)=>Math.hypot(q[0]-hx,q[1]-hz)<Math.hypot(b[0]-hx,b[1]-hz)?q:b,gates[0]):null;
  if(gq){const dx=hx-gq[0],dz=hz-gq[1],dl=Math.hypot(dx,dz)||1,ex=hx-dx/dl*(BOT+.5),ez=hz-dz/dl*(BOT+.5),mx=(gq[0]+ex)/2+dz/dl*5,mz=(gq[1]+ez)/2-dx/dl*5,pts=[];for(let t=0;t<=1.001;t+=.08){const a=(1-t)*(1-t),c=2*t*(1-t),e=t*t;pts.push([a*gq[0]+c*mx+e*ex,a*gq[1]+c*mz+e*ez])}
   softRibbon(g,pts,3.4,MUDC(),.04,false,.4);ribbon(g,pts,1.7,snow?"#d8d8d0":"#b39a6c",.046,false)}
  const lb=label(HN,null,1.4,{k:"pub"});lb.position.set(hx,HH+ph2+7.5,hz);g.add(lb);solids.push([hx,hz,BOT+.5])}catch(e){console.warn("3D hrad",e)}
 /* výplňové domy mesta */
 (L.fill||[]).forEach((f,i)=>{const[x,z]=wx([f.x,f.y]);if(nearBR(x,z,1.8))return;FILLH.push([x,z,2.1]);mapFill(K,f,x,z);solids.push([x,z,2.2])});
 /* ---------- radová zástavba (v234): meštianske domy v radoch pozdĺž ulíc a okolo námestia, štítom alebo odkvapom k ulici ---------- */
 /* v259: radová zástavba vypnutá – v 3D sú len budovy, ktoré sú aj na mape mesta */
 const ROWH=[],ROWON=false;try{if(ROWON&&!INDOOR&&(!L.canal||VEN.shore)){const KEYC=(()=>{try{return CKEY()}catch(e){return"pre"}})();
  const hs=(a,b)=>{const v=Math.sin(a*12.9898+b*78.233)*43758.5453;return v-Math.floor(v)};
  const rv=(()=>{try{return RVX()||[]}catch(e){return[]}})();
  const segD=(x,z,P)=>{let b=1e9;for(let i=0;i<P.length-1;i++){const a=P[i],c=P[i+1],vx=c[0]-a[0],vz=c[1]-a[1],l2=vx*vx+vz*vz||1;let t=((x-a[0])*vx+(z-a[1])*vz)/l2;t=t<0?0:t>1?1:t;b=Math.min(b,Math.hypot(x-a[0]-vx*t,z-a[1]-vz*t))}return b};
  const inPoly=(x,z,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
  const BND=L.canal?VEN.shore:wall,wallC=BND.concat([BND[0]]),roadsW=(L.streets||[]).map(s2=>s2.map(wx)).concat(L.ring&&L.ring.length>2?[L.ring.concat([L.ring[0]]).map(wx)]:[],L.canal?(L.canals||[]).map(c=>(c||[]).map(wx)).filter(c=>c.length>1):[]);
  const lotP=Object.values(L.pos||{}).map(q=>wx([q.x,q.y]));
  const SEGS=[];roadsW.forEach((rd,ri)=>{for(let i=0;i<rd.length-1;i++)SEGS.push([rd[i],rd[i+1],ri,i,rd.length-1])});
  const ri0=ri=>L.ring&&L.ring.length>2&&ri===roadsW.length-1;
  /* miesto, kde sa hráč objaví (pred domom rodu), musí ostať voľné */
  const SPW=(()=>{try{const h0=lots.find(l=>l.res===0),q=h0&&L.pos[h0.id]?wx([L.pos[h0.id].x,L.pos[h0.id].y]):pl;return[q[0]+2,q[1]+5]}catch(e){return[pl[0]+2,pl[1]+5]}})();
  const fits=(x,z,r,own,R2)=>{R2=R2||r*1.25;if(Math.hypot(x-SPW[0],z-SPW[1])<R2+3.2)return false;if(!inPoly(x,z,BND)||segD(x,z,wallC)<r+3)return false;if(L.canal&&(VEN.br.some(q=>Math.hypot(q[0]-x,q[1]-z)<r+4.5)||VEN.piers.some(pq=>segD(x,z,pq)<r+2)))return false;if(rv.length>1&&segD(x,z,rv)<r+6.5)return false;if(nearBR(x,z,r))return false;
   if(Math.hypot(x-pl[0],z-pl[1])<9.9+r)return false;if(gates.some(q=>Math.hypot(q[0]-x,q[1]-z)<r+6))return false;
   if(solids.some(q=>Math.hypot(q[0]-x,q[1]-z)<q[2]+r+.6))return false;if(lotP.some(q=>Math.hypot(q[0]-x,q[1]-z)<r+2.9))return false;
   if(SUBH.some(q=>Math.hypot(q[0]-x,q[1]-z)<q[2]+r))return false;if(ROWH.some(q=>Math.hypot(q[0]-x,q[1]-z)<2.5))return false;
   for(const sg of SEGS){let lim=1.8+R2;if(own&&sg[2]===own[0]){const di=Math.abs(sg[3]-own[1]);if(!di)continue;if(di===1||(di===sg[4]-1&&ri0(sg[2])))lim=1.55+R2*.72}if(segD(x,z,[sg[0],sg[1]])<lim)return false}
   if(inter.some(i=>i.kind!=="lot"&&i.kind!=="npc"&&i.kind!=="info"&&Math.hypot(i.x-x,i.z-z)<Math.min(i.r||3,6)*.85+R2*.6))return false;return true};
  const lk=look3(),PX={userData:{qb:g.userData.qb||(g.userData.qb=new Map()),xf:null},cur:null,add(o){const c=PX.cur,w=new T.Group();w.position.set(c[0],0,c[1]);w.rotation.y=c[4];w.add(o);g.add(w)}};const KR=mapKit(PX);
  const TEXS=[lk.tex,lk.tex,"plaster","plasterB","plasterG","plasterR","plasterW"];
  /* jeden dom: stred (cx,cz), smer ulice u (jednotkový), šírka w pozdĺž ulice, hĺbka d; dvere hľadia na ulicu */
  const AWN=["#a8463a","#3a5a8a","#c9a03a","#5a7a3a","#7a3a6a"],SGN=["#c9a03a","#8a2a22","#2f5bb0","#3f7a3a","#e8dcc0"];
  /* podstavec, jednofarebný kváder (stĺpy, trámy, štíty) – kreslené cez natočenú dávku */
  const plinthL=(x0,y0,w,d)=>{const pm=polyMatSolid(snow?"#9a9890":"#7f7666"),e=.07,ph=.36,A2=[x0-e,y0-e],B2=[x0+w+e,y0-e],C2=[x0+w+e,y0+d+e],D2=[x0-e,y0+d+e];[[A2,B2],[B2,C2],[C2,D2],[D2,A2]].forEach(([p0,p1])=>quad3(PX,[[p0[0],p0[1],0],[p1[0],p1[1],0],[p1[0],p1[1],ph],[p0[0],p0[1],ph]],pm,false))};
  const slab=(x0,y0,w,d,z0,h,col,cast)=>{const m=polyMatSolid(col),P8=[[x0,y0],[x0+w,y0],[x0+w,y0+d],[x0,y0+d]];for(let i=0;i<4;i++){const p0=P8[i],p1=P8[(i+1)%4];quad3(PX,[[p0[0],p0[1],z0],[p1[0],p1[1],z0],[p1[0],p1[1],z0+h],[p0[0],p0[1],z0+h]],m,cast!==false)}quad3(PX,P8.map(q=>[q[0],q[1],z0+h]),m,false);quad3(PX,P8.map(q=>[q[0],q[1],z0]),m,false)};
  /* jeden dom: stred (cx,cz), smer ulice u, šírka w pozdĺž ulice, hĺbka d; dvere k ulici (lokálne +y).
     Časť mesta: 2 = pri námestí (bohaté, vyššie, kamenné, podlubia), 1 = stred (hrazdené, dielne), 0 = pri hradbách (nízke, drevo, slama) */
  const build=(cx,cz,u,w,d,k,o2)=>{o2=o2||{};const F=[-u[1],u[0]],phi=Math.atan2(-u[1],u[0]);PX.cur=[cx,cz,u,F,phi];const XF=q=>[cx+u[0]*q[0]+F[0]*q[1],cz+u[1]*q[0]+F[1]*q[1],q[2]];PX.userData.xf=XF;
   const H=x=>hs(k,x),dpz=Math.hypot(cx-pl[0],cz-pl[1]),dwl=segD(cx,cz,wallC),zone=o2.arc||dpz<24?2:dwl<11?0:1;
   let fl=zone===2?(H(1.7)<.4?3:2):zone===1?(H(1.7)<.55?2:1):(H(1.7)<.18?2:1);if(o2.arc)fl=Math.max(2,fl);if(KEYC==="ven")fl=Math.min(3,fl+1);if(QLV===0)fl=Math.min(fl,2);
   const h=fl===1?2.3:fl===2?3.4:4.55;
   const texL=zone===2?[lk.tex,"plasterW","plaster","wall","plasterB","plasterR"]:zone===1?TEXS:["plaster","wood","plasterB",lk.tex];
   let tex=(KEYC==="ven"?["plasterR","plasterW","plaster","plasterB","plasterR","plasterG"]:texL)[Math.floor(H(7.7)*(KEYC==="ven"?6:texL.length))];if(lk.timber&&((zone===1&&H(5.3)<.4)||(zone===0&&H(5.3)<.25)))tex="timber";
   const front=H(3.1)<(zone===2?.6:zone===1?.4:.25),arc=!!o2.arc&&w>=2.9&&fl>=2&&H(21.1)<.75,jetty=!arc&&KEYC!=="ven"&&zone>=1&&fl>=2&&(tex==="timber"||H(23.3)<.35);
   const shop=!arc&&zone>=1&&H(25.7)<.3,sign=shop||(arc&&H(27.1)<.5)||(zone===1&&H(29.3)<.15);
   const roof=zone===0&&lk.thatch&&H(9.1)<.5?"thatch":lk.roof,quoin=tex==="wall"||(zone===2&&H(19.9)<.5),band=zone===2&&fl>=2?2.25:0;
   const ww=zone===2?.72:zone===0?.55:.64,nW=Math.max(1,Math.min(4,Math.floor((w-.3)/(zone===0?1.3:1.05))));
   const row=(zb,hh)=>{const o=[];if(nW===1)o.push([w/2-ww/2,zb,ww,hh]);else for(let i=0;i<nW;i++)o.push([.35+i*(w-.7-ww)/(nW-1),zb,ww,hh]);return o};
   const ups=[],upsR=[];for(let f=1;f<fl;f++){ups.push(...row(2.35+(f-1)*1.15,.72));upsR.push(...row(.1+(f-1)*1.15,.72))}
   const doorA=w/2-.45,gw=shop?[[.3,.55,Math.max(.6,Math.min(1.2,w/2-.85)),1.15]].concat(w>=3?[[w-.3-ww,.85,ww,.8]]:[]):w>=3?[[.3,.85,ww,.8],[w-.3-ww,.85,ww,.8]]:w>=2.6?[[.3,.85,ww,.8]]:[];
   const rh=front?w*.62:d*.5,gt=tex==="wall"?"wallX":"plasterX",dd=jetty?d+.45:d;
   const cxl=front?-.4:(H(15.1)<.5?-w/2+.35:w/2-1.15),chim=H(13.7)<(zone===0?.4:.65)?[cxl]:undefined,dormer=!front&&fl>=2&&w>=3&&H(17.3)<.45?1:0;
   try{
    if(!arc&&!jetty){KR.house(-w/2,-d/2,w,d,h,{tex,timber:tex==="timber",quoin,band,tpu:14,roof,rh,alongY:front?1:0,chim,dormer,sqY:gw.concat(ups),sqX:[[d/2-.35,fl>1?2.35:.85,.62,.72]],door:[doorA,.9,1.5,H(11.3)<.3]})}
    else{const gTex=jetty&&tex==="timber"?(H(31.1)<.5?"plaster":"wall"):tex;
     if(arc){plinthL(-w/2,-d/2,w,d-1.5);KR.box(-w/2,-d/2,w,d-1.5,2.25,{tex:gTex,quoin,sqY:gw,doorY:[doorA,.9,1.5,true],noTop:1,tpu:14,grime:1});
      const np=Math.max(2,Math.round(w/1.45)+1);for(let i=0;i<np;i++)slab(-w/2+.05+i*(w-.5)/(np-1),d/2-.45,.4,.4,0,2.25,snow?"#d8d8d2":"#cfc6b2");
      slab(-w/2,d/2-.45,w,.45,1.8,.45,snow?"#d0d0ca":"#c4b9a2");quad3(PX,[[-w/2,d/2-1.5,2.249],[w/2,d/2-1.5,2.249],[w/2,d/2,2.249],[-w/2,d/2,2.249]],polyMatSolid("#6a5a48"),false)}
     else{plinthL(-w/2,-d/2,w,d);KR.box(-w/2,-d/2,w,d,2.25,{tex:gTex,quoin,sqY:gw,sqX:[[d/2-.35,.85,.62,.72]],doorY:[doorA,.9,1.5,H(11.3)<.3],noTop:1,tpu:14,grime:1})}
     KR.box(-w/2,-d/2,w,dd,h-2.25,{z:2.25,tex,timber:tex==="timber",quoin:quoin&&!jetty,band:0,sqY:upsR,sqX:[[dd/2-.35,.15,.62,.72]],noTop:1,tpu:14});
     if(jetty){for(let x=-w/2+.2;x<w/2-.05;x+=.9)slab(x,d/2-.05,.14,.5,1.92,.33,"#4a3220");quad3(PX,[[-w/2,d/2,2.25],[w/2,d/2,2.25],[w/2,d/2+.45,2.25],[-w/2,d/2+.45,2.25]],polyMatSolid("#5a4028"),false)}
     KR.gable(-w/2,-d/2,w,dd,h,rh,roof,{chim,alongY:front?1:0,dormer,tpu:12,gableTex:gt})}
    /* dielňa: plátený prístrešok nad výkladom */
    if(shop){const aw=Math.max(.8,Math.min(1.6,w/2-.5)),ax0=-w/2+.15,ac=polyMatSolid(AWN[Math.floor(H(33.3)*AWN.length)]);quad3(PX,[[ax0,d/2,2.05],[ax0+aw+.2,d/2,2.05],[ax0+aw+.2,d/2+.85,1.62],[ax0,d/2+.85,1.62]],ac,true);
     slab(ax0,d/2+.8,.05,.05,0,1.62,"#4a3220");slab(ax0+aw+.15,d/2+.8,.05,.05,0,1.62,"#4a3220")}
    /* vývesný štít na konzole */
    if(sign){const sx=w/2-.3,yb=d/2+(jetty?.45:0)+(arc?0:0);slab(sx-.03,yb,.06,.95,2.48,.06,"#2a2018",false);slab(sx-.045,yb+.32,.09,.58,1.86,.54,SGN[Math.floor(H(35.9)*SGN.length)]);slab(sx-.05,yb+.29,.1,.64,1.83,.06,"#3a2a1a",false)}
    /* v noci lampáš pri dverách a teplé svetlo na dlažbe */
    if(night&&QLV>0&&zone>=1&&(ROWH.lan|0)<34&&H(37.1)<(zone===2?.6:.35)){ROWH.lan=(ROWH.lan|0)+1;const yb2=d/2+(jetty?.45:0)+(arc?0:0);slab(.82,yb2-.02,.05,.24,2.2,.05,"#2a2018",false);const lp=XF([.85,yb2+.22,0]),pp=XF([.55,yb2+1.5,0]);
     if(!GFX.lanG){GFX.lanG=new T.SphereGeometry(.13,8,6);GFX.lanM=new T.MeshBasicMaterial({color:"#ffd27a"});GFX.lanS=new T.SpriteMaterial({map:new T.CanvasTexture(blobTex()),color:"#ffb84a",transparent:true,opacity:.42,depthWrite:false,blending:T.AdditiveBlending,fog:false});GFX.lanP=new T.MeshBasicMaterial({map:new T.CanvasTexture(blobTex()),color:"#ffa848",transparent:true,opacity:.34,depthWrite:false,blending:T.AdditiveBlending});GFX.lanC=new T.CircleGeometry(2.6,16)}
     const lm=new T.Mesh(GFX.lanG,GFX.lanM);lm.position.set(lp[0],2.05,lp[1]);g.add(lm);const gs=new T.Sprite(GFX.lanS);gs.scale.set(2.2,2.2,1);gs.position.copy(lm.position);g.add(gs);const gp=new T.Mesh(GFX.lanC,GFX.lanP);gp.rotation.x=-Math.PI/2;gp.position.set(pp[0],.13,pp[1]);gp.renderOrder=3;g.add(gp)}
    /* dym z komína */
    if(chim){const top=XF([cxl+.4,-d/2+dd*.55+.4,0]);CHIM.push([top[0],h+rh*.95+1.3,top[1]])}
   }catch(e){if(!ROWH.w){ROWH.w=1;console.warn("3D dom",e)}}
   ROWH.t=ROWH.t||{};const ty=arc?"arc":jetty?"jetty":"std";ROWH.t[ty]=(ROWH.t[ty]||0)+1;if(shop)ROWH.t.shop=(ROWH.t.shop||0)+1;if(sign)ROWH.t.sign=(ROWH.t.sign||0)+1;ROWH.t["z"+zone]=(ROWH.t["z"+zone]||0)+1;
   PX.userData.xf=null;ROWH.push([cx,cz,ty,F[0],F[1],shop?1:0,sign?1:0]);const r=Math.max(w,dd)/2;solids.push([cx,cz,r*.92]);if(w>3.1)solids.push([cx+u[0]*w*.3,cz+u[1]*w*.3,dd*.45],[cx-u[0]*w*.3,cz-u[1]*w*.3,dd*.45])};
  const WS2=[2.6,3,3.4],DS=[3.2,3.8];let n=0;const MAXH=QLV===0?45:KEYC==="ven"?120:170;
  /* rady pozdĺž ulíc */
  roadsW.forEach((rd,ri)=>{for(let i=0;i<rd.length-1&&n<MAXH;i++){const a=rd[i],b=rd[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<4)continue;const u=[(b[0]-a[0])/len,(b[1]-a[1])/len],nn=[-u[1],u[0]];
   [1,-1].forEach(sd=>{let t=1.4,run=0;while(t<len-1.4&&n<MAXH){const k=ri*131+i*17+t*3.7+sd*5,w=WS2[Math.floor(hs(k,.3)*3)],d=DS[Math.floor(hs(k,.9)*2)];if(t+w>len-.6)break;
     const off=2.05+d/2,cx=a[0]+u[0]*(t+w/2)+nn[0]*sd*off,cz=a[1]+u[1]*(t+w/2)+nn[1]*sd*off,r=Math.hypot(w,d)/2*.8;
     if(fits(cx,cz,r,[ri,i],Math.hypot(w,d)/2)){const uu=sd>0?[-u[0],-u[1]]:u;build(cx,cz,uu,w,d,k);n++;run++;t+=w;if(run>=3&&hs(k,2.2)<.45){t+=1.8;run=0}}else{t+=.9;run=0}}})}});
  /* domy okolo námestia, priečelím k studni */
  {const R=11.6;for(let a=0;a<6.283&&n<MAXH;){const k=a*41.3,w=WS2[Math.floor(hs(k,.5)*3)],d=3.4,cx=pl[0]+Math.cos(a)*(R+d/2),cz=pl[1]+Math.sin(a)*(R+d/2);
    const inward=[-Math.cos(a),-Math.sin(a)],u=[inward[1],-inward[0]];const ok=fits(cx,cz,Math.hypot(w,d)/2*.75,null,Math.hypot(w,d)/2);
    if(ok){build(cx,cz,u,w,d,k,{arc:1});n++;a+=(w+.15)/R}else a+=.6/R}}
  /* vnútro blokov: domy za uličnou zástavbou, priečelím k najbližšej ulici; chodník k nim dorobí sieť chodníkov */
  {const nr=(x,z)=>{let b=null;for(const sg of SEGS){const a=sg[0],c=sg[1],vx=c[0]-a[0],vz=c[1]-a[1],l2=vx*vx+vz*vz||1;let t=((x-a[0])*vx+(z-a[1])*vz)/l2;t=t<0?0:t>1?1:t;const qx=a[0]+vx*t,qz=a[1]+vz*t,d=Math.hypot(x-qx,z-qz);if(!b||d<b.d)b={d,qx,qz}}return b};
   const xs=BND.map(q=>q[0]),zs=BND.map(q=>q[1]),x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs);let m=0;
   for(let gx=x0+4;gx<x1-4&&n<MAXH+(QLV===0?10:KEYC==="ven"?30:60);gx+=4.4)for(let gz=z0+4;gz<z1-4&&n<MAXH+(QLV===0?10:KEYC==="ven"?30:60);gz+=4.2){const k=gx*7.1+gz*3.3,x=gx+(hs(k,.2)-.5)*2.2,z=gz+(hs(k,.6)-.5)*2.2;const q=nr(x,z);if(!q||q.d<6.2||q.d>34)continue;
    const w=WS2[Math.floor(hs(k,1.1)*3)],d=DS[Math.floor(hs(k,1.4)*2)];if(!fits(x,z,Math.hypot(w,d)/2*.85,null,Math.hypot(w,d)/2))continue;
    const F=[(q.qx-x)/q.d,(q.qz-z)/q.d];build(x,z,[F[1],-F[0]],w,d,k+500);FILLH.push([x,z,Math.max(w,d)/2+.2]);n++;m++}
   ROWH.inner=m}
  ROWH.n=n}}catch(e){console.warn("3D radová zástavba",e)}
 /* ---------- nápisy z výšky (v244): námestie, štvrte a brány; ukážu sa len pri pohľade z výšky (M) ---------- */
 try{const hiL=(t,x,z,k)=>{const lb=label(t,null,(k||2.2)*2.1,{k:"pub"});lb.userData.hi=1;lb.position.set(x,16,z);g.add(lb)};
  hiL("Námestie",pl[0],pl[1],2.6);const dirN=(x,z,f)=>{const a=Math.atan2(z-cen[1],x-cen[0]),i=Math.round(a/(Math.PI/2));return f[(i%4+4)%4]};
  const Q={};Object.values(L.pos||{}).forEach(q=>{const w2=wx([q.x,q.y]);if(Math.hypot(w2[0]-pl[0],w2[1]-pl[1])<16)return;const k=dirN(w2[0],w2[1],["e","s","w","n"]);(Q[k]=Q[k]||[]).push(w2)});
  const QN={n:"Severná štvrť",s:"Južná štvrť",e:"Východná štvrť",w:"Západná štvrť"};Object.entries(Q).forEach(([k,a])=>{if(a.length<4)return;const x=a.reduce((s2,q)=>s2+q[0],0)/a.length,z=a.reduce((s2,q)=>s2+q[1],0)/a.length;hiL(QN[k],x,z,2)});
  gates.forEach(q=>hiL(dirN(q[0],q[1],["Východná brána","Južná brána","Západná brána","Severná brána"]),q[0]+(q[0]-cen[0])*.08,q[1]+(q[1]-cen[1])*.08,1.8))}catch(e){console.warn("3D nápisy z výšky",e)}
 /* ---------- detaily mesta (v105): záhradky, ploty, drevo, káry, studne, bielizeň, lavičky, sliepky ---------- */
 try{const wd=M("#6a4a2a"),wd2=M("#8a6a44"),soilM=M(snow?"#e6ecee":"#6a4a2c"),rowM=M(snow?"#dfe8ee":S.season===2?"#b08a30":"#4f8a38"),stM=M("#b9b0a0");
  const pm=(geo,mat,x,y,z,sh)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=sh!==false;g.add(m);return m};
  const postG=new T.CylinderGeometry(.045,.045,.75,4),railG=new T.BoxGeometry(1,.06,.04),logG=new T.CylinderGeometry(.15,.15,1.5,7),whG=new T.CylinderGeometry(.3,.3,.07,10);
  const fenceBox=(x0,z0,w,d,gap)=>{[[x0,z0,x0+w,z0],[x0+w,z0,x0+w,z0+d],[x0+w,z0+d,x0,z0+d],[x0,z0+d,x0,z0]].forEach((e,k)=>{if(k===gap)return;const len=Math.hypot(e[2]-e[0],e[3]-e[1]),n=Math.max(1,Math.round(len/.8));for(let i=0;i<=n;i++)pm(postG,wd,e[0]+(e[2]-e[0])*i/n,.37,e[1]+(e[3]-e[1])*i/n,false);[.3,.6].forEach(y=>{const r=pm(railG,wd,(e[0]+e[2])/2,y,(e[1]+e[3])/2,false);r.scale.x=len;r.rotation.y=-Math.atan2(e[3]-e[1],e[2]-e[0])})})};
  const free2=(x,z,r)=>!solids.some(q=>Math.hypot(q[0]-x,q[1]-z)<q[2]+r)&&Math.hypot(x-pl[0],z-pl[1])>12;
  const occ=lots.filter(l=>L.pos[l.id]&&!l.pub&&(l.b!=null||l.res!=null)),hens=[];
  occ.forEach((l,i)=>{const[x,z]=wx([L.pos[l.id].x,L.pos[l.id].y]);
   if(i%2===0){const gx=x+2.9,gz=z+2.1;if(free2(gx+1.1,gz+.9,1)){pm(new T.BoxGeometry(2.2,.06,1.7),soilM,gx+1.1,.05,gz+.85,false).receiveShadow=true;for(let r=0;r<3;r++){const rw=pm(new T.BoxGeometry(1.9,.2,.22),rowM,gx+1.1,.16,gz+.35+r*.5,false);if(!snow&&r===1)for(let k=0;k<4;k++)pm(new T.SphereGeometry(.09,5,4),M(["#d8453a","#e8a030","#f0d050"][(i+k)%3]),gx+.35+k*.5,.3,gz+.85,false)}fenceBox(gx-.15,gz-.15,2.5,2,3);
     if(!snow&&!night)for(let h=0;h<2;h++){const hg=new T.Group();const bd=new T.Mesh(new T.SphereGeometry(.15,7,5),M(h?"#f4ecd8":"#9a5a2a"));bd.scale.set(1,.9,1.3);bd.position.y=.2;hg.add(bd);const hd=new T.Mesh(new T.SphereGeometry(.07,6,4),M(h?"#f4ecd8":"#9a5a2a"));hd.position.set(0,.36,.16);hg.add(hd);const cb=new T.Mesh(new T.ConeGeometry(.03,.07,4),M("#d8453a"));cb.position.set(0,.44,.16);hg.add(cb);hg.position.set(gx-.8-h*.5,0,gz+1.2+h*.6);g.add(hg);hens.push({g:hg,hd,cx:gx-.9,cz:gz+1.4,a:i+h*2,t:h*1.7})}}}
   if(i%3===1){const lx=x-2.7,lz=z-1.9;if(free2(lx,lz,.6))for(let r=0;r<3;r++)for(let k=0;k<3-r;k++){const lg=pm(logG,wd2,lx,.15+r*.27,lz-.3+k*.31+r*.16);lg.rotation.z=Math.PI/2}}
   if(i%4===2){const cx=x-3.2,cz=z+2.9;if(free2(cx,cz,.9)){const cg=new T.Group();box(cg,0,.42,0,.8,.34,1.25,"#9b6a3e",0,"wood");[-.47,.47].forEach(o=>{const w=new T.Mesh(whG,wd);w.rotation.z=Math.PI/2;w.position.set(o,.3,-.1);cg.add(w)});[-.3,.3].forEach(o=>{const hd=new T.Mesh(new T.CylinderGeometry(.03,.03,1,4),wd);hd.rotation.x=Math.PI/2-.25;hd.position.set(o,.55,1);cg.add(hd)});[[-.15,.1],[.15,-.25]].forEach(o=>{const sk=new T.Mesh(new T.SphereGeometry(.22,7,5),M("#d8cfae"));sk.scale.y=1.1;sk.position.set(o[0],.82,o[1]);cg.add(sk)});cg.position.set(cx,0,cz);cg.rotation.y=(i%5)*.6;g.add(cg);solids.push([cx,cz,.8])}}
   if(i%5===3){const wx2=x+3.5,wz=z-2.9;if(free2(wx2,wz,1)){K.cyl(wx2,wz,.55,.7,{tex:"cyl",finial:false});[-.5,.5].forEach(o=>pm(new T.CylinderGeometry(.05,.05,1.5,5),wd,wx2+o,1.4,wz));const rf=pm(new T.ConeGeometry(.85,.5,4),M(snow?"#e9eef3":"#7a4a2f"),wx2,2.35,wz);rf.rotation.y=Math.PI/4;const bk=pm(new T.CylinderGeometry(.13,.1,.2,7),wd2,wx2,1.2,wz);solids.push([wx2,wz,.75])}}});
  /* bielizeň na šnúrach */
  (L.fill||[]).forEach((f,i)=>{if(i%3||snow)return;const[fx,fz]=wx([f.x,f.y]);const a=[fx+1.9,fz+1.6],b=[fx+4.4,fz+2.8];if(!free2((a[0]+b[0])/2,(a[1]+b[1])/2,.8))return;[a,b].forEach(q=>pm(new T.CylinderGeometry(.05,.05,1.9,5),wd,q[0],.95,q[1]));const len=Math.hypot(b[0]-a[0],b[1]-a[1]),ry=-Math.atan2(b[1]-a[1],b[0]-a[0]);const ln=pm(new T.BoxGeometry(len,.02,.02),M("#5a4a3a"),(a[0]+b[0])/2,1.82,(a[1]+b[1])/2,false);ln.rotation.y=ry;
   for(let k=1;k<5;k++){const u=k/5,cl=pm(new T.PlaneGeometry(.34,.5+(k%2)*.15),M(["#f4ecd8","#2f5bb0","#b8362c","#e8dcc0"][(i+k)%4],{side:T.DoubleSide}),a[0]+(b[0]-a[0])*u,1.55-(k%2)*.07,a[1]+(b[1]-a[1])*u,false);cl.rotation.y=ry;PRE.push((dt,t)=>{cl.rotation.x=Math.sin(t*1.6+k+i)*.12})}});
  /* lavičky na námestí */
  for(let i=0;i<4;i++){const a=i/4*6.283+.8,x=pl[0]+Math.cos(a)*5.2,z=pl[1]+Math.sin(a)*4;const bg=new T.Group();box(bg,0,.4,0,1.5,.08,.42,"#8a6a44",0,"wood");box(bg,0,.4,-.2,1.5,.5,.06,"#8a6a44",0,"wood");[-.6,.6].forEach(o=>box(bg,o,0,0,.08,.4,.4,"#5a3a20"));bg.position.set(x,0,z);bg.rotation.y=Math.atan2(pl[0]-x,pl[1]-z);g.add(bg);solids.push([x,z,.7])}
  if(hens.length)PRE.push((dt,t)=>{for(const h of hens){h.t-=dt;if(h.t<=0){h.t=1.5+Math.random()*3;h.a+=(Math.random()-.5)*2.6}const peck=Math.sin(t*6+h.a)>.7;h.hd.position.y=peck?.2:.36;if(!peck&&h.t>1){const nx=h.g.position.x+Math.sin(h.a)*.5*dt,nz=h.g.position.z+Math.cos(h.a)*.5*dt;if(Math.hypot(nx-h.cx,nz-h.cz)<1.6){h.g.position.x=nx;h.g.position.z=nz}else h.a+=2.5;h.g.rotation.y=h.a}}});
 }catch(e){console.warn("3D detaily",e)}
 /* hradby sa stavajú až teraz (v115): kde most končí pri múre, vznikne v ňom bránka */
 try{const PG=[];if(!L.canal&&L.river&&L.river.length>1)try{CROSSX().forEach(q=>{[[q.a,-1],[q.b,1]].forEach(([e,sg])=>{const ux=Math.cos(q[2])*sg,uz=Math.sin(q[2])*sg;let best=null;for(let t=-4;t<=6;t+=.5){const x=e[0]+ux*t,z=e[1]+uz*t;WSOL.forEach((w,i)=>{const d=Math.hypot(w[0]-x,w[1]-z);if(d<1&&(!best||d<best.d))best={d,i,w}})}
    if(!best)return;const w=best.w,far=(L2,r)=>!L2.some(o=>Math.hypot(o[0]-w[0],o[1]-w[1])<r);if(!far(gates,8)||!far(WG,12)||!far(PG,7)||!far(wall.filter((_,i)=>i%6===0),3.2))return;{const dl=Math.hypot(w[0]-cen[0],w[1]-cen[1])||1,ix=w[0]+(cen[0]-w[0])/dl*3.4,iz=w[1]+(cen[1]-w[1])/dl*3.4;if(solids.some(o=>o[2]>=1&&Math.hypot(o[0]-ix,o[1]-iz)<o[2]+2))return}
    const n0=WSOL[best.i-1],n1=WSOL[best.i+1];let an=q[2]+Math.PI/2;if(n0&&n1&&Math.hypot(n1[0]-n0[0],n1[1]-n0[1])<4)an=Math.atan2(n1[1]-n0[1],n1[0]-n0[0]);PG.push([w[0],w[1],an,2])})})}catch(e){console.warn("3D bránky",e)}
  const cuts=WG.concat(PG);WSEG.forEach(sg=>(cuts.length?wgClip(sg[0],sg[1],cuts):[sg]).forEach(q=>K.wallSeg(q[0],q[1],5,1.6)));
  PG.forEach(w=>{const pg=new T.Group(),sm=MT("stone","#a8a294",2,1);const lin=new T.Mesh(new T.BoxGeometry(4.5,2.7,1.75),sm);lin.position.y=4.25;lin.castShadow=true;pg.add(lin);[-1,1].forEach(o=>{const jb=new T.Mesh(new T.BoxGeometry(.5,2.9,1.85),sm);jb.position.set(o*2.2,1.45,0);jb.castShadow=true;pg.add(jb)});
   [-.75,.75].forEach(o=>{const st=new T.Mesh(new T.BoxGeometry(1.5,.5,1.75),sm);st.position.set(o*2,2.75,0);pg.add(st)});const fl=new T.Mesh(new T.BoxGeometry(3.9,.06,2.4),MT("cobble","#cdb88a",2,1));fl.position.y=.05;pg.add(fl);
   pg.position.set(w[0],0,w[1]);pg.rotation.y=-w[2];g.add(pg);for(let n=solids.length-1;n>=0;n--)if(solids[n][2]<1&&Math.hypot(solids[n][0]-w[0],solids[n][1]-w[1])<2.15)solids.splice(n,1)});
  PGS=PG}catch(e){console.warn("3D hradby",e)}
 K.flush();
 /* stavby rodu v tomto meste */
 try{const cw=(S.cw&&S.cw[cid])||{},dc=DC(0);const rvp=(L.river||[]).map(wx);const free=(x,z,r)=>!solids.some(s=>Math.hypot(s[0]-x,s[1]-z)<s[2]+r)&&!rvp.some(q=>Math.hypot(q[0]-x,q[1]-z)<r+7);
  const spot=(tx,tz,r)=>{for(let rad=0;rad<40;rad+=1.5)for(let a=0;a<6.28;a+=.4){const x=tx+Math.cos(a)*rad,z=tz+Math.sin(a)*rad;if(free(x,z,r))return[x,z]}return[tx,tz]};
  const want={fontana:[pl[0],pl[1],0],veza:[pl[0]+9,pl[1]-9,2],trznica:[pl[0]+10,pl[1]+10,5],spital:[pl[0]-13,pl[1]-10,4.5],kolegium:[pl[0]-16,pl[1]+11,5],katedrala:[pl[0]+17,pl[1]-2,3.6],pozicka:[pl[0]-3,pl[1]-11,1.6],univerzita:[pl[0],pl[1]+R0*.62,8],hrad:[-R0*.55,-R0*.55,11]};
  if(town&&town.env){const TG={fontana:[-7,7],veza:[9,-9],trznica:[10,9],spital:[-12,-10],kolegium:[-16,10],katedrala:[16,-2],pozicka:[-3,-12],univerzita:[-2,22]},HT={veza:22,univerzita:11,hrad:15,katedrala:9,kolegium:10};
   const firsts=Object.keys(TG).map(k=>[pl[0]+TG[k][0],pl[1]+TG[k][1]]).concat([[-30,-30]]);const isFirst=e=>firsts.some(f=>Math.abs(f[0]-e[0])<.01&&Math.abs(f[1]-e[1])<.01);
   const find=(tx,ty)=>{const lg=town.log;let i=-1;for(let k=lg.length-1;k>=0;k--)if(Math.abs(lg[k][0]-tx)<.01&&Math.abs(lg[k][1]-ty)<.01){i=k;break}if(i<0)return null;for(let k=i;k<lg.length;k++){if(k>i&&isFirst(lg[k]))break;if(lg[k][2])return lg[k][2]}return null};
   for(const id in cw){let q=null;const nm=(WORKS.find(v=>v.id===id)||{}).n||id;
    if(id==="brana"){const rg=town.env.ring||[];let b=null;rg.forEach(p2=>{const y=K.I.P(p2[0],p2[1],0)[1];if(!b||y>b.y)b={p:p2,y}});q=b?b.p:null}
    else if(id==="most"||id==="pristav"){const rv=town.env.river;if(rv&&rv.length>4)q=rv[Math.floor(rv.length*(id==="most"?.5:.7))]}
    else if(id==="hrad")q=find(-30,-30);else if(TG[id])q=find(pl[0]+TG[id][0],pl[1]+TG[id][1]);
    try{if(id==="pristav"&&K.SK.nopier){q=PRIK().W(0,7);HT.pristav=8.2}else if(id==="most"&&!L.canal){const lm=CROSSX().filter(b=>b.lm);if(lm.length)q=[lm[lm.length-1][0],lm[lm.length-1][1]]}}catch(e){}
    if(!q)continue;const s=label(nm,dc,null,{k:"pub"});s.position.set(q[0],HT[id]||7,q[1]);g.add(s)}}
  else   for(const id in cw){let q=null;
   if(id==="brana"&&gates.length){const q0=gates[0];flag(g,q0[0],6.6,q0[1],dc);const s=label("Nová brána rodu",dc,null,{k:"pub"});s.position.set(q0[0],8.6,q0[1]);g.add(s);continue}
   if((id==="most"||id==="pristav")&&L.river&&L.river.length>3){const rv=L.river.map(wx),k=id==="most"?MOSTK():Math.floor(rv.length*.7),a=rv[k],b=rv[k+1]||rv[k-1];const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
    const lp=id==="most"?a:PRIK().W(0,7);const s=label(id==="most"?"Kamenný most rodu":"Prístav so žeriavom",dc,null,{k:"pub"});s.position.set(lp[0],id==="most"?5:8.2,lp[1]);g.add(s);continue}
   const w=want[id];if(!w)continue;q=id==="fontana"?[w[0],w[1]]:spot(w[0],w[1],w[2]);workShape(g,id,q[0],q[1],dc);solids.push([q[0],q[1],w[2]||1.5]);
   const nm=(WORKS.find(v=>v.id===id)||{}).n||id;const s=label(nm,dc,null,{k:"pub"});s.position.set(q[0],id==="veza"?18:id==="hrad"?12:id==="univerzita"?10:6,q[1]);g.add(s)}}catch(e){console.warn("3D stavby",e)}
 /* stromy okolo */
 {const rv2=RVX(),nearR=(x,z,d)=>rv2.some(q=>Math.hypot(q[0]-x,q[1]-z)<d);
  const base=snow?[200,210,220]:S.season===2?[200,120,40]:[110,150,70];const tc=k=>`rgb(${base.map((v,i)=>Math.max(0,Math.min(255,Math.round(v*(.72+k*.5)+(i===1?8:0))))).join(",")})`;
  /* stromy z viacerých korún (tmavší spodok, svetlejší vrch) a kríky pri domoch */
  try{const pts=[];if(!L.canal)for(let i=0;i<120;i++){const a=i*2.399,r=R0*(1.04+((i*37)%70)/60),x=Math.cos(a)*r,z=Math.sin(a)*r;if(nearR(x,z,6.5)||SITES.some(q=>Math.hypot(q.x-x,q.z-z)<q.r+3))continue;pts.push([x,z,.9+(i%4)*.25,2.2+(i%5)*.35,i])}
   lots.forEach(l=>{const q0=L.pos[l.id];if(!q0||(l.b==null&&l.res==null))return;const q=wx([q0.x,q0.y]);if(l.id%3===0)pts.push([q[0]-3.6,q[1]-2.6,.8,1.9,l.id+500])});
   const CG=new T.IcosahedronGeometry(1,1),cmat=new T.MeshPhongMaterial({flatShading:true,shininess:0,specular:0}),NC=pts.length*4,crowns=new T.InstancedMesh(CG,cmat,Math.max(1,NC)),trunks=new T.InstancedMesh(new T.CylinderGeometry(.1,.17,1,6),new T.MeshLambertMaterial({color:"#4a2e14"}),Math.max(1,pts.length)),dm=new T.Object3D(),col=new T.Color();let n=0;
   const cc=(k)=>{col.setRGB(...base.map((v,j)=>Math.max(0,Math.min(1,(v*(.6+k*.62)+(j===1?8:0))/255))));return col};
   pts.forEach((q,ti)=>{const[x,z,rr,hh,i]=q;const ty=TH(x,z);dm.position.set(x,ty+hh/2,z);dm.scale.set(1+rr*.3,hh,1+rr*.3);dm.rotation.set(0,i,((i%5)-2)*.02);dm.updateMatrix();trunks.setMatrixAt(ti,dm.matrix);
    [[0,.35,0,1.12,.95,.25],[rr*.55,.15,rr*.3,.72,.7,.05],[-rr*.5,.2,-rr*.25,.74,.7,.45],[rr*.1,.95,-rr*.05,.7,.68,.8]].forEach((c,k)=>{dm.position.set(x+c[0],ty+hh+rr*c[1],z+c[2]);dm.scale.set(rr*c[3],rr*c[4],rr*c[3]);dm.rotation.set(i*.7+k,i+k*2,0);dm.updateMatrix();crowns.setMatrixAt(n,dm.matrix);crowns.setColorAt(n,cc(c[5]+((i*7+k)%5)*.04));n++})});
   crowns.count=n;trunks.count=pts.length;crowns.castShadow=trunks.castShadow=true;crowns.instanceMatrix.needsUpdate=true;if(crowns.instanceColor)crowns.instanceColor.needsUpdate=true;if(pts.length){g.add(crowns);g.add(trunks)}
   const bp=[];lots.forEach(l=>{const q0=L.pos[l.id];if(!q0||(l.b==null&&l.res==null)||l.pub)return;const q=wx([q0.x,q0.y]);bp.push([q[0]-2.9,q[1]+2.5,l.id],[q[0]+3.1,q[1]-2.2,l.id+3])});(L.fill||[]).forEach((f,i)=>{const q=wx([f.x,f.y]);if(i%2)bp.push([q[0]+2.2,q[1]+1.7,i])});
   if(bp.length){const bm=new T.InstancedMesh(CG,cmat,bp.length*2);let m2=0;bp.forEach(q=>{[[0,0,.55],[.5,.25,.4]].forEach((c,k)=>{dm.position.set(q[0]+c[0],c[2]*.7,q[1]+c[1]);dm.scale.set(c[2]*1.15,c[2]*.9,c[2]*1.1);dm.rotation.set(q[2],q[2]*2+k,0);dm.updateMatrix();bm.setMatrixAt(m2,dm.matrix);bm.setColorAt(m2,cc(.2+((q[2]+k)%4)*.12));m2++})});bm.castShadow=true;bm.instanceMatrix.needsUpdate=true;if(bm.instanceColor)bm.instanceColor.needsUpdate=true;g.add(bm)}
  }catch(e){console.warn("3D stromy",e)}
  /* polia za hradbami ako na mape */
  if(!snow&&!L.canal)try{const ft=new T.CanvasTexture(iso().TX.field);ft.wrapS=ft.wrapT=T.RepeatWrapping;ft.repeat.set(2,1.4);const fm=[new T.MeshLambertMaterial({map:ft}),new T.MeshLambertMaterial({map:ft,color:"#cfe0a0"}),new T.MeshLambertMaterial({map:ft,color:"#e8c890"})];
   for(let i=0;i<14;i++){const a=i*.449+.2,r=R0*(1.25+(i%3)*.28),x=Math.cos(a)*r,z=Math.sin(a)*r;if(nearR(x,z,12)||SITES.some(q=>Math.hypot(q.x-x,q.z-z)<q.r+10)||TH(x,z)>.1||TH(x+6,z+4)>.1||TH(x-6,z-4)>.1||TH(x+6,z-4)>.1||TH(x-6,z+4)>.1)continue;const f=new T.Mesh(new T.PlaneGeometry(12+(i%3)*5,8+(i%2)*4),fm[i%3]);f.rotation.x=-Math.PI/2;f.rotation.z=a+.4;f.position.set(x,.03+i*.001,z);f.receiveShadow=true;g.add(f)}}catch(e){}}
 /* mäkké tiene pod budovami, trsy trávy a kvety */
 try{const bt=new T.CanvasTexture(blobTex());const sm=new T.MeshBasicMaterial({map:bt,color:"#0a0e06",transparent:true,opacity:night?.25:.42,depthWrite:false});const sg=new T.PlaneGeometry(1,1);let k3=0;
  solids.forEach(q=>{if(q[2]<1.5||q[2]>12)return;const m=new T.Mesh(sg,sm);m.rotation.x=-Math.PI/2;const r=q[2]*3.5;m.scale.set(r,r,1);m.position.set(q[0],.03+(k3++%7)*.0006,q[1]);m.renderOrder=1;g.add(m)});
  if(!L.canal){const rv3=RVX(),N=snow?600:2600,geo=new T.ConeGeometry(.13,.42,4),im=new T.InstancedMesh(geo,new T.MeshPhongMaterial({flatShading:true,shininess:0,specular:0}),N),dm=new T.Object3D(),col=new T.Color();let n=0,sd=5;const R=()=>(sd=(sd*16807)%2147483647)/2147483647;
   const fg=new T.SphereGeometry(.09,5,4),fN=snow||S.season===2?0:380,fm=fN?new T.InstancedMesh(fg,new T.MeshLambertMaterial(),fN):null;let fn=0;const FCOL=["#f4f0e6","#f0d050","#e86a9a","#d8453a","#8a7ad8"];
   for(let t=0;t<N*3&&n<N;t++){const a=R()*6.283,r=Math.sqrt(R())*(R0+70),x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.hypot(x-pl[0],z-pl[1])<10.5)continue;if(solids.some(q=>Math.abs(q[0]-x)<q[2]+.3&&Math.abs(q[1]-z)<q[2]+.3))continue;if(rv3.some(q=>Math.abs(q[0]-x)<5.5&&Math.abs(q[1]-z)<5.5))continue;
    const sc=.45+R()*.6,ty=TH(x,z);dm.position.set(x,ty+.2*sc,z);dm.scale.set(sc,sc,sc);dm.rotation.y=R()*3;dm.updateMatrix();im.setMatrixAt(n,dm.matrix);const k=.75+R()*.5;col.setRGB(...(snow?[.82*k,.86*k,.88*k]:S.season===2?[.62*k,.52*k,.24*k]:[.44*k,.62*k,.3*k]));im.setColorAt(n,col);n++;
    if(fm&&fn<fN&&t%4===0){dm.position.set(x+.3,ty+.12,z+.2);dm.scale.set(1,1,1);dm.updateMatrix();fm.setMatrixAt(fn,dm.matrix);col.set(FCOL[fn%5]);fm.setColorAt(fn,col);fn++}}
   im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;g.add(im);if(fm){fm.count=fn;fm.instanceMatrix.needsUpdate=true;if(fm.instanceColor)fm.instanceColor.needsUpdate=true;g.add(fm)}}
 }catch(e){console.warn("3D tráva",e)}
 try{if(SITES.length)okolie3(K,g,{sites:SITES,solids,add,snow,gates,wall,dc:(()=>{try{return DC(0)}catch(e){return"#a5312a"}})(),home:cid===p.city,cid,exit:()=>close(),canal:!!L.canal})}catch(e){console.warn("3D okolie",e)}
 K.flush();
 /* dym z komínov, lode na rieke */
 const smokes=[];{const sc=document.createElement("canvas");sc.width=sc.height=64;const sx=sc.getContext("2d");const gd=sx.createRadialGradient(32,32,2,32,32,30);gd.addColorStop(0,"rgba(235,235,235,.7)");gd.addColorStop(1,"rgba(235,235,235,0)");sx.fillStyle=gd;sx.fillRect(0,0,64,64);const stx=new T.CanvasTexture(sc);
  CHIM.filter((_,i)=>i%2===0).slice(0,QLV===0?14:44).forEach((q,i)=>{for(let k=0;k<3;k++){const sp2=new T.Sprite(new T.SpriteMaterial({map:stx,transparent:true,depthWrite:false,opacity:.5}));sp2.position.set(q[0],q[1],q[2]);scene.add(sp2);smokes.push({s:sp2,q,t:(k/3+i*.13)%1})}})}
 const boats=[];if(L.river&&L.river.length>3&&!snow){const rv=L.river.map(wx);for(let i=0;i<2;i++){const bg=new T.Group();box(bg,0,.1,0,2.6,.35,1,"#6b4423",0,"wood");box(bg,0,.45,0,.08,1.9,.08,"#4a2e14");const sl=new T.Mesh(new T.PlaneGeometry(1.3,1.4),M("#f1e8d2",{side:T.DoubleSide}));sl.position.set(.02,1.5,0);sl.rotation.y=Math.PI/2;bg.add(sl);scene.add(bg);boats.push({g:bg,rv,t:i*.5,v:.012+i*.004})}}
 /* ľudia: ty a hlavy ostatných rodov */
 const me=person(p,"head",true);me.userData.isMe=1;scene.add(me);
 const home=lots.find(l=>l.res===0),hq=home&&L.pos[home.id]?wx([L.pos[home.id].x,L.pos[home.id].y]):pl;
 let px=hq[0]+2,pz=hq[1]+5,yaw=Math.atan2(pl[0]-px,pl[1]-pz),pitch=.42,dist=11,fp=false,camD=null;if(REST&&REST.c===cid){px=REST.px;pz=REST.pz;yaw=REST.yaw;pitch=REST.pitch;dist=REST.dist}REST=null;const sig=()=>{try{const q=P();return JSON.stringify([S.est,S.estL,S.bld.length,S.bld.reduce((a,b)=>a+(b.lvl|0),0),q.house,(q.hu||[]).length,S.seats,S.cw&&S.cw[cid],S.lots.filter(l=>l.b!=null||l.res!=null).length,S.season,S.ci,S.turn,(()=>{try{return todPh()}catch(e){return 0}})(),(()=>{try{return wx3()}catch(e){return 0}})(),S.town?1:0,(S.castle||[]).length,(q.hu||[]).join()])}catch(e){return""}};let sig0=sig(),sigT=0;
 const way=[pl].concat(lots.filter(l=>L.pos[l.id]).map(l=>wx([L.pos[l.id].x,L.pos[l.id].y])).map(q=>[q[0]+3.4,q[1]+3.4]));
 const folk=[];
 /* denný rytmus (v120): ráno do dielní, na poludnie na trh, večer domov, v noci len stráže */
 const lotP=f=>lots.filter(l=>L.pos[l.id]&&f(l)).map(l=>wx([L.pos[l.id].x,L.pos[l.id].y])).map(q=>[q[0]+3.4,q[1]+3.4]);
 const WWORK=lotP(l=>l.b!=null),WHOME=lotP(l=>l.res!=null),rndA=a=>a[Math.floor(Math.random()*a.length)];let GPTS=null;
 const pickT=o=>{const r=Math.random(),plz=()=>{const a=Math.random()*6.283,d=3.5+Math.random()*4.5;return[pl[0]+Math.cos(a)*d,pl[1]+Math.sin(a)*d]};
  if(o&&o.guard){if(!GPTS){GPTS=[pl];(L.gates||[]).map(wx).forEach(q=>{const d=Math.hypot(q[0]-pl[0],q[1]-pl[1])||1;GPTS.push([q[0]+(pl[0]-q[0])/d*6,q[1]+(pl[1]-q[1])/d*6])});if(L.ring&&L.ring.length>2)L.ring.forEach((q,i)=>{if(i%4===0)GPTS.push(wx(q))})}return{t:rndA(GPTS),k:"post"}}
  if(ph===3)return{t:(o&&o.home)||rndA(WHOME.length?WHOME:way),k:"sleep"};
  if(ph===0)return r<.7&&WWORK.length?{t:rndA(WWORK),k:"work"}:r<.85?{t:plz(),k:"plz"}:{t:rndA(way),k:""};
  if(ph===2)return r<.65&&((o&&o.home)||WHOME.length)?{t:(o&&o.home)||rndA(WHOME),k:"home"}:r<.85?{t:plz(),k:"plz"}:{t:rndA(way),k:""};
  return r<.6?{t:plz(),k:"plz"}:r<.85||!WWORK.length?{t:rndA(way),k:""}:{t:rndA(WWORK),k:"work"}};
 const waitOf=k=>k==="work"?6+Math.random()*8:k==="plz"?3+Math.random()*6:k==="post"?4+Math.random()*6:k==="sleep"?25:1+Math.random()*4;
 /* mešťania chodia cez vodu len po mostoch (v112) */
 const wetLine=(a,b)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.1);for(let i=1;i<n;i++)if(WET(a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n))return true;return false};
 let NAV=null,NAVN=0,WK=[],NPC3=null;const DBG={cr:[],ch:[]};
 /* hrubý test vody použiteľný už pri stavaní scény (v133) */
 let WPT=null,SHP=null;const wetE=(x,z)=>{if(!WPT){WPT=L.canal?(L.canals||[]).reduce((a,c)=>a.concat((c||[]).map(wx)),[]):RVX();if(L.canal)SHP=L.wall.map(p0=>wx([L.cx+(p0[0]-L.cx)*1.3,L.cy+(p0[1]-L.cy)*1.3]))}
  if(SHP){let c=false;for(let i=0,j=SHP.length-1;i<SHP.length;j=i++){const a=SHP[i],b=SHP[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c}if(!c)return true}
  return WPT.some(q=>Math.hypot(q[0]-x,q[1]-z)<(L.canal?2.6:6.5))};
 const planWay=(a,t)=>{if(NAV){try{const r=NAV(a,t);if(r)return r}catch(e){}}if(!wetLine(a,t))return[t];let best=null;const hy=(u,v)=>Math.hypot(u[0]-v[0],u[1]-v[1]);BRP.forEach(pq=>{[[pq[0],pq[1]],[pq[1],pq[0]]].forEach(e=>{const d=hy(a,e[0])+hy(e[0],e[1])+hy(e[1],t);if(best&&d>=best.d)return;if(wetLine(a,e[0])||wetLine(e[1],t))return;best={d,r:[e[0],e[1],t]}})});return best?best.r:null};
 S.dyn.filter(d=>d.ai&&!d.royal&&!d.gone&&d.city===cid).forEach((d,i)=>{const f=person(d,"head",false);const q=way[(i*7+3)%way.length];f.position.set(q[0],0,q[1]);scene.add(f);
  const col=(()=>{try{return DC(d.id)}catch(e){return null}})();const s=label(`${d.head.name} · rod ${d.name}`,col,.8,{k:"person",r:wTier(d)});s.position.set(0,2.9,0);f.add(s);
  /* rodina ide s hlavou rodu: manžel/ka a najviac dve deti */
  const fol=[];try{if(d.spouse&&i%2===0){const sp=person(d,"spouse",false,d.head.gender!=="f");sp.position.copy(f.position);scene.add(sp);fol.push({g:sp,o:1})}
   (d.kids||[]).filter(k=>!k.dead&&k.age>=4&&k.age<16).slice(0,i%3===0?2:1).forEach((k,j)=>{const kg=person({id:d.id,head:{gender:k.gender},title:d.title,ai:1},"kid",false,k.gender==="f");kg.scale.set(.62,.62,.62);kg.position.copy(f.position);scene.add(kg);fol.push({g:kg,o:1.8+j*.8})})}catch(e){}
  const o={g:f,d,t:[q[0],q[1]],q:[],v:1.1+(i%3)*.25,wait:i*.4,fol,home:[q[0],q[1]],k:""};folk.push(o);
  inter.push({get x(){return f.position.x},get z(){return f.position.z},r:2.6,text:`${d.head.name} z rodu ${d.name}: osloviť`,act:()=>panel(()=>talkHTML(d.id)),kind:"npc"})});
 /* ---------- živé mesto (v94): remeselníci, predavači, stráže, chodci, vozy, udalosti ---------- */
 const LAMPS=[];const X_NAV={};const life=[];{const FIGS=[],FS=new WeakSet();let nxt=0;let lodT=0;life.push((dt,t)=>{CRW.prev=CRW.cur;CRW.cur=[];
  /* postavy v diaľke (v269): nad 32 m bez tieňa a bez žmurkania, nad 75 m sa nekreslia (nie pri pohľade z výšky) */
  if(t>lodT){lodT=t+.4;const cp=cam.position,hiV=dist>60;for(const f of FIGS){const u=f.userData,r=u.rig;if(!r)continue;const e=f.matrixWorld.elements,d=Math.hypot(cp.x-e[12],cp.z-e[14]),L2=hiV?0:d>75?2:d>32?1:0;if(u.lod===L2)continue;u.lod=L2;r.visible=L2<2;const sh=L2===0;r.traverse(o=>{if(o.isMesh)o.castShadow=sh})}}
  if(t>nxt){nxt=t+2;scene.traverse(o=>{const u=o.userData;if(u&&u.rig&&u.arms&&!FS.has(o)){FS.add(o);FIGS.push(o)}})}
  for(let i=FIGS.length-1;i>=0;i--){const f=FIGS[i];if(!f.parent){FIGS.splice(i,1);continue}const u=f.userData;if(!f.visible||t-(u.ext==null?-9:u.ext)<.3)continue;const e=f.matrixWorld.elements;if(Math.hypot(PLP[0]-e[12],PLP[1]-e[14])>45)continue;stride(f,false,t,0,true)}})}PRE.forEach(f=>life.push(f));const dc0=(()=>{try{return DC(0)}catch(e){return"#a5312a"}})();
 try{const CN=CC(),ev={fair:CN.fair===S.turn||(CN.fairT||0)>=S.turn,plague:CN.plagueT!=null&&CN.plagueT>=S.turn,elec:!!S.elec,guards:(CN.raidT!=null&&CN.raidT>=S.turn-1)||(()=>{try{return edictOn("straz")}catch(e){return false}})(),mourn:(()=>{try{return mourning()}catch(e){return false}})()};
  const MC={},mc=c=>MC[c]||(MC[c]=M(c));const NG={b:new T.CylinderGeometry(.2,.32,1.05,7),h:new T.SphereGeometry(.2,8,6),hat:new T.ConeGeometry(.26,.24,7),helm:new T.SphereGeometry(.23,8,5,0,6.3,0,1.7),wh:new T.CylinderGeometry(.32,.32,.1,10)};
  const HAIR=["#5a3a20","#2b2117","#8a6a3a","#c9a24a"];let nk=0;
  const LINS=["#ece4d2","#e4d8bf","#dccfb2"],HOODC=["#7a2a24","#2f5a3a","#3a4a7a","#6a4a2a","#8a6a2a","#5a3a5a"];
  /* odev mešťanov (v272): košeľa, remeselník so zásterou a vyhrnutými rukávmi, ženy so závojom alebo šatkou, bielymi rukávmi a zásterou, bohatší s gombíkmi, lemom a kožušinou */
  const dressOf=(col,o)=>{const r=k=>{const v=Math.sin(nk*12.9898+k*78.233)*43758.5453;return v-Math.floor(v)},dr={sh:LINS[nk%3]};if(o.helm)return dr;const hat=o.hat;
   if(o.fem){const q=r(4);if(q<.4)dr.hd="veil";else if(q<.7){dr.hd="kerch";dr.hc=r(8)<.5?HOODC[nk%6]:mixHex(col,"#ffffff",.35)}else if(q<.85)dr.hd="coif";
    if(r(1)<.55)dr.slv=LINS[(nk+1)%3];if(r(2)<.6)dr.sk=mixHex(col,["#2a1a10","#3a4a5a","#5a3a20"][nk%3],.45);if(r(3)<.5)dr.ap=LINS[(nk+2)%3];return dr}
   if(hat==="#f4f0e6")dr.hd="baker";else if(hat==="#c9a24a"||hat==="#8a7a5a")dr.hd="straw";else if(hat){const q=r(5);dr.hd=q<.3?"hood":q<.55?"felt":q<.75?"turban":"cap";dr.hc=dr.hd==="hood"?HOODC[nk%6]:hat}
   else{const q=r(5);if(q<.3){dr.hd=r(9)<.3?"hoodU":"hood";dr.hc=HOODC[nk%6]}else if(q<.42)dr.hd="coif"}
   if(o.tool){dr.rl=r(1)<.65;const smith=o.tool==="#4a4a52";dr.ap=smith?"#5e4128":o.tool==="#d8a24a"?LINS[0]:r(2)<.6?"#d9cfb8":null;dr.bib=smith||o.tool==="#d8a24a";return dr}
   if(r(6)<.18)dr.pc=HOODC[(nk+2)%6];if(r(7)<.3)dr.tr=mixHex(col,"#1a1008",.45);if(r(3)<.35)dr.bt=r(2)<.5?"#c9a24a":"#3a2a1a";if(r(10)<.2)dr.ws=1;if(r(11)<.15)dr.fu="#5a3a22";return dr};
  const npc=(col,o)=>{o=o||{};nk++;const dr=o.dr||dressOf(col,o),gr=figure({age:18+(nk*7)%42,body:col,fem:!!o.fem,hair:o.helm?null:HAIR[nk%4],beard:!o.fem&&nk%3===0,legs:["#4a3a2a","#3a3a42","#5a4a32"][nk%3],dr});gr.scale.set(.92,.92,.92);
   if(o.hat&&(o.helm||!dr.hd)){const t=new T.Mesh(o.helm?NG.helm:NG.hat,mc(o.hat));t.position.y=o.helm?1.87:2.1;if(!o.helm)t.scale.set(1.15,1,1.15);gr.add(t)}
   if(o.spear){const sp=new T.Mesh(new T.CylinderGeometry(.03,.03,2.7,4),mc("#5a3c22"));sp.position.set(.5,1.35,.1);gr.add(sp);const tp=new T.Mesh(new T.ConeGeometry(.07,.25,4),mc("#b8bcc4"));tp.position.set(.5,2.8,.1);gr.add(tp);gr.userData.arms[1].rotation.x=-.5}
   if(o.tool){const tl=new T.Mesh(new T.BoxGeometry(.1,.1,.5),mc(o.tool));tl.position.set(0,-.66,.22);gr.userData.arms[1].add(tl);gr.userData.tool=tl}scene.add(gr);return gr};
  NPC3=npc;
  const ROBE=["#7a4a2a","#3a5a7a","#6a6a3a","#7a3a3a","#4a6a4a","#8a6a3a","#5a4a6a","#9a8a6a"];
  /* remeselníci pred dielňami, kde sa pracuje */
  const TC={kovac:"#3a3a3a",lekaren:"#2f6b3a",krcma:"#7a1f18",vinar:"#7a1f18",pekar:"#e8e0d0",tkac:"#2f5bb0",hrnciar:"#b8643a",tesar:"#7a5a2a",kupec:"#6d3f92",zlatnik:"#c9a23a",pisaren:"#2a2a2a"};
  if(!ev.plague)lots.forEach(l=>{if(l.b==null||!L.pos[l.id])return;const b=S.bld.find(v=>v.id===l.b);if(!b||(b.w|0)<1)return;if(night&&!(b.type==="brloh"||b.type==="pasovanie"||b.type==="pivovar"||b.type==="krcma"))return;const[x,z]=wx([L.pos[l.id].x,L.pos[l.id].y]);const w=3.8+(b.lvl||1)*.4,dd=3+(b.lvl||1)*.2;
   const m=npc(TC[b.type]||"#7a5a3a",{hat:b.type==="pekar"?"#f4f0e6":null,tool:b.type==="kovac"||b.type==="tesar"?"#4a4a52":b.type==="pekar"?"#d8a24a":"#8a6a44"});m.position.set(x+w*.18,0,z+dd/2+1);const ph0=l.id,mx=x+w*.18,mz=z+dd/2+1,fz=mz+.78,ty=b.type;if(wetE(mx,mz)||wetE(mx,fz+.3)){scene.remove(m);return}DBG.cr.push([ty,mx,mz,ph0]);const A=m.userData.arms,MM=(geo,c,par,px2,py2,pz2)=>{const q=new T.Mesh(geo,M(c));q.position.set(px2,py2,pz2);q.castShadow=true;par.add(q);return q};
   /* remeselníci pri práci (v128) */
   try{if(ty==="kovac"){cyl(g,mx,0,fz,.2,.5,"#5a3c22",8);box(g,mx,.5,fz,.52,.14,.2,"#34343a");box(g,mx,.64,fz,.7,.1,.24,"#3e3e46");const sp=new T.Mesh(new T.SphereGeometry(.09,6,5),new T.MeshBasicMaterial({color:"#ffb84a"}));sp.position.set(mx+.05,.82,fz);g.add(sp);
      life.push((dt,t)=>{const s=Math.sin(t*7+ph0);A[1].rotation.x=-.75-Math.max(0,s)*1.15;A[0].rotation.x=-.55;sp.visible=s<0&&s>-.5;sp.scale.setScalar(.6+Math.random()*.9)});return}
    if(ty==="pekar"){const tr=new T.Group();tr.position.set(0,1.02,.5);m.add(tr);MM(new T.BoxGeometry(.66,.04,.36),"#8a6a44",tr,0,0,0);[-.2,0,.2].forEach(o=>{const lf=MM(new T.SphereGeometry(.09,8,6),"#c98a3a",tr,o,.07,0);lf.scale.set(1,.6,1.5)});
      const o0={x:mx,z:mz};life.push((dt,t)=>{const u=(Math.sin(t*.35+ph0)+1)/2;m.position.x=o0.x-1.2+u*2.4;m.rotation.y=Math.cos(t*.35+ph0)>0?Math.PI/2:-Math.PI/2;A[0].rotation.x=A[1].rotation.x=-1.25;const sw=Math.sin(t*6+ph0)*.5;if(m.userData.legsP&&m.userData.legsP.length){m.userData.legsP[0].rotation.x=sw;m.userData.legsP[1].rotation.x=-sw}});return}
    if(ty==="hrnciar"){cyl(g,mx,0,fz,.1,.5,"#5a3c22",6);cyl(g,mx,.5,fz,.36,.06,"#6a5a48",12);const pot=new T.Mesh(new T.LatheGeometry([[0,0],[.13,0],[.2,.14],[.17,.3],[.11,.36],[.14,.42]].map(q=>new T.Vector2(q[0],q[1])),10),M("#b8643a",{side:T.DoubleSide}));pot.position.set(mx,.56,fz);pot.castShadow=true;g.add(pot);
      life.push((dt,t)=>{pot.rotation.y=t*5;pot.scale.y=.85+.15*Math.sin(t*.6+ph0);A[0].rotation.x=-1+Math.sin(t*2+ph0)*.08;A[1].rotation.x=-1-Math.sin(t*2+ph0)*.08;m.rotation.x=.12});return}
    if(ty==="tesar"){[-.45,.45].forEach(o=>{box(g,mx+o,0,fz-.12,.06,.55,.06,"#6a4a2c");box(g,mx+o,0,fz+.12,.06,.55,.06,"#6a4a2c")});box(g,mx,.55,fz,1.5,.07,.24,"#b89a62");const saw=MM(new T.BoxGeometry(.03,.14,.6),"#b8bcc4",A[1],0,-.7,.28);
      life.push((dt,t)=>{const s=Math.sin(t*5+ph0);A[1].rotation.x=-.95+s*.32;A[0].rotation.x=-.8;m.rotation.x=.14});return}
    if(ty==="krcma"||ty==="vinar"||ty==="pivovar"){const mug=MM(new T.CylinderGeometry(.07,.06,.16,8),ty==="vinar"?"#c9a24a":"#8a6a44",A[1],0,-.7,.1);life.push((dt,t)=>{const s=Math.max(0,Math.sin(t*.7+ph0));m.rotation.y=.4*Math.sin(t*.3+ph0);A[1].rotation.x=-.35-s*s*1.7;A[0].rotation.x=-.15});return}
    const tbl=(w2,d2,c)=>{[-1,1].forEach(o=>[-1,1].forEach(q=>box(g,mx+o*(w2/2-.06),0,fz+q*(d2/2-.06),.06,.62,.06,"#5a3c22")));box(g,mx,.62,fz,w2,.06,d2,c||"#9a7a4a")};
    if(ty==="lekaren"){tbl(.8,.5);const mo=new T.Mesh(new T.CylinderGeometry(.13,.09,.16,10),M("#b9b0a0"));mo.position.set(mx,.76,fz);g.add(mo);[["#2f7d46",-.28],["#8c4fc0",.28]].forEach(c=>cyl(g,mx+c[1],.68,fz-.1,.05,.18,c[0],8));const pe=MM(new T.CylinderGeometry(.025,.035,.3,6),"#8a8478",A[1],0,-.78,.05);
      life.push((dt,t)=>{A[1].rotation.x=-.92+Math.sin(t*6+ph0)*.07;A[1].rotation.z=Math.cos(t*6+ph0)*.1;A[0].rotation.x=-.8;m.rotation.x=.12});return}
    if(ty==="pisaren"||ty==="tlaciaren"){tbl(.9,.5,"#7a5a34");box(g,mx,.68,fz,.5,.012,.34,"#f1e6c8");cyl(g,mx+.34,.68,fz-.12,.04,.08,"#1d1d22",8);const qu=MM(new T.ConeGeometry(.02,.3,5),"#f4f0e6",A[1],0,-.82,.06);
      life.push((dt,t)=>{const s=Math.sin(t*4+ph0);A[1].rotation.x=-.9+Math.sin(t*9+ph0)*.03;A[1].rotation.z=s*.14;A[0].rotation.x=-.75;m.rotation.x=.16});return}
    if(ty==="zlatnik"){tbl(.7,.45);const ri=new T.Mesh(new T.TorusGeometry(.06,.018,5,12),M("#e3be4f"));ri.rotation.x=Math.PI/2;ri.position.set(mx,.7,fz);g.add(ri);box(g,mx-.24,.68,fz,.1,.05,.1,"#e3be4f");const hm=MM(new T.BoxGeometry(.05,.05,.12),"#6a6e78",A[1],0,-.74,.08);
      life.push((dt,t)=>{const s=Math.sin(t*11+ph0);A[1].rotation.x=-.95-Math.max(0,s)*.25;A[0].rotation.x=-.85;m.rotation.x=.18});return}
    if(ty==="garbiar"){[-.55,.55].forEach(o=>box(g,mx+o,0,fz,.07,1.5,.07,"#5a3c22"));box(g,mx,1.45,fz,1.2,.07,.07,"#5a3c22");box(g,mx,.25,fz,1.2,.07,.07,"#5a3c22");const hd=new T.Mesh(new T.PlaneGeometry(.9,1),M("#b8875a",{side:T.DoubleSide}));hd.position.set(mx,.88,fz);g.add(hd);const sc=MM(new T.BoxGeometry(.2,.03,.05),"#b8bcc4",A[1],0,-.72,.06);
      life.push((dt,t)=>{const s=Math.sin(t*2.6+ph0);A[1].rotation.x=-1.25+s*.4;A[0].rotation.x=-1.1;m.rotation.x=.06});return}
    if(ty==="sklaren"||ty==="sklo"){const pi=MM(new T.CylinderGeometry(.015,.015,1.1,5),"#6a6e78",A[1],0,-.7,.5);pi.rotation.x=Math.PI/2;const bl=new T.Mesh(new T.SphereGeometry(.1,10,8),new T.MeshBasicMaterial({color:"#ff9a3a",transparent:true,opacity:.85}));bl.position.set(0,-.7,1.08);A[1].add(bl);
      life.push((dt,t)=>{const s=(Math.sin(t*.9+ph0)+1)/2;bl.scale.setScalar(.6+s*1.1);bl.material.color.setRGB(1,.45+s*.4,.15+s*.5);A[1].rotation.x=-1.35;A[0].rotation.x=-1.2;A[1].rotation.z=Math.sin(t*3+ph0)*.05;m.rotation.y=.3*Math.sin(t*.3+ph0)});return}
    if(ty==="mlyn"){const sk=MM(new T.SphereGeometry(.3,8,6),"#e6d8a8",m,.3,2.0,-.06);sk.scale.set(1.5,.8,1);sk.rotation.z=-.25;MM(new T.SphereGeometry(.07,6,5),"#b8a070",m,.74,1.95,-.06);if(m.userData.tool)m.userData.tool.visible=false;const o0=mx;life.push((dt,t)=>{const u=(Math.sin(t*.3+ph0)+1)/2;m.position.x=o0-1.3+u*2.6;m.rotation.y=Math.cos(t*.3+ph0)>0?Math.PI/2:-Math.PI/2;A[1].rotation.x=-2.6;A[0].rotation.x=Math.sin(t*6+ph0)*.4;const sw=Math.sin(t*6+ph0)*.5;if(m.userData.legsP&&m.userData.legsP.length){m.userData.legsP[0].rotation.x=sw;m.userData.legsP[1].rotation.x=-sw}});return}
    if(ty==="bana"){const rk=new T.Mesh(new T.DodecahedronGeometry(.34,0),M("#7a7468"));rk.position.set(mx,.2,fz+.1);rk.castShadow=true;g.add(rk);const pk=new T.Group();pk.position.set(0,-.7,.05);A[1].add(pk);MM(new T.CylinderGeometry(.02,.02,.7,5),"#6a4a2c",pk,0,0,.3).rotation.x=Math.PI/2;MM(new T.BoxGeometry(.4,.05,.05),"#4a4a52",pk,0,0,.64);
      life.push((dt,t)=>{const s=Math.sin(t*3.2+ph0);A[1].rotation.x=-.5-Math.max(0,s)*1.9;A[0].rotation.x=-.4-Math.max(0,s)*1.2;m.rotation.x=s<0?.2:0});return}
    if(ty==="kupec"){tbl(.8,.45);[-.2,0,.2].forEach((o,k)=>cyl(g,mx+o,.68,fz,.07,.04+k*.03,"#e3be4f",8));const bk=MM(new T.BoxGeometry(.3,.38,.04),"#5a2a1a",A[0],0,-.6,.16);
      life.push((dt,t)=>{A[0].rotation.x=-1.05;A[1].rotation.x=-.9+Math.max(0,Math.sin(t*2.5+ph0))*.25;A[1].rotation.z=Math.sin(t*1.2+ph0)*.2;m.rotation.x=.08});return}
    if(ty==="tkac"){const cl=MM(new T.BoxGeometry(.5,.62,.03),["#2f5bb0","#a3121e","#2f6a3a","#c9971a"][l.id%4],m,0,.95,.5);life.push((dt,t)=>{A[0].rotation.x=A[1].rotation.x=-1.15+Math.sin(t*1.5+ph0)*.12;cl.position.y=.95+Math.sin(t*1.5+ph0)*.05;cl.rotation.x=Math.sin(t*3+ph0)*.08;m.rotation.y=.5*Math.sin(t*.25+ph0)});return}
   }catch(e){}
   life.push((dt,t)=>{const s=Math.sin(t*(b.type==="kovac"?7:3)+ph0);m.rotation.y=.25*Math.sin(t*.4+ph0);m.userData.arms[1].rotation.x=-.5-Math.max(0,s)*1.1})});
  /* hlúčiky na námestí: dvojice v rozhovore (v128) */
  if(!ev.plague&&!night)try{const spots=[];inter.forEach(it=>{if(it.kind!=="pub"||spots.length>=3)return;const d=Math.hypot(it.x-pl[0],it.z-pl[1]);if(d<13||d>R0)return;const rr=Math.max(3.2,(it.r||6)-1),x=it.x+(pl[0]-it.x)/d*rr,z=it.z+(pl[1]-it.z)/d*rr;if(solids.some(o=>Math.hypot(o[0]-x,o[1]-z)<o[2]+.9)||spots.some(o=>Math.hypot(o[0]-x,o[1]-z)<4))return;spots.push([x,z,Math.atan2(z-pl[1],x-pl[0])])});for(let k=0;spots.length<3&&k<8;k++){const a=.6+k*2.2,x=pl[0]+Math.cos(a)*12.2,z=pl[1]+Math.sin(a)*12.2;if(!solids.some(o=>Math.hypot(o[0]-x,o[1]-z)<o[2]+.9)&&!spots.some(o=>Math.hypot(o[0]-x,o[1]-z)<4))spots.push([x,z,a])}
   spots.forEach((q,i)=>{const cx=q[0],cz=q[1],an=q[2]+1.3,dx=Math.cos(an)*.5,dz=Math.sin(an)*.5;
    DBG.ch.push([cx,cz]);const a=npc(ROBE[(i*3+1)%ROBE.length],{hat:i%2?"#5a3a20":null}),b2=npc(ROBE[(i*5+4)%ROBE.length],{hat:i%2?null:"#3a2a4a"});a.position.set(cx-dx,0,cz-dz);b2.position.set(cx+dx,0,cz+dz);const ya=Math.atan2(dx,dz);a.rotation.y=ya;b2.rotation.y=ya+Math.PI;
    life.push((dt,t)=>{const s=Math.sin(t*.45+i*2.1),ta=s>0,g1=Math.max(0,Math.sin(t*3.1+i));(ta?a:b2).userData.arms[1].rotation.x=-.5-g1*.8;(ta?a:b2).userData.arms[0].rotation.x=-.2-Math.max(0,Math.sin(t*2.3+i))*.4;(ta?b2:a).userData.arms[1].rotation.x*=.9;(ta?b2:a).userData.arms[0].rotation.x*=.9;(ta?b2:a).rotation.x=Math.max(0,Math.sin(t*2+i))*.05;a.userData.talk=b2.userData.talk=1;(ta?a:b2).userData.spk=t;(ta?a:b2).userData.hadd=[Math.sin(t*2.3+i)*.06,Math.sin(t*1.7+i)*.13];(ta?b2:a).userData.hadd=[Math.max(0,Math.sin(t*2.6+i))*.2-.03,0];a.rotation.y=ya+Math.sin(t*.5+i)*.12;b2.rotation.y=ya+Math.PI+Math.sin(t*.4+i)*.12})})}catch(e){console.warn("3D hlúčiky",e)}
  /* predavači pri stánkoch */
  if(!ev.plague&&!night)for(let i=0;i<10;i++){const a=i/10*6.283+.3,sx=pl[0]+Math.cos(a)*10.4,sz=pl[1]+Math.sin(a)*7.6;const m=npc(ROBE[i%8],{hat:i%3===0?"#c9a24a":null,fem:i%3===1});m.position.set(sx,0,sz);m.rotation.y=Math.atan2(pl[0]-sx,pl[1]-sz);const kx=pl[0]+Math.cos(a)*9,kz=pl[1]+Math.sin(a)*6.5,ST=STALLS[i];if(ST)inter.push({x:kx,z:kz,r:4.2,text:`Stánok: ${ST.n.toLowerCase()} (${ST.v.toLowerCase()})`,act:()=>panel(()=>marketHTML(i)),kind:"stall"});let near=0;life.push((dt,t)=>{const d=Math.hypot(px-kx,pz-kz),base=Math.atan2(pl[0]-sx,pl[1]-sz);near+=((d<4.5?1:0)-near)*Math.min(1,dt*4);const want=d<4.5?Math.atan2(px-sx,pz-sz):base+.3*Math.sin(t*.7+i);let df=want-m.rotation.y;while(df>Math.PI)df-=6.283;while(df<-Math.PI)df+=6.283;m.rotation.y+=df*Math.min(1,dt*5);const ar=m.userData.arms;if(ar){const cn=(1-near)*(Math.sin(t*.23+i*1.7)>.2?1:0);ar[1].rotation.x=-near*(1.1+.25*Math.sin(t*4+i))-cn*(.62+.06*Math.sin(t*7+i));ar[1].rotation.z=0;ar[0].rotation.x=-cn*.55;ar[0].userData.eb=cn*.95;ar[1].userData.eb=cn*.85}})}
  /* robotníci na lešení (v260): jeden zatĺka, druhý nosí dosky */
  if(!ev.plague&&!night)BUILDQ.forEach(([bx,bz,w],qi)=>{const a=npc("#7a5a3a",{hat:"#8a7a5a"}),b2=npc("#5a4a32",{});a.position.set(bx-w*.2,0,bz);a.rotation.y=Math.PI;b2.position.set(bx+w*.3,0,bz+.4);
   const plank=new T.Mesh(new T.BoxGeometry(.12,.06,2.2),M("#a8895a"));plank.position.set(.36,1.02,.05);plank.castShadow=true;b2.add(plank);
   life.push((dt,t)=>{const ar=a.userData.arms,sk=Math.sin(t*7+qi),hit=Math.max(0,sk);if(ar){ar[1].rotation.x=-1.2-hit*1.1;ar[0].rotation.x=-.5;ar[0].userData.eb=.9}const ra=a.userData.rig;if(ra){ra.rotation.x=.08+hit*.12;ra.rotation.y=-.1*hit}if(a.userData.head)a.userData.head.rotation.x=.25+hit*.08;a.userData.talk=1;const k=(Math.sin(t*.55+qi)+1)/2;b2.position.x=bx-w*.45+k*(w*.9+1.2);b2.rotation.y=Math.cos(t*.55+qi)>0?Math.PI/2:-Math.PI/2;stride(b2,true,t,7);const br=b2.userData.arms;if(br){br[0].rotation.x=0;br[1].rotation.x=-.18;br[1].rotation.z=.32;br[1].userData.eb=1.25}})});
  /* objednávateľ na námestí (v260): raz za štvrťrok ponúkne zákazku pre tvoje dielne */
  try{if(!ev.plague&&!night&&cid===S.ci){S.orders=S.orders||[];if(!S.ord3||S.ord3.t!==S.turn){let o=null;try{if(S.orders.length<2&&!S.offer&&typeof ordGen==="function")o=ordGen()}catch(e){}S.ord3={t:S.turn,o,done:0}}
   const O3=S.ord3;if(O3.o){const ox=pl[0]+4.6,oz=pl[1]+2.4,m=npc("#2f4a6a",{hat:"#1e2a3a"});m.position.set(ox,0,oz);m.rotation.y=Math.atan2(pl[0]-ox,pl[1]-oz);
    const sl=label("Objednávateľ",null,.7,{k:"note"});sl.position.set(ox,2.6,oz);g.add(sl);life.push(()=>{sl.visible=!O3.done});
    inter.push({x:ox,z:oz,r:2.6,get text(){return O3.done?"Objednávateľ: zákazka dohodnutá":"Objednávateľ ("+O3.o.from+"): vypočuť ponuku"},act:()=>panel(ordHTML),kind:"npc"})}}}catch(e){console.warn("3D objednávateľ",e)}
  /* hlásnik pri studni (v260): novinky z kroniky */
  try{if(!night){const hx=pl[0]-4.6,hz=pl[1]-2.4,m=npc("#7a2a2a",{hat:"#2a2a2a"});m.position.set(hx,0,hz);m.rotation.y=Math.atan2(pl[0]-hx,pl[1]-hz);
   life.push((dt,t)=>{const ar=m.userData.arms;if(ar){ar[1].rotation.x=-Math.max(0,Math.sin(t*.8))*2.4}if(Math.sin(t*.8)>.35)m.userData.spk=t});
   inter.push({x:hx,z:hz,r:2.6,text:"Hlásnik: vypočuť novinky",act:()=>panel(newsHTML),kind:"npc"})}}catch(e){console.warn("3D hlásnik",e)}
  /* stráže pri bránach */
  gates.forEach((q,gi)=>{const dx=cen[0]-q[0],dz=cen[1]-q[1],dl=Math.hypot(dx,dz)||1,ux=dx/dl,uz=dz/dl;[-1,1].forEach(sg=>{const m=npc("#5a5f6a",{hat:"#9aa0a8",helm:1,spear:1});m.position.set(q[0]+ux*4.4-uz*sg*1.9,0,q[1]+uz*4.4+ux*sg*1.9);m.rotation.y=Math.atan2(ux,uz)})});
  /* chodci po uliciach */
  const walkers=[];const nW=ev.plague?2:night?4:Math.round((7+((CN.tier||1)*3))*(snow?.6:1)*(ev.fair?1.8:1));
  for(let i=0;i<nW;i++){const guard=night||(ev.guards&&i<3);const m=guard?npc("#5a5f6a",{hat:"#9aa0a8",helm:1,spear:1}):npc(ROBE[(i*5+2)%8],{hat:i%4===0?"#6a4a2a":null,fem:i%3===2});const q=way[(i*13+1)%way.length];m.position.set(q[0]+1,0,q[1]-1);if(!guard&&i%5===3)m.scale.set(.65,.65,.65);if(night){const ln=new T.Mesh(new T.SphereGeometry(.11,8,6),new T.MeshBasicMaterial({color:"#ffcf70"}));ln.position.set(.36,1.05,.22);m.add(ln);const gs=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(blobTex()),color:"#ffb84a",transparent:true,opacity:.45,depthWrite:false,blending:T.AdditiveBlending,fog:false}));gs.scale.set(1.6,1.6,1);gs.position.copy(ln.position);m.add(gs);if(i<2){const pl5=new T.PointLight("#ffb060",1.6,11,1.6);pl5.position.set(.36,1.3,.5);m.add(pl5)}}if(!guard&&i%3===1)try{const bk=new T.Group();bk.position.set(0,-.74,.08);m.userData.arms[0].add(bk);const b1=new T.Mesh(new T.CylinderGeometry(.17,.12,.16,8),M("#b89a5a"));b1.castShadow=true;bk.add(b1);const hd=new T.Mesh(new T.TorusGeometry(.13,.015,4,10,Math.PI),M("#8a6a3a"));hd.position.y=.08;bk.add(hd);[[-.05,"#d8453a"],[.05,"#6a9a44"],[0,"#e8b030"]].forEach((c,k)=>{const f=new T.Mesh(new T.SphereGeometry(.055,6,5),M(c[1]));f.position.set(c[0],.1,k===2?.05:-.03);bk.add(f)})}catch(e){}walkers.push({g:m,t:[q[0]+1,q[1]-1],q:[],v:.9+(i%4)*.22,wait:i%3,guard,home:WHOME.length?WHOME[(i*7+3)%WHOME.length]:null,k:"",hide:0})}
  WK=walkers;
  /* deti, psy a mačky (v132) */
  try{const mk=(geo,c,par,x,y,z)=>{const q=new T.Mesh(geo,M(c));q.position.set(x,y,z);q.castShadow=true;par.add(q);return q},BX=(w,h,d)=>new T.BoxGeometry(w,h,d),wpts=L.canal?(L.canals||[]).reduce((a,c)=>a.concat((c||[]).map(wx)),[]):RVX(),wetS=(x,z)=>wpts.some(q=>Math.hypot(q[0]-x,q[1]-z)<(L.canal?4:7.5));
   if(!night&&!ev.plague){let kc=null;for(let k=0;k<10&&!kc;k++){const a=1.7+k*.9,x=pl[0]+Math.cos(a)*13.5,z=pl[1]+Math.sin(a)*13.5;if(Math.hypot(x,z)<R0*.8&&!wetS(x,z)&&!solids.some(o=>Math.hypot(o[0]-x,o[1]-z)<o[2]+3.2)&&!DBG.ch.some(o=>Math.hypot(o[0]-x,o[1]-z)<5))kc=[x,z]}if(!kc)kc=[pl[0],pl[1]];DBG.kids=kc;
    const kids=["#b8362c","#2f6a3a","#c9971a"].map((c,i)=>{const k=npc(c,{});k.scale.setScalar(.6);return k});
    life.push((dt,t)=>{const dir=Math.sin(t*.13)>0?1:-1;kids.forEach((k,i)=>{const a=dir*t*1.5+i*2.094+Math.sin(t*.9+i)*.35,r=2.3+Math.sin(t*.7+i*1.3)*.5;k.position.set(kc[0]+Math.cos(a)*r,0,kc[1]+Math.sin(a)*r);k.rotation.y=Math.atan2(-Math.sin(a)*dir,Math.cos(a)*dir);stride(k,true,t,14);k.userData.arms[i%2].rotation.x=-2.4+Math.sin(t*5+i)*.3})});
    [["#8a5a2e","#f1e6c8"],["#2b2520","#2b2520"],["#d8c8a0","#8a5a2e"]].slice(0,L.canal?1:2+(R0>60?1:0)).forEach((c,i)=>{const d=new T.Group();mk(BX(.2,.22,.52),c[0],d,0,.36,0);mk(BX(.17,.17,.2),c[0],d,0,.5,.32);mk(BX(.09,.08,.12),c[1],d,0,.46,.46);[-.06,.06].forEach(x=>mk(BX(.05,.09,.03),c[0],d,x,.62,.26));const tail=mk(BX(.04,.04,.24),c[1],d,0,.5,-.34);tail.rotation.x=.7;
      const legs=[[-.07,.18],[.07,.18],[-.07,-.18],[.07,-.18]].map(q=>{const lg=new T.Group();lg.position.set(q[0],.26,q[1]);d.add(lg);mk(BX(.06,.26,.06),c[0],lg,0,-.13,0);return lg});
      const st=way[(i*13+5)%way.length];d.position.set(st[0]+1.5,0,st[1]+1.5);scene.add(d);(DBG.dogs=DBG.dogs||[]).push([st[0]+1.5,st[1]+1.5]);const o={g:d,t:[st[0]+2,st[1]+1],q:[],v:1.7+i*.3,wait:i*2,guard:false,home:null,k:"",hide:0,dog:1};walkers.push(o);let lx=d.position.x,lz=d.position.z;
      life.push((dt,t)=>{const mv=Math.hypot(d.position.x-lx,d.position.z-lz)>.0005;lx=d.position.x;lz=d.position.z;const sw=mv?Math.sin(t*13+i)*.6:0;legs[0].rotation.x=sw;legs[3].rotation.x=sw;legs[1].rotation.x=-sw;legs[2].rotation.x=-sw;tail.rotation.y=Math.sin(t*(mv?9:4)+i)*.5})})}
   const spots2=(WHOME.length?WHOME:way).filter((q,i)=>i%2===0).slice(0,4);spots2.forEach((q,i)=>{const x=q[0]-1.1+(i%2)*.5,z=q[1]-1.3;if(wetS(x,z)||solids.some(o=>Math.hypot(o[0]-x,o[1]-z)<o[2]*.6))return;const c=["#d8a24a","#3a3a3a","#e8e0d0","#8a8a8a"][i%4],d=new T.Group();const bd=mk(new T.SphereGeometry(.13,8,6),c,d,0,.15,0);bd.scale.set(.85,1.15,1);const hd=mk(new T.SphereGeometry(.085,8,6),c,d,0,.36,.06);[-.045,.045].forEach(xx=>mk(new T.ConeGeometry(.03,.06,4),c,d,xx,.445,.06));[-.03,.03].forEach(xx=>mk(new T.SphereGeometry(.014,4,3),"#2f7d46",d,xx,.37,.135));
      const tl=new T.Group();tl.position.set(0,.06,-.11);d.add(tl);mk(BX(.035,.035,.26),c,tl,.0,0,-.12);d.position.set(x,0,z);d.rotation.y=i*1.7;scene.add(d);(DBG.cats=DBG.cats||[]).push([x,z]);life.push((dt,t)=>{tl.rotation.y=Math.sin(t*1.3+i*2)*.9;hd.rotation.y=Math.sin(t*.4+i)*.6})})
  }catch(e){console.warn("3D zvieratá",e)}
  life.push((dt,t)=>{for(const o of walkers){if(o.hide>0){o.hide-=dt;o.g.visible=o.hide<=0;if(o.hide>0)continue}stride(o.g,o.wait<=0,t,7);if(o.wait>0){o.wait-=dt;continue}const dx=o.t[0]-o.g.position.x,dz=o.t[1]-o.g.position.z,dd=Math.hypot(dx,dz);if(dd<.7){if(o.q&&o.q.length){o.t=o.q.shift();continue}if(o.k==="home"&&!o.guard&&Math.random()<.5)o.hide=6+Math.random()*14;let r=null,pk=null;const here=[o.g.position.x,o.g.position.z];for(let k=0;k<5&&!r;k++){pk=pickT(o);r=planWay(here,pk.t)}o.wait=o.k?waitOf(o.k):Math.random()*4;if(r){o.t=r[0];o.q=r.slice(1);o.k=pk.k}continue}{const av=avoid(o.g,dx/dd,dz/dd);o.g.position.x+=av[0]*o.v*av[2]*dt;o.g.position.z+=av[1]*o.v*av[2]*dt;o.g.position.y=BRH(o.g.position.x,o.g.position.z);turnY(o.g,Math.atan2(av[0],av[1]),dt)}}});
  /* vozy a karavány cez brány */
  const cart=(col,flagC)=>{const gr=new T.Group();box(gr,0,.45,0,.95,.5,1.7,"#9b6a3e",0,"wood");[[-.55,-.55],[.55,-.55],[-.55,.55],[.55,.55]].forEach(o=>{const w=new T.Mesh(NG.wh,mc("#4a2e14"));w.rotation.z=Math.PI/2;w.position.set(o[0],.32,o[1]);gr.add(w)});
   const cv=new T.Mesh(new T.CylinderGeometry(.5,.5,1.5,8,1,false,0,Math.PI),mc(col));cv.rotation.x=Math.PI/2;cv.rotation.z=Math.PI/2;cv.position.set(0,.95,0);gr.add(cv);
   box(gr,0,.55,1.75,.4,.5,1,"#6b4423");box(gr,0,1,2.25,.26,.45,.36,"#6b4423");[[-.15,1.4],[.15,1.4],[-.15,2.1],[.15,2.1]].forEach(o=>box(gr,o[0],0,o[1],.1,.55,.1,"#4a2e14"));
   const dr=npc("#7a4a2a",{hat:"#6a4a2a"});scene.remove(dr);dr.scale.set(.8,.8,.8);dr.position.set(0,.75,.6);gr.add(dr);if(flagC){box(gr,-.4,.9,-.7,.05,1.3,.05,"#2b2117");const f=new T.Mesh(new T.PlaneGeometry(.6,.4),M(flagC,{side:T.DoubleSide}));f.position.set(-.08,2,-.7);gr.add(f)}scene.add(gr);return gr};
  const routes=gates.map(q=>{const dx=q[0]-cen[0],dz=q[1]-cen[1],ax=Math.abs(dx)>Math.abs(dz),sx=ax?Math.sign(dx):0,sz=ax?0:Math.sign(dz),dl=Math.hypot(dx,dz)||1;return[[pl[0]+dx/dl*11,pl[1]+dz/dl*11],[q[0]-sx*6,q[1]-sz*6],[q[0]+sx*6,q[1]+sz*6],[q[0]+dx/dl*48,q[1]+dz/dl*48]]});
  const movers=[];const run=(gr,pts,v,wait)=>{gr.position.set(pts[0][0],0,pts[0][1]);movers.push({g:gr,pts,i:1,v,wait:wait||0,dir:1})};
  if(routes.length&&!ev.plague){let rk=0;try{(S.conv||[]).forEach(c=>{if(rk>=3)return;if(c.from===cid){run(cart("#e8dcc0",dc0),routes[rk%routes.length],2.1,rk*3);rk++}else if(c.to===cid){run(cart("#e8dcc0",dc0),routes[rk%routes.length].slice().reverse(),2.1,rk*3);rk++}})}catch(e){}
   const nC=night?0:1+((CN.tier||1)>2?1:0)+(ev.fair?1:0);for(let i=0;i<nC;i++){const r=routes[(i+rk)%routes.length];run(cart(["#c9b48a","#a8b8a0","#c8a890"][i%3],null),i%2?r:r.slice().reverse(),1.7+i*.2,2+i*6)}}
  life.push(dt=>{for(const o of movers){if(o.wait>0){o.wait-=dt;o.g.visible=o.wait<.1||o.i>1;continue}o.g.visible=true;const t=o.pts[o.i],dx=t[0]-o.g.position.x,dz=t[1]-o.g.position.z,dd=Math.hypot(dx,dz);if(dd<.3){o.i++;if(o.i>=o.pts.length){o.i=1;o.wait=6+Math.random()*10;o.g.position.set(o.pts[0][0],0,o.pts[0][1]);o.g.visible=false}continue}{const av=avoid(o.g,dx/dd,dz/dd);o.g.position.x+=av[0]*o.v*av[2]*dt;o.g.position.z+=av[1]*o.v*av[2]*dt;o.g.position.y=BRH(o.g.position.x,o.g.position.z);turnY(o.g,Math.atan2(av[0],av[1]),dt)}}});
  /* živý prístav (v113): mólo, kotviaca loď, šliapací žeriav a nosiči */
  try{const cwH=(S.cw&&S.cw[cid])||{};if(cwH.pristav&&!L.canal&&L.river&&L.river.length>3){const o=PRIK(),H=new T.Group();H.position.set(o.a[0],0,o.a[1]);H.rotation.y=o.th;g.add(H);const dcH=(()=>{try{return DC(0)}catch(e){return"#8a2a2a"}})();
    const wd=MT("wood","#8a6a44",2,1),dk=MT("wood","#5a3c22",2,1);
    box(H,0,0,6.9,17,.14,5.4,"#b0a898",0,"stone");box(H,0,0,4.25,17,.3,.5,"#8f8778",0,"stone");
    for(let x=-7.5;x<=7.5;x+=3)cyl(H,x,0,4.6,.16,.75,"#4a2e14",6);
    /* loď (koga) */
    const ship=new T.Group();ship.position.set(1.5,0,2.2);H.add(ship);
    const hull=new T.Mesh(new T.BoxGeometry(6.4,1,2),dk);hull.position.y=.42;hull.castShadow=true;ship.add(hull);
    [[-3.7,1],[3.7,-1]].forEach(e=>{const bw=new T.Mesh(new T.ConeGeometry(1.42,1.6,4),dk);bw.rotation.z=e[1]*Math.PI/2;bw.rotation.x=Math.PI/4;bw.scale.set(1,1,.72);bw.position.set(e[0]+e[1]*.3,.42,0);ship.add(bw)});
    const deck=new T.Mesh(new T.BoxGeometry(6.2,.08,1.8),wd);deck.position.y=.95;ship.add(deck);
    [[-2.5,1.7,1.5],[2.6,1.3,1.2]].forEach(c=>{const cs=new T.Mesh(new T.BoxGeometry(c[2],.7,1.9),wd);cs.position.set(c[0],.95+.35,0);cs.castShadow=true;ship.add(cs);[-.9,.9].forEach(z=>{const rl=new T.Mesh(new T.BoxGeometry(c[2],.28,.08),dk);rl.position.set(c[0],c[1]+.1,z);ship.add(rl)})});
    [-.98,.98].forEach(z=>{const rl=new T.Mesh(new T.BoxGeometry(6.3,.3,.08),dk);rl.position.set(0,1.1,z);ship.add(rl)});
    const mast=new T.Mesh(new T.CylinderGeometry(.09,.12,5.6,7),dk);mast.position.set(.2,3.7,0);mast.castShadow=true;ship.add(mast);
    const yard=new T.Mesh(new T.CylinderGeometry(.06,.06,3.6,6),dk);yard.rotation.x=Math.PI/2;yard.position.set(.2,5.6,0);ship.add(yard);
    const furl=new T.Mesh(new T.CylinderGeometry(.2,.2,3.2,8),M("#efe6d0"));furl.rotation.x=Math.PI/2;furl.position.set(.2,5.36,0);ship.add(furl);
    const nest=new T.Mesh(new T.CylinderGeometry(.34,.26,.34,8),wd);nest.position.set(.2,6.1,0);ship.add(nest);
    const fl=new T.Mesh(new T.PlaneGeometry(.9,.5),M(dcH,{side:T.DoubleSide}));fl.position.set(.68,6.75,0);ship.add(fl);const fp2=new T.Mesh(new T.CylinderGeometry(.025,.025,.9,4),dk);fp2.position.set(.2,6.7,0);ship.add(fp2);
    [[-1.2,.3],[-.5,-.35],[.9,.3]].forEach((c,i)=>{const cr=new T.Mesh(i%2?new T.CylinderGeometry(.3,.3,.6,10):new T.BoxGeometry(.6,.5,.6),wd);cr.position.set(c[0],1.25,c[1]);ship.add(cr)});
    [[-2.6,1],[4.2,1]].forEach(e=>{const rp=new T.Mesh(new T.CylinderGeometry(.025,.025,2.6,4),M("#c9b98a"));rp.position.set(e[0]+ship.position.x*0,.8,1.3);rp.rotation.x=Math.PI/2-.35;ship.add(rp)});
    const plank=new T.Mesh(new T.BoxGeometry(.9,.07,2.3),wd);plank.position.set(1.5,.62,3.85);plank.rotation.x=.33;H.add(plank);
    /* šliapací žeriav */
    const cb=new T.Group();cb.position.set(-4.4,0,6.6);H.add(cb);
    const base=new T.Mesh(new T.CylinderGeometry(1.25,1.4,2.3,12),MT("stone","#a8a294",3,1));base.position.y=1.15;base.castShadow=true;cb.add(base);
    const top=new T.Group();top.position.y=2.3;cb.add(top);
    const hs=new T.Mesh(new T.CylinderGeometry(1.3,1.3,1.5,12),wd);hs.position.y=.75;hs.castShadow=true;top.add(hs);
    const rf=new T.Mesh(new T.ConeGeometry(1.55,1.3,12),MT("wood","#5a3c22",3,1));rf.position.y=2.15;top.add(rf);
    const boom=new T.Mesh(new T.BoxGeometry(.2,.2,5.4),dk);boom.position.set(0,2.3,2.2);boom.rotation.x=-.55;boom.castShadow=true;top.add(boom);
    const strut=new T.Mesh(new T.BoxGeometry(.14,.14,2.6),dk);strut.position.set(0,1.5,1.4);strut.rotation.x=-1.05;top.add(strut);
    const tipZ=2.2+Math.cos(.55)*2.7,tipY=2.3+Math.sin(.55)*2.7;
    const rope=new T.Mesh(new T.CylinderGeometry(.025,.025,1,4),M("#c9b98a"));top.add(rope);
    const load=new T.Mesh(new T.BoxGeometry(.7,.6,.7),wd);load.castShadow=true;top.add(load);
    const wheel=new T.Mesh(new T.CylinderGeometry(.75,.75,.3,12),dk);wheel.rotation.z=Math.PI/2;wheel.position.set(-1.45,.8,0);top.add(wheel);
    solids.push((q=>[q[0],q[1],1.7])(o.W(-4.4,6.6)));
    /* kopa tovaru na móle */
    const pile=[[4.6,7.6,0],[5.5,7.4,1],[5,8.3,0],[6.3,8,2],[4.2,8.5,1],[5.1,7.7,3]];pile.forEach(c=>{let m;if(c[2]===1){m=new T.Mesh(new T.CylinderGeometry(.34,.34,.8,10),wd);m.position.set(c[0],.54,c[1])}else if(c[2]===2){m=new T.Mesh(new T.SphereGeometry(.34,8,6),M("#d8c690"));m.scale.set(1,.8,.85);m.position.set(c[0],.4,c[1])}else{m=new T.Mesh(new T.BoxGeometry(.7,.6,.7),c[2]===3?dk:wd);m.position.set(c[0],c[2]===3?1.04:.44,c[1])}m.castShadow=true;H.add(m)});
    solids.push((q=>[q[0],q[1],1.4])(o.W(5.2,7.9)));
    /* nosiči: loď → lávka → kopa a späť */
    const PATH=[[1.2,1,2.4],[1.5,1,2.9],[1.5,.2,4.9],[3.6,.14,6.6],[4.3,.14,7]],PL=[];let tot=0;for(let i=0;i<PATH.length-1;i++){const l=Math.hypot(PATH[i+1][0]-PATH[i][0],PATH[i+1][2]-PATH[i][2]);PL.push(l);tot+=l}
    const at=u=>{let d=u*tot;for(let i=0;i<PL.length;i++){if(d<=PL[i]||i===PL.length-1){const t=Math.min(1,d/PL[i]),a=PATH[i],b=PATH[i+1];return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,Math.atan2(b[0]-a[0],b[2]-a[2])]}d-=PL[i]}};
    const porters=[];for(let i=0;i<(night?1:3);i++){const m=npc(["#8a6a4a","#6a7a5a","#7a5a6a"][i],{hat:i===1?"#6a4a2a":null});scene.remove(m);H.add(m);const sk=new T.Mesh(new T.SphereGeometry(.3,8,6),M("#d8c690"));sk.scale.set(1.25,.75,.85);sk.position.set(.12,1.78,0);m.add(sk);porters.push({g:m,sk,u:i/3,dir:1,wait:i*1.5})}
    const boss=npc("#3a4a6a",{hat:"#2b2117"});scene.remove(boss);H.add(boss);boss.position.set(-1.6,.14,6.3);boss.rotation.y=Math.PI;
    life.push((dt,t)=>{if(!snow){ship.position.y=Math.sin(t*1.3)*.045;ship.rotation.x=Math.sin(t*.9)*.018}
     const ph=(t*.11)%1,sw=ph<.25?0:ph<.5?(ph-.25)*4:ph<.75?1:1-(ph-.75)*4,e=sw*sw*(3-2*sw);top.rotation.y=Math.PI-e*1.9;const drop=ph<.25?1-Math.abs(ph-.125)*8:ph>=.5&&ph<.75?1-Math.abs(ph-.625)*8:0,len=1+drop*2.6;rope.scale.y=len;rope.position.set(0,tipY-len/2,tipZ);load.position.set(0,tipY-len-.3,tipZ);wheel.rotation.x=t*(ph<.25||(ph>=.5&&ph<.75)?2.2:.3);
     for(const p of porters){if(p.wait>0){p.wait-=dt;stride(p.g,false,t,8);continue}p.u+=p.dir*dt*1.15/tot;if(p.u>=1){p.u=1;p.dir=-1;p.wait=1.2;p.sk.visible=false}else if(p.u<=0){p.u=0;p.dir=1;p.wait=1.5;p.sk.visible=true}const q=at(p.u);p.g.position.set(q[0],q[1],q[2]);p.g.rotation.y=q[3]+(p.dir<0?Math.PI:0);stride(p.g,true,t,8);if(p.sk.visible){p.g.userData.arms[1].rotation.x=-2.6}}
     boss.rotation.y=Math.PI+Math.sin(t*.5)*.5});
   }}catch(e){console.warn("3D prístav",e)}
  /* gondoly v kanáloch */
  if(L.canal&&!snow)(L.canals||[]).slice(0,3).forEach((cn,i)=>{if(!cn||cn.length<2)return;const bg=new T.Group();const hull=box(bg,0,.12,0,2.8,.22,.55,"#1c1814");box(bg,1.5,.3,0,.3,.35,.2,"#1c1814");box(bg,-1.5,.35,0,.25,.5,.15,"#1c1814");const gd=npc("#f4f0e6",{hat:"#c9a24a"});scene.remove(gd);gd.scale.set(.8,.8,.8);gd.position.set(-1,.2,0);bg.add(gd);scene.add(bg);boats.push({g:bg,rv:cn.map(wx),t:i*.3,v:.02+i*.006})});
  /* udalosti */
  const pole=(x,z,h,c)=>{cyl(g,x,0,z,.06,h,"#3a2a1a",5);const f=new T.Mesh(new T.PlaneGeometry(1.2,.75),M(c,{side:T.DoubleSide}));f.position.set(x+.65,h-.45,z);g.add(f);life.push((dt,t)=>{f.rotation.y=.35*Math.sin(t*2.2+x)})};
  if(ev.fair){const FC2=["#b8362c","#2f5bb0","#e0b04a","#2f7d46","#6d3f92"];for(let i=0;i<8;i++){const a=i/8*6.283,x=pl[0]+Math.cos(a)*12.5,z=pl[1]+Math.sin(a)*9.5;pole(x,z,4.2,FC2[i%5]);const a2=(i+1)/8*6.283,x2=pl[0]+Math.cos(a2)*12.5,z2=pl[1]+Math.sin(a2)*9.5;for(let k=1;k<6;k++){const u=k/6;const p2=new T.Mesh(new T.ConeGeometry(.16,.4,3),M(FC2[(i+k)%5]));p2.rotation.x=Math.PI;p2.position.set(x+(x2-x)*u,3.9-Math.sin(u*3.14)*.5,z+(z2-z)*u);g.add(p2)}}
   const s=label("Jarmok",null,1.3,{k:"event"});s.position.set(pl[0],7.5,pl[1]);g.add(s)}
  if(ev.plague){gates.forEach(q=>pole(q[0]+(cen[0]-q[0])*.08,q[1]+(cen[1]-q[1])*.08,9.5,"#141414"));pole(pl[0]+3,pl[1]+3,5,"#141414");for(let i=0;i<3;i++){const a=i*2.1+.5,x=pl[0]+Math.cos(a)*5,z=pl[1]+Math.sin(a)*4;cyl(g,x,0,z,.5,.2,"#2a2018",8);const fl=new T.Mesh(new T.ConeGeometry(.35,.9,6),new T.MeshBasicMaterial({color:"#f08a2a"}));fl.position.set(x,.65,z);g.add(fl);life.push((dt,t)=>{fl.scale.y=.8+.3*Math.sin(t*9+i);fl.scale.x=.9+.15*Math.sin(t*7+i)})}
   const s=label("Mor v meste",null,1.3,{k:"event"});s.position.set(pl[0],7.5,pl[1]);g.add(s)}
  if(ev.elec){const it=inter.find(q=>/^Radnica/.test(q.text||""));if(it){[-2.6,2.6].forEach(o=>pole(it.x+o,it.z+3.6,5,dc0));if(!ev.plague)for(let i=0;i<7;i++){const m=npc(ROBE[i%8],{hat:i%2?"#6a4a2a":null});m.position.set(it.x-3+i*1,0,it.z+5.4+(i%2)*.9);m.rotation.y=Math.PI}const s=label("Voľby",null,1,{k:"event"});s.position.set(it.x,11.5,it.z+3);g.add(s)}}
  if(ev.mourn){const it=inter.find(q=>q.kind==="home");if(it)pole(it.x+2.4,it.z+3,4.5,"#141414")}
  if(snow&&!ev.plague){const sx=pl[0]-5,sz=pl[1]-4.5;[[.55,.5],[.4,1.25],[.27,1.8]].forEach(q=>{const b=new T.Mesh(new T.SphereGeometry(q[0],10,8),mc("#f6f9fb"));b.position.set(sx,q[1],sz);b.castShadow=true;g.add(b)});const n=new T.Mesh(new T.ConeGeometry(.06,.3,5),mc("#e07a2a"));n.rotation.x=Math.PI/2;n.position.set(sx,1.82,sz+.3);g.add(n)}
  if(night){way.filter((_,i)=>i%4===0).slice(0,14).forEach(q=>{cyl(g,q[0]-1.2,0,q[1]-1.2,.05,2.4,"#2b2117",5);const lm=new T.Mesh(new T.SphereGeometry(.2,8,6),new T.MeshBasicMaterial({color:"#ffcf6a"}));lm.position.set(q[0]-1.2,2.5,q[1]-1.2);g.add(lm);LAMPS.push([q[0]-1.2,2.4,q[1]-1.2]);const gs=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(blobTex()),color:"#ffb84a",transparent:true,opacity:.32,depthWrite:false,blending:T.AdditiveBlending,fog:false}));gs.scale.set(2.8,2.8,1);gs.position.copy(lm.position);g.add(gs);const gp=new T.Mesh(new T.CircleGeometry(3.2,16),new T.MeshBasicMaterial({map:new T.CanvasTexture(blobTex()),color:"#ffb04a",transparent:true,opacity:.3,depthWrite:false,blending:T.AdditiveBlending}));gp.rotation.x=-Math.PI/2;gp.position.set(q[0]-1.2,.09,q[1]-1.2);g.add(gp)});gates.forEach(q=>{const dx=cen[0]-q[0],dz=cen[1]-q[1],dl=Math.hypot(dx,dz)||1;[-1,1].forEach(sg=>{const x=q[0]+dx/dl*3.6-dz/dl*sg*2.6,z=q[1]+dz/dl*3.6+dx/dl*sg*2.6;cyl(g,x,0,z,.06,2.2,"#3a2a1e",5);const fl=new T.Mesh(new T.ConeGeometry(.16,.5,6),new T.MeshBasicMaterial({color:"#ff9a2a"}));fl.position.set(x,2.45,z);g.add(fl);const gs=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(blobTex()),color:"#ff9a3a",transparent:true,opacity:.6,depthWrite:false,blending:T.AdditiveBlending,fog:false}));gs.scale.set(3.6,3.6,1);gs.position.set(x,2.5,z);g.add(gs);LAMPS.push([x,2.4,z]);life.push((dt,t)=>{fl.scale.y=.85+.3*Math.sin(t*11+x);gs.material.opacity=.5+.15*Math.sin(t*9+z)})})});
   {const PLS=[];for(let i=0;i<5;i++){const pl4=new T.PointLight("#ffb060",2.2,15,1.6);pl4.position.set(0,-50,0);scene.add(pl4);PLS.push(pl4)}let lt=9;life.push((dt,t)=>{lt+=dt;if(lt>.4){lt=0;const srt=LAMPS.map(q=>[Math.hypot(q[0]-px,q[2]-pz),q]).sort((a,b)=>a[0]-b[0]);PLS.forEach((p5,i)=>{const q=srt[i];if(q&&q[0]<60)p5.position.set(q[1][0],q[1][1],q[1][2]);else p5.position.set(0,-50,0)})}PLS.forEach((p5,i)=>{p5.userData.b=p5.userData.b||p5.intensity;p5.intensity=p5.userData.b*(.9+.1*Math.sin(t*8+i*2))})})}}
 }catch(e){console.warn("3D život",e)}
 /* obzor, oblaky a slnko (v99) */
 try{const hc=mixHex(sky,night?"#1a2440":snow?"#9fb2c4":"#6f8aa6",.55),hc2=mixHex(sky,night?"#1a2440":snow?"#b8c6d4":"#8ea6bb",.35);
  [[430,26,hc,60,95,22,52],[620,18,hc2,90,150,60,120]].forEach((cf,ri)=>{const mt=new T.MeshBasicMaterial({color:cf[2],fog:false});for(let i=0;i<cf[1];i++){const a=i/cf[1]*6.283+ri*.2,rr=cf[3]+((i*37)%100)/100*(cf[4]-cf[3]),hh=cf[5]+((i*53)%100)/100*(cf[6]-cf[5]);const m=new T.Mesh(new T.ConeGeometry(rr,hh,ri?5:7),mt);m.position.set(Math.cos(a)*cf[0],hh/2-2,Math.sin(a)*cf[0]);m.rotation.y=i;scene.add(m)}});
  const skirt=new T.Mesh(new T.CylinderGeometry(700,700,10,48,1,true),new T.MeshBasicMaterial({color:sky,fog:false,side:T.BackSide}));skirt.position.y=3;scene.add(skirt);
  const bt=new T.CanvasTexture(blobTex());if(!night){const nC=bad?26:12;for(let i=0;i<nC;i++){const cg=new T.Group();const cc=bad?"#b8c0c8":"#ffffff";for(let k=0;k<4;k++){const sp=new T.Sprite(new T.SpriteMaterial({map:bt,color:cc,transparent:true,opacity:bad?.75:.82,fog:false,depthWrite:false}));const w=60+((i*31+k*17)%50);sp.scale.set(w,w*.42,1);sp.position.set((k-1.5)*26,((k*7)%3)*5,((k*13)%4)*8);cg.add(sp)}
    const a=i*2.399,r=160+((i*59)%100)*4;cg.position.set(Math.cos(a)*r,150+((i*23)%50),Math.sin(a)*r);scene.add(cg);life.push(dt=>{cg.position.x+=dt*(1.2+(i%3)*.5);if(cg.position.x>620)cg.position.x=-620;cg.visible=cam.position.y<cg.position.y-12})}
   if(!bad&&TD){const sp=new T.Sprite(new T.SpriteMaterial({map:bt,color:"#fff2c0",transparent:true,opacity:.95,fog:false,depthWrite:false}));sp.scale.set(150,150,1);sp.position.set(TD.L[0]*900,Math.max(.25,TD.L[2])*900,TD.L[1]*900);scene.add(sp);const sp2=new T.Sprite(new T.SpriteMaterial({map:bt,color:"#ffffff",transparent:true,fog:false,depthWrite:false}));sp2.scale.set(52,52,1);sp2.position.copy(sp.position);scene.add(sp2)}}
  if(!night&&!bad){const bm2=new T.MeshBasicMaterial({color:"#2b2117",side:T.DoubleSide,fog:false});const wg=new T.BufferGeometry();wg.setAttribute("position",new T.Float32BufferAttribute([0,0,0,.9,.1,-.25,.9,.1,.25],3));const flock=new T.Group();const bs=[];for(let i=0;i<9;i++){const b=new T.Group();const wl=new T.Mesh(wg,bm2),wr=new T.Mesh(wg,bm2);wr.scale.x=-1;b.add(wl);b.add(wr);b.position.set((i%3-1)*3-Math.floor(i/3)*1.5,((i*7)%3)*.8,-Math.floor(i/3)*3+(i%3===1?1.5:0));flock.add(b);bs.push([wl,wr,i])}scene.add(flock);
   life.push((dt,t)=>{const a=t*.09;flock.position.set(Math.cos(a)*75,48+Math.sin(t*.3)*4,Math.sin(a)*75);flock.rotation.y=-a;for(const q of bs){const f=Math.sin(t*7+q[2])*.6;q[0].rotation.z=f;q[1].rotation.z=-f}})}
 }catch(e){console.warn("3D obloha",e)}
 /* ---------- počasie a noc (v96) ---------- */
 try{if(night){const N=420,v=[];for(let i=0;i<N;i++){const a=i*2.399,y=.08+((i*37)%100)/110,r=Math.sqrt(1-y*y);v.push(Math.cos(a)*r*520,y*520,Math.sin(a)*r*520)}const sg=new T.BufferGeometry();sg.setAttribute("position",new T.Float32BufferAttribute(v,3));const st2=new T.Points(sg,new T.PointsMaterial({color:"#fff6d8",size:2.2,sizeAttenuation:false,fog:false}));scene.add(st2);
   const mo=new T.Mesh(new T.SphereGeometry(16,16,12),new T.MeshBasicMaterial({color:"#f4efd8",fog:false}));mo.position.set(-240,330,-300);scene.add(mo);life.push(()=>{st2.position.set(cam.position.x,0,cam.position.z)})}
  if(wxS==="dazd"){const N=1500,v=new Float32Array(N*6),sp=[];for(let i=0;i<N;i++){const x=(Math.random()-.5)*70,y=Math.random()*34,z=(Math.random()-.5)*70;v.set([x,y,z,x+.06,y+.9,z],i*6);sp.push(22+Math.random()*10)}
   const rg=new T.BufferGeometry();rg.setAttribute("position",new T.BufferAttribute(v,3));const rn=new T.LineSegments(rg,new T.LineBasicMaterial({color:"#e6eef6",transparent:true,opacity:.85,fog:false,depthWrite:false}));rn.frustumCulled=false;scene.add(rn);
   life.push(dt=>{for(let i=0;i<N;i++){let y=v[i*6+1]-sp[i]*dt;if(y<0)y+=34;v[i*6+1]=y;v[i*6+4]=y+.9}rg.attributes.position.needsUpdate=true;rn.position.set(cam.position.x,0,cam.position.z)})}
  if(wxS==="sneh"){const N=1800,v=new Float32Array(N*3),ph2=[];for(let i=0;i<N;i++){v.set([(Math.random()-.5)*70,Math.random()*30,(Math.random()-.5)*70],i*3);ph2.push(Math.random()*6.3)}
   const sg=new T.BufferGeometry();sg.setAttribute("position",new T.BufferAttribute(v,3));const sn=new T.Points(sg,new T.PointsMaterial({color:"#ffffff",size:.22,transparent:true,opacity:.9,fog:false,depthWrite:false}));sn.frustumCulled=false;scene.add(sn);
   life.push((dt,t)=>{for(let i=0;i<N;i++){let y=v[i*3+1]-(1.6+(i%5)*.3)*dt;if(y<0)y+=30;v[i*3+1]=y;v[i*3]+=Math.sin(t+ph2[i])*.35*dt}sg.attributes.position.needsUpdate=true;sn.position.set(cam.position.x,0,cam.position.z)})}
  /* kŕdle vtákov krúžia nad strechami (v250) */
  if(!night&&wxS!=="dazd"&&wxS!=="sneh"&&QLV>0){const wg=new T.BufferGeometry();wg.setAttribute("position",new T.Float32BufferAttribute([0,0,-.12,0,0,.14,-.55,.05,.06],3));wg.computeVertexNormals();const bm=new T.MeshBasicMaterial({color:"#2a2622",side:T.DoubleSide,fog:true});
   const FL2=[];for(let f=0;f<3;f++){const fc=[pl[0]+(f-1)*22+Math.sin(f*2.1)*8,pl[1]+Math.cos(f*1.7)*14],R2=16+f*7,hh=15+f*3,sp2=(f%2?1:-1)*(.12+f*.03),birds=[];
    for(let i=0;i<6+f;i++){const b=new T.Group(),l=new T.Mesh(wg,bm),r=new T.Mesh(wg,bm);r.scale.x=-1;b.add(l,r);b.scale.setScalar(1.1);scene.add(b);birds.push({b,l,r,o:[(i%3-1)*1.4+Math.sin(i)*.5,(i>>1)*-1.1,Math.sin(i*1.3)*.6],ph:i*1.7})}FL2.push({fc,R2,hh,sp2,birds,a:f*2})}
   life.push((dt,t)=>{for(const F2 of FL2){F2.a+=F2.sp2*dt;const ca=Math.cos(F2.a),sa=Math.sin(F2.a),dir=F2.sp2>0?1:-1,tx=-sa*dir,tz=ca*dir;
    for(const B of F2.birds){const x=F2.fc[0]+ca*F2.R2+tx*B.o[1]+tz*B.o[0],z=F2.fc[1]+sa*F2.R2+tz*B.o[1]-tx*B.o[0];B.b.position.set(x,F2.hh+B.o[2]+Math.sin(t*1.3+B.ph)*.4,z);B.b.rotation.y=Math.atan2(tx,tz);const fl=Math.sin(t*9+B.ph)*.55;B.l.rotation.z=fl;B.r.rotation.z=-fl}}})}
  /* drobnosti vo vzduchu podľa obdobia: lístie, lupene, peľ, svätojánske mušky */
  {const mk=(N,cols,size,add2)=>{const v=new Float32Array(N*3),c=new Float32Array(N*3),ph2=[],cc=new T.Color();for(let i=0;i<N;i++){v.set([(Math.random()-.5)*56,Math.random()*11+.3,(Math.random()-.5)*56],i*3);cc.set(cols[i%cols.length]);c.set([cc.r,cc.g,cc.b],i*3);ph2.push(Math.random()*6.3)}
    const gg=new T.BufferGeometry();gg.setAttribute("position",new T.BufferAttribute(v,3));gg.setAttribute("color",new T.BufferAttribute(c,3));const pm=new T.Points(gg,new T.PointsMaterial({size,vertexColors:true,transparent:true,opacity:add2?1:.92,depthWrite:false,fog:!add2,blending:add2?T.AdditiveBlending:T.NormalBlending}));pm.frustumCulled=false;scene.add(pm);return{v,gg,pm,ph2,N}};
   if(wxS==="jasno"||wxS==="hmla"){
    if(night&&S.season!==3){const q=mk(70,["#ffe07a","#d8ff8a"],.2,true);life.push((dt,t)=>{for(let i=0;i<q.N;i++){q.v[i*3]+=Math.sin(t*.7+q.ph2[i])*.5*dt;q.v[i*3+1]+=Math.cos(t*.9+q.ph2[i]*2)*.3*dt;q.v[i*3+2]+=Math.cos(t*.6+q.ph2[i])*.5*dt}q.gg.attributes.position.needsUpdate=true;q.pm.material.opacity=.65+.35*Math.sin(t*2.2);q.pm.position.set(cam.position.x,0,cam.position.z)})}
    else if(!night&&S.season===2){const q=mk(110,["#c8782a","#b8452a","#d6a030","#9a5a24"],.2);life.push((dt,t)=>{for(let i=0;i<q.N;i++){let y=q.v[i*3+1]-(.7+(i%4)*.2)*dt;if(y<.05)y=11;q.v[i*3+1]=y;q.v[i*3]+=Math.sin(t*1.3+q.ph2[i])*.9*dt;q.v[i*3+2]+=Math.cos(t+q.ph2[i])*.5*dt}q.gg.attributes.position.needsUpdate=true;q.pm.position.set(cam.position.x,0,cam.position.z)})}
    else if(!night&&S.season===0){const q=mk(80,["#f8d8e4","#ffffff","#f4b8cc"],.15);life.push((dt,t)=>{for(let i=0;i<q.N;i++){let y=q.v[i*3+1]-(.45+(i%3)*.15)*dt;if(y<.05)y=11;q.v[i*3+1]=y;q.v[i*3]+=Math.sin(t+q.ph2[i])*.7*dt}q.gg.attributes.position.needsUpdate=true;q.pm.position.set(cam.position.x,0,cam.position.z)})}
    else if(!night&&S.season===1){const q=mk(60,["#fff4b0","#ffffff"],.09);life.push((dt,t)=>{for(let i=0;i<q.N;i++){q.v[i*3]+=Math.sin(t*.5+q.ph2[i])*.3*dt;q.v[i*3+1]+=Math.sin(t*.8+q.ph2[i]*3)*.2*dt}q.gg.attributes.position.needsUpdate=true;q.pm.position.set(cam.position.x,0,cam.position.z)})}}}
 }catch(e){console.warn("3D počasie",e)}
 /* ---------- vnútro budov ---------- */
 function mkRoom(w,d,h,wall,fk,fc){const sc=new T.Scene();sc.background=new T.Color("#1a120a");sc.add(new T.HemisphereLight("#fff4dc","#5a4630",1.05));const pl2=new T.PointLight("#ffd9a0",.7,60);pl2.position.set(0,h-.4,0);sc.add(pl2);
  const G=new T.Group();sc.add(G);const fl=new T.Mesh(new T.PlaneGeometry(w,d),MT(fk||"wood",fc||"#8a6a44",Math.round(w/2),Math.round(d/2)));fl.rotation.x=-Math.PI/2;G.add(fl);
  const wm=()=>MT("plaster",wall||"#e8dcc0",Math.round(w/3),2);
  [[0,-d/2,w,0],[0,d/2,w,Math.PI],[-w/2,0,d,Math.PI/2],[w/2,0,d,-Math.PI/2]].forEach(q=>{const m=new T.Mesh(new T.PlaneGeometry(q[2],h),wm());m.position.set(q[0],h/2,q[1]);m.rotation.y=q[3];G.add(m)});
  return{scene:sc,G,w,d,h,inter:[],solids:[]}}
 function homeStyle(rm,hv){const W1={n:1,z:1.3,h:1.1,w:.8};return({sien:hv>=4?{wall:"damask",floor:"marble",wain:"#5a3a20",cornice:1,win:{n:3,g:1,z:1.4,h:1.7,w:.8}}:hv>=2?{wall:"plasterW",floor:"plank",wain:"#6b4a2a",cornice:1,win:{n:2,g:hv>=3,z:1.3,h:1.25,w:.8}}:{wall:"plaster",floor:"plank",win:{n:2,z:1.2,h:.9,w:.8}},
   kuchyna:{wall:"wallY",floor:"cobble",win:{n:1,z:1.5,h:.8,w:.8}},pracovna:{wall:"plaster",floor:"plank",wain:"#6b4a2a",win:W1},spalna:{wall:"damaskB",floor:"plank",wain:"#5a3a20",win:W1},kaplnka:{wall:"wallY",floor:"marble",win:{n:2,g:1,tr:1,z:1.2,h:1.9,w:.8}},kniznica:{wall:"plaster",floor:"plank",wain:"#6b4a2a",win:W1},zbrojnica:{wall:"wallY",floor:"cobble",win:{n:1,z:1.6,h:.7,w:.6}}})[rm]||{wall:"plaster",floor:"plank"}}
 function mkRoom2(w,d,h,sy){sy=sy||{};const sc=new T.Scene();sc.background=new T.Color("#1a120a");const ngt=(()=>{try{return todPh()===3}catch(e){return false}})(),SH=shOn();sc.userData.ngt=ngt;
  sc.add(new T.HemisphereLight(ngt?"#c9b08a":"#fff4dc",ngt?"#3a2c1e":"#5a4836",SH?(ngt?.26:.5):1.0));const pl2=new T.PointLight("#ffd9a0",SH?(ngt?.3:.25):.75,70);pl2.position.set(0,h-.4,0);sc.add(pl2);
  if(SH){const dl=new T.DirectionalLight(ngt?"#ffc98a":"#fff3dc",ngt?.36:.95);dl.position.set(w*.75+2,h*2+3,-d*.12);dl.target.position.set(0,0,0);sc.add(dl);sc.add(dl.target);dl.castShadow=true;const RS=Math.max(w,d)*.8+1;Object.assign(dl.shadow.camera,{left:-RS,right:RS,top:RS,bottom:-RS,near:.5,far:h*2.4+RS*2+12});dl.shadow.mapSize.set(2048,2048);dl.shadow.bias=-.0012;try{dl.shadow.normalBias=.03}catch(e){}dl.shadow.radius=4;sc.userData.dl=dl}
  const G=new T.Group();sc.add(G);const WN=[.857,-.515,0];const one=(m)=>{const c=m.clone();c.side=T.FrontSide;return c};
  const fl=new T.Mesh(new T.PlaneGeometry(w,d),one(faceMat(sy.floor||"plank",w,d,[0,0,1],{tpu:sy.floor==="marble"?20:14,clean:1})));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;fl.userData.noCast=1;G.add(fl);
  const base={tpu:14,clean:1,wain:sy.wain||null,cornice:sy.cornice?1:null};const wi=sy.win;
  const side=len=>{if(!wi)return base;const arr=[];for(let i=0;i<wi.n;i++){const a=len*(i+.5)/wi.n-wi.w/2;arr.push(wi.g?[a,wi.z,wi.w,Math.min(wi.h,h-wi.z-.5),wi.tr?1:0]:[a,wi.z,wi.w,Math.min(wi.h,h-wi.z-.4)])}return Object.assign({},base,wi.g?{win:arr}:{sqwin:arr})};
  [[0,-d/2,w,0,base],[0,d/2,w,Math.PI,base],[-w/2,0,d,Math.PI/2,side(d)],[w/2,0,d,-Math.PI/2,side(d)]].forEach(q=>{const m=new T.Mesh(new T.PlaneGeometry(q[2],h),one(faceMat(sy.wall||"plaster",q[2],h,WN,q[4])));m.position.set(q[0],h/2,q[1]);m.rotation.y=q[3];m.userData.noCast=1;m.receiveShadow=true;G.add(m)});
  /* svietniky na stenách */let nSc=0;
  const fm=new T.MeshBasicMaterial({color:"#ffcf6a"});[-1,1].forEach(sg=>{for(let i=0;i<Math.max(1,Math.round(d/5));i++){const z=-d/2+d*(i+.5)/Math.max(1,Math.round(d/5))+ (wi?d/(2*Math.max(1,wi.n)):0)*0;const x=sg*(w/2-.12);const b=new T.Mesh(new T.BoxGeometry(.1,.1,.36),M("#caa54a"));b.position.set(x,2.15,z-d/(4*Math.max(1,wi?wi.n:1)));G.add(b);const f=new T.Mesh(new T.SphereGeometry(.08,6,5),fm);f.position.set(x,2.36,z-d/(4*Math.max(1,wi?wi.n:1)));G.add(f);glow(G,x-sg*.08,2.38,f.position.z,1.9,"#ffb040",ngt?.75:.5);if(SH&&nSc<4){nSc++;const pl=new T.PointLight("#ffa850",ngt?1.15:.4,9);pl.position.set(x-sg*.35,2.4,f.position.z);sc.add(pl);flick(pl)}}});
  return{scene:sc,G,w,d,h,inter:[],solids:[]}}
 function rug(G,x,z,w,d,tex){const m=new T.Mesh(new T.PlaneGeometry(w,d),faceMat(tex||"damask",w,d,[0,0,1],{tpu:14,clean:1}));m.rotation.x=-Math.PI/2;m.position.set(x,.02,z);G.add(m)}
 const rAdd=(R,x,z,r,text,act)=>R.inter.push({x,z,r,text,act});
 /* nábytok v štýle mapy (v98): textúry dreva, kameňa, mramoru a damašku */
 const KO=G=>G.userData.kit||(G.userData.kit=mapKit(G));
 const WD={tex:"wood",clean:1,tpu:9,topTex:"wood"},PK={tex:"plank",clean:1,tpu:9,topTex:"plank"};
 let GLT=null;function glow(G,x,y,z,sz,col,op){try{if(!GLT){const c=document.createElement("canvas");c.width=c.height=64;const q=c.getContext("2d"),gr=q.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,"rgba(255,255,255,1)");gr.addColorStop(.25,"rgba(255,255,255,.45)");gr.addColorStop(1,"rgba(255,255,255,0)");q.fillStyle=gr;q.fillRect(0,0,64,64);GLT=new T.CanvasTexture(c)}
   const sp=new T.Sprite(new T.SpriteMaterial({map:GLT,color:col||"#ffb648",blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:op==null?.5:op}));sp.position.set(x,y,z);sp.scale.set(sz,sz,1);sp.userData.glow=1;G.add(sp);const ph=x*7.3+z*3.1;life.push((dt,t)=>{if(sp.parent){const k=1+.08*Math.sin(t*9+ph)+.05*Math.sin(t*23+ph*2);sp.scale.set(sz*k,sz*k,1)}});return sp}catch(e){return null}}
 function flick(l){const ph=Math.random()*9;life.push((dt,t)=>{if(!l.parent)return;if(l.userData.b==null)l.userData.b=l.intensity;l.intensity=l.userData.b*(1+.1*Math.sin(t*11+ph)+.07*Math.sin(t*27+ph*3))})}
 function candle(G,x,y,z){glow(G,x,y+.3,z,.7,"#ffb648",.42);const c=new T.Mesh(new T.CylinderGeometry(.035,.035,.22,6),M("#f4ecd8"));c.position.set(x,y+.11,z);G.add(c);const f=new T.Mesh(new T.SphereGeometry(.05,6,5),new T.MeshBasicMaterial({color:"#ffcf6a"}));f.scale.y=1.6;f.position.set(x,y+.29,z);G.add(f)}
 function chair(G,R,x,z,ry,o){o=o||{};const K=KO(G),w=o.w||.62,hb=o.hb||1.25;K.box(x-w/2,z-w/2,w,w,.5,WD);const fwd=[Math.sin(ry||0),Math.cos(ry||0)];const bx=x-fwd[0]*(w/2-.05),bz=z-fwd[1]*(w/2-.05);
  if(Math.abs(fwd[1])>.5)K.box(x-w/2,bz-.05,w,.1,hb,WD);else K.box(bx-.05,z-w/2,.1,w,hb,WD);
  if(o.cush){const m=new T.Mesh(new T.BoxGeometry(w-.1,.08,w-.1),M(o.cush));m.position.set(x,.54,z);G.add(m)}if(R)R.solids.push([x,z,.42])}
 function table(G,R,x,z,w,d,o){o=o||{};const K=KO(G);K.box(x-w/2,z-d/2,w,d,.1,Object.assign({z:.72},PK));[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>K.box(x+q[0]*(w/2-.22)-.07,z+q[1]*(d/2-.2)-.07,.14,.14,.72,WD));K.box(x-w/2+.25,z-.05,w-.5,.1,.1,Object.assign({z:.3},WD));
  if(!o.bare){const n=Math.max(1,Math.round(w/2));for(let i=0;i<n;i++){const cx=x-w/2+w*(i+.5)/n;candle(G,cx,.82,z);[-1,1].forEach(sd=>{const pl3=new T.Mesh(new T.CylinderGeometry(.16,.13,.03,10),M("#d8d0bc"));pl3.position.set(cx+.45,.835,z+sd*d*.28);G.add(pl3)})}
   const jug=new T.Mesh(new T.CylinderGeometry(.08,.11,.26,8),M("#8a5a32"));jug.position.set(x-w*.3,.95,z+.1);G.add(jug)}
  if(o.chairs){const n=Math.max(1,Math.floor(w/1.3));for(let i=0;i<n;i++){const cx=x-w/2+w*(i+.5)/n;chair(G,null,cx,z+d/2+.5,Math.PI);if(o.chairs>1)chair(G,null,cx,z-d/2-.5,0)}}
  R.solids.push([x,z,Math.max(w,d)*.42])}
 function fire(G,R,x,z){const K=KO(G);const st2={tex:"wall",quoin:1,clean:1,tpu:12};K.box(x-1.4,z-.4,.55,.9,1.75,st2);K.box(x+.85,z-.4,.55,.9,1.75,st2);K.box(x-1.5,z-.4,3,1,.4,Object.assign({z:1.75,topTex:"top"},st2));K.box(x-1.05,z-.4,2.1,.55,1.5,{z:2.15,tex:"plasterW",clean:1,tpu:12});
  box(G,x,0,z-.25,1.7,1.75,.3,"#1a1410");[-.3,.25].forEach((o2,i)=>{const lg=new T.Mesh(new T.CylinderGeometry(.11,.11,1,7),M("#5a3a20"));lg.rotation.z=Math.PI/2;lg.rotation.y=i*.4;lg.position.set(x+o2*.3,.14+i*.12,z+.15);G.add(lg)});
  const fl=new T.Mesh(new T.ConeGeometry(.34,.95,6),new T.MeshBasicMaterial({color:"#ff9a2a"}));fl.position.set(x,.6,z+.15);G.add(fl);const f2=new T.Mesh(new T.ConeGeometry(.18,.55,6),new T.MeshBasicMaterial({color:"#ffe08a"}));f2.position.set(x+.05,.5,z+.2);G.add(f2);
  const pl3=new T.PointLight("#ff9a3a",shOn()?1.25:.8,14);pl3.position.set(x,1,z+1);G.add(pl3);flick(pl3);glow(G,x,.7,z+.3,3.2,"#ff8a2a",.55);life.push((dt,t)=>{if(fl.parent){fl.scale.y=1+.14*Math.sin(t*10)+.08*Math.sin(t*23);f2.scale.y=1+.2*Math.sin(t*13+1);f2.position.x=x+.05+.04*Math.sin(t*7)}});candle(G,x-1.1,2.15,z+.2);candle(G,x+1.1,2.15,z+.2);R.solids.push([x,z,1.5])}
 function door(G,z,w,h){const pm=(tex,ww,hh)=>{const m=faceMat(tex,ww,hh,[.857,-.515,0],{clean:1,tpu:9}).clone();m.side=T.FrontSide;return m};const add=(ww,hh,x,y,zz,tex)=>{const m=new T.Mesh(new T.PlaneGeometry(ww,hh),pm(tex,ww,hh));m.position.set(x,y,zz);m.rotation.y=Math.PI;m.userData.noCast=1;G.add(m)};
  add(w+.44,h+.22,0,(h+.22)/2,z-.02,"wood");add(w,h,0,h/2,z-.05,"plank");[.5,h-.5].forEach(y=>{const b=new T.Mesh(new T.PlaneGeometry(w*.9,.08),new T.MeshBasicMaterial({color:"#2b2117"}));b.position.set(0,y,z-.07);b.rotation.y=Math.PI;G.add(b)});const kn=new T.Mesh(new T.SphereGeometry(.06,6,5),M("#caa54a"));kn.position.set(w*.32,h*.48,z-.1);G.add(kn)}
 function sideDoor(G,x,z,sd){const K=KO(G);K.box(sd>0?x-.1:x,z-.55,.1,1.1,2.1,{tex:"plank",clean:1,tpu:9});K.box(sd>0?x-.14:x-.02,z-.72,.16,.17,2.3,WD);K.box(sd>0?x-.14:x-.02,z+.55,.16,.17,2.3,WD)}
 function bench(G,R,x,z,w,back){const K=KO(G);K.box(x-w/2,z-.22,w,.44,.45,WD);if(back)K.box(x-w/2,z+.18,w,.08,.95,WD);[-1,1].forEach(q=>K.box(x+q*(w/2)-(q>0?.08:0),z-.26,.08,.52,back?1:.6,WD));R.solids.push([x,z,w*.4])}
 function shelf(G,R,x,z,sd,len){const K=KO(G);const x0=sd>0?x-.5:x;K.box(x0,z-len/2,.5,len,2.7,WD);const cols=["#7a1f2b","#2f5bb0","#2f7d46","#c9971a","#5a3a6a","#8a5a32"];const SK=shelf.kind,xs=sd>0?x-.56:x+.56,put=(geo,c,y,zz,sc,rx)=>{const q=new T.Mesh(geo,M(c));q.position.set(xs,y,zz);if(sc)q.scale.set(sc[0],sc[1],sc[2]);if(rx)q.rotation.x=rx;G.add(q)};
  for(let j=0;j<4;j++){let zz=z-len/2+.12;let k=j;const y0=.42+j*.6;
   if(SK&&SK!=="books"){let n=0;for(let q=z-len/2+.25;q<z+len/2-.2;q+=SK==="cloth"?.42:SK==="tools"?.3:.36,n++){const h=(n*7+j*3)%5;
     if(SK==="pots")put(new T.SphereGeometry(.13,8,6),["#b8643a","#8a4a2a","#c98d4a","#3f7f72","#a85a3a"][h],y0+.15,q,[1,1.1+h*.08,1]);
     else if(SK==="cloth")put(new T.CylinderGeometry(.13,.13,.3,10),["#2f5bb0","#a3121e","#2f6a3a","#c9971a","#5a1a5e"][h],y0+.14,q,null,0);
     else if(SK==="jars")put(new T.CylinderGeometry(.07,.08,.2+h*.03,8),["#2f7d46","#8c4fc0","#c0262a","#e8e0d0","#c9971a"][h],y0+.12+h*.015,q);
     else if(SK==="tools"){put(new T.BoxGeometry(.05,.34,.05),"#6a4a2c",y0+.19,q,null,.25);put(new T.BoxGeometry(.07,.1,.16),"#4a4a52",y0+.36,q+.04)}
     else if(SK==="bread")put(new T.SphereGeometry(.13,8,6),h%2?"#c98a3a":"#b87a30",y0+.1,q,[1,.6,1.4]);
     else if(SK==="mugs")put(new T.CylinderGeometry(.07,.06,.16,8),h%2?"#8a6a44":"#b9b0a0",y0+.1,q);
     else if(SK==="sacks")put(new T.SphereGeometry(.15,8,6),"#e6d8a8",y0+.15,q,[1,1.1,.9]);
     else if(SK==="gold")put(new T.BoxGeometry(.14,.1+h*.02,.14),h%3?"#e3be4f":"#d0d5dc",y0+.08,q);
     else if(SK==="glass")put(new T.CylinderGeometry(.05,.08,.24+h*.03,8),["#7ac0c8","#9ad0a0","#c8e0e8","#7a9ad0","#d0c890"][h],y0+.14,q);
     else if(SK==="hides")put(new T.CylinderGeometry(.12,.12,.3,8),["#b8875a","#8a5a32","#6b4423","#c9a070","#7a5a3a"][h],y0+.13,q);
     else put(new T.BoxGeometry(.24,.2,.24),"#8a6a44",y0+.12,q)}}
   else while(zz<z+len/2-.2){const bw=.07+((k*7)%4)*.02,bh=.3+((k*5)%3)*.05;const bk=new T.Mesh(new T.BoxGeometry(.3,bh,bw),M(cols[k%6]));bk.position.set(sd>0?x-.56:x+.56,.42+j*.6+bh/2,zz+bw/2);G.add(bk);zz+=bw+.015;k++}const pl3=new T.Mesh(new T.BoxGeometry(.34,.04,len-.1),M("#5a3a20"));pl3.position.set(sd>0?x-.56:x+.56,.4+j*.6,z);G.add(pl3)}R.solids.push([x,z,len*.4])}
 function bed(G,R,x,z){const K=KO(G);K.box(x-1.15,z-1.5,2.3,3,.5,WD);K.box(x-1.1,z-1.4,2.2,2.9,.22,{z:.5,tex:"damaskB",topTex:"damaskB",clean:1,tpu:12});K.box(x-1.15,z-1.62,2.3,.14,1.5,WD);[[-1.1,-1.5],[1,-1.5],[-1.1,1.4],[1,1.4]].forEach(q=>K.box(x+q[0],z+q[1],.12,.12,2.3,WD));K.box(x-1.2,z-1.6,2.4,3.15,.08,{z:2.3,tex:"damask",topTex:"damask",clean:1,tpu:12});
  const pw=new T.Mesh(new T.BoxGeometry(1.5,.18,.5),M("#f4ecd8"));pw.position.set(x,.82,z-1.1);G.add(pw);R.solids.push([x,z,1.7])}
 function chest(G,R,x,z,w){const K=KO(G);K.box(x-w/2,z-.35,w,.7,.55,WD);const lid=new T.Mesh(new T.CylinderGeometry(.35,.35,w,10,1,false,0,Math.PI),MT("wood","#7a4d23",2,1));lid.rotation.z=Math.PI/2;lid.rotation.y=0;lid.position.set(x,.55,z);G.add(lid);[-.3,.3].forEach(o2=>{const b=new T.Mesh(new T.BoxGeometry(.06,.6,.74),M("#2b2117"));b.position.set(x+o2*w,.3,z);G.add(b)});R.solids.push([x,z,w*.45])}
 function altar(G,R,x,z,w){const K=KO(G);K.box(x-w/2-.3,z-.75,w+.6,1.5,.2,{tex:"marble",topTex:"marble",clean:1,tpu:16});K.box(x-w/2,z-.5,w,1,1,{z:.2,tex:"marble",topTex:"marble",clean:1,tpu:16});const cl=new T.Mesh(new T.BoxGeometry(w*.7,.04,1.06),M("#f4ecd8"));cl.position.set(x,1.22,z);G.add(cl);
  box(G,x,1.24,z-.2,.1,1.3,.1,"#e3be4f");box(G,x,2.0,z-.2,.66,.1,.1,"#e3be4f");candle(G,x-w*.3,1.24,z);candle(G,x+w*.3,1.24,z);R.solids.push([x,z,w*.6])}
 function throne(G,R,x,z){const K=KO(G);K.box(x-2.2,z-1,4.4,2.6,.25,{tex:"marble",topTex:"marble",clean:1,tpu:16});K.box(x-1.6,z-.9,3.2,1.9,.22,{z:.25,tex:"marble",topTex:"marble",clean:1,tpu:16});K.box(x-.55,z-.6,1.1,.9,.6,Object.assign({z:.47},WD));K.box(x-.6,z-.75,1.2,.16,2.4,Object.assign({z:.47},WD));
  [-.62,.5].forEach(o2=>K.box(x+o2,z-.6,.12,.9,.95,Object.assign({z:.47},WD)));const cu=new T.Mesh(new T.BoxGeometry(.9,.1,.7),M("#7a1f2b"));cu.position.set(x,1.12,z-.12);G.add(cu);const bk=new T.Mesh(new T.PlaneGeometry(.9,1.5),faceMat("damask",.9,1.5,[.857,-.515,0],{clean:1,tpu:14}));bk.position.set(x,2,z-.58);G.add(bk);
  [-.6,.6].forEach(o2=>{const b=new T.Mesh(new T.SphereGeometry(.1,8,6),M("#e3be4f"));b.position.set(x+o2,2.95,z-.67);G.add(b)});R.solids.push([x,z,1.4])}
 function keg(G,R,x,z){const m=new T.Mesh(new T.CylinderGeometry(.38,.38,.85,12),MT("wood","#8a5a32",2,1));m.position.set(x,.43,z);G.add(m);[.22,.62].forEach(y=>{const r=new T.Mesh(new T.CylinderGeometry(.395,.395,.05,12),M("#3a2410"));r.position.set(x,y,z);G.add(r)});R.solids.push([x,z,.5])}
 /* ---------- zariadenie izieb (v158): obrazy, tapisérie, riad, slama, pavučiny, náradie ---------- */
 const PTX={};function paintTex(kind,seed){const key=kind+"|"+seed;if(PTX[key])return PTX[key];const c=document.createElement("canvas");c.width=128;c.height=160;const x=c.getContext("2d"),W=128,H=160;let sd=seed*97+13;const rn=()=>{sd=(sd*9301+49297)%233280;return sd/233280};
   if(kind==="land"){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"#9cc0dc");g.addColorStop(.6,"#e8dcb8");x.fillStyle=g;x.fillRect(0,0,W,H);x.fillStyle="#7a9a6a";x.beginPath();x.moveTo(0,100);x.quadraticCurveTo(40,70+rn()*20,80,95);x.quadraticCurveTo(105,80,W,98);x.lineTo(W,H);x.lineTo(0,H);x.fill();x.fillStyle="#5a7a4a";x.beginPath();x.moveTo(0,125);x.quadraticCurveTo(60,105,W,128);x.lineTo(W,H);x.lineTo(0,H);x.fill();x.fillStyle="#b8ad98";x.fillRect(70,62,26,34);x.fillRect(64,54,8,42);x.fillRect(94,50,8,46);x.fillStyle="#8a3a2a";x.beginPath();x.moveTo(62,54);x.lineTo(68,40);x.lineTo(74,54);x.fill();x.beginPath();x.moveTo(92,50);x.lineTo(98,34);x.lineTo(104,50);x.fill();x.fillStyle="#3f5a3a";for(let i=0;i<5;i++){const tx=8+rn()*50,ty=108+rn()*30;x.beginPath();x.arc(tx,ty,7+rn()*4,0,7);x.fill()}}
   else if(kind==="port"){x.fillStyle=["#3a2a22","#2a3038","#3a2630"][seed%3];x.fillRect(0,0,W,H);x.fillStyle=["#7a1f2b","#2f4a7a","#3f5a3a","#5a3a6a"][seed%4];x.beginPath();x.moveTo(14,H);x.quadraticCurveTo(20,104,64,100);x.quadraticCurveTo(108,104,114,H);x.fill();x.fillStyle="#e2c4a0";x.fillRect(56,84,16,22);x.beginPath();x.ellipse(64,66,24,29,0,0,7);x.fill();x.fillStyle=["#5a3a20","#2a201a","#b08a4a","#8a8a8a"][seed%4];x.beginPath();x.ellipse(64,48,26,18,0,Math.PI,0);x.fill();x.fillRect(38,46,7,26);x.fillRect(83,46,7,26);x.fillStyle="#2a201a";x.fillRect(53,64,5,3);x.fillRect(70,64,5,3);x.fillStyle="#9a4a3a";x.fillRect(58,80,12,2);x.fillStyle="#e3be4f";x.fillRect(46,110,36,3)}
   else if(kind==="saint"){x.fillStyle="#c9a23a";x.fillRect(0,0,W,H);x.fillStyle="#f0d870";x.beginPath();x.arc(64,52,30,0,7);x.fill();x.fillStyle=seed%2?"#2f4a8a":"#8a2a2a";x.beginPath();x.moveTo(20,H);x.quadraticCurveTo(26,92,64,86);x.quadraticCurveTo(102,92,108,H);x.fill();x.fillStyle="#e2c4a0";x.beginPath();x.ellipse(64,56,17,21,0,0,7);x.fill();x.fillStyle="#5a3a20";x.beginPath();x.ellipse(64,44,18,12,0,Math.PI,0);x.fill();x.fillStyle="#2a201a";x.fillRect(56,54,4,2);x.fillRect(68,54,4,2);x.strokeStyle="#7a5a1a";x.lineWidth=3;x.strokeRect(5,5,W-10,H-10)}
   else if(kind==="map"){x.fillStyle="#e8d8a8";x.fillRect(0,0,W,H);x.strokeStyle="#7a5a34";x.lineWidth=1.5;for(let i=0;i<4;i++){x.beginPath();x.moveTo(rn()*W,rn()*H);for(let k=0;k<5;k++)x.quadraticCurveTo(rn()*W,rn()*H,rn()*W,rn()*H);x.stroke()}x.fillStyle="#8a3a2a";for(let i=0;i<7;i++){x.beginPath();x.arc(12+rn()*104,14+rn()*130,2.5,0,7);x.fill()}x.fillStyle="#4a6a9a";x.globalAlpha=.4;x.beginPath();x.ellipse(96,120,30,22,0,0,7);x.fill();x.globalAlpha=1}
   else{/* tapiséria */const cs=[["#7a1f2b","#e3be4f"],["#2f4a7a","#e8dcc0"],["#3f5a3a","#e3be4f"],["#5a3a6a","#e8dcc0"]][seed%4];x.fillStyle=cs[0];x.fillRect(0,0,W,H);x.fillStyle=cs[1];for(let r=0;r<5;r++)for(let q=0;q<4;q++){const cx=16+q*32,cy=18+r*31;x.beginPath();x.moveTo(cx,cy-9);x.lineTo(cx+8,cy);x.lineTo(cx,cy+9);x.lineTo(cx-8,cy);x.fill()}x.fillRect(0,0,W,5);x.fillRect(0,H-5,W,5);x.fillRect(0,0,4,H);x.fillRect(W-4,0,4,H)}
   const t=new T.CanvasTexture(c);PTX[key]=t;return t}
 function painting(G,x,y,z,ry,w,h,kind,seed,gold){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=ry||0;G.add(g);const fr=new T.Mesh(new T.BoxGeometry(w+.14,h+.14,.05),M(gold?"#c9a23a":"#5a3a20"));fr.position.z=.03;g.add(fr);const cv=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshLambertMaterial({map:paintTex(kind,seed|0)}));cv.position.z=.06;g.add(cv);return g}
 function tapestry(G,x,y,z,ry,w,h,seed){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=ry||0;G.add(g);const cv=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshLambertMaterial({map:paintTex("tap",seed|0),side:T.DoubleSide}));cv.position.z=.05;g.add(cv);const rod=new T.Mesh(new T.CylinderGeometry(.025,.025,w+.3,6),M("#5a3a20"));rod.rotation.z=Math.PI/2;rod.position.set(0,h/2+.03,.05);g.add(rod);for(let i=0;i<Math.round(w/.14);i++){const f=new T.Mesh(new T.BoxGeometry(.03,.09,.01),M("#e3be4f"));f.position.set(-w/2+.07+i*.14,-h/2-.045,.05);g.add(f)}return g}
 let CWT=null;function cobweb(G,x,y,z,ry){try{if(!CWT){const c=document.createElement("canvas");c.width=c.height=96;const q=c.getContext("2d");q.strokeStyle="rgba(235,235,225,.75)";q.lineWidth=1;for(let i=0;i<=6;i++){const a=i/6*Math.PI/2;q.beginPath();q.moveTo(0,0);q.lineTo(Math.cos(a)*96,Math.sin(a)*96);q.stroke()}for(let r=18;r<96;r+=15){q.beginPath();for(let i=0;i<=6;i++){const a=i/6*Math.PI/2,rr=r*(i%2?.9:1);i?q.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):q.moveTo(Math.cos(a)*rr,Math.sin(a)*rr)}q.stroke()}CWT=new T.CanvasTexture(c)}
   const m=new T.Mesh(new T.PlaneGeometry(.9,.9),new T.MeshBasicMaterial({map:CWT,transparent:true,depthWrite:false,side:T.DoubleSide,opacity:.8}));m.position.set(x,y,z);m.rotation.y=ry;G.add(m)}catch(e){}}
 function straw(G,w,d,n){for(let i=0;i<n;i++){const a=((i*53)%17)/17,b=((i*31)%13)/13,m=new T.Mesh(new T.PlaneGeometry(.5+a*.5,.06),M(i%2?"#c9b060":"#b89a48",{side:T.DoubleSide}));m.rotation.x=-Math.PI/2;m.rotation.z=a*6.28;m.position.set((a-.5)*(w-1.5),.012+i*.0005,(b-.5)*(d-1.5));m.userData.noCast=1;G.add(m)}}
 function prop(G,geo,c,x,y,z,sx,sy,sz){const m=new T.Mesh(geo,M(c));m.position.set(x,y,z);if(sx)m.scale.set(sx,sy||sx,sz||sx);G.add(m);return m}
 const PG={get s(){return PG._s||(PG._s=new T.SphereGeometry(1,9,7))},get c(){return PG._c||(PG._c=new T.CylinderGeometry(1,1,1,10))},get b(){return PG._b||(PG._b=new T.BoxGeometry(1,1,1))},get k(){return PG._k||(PG._k=new T.ConeGeometry(1,1,8))}};
 function feast(G,x,z,lvl){const y=.82;/* chlieb, misa s ovocím, pečienka, pohár */
   prop(G,PG.s,"#b8823a",x+.55,y+.06,z+.05,.17,.09,.12);prop(G,PG.b,"#8a6a3a",x+.55,y+.008,z+.05,.42,.016,.28);
   if(lvl>=1){prop(G,PG.c,lvl>=4?"#c8ccd2":"#8a5a32",x-.5,y+.04,z-.06,.17,.08,.17);[["#b8362c",-.06,0],["#c9a23a",.05,.04],["#6a8a3a",0,-.06],["#b8362c",.02,.07]].forEach(q=>prop(G,PG.s,q[0],x-.5+q[1],y+.11,z-.06+q[2],.055))}
   if(lvl>=2){prop(G,PG.c,lvl>=4?"#c8ccd2":"#b8b4a8",x,y+.012,z,.3,.024,.2);prop(G,PG.s,"#8a4a22",x,y+.1,z,.2,.1,.13);prop(G,PG.c,"#e8dcc0",x+.2,y+.1,z,.02,.1,.02)}
   if(lvl>=3)[-1,1].forEach(q=>{prop(G,PG.c,lvl>=4?"#e3be4f":"#b8b4a8",x+q*1.05,y+.07,z-.12,.045,.14,.045);prop(G,PG.c,lvl>=4?"#e3be4f":"#b8b4a8",x+q*1.05,y+.005,z-.12,.06,.01,.06)})}
 function kitchenStuff(G,R,w,dd,hv){/* trám so zavesenými klobásami, cibuľou a bylinkami */
   prop(G,PG.b,"#5a3a20",-1.5,2.55,.5,3.2,.1,.1);for(let i=0;i<9;i++){const x=-2.9+i*.35,k=i%3;prop(G,PG.c,"#3a2a1a",x,2.42,.5,.006,.16,.006);if(k===0)prop(G,PG.c,"#7a2a1a",x,2.2,.5,.035,.28,.035);else if(k===1){prop(G,PG.s,"#c9a05a",x,2.28,.5,.06);prop(G,PG.s,"#c9a05a",x,2.18,.5,.055)}else prop(G,PG.k,"#5a7a3a",x,2.2,.5,.07,.3,.07).rotation.x=Math.PI}
   /* doska, zelenina, nôž */prop(G,PG.b,"#b89a6a",-1.9,.835,.5,.5,.03,.34);prop(G,PG.s,"#c9571a",-2,.89,.45,.05,.05,.12);prop(G,PG.s,"#c9571a",-1.85,.89,.55,.05,.05,.12);prop(G,PG.s,"#6a8a3a",-1.2,.92,.4,.11);prop(G,PG.b,"#b8bcc4",-1.6,.855,.62,.2,.008,.035);prop(G,PG.s,"#e8dcc0",-.9,.88,.7,.06);prop(G,PG.s,"#e8dcc0",-.78,.88,.62,.06);
   /* drevo pri ohni, vedro, vrecia */for(let r=0;r<3;r++)for(let i=0;i<3-r;i++){const lg=prop(G,PG.c,r%2?"#7a5230":"#8a6238",-2.4-(i+r*.5)*.2+.2,.09+r*.16,-dd/2+.8,.085,.7,.085);lg.rotation.x=Math.PI/2}R.solids.push([-2.4,-dd/2+.8,.5]);
   prop(G,PG.c,"#7a5a34",w/2-1,.2,-dd/2+1,.2,.4,.2);prop(G,PG.c,"#6fa6cf",w/2-1,.39,-dd/2+1,.18,.01,.18);[[w/2-1.1,dd/2-1],[w/2-1.7,dd/2-.8]].forEach((q,i)=>{prop(G,PG.s,"#c9b890",q[0],.26,q[1],.3,.27,.26);prop(G,PG.c,"#a8966a",q[0],.55,q[1],.07,.1,.07)});R.solids.push([w/2-1.3,dd/2-.9,.6]);
   if(hv>=2){/* medený riad na stene */for(let i=0;i<3;i++){const pn=prop(G,PG.c,"#b8703a",w/2-.08,2-i*.02,-1.2+i*.6,.2-i*.03,.03,.2-i*.03);pn.rotation.z=Math.PI/2}}}
 function chandelier(G,h,r,n){const g=new T.Group();g.position.set(0,h-.9,0);G.add(g);const ring=new T.Mesh(new T.TorusGeometry(r,.035,6,18),M("#3a3a42"));ring.rotation.x=Math.PI/2;g.add(ring);prop(g,PG.c,"#3a3a42",0,.45,0,.012,.9,.012);for(let i=0;i<n;i++){const a=i/n*6.283;candle(g,Math.sin(a)*r,.02,Math.cos(a)*r);prop(g,PG.c,"#3a3a42",Math.sin(a)*r*.5,.25,Math.cos(a)*r*.5,.008,.6,.008).rotation.set(Math.cos(a)*.75,0,-Math.sin(a)*.75)}}
 function toolWall(G,x,z,sgn,kind){const g=new T.Group();g.position.set(x,1.75,z);g.rotation.y=sgn>0?-Math.PI/2:Math.PI/2;G.add(g);prop(g,PG.b,"#6b4a2a",0,0,.03,1.9,.9,.04);const peg=(px)=>prop(g,PG.c,"#3a2a1a",px,.32,.08,.015,.08,.015).rotation.x=Math.PI/2;
   const T1={ham:px=>{prop(g,PG.c,"#7a5a34",px,.05,.07,.02,.5,.02);prop(g,PG.b,"#4a4a52",px,.3,.07,.2,.1,.08)},tong:px=>{[-1,1].forEach(q=>{const t=prop(g,PG.b,"#3a3a42",px+q*.03,0,.07,.02,.62,.02);t.rotation.z=q*.07})},saw:px=>{prop(g,PG.b,"#b8bcc4",px,-.02,.065,.12,.55,.01);prop(g,PG.b,"#7a5a34",px,.3,.07,.16,.1,.04)},axe:px=>{prop(g,PG.c,"#7a5a34",px,0,.07,.02,.62,.02);prop(g,PG.b,"#8a8e98",px+.07,.24,.07,.16,.14,.02)},shear:px=>{[-1,1].forEach(q=>{const t=prop(g,PG.b,"#b8bcc4",px,.05,.07,.025,.5,.01);t.rotation.z=q*.18});prop(g,new T.TorusGeometry(.04,.012,5,10),"#3a3a42",px-.07,-.22,.07,1);prop(g,new T.TorusGeometry(.04,.012,5,10),"#3a3a42",px+.07,-.22,.07,1)},ladle:px=>{prop(g,PG.c,"#8a6a3a",px,.02,.07,.015,.5,.015);prop(g,PG.s,"#8a6a3a",px,-.26,.07,.07,.05,.04)},key:px=>{prop(g,new T.TorusGeometry(.06,.015,5,10),"#c9a23a",px,.2,.07,1);prop(g,PG.b,"#c9a23a",px,-.02,.07,.02,.34,.02);prop(g,PG.b,"#c9a23a",px+.04,-.15,.07,.07,.03,.02)},rope:px=>{prop(g,new T.TorusGeometry(.13,.035,6,14),"#b89a6a",px,.05,.08,1)}};
   const set={kovac:["ham","tong","ham","axe","tong"],bana:["axe","ham","rope","axe","ham"],tesar:["saw","ham","axe","saw","rope"],tkac:["shear","rope","shear","key","rope"],garbiar:["shear","axe","rope","shear","tong"],pekar:["ladle","ladle","rope","key","ladle"],krcma:["ladle","key","rope","ladle","key"],vinar:["shear","rope","key","ladle","rope"],pivovar:["ladle","rope","ladle","key","rope"],mlyn:["rope","ham","rope","key","axe"]}[kind]||["key","rope","ham","shear","key"];
   set.forEach((k,i)=>{const px=-.72+i*.36;peg(px);T1[k](px)})}
 function banner(G,x,y,z,c,ry){const m=new T.Mesh(new T.PlaneGeometry(1.2,2),M(c,{side:T.DoubleSide}));m.position.set(x,y,z);m.rotation.y=ry||0;G.add(m);const m2=new T.Mesh(new T.CircleGeometry(.32,12),M("#f4ead0",{side:T.DoubleSide}));m2.position.set(x+Math.sin(ry||0)*.02,y+.3,z+Math.cos(ry||0)*.02);m2.rotation.y=ry||0;G.add(m2)}
 function stand(R,d2,role,fem,x,z,ry,name,act,sc2){const f=person(d2,role,false,fem);f.position.set(x,0,z);f.rotation.y=ry||0;if(sc2)f.scale.set(sc2,sc2,sc2);R.G.add(f);if(name){const s=d2&&d2.id>=0&&d2.money!=null?label(name,(()=>{try{return DC(d2.id)}catch(e){return null}})(),.7,{k:"person",r:wTier(d2)}):label(name,null,.7,{k:"npc"});s.position.set(0,2.8,0);f.add(s)}R.solids.push([x,z,.5]);if(act)rAdd(R,x,z,2.2,name+(act.t||""),act.f);return f}
 const SKN3={remeslo:"Remeslo",obchod:"Obchod",retorika:"Rétorika",boj:"Boj",charizma:"Charizma"};
 function famHTML(kind,id){const p=P(),m=kind==="spouse"?p.spouse:p.kids.find(k=>k.id==id),foot=`<p class="m3note"><button class="btn sm ghost" data-m3="tab" data-v="rod">Otvoriť kartu Rod</button></p>`;if(!m)return`<h3>Rodina</h3><p>Nikto tu nie je.</p>`+foot;
  const g=m.gender||(m.look&&m.look.g)||(kind==="spouse"?(p.head.gender==="f"?"m":"f"):"m"),f=g==="f",rel=kind==="spouse"?(f?"manželka":"manžel"):(f?"dcéra":"syn"),age=m.age;let st=[],say;
  try{if(kind==="kid"){if(m.mil)st.push(`slúži vo vojsku ako ${(MRANK[m.mil.rank]||"vojak").toLowerCase()}`);if(m.role&&ROLES[m.role.r])st.push(`${ROLES[m.role.r].n}${m.role.c!=null?" · "+CITY(m.role.c).n:""}`);if(m.path){const E=EDU[typeof m.path==="string"?m.path:m.path.k||m.path.id||m.path.v];st.push(E?`výchova: ${E.n.toLowerCase()}`:"je na výchove")}if(m.spouse)st.push(`v manželstve${m.spouse.name?" ("+esc(m.spouse.name)+")":""}`)}}catch(e){}
  if(kind==="spouse")say=f?"Dom je v poriadku. Ty sa staraj o dielne, ja o všetko ostatné.":"Vitaj doma. Povedz, čo je nové v meste.";else if(age<7)say=f?"Pozri, mám bábiku!":"Ja budem rytier!";else if(age<16)say=m.path?"Učím sa každý deň, ako si kázal.":"Kedy ma pošleš do učenia?";else say=m.mil?"Meč mám nabrúsený. Rod sa za mňa hanbiť nebude.":m.role?"Robím, čo si mi zveril.":"Daj mi úlohu, nech som rodu na osoh.";
  const sk=m.skills&&!(kind==="kid"&&age<7)?`<table class="tbl"><tbody>${Object.keys(m.skills).filter(k=>SKN3[k]).map(k=>`<tr><td>${SKN3[k]}</td><td class="num"><b>${m.skills[k]}</b> / 10</td></tr>`).join("")}</tbody></table>`:"";
  const tr=(m.tr||[]).map(t=>TRAITS[t]).filter(Boolean).map(t=>`<li><b>${f&&t.f?t.f:t.n}</b>: ${t.d}</li>`).join("");
  const edu=kind==="kid"&&age>=7&&age<16&&!m.path?`<p><button class="btn sm" data-a="edupick" data-k="${m.id}">Vybrať výchovu</button></p>`:"";
  return`<h3>${esc(m.name||"")}</h3><p>${rel}${age!=null?`, ${age} r.`:""}${m.health!=null?` · zdravie ${Math.round(m.health)}`:""}${st.length?" · "+st.join(" · "):""}</p><p><i>„${say}“</i></p><div class="m3scroll">${sk}${tr?`<ul>${tr}</ul>`:""}</div>${edu}${foot}`}
 const RADP={kniha:["Kniha úradov","Mestský pisár","Tu je zapísané, kto ktorý úrad drží a dokedy.",[/^Mestská rada/]],rada:["Radný stôl","Radní","Dane, pokladnica, nariadenia a zákony mesta.",[/^Rada a nariadenia/,/^Zákony a hlasy/,/^Rada mesta/]],urad:["Tvoj úrad","","",[/^Tvoj úrad/,/^Právomoci úradu/]],volby:["Voľby","Hlásnik","Kto chce úrad, hlási sa tu pri urne.",[/^Voľby/]],cechy:["Cechy a frakcie","Cechmajster","Cechy si pamätajú, kto im pomohol.",[/^Cechy a frakcie/]],stavby:["Mestské stavby","Mestský staviteľ","Pozri, čo mesto stavia a čo by ešte potrebovalo.",[/^Mestské stavby/]]};
const CIRP={farar:["Fara","Farár","Kto z tvojho rodu slúži Cirkvi, toho tu poznáme po mene.",[/^Duchovní z tvojho rodu/,/^Zasvätiť Cirkvi/,/^Hodnosti a výhody/],()=>vCirkev(),"cirkev","Cirkev"],stolica:["Svätá stolica","Kanonik","Rím je ďaleko, no jeho ruka siaha až sem.",[/^Svätá stolica a katedrála/,/^Svätá stolica$/],()=>vCirkev(),"cirkev","Cirkev"],pute:["Púte","Pútnik","Kto putuje, vráti sa iný. Ak sa vráti.",[/^Púte/],()=>vCirkev(),"cirkev","Cirkev"],spory:["Spovednica","Spovedník","Hnev je ťažké bremeno. Zmier sa dá uzavrieť pri omši.",[/^Priateľstvá a spory/],()=>typeof bondSheet==="function"?bondSheet():"","rody","Rody","S nikým nemáš priateľstvo ani spor, o ktorom by sa tu hovorilo. Choď v pokoji."]};
const HRDP={kastelan:["Priazeň kráľa","Kastelán","Kráľ si pamätá dary aj tých, čo na neho zabudli.",[/^Priazeň kráľa/,/^Platné kráľovské nariadenia/],()=>vDvor(),"dvor","Dvor"],herold:["Kráľovský dvor","Herold","Poznám erb každého rodu ríše. Pýtaj sa.",[/^Kráľovský dvor/,/^Najvýznamnejšie rody/],()=>vDvor(),"dvor","Dvor"],diela:["Veľké diela rodu","Kráľovský staviteľ","Kameň prežije zlato. Čo postavíš, to po tebe ostane.",[/^Veľké diela/],()=>vDvor(),"dvor","Dvor"],vojsko:["Vojenská služba","Kapitán posádky","Synov, čo nezdedia rod, urobím vojakmi.",[/^(?!Vojenský tábor$)./],()=>vKariera(),"kariera","Kariéra"]};
function radHTML(part){const D=RADP[part]||CIRP[part]||HRDP[part],foot=`<p class="m3note"><button class="btn sm ghost" data-m3="tab" data-v="${D[5]||"radnica"}">Otvoriť celú kartu ${D[6]||"Radnica"}</button></p>`;let out=[];
 try{const dv=document.createElement("div");dv.innerHTML=D[4]?D[4]():vRadnica();const sh=[...dv.querySelectorAll(".sheet")].filter(e=>!(e.parentElement&&e.parentElement.closest(".sheet")));
  const seen=new Set();D[3].forEach(rx=>sh.filter(e=>{const h=e.querySelector("h2,h3");return h&&!seen.has(e)&&!e.classList.contains("kssheet")&&rx.test(h.textContent.replace(/[▸▾]/g,"").trim())}).forEach(x=>{seen.add(x);x.querySelectorAll(".foldb,canvas,.kscene").forEach(q=>q.remove());x.classList.remove("folded");x.removeAttribute("id");out.push(x.outerHTML)}))}catch(e){console.warn("3D radnica",e)}
 const my=(()=>{try{return officeOf(0)}catch(e){return null}})();
 if(!out.length)out=[`<p>${D[7]?D[7]:part==="urad"?"Nedržíš žiaden úrad. Kandidovať môžeš pri urne, keď sú vyhlásené voľby.":S.ci!==P().city?"V tomto meste nie si doma. Cudzincovi tu nemáme čo ponúknuť.":"Dnes tu niet čo vybaviť."}</p>`];
 return`<h3>${D[0]}${part==="urad"&&my?" · "+offN(my.id):""}</h3>${D[1]?`<p><i>${D[1]}:</i> „${D[2]}“</p>`:""}<p class="m3money">Pokladnica: <b>${zl(Math.round(P().money))}</b> · body činnosti: <b>${S.ap}</b>${part==="rada"&&my?" · tvoje právomoci nájdeš pri svojom kresle":""}</p><div class="m3scroll m3rad">${out.join("")}</div>${foot}`}
function tavernHTML(){const p0=P();if(cid!==p0.city)return`<h3>Hry v krčme</h3><p>Hráči ťa tu nepoznajú a k stolu cudzieho nepustia. Hrať môžeš v krčme vo svojom domovskom meste.</p>`;
  const left=S.gameT===S.turn?3-(S.gameN||0):3,mx=Math.round(200*tierC()),L=S.lastGame&&S.lastGame.t===S.turn?S.lastGame:null;
  return`<h3>Hry v krčme</h3><p>Večer pri kockách a šachu. Výhry potešia aj známych ľudí v meste. Dnes ešte ${left} ${left===1?"hra":left>1&&left<5?"hry":"hier"}. Máš ${fmt(Math.floor(p0.money))} zl.</p>${TAVMSG?`<p><b>${esc(TAVMSG)}</b></p>`:""}<p>Stávka <input id="gm-bet" type="number" min="5" max="${mx}" value="${Math.min(mx,TAVBET||Math.round(30*tierC()))}" style="width:90px"> zl. (najviac ${mx})</p><p>${Object.entries(GAMES).map(([k,G2])=>`<button class="btn sm" data-m3="game" data-k="${k}" title="${esc(G2.d)}" ${left<1?"disabled":""}>${G2.n}</button>`).join(" ")}</p><p style="font-size:.9em;opacity:.8">${Object.values(GAMES).map(G2=>`<b>${G2.n}:</b> ${G2.d}`).join("<br>")}</p>`}
 function gossipHTML(){const L2=[];try{const riv=S.dyn.filter(d=>d.ai&&!d.royal&&d.city===cid);if(riv.length){const top=riv.slice().sort((a,b)=>(b.money||0)-(a.money||0))[0];L2.push(`Vraj najviac zlata v meste má teraz rod <b>${esc(top.name)}</b>.`);const fr=riv.slice().sort((a,b)=>(b.favor||0)-(a.favor||0));L2.push(`O tebe sa najkrajšie vyjadruje rod <b>${esc(fr[0].name)}</b>${fr.length>1&&fr[fr.length-1].favor<0?`, zato rod <b>${esc(fr[fr.length-1].name)}</b> ťa nemá v láske`:""}.`)}}catch(e){}
  try{const gs=Object.keys(GOODS).filter(g2=>S.mkt[g2]).map(g2=>({g:g2,s:S.mkt[g2].s})).sort((a,b)=>a.s-b.s);if(gs.length>1){L2.push(`Kupci sa sťažujú, že na trhu takmer chýba tovar <b>${esc(GOODS[gs[0].g].n.toLowerCase())}</b>; kto ho privezie, dobre zarobí.`);L2.push(`Naopak, najviac je na trhu tovaru <b>${esc(GOODS[gs[gs.length-1].g].n.toLowerCase())}</b> a ide pod cenu.`)}}catch(e){}
  try{const of=OFFICES.map(o2=>{const h=S.off[o2.id].h;return h!=null&&S.dyn[h]?`${offN(o2.id).toLowerCase()} je z rodu ${esc(S.dyn[h].name)}`:null}).filter(Boolean);if(of.length)L2.push(`Pri vedľajšom stole preberajú radnicu: ${of.slice(0,3).join(", ")}.`)}catch(e){}
  try{const w=wx3();L2.push(w==="dazd"?"Furmani hundrú na rozmoknuté cesty.":w==="sneh"?"Všetci sa tlačia bližšie k ohňu, vonku sneží.":S.season===2?"Hovorí sa o úrode a o tom, aká bude zima.":"Krčmárka dolieva a chváli sa novým sudom.")}catch(e){}
  return`<h3>Čo sa hovorí v krčme</h3><p>Prisadol si k hosťom a počúvaš. Nič ťa to nestojí.</p><ul>${L2.map(x=>`<li>${x}</li>`).join("")}</ul>`}
 let TAVMSG="",TAVBET=0;
 let ROOML=[];
 function enter(kind,o){INDOOR=true;const n0=life.length;try{return enter0(kind,o)}finally{INDOOR=false;ROOML=life.splice(n0)}}
 function enter0(kind,o){
  panelOff();keys.clear();const back=room?room.back:[px,pz,dist,pitch,yaw];const dc=DC(0);let R;
  if(kind==="home"){const d2=o.d,hv=(window.SIDLA?SIDLA.lvl(cid):p.house)||0,rm=o.room||"sien";const w=10+hv*1.6,dd=8+hv*1.2;R=mkRoom2(w,dd,3.4+hv*.25,homeStyle(rm,hv));const G=R.G;
   const names={sien:"Sieň",kuchyna:"Kuchyňa",pracovna:"Pracovňa",spalna:"Spálňa",kaplnka:"Kaplnka",kniznica:"Knižnica",zbrojnica:"Zbrojnica"};
   shelf.kind=rm==="kuchyna"?"pots":"books";
   const nightH=(()=>{try{return todPh()===3}catch(e){return false}})(),avR=(()=>{try{return roomsOf(cid===p.city?p:Object.assign({},p,{house:hv,hu:((S.seats||{})[cid]||{}).hu||[]})).filter(r=>r[2]).map(r=>r[0])}catch(e){return["sien"]}})(),hasSp=avR.includes("spalna");
   const kidRoom=k=>{if(k.dead||k.uni||k.cler)return null;if(k.path&&k.age<16)return null;if(k.mil)return avR.includes("zbrojnica")?"zbrojnica":"sien";if(k.role&&k.role.r==="knaz"&&avR.includes("kaplnka"))return"kaplnka";if(k.role&&(k.role.r==="spravca"||k.role.r==="kupec")&&avR.includes("pracovna"))return"pracovna";if(k.role&&(k.role.r==="vyslanec"||k.role.r==="kapitan"))return null;return"sien"},kidsHere=r=>cid===p.city?p.kids.filter(k=>kidRoom(k)===r):[];
   const servant=(x,z,ry,col,hat,nm,anim)=>{const m=NPC3?NPC3(col,hat?{hat}:{}):null;if(!m)return null;scene.remove(m);G.add(m);m.position.set(x,0,z);m.rotation.y=ry;if(nm){const s=label(nm,null,.55,{k:"npc"});s.position.set(0,2.6,0);m.add(s)}R.solids.push([x,z,.45]);const A2=m.userData.arms;if(anim&&A2)life.push((dt,t)=>{if(m.parent)anim(A2,t,m)});return m};
   const famAt=(r,pos)=>{if(nightH)return;kidsHere(r).slice(0,pos.length).forEach((k,i)=>stand(R,{id:0,head:{gender:k.gender},title:p.title,ai:1,pp:k},"kid",k.gender==="f",pos[i][0],pos[i][1],pos[i][2],k.name,{t:": prehovoriť",f:()=>panel(()=>famHTML("kid",k.id))},k.age<16?.62:1))};
   if(rm==="sien"){if(hv>=2)rug(G,0,0,6+hv*.5,3.2,hv>=4?"damaskB":"damask");table(G,R,0,0,4+hv*.5,1.4,{chairs:hv>=1?2:1});fire(G,R,0,-dd/2+.5);banner(G,-w/2+.05,2.2,0,dc,Math.PI/2);banner(G,w/2-.05,2.2,0,dc,-Math.PI/2);chair(G,R,0,-dd/2+2.1,0,{w:.9,hb:1.9,cush:"#7a1f2b"});if(hv>=3){chest(G,R,-w/2+1.2,dd/2-1,1.3);chest(G,R,w/2-1.2,dd/2-1,1.3)}
    try{feast(G,0,0,hv);if(hv===0){straw(G,w,dd,26);cobweb(G,-w/2+.45,3,-dd/2+.05,0);cobweb(G,w/2-.05,3,-dd/2+.45,-Math.PI/2)}
     if(hv>=1)tapestry(G,-w/4-.6,2.05,-dd/2+.02,0,1.2,1.5,hv);if(hv>=2)tapestry(G,w/4+.6,2.05,-dd/2+.02,0,1.2,1.5,hv+1);
     if(hv>=3){painting(G,-w/2+.03,2.15,dd/2-1.6,Math.PI/2,.8,1,"port",1,hv>=4);painting(G,w/2-.03,2.15,dd/2-1.6,-Math.PI/2,.8,1,"port",2,hv>=4)}
     if(hv>=4){painting(G,-w/2+.03,2.2,-dd/2+1.3,Math.PI/2,1.3,1,"land",3,1);chandelier(G,R.h,1.1,8);[-1,1].forEach(q=>{prop(G,PG.c,"#2f4a7a",q*(w/2-.6),.3,dd/2-2.3,.16,.6,.16);prop(G,PG.s,"#5a8a4a",q*(w/2-.6),.85,dd/2-2.3,.3,.34,.3);R.solids.push([q*(w/2-.6),dd/2-2.3,.35])})}
     else if(hv>=2)chandelier(G,R.h,.8,5)}catch(e){console.warn("3D zariadenie",e)}
    {const famK=k=>({t:": prehovoriť",f:()=>panel(()=>famHTML("kid",k.id))});
     if(p.spouse&&!(nightH&&hasSp))stand(R,p,"spouse",p.head.gender!=="f",-2.2,-1.4,.6,p.spouse.name||"Manžel/ka",{t:": prehovoriť",f:()=>panel(()=>famHTML("spouse"))});
     if(!nightH)kidsHere("sien").slice(0,4).forEach((k,i)=>stand(R,{id:0,head:{gender:k.gender},title:p.title,ai:1,pp:k},"kid",k.gender==="f",2+i*.9,1.6,-.6,k.name,famK(k),k.age<7?.5:k.age<12?.64:k.age<16?.8:1));
     /* sluha: úloha na dnes */
     if(hv>=1){const sv=servant(-w/2+1.5,dd/2-1.7,.8,"#6a5a44",null,"Sluha",(A2,t,m)=>{A2[0].rotation.x=-.7+.25*Math.sin(t*2.2);A2[1].rotation.x=-.7-.25*Math.sin(t*2.2);m.rotation.y=.8+.3*Math.sin(t*.4)});if(sv&&sv.userData.arms){const br=new T.Mesh(new T.CylinderGeometry(.02,.02,1.3,6),M("#7a5a34"));br.position.set(.1,-.7,.25);br.rotation.x=.5;sv.userData.arms[1].add(br)}
      rAdd(R,-w/2+1.9,dd/2-2,1.8,"Sluha: dať úlohu na tento štvrťrok",()=>{try{if(S.servTask&&S.servTask.t===S.turn)panel(()=>`<h3>Sluha</h3><p><i>„Úlohu na tento štvrťrok už mám, pane. Vrátim sa s výsledkom.“</i></p>`);else A.kServAsk()}catch(e){console.warn(e)}})}
     /* stráž pri dverách */
     if(hv>=3){const gd=servant(1.9,dd/2-1,Math.PI,dc,"#8a9098",null,(A2)=>{A2[1].rotation.x=-.2;A2[0].rotation.x=0});if(gd&&gd.userData.arms){const a=gd.userData.arms[1],sh=new T.Mesh(new T.CylinderGeometry(.025,.025,2.3,6),M("#6b4a2a"));sh.position.set(0,-.25,.14);a.add(sh);const tp=new T.Mesh(new T.ConeGeometry(.05,.3,6),M("#b8bcc4"));tp.position.set(0,1.02,.14);a.add(tp)}}
     /* návšteva čaká */
     try{const v=typeof kVisitor==="function"?kVisitor():null;if(v&&!nightH&&cid===p.city){const nm={posol:"Posol",kupec:"Potulný kupec",mnich:"Mních",super:"Hosť"}[v.k]||"Návšteva",col={posol:"#2f5bb0",kupec:"#7a5a2a",mnich:"#5a4a3a",super:"#6d2a3f"}[v.k]||"#5a5a5a";const vm=servant(-1.8,dd/2-1.9,2.6,col,v.k==="mnich"?null:"#3a2a1a",nm,(A2,t,m)=>{m.visible=!!kVisitor();A2[0].rotation.x=-.5;A2[1].rotation.x=-.5;m.rotation.y=2.6+.25*Math.sin(t*.5)});rAdd(R,-1.6,dd/2-2.3,1.6,`${nm} čaká v sieni: prijať`,()=>{try{if(kVisitor())A.kVisit();else panel(()=>`<h3>Návšteva</h3><p>Hosť už odišiel.</p>`)}catch(e){console.warn(e)}})}}catch(e){console.warn("3D návšteva",e)}}
    rAdd(R,0,0,2.6,"Kniha rodu: otvoriť kartu Rod",()=>{close();A.tab({v:"rod"})});
    /* dvere do ďalších izieb */
    const rs=roomsOf(cid===p.city?p:Object.assign({},p,{house:hv,hu:((S.seats||{})[cid]||{}).hu||[]})).filter(r=>r[2]&&r[0]!=="sien"&&r[0]!=="nadvorie");
    rs.forEach((r,i)=>{const side=i%2?1:-1,zz=-dd/2+2.2+Math.floor(i/2)*2.6;sideDoor(G,side*(w/2-.02),zz,side);const s=label(r[1],null,.6,{k:"note"});s.position.set(side*(w/2-.6),2.6,zz);G.add(s);rAdd(R,side*(w/2-.8),zz,1.7,`Dvere: ${r[1]}`,()=>enter("home",{d:d2,room:r[0]}))})}
   else{const s=label(names[rm]||rm,null,.9,{k:"note"});s.position.set(0,3,-dd/2+.3);G.add(s);
    if(rm==="kuchyna"){if(!nightH){const ck=servant(1.1,-dd/2+1.5,-2.4,"#e8e0d0","#f3ead0",hv>=3?"Kuchár":"Kuchárka",(A2,t)=>{A2[1].rotation.x=-1.1;A2[1].rotation.z=.25*Math.sin(t*3);A2[0].rotation.x=-.3});if(ck&&ck.userData.arms){const la=new T.Mesh(new T.CylinderGeometry(.02,.02,.6,6),M("#7a5a34"));la.position.set(0,-.75,.2);la.rotation.x=1;ck.userData.arms[1].add(la)}{const pot=new T.Mesh(new T.CylinderGeometry(.28,.22,.3,10),M("#2a2a2e"));pot.position.set(0,.55,-dd/2+1);G.add(pot)}
      rAdd(R,1.2,-dd/2+2,1.7,(hv>=3?"Kuchár":"Kuchárka")+": čo sa dnes varí",()=>panel(()=>{const m=Math.round(P().money),se=S.season;return`<h3>Kuchyňa</h3><p><i>„${m<200?"Kaša a cibuľa, pane. Komora je skoro prázdna.":hv>=4?["Pečený kapún s medom a šafránom.","Ryby na masle a čerstvý chlieb.","Zverina s hruškami a korením.","Bravčová pečienka a kapusta s klobásou."][se]:hv>=2?["Jahňacina s bylinkami.","Hrachová polievka a pečené kura.","Hus s kapustou.","Fazuľa s údeným a čerstvý chlieb."][se]:["Hrachová kaša a vajcia.","Kapustnica a chlieb.","Jačmenná kaša so slaninou.","Fazuľová polievka."][se]}“</i></p><p class="m3note">Len na oživenie, nič to nemení.</p>`}));
      if(hv>=3)servant(-2.6,.5,1.57,"#7a6a54",null,null,(A2,t)=>{A2[0].rotation.x=-.9+.2*Math.sin(t*5);A2[1].rotation.x=-.9-.2*Math.sin(t*5)})}fire(G,R,0,-dd/2+.5);table(G,R,-1.5,.5,2.6,1.2,{bare:1});try{kitchenStuff(G,R,w,dd,hv);if(hv<=1)cobweb(G,-w/2+.45,3,-dd/2+.05,0)}catch(e){console.warn("3D zariadenie",e)}[[2.5,-1],[3.2,.1],[2.4,1.2]].forEach(q=>keg(G,R,q[0],q[1]));shelf(G,R,-w/2+.02,1.5,-1,2.4);for(let i=0;i<4;i++){const pt=new T.Mesh(new T.SphereGeometry(.16,8,6),M(i%2?"#b8643a":"#3a3a42"));pt.position.set(-w/2+.5,2.25,-.9+i*.5);G.add(pt)}}
    if(rm==="pracovna"){famAt("pracovna",[[2.2,-.6,-1.2],[-2.4,.4,1.2]]);rug(G,0,-.6,4.2,3,"damaskB");table(G,R,0,-1,2.6,1.2,{bare:1});candle(G,-.9,.82,-1);{const bk=new T.Mesh(new T.BoxGeometry(.5,.06,.36),M("#f6efdc"));bk.position.set(.1,.85,-.95);G.add(bk)}chair(G,R,0,-2,0,{cush:"#2f5bb0"});shelf(G,R,-w/2+.02,-1,-1,2.6);chest(G,R,2.4,1,1.3);try{painting(G,0,2.2,-dd/2+.03,0,1.5,1.1,"map",4,hv>=3);[[-.5,-.8,4],[-.38,-.9,6],[-.56,-.98,3]].forEach(q=>{for(let i=0;i<q[2];i++)prop(G,PG.c,"#e3be4f",q[0],.826+i*.013,q[1],.035,.012,.035)});prop(G,PG.c,"#2a2a2a",.6,.86,-1.25,.05,.08,.05);prop(G,PG.k,"#f4f0e6",.6,1.02,-1.25,.02,.3,.02).rotation.z=.25;[0,1,2].forEach(i=>{const sc=prop(G,PG.c,"#f0e6c8",.75+i*.02,.85+i*.05,-.75,.04,.4,.04);sc.rotation.z=Math.PI/2;sc.rotation.y=.3*i});if(hv>=3)painting(G,w/2-.03,2.15,-1,-Math.PI/2,.8,1,"port",5,hv>=4)}catch(e){console.warn("3D zariadenie",e)}rAdd(R,0,-1,2.2,"Účtovné knihy: otvoriť kartu Majetok",()=>{close();A.tab({v:"majetok"})})}
    if(rm==="spalna"){if(nightH&&p.spouse&&cid===p.city)stand(R,p,"spouse",p.head.gender!=="f",-1.9,-dd/2+2.6,.9,p.spouse.name||"Manžel/ka",{t:": prehovoriť",f:()=>panel(()=>famHTML("spouse"))});bed(G,R,0,-dd/2+1.9);rug(G,0,1,3,2,"damask");KO(G).box(w/2-1.6,-.4,1.4,.8,2.2,WD);chest(G,R,-w/2+1.2,.5,1.2);const s2=label("Šatník",null,.6,{k:"note"});s2.position.set(w/2-.9,2.7,0);G.add(s2);
     try{painting(G,-w/2+.03,2.1,-.6,Math.PI/2,.7,.9,"saint",1,hv>=3);if(hv>=2)tapestry(G,1.9,2.05,-dd/2+.02,0,1.1,1.5,hv+2);if(hv>=1){prop(G,PG.c,"#6b4a2a",-w/2+1.2,.35,2.2,.05,.7,.05);prop(G,PG.c,hv>=3?"#c8ccd2":"#b8703a",-w/2+1.2,.74,2.2,.24,.09,.24);prop(G,PG.c,"#6fa6cf",-w/2+1.2,.785,2.2,.21,.005,.21);prop(G,PG.c,hv>=3?"#c8ccd2":"#8a5a32",-w/2+1.45,.14,2.35,.09,.28,.09)}candle(G,-w/2+1.2,.62,.5);if(hv===0){straw(G,w,dd,14);cobweb(G,w/2-.05,3,-dd/2+.45,-Math.PI/2)}}catch(e){console.warn("3D zariadenie",e)}}
    if(rm==="kaplnka"){famAt("kaplnka",[[.9,-dd/2+2,0]]);altar(G,R,0,-dd/2+1,1.8);rug(G,0,.6,1.2,dd-3.4,"damask");[-1,1].forEach(q=>{bench(G,R,q*1.9,.4,1.9,1);bench(G,R,q*1.9,1.9,1.9,1)})}
    if(rm==="kniznica"){[-1,1].forEach(q=>{for(let i=0;i<3;i++)shelf(G,R,q*(w/2-.02),-2+i*2,q,1.8)});rug(G,0,0,3.6,2.6,"damaskB");table(G,R,0,0,2.2,1.1,{bare:1});candle(G,-.7,.82,0);[[.2,.1],[.6,-.2]].forEach((q,i)=>{const bk=new T.Mesh(new T.BoxGeometry(.44,.07,.32),M(i?"#7a1f2b":"#f6efdc"));bk.position.set(q[0],.86,q[1]);bk.rotation.y=i*.5;G.add(bk)});chair(G,R,0,.95,Math.PI,{cush:"#7a1f2b"})}
    if(rm==="zbrojnica"){famAt("zbrojnica",[[1.2,.8,-.8],[2.2,-.6,-1.2]]);for(let i=0;i<4;i++){const sh2=cyl(G,-w/2+.12,1.6,-2+i*1.4,.4,.06,i%2?dc:"#b8c0c8",12);sh2.rotation.z=Math.PI/2;box(G,w/2-.2,.2,-2+i*1.4,.06,1.9,.06,"#b8c0c8");const tp=new T.Mesh(new T.ConeGeometry(.07,.3,4),M("#d8dce2"));tp.position.set(w/2-.2,2.25,-2+i*1.4);G.add(tp)}KO(G).box(w/2-.5,-2.6,.3,4.6,.5,WD);chest(G,R,0,-dd/2+1,1.5);{const K=KO(G);K.box(-.9,.4,.18,.18,1.5,WD);K.box(-1.25,.42,.9,.14,.14,Object.assign({z:1.2},WD));const hm=new T.Mesh(new T.SphereGeometry(.2,8,6,0,6.3,0,1.7),M("#b8c0c8"));hm.position.set(-.81,1.58,.49);G.add(hm);const br=new T.Mesh(new T.CylinderGeometry(.3,.24,.75,8),M("#9aa0a8"));br.position.set(-.81,1.05,.49);G.add(br);R.solids.push([-.8,.5,.6])}}
    door(G,dd/2-.08,1.1,2.1);rAdd(R,0,dd/2-.8,1.8,"Späť do siene",()=>enter("home",{d:d2,room:"sien"}))}
   if(rm==="sien"){door(G,dd/2-.08,1.3,2.2);rAdd(R,0,dd/2-.8,1.9,"Vyjsť na ulicu",leave)}}
  else if(kind==="shop"){const b=o.b,ty=b.type,lv=b.lvl||1,w=9+lv*.8,dd=7.5+lv*.6,nm=(BT[ty]||{}).n||"Dielňa";const stone=ty==="kovac"||ty==="bana"||ty==="brloh"||ty==="pasovanie"||ty==="pivovar";
   R=mkRoom2(w,dd,3.4,{wall:stone?"wallY":"plasterW",floor:"plank",wain:stone?null:"#6b4a2a",win:{n:2,g:1,z:1.4,h:1.3,w:.8}});const G=R.G,bk=-dd/2,WDc="#7a5a34";
   const mk=(geo,c,x,y,z,par)=>{const q=new T.Mesh(geo,M(c));q.position.set(x,y,z);q.castShadow=true;(par||G).add(q);return q};
   shelf.kind={kovac:"tools",pekar:"bread",tkac:"cloth",hrnciar:"pots",tesar:"tools",krcma:"mugs",vinar:"mugs",pivovar:"mugs",lekaren:"jars",pisaren:"books",tlaciaren:"books",zlatnik:"gold",garbiar:"hides",sklaren:"glass",sklo:"glass",mlyn:"sacks",bana:"tools",kupec:"crates",brloh:"crates",pasovanie:"crates"}[ty]||"crates";const lb=label(nm+(lv>1?" "+["","I","II","III","IV","V"][lv]:""),null,.9,{k:"bld",r:lv-1+(lv>=3?1:0)});lb.position.set(0,3,bk+.3);G.add(lb);
   try{if(ty!=="krcma")toolWall(G,-w/2+.03,dd/2-1.9,-1,ty);if(lv<=1){cobweb(G,-w/2+.45,3,bk+.05,0);cobweb(G,w/2-.05,3,bk+.45,-Math.PI/2)}}catch(e){console.warn("3D zariadenie",e)}
   let TK=null;const TOOLS={hammer:a=>{tP(a,new T.CylinderGeometry(.02,.02,.36,6),"#7a5a34",0,-.76,.16,1.57);tP(a,new T.BoxGeometry(.1,.1,.17),"#4a4a52",0,-.76,.34)},mallet:a=>{tP(a,new T.CylinderGeometry(.012,.012,.2,5),"#7a5a34",0,-.76,.1,1.57);tP(a,new T.BoxGeometry(.05,.05,.09),"#8a8e98",0,-.76,.2)},pestle:a=>tP(a,new T.CylinderGeometry(.025,.035,.28,6),"#8a8478",0,-.88,.04),quill:a=>{const q=tP(a,new T.ConeGeometry(.022,.34,5),"#f4f0e6",0,-.86,.07);q.rotation.x=2.9},shuttle:a=>tP(a,new T.BoxGeometry(.24,.05,.08),"#c9a86a",0,-.78,.06),saw:a=>{tP(a,new T.BoxGeometry(.04,.13,.1),"#7a5a34",0,-.78,.04);tP(a,new T.BoxGeometry(.015,.1,.62),"#b8bcc4",0,-.8,.4)},scraper:a=>{tP(a,new T.BoxGeometry(.24,.03,.06),"#b8bcc4",0,-.78,.06);tP(a,new T.BoxGeometry(.3,.04,.03),"#7a5a34",0,-.76,.02)},pick:a=>{tP(a,new T.CylinderGeometry(.025,.025,.8,6),"#7a5a34",0,-1.05,.05);const h=tP(a,new T.BoxGeometry(.06,.06,.5),"#5a5e68",0,-1.43,.05);[-1,1].forEach(q=>{const c=tP(a,new T.ConeGeometry(.035,.16,5),"#5a5e68",0,-1.43,.05+q*.32);c.rotation.x=q*1.57})},peel:a=>{const gp=new T.Group();gp.position.set(0,-.76,.02);gp.rotation.x=.8;a.add(gp);tP(gp,new T.CylinderGeometry(.02,.02,1.3,6),"#9a7a4a",0,0,.6,1.57);tP(gp,new T.BoxGeometry(.32,.025,.34),"#9a7a4a",0,0,1.38)},jug:a=>{tP(a,new T.CylinderGeometry(.07,.085,.2,8),"#8a5a34",0,-.8,.09);tP(a,new T.TorusGeometry(.05,.012,5,8,3.14),"#8a5a34",0,-.8,.02).rotation.set(0,1.57,1.57)},sack:a=>{const q=tP(a,new T.SphereGeometry(.2,8,6),"#e6d8a8",0,-.78,.2);q.scale.set(1,.8,1.2)},plank:a=>tP(a,new T.BoxGeometry(1.2,.05,.2),"#c9a86a",-.2,-.72,.12)};
   function tP(a,geo,c,x,y,z,rx){const q=new T.Mesh(geo,M(c));q.position.set(x,y,z);if(rx)q.rotation.x=rx;q.castShadow=true;a.add(q);return q}
   const worker=(x,z,ry,col,anim)=>{const tk=TK;TK=null;if(!NPC3)return null;const m=NPC3(col,{});scene.remove(m);G.add(m);m.position.set(x,0,z);m.rotation.y=ry;const A2=m.userData.arms;try{if(tk&&TOOLS[tk]&&A2)TOOLS[tk](A2[1])}catch(e){}life.push((dt,t)=>{if(m.parent)anim(A2,t,m)});return m};
   const nW=Math.max(1,Math.min(3,b.w|0));
   if(ty==="kovac"){fire(G,R,-w/4,bk+.5);cyl(G,.6,0,-.4,.24,.55,"#5a3c22",8);box(G,.6,.55,-.4,.6,.16,.24,"#34343a");box(G,.6,.71,-.4,.8,.1,.28,"#3e3e46");const bar=mk(new T.BoxGeometry(.5,.05,.05),"#ff8a2a",.6,.84,-.4);bar.material=new T.MeshBasicMaterial({color:"#ff8a2a"});keg(G,R,w/2-1,bk+1.2);shelf(G,R,w/2-.02,.5,1,2.4);for(let i=0;i<5;i++)box(G,w/2-.25,1.6,-.3+i*.4,.05,.5,.05,"#4a4a52");
    (TK="hammer",worker)(.6,.5,Math.PI,"#3a3a3a",(A2,t)=>{A2[1].rotation.x=-.75-Math.max(0,Math.sin(t*7))*1.15;A2[0].rotation.x=-.55});if(nW>1)worker(-w/4,bk+1.9,Math.PI,"#5a4a3a",(A2,t)=>{A2[0].rotation.x=A2[1].rotation.x=-.9+Math.sin(t*2)*.3})}
   else if(ty==="pekar"){fire(G,R,0,bk+.5);table(G,R,-2,.3,2.4,1.1,{bare:1});for(let i=0;i<5;i++){const lf=mk(new T.SphereGeometry(.14,8,6),"#c98a3a",-2.8+i*.4,.9,.3);lf.scale.set(1,.6,1.5)}shelf(G,R,w/2-.02,0,1,2.6);for(let i=0;i<6;i++){const lf=mk(new T.SphereGeometry(.13,8,6),"#b87a30",w/2-.3,1.65+(i%2)*.55,-1+Math.floor(i/2)*.9);lf.scale.set(1,.6,1.4)}[[-w/2+1,1.6],[-w/2+1.5,2.3],[-w/2+.9,2.6]].forEach(q=>{const sk=mk(new T.SphereGeometry(.34,8,6),"#e6d8a8",q[0],.3,q[1]);sk.scale.set(1,.9,.8)});
    worker(-2,1.2,Math.PI,"#e8e0d0",(A2,t)=>{A2[0].rotation.x=-.9+Math.sin(t*3)*.25;A2[1].rotation.x=-.9-Math.sin(t*3)*.25});if(nW>1)(TK="peel",worker)(.2,bk+1.9,Math.PI,"#d8cfc0",(A2,t)=>{A2[0].rotation.x=A2[1].rotation.x=-1.2+Math.sin(t*1.2)*.2})}
   else if(ty==="tkac"){[-1.8,1.8].slice(0,Math.min(2,nW)).forEach((x,k)=>{[-.7,.7].forEach(o2=>{box(G,x+o2,0,-.9,.1,1.9,.1,WDc);box(G,x+o2,0,.3,.1,1.1,.1,WDc)});box(G,x,1.85,-.9,1.6,.1,.1,WDc);box(G,x,1.05,.3,1.6,.1,.1,WDc);const cl=new T.Mesh(new T.PlaneGeometry(1.3,1.5),M(["#2f5bb0","#a3121e"][k],{side:T.DoubleSide}));cl.position.set(x,1.4,-.3);cl.rotation.x=-.66;G.add(cl);(TK="shuttle",worker)(x,1.1,Math.PI,"#2f5bb0",(A2,t)=>{A2[0].rotation.x=-1+Math.sin(t*4+k)*.3;A2[1].rotation.x=-1-Math.sin(t*4+k)*.3})});
    shelf(G,R,w/2-.02,0,1,3);["#2f5bb0","#a3121e","#2f6a3a","#c9971a","#5a1a5e","#f4ecdc"].forEach((c,i)=>{const rl=mk(new T.CylinderGeometry(.14,.14,.5,10),c,w/2-.3,1.68+(i%2)*.55,-1.1+Math.floor(i/2)*1.1);rl.rotation.x=Math.PI/2});chest(G,R,-w/2+1.2,bk+1.2,1.3)}
   else if(ty==="hrnciar"){fire(G,R,w/4,bk+.5);cyl(G,-1,0,.2,.12,.5,"#5a3c22",6);cyl(G,-1,.5,.2,.4,.07,"#6a5a48",12);const pot=new T.Mesh(new T.LatheGeometry([[0,0],[.14,0],[.22,.16],[.18,.34],[.12,.4],[.15,.46]].map(q=>new T.Vector2(q[0],q[1])),10),M("#b8643a",{side:T.DoubleSide}));pot.position.set(-1,.57,.2);G.add(pot);life.push((dt,t)=>{pot.rotation.y=t*5});
    shelf(G,R,-w/2+.02,0,-1,3);for(let i=0;i<8;i++)mk(new T.SphereGeometry(.16,8,6),i%3?"#b8643a":"#8a4a2a",-w/2+.3,1.68+(i%2)*.55,-1.2+Math.floor(i/2)*.75).scale.set(1,1.2,1);worker(-1,1.1,Math.PI,"#b8643a",(A2,t,m)=>{A2[0].rotation.x=A2[1].rotation.x=-1+Math.sin(t*2)*.08;m.rotation.x=.12})}
   else if(ty==="tesar"){table(G,R,0,-.2,3.2,1.1,{bare:1});box(G,0,.84,-.2,2.6,.06,.3,"#c9a86a");for(let i=0;i<5;i++)box(G,-w/2+.5+i*.07,0,bk+1+i*.02,.06,2.3-i*.2,.3,"#b89a62");for(let i=0;i<4;i++)box(G,w/2-1.6,i*.09,1.2,2.4,.08,.34,"#b89a62");shelf(G,R,w/2-.02,-1,1,2.2);
    (TK="saw",worker)(0,.8,Math.PI,"#7a5a2a",(A2,t,m)=>{A2[1].rotation.x=-.95+Math.sin(t*5)*.32;A2[0].rotation.x=-.8;m.rotation.x=.12});if(nW>1)(TK="plank",worker)(-w/2+1.7,1.6,Math.PI/2,"#6a5a3a",(A2,t)=>{A2[0].rotation.x=A2[1].rotation.x=-.6+Math.sin(t*1.5)*.3})}
   else if(ty==="krcma"||ty==="vinar"||ty==="pivovar"){for(let i=0;i<4;i++)keg(G,R,-w/2+1+i*1.1,bk+1);box(G,w/4,0,bk+2,3,1,.6,WDc);for(let i=0;i<3;i++)cyl(G,w/4-1+i,1,bk+2,.08,.18,"#8a6a44",8);
    (TK="jug",worker)(w/4,bk+1.2,0,"#7a1f18",(A2,t)=>{A2[1].rotation.x=-.5-Math.max(0,Math.sin(t*1.1))*.9;A2[0].rotation.x=-.4});
    if(ty==="krcma"){/* hostia a stôl s kockami (v140) */
     const guest=(x,z,ry,col,hat,k)=>{const m=worker(x,z,ry,col,(A2,t,mm)=>{const s2=Math.max(0,Math.sin(t*.6+k*1.7));A2[1].rotation.x=-.7-s2*s2*1.3;A2[0].rotation.x=-.75;mm.rotation.x=.08+Math.sin(t*.8+k)*.03});if(m){m.position.y=-.42;(m.userData.legsP||[]).forEach(q=>q.rotation.x=-1.5);mk(new T.CylinderGeometry(.06,.05,.14,8),"#8a6a44",0,-.7,.1,m.userData.arms[1])}return m};
     const tx=-w/4,tz=.9;table(G,R,tx,tz,2.4,1.1,{bare:1});bench(G,R,tx,tz-.95,2.2,1);bench(G,R,tx,tz+.95,2.2,1);candle(G,tx,.82,tz);
     guest(tx-.6,tz-.95,0,"#6a7a5a",null,0);guest(tx+.6,tz-.95,0,"#8a5a3a",null,1);if(!night||true)guest(tx,tz+.95,Math.PI,"#5a4a6a",null,2);
     const dx=w/4-.9,dz=.1;table(G,R,dx,dz,1.6,1.1,{bare:1});bench(G,R,dx,dz-.95,1.5,1);[[-.15,0],[.12,.14]].forEach((q,i)=>{const d=mk(new T.BoxGeometry(.09,.09,.09),"#f4f0e6",dx+q[0],.87,dz+q[1]);d.rotation.y=i*.6});[-.5,.5].forEach(o2=>cyl(G,dx+o2,.82,dz-.2,.05,.03,"#e3be4f",8));
     const gm=guest(dx,dz-.95,0,"#7a3a2a","#3a2a1a",3);const lbl=label("Kocky, šach a vrhcáby",null,.5,{k:"note"});lbl.position.set(dx,1.7,dz);G.add(lbl);
     rAdd(R,dx,dz+.9,1.9,"Prisadnúť k hre: kocky, šach, vrhcáby",()=>panel(tavernHTML));
     rAdd(R,tx,tz+2,1.7,"Prisadnúť k hosťom: počúvať, čo sa hovorí",()=>panel(gossipHTML))}
    else table(G,R,-1.5,1.4,2.2,1.1,{chairs:2})}
   else if(ty==="lekaren"){[-1,1].forEach(q=>shelf(G,R,q*(w/2-.02),-.5,q,3));["#2f7d46","#8c4fc0","#c0262a","#2f5bb0","#c9971a","#e8e0d0","#2f7d46","#8c4fc0"].forEach((c,i)=>{cyl(G,(i%2?1:-1)*(w/2-.3),1.62+(Math.floor(i/2)%2)*.55,-1.4+Math.floor(i/4)*1.6+(i%4>1?.5:0),.07,.22,c,8)});table(G,R,0,-.4,2.2,1,{bare:1});cyl(G,0,.82,-.4,.14,.16,"#b9b0a0",10);candle(G,.8,.82,-.4);
    (TK="pestle",worker)(0,.5,Math.PI,"#2f6b3a",(A2,t)=>{A2[1].rotation.x=-.92+Math.sin(t*6)*.07;A2[1].rotation.z=Math.cos(t*6)*.1;A2[0].rotation.x=-.8})}
   else if(ty==="pisaren"||ty==="tlaciaren"){[-1.6,1.6].slice(0,Math.min(2,nW)).forEach((x,k)=>{table(G,R,x,-.4,1.8,.9,{bare:1});box(G,x,.84,-.4,.5,.012,.34,"#f1e6c8");candle(G,x+.6,.82,-.5);(TK="quill",worker)(x,.45,Math.PI,"#2a2a2a",(A2,t,m)=>{A2[1].rotation.x=-.9;A2[1].rotation.z=Math.sin(t*4+k)*.14;A2[0].rotation.x=-.75;m.rotation.x=.14})});shelf(G,R,-w/2+.02,0,-1,3);shelf(G,R,w/2-.02,0,1,3);for(let i=0;i<10;i++)box(G,(i%2?1:-1)*(w/2-.3),1.62+(Math.floor(i/2)%2)*.55,-1.2+Math.floor(i/4)*.9+(i%4>1?.3:0),.3,.4,.1,["#7a1f2b","#2f5bb0","#2f6a3a","#5a3a20"][i%4])}
   else if(ty==="zlatnik"){fire(G,R,-w/4,bk+.5);table(G,R,.6,-.2,2.2,1,{bare:1});box(G,.2,.84,-.2,.14,.06,.14,"#e3be4f");box(G,.9,.84,-.1,.2,.05,.1,"#e3be4f");{const ri=new T.Mesh(new T.TorusGeometry(.07,.02,5,12),M("#e3be4f"));ri.rotation.x=Math.PI/2;ri.position.set(.6,.86,-.3);G.add(ri)}candle(G,1.4,.82,-.3);shelf(G,R,w/2-.02,0,1,2.6);chest(G,R,-w/2+1.2,1.2,1.3);
    (TK="mallet",worker)(.6,.7,Math.PI,"#c9a23a",(A2,t,m)=>{A2[1].rotation.x=-.95-Math.max(0,Math.sin(t*11))*.25;A2[0].rotation.x=-.85;m.rotation.x=.14})}
   else if(ty==="garbiar"){[-2,0].forEach((x,k)=>{[-.6,.6].forEach(o2=>box(G,x+o2,0,-.8,.08,1.9,.08,WDc));box(G,x,1.85,-.8,1.3,.08,.08,WDc);box(G,x,.3,-.8,1.3,.08,.08,WDc);const hd=new T.Mesh(new T.PlaneGeometry(1,1.3),M(k?"#b8875a":"#8a5a32",{side:T.DoubleSide}));hd.position.set(x,1.1,-.8);G.add(hd)});[[2.4,-1],[3.1,.2]].forEach(q=>{cyl(G,q[0],0,q[1],.55,.7,"#6a4a2c",12);cyl(G,q[0],.66,q[1],.5,.05,"#4a3a2a",12)});shelf(G,R,w/2-.02,1.6,1,2.2);
    (TK="scraper",worker)(0,.1,Math.PI,"#6b4a2a",(A2,t)=>{A2[1].rotation.x=-1.25+Math.sin(t*2.6)*.4;A2[0].rotation.x=-1.1});if(nW>1)worker(2.4,.1,Math.PI,"#5a4a3a",(A2,t)=>{A2[0].rotation.x=A2[1].rotation.x=-.7+Math.sin(t*1.4)*.3})}
   else if(ty==="sklaren"||ty==="sklo"){fire(G,R,0,bk+.5);table(G,R,-2.2,.6,2,1,{bare:1});["#7ac0c8","#9ad0a0","#c8e0e8","#7a9ad0"].forEach((c,i)=>cyl(G,-2.9+i*.45,.82,.6,.07,.26,c,8));shelf(G,R,w/2-.02,.4,1,2.8);keg(G,R,-w/2+1,bk+1.2);
    const wm=worker(.4,bk+2.4,Math.PI,"#3a7a8a",(A2,t)=>{A2[1].rotation.x=-1.35;A2[0].rotation.x=-1.2;A2[1].rotation.z=Math.sin(t*3)*.05});if(wm){const pi=mk(new T.CylinderGeometry(.015,.015,1.1,5),"#6a6e78",0,-.7,.5,wm.userData.arms[1]);pi.rotation.x=Math.PI/2;const bl=new T.Mesh(new T.SphereGeometry(.1,10,8),new T.MeshBasicMaterial({color:"#ff9a3a",transparent:true,opacity:.85}));bl.position.set(0,-.7,1.08);wm.userData.arms[1].add(bl);life.push((dt,t)=>{bl.scale.setScalar(.6+(Math.sin(t*.9)+1)*.55)})}}
   else if(ty==="mlyn"){cyl(G,0,0,-.6,1.1,.5,"#9a9488",16);const st=cyl(G,0,.5,-.6,1,.34,"#b9b0a0",16);cyl(G,0,.84,-.6,.12,.9,WDc,8);box(G,0,1.7,-.6,.5,.5,.5,WDc);life.push((dt,t)=>{st.rotation.y=t*1.2});box(G,.5,.6,-.6,.9,.06,.06,"#6a4a2c");[[-w/2+1,1],[-w/2+1.6,1.7],[-w/2+1,2.4],[-w/2+1.9,.6],[-w/2+1.3,1.4]].forEach((q,i)=>{const sk=mk(new T.SphereGeometry(.36,8,6),"#e6d8a8",q[0],i===4?.85:.3,q[1]);sk.scale.set(1,.9,.8)});shelf(G,R,w/2-.02,0,1,2.6);
    (TK="sack",worker)(1.6,.4,-Math.PI/2,"#d8cfc0",(A2,t)=>{A2[0].rotation.x=A2[1].rotation.x=-.9+Math.sin(t*1.6)*.25})}
   else if(ty==="bana"){for(let i=0;i<7;i++){const rk=mk(new T.DodecahedronGeometry(.3+((i*7)%4)*.09,0),i%3?"#7a7468":"#5a564e",-w/2+1+((i*5)%4)*.5,.25,bk+1+((i*3)%4)*.5)}[-1,1].forEach(q=>{box(G,q*1.3,0,bk+.3,.22,2.6,.22,WDc)});box(G,0,2.5,bk+.3,3,.22,.22,WDc);box(G,0,0,bk+.12,2.4,2.5,.06,"#1a1612");{box(G,2.2,.2,.6,1.3,.5,.8,WDc);[-.45,.45].forEach(o2=>{const wh=cyl(G,2.2+o2,.2,1.02,.2,.06,"#3a3a42",10);wh.rotation.x=Math.PI/2});for(let i=0;i<4;i++)mk(new T.DodecahedronGeometry(.2,0),"#8a8478",1.9+i*.2,.8,.6)}shelf(G,R,w/2-.02,-1.6,1,2);candle(G,-1.6,1.4,bk+.5);
    (TK="pick",worker)(-w/2+2.6,bk+1.8,-Math.PI/2,"#5a5a5a",(A2,t,m)=>{const s2=Math.sin(t*3.2);A2[1].rotation.x=-.5-Math.max(0,s2)*1.9;A2[0].rotation.x=-.4-Math.max(0,s2)*1.2})}
   else if(ty==="kupec"){box(G,0,0,-.6,3.4,1,.7,WDc);[-1,-.4,.2].forEach((x,k)=>cyl(G,x,1,-.6,.08,.05+k*.04,"#e3be4f",8));box(G,1,1,-.6,.4,.05,.3,"#5a2a1a");{box(G,-1.4,1,-.6,.04,.4,.04,"#6a6e78");box(G,-1.4,1.4,-.6,.6,.03,.03,"#6a6e78");[-.28,.28].forEach(o2=>cyl(G,-1.4+o2,1.2,-.6,.1,.02,"#c9a24a",8))}for(let i=0;i<5;i++)box(G,-w/2+1+(i%2)*.9,Math.floor(i/2)*.62,bk+1.2,.8,.6,.8,i%2?"#8a6a44":"#7a5a34");keg(G,R,w/2-1.2,bk+1.2);shelf(G,R,w/2-.02,.8,1,2.6);rug(G,0,1.2,3,1.8,"damask");
    worker(0,-1.4,0,"#6d3f92",(A2,t)=>{A2[0].rotation.x=-1.05;A2[1].rotation.x=-.9+Math.max(0,Math.sin(t*2.5))*.25})}
   else{table(G,R,0,-.3,2.6,1.2,{bare:1});shelf(G,R,w/2-.02,0,1,2.6);chest(G,R,-w/2+1.2,bk+1.2,1.3);keg(G,R,w/2-1,bk+1.2);for(let i=0;i<3;i++)box(G,-w/2+1+i*.9,0,1.6,.8,.6,.8,"#8a6a44");
    worker(0,.7,Math.PI,"#7a5a3a",(A2,t)=>{A2[1].rotation.x=-.9+Math.sin(t*4)*.2;A2[0].rotation.x=-.8})}
   shelf.kind=null;
   if(b.owner===0){rAdd(R,w/2-2.2,dd/2-2,2,"Správa dielne: výroba, ľudia a vylepšenia",()=>panel(()=>shopHTML(b.id)));{const ds=label("Správa dielne",null,.55,{k:"note"});ds.position.set(w/2-2.2,1.5,dd/2-2);G.add(ds);box(G,w/2-2.2,0,dd/2-2,.7,1,.5,WDc);box(G,w/2-2.2,1,dd/2-2,.6,.04,.4,"#f1e6c8")}}
   else{const d2=S.dyn[b.owner];if(d2){const col=(()=>{try{return DC(d2.id)}catch(e){return"#7a1f2b"}})();banner(G,-w/2+.05,2.2,1,col,Math.PI/2);if(d2.city===cid&&d2.head){const f=person(d2,"head",false,null);f.position.set(w/2-2.2,0,dd/2-2.2);f.rotation.y=-2.4;G.add(f);const s3=label(d2.head.name+" · rod "+d2.name,col,.5,{k:"person",r:wTier(d2)});s3.position.set(0,2.5,0);f.add(s3);R.solids.push([w/2-2.2,dd/2-2.2,.5]);rAdd(R,w/2-2.2,dd/2-2.2,2.2,`${d2.head.name}, majster z rodu ${d2.name}: osloviť`,()=>panel(()=>talkHTML(d2.id)))}else{const m=NPC3?NPC3("#6a5a4a",{hat:"#3a2a1a"}):null;if(m){scene.remove(m);G.add(m);m.position.set(w/2-2.2,0,dd/2-2.2);m.rotation.y=-2.4;const s2=label(`Správca dielne rodu ${d2.name}`,null,.6,{k:"npc"});s2.position.set(0,2.6,0);m.add(s2)}}}}
   door(G,dd/2-.08,1.3,2.2);rAdd(R,0,dd/2-.8,1.9,"Vyjsť na ulicu",leave)}
  else if(kind==="seat"){const d2=o.d,hv=d2.house||0,w=10+hv*1.4,dd=8+hv;R=mkRoom2(w,dd,3.6,homeStyle("sien",hv));const G=R.G,col=DC(d2.id);
   if(hv>=2)rug(G,0,.4,6,3.2,"damask");table(G,R,0,.4,4,1.4,{chairs:1});chair(G,R,0,-dd/2+2,0,{w:.9,hb:1.9,cush:col});fire(G,R,0,-dd/2+.5);banner(G,-w/2+.05,2.2,0,col,Math.PI/2);banner(G,w/2-.05,2.2,0,col,-Math.PI/2);
   stand(R,d2,"head",null,0,-1.6,0,`${d2.head.name}, hlava rodu ${d2.name}`,{t:": osloviť",f:()=>panel(()=>talkHTML(d2.id))});
   if(d2.spouse)stand(R,d2,"spouse",d2.head.gender!=="f",-1.6,-1.4,.3,d2.spouse.name||"Manžel/ka");
   (d2.kids||[]).filter(k=>!k.dead).slice(0,3).forEach((k,i)=>stand(R,{id:d2.id,head:{gender:k.gender},title:d2.title,ai:1},"kid",k.gender==="f",2+i*.9,1.8,-.5,`${k.name} (${k.age} r.)`,null,k.age<16?.62:1));
   door(G,dd/2-.08,1.3,2.2);rAdd(R,0,dd/2-.8,1.9,"Vyjsť na ulicu",leave)}
  else if(kind==="radnica"){R=mkRoom2(16,11,4.4,{wall:"plasterW",floor:"plank",wain:"#6b4a2a",cornice:1,win:{n:3,g:1,z:1.5,h:2,w:.9}});const G=R.G;rug(G,0,-.5,11,3.6,"damaskB");table(G,R,0,-.5,9,1.8,{bare:1});for(let i=0;i<4;i++){candle(G,-3.4+i*2.2,.82,-.5);const bk=new T.Mesh(new T.BoxGeometry(.5,.05,.36),M("#f6efdc"));bk.position.set(-2.4+i*2.2,.85,-.2);bk.rotation.y=i*.3;G.add(bk)}bench(G,R,-5,3.4,3.4,1);bench(G,R,5,3.4,3.4,1);banner(G,0,3,-5.45,"#c0262a",0);
   OFFICES.forEach((of,i)=>{const h=S.off[of.id].h,d2=h!=null?S.dyn[h]:null,x=-3.6+i*1.8;chair(G,null,x,-2.9,0,{w:.7,hb:1.6,cush:"#7a1f2b"});
    if(d2&&d2.id!==0)stand(R,d2,"head",null,x,-2.1,0,`${offN(of.id)}: ${d2.head.name} (rod ${d2.name})`,{t:": osloviť",f:()=>panel(()=>talkHTML(d2.id))});
    else{const s=label(offN(of.id)+(d2?": ty":": neobsadené"),d2?dc:null,.42,{k:"note"});s.position.set(x,2.2+(i%2)*.42,-2.1);G.add(s)}});
   {const mk=(geo,c,x,y,z,par)=>{const q=new T.Mesh(geo,M(c));q.position.set(x,y,z);q.castShadow=true;(par||G).add(q);return q},Bx=(w,h,d)=>new T.BoxGeometry(w,h,d),Cy=(r,h,r2)=>new T.CylinderGeometry(r2==null?r:r2,r,h,10);
    const clerk=(x,z,ry,col,hat,nm,anim,sit)=>{const m=NPC3?NPC3(col,hat?{hat}:{}):null;if(!m)return null;scene.remove(m);G.add(m);m.position.set(x,sit?-.42:0,z);if(sit)(m.userData.legsP||[]).forEach(q=>q.rotation.x=-1.5);m.rotation.y=ry;if(nm){const s=label(nm,null,.55,{k:"npc"});s.position.set(0,2.6,0);m.add(s)}if(!sit)R.solids.push([x,z,.45]);const A2=m.userData.arms;if(anim&&A2)life.push((dt,t)=>{if(m.parent)anim(A2,t,m)});return m};
    const myOf=(()=>{try{return officeOf(0)}catch(e){return null}})();
    OFFICES.forEach((of,i)=>{if(S.off[of.id].h===0)rAdd(R,-3.6+i*1.8,-2,1.7,`Tvoje kreslo (${offN(of.id)}): zasadnúť a úradovať`,()=>panel(()=>radHTML("urad")))});
    rAdd(R,0,1.3,2.2,"Radný stôl: dane, nariadenia a zákony",()=>panel(()=>radHTML("rada")));
    /* pisár s knihou úradov */
    mk(Bx(1.7,.9,.8),"#6b4a2a",6.3,.45,-3.9);mk(Bx(1.8,.06,.9),"#7a5a34",6.3,.93,-3.9);const bk=mk(Bx(.7,.06,.5),"#f6efdc",6.3,.99,-3.85);mk(Bx(.02,.07,.5),"#7a2a2a",6.3,.995,-3.85);mk(Cy(.05,.1),"#2a2a2a",6.85,1.01,-3.8);const qq=mk(Bx(.02,.3,.02),"#e8e0d0",6.85,1.2,-3.8);qq.rotation.z=-.3;R.solids.push([6.3,-3.9,.95]);
    clerk(6.3,-4.65,0,"#3a4a7a","#2a2a2a","Mestský pisár",(A2,t)=>{A2[1].rotation.x=-1.05+.06*Math.sin(t*6);A2[1].rotation.z=.12*Math.sin(t*1.3);A2[0].rotation.x=-.9});
    rAdd(R,6.3,-2.9,1.9,"Mestský pisár: nahliadnuť do knihy úradov",()=>panel(()=>radHTML("kniha")));
    /* staviteľ s modelom mesta */
    mk(Bx(1.7,.9,.9),"#6b4a2a",-6.3,.45,-3.9);mk(Bx(1.8,.06,1),"#7a5a34",-6.3,.93,-3.9);[[-.5,.2,"#e9dcc0","#8a3a28"],[-.1,-.15,"#d8c8a8","#7a5a34"],[.35,.15,"#cfc6b0","#5a5a62"]].forEach(q=>{mk(Bx(.3,.22,.26),q[2],-6.3+q[0],1.07,-3.9+q[1]);const rf=mk(new T.ConeGeometry(.24,.18,4),q[3],-6.3+q[0],1.27,-3.9+q[1]);rf.rotation.y=.785});mk(Cy(.07,.4),"#bfb6a0",-5.75,1.16,-4.15);mk(Bx(.5,.02,.35),"#f0e6c8",-6.6,.97,-3.6);R.solids.push([-6.3,-3.9,.95]);
    clerk(-6.3,-4.7,0,"#7a5a34","#5a3a20","Mestský staviteľ",(A2,t)=>{const s2=Math.max(0,Math.sin(t*.5));A2[1].rotation.x=-.5-s2*.7;A2[0].rotation.x=-.2});
    rAdd(R,-6.3,-2.9,1.9,"Mestský staviteľ: mestské stavby",()=>panel(()=>radHTML("stavby")));
    /* volebná urna a hlásnik */
    mk(Bx(.7,.9,.7),"#5a4028",-7,.45,.6);mk(Bx(.5,.4,.5),"#8a6a3a",-7,1.1,.6);mk(Bx(.52,.05,.52),"#c9a23a",-7,1.32,.6);mk(Bx(.24,.06,.03),"#2a2014",-7,1.35,.6);const bal=mk(Bx(.18,.24,.01),"#f6efdc",-7,1.5,.6);bal.rotation.z=.2;R.solids.push([-7,.6,.55]);
    clerk(-7,1.8,Math.PI/2,"#a8321c","#c9a23a","Hlásnik",(A2,t,m)=>{A2[1].rotation.x=-1.2+.1*Math.sin(t*1.1);m.rotation.y=Math.PI/2+.25*Math.sin(t*.4)});
    rAdd(R,-6.2,1.1,2,S.elec?"Urna: voľby, kandidatúra a kampaň":"Hlásnik: kedy budú voľby",()=>panel(()=>radHTML("volby")));
    /* cechmajster s cechovou truhlicou */
    mk(Bx(.9,.5,.55),"#6a4426",7.1,.25,.5);mk(Bx(.94,.08,.59),"#4a3020",7.1,.54,.5);mk(Bx(.1,.14,.03),"#c9a23a",6.82,.3,.5);R.solids.push([7.1,.5,.6]);
    clerk(7,1.8,-Math.PI/2,"#6a4a2a","#7a2a2a","Cechmajster",(A2,t,m)=>{A2[0].rotation.x=-.35;A2[1].rotation.x=-.35-.3*Math.max(0,Math.sin(t*.8));m.rotation.y=-Math.PI/2+.2*Math.sin(t*.35)});
    rAdd(R,6.2,1.5,2,"Cechmajster: cechy a frakcie mesta",()=>panel(()=>radHTML("cechy")));
    /* prosebníci na laviciach */
    [[-5.6,"#5a6a4a",null],[-4.5,"#8a6a4a","#3a2a1a"],[5.3,"#4a5a7a",null]].forEach((q,k)=>clerk(q[0],3.4,Math.PI,q[1],q[2],null,(A2,t,m)=>{A2[0].rotation.x=-.7;A2[1].rotation.x=-.7;m.rotation.y=Math.PI+.35*Math.sin(t*.3+k*2)},1))}
   door(G,5.42,1.5,2.4);rAdd(R,0,4.6,1.9,"Vyjsť na námestie",leave)}
  else if(kind==="hrad"){R=mkRoom2(14,16,5.2,{wall:"wallY",floor:"marble",cornice:1,win:{n:4,g:1,z:2,h:2.4,w:.8}});const G=R.G;throne(G,R,0,-6.6);banner(G,-2.2,3.4,-7.95,"#7a1f2b",0);banner(G,2.2,3.4,-7.95,"#2f5bb0",0);
   for(let i=0;i<4;i++)[-1,1].forEach(q=>{KO(G).cyl(q*5,-5+i*3.2,.42,5.2,{tex:"marble",finial:false});KO(G).box(q*5-.6,-5+i*3.2-.6,1.2,1.2,.3,{tex:"marble",topTex:"marble",clean:1,tpu:16});R.solids.push([q*5,-5+i*3.2,.7])});
   stand(R,{id:-9,head:{gender:"m"},title:6,ai:1},"head",false,0,-5.6,0,"Kastelán hradu",{t:": priazeň kráľa, dary a audiencie",f:()=>panel(()=>radHTML("kastelan"))});
   {const mk=(geo,c,x,y,z,par)=>{const q=new T.Mesh(geo,M(c));q.position.set(x,y,z);q.castShadow=true;(par||G).add(q);return q},Bx=(w,h,d)=>new T.BoxGeometry(w,h,d),Cy=(r,h,r2)=>new T.CylinderGeometry(r2==null?r:r2,r,h,10);
    const clerk=(x,z,ry,col,hat,nm,anim)=>{const m=NPC3?NPC3(col,hat?{hat}:{}):null;if(!m)return null;scene.remove(m);G.add(m);m.position.set(x,0,z);m.rotation.y=ry;if(nm){const s=label(nm,null,.55,{k:"npc"});s.position.set(0,2.6,0);m.add(s)}R.solids.push([x,z,.45]);const A2=m.userData.arms;if(anim&&A2)life.push((dt,t)=>{if(m.parent)anim(A2,t,m)});return m};
    const halb=m=>{if(!m||!m.userData.arms)return;const a=m.userData.arms[1];mk(Cy(.025,2.3),"#6b4a2a",0,-.25,.14,a);mk(Bx(.02,.3,.22),"#b8bcc4",0,.75,.2,a);const tp=mk(new T.ConeGeometry(.04,.25,6),"#b8bcc4",0,1.02,.14,a)};
    /* herold so zvitkom */
    const he=clerk(-3.2,-3.4,.5,"#2f5bb0","#c9a23a","Herold",(A2,t,m)=>{A2[0].rotation.x=-1;A2[1].rotation.x=-1+.05*Math.sin(t*1.2);m.rotation.y=.5+.15*Math.sin(t*.3)});if(he&&he.userData.arms)mk(Bx(.34,.44,.02),"#f6efdc",.18,-.72,.16,he.userData.arms[0]);
    rAdd(R,-2.9,-2.9,1.8,"Herold: kráľovský dvor a rody ríše",()=>panel(()=>radHTML("herold")));
    /* kapitán posádky a stojan so zbraňami */
    mk(Bx(1.6,.08,.3),"#5a4028",6.7,1.5,-3.4).rotation.y=1.57;mk(Bx(1.6,.08,.3),"#5a4028",6.7,.4,-3.4).rotation.y=1.57;[-.6,-.3,0,.3,.6].forEach((o,k)=>{mk(Cy(.025,k%2?1.9:1.5),"#6b4a2a",6.62,k%2?1.05:.95,-3.4+o);if(k%2)mk(new T.ConeGeometry(.05,.3,6),"#b8bcc4",6.62,2.1,-3.4+o);else mk(Bx(.04,.7,.08),"#c8ccd2",6.62,1.9,-3.4+o)});
    const ka=clerk(3.3,-3.4,-.5,"#6a7078","#8a9098","Kapitán posádky",(A2,t,m)=>{A2[0].rotation.x=-.25;A2[1].rotation.x=-.1;m.rotation.y=-.5+.12*Math.sin(t*.35)});if(ka&&ka.userData.arms)mk(Bx(.04,.8,.06),"#c8ccd2",.12,-.9,.05,ka.userData.arms[0]);
    rAdd(R,3,-2.9,1.8,"Kapitán posádky: vojenská služba synov",()=>panel(()=>radHTML("vojsko")));
    /* kráľovský staviteľ s modelom */
    mk(Bx(1.6,.9,.9),"#6b4a2a",-3.3,.45,3);mk(Bx(1.7,.06,1),"#7a5a34",-3.3,.93,3);mk(Bx(.5,.5,.4),"#cfc6b0",-3.5,1.21,3);const sp=mk(new T.ConeGeometry(.16,.5,4),"#5a5a62",-3.5,1.71,3);sp.rotation.y=.785;mk(Bx(.5,.1,.25),"#bfb6a0",-2.9,1.01,3.1);mk(new T.TorusGeometry(.12,.03,5,10,3.14),"#bfb6a0",-2.9,1.06,3.1);R.solids.push([-3.3,3,.95]);
    clerk(-3.3,2.1,0,"#7a5a34","#5a3a20","Kráľovský staviteľ",(A2,t)=>{const s2=Math.max(0,Math.sin(t*.5));A2[1].rotation.x=-.5-s2*.7;A2[0].rotation.x=-.2});
    rAdd(R,-2.6,3.4,1.9,"Kráľovský staviteľ: veľké diela rodu",()=>panel(()=>radHTML("diela")));
    /* stráže pri dverách a dvorania */
    halb(clerk(-2,6.9,Math.PI,"#7a1f2b","#8a9098",null,(A2,t)=>{A2[1].rotation.x=-.2;A2[0].rotation.x=0}));halb(clerk(2,6.9,Math.PI,"#7a1f2b","#8a9098",null,(A2,t)=>{A2[1].rotation.x=-.2;A2[0].rotation.x=0}));
    clerk(3,2.4,.9,"#6d3f92","#3a2a4a",null,(A2,t,m)=>{A2[1].rotation.x=-.6-.5*Math.max(0,Math.sin(t*1.3));A2[0].rotation.x=-.2;m.rotation.y=.9+.1*Math.sin(t*.5)});clerk(3.9,3.1,.9-Math.PI,"#2f7d46","#c9a23a",null,(A2,t,m)=>{A2[0].rotation.x=-.5-.4*Math.max(0,Math.sin(t*1.1+2));A2[1].rotation.x=-.15;m.rotation.x=.04*Math.sin(t*1.7)})}
   const car=new T.Mesh(new T.PlaneGeometry(2.2,12),faceMat("damask",2.2,12,[0,0,1],{tpu:14,clean:1}));car.rotation.x=-Math.PI/2;car.position.set(0,.02,0);G.add(car);
   door(G,7.92,1.8,2.8);rAdd(R,0,7.1,2,"Vyjsť z hradu",leave)}
  else if(kind==="kostol"){R=mkRoom2(10,18,6,{wall:"wallY",floor:"marble",win:{n:4,g:1,tr:1,z:1.8,h:3.2,w:1.3}});const G=R.G;rug(G,0,0,1.8,15,"damask");altar(G,R,0,-7.6,2.6);
   for(let i=0;i<5;i++)[-1,1].forEach(q=>{bench(G,R,q*2.6,-4+i*2,3,1)});
   [].forEach(q=>{[-1,1].forEach(sd=>{const wn=new T.Mesh(new T.PlaneGeometry(1,2.6),new T.MeshBasicMaterial({color:q[0],side:T.DoubleSide}));wn.position.set(sd*4.96,3.2,q[1]);wn.rotation.y=sd*-Math.PI/2;G.add(wn)})});
   stand(R,{id:-8,head:{gender:"m"},title:2,ai:1},"head",false,0,-6.2,0,"Farár",{t:": duchovní z tvojho rodu",f:()=>panel(()=>radHTML("farar"))});
   {const mk=(geo,c,x,y,z,par)=>{const q=new T.Mesh(geo,M(c));q.position.set(x,y,z);q.castShadow=true;(par||G).add(q);return q},Bx=(w,h,d)=>new T.BoxGeometry(w,h,d),Cy=(r,h,r2)=>new T.CylinderGeometry(r2==null?r:r2,r,h,10);
    const clerk=(x,z,ry,col,hat,nm,anim,sit)=>{const m=NPC3?NPC3(col,hat?{hat}:{}):null;if(!m)return null;scene.remove(m);G.add(m);m.position.set(x,sit?-.42:0,z);if(sit)(m.userData.legsP||[]).forEach(q=>q.rotation.x=-1.5);m.rotation.y=ry;if(nm){const s=label(nm,null,.55,{k:"npc"});s.position.set(0,2.6,0);m.add(s)}if(!sit)R.solids.push([x,z,.45]);const A2=m.userData.arms;if(anim&&A2)life.push((dt,t)=>{if(m.parent)anim(A2,t,m)});return m};
    const nightC=(()=>{try{return todPh()===3}catch(e){return false}})();
    /* kanonik pri pulte s knihou */
    mk(Bx(.5,1.1,.4),"#5a4028",-3.6,.55,-6.4);const lec=mk(Bx(.8,.06,.6),"#6b4a2a",-3.6,1.16,-6.35);lec.rotation.x=.35;const bk=mk(Bx(.6,.07,.45),"#f6efdc",-3.6,1.22,-6.33);bk.rotation.x=.35;R.solids.push([-3.6,-6.4,.5]);
    clerk(-3.6,-7.1,0,"#6d2a3f","#3a1a24","Kanonik",(A2,t,m)=>{A2[1].rotation.x=-.9+.08*Math.sin(t*.9);A2[0].rotation.x=-.8;m.rotation.x=.06+.03*Math.sin(t*.5)});
    rAdd(R,-3.4,-5.5,1.8,"Kanonik: Svätá stolica, odpustky a katedrála rodu",()=>panel(()=>radHTML("stolica")));
    /* obetné sviece */
    mk(Bx(1.2,.8,.5),"#4a3a2a",3.7,.4,-6.6);mk(Bx(1.3,.05,.6),"#2a2a2a",3.7,.83,-6.6);for(let i=0;i<7;i++){const cx=3.2+i*.17,ch=.14+((i*7)%3)*.06;mk(Cy(.025,ch),"#f3ead0",cx,.86+ch/2,-6.6+((i%2)-.5)*.2);const fl=new T.Mesh(new T.SphereGeometry(.03,6,5),new T.MeshBasicMaterial({color:"#ffcf6a"}));fl.position.set(cx,.9+ch,-6.6+((i%2)-.5)*.2);G.add(fl);life.push((dt,t)=>{if(fl.parent){const k=1+.25*Math.sin(t*9+i*2.1);fl.scale.set(k,k*1.3,k)}})}R.solids.push([3.7,-6.6,.7]);
    /* spovednica */
    mk(Bx(1.1,2.7,2),"#4a3020",4.4,1.35,6);mk(Bx(1.2,.12,2.1),"#3a2416",4.4,2.76,6);mk(Bx(.04,1.9,.7),"#6d2a3f",3.83,1.15,5.5);mk(Bx(.04,.5,.5),"#2a1a10",3.83,1.5,6.5);[.0,.12,.24].forEach(o=>mk(Bx(.05,.5,.03),"#7a5a34",3.82,1.5,6.38+o));mk(Bx(.1,.3,.02),"#c9a23a",3.84,2.45,6);mk(Bx(.24,.08,.02),"#c9a23a",3.84,2.5,6);R.solids.push([4.4,5.4,.7]);R.solids.push([4.4,6.6,.7]);
    rAdd(R,3.3,6,1.7,"Spovednica: zmier a rodové spory",()=>panel(()=>radHTML("spory")));
    /* pútnik pri dverách */
    const pil=clerk(-3.9,6.6,2.3,"#7a6a4a","#5a4a30","Pútnik",(A2,t,m)=>{A2[1].rotation.x=-.5;A2[0].rotation.x=-.1+.05*Math.sin(t*.6);m.rotation.y=2.3+.2*Math.sin(t*.3)});if(pil&&pil.userData.arms){mk(Cy(.025,1.7),"#6b4a2a",0,-.35,.12,pil.userData.arms[1]);mk(new T.SphereGeometry(.07,6,5),"#c9b48a",0,-.9,.3,pil.userData.arms[1])}
    rAdd(R,-3.5,6.2,1.8,"Pútnik: púte do svätých miest",()=>panel(()=>radHTML("pute")));
    /* veriaci v laviciach */
    (nightC?[[2.2,2,"#5a4a3a",null]]:[[-3.3,-4,"#5a6a4a",null],[-2.1,-4,"#8a5a6a","#e8e0d0"],[2.4,-2,"#4a5a7a",null],[-2.8,0,"#7a5a3a","#3a2a1a"],[3.2,0,"#6a4a6a","#e8e0d0"],[2,2,"#5a4a3a",null],[-3.4,4,"#4a6a6a",null]]).forEach((q,k)=>clerk(q[0],q[1]+.12,Math.PI,q[2],q[3],null,(A2,t,m)=>{A2[0].rotation.x=-1.1;A2[1].rotation.x=-1.1;A2[0].rotation.z=.25;A2[1].rotation.z=-.25;m.rotation.x=.1+.08*Math.max(0,Math.sin(t*.25+k*1.9))},1))}
   door(G,8.92,1.6,2.8);rAdd(R,0,8.1,2,"Vyjsť z kostola",leave)}
  else if(kind==="uzernik"){const w=8,dd=7;R=mkRoom2(w,dd,3.2,{wall:"plaster",floor:"plank",wain:"#5a3a20",win:{n:1,z:1.2,h:1,w:.7}});const G=R.G;
   const mk=(geo,c,x,y,z,par)=>{const q=new T.Mesh(geo,M(c));q.position.set(x,y,z);q.castShadow=true;(par||G).add(q);return q},Bx=(a,b,c)=>new T.BoxGeometry(a,b,c),Cy=(r,h,r2)=>new T.CylinderGeometry(r2==null?r:r2,r,h,10);
   const npc=(x,z,ry,col,hat,nm,anim,sit)=>{const m=NPC3?NPC3(col,hat?{hat}:{}):null;if(!m)return null;scene.remove(m);G.add(m);m.position.set(x,sit?-.42:0,z);if(sit)(m.userData.legsP||[]).forEach(q=>q.rotation.x=-1.5);m.rotation.y=ry;if(nm){const s2=label(nm,null,.55,{k:"npc"});s2.position.set(0,2.6,0);m.add(s2)}if(!sit)R.solids.push([x,z,.45]);const A2=m.userData.arms;if(anim&&A2)life.push((dt,t)=>{if(m.parent)anim(A2,t,m)});return m};
   /* pult s váhami, mincami a knihou dlhov */
   table(G,R,0,-1.2,2.8,1,{bare:1});candle(G,-1.1,.82,-1.2);
   mk(Cy(.09,.03),"#8a6a2a",.2,.84,-1.2);mk(Cy(.015,.42),"#8a6a2a",.2,1.04,-1.2);const beam=mk(Bx(.62,.02,.02),"#8a6a2a",.2,1.24,-1.2);[-1,1].forEach(q=>{mk(Cy(.004,.2),"#5a4a2a",q*.29,-.1,0,beam);mk(Cy(.085,.012,.07),"#b8963a",q*.29,-.2,0,beam)});life.push((dt,t)=>{if(beam.parent)beam.rotation.z=.08*Math.sin(t*1.3)});
   [[-.5,-1.05,5],[-.36,-1.12,3],[-.44,-1.3,7],[-.62,-1.25,2]].forEach(q=>{for(let i=0;i<q[2];i++)mk(Cy(.035,.012),i%3?"#e3be4f":"#d0a83a",q[0],.826+i*.013,q[1])});
   mk(Bx(.5,.05,.36),"#5a2a1a",.85,.845,-1.2);mk(Bx(.46,.02,.32),"#f1e6c8",.85,.875,-1.2);mk(Bx(.012,.022,.32),"#5a2a1a",.85,.88,-1.2);
   npc(0,-2.1,0,"#2a2a32","#1a1a20","Úžerník",(A2,t,m)=>{const s2=Math.max(0,Math.sin(t*2.2));A2[1].rotation.x=-.95-s2*.18;A2[1].rotation.z=.25;A2[0].rotation.x=-.85;m.rotation.x=.1;m.rotation.y=.12*Math.sin(t*.4)});
   rAdd(R,0,-.2,2,"Úžerník: pôžička alebo splátka",()=>panel(lenderHTML));
   /* truhlice a mešce */
   chest(G,R,-w/2+1.1,-dd/2+1,1.4);chest(G,R,w/2-1.1,-dd/2+1,1.2);[[w/2-1.9,-dd/2+.7],[w/2-2.2,-dd/2+1.1],[w/2-1.7,-dd/2+1.3]].forEach((q,i)=>{const sk=mk(new T.SphereGeometry(.17,8,6),"#8a7a5a",q[0],.15,q[1]);sk.scale.set(1,.85,1);mk(Cy(.05,.08,.03),"#6a5a3a",q[0],.31,q[1])});
   /* strážca s kyjakom a čakajúci dlžník */
   {const gd=npc(w/2-1,dd/2-1.4,-2.5,"#5a3a2a","#3a3a3a",null,(A2,t,m)=>{A2[1].rotation.x=-.25;A2[0].rotation.x=-.1;m.rotation.y=-2.5+.2*Math.sin(t*.3)});if(gd&&gd.userData.arms){const cl=mk(Cy(.03,.7,.06),"#5a3c22",0,-.9,.2,gd.userData.arms[1]);cl.rotation.x=1.2}}
   bench(G,R,-2.5,1.5,2,1);npc(-2.5,1.5,Math.PI,"#6a6a4a",null,null,(A2,t,m)=>{A2[0].rotation.x=-.7;A2[1].rotation.x=-.7;m.rotation.x=.14+.03*Math.sin(t*.9);m.rotation.y=Math.PI+.15*Math.sin(t*.25)},1);
   door(G,dd/2-.08,1.1,2.1);rAdd(R,0,dd/2-.8,1.8,"Vyjsť na ulicu",leave)}
  if(!R)return;try{if(R.G.userData.kit)R.G.userData.kit.flush()}catch(e){}try{if(shOn())R.G.traverse(o=>{if(!o.isMesh||o.userData.glow)return;const m=o.material,bas=m&&(m.isMeshBasicMaterial||(Array.isArray(m)&&m[0]&&m[0].isMeshBasicMaterial));if(bas)return;o.receiveShadow=true;if(!o.userData.noCast)o.castShadow=true})}catch(e){}legLights(R.scene);R.back=back;if(room){room.scene.remove(me)}else scene.remove(me);R.scene.add(me);room=R;
  px=0;pz=R.d/2-1.6;yaw=Math.PI;pitch=.5;dist=Math.min(9,R.d*.6);st.near=null;hint.hidden=true;
  const wh=root.querySelector(".m3top span");if(wh)wh.textContent={home:"tvoje sídlo",seat:"sídlo rodu "+(o.d?o.d.name:""),radnica:"radná sieň",hrad:"hradná sieň",kostol:"kostol",uzernik:"u úžerníka"}[kind]||""}
 function leave(){if(!room)return;const b=room.back;room.scene.remove(me);scene.add(me);room=null;px=b[0];pz=b[1];dist=b[2];pitch=b[3];yaw=b[4];st.near=null;hint.hidden=true;const wh=root.querySelector(".m3top span");if(wh)wh.textContent=["jar","leto","jeseň","zima"][S.season]+" "+S.year}
 /* ovládanie */
 const keys=new Set();let drag=null;
 const onKey=e=>{if(document.querySelector("#modal:not([hidden])"))return;const k=e.key.toLowerCase();
  if(k==="escape"){e.preventDefault();e.stopImmediatePropagation();if(pfn){panelOff();return}if(room){leave();return}close();return}
  if(pfn)return;
  if(k==="v"){fp=!fp;me.visible=!fp;return}
  if(k==="z"&&!room&&pn.hidden&&typeof SND!=="undefined"){try{SND.toggleSfx()}catch(e2){}try{toast(SND.sfx?"Zvuky mesta zapnuté.":"Zvuky mesta vypnuté.","good")}catch(e2){}REST={c:cid,px,pz,yaw,pitch,dist};close();setTimeout(()=>{try{A.m3d()}catch(e2){}},30);return}
  if(k==="q"&&!room&&pn.hidden){const nq=QLV===0?2:QLV-1;try{localStorage.setItem("m3q",String(nq))}catch(e2){}try{toast("Kvalita grafiky: "+["nízka (najrýchlejšia)","stredná","vysoká"][nq]+".","good")}catch(e2){}REST={c:cid,px,pz,yaw,pitch,dist};close();setTimeout(()=>{try{A.m3d()}catch(e2){}},30);return}
  if(k==="h"&&LEG0()&&!room&&pn.hidden){CMON=!CMON;try{localStorage.setItem("m3cm",CMON?"1":"0")}catch(e){}I3S=-1;I3DS=-1;GFX={};for(const k2 in TXC)delete TXC[k2];for(const k2 in FMC)delete FMC[k2];for(const k2 in FGC)delete FGC[k2];FIGM=null;try{toast(CMON?"Jemné maľované farby.":"Pôvodné sýte farby.","good")}catch(e){}REST={c:cid,px,pz,yaw,pitch,dist};close();setTimeout(()=>{try{A.m3d()}catch(e){}},30);return}
  if(k==="l"){let on=true;try{on=!shOn();localStorage.setItem("m3sh",on?"1":"0")}catch(e){}try{toast(on?"Svetlo a tiene v miestnostiach zapnuté (platí po vstupe do miestnosti).":"Svetlo a tiene v miestnostiach vypnuté – rýchlejšie (platí po vstupe do miestnosti).","good")}catch(e){}return}
  if(k==="g"){postOn=!postOn;try{localStorage.setItem("m3post",postOn?"1":"0")}catch(e){}try{toast(postOn?"Maľovaný vzhľad zapnutý.":"Maľovaný vzhľad vypnutý (rýchlejšie).","good")}catch(e){}return}
  if(k==="k"&&!room&&pn.hidden){endQ();return}
  if(k==="t"&&!room&&pn.hidden&&X_NAV.places){X_NAV.places();return}if(k==="n"&&!room&&X_NAV.wide){X_NAV.wide();return}
  if(k==="m"&&!room){if(dist<90){st.back=[dist,pitch];dist=SITES.length?250:150;pitch=1.2}else{const b=st.back||[11,.42];dist=b[0];pitch=b[1]}return}
  if(k==="e"||k==="enter"){e.preventDefault();e.stopImmediatePropagation();if(st&&st.near&&st.near.act){keys.clear();st.near.act()}return}
  if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright","shift"].includes(k)){keys.add(k);e.preventDefault()}};
 const onUp=e=>keys.delete(e.key.toLowerCase());
 const onDown=e=>{if(e.target!==canvas)return;drag={x:e.clientX,y:e.clientY};canvas.style.cursor="grabbing"};
 const onMove=e=>{if(!drag)return;yaw-=(e.clientX-drag.x)*.006;pitch=Math.max(-.25,Math.min(1.4,pitch+(e.clientY-drag.y)*.004));drag={x:e.clientX,y:e.clientY}};
 const onEnd=()=>{drag=null;canvas.style.cursor="grab"};
 const onWheel=e=>{e.preventDefault();dist=Math.max(room?2.5:4,Math.min(room?Math.max(room.w,room.d)*.9:280,dist*(e.deltaY>0?1.12:.89)))};
 const onRes=()=>{renderer.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();try{if(post)post.resize()}catch(e){}};
 addEventListener("keydown",onKey,true);addEventListener("keyup",onUp,true);canvas.addEventListener("mousedown",onDown);addEventListener("mousemove",onMove);addEventListener("mouseup",onEnd);canvas.addEventListener("wheel",onWheel,{passive:false});addEventListener("resize",onRes);
 const pn=root.querySelector(".m3panel");let pfn=null;
 function panel(fn){pfn=fn;keys.clear();pn.hidden=false;pn.innerHTML=`<button class="btn sm m3px" data-m3="x">✕ Zavrieť</button>`+fn();try{canvas.focus()}catch(e){}}
 function panelOff(){pfn=null;pn.hidden=true;pn.innerHTML="";try{canvas.focus()}catch(e){}}
 pn.addEventListener("click",e=>{const b=e.target.closest("[data-m3]");if(!b){if(e.target.closest("[data-a]")&&pfn){const f=pfn;setTimeout(()=>{try{if(pfn!==f||pn.hidden)return;const sc=pn.querySelector(".m3scroll"),st=sc?sc.scrollTop:0;pn.innerHTML=`<button class="btn sm m3px" data-m3="x">✕ Zavrieť</button>`+f();const s2=pn.querySelector(".m3scroll");if(s2)s2.scrollTop=st}catch(x){console.warn(x)}},60)}return}e.stopPropagation();e.preventDefault();const k=b.dataset.m3;
  try{if(k==="x"){panelOff();return}
   if(k==="game"){const p1=P(),m0=p1.money,n0=S.gameT===S.turn?(S.gameN||0):0;TAVBET=Math.floor(+(document.getElementById("gm-bet")||{}).value||0);A.gameGo({k:b.dataset.k});const n1=S.gameT===S.turn?(S.gameN||0):0,df=Math.round(p1.money-m0);TAVMSG=n1===n0?(n0>=3?"Na dnes stačilo. Krčmárka už zatvára.":"Na takú stávku nemáš."):df>0?`${GAMES[b.dataset.k].n}: vyhral si ${fmt(df)} zl.`:df<0?`${GAMES[b.dataset.k].n}: prehral si ${fmt(-df)} zl.`:`${GAMES[b.dataset.k].n}: remíza, stávka sa vracia.`}
   if(k==="buy")A.buy({g:b.dataset.g,n:b.dataset.n});
   if(k==="sell")A.sell({g:b.dataset.g,n:b.dataset.n});
   if(k==="hire")A.hire({b:b.dataset.b});
   if(k==="upg")A.upg({b:b.dataset.b});if(k==="house")A.house({});if(k==="seatup")A.seatUp({c:S.ci});if(k==="hubuy")A.hubuy({u:b.dataset.u});if(k==="cup")A.seatCup({c:S.ci,k:b.dataset.k});
   if(k==="fire")A.fire({b:b.dataset.b});
   if(k==="greet"){const d=S.dyn[+b.dataset.d];S.m3g=S.m3g||{};const kk=S.turn+":"+d.id;if(!S.m3g[kk]){S.m3g[kk]=1;d.favor=clamp(d.favor+1,-100,100);toast(`${d.head.name} ti odzdravil. Priazeň rodu ${d.name} +1.`,"good")}}
   if(k==="gift")A.gift({d:b.dataset.d,n:b.dataset.n});
   if(k==="ordyes"||k==="ordno"){const O3=S.ord3,o=O3&&O3.o;if(o&&!O3.done){O3.done=k==="ordyes"?1:2;if(O3.done===1){const p1=P();S.orders=S.orders||[];S.orders.push(o);try{chron(`Rod ${p1.name} prijal na námestí zákazku pre: ${o.from} (${o.n}× ${GOODS[o.g].n.toLowerCase()} za ${zl(o.pay)}).`,"obchod","")}catch(e){}toast("Zákazka prijatá. Nájdeš ju na stránke Trh.","good")}}}
   if(k==="feast")A.feast();
   if(k==="wed")A.kidwed({kid:b.dataset.kid,d:b.dataset.d,k:b.dataset.k});
   if(k==="prod")A.prod({b:b.dataset.b,g:b.dataset.g});
   if(k==="borrow")A.borrow({n:b.dataset.n});
   if(k==="repay")A.repay({n:b.dataset.n});
   if(k==="prof"){const d=S.dyn[+b.dataset.d];A.prof({d:d.id,p:d.head.pid});return}
   if(k==="tab"){close();A.tab({v:b.dataset.v});return}}catch(x){console.warn(x)}
  if(pfn)panel(pfn)});
 const hud=root.querySelector(".m3hud");const hudUp=()=>{try{const q=P();hud.textContent=`💰 ${zl(Math.round(q.money))}${S.ap!=null?" · činnosť "+S.ap:""}`}catch(e){}};hudUp();
 function endQ(){const md=document.getElementById("modal");if(md&&!md.hidden)return;keys.clear();try{A.end()}catch(e){console.warn("3D koniec štvrťroka",e)}}
 root.querySelector("[data-m3end]").addEventListener("click",e=>{e.stopPropagation();endQ();try{canvas.focus()}catch(x){}});
 /* ---------- orientácia (v95): mapka, úlohy od kancelára, rýchly presun ---------- */
 try{const nav=document.createElement("div");nav.className="m3nav";nav.innerHTML=`<div class="m3tasks"></div><div class="m3mini" title="Mapka: N prepne celé okolie"><canvas width="190" height="190"></canvas></div><div class="m3places" hidden></div>`;root.appendChild(nav);
  const tb=root.querySelector("[data-m3end]");const pb=document.createElement("button");pb.type="button";pb.className="btn sm";pb.textContent="🧭 Miesta (T)";tb.before(pb);
  const EX=SITES.length?R1+12:R0*1.6,BS=1000,base=document.createElement("canvas");base.width=base.height=BS;const bx=base.getContext("2d"),mm=v=>(v+EX)/(2*EX)*BS;
  const line=(pts,w,c,cl)=>{if(!pts||pts.length<2)return;bx.strokeStyle=c;bx.lineWidth=w;bx.lineCap="round";bx.lineJoin="round";bx.beginPath();pts.forEach((q,i)=>i?bx.lineTo(mm(q[0]),mm(q[1])):bx.moveTo(mm(q[0]),mm(q[1])));if(cl)bx.closePath();bx.stroke()};
  bx.fillStyle=L.canal?"#5f8fb0":snow?"#e8eef2":"#9ab46e";bx.fillRect(0,0,BS,BS);
  if(L.canal){bx.fillStyle=snow?"#eef2f6":"#9ab46e";bx.beginPath();L.wall.forEach((p0,i)=>{const q=wx([L.cx+(p0[0]-L.cx)*1.3,L.cy+(p0[1]-L.cy)*1.3]);i?bx.lineTo(mm(q[0]),mm(q[1])):bx.moveTo(mm(q[0]),mm(q[1]))});bx.fill()}
  const sc=BS/(2*EX);if(L.canal){bx.fillStyle=snow?"#eef2f6":"#9ab46e";SITES.forEach(q=>{bx.beginPath();bx.arc(mm(q.x),mm(q.z),(q.r+4)*sc,0,7);bx.fill()})}if(L.river)line(RVX(),9*sc,"#4f8fb6");(L.canals||[]).forEach(cn=>line((cn||[]).map(wx),3.2*sc,"#4f8fb6"));
  SITES.forEach(s=>{let b=null;(gates.length?gates:wall).forEach(q=>{const d=Math.hypot(q[0]-s.x,q[1]-s.z);if(!b||d<b.d)b={d,q}});if(b)line([b.q,[s.x,s.z]],1.6*sc,"#cdb88a")});
  (L.streets||[]).forEach(s=>line(s.map(wx),2.2*sc,"#d8c69a"));if(L.ring&&L.ring.length>2)line(L.ring.map(wx),2*sc,"#d8c69a",true);
  bx.fillStyle="#cfc4aa";bx.beginPath();bx.arc(mm(pl[0]),mm(pl[1]),9.5*sc,0,7);bx.fill();if(!L.canal)line(wall,2.2*sc,"#5a5046",true);
  const sq=(x,z,r,c)=>{bx.fillStyle=c;bx.strokeStyle="#2b2117";bx.lineWidth=1;bx.fillRect(mm(x)-r*sc,mm(z)-r*sc,2*r*sc,2*r*sc);bx.strokeRect(mm(x)-r*sc,mm(z)-r*sc,2*r*sc,2*r*sc)};
  inter.forEach(it=>{if(it.kind==="npc"||it.kind==="stall")return;const c=it.kind==="pub"?"#e3be4f":it.kind==="mine"||it.kind==="home"?dc0:it.kind==="oko"?"#f4ead0":it.kind==="lot"?"rgba(107,68,35,.25)":"#a8896a";if(/^Sídlo: prestavať/.test(it.text))return;sq(it.x,it.z,it.kind==="pub"?3:it.kind==="oko"?5:it.kind==="lot"?1.4:2,c)});
  const cvm=nav.querySelector("canvas"),mx2=cvm.getContext("2d");let wide=false;const marks=[];
  function drawMini(t){const V=wide?EX:Math.min(EX,62),cx=wide?0:px,cz=wide?0:pz,k=190/(2*V);mx2.fillStyle="#2a2016";mx2.fillRect(0,0,190,190);const s0=mm(cx-V),s1=mm(cz-V),sw=2*V*sc;mx2.drawImage(base,s0,s1,sw,sw,0,0,190,190);
   const P2=(x,z)=>[(x-cx+V)*k,(z-cz+V)*k];folk.forEach(o=>{const q=P2(o.g.position.x,o.g.position.z);mx2.fillStyle=(()=>{try{return DC(o.d.id)}catch(e){return"#333"}})();mx2.beginPath();mx2.arc(q[0],q[1],2.6,0,7);mx2.fill()});
   marks.forEach(m=>{const q=P2(m.x,m.z);const r=4+1.5*Math.sin((t||0)*4);const qx=Math.max(6,Math.min(184,q[0])),qy=Math.max(6,Math.min(184,q[1]));mx2.fillStyle="#ffd24a";mx2.strokeStyle="#2b2117";mx2.lineWidth=1.2;mx2.beginPath();mx2.arc(qx,qy,r,0,7);mx2.fill();mx2.stroke()});
   const q=P2(px,pz);mx2.save();mx2.translate(q[0],q[1]);mx2.rotate(-yaw+Math.PI);mx2.fillStyle="#fff";mx2.strokeStyle="#2b2117";mx2.lineWidth=1.4;mx2.beginPath();mx2.moveTo(0,-7);mx2.lineTo(5,6);mx2.lineTo(0,3);mx2.lineTo(-5,6);mx2.closePath();mx2.fill();mx2.stroke();mx2.restore()}
  let acc=0;life.push((dt,t)=>{acc+=dt;if(acc>.1){acc=0;drawMini(t)}});drawMini(0);
  const goTo=it=>{if(room)return;px=it.x;pz=it.z+Math.max(2.6,Math.min(7,(it.r||4)-1.2));if(WET(px,pz)){let ok=0;for(let r=1;r<14&&!ok;r+=1)for(let a=0;a<6.3&&!ok;a+=.5){const x=it.x+Math.sin(a)*r,z=it.z+Math.cos(a)*r;if(!WET(x,z)){px=x;pz=z;ok=1}}}yaw=Math.PI;camD=null;keys.clear();plc.hidden=true;try{canvas.focus()}catch(e){}};
  X_NAV.wide=()=>{wide=!wide;drawMini(0)};
  /* miesta */
  const plc=nav.querySelector(".m3places");const E7=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const places=()=>inter.map((it,i)=>[it,i]).filter(([it])=>it.kind==="pub"||it.kind==="home"||it.kind==="oko"||(it.kind==="mine"&&!/^Sídlo: prestavať/.test(it.text)));
  function showPlaces(){if(!plc.hidden){plc.hidden=true;return}const G2={home:"Tvoj rod",mine:"Tvoj rod",pub:"Mesto",oko:"Okolie"};let h="",last="";places().sort((a,b)=>(a[0].kind==="oko")-(b[0].kind==="oko")||(a[0].kind==="pub")-(b[0].kind==="pub")).forEach(([it,i])=>{const gname=G2[it.kind];if(gname!==last){h+=`<h4>${gname}</h4>`;last=gname}h+=`<button type="button" class="btn sm" data-go="${i}">${E7(it.text.split(":")[0])}</button>`});try{const hc=P().city;const cs=S.cities.filter(c=>c.id!==cid).sort((a,b)=>(b.id===hc)-(a.id===hc)||a.tier-b.tier||a.id-b.id);if(cs.length){h+=`<h4>Navštíviť iné mesto</h4>`;cs.forEach(c=>{h+=`<button type="button" class="btn sm" data-city="${c.id}">${c.id===hc?"★ ":""}${E7(c.n)}${c.id===hc?" (domov)":""}</button>`})}}catch(e){}plc.innerHTML=`<div class="m3phd"><b>Kam chceš ísť?</b><button type="button" class="btn sm ghost" data-go="x">✕</button></div>${h}`;plc.hidden=false}
  X_NAV.places=showPlaces;pb.addEventListener("click",e=>{e.stopPropagation();showPlaces()});
  plc.addEventListener("click",e=>{const cb=e.target.closest("[data-city]");if(cb){e.stopPropagation();const c=+cb.dataset.city;if(!S.cities[c])return;try{S.cur=c;S.sel=null;bindCity(c);S.view="mesto"}catch(x){console.warn("3D mesto",x);return}close();setTimeout(()=>{try{A.m3d()}catch(x){}},30);return}const b=e.target.closest("[data-go]");if(!b)return;e.stopPropagation();if(b.dataset.go==="x"){plc.hidden=true;return}const it=inter[+b.dataset.go];if(it)goTo(it)});
  /* úlohy: rady kancelára pripnuté na miesta v meste */
  const tk=nav.querySelector(".m3tasks");const TABP={trh:/^Trh/,radnica:/^Radnica/,dvor:/^Hrad/,cirkev:/^Kostol/,majetok:/^Úžerník/};
  const placeOf=v=>{if(TABP[v])return inter.find(it=>TABP[v].test(it.text||""));if(v==="dielne")return inter.find(it=>it.kind==="mine"&&/vojsť/.test(it.text)&&!/Sídlo/.test(it.text));if(v==="rod"||v==="sidlo"||v==="kariera")return inter.find(it=>it.kind==="home");if(v==="okolie")return inter.find(it=>it.kind==="oko");return null};
  let adv=[];try{adv=(advice()||[]).filter(a=>a&&a.t)}catch(e){}
  const used=new Set(),rows=[];for(const a of adv){const it=placeOf(a.v);if(!it||used.has(it)||rows.length>=4)continue;used.add(it);rows.push([a,it])}
  if(rows.length){const ex=(()=>{const c=document.createElement("canvas");c.width=c.height=64;const x=c.getContext("2d");x.fillStyle="#ffd24a";x.strokeStyle="#2b2117";x.lineWidth=4;x.beginPath();x.arc(32,32,26,0,7);x.fill();x.stroke();x.fillStyle="#2b2117";x.font="700 40px Georgia,serif";x.textAlign="center";x.textBaseline="middle";x.fillText("!",32,34);return new T.CanvasTexture(c)})();
   tk.innerHTML=`<b>Čo ťa čaká</b>`+rows.map(([a,it],i)=>`<button type="button" class="m3task" data-tk="${i}" title="Presunúť sa tam"><i>${a.ic||"!"}</i><span>${E7(a.t.length>92?a.t.slice(0,90)+"…":a.t)}</span></button>`).join("");
   rows.forEach(([a,it])=>{marks.push({x:it.x,z:it.z});const s=new T.Sprite(new T.SpriteMaterial({map:ex,transparent:true,depthTest:false}));s.scale.set(1.5,1.5,1);const y0=it.kind==="pub"?13:it.kind==="oko"?11:9;s.position.set(it.x,y0,it.z);s.renderOrder=9;g.add(s);life.push((dt,t)=>{s.position.y=y0+.35*Math.sin(t*2.4+it.x);const d=Math.hypot(it.x-px,it.z-pz);s.visible=d>7;const k2=Math.max(1.5,Math.min(7,d*.045));s.scale.set(k2,k2,1)})});
   tk.addEventListener("click",e=>{const b=e.target.closest("[data-tk]");if(!b)return;e.stopPropagation();const r=rows[+b.dataset.tk];if(r)goTo(r[1])})}else tk.hidden=true;
 }catch(e){console.warn("3D orientácia",e)}
 const hint=root.querySelector(".m3hint");hint.addEventListener("click",()=>{if(st&&st.near&&st.near.act){keys.clear();st.near.act()}});
 /* ---------- voda je prekážka (v109): cez rieku len po mostoch, v Benátkach po súši, mostoch, lávkach a mólach ---------- */
 let WET=()=>false,ONB=()=>false,BRX=[],BRH=(x,z)=>ONB(x,z)?.36:0,BRP=[];
 try{const dSeg=(x,z,a,b)=>{const vx=b[0]-a[0],vz=b[1]-a[1],l2=vx*vx+vz*vz||1;let t=((x-a[0])*vx+(z-a[1])*vz)/l2;t=t<0?0:t>1?1:t;return Math.hypot(x-a[0]-vx*t,z-a[1]-vz*t)},dPoly=(x,z,P)=>{let m=1e9;for(let i=0;i<P.length-1;i++){const d=dSeg(x,z,P[i],P[i+1]);if(d<m)m=d}return m};
  const outs=(gates.length?gates:wall.filter((_,i)=>i%5===0)).map(q=>{const d=Math.hypot(q[0],q[1])||1;return[q[0]+q[0]/d*4,q[1]+q[1]/d*4]});
  const siteRoads=SITES.map(q=>{let b=null;outs.forEach(o=>{const d=Math.hypot(o[0]-q.x,o[1]-q.z);if(!b||d<b.d)b={d,o}});if(!b)return null;const mx=(b.o[0]+q.x)/2+(q.z-b.o[1])*.08,mz=(b.o[1]+q.z)/2-(q.x-b.o[0])*.08,pts=[];for(let t=0;t<=1.001;t+=.1){const a=(1-t)*(1-t),c=2*t*(1-t),e=t*t;pts.push([a*b.o[0]+c*mx+e*q.x,a*b.o[1]+c*mz+e*q.z])}return pts}).filter(Boolean);
  if(L.canal&&VEN.shore){const sh=VEN.shore,cans=(L.canals||[]).map(c=>(c||[]).map(wx)).filter(c=>c.length>1);
   const inPoly=(x,z)=>{let c=false;for(let i=0,j=sh.length-1;i<sh.length;j=i++){const a=sh[i],b=sh[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
   ONB=(x,z)=>VEN.br.some(q=>Math.hypot(q[0]-x,q[1]-z)<2.9);BRP=VEN.br.map(q=>[[q[0]-Math.cos(q[2])*3.8,q[1]-Math.sin(q[2])*3.8],[q[0]+Math.cos(q[2])*3.8,q[1]+Math.sin(q[2])*3.8]]);
   WET=(x,z)=>{if(inter.some(i=>i.kind!=="npc"&&Math.hypot(i.x-x,i.z-z)<2.8))return false;if(inPoly(x,z)){if(ONB(x,z))return false;for(const c of cans)if(dPoly(x,z,c)<1.35)return true;return false}
    for(const q of VEN.isles)if(Math.hypot(q[0]-x,q[1]-z)<q[2])return false;for(const r of siteRoads)if(dPoly(x,z,r)<1.25)return false;for(const pr2 of VEN.piers)if(dSeg(x,z,pr2[0],pr2[1])<.95)return false;return true}}
  else if(L.river&&L.river.length>1){const rv=RVX(),X=CROSSX();
   const sm=MT("stone","#b9b0a0",1,1),sm2=MT("stone","#a99f8a",1,1);
   X.forEach(q=>{const sn=Math.max(.28,Math.abs(Math.sin(q[2]-q[3]))),hl=Math.min(18,4.7/sn+4.2),H=q.fam||q.lm?3.1:2.75,op=Math.min(hl-3,5/sn),f=u=>H*(1-(u/hl)*(u/hl));q.hl=hl;q.H=H;const bg=new T.Group(),N=16;
    for(let i=0;i<N;i++){const u0=-hl+2*hl*i/N,u1=-hl+2*hl*(i+1)/N,y0=f(u0),y1=f(u1),um=(u0+u1)/2,ym=(y0+y1)/2,ln=Math.hypot(u1-u0,y1-y0),rz=Math.atan2(y1-y0,u1-u0);
     const dk=new T.Mesh(new T.BoxGeometry(ln+.06,.34,3.4),sm);dk.position.set(um,ym-.02,0);dk.rotation.z=rz;dk.castShadow=true;dk.receiveShadow=true;bg.add(dk);
     [-1.6,1.6].forEach(o=>{const pr=new T.Mesh(new T.BoxGeometry(ln+.06,.62,.24),sm2);pr.position.set(um,ym+.42,o);pr.rotation.z=rz;pr.castShadow=true;bg.add(pr)});
     if(Math.abs(um)>op&&ym>.3){const fl=new T.Mesh(new T.BoxGeometry(u1-u0+.02,ym,3.1),sm2);fl.position.set(um,ym/2-.1,0);bg.add(fl)}
     else if(Math.abs(um)<=op){const dip=Math.min(1.5,(Math.abs(um)/op)**3*1.9);if(dip>.12)[-1.45,1.45].forEach(o=>{const sp=new T.Mesh(new T.BoxGeometry(u1-u0+.02,dip,.3),sm2);sp.position.set(um,ym-.15-dip/2,o);bg.add(sp)})}}
    bg.position.set(q[0],0,q[1]);bg.rotation.y=-q[2];g.add(bg);q.a=[q[0]-Math.cos(q[2])*hl,q[1]-Math.sin(q[2])*hl];q.b=[q[0]+Math.cos(q[2])*hl,q[1]+Math.sin(q[2])*hl]});
   BRH=(x,z)=>{for(const q of X){const dx=q.b[0]-q.a[0],dz=q.b[1]-q.a[1],l2=dx*dx+dz*dz,t=((x-q.a[0])*dx+(z-q.a[1])*dz)/l2;if(t<0||t>1)continue;if(Math.hypot(x-q.a[0]-dx*t,z-q.a[1]-dz*t)>1.55)continue;const u=2*t-1;return q.H*(1-u*u)+.16}return 0};
   BRX=X;BRP=X.map(q=>[q.a,q.b]);ONB=(x,z)=>X.some(q=>dSeg(x,z,q.a,q.b)<1.55);
   WET=snow?()=>false:(x,z)=>dPoly(x,z,rv)<4.3&&!ONB(x,z)}
 }catch(e){console.warn("3D voda",e);WET=()=>false;ONB=()=>false}
 /* ---------- chodníky k budovám (v117): ku každej budove bez cesty vedie vyšliapaný chodník ---------- */
 let PATHS=[];
 try{const dS=(x,z,a,b)=>{const vx=b[0]-a[0],vz=b[1]-a[1],l2=vx*vx+vz*vz||1;let t=((x-a[0])*vx+(z-a[1])*vz)/l2;t=t<0?0:t>1?1:t;return[Math.hypot(x-a[0]-vx*t,z-a[1]-vz*t),a[0]+vx*t,a[1]+vz*t]};
  const outs=(gates.length?gates:wall.filter((_,i)=>i%5===0)).map(q=>{const d=Math.hypot(q[0],q[1])||1;return[q[0]+q[0]/d*4,q[1]+q[1]/d*4]});
  const net=(L.streets||[]).map(s2=>s2.map(wx)).concat(L.ring&&L.ring.length>2?[L.ring.concat([L.ring[0]]).map(wx)]:[],gates.map(q=>{const dx=q[0]-cen[0],dz=q[1]-cen[1],dl=Math.hypot(dx,dz)||1;return[[pl[0]+dx/dl*9,pl[1]+dz/dl*9],[q[0],q[1]],[q[0]+dx/dl*52,q[1]+dz/dl*52]]}),SITES.map(q=>{let b=null;outs.forEach(o=>{const d=Math.hypot(o[0]-q.x,o[1]-q.z);if(!b||d<b.d)b={d,o}});if(!b)return null;const mx=(b.o[0]+q.x)/2+(q.z-b.o[1])*.08,mz=(b.o[1]+q.z)/2-(q.x-b.o[0])*.08,pts=[];for(let t=0;t<=1.001;t+=.1){const a=(1-t)*(1-t),c=2*t*(1-t),e=t*t;pts.push([a*b.o[0]+c*mx+e*q.x,a*b.o[1]+c*mz+e*q.z])}return pts}).filter(Boolean),[Array.from({length:17},(_,i)=>[pl[0]+Math.cos(i/16*6.2832)*9,pl[1]+Math.sin(i/16*6.2832)*9])],BRX.map(q=>[q.a,q.b]),PGS.map(w=>{const dl=Math.hypot(w[0]-cen[0],w[1]-cen[1])||1,ux=(cen[0]-w[0])/dl,uz=(cen[1]-w[1])/dl;return[[w[0]-ux*2.5,w[1]-uz*2.5],[w[0]+ux*3,w[1]+uz*3]]}));
  const B=[];const addB=(x,z,r)=>{if(!isFinite(x)||!isFinite(z))return;if(B.some(b=>Math.hypot(b[0]-x,b[1]-z)<2.2))return;if(Math.hypot(x-pl[0],z-pl[1])<11)return;B.push([x,z,r])};
  inter.forEach(i=>{if(i.kind==="lot"||i.kind==="oko"||i.kind==="npc"||i.kind==="info")return;if(Math.hypot(i.x,i.z)>R0*1.25)return;addB(i.x,i.z,Math.min(3.4,Math.max(2.2,(i.r||3)*.75)))});
  FILLH.forEach(q=>addB(q[0],q[1],q[2]));SUBH.forEach(q=>addB(q[0],q[1],q[2]));
  try{((town&&town.env&&town.env.taken)||[]).forEach(t=>{if(t&&t.length>2&&t[2]>=3&&t[2]<9&&!BRX.some(q=>Math.hypot(q[0]-t[0],q[1]-t[1])<12))addB(t[0],t[1],Math.min(4.5,t[2]*.7))})}catch(e){}
  const wallHit=(a,b)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.8);for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n;if(WSOL.some(w=>Math.hypot(w[0]-x,w[1]-z)<1.15)&&!PGS.some(w=>Math.hypot(w[0]-x,w[1]-z)<2.2)&&!gates.some(w=>Math.hypot(w[0]-x,w[1]-z)<4))return true}return false};
  const wetHit=(a,b)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1);for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n;if(WET(x,z))return true;if(RVX().length>1&&!L.canal&&!ONB(x,z)){const rv=RVX();for(let j=0;j<rv.length-1;j++)if(dS(x,z,rv[j],rv[j+1])[0]<5.4)return true}}return false};
  const bldHit=(a,b,self)=>B.some(o=>o!==self&&dS(o[0],o[1],a,b)[0]<o[2]*.85)||solids.some(o=>o[2]>=1.6&&Math.hypot(o[0]-self[0],o[1]-self[1])>o[2]+self[2]&&dS(o[0],o[1],a,b)[0]<o[2]*.8);
  const near=b=>{let m=1e9;for(const rd of net)for(let i=0;i<rd.length-1;i++){const d=dS(b[0],b[1],rd[i],rd[i+1])[0];if(d<m)m=d}return m};
  const todo=B.filter(b=>near(b)>b[2]+2.6).sort((a,b)=>near(a)-near(b));const pm=M(snow?"#cfd0c8":"#b59a68",{side:T.DoubleSide}),pm2=M(snow?"#bfc0b8":"#8f7a54",{side:T.DoubleSide});
  const draw=(P,w,mat,y0)=>{const v=[],idx=[];for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)];let dx=b[0]-a[0],dz=b[1]-a[1];const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;const ww=w*(.85+.3*Math.abs(Math.sin(i*1.7)));[1,-1].forEach(o=>{const x=P[i][0]-dz*ww/2*o,z=P[i][1]+dx*ww/2*o;v.push(x,TH(x,z)+y0,z)});if(i){const k=i*2;idx.push(k-2,k,k-1,k-1,k,k+1)}}const geo=new T.BufferGeometry();geo.setAttribute("position",new T.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();const m=new T.Mesh(geo,mat);m.receiveShadow=true;g.add(m)};
  let guard=0;while(todo.length&&guard++<400){todo.sort((a,b)=>near(a)-near(b));const b=todo.shift();if(near(b)<=b[2]+2.6)continue;
   const c=[];for(const rd of net)for(let i=0;i<rd.length-1;i++){const r=dS(b[0],b[1],rd[i],rd[i+1]);c.push(r)}c.sort((x,y)=>x[0]-y[0]);let pick=null,soft=null;
   for(const r of c.slice(0,14)){if(r[0]>46)break;const dl=r[0]||1,st=[b[0]+(r[1]-b[0])/dl*b[2]*.75,b[1]+(r[2]-b[1])/dl*b[2]*.75],en=[r[1],r[2]];if(wallHit(st,en)||wetHit(st,en))continue;if(!bldHit(st,en,b)){pick=[st,en];break}
    if(!soft){for(const sg of[1,-1]){const mx=(st[0]+en[0])/2-(en[1]-st[1])/dl*4.5*sg,mz=(st[1]+en[1])/2+(en[0]-st[0])/dl*4.5*sg,md=[mx,mz];if(!bldHit(st,md,b)&&!bldHit(md,en,b)&&!wallHit(st,md)&&!wallHit(md,en)&&!wetHit(st,md)&&!wetHit(md,en)){soft=[st,md,en];break}}}}
   const way2=pick||soft;if(!way2)continue;
   const P=[];for(let i=0;i<way2.length-1;i++){const a=way2[i],e=way2[i+1],n=Math.max(2,Math.ceil(Math.hypot(e[0]-a[0],e[1]-a[1])/1.4));for(let k=i?1:0;k<=n;k++){const t=k/n,wob=Math.sin(t*Math.PI)*Math.sin((b[0]+b[1])*.7+k*.9)*.35,px2=-(e[1]-a[1]),pz2=e[0]-a[0],pl2=Math.hypot(px2,pz2)||1;P.push([a[0]+(e[0]-a[0])*t+px2/pl2*wob,a[1]+(e[1]-a[1])*t+pz2/pl2*wob])}}
   if(way2.length===3){const Q=[];for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-2)],c2=P[Math.min(P.length-1,i+2)];Q.push([(a[0]+P[i][0]*2+c2[0])/4,(a[1]+P[i][1]*2+c2[1])/4])}Q[0]=P[0];Q[Q.length-1]=P[P.length-1];P.length=0;Q.forEach(q=>P.push(q))}
   draw(P,1.75,pm2,.045);draw(P,1.2,pm,.056);net.push(P);PATHS.push(P)}
  /* sieť ciest pre mešťanov (v119): chodia po uliciach, chodníkoch, mostoch a cez bránky */
  try{const N=[],ADJ=[],hy=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]),lim=R0+55;const addN=(x,z,r)=>{N.push([x,z,r]);ADJ.push([]);return N.length-1},link=(i,j)=>{if(i<0||j<0||i===j)return;const d=hy(N[i],N[j]);ADJ[i].push([j,d]);ADJ[j].push([i,d])};
   net.forEach((rd,ri)=>{let prev=-1;for(let i=0;i<rd.length;i++){if(!i){prev=Math.hypot(rd[0][0],rd[0][1])<lim?addN(rd[0][0],rd[0][1],ri):-1;continue}const a=rd[i-1],b=rd[i],n=Math.max(1,Math.ceil(hy(a,b)/2.5));for(let k=1;k<=n;k++){const x=a[0]+(b[0]-a[0])*k/n,z=a[1]+(b[1]-a[1])*k/n;if(Math.hypot(x,z)>=lim){prev=-1;continue}const id=addN(x,z,ri);if(prev>=0&&!WET((x+N[prev][0])/2,(z+N[prev][1])/2)&&!WET(x,z)&&!WET(N[prev][0],N[prev][1]))link(prev,id);prev=id}}});
   const G=new Map(),key=(x,z)=>Math.floor(x/2.7)+","+Math.floor(z/2.7);N.forEach((q,i)=>{const k=key(q[0],q[1]);(G.get(k)||G.set(k,[]).get(k)).push(i)});
   N.forEach((q,i)=>{const cx=Math.floor(q[0]/2.7),cz=Math.floor(q[1]/2.7);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const c=G.get((cx+dx)+","+(cz+dz));if(!c)continue;for(const j of c){if(j<=i||N[j][2]===q[2])continue;const d=hy(q,N[j]);if(d>2.7)continue;if(d>.4&&(WET((q[0]+N[j][0])/2,(q[1]+N[j][1])/2)||wallHit(q,N[j])))continue;link(i,j)}}});
   {const c=addN(pl[0],pl[1],-1);N.forEach((q,i)=>{if(i!==c&&hy(q,pl)<9.7)link(c,i)})}
   const nearest=p=>{const c=[];for(let i=0;i<N.length;i++){const d=hy(p,N[i]);if(d<40)c.push([d,i])}c.sort((a,b)=>a[0]-b[0]);for(const q of c.slice(0,8)){if(q[0]<1.2||(!wetLine(p,N[q[1]])&&!wallHit(p,N[q[1]])))return q[1]}return-1};
   NAV=(a,t)=>{if(hy(a,t)<7&&!wetLine(a,t)&&!wallHit(a,t))return[t];const s0=nearest(a),e0=nearest(t);if(s0<0||e0<0)return null;const D=new Float64Array(N.length).fill(1e9),PV=new Int32Array(N.length).fill(-1),H=[[0,s0]];D[s0]=0;
    const hp=x=>{H.push(x);let i=H.length-1;while(i>0){const p2=(i-1)>>1;if(H[p2][0]<=H[i][0])break;const t2=H[p2];H[p2]=H[i];H[i]=t2;i=p2}},hq=()=>{const top=H[0],last=H.pop();if(H.length){H[0]=last;let i=0;for(;;){const l=i*2+1,r=l+1;let m=i;if(l<H.length&&H[l][0]<H[m][0])m=l;if(r<H.length&&H[r][0]<H[m][0])m=r;if(m===i)break;const t2=H[m];H[m]=H[i];H[i]=t2;i=m}}return top};let it=0;while(H.length){if(++it>60000){console.warn('3D nav: priveľa krokov',H.length,N.length);return null}const cur=hq(),u=cur[1];if(cur[0]>D[u])continue;if(u===e0)break;for(const e of ADJ[u]){const nd=cur[0]+e[1];if(nd<D[e[0]]){D[e[0]]=nd;PV[e[0]]=u;hp([nd,e[0]])}}}
    if(D[e0]>=1e9)return null;const out=[];for(let u=e0,gd=0;u>=0&&gd<N.length+2;u=PV[u],gd++)out.push(u);out.reverse();const jx=(Math.random()-.5)*.9,jz=(Math.random()-.5)*.9,R=[];out.forEach((u,i)=>{if(i&&i<out.length-1&&i%2)return;const q=N[u],on=ONB(q[0],q[1]);R.push(on||WET(q[0]+jx*2.2,q[1]+jz*2.2)||WET(q[0]-jx*2.2,q[1]-jz*2.2)?[q[0],q[1]]:[q[0]+jx,q[1]+jz])});R.push(t);return R};
   NAVN=N.length}catch(e){console.warn("3D sieť ciest",e);NAV=null}
 }catch(e){console.warn("3D chodníky",e)}
 /* ---------- zvuky mesta (v134): riadia sa nastavením zvukov hry ---------- */
 try{if(typeof SND!=="undefined"&&SND.sfx&&(window.AudioContext||window.webkitAudioContext)){const AC=window.AudioContext||window.webkitAudioContext,ac=new AC();AUD3=ac;try{ac.resume()}catch(e){}
   const out=ac.createGain();out.gain.value=.55*(window.VOLS??1);out.connect(ac.destination);
   const nb=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);{const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
   const loop=(type,f,q)=>{const n=ac.createBufferSource();n.buffer=nb;n.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const gn=ac.createGain();gn.gain.value=0;n.connect(fl);fl.connect(gn);gn.connect(out);n.start();return gn};
   const murmur=loop("bandpass",520,.8),water=loop("lowpass",850,.4),wind=loop("lowpass",300,.3);
   const tone=(type,f0,f1,dur,g,at)=>{const t0=ac.currentTime+(at||0),o=ac.createOscillator(),gn=ac.createGain();o.type=type;o.frequency.setValueAtTime(f0,t0);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t0+dur);gn.gain.setValueAtTime(0,t0);gn.gain.linearRampToValueAtTime(g,t0+.008);gn.gain.exponentialRampToValueAtTime(.0005,t0+dur);o.connect(gn);gn.connect(out);o.start(t0);o.stop(t0+dur+.05)};
   const burst=(f,dur,g,at)=>{const t0=ac.currentTime+(at||0),n=ac.createBufferSource();n.buffer=nb;const fl=ac.createBiquadFilter();fl.type="bandpass";fl.frequency.value=f;fl.Q.value=1.2;const gn=ac.createGain();gn.gain.setValueAtTime(g,t0);gn.gain.exponentialRampToValueAtTime(.0005,t0+dur);n.connect(fl);fl.connect(gn);gn.connect(out);n.start(t0,Math.random());n.stop(t0+dur+.05)};
   const clang=g2=>{tone("triangle",1850,1820,.28,g2*.5);tone("square",2760,2700,.16,g2*.16);burst(3200,.05,g2*.5)};
   const bell=g2=>[[1,1],[2,.55],[2.4,.4],[3,.25],[4.2,.14]].forEach(q=>tone("sine",196*q[0],196*q[0],3.2/Math.sqrt(q[0]),g2*q[1]*.5));
   const bark=g2=>[0,.19].forEach(at=>{tone("sawtooth",430,250,.11,g2*.4,at);burst(900,.09,g2*.35,at)});
   const owl=g2=>{tone("sine",392,370,.32,g2*.5);tone("sine",392,350,.55,g2*.5,.5)};
   const chirp=g2=>{const f=2600+Math.random()*1400;[0,.11,.22].forEach((at,k)=>tone("sine",f*(1+k*.08),f*1.35,.07,g2*.3,at))};
   const saw=g2=>burst(1500,.22,g2*.3),tap=g2=>tone("triangle",3300,3200,.07,g2*.3);
   const att=(d,R)=>{const v=Math.max(0,1-d/R);return v*v},wp=L.canal?(L.canals||[]).reduce((a,c)=>a.concat((c||[]).map(wx)),[]):RVX();
   const ch=inter.find(i=>/^Kostol/.test(i.text)),sm=DBG.cr.filter(c=>c[0]==="kovac"||c[0]==="tesar"||c[0]==="zlatnik"||c[0]==="bana").map(c=>({c,p:0}));
   /* kroky podľa povrchu (v135) */
   const rdP=[];(L.streets||[]).map(q=>q.map(wx)).concat(L.ring&&L.ring.length>2?[L.ring.concat([L.ring[0]]).map(wx)]:[]).forEach(rd=>{for(let i=0;i<rd.length-1;i++){const a=rd[i],b=rd[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.4));for(let k=0;k<n;k++)rdP.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n])}});
   const lpB=(f,dur,g2)=>{const t0=ac.currentTime,n=ac.createBufferSource();n.buffer=nb;const fl=ac.createBiquadFilter();fl.type="lowpass";fl.frequency.value=f;const gn=ac.createGain();gn.gain.setValueAtTime(g2,t0);gn.gain.exponentialRampToValueAtTime(.0005,t0+dur);n.connect(fl);fl.connect(gn);gn.connect(out);n.start(t0,Math.random());n.stop(t0+dur+.05)};
   const stepS=(X,Z)=>{const v=.8+Math.random()*.4;if(room){tone("triangle",150*v,95,.09,.2);lpB(500,.06,.12);return}if(ONB(X,Z)){tone("triangle",210*v,140,.07,.16);burst(1300,.04,.1);return}if(snow){burst(2300*v,.13,.11);lpB(900,.1,.1);return}
     if(Math.hypot(X-pl[0],Z-pl[1])<10.5||rdP.some(q=>Math.abs(q[0]-X)<1.7&&Math.abs(q[1]-Z)<1.7)){burst(1700*v,.035,.13);tone("triangle",260*v,180,.04,.07);return}lpB(650*v,.09,.16)};
   let sx0=null,sz0=0,sAcc=0;
   let nBell=6+Math.random()*20,nOwl=5+Math.random()*10,nChirp=3,nBark=8,wt=0,wd=99;
   life.push((dt,t)=>{if(!AUD3||ac.state!=="running"){try{ac.resume()}catch(e){}return}const now=ac.currentTime,X=me.position.x,Z=me.position.z,k=room?.12:1;out.gain.setTargetAtTime(.55*(window.VOLS??1)*(room?.5:1),now,.2);if(sx0!==null){const d=Math.hypot(X-sx0,Z-sz0);if(d<2.5){sAcc+=d;if(sAcc>1.2){sAcc=0;stepS(X,Z)}}else sAcc=0}sx0=X;sz0=Z;
    murmur.gain.setTargetAtTime(!night&&!ev.plague?k*att(Math.hypot(X-pl[0],Z-pl[1]),40)*.42*(.8+.2*Math.sin(t*1.7)):0,now,.3);if(room){water.gain.setTargetAtTime(0,now,.3);wind.gain.setTargetAtTime(.01,now,.3);return}
    wt-=dt;if(wt<=0){wt=.4;wd=99;for(const q of wp){const d=Math.hypot(q[0]-X,q[1]-Z);if(d<wd)wd=d}}water.gain.setTargetAtTime(snow?0:att(wd,24)*.3,now,.4);
    wind.gain.setTargetAtTime((night?.05:.025)+(snow?.05:0)+Math.max(0,Math.hypot(X,Z)-R0)*.0008,now,.6);
    for(const o of sm){const c=o.c,sp=c[0]==="kovac"?7:c[0]==="tesar"?5:c[0]==="zlatnik"?11:3.2,v=Math.sin(t*sp+c[3]),d=Math.hypot(c[1]-X,c[2]-Z);if(d<26&&o.p>0&&v<=0){const g2=att(d,26);if(c[0]==="kovac")clang(g2);else if(c[0]==="tesar")saw(g2);else if(c[0]==="zlatnik"){if(Math.random()<.5)tap(g2)}else{burst(700,.12,g2*.6);tone("triangle",900,500,.1,g2*.3)}}o.p=v}
    if(!night&&ch&&t>nBell){nBell=t+45+Math.random()*50;bell(.25+.75*att(Math.hypot(ch.x-X,ch.z-Z),90))}
    if(night&&t>nOwl){nOwl=t+14+Math.random()*22;owl(.5)}
    if(!night&&!snow&&t>nChirp){nChirp=t+3+Math.random()*9;chirp(.35+Math.random()*.4)}
    if(t>nBark){nBark=t+7+Math.random()*16;let bd=99;for(const o of WK)if(o.dog&&o.g.visible){const d=Math.hypot(o.g.position.x-X,o.g.position.z-Z);if(d<bd)bd=d}if(bd<30)bark(att(bd,30))}});
   DBG.audio=1}}catch(e){console.warn("3D zvuky",e)}
 const dryStep=(x0,z0,x1,z1)=>!WET(x1,z1)||WET(x0,z0)?[x1,z1]:!WET(x1,z0)?[x1,z0]:!WET(x0,z1)?[x0,z1]:[x0,z0];
 legLights(scene);
 /* zlúčenie (v256): po 2 s sa nehybné objekty s rovnakým vzhľadom spoja do jedného – grafická karta ich kreslí naraz */
 const MRG={done:false,snap:null,saved:0,groups:0};const TXID=new WeakMap();let TXN=0;const txId=t=>{if(!t)return 0;const im=t.image||t;if(!TXID.has(im))TXID.set(im,++TXN);return TXID.get(im)};
 const mergeStatic=()=>{const inv=new T.Matrix4().copy(g.matrixWorld).invert(),groups=new Map(),anim=new Set();try{WAT.forEach(w=>anim.add(w[0]));if(WAT0)anim.add(WAT0);if(riverM&&riverM.material)anim.add(riverM.material.map)}catch(e){}
  MRG.snap.forEach((m0,o)=>{if(o.parent!==g||!o.visible||!o.matrixWorld.equals(m0))return;const m=o.material;if(!m||Array.isArray(m)||m.alphaMap||m.emissiveMap||m.transparent||m.vertexColors||m.isShaderMaterial||m.alphaTest)return;if(m.map&&anim.has(m.map))return;
   const ga=o.geometry.attributes;if(!ga.position||!ga.normal)return;const uv=!!ga.uv;if(m.map&&!uv)return;
   const key=[m.type,m.color?m.color.getHex():0,m.side,m.flatShading?1:0,m.emissive?m.emissive.getHex():0,m.emissiveIntensity,m.shininess,m.opacity,m.map?txId(m.map)+":"+m.map.repeat.x+":"+m.map.repeat.y+":"+m.map.offset.x+":"+m.map.offset.y+":"+m.map.wrapS:"-",o.castShadow?1:0,o.receiveShadow?1:0,uv?1:0].join("|");
   let L2=groups.get(key);if(!L2)groups.set(key,L2=[]);L2.push(o)});
  const mtx=new T.Matrix4(),nm=new T.Matrix3(),v=new T.Vector3();
  groups.forEach(list=>{if(list.length<2)return;const uv=!!list[0].geometry.attributes.uv;let nv=0,ni=0;list.forEach(o=>{const gg=o.geometry;nv+=gg.attributes.position.count;ni+=gg.index?gg.index.count:gg.attributes.position.count});if(!GL2&&nv>65000)return;
   const Pp=new Float32Array(nv*3),Nn=new Float32Array(nv*3),Uu=uv?new Float32Array(nv*2):null,Ii=nv>65000?new Uint32Array(ni):new Uint16Array(ni);let vo=0,io=0;
   list.forEach(o=>{const gg=o.geometry,pa=gg.attributes.position,na=gg.attributes.normal,ua=gg.attributes.uv;mtx.multiplyMatrices(inv,o.matrixWorld);nm.getNormalMatrix(mtx);
    for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(mtx);Pp[(vo+i)*3]=v.x;Pp[(vo+i)*3+1]=v.y;Pp[(vo+i)*3+2]=v.z;v.fromBufferAttribute(na,i).applyMatrix3(nm).normalize();Nn[(vo+i)*3]=v.x;Nn[(vo+i)*3+1]=v.y;Nn[(vo+i)*3+2]=v.z;if(Uu){Uu[(vo+i)*2]=ua.getX(i);Uu[(vo+i)*2+1]=ua.getY(i)}}
    if(gg.index){const ia=gg.index.array;for(let k=0;k<ia.length;k++)Ii[io+k]=ia[k]+vo;io+=ia.length}else{for(let k=0;k<pa.count;k++)Ii[io+k]=vo+k;io+=pa.count}vo+=pa.count});
   const geo=new T.BufferGeometry();geo.setAttribute("position",new T.BufferAttribute(Pp,3));geo.setAttribute("normal",new T.BufferAttribute(Nn,3));if(Uu)geo.setAttribute("uv",new T.BufferAttribute(Uu,2));geo.setIndex(new T.BufferAttribute(Ii,1));geo.computeBoundingSphere();
   const mm=new T.Mesh(geo,list[0].material);mm.castShadow=list[0].castShadow;mm.receiveShadow=list[0].receiveShadow;mm.userData.merged=list.length;mm.renderOrder=list[0].renderOrder;g.add(mm);list.forEach(o=>g.remove(o));MRG.saved+=list.length-1;MRG.groups++});
  for(let i=LODL.length-1;i>=0;i--)if(!LODL[i].o.parent)LODL.splice(i,1)};
 const LODL=[],LODV=new T.Vector3();let LODF=0;try{g.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!o.geometry)return;for(let q=o;q;q=q.parent)if(q===me)return;if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();const bs=o.geometry.boundingSphere;if(!bs)return;
   o.updateMatrixWorld(true);const sc=Math.max(Math.abs(o.matrixWorld.elements[0]),Math.abs(o.matrixWorld.elements[5]),Math.abs(o.matrixWorld.elements[10]))||1,r=bs.radius*sc;if(r>2.2||!isFinite(r))return;LODL.push({o,r})})}catch(e){console.warn("3D LOD",e)}
 st={root,renderer,scene,post,raf:0,near:null,off:()=>{removeEventListener("keydown",onKey,true);removeEventListener("keyup",onUp,true);removeEventListener("mousemove",onMove);removeEventListener("mouseup",onEnd);removeEventListener("resize",onRes)}};
 window.__m3={scene:()=>scene,npc:(c,o)=>NPC3?NPC3(c,o):null,chkActs:()=>{const L2=inter.filter(it=>(it.kind==="npc"||it.kind==="stall")&&it.act),pr=L2.filter(it=>/^(Objednávateľ|Hlásnik)/.test(it.text));return pr.concat(L2.filter(it=>!pr.includes(it)).slice(0,14)).map(it=>({text:it.text,act:it.act}))},chk:()=>({inter:inter.map(it=>({x:it.x,z:it.z,r:it.r,text:typeof it.text==="string"?it.text:"",kind:it.kind||"",act:!!it.act})),lotb:LOTB.slice(),solids:solids.slice(),nav:NAV,p:[px,pz],cid,lots:S.lots.filter(l=>L.pos[l.id]).length,room:!!room}),close:()=>close(),ren:()=>renderer,lod:()=>({n:LODL.length,far:LODL.filter(it=>it.o.layers.mask===2).length,drl:DRL,merged:MRG.saved,mgroups:MRG.groups,done:MRG.done}),go:(x,z,y)=>{px=x;pz=z;if(y!=null)yaw=y},post:()=>post,sun:()=>sun,rows:()=>({n:ROWH.length,h:ROWH,p:[px,pz],paths:PATHS}),gates,cen,zoom:(d2,p2,hide)=>{dist=d2;pitch=p2;me.visible=!hide},dress:(list,back)=>{const p0=P(),o0=p0.outfit,t0=p0.tailor;const made=[];list.forEach((o,i)=>{let offS=null;try{p0.outfit=Object.assign({},o0,o.o||{});p0.tailor=o.t||{};if(o.look){p0.head.__l=p0.head.look;p0.head.look=Object.assign({},p0.head.look,o.look)}if(o.age){p0.head.__a=p0.head.age;p0.head.age=o.age}if(o.off){offS=CITY(p0.city).off[o.off];offS.__h=offS.h;offS.h=p0.id}const m=person(p0,"head",true,o.fem==null?undefined:o.fem);m.position.set(px+(i-(list.length-1)/2)*1.15,TH(px,pz),pz+3.2);m.rotation.y=back?0:Math.PI;scene.add(m);made.push(m)}catch(e){console.warn("dress",e&&e.stack||e)}finally{if(p0.head.__l){p0.head.look=p0.head.__l;delete p0.head.__l}if(p0.head.__a){p0.head.age=p0.head.__a;delete p0.head.__a}if(offS){offS.h=offS.__h;delete offS.__h}}});p0.outfit=o0;p0.tailor=t0;window.__dr=(window.__dr||[]).concat(made);return made.length},labs:()=>{const L=[];for(let r=0;r<6;r++){L.push(["Ján · rod Bielik","#2f5bb0",{k:"person",r}]);L.push(["Kováčska dielňa "+["","II","III","IV","V","V"][r],"#b8362c",{k:"bld",r}])}[["Radnica",null,{k:"pub"}],["Kamenný most rodu","#2f5bb0",{k:"pub"}],["Sídlo tvojho rodu","#2f5bb0",{k:"seat",r:4}],["Rod Pálfi","#7a1f2b",{k:"seat",r:1}],["Kuchárka",null,{k:"npc"}],["Mestský pisár",null,{k:"npc"}],["Spálňa",null,{k:"note"}],["Správa dielne",null,{k:"note"}],["Pivo a víno","#7a2740",{k:"stall"}],["Jarmok",null,{k:"event"}],["Mor v meste",null,{k:"event"}],["Vinica na svahu",null,{}]].forEach(q=>L.push(q));L.forEach((q,i)=>{const sp=label(q[0],q[1],.5,q[2]);sp.position.set(px-5.5+(i%4)*3.7,TH(px,pz)+5.6-Math.floor(i/4)*.95,pz+6);scene.add(sp)});return L.length},fast:()=>{try{renderer.shadowMap.enabled=false;renderer.setPixelRatio(.5);postOn=false;scene.traverse(o=>{if(o.isLight&&o.castShadow)o.castShadow=false;if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true)}})}catch(e){return String(e)}return'ok'},undress:()=>{(window.__dr||[]).forEach(m=>scene.remove(m));window.__dr=[]},calls:()=>renderer.info.render.calls,look:y=>{yaw=y},cam:()=>[cam.position.x,cam.position.y,cam.position.z,camD],go:(x,z)=>{px=x;pz=z},wet:(x,z)=>WET(x,z),step:(a,b,c,d)=>dryStep(a,b,c,d),brs:()=>BRX.map(q=>[q.a,q.b]),wg:()=>WG,sol:()=>solids,dbg:()=>DBG,wk:()=>WK.map(o=>[o.g.position.x,o.g.position.z,o.guard?1:0,o.g.visible?1:0]),ph:()=>ph,pick:n=>{const c={};for(let i=0;i<n;i++){const k=pickT({home:null}).k||'any';c[k]=(c[k]||0)+1}return c},nav:(a,t)=>NAV?NAV(a,t):null,navn:()=>NAVN,paths:()=>PATHS,lmv:()=>LMV,pg:()=>PGS,lm:()=>BRX.filter(q=>q.lm).map(q=>[q.a,q.b]),scene:()=>scene,har:()=>{try{const o=PRIK();return[o.W(0,16),o.W(0,6),o.W(-9,9),o.W(9,10)]}catch(e){return null}},plan:(a,t)=>planWay(a,t),way:()=>way,fam:()=>BRX.filter(q=>q.fam).map(q=>[q.a,q.b]),brh:(x,z)=>BRH(x,z),onb:(x,z)=>ONB(x,z),pos:()=>[px,pz],inter,enter:(k,o)=>enter(k,o||{}),leave:()=>leave(),room:()=>room};
 let last=performance.now(),tw=0;
 function frame(now){
  if(!st)return;st.raf=requestAnimationFrame(frame);FPSN++;renderer.info.reset();if(now-sigT>700){{const fe=root.querySelector(".m3fps");if(sigT){const fv=Math.round(FPSN*1000/(now-sigT));try{DRS(fv)}catch(e){}if(fe)fe.textContent=fv+" fps · kvalita "+["nízka","stredná","vysoká"][QLV]+(DRL?" · rozlíšenie "+Math.round(PRS[DRL]/PRS[0]*100)+" %":"")+" (Q)"}}FPSN=0;sigT=now;const md=document.getElementById("modal");hudUp();{const nv=root.querySelector(".m3nav");if(nv)nv.style.visibility=room?"hidden":""}if(!room&&pn.hidden&&(!md||md.hidden)&&sig()!==sig0){if(S.ci!==cid){close();return}REST={c:cid,px,pz,yaw,pitch,dist};close();setTimeout(()=>{try{A.m3d()}catch(e){}},30);return}}const dt=Math.max(0,Math.min(.05,(now-last)/1e3));last=now;tw+=dt;
  const modal=!!document.querySelector("#modal:not([hidden])");
  if(riverM&&riverM.material.map&&!snow)riverM.material.map.offset.x=-tw*.06;for(const w2 of WAT){w2[0].offset.x=-tw*w2[1]-Math.sin(tw*.5)*.02;w2[0].offset.y=tw*w2[2]}if(WAT0&&!snow){WAT0.offset.x=Math.sin(tw*.25)*.08;WAT0.offset.y=tw*.012}
  for(const o of smokes){o.t=(o.t+dt*.16)%1;o.s.position.set(o.q[0]+o.t*1.6,o.q[1]+o.t*4.5,o.q[2]+o.t*.5);const k2=.5+o.t*2.2;o.s.scale.set(k2,k2,1);o.s.material.opacity=.5*(1-o.t)}
  for(const o of boats){o.t=(((o.t+dt*o.v)%1)+1)%1;const fi=o.t*(o.rv.length-1),i0=Math.floor(fi),a=o.rv[i0],b=o.rv[Math.min(o.rv.length-1,i0+1)],u=fi-i0;o.g.position.set(a[0]+(b[0]-a[0])*u,.05+Math.sin(tw*2+o.t*40)*.04,a[1]+(b[1]-a[1])*u);o.g.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0])}
  let f=0,sd=0;if(!modal&&!pfn){if(keys.has("w")||keys.has("arrowup"))f+=1;if(keys.has("s")||keys.has("arrowdown"))f-=1;if(keys.has("a")||keys.has("arrowleft"))sd-=1;if(keys.has("d")||keys.has("arrowright"))sd+=1}
  const sp=(keys.has("shift")?9:4.6)*dt,moving=f||sd;
  if(moving){const fx=Math.sin(yaw),fz=Math.cos(yaw);let nx=px+(fx*f-fz*sd)*sp,nz=pz+(fz*f+fx*sd)*sp;
   for(const s of (room?room.solids:solids)){const dx=nx-s[0],dz=nz-s[1],dd=Math.hypot(dx,dz),r=s[2]+.4;if(dd<r&&dd>.001){nx=s[0]+dx/dd*r;nz=s[1]+dz/dd*r}}
   if(room){nx=Math.max(-room.w/2+.5,Math.min(room.w/2-.5,nx));nz=Math.max(-room.d/2+.5,Math.min(room.d/2-.5,nz))}else{const lim=Math.max(R0*1.9,R1);const dl=Math.hypot(nx,nz);if(dl>lim){nx*=lim/dl;nz*=lim/dl}}
   if(!room){const q=dryStep(px,pz,nx,nz);nx=q[0];nz=q[1]}
   if(nx!==px||nz!==pz)turnY(me,Math.atan2(nx-px,nz-pz),dt);px=nx;pz=nz}
  const hy=room?0:TH(px,pz)+BRH(px,pz);me.position.set(px,hy,pz);PLP[0]=px;PLP[1]=pz;stride(me,moving,tw,keys.has("shift")?12:9);
  /* rody na ulici */
  if(room){for(const f of ROOML){try{f(dt,tw)}catch(e){}}}
  if(!room){for(const f of life){try{f(dt,tw)}catch(e){}}for(let i=0;i<FLAGS.length;i++){const fm2=FLAGS[i],pa=fm2.geometry.attributes.position;for(let k=0;k<pa.count;k++){const u=pa.getX(k);pa.setZ(k,Math.sin(tw*5-u*4+i)*.09*u)}pa.needsUpdate=true;fm2.rotation.y=Math.sin(tw*.6+i)*.25}}
  if(!room)for(const o of folk){const idle=o.wait>0||Math.hypot(o.g.position.x-px,o.g.position.z-pz)<2.4;stride(o.g,!idle,tw,7);for(const fl of o.fol)stride(fl.g,!idle,tw,8);if(o.wait>0){o.wait-=dt;continue}const dx=o.t[0]-o.g.position.x,dz=o.t[1]-o.g.position.z,dd=Math.hypot(dx,dz);
   const nearMe=Math.hypot(o.g.position.x-px,o.g.position.z-pz)<2.4;
   if(nearMe){o.g.rotation.y=Math.atan2(px-o.g.position.x,pz-o.g.position.z);continue}
   if(dd<.6){if(o.q&&o.q.length){o.t=o.q.shift();continue}let r=null,pk=null;const here=[o.g.position.x,o.g.position.z];for(let k=0;k<6&&!r;k++){pk=pickT(o);r=planWay(here,pk.t)}o.wait=waitOf(o.k);if(r){o.t=r[0];o.q=r.slice(1);o.k=pk.k}continue}
   {const av=avoid(o.g,dx/dd,dz/dd);o.g.position.x+=av[0]*o.v*av[2]*dt;o.g.position.z+=av[1]*o.v*av[2]*dt;o.g.position.y=BRH(o.g.position.x,o.g.position.z);turnY(o.g,Math.atan2(av[0],av[1]),dt)};
   for(const fl of o.fol){const tx2=o.g.position.x-dx/dd*fl.o+dz/dd*(fl.o>1?.5:-.5),tz2=o.g.position.z-dz/dd*fl.o-dx/dd*(fl.o>1?.5:-.5);fl.g.position.x+=(tx2-fl.g.position.x)*Math.min(1,dt*3);fl.g.position.z+=(tz2-fl.g.position.z)*Math.min(1,dt*3);fl.g.position.y=BRH(fl.g.position.x,fl.g.position.z);fl.g.rotation.y=o.g.rotation.y}}
  /* kamera */
  if(fp){cam.position.set(px,hy+1.75,pz);cam.lookAt(px+Math.sin(yaw)*10,hy+1.75-Math.sin(pitch-.3)*10,pz+Math.cos(yaw)*10)}
  else{const cy=Math.cos(pitch),sy=Math.sin(pitch);let dd=dist;
   if(!room&&dist<40){const hx=-Math.sin(yaw)*cy,hz=-Math.cos(yaw)*cy;scan:for(let t=1;t<=dist;t+=.4){const qx=px+hx*t,qz=pz+hz*t,qy=1.6+sy*t;if(qy>9.5)break;for(const s2 of solids){const lim=s2[2]<1?5.8:s2[2]<2.5?7:9.5;if(qy>lim)continue;const rr=Math.max(.7,s2[2]*.9);if(Math.abs(s2[0]-qx)<rr&&Math.abs(s2[1]-qz)<rr&&Math.hypot(s2[0]-qx,s2[1]-qz)<rr&&Math.hypot(s2[0]-px,s2[1]-pz)>rr){dd=Math.max(1.4,t-.9);break scan}}}}
   camD=camD==null?dd:dd<camD?dd:camD+(dd-camD)*.12;const d3=room?dist:camD;cam.position.set(px-Math.sin(yaw)*cy*d3,hy+1.6+sy*d3,pz-Math.cos(yaw)*cy*d3);if(!room){const ch=TH(cam.position.x,cam.position.z)+.7;if(cam.position.y<ch)cam.position.y=ch}cam.lookAt(px,hy+1.5,pz)}
  if(!night&&!room){const k=Math.min(1,tw/420),ang=-.1+k*.42,c=Math.cos(ang),s2=Math.sin(ang);SUND.set(SUN0.x*c-SUN0.z*s2,Math.max(.12,SUN0.y+(ph===0?.14:ph===2?-.12:0)*k),SUN0.x*s2+SUN0.z*c).normalize();try{if(post&&post.mood)post.mood({sun:SUND})}catch(e){}}
  if(!room){shadowAt(px,pz,dist>60);if(post&&post.u)post.u.hs.value=Math.max(18,dist*1.15+8)}
  {const fn=wxS==="hmla"?.12:1,ff=wxS==="hmla"?.2:wxS==="dazd"?.7:wxS==="sneh"?.6:1;scene.fog.near=(60+dist*2.2)*fn;scene.fog.far=(210+dist*5)*ff}
  /* čo je nablízku */
  let best=null,bd=1e9;for(const it of (room?room.inter:inter)){const d0=Math.hypot(it.x-px,it.z-pz),dd=d0-(it.kind==="stall"?50:0);if(d0<it.r&&dd<bd){bd=dd;best=it}}
  if(best!==st.near){st.near=best;if(best){hint.hidden=false;hint.innerHTML=best.act?`<b>E</b> ${best.text}`:best.text;hint.classList.toggle("info",!best.act)}else hint.hidden=true}
  const wp=new T.Vector3();for(const lb of LABELS){lb.getWorldPosition(wp);const dl=wp.distanceTo(cam.position);lb.visible=room?true:lb.userData.hi?dist>80:dist>80?(lb.scale.x>7):dl<70&&dl>9;if(dist>80){/* z výšky väčšie štítky */}}
  if(!room&&!MRG.done){if(!MRG.snap&&tw>.4){MRG.snap=new Map();g.children.forEach(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.geometry&&!FLAGS.includes(o)&&o!==riverM)MRG.snap.set(o,o.matrixWorld.clone())})}
   else if(MRG.snap&&tw>2.2){MRG.done=true;try{if(QLV>=0)mergeStatic()}catch(e){console.warn("3D zlúčenie",e)}MRG.snap=null}}
  if(!room&&LODL.length&&(++LODF%6===0)){const cp=cam.position,hi=dist>60;for(const it of LODL){const o=it.o;LODV.setFromMatrixPosition(o.matrixWorld);const far=hi?it.r<.9:LODV.distanceTo(cp)>48+it.r*30;o.layers.set(far?1:0)}}
  if(post&&postOn){try{post.room=!!room;post.tint(room?(night?[1.12,.97,.78]:[1.04,1,.95]):(night?[.82,.9,1.12]:ph===2?[1.07,.96,.86]:ph===0?[1.04,.99,.94]:[1.02,1,.97]));post.render(room?room.scene:scene,cam);if(postChk<3){postChk++;const gl=renderer.getContext(),bb=new Uint8Array(4);let sm=0;for(let i=1;i<4;i++)for(let j=1;j<4;j++){gl.readPixels(Math.floor(gl.drawingBufferWidth*i/4),Math.floor(gl.drawingBufferHeight*j/4),1,1,gl.RGBA,gl.UNSIGNED_BYTE,bb);sm+=bb[0]+bb[1]+bb[2]}if(sm===0){console.warn("3D vzhľad: čierny obraz, vypínam");post=null;renderer.render(room?room.scene:scene,cam)}}}catch(e){console.warn("3D vzhľad",e);post=null;renderer.setRenderTarget(null)}}else renderer.render(room?room.scene:scene,cam)}
 canvas.style.cursor="grab";st.raf=requestAnimationFrame(frame);
}
function close(){try{if(AUD3){AUD3.close();AUD3=null}}catch(e){}if(!st)return;try{cancelAnimationFrame(st.raf);st.off();st.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}});try{if(st.post)st.post.dispose()}catch(e){}st.renderer.dispose();try{st.renderer.forceContextLoss()}catch(e){}st.root.remove()}catch(e){}st=null;try{render()}catch(e){}}

/* ---------- tlačidlo pri mape (len počítač) ---------- */
{const o=window.render;window.render=function(){const r=o.apply(this,arguments);try{if(hasS()&&desk()&&S.view==="mesto"){const ms=document.querySelector(".mapsheet");if(ms&&!ms.querySelector(".m3btn")){const b=document.createElement("button");b.type="button";b.className="btn pri m3btn";b.dataset.a="m3d";b.textContent="🚶 Prejsť sa mestom v 3D (prototyp)";const ref=ms.querySelector(".map");if(ref)ref.before(b);else ms.appendChild(b)}}}catch(e){}return r}}
const css=document.createElement("style");css.textContent=`
#m3d{position:fixed;inset:0;z-index:55;background:#1a120a}
#m3d .m3fps{font:600 12px Georgia,serif;font-style:normal;color:#f3e2b0;opacity:.75;margin:0 10px;white-space:nowrap}
body:has(#m3d) #ktip,body:has(#m3d) #jtipq,body:has(#m3d) #advp,body:has(#m3d) #jtop,body:has(#m3d) #tokstrip{display:none!important}
#m3d canvas{display:block;width:100%;height:100%}
#m3d .m3top{position:absolute;left:14px;right:14px;top:12px;display:flex;gap:12px;align-items:center;color:#f4ead0;font-family:"Almendra SC","EB Garamond",Georgia,serif;text-shadow:0 1px 3px #000}
#m3d .m3nav{position:absolute;right:14px;bottom:14px;display:flex;flex-direction:column;align-items:flex-end;gap:8px;pointer-events:none;z-index:2}#m3d .m3nav>*{pointer-events:auto}#m3d .m3mini{border:3px solid #f4ead0;border-radius:8px;overflow:hidden;box-shadow:0 3px 12px #000a;line-height:0}#m3d .m3mini canvas{display:block;width:190px;height:190px}#m3d .m3tasks{max-width:330px;background:rgba(244,234,208,.95);border:2px solid #b08a3a;border-radius:8px;padding:6px 8px;color:#2b2117;font-family:Georgia,serif;font-size:.82rem;display:flex;flex-direction:column;gap:4px}#m3d .m3task{display:flex;gap:6px;align-items:flex-start;text-align:left;background:#fff8e4;border:1px solid #c9b07a;border-radius:6px;padding:4px 6px;cursor:pointer;font:inherit;color:inherit}#m3d .m3task:hover{background:#ffeebc}#m3d .m3task i{font-style:normal;flex:0 0 auto}#m3d .m3places{position:fixed;right:14px;top:58px;width:260px;max-height:70vh;overflow:auto;background:rgba(244,234,208,.97);border:2px solid #b08a3a;border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:4px;color:#2b2117;font-family:Georgia,serif}#m3d .m3places h4{margin:6px 0 0;font-size:.85rem;color:#6b4a0a}#m3d .m3places .btn{text-align:left}#m3d .m3phd{display:flex;justify-content:space-between;align-items:center}body:has(#m3d .m3panel:not([hidden])) #m3d .m3nav{display:none}#m3d .m3hud{font-style:normal;font-family:Georgia,serif;background:rgba(26,18,10,.6);padding:3px 10px;border-radius:6px}#m3d .m3top b{font-size:1.5rem}#m3d .m3top span{flex:1 1 auto;opacity:.9}
@media(max-width:999px){#m3d .m3top{flex-wrap:wrap;gap:6px;row-gap:4px}#m3d .m3help{right:14px;font-size:.76rem;padding:4px 8px}#m3d .m3mini canvas{width:120px;height:120px}#m3d .m3tasks{display:none}}#m3d .m3help{position:absolute;left:14px;bottom:12px;background:#1a120acc;color:#f4ead0;padding:6px 12px;border-radius:8px;font-size:.9rem}
#m3d .m3help b{color:#e3be4f}
#m3d .m3hint{position:absolute;left:50%;bottom:64px;transform:translateX(-50%);background:#fff6dcf2;color:#2b2117;border:2px solid #b8862b;border-radius:10px;padding:10px 18px;font-size:1.1rem;cursor:pointer;box-shadow:0 4px 14px #0008}
#m3d .m3hint b{display:inline-block;background:#2b2117;color:#f4ead0;border-radius:5px;padding:0 8px;margin-right:8px}
#m3d .m3hint.info{cursor:default;opacity:.92}
.m3btn{margin:6px 0 8px}
#m3d .m3panel{position:absolute;right:16px;top:64px;max-height:calc(100% - 128px);width:min(560px,46vw);background:#f6ecd2f7;color:#2b2117;border:2px solid #b8862b;border-radius:10px;padding:14px 16px;box-shadow:0 8px 28px #000a;display:flex;flex-direction:column;font-family:"EB Garamond",Georgia,serif}@media(max-width:999px){#m3d .m3panel{width:min(560px,calc(100vw - 24px));right:12px;top:92px;max-height:calc(100% - 170px)}}
#m3d .m3panel[hidden]{display:none}
#m3d .m3panel h3{margin:0 90px 4px 0;font-family:"Almendra SC","EB Garamond",Georgia,serif;font-size:1.4rem}
#m3d .m3px{position:absolute;right:12px;top:12px}
#m3d .m3money{margin:0 0 8px}
#m3d .m3rad td{white-space:normal}.m3rad .sheet{margin:8px 2px;box-shadow:none}.m3rad h2,.m3rad h3{font-size:1.15rem;margin:0 0 4px}.m3rad .row{flex-wrap:wrap}.m3scroll{flex:1 1 auto;overflow:auto;border-top:1px solid #8a6a3a55;border-bottom:1px solid #8a6a3a55}
#m3d .m3panel table{width:100%;border-collapse:collapse;font-size:.95rem}
#m3d .m3panel th{position:sticky;top:0;background:#ecdcb4;text-align:left;padding:4px 6px;font-weight:600}
#m3d .m3panel td{padding:4px 6px;border-top:1px solid #8a6a3a33;white-space:nowrap}
#m3d .m3panel td small{display:block;opacity:.7;font-size:.8rem}
#m3d .m3panel td.n{text-align:right;font-variant-numeric:tabular-nums}
#m3d .m3panel td .btn{margin-right:4px;padding:2px 8px}
#m3d .m3note{margin:8px 0 0;font-size:.9rem}
#m3d .m3dl{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;margin:6px 0 12px}#m3d .m3dl dt{opacity:.75}#m3d .m3dl dd{margin:0;font-weight:600}
#m3d .m3btns{display:flex;gap:8px;flex-wrap:wrap}
#m3d .m3say{font-style:italic;font-size:1.1rem;margin:6px 0 12px}
#m3d .m3news{margin:0 0 10px;padding-left:18px;max-height:46vh}#m3d .m3news li{margin:5px 0;line-height:1.35}
body:has(#m3d) .toast{z-index:70}
`;document.head.appendChild(css);
})();

;
