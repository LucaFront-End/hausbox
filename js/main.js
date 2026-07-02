/* ============================================================
   NOVU-STYLE INTERACTIONS
   All scroll-driven animations, nav behavior, FAQ, counters
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeroAnimations();
  initRevealOnScroll();
  initPhoneScrollSwap();
  initFAQ();
  initCounters();
  initMobileFeatures();
  initHighlightsLateralScroll();
  initPrivacySpotlight();
  initWeeklyPhoneReveal();
  initCardAnimations();
  initFloatingWhatsApp();
  // initReviewsLateralScroll();
  initRolesTabs();
  initMultistepForm();
});

/* ============================================================
   NAVIGATION — show/hide on scroll + theme switching
   ============================================================ */
function initNavigation() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  let lastScrollY = 0;
  let ticking = false;
  let navVisible = false;

  // Determine which sections set the nav theme
  const themeSections = document.querySelectorAll('[data-nav-theme]');

  function updateNav() {
    const scrollY = window.scrollY;
    const windowH = window.innerHeight;

    // Show nav after scrolling past 80% of viewport
    if (scrollY > windowH * 0.8) {
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

    // Update nav theme based on which section is at the top
    let currentTheme = 'dark';
    themeSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      // If section covers the nav area (top 80px)
      if (rect.top <= 80 && rect.bottom > 80) {
        currentTheme = section.dataset.navTheme;
      }
    });
    nav.setAttribute('data-theme', currentTheme);

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  // Initial check
  updateNav();
}

/* ============================================================
   HERO — entrance animations sequence
   ============================================================ */
function initHeroAnimations() {
  // Delay sequence to feel like the original
  const line1 = document.querySelector('.hero-line-1');
  const line2 = document.querySelector('.hero-line-2');
  const subtitle = document.querySelector('.hero-subtitle');
  const cta = document.querySelector('.hero-cta');

  // Small initial delay for page load feel
  setTimeout(() => {
    if (line1) line1.classList.add('revealed');
  }, 300);

  setTimeout(() => {
    if (line2) line2.classList.add('revealed');
  }, 500);

  setTimeout(() => {
    if (subtitle) subtitle.classList.add('revealed');
  }, 1200);

  setTimeout(() => {
    if (cta) cta.classList.add('revealed');
  }, 1400);
}

/* ============================================================
   REVEAL ON SCROLL — IntersectionObserver for .reveal elements
   ============================================================ */
function initRevealOnScroll() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ============================================================
   PHONE SCROLL SWAP — change screenshot based on scroll position
   ============================================================ */
function initPhoneScrollSwap() {
  const featureSlots = document.querySelectorAll('.feature-slot[data-slide]');
  const phoneSlides = document.querySelectorAll('.features-phone-sticky .phone-screen-slide');

  if (!featureSlots.length || !phoneSlides.length) return;

  let currentSlide = 0;

  // Helper to play/pause videos inside slides
  function toggleVideo(slide, play) {
    const video = slide.querySelector('video');
    if (video) {
      if (play) {
        video.currentTime = 0;
        video.play().catch(err => console.log('Video play interrupted:', err));
      } else {
        video.pause();
      }
    }
  }

  // Play initial active video
  phoneSlides.forEach((slide, i) => {
    if (slide.classList.contains('active')) {
      toggleVideo(slide, true);
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const slideIndex = parseInt(entry.target.dataset.slide, 10);
        if (slideIndex !== currentSlide) {
          currentSlide = slideIndex;
          phoneSlides.forEach((slide, i) => {
            const isActive = i === slideIndex;
            slide.classList.toggle('active', isActive);
            toggleVideo(slide, isActive);
          });
        }
      }
    });
  }, {
    threshold: 0.5,
    rootMargin: '-20% 0px -20% 0px'
  });

  featureSlots.forEach(slot => observer.observe(slot));
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      items.forEach(other => {
        if (other !== item) other.classList.remove('open');
      });

      // Toggle current
      item.classList.toggle('open', !isOpen);
    });
  });
}

/* ============================================================
   COUNTER ANIMATION — animate numbers on scroll
   ============================================================ */
