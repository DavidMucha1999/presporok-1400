/* ==== js/mesta.js ==== */
/* Mestá (v19): typické dominanty každého mesta na hlavnej mape (Notre-Dame, ...). Autor: Dávid Mucha. */
(function(){
"use strict";
const INK="#2b2117";
/* ---------- pomocné kreslenie na rovinách (obrazovkové súradnice cez P2) ---------- */
function pl(E,plane,c,z0){/* plane: 's' = južná rovina y=c, u = x; 'e' = východná rovina x=c, u = y */
 const P2=E.P2;return plane==="s"?(u,z)=>P2(u,c,z):(u,z)=>P2(c,u,z)}
function arch(x,Q,uc,w,zb,h,fill,stroke,lw){const a=uc-w/2,b=uc+w/2,zs=zb+h-w*.62;x.beginPath();let p=Q(a,zb);x.moveTo(p[0],p[1]);p=Q(a,zs);x.lineTo(p[0],p[1]);let c=Q(a,zb+h-w*.05),e=Q(uc,zb+h);x.quadraticCurveTo(c[0],c[1],e[0],e[1]);c=Q(b,zb+h-w*.05);e=Q(b,zs);x.quadraticCurveTo(c[0],c[1],e[0],e[1]);p=Q(b,zb);x.lineTo(p[0],p[1]);x.closePath();if(fill){x.fillStyle=fill;x.fill()}if(stroke){x.strokeStyle=stroke;x.lineWidth=lw||1;x.stroke()}}
function rect(x,Q,u0,z0,u1,z1,fill,stroke,lw){const a=Q(u0,z0),b=Q(u1,z0),c=Q(u1,z1),d=Q(u0,z1);x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.lineTo(c[0],c[1]);x.lineTo(d[0],d[1]);x.closePath();if(fill){x.fillStyle=fill;x.fill()}if(stroke){x.strokeStyle=stroke;x.lineWidth=lw||1;x.stroke()}}
function ring(x,Q,uc,zc,r,fill,stroke,lw,n){n=n||36;x.beginPath();for(let i=0;i<=n;i++){const t=i/n*6.2832,p=Q(uc+Math.cos(t)*r,zc+Math.sin(t)*r);i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1])}x.closePath();if(fill){x.fillStyle=fill;x.fill()}if(stroke){x.strokeStyle=stroke;x.lineWidth=lw||1;x.stroke()}}
function line(x,Q,u0,z0,u1,z1,col,lw){const a=Q(u0,z0),b=Q(u1,z1);x.strokeStyle=col;x.lineWidth=lw||1;x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke()}
const GLASS="rgba(24,30,58,.88)",DARK="rgba(22,16,14,.82)",MOULD="rgba(238,230,208,.75)",SHADE="rgba(20,14,10,.35)";
/* ---------- NOTRE-DAME ---------- */
function notreDame(cx,cy,E,night){
 const {box,gable,cyl,P2,lights}=E;
 const YS=cy+5.7;               /* južná rovina priečelia */
 const TH=12.4,CH=8.0;          /* výška veží a stredu priečelia */
 const x0=cx-3.3;
 const S=pl(E,"s",YS);
 /* ----- loď: stredná loď + bočné lode ----- */
 /* apsida (východ = sever mapy) */
 cyl(cx,cy-4.6,1.7,4.4,{roof:3,tex:"cyl"});
 /* bočné lode */
 box(cx-3.3,cy-3.6,2.0,8.0,3.0,{tex:"wall",quoin:0,topTex:"slate",winY:[],winX:[]});
 box(cx+1.3,cy-3.6,2.0,8.0,3.0,{tex:"wall",topTex:"slate",
  winX:[[.5,.9,.55,1.6,1],[1.5,.9,.55,1.6,1],[2.5,.9,.55,1.6,1],[3.5,.9,.55,1.6,1],[4.5,.9,.55,1.6,1],[5.5,.9,.55,1.6,1],[6.5,.9,.55,1.6,1]],
  after:x=>{/* létajúce oblúky a piliere na východnej strane */
   const Q=(u,z)=>P2(cx+3.3,u,z);
   for(let i=0;i<7;i++){const yy=cy-3.1+i*1.15;
    /* pilier */
    rect(x,(u,z)=>P2(cx+3.3+u*.0,yy,z),0,0,0,0);
    const a=P2(cx+3.55,yy,0),b=P2(cx+3.55,yy,3.9);x.strokeStyle="rgba(225,215,190,.9)";x.lineWidth=5;x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke();x.strokeStyle=INK;x.lineWidth=1;x.stroke();
    /* oblúk z piliera k hornej lodi */
    const t0=P2(cx+3.55,yy,3.9),t1=P2(cx+1.3,yy,5.5),cp=P2(cx+2.4,yy,5.6);x.strokeStyle="rgba(228,218,194,.95)";x.lineWidth=4;x.beginPath();x.moveTo(t0[0],t0[1]);x.quadraticCurveTo(cp[0],cp[1],t1[0],t1[1]);x.stroke();
    x.strokeStyle=INK;x.lineWidth=.8;x.stroke();
    /* pinnacle */
    const pt=P2(cx+3.55,yy,4.6);x.strokeStyle="rgba(225,215,190,.95)";x.lineWidth=3;x.beginPath();x.moveTo(b[0],b[1]);x.lineTo(pt[0],pt[1]);x.stroke()}
  }});
 /* stredná loď */
 box(cx-1.3,cy-4.2,2.6,8.6,5.6,{tex:"wall",noTop:1,
  winX:[[.6,3.3,.6,1.9,1],[1.75,3.3,.6,1.9,1],[2.9,3.3,.6,1.9,1],[4.05,3.3,.6,1.9,1],[5.2,3.3,.6,1.9,1],[6.35,3.3,.6,1.9,1],[7.5,3.3,.6,1.9,1]]});
 gable(cx-1.3,cy-4.2,2.6,8.6,5.6,2.3,"slate",{alongY:1,gableTex:"wallY"});
 /* priečna loď (transept) */
 box(cx-3.2,cy-.2,6.4,1.5,5.2,{tex:"wall",noTop:1,quoin:1,
  winX:[[.4,3.0,.65,1.9,1]],
  after:x=>{const Q=(u,z)=>P2(cx+3.2,cy-.2+1.5-u,z);/* východný štít: ružica */
   ring(x,Q,.75,3.7,.58,"rgba(70,60,50,.7)",MOULD,1.4);ring(x,Q,.75,3.7,.46,GLASS,null);for(let i=0;i<12;i++){const t=i/12*6.2832;line(x,Q,.75,3.7,.75+Math.cos(t)*.46,3.7+Math.sin(t)*.46,"rgba(235,225,200,.7)",.8)}ring(x,Q,.75,3.7,.12,"#b8362c",null)}});
 gable(cx-3.2,cy-.2,6.4,1.5,5.2,1.5,"slate",{});
 /* ----- veže a priečelie ----- */
 const tw=(xx,isR)=>box(xx,cy+4.1,1.95,1.6,TH,{tex:"wall",quoin:1,topTex:"top",
  winY:[[.6,4.2,.7,2.0,1],[.35,8.4,.5,3.3,1],[1.1,8.4,.5,3.3,1]],
  winX:[[.35,8.4,.5,3.3,1],[.9,8.4,.5,3.3,1]],
  after:x=>{
   const base=xx+.975;
   /* portál pod vežou */
   arch(x,S,base,1.0,0,1.9,DARK,MOULD,1.5);arch(x,S,base,.78,0,1.62,null,"rgba(230,220,196,.5)",1);
   rect(x,S,base-.38,.0,base+.38,1.0,"rgba(190,178,150,.55)",null);
   /* sochy v portáli */
   for(let i=0;i<5;i++){const u=base-.34+i*.17;rect(x,S,u-.035,.55,u+.035,1.2,"rgba(224,214,190,.9)",INK,.6)}
   /* galéria kráľov + arkádová galéria pod vežou */
   rect(x,S,xx,3.35,xx+1.95,3.55,"rgba(235,226,204,.6)",null);
   for(let i=0;i<7;i++){const u=xx+.15+i*.27;arch(x,S,u+.1,.17,2.7,.6,"rgba(70,60,50,.8)",null)}
   rect(x,S,xx,7.35,xx+1.95,7.55,"rgba(235,226,204,.65)",null);
   for(let i=0;i<9;i++){const u=xx+.12+i*.2;rect(x,S,u,6.8,u+.06,7.35,"rgba(238,230,208,.8)",INK,.4)}
   /* vrchné cimburie */
   for(let i=0;i<7;i++){const u=xx+.08+i*.28;rect(x,S,u,TH-.02,u+.16,TH+.18,"rgba(214,204,180,.9)",INK,.5)}
  }});
 tw(cx-3.3,false);tw(cx+1.35,true);
 /* stred priečelia */
 box(cx-1.35,cy+4.1,2.7,1.6,CH,{tex:"wall",noTop:1,quoin:0,
  after:x=>{
   /* stredný portál (Posledný súd), široký */
   arch(x,S,cx,1.5,0,2.3,DARK,MOULD,1.6);arch(x,S,cx,1.2,0,2.0,null,"rgba(230,220,196,.5)",1);rect(x,S,cx-.5,0,cx+.5,.9,"rgba(190,178,150,.5)",null);
   line(x,S,cx,0,cx,1.4,"rgba(235,226,204,.9)",2);
   for(let i=0;i<7;i++){const u=cx-.58+i*.19;rect(x,S,u-.035,.7,u+.035,1.5,"rgba(224,214,190,.9)",INK,.6)}
   /* galéria kráľov */
   rect(x,S,cx-1.35,3.35,cx+1.35,3.55,"rgba(235,226,204,.6)",null);
   for(let i=0;i<9;i++){const u=cx-1.2+i*.3;arch(x,S,u+.1,.17,2.7,.6,"rgba(70,60,50,.8)",null)}
   /* dvojité okná po stranách */
   for(const sg of[-1,1]){const u0=cx+sg*.98;arch(x,S,u0-.14,.27,3.85,2.2,GLASS,MOULD,1.1);arch(x,S,u0+.14,.27,3.85,2.2,GLASS,MOULD,1.1);arch(x,S,u0,.62,3.85,2.65,null,"rgba(238,230,208,.55)",1)}
   /* veľká ružica */
   ring(x,S,cx,4.75,.98,"rgba(60,50,42,.75)",MOULD,1.6);ring(x,S,cx,4.75,.82,GLASS,null);
   for(let i=0;i<24;i++){const t=i/24*6.2832;line(x,S,cx+Math.cos(t)*.22,4.75+Math.sin(t)*.22,cx+Math.cos(t)*.82,4.75+Math.sin(t)*.82,"rgba(238,230,208,.7)",.8)}
   ring(x,S,cx,4.75,.5,null,"rgba(238,230,208,.6)",.8);ring(x,S,cx,4.75,.2,"#c0392b","rgba(238,230,208,.8)",.8);
   if(night){const p=P2(cx,YS,4.75);lights.push([p[0],p[1],34])}
   /* arkádová galéria + chimaery */
   rect(x,S,cx-1.35,6.55,cx+1.35,6.75,"rgba(235,226,204,.65)",null);
   for(let i=0;i<14;i++){const u=cx-1.28+i*.2;rect(x,S,u,6.0,u+.06,6.55,"rgba(238,230,208,.8)",INK,.4)}
   rect(x,S,cx-1.35,CH-.1,cx+1.35,CH+.1,"rgba(214,204,180,.9)",INK,.5)
  }});
 /* oporné piliere priečelia */
 for(const u of[-3.3,-1.35,1.35,3.15])box(cx+u-(u===3.15?.0:0),YS,.2,.28,CH+.4,{tex:"wall",noShadow:1,clean:1,tpu:10});
 /* ----- flèche (štíhla veža) ----- */
 const fx=cx,fy=cy+.55,fz=7.6,SD=cx+cy+4.6;
 E.I.push({d:SD,draw:x=>{const B=(r,z,a)=>P2(fx+Math.cos(a)*r,fy+Math.sin(a)*r,z);
   const col=["#7d8587","#9aa3a4","#6c7375"];
   /* oktagonálna veža v troch stupňoch */
   const seg=(r0,z0,r1,z1,c)=>{for(let i=0;i<8;i++){const a0=i/8*6.2832+.39,a1=(i+1)/8*6.2832+.39;const mid=Math.cos((a0+a1)/2-.9);if(Math.sin((a0+a1)/2)<-.2)continue;const p=[B(r0,z0,a0),B(r0,z0,a1),B(r1,z1,a1),B(r1,z1,a0)];x.beginPath();x.moveTo(p[0][0],p[0][1]);p.slice(1).forEach(q=>x.lineTo(q[0],q[1]));x.closePath();const l=.72+.28*mid;x.fillStyle=c;x.fill();x.fillStyle=`rgba(0,0,0,${.32-.3*Math.max(0,mid)})`;x.fill();x.strokeStyle="rgba(255,255,240,.22)";x.lineWidth=.8;x.stroke()}};
   seg(.7,fz,.55,fz+2.0,"#8a9395");seg(.55,fz+2.0,.36,fz+4.6,"#7c8587");
   /* špic */
   const tip=B(0,fz+8.6,0);for(let i=0;i<8;i++){const a0=i/8*6.2832+.39,a1=(i+1)/8*6.2832+.39;if(Math.sin((a0+a1)/2)<-.2)continue;const p=B(.36,fz+4.6,a0),q=B(.36,fz+4.6,a1);x.beginPath();x.moveTo(p[0],p[1]);x.lineTo(q[0],q[1]);x.lineTo(tip[0],tip[1]);x.closePath();x.fillStyle="#6f7779";x.fill();x.fillStyle=`rgba(0,0,0,${.12+.25*(1-Math.max(0,Math.cos((a0+a1)/2-.9)))})`;x.fill();x.strokeStyle="rgba(255,255,240,.2)";x.lineWidth=.7;x.stroke()}
   /* okienka a vetrný kohút */
   for(const z of[fz+1.0,fz+3.0]){const p=B(.58,z,.9+1.57);x.fillStyle="rgba(20,16,12,.7)";x.fillRect(p[0]-1.5,p[1]-5,3,8)}
   x.strokeStyle="#caa54a";x.lineWidth=1.4;x.beginPath();x.moveTo(tip[0],tip[1]);x.lineTo(tip[0],tip[1]-11);x.stroke();x.fillStyle="#caa54a";x.beginPath();x.arc(tip[0],tip[1]-12,2.2,0,7);x.fill()}});
}

