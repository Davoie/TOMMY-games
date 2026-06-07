/**
 * 霓虹极速 (Neon Racer)
 * TOMMY 游戏厅 - 游戏 #02
 *
 * 伪3D第一人称赛车，夜景霓虹赛博朋克风格
 * 操作：↑油门 ↓刹车 ←→转向  高速急转打滑漂移
 */

// roundRect polyfill
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
    this.beginPath();
    this.moveTo(x + r.tl, y);
    this.lineTo(x + w - r.tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
    this.lineTo(x + w, y + h - r.br);
    this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
    this.lineTo(x + r.bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
    this.lineTo(x, y + r.tl);
    this.quadraticCurveTo(x, y, x + r.tl, y);
    this.closePath();
  };
}

// ============================================================
// 音效引擎
// ============================================================
const SoundEngine = (() => {
  let ctx = null;
  function ensure() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, type, duration, vol = 0.08, ramp = true) {
    const c = ensure();
    const osc = c.createOscillator(); const gain = c.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, c.currentTime);
    if (ramp) gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain).connect(c.destination);
    osc.start(); osc.stop(c.currentTime + duration);
  }
  function noise(dur, vol = 0.04) {
    const c = ensure();
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
    const src = c.createBufferSource(); const gain = c.createGain();
    src.buffer = buf; gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    src.connect(gain).connect(c.destination);
    src.start(); src.stop(c.currentTime + dur);
  }
  return {
    accelerate: () => { tone(80, 'sawtooth', 0.15, 0.05); tone(120, 'square', 0.1, 0.04); },
    brake: () => noise(0.12, 0.05),
    crash: () => { tone(50, 'sawtooth', 0.4, 0.2); tone(30, 'triangle', 0.5, 0.25); noise(0.3, 0.1); },
    skid: () => { noise(0.15, 0.06); tone(200, 'sawtooth', 0.1, 0.03); },
    engineNote: (freq) => { tone(freq, 'sawtooth', 0.08, 0.03, false); },
    init: () => ensure(),
    getCtx: () => ensure(),
  };
})();

// ============================================================
// BGM — Synthwave 循环
// ============================================================
const BGM = (() => {
  const BPM = 140; const beatDur = 60 / BPM; const loopBeats = 16; const loopDur = beatDur * loopBeats;
  let masterGain = null, running = false, timerId = null, nextLoopStart = 0, activeNodes = [];
  const N = { C2:65,D2:73,E2:82,F2:87,G2:98,A2:110,B2:123,C3:131,D3:147,E3:165,F3:175,G3:196,A3:220,B3:247,C4:262,D4:294,E4:330,F4:349,G4:392,A4:440,B4:494,C5:523,D5:587,E5:659,F5:698,G5:784,A5:880,B5:988 };

  function playNote(freq, type, startTime, dur, vol = 0.04) {
    if (!freq || freq <= 0) return;
    try {
      const ctx = SoundEngine.getCtx(); if (!masterGain || !ctx) return;
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = type; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.01);
      gain.gain.setValueAtTime(vol, startTime + dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
      osc.connect(gain).connect(masterGain);
      osc.start(startTime); osc.stop(startTime + dur + 0.05);
      activeNodes.push(osc, gain);
    } catch (_) {}
  }

  function scheduleLoop(startTime) {
    const t = (beat) => startTime + beat * beatDur;
    const v = 0.04, bv = 0.05;
    // Synthwave bass line
    const bassLine = [N.C2,N.C2,N.G2,N.G2, N.A2,N.A2,N.F2,N.F2, N.C2,N.C2,N.G2,N.G2, N.A2,N.A2,N.A2,N.A2];
    for (let i = 0; i < 16; i++) playNote(bassLine[i], 'sawtooth', t(i), 0.85, bv);

    // Synth arp
    const arp = [N.C4,N.E4,N.G4,N.C5, N.D4,N.F4,N.A4,N.D5, N.C4,N.E4,N.G4,N.C5, N.G3,N.C4,N.E4,N.G4];
    for (let i = 0; i < 16; i++) playNote(arp[i], 'square', t(i), 0.2, v * 0.7);

    // Lead melody
    const lead = [
      {b:0,n:N.C5,d:0.3},{b:1,n:N.G4,d:0.3},{b:2,n:N.A4,d:0.3},{b:3,n:N.F4,d:0.5},
      {b:4,n:N.G4,d:0.3},{b:5,n:N.E4,d:0.3},{b:6,n:N.C4,d:0.5},
      {b:8,n:N.C5,d:0.3},{b:9,n:N.G5,d:0.3},{b:10,n:N.A5,d:0.3},{b:11,n:N.F5,d:0.5},
      {b:12,n:N.G5,d:0.3},{b:13,n:N.E5,d:0.3},{b:14,n:N.C5,d:0.5},
    ];
    for (const l of lead) playNote(l.n, 'square', t(l.b), l.d, 0.035);

    // Snare
    for (let i = 0; i < 16; i += 2) playNote(200, 'triangle', t(i + 1), 0.08, 0.06);
    // Kick
    for (let i = 0; i < 16; i += 4) playNote(60, 'sine', t(i), 0.3, 0.08);
  }

  function schedulerLoop() {
    if (!running) return;
    const now = SoundEngine.getCtx().currentTime;
    while (nextLoopStart < now + 0.3) { scheduleLoop(nextLoopStart); nextLoopStart += loopDur; }
    timerId = setTimeout(schedulerLoop, loopDur * 500);
  }

  return {
    start() {
      if (running) return;
      SoundEngine.init();
      if (!masterGain) {
        masterGain = SoundEngine.getCtx().createGain();
        masterGain.gain.value = 0.55;
        masterGain.connect(SoundEngine.getCtx().destination);
      } else {
        masterGain.gain.cancelScheduledValues(SoundEngine.getCtx().currentTime);
        masterGain.gain.setValueAtTime(masterGain.gain.value, SoundEngine.getCtx().currentTime);
        masterGain.gain.linearRampToValueAtTime(0.55, SoundEngine.getCtx().currentTime + 0.15);
      }
      running = true; activeNodes = [];
      nextLoopStart = SoundEngine.getCtx().currentTime + 0.05;
      schedulerLoop();
    },
    stop() {
      running = false; if (timerId) { clearTimeout(timerId); timerId = null; }
      if (masterGain) masterGain.gain.linearRampToValueAtTime(0, SoundEngine.getCtx().currentTime + 0.3);
    },
  };
})();

