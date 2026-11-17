/* ==== js/dielne.js ==== */
/* Dielne v izometrickom maľovanom štýle (v13): pohľad zvonku, interiér s remeselníkmi, animácie výroby */
(function(){
"use strict";
if(!window.ISO)return;
const I=window.ISO,{box,gable,hip,house,cyl,tree,blob,barrel,sack,flag,isoQuad,poly,lit,cor,rng,lighten,shadow}=I;
let G,ST;
const prevScene=window.scene,prevInt=window.wsInterior;
const CACHE={};
const COLS=["#2f5bb0","#b8362c","#6d3f92","#7a4d2a","#3a7a4a","#a8742a"];
function setup(w,h,k,b){const c=document.createElement("canvas");c.width=Math.round(w*k);c.height=Math.round(h*k);G=c.getContext("2d");G.scale(k,k);const ph=(typeof todPh==="function")?todPh():1;ST={se:S.season,sn:S.season===3,ph,night:ph===3,tint:I.TINT[ph]||I.TINT[1],cid:(b&&b.id)||1};I.use(G,ST);return c}
const L=(h,f)=>lit(h,f);
/* ---------- ikony na vývesných štítoch ---------- */
function icon(k,x,y,s){G.save();G.translate(x,y);G.scale(s,s);G.fillStyle="#2b2117";G.strokeStyle="#2b2117";G.lineWidth=1.3;G.lineJoin="round";
 const P=a=>{G.beginPath();a.forEach((p,i)=>i?G.lineTo(p[0],p[1]):G.moveTo(p[0],p[1]));G.closePath();G.fill()};
 if(k==="anvil")P([[-7,-3],[7,-3],[4,0],[2,0],[2,3],[5,3],[5,6],[-5,6],[-5,3],[-2,3],[-2,0],[-5,0]]);
 else if(k==="loom"){G.strokeRect(-6,-6,12,12);for(let i=-3;i<=3;i+=3){G.beginPath();G.moveTo(i,-6);G.lineTo(i,6);G.stroke()}G.beginPath();G.moveTo(-6,0);G.lineTo(6,0);G.stroke()}
 else if(k==="bread"){G.beginPath();G.ellipse(0,0,7,4.5,0,0,7);G.fill();G.strokeStyle="#f4ead0";G.lineWidth=1;for(let i=-3;i<=3;i+=3){G.beginPath();G.moveTo(i-1,-2);G.lineTo(i+1,2);G.stroke()}}
 else if(k==="mug"){G.fillRect(-5,-5,9,11);G.beginPath();G.arc(5,0,3.2,-1.5,1.5);G.stroke()}
 else if(k==="flask"){P([[-1.5,-7],[1.5,-7],[1.5,-2],[6,6],[-6,6],[-1.5,-2]])}
 else if(k==="pot"){G.beginPath();G.ellipse(0,1,6.5,5.5,0,0,7);G.fill();G.fillRect(-4,-6,8,3)}
 else if(k==="saw"){G.beginPath();G.moveTo(-7,3);G.lineTo(7,-3);G.stroke();for(let i=-6;i<=5;i+=2.2){G.beginPath();G.moveTo(i,3-(i+7)*.43);G.lineTo(i+1,5-(i+7)*.43);G.stroke()}}
 else if(k==="hide")P([[-7,-4],[-3,-6],[0,-4],[3,-6],[7,-4],[5,0],[7,4],[2,6],[-2,4],[-6,6],[-5,1]]);
 else if(k==="coin"){G.beginPath();G.arc(0,0,6.5,0,7);G.stroke();G.fillRect(-1,-4,2,8);G.fillRect(-4,-1,8,2)}
 else if(k==="grape"){for(const[a,b]of[[-3,-3],[3,-3],[0,0],[-3,3],[3,3],[0,6]]){G.beginPath();G.arc(a,b,2.6,0,7);G.fill()}}
 else if(k==="quill"){G.beginPath();G.moveTo(-6,6);G.lineTo(5,-6);G.stroke();P([[5,-7],[8,-4],[2,2],[0,0]])}
 else if(k==="sack"){G.beginPath();G.ellipse(0,2,6,6,0,0,7);G.fill();G.fillRect(-2,-6,4,4)}
 else{G.beginPath();G.moveTo(-6,6);G.lineTo(6,-6);G.stroke();G.fillRect(-3,2,6,2)}
 G.restore()}
const ALIAS={pivovar:"vinar",mlyn:"pekar",sklaren:"hrnciar",tlaciaren:"pisaren",bana:"brloh"};
const ICON={kovac:"anvil",tkac:"loom",pekar:"bread",krcma:"mug",lekaren:"flask",hrnciar:"pot",tesar:"saw",garbiar:"hide",zlatnik:"coin",vinar:"grape",pisaren:"quill",kupec:"sack",brloh:"dagger",pasovanie:"mug"};
function signBoard(x,y,k){G.strokeStyle="#4a3220";G.lineWidth=1.6;G.beginPath();G.moveTo(x-18,y-26);G.lineTo(x,y-26);G.stroke();G.beginPath();G.moveTo(x-12,y-26);G.lineTo(x-12,y-22);G.moveTo(x-2,y-26);G.lineTo(x-2,y-22);G.stroke();
 G.fillStyle=L("#e8c878",1);G.strokeStyle="#2b2117";G.lineWidth=1;G.fillRect(x-17,y-22,18,18);G.strokeRect(x-17,y-22,18,18);icon(ICON[k]||"dagger",x-8,y-13,.95)}
/* ---------- spoločné pozadie ---------- */
function sky(w,h){const SK=[["#bcd2e8","#f4dcc4"],["#8cbce4","#eaf2f0"],["#d8783a","#f6cc7a"],["#0a1226","#22325a"]][ST.ph]||["#8cbce4","#eaf2f0"];const g=G.createLinearGradient(0,0,0,h*.55);g.addColorStop(0,SK[0]);g.addColorStop(1,SK[1]);G.fillStyle=g;G.fillRect(0,0,w,h);
 if(ST.night){const r=rng(3);for(let i=0;i<50;i++){G.fillStyle=`rgba(255,255,255,${.4+r()*.5})`;G.fillRect(r()*w,r()*h*.3,1.3,1.3)}}
 G.fillStyle=L(ST.sn?"#c9d6e0":"#8ea6bb",1);G.beginPath();G.moveTo(0,h*.42);[[.1,.3],[.22,.38],[.38,.24],[.55,.36],[.7,.27],[.85,.38],[1,.3]].forEach(p=>G.lineTo(p[0]*w,p[1]*h));G.lineTo(w,h*.5);G.lineTo(0,h*.5);G.fill();
 G.fillStyle=L(ST.sn?"#9fb3aa":ST.se===2?"#9a7a3a":"#3f6e3a",.9);G.beginPath();G.moveTo(0,h*.47);for(let x=0;x<=w;x+=16)G.lineTo(x,h*.45+Math.sin(x/21)*3);G.lineTo(w,h*.55);G.lineTo(0,h*.55);G.fill()}
function ground(w,h){const g0=["#8ab052","#6f9c42","#a8914a","#e4ecef"][ST.se];G.fillStyle=L(g0,1);G.fillRect(0,h*.5,w,h*.5);const r=rng(ST.cid*7+ST.se);for(let i=0;i<24;i++)lighten(r()*w,h*.5+r()*h*.5,40+r()*80,14+r()*30,ST.sn?"#ffffff":i%2?"#9bc460":"#648a38",.35);
 G.lineWidth=.8;for(let i=0;i<500;i++){const x=r()*w,y=h*.5+r()*h*.5;G.strokeStyle=ST.sn?"rgba(120,150,170,.35)":(r()<.5?"rgba(50,90,30,.3)":"rgba(210,230,150,.3)");G.beginPath();G.moveTo(x,y);G.lineTo(x+(r()-.5)*3,y-2-r()*3);G.stroke()}}
function finish(w,h,c){const gr=G.createImageData(48,48);for(let i=0;i<gr.data.length;i+=4){const v=128+Math.random()*60;gr.data[i]=gr.data[i+1]=gr.data[i+2]=v;gr.data[i+3]=255}const t=document.createElement("canvas");t.width=t.height=48;t.getContext("2d").putImageData(gr,0,0);
 G.save();G.globalAlpha=.05;G.globalCompositeOperation="overlay";G.fillStyle=G.createPattern(t,"repeat");G.fillRect(0,0,w,h);G.restore();
 const vg=G.createRadialGradient(w/2,h/2,h*.4,w/2,h/2,w*.65);vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,ST.night?"rgba(0,0,10,.45)":"rgba(40,25,10,.25)");G.fillStyle=vg;G.fillRect(0,0,w,h);
 if(ST.ph===0||ST.ph===2){G.save();G.globalCompositeOperation="soft-light";G.fillStyle=ST.ph===0?"rgba(160,190,230,.22)":"rgba(255,160,70,.28)";G.fillRect(0,0,w,h);G.restore()}
 try{return c.toDataURL("image/jpeg",.85)}catch(e){return c.toDataURL()}}
/* ---------- SVG postavy (animované) ---------- */
function wk(x,y,col,tool,delay,sc,flip){sc=sc||1.7;const skin="#e0b090";
 const arm={hammer:`<g class="arm ar-h"><path d="M0 0L9 -3" stroke="#3a2a1a" stroke-width="1.5"/><rect x="7" y="-8" width="5" height="4" fill="#6a6a70" stroke="#222" stroke-width=".4"/></g>`,stir:`<g class="arm ar-s"><path d="M0 0L8 3" stroke="#6b4423" stroke-width="1.5"/><circle cx="9" cy="4" r="1.4" fill="#6b4423"/></g>`,write:`<g class="arm ar-w"><path d="M0 0L7 2" stroke="#3a2a1a" stroke-width="1.4"/><path d="M7 2L11 -4" stroke="#f4ead0" stroke-width="1.2"/></g>`,carry:`<g class="arm"><rect x="2" y="-2" width="9" height="6" fill="#9b6a3e" stroke="#2b2117" stroke-width=".5"/></g>`,pour:`<g class="arm ar-p"><path d="M0 0L7 1" stroke="#3a2a1a" stroke-width="1.5"/><path d="M6 -2h5l-1 6h-3z" fill="#8a5a30" stroke="#2b2117" stroke-width=".4"/></g>`,none:""}[tool]||"";
 const hat=tool==="write"?`<path d="M-3.6 -19.4Q0 -24 3.6 -19.4Z" fill="#2b2f6a"/>`:`<path d="M-3.4 -19.6Q0 -23.6 3.4 -19.6Z" fill="#5a4632"/>`;
 return`<g class="wk" style="animation-delay:${delay||0}s" transform="translate(${x},${y}) scale(${flip?-sc:sc},${sc})"><ellipse cx="0" cy="0" rx="5" ry="1.6" fill="rgba(0,0,0,.28)"/><path d="M-3.4 0Q-4.2 -11 0 -14Q4.2 -11 3.4 0Z" fill="${col}" stroke="#1e140a" stroke-width=".5"/><path d="M-2.2 -8h4.4v7h-4.4z" fill="#d8cfae" opacity=".55"/><circle cy="-17.3" r="3" fill="${skin}" stroke="#1e140a" stroke-width=".45"/>${hat}<g transform="translate(1,-11)">${arm}</g></g>`}
function smoke(x,y,n,big){let s="";for(let i=0;i<(n||3);i++)s+=`<circle class="smk" cx="${x}" cy="${y}" r="${big?6:4}" style="animation-delay:${i*1.4}s"/>`;return s}
function glow(x,y,r){return`<circle class="fglow" cx="${x}" cy="${y}" r="${r}"/>`}
/* ---------- EXTERIÉR ---------- */
const EX={kovac:{wall:"#bdb4a2",roof:"#6a5a50",stone:1,fire:1},tkac:{wall:"#efe0c0",roof:"#a5402a",beams:1},pekar:{wall:"#f0e0bc",roof:"#b5502a",fire:1},krcma:{wall:"#e8d8b0",roof:"#8a3a2a",beams:1,fire:1},lekaren:{wall:"#e6e0d0",roof:"#4a6a8a"},hrnciar:{wall:"#d8b890",roof:"#8a4a2a",fire:1},tesar:{wall:"#c8a878",roof:"#6a4a2a",beams:1},garbiar:{wall:"#b8a07a",roof:"#5a4a38"},zlatnik:{wall:"#e8e0cc",roof:"#7a8a96",stone:1},vinar:{wall:"#e2c890",roof:"#8a3a2a",stone:1},pisaren:{wall:"#efe6d2",roof:"#5a6a7a"},kupec:{wall:"#e0c898",roof:"#7a3a2a",beams:1},pasovanie:{wall:"#8a7a68",roof:"#4a3a30",stone:1},brloh:{wall:"#7a6a58",roof:"#4a3a30"}};
function propsExt(t,cx,cy,lv,P,W){ // rekvizity pred budovou; P = pole workerov (miesta)
 const add=(f)=>P.push(f);
 const wk2=(x,y,tool,fl)=>W.push({x,y,tool,fl});
 const A=cx-150,B=cx+150;
 if(t==="kovac"){ // vonkajšie ohnisko, nákova, sud s vodou, uhlie
   box(A+20,cy+60,26,20,14,"#8a8478",{stone:1,win:false});G.fillStyle="#ff9a3a";G.beginPath();G.ellipse(A+24,cy+50,9,3,0,0,7);G.fill();
   box(A+62,cy+74,22,14,10,"#4a4a52",{win:false,noShadow:0});barrel(A+95,cy+82,2.1);for(let i=0;i<4;i++)sack(A+130+i*8,cy+84-i*2);
   wk2(A+70,cy+88,"hammer");wk2(A+36,cy+88,"stir")}
 else if(t==="tkac"){ // sušiace tyče so sfarbenými látkami
   for(let i=0;i<3;i++){const x=A+10+i*36,y=cy+52;G.strokeStyle="#4a3220";G.lineWidth=2;G.beginPath();G.moveTo(x,y);G.lineTo(x,y-30);G.moveTo(x+30,y);G.lineTo(x+30,y-30);G.moveTo(x-2,y-30);G.lineTo(x+32,y-30);G.stroke();poly([[x+2,y-30],[x+28,y-30],[x+28,y-8],[x+2,y-8]],L(["#b8362c","#2b4c8f","#d8b04a"][i],.9),"rgba(0,0,0,.4)",.6)}
   wk2(A+110,cy+78,"carry");wk2(A+150,cy+88,"stir")}
 else if(t==="pekar"){ // drevo, vozík s chlebom
   for(let r=0;r<3;r++)for(let i=0;i<5;i++){G.fillStyle=L("#8a6a40",.9-r*.06);G.beginPath();G.ellipse(A+12+i*7,cy+58-r*5,3.4,2.4,0,0,7);G.fill();G.strokeStyle="rgba(0,0,0,.5)";G.lineWidth=.5;G.stroke()}
   G.fillStyle=L("#9b6a3e",1);G.fillRect(A+80,cy+78,40,12);G.strokeStyle="#2b2117";G.lineWidth=.8;G.strokeRect(A+80,cy+78,40,12);for(let i=0;i<5;i++){G.fillStyle=L("#d8a84a",1);G.beginPath();G.ellipse(A+88+i*8,cy+77,3.6,2.4,0,0,7);G.fill()}for(const dx of[86,114]){G.beginPath();G.arc(A+dx,cy+92,5,0,7);G.stroke()}
   wk2(A+140,cy+84,"carry");wk2(A+170,cy+94,"stir")}
 else if(t==="krcma"){ // stoly s lavicami a sudy
   for(let i=0;i<2;i++){const x=A+30+i*70,y=cy+70+i*6;box(x,y,38,20,10,"#9b7a52",{win:false});box(x,y+18,38,8,5,"#8a6a44",{win:false,noShadow:1})}
   for(let i=0;i<3;i++)barrel(A+176+i*9,cy+66+i*3,2.4);wk2(A+36,cy+84,"pour");wk2(A+100,cy+92,"none")}
 else if(t==="lekaren"){ // bylinková záhrada
   isoQuad(A+70,cy+72,110,50,ST.sn?"#e4ecee":"#6a8a42",{rows:6,dir:"b",rowCol:"rgba(20,50,20,.3)"});for(let i=0;i<14;i++){G.fillStyle=L(["#c04a7a","#e8e060","#8a6ac0","#fff"][i%4],1);G.beginPath();G.arc(A+22+i*9,cy+68+(i%3)*8-(i%2)*5,2,0,7);G.fill()}
   wk2(A+120,cy+90,"stir")}
 else if(t==="hrnciar"){ // sušiace police s hrncami a pec
   for(let i=0;i<10;i++){const x=A+10+(i%5)*15,y=cy+58+Math.floor(i/5)*-12;G.fillStyle=L("#b8683a",1);G.beginPath();G.ellipse(x,y,5.2,5.6,0,0,7);G.fill();G.strokeStyle="rgba(0,0,0,.45)";G.lineWidth=.5;G.stroke();G.fillStyle=L("#6a3a22",1);G.beginPath();G.ellipse(x,y-5,3,1.2,0,0,7);G.fill()}
   cyl(A+130,cy+68,16,20,"#a8683a","#7a4a2a",12);wk2(A+60,cy+86,"stir");wk2(A+100,cy+92,"carry")}
 else if(t==="tesar"){ // guľatina, dosky, koza na pílenie
   for(let i=0;i<5;i++){G.fillStyle=L("#8a6a40",.8-i*.04);G.fillRect(A+10,cy+70-i*5,70,4)}for(let i=0;i<4;i++){G.fillStyle=L("#b08a58",1);G.beginPath();G.ellipse(A+96,cy+84-i*5,16,3,0,0,7);G.fill()}
   G.strokeStyle="#4a3220";G.lineWidth=2.4;G.beginPath();G.moveTo(A+120,cy+90);G.lineTo(A+130,cy+74);G.lineTo(A+140,cy+90);G.moveTo(A+150,cy+90);G.lineTo(A+160,cy+74);G.lineTo(A+170,cy+90);G.stroke();G.fillStyle=L("#c8a878",1);G.fillRect(A+126,cy+72,40,4);
   wk2(A+146,cy+92,"hammer");wk2(A+60,cy+94,"carry")}
 else if(t==="garbiar"){ // kade a rámy s kožami
   for(let i=0;i<2;i++)cyl(A+30+i*34,cy+66+i*5,13,10,"#7a5a3a",null,0);
   for(let i=0;i<3;i++){const x=A+120+i*34,y=cy+82;G.strokeStyle="#4a3220";G.lineWidth=1.6;G.strokeRect(x,y-28,26,28);poly([[x+2,y-26],[x+24,y-26],[x+22,y-2],[x+4,y-2]],L(["#b8885a","#9a6a3a","#caa078"][i],1),"rgba(0,0,0,.4)",.5)}
   wk2(A+78,cy+88,"stir")}
 else if(t==="zlatnik"){ // pevná truhla a hliadka
   box(A+30,cy+68,26,16,14,"#6a5a48",{win:false,stone:1});G.fillStyle="#d6aa4c";G.fillRect(A+28,cy+58,4,5);for(let i=0;i<3;i++){G.fillStyle="#f2d78d";G.beginPath();G.ellipse(A+64+i*5,cy+80-i,3,1.4,0,0,7);G.fill()}
   wk2(A+90,cy+86,"hammer")}
 else if(t==="vinar"){ // sudy, lis a debny s hroznom
   for(let i=0;i<4;i++)barrel(A+16+i*14,cy+60+(i%2)*6,3);box(A+120,cy+74,40,26,12,"#8a6a40",{win:false});for(let i=0;i<5;i++){G.fillStyle=L(ST.se===2?"#6a2a7a":"#8a3a7a",1);G.beginPath();G.arc(A+108+i*7,cy+62,3.2,0,7);G.fill()}
   wk2(A+80,cy+90,"carry");wk2(A+130,cy+94,"stir")}
 else if(t==="pisaren"){ // lavica so stolíkom a pergamenom
   box(A+30,cy+72,40,18,10,"#8a6a44",{win:false});poly([[A+20,cy+60],[A+40,cy+60],[A+36,cy+66],[A+18,cy+66]],"#f4ead0","#4a3220",.5);wk2(A+80,cy+86,"write");wk2(A+130,cy+92,"carry")}
 else if(t==="kupec"){ // debny, balíky a povoz
   for(let i=0;i<3;i++)box(A+16+i*30,cy+64+(i%2)*8,22,16,12,"#b88a50",{win:false,beams:1});for(let i=0;i<3;i++){G.fillStyle=L(["#d8cfae","#c8a070","#a85a3a"][i],1);G.beginPath();G.ellipse(A+120+i*14,cy+70,6,5,0,0,7);G.fill();G.strokeStyle="rgba(0,0,0,.5)";G.lineWidth=.5;G.stroke()}
   G.fillStyle=L("#9b6a3e",1);G.fillRect(A+150,cy+82,44,12);G.strokeStyle="#2b2117";G.lineWidth=.8;G.strokeRect(A+150,cy+82,44,12);for(const dx of[158,186]){G.beginPath();G.arc(A+dx,cy+96,6,0,7);G.stroke()}wk2(A+112,cy+92,"carry")}
 else if(t==="pasovanie"){ // poklop do pivnice, sudy, lampáš
   box(A+30,cy+70,34,22,6,"#4a3a2c",{win:false});poly([[A+22,cy+66],[A+44,cy+66],[A+44,cy+72],[A+22,cy+72]],"#1c1612");for(let i=0;i<4;i++)barrel(A+86+i*12,cy+74+(i%2)*4,2.6);wk2(A+60,cy+92,"carry")}
 else if(t==="brloh"){ // tábor: stany, ohnisko, truhly
   for(let i=0;i<2;i++){const x=A+28+i*62,y=cy+66+i*10;poly([[x-20,y],[x,y-26],[x+20,y]],L(i?"#7a5a3a":"#5a6a4a",.9),"#1e140a",.6);poly([[x,y-26],[x+20,y],[x+4,y]],L("#3a3a2a",.9))}
   G.fillStyle=L("#5a4a3a",1);for(let i=0;i<5;i++){G.beginPath();G.ellipse(A+130+Math.cos(i*1.26)*8,cy+84+Math.sin(i*1.26)*3.6,2.4,1.6,0,0,7);G.fill()}
   box(A+170,cy+80,18,12,9,"#6a4a2a",{win:false});wk2(A+110,cy+96,"none");wk2(A+146,cy+98,"none")}
 return}
function extFor(b){
 const t=ALIAS[b.type]||b.type,lv=Math.max(1,Math.min(3,b.lvl||1)),cfg=EX[t]||EX.kupec,W0=480,H0=270;
 const c=setup(W0,H0,2.13,b);sky(W0,H0);ground(W0,H0);
 const cx=250,cy=140;
 // ulica pred budovou
 G.save();isoQuad(cx,cy+84,330,50,ST.sn?"#dfe6e8":"#cdb893",{rows:0});const r0=rng(b.id*3+1);G.globalAlpha=.3;G.strokeStyle="#000";G.lineWidth=.5;for(let i=0;i<34;i++){G.beginPath();G.arc(cx-130+r0()*260,cy+66+r0()*30,2+r0()*2,0,7);G.stroke()}G.restore();
 // susedné domy (v hmle)
 G.save();G.globalAlpha=.9;house(40,cy-8,60,44,36,"#e8d8b0","#8a5a33",{beams:1});house(448,cy-6,60,44,38,"#efe6d0","#a5402a");G.restore();
 tree(18,cy+22,1.5,"oak",3);tree(466,cy+30,1.4,"pine",5);
 const pr=[],Wk=[];
 // budova
 const sz=[0,[150,104,56],[170,110,64],[186,116,84]][lv];const a=sz[0],bb=sz[1],h=sz[2];
 const wc=cfg.wall,rc=cfg.roof;
 if(t==="brloh"){ // jaskyňa v skale
  hillRock(cx+10,cy-6);}
 else{
  if(lv>=2){const wa=70,wb=70;box(cx-a*.5-wa*.2,cy+34,wa,wb,h-20,wc,{stone:cfg.stone,beams:cfg.beams});gable(cx-a*.5-wa*.2,cy+34,wa,wb,h-20,28,rc,{wall:wc})}
  box(cx,cy,a,bb,h,wc,{stone:cfg.stone,beams:cfg.beams});
  gable(cx,cy,a,bb,h+(lv>=3?26:0)*0,Math.min(a,bb)*.42,rc,{wall:wc,chim:1});
  if(lv>=3){const c3=(i,j,z)=>cor(cx,cy,a,bb,i,j,z);cyl(c3(.1,1.05,0)[0],c3(.1,1.05,0)[1],9,h+34,wc,rc,22)}
  // dvere
  const cc=(i,j,z)=>cor(cx,cy,a,bb,i,j,z);poly([cc(.14,1,0),cc(.28,1,0),cc(.28,1,28),cc(.14,1,28)],"#3a2412","#1c1208",.8);
  // okenice / kvety
  for(const u of[.42,.62,.82]){poly([cc(u,1,h*.42),cc(u+.08,1,h*.42),cc(u+.08,1,h*.42+14),cc(u,1,h*.42+14)],"#2b2f3a","#2b2117",.6)}
  if(ST.night){for(const u of[.42,.62,.82]){G.save();G.globalAlpha=.6;G.fillStyle="#ffd070";const m=cc(u+.04,1,h*.42+7);G.fillRect(m[0]-3,m[1]-5,7,10);G.restore()}}
  signBoard(cc(.2,1,0)[0]+16,cc(.2,1,0)[1]-h*.6,t);
 }
 // vlajka rodu
 const own=(b.owner!=null)?DC(b.owner):"#b8362c";flag(cx+a*.34,cy-h-24,38,own);
 propsExt(t,cx,cy,lv,pr,Wk);
 // druhá vrstva: stromy popredie
 tree(30,cy+104,1.5,"oak",9);tree(456,cy+100,1.6,"pine",11);
 const url=finish(W0,H0,c);
 const ch=cor(cx,cy,a,bb,.3,.5,h+bb*.2);
 return{url,Wk,smk:cfg.fire?[ch[0],ch[1]-4]:null,fire:t==="kovac"||t==="pekar"||t==="hrnciar",cx,cy,h}}
function hillRock(x,y){G.fillStyle=L("#6a6258",1);G.beginPath();G.moveTo(x-170,y+60);G.quadraticCurveTo(x-120,y-70,x-30,y-80);G.quadraticCurveTo(x+60,y-100,x+120,y-40);G.quadraticCurveTo(x+170,y,x+180,y+60);G.closePath();G.fill();G.strokeStyle="rgba(0,0,0,.5)";G.lineWidth=1;G.stroke();G.fillStyle=L("#8a8274",1);G.beginPath();G.moveTo(x-120,y+10);G.quadraticCurveTo(x-100,y-60,x-30,y-70);G.quadraticCurveTo(x-60,y-20,x-60,y+30);G.fill();
 G.fillStyle="#0e0a07";G.beginPath();G.moveTo(x-34,y+60);G.quadraticCurveTo(x-34,y-10,x+16,y-14);G.quadraticCurveTo(x+66,y-10,x+66,y+60);G.closePath();G.fill();G.strokeStyle="rgba(0,0,0,.7)";G.lineWidth=2;G.stroke();
 G.fillStyle=ST.night?"rgba(255,170,70,.5)":"rgba(255,150,60,.25)";G.beginPath();G.ellipse(x+16,y+40,22,10,0,0,7);G.fill()}
/* ---------- INTERIÉR ---------- */
function roomWalls(cx,cy,A,B,Hh,wall,wall2,beam){const c=(i,j,z)=>cor(cx,cy,A,B,i,j,z);
 poly([c(0,0,0),c(0,1,0),c(0,1,Hh),c(0,0,Hh)],L(wall,.84),"rgba(20,10,0,.6)",1);
 poly([c(0,0,0),c(1,0,0),c(1,0,Hh),c(0,0,Hh)],L(wall2||wall,.68),"rgba(20,10,0,.6)",1);
 G.save();G.globalAlpha=.16;G.strokeStyle="#000";G.lineWidth=.6;for(let z=14;z<Hh;z+=14){for(const[p,q]of[[c(0,0,z),c(0,1,z)],[c(0,0,z),c(1,0,z)]]){G.beginPath();G.moveTo(p[0],p[1]);G.lineTo(q[0],q[1]);G.stroke()}}G.restore();
 // trámy
 G.strokeStyle=L("#4a3220",.9);G.lineWidth=4;for(const u of[.3,.7]){let p=c(0,u,0),q=c(0,u,Hh);G.beginPath();G.moveTo(p[0],p[1]);G.lineTo(q[0],q[1]);G.stroke();p=c(u,0,0);q=c(u,0,Hh);G.beginPath();G.moveTo(p[0],p[1]);G.lineTo(q[0],q[1]);G.stroke()}
 poly([c(0,0,Hh),c(1,0,Hh),c(1,0,Hh+6),c(0,0,Hh+6)],L("#4a3220",.7));poly([c(0,0,Hh),c(0,1,Hh),c(0,1,Hh+6),c(0,0,Hh+6)],L("#4a3220",.85))}
function floorIso(cx,cy,A,B,col,lvl){const c=(i,j,z)=>cor(cx,cy,A,B,i,j,z||0);poly([c(0,0),c(1,0),c(1,1),c(0,1)],L(col,1),"rgba(20,10,0,.6)",1.2);
 G.save();G.strokeStyle="rgba(0,0,0,.22)";G.lineWidth=.7;const n=lvl>=3?12:9;for(let k=1;k<n;k++){const u=k/n;let p=c(u,0),q=c(u,1);G.beginPath();G.moveTo(p[0],p[1]);G.lineTo(q[0],q[1]);G.stroke();if(lvl>=3){p=c(0,u);q=c(1,u);G.beginPath();G.moveTo(p[0],p[1]);G.lineTo(q[0],q[1]);G.stroke()}}G.restore();
 // zanesená dlaždica / koberec
 G.save();G.globalAlpha=.9}
function wallWin(cx,cy,A,B,Hh,side,u0,u1){const c=(i,j,z)=>cor(cx,cy,A,B,i,j,z);const pts=side==="r"?[c(u0,0,Hh*.35),c(u1,0,Hh*.35),c(u1,0,Hh*.8),c(u0,0,Hh*.8)]:[c(0,u0,Hh*.35),c(0,u1,Hh*.35),c(0,u1,Hh*.8),c(0,u0,Hh*.8)];
 poly(pts,ST.night?"#2a3550":L("#9fc6e6",1),"#3a2a14",2);G.save();G.strokeStyle="#3a2a14";G.lineWidth=1.4;const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];let p=m(pts[0],pts[3]),q=m(pts[1],pts[2]);G.beginPath();G.moveTo(p[0],p[1]);G.lineTo(q[0],q[1]);p=m(pts[0],pts[1]);q=m(pts[3],pts[2]);G.beginPath();G.moveTo(p[0],p[1]);G.lineTo(q[0],q[1]);G.stroke();G.restore();
 if(!ST.night){G.save();G.globalAlpha=.16;G.fillStyle="#fff6c0";const f=c(side==="r"?u0:0,side==="r"?0:u0,0),g=c(side==="r"?u1:0,side==="r"?0:u1,0);G.beginPath();G.moveTo(pts[0][0],pts[0][1]);G.lineTo(pts[1][0],pts[1][1]);G.lineTo(g[0]+40,g[1]+30);G.lineTo(f[0]+40,f[1]+30);G.fill();G.restore()}}