/* ---------- BENÁTKY: bazilika sv. Marka + campanile, Dóžací palác ---------- */
function dome(E,x,y,r,z,col,d,hh){const CL=col&&col.length?col:["#6f8a86","#b9cdc6","#4f6561"];/* kupola ako polguľa s olovenou strechou */
 const P2=E.P2;E.I.push({d,draw:x2=>{const c=P2(x,y,z),rx=r*E.k2,ry=rx*.5;
  x2.save();x2.beginPath();x2.ellipse(c[0],c[1],rx,ry,0,0,Math.PI);x2.lineTo(c[0]+rx,c[1]);x2.bezierCurveTo(c[0]+rx,c[1]-hh*1.25,c[0]+rx*.35,c[1]-hh*1.45,c[0],c[1]-hh*1.4);x2.bezierCurveTo(c[0]-rx*.35,c[1]-hh*1.45,c[0]-rx,c[1]-hh*1.25,c[0]-rx,c[1]);x2.closePath();
  const g=x2.createLinearGradient(c[0]-rx,0,c[0]+rx,0);g.addColorStop(0,CL[0]);g.addColorStop(.45,CL[1]);g.addColorStop(1,CL[2]);x2.fillStyle=g;x2.fill();x2.strokeStyle=INK;x2.lineWidth=1;x2.stroke();
  x2.clip();x2.strokeStyle="rgba(30,50,46,.35)";x2.lineWidth=.8;for(let i=-3;i<=3;i++){x2.beginPath();x2.moveTo(c[0]+i*rx/3.2,c[1]);x2.quadraticCurveTo(c[0]+i*rx/2.2,c[1]-hh*.9,c[0],c[1]-hh*1.4);x2.stroke()}
  x2.restore();x2.fillStyle="#c9a24a";x2.fillRect(c[0]-.9,c[1]-hh*1.4-10,1.8,10);x2.beginPath();x2.arc(c[0],c[1]-hh*1.4-11,2.2,0,7);x2.fill()}})}
function sanMarco(cx,cy,E,night){
 const {box,P2,I}=E;const S=pl(E,"s",cy+2.8),Ee=pl(E,"e",cx+3.2);
 if(!E.k2){const a=P2(0,0,0),b=P2(1,0,0),c=P2(0,0,1);E.k2=(b[0]-a[0])*1.414;E.zs=a[1]-c[1]}
 box(cx-3.2,cy-2.8,6.4,5.6,3.9,{tex:"plaster",quoin:1,noTop:1,
  after:x=>{
   /* päť arkád na prízemí s mozaikovými lunetami */
   for(let i=0;i<5;i++){const u=cx-2.56+i*1.28,w=i===2?1.15:.95,h=i===2?2.5:2.0;
    arch(x,S,u,w+.25,0,h+.15,"rgba(236,226,200,.85)",MOULD,1);arch(x,S,u,w,0,h,DARK,null);
    arch(x,S,u,w,h-.8,.8,"#d9b248",null);/* zlatá mozaika */
    if(i===2)for(let k=-1;k<=1;k++)line(x,S,u+k*.3,0,u+k*.3,1.3,"rgba(230,222,200,.9)",1.5)}
   for(let i=0;i<=5;i++){const u=cx-3.18+i*1.28;rect(x,S,u-.06,0,u+.06,2.4,"rgba(238,230,208,.9)",INK,.5)}
   rect(x,S,cx-3.2,2.6,cx+3.2,2.85,"rgba(240,232,208,.8)",INK,.4);
   /* horný rad: päť špicatých štítov s hrotmi a mozaikami */
   for(let i=0;i<5;i++){const u=cx-2.56+i*1.28,w=i===2?1.15:.95;
    arch(x,S,u,w+.2,2.9,i===2?1.4:1.1,"#d9b248",MOULD,1);const q=P2(cx-2.56+i*1.28,cy+2.8,2.9+(i===2?1.4:1.1)+.15);x.fillStyle="#e8dcc0";x.beginPath();x.arc(q[0],q[1]-4,2.2,0,7);x.fill()}
   if(night){const p=P2(cx,cy+2.8,3.2);E.lights&&E.lights.push([p[0],p[1],36])}
  }});
 /* kupoly */
 const pos=[[0,0,1.25],[-1.9,0,.95],[1.9,0,.95],[0,-1.8,.9],[0,1.5,.85]];
 pos.sort((a,b)=>a[1]-b[1]);
 for(const[dx,dy,r]of pos){dome(E,cx+dx,cy+dy,r,3.9,"",cx+cy+dx+dy+6.0+(dy>0?.2:0),r*E.zs*.62)}
 /* campanile */
 const bx=cx+4.4,by=cy+.6;
 box(bx-.7,by-.7,1.4,1.4,7.4,{tex:"plasterR",noTop:1,topTex:"top",
  after:x=>{const Q=pl(E,"s",by+.8),Qe=pl(E,"e",bx+.8);
   rect(x,Q,bx-.8,0,bx+.8,10,"rgba(180,84,60,.0)",null);
   for(let z=1.2;z<7.2;z+=1.2)line(x,Q,bx-.7,z,bx+.7,z,"rgba(60,30,20,.25)",1);
   
   rect(x,Q,bx-.7,4.9,bx+.7,5.1,"rgba(238,230,208,.8)",INK,.5);
   for(const u of[-.4,0,.4])arch(x,Q,bx+u,.24,5.2,2.0,DARK,"rgba(238,230,208,.85)",.8)}});
 E.I.push({d:bx+by+7.8,draw:x=>{const B=(rr,z,a)=>P2(bx+Math.cos(a)*rr,by+Math.sin(a)*rr,z);
  /* pyramída zelená */
  const tip=P2(bx,by,7.4+3.0);const c4=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([ux,uy])=>P2(bx+ux*.85,by+uy*.85,7.4));
  const fills=["#3f7f66","#4a8f75","#33715a"];
  const faces=[[c4[3],c4[2],fills[1]],[c4[2],c4[1],fills[2]]];
  for(const[a,b,cc]of faces){x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.lineTo(tip[0],tip[1]);x.closePath();x.fillStyle=cc;x.fill();x.strokeStyle=INK;x.lineWidth=.9;x.stroke()}
  x.fillStyle="#d9b248";x.beginPath();x.arc(tip[0],tip[1]-2,2.4,0,7);x.fill();x.strokeStyle="#d9b248";x.lineWidth=1.6;x.beginPath();x.moveTo(tip[0],tip[1]);x.lineTo(tip[0],tip[1]-8);x.stroke()}});
}
function palazzoDucale(cx,cy,E,night){
 const {box,P2}=E;const YS=cy+2.4,S=pl(E,"s",YS);
 box(cx-4.2,cy-2.4,8.4,4.8,5.6,{tex:"plaster",quoin:1,topTex:"top",
  after:x=>{
   /* spodná arkáda – špicaté oblúky */
   for(let i=0;i<14;i++){const u=cx-4.0+i*.6;arch(x,S,u+.3,.36,0,1.75,"rgba(34,24,20,.88)","rgba(238,230,208,.8)",1)}
   for(let i=0;i<=14;i++){const u=cx-4.0+i*.6;rect(x,S,u-.07,0,u+.07,1.8,"rgba(238,230,208,.92)",INK,.4)}
   rect(x,S,cx-4.2,1.8,cx+4.2,2.0,"rgba(240,232,208,.85)",INK,.4);
   /* horná lodžia – dvojité oblúky s kruhovými rozetami */
   for(let i=0;i<14;i++){const u=cx-4.0+i*.6;arch(x,S,u+.3,.3,2.1,1.1,"rgba(34,24,20,.82)","rgba(238,230,208,.8)",.8);ring(x,S,u+.3,3.45,.1,"#8b3a2f","rgba(238,230,208,.8)",.6,10)}
   for(let i=0;i<=14;i++){const u=cx-4.0+i*.6;rect(x,S,u-.04,2.0,u+.04,3.25,"rgba(238,230,208,.9)",INK,.3)}
   rect(x,S,cx-4.2,3.35,cx+4.2,3.5,"rgba(240,232,208,.85)",INK,.4);
   /* diamantový vzor bielo-ružový */
   const rowsZ0=3.5,rowH=.28,rows=8;for(let r=0;r<rows;r++){for(let i=0;i<30;i++){const u=cx-4.2+i*.28+(r%2?.14:0);const zc=rowsZ0+r*rowH*.5+rowH*.5;const col=(i+r)%2?"rgba(214,128,108,.7)":"rgba(248,238,214,.7)";
    x.fillStyle=col;const a=S(u,zc-.14),b=S(u+.14,zc),c=S(u,zc+.14),d=S(u-.14,zc);x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.lineTo(c[0],c[1]);x.lineTo(d[0],d[1]);x.closePath();x.fill()}}
   /* okná a balkón */
   for(const u of[-2.4,-.6,1.2,3.0]){arch(x,S,cx+u,.55,4.2,1.3,DARK,MOULD,1);rect(x,S,cx+u-.35,4.0,cx+u+.35,4.15,"rgba(238,230,208,.9)",INK,.4)}
   /* ozdobná koruna s cimbuřím */
   for(let i=0;i<24;i++){const u=cx-4.15+i*.36;const a=S(u,5.6),b=S(u+.18,5.6),c=S(u+.09,6.05);x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.lineTo(c[0],c[1]);x.closePath();x.fillStyle="rgba(244,236,216,.95)";x.fill();x.strokeStyle=INK;x.lineWidth=.5;x.stroke()}
   if(night)for(let i=0;i<5;i++){const p=P2(cx-3+i*1.5,YS,3.0);E.lights&&E.lights.push([p[0],p[1],20])}
  }});
}


