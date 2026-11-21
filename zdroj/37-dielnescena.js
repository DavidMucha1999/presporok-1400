/* ==== js/dielnescena.js ==== */
/* Prešporok 1400 – Obchod ako scény cez celé okno (v2): Dielne = ulica s dielňami rodu, dielňami iných rodov a voľnou parcelou;
   Rod = rodová sieň (rozcestník rodu: portréty, rodokmeň, krb s erbom, schodisko, služobníctvo, predkovia);
   Karavány = brána mesta s vozovým dvorom, cestou s karavánami, rozcestníkom, prístavom a lombardom;
   Krajčír = dielňa krajčíra, klobučníka a zlatníka (zrkadlo s postavou, látky, klobúky, šperky, obuv, zbrane, sedlo, figuríny salónu);
   Založenie rodu = panoráma, maliarsky stojan s náhľadom rodu a formulár v krokoch;
   Hlavné menu = živá panoráma Prešporka roku 1400 (čas a obdobie podľa skutočných hodín);
   Ponuka = pracovňa hlavy rodu (Esc); Nastavenia v záložkách;
   Prehľad mesta = pergamenový panel s kartami nad mapou mesta (namiesto tmavej zásuvky);
   Denník a Kronika = pisáreň kronikára (pult s kronikou, pergamen s cieľmi, knižnica, noviny), otvára sa nad aktuálnou záložkou;
   Porovnanie cien = portolánová mapa Európy s cenovými pečaťami a najlepšou obchodnou cestou;
   Trh = námestie s radnicou, Rolandovou studňou a stánkami (stánok = skupina tovaru, šípka = vývoj cien).
   Vpravo pergamenový panel s pôvodnými kartami hry, takže všetky akcie fungujú. „Všetky podrobnosti“ vráti pôvodné rozloženie.
   Autor a vývojár: Dávid Mucha. */
