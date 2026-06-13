/**
 * 霓虹极速 v5 — 精致座舱 + 灵敏加速 + 碰撞边界
 */
'use strict';
if(!CanvasRenderingContext2D.prototype.roundRect){CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){if(typeof r==='number')r={tl:r,tr:r,br:r,bl:r};this.beginPath();this.moveTo(x+r.tl,y);this.lineTo(x+w-r.tr,y);this.quadraticCurveTo(x+w,y,x+w,y+r.tr);this.lineTo(x+w,y+h-r.br);this.quadraticCurveTo(x+w,y+h,x+w-r.br,y+h);this.lineTo(x+r.bl,y+h);this.quadraticCurveTo(x,y+h,x,y+h-r.bl);this.lineTo(x,y+r.tl);this.quadraticCurveTo(x,y,x+r.tl,y);this.closePath();};}

const SE=(()=>{let c=null;function g(){if(!c)c=new(window.AudioContext||window.webkitAudioContext)();if(c.state==='suspended')c.resume();return c;}
function t(f,ty,d,v=0.08,r=true){const a=g(),o=a.createOscillator(),gn=a.createGain();o.type=ty;o.frequency.value=f;gn.gain.setValueAtTime(v,a.currentTime);if(r)gn.gain.exponentialRampToValueAtTime(0.001,a.currentTime+d);o.connect(gn).connect(a.destination);o.start();o.stop(a.currentTime+d);}
function n(d,v=0.04){const a=g(),b=a.createBuffer(1,a.sampleRate*d,a.sampleRate);const dt=b.getChannelData(0);for(let i=0;i<dt.length;i++)dt[i]=Math.random()*2-1;const s=a.createBufferSource(),gn=a.createGain();s.buffer=b;gn.gain.setValueAtTime(v,a.currentTime);gn.gain.exponentialRampToValueAtTime(0.001,a.currentTime+d);s.connect(gn).connect(a.destination);s.start();s.stop(a.currentTime+d);}
return{acc:()=>{t(80,'sawtooth',0.15,0.05);t(120,'square',0.1,0.04);},brk:()=>n(0.12,0.05),crash:()=>{t(50,'sawtooth',0.4,0.2);t(30,'triangle',0.5,0.25);n(0.3,0.1);},skid:()=>{n(0.15,0.06);t(200,'sawtooth',0.1,0.03);},eng:(f)=>{t(f,'sawtooth',0.08,0.03,false);},init:()=>g(),getCtx:()=>g(),};})();

const BGM=(()=>{const P=140,BD=60/P,LP=16,LD=BD*LP;let mg=null,r=false,ti=null,ns=0,an=[];const N={C2:65,D2:73,E2:82,F2:87,G2:98,A2:110,B2:123,C3:131,D3:147,E3:165,F3:175,G3:196,A3:220,B3:247,C4:262,D4:294,E4:330,F4:349,G4:392,A4:440,B4:494,C5:523,D5:587,E5:659,F5:698,G5:784,A5:880,B5:988};
function pn(f,ty,st,dur,v=0.04){if(!f||f<=0)return;try{const a=SE.getCtx();if(!mg||!a)return;const o=a.createOscillator(),g=a.createGain();o.type=ty;o.frequency.value=f;g.gain.setValueAtTime(0,st);g.gain.linearRampToValueAtTime(v,st+0.01);g.gain.setValueAtTime(v,st+dur*0.7);g.gain.exponentialRampToValueAtTime(0.001,st+dur);o.connect(g).connect(mg);o.start(st);o.stop(st+dur+0.05);an.push(o,g);}catch(_){}}
function sl(st){const T=b=>st+b*BD;[N.C2,N.C2,N.G2,N.G2,N.A2,N.A2,N.F2,N.F2,N.C2,N.C2,N.G2,N.G2,N.A2,N.A2,N.A2,N.A2].forEach((n,i)=>pn(n,'sawtooth',T(i),0.85,0.05));[N.C4,N.E4,N.G4,N.C5,N.D4,N.F4,N.A4,N.D5,N.C4,N.E4,N.G4,N.C5,N.G3,N.C4,N.E4,N.G4].forEach((n,i)=>pn(n,'square',T(i),0.2,0.028));[{b:0,n:N.C5,d:0.3},{b:1,n:N.G4,d:0.3},{b:2,n:N.A4,d:0.3},{b:3,n:N.F4,d:0.5},{b:4,n:N.G4,d:0.3},{b:5,n:N.E4,d:0.3},{b:6,n:N.C4,d:0.5},{b:8,n:N.C5,d:0.3},{b:9,n:N.G5,d:0.3},{b:10,n:N.A5,d:0.3},{b:11,n:N.F5,d:0.5},{b:12,n:N.G5,d:0.3},{b:13,n:N.E5,d:0.3},{b:14,n:N.C5,d:0.5}].forEach(l=>pn(l.n,'square',T(l.b),l.d,0.035));for(let i=0;i<16;i+=2)pn(200,'triangle',T(i+1),0.08,0.06);for(let i=0;i<16;i+=4)pn(60,'sine',T(i),0.3,0.08);}
function scl(){if(!r)return;const n=SE.getCtx().currentTime;while(ns<n+0.3){sl(ns);ns+=LD;}ti=setTimeout(scl,LD*500);}
return{start(){if(r)return;SE.init();if(!mg){mg=SE.getCtx().createGain();mg.gain.value=0.5;mg.connect(SE.getCtx().destination);}else{mg.gain.cancelScheduledValues(SE.getCtx().currentTime);mg.gain.setValueAtTime(mg.gain.value,SE.getCtx().currentTime);mg.gain.linearRampToValueAtTime(0.5,SE.getCtx().currentTime+0.15);}r=true;an=[];ns=SE.getCtx().currentTime+0.05;scl();},stop(){r=false;if(ti){clearTimeout(ti);ti=null;}if(mg)mg.gain.linearRampToValueAtTime(0,SE.getCtx().currentTime+0.3);},};})();