/* ---------- pomocné: oporné oblúky ---------- */
function flying(x,E,xo,xi,y0,n,step,zb,zt,zi){const P2=E.P2;for(let i=0;i<n;i++){const yy=y0+i*step;const a=P2(xo,yy,0),b=P2(xo,yy,zb);x.strokeStyle="rgba(225,215,190,.9)";x.lineWidth=5;x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke();x.strokeStyle=INK;x.lineWidth=1;x.stroke();
 const t0=P2(xo,yy,zb),t1=P2(xi,yy,zi),cp=P2((xo+xi)/2,yy,zt);x.strokeStyle="rgba(228,218,194,.95)";x.lineWidth=4;x.beginPath();x.moveTo(t0[0],t0[1]);x.quadraticCurveTo(cp[0],cp[1],t1[0],t1[1]);x.stroke();x.strokeStyle=INK;x.lineWidth=.8;x.stroke();
 const pt=P2(xo,yy,zb+.8);x.strokeStyle="rgba(225,215,190,.95)";x.lineWidth=3;x.beginPath();x.moveTo(b[0],b[1]);x.lineTo(pt[0],pt[1]);x.stroke()}}
/* ostrá veža s oktagónom a špicom (gotická) */
function spireTower(E,bx,by,w,h0,oct,sp,d,col){const {P2,box}=E;
 box(bx-w/2,by-w/2,w,w,h0,{tex:"wall",quoin:1,noTop:1,
  winY:[[w*.3,h0*.45,w*.4,h0*.35,1]],winX:[[w*.3,h0*.45,w*.4,h0*.35,1]]});
 E.I.push({d,draw:x=>{const B=(r,z,a)=>P2(bx+Math.cos(a)*r,by+Math.sin(a)*r,z);const seg=(r0,z0,r1,z1,c)=>{for(let i=0;i<8;i++){const a0=i/8*6.2832+.39,a1=(i+1)/8*6.2832+.39;if(Math.sin((a0+a1)/2)<-.2)continue;const m=Math.cos((a0+a1)/2-.9);const p=[B(r0,z0,a0),B(r0,z0,a1),B(r1,z1,a1),B(r1,z1,a0)];x.beginPath();x.moveTo(p[0][0],p[0][1]);p.slice(1).forEach(q=>x.lineTo(q[0],q[1]));x.closePath();x.fillStyle=c;x.fill();x.fillStyle=`rgba(0,0,0,${.32-.3*Math.max(0,m)})`;x.fill();x.strokeStyle="rgba(255,255,240,.22)";x.lineWidth=.8;x.stroke()}};
  seg(w*.62,h0,w*.5,h0+oct,col||"#8a9395");
  const tip=B(0,h0+oct+sp,0);for(let i=0;i<8;i++){const a0=i/8*6.2832+.39,a1=(i+1)/8*6.2832+.39;if(Math.sin((a0+a1)/2)<-.2)continue;const p=B(w*.5,h0+oct,a0),q=B(w*.5,h0+oct,a1);x.beginPath();x.moveTo(p[0],p[1]);x.lineTo(q[0],q[1]);x.lineTo(tip[0],tip[1]);x.closePath();x.fillStyle=col||"#6f7779";x.fill();x.fillStyle=`rgba(0,0,0,${.12+.25*(1-Math.max(0,Math.cos((a0+a1)/2-.9)))})`;x.fill();x.strokeStyle="rgba(255,255,240,.2)";x.lineWidth=.7;x.stroke()}
  x.strokeStyle="#caa54a";x.lineWidth=1.4;x.beginPath();x.moveTo(tip[0],tip[1]);x.lineTo(tip[0],tip[1]-10);x.stroke()}})}
/* ---------- VIEDEŇ: Štefanský dóm + Hofburg ---------- */
function stephansdom(cx,cy,E,night){
 const {box,gable,P2}=E;const S=pl(E,"s",cy+3.6);
 /* bočné lode a hlavná loď */
 box(cx-2.6,cy-3.6,5.2,7.2,3.4,{tex:"wall",noTop:1,quoin:1,
  winX:[[.5,1.2,.6,1.9,1],[1.6,1.2,.6,1.9,1],[2.7,1.2,.6,1.9,1],[3.8,1.2,.6,1.9,1],[4.9,1.2,.6,1.9,1],[6.0,1.2,.6,1.9,1]],
  after:x=>{
   /* priečelie: Riesentor + dve „pohanské veže“ */
   arch(x,S,cx,1.5,0,2.2,DARK,MOULD,1.6);arch(x,S,cx,1.2,0,1.9,null,"rgba(230,220,196,.5)",1);
   for(const sg of[-1,1])arch(x,S,cx+sg*1.9,.6,1.6,1.4,GLASS,MOULD,1)
  }});
 /* obrovská strecha s farebným vzorom */
 gable(cx-2.6,cy-3.6,5.2,7.2,3.4,3.9,"tile",{alongY:1,gableTex:"wallY"});
 E.I.push({d:cx+cy+3.8+.2,draw:x=>{/* mozaika na východnom svahu strechy */
   const y0=cy-3.6,y1=cy+3.6,xe=cx+2.6,xr=cx,ze=3.4,zr=7.3;
   const pt=(t,u)=>{const xx=xe+(xr-xe)*u,zz=ze+(zr-ze)*u;return P2(xx,y0+(y1-y0)*t,zz)};
   const cols=["#b8362c","#e4c04a","#2f6b4f","#f3ead2"];
   for(let r=0;r<7;r++){for(let c=0;c<26;c++){const t0=c/26,t1=(c+1)/26,u0=r/7,u1=(r+1)/7;const a=pt(t0,u0),b=pt(t1,u0),cc=pt(t1,u1),d=pt(t0,u1);x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.lineTo(cc[0],cc[1]);x.lineTo(d[0],d[1]);x.closePath();const k=(c+r*2)%8;x.fillStyle=k<2?cols[0]:k<4?cols[1]:k<6?cols[2]:cols[3];x.globalAlpha=.78;x.fill();x.globalAlpha=1}}
   x.strokeStyle="rgba(30,20,10,.35)";x.lineWidth=.6;for(let r=1;r<7;r++){const a=pt(0,r/7),b=pt(1,r/7);x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke()}}});
 /* pohanské veže na priečelí */
 for(const sg of[-1,1]){box(cx+sg*2.2-.5,cy+3.0,1.0,1.0,5.6,{tex:"wall",quoin:1,noTop:1,winY:[[.25,2.5,.5,1.2,1]]})}
 /* veľká južná veža */
 spireTower(E,cx+3.6,cy+2.4,1.9,9.0,3.4,7.8,cx+cy+6.6);
 /* oporné piliere (východ) */
 box(cx+2.6,cy-3.6,.1,.1,.1,{noTop:1,noShadow:1,after:x=>flying(x,E,cx+3.45,cx+2.6,cy-3.0,5,1.35,3.2,4.1,3.0)});
}
function hofburg(cx,cy,E,night){
 const {box,gable,P2}=E;const S=pl(E,"s",cy+2.4);
 box(cx-4.2,cy-2.4,8.4,4.8,4.4,{tex:"plaster",quoin:1,topTex:"slate",
  after:x=>{
   rect(x,S,cx-4.2,0,cx+4.2,4.4,"rgba(236,196,92,.45)",null);
   for(let r=0;r<3;r++)for(let i=0;i<13;i++){const u=cx-3.9+i*.65;if(Math.abs(u-cx)<1.2)continue;arch(x,S,u,.34,.5+r*1.3,.95,"rgba(40,30,26,.78)","rgba(238,230,208,.8)",.8)}
   rect(x,S,cx-4.2,4.2,cx+4.2,4.4,"rgba(238,230,208,.9)",INK,.5);
   /* hlavná brána pod kupolou */
   arch(x,S,cx,1.6,0,2.4,DARK,MOULD,1.4)}});
 /* kupola nad portálom */
 const r=1.5;box(cx-r,cy+.6,r*2,2.0,4.4+.01,{tex:"plaster",noTop:1,noShadow:1,z:4.4,quoin:1,winY:[[.5,.4,.45,1.2,1],[1.05,.4,.45,1.2,1]],winX:[]});
 dome(E,cx,cy+1.6,r,5.5,"",cx+cy+6.7,r*E.zs*1.1);
}
/* ---------- PRAHA: chrám sv. Víta + Pražský hrad ---------- */
function svatyVit(cx,cy,E,night){
 const {box,gable,cyl,P2}=E;const S=pl(E,"s",cy+3.8);
 cyl(cx,cy-4.4,1.6,5.0,{roof:3.2,tex:"cyl"});
 box(cx+1.3,cy-3.4,1.9,7.2,3.3,{tex:"wall",topTex:"slate",winX:[[.5,.8,.5,1.8,1],[1.5,.8,.5,1.8,1],[2.5,.8,.5,1.8,1],[3.5,.8,.5,1.8,1],[4.5,.8,.5,1.8,1],[5.5,.8,.5,1.8,1],[6.5,.8,.5,1.8,1]],after:x=>flying(x,E,cx+3.45,cx+1.3,cy-2.8,6,1.3,3.2,5.8,5.2)});
 box(cx-1.3,cy-4.0,2.6,8.0,6.2,{tex:"wall",noTop:1,winX:[[.5,3.8,.6,2.0,1],[1.6,3.8,.6,2.0,1],[2.7,3.8,.6,2.0,1],[3.8,3.8,.6,2.0,1],[4.9,3.8,.6,2.0,1],[6.0,3.8,.6,2.0,1],[7.1,3.8,.6,2.0,1]],
  after:x=>{arch(x,S,cx,1.5,0,2.3,DARK,MOULD,1.4);ring(x,S,cx,4.6,.8,GLASS,MOULD,1.2);for(let i=0;i<16;i++){const t=i/16*6.2832;line(x,S,cx,4.6,cx+Math.cos(t)*.8,4.6+Math.sin(t)*.8,"rgba(238,230,208,.65)",.7)}}});
 gable(cx-1.3,cy-4.0,2.6,8.0,6.2,2.5,"slate",{alongY:1,gableTex:"wallY"});
 box(cx-3.3,cy-.2,6.6,1.4,5.0,{tex:"wall",noTop:1,quoin:1,after:x=>{const Q=(u,z)=>P2(cx+3.3,cy-.2+1.4-u,z);ring(x,Q,.7,3.4,.55,GLASS,MOULD,1.2)}});
 gable(cx-3.3,cy-.2,6.6,1.4,5.0,1.5,"slate",{});
 /* južná veža s barokovou helmou */
 box(cx+1.4,cy+1.4,2.1,2.1,8.0,{tex:"wall",quoin:1,noTop:1,winY:[[.5,3.0,.5,1.6,1],[.5,5.8,.5,1.6,1]],winX:[[.5,3.0,.5,1.6,1],[.5,5.8,.5,1.6,1]]});
 E.I.push({d:cx+cy+7.2,draw:x=>{const bx=cx+2.45,by=cy+2.45,B=(r,z,a)=>P2(bx+Math.cos(a)*r,by+Math.sin(a)*r,z);
  const prof=[[.95,8.0],[.95,8.5],[.6,9.0],[1.15,9.9],[.7,10.9],[.4,11.4],[.7,11.9],[.3,12.8],[.0,14.0]];
  for(let i=0;i<prof.length-1;i++){const[r0,z0]=prof[i],[r1,z1]=prof[i+1];for(let k=0;k<12;k++){const a0=k/12*6.2832,a1=(k+1)/12*6.2832,m=(a0+a1)/2;if(Math.sin(m)<-.35)continue;const p=[B(r0,z0,a0),B(r0,z0,a1),B(r1,z1,a1),B(r1,z1,a0)];x.beginPath();x.moveTo(p[0][0],p[0][1]);p.slice(1).forEach(q=>x.lineTo(q[0],q[1]));x.closePath();const l=.55+.45*Math.max(0,Math.cos(m-.9));x.fillStyle=`rgb(${Math.round(78*l+30)},${Math.round(120*l+34)},${Math.round(100*l+30)})`;x.fill();x.strokeStyle="rgba(0,0,0,.2)";x.lineWidth=.5;x.stroke()}}
  const tip=B(0,14.0,0);x.strokeStyle="#caa54a";x.lineWidth=1.5;x.beginPath();x.moveTo(tip[0],tip[1]);x.lineTo(tip[0],tip[1]-10);x.stroke()}});
}
function prazskyHrad(cx,cy,E,night){
 const {box,gable,cyl,P2}=E;const S=pl(E,"s",cy+2.2);
 box(cx-4.4,cy-2.2,8.8,4.4,3.8,{tex:"plaster",quoin:1,noTop:1,
  after:x=>{rect(x,S,cx-4.4,0,cx+4.4,3.8,"rgba(228,196,120,.35)",null);
   for(let r=0;r<2;r++)for(let i=0;i<14;i++){const u=cx-4.1+i*.62;arch(x,S,u,.32,.6+r*1.5,.9,"rgba(40,30,26,.78)","rgba(238,230,208,.8)",.8)}
   arch(x,S,cx-1.4,1.3,0,2.2,DARK,MOULD,1.4)}});
 gable(cx-4.4,cy-2.2,8.8,4.4,3.8,2.8,"slate",{});
 cyl(cx+3.6,cy-1.0,.9,7.0,{roof:3.0,tex:"cyl"});
 cyl(cx-3.8,cy+1.2,.7,6.0,{roof:2.4,tex:"cyl",flag:1});
}

