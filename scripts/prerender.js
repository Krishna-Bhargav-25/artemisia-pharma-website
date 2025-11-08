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

const root = path.join(__dirname, '..');
const viewsDir = path.join(root, 'views');
const distDir = path.join(root, 'dist');
const publicDir = path.join(root, 'public');

// Base path for Project Pages: https://<user>.github.io/<repo>/
const basePath = '/artemisia-pharma-website';
const FORM_ENDPOINT = process.env.FORM_ENDPOINT || '';
const VERSION = process.env.BUILD_VERSION || String(Date.now());

const pages = [
  { view: 'index', out: 'index.html', data: { title: 'Artemisia Pharma' } },
  { view: 'about', out: 'about/index.html', data: { title: 'About Us - Artemisia Pharma' } },
  { view: 'products/index', out: 'products/index.html', data: { title: 'Products - Artemisia Pharma' } },
  { view: 'products/ir-pellets', out: 'products/ir-pellets/index.html', data: { title: 'IR Pellets - Artemisia Pharma' } },
  { view: 'products/sr-cr-pr-pellets', out: 'products/sr-cr-pr-pellets/index.html', data: { title: 'SR/CR/PR Pellets - Artemisia Pharma' } },
{ view: 'products/dr-ec-pellets', out: 'products/dr-ec-pellets/index.html', data: { title: 'EC/DR Pellets - Artemisia Pharma' } },
  { view: 'products/granules', out: 'products/granules/index.html', data: { title: 'Granules - Artemisia Pharma' } },
  { view: 'products/inert-core-pellets', out: 'products/inert-core-pellets/index.html', data: { title: 'Inert Core Pellets - Artemisia Pharma' } },
  { view: 'contact', out: 'contact/index.html', data: { title: 'Contact Us - Artemisia Pharma', sent: null, error: null } },
];

function rewriteForPages(html) {
  let out = html
    // assets
.replace(/href="\/styles\.css"/g, `href="${basePath}/styles.css?v=${VERSION}"`)
    .replace(/src="\/app\.js"/g, `src="${basePath}/app.js?v=${VERSION}"`)
    .replace(/src="\/logo\.(png|jpg|jpeg|svg)"/g, `src="${basePath}/logo.$1?v=${VERSION}"`)
    // nav + root links
    .replace(/href="\/"/g, `href="${basePath}/"`)
    .replace(/href="\/about"/g, `href="${basePath}/about/"`)
    .replace(/href="\/portfolio"/g, `href="${basePath}/products/"`)
    .replace(/href="\/products"/g, `href="${basePath}/products/"`)
    .replace(/href="\/products\/ir-pellets"/g, `href="${basePath}/products/ir-pellets/"`)
    .replace(/href="\/products\/sr-cr-pr-pellets"/g, `href="${basePath}/products/sr-cr-pr-pellets/"`)
    .replace(/href="\/products\/dr-ec-pellets"/g, `href="${basePath}/products/dr-ec-pellets/"`)
.replace(/href=\"\\/products\\/granules\"/g, `href=\"${basePath}/products/granules/\"`)
    .replace(/href=\"\\/products\\/inert-core-pellets\"/g, `href=\"${basePath}/products/inert-core-pellets/\"`)
    .replace(/href=\"\\/contact\"/g, `href=\"${basePath}/contact/\"`);

  // Contact form wiring: if no external endpoint, disable the form gracefully
  if (FORM_ENDPOINT) {
    out = out.replace(/<form([^>]*?)method="POST"([^>]*?)action="[^"]*"/i, `<form$1method="POST"$2action="${FORM_ENDPOINT}"`);
  } else {
    // Remove action and prevent submit
    out = out.replace(/<form([^>]*?)method="POST"([^>]*?)action="[^"]*"/i, `<form$1method="POST"$2action="#" onsubmit="alert('This form is disabled on the static site.'); return false;"`);
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
    // Render synchronously to support classic EJS includes without `await`
    const html = await ejs.renderFile(file, p.data);
    const rewritten = rewriteForPages(html);
    await fsp.writeFile(outPath, rewritten, 'utf8');
  }
  console.log('Static site generated in dist/');
})();
