/* ============================================================
   FLUX AUTOMATIONS — shared interactions (vanilla, no deps)
   ============================================================ */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- preloader ---------- */
  window.addEventListener("load", function () {
    var pre = document.getElementById("preloader");
    if (pre) setTimeout(function () { pre.classList.add("done"); }, reduce ? 0 : 1500);
  });

  /* ---------- mouse-reactive background glow ---------- */
  if (fine && !reduce) {
    var rx = innerWidth / 2, ry = innerHeight * 0.3, cx = rx, cy = ry;
    window.addEventListener("mousemove", function (e) { rx = e.clientX; ry = e.clientY; }, { passive: true });
    (function loop() {
      cx += (rx - cx) * 0.08; cy += (ry - cy) * 0.08;
      root.style.setProperty("--mx", cx + "px");
      root.style.setProperty("--my", cy + "px");
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- custom cursor ---------- */
  if (fine && !reduce) {
    var dot = document.createElement("div"); dot.className = "cursor-dot";
    var ring = document.createElement("div"); ring.className = "cursor-ring";
    document.body.appendChild(dot); document.body.appendChild(ring);
    var mxp = innerWidth / 2, myp = innerHeight / 2, dxp = mxp, dyp = myp;
    document.addEventListener("mousemove", function (e) {
      mxp = e.clientX; myp = e.clientY;
      dot.style.transform = "translate(" + mxp + "px," + myp + "px)";
      document.body.classList.add("cursor-on");
    }, { passive: true });
    (function ringLoop() {
      dxp += (mxp - dxp) * 0.18; dyp += (myp - dyp) * 0.18;
      ring.style.transform = "translate(" + dxp + "px," + dyp + "px)";
      requestAnimationFrame(ringLoop);
    })();
    document.addEventListener("mousedown", function () { document.body.classList.add("cursor-press"); });
    document.addEventListener("mouseup", function () { document.body.classList.remove("cursor-press"); });
    document.addEventListener("mouseleave", function () { document.body.classList.remove("cursor-on"); });
    var hoverSel = "a, button, .tilt, input, textarea, .work-card, .svc-card";
    document.querySelectorAll(hoverSel).forEach(function (el) {
      el.addEventListener("mouseenter", function () { document.body.classList.add("cursor-hover"); });
      el.addEventListener("mouseleave", function () { document.body.classList.remove("cursor-hover"); });
    });
  }

  /* ---------- embers canvas ---------- */
  (function () {
    if (reduce) return;
    var c = document.getElementById("embers");
    if (!c) return;
    var ctx = c.getContext("2d"), parts = [], W, H;
    function size() { W = c.width = innerWidth; H = c.height = innerHeight; }
    size(); window.addEventListener("resize", size);
    var count = Math.min(46, Math.floor(innerWidth / 28));
    for (var i = 0; i < count; i++) {
      parts.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.8 + 0.5,
        vy: -(Math.random() * 0.4 + 0.12),
        vx: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.5 + 0.15,
        tw: Math.random() * 0.02 + 0.005
      });
    }
    (function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y += p.vy; p.x += p.vx; p.a += p.tw;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        var al = (Math.sin(p.a) * 0.4 + 0.5) * 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = "rgba(242,154,17," + al + ")";
        ctx.shadowColor = "rgba(242,154,17,0.8)";
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    })();
  })();

  /* ---------- nav: scroll state + hide on scroll down ---------- */
  var nav = document.querySelector(".nav");
  var lastY = 0;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    root.style.setProperty("--scroll", (y / (document.body.scrollHeight - innerHeight || 1)).toFixed(3));
    if (nav) {
      nav.classList.toggle("scrolled", y > 24);
      if (y > lastY && y > 300) nav.classList.add("hide");
      else nav.classList.remove("hide");
    }
    lastY = y;
  }, { passive: true });

  /* ---------- mobile nav toggle ---------- */
  var tgl = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (tgl && links) {
    tgl.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      tgl.classList.toggle("open", open);
      tgl.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { links.classList.remove("open"); tgl.classList.remove("open"); });
    });
  }

  /* ---------- active nav link ---------- */
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a.nl").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) a.classList.add("active");
  });

  /* ---------- reveal on scroll ---------- */
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
    document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll("[data-reveal]").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- count-up ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dec = (el.getAttribute("data-dec") | 0);
    if (reduce) { el.textContent = target + suffix; return; }
    var start = null, dur = 1500;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      var v = e * target;
      el.textContent = (dec ? v.toFixed(dec) : Math.floor(v).toLocaleString("en-IN")) + suffix;
      if (p < 1) requestAnimationFrame(step); else el.textContent = (dec ? target.toFixed(dec) : target.toLocaleString("en-IN")) + suffix;
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    document.querySelectorAll("[data-count]").forEach(function (el) { cio.observe(el); });
  }

  /* ---------- 3D tilt + spotlight on glass cards ---------- */
  if (fine && !reduce) {
    document.querySelectorAll(".tilt").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.transform = "perspective(900px) rotateX(" + ((0.5 - py) * 7).toFixed(2) + "deg) rotateY(" + ((px - 0.5) * 9).toFixed(2) + "deg) translateZ(0)";
        card.style.setProperty("--lx", (px * 100) + "%");
        card.style.setProperty("--ly", (py * 100) + "%");
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (fine && !reduce) {
    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + (mx * 0.28).toFixed(1) + "px," + (my * 0.32).toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------- contact form (no backend; mailto fallback) ---------- */
  var form = document.querySelector("[data-contact]");
  if (form) {
    var sendBtn = form.querySelector("[data-send]");
    sendBtn.addEventListener("click", function () {
      var name = (form.querySelector("#cf-name") || {}).value || "";
      var email = (form.querySelector("#cf-email") || {}).value || "";
      var msg = (form.querySelector("#cf-msg") || {}).value || "";
      var body = encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\n" + msg);
      var sub = encodeURIComponent("Project enquiry — Flux Automations");
      window.location.href = "mailto:info@fluxautomations.in?subject=" + sub + "&body=" + body;
    });
  }
})();
