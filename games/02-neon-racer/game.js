/**
 * 霓虹极速 (Neon Racer) v2.0
 * TOMMY 游戏厅 - 游戏 #02
 *
 * 伪3D第一人称赛车 — 正确透视，前方来车
 * ↑油门 ↓刹车 ←→转向  高速急转打滑漂移
 */
'use strict';

// roundRect polyfill
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x,y,w,h,r) {
    if (typeof r === 'number') r = {tl:r,tr:r,br:r,bl:r};
    this.beginPath();
    this.moveTo(x+r.tl,y); this.lineTo(x+w-r.tr,y);
    this.quadraticCurveTo(x+w,y,x+w,y+r.tr);
    this.lineTo(x+w,y+h-r.br);
    this.quadraticCurveTo(x+w,y+h,x+w-r.br,y+h);
    this.lineTo(x+r.bl,y+h);
    this.quadraticCurveTo(x,y+h,x,y+h-r.bl);
    this.lineTo(x,y+r.tl);
    this.quadraticCurveTo(x,y,x+r.tl,y);
    this.closePath();
  };
}

// ============================================================
// 音效引擎
// ============================================================
const SoundEngine = (()=>{
  let ctx=null;
  function c(){if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx;}
  function t(freq,type,dur,vol=0.08,ramp=true){
    const a=c(),o=a.createOscillator(),g=a.createGain();
    o.type=type;o.frequency.value=freq;
    g.gain.setValueAtTime(vol,a.currentTime);
    if(ramp)g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+dur);
    o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+dur);
  }
  function n(dur,vol=0.04){
    const a=c(),buf=a.createBuffer(1,a.sampleRate*dur,a.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const s=a.createBufferSource(),g=a.createGain();
    s.buffer=buf;g.gain.setValueAtTime(vol,a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+dur);
    s.connect(g).connect(a.destination);s.start();s.stop(a.currentTime+dur);
  }
  return{
    accelerate:()=>{t(80,'sawtooth',0.15,0.05);t(120,'square',0.1,0.04);},
    brake:()=>n(0.12,0.05),
    crash:()=>{t(50,'sawtooth',0.4,0.2);t(30,'triangle',0.5,0.25);n(0.3,0.1);},
    skid:()=>{n(0.15,0.06);t(200,'sawtooth',0.1,0.03);},
    engine:(f)=>{t(f,'sawtooth',0.08,0.03,false);},
    init:()=>c(),getCtx:()=>c(),
  };
})();

// ============================================================
// BGM — Synthwave
// ============================================================
const BGM=(()=>{
  const P=140,BD=60/P,LP=16,LD=BD*LP;
  let mg=null,r=false,ti=null,ns=0,an=[];
  const N={C2:65,D2:73,E2:82,F2:87,G2:98,A2:110,B2:123,C3:131,D3:147,E3:165,F3:175,G3:196,A3:220,B3:247,C4:262,D4:294,E4:330,F4:349,G4:392,A4:440,B4:494,C5:523,D5:587,E5:659,F5:698,G5:784,A5:880,B5:988};
  function pn(f,type,st,dur,vol=0.04){
    if(!f||f<=0)return;
    try{
      const a=SoundEngine.getCtx();if(!mg||!a)return;
      const o=a.createOscillator(),g=a.createGain();
      o.type=type;o.frequency.value=f;
      g.gain.setValueAtTime(0,st);g.gain.linearRampToValueAtTime(vol,st+0.01);
      g.gain.setValueAtTime(vol,st+dur*0.7);g.gain.exponentialRampToValueAtTime(0.001,st+dur);
      o.connect(g).connect(mg);o.start(st);o.stop(st+dur+0.05);
      an.push(o,g);
    }catch(_){}
  }
  function sl(st){const T=b=>st+b*BD;
    [N.C2,N.C2,N.G2,N.G2,N.A2,N.A2,N.F2,N.F2,N.C2,N.C2,N.G2,N.G2,N.A2,N.A2,N.A2,N.A2].forEach((n,i)=>pn(n,'sawtooth',T(i),0.85,0.05));
    [N.C4,N.E4,N.G4,N.C5,N.D4,N.F4,N.A4,N.D5,N.C4,N.E4,N.G4,N.C5,N.G3,N.C4,N.E4,N.G4].forEach((n,i)=>pn(n,'square',T(i),0.2,0.028));
    [{b:0,n:N.C5,d:0.3},{b:1,n:N.G4,d:0.3},{b:2,n:N.A4,d:0.3},{b:3,n:N.F4,d:0.5},{b:4,n:N.G4,d:0.3},{b:5,n:N.E4,d:0.3},{b:6,n:N.C4,d:0.5},{b:8,n:N.C5,d:0.3},{b:9,n:N.G5,d:0.3},{b:10,n:N.A5,d:0.3},{b:11,n:N.F5,d:0.5},{b:12,n:N.G5,d:0.3},{b:13,n:N.E5,d:0.3},{b:14,n:N.C5,d:0.5}].forEach(l=>pn(l.n,'square',T(l.b),l.d,0.035));
    for(let i=0;i<16;i+=2)pn(200,'triangle',T(i+1),0.08,0.06);
    for(let i=0;i<16;i+=4)pn(60,'sine',T(i),0.3,0.08);
  }
  function scl(){if(!r)return;const n=SoundEngine.getCtx().currentTime;while(ns<n+0.3){sl(ns);ns+=LD;}ti=setTimeout(scl,LD*500);}
  return{
    start(){if(r)return;SoundEngine.init();
      if(!mg){mg=SoundEngine.getCtx().createGain();mg.gain.value=0.55;mg.connect(SoundEngine.getCtx().destination);}
      else{mg.gain.cancelScheduledValues(SoundEngine.getCtx().currentTime);mg.gain.setValueAtTime(mg.gain.value,SoundEngine.getCtx().currentTime);mg.gain.linearRampToValueAtTime(0.55,SoundEngine.getCtx().currentTime+0.15);}
      r=true;an=[];ns=SoundEngine.getCtx().currentTime+0.05;scl();
    },
    stop(){r=false;if(ti){clearTimeout(ti);ti=null;}if(mg)mg.gain.linearRampToValueAtTime(0,SoundEngine.getCtx().currentTime+0.3);},
  };
})();

