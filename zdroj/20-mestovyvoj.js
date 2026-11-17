/* ==== js/mestovyvoj.js ==== */
/* Prešporok 1400 – vylepšená grafika hlavnej mapy mesta: úrovne budov, štítky remesiel, lešenie, zanedbané dielne,
   povrchy ulíc podľa bohatstva mesta, námestie, lampy a sady. Autor: Dávid Mucha. */
(function () {
  "use strict";
  var INK = "#2b2117";
  function hash(n) { var x = Math.sin(n * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); }

  /* ---------- pomocné kreslenie ---------- */
  function dr(E, wx, wy, dz, off, fn) {
    var P = E.I.P;
    E.I.push({ d: wx + wy + (off == null ? .6 : off), draw: function (x2) {
      var q = P(wx, wy, dz || 0); x2.save(); x2.lineWidth = 1.1; x2.strokeStyle = INK; x2.lineJoin = "round"; x2.lineCap = "round"; fn(x2, q); x2.restore();
    } });
  }
  function seg(E, a, b, col, lw, d) {
    var P = E.I.P;
    E.I.push({ d: d, draw: function (x2) {
      var p = P(a[0], a[1], a[2]), q = P(b[0], b[1], b[2]);
      x2.save(); x2.strokeStyle = col; x2.lineWidth = lw; x2.lineCap = "round"; x2.beginPath(); x2.moveTo(p[0], p[1]); x2.lineTo(q[0], q[1]); x2.stroke(); x2.restore();
    } });
  }
  function qd(E, pts, fill, stroke, d, alpha) {
    var P = E.I.P;
    E.I.push({ d: d, draw: function (x2) {
      x2.save(); if (alpha != null) x2.globalAlpha = alpha; x2.fillStyle = fill; x2.beginPath();
      pts.forEach(function (p, i) { var q = P(p[0], p[1], p[2] || 0); i ? x2.lineTo(q[0], q[1]) : x2.moveTo(q[0], q[1]); });
      x2.closePath(); x2.fill(); if (stroke) { x2.strokeStyle = stroke; x2.lineWidth = .9; x2.stroke(); } x2.restore();
    } });
  }
  function shadow(x2, q, rx, ry) { x2.fillStyle = "rgba(30,20,10,.26)"; x2.beginPath(); x2.ellipse(q[0], q[1] + 1, rx, ry || rx * .4, 0, 0, 7); x2.fill(); }
  function dcol(b) { try { return b && b.owner != null && window.DC ? DC(b.owner) : "#b8362c"; } catch (e) { return "#b8362c"; } }

  /* malá postava (hlava, telo, pokrývka hlavy) */
  function folk(E, wx, wy, robe, hat, seated, dz) {
    dr(E, wx, wy, dz || 0, .9, function (x2, q) {
      x2.fillStyle = "rgba(40,25,10,.28)"; x2.beginPath(); x2.ellipse(q[0], q[1] + 2, 6, 2.2, 0, 0, 7); x2.fill();
      var by = seated ? 8 : 14;
      x2.fillStyle = robe || "#6b4423"; x2.beginPath(); x2.moveTo(q[0] - 5, q[1]); x2.quadraticCurveTo(q[0] - 6, q[1] - by, q[0], q[1] - by - 3); x2.quadraticCurveTo(q[0] + 6, q[1] - by, q[0] + 5, q[1]); x2.closePath(); x2.fill(); x2.stroke();
      x2.fillStyle = "#e0b090"; x2.beginPath(); x2.arc(q[0], q[1] - by - 6, 3.4, 0, 7); x2.fill(); x2.stroke();
      if (hat) { x2.fillStyle = hat; x2.beginPath(); x2.arc(q[0], q[1] - by - 7.4, 3.5, 3.14, 6.28); x2.fill(); x2.stroke(); }
    });
  }

  /* ---------- štítky remesiel (obrázok na závesnom štíte) ---------- */
  var CREAM = "#f6efdc";
  window.KSIGN = function (x2, t, cx, cy) {
    x2.save(); x2.translate(cx, cy); x2.fillStyle = CREAM; x2.strokeStyle = "#2a1a0e"; x2.lineWidth = 1; x2.lineJoin = "round"; x2.lineCap = "round";
    var ok = true;
    switch (t) {
      case "kovac": x2.beginPath(); x2.moveTo(-5, -3); x2.lineTo(5, -3); x2.lineTo(3.4, -.4); x2.lineTo(1.4, -.4); x2.lineTo(2.4, 3.2); x2.lineTo(-2.4, 3.2); x2.lineTo(-1.4, -.4); x2.lineTo(-3.4, -.4); x2.closePath(); x2.fill(); x2.stroke(); break;
      case "tkac": x2.fillRect(-4, -4, 3.4, 8); x2.fillRect(.6, -4, 3.4, 8); x2.strokeRect(-4, -4, 3.4, 8); x2.strokeRect(.6, -4, 3.4, 8); x2.beginPath(); x2.moveTo(-4, -1); x2.lineTo(4, 1); x2.stroke(); break;
      case "pekar": x2.beginPath(); x2.arc(-2, -.5, 3, 0, 7); x2.arc(2, -.5, 3, 0, 7); x2.stroke(); x2.beginPath(); x2.moveTo(-3.5, 2); x2.lineTo(3.5, 2); x2.stroke(); x2.beginPath(); x2.ellipse(0, 0, 4.4, 3.4, 0, 0, 7); x2.fillStyle = "#e6c07a"; x2.fill(); x2.stroke(); break;
      case "krcma": case "pivovar": x2.fillRect(-4, -4, 6.4, 8); x2.strokeRect(-4, -4, 6.4, 8); x2.beginPath(); x2.arc(3, 0, 2.4, -1.4, 1.4); x2.stroke(); x2.fillStyle = "#e6b84a"; x2.fillRect(-3.2, -2, 4.8, 5.4); break;
      case "lekaren": x2.fillStyle = "#2f7d46"; x2.fillRect(-1.4, -5, 2.8, 10); x2.fillRect(-5, -1.4, 10, 2.8); x2.strokeRect(-1.4, -5, 2.8, 10); break;
      case "zlatnik": x2.lineWidth = 2; x2.strokeStyle = "#e2b85a"; x2.beginPath(); x2.arc(0, 1, 3.6, 0, 7); x2.stroke(); x2.fillStyle = "#c04a6a"; x2.beginPath(); x2.moveTo(0, -5); x2.lineTo(2, -2.6); x2.lineTo(-2, -2.6); x2.closePath(); x2.fill(); break;
      case "vinar": x2.fillStyle = "#7a2f4a"; [[-2, -2], [2, -2], [0, 0], [-2, 2], [2, 2], [0, 4]].forEach(function (p) { x2.beginPath(); x2.arc(p[0], p[1] - .5, 1.9, 0, 7); x2.fill(); }); x2.strokeStyle = "#2f6b3a"; x2.beginPath(); x2.moveTo(0, -5); x2.lineTo(0, -3); x2.stroke(); break;
      case "hrnciar": x2.fillStyle = "#c9752e"; x2.beginPath(); x2.moveTo(-3, -3); x2.quadraticCurveTo(-6, 2, -2.4, 4); x2.lineTo(2.4, 4); x2.quadraticCurveTo(6, 2, 3, -3); x2.closePath(); x2.fill(); x2.stroke(); break;
      case "tesar": x2.strokeStyle = "#6b4423"; x2.lineWidth = 1.8; x2.beginPath(); x2.moveTo(-4, 4); x2.lineTo(3, -4); x2.stroke(); x2.fillStyle = "#c8c8c8"; x2.strokeStyle = INK; x2.lineWidth = 1; x2.beginPath(); x2.moveTo(1, -5); x2.lineTo(5, -3); x2.lineTo(3, 0); x2.closePath(); x2.fill(); x2.stroke(); break;
      case "garbiar": x2.fillStyle = "#b07a45"; x2.beginPath(); x2.ellipse(0, 0, 4, 5, 0, 0, 7); x2.fill(); x2.stroke(); break;
      case "pisaren": x2.strokeStyle = "#2a1a0e"; x2.lineWidth = 1.2; x2.beginPath(); x2.moveTo(-4, 4); x2.lineTo(4, -4); x2.stroke(); x2.fillStyle = CREAM; x2.beginPath(); x2.moveTo(4, -4); x2.quadraticCurveTo(5, 0, 1, 1); x2.quadraticCurveTo(2, -2, 4, -4); x2.fill(); x2.stroke(); break;
      case "kupec": x2.strokeStyle = "#2a1a0e"; x2.beginPath(); x2.moveTo(0, -4); x2.lineTo(0, 4); x2.moveTo(-4, -2); x2.lineTo(4, -2); x2.moveTo(-4, -2); x2.lineTo(-4, 1); x2.moveTo(4, -2); x2.lineTo(4, 1); x2.stroke(); x2.fillStyle = "#e2b85a"; x2.beginPath(); x2.arc(-4, 1.6, 2, 0, 3.14); x2.arc(4, 1.6, 2, 0, 3.14); x2.fill(); break;
      case "mlyn": x2.beginPath(); x2.arc(0, 0, 4.2, 0, 7); x2.stroke(); x2.beginPath(); for (var i = 0; i < 4; i++) { x2.moveTo(0, 0); x2.lineTo(Math.cos(i * 1.57) * 4.2, Math.sin(i * 1.57) * 4.2); } x2.stroke(); break;
      case "sklaren": x2.fillStyle = "#9ad0c8"; x2.beginPath(); x2.moveTo(-1.2, -5); x2.lineTo(1.2, -5); x2.lineTo(1.2, -2); x2.quadraticCurveTo(4.5, 0, 3.4, 4); x2.lineTo(-3.4, 4); x2.quadraticCurveTo(-4.5, 0, -1.2, -2); x2.closePath(); x2.fill(); x2.stroke(); break;
      case "tlaciaren": x2.fillRect(-4, -4, 8, 8); x2.strokeRect(-4, -4, 8, 8); x2.fillStyle = "#2a1a0e"; x2.font = "700 8px Georgia,serif"; x2.textAlign = "center"; x2.fillText("A", 0, 3); break;
      case "pasovanie": x2.fillStyle = "#8a5a32"; x2.beginPath(); x2.ellipse(0, 0, 4, 4.4, 0, 0, 7); x2.fill(); x2.stroke(); x2.beginPath(); x2.moveTo(-4, -1.4); x2.lineTo(4, -1.4); x2.moveTo(-4, 1.6); x2.lineTo(4, 1.6); x2.stroke(); break;
      case "bana": x2.strokeStyle = "#6b4423"; x2.lineWidth = 1.6; x2.beginPath(); x2.moveTo(-3, 4); x2.lineTo(3, -4); x2.stroke(); x2.strokeStyle = "#c8c8c8"; x2.beginPath(); x2.moveTo(-1, -5); x2.quadraticCurveTo(4, -5, 5, 0); x2.stroke(); break;
      default: ok = false;
    }
    x2.restore(); return ok;
  };

  /* ---------- markíza nad dverami ---------- */
  var AWN = { pekar: ["#c9971a", "#f4ecd8"], tkac: ["#2f5bb0", "#f4ecd8"], kupec: ["#6d3f92", "#f0e2b8"], krcma: ["#7a1f18", "#f4ecd8"], vinar: ["#5a1a3a", "#f0e2b8"], lekaren: ["#2f7d46", "#f4ecd8"], hrnciar: ["#b8643a", "#f4ecd8"], sklaren: ["#2f7d8a", "#f4ecd8"], tlaciaren: ["#3a3a3a", "#f4ecd8"], pivovar: ["#c9971a", "#6b4a2a"] };
  function awning(E, cx, yw, c1, c2) {
    var P = E.I.P, n = 6, w = 2.0, x0 = cx - w / 2, z0 = 1.95, z1 = 1.5, dy = .95;
    E.I.push({ d: cx + yw + 9.4, draw: function (x2) {
      x2.save(); x2.lineWidth = .9; x2.strokeStyle = INK; x2.lineJoin = "round";
      for (var i = 0; i < n; i++) {
        var u0 = i / n, u1 = (i + 1) / n, a = P(x0 + w * u0, yw, z0), b = P(x0 + w * u1, yw, z0), c = P(x0 + w * u1, yw + dy, z1), d = P(x0 + w * u0, yw + dy, z1);
        x2.fillStyle = i % 2 ? c2 : c1; x2.beginPath(); x2.moveTo(a[0], a[1]); x2.lineTo(b[0], b[1]); x2.lineTo(c[0], c[1]); x2.lineTo(d[0], d[1]); x2.closePath(); x2.fill(); x2.stroke();
      }
      var e0 = P(x0, yw + dy, z1), e1 = P(x0 + w, yw + dy, z1);
      x2.strokeStyle = "#4a2e14"; x2.lineWidth = 1.3; x2.beginPath(); x2.moveTo(e0[0], e0[1]); x2.lineTo(e0[0], e0[1] + 10); x2.moveTo(e1[0], e1[1]); x2.lineTo(e1[0], e1[1] + 10); x2.stroke();
      x2.restore();
    } });
  }

  /* ---------- erb nad vchodom, lampáš, schody, kvetináče, veterník ---------- */
  function arms(E, cx, yw, z, col) {
    dr(E, cx, yw + .06, z, 9.7, function (x2, q) {
      x2.fillStyle = "#e6d8a8"; x2.fillRect(q[0] - 5.4, q[1] - 7.4, 10.8, 12.4); x2.strokeRect(q[0] - 5.4, q[1] - 7.4, 10.8, 12.4);
      x2.fillStyle = col; x2.beginPath(); x2.moveTo(q[0] - 4, q[1] - 6); x2.lineTo(q[0] + 4, q[1] - 6); x2.lineTo(q[0] + 4, q[1] - 1); x2.quadraticCurveTo(q[0] + 3, q[1] + 3, q[0], q[1] + 4); x2.quadraticCurveTo(q[0] - 3, q[1] + 3, q[0] - 4, q[1] - 1); x2.closePath(); x2.fill(); x2.stroke();
      x2.fillStyle = "#e6c050"; x2.beginPath(); x2.moveTo(q[0], q[1] - 5); x2.lineTo(q[0] + 2, q[1] - 1); x2.lineTo(q[0] - 2, q[1] - 1); x2.closePath(); x2.fill();
    });
  }
  function lantern(E, wx, wy, z) {
    var P = E.I.P;
    E.I.push({ d: wx + wy + 9.8, draw: function (x2) {
      var q = P(wx, wy, z), night = E.I.T && E.I.T.night;
      x2.save(); x2.lineWidth = 1; x2.strokeStyle = INK; x2.fillStyle = "#2a1a0e"; x2.fillRect(q[0] - 3, q[1] - 8, 6, 8); x2.strokeRect(q[0] - 3, q[1] - 8, 6, 8);
      x2.fillStyle = night ? "#ffd060" : "#d9c27a"; x2.fillRect(q[0] - 1.8, q[1] - 6.6, 3.6, 5.2);
      x2.beginPath(); x2.moveTo(q[0] - 4, q[1] - 8); x2.lineTo(q[0], q[1] - 11); x2.lineTo(q[0] + 4, q[1] - 8); x2.closePath(); x2.fillStyle = "#2a1a0e"; x2.fill();
      x2.restore();
      if (night && E.I.lights) E.I.lights.push([q[0], q[1] - 4, 32]);
    } });
  }
  function topiary(E, wx, wy) {
    dr(E, wx, wy, 0, .8, function (x2, q) {
      shadow(x2, q, 5, 1.8);
      x2.fillStyle = "#b8643a"; x2.beginPath(); x2.moveTo(q[0] - 3.4, q[1] - 5); x2.lineTo(q[0] + 3.4, q[1] - 5); x2.lineTo(q[0] + 2.4, q[1]); x2.lineTo(q[0] - 2.4, q[1]); x2.closePath(); x2.fill(); x2.stroke();
      x2.fillStyle = "#3f7a3a"; x2.beginPath(); x2.arc(q[0], q[1] - 9.5, 4.8, 0, 7); x2.fill(); x2.stroke();
      x2.fillStyle = "#d85a6a"; x2.beginPath(); x2.arc(q[0] - 1.6, q[1] - 10.5, 1, 0, 7); x2.arc(q[0] + 1.8, q[1] - 8.4, 1, 0, 7); x2.fill();
    });
  }
  function vane(E, wx, wy, z) {
    dr(E, wx, wy, z, 10, function (x2, q) {
      x2.strokeStyle = "#7a5a14"; x2.lineWidth = 1.3; x2.beginPath(); x2.moveTo(q[0], q[1]); x2.lineTo(q[0], q[1] - 12); x2.stroke();
      x2.fillStyle = "#e6c050"; x2.strokeStyle = "#7a5a14"; x2.lineWidth = .9;
      x2.beginPath(); x2.arc(q[0], q[1] - 12, 2.2, 0, 7); x2.fill(); x2.stroke();
      x2.beginPath(); x2.moveTo(q[0] - 6, q[1] - 8); x2.lineTo(q[0] + 6, q[1] - 8); x2.lineTo(q[0] + 4, q[1] - 5); x2.lineTo(q[0] - 4, q[1] - 5); x2.closePath(); x2.fill(); x2.stroke();
    });
  }
  function steps(E, cx, yw) {
    try { E.box(cx - .95, yw + .02, 1.9, .5, .2, { tex: "wall", topTex: "cobble", noShadow: 1, clean: 1, tpu: 6 }); E.box(cx - 1.1, yw + .5, 2.2, .4, .1, { tex: "wall", topTex: "cobble", noShadow: 1, clean: 1, tpu: 6 }); } catch (e) { }
  }

  /* ---------- lešenie, prach a stavbári ---------- */
  function scaffold(E, x0, y0, w, dd, h) {
    var yw = y0 + dd + .55, xa = x0 - .55, xb = x0 + w + .55, xe = x0 + w + .55, ye = y0 - .4;
    var top = h * 1.12 + .6, z1 = top * .4, z2 = top * .78, D = x0 + w + y0 + dd + 9;
    var wood = "#8a5a32", pale = "#b8864e";
    var P = E.I.P;
    /* sieť */
    qd(E, [[xa, yw, 0], [xb, yw, 0], [xb, yw, top], [xa, yw, top]], "#d8c8a0", null, D - .2, .22);
    qd(E, [[xe, ye, 0], [xe, yw, 0], [xe, yw, top], [xe, ye, top]], "#d8c8a0", null, D - .2, .2);
    /* stĺpy */
    [[xa, yw], [xb, yw], [xe, ye]].forEach(function (p) { seg(E, [p[0], p[1], 0], [p[0], p[1], top], wood, 2.2, D); });
    [[(xa + xb) / 2, yw]].forEach(function (p) { seg(E, [p[0], p[1], 0], [p[0], p[1], top], wood, 1.8, D); });
    /* priečky a pracovné plošiny */
    [z1, z2].forEach(function (z) {
      seg(E, [xa, yw, z], [xb, yw, z], wood, 2, D + .1); seg(E, [xe, ye, z], [xe, yw, z], wood, 2, D + .1);
      qd(E, [[xa, yw, z], [xb, yw, z], [xb, yw - .7, z], [xa, yw - .7, z]], pale, "rgba(40,28,12,.6)", D + .12);
    });
    seg(E, [xa, yw, 0], [xb, yw, z2], wood, 1.4, D + .05); seg(E, [xb, yw, 0], [xa, yw, z2], wood, 1.4, D + .05);
    /* rebrík */
    var rx = x0 + w * .72;
    seg(E, [rx, yw + .1, 0], [rx + .2, yw + .1, z2], "#6b4423", 1.6, D + .3); seg(E, [rx + .6, yw + .1, 0], [rx + .8, yw + .1, z2], "#6b4423", 1.6, D + .3);
    for (var r = 1; r < 8; r++) { var zz = z2 * r / 8; seg(E, [rx + .02, yw + .1, zz], [rx + .78, yw + .1, zz], "#6b4423", 1.1, D + .3); }
    /* kopa tehál, vrece a stavbári */
    dr(E, x0 - 1.0, yw + .9, 0, 1.2, function (x2, q) {
      shadow(x2, q, 9, 3);
      for (var r2 = 0; r2 < 3; r2++) for (var i = 0; i < 4 - r2; i++) { x2.fillStyle = (i + r2) % 2 ? "#a84a2a" : "#b8603a"; x2.fillRect(q[0] - 8 + i * 5 + r2 * 2.5, q[1] - 4 - r2 * 3.4, 4.6, 3.2); x2.strokeRect(q[0] - 8 + i * 5 + r2 * 2.5, q[1] - 4 - r2 * 3.4, 4.6, 3.2); }
    });
    folk(E, x0 + w * .35, yw - .3, "#6a5a3a", "#d8c890", false, z1);
    folk(E, x0 + w * .2, yw + 1.3, "#7a4d23", "#8a6a3a", false, 0);
    /* prach */
    try { var sm = E.I.smokes; if (sm) { sm.push([x0 + w * .3, y0 + dd, top * .5]); sm.push([x0 + w * .75, y0 + dd, top * .3]); } } catch (e) { }
  }

  /* ---------- zanedbaná (neobsadená) dielňa ---------- */
  function neglect(E, cx, x0, y0, w, dd, h, rnd) {
    var yw = y0 + dd, D = cx + yw + 9.6;
    seg(E, [cx - .6, yw + .04, .12], [cx + .6, yw + .04, 1.5], "#5a3a1c", 2.4, D);
    seg(E, [cx + .6, yw + .04, .12], [cx - .6, yw + .04, 1.5], "#5a3a1c", 2.4, D);
    seg(E, [cx - .65, yw + .04, .8], [cx + .65, yw + .04, .8], "#6b4423", 2, D);
    for (var i = 0; i < 7; i++) {
      var wx = x0 + .3 + hash(i * 3 + rnd * 50) * (w - .4);
      dr(E, wx, yw + .25, 0, 9.7, function (x2, q) {
        x2.strokeStyle = "#4f7a2e"; x2.lineWidth = 1.2;
        x2.beginPath(); x2.moveTo(q[0], q[1]); x2.lineTo(q[0] - 2, q[1] - 6); x2.moveTo(q[0], q[1]); x2.lineTo(q[0] + 1, q[1] - 7); x2.moveTo(q[0], q[1]); x2.lineTo(q[0] + 3, q[1] - 4); x2.stroke();
      });
    }
    /* pavučina v rohu */
    dr(E, x0 + w, y0 + dd, h * .8, 9.7, function (x2, q) {
      x2.strokeStyle = "rgba(240,240,230,.75)"; x2.lineWidth = .7;
      x2.beginPath(); x2.moveTo(q[0], q[1]); x2.lineTo(q[0] - 9, q[1] + 1); x2.moveTo(q[0], q[1]); x2.lineTo(q[0] - 7, q[1] + 7); x2.moveTo(q[0], q[1]); x2.lineTo(q[0] - 1, q[1] + 9);
      x2.moveTo(q[0] - 6, q[1] + 1); x2.quadraticCurveTo(q[0] - 4, q[1] + 3, q[0] - 4.5, q[1] + 5); x2.stroke();
    });
  }

  /* ---------- remeselné rekvizity podľa úrovne ---------- */
  function craftExtras(E, T, lv, x0, y0, w, dd, h, rnd) {
    var yw = y0 + dd;
    if (T === "kovac" && lv >= 2) {
      dr(E, x0 + w * .7, yw + .9, 0, .9, function (x2, q) {
        shadow(x2, q, 7, 2.4);
        x2.fillStyle = "#7a5a32"; x2.fillRect(q[0] - 3.4, q[1] - 6, 6.8, 6); x2.strokeRect(q[0] - 3.4, q[1] - 6, 6.8, 6);
        x2.fillStyle = "#3a3a42"; x2.beginPath(); x2.moveTo(q[0] - 7, q[1] - 11); x2.lineTo(q[0] + 7, q[1] - 11); x2.lineTo(q[0] + 4.6, q[1] - 8.6); x2.lineTo(q[0] + 2, q[1] - 8.6); x2.lineTo(q[0] + 3, q[1] - 6); x2.lineTo(q[0] - 3, q[1] - 6); x2.lineTo(q[0] - 2, q[1] - 8.6); x2.lineTo(q[0] - 4.6, q[1] - 8.6); x2.closePath(); x2.fill(); x2.stroke();
        if (lv >= 3) { x2.strokeStyle = "#6b4423"; x2.lineWidth = 1.5; x2.beginPath(); x2.moveTo(q[0] + 8, q[1]); x2.lineTo(q[0] + 8, q[1] - 12); x2.stroke(); x2.fillStyle = "#8a8a92"; x2.fillRect(q[0] + 5.6, q[1] - 14, 5, 3); }
      });
      if (lv >= 4) folk(E, x0 + w * .45, yw + 1.2, "#3a3a3a", null, false);
    }
    if (T === "pekar" && lv >= 2) {
      var sx = x0 - 1.9, sy = y0 + dd * .55;
      try { E.box(sx - .6, sy - .6, 1.3, 1.5, .85, { tex: "wood", topTex: "wood", noShadow: 1, clean: 1, tpu: 6 }); } catch (e) { }
      dr(E, sx, sy, .85, 1.4, function (x2, q) {
        for (var i = 0; i < 5; i++) { x2.fillStyle = i % 2 ? "#e6c07a" : "#d8a24a"; x2.beginPath(); x2.ellipse(q[0] - 5 + i * 2.6, q[1] + (i % 2) * 2, 2.4, 1.6, 0, 0, 7); x2.fill(); x2.stroke(); }
      });
      if (lv >= 3) folk(E, sx + .2, sy - .9, "#f0e8d8", "#f0e8d8", false);
    }
    if (T === "krcma" && lv >= 2) {
      var tx = x0 - 1.8, ty = yw - .9;
      try { E.box(tx - .5, ty - .4, 1.2, .8, .6, { tex: "wood", topTex: "wood", noShadow: 1, clean: 1, tpu: 6 }); E.box(tx - .5, ty + .55, 1.2, .3, .35, { tex: "wood", topTex: "wood", noShadow: 1, clean: 1, tpu: 6 }); } catch (e) { }
      dr(E, tx, ty, .6, 1.5, function (x2, q) {
        x2.fillStyle = "#e6b84a"; x2.fillRect(q[0] - 3, q[1] - 4, 2.6, 3.4); x2.strokeRect(q[0] - 3, q[1] - 4, 2.6, 3.4); x2.fillRect(q[0] + 1.4, q[1] - 3.6, 2.6, 3.4); x2.strokeRect(q[0] + 1.4, q[1] - 3.6, 2.6, 3.4);
      });
      if (lv >= 3) { folk(E, tx - .2, ty + 1.1, "#5a6a3a", "#7a3a2a", true); folk(E, tx + .5, ty - 1.0, "#8a3a2a", null, true); }
    }
    if (T === "kupec" && lv >= 2) {
      var cx2 = x0 + w * .15, cy2 = yw + 1.6;
      dr(E, cx2, cy2, 0, 1.0, function (x2, q) {
        shadow(x2, q, 12, 3.4);
        x2.fillStyle = "#8a6a3a"; x2.fillRect(q[0] - 11, q[1] - 11, 22, 7); x2.strokeRect(q[0] - 11, q[1] - 11, 22, 7);
        x2.fillStyle = "#c9a24a"; [[-7, -15], [-2, -16], [4, -15]].forEach(function (p) { x2.beginPath(); x2.arc(q[0] + p[0], q[1] + p[1], 3.6, 0, 7); x2.fill(); x2.stroke(); });
        x2.fillStyle = "#e8dcc0"; x2.fillRect(q[0] + 6, q[1] - 17, 5, 6); x2.strokeRect(q[0] + 6, q[1] - 17, 5, 6);
        [-7, 7].forEach(function (dx) { x2.fillStyle = "#6b4423"; x2.beginPath(); x2.arc(q[0] + dx, q[1] - 3, 4.4, 0, 7); x2.fill(); x2.stroke(); x2.fillStyle = "#3a2410"; x2.beginPath(); x2.arc(q[0] + dx, q[1] - 3, 1.2, 0, 7); x2.fill(); });
      });
    }
    if ((T === "zlatnik" || T === "pisaren") && lv >= 3) {
      folk(E, x0 + w * .5 + 1.1, yw + .7, "#4a4a52", "#9a9aa2", false);
      dr(E, x0 + w * .5 + 1.9, yw + .7, 0, 1.0, function (x2, q) { x2.strokeStyle = "#5a3a1c"; x2.lineWidth = 1.5; x2.beginPath(); x2.moveTo(q[0], q[1]); x2.lineTo(q[0], q[1] - 24); x2.stroke(); x2.fillStyle = "#c8c8d0"; x2.beginPath(); x2.moveTo(q[0] - 3, q[1] - 22); x2.lineTo(q[0], q[1] - 28); x2.lineTo(q[0] + 3, q[1] - 22); x2.closePath(); x2.fill(); x2.stroke(); });
    }
    if (T === "tkac" && lv >= 3) {
      dr(E, x0 - 1.4, yw + .6, 0, 1.0, function (x2, q) {
        x2.strokeStyle = "#4a2e14"; x2.lineWidth = 1.6; x2.beginPath(); x2.moveTo(q[0] - 8, q[1]); x2.lineTo(q[0] - 8, q[1] - 12); x2.moveTo(q[0] + 8, q[1]); x2.lineTo(q[0] + 8, q[1] - 12); x2.moveTo(q[0] - 9, q[1] - 11); x2.lineTo(q[0] + 9, q[1] - 11); x2.stroke();
        x2.lineWidth = 1; ["#b8362c", "#e0b04a", "#2f5bb0"].forEach(function (c, i) { x2.fillStyle = c; x2.fillRect(q[0] - 7 + i * 5, q[1] - 11, 4.2, 9); x2.strokeRect(q[0] - 7 + i * 5, q[1] - 11, 4.2, 9); });
      });
    }
    if ((T === "pivovar" || T === "vinar") && lv >= 3) {
      dr(E, x0 + w + .9, y0 + dd * .85, 0, .9, function (x2, q) {
        shadow(x2, q, 12, 3);
        for (var i = 0; i < 3; i++) { x2.fillStyle = "#8a5a32"; x2.beginPath(); x2.ellipse(q[0] - 6 + i * 6, q[1] - 5, 4, 5.6, 0, 0, 7); x2.fill(); x2.stroke(); x2.beginPath(); x2.moveTo(q[0] - 10 + i * 6, q[1] - 7); x2.lineTo(q[0] - 2 + i * 6, q[1] - 7); x2.moveTo(q[0] - 10 + i * 6, q[1] - 3); x2.lineTo(q[0] - 2 + i * 6, q[1] - 3); x2.stroke(); }
      });
    }
  }

  /* ---------- hlavný zásah do budov ---------- */
  var _KHX = window.KHX;
  window.KHX = function (t, lv, cx, cy, w, dd, h, E, o) {
    var ret = _KHX ? _KHX.apply(this, arguments) : false;
    try {
      var T = String(t), x0 = cx - w / 2, y0 = cy - dd / 2, yw = y0 + dd, b = E.b || null, rnd = hash((E.l ? E.l.id : 1) * 5 + 3);
      var idle = !!(b && (b.w < 1 || b.halt));
      var building = !!(b && b.bt != null && b.bt === S.turn);
      var dark = (T === "brloh" || T === "pasovanie" || T === "bana");
      var mine = !!E.mine, home = T === "dom";
      /* lešenie pri stavbe/vylepšení */
      if (building) { scaffold(E, x0, y0, w, dd, h); return ret; }
      if (idle && b) { neglect(E, cx, x0, y0, w, dd, h, rnd); return ret; }
      if (dark) return ret;
      var aw = AWN[T];
      if (aw && lv >= 2) awning(E, cx, yw, aw[0], aw[1]);
      if (lv >= 3) lantern(E, cx + 1.25, yw + .06, 1.7);
      if (lv >= 4) { steps(E, cx, yw); arms(E, cx, yw, lv >= 4 && aw ? 2.45 : 2.3, dcol(b)); }
      if (lv >= 5) {
        topiary(E, cx - 1.55, yw + .9); topiary(E, cx + 1.55, yw + .9);
        var jet = lv >= 3 && (T === "krcma" || T === "vinar" || T === "kupec" || T === "tkac" || T === "lekaren" || T === "pekar" || T === "hrnciar" || T === "tesar" || T === "garbiar" || home);
        var htop = (jet ? h * 1.12 * 1.08 : h) + ((o && o.rh) || w * .4);
        vane(E, cx, cy, htop);
      }
      if (lv >= 4 && !mine && b) {
        var dc = dcol(b), P = E.I.P;
        E.I.push({ d: x0 + w + y0 + 10, draw: function (x2) { var q = P(x0 + w - .3, y0 + .4, h * 1.12 + 1.6); E.I.flags.push([q[0], q[1], dc]); } });
      }
      craftExtras(E, T, lv, x0, y0, w, dd, h, rnd);
    } catch (e) { console.warn("mestovyvoj KHX", e); }
    return ret;
  };

  /* ---------- povrch ulíc podľa bohatstva mesta ---------- */
  window.KROAD = function (q, roads, I, tier) {
    var snow = I.SNOW;
    q.save(); q.lineCap = "round"; q.lineJoin = "round";
    function path(r) { q.beginPath(); r.forEach(function (p, i) { i ? q.lineTo(p[0], p[1]) : q.moveTo(p[0], p[1]); }); }
    roads.forEach(function (r, ri) {
      if (tier >= 3) {
        path(r); q.strokeStyle = snow ? "rgba(110,110,125,.28)" : "rgba(84,70,48,.42)"; q.lineWidth = 2.5; q.setLineDash([.3, .24]); q.stroke();
        path(r); q.strokeStyle = "rgba(252,244,222,.22)"; q.lineWidth = 1.7; q.setLineDash([.16, .5]); q.stroke(); q.setLineDash([]);
        if (tier >= 4) { path(r); q.strokeStyle = snow ? "rgba(140,160,180,.6)" : "rgba(58,84,100,.55)"; q.lineWidth = .22; q.stroke(); }
        if (tier >= 5) {
          path(r); q.strokeStyle = "rgba(240,232,212,.3)"; q.lineWidth = 1.2; q.stroke();
          q.save(); q.translate(.55, -.55); path(r); q.strokeStyle = "rgba(100,86,60,.35)"; q.lineWidth = .15; q.stroke(); q.restore();
          q.save(); q.translate(-.55, .55); path(r); q.strokeStyle = "rgba(100,86,60,.35)"; q.lineWidth = .15; q.stroke(); q.restore();
        }
      } else {
        [[.5, -.5], [-.5, .5]].forEach(function (s) { q.save(); q.translate(s[0], s[1]); path(r); q.strokeStyle = snow ? "rgba(120,130,140,.35)" : "rgba(80,58,30,.34)"; q.lineWidth = .32; q.stroke(); q.restore(); });
        /* kaluže, kamienky a doskové chodníky cez blato */
        var len = 0, step = tier <= 1 ? 6.5 : 10, next = step * .5;
        for (var i = 1; i < r.length; i++) {
          var a = r[i - 1], b2 = r[i], dx = b2[0] - a[0], dy = b2[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
          while (next < len + L) {
            var f = (next - len) / L, px = a[0] + dx * f, py = a[1] + dy * f, hh = hash(ri * 31 + Math.floor(next) * 7);
            if (hh < .45) {
              q.fillStyle = snow ? "rgba(170,190,205,.55)" : "rgba(70,100,120,.45)"; q.beginPath(); q.ellipse(px + nx * (hh - .22) * 2, py + ny * (hh - .22) * 2, .7 + hh, .4 + hh * .4, .4, 0, 7); q.fill();
            } else if (hh < .75) {
              q.strokeStyle = "#6a4a2a"; q.lineWidth = .24;
              for (var k = -2; k <= 2; k++) { q.beginPath(); q.moveTo(px + nx * 1.3 + dx / L * k * .42, py + ny * 1.3 + dy / L * k * .42); q.lineTo(px - nx * 1.3 + dx / L * k * .42, py - ny * 1.3 + dy / L * k * .42); q.stroke(); }
            } else {
              q.fillStyle = "rgba(100,90,70,.6)"; for (var m = 0; m < 4; m++) { q.beginPath(); q.arc(px + nx * (hash(m + next) - .5) * 2.2, py + ny * (hash(m * 3 + next) - .5) * 2.2, .16, 0, 7); q.fill(); }
            }
            next += step * (.8 + hash(next) * .5);
          }
          len += L;
        }
      }
    });
    q.restore();
  };

  /* ---------- námestie, lampy a sady v meste ---------- */
  function distSeg(x, y, a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2)); return Math.hypot(x - (a[0] + dx * t), y - (a[1] + dy * t)); }
  function distPath(x, y, pts) { var m = 1e9; for (var i = 1; i < pts.length; i++) m = Math.min(m, distSeg(x, y, pts[i - 1], pts[i])); return m; }

  window.KSQ = function (env) {
    var I = env.I, pl = env.pl, L = env.L, wc = env.wc, tier = env.tier || 1, P2 = env.P2, tree = env.tree, cyl = env.cyl, box = env.box;
    var E = { I: I, box: box, cyl: cyl };
    /* pranier */
    var px = pl[0] - 3.6, py = pl[1] + 3.2;
    cyl(px, py, .17, 2.4, { tex: "wood", noShadow: 1, finial: false });
    dr(E, px, py, 0, .7, function (x2, q) {
      x2.fillStyle = "#8a5a32"; x2.fillRect(q[0] - 9, q[1] - 10, 18, 4); x2.strokeRect(q[0] - 9, q[1] - 10, 18, 4);
      x2.fillStyle = "#2a1a0e"; x2.beginPath(); x2.arc(q[0] - 3, q[1] - 8, 1.1, 0, 7); x2.arc(q[0] + 3, q[1] - 8, 1.1, 0, 7); x2.fill();
    });
    /* oznamovacia tabuľa */
    var nx = pl[0] + 3.8, ny = pl[1] - 3.3;
    cyl(nx - .8, ny, .12, 2.2, { tex: "wood", noShadow: 1, finial: false }); cyl(nx + .8, ny, .12, 2.2, { tex: "wood", noShadow: 1, finial: false });
    dr(E, nx, ny, 1.2, .8, function (x2, q) {
      x2.fillStyle = "#8a6a3a"; x2.fillRect(q[0] - 9, q[1] - 11, 18, 12); x2.strokeRect(q[0] - 9, q[1] - 11, 18, 12);
      x2.fillStyle = "#f4ecd8"; [[-7, -9, 6, 4], [0, -9, 6, 5], [-5, -4, 8, 4]].forEach(function (p) { x2.fillRect(q[0] + p[0], q[1] + p[1], p[2], p[3]); });
    });
    /* tovar na trhových stánkoch a ľudia pri nich */
    var goods = [["#d8453a", "#f0d050"], ["#7a2f4a", "#c04a6a"], ["#e6c07a", "#c9971a"], ["#6a9a44", "#e8a030"], ["#b8d0e0", "#f4ecd8"]];
    for (var i = 0; i < 10; i++) {
      var a = i / 10 * 6.283 + .3, sx = pl[0] + Math.cos(a) * 9, sy = pl[1] + Math.sin(a) * 6.5, g = goods[i % goods.length];
      (function (sx, sy, g, i) {
        dr(E, sx, sy + 1.3, 0, 1.0, function (x2, q) {
          shadow(x2, q, 9, 2.6);
          x2.fillStyle = "#a47c4c"; x2.fillRect(q[0] - 8, q[1] - 7, 8, 7); x2.strokeRect(q[0] - 8, q[1] - 7, 8, 7); x2.fillRect(q[0] + 1, q[1] - 6, 7, 6); x2.strokeRect(q[0] + 1, q[1] - 6, 7, 6);
          for (var k = 0; k < 4; k++) { x2.fillStyle = g[k % 2]; x2.beginPath(); x2.arc(q[0] - 6 + k * 2, q[1] - 8, 1.9, 0, 7); x2.fill(); }
          for (var k2 = 0; k2 < 3; k2++) { x2.fillStyle = g[(k2 + 1) % 2]; x2.beginPath(); x2.arc(q[0] + 3 + k2 * 2, q[1] - 7, 1.8, 0, 7); x2.fill(); }
        });
        if (i % 2 === 0) folk(E, sx - 1.8, sy + 1.4, ["#8a3a2a", "#2f5bb0", "#5a6a3a", "#6d3f92", "#a07040"][i % 5], i % 4 === 0 ? "#d8c890" : null, false);
      })(sx, sy, g, i);
    }
    /* ľudia na námestí podľa veľkosti mesta */
    var nf = 2 + tier;
    for (var j = 0; j < nf; j++) {
      var aa = j / nf * 6.283 + 2.1, fx = pl[0] + Math.cos(aa) * (2.6 + hash(j) * 2), fy = pl[1] + Math.sin(aa) * (2.2 + hash(j + 9) * 1.4);
      folk(E, fx, fy, ["#8a3a2a", "#2f5bb0", "#5a6a3a", "#6d3f92", "#a07040", "#b8362c", "#3a5a7a"][j % 7], j % 3 === 0 ? "#7a3a2a" : j % 3 === 1 ? "#d8c890" : null, false);
    }
    /* sudy a lavičky na námestí */
    [[-6.2, -1.2], [6.4, 1.8], [-1.5, 5.6]].forEach(function (p, i2) {
      dr(E, pl[0] + p[0], pl[1] + p[1], 0, .7, function (x2, q) {
        shadow(x2, q, 12, 3);
        x2.fillStyle = "#8a6a3a"; x2.fillRect(q[0] - 10, q[1] - 6, 20, 3); x2.strokeRect(q[0] - 10, q[1] - 6, 20, 3);
        x2.fillRect(q[0] - 8, q[1] - 3, 2.4, 5); x2.fillRect(q[0] + 6, q[1] - 3, 2.4, 5);
        if (i2 === 1) { x2.fillStyle = "#8a5a32"; x2.beginPath(); x2.ellipse(q[0] + 14, q[1] - 4, 4, 5.4, 0, 0, 7); x2.fill(); x2.stroke(); }
      });
    });
    /* lampy pozdĺž okružnej cesty (viac v bohatších mestách) */
    var ring = L.ring.map(wc), every = tier >= 4 ? 3 : tier >= 2 ? 5 : 0;
    if (every) for (var r = 0; r < ring.length; r += every) {
      (function (lx, ly) {
        cyl(lx, ly, .11, 2.3, { tex: "wood", noShadow: 1, finial: false });
        I.push({ d: lx + ly + .5, draw: function (x2) {
          var q = P2(lx, ly, 2.3);
          x2.fillStyle = "#2a1a0e"; x2.fillRect(q[0] - 3, q[1] - 7, 6, 7);
          x2.fillStyle = I.T.night ? "#ffd060" : "#9a9a78"; x2.fillRect(q[0] - 2, q[1] - 6, 4, 5);
          if (I.T.night) I.lights.push([q[0], q[1] - 4, 30]);
        } });
      })(ring[r][0] + .9, ring[r][1] - .9);
    }
    /* sady a záhrady medzi okružnou cestou a hradbami */
    var wall = L.wall.map(wc), roads = L.streets.map(function (s) { return s.map(wc); }).concat([ring.concat([ring[0]])]);
    var avoid = [];
    (L.fill || []).forEach(function (f) { avoid.push(wc([f.x, f.y])); });
    Object.keys(L.pos || {}).forEach(function (k2) { var p = L.pos[k2]; if (p) avoid.push(wc([p.x, p.y])); });
    var want = Math.max(0, Math.min(16, 4 + tier * 2)), placed = 0, tries = 0;
    while (placed < want && tries < 120) {
      tries++;
      var ri = Math.floor(hash(tries * 3.1 + tier) * ring.length), rp = ring[ri], bestW = null, bd = 1e9;
      for (var w2 = 0; w2 < wall.length; w2++) { var dd2 = Math.hypot(wall[w2][0] - rp[0], wall[w2][1] - rp[1]); if (dd2 < bd) { bd = dd2; bestW = wall[w2]; } }
      if (!bestW) break;
      var f2 = .3 + hash(tries * 7.7) * .45, tx = rp[0] + (bestW[0] - rp[0]) * f2 + (hash(tries) - .5) * 2, ty = rp[1] + (bestW[1] - rp[1]) * f2 + (hash(tries + 5) - .5) * 2;
      if (Math.hypot(tx - wc(L.pl)[0], ty - wc(L.pl)[1]) < 16) continue;
      var bad = false; for (var q2 = 0; q2 < avoid.length; q2++) if (Math.hypot(tx - avoid[q2][0], ty - avoid[q2][1]) < 4.2) { bad = true; break; }
      if (bad) continue;
      for (var q3 = 0; q3 < roads.length; q3++) if (distPath(tx, ty, roads[q3]) < 2.2) { bad = true; break; }
      if (bad) continue;
      if (distPath(tx, ty, wall) < 2.6) continue;
      tree(tx, ty, .8 + hash(tries * 2) * .6, 1.8 + hash(tries * 5) * 1.2);
      placed++;
    }
  };

  /* ---------- pozemky: tabuľa „na predaj“ a oplotený pozemok hráča ---------- */
  window.KPLOT = function (l, wp, E) {
    var I = E.I, P2 = E.P2, cx = wp[0], cy = wp[1], own = l.own === 0;
    var col = "#b8362c"; try { col = DC(0); } catch (e) { }
    var Ee = { I: I };
    if (own) {
      I.push({ d: cx + cy - 5.5, draw: function (x2) {
        I.groundPlane(x2, function (g) {
          g.fillStyle = "rgba(214,170,76,.16)"; g.fillRect(cx - 2.4, cy - 1.8, 4.8, 3.6);
          g.strokeStyle = col; g.lineWidth = .16; g.setLineDash([.5, .3]); g.strokeRect(cx - 2.4, cy - 1.8, 4.8, 3.6); g.setLineDash([]);
        });
      } });
      [[-2.4, -1.8], [2.4, -1.8], [2.4, 1.8], [-2.4, 1.8]].forEach(function (c, i) {
        seg(Ee, [cx + c[0], cy + c[1], 0], [cx + c[0], cy + c[1], 1.3], "#6b4423", 2.2, cx + cy + c[0] + c[1] + 1);
      });
      var pr = [[-2.4, 1.8], [2.4, 1.8], [2.4, -1.8]];
      for (var i = 0; i < 2; i++) seg(Ee, [cx + pr[i][0], cy + pr[i][1], 1.0], [cx + pr[i + 1][0], cy + pr[i + 1][1], 1.0], "#c9a46a", 1.1, cx + cy + 3);
      I.push({ d: cx + cy + 4, draw: function (x2) { var q = P2(cx - 2.4, cy + 1.8, 1.3); I.flags.push([q[0], q[1], col]); } });
      /* hromada dosiek a kameňov pripravená na stavbu */
      dr(Ee, cx + .8, cy + .6, 0, 2.5, function (x2, q) {
        x2.fillStyle = "rgba(30,20,10,.25)"; x2.beginPath(); x2.ellipse(q[0], q[1] + 1, 11, 3.4, 0, 0, 7); x2.fill();
        for (var r = 0; r < 3; r++) { x2.fillStyle = r % 2 ? "#a47c4c" : "#8a5a32"; x2.fillRect(q[0] - 9, q[1] - 3 - r * 3, 18, 2.6); x2.strokeRect(q[0] - 9, q[1] - 3 - r * 3, 18, 2.6); }
        x2.fillStyle = "#9a9a94"; x2.beginPath(); x2.arc(q[0] + 12, q[1] - 2, 3, 0, 7); x2.arc(q[0] + 15, q[1] - 1, 2.4, 0, 7); x2.fill();
      });
    } else {
      var px = cx - 2.1, py = cy + 1.5;
      seg(Ee, [px, py, 0], [px, py, 2.0], "#5a3a1c", 2, cx + cy + 2);
      seg(Ee, [px, py, 1.9], [px + .9, py, 1.9], "#5a3a1c", 1.4, cx + cy + 2);
      dr(Ee, px + .9, py, 1.4, 2.6, function (x2, q) {
        x2.fillStyle = "#f4ecd8"; x2.fillRect(q[0] - 7, q[1] - 2, 14, 10); x2.strokeRect(q[0] - 7, q[1] - 2, 14, 10);
        x2.fillStyle = "#c9971a"; x2.beginPath(); x2.arc(q[0], q[1] + 3, 3, 0, 7); x2.fill(); x2.stroke();
        x2.fillStyle = INK; x2.font = "700 4px Georgia,serif"; x2.textAlign = "center"; x2.fillText("Z", q[0], q[1] + 4.4);
      });
    }
  };

  /* ---------- živé cesty: vozy, psy a holuby (animácia nad hotovým obrázkom mesta) ---------- */
  function cartSprite(g, x, y, dir, seed) {
    g.save(); g.translate(x, y); g.scale(dir * 1.15, 1.15); g.lineWidth = 1; g.strokeStyle = INK; g.lineJoin = "round";
    g.fillStyle = "rgba(30,20,10,.28)"; g.beginPath(); g.ellipse(2, 3, 22, 4, 0, 0, 7); g.fill();
    /* kôň */
    var hc = ["#6b4423", "#8a8a8a", "#3a2a1a"][seed % 3];
    g.fillStyle = hc; g.beginPath(); g.ellipse(17, -9, 8, 4.6, 0, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(22, -11); g.lineTo(27, -17); g.lineTo(30, -15); g.lineTo(26, -9); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = hc; g.lineWidth = 1.8; g.beginPath(); g.moveTo(12, -6); g.lineTo(11, 1); g.moveTo(15, -6); g.lineTo(15, 1); g.moveTo(20, -6); g.lineTo(21, 1); g.moveTo(23, -6); g.lineTo(24, 1); g.stroke();
    g.strokeStyle = INK; g.lineWidth = 1;
    g.beginPath(); g.moveTo(9, -9); g.lineTo(2, -9); g.stroke();
    /* voz */
    g.fillStyle = "#8a6a3a"; g.fillRect(-14, -14, 17, 7); g.strokeRect(-14, -14, 17, 7);
    if (seed % 2) { g.fillStyle = "#f0e8d4"; g.beginPath(); g.ellipse(-5.5, -15, 8, 5.4, 0, 3.14, 6.28); g.fill(); g.stroke(); }
    else { g.fillStyle = "#c9a24a"; [-10, -5, 0].forEach(function (dx) { g.beginPath(); g.arc(dx, -15.5, 3.2, 0, 7); g.fill(); g.stroke(); }); }
    [-10, 0].forEach(function (dx) { g.fillStyle = "#6b4423"; g.beginPath(); g.arc(dx, -3, 4.4, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#3a2410"; g.beginPath(); g.arc(dx, -3, 1.2, 0, 7); g.fill(); });
    /* vozka */
    g.fillStyle = ["#2f5bb0", "#7a4d23", "#6d3f92"][seed % 3]; g.beginPath(); g.moveTo(3, -14); g.quadraticCurveTo(2, -23, 6, -24); g.quadraticCurveTo(10, -23, 9, -14); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#e0b090"; g.beginPath(); g.arc(6, -27, 3, 0, 7); g.fill(); g.stroke();
    g.restore();
  }
  function dogSprite(g, x, y, dir, t, col) {
    g.save(); g.translate(x, y); g.scale(dir, 1); g.lineWidth = .9; g.strokeStyle = INK;
    g.fillStyle = "rgba(30,20,10,.25)"; g.beginPath(); g.ellipse(0, 1.5, 7, 2, 0, 0, 7); g.fill();
    var l = Math.sin(t * 14) * 1.6;
    g.strokeStyle = col; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-3, -3); g.lineTo(-3 + l, 1); g.moveTo(3, -3); g.lineTo(3 - l, 1); g.stroke();
    g.strokeStyle = INK; g.lineWidth = .9; g.fillStyle = col;
    g.beginPath(); g.ellipse(0, -4.4, 5.6, 2.8, 0, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.arc(6, -6.4, 2.4, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-5, -5); g.lineTo(-8, -8 + Math.sin(t * 12) * 1.2); g.stroke();
    g.restore();
  }
  window.KLIVE = function (g, C, t, walk, P2, I) {
    var night = I.T && I.T.night, fest = false;
    var n = Math.min(3, walk.length);
    for (var ri = 0; ri < n; ri++) {
      var r = walk[ri]; if (!r || r.length < 2) continue;
      var segs = r.length - 1;
      var u = (t * .011 * (1 + ri * .25) + ri * .37) % 1, si = Math.min(segs - 1, Math.floor(u * segs)), f = u * segs - si, a = r[si], b = r[si + 1];
      var q = P2(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 0), qa = P2(a[0], a[1], 0), qb = P2(b[0], b[1], 0);
      if (!night || ri === 0) cartSprite(g, q[0], q[1], qb[0] >= qa[0] ? 1 : -1, ri + 1);
      /* pes */
      var u2 = (t * .02 + ri * .21 + .5) % 1, s2 = Math.min(segs - 1, Math.floor(u2 * segs)), f2 = u2 * segs - s2, a2 = r[s2], b2 = r[s2 + 1];
      var q2 = P2(a2[0] + (b2[0] - a2[0]) * f2, a2[1] + (b2[1] - a2[1]) * f2, 0), qa2 = P2(a2[0], a2[1], 0), qb2 = P2(b2[0], b2[1], 0);
      if (!night) dogSprite(g, q2[0], q2[1], qb2[0] >= qa2[0] ? 1 : -1, t + ri, ["#c9a46a", "#3a2a1a", "#d8d0c0"][ri % 3]);
    }
    /* holuby nad námestím */
    if (!night && C.L && C.L.pl) {
      var L = C.L, pl = [(L.pl[0] - L.cx) / 10, (L.pl[1] - L.cy) / 10], c = P2(pl[0], pl[1], 0);
      g.save(); g.strokeStyle = "#4a4a58"; g.lineWidth = 1.3; g.lineCap = "round";
      for (var i = 0; i < 6; i++) {
        var ang = t * .35 + i * 1.05, x = c[0] + Math.cos(ang) * (70 + i * 9), y = c[1] - 70 - i * 6 + Math.sin(ang * 1.7) * 10, fl = Math.sin(t * 9 + i) * 2.4;
        g.beginPath(); g.moveTo(x - 5, y + fl); g.lineTo(x, y); g.lineTo(x + 5, y + fl); g.stroke();
      }
      g.restore();
    }
  };

  /* ---------- chodníky: od dverí k ulici a medzi susednými budovami ---------- */
  function nearOnPath(x, y, pts) {
    var best = null, bd = 1e9;
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2));
      var px = a[0] + dx * t, py = a[1] + dy * t, d = Math.hypot(x - px, y - py);
      if (d < bd) { bd = d; best = [px, py]; }
    }
    return { d: bd, p: best };
  }
  window.KPATH = function (q, roads, tier, env) {
    var L = env.L, wc = env.wc, lots = env.lots, snow = env.snow, pl = wc(L.pl);
    var doors = [];
    lots.forEach(function (l) {
      var p = L.pos[l.id]; if (!p || l.pub === "trh") return;
      var w = wc([p.x, p.y]), dd = 3;
      if (l.res != null) dd = 3.6 + ((S.dyn[l.res] || {}).house || 0) * .2;
      else if (l.b != null) { var b = S.bld.find(function (z) { return z.id === l.b; }); dd = 3 + ((b && b.lvl) || 1) * .2; }
      else if (l.pub) dd = l.pub === "hrad" ? 5 : 3.2;
      else if (l.own !== 0) return;
      else dd = 1.6;
      doors.push({ id: l.id, x: w[0], y: w[1] + dd / 2 + .4 });
    });
    var edges = {}, list = [];
    function add(a, b, k) { var key = k || (Math.min(a.id, b.id) + ":" + Math.max(a.id, b.id)); if (edges[key]) return; edges[key] = 1; list.push([a, b]); }
    var roadEnds = [];
    doors.forEach(function (d) {
      var best = null, bd = 1e9;
      roads.forEach(function (r) { var n = nearOnPath(d.x, d.y, r); if (n.d < bd) { bd = n.d; best = n.p; } });
      var dp = Math.hypot(d.x - pl[0], d.y - pl[1]) - 12;
      if (dp < bd && dp > 0) { var f = 12 / Math.hypot(d.x - pl[0], d.y - pl[1]); best = [pl[0] + (d.x - pl[0]) * f, pl[1] + (d.y - pl[1]) * f]; bd = dp; }
      if (best && bd < 15) { roadEnds.push([d, { id: "r" + d.id, x: best[0], y: best[1] }]); }
      var nb = doors.filter(function (o) { return o !== d; }).map(function (o) { return { o: o, dd: Math.hypot(o.x - d.x, o.y - d.y) }; }).sort(function (a, b2) { return a.dd - b2.dd; });
      for (var k = 0; k < 2; k++) if (nb[k] && nb[k].dd < 13) add(d, nb[k].o);
    });
    roadEnds.forEach(function (e) { add(e[0], e[1], "r" + e[0].id); });
    q.save(); q.lineCap = "round"; q.lineJoin = "round";
    var edge = snow ? "rgba(120,125,135,.55)" : tier >= 3 ? "rgba(90,76,52,.45)" : "rgba(80,58,30,.38)";
    var fill = snow ? "#e6eaf0" : tier >= 3 ? "#cfc4a6" : "#b99d6c";
    list.forEach(function (e, i) {
      var a = e[0], b = e[1], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, L2 = Math.hypot(dx, dy) || 1, w = (hash(i * 3.7 + a.id) - .5) * 1.4;
      var cx = mx - dy / L2 * w, cy = my + dx / L2 * w;
      q.beginPath(); q.moveTo(a.x, a.y); q.quadraticCurveTo(cx, cy, b.x, b.y);
      q.strokeStyle = edge; q.lineWidth = .95; q.stroke();
      q.strokeStyle = fill; q.lineWidth = .68; q.stroke();
      if (tier >= 3) { q.strokeStyle = "rgba(90,76,52,.35)"; q.lineWidth = .52; q.setLineDash([.14, .22]); q.stroke(); q.setLineDash([]); }
    });
    q.restore();
  };

  /* ---------- predmestie pri bránach: rastie s úrovňou mesta ---------- */
  window.KSUB = function (env) {
    var grow = env.grow | 0; if (grow <= 0) return;
    var L = env.L, wc = env.wc, house = env.house, c = wc([L.cx, L.cy]);
    var river = L.river ? L.river.map(wc) : null, roads = L.streets.map(function (s) { return s.map(wc); });
    var n = grow * 3, placed = 0;
    L.gates.forEach(function (g, gi) {
      var gw = wc(g), dx = gw[0] - c[0], dy = gw[1] - c[1], ln = Math.hypot(dx, dy) || 1, ux = dx / ln, uy = dy / ln, px = -uy, py = ux;
      for (var k = 0; k < n; k++) {
        var side = k % 2 ? 1 : -1, off = 4.6 + hash(gi * 17 + k) * 2, dist = 7 + Math.floor(k / 2) * 4.2 + hash(k + gi) * 1.2;
        var x = gw[0] + ux * dist + px * side * off, y = gw[1] + uy * dist + py * side * off;
        if (river && distPath(x, y, river) < 8) continue;
        var bad = false; roads.forEach(function (r) { if (distPath(x, y, r) < 2.6) bad = true; }); if (bad) continue;
        var thatch = hash(k * 5 + gi) < .6;
        house(x - 1.6, y - 1.2, 3.2, 2.4, 2, { tex: "plaster", roof: thatch ? "thatch" : "tile", rh: 1.3, sqY: [[1, .9, .6, .7]], sqX: [[.8, .9, .6, .7]], door: [1.3, .9, 1.2, false] });
        placed++;
      }
    });
  };

  /* ---------- čitateľný erb nad sídlom rodu (vektor, prekrýva mapu) ---------- */
  (function () {
    try {
      var st = document.createElement("style");
      st.textContent = ".kerb{position:absolute;transform:translate(-50%,-100%);width:max(2.9%,20px);pointer-events:none;z-index:4;filter:drop-shadow(0 0 1.2px #fbf3dc) drop-shadow(0 0 1.2px #fbf3dc) drop-shadow(0 3px 2px rgba(0,0,0,.5))}" +
        ".kerb svg{display:block;width:100%;height:auto}" +
        ".kerb::after{content:'';position:absolute;left:50%;top:96%;width:2px;height:9px;margin-left:-1px;background:#4a3118;border-radius:1px}" +
        ".kerb.mine{width:max(3.5%,24px);filter:drop-shadow(0 0 1.5px #f6dc8a) drop-shadow(0 0 3px #f2c94c) drop-shadow(0 3px 2px rgba(0,0,0,.55))}";
      document.head.appendChild(st);
    } catch (e) { }
  })();
  window.KKERB = function (cont, btn, l, x1, y1, x2, y2, W, H) {
    if (cont.dataset.kk !== cont.dataset.hk) { cont.querySelectorAll(".kerb").forEach(function (e) { e.remove(); }); cont.dataset.kk = cont.dataset.hk; }
    if (l.res == null || !window.shield) return;
    var d = S.dyn[l.res]; if (!d) return;
    var sp = document.createElement("span"); sp.className = "kerb" + (d.id === 0 ? " mine" : "");
    sp.innerHTML = shield(d.id, 40); sp.setAttribute("aria-hidden", "true");
    var sv = sp.querySelector("svg"); if (sv) { ["width:100%", "height:auto", "max-width:none", "min-width:0", "display:block", "position:static", "margin:0", "aspect-ratio:20/24"].forEach(function (r) { var kv = r.split(":"); sv.style.setProperty(kv[0], kv[1], "important"); }); }
    sp.style.left = (((x1 + x2) / 2) / W * 100).toFixed(2) + "%"; sp.style.top = (y1 / H * 100 + 1.2).toFixed(2) + "%";
    cont.appendChild(sp);
  };
})();

;
