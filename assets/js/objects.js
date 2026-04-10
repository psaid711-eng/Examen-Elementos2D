/* =============================================
   objects.js — Clases de objetos del juego
   Galaxy Defender
   ============================================= */

class GameObject {
  constructor(canvas, type) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');
    this.type     = type;

    // Estado único: 'alive' | 'dying' | 'dead'
    this.state     = 'alive';
    this.hitTimer  = 0;
    this.opacity   = 1;

    this._init();
  }

  _init() {
    const W = this.canvas.width;
    const H = this.canvas.height;

    const sizes = { asteroid: [38, 64], enemy: [44, 58], bonus: [28, 40] };
    const [minS, maxS] = sizes[this.type] || [30, 50];
    this.size = minS + Math.random() * (maxS - minS);

    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0: this.x = Math.random() * W; this.y = -this.size;    break;
      case 1: this.x = W + this.size;     this.y = Math.random() * H; break;
      case 2: this.x = Math.random() * W; this.y = H + this.size; break;
      case 3: this.x = -this.size;        this.y = Math.random() * H; break;
    }

    const tx    = W / 2 + (Math.random() - 0.5) * W * 0.5;
    const ty    = H / 2 + (Math.random() - 0.5) * H * 0.5;
    const angle = Math.atan2(ty - this.y, tx - this.x);

    this.vx        = Math.cos(angle);
    this.vy        = Math.sin(angle);
    this.rotation  = Math.random() * Math.PI * 2;
    this.rotSpeed  = (Math.random() - 0.5) * 0.06;

    this.zigzag      = this.type === 'enemy';
    this.zigzagTimer = 0;
    this.zigzagAmp   = (Math.random() * 0.8 + 0.4) * (Math.random() < 0.5 ? 1 : -1);
  }

  isDead()  { return this.state === 'dead';  }
  isAlive() { return this.state === 'alive'; }

  destroy() {
    if (this.state !== 'alive') return;
    this.state    = 'dying';
    this.hitTimer = 250;
  }

  kill() {
    this.state = 'dead';
  }

  update(speed, delta) {
    if (this.state === 'dead') return;

    if (this.state === 'dying') {
      this.hitTimer -= delta;
      this.opacity   = Math.max(0, this.hitTimer / 250);
      if (this.hitTimer <= 0) {
        this.state   = 'dead';
        this.opacity = 0;
      }
      return;
    }

    // alive: movimiento normal
    if (this.zigzag) {
      this.zigzagTimer += delta * 0.002;
      const perp = { x: -this.vy, y: this.vx };
      const amp  = Math.sin(this.zigzagTimer) * this.zigzagAmp;
      this.x += (this.vx + perp.x * amp) * speed * delta * 0.06;
      this.y += (this.vy + perp.y * amp) * speed * delta * 0.06;
    } else {
      this.x += this.vx * speed * delta * 0.06;
      this.y += this.vy * speed * delta * 0.06;
    }
    this.rotation += this.rotSpeed;
  }

  collides(px, py) {
    if (this.state !== 'alive') return false;
    const dx = px - this.x;
    const dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.size * 0.5;
  }

  isOutOfBounds() {
    const m = this.size * 2;
    return (
      this.x < -m || this.x > this.canvas.width  + m ||
      this.y < -m || this.y > this.canvas.height + m
    );
  }

  draw(images) {
    if (this.state === 'dead') return;

    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const img = images[this.type];
    if (img && img.complete && img.naturalWidth > 0) {
      if (this.state === 'dying') ctx.filter = 'brightness(5) saturate(0)';
      ctx.drawImage(img, -this.size / 2, -this.size / 2, this.size, this.size);
      ctx.filter = 'none';
    } else {
      this._drawFallback(ctx);
    }

    ctx.restore();
  }

  _drawFallback(ctx) {
    const s = this.size / 2;
    const colors = { asteroid: '#88cc44', enemy: '#ff4422', bonus: '#ffdd00' };
    ctx.fillStyle = this.state === 'dying' ? '#ffffff' : (colors[this.type] || '#ffffff');
    if (this.state === 'dying') { ctx.shadowBlur = 20; ctx.shadowColor = '#ffffff'; }

    ctx.beginPath();
    if (this.type === 'asteroid') {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const r = s * (0.7 + Math.sin(i * 2.3) * 0.3);
        i === 0 ? ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r) : ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
      }
    } else if (this.type === 'enemy') {
      ctx.moveTo(0,-s); ctx.lineTo(s*.6,0); ctx.lineTo(s*1.1,s*.5);
      ctx.lineTo(0,s*.3); ctx.lineTo(-s*1.1,s*.5); ctx.lineTo(-s*.6,0);
    } else {
      for (let i = 0; i < 10; i++) {
        const a = (i/10)*Math.PI*2 - Math.PI/2;
        const r = i%2===0 ? s : s*.45;
        i===0 ? ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r) : ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
      }
    }
    ctx.closePath();
    ctx.fill();
  }
}

/* ─────────────────────────────────────────── */

class Particle {
  constructor(x, y, color) {
    this.x = x; this.y = y; this.color = color;
    const speed = 1.5 + Math.random() * 4;
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1.0;
    this.decay = 0.025 + Math.random() * 0.04;
    this.size = 2 + Math.random() * 4;
  }
  update() { this.x += this.vx; this.y += this.vy; this.vy += 0.06; this.life -= this.decay; }
  draw(ctx) {
  const radius = this.size * this.life;

  if (radius <= 0) return; // 🔥 evita el error

  ctx.save();
  ctx.globalAlpha = Math.max(0, this.life);
  ctx.fillStyle = this.color;
  ctx.shadowBlur = 6;
  ctx.shadowColor = this.color;

  ctx.beginPath();
  ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

  isDead() { return this.life <= 0; }
}

/* ─────────────────────────────────────────── */

class FloatingText {
  constructor(x, y, text, color = '#f0c040') {
    this.x = x; this.y = y; this.text = text; this.color = color;
    this.life = 1.0; this.vy = -1.8;
  }
  update() { this.y += this.vy; this.life -= 0.02; }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10; ctx.shadowColor = this.color;
    ctx.font = `bold ${Math.round(18 + (1-this.life)*6)}px Orbitron, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
  isDead() { return this.life <= 0; }
}