/* ---------- PRAHA: Karlov most ---------- */
let BR={key:null,main:null};
function charlesBridge(h,r0,r1,roads2,rp,X,plz,E){
 if(E.key!=="pra")return false;
 if(BR.key!==roads2){BR.key=roads2;BR.main=null;let best=1e9;for(const r of roads2)for(let i=1;i<r.length;i++)for(let j=1;j<rp.length;j++){const q=X(r[i-1],r[i],rp[j-1],rp[j]);if(q){const d=Math.hypot(q[0]-plz[0],q[1]-plz[1]);if(d<best){best=d;BR.main=q}}}
  BR.done=false}
 if(!BR.main||Math.abs(h[0]-BR.main[0])>.01||Math.abs(h[1]-BR.main[1])>.01)return false;
 if(BR.done)return true;BR.done=true;
 const {P2,box,gable,cyl,I}=E;
 let rd=[r1[0]-r0[0],r1[1]-r0[1]];const rl=Math.hypot(...rd)||1;rd=[rd[0]/rl,rd[1]/rl];
 let u=[-rd[1],rd[0]];if(u[0]*(plz[0]-h[0])+u[1]*(plz[1]-h[1])<0)u=[-u[0],-u[1]];
 const L=17,w=2.5,Hh=1.5,N=8,half=L/2;
 const pt=(t,s,z)=>P2(h[0]+u[0]*t+rd[0]*s,h[1]+u[1]*t+rd[1]*s,z);
 const nv=(rd[0]+rd[1]>0)?1:-1;/* viditeľná strana */
 const near=nv*w/2,far=-nv*w/2;
 const sp=L/N;
 I.push({d:h[0]+h[1]+.2,draw:x=>{
  /* viditeľná strana mosta s oblúkmi */
  const wallPoly=(s,z0,z1,fill,stroke)=>{x.beginPath();let p=pt(-half,s,z0);x.moveTo(p[0],p[1]);p=pt(half,s,z0);x.lineTo(p[0],p[1]);p=pt(half,s,z1);x.lineTo(p[0],p[1]);p=pt(-half,s,z1);x.lineTo(p[0],p[1]);x.closePath();x.fillStyle=fill;x.fill();if(stroke){x.strokeStyle=INK;x.lineWidth=.8;x.stroke()}};
  /* vzdialený parapet (vnútorná strana) */
  wallPoly(far,Hh,Hh+.55,"#a9a08a",true);
  /* vozovka */
  x.beginPath();let p=pt(-half,near,Hh);x.moveTo(p[0],p[1]);p=pt(half,near,Hh);x.lineTo(p[0],p[1]);p=pt(half,far,Hh);x.lineTo(p[0],p[1]);p=pt(-half,far,Hh);x.lineTo(p[0],p[1]);x.closePath();x.fillStyle="#bcae8e";x.fill();x.strokeStyle=INK;x.lineWidth=.8;x.stroke();
  /* kamenné dlažbové čiary */
  x.strokeStyle="rgba(70,55,35,.3)";x.lineWidth=.6;for(let t=-half+.5;t<half;t+=.5){const a=pt(t,near,Hh),b=pt(t,far,Hh);x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke()}
  /* bočná stena */
  wallPoly(near,0,Hh,"#b9ad92",true);
  /* kvádrový vzor */
  x.strokeStyle="rgba(60,45,30,.25)";x.lineWidth=.6;for(let z=.5;z<Hh;z+=.5){const a=pt(-half,near,z),b=pt(half,near,z);x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke()}
  /* oblúky */
  for(let k=0;k<N;k++){const t0=-half+k*sp+.28,t1=-half+(k+1)*sp-.28;x.beginPath();let a=pt(t0,near,0);x.moveTo(a[0],a[1]);const M=10;for(let m=0;m<=M;m++){const f=m/M,zz=Hh*.62*Math.sqrt(Math.max(0,1-Math.pow(2*f-1,2)));a=pt(t0+(t1-t0)*f,near,zz+.05);x.lineTo(a[0],a[1])}a=pt(t1,near,0);x.lineTo(a[0],a[1]);x.closePath();x.fillStyle="rgba(30,50,68,.92)";x.fill();x.strokeStyle="rgba(235,226,205,.65)";x.lineWidth=1;x.stroke()}
  /* piliere – nábehy proti prúdu */
  for(let k=0;k<=N;k++){const t=-half+k*sp;const a=pt(t,near,0),b=pt(t,near,Hh+.55);x.strokeStyle="rgba(225,215,190,.75)";x.lineWidth=2.2;x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke()}
  /* predný parapet */
  wallPoly(near,Hh,Hh+.55,"#c6bba4",true);
  const cap=[pt(-half,near,Hh+.55),pt(half,near,Hh+.55),pt(half,near-nv*.25,Hh+.55),pt(-half,near-nv*.25,Hh+.55)];x.beginPath();cap.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.closePath();x.fillStyle="#dcd2bb";x.fill();
  /* sochy na parapete */
  for(let t=-half+1.6;t<half-1;t+=2.1){for(const sd of[near,far]){const q=pt(t,sd,Hh+.55);x.fillStyle="#3b3a38";x.beginPath();x.moveTo(q[0]-1.6,q[1]);x.lineTo(q[0]-1.2,q[1]-8);x.arc(q[0],q[1]-9,1.8,3.3,6.1);x.lineTo(q[0]+1.6,q[1]);x.closePath();x.fill();x.fillStyle="#caa54a";x.fillRect(q[0]-.7,q[1]-12.2,1.4,1.4)}}
 }});
 /* mostecké veže: Staromestská (bližšie k mestu) a Malostranské */
 const Bx=h[0]+u[0]*(half+.3),By=h[1]+u[1]*(half+.3),Ax=h[0]-u[0]*(half+.2),Ay=h[1]-u[1]*(half+.2);
 box(Bx-1.4,By-1.4,2.8,2.8,6.0,{tex:"wall",quoin:1,noTop:1,winY:[[.8,3.4,.5,1.5,1],[1.6,3.4,.5,1.5,1]],winX:[[.8,3.4,.5,1.5,1],[1.6,3.4,.5,1.5,1]],
  after:x=>{const Q=pl(E,"s",By+1.4);arch(x,Q,Bx,1.1,0,1.7,DARK,MOULD,1.2);arch(x,Q,Bx,.7,3.0,1.4,GLASS,MOULD,1)}});
 gable(Bx-1.4,By-1.4,2.8,2.8,6.0,3.0,"slate",{});
 for(const[cx2,cy2]of[[Bx-1.4,By-1.4],[Bx+1.4,By-1.4],[Bx-1.4,By+1.4],[Bx+1.4,By+1.4]])cyl(cx2,cy2,.32,7.0,{tex:"cyl",roof:1.2,noShadow:1});
 box(Ax-1.0,Ay-1.0,2.0,2.0,5.2,{tex:"wall",quoin:1,noTop:1,winY:[[.7,2.6,.5,1.3,1]],winX:[[.7,2.6,.5,1.3,1]]});
 gable(Ax-1.0,Ay-1.0,2.0,2.0,5.2,2.2,"slate",{});
 box(Ax+rd[0]*2.6-.8,Ay+rd[1]*2.6-.8,1.6,1.6,3.8,{tex:"wall",quoin:1});
 return true}
window.BRX=charlesBridge;