function wallShelf(cx,cy,A,B,side,u0,u1,z,items){const c=(i,j,zz)=>cor(cx,cy,A,B,i,j,zz);const f=side==="r"?(u,zz)=>c(u,0,zz):(u,zz)=>c(0,u,zz);
 const a=f(u0,z),b2=f(u1,z);poly([a,b2,[b2[0],b2[1]+4],[a[0],a[1]+4]],L("#6a4a2a",1),"#2a1a0a",.6);
 const n=items.length;for(let i=0;i<n;i++){const u=u0+(u1-u0)*(i+.5)/n,p=f(u,z);const it=items[i];G.fillStyle=L(it.c||"#b8683a",1);G.strokeStyle="rgba(0,0,0,.5)";G.lineWidth=.5;if(it.k==="book"){G.fillRect(p[0]-2,p[1]-9,4,9);G.strokeRect(p[0]-2,p[1]-9,4,9)}else if(it.k==="jar"){G.fillRect(p[0]-3,p[1]-8,6,8);G.strokeRect(p[0]-3,p[1]-8,6,8);G.fillStyle=L("#c8a870",1);G.fillRect(p[0]-3,p[1]-10,6,2)}else{G.beginPath();G.ellipse(p[0],p[1]-4,4,4.4,0,0,7);G.fill();G.stroke()}}}
