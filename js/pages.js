/* ============================================================
   HAUSBOX — INNER PAGES SHARED INTERACTIONS
   Scroll reveals, parallax, counters, tilt, timeline
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const initializers = [
    { name: 'Navigation', fn: initPageNavigation },
    { name: 'Text Word Reveals', fn: initTextWordReveals },
    { name: 'Page Reveals', fn: initPageReveals },
    { name: 'Parallax Hero', fn: initParallaxHero },
    { name: 'CountUp Numbers', fn: initCountUpNumbers },
    { name: 'Team Tilt', fn: initTeamTilt },
    { name: 'Timeline Scroll', fn: initTimelineScroll },
    { name: 'Metric Bars', fn: initMetricBars },
    { name: 'Filter Pills', fn: initFilterPills },
    { name: 'Smooth Anchors', fn: initSmoothAnchors },
    { name: 'FAQ', fn: initFAQ },
    { name: 'Before/After Sliders', fn: initBeforeAfterSliders },
    { name: 'ROI Calculators', fn: initRoiCalculators },
    { name: 'White Label Simulators', fn: initWhiteLabelSimulators },
    { name: 'Dashboard Simulators', fn: initDashboardSimulators },
    { name: 'Magnetic Buttons', fn: initMagneticButtons },
    { name: 'Comunidad Events', fn: initComunidadEvents },
    { name: 'Audio Players', fn: initAudioPlayers },
    { name: 'Mobile Menu', fn: initMobileMenu }
  ];

  initializers.forEach(item => {
    try {
      item.fn();
    } catch (e) {
      console.warn(`[HausBox] Failed to initialize ${item.name}:`, e);
    }
  });
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
    threshold: 0.02,
    rootMargin: '0px 0px 50px 0px'
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

/* ============================================================
   AWWWARDS INTERACTIVE COMPONENTS LOGIC
   ============================================================ */

/* --- Word Splitting & Reveal --- */
function initTextWordReveals() {
  const titles = document.querySelectorAll('.animate-word-reveal');
  titles.forEach(title => {
    const text = title.textContent.trim();
    // Split keeping tag words intact
    const words = text.split(/\s+/);
    title.innerHTML = '';
    words.forEach((word, idx) => {
      const wrapper = document.createElement('span');
      wrapper.className = 'text-reveal-word';
      const inner = document.createElement('span');
      
      // Parse markdown-style asterisks for serif emphasis
      let cleanWord = word;
      if (word.includes('*')) {
        cleanWord = word.replace(/\*/g, '');
        inner.classList.add('serif');
      }

      inner.textContent = cleanWord;
      inner.style.setProperty('--w-index', idx);
      wrapper.appendChild(inner);
      title.appendChild(wrapper);
      if (idx < words.length - 1) {
        title.appendChild(document.createTextNode(' '));
      }
    });
    title.classList.add('page-reveal');
  });
}

