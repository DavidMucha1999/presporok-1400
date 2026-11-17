/* ==== js/okolie.js ==== */
/* Okolie mesta v izometrickom maľovanom štýle (v12) – plátno + SVG vrstva s aktívnymi miestami */
(function(){
"use strict";
const W=1200,H=600;
const prevSVG=window.okolieSVG;
let CACHE={key:"",url:"",pos:null};
function rng(seed){let a=(seed>>>0)||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const h2r=h=>{h=h.replace("#","");if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};
const cl=v=>v<0?0:v>255?255:v;
let G,ST,PAL=null,AS=null;
const TINT=[[1.04,.97,.9],[1,1,1],[1.14,.92,.74],[.46,.54,.86]];
function lit(hex,f){f=f==null?1:f;if(PAL){const m=PAL[hex];if(m)hex=m}const c=h2r(hex),t=ST.tint;return`rgb(${cl(c[0]*f*t[0])|0},${cl(c[1]*f*t[1])|0},${cl(c[2]*f*t[2])|0})`}
const FT=1,FL=.8,FR=.6;
const poly=(pts,fill,stroke,lw)=>{G.beginPath();pts.forEach((p,i)=>i?G.lineTo(p[0],p[1]):G.moveTo(p[0],p[1]));G.closePath();if(fill){G.fillStyle=fill;G.fill()}if(stroke){G.strokeStyle=stroke;G.lineWidth=lw||.7;G.lineJoin="round";G.stroke()}};
const INK="rgba(30,20,10,.55)";
const cor=(cx,cy,a,b,i,j,z)=>[cx+(a*(i-.5)-b*(j-.5))*.5,cy+(a*(i-.5)+b*(j-.5))*.25-(z||0)];
const DCsafe=()=>{try{return DC(0)}catch(e){return"#b8362c"}};
function shadow(cx,cy,a,b,h){const o=h*.55;G.save();G.globalAlpha=ST.night?.28:.2;poly([cor(cx,cy,a,b,0,0,0),cor(cx,cy,a,b,1,0,0),cor(cx,cy,a,b,1,1,0),cor(cx,cy,a,b,0,1,0)].map(p=>[p[0]+o,p[1]+o*.38]),"#10161a");G.restore()}
const SHUT=["#4a6a3a","#7a3a2a","#2a4a6a","#6a5a3a","#5a3a2a"];
const lp=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];
function win(c,a,b,h,R,hasDoor){const n=Math.max(1,Math.floor(a/13)),m=Math.max(1,Math.floor(b/13)),glow=ST.night;
 const rows=h>20?[[.55,.8],[.2,.44]]:[[.42,.74]];const useSh=R()<.55,sh=SHUT[(R()*SHUT.length)|0];
 const doorU=hasDoor?(n%2===0?.5:.2):null;
 const one=(i0,j0,i1,j1,f,z0,z1)=>{const q=(i,j,z)=>c(i,j,z);const DI=i1!==i0?.05:0,DJ=j1!==j0?.05:0;
  if(useSh){poly([q(i0-DI,j0-DJ,z0),q(i0,j0,z0),q(i0,j0,z1),q(i0-DI,j0-DJ,z1)],lit(sh,f),"rgba(0,0,0,.45)",.3);poly([q(i1,j1,z0),q(i1+DI,j1+DJ,z0),q(i1+DI,j1+DJ,z1),q(i1,j1,z1)],lit(sh,f),"rgba(0,0,0,.45)",.3)}
  const P4=[q(i0,j0,z0),q(i1,j1,z0),q(i1,j1,z1),q(i0,j0,z1)];
  poly(P4,glow?"#ffcf6a":lit("#2b3140",f),lit("#efe6d0",f*.9),.8);
  if(AS&&AS.arch&&z1-z0>4){const tl=P4[3],tr=P4[2],mx=(tl[0]+tr[0])/2,my=(tl[1]+tr[1])/2,w=Math.hypot(tr[0]-tl[0],tr[1]-tl[1]);G.beginPath();G.moveTo(tl[0],tl[1]);G.quadraticCurveTo(mx,my-w*.95,tr[0],tr[1]);G.closePath();G.fillStyle=glow?"#ffcf6a":lit("#2b3140",f);G.fill();G.strokeStyle=lit("#efe6d0",f*.9);G.lineWidth=.6;G.stroke()}
  const mA=lp(P4[0],P4[1],.5),mB=lp(P4[3],P4[2],.5),mC=lp(P4[0],P4[3],.5),mD=lp(P4[1],P4[2],.5);G.strokeStyle=glow?"rgba(120,70,10,.7)":lit("#efe6d0",f*.8);G.lineWidth=.45;G.beginPath();G.moveTo(mA[0],mA[1]);G.lineTo(mB[0],mB[1]);G.moveTo(mC[0],mC[1]);G.lineTo(mD[0],mD[1]);G.stroke();
  if(!glow){G.fillStyle="rgba(190,210,235,.22)";G.beginPath();G.moveTo(P4[3][0],P4[3][1]);G.lineTo(lp(P4[3],P4[2],.5)[0],lp(P4[3],P4[2],.5)[1]);G.lineTo(lp(P4[0],P4[1],.5)[0],lp(P4[0],P4[1],.5)[1]);G.lineTo(P4[0][0],P4[0][1]);G.fill()}
  poly([q(i0-DI*.5,j0-DJ*.5,z0-1.6),q(i1+DI*.5,j1+DJ*.5,z0-1.6),q(i1+DI*.5,j1+DJ*.5,z0),q(i0-DI*.5,j0-DJ*.5,z0)],lit("#d8cfb8",f),"rgba(0,0,0,.35)",.3);
  if(glow){G.save();G.globalAlpha=.22;G.fillStyle="#ffb84a";const m2=c((i0+i1)/2,(j0+j1)/2,(z0+z1)/2);G.beginPath();G.arc(m2[0],m2[1],5,0,7);G.fill();G.restore()}};
 const wI=Math.min(.09,4.2/a),wJ=Math.min(.09,4.2/b);
 rows.forEach((rw,ri)=>{const z0=h*rw[0],z1=h*rw[1],ground=ri===rows.length-1;
  for(let k=0;k<n;k++){const u=(k+.5)/n;if(ground&&doorU!=null&&Math.abs(u-doorU)<.15)continue;one(u-wI,1,u+wI,1,FL,z0,z1)}
  for(let k=0;k<m;k++){const u=(k+.5)/m;one(1,u-wJ,1,u+wJ,FR,z0,z1)}});
 if(doorU!=null){const w=Math.min(.1,3.4/a),z1=Math.min(h*.5,11);
  poly([c(doorU-w-.015,1,0),c(doorU+w+.015,1,0),c(doorU+w+.015,1,z1+1.4),c(doorU-w-.015,1,z1+1.4)],lit("#d8cfb8",FL),"rgba(0,0,0,.4)",.4);
  poly([c(doorU-w,1,0),c(doorU+w,1,0),c(doorU+w,1,z1),c(doorU-w,1,z1)],lit("#4a3220",FL*.9),"rgba(0,0,0,.55)",.4);
  poly([c(doorU-w-.04,1,-1.2),c(doorU+w+.04,1,-1.2),c(doorU+w+.04,1,0),c(doorU-w-.04,1,0)],lit("#bfb6a0",FL),"rgba(0,0,0,.3)",.3);
  const kb=c(doorU+w*.55,1,z1*.45);G.fillStyle="#d6aa4c";G.fillRect(kb[0]-.5,kb[1]-.5,1,1)}}
function box(cx,cy,a,b,h,col,o){o=o||{};const c=(i,j,z)=>cor(cx,cy,a,b,i,j,z);
 const R=rng(((Math.abs(cx*131+cy*977)|0)%2147483)+7);
 if(!o.noShadow)shadow(cx,cy,a,b,h);
 const tex=o.tex||(o.stone?"stone":o.beams?"timber":"plaster");
 poly([c(0,1,0),c(1,1,0),c(1,1,h),c(0,1,h)],lit(col,FL),INK,.6);
 poly([c(1,1,0),c(1,0,0),c(1,0,h),c(1,1,h)],lit(col,FR),INK,.6);
 const pl=Math.min(3.2,h*.2);
 poly([c(0,1,0),c(1,1,0),c(1,1,pl),c(0,1,pl)],"rgba(50,35,20,.2)");poly([c(1,1,0),c(1,0,0),c(1,0,pl),c(1,1,pl)],"rgba(50,35,20,.26)");
 G.save();
 const ln=(p,q)=>{G.moveTo(p[0],p[1]);G.lineTo(q[0],q[1])};
 if(tex==="stone"||tex==="brick"){const st=tex==="brick"?3:5,al=tex==="brick"?.2:.26;G.globalAlpha=al;G.strokeStyle="#000";G.lineWidth=.4;G.beginPath();
  let ci=0;for(let z=st;z<h;z+=st,ci++){ln(c(0,1,z),c(1,1,z));ln(c(1,1,z),c(1,0,z))}
  ci=0;const nb=Math.max(2,Math.floor(a/(tex==="brick"?4.5:8))),nb2=Math.max(2,Math.floor(b/(tex==="brick"?4.5:8)));
  for(let z=0;z<h-1;z+=st,ci++){const off=ci%2?.5:0;for(let k=0;k<nb;k++){const u=(k+off)/nb;if(u>0&&u<1)ln(c(u,1,z),c(u,1,Math.min(h,z+st)))}for(let k=0;k<nb2;k++){const u=(k+off)/nb2;if(u>0&&u<1)ln(c(1,u,z),c(1,u,Math.min(h,z+st)))}}
  G.stroke()}
 else if(tex==="log"){G.strokeStyle="rgba(30,15,5,.42)";G.lineWidth=.7;G.beginPath();for(let z=3.2;z<h;z+=3.2){ln(c(0,1,z),c(1,1,z));ln(c(1,1,z),c(1,0,z))}G.stroke();G.fillStyle="rgba(210,170,110,.55)";for(let z=1.6;z<h;z+=3.2){const p=c(1,1,z);G.beginPath();G.arc(p[0],p[1],1.15,0,7);G.fill()}}
 else if(tex==="timber"){G.strokeStyle=lit("#4a3220",FL);G.lineWidth=.85;G.beginPath();const nv=Math.max(2,Math.round(a/Math.max(7,a/3))),nw=Math.max(2,Math.round(b/Math.max(7,b/3)));
  for(let k=0;k<=nv;k++){const u=k/nv;ln(c(u,1,0),c(u,1,h))}for(let k=0;k<=nw;k++){const u=k/nw;ln(c(1,u,0),c(1,u,h))}
  if(h>13){ln(c(0,1,h*.5),c(1,1,h*.5));ln(c(1,1,h*.5),c(1,0,h*.5));for(let k=0;k<nv;k++){const u0=k/nv,u1=(k+1)/nv;k%2?ln(c(u0,1,h*.5),c(u1,1,h)):ln(c(u1,1,h*.5),c(u0,1,h))}for(let k=0;k<nw;k++){const u0=k/nw,u1=(k+1)/nw;k%2?ln(c(1,u0,h*.5),c(1,u1,h)):ln(c(1,u1,h*.5),c(1,u0,h))}}
  G.stroke()}
 else{const nS=Math.min(45,Math.floor((a+b)*h/80));for(let k=0;k<nS;k++){const left=R()<.55,p=left?c(R(),1,R()*h):c(1,R(),R()*h);G.fillStyle=R()<.5?"rgba(0,0,0,.07)":"rgba(255,255,255,.1)";G.fillRect(p[0],p[1],1.5,1)}}
 G.restore();
 if(tex==="stone"||o.quoin){const d=Math.min(.2,4.4/a),d2=Math.min(.2,4.4/b);let alt=0;for(let z=pl;z<h-2;z+=5,alt++){const z1=Math.min(h,z+4.2);
   poly([c(1-d*(alt%2?1.7:1),1,z),c(1,1,z),c(1,1,z1),c(1-d*(alt%2?1.7:1),1,z1)],lit(col,FL*1.1),"rgba(0,0,0,.3)",.3);
   poly([c(1,1-d2*(alt%2?1:1.7),z),c(1,1,z),c(1,1,z1),c(1,1-d2*(alt%2?1:1.7),z1)],lit(col,FR*1.1),"rgba(0,0,0,.3)",.3)}}
 if(o.win!==false&&h>9)win(c,a,b,h,R,a>=14&&h>=9&&!o.noDoor);
 poly([c(0,0,h),c(1,0,h),c(1,1,h),c(0,1,h)],lit(o.top||col,FT),INK,.6);
 return c}
function rtype(roof){const r=h2r(roof);if(r[0]>170&&r[1]>140&&r[2]<120)return"thatch";return r[2]>r[0]+8?"slate":(r[0]+r[1]+r[2]<250?"shingle":"tile")}
function roofRows(p0,p1,ap,rows,type){G.save();G.strokeStyle="rgba(0,0,0,.26)";G.lineWidth=.42;G.beginPath();
 const sv=[(ap[0]-p0[0])/rows,(ap[1]-p0[1])/rows],sv1=[(ap[0]-p1[0])/rows,(ap[1]-p1[1])/rows];
 for(let k=1;k<rows;k++){const pa=[p0[0]+sv[0]*k,p0[1]+sv[1]*k],pb=[p1[0]+sv1[0]*k,p1[1]+sv1[1]*k];G.moveTo(pa[0],pa[1]);G.lineTo(pb[0],pb[1]);
  const len=Math.hypot(pb[0]-pa[0],pb[1]-pa[1]),step=type==="slate"?4.4:type==="shingle"?3.2:type==="thatch"?2.2:3.8,nT=Math.floor(len/step);
  for(let m=0;m<nT;m++){const s=(m+.5+(k%2?.5:0))/nT;if(s>1)continue;const x=pa[0]+(pb[0]-pa[0])*s,y=pa[1]+(pb[1]-pa[1])*s;G.moveTo(x,y);G.lineTo(x+(sv[0]+sv1[0])*.5,y+(sv[1]+sv1[1])*.5)}}
 G.stroke();G.restore()}
function gable(cx,cy,a,b,h,rh,roof,o){o=o||{};const c=(i,j,z)=>cor(cx,cy,a,b,i,j,z);const ov=.06;
 const ra=c(-ov,.5,h+rh),rb=c(1+ov,.5,h+rh);
 poly([c(-ov,-ov,h),c(1+ov,-ov,h),rb,ra],lit(roof,.9*FT),INK,.6);
 poly([c(1,1,h),c(1,0,h),c(1,.5,h+rh)],lit(o.wall||"#e8dcc0",FR),INK,.6);
 poly([c(-ov,1+ov,h),c(1+ov,1+ov,h),rb,ra],lit(roof,FL*1.02),INK,.7);
 const p0=c(-ov,1+ov,h),q0=c(1+ov,1+ov,h);
 roofRows(p0,q0,ra,Math.max(3,Math.min(9,Math.round(rh/2.1))),rtype(roof));
 G.save();G.strokeStyle=lit(roof,1.22);G.lineWidth=1.5;G.beginPath();G.moveTo(ra[0],ra[1]);G.lineTo(rb[0],rb[1]);G.stroke();G.strokeStyle="rgba(0,0,0,.4)";G.lineWidth=.4;G.stroke();
 G.strokeStyle=lit(roof,1.12);G.lineWidth=1;G.beginPath();G.moveTo(p0[0],p0[1]);G.lineTo(q0[0],q0[1]);G.stroke();G.restore();
 poly([c(0,1,h),c(1,1,h),c(1,1,h-4),c(0,1,h-4)],"rgba(20,10,0,.24)");poly([c(1,1,h),c(1,0,h),c(1,0,h-4),c(1,1,h-4)],"rgba(20,10,0,.2)");
 if(rh>=8&&b>=16){const w=Math.min(.12,2.2/b),z0=h+rh*.2,z1=h+rh*.52;poly([c(1,.5-w,z0),c(1,.5+w,z0),c(1,.5+w,z1),c(1,.5-w,z1)],ST.night?"#ffcf6a":lit("#2b3140",FR),lit("#efe6d0",FR*.9),.6)}
 G.save();G.strokeStyle=lit("#4a3220",FR);G.lineWidth=.8;G.beginPath();G.moveTo(c(1,1,h)[0],c(1,1,h)[1]);G.lineTo(c(1,.5,h+rh)[0],c(1,.5,h+rh)[1]);G.lineTo(c(1,0,h)[0],c(1,0,h)[1]);G.stroke();G.restore();
 if(ST.sn)poly([ra,rb,[rb[0]-.5,rb[1]+3],[ra[0]-.5,ra[1]+3]],"rgba(246,250,252,.92)");
 if(o.chim){const p=c(.3,.5,h+rh*.55);box(p[0],p[1]+3,4,4,9,"#9a8a78",{noShadow:1,win:false,tex:"brick"});const cp=[p[0]-1.2,p[1]-6.5];poly([[cp[0]-.6,cp[1]],[cp[0]+3.4,cp[1]],[cp[0]+3.4,cp[1]-1.6],[cp[0]-.6,cp[1]-1.6]],lit("#6a5a4a",1),INK,.3)}}
function hip(cx,cy,a,b,h,rh,roof){const c=(i,j,z)=>cor(cx,cy,a,b,i,j,z),ap=c(.5,.5,h+rh);
 poly([c(0,1,h),c(1,1,h),ap],lit(roof,FL),INK,.6);poly([c(1,1,h),c(1,0,h),ap],lit(roof,FR),INK,.6);
 const rows=Math.max(3,Math.min(8,Math.round(rh/2.4))),ty=rtype(roof);roofRows(c(0,1,h),c(1,1,h),ap,rows,ty);roofRows(c(1,1,h),c(1,0,h),ap,rows,ty);
 G.save();G.strokeStyle=lit(roof,1.2);G.lineWidth=1;G.beginPath();G.moveTo(c(1,1,h)[0],c(1,1,h)[1]);G.lineTo(ap[0],ap[1]);G.stroke();G.restore();
 if(ST.sn)poly([ap,c(.2,.9,h+rh*.2),c(.8,.9,h+rh*.2)],"rgba(246,250,252,.85)")}
const ARCH={
 pre:{roof:"hip",rm:1,cornice:1,arch:1},
 kra:{brick:["#a04a34","#b05a3c","#946046","#a85c40"],step:1,bm:.86,hm:1.18,rm:1.2},
 vie:{roof:"hip",cornice:1,hm:1.28,rm:.9,bm:.95},
 pra:{curve:1,bm:.8,hm:1.2,rm:1.1,cornice:1},
 ven:{roof:"flat",cornice:1,arch:1,altana:1,hm:1.1},
 par:{roof:"mansard",cornice:1,hm:1.2,dorm:1},
 lon:{beams:1,bm:.9,hm:1.05,rm:1.2},
 brn:{roof:"hip",cornice:1,rm:1.05},
 bud:{roof:"hip",cornice:1,arch:1,hm:1.15,rm:.9},
 kut:{stone:1,step:1,bm:.9,hm:1.1,rm:1.3},
 gda:{brick:["#a8503a","#b45a40","#9a4a36","#c06a4a"],step:1,bm:.76,hm:1.3,rm:1.1}
};
function gDeco(x,y,a,b,h,rh,wallC,kind){const c=(i,j,z)=>cor(x,y,a,b,i,j,z);const pts=[];
 if(kind==="step"){const L=[],Rt=[];for(let k=0;k<4;k++){const hw=.5*(1-k/4),z0=h+rh*k/4,z1=h+rh*(k+1)/4;L.push([.5-hw,z0],[.5-hw,z1]);Rt.unshift([.5+hw,z1],[.5+hw,z0])}
  const topHW=.5*(1-.75);pts.push(...L,[.5-topHW,h+rh+2.4],[.5+topHW,h+rh+2.4],...Rt)}
 else{const n=14;for(let k=0;k<=n;k++){const t=k/n,hw=.5*(1-t)+.07*Math.sin(t*6.283)*(1-t);pts.push([.5-hw,h+rh*t])}pts.push([.5,h+rh+4]);for(let k=n;k>=0;k--){const t=k/n,hw=.5*(1-t)+.07*Math.sin(t*6.283)*(1-t);pts.push([.5+hw,h+rh*t])}}
 poly(pts.map(p=>c(1.001,p[0],p[1])),lit(wallC,FR),INK,.6);
 G.save();G.strokeStyle="rgba(255,255,255,.28)";G.lineWidth=.6;G.beginPath();pts.forEach((p,i)=>{const q=c(1.001,p[0],p[1]-1);i?G.lineTo(q[0],q[1]):G.moveTo(q[0],q[1])});G.stroke();G.restore();
 const ap=c(1.001,.5,h+rh*.5),r=Math.min(3.2,b*.12);G.fillStyle=ST.night?"#ffcf6a":lit("#2b3140",FR);G.beginPath();G.arc(ap[0],ap[1],r,0,7);G.fill();G.strokeStyle=lit("#efe6d0",FR);G.lineWidth=.6;G.stroke()}
function mansard(x,y,a,b,h,rh,roofC){const c=(i,j,z)=>cor(x,y,a,b,i,j,z),hz=h+rh*.62,I=.17;
 poly([c(0,1,h),c(1,1,h),c(1-I,1-I,hz),c(I,1-I,hz)],lit(roofC,FL),INK,.6);poly([c(1,1,h),c(1,0,h),c(1-I,I,hz),c(1-I,1-I,hz)],lit(roofC,FR),INK,.6);
 G.save();G.strokeStyle="rgba(0,0,0,.25)";G.lineWidth=.4;G.beginPath();for(let k=1;k<4;k++){const z=h+(hz-h)*k/4,f=I*k/4;let p=c(f,1-f,z),q=c(1-f,1-f,z),r2=c(1-f,f,z);G.moveTo(p[0],p[1]);G.lineTo(q[0],q[1]);G.lineTo(r2[0],r2[1])}G.stroke();G.restore();
 const t=c(.5,.5,hz+rh*.22);poly([c(I,1-I,hz),c(1-I,1-I,hz),t],lit(roofC,FL*1.08),INK,.5);poly([c(1-I,1-I,hz),c(1-I,I,hz),t],lit(roofC,FR*1.06),INK,.5);
 G.strokeStyle=lit(roofC,1.25);G.lineWidth=1;G.beginPath();G.moveTo(c(I,1-I,hz)[0],c(I,1-I,hz)[1]);G.lineTo(c(1-I,1-I,hz)[0],c(1-I,1-I,hz)[1]);G.lineTo(c(1-I,I,hz)[0],c(1-I,I,hz)[1]);G.stroke();
 if(ST.sn)poly([t,c(.3,.7,hz+rh*.1),c(.7,.7,hz+rh*.1)],"rgba(246,250,252,.85)")}
function dormers(x,y,a,b,h,rh,wallC,roofC){const c=(i,j,z)=>cor(x,y,a,b,i,j,z),n=Math.max(1,Math.floor(a/15));for(let k=0;k<n;k++){const u=(k+.5)/n,p=c(u*.7+.15,.83,h+rh*.3);const w=4.4;poly([[p[0]-w,p[1]],[p[0]+w,p[1]],[p[0]+w,p[1]-6],[p[0]-w,p[1]-6]],lit(wallC,FL),INK,.4);poly([[p[0]-w-.8,p[1]-6],[p[0],p[1]-10.5],[p[0]+w+.8,p[1]-6]],lit(roofC,FL*1.05),INK,.4);poly([[p[0]-2,p[1]-.8],[p[0]+2,p[1]-.8],[p[0]+2,p[1]-5],[p[0]-2,p[1]-5]],ST.night?"#ffcf6a":lit("#2b3140",FL),lit("#efe6d0",FL),.4)}}
function cornice(x,y,a,b,h){const c=(i,j,z)=>cor(x,y,a,b,i,j,z);poly([c(-.03,1.03,h),c(1.03,1.03,h),c(1.03,1.03,h-2.2),c(-.03,1.03,h-2.2)],lit("#efe6d0",FL),"rgba(0,0,0,.3)",.3);poly([c(1.03,1.03,h),c(1.03,-.03,h),c(1.03,-.03,h-2.2),c(1.03,1.03,h-2.2)],lit("#efe6d0",FR),"rgba(0,0,0,.3)",.3)}
function altana(x,y,a,b,h){const c=cor(x,y,a,b,.35,.45,h),px=c[0],py=c[1];G.strokeStyle=lit("#6a4a2a",1);G.lineWidth=1.2;G.beginPath();for(const dx of[-4,4]){G.moveTo(px+dx,py);G.lineTo(px+dx,py-9)}G.stroke();poly([[px-6,py-9],[px+6,py-9],[px+4,py-12],[px-4,py-12]],lit("#c47a4a",1),INK,.4);poly([[px-4,py-8.5],[px+4,py-8.5],[px+4,py-3],[px-4,py-3]],"rgba(40,25,10,.35)")}
function house(x,y,a,b,h,wallC,roofC,o){o=o||{};const T=o.st&&AS?AS:null;
 if(!T){box(x,y,a,b,h,wallC,{beams:o.beams,stone:o.stone});gable(x,y,a,b,h,o.rh||Math.min(a,b)*.5,roofC,{wall:wallC,chim:o.chim});return}
 const full=o.st===1;let rh=(o.rh||Math.min(a,b)*.5)*(T.rm||1);if(full){b*=T.bm||1;h*=T.hm||1}
 let wc=wallC,bm=o.beams,stn=o.stone,tex=null;
 if(full&&T.brick){wc=T.brick[(Math.abs(x*7+y*3)|0)%T.brick.length];bm=0;stn=0;tex="brick"}else if(full&&T.stone&&!bm){stn=1}else if(full&&T.beams){bm=1}else if(full&&T.cornice){bm=0}
 box(x,y,a,b,h,wc,{beams:bm,stone:stn,tex:tex||undefined});
 if(T.cornice&&full)cornice(x,y,a,b,h);
 const rk=T.roof||"gable";
 if(rk==="hip"){hip(x,y,a,b,h,rh*.9,roofC)}
 else if(rk==="mansard"){mansard(x,y,a,b,h,rh*1.25,roofC);if(T.dorm&&full)dormers(x,y,a,b,h,rh*1.25,wc,roofC)}
 else if(rk==="flat"){gable(x,y,a,b,h,Math.max(3,rh*.4),roofC,{wall:wc,chim:o.chim});if(T.altana&&full&&((Math.abs(x*3+y)|0)%3===0))altana(x,y,a,b,h+3)}
 else{gable(x,y,a,b,h,rh,roofC,{wall:wc,chim:o.chim});if(full&&(T.step||T.curve))gDeco(x,y,a,b,h,rh,wc,T.step?"step":"curve")}}
function cyl(x,y,r,h,col,roof,rh){shadow(x,y,r*1.6,r*1.6,h);const gr=G.createLinearGradient(x-r,0,x+r,0);gr.addColorStop(0,lit(col,.98));gr.addColorStop(.55,lit(col,.78));gr.addColorStop(1,lit(col,.5));G.fillStyle=gr;G.beginPath();G.moveTo(x-r,y);G.lineTo(x-r,y-h);G.ellipse(x,y-h,r,r*.5,0,Math.PI,0,true);G.lineTo(x+r,y);G.ellipse(x,y,r,r*.5,0,0,Math.PI);G.closePath();G.fill();G.strokeStyle=INK;G.lineWidth=.6;G.stroke();
 G.save();G.strokeStyle="rgba(0,0,0,.2)";G.lineWidth=.4;for(let z=4;z<h-1;z+=5){G.beginPath();G.ellipse(x,y-z,r,r*.5,0,.05,Math.PI-.05);G.stroke()}
 if(h>22){G.fillStyle="rgba(10,5,0,.65)";G.fillRect(x-r*.15,y-h*.55,1.5,5);if(h>30)G.fillRect(x+r*.3,y-h*.8,1.4,4.5)}G.restore();
 G.fillStyle=lit(col,1.05);G.beginPath();G.ellipse(x,y-h,r,r*.5,0,0,7);G.fill();G.stroke();
 if(roof){G.fillStyle=lit(roof,.82);G.beginPath();G.moveTo(x-r-1.5,y-h);G.lineTo(x,y-h-rh);G.lineTo(x+r+1.5,y-h);G.ellipse(x,y-h,r+1.5,(r+1.5)*.5,0,0,Math.PI);G.closePath();G.fill();G.stroke();G.fillStyle=lit(roof,1);G.beginPath();G.moveTo(x-r-1.5,y-h);G.lineTo(x,y-h-rh);G.lineTo(x+r*.1,y-h+r*.45);G.closePath();G.fill();G.save();G.strokeStyle="rgba(0,0,0,.22)";G.lineWidth=.4;for(let k=1;k<5;k++){const t=k/5,rr=(r+1.5)*(1-t);G.beginPath();G.ellipse(x,y-h-rh*t,rr,rr*.5,0,.05,Math.PI-.05);G.stroke()}G.restore();if(rh>12){G.fillStyle=lit("#d8b040",1);G.beginPath();G.arc(x,y-h-rh-.8,1.2,0,7);G.fill()}}}
function leafCols(){return ST.se===0?["#86b658","#6fa44a","#92c064"]:ST.se===1?["#4f8a38","#3f7a30","#5b9a40"]:ST.se===2?["#c8782a","#b8452a","#d6a030","#9a5a24"]:["#7b6a58","#6e5e4e"]}
function blob(x,y,r,col,hi){const gr=G.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r*1.05);gr.addColorStop(0,lit(col,hi?1.28:1.18));gr.addColorStop(.6,lit(col,.92));gr.addColorStop(1,lit(col,.62));G.fillStyle=gr;G.beginPath();G.arc(x,y,r,0,7);G.fill();G.strokeStyle="rgba(20,30,10,.35)";G.lineWidth=.5;G.stroke()}
function tree(x,y,s,kind,seed){const r=rng(seed|0);s=s||1;G.save();
 G.globalAlpha=ST.night?.3:.22;G.fillStyle="#10161a";G.beginPath();G.ellipse(x+7*s,y+1*s,9*s,3.4*s,0,0,7);G.fill();G.globalAlpha=1;
 if(kind==="pine"){const gc=ST.se===2?"#3f6a38":"#2f6a3c";G.fillStyle=lit("#5a3c22",.8);G.fillRect(x-1.2*s,y-6*s,2.4*s,6*s);
  for(let i=0;i<4;i++){const w=(11-i*2.1)*s,yy=y-5*s-i*6*s;poly([[x-w,yy],[x,yy-10*s],[x+w,yy]],lit(gc,.7+i*.08),INK,.5);poly([[x,yy-10*s],[x+w,yy],[x+w*.1,yy]],lit(gc,.55+i*.06));if(ST.sn)poly([[x-w*.5,yy-4.5*s],[x,yy-10*s],[x+w*.5,yy-4.5*s],[x,yy-3*s]],"rgba(246,250,252,.9)")}}
 else if(kind==="bush"){const cs=leafCols();for(let i=0;i<4;i++)blob(x+(r()-.5)*8*s,y-3*s-r()*3*s,5*s,cs[i%cs.length])}
 else{const cs=leafCols();G.fillStyle=lit("#5a3c22",.85);G.fillRect(x-1.6*s,y-9*s,3.2*s,9*s);
  if(ST.se===3){G.strokeStyle=lit("#5a4636",.9);G.lineWidth=1*s;for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*.42;G.beginPath();G.moveTo(x,y-8*s);G.lineTo(x+Math.cos(a)*(12+r()*3)*s,y-8*s+Math.sin(a)*(13+r()*4)*s);G.stroke()}for(let i=0;i<6;i++){G.fillStyle="rgba(246,250,252,.9)";G.beginPath();G.arc(x+(r()-.5)*16*s,y-12*s-r()*10*s,1.6*s,0,7);G.fill()}}
  else{const base=cs[(r()*cs.length)|0];for(let i=0;i<5;i++)blob(x+(r()-.5)*11*s,y-12*s-r()*9*s,(6+r()*3)*s,base);blob(x,y-15*s,8.5*s,base,true);
   if(ST.se===0&&r()<.5)for(let i=0;i<8;i++){G.fillStyle="#f6d7e0";G.beginPath();G.arc(x+(r()-.5)*15*s,y-10*s-r()*14*s,1.1*s,0,7);G.fill()}}}
 G.restore()}