(function(){
"use strict";
const K=window.KSH;
if(!K||typeof ISO!=="function"||typeof KSCENE!=="object"||typeof KFIG2!=="object")return;
const W=1920,H=1080,OX=780,OY=575,GAP=10.5,ROWC=1.5,HOR=-26;
const IU=ISO({W,H,s:17,ox:OX,oy:OY,seed:44}),IT=ISO({W,H,s:22,ox:OX,oy:540,seed:45});let I=IU;
const SLOTS=[0,1,-1,2,-2,3,-3,4,-4,5,-5,6,-6];
const hasS=()=>{try{return !!S&&!!S.dyn&&!S.over}catch(e){return false}};
const pref=()=>{try{return localStorage.getItem("p1400dsc")!=="0"}catch(e){return true}};
const setPref=v=>{try{localStorage.setItem("p1400dsc",v?"1":"0")}catch(e){}};
const hbPref=()=>{try{return localStorage.getItem("hbOn")!=="0"}catch(e){return true}};
const desk=()=>true;
const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const q=s=>document.querySelector(s);
const txt=e=>e?e.textContent.replace(/\s+/g," ").trim():"";
const bn=t=>(BT[t]&&BT[t].n)||t;
const wl=w=>w===1?"robotník":w>1&&w<5?"robotníci":"robotníkov";
const cityN=c=>{try{return CITY(c).n||""}catch(e){return""}};
const dynN=o=>{try{const d=S.dyn[o];return d?(d.name||d.n||d.nm||""):""}catch(e){return""}};
let sel=null,tab="dielna";

/* ---------- presun kamery medzi miestami Obchodu: miesta ležia vedľa seba (brána – ulica – námestie – krajčír – mapa) ---------- */
const SORD={brana:0,ulica:1,trhovisko:2,krajcir:3,"trh:cen":4,svet:5};
const noMotion=()=>{try{return matchMedia("(prefers-reduced-motion:reduce)").matches}catch(e){return false}};
function slideDir(sc,to){if(!sc||noMotion())return 0;const ks=sc.querySelector("[data-ks]");const from=sc.dataset.k||(ks&&ks.dataset.ks);if(!(from in SORD)||!(to in SORD)||from===to)return 0;return SORD[to]>SORD[from]?1:-1}
function ghostOut(sc,dir){if(!dir)return;try{const cv=sc.querySelector("canvas");if(!cv||!cv.width)return;const r=cv.getBoundingClientRect();const gh=document.createElement("canvas");gh.width=cv.width;gh.height=cv.height;gh.getContext("2d").drawImage(cv,0,0);gh.className="dsghost";gh.setAttribute("aria-hidden","true");
 Object.assign(gh.style,{position:"fixed",left:r.left+"px",top:r.top+"px",width:r.width+"px",height:r.height+"px",zIndex:0,pointerEvents:"none"});document.body.prepend(gh);
 const done=()=>gh.remove();const an=gh.animate?gh.animate([{transform:"none",opacity:1},{transform:`translateX(${-dir*28}%)`,opacity:0}],{duration:700,easing:"cubic-bezier(.4,0,.2,1)"}):null;if(an)an.onfinish=done;setTimeout(done,950)}catch(e){}}
function slideIn(sc,dir){if(!dir||!sc.animate)return;try{sc.animate([{transform:`translateX(${dir*28}%)`,opacity:.15},{transform:"none",opacity:1}],{duration:700,easing:"cubic-bezier(.2,.7,.2,1)"})}catch(e){}}
/* ---------- počasie a život v scénach Obchodu ---------- */
function wxFx(g,t,wx,season){const n=g.canvas.width?1:1;
 if(wx==="dazd"){g.strokeStyle="rgba(215,225,245,.55)";g.lineWidth=1.8;g.beginPath();for(let i=0;i<170;i++){const sp=1+(i%5)*.12,x=((i*97.3+t*140*sp)%(W+240))-120,y=((i*53.7%H)+t*980*sp)%H;g.moveTo(x,y);g.lineTo(x-9,y+30)}g.stroke();
  g.fillStyle="rgba(40,50,70,.10)";g.fillRect(0,0,W,H)}
 else if(wx==="sneh"||season===3){g.fillStyle="rgba(255,255,255,.85)";for(let i=0;i<150;i++){const sp=1+(i%4)*.25,r=1.2+(i%3)*.9,y=((i*71.3%H)+t*38*sp)%H,x=((i*131.7%W)+Math.sin(t*.7+i)*24+W)%W;g.beginPath();g.arc(x,y,r,0,7);g.fill()}}
 else if(season===2){for(let i=0;i<26;i++){const sp=1+(i%3)*.3,y=((i*97%H)+t*55*sp)%H,x=((i*157%W)+t*30*sp+Math.sin(t+i)*30)%W,a=t*2+i;g.save();g.translate(x,y);g.rotate(a);g.fillStyle=["#c9701a","#a8461f","#d8a03a","#8a5a20"][i%4];g.beginPath();g.ellipse(0,0,6,3,0,0,7);g.fill();g.restore()}}
 if(wx==="hmla"){const gr=g.createLinearGradient(0,H*.25,0,H);gr.addColorStop(0,"rgba(225,228,232,0)");gr.addColorStop(1,"rgba(225,228,232,.35)");g.fillStyle=gr;g.fillRect(0,0,W,H)}}
/* voz s koňom ide po ulici; I = aktuálne izometrické plátno, sum = os ulice, d = poloha */
function cartFx(g,t,sum,sp,ofs,col){const u=((t*sp+ofs)%1+1)%1,dir=Math.floor(t*sp+ofs)%2?-1:1,d=dir>0?-62+u*124:62-u*124;
 const a=I.P((sum+d)/2,(sum-d)/2,0),b=I.P((sum+d+dir)/2,(sum-d-dir)/2,0);let vx=b[0]-a[0],vy=b[1]-a[1];const L=Math.hypot(vx,vy)||1;vx/=L;vy/=L;
 const k=I.k*.9,X=a[0],Y=a[1],pt=(f,up)=>[X+vx*f*k,Y+vy*f*k-up*k];
 g.fillStyle="rgba(0,0,0,.2)";g.beginPath();g.ellipse(X+vx*k,Y+vy*k+3,2.8*k,.7*k,Math.atan2(vy,vx),0,7);g.fill();
 const wl=f=>{const c=pt(f,.45);g.fillStyle="#3a2414";g.beginPath();g.ellipse(c[0],c[1],.42*k,.48*k,0,0,7);g.fill();g.strokeStyle="#8a6a3a";g.lineWidth=1.5;g.beginPath();const r=t*6*dir;g.moveTo(c[0]+Math.cos(r)*.38*k,c[1]+Math.sin(r)*.42*k);g.lineTo(c[0]-Math.cos(r)*.38*k,c[1]-Math.sin(r)*.42*k);g.stroke()};
 wl(-1.4);wl(.2);
 const box=[pt(-1.9,.7),pt(.7,.7),pt(.7,1.5),pt(-1.9,1.5)];g.fillStyle="#7a4a24";g.beginPath();box.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fill();
 const c0=pt(-1.7,1.5),c1=pt(.5,1.5);g.fillStyle=col||"#efe4c8";g.beginPath();g.moveTo(c0[0],c0[1]);g.quadraticCurveTo((c0[0]+c1[0])/2,(c0[1]+c1[1])/2-1.5*k,c1[0],c1[1]);g.closePath();g.fill();g.strokeStyle="rgba(90,70,40,.6)";g.lineWidth=1;g.stroke();
 const hb=pt(2.2,1.15),bob=Math.sin(t*9)*.08*k;g.strokeStyle="#4a2e14";g.lineWidth=2;g.beginPath();const sh=pt(.7,1);g.moveTo(sh[0],sh[1]);g.lineTo(hb[0],hb[1]);g.stroke();
 for(let i=0;i<4;i++){const f=1.6+(i%2)*1.1,sw=Math.sin(t*9+i*1.6)*.25,l0=pt(f,1),l1=pt(f+sw,0);g.strokeStyle="#4a2a14";g.lineWidth=2.4;g.beginPath();g.moveTo(l0[0],l0[1]+bob);g.lineTo(l1[0],l1[1]);g.stroke()}
 g.fillStyle="#6a4424";g.beginPath();g.ellipse(hb[0],hb[1]+bob,1.25*k,.5*k,Math.atan2(vy,vx),0,7);g.fill();
 const hd=pt(3.5,1.7);g.beginPath();g.ellipse(hd[0],hd[1]+bob,.5*k,.3*k,Math.atan2(vy,vx)-.5*dir,0,7);g.fill()}
function hens(g,t,list){list.forEach(([d,sum,i])=>{const d2=d+Math.sin(t*.3+i)*.8,s2=sum+Math.cos(t*.25+i)*.3,q=I.P((s2+d2)/2,(s2-d2)/2,0),pk=Math.max(0,Math.sin(t*3+i*2))*3;
 g.fillStyle="rgba(0,0,0,.18)";g.beginPath();g.ellipse(q[0],q[1]+1,6,2,0,0,7);g.fill();g.fillStyle=i%3?"#f2ece0":"#a8642a";g.beginPath();g.ellipse(q[0],q[1]-4,6,4.4,0,0,7);g.fill();
 const hx=q[0]+(i%2?5:-5),hy=q[1]-8+pk;g.beginPath();g.arc(hx,hy,2.6,0,7);g.fill();g.fillStyle="#c8302a";g.fillRect(hx-1,hy-4,2,2);g.fillStyle="#d8a020";g.fillRect(hx+(i%2?2:-4),hy,2,1.4)})}
/* ---------- scéna ---------- */
/* poloha domu v rade: stred v smere ulice (x−y) a predný roh tesne pri ulici */
function place(i,wdt,dd,c){const d=SLOTS[i]*GAP,sum=(c==null?ROWC:c)-wdt-dd,dif=d-(wdt-dd)/2;return[(sum+dif)/2,(sum-dif)/2]}
function house(bx,by,wdt,dd,h,o){
 I.box(bx,by,wdt,dd,h,{tex:o.tex,timber:o.tex==="timber",quoin:!!o.quoin,sqY:[[1,h*.5,.9,.9],[wdt-2,h*.5,.9,.9]],doorY:[wdt/2-.8,1.2,2,!!o.arch],noTop:1,tpu:14,band:o.band||0});
 I.gable(bx,by,wdt,dd,h,wdt*.4,o.roof,{chim:o.chim||[],tpu:12,gableTex:o.tex==="wall"?"wallX":"plasterX"});
}
function sign(bx,by,wdt,dd,h,col,lvl){const z=1+Math.max(0,(lvl||1)-1)*.18;I.push({d:bx+wdt+by+dd+.5,draw:x2=>{const q2=I.P(bx+wdt+.1,by+dd,h*.75);x2.strokeStyle="#3a2a1a";x2.lineWidth=2;x2.beginPath();x2.moveTo(q2[0],q2[1]);x2.lineTo(q2[0]+18*z,q2[1]-4);x2.stroke();x2.fillStyle=col;x2.fillRect(q2[0]+9*z,q2[1]-4,18*z,15*z);x2.strokeStyle="#e3be4f";x2.lineWidth=1.5;x2.strokeRect(q2[0]+9*z,q2[1]-4,18*z,15*z)}})}
function stall(sx,sy,col,i){
 I.box(sx,sy,3.2,2,1,{tex:"wood",clean:1,tpu:6});
 I.push({d:sx+sy+5.4,draw:x2=>{const z=2.3,pts=[[sx-.3,sy-.3],[sx+3.5,sy-.3],[sx+3.5,sy+2.3],[sx-.3,sy+2.3]].map(([a,b])=>I.P(a,b,z));
  x2.strokeStyle="#4a2e14";x2.lineWidth=3;[[sx,sy+2],[sx+3.2,sy+2],[sx+3.2,sy]].forEach(([a,b])=>{const p0=I.P(a,b,1),p1=I.P(a,b,z);x2.beginPath();x2.moveTo(p0[0],p0[1]);x2.lineTo(p1[0],p1[1]);x2.stroke()});
  const br=I.bright([0,0,1]);x2.fillStyle=col;x2.globalAlpha=.55+br*.45;x2.beginPath();pts.forEach((p,k)=>k?x2.lineTo(p[0],p[1]):x2.moveTo(p[0],p[1]));x2.closePath();x2.fill();x2.globalAlpha=1;
  x2.fillStyle="rgba(255,250,235,.75)";for(let k=1;k<6;k+=2){const a=pts[0],b=pts[1],c=pts[2],d=pts[3],t1=k/6,t2=(k+1)/6;const L=(p,q3,t)=>[p[0]+(q3[0]-p[0])*t,p[1]+(q3[1]-p[1])*t];const A1=L(a,b,t1),A2=L(a,b,t2),B2=L(d,c,t2),B1=L(d,c,t1);x2.beginPath();x2.moveTo(A1[0],A1[1]);x2.lineTo(A2[0],A2[1]);x2.lineTo(B2[0],B2[1]);x2.lineTo(B1[0],B1[1]);x2.closePath();x2.fill()}
  const gc=["#b8362c","#c9971a","#2f7d46","#6d3f92","#2f5bb0"];for(let k=0;k<4;k++){const p=I.P(sx+.5+k*.7,sy+1.7,1.05);x2.fillStyle=gc[(i+k)%5];x2.beginPath();x2.arc(p[0],p[1],4.5,0,7);x2.fill()}}});
}
function far(x,st,sc=1){
 const T=I.T,hz=T.haze,hy=I.oy+.5*I.k*HOR;
 const c=(a,m)=>`rgba(${Math.round(hz[0]*m)},${Math.round(hz[1]*m)},${Math.round(hz[2]*m)},${a})`;
 x.fillStyle=c(.9,.8);x.beginPath();x.moveTo(0,hy+2);for(let i=0;i<=32;i++){const X=i*W/32;x.lineTo(X,hy-46-26*Math.sin(i*.8+st.ci)-14*Math.sin(i*2.1+1))}x.lineTo(W,hy+2);x.closePath();x.fill();
 const pre=/Prešporok/.test(st.cn);x.save();x.translate(W*.45,hy);x.scale(sc,sc);x.translate(-W*.45,-hy);
 x.fillStyle=c(.95,.6);
 if(pre){const cx=W*.45,base=hy-30;x.fillStyle=c(.95,.62);x.beginPath();x.ellipse(cx,base+8,300,110,0,Math.PI,0);x.fill();
  const top=base-104,bw=230,bh=86;x.fillStyle=c(1,.46);x.fillRect(cx-bw/2,top-bh,bw,bh);
  x.fillStyle=c(1,.34);x.beginPath();x.moveTo(cx-bw/2-6,top-bh);x.lineTo(cx-bw/2+40,top-bh-46);x.lineTo(cx+bw/2-40,top-bh-46);x.lineTo(cx+bw/2+6,top-bh);x.closePath();x.fill();
  [[-bw/2-14],[bw/2-20]].forEach(([dx])=>{x.fillStyle=c(1,.42);x.fillRect(cx+dx,top-bh-40,34,bh+40);x.fillStyle=c(1,.3);x.beginPath();x.moveTo(cx+dx-3,top-bh-40);x.lineTo(cx+dx+17,top-bh-82);x.lineTo(cx+dx+37,top-bh-40);x.closePath();x.fill()});
  x.fillStyle=c(.8,.78);for(let r=0;r<2;r++)for(let k=0;k<8;k++)x.fillRect(cx-bw/2+26+k*24,top-bh+18+r*30,7,13);
  x.fillStyle=c(.95,.5);x.fillRect(cx-bw/2-40,base-14,bw+80,14);}
 else{const cx=W*.45;x.fillRect(cx-70,hy-130,140,110);x.fillRect(cx-22,hy-230,44,110);x.beginPath();x.moveTo(cx-26,hy-230);x.lineTo(cx,hy-320);x.lineTo(cx+26,hy-230);x.fill()}
 x.restore();x.fillStyle=c(.97,.5);x.fillRect(0,hy-24,W,26);
 for(let X=10;X<W;X+=170){x.fillRect(X,hy-50,28,50);x.beginPath();x.moveTo(X-5,hy-50);x.lineTo(X+14,hy-74);x.lineTo(X+33,hy-50);x.fill()}
 x.fillStyle=c(.7,.4);for(let X=0;X<W;X+=40){const h=8+((X*7)%17);x.beginPath();x.moveTo(X,hy-24);x.lineTo(X+20,hy-24-h);x.lineTo(X+40,hy-24);x.fill()}
}
KSCENE.register("ulica",{id:"ulica",W,H,label:"Ulica tvojich dielní",
 state:()=>{const p=P();const mine=myBall(p).filter(b=>b.city===S.ci).sort((a,b)=>a.id-b.id);const ids=new Set(myBall(p).map(b=>b.id));
  const oth=S.bld.filter(b=>b.city===S.ci&&!ids.has(b.id)&&BT[b.type]).sort((a,b)=>a.id-b.id).slice(0,5);
  let fl=0;try{fl=hasLic(S.ci)&&freeLot()?1:0}catch(e){}
  const prof=b=>{try{const v=b.type==="brloh"?lootEst(p,b):inCity(b.city,()=>estimate(p,b).profit);return isFinite(v)?Math.round(v/5)*5:null}catch(e){return null}};
  const arm=o=>{try{const a=S.dyn[o]&&S.dyn[o].arms||{};return[a.f||"#5a4630",(typeof METAL!=="undefined"&&METAL[a.m])||"#e3be4f"]}catch(e){return["#5a4630","#e3be4f"]}};
  return{ph:todPh(),season:S.season,wx:K.wxNow(),ci:S.ci,cn:cityN(S.ci),fl,pa:arm(p.id),
   m:mine.map(b=>[b.id,b.type,b.lvl,b.w,b.halt?1:0,prof(b)]),o:oth.map(b=>[b.id,b.type,b.lvl,b.w,b.owner,arm(b.owner)])}},
 build:st=>{I=IU;
  const shc=I.begin(st.ph,st.season,{wx:st.wx});const c=I.off(W,H),x=c.getContext("2d");
  K.skyBg(x,I,W,H);far(x,st);
  const v=n=>n/Math.SQRT2;
  I.groundPlane(x,g=>{g.rotate(-Math.PI/4);g.save();g.scale(.1,.1);
   g.fillStyle=I.pat(g,"grass");g.fillRect(-1800,v(HOR)*10,3600,1800);
   g.fillStyle=I.pat(g,"cobble");g.fillRect(-1800,v(2.4)*10,3600,v(10)*10);g.fillRect(v(-15.75-1.6)*10,v(12)*10,v(3.2)*10,600);g.fillRect(v(26.25-1.6)*10,v(12)*10,v(3.2)*10,600);
   const FC=["#7d9a4a","#a08a4a","#6f8c42","#b39a58","#86a052"];for(let k=0;k<6;k++){const u0=v(-70+k*24)*10,v0=v(36)*10,uw=v(21)*10,vh=v(30)*10;g.fillStyle=FC[k%5];g.globalAlpha=.55;g.fillRect(u0,v0,uw,vh);g.globalAlpha=.22;g.fillStyle="#3a2a14";for(let r=0;r<uw;r+=9)g.fillRect(u0+r,v0,3,vh)}g.globalAlpha=1;g.restore();g.globalCompositeOperation="multiply";g.fillStyle=I.col(I.bright([0,0,1]));g.fillRect(-180,v(HOR),360,180)});
  const hy=I.oy+.5*I.k*HOR,hzc=I.T.haze,hg=x.createLinearGradient(0,hy-6,0,hy+70);hg.addColorStop(0,`rgba(${hzc[0]},${hzc[1]},${hzc[2]},.55)`);hg.addColorStop(1,`rgba(${hzc[0]},${hzc[1]},${hzc[2]},0)`);x.fillStyle=hg;x.fillRect(0,hy-6,W,76);
  const hot=[],folk=[],labels=[],hb={};
  /* zadný rad: domy mešťanov a kostol */
  for(let i=0;i<16;i++){const d=(i-7.5)*GAP,wdt=5+(i%3)*.5,dd=4,h=4.4+(i*37%5)*.45,sum=-11-wdt-dd,dif=d-(wdt-dd)/2;
   house((sum+dif)/2,(sum-dif)/2,wdt,dd,h,{tex:i%3===0?"plaster":"timber",roof:i%4===1?"slate":"tile",chim:i%3===1?[(sum+dif)/2+wdt*.7]:[]})}
  {const d=-31,sum=-24,bx=(sum+d)/2,by=(sum-d)/2;I.box(bx,by,4.6,4.6,11,{tex:"wall",quoin:1,tpu:14});I.gable(bx,by,4.6,4.6,11,7,"slate",{tpu:12,gableTex:"wallX"})}
  /* predný rad: moje dielne, voľná parcela, susedia, mešťania */
  const slots=[];st.m.forEach(b=>slots.push({k:"m",b}));if(st.fl)slots.push({k:"f"});st.o.forEach(b=>slots.push({k:"o",b}));
  const nS=Math.max(13,slots.length);while(slots.length<nS)slots.push({k:"r"});
  slots.forEach((s,i)=>{
   if(s.k==="m"||s.k==="o"){const[id,type,lvl,w,ex]=s.b,halt=s.k==="m"?ex:0;const wdt=5+lvl*.6,dd=4.5,h=2.6+lvl*.7;const[bx,by]=place(i,wdt,dd);
    const dark=type==="brloh"||type==="pasovanie";const tex=dark?"wall":lvl>=3?"plaster":"timber";
    I.setCur((s.k==="m"?"b":"o")+id);
    if(lvl>=2){/* prístavba vpravo: dielňa sa rozrastá */const aw=1.8,ah=h*.55;I.box(bx+wdt,by+.8,aw,dd-1.3,ah,{tex:tex==="wall"?"wall":"plaster",noTop:1,tpu:14,sqY:[[aw/2-.45,ah*.45,.9,.8]]});I.gable(bx+wdt,by+.8,aw,dd-1.3,ah,aw*.45,dark?"slate":"tile",{tpu:12,gableTex:"plasterX"})}
    house(bx,by,wdt,dd,h,{tex,quoin:lvl>=3,band:lvl>=2?h*.55:0,roof:dark?"slate":lvl>=2?"tile":"thatch",arch:lvl>=2,chim:w>0&&!halt&&["kovac","pekar","hrnciar","krcma","lekaren","vinar","sklaren","pivovar"].includes(type)?[bx+wdt*.7]:[]});
    I.setCur(null);sign(bx,by,wdt,dd,h,K.WSIGN[type]||"#8a6a3a",lvl);
    const closed=s.k==="m"&&(w<=0||halt);
    if(closed)I.push({d:bx+wdt+by+dd+.66,draw:x2=>{/* zabednené dvere: dielňa nepracuje */const a=I.P(bx+wdt/2-.85,by+dd+.02,0),b2=I.P(bx+wdt/2+.85,by+dd+.02,0),c2=I.P(bx+wdt/2-.85,by+dd+.02,2.05),d2=I.P(bx+wdt/2+.85,by+dd+.02,2.05);
     x2.strokeStyle="#5a3a1a";x2.lineWidth=5;x2.lineCap="round";x2.beginPath();x2.moveTo(a[0],a[1]);x2.lineTo(d2[0],d2[1]);x2.moveTo(b2[0],b2[1]);x2.lineTo(c2[0],c2[1]);x2.stroke();x2.strokeStyle="#8a6a3a";x2.lineWidth=2;x2.stroke();x2.lineCap="butt"}});
    if(s.k==="m"){const[f1,f2]=st.pa;I.push({d:bx+wdt+by+dd+(lvl>=2?2.6:.7),draw:x2=>{/* zástava rodu na tyči pri štíte */const b0=I.P(bx+wdt-.3,by+dd+.05,h*.95),t0=[b0[0]+44,b0[1]-18];
     x2.strokeStyle="#3a2414";x2.lineWidth=2.5;x2.beginPath();x2.moveTo(b0[0],b0[1]);x2.lineTo(t0[0],t0[1]);x2.stroke();
     x2.fillStyle=f1;x2.beginPath();x2.moveTo(t0[0]-20,t0[1]+7);x2.lineTo(t0[0]-2,t0[1]);x2.lineTo(t0[0]-2,t0[1]+50);x2.lineTo(t0[0]-11,t0[1]+42);x2.lineTo(t0[0]-20,t0[1]+57);x2.closePath();x2.fill();
     x2.fillStyle=f2;x2.beginPath();x2.moveTo(t0[0]-20,t0[1]+24);x2.lineTo(t0[0]-2,t0[1]+19);x2.lineTo(t0[0]-2,t0[1]+27);x2.lineTo(t0[0]-20,t0[1]+32);x2.closePath();x2.fill();x2.strokeStyle="rgba(0,0,0,.35)";x2.lineWidth=1;x2.stroke()}})}
    for(let k=0;k<Math.min(3,lvl);k++)I.box(bx+wdt-1-k*1.1,by+dd+.4,.9,.9,.8+k%2*.3,{tex:"wood",clean:1,tpu:6,noShadow:1});
    if(s.k==="m")for(let k=0;k<Math.min(w,3);k++)folk.push({x:bx+wdt/2-1.4+k*1.3,y:by+dd+1.7+k%2*.7,type,i:i*3+k,halt});
    const top=I.P(bx+wdt/2,by+dd/2,h+wdt*.4+1.2);
    const pr=s.k==="m"?s.b[5]:null;const sub=s.k==="m"?(halt?["poškodená – oprav ju","bad"]:w<=0?["bez robotníkov","bad"]:pr!=null?[(pr>=0?"+":"−")+fmt(Math.abs(pr))+" zl. za štvrťrok",pr>=0?"good":"bad"]:null):["rod "+(dynN(s.b[4])||"?"),"oth",s.b[5][0]];
    labels.push({X:top[0],Y:top[1],t:`${bn(type)} ${ROMAN(lvl)}`,mine:s.k==="m",id,halt,sub});
    if(s.k==="m")hb[id]={X:top[0],Y:top[1]};
    s.geo=[bx,by,wdt,dd,h,type,lvl,w,id];
   }else if(s.k==="f"){const wdt=6,dd=4.5;const[bx,by]=place(i,wdt,dd);
    I.box(bx+.4,by+.4,wdt-.8,dd-.8,.06,{tex:"cobble",noShadow:1,clean:1});
    for(let k=0;k<=6;k++){I.box(bx+k*wdt/6-.12,by+dd-.12,.24,.24,.9,{tex:"wood",clean:1,noShadow:1});I.box(bx+wdt-.12,by+k*dd/6-.12,.24,.24,.9,{tex:"wood",clean:1,noShadow:1})}
    I.box(bx+1,by+1,2.6,.8,.5,{tex:"wood",clean:1,tpu:6});I.box(bx+1.2,by+1,2.2,.8,.9,{tex:"wood",clean:1,tpu:6,z:.5,noShadow:1});
    const p0=I.P(bx,by,0),p1=I.P(bx+wdt,by,0),p2=I.P(bx+wdt,by+dd,0),p3=I.P(bx,by+dd,0),pt=I.P(bx+wdt/2,by+dd/2,3);
    hot.push({r:[Math.min(p0[0],p3[0])-6,pt[1]-20,Math.max(p1[0],p2[0])+6,p2[1]+8],data:{a:"dbuild"},label:"Voľná parcela – postaviť dielňu"});
    I.push({d:bx+wdt+by+dd+.3,draw:x2=>{const a=I.P(bx+wdt-.6,by+dd-.3,0),b2=I.P(bx+wdt-.6,by+dd-.3,2.2);x2.strokeStyle="#4a2e14";x2.lineWidth=4;x2.beginPath();x2.moveTo(a[0],a[1]);x2.lineTo(b2[0],b2[1]);x2.stroke();
     x2.fillStyle="#e9d9b0";x2.strokeStyle="#6a4a20";x2.lineWidth=2;x2.beginPath();x2.rect(b2[0]-34,b2[1]-6,68,24);x2.fill();x2.stroke();x2.fillStyle="#6a2a14";x2.font='bold 13px "Almendra SC","EB Garamond",serif';x2.textAlign="center";x2.textBaseline="middle";x2.fillText("NA PREDAJ",b2[0],b2[1]+6)}});
    labels.push({X:pt[0],Y:pt[1],t:"Voľná parcela",free:1,sub:["klikni a postav dielňu","free"]});
   }else{const wdt=5.2+(i%2)*.6,dd=4.2,h=3.2+(i*29%4)*.4;const[bx,by]=place(i,wdt,dd);
    house(bx,by,wdt,dd,h,{tex:i%2?"plaster":"timber",roof:i%3===0?"tile":"thatch",chim:i%2?[bx+wdt*.7]:[]});
    I.tree(bx-1.2,by+dd*.4,1.1,2.8)}
  });
  /* pred ulicou: stánky, studňa, voz, sudy, stromy */
  const dS=(d,sum)=>[(sum+d)/2,(sum-d)/2];
  [[-27,"#b8362c"],[-5,"#2f5bb0"],[16.5,"#c9971a"],[37,"#2f7d46"]].forEach(([d,col],k)=>{const[sx,sy]=dS(d,14.5);stall(sx,sy,col,k)});
  {const[wx,wy]=dS(6,17.5);I.cyl(wx,wy,1,1,{tex:"cyl"});I.push({d:wx+wy+1.3,draw:x2=>{const a=I.P(wx-.9,wy,1),b=I.P(wx+.9,wy,1),t2=I.P(wx,wy,3);x2.strokeStyle="#4a2e14";x2.lineWidth=3;x2.beginPath();x2.moveTo(a[0],a[1]);x2.lineTo(a[0],t2[1]);x2.lineTo(b[0],t2[1]);x2.lineTo(b[0],b[1]);x2.stroke();x2.strokeStyle="#8a6a3a";x2.lineWidth=1.5;x2.beginPath();x2.moveTo(t2[0],t2[1]);x2.lineTo(t2[0],t2[1]+18);x2.stroke()}})}
  {const[cx,cy]=dS(-15.5,18);I.box(cx,cy,3,1.6,.8,{tex:"wood",clean:1,tpu:6,z:.5});I.cyl(cx+.3,cy+1.8,.55,.15,{tex:"wood",noShadow:1});I.cyl(cx+2.6,cy+1.8,.55,.15,{tex:"wood",noShadow:1});I.box(cx+.4,cy+.3,.8,.8,.7,{tex:"wood",clean:1,z:1.3,noShadow:1})}
  [[-2,13.8],[-1,13.9],[27,13.6]].forEach(([d,sum])=>{const[bx,by]=dS(d,sum);I.cyl(bx,by,.45,.9,{tex:"wood"})});
  [[-44,24],[-36,28],[-22,30],[-8,26],[2,31],[12,25],[24,29],[33,24],[44,27],[-30,22],[50,31],[-58,26],[-52,33],[58,25],[64,32],[-64,22],[-40,70],[-18,72],[8,69],[30,71],[52,68],[-60,52],[62,54]].forEach(([d,sum],k)=>{const[tx,ty]=dS(d,sum);I.tree(tx,ty,1.2+k%3*.25,3+k%2)});
  const field=[];if(st.season===1||st.season===2){[[-56,46],[-49,52],[-8,48],[22,44],[29,53],[51,47],[58,56]].forEach(([d,sum])=>{const[hx,hy2]=dS(d,sum);I.push({d:hx+hy2+.6,draw:x2=>{const p0=I.P(hx,hy2,0);x2.fillStyle="rgba(0,0,0,.18)";x2.beginPath();x2.ellipse(p0[0]+6,p0[1]+2,18,6,0,0,7);x2.fill();
    const gr=x2.createLinearGradient(p0[0]-14,0,p0[0]+14,0);gr.addColorStop(0,"#e8c86a");gr.addColorStop(1,"#a8822e");x2.fillStyle=gr;x2.beginPath();x2.moveTo(p0[0]-15,p0[1]);x2.quadraticCurveTo(p0[0]-14,p0[1]-30,p0[0],p0[1]-34);x2.quadraticCurveTo(p0[0]+14,p0[1]-30,p0[0]+15,p0[1]);x2.closePath();x2.fill();
    x2.strokeStyle="rgba(120,90,30,.5)";x2.lineWidth=1;for(let k=-2;k<=2;k++){x2.beginPath();x2.moveTo(p0[0]+k*5,p0[1]-2);x2.lineTo(p0[0]+k*3,p0[1]-26);x2.stroke()}}})})}
  if(st.season!==3&&st.ph!==3)[[-43,44],[-38,50],[15,49],[40,46]].forEach(([d,sum],k)=>{const[fx,fy]=dS(d,sum);field.push({x:fx,y:fy,i:40+k})});
  const sheep=st.season!==3&&st.ph!==3?Array.from({length:6},(_,k)=>({d:-19+k*2.6,sum:40+(k%3)*2.2,i:k})):[];
  I.drawSolids(x,shc);
  for(const s of slots)if(s.geo&&(s.k==="m"||s.k==="o")){const[bx,by,wdt,dd,h,type,lvl,w,id]=s.geo;const r=I.hot[(s.k==="m"?"b":"o")+id];if(!r)continue;
   if(s.k==="m")hot.push({r:[r[0],r[1],r[2]+30,r[3]+10],data:{a:"dsel",b:id},label:`${bn(type)} ${ROMAN(lvl)} · ${w} ${wl(w)}`});
   else{const own=dynN(s.b[4]);hot.push({r:[r[0],r[1],r[2],r[3]],data:{a:"dinfo",t:`${bn(type)} ${ROMAN(lvl)}${own?" · rod "+own:""} – dielňa iného rodu`},label:`${bn(type)}${own?" · rod "+own:""}`})}}
  K.vignette(x,W,H,.32);
  const walk=Array.from({length:7},(_,i)=>({i,sum:4.6+(i%3)*2.4,sp:.012+(i%4)*.004,dir:i%2?1:-1,o:i/7}));
  return{img:c,hot,folk,field,sheep,walk,labels,hb,lights:I.lights.slice(),smokes:I.smokes.slice(),st}},
 animate:(g,C,t)=>{I=C.st.c?IT:IU;
  C.smokes.forEach(([sx,sy,sz],i)=>{const[X,Y]=I.P(sx,sy,sz);for(let k=0;k<3;k++){const u=(t*.3+k*.33+i*.1)%1;g.fillStyle=`rgba(225,225,230,${(1-u)*.45})`;g.beginPath();g.arc(X+Math.sin(u*6+i)*4+u*8,Y-u*38,2+u*8,0,7);g.fill()}});
  const fig=(X,Y,i,o)=>KFIG2.draw(g,X,Y,2,Object.assign({look:{g:i%3===1?"f":"m",skin:i%4,hc:i*2%7,beard:i%2,eyes:i%4},robe:["#5a4a3a","#3a5a6a","#6a4a3a","#4a5a3a","#6a3a3a"][i%5],title:0,hat:"cap",hatCol:["#8a3a2a","#3a3a5a","#5a5a2a"][i%3],t,i},o));
  C.walk.forEach(w=>{const u=(t*w.sp+w.o)%1,d=w.dir>0?-52+u*104:52-u*104;const q2=I.P((w.sum+d)/2,(w.sum-d)/2,0);fig(q2[0],q2[1],w.i+20,{tool:null,act:null})});
  C.folk.forEach(f=>{const q2=I.P(f.x,f.y,0);fig(q2[0],q2[1],f.i,{tool:f.halt?null:K.WTOOL[f.type]||null,act:f.halt?null:K.WTOOL[f.type]?null:"stir"})});
  if(C.st.ph!==3){cartFx(g,t,7.6,.011,.3,"#efe4c8");hens(g,t,[[-8,2.9,1],[-6.6,3.3,2],[12,3,3],[13.4,2.7,4],[31,3.1,5]])}
  (C.field||[]).forEach(f=>{const q2=I.P(f.x,f.y,0);fig(q2[0],q2[1],f.i,{tool:null,act:"stir"})});
  (C.sheep||[]).forEach(o=>{const dd2=o.d+Math.sin(t*.15+o.i*1.7)*1.2,ss=o.sum+Math.cos(t*.12+o.i)*.8;const q2=I.P((ss+dd2)/2,(ss-dd2)/2,0),bob=Math.abs(Math.sin(t*1.3+o.i))*1.2;
   g.fillStyle="rgba(0,0,0,.18)";g.beginPath();g.ellipse(q2[0],q2[1]+2,10,3.5,0,0,7);g.fill();g.fillStyle="#f1ece0";g.beginPath();g.ellipse(q2[0],q2[1]-6-bob,10,6.5,0,0,7);g.fill();
   g.fillStyle="#3a3230";const hd=o.i%2?1:-1;g.beginPath();g.ellipse(q2[0]+hd*10,q2[1]-8-bob,3.6,3,0,0,7);g.fill();g.fillRect(q2[0]-6,q2[1]-2,2,4);g.fillRect(q2[0]+4,q2[1]-2,2,4)});
  K.lightsDraw(g,I,C.lights,t);K.nightTint(g,I,W,H,C.st.ph);wxFx(g,t,C.st.wx,C.st.season);
  g.save();g.textAlign="center";g.textBaseline="middle";
  C.labels.forEach(l=>{const on=l.mine&&l.id===sel;g.font=`${on?18:15}px "Almendra SC","EB Garamond",serif`;const tw=g.measureText(l.t).width+22,th=on?28:24,X=l.X,Y=l.Y-(on?6+Math.sin(t*3)*3:0);
   g.fillStyle=l.free?"rgba(244,231,191,.92)":l.mine?(on?"#f6e2a0":"rgba(250,240,212,.95)"):"rgba(214,204,182,.82)";g.strokeStyle=on?"#8e1f1c":l.mine?"#b5892a":"#7a6a50";g.lineWidth=on?2.5:1.5;
   g.beginPath();g.roundRect?g.roundRect(X-tw/2,Y-th/2,tw,th,4):g.rect(X-tw/2,Y-th/2,tw,th);g.fill();g.stroke();
   if(on){g.fillStyle="#8e1f1c";g.beginPath();g.moveTo(X-7,Y+th/2);g.lineTo(X+7,Y+th/2);g.lineTo(X,Y+th/2+9);g.closePath();g.fill()}
   g.fillStyle=l.mine||l.free?"#2a2016":"#4a4032";g.fillText(l.t,X,Y+1);
   if(l.sub){const[st2,cl,col]=l.sub;g.font='600 12px "EB Garamond",Georgia,serif';const sw=g.measureText(st2).width+16,sy=Y+th/2+11;
    g.fillStyle=cl==="good"?"rgba(226,240,206,.95)":cl==="bad"?"rgba(246,214,204,.96)":cl==="free"?"rgba(244,231,191,.9)":"rgba(222,214,196,.85)";g.strokeStyle=cl==="good"?"#5a8a3a":cl==="bad"?"#a0463a":"#8a7a5a";g.lineWidth=1;
    g.beginPath();g.roundRect?g.roundRect(X-sw/2,sy-9,sw,18,9):g.rect(X-sw/2,sy-9,sw,18);g.fill();g.stroke();
    if(col){g.fillStyle=col;g.beginPath();g.arc(X-sw/2+8,sy,4,0,7);g.fill()}
    g.fillStyle=cl==="good"?"#2f5a1e":cl==="bad"?"#7a1f18":"#4a4032";g.fillText(st2,X+(col?4:0),sy+1);g.font=`${on?18:15}px "Almendra SC","EB Garamond",serif`}
   if(l.halt){g.fillStyle="#b8362c";g.beginPath();g.arc(X+tw/2-2,Y-th/2+2,6,0,7);g.fill();g.fillStyle="#fff";g.font="bold 11px sans-serif";g.fillText("!",X+tw/2-2,Y-th/2+2.5)}});
  g.restore()}});

/* ---------- trhovisko: námestie s radnicou, stánok = skupina tovaru ---------- */
const ICN={};let icnN=0;
function icon(g){if(ICN[g])return ICN[g];const im=new Image();ICN[g]=im;try{let s=gIcon(g,40);const m=s.match(/<svg[\s\S]*<\/svg>/);s=m?m[0]:"";if(!/xmlns=/.test(s))s=s.replace("<svg ",'<svg xmlns="http://www.w3.org/2000/svg" ');im.onload=()=>{icnN++};im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(s)}catch(e){}return im}
function trhCats(){const raw=Object.keys(GOODS).filter(g=>GOODS[g].raw),seen=new Set(raw),cats=[{n:"suroviny",l:"Suroviny",gs:raw}];
 for(const t of Object.keys(BT)){const all=[...new Set((RECIPES[t]||[]).map(r=>r.o).filter(g=>g&&GOODS[g]))];let gs=all.filter(g=>!seen.has(g));if(!gs.length)gs=all;gs.forEach(g=>seen.add(g));if(gs.length)cats.push({n:BT[t].n,l:BT[t].n,t,gs})}return cats}
const ratio=g=>{try{return price(g)/GOODS[g].b}catch(e){return 1}};
function catInfo(c){const p=P();let r=0;c.gs.forEach(g=>r+=ratio(g));r/=c.gs.length;const own=c.gs.some(g=>(p.wh[g]||0)>0);const mine=!!c.t&&myBall(p).some(b=>b.type===c.t&&b.city===S.ci);return{r,own,mine}}
const TROW=[5,13,21,29],TCOLS=[-26,-15,-4,7,18],SW2=4.2,SD2=2.4,FTN=[-4,13];
const TGRP={sur:{n:"Suroviny",c:["#6f7f3a","#7d6a3a"]},jed:{n:"Jedlo a nápoje",c:["#c9971a","#b8643a"]},rem:{n:"Remeslá",c:["#2f5bb0","#3a7f7a"]},pre:{n:"Vzácnosti",c:["#6d3f92","#8e2f3a"]}};
const grpOf=t=>!t||t==="bana"?"sur":["pekar","krcma","vinar","pivovar","mlyn"].includes(t)?"jed":["zlatnik","pisaren","kupec","pasovanie","sklaren","tlaciaren"].includes(t)?"pre":"rem";
const GORD=["sur","jed","rem","pre"],RC=[-4,20],RRD=27,RRS=14;
const TCOL=["#b8362c","#2f5bb0","#c9971a","#2f7d46","#6d3f92","#a8583a","#3a7f7a","#8e2f3a"];
function tstall(sx,sy,col,gs,i){
 I.box(sx,sy,SW2,SD2,1,{tex:"wood",clean:1,tpu:6});
 I.push({d:sx+sy+SW2+SD2+.2,draw:x2=>{const z=2.6,pts=[[sx-.3,sy-.3],[sx+SW2+.3,sy-.3],[sx+SW2+.3,sy+SD2+.3],[sx-.3,sy+SD2+.3]].map(([a,b])=>I.P(a,b,z));
  x2.strokeStyle="#4a2e14";x2.lineWidth=3;[[sx,sy+SD2],[sx+SW2,sy+SD2],[sx+SW2,sy]].forEach(([a,b])=>{const p0=I.P(a,b,1),p1=I.P(a,b,z);x2.beginPath();x2.moveTo(p0[0],p0[1]);x2.lineTo(p1[0],p1[1]);x2.stroke()});
  const br=I.bright([0,0,1]);x2.fillStyle=col;x2.globalAlpha=.55+br*.45;x2.beginPath();pts.forEach((p,k)=>k?x2.lineTo(p[0],p[1]):x2.moveTo(p[0],p[1]));x2.closePath();x2.fill();x2.globalAlpha=1;
  x2.fillStyle="rgba(255,250,235,.72)";const L=(p,q3,t)=>[p[0]+(q3[0]-p[0])*t,p[1]+(q3[1]-p[1])*t];for(let k=1;k<8;k+=2){const[a,b,c,d]=pts,A1=L(a,b,k/8),A2=L(a,b,(k+1)/8),B2=L(d,c,(k+1)/8),B1=L(d,c,k/8);x2.beginPath();x2.moveTo(A1[0],A1[1]);x2.lineTo(A2[0],A2[1]);x2.lineTo(B2[0],B2[1]);x2.lineTo(B1[0],B1[1]);x2.closePath();x2.fill()}
  const n=Math.min(3,gs.length);for(let k=0;k<n;k++){const im=icon(gs[k]),p=I.P(sx+.7+k*1.4,sy+SD2-.5,1.02);if(im.complete&&im.naturalWidth){x2.drawImage(im,p[0]-15,p[1]-26,30,30)}}}});
}
KSCENE.register("trhovisko",{id:"trhovisko",W,H,label:"Trhovisko",
 state:()=>{const cats=trhCats();return{ph:todPh(),season:S.season,wx:K.wxNow(),ci:S.ci,cn:cityN(S.ci),ic:icnN,
  c:cats.map(c=>{const f=catInfo(c);const k2=c.gs.reduce((a,g)=>a+Math.floor(P().wh[g]||0),0);return[c.n,c.gs.slice(0,3).join(","),Math.round(f.r*100),f.own?1:0,f.mine?1:0,grpOf(c.t),k2]})
   .sort((a,b)=>GORD.indexOf(a[5])-GORD.indexOf(b[5]))}},
 build:st=>{I=IT;
  st.c.forEach(c=>c[1].split(",").forEach(icon));
  const shc=I.begin(st.ph,st.season,{wx:st.wx});const c=I.off(W,H),x=c.getContext("2d");
  K.skyBg(x,I,W,H);far(x,st,.7);
  const v=n=>n/Math.SQRT2;
  I.groundPlane(x,g=>{g.rotate(-Math.PI/4);g.save();g.scale(.1,.1);
   g.fillStyle=I.pat(g,"grass");g.fillRect(-1800,v(HOR)*10,3600,1800);
   g.fillStyle=I.pat(g,"cobble");g.fillRect(-1800,v(-6)*10,3600,v(42)*10);
   g.restore();g.globalCompositeOperation="multiply";g.fillStyle=I.col(I.bright([0,0,1]));g.fillRect(-180,v(HOR),360,180)});
  const hy=I.oy+.5*I.k*HOR,hzc=I.T.haze,hg=x.createLinearGradient(0,hy-6,0,hy+70);hg.addColorStop(0,`rgba(${hzc[0]},${hzc[1]},${hzc[2]},.55)`);hg.addColorStop(1,`rgba(${hzc[0]},${hzc[1]},${hzc[2]},0)`);x.fillStyle=hg;x.fillRect(0,hy-6,W,76);
  const hot=[],labels=[],sellers=[],hb={};const dS=(d,sum)=>[(sum+d)/2,(sum-d)/2];
  /* radnica s vežou */
  {const bx=-13,by=-9;I.setCur("radn");I.box(bx,by,10,6,6.5,{tex:"plaster",quoin:1,band:3.4,sqY:[[1.2,4.4,1,1.1],[3.4,4.4,1,1.1],[5.6,4.4,1,1.1],[7.8,4.4,1,1.1]],doorY:[4.3,1.6,2.6,1],noTop:1,tpu:14});
   I.gable(bx,by,10,6,6.5,3.6,"tile",{tpu:12,gableTex:"plasterX"});
   I.box(bx+6.6,by+3.2,2.8,2.8,13,{tex:"wall",quoin:1,tpu:14});I.gable(bx+6.6,by+3.2,2.8,2.8,13,4.5,"slate",{tpu:12,gableTex:"wallX"});I.setCur(null);
   const tp=I.P(bx+5,by+3,12.5);labels.push({X:tp[0],Y:tp[1],t:"Radnica",rad:1})}
  /* domy okolo námestia */
  for(let i=0;i<14;i++){const d=(i-6.5)*GAP;if(d>-27&&d<14)continue;const wdt=5+(i%3)*.5,dd=4.2,h=4+(i*37%5)*.5,sum=-4.5-wdt-dd,dif=d-(wdt-dd)/2;
   house((sum+dif)/2,(sum-dif)/2,wdt,dd,h,{tex:i%3===0?"plaster":"timber",roof:i%4===1?"slate":"tile",arch:i%2,chim:i%3===1?[(sum+dif)/2+wdt*.7]:[]})}
  for(let i=0;i<16;i++){const d=(i-7.5)*GAP+3,wdt=5,dd=4,h=5+(i*29%4)*.5,sum=-17-wdt-dd,dif=d-(wdt-dd)/2;house((sum+dif)/2,(sum-dif)/2,wdt,dd,h,{tex:i%2?"plaster":"timber",roof:i%3?"tile":"slate"})}
  /* stánky v troch radoch */
  /* rady stánkov: každá skupina vlastný rad, suroviny po bokoch kašne */
  let k=0;const slots=[],flags={};const byG={};st.c.forEach((c,i)=>{(byG[c[5]]=byG[c[5]]||[]).push(i)});
  [[2,"rem"],[11,"jed"],[RC[1],"sur"],[29,"pre"]].forEach(([sum,gk2])=>{const L=byG[gk2]||[];if(!L.length)return;const sp=L.length>7?8:10;
   if(gk2==="sur"){L.forEach((i,j)=>{const side=j%2?1:-1,o=Math.floor(j/2);slots[i]=[RC[0]+side*(14+o*sp),sum]});flags[gk2]=[RC[0]-14-Math.ceil(L.length/2)*sp+2,sum-3]}
   else{L.forEach((i,j)=>{slots[i]=[RC[0]+(j-(L.length-1)/2)*sp,sum]});flags[gk2]=[RC[0]-((L.length-1)/2)*sp-8,sum-1]}});
  const gk={};
  st.c.forEach(([n,gs,r,own,mine,grp,stock],i)=>{const sl=slots[i];if(!sl)return;const[d,sum]=sl;const[sx,sy]=dS(d-(SW2-SD2)/2,sum-(SW2+SD2)/2);
   gk[grp]=(gk[grp]||0)+1;tstall(sx,sy,TGRP[grp].c[gk[grp]%2],gs.split(","),i);
   const p0=I.P(sx-.3,sy+SD2+.3,0),p1=I.P(sx+SW2+.3,sy-.3,0),pt=I.P(sx-.3,sy-.3,2.7),pb=I.P(sx+SW2+.3,sy+SD2+.3,0);
   hot.push({r:[p0[0]+6,pt[1]-4,p1[0]-6,pb[1]-16],data:{a:"dtsel",n},label:`${n==="suroviny"?"Suroviny":n} – ceny ${r>=105?"vyššie":r<=95?"nižšie":"bežné"} (${r} %)`});
   const tp=I.P(sx+SW2/2,sy+SD2/2,3.9);labels.push({X:tp[0],Y:tp[1],t:n==="suroviny"?"Suroviny":n,n,r,own,mine,stock});
   sellers.push({x:sx-.6,y:sy+SD2+.9,i:i+40});k++});
  /* Rolandova studňa uprostred */
  {const[fx,fy]=dS(RC[0],RC[1]);I.cyl(fx,fy,1.9,.7,{tex:"cyl"});I.push({d:fx+fy+2.3,draw:x2=>{const q2=I.P(fx,fy,.7),rx=1.65*I.k*1.414,ry=rx*.5;x2.fillStyle="rgba(70,120,160,.85)";x2.beginPath();x2.ellipse(q2[0],q2[1],rx,ry,0,0,7);x2.fill();x2.fillStyle="rgba(255,255,255,.35)";x2.beginPath();x2.ellipse(q2[0]-rx*.3,q2[1]-ry*.2,rx*.3,ry*.25,0,0,7);x2.fill()}});
   I.cyl(fx,fy,.35,3.2,{tex:"cyl",noShadow:1,dd:2.4});I.cyl(fx,fy,.55,.3,{tex:"cyl",z:3.2,noShadow:1,dd:2.5});
   I.push({d:fx+fy+2.6,draw:x2=>{const q2=I.P(fx,fy,3.5);KFIG2.draw(x2,q2[0],q2[1],1.7,{look:{g:"m",skin:1,hc:2,beard:1,eyes:1},robe:"#9a9488",title:3,hat:null,tool:null,t:0,i:7})}})}
  [[-44,40],[-36,44],[-22,46],[-8,43],[6,45],[18,41],[30,44],[44,42],[56,39],[-58,42],[-64,34],[-66,20],[62,30],[64,14],[-40,66],[-14,70],[12,67],[38,69],[60,64]].forEach(([d,sum],j)=>{const[tx,ty]=dS(d,sum);I.tree(tx,ty,1.2+j%3*.25,3+j%2)});
  I.drawSolids(x,shc);
  {const r=I.hot.radn;if(r)hot.push({r:[r[0],r[1],r[2],r[3]],data:{a:"dradn"},label:"Radnica – rada mesta, úrady a voľby"})}
  K.vignette(x,W,H,.32);
  const walk=Array.from({length:10},(_,i)=>({i,sum:[9,9,17,17,25,25,33,1,1,33][i]+(i%2)*.8,sp:.01+(i%4)*.004,dir:i%2?1:-1,o:i/10}));
  return{img:c,hot,labels,sellers,walk,lights:I.lights.slice(),smokes:I.smokes.slice(),st}},
 animate:(g,C,t)=>{I=C.st.c?IT:IU;
  C.smokes.forEach(([sx,sy,sz],i)=>{const[X,Y]=I.P(sx,sy,sz);for(let k=0;k<3;k++){const u=(t*.3+k*.33+i*.1)%1;g.fillStyle=`rgba(225,225,230,${(1-u)*.45})`;g.beginPath();g.arc(X+Math.sin(u*6+i)*4+u*8,Y-u*38,2+u*8,0,7);g.fill()}});
  const fig=(X,Y,i,o)=>KFIG2.draw(g,X,Y,2,Object.assign({look:{g:i%3===1?"f":"m",skin:i%4,hc:i*2%7,beard:i%2,eyes:i%4},robe:["#5a4a3a","#3a5a6a","#6a4a3a","#4a5a3a","#6a3a3a","#3a4a6a"][i%6],title:0,hat:i%3===1?null:"cap",hatCol:["#8a3a2a","#3a3a5a","#5a5a2a"][i%3],t,i},o));
  C.walk.forEach(w=>{const u=(t*w.sp+w.o)%1,d=w.dir>0?-50+u*100:50-u*100;const q2=I.P((w.sum+d)/2,(w.sum-d)/2,0);fig(q2[0],q2[1],w.i+60,{tool:null,act:null})});
  C.sellers.forEach(s=>{const q2=I.P(s.x,s.y,0);fig(q2[0],q2[1],s.i,{tool:null,act:null})});
  if(C.st.ph!==3)cartFx(g,t,35.5,.009,.6,"#d8c49a");
  K.lightsDraw(g,I,C.lights,t);K.nightTint(g,I,W,H,C.st.ph);wxFx(g,t,C.st.wx,C.st.season);
  g.save();g.textAlign="center";g.textBaseline="middle";
  C.labels.forEach(l=>{if(l.grp){g.font='600 16px "Almendra SC","EB Garamond",serif';const tw=g.measureText(l.t).width+26;g.fillStyle="rgba(58,36,20,.88)";g.strokeStyle=l.col;g.lineWidth=2.5;g.beginPath();g.roundRect?g.roundRect(l.X-tw/2,l.Y-14,tw,28,6):g.rect(l.X-tw/2,l.Y-14,tw,28);g.fill();g.stroke();g.fillStyle="#f3e2b0";g.fillText(l.t,l.X,l.Y+1);return}
   const on=l.n&&l.n===tsel;const ar=l.rad?"":l.r>=105?" ▲":l.r<=95?" ▼":"";g.font=`${on?17:14}px "Almendra SC","EB Garamond",serif`;const tw=g.measureText(l.t+ar).width+20,th=on?27:22,X=l.X,Y=l.Y-(on?5+Math.sin(t*3)*3:0);
   g.fillStyle=l.rad?"rgba(244,231,191,.95)":on?"#f6e2a0":l.mine||l.own?"rgba(250,240,212,.96)":"rgba(236,226,200,.88)";g.strokeStyle=on?"#8e1f1c":l.mine||l.own?"#b5892a":"#8a7a5a";g.lineWidth=on?2.5:1.4;
   g.beginPath();g.roundRect?g.roundRect(X-tw/2,Y-th/2,tw,th,4):g.rect(X-tw/2,Y-th/2,tw,th);g.fill();g.stroke();
   if(on){g.fillStyle="#8e1f1c";g.beginPath();g.moveTo(X-7,Y+th/2);g.lineTo(X+7,Y+th/2);g.lineTo(X,Y+th/2+9);g.closePath();g.fill()}
   g.fillStyle="#2a2016";g.fillText(l.t,X-(ar?g.measureText(ar).width/2:0),Y+1);
   if(ar){g.fillStyle=l.r>=105?"#2f6b2a":"#8e1f1c";g.fillText(ar,X+tw/2-10-g.measureText(ar).width/2,Y+1)}
   if(l.own){g.fillStyle="#c9971a";g.strokeStyle="#5e4410";g.lineWidth=1;g.beginPath();g.arc(X-tw/2+1,Y-th/2+1,6,0,7);g.fill();g.stroke()}
   if(!l.rad&&l.r!=null){const st2=`${l.r} % ceny${l.stock?` · máš ${l.stock} ks`:""}`,cl=l.r>=105?"good":l.r<=95?"bad":"";g.font='600 11px "EB Garamond",Georgia,serif';const sw=g.measureText(st2).width+14,sy=Y+th/2+10;
    g.fillStyle=cl==="good"?"rgba(226,240,206,.94)":cl==="bad"?"rgba(246,222,210,.94)":"rgba(240,232,212,.9)";g.strokeStyle=cl==="good"?"#5a8a3a":cl==="bad"?"#a0463a":"#8a7a5a";g.lineWidth=1;g.beginPath();g.roundRect?g.roundRect(X-sw/2,sy-8,sw,16,8):g.rect(X-sw/2,sy-8,sw,16);g.fill();g.stroke();g.fillStyle=cl==="good"?"#2f5a1e":cl==="bad"?"#7a1f18":"#4a4032";g.fillText(st2,X,sy+1)}});
  g.restore()}});

/* ---------- rodová sieň: rozcestník rodu (portréty, rodokmeň, predkovia, krb s erbom, schodisko, služobníctvo) ---------- */
const IR=ISO({W,H,s:44,ox:845,oy:420,seed:46});
const RIMG={};let rN=0;
function rast(key,svg){if(RIMG[key])return RIMG[key];const im=new Image();RIMG[key]=im;try{
 const seen=new Set();let defs="";const add=id=>{if(seen.has(id)||svg.includes('id="'+id+'"'))return;seen.add(id);const el=document.getElementById(id);if(!el)return;const h=el.outerHTML;defs+=h;(h.match(/href="#([^"]+)"/g)||[]).forEach(m=>add(m.slice(7,-1)));(h.match(/url\(#([^)]+)\)/g)||[]).forEach(m=>add(m.slice(5,-1)))};
 [...new Set([...svg.matchAll(/url\(#([^)]+)\)/g)].map(m=>m[1]))].forEach(add);
 svg=svg.replace(/xlink:href/g,"href").replace(/<svg([^>]*)>/,(m,a)=>`<svg${/xmlns=/.test(a)?"":' xmlns="http://www.w3.org/2000/svg"'}${a}>${defs?"<defs>"+defs.replace(/xlink:href/g,"href")+"</defs>":""}`);
 im.onload=()=>{rN++};im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)}catch(e){}return im}
const famList=()=>{const p=P();const L=[];if(p.head)L.push([p.head,"head"]);if(p.spouse)L.push([p.spouse,"spouse"]);(p.kids||[]).slice(0,3).forEach(k=>L.push([k,"kid"]));return L};
function portraitOf(p,role){const key="rp"+(p.pid||p.name)+"_"+(p.age||0)+"_"+role+"_"+JSON.stringify(P().outfit||"").length;try{return rast(key,personPortrait(P(),p,role,120,{front:1}))}catch(e){try{return rast(key+"h",personPortrait(P(),p,"head",120,{front:1}))}catch(x){return null}}}
function crestImg(){const a=armsOf(0);return rast("rc"+JSON.stringify(a),`<svg viewBox="0 0 20 24"><defs><clipPath id="shc"><path d="${SHP}"/></clipPath></defs>${shieldIn(a)}</svg>`)}
/* kreslenie na stene: lavá stena = rovina x=xx (vidno z +x), pravá stena = rovina y=yy (vidno z +y); u doprava, v nadol, v jednotkách sveta */
function onWall(g,wall,a,z,plane,cb){const k=IR.k,zs=IR.zs;const o=wall==="L"?IR.P(plane,a,z):IR.P(a,plane,z);g.save();if(wall==="L")g.transform(k,-k/2,0,zs,o[0],o[1]);else g.transform(k,k/2,0,zs,o[0],o[1]);try{cb(g)}catch(e){}g.restore()}
const wallRect=(wall,a,z,w,h,plane=0)=>{const pts=wall==="L"?[IR.P(plane,a,z),IR.P(plane,a-w,z),IR.P(plane,a-w,z-h),IR.P(plane,a,z-h)]:[IR.P(a,plane,z),IR.P(a+w,plane,z),IR.P(a+w,plane,z-h),IR.P(a,plane,z-h)];const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]};
function frame(g,w,h,gold){g.fillStyle=gold?"#c9a03a":"#5a3a1a";g.fillRect(-.14,-.14,w+.28,h+.28);g.strokeStyle=gold?"#7a5a14":"#2a1a0a";g.lineWidth=.04;g.strokeRect(-.14,-.14,w+.28,h+.28);g.fillStyle="#2a1a10";g.fillRect(0,0,w,h)}
const RW={L:14,R:22,H:9};
KSCENE.register("sien",{id:"sien",W,H,label:"Rodová sieň",
 state:()=>{const p=P();const tiles=[...document.querySelectorAll("main .rtiles .rtile")].map(t=>[t.dataset.v,txt(t.querySelector(".rtx small")),txt(t.querySelector(".rbadges"))]);
  return{ph:todPh()===3?3:1,season:S.season,house:p.house||0,title:p.title||0,n:famList().length,tiles,rn:rN}},
 build:st=>{I=IR;const shc=I.begin(st.ph,st.season,{});const c=I.off(W,H),x=c.getContext("2d");
  x.fillStyle="#1a120a";x.fillRect(0,0,W,H);
  const rich=st.house>=2||st.title>=4,wtex=rich?"plaster":"timber";
  I.groundPlane(x,g=>{g.save();g.scale(.05,.05);g.fillStyle=I.pat(g,rich?"top":"wood");g.fillRect(0,0,RW.R*20,RW.L*20);g.restore();
   g.fillStyle=rich?"#7a1f1c":"#6a4a2a";g.globalAlpha=.85;g.fillRect(3,3.5,10,7.5);g.globalAlpha=1;g.strokeStyle=rich?"#d9ab3e":"#a07a3a";g.lineWidth=.12;g.strokeRect(3.3,3.8,9.4,6.9);
   g.globalCompositeOperation="multiply";g.fillStyle=I.col(I.bright([0,0,1]));g.fillRect(0,0,RW.R,RW.L);g.globalCompositeOperation="source-over"});
  const hot=[],labels=[],folk=[];
  /* steny */
  I.box(-.7,0,.7,RW.L,RW.H,{tex:wtex,timber:wtex==="timber",noTop:1,noShadow:1,dd:-200,tpu:10});
  I.box(0,-.7,RW.R,.7,RW.H,{tex:wtex,timber:wtex==="timber",noTop:1,noShadow:1,dd:-200,tpu:10});
  /* obklad a lišty na stenách */
  I.push({d:-150,draw:g=>{[["L",RW.L],["R",RW.R]].forEach(([w,len])=>onWall(g,w,w==="L"?len:0,2.4,0,q=>{q.fillStyle=rich?"#5a2a1a":"#5a3a1e";q.fillRect(0,0,len,2.4);q.fillStyle="rgba(0,0,0,.18)";for(let i=0;i<len;i+=1.6)q.fillRect(i,.15,.06,2.1);q.fillStyle="#c9a03a";q.fillRect(0,-.08,len,.1);q.fillStyle="#3a2414";q.fillRect(0,-RW.H+2.4,len,.35)}))}});
  /* gobelín s rodokmeňom (ľavá stena) */
  const TP=[11,7.6,3.4,5.2];
  I.push({d:-140,draw:g=>onWall(g,"L",TP[0],TP[1],0,q=>{const w=TP[2],h=TP[3];q.fillStyle="#3a2414";q.fillRect(-.2,-.25,w+.4,.18);q.fillStyle="#6e1c1a";q.fillRect(0,0,w,h);q.strokeStyle="#d9ab3e";q.lineWidth=.08;q.strokeRect(.12,.12,w-.24,h-.24);
   q.strokeStyle="#5a3a1a";q.lineWidth=.22;q.beginPath();q.moveTo(w/2,h-.4);q.lineTo(w/2,h*.45);q.moveTo(w/2,h*.62);q.lineTo(w*.25,h*.4);q.moveTo(w/2,h*.62);q.lineTo(w*.75,h*.4);q.moveTo(w/2,h*.45);q.lineTo(w/2,h*.2);q.stroke();
   q.fillStyle="#3f7a3a";[[.5,.18],[.25,.36],[.75,.36],[.5,.42],[.15,.25],[.85,.25]].forEach(([a,b])=>{q.beginPath();q.arc(w*a,h*b,.42,0,7);q.fill()});
   q.fillStyle="#e2b85a";[[.5,.18],[.25,.36],[.75,.36]].forEach(([a,b])=>{q.beginPath();q.arc(w*a,h*b,.16,0,7);q.fill()});
   q.fillStyle="#d9ab3e";for(let i=0;i<7;i++){q.beginPath();q.moveTo(i*w/7,h);q.lineTo((i+.5)*w/7,h+.3);q.lineTo((i+1)*w/7,h);q.fill()}})});
  hot.push({r:wallRect("L",TP[0],TP[1],TP[2],TP[3]),data:{a:"rodSec",v:"rodokmen"},label:"Rodokmeň"});
  {const m=IR.P(0,TP[0]-TP[2]/2,TP[1]+.7);labels.push({X:m[0],Y:m[1],v:"rodokmen",t:"Rodokmeň"})}
  /* klenutý vchod do galérie predkov */
  const AR=[13.7,6.4,1.9,6.4];
  I.push({d:-140,draw:g=>onWall(g,"L",AR[0],AR[1],0,q=>{const w=AR[2],h=AR[3];q.fillStyle="#6b5a48";q.beginPath();q.moveTo(-.25,h);q.lineTo(-.25,1);q.arc(w/2,1,w/2+.25,Math.PI,0);q.lineTo(w+.25,h);q.closePath();q.fill();
   const gr=q.createLinearGradient(0,0,0,h);gr.addColorStop(0,"#1a120c");gr.addColorStop(1,"#3a2616");q.fillStyle=gr;q.beginPath();q.moveTo(0,h);q.lineTo(0,1);q.arc(w/2,1,w/2,Math.PI,0);q.lineTo(w,h);q.closePath();q.fill();
   q.fillStyle="#c9a03a";q.fillRect(w*.3,1.6,w*.4,1.2);q.fillStyle="#4a3424";q.fillRect(w*.34,1.68,w*.32,1.04)})});
  hot.push({r:wallRect("L",AR[0],AR[1],AR[2],AR[3]),data:{a:"rodSec",v:"predkovia"},label:"Predkovia – galéria, krypta, cintorín"});
  {const m=IR.P(0,AR[0]-AR[2]/2,AR[1]+.7);labels.push({X:m[0],Y:m[1],v:"predkovia",t:"Predkovia"})}
  /* krb s erbom (pravá stena) */
  const FX=1,FW=4.6;
  I.setCur("krb");I.box(FX,0,FW,1.3,4,{tex:"wall",quoin:1,noTop:0,noShadow:1,tpu:10});I.box(FX+.4,0,FW-.8,1,RW.H-4,{tex:rich?"plaster":"wall",z:4,noTop:1,noShadow:1,tpu:10});I.setCur(null);
  I.push({d:FX+FW+1.4,draw:g=>onWall(g,"R",FX+.8,2.6,1.3,q=>{const w=FW-1.6,h=2.6;q.fillStyle="#120a06";q.beginPath();q.moveTo(0,h);q.lineTo(0,.9);q.quadraticCurveTo(w/2,-.3,w,.9);q.lineTo(w,h);q.closePath();q.fill();q.fillStyle="#5a3a1e";q.fillRect(.4,h-.5,w-.8,.3)})});
  hot.push({r:(()=>{const r=wallRect("R",FX,RW.H-.5,FW,RW.H-.5,1.3);return r})(),data:{a:"rodSec",v:"sidlo"},label:"Sídlo – dom rodu, vylepšenia"});
  {const m=IR.P(FX+FW/2,1,RW.H-.2);labels.push({X:m[0],Y:m[1],v:"sidlo",t:"Sídlo"})}
  /* schodisko nahor (postup) */
  const SX=6.6;for(let i=0;i<7;i++)I.box(SX+i*.75,0,.75,2.6,.55*(i+1),{tex:"wood",clean:1,noShadow:1,tpu:8});
  I.box(SX+5.25,0,2,2.6,.55*7,{tex:"wood",clean:1,noShadow:1,tpu:8});
  I.push({d:SX+8+3,draw:g=>{g.strokeStyle="#3a2414";g.lineWidth=4;const a=IR.P(SX,2.6,1.6),b=IR.P(SX+5.25,2.6,.55*7+1.4);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();for(let i=0;i<=7;i++){const p0=IR.P(SX+i*.75,2.6,.55*i),p1=IR.P(SX+i*.75,2.6,.55*i+1.5);g.lineWidth=2.5;g.beginPath();g.moveTo(p0[0],p0[1]);g.lineTo(p1[0],p1[1]);g.stroke()}}});
  {const a=IR.P(SX-.2,2.8,0),b=IR.P(SX+7.4,0,5.5),cc=IR.P(SX+7.4,2.8,0);hot.push({r:[a[0],b[1],cc[0],Math.max(a[1],cc[1])],data:{a:"rodSec",v:"postup"},label:"Postup – tituly a hodnosti"});const m=IR.P(SX+1.2,1.6,3.6);labels.push({X:m[0],Y:m[1],v:"postup",t:"Postup"})}
  /* stôl so zvončekom a sluha */
  I.box(5.2,7.2,4.6,2,1.25,{tex:"wood",clean:1,tpu:8});I.box(5.2,6.3,4.6,.6,.7,{tex:"wood",clean:1,tpu:8,noShadow:1});I.box(5.2,9.5,4.6,.6,.7,{tex:"wood",clean:1,tpu:8,noShadow:1});
  I.push({d:5.2+4.6+7.2+2+.5,draw:g=>{const p=IR.P(8.6,8.2,1.25);g.fillStyle="#d9ab3e";g.strokeStyle="#7a5a14";g.lineWidth=1.5;g.beginPath();g.moveTo(p[0]-9,p[1]);g.quadraticCurveTo(p[0]-8,p[1]-20,p[0],p[1]-22);g.quadraticCurveTo(p[0]+8,p[1]-20,p[0]+9,p[1]);g.closePath();g.fill();g.stroke();
   const c2=IR.P(6.2,8.2,1.25);g.fillStyle="#e8dcc0";g.fillRect(c2[0]-5,c2[1]-26,10,26);g.fillStyle="#ffcf5a";g.beginPath();g.ellipse(c2[0],c2[1]-32,4,7,0,0,7);g.fill()}});
  {const a=IR.P(5,9.8,0),b=IR.P(9.9,7,2.6);hot.push({r:[a[0]-10,b[1]-30,b[0]+40,a[1]+10],data:{a:"rodSec",v:"sluzby"},label:"Služobníctvo"});const m=IR.P(7.4,8.2,3.4);labels.push({X:m[0],Y:m[1],v:"sluzby",t:"Služobníctvo"})}
  /* stoličky a truhlica pri ľavej stene */
  I.box(.6,10.4,2.6,1.4,1.2,{tex:"wood",clean:1,tpu:8});
  /* rodina: postavy v sieni */
  famList().forEach(([p,role],i)=>{const pos=[[3.6,4.2],[4.8,3.6],[2.8,5.6],[5.6,5.2],[3.8,6.4]][i]||[3+i,6];folk.push({x:pos[0],y:pos[1],p,role,i})});
  if(famList().length){const a=IR.P(2.4,6.8,0),b=IR.P(6.2,3.2,4.4);hot.push({r:[a[0]-20,b[1],b[0]+30,a[1]+10],data:{a:"rodSec",v:"rodina"},label:"Rodina"})}
  I.drawSolids(x,shc,.35);
  /* portréty rodiny na ľavej stene */
  const PR=famList().map(([p,role],i)=>{const big=i===0,w=big?2.1:1.4,h=w*1.2,a=6.6-(big?0:2.5+ (i-1)*1.7)+(big?0:0),z=big?7.4:6.6;return{p,role,a:i===0?6.6:4.2-(i-1)*1.6,z,w,h}});
  PR.forEach(r=>hot.push({r:wallRect("L",r.a,r.z,r.w,r.h),data:{a:"rodSec",v:"rodina"},label:"Rodina – "+(r.p.name||"")}));
  {const m=IR.P(0,5.2,8);labels.push({X:m[0],Y:m[1],v:"rodina",t:"Rodina"})}
  K.vignette(x,W,H,.4);
  return{img:c,hot,labels,folk,PR,st,FX,FW}},
 animate:(g,C,t)=>{I=IR;
  /* portréty a erb */
  C.PR.forEach((r,i)=>{const im=portraitOf(r.p,r.role);onWall(g,"L",r.a,r.z,0,q=>{q.translate(0,0);frame(q,r.w,r.h,true);if(im&&im.complete&&im.naturalWidth)q.drawImage(im,0,0,r.w,r.h);q.fillStyle="#e8dcc0";q.fillRect(r.w*.15,r.h+.25,r.w*.7,.36);q.fillStyle="#2a2016";q.font=".26px 'Almendra SC',serif";q.textAlign="center";q.textBaseline="middle";q.fillText((r.p.name||"").slice(0,14),r.w/2,r.h+.44)})});
  {const im=crestImg();onWall(g,"R",C.FX+C.FW/2-.95,7.9,1.05,q=>{if(im&&im.complete&&im.naturalWidth)q.drawImage(im,0,0,1.9,2.3)})}
  /* oheň v krbe */
  {const b=IR.P(C.FX+C.FW/2,1.5,.35);const gl=g.createRadialGradient(b[0],b[1]-20,4,b[0],b[1]-20,240);gl.addColorStop(0,"rgba(255,170,70,.45)");gl.addColorStop(1,"rgba(255,140,40,0)");g.save();g.globalCompositeOperation="screen";g.fillStyle=gl;g.fillRect(b[0]-260,b[1]-260,520,520);g.restore();
   for(let i=0;i<6;i++){const f=Math.sin(t*9+i*1.7)*.5+.5,hh=26+f*30,ww=12+i%3*4,ox2=(i-2.5)*13;const gr=g.createLinearGradient(0,b[1],0,b[1]-hh);gr.addColorStop(0,"rgba(255,220,120,.95)");gr.addColorStop(.5,"rgba(255,140,40,.85)");gr.addColorStop(1,"rgba(200,40,10,0)");g.fillStyle=gr;g.beginPath();g.moveTo(b[0]+ox2-ww/2,b[1]);g.quadraticCurveTo(b[0]+ox2-ww*.3,b[1]-hh*.6,b[0]+ox2+Math.sin(t*6+i)*4,b[1]-hh);g.quadraticCurveTo(b[0]+ox2+ww*.3,b[1]-hh*.6,b[0]+ox2+ww/2,b[1]);g.fill()}}
  /* postavy */
  C.folk.forEach(f=>{const q2=IR.P(f.x,f.y,0);try{KFIG2.draw(g,q2[0],q2[1],f.role==="kid"?4.6:6,{look:f.p.look||{g:f.p.gender||"m",skin:1},robe:["#2f4f7a","#7a2f3a","#3a5a3a","#6a4a2a","#4a3a6a"][f.i%5],title:f.role==="kid"?0:P().title||0,hat:null,tool:null,t,i:f.i})}catch(e){}});
  K.nightTint(g,IR,W,H,C.st.ph);
  let sec="";try{sec=S.view==="rod"&&S.rodSec||""}catch(e){}
  if(sec){const hs=C.hot.filter(h=>h.data.v===sec);if(hs.length){let x1=1e9,y1=1e9,x2=-1e9,y2=-1e9;hs.forEach(h=>{x1=Math.min(x1,h.r[0]);y1=Math.min(y1,h.r[1]);x2=Math.max(x2,h.r[2]);y2=Math.max(y2,h.r[3])});const cx=(x1+x2)/2,cy=(y1+y2)/2,Rr=Math.max(x2-x1,y2-y1)*.6+60;const gr=g.createRadialGradient(cx,cy,Rr*.6,cx,cy,Rr*2);gr.addColorStop(0,"rgba(8,5,2,0)");gr.addColorStop(1,"rgba(8,5,2,.66)");g.fillStyle=gr;g.fillRect(0,0,W,H)}}
  /* štítky */
  const T=new Map(C.st.tiles.map(x=>[x[0],x]));
  g.save();g.textAlign="center";g.textBaseline="middle";
  C.labels.forEach(l=>{g.globalAlpha=sec&&l.v!==sec?.45:1;const ti=T.get(l.v)||[];const sub=ti[1]||"",bad=ti[2]||"";g.font='19px "Almendra SC","EB Garamond",serif';const w1=g.measureText(l.t).width;g.font='14px "EB Garamond",serif';const w2=g.measureText(sub).width;const tw=Math.max(w1,w2)+26,th=sub?46:30,X=l.X,Y=l.Y-(bad?Math.sin(t*3)*2:0);
   g.fillStyle="rgba(250,240,212,.95)";g.strokeStyle=bad?"#8e1f1c":"#b5892a";g.lineWidth=bad?2.5:1.6;g.beginPath();g.roundRect?g.roundRect(X-tw/2,Y-th/2,tw,th,5):g.rect(X-tw/2,Y-th/2,tw,th);g.fill();g.stroke();
   g.fillStyle="#8e1f1c";g.font='19px "Almendra SC","EB Garamond",serif';g.fillText(l.t,X,Y-(sub?9:0));if(sub){g.fillStyle="#4a3a26";g.font='14px "EB Garamond",serif';g.fillText(sub,X,Y+11)}
   if(bad){g.fillStyle="#b8362c";g.beginPath();g.arc(X+tw/2-3,Y-th/2+3,8,0,7);g.fill();g.fillStyle="#fff";g.font="bold 12px sans-serif";g.fillText("!",X+tw/2-3,Y-th/2+3.5)}});
  g.restore()}});

/* ---------- hlavné menu: živá panoráma Prešporka roku 1400 (hrad, hradby, dóm, Dunaj s loďami); čas a obdobie podľa skutočných hodín ---------- */
const IP=ISO({W,H,s:17,ox:1220,oy:540,seed:48});
const realPh=()=>{const h=new Date().getHours();return h>=21||h<5?3:h<8?0:h>=18?2:1};
const realSeason=()=>{const m=new Date().getMonth();return m>=2&&m<=4?0:m<=7?1:m<=10?2:3};
KSCENE.register("panorama",{id:"panorama",W,H,label:"Prešporok roku 1400",
 state:()=>({ph:realPh(),season:realSeason()}),
 build:st=>{I=IP;const shc=I.begin(st.ph,st.season,{wx:"jasno"});const c=I.off(W,H),x=c.getContext("2d");K.skyBg(x,I,W,H);
  const HZ=-40,hy=I.oy+.5*I.k*HZ,hz=I.T.haze,cl=(a,m)=>`rgba(${Math.round(hz[0]*m)},${Math.round(hz[1]*m)},${Math.round(hz[2]*m)},${a})`;
  x.fillStyle=cl(.9,.78);x.beginPath();x.moveTo(0,hy+4);for(let i=0;i<=40;i++){const X=i*W/40;x.lineTo(X,hy-40-34*Math.sin(i*.55+1)-16*Math.sin(i*1.9))}x.lineTo(W,hy+4);x.closePath();x.fill();
  x.fillStyle=cl(.9,.62);x.beginPath();x.moveTo(0,hy+4);for(let i=0;i<=40;i++){const X=i*W/40;x.lineTo(X,hy-14-20*Math.sin(i*.8+3)-8*Math.sin(i*2.7))}x.lineTo(W,hy+4);x.closePath();x.fill();
  const v=n=>n/Math.SQRT2;
  I.groundPlane(x,g=>{g.rotate(-Math.PI/4);g.save();g.scale(.1,.1);g.fillStyle=I.pat(g,"grass");g.fillRect(-2400,v(HZ)*10,4800,2400);g.restore();
   g.rotate(Math.PI/4);g.save();g.scale(.1,.1);
   const VC=["#6f8a3a","#7d9a4a","#5f7a32"];for(let k=0;k<7;k++){g.fillStyle=VC[k%3];g.globalAlpha=.6;g.fillRect((-30+k*9)*10,-420,80,180);g.globalAlpha=.25;g.fillStyle="#2a3a14";for(let r=0;r<80;r+=8)g.fillRect((-30+k*9)*10+r,-420,3,180)}g.globalAlpha=1;
   g.fillStyle=I.pat(g,"cobble");g.fillRect(-80,-140,300,240);g.fillRect(40,-60,80,60);
   g.fillStyle=I.pat(g,"water");g.fillRect(-1200,130,2800,90);
   const FC=["#a08a4a","#7d9a4a","#b39a58","#86a052"];for(let k=0;k<10;k++){g.fillStyle=FC[k%4];g.globalAlpha=.5;g.fillRect((-40+k*12)*10,240,110,160)}g.globalAlpha=1;
   g.restore();g.globalCompositeOperation="multiply";g.fillStyle=I.col(I.bright([0,0,1]));g.fillRect(-120,-120,240,240)});
  /* hradby s vežami a bránami */
  const WX=[-8,22],WY=[-14,10],WH=3.2;
  I.box(WX[0],WY[0],WX[1]-WX[0],1,WH,{tex:"wall",tpu:12});I.box(WX[0],WY[1],WX[1]-WX[0],1,WH,{tex:"wall",tpu:12});I.box(WX[0],WY[0],1,WY[1]-WY[0],WH,{tex:"wall",tpu:12});I.box(WX[1],WY[0],1,WY[1]-WY[0]+1,WH,{tex:"wall",tpu:12});
  [[WX[0],WY[0]],[WX[1],WY[0]],[WX[0],WY[1]],[WX[1],WY[1]],[7,WY[1]],[WX[0],-2],[WX[1],-2]].forEach(([tx,ty])=>{I.box(tx-.6,ty-.6,2.2,2.2,5.2,{tex:"wall",quoin:1,tpu:12});I.gable(tx-.6,ty-.6,2.2,2.2,5.2,1.8,"tile",{tpu:10,gableTex:"wallX"})});
  I.box(5.4,WY[0]-1,3,3,10,{tex:"wall",quoin:1,doorY:[1,1,2,1],tpu:12});I.gable(5.4,WY[0]-1,3,3,10,6,"slate",{tpu:10,gableTex:"wallX"});
  /* domy mesta */
  let n=0;for(let gx=-6;gx<20;gx+=4.2)for(let gy=-12;gy<8;gy+=3.8){n++;if(gx>3&&gx<12&&gy>-7&&gy<1)continue;if(gx<2&&gy>2.5)continue;if(gx>5&&gx<9.5&&gy<-10)continue;
   const w=3+(n*7%3)*.4,d=2.8+(n*11%2)*.4,h=2.4+(n*13%4)*.6;house(gx,gy,w,d,h,{tex:n%3?"timber":"plaster",roof:n%5===0?"slate":"tile",chim:n%3===1?[gx+w*.7]:[]})}
  /* dóm sv. Martina */
  I.box(-6.5,3.5,7,3.4,5.4,{tex:"wall",quoin:1,tpu:12});I.gable(-6.5,3.5,7,3.4,5.4,2.4,"slate",{tpu:10,gableTex:"wallX"});
  I.box(-7,3.2,2.6,2.6,13,{tex:"wall",quoin:1,sqY:[[.9,10,.8,1]],tpu:12});I.gable(-7,3.2,2.6,2.6,13,7,"slate",{tpu:10,gableTex:"wallX"});
  /* radnica s vežou */
  I.box(6,-5,4.4,3,4.2,{tex:"plaster",quoin:1,tpu:12});I.gable(6,-5,4.4,3,4.2,1.8,"tile",{tpu:10,gableTex:"plasterX"});I.box(9.2,-5.6,1.8,1.8,10,{tex:"plaster",quoin:1,tpu:12});I.gable(9.2,-5.6,1.8,1.8,10,4,"slate",{tpu:10,gableTex:"plasterX"});
  /* hradný kopec a hrad so štyrmi vežami */
  const HX=-27,HY=-10,CX=HX+4.4,CY=HY+5,CZ=4.6;
  {const hc=[CX+3.7,CY+2.8],R0=[10.5,11],R1=[5.6,4.8];I.push({d:CX+CY-1,draw:g=>{const ring=(rr,z,a0,a1)=>{const pts=[];for(let i=0;i<=24;i++){const a=a0+(a1-a0)*i/24;pts.push(IP.P(hc[0]+Math.cos(a)*rr[0],hc[1]+Math.sin(a)*rr[1],z))}return pts};
   const base=ring(R0,0,0,Math.PI*2),top=ring(R1,CZ,0,Math.PI*2);const xs=base.concat(top);const minX=Math.min(...xs.map(p=>p[0])),maxX=Math.max(...xs.map(p=>p[0])),minY=Math.min(...top.map(p=>p[1]));
   const sil=[];const L=xs.reduce((a,p)=>p[0]<a[0]?p:a),Rr=xs.reduce((a,p)=>p[0]>a[0]?p:a);
   const gr=g.createLinearGradient(0,minY,0,Math.max(...base.map(p=>p[1])));const T2=IP.T,br=IP.bright([0,0,1]);gr.addColorStop(0,`rgb(${Math.round(120*br+20)},${Math.round(118*br+20)},${Math.round(70*br+10)})`);gr.addColorStop(1,`rgb(${Math.round(90*br)},${Math.round(80*br)},${Math.round(56*br)})`);
   g.fillStyle=gr;g.beginPath();base.forEach((p,k)=>k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();
   g.beginPath();g.moveTo(L[0],L[1]);top.filter(p=>p[1]<=IP.P(hc[0],hc[1],CZ)[1]+2).sort((a,b)=>a[0]-b[0]).forEach(p=>g.lineTo(p[0],p[1]));g.lineTo(Rr[0],Rr[1]);base.filter(p=>p[1]>=IP.P(hc[0],hc[1],0)[1]-2).sort((a,b)=>b[0]-a[0]).forEach(p=>g.lineTo(p[0],p[1]));g.closePath();g.fill();
   g.fillStyle=`rgba(${Math.round(150*br)},${Math.round(150*br)},${Math.round(100*br)},.9)`;g.beginPath();top.forEach((p,k)=>k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();
   g.strokeStyle="rgba(60,50,35,.35)";g.lineWidth=1.5;for(let i=0;i<14;i++){const a=Math.PI*.15+i*Math.PI*.05,p0=IP.P(hc[0]+Math.cos(a)*R1[0],hc[1]+Math.sin(a)*R1[1],CZ),p1=IP.P(hc[0]+Math.cos(a)*R0[0],hc[1]+Math.sin(a)*R0[1],0);g.beginPath();g.moveTo(p0[0],p0[1]);g.quadraticCurveTo((p0[0]+p1[0])/2+6,(p0[1]+p1[1])/2,p1[0],p1[1]);g.stroke()}}})}I.box(CX,CY,7.4,5.6,6.4,{tex:"plaster",z:CZ,tpu:12,sqY:[[1,4,.8,1],[3,4,.8,1],[5,4,.8,1]]});I.gable(CX,CY,7.4,5.6,CZ+6.4,2.6,"tile",{tpu:10,gableTex:"plasterX"});
  [[CX-.8,CY-.8],[CX+6.6,CY-.8],[CX-.8,CY+4.8],[CX+6.6,CY+4.8]].forEach(([tx,ty])=>{I.box(tx,ty,1.6,1.6,9,{tex:"plaster",z:CZ,tpu:12});I.gable(tx,ty,1.6,1.6,CZ+9,1.6,"tile",{tpu:10,gableTex:"plasterX"})});
  /* lodný most cez Dunaj */
  for(let i=0;i<8;i++)I.box(12.6,13.6+i*1.1,2.6,.9,.35,{tex:"wood",clean:1,noShadow:1,tpu:6});
  /* stromy */
  [[-34,14],[-30,18],[-20,20],[-10,26],[0,28],[14,30],[26,26],[34,20],[30,8],[32,-4],[-18,-16],[-12,-22],[2,-24],[16,-22],[28,-18],[-36,0],[-34,-12]].forEach(([tx,ty],j)=>I.tree(tx,ty,1+j%3*.3,2.8+j%2));
  I.drawSolids(x,shc,.4);K.vignette(x,W,H,.35);
  return{img:c,lights:I.lights.slice(),smokes:I.smokes.slice(),st,hy}},
 animate:(g,C,t)=>{I=IP;
  /* oblaky */
  if(C.st.ph!==3)for(let i=0;i<5;i++){const xx=((t*8*(1+i%3*.3)+i*420)%(W+400))-200,yy=60+i*34;g.fillStyle="rgba(255,255,255,.55)";g.beginPath();g.ellipse(xx,yy,90,18,0,0,7);g.ellipse(xx+50,yy-10,60,16,0,0,7);g.ellipse(xx-50,yy-6,50,14,0,0,7);g.fill()}
  /* vtáky */
  for(let i=0;i<6;i++){const xx=((t*40+i*260)%(W+200))-100,yy=150+Math.sin(t*.7+i)*30+i*14,fl=Math.sin(t*8+i)*5;g.strokeStyle="rgba(40,30,20,.7)";g.lineWidth=1.6;g.beginPath();g.moveTo(xx-7,yy-fl);g.lineTo(xx,yy);g.lineTo(xx+7,yy-fl);g.stroke()}
  /* dym */
  C.smokes.forEach(([sx,sy,sz],i)=>{const[X,Y]=IP.P(sx,sy,sz);for(let k=0;k<3;k++){const u=(t*.25+k*.33+i*.13)%1;g.fillStyle=`rgba(225,225,230,${(1-u)*.4})`;g.beginPath();g.arc(X+u*10,Y-u*30,2+u*6,0,7);g.fill()}});
  /* lode na Dunaji */
  for(let i=0;i<3;i++){const yy=15+i*2.2,dir=i%2?1:-1,xx=dir>0?-40+((t*.9+i*20)%90):50-((t*.8+i*25)%90);if(xx>10&&xx<17)continue;const a=IP.P(xx,yy,.1),b=IP.P(xx+3.2,yy,.1),cc=IP.P(xx+3.2,yy+1,.1),d=IP.P(xx,yy+1,.1),tip=IP.P(xx+(dir>0?4:-.8),yy+.5,.3);g.fillStyle="#5a3418";g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.lineTo(cc[0],cc[1]);g.lineTo(d[0],d[1]);g.closePath();g.fill();g.beginPath();g.moveTo(dir>0?b[0]:a[0],dir>0?b[1]:a[1]);g.lineTo(tip[0],tip[1]);g.lineTo(dir>0?cc[0]:d[0],dir>0?cc[1]:d[1]);g.closePath();g.fill();const m0=IP.P(xx+1.6,yy+.5,.3),m1=IP.P(xx+1.6,yy+.5,3);g.strokeStyle="#3a2414";g.lineWidth=2;g.beginPath();g.moveTo(m0[0],m0[1]);g.lineTo(m1[0],m1[1]);g.stroke();g.fillStyle="#efe4c8";g.beginPath();g.moveTo(m1[0],m1[1]+2);g.quadraticCurveTo(m1[0]+dir*18,m1[1]+16,m0[0]+dir*2,m0[1]-6);g.closePath();g.fill()}
  K.lightsDraw(g,IP,C.lights,t);K.nightTint(g,IP,W,H,C.st.ph)}});
/* oprava: obraz sídla na celú obrazovku (stav S.sidloFull sa predtým do obrazu nepremietol) */
function sidloFullFix(){const on=!!(hasS()&&S.sidloFull&&S.view==="rod"&&S.rodSec==="sidlo");document.body.classList.toggle("sfull",on);const sb=q(".sidlobig .svbox");if(!sb)return;sb.classList.toggle("fullview",on);const fb=sb.querySelector(".fullbtn");if(fb){fb.textContent=on?"✕ Zavrieť":"⛶ Celý obraz";fb.title=on?"Zavrieť (Esc)":"Zobraziť izbu ako obraz na celú obrazovku"}}
function mmLayout(){const mm=q(".mainmenu");let on=false;try{on=!!mm&&!q(".newrod")&&desk()&&hbPref()}catch(e){}
 const b=document.body;b.classList.toggle("mmsc",on);if(!on)return;
 let sc=document.getElementById("dscene");if(sc&&!sc.querySelector('[data-ks="panorama"]')){sc.remove();sc=null}
 if(!sc){sc=document.createElement("div");sc.id="dscene";sc.innerHTML=KSCENE.markup("panorama");b.prepend(sc);KSCENE.mountAll()}}

/* ---------- založenie rodu: panoráma, maliarsky stojan s náhľadom rodu a formulár v krokoch ---------- */
let nrs="rod";
const NRS=[["rod","1 · Meno"],["vzhlad","2 · Vzhľad"],["zac","3 · Začiatok"],["ulozene","Uložené hry"]];/* RPG (v361): erb a povolanie sa pri založení nevyberajú */
const nrGroup=l=>{l=(l||"").toLowerCase();return l.startsWith("erb")?"erb":l.startsWith("vzhľad")?"vzhlad":l.startsWith("povolanie")?"pov":"zac"};
function nrApply(){const sd=document.getElementById("dside");if(!sd||!sd.classList.contains("nr"))return;
 sd.querySelectorAll(".dstabs [data-nrs]").forEach(b=>{const on=b.dataset.nrs===nrs;b.classList.toggle("on",on);b.setAttribute("aria-selected",String(on))});
 const form=sd.querySelector(".nrform"),saved=sd.querySelector(".nrsaved");if(saved)saved.style.display=nrs==="ulozene"?"":"none";
 if(form){form.style.display=nrs==="ulozene"?"none":"";let g="rod";[...form.children].forEach(c=>{if(c.tagName==="H2"){c.style.display="none";return}if(c.matches("p.lbl"))g=nrGroup(txt(c));c.style.display=g===nrs?"":"none"})}
 const nx=sd.querySelector('[data-nrnext]');const i=NRS.findIndex(x=>x[0]===nrs);if(nx){const nn=NRS[i+1];nx.style.visibility=nn&&nn[0]!=="ulozene"?"visible":"hidden";if(nn)nx.dataset.nrnext=nn[0]}
 sd.scrollTop=0}
function nrLayout(){const nr=q(".newrod");let on=false;try{on=!!nr&&desk()&&hbPref()}catch(e){}
 const b=document.body;b.classList.toggle("nrsc",on);if(!on){const ea=document.getElementById("nreasel");if(ea)ea.remove();return}
 let sc=document.getElementById("dscene");if(sc&&!sc.querySelector('[data-ks="panorama"]')){sc.remove();sc=null}
 if(!sc){sc=document.createElement("div");sc.id="dscene";sc.innerHTML=KSCENE.markup("panorama");b.prepend(sc);KSCENE.mountAll()}
 let ea=document.getElementById("nreasel");if(!ea){ea=document.createElement("div");ea.id="nreasel";ea.innerHTML=`<svg class="nrlegs" viewBox="0 0 300 420" aria-hidden="true"><path d="M150 10 L40 410 M150 10 L260 410 M150 10 L150 380" stroke="#4a2e14" stroke-width="14" stroke-linecap="round"/><path d="M60 300 H240" stroke="#3a2414" stroke-width="12"/></svg><div class="nrcanvas"></div>`;b.appendChild(ea)}
 const np=q(".newrod aside.np"),cv=ea.querySelector(".nrcanvas");cv.innerHTML="";if(np)cv.appendChild(np);
 let sd=document.getElementById("dside");if(!sd){sd=document.createElement("aside");sd.id="dside";b.appendChild(sd)}
 sd.className="wide nr";sd.setAttribute("aria-label","Založenie rodu");
 const sheets=[...document.querySelectorAll(".newrod .sheet")];const form=sheets.find(s=>/Nový rod/.test(txt(s.querySelector("h2"))));const saved=sheets.find(s=>s!==form&&/Pokračovať/.test(txt(s.querySelector("h2"))));
 const tabs=NRS.filter(x=>x[0]!=="ulozene"||saved);if(!tabs.some(x=>x[0]===nrs))nrs="rod";
 sd.innerHTML=`<div class="dshead"><h2>Nová postava</h2><span><button type="button" class="btn sm" data-a="menuBack">‹ Späť do menu</button></span></div><div class="dstabs" role="tablist">${tabs.map(([k,n])=>`<button type="button" role="tab" data-nrs="${k}">${n}</button>`).join("")}</div><div class="dsbody nrbody"></div><div class="nrfoot"><button type="button" class="btn" data-nrnext="erb">Ďalej ›</button></div>`;
 const body=sd.querySelector(".nrbody");if(form){form.classList.add("nrform");body.appendChild(form);const br=form.querySelector('[data-a="begin"]');const row=br&&br.closest(".row");if(row)sd.querySelector(".nrfoot").appendChild(br)}
 if(saved){saved.classList.add("nrsaved");body.appendChild(saved)}
 nrApply()}
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("#dside.nr [data-nrs],#dside.nr [data-nrnext]");if(!t)return;e.preventDefault();e.stopPropagation();nrs=t.dataset.nrs||t.dataset.nrnext;nrApply()},true);

/* ---------- panel vpravo ---------- */
let tsel=null,ttabP="tovar",unf=null;
function cardFor(id){const t2=q(`main [data-a="jtog"][data-k="b${id}"]`);if(t2)return t2.closest(".jcard");/* detail „Všetko“: karty dielní sú .bcard */const b2=[...document.querySelectorAll("main .bcard")].find(c=>c.querySelector(`[data-b="${id}"]`));return b2||null}
function pick(){const mine=myBall(P());if(!mine.some(x=>x.id===sel)){const f=mine.find(x=>x.city===S.ci)||mine[0];sel=f?f.id:null}}
function tpick(){const cats=trhCats();if(cats.some(c=>c.n===tsel))return;const own=cats.find(c=>catInfo(c).own),mine=cats.find(c=>catInfo(c).mine);tsel=(own||mine||cats[0]).n}
function roster(){
 const mine=myBall(P()).slice().sort((a,b)=>(a.city!==S.ci)-(b.city!==S.ci)||a.city-b.city||a.id-b.id);
 if(!mine.length)return`<p class="dsempty">Zatiaľ nemáš žiadnu dielňu. Postav prvú na voľnej parcele.</p>`;
 return`<div class="dsroster" role="list">${mine.map(b=>{const c=cardFor(b.id);const pr=txt(c&&c.querySelector(".jbig"));const stt=txt(c&&c.querySelector(".jmid .pill"));const cn=b.city!==S.ci?cityN(b.city):"";
  return`<button type="button" role="listitem" class="dsrow${b.id===sel?" on":""}" data-a="dsel" data-b="${b.id}" aria-pressed="${b.id===sel}"><span class="dsdot" style="background:${K.WSIGN[b.type]||"#8a6a3a"}"></span><span class="dsn"><b>${E(bn(b.type))} ${ROMAN(b.lvl)}</b><small>${E(b.w+" "+wl(b.w))}${cn?" · "+E(cn):""}${stt?" · "+E(stt):""}</small></span>${pr?`<span class="dspr ${/^[−-]/.test(pr)?"bad":"good"}">${E(pr)}</span>`:""}</button>`}).join("")}</div>`}
const tabsH=(list,cur,a)=>`<div class="dstabs" role="tablist">${list.map(([k,n])=>`<button type="button" role="tab" aria-selected="${cur===k}" class="${cur===k?"on":""}" data-a="${a}" data-v="${k}">${n}</button>`).join("")}</div>`;
const footH=t=>`<div class="dsfoot"><button type="button" class="btn sm" data-a="dclassic" title="${t}">Všetky podrobnosti</button></div>`;
function dielnePanel(sd){
 pick();let t2=tab;if(t2==="dielna"&&sel==null)t2="stavba";
 sd.innerHTML=`<div class="dshead"><h2>Ulica dielní</h2><span>${E(cityN(S.ci))}</span></div><div class="dssub"></div>${roster()}${tabsH([["dielna","Dielňa"],["stavba","Postaviť"],["hrom","Hromadne"]],t2,"dtab")}<div class="dsbody"></div>${footH("Pôvodné karty: cechy, hospodárenie, sklady, výrobné reťazce")}`;
 const sub=q("main .jsub");if(sub)sd.querySelector(".dssub").appendChild(sub);
 const body=sd.querySelector(".dsbody");
 if(t2==="dielna"){const c=sel!=null&&cardFor(sel);if(c)body.appendChild(c);else body.innerHTML=`<p class="dsempty">Táto dielňa je v inom meste. Vyber ju v zozname vyššie.</p>`}
 else if(t2==="stavba"){const p=q("#sx-dielne-1");if(p)body.appendChild(p);else body.innerHTML=`<p class="dsempty">Stavba tu teraz nie je možná.</p>`}
 else{const tk=q("main .tokbulk"),bb=q("main .bulkbar");if(tk)body.appendChild(tk);if(bb)body.appendChild(bb);if(!tk&&!bb)body.innerHTML=`<p class="dsempty">Žiadne hromadné akcie.</p>`}
}
/* obchodný pult: karta tovaru s cenami, trendom, zásobami a výberom množstva */
const QTY={};
function gTrend(g){const h=(S.hist||{})[g]||[];return h.length>1&&h[h.length-2]>0?h[h.length-1]/h[h.length-2]-1:0}
function gMax(g){const p=P();let lic=true;try{lic=hasLic(S.ci)}catch(e){}const b=bp(g,p),mk=Math.floor(((S.mkt||{})[g]||{}).s||0);
 return{buy:lic?Math.max(0,Math.min(mk,Math.floor(p.money/Math.max(.01,b)))):0,sell:Math.floor(p.wh[g]||0),b,s:sp(g,p),mk,lic}}
function goodCard(g){const G=GOODS[g];if(!G)return"";const m=gMax(g),tr=gTrend(g),q0=Math.max(1,QTY[g]||1);
 const trS=Math.abs(tr)<.005?`<span class="tgtr" title="Cena oproti minulému štvrťroku">→ bez zmeny</span>`:`<span class="tgtr ${tr>0?"up":"dn"}" title="Cena oproti minulému štvrťroku">${tr>0?"▲":"▼"} ${Math.round(Math.abs(tr)*100)} %</span>`;
 let ic="";try{ic=gIcon(g,26)}catch(e){}
 return`<div class="tgd" data-tg="${g}"><div class="tgh">${ic}<b>${E(G.n)}</b>${G.raw?'<small>surovina</small>':""}${trS}</div>
<div class="tgp"><div><span>kúpiš za</span><b>${fmt(Math.round(m.b))} zl.</b></div><div><span>predáš za</span><b>${fmt(Math.round(m.s))} zl.</b></div><div><span>na trhu</span><b>${fmt(m.mk)} ks</b></div><div><span>máš</span><b class="${m.sell?"own":""}">${fmt(m.sell)} ks</b></div></div>
<div class="tgq"><button type="button" class="btn sm" data-tq="-" aria-label="Menej">−</button><input type="number" min="1" max="9999" value="${q0}" data-tqi aria-label="Množstvo: ${E(G.n)}"><button type="button" class="btn sm" data-tq="+" aria-label="Viac">+</button><button type="button" class="btn sm ghost" data-tq="10">10</button><button type="button" class="btn sm ghost" data-tq="max" title="Najviac, koľko predáš (alebo kúpiš, ak nič nemáš)">max</button></div>
<div class="tga"><button type="button" class="btn sm" data-a="buy" data-g="${g}" data-n="${q0}"></button><button type="button" class="btn sm pri" data-a="sell" data-g="${g}" data-n="${q0}"></button></div></div>`}
function tgUpdate(card){const g=card.dataset.tg,m=gMax(g),inp=card.querySelector("[data-tqi]");let n=Math.max(1,Math.floor(+inp.value||1));inp.value=n;QTY[g]=n;
 const bb=card.querySelector('[data-a="buy"]'),sb=card.querySelector('[data-a="sell"]');bb.dataset.n=n;sb.dataset.n=n;
 bb.textContent=!m.lic?"Nemáš tu obchodné právo":`Kúpiť ${n} · ≈ ${fmt(Math.round(n*m.b))} zl.`;bb.disabled=!m.lic||n>m.buy;bb.title=m.lic&&n>m.buy?(m.mk<n?"Na trhu nie je toľko tovaru.":"Nemáš dosť peňazí."):"";
 sb.textContent=`Predať ${n} · ≈ ${fmt(Math.round(n*m.s))} zl.`;sb.disabled=n>m.sell;sb.title=n>m.sell?(m.sell?`Máš len ${m.sell} ks.`:"Tento tovar nemáš na sklade."):"";}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("#dside .tgd [data-tq]");if(!b)return;e.preventDefault();e.stopPropagation();const card=b.closest(".tgd"),inp=card.querySelector("[data-tqi]"),m=gMax(card.dataset.tg),v=b.dataset.tq;let n=Math.max(1,Math.floor(+inp.value||1));
 n=v==="-"?n-1:v==="+"?n+1:v==="10"?n+10:(m.sell||m.buy||1);inp.value=Math.max(1,n);tgUpdate(card)},true);
document.addEventListener("input",e=>{const i=e.target.closest&&e.target.closest("#dside .tgd [data-tqi]");if(i)tgUpdate(i.closest(".tgd"))});
{const st=document.createElement("style");st.textContent=`#dside .tglist{display:flex;flex-direction:column;gap:8px}
#dside .tgd{background:#fbf5e4;border:1px solid rgba(142,106,58,.4);border-radius:10px;padding:8px 10px;box-shadow:0 1px 3px rgba(60,30,0,.12)}
#dside .tgh{display:flex;align-items:center;gap:8px;margin-bottom:6px}#dside .tgh svg{width:26px;height:26px;flex:none}#dside .tgh b{font-size:1.02rem}#dside .tgh small{color:#7a5a30}
#dside .tgtr{margin-left:auto;font:600 .8rem Georgia,serif;color:#6a5a40;white-space:nowrap}#dside .tgtr.up{color:#2f6b2a}#dside .tgtr.dn{color:#8e1f1c}
#dside .tgp{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:7px}#dside .tgp div{min-width:0}#dside .tgp span{display:block;font-size:.66rem;color:#7a5a30;text-transform:uppercase;white-space:nowrap}#dside .tgp b{font-size:.92rem;white-space:nowrap}#dside .tgp b.own{color:#8a5a10}
#dside .tgq{display:flex;gap:4px;align-items:center;margin-bottom:6px}#dside .tgq input{width:64px;text-align:center;font:600 .95rem Georgia,serif;padding:3px 4px;border:1px solid #b8a27a;border-radius:6px;background:#fffaf0}
#dside .tga{display:grid;grid-template-columns:1fr 1fr;gap:6px}#dside .tga .btn{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`;document.head.appendChild(st)}
function trhPanel(sd){
 tpick();const cats=trhCats(),cat=cats.find(c=>c.n===tsel)||cats[0],f=catInfo(cat),pct=Math.round(f.r*100);
 const trend=pct>=105?`<b class="good">▲ ceny ${pct-100} % nad bežnou</b> – dobrý čas predávať`:pct<=95?`<b class="bad">▼ ceny ${100-pct} % pod bežnou</b> – dobrý čas nakúpiť`:`ceny sú blízko bežnej úrovne`;
 const opts=cats.map(c=>`<option value="${E(c.n)}"${c.n===cat.n?" selected":""}>${E(c.l)}${catInfo(c).own?" ●":""}</option>`).join("");
 sd.innerHTML=`<div class="dshead"><h2>Trhovisko</h2><span>${E(cityN(S.ci))}</span></div><div class="dssub"></div><label class="dtcat"><span>Stánok</span><select data-dt="cat" aria-label="Skupina tovaru">${opts}</select></label>${tabsH([["tovar","Tovar"],["uver","Úver a príkazy"]],ttabP,"dttab")}<div class="dsbody"></div>${footH("Pôvodná stránka trhu: všetky tovary, filtre a zoradenie")}`;
 const sub=sd.querySelector(".dssub");[q("main .jsub"),q("main .ktabs")].forEach(e=>{if(e)sub.appendChild(e)});
 const body=sd.querySelector(".dsbody");
 if(ttabP==="tovar"){
  body.insertAdjacentHTML("beforeend",`<p class="dstrend">${trend}${f.own?' · <span class="dsown">● máš na sklade</span>':""}</p><div class="tglist">${cat.gs.map(goodCard).join("")}</div>`);body.querySelectorAll(".tgd").forEach(tgUpdate);
  const bb=q("main #sx-trh-0 .bulkbar2");if(bb)body.appendChild(bb);
 }else{let n=0;["#uver","main .sheet.stop","main .sheet.facx","main .sheet.fcal","main .sheet.hagp"].forEach(s=>{const e=q(s);if(e){body.appendChild(e);n++}});if(!n)body.innerHTML=`<p class="dsempty">Nič tu nie je.</p>`}
}
function rodPanel(sd){
 const sec=S.rodSec||"";sd.classList.toggle("wide",!!sec);
 if(sec){sd.innerHTML=`<div class="dsbody dsrod"></div>${footH("Pôvodné rozloženie podsekcie")}`;const b2=sd.querySelector(".dsbody"),rs=q("main .rodsec");if(rs){b2.appendChild(rs);const bk=rs.querySelector('.rodnav [data-a="rodSec"][data-v=""]');if(bk)bk.textContent="‹ Rodová sieň"}else b2.innerHTML=`<p class="dsempty">Táto časť sa nenašla.</p>`;return}
 sd.innerHTML=`<div class="dsbody dsrod"></div>${footH("Pôvodná stránka rodu s dlaždicami")}`;const body=sd.querySelector(".dsbody");
 ["main .rodhead","main .todopanel","main .tfam","main .sdrod"].forEach(s=>{const e=q(s);if(e)body.appendChild(e)});
 body.insertAdjacentHTML("beforeend",`<p class="dsempty">Klikni v sieni na portréty, rodokmeň, krb s erbom, schodisko, stôl so zvončekom alebo vchod do galérie predkov.</p>`)}
/* ---------- karavány: pred mestskou bránou (vozový dvor, cesta s karavánami, rozcestník, prístav, lombard) ---------- */
const IK=ISO({W,H,s:21,ox:900,oy:470,seed:47});
const cdef=c=>{try{return CITY_DEF[CITY(c).def]||{}}catch(e){return{}}};
const RD={x0:-5,x1:-2};/* cesta z brány pozdĺž osi y */
function wagon2d(g,x,y,o){const P2=IK.P;const L=2.6,Wd=1.3;const c=[[x,y],[x+Wd,y],[x+Wd,y+L],[x,y+L]];const z0=.55,z1=1.15;
 const wh=(a,b)=>{const p=P2(a,b,.35);g.fillStyle="#3a2414";g.beginPath();g.ellipse(p[0],p[1],7,9,0,0,7);g.fill();g.fillStyle="#8a6a3a";g.beginPath();g.ellipse(p[0],p[1],3,4,0,0,7);g.fill()};
 wh(x+Wd,y+.4);wh(x+Wd,y+L-.4);
 const side=[P2(x+Wd,y,z0),P2(x+Wd,y+L,z0),P2(x+Wd,y+L,z1),P2(x+Wd,y,z1)];g.fillStyle="#7a4a24";g.beginPath();side.forEach((p,k)=>k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();
 const fr=[P2(x,y+L,z0),P2(x+Wd,y+L,z0),P2(x+Wd,y+L,z1),P2(x,y+L,z1)];g.fillStyle="#5a3418";g.beginPath();fr.forEach((p,k)=>k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();
 const t0=P2(x+Wd/2,y+.2,z1),t1=P2(x+Wd/2,y+L-.2,z1),r=IK.k*.95;g.fillStyle=o.col||"#efe4c8";g.strokeStyle="#8a7a5a";g.lineWidth=1.2;g.beginPath();g.moveTo(t0[0]-r*.7,t0[1]);g.quadraticCurveTo((t0[0]+t1[0])/2-r*.7,(t0[1]+t1[1])/2-r*1.6,t1[0]-r*.7,t1[1]);g.lineTo(t1[0]+r*.7,t1[1]);g.quadraticCurveTo((t0[0]+t1[0])/2+r*.7,(t0[1]+t1[1])/2-r*1.6,t0[0]+r*.7,t0[1]);g.closePath();g.fill();g.stroke();
 wh(x,y+.4);wh(x,y+L-.4);
 if(o.horse){const hy=o.dir>0?y+L+1.1:y-1.1,hp=P2(x+Wd/2,hy,0),bob=Math.sin((o.t||0)*8)*1.5;g.fillStyle="#6a4424";g.beginPath();g.ellipse(hp[0],hp[1]-16+bob,15,8,o.dir>0?.45:-.45,0,7);g.fill();g.fillRect(hp[0]-11,hp[1]-12+bob,3,13);g.fillRect(hp[0]+8,hp[1]-12+bob,3,13);const hd=o.dir>0?[-14,-22]:[14,-26];g.beginPath();g.ellipse(hp[0]+hd[0],hp[1]+hd[1]+bob,6,9,o.dir>0?.6:-.6,0,7);g.fill()}}
KSCENE.register("brana",{id:"brana",W,H,label:"Pred mestskou bránou",
 state:()=>{const p=P(),D=cdef(S.ci);const conv=(S.conv||[]).filter(c=>c.from===S.ci||c.to===S.ci).slice(0,6).map(c=>[c.id,c.from===S.ci?1:-1,c.from===S.ci?c.to:c.from,c.start,c.eta,c.carts||0,c.guard?1:0,c.ship?1:0,Object.values(c.goods||{}).reduce((a,b)=>a+b,0)]);
  const lic=(p.lic||[]).filter(c=>c!==S.ci).slice(0,4);
  return{ph:todPh(),season:S.season,wx:K.wxNow(),ci:S.ci,cn:cityN(S.ci),gate:(D.gates||[])[0]||"Mestská brána",river:D.river||"",carts:p.carts||0,ships:((p.fleet&&p.fleet.s)||[]).length,turn:S.turn,conv,lic:lic.map(cityN)}},
 build:st=>{I=IK;const shc=I.begin(st.ph,st.season,{wx:st.wx});const c=I.off(W,H),x=c.getContext("2d");
  K.skyBg(x,I,W,H);
  I.groundPlane(x,g=>{g.save();g.scale(.1,.1);g.fillStyle=I.pat(g,"grass");g.fillRect(-900,-900,1800,1800);
   g.fillStyle=I.pat(g,"cobble");g.fillRect(-900,-1000,1800,700);g.fillRect(RD.x0*10,-30,(RD.x1-RD.x0)*10,900);g.fillRect(RD.x1*10,150,900,25);
   g.fillRect(-270,10,110,120);g.fillRect(-160,95,110,22);
   if(st.river){g.fillStyle=I.pat(g,"water");g.fillRect(-900,240,1800,70)}
   g.restore();g.globalCompositeOperation="multiply";g.fillStyle=I.col(I.bright([0,0,1]));g.fillRect(-90,-90,180,180)});
  const hot=[],labels=[],parked=[];const H2=4.4;
  /* mesto za hradbami */
  for(let i=0;i<14;i++){const bx=-36+i*5.4,by=-12-(i%3)*1.6,h=4.6+(i*37%5)*.6;house(bx,by,4.4,4,h,{tex:i%3?"timber":"plaster",roof:i%4===1?"slate":"tile",chim:i%3===1?[bx+3]:[]})}
  {const bx=-20,by=-20;I.box(bx,by,4.6,4.6,12,{tex:"wall",quoin:1,tpu:14});I.gable(bx,by,4.6,4.6,12,7,"slate",{tpu:12,gableTex:"wallX"})}
  /* hradby a brána */
  I.box(-46,-3,39.5,1.5,H2,{tex:"wall",tpu:14});I.box(-1,-3,47,1.5,H2,{tex:"wall",tpu:14});
  for(let i=-46;i<46;i+=1.6){if(i>-7.4&&i<-1)continue;I.box(i,-3,.8,1.5,.7,{tex:"wall",z:H2,noShadow:1,clean:1,tpu:14})}
  I.setCur("gate");I.box(-7.2,-4.4,6.4,3.6,9.5,{tex:"wall",quoin:1,doorY:[1.9,2.6,3.6,1],sqY:[[2.6,7.4,1.2,1.2]],noTop:1,tpu:14});I.gable(-7.2,-4.4,6.4,3.6,9.5,3.2,"slate",{tpu:12,gableTex:"wallX"});I.setCur(null);
  {const t=I.P(-4,-2.6,14.2);labels.push({X:t[0],Y:t[1],t:st.gate,k:"gate"})}
  /* lombard pri bráne */
  const LB=[2.5,3,5,4.2,3.6];I.setCur("lomb");house(LB[0],LB[1],LB[2],LB[3],LB[4],{tex:"plaster",roof:"tile",arch:1});I.setCur(null);
  I.push({d:LB[0]+LB[2]+LB[1]+LB[3]+.6,draw:g=>{const q2=I.P(LB[0]+LB[2]+.1,LB[1]+LB[3],LB[4]*.8);g.strokeStyle="#3a2a1a";g.lineWidth=2;g.beginPath();g.moveTo(q2[0],q2[1]);g.lineTo(q2[0]+22,q2[1]-5);g.stroke();[[0,0],[-7,10],[7,10]].forEach(([a,b])=>{g.fillStyle="#e2b85a";g.strokeStyle="#7a5a14";g.beginPath();g.arc(q2[0]+20+a,q2[1]+4+b,6,0,7);g.fill();g.stroke()})}});
  {const t=I.P(LB[0]+LB[2]/2,LB[1]+LB[3]/2,LB[4]+3.2);labels.push({X:t[0],Y:t[1],t:"Lombard",sub:"poistenie nákladu",k:"poist"})}
  /* vozový dvor */
  const YD=[-27,1.5,11,10];
  for(let i=0;i<=11;i++){I.box(YD[0]+i*YD[2]/11-.1,YD[1]+YD[3]-.1,.2,.2,1,{tex:"wood",clean:1,noShadow:1})}for(let i=0;i<=10;i++){if(i>=4&&i<=6)continue;I.box(YD[0]+YD[2]-.1,YD[1]+i*YD[3]/10-.1,.2,.2,1,{tex:"wood",clean:1,noShadow:1})}
  I.box(YD[0]+.6,YD[1]+.4,3.6,2.6,2.6,{tex:"wood",tpu:8});I.gable(YD[0]+.6,YD[1]+.4,3.6,2.6,2.6,1.4,"thatch",{tpu:12,gableTex:"wood"});
  const nP=Math.min(st.carts-st.conv.filter(v=>v[1]>0&&!v[7]).reduce((a,v)=>a+(v[5]||1),0),6);
  for(let i=0;i<Math.max(0,nP);i++){const px=YD[0]+1.2+(i%3)*3.2,py=YD[1]+4+Math.floor(i/3)*3.3;I.push({d:px+py+3.5,draw:g=>wagon2d(g,px,py,{})})}
  for(let i=0;i<4;i++)I.box(YD[0]+6+i*1.1,YD[1]+.6,.9,.9,.8,{tex:"wood",clean:1,tpu:6,noShadow:1});
  {const a=I.P(YD[0],YD[1]+YD[3],0),b=I.P(YD[0]+YD[2],YD[1],0),cc=I.P(YD[0]+YD[2],YD[1]+YD[3],0),tp=I.P(YD[0],YD[1],3);hot.push({r:[a[0],tp[1]-10,b[0],cc[1]+6],data:{a:"dktab",v:"vozy"},label:"Vozový dvor – kúpiť voz, poslať karavánu"});
   const t=I.P(YD[0]+YD[2]/2,YD[1]+YD[3]/2,4);labels.push({X:t[0],Y:t[1],t:"Vozový dvor",sub:st.carts?`${st.carts} ${st.carts===1?"voz":st.carts<5?"vozy":"vozov"}`:"zatiaľ bez vozov",k:"vozy"})}
  /* rozcestník */
  const SG=[-.9,20.6];I.cyl(SG[0],SG[1],.18,4.2,{tex:"wood"});
  const arms=(st.lic.length?st.lic:["Krakov","Viedeň","Budín"]).slice(0,4);
  I.push({d:SG[0]+SG[1]+.5,draw:g=>{arms.forEach((n,i)=>{const q2=I.P(SG[0],SG[1],3.8-i*.75),dir=i%2?-1:1;g.fillStyle="#d8c49a";g.strokeStyle="#5a3a1a";g.lineWidth=1.2;g.beginPath();g.moveTo(q2[0],q2[1]-8);g.lineTo(q2[0]+dir*70,q2[1]-8);g.lineTo(q2[0]+dir*80,q2[1]);g.lineTo(q2[0]+dir*70,q2[1]+8);g.lineTo(q2[0],q2[1]+8);g.closePath();g.fill();g.stroke();g.fillStyle="#2a2016";g.font='12px "Almendra SC",serif';g.textAlign="center";g.textBaseline="middle";g.fillText(n.slice(0,10),q2[0]+dir*37,q2[1]+1)})}});
  {const a=I.P(SG[0],SG[1],4.4),b=I.P(SG[0],SG[1],0);hot.push({r:[a[0]-90,a[1]-14,a[0]+90,b[1]+6],data:{a:"dktab",v:"trasy"},label:"Rozcestník – pravidelné trasy"});const t=I.P(SG[0],SG[1],5.4);labels.push({X:t[0],Y:t[1],t:"Rozcestník",sub:"pravidelné trasy",k:"trasy"})}
  /* rieka a prístav */
  if(st.river){const DK=[4,22.2,6,2];I.box(DK[0],DK[1],DK[2],DK[3],.5,{tex:"wood",clean:1,tpu:8});for(let i=0;i<4;i++)I.box(DK[0]+i*2-.15,DK[1]+DK[3]-.15,.3,.3,1.1,{tex:"wood",clean:1,noShadow:1});
   I.box(RD.x0-.3,23.6,RD.x1-RD.x0+.6,7.4,.4,{tex:"wood",clean:1,tpu:8});
   const nS=Math.min(st.ships,3);for(let i=0;i<Math.max(1,nS);i++){const sx=DK[0]+1+i*3,sy=DK[1]+DK[3]+1.6,own=i<nS;I.push({d:sx+sy+2,draw:g=>{const a=I.P(sx,sy,.2),b=I.P(sx+2.6,sy,.2),cc=I.P(sx+2.6,sy+1.1,.2),d2=I.P(sx,sy+1.1,.2),tip=I.P(sx+3.4,sy+.55,.4);g.fillStyle=own?"#6a4424":"#8a7a5a";g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.lineTo(tip[0],tip[1]);g.lineTo(cc[0],cc[1]);g.lineTo(d2[0],d2[1]);g.closePath();g.fill();if(own){const m0=I.P(sx+1.3,sy+.55,.4),m1=I.P(sx+1.3,sy+.55,4);g.strokeStyle="#3a2414";g.lineWidth=3;g.beginPath();g.moveTo(m0[0],m0[1]);g.lineTo(m1[0],m1[1]);g.stroke();g.fillStyle="#efe4c8";g.beginPath();g.moveTo(m1[0],m1[1]+4);g.quadraticCurveTo(m1[0]+30,m1[1]+30,m0[0]+2,m0[1]-14);g.closePath();g.fill()}}})}
   {const a=I.P(DK[0],DK[1]+DK[3]+3,0),b=I.P(DK[0]+DK[2]+4,DK[1],0),tp=I.P(DK[0]+2,DK[1]+3,5);hot.push({r:[a[0],tp[1],b[0],a[1]+10],data:{a:"dktab",v:"lode"},label:`Prístav na rieke ${st.river} – lode`});const t=I.P(DK[0]+DK[2]/2,DK[1]+DK[3]/2,4.5);labels.push({X:t[0],Y:t[1],t:"Prístav",sub:st.ships?`${st.ships} ${st.ships===1?"loď":st.ships<5?"lode":"lodí"} · ${st.river}`:`${st.river} · bez lodí`,k:"lode"})}}
  [[-26,-1],[-24,18],[-14,24],[-22,30],[8,14],[14,10],[12,30],[-30,10],[20,20],[-8,34],[4,38],[-30,24]].forEach(([tx,ty],j)=>I.tree(tx,ty,1.1+j%3*.3,3+j%2));
  I.drawSolids(x,shc);
  {const r=I.hot.lomb;if(r)hot.push({r:[r[0],r[1],r[2]+30,r[3]],data:{a:"dktab",v:"poist"},label:"Lombard – poistenie nákladu"})}
  K.vignette(x,W,H,.3);
  return{img:c,hot,labels,st}},
 animate:(g,C,t)=>{I=IK;
  C.st.conv.forEach(([id,dir,other,start,eta,carts,guard,ship,n],i)=>{if(ship)return;const pr=Math.max(.05,Math.min(.95,(C.st.turn-start+.5)/Math.max(1,eta-start)));const yy=Math.min(18,(dir>0?3+pr*13:16-pr*13)+i*2.6);const sway=Math.sin(t*1.5+i)*.25;const wx2=RD.x0+.3+(i%2)*1.3,wy=yy+sway;
   wagon2d(g,wx2,wy,{horse:1,dir,t,col:dir>0?"#efe4c8":"#e4d2a8"});if(guard){const q2=I.P(wx2-.8,wy+1.2,0);try{KFIG2.draw(g,q2[0],q2[1],2.2,{look:{g:"m",skin:i%4,hc:2,beard:1,eyes:1},robe:"#5a5a6a",title:0,hat:"cap",hatCol:"#3a3a5a",tool:null,t,i:i+90})}catch(x){}}
   const lp=I.P(wx2-.4,wy+1.3,3);const tx=`${dir>0?"→ ":"← "}${cityN(other)} · ${Math.max(0,eta-C.st.turn)} š.`;g.save();g.font='13px "Almendra SC",serif';const tw=g.measureText(tx).width+14;g.fillStyle="rgba(250,240,212,.92)";g.strokeStyle="#b5892a";g.lineWidth=1.2;g.beginPath();g.roundRect?g.roundRect(lp[0]-tw-4,lp[1]-11,tw,22,4):g.rect(lp[0]-tw-4,lp[1]-11,tw,22);g.fill();g.stroke();g.fillStyle="#8e1f1c";g.textAlign="center";g.textBaseline="middle";g.fillText(tx,lp[0]-tw/2-4,lp[1]+1);g.restore()});
  K.nightTint(g,I,W,H,C.st.ph);try{wxFx(g,t,C.st.wx||K.wxNow(),C.st.season!=null?C.st.season:S.season)}catch(e){}
  g.save();g.textAlign="center";g.textBaseline="middle";
  C.labels.forEach(l=>{const on=l.k===ktab;g.font=`${on?18:16}px "Almendra SC","EB Garamond",serif`;const w1=g.measureText(l.t).width;g.font='13px "EB Garamond",serif';const w2=l.sub?g.measureText(l.sub).width:0;const tw=Math.max(w1,w2)+24,th=l.sub?42:28,X=l.X,Y=l.Y-(on?5+Math.sin(t*3)*3:0);
   g.fillStyle=l.k==="gate"?"rgba(236,226,200,.9)":on?"#f6e2a0":"rgba(250,240,212,.95)";g.strokeStyle=on?"#8e1f1c":"#b5892a";g.lineWidth=on?2.5:1.5;g.beginPath();g.roundRect?g.roundRect(X-tw/2,Y-th/2,tw,th,5):g.rect(X-tw/2,Y-th/2,tw,th);g.fill();g.stroke();
   if(on){g.fillStyle="#8e1f1c";g.beginPath();g.moveTo(X-7,Y+th/2);g.lineTo(X+7,Y+th/2);g.lineTo(X,Y+th/2+9);g.closePath();g.fill()}
   g.fillStyle=l.k==="gate"?"#4a3a26":"#8e1f1c";g.font=`${on?18:16}px "Almendra SC","EB Garamond",serif`;g.fillText(l.t,X,Y-(l.sub?8:0));if(l.sub){g.fillStyle="#4a3a26";g.font='13px "EB Garamond",serif';g.fillText(l.sub,X,Y+11)}});
  g.restore()}});
let ktab="vozy";const KOPEN=new Set();
function karPanel(sd){
 const tabs=[["vozy","Vozy"],["trasy","Trasy"],["lode","Lode"],["poist","Poistenie"]];
 sd.innerHTML=`<div class="dshead"><h2>Karavány</h2><span>${E(cityN(S.ci))}</span></div><div class="dssub"></div>${tabsH(tabs,ktab,"dktab")}<div class="dsbody"></div>${footH("Pôvodná stránka karaván")}`;
 const sub=sd.querySelector(".dssub");[q("main .jsub"),q("main .ktabs")].forEach(e=>{if(e)sub.appendChild(e)});
 const body=sd.querySelector(".dsbody");
 const sel={vozy:"#karavany",trasy:"main .sheet.rtp",lode:"main .sheet.shipp",poist:"main .sheet.insp"}[ktab];
 if(ktab==="vozy"){const L=(S.conv||[]).filter(c=>c.from===S.ci||c.to===S.ci);if(L.length)body.insertAdjacentHTML("beforeend",`<div class="sheet dsconv"><h3>Na ceste</h3><ul>${L.map(c=>{const n=Object.values(c.goods||{}).reduce((a,b)=>a+b,0),k=Math.max(0,c.eta-S.turn),out=c.from===S.ci;return`<li><b>${out?"→ do mesta ":"← z mesta "}${E(cityN(out?c.to:c.from))}</b> · ${n} ks${c.ship?" · loďou":` · ${c.carts||0} ${c.carts===1?"voz":"vozy"}`}${c.guard?" · s ochrankou":""} · príchod o ${k} ${k===1?"štvrťrok":"štvrťroky"}</li>`}).join("")}</ul></div>`)}
 const e=q(sel);if(e){body.appendChild(e);const tg=e.querySelector(".jtg");if(e.classList.contains("jclosed")&&tg&&!KOPEN.has(tg.dataset.k)){KOPEN.add(tg.dataset.k);S.jOpen=S.jOpen||{};S.jOpen[tg.dataset.k]=true;setTimeout(()=>{try{render()}catch(x){}},0)}}
 else body.insertAdjacentHTML("beforeend",`<p class="dsempty">Táto časť tu teraz nie je.</p>`);
}

/* ---------- krajčír: dielňa krajčíra, klobučníka a zlatníka (zrkadlo, látky, klobúky, šperky, obuv, zbrane, sedlo, figuríny) ---------- */
const KG=[{k:"postava",n:"Postava",s:[]},{k:"odev",n:"Odev a plášť",s:["Odev","Plášť"],sl:["body","cloak"]},{k:"hlava",n:"Pokrývka hlavy",s:["Pokrývka hlavy"],sl:["hat"]},{k:"sperky",n:"Šperky a prsteň",s:["Šperky","Prsteň"],sl:["jewel","ring"]},
 {k:"obuv",n:"Obuv",s:["Obuv"],sl:["feet"]},{k:"opasok",n:"Opasok a rukavice",s:["Opasok","Rukavice"],sl:["belt","glove"]},{k:"zbran",n:"Zbraň a zbroj",s:["Pri boku","Zbroj","Štít"],sl:["side","armor","shield"]},
 {k:"remeslo",n:"Remeslo a stav",s:["Remeslo a stav"],sl:["tool"]},{k:"kon",n:"Kôň",s:["Kôň"],sl:["horse"]},{k:"salon",n:"Salón majstra",salon:1}];
let kgrp="postava";
const wearN=sl=>{try{const p=P();return(sl||[]).map(s=>{const o=OUT[p.outfit&&p.outfit[s]];return o&&o.c>0?o.n:null}).filter(Boolean).join(", ")}catch(e){return""}};
const focusOf=()=>{try{if(jopen||S.view==="kronika")return jtab;if(S.view==="rod")return S.rodSec||"";if(vKey()==="trh:kraj")return kgrp==="postava"?"":kgrp}catch(e){}return""};
function spot(g,C,key){if(!key)return;const hs=C.hot.filter(h=>h.data.v===key);if(!hs.length)return;let x1=1e9,y1=1e9,x2=-1e9,y2=-1e9;hs.forEach(h=>{x1=Math.min(x1,h.r[0]);y1=Math.min(y1,h.r[1]);x2=Math.max(x2,h.r[2]);y2=Math.max(y2,h.r[3])});const cx=(x1+x2)/2,cy=(y1+y2)/2,Rr=Math.max(x2-x1,y2-y1)*.6+60;const gr=g.createRadialGradient(cx,cy,Rr*.6,cx,cy,Rr*2);gr.addColorStop(0,"rgba(8,5,2,0)");gr.addColorStop(1,"rgba(8,5,2,.66)");g.fillStyle=gr;g.fillRect(0,0,W,H)}
function figImg(){try{const sv=document.querySelector("#trybox svg");const key="kf"+JSON.stringify(P().outfit)+P().head.age;if(RIMG[key])return RIMG[key];if(!sv)return null;return rast(key,sv.outerHTML)}catch(e){return null}}
KSCENE.register("krajcir",{id:"krajcir",W,H,label:"Dielňa krajčíra",
 state:()=>{const p=P();const tw=q("#odev .tailorwrap");const m=tw&&txt(tw).match(/(\d+)\s*\/\s*(\d+)\s*rúch/);
  return{ph:todPh()===3?3:1,season:S.season,of:JSON.stringify(p.outfit||{}),rob:m?m[1]+"/"+m[2]:"",rn:rN}},
 build:st=>{I=IR;const shc=I.begin(st.ph,st.season,{});const c=I.off(W,H),x=c.getContext("2d");x.fillStyle="#1a120a";x.fillRect(0,0,W,H);
  I.groundPlane(x,g=>{g.save();g.scale(.05,.05);g.fillStyle=I.pat(g,"wood");g.fillRect(0,0,RW.R*20,RW.L*20);g.restore();g.fillStyle="#2f4a6a";g.globalAlpha=.75;g.fillRect(6,5,8,6);g.globalAlpha=1;g.strokeStyle="#d9ab3e";g.lineWidth=.1;g.strokeRect(6.3,5.3,7.4,5.4);
   g.globalCompositeOperation="multiply";g.fillStyle=I.col(I.bright([0,0,1]));g.fillRect(0,0,RW.R,RW.L);g.globalCompositeOperation="source-over"});
  const hot=[],labels=[],folk=[];const lab=(v,X,Y)=>{const G=KG.find(z=>z.k===v);labels.push({X,Y,v,t:G.n,sub:v==="salon"?(st.rob?st.rob+" slávnostných rúch":""):v==="postava"?"celá postava":wearN(G.sl)||"nič zvláštne"})};
  I.box(-.7,0,.7,RW.L,RW.H,{tex:"plaster",noTop:1,noShadow:1,dd:-200,tpu:10});I.box(0,-.7,RW.R,.7,RW.H,{tex:"plaster",noTop:1,noShadow:1,dd:-200,tpu:10});
  I.push({d:-150,draw:g=>{[["L",RW.L],["R",RW.R]].forEach(([w,len])=>onWall(g,w,w==="L"?len:0,1.6,0,q2=>{q2.fillStyle="#5a3a1e";q2.fillRect(0,0,len,1.6);q2.fillStyle="#c9a03a";q2.fillRect(0,-.06,len,.08);q2.fillStyle="#6a4a2a";q2.fillRect(0,-RW.H+1.6,len,.3)}))}});
  /* zrkadlo (ľavá stena) */
  const MR=[6.2,7.4,3.6,6.2];
  I.push({d:-140,draw:g=>onWall(g,"L",MR[0],MR[1],0,q2=>{const w=MR[2],h=MR[3];q2.fillStyle="#c9a03a";q2.beginPath();q2.moveTo(-.25,h+.2);q2.lineTo(-.25,1.2);q2.quadraticCurveTo(w/2,-.7,w+.25,1.2);q2.lineTo(w+.25,h+.2);q2.closePath();q2.fill();const gr=q2.createLinearGradient(0,0,w,h);gr.addColorStop(0,"#cfe0e8");gr.addColorStop(.5,"#8fa8b8");gr.addColorStop(1,"#5a7080");q2.fillStyle=gr;q2.beginPath();q2.moveTo(0,h);q2.lineTo(0,1.25);q2.quadraticCurveTo(w/2,-.45,w,1.25);q2.lineTo(w,h);q2.closePath();q2.fill()})});
  hot.push({r:wallRect("L",MR[0],MR[1],MR[2],MR[3]),data:{a:"dcg",v:"postava"},label:"Zrkadlo – tvoja postava v odeve"});{const m=IR.P(0,MR[0]-MR[2]/2,MR[1]+.9);lab("postava",m[0],m[1])}
  /* regály s látkami (ľavá stena) */
  const FS=[13.5,6.6,5,5.6],FC=["#8e1f1c","#2f4f7a","#c9971a","#3f7a3a","#6d3f92","#a8583a","#e8dcc0","#2a2a3a"];
  I.push({d:-140,draw:g=>onWall(g,"L",FS[0],FS[1],0,q2=>{const w=FS[2],h=FS[3];q2.fillStyle="#4a2e14";q2.fillRect(-.15,-.1,w+.3,h+.2);for(let r=0;r<4;r++){const y=r*h/4;q2.fillStyle="#6a4424";q2.fillRect(0,y+h/4-.14,w,.14);for(let i=0;i<7;i++){q2.fillStyle=FC[(i+r*3)%FC.length];q2.fillRect(.15+i*.68,y+.18,.56,h/4-.36);q2.fillStyle="rgba(255,255,255,.18)";q2.fillRect(.15+i*.68,y+.18,.12,h/4-.36)}}})});
  hot.push({r:wallRect("L",FS[0],FS[1],FS[2],FS[3]),data:{a:"dcg",v:"odev"},label:"Látky – odev a plášť"});{const m=IR.P(0,FS[0]-FS[2]/2,FS[1]+.9);lab("odev",m[0],m[1])}
  /* klobúky na vešiakoch (pravá stena) */
  const HT=[1,6.4,4.4,1.8],HC=["#3a3a5a","#8e1f1c","#c9a03a","#2f4f2a"];
  I.push({d:-140,draw:g=>onWall(g,"R",HT[0],HT[1],0,q2=>{q2.fillStyle="#5a3a1e";q2.fillRect(0,1.35,HT[2],.18);for(let i=0;i<4;i++){const cx=.55+i*1.1;q2.fillStyle="#3a2414";q2.fillRect(cx-.04,1.1,.08,.3);q2.fillStyle=HC[i];q2.beginPath();q2.ellipse(cx,1.05,.5,.13,0,0,7);q2.fill();q2.beginPath();q2.moveTo(cx-.3,1.02);q2.lineTo(cx-.22+(i%2)*.06,.35);q2.quadraticCurveTo(cx,.15,cx+.22,.35);q2.lineTo(cx+.3,1.02);q2.closePath();q2.fill();if(i===2){q2.fillStyle="#efe4c8";q2.beginPath();q2.ellipse(cx+.25,.4,.35,.07,-.6,0,7);q2.fill()}}})});
  hot.push({r:wallRect("R",HT[0],HT[1],HT[2],HT[3]),data:{a:"dcg",v:"hlava"},label:"Klobúky – pokrývka hlavy"});{const m=IR.P(HT[0]+HT[2]/2,0,HT[1]+.9);lab("hlava",m[0],m[1])}
  /* stojan so zbraňami (pravá stena) */
  const WR=[6.2,6.6,3.6,4.6];
  I.push({d:-140,draw:g=>onWall(g,"R",WR[0],WR[1],0,q2=>{const w=WR[2],h=WR[3];q2.fillStyle="#4a2e14";q2.fillRect(0,0,w,h);q2.strokeStyle="#c9c9d0";q2.lineWidth=.12;[.6,1.2].forEach(a=>{q2.beginPath();q2.moveTo(a,.3);q2.lineTo(a,h-.3);q2.stroke();q2.fillStyle="#c9a03a";q2.fillRect(a-.25,h-1.2,.5,.1)});
   q2.fillStyle="#27408b";q2.beginPath();q2.moveTo(1.9,.6);q2.lineTo(3.3,.6);q2.lineTo(3.3,2.2);q2.quadraticCurveTo(3.3,3.4,2.6,3.8);q2.quadraticCurveTo(1.9,3.4,1.9,2.2);q2.closePath();q2.fill();q2.strokeStyle="#d9ab3e";q2.lineWidth=.08;q2.stroke();q2.fillStyle="#e2b85a";q2.beginPath();q2.moveTo(2.15,2.2);q2.lineTo(2.6,1.5);q2.lineTo(3.05,2.2);q2.lineTo(2.85,2.2);q2.lineTo(2.6,1.85);q2.lineTo(2.35,2.2);q2.closePath();q2.fill()})});
  hot.push({r:wallRect("R",WR[0],WR[1],WR[2],WR[3]),data:{a:"dcg",v:"zbran"},label:"Zbrane – pri boku, zbroj, štít"});{const m=IR.P(WR[0]+WR[2]/2,0,WR[1]+.9);lab("zbran",m[0],m[1])}
  /* okno (pravá stena) */
  I.push({d:-140,draw:g=>onWall(g,"R",11,6.6,0,q2=>{q2.fillStyle="#5a3a1e";q2.fillRect(-.2,-.2,2.8,4.2);const gr=q2.createLinearGradient(0,0,0,3.8);gr.addColorStop(0,"#dfeaf0");gr.addColorStop(1,"#a8bccb");q2.fillStyle=gr;q2.fillRect(0,0,2.4,3.8);q2.fillStyle="#5a3a1e";q2.fillRect(1.15,0,.1,3.8);q2.fillRect(0,1.85,2.4,.1)})});
  /* truhlica s náradím (remeslo) */
  I.setCur("tool");I.box(9.4,.5,2.4,1.3,1.1,{tex:"wood",clean:1,tpu:8});I.setCur(null);
  I.push({d:9.4+2.4+.5+1.3+.3,draw:g=>{const a=IR.P(10,1.1,1.1),b=IR.P(11.2,1.1,1.1);g.strokeStyle="#8a8a92";g.lineWidth=3;g.beginPath();g.moveTo(a[0],a[1]-2);g.lineTo(a[0]+26,a[1]-14);g.stroke();g.strokeStyle="#6a4a2a";g.lineWidth=4;g.beginPath();g.moveTo(b[0],b[1]-2);g.lineTo(b[0]-6,b[1]-26);g.stroke()}});
  {const a=IR.P(9.4,1.8,0),b=IR.P(11.8,.5,1.1),cc=IR.P(11.8,1.8,0);hot.push({r:[a[0],b[1]-30,b[0],cc[1]+6],data:{a:"dcg",v:"remeslo"},label:"Náradie – remeslo a stav"});const m=IR.P(10.6,1.1,2.6);lab("remeslo",m[0],m[1])}
  /* pult zlatníka */
  I.setCur("jew");I.box(3,3,4,1.5,1.5,{tex:"wood",clean:1,tpu:8});I.setCur(null);
  I.push({d:3+4+3+1.5+.3,draw:g=>{const p0=IR.P(3.1,3.1,1.5),p1=IR.P(6.9,3.1,1.5),p2=IR.P(6.9,4.4,1.5),p3=IR.P(3.1,4.4,1.5);g.fillStyle="rgba(200,225,240,.45)";g.strokeStyle="#d9ab3e";g.lineWidth=1.5;g.beginPath();[p0,p1,p2,p3].forEach((p,k)=>k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();g.stroke();
   [[3.7,3.6,"#e2b85a"],[4.6,3.9,"#c9302c"],[5.4,3.5,"#e2b85a"],[6.2,3.9,"#2f6fb0"],[4.2,4.1,"#e2b85a"]].forEach(([a,b,cl])=>{const q2=IR.P(a,b,1.52);g.fillStyle=cl;g.beginPath();g.arc(q2[0],q2[1],4,0,7);g.fill();g.strokeStyle="#7a5a14";g.lineWidth=1;g.beginPath();g.arc(q2[0],q2[1]-1,6,0,7);g.stroke()})}});
  {const a=IR.P(3,4.5,0),b=IR.P(7,3,1.5),cc=IR.P(7,4.5,0);hot.push({r:[a[0],b[1]-20,b[0],cc[1]+6],data:{a:"dcg",v:"sperky"},label:"Pult zlatníka – šperky a prsteň"});const m=IR.P(5,3.7,3.1);lab("sperky",m[0],m[1])}
  /* stôl krajčíra s látkou */
  I.box(7,7.4,5,2.2,1.3,{tex:"wood",clean:1,tpu:8});
  I.push({d:7+5+7.4+2.2+.3,draw:g=>{const p0=IR.P(7.6,7.7,1.31),p1=IR.P(10.8,7.7,1.31),p2=IR.P(11.2,9.3,1.31),p3=IR.P(8,9.3,1.31);g.fillStyle="#8e1f1c";g.beginPath();[p0,p1,p2,p3].forEach((p,k)=>k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();g.strokeStyle="#d9ab3e";g.setLineDash([4,4]);g.lineWidth=1.2;g.stroke();g.setLineDash([]);const s2=IR.P(11.4,8.3,1.32);g.strokeStyle="#c9c9d0";g.lineWidth=2.5;g.beginPath();g.moveTo(s2[0]-10,s2[1]-6);g.lineTo(s2[0]+10,s2[1]+6);g.moveTo(s2[0]-10,s2[1]+6);g.lineTo(s2[0]+10,s2[1]-6);g.stroke()}});
  {const a=IR.P(7,9.6,0),b=IR.P(12,7.4,1.3),cc=IR.P(12,9.6,0);hot.push({r:[a[0],b[1]-30,b[0],cc[1]+6],data:{a:"dcg",v:"odev"},label:"Stôl krajčíra – odev a plášť"})}
  folk.push({x:9.6,y:10.4,i:3});
  /* polica s obuvou a stojan s opaskami (pri ľavej stene) */
  I.box(.3,8.4,1.2,4.4,.9,{tex:"wood",clean:1,tpu:8});
  I.push({d:.3+1.2+8.4+4.4+.2,draw:g=>{for(let i=0;i<5;i++){const q2=IR.P(.9,8.9+i*.85,.92);g.fillStyle=i%2?"#3a2414":"#6a4424";g.beginPath();g.ellipse(q2[0],q2[1],11,5,-.45,0,7);g.fill();g.fillRect(q2[0]-9,q2[1]-12,7,10)}}});
  {const a=IR.P(.3,12.8,0),b=IR.P(1.5,8.4,.9);hot.push({r:[a[0]-6,b[1]-30,b[0]+10,a[1]+8],data:{a:"dcg",v:"obuv"},label:"Obuv"});const m=IR.P(.9,10.6,2.3);lab("obuv",m[0],m[1])}
  I.cyl(2.6,6.8,.12,3.6,{tex:"wood"});I.cyl(2.6,6.8,.6,.12,{tex:"wood",noShadow:1});
  I.push({d:2.6+6.8+.4,draw:g=>{const t2=IR.P(2.6,6.8,3.4);g.strokeStyle="#5a3a1e";g.lineWidth=3;g.beginPath();g.moveTo(t2[0]-22,t2[1]);g.lineTo(t2[0]+22,t2[1]);g.stroke();[[-16,"#6a4424",36],[-4,"#3a2414",44],[10,"#c9a03a",30]].forEach(([dx,cl,len])=>{g.strokeStyle=cl;g.lineWidth=4;g.beginPath();g.moveTo(t2[0]+dx,t2[1]);g.lineTo(t2[0]+dx+2,t2[1]+len);g.stroke()});g.fillStyle="#8a6a3a";g.beginPath();g.ellipse(t2[0]+20,t2[1]+14,6,9,0,0,7);g.fill()}});
  {const a=IR.P(2.6,6.8,0),b=IR.P(2.6,6.8,3.8);hot.push({r:[a[0]-34,b[1]-6,a[0]+34,a[1]+8],data:{a:"dcg",v:"opasok"},label:"Opasky a rukavice"});const m=IR.P(2.6,6.8,4.7);lab("opasok",m[0],m[1])}
  /* sedlo na koze */
  I.box(14,2.4,.3,1.6,1.2,{tex:"wood",clean:1});I.box(16.2,2.4,.3,1.6,1.2,{tex:"wood",clean:1});I.box(14,3,2.5,.35,.25,{tex:"wood",clean:1,z:1.2,noShadow:1});
  I.push({d:14+2.5+3+.35+1,draw:g=>{const q2=IR.P(15.3,3.2,1.5);g.fillStyle="#6a3a1a";g.beginPath();g.ellipse(q2[0],q2[1],34,14,.45,0,7);g.fill();g.fillStyle="#8a4a22";g.beginPath();g.ellipse(q2[0]-6,q2[1]-6,18,8,.45,0,7);g.fill();g.strokeStyle="#c9a03a";g.lineWidth=2;g.beginPath();g.moveTo(q2[0]+4,q2[1]+8);g.lineTo(q2[0]+6,q2[1]+34);g.stroke()}});
  {const a=IR.P(14,4,0),b=IR.P(16.5,2.4,1.6),cc=IR.P(16.5,4,0);hot.push({r:[a[0]-10,b[1]-40,b[0]+10,cc[1]+8],data:{a:"dcg",v:"kon"},label:"Sedlo – kôň"});const m=IR.P(15.3,3.2,3.4);lab("kon",m[0],m[1])}
  /* figuríny so slávnostnými rúchami (salón) */
  const MQ=[[14.2,7.4,"#8e1f1c"],[16,8.6,"#c9971a"],[17.8,7.2,"#efe8dc"]];
  MQ.forEach(([mx,my,cl],k)=>{I.cyl(mx,my,.5,.12,{tex:"wood"});I.push({d:mx+my+.6,draw:g=>{const b0=IR.P(mx,my,.12),top=IR.P(mx,my,4.4);g.strokeStyle="#3a2414";g.lineWidth=4;g.beginPath();g.moveTo(b0[0],b0[1]);g.lineTo(top[0],top[1]+70);g.stroke();
   g.fillStyle=cl;g.beginPath();g.moveTo(top[0]-15,top[1]+6);g.quadraticCurveTo(top[0],top[1]-4,top[0]+15,top[1]+6);g.lineTo(top[0]+30,top[1]+78);g.quadraticCurveTo(top[0],top[1]+88,top[0]-30,top[1]+78);g.closePath();g.fill();g.strokeStyle="rgba(0,0,0,.25)";g.lineWidth=1.2;g.stroke();
   if(k===2){g.fillStyle="#fff";for(let i=0;i<6;i++){g.beginPath();g.ellipse(top[0]-18+i*7,top[1]+72,3,4,0,0,7);g.fill();g.fillStyle="#111";g.fillRect(top[0]-18+i*7-1,top[1]+71,2,3);g.fillStyle="#fff"}}
   if(k===1){g.strokeStyle="#7a5a14";g.lineWidth=1;for(let i=0;i<4;i++){g.beginPath();g.moveTo(top[0]-12-i*4,top[1]+20+i*14);g.lineTo(top[0]+12+i*4,top[1]+20+i*14);g.stroke()}}
   g.fillStyle="#d8c49a";g.beginPath();g.ellipse(top[0],top[1]-2,7,5,0,0,7);g.fill()}})});
  {const a=IR.P(13.5,9.2,0),b=IR.P(18.4,6.8,4.6),cc=IR.P(18.4,9.2,0);hot.push({r:[a[0]-20,b[1]-10,b[0]+30,cc[1]+10],data:{a:"dcg",v:"salon"},label:"Salón majstra krajčíra – slávnostné rúcha"});const m=IR.P(16,8,5.4);lab("salon",m[0],m[1])}
  I.drawSolids(x,shc,.35);
  K.vignette(x,W,H,.4);
  return{img:c,hot,labels,folk,st,MR}},
 animate:(g,C,t)=>{I=IR;
  {const im=figImg();onWall(g,"L",C.MR[0]-.35,C.MR[1]-.15,0,q2=>{if(im&&im.complete&&im.naturalWidth){const h=C.MR[3]-1.5,w=h*im.naturalWidth/im.naturalHeight;q2.globalAlpha=.92;q2.drawImage(im,(C.MR[2]-w)/2-.35,1.2,w,h);q2.globalAlpha=1}})}
  C.folk.forEach(f=>{const q2=IR.P(f.x,f.y,0);try{KFIG2.draw(g,q2[0],q2[1],5.6,{look:{g:"m",skin:2,hc:5,beard:1,eyes:2},robe:"#4a3a2a",title:0,hat:"cap",hatCol:"#6a2a2a",tool:null,act:"stir",t,i:f.i})}catch(e){}});
  K.nightTint(g,IR,W,H,C.st.ph);
  const fk=focusOf();spot(g,C,fk);
  g.save();g.textAlign="center";g.textBaseline="middle";
  C.labels.forEach(l=>{const on=l.v===kgrp;g.globalAlpha=fk&&l.v!==fk?.45:1;g.font=`${on?19:17}px "Almendra SC","EB Garamond",serif`;const w1=g.measureText(l.t).width;g.font='13px "EB Garamond",serif';const sub=(l.sub||"").slice(0,34),w2=g.measureText(sub).width;const tw=Math.max(w1,w2)+24,th=sub?42:28,X=l.X,Y=l.Y-(on?5+Math.sin(t*3)*3:0);
   g.fillStyle=on?"#f6e2a0":"rgba(250,240,212,.95)";g.strokeStyle=on?"#8e1f1c":"#b5892a";g.lineWidth=on?2.5:1.5;g.beginPath();g.roundRect?g.roundRect(X-tw/2,Y-th/2,tw,th,5):g.rect(X-tw/2,Y-th/2,tw,th);g.fill();g.stroke();
   if(on){g.fillStyle="#8e1f1c";g.beginPath();g.moveTo(X-7,Y+th/2);g.lineTo(X+7,Y+th/2);g.lineTo(X,Y+th/2+9);g.closePath();g.fill()}
   g.fillStyle="#8e1f1c";g.font=`${on?19:17}px "Almendra SC","EB Garamond",serif`;g.fillText(l.t,X,Y-(sub?8:0));if(sub){g.fillStyle="#4a3a26";g.font='13px "EB Garamond",serif';g.fillText(sub,X,Y+11)}});
  g.restore()}});
let kUnf=false;
function krajPanel(sd){
 sd.classList.add("wide");const G=KG.find(z=>z.k===kgrp)||KG[0];
 sd.innerHTML=`<div class="dshead"><h2>Krajčír</h2><span>klobučník a zlatník · ${E(cityN(S.ci))}</span></div><div class="dssub"></div><div class="dkchips">${KG.map(z=>`<button type="button" class="chip${z.k===G.k?" on":""}" data-a="dcg" data-v="${z.k}">${E(z.n)}</button>`).join("")}</div><div class="dsbody kjwrap"></div>${footH("Pôvodná stránka krajčíra")}`;
 const sub=sd.querySelector(".dssub");[q("main .jsub"),q("main .ktabs")].forEach(e=>{if(e)sub.appendChild(e)});
 const body=sd.querySelector(".dsbody");
 const od=q("main #odev");if(od&&!od.querySelector(".wardrobe")&&!kUnf){const fb=od.querySelector(".foldb");if(fb&&fb.getAttribute("aria-expanded")==="false"){kUnf=true;try{S.fold=S.fold||{};S.fold[fb.dataset.k]=false}catch(e){}setTimeout(()=>{try{render()}catch(x){}},0)}}
 if(G.salon){body.classList.add("salon");const tw=q("#odev .tailorwrap");if(tw){body.appendChild(tw);const nt=q("#odev > p.muted");if(nt)body.appendChild(nt)}else body.innerHTML=`<p class="dsempty">Salón sa nenašiel.</p>`;return}
 const wd=q("#odev .wardrobe");if(!wd){body.innerHTML=`<p class="dsempty">Šatník sa nenašiel.</p>`;return}
 body.classList.add(G.k==="postava"?"fig":"items");body.appendChild(wd);
 const ws=wd.querySelector(".wslots");if(ws){let cur="";[...ws.children].forEach(c=>{if(c.tagName==="H3"){c.style.display="none";return}if(c.matches("p.lbl"))cur=txt(c);c.style.display=G.s.includes(cur)?"":"none"})}
 if(G.k==="postava")body.insertAdjacentHTML("beforeend",`<p class="dsempty">Klikni v dielni na zrkadlo, látky, klobúky, pult zlatníka, obuv, opasky, zbrane, truhlicu s náradím, sedlo alebo figuríny so slávnostnými rúchami.</p>`);
}

/* ---------- porovnanie cien: portolánová mapa Európy na stole, cenové pečate a najlepšia obchodná cesta ---------- */
let pg=null,ptab="tovar",pcity=null,pcD=null,EUc={k:null,h:""};
const BX=[150,70,770,470];/* výrez mapy so všetkými mestami */
function pcParse(){const t=q("main #sx-trh-1 table");if(!t)return pcD;const heads=[...t.querySelectorAll("thead th")].slice(1).map(th=>txt(th));const idx=heads.map(n=>{for(let i=0;i<20;i++){try{if(CITY(i).n===n)return i}catch(e){break}}return -1});
 const rows={};t.querySelectorAll("tbody tr").forEach(r=>{const td=r.querySelectorAll("td");if(td.length<2)return;rows[txt(td[0])]=[...td].slice(1).map(c=>{const v=parseFloat(txt(c).replace(/\s/g,"").replace(",","."));return isFinite(v)?v:null})});pcD={heads,idx,rows};return pcD}
const gByName=n=>Object.keys(GOODS).find(k=>GOODS[k].n===n);
function pcPick(){if(pg&&GOODS[pg])return;try{const b=myBall(P()).find(x=>x.city===S.ci)||myBall(P())[0];const o=b&&(RECIPES[b.type]||[])[0];pg=o&&o.o&&GOODS[o.o]?o.o:"drevo"}catch(e){pg="drevo"}}
function pcRow(){if(!pcD)return null;const r=pcD.rows[(GOODS[pg]||{}).n];if(!r)return null;return pcD.heads.map((n,j)=>({n,ci:pcD.idx[j],p:r[j]})).filter(x=>x.p!=null)}
const lerpC=(a,b,t)=>{const h=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));const A2=h(a),B2=h(b);return`rgb(${A2.map((v,i)=>Math.round(v+(B2[i]-v)*t)).join(",")})`};
const rankC=t=>t<.5?lerpC("#2f7d46","#c9971a",t*2):lerpC("#c9971a","#b8362c",(t-.5)*2);
function pcBest(L){if(!L||L.length<2)return null;let lo=L[0],hi=L[0];L.forEach(x=>{if(x.p<lo.p)lo=x;if(x.p>hi.p)hi=x});return hi.p>lo.p?{lo,hi,d:hi.p-lo.p}:null}
function pcHtml(){const k=S.season;if(EUc.k!==k){let s="";try{s=europeSVG()}catch(e){}EUc={k,h:s.replace(/data-a="[^"]*"/g,"").replace(/<svg /,'<svg preserveAspectRatio="none" ')}}
 return`<div class="dmapdesk"></div><div class="dmap"><div class="dmapbg">${EUc.h}</div><svg class="dmapo" viewBox="0 0 900 560" aria-hidden="false"></svg></div>`}
function pcFit(sc){const m=sc.querySelector(".dmap");if(!m)return;const sd=document.getElementById("dside");const L=110,Rr=(sd?sd.getBoundingClientRect().left:innerWidth)-14,T=96,B=innerHeight-96;
 const s=Math.min((Rr-L)/(BX[2]-BX[0]),(B-T)/(BX[3]-BX[1]));m.style.width=900*s+"px";m.style.height=560*s+"px";m.style.left=(L+((Rr-L)-(BX[2]-BX[0])*s)/2-BX[0]*s).toFixed(0)+"px";m.style.top=(T+((B-T)-(BX[3]-BX[1])*s)/2-BX[1]*s).toFixed(0)+"px"}
function pcAfter(sc){pcFit(sc);setTimeout(()=>{try{pcFit(sc)}catch(e){}},420);const o=sc.querySelector(".dmapo");if(!o)return;const L=pcRow()||[];const G=GOODS[pg]||{};
 if(!L.length){o.innerHTML="";return}const mn=Math.min(...L.map(x=>x.p)),mx=Math.max(...L.map(x=>x.p)),bt=pcBest(L);const lic=new Set(P().lic||[]);
 const pos=ci=>{try{return CITY_DEF[CITY(ci).def].pos}catch(e){return[0,0]}};let h=`<defs><marker id="dpcArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#8e1f1c"/></marker><filter id="dpcSh" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity=".5"/></filter></defs>`;
 if(bt){const a=pos(bt.lo.ci),b=pos(bt.hi.ci);const mx2=(a[0]+b[0])/2,my2=(a[1]+b[1])/2-Math.max(40,Math.abs(a[0]-b[0])*.25);h+=`<path d="M${a[0]} ${a[1]-30}Q${mx2} ${my2} ${b[0]} ${b[1]-30}" fill="none" stroke="#8e1f1c" stroke-width="3.5" stroke-dasharray="9 6" marker-end="url(#dpcArr)" opacity=".9"><animate attributeName="stroke-dashoffset" from="30" to="0" dur="1.2s" repeatCount="indefinite"/></path>`;
  const tx=`+${fmt(bt.d)} zl./ks`;h+=`<g filter="url(#dpcSh)"><rect x="${mx2-58}" y="${my2+14}" width="116" height="26" rx="5" fill="#f6e2a0" stroke="#8e1f1c" stroke-width="1.5"/><text x="${mx2}" y="${my2+32}" text-anchor="middle" font-family="Almendra SC,EB Garamond,serif" font-size="15" fill="#8e1f1c">${E(tx)}</text></g>`}
 L.forEach(x=>{const[px,py]=pos(x.ci);const t=mx>mn?(x.p-mn)/(mx-mn):.5,here=x.ci===S.ci,sel=x.ci===pcity;const r=sel?24:here?22:19;
  h+=`<g class="dpcs" data-a="dpcc" data-c="${x.ci}" style="cursor:pointer" filter="url(#dpcSh)"><title>${E(x.n)}: ${E(G.n||"")} ${fmt(x.p)} zl.${here?" (tu si)":""}${lic.has(x.ci)?" · máš obchodné právo":""}</title><circle cx="${px}" cy="${py-30}" r="${r}" fill="${rankC(t)}" stroke="${here?"#f2d78d":"#fff3d6"}" stroke-width="${here||sel?4:2}"/>${lic.has(x.ci)?`<circle cx="${px+r*.72}" cy="${py-30-r*.72}" r="6" fill="#27408b" stroke="#fff3d6" stroke-width="1.5"/>`:""}<text x="${px}" y="${py-25}" text-anchor="middle" font-family="EB Garamond,Georgia,serif" font-weight="700" font-size="${r>20?16:14}" fill="#fff">${fmt(x.p)}</text><path d="M${px} ${py-30+r} L${px} ${py-4}" stroke="${rankC(t)}" stroke-width="2.5"/></g>`});
 o.innerHTML=h}
function pcPanel(sd){
 pcParse();pcPick();const G=GOODS[pg]||{};if(ptab==="tab")sd.classList.add("wide");
 const cats=trhCats();const opts=cats.map(c=>`<optgroup label="${E(c.l)}">${c.gs.map(g=>`<option value="${g}"${g===pg?" selected":""}>${E(GOODS[g].n)}</option>`).join("")}</optgroup>`).join("");
 sd.innerHTML=`<div class="dshead"><h2>Porovnanie cien</h2><span>${E(cityN(S.ci))}</span></div><div class="dssub"></div><label class="dtcat"><span>Tovar</span><select data-dt="pg" aria-label="Tovar na porovnanie">${opts}</select></label>${tabsH([["tovar","Mestá"],["tab","Celá tabuľka"]],ptab,"dptab")}<div class="dsbody"></div>${footH("Pôvodná stránka porovnania cien")}`;
 const sub=sd.querySelector(".dssub");[q("main .jsub"),q("main .ktabs")].forEach(e=>{if(e)sub.appendChild(e)});
 const body=sd.querySelector(".dsbody");
 if(ptab==="tab"){const t=q("main #sx-trh-1");if(t){t.open=true;body.appendChild(t)}else body.innerHTML=`<p class="dsempty">Tabuľka sa nenašla.</p>`;return}
 const L=(pcRow()||[]).slice().sort((a,b)=>a.p-b.p);if(!L.length){body.innerHTML=`<p class="dsempty">Pre tento tovar nie sú ceny.</p>`;return}
 const mn=L[0].p,mx=L[L.length-1].p,bt=pcBest(L),here=L.find(x=>x.ci===S.ci),lic=new Set(P().lic||[]);
 body.innerHTML=`${bt?`<div class="sheet dpcbest"><b>Najlepšia cesta pre ${E(G.n)}:</b> kúp v meste <b>${E(bt.lo.n)}</b> za ${fmt(bt.lo.p)} zl., predaj v meste <b>${E(bt.hi.n)}</b> za ${fmt(bt.hi.p)} zl. – rozdiel <b class="good">${fmt(bt.d)} zl. na kus</b>.${here?`<br><span class="muted">Tu v meste ${E(here.n)}: ${fmt(here.p)} zl.</span>`:""}<p class="muted" style="font-size:.85rem;margin:6px 0 0">Rátaj aj s clom, cestou karavány a tým, že nákupy a predaje hýbu cenou.</p></div>`:""}
 <div class="dpclist" role="list">${L.map(x=>{const t=mx>mn?(x.p-mn)/(mx-mn):.5;return`<button type="button" role="listitem" class="dpcrow${x.ci===pcity?" on":""}" data-a="dpcc" data-c="${x.ci}"><span class="dpcn">${E(x.n)}${x.ci===S.ci?' <em>tu</em>':""}${lic.has(x.ci)?' <i title="máš obchodné právo">právo</i>':""}</span><span class="dpcbar"><i style="width:${Math.round(20+t*80)}%;background:${rankC(t)}"></i></span><b style="color:${rankC(t)}">${fmt(x.p)}</b></button>`}).join("")}</div>
 <p class="muted" style="font-size:.85rem;margin-top:8px">Zelená = najlacnejšie, červená = najdrahšie. Modrá bodka = mesto, kde máš obchodné právo.</p>`;
}

/* ---------- pisáreň kronikára: denník cieľov a kronika (pult s knihou, pergamen s cieľmi, knižnica, nástenka, písací stôl) ---------- */
let jopen=false,jtab="ciele";
KSCENE.register("pisaren",{id:"pisaren",W,H,label:"Pisáreň kronikára",
 state:()=>{let goals=[];try{goals=journal().slice().sort((a,b)=>b.pr-a.pr).slice(0,5).map(x=>[x.t.split(":")[0].slice(0,30),Math.round(Math.max(0,Math.min(1,x.pr))*100)])}catch(e){}
  return{ph:todPh()===3?3:1,season:S.season,goals,nlog:(S.log||[]).length,ng:(()=>{try{return journal().length}catch(e){return 0}})()}},
 build:st=>{I=IR;const shc=I.begin(st.ph,st.season,{});const c=I.off(W,H),x=c.getContext("2d");x.fillStyle="#140d07";x.fillRect(0,0,W,H);
  I.groundPlane(x,g=>{g.save();g.scale(.05,.05);g.fillStyle=I.pat(g,"cobble");g.fillRect(0,0,RW.R*20,RW.L*20);g.restore();g.fillStyle="#5a2a1a";g.globalAlpha=.8;g.fillRect(4.5,4.5,7,5.5);g.globalAlpha=1;g.strokeStyle="#c9a03a";g.lineWidth=.1;g.strokeRect(4.8,4.8,6.4,4.9);
   g.globalCompositeOperation="multiply";g.fillStyle=I.col(I.bright([0,0,1]));g.fillRect(0,0,RW.R,RW.L);g.globalCompositeOperation="source-over"});
  const hot=[],labels=[],folk=[];const lab=(v,t,sub,X,Y)=>labels.push({v,t,sub,X,Y});
  I.box(-.7,0,.7,RW.L,RW.H,{tex:"wall",noTop:1,noShadow:1,dd:-200,tpu:10});I.box(0,-.7,RW.R,.7,RW.H,{tex:"wall",noTop:1,noShadow:1,dd:-200,tpu:10});
  I.push({d:-150,draw:g=>{[["L",RW.L],["R",RW.R]].forEach(([w,len])=>onWall(g,w,w==="L"?len:0,2,0,q2=>{q2.fillStyle="#4a2e14";q2.fillRect(0,0,len,2);q2.fillStyle="rgba(0,0,0,.2)";for(let i=0;i<len;i+=1.4)q2.fillRect(i,.1,.05,1.8);q2.fillStyle="#c9a03a";q2.fillRect(0,-.06,len,.08)}))}});
  /* okno s olovenými sklíčkami (ľavá stena) */
  I.push({d:-140,draw:g=>onWall(g,"L",4.2,6.8,0,q2=>{q2.fillStyle="#6b5a48";q2.beginPath();q2.moveTo(-.25,4.4);q2.lineTo(-.25,1);q2.arc(1.1,1,1.35,Math.PI,0);q2.lineTo(2.45,4.4);q2.closePath();q2.fill();const gr=q2.createLinearGradient(0,0,0,4.2);gr.addColorStop(0,"#e8eef0");gr.addColorStop(1,"#a9bfcc");q2.fillStyle=gr;q2.beginPath();q2.moveTo(0,4.2);q2.lineTo(0,1);q2.arc(1.1,1,1.1,Math.PI,0);q2.lineTo(2.2,4.2);q2.closePath();q2.fill();q2.strokeStyle="rgba(60,50,40,.55)";q2.lineWidth=.04;for(let i=-4;i<8;i++){q2.beginPath();q2.moveTo(i*.45,0);q2.lineTo(i*.45+2.2,4.2);q2.stroke();q2.beginPath();q2.moveTo(i*.45+2.2,0);q2.lineTo(i*.45,4.2);q2.stroke()}})});
  /* pergamen s cieľmi (ľavá stena) */
  const GB=[12.8,7.4,5.6,5];
  I.push({d:-140,draw:g=>onWall(g,"L",GB[0],GB[1],0,q2=>{const w=GB[2],h=GB[3];q2.fillStyle="#3a2414";q2.fillRect(-.12,-.12,w+.24,h+.24);const gr=q2.createLinearGradient(0,0,w,h);gr.addColorStop(0,"#f6ecc8");gr.addColorStop(1,"#dcc68e");q2.fillStyle=gr;q2.fillRect(0,0,w,h);
   q2.fillStyle="#8e1f1c";q2.font=".42px 'Almendra SC',serif";q2.textBaseline="middle";q2.fillText("Denník cieľov",.35,.45);q2.fillStyle="#27408b";q2.fillRect(.35,.75,w-.7,.04);
   (st.goals.length?st.goals:[["Zatiaľ nič rozbehnuté",0]]).forEach(([t,pr],i)=>{const y=1.15+i*.75;q2.fillStyle="#2a2016";q2.font=".26px 'EB Garamond',serif";q2.fillText(t,.35,y);q2.fillStyle="rgba(120,80,20,.25)";q2.fillRect(.35,y+.2,w-1.5,.12);q2.fillStyle="#8e1f1c";q2.fillRect(.35,y+.2,(w-1.5)*pr/100,.12);q2.fillStyle="#4a3a26";q2.font=".22px 'EB Garamond',serif";q2.fillText(pr+" %",w-1,y+.26)});
   [[.15,.15],[w-.15,.15]].forEach(([a,b])=>{q2.fillStyle="#a3231d";q2.beginPath();q2.arc(a,b,.2,0,7);q2.fill()})})});
  hot.push({r:wallRect("L",GB[0],GB[1],GB[2],GB[3]),data:{a:"djtab",v:"ciele"},label:"Denník cieľov"});{const m=IR.P(0,GB[0]-GB[2]/2,GB[1]+.9);lab("ciele","Denník cieľov",st.ng?`${st.ng} cieľov`:"",m[0],m[1])}
  /* knižnica (pravá stena) */
  const BS=[.8,7.6,5.2,7.4],BC=["#8e1f1c","#27408b","#3f5a2a","#6a3a1a","#c9971a","#4a2a4a","#2a3a4a"];
  I.box(BS[0],0,BS[2],1.1,BS[1],{tex:"wood",tpu:8,noShadow:1});
  I.push({d:BS[0]+BS[2]+1.3,draw:g=>onWall(g,"R",BS[0]+.15,BS[1]-.2,1.1,q2=>{const w=BS[2]-.3,h=BS[1]-.4;q2.fillStyle="#2a1a0e";q2.fillRect(0,0,w,h);for(let r=0;r<5;r++){const y=r*h/5;q2.fillStyle="#5a3a1e";q2.fillRect(0,y+h/5-.12,w,.12);let xx=.08;let k=r*5;while(xx<w-.25){const bw=.16+((k*37)%5)*.04,bh=h/5-.35-((k*13)%3)*.12;q2.fillStyle=BC[k%BC.length];q2.fillRect(xx,y+h/5-.12-bh,bw,bh);q2.fillStyle="rgba(226,184,90,.7)";q2.fillRect(xx,y+h/5-.12-bh+.12,bw,.04);xx+=bw+.03;k++}}})});
  {const r=wallRect("R",BS[0],BS[1],BS[2],BS[1],1.1);hot.push({r,data:{a:"djbtn",v:"help"},label:"Kniha vedomostí – pravidlá a rady"});const m=IR.P(BS[0]+BS[2]/2,1,BS[1]+.7);lab("help","Kniha vedomostí","pravidlá a rady",m[0],m[1])}
  /* nástenka s novinami (pravá stena) */
  const NB=[7,6.4,3,3.2];
  I.push({d:-140,draw:g=>onWall(g,"R",NB[0],NB[1],0,q2=>{const w=NB[2],h=NB[3];q2.fillStyle="#6a4424";q2.fillRect(0,0,w,h);q2.strokeStyle="#3a2414";q2.lineWidth=.08;q2.strokeRect(.04,.04,w-.08,h-.08);[[.25,.3,1.4,1.9,-.05],[1.5,.5,1.25,1.6,.06],[.5,2,1.9,.9,0]].forEach(([a,b,ww,hh,rt])=>{q2.save();q2.translate(a,b);q2.rotate(rt);q2.fillStyle="#efe4c8";q2.fillRect(0,0,ww,hh);q2.fillStyle="rgba(60,40,20,.55)";for(let i=0;i<5;i++)q2.fillRect(.12,.22+i*.25,ww-.3-((i*7)%3)*.15,.05);q2.fillStyle="#a3231d";q2.beginPath();q2.arc(ww/2,.08,.08,0,7);q2.fill();q2.restore()})})});
  hot.push({r:wallRect("R",NB[0],NB[1],NB[2],NB[3]),data:{a:"djbtn",v:"news"},label:"Noviny – správy z ríše"});{const m=IR.P(NB[0]+NB[2]/2,0,NB[1]+.8);lab("news","Noviny","správy z ríše",m[0],m[1])}
  /* pult s kronikou */
  const LX=8.2,LY=6.6;I.setCur("lect");I.box(LX,LY,1.6,1.4,2.2,{tex:"wood",clean:1,tpu:8});I.setCur(null);
  I.push({d:LX+LY+3.4,draw:g=>{const p=(a,b,z)=>IR.P(LX+a,LY+b,z);const A1=p(-.6,-.4,2.3),B1=p(2.2,-.4,2.3),C1=p(2.2,1.8,2.8),D1=p(-.6,1.8,2.8);g.fillStyle="#4a2e14";g.beginPath();[A1,B1,C1,D1].forEach((q2,k)=>k?g.lineTo(q2[0],q2[1]):g.moveTo(q2[0],q2[1]));g.closePath();g.fill();
   const L1=p(-.4,-.2,2.45),L2=p(.8,-.2,2.45),L3=p(.8,1.6,2.9),L4=p(-.4,1.6,2.9),R1=p(.8,-.2,2.45),R2=p(2,-.2,2.45),R3=p(2,1.6,2.9),R4=p(.8,1.6,2.9);
   [[L1,L2,L3,L4],[R1,R2,R3,R4]].forEach((Q,s2)=>{g.fillStyle=s2?"#f3e7c6":"#efe0b8";g.beginPath();Q.forEach((q2,k)=>k?g.lineTo(q2[0],q2[1]):g.moveTo(q2[0],q2[1]));g.closePath();g.fill();g.strokeStyle="rgba(60,40,20,.5)";g.lineWidth=1;for(let i=1;i<7;i++){const t2=i/7.5,a2=[Q[0][0]+(Q[3][0]-Q[0][0])*t2,Q[0][1]+(Q[3][1]-Q[0][1])*t2],b2=[Q[1][0]+(Q[2][0]-Q[1][0])*t2,Q[1][1]+(Q[2][1]-Q[1][1])*t2];g.beginPath();g.moveTo(a2[0]+6,a2[1]);g.lineTo(b2[0]-6,b2[1]);g.stroke()}});
   g.fillStyle="#27408b";g.fillRect(L1[0]+8,L1[1]+6,14,14);g.fillStyle="#e2b85a";g.font="bold 12px serif";g.fillText("C",L1[0]+11,L1[1]+17);g.strokeStyle="#8e1f1c";g.lineWidth=2;g.beginPath();g.moveTo(R2[0]-4,R2[1]);g.lineTo(R3[0]-4,R3[1]+16);g.stroke()}});
  {const a=IR.P(LX-.8,LY+2,0),b=IR.P(LX+2.4,LY-.6,3.2);hot.push({r:[a[0]-10,b[1]-30,b[0]+20,a[1]+10],data:{a:"djtab",v:"kronika"},label:"Kronika rodu"});const m=IR.P(LX+.8,LY+.7,4.4);lab("kronika","Kronika",`${st.nlog} ${st.nlog===1?"záznam":st.nlog<5?"záznamy":"záznamov"}`,m[0],m[1])}
  /* písací stôl s mníchom */
  I.box(2.4,8.8,3.4,1.8,1.25,{tex:"wood",clean:1,tpu:8});
  I.push({d:2.4+3.4+8.8+1.8+.3,draw:g=>{const s2=IR.P(3.2,9.4,1.27),s3=IR.P(4.8,9.8,1.27);g.fillStyle="#efe4c8";g.save();g.translate(s2[0],s2[1]);g.rotate(.45);g.fillRect(-18,-10,36,22);g.restore();g.fillStyle="#1a1a2a";g.beginPath();g.arc(s3[0],s3[1]-4,6,0,7);g.fill();g.strokeStyle="#efe4c8";g.lineWidth=2;g.beginPath();g.moveTo(s3[0]+2,s3[1]-8);g.quadraticCurveTo(s3[0]+12,s3[1]-34,s3[0]+20,s3[1]-44);g.stroke()}});
  folk.push({x:4.2,y:11.6,i:5});
  {const a=IR.P(2.2,12.4,0),b=IR.P(5.9,8.6,1.4);hot.push({r:[a[0]-10,b[1]-90,b[0]+10,a[1]+10],data:{a:"djtab",v:"kronika"},label:"Pisár – kronika rodu"})}
  /* sviečky */
  const CA=[[LX-.4,LY+1.9],[LX+2.3,LY-.3],[2.6,9]];
  I.drawSolids(x,shc,.35);K.vignette(x,W,H,.45);
  return{img:c,hot,labels,folk,st,CA}},
 animate:(g,C,t)=>{I=IR;
  C.CA.forEach(([cx,cy],i)=>{const zz=i<2?0:1.25;const b=IR.P(cx,cy,zz);if(i<2){g.fillStyle="#4a2e14";g.fillRect(b[0]-3,b[1]-90,6,90)}const top=i<2?b[1]-96:b[1]-24;g.fillStyle="#e8dcc0";g.fillRect(b[0]-4,top,8,i<2?8:22);const f=Math.sin(t*9+i*2)*.5+.5;g.fillStyle=`rgba(255,${190+f*40},90,.95)`;g.beginPath();g.ellipse(b[0],top-8,4,8+f*2,0,0,7);g.fill();g.save();g.globalCompositeOperation="screen";const gr=g.createRadialGradient(b[0],top-8,2,b[0],top-8,140);gr.addColorStop(0,"rgba(255,190,100,.35)");gr.addColorStop(1,"rgba(255,160,60,0)");g.fillStyle=gr;g.fillRect(b[0]-140,top-148,280,280);g.restore()});
  C.folk.forEach(f=>{const q2=IR.P(f.x,f.y,0);try{KFIG2.draw(g,q2[0],q2[1],5.6,{look:{g:"m",skin:1,hc:4,beard:0,eyes:1},robe:"#3a2a22",title:0,hat:null,tool:null,act:"stir",t,i:f.i})}catch(e){}});
  K.nightTint(g,IR,W,H,C.st.ph);const fk=focusOf();spot(g,C,fk);
  g.save();g.textAlign="center";g.textBaseline="middle";
  C.labels.forEach(l=>{const on=l.v===jtab;g.globalAlpha=fk&&l.v!==fk?.45:1;g.font=`${on?19:17}px "Almendra SC","EB Garamond",serif`;const w1=g.measureText(l.t).width;g.font='13px "EB Garamond",serif';const w2=l.sub?g.measureText(l.sub).width:0;const tw=Math.max(w1,w2)+24,th=l.sub?42:28,X=l.X,Y=l.Y-(on?5+Math.sin(t*3)*3:0);
   g.fillStyle=on?"#f6e2a0":"rgba(250,240,212,.95)";g.strokeStyle=on?"#8e1f1c":"#b5892a";g.lineWidth=on?2.5:1.5;g.beginPath();g.roundRect?g.roundRect(X-tw/2,Y-th/2,tw,th,5):g.rect(X-tw/2,Y-th/2,tw,th);g.fill();g.stroke();
   g.fillStyle="#8e1f1c";g.font=`${on?19:17}px "Almendra SC","EB Garamond",serif`;g.fillText(l.t,X,Y-(l.sub?8:0));if(l.sub){g.fillStyle="#4a3a26";g.font='13px "EB Garamond",serif';g.fillText(l.sub,X,Y+11)}});
  g.restore()}});
function pisPanel(sd){
 sd.classList.add("wide");const inView=S.view==="kronika"&&!jopen;
 sd.innerHTML=`<div class="dshead"><h2>Pisáreň kronikára</h2><span>${jopen?`<button type="button" class="btn sm" data-a="jclose" title="Zavrieť (Esc)">✕ Zavrieť</button>`:E(cityN(S.ci))}</span></div><div class="dsrow2">${tabsH([["ciele","Denník cieľov"],["kronika","Kronika"]],jtab,"djtab")}<span class="dsbtns"><button type="button" class="btn sm" data-a="djbtn" data-v="help">Kniha vedomostí</button><button type="button" class="btn sm" data-a="djbtn" data-v="news">Noviny</button></span></div><div class="dsbody dspis"></div>${inView?footH("Pôvodná stránka kroniky"):""}`;
 const body=sd.querySelector(".dsbody");
 if(jtab==="kronika"){if(inView){[...document.querySelectorAll("main > *")].forEach(e=>body.appendChild(e))}else{let h="";try{h=vKronika()}catch(e){h=`<p class="dsempty">Kroniku sa nepodarilo otvoriť.</p>`}body.innerHTML=h}return}
 let L=[];try{L=journal()}catch(e){}const G=[...new Set(L.map(x=>x.g))];const pc=x=>Math.round(Math.max(0,Math.min(1,x.pr))*100);
 body.innerHTML=L.length?G.map(gn=>`<div class="sheet"><h3>${E(gn)}</h3><ul class="jlist">${L.filter(x=>x.g===gn).sort((a,b)=>b.pr-a.pr).map(x=>`<li><span>${E(x.t)}</span><div class="meter"><i style="width:${pc(x)}%"></i></div><b class="num">${pc(x)} %</b></li>`).join("")}</ul></div>`).join(""):`<p class="dsempty">Zatiaľ nič rozbehnuté.</p>`;
}
{const oj=A.journal;A.journal=function(){try{if(hasS()&&pref()&&desk()&&hbPref()&&document.body.classList.contains("hb")){jopen=true;try{popen=false;mopen=false}catch(x){}jtab="ciele";render();return}}catch(e){}return oj&&oj.apply(this,arguments)}}
{const ot=A.tab;A.tab=function(e){jopen=false;if(e&&e.v==="kronika")jtab="kronika";return ot.apply(this,arguments)}}
window.addEventListener("keydown",e=>{if(e.key==="Escape"&&jopen){const m=document.getElementById("modal");if(m&&!m.hidden)return;e.preventDefault();e.stopImmediatePropagation();jopen=false;render()}},true);

/* ---------- prehľad mesta: pergamenový panel nad mapou mesta namiesto tmavej zásuvky ---------- */
let popen=false,ptab2="stvrtrok";const POPEN=new Set();
const PTABS=[["stvrtrok","Štvrťrok",["main .jtask","main .tguide","main .tgoal"]],["stavby","Stavby a sídlo",["main .sbcard","main .sdcard"]],["mesto","Mesto",["main #sx-mesto-2","main #sx-mesto-3"]],["okolie","Okolie",["main #okolie"]],["ludia","Ľudia",["main .npcp","main .krcp"]],["kronika","Kronika",["main #sx-mesto-4"]]];
function prPanel(sd){
 const T=PTABS.find(x=>x[0]===ptab2)||PTABS[0];const det=q('header.top [data-a="detail"]');
 sd.innerHTML=`<div class="dshead"><h2>Prehľad mesta</h2><span><button type="button" class="btn sm" data-a="pclose" title="Zavrieť (Esc)">✕ Zavrieť</button></span></div><div class="dsbtns2">${det?`<button type="button" class="btn sm" data-a="djbtn" data-v="detail" title="${E(det.title||"")}">${E(txt(det))}</button>`:""}<button type="button" class="btn sm" data-a="djbtn" data-v="news">Noviny</button><span class="muted">${E(cityN(S.ci))}</span></div>${tabsH(PTABS.map(x=>[x[0],x[1]]),T[0],"dprtab")}<div class="dsbody dspr"></div>`;
 const body=sd.querySelector(".dsbody");let n=0;
 T[2].forEach(s=>{const e=q(s);if(!e)return;body.appendChild(e);n++});
 {const tg=[...body.querySelectorAll('.vgh [data-a="vtog"][aria-expanded="false"]')].find(t=>!POPEN.has(t.dataset.k));if(tg){const k=tg.dataset.k;POPEN.add(k);setTimeout(()=>{try{const t2=document.querySelector(`#dside .vgh [data-a="vtog"][data-k="${k}"][aria-expanded="false"]`);if(t2)t2.click()}catch(x){}},0)}}
 if(!n)body.innerHTML=`<p class="dsempty">Tu zatiaľ nič nie je.</p>`;
}
const prOk=()=>{try{return hasS()&&S.view==="mesto"&&pref()&&desk()&&hbPref()&&document.body.classList.contains("hb")&&!document.body.classList.contains("hbs")}catch(e){return false}};
/* tlačidlá „Prehľad“ a „Všetky rady“ na mape otvoria pergamenový panel namiesto zásuvky */
window.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest('#hb [data-hb="drawer"],#hb [data-hb="goto"]');if(!b||!prOk())return;e.preventDefault();e.stopImmediatePropagation();
 if(b.dataset.hb==="goto"){popen=true;ptab2=(b.dataset.q||"").includes("tguide")||(b.dataset.q||"").includes("jtask")?"stvrtrok":ptab2}else popen=!popen;jopen=false;try{mopen=false}catch(x){}render()},true);
{const ot=A.tab;A.tab=function(e){popen=false;return ot.apply(this,arguments)}}
window.addEventListener("keydown",e=>{if(e.key==="Escape"&&popen){const m=document.getElementById("modal");if(m&&!m.hidden)return;e.preventDefault();e.stopImmediatePropagation();popen=false;render()}},true);

/* ---------- ponuka: pracovňa hlavy rodu (stôl s pečaťou, police so záznamami, lutna, zvonček, lampa, kniha, zvitok, hodiny, dvere) ---------- */
let mopen=false;
const MN=[["gmSave","Uložiť hru","stôl s pečaťou"],["saves","Uložené hry","police so záznamami"],["music","Hudba",""],["sfx","Zvuky",""],["darkT","Tmavý režim",""],["help","Kniha vedomostí","pravidlá a rady"],["tPojmy","Vysvetlenie pojmov","slovník hry"],["settings","Nastavenia","písmo, zvuk, obraz"],["toMenu","Do hlavného menu","hra sa uloží"]];
const onOff=v=>v?"zapnuté":"vypnuté";
const mnSub=a=>{try{if(a==="music")return onOff(SND.music);if(a==="sfx")return onOff(SND.sfx);if(a==="darkT")return onOff(PREF.dark)}catch(e){}return(MN.find(x=>x[0]===a)||[])[2]||""};
KSCENE.register("pracovna",{id:"pracovna",W,H,label:"Pracovňa hlavy rodu",
 state:()=>({ph:todPh()===3?3:1,season:S.season,m:mnSub("music"),s:mnSub("sfx"),d:mnSub("darkT")}),
 build:st=>{I=IR;const shc=I.begin(st.ph,st.season,{});const c=I.off(W,H),x=c.getContext("2d");x.fillStyle="#140d07";x.fillRect(0,0,W,H);
  I.groundPlane(x,g=>{g.save();g.scale(.05,.05);g.fillStyle=I.pat(g,"wood");g.fillRect(0,0,RW.R*20,RW.L*20);g.restore();g.fillStyle="#27408b";g.globalAlpha=.7;g.fillRect(3.5,4,9,6.5);g.globalAlpha=1;g.strokeStyle="#d9ab3e";g.lineWidth=.12;g.strokeRect(3.8,4.3,8.4,5.9);
   g.globalCompositeOperation="multiply";g.fillStyle=I.col(I.bright([0,0,1]));g.fillRect(0,0,RW.R,RW.L);g.globalCompositeOperation="source-over"});
  const hot=[],labels=[];const lab=(a,X,Y)=>labels.push({a,X,Y});const H2=(a,r)=>hot.push({r,data:{a:"mnact",v:a},label:(MN.find(z=>z[0]===a)||[])[1]});
  I.box(-.7,0,.7,RW.L,RW.H,{tex:"plaster",noTop:1,noShadow:1,dd:-200,tpu:10});I.box(0,-.7,RW.R,.7,RW.H,{tex:"plaster",noTop:1,noShadow:1,dd:-200,tpu:10});
  I.push({d:-150,draw:g=>{[["L",RW.L],["R",RW.R]].forEach(([w,len])=>onWall(g,w,w==="L"?len:0,2.6,0,q2=>{q2.fillStyle="#3a2414";q2.fillRect(0,0,len,2.6);q2.fillStyle="rgba(255,255,255,.06)";for(let i=0;i<len;i+=1.3)q2.fillRect(i,.15,1.1,2.3);q2.fillStyle="#c9a03a";q2.fillRect(0,-.06,len,.08)}))}});
  /* police so záznamami (ľavá stena) */
  const SV=[13.4,7.6,5,6.4],SC=["#6a2a1a","#2a3a5a","#4a3a1a","#3a4a2a","#5a2a3a"];
  I.push({d:-140,draw:g=>onWall(g,"L",SV[0],SV[1],0,q2=>{const w=SV[2],h=SV[3];q2.fillStyle="#3a2414";q2.fillRect(-.1,-.1,w+.2,h+.2);for(let r=0;r<4;r++){const y=r*h/4;q2.fillStyle="#5a3a1e";q2.fillRect(0,y+h/4-.12,w,.12);let xx=.1,k=r*3;while(xx<w-.5){const bw=.42+((k*7)%3)*.08;q2.fillStyle=SC[k%SC.length];q2.fillRect(xx,y+.25,bw,h/4-.37);q2.fillStyle="#d9ab3e";q2.fillRect(xx+.08,y+.55,bw-.16,.06);q2.fillRect(xx+.08,y+h/4-.4,bw-.16,.06);xx+=bw+.04;k++}}})});
  H2("saves",wallRect("L",SV[0],SV[1],SV[2],SV[3]));{const m=IR.P(0,SV[0]-SV[2]/2,SV[1]+.8);lab("saves",m[0],m[1])}
  /* zvitok s pojmami (ľavá stena) */
  const PJ=[7.4,6.8,2.2,3.4];
  I.push({d:-140,draw:g=>onWall(g,"L",PJ[0],PJ[1],0,q2=>{const w=PJ[2],h=PJ[3];q2.fillStyle="#5a3a1e";q2.fillRect(-.15,-.18,w+.3,.22);q2.fillRect(-.15,h-.04,w+.3,.22);q2.fillStyle="#f1e2b4";q2.fillRect(0,0,w,h);q2.fillStyle="#8e1f1c";q2.font=".3px 'Almendra SC',serif";q2.fillText("Pojmy",.3,.45);q2.fillStyle="rgba(60,40,20,.5)";for(let i=0;i<7;i++)q2.fillRect(.25,.75+i*.35,w-.5-((i*5)%3)*.2,.05)})});
  H2("tPojmy",wallRect("L",PJ[0],PJ[1],PJ[2],PJ[3]));{const m=IR.P(0,PJ[0]-PJ[2]/2,PJ[1]+.8);lab("tPojmy",m[0],m[1])}
  /* lutna (ľavá stena) */
  const LU=[4.2,5.6];
  I.push({d:-140,draw:g=>onWall(g,"L",LU[0],LU[1],0,q2=>{q2.save();q2.translate(.9,1.6);q2.rotate(-.5);q2.fillStyle="#8a5a2a";q2.beginPath();q2.ellipse(0,.4,.75,.95,0,0,7);q2.fill();q2.fillStyle="#2a1a0e";q2.beginPath();q2.arc(0,.2,.22,0,7);q2.fill();q2.fillStyle="#6a4424";q2.fillRect(-.12,-1.9,.24,1.6);q2.save();q2.translate(0,-1.95);q2.rotate(-.7);q2.fillRect(-.12,-.45,.24,.5);q2.restore();q2.strokeStyle="#e8dcc0";q2.lineWidth=.02;for(let i=-2;i<=2;i++){q2.beginPath();q2.moveTo(i*.04,-1.8);q2.lineTo(i*.05,1);q2.stroke()}q2.restore()})});
  H2("music",wallRect("L",LU[0],LU[1],2,3.2));{const m=IR.P(0,LU[0]-1,LU[1]-3.9);lab("music",m[0],m[1])}
  /* hodiny (pravá stena) */
  const CK=[1.2,7.6];
  I.push({d:-140,draw:g=>onWall(g,"R",CK[0],CK[1],0,q2=>{q2.fillStyle="#4a2e14";q2.beginPath();q2.moveTo(0,1.6);q2.lineTo(0,.6);q2.lineTo(.9,0);q2.lineTo(1.8,.6);q2.lineTo(1.8,1.6);q2.closePath();q2.fill();q2.fillStyle="#efe4c8";q2.beginPath();q2.arc(.9,.95,.55,0,7);q2.fill();q2.strokeStyle="#2a1a0e";q2.lineWidth=.05;q2.stroke();const tt=(Date.now()/1000)%60;q2.beginPath();q2.moveTo(.9,.95);q2.lineTo(.9,.55);q2.moveTo(.9,.95);q2.lineTo(1.2,1.05);q2.stroke();q2.fillStyle="#6a4424";q2.fillRect(.6,1.6,.6,2.6);q2.fillStyle="#d9ab3e";q2.beginPath();q2.arc(.9,3.7,.22,0,7);q2.fill();q2.fillRect(.86,1.7,.08,1.9)})});
  H2("settings",wallRect("R",CK[0],CK[1],1.8,4.3));{const m=IR.P(CK[0]+.9,0,CK[1]+.8);lab("settings",m[0],m[1])}
  /* dvere (pravá stena) */
  const DR=[4.2,5.4,2.4,5.4];
  I.push({d:-140,draw:g=>onWall(g,"R",DR[0],DR[1],0,q2=>{const w=DR[2],h=DR[3];q2.fillStyle="#6b5a48";q2.beginPath();q2.moveTo(-.2,h);q2.lineTo(-.2,1.1);q2.arc(w/2,1.1,w/2+.2,Math.PI,0);q2.lineTo(w+.2,h);q2.closePath();q2.fill();q2.fillStyle="#5a3418";q2.beginPath();q2.moveTo(0,h);q2.lineTo(0,1.1);q2.arc(w/2,1.1,w/2,Math.PI,0);q2.lineTo(w,h);q2.closePath();q2.fill();q2.strokeStyle="#2a1a0e";q2.lineWidth=.05;for(let i=1;i<4;i++){q2.beginPath();q2.moveTo(i*w/4,.4);q2.lineTo(i*w/4,h);q2.stroke()}q2.fillStyle="#2a2a30";q2.fillRect(0,1.6,w,.12);q2.fillRect(0,h-1.2,w,.12);q2.fillStyle="#d9ab3e";q2.beginPath();q2.arc(w-.4,h/2+.6,.1,0,7);q2.fill()})});
  H2("toMenu",wallRect("R",DR[0],DR[1],DR[2],DR[3]));{const m=IR.P(DR[0]+DR[2]/2,0,DR[1]+.8);lab("toMenu",m[0],m[1])}
  /* stôl s pečaťou, zvončekom a lampou */
  const TX=4.6,TY=6.4;I.box(TX,TY,5.2,2.4,1.35,{tex:"wood",clean:1,tpu:8});I.box(TX+1.6,TY+3,2,.9,.9,{tex:"wood",clean:1,tpu:8});
  I.push({d:TX+5.2+TY+2.4+.3,draw:g=>{const Z=1.36,P2=(a,b)=>IR.P(TX+a,TY+b,Z);
   {const a=P2(.6,.5),b=P2(2.6,.5),c2=P2(2.6,1.9),d=P2(.6,1.9);g.fillStyle="#efe4c8";g.beginPath();[a,b,c2,d].forEach((q2,k)=>k?g.lineTo(q2[0],q2[1]):g.moveTo(q2[0],q2[1]));g.closePath();g.fill();g.fillStyle="rgba(60,40,20,.45)";for(let i=1;i<5;i++){const t2=i/5.5;g.fillRect(a[0]+(d[0]-a[0])*t2+10,a[1]+(d[1]-a[1])*t2,(b[0]-a[0])*.7,1.5)}const s2=P2(2.2,1.6);g.fillStyle="#a3231d";g.beginPath();g.arc(s2[0],s2[1],8,0,7);g.fill()}
   {const p=P2(3.4,1);g.fillStyle="#3a2414";g.fillRect(p[0]-4,p[1]-26,8,26);g.fillStyle="#a3231d";g.beginPath();g.ellipse(p[0],p[1]-28,9,6,0,0,7);g.fill()}
   {const p=P2(4.3,1.6);g.fillStyle="#d9ab3e";g.strokeStyle="#7a5a14";g.lineWidth=1.5;g.beginPath();g.moveTo(p[0]-10,p[1]);g.quadraticCurveTo(p[0]-9,p[1]-22,p[0],p[1]-24);g.quadraticCurveTo(p[0]+9,p[1]-22,p[0]+10,p[1]);g.closePath();g.fill();g.stroke();g.fillStyle="#5a3a1e";g.fillRect(p[0]-2,p[1]-34,4,10)}
   {const p=P2(4.6,.5);g.fillStyle="#3a3a40";g.fillRect(p[0]-12,p[1]-6,24,6);g.fillStyle="#2a2a30";g.fillRect(p[0]-2,p[1]-40,4,34);g.fillStyle="rgba(255,230,160,.55)";g.strokeStyle="#2a2a30";g.lineWidth=2;g.beginPath();g.rect(p[0]-11,p[1]-62,22,24);g.fill();g.stroke()}}});
  {const a=IR.P(TX,TY+2.4,0),b=IR.P(TX+2.8,TY,1.4);H2("gmSave",[a[0]-6,b[1]-40,b[0]+10,a[1]+8]);const m=IR.P(TX+1.4,TY+1.2,3);lab("gmSave",m[0],m[1])}
  {const a=IR.P(TX+3.8,TY+1.6,1.36),b=IR.P(TX+4.6,TY+.5,1.36);H2("sfx",[a[0]-16,a[1]-40,a[0]+16,a[1]+6]);H2("darkT",[b[0]-16,b[1]-70,b[0]+16,b[1]-4]);const m1=IR.P(TX+4.3,TY+1.8,3.2);lab("sfx",m1[0]-60,m1[1]+40);const m2=IR.P(TX+4.6,TY+.3,4.3);lab("darkT",m2[0]+40,m2[1])}
  /* pult s knihou vedomostí */
  const BK=[13.5,7.5];I.box(BK[0],BK[1],1.4,1.2,1.9,{tex:"wood",clean:1,tpu:8});
  I.push({d:BK[0]+BK[1]+3,draw:g=>{const a=IR.P(BK[0]-.2,BK[1]-.2,2),b=IR.P(BK[0]+1.6,BK[1]-.2,2),c2=IR.P(BK[0]+1.6,BK[1]+1.4,2.4),d=IR.P(BK[0]-.2,BK[1]+1.4,2.4);g.fillStyle="#27408b";g.beginPath();[a,b,c2,d].forEach((q2,k)=>k?g.lineTo(q2[0],q2[1]):g.moveTo(q2[0],q2[1]));g.closePath();g.fill();g.strokeStyle="#d9ab3e";g.lineWidth=2;g.stroke();const m=IR.P(BK[0]+.7,BK[1]+.6,2.25);g.fillStyle="#d9ab3e";g.beginPath();g.arc(m[0],m[1],7,0,7);g.fill()}});
  {const a=IR.P(BK[0]-.3,BK[1]+1.4,0),b=IR.P(BK[0]+1.7,BK[1]-.3,2.6);H2("help",[a[0]-10,b[1]-20,b[0]+10,a[1]+8]);const m=IR.P(BK[0]+.7,BK[1]+.6,3.6);lab("help",m[0],m[1])}
  I.drawSolids(x,shc,.35);K.vignette(x,W,H,.42);
  return{img:c,hot,labels,st}},
 animate:(g,C,t)=>{I=IR;K.nightTint(g,IR,W,H,C.st.ph);
  g.save();g.textAlign="center";g.textBaseline="middle";
  C.labels.forEach(l=>{const t0=(MN.find(z=>z[0]===l.a)||[])[1]||"",sub=mnSub(l.a);g.font='17px "Almendra SC","EB Garamond",serif';const w1=g.measureText(t0).width;g.font='13px "EB Garamond",serif';const w2=sub?g.measureText(sub).width:0;const tw=Math.max(w1,w2)+24,th=sub?42:28,X=l.X,Y=l.Y;
   g.fillStyle="rgba(250,240,212,.95)";g.strokeStyle="#b5892a";g.lineWidth=1.5;g.beginPath();g.roundRect?g.roundRect(X-tw/2,Y-th/2,tw,th,5):g.rect(X-tw/2,Y-th/2,tw,th);g.fill();g.stroke();
   g.fillStyle="#8e1f1c";g.font='17px "Almendra SC","EB Garamond",serif';g.fillText(t0,X,Y-(sub?8:0));if(sub){g.fillStyle="#4a3a26";g.font='13px "EB Garamond",serif';g.fillText(sub,X,Y+11)}});
  g.restore()}});
function menPanel(sd){
 const b2=(a,n,sub,cls)=>`<button type="button" class="dmnb${cls?" "+cls:""}" data-a="mnact" data-v="${a}"><b>${E(n)}</b>${sub?`<small>${E(sub)}</small>`:""}</button>`;
 sd.innerHTML=`<div class="dshead"><h2>Ponuka</h2><span><button type="button" class="btn sm pri" data-a="mnclose" title="Pokračovať v hre (Esc)">▶ Pokračovať</button></span></div><div class="dsbody dmn">
 ${b2("gmSave","Uložiť hru","")}${b2("saves","Uložené hry","načítať, stiahnuť, zmazať")}
 <div class="dmn2">${b2("music","Hudba",mnSub("music"))}${b2("sfx","Zvuky",mnSub("sfx"))}${b2("darkT","Tmavý režim",mnSub("darkT"))}${b2("help","Kniha vedomostí","")}</div>
 ${b2("tPojmy","Vysvetlenie pojmov","")}${b2("settings","Nastavenia","písmo, zvuk, obraz, tempo, upozornenia")}${b2("toMenu","Do hlavného menu","hra sa uloží")}${b2("menuQuit","Ukončiť hru","","quit")}
 <p class="muted" style="font-size:.88rem;margin-top:8px">Klávesom Esc ponuku otvoríš aj zavrieš. Predmety v pracovni robia to isté ako tlačidlá.</p></div>`}
const mnOk=()=>{try{return hasS()&&pref()&&desk()&&hbPref()&&document.body.classList.contains("hb")&&!document.getElementById("m3d")}catch(e){return false}};
{const og=A.gameMenu;A.gameMenu=function(){if(mnOk()){mopen=true;jopen=false;popen=false;render();return}return og&&og.apply(this,arguments)}}
{const ot=A.tab;A.tab=function(e){mopen=false;return ot.apply(this,arguments)}}
window.addEventListener("keydown",e=>{if(e.key!=="Escape"||e.repeat)return;const m=document.getElementById("modal");if(m&&!m.hidden)return;if(jopen||popen)return;try{if(S&&S.sidloFull){e.preventDefault();e.stopImmediatePropagation();S.sidloFull=false;render();return}}catch(x){}if(e.target&&e.target.closest&&e.target.closest("input,select,textarea"))return;if(document.querySelector(".lens"))return;
 if(mopen){e.preventDefault();e.stopImmediatePropagation();mopen=false;render();return}if(mnOk()){e.preventDefault();e.stopImmediatePropagation();mopen=true;render()}},true);
/* nastavenia: záložky namiesto dlhého zvitku */
let stab="cit";
const STABS=[["cit","Čitateľnosť",["písmo a čitateľnosť","prístupnosť"]],["zvuk","Zvuk",["zvuk","zvuky prostredia","hlasy"]],["obraz","Obraz",["obraz a pohyb","scény a obrazy","nočný režim pri sviečke"]],["hra","Hra",["po skončení štvrťroka","tempo hry","obťažnosť","ukladanie"]],["upoz","Upozornenia",["upozornenia","noviny"]],["klav","Klávesy",[]]];
function setTabs(){const mb=document.getElementById("mbody");if(!mb)return;const h=mb.querySelector(":scope > h2");if(!h||txt(h)!=="Nastavenia")return;
 const groups=[...mb.querySelectorAll(".setg > div")];if(!groups.length)return;const sig=stab+":"+groups.length;if(mb.dataset.stDone===sig&&mb.querySelector(".settabs"))return;mb.dataset.stDone=sig;
 let nav=mb.querySelector(".settabs");if(!nav){nav=document.createElement("nav");nav.className="settabs";nav.setAttribute("role","tablist");h.insertAdjacentElement("afterend",nav)}
 nav.innerHTML=STABS.map(([k,n])=>`<button type="button" role="tab" data-st="${k}" aria-selected="${k===stab}" class="${k===stab?"on":""}">${n}</button>`).join("");
 const T=STABS.find(x=>x[0]===stab)||STABS[0];const known=new Set(STABS.flatMap(x=>x[2]));
 groups.forEach(d=>{const l=txt(d.querySelector(".lbl")).toLowerCase();const inT=T[2].some(n=>l.startsWith(n));const orphan=![...known].some(n=>l.startsWith(n));d.style.display=inT||(orphan&&stab==="hra")?"":"none"});
 mb.querySelectorAll(":scope > .setg").forEach(s=>{s.style.display=[...s.children].some(c=>c.style.display!=="none")?"":"none"});
 mb.querySelectorAll(":scope > p.muted").forEach(p=>{p.style.display=stab==="klav"?"":"none"});
 mb.classList.add("settabbed")}
new MutationObserver(()=>{try{setTabs()}catch(e){}}).observe(document.getElementById("modal")||document.body,{childList:true,subtree:true});
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("#mbody .settabs [data-st]");if(!b)return;e.preventDefault();e.stopPropagation();stab=b.dataset.st;const mb=document.getElementById("mbody");if(mb)delete mb.dataset.stDone;setTabs()},true);

/* legenda skupín stánkov vľavo hore vo voľnej časti scény */
function trhLegend(sc){let lg=sc.querySelector(".trhleg");if(!lg){lg=document.createElement("div");lg.className="trhleg";lg.setAttribute("aria-hidden","true");sc.appendChild(lg)}
 lg.innerHTML=GORD.map(k=>`<span><i style="background:linear-gradient(90deg,${TGRP[k].c[0]} 50%,${TGRP[k].c[1]} 50%)"></i>${TGRP[k].n}</span>`).join("")+`<span class="trhleg-n">% = cena oproti bežnej · ▲ drahé, predávaj · ▼ lacné, nakupuj</span>`;
 const l0=Math.round(railR()+18),sd=document.getElementById("dside"),pr=sd?sd.getBoundingClientRect().left:innerWidth;lg.style.left=l0+"px";lg.style.maxWidth=Math.max(220,Math.min(520,pr-l0-20))+"px"}
{const st=document.createElement("style");st.textContent=`#dscene .trhleg{position:absolute;top:118px;z-index:2;display:flex;flex-wrap:wrap;gap:6px 12px;max-width:520px;padding:7px 12px;background:rgba(246,236,208,.92);border:1px solid #b8862c;border-radius:8px;box-shadow:0 3px 10px rgba(0,0,0,.3);font:600 .82rem/1.2 Georgia,serif;color:#3a2410;pointer-events:none}
#dscene .trhleg span{display:inline-flex;align-items:center;gap:5px}#dscene .trhleg i{width:18px;height:10px;border-radius:2px;border:1px solid rgba(0,0,0,.3)}#dscene .trhleg .trhleg-n{flex-basis:100%;font-weight:400;font-size:.74rem;color:#6a4a20}`;document.head.appendChild(st)}
/* ---------- Obchod: spoločná hlavička všetkých miest (navigácia, hlavné čísla, hlavná akcia) ---------- */
const OBI=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const OBP=[["dielne","Dielne",OBI('<path d="M4 20l8.5-8.5"/><path d="M10.5 6.5l3.5-3 6.5 6.5-3 3.5z"/>')],
 ["trh","Trh",OBI('<path d="M12 4v15M7 20h10M5 8h14"/><path d="M5 8l-3 6h6zM19 8l-3 6h6z"/>')],
 ["kar","Karavány",OBI('<path d="M2 14h14V8H2z"/><path d="M16 11h3.5l1.5 3h-5"/><circle cx="6" cy="17" r="2"/><circle cx="16" cy="17" r="2"/>')],
 ["kraj","Krajčír",OBI('<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.5 7.5L20 19M8.5 16.5L20 5"/>')],
 ["cen","Ceny",OBI('<path d="M4 4v16h16"/><path d="M7 16l4-5 3 3 5-7"/>')],
 ["svet","Mestá",OBI('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.5 3.5 3.5 14.5 0 18M12 3c-3.5 3.5-3.5 14.5 0 18"/>')]];
function obKey(){const k=vKey();return k==="dielne"||k==="trh"||k==="svet"?k:k.startsWith("trh:")?k.slice(4):null}
function obSvet(){try{const p=P();return(S.year>=1405||(p.title||0)>=2)&&(localStorage.getItem("p1400detail")||"jedn")!=="jedn"}catch(e){return false}}
const obN=t=>{const s=String(t||"").replace(/\s/g,"");const n=parseFloat(s.replace(/[^\d.,]/g,"").replace(",","."));return isNaN(n)?0:(/^[−-]/.test(s)?-n:n)};
function obData(k,sd){const p=P(),st=[],act=[];const sum=o=>Object.values(o||{}).reduce((a,b)=>a+(+b||0),0);
 if(k==="dielne"){const bs=myBall(p),w=bs.reduce((a,b)=>a+(b.w||0),0);let pr=null;/* odhad zisku dielní za štvrťrok rovnako ako na kartách dielní */bs.forEach(b=>{try{const v=b.type==="brloh"?lootEst(p,b):inCity(b.city,()=>estimate(p,b).profit);if(isFinite(v))pr=(pr||0)+v}catch(e){}});if(pr!=null)pr=Math.round(pr);
  st.push(["Dielne",`${bs.length} / ${maxB(p)}`],["Robotníci",fmt(w)],["Zisk",pr==null?"–":(pr>=0?"+":"−")+zl(Math.abs(pr)),pr==null?"":pr>=0?"good":"bad"],["Pokladnica",zl(p.money)]);
  const idle=bs.find(b=>!(b.w>0));let lot=null;try{lot=freeLot()}catch(e){}const canB=bs.length<maxB(p)&&!!lot;
  if(!bs.length)act.push({t:"Postaviť prvú dielňu",a:"dtab",v:"stavba",pri:1});
  else if(idle)act.push({t:`Najať robotníkov: ${bn(idle.type)}`,a:"dsel",b:idle.id,pri:1});
  else if(!S.auto)act.push({t:"Zapnúť správcu rodu",a:"autoT",pri:1,title:"Správca sa postará o robotníkov a suroviny"});
  if(bs.length&&canB)act.push({t:"Postaviť ďalšiu dielňu",a:"dtab",v:"stavba"})}
 else if(k==="trh"){const gs=Object.keys(GOODS);/* trend: cena teraz oproti minulému štvrťroku */const tr=g=>{const h=(S.hist||{})[g]||[];return h.length>1&&h[h.length-2]>0?h[h.length-1]/h[h.length-2]:1};const up=gs.filter(g=>tr(g)>=1.03).length,dn=gs.filter(g=>tr(g)<=.97).length;const prod=gs.filter(g=>!GOODS[g].raw).reduce((a,g)=>a+(p.wh[g]||0),0);
  st.push(["Pokladnica",zl(p.money)],["Na sklade",fmt(sum(p.wh))+" ks"],["Zdražuje",fmt(up)+" tovarov",up?"good":""],["Lacnie",fmt(dn)+" tovarov",dn?"bad":""]);
  if(prod>0&&typeof A.bulkSell==="function")act.push({t:`Predať výrobky (${fmt(prod)} ks)`,a:"bulkSell",pri:1,title:"Predá všetky výrobky zo skladu (kláves H)"});
  act.push({t:"Kde predám najdrahšie?",ob:"cen"})}
 else if(k==="kar"){const cv=(S.conv||[]);st.push(["Vozy",fmt(p.carts||0)],["Lode",fmt(((p.fleet||{}).s||[]).length)],["Na ceste",fmt(cv.length)+(cv.length===1?" výprava":" výprav")],["Práva",`${(p.lic||[]).length} ${(p.lic||[]).length===1?"mesto":"mestá"}`])}
 else if(k==="kraj"){let ti="";try{ti=TITLES[p.title||0].n}catch(e){}st.push(["Pokladnica",zl(p.money)],["Titul",ti||"–"],["Sláva",fmt(Math.round(prestige(p)))])}
 else if(k==="cen"){const gs=Object.keys(GOODS);const hi=gs.reduce((a,g)=>ratio(g)>ratio(a)?g:a,gs[0]),lo=gs.reduce((a,g)=>ratio(g)<ratio(a)?g:a,gs[0]);
  st.push(["Obchodné práva",`${(p.lic||[]).length} / ${(S.cities||[]).length}`],["Tu najdrahšie",`${GOODS[hi].n} ${Math.round(ratio(hi)*100)} %`,"good"],["Tu najlacnejšie",`${GOODS[lo].n} ${Math.round(ratio(lo)*100)} %`,"bad"])}
 else if(k==="svet"){st.push(["Obchodné práva",`${(p.lic||[]).length} / ${(S.cities||[]).length}`],["Na ceste",fmt((S.conv||[]).length)],["Pokladnica",zl(p.money)])}
 return{st,act}}
function obDecor(sd){const k=obKey();if(!k)return;sd.classList.add("obchod");sd.querySelectorAll(".dssub").forEach(e=>e.remove());
 const places=OBP.filter(x=>x[0]!=="svet"||obSvet()||k==="svet");const {st,act}=obData(k,sd);
 const h=`<nav class="obnav" aria-label="Miesta obchodu">${places.map(([v,n,ic])=>`<button type="button" data-ob="${v}" class="${v===k?"on":""}" aria-current="${v===k?"page":"false"}">${ic}<span>${n}</span></button>`).join("")}</nav>
<div class="obstats">${st.map(([l,v,c])=>`<div class="obstat" title="${E(l+": "+v)}"><span>${E(l)}</span><b class="${c||""}">${E(v)}</b></div>`).join("")}</div>
${act.length?`<div class="obact">${act.map(x=>`<button type="button" class="btn ${x.pri?"pri":""}"${x.ob?` data-ob="${x.ob}"`:` data-a="${x.a}"`}${x.v?` data-v="${x.v}"`:""}${x.b!=null?` data-b="${x.b}"`:""}${x.title?` title="${E(x.title)}"`:""}>${E(x.t)}</button>`).join("")}</div>`:""}`;
 const hd=sd.querySelector(".dshead");if(hd)hd.insertAdjacentHTML("afterend",h);else sd.insertAdjacentHTML("afterbegin",h)}
function obWrap(fn){return sd=>{fn(sd);try{obDecor(sd)}catch(e){console.warn("obchod",e)}}}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("#dside [data-ob]");if(!b)return;e.preventDefault();e.stopPropagation();const v=b.dataset.ob;
 try{if(v==="dielne"||v==="svet"){A.tab({v});return}S.ttab=v;if(S.view!=="trh")A.tab({v:"trh"});else render()}catch(x){console.warn("obchod",x)}},true);
{const st=document.createElement("style");st.textContent=`#dside .obnav{display:flex;gap:3px;margin:4px 0 10px;padding:4px;background:rgba(90,58,20,.09);border-radius:10px}
#dside .obnav button{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px 5px;border:1px solid transparent;border-radius:8px;background:transparent;color:#6a4a20;font:600 .76rem/1.1 Georgia,serif;cursor:pointer;white-space:nowrap}
#dside .obnav button svg{width:20px;height:20px}
#dside .obnav button:hover{background:rgba(255,250,235,.7);color:#3a2410}
#dside .obnav button.on{background:#fbf3dc;border-color:#b8862c;box-shadow:0 1px 4px rgba(60,30,0,.25);color:#3a2410}
#dside .obnav button:focus-visible{outline:2px solid #b8862c;outline-offset:1px}
#dside .obstats{display:grid;grid-template-columns:repeat(auto-fit,minmax(76px,1fr));gap:6px;margin:0 0 10px}
#dside .obstat{background:#fbf5e4;border:1px solid rgba(142,106,58,.35);border-radius:8px;padding:5px 8px;min-width:0}
#dside .obstat span{display:block;font-size:.64rem;color:#7a5a30;text-transform:uppercase;letter-spacing:.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#dside .obstat b{display:block;font-size:.98rem;color:#2a1a0a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#dside .obstat b.good{color:#2f6b2a}#dside .obstat b.bad{color:#8e1f1c}
#dside .obact{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px}#dside .obact .btn{flex:1 1 auto}`;document.head.appendChild(st)}
const VIEWS={men:{scene:"pracovna",label:"Ponuka",panel:menPanel,ok:()=>true,kill:null},"mesto:p":{panelOnly:1,label:"Prehľad mesta",panel:prPanel,ok:()=>true},pis:{scene:"pisaren",label:"Pisáreň kronikára",panel:pisPanel,ok:()=>true,kill:null},kronika:{scene:"pisaren",label:"Kronika",panel:pisPanel,ok:()=>true,kill:null},rod:{scene:"sien",label:"Rod",panel:rodPanel,ok:()=>true,kill:null},dielne:{scene:"ulica",label:"Dielne",panel:obWrap(dielnePanel),ok:()=>true,kill:"main .kssheet"},
 trh:{scene:"trhovisko",after:trhLegend,label:"Trh",panel:obWrap(trhPanel),ok:()=>(S.ttab||"trh")==="trh",kill:"main .mktsheet"},
 "trh:kar":{scene:"brana",label:"Karavány",panel:obWrap(karPanel),ok:()=>S.ttab==="kar",kill:null},
 "trh:kraj":{scene:"krajcir",label:"Krajčír",panel:obWrap(krajPanel),ok:()=>S.ttab==="kraj",kill:null},
 "trh:cen":{id:"trh:cen",html:pcHtml,after:pcAfter,label:"Porovnanie cien",panel:obWrap(pcPanel),ok:()=>S.ttab==="cen",kill:null},
 /* ďalšie sekcie: široké maľované scény ako zarámovaný obraz na dobovej maľbe, obsah stránky v paneli */
 radnica:{scene:"radnica",pano:"img/council.jpg",label:"Radnica",panel:genPanel("Radnica"),ok:()=>true},
 rody:{scene:"rody",pano:"img/banquet.jpg",label:"Rody mesta",panel:genPanel("Rody"),ok:()=>true},
 dvor:{scene:"dvor",pano:"img/court.jpg",label:"Kráľovský dvor",panel:genPanel("Dvor"),ok:()=>true},
 cirkev:{scene:"cirkev",pano:"img/conclave.jpg",label:"Cirkev",panel:genPanel("Cirkev"),ok:()=>true},
 kariera:{scene:"kariera",pano:"img/joust.jpg",label:"Kariéra",panel:genPanel("Kariéra"),ok:()=>true},
 majetok:{scene:"pracovna",bare:1,label:"Majetok",panel:genPanel("Majetok"),ok:()=>true},
 stat:{scene:"pisaren",bare:1,label:"Štatistika",panel:genPanel("Štatistika"),ok:()=>true},
 svet:{id:"svet",html:pcHtml,after:sc=>pcFit(sc),label:"Mestá Európy",panel:obWrap(genPanel("Mestá Európy")),ok:()=>true}};
/* panel so všetkým obsahom pôvodnej stránky okrem malej scény (tá je teraz cez celé okno) */
function genPanel(title){return sd=>{sd.classList.add("wide");sd.innerHTML=`<div class="dshead"><h2>${E(title)}</h2><span>${E(cityN(S.ci))}</span></div><div class="dsbody dsgen"></div>${footH("Pôvodné rozloženie celej stránky")}`;
 const body=sd.querySelector(".dsbody"),mn=q("main");if(!mn)return;[...mn.children].forEach(c=>{if(c.matches(".kssheet")||c.querySelector(".kscene")){c.remove();return}body.appendChild(c)});/* malá kópia scény v skrytej stránke by sa zbytočne animovala */
 if(!body.children.length)body.innerHTML=`<p class="dsempty">Táto časť sa nenašla.</p>`}}
/* zarámovaný obraz medzi lištou a panelom */
function panoFit(ks){const sc=ks.parentElement,Wv=innerWidth,Hv=innerHeight,sd=document.getElementById("dside");const pr=sd?sd.getBoundingClientRect().left:Wv;
 const def=KSCENE.REG[ks.dataset.ks]||{W:16,H:9},ar=def.W/def.H;const l=railR()+28,r=pr-28;let w=Math.max(200,r-l);const maxH=Hv-220;if(w/ar>maxH)w=maxH*ar;
 const top=Math.max(120,(Hv-w/ar)/2-20);sc.style.setProperty("--pl",Math.round(l+(r-l-w)/2)+"px");sc.style.setProperty("--pt",Math.round(top)+"px");sc.style.setProperty("--pw",Math.round(w)+"px");sc.style.setProperty("--ar",def.W+"/"+def.H);ks.style.transform=""}
{const st=document.createElement("style");st.textContent=`#dscene.pano{background:#140e09 var(--bg) center/cover no-repeat}
#dscene.pano::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 35% 45%,rgba(20,14,9,.5),rgba(10,7,4,.9));backdrop-filter:blur(4px) sepia(.3)}
#dscene.pano .kscene{left:var(--pl);top:var(--pt);width:var(--pw);height:auto;aspect-ratio:var(--ar)!important;transform:none!important;transition:none;border:3px solid #8a6a3a;border-radius:6px;box-shadow:0 0 0 2px #e9dcbc,0 0 0 5px #5a3a14,0 22px 60px rgba(0,0,0,.7)}
#dscene.pano .kscene canvas{width:100%;height:100%}
#dscene.bare .khot{display:none}
#dside .dsgen svg.chart,#dside .dsgen svg.europe{width:100%!important;height:auto!important;min-width:0!important}
#dside .dsgen .tw{overflow-x:auto!important;max-width:100%}#dside .dsgen :not(.tw)>table{display:block;overflow-x:auto;max-width:100%}`;document.head.appendChild(st)}
addEventListener("resize",()=>{try{cam()}catch(e){}});
const vKey=()=>S.view==="trh"&&["kar","kraj","cen"].includes(S.ttab)?"trh:"+S.ttab:S.view;
const curV=()=>{try{if(!hasS())return null;if(mopen)return VIEWS.men;if(jopen)return VIEWS.pis;if(popen&&S.view==="mesto")return VIEWS["mesto:p"];const v=VIEWS[vKey()];return v&&v.ok()?v:null}catch(e){return null}};
function layout(){
 let v=null;try{const bc=document.body.classList;v=pref()&&(bc.contains("hbs")||((jopen||popen||mopen)&&bc.contains("hb")))?curV():null}catch(e){}
 const b=document.body;b.classList.toggle("hbd",!!v&&!v.panelOnly);b.classList.toggle("hbj",!!v&&(jopen||mopen));b.classList.toggle("hbp",!!v&&!!v.panelOnly);const mark=()=>{try{const pb=q('#hb [data-hb="drawer"]'),on=popen&&b.classList.contains("hbp");if(pb){pb.classList.toggle("on",on);pb.setAttribute("aria-pressed",String(on))}}catch(e){}};mark();setTimeout(mark,60);setTimeout(mark,220);
 let sc=document.getElementById("dscene"),sd=document.getElementById("dside");
 if(!v){const pre0=!!q(".mainmenu,.newrod");if(sc&&!(pre0&&sc.querySelector('[data-ks="panorama"]')))sc.remove();if(sd&&!q(".newrod"))sd.remove();classicBtn();try{if(hasS()&&S.view==="rod"&&S.rodSec&&pref()&&b.classList.contains("hbs")){const bk=q('main .rodnav [data-a="rodSec"][data-v=""]');if(bk)bk.textContent="‹ Rodová sieň"}}catch(e){}return}
 const ks=v.kill&&q(v.kill);if(ks)ks.remove();
 if(v.panelOnly){if(sc){sc.remove();sc=null}}
 else if(v.html){if(!sc||sc.dataset.k!==v.id){const dir=slideDir(sc,v.id);if(sc){ghostOut(sc,dir);sc.remove()}sc=document.createElement("div");sc.id="dscene";sc.dataset.k=v.id;sc.innerHTML=v.html();b.prepend(sc);slideIn(sc,dir)}}
 else{let dir=0;if(sc&&!sc.querySelector(`[data-ks="${v.scene}"]`)){dir=slideDir(sc,v.scene);ghostOut(sc,dir);sc.remove();sc=null}
 if(!sc){sc=document.createElement("div");sc.id="dscene";sc.innerHTML=KSCENE.markup(v.scene);b.prepend(sc);KSCENE.mountAll();slideIn(sc,dir)}
 sc.classList.toggle("pano",!!v.pano);sc.classList.toggle("bare",!!v.bare);/* bare: scéna len ako pozadie, jej klikacie miesta patria inej sekcii */sc.style.setProperty("--bg",v.pano?`url("${v.pano}")`:"")}
 if(!sd){sd=document.createElement("aside");sd.id="dside";b.appendChild(sd)}
 const vk=(mopen?"men":jopen?"pis":v.panelOnly?"mesto:p":vKey())+"|"+(v.panelOnly?ptab2:jopen||S.view==="kronika"?jtab:S.view==="rod"?S.rodSec||"":vKey()==="trh:kraj"?kgrp:"");if(sd.dataset.v!==vk){sd.dataset.v=vk;sd.scrollTop=0}
 sd.setAttribute("aria-label",v.label);
 const st=sd.scrollTop;sd.classList.remove("wide");v.panel(sd);sd.scrollTop=st;
 if(v.after)try{v.after(sc)}catch(e){console.warn("scena",e)}
 cam();setTimeout(()=>{try{cam()}catch(e){}},420);
}
/* kamera siene: pri podsekcii priblíži a nasníma príslušný predmet do voľnej časti obrazovky */
let camT=0;
function cam(tries=0){clearTimeout(camT);const ks=q("#dscene .kscene");if(!ks)return;let f=focusOf();
 if(ks.parentElement&&ks.parentElement.classList.contains("pano")){panoFit(ks);return}
 if(!f){camFree(ks);return}
 const h=ks.querySelector(`.khot[data-v="${f}"]`);if(!h){if(tries<30)camT=setTimeout(()=>cam(tries+1),100);return}
 const Wv=innerWidth,Hv=innerHeight,Wc=Math.max(Wv,Hv*16/9),Hc=Wc*9/16;
 const L=parseFloat(h.style.left)/100,T=parseFloat(h.style.top)/100,Wd=parseFloat(h.style.width)/100,Ht=parseFloat(h.style.height)/100;
 const sd=document.getElementById("dside");const pl=sd?sd.getBoundingClientRect().left:Wv;const fl=railR()+8,fr=pl-8,tx=(fl+fr)/2,ty=Hv*.5;
 /* bod p na obrazovke sa po transformácii posunie na stred + d + Z·(p − stred); hľadá sa priblíženie, pri ktorom je predmet celý vo voľnej časti medzi lištou a panelom */
 const at=Z=>{const px=(Wv-Wc)/2+(L+Wd/2)*Wc,py=(Hv-Hc)/2+(T+Ht/2)*Hc;let dx=tx-Wv/2-Z*(px-Wv/2),dy=ty-Hv/2-Z*(py-Hv/2);const mx=Z*Wc/2-Wv/2,my=Z*Hc/2-Hv/2;
  dx=Math.max(-mx,Math.min(mx,dx));dy=Math.max(-my,Math.min(my,dy));
  const x1=Wv/2+dx+Z*((Wv-Wc)/2+L*Wc-Wv/2),x2=x1+Z*Wd*Wc,y1=Hv/2+dy+Z*((Hv-Hc)/2+T*Hc-Hv/2),y2=y1+Z*Ht*Hc;
  return{Z,dx,dy,over:Math.max(0,fl-x1)+Math.max(0,x2-fr)+Math.max(0,-y1)+Math.max(0,y2-Hv)}};
 let b=null;for(const Z of [1.5,1.4,1.3,1.2,1.1,1.6,1.7,1.8,1.9,2,2.2,2.4]){const r=at(Z);if(!b||r.over<b.over-1)b=r;if(r.over<1)break}
 ks.style.transform=`translate(-50%,-50%) translate(${b.dx.toFixed(0)}px,${b.dy.toFixed(0)}px) scale(${b.Z})`}
const railR=()=>{const r=q(".hbrail"),b=r&&r.getBoundingClientRect();return b&&b.width?b.right:0};
/* scéna bez zaostreného predmetu (Dielne, Trh, Karavány…): pri úzkom okne ju posunúť doprava, aby krajné klikacie miesta neboli pod lištou */
function camFree(ks){const Wv=innerWidth,Hv=innerHeight,Wc=Math.max(Wv,Hv*16/9),mx=Wc/2-Wv/2;let minL=1;
 ks.querySelectorAll(".khot").forEach(h=>{const l=parseFloat(h.style.left)/100;if(l<minL)minL=l});
 const dx=minL<1?Math.max(0,Math.min(mx,railR()+8-((Wv-Wc)/2+minL*Wc))):0;
 ks.style.transform=dx>.5?`translate(-50%,-50%) translate(${dx.toFixed(0)}px,0px)`:""}
/* v pôvodnom rozložení: tlačidlo späť na scénu cez celé okno */
function classicBtn(){try{if(!hasS()||pref()||!document.body.classList.contains("hbs"))return;const v=VIEWS[vKey()];if(!v||!v.ok())return;let j=q("main .jsub")||q("main .rodhead")||q("main .rodnav");if(!j){const mn=q("main");if(!mn)return;j=mn.querySelector(":scope > .dscrow");if(!j){mn.insertAdjacentHTML("afterbegin",`<div class="row dscrow" style="margin:0 0 10px"></div>`);j=mn.querySelector(":scope > .dscrow")}}if(j.querySelector(".dscbtn"))return;j.insertAdjacentHTML("beforeend",`<button class="chip dscbtn" data-a="dscena" title="Scéna cez celé okno a panel vpravo">${vKey()==="trh:cen"?"Mapa cien":vKey()==="trh:kraj"?"Krajčírska dielňa":vKey()==="trh:kar"?"Brána a karavány":S.view==="trh"?"Trhovisko":S.view==="rod"?"Rodová sieň":"Ulica"} cez celé okno</button>`)}catch(e){}}
function pre(){try{if(!hasS()||!pref()||!desk()||!hbPref()||!curV())return;
 if(S.view==="dielne"){pick();if(sel!=null&&tab==="dielna"){S.jOpen=S.jOpen||{};S.jOpen["b"+sel]=true}}
 else if(S.view==="trh"){tpick();S.tfold=S.tfold||{};S.tfold[tsel]=false}}catch(e){}}

Object.assign(A,{
 dsel:e=>{const id=+e.b,bb=S.bld.find(x=>x.id===id);sel=id;tab="dielna";if(bb&&bb.city!==S.ci&&A.city){A.city({c:bb.city});return}render()},
 dtab:e=>{tab=e.v;render()},
 dbuild:()=>{tab="stavba";render()},
 dinfo:e=>{try{toast(e.t,"")}catch(x){}},
 dtsel:e=>{tsel=e.n;ttabP="tovar";render()},
 dttab:e=>{ttabP=e.v;render()},
 mnact:e=>{const fn=A[e.v];if(typeof fn==="function")fn({})},
 mnclose:()=>{mopen=false;render()},
 dprtab:e=>{ptab2=e.v;render()},
 pclose:()=>{popen=false;render()},
 djtab:e=>{jtab=e.v;render()},
 djbtn:e=>{const t=q(`header.top [data-a="${e.v}"]`);if(t)t.click();else if(A[e.v])A[e.v]({})},
 jclose:()=>{jopen=false;render()},
 dpcc:e=>{pcity=+e.c;try{const L=pcRow()||[],x=L.find(z=>z.ci===pcity);if(x)toast(`${x.n}: ${(GOODS[pg]||{}).n} ${fmt(x.p)} zl.`,"")}catch(z){}render()},
 dptab:e=>{ptab=e.v;render()},
 dcg:e=>{kgrp=e.v;render()},
 dktab:e=>{ktab=e.v;render()},
 dradn:()=>{const v0=S.view;try{if(q('header.top .tabs [data-v="radnica"]'))A.tab({v:"radnica"})}catch(x){}if(S.view!=="radnica"){if(S.view!==v0){S.view=v0;render()}try{toast("Radnica – mestská rada, úrady a voľby. Táto časť sa ti v hre ešte neotvorila.","")}catch(x){}}},
 dclassic:()=>{setPref(false);render()},
 dscena:()=>{setPref(true);render()}
});
document.addEventListener("change",e=>{const s=e.target;if(s&&s.matches&&s.matches('#dside select[data-dt="cat"]')){tsel=s.value;ttabP="tovar";render()}else if(s&&s.matches&&s.matches('#dside select[data-dt="pg"]')){pg=s.value;render()}});
{const o=window.render;window.render=function(){pre();const r=o.apply(this,arguments);try{layout()}catch(e){console.warn("scena",e)}try{mmLayout()}catch(e){console.warn("panorama",e)}try{nrLayout()}catch(e){console.warn("zalozenie",e)}try{sidloFullFix()}catch(e){}return r}}
{let rt=0;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{try{if(hasS()&&VIEWS[S.view])render()}catch(e){}},200)})}