function wallTools(cx,cy,A,B,side,u0,u1,z,n){const c=(i,j,zz)=>cor(cx,cy,A,B,i,j,zz);const f=side==="r"?(u,zz)=>c(u,0,zz):(u,zz)=>c(0,u,zz);G.strokeStyle="#3a2a1a";G.lineWidth=1.4;for(let i=0;i<n;i++){const u=u0+(u1-u0)*(i+.5)/n,p=f(u,z),q=f(u,z-26-(i%3)*5);G.beginPath();G.moveTo(p[0],p[1]);G.lineTo(q[0],q[1]);G.stroke();G.fillStyle=L("#7a7a82",1);G.fillRect(q[0]-3,q[1]-1,6,5)}}
function tbl(x,y,a,b,h,col){box(x,y,a,b,h,col||"#9b7a52",{win:false})}
function fireBox(x,y,w,hh,col){box(x,y,w,w*.7,hh,col||"#8a8478",{stone:1,win:false});G.fillStyle="#150c06";const c=(i,j,z)=>cor(x,y,w,w*.7,i,j,z);poly([c(.2,1,0),c(.8,1,0),c(.8,1,hh*.6),c(.2,1,hh*.6)],"#150c06");G.fillStyle="#ff9a3a";G.beginPath();G.ellipse(c(.5,1,4)[0],c(.5,1,4)[1],w*.1,4,0,0,7);G.fill();G.fillStyle="#ffd070";G.beginPath();G.ellipse(c(.5,1,4)[0],c(.5,1,4)[1]+1,w*.05,2.4,0,0,7);G.fill()}
function crateStack(x,y,n,col){for(let i=0;i<n;i++)box(x+(i%2)*8,y-(i>>1)*0+(i%2)*3,18,14,11+((i*7)%5),col||"#b88a50",{win:false,beams:1})}
const INT_COL={kovac:["#8a7e6c","#6a6050","#54483a"],tkac:["#d9c8a2","#c8b48a","#7a5a3a"],pekar:["#d9c8a2","#c4b088","#7a5a3a"],krcma:["#9b7a52","#7a5a3a","#5a3e26"],lekaren:["#d6cdb7","#bdb298","#8a6a44"],hrnciar:["#c8a880","#a88862","#7a5a3a"],tesar:["#c8a878","#a88858","#7a5a3a"],garbiar:["#a8947a","#8a7860","#5a4a36"],zlatnik:["#cfc6b0","#aaa090","#6a5a48"],vinar:["#b99a6a","#9a7c50","#5a3e26"],pisaren:["#e0d4b4","#c4b690","#7a5a3a"],kupec:["#c9b48a","#a89468","#6a4a2a"],pasovanie:["#7a6a58","#665646","#3e3226"],brloh:["#7a6a58","#665646","#3e3226"]};
function intFor(b){
 const t=ALIAS[b.type]||b.type,lv=Math.max(1,Math.min(3,b.lvl||1)),dark=t==="brloh"||t==="pasovanie",W0=[0,400,440,480][lv],H0=[0,262,288,314][lv];
 const c=setup(W0,H0,2.4,b);const col=INT_COL[t]||INT_COL.kupec;
 G.fillStyle=ST.night?"#0a0e1c":"#3a2c20";G.fillRect(0,0,W0,H0);
 const A=[0,350,400,440][lv],B=[0,265,300,330][lv],cx=W0/2,Hh=[0,100,108,115][lv],cy=(H0-((A+B)/4+Hh))/2+(A+B)/8+Hh;
 roomWalls(cx,cy,A,B,Hh,col[0],col[1]);
 floorIso(cx,cy,A,B,dark?"#3a2e24":col[2],lv);
 const C=(i,j,z)=>cor(cx,cy,A,B,i,j,z||0);
 const lights=[];const st=[]; // stanice pracovníkov
 // okná
 if(!dark){wallWin(cx,cy,A,B,Hh,"r",.5,.62);if(lv>=2)wallWin(cx,cy,A,B,Hh,"l",.38,.5);if(lv>=3)wallWin(cx,cy,A,B,Hh,"r",.76,.88)}
 // objekty zoradené podľa hĺbky
 const O=[];const add=(i,j,f,tool,fl)=>{const p=C(i,j,0);O.push({y:p[1],f:()=>f(p[0],p[1])});if(tool)st.push({x:p[0],y:p[1]+(fl===undefined?16:fl),tool})};
 const wlow={kovac:()=>{fireBox(C(.12,.28,0)[0],C(.12,.28,0)[1],64,48);wallTools(cx,cy,A,B,"l",.5,.85,92,5);O.push({y:C(.12,.28)[1],f:()=>0});
   add(.3,.34,(x,y)=>box(x,y,34,22,12,"#4a4a52",{win:false}),"hammer");add(.46,.62,(x,y)=>barrel(x,y,2.6),"none");add(.52,.2,(x,y)=>{for(let i=0;i<4;i++)sack(x+i*9,y-i*2)},null);if(lv>=2)add(.66,.38,(x,y)=>box(x,y,40,22,12,"#6a6a72",{win:false}),"hammer");if(lv>=3)add(.74,.7,(x,y)=>tbl(x,y,56,26,13),"carry");
   add(.86,.16,(x,y)=>{for(let i=0;i<5;i++){poly([[x+i*8-2,y-22],[x+i*8+2,y-22],[x+i*8+1,y],[x+i*8-1,y]],"#9aa0aa","#222",.5)}},null)},
  tkac:()=>{wallShelf(cx,cy,A,B,"r",.1,.4,86,[{c:"#b8362c"},{c:"#2b4c8f"},{c:"#d8b04a"},{c:"#3a7a4a"}]);
   for(let k=0;k<(lv>=2?3:2);k++)add(.28+k*.26,.3+k*.12,(x,y)=>{box(x,y,48,16,38,"#8a6a44",{win:false});const cc=(i,j,z)=>cor(x,y,48,16,i,j,z);for(let q=1;q<8;q++){G.strokeStyle="#e8d8a0";G.lineWidth=.6;const p=cc(q/8,1,4),r=cc(q/8,1,34);G.beginPath();G.moveTo(p[0],p[1]);G.lineTo(r[0],r[1]);G.stroke()}poly([cc(.1,1,12),cc(.9,1,12),cc(.9,1,26),cc(.1,1,26)],L(["#b8362c","#2b4c8f","#3a7a4a"][k%3],.9))},"stir");
   add(.78,.64,(x,y)=>{for(let i=0;i<4;i++){G.fillStyle=L(["#d8cfae","#b8362c","#2b4c8f","#3a7a4a"][i],1);G.beginPath();G.ellipse(x+i*7,y-i*3,6,3,0,0,7);G.fill();G.strokeStyle="rgba(0,0,0,.45)";G.lineWidth=.5;G.stroke()}},null)},
  pekar:()=>{fireBox(C(.14,.26)[0],C(.14,.26)[1],78,58,"#a8683a");wallShelf(cx,cy,A,B,"r",.18,.46,92,[{c:"#d8a84a"},{c:"#c8903a"},{c:"#d8a84a"},{c:"#b87a2a"}]);
   add(.36,.5,(x,y)=>tbl(x,y,60,34,15,"#b89868"),"stir");add(.6,.28,(x,y)=>{for(let i=0;i<3;i++)box(x+i*10,y+i*3,14,10,8,"#8a6a40",{win:false})},null);add(.72,.62,(x,y)=>{for(let i=0;i<4;i++)sack(x+i*8,y-i)},"carry");if(lv>=2)add(.5,.78,(x,y)=>tbl(x,y,46,24,13),"stir")},
  krcma:()=>{wallShelf(cx,cy,A,B,"r",.14,.5,88,[{k:"jar",c:"#8a5a30"},{k:"jar",c:"#6a4a2a"},{k:"jar",c:"#9a6a3a"},{k:"jar",c:"#6a4a2a"}]);for(let i=0;i<3;i++)add(.1+i*.1,.4+i*.14,(x,y)=>barrel(x,y,3.4),null);
   add(.38,.62,(x,y)=>box(x,y,90,22,18,"#7a4a2a",{win:false}),"pour",20);add(.64,.4,(x,y)=>{tbl(x,y,44,26,14);},null);add(.74,.74,(x,y)=>{tbl(x,y,44,26,14)},null);if(lv>=2)add(.4,.86,(x,y)=>tbl(x,y,44,26,14),null)},
  lekaren:()=>{wallShelf(cx,cy,A,B,"r",.1,.45,100,[{k:"jar",c:"#6a9a5a"},{k:"jar",c:"#c0507a"},{k:"jar",c:"#d8b04a"},{k:"jar",c:"#6a8ac0"}]);wallShelf(cx,cy,A,B,"r",.1,.45,70,[{k:"jar",c:"#c8a870"},{k:"jar",c:"#6a9a5a"},{k:"jar",c:"#8a6ac0"},{k:"jar",c:"#d8b04a"}]);wallShelf(cx,cy,A,B,"l",.3,.7,92,[{k:"book",c:"#6a2a2a"},{k:"book",c:"#2a4a6a"},{k:"book",c:"#3a5a3a"},{k:"book",c:"#6a2a2a"},{k:"book",c:"#2a4a6a"}]);
   add(.36,.46,(x,y)=>{tbl(x,y,60,30,15,"#a88858");cyl(x-8,y-14,5,7,"#cfc6b0",null,0);G.fillStyle="#6a9a5a";G.beginPath();G.arc(x+10,y-18,4,0,7);G.fill()},"stir");add(.62,.7,(x,y)=>tbl(x,y,52,26,13,"#a88858"),"stir");if(lv>=2)add(.72,.3,(x,y)=>{cyl(x,y,9,26,"#b8683a","#7a4a2a",8)},null)},
  brloh:()=>{add(.4,.5,(x,y)=>{for(let i=0;i<6;i++){G.fillStyle=L("#6a5a4a",1);G.beginPath();G.ellipse(x+Math.cos(i*1.05)*14,y+Math.sin(i*1.05)*6,4,2.6,0,0,7);G.fill()}G.fillStyle="#ff9a3a";G.beginPath();G.moveTo(x-6,y);G.quadraticCurveTo(x-6,y-14,x,y-18);G.quadraticCurveTo(x+6,y-14,x+6,y);G.fill();G.fillStyle="#ffd070";G.beginPath();G.moveTo(x-3,y);G.quadraticCurveTo(x-3,y-8,x,y-11);G.quadraticCurveTo(x+3,y-8,x+3,y);G.fill();lights.push([x,y-8,70])},"none");
   add(.18,.3,(x,y)=>box(x,y,34,22,14,"#6a4a2a",{win:false}),null);add(.74,.3,(x,y)=>box(x,y,30,20,12,"#6a4a2a",{win:false}),null);add(.66,.7,(x,y)=>{poly([[x-18,y],[x,y-20],[x+18,y]],"#4a3a2a","#111",.6)},"none");add(.3,.72,(x,y)=>{poly([[x-18,y],[x,y-20],[x+18,y]],"#5a4a3a","#111",.6)},"none")},
  pasovanie:()=>{for(let i=0;i<5;i++)add(.1+i*.07,.3+(i%2)*.12,(x,y)=>barrel(x,y,3),null);add(.5,.5,(x,y)=>{tbl(x,y,50,28,14,"#5a4a3a");lights.push([x,y-18,60])},"carry");add(.66,.3,(x,y)=>crateStack(x,y,4,"#6a4a2a"),null);add(.74,.72,(x,y)=>crateStack(x,y,3,"#5a3a22"),"carry")},
  hrnciar:()=>{wallShelf(cx,cy,A,B,"r",.12,.5,92,[{c:"#b8683a"},{c:"#c8783a"},{c:"#a8583a"},{c:"#b8683a"}]);wallShelf(cx,cy,A,B,"r",.12,.5,66,[{c:"#c8783a"},{c:"#a8583a"},{c:"#b8683a"},{c:"#c8783a"}]);
   add(.12,.4,(x,y)=>{cyl(x,y,22,38,"#a8683a","#7a4a2a",14);G.fillStyle="#150c06";G.beginPath();G.ellipse(x,y-6,8,5,0,0,7);G.fill();G.fillStyle="#ff9a3a";G.beginPath();G.ellipse(x,y-5,5,3,0,0,7);G.fill()},null);
   for(let k=0;k<(lv>=2?2:1);k++)add(.44+k*.24,.52+k*.12,(x,y)=>{cyl(x,y-4,12,6,"#7a5a3a",null,0);cyl(x,y-10,5,5,"#b8683a",null,0)},"stir");add(.72,.3,(x,y)=>tbl(x,y,56,26,13),"carry");if(lv>=3)add(.8,.7,(x,y)=>{for(let i=0;i<6;i++){G.fillStyle=L("#b8683a",1);G.beginPath();G.ellipse(x+(i%3)*10,y-(i>>1)*4,5,5.4,0,0,7);G.fill()}},null)},
  tesar:()=>{wallTools(cx,cy,A,B,"r",.1,.5,98,6);wallShelf(cx,cy,A,B,"l",.4,.8,80,[{c:"#b08a58"},{c:"#8a6a40"},{c:"#c8a070"}]);
   add(.4,.34,(x,y)=>box(x,y,70,24,17,"#b08a58",{win:false}),"hammer");add(.6,.56,(x,y)=>{box(x,y,60,22,15,"#a88858",{win:false})},"hammer");add(.22,.62,(x,y)=>{for(let i=0;i<6;i++){G.fillStyle=L("#c8a070",1);G.fillRect(x-14+i*2,y-i*4,34,3)}},null);add(.76,.3,(x,y)=>{for(let i=0;i<4;i++){G.fillStyle=L("#8a6a40",.9);G.beginPath();G.ellipse(x+i*12,y,6,3,0,0,7);G.fill()}},null);if(lv>=3)add(.8,.78,(x,y)=>tbl(x,y,56,24,13),"carry")},
  garbiar:()=>{for(let i=0;i<3;i++){const u=.14+i*.24;add(u,.38+i*.06,(x,y)=>{cyl(x,y,18,18,"#7a5a3a",null,0);G.fillStyle=L("#4a3a26",1);G.beginPath();G.ellipse(x,y-18,15,7.5,0,0,7);G.fill()},i<2?"stir":null)}
   wallShelf(cx,cy,A,B,"r",.5,.9,88,[{c:"#b8885a"},{c:"#9a6a3a"},{c:"#caa078"}]);add(.72,.62,(x,y)=>{G.strokeStyle="#4a3220";G.lineWidth=2;G.strokeRect(x-14,y-40,28,36);poly([[x-12,y-38],[x+12,y-38],[x+10,y-6],[x-10,y-6]],L("#b8885a",1),"rgba(0,0,0,.4)",.5)},"stir");add(.46,.78,(x,y)=>tbl(x,y,52,24,13),"carry")},
  zlatnik:()=>{fireBox(C(.14,.3)[0],C(.14,.3)[1],46,38,"#8a8478");wallShelf(cx,cy,A,B,"r",.3,.6,92,[{c:"#d6aa4c"},{c:"#c8c8d0"},{c:"#d6aa4c"}]);
   add(.4,.5,(x,y)=>{tbl(x,y,60,30,15,"#6a5a48");G.fillStyle="#f2d78d";G.beginPath();G.ellipse(x-6,y-18,6,2.6,0,0,7);G.fill()},"hammer");add(.7,.3,(x,y)=>box(x,y,30,24,22,"#4a4a52",{win:false,stone:1}),null);add(.66,.7,(x,y)=>tbl(x,y,56,26,14,"#8a6a44"),"carry");if(lv>=3)add(.84,.5,(x,y)=>box(x,y,26,20,28,"#5a5a64",{win:false,stone:1}),null)},
  vinar:()=>{for(let i=0;i<4;i++)add(.1+i*.12,.22+i*.02,(x,y)=>{cyl(x,y,20,34,"#8a5a30",null,0);G.strokeStyle="rgba(0,0,0,.5)";G.lineWidth=1;G.beginPath();G.ellipse(x,y-10,20,10,0,0,Math.PI);G.stroke();G.beginPath();G.ellipse(x,y-22,20,10,0,0,Math.PI);G.stroke()},null);
   add(.5,.5,(x,y)=>{cyl(x,y,16,12,"#8a6a40",null,0);G.fillStyle=L("#6a2a7a",1);G.beginPath();G.ellipse(x,y-12,13,6,0,0,7);G.fill()},"stir");add(.74,.4,(x,y)=>crateStack(x,y,4,"#8a6a40"),"carry");add(.56,.8,(x,y)=>tbl(x,y,52,24,13),"pour");if(lv>=2)add(.3,.66,(x,y)=>barrel(x,y,3.2),null)},
  pisaren:()=>{wallShelf(cx,cy,A,B,"r",.1,.5,98,[{k:"book",c:"#6a2a2a"},{k:"book",c:"#2a4a6a"},{k:"book",c:"#3a5a3a"},{k:"book",c:"#6a2a2a"}]);wallShelf(cx,cy,A,B,"l",.3,.7,94,[{k:"book",c:"#2a4a6a"},{k:"book",c:"#6a2a2a"},{k:"book",c:"#3a5a3a"},{k:"book",c:"#2a4a6a"}]);
   for(let k=0;k<(lv>=2?3:2);k++)add(.3+k*.24,.36+k*.16,(x,y)=>{box(x,y,46,28,14,"#8a6a44",{win:false});poly([cor(x,y,46,28,.2,.3,14),cor(x,y,46,28,.7,.3,14),cor(x,y,46,28,.7,.8,14),cor(x,y,46,28,.2,.8,14)],"#f4ead0","#4a3220",.5);G.fillStyle="#ffd070";G.beginPath();G.arc(x+14,y-22,1.8,0,7);G.fill();G.fillStyle="#e8e0c0";G.fillRect(x+13,y-20,2,5)},"write");add(.8,.7,(x,y)=>{for(let i=0;i<4;i++){G.fillStyle=L("#f4ead0",1);G.fillRect(x+i*2,y-5-i*3,14,3)}},null)},
  kupec:()=>{wallShelf(cx,cy,A,B,"r",.1,.5,92,[{c:"#d8cfae"},{c:"#c8a070"},{c:"#a85a3a"},{c:"#d8cfae"}]);add(.3,.5,(x,y)=>box(x,y,80,24,17,"#8a5a30",{win:false}),"write",20);
   add(.1,.6,(x,y)=>crateStack(x,y,4,"#b88a50"),null);add(.7,.4,(x,y)=>{for(let i=0;i<4;i++){G.fillStyle=L(["#d8cfae","#c8a070","#a85a3a","#d8cfae"][i],1);G.beginPath();G.ellipse(x+(i%2)*12,y-(i>>1)*8,8,6,0,0,7);G.fill();G.strokeStyle="rgba(0,0,0,.5)";G.lineWidth=.5;G.stroke()}},"carry");add(.76,.76,(x,y)=>crateStack(x,y,5,"#a8784a"),null);if(lv>=2)add(.5,.82,(x,y)=>tbl(x,y,50,24,13),"carry")}};
 (wlow[t]||wlow.kupec)();
 // zásoba hotových výrobkov pri vchode (podľa minulého štvrťroka)
 const made=Math.min(10,Math.ceil((b.made||0)/4));if(made>0&&t!=="brloh")O.push({y:C(.9,.9)[1],f:()=>{const p=C(.9,.88,0);for(let i=0;i<made;i++){G.fillStyle=L(["#c8a070","#b8885a","#d8cfae"][i%3],1);G.beginPath();G.ellipse(p[0]-14+(i%5)*7,p[1]-(i>>2)*5,4,3.2,0,0,7);G.fill();G.strokeStyle="rgba(0,0,0,.45)";G.lineWidth=.5;G.stroke()}}});
 O.sort((a,b2)=>a.y-b2.y);O.forEach(o=>o.f&&o.f());
 // svetlá
 if(ST.night||dark||lights.length){G.save();G.globalCompositeOperation="lighter";lights.forEach(l=>{const g=G.createRadialGradient(l[0],l[1],4,l[0],l[1],l[2]*1.6);g.addColorStop(0,"rgba(255,170,70,.35)");g.addColorStop(1,"rgba(255,170,70,0)");G.fillStyle=g;G.beginPath();G.arc(l[0],l[1],l[2]*1.6,0,7);G.fill()});G.restore()}
 const url=finish(W0,H0,c);
 // pracovníci: miesta zo staníc, doplnené podľa potreby
 const spots=st.length?st:[{x:240,y:300,tool:"none"}];
 const FXP={kovac:[.12,.28],pekar:[.14,.26],zlatnik:[.14,.3],hrnciar:[.12,.4]}[t];
 return{url,spots,dark,W:W0,H:H0,fx:FXP?(p=>[p[0],p[1]-8])(C(FXP[0],FXP[1],0)):null,mgr:(p=>[p[0],p[1]+14])(C(.9,.3,0))}}
