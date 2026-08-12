/**
 * HausBox — Wix CMS Hydration Engine
 *
 * Arquitectura:
 *   1. Hidrata INMEDIATAMENTE con datos mock (placeholder visual, sin esperar red).
 *   2. Carga el SDK de Wix via import() dinámico (no bloquea el script).
 *   3. Cuando el SDK carga, obtiene datos REALES del CMS y re-hidrata.
 *   4. Si el SDK o la red fallan, el mock queda como fallback.
 *
 * Campos mapeados del CMS de Wix (columnas del CSV exportado):
 *   - Titulo página       → [data-cms="tituloPagina"]
 *   - Excerpt Página      → [data-cms="excerptPagina"]
 *   - Titulo SEO          → <title>
 *   - Metadescripción SEO → <meta name="description">
 *   - Whatsapp personalizado → todos los links de WhatsApp
 */
(function () {
  'use strict';

  /* ─── CONFIG ─────────────────────────────────────────────── */
  var WIX_CLIENT_ID  = 'ad0088f3-624d-4205-aec9-590fd15e74dd';
  var WIX_COLLECTION = 'LandingsdeCiudad';

  /* ─── API REST DE WIX (sin SDK, sin CDN) ─────────────────── */
  var WIX_OAUTH_URL = 'https://www.wixapis.com/oauth2/token';
  var WIX_DATA_URL  = 'https://www.wixapis.com/wix-data/v2/items/query';

  /* Cache del token anónimo para no pedirlo en cada request */
  var _cachedToken = null;
  var _tokenExpiry = 0;

  /**
   * Obtiene un token de visitante anónimo via OAuth con el clientId.
   * Wix permite acceso público a colecciones abiertas con este token.
   */
  function getWixToken() {
    var now = Date.now();
    if (_cachedToken && now < _tokenExpiry) {
      return Promise.resolve(_cachedToken);
    }
    return fetch(WIX_OAUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: WIX_CLIENT_ID, grantType: 'anonymous' })
    })
    .then(function(r) {
      if (!r.ok) throw new Error('OAuth token error: ' + r.status);
      return r.json();
    })
    .then(function(data) {
      _cachedToken = data.access_token;
      /* Wix tokens duran ~1 hora, refrescamos a los 50 min */
      _tokenExpiry = now + 50 * 60 * 1000;
      return _cachedToken;
    });
  }

  /**
   * Consulta la colección del CMS de Wix usando la API REST.
   * Si targetSlug es truthy, filtra por ese slug (devuelve 1 item).
   * Si targetSlug es falsy, devuelve todos los items (para el hub de zonas).
   */
  function fetchFromWixREST(targetSlug) {
    return getWixToken().then(function(token) {
      var body;
      if (targetSlug) {
        body = {
          dataCollectionId: WIX_COLLECTION,
          query: {
            filter: { slug: { '$eq': targetSlug } },
            paging: { limit: 1 }
          },
          includeReferencedItems: []
        };
      } else {
        body = {
          dataCollectionId: WIX_COLLECTION,
          query: { paging: { limit: 1000 } },
          includeReferencedItems: []
        };
      }

      return fetch(WIX_DATA_URL, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(body)
      });
    })
    .then(function(r) {
      if (!r.ok) throw new Error('Wix Data API error: ' + r.status);
      return r.json();
    })
    .then(function(data) {
      /* La API devuelve { dataItems: [{ id, data: {...} }, ...] } */
      if (!data.dataItems || data.dataItems.length === 0) return [];
      console.log('[HausBox CMS] 🔍 RAW data from Wix API (primer item):', JSON.stringify(data.dataItems[0]));
      return data.dataItems.map(function(item) {
        return item.data || item;
      });
    });
  }

  /* ─── DATOS MOCK (idénticos al CMS exportado via CSV) ────── */
  /* Se usan como placeholder visual hasta que carguen los datos reales */
  var MOCK = [
  {
    "_id": "005736d7-7039-43f8-9e4c-487f894e444d",
    "slug": "software-para-conjuntos-habitacionales",
    "titulo": "software para conjuntos habitacionales",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software para conjuntos habitacionales con Hausbox.",
    "excerptPagina": "Hausbox simplifica software para conjuntos habitacionales con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software Para Conjuntos Habitacionales | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software para conjuntos habitacionales, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20para%20conjuntos%20habitacionales"
  },
  {
    "_id": "01ac58ae-496b-4e89-a8a1-bb1872dee16e",
    "slug": "software-para-pagos-de-mantenimiento",
    "titulo": "software para pagos de mantenimiento",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software para pagos de mantenimiento con Hausbox.",
    "excerptPagina": "Hausbox simplifica software para pagos de mantenimiento con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software Para Pagos De Mantenimiento | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software para pagos de mantenimiento, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20para%20pagos%20de%20mantenimiento"
  },
  {
    "_id": "058bb54d-6957-4504-838e-b130007e7293",
    "slug": "software-de-administracion-residencial",
    "titulo": "software de administración residencial",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software de administración residencial con Hausbox.",
    "excerptPagina": "Hausbox simplifica software de administración residencial con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software De Administración Residencial | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software de administración residencial, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20de%20administraci%C3%B3n%20residencial"
  },
  {
    "_id": "073f6477-4886-4b8d-8fbe-485f47cb0f2d",
    "slug": "mejores-herramientas-para-condominios",
    "titulo": "mejores herramientas para condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma mejores herramientas para condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica mejores herramientas para condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Mejores Herramientas Para Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza mejores herramientas para condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20mejores%20herramientas%20para%20condominios"
  },
  {
    "_id": "0ab72f85-de8d-4604-87ff-33cc0357d800",
    "slug": "software-para-edificios-pequenos",
    "titulo": "software para edificios pequeños",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software para edificios pequeños con Hausbox.",
    "excerptPagina": "Hausbox simplifica software para edificios pequeños con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software Para Edificios Pequeños | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software para edificios pequeños, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20para%20edificios%20peque%C3%B1os"
  },
  {
    "_id": "0bde5991-9f9c-4e01-8eea-0b32738e80f5",
    "slug": "app-para-cuotas-de-mantenimiento",
    "titulo": "app para cuotas de mantenimiento",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma app para cuotas de mantenimiento con Hausbox.",
    "excerptPagina": "Hausbox simplifica app para cuotas de mantenimiento con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "App Para Cuotas De Mantenimiento | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza app para cuotas de mantenimiento, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20app%20para%20cuotas%20de%20mantenimiento"
  },
  {
    "_id": "0bec38bd-79b2-4336-918b-2e70326dbc8d",
    "slug": "software-para-administrar-condominios",
    "titulo": "software para administrar condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software para administrar condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica software para administrar condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software Para Administrar Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software para administrar condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20para%20administrar%20condominios"
  },
  {
    "_id": "0d763181-8328-42c6-80ef-c811013b256f",
    "slug": "control-de-acceso-para-privadas",
    "titulo": "control de acceso para privadas",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma control de acceso para privadas con Hausbox.",
    "excerptPagina": "Hausbox simplifica control de acceso para privadas con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Control De Acceso Para Privadas | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza control de acceso para privadas, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20control%20de%20acceso%20para%20privadas"
  },
  {
    "_id": "10c9a5cd-a9d9-4a2a-94a3-29c5666e2472",
    "slug": "como-administrar-condominios-mejor",
    "titulo": "cómo administrar condominios mejor",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma cómo administrar condominios mejor con Hausbox.",
    "excerptPagina": "Hausbox simplifica cómo administrar condominios mejor con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Cómo Administrar Condominios Mejor | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza cómo administrar condominios mejor, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20c%C3%B3mo%20administrar%20condominios%20mejor"
  },
  {
    "_id": "12790919-75b3-4bb6-b3c0-99586f079ae3",
    "slug": "administracion-moderna-de-condominios",
    "titulo": "administración moderna de condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma administración moderna de condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica administración moderna de condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Administración Moderna De Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza administración moderna de condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20administraci%C3%B3n%20moderna%20de%20condominios"
  },
  {
    "_id": "177b21c7-518b-4cc2-8cb5-290b9fae91d1",
    "slug": "sistema-de-acceso-residencial",
    "titulo": "sistema de acceso residencial",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma sistema de acceso residencial con Hausbox.",
    "excerptPagina": "Hausbox simplifica sistema de acceso residencial con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Sistema De Acceso Residencial | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza sistema de acceso residencial, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20sistema%20de%20acceso%20residencial"
  },
  {
    "_id": "184281dd-ae81-4b42-906c-2449806f146e",
    "slug": "sistema-para-condominios",
    "titulo": "sistema para condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma sistema para condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica sistema para condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Sistema Para Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza sistema para condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20sistema%20para%20condominios"
  },
  {
    "_id": "1bb6aeb3-124a-4936-8692-7fcbf417b74b",
    "slug": "plataforma-de-pagos-residenciales",
    "titulo": "plataforma de pagos residenciales",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma plataforma de pagos residenciales con Hausbox.",
    "excerptPagina": "Hausbox simplifica plataforma de pagos residenciales con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Plataforma De Pagos Residenciales | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza plataforma de pagos residenciales, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20plataforma%20de%20pagos%20residenciales"
  },
  {
    "_id": "23414796-15e1-4f6a-ba91-c87b03f9c855",
    "slug": "sistema-de-pagos-residenciales",
    "titulo": "sistema de pagos residenciales",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma sistema de pagos residenciales con Hausbox.",
    "excerptPagina": "Hausbox simplifica sistema de pagos residenciales con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Sistema De Pagos Residenciales | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza sistema de pagos residenciales, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20sistema%20de%20pagos%20residenciales"
  },
  {
    "_id": "244c3647-3341-45c4-bbb9-e8c78c871a23",
    "slug": "automatizacion-de-pagos-condominales",
    "titulo": "automatización de pagos condominales",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma automatización de pagos condominales con Hausbox.",
    "excerptPagina": "Hausbox simplifica automatización de pagos condominales con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Automatización De Pagos Condominales | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza automatización de pagos condominales, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20automatizaci%C3%B3n%20de%20pagos%20condominales"
  },
  {
    "_id": "252e8598-ed0f-4dd9-b997-9d4f447f7abe",
    "slug": "como-mejorar-la-administracion-residencial",
    "titulo": "cómo mejorar la administración residencial",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma cómo mejorar la administración residencial con Hausbox.",
    "excerptPagina": "Hausbox simplifica cómo mejorar la administración residencial con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Cómo Mejorar La Administración Residencial | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza cómo mejorar la administración residencial, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20c%C3%B3mo%20mejorar%20la%20administraci%C3%B3n%20residencial"
  },
  {
    "_id": "2a319bd0-8214-4ee7-8d5b-23175de067ee",
    "slug": "control-vehicular-residencial",
    "titulo": "control vehicular residencial",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma control vehicular residencial con Hausbox.",
    "excerptPagina": "Hausbox simplifica control vehicular residencial con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Control Vehicular Residencial | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza control vehicular residencial, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20control%20vehicular%20residencial"
  },
  {
    "_id": "2c0c434e-27f8-4695-b97a-1ed654529e85",
    "slug": "plataforma-simple-residencial",
    "titulo": "plataforma simple residencial",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma plataforma simple residencial con Hausbox.",
    "excerptPagina": "Hausbox simplifica plataforma simple residencial con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Plataforma Simple Residencial | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza plataforma simple residencial, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20plataforma%20simple%20residencial"
  },
  {
    "_id": "2fb29f57-dde7-40be-a64f-8d28435b0959",
    "slug": "administracion-digital-de-fraccionamientos",
    "titulo": "administración digital de fraccionamientos",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma administración digital de fraccionamientos con Hausbox.",
    "excerptPagina": "Hausbox simplifica administración digital de fraccionamientos con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Administración Digital De Fraccionamientos | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza administración digital de fraccionamientos, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20administraci%C3%B3n%20digital%20de%20fraccionamientos"
  },
  {
    "_id": "31fec2d8-fc65-4af2-a5a4-0c5a1fa22066",
    "slug": "app-profesional-para-residentes",
    "titulo": "app profesional para residentes",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma app profesional para residentes con Hausbox.",
    "excerptPagina": "Hausbox simplifica app profesional para residentes con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "App Profesional Para Residentes | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza app profesional para residentes, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20app%20profesional%20para%20residentes"
  },
  {
    "_id": "32f9b5b2-c3de-4866-8ef8-30b540db25ca",
    "slug": "plataforma-para-condominios",
    "titulo": "plataforma para condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma plataforma para condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica plataforma para condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Plataforma Para Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza plataforma para condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20plataforma%20para%20condominios"
  },
  {
    "_id": "35850f40-06ff-47b9-a5e1-3adffa16ff37",
    "slug": "como-cobrar-cuotas-condominales",
    "titulo": "cómo cobrar cuotas condominales",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma cómo cobrar cuotas condominales con Hausbox.",
    "excerptPagina": "Hausbox simplifica cómo cobrar cuotas condominales con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Cómo Cobrar Cuotas Condominales | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza cómo cobrar cuotas condominales, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20c%C3%B3mo%20cobrar%20cuotas%20condominales"
  },
  {
    "_id": "35addd01-a30e-4c65-b095-fcae09e6250e",
    "slug": "sistema-profesional-residencial",
    "titulo": "sistema profesional residencial",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma sistema profesional residencial con Hausbox.",
    "excerptPagina": "Hausbox simplifica sistema profesional residencial con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Sistema Profesional Residencial | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza sistema profesional residencial, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20sistema%20profesional%20residencial"
  },
  {
    "_id": "35bda08a-ae37-4f92-a6b0-8db02f419206",
    "slug": "app-mexicana-para-condominios",
    "titulo": "app mexicana para condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma app mexicana para condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica app mexicana para condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "App Mexicana Para Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza app mexicana para condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20app%20mexicana%20para%20condominios"
  },
  {
    "_id": "36f5fbae-13b6-4557-8746-0411e5e46b2a",
    "slug": "sistema-integral-para-residentes",
    "titulo": "sistema integral para residentes",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma sistema integral para residentes con Hausbox.",
    "excerptPagina": "Hausbox simplifica sistema integral para residentes con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Sistema Integral Para Residentes | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza sistema integral para residentes, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20sistema%20integral%20para%20residentes"
  },
  {
    "_id": "395b8a0c-032a-4d20-a05b-e4867912b627",
    "slug": "como-administrar-edificios-residenciales",
    "titulo": "cómo administrar edificios residenciales",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma cómo administrar edificios residenciales con Hausbox.",
    "excerptPagina": "Hausbox simplifica cómo administrar edificios residenciales con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Cómo Administrar Edificios Residenciales | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza cómo administrar edificios residenciales, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20c%C3%B3mo%20administrar%20edificios%20residenciales"
  },
  {
    "_id": "3a0b379f-c3d7-4332-bcb3-cf518050ecf5",
    "slug": "como-organizar-pagos-de-mantenimiento",
    "titulo": "cómo organizar pagos de mantenimiento",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma cómo organizar pagos de mantenimiento con Hausbox.",
    "excerptPagina": "Hausbox simplifica cómo organizar pagos de mantenimiento con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Cómo Organizar Pagos De Mantenimiento | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza cómo organizar pagos de mantenimiento, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20c%C3%B3mo%20organizar%20pagos%20de%20mantenimiento"
  },
  {
    "_id": "3a9bf48b-7533-4c1e-9b27-d62f19d7bba9",
    "slug": "sistema-para-edificios-residenciales",
    "titulo": "sistema para edificios residenciales",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma sistema para edificios residenciales con Hausbox.",
    "excerptPagina": "Hausbox simplifica sistema para edificios residenciales con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Sistema Para Edificios Residenciales | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza sistema para edificios residenciales, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20sistema%20para%20edificios%20residenciales"
  },
  {
    "_id": "3ae994c0-7173-4e9b-97f3-12f9b166e423",
    "slug": "software-de-operacion-condominal",
    "titulo": "software de operación condominal",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software de operación condominal con Hausbox.",
    "excerptPagina": "Hausbox simplifica software de operación condominal con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software De Operación Condominal | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software de operación condominal, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20de%20operaci%C3%B3n%20condominal"
  },
  {
    "_id": "3b98532c-77c1-4dd4-8167-a0374cd928ad",
    "slug": "sistema-automatizado-residencial",
    "titulo": "sistema automatizado residencial",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma sistema automatizado residencial con Hausbox.",
    "excerptPagina": "Hausbox simplifica sistema automatizado residencial con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Sistema Automatizado Residencial | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza sistema automatizado residencial, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20sistema%20automatizado%20residencial"
  },
  {
    "_id": "3bbcd9e1-c0c5-4f6f-a159-357eff09cd63",
    "slug": "plataforma-para-fraccionamientos",
    "titulo": "plataforma para fraccionamientos",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma plataforma para fraccionamientos con Hausbox.",
    "excerptPagina": "Hausbox simplifica plataforma para fraccionamientos con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Plataforma Para Fraccionamientos | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza plataforma para fraccionamientos, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20plataforma%20para%20fraccionamientos"
  },
  {
    "_id": "3eeb1264-30e9-4b90-a8d4-8260d64744d4",
    "slug": "app-para-privadas-residenciales",
    "titulo": "app para privadas residenciales",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma app para privadas residenciales con Hausbox.",
    "excerptPagina": "Hausbox simplifica app para privadas residenciales con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "App Para Privadas Residenciales | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza app para privadas residenciales, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20app%20para%20privadas%20residenciales"
  },
  {
    "_id": "42b05c86-e245-41e9-9530-588fd19d6b98",
    "slug": "como-organizar-cuotas-de-mantenimiento",
    "titulo": "cómo organizar cuotas de mantenimiento",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma cómo organizar cuotas de mantenimiento con Hausbox.",
    "excerptPagina": "Hausbox simplifica cómo organizar cuotas de mantenimiento con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Cómo Organizar Cuotas De Mantenimiento | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza cómo organizar cuotas de mantenimiento, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20c%C3%B3mo%20organizar%20cuotas%20de%20mantenimiento"
  },
  {
    "_id": "4d9a8910-9534-49de-b4e3-405d235214a1",
    "slug": "administracion-inteligente-residencial",
    "titulo": "administración inteligente residencial",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma administración inteligente residencial con Hausbox.",
    "excerptPagina": "Hausbox simplifica administración inteligente residencial con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Administración Inteligente Residencial | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza administración inteligente residencial, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20administraci%C3%B3n%20inteligente%20residencial"
  },
  {
    "_id": "4e51fc1f-d5c2-4601-a1b5-b47f442ddc39",
    "slug": "administracion-digital-de-condominios",
    "titulo": "administración digital de condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma administración digital de condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica administración digital de condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Administración Digital De Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza administración digital de condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20administraci%C3%B3n%20digital%20de%20condominios"
  },
  {
    "_id": "4e784307-f5e8-4f65-bd0c-09b338d4880c",
    "slug": "contratar-software-para-condominios",
    "titulo": "contratar software para condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma contratar software para condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica contratar software para condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Contratar Software Para Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza contratar software para condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20contratar%20software%20para%20condominios"
  },
  {
    "_id": "51c10018-918b-4594-9f73-867a40af2d73",
    "slug": "pagos-en-linea-para-residentes",
    "titulo": "pagos en línea para residentes",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma pagos en línea para residentes con Hausbox.",
    "excerptPagina": "Hausbox simplifica pagos en línea para residentes con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Pagos En Línea Para Residentes | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza pagos en línea para residentes, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20pagos%20en%20l%C3%ADnea%20para%20residentes"
  },
  {
    "_id": "54e0e198-0a10-406b-a6aa-0b9d11afb47e",
    "slug": "digitalizar-administracion-residencial",
    "titulo": "digitalizar administración residencial",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma digitalizar administración residencial con Hausbox.",
    "excerptPagina": "Hausbox simplifica digitalizar administración residencial con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Digitalizar Administración Residencial | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza digitalizar administración residencial, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20digitalizar%20administraci%C3%B3n%20residencial"
  },
  {
    "_id": "5541a46f-c7c4-43e2-8d55-258ad9e77687",
    "slug": "app-para-edificios-residenciales",
    "titulo": "app para edificios residenciales",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma app para edificios residenciales con Hausbox.",
    "excerptPagina": "Hausbox simplifica app para edificios residenciales con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "App Para Edificios Residenciales | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza app para edificios residenciales, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20app%20para%20edificios%20residenciales"
  },
  {
    "_id": "5552df6e-9e92-4e3d-a7fc-ab1cd36aefea",
    "slug": "demo-software-condominios",
    "titulo": "demo software condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma demo software condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica demo software condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Demo Software Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza demo software condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20demo%20software%20condominios"
  },
  {
    "_id": "58773b1b-d807-430f-8952-70cde9609b2c",
    "slug": "plataforma-para-vecinos",
    "titulo": "plataforma para vecinos",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma plataforma para vecinos con Hausbox.",
    "excerptPagina": "Hausbox simplifica plataforma para vecinos con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Plataforma Para Vecinos | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza plataforma para vecinos, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20plataforma%20para%20vecinos"
  },
  {
    "_id": "5a26aaf0-5e81-48cb-8f14-0c134963e48b",
    "slug": "app-de-gestion-residencial",
    "titulo": "app de gestión residencial",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma app de gestión residencial con Hausbox.",
    "excerptPagina": "Hausbox simplifica app de gestión residencial con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "App De Gestión Residencial | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza app de gestión residencial, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20app%20de%20gesti%C3%B3n%20residencial"
  },
  {
    "_id": "5adbbf86-e724-4f9e-b5f8-a82b090851a2",
    "slug": "como-evitar-morosidad-en-condominios",
    "titulo": "cómo evitar morosidad en condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma cómo evitar morosidad en condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica cómo evitar morosidad en condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Cómo Evitar Morosidad En Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza cómo evitar morosidad en condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20c%C3%B3mo%20evitar%20morosidad%20en%20condominios"
  },
  {
    "_id": "5c4ccb7d-b050-448c-92a5-b6489637c57b",
    "slug": "mejor-software-para-condominios",
    "titulo": "mejor software para condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma mejor software para condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica mejor software para condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Mejor Software Para Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza mejor software para condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20mejor%20software%20para%20condominios"
  },
  {
    "_id": "60080a67-1452-456b-bf85-093696cb988d",
    "slug": "automatizacion-de-condominios",
    "titulo": "automatización de condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma automatización de condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica automatización de condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Automatización De Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza automatización de condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20automatizaci%C3%B3n%20de%20condominios"
  },
  {
    "_id": "6579dc74-5467-43ab-a452-fb2787eb2826",
    "slug": "plataforma-para-residentes",
    "titulo": "plataforma para residentes",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma plataforma para residentes con Hausbox.",
    "excerptPagina": "Hausbox simplifica plataforma para residentes con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Plataforma Para Residentes | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza plataforma para residentes, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20plataforma%20para%20residentes"
  },
  {
    "_id": "6adac611-315a-4712-adac-a42abb1cbfb6",
    "slug": "automatizar-pagos-condominales",
    "titulo": "automatizar pagos condominales",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma automatizar pagos condominales con Hausbox.",
    "excerptPagina": "Hausbox simplifica automatizar pagos condominales con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Automatizar Pagos Condominales | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza automatizar pagos condominales, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20automatizar%20pagos%20condominales"
  },
  {
    "_id": "6b5ef6f4-da99-4273-9b4c-07cef7e3ef57",
    "slug": "plataforma-de-acceso-condominal",
    "titulo": "plataforma de acceso condominal",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma plataforma de acceso condominal con Hausbox.",
    "excerptPagina": "Hausbox simplifica plataforma de acceso condominal con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Plataforma De Acceso Condominal | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza plataforma de acceso condominal, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20plataforma%20de%20acceso%20condominal"
  },
  {
    "_id": "6b99548e-f77c-4465-8da2-7c5bf8d84a51",
    "slug": "software-para-estados-de-cuenta",
    "titulo": "software para estados de cuenta",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software para estados de cuenta con Hausbox.",
    "excerptPagina": "Hausbox simplifica software para estados de cuenta con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software Para Estados De Cuenta | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software para estados de cuenta, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20para%20estados%20de%20cuenta"
  },
  {
    "_id": "6d4f1539-b34b-4659-9f9c-1e5987a2079b",
    "slug": "sistema-de-avisos-residenciales",
    "titulo": "sistema de avisos residenciales",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma sistema de avisos residenciales con Hausbox.",
    "excerptPagina": "Hausbox simplifica sistema de avisos residenciales con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Sistema De Avisos Residenciales | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza sistema de avisos residenciales, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20sistema%20de%20avisos%20residenciales"
  },
  {
    "_id": "6da69c62-decd-46b8-a8e9-249ead8e2600",
    "slug": "software-para-automatizar-cobranza",
    "titulo": "software para automatizar cobranza",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software para automatizar cobranza con Hausbox.",
    "excerptPagina": "Hausbox simplifica software para automatizar cobranza con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software Para Automatizar Cobranza | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software para automatizar cobranza, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20para%20automatizar%20cobranza"
  },
  {
    "_id": "6edbf8b2-d5b7-41c7-990b-5243de2cf05f",
    "slug": "software-de-seguridad-condominal",
    "titulo": "software de seguridad condominal",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software de seguridad condominal con Hausbox.",
    "excerptPagina": "Hausbox simplifica software de seguridad condominal con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software De Seguridad Condominal | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software de seguridad condominal, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20de%20seguridad%20condominal"
  },
  {
    "_id": "735c2b82-74b0-4115-9786-5fd561d5f018",
    "slug": "sistema-de-pagos-para-vecinos",
    "titulo": "sistema de pagos para vecinos",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma sistema de pagos para vecinos con Hausbox.",
    "excerptPagina": "Hausbox simplifica sistema de pagos para vecinos con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Sistema De Pagos Para Vecinos | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza sistema de pagos para vecinos, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20sistema%20de%20pagos%20para%20vecinos"
  },
  {
    "_id": "74ffbcb3-3ddc-4137-a11d-12cc75b61742",
    "slug": "plataforma-profesional-para-condominios",
    "titulo": "plataforma profesional para condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma plataforma profesional para condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica plataforma profesional para condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Plataforma Profesional Para Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza plataforma profesional para condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20plataforma%20profesional%20para%20condominios"
  },
  {
    "_id": "75cd0297-3aeb-4618-acb6-471e18e83840",
    "slug": "como-administrar-fraccionamientos",
    "titulo": "cómo administrar fraccionamientos",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma cómo administrar fraccionamientos con Hausbox.",
    "excerptPagina": "Hausbox simplifica cómo administrar fraccionamientos con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Cómo Administrar Fraccionamientos | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza cómo administrar fraccionamientos, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20c%C3%B3mo%20administrar%20fraccionamientos"
  },
  {
    "_id": "7822b13a-b63b-4eee-ada1-76a44920d2d3",
    "slug": "software-para-caseta-residencial",
    "titulo": "software para caseta residencial",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software para caseta residencial con Hausbox.",
    "excerptPagina": "Hausbox simplifica software para caseta residencial con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software Para Caseta Residencial | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software para caseta residencial, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20para%20caseta%20residencial"
  },
  {
    "_id": "79f21edf-900b-4020-bb9a-b909e17d5af3",
    "slug": "precio-software-para-condominios",
    "titulo": "precio software para condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma precio software para condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica precio software para condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Precio Software Para Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza precio software para condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20precio%20software%20para%20condominios"
  },
  {
    "_id": "7d4b4fdd-4523-4685-a5e2-a88131ab5f2c",
    "slug": "sistema-sencillo-para-condominios",
    "titulo": "sistema sencillo para condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma sistema sencillo para condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica sistema sencillo para condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Sistema Sencillo Para Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza sistema sencillo para condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20sistema%20sencillo%20para%20condominios"
  },
  {
    "_id": "7fa7fa1a-861c-4be7-a6f1-58231308d09f",
    "slug": "sistema-para-administracion-online",
    "titulo": "sistema para administración online",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma sistema para administración online con Hausbox.",
    "excerptPagina": "Hausbox simplifica sistema para administración online con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Sistema Para Administración Online | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza sistema para administración online, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20sistema%20para%20administraci%C3%B3n%20online"
  },
  {
    "_id": "811c8bf2-eee6-481d-bda2-671f2be099ee",
    "slug": "sistema-qr-para-visitas",
    "titulo": "sistema QR para visitas",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma sistema QR para visitas con Hausbox.",
    "excerptPagina": "Hausbox simplifica sistema QR para visitas con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Sistema Qr Para Visitas | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza sistema QR para visitas, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20sistema%20QR%20para%20visitas"
  },
  {
    "_id": "8748e92c-27f9-4ad9-93a0-65e3095859a1",
    "slug": "software-economico-para-condominios",
    "titulo": "software económico para condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software económico para condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica software económico para condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software Económico Para Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software económico para condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20econ%C3%B3mico%20para%20condominios"
  },
  {
    "_id": "8859d4ce-2b2e-4624-bf9d-2e678ecef0a3",
    "slug": "herramienta-para-administrar-edificios",
    "titulo": "herramienta para administrar edificios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma herramienta para administrar edificios con Hausbox.",
    "excerptPagina": "Hausbox simplifica herramienta para administrar edificios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Herramienta Para Administrar Edificios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza herramienta para administrar edificios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20herramienta%20para%20administrar%20edificios"
  },
  {
    "_id": "8988577a-09cf-49ac-9916-9ea79b719b5c",
    "slug": "administracion-residencial-online",
    "titulo": "administración residencial online",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma administración residencial online con Hausbox.",
    "excerptPagina": "Hausbox simplifica administración residencial online con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Administración Residencial Online | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza administración residencial online, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20administraci%C3%B3n%20residencial%20online"
  },
  {
    "_id": "8d07425d-2cc3-4f24-b16b-379082923628",
    "slug": "app-de-comunicacion-para-condominios",
    "titulo": "app de comunicación para condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma app de comunicación para condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica app de comunicación para condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "App De Comunicación Para Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza app de comunicación para condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20app%20de%20comunicaci%C3%B3n%20para%20condominios"
  },
  {
    "_id": "8e86e26d-5061-4b91-adc3-ef45376fbf6e",
    "slug": "como-controlar-acceso-de-visitas",
    "titulo": "cómo controlar acceso de visitas",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma cómo controlar acceso de visitas con Hausbox.",
    "excerptPagina": "Hausbox simplifica cómo controlar acceso de visitas con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Cómo Controlar Acceso De Visitas | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza cómo controlar acceso de visitas, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20c%C3%B3mo%20controlar%20acceso%20de%20visitas"
  },
  {
    "_id": "90b2dc18-7a2e-4f51-9e2d-b2858b78ff1e",
    "slug": "sistema-de-cobranza-condominal",
    "titulo": "sistema de cobranza condominal",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma sistema de cobranza condominal con Hausbox.",
    "excerptPagina": "Hausbox simplifica sistema de cobranza condominal con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Sistema De Cobranza Condominal | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza sistema de cobranza condominal, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20sistema%20de%20cobranza%20condominal"
  },
  {
    "_id": "93dc8f96-68ff-467e-9e4a-67d686135a81",
    "slug": "sistema-de-cobranza-para-condominios",
    "titulo": "sistema de cobranza para condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma sistema de cobranza para condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica sistema de cobranza para condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Sistema De Cobranza Para Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza sistema de cobranza para condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20sistema%20de%20cobranza%20para%20condominios"
  },
  {
    "_id": "949ca536-7bf5-4b9c-b908-dc5cf0b66a68",
    "slug": "como-controlar-pagos-residenciales",
    "titulo": "cómo controlar pagos residenciales",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma cómo controlar pagos residenciales con Hausbox.",
    "excerptPagina": "Hausbox simplifica cómo controlar pagos residenciales con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Cómo Controlar Pagos Residenciales | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza cómo controlar pagos residenciales, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20c%C3%B3mo%20controlar%20pagos%20residenciales"
  },
  {
    "_id": "971ac486-2034-412f-bf74-5b64ca41b5ec",
    "slug": "software-para-fraccionamientos",
    "titulo": "software para fraccionamientos",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software para fraccionamientos con Hausbox.",
    "excerptPagina": "Hausbox simplifica software para fraccionamientos con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software Para Fraccionamientos | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software para fraccionamientos, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20para%20fraccionamientos"
  },
  {
    "_id": "996eb5b4-b0ad-41d9-8a46-a6b20aa86da0",
    "slug": "control-digital-de-residentes",
    "titulo": "control digital de residentes",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma control digital de residentes con Hausbox.",
    "excerptPagina": "Hausbox simplifica control digital de residentes con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Control Digital De Residentes | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza control digital de residentes, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20control%20digital%20de%20residentes"
  },
  {
    "_id": "9a0eea5b-4f5a-4ae7-bcec-e7d3baf797d7",
    "slug": "como-reducir-morosidad-en-condominios",
    "titulo": "cómo reducir morosidad en condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma cómo reducir morosidad en condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica cómo reducir morosidad en condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Cómo Reducir Morosidad En Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza cómo reducir morosidad en condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20c%C3%B3mo%20reducir%20morosidad%20en%20condominios"
  },
  {
    "_id": "a6a88aa2-982b-45e8-bb65-3e40bca97585",
    "slug": "software-para-privadas-residenciales",
    "titulo": "software para privadas residenciales",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software para privadas residenciales con Hausbox.",
    "excerptPagina": "Hausbox simplifica software para privadas residenciales con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software Para Privadas Residenciales | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software para privadas residenciales, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20para%20privadas%20residenciales"
  },
  {
    "_id": "a79eceae-051b-42b8-8631-205fcfe5f1e4",
    "slug": "software-para-conjuntos-residenciales",
    "titulo": "software para conjuntos residenciales",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software para conjuntos residenciales con Hausbox.",
    "excerptPagina": "Hausbox simplifica software para conjuntos residenciales con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software Para Conjuntos Residenciales | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software para conjuntos residenciales, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20para%20conjuntos%20residenciales"
  },
  {
    "_id": "a7e10404-132a-42e0-b82f-27d44d676941",
    "slug": "sistema-de-gestion-residencial",
    "titulo": "sistema de gestión residencial",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma sistema de gestión residencial con Hausbox.",
    "excerptPagina": "Hausbox simplifica sistema de gestión residencial con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Sistema De Gestión Residencial | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza sistema de gestión residencial, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20sistema%20de%20gesti%C3%B3n%20residencial"
  },
  {
    "_id": "b073ffab-4ff4-4b88-99c0-d14d6cce2141",
    "slug": "sistema-residencial-privado",
    "titulo": "sistema residencial privado",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma sistema residencial privado con Hausbox.",
    "excerptPagina": "Hausbox simplifica sistema residencial privado con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Sistema Residencial Privado | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza sistema residencial privado, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20sistema%20residencial%20privado"
  },
  {
    "_id": "b0778dd1-9bd5-426f-81bd-76a7f27a6bcb",
    "slug": "control-de-pagos-vecinales",
    "titulo": "control de pagos vecinales",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma control de pagos vecinales con Hausbox.",
    "excerptPagina": "Hausbox simplifica control de pagos vecinales con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Control De Pagos Vecinales | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza control de pagos vecinales, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20control%20de%20pagos%20vecinales"
  },
  {
    "_id": "b4924861-9f02-4863-847b-a92f5c2dd350",
    "slug": "plataforma-de-administracion-online",
    "titulo": "plataforma de administración online",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma plataforma de administración online con Hausbox.",
    "excerptPagina": "Hausbox simplifica plataforma de administración online con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Plataforma De Administración Online | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza plataforma de administración online, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20plataforma%20de%20administraci%C3%B3n%20online"
  },
  {
    "_id": "b6f2aaa7-0451-4395-a7ae-3e8f4ba6e9c5",
    "slug": "como-mejorar-cobranza-residencial",
    "titulo": "cómo mejorar cobranza residencial",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma cómo mejorar cobranza residencial con Hausbox.",
    "excerptPagina": "Hausbox simplifica cómo mejorar cobranza residencial con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Cómo Mejorar Cobranza Residencial | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza cómo mejorar cobranza residencial, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20c%C3%B3mo%20mejorar%20cobranza%20residencial"
  },
  {
    "_id": "b8128aee-ba2e-4148-a234-634fca6a550a",
    "slug": "herramientas-para-administradores",
    "titulo": "herramientas para administradores",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma herramientas para administradores con Hausbox.",
    "excerptPagina": "Hausbox simplifica herramientas para administradores con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Herramientas Para Administradores | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza herramientas para administradores, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20herramientas%20para%20administradores"
  },
  {
    "_id": "bd43a06c-3f3b-4f9a-8010-7ac739f2389b",
    "slug": "software-de-control-administrativo",
    "titulo": "software de control administrativo",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software de control administrativo con Hausbox.",
    "excerptPagina": "Hausbox simplifica software de control administrativo con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software De Control Administrativo | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software de control administrativo, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20de%20control%20administrativo"
  },
  {
    "_id": "c33712b9-37f1-4988-9a41-d63b76f5f679",
    "slug": "software-para-comunicacion-residencial",
    "titulo": "software para comunicación residencial",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software para comunicación residencial con Hausbox.",
    "excerptPagina": "Hausbox simplifica software para comunicación residencial con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software Para Comunicación Residencial | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software para comunicación residencial, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20para%20comunicaci%C3%B3n%20residencial"
  },
  {
    "_id": "c5ec6e53-5359-4ce1-81c5-c9bcc6358701",
    "slug": "sistema-para-cobrar-cuotas-condominales",
    "titulo": "sistema para cobrar cuotas condominales",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma sistema para cobrar cuotas condominales con Hausbox.",
    "excerptPagina": "Hausbox simplifica sistema para cobrar cuotas condominales con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Sistema Para Cobrar Cuotas Condominales | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza sistema para cobrar cuotas condominales, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20sistema%20para%20cobrar%20cuotas%20condominales"
  },
  {
    "_id": "c795e40c-c84c-4cda-a02a-ce7f43078340",
    "slug": "administracion-de-privadas",
    "titulo": "administración de privadas",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma administración de privadas con Hausbox.",
    "excerptPagina": "Hausbox simplifica administración de privadas con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Administración De Privadas | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza administración de privadas, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20administraci%C3%B3n%20de%20privadas"
  },
  {
    "_id": "ca4ff123-0710-414b-a902-2c1c5dc33238",
    "slug": "software-para-administracion-moderna",
    "titulo": "software para administración moderna",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software para administración moderna con Hausbox.",
    "excerptPagina": "Hausbox simplifica software para administración moderna con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software Para Administración Moderna | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software para administración moderna, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20para%20administraci%C3%B3n%20moderna"
  },
  {
    "_id": "ca63bf6b-120f-4113-81a3-bdbf785f0804",
    "slug": "software-para-comites-vecinales",
    "titulo": "software para comités vecinales",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software para comités vecinales con Hausbox.",
    "excerptPagina": "Hausbox simplifica software para comités vecinales con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software Para Comités Vecinales | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software para comités vecinales, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20para%20comit%C3%A9s%20vecinales"
  },
  {
    "_id": "cd1081b9-508c-4608-a2e1-9b100a470e32",
    "slug": "problemas-en-administracion-condominal",
    "titulo": "problemas en administración condominal",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma problemas en administración condominal con Hausbox.",
    "excerptPagina": "Hausbox simplifica problemas en administración condominal con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Problemas En Administración Condominal | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza problemas en administración condominal, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20problemas%20en%20administraci%C3%B3n%20condominal"
  },
  {
    "_id": "cf6e9231-f7ab-4e24-939e-7ebe3ca2ce9f",
    "slug": "plataforma-residencial-inteligente",
    "titulo": "plataforma residencial inteligente",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma plataforma residencial inteligente con Hausbox.",
    "excerptPagina": "Hausbox simplifica plataforma residencial inteligente con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Plataforma Residencial Inteligente | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza plataforma residencial inteligente, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20plataforma%20residencial%20inteligente"
  },
  {
    "_id": "d24f9404-9799-4613-8853-c36542de9cc5",
    "slug": "sistema-para-evitar-adeudos",
    "titulo": "sistema para evitar adeudos",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma sistema para evitar adeudos con Hausbox.",
    "excerptPagina": "Hausbox simplifica sistema para evitar adeudos con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Sistema Para Evitar Adeudos | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza sistema para evitar adeudos, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20sistema%20para%20evitar%20adeudos"
  },
  {
    "_id": "d25886c7-07ad-4809-a69e-e7da46c2ea64",
    "slug": "como-digitalizar-un-condominio",
    "titulo": "cómo digitalizar un condominio",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma cómo digitalizar un condominio con Hausbox.",
    "excerptPagina": "Hausbox simplifica cómo digitalizar un condominio con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Cómo Digitalizar Un Condominio | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza cómo digitalizar un condominio, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20c%C3%B3mo%20digitalizar%20un%20condominio"
  },
  {
    "_id": "d2cbaa89-eb86-448e-bb5e-c9ff665dd054",
    "slug": "app-de-seguridad-residencial",
    "titulo": "app de seguridad residencial",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma app de seguridad residencial con Hausbox.",
    "excerptPagina": "Hausbox simplifica app de seguridad residencial con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "App De Seguridad Residencial | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza app de seguridad residencial, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20app%20de%20seguridad%20residencial"
  },
  {
    "_id": "d6039daa-436f-4c35-86f0-65077be45c41",
    "slug": "app-para-administracion-vecinal",
    "titulo": "app para administración vecinal",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma app para administración vecinal con Hausbox.",
    "excerptPagina": "Hausbox simplifica app para administración vecinal con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "App Para Administración Vecinal | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza app para administración vecinal, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20app%20para%20administraci%C3%B3n%20vecinal"
  },
  {
    "_id": "db92f85e-5f57-4730-a199-0ecbd63939eb",
    "slug": "como-administrar-residentes",
    "titulo": "cómo administrar residentes",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma cómo administrar residentes con Hausbox.",
    "excerptPagina": "Hausbox simplifica cómo administrar residentes con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Cómo Administrar Residentes | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza cómo administrar residentes, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20c%C3%B3mo%20administrar%20residentes"
  },
  {
    "_id": "e009b51b-69e0-4b64-b697-ec00fa137f3c",
    "slug": "control-de-cuotas-de-residentes",
    "titulo": "control de cuotas de residentes",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma control de cuotas de residentes con Hausbox.",
    "excerptPagina": "Hausbox simplifica control de cuotas de residentes con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Control De Cuotas De Residentes | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza control de cuotas de residentes, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20control%20de%20cuotas%20de%20residentes"
  },
  {
    "_id": "e129a794-bcdf-4705-b62b-9a007427929c",
    "slug": "app-facil-para-residentes",
    "titulo": "app fácil para residentes",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma app fácil para residentes con Hausbox.",
    "excerptPagina": "Hausbox simplifica app fácil para residentes con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "App Fácil Para Residentes | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza app fácil para residentes, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20app%20f%C3%A1cil%20para%20residentes"
  },
  {
    "_id": "e36edbee-5f11-4050-9645-f708c5339b2e",
    "slug": "como-digitalizar-administracion-residencial",
    "titulo": "cómo digitalizar administración residencial",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma cómo digitalizar administración residencial con Hausbox.",
    "excerptPagina": "Hausbox simplifica cómo digitalizar administración residencial con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Cómo Digitalizar Administración Residencial | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza cómo digitalizar administración residencial, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20c%C3%B3mo%20digitalizar%20administraci%C3%B3n%20residencial"
  },
  {
    "_id": "e5ccac7c-22c6-482a-8ff7-f5cf5963741c",
    "slug": "app-para-control-de-visitas",
    "titulo": "app para control de visitas",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma app para control de visitas con Hausbox.",
    "excerptPagina": "Hausbox simplifica app para control de visitas con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "App Para Control De Visitas | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza app para control de visitas, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20app%20para%20control%20de%20visitas"
  },
  {
    "_id": "ef5d4b3d-ebe9-4fc6-9650-bd8d2c203ac9",
    "slug": "plataforma-para-accesos-residenciales",
    "titulo": "plataforma para accesos residenciales",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma plataforma para accesos residenciales con Hausbox.",
    "excerptPagina": "Hausbox simplifica plataforma para accesos residenciales con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Plataforma Para Accesos Residenciales | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza plataforma para accesos residenciales, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20plataforma%20para%20accesos%20residenciales"
  },
  {
    "_id": "f41577cc-e73f-4780-ad17-4aed11ee29c9",
    "slug": "software-simple-para-condominios",
    "titulo": "software simple para condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma software simple para condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica software simple para condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Software Simple Para Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza software simple para condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20software%20simple%20para%20condominios"
  },
  {
    "_id": "f74d1d59-3b03-44b3-a16c-f4b523c68cc5",
    "slug": "solucion-para-administracion-condominal",
    "titulo": "solución para administración condominal",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma solución para administración condominal con Hausbox.",
    "excerptPagina": "Hausbox simplifica solución para administración condominal con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "Solución Para Administración Condominal | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza solución para administración condominal, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20soluci%C3%B3n%20para%20administraci%C3%B3n%20condominal"
  },
  {
    "_id": "faa096b5-9c0f-4adc-86bb-942659494edd",
    "slug": "app-para-administrar-condominios",
    "titulo": "app para administrar condominios",
    "ciudadOEstado": "",
    "pais": "México",
    "tituloPagina": "Transforma app para administrar condominios con Hausbox.",
    "excerptPagina": "Hausbox simplifica app para administrar condominios con automatización, pagos en línea y control residencial inteligente.",
    "tituloSeo": "App Para Administrar Condominios | Hausbox Software para Condominios",
    "metadescripcionSeo": "Hausbox, el Software para Condominios #1 en México. Optimiza app para administrar condominios, automatiza procesos, mejora la cobranza y digitaliza la administración residencial con una plataforma moderna y eficiente.",
    "whatsappPersonalizado": "https://wa.me/525574374431?text=SW-%20Hola%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20app%20para%20administrar%20condominios"
  }
];

  /* ─── UTILIDADES ─────────────────────────────────────────── */
  function getField(obj) {
    for (var i = 1; i < arguments.length; i++) {
      var k = arguments[i];
      if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') {
        return obj[k];
      }
    }
    return '';
  }

  /**
   * Extrae campos del item del CMS.
   * CRÍTICO: tituloPagina y excerptPagina NO tienen 'title'/'titulo' como fallback,
   * porque en Wix CMS esos corresponden a la keyword, no al título de la landing.
   */
  function extractFields(item) {
    // IMPORTANTE: Wix elimina caracteres acentuados de los nombres de campo internos:
    //   "Titulo página"      → tituloPgina      (la 'á' desaparece)
    //   "Excerpt Página"     → excerptPgina     (la 'á' desaparece)
    //   "Metadescripción SEO"→ metadescripcinSeo (la 'ó' desaparece)
    // Los nombres sin acento (tituloSeo, whatsappPersonalizado) funcionan sin cambios.
    return {
      slug:               getField(item, 'slug', '_id'),
      keyword:            getField(item, 'title', 'titulo', 'Titulo'),
      tituloPagina:       getField(item, 'tituloPgina', 'tituloPagina', 'titulo_pagina'),
      excerptPagina:      getField(item, 'excerptPgina', 'excerptPagina', 'excerpt_pagina'),
      tituloSeo:          getField(item, 'tituloSeo', 'titulo_seo', 'Titulo SEO'),
      metadescripcionSeo: getField(item, 'metadescripcinSeo', 'metadescripcionSeo', 'metadescripcion_seo'),
      whatsapp:           getField(item, 'urlDeWhatsapp', 'urlDeWhatsApp', 'url_de_whatsapp', 'urlwhatsapp', 'urlWhatsApp', 'whatsappPersonalizado', 'whatsapp_personalizado', 'whatsapp'),
      ciudadOEstado:      getField(item, 'ciudadOEstado', 'ciudad_o_estado', 'ciudad'),
    };
  }

  function setAll(selector, fn) {
    var els = document.querySelectorAll(selector);
    for (var i = 0; i < els.length; i++) fn(els[i]);
    return els.length;
  }

  /**
   * Aplica los datos del CMS al DOM.
   */
  function hydrateDOM(f) {
    /* 1. SEO: <title> */
    if (f.tituloSeo) document.title = f.tituloSeo;

    /* 2. SEO: meta description */
    if (f.metadescripcionSeo) {
      var m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute('content', f.metadescripcionSeo);
    }

    /* 3. H1: Titulo página — fade in al recibir el dato del CMS */
    if (f.tituloPagina) {
      setAll('[data-cms="tituloPagina"]', function(el) {
        el.innerHTML = f.tituloPagina;
        el.style.opacity = '1';
      });
      console.log('[HausBox CMS] ✓ tituloPagina →', f.tituloPagina);
    }

    /* 4. Excerpt Página — fade in al recibir el dato del CMS */
    if (f.excerptPagina) {
      setAll('[data-cms="excerptPagina"]', function(el) {
        el.innerHTML = f.excerptPagina;
        el.style.opacity = '1';
      });
      console.log('[HausBox CMS] ✓ excerptPagina →', f.excerptPagina);
    }

    /* 5. Badge */
    var badge = f.ciudadOEstado ? ('📍 ' + f.ciudadOEstado) : '📍 Software #1 en México';
    setAll('[data-cms="badge"]', function(el) { el.innerHTML = badge; });

    /* 6. WhatsApp links — actualiza escritorio y MÓVIL */
    if (f.whatsapp) {
      window.currentLandingWhatsapp = f.whatsapp;
      var n = setAll('a[href*="whatsapp"], a[href*="wa.me"], a.floating-whatsapp, .floating-whatsapp-container a, .mobile-cta-btn, .nav-mobile-cta a', function(el) { 
        el.href = f.whatsapp; 
      });
      console.log('[HausBox CMS] ✓ whatsapp →', f.whatsapp, '(' + n + ' links actualizados en escritorio y móvil)');
    }

    /* 7. Keyword */
    if (f.keyword) setAll('[data-cms="keyword"]', function(el) { el.textContent = f.keyword; });

    /* Globales para formularios */
    window.currentLandingSlug = f.slug;
    window.currentLandingCity = f.ciudadOEstado || f.keyword || 'General';
  }

  function renderSelector(landings, currentSlug) {
    var sel = document.querySelector('[data-cms="city-select"]');
    if (!sel) return;
    var opts = '';
    for (var i = 0; i < landings.length; i++) {
      var l = landings[i];
      if (!l.slug) continue;
      var selected = l.slug === currentSlug ? ' selected' : '';
      var name = l.tituloPagina || l.slug;
      opts += '<option value="' + l.slug + '"' + selected + '>' + name + '</option>';
    }
    sel.innerHTML = opts;
    sel.onchange = function(e) {
      var url = new URL(window.location.href);
      url.searchParams.set('slug', e.target.value);
      window.location.href = url.toString();
    };
  }

  function findInMock(slug) {
    for (var i = 0; i < MOCK.length; i++) {
      if (MOCK[i].slug === slug) return MOCK[i];
    }
    for (var i = 0; i < MOCK.length; i++) {
      if (MOCK[i].slug && MOCK[i].slug.indexOf(slug) > -1) return MOCK[i];
    }
    return null;
  }




  /* ─── LANDING DINÁMICA (ciudad.html?slug=...) ───────────── */
  function initCityLanding() {
    var params     = new URLSearchParams(window.location.search);
    var targetSlug = (params.get('slug') || params.get('c') || params.get('ciudad') || '').toLowerCase().trim();

    if (!targetSlug) {
      console.log('[HausBox CMS] Sin slug en URL, no se hidrata.');
      return;
    }

    var mockItem   = findInMock(targetSlug);
    var apiFailed  = false;

    /* PASO 1: Del mock, aplicar SOLO los datos NO visibles (SEO title, meta, whatsapp).
       tituloPagina y excerptPagina se mantienen ocultos (opacity:0) hasta que llegue
       el dato real del CMS — así nunca hay flash de contenido incorrecto. */
    if (mockItem) {
      var mf = extractFields(mockItem);
      if (mf.tituloSeo)          document.title = mf.tituloSeo;
      if (mf.metadescripcionSeo) {
        var meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', mf.metadescripcionSeo);
      }
      if (mf.whatsapp) {
        setAll('a[href*="whatsapp"], a[href*="wa.me"]', function(el) { el.href = mf.whatsapp; });
      }
    }

    /* PASO 2: Datos REALES del CMS (con el título y excerpt correctos) */
    fetchFromWixREST(targetSlug)
      .then(function(results) {
        if (!results || results.length === 0) {
          console.warn('[HausBox CMS] API no devolvió datos para:', targetSlug, '— usando mock como fallback final.');
          /* Fallback de último recurso: mostrar mock completo si API no tiene el item */
          if (mockItem) hydrateDOM(extractFields(mockItem));
          return;
        }
        var liveFields = extractFields(results[0]);
        hydrateDOM(liveFields);
        console.log('[HausBox CMS] ✅ Datos REALES del CMS aplicados:', liveFields);
      })
      .catch(function(err) {
        console.warn('[HausBox CMS] API REST no disponible, usando mock como fallback.', err.message || err);
        /* Solo si la API falla totalmente, mostrar mock como último recurso */
        if (mockItem) hydrateDOM(extractFields(mockItem));
      });
  }


  /* ─── HUB DE ZONAS (zonas.html) ─────────────────────────── */
  function renderZonesGrid(landings) {
    var container = document.getElementById('zones-grid');
    if (!container) return;

    var countEl = document.getElementById('zones-count');
    if (countEl) countEl.textContent = '📍 ' + landings.length + ' Landings activas';

    function drawCards(list) {
      if (!list.length) {
        container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px"><p>No se encontraron resultados.</p></div>';
        return;
      }
      var html = '';
      for (var i = 0; i < list.length; i++) {
        var f = extractFields(list[i]);
        if (!f.slug) continue;
        html += '<div class="zone-card">'
          + '<div>'
          + '<div style="display:inline-flex;align-items:center;gap:6px;background:#f0f9ff;border:1px solid #bae6fd;padding:6px 12px;border-radius:20px;color:#0284c7;font-size:12px;font-weight:600;margin-bottom:16px">📍 Software #1 en México</div>'
          + '<h3 style="font-size:20px;font-weight:600;color:#0f172a;margin-bottom:12px;line-height:1.4">' + (f.tituloPagina || f.slug) + '</h3>'
          + '<p style="font-size:14px;line-height:1.6;color:#64748b;margin-bottom:20px">' + (f.excerptPagina || '') + '</p>'
          + '</div>'
          + '<a href="ciudad.html?slug=' + encodeURIComponent(f.slug) + '" class="zone-card-link">Ver Landing →</a>'
          + '</div>';
      }
      container.innerHTML = html;
    }

    drawCards(landings);

    var search = document.getElementById('zones-search');
    if (search) {
      search.addEventListener('input', function(e) {
        var q = e.target.value.toLowerCase().trim();
        if (!q) { drawCards(landings); return; }
        var filtered = landings.filter(function(l) {
          var f = extractFields(l);
          return (f.tituloPagina + ' ' + f.excerptPagina + ' ' + f.slug).toLowerCase().indexOf(q) > -1;
        });
        drawCards(filtered);
      });
    }
  }

  function initZonesHub() {
    if (!document.getElementById('zones-grid')) return;

    /* PASO 1: Renderizar inmediatamente con mock */
    renderZonesGrid(MOCK);
    console.log('[HausBox CMS] ⚡ Hub de zonas con datos mock:', MOCK.length, 'landings');

    /* PASO 2: Actualizar con datos reales via REST API de Wix */
    fetchFromWixREST(null)
      .then(function(liveItems) {
        if (!liveItems || liveItems.length === 0) return;
        renderZonesGrid(liveItems);
        console.log('[HausBox CMS] ✅ Hub de zonas actualizado con datos reales del CMS:', liveItems.length, 'items');
      })
      .catch(function(err) {
        console.warn('[HausBox CMS] Hub usando datos mock (REST API no disponible).', err.message || err);
      });
  }

  /* ─── ENVÍO DE FORMULARIOS A FORMSUBMIT.CO ───────────────── */
  window.sendFormToFormSubmit = function(data) {
    var payload = {
      _subject: data.subject || ("Nueva Consulta Web - " + (data.formSource || data.origen || "HausBox")),
      _cc: "test1@dilodigitalmx.com",
      _template: "table",
      _language: "es",
      _captcha: "false",
      "Nombre": data.name || data.nombre || "No especificado",
      "Correo Electrónico": data.email || data.correo || "No especificado",
      "Teléfono": data.phone || data.telefono || "No especificado",
      "Tipo de Propiedad": data.propertyType || data.propiedad || "N/A",
      "Número de Unidades": data.units || data.unidades || "N/A",
      "Ciudad": data.city || data.ciudad || window.currentLandingCity || "N/A",
      "Costo Estimado": data.estimatedCost || data.costo || "N/A",
      "Moneda": data.currency || data.moneda || "MXN",
      "Origen de Formulario": data.formSource || data.origen || ("Landing: " + (window.currentLandingSlug || "Web"))
    };

    fetch("https://formsubmit.co/ajax/contacto@hausbox.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      console.log("[HausBox FormSubmit] ✅ Formulario enviado exitosamente a contacto@hausbox.com y CC test1@dilodigitalmx.com:", res);
    })
    .catch(function(err) {
      console.warn("[HausBox FormSubmit] Error al enviar a FormSubmit:", err);
    });
  };

  /* ─── ENVÍO DE CONSULTAS AL CMS Y FORMSUBMIT ─────────────── */
  window.submitInquiryToWix = function(data) {
    // 1. Enviar siempre copia por FormSubmit.co (contacto@hausbox.com + CC test1@dilodigitalmx.com)
    window.sendFormToFormSubmit(data);

    // 2. Enviar a Wix CMS
    getWixToken()
      .then(function(token) {
        var payload = {
          dataCollectionId: 'ConsultasWeb',
          dataItem: {
            data: {
              nombre:    data.name     || '',
              correo:    data.email    || '',
              telefono:  data.phone    || '',
              propiedad: data.propertyType || '',
              unidades:  data.units ? parseInt(data.units, 10) : 0,
              ciudad:    data.city || window.currentLandingCity || '',
              costo:     data.estimatedCost || '',
              moneda:    data.currency || 'MXN',
              origen:    data.formSource || ('Landing: ' + (window.currentLandingSlug || 'Web'))
            }
          }
        };
        return fetch('https://www.wixapis.com/wix-data/v2/items', {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify(payload)
        });
      })
      .then(function(r) {
        if (!r.ok) throw new Error('Insert error: ' + r.status);
        console.log('[HausBox CMS] ✅ Consulta enviada al CMS de Wix via REST.');
      })
      .catch(function(err) {
        console.warn('[HausBox CMS] Error al enviar consulta:', err);
      });
    return true;
  };

  /* ─── AUTOEJECUTAR ──────────────────────────────────────── */
  function run() {
    var path = window.location.pathname;
    if (path.indexOf('ciudad.html') > -1 || !!new URLSearchParams(window.location.search).get('slug')) {
      initCityLanding();
    }
    if (path.indexOf('zonas.html') > -1 || document.getElementById('zones-grid')) {
      initZonesHub();
    }
    console.log('[HausBox CMS] ✅ Script inicializado.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

})();