const css=document.createElement("style");css.id="dscena-css";css.textContent=`
body.hbd{background:#1a120a!important}
body.hbd .wrap.pad,body.hbd .wrap.pad *{visibility:hidden!important;pointer-events:none!important}
#dscene{position:fixed;inset:0;z-index:0;overflow:hidden;background:#1a120a}
#dscene .kscene{position:absolute;left:50%;top:50%;width:max(100vw,177.78vh);height:max(56.25vw,100vh);transform:translate(-50%,-50%);margin:0;border:0;border-radius:0;box-shadow:none;aspect-ratio:auto!important}
#dscene .khot:hover,#dscene .khot:focus-visible{border-color:rgba(246,226,122,.95);box-shadow:0 0 18px rgba(246,226,122,.55)}
#dside{position:fixed;right:16px;top:92px;bottom:92px;width:min(430px,36vw);z-index:19;overflow:auto;overscroll-behavior:contain;box-sizing:border-box;padding:14px 14px 12px;font-family:"EB Garamond",Georgia,serif;color:#2a2016;background:linear-gradient(135deg,#fbf3d9,#e4cf9a);border:2px solid #b5892a;border-radius:4px;box-shadow:inset 0 0 0 4px rgba(142,31,28,.5),inset 0 0 26px rgba(120,80,20,.35),0 8px 22px rgba(0,0,0,.6);scrollbar-width:thin}
#dside .dshead{display:flex;align-items:baseline;justify-content:space-between;gap:8px;border-bottom:1px solid rgba(142,31,28,.45);padding-bottom:6px;margin-bottom:8px}
#dside .dshead h2{margin:0;font:400 1.45rem "Almendra SC","EB Garamond",serif;color:#8e1f1c}
#dside .dshead h2::first-letter{background:#27408b;color:#fff3c4;border:1px solid #d9ab3e;padding:0 5px;margin-right:2px}
#dside .dshead span{font-size:.95rem;color:#5a4526}
#dside .dssub .jsub{margin:0 0 10px;gap:6px}
#dside .dsroster{display:flex;flex-direction:column;gap:6px;margin-bottom:10px}
#dside .dsrow{display:flex;align-items:center;gap:10px;width:100%;text-align:left;font:inherit;color:inherit;background:rgba(255,255,255,.35);border:1px solid #9a7b3c;border-radius:3px;padding:6px 10px;cursor:pointer;min-height:48px;box-shadow:inset 0 0 0 2px rgba(201,162,74,.35)}
#dside .dsrow:hover{background:rgba(255,246,200,.75)}
#dside .dsrow.on{background:linear-gradient(160deg,#f6e2a0,#e2bf62);border-color:#5e4410;box-shadow:inset 0 0 0 2px rgba(255,246,200,.6),0 0 0 2px rgba(142,31,28,.5)}
#dside .dsdot{width:14px;height:14px;border-radius:3px;border:1.5px solid #e3be4f;flex:none;box-shadow:0 1px 2px #0006}
#dside .dsn{display:flex;flex-direction:column;flex:1;min-width:0;line-height:1.15}
#dside .dsn b{font:400 1.05rem "Almendra SC","EB Garamond",serif}
#dside .dsn small{font-size:.85rem;color:#5a4526;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#dside .dspr{font-weight:700;font-size:1.05rem;white-space:nowrap}
#dside .dspr.good{color:#2f6b2a}#dside .dspr.bad{color:#8e1f1c}
#dside .dstabs{display:flex;gap:4px;border-bottom:2px solid #b5892a;margin:4px 0 10px}
#dside .dstabs button{font:400 1rem "Almendra SC","EB Garamond",serif;color:#2a2016;background:rgba(255,255,255,.3);border:1px solid #9a7b3c;border-bottom:0;border-radius:4px 4px 0 0;padding:6px 12px;cursor:pointer;min-height:40px}
#dside .dstabs button:hover{background:rgba(255,246,200,.75)}
#dside .dstabs button.on{background:linear-gradient(#f1d27a,#c99a34);color:#8e1f1c;border-color:#5e4410}
#dside .dsbody>.sheet,#dside .dsbody>.row{margin:0 0 10px!important}
#dside .dsbody .jtg{display:none!important}
#dside .dsbody .bcard>svg{display:block;width:100%;max-height:200px}
#dside .dsfoot{display:flex;justify-content:flex-end;margin-top:6px}
#dside .dsempty{font-style:italic;color:#5a4526;margin:4px 0 10px}
#dside .dtcat{display:flex;align-items:center;gap:8px;margin:0 0 8px}
#dside .dtcat span{font:400 .95rem "Almendra SC","EB Garamond",serif;color:#5a4526}
#dside .dtcat select{flex:1;font:inherit;font-size:1rem;padding:6px 8px;min-height:40px;background:rgba(255,255,255,.5);border:1px solid #9a7b3c;border-radius:3px;color:#2a2016}
#dside .dssub .ktabs{margin:0 0 10px;gap:6px;flex-wrap:wrap}
#dside .dstrend{margin:0 0 10px;font-size:.98rem;line-height:1.3}
#dside .dstrend .good{color:#2f6b2a}#dside .dstrend .bad{color:#8e1f1c}
#dside .dsown{color:#8a6a10;font-weight:600}
#dside table.dstov tbody{grid-template-columns:1fr!important}
#dside .bulkbar2{margin:10px 0 0!important}
#dside .dsrod>.sheet{margin:0 0 10px!important}
#dside .dkchips{display:flex;flex-wrap:wrap;gap:5px;margin:0 0 10px}#dside .dkchips .chip.on{background:linear-gradient(#f1d27a,#c99a34);color:#8e1f1c;border-color:#5e4410}
#dside .kjwrap .wardrobe{display:grid!important;grid-template-columns:190px minmax(0,1fr);gap:14px;align-items:start}
#dside .kjwrap .wprev{position:sticky;top:0;height:auto!important;align-self:start}
#dside .kjwrap.items .wprev>svg,#dside .kjwrap.items .wprev>p{display:none}
#dside .kjwrap.fig .wardrobe{grid-template-columns:1fr}#dside .kjwrap.fig .wslots{display:none!important}#dside .kjwrap.fig .wprev{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;align-items:flex-start}
#dside .kjwrap #trybox svg,#dside .kjwrap .wprev svg{max-width:100%;height:auto}
#dside .kjwrap.salon svg{max-width:100%;height:auto}
#dscene .dmapdesk{position:absolute;inset:0;background:radial-gradient(ellipse at 40% 45%,#5a3c22 0,#2a1a0e 70%,#120a05 100%)}
#dscene .dmap{position:absolute;box-shadow:0 18px 44px rgba(0,0,0,.75),0 0 0 6px #4a2e14,0 0 0 8px #b5892a;transition:left .4s ease,top .4s ease,width .4s ease,height .4s ease}
#dscene .dmapbg,#dscene .dmapo{position:absolute;inset:0;width:100%;height:100%}
#dscene .dmapbg svg{display:block;width:100%!important;height:100%!important;max-width:none!important;margin:0!important}
#dscene .dmapo .dpcs:hover circle{stroke:#8e1f1c}
#dside .dpcbest{margin:0 0 10px!important;line-height:1.35}#dside .dpcbest .good{color:#2f6b2a}
#dside .dpclist{display:flex;flex-direction:column;gap:4px}
#dside .dpcrow{display:grid;grid-template-columns:minmax(0,1fr) 90px 54px;align-items:center;gap:8px;width:100%;text-align:left;font:inherit;color:inherit;background:rgba(255,255,255,.35);border:1px solid #9a7b3c;border-radius:3px;padding:5px 10px;cursor:pointer;min-height:40px}
#dside .dpcrow:hover{background:rgba(255,246,200,.75)}#dside .dpcrow.on{background:#f6e2a0;border-color:#8e1f1c}
#dside .dpcn em{font-style:normal;font-size:.72rem;background:#8e1f1c;color:#fff;border-radius:3px;padding:0 4px;margin-left:4px}#dside .dpcn i{font-style:normal;font-size:.7rem;color:#27408b;border:1px solid #27408b;border-radius:3px;padding:0 3px;margin-left:4px}
#dside .dpcbar{height:8px;background:rgba(0,0,0,.08);border-radius:4px;overflow:hidden}#dside .dpcbar i{display:block;height:100%}
#dside .dpcrow b{text-align:right;font-size:1.05rem}
#dside details.pcmp .tw{overflow:auto!important;max-width:100%}
#dside .dmn{display:flex;flex-direction:column;gap:7px}#dside .dmn2{display:grid;grid-template-columns:1fr 1fr;gap:7px}
#dside .dmnb{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:1px;width:100%;min-height:48px;text-align:left;font:inherit;color:#2a2016;background:rgba(255,255,255,.4);border:1px solid #9a7b3c;border-radius:3px;padding:6px 14px;cursor:pointer;box-shadow:inset 0 0 0 2px rgba(201,162,74,.35)}
#dside .dmnb:hover{background:rgba(255,246,200,.85)}#dside .dmnb b{font:400 1.08rem "Almendra SC","EB Garamond",serif;color:#8e1f1c}#dside .dmnb small{font-size:.85rem;color:#5a4526}
#dside .dmnb.quit{background:rgba(184,54,44,.12);border-color:#8e1f1c}
#mbody .settabs{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin:4px 0 14px}#mbody .settabs button{font:400 1rem "Almendra SC","EB Garamond",serif;color:#2a2016;background:rgba(255,255,255,.4);border:1px solid #9a7b3c;border-radius:4px;padding:6px 14px;min-height:40px;cursor:pointer}#mbody .settabs button:hover{background:rgba(255,246,200,.85)}#mbody .settabs button.on{background:linear-gradient(#f1d27a,#c99a34);color:#8e1f1c;border-color:#5e4410}
#mbody.settabbed .setg{margin-top:0!important}
body.mmsc .mainmenu{background:transparent!important;justify-content:flex-start;align-items:stretch}
body.mmsc .mainmenu .mm-bg,body.mmsc .mainmenu .mm-veil{display:none!important}
body.mmsc .mm-in{margin:24px 0 24px 28px;width:min(440px,38vw);max-width:none;justify-content:center;padding:26px 26px 18px;background:linear-gradient(180deg,rgba(18,11,6,.86),rgba(12,8,4,.9));border:2px solid #b5892a;border-radius:6px;box-shadow:inset 0 0 0 4px rgba(94,68,16,.7),0 14px 40px rgba(0,0,0,.65);backdrop-filter:blur(2px)}
body.mmsc .mm-title{font-size:clamp(2.4rem,4.4vw,3.6rem)}
body.mmsc .mm-btn{min-width:0}
body.mmsc #dscene{z-index:1}body.mmsc .mainmenu{z-index:5}
@media (max-height:700px){body.mmsc .mm-crest{display:none}body.mmsc .mm-in{padding:14px 20px}}
html:has(body.nrsc),body.nrsc{overflow:hidden!important}
body.sfull #dside{z-index:7000;transition:none;overflow:visible}body.sfull .wrap.pad{z-index:7000!important}
body.nrsc .newrod,body.nrsc .newrod *{visibility:hidden!important;pointer-events:none!important}
body.nrsc #dscene{z-index:1}
#nreasel{position:fixed;left:3vw;top:6vh;bottom:4vh;width:min(36vw,440px);z-index:3;pointer-events:none}
#nreasel .nrlegs{position:absolute;left:0;right:0;bottom:0;width:100%;height:62%}
#nreasel .nrcanvas{position:absolute;left:7%;right:7%;top:0;pointer-events:auto;background:linear-gradient(135deg,#fbf3d9,#e4cf9a);border:12px solid #6a4424;outline:3px solid #c9a03a;box-shadow:0 18px 44px rgba(0,0,0,.65);padding:10px 12px}
#nreasel aside.np{position:static!important;width:auto!important;max-width:none!important;margin:0!important;top:auto!important;box-shadow:none!important;background:none!important;border:0!important}
#nreasel .np-in{padding:0!important;background:none!important;border:0!important;box-shadow:none!important}
#nreasel .np-fig{display:flex;align-items:center;justify-content:center;gap:12px}
#nreasel .np-por svg{width:min(17vw,200px)!important;height:auto!important}#nreasel .np-arms svg{width:min(10vw,120px)!important;height:auto!important}
#nreasel h3{font-size:1.7rem!important;text-align:center}
#dside.nr{top:24px;bottom:auto;max-height:calc(100vh - 48px);width:min(620px,50vw)}
#dside.nr .nrbody>.sheet{margin:0!important;box-shadow:none}
#dside.nr .nrfoot{position:sticky;bottom:-12px;display:flex;justify-content:space-between;align-items:center;gap:10px;margin:10px -14px -12px;padding:12px 14px;background:linear-gradient(180deg,rgba(239,224,180,.0),#ead7a4 35%);border-top:1px solid #b5892a}
#dside.nr .dstabs{flex-wrap:wrap}
@media (max-height:700px){#nreasel .np-por svg{width:min(13vw,150px)!important}#nreasel h3{font-size:1.3rem!important}}
body.hbp #ktip,body.hbp #tokstrip,body.hbp #hb .hbsteps{display:none!important}
#dside .dsbtns2{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 8px}#dside .dsbtns2 .muted{margin-left:auto;font-size:.9rem}
#dside .dspr>*{margin:0 0 10px!important}
#dside{overflow-x:hidden}
#dside .dstabs{flex-wrap:wrap}#dside .dstabs button{padding:6px 10px}
#dside .adv li{white-space:normal!important;flex-wrap:wrap}#dside .dspr p{white-space:normal!important}#dside .adv li>span{white-space:normal!important;min-width:0;flex:1 1 180px}#dside .dspr svg{max-width:100%;height:auto}
body.hbj #advp,body.hbj #ktip,body.hbj #tokstrip,body.hbj #hb .hbadv,body.hbj #hb .hbsteps,body.hbj #hb .hbpills{display:none!important}
#dside .dsrow2{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:6px 10px;border-bottom:2px solid #b5892a;margin:0 0 10px}#dside .dsrow2 .dstabs{border:0;margin:0}#dside .dsbtns{display:flex;gap:6px;margin-bottom:6px}
#dside .dspis>.sheet{margin:0 0 10px!important}#dside .dspis .jlist{margin:0;padding:0;list-style:none}#dside .dspis .jlist li{display:grid;grid-template-columns:minmax(0,1fr) 110px 46px;gap:10px;align-items:center;padding:6px 0;border-top:1px solid rgba(142,31,28,.18)}#dside .dspis .meter{height:8px;background:rgba(120,80,20,.2);border-radius:4px;overflow:hidden}#dside .dspis .meter i{display:block;height:100%;background:linear-gradient(#d4453a,#8e1f1c)}
#dside .dsconv ul{margin:6px 0 0;padding-left:18px}#dside .dsconv li{margin:3px 0;font-size:.95rem}
#dside{transition:none}
#dside.wide{width:min(820px,62vw)}
#dside .rodsec{margin:0}
#dside .rodsec>*{margin:0 0 10px!important}
#dside .rodnav{flex-wrap:wrap;gap:6px}
#dside .rodsec svg{max-width:100%;height:auto}
#dscene .kscene{transition:transform .8s cubic-bezier(.2,.7,.2,1)}
@media (max-width:1100px),(max-height:640px){#dside.wide{width:min(560px,55vw)}}
#dside .rodhead{text-align:left!important;padding-top:10px!important}
#dside .rodhead .row{justify-content:flex-start!important;gap:12px!important}
#dside .rodhead .row>svg{width:64px!important;height:auto!important}
#dside .rodhead .row>div{font-size:1em!important}
#dside .rodhead .row>div>*:first-child{font-size:1.5rem!important}
@media (max-width:1100px),(max-height:640px){#dside{top:74px;bottom:72px;width:min(380px,42vw);padding:10px}}
`;document.head.appendChild(css);
/* ---------- sprievodca v scénach: ďalší krok z „Prvé kroky rodu“ sa rozsvieti priamo v scéne alebo na lište ---------- */
function guideNow(){try{if(!hasS()||S.guideOff||S.year>=(S.startY||1400)+4)return null;const p=P(),bs=myBall(p);
 if(!bs.length)return{scene:"ulica",tab:["Obchod","Dielne"],hot:h=>h.dataset.a==="dbuild",tip:"Tu postav prvú dielňu"};
 if(!bs.some(b=>b.w>0))return{scene:"ulica",tab:["Obchod","Dielne"],hot:h=>h.dataset.a==="dsel"&&h.dataset.b===String(bs[0].id),tip:"Najmi do dielne robotníkov"};
 if(S.auto&&(p.title||0)<1)return{scene:"sien",tab:["Rod"],hot:h=>h.dataset.a==="rodSec"&&h.dataset.v==="postup",tip:"Tu si kúpiš titul Mešťan"};
 return null}catch(e){return null}}
