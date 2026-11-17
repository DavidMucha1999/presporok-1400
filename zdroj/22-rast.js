/* ==== js/rast.js ==== */
/* Prešporok 1400 – rast miest: mestá sa vďaka dielňam, rodom a hráčovým darom rozrastú na vyššiu úroveň. Autor: Dávid Mucha. */
(function () {
  "use strict";
  var MAXT = 7, EXTRA = 2, DIV = 6, DONATE = 500, DONATE_PTS = 25;

  function baseTier(C) { return (CITY_DEF[C.def] && CITY_DEF[C.def].tier) || C.tier || 1; }
  function cap(C) { return Math.min(MAXT, baseTier(C) + EXTRA); }
  function need(C) { return 250 * C.tier; }
  function score(C) {
    var bs = S.bld.filter(function (b) { return b.city === C.id; });
    var fam = S.dyn.filter(function (d) { return d.city === C.id && !d.royal && !d.gone; }).length;
    return (bs.length + bs.reduce(function (a, b) { return a + (b.lvl || 1); }, 0) + fam) / DIV;
  }
  function perTurn(C) { return Math.round(score(C) * 10) / 10; }
  function mine(C) { try { return P().city === C.id || S.bld.some(function (b) { return b.owner === 0 && b.city === C.id; }); } catch (e) { return false; } }

  var GAIN = [
    "Dlažba a lampy sa rozšírili po ďalších uliciach, pri bránach vyrástlo predmestie.",
    "Trhy sú väčšie, na ulici je viac ľudí a okolo mesta pribudli polia a osady.",
    "Mesto má mohutnejšie hradby, honosnejšie domy a bohatšie okolie."
  ];

  function promote(C) {
    var old = C.tier;
    C.tier = old + 1; C.maxT = Math.min(10, (C.maxT || 1) + 1); C.tre = (C.tre || 0) + 300 * C.tier;
    C.grown = (C.grown || 0) + 1; C.grownY = S.year;
    try { chron("Mesto " + C.n + " povýšilo na úroveň " + ROMAN(C.tier) + ". Rastie počet obyvateľov, trhy aj stavby.", null, "good"); } catch (e) { }
    if (mine(C)) {
      try {
        queue({
          title: "Mesto " + esc(C.n) + " rastie",
          html: '<p>Vďaka dielňam, rodom a obchodu sa mesto <b>' + esc(C.n) + '</b> rozrástlo na <b>úroveň ' + ROMAN(C.tier) + '</b> (' + "★".repeat(C.tier) + ').</p>' +
            '<p>' + GAIN[Math.min(2, C.grown - 1)] + '</p>' +
            '<dl class="kv" style="margin-top:8px"><dt>Nový najvyšší titul</dt><dd>' + TITLES[C.maxT].n + '</dd><dt>Mestská pokladnica</dt><dd>+' + zl(300 * C.tier) + '</dd></dl>' +
            '<p class="muted" style="margin-top:8px">Väčšie mesto má vyššie ceny, drahšie stavby, väčšie príjmy a viac zákazníkov.</p>'
        });
      } catch (e) { }
    }
  }

  function growTurn() {
    S.cities.forEach(function (C) {
      C.gp = C.gp || 0;
      if (C.tier >= cap(C)) { C.gp = 0; return; }
      C.gp += score(C);
      if (C.gp >= need(C)) { C.gp -= need(C); promote(C); }
    });
  }

  var oEnd = window.endTurn;
  window.endTurn = function () {
    var r = oEnd.apply(this, arguments);
    try { growTurn(); } catch (e) { console.warn("rast", e); }
    return r;
  };

  A.rastDar = function () {
    var p = P(), C = CC();
    if (C.tier >= cap(C)) return;
    if (p.money < DONATE) { toast("Na dar mestu potrebuješ " + zl(DONATE) + ".", "bad"); return; }
    p.money -= DONATE; led(p, "ine", -DONATE); C.gp = (C.gp || 0) + DONATE_PTS; C.tre = (C.tre || 0) + Math.round(DONATE * .3);
    log("Prispel si na rozvoj mesta " + C.n + " sumou " + zl(DONATE) + ".", "good");
    try { SND.play("coin"); } catch (e) { }
    if (C.gp >= need(C)) { C.gp -= need(C); promote(C); }
    render();
  };

  /* prehľad rastu v paneli pod mapou */
  var oLP = window.lotPanel;
  window.lotPanel = function () {
    var h = oLP();
    try {
      if (S.sel == null) {
        var C = CC(), full = C.tier >= cap(C), n = need(C), g = Math.min(n, Math.round(C.gp || 0)), pc = full ? 100 : Math.round(g / n * 100);
        h += '<div class="rast" style="margin-top:12px"><div class="row between"><b>Rast mesta</b><span class="pill">' + "★".repeat(C.tier) + ' úroveň ' + ROMAN(C.tier) + '</span></div>' +
          '<div style="height:10px;border-radius:5px;background:rgba(90,70,40,.22);border:1px solid #8f6211;margin:6px 0;overflow:hidden"><div style="width:' + pc + '%;height:100%;background:linear-gradient(#e8c360,#b9852a)"></div></div>' +
          (full
            ? '<p class="muted" style="margin:0">Mesto dosiahlo najvyššiu úroveň, akú mu dovoľuje poloha.</p>'
            : '<p class="muted" style="margin:0">' + g + ' / ' + n + ' bodov · približne +' + perTurn(C) + ' za štvrťrok. Rastie s počtom a úrovňou dielní a rodov v meste.</p>' +
              '<div class="row" style="margin-top:8px"><button class="btn" data-a="rastDar" ' + (P().money < DONATE ? "disabled" : "") + '>Prispieť na rozvoj · ' + zl(DONATE) + '</button></div>') +
          '</div>';
      }
    } catch (e) { console.warn("rast panel", e); }
    return h;
  };

  window.RAST = { cap: cap, need: need, score: perTurn, promote: promote };
})();

;
