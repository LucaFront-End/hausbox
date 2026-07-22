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

console.log('[Wix Integration] Script Wix Headless inicializado correctamente.');

// Process any queued inquiries that were submitted before this script loaded
if (window.wixInquiryQueue && Array.isArray(window.wixInquiryQueue)) {
  window.wixInquiryQueue.forEach(data => {
    window.submitInquiryToWix(data);
  });
  window.wixInquiryQueue = [];
}
