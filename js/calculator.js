/* ============================================================
   HAUSBOX — PRICING CALCULATOR (Standalone Widget)
   2-Step Wizard: Datos → Cotización → Resultado WhatsApp
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  try { initPricingCalcWidget(); } catch(e) { console.warn('[HausBox] Calculator widget error:', e); }
});

function initPricingCalcWidget() {
  const PRICE_PER_UNIT = 20;
  const WA_PHONE = '5215574374431';

  const PROPERTY_TYPES = [
    { id: 'condominio',   label: 'Condominio Residencial', img: 'images/pages/condominios-hero.png' },
    { id: 'vertical',     label: 'Condominio Vertical',    img: 'images/pages/desarrolladores-hero.png' },
    { id: 'vacacional',   label: 'Renta Vacacional',       img: 'images/pages/rentas-hero.png' },
    { id: 'desarrollo',   label: 'Desarrollo Inmobiliario',img: 'images/pages/casos-exito-hero.png' },
    { id: 'oficinas',     label: 'Oficinas',               img: 'images/pages/contabilidad-profesional-hero.png' },
  ];

  // --- Build property cards HTML ---
  const propCardsHTML = PROPERTY_TYPES.map(t => `
    <label class="calc-prop-card" data-prop="${t.id}">
      <input type="radio" name="calc-prop-type" value="${t.label}" />
      <div class="calc-prop-card__img">
        <img src="${t.img}" alt="${t.label}" loading="lazy" />
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
          <div class="calc-step-line"><div class="calc-step-line__fill"></div></div>
          <div class="calc-step-dot" data-step="2"><span>2</span></div>
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

        <!-- ======== STEP 2 — Cotización ======== -->
        <div class="calc-step" id="calc-step-2">
          <div class="calc-modal__header">
            <h3>Tu <span class="serif" style="color:#0DA3E2;">propiedad</span></h3>
            <p>Selecciona el tipo y número de unidades.</p>
          </div>
          <div class="calc-form" id="calc-form-step2">
            <label class="calc-form__group" style="margin-bottom:0;">
              <span style="font-size:13px;font-weight:600;color:#0f172a;letter-spacing:0.01em;">Tipo de propiedad</span>
            </label>
            <div class="calc-prop-grid">
              ${propCardsHTML}
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

            <div class="calc-form__actions">
              <button type="button" class="calc-form__back" id="calc-prev-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Atrás
              </button>
              <button type="button" class="calc-form__submit calc-form__submit--quote" id="calc-quote-btn" disabled>
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
  const openBtn      = document.getElementById('calc-open-btn');
  const overlay      = document.getElementById('calc-modal-overlay');
  const closeBtn     = document.getElementById('calc-close-btn');
  const step1        = document.getElementById('calc-step-1');
  const step2        = document.getElementById('calc-step-2');
  const resultsView  = document.getElementById('calc-results-view');
  const nextBtn      = document.getElementById('calc-next-btn');
  const prevBtn      = document.getElementById('calc-prev-btn');
  const quoteBtn     = document.getElementById('calc-quote-btn');
  const restartBtn   = document.getElementById('calc-restart-btn');
  const slider       = document.getElementById('calc-units');
  const unitsDisplay = document.getElementById('calc-units-display');
  const priceDisplay = document.getElementById('calc-price-display');
  const stepDots     = overlay.querySelectorAll('.calc-step-dot');
  const stepLineFill = overlay.querySelector('.calc-step-line__fill');
  const propCards    = overlay.querySelectorAll('.calc-prop-card');

  if (!openBtn || !overlay) return;

  // ---- State ----
  let currentStep = 1;
  let selectedPropType = '';

  // ---- Slider ----
  function updateSlider() {
    const val = parseInt(slider.value, 10);
    const pct = ((val - 5) / (100 - 5)) * 100;
    slider.style.setProperty('--range-pct', pct + '%');
    unitsDisplay.innerHTML = val + ' <span>unidades</span>';
    priceDisplay.innerHTML = '$' + (val * PRICE_PER_UNIT).toLocaleString('es-MX') + ' <small>MXN / mes</small>';
  }
  slider.addEventListener('input', updateSlider);
  updateSlider();

  // ---- Property Card Selection ----
  propCards.forEach(card => {
    card.addEventListener('click', () => {
      propCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      selectedPropType = radio ? radio.value : '';
      quoteBtn.disabled = false;
    });
  });

  // ---- Step Navigation ----
  function goToStep(n) {
    currentStep = n;
    step1.classList.toggle('active', n === 1);
    step2.classList.toggle('active', n === 2);
    resultsView.classList.remove('active');

    stepDots.forEach(d => {
      const s = parseInt(d.dataset.step, 10);
      d.classList.toggle('active', s <= n);
      d.classList.toggle('completed', s < n);
    });
    if (stepLineFill) stepLineFill.style.width = n >= 2 ? '100%' : '0%';
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

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal(); });

  // ---- Step Buttons ----
  nextBtn.addEventListener('click', () => {
    if (validateStep1()) goToStep(2);
  });
  prevBtn.addEventListener('click', () => goToStep(1));

  // ---- Quote (Submit) ----
  quoteBtn.addEventListener('click', () => {
    if (!selectedPropType) return;

    const name    = document.getElementById('calc-name').value.trim();
    const email   = document.getElementById('calc-email').value.trim();
    const phone   = document.getElementById('calc-phone').value.trim();
    const city    = document.getElementById('calc-city').value.trim();
    const units   = parseInt(slider.value, 10);
    const total   = units * PRICE_PER_UNIT;

    // Results
    document.getElementById('calc-result-summary').textContent =
      `${name}, aquí está el resumen de tu plan para ${units} unidades en un ${selectedPropType}.`;

    document.getElementById('calc-result-card').innerHTML = `
      <div class="result-row"><span class="rl">Tipo de propiedad</span><span class="rv">${selectedPropType}</span></div>
      <div class="result-row"><span class="rl">Unidades</span><span class="rv">${units}</span></div>
      <div class="result-row"><span class="rl">Precio por unidad</span><span class="rv">$${PRICE_PER_UNIT} MXN</span></div>
      ${city ? `<div class="result-row"><span class="rl">Ciudad</span><span class="rv">${city}</span></div>` : ''}
      <div class="result-total"><span class="rl">Total mensual</span><span class="rv">$${total.toLocaleString('es-MX')} MXN</span></div>
    `;

    const waMsg = encodeURIComponent(
      `Hola! Soy ${name}.\n` +
      `Quiero más información sobre HausBox.\n\n` +
      `📋 Mi plan calculado:\n` +
      `• Tipo: ${selectedPropType}\n` +
      `• Unidades: ${units}\n` +
      `• Total mensual: $${total.toLocaleString('es-MX')} MXN\n` +
      (city ? `• Ciudad: ${city}\n` : '') +
      `\n📧 ${email}\n📱 ${phone}`
    );
    document.getElementById('calc-wa-link').href =
      `https://api.whatsapp.com/send/?phone=${WA_PHONE}&text=${waMsg}&type=phone_number&app_absent=0`;

    // Show results
    step1.classList.remove('active');
    step2.classList.remove('active');
    resultsView.classList.add('active');
    stepDots.forEach(d => { d.classList.add('active','completed'); });
    if (stepLineFill) stepLineFill.style.width = '100%';
  });

  // ---- Restart ----
  restartBtn.addEventListener('click', () => {
    resultsView.classList.remove('active');
    selectedPropType = '';
    propCards.forEach(c => { c.classList.remove('selected'); const r = c.querySelector('input'); if (r) r.checked = false; });
    quoteBtn.disabled = true;
    slider.value = 5;
    updateSlider();
    goToStep(1);
  });
}