/* ---------- KRAKOV ---------- */
function marianskyKostol(cx,cy,E,night){
 const {box,gable,cyl,P2}=E;const S=pl(E,"s",cy+3.7);
 cyl(cx,cy-4.4,1.5,4.6,{roof:3.0,tex:"cyl"});
 box(cx+1.3,cy-3.4,1.9,7.0,3.0,{tex:"brick",topTex:"slate",winX:[[.5,.8,.5,1.6,1],[1.5,.8,.5,1.6,1],[2.5,.8,.5,1.6,1],[3.5,.8,.5,1.6,1],[4.5,.8,.5,1.6,1],[5.5,.8,.5,1.6,1]],after:x=>flying(x,E,cx+3.45,cx+1.3,cy-2.8,5,1.4,3.0,5.2,4.7)});
 box(cx-1.4,cy-4.0,2.8,7.9,5.6,{tex:"brick",noTop:1,winX:[[.5,3.3,.6,2.0,1],[1.6,3.3,.6,2.0,1],[2.7,3.3,.6,2.0,1],[3.8,3.3,.6,2.0,1],[4.9,3.3,.6,2.0,1],[6.0,3.3,.6,2.0,1],[7.1,3.3,.6,2.0,1]]});
 gable(cx-1.4,cy-4.0,2.8,7.9,5.6,3.0,"tile",{alongY:1,gableTex:"wallY"});
 /* dve veže rôznej výšky */
 spireTower(E,cx-1.65,cy+3.5,2.0,8.4,2.4,4.8,cx+cy+4.8,"#a9693f");
 box(cx+.9,cy+2.6,1.8,1.8,7.2,{tex:"brick",quoin:1,noTop:1,winY:[[.55,3.6,.45,1.7,1],[.55,5.6,.45,1.0,1]],winX:[[.55,3.6,.45,1.7,1]],
  after:x=>{arch(x,S,cx+1.8,.8,0,1.5,DARK,MOULD,1.2)}});
 dome(E,cx+1.8,cy+3.5,1.0,7.2,["#7a5a3a","#c9a25a","#4a3a2a"],cx+cy+6.8,E.zs*1.3);
}
function sukiennice(cx,cy,E,night){
 const {box,gable,P2}=E;const YS=cy+1.9,S=pl(E,"s",YS),Ee=pl(E,"e",cx+4.1);
 box(cx-4.1,cy-1.9,8.2,3.8,3.2,{tex:"plaster",quoin:1,topTex:"slate",
  after:x=>{
   for(let i=0;i<13;i++){const u=cx-3.85+i*.6;arch(x,S,u+.3,.38,0,1.9,"rgba(34,24,20,.85)","rgba(238,230,208,.85)",1)}
   for(let i=0;i<=13;i++){const u=cx-3.85+i*.6;rect(x,S,u-.06,0,u+.06,2.0,"rgba(238,230,208,.92)",INK,.4)}
   rect(x,S,cx-4.1,2.0,cx+4.1,2.2,"rgba(240,232,208,.85)",INK,.4);
   for(let i=0;i<13;i++){const u=cx-3.85+i*.6;rect(x,S,u+.12,2.45,u+.48,2.85,"rgba(120,96,70,.35)","rgba(238,230,208,.6)",.6)}
   /* renesančná atika (maškarony) */
   for(let i=0;i<22;i++){const u=cx-4.05+i*.37;const a=S(u,3.2),b=S(u+.37,3.2),c=S(u+.185,3.62);x.beginPath();x.moveTo(a[0],a[1]);x.quadraticCurveTo(c[0],c[1]-3,b[0],b[1]);x.closePath();x.fillStyle="rgba(244,236,216,.95)";x.fill();x.strokeStyle=INK;x.lineWidth=.5;x.stroke()}
   if(night)for(let i=0;i<4;i++){const p=P2(cx-3+i*2,YS,1.2);E.lights&&E.lights.push([p[0],p[1],20])}
  }});
 gable(cx-4.1,cy-1.9,8.2,3.8,3.2,1.2,"slate",{});
}
function wawel(cx,cy,E,night){
 const {box,gable,cyl,P2}=E;const S=pl(E,"s",cy+2.3);
 box(cx-4.2,cy-2.3,8.4,4.6,3.8,{tex:"brick",quoin:1,noTop:1,
  after:x=>{for(let r=0;r<2;r++)for(let i=0;i<12;i++){const u=cx-3.9+i*.7;if(r===0&&Math.abs(u-cx-2.7)<.9)continue;arch(x,S,u,.34,.55+r*1.5,.95,"rgba(40,30,26,.78)","rgba(238,230,208,.8)",.8)}
   arch(x,S,cx+2.7,1.3,0,2.2,DARK,MOULD,1.3)}});
 gable(cx-4.2,cy-2.3,8.4,4.6,3.8,2.6,"tile",{});
 /* katedrála sv. Stanislava so zlatou čiapkou veže */
 box(cx-5.2,cy-1.0,1.9,4.2,4.4,{tex:"wall",quoin:1,noTop:1,winX:[[.5,2.2,.5,1.5,1],[1.8,2.2,.5,1.5,1],[3.1,2.2,.5,1.5,1]]});
 gable(cx-5.2,cy-1.0,1.9,4.2,4.4,1.8,"slate",{alongY:1});
 cyl(cx-4.2,cy+3.0,.9,7.8,{roof:3.2,tex:"cyl",flag:1});
 dome(E,cx-4.2,cy+3.0,.9,7.8,["#a8882a","#f0d27a","#7a5e1a"],cx+cy+8.0,E.zs*1.0);
 /* veže paláca */
 cyl(cx+3.9,cy-1.6,1.0,6.4,{roof:2.6,tex:"cyl"});
 cyl(cx-2.8,cy-1.6,.9,5.8,{roof:2.2,tex:"cyl"});
}
/* ---------- BUDÍN ---------- */
function matyasovKostol(cx,cy,E,night){
 const {box,gable,cyl,P2}=E;const S=pl(E,"s",cy+3.7);
 cyl(cx,cy-4.4,1.5,4.6,{roof:3.0,tex:"cyl"});
 box(cx+1.3,cy-3.4,1.9,7.0,3.0,{tex:"wall",topTex:"slate",winX:[[.5,.8,.5,1.6,1],[1.5,.8,.5,1.6,1],[2.5,.8,.5,1.6,1],[3.5,.8,.5,1.6,1],[4.5,.8,.5,1.6,1],[5.5,.8,.5,1.6,1]],after:x=>flying(x,E,cx+3.45,cx+1.3,cy-2.8,5,1.4,3.0,5.2,4.7)});
 box(cx-1.4,cy-4.0,2.8,7.9,5.4,{tex:"wall",noTop:1,winX:[[.5,3.2,.6,1.9,1],[1.6,3.2,.6,1.9,1],[2.7,3.2,.6,1.9,1],[3.8,3.2,.6,1.9,1],[4.9,3.2,.6,1.9,1],[6.0,3.2,.6,1.9,1],[7.1,3.2,.6,1.9,1]],
  after:x=>{arch(x,S,cx+.9,1.2,0,2.1,DARK,MOULD,1.3);ring(x,S,cx+.9,4.1,.7,GLASS,MOULD,1.1)}});
 gable(cx-1.4,cy-4.0,2.8,7.9,5.4,3.2,"tile",{alongY:1,gableTex:"wallY"});
 /* jediná mohutná veža so štíhlym špicom (Mátyásova) */
 spireTower(E,cx-1.2,cy+3.4,2.3,9.2,3.4,6.6,cx+cy+4.8,"#9ea4a4");
}
function budinHrad(cx,cy,E,night){
 const {box,gable,cyl,P2}=E;const S=pl(E,"s",cy+2.5);
 box(cx-4.6,cy-2.5,9.2,5.0,4.2,{tex:"plaster",quoin:1,noTop:1,
  after:x=>{for(let r=0;r<3;r++)for(let i=0;i<13;i++){const u=cx-4.3+i*.7;if(Math.abs(u-cx)<1.0&&r===0)continue;arch(x,S,u,.34,.4+r*1.25,.9,"rgba(40,30,26,.78)","rgba(238,230,208,.8)",.8)}
   arch(x,S,cx,1.5,0,2.3,DARK,MOULD,1.4);
   for(let i=0;i<14;i++){const u=cx-4.5+i*.66;rect(x,S,u,4.2,u+.4,4.55,"rgba(214,204,180,.95)",INK,.5)}}});
 gable(cx-4.6,cy-2.5,9.2,5.0,4.2,2.4,"slate",{});
 cyl(cx-4.9,cy+2.2,1.0,7.0,{roof:3.0,tex:"cyl",flag:1});
 cyl(cx+4.9,cy+2.2,1.0,7.0,{roof:3.0,tex:"cyl"});
 box(cx-1.0,cy+2.5,2.0,1.0,3.6,{tex:"wall",quoin:1,topTex:"cobble"});
}

/* ---------- zdieľané pomôcky pre ďalšie mestá ---------- */
function pyramid(E,x,y,w,z,h,cols,d){/* štvorboká ihlanová strecha */
 const P2=E.P2;E.I.push({d,draw:g=>{const tip=P2(x,y,z+h);const c=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>P2(x+a*w/2,y+b*w/2,z));
  for(const[a,b,cc]of[[c[3],c[2],cols[1]],[c[2],c[1],cols[2]]]){g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.lineTo(tip[0],tip[1]);g.closePath();g.fillStyle=cc;g.fill();g.strokeStyle=INK;g.lineWidth=.9;g.stroke()}
  g.strokeStyle="#caa54a";g.lineWidth=1.4;g.beginPath();g.moveTo(tip[0],tip[1]);g.lineTo(tip[0],tip[1]-7);g.stroke()}})}
