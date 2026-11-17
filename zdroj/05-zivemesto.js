/* ==== js/zivemesto.js ==== */
/* Prešporok 1400 – živé mesto: vozy, remeselníci, deti, psy, jarmok, vojna a mor na mape. Autor: Dávid Mucha. */
(function () {
  "use strict";
  var LC = [];   /* cache dĺžok trás */
  function lens(route) {
    for (var i = 0; i < LC.length; i++) if (LC[i].r === route) return LC[i];
    var cum = [0];
    for (var j = 1; j < route.length; j++) cum.push(cum[j - 1] + Math.hypot(route[j][0] - route[j - 1][0], route[j][1] - route[j - 1][1]));
    var o = { r: route, cum: cum, tot: cum[cum.length - 1] || 1 };
    LC.push(o); if (LC.length > 40) LC.shift();
    return o;
  }
  /* bod na trase, chodí tam a späť */
  function at(route, d) {
    var o = lens(route), p = o.tot * 2, m = ((d % p) + p) % p, back = m > o.tot;
    if (back) m = p - m;
    var i = 1; while (i < o.cum.length - 1 && o.cum[i] < m) i++;
    var a = route[i - 1], b = route[i], f = (m - o.cum[i - 1]) / ((o.cum[i] - o.cum[i - 1]) || 1);
    var dx = b[0] - a[0], dy = b[1] - a[1]; if (back) { dx = -dx; dy = -dy; }
    return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, dx: dx, dy: dy };
  }
  function state() {
    var ls = {}, war = false;
    try { ls = lifeState(); } catch (e) { }
    try { war = !!decreeOn("vojna"); } catch (e) { }
    return { fair: !!ls.fair, plague: !!ls.plague, guards: !!ls.guards, arrive: !!ls.arrive, war: war };
  }
  /* počet chodcov na každej trase (nahrádza pevné 3 v hre) */
  function n(C, night) {
    var s = state();
    if (s.plague) return 1;
    if (night) return 1;
    if (s.war) return 2;
    if (s.fair) return 4;
    return 3;
  }

  /* ---------- kresba postáv (obrazovkové súradnice) ---------- */
  function dog(g, X, Y, dir, t, i, col) {
    g.save(); g.translate(X, Y); g.scale(dir >= 0 ? 1 : -1, 1);
    g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.ellipse(0, 0, 4.5, 1.4, 0, 0, 7); g.fill();
    var l = Math.sin(t * 14 + i) * 1.6;
    g.strokeStyle = col; g.lineWidth = 1.3; g.beginPath();
    g.moveTo(-2.5, -3); g.lineTo(-2.5 + l, 0); g.moveTo(-1, -3); g.lineTo(-1 - l, 0);
    g.moveTo(2, -3); g.lineTo(2 + l, 0); g.moveTo(3.2, -3); g.lineTo(3.2 - l, 0); g.stroke();
    g.fillStyle = col; g.beginPath(); g.ellipse(0, -4.2, 4, 2.1, 0, 0, 7); g.fill();
    g.beginPath(); g.arc(4.6, -6, 1.8, 0, 7); g.fill();
    g.fillRect(5.2, -5.6, 2, 1);
    g.beginPath(); g.moveTo(4.2, -7.6); g.lineTo(5.2, -9); g.lineTo(5.6, -7); g.fill();
    g.lineWidth = 1; g.beginPath(); g.moveTo(-4, -5); g.lineTo(-6.2, -7 + Math.sin(t * 12 + i) * 1.2); g.stroke();
    g.restore();
  }
  function cart(g, X, Y, dir, t, i, load) {
    g.save(); g.translate(X, Y); g.scale(dir >= 0 ? 1 : -1, 1);
    g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.ellipse(0, 0, 11, 2.6, 0, 0, 7); g.fill();
    /* oje */
    g.strokeStyle = "#4a2d14"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(7, -4); g.lineTo(15, -5.5); g.stroke();
    /* korba */
    g.fillStyle = "#7a4d23"; g.fillRect(-8, -9, 16, 5);
    g.strokeStyle = "#2a1a0e"; g.lineWidth = .8; g.strokeRect(-8, -9, 16, 5);
    /* náklad */
    if (load === 0) { g.fillStyle = "#d8c690"; g.beginPath(); g.ellipse(-3, -10.5, 3.4, 2.4, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(2.5, -10, 3, 2.2, 0, 0, 7); g.fill(); }
    else if (load === 1) { g.fillStyle = "#6b4426"; g.fillRect(-6, -14, 5, 5); g.fillRect(0, -14, 5, 5); g.strokeStyle = "#2a1a0e"; g.strokeRect(-6, -14, 5, 5); g.strokeRect(0, -14, 5, 5); }
    else { g.fillStyle = "#c7b07a"; g.beginPath(); g.moveTo(-8, -9); g.quadraticCurveTo(0, -20, 8, -9); g.fill(); g.strokeStyle = "#8a7440"; g.lineWidth = .8; g.stroke(); }
    /* kolesá */
    var rot = t * 3 + i;
    [-5, 5].forEach(function (wx) {
      g.strokeStyle = "#2a1a0e"; g.lineWidth = 1.6; g.beginPath(); g.arc(wx, -3.6, 3.6, 0, 7); g.stroke();
      g.lineWidth = .8; g.beginPath(); g.moveTo(wx + Math.cos(rot) * 3.4, -3.6 + Math.sin(rot) * 3.4); g.lineTo(wx - Math.cos(rot) * 3.4, -3.6 - Math.sin(rot) * 3.4); g.stroke();
    });
    g.restore();
  }
  function soldier(g, X, Y, t, i, dir, col) {
    g.save(); g.translate(X, Y);
    /* kopija */
    g.strokeStyle = "#5a3a1a"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(3.5, 0); g.lineTo(3.5, -19); g.stroke();
    g.fillStyle = "#cfd3d8"; g.beginPath(); g.moveTo(3.5, -23); g.lineTo(2.3, -19); g.lineTo(4.7, -19); g.fill();
    /* štít */
    g.fillStyle = col || "#a8231f"; g.beginPath(); g.moveTo(-5.4, -9); g.lineTo(-1.2, -9); g.lineTo(-1.2, -5); g.lineTo(-3.3, -2.6); g.lineTo(-5.4, -5); g.fill();
    g.strokeStyle = "#1a1008"; g.lineWidth = .6; g.stroke();
    /* helma */
    g.fillStyle = "#9aa0a8"; g.beginPath(); g.arc(0, -11.6 + Math.sin(t * 6 + i) * .6, 2.7, Math.PI, 0); g.fill();
    g.restore();
  }
  function torch(g, X, Y, t, i, night) {
    g.save(); g.translate(X, Y); g.scale(1.6, 1.6); X = 0; Y = 0;
    g.strokeStyle = "#3a2210"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(X, Y); g.lineTo(X, Y - 14); g.stroke();
    var f = .8 + Math.sin(t * 11 + i * 2.3) * .2 + Math.sin(t * 23 + i) * .08;
    var r = (night ? 30 : 16) * f;
    g.save(); g.globalCompositeOperation = "screen";
    var gr = g.createRadialGradient(X, Y - 16, 1, X, Y - 16, r);
    gr.addColorStop(0, "rgba(255,190,90," + (night ? .7 : .5) * f + ")"); gr.addColorStop(1, "rgba(255,140,40,0)");
    g.fillStyle = gr; g.fillRect(X - r, Y - 16 - r, r * 2, r * 2); g.restore();
    g.fillStyle = "#ffcf5a"; g.beginPath(); g.ellipse(X, Y - 16.5, 1.7 * f, 3.2 * f, 0, 0, 7); g.fill();
    g.fillStyle = "#e4601f"; g.beginPath(); g.ellipse(X, Y - 15.6, 1.2 * f, 2.2 * f, 0, 0, 7); g.fill();
    g.restore();
  }
  function doctor(g, X, Y, t, i) {
    g.save(); g.translate(X, Y);
    g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(0, 0, 4, 1.6, 0, 0, 7); g.fill();
    g.fillStyle = "#1c1814"; g.beginPath(); g.moveTo(-3, -10); g.lineTo(3, -10); g.lineTo(4, 0); g.lineTo(-4, 0); g.fill();
    g.beginPath(); g.arc(0, -12, 2.6, 0, 7); g.fill();
    g.beginPath(); g.moveTo(1.5, -12.4); g.lineTo(6.2, -11); g.lineTo(1.6, -10.4); g.fill();
    g.fillStyle = "#d8c690"; g.fillRect(-.2, -12.8, 1, 1);
    g.strokeStyle = "#5a3a1a"; g.lineWidth = 1; g.beginPath(); g.moveTo(-4, -2); g.lineTo(-4, -14); g.stroke();
    g.restore();
  }
  function canopy(g, X, Y, w, col1, col2, t, i) {
    var h = 13, sway = Math.sin(t * 1.4 + i) * .5;
    g.fillStyle = "rgba(0,0,0,.28)"; g.beginPath(); g.ellipse(X, Y + 1, w * .62, 3, 0, 0, 7); g.fill();
    /* pult */
    g.fillStyle = "#7a4d23"; g.fillRect(X - w * .45, Y - 6, w * .9, 6);
    g.strokeStyle = "#2a1a0e"; g.lineWidth = .8; g.strokeRect(X - w * .45, Y - 6, w * .9, 6);
    /* tovar */
    var cols = ["#c0392b", "#e0b04a", "#5a8a3a", "#d8d0c0"];
    for (var k = 0; k < 5; k++) { g.fillStyle = cols[(i + k) % 4]; g.beginPath(); g.arc(X - w * .34 + k * w * .17, Y - 7.2, 1.8, 0, 7); g.fill(); }
    /* tyče */
    g.strokeStyle = "#3a2210"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(X - w * .5, Y); g.lineTo(X - w * .5, Y - h); g.moveTo(X + w * .5, Y); g.lineTo(X + w * .5, Y - h); g.stroke();
    /* pruhovaná strieška */
    var n = 6, sw = w * 1.1 / n;
    for (var s = 0; s < n; s++) {
      g.fillStyle = s % 2 ? col2 : col1; g.beginPath();
      g.moveTo(X - w * .55 + s * sw, Y - h + sway); g.lineTo(X - w * .55 + (s + 1) * sw, Y - h + sway);
      g.lineTo(X - w * .55 + (s + 1) * sw + 1, Y - h + 6 + sway); g.lineTo(X - w * .55 + s * sw + 1, Y - h + 6 + sway); g.fill();
    }
    g.strokeStyle = "#2a1a0e"; g.lineWidth = .7; g.strokeRect(X - w * .55, Y - h + sway, w * 1.1, 6);
  }
  function bunting(g, x1, y1, x2, y2, t, i) {
    var cols = ["#b8362c", "#e8c360", "#2f5bb0", "#f2ecdc", "#2f7d46"];
    g.strokeStyle = "#3a2210"; g.lineWidth = .8; g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + 7, x2, y2); g.stroke();
    for (var k = 1; k < 8; k++) {
      var u = k / 8, px = (1 - u) * (1 - u) * x1 + 2 * u * (1 - u) * ((x1 + x2) / 2) + u * u * x2, py = (1 - u) * (1 - u) * y1 + 2 * u * (1 - u) * ((y1 + y2) / 2 + 7) + u * u * y2;
      var sw = Math.sin(t * 3 + k + i) * .8;
      g.fillStyle = cols[(k + i) % 5]; g.beginPath(); g.moveTo(px - 2, py); g.lineTo(px + 2, py); g.lineTo(px + sw, py + 5); g.fill();
    }
  }

  /* ---------- hlavná kresba vrstvy ---------- */
  var PAL = ["#8a3a2a", "#5a6a3a", "#6a4a8a", "#a07040", "#2f5bb0", "#7a4d23"];
  function KCX(g, C, t, E) {
    var P2 = E.P2, person2 = E.person2, flagDraw = E.flagDraw, wc = E.wc, walk = E.walk, L = C.L, T = E.T || {};
    var night = !!T.night, s = state(), wx = C.st.wx;
    var calm = !(wx === "dazd" || wx === "sneh");
    var items = [];   /* kreslí sa zoradene podľa hĺbky */
    function add(d, fn) { items.push({ d: d, fn: fn }); }
    var streets = walk.slice(0, Math.max(0, walk.length - 1)), ring = walk[walk.length - 1];
    var pl = L && L.pl ? wc(L.pl, L) : [0, 0];

    /* 1) vozy obchodníkov – na uliciach; v mori a v noci nie */
    if (!s.plague && !night) {
      streets.forEach(function (r, ri) {
        var cnt = s.fair || s.arrive ? 2 : (calm ? 1 : 0);
        for (var k = 0; k < cnt; k++) {
          var sp = 1.6 + ri * .2 + k * .3, d0 = ri * 40 + k * 90;
          (function (r, ri, k, sp, d0) {
            var o = at(r, t * sp + d0), q = P2(o.x, o.y, 0), dirS = (o.dx - o.dy);
            add(o.x + o.y, function () { cart(g, q[0], q[1], dirS, t, ri + k, (ri + k) % 3); });
            var o2 = at(r, t * sp + d0 + 2.8);
            add(o2.x + o2.y, function () { person2(g, o2.x, o2.y, 0, PAL[(ri + k + 2) % 6], t, ri + k * 3, .85); });
          })(r, ri, k, sp, d0);
        }
      });
    }
    /* 2) remeselníci s nákladom a deti so psami */
    if (!night && !s.plague) {
      walk.forEach(function (r, ri) {
        /* remeselník s trámom */
        var o = at(r, t * 1.1 + ri * 17), q = P2(o.x, o.y, 0);
        add(o.x + o.y, function () {
          person2(g, o.x, o.y, 0, "#6b4a2a", t, ri, .9);
          g.strokeStyle = "#6a4a28"; g.lineWidth = 1.8; g.beginPath(); g.moveTo(q[0] - 8, q[1] - 10); g.lineTo(q[0] + 8, q[1] - 12); g.stroke();
        });
        /* deti + pes */
        var cnt = ri === walk.length - 1 ? 1 : 2, base = ri * 31 + 9;
        for (var k = 0; k < cnt; k++) {
          (function (k) {
            var d = t * (.9 + k * .25) + base + k * 6;
            var oc = at(r, d), hop = Math.abs(Math.sin(t * 7 + k * 2 + ri)) * 1.4;
            add(oc.x + oc.y, function () {
              person2(g, oc.x, oc.y, hop * .25, k ? "#b8362c" : "#4f7f3c", t, ri + k * 7, .56);
            });
            if (k === 0) {
              var od = at(r, d - 1.6), qd = P2(od.x, od.y, 0), dirD = od.dx - od.dy;
              add(od.x + od.y, function () { dog(g, qd[0], qd[1], dirD, t, ri, ri % 2 ? "#4a3a2a" : "#b08a58"); });
            }
          })(k);
        }
      });
      /* slepačky na námestí */
      for (var h = 0; h < 4; h++) {
        (function (h) {
          var cx = pl[0] + Math.cos(h * 1.7) * 4.5 + Math.sin(t * .4 + h * 3) * 1.1, cy = pl[1] + Math.sin(h * 1.7) * 3.4 + Math.cos(t * .35 + h) * 1.1;
          add(cx + cy, function () {
            var q = P2(cx, cy, 0);
            g.fillStyle = h % 2 ? "#f4f0e6" : "#a4602c"; g.beginPath(); g.ellipse(q[0], q[1] - 2, 2.4, 1.7, 0, 0, 7); g.fill();
            g.beginPath(); g.arc(q[0] + 2, q[1] - 3.6 + Math.sin(t * 9 + h) * .5, 1, 0, 7); g.fill();
          });
        })(h);
      }
    }

    /* 3) jarmok – stánky, stany, girlandy, zástavy a dav */
    if (s.fair) {
      var N = 9, pts = [];
      for (var i = 0; i < N; i++) {
        var a = i / N * Math.PI * 2 + .3, rx = 9 + (i % 2) * 2.2, ry = 6.2 + (i % 2) * 1.6;
        var sx = pl[0] + Math.cos(a) * rx, sy = pl[1] + Math.sin(a) * ry;
        pts.push([sx, sy]);
        (function (i, sx, sy) {
          var q = P2(sx, sy, 0);
          var c1 = ["#b8362c", "#2f5bb0", "#e8c360", "#2f7d46", "#6d3f92"][i % 5];
          add(sx + sy, function () { canopy(g, q[0], q[1], 22, c1, "#f2ecdc", t, i); });
        })(i, sx, sy);
      }
      /* girlandy medzi stánkami */
      add(1e6, function () {
        for (var i = 0; i < N; i++) {
          var A = P2(pts[i][0], pts[i][1], 0), B = P2(pts[(i + 1) % N][0], pts[(i + 1) % N][1], 0);
          bunting(g, A[0], A[1] - 13, B[0], B[1] - 13, t, i);
        }
      });
      /* zástavy na rohoch námestia */
      add(1e6 + 1, function () {
        [[-6, 0], [6, 0], [0, -5], [0, 5]].forEach(function (p, i) {
          var q = P2(pl[0] + p[0], pl[1] + p[1], 0);
          flagDraw(g, q[0], q[1] - 14, t + i, ["#a8231f", "#e8c360", "#2f5bb0", "#f2ecdc"][i], 1);
        });
      });
      /* dav */
      for (var j = 0; j < 14; j++) {
        (function (j) {
          var a = j * .9 + Math.sin(t * .3 + j) * .5, r = 3 + (j % 4) * 1.4;
          var cx = pl[0] + Math.cos(a) * r * 1.25, cy = pl[1] + Math.sin(a) * r;
          add(cx + cy, function () { person2(g, cx, cy, 0, PAL[j % 6], t + j, j, j % 5 === 0 ? .56 : 1); });
        })(j);
      }
      /* žonglér */
      add(pl[0] + pl[1] + 2, function () {
        var q = P2(pl[0] + 1, pl[1], 0);
        person2(g, pl[0] + 1, pl[1], 0, "#6d3f92", t, 3, 1);
        for (var k = 0; k < 3; k++) {
          var u = (t * 1.6 + k / 3) % 1, bx = q[0] + (k - 1) * 4, by = q[1] - 16 - Math.sin(u * Math.PI) * 13;
          g.fillStyle = ["#e04040", "#e8c360", "#4090e0"][k]; g.beginPath(); g.arc(bx, by, 1.7, 0, 7); g.fill();
        }
      });
    }

    /* 4) vojna – hliadky na bránach, kolóna vojakov, zástavy */
    if (s.war || s.guards) {
      var gates = (L.gates || []).map(function (p) { return wc(p, L); });
      gates.forEach(function (gp, gi) {
        for (var k = 0; k < (s.war ? 2 : 1); k++) {
          (function (k) {
            var x = gp[0] + (k ? 1.2 : -1.2) * 1.4, y = gp[1] + (k ? -.6 : .6);
            add(x + y, function () { var q = P2(x, y, 0); person2(g, x, y, 0, "#555b64", t, gi + k, 1); soldier(g, q[0], q[1], t, gi + k, 0, s.war ? "#a8231f" : "#2f5bb0"); });
          })(k);
        }
        if (s.war) add(1e6 + 2, function () { var q = P2(gp[0], gp[1], 0); flagDraw(g, q[0] + 4, q[1] - 24, t + gi, "#a8231f", 1.1); });
      });
      var rings = [ring];
      rings.forEach(function (r) {
        var cnt = s.war ? 4 : 2;
        for (var k = 0; k < cnt; k++) {
          (function (k) {
            var o = at(r, t * 1.5 + k * 55);
            add(o.x + o.y, function () { var q = P2(o.x, o.y, 0); person2(g, o.x, o.y, 0, "#555b64", t, k, 1); soldier(g, q[0], q[1], t, k, 0, s.war ? "#a8231f" : "#2f5bb0"); });
          })(k);
        }
      });
      if (s.war && streets[0]) {
        for (var m = 0; m < 6; m++) {
          (function (m) {
            var o = at(streets[0], t * 1.9 + 12 - m * 1.7);
            add(o.x + o.y, function () { var q = P2(o.x, o.y, 0); person2(g, o.x, o.y, 0, "#555b64", t, m, 1); soldier(g, q[0], q[1], t, m, 0, "#a8231f"); if (m === 0) flagDraw(g, q[0] + 2, q[1] - 30, t, "#a8231f", 1.2); });
          })(m);
        }
      }
    }

    /* 5) mor – fakle, mor. doktor, prázdne ulice */
    if (s.plague) {
      var tp = [pl].concat((L.gates || []).map(function (p) { return wc(p, L); }));
      tp.forEach(function (p, i) {
        for (var k = 0; k < (i ? 1 : 3); k++) {
          (function (k) {
            var x = p[0] + (i ? 1.6 : Math.cos(k * 2.1) * 5), y = p[1] + (i ? 1.2 : Math.sin(k * 2.1) * 3.8);
            add(x + y, function () { var q = P2(x, y, 0); torch(g, q[0], q[1], t, i * 3 + k, night); });
          })(k);
        }
      });
      if (streets[0]) {
        var od = at(streets[0], t * .9 + 30);
        add(od.x + od.y, function () { var q = P2(od.x, od.y, 0); doctor(g, q[0], q[1], t, 1); });
      }
      if (ring) {
        var o3 = at(ring, t * .8);
        add(o3.x + o3.y, function () { var q = P2(o3.x, o3.y, 0); person2(g, o3.x, o3.y, 0, "#5b5648", t, 4, 1); });
      }
    }

    /* 6) príchod karavány */
    if (s.arrive && streets[1] && !s.plague) {
      for (var c = 0; c < 3; c++) {
        (function (c) {
          var o = at(streets[1], t * 1.4 + 70 - c * 4.2), q = P2(o.x, o.y, 0), dirS = o.dx - o.dy;
          add(o.x + o.y, function () { cart(g, q[0], q[1], dirS, t, c, c % 3); });
        })(c);
      }
    }

    items.sort(function (a, b) { return a.d - b.d; });
    items.forEach(function (it) { it.fn(); });

    /* zelenkavý opar pri more */
    if (s.plague) { g.fillStyle = "rgba(110,125,80,.13)"; g.fillRect(0, 0, 1600, 900); }
  }
    window.KCX = KCX;
  KCX.n = n;
})();

;