function initCounters() {
  const counters = document.querySelectorAll('[data-count-to]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.3
  });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseFloat(el.dataset.countTo);
  const suffix = el.dataset.countSuffix || '';
  const prefix = el.dataset.countPrefix || '';
  const decimals = el.dataset.countDecimals ? parseInt(el.dataset.countDecimals) : 0;
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;

    el.textContent = prefix + current.toFixed(decimals) + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
  }

  requestAnimationFrame(update);
}

/* ============================================================
   MOBILE FEATURES — scroll-driven text + slide swap
   ============================================================ */
function initMobileFeatures() {
  const container = document.querySelector('.features-mobile');
  if (!container) return;

  const textEl = container.querySelector('.features-mobile-text');
  const phoneSlides = container.querySelectorAll('.phone-screen-slide');
  if (!textEl || !phoneSlides.length) return;

  const mobileTexts = [
    {
      title: 'Cobra a tiempo. <br/>Sin <span class="serif">complicaciones.</span>',
      desc: 'Reduce la morosidad hasta un 80% con recordatorios automáticos y seguimiento inteligente de cuotas de mantenimiento.',
      linkText: 'Ver pasarelas de pago',
      linkHref: '#cuotas-mantenimiento'
    },
    {
      title: 'Todo el control. <br/>En un solo <span class="serif">lugar.</span>',
      desc: 'Proveedores, facturas, adeudos y gastos organizados. Administra pagos de forma ágil y profesional.',
      linkText: 'Ver gestión de proveedores',
      linkHref: '#proveedores'
    },
    {
      title: 'Contabilidad <br/><span class="serif">transparente.</span>',
      desc: 'Ingresos, egresos, cuentas contables, auxiliar bancario y balanza de comprobación. Todo en un solo lugar.',
      linkText: 'Explorar reportes financieros',
      linkHref: '#contabilidad'
    },
    {
      title: 'Tu condominio <br/>en tu <span class="serif">mano.</span>',
      desc: 'App para residentes: consulta pagos, genera códigos QR, reserva amenidades y recibe avisos al instante.',
      linkText: 'Conocer funciones de la App',
      linkHref: '#app-residentes'
    }
  ];

  let currentMobileSlide = 0;

  // Helper to play/pause videos inside slides
  function toggleVideo(slide, play) {
    const video = slide.querySelector('video');
    if (video) {
      if (play) {
        video.currentTime = 0;
        video.play().catch(err => console.log('Mobile video play interrupted:', err));
      } else {
        video.pause();
      }
    }
  }

  // Play initial active mobile video
  phoneSlides.forEach((slide, i) => {
    if (slide.classList.contains('active')) {
      toggleVideo(slide, true);
    }
  });

  function updateMobileSlide() {
    if (!container.offsetParent && getComputedStyle(container).display === 'none') return;

    const rect = container.getBoundingClientRect();
    const totalScroll = container.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / totalScroll));
    const slideIndex = Math.min(
      mobileTexts.length - 1,
      Math.floor(progress * mobileTexts.length)
    );

    if (slideIndex !== currentMobileSlide) {
      currentMobileSlide = slideIndex;

      // Update text
      const h2 = textEl.querySelector('h2');
      const p = textEl.querySelector('p');
      const a = textEl.querySelector('.mobile-feature-link');
      if (h2) h2.innerHTML = mobileTexts[slideIndex].title;
      if (p) p.textContent = mobileTexts[slideIndex].desc;
      if (a) {
        a.setAttribute('href', mobileTexts[slideIndex].linkHref);
        a.innerHTML = mobileTexts[slideIndex].linkText + ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
      }

      // Update phone slides
      phoneSlides.forEach((slide, i) => {
        const isActive = i === slideIndex;
        slide.classList.toggle('active', isActive);
        toggleVideo(slide, isActive);
      });

      // Update progress dots
      const dots = container.querySelectorAll('.mobile-features-progress .progress-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === slideIndex);
      });

      // Update background class on sticky container
      const stickyWrapper = container.querySelector('.features-mobile-sticky');
      if (stickyWrapper) {
        stickyWrapper.className = `features-mobile-sticky bg-slide-${slideIndex}`;
      }
    }
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateMobileSlide);
  }, { passive: true });

  // Init first
  const h2 = textEl.querySelector('h2');
  const p = textEl.querySelector('p');
  const a = textEl.querySelector('.mobile-feature-link');
  if (h2) h2.innerHTML = mobileTexts[0].title;
  if (p) p.textContent = mobileTexts[0].desc;
  if (a) {
    a.setAttribute('href', mobileTexts[0].linkHref);
    a.innerHTML = mobileTexts[0].linkText + ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
  }
  const stickyWrapper = container.querySelector('.features-mobile-sticky');
  if (stickyWrapper) {
    stickyWrapper.className = 'features-mobile-sticky bg-slide-0';
  }
}

