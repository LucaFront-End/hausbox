import { createClient, OAuthStrategy } from 'https://esm.sh/@wix/sdk';
import { items } from 'https://esm.sh/@wix/data';

// Inicialización del cliente Headless de Wix
const wixClient = createClient({
  modules: { items },
  auth: OAuthStrategy({
    clientId: 'ad0088f3-624d-4205-aec9-590fd15e74dd'
  })
});

/**
 * Base de datos local (fallback) para Landings de Ciudad
 */
export const mockLandingsDeCiudad = [
  {
    _id: 'cdmx',
    slug: 'cdmx',
    ciudad: 'Ciudad de México',
    title: 'Software para Condominios en Ciudad de México | HausBox',
    metaTitle: 'Software para Condominios en CDMX | HausBox #1',
    metaDescription: 'La plataforma #1 para administración de condominios, edificios y privadas en Ciudad de México (CDMX). Cobranza, SPEI, accesos QR y contabilidad.',
    badge: '📍 Software #1 en Ciudad de México',
    heroTitle: 'Transforma la administración de tu condominio en <span class="serif">CDMX.</span>',
    heroSubtitle: 'La solución líder en Ciudad de México para automatizar cobranza, generar accesos QR instantáneos y llevar contabilidad transparente sin complicaciones.',
    beneficioHero: 'Diseñado para condominios residenciales y torres corporativas en CDMX'
  },
  {
    _id: 'guadalajara',
    slug: 'guadalajara',
    ciudad: 'Guadalajara',
    title: 'Software para Condominios en Guadalajara | HausBox',
    metaTitle: 'Software para Condominios en Guadalajara | HausBox #1',
    metaDescription: 'Administra tu condominio o coto residencial en Guadalajara con HausBox. Automatiza pagos, cuotas de mantenimiento y reservas de amenidades.',
    badge: '📍 Software #1 en Guadalajara',
    heroTitle: 'Administración inteligente de cotos y condominios en <span class="serif">Guadalajara.</span>',
    heroSubtitle: 'Simplifica la gestión de cuotas de mantenimiento, concilia bancos al instante y mantén informados a todos tus residentes en la ZMG.',
    beneficioHero: 'Ideal para cotos y desarrollos residenciales en Zapopan y Guadalajara'
  },
  {
    _id: 'monterrey',
    slug: 'monterrey',
    ciudad: 'Monterrey',
    title: 'Software para Condominios en Monterrey | HausBox',
    metaTitle: 'Software para Condominios en Monterrey | HausBox #1',
    metaDescription: 'Plataforma de gestión condominal en Monterrey y San Pedro Garza García. Control de accesos, cobranza automática y reportes financieros.',
    badge: '📍 Software #1 en Monterrey',
    heroTitle: 'La plataforma de gestión condominal preferida en <span class="serif">Monterrey.</span>',
    heroSubtitle: 'Optimiza la operación de torres residenciales y fraccionamientos en la zona metropolitana de Monterrey con tecnología de vanguardia.',
    beneficioHero: 'Potencia la administración en San Pedro, Santa Catarina y Monterrey'
  },
  {
    _id: 'queretaro',
    slug: 'queretaro',
    ciudad: 'Querétaro',
    title: 'Software para Condominios en Querétaro | HausBox',
    metaTitle: 'Software para Condominios en Querétaro | HausBox #1',
    metaDescription: 'Gestión moderna de fraccionamientos y condominios en Querétaro. Cobranza inteligente, reservas de amenidades y avisos push.',
    badge: '📍 Software #1 en Querétaro',
    heroTitle: 'Gestión condominal eficiente y transparente en <span class="serif">Querétaro.</span>',
    heroSubtitle: 'Controla el flujo de caja, automatiza recordatorios de pago y brinda acceso rápido por QR a tus residentes en Querétaro.',
    beneficioHero: 'Adaptado a desarrollos de Juriquilla, Zibatá y El Marqués'
  },
  {
    _id: 'puebla',
    slug: 'puebla',
    ciudad: 'Puebla',
    title: 'Software para Condominios en Puebla | HausBox',
    metaTitle: 'Software para Condominios en Puebla | HausBox #1',
    metaDescription: 'Software de administración de condominios en Puebla y Angelópolis. Reducción de morosidad, pagos SPEI y reportes contables.',
    badge: '📍 Software #1 en Puebla',
    heroTitle: 'Digitaliza la administración de tu condominio en <span class="serif">Puebla.</span>',
    heroSubtitle: 'Ofrece a tus residentes la app más intuitiva para pagar mantenimientos, reservar amenidades y recibir comunicados oficiales.',
    beneficioHero: 'Diseñado para clústeres en Angelópolis y zona metropolitana de Puebla'
  },
  {
    _id: 'cancun',
    slug: 'cancun',
    ciudad: 'Cancún',
    title: 'Software para Condominios y Rentas en Cancún | HausBox',
    metaTitle: 'Software para Condominios y Rentas Vacacionales en Cancún | HausBox',
    metaDescription: 'Administración de residenciales y rentas vacacionales en Cancún y Riviera Maya. Control de amenidades, pagos y comunicación.',
    badge: '📍 Software #1 en Cancún y Riviera Maya',
    heroTitle: 'Gestión de condominios y residenciales en <span class="serif">Cancún.</span>',
    heroSubtitle: 'La herramienta perfecta para administradores y complejos vacacionales en Cancún. Control de accesos QR y cobranza en USD y MXN.',
    beneficioHero: 'Especializado en desarrollos turísticos y condominios en Riviera Maya'
  },
  {
    _id: 'merida',
    slug: 'merida',
    ciudad: 'Mérida',
    title: 'Software para Condominios en Mérida | HausBox',
    metaTitle: 'Software para Condominios y Privadas en Mérida | HausBox #1',
    metaDescription: 'Plataforma para administración de privadas y condominios en Mérida. Pagos en línea, control de visitas e informes financieros.',
    badge: '📍 Software #1 en Mérida',
    heroTitle: 'Administra tus privadas residenciales en <span class="serif">Mérida.</span>',
    heroSubtitle: 'Transforma la vivencia en comunidad con cobranza automatizada, accesos seguros y contabilidad al día en Yucatán.',
    beneficioHero: 'La solución número 1 para cerradas y privadas en Mérida'
  }
];