function hay(x,y,s){shadow(x,y,10*s,8*s,7*s);G.fillStyle=lit("#d4b24c",.85);G.beginPath();G.ellipse(x,y,6*s,2.6*s,0,0,7);G.fill();poly([[x-6*s,y],[x,y-11*s],[x+6*s,y]],lit(ST.sn?"#e9eef0":"#d9b650",.9),INK,.5);poly([[x,y-11*s],[x+6*s,y],[x+1*s,y+1*s]],lit(ST.sn?"#cfd8dc":"#b8963c",.8))}
function sheep(x,y,s){G.fillStyle=lit("#f2eee2",1);G.strokeStyle="rgba(20,20,10,.5)";G.lineWidth=.4;G.beginPath();G.ellipse(x,y-2*s,3.2*s,2.2*s,0,0,7);G.fill();G.stroke();G.fillStyle=lit("#3a3028",1);G.beginPath();G.arc(x+3*s,y-2.8*s,1.2*s,0,7);G.fill();G.fillRect(x-1.8*s,y-.4*s,.7*s,1.6*s);G.fillRect(x+1.2*s,y-.4*s,.7*s,1.6*s)}
function barrel(x,y,s){G.fillStyle=lit("#8a5a30",.9);G.fillRect(x-2.5*s,y-5*s,5*s,5*s);G.strokeStyle="rgba(0,0,0,.55)";G.lineWidth=.5;G.strokeRect(x-2.5*s,y-5*s,5*s,5*s);G.beginPath();G.moveTo(x-2.5*s,y-3.4*s);G.lineTo(x+2.5*s,y-3.4*s);G.stroke()}
function sack(x,y){G.fillStyle=lit("#d8cfae",1);G.beginPath();G.ellipse(x,y-2.5,2.8,3.4,0,0,7);G.fill();G.strokeStyle=INK;G.lineWidth=.4;G.stroke()}
function flag(x,y,hgt,col){G.strokeStyle="#2b2117";G.lineWidth=1.1;G.beginPath();G.moveTo(x,y);G.lineTo(x,y-hgt);G.stroke();poly([[x,y-hgt],[x+10,y-hgt+2.5],[x,y-hgt+5.5]],col,"#2b2117",.5)}
function person(x,y,col){G.fillStyle=lit(col,.95);G.beginPath();G.moveTo(x-1.8,y);G.quadraticCurveTo(x-2,y-6,x,y-7);G.quadraticCurveTo(x+2,y-6,x+1.8,y);G.fill();G.fillStyle="#e0b090";G.beginPath();G.arc(x,y-8.2,1.5,0,7);G.fill()}
function isoQuad(cx,cy,a,b,col,o){o=o||{};const c=(i,j)=>cor(cx,cy,a,b,i,j,0);poly([c(0,0),c(1,0),c(1,1),c(0,1)],lit(col,o.f||1),o.edge||"rgba(40,30,10,.35)",.5);
 if(o.rows){G.save();G.strokeStyle=o.rowCol||"rgba(40,30,10,.28)";G.lineWidth=o.rw||.7;for(let k=1;k<o.rows;k++){const u=k/o.rows;let p,q;if(o.dir==="b"){p=c(u,0);q=c(u,1)}else{p=c(0,u);q=c(1,u)}G.beginPath();G.moveTo(p[0],p[1]);G.lineTo(q[0],q[1]);G.stroke()}G.restore()}}
function lighten(x,y,rx,ry,col,a){G.save();G.translate(x,y);G.scale(rx,ry);const g2=G.createRadialGradient(0,0,0,0,0,1),c=h2r(col);g2.addColorStop(0,`rgba(${c[0]},${c[1]},${c[2]},${a})`);g2.addColorStop(1,`rgba(${c[0]},${c[1]},${c[2]},0)`);G.fillStyle=g2;G.beginPath();G.arc(0,0,1,0,7);G.fill();G.restore()}
function hill(x,y,rx,ry,hh,col){G.save();
 G.fillStyle=lit(col,.72);G.beginPath();G.ellipse(x+hh*.15,y+4,rx,ry*.95,0,0,7);G.fill();
 const gr=G.createRadialGradient(x-rx*.3,y-hh*.9,2,x,y-hh*.3,rx*1.05);gr.addColorStop(0,lit(col,1.22));gr.addColorStop(.55,lit(col,.98));gr.addColorStop(1,lit(col,.7));
 G.fillStyle=gr;G.beginPath();G.ellipse(x,y-hh*.4,rx*.97,ry+hh*.45,0,0,7);G.fill();
 G.globalAlpha=.16;G.strokeStyle="#000";G.lineWidth=.6;for(let k=1;k<5;k++){G.beginPath();G.ellipse(x,y-hh*.4-k*hh*.07,rx*(1-k*.17),(ry+hh*.45)*(1-k*.17),0,.1*Math.PI,.9*Math.PI);G.stroke()}
 G.restore()}
function mountains(){const r=rng(ST.cid*7+3);const base=ST.sn?"#c9d6e0":"#8ea6bb",far=ST.sn?"#dde7ee":"#a9bdce";
 const ridge=(y0,amp,col,step,snow)=>{G.fillStyle=lit(col,1);G.beginPath();G.moveTo(-20,y0+20);let x=-20;const pts=[];while(x<W+40){pts.push([x,y0-r()*amp-amp*.3*Math.sin(x/90)]);x+=step*(.7+r()*.6)}pts.forEach(p=>G.lineTo(p[0],p[1]));G.lineTo(W+40,y0+30);G.lineTo(-20,y0+30);G.closePath();G.fill();
  if(snow){G.fillStyle=ST.night?"rgba(210,220,240,.7)":"rgba(250,252,255,.85)";pts.forEach(p=>{if(p[1]<y0-amp*.62){G.beginPath();G.moveTo(p[0]-8,p[1]+8);G.lineTo(p[0],p[1]);G.lineTo(p[0]+9,p[1]+9);G.lineTo(p[0]+2,p[1]+5);G.closePath();G.fill()}})}};
 const ma=terr("ma",1);ridge(48,42*ma,far,70,true);ridge(62,30*ma,base,52,false);
 G.fillStyle=lit(ST.sn?"#9fb3aa":ST.se===2?"#9a7a3a":"#3f6e3a",.9);G.beginPath();G.moveTo(0,64);for(let x=0;x<=W;x+=14)G.lineTo(x,60+Math.sin(x/37+r())*4+Math.sin(x/11)*2);G.lineTo(W,80);G.lineTo(0,80);G.fill()}
function grassBase(){const g0=["#8ab052","#6f9c42","#a8914a","#e4ecef"][ST.se];G.fillStyle=lit(g0,1);G.fillRect(0,0,W,H);
 const r=rng(ST.cid*13+ST.se);const gl=[["#9bc460",.5],["#648a38",.45],["#b8a850",.3]];
 for(let i=0;i<70;i++){const k=gl[i%3];lighten(r()*W,80+r()*(H-80),50+r()*110,22+r()*45,ST.sn?(i%2?"#ffffff":"#cdd9df"):k[0],ST.sn?.35:k[1]*.55)}
 G.lineWidth=.8;for(let i=0;i<1300;i++){const x=r()*W,y=70+r()*(H-70);G.strokeStyle=ST.sn?(r()<.5?"rgba(120,150,170,.35)":"rgba(255,255,255,.5)"):(r()<.5?"rgba(50,90,30,.28)":"rgba(210,230,150,.3)");G.beginPath();G.moveTo(x,y);G.lineTo(x+(r()-.5)*3,y-2-r()*3);G.stroke()}
 if(ST.se<2)for(let i=0;i<220;i++){G.fillStyle=["#fff3b0","#f6c0d0","#fff","#b8c8f0"][i%4];G.globalAlpha=.8;G.beginPath();G.arc(r()*W,80+r()*(H-80),1,0,7);G.fill();G.globalAlpha=1}}
const terr=(n,d)=>{try{const t=window.OKTERR;const v=t&&t[n][CITY_DEF[CC().id].key];return v==null?d:v}catch(e){return d}};
const RY=x=>490+18*Math.sin((x-250)/150)+6*Math.sin(x/53),RH=x=>(19+3*Math.sin(x/90))*terr("rw",1);
function river(){const top=[],bot=[];for(let x=-20;x<=W+20;x+=10){top.push([x,RY(x)-RH(x)]);bot.push([x,RY(x)+RH(x)])}
 const path=(a,b)=>{G.beginPath();a.forEach((p,i)=>i?G.lineTo(p[0],p[1]):G.moveTo(p[0],p[1]));for(let i=b.length-1;i>=0;i--)G.lineTo(b[i][0],b[i][1]);G.closePath()};
 G.save();G.translate(0,2.5);path(top.map(p=>[p[0],p[1]-3]),bot.map(p=>[p[0],p[1]+4]));G.fillStyle=lit(ST.sn?"#cfd8dc":"#6b5a3a",.9);G.fill();G.restore();
 path(top,bot);const gr=G.createLinearGradient(0,470,0,540);
 if(ST.sn){gr.addColorStop(0,"#dfeef6");gr.addColorStop(1,"#b8d2e0")}else{gr.addColorStop(0,lit("#6fa6cc",1));gr.addColorStop(.5,lit("#4f88b4",1));gr.addColorStop(1,lit("#3f6f98",1))}
 G.fillStyle=gr;G.fill();G.strokeStyle="rgba(20,40,60,.45)";G.lineWidth=.8;G.stroke();
 G.save();path(top,bot);G.clip();const r=rng(ST.cid+91);
 for(let i=0;i<150;i++){const x=r()*W,y=RY(x)+(r()-.5)*RH(x)*1.6;G.strokeStyle=ST.sn?"rgba(255,255,255,.7)":ST.night?"rgba(200,220,255,.35)":"rgba(236,248,255,.55)";G.lineWidth=.9;G.beginPath();G.moveTo(x,y);G.lineTo(x+8+r()*10,y+(r()-.5)*1.4);G.stroke()}
 lighten(300,RY(300),160,10,"#ffffff",ST.night?.1:.18);lighten(900,RY(900),160,10,"#ffffff",ST.night?.1:.18);G.restore();
 const rr=rng(ST.cid+4);for(let i=0;i<40;i++){const x=rr()*W,s=rr()<.5?-1:1,y=RY(x)+s*(RH(x)+1);G.strokeStyle=lit(ST.sn?"#9a8a6a":"#5a7a3a",1);G.lineWidth=.8;for(let k=0;k<3;k++){G.beginPath();G.moveTo(x+k*2,y);G.lineTo(x+k*2+(rr()-.5)*3,y-6-rr()*3);G.stroke()}}}
function road(pts,wd){wd=wd||11;const rq=ST.rq||3;wd*=rq<=2?.82:rq<=4?1:rq<=6?1.18:1.32;G.save();G.lineCap="round";G.lineJoin="round";const stroke=(w,c)=>{G.strokeStyle=c;G.lineWidth=w;G.beginPath();G.moveTo(pts[0][0],pts[0][1]);if(pts.length===3)G.quadraticCurveTo(pts[1][0],pts[1][1],pts[2][0],pts[2][1]);else for(let i=1;i<pts.length;i++)G.lineTo(pts[i][0],pts[i][1]);G.stroke()};
 const mud=ST.se===2||ST.se===0;
 if(rq<=2){stroke(wd+3,lit(ST.sn?"#a9b4ba":"#6a5230",1));stroke(wd,lit(ST.sn?"#eef2f4":mud?"#a88a5a":"#b89c68",1));G.setLineDash([1.5,9]);stroke(wd*.5,lit(ST.sn?"#c9d4da":"#8a6e44",1));G.setLineDash([])}
 else if(rq<=4){stroke(wd+3.5,lit(ST.sn?"#a9b4ba":"#7b6038",1));stroke(wd,lit(ST.sn?"#eef2f4":mud?"#b79a68":"#cdb07c",1));G.setLineDash([2,7]);stroke(wd*.34,lit(ST.sn?"#c9d4da":"#a8895a",1));G.setLineDash([])}
 else{stroke(wd+4,lit(ST.sn?"#a9b4ba":rq>=7?"#8a7c52":"#857d6c",1));stroke(wd,lit(ST.sn?"#eef2f4":"#d4cbb6",1));G.setLineDash([1.8,2.6]);stroke(wd*.78,lit(ST.sn?"#c9d4da":"#b3ab98",1));G.setLineDash([]);stroke(wd*.5,lit(ST.sn?"#eef2f4":"#d9d0bc",1))}
 G.restore()}
function bridge(x){const y=RY(x),h=RH(x)+8;G.save();
 G.fillStyle="rgba(10,20,30,.28)";G.fillRect(x-17,y-h+8,34,2*h-6);
 poly([[x-14,y-h],[x+14,y-h],[x+14,y+h],[x-14,y+h]],lit(ST.sn?"#e6ecee":(ST.rq>=4?"#cdc6b2":"#b69a6a"),1),INK,.7);
 for(const s of[-1,1]){const px=x+s*14;poly([[px-2.4,y-h-2],[px+2.4,y-h-2],[px+2.4,y+h+2],[px-2.4,y+h+2]],lit("#a79e90",s<0?1:.78),INK,.6);for(let k=-h;k<=h;k+=7){G.fillStyle="rgba(0,0,0,.25)";G.fillRect(px-2.4,y+k,4.8,1)}}
 G.restore()}
