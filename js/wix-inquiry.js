/**
 * Hagash — Wix CMS ConsultasWeb & FormSubmit Integration Engine
 * Proporciona persistencia inmediata y confiable para cotizaciones y prospectos.
 *
 * Características:
 *  - Pre-carga y cachea el token OAuth anónimo de Wix al iniciar la página.
 *  - Soporta persistencia por etapas actualizando el MISMO registro (Item) mediante ID único (UUID).
 *  - Usa `keepalive: true` para garantizar que la solicitud no se aborte al abrir WhatsApp o cambiar de pestaña.
 *  - Guarda y actualiza en la colección 'ConsultasWeb' del CMS de Wix (POST al inicio, PUT en etapas posteriores con fallback automático).
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

  var _inquiryCache = {};
  var _persistedItems = {};

  /**
   * Generador de UUID v4 compatible con navegadores antiguos y modernos
   */
  function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      try { return crypto.randomUUID(); } catch (e) {}
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

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
    if (data.skipEmail) {
      console.log('[Hagash FormSubmit] ⏩ Envío de correo omitido (etapa intermedia).');
      return Promise.resolve({ skipped: true });
    }

    var defaultSubject = 'Nueva Cotización Web - ' + (data.formSource || data.origen || 'Hagash');
    if (data.formSource && data.formSource.indexOf('Paso 1') !== -1) {
      defaultSubject = 'Nuevo Prospecto Calculadora (Paso 1) - ' + (data.name || data.nombre || 'Hagash');
    }

    var payload = {
      _subject: data.subject || defaultSubject,
      _cc: 'test1@dilodigitalmx.com',
      _template: 'table',
      _language: 'es',
      _captcha: 'false',
      'ID Registro': data.id || 'N/A',
      'Nombre': data.name || data.nombre || 'No especificado',
      'Correo Electrónico': data.email || data.correo || 'No especificado',
      'Teléfono': data.phone || data.telefono || 'No especificado',
      'Tipo de Propiedad': data.propertyType || data.propiedad || 'Pendiente (Paso 1)',
      'Número de Unidades': (data.units !== undefined && data.units !== '') ? data.units : ((data.unidades !== undefined && data.unidades !== '') ? data.unidades : 'Pendiente (Paso 1)'),
      'Ciudad': data.city || data.ciudad || window.currentLandingCity || 'N/A',
      'Costo Estimado': data.estimatedCost || data.costo || 'Pendiente (Paso 1)',
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
   * Envía o actualiza la consulta en Wix CMS (ConsultasWeb) y en FormSubmit
   * Soporta actualización incremental de etapas mediante ID único
   */
  function submitInquiryToWix(data) {
    if (!data) return Promise.resolve();

    // Asegurar ID único persistente para este registro
    var itemId = data.id || data._id || data.itemId;
    if (!itemId) {
      itemId = generateUUID();
      data.id = itemId;
    } else {
      data.id = itemId;
    }

    // Mezclar con los datos acumulados para no sobreescribir campos de pasos previos
    _inquiryCache[itemId] = Object.assign(_inquiryCache[itemId] || {}, data);
    var fullData = _inquiryCache[itemId];

    // Determinar si es una actualización de un registro ya iniciado
    var isUpdate = Boolean(data.isUpdate || _persistedItems[itemId]);

    console.log('[Hagash CMS] 📤 ' + (isUpdate ? 'Actualizando' : 'Creando') + ' registro en Wix CMS (' + itemId + ')...', fullData);

    // 1. Respaldo por correo (solo si no está explícitamente omitido)
    if (!data.skipEmail) {
      sendFormToFormSubmit(fullData);
    }

    // 2. Persistencia en ConsultasWeb de Wix CMS
    var parsedUnits = 0;
    if (fullData.units !== undefined && fullData.units !== null && fullData.units !== '') {
      parsedUnits = parseInt(fullData.units, 10) || 0;
    } else if (fullData.unidades !== undefined && fullData.unidades !== null && fullData.unidades !== '') {
      parsedUnits = parseInt(fullData.unidades, 10) || 0;
    }

    return getWixToken()
      .then(function (token) {
        var itemData = {
          _id:       itemId,
          nombre:    (fullData.name || fullData.nombre || '').trim(),
          correo:    (fullData.email || fullData.correo || '').trim(),
          telefono:  (fullData.phone || fullData.telefono || '').trim(),
          propiedad: (fullData.propertyType || fullData.propiedad || '').trim(),
          unidades:  parsedUnits,
          ciudad:    (fullData.city || fullData.ciudad || window.currentLandingCity || '').trim(),
          costo:     (fullData.estimatedCost || fullData.costo || '').trim(),
          moneda:    (fullData.currency || fullData.moneda || 'MXN').trim(),
          origen:    (fullData.formSource || fullData.origen || ('Landing: ' + (window.currentLandingSlug || 'Web'))).trim()
        };

        var payload = {
          dataCollectionId: WIX_COLLECTION,
          dataItem: {
            id: itemId,
            data: itemData
          }
        };

        var targetUrl = isUpdate ? (WIX_DATA_URL + '/' + encodeURIComponent(itemId)) : WIX_DATA_URL;
        var method = isUpdate ? 'PUT' : 'POST';

        return fetch(targetUrl, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify(payload),
          keepalive: true
        })
        .then(function (r) {
          // Si intentamos PUT y el item no existía (404), fallback automático a POST
          if (isUpdate && r.status === 404) {
            console.warn('[Hagash CMS] Item ' + itemId + ' no encontrado con PUT (404), insertando vía POST...');
            return fetch(WIX_DATA_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
              },
              body: JSON.stringify(payload),
              keepalive: true
            });
          }
          // Si intentamos POST y ya existía (409), fallback automático a PUT
          if (!isUpdate && r.status === 409) {
            console.warn('[Hagash CMS] Item ' + itemId + ' ya existía con POST (409), actualizando vía PUT...');
            return fetch(WIX_DATA_URL + '/' + encodeURIComponent(itemId), {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
              },
              body: JSON.stringify(payload),
              keepalive: true
            });
          }
          return r;
        });
      })
      .then(function (r) {
        if (!r.ok) throw new Error('Wix API Error: HTTP ' + r.status);
        return r.json();
      })
      .then(function (res) {
        _persistedItems[itemId] = true;
        console.log('[Hagash CMS] ✅ ¡Item ' + (isUpdate ? 'actualizado' : 'guardado') + ' con éxito en Wix CMS (ConsultasWeb)! ID:', itemId);
        return { success: true, id: itemId, dataItem: res && res.dataItem ? res.dataItem : null };
      })
      .catch(function (err) {
        console.error('[Hagash CMS] ❌ Error al guardar/actualizar consulta en Wix:', err);
        return { success: false, id: itemId, error: err };
      });
  }

  // Publicar funciones en window
  window.submitInquiryToWix = submitInquiryToWix;
  window.generateUUID = generateUUID;
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
