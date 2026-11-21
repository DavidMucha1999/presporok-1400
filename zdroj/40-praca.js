/* ==== js/praca.js ==== */
/* Prešporok 1400 – RPG, práca (etapa 2, v348; etapa 4, v358): práce, ktoré hráč naozaj vykonáva v 3D meste.
   Okolie: pole (kosenie), vinohrad (oberanie hrozna), rybár pri Dunaji (záber). Mesto: kupec s vozom (nosenie vriec na trh).
   Dielne rodov: pomocná práca u majstra – podľa remesla jeden z troch úkonov: údery v rytme (kováč, tesár, baňa…),
   odhad času (pekár, pivovar, hrnčiar…) alebo poradie hmatov (tkáč, garbiar, pisáreň…).
   Remeslo: nádenník so zručnosťou 2 sa môže dať prijať za tovariša (viaže sa na remeslo, vyššia mzda), tovariš so zručnosťou 5
   môže zložiť majstrovskú skúšku. Práca stojí čas, únavu a hlad, zručnosť zvyšuje mzdu a uľahčuje úkon.
   Stav: S.rpg.job (deň), S.rpg.sk, S.rpg.earned, S.rpg.rank, S.rpg.craft. Autor: Dávid Mucha. */
(function(){"use strict";
 const R=()=>{try{return S&&S.rpg&&!S.__demo?S.rpg:null}catch(e){return null}};
 const M3=()=>window.__m3&&window.__m3.pos&&window.__m3.interA&&document.getElementById("m3d")?window.__m3:null;
 const night=r=>{const h=(r.min/60)%24;return h>=21||h<6};
 const W0=()=>({pole:0,nos:0,vino:0,ryby:0});
 const J=()=>{const r=S.rpg;if(!r.job||r.job.day!==r.day)r.job={day:r.day,pole:[],vino:[],nos:0,dil:0,ryby:0,exam:0,wage:Object.assign(W0(),(r.job&&r.job.wage)||{})};const j=r.job;j.vino=j.vino||[];j.ryby=j.ryby||0;j.wage=Object.assign(W0(),j.wage);return j};
 const lvl=k=>Math.floor((S.rpg.sk||{})[k]||0),bonus=k=>1+Math.min(.5,lvl(k)*.1);
 function skill(k,n){const r=S.rpg;r.sk=r.sk||{};const a=Math.floor(r.sk[k]||0);r.sk[k]=(r.sk[k]||0)+n;if(Math.floor(r.sk[k])>a)toast("Zručnosť „"+k+"“ stúpla na "+Math.floor(r.sk[k])+".","good")}
 function spend(min,tired,hunger){const r=S.rpg;r.min+=min;r.tired=Math.min(100,r.tired+tired);r.hunger=Math.min(100,r.hunger+hunger)}
 function earn(n){const r=S.rpg,p=P();n=Math.max(0,Math.round(n));if(!n)return;p.money+=n;r.earned=(r.earned||0)+n;try{led(p,"ine",n)}catch(e){}try{SND.play("coin")}catch(e){}
  if((r.rank|0)===0&&r.earned>=20){r.rank=1;try{queue({title:"Nádenník",html:"<p>Zarobil si prvých dvadsať zlatých poctivou prácou. V meste ťa už poznajú ako <b>nádenníka</b>.</p><p>Majstri v dielňach ti odteraz platia viac a stráž ťa pustí do Horného mesta. Keď sa v niektorom remesle vypracuješ na zručnosť 2, majster ťa môže prijať za <b>tovariša</b>.</p>"})}catch(e){}}
  try{save()}catch(e){}}
 function can(){const r=R();if(!r)return false;if(night(r)){toast("V noci sa nepracuje. Príď ráno po šiestej.","bad");return false}if(r.hunger>=90){toast("Si príliš hladný na prácu. Najprv sa najedz.","bad");return false}if(r.tired>=90){toast("Si príliš unavený na prácu. Vyspi sa.","bad");return false}return true}
 const css=document.createElement("style");css.textContent=`#rpgwork{position:fixed;z-index:56;left:50%;bottom:110px;transform:translateX(-50%);width:300px;background:#f6ecd2f2;color:#2b2117;border:2px solid #b8862b;border-radius:10px;padding:6px 12px;font:600 15px "EB Garamond",Georgia,serif;text-align:center;box-shadow:0 6px 20px #000a}
#rpgwork div{height:10px;background:#e2d4ae;border-radius:5px;overflow:hidden;margin-top:4px}#rpgwork i{display:block;height:100%;width:0;background:#b8862b}
#rpgmini{position:fixed;z-index:60;left:50%;top:50%;transform:translate(-50%,-50%);width:min(480px,90vw);background:#f6ecd2;color:#2b2117;border:2px solid #b8862b;border-radius:12px;padding:14px 18px;font:16px/1.35 "EB Garamond",Georgia,serif;box-shadow:0 14px 50px #000c;text-align:center}
#rpgmini h3{margin:0 0 4px;font-family:"Almendra SC","EB Garamond",Georgia,serif;color:#7a4f12}
#rpgmini .tr{position:relative;height:26px;background:#e2d4ae;border:1px solid #b8862b;border-radius:6px;margin:12px 0 8px;overflow:hidden}
#rpgmini .gz{position:absolute;top:0;bottom:0;background:#7fae5a}#rpgmini .mk{position:absolute;top:-2px;bottom:-2px;width:6px;margin-left:-3px;background:#2b2117;border-radius:3px}
#rpgmini .fl{position:absolute;left:0;top:0;bottom:0;width:0;background:#c9973a;opacity:.75}
#rpgmini .sq{display:flex;gap:8px;justify-content:center;margin:12px 0 8px}#rpgmini .sq b{width:40px;height:40px;line-height:38px;border:2px solid #b8862b;border-radius:8px;background:#fff8e4;font:700 20px Georgia,serif}#rpgmini .sq b.ok{background:#7fae5a;color:#fff}#rpgmini .sq b.no{background:#c9603a;color:#fff}
#rpgmini .big{font:700 22px "Almendra SC",Georgia,serif;margin:14px 0;min-height:30px}#rpgmini .big.go{color:#a8321e}
#rpgmini button{background:#b8862b;color:#fff;border:0;border-radius:16px;padding:5px 18px;font:600 15px "EB Garamond",Georgia,serif;cursor:pointer;margin:4px}
#rpgmini button.g{background:#fff8e4;color:#2b2117;border:1.5px solid #b8862b}#rpgmini button:disabled{opacity:.45;cursor:default}
#rpgmini .mn{display:flex;flex-direction:column;gap:6px;margin-top:10px}#rpgmini .mn button{margin:0;border-radius:10px;padding:7px 12px}#rpgmini small{display:block;font-size:13px}`;document.head.appendChild(css);
 /* úkon: trvá pár sekúnd, hráč musí ostať na mieste */
 let WK=null,MG=null;const bar=document.createElement("div");bar.id="rpgwork";bar.hidden=true;bar.innerHTML="<b></b><div><i></i></div>";document.body.appendChild(bar);
 function work(sec,label,done){if(WK||MG)return;const M=M3();if(!M)return;WK={t:0,dur:sec,pos:M.pos(),done};bar.firstChild.textContent=label;bar.hidden=false}
 setInterval(()=>{if(!WK)return;const M=M3();if(!M||!R()){WK=null;bar.hidden=true;return}const q=M.pos();if(Math.hypot(q[0]-WK.pos[0],q[1]-WK.pos[1])>1.3){WK=null;bar.hidden=true;toast("Prácu si prerušil.","bad");return}
  WK.t+=.1;bar.querySelector("i").style.width=Math.min(100,WK.t/WK.dur*100)+"%";if(WK.t>=WK.dur){const d=WK.done;WK=null;bar.hidden=true;bar.querySelector("i").style.width="0";try{d()}catch(e){console.warn("RPG práca",e)}}},100);
 /* ---- okno úkonu: rytmus (údery), cas (odhad času), vzor (poradie hmatov), zaber (ryby) ---- */
 const KN={w:"W",a:"A",s:"S",d:"D"};
 function mini(kind,title,o,cb){if(MG||WK)return;const N=o.n,d=document.createElement("div");d.id="rpgmini";const HELP={rytmus:"Udri, keď je značka v zelenom poli. Stlač <b>E</b>, <b>medzerník</b> alebo klikni.",cas:"Dielo sa pomaly dokončuje. Zastav ho klávesom <b>E</b>, keď je v zelenom poli – priskoro je nedorobené, neskoro pokazené.",vzor:"Zopakuj hmaty v danom poradí klávesmi <b>W A S D</b>.",zaber:"Čakaj na záber. Keď sa plavák ponorí, hneď stlač <b>E</b>."};
  d.innerHTML="<h3>"+title+"</h3><div>"+HELP[kind]+"</div>"+(kind==="vzor"?"<div class='sq'></div>":kind==="zaber"?"<div class='big'>…</div>":"<div class='tr'>"+(kind==="cas"?"<div class='gz'></div><div class='fl'></div>":"<div class='gz'></div><div class='mk'></div>")+"</div>")+"<div class='st'></div><div>"+(kind==="vzor"?"":"<button data-k='hit'>"+(kind==="rytmus"?"Udrieť":kind==="cas"?"Zastaviť":"Zaseknúť")+" (E)</button>")+"<button class='g' data-k='x'>Nechať tak</button></div>";
  document.body.appendChild(d);const gz=d.querySelector(".gz"),mk=d.querySelector(".mk"),fl=d.querySelector(".fl"),st=d.querySelector(".st"),sq=d.querySelector(".sq"),big=d.querySelector(".big");
  const g=MG={kind,n:0,hit:0,t:Math.random()*6,pos:0,cool:0,seq:[],i:0,wait:0,win:0,z0:.5,sp:1},gw=o.gw;
  const stat=()=>{st.textContent=(kind==="rytmus"?"Úder ":kind==="zaber"?"Nához ":"Kus ")+Math.min(N,g.n+(kind==="rytmus"?0:1))+" z "+N+" · podarených "+g.hit};
  const round=()=>{g.cool=.3;if(kind==="cas"){g.pos=0;g.sp=(.42+Math.random()*.4)*(o.fast||1);g.z0=.58+Math.random()*.25;gz.style.left=(g.z0-gw/2)*100+"%";gz.style.width=gw*100+"%";fl.style.width="0"}
   if(kind==="vzor"){g.seq=Array.from({length:o.len},()=>"wasd"[Math.floor(Math.random()*4)]);g.i=0;g.wait=o.time;sq.innerHTML=g.seq.map(k=>"<b>"+KN[k]+"</b>").join("")}
   if(kind==="zaber"){g.wait=1.6+Math.random()*4;g.win=0;big.textContent="Plavák sa pohojdáva…";big.className="big"}stat()};
  if(kind==="rytmus"){gz.style.left=(50-gw*50)+"%";gz.style.width=gw*100+"%"}
  const end=fin=>{clearInterval(iv);removeEventListener("keydown",kd,true);d.remove();MG=null;try{cb(fin?g.hit/N:null,g)}catch(e){console.warn("RPG úkon",e)}};
  const next=ok=>{if(g.done)return;if(ok)g.hit++;g.n++;try{SND.play(ok?"coin":"click")}catch(e){}if(gz){gz.style.background=ok?"#4f9a3a":"#c9603a";setTimeout(()=>{gz.style.background=""},200)}
   if(g.n>=N){g.done=1;st.textContent="Hotovo · podarených "+g.hit+" z "+N;setTimeout(()=>end(true),450)}else if(kind!=="rytmus")round();else{g.cool=.35;stat()}};
  const act=()=>{if(g.done||g.cool>0)return;if(kind==="rytmus")next(Math.abs(g.pos-.5)<=gw/2);else if(kind==="cas")next(Math.abs(g.pos-g.z0)<=gw/2);else if(kind==="zaber")next(g.win>0)};
  const key=k=>{if(g.done||kind!=="vzor"||g.cool>0)return;const el=sq.children[g.i];if(k===g.seq[g.i]){el.className="ok";g.i++;if(g.i>=g.seq.length)next(true)}else{el.className="no";g.cool=.5;setTimeout(()=>{if(MG===g)next(false)},350)}};
  const kd=e=>{const k=e.key.toLowerCase();e.stopImmediatePropagation();if(k==="escape"){e.preventDefault();end(false);return}if(kind==="vzor"){const m={arrowup:"w",arrowleft:"a",arrowdown:"s",arrowright:"d"}[k]||k;if(m.length===1&&"wasd".includes(m)){e.preventDefault();key(m)}return}if(k==="e"||k===" "||k==="enter"){e.preventDefault();act()}};
  addEventListener("keydown",kd,true);d.onclick=e=>{const k=e.target.closest("[data-k]");if(!k)return;if(k.dataset.k==="x")end(false);else act()};
  const sp=(2.6+Math.random()*.6)*(o.fast||1);g.key=key;g.act=act;if(kind==="rytmus")stat();else round();
  const iv=setInterval(()=>{if(MG!==g||g.done)return;g.cool-=.03;if(kind==="rytmus"){g.t+=.03*sp;g.pos=(Math.sin(g.t)+1)/2;mk.style.left=g.pos*100+"%"}
   else if(kind==="cas"){if(g.cool>0)return;g.pos+=.03*g.sp;fl.style.width=Math.min(100,g.pos*100)+"%";if(g.pos>=1.02)next(false)}
   else if(kind==="vzor"){if(g.cool>0)return;g.wait-=.03;if(g.wait<=0)next(false)}
   else if(kind==="zaber"){if(g.cool>0)return;if(g.win>0){g.win-=.03;if(g.win<=0)next(false)}else{g.wait-=.03;if(g.wait<=0){g.win=o.win;big.textContent="ZÁBER! Stlač E";big.className="big go"}}}},30)}
 /* ponuka (majster): nadpis, text a tlačidlá */
 function menu(title,text,opts){if(MG||WK)return;const d=document.createElement("div");d.id="rpgmini";d.innerHTML="<h3>"+title+"</h3><div>"+text+"</div><div class='mn'>"+opts.map((o,i)=>"<button data-i='"+i+"' "+(o.off?"disabled":"")+(o.g?" class='g'":"")+">"+o.t+(o.s?"<small>"+o.s+"</small>":"")+"</button>").join("")+"<button class='g' data-i='x'>Odísť</button></div>";
  const g=MG={menu:1,opts};const close=()=>{removeEventListener("keydown",kd,true);d.remove();if(MG===g)MG=null};const kd=e=>{e.stopImmediatePropagation();if(e.key==="Escape"){e.preventDefault();close()}};addEventListener("keydown",kd,true);
  d.onclick=e=>{const b=e.target.closest("[data-i]");if(!b||b.disabled)return;const i=b.dataset.i;close();if(i!=="x")try{opts[+i].f()}catch(x){console.warn("RPG ponuka",x)}};document.body.appendChild(d)}
 /* ---- miesta práce v 3D (stavajú sa po každom postavení mesta) ---- */
 let scn=null,PLOTS={},sack=null,carry=false;
 const BOSS={pole:["Gazda","„Pokos obilie na poli. Za celé pole dám štyri zlaté, šikovnejšiemu aj viac.“"],vino:["Vinohradník","„Ober hrozno zo všetkých krov. Za celý vinohrad dám päť zlatých.“"],nos:["Kupec",""],ryby:["Rybár",""]};
 function build(M){const T=window.THREE,sc=M.scene(),I=M.interA(),sol=M.sol(),gates=M.gates||[],cen=M.cen||[0,0];PLOTS={};sack=null;carry=false;if(!T||!gates.length)return;
  const L=c=>new T.MeshLambertMaterial({color:c}),th=(x,z)=>{try{return M.th(x,z)}catch(e){return 0}},wet=(x,z)=>{try{return !!M.wet(x,z)}catch(e){return false}};
  const free=(x,z,r)=>!wet(x,z)&&sol.every(q=>Math.hypot(q[0]-x,q[1]-z)>q[2]+r)&&I.every(it=>Math.hypot(it.x-x,it.z-z)>Math.max(1.5,r));
  let RD=[],RV=[];try{const Ly=M.lay(),U=(M.toLay(1,0)[0]-M.toLay(0,0)[0])||10,cv=p=>[(p[0]-Ly.cx)/U,(p[1]-Ly.cy)/U];RD=(Ly.streets||[]).concat(Ly.ring&&Ly.ring.length>2?[Ly.ring.concat([Ly.ring[0]])]:[]).map(s=>s.map(cv));RV=(Ly.river||[]).map(cv)}catch(e){}
  const dS=(x,z,a,b)=>{const vx=b[0]-a[0],vz=b[1]-a[1],l2=vx*vx+vz*vz||1;let k=((x-a[0])*vx+(z-a[1])*vz)/l2;k=k<0?0:k>1?1:k;return Math.hypot(x-a[0]-vx*k,z-a[1]-vz*k)},road=(x,z)=>{let m=1e9;for(const s of RD)for(let i=0;i<s.length-1;i++){const d=dS(x,z,s[i],s[i+1]);if(d<m)m=d}return m};
  const gs=gates.slice().sort((a,b)=>Math.hypot(a[0]-cen[0],a[1]-cen[1])-Math.hypot(b[0]-cen[0],b[1]-cen[1]));
  const add=(m,x,y,z)=>{m.position.set(x,y,z);m.castShadow=true;sc.add(m);return m};
  const npc=(col,o,x,z,ry)=>{try{const m=M.npc(col,o);if(m){m.position.set(x,th(x,z),z);m.rotation.y=ry||0}}catch(e){}};
  /* políčko s dvanástimi miestami (pole, vinohrad) v mriežke 4×3, vedľa stojí hospodár */
  const used=[];
  function plot(key,order,o){let F=null;search:for(const g of order){const dx=g[0]-cen[0],dz=g[1]-cen[1],dl=Math.hypot(dx,dz)||1,ux=dx/dl,uz=dz/dl;for(const d of [16,20,24,28,34])for(const s of [9,-9,14,-14,20,-20,0,26,-26]){const x=g[0]+ux*d-uz*s,z=g[1]+uz*d+ux*s;if(used.some(u=>Math.hypot(u[0]-x,u[1]-z)<24))continue;let ok=true;for(let i=-1;i<=1&&ok;i++)for(let j=-1;j<=1&&ok;j++)if(!free(x+i*4,z+j*3.5,1.2)||road(x+i*4,z+j*3.5)<4||Math.abs(th(x+i*4,z+j*3.5)-th(x,z))>1.2)ok=false;if(ok){F=[x,z];break search}}}
   if(!F)return;used.push(F);const CL=[];PLOTS[key]=CL;
   const soil=new T.Mesh(new T.PlaneGeometry(11.5,8.6),L(o.soil));soil.rotation.x=-Math.PI/2;soil.position.set(F[0],th(F[0],F[1])+.04,F[1]);soil.receiveShadow=true;sc.add(soil);
   for(let i=0;i<12;i++){const x=F[0]-3.6+(i%4)*2.4,z=F[1]-2.4+Math.floor(i/4)*2.4,G=new T.Group();G.position.set(x,th(x,z),z);sc.add(G);const v=o.make(T,L,G);
    const it={x,z,r:1.5,kind:"job",text:"",act:null},c={i,up:v[0],dn:v[1],it};c.set=()=>{const done=J()[key].includes(i);v[0].visible=!done;if(v[1])v[1].visible=done;it.text=done?o.tDone:o.tDo;it.act=done?null:()=>reap(key,c,o)};c.set();I.push(it);CL.push(c)}
   const fx=F[0]+6.6,fz=F[1]+1;npc(o.npc[0],o.npc[1],fx,fz,-1.2);I.push({x:fx-.9,z:fz+.6,r:3.1,kind:"job",fz:1,text:BOSS[key][0]+": "+o.tBoss,act:()=>boss(key)})}
  plot("pole",gs,{soil:"#8a6a3a",tDo:"Zrelé obilie: kosiť",tDone:"Pokosené – snop",tBoss:"práca na poli a výplata mzdy",npc:["#6a5a3a",{hat:"#c9a85a",dr:{hd:"straw"}}],label:"Kosíš obilie…",sec:2.4,min:20,tired:2.5,pay:.34,sk:"poľné práce",skn:.09,
   make:(T,L,G)=>{const up=new T.Group(),wm=L("#d9b548");[[0,0],[.28,.12],[-.24,.18],[.05,-.28]].forEach(q=>{const c=new T.Mesh(new T.ConeGeometry(.42,1.25,7),wm);c.position.set(q[0],.62,q[1]);c.castShadow=true;up.add(c)});const dn=new T.Mesh(new T.CylinderGeometry(.2,.2,.9,7),L("#b89a3a"));dn.rotation.z=Math.PI/2;dn.position.y=.22;dn.castShadow=true;G.add(up);G.add(dn);return[up,dn]}});
  plot("vino",gs.slice().reverse(),{soil:"#6a5a34",tDo:"Zrelé hrozno: oberať",tDone:"Obratý ker",tBoss:"práca vo vinohrade a výplata mzdy",npc:["#5a3a5a",{hat:"#3a2a1a"}],label:"Oberáš hrozno…",sec:2.8,min:22,tired:2.2,pay:.42,sk:"vinohradníctvo",skn:.09,
   make:(T,L,G)=>{const st=new T.Mesh(new T.CylinderGeometry(.04,.05,1.5,5),L("#6b4a2a"));st.position.y=.75;st.castShadow=true;G.add(st);const lf=new T.Mesh(new T.SphereGeometry(.5,8,6),L("#4f7a34"));lf.position.y=1.05;lf.scale.set(1,.8,1);lf.castShadow=true;G.add(lf);
    const up=new T.Group(),gm=L("#5a2a6a");[[.3,.8,.2],[-.28,.9,.15],[.05,.7,-.32],[-.1,1.1,.36]].forEach(q=>{const b=new T.Mesh(new T.SphereGeometry(.13,7,5),gm);b.position.set(q[0],q[1],q[2]);b.scale.y=1.4;up.add(b)});G.add(up);return[up,null]}});
  /* kupec: voz s vrecami pri bráne, sklad na trhu */
  {const g=gs[0],dx=cen[0]-g[0],dz=cen[1]-g[1],dl=Math.hypot(dx,dz)||1,ux=dx/dl,uz=dz/dl;let Pk=null;srch2:for(const d of [12,15,18,21,9])for(const s of [4,-4,7,-7,0,10,-10]){const x=g[0]+ux*d-uz*s,z=g[1]+uz*d+ux*s;if(free(x,z,3)&&free(x,z+3,2.2)&&free(x,z+6,2)&&free(x+2,z+8,1.5)){Pk=[x,z];break srch2}}
   const tp=I.find(it=>/^Trh/.test(it.text||""));let Dp=null;if(tp)for(let r=5;r<16&&!Dp;r+=1.5)for(let a=0;a<6.28;a+=.5){const x=tp.x+Math.sin(a)*r,z=tp.z+Math.cos(a)*r;if(free(x,z,1.6)&&I.every(it=>(it.kind!=="stall"&&it.kind!=="npc"&&it.kind!=="board")||Math.hypot(it.x-x,it.z-(z+1.4))>it.r+1.2)){Dp=[x,z];break}}
   if(Pk&&Dp){const wd=L("#7a5530"),sk=L("#d8c9a0"),y=th(Pk[0],Pk[1]);add(new T.Mesh(new T.BoxGeometry(1.2,.4,2.2),wd),Pk[0],y+.75,Pk[1]);[[-.65,-.7],[.65,-.7],[-.65,.7],[.65,.7]].forEach(w=>{const wl=new T.Mesh(new T.CylinderGeometry(.36,.36,.08,12),L("#4a3520"));wl.rotation.z=Math.PI/2;add(wl,Pk[0]+w[0],y+.36,Pk[1]+w[1])});
    for(let i=0;i<5;i++){const s=new T.Mesh(new T.SphereGeometry(.3,8,6),sk);s.scale.set(1,.7,1.25);add(s,Pk[0]+(i%2?.25:-.25),y+1.12+Math.floor(i/2)*.3,Pk[1]-.6+(i%3)*.55)}sol.push([Pk[0],Pk[1],1.3]);
    npc("#4a3a6a",{hat:"#2a2030"},Pk[0]+1.7,Pk[1]+.4,.4);
    I.push({x:Pk[0],z:Pk[1]+1.7,r:3.1,kind:"job",fz:1,text:"Kupec s vozom: nosiť vrecia na trh a výplata mzdy",act:()=>boss("nos")});
    const y2=th(Dp[0],Dp[1]);add(new T.Mesh(new T.BoxGeometry(1.8,.14,1.4),wd),Dp[0],y2+.07,Dp[1]);for(let i=0;i<3;i++){const s=new T.Mesh(new T.SphereGeometry(.3,8,6),sk);s.scale.set(1,.7,1.25);add(s,Dp[0]-.5+i*.5,y2+.35,Dp[1])}
    add(new T.Mesh(new T.BoxGeometry(.08,1.5,.08),wd),Dp[0]+1.05,y2+.75,Dp[1]);sol.push([Dp[0],Dp[1],.9]);
    I.push({x:Dp[0],z:Dp[1]+1.4,r:2.2,kind:"job",text:"Sklad kupca na trhu: zložiť vrece",act:()=>drop()});
    sack=new T.Mesh(new T.SphereGeometry(.34,9,7),L("#8a6a3a"));sack.scale.set(1.15,.8,1.1);sack.position.set(0,1.42,.3);sack.visible=false;try{M.me().add(sack)}catch(e){sack=null}}}
  /* rybár na brehu Dunaja: mólo, rybár, prút a vedro */
  if(RV.length>1){let B=null,bd=1e9;for(let i=0;i<RV.length-1;i++)for(const k of [.2,.5,.8]){const px=RV[i][0]+(RV[i+1][0]-RV[i][0])*k,pz=RV[i][1]+(RV[i+1][1]-RV[i][1])*k,vx=RV[i+1][0]-RV[i][0],vz=RV[i+1][1]-RV[i][1],vl=Math.hypot(vx,vz)||1,nx=-vz/vl,nz=vx/vl;
    for(const sg of [1,-1])for(const d of [3,4.5,6,7.5,9,11,13]){const x=px+nx*d*sg,z=pz+nz*d*sg;if(wet(x,z))continue;if(free(x,z,1.6)&&road(x,z)>3){const dc=Math.hypot(x-cen[0],z-cen[1]);if(dc<bd){bd=dc;B=[x,z,-nx*sg,-nz*sg]}}break}}
   if(B){const wd=L("#6b4a2a"),y=th(B[0],B[1]),ry=Math.atan2(B[2],B[3]);const pier=new T.Mesh(new T.BoxGeometry(1.4,.12,4.6),wd);pier.position.set(B[0]+B[2]*2.8,y+.3,B[1]+B[3]*2.8);pier.rotation.y=ry;pier.castShadow=true;sc.add(pier);
    const rod=new T.Mesh(new T.CylinderGeometry(.02,.03,2.6,5),L("#3a2a1a"));rod.position.set(B[0]+B[2]*4.2+B[3]*.4,y+1.2,B[1]+B[3]*4.2-B[2]*.4);rod.rotation.set(B[3]*.9,0,-B[2]*.9);sc.add(rod);
    add(new T.Mesh(new T.CylinderGeometry(.28,.22,.4,9),L("#8a6a3a")),B[0]+B[3]*1.2,y+.2,B[1]-B[2]*1.2);
    npc("#3a5a6a",{hat:"#5a4a3a"},B[0]-B[3]*1.4,B[1]+B[2]*1.4,ry);
    I.push({x:B[0],z:B[1],r:3.1,kind:"job",text:"Rybár pri Dunaji: chytať ryby a výplata mzdy",act:()=>boss("ryby")})}}}
 function reap(key,c,o){if(!can())return;work(o.sec,o.label,()=>{const j=J();if(j[key].includes(c.i))return;j[key].push(c.i);c.set();spend(o.min,o.tired,1);j.wage[key]+=o.pay*bonus(o.sk);skill(o.sk,o.skn);
   if(j[key].length===12)toast("Na dnes je hotovo. Choď si po mzdu – "+BOSS[key][0].toLowerCase()+" stojí vedľa.","good");else if(j[key].length===1)toast("Prvý kus. Sprav všetkých dvanásť a "+BOSS[key][0].toLowerCase()+" ti vyplatí mzdu.","good")})}
 function boss(k){const r=R();if(!r)return;const j=J(),w=Math.round(j.wage[k]||0),nm=BOSS[k][0];
  if(w>=1){j.wage[k]-=w;earn(w);toast(nm+" ti vyplatil "+w+" zl.","good");return}
  if(k==="pole"||k==="vino"){toast(j[k].length>=12?"„Na dnes je hotovo. Príď zajtra.“":BOSS[k][1],"info");return}
  if(k==="ryby"){if(j.ryby>=3){toast("„Na dnes stačilo, ryby už neberú. Príď zajtra.“","info");return}if(!can())return;const key="rybolov";
   mini("zaber","Rybolov na Dunaji",{n:5,win:.75+lvl(key)*.08},(f,g)=>{if(f==null){if(g.n>0)spend(g.n*15,g.n*1.2,g.n*.4);return}j.ryby++;spend(90,8,3);skill(key,g.hit*.07);j.wage.ryby+=g.hit*.75*bonus(key);toast(g.hit?"Chytil si "+g.hit+" rýb. Rybár ti za ne zaplatí.":"Dnes nič nebralo.",g.hit?"good":"info");try{save()}catch(e){}});return}
  if(carry){toast("„To vrece patrí do skladu na trhu.“","info");return}if(j.nos>=8){toast("„Na dnes je voz prázdny. Príď zajtra.“","info");return}if(!can())return;
  work(1.6,"Nakladáš vrece na chrbát…",()=>{carry=true;if(sack)sack.visible=true;toast("Odnes vrece do skladu kupca na trhu (pozri denník, B).","info")})}
 function drop(){const r=R();if(!r)return;if(!carry){toast("Nemáš čo zložiť. Vrecia sú na voze u kupca pri bráne.","bad");return}
  work(1.2,"Skladáš vrece…",()=>{carry=false;if(sack)sack.visible=false;const j=J();j.nos++;spend(25,4,1.5);j.wage.nos+=.6*bonus("nosenie");skill("nosenie",.12);toast("Vrece je v sklade ("+j.nos+" z 8). Mzdu ti vyplatí kupec pri voze.","good");try{save()}catch(e){}})}
 /* ---- dielňa rodu: pomocná práca, tovariš, majstrovská skúška ---- */
 const KIND={kovac:"rytmus",zlatnik:"rytmus",bana:"rytmus",tesar:"rytmus",pasovanie:"rytmus",pekar:"cas",krcma:"cas",pivovar:"cas",vinar:"cas",lekaren:"cas",mlyn:"cas",sklaren:"cas",sklo:"cas",hrnciar:"cas",tkac:"vzor",garbiar:"vzor",pisaren:"vzor",tlaciaren:"vzor",kupec:"vzor",brloh:"vzor"};
 const opt=(kind,key,hard)=>kind==="rytmus"?{n:hard?15:10,gw:Math.min(.34,(hard?.15:.2)+lvl(key)*(hard?.012:.03)),fast:hard?1.25:1}:kind==="cas"?{n:hard?8:6,gw:Math.min(.3,(hard?.1:.15)+lvl(key)*(hard?.008:.02)),fast:hard?1.3:1}:{n:hard?7:5,len:hard?6:4,time:Math.max(2.4,(hard?4.5:5.5)+lvl(key)*.2)};
 function shopJob(b){const r=R();if(!r||MG||WK)return;const j=J();let nm="dielňa";try{nm=(BT[b.type]||{}).n||nm}catch(e){}const key=nm.toLowerCase(),kind=KIND[b.type]||"rytmus",rk=r.rank|0,mine=r.craft===key,lv=lvl(key);
  const ownS=b.owner===0,base=ownS?10:rk>=3&&mine?7:rk>=2&&mine?5:rk>=1?3:2,left=3-j.dil;
  const o=[{t:"Pracovať jednu smenu",s:"mzda "+base+"–"+Math.round((base+2)*bonus(key))+" zl · 2 hodiny · dnes ešte "+Math.max(0,left)+" smeny",off:left<=0,f:()=>{if(!can())return;
    mini(kind,nm+" – "+(ownS?"práca vo vlastnej dielni":rk>=2&&mine?"práca tovariša":"pomocná práca"),opt(kind,key,false),(f,g)=>{if(f==null){if(g.n>0)spend(g.n*12,g.n*1.8,g.n*.5);return}j.dil++;spend(120,18,6);skill(key,g.hit*(kind==="rytmus"?.045:.075));const pay=Math.round((base+2*f)*bonus(key));earn(pay);toast((ownS?"Výrobky si predal za ":"Majster ti vyplatil ")+pay+" zl ("+g.hit+" podarených z "+opt(kind,key,false).n+").","good")})}}];
  if(ownS){menu("Tvoja "+nm.toLowerCase(),"Vlastná dielňa. Čo vyrobíš sám, predáš bez majstra nad sebou.",o);return}
  if(rk===1)o.push({t:"Požiadať o prijatie za tovariša · 10 zl",s:lv>=2?"zviažeš sa s týmto remeslom":"treba zručnosť 2 v tomto remesle (máš "+lv+")",off:lv<2||P().money<10,g:1,f:()=>{const p=P();p.money-=10;try{led(p,"ine",-10)}catch(e){}r.rank=2;r.craft=key;r.craftT=b.type;try{save()}catch(e){}try{queue({title:"Tovariš",html:"<p>Majster ťa prijal za <b>tovariša</b> – remeslo: "+key+".</p><p>V dielňach tohto remesla dostávaš mzdu tovariša. Keď dosiahneš zručnosť 5, môžeš zložiť <b>majstrovskú skúšku</b>.</p>"})}catch(e){}}});
  if(rk===2&&!mine)o.push({t:"Si tovariš v inom remesle ("+r.craft+")",s:"tu dostaneš len mzdu nádenníka",off:true,g:1,f:()=>{}});
  if(rk===2&&mine)o.push({t:"Majstrovská skúška · 150 zl",s:lv<5?"treba zručnosť 5 (máš "+lv+")":j.exam?"dnes si už skúšku skúšal":"ťažší úkon; pri neúspechu prepadne 50 zl",off:lv<5||P().money<150||!!j.exam,g:1,f:()=>{if(!can())return;
    mini(kind,"Majstrovská skúška – "+nm,opt(kind,key,true),(f,g)=>{if(f==null)return;j.exam=1;spend(180,25,8);const p=P();if(f>=.75){p.money-=150;try{led(p,"ine",-150)}catch(e){}r.rank=3;try{save()}catch(e){}try{queue({title:"Majster",html:"<p>Cech uznal tvoje dielo. Si <b>majster</b> remesla "+key+".</p><p>V dielňach svojho remesla dostávaš mzdu majstra. Vlastnú dielňu si budeš môcť otvoriť, keď si zaobstaráš dom.</p>"})}catch(e){}}
     else{p.money-=50;try{led(p,"ine",-50)}catch(e){}try{save()}catch(e){}toast("Skúška sa nepodarila ("+g.hit+" z "+opt(kind,key,true).n+", treba tri štvrtiny). Prepadlo 50 zl, skús to zajtra.","bad")}})}});
  menu(nm+" rodu "+((S.dyn[b.owner]||{}).name||""),"„Hľadáš robotu? "+(kind==="rytmus"?"Tu sa bije do železa a dreva.":kind==="cas"?"Tu treba vystihnúť správnu chvíľu.":"Tu treba šikovné prsty a dobrú pamäť.")+"“",o)}
 /* čo treba na ďalšiu hodnosť (do denníka) */
 function nextStep(){const r=R();if(!r)return"";const rk=r.rank|0,best=Object.entries(r.sk||{}).filter(([k])=>!["poľné práce","nosenie","vinohradníctvo","rybolov"].includes(k)).sort((a,b)=>b[1]-a[1])[0];
  if(rk===0)return"Na nádenníka: zarob spolu 20 zl ("+Math.round(r.earned||0)+" z 20).";
  if(rk===1)return"Na tovariša: zručnosť 2 v niektorom remesle"+(best?" (najviac máš "+best[0]+" "+Math.floor(best[1])+")":"")+" a 10 zl u majstra.";
  if(rk===2)return"Na majstra: zručnosť 5 v remesle "+r.craft+" (máš "+lvl(r.craft)+") a 150 zl na skúšku.";
  if(rk===3)return"Na mešťana: vlastný dom a 300 zl u mestského pisára. Dielňu si otvoríš tiež uňho.";if(rk===4)return"Na radného: získaj vo voľbách mestský úrad (kniha mesta v radnici).";if(rk===5)return"Na šľachtica: titul zeman (kniha rodu doma v sieni, postup).";return""}
 /* po každom postavení mesta postav pracoviská znova */
 setInterval(()=>{const r=R(),M=M3();if(!r||!M){scn=null;return}let s=null;try{s=M.scene()}catch(e){}if(s&&s!==scn&&!document.getElementById("p3dload")){scn=s;try{build(M)}catch(e){console.warn("RPG pracoviská",e)}}
  const j=J();for(const k in PLOTS){const CL=PLOTS[k];if(CL.length&&j[k].length===0&&CL.some(c=>!c.up.visible))CL.forEach(c=>c.set())}},700);
 if(window.RPG){RPG.shopJob=shopJob;RPG.menu=menu;RPG.next=nextStep;RPG.owed=()=>{const r=R();if(!r||!r.job)return 0;return Math.round(Object.values(r.job.wage||{}).reduce((a,v)=>a+(v||0),0))};
  RPG.jobs={build:()=>{scn=null},cl:k=>PLOTS[k||"pole"]||[],mow:c=>c.it.act&&c.it.act(),boss,drop,mini,state:()=>({carry,wk:!!WK,mg:MG})}}
})();
