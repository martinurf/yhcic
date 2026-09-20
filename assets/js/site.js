/* ============================================================
   YHCIC — interface behaviour
   Market scene · fixed header · choreography · application
   ============================================================ */
(function () {
  "use strict";

  var C = window.YHCIC || {};
  var root = document.documentElement;
  var NS = "http://www.w3.org/2000/svg";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m];
  }); };

  /* ---------------------------------------------------------
     1. MARKET BOARD + MENU
     --------------------------------------------------------- */
  function linePath(vals, w, h) {
    if (!vals || !vals.length) return "";
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    var span = (hi - lo) || 1, step = w / (vals.length - 1);
    return vals.map(function (v, i) {
      return (i ? "L" : "M") + (i * step).toFixed(1) + " " + (h - ((v - lo) / span) * h).toFixed(1);
    }).join(" ");
  }

  function renderBoard() {
    var body = $("#boardTable tbody"), tag = $("#boardTag");
    var m = C.market || { rows: [] };
    if (!body) return;
    var live = !!(m.isLive && m.apiKey);
    if (tag) tag.textContent = live ? "Live" : "Illustrative";
    body.innerHTML = (m.rows || []).map(function (r) {
      var neg = r.dir === -1;
      return '<tr>' +
        '<td class="board__sym">' + esc(r.symbol) + '</td>' +
        '<td class="board__val">' + esc(r.value) + '</td>' +
        '<td class="board__spk"><svg viewBox="0 0 54 14" aria-hidden="true"><path d="' + linePath(r.spark, 54, 12) + '" class="' + (neg ? "is-neg" : "") + '"/></svg></td>' +
        '<td class="board__chg' + (neg ? " is-neg" : "") + '">' + esc(r.change) + '</td>' +
        '</tr>';
    }).join("");
  }

  /* ---- live quotes (Finnhub) ---------------------------------
     Only runs when isLive is true AND an apiKey is set — otherwise
     the board stays exactly as configured, labelled Illustrative.
     On any fetch failure a row silently keeps its last known value;
     the board never shows a broken or fake number. */
  var LIVE_TIMER = null;

  function fmtPrice(n) {
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* one call to our own read-only proxy — it holds the Finnhub key now,
     never this file. One request for every row instead of one per row,
     so there's no per-row race to guard against anymore either. */
  function fetchQuotes(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); });
  }

  function startLiveMarket() {
    var m = C.market || {};
    if (!(m.isLive && m.proxyUrl && (m.rows || []).length)) return;

    function tick() {
      fetchQuotes(m.proxyUrl).then(function (data) {
        var byTicker = {};
        (data.quotes || []).forEach(function (q) { byTicker[q.symbol] = q; });
        m.rows.forEach(function (row) {
          var q = row.ticker && byTicker[row.ticker];
          if (!q || !q.ok || typeof q.price !== "number" || !q.price) return;
          row.value = fmtPrice(q.price);
          row.dir = (q.changePercent || 0) < 0 ? -1 : 1;
          row.change = ((q.changePercent || 0) >= 0 ? "+" : "") + (q.changePercent || 0).toFixed(2) + "%";
          row.spark = (row.spark || []).concat([q.price]).slice(-10);
        });
        renderBoard();
      }).catch(function () { /* keep last known values — never fake a tick */ });
    }
    tick();
    if (LIVE_TIMER) clearInterval(LIVE_TIMER);
    LIVE_TIMER = setInterval(tick, Math.max(20000, m.refreshMs || 60000));
  }

  function menuIndices() {
    $$(".menu__nav a, .menu__nav .soon").forEach(function (a, i) { a.style.setProperty("--i", i + 1); });
    var meta = $(".menu__meta");
    if (meta) meta.textContent = "YHCIC / " + ((C.club && C.club.year) || "2026") + " — " + ((C.club && C.club.location) || "");
  }

  /* ---------------------------------------------------------
     1b. STAY CONNECTED — GroupMe + Instagram, from config.social.
     A link only goes live once its href is real and placeholder
     is false. Until then it renders inert with an honest label —
     same rule as the application form: never fake a connection. */
  var STAY_ICONS = {
    groupMe: '<svg viewBox="0 0 24 24"><path d="M4 6.4C4 5.1 5.1 4 6.4 4h11.2C18.9 4 20 5.1 20 6.4v7.2c0 1.3-1.1 2.4-2.4 2.4H10l-4.6 3.7v-3.7h0C4 16 4 14.9 4 13.6V6.4Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4.4"/><circle cx="12" cy="12" r="4"/><circle cx="16.6" cy="7.4" r=".6" fill="currentColor" stroke="none"/></svg>'
  };

  function buildStayConnected() {
    var list = $("#stayPopList"); if (!list) return;
    var S = C.social || {};
    var order = ["groupMe", "instagram"];
    list.innerHTML = order.map(function (k) {
      var s = S[k]; if (!s) return "";
      var live = !!(s.href && !s.placeholder);
      var tag = live ? "a" : "span";
      var attrs = live
        ? ' href="' + esc(s.href) + '" target="_blank" rel="noopener noreferrer"'
        : ' aria-disabled="true"';
      var note = live ? (s.note || "") : "Link coming soon";
      return '<' + tag + ' class="staylink"' + attrs + '>' +
        '<span class="staylink__i" aria-hidden="true">' + (STAY_ICONS[k] || "") + '</span>' +
        '<span class="staylink__text">' +
          '<span class="staylink__t">' + esc(s.label || k) + '</span>' +
          '<span class="staylink__n">' + esc(note) + '</span>' +
        '</span></' + tag + '>';
    }).join("");
  }

  function wireStayConnected() {
    var btn = $("[data-stay]"), pop = $("#stayPop"); if (!btn || !pop) return;
    var scrim = $(".staypop__scrim", pop), box = $(".staypop__box", pop);
    var isOpen = false, prevFocus = null;

    function show() {
      isOpen = true; prevFocus = document.activeElement;
      pop.classList.add("open"); pop.setAttribute("aria-hidden", "false");
      btn.setAttribute("aria-expanded", "true");
      document.body.classList.add("body-lock");
      var f = box.querySelector("a, button, [tabindex]");
      if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 120);
    }
    function close() {
      isOpen = false;
      pop.classList.remove("open"); pop.setAttribute("aria-hidden", "true");
      btn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("body-lock");
      if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true });
    }

    btn.addEventListener("click", function (e) { e.stopPropagation(); isOpen ? close() : show(); });
    if (scrim) scrim.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab") return;
      var f = $$('a[href], button:not([disabled])', box).filter(function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------------------------------------------------------
     2. MARKET SCENE
     --------------------------------------------------------- */
  var POINTS = [
    [0,745], [85,665], [155,610], [220,635], [300,550],
    [370,570], [435,488], [500,499], [565,400], [625,420],
    [690,333], [760,358], [830,258], [900,276], [950,191],
    [1020,205], [1090,128], [1150,155], [1220,55], [1280,70],
    [1360,4]
  ];

  var scene = { trend: null, area: null, pts: [] };

  function scenePath(pts) {
    return pts.map(function (p, i) { return (i ? "L" : "M") + p[0] + "," + p[1].toFixed(1); }).join(" ");
  }

  function paintScene() {
    var d = scenePath(scene.pts);
    scene.trend.setAttribute("d", d);
    scene.area.setAttribute("d", d + " L1360,780 L0,780 Z");
  }

  function buildScene() {
    var chart = $(".market-bg svg");
    if (!chart) return;
    scene.trend = chart.querySelector(".trend");
    scene.area = chart.querySelector(".area");
    scene.pts = POINTS.map(function (p) { return [p[0], p[1]]; });
    paintScene();

    POINTS.slice(1, -2).forEach(function (p, index) {
      var x = p[0], y = p[1];
      var group = document.createElementNS(NS, "g");
      group.setAttribute("opacity", ".3");

      var wick = document.createElementNS(NS, "path");
      wick.setAttribute("d", "M" + x + "," + (y - 90) + "v100");
      wick.setAttribute("stroke", "#a080c5");
      wick.setAttribute("stroke-width", "2");

      var body = document.createElementNS(NS, "rect");
      body.setAttribute("x", x - 13);
      body.setAttribute("y", y - 70);
      body.setAttribute("width", "26");
      body.setAttribute("height", 35 + (index % 3) * 10);
      body.setAttribute("fill", "#9973bf");

      group.appendChild(wick); group.appendChild(body);
      chart.appendChild(group);
    });
  }

  /* after the line has drawn, it keeps breathing — never a redraw */
  function liveScene() {
    if (reduce || !scene.trend) return;
    var base = scene.pts.map(function (p) { return p[1]; });
    var tgt = base.slice();
    var running = false, visible = true;

    function retarget() {
      for (var i = 1; i < tgt.length; i++) {
        var amp = 2 + (i / tgt.length) * 8;
        tgt[i] = base[i] + (Math.random() - 0.5) * amp;
      }
      base[base.length - 1] += (Math.random() - 0.45) * 4;
      base[base.length - 1] = Math.max(-16, Math.min(38, base[base.length - 1]));
    }

    function frame() {
      if (!visible) { running = false; return; }
      var moved = false;
      for (var i = 1; i < scene.pts.length; i++) {
        var dy = tgt[i] - scene.pts[i][1];
        if (Math.abs(dy) > 0.03) { scene.pts[i][1] += dy * 0.02; moved = true; }
      }
      if (moved) paintScene();
      requestAnimationFrame(frame);
    }

    var hero = $(".hero");
    var retargetTimer = null;
    function startRetarget() { if (!retargetTimer) retargetTimer = setInterval(retarget, 4600); }
    function stopRetarget() { if (retargetTimer) { clearInterval(retargetTimer); retargetTimer = null; } }

    /* both the paint loop and the retarget interval pause once the hero
       scrolls out of view, instead of ticking for the whole life of the tab */
    if (hero && "IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        visible = e[0].isIntersecting;
        if (visible) { if (!running) { running = true; requestAnimationFrame(frame); } startRetarget(); }
        else { stopRetarget(); }
      }, { threshold: 0 }).observe(hero);
    }
    setTimeout(function () {
      scene.trend.style.animation = "none";
      scene.trend.style.strokeDasharray = "none";
      scene.trend.style.strokeDashoffset = "0";
      running = true; requestAnimationFrame(frame);
      retarget(); startRetarget();
    }, 4400);
  }

  function buildVault() {
    var p = $("#vaultLine"); if (!p) return;
    var s = 4242, r = function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
    var N = 40, v = [];
    for (var i = 0; i < N; i++) v.push(Math.sin(i / 4.2) * 18 + r() * 30 + i * 3.2);
    p.setAttribute("d", v.map(function (val, i) {
      return (i ? "L" : "M") + (i * (1200 / (N - 1))).toFixed(1) + " " + (470 - val * 0.75).toFixed(1);
    }).join(" "));
    if (reduce) return;
    var len = p.getTotalLength();
    p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    var sec = $(".vault");
    if (sec && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (e) {
        if (!e[0].isIntersecting) return;
        p.style.transition = "stroke-dashoffset 3.6s cubic-bezier(.3,.7,.2,1) .2s";
        p.style.strokeDashoffset = "0";
        io.disconnect();
      }, { threshold: 0.12 });
      io.observe(sec);
    }
  }

  /* subtle pointer / touch parallax on the whole scene */
  function parallax() {
    if (reduce) return;
    var bg = $("#marketBg"); if (!bg) return;
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null, visible = true;

    var hero = $(".hero");
    if (hero && "IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        visible = e[0].isIntersecting;
        bg.classList.toggle("is-idle", !visible); /* also pauses the CSS atmosphere animation off-screen */
      }, { threshold: 0 }).observe(hero);
    }

    function loop() {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      bg.style.transform = "translate(" + cx.toFixed(2) + "px," + cy.toFixed(2) + "px)";
      if (Math.abs(tx - cx) > 0.04 || Math.abs(ty - cy) > 0.04) raf = requestAnimationFrame(loop);
      else raf = null;
    }
    function kick() { if (visible && !raf) raf = requestAnimationFrame(loop); }

    /* skip the work entirely once the hero has scrolled out of view —
       no point computing a transform nobody can see on every pointer move */
    window.addEventListener("pointermove", function (e) {
      if (!visible) return;
      tx = (e.clientX / window.innerWidth - 0.5) * 8;
      ty = (e.clientY / window.innerHeight - 0.5) * 8;
      kick();
    }, { passive: true });
    window.addEventListener("touchmove", function (e) {
      if (!visible) return;
      var t = e.touches && e.touches[0]; if (!t) return;
      tx = (t.clientX / window.innerWidth - 0.5) * 10;
      ty = (t.clientY / window.innerHeight - 0.5) * 10;
      kick();
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     3. HEADER, PROGRESS, TOUCH
     --------------------------------------------------------- */
  function stickyHeader() {
    var head = $("#masthead"); if (!head) return;
    var raf = null;
    function upd() {
      raf = null;
      head.classList.toggle("stuck", window.scrollY > 36);
    }
    window.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    upd();
  }

  function progress() {
    var bar = $("#progressBar"); if (!bar) return;
    var raf = null;
    function upd() {
      raf = null;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = ((h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0) * 100).toFixed(2) + "%";
    }
    window.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    upd();
  }

  function cardLight() {
    if (reduce) return;
    $$(".card").forEach(function (c) {
      var raf = null, lastX = 0;
      /* batch the layout read + style write to once per frame — a raw
         pointermove can fire far more often than the screen repaints */
      c.addEventListener("pointermove", function (e) {
        lastX = e.clientX;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          var r = c.getBoundingClientRect();
          c.style.setProperty("--mx", (((lastX - r.left) / r.width) * 100).toFixed(1) + "%");
        });
      }, { passive: true });
    });
  }

  function touchFeedback() {
    $$(".card, .btn, .navbtn, .topbtn").forEach(function (el) {
      var on = function () { el.classList.add("press"); };
      var off = function () { setTimeout(function () { el.classList.remove("press"); }, 160); };
      el.addEventListener("touchstart", on, { passive: true });
      el.addEventListener("touchend", off, { passive: true });
      el.addEventListener("touchcancel", off, { passive: true });
    });
  }

  function playIntro() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        $$("[data-seq]").forEach(function (el) { el.classList.add("on"); });
      });
    });
  }

  function reveals() {
    var targets = $$(".reveal");
    $$('[data-rev="stagger"]').forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (ch, i) { ch.style.setProperty("--i", i); });
    });
    var showAll = function () { targets.forEach(function (t) { t.classList.add("in"); }); };
    if (reduce || !("IntersectionObserver" in window)) { showAll(); return; }
    /* replays every time — scroll past and back down and it comes in again,
       just as subtly, instead of only ever playing once per page load */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        en.target.classList.toggle("in", en.isIntersecting);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach(function (t) { io.observe(t); });
    /* a true worst-case fallback only — long enough that no real visitor
       scrolling at a normal pace ever hits it and gets content forced to
       its revealed state before they've scrolled there themselves; short
       enough to still guarantee nothing stays invisible if the observer
       genuinely never fires. */
    setTimeout(showAll, 20000);
  }

  /* ---------------------------------------------------------
     4. OVERLAYS
     --------------------------------------------------------- */
  var lastFocus = null;

  function openLayer(el, isMenu) {
    if (el.__hideTimer) { clearTimeout(el.__hideTimer); el.__hideTimer = null; } /* cancel a pending close from a quick close→reopen */
    lastFocus = document.activeElement;
    el.hidden = false; el.getBoundingClientRect(); el.classList.add("open");
    document.body.classList.add("body-lock");
    if (isMenu) $("#burger").setAttribute("aria-expanded", "true");
    var f = el.querySelector("a[href], button:not([hidden]), input, select, textarea");
    if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 140);
  }

  function closeLayer(el) {
    el.classList.remove("open");
    if (el.__hideTimer) clearTimeout(el.__hideTimer);
    el.__hideTimer = setTimeout(function () { el.hidden = true; el.__hideTimer = null; }, reduce ? 0 : 400);
    document.body.classList.remove("body-lock");
    $("#burger").setAttribute("aria-expanded", "false");
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function anyOpen() { return $(".menu.open") || $(".apply.open"); }

  /* if the last visit ended in a submitted receipt, put the overlay back
     to a clean, blank form before it's shown again — never open on a
     stale reference number and someone else's old answers. */
  function resetApply() {
    var form = $("#applyForm"), done = $("#applyDone");
    if (!form || !done || done.hidden) return;
    form.reset();
    $$(".fld__e", form).forEach(function (p) { p.textContent = ""; });
    $$('[aria-invalid="true"]', form).forEach(function (i) { i.removeAttribute("aria-invalid"); });
    var status = $("#applyStatus"); if (status) { status.textContent = ""; status.removeAttribute("data-tone"); }
    form.hidden = false; done.hidden = true;
    REF = makeRef();
  }

  function wireOverlays() {
    var menu = $("#menu"), burger = $("#burger"), apply = $("#apply");

    burger.addEventListener("click", function () {
      if (menu.classList.contains("open")) closeLayer(menu); else openLayer(menu, true);
    });
    $$(".menu__nav a").forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (a.hasAttribute("data-apply")) {
          e.preventDefault(); closeLayer(menu);
          setTimeout(function () { resetApply(); openLayer(apply); }, 300);
          return;
        }
        closeLayer(menu);
      });
    });
    $$("[data-apply]").forEach(function (b) {
      if (b.closest(".menu")) return;
      b.addEventListener("click", function (e) { e.preventDefault(); resetApply(); openLayer(apply); });
    });
    $$("[data-close]").forEach(function (b) {
      b.addEventListener("click", function () { closeLayer(apply); });
    });
    apply.addEventListener("mousedown", function (e) { if (e.target === apply) closeLayer(apply); });

    var top = $("[data-top]");
    if (top) top.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });

    document.addEventListener("keydown", function (e) {
      var open = anyOpen(); if (!open) return;
      if (e.key === "Escape") { closeLayer(open); return; }
      if (e.key !== "Tab") return;
      var f = $$('a[href], button:not([disabled]):not([hidden]), input:not([type="hidden"]), select, textarea', open)
        .filter(function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------------------------------------------------------
     5. APPLICATION — three steps, honest submission
     --------------------------------------------------------- */
  var REF = "";

  function makeRef() {
    var y = (C.club && C.club.year) || "2026";
    var n = String(Math.floor(1000 + Math.random() * 8999));
    return y + "-" + n;
  }

  function buildApply() {
    var A = C.application || {};
    REF = makeRef();

    var sel = $("#a-year");
    if (sel) {
      sel.innerHTML = '<option value="">Select a year</option>' +
        (A.graduationYears || []).map(function (y) { return '<option value="' + esc(y) + '">' + esc(y) + '</option>'; }).join("");
    }
    var src = $("#a-src");
    if (src) {
      src.innerHTML = '<option value="">Prefer not to say</option>' +
        (A.referralSources || []).map(function (s) { return '<option value="' + esc(s) + '">' + esc(s) + '</option>'; }).join("");
    }
  }

  function setErr(id, msg) {
    var p = $('[data-err="' + id + '"]'), input = document.getElementById(id);
    if (p) p.textContent = msg || "";
    if (input) { if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid"); }
    return !msg;
  }

  function collect() {
    return {
      ref: REF,
      name: $("#a-name").value.trim(),
      email: $("#a-email").value.trim(),
      gradYear: $("#a-year").value,
      major: $("#a-major").value.trim(),
      referral: $("#a-src").value,
      experience: $("#a-exp").value.trim(),
      phone: $("#a-phone").value.trim(),
      submittedAt: new Date().toISOString(),
      _gotcha: $("#a-gotcha") ? $("#a-gotcha").value : ""
    };
  }

  /* single pass — every field on one page, all rules checked at once */
  function validateAll() {
    var ok = true;
    ok = setErr("a-name", $("#a-name").value.trim().length < 2 ? "Enter your full name." : "") && ok;
    ok = setErr("a-email", !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($("#a-email").value.trim()) ? "Enter a valid email address." : "") && ok;
    ok = setErr("a-year", !$("#a-year").value ? "Select a graduation year." : "") && ok;
    ok = setErr("a-major", $("#a-major").value.trim().length < 2 ? "Enter your major." : "") && ok;

    var phone = $("#a-phone").value.trim();
    if (phone && phone.replace(/[^0-9]/g, "").length < 7) ok = setErr("a-phone", "Enter a valid phone number.") && ok;
    else setErr("a-phone", "");

    return ok;
  }

  function wireApply() {
    var form = $("#applyForm"); if (!form) return;
    var status = $("#applyStatus");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if ($("#a-gotcha") && $("#a-gotcha").value) { return; } /* bot filled the honeypot — drop silently */
      if (!validateAll()) {
        status.setAttribute("data-tone", "err");
        status.textContent = "Check the highlighted fields.";
        var bad = form.querySelector('[aria-invalid="true"]');
        if (bad) bad.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        if (bad) bad.focus({ preventScroll: true });
        return;
      }
      status.removeAttribute("data-tone");
      status.textContent = "Sending…";
      var data = collect();
      submitApplication(data).then(function (res) { finish(res, data); });
    });

    function finish(res, data) {
      if (!res.ok) {
        status.setAttribute("data-tone", "err");
        status.textContent = res.message;
        return;
      }
      form.hidden = true;
      $("#doneRef").textContent = data.ref;
      $("#doneBody").textContent = res.message;
      $("#doneRows").innerHTML = [
        ["Name", data.name], ["Email", data.email],
        ["Class of", data.gradYear], ["Phone", data.phone],
        ["Filed", new Date().toLocaleString()]
      ].map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1] || "—") + "</dd></div>"; }).join("");
      $("#applyDone").hidden = false;
    }
  }

  /* --- the only place that talks to a backend ---------------
     endpoint set  → POST JSON.
     no endpoint   → open the applicant's mail client with the
                     application pre-filled. Nothing is faked.  */
  function submitApplication(data) {
    var A = C.application || {};
    if (A.endpoint) {
      return fetch(A.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return { ok: true, message: "An officer will follow up at " + data.email + " within a few days." };
      }).catch(function (err) {
        return { ok: false, message: "Submission failed (" + err.message + "). Please try again, or email " + (A.email || "the officer team") + " directly." };
      });
    }
    if (A.email) {
      var lines = [
        "YHCIC membership application — № " + data.ref, "",
        "Name: " + data.name,
        "Email: " + data.email,
        "Graduation year: " + data.gradYear,
        "Major: " + data.major,
        "Heard about us via: " + (data.referral || "—"),
        "Phone: " + (data.phone || "—"),
        "",
        "Previous experience:", data.experience || "—", "",
        "Submitted: " + new Date().toLocaleString()
      ].join("\n");
      var href = "mailto:" + A.email +
        "?subject=" + encodeURIComponent("YHCIC application № " + data.ref + " — " + data.name) +
        "&body=" + encodeURIComponent(lines);
      window.location.href = href;
      return Promise.resolve({
        ok: true,
        message: "Your email app should have opened with the application ready to send to " + A.email +
                 ". Send that message to complete your application — nothing is stored on this site yet."
      });
    }
    return Promise.resolve({
      ok: false,
      message: "No submission channel is configured yet. Set application.endpoint or application.email in config.js."
    });
  }

  /* ---------------------------------------------------------
     6. BOOT
     --------------------------------------------------------- */
  function boot() {
    renderBoard(); menuIndices(); buildStayConnected(); startLiveMarket();
    buildScene(); buildVault(); buildApply();
    wireOverlays(); wireApply(); wireStayConnected();
    stickyHeader(); progress(); cardLight(); touchFeedback(); parallax();
    reveals(); playIntro(); liveScene();
    root.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
