/* ==== js/budovy.js ==== */
/* Prešporok 1400 – rozmanité budovy v meste: tvary podľa remesla a úrovne, poschodia, prístavby, veže, rekvizity. Autor: Dávid Mucha. */
(function () {
  "use strict";
  function hash(n) { var x = Math.sin(n * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); }
  var INK = "#2b2117";

  /* ---------- pomocné kreslenie rekvizít (obrazovkové súradnice cez projekciu P) ---------- */
  function deco(E, wx, wy, dz, fn, off) {
    var P = E.I.P;
    E.I.push({ d: wx + wy + (off == null ? .6 : off), draw: function (x2) { var q = P(wx, wy, dz || 0); x2.save(); x2.lineWidth = 1.1; x2.strokeStyle = INK; fn(x2, q); x2.restore(); } });
  }
  function shadow(x2, q, rx, ry) { x2.fillStyle = "rgba(30,20,10,.26)"; x2.beginPath(); x2.ellipse(q[0], q[1] + 1, rx, ry || rx * .4, 0, 0, 7); x2.fill(); }
  function barrel(E, wx, wy, tone) {
    deco(E, wx, wy, 0, function (x2, q) {
      shadow(x2, q, 6, 2.4);
      x2.fillStyle = tone || "#8a5a32"; x2.beginPath(); x2.moveTo(q[0] - 5, q[1]); x2.quadraticCurveTo(q[0] - 7, q[1] - 6, q[0] - 5, q[1] - 12); x2.lineTo(q[0] + 5, q[1] - 12); x2.quadraticCurveTo(q[0] + 7, q[1] - 6, q[0] + 5, q[1]); x2.closePath(); x2.fill(); x2.stroke();
      x2.fillStyle = "#a07040"; x2.beginPath(); x2.ellipse(q[0], q[1] - 12, 5, 2, 0, 0, 7); x2.fill(); x2.stroke();
      x2.strokeStyle = "#3a2410"; x2.beginPath(); x2.moveTo(q[0] - 6, q[1] - 4); x2.lineTo(q[0] + 6, q[1] - 4); x2.moveTo(q[0] - 6, q[1] - 8.5); x2.lineTo(q[0] + 6, q[1] - 8.5); x2.stroke();
    });
  }
  function crate(E, wx, wy, k) {
    deco(E, wx, wy, 0, function (x2, q) {
      shadow(x2, q, 7, 2.6);
      x2.fillStyle = "#a47c4c"; x2.fillRect(q[0] - 6, q[1] - 9, 12, 9); x2.strokeRect(q[0] - 6, q[1] - 9, 12, 9);
      x2.strokeStyle = "#5a3c1c"; x2.beginPath(); x2.moveTo(q[0] - 6, q[1] - 4.5); x2.lineTo(q[0] + 6, q[1] - 4.5); x2.stroke();
      if (k) { x2.fillStyle = k; x2.beginPath(); x2.arc(q[0] - 2, q[1] - 10, 2.2, 0, 7); x2.arc(q[0] + 2.5, q[1] - 10, 2.2, 0, 7); x2.fill(); }
    });
  }
  function sack(E, wx, wy, tone) {
    deco(E, wx, wy, 0, function (x2, q) {
      shadow(x2, q, 5.5, 2);
      x2.fillStyle = tone || "#d8c690"; x2.beginPath(); x2.moveTo(q[0] - 5, q[1]); x2.quadraticCurveTo(q[0] - 7, q[1] - 8, q[0] - 2, q[1] - 11); x2.lineTo(q[0] + 2, q[1] - 11); x2.quadraticCurveTo(q[0] + 7, q[1] - 8, q[0] + 5, q[1]); x2.closePath(); x2.fill(); x2.stroke();
    });
  }
  function pot(E, wx, wy, tone) {
    deco(E, wx, wy, 0, function (x2, q) {
      shadow(x2, q, 4, 1.6);
      x2.fillStyle = tone || "#c9752e"; x2.beginPath(); x2.ellipse(q[0], q[1] - 4, 4.2, 4.6, 0, 0, 7); x2.fill(); x2.stroke();
    });
  }
  function quad(E, pts, fill, stroke) {
    var P = E.I.P;
    E.I.push({ d: pts[0][0] + pts[0][1] - 5, draw: function (x2) {
      x2.save(); x2.fillStyle = fill; x2.beginPath(); pts.forEach(function (p, i) { var q = P(p[0], p[1], p[2] || 0); i ? x2.lineTo(q[0], q[1]) : x2.moveTo(q[0], q[1]); }); x2.closePath(); x2.fill();
      if (stroke) { x2.strokeStyle = stroke; x2.lineWidth = 1; x2.stroke(); } x2.restore();
    } });
  }
  function bed(E, wx, wy, w, d, tone, dots) {
    quad(E, [[wx, wy], [wx + w, wy], [wx + w, wy + d], [wx, wy + d]], tone, "rgba(40,28,12,.55)");
    deco(E, wx + w / 2, wy + d / 2, .05, function (x2, q) {
      for (var i = 0; i < 7; i++) { x2.fillStyle = dots[i % dots.length]; x2.beginPath(); x2.arc(q[0] - 9 + i * 3, q[1] - 2 + ((i * 7) % 4) - 1, 1.8, 0, 7); x2.fill(); }
    }, -3);
  }
  function wheel(E, wx, wy0, wy1, zc, R) {
    var P = E.I.P;
    E.I.push({ d: wx + wy1 + .4, draw: function (x2) {
      var t = Date.now() / 900, N = 10; x2.save(); x2.lineWidth = 1.3; x2.strokeStyle = INK;
      var yc = (wy0 + wy1) / 2, hw = (wy1 - wy0) / 2;
      [-1, 1].forEach(function (s) {
        x2.beginPath(); for (var i = 0; i <= 24; i++) { var a = i / 24 * 6.2832, q = P(wx, yc + s * hw + Math.cos(a) * R * .05, zc + Math.sin(a) * R); i ? x2.lineTo(q[0], q[1]) : x2.moveTo(q[0], q[1]); } x2.stroke();
      });
      x2.strokeStyle = "#4a2e14"; x2.lineWidth = 1.2;
      for (var k = 0; k < N; k++) {
        var a2 = t + k / N * 6.2832, c = P(wx, yc, zc), p1 = P(wx, yc, zc + 0), e = [Math.cos(a2), Math.sin(a2)];
        var u = P(wx, yc - hw, zc + e[1] * R), v = P(wx, yc + hw, zc + e[1] * R + 0);
        x2.beginPath(); x2.moveTo(c[0], c[1]); x2.lineTo(P(wx, yc, zc + e[1] * R)[0] + (u[0] - P(wx, yc, zc + e[1] * R)[0]) * 0, P(wx, yc, zc + e[1] * R)[1]); x2.stroke();
        x2.fillStyle = "#6a4422"; x2.beginPath(); x2.moveTo(u[0], u[1]); x2.lineTo(v[0], v[1]); x2.lineTo(v[0], v[1] + 3); x2.lineTo(u[0], u[1] + 3); x2.closePath(); x2.fill(); x2.stroke();
      }
      x2.restore();
    } });
  }
  function forge(E, wx, wy) {
    var P = E.I.P;
    E.I.push({ d: wx + wy + .8, draw: function (x2) {
      var q = P(wx, wy, 1.0), f = .75 + Math.sin(Date.now() / 90) * .15 + Math.sin(Date.now() / 37) * .1;
      x2.save(); x2.globalCompositeOperation = "screen"; var g = x2.createRadialGradient(q[0], q[1], 1, q[0], q[1], 22 * f);
      g.addColorStop(0, "rgba(255,170,60," + .75 * f + ")"); g.addColorStop(1, "rgba(255,110,20,0)"); x2.fillStyle = g; x2.fillRect(q[0] - 24, q[1] - 24, 48, 48); x2.restore();
      x2.fillStyle = "#e86a1c"; x2.beginPath(); x2.ellipse(q[0], q[1], 4.5 * f, 3, 0, 0, 7); x2.fill();
      x2.fillStyle = "#ffd56a"; x2.beginPath(); x2.ellipse(q[0], q[1] - 1, 2, 1.4, 0, 0, 7); x2.fill();
      var a = P(wx - .5, wy + .8, 0);
      x2.fillStyle = "#3a3a42"; x2.strokeStyle = INK; x2.lineWidth = 1.1; x2.beginPath(); x2.moveTo(a[0] - 6, a[1] - 7); x2.lineTo(a[0] + 6, a[1] - 7); x2.lineTo(a[0] + 4, a[1] - 4); x2.lineTo(a[0] + 2, a[1] - 4); x2.lineTo(a[0] + 3, a[1]); x2.lineTo(a[0] - 3, a[1]); x2.lineTo(a[0] - 2, a[1] - 4); x2.lineTo(a[0] - 4, a[1] - 4); x2.closePath(); x2.fill(); x2.stroke();
    } });
  }
  function cloth(E, wx, wy, tones) {
    deco(E, wx, wy, 0, function (x2, q) {
      var t = Date.now() / 700;
      x2.strokeStyle = "#4a2e14"; x2.lineWidth = 1.5; x2.beginPath(); x2.moveTo(q[0] - 14, q[1]); x2.lineTo(q[0] - 14, q[1] - 22); x2.moveTo(q[0] + 14, q[1]); x2.lineTo(q[0] + 14, q[1] - 22); x2.moveTo(q[0] - 14, q[1] - 21); x2.lineTo(q[0] + 14, q[1] - 21); x2.stroke();
      x2.lineWidth = 1;
      for (var i = 0; i < 4; i++) { var sw = Math.sin(t + i) * 1.2; x2.fillStyle = tones[i % tones.length]; x2.beginPath(); x2.moveTo(q[0] - 12 + i * 7, q[1] - 21); x2.lineTo(q[0] - 7 + i * 7, q[1] - 21); x2.lineTo(q[0] - 7 + i * 7 + sw, q[1] - 8); x2.lineTo(q[0] - 12 + i * 7 + sw, q[1] - 8); x2.closePath(); x2.fill(); x2.stroke(); }
    });
  }
  function hides(E, wx, wy) {
    deco(E, wx, wy, 0, function (x2, q) {
      x2.strokeStyle = "#4a2e14"; x2.lineWidth = 1.5; x2.beginPath(); x2.moveTo(q[0] - 10, q[1]); x2.lineTo(q[0] - 10, q[1] - 18); x2.moveTo(q[0] + 10, q[1]); x2.lineTo(q[0] + 10, q[1] - 18); x2.moveTo(q[0] - 10, q[1] - 17); x2.lineTo(q[0] + 10, q[1] - 17); x2.stroke();
      x2.lineWidth = 1; [["#8a5a32", -7], ["#a87444", 1]].forEach(function (h) { x2.fillStyle = h[0]; x2.beginPath(); x2.moveTo(q[0] + h[1], q[1] - 17); x2.lineTo(q[0] + h[1] + 7, q[1] - 17); x2.lineTo(q[0] + h[1] + 6, q[1] - 5); x2.lineTo(q[0] + h[1] + 3.5, q[1] - 7); x2.lineTo(q[0] + h[1] + 1, q[1] - 4); x2.closePath(); x2.fill(); x2.stroke(); });
    });
  }
  function logs(E, wx, wy) {
    deco(E, wx, wy, 0, function (x2, q) {
      shadow(x2, q, 9, 3);
      for (var r = 0; r < 3; r++) for (var i = 0; i < 3 - r; i++) { var cx = q[0] - 6 + i * 6 + r * 3, cy = q[1] - 3 - r * 5; x2.fillStyle = "#9a6a3a"; x2.beginPath(); x2.arc(cx, cy, 3, 0, 7); x2.fill(); x2.stroke(); x2.fillStyle = "#d7ac70"; x2.beginPath(); x2.arc(cx, cy, 1.5, 0, 7); x2.fill(); }
    });
  }
  function ivy(E, wx, wy, w, z0, z1, tone) {
    quad(E, [[wx, wy, z0], [wx + w, wy, z0], [wx + w, wy, z1], [wx, wy, z1]], tone || "rgba(60,110,40,.55)", null);
  }

  /* okenice a kvetinové truhlíky na oknách (priečelie na juhu = os X, bočná stena na východe = os Y) */
  function shutterQuad(E, pts, tone, d) {
    var P = E.I.P;
    E.I.push({ d: d, draw: function (x2) {
      x2.save(); x2.fillStyle = tone; x2.strokeStyle = "rgba(30,20,10,.7)"; x2.lineWidth = .8; x2.beginPath();
      pts.forEach(function (p, i) { var q = P(p[0], p[1], p[2]); i ? x2.lineTo(q[0], q[1]) : x2.moveTo(q[0], q[1]); }); x2.closePath(); x2.fill(); x2.stroke(); x2.restore();
    } });
  }
  function shuttersY(E, x0, y, xend, pos, z, ww, hh, tone, d, flowers) {
    /* priečelie (stena y = y, pozícia od x0) */
    var a = x0 + pos, b = a + ww, s = .34;
    shutterQuad(E, [[a - s, y, z], [a - .02, y, z], [a - .02, y, z + hh], [a - s, y, z + hh]], tone, d);
    shutterQuad(E, [[b + .02, y, z], [b + s, y, z], [b + s, y, z + hh], [b + .02, y, z + hh]], tone, d);
    if (flowers) deco(E, a + ww / 2, y + .08, z - .12, function (x2, q) {
      x2.fillStyle = "#6a4422"; x2.fillRect(q[0] - 7, q[1] - 2, 14, 3.5); x2.strokeRect(q[0] - 7, q[1] - 2, 14, 3.5);
      var cs = ["#d8453a", "#f0d050", "#e86a9a", "#f4f0e6"]; for (var i = 0; i < 5; i++) { x2.fillStyle = cs[(i + flowers) % 4]; x2.beginPath(); x2.arc(q[0] - 6 + i * 3, q[1] - 3, 1.6, 0, 7); x2.fill(); }
    }, d - (x0 + pos + y) + .3);
  }
  function shuttersX(E, x, y0, yend, pos, z, ww, hh, tone, d) {
    /* bočná stena (x = x), pozícia sa meria od južného rohu smerom na sever */
    var a = yend - pos, b = a - ww, s = .34;
    shutterQuad(E, [[x, a + .02, z], [x, a + s, z], [x, a + s, z + hh], [x, a + .02, z + hh]], tone, d);
    shutterQuad(E, [[x, b - s, z], [x, b - .02, z], [x, b - .02, z + hh], [x, b - s, z + hh]], tone, d);
  }
  var TONES = { kovac: "#3a3a42", pekar: "#a8452a", krcma: "#2f6b3a", vinar: "#5a1a3a", tkac: "#2f5bb0", kupec: "#6d3f92", lekaren: "#2f7d46", hrnciar: "#b8643a", tesar: "#7a5a2a", garbiar: "#6b4a2a", pisaren: "#3a3a3a", zlatnik: "#d6aa4c", mlyn: "#6b4a2a", sklaren: "#3a7a8a", pivovar: "#7a5a2a", tlaciaren: "#3a3a3a" };
  var EARTH = ["#6b3a2a", "#3a5a3a", "#2f4a6a", "#7a5a2a", "#8a3a3a"];
  function addShutters(E, T, lvl, x0, y0, w, dd, h, jet, rnd) {
    var tone = TONES[T] || EARTH[Math.floor(rnd * EARTH.length)], yS = y0 + dd, xE = x0 + w;
    var dd2 = x0 + w + y0 + dd + .25, fl = (T === "krcma" || T === "vinar" || T === "lekaren" || T === "dom" || T === "kupec") ? 1 + Math.floor(rnd * 3) : 0;
    if (jet) {
      var h1 = h * .56, h2 = h * .52, j = .3;
      shuttersY(E, x0, yS, xE, w * .2, h1 * .35, .8, .9, tone, dd2, fl);
      shuttersY(E, x0, yS, xE, w * .68, h1 * .35, .8, .9, tone, dd2, 0);
      shuttersY(E, x0 - j, yS + j, xE, w * .2, h1 + h2 * .32, .9, 1, tone, dd2 + .4, fl);
      shuttersY(E, x0 - j, yS + j, xE, w * .6, h1 + h2 * .32, .9, 1, tone, dd2 + .4, 0);
      shuttersX(E, xE, y0, yS, dd * .3, h1 * .35, .8, .9, tone, dd2);
    } else {
      shuttersY(E, x0, yS, xE, w * .25, h * .45, .8, .9, tone, dd2, fl);
      shuttersY(E, x0, yS, xE, w * .65, h * .45, .8, .9, tone, dd2, 0);
      shuttersX(E, xE, y0, yS, w * .3 - .4, h * .45, .8, .9, tone, dd2);
    }
  }

  /* ---------- tvary ---------- */
  function jetty(E, x0, y0, w, d, h, o, tex2) {
    var h1 = h * .56, h2 = h * .52, j = .3, tpu = o.tpu || 14;
    E.box(x0, y0, w, d, h1, { tex: o.base || o.tex, quoin: o.quoin, sqY: [[w * .2, h1 * .35, .8, .9], [w * .68, h1 * .35, .8, .9]], doorY: [w * .5 - .5, 1, 1.4, true], sqX: [[d * .3, h1 * .35, .8, .9]], noTop: 1, tpu: tpu, band: 0 });
    E.box(x0 - j, y0 - j, w + 2 * j, d + 2 * j, h2, { z: h1, zg: 0, tex: tex2 || "timber", sqY: [[w * .2, h2 * .32, .9, 1], [w * .6, h2 * .32, .9, 1]], sqX: [[d * .3, h2 * .32, .9, 1]], noTop: 1, tpu: tpu, dd: .05 });
    E.gable(x0 - j, y0 - j, w + 2 * j, d + 2 * j, h1 + h2, o.rh || w * .4, o.roof, { chim: o.chim, dormer: !!o.dormer, tpu: 12 });
  }
  function wing(E, x0, y0, w, d, h, o, side) {
    /* nižšie krídlo za hlavným domom (na severe), viditeľné vedľa strechy */
    var ww = w * (.55 + .1 * side), wd = 1.9, wh = h * .62;
    E.box(x0 + (side ? 0 : w - ww), y0 - wd + .2, ww, wd, wh, { tex: o.tex, quoin: 0, sqX: [[.6, wh * .45, .7, .8]], sqY: [[ww * .4, wh * .45, .8, .8]], noTop: 1, tpu: 14 });
    E.gable(x0 + (side ? 0 : w - ww), y0 - wd + .2, ww, wd, wh, ww * .26, o.roof, { tpu: 12 });
  }
  function turret(E, cx, cy, h, roofH, tex) { E.cyl(cx, cy, .85, h, { roof: roofH, finial: true, tex: tex || "cyl" }); }

  /* ---------- hlavný vstup ---------- */
  window.KHX = function (t, lv, cx, cy, w, dd, h, E, o) {
    var l = E.l, rnd = hash(l.id + 1), rnd2 = hash(l.id * 3 + 7), x0 = cx - w / 2, y0 = cy - dd / 2;
    var T = String(t);
    if (T === "brloh" || T === "pasovanie" || T === "bana") return false;
    var stone = T === "kovac" || T === "pisaren" || T === "zlatnik";
    var op = Object.assign({}, o);
    if (stone) op.tex = "wall";

    var worked = true;
    /* --- tvary podľa úrovne --- */
    var drawn = false;
    if (lv >= 3 && (T === "krcma" || T === "vinar" || T === "kupec" || T === "tkac" || T === "lekaren" || T === "pekar" || T === "hrnciar" || T === "tesar" || T === "garbiar" || T === "dom")) {
      var stoneBase = (T === "krcma" || T === "vinar" || T === "kupec" || T === "lekaren" || T === "hrnciar");
      jetty(E, x0, y0, w, dd * 1.0, h * 1.12, Object.assign({}, op, { base: stoneBase && rnd < .75 ? "wall" : op.tex, dormer: lv >= 3 }));
      addShutters(E, T, lv, x0, y0, w, dd, h * 1.12, true, rnd);
      drawn = true;
    } else if (lv === 2 && T !== "kovac" && rnd > .35) {
      E.house(x0, y0, w, dd, h, op); wing(E, x0, y0, w, dd, h, op, rnd2 > .5 ? 1 : 0); drawn = true;
    }
    if (!drawn) { E.house(x0, y0, w, dd, h, op); if (T !== "kovac" && T !== "pisaren" && T !== "zlatnik") addShutters(E, T, lv, x0, y0, w, dd, h, false, rnd); }
    else if (lv === 2) addShutters(E, T, lv, x0, y0, w, dd, h, false, rnd);

    /* veža na väčších domoch */
    if (lv >= 4 && (T === "kupec" || T === "pisaren" || T === "zlatnik" || T === "krcma")) turret(E, x0 + .6, y0 + .6, h + 1.4, 2.2);
    if (lv >= 5 && T !== "dom") turret(E, x0 + w - .6, y0 + .6, h + 1.0, 2);

    /* --- rekvizity podľa remesla --- */
    var fx = x0 + w + .9, fy = y0 + dd * .3;   /* východ */
    var sx = x0 + w * .3, sy = y0 + dd + .9;   /* juh */
    switch (T) {
      case "kovac":
        E.box(x0 + w * .15, y0 + dd * .45, 1, 1, h + 2.2, { tex: "wall", quoin: 1, noTop: 0, tpu: 10 });
        E.box(x0 + w, y0 + .5, 1.8, dd - 1, h * .48, { tex: "wood", noTop: 1, tpu: 8, noShadow: 0 });
        E.gable(x0 + w, y0 + .5, 1.8, dd - 1, h * .48, .8, "slate", { tpu: 12 });
        forge(E, x0 + w + 1.0, y0 + dd * .55);
        break;
      case "pekar":
        E.cyl(x0 + w + .6, y0 + dd * .62, .95, h * .55, { roof: 1.3, tile: true, tex: "cyl" });
        crate(E, sx + .4, sy, "#d8a24a"); sack(E, sx + 1.4, sy + .2);
        break;
      case "krcma":
        barrel(E, sx, sy); barrel(E, sx + .9, sy + .2); barrel(E, fx, y0 + dd * .75, "#7a4a2a");
        break;
      case "vinar":
        barrel(E, sx, sy, "#6a3a2a"); barrel(E, sx + .9, sy, "#6a3a2a"); barrel(E, sx + .45, sy + .6, "#6a3a2a");
        ivy(E, x0 + .3, y0 + dd + .02, w * .5, .4, Math.min(h * .8, 2.4), "rgba(70,100,40,.6)");
        break;
      case "tkac":
        cloth(E, fx + .6, y0 + dd * .7, ["#2f5bb0", "#b8362c", "#e0b04a", "#2f7d46"]);
        break;
      case "kupec":
        crate(E, sx, sy, "#c9971a"); crate(E, sx + .9, sy, null); sack(E, sx + .5, sy + .8);
        sack(E, fx, y0 + dd * .8, "#c8b880");
        break;
      case "lekaren":
        bed(E, x0 + w + .3, y0 + .3, 1.4, dd * .55, "#5a7a3a", ["#e8e0a0", "#c04a6a", "#8ab060"]);
        break;
      case "hrnciar":
        E.cyl(x0 + w + .6, y0 + dd * .5, .8, h * .6, { roof: 1, tile: true, tex: "cyl" });
        pot(E, sx, sy); pot(E, sx + .8, sy + .1, "#a8512a"); pot(E, sx + .4, sy + .6, "#d08840");
        break;
      case "tesar":
        logs(E, fx + .3, y0 + dd * .45);
        break;
      case "garbiar":
        hides(E, fx + .4, y0 + dd * .65);
        break;
      case "mlyn":
        wheel(E, x0 + w + .15, y0 + .5, y0 + dd - .5, 1.9, 1.7);
        sack(E, sx, sy);
        break;
      case "zlatnik":
        deco(E, sx + .3, sy, 0, function (x2, q) { x2.fillStyle = "#e3be4f"; x2.fillRect(q[0] - 4, q[1] - 5, 8, 5); x2.strokeRect(q[0] - 4, q[1] - 5, 8, 5); });
        break;
      case "pisaren":
        deco(E, sx + .3, sy, 0, function (x2, q) { x2.fillStyle = "#f6efdc"; x2.fillRect(q[0] - 5, q[1] - 7, 10, 7); x2.strokeRect(q[0] - 5, q[1] - 7, 10, 7); });
        break;
      case "dom":
        if (lv >= 2 && rnd > .5) { barrel(E, sx, sy, "#8a5a32"); }
        if (rnd2 > .5) pot(E, sx + .9, sy, "#c9752e");
        break;
      default:
        if (rnd > .5) barrel(E, sx, sy);
        break;
    }
    return true;
  };
})();

;
