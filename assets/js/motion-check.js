/* Runs before paint so the choreography never flashes then freezes.
   Extracted from an inline <script> so the page can ship a strict CSP
   with no 'unsafe-inline' on script-src. */
(function () {
  try {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.className += " anim";
    }
  } catch (e) {}
})();

/* Clickjacking guard: the real fix is the X-Frame-Options / CSP
   frame-ancestors HTTP header set at the host (see vercel.json — active
   once deployed there). A <meta> CSP tag cannot carry frame-ancestors,
   so this is the fallback while the site is hosted somewhere that
   doesn't send that header yet: if we're ever loaded inside a frame,
   break out of it instead of rendering silently framed. */
(function () {
  try {
    if (window.top !== window.self) window.top.location = window.self.location.href;
  } catch (e) {}
})();
