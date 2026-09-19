# YHCIC — sitio web del Young Harris College Investment Club

Contexto para cualquier sesión de Claude Code que trabaje en este repo.
Lee este archivo completo antes de tocar código.

---

## 1. Qué es esto

Sitio oficial del **Young Harris College Investment Club (YHCIC)**. Club estudiantil
de inversiones en fase fundacional (2026). El sitio debe verse como el de una firma
financiera moderna — institucional, editorial, premium, sobrio — **nunca** como una
página estudiantil genérica ni como una plantilla SaaS.

Dueño del proyecto: Martín Ruales. Responde en español; el contenido del sitio va en inglés.

---

## 2. Stack y estructura

Sin framework, sin build step, sin dependencias. HTML + CSS + JS plano.

```
index.html              página completa (una sola)
assets/css/site.css     todo el CSS, con tokens en :root
assets/js/config.js     TODO el contenido editable — empieza aquí
assets/js/site.js       escena de mercado, coreografía, menú, formulario
assets/img/             campus.jpg · graph.jpg · pen.jpg (760px, JPEG q84)
README.md               guía corta para editar
```

Para verlo: abrir `index.html` en el navegador. Para publicarlo: subir la carpeta tal
cual a Netlify, Vercel o GitHub Pages. No hay `npm install` ni `npm run build`.

**No introduzcas un framework, un bundler ni Tailwind** sin que Martín lo pida
explícitamente. La ausencia de build es una decisión, no una carencia.

---

## 3. Sistema de diseño

Tokens en `:root` de `site.css`. Úsalos siempre; no escribas colores literales.

| Token | Valor | Uso |
|---|---|---|
| `--paper` | #FBFAFC | fondo claro |
| `--ink` | #17131F | texto principal |
| `--muted` / `--muted-2` | #6C6480 / #938BA6 | texto secundario |
| `--rule` / `--rule-2` | #E4DFEC / #D5CEE2 | hairlines y bordes |
| `--purple` | #78359F | acento de marca |
| `--purple-deep` | #47217A | acento oscuro |
| `--purple-soft` | #A87FD1 | acento claro |
| `--vault` / `--vault-2` | #14111C / #1C1729 | banda oscura |
| `--vault-ink` / `--vault-mute` / `--vault-accent` | #F2EEF8 / #9A90B0 / #B48FE0 | texto y acento sobre oscuro |

Tipografía (Google Fonts, un solo `<link>`):
- `--ff-display` **Bodoni Moda** — wordmark YHCIC, títulos display
- `--ff-edit` **Newsreader** — frases editoriales, títulos de sección, cuerpo destacado
- `--ff-ui` **Inter** — UI, datos, labels, botones
- `--ff-mono` — stack del sistema, solo para micro-metadata

Reglas de estilo que el diseño ya respeta y que hay que mantener:
- Morado es acento, no fondo. El sitio no debe volverse morado.
- Nada de bordes redondeados grandes, sombras fuertes, glassmorphism excesivo ni gradientes de más.
- Fade-in genérico desde abajo está prohibido. El vocabulario de animación es:
  máscaras, clip-path, trazado de línea (stroke-dashoffset), tracking que cierra,
  blur que resuelve, hairlines que se extienden.
- Respetar `prefers-reduced-motion` en todo lo nuevo.

---

## 4. Estructura de la página (en orden)

