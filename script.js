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

  // "Duch" trzyma szerokość najdłuższej frazy, więc linia nie skacze
  // podczas pisania i kasowania. Rezerwujemy też wysokość H1.
  const naglowek = el.closest('h1');
  function zarezerwujWysokosc() {
    if (!naglowek) return;
    const zapamietana = tekst.textContent;
    naglowek.style.minHeight = '';
    let max = 0;
    slowa.forEach(f => { tekst.textContent = f; max = Math.max(max, naglowek.getBoundingClientRect().height); });
    tekst.textContent = zapamietana;
    naglowek.style.minHeight = Math.ceil(max) + 'px';
  }
  const start = () => zarezerwujWysokosc();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
  window.addEventListener('resize', zarezerwujWysokosc, { passive: true });

  // Bez animacji przy ustawieniu systemowym "ogranicz ruch" — zostaje pierwsza fraza
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Efekt maszyny do pisania: pisze znak po znaku, chwilę trzyma, kasuje, następna fraza
  let i = 0, poz = slowa[0].length, kasuje = false;
  const PISZ = 70, KASUJ = 40, PAUZA_PELNA = 2400, PAUZA_PUSTA = 350;
  function krok() {
    const fraza = slowa[i];
    if (!kasuje) {
      poz++;
      tekst.textContent = fraza.slice(0, poz);
      if (poz >= fraza.length) { kasuje = true; return setTimeout(krok, PAUZA_PELNA); }
      return setTimeout(krok, PISZ + Math.random() * 40);
    }
    poz--;
    tekst.textContent = fraza.slice(0, poz);
    if (poz <= 0) { kasuje = false; i = (i + 1) % slowa.length; return setTimeout(krok, PAUZA_PUSTA); }
    setTimeout(krok, KASUJ);
  }
  setTimeout(krok, PAUZA_PELNA);
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

// ── Realizacje: galeria (lightbox) per kategoria ────────────
// Kliknięcie kafelka otwiera zdjęcia z tej kategorii. Pliki leżą w
// assets/galeria/<kategoria>-<n>.jpg, liczba w data-liczba.
(function initGaleria() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const img = lb.querySelector('.lightbox__img');
  const cap = lb.querySelector('.lightbox__caption');
  let zdjecia = [], idx = 0, tytul = '', meta = '';

  function pokaz(n) {
    idx = (n + zdjecia.length) % zdjecia.length;
    img.src = zdjecia[idx];
    img.alt = `${tytul} — zdjęcie ${idx + 1} z ${zdjecia.length}`;
    cap.querySelector('strong').textContent = tytul;
    cap.querySelector('span').textContent = meta;
    cap.querySelector('em').textContent = `${idx + 1} / ${zdjecia.length}`;
  }
  function otworz(item) {
    const kat = item.dataset.galeria, n = parseInt(item.dataset.liczba, 10) || 0;
    if (!kat || !n) return;
    zdjecia = Array.from({ length: n }, (_, k) => `assets/galeria/${kat}-${k + 1}.jpg`);
    tytul = item.querySelector('h3')?.textContent.trim() || '';
    meta  = item.querySelector('.project-item__meta')?.textContent.trim() || '';
    lb.hidden = false; document.body.style.overflow = 'hidden';
    pokaz(0);
  }
  function zamknij() { lb.hidden = true; document.body.style.overflow = ''; }

  document.querySelectorAll('.project-item[data-galeria]').forEach(item => {
    // licznik zdjęć na kafelku
    const badge = document.createElement('span');
    badge.className = 'project-item__count';
    badge.textContent = `${item.dataset.liczba} zdjęć`;
    item.appendChild(badge);
    item.addEventListener('click', () => otworz(item));
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); otworz(item); } });
  });
  lb.querySelector('.lightbox__close').addEventListener('click', zamknij);
  lb.querySelector('.lightbox__nav--prev').addEventListener('click', () => pokaz(idx - 1));
  lb.querySelector('.lightbox__nav--next').addEventListener('click', () => pokaz(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) zamknij(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') zamknij();
    if (e.key === 'ArrowLeft') pokaz(idx - 1);
    if (e.key === 'ArrowRight') pokaz(idx + 1);
  });
})();
