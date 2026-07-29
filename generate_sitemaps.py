import urllib.request
import json
import xml.etree.ElementTree as ET
from xml.dom import minidom
from datetime import datetime

SITE_URL = "https://hausbox.com"
WIX_CLIENT_ID = "ad0088f3-624d-4205-aec9-590fd15e74dd"
WIX_COLLECTION = "LandingsdeCiudad"

def get_wix_token():
    url = "https://www.wixapis.com/oauth2/token"
    payload = json.dumps({"clientId": WIX_CLIENT_ID, "grantType": "anonymous"}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        return data['access_token']

def fetch_all_cms_landings(token):
    url = "https://www.wixapis.com/wix-data/v2/items/query"
    body = json.dumps({
        "dataCollectionId": WIX_COLLECTION,
        "query": {"paging": {"limit": 1000}},
        "includeReferencedItems": []
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=body, headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    })
    
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        items = data.get('dataItems', [])
        return [item.get('data', item) for item in items]

def generate_static_sitemap():
    static_pages = [
        {"path": "/", "priority": "1.0", "changefreq": "daily"},
        {"path": "/nosotros.html", "priority": "0.8", "changefreq": "monthly"},
        {"path": "/precios.html", "priority": "0.9", "changefreq": "weekly"},
        {"path": "/zonas.html", "priority": "0.9", "changefreq": "daily"},
        {"path": "/casos-de-exito.html", "priority": "0.8", "changefreq": "monthly"},
        {"path": "/blog.html", "priority": "0.8", "changefreq": "weekly"},
        {"path": "/acceso-express.html", "priority": "0.8", "changefreq": "monthly"},
        {"path": "/cobranza-inteligente.html", "priority": "0.8", "changefreq": "monthly"},
        {"path": "/comunicacion-avisos.html", "priority": "0.8", "changefreq": "monthly"},
        {"path": "/comunidad.html", "priority": "0.8", "changefreq": "monthly"},
        {"path": "/conciliacion-automatizada.html", "priority": "0.8", "changefreq": "monthly"},
        {"path": "/contabilidad-profesional.html", "priority": "0.8", "changefreq": "monthly"},
        {"path": "/mensajeria-multicanal.html", "priority": "0.8", "changefreq": "monthly"},
        {"path": "/pago-mantenimiento.html", "priority": "0.8", "changefreq": "monthly"},
        {"path": "/reserva-amenidades.html", "priority": "0.8", "changefreq": "monthly"},
        {"path": "/politica-de-privacidad.html", "priority": "0.3", "changefreq": "yearly"},
        {"path": "/terminos-y-condiciones.html", "priority": "0.3", "changefreq": "yearly"}
    ]
    
    today = datetime.now().strftime('%Y-%m-%d')
    
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]
    
    for page in static_pages:
        loc = f"{SITE_URL}{page['path']}"
        xml_lines.append('  <url>')
        xml_lines.append(f'    <loc>{loc}</loc>')
        xml_lines.append(f'    <lastmod>{today}</lastmod>')
        xml_lines.append(f'    <changefreq>{page["changefreq"]}</changefreq>')
        xml_lines.append(f'    <priority>{page["priority"]}</priority>')
        xml_lines.append('  </url>')
        
    xml_lines.append('</urlset>')
    
    content = '\n'.join(xml_lines)
    with open('sitemap-static.xml', 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[OK] sitemap-static.xml generated with {len(static_pages)} static pages.")

def generate_landings_sitemap():
    print("Fetching live CMS items from Wix REST API...")
    token = get_wix_token()
    landings = fetch_all_cms_landings(token)
    print(f"Fetched {len(landings)} items from Wix CMS.")
    
    today = datetime.now().strftime('%Y-%m-%d')
    
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]
    
    valid_count = 0
    for l in landings:
        slug = l.get('slug')
        if not slug:
            continue
        
        # Format updated date if available
        updated = l.get('_updatedDate', {}).get('$date') if isinstance(l.get('_updatedDate'), dict) else None
        lastmod = updated[:10] if updated else today
        
        loc = f"{SITE_URL}/ciudad.html?slug={slug}"
        xml_lines.append('  <url>')
        xml_lines.append(f'    <loc>{loc}</loc>')
        xml_lines.append(f'    <lastmod>{lastmod}</lastmod>')
        xml_lines.append('    <changefreq>weekly</changefreq>')
        xml_lines.append('    <priority>0.8</priority>')
        xml_lines.append('  </url>')
        valid_count += 1
        
    xml_lines.append('</urlset>')
    
    content = '\n'.join(xml_lines)
    with open('sitemap-landings.xml', 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[OK] sitemap-landings.xml generated dynamically from Wix CMS with {valid_count} landings.")

def generate_sitemap_index():
    today = datetime.now().strftime('%Y-%m-%d')
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <sitemap>',
        f'    <loc>{SITE_URL}/sitemap-static.xml</loc>',
        f'    <lastmod>{today}</lastmod>',
        '  </sitemap>',
        '  <sitemap>',
        f'    <loc>{SITE_URL}/sitemap-landings.xml</loc>',
        f'    <lastmod>{today}</lastmod>',
        '  </sitemap>',
        '</sitemapindex>'
    ]
    content = '\n'.join(xml_lines)
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(content)
    print("[OK] sitemap.xml (Sitemap Index) generated pointing to sitemap-static.xml and sitemap-landings.xml.")

if __name__ == '__main__':
    generate_static_sitemap()
    generate_landings_sitemap()
    generate_sitemap_index()
