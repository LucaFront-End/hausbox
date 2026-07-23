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
 * Convierte URIs de Wix Media (wix:image://v1/...) a URLs HTTPS directas
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
 * Base de datos local (fallback) para Landings de Ciudad con todos los campos mapeados
 */
export const mockLandingsDeCiudad = [
  {
    _id: 'cdmx',
    slug: 'cdmx',
    ciudad: 'Ciudad de México',
    title: 'Transforma la administración de tu condominio en <span class="serif">CDMX.</span>',
    excerpt: 'La solución líder en Ciudad de México para automatizar cobranza, generar accesos QR instantáneos y llevar contabilidad transparente sin complicaciones.',
    badge: '📍 Cobertura Activa · CDMX',
    image: 'assets/images/hero-bg-app.png',
    metaTitle: 'Software para Condominios en CDMX | HausBox #1',
    metaDescription: 'La plataforma #1 para administración de condominios, edificios y privadas en Ciudad de México (CDMX). Cobranza, SPEI, accesos QR y contabilidad.',
    content: 'Proveedores, facturas, adeudos y gastos organizados. Administra pagos de forma ágil y profesional en la Ciudad de México.',
    beneficio1: 'Todo el control. <br />En un solo <span class="serif">lugar.</span>',
    beneficio2: 'Tu condominio <br />en tu <span class="serif">mano.</span>',
    beneficio3: 'Cobra a tiempo en CDMX. <br />Sin <span class="serif">complicaciones.</span>',
    whatsappMessage: 'Hola, me interesa información de HausBox para mi condominio en Ciudad de México'
  },
  {
    _id: 'guadalajara',
    slug: 'guadalajara',
    ciudad: 'Guadalajara',
    title: 'Administración inteligente de cotos y condominios en <span class="serif">Guadalajara.</span>',
    excerpt: 'Simplifica la gestión de cuotas de mantenimiento, concilia bancos al instante y mantén informados a todos tus residentes en la ZMG.',
    badge: '📍 Cobertura Activa · Guadalajara',
    image: 'assets/images/hero-bg-app.png',
    metaTitle: 'Software para Condominios en Guadalajara | HausBox #1',
    metaDescription: 'Administra tu condominio o coto residencial en Guadalajara con HausBox. Automatiza pagos, cuotas de mantenimiento y reservas de amenidades.',
    content: 'Gestión especializada para cotos residenciales y desarrollos habitacionales en Zapopan y la Zona Metropolitana de Guadalajara.',
    beneficio1: 'Control total de cotos <br />y <span class="serif">fraccionamientos.</span>',
    beneficio2: 'App para residentes <br />en <span class="serif">Guadalajara.</span>',
    beneficio3: 'Cobranza automática SPEI <br />en <span class="serif">Jalisco.</span>',
    whatsappMessage: 'Hola, me interesa información de HausBox para mi condominio en Guadalajara'
  },
  {
    _id: 'monterrey',
    slug: 'monterrey',
    ciudad: 'Monterrey',
    title: 'La plataforma de gestión condominal preferida en <span class="serif">Monterrey.</span>',
    excerpt: 'Optimiza la operación de torres residenciales y fraccionamientos en la zona metropolitana de Monterrey con tecnología de vanguardia.',
    badge: '📍 Cobertura Activa · Monterrey',
    image: 'assets/images/hero-bg-app.png',
    metaTitle: 'Software para Condominios en Monterrey | HausBox #1',
    metaDescription: 'Plataforma de gestión condominal en Monterrey y San Pedro Garza García. Control de accesos, cobranza automática y reportes financieros.',
    content: 'Tecnología de alto rendimiento para torres de departamentos y residenciales en San Pedro Garza García y Monterrey.',
    beneficio1: 'Gestión financiera <br />de alto <span class="serif">nivel.</span>',
    beneficio2: 'Accesos QR <br />para torres en <span class="serif">Monterrey.</span>',
    beneficio3: 'Cobranza inteligente <br />en <span class="serif">Nuevo León.</span>',
    whatsappMessage: 'Hola, me interesa información de HausBox para mi condominio en Monterrey'
  },
  {
    _id: 'queretaro',
    slug: 'queretaro',
    ciudad: 'Querétaro',
    title: 'Gestión condominal eficiente y transparente en <span class="serif">Querétaro.</span>',
    excerpt: 'Controla el flujo de caja, automatiza recordatorios de pago y brinda acceso rápido por QR a tus residentes en Querétaro.',
    badge: '📍 Cobertura Activa · Querétaro',
    image: 'assets/images/hero-bg-app.png',
    metaTitle: 'Software para Condominios en Querétaro | HausBox #1',
    metaDescription: 'Gestión moderna de fraccionamientos y condominios en Querétaro. Cobranza inteligente, reservas de amenidades y avisos push.',
    content: 'Solución integral adaptada a desarrollos residenciales en Juriquilla, Zibatá, El Marqués y zona metropolitana de Querétaro.',
    beneficio1: 'Transparencia total <br />en tus <span class="serif">finanzas.</span>',
    beneficio2: 'Reservas de amenidades <br />en <span class="serif">Querétaro.</span>',
    beneficio3: 'Reducción de morosidad <br />en <span class="serif">fraccionamientos.</span>',
    whatsappMessage: 'Hola, me interesa información de HausBox para mi condominio en Querétaro'
  },
  {
    _id: 'puebla',
    slug: 'puebla',
    ciudad: 'Puebla',
    title: 'Digitaliza la administración de tu condominio en <span class="serif">Puebla.</span>',
    excerpt: 'Ofrece a tus residentes la app más intuitiva para pagar mantenimientos, reservar amenidades y recibir comunicados oficiales.',
    badge: '📍 Cobertura Activa · Puebla',
    image: 'assets/images/hero-bg-app.png',
    metaTitle: 'Software para Condominios en Puebla | HausBox #1',
    metaDescription: 'Software de administración de condominios en Puebla y Angelópolis. Reducción de morosidad, pagos SPEI y reportes contables.',
    content: 'Plataforma líder para clústeres residenciales y edificios en Angelópolis, Lomas de Angelópolis y Puebla.',
    beneficio1: 'Control absoluto <br />para tu <span class="serif">clúster.</span>',
    beneficio2: 'Comunicación oficial <br />en <span class="serif">Puebla.</span>',
    beneficio3: 'Reportes financieros <br />al <span class="serif">instante.</span>',
    whatsappMessage: 'Hola, me interesa información de HausBox para mi condominio en Puebla'
  },
  {
    _id: 'cancun',
    slug: 'cancun',
    ciudad: 'Cancún',
    title: 'Gestión de condominios y residenciales en <span class="serif">Cancún.</span>',
    excerpt: 'La herramienta perfecta para administradores y complejos vacacionales en Cancún. Control de accesos QR y cobranza en USD y MXN.',
    badge: '📍 Cobertura Activa · Cancún',
    image: 'assets/images/hero-bg-app.png',
    metaTitle: 'Software para Condominios y Rentas Vacacionales en Cancún | HausBox',
    metaDescription: 'Administración de residenciales y rentas vacacionales en Cancún y Riviera Maya. Control de amenidades, pagos y comunicación.',
    content: 'Plataforma especializada en administración de residenciales de lujo y desarrollos en Cancún y Riviera Maya.',
    beneficio1: 'Gestión multimoneda <br />en <span class="serif">MXN y USD.</span>',
    beneficio2: 'Accesos QR rápidos <br />para <span class="serif">visitas.</span>',
    beneficio3: 'Cobranza transparente <br />en la <span class="serif">Riviera Maya.</span>',
    whatsappMessage: 'Hola, me interesa información de HausBox para mi condominio en Cancún'
  },
  {
    _id: 'merida',
    slug: 'merida',
    ciudad: 'Mérida',
    title: 'Administra tus privadas residenciales en <span class="serif">Mérida.</span>',
    excerpt: 'Transforma la vivencia en comunidad con cobranza automatizada, accesos seguros y contabilidad al día en Yucatán.',
    badge: '📍 Cobertura Activa · Mérida',
    image: 'assets/images/hero-bg-app.png',
    metaTitle: 'Software para Condominios y Privadas en Mérida | HausBox #1',
    metaDescription: 'Plataforma para administración de privadas y condominios en Mérida. Pagos en línea, control de visitas e informes financieros.',
    content: 'La solución número 1 para privadas residenciales y cotos cerrados en Mérida y el estado de Yucatán.',
    beneficio1: 'Organización simple <br />para tus <span class="serif">privadas.</span>',
    beneficio2: 'Pagos SPEI <br />y tarjeta en <span class="serif">Mérida.</span>',
    beneficio3: 'Tranquilidad total <br />en <span class="serif">comunidad.</span>',
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
 * Hidrata dinámicamente el DOM con 100% de los campos del CMS de Wix (title, excerpt, badge, content, image, metaTitle, metaDescription, beneficios)
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

  // Helper para resolver valor probando múltiples alias de campo
  const getValue = (...keys) => {
    for (const key of keys) {
      if (currentLanding[key] !== undefined && currentLanding[key] !== null && currentLanding[key] !== '') {
        return currentLanding[key];
      }
    }
    return '';
  };

  // 1. Actualizar Metas de SEO (Title y Meta Description)
  const metaTitleVal = getValue('metaTitle', 'meta_title', 'seoTitle', 'seo_title', 'title', 'titulo', 'nombre');
  if (metaTitleVal) {
    document.title = metaTitleVal;
  }

  const metaDescVal = getValue('metaDescription', 'meta_description', 'seoDescription', 'seo_description', 'excerpt', 'extracto', 'descripcion');
  if (metaDescVal) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', metaDescVal);
  }

  // 2. Mapeo Genérico Dinámico de TODOS los campos devueltos por el CMS
  Object.keys(currentLanding).forEach(key => {
    const val = currentLanding[key];
    if (!val) return;

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

  // 3. Mapeo explícito para Title, Excerpt, Badge, Image, Content, Beneficios
  const titleVal = getValue('title', 'titulo', 'heroTitle', 'tituloHero', 'nombre', 'h1');
  if (titleVal) {
    const titleElements = document.querySelectorAll('[data-cms="title"], [data-cms="hero-title"], [data-cms="titulo"]');
    titleElements.forEach(el => el.innerHTML = titleVal);
  }

  const excerptVal = getValue('excerpt', 'extracto', 'resumen', 'heroSubtitle', 'subtituloHero', 'subtitulo');
  if (excerptVal) {
    const excerptElements = document.querySelectorAll('[data-cms="excerpt"], [data-cms="hero-subtitle"], [data-cms="extracto"], [data-cms="resumen"]');
    excerptElements.forEach(el => el.innerHTML = excerptVal);
  }

  const badgeVal = getValue('badge', 'insignia', 'cityBadge', 'etiqueta');
  if (badgeVal) {
    const badgeElements = document.querySelectorAll('[data-cms="badge"], [data-cms="insignia"], [data-cms="city-badge"]');
    badgeElements.forEach(el => el.innerHTML = badgeVal);
  }

  const imageVal = getValue('image', 'imagen', 'heroImage', 'imagenHero', 'photo', 'foto');
  if (imageVal) {
    const imageElements = document.querySelectorAll('[data-cms="image"], [data-cms="imagen"], [data-cms="hero-image"]');
    imageElements.forEach(el => {
      if (el.tagName === 'IMG') el.src = resolveWixImage(imageVal);
    });
  }

  const contentVal = getValue('content', 'contenido', 'descripcion', 'body', 'texto');
  if (contentVal) {
    const contentElements = document.querySelectorAll('[data-cms="content"], [data-cms="contenido"], [data-cms="descripcion"]');
    contentElements.forEach(el => el.innerHTML = contentVal);
  }

  const ben1 = getValue('beneficio1', 'beneficio_1', 'feature1');
  if (ben1) {
    const el1 = document.querySelector('[data-cms="beneficio1"]');
    if (el1) el1.innerHTML = ben1;
  }

  const ben2 = getValue('beneficio2', 'beneficio_2', 'feature2');
  if (ben2) {
    const el2 = document.querySelector('[data-cms="beneficio2"]');
    if (el2) el2.innerHTML = ben2;
  }

  const ben3 = getValue('beneficio3', 'beneficio_3', 'feature3');
  if (ben3) {
    const el3 = document.querySelector('[data-cms="beneficio3"]');
    if (el3) el3.innerHTML = ben3;
  }

  // 4. Rellenar referencias globales al nombre de la ciudad
  const cityNameText = getValue('ciudad', 'title', 'nombre', 'ciudadName') || 'tu ciudad';
  const cityNames = document.querySelectorAll('[data-cms="city-name"]');
  cityNames.forEach(el => {
    el.textContent = cityNameText;
  });

  // 5. Renderizado 100% dinámico del Selector de Ciudades
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
  const waMessage = getValue('whatsappMessage', 'mensajeWhatsapp', 'whatsappText') || `Hola, me interesa información de HausBox para condominios en ${cityNameText}`;
  const encodedMsg = encodeURIComponent(waMessage);
  const waUrl = `https://api.whatsapp.com/send/?phone=5215574374431&text=${encodedMsg}&type=phone_number&app_absent=0`;

  const waLinks = document.querySelectorAll('a[href*="whatsapp.com"], [data-cms="whatsapp-link"]');
  waLinks.forEach(link => {
    link.href = waUrl;
  });

  // 7. Configurar variable global de ciudad actual para los formularios de leads
  window.currentLandingCity = cityNameText;
  console.log('[Wix CMS] Landing hidratada 100% dinámicamente con todos los campos mapeados para:', window.currentLandingCity);
}

/**
 * Renderiza dinámicamente el Hub de Zonas (zonas.html)
 */
export async function renderZonesHub() {
  const container = document.getElementById('zones-grid') || document.querySelector('[data-cms="cities-grid"]');
  if (!container) return;

  const countBadge = document.getElementById('zones-count') || document.querySelector('[data-cms="zones-count"]');
  const searchInput = document.getElementById('zones-search') || document.querySelector('[data-cms="zones-search"]');

  const landings = await fetchLandingsDeCiudad();

  if (countBadge) {
    countBadge.textContent = `📍 ${landings.length} Zonas activas`;
  }

  function drawCards(itemsToDraw) {
    if (itemsToDraw.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#64748b">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px;height:48px;margin:0 auto 16px;opacity:0.5"><circle cx="12" cy="12" r="10"/><path d="m21 21-4.3-4.3"/></svg>
          <h3 style="font-size:18px;font-weight:600;color:#0f172a;margin-bottom:8px">No se encontraron ciudades</h3>
          <p style="font-size:14px">Intenta buscar con otro término de búsqueda.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = itemsToDraw.map(l => {
      const slug = l.slug || l._id || l.ciudad;
      const cName = l.ciudad || l.title || l.nombre || 'Ciudad';
      const cBadge = l.badge || l.insignia || '📍 Cobertura Activa';
      const cDesc = l.excerpt || l.extracto || l.metaDescription || l.heroSubtitle || l.subtituloHero || `Software #1 para administración de condominios y privadas en ${cName}.`;
      const cFeature = l.beneficioHero || l.content || 'Cobranza SPEI · Accesos QR · Amenidades';

      return `
        <div class="zone-card" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:32px;display:flex;flex-direction:column;justify-content:space-between;transition:transform 0.25s ease, shadow 0.25s ease, border-color 0.25s ease;box-shadow:0 4px 20px rgba(0,0,0,0.03)" onmouseover="this.style.transform='translateY(-6px)';this.style.borderColor='#0DA3E2';this.style.boxShadow='0 12px 30px rgba(13,163,226,0.12)'" onmouseout="this.style.transform='none';this.style.borderColor='#e2e8f0';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.03)'">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:#f0f9ff;border:1px solid #bae6fd;padding:6px 12px;border-radius:20px;color:#0284c7;font-size:12px;font-weight:600;margin-bottom:16px">
              ${cBadge}
            </div>
            <h3 style="font-size:22px;font-weight:600;color:#0f172a;margin-bottom:12px">${cName}</h3>
            <p style="font-size:14px;line-height:1.6;color:#64748b;margin-bottom:20px">${cDesc}</p>
          </div>
          <div>
            <div style="font-size:12px;font-weight:500;color:#0DA3E2;margin-bottom:20px;display:flex;align-items:center;gap:6px">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><polyline points="20 6 9 17 4 12"/></svg>
              <span>${cFeature}</span>
            </div>
            <a href="ciudad.html?slug=${encodeURIComponent(slug)}" class="btn-secondary-hero" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px 20px;border-radius:12px;background:#0f172a;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;transition:background 0.2s ease" onmouseover="this.style.background='#0DA3E2'" onmouseout="this.style.background='#0f172a'">
              <span>Explorar ${cName}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  drawCards(landings);

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = landings.filter(l => {
        const text = `${l.ciudad} ${l.title} ${l.excerpt} ${l.metaDescription} ${l.slug}`.toLowerCase();
        return text.includes(q);
      });
      drawCards(filtered);
    });
  }
}

// Asignaciones globales
window.getLandingsDeCiudad = fetchLandingsDeCiudad;
window.initCityLanding = initCityLanding;
window.renderZonesHub = renderZonesHub;
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
  if (window.location.pathname.includes('zonas.html') || document.getElementById('zones-grid')) {
    renderZonesHub();
  }
});