class Game {
  constructor(canvas) {
    this.cv=canvas;this.ctx=canvas.getContext('2d');this.W=canvas.width;this.H=canvas.height;
    this.HORIZON_Y=Math.floor(this.H*0.36);this.FOCUS=220;this.ROAD_W=0.55;
    this.strips=[];this._bs();
    this.score=0;this.highScore=parseInt(localStorage.getItem('racerHighScore')||'0',10);
    this.gameOver=false;this.started=false;this.frame=0;
    this.speed=0;this.maxSpeed=120;this.accel=4.5;this.brakeForce=8;this.friction=0.3;this.displaySpeed=0;
    this.player={x:0,steer:0,yaw:0,skid:false,skidT:0};
    this.steerSpeed=0.06;this.steerReturn=0.08;this.yawReturn=0.12;this.skidThresh=80;
    this.invincible=0;this.lives=3;
    this.curve=0;this.targetCurve=0;this.curveTimer=0;
    this.obstacles=[];this.spawnTimer=0;this.spawnInterval=120;this.FAR_D=2000;this.NEAR_D=12;
    this.stars=[];this._is();this.buildings=[];this._ib();
    this.lampposts=[];this.billboards=[];this.particles=[];this.smoke=[];
    this.keys={};this._bind();
    this.collisionFlash=0; // 碰撞边界闪烁
  }