/* ---------- zostavenie výstupov ---------- */
function ownerCol(b){try{return DC(b.owner)}catch(e){return"#b8362c"}}
function workersSVG(spots,n,off,sc){let s="";const cnt=Math.min(n,spots.length);for(let i=0;i<cnt;i++){const sp=spots[i];s+=wk(sp.x,sp.y,COLS[(i+(off||0))%COLS.length],sp.tool||"none",(i*.37)%1.2,sc||1.9,i%2===1)}return s}
function keyOf(b,kind){return[kind,b.id,b.type,b.lvl,b.w,b.owner,S.season,(typeof todPh==="function"?todPh():1),b.mgr?1:0,Math.min(10,Math.ceil((b.made||0)/4)),(window.PREF&&PREF.gfx)||0].join("|")}
function extHTML(b){const k=keyOf(b,"x");let e=CACHE[k];if(!e){e=CACHE[k]=extFor(b)}
 // pracovníci vpredu na ulici
 const spots=e.Wk.map(w=>({x:w.x,y:w.y,tool:w.tool,fl:w.fl}));
 let s=`<svg class="scene wsx" viewBox="0 0 480 270" role="img" aria-label="${esc((BT[b.type]||{n:""}).n)} zvonku"><image href="${e.url}" x="0" y="0" width="480" height="270" preserveAspectRatio="xMidYMid slice"/>`;
 if(!b.halt)s+=workersSVG(spots,b.w||0,b.id);
 if(e.smk&&!b.halt)s+=smoke(e.smk[0],e.smk[1],4,e.fire);
 if(b.halt)s+=`<g pointer-events="none"><rect x="170" y="14" width="140" height="26" rx="4" fill="#a5312a" opacity=".9"/><text x="240" y="32" text-anchor="middle" font-family="Almendra SC,serif" font-size="15" fill="#fff">stojí</text></g>`;
 return s+`</svg>`}
