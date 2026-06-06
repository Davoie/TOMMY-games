/**
 * 绿头鱼跳跳 (Green Fish Jump)
 * TOMMY 游戏厅 - 游戏 #01
 *
 * 海底世界跑酷游戏，绿头鱼躲避障碍物
 * 操作：空格键 / 点击屏幕 跳跃
 */

// ============================================================
// 音效引擎 (Web Audio API)
// ============================================================
const SoundEngine = (() => {
  let ctx = null;

  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, type, duration, vol = 0.1, ramp = true) {
    const c = ensure();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, c.currentTime);
    if (ramp) gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  }

  return {
    jump: () => { tone(500, 'square', 0.1, 0.06); tone(800, 'square', 0.06, 0.04); },
    hit: () => { tone(120, 'sawtooth', 0.25, 0.15); tone(80, 'triangle', 0.3, 0.12); },
    score: () => { tone(900, 'sine', 0.08, 0.05); tone(1200, 'sine', 0.06, 0.03); },
    init: () => ensure(),
  };
})();

// ============================================================
// 主游戏类
// ============================================================
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // 响应式尺寸
    this.W = canvas.width;
    this.H = canvas.height;

    // 地面 Y 坐标
    this.GROUND_Y = this.H - 60;

    // 游戏状态
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('greenFishHighScore') || '0', 10);
    this.gameOver = false;
    this.started = false;
    this.frame = 0;

    // 速度参数
    this.baseSpeed = 5;
    this.speed = this.baseSpeed;

    // 障碍物
    this.obstacles = [];
    this.spawnTimer = 0;
    this.spawnInterval = 90; // 帧
    this.minSpawnInterval = 40;

    // 装饰元素
    this.bubbles = [];
    this.seaweeds = []; // 海草
    this.bgFish = [];   // 背景小鱼

    // 云朵
    this.clouds = [];

    // 地面偏移（滚动）
    this.groundOffset = 0;

    // 绿头鱼
    this.fish = {
      x: 120,
      y: this.GROUND_Y - 40,
      w: 56,
      h: 40,
      vy: 0,
      gravity: 0.7,
      jumpPower: -12,
      isJumping: false,
      squish: 0, // 落地压扁动画
    };

    // 绑定事件
    this._bindEvents();
  }

  // ---- 事件绑定 ----
  _bindEvents() {
    const handlers = {
      keydown: (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          e.preventDefault();
          this._jump();
        }
      },
      touchstart: (e) => {
        e.preventDefault();
        this._jump();
      },
      mousedown: (e) => {
        e.preventDefault();
        this._jump();
      },
    };
    window.addEventListener('keydown', handlers.keydown);
    this.canvas.addEventListener('touchstart', handlers.touchstart, { passive: false });
    this.canvas.addEventListener('mousedown', handlers.mousedown);
    // 保存引用以便移除（如有需要）
    this._handlers = handlers;
  }

  // ---- 跳跃 ----
  _jump() {
    if (this.gameOver) return;
    SoundEngine.init(); // 首次交互时初始化音频

    if (!this.started) {
      this.start();
      return;
    }

    if (!this.fish.isJumping) {
      this.fish.vy = this.fish.jumpPower;
      this.fish.isJumping = true;
      SoundEngine.jump();
    }
  }

  // ---- 开始游戏 ----
  start() {
    this.started = true;
    this.gameOver = false;
    this.score = 0;
    this.speed = this.baseSpeed;
    this.frame = 0;
    this.obstacles = [];
    this.spawnTimer = 0;
    this.fish.y = this.GROUND_Y - this.fish.h;
    this.fish.vy = 0;
    this.fish.isJumping = false;
    this.fish.squish = 0;
    this.groundOffset = 0;
    document.getElementById('overlayStart').classList.add('hidden');
    document.getElementById('overlayEnd').classList.add('hidden');
    this._loop();
  }

  // ---- 游戏结束 ----
  end() {
    this.gameOver = true;
    SoundEngine.hit();

    // 更新最高分
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('greenFishHighScore', String(this.highScore));
    }

    document.getElementById('score').textContent = String(this.score);
    document.getElementById('highScore').textContent = String(this.highScore);
    document.getElementById('finalScore').textContent = String(this.score);
    document.getElementById('finalHigh').textContent = String(this.highScore);

    const newRecordEl = document.getElementById('newRecord');
    if (this.score >= this.highScore && this.score > 0) {
      newRecordEl.classList.remove('hidden');
    } else {
      newRecordEl.classList.add('hidden');
    }

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

  // ---- 更新逻辑 ----
  _update() {
    const f = this.fish;

    // 重力
    f.vy += f.gravity;
    f.y += f.vy;

    // 落地检测
    const groundTop = this.GROUND_Y;
    if (f.y + f.h >= groundTop) {
      f.y = groundTop - f.h;
      f.vy = 0;

      // 落地压扁效果
      if (f.isJumping) {
        f.squish = 8;
      }
      f.isJumping = false;
    }

    // 压扁恢复
    if (f.squish > 0) {
      f.squish *= 0.85;
      if (f.squish < 0.3) f.squish = 0;
    }

    // ---- 速度递增 ----
    this.speed = this.baseSpeed + Math.floor(this.score / 120) * 0.6;
    this.spawnInterval = Math.max(this.minSpawnInterval, 90 - Math.floor(this.score / 150));

    // ---- 生成障碍物 ----
    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this._spawnObstacle();
    }

    // ---- 移动障碍物 & 碰撞检测 ----
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.speed;

      // 碰撞检测（考虑内边距让判定更友好）
      const padding = 8;
      if (
        f.x + padding < obs.x + obs.w - padding &&
        f.x + f.w - padding > obs.x + padding &&
        f.y + padding < obs.y + obs.h - padding &&
        f.y + f.h - padding > obs.y + padding
      ) {
        this.end();
        return;
      }

      // 移除屏幕外的
      if (obs.x + obs.w < -20) {
        this.obstacles.splice(i, 1);
      }
    }

    // ---- 加分 ----
    // 每通过一个障碍物加分
    for (const obs of this.obstacles) {
      if (!obs.scored && obs.x + obs.w < f.x) {
        obs.scored = true;
        this.score += 10;
        SoundEngine.score();
      }
    }

    // ---- 地面滚动 ----
    this.groundOffset = (this.groundOffset + this.speed) % 40;

    // ---- 泡泡 ----
    if (this.frame % 15 === 0) {
      this.bubbles.push({
        x: Math.random() * this.W,
        y: this.H + 10,
        r: Math.random() * 4 + 2,
        speed: Math.random() * 1.5 + 0.5,
        wobble: Math.random() * Math.PI * 2,
      });
    }
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.y -= b.speed;
      b.x += Math.sin(b.wobble + this.frame * 0.03) * 0.3;
      if (b.y < -20) this.bubbles.splice(i, 1);
    }

    // ---- 背景小鱼 ----
    if (this.frame % 80 === 0 && this.bgFish.length < 5) {
      this.bgFish.push({
        x: this.W + 20,
        y: 50 + Math.random() * (this.GROUND_Y - 100),
        size: Math.random() * 6 + 4,
        speed: Math.random() * 1.5 + 0.8,
        color: ['#f97316', '#fbbf24', '#38bdf8', '#a78bfa'][Math.floor(Math.random() * 4)],
      });
    }
    for (let i = this.bgFish.length - 1; i >= 0; i--) {
      const bf = this.bgFish[i];
      bf.x -= bf.speed + this.speed * 0.3;
      if (bf.x < -40) this.bgFish.splice(i, 1);
    }

    // ---- 云朵 ----
    if (this.frame % 200 === 0 && this.clouds.length < 3) {
      this.clouds.push({
        x: this.W + 40,
        y: 20 + Math.random() * 60,
        w: Math.random() * 50 + 40,
      });
    }
    for (let i = this.clouds.length - 1; i >= 0; i--) {
      this.clouds[i].x -= 0.4;
      if (this.clouds[i].x < -100) this.clouds.splice(i, 1);
    }

    // ---- 海草 ----
    if (this.seaweeds.length === 0 && this.frame < 5) {
      for (let i = 0; i < 6; i++) {
        this.seaweeds.push({
          x: i * 160 + Math.random() * 60,
          h: Math.random() * 30 + 35,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
    // 海草根据屏幕滚动重新定位
    for (const sw of this.seaweeds) {
      sw.x -= this.speed * 0.3;
      if (sw.x < -30) {
        sw.x = this.W + Math.random() * 100;
        sw.h = Math.random() * 30 + 35;
      }
    }

    // ---- 更新 HUD ----
    document.getElementById('score').textContent = String(this.score);
    document.getElementById('highScore').textContent = String(Math.max(this.highScore, this.score));
  }

  // ---- 生成障碍物 ----
  _spawnObstacle() {
    const types = ['coral', 'shell', 'urchin', 'crab', 'tall-coral'];
    // 游戏初期避免 tall-coral
    const available = this.score < 80 ?
      ['coral', 'shell', 'urchin'] :
      types;

    const type = available[Math.floor(Math.random() * available.length)];

    let w, h, yOffset;
    switch (type) {
      case 'coral':
        w = 28; h = 40; yOffset = 0;
        break;
      case 'shell':
        w = 34; h = 24; yOffset = 16;
        break;
      case 'urchin':
        w = 24; h = 22; yOffset = 18;
        break;
      case 'crab':
        w = 36; h = 22; yOffset = 18;
        break;
      case 'tall-coral':
        w = 22; h = 52; yOffset = -12;
        break;
      default:
        w = 28; h = 40; yOffset = 0;
    }

    this.obstacles.push({
      type,
      x: this.W + 20,
      y: this.GROUND_Y - h - yOffset,
      w,
      h,
      scored: false,
    });
  }

  // ==========================================================
  // 绘制系统
  // ==========================================================
  _draw() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;

    // ---- 天空/海水渐变 ----
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#0a2a4a');
    skyGrad.addColorStop(0.3, '#0c3d66');
    skyGrad.addColorStop(0.7, '#0e527d');
    skyGrad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // ---- 光线 ----
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const lx = (i * 220 + this.frame * 0.2) % (W + 200) - 100;
      const grad = ctx.createLinearGradient(lx, 0, lx + 30, H);
      grad.addColorStop(0, 'rgba(255,255,255,0.04)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.01)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(lx - 15, 0, 40, H);
    }
    ctx.restore();

    // ---- 云朵 ----
    for (const c of this.clouds) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.w / 2, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(c.x - c.w * 0.2, c.y + 4, c.w * 0.35, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(c.x + c.w * 0.25, c.y + 3, c.w * 0.3, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // ---- 远山/海床 ----
    ctx.fillStyle = '#083450';
    ctx.beginPath();
    for (let x = 0; x <= W; x += 2) {
      const y = this.GROUND_Y - 35 + Math.sin(x * 0.02 + this.frame * 0.005) * 8;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // ---- 背景小鱼 ----
    for (const bf of this.bgFish) {
      ctx.fillStyle = bf.color;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.ellipse(bf.x, bf.y, bf.size, bf.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // 尾
      ctx.beginPath();
      ctx.moveTo(bf.x + bf.size, bf.y);
      ctx.lineTo(bf.x + bf.size + 6, bf.y - bf.size * 0.7);
      ctx.lineTo(bf.x + bf.size + 6, bf.y + bf.size * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // ---- 海草 ----
    for (const sw of this.seaweeds) {
      const baseY = this.GROUND_Y + 2;
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(sw.x, baseY);
      const topX = sw.x + Math.sin(this.frame * 0.03 + sw.phase) * 12;
      ctx.quadraticCurveTo(sw.x + Math.sin(this.frame * 0.04 + sw.phase) * 8, baseY - sw.h / 2, topX, baseY - sw.h);
      ctx.stroke();

      // 第二片叶子
      ctx.beginPath();
      ctx.moveTo(sw.x - 4, baseY);
      ctx.quadraticCurveTo(sw.x - 4 + Math.cos(this.frame * 0.035 + sw.phase) * 8, baseY - sw.h * 0.6, topX - 6, baseY - sw.h * 0.8);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // ---- 海底沙地 ----
    const sandGrad = ctx.createLinearGradient(0, this.GROUND_Y, 0, H);
    sandGrad.addColorStop(0, '#c4a46c');
    sandGrad.addColorStop(0.15, '#b8956a');
    sandGrad.addColorStop(0.5, '#a6845e');
    sandGrad.addColorStop(1, '#8a6d4b');
    ctx.fillStyle = sandGrad;
    ctx.fillRect(0, this.GROUND_Y, W, H - this.GROUND_Y);

    // 沙地波纹
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const sy = this.GROUND_Y + 8 + i * 8;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const y = sy + Math.sin(x * 0.03 + i + this.groundOffset * 0.05) * 3;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 小石头（使用确定性种子避免闪烁）
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for (let i = 0; i < 8; i++) {
      const sx = (i * 110 + 30 - this.groundOffset * 2) % (W + 200) - 100;
      const sy = this.GROUND_Y + 8 + Math.sin(i * 2.5) * 5;
      // 用索引生成固定的伪随机尺寸
      const seed1 = ((i * 7 + 3) % 11) / 11;
      const seed2 = ((i * 13 + 5) % 7) / 7;
      ctx.beginPath();
      ctx.ellipse(sx, sy, seed1 * 3 + 2, seed2 * 1.5 + 1, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // ---- 障碍物 ----
    for (const obs of this.obstacles) {
      this._drawObstacle(ctx, obs);
    }

    // ---- 绿头鱼 ----
    this._drawFish(ctx);

    // ---- 泡泡（前景） ----
    for (const b of this.bubbles) {
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();
      // 高光
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---- 绘制绿头鱼 ----
  _drawFish(ctx) {
    const f = this.fish;
    const cx = f.x + f.w / 2;
    const cy = f.y + f.h / 2;
    const frame = this.frame;

    ctx.save();
    ctx.translate(cx, cy);

    // 跳跃时的倾斜
    const tilt = f.isJumping ? f.vy * 0.03 : 0;
    ctx.rotate(tilt);

    // 压扁效果（落地时）
    let scaleX = 1, scaleY = 1;
    if (f.squish > 0.5) {
      scaleX = 1 + f.squish * 0.015;
      scaleY = 1 - f.squish * 0.02;
    }
    ctx.scale(scaleX, scaleY);

    const hw = f.w / 2;
    const hh = f.h / 2;

    // --- 鱼尾（在身体后面） ---
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.moveTo(hw - 4, 0);
    ctx.lineTo(hw + 14, -12);
    ctx.lineTo(hw + 14, 12);
    ctx.closePath();
    ctx.fill();

    // 尾纹
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hw + 2, 0);
    ctx.lineTo(hw + 10, -6);
    ctx.moveTo(hw + 2, 0);
    ctx.lineTo(hw + 10, 6);
    ctx.stroke();

    // --- 鱼身（大椭圆） ---
    const bodyGrad = ctx.createRadialGradient(-3, -5, 2, 0, 0, hw);
    bodyGrad.addColorStop(0, '#86efac');
    bodyGrad.addColorStop(0.4, '#4ade80');
    bodyGrad.addColorStop(1, '#16a34a');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
    ctx.fill();

    // 肚皮
    ctx.fillStyle = '#bbf7d0';
    ctx.beginPath();
    ctx.ellipse(-2, 6, hw * 0.55, hh * 0.4, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // --- 上鱼鳍 ---
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.moveTo(-8, -hh + 2);
    ctx.lineTo(-2, -hh - 10);
    ctx.lineTo(12, -hh + 4);
    ctx.closePath();
    ctx.fill();

    // --- 下鱼鳍 ---
    ctx.beginPath();
    ctx.moveTo(-8, hh - 2);
    ctx.lineTo(-2, hh + 8);
    ctx.lineTo(10, hh - 2);
    ctx.closePath();
    ctx.fill();

    // --- 眼睛（白） ---
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-8, -5, 10, 0, Math.PI * 2);
    ctx.fill();

    // 眼眶
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // --- 瞳孔 ---
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(-5, -5, 5, 0, Math.PI * 2);
    ctx.fill();

    // 高光
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-7, -8, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 小高光
    ctx.beginPath();
    ctx.arc(-3, -3, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // --- 嘴巴（经典 O 型嘴） ---
    const mouthOpen = f.isJumping ? 5.5 : 4;
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(-hw + 8, 2, mouthOpen, 0, Math.PI * 2);
    ctx.fill();

    // 嘴巴内部
    ctx.fillStyle = '#881337';
    ctx.beginPath();
    ctx.arc(-hw + 8, 2, mouthOpen * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // --- 腮红 ---
    ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-14, 5, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ---- 绘制障碍物 ----
  _drawObstacle(ctx, obs) {
    const { x, y, w, h, type } = obs;

    switch (type) {
      case 'coral':
        this._drawCoral(ctx, x, y, w, h);
        break;
      case 'shell':
        this._drawShell(ctx, x, y, w, h);
        break;
      case 'urchin':
        this._drawUrchin(ctx, x, y, w, h);
        break;
      case 'crab':
        this._drawCrab(ctx, x, y, w, h);
        break;
      case 'tall-coral':
        this._drawTallCoral(ctx, x, y, w, h);
        break;
    }
  }

  _drawCoral(ctx, x, y, w, h) {
    // 珊瑚礁主体
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.quadraticCurveTo(x + w * 0.1, y + h * 0.1, x + w * 0.3, y);
    ctx.quadraticCurveTo(x + w * 0.4, y + h * 0.3, x + w * 0.5, y + h * 0.25);
    ctx.quadraticCurveTo(x + w * 0.6, y - 2, x + w * 0.8, y + h * 0.15);
    ctx.quadraticCurveTo(x + w, y + h * 0.4, x + w, y + h * 0.6);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();

    // 高光
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(x + w * 0.3, y + h * 0.25, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawTallCoral(ctx, x, y, w, h) {
    // 高珊瑚
    const stemX = x + w / 2;
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(stemX, y + h);
    ctx.lineTo(stemX, y + 8);
    ctx.stroke();

    // 触手顶
    ctx.fillStyle = '#f43f5e';
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI / 2 + (i - 2) * 0.25;
      const tx = stemX + Math.cos(angle) * 10;
      const ty = y + 8 + Math.sin(angle) * 6;
      ctx.beginPath();
      ctx.arc(tx, ty, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawShell(ctx, x, y, w, h) {
    // 贝壳
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.quadraticCurveTo(x + w * 0.3, y + h * 0.1, x + w * 0.5, y);
    ctx.quadraticCurveTo(x + w * 0.7, y + h * 0.1, x + w, y + h);
    ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.5, x, y + h);
    ctx.closePath();
    ctx.fill();

    // 纹理
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(x + w * 0.15 + i * 3, y + h);
      ctx.lineTo(x + w * 0.5, y + h * 0.15 + i * 2);
      ctx.stroke();
    }
  }

  _drawUrchin(ctx, x, y, w, h) {
    // 海胆 - 圆身体 + 刺
    const cx = x + w / 2, cy = y + h / 2 + 2;
    const r = Math.min(w, h) * 0.35;

    // 刺
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2 + this.frame * 0.02;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      ctx.lineTo(cx + Math.cos(angle) * (r + 8), cy + Math.sin(angle) * (r + 8));
      ctx.stroke();
    }

    // 身体
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(cx, cy, r + 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.arc(cx - 1, cy - 1, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawCrab(ctx, x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2 + 2;

    // 蟹腿
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    for (let side = -1; side <= 1; side += 2) {
      for (let leg = 0; leg < 3; leg++) {
        ctx.beginPath();
        const lx = cx + side * 10;
        const ly = cy - 2 + leg * 5;
        ctx.moveTo(lx, ly);
        ctx.quadraticCurveTo(lx + side * 14, ly - 3, lx + side * 16, cy - 2 + leg * 5);
        ctx.stroke();
      }
      // 蟹钳
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      const clawX = cx + side * 18;
      ctx.arc(clawX, cy - 3, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(clawX + side * 2, cy - 5, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 蟹身
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.ellipse(cx - 2, cy - 2, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 3, cy - 6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 3, cy - 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ==========================================================
  // 绘制初始场景（静态，游戏未开始前显示）
  // ==========================================================
  drawStatic() {
    // 仅画一帧静态画面
    this.clouds = [
      { x: 200, y: 40, w: 60 },
      { x: 500, y: 25, w: 50 },
      { x: 650, y: 50, w: 45 },
    ];
    this.bgFish = [
      { x: 550, y: 120, size: 6, color: '#f97316' },
      { x: 680, y: 160, size: 5, color: '#38bdf8' },
      { x: 450, y: 180, size: 4, color: '#fbbf24' },
    ];
    // 初始化海草
    for (let i = 0; i < 6; i++) {
      this.seaweeds.push({
        x: i * 160 + 30 + Math.random() * 60,
        h: Math.random() * 30 + 35,
        phase: Math.random() * Math.PI * 2,
      });
    }
    this._draw();
  }
}

// ============================================================
// 启动
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new Game(canvas);

  // 绘制初始画面
  game.drawStatic();

  // 按钮事件
  document.getElementById('btnStart').addEventListener('click', (e) => {
    e.stopPropagation();
    game.start();
  });
  document.getElementById('btnRestart').addEventListener('click', (e) => {
    e.stopPropagation();
    game.start();
  });

  // 显示最高分
  document.getElementById('highScore').textContent = String(game.highScore);

  // 响应式 canvas 缩放
  function resize() {
    const maxWidth = Math.min(window.innerWidth - 20, 800);
    const scale = maxWidth / 800;
    canvas.style.width = maxWidth + 'px';
    canvas.style.height = (400 * scale) + 'px';
  }
  window.addEventListener('resize', resize);
  resize();
});
