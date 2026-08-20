'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ── Sticky header ──────────────────────────────────────
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // ── Hero hex canvas ────────────────────────────────────
  initHeroCanvas();

  // ── Rotująca fraza w nagłówku ──────────────────────────
  initRotator();

  // ── Mobile menu ────────────────────────────────────────
  const toggle = document.querySelector('.menu-toggle');
  const nav    = document.querySelector('.nav');

  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('active');
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  document.querySelectorAll('.nav__link, .btn--nav').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      toggle?.classList.remove('active');
      toggle?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', e => {
    if (nav.classList.contains('active') && !nav.contains(e.target) && !toggle?.contains(e.target)) {
      nav.classList.remove('active');
      toggle?.classList.remove('active');
      toggle?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // ── Scroll reveal ──────────────────────────────────────
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('active');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // ── Counter animation ──────────────────────────────────
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      animateCounter(e.target);
      counterObs.unobserve(e.target);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-item__number[data-target]').forEach(el => counterObs.observe(el));

  function animateCounter(el) {
    const target   = +el.dataset.target;
    const suffix   = el.dataset.suffix || '';
    const duration = 1600;
    const start    = performance.now();

    (function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      const value    = Math.round(ease * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    })(start);
  }

  // ── Smooth scroll ──────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = header.offsetHeight + 16;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── Contact form ───────────────────────────────────────
  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const btn      = form.querySelector('.form__submit');
    const original = btn.innerHTML;

    btn.disabled   = true;
    btn.innerHTML  = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true" style="animation:spin .8s linear infinite">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      Wysyłanie...`;

    setTimeout(() => {
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
          aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        Wiadomość wysłana!`;
      btn.style.background = 'var(--primary)';
      form.reset();
      setTimeout(() => {
        btn.disabled         = false;
        btn.innerHTML        = original;
        btn.style.background = '';
      }, 4000);
    }, 1200);
  });

});

// ── Spinner keyframe ───────────────────────────────────────
const _spinStyle = document.createElement('style');
_spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(_spinStyle);

// ── Rotująca fraza w nagłówku ──────────────────────────────
// Lekka alternatywa dla slidera: podmienia jedno słowo, reszta
// nagłówka stoi w miejscu. Frazy są odmienione, bo "Twojego firmy"
// byłoby błędem — dlatego rotuje cała fraza, nie samo słowo.
function initRotator() {
  const el    = document.querySelector('.rotator');
  const duch  = el?.querySelector('.rotator__ghost');
  const tekst = el?.querySelector('.rotator__text');
  if (!el || !duch || !tekst) return;

  const slowa = (el.dataset.slowa || '').split('|').filter(Boolean);
  if (slowa.length < 2) return;

  let i = 0;

  // Szerokość liczymy dla konkretnej frazy — inaczej po krótszym słowie
  // zostawałaby przerwa zarezerwowana pod najdłuższe.
  function dopasujSzerokosc(fraza) {
    duch.textContent = fraza;
    el.style.width = duch.getBoundingClientRect().width + 'px';
  }

  // Najdłuższa fraza zawija nagłówek do dodatkowej linii. Bez rezerwacji
  // wysokości cała treść pod spodem podskakiwałaby przy każdej zmianie,
  // dlatego mierzymy H1 dla każdej frazy i blokujemy najwyższy wynik.
  const naglowek = el.closest('h1');

  function zarezerwujWysokosc() {
    if (!naglowek) return;
    const zapamietana = tekst.textContent;
    // Bez wyłączenia przejścia pomiar łapie szerokość w połowie animacji
    // i najdłuższa fraza nie zdąży zawinąć wiersza — wysokość wychodzi za mała.
    el.style.transition = 'none';
    naglowek.style.minHeight = '';
    let max = 0;
    slowa.forEach(fraza => {
      tekst.textContent = fraza;
      dopasujSzerokosc(fraza);
      max = Math.max(max, naglowek.getBoundingClientRect().height);
    });
    tekst.textContent = zapamietana;
    dopasujSzerokosc(zapamietana);
    naglowek.style.minHeight = Math.ceil(max) + 'px';
    void el.offsetWidth;          // wymuszenie przeliczenia przed przywróceniem animacji
    el.style.transition = '';
  }

  // Pomiar musi poczekać na wczytanie kroju, bo szerokość liczy się z fontu.
  const ustawStart = () => { dopasujSzerokosc(slowa[i]); zarezerwujWysokosc(); };
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(ustawStart);
  } else {
    ustawStart();
  }
  window.addEventListener('resize', () => { dopasujSzerokosc(slowa[i]); zarezerwujWysokosc(); }, { passive: true });

  // Szanujemy ustawienie systemowe "ogranicz animacje"
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  setInterval(() => {
    el.classList.add('is-swapping');
    setTimeout(() => {
      i = (i + 1) % slowa.length;
      tekst.textContent = slowa[i];
      dopasujSzerokosc(slowa[i]);   // szerokość jedzie płynnie, tekst jest wtedy niewidoczny
      el.classList.remove('is-swapping');
    }, 240);
  }, 3200);
}

// ── Hero hex canvas ────────────────────────────────────────
function initHeroCanvas() {
  const heroBg = document.querySelector('.hero__bg');
  if (!heroBg) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
  heroBg.appendChild(canvas);

  const ctx   = canvas.getContext('2d');
  // Wersja jasna rysuje ciemnym złotem, bo jasne cząstki znikają na bieli
  const jasny = document.body.classList.contains('motyw-jasny');
  const EASE  = 'cubic-bezier(0.16,1,0.3,1)';
  let W, H, hexes = [], particles = [];

  function resize() {
    W = canvas.width  = heroBg.offsetWidth;
    H = canvas.height = heroBg.offsetHeight;
    buildHexes();
  }

  function buildHexes() {
    hexes = [];
    const size = 34;
    const colW = size * Math.sqrt(3);
    const rowH = size * 1.5;
    const cols = Math.ceil(W / colW) + 2;
    const rows = Math.ceil(H / rowH) + 2;

    for (let r = -1; r < rows; r++) {
      for (let c = -1; c < cols; c++) {
        hexes.push({
          x: c * colW + (r % 2 ? colW / 2 : 0),
          y: r * rowH,
          s: size,
          o: Math.random() * 0.05 + 0.01,
        });
      }
    }
  }

  function hexPath(x, y, s) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a  = (Math.PI / 3) * i - Math.PI / 6;
      const px = x + s * Math.cos(a);
      const py = y + s * Math.sin(a);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function spawnParticle() {
    if (particles.length >= 70) return;
    particles.push({
      x:     Math.random() * W,
      y:     H + 8,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    -(Math.random() * 0.55 + 0.25),
      life:  1,
      decay: Math.random() * 0.0022 + 0.0009,
      r:     Math.random() * 2.4 + 1.3,
      gold:  Math.random() > 0.45,
    });
  }

  let frame = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Hex grid
    ctx.lineWidth = 0.5;
    hexes.forEach(h => {
      hexPath(h.x, h.y, h.s - 1);
      ctx.strokeStyle = jasny
        ? `rgba(4,24,44,${h.o * 1.8})`
        : `rgba(233,214,174,${h.o * 1.5})`;
      ctx.stroke();
    });

    // Particles
    if (frame % 7 === 0) spawnParticle();
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x    += p.vx;
      p.y    += p.vy;
      p.life -= p.decay;
      const a   = p.life * 0.95;
      const col = jasny
        ? (p.gold
            ? `rgba(210,168,72,${a})`    // złoto z materiałów FB
            : `rgba(4,24,44,${a * 0.55})`)  // granat, przygaszony
        : (p.gold
            ? `rgba(250,240,214,${a})`   // jasny szampan
            : `rgba(232,213,168,${a})`); // złoto rozjaśnione
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle   = col;
      ctx.shadowBlur  = 16;
      ctx.shadowColor = col;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    frame++;
    requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(heroBg);
  resize();
  draw();
}

// ── Realizacje: lokalizacja po dotknięciu (telefon) ─────────
// Na desktopie wystarczy :hover z CSS. Na telefonie hover nie istnieje,
// więc pierwszy dotyk kafelka odsłania szczegóły, kolejny je chowa.
document.querySelectorAll('.project-item').forEach(item => {
  item.addEventListener('click', () => {
    const byl = item.classList.contains('is-open');
    document.querySelectorAll('.project-item.is-open').forEach(i => i.classList.remove('is-open'));
    if (!byl) item.classList.add('is-open');
  });
});