function guideMark(){document.querySelectorAll(".kguide").forEach(e=>e.classList.remove("kguide"));if(!pref()||!hbPref())return;const g=guideNow();if(!g)return;
 const sc=window.DIELNESCENA&&DIELNESCENA.scene;
 if(sc===g.scene){const h=[...document.querySelectorAll("#dscene .khot")].find(g.hot);if(h){h.classList.add("kguide");h.dataset.tip=g.tip}return}
 const rb=[...document.querySelectorAll("#hb .hbr")].find(b=>g.tab.includes((b.querySelector("span")||b).textContent.trim()));if(rb){rb.classList.add("kguide");rb.title=g.tip}}
{const o=window.render;window.render=function(){const r=o.apply(this,arguments);setTimeout(()=>{try{guideMark()}catch(e){}},80);setTimeout(()=>{try{guideMark()}catch(e){}},600);return r}}
{const st=document.createElement("style");st.textContent=`.khot.kguide{border-color:#f2c14e!important;box-shadow:0 0 0 3px rgba(242,193,78,.55),0 0 22px rgba(242,193,78,.85);animation:kgp 1.6s ease-in-out infinite}
.khot.kguide::after{content:attr(data-tip);position:absolute;left:50%;bottom:calc(100% + 10px);transform:translateX(-50%);white-space:nowrap;background:#f6ecd0;color:#3a2410;border:2px solid #b8862c;border-radius:8px;padding:5px 12px;font:600 .95rem/1.2 Georgia,serif;box-shadow:0 4px 12px rgba(0,0,0,.45);pointer-events:none}
.hbr.kguide{box-shadow:0 0 0 3px #f2c14e,0 0 18px rgba(242,193,78,.85)!important;animation:kgp 1.6s ease-in-out infinite}
@keyframes kgp{50%{box-shadow:0 0 0 6px rgba(242,193,78,.2),0 0 32px rgba(242,193,78,.5)}}
@media (prefers-reduced-motion:reduce){.khot.kguide,.hbr.kguide{animation:none}}`;document.head.appendChild(st)}
/* ---------- príprava scén vopred: stavba scény trvá 0,3–0,7 s, preto sa robí, kým hráč nič nerobí, alebo keď myš zastane nad tlačidlom sekcie ---------- */
/* len pomalé scény; Sieň, Pisáreň, Pracovňa a Krajčír sa postavia do 25 ms (Sieň navyše číta údaje z otvorenej sekcie Rod) */
const PRE_ORDER=["ulica","trhovisko","brana"];
const preOn=()=>{try{return hasS()&&pref()&&hbPref()&&!!KSCENE.prebuild}catch(e){return false}};
let preT=0,preRun=false;
function preIdle(){clearTimeout(preT);preT=setTimeout(()=>{if(preRun||!preOn())return;preRun=true;const t0=performance.now();
 const ric=window.requestIdleCallback||(f=>setTimeout(()=>f({timeRemaining:()=>50}),200));
 const next=()=>ric(dl=>{const id=preOn()&&PRE_ORDER.find(i=>!KSCENE.fresh(i));if(!id){preRun=false;return}
  /* stavať, keď je prehliadač voľný (žiadna animácia); ak nie je voľný ani po 15 s, postaviť aj tak */
  if(dl.timeRemaining()>=40||performance.now()-t0>15000)KSCENE.prebuild(id);next()},{timeout:1000});next()},2500)}