/* ============================================================
   SMOOTH SCROLL for anchor links
   ============================================================ */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  const targetId = link.getAttribute('href');
  if (targetId === '#') return;

  const target = document.querySelector(targetId);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  }
});


/* ============================================================
   HIGHLIGHTS SCROLLER — sticky horizontal scroll
   ============================================================ */
function initHighlightsLateralScroll() {
  const section = document.getElementById('highlights');
  const inner = document.querySelector('.highlights-scroller-inner');
  if (!section || !inner) return;

  function setHeight() {
    // Reset to measure natural inner width
    inner.style.transform = '';
    const scrollableRange = inner.scrollWidth - window.innerWidth;
    // Section height = viewport height + the horizontal overflow we need to scroll through
    section.style.height = (window.innerHeight + Math.max(0, scrollableRange)) + 'px';
  }

  function handleScroll() {
    const rect = section.getBoundingClientRect();

    // Progress: 0 when section top reaches viewport top, 1 when section bottom reaches viewport bottom
    const scrollableRange = inner.scrollWidth - window.innerWidth;
    const totalVertical = section.offsetHeight - window.innerHeight;

    if (totalVertical <= 0) {
      inner.style.transform = 'translate3d(0, 0, 0)';
      return;
    }

    // How far we've scrolled past the section top
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / totalVertical));

    const tx = -progress * Math.max(0, scrollableRange);
    inner.style.transform = `translate3d(${tx}px, 0, 0)`;
  }

  // Set initial height and recalculate on resize
  setHeight();
  window.addEventListener('resize', () => {
    setHeight();
    handleScroll();
  });

  window.addEventListener('scroll', () => {
    requestAnimationFrame(handleScroll);
  }, { passive: true });

  handleScroll();
}

/* ============================================================
   PRIVACY SPOTLIGHT — mouse-tracking spotlight background
   ============================================================ */
function initPrivacySpotlight() {
  const card = document.querySelector('.privacy-card');
  if (!card) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--mx', `${x}px`);
    card.style.setProperty('--my', `${y}px`);
    card.style.setProperty('--spotlight', '1');
  });

  card.addEventListener('mouseenter', () => {
    card.style.setProperty('--spotlight', '1');
  });

  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--spotlight', '0');
  });
}

/* ============================================================
   WEEKLY PHONE REVEAL — slide phone up when card is in view
   ============================================================ */
function initWeeklyPhoneReveal() {
  const phone = document.querySelector('[data-weekly-phone]');
  if (!phone) return;

  let phoneAnimated = false;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio >= 0.75 && !phoneAnimated) {
          phoneAnimated = true;
          phone.style.transform = 'translateY(0)';
        } else if (entry.intersectionRatio < 0.25 && phoneAnimated) {
          phoneAnimated = false;
          phone.style.transform = 'translateY(110%)';
        }
      });
    },
    { threshold: [0.25, 0.75] }
  );

  observer.observe(phone.closest('.highlight-card') || phone);
}

/* ============================================================
   CARD ANIMATIONS - payment notifs, dashboard, checklist, chat
   ============================================================ */

