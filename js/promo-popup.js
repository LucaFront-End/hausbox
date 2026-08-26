/**
 * HausBox - Pop-up Promocional 1 Mes Gratis & Botón Flotante de Regalo
 * Incluye:
 * - Detección instantánea de intento de salida (Exit Intent al mover cursor hacia arriba <= 50px).
 * - Botón de regalo flotante limpio (píldora blanca en esquina inferior izquierda).
 * - Formulario con integración a WhatsApp, FormSubmit y Wix CMS.
 */
(function () {
  'use strict';

  var WA_URL = "https://api.whatsapp.com/send/?phone=5215574374431&text=SWP-+Hola+quisiera+comenzar+mis+30+d%C3%ADas+de+prueba+gratis&type=phone_number&app_absent=0";

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

    // 2. Crear Únicamente el Botón Flotante de Regalo (Píldora Blanca Elegante)
    var floatingTrigger = document.createElement('button');
    floatingTrigger.className = 'promo-floating-trigger';
    floatingTrigger.id = 'promo-floating-trigger';
    floatingTrigger.setAttribute('type', 'button');
    floatingTrigger.setAttribute('aria-label', '1 Mes de Prueba Gratis de Hausbox');
    floatingTrigger.innerHTML = `
      <span class="promo-floating-gift-icon">🎁</span>
      <span class="promo-floating-gift-text">1 Mes Gratis</span>
      <span class="promo-floating-gift-badge">Promo</span>
    `;

    document.body.appendChild(floatingTrigger);

    // Elementos y Control
    var closeBtn = document.getElementById('promo-modal-close');
    var form = document.getElementById('promo-modal-form');
    var formView = document.getElementById('promo-form-view');
    var successView = document.getElementById('promo-success-view');
    var submitBtn = document.getElementById('promo-submit-btn');
    var badgeText = document.getElementById('promo-modal-badge-text');
    var subtitleEl = document.getElementById('promo-modal-subtitle');

    function openModal(isExitIntent) {
      if (isExitIntent && badgeText && subtitleEl) {
        badgeText.textContent = '¡Espera! No te vayas sin tu regalo';
        subtitleEl.textContent = 'Antes de salir, descubre cómo HausBox te ayuda a administrar tu condominio 100% gratis por 30 días.';
      }
      overlay.classList.add('active');
      floatingTrigger.classList.add('hidden');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      overlay.classList.remove('active');
      floatingTrigger.classList.remove('hidden');
      document.body.style.overflow = '';
    }

    window.openHausboxPromoModal = function () {
      openModal(false);
    };
    window.closeHausboxPromoModal = closeModal;

    floatingTrigger.addEventListener('click', function () {
      openModal(false);
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeModal();
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
          })
          .catch(function (err) {
            console.warn('[HausBox Promo] FormSubmit fallback:', err);
            formView.style.display = 'none';
            successView.style.display = 'block';
          })
          .finally(function () {
            submitBtn.classList.remove('loading');
          });
      });
    }

    // --- Control de Triggers de Salida (Instant Exit-Intent) ---
    var hasTriggered = false;

    function triggerExitModal(triggerSource) {
      if (hasTriggered || overlay.classList.contains('active')) return;
      hasTriggered = true;
      console.log('[HausBox Promo] 🎯 Exit Intent activado por:', triggerSource);
      openModal(true);
    }

    // 1. Detección por movimiento de mouse hacia la parte superior (<= 50px de la pantalla)
    document.addEventListener('mousemove', function (e) {
      if (hasTriggered) return;
      if (e.clientY <= 50) {
        triggerExitModal('mousemove_top_50');
      }
    }, { passive: true });

    // 2. Detección cuando el cursor sale del documento hacia arriba
    document.addEventListener('mouseleave', function (e) {
      if (hasTriggered) return;
      if (!e || e.clientY <= 80) {
        triggerExitModal('document_mouseleave');
      }
    });

    if (document.documentElement) {
      document.documentElement.addEventListener('mouseleave', function (e) {
        if (hasTriggered) return;
        if (!e || e.clientY <= 80) {
          triggerExitModal('documentElement_mouseleave');
        }
      });
    }

    // 3. Detección de mouseout de la ventana
    window.addEventListener('mouseout', function (e) {
      if (hasTriggered) return;
      var from = e.relatedTarget || e.toElement;
      if (!from && (e.clientY <= 80 || e.clientX <= 0 || e.clientX >= window.innerWidth)) {
        triggerExitModal('window_mouseout');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPromoModal);
  } else {
    createPromoModal();
  }
})();