/* --- Before/After Metrics Slider --- */
function initBeforeAfterSliders() {
  const sliders = document.querySelectorAll('.before-after-slider');
  sliders.forEach(slider => {
    const handle = slider.querySelector('.ba-handle');
    const afterPanel = slider.querySelector('.ba-panel--after');
    if (!handle || !afterPanel) return;

    let isDragging = false;

    function move(x) {
      const rect = slider.getBoundingClientRect();
      let pos = (x - rect.left) / rect.width;
      pos = Math.max(0, Math.min(1, pos));
      afterPanel.style.clipPath = `polygon(0 0, ${pos * 100}% 0, ${pos * 100}% 100%, 0 100%)`;
      handle.style.left = `${pos * 100}%`;
    }

    slider.addEventListener('mousedown', (e) => {
      isDragging = true;
      move(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      move(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch support
    slider.addEventListener('touchstart', (e) => {
      isDragging = true;
      move(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      move(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  });
}

/* --- Dynamic ROI Calculator --- */
function initRoiCalculators() {
  const calc = document.querySelector('.roi-calculator');
  if (!calc) return;

  const propInput = calc.querySelector('#roi-properties');
  const rateInput = calc.querySelector('#roi-rate');
  const occInput = calc.querySelector('#roi-occupancy');

  const propVal = calc.querySelector('#val-properties');
  const rateVal = calc.querySelector('#val-rate');
  const occVal = calc.querySelector('#val-occupancy');

  const mainResult = calc.querySelector('#roi-result-value');
  const hoursResult = calc.querySelector('#roi-hours-saved');
  const conversionResult = calc.querySelector('#roi-conversion-speed');

  function calculate() {
    if (!propInput || !rateInput || !occInput) return;
    const props = parseInt(propInput.value);
    const rate = parseInt(rateInput.value);
    const occupancy = parseInt(occInput.value) / 100;

    // Show input values in real-time
    if (propVal) propVal.textContent = props + (props === 100 ? '+' : '');
    if (rateVal) rateVal.textContent = '$' + rate.toLocaleString() + ' MXN';
    if (occVal) occVal.textContent = (occupancy * 100).toFixed(0) + '%';

    // Calculate monthly savings
    const monthlyNights = 30.4 * occupancy;
    const grossRevenue = props * rate * monthlyNights;
    const estimatedSavings = grossRevenue * 0.045; 
    const finalROI = Math.max(800, estimatedSavings);
    const hoursSaved = props * 5.5;

    // Animate results
    if (mainResult) mainResult.innerHTML = '$' + Math.round(finalROI).toLocaleString() + ' <span>MXN</span>';
    if (hoursResult) hoursResult.textContent = Math.round(hoursSaved) + ' hrs';
    if (conversionResult) conversionResult.textContent = (props > 10 ? '3.5x' : '5x');
  }

  [propInput, rateInput, occInput].forEach(input => {
    if (input) input.addEventListener('input', calculate);
  });

  calculate(); // Run initial load
}

/* --- White Label Simulator --- */
function initWhiteLabelSimulators() {
  const sim = document.querySelector('.whitelabel-simulator');
  if (!sim) return;

  const nameInput = sim.querySelector('#wl-name-input');
  const colorBtns = sim.querySelectorAll('.wl-color-btn');
  const screenHeader = sim.querySelector('.phone-mockup__header');
  const screenBtn = sim.querySelector('.phone-pill-btn');
  const screenLogoText = sim.querySelector('.phone-mockup__logo');

  if (nameInput && screenLogoText) {
    nameInput.addEventListener('input', () => {
      const val = nameInput.value.trim();
      screenLogoText.textContent = val || 'Mi Condominio';
    });
  }

  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const color = btn.dataset.color;
      if (screenHeader) screenHeader.style.backgroundColor = color;
      if (screenBtn) screenBtn.style.backgroundColor = color;
    });
  });
}

/* --- Live Dashboard Simulator (Condominios) --- */
function initDashboardSimulators() {
  const sim = document.querySelector('.dashboard-simulator');
  if (!sim) return;

  const tabs = sim.querySelectorAll('.db-tab');
  const screens = sim.querySelectorAll('.db-screen');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      screens.forEach(s => s.classList.remove('active'));

      tab.classList.add('active');
      const screenId = tab.dataset.tab;
      const targetScreen = sim.querySelector(`#db-screen-${screenId}`);
      if (targetScreen) {
        targetScreen.classList.add('active');
      }
    });
  });

  // Simulated QR trigger button
  const qrBtn = sim.querySelector('.db-qr-btn');
  const qrStatus = sim.querySelector('.db-qr-status');
  if (qrBtn && qrStatus) {
    qrBtn.addEventListener('click', () => {
      qrStatus.textContent = 'Verificando...';
      qrStatus.classList.remove('granted');
      setTimeout(() => {
        qrStatus.textContent = '✓ Acceso Autorizado (Entrada A-104)';
        qrStatus.classList.add('granted');
      }, 1000);
    });
  }
}

/* --- Magnetic buttons --- */
function initMagneticButtons() {
  const links = document.querySelectorAll('.event-card__cta');
  links.forEach(link => {
    link.addEventListener('mousemove', (e) => {
      const rect = link.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      link.style.transform = `translate3d(${x * 0.25}px, ${y * 0.25}px, 0)`;
      link.style.transition = 'none';
    });

    link.addEventListener('mouseleave', () => {
      link.style.transform = 'translate3d(0, 0, 0)';
      link.style.transition = 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1)';
    });
  });
}

/* --- Comunidad Events Modal --- */
function initComunidadEvents() {
  const overlay = document.querySelector('.modal-overlay');
  if (!overlay) return;

  const closeBtn = overlay.querySelector('.modal-close');
  const form = overlay.querySelector('.modal-form');
  const registerBtns = document.querySelectorAll('.event-card__cta');

  registerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      overlay.classList.add('active');
      
      // Reset form states
      const normalContent = overlay.querySelector('#modal-normal-content');
      const successContent = overlay.querySelector('#modal-success-content');
      if (normalContent && successContent) {
        normalContent.style.display = 'block';
        successContent.style.display = 'none';
      }
    });
  });

  function closeModal() {
    overlay.classList.remove('active');
  }

  closeBtn?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simulate submission
    const normalContent = overlay.querySelector('#modal-normal-content');
    const successContent = overlay.querySelector('#modal-success-content');
    if (normalContent && successContent) {
      normalContent.style.display = 'none';
      successContent.style.display = 'block';
    }
  });
}

