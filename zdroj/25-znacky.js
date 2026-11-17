/* ==== js/znacky.js ==== */
/* Prešporok 1400 – pamätihodnosti miest: každé mesto má vlastné typické stavby. Autor: Dávid Mucha. */
(function () {
  "use strict";
  var INK = "#2b2117", Z = new WeakMap();
  function hx(c) { var m = /^#([0-9a-f]{6})$/i.exec(c || ""); if (!m) return null; var n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function mix(a, b, t) { var A = hx(a), B = hx(b); if (!A || !B) return a; return "rgb(" + A.map(function (v, i) { return Math.round(v + (B[i] - v) * t); }).join(",") + ")"; }
  function dseg(x, y, a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2)); return Math.hypot(x - (a[0] + dx * t), y - (a[1] + dy * t)); }
  function dpath(x, y, pts) { var m = 1e9; for (var i = 1; i < pts.length; i++) m = Math.min(m, dseg(x, y, pts[i - 1], pts[i])); return m; }
  function inside(x, y, poly) { var c = false; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { var a = poly[i], b = poly[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
  function low() { try { return typeof kGfx === "function" && kGfx() < 2; } catch (e) { return false; } }

  /* ---------- izometrické základy ---------- */
  function Ctx(env) { this.I = env.I; this.P = env.P2; }
  Ctx.prototype.push = function (d, fn) { var I = this.I; I.push({ d: d, draw: function (g) { g.save(); g.lineWidth = 1; g.strokeStyle = INK; g.lineJoin = "round"; fn(g); g.restore(); } }); };
  Ctx.prototype.poly = function (g, pts, fill, stroke) { g.beginPath(); pts.forEach(function (p, i) { i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke !== false) g.stroke(); };
  Ctx.prototype.shadow = function (x, y, w, d, h) {
    var P = this.P, self = this, sx = -h * 5.5, sy = -h * 1.7, c = [[x, y], [x + w, y], [x + w, y + d], [x, y + d]].map(function (p) { return P(p[0], p[1], 0); });
    this.push(-900 + x + y, function (g) {
      g.fillStyle = "rgba(30,25,20,.2)"; g.strokeStyle = "rgba(30,25,20,0)";
      var up = c.map(function (p) { return [p[0] + sx, p[1] + sy]; });
      self.poly(g, c, "rgba(30,25,20,.2)", false); self.poly(g, up, "rgba(30,25,20,.2)", false);
      for (var i = 0; i < 4; i++) self.poly(g, [c[i], c[(i + 1) % 4], up[(i + 1) % 4], up[i]], "rgba(30,25,20,.2)", false);
    });
  };
  /* kváder: viditeľné steny y+d a x+w + strecha */
  Ctx.prototype.box = function (x, y, w, d, z0, h, col, o) {
    o = o || {}; var P = this.P, self = this, z1 = z0 + h;
    var A = function (px, py, z) { return P(px, py, z); };
    this.push(x + w + y + d + (o.dd || 0), function (g) {
      var f1 = [A(x, y + d, z0), A(x + w, y + d, z0), A(x + w, y + d, z1), A(x, y + d, z1)], f2 = [A(x + w, y + d, z0), A(x + w, y, z0), A(x + w, y, z1), A(x + w, y + d, z1)], tp = [A(x, y, z1), A(x + w, y, z1), A(x + w, y + d, z1), A(x, y + d, z1)];
      self.poly(g, f1, col); self.poly(g, f2, mix(col, "#000000", .2));
      self.poly(g, tp, o.top || mix(col, "#ffffff", .12));
      if (o.stone) { g.strokeStyle = "rgba(40,35,30,.22)"; g.lineWidth = .7; for (var k = 1; k < h * 1.6; k++) { var t = k / (h * 1.6); g.beginPath(); var a = A(x, y + d, z0 + h * t), b = A(x + w, y + d, z0 + h * t), c2 = A(x + w, y, z0 + h * t); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c2[0], c2[1]); g.stroke(); } }
      if (o.win) {
        var n = o.win[0], rows = o.win[1], lit = o.lit; g.fillStyle = "rgba(30,28,40,.75)"; g.lineWidth = .6;
        for (var r = 0; r < rows; r++) for (var i = 0; i < n; i++) {
          var u = (i + .5) / n, vz = z0 + h * ((r + .55) / (rows + .3)), ww = .28 / n * 1.6, wh = h / (rows + .3) * .45;
          var p1 = A(x + w * u - ww * w / 2, y + d, vz), p2 = A(x + w * u + ww * w / 2, y + d, vz), p3 = A(x + w * u + ww * w / 2, y + d, vz + wh), p4 = A(x + w * u - ww * w / 2, y + d, vz + wh);
          self.poly(g, [p1, p2, p3, p4], null, false); g.fill();
        }
      }
    });
  };
  Ctx.prototype.pyr = function (x, y, w, d, z, rh, col, dd) {
    var P = this.P, self = this;
    this.push(x + w + y + d + (dd || .3), function (g) {
      var ap = P(x + w / 2, y + d / 2, z + rh), D = P(x, y + d, z), C = P(x + w, y + d, z), B = P(x + w, y, z);
      self.poly(g, [D, C, ap], col); self.poly(g, [C, B, ap], mix(col, "#000000", .22));
    });
  };
  /* sedlová strecha; os "x" = hrebeň rovnobežne s osou x */
  Ctx.prototype.gable = function (x, y, w, d, z, rh, col, wall, axis, dd) {
    var P = this.P, self = this;
    this.push(x + w + y + d + (dd || .3), function (g) {
      var D = P(x, y + d, z), C = P(x + w, y + d, z), B = P(x + w, y, z);
      if (axis === "y") {
        var rb = P(x + w / 2, y, z + rh), rc = P(x + w / 2, y + d, z + rh);
        self.poly(g, [B, C, rc, rb], mix(col, "#000000", .2)); self.poly(g, [D, C, rc], wall || mix(col, "#ffffff", .25));
      } else {
        var r1 = P(x, y + d / 2, z + rh), r2 = P(x + w, y + d / 2, z + rh);
        self.poly(g, [D, C, r2, r1], col); self.poly(g, [C, B, r2], wall || mix(col, "#ffffff", .25));
      }
    });
  };
  Ctx.prototype.arcade = function (x, y, w, d, h, n, col) {
    var P = this.P, self = this;
    this.push(x + w + y + d + .15, function (g) {
      g.fillStyle = col || "rgba(25,20,25,.85)"; g.lineWidth = .6;
      for (var i = 0; i < n; i++) {
        var u0 = (i + .22) / n, u1 = (i + .78) / n, a = P(x + w * u0, y + d, 0), b = P(x + w * u1, y + d, 0), a2 = P(x + w * u0, y + d, h * .7), b2 = P(x + w * u1, y + d, h * .7), t = P(x + w * (u0 + u1) / 2, y + d, h);
        g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(a2[0], a2[1]); g.quadraticCurveTo(t[0], t[1] - (b[0] - a[0]) * .2, b2[0], b2[1]); g.lineTo(b[0], b[1]); g.closePath(); g.fill();
      }
    });
  };
  Ctx.prototype.crenel = function (x, y, w, d, z, col) {
    var n = Math.round(w * 2.2); for (var i = 0; i < n; i += 2) this.box(x + w * i / n, y + d - .3, w / n, .3, z, .45, col, { dd: .4 });
  };

  /* ---------- hľadanie miesta ---------- */
  function Env(env) {
    var e = this; e.env = env; e.L = env.L; e.wc = env.wc; e.roads = env.roads; e.key = env.key; e.tier = env.tier | 0;
    e.lw = []; env.lots.forEach(function (l) { var p = env.L.pos[l.id]; if (p) e.lw.push(env.wc([p.x, p.y])); });
    e.ring = (env.L.ring || []).map(env.wc); e.river = env.L.river ? env.L.river.map(env.wc) : null; e.pl = env.L.pl ? env.wc(env.L.pl) : [0, 0];
    e.taken = [];
  }
  Env.prototype.ok = function (x, y, r, inRing) {
    var i; for (i = 0; i < this.lw.length; i++) if (Math.hypot(this.lw[i][0] - x, this.lw[i][1] - y) < r + 2.6) return false;
    for (i = 0; i < this.roads.length; i++) if (dpath(x, y, this.roads[i]) < r * .55 + 1) return false;
    for (i = 0; i < this.taken.length; i++) if (Math.hypot(this.taken[i][0] - x, this.taken[i][1] - y) < r + this.taken[i][2]) return false;
    if (this.ring.length) {
      var ins = inside(x, y, this.ring);
      if (inRing === true && (!ins || dpath(x, y, this.ring) < r + 1.2)) return false;
      if (inRing === false && (ins || dpath(x, y, this.ring) < r + 3)) return false;
    }
    if (this.river && inRing !== "river" && dpath(x, y, this.river) < r + 2.5) return false;
    var q = this.env.P2(x, y, 0); if (q[0] < 140 || q[0] > 2260 || q[1] < 240 || q[1] > 1280) return false;
    return true;
  };
  Env.prototype.spot = function (tx, ty, r, inRing, minPl) {
    var best = null, bd = 1e9;
    for (var rad = 0; rad <= 44; rad += 1.6) for (var a = 0; a < 6.283; a += .35) {
      var x = tx + Math.cos(a) * rad, y = ty + Math.sin(a) * rad * .8;
      if (minPl && Math.hypot(x - this.pl[0], y - this.pl[1]) < minPl) continue;
      var dd = Math.hypot(x - tx, y - ty); if (dd >= bd) continue;
      if (this.ok(x, y, r, inRing)) { bd = dd; best = [x, y]; }
    }
    if (best) this.taken.push([best[0], best[1], r]);
    return best;
  };

  /* ---------- pamätihodnosti ---------- */
  var STONE = "#d9d0b8", BRICK = "#b4573b", RED = "#a5312a";
  function tower(C, x, y, s, h, kind, wall, roofC) {
    C.shadow(x, y, s, s, h + 2); C.box(x, y, s, s, 0, h, wall || STONE, { stone: 1, win: [1, Math.max(1, Math.round(h / 4))] });
    if (kind === "flat") { C.crenel(x, y, s, s, h, wall || STONE); }
    else C.pyr(x - .3, y - .3, s + .6, s + .6, h, kind === "spire" ? h * .9 : kind === "tall" ? h * .55 : s * 1.4, roofC || "#6f4a3a");
  }
  function cathedral(C, x, y, style) {
    var w = 12, d = 4.6, h = 5;
    C.shadow(x, y, w, d, h + 4);
    C.box(x, y, w, d, 0, h, STONE, { stone: 1, win: [6, 1], dd: 0 });
    var roof = style === "bud" ? "#c9782a" : style === "kut" ? "#6a7a6a" : "#5a6070";
    C.gable(x - .3, y - .3, w + .6, d + .6, h, 3.3, roof, STONE, "x", .2);
    if (style === "bud") { /* farebná strecha */
      C.push(x + w + y + d + .5, function (g) { var P = C.P, a = P(x + 2, y + d / 2, h + 3.3), b = P(x + w - 2, y + d / 2, h + 3.3); g.strokeStyle = "#e3be4f"; g.lineWidth = 3; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(a[0], a[1] + 6); g.lineTo(b[0], b[1] + 6); g.stroke(); g.setLineDash([]); });
    }
    if (style === "kut") for (var k = 0; k < 3; k++) C.pyr(x + 2 + k * 3.4, y + .4, 2.2, d - .8, h + 2.4, 3.2, "#7a8a78", .5);
    var two = style === "par" || style === "pra" || style === "nur";
    if (two) {
      tower(C, x - 1.6, y + d - 3, 3.2, 10.5, style === "par" ? "flat" : "spire", STONE, "#4f5a66");
      tower(C, x - 1.6, y - .2, 3.2, 10.5, style === "par" ? "flat" : "spire", STONE, "#4f5a66");
    } else tower(C, x - 1.6, y + 1, 3.6, style === "vie" ? 12 : 9, style === "vie" ? "spire" : "tall", STONE, style === "vie" ? "#5a6a5a" : "#8a4a32");
    if (style === "vie") C.push(x + 100, function (g) { var P = C.P, p = P(x - 1.6 + 1.8, y + 1 + 1.8, 12 + 11); g.fillStyle = "#e3be4f"; g.beginPath(); g.arc(p[0], p[1] - 3, 3, 0, 7); g.fill(); g.stroke(); });
  }
  function hall(C, x, y, style) {
    var w = 15, d = 5.2, h = style === "ven" ? 4.4 : 3.2;
    C.shadow(x, y, w, d, h + 2);
    var wall = style === "ven" ? "#efe0d0" : "#e0d4b8";
    C.box(x, y, w, d, 0, h, wall, { stone: style !== "ven", win: [8, 1] });
    if (style === "ven") {
      C.push(x + w + y + d + .12, function (g) { var P = C.P; g.fillStyle = "rgba(200,120,110,.55)"; for (var i = 0; i < 18; i++) { var u = (i + .5) / 18, a = P(x + w * u, y + d, h * .55), b = P(x + w * (u + .5 / 18), y + d, h * .8), c = P(x + w * (u - .5 / 18), y + d, h * .8), e = P(x + w * u, y + d, h); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(e[0], e[1]); g.lineTo(c[0], c[1]); g.closePath(); g.fill(); } });
      C.crenel(x, y, w, d, h, wall);
    } else {
      C.gable(x - .3, y - .3, w + .6, d + .6, h, 2.4, "#8a4a32", wall, "x", .2);
      C.crenel(x, y, w, d, h, wall);
    }
    C.arcade(x, y, w, d, h * .55, 8);
  }
  function campanile(C, x, y) { tower(C, x, y, 2.8, 15, "tall", "#b4573b", "#4f8a6a"); C.push(x + 100, function (g) { var p = C.P(x + 1.4, y + 1.4, 15 + 8); g.fillStyle = "#e3be4f"; g.beginPath(); g.arc(p[0], p[1] - 4, 3, 0, 7); g.fill(); g.stroke(); }); }
  function castleHill(C, x, y, style) {
    C.push(-400 + x + y, function (g) {
      var P = C.P, c = P(x, y, 0), grd = g.createRadialGradient(c[0], c[1] - 20, 10, c[0], c[1], 150); grd.addColorStop(0, "#8fb06a"); grd.addColorStop(1, "#7a9a58");
      g.fillStyle = grd; g.beginPath(); g.ellipse(c[0], c[1], 150, 62, 0, 0, 7); g.fill(); g.strokeStyle = "rgba(60,80,40,.5)"; g.stroke();
    });
    var hz = 2.2;
    C.box(x - 6, y - 3, 12, 6, hz, 4.4, "#d8cdb4", { stone: 1, win: [5, 1] });
    C.gable(x - 6.3, y - 3.3, 12.6, 6.6, hz + 4.4, 2.6, style === "brn" ? "#7a8a6a" : "#8a4a32", "#d8cdb4", "x", .2);
    [[-7.6, 2.2], [6, 2.2], [-7.6, -4.4], [6, -4.4]].forEach(function (o, i) { tower(C, x + o[0], y + o[1], 1.8, 5.2, i % 2 ? "tall" : "flat", "#cfc4aa", "#6f4a3a"); });
    for (var i = 0; i < 4; i++) { C.box(x - 8 + i * 4.4, y + 4.6, 4.4, .7, hz, 1.8, "#bdb4a0", { dd: .1 }); }
  }
  /* most cez rieku */
  function bridge(C, E, style) {
    var r = E.river; if (!r || r.length < 4) return null;
    var best = null;
    for (var i = Math.floor(r.length * .18); i < r.length - 2; i++) {
      var a = r[i], b = r[i + 1], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], ln = Math.hypot(dx, dy) || 1, nx = -dy / ln, ny = dx / ln;
      if (E.ring.length && dpath(mx, my, E.ring) < 10) continue; var dc = Math.hypot(mx - E.pl[0], my - E.pl[1]); if (best && dc > best.dc) continue;
      var near = false; E.taken.forEach(function (t) { if (Math.hypot(t[0] - mx, t[1] - my) < 8) near = true; }); if (near) continue;
      var q = E.env.P2(mx + nx * 7, my + ny * 7, 0), q2 = E.env.P2(mx - nx * 7, my - ny * 7, 0);
      if (q[0] < 150 || q[0] > 2250 || q[1] < 250 || q[1] > 1270 || q2[0] < 150 || q2[0] > 2250 || q2[1] < 250 || q2[1] > 1270) continue;
      best = { x: mx, y: my, nx: nx, ny: ny, tx: dx / ln, ty: dy / ln, dc: dc };
    }
    if (!best) return null;
    E.taken.push([best.x, best.y, 7]);
    var P = E.env.P2, L2 = 8.2, hw = 1.5, ux = best.nx, uy = best.ny, px = -uy, py = ux, x0 = best.x, y0 = best.y;
    C.push(-100 + x0 + y0, function (g) {
      /* nájazdy */
      var a = P(x0 - ux * (L2 + 3.5) - px * hw * .9, y0 - uy * (L2 + 3.5) - py * hw * .9, 0), b = P(x0 - ux * L2 - px * hw, y0 - uy * L2 - py * hw, .2), c = P(x0 - ux * L2 + px * hw, y0 - uy * L2 + py * hw, .2), d = P(x0 - ux * (L2 + 3.5) + px * hw * .9, y0 - uy * (L2 + 3.5) + py * hw * .9, 0);
      C.poly(g, [a, b, c, d], "#c9b890", false);
      var a2 = P(x0 + ux * (L2 + 3.5) - px * hw * .9, y0 + uy * (L2 + 3.5) - py * hw * .9, 0), b2 = P(x0 + ux * L2 - px * hw, y0 + uy * L2 - py * hw, .2), c2 = P(x0 + ux * L2 + px * hw, y0 + uy * L2 + py * hw, .2), d2 = P(x0 + ux * (L2 + 3.5) + px * hw * .9, y0 + uy * (L2 + 3.5) + py * hw * .9, 0);
      C.poly(g, [a2, b2, c2, d2], "#c9b890", false);
    });
    C.push(x0 + y0 + 1, function (g) {
      var zt = style === "ven" ? 1.8 : 1.1, N = 6;
      function pt(u, s, z) { return P(x0 + ux * u + px * s, y0 + uy * u + py * s, z); }
      var s1 = [pt(-L2, hw, 0), pt(L2, hw, 0), pt(L2, hw, zt), pt(-L2, hw, zt)], s2 = [pt(-L2, -hw, 0), pt(-L2, -hw, zt), pt(L2, -hw, zt), pt(L2, -hw, 0)];
      var deck = [pt(-L2, -hw, zt), pt(L2, -hw, zt), pt(L2, hw, zt), pt(-L2, hw, zt)];
      /* viditeľná strana je tá s väčším y na obrazovke */
      var vis = (s1[0][1] + s1[1][1]) > (s2[0][1] + s2[3][1]) ? s1 : [s2[0], s2[3], s2[2], s2[1]];
      C.poly(g, vis, "#cfc6b0"); C.poly(g, deck, "#e3dcc6");
      g.fillStyle = "rgba(20,25,35,.8)";
      for (var i = 0; i < N; i++) { var u0 = -L2 + (i + .18) * 2 * L2 / N, u1 = -L2 + (i + .82) * 2 * L2 / N, sg = vis === s1 ? hw : -hw; var A1 = pt(u0, sg, 0), B1 = pt(u1, sg, 0), A2 = pt(u0, sg, zt * .55), B2 = pt(u1, sg, zt * .55), T = pt((u0 + u1) / 2, sg, zt * .85); g.beginPath(); g.moveTo(A1[0], A1[1]); g.lineTo(A2[0], A2[1]); g.quadraticCurveTo(T[0], T[1] - 6, B2[0], B2[1]); g.lineTo(B1[0], B1[1]); g.closePath(); g.fill(); }
      /* parapet */
      g.strokeStyle = INK; g.lineWidth = 2; [hw, -hw].forEach(function (sg) { var a = pt(-L2, sg, zt + .5), b = pt(L2, sg, zt + .5); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); });
      if (style === "lon" || style === "ven") {
        for (var h = 0; h < 4; h++) { var u = -L2 + 2.2 + h * 2.9, c0 = pt(u, hw * .1, zt), sz = 1.2; var bb = [pt(u - 1, -hw, zt), pt(u + 1, -hw, zt), pt(u + 1, -hw, zt + 1.9), pt(u - 1, -hw, zt + 1.9)]; C.poly(g, bb, h % 2 ? "#e8d8b0" : "#d9c496"); var rf = [pt(u - 1.2, -hw, zt + 1.9), pt(u + 1.2, -hw, zt + 1.9), pt(u, -hw, zt + 3)]; C.poly(g, rf, "#8a4a32"); }
      }
    });
    if (style === "pra") { tower(C, x0 - ux * L2 - 1.2 + .5, y0 - uy * L2 - 1.2, 2.4, 6, "tall", "#c9bfa6", "#4a5a66"); tower(C, x0 + ux * L2 - 1.2 - .5, y0 + uy * L2 - 1.2, 2.4, 6, "tall", "#c9bfa6", "#4a5a66"); }
    return best;
  }

  function build(env) {
    var E = new Env(env), C = new Ctx(env), key = env.key, M = { key: key, anim: [] };
    var pl = E.pl, sp;
    var cat = { vie: "vie", par: "par", pra: "pra", kut: "kut", bud: "bud", nur: "nur" };
    if (env.tier >= 1) {
      if (key === "pre") {
        if (E.river && E.river.length > 4) { [.4, .62].forEach(function (f) { var p = E.river[Math.floor(E.river.length * f)]; M.anim.push({ t: "shipmill", x: p[0], y: p[1] }); }); }
        sp = E.spot(pl[0] + 14, pl[1] - 8, 3, true, 11); if (sp) tower(C, sp[0], sp[1], 3, 12, "spire", "#d8cdb4", "#4f8a6a");
      }
      if (key === "kra") { sp = E.spot(pl[0] - 14, pl[1] + 2, 8, true, 11); if (sp) hall(C, sp[0] - 7.5, sp[1] - 2.6, "kra"); sp = E.spot(pl[0] + 13, pl[1] + 9, 8, true, 11); if (sp) { tower(C, sp[0], sp[1], 3, 12, "tall", "#b4573b", "#5a3a2a"); tower(C, sp[0] + 4.6, sp[1], 3, 9.5, "tall", "#b4573b", "#5a3a2a"); } sp = E.spot(0, -34, 11, false); if (sp) castleHill(C, sp[0], sp[1], "kra"); }
      if (key === "vie") { sp = E.spot(pl[0] + 15, pl[1], 9, true, 11); if (sp) cathedral(C, sp[0] - 5, sp[1] - 2.3, "vie"); }
      if (key === "ven") { sp = E.spot(pl[0] - 15, pl[1] + 2, 8, true, 11); if (sp) hall(C, sp[0] - 7.5, sp[1] - 2.6, "ven"); sp = E.spot(pl[0] + 12, pl[1] + 8, 3, true, 11); if (sp) campanile(C, sp[0], sp[1]); bridge(C, E, "ven"); if (E.river) [.35, .55, .75].forEach(function (f, i) { var p = E.river[Math.floor(E.river.length * f)]; M.anim.push({ t: "gondola", x: p[0], y: p[1], i: i }); }); }
      if (key === "pra") { sp = E.spot(pl[0] + 14, pl[1] - 2, 9, true, 11); if (sp) cathedral(C, sp[0] - 5, sp[1] - 2.3, "pra"); bridge(C, E, "pra"); sp = E.spot(0, -34, 11, false); if (sp) castleHill(C, sp[0], sp[1], "pra"); }
      if (key === "par") { sp = E.spot(pl[0] - 14, pl[1] - 3, 9, true, 11); if (sp) cathedral(C, sp[0] - 5, sp[1] - 2.3, "par"); bridge(C, E, "par"); }
      if (key === "lon") { bridge(C, E, "lon"); }
      if (key === "nur") { sp = E.spot(0, -34, 11, false); if (sp) castleHill(C, sp[0], sp[1], "nur"); sp = E.spot(pl[0] + 14, pl[1] - 2, 9, true, 11); if (sp) cathedral(C, sp[0] - 5, sp[1] - 2.3, "nur"); bridge(C, E, "nur"); }
      if (key === "bud") { sp = E.spot(0, -34, 11, false); if (sp) castleHill(C, sp[0], sp[1], "bud"); sp = E.spot(pl[0] + 14, pl[1] - 2, 9, true, 11); if (sp) cathedral(C, sp[0] - 5, sp[1] - 2.3, "bud"); }
      if (key === "brn") { sp = E.spot(0, -34, 11, false); if (sp) castleHill(C, sp[0], sp[1], "brn"); }
      if (key === "kut") { sp = E.spot(pl[0] - 14, pl[1] - 3, 9, true, 11); if (sp) cathedral(C, sp[0] - 5, sp[1] - 2.3, "kut"); [0, 1].forEach(function (i) { var s2 = E.spot(-30 + i * 14, 38, 5, false); if (s2) { M.anim.push({ t: "mine", x: s2[0], y: s2[1] }); } }); }
      if (key === "gda") {
        if (E.river && E.river.length > 4) {
          var rp = E.river[Math.floor(E.river.length * .5)];
          for (var g = 0; g < 3; g++) { var s3 = E.spot(rp[0] + g * 6.5 - 6, rp[1] + 6, 3, "river"); if (s3) { C.shadow(s3[0] - 2.4, s3[1] - 1.6, 4.8, 3.2, 5); C.box(s3[0] - 2.4, s3[1] - 1.6, 4.8, 3.2, 0, 3.6, "#a05a3a", { stone: 0, win: [3, 2] }); C.gable(s3[0] - 2.7, s3[1] - 1.9, 5.4, 3.8, 3.6, 3.2, "#6a3a2a", "#a05a3a", "y", .2); } }
          var cr = E.river[Math.floor(E.river.length * .38)]; M.anim.push({ t: "crane", x: cr[0], y: cr[1] });
          [.3, .7].forEach(function (f, i) { var p = E.river[Math.floor(E.river.length * f)]; M.anim.push({ t: "ship", x: p[0], y: p[1], i: i }); });
        }
      }
    }
    Z.set(env.L, M);
    window.__zE = E; window.__zC = C;
  }
  window.ZNK = { Ctx: Ctx, Env: Env, tower: tower, hall: hall, cathedral: cathedral, campanile: campanile, castleHill: castleHill, bridge: bridge, mix: mix, STONE: STONE, BRICK: BRICK, RED: RED };
  var oP = window.KPUB;
  window.KPUB = function (env) { if (oP) oP.apply(this, arguments); try { build(env); } catch (e) { console.warn("znacky", e); } };

  /* ---------- animácie (obrazovkové) ---------- */
  function wcL(p, L) { return [(p[0] - L.cx) / 10, (p[1] - L.cy) / 10]; }
  var oK = window.KLIVE;
  window.KLIVE = function (g, C, t, walk, P2, I) {
    if (oK) oK.apply(this, arguments);
    if (low() || !C.L) return;
    var M = Z.get(C.L); if (!M) return;
    M.anim.forEach(function (a) {
      var q = P2(a.x, a.y, 0); g.save(); g.translate(q[0], q[1]); g.lineWidth = 1.2; g.strokeStyle = INK; g.lineJoin = "round";
      if (a.t === "shipmill") {
        g.fillStyle = "#5a3418"; g.beginPath(); g.moveTo(-26, 0); g.lineTo(26, 0); g.lineTo(20, 9); g.lineTo(-20, 9); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "#d8cdb4"; g.fillRect(-14, -16, 18, 16); g.strokeRect(-14, -16, 18, 16); g.fillStyle = "#8a4a32"; g.beginPath(); g.moveTo(-17, -16); g.lineTo(-5, -26); g.lineTo(7, -16); g.closePath(); g.fill(); g.stroke();
        g.translate(14, 2); g.rotate(t * .8); g.strokeStyle = "#5a3a20"; g.lineWidth = 2; for (var k = 0; k < 6; k++) { g.rotate(Math.PI / 3); g.beginPath(); g.moveTo(0, 0); g.lineTo(12, 0); g.stroke(); g.fillStyle = "#8a6a3a"; g.fillRect(10, -2, 4, 4); }
      } else if (a.t === "gondola") {
        var bob = Math.sin(t * 1.4 + a.i) * 1.2; g.translate(Math.sin(t * .2 + a.i * 2) * 10, bob);
        g.fillStyle = "#1c1c20"; g.beginPath(); g.moveTo(-17, -2); g.quadraticCurveTo(-8, 5, 15, 3); g.lineTo(21, -7); g.quadraticCurveTo(12, 1, -17, -2); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = "#b8362c"; g.fillRect(-4, -8, 7, 5); g.fillStyle = "#e8c4a0"; g.beginPath(); g.arc(-10, -9, 2, 0, 7); g.fill(); g.fillStyle = "#2a2a30"; g.fillRect(-12, -8, 4, 7);
        g.strokeStyle = "#5a3a20"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-10, -8); g.lineTo(-18 + Math.sin(t * 2 + a.i) * 2, 4); g.stroke();
      } else if (a.t === "crane") {
        g.fillStyle = "#a05a3a"; g.fillRect(-12, -26, 24, 26); g.strokeRect(-12, -26, 24, 26); g.fillStyle = "#6a3a2a"; g.beginPath(); g.moveTo(-14, -26); g.lineTo(0, -40); g.lineTo(14, -26); g.closePath(); g.fill(); g.stroke();
        g.strokeStyle = "#6b4a2a"; g.lineWidth = 3; var sw = Math.sin(t * .3) * .18; g.save(); g.translate(0, -40); g.rotate(-.6 + sw); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -46); g.stroke(); g.restore();
        var ex = Math.sin(-.6 + sw) * -46 * -1, ey = -40 - Math.cos(-.6 + sw) * 46; g.lineWidth = 1; g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex, ey + 22 + Math.sin(t) * 5); g.stroke(); g.fillStyle = "#8a6a3a"; g.fillRect(ex - 4, ey + 22 + Math.sin(t) * 5, 8, 6); g.strokeRect(ex - 4, ey + 22 + Math.sin(t) * 5, 8, 6);
      } else if (a.t === "ship") {
        var b2 = Math.sin(t * 1.1 + a.i * 2) * 1.5; g.translate(0, b2);
        g.fillStyle = "#5a3418"; g.beginPath(); g.moveTo(-28, 0); g.lineTo(26, 0); g.lineTo(20, 10); g.lineTo(-20, 10); g.closePath(); g.fill(); g.stroke();
        g.strokeStyle = "#2a1a0e"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-4, 0); g.lineTo(-4, -38); g.moveTo(10, 0); g.lineTo(10, -28); g.stroke();
        g.fillStyle = "#f4ecd8"; g.beginPath(); g.moveTo(-3, -36); g.quadraticCurveTo(-14, -20, -3, -6); g.fill(); g.stroke(); g.beginPath(); g.moveTo(11, -26); g.quadraticCurveTo(20, -16, 11, -6); g.fill(); g.stroke();
      } else if (a.t === "mine") {
        g.fillStyle = "#6a5a4a"; g.beginPath(); g.moveTo(-34, 4); g.quadraticCurveTo(-26, -12, -10, -6); g.lineTo(-4, 4); g.closePath(); g.fill(); g.stroke();
        g.strokeStyle = "#5a3a20"; g.lineWidth = 3; g.beginPath(); g.moveTo(4, 4); g.lineTo(16, -36); g.lineTo(28, 4); g.moveTo(8, -12); g.lineTo(24, -12); g.stroke();
        g.save(); g.translate(16, -34); g.rotate(t * 1.2); g.lineWidth = 1.8; g.strokeStyle = "#4a3a2a"; for (var s2 = 0; s2 < 4; s2++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(0, 0); g.lineTo(8, 0); g.stroke(); } g.beginPath(); g.arc(0, 0, 8, 0, 7); g.stroke(); g.restore();
        g.fillStyle = "#8a6a3a"; g.fillRect(30, -5, 9, 6); g.strokeRect(30, -5, 9, 6);
      }
      g.restore();
    });
  };
})();

;