const PRE_MAP=[[/dieln/i,"ulica"],[/karav/i,"brana"],[/^\s*(trh|obchod)/i,"trhovisko"]];
let hovT=0;
document.addEventListener("pointerover",e=>{const b=e.target.closest&&e.target.closest("#hb button,header.top button,nav button,#dside .dstabs button");if(!b)return;clearTimeout(hovT);
 hovT=setTimeout(()=>{if(!preOn()||!b.matches(":hover"))return;const t=(b.textContent||"")+" "+(b.title||"");const m=PRE_MAP.find(x=>x[0].test(t));if(m&&!KSCENE.fresh(m[1]))KSCENE.prebuild(m[1])},120)},true);
{const o=window.render;window.render=function(){const r=o.apply(this,arguments);try{preIdle()}catch(e){}return r}}
window.DIELNESCENA={layout,get sel(){return sel},
 /* pre zvuky: ktorá scéna je práve cez celé okno (null = žiadna) a aké dielne sú na ulici */
 get scene(){try{const b=document.body.classList;if(b.contains("mmsc")||b.contains("nrsc"))return"panorama";if(!b.contains("hbd"))return null;const v=curV();return v?(v.scene||(v.html?"mapa":null)):null}catch(e){return null}},
 get street(){try{return S.bld.filter(x=>x.owner===P().id&&x.city===S.ci).map(x=>({id:x.id,type:x.type}))}catch(e){return[]}}};
})();


