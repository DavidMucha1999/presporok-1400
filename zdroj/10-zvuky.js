/* ==== js/zvuky.js ==== */
/* Zvuky v15: zvukové prostredie každej scény cez celé okno (ulica, trh, brána, krajčír, sieň, pisáreň, pracovňa, panoráma), dielne, okolie mesta (ročné obdobia, noc, počasie), udalosti, zvuky konania. Ovláda ich rovnaké tlačidlo „Zvuky“ a posuvník hlasitosti efektov. */
(function(){
"use strict";
if(typeof SND==="undefined")return;
let ctx=null,out=null,rev=null,NB=null,wsTok=0,wsTimer=null,scTimer=null,bedRain=null,bedWind=null,scKey="",lastDrum=0,lastToll=0,lastBell=0,lastThunder=0;
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[(Math.random()*a.length)|0];
const mf=m=>440*Math.pow(2,(m-69)/12);
function on(){if(!SND.sfx||document.hidden)return false;if(!ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;try{ctx=new AC}catch(e){return false}
  const comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=3;out=ctx.createGain();out.connect(comp);comp.connect(ctx.destination);
  rev=ctx.createConvolver();const len=Math.floor(ctx.sampleRate*2.2),b=ctx.createBuffer(2,len,ctx.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);let lp=0;for(let i=0;i<len;i++){const u=i/len;lp+=(.15+.7*u)*((Math.random()*2-1)-lp);d[i]=lp*Math.exp(-4*u)*1.8}}rev.buffer=b;const w=ctx.createGain();w.gain.value=.35;rev.connect(w);w.connect(comp);
  const len2=ctx.sampleRate*2;NB=ctx.createBuffer(1,len2,ctx.sampleRate);const dd=NB.getChannelData(0);for(let i=0;i<len2;i++)dd[i]=Math.random()*2-1}
 try{if(ctx.state==="suspended")ctx.resume()}catch(e){}
 out.gain.value=.8*(window.VOLS??1);return true}
const T=()=>ctx.currentTime+.01;
function nz(t,dur,o){o=o||{};const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=NB;f.type=o.type||"bandpass";f.frequency.setValueAtTime(o.f||1200,t);if(o.f2)f.frequency.linearRampToValueAtTime(o.f2,t+dur);f.Q.value=o.q||1;s.connect(f);f.connect(g);g.connect(o.wet?rev:out);if(o.wet&&0)g.connect(out);
 const a=o.a||.004,pk=o.g||.1;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pk,t+a);g.gain.setValueAtTime(pk*(o.sus==null?.6:o.sus),t+Math.max(a,dur*.4));g.gain.exponentialRampToValueAtTime(.0008,t+dur);s.start(t,Math.random()*1.5);s.stop(t+dur+.05)}
function tn(t,f,dur,g,o){o=o||{};const os=ctx.createOscillator(),a=ctx.createGain();os.type=o.type||"sine";os.frequency.setValueAtTime(f,t);if(o.to)os.frequency.exponentialRampToValueAtTime(o.to,t+dur*(o.sl||.9));if(o.vib){const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=o.vib;lg.gain.value=f*.02;l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+dur+.1)}
 os.connect(a);a.connect(o.wet?rev:out);if(o.wet)a.connect(out);const at=o.a||.004;a.gain.setValueAtTime(0,t);a.gain.linearRampToValueAtTime(g,t+at);a.gain.exponentialRampToValueAtTime(.0008,t+dur);os.start(t);os.stop(t+dur+.05)}