function twinChurch(cx,cy,E,o){/* loď + dve veže na priečelí + oporné oblúky */
 const {box,gable,cyl,P2}=E;const S=pl(E,"s",cy+3.7);const tex=o.tex||"wall";
 cyl(cx,cy-4.4,1.5,4.6,{roof:3.0,tex:"cyl"});
 box(cx+1.3,cy-3.4,1.9,7.0,3.0,{tex,topTex:"slate",winX:[[.5,.8,.5,1.6,1],[1.5,.8,.5,1.6,1],[2.5,.8,.5,1.6,1],[3.5,.8,.5,1.6,1],[4.5,.8,.5,1.6,1],[5.5,.8,.5,1.6,1]],after:x=>flying(x,E,cx+3.45,cx+1.3,cy-2.8,5,1.4,3.0,5.2,4.7)});
 box(cx-1.4,cy-4.0,2.8,7.9,o.nh||5.4,{tex,noTop:1,winX:[[.5,3.2,.6,1.9,1],[1.6,3.2,.6,1.9,1],[2.7,3.2,.6,1.9,1],[3.8,3.2,.6,1.9,1],[4.9,3.2,.6,1.9,1],[6.0,3.2,.6,1.9,1],[7.1,3.2,.6,1.9,1]],
  after:x=>{arch(x,S,cx,1.4,0,2.2,DARK,MOULD,1.3);ring(x,S,cx,4.1,.7,GLASS,MOULD,1.1)}});
 gable(cx-1.4,cy-4.0,2.8,7.9,o.nh||5.4,o.rh||2.8,o.roof||"tile",{alongY:1,gableTex:"wallY"});
 for(const sg of[-1,1]){const bx=cx+sg*1.9,by=cy+3.5;
  if(o.spire)spireTower(E,bx,by,1.8,o.th||8.4,2.2,o.sp||5.5,cx+cy+4.8+(sg>0?2:0),o.col||"#8a9395");
  else{box(bx-.9,by-.9,1.8,1.8,o.th||8.4,{tex,quoin:1,noTop:1,winY:[[.55,3.4,.45,1.8,1],[.55,6.0,.45,1.4,1]],winX:[[.55,3.4,.45,1.8,1]]});pyramid(E,bx,by,2.0,o.th||8.4,o.pr||3.2,o.pc||["","#7a4a3a","#6a3a2c"],cx+cy+7+(sg>0?2:0))}}
}
function fort(cx,cy,E,o){/* štvorcová pevnosť / hrad s rohovými vežami */
 const {box,gable,cyl,P2}=E;const w=o.w||6,d=o.d||5,h=o.h||4.2;const S=pl(E,"s",cy+d/2);
 box(cx-w/2,cy-d/2,w,d,h,{tex:o.tex||"wall",quoin:1,topTex:"cobble",
  after:x=>{for(let r=0;r<2;r++)for(let i=0;i<Math.floor(w/.9);i++){const u=cx-w/2+.55+i*.9;arch(x,S,u,.36,.7+r*1.5,.95,"rgba(40,30,26,.78)","rgba(238,230,208,.8)",.8)}
   arch(x,S,cx,1.4,0,2.0,DARK,MOULD,1.3);for(let i=0;i<Math.floor(w/.62);i++){const u=cx-w/2+.1+i*.62;rect(x,S,u,h,u+.32,h+.35,"rgba(214,204,180,.95)",INK,.5)}}});
 for(const[dx,dy]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const tx=cx+dx*w/2,ty=cy+dy*d/2;
  if(o.round)cyl(tx,ty,.95,h+2.4,{roof:2.6,tex:"cyl"});else{box(tx-.8,ty-.8,1.6,1.6,h+2.4,{tex:o.tex||"wall",quoin:1,noTop:1});pyramid(E,tx,ty,1.9,h+2.4,2.2,o.pc||["","#6f7779","#585f61"],cx+cy+w/2+d/2+3+(dx+dy))}}
 if(o.keep){cyl(cx+o.keep[0],cy+o.keep[1],1.2,h+4.2,{roof:3.0,tex:"cyl",flag:1})}
}
/* ---------- NORIMBERG, PREŠPOROK, LONDÝN, BRNO, KUTNÁ HORA, GDANSK ---------- */
function sebald(cx,cy,E){twinChurch(cx,cy,E,{tex:"wall",spire:false,th:8.0,pr:3.4,roof:"slate",rh:2.6})}
function kaiserburg(cx,cy,E){const {box,gable,cyl}=E;
 box(cx-4.4,cy-2.2,8.8,4.4,4.0,{tex:"wall",quoin:1,topTex:"cobble",winY:[[.8,1.4,.5,1.2,1],[2.2,1.4,.5,1.2,1],[3.6,1.4,.5,1.2,1],[5.0,1.4,.5,1.2,1],[6.4,1.4,.5,1.2,1],[7.6,1.4,.5,1.2,1]]});
 gable(cx-4.4,cy-2.2,8.8,4.4,4.0,2.6,"tile",{});
 cyl(cx-4.8,cy+1.2,1.3,8.4,{roof:3.6,tex:"cyl",flag:1});
 box(cx+3.6,cy-1.8,1.9,1.9,7.2,{tex:"wall",quoin:1,noTop:1});pyramid(E,cx+4.55,cy-.85,2.2,7.2,2.8,["","#7a4a3a","#6a3a2c"],cx+cy+9);
}
function dom_martina(cx,cy,E){const {box,gable,cyl,P2}=E;const S=pl(E,"s",cy+3.7);
 cyl(cx,cy-4.4,1.4,4.4,{roof:3.0,tex:"cyl"});
 box(cx-1.4,cy-4.0,2.8,7.9,5.2,{tex:"wall",noTop:1,winX:[[.5,3.0,.6,1.9,1],[1.6,3.0,.6,1.9,1],[2.7,3.0,.6,1.9,1],[3.8,3.0,.6,1.9,1],[4.9,3.0,.6,1.9,1],[6.0,3.0,.6,1.9,1],[7.1,3.0,.6,1.9,1]]});
 gable(cx-1.4,cy-4.0,2.8,7.9,5.2,2.6,"slate",{alongY:1,gableTex:"wallY"});
 box(cx+1.4,cy-3.2,1.2,6.6,2.8,{tex:"wall",topTex:"slate",winX:[[.5,.8,.5,1.4,1],[1.7,.8,.5,1.4,1],[2.9,.8,.5,1.4,1],[4.1,.8,.5,1.4,1],[5.3,.8,.5,1.4,1]]});
 spireTower(E,cx,cy+3.6,2.4,9.5,3.2,5.4,cx+cy+5.0,"#9ea4a4");
 /* zlatá koruna na veži */
 E.I.push({d:cx+cy+5.3,draw:g=>{const q=P2(cx,cy+3.6,9.5+3.2+5.4);g.fillStyle="#d9b248";g.strokeStyle=INK;g.lineWidth=.8;g.beginPath();g.moveTo(q[0]-6,q[1]-2);g.lineTo(q[0]-6,q[1]-9);g.lineTo(q[0]-3,q[1]-5);g.lineTo(q[0],q[1]-11);g.lineTo(q[0]+3,q[1]-5);g.lineTo(q[0]+6,q[1]-9);g.lineTo(q[0]+6,q[1]-2);g.closePath();g.fill();g.stroke()}})}
function presHrad(cx,cy,E){fort(cx,cy,E,{w:6.4,d:5.6,h:5.0,tex:"plaster",pc:["","#6f7779","#585f61"]})}
function westminster(cx,cy,E){twinChurch(cx,cy,E,{tex:"wall",spire:false,th:9.0,pr:2.6,pc:["","#9aa0a0","#7a8080"],roof:"slate",rh:2.6,nh:5.8})}
function towerLondon(cx,cy,E){const {box,gable,cyl}=E;
 box(cx-2.4,cy-2.4,4.8,4.8,7.6,{tex:"wall",quoin:1,topTex:"cobble",winY:[[.8,2.2,.5,1.4,1],[2.0,2.2,.5,1.4,1],[3.2,2.2,.5,1.4,1],[1.4,5.0,.5,1.4,1],[2.8,5.0,.5,1.4,1]],winX:[[.8,2.2,.5,1.4,1],[2.0,2.2,.5,1.4,1],[3.2,2.2,.5,1.4,1],[1.4,5.0,.5,1.4,1],[2.8,5.0,.5,1.4,1]]});
 for(const[dx,dy,r]of[[-1,-1,0],[1,1,1],[-1,1,0],[1,-1,0]]){const tx=cx+dx*2.4,ty=cy+dy*2.4;if(dx===1&&dy===-1)cyl(tx,ty,1.0,9.0,{roof:2.6,tex:"cyl"});else{box(tx-.9,ty-.9,1.8,1.8,9.0,{tex:"wall",quoin:1,topTex:"cobble"});}}
 /* vonkajší múr s vežami */
 box(cx-5.4,cy+4.4,10.8,.5,1.8,{tex:"wall",topTex:"cobble",noShadow:1});box(cx+5.0,cy-4.4,.5,9.3,1.8,{tex:"wall",topTex:"cobble",noShadow:1});
 cyl(cx-5.2,cy+4.6,.9,3.6,{roof:1.8,tex:"cyl"});cyl(cx+5.2,cy+4.6,.9,3.6,{roof:1.8,tex:"cyl"});cyl(cx+5.2,cy-4.2,.9,3.6,{roof:1.8,tex:"cyl"});}
