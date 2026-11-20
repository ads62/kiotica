/* Ki Ótica RJ — motion & interações */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  const header = $('#header');
  const burger = $('#burger');
  const menu = $('#menu');
  let lenis = null;

  /* ---------- Menu mobile ---------- */
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    if (lenis) open ? lenis.stop() : lenis.start();
    else document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  /* ---------- Header: fundo ao rolar ---------- */
  const onScrollHeader = () => header.classList.toggle('is-stuck', window.scrollY > 24);
  addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  if (!hasGsap) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- Smooth scroll (Lenis + ScrollTrigger) ---------- */
  if (!reduced && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* Âncoras */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id.length > 1 ? $(id) : null;
      if (!target) return;
      e.preventDefault();
      if (!menu.hidden) setMenu(false);
      if (lenis) lenis.scrollTo(target, { offset: id === '#topo' ? 0 : -10, duration: 1.4 });
      else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Manifesto: separa palavras ---------- */
  const words = $('[data-words]');
  if (words && !reduced) {
    const text = words.textContent.trim();
    words.textContent = '';
    text.split(/\s+/).forEach((w, i, arr) => {
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      words.append(s, i < arr.length - 1 ? document.createTextNode(' ') : '');
    });
  }

  /* ---------- Cursor customizado ---------- */
  const initCursor = () => {
    if (!finePointer) return;
    const root = $('.cursor');
    const dot = $('.cursor__dot', root);
    const ring = $('.cursor__ring', root);
    const label = $('.cursor__label', root);
    document.documentElement.classList.add('has-cursor');

    const speed = reduced ? 0.01 : 1;
    const dx = gsap.quickTo(dot, 'x', { duration: 0.12 * speed, ease: 'power3' });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.12 * speed, ease: 'power3' });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.55 * speed, ease: 'power3' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.55 * speed, ease: 'power3' });

    const states = ['is-link', 'is-button', 'is-view', 'is-scroll'];
    let current = '';
    const setState = (cls, text = '') => {
      if (cls === current && label.textContent === text) return;
      root.classList.remove(...states);
      if (cls) root.classList.add(cls);
      label.textContent = text;
      current = cls;
    };

    addEventListener('mousemove', (e) => {
      if (!root.classList.contains('is-on')) {
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
        root.classList.add('is-on');
      }
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    }, { passive: true });

    document.addEventListener('mouseleave', () => root.classList.remove('is-on'));
    document.addEventListener('mouseenter', () => root.classList.add('is-on'));
    addEventListener('mousedown', () => root.classList.add('is-down'));
    addEventListener('mouseup', () => root.classList.remove('is-down'));

    document.addEventListener('mouseover', (e) => {
      const t = e.target instanceof Element ? e.target : null;
      if (!t) return;
      root.classList.toggle('is-dark', !!t.closest('[data-theme="dark"], .menu'));
      const hit = t.closest('[data-cursor]');
      if (hit) {
        const k = hit.dataset.cursor;
        if (k === 'view') return setState('is-view', hit.dataset.label || 'VER');
        if (k === 'scroll') return setState('is-scroll', hit.dataset.label || 'ROLE');
        if (k === 'button') return setState('is-button');
        return setState('is-link');
      }
      setState(t.closest('a, button') ? 'is-link' : '');
    }, { passive: true });

    /* Magnetic (botões) */
    if (!reduced) {
      $$('[data-magnetic]').forEach((el) => {
        const move = (e) => {
          const r = el.getBoundingClientRect();
          const x = e.clientX - (r.left + r.width / 2);
          const y = e.clientY - (r.top + r.height / 2);
          gsap.to(el, { x: x * 0.28, y: y * 0.4, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
        };
        el.addEventListener('mousemove', move);
        el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,.4)', overwrite: 'auto' }));
      });
    }
  };
  initCursor();

  /* ---------- Intro do hero ---------- */
  if (!reduced) {
    const intro = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.1 });
    intro
      .from('.line__in', { yPercent: 115, duration: 1.3, stagger: 0.12 })
      .from('[data-hero-fade]', { y: 26, opacity: 0, duration: 1, stagger: 0.12 }, '-=0.8')
      .from('.hero__frame', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.5, ease: 'expo.out' }, 0.1)
      .from('[data-hero-img]', { scale: 1.25, duration: 1.8, ease: 'expo.out' }, 0.1)
      .from('.badge', { scale: 0, rotation: -90, duration: 1.2, ease: 'back.out(1.4)' }, 0.9)
      .from('[data-hero-year]', { opacity: 0, yPercent: 8, duration: 1.6 }, 0.2)
      .from('.header', { yPercent: -100, opacity: 0, duration: 1, clearProps: 'transform,opacity' }, 0.5);
  }

  /* ---------- Animações ligadas ao scroll ---------- */
  const mm = gsap.matchMedia();

  mm.add(
    {
      desk: '(min-width: 901px) and (prefers-reduced-motion: no-preference)',
      mob: '(max-width: 900px) and (prefers-reduced-motion: no-preference)',
    },
    (ctx) => {
      const { desk } = ctx.conditions;

      /* Hero — camadas com velocidades diferentes */
      const heroTrig = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('[data-hero-img]', { yPercent: -15, ease: 'none', scrollTrigger: heroTrig });
      gsap.to('[data-hero-year]', { yPercent: desk ? -28 : -12, ease: 'none', scrollTrigger: heroTrig });
      gsap.to('.badge', { rotation: 200, ease: 'none', scrollTrigger: heroTrig });
      if (desk) {
        gsap.to('.hero__copy', { yPercent: -10, ease: 'none', scrollTrigger: heroTrig });
        gsap.to('.hero__media', { yPercent: 7, ease: 'none', scrollTrigger: heroTrig });
      }

      /* Faixa (marquee) — inverte com o sentido do scroll */
      const track = $('[data-marquee]');
      const loop = gsap.to(track, { xPercent: -25, duration: 34, ease: 'none', repeat: -1 });
      let dir = 1;
      ScrollTrigger.create({
        trigger: '.strip', start: 'top bottom', end: 'bottom top',
        onUpdate: (self) => {
          if (self.direction !== dir) { dir = self.direction; gsap.to(loop, { timeScale: dir, duration: 0.6, overwrite: true }); }
        },
      });

      /* Manifesto — palavras acendem com o scroll */
      const ws = $$('.manifesto__text .w');
      if (ws.length) {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: desk
            ? { trigger: '.manifesto', start: 'top top', end: '+=120%', scrub: 0.6, pin: true, anticipatePin: 1 }
            : { trigger: '.manifesto__text', start: 'top 82%', end: 'bottom 55%', scrub: 0.6 },
        });
        tl.to(ws, { opacity: 1, stagger: 0.12, duration: 0.5 }, 0);
        if (desk) tl.fromTo('[data-sign]', { yPercent: 14 }, { yPercent: -10, duration: ws.length * 0.12 + 0.5 }, 0);
      }

      /* Números */
      $$('[data-count]').forEach((el) => {
        const target = parseFloat(el.dataset.count);
        const decimal = el.dataset.decimal === '1';
        const plain = el.hasAttribute('data-plain');
        const fmt = (v) => decimal ? v.toFixed(1).replace('.', ',') : plain ? String(Math.round(v)) : String(Math.round(v));
        const obj = { v: plain ? target - 60 : 0 };
        el.textContent = fmt(obj.v);
        gsap.to(obj, {
          v: target, duration: 2.2, ease: 'power3.out',
          onUpdate: () => { el.textContent = fmt(obj.v); },
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });
      gsap.from('.numbers__list li', {
        y: 50, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.numbers__list', start: 'top 85%', once: true },
      });

      /* Scroll horizontal (desktop) */
      if (desk) {
        const trackEl = $('[data-hs-track]');
        const bar = $('[data-hs-bar]');
        const dist = () => Math.max(0, trackEl.scrollWidth - window.innerWidth);
        const hTween = gsap.to(trackEl, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: {
            trigger: '.hs__pin', start: 'top top', end: () => '+=' + dist(),
            pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
          },
        });
        /* imagens dos painéis com leve deslocamento interno */
        $$('.panel__img img').forEach((img) => {
          gsap.fromTo(img, { scale: 1.18 }, {
            scale: 1, ease: 'none',
            scrollTrigger: { trigger: img.closest('.panel'), containerAnimation: hTween, start: 'left 95%', end: 'left 25%', scrub: true },
          });
        });
      } else {
        $$('.panel').forEach((p) => gsap.from(p, {
          y: 40, opacity: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: p, start: 'top 88%', once: true },
        }));
      }

      /* Imagens com parallax interno */
      $$('[data-parallax-img]').forEach((img) => {
        gsap.fromTo(img, { yPercent: 0 }, {
          yPercent: desk ? -18 : -10, ease: 'none',
          scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
      $$('.telas [data-parallax]').forEach((el) => {
        gsap.fromTo(el, { yPercent: desk ? 5 : 0 }, {
          yPercent: desk ? -5 : 0, ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      /* Entradas de texto */
      $$('.solar__txt > *, .telas__txt > *, .reviews__head > *, .visit__info > *').forEach((el) => {
        gsap.from(el, {
          y: 34, opacity: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 90%', once: true,
        onEnter: (els) => gsap.from(els, { y: 44, opacity: 0, duration: 1, stagger: 0.14, ease: 'power3.out', overwrite: true }),
      });
      gsap.from('.visit__map', {
        opacity: 0, duration: 1.4, ease: 'power2.out',
        scrollTrigger: { trigger: '.visit__map', start: 'top 85%', once: true },
      });
    }
  );

  /* ---------- Header muda de cor sobre seções escuras ---------- */
  $$('[data-theme="dark"]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 38px',
      end: 'bottom 38px',
      onToggle: (self) => { if (menu.hidden) header.classList.toggle('header--light', self.isActive); },
    });
  });

  /* Reduced motion: garante estado final visível */
  mm.add('(prefers-reduced-motion: reduce)', () => {
    $$('[data-count]').forEach((el) => { el.textContent = el.dataset.decimal === '1' ? '5,0' : el.dataset.count; });
  });

  /* Recalcula após carregar imagens e fontes (pin/horizontal dependem de medidas) */
  const refresh = () => ScrollTrigger.refresh();
  addEventListener('load', refresh);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
})();
