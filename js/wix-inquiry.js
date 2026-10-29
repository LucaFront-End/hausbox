/**
 * Hagash — Wix CMS ConsultasWeb & FormSubmit Integration Engine
 * Proporciona persistencia inmediata y confiable para cotizaciones y prospectos.
 *
 * Características:
 *  - Pre-carga y cachea el token OAuth anónimo de Wix al iniciar la página.
 *  - Usa `keepalive: true` para garantizar que la solicitud no se aborte al abrir WhatsApp o cambiar de pestaña.
 *  - Guarda en la colección 'ConsultasWeb' del CMS de Wix.
 *  - Envía respaldo a contacto@hagash.com (con CC a test1@dilodigitalmx.com) vía FormSubmit.
 *  - Procesa automáticamente cualquier consulta encolada en `window.wixInquiryQueue`.
 */
(function () {
  'use strict';

  var WIX_CLIENT_ID  = 'ad0088f3-624d-4205-aec9-590fd15e74dd';
  var WIX_OAUTH_URL  = 'https://www.wixapis.com/oauth2/token';
  var WIX_DATA_URL   = 'https://www.wixapis.com/wix-data/v2/items';
  var WIX_COLLECTION = 'ConsultasWeb';

  var _cachedToken = null;
  var _tokenExpiry = 0;
  var _tokenPromise = null;

  function getWixToken() {
    var now = Date.now();
    if (_cachedToken && now < _tokenExpiry) {
      return Promise.resolve(_cachedToken);
    }
    if (_tokenPromise) {
      return _tokenPromise;
    }
    _tokenPromise = fetch(WIX_OAUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: WIX_CLIENT_ID, grantType: 'anonymous' }),
      keepalive: true
    })
    .then(function (r) {
      if (!r.ok) throw new Error('OAuth token HTTP error: ' + r.status);
      return r.json();
    })
    .then(function (data) {
      _cachedToken = data.access_token;
      _tokenExpiry = Date.now() + 50 * 60 * 1000;
      _tokenPromise = null;
      return _cachedToken;
    })
    .catch(function (err) {
      _tokenPromise = null;
      console.warn('[Hagash CMS] No se pudo obtener el token de Wix:', err);
      throw err;
    });

    return _tokenPromise;
  }

  // Pre-carga inmediata del token en segundo plano al cargar el script
  try {
    getWixToken().then(function () {
      console.log('[Hagash CMS] ⚡ Token de Wix precargado y listo en memoria.');
    }).catch(function () {});
  } catch (e) {}

  /**
   * Respaldo por FormSubmit a contacto@hagash.com (+ CC)
   */
  function sendFormToFormSubmit(data) {
    var payload = {
      _subject: data.subject || ('Nueva Cotización Web - ' + (data.formSource || data.origen || 'Hagash')),
      _cc: 'test1@dilodigitalmx.com',
      _template: 'table',
      _language: 'es',
      _captcha: 'false',
      'Nombre': data.name || data.nombre || 'No especificado',
      'Correo Electrónico': data.email || data.correo || 'No especificado',
      'Teléfono': data.phone || data.telefono || 'No especificado',
      'Tipo de Propiedad': data.propertyType || data.propiedad || 'N/A',
      'Número de Unidades': data.units || data.unidades || 'N/A',
      'Ciudad': data.city || data.ciudad || window.currentLandingCity || 'N/A',
      'Costo Estimado': data.estimatedCost || data.costo || 'N/A',
      'Moneda': data.currency || data.moneda || 'MXN',
      'Origen de Formulario': data.formSource || data.origen || ('Landing: ' + (window.currentLandingSlug || 'Web')),
      'Fecha': new Date().toLocaleString('es-MX')
    };

    return fetch('https://formsubmit.co/ajax/contacto@hagash.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      keepalive: true
    })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      console.log('[Hagash FormSubmit] ✅ Respaldo enviado por correo:', res);
      return res;
    })
    .catch(function (err) {
      console.warn('[Hagash FormSubmit] Error al enviar correo:', err);
    });
  }

  /**
   * Envía la consulta a Wix CMS (ConsultasWeb) y a FormSubmit
   */
  function submitInquiryToWix(data) {
    if (!data) return Promise.resolve();
    console.log('[Hagash CMS] 📤 Procesando consulta para guardar en Wix CMS...', data);

    // 1. Respaldo por correo
    sendFormToFormSubmit(data);

    // 2. Inserción directa en ConsultasWeb de Wix CMS
    var parsedUnits = 0;
    if (data.units) parsedUnits = parseInt(data.units, 10) || 0;
    else if (data.unidades) parsedUnits = parseInt(data.unidades, 10) || 0;

    return getWixToken()
      .then(function (token) {
        var payload = {
          dataCollectionId: WIX_COLLECTION,
          dataItem: {
            data: {
              nombre:    (data.name || data.nombre || '').trim(),
              correo:    (data.email || data.correo || '').trim(),
              telefono:  (data.phone || data.telefono || '').trim(),
              propiedad: data.propertyType || data.propiedad || '',
              unidades:  parsedUnits,
              ciudad:    data.city || data.ciudad || window.currentLandingCity || '',
              costo:     data.estimatedCost || data.costo || '',
              moneda:    data.currency || data.moneda || 'MXN',
              origen:    data.formSource || data.origen || ('Landing: ' + (window.currentLandingSlug || 'Web'))
            }
          }
        };

        return fetch(WIX_DATA_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify(payload),
          keepalive: true
        });
      })
      .then(function (r) {
        if (!r.ok) throw new Error('Wix Insert Error: ' + r.status);
        return r.json();
      })
      .then(function (res) {
        console.log('[Hagash CMS] ✅ ¡Consulta guardada con éxito en Wix CMS (ConsultasWeb)! ID:', res && res.dataItem ? res.dataItem.id : 'OK');
        return res;
      })
      .catch(function (err) {
        console.error('[Hagash CMS] ❌ Error al guardar consulta en Wix:', err);
      });
  }

  // Publicar funciones en window
  window.submitInquiryToWix = submitInquiryToWix;
  window.sendFormToFormSubmit = sendFormToFormSubmit;
  window.getWixToken = getWixToken;

  // Procesar cualquier consulta encolada antes de cargar este script
  if (window.wixInquiryQueue && Array.isArray(window.wixInquiryQueue)) {
    console.log('[Hagash CMS] 🔄 Procesando consultas en cola:', window.wixInquiryQueue.length);
    while (window.wixInquiryQueue.length > 0) {
      var queued = window.wixInquiryQueue.shift();
      submitInquiryToWix(queued);
    }
  }

  console.log('[Hagash CMS] ✅ Motor Wix ConsultasWeb inicializado.');
})();