// ============================================================
// 主游戏类
// ============================================================
class Game {
  constructor(canvas) {
    this.cv=canvas;this.ctx=canvas.getContext('2d');
    this.W=canvas.width;this.H=canvas.height;

    // --- 核心: 3D 投影 ---
    // 距离 d > 0 = 车前方的距离. d=0=车头, d=∞=地平线
    // screenY(d) = VY + (H-VY) * FOCUS/(d+FOCUS)
    // roadWidth(d) = roadHalf * scale(d) * W  where scale=FOCUS/(d+FOCUS)
    this.VY=Math.floor(this.H*0.34); // 消失点Y
    this.FOCUS=300;

    // 预计算路面切片 — 从消失点到屏幕底部均匀分布
    this.roadStrips=[];
    this._buildRoadStrips();

    // --- 游戏状态 ---
    this.score=0;
    this.highScore=parseInt(localStorage.getItem('racerHighScore')||'0',10);
    this.gameOver=false;this.started=false;this.frame=0;

    // --- 驾驶 ---
    this.speed=0;
    this.maxSpeed=120;
    this.accel=2.5;
    this.brakeForce=6;
    this.friction=0.4;
    this.speedKm=0; // 仪表显示平滑值

    // --- 转向物理 ---
    this.player={
      x:0,          // 横向偏移 (-1~1 相对于路面)
      steer:0,      // 方向盘角度 (-1~1)
      yaw:0,        // 车身偏航
      skid:false,   // 是否打滑
      skidT:0,
    };
    this.steerSpeed=0.06;
    this.steerReturn=0.08;
    this.yawReturn=0.12;
    this.skidThresh=80;

    // --- 生命 ---
    this.lives=3;
    this.invincible=0;

    // --- 弯道 ---
    this.curve=0;this.targetCurve=0;this.curveTimer=0;

    // --- 障碍物: 每个有 distance (d, 前方距离) ---
    this.obstacles=[];
    this.spawnTimer=0;
    this.spawnInterval=120;
    this.FAR_D=2000;  // 远处生成距离
    this.NEAR_D=15;   // 碰撞判定距离

    // --- 装饰 ---
    this.stars=[];this._initStars();
    this.buildings=[];this._initBuildings();
    this.lampposts=[];
    this.billboards=[];

    // --- 粒子 ---
    this.particles=[];
    this.smoke=[];

    // --- 输入 ---
    this.keys={};
    this._bindEvents();
  }

  // ========== 构建路面切片 ==========
  _buildRoadStrips() {
    // 在屏幕 Y 上均匀分布 ~300 条，每条映射到世界距离 d
    const n=300;
    this.roadStrips=[];
    for (let i=0;i<=n;i++) {
      const sy=this.VY+i*(this.H-this.VY)/n;
      // 逆推: sy = VY + (H-VY)*FOCUS/(d+FOCUS)
      // d = (H-VY)*FOCUS/(sy-VY) - FOCUS
      const denom=sy-this.VY;
      const d=denom>0?((this.H-this.VY)*this.FOCUS/denom-this.FOCUS):999999;
      // scale = FOCUS/(d+FOCUS)
      const sc=denom>0?(this.FOCUS/(d+this.FOCUS)):0;
      this.roadStrips.push({sy,d,sc});
    }
    this.FAR_D=this.roadStrips[Math.floor(n*0.03)].d; // ~3% 位置作为最远
  }

