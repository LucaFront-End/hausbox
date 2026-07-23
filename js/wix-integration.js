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
 * Convierte URIs de Wix Media (wix:image://v1/...) a URLs HTTPS directas de static.wixstatic.com
 */
export function resolveWixImage(wixUri, width = 1200) {
  if (!wixUri) return '';
  if (wixUri.startsWith('http://') || wixUri.startsWith('https://') || wixUri.startsWith('/') || wixUri.startsWith('assets/')) {
    return wixUri;
  }
  if (wixUri.startsWith('wix:image://v1/')) {
    const match = wixUri.match(/wix:image:\/\/v1\/([^/]+)\/(.*?)(?:#|$)/);
    if (match) {
      const uri = match[1];
      const filename = match[2];
      return `https://static.wixstatic.com/media/${uri}/v1/fill/w_${width},q_85/${filename}`;
    }
  }
  return wixUri;
}

/**
 * Base de datos local (fallback) para Landings de Ciudad en caso de desconexión
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
    beneficioHero: 'Diseñado para condominios residenciales y torres corporativas en CDMX',
    whatsappMessage: 'Hola, me interesa información de HausBox para mi condominio en Ciudad de México'
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
    beneficioHero: 'Ideal para cotos y desarrollos residenciales en Zapopan y Guadalajara',
    whatsappMessage: 'Hola, me interesa información de HausBox para mi condominio en Guadalajara'
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
    beneficioHero: 'Potencia la administración en San Pedro, Santa Catarina y Monterrey',
    whatsappMessage: 'Hola, me interesa información de HausBox para mi condominio en Monterrey'
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
    beneficioHero: 'Adaptado a desarrollos de Juriquilla, Zibatá y El Marqués',
    whatsappMessage: 'Hola, me interesa información de HausBox para mi condominio en Querétaro'
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
    beneficioHero: 'Diseñado para clústeres en Angelópolis y zona metropolitana de Puebla',
    whatsappMessage: 'Hola, me interesa información de HausBox para mi condominio en Puebla'
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
    beneficioHero: 'Especializado en desarrollos turísticos y condominios en Riviera Maya',
    whatsappMessage: 'Hola, me interesa información de HausBox para mi condominio en Cancún'
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
    beneficioHero: 'La solución número 1 para cerradas y privadas en Mérida',
    whatsappMessage: 'Hola, me interesa información de HausBox para mi condominio en Mérida'
  }
];

/**
 * Consulta dinámica a la colección 'LandingsdeCiudad' en Wix CMS
 */
export async function fetchLandingsDeCiudad() {
  const collectionNames = ['LandingsdeCiudad', 'LandingsDeCiudad', 'landingsdeciudad', 'Landings_de_Ciudad'];

  for (const col of collectionNames) {
    try {
      const res = await wixClient.items.query(col).find();
      if (res.items && res.items.length > 0) {
        console.log(`[Wix CMS] Colección '${col}' obtenida con ${res.items.length} items.`);
        return res.items.map(item => item.data || item);
      }
    } catch (err) {
      // Probar la siguiente variación de nombre de colección
    }
  }

  console.warn('[Wix CMS] Usando base de datos local (fallback) para LandingsdeCiudad.');
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
      ciudad: data.city || window.currentLandingCity || '',
      costo: data.estimatedCost || '',
      moneda: data.currency || '',
      origen: data.formSource || (window.currentLandingCity ? `Landing Ciudad - ${window.currentLandingCity}` : 'Web Principal')
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
 * Hidrata dinámicamente el DOM con 100% de los campos editables desde el CMS de Wix
 */
export async function initCityLanding() {
  const urlParams = new URLSearchParams(window.location.search);
  const rawSlug = urlParams.get('slug') || urlParams.get('c') || urlParams.get('ciudad') || 'cdmx';
  const targetSlug = rawSlug.toLowerCase().trim();

  const landings = await fetchLandingsDeCiudad();

  // Buscar el item correspondiente por slug, ciudad o título
  const currentLanding = landings.find(l => {
    const s = (l.slug || l.ciudad || l.title || l._id || '').toLowerCase();
    return s === targetSlug || s.includes(targetSlug) || targetSlug.includes(s);
  }) || landings[0];

  if (!currentLanding) return;

  // 1. Actualizar Metas de SEO (Title y Meta Description)
  const titleText = currentLanding.metaTitle || currentLanding.title || currentLanding.titulo || currentLanding.nombre;
  if (titleText) {
    document.title = titleText;
  }

  const descText = currentLanding.metaDescription || currentLanding.meta_description || currentLanding.descripcion;
  if (descText) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', descText);
  }

  // 2. Mapeo Genérico Dinámico de TODOS los campos devueltos por el CMS
  Object.keys(currentLanding).forEach(key => {
    const val = currentLanding[key];
    if (!val) return;

    // Buscar elementos marcados con data-cms="key" (ej. data-cms="badge", data-cms="heroTitle", etc.)
    const targets = document.querySelectorAll(`[data-cms="${key}"]`);
    targets.forEach(target => {
      if (target.tagName === 'IMG') {
        target.src = resolveWixImage(val);
      } else if (target.tagName === 'A' && target.hasAttribute('href') && typeof val === 'string' && val.startsWith('http')) {
        target.href = val;
      } else {
        target.innerHTML = val;
      }
    });
  });

  // 3. Mapeos específicos de respaldo para alias comunes de campos
  const cityBadge = document.querySelector('[data-cms="city-badge"]');
  if (cityBadge && (currentLanding.badge || currentLanding.insignia)) {
    cityBadge.innerHTML = currentLanding.badge || currentLanding.insignia;
  }

  const heroTitle = document.querySelector('[data-cms="hero-title"]');
  if (heroTitle && (currentLanding.heroTitle || currentLanding.tituloHero || currentLanding.titulo_hero)) {
    heroTitle.innerHTML = currentLanding.heroTitle || currentLanding.tituloHero || currentLanding.titulo_hero;
  }

  const heroSubtitle = document.querySelector('[data-cms="hero-subtitle"]');
  if (heroSubtitle && (currentLanding.heroSubtitle || currentLanding.subtituloHero || currentLanding.subtitulo_hero)) {
    heroSubtitle.innerHTML = currentLanding.heroSubtitle || currentLanding.subtituloHero || currentLanding.subtitulo_hero;
  }

  const heroImage = document.querySelector('[data-cms="hero-image"]');
  if (heroImage && (currentLanding.heroImage || currentLanding.imagenHero || currentLanding.imagen)) {
    heroImage.src = resolveWixImage(currentLanding.heroImage || currentLanding.imagenHero || currentLanding.imagen);
  }

  // 4. Rellenar referencias globales al nombre de la ciudad
  const cityNameText = currentLanding.ciudad || currentLanding.title || currentLanding.nombre || 'tu ciudad';
  const cityNames = document.querySelectorAll('[data-cms="city-name"]');
  cityNames.forEach(el => {
    el.textContent = cityNameText;
  });

  // 5. Renderizado 100% dinámico del Selector de Ciudades (Refleja altas, bajas y cambios en el CMS)
  const citySelect = document.querySelector('[data-cms="city-select"]');
  if (citySelect) {
    citySelect.innerHTML = landings.map(l => {
      const lSlug = l.slug || l._id || l.ciudad;
      const lName = l.ciudad || l.title || l.nombre;
      const isSelected = (lSlug.toLowerCase() === (currentLanding.slug || '').toLowerCase());
      return `<option value="${lSlug}" ${isSelected ? 'selected' : ''}>${lName}</option>`;
    }).join('');

    citySelect.onchange = (e) => {
      window.location.search = `?slug=${e.target.value}`;
    };
  }

  // 6. WhatsApp enlace y mensaje dinámico
  const waMessage = currentLanding.whatsappMessage || currentLanding.mensajeWhatsapp || `Hola, me interesa información de HausBox para condominios en ${cityNameText}`;
  const encodedMsg = encodeURIComponent(waMessage);
  const waUrl = `https://api.whatsapp.com/send/?phone=5215574374431&text=${encodedMsg}&type=phone_number&app_absent=0`;

  const waLinks = document.querySelectorAll('a[href*="whatsapp.com"], [data-cms="whatsapp-link"]');
  waLinks.forEach(link => {
    link.href = waUrl;
  });

  // 7. Configurar variable global de ciudad actual para los formularios de leads
  window.currentLandingCity = cityNameText;
  console.log('[Wix CMS] Landing hidratada 100% dinámicamente desde el CMS para:', window.currentLandingCity);
}

// Asignaciones globales
window.getLandingsDeCiudad = fetchLandingsDeCiudad;
window.initCityLanding = initCityLanding;
window.resolveWixImage = resolveWixImage;

console.log('[Wix Integration] Script Wix Headless inicializado correctamente.');

// Procesar cola de consultas pendientes
if (window.wixInquiryQueue && Array.isArray(window.wixInquiryQueue)) {
  window.wixInquiryQueue.forEach(data => {
    window.submitInquiryToWix(data);
  });
  window.wixInquiryQueue = [];
}

// Autoejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('ciudad.html') || document.querySelector('[data-cms]')) {
    initCityLanding();
  }
});
