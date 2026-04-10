/* =============================================
   game.js — Lógica principal del juego
   Galaxy Defender
   ============================================= */

window.addEventListener('DOMContentLoaded', () => {

  const CANVAS_W = 960;
  const CANVAS_H = 540;

  const POINTS = { asteroid: 10, enemy: 25, bonus: 50 };
  const COLORS  = { asteroid: '#88cc44', enemy: '#ff4422', bonus: '#ffdd00' };

  const LEVEL_CONFIG = [
    { maxObjs: 6,  spawnInterval: 1800, baseSpeed: 1.0, bonusChance: 0.12 },
    { maxObjs: 8,  spawnInterval: 1500, baseSpeed: 1.3, bonusChance: 0.14 },
    { maxObjs: 10, spawnInterval: 1200, baseSpeed: 1.6, bonusChance: 0.15 },
    { maxObjs: 13, spawnInterval: 1000, baseSpeed: 1.9, bonusChance: 0.16 },
    { maxObjs: 16, spawnInterval:  800, baseSpeed: 2.3, bonusChance: 0.17 },
    { maxObjs: 20, spawnInterval:  650, baseSpeed: 2.8, bonusChance: 0.18 },
  ];

  const SCORE_PER_LEVEL = 200;

  /* ── Canvas ── */
  const canvas = document.getElementById('gameCanvas');
  const ctx    = canvas.getContext('2d');
  canvas.width  = CANVAS_W;
  canvas.height = CANVAS_H;

  /* ── Imágenes ── */
  const images = {};
  function loadImage(key, src) {
    const img = new Image();
    img.src = src;
    images[key] = img;
  }
  loadImage('bg',       'assets/img/bg-space.jpg');
  loadImage('asteroid', 'assets/img/asteroid.png');
  loadImage('enemy',    'assets/img/enemy-ship.png');
  loadImage('bonus',    'assets/img/bonus-star.png');

  const cursorImg = new Image();
  cursorImg.src = 'assets/images/cursor-crosshair.png';
  const CURSOR_SIZE = 48;

  /* ── Estado ── */
  let state      = 'start';
  let score      = 0;
  let level      = 1;
  let lives      = 3;
  let spawnTimer = 0;
  let objects    = [];
  let particles  = [];
  let floats     = [];
  let mouseX     = CANVAS_W / 2;
  let mouseY     = CANVAS_H / 2;
  let lastTime   = 0;
  let rafId      = null;

  /* ── Helpers ── */
  function getLevelCfg() {
    return LEVEL_CONFIG[Math.min(level - 1, LEVEL_CONFIG.length - 1)];
  }

  function checkLevelUp() {
    if (score >= level * SCORE_PER_LEVEL) {
      level++;
      UI.updateLevel(level);
      UI.announceLevel(level);
      if (level % 3 === 0 && lives < 5) { lives++; UI.updateLives(lives); }
    }
  }

  function spawnObject() {
    const cfg = getLevelCfg();
    const alive = objects.filter(o => o.isAlive()).length;
    if (alive >= cfg.maxObjs) return;

    const rand = Math.random();
    const type = rand < cfg.bonusChance ? 'bonus'
               : rand < cfg.bonusChance + 0.35 ? 'enemy'
               : 'asteroid';

    objects.push(new GameObject(canvas, type));
  }

  function explode(x, y, type) {
    const color = COLORS[type] || '#fff';
    for (let i = 0; i < (type === 'bonus' ? 20 : 12); i++) {
      particles.push(new Particle(x, y, color));
    }
    floats.push(new FloatingText(x, y - 20, `+${POINTS[type]}`, color));
  }

  /* ── Game control ── */
  function resetGame() {
    score = 0; level = 1; lives = 3; spawnTimer = 0;
    objects = []; particles = []; floats = [];
    UI.updateScore(0); UI.updateBest(0);
    UI.updateLevel(1); UI.updateLives(3);
  }

  function startGame() {
    resetGame();
    state = 'playing';
    UI.hideStart(); UI.hideGameOver(); UI.hidePause();
    lastTime = performance.now();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  }

  function gameOver() {
    state = 'gameover';
    UI.showGameOver(score);
  }

  /* ── Eventos ── */
  canvas.addEventListener('click', (e) => {
    if (state !== 'playing') return;
    const rect  = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (CANVAS_W / rect.width);
    const cy = (e.clientY - rect.top)  * (CANVAS_H / rect.height);

    let hit = false;
    for (const obj of objects) {
      if (obj.collides(cx, cy)) {
        obj.destroy();
        score += POINTS[obj.type] || 0;
        UI.updateScore(score);
        UI.updateBest(score);
        explode(obj.x, obj.y, obj.type);
        checkLevelUp();
        hit = true;
        break;
      }
    }

    if (!hit && level >= 3) {
      score = Math.max(0, score - 5);
      UI.updateScore(score);
      floats.push(new FloatingText(cx, cy, '-5', '#ff4466'));
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (CANVAS_W / rect.width);
    mouseY = (e.clientY - rect.top)  * (CANVAS_H / rect.height);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      if (state === 'playing') {
        state = 'paused';
        UI.showPause();
      } else if (state === 'paused') {
        state = 'playing';
        UI.hidePause();
        lastTime = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    }
  });

  document.getElementById('btn-start').addEventListener('click', startGame);
  document.getElementById('btn-restart').addEventListener('click', startGame);
  document.getElementById('btn-pause')?.addEventListener('click', () => {
    if (state === 'playing') { state = 'paused'; UI.showPause(); }
  });
  document.getElementById('btn-resume')?.addEventListener('click', () => {
    if (state === 'paused') {
      state = 'playing'; UI.hidePause();
      lastTime = performance.now();
      rafId = requestAnimationFrame(loop);
    }
  });

  /* ── Fondo de estrellas (fallback) ── */
  const stars = Array.from({ length: 180 }, () => ({
    x: Math.random() * CANVAS_W, y: Math.random() * CANVAS_H,
    r: Math.random() * 1.5 + 0.2, b: Math.random()
  }));

  function drawBackground(t) {
    const bg = images.bg;
    if (bg && bg.complete && bg.naturalWidth > 0) {
      ctx.drawImage(bg, 0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = 'rgba(0,0,10,0.35)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    } else {
      const grad = ctx.createRadialGradient(CANVAS_W*.5, CANVAS_H*.5, 0, CANVAS_W*.5, CANVAS_H*.5, CANVAS_W*.75);
      grad.addColorStop(0, '#0a0a2a');
      grad.addColorStop(1, '#020208');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      for (const s of stars) {
        ctx.globalAlpha = (0.5 + 0.5 * Math.sin(t * 0.001 + s.b * 20)) * 0.9;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  function drawCursor() {
    ctx.save();
    if (cursorImg.complete && cursorImg.naturalWidth > 0) {
      ctx.drawImage(cursorImg, mouseX - CURSOR_SIZE/2, mouseY - CURSOR_SIZE/2, CURSOR_SIZE, CURSOR_SIZE);
    } else {
      const r = 14, gap = 5;
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth   = 1.5;
      ctx.shadowBlur  = 8;
      ctx.shadowColor = '#00e5ff';
      ctx.beginPath();
      ctx.moveTo(mouseX-r, mouseY); ctx.lineTo(mouseX-gap, mouseY);
      ctx.moveTo(mouseX+gap, mouseY); ctx.lineTo(mouseX+r, mouseY);
      ctx.moveTo(mouseX, mouseY-r); ctx.lineTo(mouseX, mouseY-gap);
      ctx.moveTo(mouseX, mouseY+gap); ctx.lineTo(mouseX, mouseY+r);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 4, 0, Math.PI*2);
      ctx.stroke();
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 1.5, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }

  /* ══════════════════════════════════════════
     GAME LOOP — simple y sin estados mezclados
  ══════════════════════════════════════════ */
  function loop(timestamp) {

  const delta = Math.min(timestamp - lastTime, 50);
  lastTime = timestamp;

  if (state === 'playing') {

    const cfg   = getLevelCfg();
    const speed = cfg.baseSpeed + (level - 1) * 0.18;

    /* — Spawn — */
    spawnTimer += delta;
    if (spawnTimer >= cfg.spawnInterval) {
      spawnTimer = 0;
      spawnObject();
    }

    /* — Update objetos — */
    for (const obj of objects) {
      obj.update(speed, delta);

      if (obj.isAlive() && obj.isOutOfBounds()) {
        obj.kill();

        if (obj.type !== 'bonus') {
          lives--;
          UI.updateLives(lives);

          if (lives <= 0) {
            gameOver();
          }
        }
      }
    }

    objects = objects.filter(o => !o.isDead());

    particles = particles.filter(p => !p.isDead());
    particles.forEach(p => p.update());

    floats = floats.filter(f => !f.isDead());
    floats.forEach(f => f.update());
  }

  /* — Render SIEMPRE — */
  drawBackground(timestamp);
  objects.forEach(o => o.draw(images));
  particles.forEach(p => p.draw(ctx));
  floats.forEach(f => f.draw(ctx));
  drawCursor();

  rafId = requestAnimationFrame(loop);
}
      
  /* ── Init ── */
  UI.showStart();
  UI.updateBest(0);

  // Render estático en pantallas de inicio/gameover
  function staticRender(ts) {
    if (state === 'playing' || state === 'paused') return;
    drawBackground(ts);
    drawCursor();
    requestAnimationFrame(staticRender);
  }
  requestAnimationFrame(staticRender);

});
