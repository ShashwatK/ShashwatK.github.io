# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] — 2026-04-19
### Release
- **Launch.** First public publish of `https://shashwatk.github.io/`.
- Page is a signpost to `https://shashwat.org/` (canonical) and linked
  profiles, with Material Web Components for interaction polish, a
  sharp-corner MD3 theme, light/dark via `prefers-color-scheme`, strict
  CSP, JSON-LD `Person` schema, `llms.txt`, sitemap, and robots.txt.
- No trackers, no analytics, no cookies.

## [0.3.0] — 2026-04-19
### Added
- `llms.txt` at root — structured plaintext summary for AI agents, linked
  from the page via `<link rel="alternate">` and referenced in `robots.txt`.
- `404.html` — lightweight not-found page that reuses the site stylesheet.
- `knowsAbout` array in the `Person` JSON-LD (PM, Wi-Fi, Telecom, 5G, drones).
- `<meta name="robots">` with explicit snippet/preview directives and
  `<meta name="referrer" content="strict-origin-when-cross-origin">`.
- `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` to
  shave MWC handshake latency.
- `<lastmod>` on the single sitemap URL.

### Notes
- Canonical still points at `https://shashwat.org/` per PRD — this domain
  is intentionally deprioritized for search-result ranking, but remains
  fully crawlable and LLM-readable.

## [0.2.0] — 2026-04-19
### Added
- Material Web Components (`@material/web@2.4.1`) via jsdelivr ESM — `md-ripple`
  and `md-focus-ring` attached to every link for M3 interaction feedback.
- Primary CTA button styled as a filled Material button (sharp corners).
- MD3 shape tokens pinned to `0` globally; ripple + focus-ring tokens mapped
  to the site palette (light + dark aware).
- `scripts/mwc.js` — external module loader so CSP can stay script-src strict.

### Changed
- CSP relaxed to allow `https://cdn.jsdelivr.net` for scripts and
  `'unsafe-inline'` for styles (required by Lit's adopted stylesheets).
- `.links` row padding moved from `<li>` onto the `<a>` so ripples fill the
  full hit target.

### Notes
- SRI is intentionally skipped for chained ESM imports (browsers don't
  support SRI on dynamically imported modules). Version is pinned instead.
- If the CDN fails, the page silently degrades: every `<a>` remains a
  fully functional native link.

## [0.1.0] — 2026-04-19
### Added
- M1 scaffold: `index.html`, `styles.css`, `favicon.svg`, `robots.txt`, `sitemap.xml`.
- Semantic single-page layout with content, links, and JSON-LD `Person` schema.
- Light/dark theme via `prefers-color-scheme`, sharp-corner aesthetic.
- `rel="canonical"` pointing to `https://shashwat.org/`.
- Strict `Content-Security-Policy` meta (no third-party scripts at M1).
- `prompts/` archive and PRD-driven workflow.
