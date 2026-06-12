/* ============================================================
   HAUSBOX — INNER PAGES SHARED INTERACTIONS
   Scroll reveals, parallax, counters, tilt, timeline
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initPageNavigation();
  initPageReveals();
  initParallaxHero();
  initCountUpNumbers();
  initTeamTilt();
  initTimelineScroll();
  initMetricBars();
  initFilterPills();
  initSmoothAnchors();
});

/* ============================================================
   NAVIGATION — reuse from main but adapted for inner pages
   ============================================================ */
function initPageNavigation() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  let ticking = false;
  let navVisible = false;

  const themeSections = document.querySelectorAll('[data-nav-theme]');

  function updateNav() {
    const scrollY = window.scrollY;
    const windowH = window.innerHeight;

    if (scrollY > windowH * 0.3) {
      if (!navVisible) {
        nav.classList.add('visible');
        navVisible = true;
      }
    } else {
      if (navVisible) {
        nav.classList.remove('visible');
        navVisible = false;
      }
    }

    // Theme switching
    let currentTheme = 'dark';
    themeSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 80 && rect.bottom > 80) {
        currentTheme = section.dataset.navTheme;
      }
    });
    nav.setAttribute('data-theme', currentTheme);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  updateNav();
}

/* ============================================================
   SCROLL REVEAL — IntersectionObserver for .page-reveal & .reveal
   ============================================================ */
function initPageReveals() {
  const elements = document.querySelectorAll('.page-reveal, .reveal, [data-stagger]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   PARALLAX HERO — subtle movement on scroll
   ============================================================ */
function initParallaxHero() {
  const heroBg = document.querySelector('.page-hero__bg');
  if (!heroBg) return;

  const heroSection = heroBg.closest('.page-hero');

  function handleScroll() {
    const rect = heroSection.getBoundingClientRect();
    if (rect.bottom < 0) return;

    const scrolled = -rect.top;
    const speed = 0.35;
    const translateY = scrolled * speed;

    heroBg.style.transform = `translate3d(0, ${translateY}px, 0)`;
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(handleScroll);
  }, { passive: true });
}

/* ============================================================
   COUNT-UP — animate numbers when they enter viewport
   ============================================================ */
function initCountUpNumbers() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
        const duration = 2000;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out expo
          const eased = 1 - Math.pow(1 - progress, 4);
          const current = eased * target;

          el.textContent = prefix + current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;

          if (progress < 1) {
            requestAnimationFrame(update);
          }
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(el => observer.observe(el));
}

/* ============================================================
   TEAM TILT — 3D perspective effect on hover
   ============================================================ */
function initTeamTilt() {
  const cards = document.querySelectorAll('.team-card__inner');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
    });
  });
}

/* ============================================================
   TIMELINE — progressive line fill on scroll
   ============================================================ */
function initTimelineScroll() {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  const items = timeline.querySelectorAll('.timeline-item');
  const lineFill = timeline.querySelector('.timeline-line-fill');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
  });

  items.forEach(item => observer.observe(item));

  // Animate line fill
  if (lineFill) {
    function updateLineFill() {
      const timelineRect = timeline.getBoundingClientRect();
      const windowH = window.innerHeight;

      if (timelineRect.top < windowH && timelineRect.bottom > 0) {
        const totalHeight = timeline.offsetHeight;
        const scrolledPast = windowH - timelineRect.top;
        const progress = Math.max(0, Math.min(1, scrolledPast / totalHeight));
        lineFill.style.height = (progress * 100) + '%';
      }
    }

    window.addEventListener('scroll', () => {
      requestAnimationFrame(updateLineFill);
    }, { passive: true });
  }
}

/* ============================================================
   METRIC BARS — animate fill width on scroll
   ============================================================ */
function initMetricBars() {
  const bars = document.querySelectorAll('.metric-bar__fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
}

/* ============================================================
   FILTER PILLS — toggle active state
   ============================================================ */
function initFilterPills() {
  const pills = document.querySelectorAll('.filter-pill');
  if (!pills.length) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      // Filter logic
      const filter = pill.dataset.filter;
      const items = document.querySelectorAll('[data-category]');

      items.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = '';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(16px)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* ============================================================
   SMOOTH ANCHORS — smooth scroll to sections
   ============================================================ */
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ============================================================
   FAQ — reuse from main.js
   ============================================================ */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      items.forEach(other => {
        if (other !== item) {
          other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
          const otherAnswer = other.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        }
      });

      btn.setAttribute('aria-expanded', !isOpen);
      answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
    });
  });
}