function initCardAnimations() {
  // --- Card 1: Payment notifications with scale+slide ---
  const paymentsCard = document.querySelector('[data-card-anim="payments"]');
  if (paymentsCard) {
    const notifs = paymentsCard.querySelectorAll('.pay-notif');
    let payAnimated = false;
    const payObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio >= 0.75 && !payAnimated) {
          payAnimated = true;
          notifs.forEach((n, i) => {
            setTimeout(() => {
              n.style.transition = 'opacity 700ms cubic-bezier(0.22,1,0.36,1), transform 700ms cubic-bezier(0.22,1,0.36,1)';
              n.style.opacity = '1';
              n.style.transform = 'translateY(0) scale(1)';
            }, 300 + i * 450);
          });
        } else if (entry.intersectionRatio < 0.25 && payAnimated) {
          payAnimated = false;
          notifs.forEach((n) => {
            n.style.transition = 'none';
            n.style.opacity = '0';
            n.style.transform = 'translateY(30px) scale(0.92)';
          });
        }
      });
    }, { threshold: [0.25, 0.75] });
    payObs.observe(paymentsCard.closest('.highlight-card') || paymentsCard);
  }

  // --- Card 2: Dashboard counters + bars + progress ---
  const dashCard = document.querySelector('[data-card-anim="dashboard"]');
  if (dashCard) {
    const counters = dashCard.querySelectorAll('.dash-counter');
    const progress = dashCard.querySelector('.dash-progress');
    const bars = dashCard.querySelectorAll('.dash-bar');
    let dashAnimated = false;
    const dashObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio >= 0.75 && !dashAnimated) {
          dashAnimated = true;
          counters.forEach((el) => {
            const target = parseInt(el.dataset.target, 10);
            const suffix = el.dataset.suffix || '';
            const duration = 1400;
            const start = performance.now();
            const tick = (now) => {
              const elapsed = now - start;
              const ratio = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - ratio, 3);
              el.textContent = Math.round(target * eased) + suffix;
              if (ratio < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          });
          bars.forEach((bar) => {
            setTimeout(() => { bar.style.height = bar.dataset.h; }, 100);
          });
          if (progress) setTimeout(() => { progress.style.width = '92%'; }, 300);
        } else if (entry.intersectionRatio < 0.25 && dashAnimated) {
          dashAnimated = false;
          counters.forEach((el) => { el.textContent = '0' + (el.dataset.suffix || ''); });
          bars.forEach((bar) => { bar.style.height = '0%'; });
          if (progress) progress.style.width = '0%';
        }
      });
    }, { threshold: [0.25, 0.75] });
    dashObs.observe(dashCard.closest('.highlight-card') || dashCard);
  }

  // --- Card 3: Checklist items check off with glow ---
  const priorityList = document.querySelector('.priority-list');
  if (priorityList) {
    const items = priorityList.querySelectorAll('.priority-item');
    let prioAnimated = false;

    // Helper to spawn sparkle particles around checkbox
    function createSparkles(checkbox) {
      const rect = checkbox.getBoundingClientRect();
      const card = checkbox.closest('.highlight-card');
      if (!card) return;
      const cardRect = card.getBoundingClientRect();

      // Center of checkbox relative to the card
      const x = rect.left - cardRect.left + rect.width / 2;
      const y = rect.top - cardRect.top + rect.height / 2;

      for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'sparkle-particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        // Random direction and distance
        const angle = (i * 45 + Math.random() * 20) * (Math.PI / 180);
        const distance = 18 + Math.random() * 20;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        
        // Green and accent blue colors matching HausBox
        const colors = ['#06d6a0', '#0DA3E2', '#38bdf8', '#34d399'];
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        card.appendChild(particle);

        setTimeout(() => particle.remove(), 650);
      }
    }

    // Auto-scroll animation observer
    const prioObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio >= 0.75 && !prioAnimated) {
          prioAnimated = true;
          items.forEach((item, i) => {
            setTimeout(() => {
              // Only auto-complete if the user hasn't already clicked it
              if (prioAnimated && !item.classList.contains('completed')) {
                item.classList.add('completed');
                const checkbox = item.querySelector('.priority-checkbox');
                if (checkbox) createSparkles(checkbox);
              }
            }, 500 + i * 800);
          });
        } else if (entry.intersectionRatio < 0.25 && prioAnimated) {
          prioAnimated = false;
          items.forEach((item) => {
            item.classList.remove('completed');
          });
        }
      });
    }, { threshold: [0.25, 0.75] });
    prioObs.observe(priorityList.closest('.highlight-card') || priorityList);

    // Interactive manual toggling on click
    items.forEach((item) => {
      item.addEventListener('click', () => {
        const isNowCompleted = item.classList.toggle('completed');
        if (isNowCompleted) {
          const checkbox = item.querySelector('.priority-checkbox');
          if (checkbox) createSparkles(checkbox);
        }
      });
    });
  }

  // --- Card 4: Chat bubbles with scale+slide ---
  const chatCard = document.querySelector('[data-card-anim="chat"]');
  if (chatCard) {
    const bubbles = chatCard.querySelectorAll('.chat-bubble');
    let chatAnimated = false;
    const chatObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio >= 0.75 && !chatAnimated) {
          chatAnimated = true;
          bubbles.forEach((b, i) => {
            setTimeout(() => {
              b.style.transition = 'opacity 600ms cubic-bezier(0.22,1,0.36,1), transform 600ms cubic-bezier(0.22,1,0.36,1)';
              b.style.opacity = '1';
              b.style.transform = 'translateY(0) scale(1)';
            }, 400 + i * 700);
          });
        } else if (entry.intersectionRatio < 0.25 && chatAnimated) {
          chatAnimated = false;
          bubbles.forEach((b) => {
            b.style.transition = 'none';
            b.style.opacity = '0';
            b.style.transform = 'translateY(24px) scale(0.9)';
          });
        }
      });
    }, { threshold: [0.25, 0.75] });
    chatObs.observe(chatCard.closest('.highlight-card') || chatCard);
  }
}

