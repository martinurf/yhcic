# YHCIC — sitio web

Sitio estático, sin build step. Abrí `index.html` en cualquier navegador o subilo tal cual a Netlify / Vercel / GitHub Pages.

**Vivo en:** https://yhcic.vercel.app/ — es la URL canónica (headers de seguridad reales, Analytics). También espejado en https://martinurf.github.io/yhcic/ con el mismo contenido; ambos se actualizan solos con cada `git push` a `main`.

```
index.html · 404.html
assets/css/site.css · assets/css/notfound.css
assets/js/config.js          ← TODO el contenido editable vive acá
assets/js/site.js            ← movimiento, chart vivo, menú, modales, formulario, cotizaciones en vivo
assets/js/motion-check.js    ← detector de prefers-reduced-motion + guardia anti-clickjacking
scripts/check-site.mjs       ← chequeos pre-deploy (ver CI abajo), sin dependencias
.github/workflows/checks.yml ← corre check-site.mjs en cada push/PR
robots.txt · sitemap.xml     ← higiene SEO mínima
vercel.json                  ← cabeceras de seguridad reales (headers HTTP) — activas en Vercel, inertes en GitHub Pages
```

## Publicar un cambio

```
git add -A
git commit -m "lo que cambiaste"
git push
```

Vercel y GitHub Pages lo toman solos en 1–2 minutos. Antes de eso, GitHub Actions corre `scripts/check-site.mjs` (rutas de assets rotas, ids duplicados, anchors internos que no resuelven, JSON-LD inválido) y falla el check si algo no cierra — no bloquea el deploy (Vercel/Pages no dependen de Actions), pero avisa. Sin build, sin dependencias que instalar.

## Seguridad — qué hay y qué falta

- **CSP estricta** (meta tag en `index.html`, cabecera real en `vercel.json`): solo scripts propios (`assets/js/*`), sin `unsafe-inline`. Bloquea la clase de ataque más común en un sitio así (inyectar un script de otro lado).
- **Sin secretos de verdad en el repo** más allá de lo inherente a un sitio sin backend: `market.apiKey` (Finnhub) está en `config.js` y **es visible en el código fuente** — cualquiera que abra la consola del navegador la ve. No es un descuido, es la naturaleza de un sitio sin servidor propio; por eso es una key de plan gratuito, pensada para esto.
- **Anti-clickjacking**: cabecera real (`X-Frame-Options` + `frame-ancestors`) en Vercel; guardia en JS (`motion-check.js`) como respaldo en GitHub Pages, que no permite configurar cabeceras propias.
- **Honeypot** en el formulario de aplicación (`_gotcha`) — invisible para personas, los bots de spam lo llenan y Formspree descarta el envío solo.
- **CI en cada push** (`.github/workflows/checks.yml`): sintaxis de los 3 archivos JS + los chequeos de `check-site.mjs`.

## Qué cambiar primero (todo en `config.js`)

| Clave | Qué es |
|---|---|
| `social.groupMe.href` / `social.instagram.href` | ✅ URLs reales, ya cargadas. |
| `application.endpoint` | ✅ Formspree conectado — el formulario envía solo, sin abrir el correo de nadie. |
| `market.apiKey` / `isLive` | ✅ Finnhub conectado — el panel dice **Live** y muestra cotizaciones reales. |
| `members` | Roster. Nombre, rol, major, focus, LinkedIn opcional. Sigue con placeholders. |
| `projects`, `goals`, `locked` | Texto de las secciones — falta el markup en `index.html` para Goals/Projects/Members. |

## Decisiones técnicas

- **Sin framework, sin bundle.** HTML + CSS + JS plano. Carga en una sola pasada, sin dependencias que mantener — tampoco en CI (`check-site.mjs` usa solo `node:fs`).
- **Fuentes:** Bodoni Moda peso 900 (wordmark — grueso a propósito, no genérico), Newsreader (editorial), Inter (datos/UI). Vía Google Fonts, solo los pesos que el CSS usa de verdad.
- **Escena del hero:** un solo SVG (grid, dos cordilleras, velas, chart). El chart se dibuja con `stroke-dashoffset` (~1.35s) y después sigue vivo: cada 3.4s mueve un punto y cada tanto pulsa un dato. Nunca se mueve la curva entera.
- **Parallax:** por capa (`data-depth`), puntero en desktop y scroll en móvil, 3–10px. Se apaga con `prefers-reduced-motion`, y se pausa entera cuando el hero sale del viewport.
- **Revelados de scroll:** vocabulario mixto (máscara, clip-path, dibujo de trazo, desenfoque que resuelve, stagger), no fade-up genérico. En la banda oscura ("Who we are") **repiten** — scrollear más allá y volver a bajar los vuelve a mostrar. Timeout de seguridad a 20s (solo para el caso raro de que `IntersectionObserver` no dispare nunca).
- **Accesibilidad:** HTML semántico, focus visible, trap de foco y ESC en menú/modales/Stay Connected, labels reales, `aria-invalid` en errores, `prefers-reduced-motion` respetado.
- **SEO:** JSON-LD `Organization`, `<link rel="canonical">` apuntando a Vercel (evita que las dos URLs compitan entre sí), `og:image`/`twitter:image` con URL absoluta, `sitemap.xml`/`robots.txt`.
- **Analytics:** Vercel Web Analytics (`/_vercel/insights/script.js`) — no-opea en GitHub Pages, hay que activarlo una vez en el dashboard de Vercel (Project → Analytics → Enable).

## Pendiente real (no está hecho y no debería fingirse)

1. Roster verdadero — hoy son placeholders salvo Martín.
2. Secciones Goals / Projects / Members — datos ya están en `config.js`, falta el markup (aparecen como "Soon" en el menú).
3. Activar Vercel Analytics en el dashboard (1 clic, ver arriba).
4. Monitoreo de uptime (recomendado: UptimeRobot, gratis) — hoy nadie se entera si el sitio se cae.
5. Formspree free tier tiene tope de envíos por mes — revisar el dashboard de Formspree si el club crece.