function clang(t,f,g){[[1,1,.55],[2.76,.6,.35],[5.4,.35,.22],[8.9,.2,.13]].forEach(([h,v,d])=>tn(t,f*h*(1+(Math.random()-.5)*.01),d,g*v*.5,{wet:0}));nz(t,.03,{type:"highpass",f:3500,g:g*.3})}
function thunk(t,g,f){f=f||120;tn(t,f*1.6,.12,g,{to:f*.5});nz(t,.08,{type:"lowpass",f:700,g:g*.6})}
function tick(t,g,f){tn(t,f||2600,.05,g,{type:"triangle"})}
function coins(t,n,g){for(let i=0;i<n;i++){const d=i*rnd(.045,.09),f=rnd(2600,4200);[[1,1,.3],[2.42,.35,.18]].forEach(([h,v,dc])=>tn(t+d,f*h,dc,(g||.05)*v,{wet:1}))}}
function paper(t,g){nz(t,.11,{type:"bandpass",f:2600,f2:1800,q:.7,g:g||.05});nz(t+.09,.08,{type:"bandpass",f:3200,q:.8,g:(g||.05)*.7})}
function crack(t,g){for(let i=0;i<3;i++)nz(t+i*rnd(.03,.12),.02,{type:"highpass",f:rnd(2500,5000),g:g||.04,a:.001})}
/* ---------- zvuky konania ---------- */
const UI={
 hire(){const t=T();thunk(t,.07,200);thunk(t+.11,.06,240);paper(t+.2,.03)},
 fire(){const t=T();thunk(t,.08,90);nz(t+.05,.18,{type:"lowpass",f:500,f2:200,g:.05})},
 build(){const t=T();for(let i=0;i<4;i++){thunk(t+i*.18,.09,170+i*10);nz(t+i*.18,.04,{type:"highpass",f:2800,g:.05})}thunk(t+.8,.1,80)},
 upg(){const t=T();for(let i=0;i<3;i++){clang(t+i*.2,rnd(900,1100),.09)}[72,76,79,84].forEach((m,i)=>tn(t+.7+i*.1,mf(m),.5,.05,{wet:1,type:"triangle"}))},
 sellb(){coins(T(),6,.06)},
 estBuy(){const t=T();coins(t,5,.06);thunk(t+.4,.06,100)},
 okoDo(){const t=T();coins(t,3,.05);paper(t+.2,.04)},
 prod(){tick(T(),.05)},auto(){tick(T(),.05,1900)},mgr(){const t=T();thunk(t,.06,200);paper(t+.12,.03)},
 travel(){const t=T();for(let i=0;i<6;i++){thunk(t+i*.2,.035,rnd(130,170));tn(t+i*.2+.02,rnd(900,1200),.03,.012,{type:"triangle"})}},
 end(){const t=T();paper(t,.06);for(let i=0;i<7;i++)nz(t+.2+i*rnd(.03,.06),.04,{type:"highpass",f:3800,g:.025});thunk(t+.7,.05,150)}};