const rd0=(a,b,bend)=>[a,[(a[0]+b[0])/2+bend,(a[1]+b[1])/2+Math.abs(bend)*.2],b];
const ROADS=[rd0([480,285],[190,335],-18),rd0([480,260],[150,175],-22),rd0([600,235],[590,118],14),rd0([700,262],[890,196],-14),rd0([700,270],[1040,138],-34),rd0([718,300],[975,398],22),rd0([718,285],[1110,318],10),rd0([690,325],[770,415],10),rd0([520,330],[470,RY(470)-RH(470)-26],-10),rd0([520,325],[318,418],-20),[[600,345],[612,430],[600,610]]];
const WALLS=["#efe6d0","#e8d8b0","#e9c9a8","#f0e0c8","#d8cfb8","#ead0c0","#e0d8a8"],ROOFS=["#a5312a","#b04a2a","#8a3a2a","#9a5a33","#7a4a2f","#a8402a"];
function fence(x0,y0,x1,y1){G.save();G.strokeStyle=lit("#6a4a2a",1);G.lineWidth=.9;G.beginPath();const n=Math.max(2,Math.round(Math.hypot(x1-x0,y1-y0)/4));for(let k=0;k<=n;k++){const px=x0+(x1-x0)*k/n,py=y0+(y1-y0)*k/n;G.moveTo(px,py);G.lineTo(px,py-4.5)}G.stroke();G.lineWidth=.6;G.beginPath();G.moveTo(x0,y0-3.6);G.lineTo(x1,y1-3.6);G.moveTo(x0,y0-1.6);G.lineTo(x1,y1-1.6);G.stroke();G.restore()}
function bed(x,y,w,d){isoQuad(x,y,w,d,ST.sn?"#e6eef0":"#7a5a38",{f:1,edge:"rgba(0,0,0,.35)"});if(!ST.sn){G.strokeStyle=lit(ST.se===2?"#c8a040":"#5a8a3a",1);G.lineWidth=1;for(let k=-1;k<=1;k++){G.beginPath();G.moveTo(x-w*.18+k*3,y+k*1.2);G.lineTo(x+w*.1+k*3,y+k*1.2-1.2);G.stroke()}}}
function village(x,y,n,seed,opt){opt=opt||{};const r=rng(seed),props=[];
 for(let i=0;i<n;i++){const ang=r()*6.283,d=18+r()*(opt.spread||52);const hx=x+Math.cos(ang)*d*1.15,hy=y+Math.sin(ang)*d*.58;const a=14+r()*10,b=12+r()*8,h=9+r()*7,wc=WALLS[(r()*WALLS.length)|0],rc=ROOFS[(r()*ROOFS.length)|0],bm=r()<.5,ch=r()<.5,t=r(),gard=r()<.55;
  props.push({y:hy,f:()=>{
   if(t<.18){box(hx,hy,a*1.5,b*.85,h*.85,"#8a6a44",{tex:"timber",noDoor:1,win:false});gable(hx,hy,a*1.5,b*.85,h*.85,h*.7,"#6a4a2f",{wall:"#8a6a44"});const c=cor(hx,hy,a*1.5,b*.85,.5,1,0);G.fillStyle="#1c1612";G.fillRect(c[0]-3,c[1]-8,6,8)}
   else if(t<.5)house(hx,hy,a,b,h*.9,wc,"#c9a85a",{beams:bm,rh:Math.min(a,b)*.62});
   else house(hx,hy,a,b,h,wc,rc,{beams:bm,chim:ch,rh:Math.min(a,b)*.52,st:2});
   if(gard){fence(hx-a*.45,hy+b*.42+5,hx+a*.45,hy+b*.42+5);fence(hx-a*.45,hy+b*.42+5,hx-a*.45-6,hy+b*.42-1)}}});
  if(gard&&t>=.18)props.push({y:hy+b*.42+9,f:()=>bed(hx+2,hy+b*.42+10,10,6)})}
 if(opt.church)props.push({y:y-24,f:()=>{const cx=x-6,cy=y-24;box(cx-8,cy,26,15,14,"#eee6d2",{tex:"stone",noDoor:1});gable(cx-8,cy,26,15,14,9,"#5d6a7a",{wall:"#eee6d2"});box(cx+12,cy+8,11,11,28,"#e8dfc9",{tex:"stone",noDoor:1});hip(cx+12,cy+8,11,11,28,15,"#5d6a7a");G.strokeStyle="#d6aa4c";G.lineWidth=1.3;G.beginPath();G.moveTo(cx+12,cy+8-43);G.lineTo(cx+12,cy+8-50);G.moveTo(cx+9.5,cy+8-47);G.lineTo(cx+14.5,cy+8-47);G.stroke();
    G.strokeStyle=lit("#b9b09c",1);G.lineWidth=2.4;G.beginPath();G.moveTo(cx-30,cy+4);G.lineTo(cx-30,cy+20);G.lineTo(cx-4,cy+26);G.stroke();for(let k=0;k<4;k++){const gx=cx-26+k*6,gy=cy+14+k*1.6;G.fillStyle=lit("#cfc8b8",1);G.fillRect(gx,gy-5,2.4,5);G.fillRect(gx-1,gy-4,4.4,1.2)}}});
 if(opt.well)props.push({y:y+30,f:()=>{const wx=x+12,wy=y+32;cyl(wx,wy,5,5,"#9a9284");G.fillStyle=lit(ST.sn?"#dfeef6":"#4f88b4",1);G.beginPath();G.ellipse(wx,wy-5,3.6,1.8,0,0,7);G.fill();G.strokeStyle="#4a3220";G.lineWidth=1.1;G.beginPath();G.moveTo(wx-5,wy);G.lineTo(wx-5,wy-13);G.moveTo(wx+5,wy);G.lineTo(wx+5,wy-13);G.moveTo(wx-7,wy-13);G.lineTo(wx,wy-18);G.lineTo(wx+7,wy-13);G.stroke();if(!ST.sn)for(let k=0;k<3;k++){const gx=wx-18+k*5,gy=wy+10+(k%2)*3;G.fillStyle="#f6f2e6";G.beginPath();G.ellipse(gx,gy-2,2.2,1.4,0,0,7);G.fill();G.fillRect(gx+1.4,gy-5,1,3);G.fillStyle="#e8a030";G.fillRect(gx+2.2,gy-5,1.4,.8)}}});
 return props}
function treeCluster(x,y,rx,ry,n,seed,kinds){const r=rng(seed),a=[];for(let i=0;i<n;i++){const ang=r()*6.283,d=Math.sqrt(r());const tx=x+Math.cos(ang)*d*rx,ty=y+Math.sin(ang)*d*ry,k=kinds[(r()*kinds.length)|0],s=.8+r()*.55;a.push({y:ty,f:()=>tree(tx,ty,s,k,(tx*7+ty*3)|0)})}return a}

const oo=(hx,hy,u,v)=>[hx+(u-v)*.5,hy+(u+v)*.25];
function merl(cx,cy,a,b,h,n){const c=(i,j,z)=>cor(cx,cy,a,b,i,j,z);G.save();G.fillStyle=lit("#d8d0bc",1);G.strokeStyle="rgba(0,0,0,.35)";G.lineWidth=.3;const m=Math.max(2,Math.round(n*b/a));for(let k=0;k<n;k++){const p=c((k+.5)/n,1,h);G.fillRect(p[0]-1.3,p[1]-3,2.6,3);G.strokeRect(p[0]-1.3,p[1]-3,2.6,3)}for(let k=0;k<m;k++){const p=c(1,(k+.5)/m,h);G.fillRect(p[0]-1.3,p[1]-3,2.6,3);G.strokeRect(p[0]-1.3,p[1]-3,2.6,3)}G.restore()}
function royal(x,y,col,kind,sc){sc=sc||1;G.save();G.translate(x,y);G.scale(sc,sc);G.translate(-x,-y);
 G.fillStyle=lit(col,.95);G.beginPath();if(kind==="queen"){G.moveTo(x-3.4,y);G.quadraticCurveTo(x-2,y-5,x-1.6,y-7);G.lineTo(x+1.6,y-7);G.quadraticCurveTo(x+2,y-5,x+3.4,y)}else{G.moveTo(x-2.2,y);G.quadraticCurveTo(x-2.4,y-6,x,y-7.4);G.quadraticCurveTo(x+2.4,y-6,x+2.2,y)}G.closePath();G.fill();
 if(kind==="king"){G.fillStyle="#f4efe6";G.beginPath();G.ellipse(x,y-6.6,2.9,1.3,0,0,7);G.fill();G.fillStyle="#2b2117";for(let q=0;q<3;q++)G.fillRect(x-1.6+q*1.3,y-6.2,.5,.9)}
 G.fillStyle="#e0b090";G.beginPath();G.arc(x,y-8.8,1.6,0,7);G.fill();
 if(kind==="king"||kind==="queen"||kind==="prince"){G.fillStyle="#e8c24a";G.strokeStyle="#6a4a10";G.lineWidth=.3;G.beginPath();G.moveTo(x-1.6,y-9.9);G.lineTo(x-1.8,y-12.2);G.lineTo(x-.8,y-11);G.lineTo(x,y-12.6);G.lineTo(x+.8,y-11);G.lineTo(x+1.8,y-12.2);G.lineTo(x+1.6,y-9.9);G.closePath();G.fill();G.stroke()}
 if(kind==="guard"){G.fillStyle="#1c1814";G.beginPath();G.ellipse(x,y-11,2.1,2.8,0,0,7);G.fill();G.fillStyle="#f4efe6";G.fillRect(x-2,y-5.5,4,.7)}
 G.restore()}
function lamp(x,y){G.strokeStyle=lit("#2b2117",1);G.lineWidth=1;G.beginPath();G.moveTo(x,y);G.lineTo(x,y-10);G.stroke();G.fillStyle=ST.night?"#ffcf6a":lit("#d8c890",1);G.fillRect(x-1.4,y-13,2.8,3.4);if(ST.night){G.save();G.globalAlpha=.25;G.fillStyle="#ffb84a";G.beginPath();G.arc(x,y-11,6,0,7);G.fill();G.restore()}}
function castle(hx,hy,Q){const S0="#cfc6b2",kh=24+Q*3,o=(u,v)=>oo(hx,hy,u,v),b3=Q>=3,W=b3?40+Q*2:0,D=b3?26+Q*1.5:0,wh=9+Q*.7,K=14+Q;
 const roofc=Q>=5?"#4a6a8a":"#8a3a2a";
 if(b3){const g=o(0,0);isoQuad(g[0],g[1],W+6,D+6,"#a89e84",{f:1});isoQuad(g[0],g[1],W-4,D-4,"#cbbf9e",{f:1,edge:"rgba(40,30,10,.25)"});
  let p=o(-W/2,0);box(p[0],p[1],5,D,wh,S0,{stone:1,win:false,noDoor:1});merl(p[0],p[1],5,D,wh,2);
  p=o(0,-D/2);box(p[0],p[1],W,5,wh,S0,{stone:1,win:false,noDoor:1});merl(p[0],p[1],W,5,wh,Math.round(W/8));
  p=o(-W/2,-D/2);cyl(p[0],p[1],4.6,wh+9,"#c8bfa8",roofc,10)}
 const kp=o(b3?-W*.12:0,b3?-D*.1:0);box(kp[0],kp[1],K,K,kh,"#c8bfa8",{stone:1,win:false});merl(kp[0],kp[1],K,K,kh,4);
 if(Q>=4){const t=cor(kp[0],kp[1],K,K,.5,.5,kh);box(t[0],t[1]+2,K*.5,K*.5,10,"#b9b09c",{stone:1,win:false});hip(t[0],t[1]+2,K*.5,K*.5,10,Q>=6?18:12,roofc);if(Q>=6){G.fillStyle="#e8c24a";G.beginPath();G.arc(t[0],t[1]+2-10-18,1.8,0,7);G.fill()}}
 flag(kp[0],kp[1]-kh-(Q>=4?24:2),12,DCsafe());
 if(Q>=3){const hp=o(W*.22,D*.12);box(hp[0],hp[1],W*.4,10,13+Q,"#e2d9c2",{stone:1});gable(hp[0],hp[1],W*.4,10,13+Q,8,"#6a5a52",{wall:"#e2d9c2"})}
 if(b3){let p=o(W/2,0);cyl(p[0],p[1],0,0,"#000",null,0);box(p[0],p[1],5,D,wh*.62,S0,{stone:1,win:false,noDoor:1});merl(p[0],p[1],5,D,wh*.62,2);
  p=o(0,D/2);box(p[0],p[1],W,5,wh*.62,S0,{stone:1,win:false,noDoor:1});merl(p[0],p[1],W,5,wh*.62,Math.round(W/8));
  const gt=o(W*.12,D/2);box(gt[0],gt[1],11,9,wh+8,"#bdb4a0",{stone:1,win:false});hip(gt[0],gt[1],11,9,wh+8,7,roofc);poly([cor(gt[0],gt[1],11,9,.3,1,0),cor(gt[0],gt[1],11,9,.7,1,0),cor(gt[0],gt[1],11,9,.7,1,9),cor(gt[0],gt[1],11,9,.3,1,9)],"#1c1612");
  p=o(W/2,-D/2);cyl(p[0],p[1],4.2,wh+7,"#c8bfa8",roofc,9);p=o(-W/2,D/2);cyl(p[0],p[1],4.2,wh+7,"#c8bfa8",roofc,9);p=o(W/2,D/2);cyl(p[0],p[1],5,wh+11,"#c8bfa8",roofc,11)}}
function palace(hx,hy,here){const o=(u,v)=>oo(hx,hy,u,v),S0="#efe4c8",G0="#6a6a72";let RD="#c0302a",KI=null;try{const kd=S.dyn&&S.dyn[S.king];if(kd){RD=DC(kd.id);KI=kd}}catch(e){}if(!here)KI=null;
 let p=o(0,18);isoQuad(p[0],p[1],64,50,"#d6cdb2",{f:1,edge:"rgba(40,30,10,.3)"});p=o(0,22);isoQuad(p[0],p[1],10,40,"#b0644a",{f:1,edge:"rgba(40,20,10,.3)"});
 for(const sx of[-1,1]){p=o(sx*28,42);isoQuad(p[0],p[1],22,10,"#6aa04a",{f:1,edge:"rgba(20,50,10,.5)"})}
 p=o(-36,18);box(p[0],p[1],16,38,24,S0,{stone:1});hip(p[0],p[1],16,38,24,8,G0);merl(p[0],p[1],16,38,24,3);
 p=o(0,0);box(p[0],p[1],76,22,28,S0,{stone:1});hip(p[0],p[1],76,22,28,9,G0);
 p=o(0,6);box(p[0],p[1],26,14,36,"#f2e8cc",{stone:1});gable(p[0],p[1],26,14,36,9,G0,{wall:"#f2e8cc"});
 p=o(0,-3);cyl(p[0],p[1],8.5,60,"#ece2c6","#d6aa4c",16);flag(p[0],p[1]-60-14,16,RD);
 for(const u of[-26,26]){const t=o(u,-6);cyl(t[0],t[1],4.4,44,"#ece2c6","#d6aa4c",10)}
 p=o(36,18);box(p[0],p[1],16,38,24,S0,{stone:1});hip(p[0],p[1],16,38,24,8,G0);merl(p[0],p[1],16,38,24,3);flag(p[0],p[1]-24-8,14,"#e8c24a");
 const fa=o(-36,18);flag(fa[0],fa[1]-24-8,14,RD);
 G.save();G.strokeStyle=lit("#2b2117",1);G.lineWidth=1;G.beginPath();for(let k=-3;k<=3;k++){if(k===0)continue;const q=o(k*8,38);G.moveTo(q[0],q[1]);G.lineTo(q[0],q[1]-6)}G.stroke();G.fillStyle="#e8c24a";for(const k of[-8,8]){const q=o(k,38);G.fillRect(q[0]-1.2,q[1]-9,2.4,9);G.beginPath();G.arc(q[0],q[1]-9.5,1.8,0,7);G.fill()}G.restore();
 const hk=KI&&KI.head&&KI.head.gender==="f"?"queen":"king",sk=hk==="king"?"queen":"king";
 const fam=[[-5,12,RD,hk,1.15]];if(!KI||KI.spouse)fam.push([3,12,"#4a3a9a",sk,1.1]);const nk=KI?Math.min(2,(KI.kids||[]).length):2;for(let q=0;q<nk;q++)fam.push([q?7:-1,q?16:17,q?"#8a2a6a":"#2a5a9a","prince",q?.78:.82]);
 (here===false?[]:fam).forEach(f=>{const q=o(f[0],f[1]+4);royal(q[0],q[1],f[2],f[3],f[4])});
 for(const u of[-6,6]){const q=o(u,40);royal(q[0],q[1],"#b8202a","guard",1)}
 G.save();G.fillStyle="#e8c24a";G.font="bold 7px serif";G.textAlign="center";G.restore()}
