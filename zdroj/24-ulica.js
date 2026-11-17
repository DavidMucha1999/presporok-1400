/* ==== js/ulica.js ==== */
/* Prešporok 1400 – detaily mapy mesta: rôzni ľudia, scénky pri dielňach, mlyny, ročné obdobia, popisky. Autor: Dávid Mucha. */
(function () {
  "use strict";
  var INK = "#2b2117", MILL = new WeakMap();
  function hash(n) { var x = Math.sin(n * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); }
  function tri(v) { v = ((v % 2) + 2) % 2; return v < 1 ? v : 2 - v; }
  function low() { try { return typeof kGfx === "function" && kGfx() < 2; } catch (e) { return false; } }
  function wcL(p, L) { return [(p[0] - L.cx) / 10, (p[1] - L.cy) / 10]; }
  function ptAt(r, u) { var segs = r.length - 1, si = Math.min(segs - 1, Math.floor(u * segs)), f = u * segs - si; return [r[si][0] + (r[si + 1][0] - r[si][0]) * f, r[si][1] + (r[si + 1][1] - r[si][1]) * f]; }
  function dseg(x, y, a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2)); return Math.hypot(x - (a[0] + dx * t), y - (a[1] + dy * t)); }
  function dpath(x, y, pts) { var m = 1e9; for (var i = 1; i < pts.length; i++) m = Math.min(m, dseg(x, y, pts[i - 1], pts[i])); return m; }

  /* ---------- postavy rôznych stavov ---------- */
  var COL = ["#2f5bb0", "#b8362c", "#6d3f92", "#7a4d23", "#2f7d46", "#a07040", "#3a5a7a", "#8a3a2a"];
  function person(g, x, y, o) {
    var t = o.t || 0, k = o.k, c = o.c || "#6d3f92", s = o.s || 1, ph = o.ph || 0, mv = !!o.walk;
    var w = mv ? Math.sin(t * 9 + ph) * 1.7 : 0, bob = mv ? Math.abs(Math.sin(t * 9 + ph)) * .8 : Math.sin(t * 1.6 + ph) * .25;
    g.save(); g.translate(x, y); g.scale((o.dir || 1) * s, s); g.lineWidth = .9; g.lineJoin = "round"; g.strokeStyle = INK;
    g.fillStyle = "rgba(30,20,10,.25)"; g.beginPath(); g.ellipse(0, 1, 5, 1.8, 0, 0, 7); g.fill();
    if (k === "beggar") {
      g.fillStyle = "#7a6a58"; g.beginPath(); g.ellipse(0, -4, 4.6, 4, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = "#e8c4a0"; g.beginPath(); g.arc(0, -10, 2.5, 0, 7); g.fill(); g.stroke();
      g.fillStyle = "#5a4a3a"; g.beginPath(); g.arc(0, -11.6, 2.8, Math.PI, 0); g.fill();
      g.fillStyle = "#8a6a3a"; g.beginPath(); g.ellipse(6, -1, 2.4, 1.1, 0, 0, 7); g.fill(); g.stroke();
      g.strokeStyle = "#e8c4a0"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(3, -6); g.lineTo(5.5 + Math.sin(t * 2 + ph) * .8, -3); g.stroke();
      g.restore(); return;
    }
    var fem = k === "woman" || k === "noblew";
    g.strokeStyle = "#3a2a1a"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-1.2, -4); g.lineTo(-1.2 + w, 0); g.moveTo(1.2, -4); g.lineTo(1.2 - w, 0); g.stroke();
    g.strokeStyle = INK; g.lineWidth = .9;
    var hb = fem || k === "monk" ? -2 : -3.5;
    if (k === "merchant") { g.fillStyle = "#8a6a3a"; g.fillRect(-7, -15 - bob, 4.4, 7.5); g.strokeRect(-7, -15 - bob, 4.4, 7.5); }
    if (k === "farmer") { g.fillStyle = "#c9b27a"; g.beginPath(); g.ellipse(-4.6, -13 - bob, 3.4, 2.6, 0, 0, 7); g.fill(); g.stroke(); }
    g.fillStyle = c; g.beginPath(); g.moveTo(-2.7, -14 - bob); g.quadraticCurveTo(-4.6, -8, fem || k === "monk" ? -4.8 : -4, hb); g.lineTo(fem || k === "monk" ? 4.8 : 4, hb); g.quadraticCurveTo(4.6, -8, 2.7, -14 - bob); g.closePath(); g.fill(); g.stroke();
    /* ruky */
    g.strokeStyle = c; g.lineWidth = 2; g.lineCap = "round";
    var arm = mv ? Math.sin(t * 9 + ph + 3) * 2 : 0;
    g.beginPath(); g.moveTo(-2.5, -13 - bob); g.lineTo(-4 + arm * .3, -7.5); g.moveTo(2.5, -13 - bob); g.lineTo(4 - arm * .3, -7.5); g.stroke(); g.lineCap = "butt";
    g.strokeStyle = INK; g.lineWidth = .9;
    /* hlava */
    g.fillStyle = o.skin || "#e8c4a0"; g.beginPath(); g.arc(0, -17 - bob, 2.6, 0, 7); g.fill(); g.stroke();
    if (k === "monk") {
      g.fillStyle = "#5a3d24"; g.beginPath(); g.arc(0, -17 - bob, 3.1, Math.PI * .95, Math.PI * 2.05); g.arc(0, -17 - bob, 1.5, Math.PI * 2.05, Math.PI * .95, true); g.fill();
      g.strokeStyle = "#f2ecda"; g.lineWidth = 1; g.beginPath(); g.moveTo(-4.2, -9); g.lineTo(4.2, -9); g.stroke(); g.strokeStyle = INK;
    } else if (k === "merchant") {
      g.fillStyle = "#7a5a30"; g.beginPath(); g.ellipse(0, -19.4 - bob, 4.8, 1.5, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(0, -19.6 - bob, 2.3, Math.PI, 0); g.fill(); g.stroke();
      g.strokeStyle = "#5a3a20"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(6, -4); g.lineTo(7, -17); g.stroke();
    } else if (k === "guard") {
      g.fillStyle = "#8a909c"; g.beginPath(); g.arc(0, -17.8 - bob, 3, Math.PI, 0); g.fill(); g.stroke();
      g.strokeStyle = "#5a4a3a"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(6, 0); g.lineTo(6, -28); g.stroke();
      g.fillStyle = "#cfd6de"; g.beginPath(); g.moveTo(5, -28); g.lineTo(6, -33); g.lineTo(7, -28); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = o.dc || "#b8362c"; g.fillRect(-2.2, -12 - bob, 4.4, 5);
    } else if (k === "noble" || k === "noblew") {
      g.fillStyle = fem ? "#e8e0c8" : "#2a2a44"; g.beginPath(); g.ellipse(0, -19.2 - bob, 3.6, 1.6, 0, 0, 7); g.fill(); g.stroke();
      g.strokeStyle = "#c9971a"; g.lineWidth = 1; g.beginPath(); g.moveTo(1.5, -20 - bob); g.quadraticCurveTo(6, -26, 7, -20); g.stroke();
      g.strokeStyle = "#e3be4f"; g.beginPath(); g.moveTo(-2.4, -12); g.lineTo(2.4, -12); g.stroke();
    } else if (k === "farmer") {
      g.fillStyle = "#d8c070"; g.beginPath(); g.ellipse(0, -19 - bob, 5, 1.5, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(0, -19.2 - bob, 2.3, Math.PI, 0); g.fill(); g.stroke();
      g.strokeStyle = "#6b4a2a"; g.lineWidth = 1.1; g.beginPath(); g.moveTo(6, 0); g.lineTo(6, -24); g.moveTo(4.4, -24); g.lineTo(7.6, -24); g.stroke();
    } else if (k === "woman") {
      g.fillStyle = "#f4efe2"; g.beginPath(); g.arc(0, -17.4 - bob, 3, Math.PI * .85, Math.PI * 2.15); g.fill(); g.stroke();
      g.strokeStyle = "#8a6a3a"; g.lineWidth = 1.4; g.beginPath(); g.arc(4.6, -7, 3, 0, Math.PI); g.stroke();
    } else if (k === "child") {
      g.fillStyle = "#6a4a2a"; g.beginPath(); g.arc(0, -18 - bob, 2.9, Math.PI, 0); g.fill();
    } else if (k === "musician") {
      g.fillStyle = "#a5312a"; g.beginPath(); g.moveTo(-2.4, -19 - bob); g.lineTo(2, -19 - bob); g.lineTo(0, -23.4 - bob); g.fill(); g.stroke();
      g.fillStyle = "#b8842a"; g.beginPath(); g.ellipse(3.4, -9, 3, 2.2, -.6, 0, 7); g.fill(); g.stroke();
      g.strokeStyle = "#5a3a20"; g.lineWidth = 1.1; g.beginPath(); g.moveTo(5, -10.4); g.lineTo(9, -15); g.stroke();
      g.fillStyle = INK; g.font = "700 7px Georgia,serif"; g.textAlign = "center";
      for (var n = 0; n < 2; n++) { var u = ((t * .5 + n * .5 + ph) % 1); g.globalAlpha = 1 - u; g.fillText(n ? "♫" : "♪", 8 + Math.sin(u * 6 + n) * 3, -18 - u * 18); }
      g.globalAlpha = 1;
    } else {
      g.fillStyle = "#5a3d24"; g.beginPath(); g.arc(0, -18 - bob, 2.8, Math.PI, 0); g.fill();
    }
    g.restore();
  }

  /* ---------- scénky pri dielňach (obrazovkové súradnice) ---------- */
  function spark(g, x, y, t, n, col) {
    for (var i = 0; i < n; i++) {
      var u = (t * 1.6 + i / n) % 1, a = hash(i * 7 + Math.floor(t * 1.6 + i / n) * 3) * 6.28;
      g.fillStyle = "rgba(" + col + "," + (1 - u) + ")"; g.beginPath(); g.arc(x + Math.cos(a) * u * 9, y - u * 9 + u * u * 7, 1 + (1 - u) * .8, 0, 7); g.fill();
    }
  }
  function crate(g, x, y, w, h, c) { g.fillStyle = c || "#a47c4c"; g.fillRect(x - w / 2, y - h, w, h); g.strokeRect(x - w / 2, y - h, w, h); g.beginPath(); g.moveTo(x - w / 2, y - h); g.lineTo(x + w / 2, y); g.stroke(); }
  function barrel(g, x, y, c) { g.fillStyle = c || "#8a5a32"; g.beginPath(); g.ellipse(x, y - 3.5, 3.4, 4.6, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x - 3.4, y - 5.5); g.lineTo(x + 3.4, y - 5.5); g.moveTo(x - 3.4, y - 1.8); g.lineTo(x + 3.4, y - 1.8); g.stroke(); }
  function workScene(g, ty, x, y, t, lvl, night, seed, dir, mine) {
    g.save(); g.lineWidth = .9; g.strokeStyle = INK; g.lineJoin = "round";
    var P = function (k, px, py, extra) { person(g, x + px * dir, y + py, Object.assign({ k: k, t: t, ph: seed, dir: -dir, s: .95 }, extra || {})); };
    if (ty === "kovac") {
      g.fillStyle = "#3a3a42"; g.beginPath(); g.moveTo(x - 4, y - 5); g.lineTo(x + 5, y - 5); g.lineTo(x + 3, y - 3); g.lineTo(x + 2, y); g.lineTo(x - 2, y); g.lineTo(x - 3, y - 3); g.closePath(); g.fill(); g.stroke();
      P("farmer", -8, 0, { c: "#5a3a2a", walk: false });
      g.strokeStyle = "#6a6a74"; g.lineWidth = 1.6; var a = Math.sin(t * 7 + seed) * .7; g.beginPath(); g.moveTo(x - 5 * dir, y - 11); g.lineTo(x - 1 * dir, y - 11 - 7 * (a > 0 ? a : 0) - 1); g.stroke();
      if (Math.sin(t * 7 + seed) < -.5 || true) spark(g, x, y - 6, t + seed, night ? 8 : 5, "255,180,60");
      if (night) { var gr = g.createRadialGradient(x, y - 6, 1, x, y - 6, 26); gr.addColorStop(0, "rgba(255,150,50,.5)"); gr.addColorStop(1, "rgba(255,150,50,0)"); g.fillStyle = gr; g.fillRect(x - 26, y - 32, 52, 52); }
    } else if (ty === "pekar") {
      g.fillStyle = "#a47c4c"; g.fillRect(x - 6, y - 7, 12, 2.4); g.strokeRect(x - 6, y - 7, 12, 2.4); g.fillRect(x - 5, y - 5, 1.6, 5); g.fillRect(x + 4, y - 5, 1.6, 5);
      for (var i = 0; i < 4; i++) { g.fillStyle = "#e4b56a"; g.beginPath(); g.ellipse(x - 4.2 + i * 2.8, y - 8.6, 1.6, 1.1, 0, 0, 7); g.fill(); g.stroke(); }
      P("woman", 10, 0, { c: "#f0ead8" });
      for (var j = 0; j < 3; j++) { var u = (t * .4 + j / 3) % 1; g.fillStyle = "rgba(255,255,255," + (.5 * (1 - u)) + ")"; g.beginPath(); g.arc(x - 2 + j * 2 + Math.sin(u * 5) * 2, y - 11 - u * 12, 1.4 + u * 2.4, 0, 7); g.fill(); }
    } else if (ty === "krcma") {
      g.fillStyle = "#8a5a32"; g.beginPath(); g.ellipse(x, y - 6, 8, 3.4, 0, 0, 7); g.fill(); g.stroke(); g.fillRect(x - 1, y - 6, 2, 6);
      P("merchant", -8, 0, { c: "#8a3a2a" }); P("farmer", 8, 0, { c: "#5a6a3a" });
      g.fillStyle = "#e3be4f"; g.fillRect(x - 3, y - 10, 2.2, 3); g.fillRect(x + 2, y - 10, 2.2, 3);
      barrel(g, x + 14 * dir, y, "#8a5a32");
      if (night) { g.fillStyle = "rgba(255,200,110,.35)"; g.beginPath(); g.arc(x, y - 8, 22, 0, 7); g.fill(); }
    } else if (ty === "tkac") {
      g.strokeStyle = "#6b4a2a"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 14, y); g.lineTo(x - 14, y - 18); g.moveTo(x + 14, y); g.lineTo(x + 14, y - 18); g.stroke();
      g.lineWidth = .8; g.beginPath(); g.moveTo(x - 14, y - 17); g.lineTo(x + 14, y - 17); g.stroke();
      [["#b8362c", -9], ["#2f5bb0", -2], ["#e3be4f", 5], ["#6d3f92", 11]].forEach(function (cc, i) { var sw = Math.sin(t * 2.2 + i) * 1.4; g.fillStyle = cc[0]; g.beginPath(); g.moveTo(x + cc[1] - 3, y - 17); g.lineTo(x + cc[1] + 3, y - 17); g.lineTo(x + cc[1] + 3 + sw, y - 6); g.lineTo(x + cc[1] - 3 + sw, y - 6); g.closePath(); g.fill(); g.stroke(); });
    } else if (ty === "lekaren") {
      g.strokeStyle = "#6b4a2a"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 12, y - 18); g.lineTo(x + 6, y - 18); g.stroke();
      for (var h = 0; h < 5; h++) { g.fillStyle = ["#5fa86a", "#8cc464", "#c9d4a0"][h % 3]; g.beginPath(); g.moveTo(x - 11 + h * 3.6, y - 18); g.lineTo(x - 13 + h * 3.6, y - 9); g.lineTo(x - 9 + h * 3.6, y - 9); g.closePath(); g.fill(); g.stroke(); }
      P("monk", 12, 0, { c: "#e8e2d0" });
      g.fillStyle = "#c9c0b0"; g.beginPath(); g.arc(x + 4, y - 3, 2.8, 0, Math.PI); g.fill(); g.stroke();
    } else if (ty === "hrnciar") {
      [[0, 0], [6, 0], [3, -5]].forEach(function (p, i) { g.fillStyle = ["#c9774a", "#b85a3a", "#d8a070"][i]; g.beginPath(); g.ellipse(x + p[0] - 6, y + p[1] - 4, 3.4, 3.8, 0, 0, 7); g.fill(); g.stroke(); });
      P("farmer", 10, 0, { c: "#9a6a3a" });
    } else if (ty === "tesar") {
      for (var q = 0; q < 4; q++) { g.fillStyle = "#c9a468"; g.fillRect(x - 14, y - 2 - q * 2.2, 14, 2); g.strokeRect(x - 14, y - 2 - q * 2.2, 14, 2); }
      P("farmer", 8, 0, { c: "#7a5a30" });
      g.strokeStyle = "#8a8a94"; g.lineWidth = 1.6; var sw2 = Math.sin(t * 5 + seed) * 3; g.beginPath(); g.moveTo(x + 4 * dir + sw2, y - 8); g.lineTo(x + 10 * dir + sw2, y - 8); g.stroke();
    } else if (ty === "garbiar") {
      g.strokeStyle = "#6b4a2a"; g.lineWidth = 1.4; g.strokeRect(x - 10, y - 17, 20, 14); g.fillStyle = "#c9a070"; g.fillRect(x - 8, y - 15, 16, 10); g.strokeRect(x - 8, y - 15, 16, 10);
      P("farmer", 16, 0, { c: "#6a4a2a" });
    } else if (ty === "zlatnik") {
      P("guard", -9, 0, { dc: "#e3be4f" }); crate(g, x + 6, y, 8, 6, "#6a4a2a");
      var sp = (Math.sin(t * 3 + seed) + 1) / 2; g.fillStyle = "rgba(255,240,150," + sp + ")"; g.beginPath(); g.arc(x + 6, y - 8, 1 + sp * 1.6, 0, 7); g.fill();
    } else if (ty === "vinar") {
      barrel(g, x - 9, y); barrel(g, x - 3, y); barrel(g, x - 6, y - 7); barrel(g, x + 6, y); P("merchant", 14, 0, { c: "#6d3f92" });
    } else if (ty === "pisaren") {
      g.fillStyle = "#8a5a32"; g.fillRect(x - 6, y - 8, 12, 2.4); g.strokeRect(x - 6, y - 8, 12, 2.4); g.fillRect(x - 5, y - 6, 1.6, 6); g.fillRect(x + 4, y - 6, 1.6, 6);
      g.fillStyle = "#f4efe2"; g.fillRect(x - 3, y - 11, 6, 3); g.strokeRect(x - 3, y - 11, 6, 3);
      P("monk", 10, 0, { c: "#3a4a7a" });
    } else if (ty === "kupec") {
      crate(g, x - 10, y, 7, 6); crate(g, x - 3, y, 8, 7, "#b88a4a"); g.fillStyle = "#d8c8a0"; g.beginPath(); g.ellipse(x + 6, y - 4, 3.6, 4.4, 0, 0, 7); g.fill(); g.stroke();
      P("noble", 14, 0, { c: "#2a5a8a" });
    } else if (ty === "brloh" || ty === "pasovanie") {
      if (night) { P("monk", 0, 0, { c: "#2a2a30", skin: "#b89a80" }); }
    }
    if (lvl >= 3 && ty !== "brloh") crate(g, x + 22 * dir, y, 7, 6, "#9a7440");
    g.restore();
  }

  /* ---------- ročné obdobia ---------- */
  function seasonFX(g, t, C, W, H) {
    var se = C.st.season | 0, wx = C.st.wx, ph = C.st.ph;
    if (wx === "dazd" || wx === "sneh") return;
    var n = 26;
    g.save();
    if (se === 0) { g.fillStyle = "rgba(250,205,215,.85)"; for (var i = 0; i < n; i++) { var x = ((i * 157 + t * 14 + Math.sin(t * .8 + i) * 18) % (W + 40) + W + 40) % (W + 40) - 20, y = (i * 83 + t * 22) % (H + 40) - 20; g.beginPath(); g.ellipse(x, y, 2.4, 1.3, t + i, 0, 7); g.fill(); } }
    else if (se === 2) { var lc = ["#c9782a", "#b85a22", "#d8a030", "#8a4a22"]; for (var j = 0; j < n; j++) { var x2 = ((j * 173 + t * 22 + Math.sin(t * .9 + j) * 26) % (W + 40) + W + 40) % (W + 40) - 20, y2 = (j * 97 + t * 34) % (H + 40) - 20; g.fillStyle = lc[j % 4]; g.beginPath(); g.ellipse(x2, y2, 3.2, 1.8, t * 1.5 + j, 0, 7); g.fill(); } }
    else if (se === 1) {
      if (ph >= 2) { for (var f = 0; f < 22; f++) { var fx = (f * 211 + Math.sin(t * .5 + f * 2) * 40) % W, fy = 300 + (f * 131) % 900 + Math.cos(t * .6 + f) * 20, a = (Math.sin(t * 2 + f * 3) + 1) / 2; var gr = g.createRadialGradient(fx, fy, 0, fx, fy, 7); gr.addColorStop(0, "rgba(255,240,120," + (.9 * a) + ")"); gr.addColorStop(1, "rgba(255,240,120,0)"); g.fillStyle = gr; g.fillRect(fx - 7, fy - 7, 14, 14); } }
      else { for (var b = 0; b < 6; b++) { var bx = (b * 391 + t * (10 + b * 2)) % (W + 60) - 30, by = 300 + (b * 197) % 800 + Math.sin(t * 2 + b) * 24, fl = Math.abs(Math.sin(t * 9 + b)); g.fillStyle = ["#e8a030", "#f4e27a", "#8fb8e8"][b % 3]; g.beginPath(); g.ellipse(bx - 2, by, 2.4, 3 * fl + .6, -.4, 0, 7); g.ellipse(bx + 2, by, 2.4, 3 * fl + .6, .4, 0, 7); g.fill(); } }
    }
    /* kŕdeľ vtákov cez mesto (cez deň, pekné počasie) */
    if (ph < 2 && se !== 3) {
      g.strokeStyle = "rgba(50,45,50,.7)"; g.lineWidth = 1.3; g.lineCap = "round";
      for (var v = 0; v < 5; v++) { var vx = ((t * 24 + v * 34) % (W + 200)) - 100, vy = 120 + Math.sin(t * .3 + v) * 26 + v * 9, wf = Math.sin(t * 8 + v) * 3; g.beginPath(); g.moveTo(vx - 6, vy + wf); g.lineTo(vx, vy); g.lineTo(vx + 6, vy + wf); g.stroke(); }
    }
    g.restore();
  }

  /* ---------- hlavný vykresľovač ---------- */
  var oK = window.KLIVE;
  window.KLIVE = function (g, C, t, walk, P2, I) {
    if (oK) oK.apply(this, arguments);
    if (low()) return;
    var L = C.L, night = !!(I.T && I.T.night), ph = C.st.ph, tier = 1, W = 2400, H = 1400;
    try { tier = (CC().tier) || 1; } catch (e) { }
    if (!L) return;
    var roads = walk.slice(0, Math.max(0, walk.length - 1)), ring = walk[walk.length - 1];
    var items = [];
    /* ľudia na cestách */
    var kinds = ["woman", "merchant", "monk", "farmer", "child", "noble", "woman", "merchant", "farmer", "noblew"];
    var count = night ? 0 : 5 + tier * 2;
    for (var i = 0; i < count; i++) {
      var r = roads[i % Math.max(1, roads.length)]; if (!r || r.length < 2) continue;
      var kd = kinds[i % kinds.length], sp = (kd === "child" ? .035 : kd === "monk" ? .012 : .018) * (.7 + hash(i) * .6);
      var u = tri(t * sp + hash(i * 3.3) * 2), u2 = tri(t * sp + hash(i * 3.3) * 2 + .01);
      var a = ptAt(r, u), b = ptAt(r, u2), qa = P2(a[0], a[1], 0), qb = P2(b[0], b[1], 0);
      var o = { k: kd, c: kd === "monk" ? "#6b4a2e" : kd === "noble" ? "#8a1f3a" : kd === "noblew" ? "#2a5a8a" : COL[(i * 3) % COL.length], t: t, ph: i * 1.7, walk: true, dir: qb[0] >= qa[0] ? 1 : -1, s: kd === "child" ? .62 : .92 };
      items.push([qa[1], qa[0], o]);
      if (kd === "noble") { var us = tri(t * sp + hash(i * 3.3) * 2 - .02), as = ptAt(r, us), qs = P2(as[0], as[1], 0); items.push([qs[1], qs[0], { k: "farmer", c: "#6a4a2a", t: t, ph: i, walk: true, dir: o.dir, s: .85 }]); }
    }
    /* hliadky na hradbách a lampášnik v noci */
    if (ring && ring.length > 1) {
      var ng = 2 + Math.floor(tier / 2);
      for (var gi = 0; gi < ng; gi++) {
        var ug = (t * .006 + gi / ng) % 1, ag = ptAt(ring, ug), ag2 = ptAt(ring, (ug + .004) % 1), qg = P2(ag[0], ag[1], 0), qg2 = P2(ag2[0], ag2[1], 0);
        items.push([qg[1], qg[0], { k: "guard", c: "#707a88", t: t, ph: gi, walk: true, dir: qg2[0] >= qg[0] ? 1 : -1, s: .9, dc: "#b8362c" }]);
        if (night) { var gx = qg[0] + 7, gy = qg[1] - 9, gr = g.createRadialGradient(gx, gy, 0, gx, gy, 30); gr.addColorStop(0, "rgba(255,200,110,.7)"); gr.addColorStop(1, "rgba(255,170,70,0)"); g.fillStyle = gr; g.fillRect(gx - 30, gy - 30, 60, 60); g.fillStyle = "#ffd37a"; g.fillRect(gx - 1.4, gy - 2, 2.8, 4); }
      }
    }
    /* námestie: dav, hudobník, žobrák */
    if (L.pl && !night) {
      var pl = wcL(L.pl, L), fair = false; try { fair = !!(CC().fair); } catch (e) { }
      var nc = (6 + tier * 2) * (fair ? 1.6 : 1) | 0;
      for (var k = 0; k < nc; k++) {
        var ang = hash(k * 5.1) * 6.283, rad = 2.2 + hash(k * 9.7) * 5, px = pl[0] + Math.cos(ang) * rad, py = pl[1] + Math.sin(ang) * rad * .75, q = P2(px, py, 0);
        var kd2 = ["woman", "merchant", "farmer", "child", "monk", "noble"][k % 6];
        items.push([q[1], q[0], { k: kd2, c: COL[(k * 5) % COL.length], t: t, ph: k * 2.3, walk: false, dir: k % 2 ? 1 : -1, s: kd2 === "child" ? .62 : .92 }]);
      }
      var qm = P2(pl[0] + 4.4, pl[1] + 3.6, 0), qb2 = P2(pl[0] - 4.8, pl[1] + 3.8, 0);
      items.push([qm[1], qm[0], { k: "musician", c: "#2f7d46", t: t, ph: 1, dir: -1, s: .95 }]);
      items.push([qb2[1], qb2[0], { k: "beggar", t: t, ph: 2, s: .95 }]);
    }
    /* scénky pri dielňach */
    var scenes = [];
    S.lots.forEach(function (l) {
      if (l.b == null || l.pub) return;
      var b = S.bld.find(function (z) { return z.id === l.b; }); if (!b || b.halt) return;
      var p = L.pos[l.id]; if (!p) return;
      var w = wcL([p.x, p.y], L), dd = 3 + (b.lvl || 1) * .2, side = l.id % 2 ? 1 : -1;
      var q = P2(w[0] + side * 2.6, w[1] + dd / 2 + 1.5, 0);
      scenes.push([q[1], q[0], b, side, l.id]);
    });
    scenes.forEach(function (s) { items.push([s[0], s[1], { scene: s }]); });
    items.sort(function (a, b) { return a[0] - b[0]; });
    items.forEach(function (it) {
      if (it[2].scene) { var s = it[2].scene, b = s[2]; if (ph === 3 && b.type !== "krcma" && b.type !== "kovac" && b.type !== "pasovanie" && b.type !== "brloh") return; workScene(g, b.type, it[1], it[0], t, b.lvl || 1, night, s[4], s[3], b.owner === 0); }
      else person(g, it[1], it[0], it[2]);
    });
    /* mlyny */
    var M = MILL.get(L);
    if (M) {
      if (M.wm) {
        var qw = P2(M.wm[0] + .3, M.wm[1] + 1.9, 1.2), R = 15;
        g.save(); g.translate(qw[0], qw[1]); g.lineWidth = 1.2; g.strokeStyle = INK; g.fillStyle = "#6b4a2a";
        g.beginPath(); g.arc(0, 0, R, 0, 7); g.stroke();
        g.rotate(t * .5); for (var sp2 = 0; sp2 < 8; sp2++) { g.rotate(Math.PI / 4); g.beginPath(); g.moveTo(0, 0); g.lineTo(R, 0); g.stroke(); g.fillRect(R - 4, -2, 5, 4); }
        g.restore();
      }
      if (M.wd) {
        var qd = P2(M.wd[0], M.wd[1], 0), hh = 70;
        g.save(); g.translate(qd[0], qd[1]); g.lineWidth = 1.3; g.strokeStyle = INK;
        g.fillStyle = "rgba(30,20,10,.25)"; g.beginPath(); g.ellipse(4, 3, 30, 8, 0, 0, 7); g.fill();
        g.fillStyle = "#d8cdb2"; g.beginPath(); g.moveTo(-17, 0); g.lineTo(-11, -hh); g.lineTo(11, -hh); g.lineTo(17, 0); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "#5a3a20"; g.fillRect(-4, -14, 8, 14); g.strokeRect(-4, -14, 8, 14);
        g.fillStyle = "#8a4a32"; g.beginPath(); g.moveTo(-15, -hh); g.lineTo(0, -hh - 22); g.lineTo(15, -hh); g.closePath(); g.fill(); g.stroke();
        g.translate(0, -hh - 3); g.rotate(t * .45 + 1); g.strokeStyle = "#5a3a20"; g.lineWidth = 2;
        for (var bl = 0; bl < 4; bl++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -46); g.stroke(); g.fillStyle = "rgba(244,236,216,.92)"; g.fillRect(2.4, -44, 6, 26); g.strokeRect(2.4, -44, 6, 26); }
        g.restore();
      }
    }
    seasonFX(g, t, C, W, H);
  };

  /* ---------- statické doplnky mesta: vodný mlyn a veterný mlyn ---------- */
  window.KPUB = function (env) {
    var L = env.L, wc = env.wc, house = env.house, roads = env.roads, lots = env.lots, tier = env.tier | 0, M = {};
    var lw = []; lots.forEach(function (l) { var p = L.pos[l.id]; if (p) lw.push(wc([p.x, p.y])); });
    var ringW = (L.ring || []).map(wc), river = L.river ? L.river.map(wc) : null;
    function free(x, y, minLot, minRoad) {
      for (var i = 0; i < lw.length; i++) if (Math.hypot(lw[i][0] - x, lw[i][1] - y) < minLot) return false;
      for (var r = 0; r < roads.length; r++) if (dpath(x, y, roads[r]) < minRoad) return false;
      return true;
    }
    if (river && river.length > 3) {
      var n = river.length;
      for (var k = 0; k < n * 2 && !M.wm; k++) {
        var idx = Math.floor(n * (.25 + (k % 11) * .05)) % (n - 1), a = river[idx], b = river[idx + 1];
        var dx = b[0] - a[0], dy = b[1] - a[1], ln = Math.hypot(dx, dy) || 1, nx = -dy / ln, ny = dx / ln, side = k % 2 ? 1 : -1;
        var x = a[0] + nx * side * 4.4, y = a[1] + ny * side * 4.4;
        if (free(x, y, 7, 3.5) && (!ringW.length || dpath(x, y, ringW) > 4.5)) M.wm = [x, y];
      }
      if (M.wm && house) {
        try { house(M.wm[0] - 2.4, M.wm[1] - 1.8, 4.8, 3.6, 3.2, { tex: "plaster", roof: "tile", rh: 2, sqY: [[1, 1, .7, .8]], sqX: [[1, 1, .7, .8]], door: [2, .9, 1.2, false] }); } catch (e) { }
      }
    }
    if (tier >= 2 && ringW.length) {
      var rmax = 0; ringW.forEach(function (p) { rmax = Math.max(rmax, Math.hypot(p[0], p[1])); });
      for (var d = 0; d < 16 && !M.wd; d++) {
        var ang = (d / 16) * 6.283 + .4, rr = rmax + 7 + (d % 3) * 3, wx = Math.cos(ang) * rr, wy = Math.sin(ang) * rr;
        var q = env.P2(wx, wy, 0);
        if (q[0] < 90 || q[0] > 2310 || q[1] < 210 || q[1] > 1330) continue;
        if (free(wx, wy, 8, 3.5) && dpath(wx, wy, ringW) > 11 && Math.hypot(wx, wy) > rmax + 4 && (!river || dpath(wx, wy, river) > 7)) M.wd = [wx, wy];
      }
    }
    MILL.set(L, M);
  };

  /* ---------- popisky pri prechode myšou ---------- */
  var oKK = window.KKERB;
  window.KKERB = function (cont, btn, l) {
    try {
      var tx = lotLabel(l).t, b = l.b != null ? S.bld.find(function (z) { return z.id === l.b; }) : null;
      if (b && window.BT && BT[b.type]) { var dn = (b.owner != null && S.dyn[b.owner]) ? S.dyn[b.owner].name : ""; tx = BT[b.type].n + " · úroveň " + (b.lvl || 1) + (dn ? " · rod " + dn : "") + (b.halt ? " · stojí" : ""); }
      else if (l.res != null && S.dyn[l.res]) { var d = S.dyn[l.res]; tx = "Rod " + d.name + (HOUSES[d.house] ? " · " + HOUSES[d.house].n : ""); }
      btn.title = tx;
    } catch (e) { }
    return oKK ? oKK.apply(this, arguments) : undefined;
  };
  try {
    var st = document.createElement("style");
    st.textContent = ".lot.khot{transition:background .15s,box-shadow .15s}.lot.khot:hover,.lot.khot:focus-visible{background:rgba(242,215,141,.2)!important;box-shadow:0 0 0 2px rgba(242,215,141,.9),0 0 14px rgba(242,215,141,.7);border-radius:8px}";
    document.head.appendChild(st);
  } catch (e) { }
})();

;
