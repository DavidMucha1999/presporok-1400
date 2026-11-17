/* ==== js/seasons.js ==== */
/* Prešporok 1400 – ročné obdobia a počasie na celej obrazovke. Autor a vývojár: Dávid Mucha. */
(function () {
  "use strict";
  var IMG = [["apr", "may"], ["jun", "jul", "aug"], ["sep", "oct"], ["dec", "jan", "feb"]];
  var LINE = [
    "Sneh sa topí, polia sa budia a vozy vyrážajú na cesty.",
    "Dlhé dni, plné trhy a zlatý jačmeň na poliach.",
    "Zber sa končí, sudy sú plné a lístie padá na ulice.",
    "Dunaj stuhne, ulice stíchnu a v peciach sa kúri."
  ];
  var origRender = render;
  var lastKey = null, lastTurn = -1;

  var cv = document.createElement("canvas");
  cv.id = "sfx"; cv.setAttribute("aria-hidden", "true");
  var ov = document.createElement("div");
  ov.id = "wxov"; ov.setAttribute("aria-hidden", "true");
  document.body.appendChild(ov); document.body.appendChild(cv);
  var ctx = cv.getContext("2d");
  var W = 0, H = 0, parts = [], mode = "", running = false, lastT = 0;

  function gfx() { try { return +kGfx(); } catch (e) { return 2; } }
  function reduced() { return window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches; }
  function size() {
    var d = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * d); cv.height = Math.round(H * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  window.addEventListener("resize", size); size();

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function make(kind, init) {
    var p = { k: kind, x: rnd(0, W), y: init ? rnd(0, H) : rnd(-40, -5), r: 0, a: rnd(0, 6.28), s: rnd(.5, 1) };
    if (kind === "petal") { p.r = rnd(3, 5.5); p.vy = rnd(18, 34); p.vx = rnd(-8, 12); p.c = Math.random() < .5 ? "#f7d6e0" : "#fff4f0"; p.va = rnd(-1.5, 1.5); }
    else if (kind === "mote") { p.y = init ? rnd(0, H) : H + 10; p.r = rnd(1, 2.4); p.vy = -rnd(6, 16); p.vx = rnd(-6, 6); p.c = "#ffe39a"; p.va = rnd(.8, 2); }
    else if (kind === "leaf") { p.r = rnd(5, 8.5); p.vy = rnd(26, 50); p.vx = rnd(-14, 18); p.c = ["#c2571f", "#a5312a", "#d89a2b", "#8a5a1f"][Math.floor(Math.random() * 4)]; p.va = rnd(-2, 2); }
    else if (kind === "snow") { p.r = rnd(1.2, 3.2); p.vy = rnd(22, 52); p.vx = rnd(-8, 8); p.c = "#ffffff"; p.va = rnd(.5, 1.4); }
    else if (kind === "rain") { p.x = rnd(-60, W); p.r = rnd(9, 16); p.vy = rnd(560, 760); p.vx = -90; p.c = "#cfe0f2"; }
    return p;
  }
  var COUNT = { petal: 26, mote: 24, leaf: 30, snow: 64, rain: 90 };
  function setMode(m) {
    if (m === mode) return;
    mode = m; parts = [];
    if (!m) return;
    var n = COUNT[m]; if (gfx() === 1) n = Math.round(n * .5);
    for (var i = 0; i < n; i++) parts.push(make(m, true));
  }
  function draw(p) {
    ctx.save(); ctx.translate(p.x, p.y);
    if (p.k === "rain") {
      ctx.globalAlpha = .38; ctx.strokeStyle = p.c; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(p.vx * .02, -p.r); ctx.stroke();
    } else if (p.k === "snow") {
      ctx.globalAlpha = .55 + .3 * p.s; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(0, 0, p.r, 0, 6.283); ctx.fill();
    } else if (p.k === "mote") {
      ctx.globalAlpha = .25 + .35 * Math.abs(Math.sin(p.a)); ctx.fillStyle = p.c; ctx.shadowColor = "#ffd36a"; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(0, 0, p.r, 0, 6.283); ctx.fill();
    } else {
      ctx.rotate(p.a); ctx.globalAlpha = .82; ctx.fillStyle = p.c;
      ctx.beginPath();
      if (p.k === "petal") ctx.ellipse(0, 0, p.r, p.r * .55, 0, 0, 6.283);
      else { ctx.moveTo(-p.r, 0); ctx.quadraticCurveTo(0, -p.r * .9, p.r, 0); ctx.quadraticCurveTo(0, p.r * .9, -p.r, 0); }
      ctx.fill();
    }
    ctx.restore();
  }
  function frame(t) {
    if (!running) return;
    var dt = Math.min(.05, (t - lastT) / 1000 || .016); lastT = t;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.y += p.vy * dt; p.x += (p.vx + (p.k === "rain" ? 0 : Math.sin(p.a) * 12)) * dt;
      if (p.va) p.a += p.va * dt;
      var out = p.k === "mote" ? p.y < -10 : p.y > H + 12 || p.x > W + 40 || p.x < -80;
      if (out) { parts[i] = make(p.k, false); if (p.k === "rain") parts[i].y = rnd(-80, -5); }
      else draw(p);
    }
    requestAnimationFrame(frame);
  }
  function run(on) {
    if (on && !running) { running = true; lastT = performance.now(); requestAnimationFrame(frame); }
    if (!on && running) { running = false; ctx.clearRect(0, 0, W, H); }
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) running = false; else sync(); });

  function sync() {
    var on = !!S && gfx() > 0 && !reduced() && !document.hidden;
    document.body.dataset.season = S ? String(S.season) : "";
    var w = S ? weatherOf() : "";
    document.body.dataset.wx = w;
    ov.className = S && gfx() > 0 ? (w || "clear") : "";
    if (!on) { setMode(""); run(false); return; }
    var m = w === "rain" ? "rain" : ["petal", "mote", "leaf", "snow"][S.season];
    if (w === "fog" && S.season === 3) m = "snow";
    setMode(m); run(true);
  }

  function banner() {
    var se = S.season, set = IMG[se], img = set[(S.turn + S.year) % set.length];
    var old = document.querySelector(".sbn"); if (old) old.remove();
    var w = weatherOf(), wn = (typeof WEATHERN !== "undefined" && WEATHERN[w]) || "jasno";
    var d = document.createElement("div");
    d.className = "sbn s" + se; d.setAttribute("role", "status");
    d.innerHTML = '<div class="sbn-bg" style="background-image:url(img/' + img + '.jpg)"></div><div class="sbn-in">' +
      '<div class="sbn-pic"><img alt="" src="img/' + img + '.jpg"></div>' +
      '<div class="sbn-tx"><p class="sbn-k">Anno Domini ' + ROMAN(S.year) + '</p><h2>' + SEASONS[se] + " roku " + S.year + '</h2>' +
      '<p class="sbn-l">' + LINE[se] + '</p><p class="sbn-w">počasie: ' + wn + "</p></div></div>";
    document.body.appendChild(d);
    var gone = function () { if (!d.parentNode) return; d.classList.add("out"); setTimeout(function () { d.remove(); }, 650); };
    d.addEventListener("click", gone);
    setTimeout(gone, 2600);
  }

  function bar() {
    var top = document.querySelector(".top");
    if (top && !top.querySelector(".sbar")) { var b = document.createElement("div"); b.className = "sbar"; b.setAttribute("aria-hidden", "true"); top.appendChild(b); }
  }

  render = function () {
    origRender();
    if (S) {
      bar();
      var key = String(S.slot || 0);
      var same = lastKey === key && lastTurn >= 0;
      if (same && S.turn > lastTurn && gfx() > 0 && !reduced() && S.turn - lastTurn === 1) banner();
      lastKey = key; lastTurn = S.turn;
    } else { lastKey = null; lastTurn = -1; }
    sync();
  };
  sync();
})();

;
