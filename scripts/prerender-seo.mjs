// scripts/prerender-seo.mjs — runs after `vite build`.
// Writes dist/<route>/index.html with that route's <title>, description, canonical
// and OG tags, plus a crawlable summary inside #root (React replaces it on load).
// Also writes dist/404.html (served with HTTP 404 by Vercel) and dist/sitemap.xml.
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://www.onewaterpakistan.com';
const dist = path.resolve('dist');
const routes = JSON.parse(fs.readFileSync('src/data/seo-routes.json', 'utf8'));
// Guides: one prerendered page per article.
for (const post of JSON.parse(fs.readFileSync('src/data/blog/index.json', 'utf8'))) {
  routes[`/blog/${post.slug}`] = { title: `${post.title} | One Water`, description: post.description, h1: post.title };
}
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const NAV = [['/', 'Home'], ['/products', 'Products'], ['/delivery', '19L Delivery'], ['/quality', 'Quality'], ['/offers', 'Offers'], ['/events', 'Events'], ['/about', 'About'], ['/contact', 'Contact']];

function render(route, { title, description, h1 }, { noindex = false } = {}) {
  const url = `${SITE}${route === '/' ? '/' : route}`;
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(description)}$2`);
  if (noindex) html = html.replace('<meta charset="UTF-8" />', '<meta charset="UTF-8" />\n    <meta name="robots" content="noindex" />');
  const summary = `<div id="root"><main style="color:#fff;padding:96px 24px;font-family:sans-serif;max-width:720px;margin:auto">`
    + `<h1>${esc(h1)}</h1><p>${esc(description)}</p>`
    + `<p>Call or WhatsApp <a href="tel:+923203133140" style="color:#00d4ff">0320 313 3140</a> to order.</p>`
    + `<nav>${NAV.map(([href, label]) => `<a href="${href}" style="color:#00d4ff;margin-right:12px">${label}</a>`).join('')}</nav>`
    + `</main></div>`;
  return html.replace('<div id="root"></div>', summary);
}

for (const [route, meta] of Object.entries(routes)) {
  const file = route === '/' ? path.join(dist, 'index.html') : path.join(dist, route.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, render(route, meta));
}

// SPA shell for routes that must never be indexed (/admin, /checkout).
fs.writeFileSync(path.join(dist, 'app.html'), render('/', { title: 'One Water', description: '', h1: 'One Water' }, { noindex: true }));
fs.writeFileSync(path.join(dist, '404.html'), render('/404', { title: 'Page not found | One Water', description: 'This page does not exist.', h1: 'Page not found' }, { noindex: true }));

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
  + Object.keys(routes).map((r) => `  <url><loc>${SITE}${r}</loc><lastmod>${today}</lastmod><priority>${r === '/' ? '1.0' : r === '/delivery' || r === '/products' ? '0.9' : r.startsWith('/blog/') ? '0.6' : '0.7'}</priority></url>`).join('\n')
  + `\n</urlset>\n`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
console.log(`prerendered ${Object.keys(routes).length} routes + 404.html + sitemap.xml`);
