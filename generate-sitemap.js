const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://codigo.atriomarketing.site';
const ROOT = __dirname;
const EXCLUDE = ['vgv47', 'node_modules', '.git', '.vercel', 'scripts'];

function findPages(dir, urls = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (EXCLUDE.includes(item)) continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      findPages(full, urls);
    } else if (item === 'index.html') {
      const rel = path.relative(ROOT, dir).replace(/\\/g, '/');
      const url = rel === '' ? '/' : `/${rel}/`;
      urls.push({
        url,
        lastmod: stat.mtime.toISOString().split('T')[0]
      });
    }
  }
  return urls;
}

const pages = findPages(ROOT);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${SITE_URL}${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.url === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${p.url === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log(`Sitemap gerado com ${pages.length} URLs`);