/* ============================================================
   FLOATING WHATSAPP BUTTON — tooltip control
   ============================================================ */
function initFloatingWhatsApp() {
  const container = document.querySelector('.floating-whatsapp-container');
  if (!container) return;

  const tooltip = container.querySelector('.whatsapp-tooltip');
  if (!tooltip) return;

  // Show tooltip after 2.5 seconds
  setTimeout(() => {
    tooltip.classList.add('visible');
  }, 2500);

  // Hide tooltip after 8.5 seconds
  setTimeout(() => {
    tooltip.classList.remove('visible');
  }, 8500);

  // Also hide tooltip on scroll
  const handleScroll = () => {
    if (window.scrollY > 150) {
      tooltip.classList.remove('visible');
      window.removeEventListener('scroll', handleScroll);
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
}

/* ============================================================
   REVIEWS MARQUEE — CSS-driven infinite loop (no JS override)
   ============================================================ */
function initReviewsLateralScroll() {
  // Reviews section uses pure CSS marquee animation for infinite loop.
  // Previously this function was overriding the CSS animation with
  // a scroll-driven transform. The CSS animation in
  // .bevel-marquee_row handles the infinite loop automatically.
  // No JS intervention needed.
}

/* ============================================================
   ROLE TABS SWITCHER — Para Residente y Para Administrador
   ============================================================ */
function initRolesTabs() {
  const container = document.querySelector('.tabs-selector');
  if (!container) return;

  const buttons = container.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.roles-tabs-section .tab-panel');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      // Update active data attribute for CSS pill move
      container.setAttribute('data-active', tabName);
      
      // Toggle button active classes
      buttons.forEach(b => b.classList.toggle('active', b === btn));

      // Show and hide panels with CSS class transitions
      panels.forEach(panel => {
        const isActive = panel.id === `panel-${tabName}`;
        if (isActive) {
          panel.style.display = 'block';
          panel.offsetHeight; // force reflow
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
          setTimeout(() => {
            if (!panel.classList.contains('active')) {
              panel.style.display = 'none';
            }
          }, 400);
        }
      });
    });
  });
}

/* ============================================================
   SIMPLE MULTI-STEP FORM — Wizard steps and validation
   ============================================================ */