const seasonSfx=[()=>{const t=T();for(let k=0;k<3;k++)chirp(t+k*.5)},()=>{const t=T();for(let k=0;k<2;k++)chirp(t+k*.4)},()=>{const t=T();nz(t,2,{type:"bandpass",f:500,f2:900,q:.6,g:.07,a:.5,sus:.8,wet:1})},()=>{const t=T();nz(t,2.4,{type:"bandpass",f:700,f2:300,q:1.2,g:.08,a:.6,sus:.8,wet:1});tn(t+.6,mf(88),1.2,.03,{wet:1})}];
function chirp(t){const n=2+((Math.random()*4)|0),f0=rnd(2400,4300);for(let i=0;i<n;i++){const f=f0*rnd(.9,1.2);tn(t+i*rnd(.07,.11),f,.07,.022,{to:f*rnd(.8,1.3),wet:1})}}
function crow(t){tn(t,rnd(380,450),.28,.045,{type:"sawtooth",to:300,wet:1});nz(t,.28,{type:"bandpass",f:900,g:.03,wet:1})}
function owl(t){tn(t,400,.36,.04,{to:350,wet:1,vib:5});tn(t+.5,380,.5,.04,{to:330,wet:1,vib:5})}
function wolf(t){tn(t,420,3,.04,{to:640,sl:.35,wet:1,vib:5.5,a:.5});tn(t+1.8,640,1.4,.03,{to:380,wet:1,vib:5});}
function cricket(t){for(let i=0;i<4;i++)tn(t+i*.06,4300,.03,.012,{type:"square"})}
function thunder(t){nz(t,3.2,{type:"lowpass",f:260,f2:70,q:.7,g:.2,a:.3,sus:.5,wet:1});nz(t+.1,.5,{type:"lowpass",f:1200,g:.1})}
function drumMarch(t){for(let i=0;i<4;i++){tn(t+i*.5,150,.18,.07,{to:60});nz(t+i*.5,.05,{type:"lowpass",f:900,g:.04})}}
function horn(t){tn(t,mf(55),1.4,.04,{type:"sawtooth",wet:1,a:.2});tn(t+1.5,mf(60),1,.04,{type:"sawtooth",wet:1,a:.1})}
function fiddle(t){const sc=[69,71,73,76,78,81];for(let i=0;i<6;i++)tn(t+i*.22,mf(pick(sc)),.24,.025,{type:"sawtooth",wet:1,vib:5.5,a:.02})}
function bellFar(t){[0,.9].forEach(d=>[[1,1,2.6],[2.4,.4,1.5]].forEach(([h,v,dc])=>tn(t+d,mf(57)*h,dc,.025*v,{wet:1})))}
/* ---------- vrstvy (stále zvuky): dážď, vietor, dav, oheň, rieka, ticho izby ---------- */
const BEDS={rain:{t:"highpass",f:1400},wind:{t:"lowpass",f:350},crowd:{t:"bandpass",f:650,q:.45,lfo:.13,d:.5},fire:{t:"lowpass",f:260,q:.7,lfo:.7,d:.35},water:{t:"bandpass",f:480,q:.35,lfo:.09,d:.35},room:{t:"lowpass",f:140}};
const bedR={};
function bed(kind,want,lvl){const c=BEDS[kind];if(!c)return;let ref=bedR[kind];
 if(want&&!ref){const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),m=ctx.createGain(),g=ctx.createGain();s.buffer=NB;s.loop=true;f.type=c.t;f.frequency.value=c.f;if(c.q)f.Q.value=c.q;m.gain.value=1;g.gain.value=0;s.connect(f);f.connect(m);m.connect(g);g.connect(out);
  let l=null;if(c.lfo){/* pomalé vlnenie hlasitosti: dav, plamene, voda */l=ctx.createOscillator();const lg=ctx.createGain();l.frequency.value=c.lfo*rnd(.8,1.2);lg.gain.value=c.d;l.connect(lg);lg.connect(m.gain);l.start()}
  s.start(0,Math.random()*1.5);ref=bedR[kind]={s,g,l,lvl:-1}}
 if(!ref)return;const tg=want?lvl:0;if(ref.lvl===tg)return;ref.lvl=tg;const n=ctx.currentTime;ref.g.gain.cancelScheduledValues(n);ref.g.gain.setValueAtTime(ref.g.gain.value,n);ref.g.gain.linearRampToValueAtTime(tg,n+1.5);
 if(!want){delete bedR[kind];setTimeout(()=>{try{ref.s.stop();if(ref.l)ref.l.stop()}catch(e){}},1800)}}
function beds(want){for(const k in BEDS)bed(k,!!want[k],+want[k]||0)}
/* tichšie prehranie zvuku: funkcia sa na chvíľu pripojí na stlmenú zbernicu */
const buses={};
function quiet(l,fn){l=Math.round(l*20)/20;let b=buses[l];if(!b){const a=ctx.createGain(),r=ctx.createGain();a.gain.value=l;r.gain.value=l;a.connect(out);r.connect(rev);b=buses[l]={a,r}}const o=out,rv=rev;out=b.a;rev=b.r;try{return fn()}finally{out=o;rev=rv}}
function wxNow(){try{return weatherOf()}catch(e){return""}}
/* ---------- ďalšie zvuky scén ---------- */
function hoof(t,n){for(let i=0;i<n;i++){const d=i*.27+(i%2)*.08;thunk(t+d,.035,rnd(260,340));tn(t+d+.005,rnd(1700,2100),.03,.012,{type:"triangle"})}}
function creak(t,g){tn(t,rnd(180,260),rnd(.5,.9),g||.018,{type:"sawtooth",to:rnd(140,320),vib:9,a:.08,wet:1})}
function cluck(t){const n=2+((Math.random()*3)|0);for(let i=0;i<n;i++)tn(t+i*rnd(.1,.16),rnd(500,700),.07,.02,{type:"square",to:rnd(350,450)})}
function hawker(t){/* volanie predavača: samohláska cez tri formanty, hlas stúpne a klesne */const f0=rnd(140,220),dur=rnd(.5,.9),up=rnd(1.15,1.35),dn=rnd(.85,.95);
 [[rnd(650,750),.6],[rnd(1050,1250),.35],[2600,.12]].forEach(([fm,v])=>{const os=ctx.createOscillator(),bp=ctx.createBiquadFilter(),g=ctx.createGain();os.type="sawtooth";os.frequency.setValueAtTime(f0,t);os.frequency.linearRampToValueAtTime(f0*up,t+dur*.3);os.frequency.linearRampToValueAtTime(f0*dn,t+dur);bp.type="bandpass";bp.frequency.value=fm;bp.Q.value=6;os.connect(bp);bp.connect(g);g.connect(rev);g.connect(out);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05*v,t+.06);g.gain.setValueAtTime(.05*v,t+dur*.8);g.gain.linearRampToValueAtTime(0,t+dur);os.start(t);os.stop(t+dur+.05)})}
