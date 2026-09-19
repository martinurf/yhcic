# YHCIC — sitio web

Sitio estático, sin build step. Abrí `index.html` en cualquier navegador o subilo tal cual a Netlify / Vercel / GitHub Pages.

**Vivo en:** https://martinurf.github.io/yhcic/ (GitHub Pages, se actualiza solo con cada `git push` a `main`).

```
index.html
assets/css/site.css
assets/js/config.js         ← TODO el contenido editable vive acá
assets/js/site.js           ← movimiento, chart vivo, menú, modales, formulario, cotizaciones en vivo
assets/js/motion-check.js   ← detector de prefers-reduced-motion + guardia anti-clickjacking
robots.txt · sitemap.xml    ← higiene SEO mínima
vercel.json                 ← cabeceras de seguridad reales (headers HTTP), listas para cuando migren a Vercel
```

## Publicar un cambio

```
git add -A
git commit -m "lo que cambiaste"
git push
```

GitHub Pages lo toma solo en 1–2 minutos. No hay build, no hay CI — lo que está en `main` es lo que se ve.

## Seguridad — qué hay y qué falta

- **CSP estricta** (meta tag en `index.html`): solo scripts propios (`assets/js/*`), sin `unsafe-inline`. Bloquea la clase de ataque más común en un sitio así (inyectar un script de otro lado).
- **Sin secretos en el repo.** `application.endpoint` y `market.apiKey` arrancan en `null`. El día que pongas una key de Finnhub ahí, **queda visible en el código fuente** — cualquiera que abra la consola del navegador la ve. Es una limitación real de un sitio sin backend, no un descuido: usá siempre una key de plan gratuito, pensada para esto.
- **Anti-clickjacking**: guardia en JS (`motion-check.js`) mientras el sitio esté en GitHub Pages, que no deja configurar cabeceras HTTP propias. `vercel.json` ya tiene `X-Frame-Options` y `frame-ancestors` reales, listos para cuando se migre a Vercel (2 comandos: `vercel login` + `vercel --prod`).
- **Honeypot** en el formulario de aplicación (`_gotcha`) — invisible para personas, los bots de spam lo llenan y Formspree (u otro backend que lo respete) descarta el envío solo.
- **Pendiente si migran a Vercel/Netlify**: activar `vercel.json` para tener `X-Content-Type-Options`, HSTS y `frame-ancestors` como cabecera real (GitHub Pages no lo permite).

## Qué cambiar primero (todo en `config.js`)

| Clave | Qué es |
|---|---|
| `social.groupMe.href` / `social.instagram.href` | URLs reales. Hoy son placeholders (`placeholder: true`). |
| `application.endpoint` | `null` hoy. Poné un URL POST (Formspree, Netlify Forms, tu API) y el formulario empieza a enviar de verdad. Mientras sea `null`, valida pero **no finge** que guardó nada. |
| `members` | Roster. Nombre, rol, major, focus, LinkedIn opcional. |
| `projects`, `goals`, `locked` | Texto de las secciones. |
| `market.rows` | Valores del panel. `isLive: false` hace que el panel se etiquete **Illustrative**. Cuando conectes un API de cotizaciones, poné `isLive: true` y el tag cambia a **Live**. |

## Decisiones técnicas

- **Sin framework, sin bundle.** HTML + CSS + JS plano. Carga en una sola pasada, sin dependencias que mantener.
- **Fuentes:** Bodoni Moda (wordmark), Newsreader (editorial), Inter (datos/UI). Vía Google Fonts con fallbacks reales.
- **Escena del hero:** un solo SVG (grid, dos cordilleras, velas, chart). El chart se dibuja con `stroke-dashoffset` (~1.35s) y después sigue vivo: cada 3.4s mueve un punto y cada tanto pulsa un dato. Nunca se mueve la curva entera.
- **Parallax:** por capa (`data-depth`), puntero en desktop y scroll en móvil, 3–10px. Se apaga con `prefers-reduced-motion`.
- **Revelados de scroll:** vocabulario mixto (máscara, clip-path, dibujo de trazo, desenfoque que resuelve, stagger), no fade-up genérico. Hay un timeout de seguridad a 6s: nada queda invisible si falla el observer.
- **Accesibilidad:** HTML semántico, focus visible, trap de foco y ESC en menú y modales, labels reales, `aria-invalid` en errores, `prefers-reduced-motion` respetado.

## Pendiente real (no está hecho y no debería fingirse)

1. URLs de GroupMe e Instagram.
2. Backend del formulario.
3. Datos de mercado reales (o dejar el tag *Illustrative*).
4. Roster verdadero.
5. Páginas propias para Projects — hoy las cards navegan a secciones de la misma página; la estructura de datos ya tiene `href` para migrarlas.