/**
 * Consulta la colección 'LandingsdeCiudad' en Wix CMS
 */
export async function fetchLandingsDeCiudad() {
  try {
    const res = await wixClient.items.query('LandingsdeCiudad').find();
    if (res.items && res.items.length > 0) {
      console.log('[Wix CMS] LandingsdeCiudad obtenidas exitosamente del CMS:', res.items.length);
      return res.items.map(item => item.data || item);
    }
  } catch (err) {
    console.warn('[Wix CMS] Fallback en LandingsdeCiudad, probando colección alternativa...', err);
  }

  try {
    const res = await wixClient.items.query('LandingsDeCiudad').find();
    if (res.items && res.items.length > 0) {
      return res.items.map(item => item.data || item);
    }
  } catch (err) {
    console.warn('[Wix CMS] Usando base de datos local (fallback) para LandingsdeCiudad.');
  }

  return mockLandingsDeCiudad;
}

/**
 * Envía la consulta capturada al CMS de Wix
 */
window.submitInquiryToWix = async function(data) {
  try {
    const payload = {
      title: data.name || '',
      nombre: data.name || '',
      correo: data.email || '',
      telefono: data.phone || '',
      propiedad: data.propertyType || '',
      unidades: data.units ? parseInt(data.units, 10) : 0,
      ciudad: data.city || '',
      costo: data.estimatedCost || '',
      moneda: data.currency || '',
      origen: data.formSource || ''
    };

    await wixClient.items.insert('ConsultasWeb', payload);
    console.log('[Wix Integration] Consulta enviada exitosamente al CMS:', payload);
    return true;
  } catch (error) {
    console.error('[Wix Integration] Error al insertar consulta en el CMS de Wix:', error);
    return false;
  }
};