  _bs(){const n=300;for(let i=0;i<=n;i++){const sy=this.HORIZON_Y+i*(this.H-this.HORIZON_Y)/n;const d=sy>this.HORIZON_Y?(this.H-this.HORIZON_Y)*this.FOCUS/(sy-this.HORIZON_Y)-this.FOCUS:999999;const sc=this.FOCUS/(d+this.FOCUS);this.strips.push({sy,d,sc});}this.FAR_D=this.strips[Math.floor(n*0.03)].d;}
  _proj(d){if(d<=0)return{sy:this.H,sc:1.2};const sc=this.FOCUS/(d+this.FOCUS);return{sy:this.HORIZON_Y+(this.H-this.HORIZON_Y)*sc,sc:Math.min(sc,1.25)};}
  _roadX(d){const sc=d>0?this.FOCUS/(d+this.FOCUS):1;const ps=-this.player.x*0.25*this.W*sc;const cs=this.curve*d*d*0.00035;return ps+cs;}
  _is(){for(let l=0;l<3;l++)for(let i=0;i<40;i++)this.stars.push({x:Math.random()*this.W,y:Math.random()*this.HORIZON_Y,r:Math.random()*(l===0?1.2:l===1?1.8:2.5),tw:Math.random()*Math.PI*2,sp:0.2+l*0.3,ly:l,op:0.4+l*0.3});}
  _ib(){for(let i=0;i<30;i++)this.buildings.push({x:Math.random()*this.W*1.3-this.W*0.15,w:Math.random()*40+15,h:Math.random()*80+40,ly:0,ws:Array.from({length:Math.floor(Math.random()*6)},()=>({x:Math.random()*0.7+0.1,y:Math.random()*0.7+0.1,on:Math.random()>0.4})),neon:Math.random()>0.7?['#ff00ff','#00ffff','#ff4488','#ffaa00'][Math.floor(Math.random()*4)]:null});for(let i=0;i<20;i++)this.buildings.push({x:Math.random()*this.W*1.2-this.W*0.1,w:Math.random()*70+30,h:Math.random()*120+60,ly:1,ws:Array.from({length:Math.floor(Math.random()*10)},()=>({x:Math.random()*0.7+0.1,y:Math.random()*0.7+0.1,on:Math.random()>0.35})),neon:Math.random()>0.5?['#ff00ff','#00ffff','#ff4488','#ffaa00'][Math.floor(Math.random()*4)]:null});}
  _bind(){window.addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();this.keys[e.key]=true;if(!this.started&&!this.gameOver){this.start();return;}});window.addEventListener('keyup',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();this.keys[e.key]=false;});this.cv.addEventListener('touchstart',e=>{e.preventDefault();SE.init();if(!this.started&&!this.gameOver){this.start();return;}if(this.gameOver)return;const x=(e.touches[0].clientX-this.cv.getBoundingClientRect().left)/this.cv.getBoundingClientRect().width;if(x<0.4)this.keys.ArrowLeft=true;else if(x>0.6)this.keys.ArrowRight=true;else this.keys.ArrowUp=true;},{passive:false});this.cv.addEventListener('touchend',e=>{e.preventDefault();this.keys={};},{passive:false});this.cv.addEventListener('touchmove',e=>{e.preventDefault();this.keys={};const x=(e.touches[0].clientX-this.cv.getBoundingClientRect().left)/this.cv.getBoundingClientRect().width;if(x<0.4)this.keys.ArrowLeft=true;else if(x>0.6)this.keys.ArrowRight=true;else this.keys.ArrowUp=true;},{passive:false});}

  start(){this.started=true;this.gameOver=false;this.score=0;this.speed=80;this.frame=0;this.lives=3;this.invincible=0;const p=this.player;p.x=0;p.steer=0;p.yaw=0;p.skid=false;p.skidT=0;this.curve=0;this.targetCurve=0;this.curveTimer=0;this.obstacles=[];this.spawnTimer=0;this.particles=[];this.smoke=[];this.billboards=[];this.lampposts=[];this.displaySpeed=80;this.collisionFlash=0;document.getElementById('overlayStart').classList.add('hidden');document.getElementById('overlayEnd').classList.add('hidden');BGM.start();this._loop();}
  end(){this.gameOver=true;BGM.stop();SE.crash();if(this.score>this.highScore){this.highScore=this.score;localStorage.setItem('racerHighScore',String(this.highScore));}document.getElementById('finalSpeed').textContent=String(Math.round(this.displaySpeed));document.getElementById('finalScore').textContent=String(this.score);document.getElementById('finalHigh').textContent=String(this.highScore);document.getElementById('newRecord').classList.toggle('hidden',this.score<=this.highScore||this.score===0);document.getElementById('overlayEnd').classList.remove('hidden');}
  _loop(){if(this.gameOver)return;this.frame++;this._update();this._draw();requestAnimationFrame(()=>this._loop());}
  _update(){this._uInp();this._uSpd();this._uSteer();this._uPhys();this._uCurve();this._uObst();this._uPart();this._uDecor();}
  _uInp(){const k=this.keys;let ts=0;if(k.ArrowLeft)ts=-1;if(k.ArrowRight)ts=1;if(k.ArrowLeft&&k.ArrowRight)ts=0;this.player.targetSteer=ts;}
  _uSpd(){const k=this.keys;
    if(k.ArrowUp){this.speed+=this.accel;if(this.frame%3===0)SE.eng(60+this.speed*0.5);}
    if(k.ArrowDown){this.speed-=this.brakeForce;if(this.speed>60&&this.frame%6===0)SE.brk();}
    this.speed-=this.friction;this.speed=Math.max(0,Math.min(this.maxSpeed,this.speed));
    this.displaySpeed+=(this.speed-this.displaySpeed)*0.2;
    this.maxSpeed=120+Math.floor(this.score/100)*8;this.spawnInterval=Math.max(35,120-Math.floor(this.score/80));}
  _uSteer(){const p=this.player;if(p.targetSteer!==0)p.steer+=p.targetSteer*this.steerSpeed;else{if(Math.abs(p.steer)<this.steerReturn)p.steer=0;else p.steer-=Math.sign(p.steer)*this.steerReturn;}p.steer=Math.max(-1,Math.min(1,p.steer));}
  _uPhys(){const p=this.player,s=this.speed;const sf=Math.abs(p.steer)*s;p.skid=sf>this.skidThresh;if(p.skid){p.skidT=20;if(this.frame%5===0)SE.skid();}if(p.skidT>0)p.skidT--;let gr=1;if(p.skid)gr=0.25;const lm=Math.sin(p.yaw)*s*0.0007+p.steer*s*0.01*gr*0.05;p.x+=lm;p.x=Math.max(-0.9,Math.min(0.9,p.x));if(p.steer!==0)p.yaw+=p.steer*0.025*(s/120)*gr;else{if(Math.abs(p.yaw)<this.yawReturn)p.yaw=0;else p.yaw-=Math.sign(p.yaw)*this.yawReturn;}p.yaw=Math.max(-0.45,Math.min(0.45,p.yaw));if(this.invincible>0)this.invincible--;}
  _uCurve(){this.curveTimer--;if(this.curveTimer<=0){this.curveTimer=100+Math.random()*200;const mc=Math.min(0.02,0.002+this.score*0.00003);this.targetCurve=(Math.random()-0.5)*2*mc;}this.curve+=(this.targetCurve-this.curve)*0.008;}
  _uObst(){this.spawnTimer++;if(this.spawnTimer>=this.spawnInterval){this.spawnTimer=0;this._spawn();}const ws=this.speed*0.08;for(let i=this.obstacles.length-1;i>=0;i--){const o=this.obstacles[i];o.d-=ws;if(!o.scored&&o.d<0){o.scored=true;this.score+=10;}if(o.d<-30)this.obstacles.splice(i,1);}if(this.invincible>0)return;for(const o of this.obstacles){if(this._col(o)){this._hit();break;}}}
  _spawn(){const types=this.score<200?['car']:this.score<400?['car','truck']:['car','truck','racer'];const type=types[Math.floor(Math.random()*types.length)];const d=this.FAR_D+Math.random()*400;let lat=(Math.random()-0.5)*1.3;for(const o of this.obstacles){if(Math.abs(o.d-d)<250&&Math.abs(o.lat-lat)<0.2)lat=(Math.random()-0.5)*1.3;}this.obstacles.push({type,lat,d,scored:false,sp:type==='truck'?0.3:type==='racer'?2+Math.random()*2:Math.random()*1.5});}
  _col(o){if(o.d<this.NEAR_D||o.d>70)return false;const pj=this._proj(o.d);const rx=this._roadX(o.d);const rw=this.ROAD_W*pj.sc*this.W;const ox=this.W/2+rx+o.lat*rw*0.78;const ow=(o.type==='truck'?38:o.type==='racer'?20:27)*pj.sc*1.1;const oh=(o.type==='truck'?58:o.type==='racer'?30:42)*pj.sc*1.1;const pw=34,ph=55;const px=this.W/2-pw/2;const py=this.H-ph+18;return px+2<ox+ow/2-2&&px+pw-2>ox-ow/2+2&&py+2<pj.sy+oh/2-2&&py+ph-2>pj.sy-oh/2+2;}
  _hit(){if(this.invincible>0)return;this.lives--;this.invincible=90;this.collisionFlash=15;for(let i=0;i<30;i++)this.particles.push({x:this.W/2,y:this.H-100,vx:(Math.random()-0.5)*8,vy:(Math.random()-0.5)*8-4,life:30+Math.random()*20,color:['#ff00ff','#ff4488','#ffaa00','#fff'][Math.floor(Math.random()*4)]});if(this.lives<=0)this.end();else SE.crash();}
  _uPart(){const p=this.player;if(this.speed>150&&this.frame%2===0){this.particles.push({x:this.W/2+(Math.random()-0.5)*200,y:this.H-80,vx:(Math.random()-0.5)*2,vy:-Math.random()*6-this.speed*0.02,life:15+Math.random()*10,color:p.skid?'#ff4488':['#ff00ff','#00ffff'][Math.floor(Math.random()*2)]});}if(this.frame%3===0){this.smoke.push({x:this.W/2+(Math.random()-0.5)*40,y:this.H-20,vx:(Math.random()-0.5)*0.5,vy:-Math.random()-0.5,life:10+Math.random()*10,r:2+Math.random()*3});}if(p.skid&&this.frame%2===0){for(let i=0;i<2;i++)this.smoke.push({x:this.W/2+(Math.random()-0.5)*100,y:this.H-30,vx:(Math.random()-0.5)*3,vy:-Math.random()*2-1,life:15+Math.random()*15,r:4+Math.random()*5});}for(const arr of[this.particles,this.smoke]){for(let i=arr.length-1;i>=0;i--){const pp=arr[i];pp.x+=pp.vx;pp.y+=pp.vy;pp.life--;if(pp.life<=0)arr.splice(i,1);}}}
  _uDecor(){const ws=this.speed*0.08;if(this.frame%Math.max(10,40-Math.floor(this.speed/10))===0)this.lampposts.push({d:this.FAR_D+Math.random()*200,side:Math.random()>0.5?1:-1});for(let i=this.lampposts.length-1;i>=0;i--){this.lampposts[i].d-=ws;if(this.lampposts[i].d<-50)this.lampposts.splice(i,1);}if(this.frame%180===0&&this.score>150)this.billboards.push({d:this.FAR_D+Math.random()*300,side:Math.random()>0.5?1:-1});for(let i=this.billboards.length-1;i>=0;i--){this.billboards[i].d-=ws;if(this.billboards[i].d<-50)this.billboards.splice(i,1);}}

  // ========== 绘制 ==========
  _draw(){const ctx=this.ctx,W=this.W,H=this.H;ctx.clearRect(0,0,W,H);this._dSky(ctx);this._dCity(ctx);this._dRoad(ctx);this._dDecor(ctx);this._dObst(ctx);this._dParts(ctx);this._dCockpit(ctx);this._dHUD(ctx);}
  _dSky(ctx){const g=ctx.createLinearGradient(0,0,0,this.HORIZON_Y+20);g.addColorStop(0,'#0a0a2e');g.addColorStop(0.5,'#1a0a3e');g.addColorStop(1,'#2a1040');ctx.fillStyle=g;ctx.fillRect(0,0,this.W,this.HORIZON_Y+20);ctx.fillStyle='#ffddaa';ctx.shadowColor='rgba(255,200,150,0.4)';ctx.shadowBlur=40;ctx.beginPath();ctx.arc(this.W-100,55,30,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;for(const s of this.stars){const tw=0.5+0.5*Math.sin(this.frame*0.02+s.tw);ctx.fillStyle=`rgba(255,255,255,${s.op*tw})`;ctx.beginPath();const sx=(s.x-this.frame*s.sp*0.05)%this.W;ctx.arc(sx<0?sx+this.W:sx,s.y,s.r,0,Math.PI*2);ctx.fill();}}
  _dCity(ctx){const fg=ctx.createLinearGradient(0,this.HORIZON_Y-30,0,this.HORIZON_Y+60);fg.addColorStop(0,'rgba(10,10,46,0)');fg.addColorStop(0.5,'rgba(20,10,50,0.3)');fg.addColorStop(1,'rgba(20,10,50,0.85)');ctx.fillStyle=fg;ctx.fillRect(0,this.HORIZON_Y-30,this.W,90);for(const b of this.buildings){const sp=b.ly===0?0.15:0.4;const bky=this.HORIZON_Y-b.h+(b.ly===0?18:8);const bx=((b.x-this.frame*sp)%(this.W+b.w+200))-100;if(bx<-b.w||bx>this.W+b.w)continue;ctx.fillStyle=b.ly===0?'#0d0d1a':'#1a1a30';ctx.fillRect(bx,bky,b.w,b.h);for(const w of b.ws){if(!w.on)continue;const wx=bx+w.x*b.w,wy=bky+w.y*b.h;const fl=Math.sin(wx*10+this.frame*0.05)>0?1:0.5;ctx.fillStyle=Math.random()>0.9?`rgba(255,136,68,${0.6*fl})`:`rgba(255,221,102,${0.5*fl})`;ctx.fillRect(wx,wy,3,4);}if(b.neon&&b.ly===1){const nx=bx+b.w*0.2,ny=bky+b.h*0.1;ctx.fillStyle=b.neon;ctx.shadowColor=b.neon;ctx.shadowBlur=6+Math.sin(this.frame*0.1)*3;ctx.fillRect(nx,ny,b.w*0.6,4);ctx.shadowBlur=0;}}}
  _dRoad(ctx){const W=this.W,H=this.H,ss=this.strips;
    for(let i=0;i<ss.length-1;i++){const s1=ss[i],s2=ss[i+1];if(s2.sy<this.HORIZON_Y-5)continue;const rx1=this._roadX(s1.d),rx2=this._roadX(s2.d);const rw1=this.ROAD_W*s1.sc*W,rw2=this.ROAD_W*s2.sc*W;const tl=W/2+rx1-rw1,tr=W/2+rx1+rw1;const bl=W/2+rx2-rw2,br=W/2+rx2+rw2;const brt=0.18+s1.sc*0.28;ctx.fillStyle=`rgb(${Math.floor(36*brt)},${Math.floor(36*brt)},${Math.floor(56*brt)})`;ctx.beginPath();ctx.moveTo(tl,s1.sy);ctx.lineTo(tr,s1.sy);ctx.lineTo(br,s2.sy);ctx.lineTo(bl,s2.sy);ctx.closePath();ctx.fill();
      const sh1=rw1*0.07,sh2=rw2*0.07;const rd=(Math.floor(s1.d/8)%2===0);ctx.fillStyle=rd?'#ff3344':'rgba(255,255,255,0.4)';ctx.beginPath();ctx.moveTo(tl-sh1,s1.sy);ctx.lineTo(tl,s1.sy);ctx.lineTo(bl,s2.sy);ctx.lineTo(bl-sh2,s2.sy);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(tr,s1.sy);ctx.lineTo(tr+sh1,s1.sy);ctx.lineTo(br+sh2,s2.sy);ctx.lineTo(br,s2.sy);ctx.closePath();ctx.fill();
      const off=Math.floor(s1.d/10)%2===0;
      if(off){ctx.strokeStyle=`rgba(255,255,255,${0.3+s1.sc*0.35})`;ctx.lineWidth=Math.max(1.5,2.5*s1.sc);ctx.beginPath();ctx.moveTo(W/2+rx1,s1.sy);ctx.lineTo(W/2+rx2,s2.sy);ctx.stroke();}
      const ll1=W/2+rx1-rw1*0.35,ll2=W/2+rx2-rw2*0.35;if(off){ctx.strokeStyle=`rgba(255,255,255,${0.15+s1.sc*0.15})`;ctx.lineWidth=1.5*s1.sc;ctx.beginPath();ctx.moveTo(ll1,s1.sy);ctx.lineTo(ll2,s2.sy);ctx.stroke();}
      const rl1=W/2+rx1+rw1*0.35,rl2=W/2+rx2+rw2*0.35;if(off){ctx.beginPath();ctx.moveTo(rl1,s1.sy);ctx.lineTo(rl2,s2.sy);ctx.stroke();}
      if(i%8===0){ctx.shadowColor='#ff00ff';ctx.shadowBlur=10*s1.sc;ctx.strokeStyle='#ff00ff';ctx.lineWidth=2.5*s1.sc;ctx.beginPath();ctx.moveTo(tl,s1.sy);ctx.lineTo(bl,s2.sy);ctx.stroke();ctx.shadowColor='#00ffff';ctx.strokeStyle='#00ffff';ctx.beginPath();ctx.moveTo(tr,s1.sy);ctx.lineTo(br,s2.sy);ctx.stroke();ctx.shadowBlur=0;}}}
  _dDecor(ctx){const W=this.W;for(const lp of this.lampposts){if(lp.d<=0||lp.d>this.FAR_D+400)continue;const pj=this._proj(lp.d);if(pj.sy<this.HORIZON_Y||pj.sy>this.H)continue;const rx=this._roadX(lp.d);const rw=this.ROAD_W*pj.sc*W;const lx=W/2+rx+lp.side*rw*1.15;ctx.fillStyle='#334';ctx.fillRect(lx-2*pj.sc,pj.sy-65*pj.sc,3.5*pj.sc,65*pj.sc);ctx.fillStyle='#ffddaa';ctx.shadowColor='rgba(255,200,100,0.5)';ctx.shadowBlur=14*pj.sc;ctx.beginPath();ctx.arc(lx,pj.sy-65*pj.sc,6*pj.sc,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
    for(const bb of this.billboards){if(bb.d<=0||bb.d>this.FAR_D+400)continue;const pj=this._proj(bb.d);if(pj.sy<this.HORIZON_Y||pj.sy>this.H)continue;const rx=this._roadX(bb.d);const rw=this.ROAD_W*pj.sc*W;const bx=W/2+rx+bb.side*rw*1.12;const bh=22*pj.sc,bw=50*pj.sc;ctx.fillStyle='#1a1a30';ctx.fillRect(bx-bw/2,pj.sy-bh,bw,bh);ctx.fillStyle=['#ff00ff','#00ffff','#ffaa00'][Math.floor(Math.random()*3)];ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=7*pj.sc;ctx.fillRect(bx-bw*0.35,pj.sy-bh*0.6,bw*0.7,bh*0.3);ctx.shadowBlur=0;}}
  _dObst(ctx){
    const W=this.W;const sorted=[...this.obstacles].sort((a,b)=>b.d-a.d);
    for(const o of sorted){
      if(o.d<=0||o.d>this.FAR_D+400)continue;const pj=this._proj(o.d);if(pj.sy<this.HORIZON_Y||pj.sy>this.H+20)continue;
      const rx=this._roadX(o.d);const rw=this.ROAD_W*pj.sc*W;const ox=W/2+rx+o.lat*rw*0.78;

      // ---- 碰撞预警区域 (接近时高亮) ----
      const dangerDist=50; // 距离阈值
      const nearDanger=o.d<dangerDist;
      const inRange=o.d<70&&o.d>this.NEAR_D;

      const bw=(o.type==='truck'?38:o.type==='racer'?20:27)*pj.sc*1.1;
      const bh=(o.type==='truck'?58:o.type==='racer'?30:42)*pj.sc*1.1;

      // 碰撞预警光晕
      if(nearDanger&&inRange){
        const alpha=1-(o.d/dangerDist); // 越近越亮
        ctx.fillStyle=`rgba(255,50,50,${alpha*0.35})`;
        ctx.shadowColor=`rgba(255,0,0,${alpha*0.6})`;ctx.shadowBlur=15*pj.sc+bh*0.5;
        ctx.fillRect(ox-bw/2-4,pj.sy-bh-5,bw+8,bh+12);
        ctx.shadowBlur=0;
      }

      // 碰撞边界框 (清晰矩形边框)
      if(inRange){
        ctx.strokeStyle=nearDanger?`rgba(255,80,80,${0.5+(1-o.d/dangerDist)*0.5})`:'rgba(255,255,255,0.2)';
        ctx.lineWidth=1.5;ctx.setLineDash(nearDanger?[]:[3,4]);
        ctx.strokeRect(ox-bw/2,pj.sy-bh,bw,bh);
        ctx.setLineDash([]);

        // 四角加强标记 (近距离)
        if(nearDanger){
          const cm=5*pj.sc;
          ctx.strokeStyle='rgba(255,255,0,0.9)';ctx.lineWidth=2;
          // 左上
          ctx.beginPath();ctx.moveTo(ox-bw/2-cm,pj.sy-bh-cm+8);ctx.lineTo(ox-bw/2-cm,pj.sy-bh-cm);ctx.lineTo(ox-bw/2-cm+8,pj.sy-bh-cm);ctx.stroke();
          // 右上
          ctx.beginPath();ctx.moveTo(ox+bw/2+cm-8,pj.sy-bh-cm);ctx.lineTo(ox+bw/2+cm,pj.sy-bh-cm);ctx.lineTo(ox+bw/2+cm,pj.sy-bh-cm+8);ctx.stroke();
          // 左下
          ctx.beginPath();ctx.moveTo(ox-bw/2-cm,pj.sy+cm-8);ctx.lineTo(ox-bw/2-cm,pj.sy+cm);ctx.lineTo(ox-bw/2-cm+8,pj.sy+cm);ctx.stroke();
          // 右下
          ctx.beginPath();ctx.moveTo(ox+bw/2+cm-8,pj.sy+cm);ctx.lineTo(ox+bw/2+cm,pj.sy+cm);ctx.lineTo(ox+bw/2+cm,pj.sy+cm-8);ctx.stroke();
        }
      }

      // 车身
      ctx.fillStyle=o.type==='truck'?'#ff9933':o.type==='racer'?'#ff2244':'#ff6644';ctx.fillRect(ox-bw/2,pj.sy-bh,bw,bh);
      ctx.fillStyle='rgba(20,20,40,0.6)';ctx.fillRect(ox-bw*0.28,pj.sy-bh*0.95,bw*0.56,bh*0.32);
      // 前灯
      ctx.fillStyle='#ffff88';ctx.shadowColor='#ffff88';ctx.shadowBlur=3*pj.sc;ctx.fillRect(ox-bw*0.32,pj.sy-bh-2*pj.sc,bw*0.15,3*pj.sc);ctx.fillRect(ox+bw*0.18,pj.sy-bh-2*pj.sc,bw*0.15,3*pj.sc);ctx.shadowBlur=0;
      if(o.type==='racer'){ctx.fillStyle='#f00';ctx.beginPath();ctx.moveTo(ox,pj.sy-bh-5*pj.sc);ctx.lineTo(ox-5*pj.sc,pj.sy-bh-13*pj.sc);ctx.lineTo(ox+5*pj.sc,pj.sy-bh-13*pj.sc);ctx.closePath();ctx.fill();}
    }
  }

  // ===== 精致座舱 =====
  _dCockpit(ctx){
    const W=this.W,H=this.H,p=this.player;
    const shake=(this.speed>0?this.speed*0.01:0)+(p.skid?2:0);
    const sx=p.skid?(Math.random()-0.5)*shake*3:(Math.sin(this.frame*0.2)*shake);
    const sy=p.skid?(Math.random()-0.5)*shake*1.5:0;

    // ---- 路面上方碰撞区指示 (自车占用空间的视觉提示) ----
    this._dCollisionZone(ctx);

    // ===== 仪表台总成 (横贯左右) =====
    const dashY=H-98;
    // 仪表台下层
    ctx.fillStyle='#0a0a14';ctx.fillRect(0,dashY+32,W,H-dashY-32);
    // 仪表台面
    const dtg=ctx.createLinearGradient(0,dashY,0,dashY+30);
    dtg.addColorStop(0,'#1a1a2e');dtg.addColorStop(0.5,'#141426');dtg.addColorStop(1,'#0d0d1a');
    ctx.fillStyle=dtg;ctx.fillRect(0,dashY,W,32);
    // 仪表台上沿高光
    ctx.fillStyle='rgba(40,40,60,0.8)';ctx.fillRect(0,dashY,W,2.5);
    // 缝线 (双线)
    ctx.strokeStyle='rgba(255,0,180,0.15)';ctx.lineWidth=1;
    ctx.setLineDash([4,12]);ctx.beginPath();ctx.moveTo(W*0.1,dashY+8);ctx.lineTo(W*0.9,dashY+8);ctx.stroke();
    ctx.beginPath();ctx.moveTo(W*0.1,dashY+20);ctx.lineTo(W*0.9,dashY+20);ctx.stroke();ctx.setLineDash([]);

    // ---- 中央空调出风口 ----
    const ventCY=dashY+13,ventCW=55;
    ctx.fillStyle='#0a0a16';ctx.strokeStyle='#333';ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(W/2-ventCW,dashY+5,ventCW*2,16,6);ctx.fill();ctx.stroke();
    // 叶片
    ctx.strokeStyle='#444';ctx.lineWidth=1;
    for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(W/2-ventCW+8,dashY+9+i*4);ctx.lineTo(W/2+ventCW-8,dashY+9+i*4);ctx.stroke();}
    // 银色饰条
    ctx.fillStyle='#555';ctx.fillRect(W/2-ventCW+2,dashY+6,ventCW*2-4,2);

    // ---- 左侧空调出风口 ----
    const lvX=W*0.18,lvW=30;
    ctx.fillStyle='#0a0a16';ctx.strokeStyle='#333';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.roundRect(lvX-lvW,dashY+7,lvW*2,12,5);ctx.fill();ctx.stroke();
    ctx.strokeStyle='#444';ctx.lineWidth=1;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(lvX-lvW+6,dashY+10+i*3.5);ctx.lineTo(lvX+lvW-6,dashY+10+i*3.5);ctx.stroke();}
    // 右侧出风口
    const rvX=W*0.82;
    ctx.fillStyle='#0a0a16';ctx.strokeStyle='#333';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.roundRect(rvX-rvW,dashY+7,rvW*2,12,5);ctx.fill();ctx.stroke();
    ctx.strokeStyle='#444';ctx.lineWidth=1;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(rvX-rvW+6,dashY+10+i*3.5);ctx.lineTo(rvX+rvW-6,dashY+10+i*3.5);ctx.stroke();}

    // ---- 中控屏 (导航屏幕) ----
    const navW=50,navH=28,navX=W/2-navW,navY=dashY-26;
    ctx.fillStyle='#0a0a1a';ctx.strokeStyle='#333';ctx.lineWidth=2.5;
    ctx.beginPath();ctx.roundRect(navX,navY,navW*2,navH,5);ctx.fill();ctx.stroke();
    ctx.fillStyle='#0a1a2e';ctx.beginPath();ctx.roundRect(navX+3,navY+3,navW*2-6,navH-6,3);ctx.fill();
    // 导航路线 (简单线条)
    ctx.strokeStyle='#00ffff';ctx.lineWidth=1.5;ctx.shadowColor='#00ffff';ctx.shadowBlur=4;
    ctx.beginPath();ctx.moveTo(navX+10,navY+navH-8);ctx.lineTo(navX+navW-5,navY+navH/2);ctx.lineTo(navX+navW+15,navY+10);ctx.stroke();ctx.shadowBlur=0;
    // 目的地标志
    ctx.fillStyle='#ff00ff';ctx.beginPath();ctx.arc(navX+navW+15,navY+10,3.5,0,Math.PI*2);ctx.fill();

    // ===== 双炮筒仪表 =====
    const gY=dashY-2;
    this._gauge(ctx,W*0.22,gY,26,this.speed/this.maxSpeed,'RPM','#00ffff');
    this._gauge(ctx,W*0.78,gY,26,this.displaySpeed/300,'KM/H','#ff00ff');

    // ===== 转向柱 =====
    const wCX=W/2+sx,wCY=H-62+sy;
    ctx.fillStyle='#111';ctx.beginPath();ctx.moveTo(wCX-10,wCY-22);ctx.lineTo(wCX+10,wCY-22);ctx.lineTo(wCX+7,dashY+28);ctx.lineTo(wCX-7,dashY+28);ctx.closePath();ctx.fill();
    ctx.fillStyle='#222';ctx.beginPath();ctx.moveTo(wCX-6,wCY-22);ctx.lineTo(wCX+6,wCY-22);ctx.lineTo(wCX+4,dashY+28);ctx.lineTo(wCX-4,dashY+28);ctx.closePath();ctx.fill();

    // ===== 方向盘 =====
    ctx.save();ctx.translate(wCX,wCY);
    const steerVis=p.steer*Math.PI*0.5;
    ctx.rotate(steerVis);

    const wrX=68,wrY=26;
    // 外环底阴影
    ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=12;
    ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.ellipse(0,3,wrX,wrY,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    // 外环
    ctx.strokeStyle='#3a3a3a';ctx.lineWidth=4.5;
    ctx.beginPath();ctx.ellipse(0,0,wrX,wrY,0,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle='#555';ctx.lineWidth=2.5;
    ctx.beginPath();ctx.ellipse(0,0,wrX-3.5,wrY-3.5,0,0,Math.PI*2);ctx.stroke();
    // 皮革纹理高光
    ctx.strokeStyle='#666';ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(0,0,wrX-5.5,wrY-5.5,0,0,Math.PI*2);ctx.stroke();
    // 内环
    ctx.strokeStyle='#2a2a2a';ctx.lineWidth=5;
    ctx.beginPath();ctx.ellipse(0,0,wrX-10,wrY-8,0,0,Math.PI*2);ctx.stroke();

    // 3辐条 (打孔轻量化设计)
    ctx.fillStyle='#333';ctx.strokeStyle='#4a4a4a';ctx.lineWidth=4.5;
    // 左辐条
    ctx.beginPath();ctx.moveTo(-18,7);ctx.lineTo(-wrX+7,wrY-1);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-14,7);ctx.lineTo(-wrX+5,wrY-3);ctx.stroke();
    // 右辐条
    ctx.beginPath();ctx.moveTo(18,7);ctx.lineTo(wrX-7,wrY-1);ctx.stroke();
    ctx.beginPath();ctx.moveTo(14,7);ctx.lineTo(wrX-5,wrY-3);ctx.stroke();
    // 下辐条
    ctx.beginPath();ctx.moveTo(0,14);ctx.lineTo(0,wrY-1);ctx.stroke();

    // 中心hub
    const hubG=ctx.createRadialGradient(0,0,2,0,0,18);
    hubG.addColorStop(0,'#2a2a2a');hubG.addColorStop(1,'#0a0a0a');
    ctx.fillStyle=hubG;ctx.beginPath();ctx.arc(0,0,18,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#555';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,18,0,Math.PI*2);ctx.stroke();
    // logo
    ctx.fillStyle='#ff00ff';ctx.shadowColor='#ff00ff';ctx.shadowBlur=12;
    ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#fff';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('NR',0,1);

    // 黄色回正条
    ctx.fillStyle='#ffdd00';ctx.shadowColor='#ffdd00';ctx.shadowBlur=5;
    ctx.fillRect(-5,-wrY-1,10,5);ctx.shadowBlur=0;

    // ---- 双手 (赛车手套) ----
    for(let s=-1;s<=1;s+=2){
      // 手背
      ctx.fillStyle='#333';ctx.strokeStyle='#555';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(s*wrX,5,11,0,Math.PI*2);ctx.fill();ctx.stroke();
      // 手掌高光
      ctx.fillStyle='#444';ctx.beginPath();ctx.arc(s*wrX-2,3,6,0,Math.PI*2);ctx.fill();
      // 手指线
      ctx.strokeStyle='#222';ctx.lineWidth=1;
      for(let f=-1;f<=1;f++){ctx.beginPath();ctx.moveTo(s*wrX+f*3,9-f*2);ctx.lineTo(s*wrX+f*3,18-f);ctx.stroke();}
      // 拇指
      ctx.fillStyle='#333';ctx.strokeStyle='#555';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(s*wrX-s*8,14,5,0,Math.PI*2);ctx.fill();ctx.stroke();
    }

    ctx.restore();

    // ---- 换挡拨片 ----
    ctx.save();ctx.translate(wCX,wCY);ctx.rotate(steerVis);
    ctx.fillStyle='#555';ctx.beginPath();ctx.roundRect(-wrX-10,-5,12,18,3);ctx.fill();
    ctx.fillStyle='#f00';ctx.font='bold 7px monospace';ctx.textAlign='center';ctx.fillText('-',-wrX-4,7);
    ctx.fillStyle='#555';ctx.beginPath();ctx.roundRect(wrX-2,-5,12,18,3);ctx.fill();
    ctx.fillStyle='#0f0';ctx.fillText('+',wrX+4,7);
    ctx.restore();

    // ===== 引擎盖 =====
    const hoodY=dashY+32;
    ctx.fillStyle='#0d0d1d';ctx.beginPath();ctx.moveTo(W*0.27,hoodY);ctx.quadraticCurveTo(W*0.3,H-15,W*0.35,H+8);ctx.lineTo(W*0.65,H+8);ctx.quadraticCurveTo(W*0.7,H-15,W*0.73,hoodY);ctx.closePath();ctx.fill();
    const hg=ctx.createLinearGradient(W/2,hoodY,W/2,H);
    hg.addColorStop(0,'rgba(30,30,45,0.35)');hg.addColorStop(0.5,'rgba(25,25,35,0.15)');hg.addColorStop(1,'rgba(10,10,20,0.6)');
    ctx.fillStyle=hg;ctx.fillRect(W*0.29,hoodY,W*0.42,H-hoodY);
    // 引擎盖中线 + 两侧折线
    ctx.strokeStyle='rgba(255,255,255,0.03)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(W/2+sx*0.2,hoodY+5);ctx.lineTo(W/2,H-5);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,0.02)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(W*0.33,hoodY+10);ctx.lineTo(W*0.37,H-2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(W*0.67,hoodY+10);ctx.lineTo(W*0.63,H-2);ctx.stroke();
    // 引擎盖上的反光条
    ctx.fillStyle='rgba(255,255,255,0.015)';ctx.fillRect(W*0.3,hoodY+5,W*0.06,H-hoodY-5);
    ctx.fillRect(W*0.64,hoodY+5,W*0.06,H-hoodY-5);

    // ===== A柱 (加粗, 包裹感) =====
    const aGradL=ctx.createLinearGradient(0,0,W*0.3,0);aGradL.addColorStop(0,'#060612');aGradL.addColorStop(1,'#121222');
    ctx.fillStyle=aGradL;ctx.beginPath();ctx.moveTo(0,this.HORIZON_Y-42);ctx.lineTo(W*0.07,this.HORIZON_Y-22);ctx.lineTo(W*0.22,hoodY-5);ctx.lineTo(W*0.07,hoodY);ctx.lineTo(0,hoodY+8);ctx.closePath();ctx.fill();
    const aGradR=ctx.createLinearGradient(W,0,W*0.7,0);aGradR.addColorStop(0,'#060612');aGradR.addColorStop(1,'#121222');
    ctx.fillStyle=aGradR;ctx.beginPath();ctx.moveTo(W,this.HORIZON_Y-42);ctx.lineTo(W*0.93,this.HORIZON_Y-22);ctx.lineTo(W*0.78,hoodY-5);ctx.lineTo(W*0.93,hoodY);ctx.lineTo(W,hoodY+8);ctx.closePath();ctx.fill();
    // A柱内缝
    ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(W*0.08,this.HORIZON_Y-35);ctx.lineTo(W*0.23,hoodY-3);ctx.stroke();
    ctx.beginPath();ctx.moveTo(W*0.92,this.HORIZON_Y-35);ctx.lineTo(W*0.77,hoodY-3);ctx.stroke();

    // ===== 顶部遮阳带 + 后视镜 =====
    ctx.fillStyle='rgba(4,4,12,0.55)';ctx.fillRect(0,this.HORIZON_Y-44,W,20);
    // 内后视镜
    ctx.fillStyle='#1a1a28';ctx.strokeStyle='#444';ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(W/2-22,this.HORIZON_Y-42,44,18,10);ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(15,25,50,0.6)';ctx.beginPath();ctx.roundRect(W/2-21,this.HORIZON_Y-41,42,16,9);ctx.fill();
    ctx.fillStyle='rgba(200,200,255,0.05)';ctx.beginPath();ctx.roundRect(W/2-17,this.HORIZON_Y-39,14,5,3);ctx.fill();
    // 镜子防眩目拨片
    ctx.fillStyle='#333';ctx.fillRect(W/2-1,this.HORIZON_Y-46,2,5);
    ctx.fillStyle='#555';ctx.fillRect(W/2-6,this.HORIZON_Y-46,12,2);

    // ===== 门板内饰 (两侧) =====
    // 左门
    ctx.fillStyle='#0d0d1a';ctx.fillRect(0,hoodY-20,W*0.06,H-hoodY+20);
    ctx.fillStyle='rgba(255,255,255,0.02)';ctx.fillRect(W*0.01,hoodY+10,W*0.03,H-hoodY-40);
    // 门把手 (左)
    ctx.fillStyle='#333';ctx.strokeStyle='#555';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.roundRect(W*0.01,hoodY+40,W*0.035,8,4);ctx.fill();ctx.stroke();
    // 右门
    ctx.fillStyle='#0d0d1a';ctx.fillRect(W*0.94,hoodY-20,W*0.06,H-hoodY+20);
    ctx.fillStyle='rgba(255,255,255,0.02)';ctx.fillRect(W*0.96,hoodY+10,W*0.03,H-hoodY-40);
  }

  // ---- 自车碰撞区 (挡风玻璃下沿的视线参考) ----
  _dCollisionZone(ctx){
    const W=this.W,H=this.H;
    // 仪表台上方路面上显示"你的空间"范围 — 两条半透明竖线
    const cy=H*0.72; // 指示线Y
    const lx=W/2-28,rx=W/2+28;
    ctx.fillStyle='rgba(0,255,255,0.06)';
    ctx.fillRect(lx,cy-40,rx-lx,40);
    ctx.strokeStyle='rgba(0,255,255,0.2)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(lx,cy-40);ctx.lineTo(lx,cy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(rx,cy-40);ctx.lineTo(rx,cy);ctx.stroke();
    // 碰撞闪烁
    if(this.collisionFlash>0){
      ctx.fillStyle=`rgba(255,0,0,${this.collisionFlash/30})`;
      ctx.fillRect(lx-10,cy-45,rx-lx+20,50);
      this.collisionFlash--;
    }
  }

  _gauge(ctx,cx,cy,r,val,label,accent){
    const pct=Math.min(1,Math.max(0,val));
    // 炮筒深坑
    ctx.fillStyle='#060610';ctx.beginPath();ctx.arc(cx,cy,r+3,0,Math.PI*2);ctx.fill();
    // 面板
    ctx.fillStyle='#0a0a18';ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#444';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
    // 内圈
    ctx.strokeStyle='#222';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r-4,0,Math.PI*2);ctx.stroke();
    // 刻度
    const sa=Math.PI*0.75,ea=Math.PI*2.25;
    ctx.strokeStyle='#1a1a30';ctx.lineWidth=r*0.2;ctx.lineCap='round';
    ctx.beginPath();ctx.arc(cx,cy,r*0.55,sa,ea);ctx.stroke();
    const sweep=pct*(ea-sa);
    ctx.strokeStyle=accent;ctx.shadowColor=accent;ctx.shadowBlur=6;
    ctx.beginPath();ctx.arc(cx,cy,r*0.55,sa,sa+sweep);ctx.stroke();ctx.shadowBlur=0;
    // 数字
    ctx.fillStyle='#fff';ctx.font=`bold ${Math.floor(r*0.45)}px monospace`;ctx.textAlign='center';
    ctx.fillText(String(Math.round(val*100)),cx,cy+r*0.15);
    ctx.fillStyle='#668';ctx.font=`${Math.floor(r*0.2)}px monospace`;ctx.fillText(label,cx,cy+r*0.48);
    // 指针
    ctx.save();ctx.translate(cx,cy);ctx.rotate(sa+sweep);
    ctx.strokeStyle=accent;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-r*0.12,0);ctx.lineTo(r*0.5,0);ctx.stroke();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,2.5,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }

  _dParts(ctx){for(const pp of this.particles){ctx.fillStyle=pp.color;ctx.globalAlpha=Math.min(1,pp.life/40);ctx.beginPath();ctx.arc(pp.x,pp.y,2,0,Math.PI*2);ctx.fill();}for(const pp of this.smoke){ctx.fillStyle=`rgba(180,180,200,${pp.life/25*0.3})`;ctx.beginPath();ctx.arc(pp.x,pp.y,pp.r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}

  _dHUD(ctx){
    const W=this.W,H=this.H,p=this.player;
    // 生命
    ctx.textAlign='left';ctx.font='18px sans-serif';ctx.fillText('❤️'.repeat(this.lives)+'🖤'.repeat(3-this.lives),10,this.HORIZON_Y-15);
    // 分数
    ctx.textAlign='right';ctx.font='bold 13px monospace';ctx.fillStyle='#ff00ff';ctx.shadowColor='#ff00ff';ctx.shadowBlur=6;ctx.fillText('🏆 '+String(this.score),W-10,this.HORIZON_Y-15);ctx.shadowBlur=0;
    // 打滑
    if(p.skid){ctx.textAlign='center';ctx.font='bold 14px sans-serif';ctx.fillStyle='#ff4488';ctx.shadowColor='#ff4488';ctx.shadowBlur=10;ctx.fillText('⚠ 打滑漂移！',W/2,H-110);ctx.shadowBlur=0;}
    // 操作提示
    ctx.textAlign='center';ctx.font='10px sans-serif';ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillText('↑油门  ↓刹车  ←→转向',W/2,H-6);
    // 高速速度线
    if(this.speed>180){ctx.strokeStyle='rgba(255,255,255,0.08)';for(let i=0;i<5;i++){ctx.lineWidth=1+Math.random();ctx.beginPath();const lx=W*0.2+Math.random()*W*0.6;ctx.moveTo(lx,this.HORIZON_Y);ctx.lineTo(lx+(Math.random()-0.5)*25,this.HORIZON_Y+Math.random()*40);ctx.stroke();}}
    // 位置指示条
    const indW=150,indH=6,indX=W/2-indW/2,indY=H-14;
    ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(indX-12,indY-8,indW+24,indH+18);
    ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fillRect(indX,indY,indW,indH);
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect(indX+indW*0.5-1,indY-3,2,indH+6);
    ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(indX+indW*0.25-0.5,indY,1,indH);ctx.fillRect(indX+indW*0.75-0.5,indY,1,indH);
    const cpX=indX+indW/2+p.x*indW*0.45;
    ctx.fillStyle='#00ffff';ctx.shadowColor='#00ffff';ctx.shadowBlur=12;
    ctx.fillRect(cpX-5.5,indY-4,11,indH+8);ctx.shadowBlur=0;
    ctx.fillStyle=p.skid?'#ff4488':'#fff';ctx.fillRect(cpX-2,indY-3,4,indH+6);
    ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='7px sans-serif';ctx.textAlign='center';ctx.fillText('← 车道 →',W/2,indY-10);
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  const cv=document.getElementById('gameCanvas');const game=new Game(cv);game._draw();
  document.getElementById('btnStart').addEventListener('click',e=>{e.stopPropagation();game.start();});
  document.getElementById('btnRestart').addEventListener('click',e=>{e.stopPropagation();game.start();});
  function resize(){const mw=Math.min(window.innerWidth-10,800);const sc=mw/800;cv.style.width=mw+'px';cv.style.height=(500*sc)+'px';}
  window.addEventListener('resize',resize);resize();
});
