document.addEventListener('DOMContentLoaded', () => {

  // ── Sticky header ──────────────────────────────────────
  const header = document.getElementById('header');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── Hero background zoom on load ───────────────────────
  document.querySelector('.hero')?.classList.add('loaded');

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

  // Close menu on outside click
  document.addEventListener('click', e => {
    if (nav.classList.contains('active') && !nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('active');
      toggle?.classList.remove('active');
      toggle?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // ── Scroll reveal ──────────────────────────────────────
  const reveals = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('active'); } });
  }, { threshold: 0.12 });
  reveals.forEach(el => revealObs.observe(el));

  // ── Counter animation ──────────────────────────────────
  const counters = document.querySelectorAll('.stat-item__number[data-target]');

  const animateCounter = (el) => {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.floor(ease * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        counterObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObs.observe(el));

  // ── Smooth scroll with header offset ──────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = header.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── Contact form (basic feedback) ─────────────────────
  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form__submit');
    const original = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="animation:spin .8s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      Wysyłanie...
    `;

    // Simulate send — replace with real fetch() to backend
    setTimeout(() => {
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        Wiadomość wysłana!
      `;
      btn.style.background = '#047857';
      form.reset();
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = original;
        btn.style.background = '';
      }, 4000);
    }, 1200);
  });

});

// ── Spinner keyframe (injected once) ──────────────────────
const style = document.createElement('style');
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);
