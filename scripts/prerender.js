/*
  Static prerender for GitHub Pages
  - Renders EJS views to dist/
  - Rewrites absolute links/assets to include the Project Pages base path
  - Optionally wires contact form to an external endpoint via FORM_ENDPOINT env var
*/

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const ejs = require('ejs');
const { loadProductData, getCategories } = require('../utils/excelLoader');

const root = path.join(__dirname, '..');
const viewsDir = path.join(root, 'views');
const distDir = path.join(root, 'dist');
const publicDir = path.join(root, 'public');
const docsDir = path.join(root, 'docs');

// Base path for Project Pages: https://<user>.github.io/<repo>/
const basePath = '/artemisia-pharma-website';
const FORM_ENDPOINT = process.env.FORM_ENDPOINT || '';
const VERSION = process.env.BUILD_VERSION || String(Date.now());

// Load product data from Excel files
const categories = getCategories();

// ✅ Added new Combinations page
const pages = [
  { view: 'index', out: 'index.html', data: { title: 'Artemisia Pharma' } },
  { view: 'about', out: 'about/index.html', data: { title: 'About Us - Artemisia Pharma' } },
  { view: 'products/index', out: 'products/index.html', data: { title: 'Products - Artemisia Pharma', categories } },
  { view: 'products/ir-pellets', out: 'products/ir-pellets/index.html', data: { title: 'IR Pellets - Artemisia Pharma', products: loadProductData('ir-pellets') } },
  { view: 'products/sr-cr-pr-pellets', out: 'products/sr-cr-pr-pellets/index.html', data: { title: 'SR/CR/PR Pellets - Artemisia Pharma', products: loadProductData('sr-cr-pr-pellets') } },
  { view: 'products/dr-ec-pellets', out: 'products/dr-ec-pellets/index.html', data: { title: 'EC/DR Pellets - Artemisia Pharma', products: loadProductData('dr-ec-pellets') } },
  { view: 'products/granules', out: 'products/granules/index.html', data: { title: 'Granules - Artemisia Pharma', products: loadProductData('granules') } },

  // ✅ New Combinations category prerender
  { view: 'products/combinations', out: 'products/combinations/index.html', data: { title: 'Combinations - Artemisia Pharma', products: loadProductData('combinations') } },

  { view: 'products/inert-core-pellets', out: 'products/inert-core-pellets/index.html', data: { title: 'Inert Core Pellets - Artemisia Pharma', products: loadProductData('inert-core-pellets') } },
  { view: 'contact', out: 'contact/index.html', data: { title: 'Contact Us - Artemisia Pharma', sent: null, error: null } },
];

function rewriteForPages(html) {
  let out = html
    // assets
    .replace(/href=\"\/styles\.css\"/g, `href=\"${basePath}/styles.css?v=${VERSION}\"`)
    .replace(/src=\"\/app\.js\"/g, `src=\"${basePath}/app.js?v=${VERSION}\"`)
    .replace(/src=\"\/logo\.(png|jpg|jpeg|svg)\"/g, `src=\"${basePath}/logo.$1?v=${VERSION}\"`)
    // nav + root links
    .replace(/href=\"\/\"/g, `href=\"${basePath}/\"`)
    .replace(/href=\"\/about\"/g, `href=\"${basePath}/about/\"`)
    .replace(/href=\"\/portfolio\"/g, `href=\"${basePath}/products/\"`)
    .replace(/href=\"\/products\"/g, `href=\"${basePath}/products/\"`)
    .replace(/href=\"\/products\/ir-pellets\"/g, `href=\"${basePath}/products/ir-pellets/\"`)
    .replace(/href=\"\/products\/sr-cr-pr-pellets\"/g, `href=\"${basePath}/products/sr-cr-pr-pellets/\"`)
    .replace(/href=\"\/products\/dr-ec-pellets\"/g, `href=\"${basePath}/products/dr-ec-pellets/\"`)
    .replace(/href=\"\/products\/granules\"/g, `href=\"${basePath}/products/granules/\"`)
    // ✅ Add rewrite rule for Combinations
    .replace(/href=\"\/products\/combinations\"/g, `href=\"${basePath}/products/combinations/\"`)
    .replace(/href=\"\/products\/inert-core-pellets\"/g, `href=\"${basePath}/products/inert-core-pellets/\"`)
    .replace(/href=\"\/contact\"/g, `href=\"${basePath}/contact/\"`);

  // Contact form wiring
  if (FORM_ENDPOINT) {
    out = out.replace(
      /<form([^>]*?)method=\"POST\"([^>]*?)action=\"[^\"]*\"/i,
      `<form$1method=\"POST\"$2action=\"${FORM_ENDPOINT}\"`
    );
  } else {
    // Disable static form
    out = out.replace(
      /<form([^>]*?)method=\"POST\"([^>]*?)action=\"[^\"]*\"/i,
      `<form$1method=\"POST\"$2action=\"#\" onsubmit=\"alert('This form is disabled on the static site.'); return false;\"`
    );
  }

  return out;
}

async function copyDir(src, dest) {
  await fsp.mkdir(dest, { recursive: true });
  for (const entry of await fsp.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) await copyDir(s, d);
    else await fsp.copyFile(s, d);
  }
}

(async () => {
  await fsp.rm(distDir, { force: true, recursive: true });
  await fsp.mkdir(distDir, { recursive: true });

  // Copy static assets
  if (fs.existsSync(publicDir)) {
    await copyDir(publicDir, distDir);
  }

  // Render pages
  for (const p of pages) {
    const outPath = path.join(distDir, p.out);
    await fsp.mkdir(path.dirname(outPath), { recursive: true });
    const file = path.join(viewsDir, `${p.view}.ejs`);
    const html = await ejs.renderFile(file, p.data, {
      views: [viewsDir],
      filename: file,
    });
    const rewritten = rewriteForPages(html);
    await fsp.writeFile(outPath, rewritten, 'utf8');
  }

  // Publish to docs/ for GitHub Pages
  await fsp.rm(docsDir, { force: true, recursive: true });
  await fsp.mkdir(docsDir, { recursive: true });
  await copyDir(distDir, docsDir);
  await fsp.writeFile(path.join(docsDir, '.nojekyll'), '');
  const redirectHtml = `<!doctype html>
<meta charset="utf-8">
<title>Redirecting…</title>
<meta http-equiv="refresh" content="0; url=${basePath}/">
<script>location.replace('${basePath}/');</script>`;
  await fsp.writeFile(path.join(docsDir, '404.html'), redirectHtml, 'utf8');
  console.log('✅ Static site generated in docs/ including Combinations page.');
})();
