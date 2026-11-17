/* ==== js/shell.js ==== */
/* Prešporok 1400 – obal hry: hlavné menu, ponuka počas hry, ukončenie. Autor a vývojár: Dávid Mucha. */
(function () {
  "use strict";
  var BG = ["h_jun", "h_sep", "h_apr", "h_oct", "build", "mortagne"];
  var MENU = "menu";
  var bgI = Math.floor(Math.random() * BG.length);
  var origStart = renderStart;
  var origRender = render;

  function lastSlot() {
    var e = Object.entries(slotMeta()).sort(function (a, b) { return b[1].ts - a[1].ts; })[0];
    return e ? { id: +e[0], m: e[1] } : null;
  }
  function H(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var AUTHOR = '<p class="credit">Tvorca a vývojár hry <b>Dávid Mucha</b></p>';

  var ICO = {
    go: '<path d="M6 3.5v13l10-6.5z" fill="currentColor"/>',
    new: '<path d="M10 3v14M3 10h14" stroke="currentColor" stroke-width="2" fill="none"/>',
    book: '<path d="M3 4.5c3-1 5-1 7 .5 2-1.500 4-1.500 7-.5v11c-3-1-5-1-7 .5-2-1.500-4-1.500-7-.5z M10 5v11" stroke="currentColor" stroke-width="1.500" fill="none"/>',
    star: '<path d="M10 2.500l2.300 4.800 5.200.700-3.800 3.600.9 5.200L10 14.300 5.400 16.800l.9-5.200L2.500 8l5.200-.700z" fill="currentColor"/>',
    gear: '<circle cx="10" cy="10" r="2.800" fill="none" stroke="currentColor" stroke-width="1.600"/><path d="M10 2.500v2.200M10 15.300v2.200M2.500 10h2.200M15.300 10h2.200M4.700 4.700l1.500 1.500M13.800 13.800l1.500 1.500M15.300 4.700l-1.500 1.500M6.200 13.800l-1.500 1.500" stroke="currentColor" stroke-width="1.600"/>',
    door: '<path d="M4 17V3h9v14M4 17h12M10 10h.1" stroke="currentColor" stroke-width="1.700" fill="none"/>',
    back: '<path d="M12 4l-6 6 6 6" stroke="currentColor" stroke-width="2" fill="none"/>',
    menu: '<path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.800"/>'
  };
  function ic(k) { return '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">' + ICO[k] + "</svg>"; }

  /* ---------- hlavné menu ---------- */
  function mmBtn(a, icon, label, sub, cls) {
    return '<button class="mm-btn ' + (cls || "") + '" data-a="' + a + '"><span class="mm-ic">' + ic(icon) + '</span><span class="mm-tx"><b>' + label + "</b>" + (sub ? "<small>" + sub + "</small>" : "") + "</span></button>";
  }
  function menuHTML() {
    var l = lastSlot(), arms = (l && l.m.arms) || START.arms;
    var cont = l ? mmBtn("menuContinue", "go", "Pokračovať", "rod " + H(l.m.rod) + " · " + H(l.m.s) + " " + H(l.m.y) + " · " + H(l.m.c), "primary") : "";
    var stage = BG[bgI];
    return '<div class="mainmenu"><div class="mm-bg" style="background-image:url(img/' + stage + '.jpg)"></div><div class="mm-veil"></div>' +
      '<div class="mm-in"><div class="mm-crest">' + shield(0, 92, arms) + '</div>' +
      '<p class="mm-kick">od Prešporka po kráľovský dvor v Londýne</p><h1 class="mm-title">Prešporok <span>1400</span></h1>' +
      '<div class="mm-rule"><i></i><em>Anno Domini MCD</em><i></i></div>' +
      '<nav class="mm-btns" aria-label="Hlavné menu">' + cont +
      mmBtn("menuNew", "new", "Nový rod", "založ dielňu a vlastnú dynastiu", l ? "" : "primary") +
      mmBtn("saves", "book", "Uložené hry", "načítať, stiahnuť, zmazať") +
      '<div class="mm-pair">' + mmBtn("fame", "star", "Sieň slávy") + mmBtn("achs", "star", "Listiny") + "</div>" +
      mmBtn("settings", "gear", "Nastavenia", "hudba, zvuky, vzhľad") +
      mmBtn("menuQuit", "door", "Ukončiť hru", "", "quit") +
      "</nav>" + AUTHOR + "</div></div>";
  }

  /* ---------- tvorba rodu: náhľad hlavy rodu ---------- */
  function newAside() {
    var cn = (CLASSES[START.cls] || {}).n || "";
    var look = Object.assign({}, START.look, { g: START.gender });
    var por = "";
    try { por = portrait(look, 22, { body: "b0" }, START.arms.f, 118); } catch (e) { }
    return '<aside class="np" aria-label="Náhľad rodu"><div class="np-in"><p class="lbl">náhľad rodu</p>' +
      '<div class="np-fig"><div class="np-por">' + por + '</div><div class="np-arms">' + shield(0, 88, START.arms) + "</div></div>" +
      '<h3 id="np-name">' + H(START.first || "Ján") + " " + H(START.name || "Bielik") + "</h3>" +
      '<p class="np-cls">' + H(cn) + " · " + (START.gender === "f" ? "žena" : "muž") + " · rok 1400</p>" +
      '<div class="np-seal" aria-hidden="true">R</div></div></aside>';
  }
  function newHTML() {
    var s = origStart();
    var tail = "</div></div></div>";
    if (s.slice(-tail.length) === tail) s = s.slice(0, -12) + newAside() + "</div></div>";
    return '<div class="newrod"><div class="nr-bar wrap"><button class="btn ghost" data-a="menuBack">' + ic("back") + ' Späť do menu</button><span class="nr-t">Založenie rodu</span></div>' + s + "</div>";
  }
  renderStart = function () { return MENU === "new" ? newHTML() : menuHTML(); };

  document.addEventListener("input", function (e) {
    if (e.target && (e.target.id === "f-name" || e.target.id === "f-first")) {
      var n = document.getElementById("np-name");
      if (n) n.textContent = (document.getElementById("f-first").value || "Ján") + " " + (document.getElementById("f-name").value || "Bielik");
    }
  });

  /* ---------- ponuka počas hry ---------- */
  function gameMenu() {
    queue({
      title: "Ponuka",
      html: '<div class="gm">' +
        '<button class="gm-b" data-a="mclose">' + ic("go") + "<span>Pokračovať v hre</span></button>" +
        '<button class="gm-b" data-a="gmSave">' + ic("book") + "<span>Uložiť hru</span></button>" +
        '<button class="gm-b" data-a="saves">' + ic("book") + "<span>Uložené hry</span></button>" +
        '<div class="gm-two"><button class="gm-b" data-a="music">' + ic("star") + "<span>Hudba</span></button>" +
        '<button class="gm-b" data-a="sfx">' + ic("star") + "<span>Zvuky</span></button>" +
        '<button class="gm-b" data-a="darkT">' + ic("star") + "<span>Tmavý režim</span></button>" +
        '<button class="gm-b" data-a="help">' + ic("book") + "<span>Kniha vedomostí</span></button></div>" +
        '<button class="gm-b" data-a="settings">' + ic("gear") + "<span>Nastavenia</span></button>" +
        '<button class="gm-b" data-a="toMenu">' + ic("back") + "<span>Do hlavného menu</span></button>" +
        '<button class="gm-b quit" data-a="menuQuit">' + ic("door") + "<span>Ukončiť hru</span></button></div>" +
        '<div class="muted gm-n">Klávesom Esc otvoríš túto ponuku kedykoľvek.</div>'
    });
  }
  render = function () {
    origRender();
    if (!S) return;
    var tools = document.querySelector(".navrow .tools");
    if (tools && !tools.querySelector('[data-a="gameMenu"]')) {
      var b = document.createElement("button");
      b.className = "btn ghost sm gmtg";
      b.dataset.a = "gameMenu";
      b.title = "Ponuka (Esc)";
      b.innerHTML = ic("menu") + "Ponuka";
      tools.insertBefore(b, tools.firstChild);
    }
  };

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || e.repeat) return;
    var box = document.getElementById("modal");
    if (!S || (box && !box.hidden) || document.querySelector(".lens")) return;
    if (e.target && e.target.closest && e.target.closest("input,select,textarea")) return;
    e.preventDefault(); e.stopPropagation();
    gameMenu();
  }, true);

  /* ---------- ukončenie ---------- */
  function farewell() {
    var d = document.createElement("div");
    d.className = "farewell";
    d.innerHTML = '<div class="fw-bg" style="background-image:url(img/h_may.jpg)"></div><div class="fw-in">' + '<div class="mm-crest">' + shield(0, 84, START.arms) + '</div><h2>Do videnia v Prešporku</h2><p>Hra je uložená. Túto kartu môžeš zavrieť.</p>' +
      '<button class="mm-btn primary" id="fw-back"><span class="mm-ic">' + ic("go") + '</span><span class="mm-tx"><b>Vrátiť sa do hry</b></span></button>' + AUTHOR + "</div>";
    document.body.appendChild(d);
    document.getElementById("fw-back").onclick = function () { d.remove(); };
  }
  function quitNow() {
    try { if (S) save(); } catch (e) { }
    if (window.desktop && window.desktop.quit) { window.desktop.quit(); return; }
    try { window.close(); } catch (e) { }
    farewell();
  }

  /* ---------- akcie ---------- */
  A.menuNew = function () { MENU = "new"; render(); window.scrollTo(0, 0); };
  A.menuBack = function () { try { keepForm(); } catch (e) { } MENU = "menu"; render(); window.scrollTo(0, 0); };
  A.menuContinue = function () { var l = lastSlot(); if (l && loadSlot(l.id)) { render(); window.scrollTo(0, 0); } };
  A.gameMenu = gameMenu;
  A.gmSave = function () { try { save(); toast("Hra uložená.", "good"); } catch (e) { } };
  A.toMenu = function () {
    queue({ title: "Do hlavného menu?", html: "<p>Hra sa uloží a vrátiš sa na úvodnú obrazovku.</p>", btns: [{ t: "Zostať v hre", a: "mclose" }, { t: "Do menu", a: "toMenuGo" }] });
  };
  A.toMenuGo = function () {
    try { save(); } catch (e) { }
    closeModal(true);
    var adv = document.getElementById("advp"); if (adv) adv.remove();
    S = null; MENU = "menu"; bgI = (bgI + 1) % BG.length;
    render(); window.scrollTo(0, 0);
  };
  A.menuQuit = function () {
    queue({ title: "Ukončiť hru?", html: "<p>Rozohraná hra sa pred zatvorením uloží.</p>", btns: [{ t: "Zrušiť", a: "mclose" }, { t: "Ukončiť hru", a: "quitGo" }] });
  };
  A.quitGo = function () { closeModal(true); quitNow(); };

  if (!S) render();
})();

;
