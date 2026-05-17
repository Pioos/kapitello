/* ═══════════════════════════════════════════════════════════
   VaultX — crypto-landing.js
   - Hero canvas (hex grid + floating particles)
   - Live price simulation with mini-charts
   - Ticker tape
   - Counter animation
   - Scroll reveal
   - Nav scroll state + mobile menu
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ── Price State ───────────────────────────────────────────
const PRICES = {
  BTC: { price: 67284.50, change: 2.4,  vol: '32.4B', history: [] },
  ETH: { price: 3542.10,  change: 1.8,  vol: '18.7B', history: [] },
  SOL: { price: 182.33,   change: -0.7, vol: '4.2B',  history: [] },
};

const TICKER_COINS = [
  { symbol: 'BTC', price: 67284.50, change: 2.4 },
  { symbol: 'ETH', price: 3542.10,  change: 1.8 },
  { symbol: 'SOL', price: 182.33,   change: -0.7 },
  { symbol: 'BNB', price: 584.20,   change: 0.9 },
  { symbol: 'XRP', price: 0.5812,   change: -1.2 },
  { symbol: 'ADA', price: 0.4521,   change: 3.1 },
  { symbol: 'AVAX',price: 38.74,    change: 1.4 },
  { symbol: 'MATIC',price: 0.8834,  change: -0.5 },
  { symbol: 'LINK', price: 14.62,   change: 2.7 },
  { symbol: 'DOT',  price: 7.83,    change: -0.3 },
];

// ── Hero Canvas (hex grid + particles) ───────────────────
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, hexes = [], particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildHexGrid();
  }

  function buildHexGrid() {
    hexes = [];
    const size = 32;
    const w = size * Math.sqrt(3);
    const h = size * 2;
    const cols = Math.ceil(W / w) + 2;
    const rows = Math.ceil(H / (h * 0.75)) + 2;

    for (let r = -1; r < rows; r++) {
      for (let c = -1; c < cols; c++) {
        const x = c * w + (r % 2 ? w / 2 : 0);
        const y = r * h * 0.75;
        hexes.push({ x, y, size, opacity: Math.random() * 0.04 + 0.01 });
      }
    }
  }

  function hexPath(x, y, s) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      const px = x + s * Math.cos(angle);
      const py = y + s * Math.sin(angle);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  // Particles
  function spawnParticle() {
    particles.push({
      x: Math.random() * W,
      y: H + 10,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.6 + 0.3),
      life: 1,
      decay: Math.random() * 0.003 + 0.001,
      size: Math.random() * 2 + 1,
      hue: Math.random() > 0.5 ? 'gold' : 'purple',
    });
  }

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw hex grid
    hexes.forEach(h => {
      hexPath(h.x, h.y, h.size - 1);
      ctx.strokeStyle = `rgba(255,255,255,${h.opacity})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // Spawn particles
    if (frame % 8 === 0 && particles.length < 60) spawnParticle();

    // Update + draw particles
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      const alpha = p.life * 0.7;
      const color = p.hue === 'gold'
        ? `rgba(245,158,11,${alpha})`
        : `rgba(139,92,246,${alpha})`;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    frame++;
    requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();
  draw();
}

// ── Mini Sparkline Chart ──────────────────────────────────
function generateHistory(base, points = 40) {
  const hist = [];
  let v = base;
  for (let i = 0; i < points; i++) {
    v *= 1 + (Math.random() - 0.5) * 0.012;
    hist.push(v);
  }
  return hist;
}

function drawSparkline(canvasId, data, color, glowColor) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 280;
  const H = 80;
  canvas.width  = W;
  canvas.height = H;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * (H - 12) - 6,
  }));

  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, glowColor);
  grad.addColorStop(1, 'transparent');

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.forEach((p, i) => {
    if (i === 0) return;
    const cp = pts[i - 1];
    const mx = (cp.x + p.x) / 2;
    ctx.bezierCurveTo(mx, cp.y, mx, p.y, p.x, p.y);
  });
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.forEach((p, i) => {
    if (i === 0) return;
    const cp = pts[i - 1];
    const mx = (cp.x + p.x) / 2;
    ctx.bezierCurveTo(mx, cp.y, mx, p.y, p.x, p.y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 6;
  ctx.shadowColor = color;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// ── Price Cards ───────────────────────────────────────────
function initPriceCards() {
  const coinMap = {
    BTC: { chartId: 'chart-btc', priceId: 'btc-price', changeId: 'btc-change', color: '#F7931A', glow: 'rgba(247,147,26,0.15)' },
    ETH: { chartId: 'chart-eth', priceId: 'eth-price', changeId: 'eth-change', color: '#627EEA', glow: 'rgba(98,126,234,0.15)' },
    SOL: { chartId: 'chart-sol', priceId: 'sol-price', changeId: 'sol-change', color: '#9945FF', glow: 'rgba(153,69,255,0.15)' },
  };

  // Seed history
  Object.keys(PRICES).forEach(sym => {
    PRICES[sym].history = generateHistory(PRICES[sym].price);
  });

  function renderCharts() {
    Object.entries(coinMap).forEach(([sym, cfg]) => {
      drawSparkline(cfg.chartId, PRICES[sym].history, cfg.color, cfg.glow);
    });
  }

  renderCharts();

  // Simulate live price updates
  setInterval(() => {
    Object.keys(PRICES).forEach(sym => {
      const coin = PRICES[sym];
      const delta = (Math.random() - 0.497) * coin.price * 0.002;
      coin.price += delta;
      coin.change += (Math.random() - 0.5) * 0.1;
      coin.history.push(coin.price);
      if (coin.history.length > 60) coin.history.shift();

      const cfg = coinMap[sym];
      const priceEl  = document.getElementById(cfg.priceId);
      const changeEl = document.getElementById(cfg.changeId);

      if (priceEl) {
        const formatted = sym === 'SOL'
          ? `$${coin.price.toFixed(2)}`
          : `$${coin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        priceEl.textContent = formatted;
        // Flash effect
        priceEl.style.transition = 'color 150ms';
        priceEl.style.color = delta > 0 ? '#22C55E' : '#EF4444';
        setTimeout(() => { priceEl.style.color = ''; }, 400);
      }

      if (changeEl) {
        const c = coin.change;
        changeEl.textContent = `${c >= 0 ? '+' : ''}${c.toFixed(1)}%`;
        changeEl.className = `price-card__badge price-card__badge--${c >= 0 ? 'up' : 'down'}`;
      }
    });

    renderCharts();
  }, 1800);
}

// ── Ticker Tape ───────────────────────────────────────────
function initTicker() {
  const track = document.getElementById('ticker-track');
  if (!track) return;

  function buildItems(coins) {
    return coins.map(c => {
      const up = c.change >= 0;
      return `<div class="ticker__item">
        <span class="ticker__symbol">${c.symbol}</span>
        <span class="ticker__price">$${c.price.toLocaleString('en-US', { minimumFractionDigits: c.price < 1 ? 4 : 2, maximumFractionDigits: c.price < 1 ? 4 : 2 })}</span>
        <span class="${up ? 'ticker__up' : 'ticker__down'}">${up ? '▲' : '▼'} ${Math.abs(c.change).toFixed(1)}%</span>
      </div>`;
    }).join('');
  }

  // Duplicate for seamless loop
  track.innerHTML = buildItems(TICKER_COINS) + buildItems(TICKER_COINS);
}

// ── Counter Animation ─────────────────────────────────────
function animateCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const isDecimal = target % 1 !== 0;
      const duration = 1800;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = target * ease;
        const display = isDecimal
          ? current.toFixed(2)
          : Math.round(current).toLocaleString('en-US');
        el.textContent = (el.dataset.prefix || '') + display + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  els.forEach(el => observer.observe(el));
}

// ── Scroll Reveal ─────────────────────────────────────────
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      // Stagger siblings
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 80);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

// ── Nav scroll + mobile ───────────────────────────────────
function initNav() {
  const nav    = document.getElementById('nav');
  const burger = document.querySelector('.nav__burger');
  const mobile = document.getElementById('nav-mobile');

  // Scroll state
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
      ticking = false;
    });
    ticking = true;
  }, { passive: true });

  // Mobile toggle
  if (burger && mobile) {
    burger.addEventListener('click', () => {
      const open = mobile.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      mobile.setAttribute('aria-hidden', !open);
    });

    // Close on link click
    mobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobile.classList.remove('open');
        burger.setAttribute('aria-expanded', false);
        mobile.setAttribute('aria-hidden', true);
      });
    });
  }
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHeroCanvas();
  initTicker();
  initPriceCards();
  animateCounters();
  initReveal();
});
