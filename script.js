'use strict';

// Kapitello, wersja 5. Bez bibliotek, bez build stepu.
// Ruch z powodem: pasek po przewinięciu (stan), wejścia sekcji (opowieść),
// taśma programów (nawigacja), galeria (feedback po kliknięciu).

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Pasek: tło po przewinięciu, menu na telefonie ──────────
(function initTop() {
  const top = document.getElementById('top');
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('nav');
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;';
  document.body.prepend(sentinel);
  new IntersectionObserver(([e]) => top.classList.toggle('is-scrolled', !e.isIntersecting), { threshold: 1 }).observe(sentinel);
  burger?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
  }));
})();

// ── Wejścia sekcji ────────────────────────────────────────
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('is-in')); return; }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => obs.observe(el));
})();

// ── Taśmy poziome: przyciski ──────────────────────────────
(function initTracks() {
  document.querySelectorAll('.track__btn').forEach(btn => btn.addEventListener('click', () => {
    const track = document.getElementById(btn.dataset.track);
    if (!track) return;
    const item = track.firstElementChild;
    const step = item ? item.getBoundingClientRect().width + 16 : 340;
    track.scrollBy({ left: step * Number(btn.dataset.dir), behavior: reduceMotion ? 'auto' : 'smooth' });
  }));
})();

// ── Galeria (lightbox) ────────────────────────────────────
(function initGaleria() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const img = lb.querySelector('.lightbox__img');
  const cap = lb.querySelector('.lightbox__caption');
  let zdjecia = [], idx = 0, tytul = '', ostatniFokus = null;

  function pokaz(n) {
    idx = (n + zdjecia.length) % zdjecia.length;
    img.src = zdjecia[idx];
    img.alt = `${tytul}, zdjęcie ${idx + 1} z ${zdjecia.length}`;
    cap.querySelector('strong').textContent = tytul;
    cap.querySelector('span').textContent = '';
    cap.querySelector('em').textContent = `${idx + 1} / ${zdjecia.length}`;
  }
  function otworz(item) {
    const kat = item.dataset.galeria, n = parseInt(item.dataset.liczba, 10) || 0;
    if (!kat || !n) return;
    zdjecia = Array.from({ length: n }, (_, k) => `assets/galeria/${kat}-${k + 1}.jpg`);
    tytul = item.querySelector('figcaption, h3')?.textContent.trim() || '';
    ostatniFokus = document.activeElement;
    lb.hidden = false; document.body.style.overflow = 'hidden';
    pokaz(0);
    lb.querySelector('.lightbox__close').focus();
  }
  function zamknij() { lb.hidden = true; document.body.style.overflow = ''; ostatniFokus?.focus(); }

  document.querySelectorAll('[data-galeria]').forEach(item => {
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

// ── Formularz: walidacja i stany ──────────────────────────
(function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = form.querySelector('.form__status');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('.form__field').forEach(f => {
      const input = f.querySelector('input[required]');
      if (!input) return;
      const valid = input.value.trim().length > 0;
      f.classList.toggle('is-invalid', !valid);
      const err = f.querySelector('.form__error'); if (err) err.hidden = valid;
      if (!valid) ok = false;
    });
    if (!ok) { status.textContent = 'Uzupełnij pola oznaczone na czerwono.'; return; }
    status.textContent = 'Dziękujemy. Oddzwonimy w ciągu 24 godzin roboczych.';
    form.reset();
  });
})();