function snip(t){for(let i=0;i<2;i++){nz(t+i*.16,.03,{type:"highpass",f:rnd(4000,6000),g:.04,a:.001});tn(t+i*.16,rnd(5200,6400),.05,.01,{type:"triangle"})}}
function rustle(t,g){nz(t,rnd(.4,.8),{type:"bandpass",f:rnd(1800,3000),f2:rnd(1200,2000),q:.6,g:g||.03,a:.1,sus:.8})}
function pop(t){const n=1+((Math.random()*3)|0);for(let i=0;i<n;i++)nz(t+rnd(0,.6),.015,{type:"bandpass",f:rnd(1500,3500),q:1.5,g:rnd(.02,.05),a:.001})}
function steps(t,n){for(let i=0;i<n;i++)thunk(t+i*rnd(.42,.5),.03,rnd(80,110))}
function dog(t){tn(t,rnd(450,560),.12,.03,{type:"sawtooth",to:300,wet:1});tn(t+.25,rnd(450,560),.12,.025,{type:"sawtooth",to:300,wet:1})}
function cart(t){for(let i=0;i<6;i++){thunk(t+i*.2,.03,rnd(130,170));tn(t+i*.2+.02,rnd(900,1200),.03,.01,{type:"triangle"})}creak(t+.3,.012)}
/* príroda vonku podľa ročného obdobia, dennej doby a počasia; lv = hlasitosť */
function outdoor(t,lv,now){const se=(typeof S!=="undefined"&&S)?S.season:0,ph=(typeof todPh==="function")?todPh():1,w=wxNow(),day=ph!==3,rain=w==="rain"||w==="storm";
 quiet(lv,()=>{if(w==="storm"&&now-lastThunder>9&&Math.random()<.3){lastThunder=now;thunder(t+rnd(.1,1.2))}
  if(!rain){if(day){if(se<2&&Math.random()<.45)chirp(t);else if(se>=2&&Math.random()<.06)crow(t)}else{if(se<3&&Math.random()<.5)cricket(t);if(Math.random()<.04)owl(t)}
   if(day&&now-lastBell>40&&Math.random()<.04){lastBell=now;bellFar(t)}}});
 return{se,day,rain,storm:w==="storm",cold:se>=2}}