const cityRX=C=>96+Math.max(1,Math.min(7,C.tier||2))*12,WHT=[11,15,18,21,24,27,30];
function citySprite(C,cx,cy){const tier=Math.max(1,Math.min(5,C.tier||1)),r=rng(C.id*31+7);const E_={};let CF=null;try{CF=window.CITYCFG?CITYCFG(CITY_DEF[C.id].key,E_):null}catch(e){console.warn("CITYCFG",e)}const Q=Math.max(1,Math.min(7,C.tier||2)),isLon=!!(window.KRAL&&KRAL.court()===C.id),RX=cityRX(C),RY2=RX*.5,WH=(CF&&CF.wallH!=null?CF.wallH:WHT[Q-1]);const ring=[];const N=44;for(let i=0;i<N;i++){const a=i/N*6.283;ring.push([cx+Math.cos(a)*RX,cy+Math.sin(a)*RY2,a])}
 Object.assign(E_,{G,ST,cx,cy,RX,RY2,WH,poly,cor,box,hip,gable,house,cyl,flag,lit,tree,r});
 const props=[];const inside=(px,py,m)=>{const dx=(px-cx)/(RX-m),dy=(py-cy)/(RY2-m*.5);return dx*dx+dy*dy<1};
 const peb=[];for(let i=0;i<60;i++){const px=cx+(r()-.5)*RX*1.8,py=cy+(r()-.5)*RY2*1.8;if(inside(px,py,6))peb.push([px,py,2.2+r()*2])}
 const SW=5+Q*1.1,RR=.62;
 const cityStreets=()=>{if(CF&&CF.noStreets)return;G.save();const col=lit(Q>=4?"#e9dfc4":"#ddd2b2",1);G.fillStyle=col;G.strokeStyle="rgba(60,45,25,.5)";G.lineWidth=1;
  G.beginPath();G.rect(cx-SW,cy-RY2+3,SW*2,RY2*2-6);G.fill();G.stroke();G.beginPath();G.rect(cx-RX+5,cy-SW*.5,RX*2-10,SW);G.fill();G.stroke();
  if(Q>=3){G.lineWidth=SW*.9;G.strokeStyle=col;G.beginPath();G.ellipse(cx,cy,RX*RR,RY2*RR,0,0,7);G.stroke();G.lineWidth=.6;G.strokeStyle="rgba(60,45,25,.28)";G.beginPath();G.ellipse(cx,cy,RX*RR+SW*.45,RY2*RR+SW*.22,0,0,7);G.stroke();G.beginPath();G.ellipse(cx,cy,RX*RR-SW*.45,RY2*RR-SW*.22,0,0,7);G.stroke()}
  if(Q>=4){G.fillStyle=lit("#e6dcc0",1);G.strokeStyle="rgba(60,45,25,.35)";G.lineWidth=.7;G.beginPath();G.ellipse(cx,cy,34+Q*2,17+Q,0,0,7);G.fill();G.stroke()}
  G.fillStyle="rgba(90,70,40,.35)";const rs=rng(C.id*5+3);for(let k=0;k<30+Q*10;k++){const a=rs()<.5;const px=a?cx-SW+rs()*SW*2:cx-RX+6+rs()*(RX*2-12),py=a?cy-RY2+4+rs()*(RY2*2-8):cy-SW*.5+rs()*SW;G.beginPath();G.ellipse(px,py,1.1,.6,0,0,7);G.fill()}
  G.restore()};
 const flo=()=>{if(Q>=4){G.save();G.strokeStyle=lit(PAL&&PAL.wat?"#6a98b8":"#6a98b8",1);G.lineWidth=7;G.globalAlpha=.9;G.beginPath();G.ellipse(cx,cy+1,RX+5,RY2+2.5,0,0,7);G.stroke();G.strokeStyle="rgba(255,255,255,.35)";G.lineWidth=.8;G.beginPath();G.ellipse(cx,cy+1,RX+5,RY2+2.5,0,.3,2.4);G.stroke();G.restore()}G.fillStyle=lit((CF&&CF.floor)||"#c9bea2",1);G.beginPath();G.ellipse(cx,cy,RX,RY2,0,0,7);G.fill();G.save();G.globalAlpha=.25;G.strokeStyle="#000";G.lineWidth=.5;peb.forEach(q=>{G.beginPath();G.arc(q[0],q[1],q[2],0,7);G.stroke()});G.restore();cityStreets()};
 const wallSeg=(i,back,RG,H)=>{RG=RG||ring;H=H||WH;const p=RG[i],q=RG[(i+1)%N];
  poly([[p[0],p[1]],[q[0],q[1]],[q[0],q[1]-H],[p[0],p[1]-H]],lit((CF&&CF.wall)||"#cfc6b2",back?.62:.95-(Math.cos(p[2]-1.9)>0?0:.2)),INK,.5);
  poly([[p[0],p[1]-H],[q[0],q[1]-H],[q[0],q[1]-H-3],[p[0],p[1]-H-3]],lit("#d8d0bc",1.05),INK,.4);
  if(Q>=3){G.save();G.strokeStyle="rgba(40,30,20,.22)";G.lineWidth=.45;G.beginPath();for(const f of[.33,.66]){G.moveTo(p[0],p[1]-H*f);G.lineTo(q[0],q[1]-H*f)}G.stroke();if(Q>=4&&!back&&i%2===0){poly([[p[0]-1.4,p[1]],[p[0]+1.4,p[1]],[p[0]+1.4,p[1]-H],[p[0]-1.4,p[1]-H]],lit("#e0d8c4",1),INK,.3)}if(Q>=6){poly([[p[0],p[1]-H+4],[q[0],q[1]-H+4],[q[0],q[1]-H+2],[p[0],p[1]-H+2]],lit("#e8c24a",1))}G.restore()}
  if(!back){G.save();G.fillStyle=lit("#b8afa0",.8);const NC=3+(Q>>1);for(let k=0;k<NC;k++){const t=(k+.5)/NC;G.fillRect(p[0]+(q[0]-p[0])*t-1.2,p[1]+(q[1]-p[1])*t-H-6,2.4,3.2)}G.restore()}};
 const towers=[];for(let i=0;i<N;i+=(Q<=2?8:4))towers.push(i);
 const ring2=[];for(let i=0;i<N;i++){const a=i/N*6.283;ring2.push([cx+Math.cos(a)*(RX+14),cy+Math.sin(a)*(RY2+7),a])}
 const gapI=i=>[0,11,22,33].some(g=>Math.min((i-g+N)%N,(g-i+N)%N)<=1);
 const tower=i=>{if(CF&&CF.noTowers)return;const p=ring[i],tw=(CF&&CF.tw)||{};if(tw.sq){box(p[0],p[1],13,13,WH+10,(CF&&CF.wall)||"#c8bfa8",{stone:1,win:false});hip(p[0],p[1],13,13,WH+10,tw.rh||14,tw.roof||"#a5312a")}else cyl(p[0],p[1],6.5,WH+10,"#c8bfa8",tw.roof||"#a5312a",tw.rh||16);if(Q>=4)flag(p[0],p[1]-WH-10-((tw&&tw.rh)||16)-1,10,DCsafe());if(Q>=6){G.fillStyle="#e8c24a";G.beginPath();G.arc(p[0],p[1]-WH-10-((tw&&tw.rh)||16)-.5,1.7,0,7);G.fill()}};
 const turret=i=>{if(CF&&CF.noTowers)return;const p=ring[i],tw=(CF&&CF.tw)||{};cyl(p[0],p[1],4.2,WH+4,"#c8bfa8",tw.roof||"#a5312a",9)};
 const gate=ang=>{if(CF&&CF.noGates)return;const px=cx+Math.cos(ang)*RX,py=cy+Math.sin(ang)*RY2+3;if(Q>=4){G.fillStyle=lit("#8a6a44",1);G.strokeStyle="rgba(30,15,5,.5)";G.lineWidth=.5;const bw=Math.abs(Math.cos(ang))>.5?14:8,bh=Math.abs(Math.cos(ang))>.5?8:14;G.fillRect(px-bw/2+(Math.cos(ang)>0?6:Math.cos(ang)<0?-6:0),py-bh/2+(Math.sin(ang)>0?8:Math.sin(ang)<0?-8:0),bw,bh);G.strokeRect(px-bw/2+(Math.cos(ang)>0?6:Math.cos(ang)<0?-6:0),py-bh/2+(Math.sin(ang)>0?8:Math.sin(ang)<0?-8:0),bw,bh)}if(Q>=3){for(const dx of[-14,14])cyl(px+dx,py+3,4.6,WH+9,"#c8bfa8",(CF&&CF.tw&&CF.tw.roof)||"#7a4a2f",10)}box(px,py,22,14,WH+8,"#bdb4a0",{win:false,stone:1});poly([cor(px,py,22,14,.3,1,0),cor(px,py,22,14,.7,1,0),cor(px,py,22,14,.7,1,13),cor(px,py,22,14,.3,1,13)],"#1c1612");hip(px,py,22,14,WH+8,10,"#7a4a2f")};
 const CAS=isLon?[cx+64,cy-44,88,66]:[cx+RX*.55,cy-RY2*.5,22+Q*3.5,16+Q*2.4];
 const n=20+Q*12;const placed=[];
 for(let t=0,k=0;k<n&&t<900;t++){const px=cx+(r()-.5)*2*(RX-16),py=cy+(r()-.5)*2*(RY2-10);if(!inside(px,py,14))continue;if(Math.abs(px-cx)<(CF&&CF.cl?CF.cl[0]:42)*(CF&&CF.centre?1.3:1)&&Math.abs(py-cy)<(CF&&CF.cl?CF.cl[1]:20)*(CF&&CF.centre?1.3:1))continue;if(CF&&CF.block&&CF.block(px,py))continue;if(!(CF&&CF.noStreets)){if(Math.abs(px-cx)<SW+14||Math.abs(py-cy)<SW*.5+8)continue;if(Q>=3){const dn=Math.hypot((px-cx)/RX,(py-cy)/RY2);if(Math.abs(dn-RR)<.07+9/RX)continue}}if(Math.abs(px-CAS[0])<CAS[2]&&Math.abs(py-CAS[1])<CAS[3])continue;if(placed.some(q=>Math.abs(q[0]-px)<(q[2]+16)*.8&&Math.abs(q[1]-py)<(q[3]+14)*.5))continue;const a=14+r()*10,b=12+r()*8,h=12+r()*11+tier;placed.push([px,py,a,b]);k++;
  const WL=(CF&&CF.walls)||WALLS,RL=(CF&&CF.roofs)||ROOFS,wc=WL[(r()*WL.length)|0],rc=RL[(r()*RL.length)|0],bm=r()<.45,ch=r()<.5;props.push({y:py,f:()=>house(px,py,a,b,h,wc,rc,{beams:bm,chim:ch,rh:Math.min(a,b)*.55,st:1})})}
 if(CF&&CF.centre)CF.centre().forEach(q=>props.push({y:q.y,f:()=>{const K=1.4;G.save();G.translate(cx,q.y);G.scale(K,K);G.translate(-cx,-q.y);q.f();G.restore()}}));else{
 props.push({y:cy-4,f:()=>{box(cx,cy-4,56,22,26,"#ebe3cf",{stone:1});gable(cx,cy-4,56,22,26,15,"#6a7a8a",{wall:"#ebe3cf"});box(cx+34,cy+8,18,18,52,"#e2d9c2",{stone:1,win:false});hip(cx+34,cy+8,18,18,52,32,"#5d6a7a");flag(cx+34,cy+8-84,12,DCsafe())}});
 props.push({y:cy+18,f:()=>{box(cx-34,cy+18,22,16,20,"#e6d6b0",{beams:1});gable(cx-34,cy+18,22,16,20,11,"#9a3a2a",{wall:"#e6d6b0"});cyl(cx-34,cy+14,3.2,22,"#d8cfb8","#a5312a",9)}});
 for(const t of[-.8,-.6,-.4,.4,.6,.8]){if(Q<3)break;props.push({y:cy+SW*.5+4,f:()=>lamp(cx+t*RX*.9,cy+SW*.5+4)});props.push({y:cy+t*RY2*.9,f:()=>lamp(cx+SW+4,cy+t*RY2*.9)})}
 }
 const subB=[],subF=[];
 if(Q>=3&&window.OKPOSG){const rs=rng(C.id*43+11),P0=OKPOSG,WL=(CF&&CF.walls)||WALLS,RL=(CF&&CF.roofs)||ROOFS,want=(Q-2)*6;let got=0;
  for(let t=0;t<500&&got<want;t++){const a=rs()*6.283,f=1.16+rs()*.26,px=cx+Math.cos(a)*RX*f,py=cy+Math.sin(a)*RY2*f;
   if(px<40||px>1160||py<125||py>560)continue;if(Math.abs(px-cx)<SW+18||Math.abs(py-cy)<SW*.5+12)continue;if(Math.abs(py-RY(px))<RH(px)+26)continue;
   let bad=false;for(const k in P0){if(Math.hypot((P0[k][0]-px)*.8,(P0[k][1]-py)*1.3)<46){bad=true;break}}if(bad)continue;
   if(placed.some(q=>Math.hypot(q[0]-px,(q[1]-py)*2)<30))continue;
   const a2=11+rs()*7,b2=10+rs()*5,h2=9+rs()*7+Q*.6,wc=WL[(rs()*WL.length)|0],rc=RL[(rs()*RL.length)|0],bm=rs()<.5,ch=rs()<.4;placed.push([px,py,a2,b2]);got++;
   (py<cy?subB:subF).push({y:py,f:()=>house(px,py,a2,b2,h2,wc,rc,{beams:bm,chim:ch,rh:Math.min(a2,b2)*.55,st:1})})}
  subB.sort((a,b)=>a.y-b.y);subF.sort((a,b)=>a.y-b.y)}
 props.push({y:CAS[1]+CAS[3]*.5,f:()=>{if(isLon){G.save();G.translate(CAS[0],CAS[1]);G.scale(1.45,1.45);G.translate(-CAS[0],-CAS[1]);palace(CAS[0],CAS[1],KRAL.here());G.restore()}else castle(CAS[0],CAS[1],Q)}});
 props.sort((a,b)=>a.y-b.y);
 return{draw(){
   if(CF&&CF.pre)CF.pre();flo();if(CF&&CF.under)CF.under();
   if(Q>=6)for(let i=0;i<N;i++)if(Math.sin(ring2[i][2])<0&&!gapI(i))wallSeg(i,true,ring2,11);
   subB.forEach(q=>q.f());
   for(let i=0;i<N;i++)if(Math.sin(ring[i][2])<0)wallSeg(i,true);
   for(const i of towers)if(Math.sin(ring[i][2])<-.1)tower(i);
   gate(-Math.PI/2);
   if(Q>=5)for(const i of towers){const j=(i+2)%N;if(Math.sin(ring[j][2])<-.1)turret(j)}
   props.forEach(p=>p.f());
   for(let i=0;i<N;i++)if(Math.sin(ring[i][2])>=0)wallSeg(i,false);
   for(const i of towers)if(Math.sin(ring[i][2])>=-.1)tower(i);
   if(Q>=5)for(const i of towers){const j=(i+2)%N;if(Math.sin(ring[j][2])>=-.1)turret(j)}
   gate(0);gate(Math.PI);gate(Math.PI/2);
   if(Q>=6){for(let i=0;i<N;i++)if(Math.sin(ring2[i][2])>=0&&!gapI(i))wallSeg(i,false,ring2,11);for(let i=2;i<N;i+=4){const p=ring2[i];if(gapI(i))continue;if(Math.sin(p[2])>=-.1)cyl(p[0],p[1],3.6,16,"#c8bfa8",(CF&&CF.tw&&CF.tw.roof)||"#a5312a",7)}}
   subF.forEach(q=>q.f());
   if(ST.night){G.save();G.globalCompositeOperation="lighter";const gr=G.createRadialGradient(cx,cy-10,10,cx,cy-10,RX);gr.addColorStop(0,"rgba(255,170,70,.28)");gr.addColorStop(1,"rgba(255,170,70,0)");G.fillStyle=gr;G.beginPath();G.ellipse(cx,cy-10,RX*1.1,RY2*1.2,0,0,7);G.fill();G.restore()}
   G.save();G.globalAlpha=.3;G.fillStyle="#cfd2d4";placed.slice(0,8).forEach((q,i)=>{const hx=q[0]+4,hy=q[1]-30;G.beginPath();G.arc(hx+i%3,hy-3,2.4,0,7);G.arc(hx+3+i%3,hy-8,3.2,0,7);G.fill()});G.restore();
 }}}
function pond(x,y,own,up){up=up||1;const rx=64+own*5,ry=26+own*2;G.save();
 if(own>=2){G.fillStyle=lit(ST.sn?"#cfd8dc":"#6b5a3a",.9);G.beginPath();G.ellipse(x+rx*.9,y+ry*1.5,rx*.45+3,ry*.5+2,0,0,7);G.fill();G.fillStyle=lit(ST.sn?"#e6f2f8":"#5f9cc4",1);G.beginPath();G.ellipse(x+rx*.9,y+ry*1.5,rx*.45,ry*.5,0,0,7);G.fill()}
 G.fillStyle=lit(ST.sn?"#cfd8dc":"#6b5a3a",.9);G.beginPath();G.ellipse(x,y+3,rx+5,ry+3,0,0,7);G.fill();
 const gr=G.createLinearGradient(0,y-ry,0,y+ry);if(ST.sn){gr.addColorStop(0,"#e6f2f8");gr.addColorStop(1,"#bcd6e4")}else{gr.addColorStop(0,lit("#7fb3d4",1));gr.addColorStop(1,lit("#3f77a2",1))}
 G.fillStyle=gr;G.beginPath();G.ellipse(x,y,rx,ry,0,0,7);G.fill();G.strokeStyle="rgba(20,40,60,.5)";G.lineWidth=.8;G.stroke();
 G.strokeStyle="rgba(255,255,255,.55)";G.lineWidth=.8;for(let i=0;i<12;i++){const a=i*.9,px=x+Math.cos(a)*rx*.6*((i*37%10)/10),py=y+Math.sin(a)*ry*.55*((i*53%10)/10);G.beginPath();G.moveTo(px-5,py);G.lineTo(px+5,py);G.stroke()}
 const r=rng(11);G.strokeStyle=lit("#5a7a3a",1);G.lineWidth=.9;for(let i=0;i<26;i++){const a=r()*6.283,px=x+Math.cos(a)*(rx+1),py=y+Math.sin(a)*(ry+1);for(let k=0;k<3;k++){G.beginPath();G.moveTo(px+k*2,py);G.lineTo(px+k*2+(r()-.5)*3,py-7-r()*4);G.stroke()}G.fillStyle=lit("#8a5a30",1);G.fillRect(px+1,py-10,1.6,3)}
 if(!ST.sn)for(let i=0;i<4;i++){const px=x+(r()-.5)*rx*1.2,py=y+(r()-.5)*ry;G.fillStyle="#f4efe0";G.beginPath();G.ellipse(px,py,2.6,1.6,0,0,7);G.fill();G.fillStyle="#3a6a3a";G.beginPath();G.arc(px+2.4,py-1.4,1,0,7);G.fill()}
 if(up>=2){G.strokeStyle=lit("#9a9284",1);G.lineWidth=4;G.beginPath();G.ellipse(x,y+3,rx+4,ry+2,0,.15*Math.PI,.85*Math.PI);G.stroke();G.strokeStyle="rgba(0,0,0,.4)";G.lineWidth=.6;G.stroke()}
 G.fillStyle=lit("#8a6a40",1);G.fillRect(x+rx-14,y+4,22,3);G.restore();
 return()=>{const bx=x-rx+10,by=y+ry+8;
  house(bx,by,20,15,11,"#9a7a50","#c9a85a",{beams:1,rh:10});
  fence(bx+12,by+14,bx+34,by+20);
  G.save();for(let q=0;q<2;q++){const rx0=bx+22+q*20,ry0=by+22+q*2;G.strokeStyle=lit("#5a3c22",1);G.lineWidth=1.2;G.beginPath();G.moveTo(rx0,ry0);G.lineTo(rx0,ry0-12);G.moveTo(rx0+14,ry0+3);G.lineTo(rx0+14,ry0-9);G.moveTo(rx0-1,ry0-11);G.lineTo(rx0+15,ry0-8);G.stroke();for(let f=0;f<4;f++){const fx=rx0+f*3.6,fy=ry0-9+f*.8;G.fillStyle=lit("#c8d0d8",1);G.beginPath();G.ellipse(fx,fy+2.4,1,2.8,0,0,7);G.fill()}}G.restore();
  G.fillStyle=lit("#6a4a2a",1);G.strokeStyle=INK;G.lineWidth=.4;G.beginPath();G.ellipse(bx-12,by+14,8,3,0,0,7);G.fill();G.stroke();G.fillStyle=lit("#8a6a40",1);G.beginPath();G.ellipse(bx-12,by+12.6,7,2,0,0,7);G.fill();
  G.strokeStyle=lit("#4a3220",1);G.lineWidth=1.1;G.beginPath();for(let q=0;q<4;q++){G.moveTo(x+rx-16+q*7,y+3);G.lineTo(x+rx-16+q*7,y+9)}G.stroke();
  G.fillStyle=lit("#4a3220",1);G.strokeStyle=INK;G.lineWidth=.4;G.beginPath();G.moveTo(x+rx*.5-7,y+ry*.3-1.5);G.quadraticCurveTo(x+rx*.5,y+ry*.3+3,x+rx*.5+7,y+ry*.3-2.5);G.quadraticCurveTo(x+rx*.5,y+ry*.3,x+rx*.5-7,y+ry*.3-1.5);G.fill();G.stroke();
  G.strokeStyle=lit("#5a3c22",1);G.lineWidth=.8;G.beginPath();G.moveTo(x+rx*.5-2,y+ry*.3-1);G.lineTo(x+rx*.5-6,y+ry*.3+4);G.moveTo(x+rx*.5+2,y+ry*.3-1);G.lineTo(x+rx*.5+6,y+ry*.3+3);G.stroke();
  if(own>=1)house(x+rx-4,y+ry+8,14,12,10,"#a07c52","#5a3a28",{rh:7});
  if(own>=2||up>=2){const dx=x+rx*.95,dy=y+ry*.35;box(dx,dy+6,40,9,6,"#a8a194",{tex:"stone",noDoor:1,win:false});G.fillStyle=lit("#8a5a30",1);G.fillRect(dx-6,dy-3,5,8);G.fillRect(dx+1,dy-3,5,8);G.strokeStyle="rgba(255,255,255,.7)";G.lineWidth=.8;for(let q=0;q<3;q++){G.beginPath();G.moveTo(dx+14+q*3,dy+3);G.lineTo(dx+14+q*3,dy+14);G.stroke()}}
  if(up>=3){const sx=x-rx-26,sy=y+8;box(sx,sy,18,14,13,"#8a6a44",{tex:"timber",noDoor:1});hip(sx,sy,18,14,13,9,"#6a4a2f");box(sx+4,sy-16,4,4,8,"#7a6a58",{win:false,noShadow:1});G.save();G.globalAlpha=.3;G.fillStyle="#cfd2d4";G.beginPath();G.arc(sx+6,sy-34,3,0,7);G.arc(sx+9,sy-41,4,0,7);G.fill();G.restore()}}}
function vineyard(x,y,own){const T=3+Math.min(3,own||0);for(let i=0;i<T;i++){const yy=y-34+i*14,xx=x-6+i*7,a=150-i*6,b=14;
   box(xx,yy+8,a,b,6,"#a89c84",{noShadow:1,win:false,tex:"stone",noDoor:1,top:ST.sn?"#e6eef0":"#8a7a4a"});
   const cnt=Math.floor(a/9);G.save();
   for(const jv of[.3,.72]){const p0=cor(xx,yy+8,a,b,.02,jv,6),p1=cor(xx,yy+8,a,b,.98,jv,6);G.strokeStyle="rgba(60,40,20,.5)";G.lineWidth=.35;G.beginPath();G.moveTo(p0[0],p0[1]-3);G.lineTo(p1[0],p1[1]-3);G.moveTo(p0[0],p0[1]-6.5);G.lineTo(p1[0],p1[1]-6.5);G.stroke();
    for(let k=0;k<cnt;k++){const p=cor(xx,yy+8,a,b,(k+.5)/cnt,jv,6);G.strokeStyle=lit("#4a3220",1);G.lineWidth=.8;G.beginPath();G.moveTo(p[0],p[1]);G.lineTo(p[0],p[1]-7.5);G.stroke();
     const vc=ST.sn?"#cfd8dc":ST.se===2?(k%3?"#b8452a":"#d6a030"):ST.se===0?"#8cbc58":"#5a8a3a";G.fillStyle=lit(vc,1);G.beginPath();G.ellipse(p[0],p[1]-6,3.2,2.2,0,0,7);G.fill();G.beginPath();G.ellipse(p[0]-1.6,p[1]-3.6,2.4,1.7,0,0,7);G.fill();
     if(ST.se===1||ST.se===2){G.fillStyle=lit(ST.se===2?"#4a2a6a":"#b8c860",1);G.beginPath();G.arc(p[0]+1.5,p[1]-3.5,.9,0,7);G.arc(p[0]-.6,p[1]-2.6,.8,0,7);G.fill()}}}
   const st=cor(xx,yy+8,a,b,.5,1.02,0);if(i<T-1)for(let q=0;q<3;q++){poly([[st[0]-4,st[1]+q*1.6-.5],[st[0]+4,st[1]+q*1.6-.5],[st[0]+4,st[1]+q*1.6+1],[st[0]-4,st[1]+q*1.6+1]],lit(q%2?"#cfc8b8":"#bdb6a6",1),"rgba(0,0,0,.3)",.3)}
   G.restore()}}
let hayList=[];
function fields(cid){const r=rng(cid*17+5);const ps=[[110,400,70,46],[200,405,64,44],[60,300,60,42],[250,360,52,40],[420,380,70,46],[520,400,62,44],[700,400,56,40],[830,410,60,42],[1010,430,64,44],[1100,420,58,40],[130,540,76,48],[260,552,70,44],[400,545,62,40],[820,550,70,46],[960,548,64,42],[1090,545,70,44],[690,555,58,40],[540,552,60,40]];
 const sum=["#d4b24c","#8fb04a","#c79a3a","#6a9a3a","#a8864a"];
 ps.forEach((p,i)=>{const col=ST.sn?"#eef3f5":ST.se===2?["#b79a58","#8a6a44","#c8a860","#7a5a3a"][i%4]:ST.se===0?["#8fb04a","#8a6a42","#a8c05a","#7a5a3a"][i%4]:sum[i%5];
   isoQuad(p[0],p[1],p[2],p[3],col,{rows:Math.round(p[3]/4.2),dir:i%2?"a":"b",rowCol:ST.sn?"rgba(110,130,150,.35)":"rgba(40,30,10,.3)",rw:.8});
   if((ST.se===1||ST.se===2)&&i%5===0){const hx=p[0]+r()*20,hy=p[1]+8;hayList.push({y:hy,f:()=>hay(hx,hy,1)})}})}
