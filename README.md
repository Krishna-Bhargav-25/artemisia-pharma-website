# Artemisia Pharma Website

A simple Node/Express + EJS website with a themed UI and subtle animations.

## Quick start

1. Place the provided logo file at `public/logo.png` (PNG/JPG/SVG supported).
2. Copy `.env.example` to `.env` and fill values for SMTP and `COMPANY_EMAIL`.
3. Install dependencies:
   ```bash
   npm install
   npm install express ejs nodemailer dotenv
   npm install -D nodemon
   ```
4. Run in development:
   ```bash
   npm run dev
   ```
   Or start:
   ```bash
   npm start
   ```

## Pages
- `/` Landing page
- `/about` About us (mentions WHO‑GMP partners)
- `/portfolio` Product list with concentrations
- `/contact` Contact form that emails the company

## Theming
The color palette is derived from the logo (deep blue and green, with neutral gray). Colors are defined as CSS variables in `public/styles.css` so you can tweak them centrally.

## Accessibility
- Animations honor `prefers-reduced-motion`.
- Colors target sufficient contrast for readability.