const P_=p=>Math.random()<p;
let wsNext=0;
/* ---------- scény cez celé okno ---------- */
const SC={
 ulica(t,now){const o=outdoor(t,.6,now);beds({rain:o.rain&&(o.storm?.08:.05),wind:(o.cold||o.storm)&&.02,crowd:o.day&&!o.rain&&.012});
  if(now<wsNext)return;const st=window.DIELNESCENA?DIELNESCENA.street:[];if(!st.length){wsNext=now+3;return}const sel=DIELNESCENA.sel;
  /* vybraná dielňa znie najčastejšie a najhlasnejšie, ostatné z diaľky */
  const b=(P_(.65)&&st.find(x=>x.id===sel))||pick(st);const f=WS[WSA[b.type]||b.type];if(!f){wsNext=now+2;return}
  let d=1800;quiet((b.id===sel?.55:.22)*(o.day?1:.5),()=>{d=f()});wsNext=now+d/1000+rnd(.2,1.2)},
 trhovisko(t,now){const o=outdoor(t,.5,now);const busy=o.day&&!o.rain;beds({crowd:busy?.045:o.day&&.015,rain:o.rain&&(o.storm?.08:.05),wind:(o.cold||o.storm)&&.02});
  if(!busy)return;if(P_(.35))quiet(.5,()=>coins(t+rnd(0,.8),(rnd(2,6))|0,.05));if(P_(.2))hawker(t+rnd(0,1));if(P_(.08))quiet(.7,()=>cluck(t+rnd(0,1)));if(P_(.06))quiet(.6,()=>cart(t));if(P_(.03))quiet(.5,()=>dog(t+.5))},
 brana(t,now){const o=outdoor(t,.7,now);beds({water:.03,wind:o.cold||o.storm?.03:.012,crowd:o.day&&!o.rain&&.012,rain:o.rain&&(o.storm?.08:.05)});
  if(o.day&&P_(.25))quiet(.7,()=>hoof(t+rnd(0,.5),(rnd(4,9))|0));if(P_(.15))creak(t+rnd(0,1));if(o.day&&P_(.06))quiet(.6,()=>cart(t));if(P_(.03))quiet(.5,()=>clang(t,rnd(180,240),.06));if(o.day&&P_(.01))horn(t)},
 krajcir(t,now){const o=outdoor(t,.15,now);beds({room:.02,rain:o.rain&&.02,crowd:o.day&&.006});
  if(P_(.35))snip(t+rnd(0,.8));if(P_(.3))rustle(t+rnd(0,.8));if(P_(.05))steps(t,3);if(P_(.05))quiet(.4,()=>coins(t,3,.04))},
 sien(t,now){const o=outdoor(t,.1,now);beds({fire:.035,room:.015,rain:o.rain&&.015,wind:o.cold&&.015});
  if(P_(.6))pop(t);if(P_(.06))steps(t,(rnd(2,5))|0);if(P_(.02))quiet(.4,()=>dog(t+1));if(o.day&&now-lastBell>40&&P_(.03)){lastBell=now;quiet(.5,()=>bellFar(t))}},
 pisaren(t,now){const o=outdoor(t,.1,now);beds({fire:.02,room:.015,rain:o.rain&&.015});if(P_(.4))pop(t);
  if(now>=wsNext){let d=1800;quiet(.5,()=>{d=WS.pisaren()});wsNext=now+d/1000+rnd(.5,2)}if(P_(.08))paper(t+rnd(0,1),.035)},
 pracovna(t,now){const o=outdoor(t,.1,now);beds({fire:.03,room:.015,rain:o.rain&&.015});if(P_(.5))pop(t);if(P_(.1))paper(t+rnd(0,1),.035);if(P_(.04))quiet(.4,()=>coins(t,3,.04))},
 mapa(t){beds({room:.01});if(P_(.06))quiet(.5,()=>paper(t,.04))},
 panorama(t,now){const o=outdoor(t,.8,now);beds({wind:o.cold||o.storm?.035:.02,crowd:o.day&&!o.rain&&.01,water:.015,rain:o.rain&&(o.storm?.08:.05)});
  if(o.day&&now-lastBell>20&&P_(.08)){lastBell=now;bellFar(t)}if(o.day&&P_(.04))quiet(.4,()=>dog(t+1))}};
/* mapa mesta (pôvodné zvuky okolia) */
function cityTick(t,now){const se=S.season,ph=(typeof todPh==="function")?todPh():1,w=wxNow();let life={};try{life=lifeState()}catch(e){}
 const day=ph!==3,rain=w==="rain"||w==="storm";
 beds({rain:rain&&(w==="storm"?.1:.06),wind:(se===3||se===2||w==="storm")&&(se===3?.045:.025)});
 if(w==="storm"&&now-lastThunder>9&&Math.random()<.3){lastThunder=now;thunder(t+rnd(.1,1.2))}
 if(!rain){
  if(day){if(se<2&&Math.random()<.55)chirp(t);else if(se===2&&Math.random()<.08)crow(t);else if(se===3&&Math.random()<.04)crow(t)}
  else{if(se<3&&Math.random()<.6)cricket(t);if(Math.random()<.05)owl(t);if(se===3&&Math.random()<.025)wolf(t)}
  if(day&&now-lastBell>40&&Math.random()<.04){lastBell=now;bellFar(t)}}
 if(life.fair&&Math.random()<.35)fiddle(t);
 if(life.guards&&now-lastDrum>8){lastDrum=now;drumMarch(t);if(Math.random()<.3)horn(t+2.1)}
 if(life.plague&&now-lastToll>13){lastToll=now;try{SND.play("toll")}catch(e){}if(Math.random()<.5)crow(t+1.5)}}
