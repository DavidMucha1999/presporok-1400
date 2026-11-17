/* ==== js/centra.js ==== */
/* Stred mesta v okolí – vlastná kompozícia pre každé mesto (v25) */
(function(){
"use strict";
/* veža s ihlanom; st = horné poschodie (užšie) */
function sp(E,x,y,a,h,col,sh,roof,st){if(!sh)sh=a*1.25;
 E.box(x,y,a,a,h,col,{stone:1,win:h>30});
 if(st){const a2=a*.72;E.box(x,y-h,a2,a2,st,col,{stone:1,win:false,noShadow:1});E.hip(x,y-h,a2,a2,st,sh,roof);return y-h-st-sh}
 E.hip(x,y,a,a,h,sh,roof);return y-h-sh}
function gold(E,x,y){const G=E.G;G.fillStyle=E.lit("#e0b83c",1);G.strokeStyle="rgba(30,20,10,.6)";G.lineWidth=.5;G.beginPath();G.arc(x,y-1.5,2,0,7);G.fill();G.stroke();G.beginPath();G.moveTo(x,y-3);G.lineTo(x,y-8);G.moveTo(x-2,y-6);G.lineTo(x+2,y-6);G.stroke()}
function nave(E,x,y,w,d,h,rh,wall,roof){E.box(x,y,w,d,h,wall,{stone:1});E.gable(x,y,w,d,h,rh,roof,{wall})}
function band(E,yc,amp,w,col){const G=E.G,cx=E.cx,RX=E.RX;G.save();G.beginPath();G.ellipse(cx,E.cy,RX-1,E.RY2-.5,0,0,7);G.clip();
 const yy=t=>yc+Math.sin(t*6.283)*amp;
 G.beginPath();G.moveTo(cx-RX,yy(0));for(let i=0;i<=30;i++){const t=i/30;G.lineTo(cx-RX+t*2*RX,yy(t))}for(let i=30;i>=0;i--){const t=i/30;G.lineTo(cx-RX+t*2*RX,yy(t)+w)}G.closePath();
 const gr=G.createLinearGradient(0,yc-amp,0,yc+w+amp);gr.addColorStop(0,E.lit(col||"#6a9ab0",.9));gr.addColorStop(1,E.lit(col||"#6a9ab0",1.12));G.fillStyle=gr;G.fill();G.strokeStyle="rgba(40,30,20,.55)";G.lineWidth=1;G.stroke();
 G.strokeStyle="rgba(240,250,255,.45)";G.lineWidth=.8;for(let i=0;i<18;i++){const t=(i*.137+.05)%1,px=cx-RX+t*2*RX,py=yy(t)+w*(.25+((i*37)%5)/8);G.beginPath();G.moveTo(px-4,py);G.quadraticCurveTo(px,py-1.4,px+4,py);G.stroke()}
 G.restore();
 return(px,py)=>Math.abs(py-(yy((px-cx+RX)/(2*RX))+w/2))<w/2+9}
function plank(E,x,y,w){const G=E.G;G.fillStyle=E.lit("#9a7a52",1);G.strokeStyle="rgba(30,20,10,.6)";G.lineWidth=.5;G.beginPath();G.rect(x-w/2,y-2,w,4);G.fill();G.stroke()}
function boat(E,x,y,s){const G=E.G;G.save();G.fillStyle=E.lit("#2a2622",1);G.beginPath();G.moveTo(x-7*s,y-1.5*s);G.quadraticCurveTo(x,y+3*s,x+7*s,y-2.5*s);G.quadraticCurveTo(x,y,x-7*s,y-1.5*s);G.fill();G.fillStyle=E.lit("#b8362c",1);G.fillRect(x-1,y-3.5*s,2,2);G.restore()}
const P=(y,f)=>({y,f});


/* ---------- paleta okolia podľa mesta: strechy, múry, bridlica, trávnik ---------- */
const R0=["#a5312a","#b04a2a","#8a3a2a","#9a5a33","#7a4a2f","#a8402a"],W0=["#efe6d0","#e8d8b0","#e9c9a8","#f0e0c8","#d8cfb8","#ead0c0","#e0d8a8"];
const GR=["#8ab052","#6f9c42","#a8914a","#80a850","#7aa44c","#82aa4e","#7fae52","#9ec26a","#8fb04a","#6a9a3a","#a8c05a"];
const PALS={
 kra:{r:["#9a3a2a","#a84a30","#8a3426","#b05436","#7a3022","#a04030"],w:["#e8d4b8","#e0c4a4","#ecdcc0","#d8bca0","#e6cdb4","#d6b898","#eed8bc"],sl:"#6a5a58",st:"#d8c4a8",g:[1,1.02,.95]},
 vie:{r:["#c4622f","#b8562a","#d07036","#a84e26","#c8683a","#b45a2c"],w:["#f0e6d0","#ecdcb8","#f2e8d8","#e6d8c0","#efe0c8","#e8dcc4","#f4ecd8"],sl:"#6a7a6a",st:"#d8d2c0",g:[1.02,1.02,.95]},
 pra:{r:["#9a2f26","#a8402e","#8a2a22","#b04a34","#7a2620","#a03a2c"],w:["#ecd8a8","#e6cc98","#f0e0b8","#e0c490","#e8d4a4","#dcc088","#f2e4c0"],sl:"#3a3a4a",st:"#cfc6b0",g:[1,1,1]},
 ven:{r:["#c05a34","#b84e2c","#cc6a3c","#a84a28","#c86438","#b85630"],w:["#ecc8b0","#e8b898","#f0d4b0","#e4b0a0","#f0dcc0","#e6c0a4","#f4e0c4"],sl:"#8aa898",st:"#ece2c8",g:[.95,1.02,1.08]},
 par:{r:["#5a6a7a","#4e5e70","#66768a","#46566a","#5c6c80","#52627a"],w:["#ece2c8","#e6dab8","#f0e8d4","#e0d4b4","#e8dcc0","#dcd0b0","#f2eadc"],sl:"#4a5a6a",st:"#e2d8bc",g:[1,1.03,.95]},
 lon:{r:["#5a4a44","#4a4a52","#6a4a3a","#52484a","#6a5a50","#463e3e"],w:["#c8a888","#b89878","#d4b898","#a88868","#c4a484","#b08e6e","#d8c0a0"],sl:"#4a4a52",st:"#b0a48c",g:[.92,.98,.95]},
 brn:{r:["#a5402a","#b04a30","#8a3a2a","#c05a36","#9a4430","#a84a34"],w:["#ecdcb8","#e4d4a8","#f0e4c4","#dccca0","#e8d8b0","#d8c898","#f0e6cc"],sl:"#4a6a58",st:"#d6ccb4",g:[1,1.02,.95]},
 bud:{r:["#b8502e","#2f7a68","#a84a2c","#c05a36","#2a6a5a","#b0482a"],w:["#f0e6cc","#ecdcb0","#f2ead0","#e6d8b4","#eee0bc","#e0d2aa","#f4ecd4"],sl:"#3f7a6a",st:"#e0d6b8",g:[1.06,1,.88]},
 kut:{r:["#7a5a3a","#6a4a30","#8a6a44","#5a3e28","#7a5434","#6a4c34"],w:["#e0dccc","#d4d0c0","#e8e4d4","#c8c4b4","#dcd8c8","#cac6b8","#ece8dc"],sl:"#6a7274",st:"#c8c8bc",g:[1.08,1,.85]},
 nur:{r:["#8a3a2a","#7a3224","#9a4630","#6a2c20","#8e4030","#7e3626"],w:["#e0c8a0","#d8bc90","#e8d4ac","#ceb084","#dcc498","#c8a87c","#ecd8b4"],sl:"#5a4a44",st:"#c9a47a",g:[1.05,1,.9]},
 gda:{r:["#5a2a1e","#6a3226","#4a2a22","#7a3a2a","#522620","#643024"],w:["#b9674e","#c47a5a","#a8573e","#d09070","#b0604a","#c88062","#a45c44"],sl:"#4a2a22",st:"#b0654c",g:[.96,1,1.04]}};

const TER={
 pre:{rw:1.4,ma:1.2},
 kra:{wat:["#8aa4a4","#6f8a8c","#5a7476"],rd:"#c8ae80",mt:["#8a9aae","#b4c4d6"],ma:1.25,rw:1.1},
 vie:{wat:["#6fb0c0","#4f94aa","#3f7a90"],rd:"#d4c4a0",ma:1,rw:1.4},
 pra:{wat:["#7a9ab4","#5c7ea0","#486888"],rd:"#c8c0b0",mt:["#7a94a6","#9ab0c0"],ma:.9,rw:1.15},
 ven:{wat:["#74c0c8","#58a8b4","#44909c"],rd:"#d8d0c0",mt:["#8aa0bc","#b0c0d8"],ma:.6,rw:1.35},
 par:{wat:["#7aa6b4","#5f8c9c","#4a7484"],rd:"#c4bca8",mt:["#8aa0a8","#aab8bc"],ma:.55,rw:1.1},
 lon:{wat:["#8a9a9e","#6e8084","#586a70"],rd:"#a89468",mt:["#8a9aa0","#aab4b8"],ma:.5,rw:1.4},
 brn:{wat:["#76a8b8","#5a8ea2","#467688"],rd:"#cdb07c",ma:1,rw:.6},
 bud:{wat:["#6fa6b8","#4f8ca4","#3f7490"],rd:"#cdb07c",ma:1.1,rw:1.4},
 kut:{wat:["#8aaab4","#6e8e9a","#587884"],rd:"#bfb49c",mt:["#6a8a78","#8aa898"],ma:.9,rw:.6},
 nur:{wat:["#78b4c4","#5a98ac","#467e92"],rd:"#d8b88c",mt:["#7a9a8a","#9ab4a8"],ma:.8,rw:.7},
 gda:{wat:["#7a9cb8","#5a7ea0","#466688"],rd:"#c0906e",ma:.35,rw:1}};
window.OKTERR={rw:{},ma:{}};for(const k in TER){OKTERR.rw[k]=TER[k].rw;OKTERR.ma[k]=TER[k].ma}
const dk=(h,f)=>"#"+[1,3,5].map(i=>Math.max(0,Math.min(255,Math.round(parseInt(h.slice(i,i+2),16)*f))).toString(16).padStart(2,"0")).join("");
window.OKPAL=function(key){const p=PALS[key]||{r:R0,w:W0,sl:"#5d6a7a",st:"#c8bfa8",g:[1,1,1]},t=TER[key]||{};const m={};
 R0.forEach((h,i)=>m[h]=p.r[i]);W0.forEach((h,i)=>m[h]=p.w[i]);
 m["#8a4a2a"]=p.r[2];m["#9a3a2a"]=p.r[1];m["#a5412a"]=p.r[0];m["#7a3a2a"]=p.r[4];m["#6a3a28"]=p.r[4];m["#8a5a33"]=p.r[3];m["#9a3a2a"]=p.r[5];
 m["#5d6a7a"]=p.sl;m["#7a8a96"]=p.sl;m["#6a7a8a"]=p.sl;
 m["#e8dfc9"]=p.w[0];m["#eee6d2"]=p.w[0];m["#d8c8a0"]=p.w[4];m["#e2d9c2"]=p.st;m["#c8bfa8"]=p.st;m["#bfb6a0"]=p.st;m["#b9b0a0"]=p.st;
 const g=p.g;GR.forEach(h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const t=c.map((v,i)=>Math.max(0,Math.min(255,Math.round(v*g[i]))));m[h]="#"+t.map(v=>v.toString(16).padStart(2,"0")).join("")});
 if(t.wat){m["#6fa6cc"]=t.wat[0];m["#4f88b4"]=t.wat[1];m["#3f6f98"]=t.wat[2]}
 if(t.rd){m["#cdb07c"]=t.rd;m["#b79a68"]=dk(t.rd,.9);m["#7b6038"]=dk(t.rd,.58);m["#a8895a"]=dk(t.rd,.8)}
 if(t.mt){m["#8ea6bb"]=t.mt[0];m["#a9bdce"]=t.mt[1]}
 return m};

window.CITYCFG=function(key,E){
 const cx=()=>E.cx,cy=()=>E.cy;
 switch(key){
 case"pre":return{wall:"#d4ccb6",tw:{roof:"#a5312a",rh:16},
  centre:()=>[P(cy()-2,()=>{const x=cx(),y=cy();nave(E,x-12,y-4,50,20,22,13,"#dcd5c0","#6a7a8a");
    const t=sp(E,x+18,y+8,15,44,"#dcd5c0",22,"#5d6a7a",12);gold(E,x+18,t+4);}),
   P(cy()+20,()=>{E.house(cx()-52,cy()+16,28,18,16,"#e8d8b8","#9a3a2a",{beams:1});sp(E,cx()-40,cy()+10,8,26,"#e8d8b8",0,"#7a4a2f")})]};
 case"kra":return{wall:"#c9a590",tw:{roof:"#8a3a2a",rh:16},walls:["#e0c8b0","#d8b898","#e8d8b8","#cfa88c"],roofs:["#8a3a2a","#a04a30","#7a3a2a"],
  centre:()=>[P(cy()+10,()=>{const x=cx(),y=cy();E.box(x-20,y+10,76,18,14,"#e8dcc0",{stone:1});E.gable(x-20,y+10,76,18,14,7,"#8a5a3a",{wall:"#e8dcc0"});
    const G=E.G;G.fillStyle=E.lit("#d8cba8",1);for(let k=0;k<9;k++){const p=E.cor(x-20,y+10,76,18,k/8,1,14);G.fillRect(p[0]-1.5,p[1]-5,3,5)}}),
   P(cy()-6,()=>{const x=cx(),y=cy();nave(E,x-34,y-12,40,18,22,12,"#b45a3e","#7a3a2a");
    const t=sp(E,x-4,y-4,13,44,"#b45a3e",24,"#5d6a7a",8);const t2=sp(E,x-20,y-4,12,32,"#b45a3e",0,"#7a4a2a");E.cyl(x-20,y-4-32-1,4.8,5,"#d8b040","#d8b040",6)})]};
 case"vie":return{wall:"#d0cab8",tw:{roof:"#6a7a6a",rh:16},
  centre:()=>[P(cy()+2,()=>{const x=cx(),y=cy();nave(E,x-10,y-2,58,24,24,22,"#d2ccb8","#c0602e");
    const G=E.G;G.save();G.globalAlpha=.55;G.fillStyle="#2e7a8a";for(let k=0;k<7;k++){const p=E.cor(x-10,y-2,58,24,(k+.5)/7,1,24+6);G.beginPath();G.moveTo(p[0],p[1]-3);G.lineTo(p[0]+3,p[1]);G.lineTo(p[0],p[1]+3);G.lineTo(p[0]-3,p[1]);G.fill()}G.restore();
    const t=sp(E,x+30,y+12,16,56,"#d2ccb8",30,"#7a8a7a",14);sp(E,x-30,y-4,11,28,"#d2ccb8",0,"#8a5a3a")})]};
 case"pra":return{wall:"#cdc6b4",tw:{roof:"#2f2f3a",rh:20},
  centre:()=>[P(cy()-2,()=>{const x=cx(),y=cy();nave(E,x-14,y-2,44,22,22,14,"#d4cdb8","#7a4a3a");
    for(const dx of[-4,12]){sp(E,x+dx,y+10,13,38,"#d4cdb8",26,"#2a2a34",10)}}),
   P(cy()+14,()=>{const x=cx(),y=cy();E.box(x+34,y+12,26,18,20,"#e8dcbc",{stone:1});E.hip(x+34,y+12,26,18,20,10,"#7a4a3a");const t=sp(E,x+44,y+6,11,34,"#e8dcbc",12,"#5d6a7a",8);const G=E.G;G.fillStyle=E.lit("#2a4a8a",1);G.strokeStyle="#d8b040";G.lineWidth=.7;G.beginPath();G.arc(x+44+2,y+6+4-14,3.2,0,7);G.fill();G.stroke()})]};
 case"ven":{let blk=null;return{wall:"#e0d4b8",wallH:5,noTowers:1,noGates:1,floor:"#d6c9a8",walls:["#e8c8a8","#e6b898","#efd8b0","#e0b0a0","#f0e0c0"],roofs:["#b8502e","#c0603a","#a8482a"],
  pre:()=>{const G=E.G;G.save();const gr=G.createRadialGradient(cx(),cy(),20,cx(),cy(),E.RX+20);gr.addColorStop(0,E.lit("#5b9aaa",1));gr.addColorStop(1,E.lit("#4a8a9a",1));G.fillStyle=gr;G.beginPath();G.ellipse(cx(),cy()+4,E.RX+17,E.RY2+10,0,0,7);G.fill();G.strokeStyle="rgba(240,250,255,.4)";G.lineWidth=.8;for(let i=0;i<26;i++){const a=i*.7,px=cx()+Math.cos(a)*(E.RX+9),py=cy()+Math.sin(a)*(E.RY2+5);G.beginPath();G.moveTo(px-4,py);G.quadraticCurveTo(px,py-1.4,px+4,py);G.stroke()}G.restore()},
  under:()=>{blk=band(E,cy()+8,9,12,"#5b9aaa");const G=E.G;for(let i=0;i<5;i++){boat(E,cx()-80+i*38,cy()+14+Math.sin(i*1.4)*8,.9)}
    G.fillStyle=E.lit("#7a5a3a",1);for(let i=0;i<14;i++){const a=i/14*6.283;G.fillRect(cx()+Math.cos(a)*(E.RX+4)-1,cy()+Math.sin(a)*(E.RY2+2)-5,2,6)}
    for(const[bx,by]of[[cx()-30,cy()+10],[cx()+44,cy()+9],[cx()+88,cy()+10]])plank(E,bx,by,10)},
  block:(px,py)=>blk&&blk(px,py),cl:[60,30],
  centre:()=>[P(cy()-6,()=>{const x=cx(),y=cy();E.box(x-6,y-8,44,22,14,"#eadfc4",{stone:1});E.cyl(x-22,y-6,6,14,"#e6d8b8","#8aa898",9);E.cyl(x-6,y-6,7,18,"#e6d8b8","#8aa898",11);E.cyl(x+10,y-6,6,14,"#e6d8b8","#8aa898",9);
     E.hip(x-6,y-8,44,22,14,5,"#8aa898");const t=sp(E,x+34,y+4,12,52,"#b84a2c",0,"#5a8a6a");gold(E,x+34,t+6)}),
   P(cy()-20,()=>{const x=cx(),y=cy();E.box(x-50,y-22,40,16,14,"#ecc8b8",{stone:1});E.gable(x-50,y-22,40,16,14,7,"#a85a3a",{wall:"#ecc8b8"})})]}}
 case"par":{let blk=null;return{wall:"#cfc8b4",tw:{roof:"#3a4a5a",rh:15},
  under:()=>{blk=band(E,cy()+6,4,18,"#6a8fa0");const G=E.G;G.save();G.fillStyle=E.lit("#cfc6a8",1);G.strokeStyle="rgba(30,20,10,.55)";G.lineWidth=.8;G.beginPath();G.ellipse(cx()-8,cy()+15,54,11,0,0,7);G.fill();G.stroke();G.restore();boat(E,cx()+68,cy()+14,.9)},
  block:(px,py)=>blk&&blk(px,py),cl:[78,30],
  centre:()=>[P(cy()+12,()=>{const x=cx()-8,y=cy()+12;nave(E,x-6,y,46,18,20,11,"#d8d0b8","#5a6a7a");
     E.box(x+12,y+10,13,13,40,"#d8d0b8",{stone:1,win:true});E.box(x+27,y+10,13,13,40,"#d8d0b8",{stone:1,win:true});E.box(x+12,y+10-40,13,3,3,"#c8c0a8",{win:false,noShadow:1});E.box(x+27,y+10-40,13,3,3,"#c8c0a8",{win:false,noShadow:1});
     sp(E,x-8,y-20,4,6,"#c8c0a8",26,"#4a5a6a")}),
   ...(()=>{const X=()=>cx()-50,Y=()=>cy()-8,rf="#4a5a6a",wl="#d6ccb0",ts="#3a4a5a";return[
    P(Y()-26,()=>{const G=E.G,x=X(),y=Y();G.save();G.fillStyle=E.lit("#6a8fa0",1);G.strokeStyle="rgba(30,20,10,.5)";G.lineWidth=.7;G.beginPath();G.ellipse(x,y+2,40,20,0,0,7);G.fill();G.stroke();G.fillStyle=E.lit("#cfc6a8",1);G.beginPath();G.ellipse(x,y+2,31,15.5,0,0,7);G.fill();G.stroke();G.restore()}),
    P(Y()-11,()=>{const x=X(),y=Y();E.box(x,y-11,34,8,16,wl,{stone:1});E.hip(x,y-11,34,8,16,7,rf);E.cyl(x-19,y-9,4.6,28,"#cfc6a8",ts,13);E.cyl(x+19,y-9,4.6,28,"#cfc6a8",ts,13)}),
    P(Y()-1,()=>{const x=X(),y=Y();E.box(x-20,y+1,8,20,16,wl,{stone:1});E.hip(x-20,y+1,8,20,16,7,rf);E.box(x+20,y+1,8,20,16,wl,{stone:1});E.hip(x+20,y+1,8,20,16,7,rf);E.cyl(x-3,y,6.6,36,"#cfc6a8",ts,16);E.flag(x-3,y-54,10,"#2a3a8a")}),
    P(Y()+12,()=>{const x=X(),y=Y(),G=E.G;E.cyl(x-19,y+11,4.6,28,"#cfc6a8",ts,13);E.cyl(x+19,y+11,4.6,28,"#cfc6a8",ts,13);E.box(x-8,y+13,10,5,12,wl,{stone:1,win:false});E.box(x+8,y+13,10,5,12,wl,{stone:1,win:false});E.box(x,y+14,10,7,20,"#c8bea0",{stone:1,win:false});E.hip(x,y+14,10,7,20,8,rf);G.fillStyle="#1c1612";G.fillRect(x-2,y+10,4,5)})]})()]}}
 case"lon":{let blk=null;return{wall:"#bfb298",tw:{roof:"#4a4a52",rh:14},
  under:()=>{blk=band(E,cy()+16,3,14,"#7a9a9a");boat(E,cx()-60,cy()+22,.9);boat(E,cx()+20,cy()+26,.9);
    const G=E.G;G.fillStyle=E.lit("#b0a48c",1);G.strokeStyle="rgba(30,20,10,.55)";G.lineWidth=.6;G.beginPath();G.rect(cx()-96,cy()+17,20,14);G.fill();G.stroke()},
  block:(px,py)=>blk&&blk(px,py),cl:[60,28],
  centre:()=>[P(cy()-6,()=>{const x=cx(),y=cy();nave(E,x-22,y-8,62,18,18,10,"#d0c8b0","#5a5a64");const t=sp(E,x-6,y-4,9,28,"#d0c8b0",30,"#6a6a72");}),
   P(cy()+26,()=>{const x=cx()+92,y=cy()+30;E.box(x,y,28,22,30,"#f0ece0",{stone:1});for(const[dx,dy]of[[-12,-6],[12,-6],[-12,10],[12,10]])E.cyl(x+dx,y+dy+4,3.8,36,"#ece6d4","#6a6a72",8);E.flag(x,y-34,10,"#c0302a")})]}}
 case"brn":return{wall:"#cfc6b0",tw:{roof:"#7a3a2a",rh:15},
  centre:()=>[P(cy()-6,()=>{const x=cx(),y=cy(),G=E.G;G.save();G.fillStyle=E.lit("#9ab060",1);G.beginPath();G.ellipse(x-4,y-2,52,19,0,0,7);G.fill();G.restore();
     nave(E,x-14,y-6,44,20,22,12,"#dcd4c0","#6a7a6a");sp(E,x+10,y+4,11,44,"#dcd4c0",20,"#3f6a58");sp(E,x-14,y+4,11,44,"#dcd4c0",20,"#3f6a58")}),
   P(cy()+18,()=>{E.house(cx()+38,cy()+14,30,18,18,"#ecdcbc","#9a3a2a",{beams:1});sp(E,cx()+28,cy()+10,8,32,"#ecdcbc",10,"#5d6a7a")})]};
 case"bud":return{wall:"#d2cab4",tw:{roof:"#3f7a6a",rh:15},
  centre:()=>[P(cy()-2,()=>{const x=cx(),y=cy();nave(E,x-8,y-4,46,20,24,13,"#ebe0c4","#2f8a78");const G=E.G;G.save();G.globalAlpha=.7;G.fillStyle="#d8b038";for(let k=0;k<6;k++){const p=E.cor(x-8,y-4,46,20,(k+.5)/6,1,24+4);G.beginPath();G.moveTo(p[0],p[1]-3);G.lineTo(p[0]+3,p[1]);G.lineTo(p[0],p[1]+3);G.lineTo(p[0]-3,p[1]);G.fill()}G.restore();
     sp(E,x+24,y+6,14,48,"#d8d0b8",24,"#5a7a6a",12)}),
   P(cy()+20,()=>{const x=cx()-6,y=cy()+22;E.box(x,y,56,6,8,"#f2eee0",{win:false});for(let k=0;k<5;k++)E.cyl(x-24+k*12,y+3,3.4,16,"#f2eee0","#e8e4d4",9)}),
   P(cy()-12,()=>{const x=cx()-58,y=cy()-8;E.box(x,y,38,26,20,"#e4d8b8",{stone:1});E.hip(x,y,38,26,20,6,"#6a7a6a");E.cyl(x,y-12,8,8,"#6a8a7a","#6a8a7a",12)})]};
 case"kut":return{wall:"#cfc8b2",tw:{roof:"#8a3a2a",rh:15},
  centre:()=>[P(cy()+4,()=>{const x=cx(),y=cy();E.box(x-18,y+8,56,10,14,"#d8d0b8",{stone:1});
     E.cyl(x-16,y+6,9,30,"#dcd4bc","#7a8a8a",26);E.cyl(x+2,y+9,9,34,"#dcd4bc","#7a8a8a",30);E.cyl(x+20,y+6,9,28,"#dcd4bc","#7a8a8a",24)}),
   P(cy()-14,()=>{const x=cx()-50,y=cy()-10;E.house(x,y,34,20,18,"#e8dcbc","#a5412a",{beams:1});sp(E,x+22,y+2,9,30,"#e8dcbc",12,"#5d6a7a")}),
   P(cy()-20,()=>{const x=cx()+52,y=cy()-14,G=E.G;E.box(x,y,16,14,12,"#8a6a44",{win:false,beams:1});G.strokeStyle=E.lit("#5a3c22",1);G.lineWidth=1.6;G.beginPath();G.moveTo(x-6,y-6);G.lineTo(x,y-34);G.lineTo(x+6,y-6);G.moveTo(x-4,y-20);G.lineTo(x+4,y-20);G.stroke();G.beginPath();G.arc(x,y-34,3,0,7);G.stroke()})]};
 case"nur":return{wall:"#c9a47a",tw:{sq:1,roof:"#8a3a2a",rh:14},walls:["#e8d8b8","#e0c8a0","#d8b890","#ead8c0"],roofs:["#8a3a2a","#7a3a2a","#9a4a30"],
  centre:()=>[P(cy()-14,()=>{const x=cx(),y=cy()-8,G=E.G;G.save();G.fillStyle=E.lit("#a88860",1);G.beginPath();G.ellipse(x,y+10,62,16,0,0,7);G.fill();G.restore();
     E.box(x-14,y,52,22,20,"#d8bc90",{stone:1});E.gable(x-14,y,52,22,20,10,"#7a3a2a",{wall:"#d8bc90"});E.cyl(x+22,y+6,8,40,"#cdb088","#7a3a2a",16);E.flag(x+22,y-52,10,"#c0302a")}),
   P(cy()+14,()=>{const x=cx(),y=cy();nave(E,x-20,y+10,42,18,22,12,"#d8bc90","#7a3a2a");sp(E,x-4,y+20,12,40,"#d8bc90",18,"#4a5a50",8);sp(E,x+14,y+20,12,40,"#d8bc90",18,"#4a5a50",8)})]};
 case"gda":{let blk=null;return{wall:"#b0654c",tw:{roof:"#4a2a22",rh:14},walls:["#b9674e","#c47a5a","#a8573e","#d0a070","#c08a66"],roofs:["#5a2a1e","#6a3226","#4a2a22"],
  under:()=>{blk=band(E,cy()+20,2,12,"#6a8a96")},
  block:(px,py)=>blk&&blk(px,py)||(px>cx()+4&&px<cx()+78&&py>cy()+2&&py<cy()+36),cl:[60,28],
  centre:()=>[P(cy()+24,()=>{const G=E.G,x=cx()+30,y=cy()+22;G.save();G.strokeStyle=E.lit("#5a3c22",1);G.lineWidth=2;G.beginPath();G.moveTo(x-10,y+8);G.lineTo(x-10,y-22);G.moveTo(x+10,y+8);G.lineTo(x+10,y-22);G.moveTo(x-10,y-22);G.lineTo(x+10,y-22);G.stroke();G.fillStyle=E.lit("#8a6a44",1);G.fillRect(x-14,y-34,28,12);G.strokeRect(x-14,y-34,28,12);G.beginPath();G.arc(x-2,y-16,7,0,7);G.stroke();G.beginPath();G.moveTo(x-9,y-16);G.lineTo(x+5,y-16);G.moveTo(x-2,y-23);G.lineTo(x-2,y-9);G.stroke();G.restore()}),P(cy()-2,()=>{const x=cx(),y=cy();nave(E,x-8,y-2,66,24,26,15,"#a8523a","#4a2a22");sp(E,x+30,y+10,18,46,"#a8523a",14,"#4a2a22")}),
   P(cy()-16,()=>{E.house(cx()-56,cy()-14,34,20,18,"#c47a5a","#4a2a22");sp(E,cx()-42,cy()-18,8,26,"#c47a5a",10,"#4a2a22")})]}}
 }
 return null}
})();

;
