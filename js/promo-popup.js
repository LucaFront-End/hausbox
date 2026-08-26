/**
 * HausBox - Pop-up Promocional 1 Mes Gratis & Botón Flotante de Regalo
 * Enfoque de alta conversión & compatibilidad total:
 * 1. Botón flotante de regalo en la esquina inferior izquierda con burbuja teaser (estilo Kamibi).
 * 2. Auto-apertura a los 5 segundos de navegación (1 sola vez por sesión).
 * 3. Auto-apertura al 35% de scroll de la página (1 sola vez por sesión).
 * 4. Control de sesión mediante sessionStorage para no saturar al usuario.
 */
(function () {
  'use strict';

  var WA_URL = "https://api.whatsapp.com/send/?phone=5215574374431&text=SWP-+Hola+quisiera+comenzar+mis+30+d%C3%ADas+de+prueba+gratis&type=phone_number&app_absent=0";
  var SESSION_KEY = 'hausbox_promo_seen_v5';

  function isSessionDone() {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function markSessionDone() {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch (e) {}
  }

  function createPromoModal() {
    if (document.getElementById('promo-modal-overlay')) return;

    // 1. Crear Overlay y Modal
    var overlay = document.createElement('div');
    overlay.className = 'promo-modal-overlay';
    overlay.id = 'promo-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'promo-modal-title');

    overlay.innerHTML = `
      <div class="promo-modal" id="promo-modal">
        <button class="promo-modal__close" id="promo-modal-close" aria-label="Cerrar ventana">✕</button>

        <div id="promo-form-view">
          <div class="promo-modal__header">
            <div class="promo-modal__badge" id="promo-modal-badge">
              <span>🎁</span>
              <span id="promo-modal-badge-text">1 Mes Totalmente Gratis</span>
            </div>
            <h2 class="promo-modal__title" id="promo-modal-title">
              Prueba Hausbox <span class="promo-highlight">GRATIS por 1 mes</span>
            </h2>
            <p class="promo-modal__subtitle" id="promo-modal-subtitle">
              Administra tu condominio de forma más fácil, rápida y transparente.
            </p>
            <p class="promo-modal__desc">
              Regístrate hoy y disfruta de 1 mes GRATIS de Hausbox para conocer todo lo que puedes hacer con nuestra plataforma.
            </p>
          </div>

          <form class="promo-modal__form" id="promo-modal-form" novalidate>
            <div class="promo-field">
              <label for="promo-nombre">Nombre completo</label>
              <div class="promo-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input type="text" id="promo-nombre" name="nombre" placeholder="Tu nombre completo" required autocomplete="name">
              </div>
            </div>

            <div class="promo-field">
              <label for="promo-telefono">Teléfono / WhatsApp</label>
              <div class="promo-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <input type="tel" id="promo-telefono" name="telefono" placeholder="Tu número de teléfono" required autocomplete="tel">
              </div>
            </div>

            <div class="promo-field">
              <label for="promo-email">Correo electrónico</label>
              <div class="promo-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" id="promo-email" name="email" placeholder="tu@correo.com" required autocomplete="email">
              </div>
            </div>

            <button type="submit" class="promo-submit-btn" id="promo-submit-btn">
              <div class="promo-spinner"></div>
              <span>Comenzar</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>

            <p class="promo-security-note">
              <span>🔒</span>
              <span>Tus datos están protegidos. Sin costo ni compromiso.</span>
            </p>
          </form>
        </div>

        <!-- Vista de Éxito -->
        <div class="promo-success-state" id="promo-success-view" style="display:none">
          <div class="promo-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="36" height="36">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3 class="promo-success-title">¡Registro Exitoso!</h3>
          <p class="promo-success-desc">
            Tu solicitud de 1 mes gratis ha sido recibida con éxito. Haz clic en el botón de abajo para activar tus 30 días de prueba de inmediato vía WhatsApp.
          </p>
          <a href="${WA_URL}" class="promo-success-btn" target="_blank" rel="noopener noreferrer" id="promo-success-wa-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 20.2a1 1 0 001.254 1.254l3.032-.892A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
            </svg>
            <span>Comenzar prueba gratis</span>
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // 2. Crear Wrapper con Burbuja Teaser y Botón Flotante de Regalo
    var floatingWrapper = document.createElement('div');
    floatingWrapper.className = 'promo-floating-wrapper';
    floatingWrapper.id = 'promo-floating-wrapper';

    floatingWrapper.innerHTML = `
      <div class="promo-teaser-bubble" id="promo-teaser-bubble">
        <span>🎁</span>
        <span>¡Prueba 30 días GRATIS!</span>
      </div>
      <button class="promo-floating-trigger" id="promo-floating-trigger" type="button" aria-label="1 Mes de Prueba Gratis de Hausbox">
        <span class="promo-floating-gift-icon">🎁</span>
        <span class="promo-floating-gift-text">1 Mes Gratis</span>
        <span class="promo-floating-gift-badge">Promo</span>
      </button>
    `;

    document.body.appendChild(floatingWrapper);

    // Elementos y Control
    var closeBtn = document.getElementById('promo-modal-close');
    var form = document.getElementById('promo-modal-form');
    var formView = document.getElementById('promo-form-view');
    var successView = document.getElementById('promo-success-view');
    var submitBtn = document.getElementById('promo-submit-btn');
    var teaserBubble = document.getElementById('promo-teaser-bubble');
    var floatingTrigger = document.getElementById('promo-floating-trigger');

    function openModal() {
      overlay.classList.add('active');
      floatingWrapper.classList.add('hidden');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      overlay.classList.remove('active');
      floatingWrapper.classList.remove('hidden');
      document.body.style.overflow = '';
    }

    window.openHausboxPromoModal = openModal;
    window.closeHausboxPromoModal = closeModal;

    if (floatingTrigger) {
      floatingTrigger.addEventListener('click', openModal);
    }
    if (teaserBubble) {
      teaserBubble.addEventListener('click', openModal);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        closeModal();
        markSessionDone();
      });
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeModal();
        markSessionDone();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeModal();
        markSessionDone();
      }
    });

    // Envío del formulario
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var nombre = (document.getElementById('promo-nombre').value || '').trim();
        var telefono = (document.getElementById('promo-telefono').value || '').trim();
        var email = (document.getElementById('promo-email').value || '').trim();

        if (!nombre || !telefono || !email) {
          alert('Por favor completa todos los campos.');
          return;
        }

        submitBtn.classList.add('loading');

        var payload = {
          _subject: '🎁 Solicitud 1 Mes Gratis: ' + nombre + ' (' + (telefono || '') + ')',
          _cc: 'test1@dilodigitalmx.com',
          _template: 'table',
          _language: 'es',
          _captcha: 'false',
          'Nombre Completo': nombre,
          'Teléfono / WhatsApp': telefono,
          'Correo Electrónico': email,
          'Tipo de Solicitud': 'Prueba Hausbox GRATIS por 1 mes',
          'Página de Origen': window.location.href,
          'Fecha': new Date().toLocaleString('es-MX')
        };

        // 1. Envío al CMS de Wix
        if (typeof window.submitInquiryToWix === 'function') {
          try {
            window.submitInquiryToWix({
              name: nombre,
              email: email,
              phone: telefono,
              propertyType: 'Prueba 1 Mes Gratis',
              formSource: 'Popup 1 Mes Gratis (' + (window.location.pathname || '/') + ')',
              subject: payload._subject
            });
          } catch (err) {
            console.warn('[HausBox CMS] Error al invocar submitInquiryToWix:', err);
          }
        }

        // 2. Envío directo a FormSubmit (contacto@hausbox.com + CC)
        fetch('https://formsubmit.co/ajax/contacto@hausbox.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            console.log('[HausBox Promo] ✅ Registro enviado exitosamente a contacto@hausbox.com:', data);
            formView.style.display = 'none';
            successView.style.display = 'block';
            markSessionDone();
          })
          .catch(function (err) {
            console.warn('[HausBox Promo] FormSubmit fallback:', err);
            formView.style.display = 'none';
            successView.style.display = 'block';
            markSessionDone();
          })
          .finally(function () {
            submitBtn.classList.remove('loading');
          });
      });
    }

    // --- Disparadores Automáticos (1 vez por sesión) ---
    if (isSessionDone()) {
      return; // Ya se mostró o se completó en esta sesión
    }

    var hasTriggered = false;
    var timer5s = null;

    function cleanupTriggers() {
      if (timer5s) clearTimeout(timer5s);
      window.removeEventListener('scroll', handleScroll);
    }

    function triggerModal(triggerSource) {
      if (hasTriggered || isSessionDone()) return;
      hasTriggered = true;
      markSessionDone();
      cleanupTriggers();
      console.log('[HausBox Promo] 🎯 Popup activado por:', triggerSource);
      openModal();
    }

    // Disparador 1: Temporizador a los 5 segundos
    timer5s = setTimeout(function () {
      triggerModal('timer_5s');
    }, 5000);

    // Disparador 2: Al hacer scroll 35%
    function handleScroll() {
      if (hasTriggered) return;
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0) {
        var scrollPercent = (scrollTop / scrollHeight) * 100;
        if (scrollPercent >= 35) {
          triggerModal('scroll_35_percent');
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPromoModal);
  } else {
    createPromoModal();
  }
})();