function petrov(cx,cy,E){twinChurch(cx,cy,E,{tex:"wall",spire:true,th:7.8,sp:6.4,roof:"slate",rh:2.8,col:"#8a9395"})}
function spilberk(cx,cy,E){fort(cx,cy,E,{w:7.6,d:5.2,h:3.6,tex:"wall",round:true,keep:[0,0]})}
function svBarbora(cx,cy,E){const {box,gable,cyl,P2}=E;const S=pl(E,"s",cy+3.0);
 cyl(cx,cy-3.8,1.8,5.0,{roof:3.0,tex:"cyl"});
 box(cx-2.2,cy-3.0,4.4,6.0,4.4,{tex:"wall",noTop:1,quoin:1,winX:[[.6,2.2,.6,1.9,1],[1.8,2.2,.6,1.9,1],[3.0,2.2,.6,1.9,1],[4.2,2.2,.6,1.9,1],[5.2,2.2,.6,1.9,1]],
  after:x=>{arch(x,S,cx,1.3,0,2.0,DARK,MOULD,1.3);flying(x,E,cx+3.6,cx+2.2,cy-2.6,4,1.7,2.6,4.8,4.2);flying(x,E,cx+3.6,cx+2.2,cy-2.6,0,1,0,0,0)}});
 /* charakteristická stanová strecha s troma hrotmi */
 for(const[dx,dy,hh]of[[-1.0,-1.0,4.2],[1.0,.2,5.0],[-.8,1.6,3.8]])pyramid(E,cx+dx,cy+dy,2.5,4.4,hh,["","#7a8a8a","#566464"],cx+cy+dx+dy+4.4);
}
function vlasskyDvur(cx,cy,E){const {box,gable,cyl}=E;
 box(cx-3.8,cy-2.2,7.6,4.4,4.0,{tex:"plaster",quoin:1,noTop:1,winY:[[.7,1.2,.5,1.2,1],[2.0,1.2,.5,1.2,1],[3.3,1.2,.5,1.2,1],[4.6,1.2,.5,1.2,1],[5.9,1.2,.5,1.2,1]],winX:[[.8,1.2,.5,1.2,1],[2.8,1.2,.5,1.2,1]]});
 gable(cx-3.8,cy-2.2,7.6,4.4,4.0,2.4,"tile",{});
 box(cx+3.2,cy-2.0,1.8,1.8,7.4,{tex:"plaster",quoin:1,noTop:1,winY:[[.5,3.0,.45,1.6,1]]});pyramid(E,cx+4.1,cy-1.1,2.1,7.4,2.9,["","#7a8a8a","#566464"],cx+cy+8);
 cyl(cx-3.4,cy+1.8,.8,5.6,{roof:2.2,tex:"cyl"});
}
function gdanskKostol(cx,cy,E){const {box,gable,cyl,P2}=E;const S=pl(E,"s",cy+3.8);
 cyl(cx,cy-4.6,1.8,4.8,{roof:3.0,tex:"cyl"});
 box(cx+1.4,cy-3.6,2.2,7.4,3.4,{tex:"brick",topTex:"slate",winX:[[.5,.9,.55,1.9,1],[1.5,.9,.55,1.9,1],[2.5,.9,.55,1.9,1],[3.5,.9,.55,1.9,1],[4.5,.9,.55,1.9,1],[5.5,.9,.55,1.9,1]],after:x=>flying(x,E,cx+3.9,cx+1.4,cy-3.0,5,1.5,3.3,5.2,4.8)});
 box(cx-3.6,cy-3.6,2.2,7.4,3.4,{tex:"brick",topTex:"slate"});
 box(cx-1.4,cy-4.2,2.8,8.0,6.2,{tex:"brick",noTop:1,winX:[[.5,3.6,.6,2.0,1],[1.6,3.6,.6,2.0,1],[2.7,3.6,.6,2.0,1],[3.8,3.6,.6,2.0,1],[4.9,3.6,.6,2.0,1],[6.0,3.6,.6,2.0,1],[7.1,3.6,.6,2.0,1]]});
 gable(cx-1.4,cy-4.2,2.8,8.0,6.2,2.6,"tile",{alongY:1,gableTex:"wallY"});
 /* mohutná štvorcová veža */
 box(cx-1.3,cy+3.0,2.6,2.6,10.4,{tex:"brick",quoin:1,noTop:1,winY:[[.7,3.4,.5,2.0,1],[1.4,3.4,.5,2.0,1],[.7,7.2,.5,2.2,1],[1.4,7.2,.5,2.2,1]],winX:[[.7,3.4,.5,2.0,1],[.7,7.2,.5,2.2,1]],
  after:x=>{arch(x,S,cx,1.2,0,2.0,DARK,MOULD,1.3)}});
 for(const[dx,dy]of[[-1.3,3.0],[1.3,3.0],[-1.3,5.6],[1.3,5.6]])pyramid(E,cx+dx*.8,cy+dy+0,.9,10.4,1.5,["","#6f7779","#585f61"],cx+cy+8.6);
 pyramid(E,cx,cy+4.3,2.2,10.4,3.0,["","#6f7779","#585f61"],cx+cy+8.7);
}
function gdanskHrad(cx,cy,E){fort(cx,cy,E,{w:7.4,d:5.4,h:4.4,tex:"brick",round:false,pc:["","#7a3a2a","#5c2a1e"]})}
/* ---------- OKOLIE: jedinečná vec každého mesta ---------- */
const hut=(x,y,w,h,wall,roof)=>`<g><path d="M${x-w} ${y}l${w} ${w*.5}l${w} ${-w*.5}v${-h}l${-w} ${-w*.5}l${-w} ${w*.5}z" fill="${wall}" stroke="#2b2117" stroke-width=".8"/><path d="M${x} ${y+w*.5}v${-h-w*.5}" stroke="rgba(0,0,0,.25)"/><path d="M${x-w-2} ${y-h+1}l${w+2} ${-w*.5-9}l${w+2} ${w*.5+9}l${-w-2} ${w*.5}z" fill="${roof}" stroke="#2b2117" stroke-width=".8"/></g>`;
const lab2=(x,y,t)=>`<g pointer-events="none"><rect x="${x-t.length*3.2-6}" y="${y-10}" width="${t.length*6.4+12}" height="15" rx="3" fill="#f6e3a4" stroke="#6b4a0a" stroke-width=".8"/><text x="${x}" y="${y+1}" text-anchor="middle" font-family="Almendra SC,serif" font-size="11" font-weight="700" fill="#4a3208">${t}</text></g>`;
function oko(key,X){
 const hov=window.hovAttr||(()=>"");let s="";
 if(key==="par"){/* Montmartre: vinice + veterný mlyn na kopci */
  const x=330,y=100;
  s+=`<ellipse cx="${x}" cy="${y+18}" rx="120" ry="38" fill="rgba(90,130,60,.35)"/><ellipse cx="${x}" cy="${y+12}" rx="92" ry="28" fill="rgba(120,160,70,.45)"/>`;
  for(let r=0;r<6;r++){s+=`<path d="M${x-80+r*8} ${y+8+r*7}q60 -16 ${150-r*14} -2" fill="none" stroke="#4e6b2b" stroke-width="3" stroke-dasharray="2 3" opacity=".85"/>`}
  s+=`<g transform="translate(${x+6},${y-8})"><path d="M-9 14l3 -30h12l3 30z" fill="#e6dcc0" stroke="#2b2117" stroke-width=".9"/><path d="M-8 -16l8 -9l8 9z" fill="#8b3a2f" stroke="#2b2117" stroke-width=".9"/><g transform="translate(0,-14)"><g class="spin slow">${[0,90,180,270].map(a=>`<g transform="rotate(${a})"><path d="M0 0L2 -26" stroke="#4a3520" stroke-width="1.6"/><path d="M1 -8h9v16h-9z" fill="rgba(240,230,205,.9)" stroke="#4a3520" stroke-width=".6" transform="translate(0,-10) rotate(0)"/></g>`).join("")}</g><circle r="2" fill="#2b2117"/></g></g>`;
  s+=hut(x-56,y+24,9,7,"#e6d6b0","#9a5a3a")+hut(x+48,y+30,8,6,"#e6d6b0","#9a5a3a");
  s+=`<g class="okop okev" data-a="okLm" data-k="par" ${hov("<b>Montmartre</b><br>Vinice a veterné mlyny na kopci nad mestom.")}>${lab2(x,y+62,"Montmartre")}<ellipse class="hit" cx="${x}" cy="${y+10}" rx="100" ry="46" style="animation:none;stroke:#b8862c;fill:rgba(214,170,76,.08)"/></g>`;
 }
 if(key==="ven"){/* Murano: sklárne s pecami */
  const x=990,y=520;
  s+=`<ellipse cx="${x}" cy="${y+14}" rx="115" ry="34" fill="rgba(210,190,140,.5)"/>`;
  s+=hut(x-40,y+12,15,13,"#c9a27a","#a84a38")+hut(x+30,y+16,13,11,"#d8b48a","#a84a38")+hut(x-4,y+30,11,9,"#cfae84","#7a4a3a");
  s+=`<g><rect x="${x-46}" y="${y-24}" width="6" height="18" fill="#6b4a3a" stroke="#2b2117" stroke-width=".6"/><rect x="${x+24}" y="${y-18}" width="6" height="16" fill="#6b4a3a" stroke="#2b2117" stroke-width=".6"/></g>`;
  s+=`<circle class="flick" cx="${x-8}" cy="${y+18}" r="9" fill="rgba(255,150,40,.65)" style="filter:blur(3px)"/><circle class="flick" cx="${x+34}" cy="${y+24}" r="7" fill="rgba(255,150,40,.6)" style="filter:blur(3px)"/>`;
  s+=(X.smk?X.smk(x-43,y-24,3,true)+X.smk(x+27,y-18,3,true):"");
  for(let i=0;i<5;i++)s+=`<path d="M${x-28+i*13} ${y+44}q-3 -8 0 -12q3 4 0 12z" fill="${["#3aa6c9","#d95a7a","#8bd46e","#e9c04a","#9b6bd6"][i]}" stroke="#2b2117" stroke-width=".5" opacity=".95"/>`;
  s+=`<g class="okop okev" data-a="okLm" data-k="ven" ${hov("<b>Murano</b><br>Sklárske pece, farebné sklo a plachetnice z lagúny.")}>${lab2(x,y-46,"Murano – sklárne")}<ellipse class="hit" cx="${x}" cy="${y+16}" rx="100" ry="44" style="animation:none;stroke:#b8862c;fill:rgba(214,170,76,.08)"/></g>`;
 }

 if(key==="vie"){/* Kahlenberg: vinice a heuriger */
  const x=330,y=100;s+=`<ellipse cx="${x}" cy="${y+16}" rx="125" ry="38" fill="rgba(110,150,60,.4)"/>`;
  for(let r=0;r<7;r++)s+=`<path d="M${x-90+r*6} ${y+r*7-4}q70 -14 ${170-r*12} 0" fill="none" stroke="#5a7a2e" stroke-width="3" stroke-dasharray="2 3" opacity=".9"/>`;
  s+=hut(x-4,y+34,13,11,"#efe0b8","#9a4a30");
  s+=`<g transform="translate(${x-4},${y+8})"><path d="M-2 0v-12" stroke="#4a3520" stroke-width="1.2"/><circle cx="-2" cy="-14" r="5" fill="#4a7a2a" stroke="#2b2117" stroke-width=".6"/></g>`;
  for(let i=0;i<3;i++)s+=`<ellipse cx="${x+34+i*8}" cy="${y+44}" rx="5" ry="6" fill="#8a5a32" stroke="#2b2117" stroke-width=".6"/>`;
  s+=`<g class="okop okev" data-a="okLm" data-k="vie" ${hov("<b>Kahlenberg</b><br>Vinice nad Dunajom s krčmou, kde sa čapuje mladé víno.")}>${lab2(x,y+68,"Kahlenberg – heuriger")}<ellipse class="hit" cx="${x}" cy="${y+16}" rx="108" ry="46" style="animation:none;stroke:#b8862c;fill:rgba(214,170,76,.08)"/></g>`}
 if(key==="pra"){/* Strahov: kláštorný pivovar */
  const x=330,y=100;s+=`<ellipse cx="${x}" cy="${y+16}" rx="115" ry="36" fill="rgba(120,150,70,.35)"/>`;
  s+=hut(x-30,y+22,17,15,"#e6d8b4","#a84a38")+hut(x+30,y+26,13,11,"#d8c49a","#8a5a3a");
  s+=`<rect x="${x-56}" y="${y-8}" width="7" height="24" fill="#8a5a3a" stroke="#2b2117" stroke-width=".6"/>`+(X.smk?X.smk(x-52,y-8,3,true):"");
  s+=`<g transform="translate(${x+6},${y-14})"><path d="M-4 0v-24" stroke="#2b2117" stroke-width="1.2"/><path d="M-4 -24l9 3l-9 3z" fill="#b8362c" stroke="#2b2117" stroke-width=".5"/></g>`;
  for(let i=0;i<4;i++)s+=`<ellipse cx="${x-6+i*9}" cy="${y+50}" rx="5" ry="6" fill="#b58a4a" stroke="#2b2117" stroke-width=".6"/>`;
  s+=`<g class="okop okev" data-a="okLm" data-k="pra" ${hov("<b>Strahovský kláštor</b><br>Mnísi varia pivo a pestujú chmeľ.")}>${lab2(x,y+72,"Strahov – pivovar")}<ellipse class="hit" cx="${x}" cy="${y+16}" rx="100" ry="46" style="animation:none;stroke:#b8862c;fill:rgba(214,170,76,.08)"/></g>`}

 if(key==="kra"){/* Wieliczka: soľná baňa */
  const x=330,y=100;s+=`<ellipse cx="${x}" cy="${y+18}" rx="115" ry="34" fill="rgba(200,190,170,.45)"/>`;
  s+=hut(x-34,y+26,16,14,"#d8c8a8","#7a4a3a");
  s+=`<g transform="translate(${x+22},${y+10})"><path d="M-14 22L-6 -22L6 -22L14 22" fill="none" stroke="#4a3520" stroke-width="2.6"/><path d="M-9 8h18M-12 16h24" stroke="#4a3520" stroke-width="1.6"/><g class="spin"><circle cy="-22" r="7" fill="none" stroke="#6b4a2a" stroke-width="2"/><path d="M-7 -22h14M0 -29v14" stroke="#6b4a2a" stroke-width="1.4"/></g></g>`;
  for(let i=0;i<4;i++)s+=`<path d="M${x-60+i*9} ${y+46}l5 -12l5 12z" fill="#f3f1ea" stroke="#2b2117" stroke-width=".6"/>`;
  s+=`<ellipse cx="${x-12}" cy="${y+46}" rx="10" ry="4" fill="#8a7a62" stroke="#2b2117" stroke-width=".6"/>`;
  s+=`<g class="okop okev" data-a="okLm" data-k="kra" ${hov("<b>Wieliczka</b><br>Soľná baňa s ťažnou vežou. Soľ z Krakova sa vozí po celej ríši.")}>${lab2(x,y+68,"Wieliczka – soľná baňa")}<ellipse class="hit" cx="${x}" cy="${y+20}" rx="100" ry="46" style="animation:none;stroke:#b8862c;fill:rgba(214,170,76,.08)"/></g>`}
 if(key==="bud"){/* termálne kúpele */
  const x=330,y=100;s+=`<ellipse cx="${x}" cy="${y+18}" rx="115" ry="34" fill="rgba(150,170,120,.4)"/>`;
  s+=hut(x-36,y+26,16,14,"#e6dcc0","#7a5a4a");
  s+=`<ellipse cx="${x+22}" cy="${y+30}" rx="30" ry="12" fill="#58b0c8" stroke="#2b2117" stroke-width=".9"/><ellipse cx="${x+22}" cy="${y+30}" rx="22" ry="8" fill="rgba(180,235,245,.65)"/><ellipse cx="${x+60}" cy="${y+44}" rx="18" ry="7" fill="#58b0c8" stroke="#2b2117" stroke-width=".9"/>`;
  s+=(X.smk?X.smk(x+16,y+24,4,false)+X.smk(x+30,y+26,3,false)+X.smk(x+58,y+38,3,false):"");
  s+=`<g class="okop okev" data-a="okLm" data-k="bud" ${hov("<b>Termálne kúpele</b><br>Prirodzené teplé pramene pod hradným vrchom.")}>${lab2(x,y+66,"Termálne kúpele")}<ellipse class="hit" cx="${x}" cy="${y+22}" rx="100" ry="44" style="animation:none;stroke:#b8862c;fill:rgba(214,170,76,.08)"/></g>`}

 const mk=(k,title,hovt,body,lab)=>{s+=body+`<g class="okop okev" data-a="okLm" data-k="${k}" ${hov(`<b>${title}</b><br>${hovt}`)}>${lab2(330,168,lab)}<ellipse class="hit" cx="330" cy="120" rx="100" ry="46" style="animation:none;stroke:#b8862c;fill:rgba(214,170,76,.08)"/></g>`};
 const bg=`<ellipse cx="330" cy="118" rx="115" ry="34" fill="rgba(170,170,120,.4)"/>`;
 if(key==="pre")mk("pre","Vinice pod Karpatmi","Svahy nad Dunajom s lisom na hrozno.",bg+[0,1,2,3,4].map(r=>`<path d="M${250+r*6} ${108+r*7}q60 -14 ${150-r*12} 0" fill="none" stroke="#5a7a2e" stroke-width="3" stroke-dasharray="2 3"/>`).join("")+hut(300,150,14,12,"#efe0b8","#9a4a30")+`<ellipse cx="350" cy="152" rx="6" ry="7" fill="#8a5a32" stroke="#2b2117" stroke-width=".6"/>`,"Vinice pod Karpatmi");
 if(key==="nur")mk("nur","Kováčske dielne","Kováči a zlatníci v lesoch pri meste.",bg+hut(300,150,15,13,"#c9b894","#6a4a3a")+`<rect x="338" y="104" width="7" height="22" fill="#6b4a3a" stroke="#2b2117" stroke-width=".6"/><circle class="flick" cx="305" cy="142" r="9" fill="rgba(255,140,40,.7)" style="filter:blur(3px)"/>`+(X.smk?X.smk(341,104,3,true):"")+`<rect x="340" y="150" width="18" height="6" fill="#3a3a3a" stroke="#2b2117" stroke-width=".6"/>`,"Kováčske dielne");
 if(key==="lon")mk("lon","Prístav a lodenice","Lode z celej Európy kotvia na Temži.",bg+`<path d="M250 140q40 10 80 0q40 -10 80 0" fill="rgba(90,140,180,.55)"/><rect x="262" y="130" width="62" height="6" fill="#6b4a2a" stroke="#2b2117" stroke-width=".6"/><path d="M300 126v-34" stroke="#4a3520" stroke-width="2"/><path d="M300 94l22 14l-22 6z" fill="#f2ead2" stroke="#2b2117" stroke-width=".6"/><path d="M280 128l40 0l-6 10h-28z" fill="#8a5a32" stroke="#2b2117" stroke-width=".6"/>`+hut(345,142,13,10,"#c9b894","#7a4a3a"),"Prístav na Temži");
 if(key==="brn")mk("brn","Valchy a súkno","Sukenníci tu valchujú a sušia súkno.",bg+hut(290,152,14,12,"#d8c8a8","#8a4a3a")+[0,1,2].map(i=>`<g transform="translate(${330+i*24},132)"><path d="M0 22V0M18 22V0" stroke="#4a3520" stroke-width="1.6"/><rect x="0" y="2" width="18" height="12" fill="${["#b8362c","#2f5bb0","#e4c04a"][i]}" stroke="#2b2117" stroke-width=".6" opacity=".9"/></g>`).join(""),"Súkenné valchy");
 if(key==="kut")mk("kut","Strieborné bane","Ťažba striebra, ktorá živí kráľovskú mincovňu.",bg+`<g transform="translate(300,132)"><path d="M-14 22L-6 -22L6 -22L14 22" fill="none" stroke="#4a3520" stroke-width="2.6"/><path d="M-9 8h18M-12 16h24" stroke="#4a3520" stroke-width="1.6"/><g class="spin"><circle cy="-22" r="7" fill="none" stroke="#6b4a2a" stroke-width="2"/><path d="M-7 -22h14M0 -29v14" stroke="#6b4a2a" stroke-width="1.4"/></g></g>`+[0,1,2,3].map(i=>`<path d="M${338+i*10} 154l6 -14l6 14z" fill="#8a8a92" stroke="#2b2117" stroke-width=".6"/>`).join("")+`<rect x="276" y="148" width="14" height="8" fill="#6b4a2a" stroke="#2b2117" stroke-width=".6"/>`,"Strieborné bane");
 if(key==="gda")mk("gda","Jantárové pobrežie","Pobrežie Baltu, kde sa zbiera jantár.",`<ellipse cx="330" cy="118" rx="115" ry="34" fill="rgba(236,214,150,.55)"/><path d="M215 108q60 -16 230 0v-24h-230z" fill="rgba(90,140,180,.55)"/>`+[0,1,2,3,4].map(i=>`<circle cx="${270+i*18}" cy="${128+(i%2)*8}" r="3" fill="#e9a833" stroke="#7a4a1a" stroke-width=".5"/>`).join("")+`<path d="M300 100l20 -18l20 18z" fill="#f2ead2" stroke="#2b2117" stroke-width=".6"/><path d="M300 100h40l-6 8h-28z" fill="#8a5a32" stroke="#2b2117" stroke-width=".6"/>`+hut(380,148,12,10,"#d8c8a8","#8a4a3a"),"Jantárové pobrežie");
 return s}