/**
 * Hidrata dinámicamente la página de inicio/ciudad con datos del CMS
 */
export async function initCityLanding() {
  const urlParams = new URLSearchParams(window.location.search);
  const rawSlug = urlParams.get('slug') || urlParams.get('c') || urlParams.get('ciudad') || 'cdmx';
  const targetSlug = rawSlug.toLowerCase().trim();

  const landings = await fetchLandingsDeCiudad();
  const currentLanding = landings.find(l => {
    const s = (l.slug || l.ciudad || l.title || '').toLowerCase();
    return s.includes(targetSlug) || targetSlug.includes(s);
  }) || landings[0];

  if (!currentLanding) return;

  // 1. Actualizar Metas de SEO
  const titleTag = document.querySelector('title');
  if (titleTag && (currentLanding.metaTitle || currentLanding.title)) {
    titleTag.textContent = currentLanding.metaTitle || currentLanding.title;
  }

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && currentLanding.metaDescription) {
    metaDesc.setAttribute('content', currentLanding.metaDescription);
  }

  // 2. Elementos marcados con data-cms
  const cityBadge = document.querySelector('[data-cms="city-badge"]');
  if (cityBadge && currentLanding.badge) {
    cityBadge.innerHTML = currentLanding.badge;
  }

  const heroTitle = document.querySelector('[data-cms="hero-title"]');
  if (heroTitle && (currentLanding.heroTitle || currentLanding.tituloHero)) {
    heroTitle.innerHTML = currentLanding.heroTitle || currentLanding.tituloHero;
  }

  const heroSubtitle = document.querySelector('[data-cms="hero-subtitle"]');
  if (heroSubtitle && (currentLanding.heroSubtitle || currentLanding.subtituloHero)) {
    heroSubtitle.innerHTML = currentLanding.heroSubtitle || currentLanding.subtituloHero;
  }

  const heroImage = document.querySelector('[data-cms="hero-image"]');
  if (heroImage && (currentLanding.heroImage || currentLanding.imagenHero)) {
    heroImage.src = currentLanding.heroImage || currentLanding.imagenHero;
  }

  // 3. Rellenar nombres de ciudad en textos generales
  const cityNames = document.querySelectorAll('[data-cms="city-name"]');
  cityNames.forEach(el => {
    el.textContent = currentLanding.ciudad || currentLanding.title || 'tu ciudad';
  });

  // 4. Selector de Ciudad dinámico
  const citySelect = document.querySelector('[data-cms="city-select"]');
  if (citySelect) {
    citySelect.innerHTML = landings.map(l => `
      <option value="${l.slug || l._id}" ${ (l.slug === currentLanding.slug) ? 'selected' : '' }>
        ${l.ciudad || l.title}
      </option>
    `).join('');

    citySelect.addEventListener('change', (e) => {
      window.location.search = `?slug=${e.target.value}`;
    });
  }

  // 5. Configurar origen dinámico en formularios
  window.currentLandingCity = currentLanding.ciudad || currentLanding.title || 'General';
  console.log('[Wix CMS] Landing hidratada dinámicamente para:', window.currentLandingCity);
}

// Asignaciones globales
window.getLandingsDeCiudad = fetchLandingsDeCiudad;
window.initCityLanding = initCityLanding;

console.log('[Wix Integration] Script Wix Headless inicializado correctamente.');

// Process any queued inquiries that were submitted before this script loaded
if (window.wixInquiryQueue && Array.isArray(window.wixInquiryQueue)) {
  window.wixInquiryQueue.forEach(data => {
    window.submitInquiryToWix(data);
  });
  window.wixInquiryQueue = [];
}

// Autoejecutar si estamos en ciudad.html o si existe data-cms en la página
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('ciudad.html') || document.querySelector('[data-cms]')) {
    initCityLanding();
  }
});