function featProps(k,x,y,own,seedBase,up){const r=rng(seedBase),P=[];const lvl=own||0;up=up||1;const add=(yy,f)=>P.push({y:yy,f});
 if(k==="dedina"){village(x,y,5+lvl*2,seedBase+1,{church:1,well:1,spread:62}).forEach(p=>P.push(p));
   for(let i=0;i<3;i++)add(y+34+i*4,()=>hay(x-60+i*12,y+34+i*4,1));
   if(lvl>=2)add(y+60,()=>{house(x+60,y+58,26,18,16,"#efe6d0","#a5312a",{beams:1});box(x-70,y+56,22,16,12,"#a8885a",{win:false,beams:1});gable(x-70,y+56,22,16,12,9,"#7a4a2f",{wall:"#a8885a"})});
   if(lvl>=3)add(y+44,()=>{for(let i=0;i<4;i++){box(x-10+i*26,y+76,18,10,8,"#9b6a3e",{win:false});poly([[x-16+i*26,y+68],[x-4+i*26,y+68],[x-2+i*26,y+62],[x-14+i*26,y+62]],L2(["#b8362c","#d8b04a","#2b4c8f","#3a7a4a"][i]))}});
   if(lvl>=4)add(y+10,()=>{const px=x-112,py=y+20;G.strokeStyle=lit("#8a8478",1);G.lineWidth=3;G.beginPath();G.moveTo(px,py);G.lineTo(px+24,py-12);G.stroke();cyl(px,py,5,32,"#bfb6a0","#7a4a2f",12)});
   if(up>=2)add(y+8,()=>{cyl(x+88,y+8,7,32,"#e8dfc9","#7a4a2f",12);G.fillStyle="#2b2117";G.fillRect(x+85,y+2,6,8)});
   if(up>=3)add(y-30,()=>{house(x+20,y-46,26,20,16,"#eee6d2","#8a4a2a",{stone:1,chim:1});box(x+44,y-48,10,10,40,"#e2d9c2",{stone:1,win:false});hip(x+44,y-48,10,10,40,18,"#5d6a7a")})}
 else if(k==="vinica"){
   add(y+34,()=>{house(x-52,y+38,26,18,14,"#e8d8b0","#8a3a2a",{stone:1,noDoor:1});poly([[x-60,y+48],[x-50,y+52],[x-50,y+46],[x-60,y+42]],"#2a1c10");
     G.strokeStyle=lit("#5a3c22",1);G.lineWidth=1.6;G.beginPath();G.moveTo(x-34,y+52);G.lineTo(x-34,y+36);G.moveTo(x-22,y+52);G.lineTo(x-22,y+36);G.moveTo(x-36,y+36);G.lineTo(x-20,y+36);G.moveTo(x-28,y+36);G.lineTo(x-28,y+44);G.stroke();G.fillStyle=lit("#8a5a30",1);G.beginPath();G.ellipse(x-28,y+53,9,3.4,0,0,7);G.fill();G.strokeStyle=INK;G.lineWidth=.5;G.stroke();G.fillStyle=lit("#a6407a",1);G.beginPath();G.ellipse(x-28,y+52,6.5,2.2,0,0,7);G.fill();
     for(let q=0;q<3;q++){G.fillStyle=lit("#8a6a40",1);G.beginPath();G.ellipse(x-44+q*5,y+58-q%2*2,3.2,1.7,0,0,7);G.fill();G.fillStyle=lit("#6a2a6a",1);G.beginPath();G.arc(x-44+q*5,y+57.4-q%2*2,1.5,0,7);G.fill()}
     barrel(x-62,y+54,1.2);barrel(x-56,y+57,1.2)});
   if(up>=2)add(y+44,()=>{house(x-4,y+54,34,22,18,"#d8c8a0","#7a3a2a",{stone:1,chim:1});for(let i=0;i<4;i++)barrel(x+30+i*7,y+62-(i%2)*3,1.6)});
   if(up>=3)add(y+60,()=>{house(x+60,y+64,36,24,22,"#efe6d0","#a5402a",{beams:1,chim:1});G.strokeStyle="#4a3220";G.lineWidth=1.3;G.beginPath();G.moveTo(x+42,y+70);G.lineTo(x+42,y+52);G.lineTo(x+32,y+52);G.stroke();poly([[x+28,y+52],[x+36,y+52],[x+36,y+60],[x+28,y+60]],"#d6aa4c","#2b2117",.6)});
   add(y+18,()=>{const cx=x+98,cy=y+14;G.fillStyle=lit(ST.sn?"#e6eef0":"#7fae52",1);G.beginPath();G.ellipse(cx,cy+2,24,9,0,0,7);G.fill();const c0=box(cx,cy,18,8,12,"#cfc6b2",{tex:"stone",noDoor:1,win:false});poly([c0(.3,1,0),c0(.7,1,0),c0(.7,1,7),c0(.62,1,9.4),c0(.5,1,10),c0(.38,1,9.4),c0(.3,1,7)],"#1c1612",INK,.4);poly([c0(.26,1,0),c0(.34,1,0),c0(.34,1,8),c0(.26,1,8)],lit("#8a5a30",FL));poly([c0(.66,1,0),c0(.74,1,0),c0(.74,1,8),c0(.66,1,8)],lit("#8a5a30",FL));barrel(cx-14,cy+12,1.3);barrel(cx-8,cy+14,1.3);barrel(cx+14,cy+13,1.3)});
   P.push(...treeCluster(x+86,y+54,20,10,4,seedBase+2,["oak"]))}
 else if(k==="les"){
   P.push(...treeCluster(x,y,115,52,34+lvl*6,seedBase+3,["pine","pine","oak","oak","pine","bush"]));
   add(y-18,()=>{G.save();G.fillStyle="rgba(50,35,15,.22)";G.beginPath();G.ellipse(x+4,y+30,112,44,0,0,7);G.fill();G.restore();const rb=rng(seedBase+21);for(let q=0;q<10;q++){const px=x-80+rb()*160,py=y+rb()*60;G.fillStyle=lit("#7a5a38",1);G.beginPath();G.ellipse(px,py,3.2,1.6,0,0,7);G.fill();G.fillStyle=lit("#c9a870",1);G.beginPath();G.ellipse(px,py-1.4,2.7,1.2,0,0,7);G.fill()}for(let q=0;q<7;q++){const px=x-90+rb()*180,py=y+10+rb()*60;G.fillStyle="#f2ead8";G.fillRect(px,py-3,1.1,3);G.fillStyle="#b8452a";G.beginPath();G.ellipse(px+.5,py-3.2,2,1.2,0,0,7);G.fill()}});
   add(y+54,()=>{box(x+10,y+60,24,18,13,"#9a6a3c",{tex:"log",noDoor:1,win:false});gable(x+10,y+60,24,18,13,10,"#6a4a2f",{wall:"#9a6a3c",chim:1});poly([[x+8,y+66],[x+14,y+68.5],[x+14,y+61],[x+8,y+58.5]],"#2a1c10");
     for(let q=0;q<3;q++)for(let w=0;w<5-q;w++){G.fillStyle=lit(w%2?"#a8804c":"#8a6a40",1);G.beginPath();G.ellipse(x-34+w*3.6+q*1.8,y+70-q*3.4,1.7,1.7,0,0,7);G.fill();G.strokeStyle="rgba(30,15,5,.5)";G.lineWidth=.3;G.stroke()}
     G.fillStyle=lit("#6a4a2a",1);G.fillRect(x-36,y+71,20,1.4)});
   add(y+60,()=>{const mx=x-70,my=y+66;G.fillStyle=lit("#4a3a2a",1);G.beginPath();G.ellipse(mx,my,15,6,0,0,Math.PI,true);G.lineTo(mx+15,my);G.closePath();G.fill();G.strokeStyle=INK;G.lineWidth=.5;G.stroke();G.fillStyle=lit("#6a7a3a",.8);G.beginPath();G.ellipse(mx-3,my-3,7,2.4,0,0,7);G.fill();G.save();G.globalAlpha=.28;G.fillStyle="#cfd2d4";G.beginPath();G.arc(mx+2,my-9,3,0,7);G.arc(mx+5,my-15,4,0,7);G.fill();G.restore()});
   if(lvl>=1)add(y+70,()=>{box(x+62,y+64,26,18,16,"#8a6a44",{tex:"log",noDoor:1});gable(x+62,y+64,26,18,16,12,"#6a3a28",{wall:"#8a6a44",chim:1});flag(x+62,y+46,34,DCsafe())});
   if(up>=2)add(y+78,()=>{const sx=x-84,sy=y+84;G.strokeStyle=lit("#4a3220",1);G.lineWidth=2.2;G.beginPath();G.moveTo(sx,sy);G.lineTo(sx,sy-22);G.lineTo(sx+44,sy-22);G.lineTo(sx+44,sy);G.moveTo(sx+4,sy-22);G.lineTo(sx+4,sy);G.moveTo(sx+40,sy-22);G.lineTo(sx+40,sy);G.stroke();poly([[sx+6,sy-16],[sx+38,sy-16],[sx+38,sy-12],[sx+6,sy-12]],lit("#c8c8d0",1),INK,.5);for(let q=0;q<5;q++){G.fillStyle=lit("#b08a58",1);G.beginPath();G.ellipse(sx+10+q*7,sy+3-(q%2)*3,5,2.2,0,0,7);G.fill();G.strokeStyle=INK;G.lineWidth=.3;G.stroke()}for(let q=0;q<3;q++){G.fillStyle=lit("#d6bb8a",1);G.fillRect(sx+48+q*2,sy-6-q*2.6,14,2.4)}});
   if(up>=3)add(y+66,()=>{box(x+112,y+68,40,28,22,"#8a6a44",{tex:"log",noDoor:1});gable(x+112,y+68,40,28,22,16,"#6a3a28",{wall:"#8a6a44",chim:1});flag(x+130,y+30,22,DCsafe());G.strokeStyle="#e8dfc9";G.lineWidth=1.1;const c1=cor(x+112,y+68,40,28,.3,1,18);G.beginPath();G.moveTo(c1[0]-4,c1[1]);G.lineTo(c1[0]-2,c1[1]-5);G.lineTo(c1[0]+2,c1[1]-5);G.lineTo(c1[0]+4,c1[1]);G.moveTo(c1[0]-1,c1[1]-5);G.lineTo(c1[0]-3,c1[1]-8);G.moveTo(c1[0]+1,c1[1]-5);G.lineTo(c1[0]+3,c1[1]-8);G.stroke()})}
 else if(k==="salas"){
   add(y+10,()=>{box(x-18,y+14,26,18,9,"#9a7a50",{tex:"log",noDoor:1,win:false});gable(x-18,y+14,26,18,9,15,"#7a5a3a",{wall:"#9a7a50",chim:1});poly([[x-22,y+22],[x-16,y+25],[x-16,y+18],[x-22,y+15]],"#2a1c10");
     const rb=rng(seedBase+13);for(let q=0;q<4;q++){G.fillStyle=lit("#8a8478",1);G.beginPath();G.ellipse(x-46+rb()*12,y+30+rb()*8,3+rb()*3,2+rb()*1.5,0,0,7);G.fill();G.strokeStyle=INK;G.lineWidth=.35;G.stroke()}});
   add(y+22,()=>{const wd=64+(lvl>=2?36:0);const q=[[x+14,y+10],[x+14+wd,y+10],[x+14+wd,y+34],[x+14,y+34]];G.fillStyle=lit(ST.sn?"#e6eef0":"#9cba66",1);G.beginPath();q.forEach((p,i)=>i?G.lineTo(p[0],p[1]):G.moveTo(p[0],p[1]));G.closePath();G.fill();
     G.strokeStyle=lit("#6a4a2a",1);G.lineWidth=.8;for(let e=0;e<4;e++){const a=q[e],b=q[(e+1)%4];const n=Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/4);G.beginPath();for(let k2=0;k2<=n;k2++){const px=a[0]+(b[0]-a[0])*k2/n,py=a[1]+(b[1]-a[1])*k2/n;G.moveTo(px,py);G.lineTo(px,py-4.5)}G.stroke();G.beginPath();G.moveTo(a[0],a[1]-3.4);G.lineTo(b[0],b[1]-3.4);G.moveTo(a[0],a[1]-1.4);G.lineTo(b[0],b[1]-1.4);G.stroke()}
     hay(x+20,y+30,.8);G.fillStyle=lit("#6a4a2a",1);G.fillRect(x+30,y+14,14,2.4);G.fillRect(x+31,y+16,1.2,3);G.fillRect(x+42,y+16,1.2,3)});
   if(up>=2)add(y+50,()=>{house(x-56,y+54,26,18,14,"#efe6d0","#8a4a2a",{stone:1,noDoor:1});for(let q=0;q<2;q++){G.strokeStyle=lit("#6a4a2a",1);G.lineWidth=1.1;G.beginPath();G.moveTo(x-26,y+66-q*7);G.lineTo(x-4,y+66-q*7);G.stroke();for(let w=0;w<4;w++){G.fillStyle=lit("#e8c860",1);G.beginPath();G.ellipse(x-23+w*5.4,y+64-q*7,2.2,1.6,0,0,7);G.fill();G.strokeStyle="rgba(0,0,0,.45)";G.lineWidth=.35;G.stroke()}}barrel(x-60,y+70,1.2);barrel(x-54,y+72,1.2)});
   P.push(...treeCluster(x-70,y+8,16,8,4,seedBase+4,["pine"]))}
 else if(k==="letohradok"){
   add(y,()=>{isoQuad(x,y+16,170,86,ST.sn?"#e6eef0":"#7fae52",{rows:6,dir:"b",rowCol:"rgba(30,70,20,.22)"});
     isoQuad(x,y+34,14,66,ST.sn?"#e8eaea":"#d8cfb4",{f:1,edge:"rgba(40,30,10,.3)"});isoQuad(x,y+34,100,12,ST.sn?"#e8eaea":"#d8cfb4",{f:1,edge:"rgba(40,30,10,.3)"});
     const bd=(bx,by)=>{isoQuad(bx,by,34,14,ST.sn?"#dfe8ea":"#5f9a3c",{f:1,edge:"rgba(20,50,10,.6)"});if(!ST.sn)for(let q=0;q<6;q++){G.fillStyle=["#e04a5a","#f0c84a","#c070d0","#f4f0e0"][(q+bx|0)%4];G.beginPath();G.arc(bx-12+q*5,by-1+(q%2)*2,1.1,0,7);G.fill()}};
     bd(x-40,y+22);bd(x+40,y+22);bd(x-40,y+48);bd(x+40,y+48)});
   add(y+4,()=>{box(x,y-6,64,30,26,"#efe6d0",{tex:"stone",noDoor:1});gable(x,y-6,64,30,26,18,"#7a8a96",{wall:"#efe6d0",chim:1});
     const c0=cor(x,y-6,64,30,.5,1,0);for(let q=0;q<3;q++)poly([[c0[0]-9+q*0,c0[1]+q*2],[c0[0]+9,c0[1]+q*2],[c0[0]+9,c0[1]+q*2+2],[c0[0]-9,c0[1]+q*2+2]],lit("#d8cfb8",1),"rgba(0,0,0,.3)",.3);
     cyl(x-34,y+4,7,40,"#e6dcc4","#7a8a96",18);cyl(x+34,y-14,7,40,"#e6dcc4","#7a8a96",18);if(own)flag(x,y-6-44,26,DCsafe())});
   add(y+22,()=>{for(const[tx,ty]of[[x-8,y+34],[x+8,y+34],[x-8,y+54],[x+8,y+54]]){G.fillStyle=lit("#5a3c22",1);G.fillRect(tx-.6,ty-4,1.2,5);blob(tx,ty-7,3.6,"#3f7a2a")}});
   if(up>=2)add(y+42,()=>{G.fillStyle=lit("#9a9284",1);G.beginPath();G.ellipse(x,y+43,18,8,0,0,7);G.fill();G.strokeStyle=INK;G.lineWidth=.5;G.stroke();G.fillStyle=lit(ST.sn?"#dfeef6":"#6fa6cc",1);G.beginPath();G.ellipse(x,y+42,14.5,6,0,0,7);G.fill();G.fillStyle=lit("#bfb6a0",1);G.fillRect(x-2,y+30,4,12);G.beginPath();G.ellipse(x,y+30,6,2.4,0,0,7);G.fill();G.strokeStyle="rgba(255,255,255,.85)";G.lineWidth=1;for(const dx of[-4,0,4]){G.beginPath();G.moveTo(x,y+28);G.quadraticCurveTo(x+dx*1.5,y+22,x+dx*2.4,y+36);G.stroke()}});
   if(up>=3)add(y+50,()=>{const gx=x+76,gy=y+36;box(gx,gy,40,26,16,"#bfe0ee",{win:false,top:"#d8eef6",noDoor:1});for(let q=0;q<5;q++){const p=cor(gx,gy,40,26,(q+.5)/5,1,0);poly([[p[0]-3,p[1]],[p[0]+3,p[1]],[p[0]+3,p[1]-10],[p[0],p[1]-13],[p[0]-3,p[1]-10]],lit("#4f8a38",.9),"rgba(255,255,255,.7)",.5)}});
   P.push(...treeCluster(x+96,y+16,18,12,5,seedBase+5,["oak","bush"]))}
 else if(k==="klastor"){
   {const X=x+40,Y=y+28,S=26,o=(u,v)=>[X+(u-v)*.5,Y+(u+v)*.25];
    add(Y-30,()=>{isoQuad(X,Y,2*S+10,2*S+10,ST.sn?"#e4ecee":"#9ec26a",{rows:7,dir:"a",rowCol:"rgba(30,70,20,.2)"})});
    add(Y-12,()=>{for(let q=-1;q<=1;q+=2)for(let w=-1;w<=1;w+=2){const p=o(q*11,w*11);isoQuad(p[0],p[1],9,9,"#7a5a38",{f:1,edge:"rgba(0,0,0,.4)"});G.fillStyle=lit("#5a8a3a",1);G.fillRect(p[0]-3,p[1]-1,6,1.4)}cyl(X,Y+3,4,4,"#bfb6a0");G.fillStyle=lit(ST.sn?"#dfeef6":"#5f9cc4",1);G.beginPath();G.ellipse(X,Y-.6,2.6,1.2,0,0,7);G.fill()});
    const wing=(p,a,b)=>{box(p[0],p[1],a,b,12,"#e8dfc9",{tex:"stone",noDoor:1});hip(p[0],p[1],a,b,12,5,"#8a4a2a")};
    const A=o(0,-S),B=o(0,S),C=o(-S,0),D=o(S,0);
    add(A[1],()=>wing(A,2*S+8,8));add(C[1],()=>wing(C,8,2*S));add(D[1],()=>wing(D,8,2*S));add(B[1]+2,()=>wing(B,2*S+8,8))}
   add(y-2,()=>{const c0=box(x-30,y-4,56,24,24,"#e8dfc9",{tex:"stone",noDoor:1});gable(x-30,y-4,56,24,24,15,"#5d6a7a",{wall:"#e8dfc9"});
     poly([c0(.5,1,0),c0(.5,1,12),c0(.44,1,14),c0(.38,1,12),c0(.38,1,0)],lit("#4a3220",FL),INK,.4);
     for(const u of[.14,.82]){poly([c0(u,1,10),c0(u+.07,1,10),c0(u+.07,1,19),c0(u+.035,1,21),c0(u,1,19)],lit("#2b3140",FL),lit("#efe6d0",FL),.5)}
     cyl(x-12,y+4,10,20,"#e8dfc9","#5d6a7a",12);
     box(x-66,y+8,14,14,40,"#e2d9c2",{tex:"stone",noDoor:1,win:false});box(x-66,y-32,10,10,12,"#e2d9c2",{tex:"stone",noDoor:1});hip(x-66,y-32,10,10,12,16,"#5d6a7a");
     for(const dx of[-2.5,2.5]){G.fillStyle="#2b2117";G.beginPath();G.ellipse(x-66+dx*.5,y-33,1.4,2.6,0,0,7);G.fill()}
     G.strokeStyle="#d6aa4c";G.lineWidth=1.5;G.beginPath();G.moveTo(x-66,y-60);G.lineTo(x-66,y-69);G.moveTo(x-70,y-65);G.lineTo(x-62,y-65);G.stroke()})}
 else if(k==="hostinec"){
   add(y+26,()=>{isoQuad(x+22,y+34,70,36,ST.sn?"#e6eef0":"#bdb29c",{f:1,edge:"rgba(40,30,10,.4)"});G.save();G.globalAlpha=.22;G.strokeStyle="#000";G.lineWidth=.4;for(let q=0;q<8;q++){G.beginPath();G.ellipse(x+8+q*7,y+30+(q%3)*4,3,1.4,0,0,7);G.stroke()}G.restore()});
   add(y,()=>{const c0=box(x,y,44,28,10,"#d8cfb8",{tex:"stone",noDoor:1,win:false});
     poly([c0(.14,1,0),c0(.3,1,0),c0(.3,1,8),c0(.22,1,10),c0(.14,1,8)],lit("#3a2a1c",FL),INK,.4);
     box(x,y-10,46,30,16,"#efe6d0",{tex:"timber",noDoor:1});gable(x,y-10,46,30,16,17,"#9a3a2a",{wall:"#efe6d0",chim:1});
     const aw=[[x-22,y+10],[x-8,y+16],[x-8,y+10],[x-22,y+4]];poly([[x-22,y+2],[x-6,y+9],[x-6,y+12],[x-22,y+5]],lit("#8a5a33",1),INK,.4);
     G.strokeStyle="#4a3220";G.lineWidth=1.3;G.beginPath();G.moveTo(x+14,y+14);G.lineTo(x+14,y-6);G.lineTo(x+28,y-2);G.stroke();G.lineWidth=.6;G.beginPath();G.moveTo(x+20,y-4);G.lineTo(x+20,y);G.moveTo(x+26,y-3);G.lineTo(x+26,y+1);G.stroke();
     poly([[x+17,y],[x+29,y+4],[x+29,y+12],[x+17,y+8]],lit("#d6aa4c",1),"#2b2117",.6);G.fillStyle="#7a3a1c";G.beginPath();G.arc(x+23,y+6.4,2.2,0,7);G.fill()});
   add(y+16,()=>{house(x+50,y+16,28,22,11,"#8a6a44","#6a4a2f",{beams:1,noDoor:1,rh:9});G.fillStyle="#1c1612";G.fillRect(x+46,y+22,5,6)});
   add(y+40,()=>{const hs=(hx,hy,col,fl)=>{G.save();G.translate(hx,hy);G.scale(fl,1);G.fillStyle=lit(col,1);G.strokeStyle="rgba(20,10,0,.55)";G.lineWidth=.4;G.beginPath();G.ellipse(0,-5,5.4,2.4,0,0,7);G.fill();G.stroke();G.beginPath();G.moveTo(3.6,-6);G.lineTo(6.4,-9.4);G.lineTo(8.6,-8.4);G.lineTo(5.6,-4.4);G.closePath();G.fill();G.stroke();G.strokeStyle=lit(col,.7);G.lineWidth=.9;for(const lx of[-3.6,-1.6,2,3.8]){G.beginPath();G.moveTo(lx,-3.4);G.lineTo(lx,0);G.stroke()}G.strokeStyle="#2b1a0e";G.lineWidth=.9;G.beginPath();G.moveTo(-5,-5.4);G.lineTo(-7,-2.4);G.stroke();G.restore()};hs(x+6,y+46,"#7a4a2a",1);hs(x+22,y+48,"#b0a090",-1);
     G.strokeStyle=lit("#4a3220",1);G.lineWidth=1.4;G.beginPath();G.moveTo(x-4,y+46);G.lineTo(x+32,y+50);G.moveTo(x-2,y+46);G.lineTo(x-2,y+52);G.moveTo(x+30,y+50);G.lineTo(x+30,y+56);G.stroke();
     cyl(x+40,y+40,5,5,"#bfb6a0");G.strokeStyle="#4a3220";G.lineWidth=1;G.beginPath();G.moveTo(x+36,y+38);G.lineTo(x+36,y+28);G.lineTo(x+44,y+28);G.lineTo(x+44,y+38);G.stroke();
     barrel(x-18,y+36,1.3);barrel(x-12,y+39,1.3);barrel(x-24,y+39,1.3)});
   P.push(...treeCluster(x-64,y+12,14,8,3,seedBase+6,["oak"]))}
 else if(k==="mlyn"){
   add(y-10,()=>{const wt=ST.sn?"#dfeef6":"#5f9cc4";G.fillStyle=lit(ST.sn?"#cfd8dc":"#6b5a3a",.9);G.beginPath();G.ellipse(x+54,y-14,25,9,0,0,7);G.fill();G.fillStyle=lit(wt,1);G.beginPath();G.ellipse(x+54,y-15,22,7,0,0,7);G.fill();G.strokeStyle="rgba(255,255,255,.5)";G.lineWidth=.6;for(let q=0;q<3;q++){G.beginPath();G.moveTo(x+44+q*7,y-15+q%2*2);G.lineTo(x+50+q*7,y-15+q%2*2);G.stroke()}});
   add(y,()=>{const c0=box(x,y,38,30,9,"#cfc6b2",{tex:"stone",noDoor:1,win:false});
     poly([c0(.4,1,0),c0(.6,1,0),c0(.6,1,7),c0(.4,1,7)],lit("#3a2a1c",FL),INK,.4);
     box(x,y-9,36,28,15,"#efe6d0",{tex:"timber",noDoor:1});
     gable(x,y-9,36,28,15,17,"#8a4a2a",{wall:"#efe6d0",chim:1});
     G.strokeStyle=lit("#4a3220",1);G.lineWidth=1.6;G.beginPath();G.moveTo(x-3,y-33);G.lineTo(x-17,y-29);G.stroke();G.lineWidth=.6;G.beginPath();G.moveTo(x-17,y-29);G.lineTo(x-17,y-17);G.stroke();sack(x-17,y-15);
     for(let i=0;i<4;i++){G.fillStyle=lit("#e8dfc9",.95-i*.04);G.beginPath();G.ellipse(x-14+i*3,y+30+i*1.4,5,2.4,0,0,7);G.fill();G.strokeStyle=INK;G.lineWidth=.4;G.stroke()}
     for(let i=0;i<3;i++)sack(x-30+i*6,y+22);
     G.fillStyle=lit("#9a7a50",1);G.strokeStyle="rgba(30,20,10,.55)";G.lineWidth=.5;G.beginPath();G.moveTo(x+46,y-9);G.lineTo(x+50,y-7);G.lineTo(x+30,y+4);G.lineTo(x+26,y+2);G.closePath();G.fill();G.stroke();
     G.strokeStyle="rgba(0,0,0,.3)";G.lineWidth=.4;for(let q=0;q<5;q++){const t=q/5;G.beginPath();G.moveTo(x+46-20*t,y-9+11*t);G.lineTo(x+50-20*t,y-7+11*t);G.stroke()}
     G.strokeStyle=lit("#5a3c22",1);G.lineWidth=1.3;G.beginPath();G.moveTo(x+44,y-3);G.lineTo(x+44,y+7);G.moveTo(x+34,y+2);G.lineTo(x+34,y+9);G.stroke()})}
 else if(k==="lom"){
   add(y-26,()=>{const rb=rng(seedBase+9),pts=[];for(let q=0;q<=16;q++)pts.push([x-72+q*9,y-54-rb()*9-(q>3&&q<12?7:0)]);
     const g=G.createLinearGradient(0,y-66,0,y-8);g.addColorStop(0,lit("#cfc7b6",1));g.addColorStop(1,lit("#7d766a",1));
     G.save();G.fillStyle=lit(ST.sn?"#dde4e6":"#a89878",.9);G.beginPath();G.ellipse(x-2,y+16,92,34,0,0,7);G.fill();G.fillStyle=lit(ST.sn?"#cfd8dc":"#8f7f62",.8);G.beginPath();G.ellipse(x-2,y+20,70,22,0,0,7);G.fill();G.restore();
     G.fillStyle=g;G.beginPath();G.moveTo(x-58,y-3);pts.forEach(p=>G.lineTo(p[0],p[1]));G.lineTo(x+58,y-3);G.quadraticCurveTo(x+30,y+1,x,y-1);G.quadraticCurveTo(x-30,y-4,x-58,y-3);G.closePath();G.fill();
     G.save();G.clip();G.strokeStyle="rgba(30,20,10,.24)";G.lineWidth=.7;for(let q=1;q<6;q++){G.beginPath();for(let px=x-72;px<=x+72;px+=10){const yy=y-56+q*9+Math.sin(px/17+q)*2.4;px===x-72?G.moveTo(px,yy):G.lineTo(px,yy)}G.stroke()}
     G.lineWidth=.6;for(let q=0;q<9;q++){const px=x-62+q*15+rb()*6,py=y-52+rb()*10;G.beginPath();G.moveTo(px,py);G.lineTo(px+(rb()-.5)*5,py+10+rb()*12);G.stroke()}
     const sg=G.createLinearGradient(x-72,0,x+72,0);sg.addColorStop(0,"rgba(255,255,255,.12)");sg.addColorStop(1,"rgba(0,0,0,.22)");G.fillStyle=sg;G.fillRect(x-72,y-70,144,70);const bg=G.createLinearGradient(0,y-16,0,y);bg.addColorStop(0,"rgba(30,20,10,0)");bg.addColorStop(1,"rgba(30,20,10,.38)");G.fillStyle=bg;G.fillRect(x-72,y-16,144,16);G.restore();
     G.strokeStyle=INK;G.lineWidth=.7;G.stroke();
     pts.forEach((p,q)=>{if(q%3===1){G.fillStyle=lit("#6f9c42",1);G.beginPath();G.ellipse(p[0],p[1]+1,7,2.6,0,0,7);G.fill()}});
     for(let q=0;q<14;q++){G.fillStyle=lit(q%3?"#9a9284":"#b6ae9e",1);G.beginPath();G.ellipse(x-62+q*9.5+rb()*6,y-4+rb()*7,2.6+rb()*3.4,1.7+rb()*1.2,0,0,7);G.fill();G.strokeStyle=INK;G.lineWidth=.35;G.stroke()}});
   add(y,()=>{box(x,y+18,118,40,5,"#bdb6a8",{win:false,tex:"stone",noDoor:1});box(x+4,y+6,90,32,9,"#a8a194",{win:false,tex:"stone",noDoor:1});box(x+8,y-6,64,24,13,"#948d7f",{win:false,tex:"stone",noDoor:1})});
   add(y+22,()=>{const rb=rng(seedBase+11);for(let q=0;q<7;q++)box(x-52+rb()*100,y+18+rb()*18,8+rb()*8,6+rb()*5,4+rb()*4,"#d4cdbd",{win:false,tex:"stone",noDoor:1});
     G.strokeStyle=lit("#5a3c22",1);G.lineWidth=1;G.beginPath();G.moveTo(x-30,y+30);G.lineTo(x-90,y+56);G.moveTo(x-18,y+36);G.lineTo(x-78,y+62);G.stroke();G.lineWidth=2;for(let q=0;q<7;q++){const px=x-30-q*10,py=y+30+q*3.8;G.beginPath();G.moveTo(px+2,py+1);G.lineTo(px-1,py+7);G.stroke()}
     G.save();G.globalAlpha=.22;G.fillStyle="#e8e0cc";for(let q=0;q<5;q++){G.beginPath();G.ellipse(x-30+q*16,y+24+(q%2)*6,9,3,0,0,7);G.fill()}G.restore()});
   add(y+6,()=>{const cx=x+54,cy=y+22;G.strokeStyle=lit("#4a3220",1);G.lineWidth=2.2;G.beginPath();G.moveTo(cx-14,cy+6);G.lineTo(cx,cy-34);G.lineTo(cx+14,cy+6);G.moveTo(cx-8,cy-8);G.lineTo(cx+8,cy-8);G.stroke();
     G.lineWidth=1.3;G.beginPath();G.ellipse(cx,cy-18,10,10,0,0,7);G.stroke();for(let q=0;q<8;q++){const a=q/8*6.283;G.beginPath();G.moveTo(cx,cy-18);G.lineTo(cx+Math.cos(a)*10,cy-18+Math.sin(a)*10);G.stroke()}
     G.lineWidth=.8;G.beginPath();G.moveTo(cx-10,cy-18);G.lineTo(cx-18,cy+4);G.stroke();box(cx-22,cy+8,12,9,8,"#e0dacb",{win:false,tex:"stone",noDoor:1})});
   add(y+54,()=>{house(x-68,y+58,26,18,14,"#9a7a50","#6a4a2f",{beams:1,noDoor:1});barrel(x-46,y+64,1.2);barrel(x-40,y+66,1.2)})}
 growth(k,x,y,add,P,seedBase);return P}