let lastSc="";
function sceneTick(){if(!on()){if(ctx&&Object.keys(bedR).length)beds({});return}
 let sc=null;try{sc=window.DIELNESCENA?DIELNESCENA.scene:null}catch(e){}
 const view=(typeof S!=="undefined"&&S)?S.view:"";const key=sc||(view==="mesto"?"mesto":"");
 if(key!==lastSc){lastSc=key;wsNext=0}
 const t=T(),now=ctx.currentTime;
 if(sc&&SC[sc]){SC[sc](t,now);return}
 if(key==="mesto"&&S){cityTick(t,now);return}
 beds({})}
function sceneStart(){if(scTimer)return;scTimer=setInterval(()=>{try{sceneTick()}catch(e){console.warn("zvuky",e)}},1700)}
/* ---------- dielne ---------- */
const WS={
 kovac(){const t=T(),n=2+((Math.random()*3)|0);for(let i=0;i<n;i++)clang(t+i*.42,rnd(650,1000),.11);crack(t,.03);if(Math.random()<.35)nz(t+1,1.1,{type:"bandpass",f:400,f2:900,q:.8,g:.05,a:.3,wet:1});if(Math.random()<.2)nz(t+1.8,.9,{type:"highpass",f:2500,g:.05,a:.05});return rnd(1500,3200)},
 tkac(){const t=T();for(let i=0;i<4;i++){thunk(t+i*.7,.05,rnd(190,230));nz(t+i*.7+.12,.05,{type:"bandpass",f:1600,g:.04});thunk(t+i*.7+.3,.04,rnd(160,200))}return 2900},
 pekar(){const t=T();crack(t,.04);if(Math.random()<.4)thunk(t+.3,.07,80);if(Math.random()<.3)nz(t+.7,.7,{type:"bandpass",f:350,f2:200,g:.05,a:.2});return rnd(500,1100)},
 krcma(){const t=T();nz(t,2.2,{type:"bandpass",f:rnd(450,800),q:.6,g:.05,a:.6,sus:.9});if(Math.random()<.6){tn(t+.4,2400,.25,.03,{wet:1});tn(t+.43,3100,.2,.02,{wet:1})}if(Math.random()<.4)thunk(t+1.1,.06,130);if(Math.random()<.25){for(let i=0;i<4;i++)tn(t+1+i*.12,rnd(190,260),.16,.02,{type:"triangle",wet:1})}return 1700},
 lekaren(){const t=T();for(let i=0;i<5;i++)tn(t+i*rnd(.15,.4),rnd(300,500),.09,.025,{to:rnd(600,900),wet:1});if(Math.random()<.4)tn(t+.5,rnd(2800,3400),.3,.025,{wet:1});if(Math.random()<.4)nz(t+.8,1,{type:"bandpass",f:900,f2:600,q:1,g:.04,a:.2});return 2000},
 hrnciar(){const t=T();tn(t,rnd(70,90),2.4,.02,{type:"triangle",a:.5});nz(t,2.4,{type:"lowpass",f:420,g:.035,a:.5,sus:.9});if(Math.random()<.5)thunk(t+1,.05,90);if(Math.random()<.4)nz(t+1.5,.3,{type:"bandpass",f:900,g:.04});return 2300},
 tesar(){const t=T();if(Math.random()<.6){for(let i=0;i<5;i++)nz(t+i*.34,.3,{type:"bandpass",f:i%2?1900:1500,q:1.3,g:.045,a:.05,sus:.9})}else{for(let i=0;i<3;i++){thunk(t+i*.3,.08,rnd(230,300));nz(t+i*.3,.03,{type:"highpass",f:3000,g:.04})}}return rnd(2100,3500)},
 garbiar(){const t=T();for(let i=0;i<3;i++)nz(t+i*.3,.26,{type:"bandpass",f:900,f2:600,q:.9,g:.05,a:.05});if(Math.random()<.5)nz(t+1.1,.5,{type:"lowpass",f:1400,g:.06,a:.02});return rnd(1800,3000)},
 zlatnik(){const t=T();for(let i=0;i<4;i++){const f=rnd(2600,3600);tn(t+i*rnd(.18,.3),f,.12,.028,{wet:1})}nz(t,2,{type:"lowpass",f:200,g:.02,a:.5,sus:.9});return rnd(1500,2800)},
 vinar(){const t=T();if(Math.random()<.55){for(let i=0;i<7;i++)tn(t+i*.13,rnd(170,230),.11,.03,{to:rnd(250,320),wet:1})}else{thunk(t,.07,rnd(120,160));nz(t+.2,.4,{type:"lowpass",f:900,g:.04})}return rnd(1800,3200)},
 pisaren(){const t=T();let d=0;for(let i=0;i<6;i++){const l=rnd(.08,.2);nz(t+d,l,{type:"highpass",f:rnd(3500,5000),g:.025,a:.01});d+=l+rnd(.05,.2)}if(Math.random()<.3)paper(t+d,.04);return rnd(1500,2600)},
 kupec(){const t=T();coins(t,rnd(3,7)|0,.045);if(Math.random()<.5)thunk(t+.8,.07,rnd(110,150));if(Math.random()<.3)nz(t+1.3,.4,{type:"bandpass",f:1800,g:.04});return rnd(1500,2800)},
 brloh(){const t=T();crack(t,.05);if(Math.random()<.5)tn(t+.3,rnd(1500,2000),.18,.03,{to:900,wet:1});nz(t,2,{type:"lowpass",f:160,g:.03,a:.6,sus:.9,wet:1});return rnd(700,1500)},
 pasovanie(){const t=T();if(Math.random()<.6)tn(t,rnd(1500,2100),.2,.03,{to:800,wet:1});if(Math.random()<.35)thunk(t+.5,.05,rnd(90,130));if(Math.random()<.25)nz(t+.9,.6,{type:"bandpass",f:700,f2:400,g:.04,wet:1});return rnd(1400,2600)}};