function intHTML(b){const k=keyOf(b,"i");let e=CACHE[k];if(!e){e=CACHE[k]=intFor(b)}
 let s=`<svg class="interior wsi3d" viewBox="0 0 ${e.W} ${e.H}" role="img" aria-label="Pohľad do dielne"><image href="${e.url}" x="0" y="0" width="${e.W}" height="${e.H}"/>`;
 const sp=e.spots.slice();let n=b.w||0;
 // viac ľudí ako staníc: doplniť do voľných miest podľa uzlov podlahy
 while(sp.length<Math.min(n,6)){const i=sp.length;sp.push({x:200+(i*61)%170,y:240+(i*29)%40,tool:"carry"})}
 if(!b.halt)s+=workersSVG(sp,n,b.id);
 if(b.mgr&&e.mgr)s+=wk(e.mgr[0],e.mgr[1],"#5a4632","write",0,2,true);
 if(e.fx&&!b.halt)s+=glow(e.fx[0],e.fx[1],30);
 if(b.halt)s+=`<rect x="0" y="0" width="${e.W}" height="${e.H}" fill="#0a0e1c" opacity=".35" pointer-events="none"/><text x="${e.W/2}" y="${e.H/2}" text-anchor="middle" font-family="Almendra SC,serif" font-size="26" fill="#fff" opacity=".9">dielňa stojí</text>`;
 return s+`</svg>`}
window.scene=function(l){try{const bi=l&&l.b!=null?S.bld.find(x=>x.id===l.b):null;if(bi&&!bi.gone&&BT[bi.type])return extHTML(bi)}catch(e){console.warn("dielne ext",e)}return prevScene?prevScene(l):""};
window.wsInterior=function(b){try{if(b&&BT[b.type])return intHTML(b)}catch(e){console.warn("dielne int",e)}return prevInt?prevInt(b):""};
const prevView=window.wsView;window.wsView=function(b){try{if(b&&BT[b.type])return intHTML(b).replace('class="interior wsi3d"','class="interior wsi3d wsview3"')}catch(e){console.warn("dielne view",e)}return prevView?prevView(b):""};
window.DIELNE={ext:extHTML,int:intHTML};
})();

;
