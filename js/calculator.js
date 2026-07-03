/* ============================================================
   HAUSBOX — PRICING CALCULATOR (Standalone Widget)
   2-Step Wizard: Datos → Cotización → Resultado WhatsApp
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  try { initPricingCalcWidget(); } catch(e) { console.warn('[HausBox] Calculator widget error:', e); }
});

function initPricingCalcWidget() {
  const WA_PHONE = '5215574374431';

  const MXN_TIERS = [
    { max: 25, price: 13.90 },
    { max: 50, price: 12.90 },
    { max: 100, price: 10.90 },
    { max: 250, price: 7.90 },
    { max: 500, price: 4.90 },
    { max: 700, price: 4.10 },
    { max: 900, price: 3.50 },
    { max: Infinity, price: 3.20 }
  ];

  const USD_TIERS = [
    { max: 25, price: 0.99 },
    { max: 50, price: 0.95 },
    { max: 100, price: 0.85 },
    { max: 250, price: 0.69 },
    { max: 500, price: 0.49 },
    { max: 700, price: 0.44 },
    { max: 900, price: 0.25 },
    { max: Infinity, price: 0.22 }
  ];

  function getPricePerUnit(units, currency) {
    const tiers = currency === 'USD' ? USD_TIERS : MXN_TIERS;
    for (const tier of tiers) {
      if (units <= tier.max) {
        return tier.price;
      }
    }
    return tiers[tiers.length - 1].price;
  }

  const PROPERTY_TYPES = [
    { 
      id: 'condominio', 
      label: 'Condominio Residencial', 
      svg: `<svg viewBox="0 0 24 24"><path d="M2 10l6-5 6 5v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" /><path d="M6 22v-5h4v5" /><path d="M12 10l5-4 5 4v11a1 1 0 0 1-1 1h-6" /><path d="M16 22v-4h3" /></svg>` 
    },
    { 
      id: 'vertical', 
      label: 'Condominio Vertical', 
      svg: `<svg viewBox="0 0 24 24"><rect x="3" y="2" width="7" height="20" rx="1" /><rect x="13" y="6" width="8" height="16" rx="1" /><line x1="6" y1="6" x2="7" y2="6" /><line x1="6" y1="10" x2="7" y2="10" /><line x1="6" y1="14" x2="7" y2="14" /><line x1="6" y1="18" x2="7" y2="18" /><line x1="16" y1="10" x2="18" y2="10" /><line x1="16" y1="14" x2="18" y2="14" /><line x1="16" y1="18" x2="18" y2="18" /></svg>` 
    },
    { 
      id: 'vacacional', 
      label: 'Renta Vacacional', 
      svg: `<svg viewBox="0 0 24 24"><path d="M2 13l6-5 6 5v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" /><path d="M18 22c-.5-4 1.5-6.5 2.5-8" /><path d="M20 14c-1.5-.5-2.5.5-3 1.5" /><path d="M20 14c1.5-.5 2.5.5 3 1.5" /><path d="M20 14c-.5-1.5.5-2.5 1.5-3" /><circle cx="16" cy="5" r="2" /></svg>` 
    },
    { 
      id: 'desarrollo', 
      label: 'Desarrollo Inmobiliario', 
      svg: `<svg viewBox="0 0 24 24"><rect x="3" y="8" width="8" height="14" rx="1" /><line x1="7" y1="12" x2="7" y2="18" /><path d="M16 22V2l6 3H16" /><path d="M11 5h5" /><line x1="20" y1="5" x2="20" y2="10" /><rect x="19" y="10" width="2" height="2" /></svg>` 
    },
    { 
      id: 'oficinas', 
      label: 'Oficinas', 
      svg: `<svg viewBox="0 0 24 24"><rect x="2" y="6" width="10" height="16" rx="1" /><rect x="12" y="2" width="10" height="20" rx="1" /><line x1="5" y1="10" x2="9" y2="10" /><line x1="5" y1="14" x2="9" y2="14" /><line x1="5" y1="18" x2="9" y2="18" /><line x1="15" y1="6" x2="19" y2="6" /><line x1="15" y1="10" x2="19" y2="10" /><line x1="15" y1="14" x2="19" y2="14" /><line x1="15" y1="18" x2="19" y2="18" /></svg>` 
    },
  ];

  // --- Build property cards HTML ---
  const propCardsHTML = PROPERTY_TYPES.map(t => `
    <label class="calc-prop-card" data-prop="${t.id}">
      <input type="radio" name="calc-prop-type" value="${t.label}" />
      <div class="calc-prop-card__img">
        ${t.svg}
      </div>
      <span class="calc-prop-card__label">${t.label}</span>
      <span class="calc-prop-card__check">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </span>
    </label>
  `).join('');

  // --- Inject HTML ---
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

        <!-- Progress -->
        <div class="calc-steps-bar">
          <div class="calc-step-dot active" data-step="1"><span>1</span></div>
          <div class="calc-step-line"><div class="calc-step-line__fill" id="calc-line-fill-1"></div></div>
          <div class="calc-step-dot" data-step="2"><span>2</span></div>
          <div class="calc-step-line"><div class="calc-step-line__fill" id="calc-line-fill-2"></div></div>
          <div class="calc-step-dot" data-step="3"><span>3</span></div>
        </div>

        <!-- ======== STEP 1 — Datos Personales ======== -->
        <div class="calc-step active" id="calc-step-1">
          <div class="calc-modal__header">
            <h3>Tus <span class="serif" style="color:#0DA3E2;">datos</span></h3>
            <p>Cuéntanos sobre ti para personalizar tu cotización.</p>
          </div>
          <div class="calc-form" id="calc-form-step1">
            <div class="calc-form__row">
              <div class="calc-form__group">
                <label for="calc-name">Nombre completo</label>
                <input type="text" id="calc-name" placeholder="Ej: Juan Pérez" required />
              </div>
              <div class="calc-form__group">
                <label for="calc-phone">Teléfono</label>
                <input type="tel" id="calc-phone" placeholder="55 1234 5678" required />
              </div>
            </div>
            <div class="calc-form__row">
              <div class="calc-form__group">
                <label for="calc-email">Correo electrónico</label>
                <input type="email" id="calc-email" placeholder="tu@email.com" required />
              </div>
              <div class="calc-form__group">
                <label for="calc-city">Ciudad <span style="opacity:0.5;font-weight:400;">(opcional)</span></label>
                <input type="text" id="calc-city" placeholder="Ej: CDMX" />
              </div>
            </div>
            <button type="button" class="calc-form__submit" id="calc-next-btn">
              Avanzar
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </div>

        <!-- ======== STEP 2 — Tipo de Propiedad ======== -->
        <div class="calc-step" id="calc-step-2">
          <div class="calc-modal__header">
            <h3>Tu <span class="serif" style="color:#0DA3E2;">propiedad</span></h3>
            <p>Selecciona el tipo de propiedad que administras.</p>
          </div>
          <div class="calc-form" id="calc-form-step2">
            <div class="calc-prop-grid" style="margin-bottom: 2rem;">
              ${propCardsHTML}
            </div>

            <div class="calc-form__actions">
              <button type="button" class="calc-form__back" id="calc-step2-back">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Atrás
              </button>
              <button type="button" class="calc-form__submit calc-form__submit--quote" id="calc-step2-next" disabled>
                Avanzar
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- ======== STEP 3 — Número de Unidades ======== -->
        <div class="calc-step" id="calc-step-3">
          <div class="calc-modal__header">
            <h3>Tus <span class="serif" style="color:#0DA3E2;">unidades</span></h3>
            <p>Ajusta el número de unidades para estimar tu costo.</p>
          </div>
          <div class="calc-form" id="calc-form-step3">
            <!-- Currency Selector -->
            <div class="calc-currency-toggle">
              <span class="currency-toggle-label">Moneda de visualización</span>
              <div class="currency-toggle-group">
                <button type="button" class="currency-btn active" data-currency="MXN">Pesos MXN</button>
                <button type="button" class="currency-btn" data-currency="USD">Dólares USD</button>
              </div>
            </div>

            <div class="calc-slider-group" style="margin-bottom: 2rem;">
              <div class="calc-slider-header">
                <label>Número de unidades</label>
                <div class="calc-slider-value" id="calc-units-display">50 <span>unidades</span></div>
              </div>
              <input type="range" class="calc-range" id="calc-units" min="5" max="1000" value="50" step="5" />
            </div>

            <div class="calc-price-preview" style="margin-bottom: 2.5rem; text-align: center;">
              <div class="price-label">Costo mensual estimado</div>
              <div class="price-amount" id="calc-price-display">$645 <small>MXN / mes</small></div>
              <div class="price-promo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                Paga 11 meses y obtén 1 mes gratis
              </div>
            </div>

            <div class="calc-form__actions">
              <button type="button" class="calc-form__back" id="calc-step3-back">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Atrás
              </button>
              <button type="button" class="calc-form__submit calc-form__submit--quote" id="calc-quote-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                Cotizar
              </button>
            </div>
          </div>
        </div>

        <!-- ======== RESULTS VIEW ======== -->
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
          <button class="calc-results__back" id="calc-restart-btn">← Hacer otra cotización</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  // ---- DOM References ----
  const overlay      = document.getElementById('calc-modal-overlay');
  const closeBtn     = document.getElementById('calc-close-btn');
  const step1        = document.getElementById('calc-step-1');
  const step2        = document.getElementById('calc-step-2');
  const step3        = document.getElementById('calc-step-3');
  const resultsView  = document.getElementById('calc-results-view');
  const nextBtn      = document.getElementById('calc-next-btn');
  const step2BackBtn = document.getElementById('calc-step2-back');
  const step2NextBtn = document.getElementById('calc-step2-next');
  const step3BackBtn = document.getElementById('calc-step3-back');
  const quoteBtn     = document.getElementById('calc-quote-btn');
  const restartBtn   = document.getElementById('calc-restart-btn');
  const slider       = document.getElementById('calc-units');
  const unitsDisplay = document.getElementById('calc-units-display');
  const priceDisplay = document.getElementById('calc-price-display');
  const stepDots     = overlay.querySelectorAll('.calc-step-dot');
  const propCards    = overlay.querySelectorAll('.calc-prop-card');

  if (!overlay) return;

  // ---- State ----
  let currentStep = 1;
  let selectedPropType = '';
  let selectedCurrency = 'MXN';

  // ---- Slider ----
  function updateSlider() {
    const val = parseInt(slider.value, 10);
    const pct = ((val - 5) / (1000 - 5)) * 100;
    slider.style.setProperty('--range-pct', pct + '%');
    
    const unitPrice = getPricePerUnit(val, selectedCurrency);
    const totalCost = val * unitPrice;
    
    unitsDisplay.innerHTML = val + ' <span>unidades</span>';
    priceDisplay.innerHTML = '$' + totalCost.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' <small>' + selectedCurrency + ' / mes</small>';
  }
  slider.addEventListener('input', updateSlider);
  updateSlider();

  // ---- Currency Toggle ----
  const currencyBtns = overlay.querySelectorAll('.currency-btn');
  currencyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currencyBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCurrency = btn.dataset.currency;
      updateSlider();
    });
  });

  // ---- Property Card Selection ----
  propCards.forEach(card => {
    card.addEventListener('click', () => {
      propCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      selectedPropType = radio ? radio.value : '';
      step2NextBtn.disabled = false;
    });
  });

  // ---- Step Navigation ----
  function goToStep(n) {
    currentStep = n;
    step1.classList.toggle('active', n === 1);
    step2.classList.toggle('active', n === 2);
    step3.classList.toggle('active', n === 3);
    resultsView.classList.remove('active');

    stepDots.forEach(d => {
      const s = parseInt(d.dataset.step, 10);
      d.classList.toggle('active', s <= n);
      d.classList.toggle('completed', s < n);
    });

    const lineFill1 = document.getElementById('calc-line-fill-1');
    const lineFill2 = document.getElementById('calc-line-fill-2');
    if (lineFill1) lineFill1.style.width = n >= 2 ? '100%' : '0%';
    if (lineFill2) lineFill2.style.width = n >= 3 ? '100%' : '0%';
  }

  // ---- Validation ----
  function validateStep1() {
    const name  = document.getElementById('calc-name').value.trim();
    const phone = document.getElementById('calc-phone').value.trim();
    const email = document.getElementById('calc-email').value.trim();
    if (!name || !phone || !email) {
      // Highlight empty required fields
      ['calc-name','calc-phone','calc-email'].forEach(id => {
        const el = document.getElementById(id);
        if (!el.value.trim()) {
          el.style.borderColor = '#ef4444';
          el.addEventListener('input', () => { el.style.borderColor = ''; }, { once: true });
        }
      });
      return false;
    }
    return true;
  }

  // ---- Open / Close ----
  function openModal() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Bind all triggers to open modal
  const triggers = document.querySelectorAll('.open-calc-btn, #calc-open-btn, a[href="#precios"]');
  triggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal(); });

  // ---- Step Buttons ----
  nextBtn.addEventListener('click', () => {
    if (validateStep1()) goToStep(2);
  });
  step2BackBtn.addEventListener('click', () => goToStep(1));
  step2NextBtn.addEventListener('click', () => goToStep(3));
  step3BackBtn.addEventListener('click', () => goToStep(2));

  // ---- Quote (Submit) ----
  quoteBtn.addEventListener('click', () => {
    if (!selectedPropType) return;

    const name    = document.getElementById('calc-name').value.trim();
    const email   = document.getElementById('calc-email').value.trim();
    const phone   = document.getElementById('calc-phone').value.trim();
    const city    = document.getElementById('calc-city').value.trim();
    const units   = parseInt(slider.value, 10);
    
    const unitPrice = getPricePerUnit(units, selectedCurrency);
    const total = units * unitPrice;

    // Results
    document.getElementById('calc-result-summary').textContent =
      `${name}, aquí está el resumen de tu plan para ${units} unidades en un ${selectedPropType}.`;

    document.getElementById('calc-result-card').innerHTML = `
      <div class="result-row"><span class="rl">Tipo de propiedad</span><span class="rv">${selectedPropType}</span></div>
      <div class="result-row"><span class="rl">Unidades</span><span class="rv">${units}</span></div>
      <div class="result-row"><span class="rl">Precio por unidad</span><span class="rv">$${unitPrice.toFixed(2)} ${selectedCurrency}</span></div>
      ${city ? `<div class="result-row"><span class="rl">Ciudad</span><span class="rv">${city}</span></div>` : ''}
      <div class="result-total"><span class="rl">Total mensual</span><span class="rv">$${total.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${selectedCurrency}</span></div>
      <div class="result-row" style="margin-top: 8px; font-weight: 600; color: #059669; font-size: 11px;"><span class="rl">Promoción</span><span class="rv">🎁 Paga 11, llévate 12</span></div>
    `;

    const waMsg = encodeURIComponent(
      `Hola! Soy ${name}.\n` +
      `Quiero más información sobre HausBox.\n\n` +
      `📋 Mi plan calculado:\n` +
      `• Tipo: ${selectedPropType}\n` +
      `• Unidades: ${units}\n` +
      `• Total mensual: $${total.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${selectedCurrency}\n` +
      `• Promoción: Paga 11 meses y obtén 1 mes gratis (12 meses en total)\n` +
      (city ? `• Ciudad: ${city}\n` : '') +
      `\n📧 ${email}\n📱 ${phone}`
    );
    document.getElementById('calc-wa-link').href =
      `https://api.whatsapp.com/send/?phone=${WA_PHONE}&text=${waMsg}&type=phone_number&app_absent=0`;

    // Show results
    step1.classList.remove('active');
    step2.classList.remove('active');
    step3.classList.remove('active');
    resultsView.classList.add('active');
    stepDots.forEach(d => { d.classList.add('active','completed'); });
    
    const lineFill1 = document.getElementById('calc-line-fill-1');
    const lineFill2 = document.getElementById('calc-line-fill-2');
    if (lineFill1) lineFill1.style.width = '100%';
    if (lineFill2) lineFill2.style.width = '100%';
  });

  // ---- Restart ----
  restartBtn.addEventListener('click', () => {
    resultsView.classList.remove('active');
    selectedPropType = '';
    propCards.forEach(c => { c.classList.remove('selected'); const r = c.querySelector('input'); if (r) r.checked = false; });
    step2NextBtn.disabled = true;
    slider.value = 5;
    updateSlider();
    goToStep(1);
  });

  // ---- Show/Hide Floating Button on Scroll ----
  const openBtn = document.getElementById('calc-open-btn');
  const handleScroll = () => {
    if (!openBtn) return;
    if (window.scrollY > 300) {
      openBtn.classList.add('show');
    } else {
      openBtn.classList.remove('show');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial check
}