/* rast neobchodovateľných miest podľa veľkosti mesta (GROW 0..3) */
let GROW=0;
function growth(k,x,y,add,P,sd){const g=GROW;if(!g)return;
 if(k==="mlyn"){
  add(y+36,()=>{box(x+36,y+30,22,16,10,"#9a7a50",{win:false,beams:1});for(let i=0;i<4;i++)sack(x+26+i*5,y+40);G.fillStyle=lit("#8a6a40",1);G.fillRect(x+44,y+38,16,3)});
  if(g>=2)add(y+28,()=>{box(x-52,y+22,30,22,18,"#d8cfb8",{stone:1});gable(x-52,y+22,30,22,18,11,"#8a4a2a",{wall:"#d8cfb8"});G.fillStyle=lit(ST.sn?"#dfeef6":"#5f9cc4",.9);G.beginPath();G.ellipse(x-24,y+44,22,5,0,0,7);G.fill();G.strokeStyle="rgba(20,40,60,.5)";G.lineWidth=.6;G.stroke()});
  if(g>=3)add(y+58,()=>{house(x+74,y+54,30,22,18,"#efe6d0","#8a4a2a",{beams:1,chim:1});for(let i=0;i<3;i++){G.strokeStyle=lit("#5a3c22",1);G.lineWidth=1.2;G.beginPath();G.moveTo(x+30+i*10,y+70);G.lineTo(x+30+i*10,y+58);G.stroke()}G.fillStyle=lit("#e8dfc9",.9);G.fillRect(x+28,y+57,28,2.5)})}
 else if(k==="lom"){
  const crane=(cx,cy,s)=>{G.strokeStyle=lit("#4a3220",1);G.lineWidth=2*s;G.beginPath();G.moveTo(cx,cy);G.lineTo(cx,cy-28*s);G.lineTo(cx+22*s,cy-18*s);G.moveTo(cx,cy);G.lineTo(cx+10*s,cy-4*s);G.stroke();G.lineWidth=.8;G.beginPath();G.moveTo(cx+22*s,cy-18*s);G.lineTo(cx+22*s,cy-6*s);G.stroke();box(cx+22*s-3,cy-4*s,6,5,5,"#cfc8b8",{win:false,noShadow:1})};
  add(y+22,()=>{crane(x-34,y+22,1);box(x-14,y+30,12,8,7,"#d8d0bf",{win:false});box(x-2,y+32,10,8,6,"#cfc8b8",{win:false})});
  if(g>=2)add(y+46,()=>{house(x+80,y+44,26,18,14,"#9a7a50","#6a4a2f",{beams:1});box(x+52,y+50,24,14,9,"#8a5a30",{win:false,beams:1});G.fillStyle="#2b2117";G.beginPath();G.arc(x+54,y+60,3,0,7);G.arc(x+72,y+60,3,0,7);G.fill();box(x+60,y+46,12,8,7,"#d4ccba",{win:false,noShadow:1})});
  if(g>=3)add(y+66,()=>{crane(x-70,y+62,.9);for(let i=0;i<3;i++)for(let j=0;j<=i;j++)box(x-30+i*16,y+68-j*6,12,8,6,"#e0dacb",{win:false});flag(x+96,y+20,24,DCsafe())})}
 else if(k==="klastor"){
  add(y+64,()=>{G.strokeStyle=lit("#b9b09c",1);G.lineWidth=3;G.beginPath();G.moveTo(x-78,y+52);G.lineTo(x-78,y+74);G.lineTo(x+62,y+74);G.lineTo(x+62,y+50);G.stroke();G.strokeStyle="rgba(0,0,0,.4)";G.lineWidth=.6;G.stroke();for(let i=0;i<7;i++)box(x-78+i*22,y+75,4,4,5,"#b9b09c",{win:false,noShadow:1})});
  if(g>=2)add(y+40,()=>{house(x+86,y+34,20,14,12,"#e8dfc9","#8a4a2a",{stone:1});for(let i=0;i<3;i++){const hx=x+62+i*8,hy=y+60;box(hx,hy,6,5,5,"#d8b04a",{win:false,noShadow:1})}});
  if(g>=3)add(y+8,()=>{box(x-96,y+14,14,14,36,"#e2d9c2",{stone:1,win:false});hip(x-96,y+14,14,14,36,16,"#5d6a7a");house(x+64,y-8,28,18,14,"#eee6d2","#a5312a",{stone:1});for(let i=0;i<5;i++)tree(x+24+i*10,y+84,.7,"oak",sd+i)})}
 else if(k==="hostinec"){
  add(y+30,()=>{box(x-40,y+26,24,16,12,"#8a6a44",{win:false,beams:1});gable(x-40,y+26,24,16,12,8,"#6a4a2f",{wall:"#8a6a44"});G.strokeStyle=lit("#4a3220",1);G.lineWidth=1.4;G.beginPath();G.moveTo(x-22,y+42);G.lineTo(x-4,y+42);G.moveTo(x-20,y+42);G.lineTo(x-20,y+36);G.moveTo(x-6,y+42);G.lineTo(x-6,y+36);G.stroke()});
  if(g>=2)add(y+46,()=>{for(let i=0;i<2;i++){const tx=x+6+i*18,ty=y+48;G.fillStyle=lit("#a07c52",1);G.fillRect(tx-6,ty-4,12,3);G.fillRect(tx-5,ty-1,2,5);G.fillRect(tx+3,ty-1,2,5);person(tx-4,ty-6,["#2b4c8f","#8a3a2a"][i])}house(x+58,y+22,24,18,15,"#efe6d0","#9a3a2a",{beams:1,chim:1})});
  if(g>=3)add(y+58,()=>{box(x+8,y+60,4,16,7,"#b9b09c",{stone:1,win:false});box(x+70,y+60,4,16,7,"#b9b09c",{stone:1,win:false});box(x+39,y+64,64,4,4,"#b9b09c",{win:false,noShadow:1});box(x+22,y+54,22,12,8,"#8a5a30",{win:false,beams:1});G.fillStyle="#2b2117";G.beginPath();G.arc(x+26,y+62,2.6,0,7);G.arc(x+40,y+62,2.6,0,7);G.fill();flag(x+39,y+34,24,DCsafe())})}
}
const L2=h=>lit(h,1);

/* ---------- NÁVRH (okolie): krajina, Dunaj, cesty, mraky ---------- */
function pFree(pos,x,y,r){for(const k in pos){if(Math.hypot((pos[k][0]-x)*.8,(pos[k][1]-y)*1.3)<r+22)return false}if(((x-600)/270)**2+((y-285)/138)**2<1)return false;if(Math.abs(y-RY(x))<RH(x)+30)return false;if(y<108||y>H-18||x<30||x>W-30)return false;return true}
function pSign(x,y,txt){G.save();G.strokeStyle=lit("#4a3220",1);G.lineWidth=2;G.beginPath();G.moveTo(x,y);G.lineTo(x,y-28);G.stroke();poly([[x-3,y-27],[x+58,y-30],[x+62,y-19],[x-3,y-16]],lit("#c4a56c",1),INK,.7);G.fillStyle="#2b2117";G.font="bold 10px Georgia,serif";G.textAlign="left";G.fillText(txt,x+1,y-20.5);G.restore()}
function protoLand(pos,cid){const r=rng(cid*7+91);
 for(let i=0;i<26;i++){const x=r()*W,y=110+r()*(H-130),rx=70+r()*100,ry=24+r()*28;G.save();G.translate(x,y);G.scale(1,ry/rx);let g=G.createRadialGradient(rx*.22,rx*.3,2,rx*.22,rx*.3,rx);g.addColorStop(0,"rgba(30,50,20,.16)");g.addColorStop(1,"rgba(30,50,20,0)");G.fillStyle=g;G.beginPath();G.arc(rx*.22,rx*.3,rx,0,7);G.fill();g=G.createRadialGradient(-rx*.2,-rx*.28,2,-rx*.2,-rx*.28,rx*.9);g.addColorStop(0,"rgba(255,250,200,.2)");g.addColorStop(1,"rgba(255,250,200,0)");G.fillStyle=g;G.beginPath();G.arc(-rx*.2,-rx*.28,rx*.9,0,7);G.fill();G.restore()}
 const pal=ST.sn?["#eef3f5","#e4ecef"]:ST.se===2?["#b79a58","#8a6a44","#c8a860","#9a7a46","#a89048"]:ST.se===0?["#8fb04a","#8a6a42","#a8c05a","#7a9a40","#b0b858"]:["#d9bd55","#9cbc54","#c79a3a","#7aa844","#b8a050","#e0cf70","#6a9a3a"];
 const ps=[];for(let t=0;t<600&&ps.length<(8+ST.rq*4);t++){const x=40+r()*(W-80),y=115+r()*(H-135),w=40+r()*34,d=26+r()*20;if(!pFree(pos,x,y,26))continue;if(ps.some(q=>Math.abs(q[0]-x)<(q[2]+w)*.62&&Math.abs(q[1]-y)<(q[3]+d)*.9))continue;ps.push([x,y,w,d])}
 ps.sort((a,b)=>a[0]-b[0]);ps.forEach((p,i)=>{isoQuad(p[0],p[1],p[2],p[3],pal[i%pal.length],{rows:Math.round(p[3]/3.6),dir:i%2?"a":"b",rowCol:ST.sn?"rgba(110,130,150,.35)":"rgba(40,30,10,.3)",rw:.8})});
 G.save();G.lineCap="round";for(let i=0;i<ps.length-1;i+=2){const a=ps[i],b=ps[i+1];if(Math.hypot(a[0]-b[0],(a[1]-b[1])*2)>110)continue;G.strokeStyle=lit("#4a7430",1);G.lineWidth=4.6;G.beginPath();G.moveTo(a[0]+a[2]*.4,a[1]+a[3]*.3);G.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2+8,b[0]-b[2]*.4,b[1]+b[3]*.3);G.stroke();G.strokeStyle=lit("#78a850",.9);G.lineWidth=1.6;G.setLineDash([2,5]);G.stroke();G.setLineDash([])}G.restore();
 const fp=[["klastor","vinica"],["les","dedina"],["dedina","rybnik"],["letohradok","hostinec"],["vinica","salas"],["hostinec","lom"],["rybnik","mlyn"]];
 G.save();G.lineCap="round";fp.forEach(f=>{const a=pos[f[0]],b=pos[f[1]];if(!a||!b)return;const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2+14;G.strokeStyle=lit(ST.sn?"#c9d4da":"#b79a68",.85);G.lineWidth=3.4;G.setLineDash([3,6]);G.beginPath();G.moveTo(a[0],a[1]+14);G.quadraticCurveTo(mx,my,b[0],b[1]+14);G.stroke();G.setLineDash([])});G.restore();
 road([[0,352],[90,346],[190,338]],9);road([[1110,320],[1160,328],[1210,336]],9);road([[150,178],[70,152],[-10,140]],8)}
function protoRiver(cid){const r=rng(cid*3+41);G.save();
 for(let i=0;i<5;i++){const x=80+r()*(W-160);if(Math.abs(x-606)<60)continue;const y=RY(x)+(r()<.5?-1:1)*(RH(x)-6);G.fillStyle=lit(ST.sn?"#eef0f2":"#d8c890",.9);G.beginPath();G.ellipse(x,y,16+r()*14,3.2+r()*2,0,0,7);G.fill();G.strokeStyle="rgba(60,50,20,.35)";G.lineWidth=.5;G.stroke()}
 for(let i=0;i<46;i++){const x=r()*W;if(Math.abs(x-606)<40)continue;const sd=r()<.55?-1:1,y=RY(x)+sd*(RH(x)+1);for(let k=0;k<4;k++){const px=x+k*2.4-4,h=7+r()*6;G.strokeStyle=lit("#5a7a30",1);G.lineWidth=1;G.beginPath();G.moveTo(px,y);G.quadraticCurveTo(px+(r()-.5)*3,y-h*.6,px+(r()-.5)*4,y-h);G.stroke();if(k%2){G.fillStyle=lit("#6a4a2a",1);G.fillRect(px-.9+(r()-.5),y-h-3,1.8,4)}}}
 for(const x of[300,980]){const y=RY(x)+3;G.save();G.translate(x,y);for(let q=0;q<5;q++){G.fillStyle=lit("#8a6a40",1);G.strokeStyle=INK;G.lineWidth=.4;G.beginPath();G.ellipse(-12+q*6,0,3.4,2.6,0,0,7);G.fill();G.stroke()}poly([[-14,-2],[14,-2],[14,-.4],[-14,-.4]],lit("#a07a4a",1));G.restore();person(x+2,y-1,"#5a7ab0")}
 const px=548,py=RY(px)-RH(px);G.fillStyle=lit("#9a7a4a",1);G.strokeStyle=INK;G.lineWidth=.5;G.fillRect(px-26,py+3,34,6);G.strokeRect(px-26,py+3,34,6);G.strokeStyle="rgba(40,25,10,.5)";G.lineWidth=.5;for(let k=0;k<7;k++){G.beginPath();G.moveTo(px-26+k*5,py+3);G.lineTo(px-26+k*5,py+9);G.stroke()}
 for(let b=0;b<2;b++){const bx=px-6+b*22,by=py+16+b*5;G.fillStyle=lit("#5a3a22",1);G.strokeStyle=INK;G.lineWidth=.5;G.beginPath();G.moveTo(bx-9,by-2);G.quadraticCurveTo(bx,by+4,bx+9,by-3);G.lineTo(bx+7,by-.5);G.quadraticCurveTo(bx,by+1,bx-7,by-.5);G.closePath();G.fill();G.stroke();G.strokeStyle=INK;G.lineWidth=.9;G.beginPath();G.moveTo(bx,by-1);G.lineTo(bx,by-14);G.stroke();poly([[bx,by-14],[bx+8,by-4],[bx,by-4]],"#f2ecdc",INK,.4)}
 for(const q of[[px-22,py],[px-14,py-1]]){G.fillStyle=lit("#b08a54",1);G.fillRect(q[0],q[1]-4,6,4);G.strokeRect(q[0],q[1]-4,6,4)}
 G.strokeStyle="rgba(255,255,255,.7)";G.lineWidth=.9;for(const bx of[590,622]){for(const sd of[-1,1]){const y=RY(bx)+sd*(RH(bx)+4);G.beginPath();G.moveTo(bx-9,y);G.quadraticCurveTo(bx,y+sd*(-4),bx+9,y);G.stroke()}}
 G.restore()}

