(function () {
  "use strict";

  var S = window.SITE;
  var $ = function (id) { return document.getElementById(id); };
  var bgm = $("bgm");
  var musicBtn = $("musicBtn");
  var resumeAfterVideo = false;

  /* ---------- Fill text from data.js ---------- */
  document.title = "For " + S.herName;
  $("gateText").textContent = S.gateText;
  $("gateBtn").textContent = S.gateButton;
  $("introTitle").textContent = S.introTitle;
  $("introMessage").textContent = S.introMessage;
  $("memTitle").textContent = S.memoriesTitle;
  $("memSub").textContent = S.memoriesSubtitle;
  $("letterTitle").textContent = S.letterTitle;
  $("signOff").textContent = S.signOff;
  $("signature").textContent = S.signature || S.yourName;

  var body = $("letterBody");
  S.letter.forEach(function (text) {
    var p = document.createElement("p");
    p.textContent = text;
    body.appendChild(p);
  });

  /* ---------- Intro background collage (photos only) ---------- */
  var bg = $("introBg");
  S.memories.filter(function (m) { return m.type === "photo"; }).slice(0, 6).forEach(function (m) {
    var img = document.createElement("img");
    img.src = m.file;
    img.alt = "";
    img.onerror = function () { img.remove(); }; // missing photo -> gradient shows through
    bg.appendChild(img);
  });

  /* ---------- Days together counter ---------- */
  function updateCounter() {
    var el = $("counter");
    if (!S.startDate) { el.hidden = true; return; }
    var start = new Date(S.startDate + "T00:00:00");
    if (isNaN(start)) { el.hidden = true; return; }
    var days = Math.floor((Date.now() - start.getTime()) / 86400000);
    el.textContent = days >= 0 ? "Together for " + days.toLocaleString() + " days" : "";
  }
  updateCounter();

  /* ---------- Memory cards ---------- */
  var grid = $("grid");
  var tilts = [-2.2, 1.6, -1, 2.4, -1.8, 1.1];

  S.memories.forEach(function (m, i) {
    var card = document.createElement("figure");
    card.className = "card";
    card.style.setProperty("--tilt", tilts[i % tilts.length] + "deg");

    var media = document.createElement("div");
    media.className = "media";

    var ph = document.createElement("div");
    ph.className = "ph";
    ph.textContent = "💜";
    media.appendChild(ph);

    if (m.type === "video") {
      var v = document.createElement("video");
      v.src = m.file;
      v.controls = true;
      v.playsInline = true;
      v.preload = "metadata";
      v.onloadedmetadata = function () { ph.remove(); };
      v.onerror = function () { v.remove(); };
      v.addEventListener("play", function () {
        if (!bgm.paused) { bgm.pause(); resumeAfterVideo = true; }
      });
      v.addEventListener("pause", function () { maybeResume(); });
      v.addEventListener("ended", function () { maybeResume(); });
      media.appendChild(v);
      var badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "Video";
      media.appendChild(badge);
    } else {
      var img = document.createElement("img");
      img.src = m.file;
      img.alt = m.message;
      img.loading = "lazy";
      img.onload = function () { ph.remove(); };
      img.onerror = function () { img.remove(); };
      media.appendChild(img);
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "Open photo: " + m.message);
      var open = function () { openLightbox(m); };
      card.addEventListener("click", open);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
    }

    var cap = document.createElement("figcaption");
    cap.className = "cap";
    cap.textContent = m.message;

    card.appendChild(media);
    card.appendChild(cap);
    if (m.date) {
      var d = document.createElement("span");
      d.className = "date";
      d.textContent = m.date;
      card.appendChild(d);
    }
    if (m.type === "video") card.style.cursor = "default";
    grid.appendChild(card);
  });

  function maybeResume() {
    if (resumeAfterVideo && !anyVideoPlaying()) {
      resumeAfterVideo = false;
      bgm.play().catch(function () {});
    }
  }
  function anyVideoPlaying() {
    return Array.prototype.some.call(document.querySelectorAll("video"), function (v) { return !v.paused && !v.ended; });
  }

  /* Reveal cards as they scroll into view */
  var io = "IntersectionObserver" in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 })
    : null;

  function observeCards() {
    document.querySelectorAll(".card:not(.in)").forEach(function (c) {
      if (io) io.observe(c); else c.classList.add("in");
    });
  }

  /* ---------- Lightbox ---------- */
  var lb = $("lightbox");
  function openLightbox(m) {
    $("lbImg").src = m.file;
    $("lbImg").alt = m.message;
    $("lbCap").textContent = m.message;
    lb.hidden = false;
    $("lbClose").focus();
  }
  function closeLightbox() { lb.hidden = true; $("lbImg").src = ""; }
  $("lbClose").addEventListener("click", closeLightbox);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !lb.hidden) closeLightbox(); });

  /* ---------- Page navigation (single page, so music never restarts) ---------- */
  var pages = ["intro", "memories", "letter"];
  function show(name) {
    if (pages.indexOf(name) === -1) name = "intro";
    pages.forEach(function (p) { $("page-" + p).classList.toggle("active", p === name); });
    document.querySelectorAll(".tab").forEach(function (t) {
      t.classList.toggle("active", t.dataset.page === name);
    });
    window.scrollTo(0, 0);
    if (name === "memories") observeCards();
    if (location.hash !== "#" + name) history.replaceState(null, "", "#" + name);
  }
  document.querySelectorAll(".tab").forEach(function (t) {
    t.addEventListener("click", function () { show(t.dataset.page); });
  });
  document.querySelectorAll("[data-go]").forEach(function (b) {
    b.addEventListener("click", function () { show(b.dataset.go); });
  });
  window.addEventListener("hashchange", function () {
    if (!$("app").classList.contains("hidden")) show(location.hash.slice(1));
  });

  /* ---------- Music ---------- */
  bgm.src = S.music;
  bgm.volume = 0.5;

  function setMusicUI() {
    var on = !bgm.paused;
    musicBtn.classList.toggle("playing", on);
    musicBtn.setAttribute("aria-pressed", String(on));
    musicBtn.setAttribute("aria-label", on ? "Pause music" : "Play music");
  }
  bgm.addEventListener("play", setMusicUI);
  bgm.addEventListener("pause", setMusicUI);
  musicBtn.addEventListener("click", function () {
    resumeAfterVideo = false;
    if (bgm.paused) bgm.play().catch(function () {}); else bgm.pause();
  });

  /* ---------- Gate: tap to open (also unlocks audio) ---------- */
  $("gateBtn").addEventListener("click", function () {
    bgm.play().catch(function () {}); // fails silently if the song file is missing
    $("gate").classList.add("leaving");
    $("app").classList.remove("hidden");
    $("topbar").classList.remove("hidden");
    setTimeout(function () { $("gate").remove(); }, 800);
    show("intro");
  });

  /* ---------- Floating hearts ---------- */
  var canvas = $("hearts");
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dots = [];
  var W = 0, H = 0;

  function resize() {
    var r = window.devicePixelRatio || 1;
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * r; canvas.height = H * r;
    ctx.setTransform(r, 0, 0, r, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  function spawn(initial) {
    return {
      x: Math.random() * W,
      y: initial ? Math.random() * H : H + 20,
      s: 10 + Math.random() * 16,
      v: 0.3 + Math.random() * 0.7,
      sway: Math.random() * Math.PI * 2,
      a: 0.25 + Math.random() * 0.35,
      c: Math.random() > 0.5 ? "255,95,168" : "184,150,242"
    };
  }
  var count = Math.min(24, Math.round(W / 40));
  for (var i = 0; i < count; i++) dots.push(spawn(true));

  function heart(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.3);
    ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
    ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s);
    ctx.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
    ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    dots.forEach(function (d, i) {
      d.y -= d.v;
      d.sway += 0.02;
      ctx.fillStyle = "rgba(" + d.c + "," + d.a + ")";
      heart(d.x + Math.sin(d.sway) * 14, d.y, d.s);
      if (d.y < -30) dots[i] = spawn(false);
    });
    requestAnimationFrame(frame);
  }
  if (!reduce) frame();
})();
