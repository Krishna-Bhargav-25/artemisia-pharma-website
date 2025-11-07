# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Stack: Node.js + Express with EJS templates and static assets under public/.
- Purpose: Marketing site with landing, about, portfolio, and a contact form that emails the company via SMTP.

Common commands
- Install (package.json currently lacks deps; install runtime + dev deps):
  ```bash
  npm install
  npm install express ejs nodemailer dotenv
  npm install -D nodemon
  ```
- Dev server (auto-restart with nodemon):
  ```bash
  npm run dev
  ```
- Start server (production-like):
  ```bash
  npm start
  ```

Environment setup
- Copy .env.example to .env and fill values. Relevant variables used by server.js:
  - PORT (optional; defaults to 3000)
  - COMPANY_EMAIL (recipient for contact form submissions)
  - SMTP_HOST, SMTP_PORT, SMTP_SECURE ("true" | "false"), SMTP_USER, SMTP_PASS, SMTP_FROM (optional; falls back to SMTP_USER)

Architecture and code structure
- Entry point: server.js
  - Configures EJS view engine and serves static assets from public/.
  - Routes:
    - GET / → renders views/index.ejs
    - GET /about → renders views/about.ejs
    - GET /portfolio → renders views/portfolio.ejs with an in-file products array (placeholder for future data source)
    - GET /contact → renders views/contact.ejs with status flags
    - POST /contact → sends an email via nodemailer using SMTP settings from .env; re-renders contact page with success/error state
- Views (EJS):
  - Page templates under views/: index.ejs, about.ejs, portfolio.ejs, contact.ejs
  - Shared partials under views/partials/: header.ejs and footer.ejs are included by each page to assemble the layout
  - layout.ejs exists but is not wired via express-ejs-layouts; current pages use partials directly
- Static assets:
  - public/styles.css defines the theme via CSS variables (brand blue/green/gray). Adjust colors centrally here
  - public/app.js applies IntersectionObserver-based reveal animations (falls back gracefully when unsupported)
  - Place your logo at public/logo.png (PNG/JPG/SVG)

What’s configured vs not configured
- Build step: none required (server-rendered templates and static assets)
- Linting: not configured
- Tests: not configured (there are no test scripts or frameworks set up)

Notes distilled from README.md
- Quick start: add logo (public/logo.png), copy .env.example → .env, install deps, run npm run dev
- Pages: /, /about, /portfolio, /contact
- Accessibility: animations honor prefers-reduced-motion; colors aim for good contrast