  // ---- 投影函数 ----
  _proj(d) {
    if (d<=0) return {sy:this.H,sc:1};
    const sc=this.FOCUS/(d+this.FOCUS);
    const sy=this.VY+(this.H-this.VY)*sc;
    return {sy:Math.min(sy,this.H+50),sc:Math.min(sc,1.2)};
  }

  // ---- 弯道偏移 ----
  _roadX(d) {
    return this.curve*d*d*0.0005;
  }

  // ========== 初始化 ==========
  _initStars() {
    for (let l=0;l<3;l++) for (let i=0;i<40;i++) {
      this.stars.push({x:Math.random()*this.W,y:Math.random()*this.VY,r:Math.random()*(l===0?1.2:l===1?1.8:2.5),tw:Math.random()*Math.PI*2,sp:0.2+l*0.3,ly:l,op:0.4+l*0.3});
    }
  }
  _initBuildings() {
    // 远层
    for (let i=0;i<30;i++) {
      this.buildings.push({x:Math.random()*this.W*1.3-this.W*0.15,w:Math.random()*40+15,h:Math.random()*80+40,ly:0,ws:Array.from({length:Math.floor(Math.random()*6)},()=>({x:Math.random()*0.7+0.1,y:Math.random()*0.7+0.1,on:Math.random()>0.4})),neon:Math.random()>0.7?['#ff00ff','#00ffff','#ff4488','#ffaa00'][Math.floor(Math.random()*4)]:null});
    }
    // 近层
    for (let i=0;i<20;i++) {
      this.buildings.push({x:Math.random()*this.W*1.2-this.W*0.1,w:Math.random()*70+30,h:Math.random()*120+60,ly:1,ws:Array.from({length:Math.floor(Math.random()*10)},()=>({x:Math.random()*0.7+0.1,y:Math.random()*0.7+0.1,on:Math.random()>0.35})),neon:Math.random()>0.5?['#ff00ff','#00ffff','#ff4488','#ffaa00'][Math.floor(Math.random()*4)]:null});
    }
  }

  // ========== 事件 ==========
  _bindEvents() {
    window.addEventListener('keydown',e=>{
      if(!e.key.startsWith('Arrow'))return;
      e.preventDefault();this.keys[e.key]=true;
      if(!this.started&&!this.gameOver){this.start();return;}
    });
    window.addEventListener('keyup',e=>{
      if(!e.key.startsWith('Arrow'))return;
      e.preventDefault();this.keys[e.key]=false;
    });
    this.cv.addEventListener('touchstart',e=>{
      e.preventDefault();SoundEngine.init();
      if(!this.started&&!this.gameOver){this.start();return;}
      if(this.gameOver)return;
      const x=(e.touches[0].clientX-this.cv.getBoundingClientRect().left)/this.cv.getBoundingClientRect().width;
      if(x<0.4)this.keys.ArrowLeft=true;else if(x>0.6)this.keys.ArrowRight=true;else this.keys.ArrowUp=true;
    },{passive:false});
    this.cv.addEventListener('touchend',e=>{e.preventDefault();this.keys={};},{passive:false});
    this.cv.addEventListener('touchmove',e=>{
      e.preventDefault();this.keys={};
      const x=(e.touches[0].clientX-this.cv.getBoundingClientRect().left)/this.cv.getBoundingClientRect().width;
      if(x<0.4)this.keys.ArrowLeft=true;else if(x>0.6)this.keys.ArrowRight=true;else this.keys.ArrowUp=true;
    },{passive:false});
  }

  // ========== 开始 / 结束 ==========
  start() {
    this.started=true;this.gameOver=false;
    this.score=0;this.speed=80;this.frame=0;
    this.lives=3;this.invincible=0;
    const p=this.player;p.x=0;p.steer=0;p.yaw=0;p.skid=false;p.skidT=0;
    this.curve=0;this.targetCurve=0;this.curveTimer=0;
    this.obstacles=[];this.spawnTimer=0;
    this.particles=[];this.smoke=[];this.billboards=[];this.lampposts=[];
    this.speedKm=80;this.displaySpeed=80;
    document.getElementById('overlayStart').classList.add('hidden');
    document.getElementById('overlayEnd').classList.add('hidden');
    BGM.start();
    this._loop();
  }
  end() {
    this.gameOver=true;BGM.stop();SoundEngine.crash();
    if(this.score>this.highScore){this.highScore=this.score;localStorage.setItem('racerHighScore',String(this.highScore));}
    document.getElementById('finalSpeed').textContent=String(Math.round(this.displaySpeed));
    document.getElementById('finalScore').textContent=String(this.score);
    document.getElementById('finalHigh').textContent=String(this.highScore);
    document.getElementById('newRecord').classList.toggle('hidden',this.score<=this.highScore||this.score===0);
    document.getElementById('overlayEnd').classList.remove('hidden');
  }

  // ========== 主循环 ==========
  _loop() {
    if(this.gameOver)return;
    this.frame++;
    this._update();
    this._draw();
    requestAnimationFrame(()=>this._loop());
  }