/* --- Audio podcast card player simulator --- */
function initAudioPlayers() {
  const cards = document.querySelectorAll('.audio-podcast-card');
  cards.forEach(card => {
    const playBtn = card.querySelector('.ap-play-btn');
    if (!playBtn) return;

    playBtn.addEventListener('click', () => {
      const isPlaying = card.classList.contains('playing');
      
      // Stop all other audio cards first
      cards.forEach(c => {
        c.classList.remove('playing');
        const btn = c.querySelector('.ap-play-btn');
        if (btn) btn.textContent = '▶';
      });

      if (!isPlaying) {
        card.classList.add('playing');
        playBtn.textContent = '⏸';
      } else {
        card.classList.remove('playing');
        playBtn.textContent = '▶';
      }
    });
  });
}

/* ============================================================
   MOBILE NAVIGATION DRAWER — Dynamic build and controls
   ============================================================ */
function initMobileMenu() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  const navInner = nav.querySelector('.nav-inner');
  if (!navInner) return;

  // 1. Append Hamburger Menu Button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'nav-mobile-toggle';
  toggleBtn.setAttribute('aria-label', 'Abrir menú');
  toggleBtn.innerHTML = `
    <span class="bar"></span>
    <span class="bar"></span>
    <span class="bar"></span>
  `;
  navInner.appendChild(toggleBtn);

  // 2. Append Mobile Menu Overlay
  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'mobile-menu-overlay';
  mobileMenu.innerHTML = `
    <div class="mobile-menu-content">
      <button class="mobile-menu-close" aria-label="Cerrar menú">✕</button>
      <div class="mobile-menu-section">
        <h4>Nosotros</h4>
        <a href="nosotros.html">Nosotros</a>
        <a href="casos-de-exito.html">Casos de éxito</a>
      </div>
      <div class="mobile-menu-section">
        <h4>Funcionalidades</h4>
        <a href="acceso-express.html">Acceso Express QR</a>
        <a href="reserva-amenidades.html">Reserva de Amenidades</a>
        <a href="pago-mantenimiento.html">Pago de Mantenimiento</a>
        <a href="comunicacion-avisos.html">Comunicación y Avisos</a>
        <a href="cobranza-inteligente.html">Cobranza Inteligente</a>
        <a href="conciliacion-automatizada.html">Conciliación Automatizada</a>
        <a href="contabilidad-profesional.html">Contabilidad Profesional</a>
        <a href="mensajeria-multicanal.html">Mensajería Multicanal</a>
      </div>
      <div class="mobile-menu-section">
        <h4>Comunidad</h4>
        <a href="blog.html">Blog</a>
        <a href="comunidad.html">Comunidad</a>
      </div>
      <div class="mobile-menu-section">
        <a href="precios.html" class="menu-highlight">Precios</a>
      </div>
      <div class="mobile-menu-actions">
        <a href="https://app.hausbox.com" class="mobile-login-btn">Ingresar</a>
        <a href="#" class="mobile-cta-btn open-calc-btn">Solicitar Demo</a>
      </div>
    </div>
  `;
  document.body.appendChild(mobileMenu);

  // 3. Toggle Logic
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  const closeMenu = () => {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  };

  const closeBtn = mobileMenu.querySelector('.mobile-menu-close');
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  // Close when clicking overlay backdrop
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMenu();
  });

  // Close when clicking links
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      closeMenu();
      if (link.classList.contains('open-calc-btn')) {
        e.preventDefault();
        if (typeof window.openHausboxCalcModal === 'function') {
          window.openHausboxCalcModal();
        }
      }
    });
  });

  // 4. Convert floating WhatsApp button to "Solicitar Demo" on mobile only
  const floatWhatsapp = document.querySelector('.floating-whatsapp-container');
  if (floatWhatsapp && window.innerWidth <= 1023) {
    const link = floatWhatsapp.querySelector('a');
    const tooltip = floatWhatsapp.querySelector('.whatsapp-tooltip');
    if (link) {
      if (tooltip) tooltip.textContent = 'Calcula tu plan';
      
      floatWhatsapp.classList.add('mobile-cta-floating');
      link.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px;">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
        <span>Solicitar Demo</span>
      `;
      
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.setAttribute('href', '#');
      link.classList.add('open-calc-btn');
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof window.openHausboxCalcModal === 'function') {
          window.openHausboxCalcModal();
        }
      });
    }
  }
}