/* ---------- bohatstvo okolia a charakter mesta ---------- */
function nearRoad(x,y,d){for(const rd of ROADS){if(rd.length!==3)continue;for(let t=0;t<=1;t+=.04){const px=(1-t)**2*rd[0][0]+2*t*(1-t)*rd[1][0]+t*t*rd[2][0],py=(1-t)**2*rd[0][1]+2*t*(1-t)*rd[1][1]+t*t*rd[2][1];if(Math.hypot(px-x,(py-y)*1.6)<d)return true}}return false}
function findSpot(rs,pos,taken,rad){for(let t=0;t<500;t++){const x=50+rs()*1100,y=125+rs()*440;if(!pFree(pos,x,y,rad))continue;if(nearRoad(x,y,rad*.55+8))continue;if(taken.some(q=>Math.hypot(q[0]-x,(q[1]-y)*1.8)<rad*1.5+q[2]))continue;taken.push([x,y,rad*.4]);return[x,y]}return null}
function windmill(x,y,s){G.save();G.translate(x,y);G.scale(s,s);cyl(0,0,6,22,"#e6dcc4","#8a5a3a",9);const a0=(x*.07)%6.28;G.strokeStyle=lit("#5a3c22",1);G.lineWidth=1.4;for(let k=0;k<4;k++){const an=a0+k*1.5708,ex=Math.cos(an)*22,ey=-27+Math.sin(an)*22;G.beginPath();G.moveTo(0,-27);G.lineTo(ex,ey);G.stroke();G.fillStyle=lit("#efe6d0",.95);G.beginPath();G.moveTo(Math.cos(an)*6,-27+Math.sin(an)*6);G.lineTo(ex,ey);G.lineTo(ex+Math.cos(an+1.5708)*5,ey+Math.sin(an+1.5708)*5);G.lineTo(Math.cos(an)*6+Math.cos(an+1.5708)*5,-27+Math.sin(an)*6+Math.sin(an+1.5708)*5);G.closePath();G.fill()}G.restore()}
function manor(x,y){house(x,y,26,18,16,"#efe6d0","#a5412a",{stone:1,chim:1});cyl(x+18,y-8,5.2,30,"#e2d9c2","#7a4a2f",12);fence(x-26,y+16,x+22,y+30);flag(x+18,y-8-30-12,10,DCsafe());bed(x-14,y+26,16,8)}
function cog(x,y,s){s=s||1;G.save();G.translate(x,y);G.scale(s,s);G.fillStyle=lit("#4a3220",1);G.strokeStyle=INK;G.lineWidth=.5;G.beginPath();G.moveTo(-17,-3);G.quadraticCurveTo(0,7,18,-5);G.lineTo(15,-1);G.quadraticCurveTo(0,3,-14,-1);G.closePath();G.fill();G.stroke();G.beginPath();G.moveTo(0,-2);G.lineTo(0,-34);G.stroke();poly([[0,-33],[14,-20],[0,-9]],"#f2ecdc",INK,.5);poly([[-1,-30],[-11,-19],[-1,-9]],"#e6dec8",INK,.5);G.fillStyle="#b8362c";G.fillRect(0,-38,7,3.4);G.restore()}
function crane(x,y){G.save();G.strokeStyle=lit("#5a3c22",1);G.lineWidth=2;G.beginPath();G.moveTo(x-5,y);G.lineTo(x,y-26);G.lineTo(x+5,y);G.moveTo(x-8,y-24);G.lineTo(x+16,y-30);G.stroke();G.lineWidth=.7;G.beginPath();G.moveTo(x+14,y-30);G.lineTo(x+14,y-14);G.stroke();G.fillStyle=lit("#8a6a40",1);G.fillRect(x+11,y-14,6,5);G.restore()}
function headframe(x,y){G.save();G.strokeStyle=lit("#5a3c22",1);G.lineWidth=2;G.beginPath();G.moveTo(x-9,y);G.lineTo(x,y-34);G.lineTo(x+9,y);G.moveTo(x-5,y-12);G.lineTo(x+5,y-12);G.stroke();G.fillStyle=lit("#3a3028",1);G.beginPath();G.arc(x,y-34,4,0,7);G.fill();G.strokeStyle=INK;G.lineWidth=.5;G.stroke();G.restore();box(x+16,y+2,14,10,8,"#8a6a44",{tex:"timber",noDoor:1,win:false});gable(x+16,y+2,14,10,8,6,"#6a4a2f",{wall:"#8a6a44"})}
function spoil(x,y,w,h,col){G.fillStyle=lit(col,1);G.strokeStyle=INK;G.lineWidth=.5;G.beginPath();G.moveTo(x-w,y);G.lineTo(x-w*.2,y-h);G.lineTo(x+w*.25,y-h*.92);G.lineTo(x+w,y);G.closePath();G.fill();G.stroke();G.fillStyle="rgba(0,0,0,.18)";G.beginPath();G.moveTo(x+w*.25,y-h*.92);G.lineTo(x+w,y);G.lineTo(x+w*.2,y);G.closePath();G.fill()}
function gondola(x,y){G.fillStyle=lit("#1c1814",1);G.beginPath();G.moveTo(x-8,y-3);G.quadraticCurveTo(x-1,y+2.4,x+8,y-4);G.quadraticCurveTo(x+1,y-.2,x-8,y-3);G.fill();G.fillStyle=lit("#d8b040",1);G.fillRect(x+6.6,y-5.6,1.4,2.2);person(x+1,y-1,"#7a2a2a")}
function protoWealth(pos,cid,Q){const rs=rng(cid*29+5),taken=[],a=[];
 for(let i=0;i<Math.min(4,Q-1);i++){const p=findSpot(rs,pos,taken,34);if(!p)continue;village(p[0],p[1],3+(rs()*3|0),cid*7+i,{spread:24}).forEach(q=>a.push(q))}
 for(let i=0;i<Math.max(0,Math.min(4,Q-3));i++){const p=findSpot(rs,pos,taken,30);if(!p)continue;a.push({y:p[1]+12,f:()=>manor(p[0],p[1])})}
 for(let i=0;i<(Q>=5?2:Q>=3?1:0);i++){const p=findSpot(rs,pos,taken,22);if(!p)continue;a.push({y:p[1],f:()=>windmill(p[0],p[1],1)})}
 if(Q<=3)for(let i=0;i<5-Q;i++){const p=findSpot(rs,pos,taken,52);if(!p)continue;treeCluster(p[0],p[1],64,22,26,cid*5+i,["pine","pine","oak","bush"]).forEach(q=>a.push(q))}
 if(Q<=4)for(let i=0;i<5-Q;i++){const p=findSpot(rs,pos,taken,26);if(!p)continue;const rr=rng(cid*3+i);a.push({y:p[1]+8,f:()=>{G.fillStyle=lit("#7fae52",.5);G.beginPath();G.ellipse(p[0],p[1]+4,34,11,0,0,7);G.fill();for(let k=0;k<6;k++)sheep(p[0]-24+rr()*48,p[1]+rr()*10,1);person(p[0]+30,p[1]+6,"#8a6a3a")}})}
 return a}
function hillTop(x,y,col){return{y:y-30,f:()=>hill(x,y,96,27,36,ST.sn?"#e2ebee":col)}}
function protoChar(key,pos,Q,cid){const a=[],c=pos.cit||[930,548],x=c[0],y=c[1];
 const castleOn=(variant)=>{a.push(hillTop(x,y,variant==="nur"?"#a39a8a":"#7aa44c"));a.push({y:y+4,f:()=>{castle(x,y-14,Math.max(3,Q));
   if(variant==="kra"){cyl(x+22,y-10,6,24,"#e6dcc4","#d8b040",10)}
   if(variant==="bud"){box(x+30,y-4,52,12,15,"#efe6d0",{stone:1});hip(x+30,y-4,52,12,15,5,"#6a7a6a");cyl(x+30,y-12,7,12,"#e6dcc4","#2f8a78",12)}
   if(variant==="nur"){cyl(x-30,y-8,6,26,"#c8c0b0","#7a3a2a",12);cyl(x+36,y-14,6,26,"#c8c0b0","#7a3a2a",12)}}})};
 if(key==="pre"||key==="brn"||key==="kra"||key==="bud"||key==="nur")castleOn(key);
 else if(key==="pra"){a.push(hillTop(x,y,"#7aa44c"));a.push({y:y+2,f:()=>{box(x,y-12,46,16,22,"#d8d0bc",{stone:1});gable(x,y-12,46,16,22,13,"#5d6a7a",{wall:"#d8d0bc"});box(x+24,y-6,11,11,42,"#cfc8b4",{stone:1,win:false});hip(x+24,y-6,11,11,42,18,"#4a5a6a");box(x-26,y-6,9,9,30,"#cfc8b4",{stone:1,win:false});hip(x-26,y-6,9,9,30,12,"#4a5a6a");flag(x+24,y-6-60,12,DCsafe())}})}
 else if(key==="vie"){a.push({y:y,f:()=>{const g=oo(x,y,0,26);isoQuad(g[0],g[1],70,38,ST.sn?"#e6eef0":"#7fae52",{rows:7,dir:"b",rowCol:"rgba(30,70,20,.22)"});for(const u of[-16,16]){const b=oo(x,y,u,26);isoQuad(b[0],b[1],20,10,ST.sn?"#dfe8ea":"#c85a68",{f:1,edge:"rgba(40,20,10,.4)"})}box(x,y,76,16,20,"#f0d890",{stone:1});hip(x,y,76,16,20,8,"#6a7a6a");const w1=oo(x,y,-42,10),w2=oo(x,y,42,10);box(w1[0],w1[1],12,30,16,"#f0d890",{stone:1});hip(w1[0],w1[1],12,30,16,6,"#6a7a6a");box(w2[0],w2[1],12,30,16,"#f0d890",{stone:1});hip(w2[0],w2[1],12,30,16,6,"#6a7a6a");cyl(x,y-8,8,10,"#e6dcc4","#2f7a68",16)}})}
 else if(key==="kut"){a.push({y:y,f:()=>{spoil(x-34,y+4,26,20,"#8a8478");spoil(x+8,y+8,30,26,"#7a7468");spoil(x+44,y+2,20,14,"#9a9488");headframe(x-6,y-4);headframe(x+30,y+4);G.fillStyle=lit("#5a3c22",1);G.fillRect(x-56,y+10,14,5);G.fillRect(x-54,y+14,3,3);G.fillRect(x-46,y+14,3,3);for(let k=0;k<4;k++){G.fillStyle=lit("#3a3430",1);G.beginPath();G.arc(x+2+k*5,y+14,1.6,0,7);G.fill()}}})}
 else if(key==="gda"){const px=860,py=RY(860)+RH(860);a.push({y:py+6,f:()=>{G.fillStyle=lit("#9a7a4a",1);G.strokeStyle=INK;G.lineWidth=.5;G.fillRect(px-30,py-RH(860)+2,60,7);G.strokeRect(px-30,py-RH(860)+2,60,7);crane(px-14,py-RH(860)+4);crane(px+14,py-RH(860)+4);for(const q of[[px-30,py-RH(860)+12],[px+26,py-RH(860)+13]]){G.fillStyle=lit("#a07c52",1);G.fillRect(q[0],q[1],7,5);G.strokeRect(q[0],q[1],7,5)}cog(px-44,py-RH(860)-6,1.1);cog(px+40,py-RH(860)+2,1.1);cog(px+8,py-RH(860)-14,.9);box(px-4,py+16,30,12,12,"#b0604a",{tex:"brick",noDoor:1});gable(px-4,py+16,30,12,12,8,"#5a2a1e",{wall:"#b0604a"})}})}
 else if(key==="par"){const ix=700,iy=RY(700);a.push({y:iy+10,f:()=>{G.fillStyle=lit("#b8aa84",1);G.strokeStyle=INK;G.lineWidth=.7;G.beginPath();G.ellipse(ix,iy+2,46,14,0,0,7);G.fill();G.stroke();G.fillStyle=lit("#8ab052",.9);G.beginPath();G.ellipse(ix-4,iy,36,9,0,0,7);G.fill();box(ix-4,iy+2,34,14,16,"#d8d0b8",{stone:1});gable(ix-4,iy+2,34,14,16,10,"#5a6a7a",{wall:"#d8d0b8"});box(ix+14,iy+8,9,9,34,"#d0c8b0",{stone:1,win:true});box(ix+27,iy+8,9,9,34,"#d0c8b0",{stone:1,win:true});flag(ix+20,iy+8-44,10,"#2a3a8a")}})}
 else if(key==="lon"){const bx=606;for(let k=-3;k<=3;k++){if(k===0)continue;for(const sd of[-1,1]){const yy=RY(bx)+k*8.5,xx=bx+sd*19;a.push({y:yy+8,f:()=>{box(xx,yy,12,9,10,"#c8a888",{tex:"timber",noDoor:1,win:false});gable(xx,yy,12,9,10,7,"#5a4a44",{wall:"#c8a888"})}})}}
  for(const sx of[330,450]){a.push({y:RY(sx)+6,f:()=>cog(sx,RY(sx)+2,1.15)})}}
 else if(key==="ven"){a.push({y:RY(440)+20,f:()=>{const iy=RY(440)+2;G.fillStyle=lit("#d8cba0",1);G.strokeStyle=INK;G.lineWidth=.6;G.beginPath();G.ellipse(440,iy,34,9,0,0,7);G.fill();G.stroke();box(440,iy,16,12,12,"#ecc8b0",{stone:1});hip(440,iy,16,12,12,6,"#b8502e");cyl(452,iy-4,4.4,26,"#d8b098","#5a8a6a",10);for(let k=0;k<7;k++){const gx=250+k*70;gondola(gx+((k*23)%20),RY(gx)+((k%3)-1)*7)}G.strokeStyle=lit("#7a5a3a",1);G.lineWidth=1.4;for(let k=0;k<14;k++){const gx=40+k*80,gy=RY(gx)-RH(gx)+4;G.beginPath();G.moveTo(gx,gy);G.lineTo(gx,gy-8);G.stroke()}}})}
 return a}
function protoProps(pos,cid){const r=rng(cid*11+17),a=[];
 let n=0;for(let t=0;t<300&&n<Math.max(0,Math.min(4,ST.rq-1));t++){const ox=60+r()*(W-120),oy=130+r()*(H-170);if(!pFree(pos,ox,oy,40))continue;n++;for(let i=0;i<5;i++)for(let j=0;j<3;j++){const tx=ox+i*16-32+(j%2)*7,ty=oy+j*12;a.push({y:ty,f:()=>{tree(tx,ty,.62,"oak",(tx*5+ty)|0);if(!ST.sn&&ST.se!==3){G.fillStyle="#d8402e";G.beginPath();G.arc(tx-2,ty-14,1.1,0,7);G.arc(tx+3,ty-17,1.1,0,7);G.fill()}}})}}
 for(let i=0;i<9;i++){const x=r()*W;if(Math.abs(x-606)<50)continue;const y=RY(x)-RH(x)-8;a.push({y,f:()=>{tree(x,y,.95,"oak",x|0);G.strokeStyle=lit("#7fa84a",.8);G.lineWidth=.8;for(let k=0;k<7;k++){G.beginPath();G.moveTo(x-8+k*2.6,y-26);G.quadraticCurveTo(x-9+k*2.7,y-16,x-8+k*2.6,y-9);G.stroke()}}})}
 try{const me=CITY_DEF[cid].pos,oth=CITY_DEF.map((d,i)=>({i,n:d.n,dx:d.pos[0]-me[0],dy:d.pos[1]-me[1]})).filter(o=>o.i!==cid).sort((p,q)=>Math.hypot(p.dx,p.dy)-Math.hypot(q.dx,q.dy));const used=new Set(),pick=f=>{const o=oth.find(x=>!used.has(x.i)&&f(x));if(o)used.add(o.i);return o};
  const w=pick(o=>o.dx<0),e=pick(o=>o.dx>0),n=pick(o=>o.dy<0);
  if(w)a.push({y:352,f:()=>pSign(14,356,w.n.toUpperCase()+" ›")});if(e)a.push({y:336,f:()=>pSign(1110,340,e.n.toUpperCase()+" ›")});if(n)a.push({y:150,f:()=>pSign(20,160,n.n.toUpperCase()+" ›")})}catch(x){console.warn("okolie sign",x)}
 return a}
function protoClouds(cid){const r=rng(cid*19+3);G.save();for(let i=0;i<5;i++){const x=r()*W,y=140+r()*(H-170),rx=90+r()*80,ry=rx*.32;G.save();G.translate(x,y);G.scale(1,ry/rx);const g=G.createRadialGradient(0,0,4,0,0,rx);g.addColorStop(0,"rgba(30,45,30,.2)");g.addColorStop(1,"rgba(30,45,30,0)");G.fillStyle=g;G.beginPath();G.arc(0,0,rx,0,7);G.fill();G.restore()}G.restore()}
function paint(Dk){
 const C=CC(),p=P(),home=C.id===p.city,E0=home?(S.est||{}):{};
 const pos={};OKO.forEach(o=>pos[o[0]]=[o[2][0],o[2][1]]);
 Object.assign(pos,{dedina:[190,330],vinica:[890,176],les:[140,160],rybnik:[318,410],salas:[1040,120],letohradok:[770,405],klastor:[590,102],hostinec:[975,395],lom:[1110,310]});
 pos.mlyn=[470,RY(470)-RH(470)-30];
 const D=Dk?{k:Dk,x:pos[Dk][0],y:pos[Dk][1]}:null;const DZ=2.3;const k=(window.PREF&&PREF.gfx===0)?1.25:1.6;const cvs=document.createElement("canvas");const CW=D?960:Math.round(W*k),CH=D?560:Math.round(H*k);cvs.width=CW;cvs.height=CH;G=cvs.getContext("2d");if(D){D.vx=Math.max(CW/2/DZ,Math.min(W-CW/2/DZ,D.x));D.vy=Math.max(CH*.58/DZ,Math.min(H-CH*.42/DZ,D.y));D.fx=CW/2+(D.x-D.vx)*DZ;D.fy=CH*.58+(D.y-D.vy)*DZ;G.setTransform(DZ,0,0,DZ,CW/2-D.vx*DZ,CH*.58-D.vy*DZ)}else G.scale(k,k);
 const ph=(typeof todPh==="function")?todPh():1;ST={se:S.season,sn:S.season===3,ph,night:ph===3,tint:TINT[ph]||TINT[1],cid:C.id,rq:Math.max(1,Math.min(7,C.tier||2))};
 hayList=[];AS=ARCH[CITY_DEF[C.id].key]||null;GROW=Math.floor((Math.max(1,Math.min(5,C.tier||1))-1)*3/4);PAL=null;try{PAL=window.OKPAL?OKPAL(CITY_DEF[C.id].key):null}catch(e){console.warn("OKPAL",e)}
 const sk=G.createLinearGradient(0,0,0,90);const SKY=[["#bcd2e8","#f4dcc4"],["#8cbce4","#eaf2f0"],["#d8783a","#f6cc7a"],["#0a1226","#22325a"]][ph]||["#8cbce4","#eaf2f0"];sk.addColorStop(0,SKY[0]);sk.addColorStop(1,SKY[1]);G.fillStyle=sk;G.fillRect(0,0,W,90);
 if(ST.night){const r=rng(5);for(let i=0;i<70;i++){G.fillStyle=`rgba(255,255,255,${.4+r()*.5})`;G.fillRect(r()*W,r()*40,1.4,1.4)}}
 grassBase();mountains();
 hill(590,110,150,34,26,ST.sn?"#e2ebee":ST.se===2?"#b09a4a":"#80a850");
 hill(1040,118,150,34,24,ST.sn?"#e2ebee":ST.se===2?"#aa9448":"#7aa44c");
 hill(890,190,170,38,22,ST.sn?"#e2ebee":ST.se===2?"#a89246":"#82aa4e");
 hill(140,160,140,30,16,ST.sn?"#e2ebee":"#6f9c42");
 fields(C.id);if(!D)protoLand(pos,C.id);
 ROADS.forEach(r=>road(r));
 river();bridge(606);if(!D)protoRiver(C.id);
 const pondFn=pond(pos.rybnik[0],pos.rybnik[1],E0.rybnik||0,(home&&S.estL&&S.estL.rybnik)||1);vineyard(pos.vinica[0]-10,pos.vinica[1]-4,E0.vinica||0);
 const props=[];if(!D){const kk=CITY_DEF[C.id].key;if(kk==="par"||kk==="lon"||kk==="ven"||kk==="gda"){if(kk==="gda")pos.port=[860,RY(860)+RH(860)+10]}else pos.cit=[930,548]}
 window.OKPOSG=pos;const city=citySprite(C,600,285);props.push({y:285,f:()=>city.draw()});
 props.push({y:pos.rybnik[1]+40,f:pondFn});hayList.forEach(h=>props.push(h));
 OKO.forEach(o=>{const kk=o[0];featProps(kk,pos[kk][0],pos[kk][1],E0[kk]||0,C.id*101+kk.length*13+kk.charCodeAt(0),(home&&S.estL&&S.estL[kk])||1).forEach(q=>props.push(q))});
 if(home&&S.town){const tn=Math.min(16,6+Math.round((S.town.pop||200)/260));village(300,232,tn,C.id+77,{church:1,well:1,spread:58}).forEach(q=>props.push(q))}
 if(home)(S.vas||[]).forEach((v,i)=>{const x=200+i*170,y=62+i%2*30;props.push({y,f:()=>{box(x,y,22,18,22,"#d4c9ae",{stone:1,win:false});hip(x,y,22,18,22,13,"#6b4423");flag(x+4,y-34,10,"#2b4c8f")}})});
 if(home&&(S.castle||[]).length)props.push({y:210,f:()=>{const x=450,y=196;hill(x,y+14,52,14,14,ST.sn?"#e2ebee":"#80a850");box(x,y,46,32,28,"#c8bfa8",{stone:1,win:false});cyl(x-24,y+6,7,40,"#bfb6a0","#7a4d2a",16);cyl(x+24,y-10,7,40,"#bfb6a0","#7a4d2a",16);box(x+2,y-2,16,16,48,"#b9b0a0",{stone:1,win:false});hip(x+2,y-2,16,16,48,18,"#5d6a7a");flag(x+2,y-2-66,12,DCsafe())}});
 const rt=rng(C.id*5+1);for(let i=0;i<44;i++){const x=rt()*W,y=100+rt()*(H-100),s=.75+rt()*.5,kind=rt()<.3?"pine":"oak";if(Math.abs(y-RY(x))<30)continue;if(((x-600)/250)**2+((y-285)/120)**2<1)continue;props.push({y,f:()=>tree(x,y,s,kind,x*3+y|0)})}
 if(!D){const rq=ST.rq;ROADS.forEach(rd=>{if(rd.length!==3)return;const qp=t=>[(1-t)**2*rd[0][0]+2*t*(1-t)*rd[1][0]+t*t*rd[2][0],(1-t)**2*rd[0][1]+2*t*(1-t)*rd[1][1]+t*t*rd[2][1]];
  if(rq>=5)for(const t of[.1,.2,.3,.4]){const q=qp(t);props.push({y:q[1]+7,f:()=>lamp(q[0]+8,q[1]+7)})}
  if(rq>=3){const q=qp(.62);props.push({y:q[1]+6,f:()=>{G.fillStyle=lit("#b9b2a2",1);G.strokeStyle=INK;G.lineWidth=.4;G.beginPath();G.moveTo(q[0]+9-2.4,q[1]+6);G.lineTo(q[0]+9-2,q[1]+1);G.quadraticCurveTo(q[0]+9,q[1]-1,q[0]+9+2,q[1]+1);G.lineTo(q[0]+9+2.4,q[1]+6);G.closePath();G.fill();G.stroke()}})}});}
 if(!D)protoProps(pos,C.id).forEach(q=>props.push(q));
 if(!D){try{protoWealth(pos,C.id,ST.rq).forEach(q=>props.push(q));protoChar(CITY_DEF[C.id].key,pos,ST.rq,C.id).forEach(q=>props.push(q))}catch(e){console.warn("okolie char",e)}}
 props.sort((a,b)=>a.y-b.y);props.forEach(q=>{try{q.f()}catch(e){console.warn("okolie",e)}});if(!D)protoClouds(C.id);
 if(D)G.setTransform(1,0,0,1,0,0);const WW=D?CW:W,HH=D?CH:H;
 const gr2=G.createImageData(64,64);for(let i=0;i<gr2.data.length;i+=4){const v=128+Math.random()*60;gr2.data[i]=gr2.data[i+1]=gr2.data[i+2]=v;gr2.data[i+3]=255}
 const tc=document.createElement("canvas");tc.width=tc.height=64;tc.getContext("2d").putImageData(gr2,0,0);
 G.save();G.globalAlpha=.055;G.globalCompositeOperation="overlay";G.fillStyle=G.createPattern(tc,"repeat");G.fillRect(0,0,WW,HH);G.restore();
 const vg=G.createRadialGradient(WW/2,HH/2,HH*.45,WW/2,HH/2,WW*.62);vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,ST.night?"rgba(0,0,10,.45)":"rgba(40,25,10,.28)");G.fillStyle=vg;G.fillRect(0,0,WW,HH);
 if(ph===0||ph===2){G.save();G.globalCompositeOperation="soft-light";G.fillStyle=ph===0?"rgba(160,190,230,.25)":"rgba(255,160,70,.3)";G.fillRect(0,0,WW,HH);G.restore()}
 let url;try{url=cvs.toDataURL("image/jpeg",.86)}catch(e){url=cvs.toDataURL()}
 return{url,pos,fx:D&&D.fx,fy:D&&D.fy}}