// ============================================================
// 主游戏类
// ============================================================
class Game {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.W = canvas.width; this.H = canvas.height;

    // --- 3D 投影参数 ---
    this.VANISHING_Y = Math.floor(this.H * 0.34);
    this.ROAD_HALF = 0.5;     // 世界坐标半宽
    this.SEG_COUNT = 200;
    this.CAMERA_DEPTH = 1;

    // --- 游戏状态 ---
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('racerHighScore') || '0', 10);
    this.gameOver = false; this.started = false; this.frame = 0;

    // --- 驾驶物理 ---
    this.speed = 0;            // km/h
    this.maxSpeed = 120;
    this.accel = 2.5;
    this.brakeForce = 6;
    this.friction = 0.4;

    // --- 转向物理 ---
    this.player = {
      lateralX: 0,            // 世界坐标横向偏移 (-1~1 相对于路面)
      steerAngle: 0,          // 方向盘角度 (-1~1)
      targetSteer: 0,         // 目标方向盘角度
      yaw: 0,                 // 车身偏航 (用于倾斜绘制)
      isSkidding: false,
      skidTimer: 0,
    };
    this.steerSpeed = 0.06;    // 方向盘转速
    this.steerReturn = 0.08;   // 回正速率
    this.yawReturn = 0.12;     // 偏航回正
    this.gripFactor = 0.012;
    this.skidThreshold = 80;   // |steer*speed| > 80 = 打滑

    // --- 生命 ---
    this.lives = 3;
    this.invincible = 0;

    // --- 弯道 ---
    this.curve = 0;            // 当前弯道曲率 (-1~1)
    this.targetCurve = 0;
    this.curveTimer = 0;

    // --- 障碍物 (世界坐标 Y = 距离) ---
    this.obstacles = [];
    this.spawnTimer = 0;
    this.spawnInterval = 120;

    // --- 路标 ---
    this.roadMarkings = [];
    this._initMarkings();

    // --- 装饰 ---
    this.stars = []; this._initStars();
    this.buildings = []; this._initBuildings();
    this.lampposts = [];
    this.billboards = [];

    // --- 粒子 ---
    this.particles = [];
    this.smokeParticles = [];

    // --- 速度仪表 ---
    this.displaySpeed = 0;

    // --- 输入 ---
    this.keys = {};
    this._bindEvents();
  }

  // ---- 初始化星空 (3层视差) ----
  _initStars() {
    for (let l = 0; l < 3; l++) {
      for (let i = 0; i < 40; i++) {
        this.stars.push({
          x: Math.random() * this.W, y: Math.random() * this.VANISHING_Y,
          r: Math.random() * (l === 0 ? 1.2 : l === 1 ? 1.8 : 2.5),
          twinkle: Math.random() * Math.PI * 2, speed: 0.2 + l * 0.3,
          layer: l, opacity: 0.4 + l * 0.3,
        });
      }
    }
  }

  // ---- 初始化建筑 ----
  _initBuildings() {
    // 远层建筑
    for (let i = 0; i < 30; i++) {
      this.buildings.push({
        x: Math.random() * this.W * 1.3 - this.W * 0.15,
        w: Math.random() * 40 + 15,
        h: Math.random() * 80 + 40,
        layer: 0, // 远层
        windows: Array.from({length: Math.floor(Math.random() * 6)}, () => ({
          x: Math.random() * 0.7 + 0.1, y: Math.random() * 0.7 + 0.1, on: Math.random() > 0.4,
        })),
        neonColor: Math.random() > 0.7 ? ['#ff00ff','#00ffff','#ff4488','#ffaa00'][Math.floor(Math.random()*4)] : null,
      });
    }
    // 近层建筑
    for (let i = 0; i < 20; i++) {
      this.buildings.push({
        x: Math.random() * this.W * 1.2 - this.W * 0.1,
        w: Math.random() * 70 + 30,
        h: Math.random() * 120 + 60,
        layer: 1, // 近层
        windows: Array.from({length: Math.floor(Math.random() * 10)}, () => ({
          x: Math.random() * 0.7 + 0.1, y: Math.random() * 0.7 + 0.1, on: Math.random() > 0.35,
        })),
        neonColor: Math.random() > 0.5 ? ['#ff00ff','#00ffff','#ff4488','#ffaa00'][Math.floor(Math.random()*4)] : null,
      });
    }
  }

  // ---- 初始化路标 ----
  _initMarkings() {
    for (let i = 0; i < 80; i++) {
      this.roadMarkings.push({ worldY: i * 4, type: 'dash' });
    }
  }

  // ---- 事件绑定 ----
  _bindEvents() {
    window.addEventListener('keydown', e => {
      const k = e.key.startsWith('Arrow') ? e.key : null;
      if (!k) return;
      e.preventDefault();
      this.keys[k] = true;
      if (!this.started && !this.gameOver) { this.start(); return; }
    });
    window.addEventListener('keyup', e => {
      const k = e.key.startsWith('Arrow') ? e.key : null;
      if (!k) return;
      e.preventDefault();
      this.keys[k] = false;
    });
    this.canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      SoundEngine.init();
      if (!this.started && !this.gameOver) { this.start(); return; }
      if (this.gameOver) return;
      const t = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = (t.clientX - rect.left) / rect.width;
      if (x < 0.4) this.keys.ArrowLeft = true;
      else if (x > 0.6) this.keys.ArrowRight = true;
      else { this.keys.ArrowUp = true; }
    }, {passive: false});
    this.canvas.addEventListener('touchend', e => {
      e.preventDefault(); this.keys = {};
    }, {passive: false});
    this.canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const t = e.touches[0]; const rect = this.canvas.getBoundingClientRect();
      const x = (t.clientX - rect.left) / rect.width;
      this.keys = {};
      if (x < 0.4) this.keys.ArrowLeft = true;
      else if (x > 0.6) this.keys.ArrowRight = true;
      else this.keys.ArrowUp = true;
    }, {passive: false});
  }

  // ---- 开始 ----
  start() {
    this.started = true; this.gameOver = false;
    this.score = 0; this.speed = 80; this.frame = 0;
    this.lives = 3; this.invincible = 0;
    this.player.lateralX = 0; this.player.steerAngle = 0; this.player.yaw = 0;
    this.player.isSkidding = false; this.player.skidTimer = 0;
    this.curve = 0; this.targetCurve = 0; this.curveTimer = 0;
    this.obstacles = []; this.spawnTimer = 0; this.particles = []; this.smokeParticles = [];
    this.billboards = []; this.lampposts = [];
    this.displaySpeed = 80;
    document.getElementById('overlayStart').classList.add('hidden');
    document.getElementById('overlayEnd').classList.add('hidden');
    BGM.start();
    this._loop();
  }

  // ---- 结束 ----
  end() {
    this.gameOver = true; BGM.stop(); SoundEngine.crash();
    if (this.score > this.highScore) { this.highScore = this.score; localStorage.setItem('racerHighScore', String(this.highScore)); }
    document.getElementById('finalSpeed').textContent = String(Math.round(this.displaySpeed));
    document.getElementById('finalScore').textContent = String(this.score);
    document.getElementById('finalHigh').textContent = String(this.highScore);
    document.getElementById('newRecord').classList.toggle('hidden', this.score <= this.highScore || this.score === 0);
    document.getElementById('overlayEnd').classList.remove('hidden');
  }

  // ---- 主循环 ----
  _loop() {
    if (this.gameOver) return;
    this.frame++;
    this._update();
    this._draw();
    requestAnimationFrame(() => this._loop());
  }

  // ==========================================================
  // 更新
  // ==========================================================
  _update() {
    this._updateInput();
    this._updateSpeed();
    this._updateSteering();
    this._updatePhysics();
    this._updateCurve();
    this._updateObstacles();
    this._updateParticles();
    this._updateMarkings();
    this._updateDecor();
  }

  _updateInput() {
    const k = this.keys;
    this.player.targetSteer = 0;
    if (k.ArrowLeft) this.player.targetSteer = -1;
    if (k.ArrowRight) this.player.targetSteer = 1;
    // 同时按左右不转向
    if (k.ArrowLeft && k.ArrowRight) this.player.targetSteer = 0;
  }

  _updateSpeed() {
    const k = this.keys;
    if (k.ArrowUp) {
      this.speed += this.accel;
      if (this.frame % 4 === 0) SoundEngine.engineNote(60 + this.speed * 0.5);
    }
    if (k.ArrowDown) {
      this.speed -= this.brakeForce;
      if (this.speed > 60 && this.frame % 8 === 0) SoundEngine.brake();
    }
    // 自然减速 (风阻)
    this.speed -= this.friction;
    // 限速
    this.speed = Math.max(0, Math.min(this.maxSpeed, this.speed));
    // 平滑显示速度
    this.displaySpeed += (this.speed - this.displaySpeed) * 0.15;

    // 难度递增
    this.maxSpeed = 120 + Math.floor(this.score / 100) * 8;
    this.spawnInterval = Math.max(40, 120 - Math.floor(this.score / 80));
  }

  _updateSteering() {
    const p = this.player;
    // 方向盘渐变
    if (p.targetSteer !== 0) {
      p.steerAngle += p.targetSteer * this.steerSpeed;
    } else {
      // 回正
      if (Math.abs(p.steerAngle) < this.steerReturn) p.steerAngle = 0;
      else p.steerAngle -= Math.sign(p.steerAngle) * this.steerReturn;
    }
    p.steerAngle = Math.max(-1, Math.min(1, p.steerAngle));
  }

  _updatePhysics() {
    const p = this.player;
    const spd = this.speed;

    // --- 打滑判定 ---
    const skidForce = Math.abs(p.steerAngle) * spd;
    p.isSkidding = skidForce > this.skidThreshold;
    if (p.isSkidding) {
      p.skidTimer = 20;
      if (this.frame % 5 === 0) SoundEngine.skid();
    }
    if (p.skidTimer > 0) p.skidTimer--;

    // --- 横向偏移 ---
    let gripReduction = 1;
    if (p.isSkidding) gripReduction = 0.3; // 打滑时抓地力大幅下降

    const lateralMove = Math.sin(p.yaw) * spd * 0.0008 + p.steerAngle * spd * this.gripFactor * gripReduction * 0.05;
    p.lateralX += lateralMove;

    // 路面边界限制
    const roadLimit = 0.95;
    p.lateralX = Math.max(-roadLimit, Math.min(roadLimit, p.lateralX));

    // --- 偏航 ---
    if (p.steerAngle !== 0) {
      p.yaw += p.steerAngle * 0.03 * (spd / 120) * gripReduction;
    } else {
      if (Math.abs(p.yaw) < this.yawReturn) p.yaw = 0;
      else p.yaw -= Math.sign(p.yaw) * this.yawReturn;
    }
    p.yaw = Math.max(-0.5, Math.min(0.5, p.yaw));

    // --- 无敌 ---
    if (this.invincible > 0) this.invincible--;
  }

  _updateCurve() {
    this.curveTimer--;
    if (this.curveTimer <= 0) {
      this.curveTimer = 100 + Math.random() * 200;
      // 分数越高，弯道越大
      const maxC = Math.min(0.02, 0.003 + this.score * 0.00003);
      this.targetCurve = (Math.random() - 0.5) * 2 * maxC;
    }
    this.curve += (this.targetCurve - this.curve) * 0.008;
  }

  // ==========================================================
  // 障碍物
  // ==========================================================
  _updateObstacles() {
    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnInterval) { this.spawnTimer = 0; this._spawnObstacle(); }

    const speedWorld = this.speed * 0.003; // 世界坐标速度
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      o.worldY -= speedWorld;
      // 通过玩家 → 加分
      if (!o.scored && o.worldY < -2) { o.scored = true; this.score += 10; }
      // 超出屏幕
      if (o.worldY < -5) { this.obstacles.splice(i, 1); }
    }

    // 碰撞检测
    if (this.invincible > 0) return;
    for (const o of this.obstacles) {
      if (this._checkCollision(o)) { this._hit(); break; }
    }
  }

  _spawnObstacle() {
    const types = ['car', 'truck', 'racer'];
    const available = this.score < 200 ? ['car'] : this.score < 400 ? ['car', 'truck'] : types;
    const type = available[Math.floor(Math.random() * available.length)];

    // 确保不和已有障碍重叠
    let lateral = (Math.random() - 0.5) * 1.5;
    for (const o of this.obstacles) {
      if (o.worldY > 30 && o.worldY < 50 && Math.abs(o.lateralX - lateral) < 0.3) {
        lateral = (Math.random() - 0.5) * 1.5;
      }
    }

    this.obstacles.push({
      type, lateralX: lateral, worldY: 65 + Math.random() * 15, scored: false,
      speed: type === 'truck' ? 0.5 : type === 'racer' ? 2.5 + Math.random() * 2 : Math.random() * 1.5,
    });

  }

  _checkCollision(o) {
    // 3D 投影后做 AABB
    const worldY = o.worldY - (this.CAMERA_DEPTH);
    if (worldY <= 0) return false;
    const scale = this.CAMERA_DEPTH / worldY;
    const roadX = this._getRoadX(worldY);
    const projY = this.VANISHING_Y + (this.H - this.VANISHING_Y) * (1 - scale);
    const roadW = this.ROAD_HALF * scale * this.W;
    const ox = this.W / 2 + roadX + o.lateralX * roadW * 0.85;

    // 对手车缩放尺寸
    const ow = (o.type === 'truck' ? 40 : o.type === 'racer' ? 22 : 30) * scale * 1.2;
    const oh = (o.type === 'truck' ? 65 : o.type === 'racer' ? 35 : 50) * scale * 1.2;

    // 玩家车位置 (屏幕底部固定 X)
    const pw = 40, ph = 70;
    const px = this.W / 2 + this.player.lateralX * (this.ROAD_HALF * 0.85) * this.W - pw / 2;
    const py = this.H - ph - 20;

    const padding = 4;
    return (
      px + padding < ox + ow / 2 - padding &&
      px + pw - padding > ox - ow / 2 + padding &&
      py + padding < projY + oh / 2 - padding &&
      py + ph - padding > projY - oh / 2 + padding
    );
  }

  _hit() {
    if (this.invincible > 0) return;
    this.lives--;
    this.invincible = 90;
    // 爆炸粒子
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: this.W / 2, y: this.H - 60,
        vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8 - 4,
        life: 30 + Math.random() * 20, color: ['#ff00ff','#ff4488','#ffaa00','#ffffff'][Math.floor(Math.random()*4)],
      });
    }
    if (this.lives <= 0) { this.end(); } else { SoundEngine.crash(); }
  }

  // ==========================================================
  // 粒子
  // ==========================================================
  _updateParticles() {
    // 速度粒子 (氮气拖尾)
    if (this.speed > 150 && this.frame % 2 === 0) {
      const cx = this.W / 2 + this.player.lateralX * 150;
      const cy = this.H - 50 + Math.random() * 20;
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 100, y: cy,
        vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 6 - this.speed * 0.02,
        life: 15 + Math.random() * 10,
        color: this.player.isSkidding ? '#ff4488' : ['#ff00ff','#00ffff'][Math.floor(Math.random()*2)],
      });
    }
    // 尾气
    if (this.frame % 3 === 0) {
      const cx = this.W / 2 + this.player.lateralX * 150;
      this.smokeParticles.push({
        x: cx + (Math.random() - 0.5) * 20, y: this.H - 45,
        vx: (Math.random() - 0.5) * 0.5, vy: -Math.random() - 0.5,
        life: 10 + Math.random() * 10, r: 2 + Math.random() * 3,
      });
    }
    // 打滑烟雾
    if (this.player.isSkidding && this.frame % 2 === 0) {
      for (let i = 0; i < 2; i++) {
        this.smokeParticles.push({
          x: this.W / 2 + this.player.lateralX * 150 + (Math.random() - 0.5) * 60,
          y: this.H - 30 + Math.random() * 10,
          vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 2 - 1,
          life: 15 + Math.random() * 15, r: 4 + Math.random() * 5,
        });
      }
    }

    // 更新
    for (const arr of [this.particles, this.smokeParticles]) {
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.life <= 0) arr.splice(i, 1);
      }
    }
  }

  _updateMarkings() {
    const speedWorld = this.speed * 0.003;
    for (const m of this.roadMarkings) {
      m.worldY -= speedWorld;
      if (m.worldY < -2) m.worldY += 160;
    }
  }

  _updateDecor() {
    const speedWorld = this.speed * 0.003;
    // 灯柱
    if (this.frame % Math.max(10, 40 - Math.floor(this.speed / 10)) === 0) {
      this.lampposts.push({ worldY: 60, side: Math.random() > 0.5 ? -1 : 1, phase: Math.random() * Math.PI * 2 });
    }
    for (let i = this.lampposts.length - 1; i >= 0; i--) {
      this.lampposts[i].worldY -= speedWorld;
      if (this.lampposts[i].worldY < -5) this.lampposts.splice(i, 1);
    }
    // 广告牌
    if (this.frame % 180 === 0 && this.score > 150) {
      this.billboards.push({ worldY: 55, side: Math.random() > 0.5 ? -1 : 1 });
    }
    for (let i = this.billboards.length - 1; i >= 0; i--) {
      this.billboards[i].worldY -= speedWorld;
      if (this.billboards[i].worldY < -5) this.billboards.splice(i, 1);
    }
  }

  // ==========================================================
  // 3D 投影核心
  // ==========================================================
  _getRoadX(worldY) {
    // 弯道偏移随距离增大
    return this.curve * worldY * worldY * 0.5;
  }

  _project(worldY) {
    if (worldY <= 0) return { scale: 0, screenY: this.VANISHING_Y };
    const scale = this.CAMERA_DEPTH / worldY;
    const screenY = this.VANISHING_Y + (this.H - this.VANISHING_Y) * (1 - scale);
    return { scale: Math.min(scale, 1.5), screenY: Math.min(screenY, this.H + 50) };
  }

  // ==========================================================
  // 绘制
  // ==========================================================
  _draw() {
    const ctx = this.ctx; const W = this.W; const H = this.H;
    ctx.clearRect(0, 0, W, H);

    this._drawSky(ctx);
    this._drawCity(ctx);
    this._drawRoad(ctx);
    this._drawDecor(ctx);
    this._drawObstacles(ctx);
    this._drawPlayer(ctx);
    this._drawParticles(ctx);
    this._drawHUD(ctx);
  }

  _drawSky(ctx) {
    // 天空渐变
    const grad = ctx.createLinearGradient(0, 0, 0, this.VANISHING_Y + 30);
    grad.addColorStop(0, '#0a0a2e');
    grad.addColorStop(0.5, '#1a0a3e');
    grad.addColorStop(1, '#2a1040');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.W, this.VANISHING_Y + 30);

    // 月亮
    ctx.fillStyle = '#ffddaa';
    ctx.shadowColor = 'rgba(255,200,150,0.4)';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(this.W - 100, 60, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 星空 (3层视差)
    for (const s of this.stars) {
      const twinkle = 0.5 + 0.5 * Math.sin(this.frame * 0.02 + s.twinkle);
      ctx.fillStyle = `rgba(255,255,255,${s.opacity * twinkle})`;
      ctx.beginPath();
      // 视差滚动
      const sx = (s.x - this.frame * s.speed * 0.05) % this.W;
      ctx.arc(sx < 0 ? sx + this.W : sx, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawCity(ctx) {
    // 地平线雾效
    const fogGrad = ctx.createLinearGradient(0, this.VANISHING_Y - 30, 0, this.VANISHING_Y + 60);
    fogGrad.addColorStop(0, 'rgba(10,10,46,0)');
    fogGrad.addColorStop(0.5, 'rgba(20,10,50,0.4)');
    fogGrad.addColorStop(1, 'rgba(20,10,50,0.9)');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, this.VANISHING_Y - 30, this.W, 90);

    for (const b of this.buildings) {
      const speed = b.layer === 0 ? 0.15 : 0.4;
      const bky = this.VANISHING_Y - b.h + (b.layer === 0 ? 20 : 10);
      const bx = ((b.x - this.frame * speed) % (this.W + b.w + 200)) - 100;
      if (bx < -b.w || bx > this.W + b.w) continue;

      // 建筑主体
      ctx.fillStyle = b.layer === 0 ? '#0d0d1a' : '#1a1a30';
      ctx.fillRect(bx, bky, b.w, b.h);

      // 窗户
      for (const win of b.windows) {
        if (!win.on) continue;
        const wx = bx + win.x * b.w;
        const wy = bky + win.y * b.h;
        const flicker = Math.sin(wx * 10 + this.frame * 0.05) > 0 ? 1 : 0.5;
        ctx.fillStyle = Math.random() > 0.9 ? `rgba(255,136,68,${0.6 * flicker})` : `rgba(255,221,102,${0.5 * flicker})`;
        ctx.fillRect(wx, wy, 3, 4);
      }

      // 霓虹招牌
      if (b.neonColor && b.layer === 1) {
        const nx = bx + b.w * 0.2, ny = bky + b.h * 0.1;
        ctx.fillStyle = b.neonColor;
        ctx.shadowColor = b.neonColor;
        ctx.shadowBlur = 6 + Math.sin(this.frame * 0.1) * 3;
        ctx.fillRect(nx, ny, b.w * 0.6, 4);
        ctx.shadowBlur = 0;
      }
    }
  }

  _drawRoad(ctx) {
    const W = this.W; const H = this.H; const VY = this.VANISHING_Y;

    // 路面段：从远到近
    for (let i = this.SEG_COUNT - 1; i >= 0; i--) {
      const worldY1 = this.CAMERA_DEPTH + i * 0.35;
      const worldY2 = worldY1 + 0.35;
      const p1 = this._project(worldY1);
      const p2 = this._project(worldY2);
      if (p1.screenY < VY - 10) continue;

      const roadX1 = this._getRoadX(worldY1);
      const roadX2 = this._getRoadX(worldY2);
      const roadW1 = this.ROAD_HALF * p1.scale * W;
      const roadW2 = this.ROAD_HALF * p2.scale * W;

      // 路面色 (远暗近亮)
      const brightness = 0.25 + p1.scale * 0.25;
      ctx.fillStyle = `rgb(${Math.floor(42*brightness)},${Math.floor(42*brightness)},${Math.floor(62*brightness)})`;
      ctx.fillRect(
        W / 2 + roadX1 - roadW1, p1.screenY,
        roadW1 * 2, p2.screenY - p1.screenY
      );

      // 路肩 (红白)
      const isRed = Math.floor((worldY1 + this.frame * 0.05) / 2) % 2 === 0;
      ctx.fillStyle = isRed ? '#ff3344' : 'rgba(255,255,255,0.5)';
      const shoulder = roadW1 * 0.08;
      ctx.fillRect(W / 2 + roadX1 - roadW1 - shoulder, p1.screenY, shoulder, p2.screenY - p1.screenY);
      ctx.fillRect(W / 2 + roadX1 + roadW1, p1.screenY, shoulder, p2.screenY - p1.screenY);

      // 车道虚线
      if (Math.floor((worldY1 + 2) / 4) % 2 === 0) {
        ctx.strokeStyle = `rgba(255,255,255,${0.3 + p1.scale * 0.3})`;
        ctx.lineWidth = 2 * p1.scale;
        ctx.beginPath();
        const cx = W / 2 + roadX1;
        ctx.moveTo(cx, p1.screenY);
        ctx.lineTo(cx, p2.screenY);
        ctx.stroke();
      }

      // 霓虹灯带
      if (i % 8 === 0) {
        const neonL = W / 2 + roadX1 - roadW1;
        const neonR = W / 2 + roadX1 + roadW1;
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 12 * p1.scale;
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 3 * p1.scale;
        ctx.beginPath(); ctx.moveTo(neonL, p1.screenY); ctx.lineTo(neonL, p2.screenY); ctx.stroke();
        ctx.shadowColor = '#00ffff';
        ctx.strokeStyle = '#00ffff';
        ctx.beginPath(); ctx.moveTo(neonR, p1.screenY); ctx.lineTo(neonR, p2.screenY); ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // 完整道路中心线（覆盖在顶部）
    for (let i = Math.floor(this.SEG_COUNT * 0.7); i < this.SEG_COUNT; i++) {
      const worldY = this.CAMERA_DEPTH + i * 0.35;
      const p = this._project(worldY);
      if (p.screenY < VY) continue;
      const rx = this._getRoadX(worldY);
      if (Math.floor((worldY + 2) / 4) % 2 === 0) {
        ctx.strokeStyle = `rgba(255,255,255,${0.3 + p.scale * 0.3})`;
        ctx.lineWidth = 2 * p.scale;
        ctx.beginPath();
        const cx = this.W / 2 + rx;
        ctx.moveTo(cx, p.screenY);
        ctx.lineTo(cx, p.screenY + 3);
        ctx.stroke();
      }
    }
  }

  _drawDecor(ctx) {
    // 灯柱
    for (const lp of this.lampposts) {
      const wY = lp.worldY - this.CAMERA_DEPTH;
      if (wY <= 0.1) continue;
      const p = this._project(wY);
      const rx = this._getRoadX(wY);
      const rw = this.ROAD_HALF * p.scale * this.W;
      const lx = this.W / 2 + rx + lp.side * rw * 1.2;

      // 柱子
      ctx.fillStyle = '#334';
      ctx.fillRect(lx - 2 * p.scale, p.screenY - 80 * p.scale, 4 * p.scale, 80 * p.scale);
      // 灯
      ctx.fillStyle = '#ffddaa';
      ctx.shadowColor = 'rgba(255,200,100,0.5)';
      ctx.shadowBlur = 15 * p.scale;
      ctx.beginPath();
      ctx.arc(lx, p.screenY - 80 * p.scale, 8 * p.scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 广告牌
    for (const bb of this.billboards) {
      const wY = bb.worldY - this.CAMERA_DEPTH;
      if (wY <= 0.1) continue;
      const p = this._project(wY);
      const rx = this._getRoadX(wY);
      const rw = this.ROAD_HALF * p.scale * this.W;
      const bx = this.W / 2 + rx + bb.side * rw * 1.15;
      const bh = 30 * p.scale, bw = 60 * p.scale;
      ctx.fillStyle = '#1a1a30';
      ctx.fillRect(bx - bw / 2, p.screenY - bh, bw, bh);
      ctx.fillStyle = ['#ff00ff','#00ffff','#ffaa00'][Math.floor(Math.random() * 3)];
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8 * p.scale;
      ctx.fillRect(bx - bw * 0.35, p.screenY - bh * 0.6, bw * 0.7, bh * 0.3);
      ctx.shadowBlur = 0;
    }
  }

  _drawObstacles(ctx) {
    // 按 worldY 从远到近排序
    const sorted = [...this.obstacles].sort((a, b) => b.worldY - a.worldY);
    for (const o of sorted) {
      const wY = o.worldY - this.CAMERA_DEPTH;
      if (wY <= 0.1) continue;
      const p = this._project(wY);
      const rx = this._getRoadX(wY);
      const rw = this.ROAD_HALF * p.scale * this.W;
      const ox = this.W / 2 + rx + o.lateralX * rw * 0.85;

      const bw = (o.type === 'truck' ? 40 : o.type === 'racer' ? 22 : 30) * p.scale * 1.2;
      const bh = (o.type === 'truck' ? 65 : o.type === 'racer' ? 35 : 50) * p.scale * 1.2;

      const color = o.type === 'truck' ? '#ff9933' : o.type === 'racer' ? '#ff2244' : '#ff6644';

      // 车身
      ctx.fillStyle = color;
      ctx.fillRect(ox - bw / 2, p.screenY - bh, bw, bh);
      // 车窗
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(ox - bw * 0.3, p.screenY - bh, bw * 0.6, bh * 0.35);
      // 尾灯
      ctx.fillStyle = o.type === 'racer' ? '#ffffff' : '#ff0000';
      ctx.fillRect(ox - bw * 0.35, p.screenY - bh * 0.15, bw * 0.15, bh * 0.1);
      ctx.fillRect(ox + bw * 0.2, p.screenY - bh * 0.15, bw * 0.15, bh * 0.1);

      // 逆行标记
      if (o.type === 'racer') {
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(ox, p.screenY - bh - 5 * p.scale);
        ctx.lineTo(ox - 6 * p.scale, p.screenY - bh - 14 * p.scale);
        ctx.lineTo(ox + 6 * p.scale, p.screenY - bh - 14 * p.scale);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  _drawPlayer(ctx) {
    const px = this.W / 2;
    const py = this.H - 90;
    const pw = 40, ph = 70;
    const p = this.player;

    ctx.save();
    ctx.translate(px + p.lateralX * 160, py);

    // 车身倾斜 (偏航 + 打滑)
    let tilt = p.yaw * 1.5;
    if (p.isSkidding) tilt += p.steerAngle * 0.6;
    ctx.rotate(tilt);

    // 无敌闪烁
    if (this.invincible > 0 && this.invincible % 8 < 4) {
      ctx.globalAlpha = 0.4;
    }

    // 氮气拖尾 (加速时)
    if (this.speed > 150) {
      ctx.fillStyle = p.isSkidding ? '#ff4488' : '#00ffff';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 15;
      ctx.fillRect(-pw / 2, ph / 2 - 10, pw, 15 + (this.speed - 150) * 0.2);
      ctx.shadowBlur = 0;
    }

    // 车身
    const bodyGrad = ctx.createLinearGradient(-pw / 2, 0, pw / 2, 0);
    bodyGrad.addColorStop(0, '#00ffcc');
    bodyGrad.addColorStop(0.5, '#00ffff');
    bodyGrad.addColorStop(1, '#0088aa');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 8);
    ctx.fill();

    // 车窗
    ctx.fillStyle = '#0a0a2e';
    ctx.beginPath();
    ctx.roundRect(-pw * 0.3, -ph / 2 + 8, pw * 0.6, ph * 0.35, 4);
    ctx.fill();
    // 车窗反光
    ctx.fillStyle = 'rgba(0,255,255,0.2)';
    ctx.fillRect(-pw * 0.2, -ph / 2 + 10, pw * 0.25, ph * 0.3);

    // 尾灯
    ctx.fillStyle = '#ff0044';
    ctx.shadowColor = '#ff0044'; ctx.shadowBlur = 8;
    ctx.fillRect(-pw * 0.35, ph / 2 - 5, pw * 0.2, 5);
    ctx.fillRect(pw * 0.15, ph / 2 - 5, pw * 0.2, 5);
    ctx.shadowBlur = 0;

    // 前灯
    ctx.fillStyle = '#ffffcc';
    ctx.shadowColor = '#ffffcc'; ctx.shadowBlur = 6;
    ctx.fillRect(-pw * 0.35, -ph / 2, pw * 0.2, 4);
    ctx.fillRect(pw * 0.15, -ph / 2, pw * 0.2, 4);
    ctx.shadowBlur = 0;

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  _drawParticles(ctx) {
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      const alpha = p.life / 40;
      ctx.globalAlpha = Math.min(1, alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const p of this.smokeParticles) {
      ctx.fillStyle = `rgba(180,180,200,${p.life / 25 * 0.4})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  _drawHUD(ctx) {
    // 底部仪表板背景
    const hudGrad = ctx.createLinearGradient(0, this.H - 80, 0, this.H);
    hudGrad.addColorStop(0, 'rgba(10,10,26,0)');
    hudGrad.addColorStop(0.3, 'rgba(10,10,26,0.7)');
    hudGrad.addColorStop(1, 'rgba(10,10,26,0.95)');
    ctx.fillStyle = hudGrad;
    ctx.fillRect(0, this.H - 80, this.W, 80);

    // 速度表
    const spd = Math.round(this.displaySpeed);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(spd), this.W / 2, this.H - 35);
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('KM/H', this.W / 2, this.H - 18);

    // 速度条
    const barW = 120, barH = 4;
    const barX = this.W / 2 - barW / 2, barY = this.H - 12;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(barX, barY, barW, barH);
    const pct = Math.min(1, spd / 300);
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    barGrad.addColorStop(0, '#00ffff');
    barGrad.addColorStop(0.5, '#ff00ff');
    barGrad.addColorStop(1, '#ff4488');
    ctx.fillStyle = barGrad;
    ctx.fillRect(barX, barY, barW * pct, barH);

    // 生命
    ctx.textAlign = 'left';
    ctx.font = '22px sans-serif';
    const hearts = '❤️'.repeat(this.lives) + '🖤'.repeat(3 - this.lives);
    ctx.fillText(hearts, 15, this.H - 22);

    // 分数
    ctx.textAlign = 'right';
    ctx.font = 'bold 16px -apple-system, sans-serif';
    ctx.fillStyle = '#ff00ff';
    ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 8;
    ctx.fillText('🏆 ' + String(this.score), this.W - 15, this.H - 22);
    ctx.shadowBlur = 0;

    // 打滑警告
    if (this.player.isSkidding) {
      ctx.textAlign = 'center';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#ff4488';
      ctx.shadowColor = '#ff4488'; ctx.shadowBlur = 10;
      ctx.fillText('⚠ 打滑漂移！', this.W / 2, this.H - 95);
      ctx.shadowBlur = 0;
    }

    // 箭头操作提示
    ctx.textAlign = 'center';
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillText('↑油门  ↓刹车  ←→转向', this.W / 2, this.H - 3);
  }
}

// ============================================================
// 启动
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new Game(canvas);

  // 静态绘制初始画面
  game._draw();

  document.getElementById('highScore').textContent = String(game.highScore);

  document.getElementById('btnStart').addEventListener('click', e => { e.stopPropagation(); game.start(); });
  document.getElementById('btnRestart').addEventListener('click', e => { e.stopPropagation(); game.start(); });

  function resize() {
    const maxW = Math.min(window.innerWidth - 10, 800);
    const scale = maxW / 800;
    canvas.style.width = maxW + 'px';
    canvas.style.height = (500 * scale) + 'px';
  }
  window.addEventListener('resize', resize);
  resize();
});
