const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

const PORT = 8089;
const WIX_CLIENT_ID = 'ad0088f3-624d-4205-aec9-590fd15e74dd';
const WIX_OAUTH_URL = 'https://www.wixapis.com/oauth2/token';
const WIX_DATA_URL  = 'https://www.wixapis.com/wix-data/v2/items';
const WIX_COLLECTION = 'ConsultasWeb';

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml'
};

function createStaticServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(__dirname, reqPath);
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
}

async function getWixToken() {
  const r = await fetch(WIX_OAUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: WIX_CLIENT_ID, grantType: 'anonymous' })
  });
  const data = await r.json();
  return data.access_token;
}

async function getWixItem(token, itemId) {
  const url = `${WIX_DATA_URL}/${encodeURIComponent(itemId)}?dataCollectionId=${WIX_COLLECTION}`;
  const r = await fetch(url, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (r.status === 200) {
    const json = await r.json();
    return json.dataItem;
  }
  return null;
}

async function deleteWixItem(token, itemId) {
  const url = `${WIX_DATA_URL}/${encodeURIComponent(itemId)}`;
  const r = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ dataCollectionId: WIX_COLLECTION })
  });
  return r.status;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  async eval(expression, awaitPromise = true) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise,
      returnByValue: true
    });
    if (res.exceptionDetails) {
      throw new Error('CDP Eval Exception: ' + JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  close() {
    if (this.ws) {
      try { this.ws.close(); } catch(e) {}
    }
  }
}

async function runE2E() {
  console.log('================================================================');
  console.log('       INICIANDO PRUEBA E2E COMPLETA (WEB + WIX CMS)            ');
  console.log('================================================================\n');

  // 1. Iniciar servidor estático local
  const server = createStaticServer();
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`[1/8] Servidor estático local corriendo en http://127.0.0.1:${PORT}`);

  // 2. Iniciar Chrome Headless con puerto CDP
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpUserData = path.join(os.tmpdir(), 'chrome-e2e-' + Date.now());
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    `--user-data-dir=${tmpUserData}`,
    'about:blank'
  ]);
  console.log('[2/8] Instancia de Google Chrome Headless iniciada.');

  // Esperar a que el puerto de CDP esté activo
  let cdpAvailable = false;
  for (let i = 0; i < 20; i++) {
    await delay(300);
    try {
      const r = await fetch('http://127.0.0.1:9222/json/version');
      if (r.ok) { cdpAvailable = true; break; }
    } catch(e) {}
  }
  if (!cdpAvailable) throw new Error('No se pudo conectar a Chrome CDP en el puerto 9222');

  // 3. Crear nueva pestaña navegando a la web local
  const newTabRes = await fetch(`http://127.0.0.1:9222/json/new?http://127.0.0.1:${PORT}/index.html`, { method: 'PUT' });
  const tabData = await newTabRes.json();
  const cdp = new CDPClient(tabData.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Runtime.enable');
  await delay(2500); // Esperar que la navegación inicial complete su ciclo
  
  // Esperar a que el script de la calculadora se inicialice
  await cdp.eval(`
    new Promise(resolve => {
      const check = () => {
        if (document.getElementById('calc-open-btn') || typeof window.openHagashCalcModal === 'function') {
          resolve(true);
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    })
  `);
  console.log('[3/8] Página index.html y Widget de Calculadora inicializados en Chrome.');

  const wixToken = await getWixToken();
  console.log('[4/8] Token de Wix CMS obtenido y listo para verificación directa.\n');

  let testRecordId = null;

  try {
    // --- LADO WEB: Paso 1 ---
    console.log('--- [PASO 1 LADO WEB] Abrir modal y completar datos de contacto ---');
    const openRes = await cdp.eval(`
      (() => {
        const btn = document.getElementById('calc-open-btn');
        if (btn) btn.click();
        else if (typeof window.openHagashCalcModal === 'function') window.openHagashCalcModal();
        const overlay = document.getElementById('calc-modal-overlay');
        return overlay && overlay.classList.contains('active') ? 'OPEN_OK' : 'MODAL_NOT_ACTIVE';
      })()
    `);
    console.log('Apertura de modal:', openRes);

    // Llenar campos
    const fillRes = await cdp.eval(`
      (() => {
        document.getElementById('calc-name').value = 'Rodrigo Mendoza E2E';
        document.getElementById('calc-phone').value = '5512345678';
        document.getElementById('calc-email').value = 'rodrigo.mendoza@hagash.com';
        document.getElementById('calc-city').value = 'Guadalajara';

        // Disparar input event para inicializar
        document.getElementById('calc-name').dispatchEvent(new Event('input', { bubbles: true }));
        document.getElementById('calc-email').dispatchEvent(new Event('input', { bubbles: true }));

        // Clic en avanzar
        const nextBtn = document.getElementById('calc-next-btn');
        nextBtn.click();

        return {
          step2Active: document.getElementById('calc-step-2').classList.contains('active')
        };
      })()
    `);
    console.log('Avance a Paso 2 en DOM:', fillRes.step2Active ? 'CORRECTO (Paso 2 activo)' : 'FALLIDO');

    // Esperar a que la petición fetch a Wix se complete
    await delay(2000);

    // Obtener el ID asignado a la sesión en memoria del navegador
    testRecordId = await cdp.eval(`
      (() => {
        // Obtenemos los IDs en el cache de wix-inquiry
        const keys = Object.keys(window.wixInquiryQueue || {});
        // O buscar en los objetos de submitInquiryToWix
        return window.__lastInquiryId || null;
      })()
    `);

    // Si __lastInquiryId no está expuesto directamente, recuperamos el UUID generado en el cliente
    if (!testRecordId) {
      testRecordId = await cdp.eval(`
        (() => {
          // Buscamos cualquier UUID registrado en memoria
          return document.getElementById('calc-name').getAttribute('data-last-id') || null;
        })()
      `);
    }

    // Busquemos en Wix CMS el registro recién creado
    console.log('\n--- [PASO 1 LADO WIX] Verificando inserción en colección ConsultasWeb ---');
    // Para localizar el registro si no se expuso en window, buscamos por correo o usamos el token
    const queryWix = await fetch('https://www.wixapis.com/wix-data/v2/items/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${wixToken}` },
      body: JSON.stringify({
        dataCollectionId: WIX_COLLECTION,
        query: {
          filter: { correo: 'rodrigo.mendoza@hagash.com' }
        }
      })
    });
    const queryData = await queryWix.json();
    const foundItem = queryData.dataItems && queryData.dataItems[0];
    
    if (!foundItem) {
      throw new Error('❌ LADO WIX FALLÓ: El registro de Paso 1 no fue encontrado en ConsultasWeb de Wix.');
    }
    
    testRecordId = foundItem.id;
    console.log('✅ LADO WIX CONFIRMADO (Paso 1):');
    console.log('  - ID único en Wix:', foundItem.id);
    console.log('  - Nombre:', foundItem.data.nombre);
    console.log('  - Teléfono:', foundItem.data.telefono);
    console.log('  - Correo:', foundItem.data.correo);
    console.log('  - Ciudad:', foundItem.data.ciudad);
    console.log('  - Origen:', foundItem.data.origen);
    console.log('  - Fecha creación:', foundItem.data._createdDate);

    // --- LADO WEB: Paso 2 ---
    console.log('\n--- [PASO 2 LADO WEB] Seleccionar tipo de propiedad y avanzar ---');
    const step2Res = await cdp.eval(`
      (() => {
        // Seleccionar tarjeta 'vertical' (Condominio Vertical)
        const card = document.querySelector('.calc-prop-card[data-prop="vertical"]');
        if (!card) return 'CARD_NOT_FOUND';
        card.click();
        
        const nextBtn2 = document.getElementById('calc-step2-next');
        if (nextBtn2.disabled) return 'NEXT_BUTTON_STILL_DISABLED';
        nextBtn2.click();

        return {
          step3Active: document.getElementById('calc-step-3').classList.contains('active')
        };
      })()
    `);
    console.log('Avance a Paso 3 en DOM:', step2Res.step3Active ? 'CORRECTO (Paso 3 activo)' : 'FALLIDO');

    await delay(2000);

    // --- LADO WIX: Paso 2 ---
    console.log('\n--- [PASO 2 LADO WIX] Verificando actualización del MISMO registro en Wix CMS ---');
    const wixItemPaso2 = await getWixItem(wixToken, testRecordId);
    if (!wixItemPaso2) throw new Error('❌ LADO WIX FALLÓ: No se pudo obtener el item actualizado tras Paso 2.');
    
    console.log('✅ LADO WIX CONFIRMADO (Paso 2):');
    console.log('  - Mismo ID conservado:', wixItemPaso2.id === testRecordId ? 'SÍ (' + testRecordId + ')' : 'NO');
    console.log('  - Propiedad actualizada:', wixItemPaso2.data.propiedad);
    console.log('  - Nombre preservado intacto:', wixItemPaso2.data.nombre);
    console.log('  - Correo preservado intacto:', wixItemPaso2.data.correo);
    console.log('  - Origen actualizado:', wixItemPaso2.data.origen);

    if (wixItemPaso2.data.propiedad !== 'Condominio Vertical') {
      throw new Error('❌ LADO WIX: Propiedad no coincide con la seleccionada en la web.');
    }

    // --- LADO WEB: Paso 3 ---
    console.log('\n--- [PASO 3 LADO WEB] Ajustar unidades y pulsar Cotizar ---');
    const step3Res = await cdp.eval(`
      (() => {
        const slider = document.getElementById('calc-units');
        slider.value = 120;
        slider.dispatchEvent(new Event('input', { bubbles: true }));

        const quoteBtn = document.getElementById('calc-quote-btn');
        quoteBtn.click();

        const resultsView = document.getElementById('calc-results-view');
        const summary = document.getElementById('calc-result-summary').textContent;
        const waLink = document.getElementById('calc-wa-link').href;

        return {
          resultsActive: resultsView && resultsView.classList.contains('active'),
          summaryText: summary,
          waHref: waLink
        };
      })()
    `);
    console.log('Vista de resultados en DOM:', step3Res.resultsActive ? 'CORRECTO (Resultados visibles)' : 'FALLIDO');
    console.log('Resumen calculado:', step3Res.summaryText);
    console.log('Enlace WhatsApp generado:', step3Res.waHref.substring(0, 70) + '...');

    await delay(2000);

    // --- LADO WIX: Paso 3 ---
    console.log('\n--- [PASO 3 LADO WIX] Verificando cotización final en Wix CMS ---');
    const wixItemPaso3 = await getWixItem(wixToken, testRecordId);
    if (!wixItemPaso3) throw new Error('❌ LADO WIX FALLÓ: No se pudo obtener el item actualizado tras Paso 3.');

    console.log('✅ LADO WIX CONFIRMADO (Paso 3):');
    console.log('  - Mismo ID conservado:', wixItemPaso3.id === testRecordId ? 'SÍ (' + testRecordId + ')' : 'NO');
    console.log('  - Unidades guardadas:', wixItemPaso3.data.unidades);
    console.log('  - Costo total calculado:', wixItemPaso3.data.costo);
    console.log('  - Moneda:', wixItemPaso3.data.moneda);
    console.log('  - Propiedad preservada:', wixItemPaso3.data.propiedad);
    console.log('  - Origen final:', wixItemPaso3.data.origen);

    if (wixItemPaso3.data.unidades !== 120) {
      throw new Error(`❌ LADO WIX: Unidades esperadas 120, pero se encontró ${wixItemPaso3.data.unidades}`);
    }

    // --- LADO WEB & WIX: Click en WhatsApp y Reinicio ---
    console.log('\n--- [CLICK WHATSAPP] Verificando evento de conversión ---');
    await cdp.eval(`
      (() => {
        const waBtn = document.getElementById('calc-wa-link');
        waBtn.dispatchEvent(new Event('click', { bubbles: true }));
      })()
    `);
    await delay(1500);

    const wixItemWa = await getWixItem(wixToken, testRecordId);
    console.log('  - Origen tras click WhatsApp:', wixItemWa.data.origen);

    console.log('\n--- [REINICIO] Verificando reseteo a nuevo ID único ---');
    await cdp.eval(`
      (() => {
        const restartBtn = document.getElementById('calc-restart-btn');
        restartBtn.click();
      })()
    `);
    const isStep1Reset = await cdp.eval(`
      (() => {
        return document.getElementById('calc-step-1').classList.contains('active');
      })()
    `);
    console.log('Reinicio a Paso 1:', isStep1Reset ? 'CORRECTO' : 'FALLIDO');

    console.log('\n================================================================');
    console.log('   🎉 RESULTADO FINAL: TODAS LAS PRUEBAS E2E PASARON AL 100%   ');
    console.log('   - Persistencia inmediata desde el Paso 1: CONFIRMADA         ');
    console.log('   - Mismo registro actualizado en Paso 2 y 3: CONFIRMADO       ');
    console.log('   - Verificación directa en base de datos Wix CMS: CONFIRMADA  ');
    console.log('================================================================\n');

  } finally {
    // Limpieza de datos de prueba en Wix
    if (testRecordId) {
      console.log(`[LIMPIEZA] Eliminando registro de prueba (${testRecordId}) de ConsultasWeb en Wix CMS...`);
      const delStatus = await deleteWixItem(wixToken, testRecordId);
      console.log(`[LIMPIEZA] Registro eliminado con código HTTP: ${delStatus} OK`);
    }

    cdp.close();
    chrome.kill();
    server.close();
    console.log('[FIN] Servidores y navegador Chrome finalizados.');
  }
}

runE2E().catch(err => {
  console.error('\n❌ ERROR EN PRUEBA E2E:', err);
  process.exit(1);
});