  // ==========================================================
  // 更新逻辑
  // ==========================================================
  _update() {
    this._updateInput();
    this._updateSpeed();
    this._updateSteering();
    this._updatePhysics();
    this._updateCurve();
    this._updateObstacles();
    this._updateParticles();
    this._updateDecor();
  }

  _updateInput() {
    const k=this.keys;let ts=0;
    if(k.ArrowLeft)ts=-1;if(k.ArrowRight)ts=1;
    if(k.ArrowLeft&&k.ArrowRight)ts=0;
    this.player.targetSteer=ts;
  }

  _updateSpeed() {
    const k=this.keys;
    if(k.ArrowUp){this.speed+=this.accel;if(this.frame%4===0)SoundEngine.engine(60+this.speed*0.5);}
    if(k.ArrowDown){this.speed-=this.brakeForce;if(this.speed>60&&this.frame%8===0)SoundEngine.brake();}
    this.speed-=this.friction;
    this.speed=Math.max(0,Math.min(this.maxSpeed,this.speed));
    this.displaySpeed+=(this.speed-this.displaySpeed)*0.15;
    this.maxSpeed=120+Math.floor(this.score/100)*8;
    this.spawnInterval=Math.max(40,120-Math.floor(this.score/80));
  }

  _updateSteering() {
    const p=this.player;
    if(p.targetSteer!==0)p.steer+=p.targetSteer*this.steerSpeed;
    else{if(Math.abs(p.steer)<this.steerReturn)p.steer=0;else p.steer-=Math.sign(p.steer)*this.steerReturn;}
    p.steer=Math.max(-1,Math.min(1,p.steer));
  }

  _updatePhysics() {
    const p=this.player;const s=this.speed;

    // 打滑
    const sf=Math.abs(p.steer)*s;
    p.skid=sf>this.skidThresh;
    if(p.skid){p.skidT=20;if(this.frame%5===0)SoundEngine.skid();}
    if(p.skidT>0)p.skidT--;

    let gr=1;if(p.skid)gr=0.25;

    // 横向移动
    const lm=Math.sin(p.yaw)*s*0.0008+p.steer*s*0.012*gr*0.05;
    p.x+=lm;
    p.x=Math.max(-0.92,Math.min(0.92,p.x));

    // 偏航
    if(p.steer!==0)p.yaw+=p.steer*0.03*(s/120)*gr;
    else{if(Math.abs(p.yaw)<this.yawReturn)p.yaw=0;else p.yaw-=Math.sign(p.yaw)*this.yawReturn;}
    p.yaw=Math.max(-0.5,Math.min(0.5,p.yaw));

    if(this.invincible>0)this.invincible--;
  }

  _updateCurve() {
    this.curveTimer--;
    if(this.curveTimer<=0){this.curveTimer=100+Math.random()*200;const mc=Math.min(0.025,0.003+this.score*0.00003);this.targetCurve=(Math.random()-0.5)*2*mc;}
    this.curve+=(this.targetCurve-this.curve)*0.008;
  }

  // ==========================================================
  // 障碍物 (距离 d = 车前方多远)
  // ==========================================================
  _updateObstacles() {
    this.spawnTimer++;
    if(this.spawnTimer>=this.spawnInterval){this.spawnTimer=0;this._spawnObstacle();}
    const ws=this.speed*0.08; // 世界速度 — 障碍物向车靠近

    for (let i=this.obstacles.length-1;i>=0;i--) {
      const o=this.obstacles[i];
      o.d-=ws; // d 减小 → 靠近玩家

      // 通过玩家 (d < 0 = 超过车头)
      if(!o.scored&&o.d<0){o.scored=true;this.score+=10;}
      // 远离后方
      if(o.d<-30){this.obstacles.splice(i,1);}
    }

    if(this.invincible>0)return;
    for(const o of this.obstacles) {
      if(this._checkCol(o)){this._hit();break;}
    }
  }

  _spawnObstacle() {
    const types=this.score<200?['car']:this.score<400?['car','truck']:['car','truck','racer'];
    const type=types[Math.floor(Math.random()*types.length)];
    // 在远处生成 d 大 = 远
    const d=this.FAR_D+Math.random()*500;
    let lat=(Math.random()-0.5)*1.4;
    // 避免和已存在障碍重叠
    for(const o of this.obstacles){if(Math.abs(o.d-d)<300&&Math.abs(o.lat-lat)<0.25)lat=(Math.random()-0.5)*1.4;}
    this.obstacles.push({type,lat,d,scored:false,sp:type==='truck'?0.3:type==='racer'?2+Math.random()*2:Math.random()*1.5});
  }

