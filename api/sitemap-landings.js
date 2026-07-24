const SITE_URL = "https://hausbox.app";
const WIX_CLIENT_ID = "ad0088f3-624d-4205-aec9-590fd15e74dd";
const WIX_COLLECTION = "LandingsdeCiudad";

async function getWixToken() {
  const resp = await fetch("https://www.wixapis.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId: WIX_CLIENT_ID, grantType: "anonymous" })
  });
  const data = await resp.json();
  return data.access_token;
}

async function fetchAllLandings(token) {
  const resp = await fetch("https://www.wixapis.com/wix-data/v2/items/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      dataCollectionId: WIX_COLLECTION,
      query: { paging: { limit: 1000 } }
    })
  });
  const data = await resp.json();
  return (data.dataItems || []).map(i => i.data || i);
}

export default async function handler(req, res) {
  try {
    const token = await getWixToken();
    const landings = await fetchAllLandings(token);
    const today = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const l of landings) {
      if (!l.slug) continue;
      const updated = l._updatedDate && l._updatedDate.$date ? l._updatedDate.$date.split("T")[0] : today;
      xml += `  <url>\n    <loc>${SITE_URL}/ciudad.html?slug=${encodeURIComponent(l.slug)}</loc>\n    <lastmod>${updated}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return res.status(500).send("Error generating dynamic sitemap");
  }
}
