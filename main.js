/* ═══════════════════════════════════════════════
   Woojoo.Studio — main.js
   GSAP + ScrollTrigger + Lenis + Canvas starfield
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  /* ══════════════════════════════════
     LENIS
  ══════════════════════════════════ */
  const lenis = new Lenis({
    duration: 1.3,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
  });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ══════════════════════════════════
     CURSOR
  ══════════════════════════════════ */
  const cursorDot  = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-follower');
  const ringLabel  = cursorRing && cursorRing.querySelector('.cursor-follower__label');

  if (cursorDot && cursorRing && window.matchMedia('(pointer:fine)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      gsap.to(cursorDot, { x: mx, y: my, duration: 0.08, ease: 'none' });
    });
    (function loop() {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      gsap.set(cursorRing, { x: rx, y: ry });
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('[data-cursor="link"]').forEach((el) => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('is-link'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-link'));
    });
    document.querySelectorAll('[data-cursor="view"]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorRing.classList.add('is-view');
        if (ringLabel) ringLabel.textContent = 'View';
        cursorDot.style.opacity = '0';
      });
      el.addEventListener('mouseleave', () => {
        cursorRing.classList.remove('is-view');
        if (ringLabel) ringLabel.textContent = '';
        cursorDot.style.opacity = '1';
      });
    });
    document.addEventListener('mouseleave', () => gsap.to([cursorDot, cursorRing], { opacity: 0, duration: 0.2 }));
    document.addEventListener('mouseenter', () => gsap.to([cursorDot, cursorRing], { opacity: 1, duration: 0.2 }));
  }

  /* ══════════════════════════════════
     LIVE CLOCK — Berlin
  ══════════════════════════════════ */
  function updateClocks() {
    const now = new Date();
    const t = now.toLocaleTimeString('en-DE', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, timeZone: 'Europe/Berlin',
    });
    document.querySelectorAll('.ticker__clock').forEach((el) => { el.textContent = t; });
  }
  updateClocks();
  setInterval(updateClocks, 1000);

  /* ══════════════════════════════════
     PRELOADER — multi-font word cycle
  ══════════════════════════════════ */
  const PRELOADER_WORDS = [
    { text: 'Woojoo',  font: "'Oswald', sans-serif",                  style: 'normal', weight: 400 },
    { text: 'Woojoo',  font: "'BhuTuka Expanded One', cursive",       style: 'normal', weight: 400 },
    { text: 'Woojoo',  font: "'Optima', serif",                       style: 'normal', weight: 400 },
    { text: 'Woojoo',  font: "'Rock 3D', cursive",                    style: 'normal', weight: 400 },
    { text: '우주',     font: "'Black Han Sans', sans-serif",           style: 'normal', weight: 400 },
    { text: 'Woojoo',  font: "'Sunshiney', cursive",                  style: 'normal', weight: 400 },
    { text: 'Woojoo',  font: "'Bitcount Prop Double', monospace",      style: 'normal', weight: 400 },
    { text: 'Woojoo',  font: "'Space Mono', monospace",               style: 'normal', weight: 400 },
  ];

  const preloader    = document.getElementById('preloader');
  const preloaderW   = document.getElementById('preloader-word');
  const preloaderCnt = document.getElementById('preloader-count');

  let wordIdx = 0;
  let wordInterval;

  function cycleWord() {
    const next = PRELOADER_WORDS[wordIdx % PRELOADER_WORDS.length];
    gsap.to(preloaderW, {
      y: -20, opacity: 0, duration: 0.22, ease: 'power2.in',
      onComplete() {
        preloaderW.textContent   = next.text;
        preloaderW.style.fontFamily   = next.font;
        preloaderW.style.fontStyle    = next.style;
        preloaderW.style.fontWeight   = next.weight;
        gsap.fromTo(preloaderW,
          { y: 20, opacity: 0 },
          { y: 0,  opacity: 1, duration: 0.32, ease: 'power3.out' }
        );
      },
    });
    wordIdx++;
  }

  /* prime first word */
  if (preloaderW) {
    const first = PRELOADER_WORDS[0];
    preloaderW.textContent     = first.text;
    preloaderW.style.fontFamily     = first.font;
    preloaderW.style.fontStyle      = first.style;
    preloaderW.style.fontWeight     = first.weight;
    wordIdx = 1;
    wordInterval = setInterval(cycleWord, 320);
  }

  /* nav를 프리로더 동안 숨김 */
  gsap.set('#nav', { opacity: 0, y: -20 });

  const counter = { val: 0 };
  gsap.timeline({
    onComplete() {
      clearInterval(wordInterval);
      gsap.to(preloader, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete() {
          preloader.style.display = 'none';
          initSite();
        },
      });
    },
  })
  .to(counter, {
    val: 100, duration: 2.2, ease: 'power2.inOut',
    onUpdate() { if (preloaderCnt) preloaderCnt.textContent = Math.round(counter.val); },
  }, 0);

  /* ══════════════════════════════════
     COSMIC CANVAS — starfield + nebula
  ══════════════════════════════════ */
  function initCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    /* Stars */
    const STAR_COUNT = 320;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.2,
      a: Math.random(),
      speed: Math.random() * 0.0004 + 0.0001,
      twinkle: Math.random() * Math.PI * 2,
    }));

    /* Nebula blobs — new palette: dark / blue / lavender */
    const NEBULAE = [
      { x: 0.18, y: 0.75, rx: 0.38, ry: 0.28, color: [61,97,207],   a: 0.22 },
      { x: 0.82, y: 0.22, rx: 0.35, ry: 0.25, color: [61,97,207],   a: 0.18 },
      { x: 0.50, y: 0.50, rx: 0.55, ry: 0.35, color: [200,207,255], a: 0.08 },
      { x: 0.65, y: 0.80, rx: 0.25, ry: 0.20, color: [55,52,59],    a: 0.35 },
    ];

    let t = 0;

    function drawFrame() {
      const W = canvas.width, H = canvas.height;
      t += 0.006;

      /* Deep space bg */
      ctx.fillStyle = '#080810';
      ctx.fillRect(0, 0, W, H);

      /* Nebulae */
      NEBULAE.forEach((n) => {
        const drift = Math.sin(t * 0.3 + n.x * 4) * 0.015;
        const cx = (n.x + drift) * W;
        const cy = (n.y + Math.cos(t * 0.25 + n.y * 3) * 0.01) * H;
        const rx = n.rx * W;
        const ry = n.ry * H;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
        const [r, g, b] = n.color;
        grad.addColorStop(0,   `rgba(${r},${g},${b},${n.a})`);
        grad.addColorStop(0.5, `rgba(${r},${g},${b},${n.a * 0.4})`);
        grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.save();
        ctx.scale(1, ry / rx);
        ctx.beginPath();
        ctx.arc(cx, cy * (rx / ry), rx, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      });

      /* Stars */
      stars.forEach((s) => {
        s.twinkle += s.speed * 60;
        const twinkleA = s.a * 0.1 * (0.5 + 0.5 * Math.sin(s.twinkle));
        const x = s.x * W;
        const y = ((s.y + t * s.speed) % 1) * H;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,251,245,${twinkleA})`;
        ctx.fill();
      });

      /* Subtle horizontal scan-line shimmer */
      const shimY = ((t * 0.08) % 1) * H;
      const shimG = ctx.createLinearGradient(0, shimY - 60, 0, shimY + 60);
      shimG.addColorStop(0,   'rgba(255,251,245,0)');
      shimG.addColorStop(0.5, 'rgba(255,251,245,0.025)');
      shimG.addColorStop(1,   'rgba(255,251,245,0)');
      ctx.fillStyle = shimG;
      ctx.fillRect(0, shimY - 60, W, 120);

      requestAnimationFrame(drawFrame);
    }

    drawFrame();
  }

  /* ══════════════════════════════════
     SITE INIT
  ══════════════════════════════════ */
  function initSite() {
    initCanvas();
    initNav();
    initHero();
    initSectionTitles();
    initWorks();
    initRevealFades();
    initSmoothAnchors();
  }

  /* ══════════════════════════════════
     NAV
  ══════════════════════════════════ */
  function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    ScrollTrigger.create({
      start: 'top -60px',
      onEnter:     () => nav.classList.add('is-scrolled'),
      onLeaveBack: () => nav.classList.remove('is-scrolled'),
    });
    gsap.to(nav, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.1 });

    /* 모바일 touch 드롭다운 */
    document.querySelectorAll('.nav__dropdown > .nav__link').forEach((link) => {
      link.addEventListener('click', (e) => {
        if (!window.matchMedia('(pointer: coarse)').matches) return;
        const submenu = link.nextElementSibling;
        if (!submenu) return;
        const isOpen = submenu.classList.contains('is-open');
        document.querySelectorAll('.nav__submenu').forEach(m => m.classList.remove('is-open'));
        if (!isOpen) { e.preventDefault(); submenu.classList.add('is-open'); }
      });
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav__dropdown')) {
        document.querySelectorAll('.nav__submenu').forEach(m => m.classList.remove('is-open'));
      }
    });
  }

  /* ══════════════════════════════════
     HERO
     WOOJOO. ← slides from left
     STUDIO  → slides from right
  ══════════════════════════════════ */
  function initHero() {
    const wordLeft  = document.querySelector('#hero-work .hero__word');
    const wordRight = document.querySelector('#hero-bond .hero__word');

    if (!wordLeft || !wordRight) return;

    gsap.set(wordLeft,  { x: '-110vw' });
    gsap.set(wordRight, { x:  '110vw' });
    gsap.set('#hero-services', { y: 16, opacity: 0 });

    const tl = gsap.timeline({ delay: 0.1 });

    tl.to([wordLeft, wordRight], {
      x: 0, duration: 1.15, ease: 'power4.out',
    })
    .to('#hero-services', {
      opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
    }, '-=0.2');

    /* Title floats up on scroll */
    gsap.to('.hero__title-wrap', {
      y: '-14vh',
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
      },
    });
  }

  /* ══════════════════════════════════
     SECTION TITLES — line reveal
  ══════════════════════════════════ */
  function initSectionTitles() {
    document.querySelectorAll('.section-title').forEach((el) => {
      const lines = el.querySelectorAll('.st-line');
      gsap.from(lines, {
        y: '108%', opacity: 0,
        duration: 0.85, stagger: 0.1, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
    document.querySelectorAll('.section-label, .section-rule').forEach((el) => {
      gsap.from(el, {
        x: -36, opacity: 0,
        duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 91%', once: true },
      });
    });
  }

  /* ══════════════════════════════════
     WORKS — horizontal scroll
  ══════════════════════════════════ */
  function initWorks() {
    const track = document.getElementById('works-track');
    if (!track) return;

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      /* 모바일: GSAP 완전 건드리지 않음 — CSS 네이티브 스냅 스크롤만 사용 */
      gsap.set(track, { clearProps: 'all' });
      return;
    }

    track.querySelectorAll('.work-card').forEach((card, i) => {
      gsap.from(card, {
        y: 70, opacity: 0, duration: 0.8, delay: i * 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 92%', once: true },
      });
    });

    const getAmt = () => -(track.scrollWidth - window.innerWidth + 40);
    gsap.to(track, {
      x: getAmt, ease: 'none',
      scrollTrigger: {
        trigger: '.works-hscroll',
        start: 'top top',
        end: () => `+=${Math.abs(getAmt())}`,
        pin: true, scrub: 1,
        invalidateOnRefresh: true,
      },
    });
  }

  /* ══════════════════════════════════
     GENERIC REVEAL FADES
  ══════════════════════════════════ */
  function initRevealFades() {
    document.querySelectorAll('.reveal-fade').forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 87%', once: true },
      });
    });

    /* ── Service cards: 데스크톱만 scale-down ── */
    const sCards = Array.from(document.querySelectorAll('.service-card'));
    const isMobileS = window.innerWidth <= 768;

    sCards.forEach((card, i) => {
      gsap.from(card, {
        y: isMobileS ? 30 : 80,
        opacity: 0, duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      });

      if (!isMobileS && i < sCards.length - 1) {
        gsap.to(card, {
          scale: 0.94,
          transformOrigin: 'top center',
          ease: 'none',
          scrollTrigger: {
            trigger: sCards[i + 1],
            start: 'top 80%',
            end:   'top 20%',
            scrub: true,
          },
        });
      }
    });

    document.querySelectorAll('.contact-link').forEach((el, i) => {
      gsap.from(el, {
        y: 36, opacity: 0, duration: 0.7, delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });
    document.querySelectorAll('.footer__cta-circle').forEach((el, i) => {
      gsap.from(el, {
        scale: 0.7, opacity: 0, duration: 0.7, delay: i * 0.1,
        ease: 'back.out(1.6)',
        scrollTrigger: { trigger: el, start: 'top 93%', once: true },
      });
    });
  }

  /* ══════════════════════════════════
     SMOOTH ANCHORS
  ══════════════════════════════════ */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -100, duration: 1.5 });
      });
    });
  }

  /* ══════════════════════════════════
     RESIZE
  ══════════════════════════════════ */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 300);
  });

})();