  _checkCol(o) {
    // 只在近距离做碰撞
    if(o.d<this.NEAR_D||o.d>80)return false;
    const pj=this._proj(o.d);
    const rx=this._roadX(o.d);
    const rw=0.5*pj.sc*this.W;
    const ox=this.W/2+rx+o.lat*rw*0.85;
    const ow=(o.type==='truck'?40:o.type==='racer'?22:30)*pj.sc*1.2;
    const oh=(o.type==='truck'?65:o.type==='racer'?35:50)*pj.sc*1.2;

    const pw=40,ph=70;
    const px=this.W/2+this.player.x*(0.5*0.85*this.W)-pw/2;
    const py=this.H-ph-20;
    const pad=6;
    return px+pad<ox+ow/2-pad&&px+pw-pad>ox-ow/2+pad&&py+pad<pj.sy+oh/2-pad&&py+ph-pad>pj.sy-oh/2+pad;
  }

  _hit() {
    if(this.invincible>0)return;
    this.lives--;this.invincible=90;
    for(let i=0;i<30;i++)this.particles.push({x:this.W/2,y:this.H-60,vx:(Math.random()-0.5)*8,vy:(Math.random()-0.5)*8-4,life:30+Math.random()*20,color:['#ff00ff','#ff4488','#ffaa00','#fff'][Math.floor(Math.random()*4)]});
    if(this.lives<=0)this.end();else SoundEngine.crash();
  }

  // ==========================================================
  // 粒子
  // ==========================================================
  _updateParticles() {
    const p=this.player;
    if(this.speed>150&&this.frame%2===0){
      const cx=this.W/2+p.x*150,cy=this.H-50+Math.random()*20;
      this.particles.push({x:cx+(Math.random()-0.5)*100,y:cy,vx:(Math.random()-0.5)*2,vy:-Math.random()*6-this.speed*0.02,life:15+Math.random()*10,color:p.skid?'#ff4488':['#ff00ff','#00ffff'][Math.floor(Math.random()*2)]});
    }
    if(this.frame%3===0){
      const cx=this.W/2+p.x*150;
      this.smoke.push({x:cx+(Math.random()-0.5)*20,y:this.H-45,vx:(Math.random()-0.5)*0.5,vy:-Math.random()-0.5,life:10+Math.random()*10,r:2+Math.random()*3});
    }
    if(p.skid&&this.frame%2===0){
      for(let i=0;i<2;i++)this.smoke.push({x:this.W/2+p.x*150+(Math.random()-0.5)*60,y:this.H-30+Math.random()*10,vx:(Math.random()-0.5)*3,vy:-Math.random()*2-1,life:15+Math.random()*15,r:4+Math.random()*5});
    }
    for(const arr of[this.particles,this.smoke]){for(let i=arr.length-1;i>=0;i--){const pp=arr[i];pp.x+=pp.vx;pp.y+=pp.vy;pp.life--;if(pp.life<=0)arr.splice(i,1);}}
  }

  _updateDecor() {
    const ws=this.speed*0.08;
    if(this.frame%Math.max(10,40-Math.floor(this.speed/10))===0)this.lampposts.push({d:this.FAR_D+Math.random()*200,side:Math.random()>0.5?1:-1});
    for(let i=this.lampposts.length-1;i>=0;i--){this.lampposts[i].d-=ws;if(this.lampposts[i].d<-50)this.lampposts.splice(i,1);}
    if(this.frame%180===0&&this.score>150)this.billboards.push({d:this.FAR_D+Math.random()*300,side:Math.random()>0.5?1:-1});
    for(let i=this.billboards.length-1;i>=0;i--){this.billboards[i].d-=ws;if(this.billboards[i].d<-50)this.billboards.splice(i,1);}
  }

  // ==========================================================
  // 绘制
  // ==========================================================
  _draw() {
    const ctx=this.ctx,W=this.W,H=this.H;
    ctx.clearRect(0,0,W,H);
    this._drawSky(ctx);
    this._drawCity(ctx);
    this._drawRoad(ctx);
    this._drawDecor(ctx);
    this._drawObstacles(ctx);
    this._drawPlayer(ctx);
    this._drawParticles(ctx);
    this._drawHUD(ctx);
  }

