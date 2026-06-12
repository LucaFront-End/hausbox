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
    { name: 'Pricing Calculator', fn: initPricingCalculator }
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
    if (mainResult) mainResult.textContent = '$' + Math.round(finalROI).toLocaleString() + ' MXN';
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
  const links = document.querySelectorAll('.btn-cta-hero, .btn-cta-nav, .event-card__cta');
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
   PRICING CALCULATOR — Floating Button + Modal
   ============================================================ */
function initPricingCalculator() {
  const PRICE_PER_UNIT = 20;
  const WA_PHONE = '5215574374431';

  // Inject HTML
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <!-- Floating Calc Button -->
    <button class="floating-calc-btn" id="calc-open-btn" aria-label="Calcula tu Plan">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg>
      <span>Calcula tu Plan</span>
    </button>

    <!-- Modal Overlay -->
    <div class="calc-modal-overlay" id="calc-modal-overlay">
      <div class="calc-modal" id="calc-modal">
        <button class="calc-modal__close" id="calc-close-btn" aria-label="Cerrar">✕</button>

        <!-- FORM VIEW -->
        <div id="calc-form-view">
          <div class="calc-modal__header">
            <h3>Calcula tu <span class="serif" style="color:#0DA3E2;">plan ideal</span></h3>
            <p>Completa tus datos y descubre el costo mensual de HausBox para tu propiedad.</p>
          </div>
          <form class="calc-form" id="calc-form">
            <div class="calc-form__group">
              <label for="calc-name">Nombre completo</label>
              <input type="text" id="calc-name" placeholder="Ej: Juan Pérez" required />
            </div>
            <div class="calc-form__group">
              <label for="calc-email">Correo electrónico</label>
              <input type="email" id="calc-email" placeholder="tu@email.com" required />
            </div>
            <div class="calc-form__group">
              <label for="calc-phone">Teléfono</label>
              <input type="tel" id="calc-phone" placeholder="55 1234 5678" required />
            </div>
            <div class="calc-form__group">
              <label for="calc-type">Tipo de propiedad</label>
              <select id="calc-type" required>
                <option value="" disabled selected>Selecciona una opción</option>
                <option value="Condominio Residencial">Condominio Residencial</option>
                <option value="Condominio Vertical">Condominio Vertical</option>
                <option value="Renta Vacacional">Renta Vacacional</option>
                <option value="Desarrollo Inmobiliario">Desarrollo Inmobiliario</option>
                <option value="Oficinas">Oficinas</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div class="calc-slider-group">
              <div class="calc-slider-header">
                <label>Número de unidades</label>
                <div class="calc-slider-value" id="calc-units-display">5 <span>unidades</span></div>
              </div>
              <input type="range" class="calc-range" id="calc-units" min="5" max="100" value="5" step="1" />
            </div>
            <div class="calc-price-preview">
              <div class="price-label">Costo mensual estimado</div>
              <div class="price-amount" id="calc-price-display">$100 <small>MXN / mes</small></div>
            </div>
            <button type="submit" class="calc-form__submit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Ver mi resultado
            </button>
          </form>
        </div>

        <!-- RESULTS VIEW -->
        <div class="calc-results" id="calc-results-view">
          <div class="calc-results__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <h3>Tu plan HausBox</h3>
          <p class="result-summary" id="calc-result-summary"></p>
          <div class="calc-result-card" id="calc-result-card"></div>
          <a class="calc-results__wa-btn" id="calc-wa-link" href="#" target="_blank">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 20.2a1 1 0 001.254 1.254l3.032-.892A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
            Solicitar por WhatsApp
          </a>
          <button class="calc-results__back" id="calc-back-btn">← Volver a editar</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  // Elements
  const openBtn = document.getElementById('calc-open-btn');
  const overlay = document.getElementById('calc-modal-overlay');
  const modal = document.getElementById('calc-modal');
  const closeBtn = document.getElementById('calc-close-btn');
  const form = document.getElementById('calc-form');
  const formView = document.getElementById('calc-form-view');
  const resultsView = document.getElementById('calc-results-view');
  const slider = document.getElementById('calc-units');
  const unitsDisplay = document.getElementById('calc-units-display');
  const priceDisplay = document.getElementById('calc-price-display');
  const backBtn = document.getElementById('calc-back-btn');

  if (!openBtn || !overlay) return;

  // Update slider visuals
  function updateSlider() {
    const val = parseInt(slider.value, 10);
    const pct = ((val - 5) / (100 - 5)) * 100;
    slider.style.setProperty('--range-pct', pct + '%');
    unitsDisplay.innerHTML = val + ' <span>unidades</span>';
    const total = val * PRICE_PER_UNIT;
    priceDisplay.innerHTML = '$' + total.toLocaleString('es-MX') + ' <small>MXN / mes</small>';
  }
  slider.addEventListener('input', updateSlider);
  updateSlider();

  // Open / Close
  function openModal() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
  });

  // Form Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('calc-name').value.trim();
    const email = document.getElementById('calc-email').value.trim();
    const phone = document.getElementById('calc-phone').value.trim();
    const propType = document.getElementById('calc-type').value;
    const units = parseInt(slider.value, 10);
    const totalPrice = units * PRICE_PER_UNIT;

    // Build results
    const summaryEl = document.getElementById('calc-result-summary');
    summaryEl.textContent = `${name}, aquí está el resumen de tu plan para ${units} unidades en un ${propType}.`;

    const cardEl = document.getElementById('calc-result-card');
    cardEl.innerHTML = `
      <div class="result-row"><span class="rl">Tipo de propiedad</span><span class="rv">${propType}</span></div>
      <div class="result-row"><span class="rl">Unidades</span><span class="rv">${units}</span></div>
      <div class="result-row"><span class="rl">Precio por unidad</span><span class="rv">$${PRICE_PER_UNIT} MXN</span></div>
      <div class="result-total"><span class="rl">Total mensual</span><span class="rv">$${totalPrice.toLocaleString('es-MX')} MXN</span></div>
    `;

    // WhatsApp link
    const waMsg = encodeURIComponent(
      `Hola! Soy ${name}.\n` +
      `Quiero más información sobre HausBox.\n\n` +
      `📋 Mi plan calculado:\n` +
      `• Tipo: ${propType}\n` +
      `• Unidades: ${units}\n` +
      `• Total mensual: $${totalPrice.toLocaleString('es-MX')} MXN\n\n` +
      `📧 ${email}\n📱 ${phone}`
    );
    document.getElementById('calc-wa-link').href = `https://api.whatsapp.com/send/?phone=${WA_PHONE}&text=${waMsg}&type=phone_number&app_absent=0`;

    // Show results
    formView.style.display = 'none';
    resultsView.classList.add('active');
  });

  // Back button
  backBtn.addEventListener('click', () => {
    resultsView.classList.remove('active');
    formView.style.display = 'block';
  });
}