function initMultistepForm() {
  const form = document.getElementById('multistep-form');
  if (!form) return;

  const steps = form.querySelectorAll('.form-step');
  const progressBar = document.getElementById('formProgressBar');
  const stepNums = document.querySelectorAll('.simple-step-num');
  const nextBtns = form.querySelectorAll('.btn-simple-next');
  const prevBtns = form.querySelectorAll('.btn-simple-prev');
  const propertyError = document.getElementById('property-error');

  const totalSteps = 3; // exclude success
  let currentStep = 1;

  function goToStep(stepNum) {
    // Hide all steps
    steps.forEach(s => {
      s.classList.remove('active');
      s.style.display = 'none';
    });

    // Show the target step
    let targetId;
    if (stepNum > totalSteps) {
      targetId = 'step-success';
    } else {
      targetId = 'step-' + stepNum;
    }
    const target = document.getElementById(targetId);
    if (target) {
      target.style.display = 'block';
      // Small delay to trigger CSS transition
      requestAnimationFrame(() => target.classList.add('active'));
    }

    // Update progress bar
    const progress = stepNum > totalSteps ? 100 : (stepNum / totalSteps) * 100;
    if (progressBar) progressBar.style.width = progress + '%';

    // Update step indicator text and progress bar wrap visibility
    const stepIndicator = document.getElementById('formStepIndicator');
    const progressWrap = document.querySelector('.simple-progress-wrap');
    if (stepIndicator) {
      if (stepNum > totalSteps) {
        stepIndicator.textContent = '¡Completado!';
        if (progressWrap) progressWrap.style.display = 'none';
      } else {
        stepIndicator.textContent = `Paso ${stepNum} de ${totalSteps}`;
        if (progressWrap) progressWrap.style.display = 'block';
      }
    }

    // Update step number nav
    stepNums.forEach(btn => {
      const num = parseInt(btn.dataset.goto);
      btn.classList.remove('active', 'completed');
      if (num === stepNum && stepNum <= totalSteps) {
        btn.classList.add('active');
      } else if (num < stepNum) {
        btn.classList.add('completed');
        btn.textContent = '';
      }
      if (stepNum > totalSteps) {
        btn.classList.add('completed');
        btn.textContent = '';
      }
    });

    currentStep = stepNum;
  }

  // Validate individual field
  function validateField(input) {
    const wrap = input.closest('.simple-input-wrap');
    if (!wrap) return true;
    let isValid = true;

    if (input.required && !input.value.trim()) {
      isValid = false;
    }

    if (isValid && input.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value.trim())) isValid = false;
    }

    if (isValid && input.id === 'form-phone') {
      const phoneDigits = input.value.replace(/\D/g, '');
      if (phoneDigits.length < 10) isValid = false;
    }

    wrap.classList.toggle('error', !isValid);
    return isValid;
  }

  function validateStep(stepNum) {
    if (stepNum === 1) {
      const name = document.getElementById('form-name');
      return validateField(name);
    }
    if (stepNum === 2) {
      const checked = form.querySelector('input[name="property-type"]:checked');
      const hasSelection = !!checked;
      if (propertyError) propertyError.classList.toggle('visible', !hasSelection);
      return hasSelection;
    }
    if (stepNum === 3) {
      const phone = document.getElementById('form-phone');
      const email = document.getElementById('form-email');
      const phoneValid = validateField(phone);
      const emailValid = validateField(email);
      return phoneValid && emailValid;
    }
    return true;
  }

  // Next buttons
  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const nextStep = parseInt(btn.dataset.next);
      if (validateStep(currentStep)) {
        goToStep(nextStep);
      }
    });
  });

  // Prev buttons
  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const prevStep = parseInt(btn.dataset.prev);
      goToStep(prevStep);
    });
  });

  // Step num nav (click to go back to completed steps)
  stepNums.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = parseInt(btn.dataset.goto);
      if (target < currentStep) {
        goToStep(target);
      }
    });
  });

  // Prevent Enter key from submitting prematurely, advance steps instead
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const target = e.target;
      if (target.tagName === 'INPUT') {
        if (currentStep < totalSteps) {
          e.preventDefault();
          if (validateStep(currentStep)) {
            goToStep(currentStep + 1);
          }
        }
        // If currentStep === totalSteps, let it bubble and trigger the submit handler below
      }
    }
  });

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      goToStep(totalSteps + 1); // show success
    }
  });

  // Clear property error on selection
  const radios = form.querySelectorAll('input[name="property-type"]');
  radios.forEach(r => {
    r.addEventListener('change', () => {
      if (propertyError) propertyError.classList.remove('visible');
    });
  });
}