  // ---- 天空 ----
  _drawSky(ctx) {
    const grad=ctx.createLinearGradient(0,0,0,this.VY+30);
    grad.addColorStop(0,'#0a0a2e');grad.addColorStop(0.5,'#1a0a3e');grad.addColorStop(1,'#2a1040');
    ctx.fillStyle=grad;ctx.fillRect(0,0,this.W,this.VY+30);
    // 月亮
    ctx.fillStyle='#ffddaa';ctx.shadowColor='rgba(255,200,150,0.4)';ctx.shadowBlur=40;
    ctx.beginPath();ctx.arc(this.W-100,60,35,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    // 星星
    for(const s of this.stars){
      const tw=0.5+0.5*Math.sin(this.frame*0.02+s.tw);
      ctx.fillStyle=`rgba(255,255,255,${s.op*tw})`;
      ctx.beginPath();const sx=(s.x-this.frame*s.sp*0.05)%this.W;
      ctx.arc(sx<0?sx+this.W:sx,s.y,s.r,0,Math.PI*2);ctx.fill();
    }
  }

  // ---- 城市 ----
  _drawCity(ctx) {
    const fogGrad=ctx.createLinearGradient(0,this.VY-30,0,this.VY+60);
    fogGrad.addColorStop(0,'rgba(10,10,46,0)');fogGrad.addColorStop(0.5,'rgba(20,10,50,0.35)');fogGrad.addColorStop(1,'rgba(20,10,50,0.85)');
    ctx.fillStyle=fogGrad;ctx.fillRect(0,this.VY-30,this.W,90);
    for(const b of this.buildings){
      const sp=b.ly===0?0.15:0.4;
      const bky=this.VY-b.h+(b.ly===0?20:10);
      const bx=((b.x-this.frame*sp)%(this.W+b.w+200))-100;
      if(bx<-b.w||bx>this.W+b.w)continue;
      ctx.fillStyle=b.ly===0?'#0d0d1a':'#1a1a30';ctx.fillRect(bx,bky,b.w,b.h);
      for(const w of b.ws){
        if(!w.on)continue;
        const wx=bx+w.x*b.w,wy=bky+w.y*b.h;
        const fl=Math.sin(wx*10+this.frame*0.05)>0?1:0.5;
        ctx.fillStyle=Math.random()>0.9?`rgba(255,136,68,${0.6*fl})`:`rgba(255,221,102,${0.5*fl})`;
        ctx.fillRect(wx,wy,3,4);
      }
      if(b.neon&&b.ly===1){
        const nx=bx+b.w*0.2,ny=bky+b.h*0.1;
        ctx.fillStyle=b.neon;ctx.shadowColor=b.neon;ctx.shadowBlur=6+Math.sin(this.frame*0.1)*3;
        ctx.fillRect(nx,ny,b.w*0.6,4);ctx.shadowBlur=0;
      }
    }
  }

  // ---- 道路 (梯形透视切片) ----
  _drawRoad(ctx) {
    const W=this.W,H=this.H;
    const strips=this.roadStrips;

    for (let i=0;i<strips.length-1;i++) {
      const s1=strips[i],s2=strips[i+1];
      if (s2.sy<this.VY-10) continue;

      const rx1=this._roadX(s1.d);
      const rx2=this._roadX(s2.d);
      const rw1=0.5*s1.sc*W;
      const rw2=0.5*s2.sc*W;

      // 路面
      const br=0.2+s1.sc*0.28;
      ctx.fillStyle=`rgb(${Math.floor(38*br)},${Math.floor(38*br)},${Math.floor(58*br)})`;
      // 梯形
      const topLeft=W/2+rx1-rw1,topRight=W/2+rx1+rw1;
      const botLeft=W/2+rx2-rw2,botRight=W/2+rx2+rw2;
      ctx.beginPath();ctx.moveTo(topLeft,s1.sy);ctx.lineTo(topRight,s1.sy);
      ctx.lineTo(botRight,s2.sy);ctx.lineTo(botLeft,s2.sy);ctx.closePath();ctx.fill();

      // 路肩
      const sh1=rw1*0.07,sh2=rw2*0.07;
      const red=(Math.floor(s1.d/8)%2===0);
      ctx.fillStyle=red?'#ff3344':'rgba(255,255,255,0.4)';
      ctx.beginPath();ctx.moveTo(topLeft-sh1,s1.sy);ctx.lineTo(topLeft,s1.sy);
      ctx.lineTo(botLeft,s2.sy);ctx.lineTo(botLeft-sh2,s2.sy);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(topRight,s1.sy);ctx.lineTo(topRight+sh1,s1.sy);
      ctx.lineTo(botRight+sh2,s2.sy);ctx.lineTo(botRight,s2.sy);ctx.closePath();ctx.fill();

      // 车道中心虚线
      if(Math.floor(s1.d/10)%2===0){
        ctx.strokeStyle=`rgba(255,255,255,${0.35+s1.sc*0.35})`;
        ctx.lineWidth=Math.max(1,2*s1.sc);
        ctx.beginPath();ctx.moveTo(W/2+rx1,s1.sy);ctx.lineTo(W/2+rx2,s2.sy);ctx.stroke();
      }

      // 霓虹灯带 (每 8 条画一次)
      if(i%8===0){
        ctx.shadowColor='#ff00ff';ctx.shadowBlur=12*s1.sc;
        ctx.strokeStyle='#ff00ff';ctx.lineWidth=3*s1.sc;
        ctx.beginPath();ctx.moveTo(topLeft,s1.sy);ctx.lineTo(botLeft,s2.sy);ctx.stroke();
        ctx.shadowColor='#00ffff';ctx.strokeStyle='#00ffff';
        ctx.beginPath();ctx.moveTo(topRight,s1.sy);ctx.lineTo(botRight,s2.sy);ctx.stroke();
        ctx.shadowBlur=0;
      }
    }
  }

  // ---- 装饰 (灯柱+广告牌) ----
  _drawDecor(ctx) {
    const W=this.W;
    for(const lp of this.lampposts){
      if(lp.d<=0||lp.d>this.FAR_D+500)continue;
      const pj=this._proj(lp.d);
      if(pj.sy<this.VY||pj.sy>this.H)continue;
      const rx=this._roadX(lp.d);
      const rw=0.5*pj.sc*W;
      const lx=W/2+rx+lp.side*rw*1.15;
      ctx.fillStyle='#334';ctx.fillRect(lx-2*pj.sc,pj.sy-70*pj.sc,4*pj.sc,70*pj.sc);
      ctx.fillStyle='#ffddaa';ctx.shadowColor='rgba(255,200,100,0.5)';ctx.shadowBlur=15*pj.sc;
      ctx.beginPath();ctx.arc(lx,pj.sy-70*pj.sc,7*pj.sc,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    }
    for(const bb of this.billboards){
      if(bb.d<=0||bb.d>this.FAR_D+500)continue;
      const pj=this._proj(bb.d);
      if(pj.sy<this.VY||pj.sy>this.H)continue;
      const rx=this._roadX(bb.d);
      const rw=0.5*pj.sc*W;
      const bx=W/2+rx+bb.side*rw*1.12;
      const bh=25*pj.sc,bw=55*pj.sc;
      ctx.fillStyle='#1a1a30';ctx.fillRect(bx-bw/2,pj.sy-bh,bw,bh);
      ctx.fillStyle=['#ff00ff','#00ffff','#ffaa00'][Math.floor(Math.random()*3)];
      ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=8*pj.sc;
      ctx.fillRect(bx-bw*0.35,pj.sy-bh*0.6,bw*0.7,bh*0.3);ctx.shadowBlur=0;
    }
  }

  // ---- 障碍车 ----
  _drawObstacles(ctx) {
    const W=this.W;
    // 按距离排序: 远的先画
    const sorted=[...this.obstacles].sort((a,b)=>b.d-a.d);
    for(const o of sorted){
      if(o.d<=0||o.d>this.FAR_D+500)continue;
      const pj=this._proj(o.d);
      if(pj.sy<this.VY||pj.sy>this.H+30)continue;
      const rx=this._roadX(o.d);
      const rw=0.5*pj.sc*W;
      const ox=W/2+rx+o.lat*rw*0.85;
      const bw=(o.type==='truck'?40:o.type==='racer'?22:30)*pj.sc*1.2;
      const bh=(o.type==='truck'?65:o.type==='racer'?35:50)*pj.sc*1.2;

      // 车身
      ctx.fillStyle=o.type==='truck'?'#ff9933':o.type==='racer'?'#ff2244':'#ff6644';
      ctx.fillRect(ox-bw/2,pj.sy-bh,bw,bh);
      // 车窗
      ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(ox-bw*0.3,pj.sy-bh,bw*0.6,bh*0.35);
      // 尾灯
      ctx.fillStyle=o.type==='racer'?'#fff':'#f00';
      ctx.fillRect(ox-bw*0.35,pj.sy-bh*0.15,bw*0.15,bh*0.1);
      ctx.fillRect(ox+bw*0.2,pj.sy-bh*0.15,bw*0.15,bh*0.1);
      // 逆行箭头
      if(o.type==='racer'){ctx.fillStyle='#f00';ctx.beginPath();ctx.moveTo(ox,pj.sy-bh-5*pj.sc);ctx.lineTo(ox-6*pj.sc,pj.sy-bh-14*pj.sc);ctx.lineTo(ox+6*pj.sc,pj.sy-bh-14*pj.sc);ctx.closePath();ctx.fill();}
    }
  }

  // ---- 玩家车 ----
  _drawPlayer(ctx) {
    const p=this.player;
    const px=this.W/2+p.x*155,py=this.H-90;
    const pw=40,ph=70;

    ctx.save();ctx.translate(px,py);
    let tilt=p.yaw*1.5;if(p.skid)tilt+=p.steer*0.6;
    ctx.rotate(tilt);

    if(this.invincible>0&&this.invincible%8<4)ctx.globalAlpha=0.4;

    // 氮气拖尾
    if(this.speed>150){
      ctx.fillStyle=p.skid?'#ff4488':'#00ffff';
      ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=15;
      ctx.fillRect(-pw/2,ph/2-10,pw,15+(this.speed-150)*0.2);ctx.shadowBlur=0;
    }

    // 车身
    const bg=ctx.createLinearGradient(-pw/2,0,pw/2,0);
    bg.addColorStop(0,'#00ffcc');bg.addColorStop(0.5,'#00ffff');bg.addColorStop(1,'#0088aa');
    ctx.fillStyle=bg;ctx.beginPath();ctx.roundRect(-pw/2,-ph/2,pw,ph,8);ctx.fill();

    // 车窗
    ctx.fillStyle='#0a0a2e';ctx.beginPath();ctx.roundRect(-pw*0.3,-ph/2+8,pw*0.6,ph*0.35,4);ctx.fill();
    ctx.fillStyle='rgba(0,255,255,0.2)';ctx.fillRect(-pw*0.2,-ph/2+10,pw*0.25,ph*0.3);

    // 尾灯
    ctx.fillStyle='#ff0044';ctx.shadowColor='#ff0044';ctx.shadowBlur=8;
    ctx.fillRect(-pw*0.35,ph/2-5,pw*0.2,5);ctx.fillRect(pw*0.15,ph/2-5,pw*0.2,5);ctx.shadowBlur=0;

    // 前灯
    ctx.fillStyle='#ffffcc';ctx.shadowColor='#ffffcc';ctx.shadowBlur=6;
    ctx.fillRect(-pw*0.35,-ph/2,pw*0.2,4);ctx.fillRect(pw*0.15,-ph/2,pw*0.2,4);ctx.shadowBlur=0;

    ctx.globalAlpha=1;ctx.restore();
  }

  _drawParticles(ctx) {
    for(const pp of this.particles){ctx.fillStyle=pp.color;ctx.globalAlpha=Math.min(1,pp.life/40);ctx.beginPath();ctx.arc(pp.x,pp.y,2,0,Math.PI*2);ctx.fill();}
    for(const pp of this.smoke){ctx.fillStyle=`rgba(180,180,200,${pp.life/25*0.4})`;ctx.beginPath();ctx.arc(pp.x,pp.y,pp.r,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=1;
  }

  // ---- HUD ----
  _drawHUD(ctx) {
    const H=this.H,W=this.W;
    const hg=ctx.createLinearGradient(0,H-80,0,H);
    hg.addColorStop(0,'rgba(10,10,26,0)');hg.addColorStop(0.3,'rgba(10,10,26,0.7)');hg.addColorStop(1,'rgba(10,10,26,0.95)');
    ctx.fillStyle=hg;ctx.fillRect(0,H-80,W,80);

    // 速度
    const spd=Math.round(this.displaySpeed);
    ctx.fillStyle='#fff';ctx.font='bold 36px -apple-system,sans-serif';ctx.textAlign='center';
    ctx.fillText(String(spd),W/2,H-35);
    ctx.font='12px -apple-system,sans-serif';ctx.fillStyle='#94a3b8';ctx.fillText('KM/H',W/2,H-18);

    // 速度条
    const bw=120,bh=4,bx=W/2-bw/2,by=H-12;
    ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fillRect(bx,by,bw,bh);
    const bg2=ctx.createLinearGradient(bx,0,bx+bw,0);
    bg2.addColorStop(0,'#00ffff');bg2.addColorStop(0.5,'#ff00ff');bg2.addColorStop(1,'#ff4488');
    ctx.fillStyle=bg2;ctx.fillRect(bx,by,bw*Math.min(1,spd/300),bh);

    // 生命
    ctx.textAlign='left';ctx.font='22px sans-serif';
    ctx.fillText('❤️'.repeat(this.lives)+'🖤'.repeat(3-this.lives),15,H-22);

    // 分数
    ctx.textAlign='right';ctx.font='bold 16px -apple-system,sans-serif';ctx.fillStyle='#ff00ff';
    ctx.shadowColor='#ff00ff';ctx.shadowBlur=8;
    ctx.fillText('🏆 '+String(this.score),W-15,H-22);ctx.shadowBlur=0;

    // 打滑
    if(this.player.skid){ctx.textAlign='center';ctx.font='bold 14px sans-serif';ctx.fillStyle='#ff4488';ctx.shadowColor='#ff4488';ctx.shadowBlur=10;ctx.fillText('⚠ 打滑漂移！',W/2,H-95);ctx.shadowBlur=0;}

    // 操作
    ctx.textAlign='center';ctx.font='11px sans-serif';ctx.fillStyle='rgba(255,255,255,0.25)';
    ctx.fillText('↑油门  ↓刹车  ←→转向',W/2,H-3);
  }
}

// ============================================================
// 启动
// ============================================================
document.addEventListener('DOMContentLoaded',()=>{
  const cv=document.getElementById('gameCanvas');
  const game=new Game(cv);
  game._draw();

  document.getElementById('btnStart').addEventListener('click',e=>{e.stopPropagation();game.start();});
  document.getElementById('btnRestart').addEventListener('click',e=>{e.stopPropagation();game.start();});

  function resize(){
    const mw=Math.min(window.innerWidth-10,800);
    const sc=mw/800;
    cv.style.width=mw+'px';cv.style.height=(500*sc)+'px';
  }
  window.addEventListener('resize',resize);
  resize();
});
