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
      // Wix utiliza nombres de propiedad que coinciden con los Field IDs de la colección
      title: data.name || '',
      Nombre: data.name || '',
      Correo: data.email || '',
      Telefono: data.phone || '',
      Propiedad: data.propertyType || '',
      Unidades: data.units ? parseInt(data.units, 10) : 0,
      Ciudad: data.city || '',
      Costo: data.estimatedCost || '',
      Moneda: data.currency || '',
      Origen: data.formSource || ''
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
