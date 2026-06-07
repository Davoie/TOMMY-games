/**
 * 霓虹极速 v4 — 真第一人称，方向盘反馈转向位置
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

// ============================================================
// 主游戏 — 真第一人称 v4
// ============================================================
class Game {
  constructor(canvas) {
    this.cv=canvas;this.ctx=canvas.getContext('2d');this.W=canvas.width;this.H=canvas.height;

    // 视角
    this.HORIZON_Y=Math.floor(this.H*0.36);
    this.FOCUS=220;this.ROAD_W=0.55;

    this.strips=[];this._bs();
    this.score=0;this.highScore=parseInt(localStorage.getItem('racerHighScore')||'0',10);
    this.gameOver=false;this.started=false;this.frame=0;
    this.speed=0;this.maxSpeed=120;this.accel=2.5;this.brakeForce=6;this.friction=0.4;this.displaySpeed=0;
    this.player={x:0,steer:0,yaw:0,skid:false,skidT:0};
    this.steerSpeed=0.06;this.steerReturn=0.08;this.yawReturn=0.12;this.skidThresh=80;
    this.invincible=0;this.lives=3;
    this.curve=0;this.targetCurve=0;this.curveTimer=0;
    this.obstacles=[];this.spawnTimer=0;this.spawnInterval=120;this.FAR_D=2000;this.NEAR_D=12;
    this.stars=[];this._is();this.buildings=[];this._ib();
    this.lampposts=[];this.billboards=[];this.particles=[];this.smoke=[];
    this.keys={};this._bind();
    this.lastRoadShift=0; // 路面偏移动画
  }

  _bs(){const n=300;for(let i=0;i<=n;i++){const sy=this.HORIZON_Y+i*(this.H-this.HORIZON_Y)/n;const d=sy>this.HORIZON_Y?(this.H-this.HORIZON_Y)*this.FOCUS/(sy-this.HORIZON_Y)-this.FOCUS:999999;const sc=this.FOCUS/(d+this.FOCUS);this.strips.push({sy,d,sc});}this.FAR_D=this.strips[Math.floor(n*0.03)].d;}
  _proj(d){if(d<=0)return{sy:this.H,sc:1.2};const sc=this.FOCUS/(d+this.FOCUS);return{sy:this.HORIZON_Y+(this.H-this.HORIZON_Y)*sc,sc:Math.min(sc,1.25)};}

  // 弯道 + 玩家横向偏移 → 路面中心偏移。让玩家清楚看到自己在路上的位置！
  _roadX(d){
    const laneShift=this.player.x*0.35*d*1.5; // 大大增强
    return this.curve*d*d*0.00035-laneShift;
  }

  _is(){for(let l=0;l<3;l++)for(let i=0;i<40;i++)this.stars.push({x:Math.random()*this.W,y:Math.random()*this.HORIZON_Y,r:Math.random()*(l===0?1.2:l===1?1.8:2.5),tw:Math.random()*Math.PI*2,sp:0.2+l*0.3,ly:l,op:0.4+l*0.3});}
  _ib(){for(let i=0;i<30;i++)this.buildings.push({x:Math.random()*this.W*1.3-this.W*0.15,w:Math.random()*40+15,h:Math.random()*80+40,ly:0,ws:Array.from({length:Math.floor(Math.random()*6)},()=>({x:Math.random()*0.7+0.1,y:Math.random()*0.7+0.1,on:Math.random()>0.4})),neon:Math.random()>0.7?['#ff00ff','#00ffff','#ff4488','#ffaa00'][Math.floor(Math.random()*4)]:null});for(let i=0;i<20;i++)this.buildings.push({x:Math.random()*this.W*1.2-this.W*0.1,w:Math.random()*70+30,h:Math.random()*120+60,ly:1,ws:Array.from({length:Math.floor(Math.random()*10)},()=>({x:Math.random()*0.7+0.1,y:Math.random()*0.7+0.1,on:Math.random()>0.35})),neon:Math.random()>0.5?['#ff00ff','#00ffff','#ff4488','#ffaa00'][Math.floor(Math.random()*4)]:null});}

  _bind(){window.addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();this.keys[e.key]=true;if(!this.started&&!this.gameOver){this.start();return;}});window.addEventListener('keyup',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();this.keys[e.key]=false;});this.cv.addEventListener('touchstart',e=>{e.preventDefault();SE.init();if(!this.started&&!this.gameOver){this.start();return;}if(this.gameOver)return;const x=(e.touches[0].clientX-this.cv.getBoundingClientRect().left)/this.cv.getBoundingClientRect().width;if(x<0.4)this.keys.ArrowLeft=true;else if(x>0.6)this.keys.ArrowRight=true;else this.keys.ArrowUp=true;},{passive:false});this.cv.addEventListener('touchend',e=>{e.preventDefault();this.keys={};},{passive:false});this.cv.addEventListener('touchmove',e=>{e.preventDefault();this.keys={};const x=(e.touches[0].clientX-this.cv.getBoundingClientRect().left)/this.cv.getBoundingClientRect().width;if(x<0.4)this.keys.ArrowLeft=true;else if(x>0.6)this.keys.ArrowRight=true;else this.keys.ArrowUp=true;},{passive:false});}

  start(){this.started=true;this.gameOver=false;this.score=0;this.speed=80;this.frame=0;this.lives=3;this.invincible=0;const p=this.player;p.x=0;p.steer=0;p.yaw=0;p.skid=false;p.skidT=0;this.curve=0;this.targetCurve=0;this.curveTimer=0;this.obstacles=[];this.spawnTimer=0;this.particles=[];this.smoke=[];this.billboards=[];this.lampposts=[];this.displaySpeed=80;this.lastRoadShift=0;document.getElementById('overlayStart').classList.add('hidden');document.getElementById('overlayEnd').classList.add('hidden');BGM.start();this._loop();}
  end(){this.gameOver=true;BGM.stop();SE.crash();if(this.score>this.highScore){this.highScore=this.score;localStorage.setItem('racerHighScore',String(this.highScore));}document.getElementById('finalSpeed').textContent=String(Math.round(this.displaySpeed));document.getElementById('finalScore').textContent=String(this.score);document.getElementById('finalHigh').textContent=String(this.highScore);document.getElementById('newRecord').classList.toggle('hidden',this.score<=this.highScore||this.score===0);document.getElementById('overlayEnd').classList.remove('hidden');}

  _loop(){if(this.gameOver)return;this.frame++;this._update();this._draw();requestAnimationFrame(()=>this._loop());}

  _update(){this._uInp();this._uSpd();this._uSteer();this._uPhys();this._uCurve();this._uObst();this._uPart();this._uDecor();}
  _uInp(){const k=this.keys;let ts=0;if(k.ArrowLeft)ts=-1;if(k.ArrowRight)ts=1;if(k.ArrowLeft&&k.ArrowRight)ts=0;this.player.targetSteer=ts;}
  _uSpd(){const k=this.keys;if(k.ArrowUp){this.speed+=this.accel;if(this.frame%4===0)SE.eng(60+this.speed*0.5);}if(k.ArrowDown){this.speed-=this.brakeForce;if(this.speed>60&&this.frame%8===0)SE.brk();}this.speed-=this.friction;this.speed=Math.max(0,Math.min(this.maxSpeed,this.speed));this.displaySpeed+=(this.speed-this.displaySpeed)*0.15;this.maxSpeed=120+Math.floor(this.score/100)*8;this.spawnInterval=Math.max(40,120-Math.floor(this.score/80));}
  _uSteer(){const p=this.player;if(p.targetSteer!==0)p.steer+=p.targetSteer*this.steerSpeed;else{if(Math.abs(p.steer)<this.steerReturn)p.steer=0;else p.steer-=Math.sign(p.steer)*this.steerReturn;}p.steer=Math.max(-1,Math.min(1,p.steer));}
  _uPhys(){const p=this.player,s=this.speed;const sf=Math.abs(p.steer)*s;p.skid=sf>this.skidThresh;if(p.skid){p.skidT=20;if(this.frame%5===0)SE.skid();}if(p.skidT>0)p.skidT--;let gr=1;if(p.skid)gr=0.25;const lm=Math.sin(p.yaw)*s*0.0007+p.steer*s*0.01*gr*0.05;p.x+=lm;p.x=Math.max(-0.9,Math.min(0.9,p.x));if(p.steer!==0)p.yaw+=p.steer*0.025*(s/120)*gr;else{if(Math.abs(p.yaw)<this.yawReturn)p.yaw=0;else p.yaw-=Math.sign(p.yaw)*this.yawReturn;}p.yaw=Math.max(-0.45,Math.min(0.45,p.yaw));if(this.invincible>0)this.invincible--;}
  _uCurve(){this.curveTimer--;if(this.curveTimer<=0){this.curveTimer=100+Math.random()*200;const mc=Math.min(0.02,0.002+this.score*0.00003);this.targetCurve=(Math.random()-0.5)*2*mc;}this.curve+=(this.targetCurve-this.curve)*0.008;}

  _uObst(){this.spawnTimer++;if(this.spawnTimer>=this.spawnInterval){this.spawnTimer=0;this._spawn();}const ws=this.speed*0.08;for(let i=this.obstacles.length-1;i>=0;i--){const o=this.obstacles[i];o.d-=ws;if(!o.scored&&o.d<0){o.scored=true;this.score+=10;}if(o.d<-30)this.obstacles.splice(i,1);}if(this.invincible>0)return;for(const o of this.obstacles){if(this._col(o)){this._hit();break;}}}
  _spawn(){const types=this.score<200?['car']:this.score<400?['car','truck']:['car','truck','racer'];const type=types[Math.floor(Math.random()*types.length)];const d=this.FAR_D+Math.random()*400;let lat=(Math.random()-0.5)*1.3;for(const o of this.obstacles){if(Math.abs(o.d-d)<250&&Math.abs(o.lat-lat)<0.2)lat=(Math.random()-0.5)*1.3;}this.obstacles.push({type,lat,d,scored:false,sp:type==='truck'?0.3:type==='racer'?2+Math.random()*2:Math.random()*1.5});}
  _col(o){if(o.d<this.NEAR_D||o.d>70)return false;const pj=this._proj(o.d);const rx=this._roadX(o.d);const rw=this.ROAD_W*pj.sc*this.W;const ox=this.W/2+rx+o.lat*rw*0.78;const ow=(o.type==='truck'?38:o.type==='racer'?20:27)*pj.sc*1.1;const oh=(o.type==='truck'?58:o.type==='racer'?30:42)*pj.sc*1.1;const pw=36,ph=60;const px=this.W/2-pw/2;const py=this.H-ph+15;const pad=4;return px+pad<ox+ow/2-pad&&px+pw-pad>ox-ow/2+pad&&py+pad<pj.sy+oh/2-pad&&py+ph-pad>pj.sy-oh/2+pad;}
  _hit(){if(this.invincible>0)return;this.lives--;this.invincible=90;for(let i=0;i<30;i++)this.particles.push({x:this.W/2,y:this.H-100,vx:(Math.random()-0.5)*8,vy:(Math.random()-0.5)*8-4,life:30+Math.random()*20,color:['#ff00ff','#ff4488','#ffaa00','#fff'][Math.floor(Math.random()*4)]});if(this.lives<=0)this.end();else SE.crash();}

  _uPart(){const p=this.player;if(this.speed>150&&this.frame%2===0){this.particles.push({x:this.W/2+(Math.random()-0.5)*200,y:this.H-80,vx:(Math.random()-0.5)*2,vy:-Math.random()*6-this.speed*0.02,life:15+Math.random()*10,color:p.skid?'#ff4488':['#ff00ff','#00ffff'][Math.floor(Math.random()*2)]});}if(this.frame%3===0){this.smoke.push({x:this.W/2+(Math.random()-0.5)*40,y:this.H-20,vx:(Math.random()-0.5)*0.5,vy:-Math.random()-0.5,life:10+Math.random()*10,r:2+Math.random()*3});}if(p.skid&&this.frame%2===0){for(let i=0;i<2;i++)this.smoke.push({x:this.W/2+(Math.random()-0.5)*100,y:this.H-30,vx:(Math.random()-0.5)*3,vy:-Math.random()*2-1,life:15+Math.random()*15,r:4+Math.random()*5});}for(const arr of[this.particles,this.smoke]){for(let i=arr.length-1;i>=0;i--){const pp=arr[i];pp.x+=pp.vx;pp.y+=pp.vy;pp.life--;if(pp.life<=0)arr.splice(i,1);}}}
  _uDecor(){const ws=this.speed*0.08;if(this.frame%Math.max(10,40-Math.floor(this.speed/10))===0)this.lampposts.push({d:this.FAR_D+Math.random()*200,side:Math.random()>0.5?1:-1});for(let i=this.lampposts.length-1;i>=0;i--){this.lampposts[i].d-=ws;if(this.lampposts[i].d<-50)this.lampposts.splice(i,1);}if(this.frame%180===0&&this.score>150)this.billboards.push({d:this.FAR_D+Math.random()*300,side:Math.random()>0.5?1:-1});for(let i=this.billboards.length-1;i>=0;i--){this.billboards[i].d-=ws;if(this.billboards[i].d<-50)this.billboards.splice(i,1);}}

  // ==========================================================
  // 绘制
  // ==========================================================
  _draw(){const ctx=this.ctx,W=this.W,H=this.H;ctx.clearRect(0,0,W,H);this._dSky(ctx);this._dCity(ctx);this._dRoad(ctx);this._dDecor(ctx);this._dObst(ctx);this._dParts(ctx);this._dCockpit(ctx);this._dHUD(ctx);}

  _dSky(ctx){
    const g=ctx.createLinearGradient(0,0,0,this.HORIZON_Y+20);g.addColorStop(0,'#0a0a2e');g.addColorStop(0.5,'#1a0a3e');g.addColorStop(1,'#2a1040');ctx.fillStyle=g;ctx.fillRect(0,0,this.W,this.HORIZON_Y+20);
    ctx.fillStyle='#ffddaa';ctx.shadowColor='rgba(255,200,150,0.4)';ctx.shadowBlur=40;ctx.beginPath();ctx.arc(this.W-100,55,30,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    for(const s of this.stars){const tw=0.5+0.5*Math.sin(this.frame*0.02+s.tw);ctx.fillStyle=`rgba(255,255,255,${s.op*tw})`;ctx.beginPath();const sx=(s.x-this.frame*s.sp*0.05)%this.W;ctx.arc(sx<0?sx+this.W:sx,s.y,s.r,0,Math.PI*2);ctx.fill();}
  }

  _dCity(ctx){
    const fg=ctx.createLinearGradient(0,this.HORIZON_Y-30,0,this.HORIZON_Y+60);fg.addColorStop(0,'rgba(10,10,46,0)');fg.addColorStop(0.5,'rgba(20,10,50,0.3)');fg.addColorStop(1,'rgba(20,10,50,0.85)');ctx.fillStyle=fg;ctx.fillRect(0,this.HORIZON_Y-30,this.W,90);
    for(const b of this.buildings){const sp=b.ly===0?0.15:0.4;const bky=this.HORIZON_Y-b.h+(b.ly===0?18:8);const bx=((b.x-this.frame*sp)%(this.W+b.w+200))-100;if(bx<-b.w||bx>this.W+b.w)continue;ctx.fillStyle=b.ly===0?'#0d0d1a':'#1a1a30';ctx.fillRect(bx,bky,b.w,b.h);for(const w of b.ws){if(!w.on)continue;const wx=bx+w.x*b.w,wy=bky+w.y*b.h;const fl=Math.sin(wx*10+this.frame*0.05)>0?1:0.5;ctx.fillStyle=Math.random()>0.9?`rgba(255,136,68,${0.6*fl})`:`rgba(255,221,102,${0.5*fl})`;ctx.fillRect(wx,wy,3,4);}if(b.neon&&b.ly===1){const nx=bx+b.w*0.2,ny=bky+b.h*0.1;ctx.fillStyle=b.neon;ctx.shadowColor=b.neon;ctx.shadowBlur=6+Math.sin(this.frame*0.1)*3;ctx.fillRect(nx,ny,b.w*0.6,4);ctx.shadowBlur=0;}}
  }

  _dRoad(ctx){
    const W=this.W,H=this.H,ss=this.strips;
    for(let i=0;i<ss.length-1;i++){
      const s1=ss[i],s2=ss[i+1];if(s2.sy<this.HORIZON_Y-5)continue;
      const rx1=this._roadX(s1.d),rx2=this._roadX(s2.d);
      const rw1=this.ROAD_W*s1.sc*W,rw2=this.ROAD_W*s2.sc*W;
      const tl=W/2+rx1-rw1,tr=W/2+rx1+rw1;
      const bl=W/2+rx2-rw2,br=W/2+rx2+rw2;

      const brt=0.18+s1.sc*0.28;ctx.fillStyle=`rgb(${Math.floor(36*brt)},${Math.floor(36*brt)},${Math.floor(56*brt)})`;
      ctx.beginPath();ctx.moveTo(tl,s1.sy);ctx.lineTo(tr,s1.sy);ctx.lineTo(br,s2.sy);ctx.lineTo(bl,s2.sy);ctx.closePath();ctx.fill();

      // 路肩
      const sh1=rw1*0.07,sh2=rw2*0.07;const rd=(Math.floor(s1.d/8)%2===0);
      ctx.fillStyle=rd?'#ff3344':'rgba(255,255,255,0.4)';
      ctx.beginPath();ctx.moveTo(tl-sh1,s1.sy);ctx.lineTo(tl,s1.sy);ctx.lineTo(bl,s2.sy);ctx.lineTo(bl-sh2,s2.sy);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(tr,s1.sy);ctx.lineTo(tr+sh1,s1.sy);ctx.lineTo(br+sh2,s2.sy);ctx.lineTo(br,s2.sy);ctx.closePath();ctx.fill();

      // 车道虚线 (能看到自己在哪个位置的关键)
      const off=Math.floor(s1.d/10)%2===0;
      // 中心线
      if(off){ctx.strokeStyle=`rgba(255,255,255,${0.3+s1.sc*0.35})`;ctx.lineWidth=Math.max(1.5,2.5*s1.sc);ctx.beginPath();ctx.moveTo(W/2+rx1,s1.sy);ctx.lineTo(W/2+rx2,s2.sy);ctx.stroke();}
      // 左车道线
      const ll1=W/2+rx1-rw1*0.35,ll2=W/2+rx2-rw2*0.35;
      if(off){ctx.strokeStyle=`rgba(255,255,255,${0.15+s1.sc*0.15})`;ctx.lineWidth=1.5*s1.sc;ctx.beginPath();ctx.moveTo(ll1,s1.sy);ctx.lineTo(ll2,s2.sy);ctx.stroke();}
      // 右车道线
      const rl1=W/2+rx1+rw1*0.35,rl2=W/2+rx2+rw2*0.35;
      if(off){ctx.beginPath();ctx.moveTo(rl1,s1.sy);ctx.lineTo(rl2,s2.sy);ctx.stroke();}

      // 霓虹灯带
      if(i%8===0){ctx.shadowColor='#ff00ff';ctx.shadowBlur=10*s1.sc;ctx.strokeStyle='#ff00ff';ctx.lineWidth=2.5*s1.sc;ctx.beginPath();ctx.moveTo(tl,s1.sy);ctx.lineTo(bl,s2.sy);ctx.stroke();ctx.shadowColor='#00ffff';ctx.strokeStyle='#00ffff';ctx.beginPath();ctx.moveTo(tr,s1.sy);ctx.lineTo(br,s2.sy);ctx.stroke();ctx.shadowBlur=0;}
    }
  }

  _dDecor(ctx){
    const W=this.W;
    for(const lp of this.lampposts){if(lp.d<=0||lp.d>this.FAR_D+400)continue;const pj=this._proj(lp.d);if(pj.sy<this.HORIZON_Y||pj.sy>this.H)continue;const rx=this._roadX(lp.d);const rw=this.ROAD_W*pj.sc*W;const lx=W/2+rx+lp.side*rw*1.15;ctx.fillStyle='#334';ctx.fillRect(lx-2*pj.sc,pj.sy-65*pj.sc,3.5*pj.sc,65*pj.sc);ctx.fillStyle='#ffddaa';ctx.shadowColor='rgba(255,200,100,0.5)';ctx.shadowBlur=14*pj.sc;ctx.beginPath();ctx.arc(lx,pj.sy-65*pj.sc,6*pj.sc,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
    for(const bb of this.billboards){if(bb.d<=0||bb.d>this.FAR_D+400)continue;const pj=this._proj(bb.d);if(pj.sy<this.HORIZON_Y||pj.sy>this.H)continue;const rx=this._roadX(bb.d);const rw=this.ROAD_W*pj.sc*W;const bx=W/2+rx+bb.side*rw*1.12;const bh=22*pj.sc,bw=50*pj.sc;ctx.fillStyle='#1a1a30';ctx.fillRect(bx-bw/2,pj.sy-bh,bw,bh);ctx.fillStyle=['#ff00ff','#00ffff','#ffaa00'][Math.floor(Math.random()*3)];ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=7*pj.sc;ctx.fillRect(bx-bw*0.35,pj.sy-bh*0.6,bw*0.7,bh*0.3);ctx.shadowBlur=0;}
  }

  _dObst(ctx){
    const W=this.W;const sorted=[...this.obstacles].sort((a,b)=>b.d-a.d);
    for(const o of sorted){if(o.d<=0||o.d>this.FAR_D+400)continue;const pj=this._proj(o.d);if(pj.sy<this.HORIZON_Y||pj.sy>this.H+20)continue;const rx=this._roadX(o.d);const rw=this.ROAD_W*pj.sc*W;const ox=W/2+rx+o.lat*rw*0.78;const bw=(o.type==='truck'?38:o.type==='racer'?20:27)*pj.sc*1.1;const bh=(o.type==='truck'?58:o.type==='racer'?30:42)*pj.sc*1.1;ctx.fillStyle=o.type==='truck'?'#ff9933':o.type==='racer'?'#ff2244':'#ff6644';ctx.fillRect(ox-bw/2,pj.sy-bh,bw,bh);ctx.fillStyle='rgba(20,20,40,0.6)';ctx.fillRect(ox-bw*0.28,pj.sy-bh*0.95,bw*0.56,bh*0.32);ctx.fillStyle='#ffff88';ctx.shadowColor='#ffff88';ctx.shadowBlur=3*pj.sc;ctx.fillRect(ox-bw*0.32,pj.sy-bh-2*pj.sc,bw*0.15,3*pj.sc);ctx.fillRect(ox+bw*0.18,pj.sy-bh-2*pj.sc,bw*0.15,3*pj.sc);ctx.shadowBlur=0;if(o.type==='racer'){ctx.fillStyle='#f00';ctx.beginPath();ctx.moveTo(ox,pj.sy-bh-5*pj.sc);ctx.lineTo(ox-5*pj.sc,pj.sy-bh-13*pj.sc);ctx.lineTo(ox+5*pj.sc,pj.sy-bh-13*pj.sc);ctx.closePath();ctx.fill();}}
  }

  // ===== 内饰: 精简座舱,方向盘大+清晰转动 =====
  _dCockpit(ctx){
    const W=this.W,H=this.H,p=this.player;
    const shake=(this.speed>0?this.speed*0.012:0)+(p.skid?2:0);
    const sx=p.skid?(Math.random()-0.5)*shake*3:(Math.sin(this.frame*0.25)*shake);
    const sy=p.skid?(Math.random()-0.5)*shake*1.5:0;

    // ---- 仪表台顶边 (一条横线) ----
    const dashY=H-105;
    ctx.fillStyle='#0d0d1a';ctx.fillRect(0,dashY,W,120);
    ctx.fillStyle='rgba(20,20,35,0.6)';
    ctx.fillRect(0,dashY,W,4);
    ctx.strokeStyle='rgba(255,0,255,0.12)';ctx.lineWidth=1;ctx.setLineDash([4,10]);
    ctx.beginPath();ctx.moveTo(W*0.15,dashY+12);ctx.lineTo(W*0.85,dashY+12);ctx.stroke();ctx.setLineDash([]);

    // ---- 引擎盖 (底部,很浅) ----
    ctx.fillStyle='#0d0d1d';
    ctx.beginPath();ctx.moveTo(W*0.3,dashY+25);ctx.quadraticCurveTo(W*0.32,H-20,W*0.36,H+5);ctx.lineTo(W*0.64,H+5);ctx.quadraticCurveTo(W*0.68,H-20,W*0.7,dashY+25);ctx.closePath();ctx.fill();
    const hg=ctx.createLinearGradient(W/2,dashY,W/2,H);
    hg.addColorStop(0,'rgba(30,30,45,0.3)');hg.addColorStop(0.6,'rgba(20,20,35,0.15)');hg.addColorStop(1,'rgba(10,10,20,0.7)');
    ctx.fillStyle=hg;ctx.fillRect(W*0.32,dashY+20,W*0.36,H-dashY-15);
    ctx.strokeStyle='rgba(255,255,255,0.03)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(W/2+sx*0.3,dashY+25);ctx.lineTo(W/2,H-8);ctx.stroke();

    // ===== 方向盘 (大、醒目、清晰转动) =====
    const wCX=W/2+sx,wCY=H-68+sy;
    ctx.save();ctx.translate(wCX,wCY);

    // 转向幅度加大 → 更明显
    const steerVis=p.steer*Math.PI*0.5; // ±90°, 非常清晰的转动
    ctx.rotate(steerVis);

    const wrX=65,wrY=24; // 椭圆, 横向略扁

    // 外环阴影
    ctx.shadowColor='rgba(0,0,0,0.5)';ctx.shadowBlur=10;
    ctx.fillStyle='#1a1a1a';
    ctx.beginPath();ctx.ellipse(0,2,wrX,wrY,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;

    // 外环
    ctx.strokeStyle='#444';ctx.lineWidth=4;
    ctx.beginPath();ctx.ellipse(0,0,wrX,wrY,0,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle='#555';ctx.lineWidth=2.5;
    ctx.beginPath();ctx.ellipse(0,0,wrX-3,wrY-3,0,0,Math.PI*2);ctx.stroke();
    // 缝合线高光
    ctx.strokeStyle='#666';ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(0,0,wrX-5,wrY-5,0,0,Math.PI*2);ctx.stroke();

    // 内环
    ctx.strokeStyle='#333';ctx.lineWidth=5;
    ctx.beginPath();ctx.ellipse(0,0,wrX-11,wrY-9,0,0,Math.PI*2);ctx.stroke();

    // 3辐条
    ctx.strokeStyle='#4a4a4a';ctx.lineWidth=5;
    ctx.beginPath();ctx.moveTo(-16,6);ctx.lineTo(-wrX+8,wrY-1);ctx.stroke();
    ctx.beginPath();ctx.moveTo(16,6);ctx.lineTo(wrX-8,wrY-1);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,13);ctx.lineTo(0,wrY-1);ctx.stroke();

    // 中心hub
    ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(0,0,16,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#555';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,16,0,Math.PI*2);ctx.stroke();
    // hub标志
    ctx.fillStyle='#ff00ff';ctx.shadowColor='#ff00ff';ctx.shadowBlur=10;
    ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#fff';ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('NR',0,0);

    // 顶部回正标记条 (黄)
    ctx.fillStyle='#ffdd00';ctx.shadowColor='#ffdd00';ctx.shadowBlur=4;
    ctx.fillRect(-4,-wrY-1,8,5);ctx.shadowBlur=0;

    // ===== 双手 =====
    ctx.fillStyle='#d4a574';ctx.strokeStyle='#b8956a';ctx.lineWidth=2;
    // 左手
    ctx.beginPath();ctx.arc(-wrX,5,10,0,Math.PI*2);ctx.fill();ctx.stroke();
    // 右手
    ctx.beginPath();ctx.arc(wrX,5,10,0,Math.PI*2);ctx.fill();ctx.stroke();
    // 手指线
    ctx.strokeStyle='#b8956a';ctx.lineWidth=1;
    for(let s=-1;s<=1;s+=2){for(let f=-1;f<=1;f++){ctx.beginPath();ctx.moveTo(s*wrX+f*3,8-f*2);ctx.lineTo(s*wrX+f*3,16-f);ctx.stroke();}}

    ctx.restore();

    // ===== 转向柱底座 =====
    ctx.fillStyle='#111';ctx.beginPath();
    ctx.moveTo(wCX-10,wCY-22);ctx.lineTo(wCX+10,wCY-22);
    ctx.lineTo(wCX+6,dashY+10);ctx.lineTo(wCX-6,dashY+10);
    ctx.closePath();ctx.fill();

    // ===== 双炮筒仪表 (放在方向盘后方两侧) =====
    const gY=dashY+38;
    this._gauge(ctx,W*0.25,gY,24,this.speed/this.maxSpeed,'RPM','#00ffff','#006688');
    this._gauge(ctx,W*0.75,gY,24,this.displaySpeed/300,'KMH','#ff00ff','#880066');

    // ===== 后视镜 ----
    ctx.fillStyle='#1a1a28';ctx.strokeStyle='#444';ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(W/2-20,this.HORIZON_Y-36,40,16,9);ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(15,25,50,0.6)';ctx.beginPath();ctx.roundRect(W/2-19,this.HORIZON_Y-35,38,14,8);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.05)';ctx.beginPath();ctx.roundRect(W/2-17,this.HORIZON_Y-34,14,5,3);ctx.fill();
    ctx.fillStyle='#333';ctx.fillRect(W/2-2,this.HORIZON_Y-40,4,6);

    // ===== A柱 =====
    ctx.fillStyle='#0a0a16';
    ctx.beginPath();ctx.moveTo(0,this.HORIZON_Y-38);ctx.lineTo(W*0.06,this.HORIZON_Y-22);ctx.lineTo(W*0.2,dashY-10);ctx.lineTo(W*0.06,dashY-5);ctx.lineTo(0,dashY+10);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(W,this.HORIZON_Y-38);ctx.lineTo(W*0.94,this.HORIZON_Y-22);ctx.lineTo(W*0.8,dashY-10);ctx.lineTo(W*0.94,dashY-5);ctx.lineTo(W,dashY+10);ctx.closePath();ctx.fill();
    // 遮阳带
    ctx.fillStyle='rgba(5,5,15,0.5)';ctx.fillRect(0,this.HORIZON_Y-40,W,18);
  }

  // 仪表
  _gauge(ctx,cx,cy,r,val,label,accent,dim){
    const pct=Math.min(1,Math.max(0,val));
    ctx.fillStyle='#0a0a16';ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#333';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
    const sa=Math.PI*0.75,ea=Math.PI*2.25;
    ctx.strokeStyle='#2a2a3e';ctx.lineWidth=r*0.25;ctx.lineCap='round';ctx.beginPath();ctx.arc(cx,cy,r*0.6,sa,ea);ctx.stroke();
    const sweep=pct*(ea-sa);
    ctx.strokeStyle=accent;ctx.shadowColor=accent;ctx.shadowBlur=5;ctx.beginPath();ctx.arc(cx,cy,r*0.6,sa,sa+sweep);ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle='#fff';ctx.font=`bold ${Math.floor(r*0.4)}px monospace`;ctx.textAlign='center';ctx.fillText(String(Math.round(val*100)),cx,cy+r*0.18);
    ctx.fillStyle=dim;ctx.font=`${Math.floor(r*0.23)}px monospace`;ctx.fillText(label,cx,cy+r*0.5);
    ctx.save();ctx.translate(cx,cy);ctx.rotate(sa+sweep);ctx.strokeStyle=accent;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-r*0.12,0);ctx.lineTo(r*0.5,0);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,2,0,Math.PI*2);ctx.fill();ctx.restore();
  }

  _dParts(ctx){
    for(const pp of this.particles){ctx.fillStyle=pp.color;ctx.globalAlpha=Math.min(1,pp.life/40);ctx.beginPath();ctx.arc(pp.x,pp.y,2,0,Math.PI*2);ctx.fill();}
    for(const pp of this.smoke){ctx.fillStyle=`rgba(180,180,200,${pp.life/25*0.3})`;ctx.beginPath();ctx.arc(pp.x,pp.y,pp.r,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=1;
  }

  _dHUD(ctx){
    const W=this.W,H=this.H,p=this.player;
    // 生命
    ctx.textAlign='left';ctx.font='18px sans-serif';ctx.fillText('❤️'.repeat(this.lives)+'🖤'.repeat(3-this.lives),10,this.HORIZON_Y-15);
    // 分数
    ctx.textAlign='right';ctx.font='bold 13px monospace';ctx.fillStyle='#ff00ff';ctx.shadowColor='#ff00ff';ctx.shadowBlur=6;ctx.fillText('🏆 '+String(this.score),W-10,this.HORIZON_Y-15);ctx.shadowBlur=0;
    // 打滑
    if(p.skid){ctx.textAlign='center';ctx.font='bold 14px sans-serif';ctx.fillStyle='#ff4488';ctx.shadowColor='#ff4488';ctx.shadowBlur=10;ctx.fillText('⚠ 打滑漂移！',W/2,H-120);ctx.shadowBlur=0;}
    // 操作提示
    ctx.textAlign='center';ctx.font='10px sans-serif';ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillText('↑油门  ↓刹车  ←→转向',W/2,H-6);
    // 高速速度线
    if(this.speed>180){ctx.strokeStyle='rgba(255,255,255,0.1)';for(let i=0;i<5;i++){ctx.lineWidth=1+Math.random();ctx.beginPath();const lx=W*0.2+Math.random()*W*0.6;ctx.moveTo(lx,this.HORIZON_Y);ctx.lineTo(lx+(Math.random()-0.5)*25,this.HORIZON_Y+Math.random()*40);ctx.stroke();}}

    // 转向位置指示器 (底部中央) — 清楚显示车在路上哪个位置
    const indW=140,indH=6,indX=W/2-indW/2,indY=H-16;
    ctx.fillStyle='rgba(255,255,255,0.08)';ctx.fillRect(indX-10,indY-4,indW+20,indH+12);
    // 路面条
    ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(indX,indY,indW,indH);
    // 车道线
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.fillRect(indX+indW*0.5-1,indY-2,2,indH+4);
    ctx.fillRect(indX+indW*0.25-0.5,indY,1,indH);
    ctx.fillRect(indX+indW*0.75-0.5,indY,1,indH);
    // 车位置 (反向: -x → 右边偏)
    const carPosX=indX+indW/2-p.x*indW*0.48;
    ctx.fillStyle='#00ffff';ctx.shadowColor='#00ffff';ctx.shadowBlur=8;
    ctx.fillRect(carPosX-5,indY-3,10,indH+6);
    ctx.fillStyle=p.skid?'#ff4488':'#ffffff';ctx.fillRect(carPosX-1.5,indY-2,3,indH+4);
    ctx.shadowBlur=0;
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  const cv=document.getElementById('gameCanvas');const game=new Game(cv);game._draw();
  document.getElementById('btnStart').addEventListener('click',e=>{e.stopPropagation();game.start();});
  document.getElementById('btnRestart').addEventListener('click',e=>{e.stopPropagation();game.start();});
  function resize(){const mw=Math.min(window.innerWidth-10,800);const sc=mw/800;cv.style.width=mw+'px';cv.style.height=(500*sc)+'px';}
  window.addEventListener('resize',resize);resize();
});