1. **Progress hairline** fijo arriba (`.progress`)
2. **Header fijo** (`.masthead`) — toma fondo glass al pasar 36px de scroll
3. **Menú overlay** (`.menu`) — Home y Who We Are activos; Goals/Projects/Members marcados "Soon"
4. **Hero** (`.hero`)
   - `.market-bg` — la escena de mercado. **Código exacto entregado por Martín.**
     SVG al 62% (desktop) / 65% (móvil), anclado lateral, NO centrado. Grid 68px.
     6 velas CSS (`.c1`–`.c6`), velas SVG generadas de `POINTS.slice(1,-2)`, trend 4s.
     Parallax de puntero ±8px sobre todo `.market-bg`.
     **No centres el SVG, no cambies 62%/65% a 100%, no añadas una segunda capa de gráfica.**
   - eyebrow Ideas/Analysis/Opportunity, whisper Students/A brighter/tomorrow
   - market board en glass (etiquetado *Illustrative* mientras `market.isLive` sea false)
   - lockup Young Harris College / YHCIC / Investment Club
   - CTA "Student-led initiative" → abre el formulario · "Stay connected" → **inerte** (faltan URLs)
   - build conviction / learn markets / grow
   - 3 cards: Goals, Projects, Members (con imágenes)
5. **Bridge** blanco → oscuro (`.bridge--down`)
6. **Banda oscura** (`.vault`, id `#who`) — Who we are, hairline, frase,
   botón Join YHCIC, hairline, Discipline · Perspective · Progress, botón volver arriba
7. **Bridge** oscuro → blanco (`.bridge--up`)
8. **Footer** — wordmark YHCIC morado gigante, metadata, copyright

### Coreografía de carga
Cada elemento del hero lleva `data-seq="…"` y su delay vive en una sola tabla al final
de `site.css` (sección 13). La secuencia se asienta cerca de los 5s. Es deliberadamente
lenta. Si Martín pide "más rápido" o "más lento", cambia solo esa tabla.

---

## 5. Formulario de membresía

Overlay oscuro a pantalla completa (`#apply`), tres pasos: Identity → Focus → Motivation.
Barra de progreso en el borde superior del panel. Campos con subrayado que se traza,
sin cajas. Resumen antes de enviar. Recibo con número de referencia al terminar.

**Envío** (`submitApplication` en `site.js`, es el único punto que habla con un backend):
1. Si `config.application.endpoint` tiene un URL → POST JSON.
2. Si no, pero hay `config.application.email` → abre el cliente de correo del aplicante
   con todo pre-llenado.
3. Si no hay ninguno → lo dice con claridad.

**Nunca finjas que se guardó algo.** Si tocas esta función, mantén esa honestidad.

---

## 6. Pendientes reales (bloqueados por datos, no por código)

1. `config.application.email` — hoy `yhcic@yhc.edu`, es placeholder.
2. `config.application.endpoint` — Formspree / Netlify Forms / API propia.
3. `config.social.groupMe.href` y `config.social.instagram.href` — URLs reales.
   Hasta entonces el botón "Stay connected" no hace nada a propósito.
4. `config.market.isLive` — poner `true` solo cuando haya un API de cotizaciones real.
   Mientras sea `false` el panel se etiqueta *Illustrative*, y eso es correcto.
5. Secciones Goals / Projects / Members — los datos ya están en `config.js`
   (`goals`, `projects`, `members`), falta el markup. En el menú salen como "Soon".

---

## 7. Cómo verificar antes de dar algo por terminado

No hay tests. La verificación es visual y manual:

- Abrir en 390px, 768px y 1440px. **Cero scroll horizontal** en los tres.
- Consola sin errores.
- La coreografía del hero completa sin quedar nada invisible.
- El header se queda fijo y toma el fondo glass al bajar.
- El formulario: avanzar los tres pasos, probar validación con campos vacíos.
- Con `prefers-reduced-motion` activado, todo visible y sin animación.

Si tienes Playwright disponible, un script de screenshots a esos tres anchos es
la forma más rápida de revisar.

---

## 8. Cómo trabaja Martín

- Responde en español. El contenido del sitio va en inglés.
- Quiere crítica directa, no complacencia. Si algo se ve genérico, dilo y propón la alternativa.
- Antes de entregar, pregúntate: *¿esto se ve básico o genérico?* Si sí, rediséñalo.
- Cuando entregue una referencia visual o un archivo de código, es la fuente de verdad.
  Impleméntala tal cual antes de proponer mejoras encima.
- Mejor pocas secciones bien resueltas que una página infinita.