/* ---------- živé okolie (SVG animácie nad obrázkom) ---------- */
const pS=(col,hat,tool)=>`<ellipse cy=".6" rx="3.8" ry="1.2" fill="rgba(0,0,0,.25)"/><path d="M-2.6 0Q-3.4 -8 0 -10.4Q3.4 -8 2.6 0Z" fill="${col}" stroke="#1e140a" stroke-width=".4"/><circle cy="-12.6" r="2.3" fill="#e0b090" stroke="#1e140a" stroke-width=".35"/><path d="M-2.7 -13.5Q0 -17.4 2.7 -13.5Z" fill="${hat||"#5a4632"}"/>${tool||""}`;
const HOE='<path d="M2 -7L9 -1" stroke="#5a3c22" stroke-width="1.1"/><path d="M8 -2L11 -1" stroke="#7a7a82" stroke-width="1.5"/>';
const PICK='<path d="M2 -7L9 -3" stroke="#5a3c22" stroke-width="1.1"/><path d="M8 -6L11 0" stroke="#7a7a82" stroke-width="1.6"/>';
const rpath=r=>`M${r[0][0]} ${r[0][1]}Q${r[1][0]} ${r[1][1]} ${r[2][0]} ${r[2][1]}`;
const mv=(r,d,dl,inner)=>`<g class="okmv" style="offset-path:path('${rpath(r)}');--d:${d}s;animation-delay:-${dl}s">${inner}</g>`;
const CARTG=(c)=>`<ellipse cy="3" rx="13" ry="3" fill="rgba(0,0,0,.25)"/><rect x="-9" y="-8" width="18" height="8" fill="#9b6a3e" stroke="#2b2117" stroke-width=".6"/><path d="M-9 -8Q0 -18 9 -8Z" fill="${c}" stroke="#2b2117" stroke-width=".6"/><circle cx="-6" cy="1" r="3.2" fill="none" stroke="#2b2117" stroke-width=".8"/><circle cx="6" cy="1" r="3.2" fill="none" stroke="#2b2117" stroke-width=".8"/><ellipse cx="15" cy="-3" rx="5.5" ry="3.3" fill="#7a5a3a" stroke="#2b2117" stroke-width=".5"/><circle cx="19.5" cy="-5" r="2.2" fill="#7a5a3a" stroke="#2b2117" stroke-width=".4"/>`;
const smk=(x,y,n,dk)=>{let r="";for(let i=0;i<n;i++)r+=`<circle class="okSmk" cx="${x}" cy="${y}" r="4" style="animation-delay:${i*2}s${dk?";fill:#9a9ea2":""}"/>`;return r};
function living(pos,E0,upL,home,ph,se,C){
 const night=ph===3,w=(()=>{try{return weatherOf()}catch(e){return""}})();let s="";
 // tiene mrakov
 if(!night&&w!=="storm")for(let i=0;i<3;i++)s+=`<ellipse class="cshadow" cx="${-100+i*60}" cy="${160+i*170}" rx="${130+i*24}" ry="${30+i*6}" fill="rgba(20,30,40,.09)" style="animation-delay:-${i*47}s;animation-duration:${150+i*30}s" pointer-events="none"/>`;
 // vtáky
 if(!night&&w!=="rain"&&w!=="storm"){const bd=se===3?"#2b2b2e":"#3a3a40";s+=`<g class="birds" pointer-events="none" style="animation-delay:-${(C.id*7)%38}s">`+[0,1,2,3,4].map(i=>`<g transform="translate(${i*22},${26+(i%3)*9+i*2})"><path class="wing" d="M-5 0Q-2.5 -3 0 0Q2.5 -3 5 0" fill="none" stroke="${bd}" stroke-width="1.1" style="animation-delay:-${i*.13}s"/></g>`).join("")+`</g>`}
 // dym
 const dm=[[pos.dedina[0]-20,pos.dedina[1]-14],[pos.dedina[0]+10,pos.dedina[1]-2],[pos.hostinec[0]+4,pos.hostinec[1]-34],[pos.klastor[0]+34,pos.klastor[1]+8],[pos.letohradok[0]-14,pos.letohradok[1]-36],[560,236],[648,244],[606,222],[pos.les[0]+16,pos.les[1]+36]];
 if(home&&S.town)dm.push([296,214],[316,222]);
 dm.forEach((q,i)=>{if(se===1&&i%2)return;s+=smk(q[0],q[1],se===3?3:2,se===3)});
 // vlak vozov a chodcov po cestách
 const cw=["#e8dfc9","#d8c8a0","#c8b890","#e8e0cc"];
 [[0,58,5],[5,72,22],[6,66,40],[3,80,12],[2,90,30]].forEach(([r,d,dl],i)=>{s+=mv(ROADS[r],d,dl,CARTG(cw[i%4]))});
 const pc=["#2f5bb0","#b8362c","#6d3f92","#7a4d2a","#3a7a4a","#a8742a"];
 [[0,46,8],[1,52,20],[4,60,4],[7,38,12],[8,34,3],[9,42,26],[0,52,30],[5,48,15]].forEach(([r,d,dl],i)=>{s+=mv(ROADS[r],d,dl,`<g class="wlk">${pS(pc[i%6])}</g>`)});
 // poľnohospodári
 if(!night&&se!==3&&w!=="rain"&&w!=="storm"){[[100,398],[205,402],[424,376],[830,408],[1010,428],[130,538],[404,542],[958,546],[700,398]].forEach(([x,y],i)=>{s+=`<g transform="translate(${x+(i%3)*6-6},${y})"><g class="fm" style="animation-delay:-${i*.37}s">${pS(pc[(i+2)%6],"#d8c070",HOE)}</g></g>`})}
 // salaš: ovce a pastier
 {const[x,y]=pos.salas,n=Math.min(24,7+(E0.salas||0)*3+((upL.salas||1)>=3?8:0));for(let i=0;i<n;i++){const sx=x-90+((i*53)%200),sy=y+12+((i*37)%46),dx=(i%2?1:-1)*(10+(i*7)%22),dy=((i*11)%14)-5;s+=`<g transform="translate(${sx},${sy})"><g class="shp" style="--dx:${dx}px;--dy:${dy}px;--t:${7+(i*3)%7}s;--dl:-${i*.9}s"><ellipse cx="0" cy="-2" rx="3.3" ry="2.3" fill="#f2eee2" stroke="rgba(20,20,10,.5)" stroke-width=".4"/><circle cx="3" cy="-2.9" r="1.2" fill="#3a3028"/><rect x="-1.8" y="-.4" width=".7" height="1.6" fill="#3a3028"/><rect x="1.2" y="-.4" width=".7" height="1.6" fill="#3a3028"/></g></g>`}
  s+=`<g transform="translate(${x+112},${y+50})"><g class="fm slowfm">${pS("#6a4a2a","#7a5a3a",'<path d="M3 -12L3 2" stroke="#5a3c22" stroke-width="1.1"/>')}</g></g>`}
 // mlyn: koleso
 {const[x,y]=pos.mlyn,wx=x+22,wy=y+18;s+=`<g transform="translate(${wx},${wy}) scale(.62,1)"><g class="spin"><circle r="13" fill="none" stroke="#5a3c22" stroke-width="1.5"/>${[0,1,2,3,4,5,6,7].map(i=>{const a=i/8*6.283;return`<path d="M0 0L${(Math.cos(a)*13).toFixed(1)} ${(Math.sin(a)*13).toFixed(1)}" stroke="#5a3c22" stroke-width="1.2"/><rect x="${(Math.cos(a)*13-1.6).toFixed(1)}" y="${(Math.sin(a)*13-2).toFixed(1)}" width="3.2" height="4" fill="#7a4d2a"/>`}).join("")}</g></g><ellipse cx="${wx+6}" cy="${wy+14}" rx="12" ry="3" fill="rgba(255,255,255,.35)" class="bob"/>`;
  s+=`<g transform="translate(${x+4},${y+36})"><g class="fm slowfm">${pS("#7a4d2a","#d8cfae",'<path d="M2 -6L7 -2" stroke="#5a3c22" stroke-width="1"/>')}</g></g>`}
 // veterný mlyn v dedine
 if((upL.dedina||1)>=2&&E0.dedina){const[x,y]=pos.dedina,hx=x+88,hy=y-30;s+=`<g transform="translate(${hx},${hy})"><g class="spin slow">${[0,1,2,3].map(i=>`<g transform="rotate(${i*90})"><rect x="-1.3" y="-24" width="2.6" height="24" fill="#5a3c22"/><rect x="1.3" y="-23" width="6" height="14" fill="#efe6d0" stroke="#5a3c22" stroke-width=".5"/></g>`).join("")}</g><circle r="2.2" fill="#2b2117"/></g>`}
 // kameňolom
 {const[x,y]=pos.lom;[[x-40,y+22],[x-12,y+32],[x+22,y+16]].forEach(([px,py],i)=>{s+=`<g transform="translate(${px},${py})"><g class="fm pk" style="animation-delay:-${i*.3}s">${pS(pc[(i+1)%6],"#8a8278",PICK)}</g></g>`});if(se!==3)s+=smk(x-26,y+22,2,true).replace(/#d6d9db/g,"#b8a888")}
 // rybár
 {const[x,y]=pos.rybnik,rx=64+(E0.rybnik||0)*5;s+=`<g transform="translate(${x+rx-6},${y+2})"><g class="fm slowfm">${pS("#3a7a4a","#d8c070",'<path d="M2 -9L12 -16L16 -2" fill="none" stroke="#5a3c22" stroke-width=".8"/>')}</g></g><circle class="rip" cx="${x+rx+9}" cy="${y+3}" r="2"/><circle class="rip" cx="${x+rx+9}" cy="${y+3}" r="2" style="animation-delay:-1.5s"/>`}
 // poľovník v lese
 {const[x,y]=pos.les;s+=mv([[x-50,y+34],[x,y+12],[x+60,y+38]],70,10,`<g class="wlk">${pS("#3a5a3a","#5a6a3a",'<path d="M2 -8L8 -12" stroke="#4a3220" stroke-width="1.1"/>')}</g><ellipse cx="-9" cy="-1" rx="3.6" ry="1.8" fill="#8a6a3a" stroke="#2b2117" stroke-width=".4"/>`)}
 // noc: lampáše na bránach, svetlušky
 if(night){const RXc=cityRX(C),RYc=RXc*.5;[[600-RXc,285],[600+RXc,285],[600,285+RYc+5],[600,285-RYc]].forEach((q,i)=>{s+=`<circle class="flick" cx="${q[0]}" cy="${q[1]-14}" r="9" fill="rgba(255,190,90,.55)" style="animation-delay:-${i*.3}s;filter:blur(3px)"/>`});
  for(let i=0;i<10;i++)s+=`<circle class="flick" cx="${120+(i*131)%980}" cy="${330+(i*53)%240}" r="1.6" fill="#e8f08a" style="animation-delay:-${i*.4}s;animation-duration:${1.2+i%3*.5}s"/>`}
 return`<g class="oklive" pointer-events="none">${s}</g>`}
const HIT={dedina:[100,56,-16],vinica:[110,58,8],les:[130,62,16],rybnik:[78,34,2],salas:[110,42,20],letohradok:[86,50,0],klastor:[88,44,10],hostinec:[56,34,6],mlyn:[56,40,8],lom:[80,48,0]};
const LAB={rybnik:[0,50],mlyn:[0,50],letohradok:[0,62],klastor:[0,52],les:[0,80],salas:[0,68],vinica:[0,72],dedina:[0,68],hostinec:[0,48],lom:[0,62]};
function build(){
 const C=CC(),p=P(),home=C.id===p.city;
 const key=[C.id,S.season,(typeof todPh==="function"?todPh():1),JSON.stringify(home?(S.est||{}):{}),JSON.stringify(home?(S.estL||{}):{}),home&&S.town?1:0,home?(S.vas||[]).length:0,home?(S.castle||[]).length:0,C.tier,(window.PREF&&PREF.gfx)||0,window.KRAL?KRAL.key(C.id):""].join("|");
 if(CACHE.key!==key||!CACHE.url){const info=paint();CACHE={key,url:info.url,pos:info.pos}}
 const pos=CACHE.pos,E0=home?(S.est||{}):{},K="#2b2117";
 let s=`<svg class="okolie okolie2 oko3d" viewBox="0 0 ${W} ${H}" role="img" aria-label="Okolie mesta ${esc(C.n)}"><image href="${CACHE.url}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none"/>`;
 let rp="M-30 "+RY(-30);for(let x=-20;x<=W+40;x+=20)rp+=`L${x} ${RY(x)}`;
 let rpb="M"+(W+30)+" "+(RY(W+30)+4);for(let x=W+20;x>=-40;x-=20)rpb+=`L${x} ${RY(x)+4}`;
 if(S.season!==3){const boat=c=>`<g><ellipse cx="0" cy="3" rx="13" ry="3.2" fill="rgba(10,25,40,.3)"/><path d="M-12 -1L-9 4H9L12 -1Z" fill="#7a4d2a" stroke="${K}" stroke-width=".7"/><path d="M0 -1V-20" stroke="${K}" stroke-width="1.1"/><path d="M0 -19L10 -5H0Z" fill="${c}" stroke="${K}" stroke-width=".6"/></g>`;
  s+=`<g class="cmover" style="offset-path:path('${rp}');animation-duration:60s;animation-delay:-10s">${boat("#f2ecdc")}</g><g class="cmover" style="offset-path:path('${rpb}');animation-duration:78s;animation-delay:-40s">${boat("#e8d8b0")}</g>`}
 try{s+=living(pos,E0,home?(S.estL||{}):{},home,(typeof todPh==="function"?todPh():1),S.season,C)}catch(e){console.warn("okolie live",e)}
 try{if(window.OKEV)s+=OKEV.svg(pos,home,C)}catch(e){console.warn("okolie ev",e)}
 for(const[k,n]of OKO){const[x,y]=pos[k],own=E0[k]||0,est=EST[k],h=HIT[k]||[70,40,0],lb=LAB[k]||[0,50];
  const hov=`<b>${n}</b>${est?`<br>${esc(est.d)}`:""}${own?`<br><span class="good">tvoje · ${own}×${((S.estL||{})[k]||1)>1?" · stupeň "+(S.estL||{})[k]:""}</span>`:est&&home?`<br>kúpiť za ${zl(est.c)}`:""}<br><small>klikni pre možnosti</small>`;
  s+=`<g class="okop${own?" own":""}" data-a="okoPlace" data-k="${k}" ${hovAttr(hov)} role="button" tabindex="0"><ellipse class="hit" cx="${x}" cy="${y+h[2]}" rx="${h[0]}" ry="${h[1]}"/>${own?`<g transform="translate(${x+h[0]*.62},${y+h[2]-h[1]*.9})"><path d="M0 0V-28" stroke="${K}" stroke-width="1.3"/><path class="cflag" d="M0 -28h19l-4 6 4 6H0z" fill="${DC(0)}" stroke="${K}" stroke-width=".5"/><g transform="translate(2,-26) scale(.34)">${shieldIn(armsOf(0))}</g></g>`:""}<text class="oklab" x="${x+lb[0]}" y="${y+lb[1]}" text-anchor="middle" font-family="Almendra SC,serif" font-size="13" fill="${own?"#6b4a0a":K}" stroke="#f4ead0" stroke-width="4" paint-order="stroke">${n}</text></g>`}
 if(window.KRAL&&KRAL.court()===C.id&&S.dyn&&S.dyn[S.king]){const KD=S.dyn[S.king],hr=KRAL.here();s+=`<g class="okop" data-a="okoPlace" data-k="palac" ${hovAttr(`<b>Kráľovský palác</b><br>${hr?esc(TT(11,KD.head.gender))+" "+esc(KD.head.name)+" z rodu "+esc(KD.name):"prázdny, panovník sídli inde"}<br><small>klikni pre trón a voľbu kráľa</small>`)} role="button" tabindex="0"><ellipse class="hit" cx="664" cy="226" rx="82" ry="56"/><text class="oklab" x="664" y="150" text-anchor="middle" font-family="Almendra SC,serif" font-size="13" fill="${K}" stroke="#f4ead0" stroke-width="4" paint-order="stroke">Kráľovský palác</text></g>`}
 else if(home&&S.king===0&&window.KRAL&&KRAL.court()!==C.id){const RXc=cityRX(C),px=600+RXc*.55,py=285-RXc*.25;s+=`<g class="okop own" data-a="okoPlace" data-k="palacnew" ${hovAttr("<b>Sídlo kráľa</b><br>klikni a prerob ho na kráľovský palác")} role="button" tabindex="0"><ellipse class="hit" cx="${px}" cy="${py-8}" rx="44" ry="34"/><text class="oklab" x="${px}" y="${py+22}" text-anchor="middle" font-family="Almendra SC,serif" font-size="13" fill="#6b4a0a" stroke="#f4ead0" stroke-width="4" paint-order="stroke">Prerobiť na palác</text></g>`}
 if(home&&S.town)s+=`<g class="okop own" data-a="okoPlace" data-k="town" ${hovAttr(`<b>${esc(S.town.n)}</b><br>tvoje mestečko · ${fmt(S.town.pop)} obyvateľov`)}><ellipse class="hit" cx="300" cy="232" rx="92" ry="52"/><g transform="translate(372,196) scale(1.2)">${shieldIn(armsOf(0))}</g><text class="oklab" x="300" y="292" text-anchor="middle" font-family="Grenze Gotisch,serif" font-size="16" fill="${K}" stroke="#f4ead0" stroke-width="4" paint-order="stroke">${esc(S.town.n)}</text></g>`;
 if(home)(S.vas||[]).forEach((v,i)=>{const x=200+i*170,y=62+i%2*30;s+=`<g class="okop" data-a="okoPlace" data-k="vas" ${hovAttr(`${vasShield(v.arms,20)} <b>${esc(v.n)}</b><br>vazal z obce ${esc(v.seat)} · vernosť ${v.loy} · ${esc((VTRAIT[v.tr]||["",""])[0])}`)}><ellipse class="hit" cx="${x}" cy="${y-8}" rx="26" ry="28"/><g transform="translate(${x-7},${y-18}) scale(.6)">${shieldIn(v.arms)}</g></g>`});
 if(home&&(S.castle||[]).length)s+=`<g class="okop own" data-a="okoPlace" data-k="hrad" ${hovAttr("<b>Hrad rodu</b><br>klikni a pozri hrad")}><ellipse class="hit" cx="452" cy="182" rx="50" ry="40"/><text class="oklab" x="452" y="226" text-anchor="middle" font-family="Almendra SC,serif" font-size="13" fill="#6b4a0a" stroke="#f4ead0" stroke-width="4" paint-order="stroke">Hrad rodu</text></g>`;
 s+=`<g pointer-events="none"><rect x="528" y="352" width="144" height="24" rx="3" fill="#f6e3a4" stroke="#8f6211"/><text x="600" y="370" text-anchor="middle" font-family="Grenze Gotisch,serif" font-size="19" fill="${K}">${esc(C.n)}</text></g>`;
 try{s+=weatherFX(W,H)}catch(e){}

 return s+`<rect x="2" y="2" width="${W-4}" height="${H-4}" fill="none" stroke="#5a3a20" stroke-width="4" pointer-events="none"/></svg>`}
{const _o={use:(g,st)=>{G=g;ST=st},box,gable,hip,house,cyl,tree,blob,hay,barrel,sack,flag,person,isoQuad,poly,lit,cor,rng,lighten,win,shadow,sheep,TINT};const _f=window.ISO;if(typeof _f==="function"){Object.assign(_f,_o);window.ISO=_f}else window.ISO=_o}
window.OKX={ROADS,RY,RH,pS,mv,smk,rpath,paintDetail:k=>paint(k)};
window.okolieSVG=function(){try{return build()}catch(e){console.warn("okolie3d",e);return prevSVG?prevSVG():""}};
})();

;