if(window.OKEV){const o=OKEV.svg;OKEV.svg=function(a,b,c){let r=o(a,b,c);try{let k=null;try{k=CITY_DEF[c.def].key}catch(e){}if(k&&window.OKX)r+=oko(k,window.OKX)}catch(e){console.warn("oko mesta",e)}return r}}
A.okLm=e=>{const t={par:["Montmartre","Vinice na kopci nad Parížom a veterné mlyny. Tu sa pestuje víno pre parížske krčmy a kláštory."],pre:["Vinice pod Karpatmi","Pri Prešporku rastie víno už od čias Rimanov. Z hrozna sa lisuje víno, ktoré ide po Dunaji."],nur:["Kováčske dielne","Norimberskí kováči a zlatníci sú známi v celej ríši. Vyrábajú aj hračky a prístroje."],lon:["Prístav na Temži","Lode zo severu aj juhu vykladajú vlnu, víno a korenie priamo pod mestom."],brn:["Valchy a súkno","Brno je mesto súkenníkov. Súkno sa valchuje pri vode a suší na rámoch."],kut:["Strieborné bane","Kutná Hora žije zo striebra. Z bani sa vozia rudy do kráľovskej mincovne."],gda:["Jantárové pobrežie","Baltické pobrežie prináša jantár, ktorý sa predáva obchodníkom z celej Európy."],kra:["Wieliczka","Soľná baňa pri Krakove: tu sa soľ ťaží, vozí a predáva. Krakov z nej žije."],bud:["Termálne kúpele","Pod budínskym vrchom vyvierajú teplé pramene. Mešťania aj kupci sem chodia liečiť kosti."],vie:["Kahlenberg","Vinice nad Dunajom a krčma, kde sa čapuje mladé víno (heuriger). Odtiaľto sa Viedeň zásobuje vínom."],pra:["Strahovský kláštor","Mnísi na Petříne varia pivo a pestujú chmeľ. Pivo z Prahy poznajú aj za hranicami."],ven:["Murano","Na ostrove sú sklárske dielne. Majstri smú odísť z Benátok len s povolením dóžu, aby sa tajomstvo skla nevyniesla do sveta."]}[e.k];if(t)queue({title:t[0],html:`<p>${esc(t[1])}</p>`,btns:[{t:"Zavrieť",a:"mclose",pri:1}]})};
function LMX(key2,cx,cy,l,E){
 const night=!!(E.T&&E.T.night);
 if(!E.k2){const a=E.P2(0,0,0),b=E.P2(1,0,0),c=E.P2(0,0,1);E.k2=(b[0]-a[0])*1.414;E.zs=a[1]-c[1]}
 if(E.key==="par"&&key2==="kostol"){notreDame(cx,cy,E,night);return true}
 if(E.key==="ven"&&key2==="kostol"){sanMarco(cx,cy,E,night);return true}
 if(E.key==="vie"&&key2==="kostol"){stephansdom(cx,cy,E,night);return true}
 if(E.key==="vie"&&key2==="hrad"){hofburg(cx,cy,E,night);return true}
 if(E.key==="pra"&&key2==="kostol"){svatyVit(cx,cy,E,night);return true}
 if(E.key==="pra"&&key2==="hrad"){prazskyHrad(cx,cy,E,night);return true}
 if(E.key==="kra"&&key2==="kostol"){marianskyKostol(cx,cy,E,night);return true}
 if(E.key==="kra"&&key2==="radnica"){sukiennice(cx,cy,E,night);return true}
 if(E.key==="kra"&&key2==="hrad"){wawel(cx,cy,E,night);return true}
 if(E.key==="bud"&&key2==="kostol"){matyasovKostol(cx,cy,E,night);return true}
 if(E.key==="bud"&&key2==="hrad"){budinHrad(cx,cy,E,night);return true}

 const T2={nur:{kostol:sebald,hrad:kaiserburg},pre:{kostol:dom_martina,hrad:presHrad},lon:{kostol:westminster,hrad:towerLondon},brn:{kostol:petrov,hrad:spilberk},kut:{kostol:svBarbora,hrad:vlasskyDvur},gda:{kostol:gdanskKostol,hrad:gdanskHrad}};
 if(T2[E.key]&&T2[E.key][key2]){T2[E.key][key2](cx,cy,E);return true}
 if(E.key==="ven"&&key2==="hrad"){palazzoDucale(cx,cy,E,night);return true}
 return false}
window.LMX=LMX;window.MESTA={notreDame};
})();

;
