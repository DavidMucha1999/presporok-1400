/* ==== js/pozemky.js ==== */
/* Prešporok 1400 – kúpa pozemkov: klik na voľný pozemok na mape, kúpa a stavba presne na tom mieste. Autor: Dávid Mucha. */
(function () {
  "use strict";
  var BASE = 180, SELL = .7, MAXOWN = 3;

  function dk(cid, lid) { try { return lotDist(cid, lid) || "mesto"; } catch (e) { return "mesto"; } }
  function free(l) { return !!l && !l.pub && l.b == null && l.res == null; }
  function price(cid, lid) {
    var C = CITY(cid), D = DIST[dk(cid, lid)] || DIST.mesto;
    return Math.max(50, Math.round(BASE * cmul(C) * D.c / 10) * 10);
  }
  function mineEmpty() { return S.lots.filter(function (l) { return free(l) && l.own === 0; }); }
  function buildPrice(t, l) { var c = 0; S.selBuild = l.id; try { c = bcost(t); } finally { S.selBuild = null; } return c; }
  function distLine(l) {
    var D = DIST[dk(S.ci, l.id)] || DIST.mesto;
    return '<p class="muted" style="margin:0 0 8px"><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + D.col + ';margin-right:6px"></i><b>' + D.n + '</b> · ' + D.d + '</p>';
  }

  /* ---------- okno pozemku ---------- */
  function plotModal(l) {
    var p = P(), C = CC(), pr = price(S.ci, l.id), D = DIST[dk(S.ci, l.id)] || DIST.mesto;
    if (l.own !== 0) {
      var cnt = mineEmpty().length;
      queue({
        title: "Voľný pozemok na predaj",
        html: distLine(l) + '<p>Pozemok v meste ' + esc(C.n) + '. Keď ho kúpiš, môžeš na ňom postaviť dielňu presne na tomto mieste.</p>' +
          '<dl class="kv" style="margin-top:8px"><dt>Cena pozemku</dt><dd>' + zl(pr) + '</dd><dt>Tvoje peniaze</dt><dd>' + zl(p.money) + '</dd><dt>Tvoje prázdne pozemky</dt><dd>' + cnt + ' / ' + MAXOWN + '</dd></dl>' +
          '<p class="muted" style="margin-top:8px">Pozemok vieš neskôr predať späť za ' + Math.round(SELL * 100) + ' % ceny, kým je prázdny.</p>',
        btns: [{ t: "Zavrieť", a: "mclose" }, { t: "Kúpiť pozemok · " + zl(pr), a: "landBuy", d: { l: l.id }, pri: 1 }]
      });
      return;
    }
    var types = CLASSES[p.cls].b, full = myBall(p).length >= maxB(p);
    var btns = [{ t: "Zavrieť", a: "mclose" }, { t: "Predať pozemok · " + zl(Math.round((l.paid || pr) * SELL)), a: "landSell", d: { l: l.id } }];
    types.forEach(function (t) { btns.push({ t: (SHORT[t] || BT[t].n) + " · " + zl(buildPrice(t, l)), a: "plotBuild", d: { t: t, l: l.id }, pri: btns.length === 2 }); });
    queue({
      title: "Tvoj pozemok",
      html: distLine(l) + '<p>' + (full ? 'Titul ' + TITLES[p.title].n + ' dovoľuje najviac ' + maxB(p) + ' prevádzok vo všetkých mestách spolu. Najprv zvýš titul alebo niečo predaj.' : 'Vyber, čo tu postavíš. Budova vyrastie presne na tomto pozemku.') + '</p>' +
        '<dl class="kv" style="margin-top:8px"><dt>Tvoje peniaze</dt><dd>' + zl(p.money) + '</dd></dl>',
      btns: btns
    });
  }

  /* ---------- akcie ---------- */
  A.landBuy = function (e) {
    var p = P(), l = S.lots[+e.l];
    if (!l || !free(l) || l.own != null) return;
    if (!hasLic(S.ci)) { toast("Najprv potrebuješ povolenie obchodovať v tomto meste.", "bad"); return; }
    if (mineEmpty().length >= MAXOWN) { toast("Naraz môžeš držať najviac " + MAXOWN + " prázdne pozemky.", "bad"); return; }
    var c = price(S.ci, l.id);
    if (p.money < c) { toast("Na pozemok nemáš dosť peňazí (" + zl(c) + ").", "bad"); return; }
    p.money -= c; led(p, "ine", -c); l.own = 0; l.paid = c; S.sel = l.id;
    log("Kúpil si pozemok (" + (DIST[dk(S.ci, l.id)] || DIST.mesto).n.toLowerCase() + ") za " + zl(c) + ".", "good");
    try { SND.play("coin"); } catch (x) { }
    closeModal(true); render(); plotModal(l);
  };
  A.landSell = function (e) {
    var p = P(), l = S.lots[+e.l];
    if (!l || !free(l) || l.own !== 0) return;
    var c = Math.round((l.paid || price(S.ci, l.id)) * SELL);
    p.money += c; led(p, "ine", c); l.own = null; l.paid = null;
    log("Predal si prázdny pozemok za " + zl(c) + ".", "");
    try { SND.play("coin"); } catch (x) { }
    closeModal(true); render();
  };
  A.plotBuild = function (e) {
    var p = P(), l = S.lots[+e.l];
    if (!l || !free(l) || l.own !== 0) return;
    var c = buildPrice(e.t, l);
    if (myBall(p).length >= maxB(p)) { toast("Titul ti nedovoľuje ďalšiu prevádzku.", "bad"); return; }
    if (p.money < c) { toast("Na stavbu ti chýba " + zl(c - p.money) + ".", "bad"); return; }
    closeModal(true); S.sel = l.id; A.build({ t: e.t, l: l.id });
  };

  /* stavba cez ľubovoľné tlačidlo: najprv vlastný prázdny pozemok, inak sa kúpi najlacnejší voľný */
  (function () {
    var o = A.build;
    A.build = function (e) {
      var p = P(), l = e.l != null ? S.lots[+e.l] : null;
      if (!hasLic(S.ci)) { o(e); return; }
      if (!l) {
        l = mineEmpty()[0];
        if (!l) {
          var cand = S.lots.filter(function (z) { return free(z) && z.own == null; }).sort(function (a, b) { return price(S.ci, a.id) - price(S.ci, b.id); })[0];
          if (!cand) { o(e); return; }
          var pr = price(S.ci, cand.id), bc = buildPrice(e.t, cand);
          if (p.money < pr + bc) { toast("Na pozemok a stavbu potrebuješ " + zl(pr + bc) + ".", "bad"); return; }
          if (myBall(p).length >= maxB(p)) { o(e); return; }
          p.money -= pr; led(p, "ine", -pr); cand.own = 0; cand.paid = pr; l = cand;
          log("Kúpil si pozemok za " + zl(pr) + ".", "good");
        }
        e = Object.assign({}, e, { l: l.id });
      } else if (free(l) && l.own !== 0) {
        toast("Najprv kúp pozemok (klikni naň na mape).", "bad"); return;
      }
      o(e);
      try { if (l && l.b != null) { var b = S.bld.find(function (z) { return z.id === l.b; }); if (b && b.owner === 0) { l.own = 0; if (!l.paid) l.paid = price(S.ci, l.id); } } } catch (x) { }
    };
  })();

  /* klik na voľný pozemok na mape otvorí okno s kúpou alebo stavbou */
  (function () {
    var o = A.lot;
    A.lot = function (e) {
      o(e);
      try { var l = S.lots[+e.l]; if (l && free(l) && hasLic(S.ci) && !document.querySelector("#modal:not([hidden])")) plotModal(l); } catch (x) { console.warn("pozemky", x); }
    };
  })();

  /* AI nestavia na pozemkoch, ktoré patria hráčovi */
  window.freeLot = function () { return S.lots.find(function (l) { return !l.pub && l.b == null && l.res == null && l.own == null; }); };

  /* nápis na mape */
  (function () {
    var o = window.lotLabel;
    window.lotLabel = function (l) { var r = o(l); if (free(l) && l.own === 0) return { t: "môj pozemok", o: 0 }; return r; };
  })();

  /* bočný panel */
  (function () {
    var o = window.lotPanel;
    window.lotPanel = function () {
      var h = o();
      try {
        var l = S.sel == null ? null : S.lots[S.sel];
        if (l && free(l) && hasLic(S.ci)) {
          var pr = price(S.ci, l.id);
          if (l.own === 0) {
            h = h.replace("<h3>Voľný pozemok</h3>", "<h3>Tvoj pozemok</h3>" + distLine(l)).replace("Tu môžeš postaviť novú prevádzku.", "Tento pozemok je tvoj. Dielňa vyrastie presne tu.");
            h += '<div class="row" style="margin-top:10px"><button class="btn" data-a="landSell" data-l="' + l.id + '">Predať pozemok · ' + zl(Math.round((l.paid || pr) * SELL)) + '</button></div>';
          } else {
            h = scene(l) + "<h3>Voľný pozemok na predaj</h3>" + distLine(l) +
              '<p class="muted">Najprv kúp pozemok, potom na ňom postavíš dielňu.</p><div class="row between" style="margin-top:10px"><span>Cena pozemku</span><button class="btn pri" data-a="landBuy" data-l="' + l.id + '" ' + (p0().money < pr ? "disabled" : "") + '>Kúpiť · ' + zl(pr) + '</button></div>';
          }
        }
      } catch (x) { console.warn("pozemky panel", x); }
      return h;
    };
    function p0() { return P(); }
  })();

  window.POZEMKY = { price: price, mineEmpty: mineEmpty, modal: plotModal };
})();

;