const WSA={pivovar:"vinar",mlyn:"pekar",sklaren:"hrnciar",tlaciaren:"pisaren",bana:"brloh"};
function wsStart(type){wsStop();const fn=WS[WSA[type]||type];if(!fn)return;const tok=++wsTok;const step=()=>{if(tok!==wsTok)return;let d=1800;try{if(on())d=fn()}catch(e){console.warn("zvuky ws",e)}wsTimer=setTimeout(step,d)};step()}
function wsStop(){wsTok++;clearTimeout(wsTimer);wsTimer=null}
/* ---------- zapojenie ---------- */
function hook(name){const o=A[name];if(typeof o!=="function"||!UI[name])return;A[name]=function(e){const r=o.apply(this,arguments);try{if(on())UI[name]()}catch(x){}return r}}
Object.keys(UI).forEach(hook);
if(typeof A.binside==="function"){const o=A.binside;A.binside=function(e){const r=o.apply(this,arguments);try{const b=S.bld.find(x=>x.id==(e&&e.b));if(b&&on()){paper(T(),.04);wsStart(b.type)}}catch(x){}return r};}
{const o=window.closeModal;if(typeof o==="function")window.closeModal=function(){const r=o.apply(this,arguments);try{wsStop()}catch(x){}return r}}
{const o=window.queue;if(typeof o==="function")window.queue=function(m){const r=o.apply(this,arguments);try{if(on()&&m&&!/Kúpiť|binside/.test(m.title||""))paper(T(),.035)}catch(x){}return r}}
{const o=window.endTurn;if(typeof o==="function")window.endTurn=function(){const s0=S&&S.season;const r=o.apply(this,arguments);try{if(on()&&S.season!==s0)seasonSfx[S.season]()}catch(x){}return r}}
document.addEventListener("pointerdown",()=>{try{if(SND.sfx&&on())sceneStart()}catch(e){}},true);
document.addEventListener("visibilitychange",()=>{if(document.hidden){wsStop();if(ctx)beds({})}});
sceneStart();
window.ZV={ws:wsStart,wsStop,scene:sceneTick,ui:UI,peak(){return ctx?1:0},get ctx(){return ctx}};
})();

;
