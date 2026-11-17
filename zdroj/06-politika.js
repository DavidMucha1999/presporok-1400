/* ==== js/politika.js ==== */
/* Prešporok 1400 – politika mesta (rada, hlasovanie, lobing, koalície) a misie vojakov a duchovných. Autor: Dávid Mucha. */
(function () {
  "use strict";
  if (typeof S === "undefined" || typeof FACT === "undefined") return;

  var SEATS = { cech: 3, kup: 3, pat: 2, cir: 2 };
  var TOTAL = 10, NEED = 6;
  var KEYS = ["cech", "kup", "pat", "cir"];

  function pol() {
    if (!S.pol) S.pol = { coal: null, lob: {}, bribe: {}, contrib: false, issue: null, hist: [], hosp: 0 };
    return S.pol;
  }
  function tier() { try { return Math.max(1, CITY(P().city).tier); } catch (e) { return 1; } }
  function homeC() { return CITY(P().city); }
  function H(x) { return esc(x); }
  function note(t) { var p = pol(); p.hist.unshift(S.year + " · " + t); if (p.hist.length > 6) p.hist.length = 6; }
  function standing(k) { try { return facOf(P().city)[k] || 0; } catch (e) { return 0; } }
  function rhet() { try { return skill(P(), "retorika"); } catch (e) { return 1; } }

  /* ---------- mestské otázky ---------- */
  var ISS = [
    { id: "dane_hore", n: "Zvýšenie mestských daní", d: "Pokladnica je prázdna a patricijovia chcú vyššie dane. Remeselníci a kupci sa budú brániť.", y: ["pat"], n_: ["cech", "kup"], ok: function (C) { return (C.tax || 1) < 1.3; },
      pass: function (C) { C.tax = 1.3; return "Mestské dane stúpli na 130 %."; }, fail: function () { return "Dane ostávajú bez zmeny."; } },
    { id: "dane_dole", n: "Zníženie mestských daní", d: "Cechy a kupci žiadajú ľahšie dane. Patricijovia varujú pred prázdnou pokladnicou.", y: ["cech", "kup"], n_: ["pat"], ok: function (C) { return (C.tax || 1) > .8; },
      pass: function (C) { C.tax = .8; return "Mestské dane klesli na 80 %."; }, fail: function () { return "Dane ostávajú bez zmeny."; } },
    { id: "sklad", n: "Obilný sklad", d: "Mesto chce postaviť verejný sklad obilia pre zlé roky. Kupci vidia v tom zásah do trhu.", y: ["cech", "cir"], n_: ["kup"], ok: function () { return true; },
      pass: function (C) { var c = 300 * tier(); C.tre = Math.max(0, (C.tre || 0) - c); try { S.mkt.obilie.s *= 1.35; } catch (e) { } return "Sklad je postavený. Zásoby obilia sú o tretinu vyššie, ceny klesnú."; }, fail: function () { return "Sklad sa nestavia. Ceny obilia ostávajú na milosti úrody."; } },
    { id: "spital", n: "Mestský špitál", d: "Cirkev a učení navrhujú špitál pre chorých a chudobných. Kupci nechcú platiť.", y: ["cir", "pat"], n_: ["kup"], ok: function () { return !(pol().hosp > S.year); },
      pass: function () { pol().hosp = S.year + 8; facAdj("cir", 8); return "Špitál otvorili. Zdravie rodu sa každý rok zlepší, cirkev ťa chváli."; }, fail: function () { return "Špitál sa nebuduje."; } },
    { id: "jarmok", n: "Mimoriadny jarmok", d: "Kupci a cechy chcú veľký jarmok na námestí. Cirkev kritizuje hluk a hriechy davu.", y: ["kup", "cech"], n_: ["cir"], ok: function (C) { return !(C.fair && C.fair >= S.turn); },
      pass: function (C) { C.fair = S.turn + 1; return "Jarmok sa uskutoční budúci štvrťrok."; }, fail: function () { return "Jarmok nebude."; } },
    { id: "cechy", n: "Cechová ochrana", d: "Remeselníci žiadajú ochranu pred cudzími majstrami. Kupci a učení sa boja drahších tovarov.", y: ["cech"], n_: ["kup", "pat"], ok: function (C) { return !(C.edict && C.edict.until > S.turn); },
      pass: function (C) { C.edict = { id: "cechy", until: S.turn + 8 }; return "Nariadenie platí dva roky."; }, fail: function () { return "Návrh padol."; } },
    { id: "straz", n: "Posilnená stráž", d: "Patricijovia a cirkev chcú viac stráží proti zbojníkom. Cechy by museli platiť viac.", y: ["pat", "cir"], n_: ["cech"], ok: function (C) { return !(C.edict && C.edict.until > S.turn); },
      pass: function (C) { C.edict = { id: "straz", until: S.turn + 8 }; return "Stráže sú posilnené na dva roky."; }, fail: function () { return "Návrh padol."; } },
    { id: "dlazba", n: "Dláždenie a studne", d: "Kupci a patricijovia chcú dláždené ulice a nové studne. Cechy odmietajú ďalšie poplatky.", y: ["kup", "pat"], n_: ["cech"], ok: function (C) { return !(C.edict && C.edict.until > S.turn); },
      pass: function (C) { C.edict = { id: "dlazba", until: S.turn + 8 }; return "Mesto sa dláždi a stavajú sa studne."; }, fail: function () { return "Návrh padol."; } }
  ];
  function issueById(id) { for (var i = 0; i < ISS.length; i++) if (ISS[i].id === id) return ISS[i]; return null; }

  /* ---------- pravdepodobnosť hlasovania ---------- */
  function blockStance(iss, k, neutral) {
    if (iss.y.indexOf(k) >= 0) return true;
    if (iss.n_.indexOf(k) >= 0) return false;
    return !!(neutral && neutral[k]);
  }
  function flipP(k) {
    var p = pol(), v = .12 + standing(k) / 160 + rhet() * .025;
    if (p.coal && p.coal.k === k && p.coal.until > S.year) v += .3;
    if (p.lob[k]) v += .2;
    if (p.bribe[k]) v += .35;
    if (p.contrib) v += .12;
    return Math.max(.03, Math.min(.92, v));
  }
  function yesProb(iss, k, stance, neutral) {
    var def = blockStance(iss, k, neutral);
    if (stance === "abst") return def ? .96 : .04;
    var want = stance === "yes";
    if (def === want) return want ? .96 : .04;
    var f = flipP(k);
    return want ? f : 1 - f;
  }
  function passChance(iss, stance, neutral) {
    var dist = [1];
    KEYS.forEach(function (k) {
      var pr = yesProb(iss, k, stance, neutral), st = SEATS[k], nd = new Array(dist.length + st).fill(0);
      for (var i = 0; i < dist.length; i++) { nd[i + st] += dist[i] * pr; nd[i] += dist[i] * (1 - pr); }
      dist = nd;
    });
    var s = 0; for (var i = NEED; i < dist.length; i++) s += dist[i];
    return s;
  }

  /* ---------- zasadnutie rady: ohlásenie a hlasovanie ---------- */
  function announce() {
    var p = P(), po = pol();
    if (p.title < 1 || S.year < 1401 || po.issue) return;
    var C = homeC();
    var ok = ISS.filter(function (i) { try { return i.ok(C); } catch (e) { return false; } });
    var ok2 = ok.filter(function (i) { return i.id !== po.last; }); if (ok2.length) ok = ok2;
    if (!ok.length) return;
    var iss = ok[Math.floor(Math.random() * ok.length)];
    var neutral = {}; KEYS.forEach(function (k) { neutral[k] = Math.random() < .5; });
    po.last = iss.id;
    po.issue = { id: iss.id, due: S.turn + 2, asked: false, neutral: neutral };
    po.lob = {}; po.bribe = {}; po.contrib = false;
    S.pend.push({
      title: "Program zasadnutia rady", wide: 0,
      html: "<p>Mestská rada mesta " + H(C.n) + " bude o dva štvrťroky hlasovať o veci: <b>" + H(iss.n) + "</b>.</p><p>" + H(iss.d) + "</p>" +
        "<p class=\"muted\">Do hlasovania môžeš rokovať s frakciami, podplácať zástupcov alebo uzavrieť koalíciu. Všetko nájdeš v tlačidle <b>Radnica</b>.</p>",
      btns: [{ t: "Otvoriť Radnicu", a: "radnica", pri: 1 }, { t: "Zatvoriť", a: "mclose" }]
    });
  }
  function blockLines(iss, neutral, stance) {
    return KEYS.map(function (k) {
      var def = blockStance(iss, k, neutral), pr = yesProb(iss, k, stance, neutral);
      return "<tr><td><b>" + H(FACT[k].n) + "</b> <span class=\"muted\">(" + SEATS[k] + ")</span></td><td>" + (def ? "chce áno" : "chce nie") + "</td><td class=\"r\">" + Math.round(pr * 100) + " % áno</td></tr>";
    }).join("");
  }
  function voteModal() {
    var po = pol(), iss = issueById(po.issue.id), C = homeC(), t = tier();
    var yes = Math.round(passChance(iss, "yes", po.issue.neutral) * 100), no = Math.round(passChance(iss, "no", po.issue.neutral) * 100), ab = Math.round(passChance(iss, "abst", po.issue.neutral) * 100);
    var cc = 600 * t, p = P();
    return {
      title: "Hlasovanie v rade: " + iss.n, lock: 1, wide: 1,
      html: "<p>" + H(iss.d) + "</p><p class=\"muted\">Na schválenie treba " + NEED + " z " + TOTAL + " hlasov. Podpíš sa pod návrh, odmietni ho alebo sa zdrž.</p>" +
        "<div class=\"tw\"><table><thead><tr><th>Frakcia (hlasy)</th><th>Predvolene</th><th class=\"r\">Hlas „áno“ ak podporíš</th></tr></thead><tbody>" + blockLines(iss, po.issue.neutral, "yes") + "</tbody></table></div>" +
        "<p><b>Šanca, že návrh prejde:</b> ak ho podporíš <b>" + yes + " %</b>, ak ho zamietneš <b>" + no + " %</b>, ak sa zdržíš <b>" + ab + " %</b>.</p>" +
        (po.coal && po.coal.until > S.year ? "<p class=\"muted\">Koalícia: " + H(FACT[po.coal.k].n) + " ťa podporuje do roku " + po.coal.until + ". Ak budeš hlasovať proti ich záujmu, koalícia sa rozpadne.</p>" : ""),
      btns: [
        { t: "Podporiť", a: "polVote", d: { s: "yes", c: 0 }, pri: 1 },
        { t: "Podporiť a prispieť " + zl(cc), a: "polVote", d: { s: "yes", c: 1 } },
        { t: "Zamietnuť", a: "polVote", d: { s: "no", c: 0 } },
        { t: "Zdržať sa", a: "polVote", d: { s: "abst", c: 0 } }
      ]
    };
  }
  A.polVote = function (e) {
    closeModal(true);
    var po = pol(), p = P(); if (!po.issue) return;
    var iss = issueById(po.issue.id), C = homeC(), t = tier(), st = e.s;
    if (e.c === "1" || e.c === 1) { var cc = 600 * t; if (p.money >= cc) { p.money -= cc; led(p, "ine", -cc); po.contrib = true; facAdj("pat", 2); facAdj("kup", 2); } }
    var seatsYes = 0, lines = [], stances = {};
    KEYS.forEach(function (k) {
      var pr = yesProb(iss, k, st, po.issue.neutral), v = Math.random() < pr;
      stances[k] = v; if (v) seatsYes += SEATS[k];
      lines.push(H(FACT[k].n) + ": " + (v ? "za" : "proti"));
    });
    var pass = seatsYes >= NEED, res;
    try { res = pass ? iss.pass(C) : iss.fail(C); } catch (er) { res = ""; console.warn(er); }
    /* spokojnosť frakcií */
    KEYS.forEach(function (k) {
      var want = blockStance(iss, k, po.issue.neutral);
      if (iss.y.indexOf(k) >= 0 || iss.n_.indexOf(k) >= 0) {
        var happy = want === pass;
        facAdj(k, happy ? 3 : -3);
      }
    });
    /* tvoj postoj a koalícia */
    var coalMsg = "";
    if (po.coal && po.coal.until > S.year && st !== "abst") {
      var ck = po.coal.k, cwant = blockStance(iss, ck, po.issue.neutral), pwant = st === "yes";
      if (iss.y.indexOf(ck) >= 0 || iss.n_.indexOf(ck) >= 0) {
        if (cwant !== pwant) { facAdj(ck, -20); po.coal = null; coalMsg = " Koalícia sa rozpadla, keďže si hlasoval proti jej záujmu."; }
        else facAdj(ck, 5);
      }
    }
    if (st === "yes" && pass) p_rf(1);
    var line = "Rada " + (pass ? "schválila" : "zamietla") + " návrh „" + iss.n + "“ (" + seatsYes + ":" + (TOTAL - seatsYes) + "). " + res + coalMsg;
    chron("Mestská rada mesta " + C.n + ": " + line, "volby", pass ? "good" : "");
    note(iss.n + " – " + (pass ? "schválené" : "zamietnuté") + " " + seatsYes + ":" + (TOTAL - seatsYes));
    po.issue = null; po.lob = {}; po.bribe = {}; po.contrib = false;
    msgNow(line, pass ? "good" : "bad");
    queue({ title: "Výsledok hlasovania", html: "<p>" + H(line) + "</p><p class=\"muted\">" + lines.join(" · ") + "</p>", btns: [{ t: "Pokračovať", a: "mclose", pri: 1 }] });
    render();
  };

  /* ---------- Radnica: lobing, úplatky, koalície ---------- */
  function bar(v) {
    var w = Math.abs(v) / 2;
    return "<div class=\"pol-bar\"><i style=\"left:50%;width:" + w + "%;" + (v < 0 ? "transform:translateX(-100%);background:#a5312a" : "") + "\"></i></div>";
  }
  function radnicaModal() {
    var p = P(), C = homeC(), po = pol(), t = tier();
    var F = facOf(p.city), iss = po.issue ? issueById(po.issue.id) : null;
    var coal = po.coal && po.coal.until > S.year ? po.coal : null;
    var rows = KEYS.map(function (k) {
      var v = F[k] || 0, f = FACT[k];
      var tags = [];
      if (coal && coal.k === k) tags.push("<span class=\"pill ok\">koalícia do " + coal.until + "</span>");
      if (po.lob[k]) tags.push("<span class=\"pill\">rokovalo sa</span>");
      if (po.bribe[k]) tags.push("<span class=\"pill\">podplatení</span>");
      var bc = 250 * t, cc = 400 * t;
      return "<div class=\"pol-f\"><div class=\"pol-fh\"><b>" + H(f.n) + "</b> <span class=\"muted\">· hlasy " + SEATS[k] + "</span> " + tags.join(" ") + "</div>" + bar(v) +
        "<div class=\"muted pol-fd\">" + H(f.d) + " Priazeň " + v + ".</div>" +
        "<div class=\"row pol-act\">" +
        "<button class=\"btn sm\" data-a=\"polLobby\" data-k=\"" + k + "\" " + (S.ap < 1 || po.lob[k] ? "disabled" : "") + ">Rokovať · 1 bod</button>" +
        "<button class=\"btn sm\" data-a=\"polBribe\" data-k=\"" + k + "\" " + (p.money < bc || po.bribe[k] ? "disabled" : "") + ">Podplatiť · " + zl(bc) + "</button>" +
        "<button class=\"btn sm\" data-a=\"polCoal\" data-k=\"" + k + "\" " + (S.ap < 1 || p.money < cc || (coal && coal.k === k) ? "disabled" : "") + ">Koalícia · 1 bod, " + zl(cc) + "</button>" +
        "</div></div>";
    }).join("");
    var offs = "";
    try {
      offs = OFFICES.map(function (o) {
        var h = C.off[o.id].h, who = h == null ? "neobsadený" : h === 0 ? "<b>tvoj rod</b>" : "rod " + H(S.dyn[h].name);
        return "<tr><td>" + H(o.n) + "</td><td>" + who + "</td></tr>";
      }).join("");
    } catch (e) { }
    var next = iss ? "<p><b>Na programe:</b> " + H(iss.n) + " <span class=\"muted\">(hlasovanie o " + Math.max(0, po.issue.due - S.turn) + " štvrťrokov)</span></p><p class=\"muted\">" + H(iss.d) + "</p>" +
      "<p class=\"muted\">Šanca pri podpore ~" + Math.round(passChance(iss, "yes", po.issue.neutral) * 100) + " %, pri zamietnutí návrh prejde ~" + Math.round(passChance(iss, "no", po.issue.neutral) * 100) + " %.</p>" :
      "<p class=\"muted\">Na program zatiaľ nič nie je. Nová otázka sa ohlási raz za rok.</p>";
    var hist = po.hist.length ? "<ul class=\"pol-h\">" + po.hist.map(function (x) { return "<li>" + H(x) + "</li>"; }).join("") + "</ul>" : "<p class=\"muted\">Zatiaľ žiadne hlasovania.</p>";
    return {
      title: "Radnica mesta " + C.n, wide: 1,
      html: "<div class=\"pol\">" + next +
        "<h3>Frakcie rady</h3><p class=\"muted\">Rokovanie zvýši tvoju šancu, že frakcia pôjde s tebou. Úplatok pôsobí silnejšie, ale hrozí prezradenie. Koalícia platí štyri roky.</p>" + rows +
        "<h3>Mestské úrady</h3><div class=\"tw\"><table><tbody>" + offs + "</tbody></table></div>" +
        "<h3>Posledné hlasovania</h3>" + hist + "</div>",
      btns: [{ t: "Zavrieť", a: "mclose", pri: 1 }]
    };
  }
  A.radnica = function () { queue(radnicaModal()); };
  function reopen() { setTimeout(function () { queue(radnicaModal()); render(); }, 20); }
  A.polLobby = function (e) {
    var po = pol(), p = P(), k = e.k; if (!KEYS.includes(k) || po.lob[k] || !spend(1, 0)) return reopen();
    po.lob[k] = true; facAdj(k, 3 + Math.floor(rhet() / 2));
    msgNow("Rokoval si s frakciou „" + FACT[k].n + "“. Je ti naklonenejšia.", "good"); reopen();
  };
  A.polBribe = function (e) {
    var po = pol(), p = P(), k = e.k, t = tier(), c = 250 * t;
    if (!KEYS.includes(k) || po.bribe[k] || p.money < c) return reopen();
    p.money -= c; led(p, "ine", -c);
    var risk = .24; try { if (holder("sudca") === 0) risk = .1; } catch (er) { }
    if (Math.random() < risk) {
      var f = c * 2; p.money -= f; led(p, "ine", -f); facAdj("pat", -12); facAdj(k, -8); p_rf(-4);
      chron("Prezradil sa pokus podplatiť zástupcov frakcie „" + FACT[k].n + "“ v meste " + homeC().n + ". Rod " + p.name + " dostal pokutu.", "volby", "bad");
      msgNow("Úplatok sa prezradil! Pokuta " + zl(f) + " a zlá povesť.", "bad");
      queue({ title: "Úplatok prezradený", html: "<p>Zástupca frakcie „" + H(FACT[k].n) + "“ úplatok prijal, no prezradil ho rade. Rod " + H(p.name) + " zaplatil pokutu <b>" + zl(f) + "</b> a stratil priazeň patricijov a kráľovského dvora.</p>", btns: [{ t: "Pokračovať", a: "mclose", pri: 1 }] });
      return render();
    }
    po.bribe[k] = true; msgNow("Zástupcovia frakcie „" + FACT[k].n + "“ ti sľúbili podporu.", "good"); reopen();
  };
  A.polCoal = function (e) {
    var po = pol(), p = P(), k = e.k, t = tier(), c = 400 * t;
    if (!KEYS.includes(k) || p.money < c || !spend(1, c)) return reopen();
    var old = po.coal && po.coal.until > S.year ? po.coal.k : null;
    if (old && old !== k) facAdj(old, -10);
    po.coal = { k: k, until: S.year + 4 }; facAdj(k, 15);
    chron("Rod " + p.name + " uzavrel koalíciu s frakciou „" + FACT[k].n + "“ v meste " + homeC().n + ".", "volby", "good");
    msgNow("Koalícia s frakciou „" + FACT[k].n + "“ platí do roku " + po.coal.until + ".", "good"); reopen();
  };

  /* ---------- tlačidlo Radnica ---------- */
  var oR = render;
  render = function () {
    oR();
    if (!S || S.ci == null) return;
    var tools = document.querySelector(".navrow .tools");
    if (tools && !tools.querySelector('[data-a="radnica"]') && P().title >= 1) {
      var b = document.createElement("button");
      b.className = "btn ghost sm"; b.dataset.a = "radnica"; b.title = "Mestská rada, frakcie, koalície";
      b.textContent = "Radnica";
      tools.insertBefore(b, tools.firstChild);
    }
  };

  /* ---------- hooky: ročné a štvrťročné ---------- */
  var oC = councilTurn;
  councilTurn = function () {
    oC();
    try {
      var po = pol();
      if (S.ci === P().city && po.issue && !po.issue.asked && S.turn >= po.issue.due && !S.over) {
        po.issue.asked = true; S.pend.push(voteModal());
      }
    } catch (e) { console.warn(e); }
  };

  /* ---------- misie vojakov a duchovných ---------- */
  function por(html) { return "<div class=\"mis-por\">" + html + "</div>"; }
  function cPor(k) { try { return por(portrait(k.look || lookOf(k), k.age, { body: "b0" }, DC(0), 84)); } catch (e) { return ""; } }
  function clPor(c) { try { return por(clericPortrait(c, 84)); } catch (e) { return ""; } }

  /* misia = { id, t, txt(name), ch:[{t,cost,st,base,okT,noT,ok:{...},no:{...}}] } ; efekt: merit, money, rf, fac:[k,v], sk, hurt, die */
  var MIL = [
    { id: "priesmyk", t: "Obrana horského priesmyku", txt: function (n) { return n + " velí malej hliadke na priesmyku. Od úsvitu pozoruje nepriateľský oddiel, ktorý je väčší, než čakali."; }, ch: [
      { t: "Držať priesmyk", st: "boj", base: .5, okT: "Hliadka odrazila útok a priesmyk ostal v rukách kráľa.", noT: "Priesmyk padol. Zostatok hliadky ledva unikol.", ok: { merit: 18, rf: 2 }, no: { merit: -6, hurt: 1, die: .1 } },
      { t: "Zdržať a stiahnuť sa po vlastných stopách", st: "boj", base: .78, okT: "Ústup prebehol v poriadku a posily dorazili včas.", noT: "Ústup sa zmenil na útek.", ok: { merit: 8 }, no: { merit: -3 } },
      { t: "Poslať posla po pomoc a čakať", cost: 60, st: "charizma", base: .65, okT: "Posily dorazili a nepriateľa rozprášili. Veliteľ ťa pochválil.", noT: "Posol dorazil neskoro.", ok: { merit: 12, rf: 1 }, no: { merit: -2 } } ] },
    { id: "eskorta", t: "Eskorta obchodnej karavány", txt: function (n) { return n + " dostal za úlohu sprevádzať kupeckú karavánu s drahým tovarom cez lesy."; }, ch: [
      { t: "Cesta po hlavnej ceste", st: "boj", base: .7, okT: "Karavána došla bez problémov. Kupci sa odmenili.", noT: "Zbojníci prepadli karavánu a časť tovaru zmizla.", ok: { merit: 8, money: 250 }, no: { merit: -4, hurt: 1 } },
      { t: "Zvoliť tajnú cestu cez les", st: "boj", base: .5, okT: "Úspech! Karavána obišla zálohu a kupci sa štedro odmenili.", noT: "Cesta bola horšia, než sa čakalo.", ok: { merit: 14, money: 500 }, no: { merit: -5, hurt: 1, die: .06 } },
      { t: "Nájať ďalších strážcov", cost: 120, st: "boj", base: .9, okT: "Silná eskorta odradila každého zbojníka.", noT: "Aj tak sa niečo stalo.", ok: { merit: 7, money: 280 }, no: { merit: -2 } } ] },
    { id: "hrad", t: "Obliehanie hradu", txt: function (n) { return "Kráľovské vojsko oblieha lúpežný hrad. " + n + " dostal príležitosť prejaviť sa."; }, ch: [
      { t: "Zaútočiť na hradby rebríkmi", st: "boj", base: .4, okT: "Si medzi prvými na hradbách. Hrad padol.", noT: "Útok sa zadrhol pod hradbami.", ok: { merit: 26, rf: 3, money: 300 }, no: { merit: -8, hurt: 1, die: .22 } },
      { t: "Podkopávať múr s pioniermi", st: "boj", base: .6, okT: "Múr sa zrútil a hrad padol bez veľkých strát.", noT: "Protiminy prekazili podkop.", ok: { merit: 16, money: 150 }, no: { merit: -3, hurt: 1 } },
      { t: "Čakať na vyhladovanie", st: "charizma", base: .85, okT: "Hrad sa vzdal. Tvoja trpezlivosť sa vyplatila.", noT: "Obliehanie sa pretiahlo a vojaci reptali.", ok: { merit: 9 }, no: { merit: -2 } } ] },
    { id: "suboj", t: "Rytiersky súboj o česť", txt: function (n) { return "Urazený šľachtic vyzval " + n + " na súboj pred celým táborom."; }, ch: [
      { t: "Prijať výzvu", st: "boj", base: .55, okT: "Súboj si vyhral a celý tábor ti tlieska.", noT: "Súper bol silnejší. Si zranený a zahanbený.", ok: { merit: 20, rf: 1 }, no: { merit: -10, hurt: 1, die: .12 } },
      { t: "Zmieriť sa vyjednávaním", st: "retorika", base: .65, okT: "Rozmýšľaním a slovami si spor urovnal.", noT: "Šľachtic ťa označil za zbabelca.", ok: { merit: 8, fac: ["pat", 2] }, no: { merit: -4 } },
      { t: "Odmietnuť a ísť k veliteľovi", st: "charizma", base: .8, okT: "Veliteľ spor zakázal.", noT: "Veliteľ nemal náladu a nechal ťa čakať.", ok: { merit: 3 }, no: { merit: -2 } } ] },
    { id: "zajatec", t: "Zajatý šľachtic", txt: function (n) { return n + " zajal pri potýčke bohatého šľachtica. Jeho rodina ponúka výkupné."; }, ch: [
      { t: "Vypýtať výkupné", st: "retorika", base: .8, okT: "Výkupné prišlo a vojaci dostali podiel.", noT: "Rodina odmietla zaplatiť a šľachtic ušiel.", ok: { merit: 10, money: 600 }, no: { merit: -2 } },
      { t: "Prepustiť ho zadarmo", st: "charizma", base: .95, okT: "Šľachtic sa zaviazal vďakou. Povesť rodu stúpla.", noT: "Nik si toho nevšimol.", ok: { merit: 6, rf: 3, fac: ["pat", 3] }, no: { merit: 1 } },
      { t: "Odovzdať ho veliteľovi", st: "boj", base: .9, okT: "Veliteľ ocenil tvoju disciplínu.", noT: "Veliteľ vzal celú zásluhu.", ok: { merit: 14, rf: 2 }, no: { merit: 4 } } ] },
    { id: "zbojnici", t: "Zbojníci na pochode", txt: function (n) { return n + " sa dozvedel, kde sa skrýva banda zbojníkov, ktorá terorizuje okolie."; }, ch: [
      { t: "Prepadnúť ich v noci", st: "boj", base: .55, okT: "Banda je rozprášená. Sedliaci ďakujú.", noT: "Zbojníci boli pripravení.", ok: { merit: 16, money: 200, fac: ["cech", 3] }, no: { merit: -6, hurt: 1, die: .13 } },
      { t: "Dohodnúť sa s nimi, aby odišli", st: "retorika", base: .5, okT: "Zbojníci odišli bez boja. Nikto nezomrel.", noT: "Rokovanie zlyhalo.", ok: { merit: 9 }, no: { merit: -4 } },
      { t: "Nahlásiť to bez zásahu", cost: 0, st: "charizma", base: .9, okT: "Veliteľ poslal väčší oddiel.", noT: "Zbojníci medzitým ušli.", ok: { merit: 5 }, no: { merit: 0 } } ] }
  ];
  var CLR = [
    { id: "desiatky", t: "Spor o desiatky", txt: function (n) { return "V dedine sa pohádali sedliaci s miestnym zemepánom o cirkevné desiatky. " + n + " má rozhodnúť."; }, ch: [
      { t: "Rozhodnúť spravodlivo", st: "retorika", base: .65, okT: "Obe strany odišli spokojné a dedina ťa chváli.", noT: "Rozhodnutie nepotešilo nikoho.", ok: { merit: 14, fac: ["cir", 3] }, no: { merit: -2 } },
      { t: "Postaviť sa za zemepána", st: "charizma", base: .8, okT: "Zemepán sa odvďačil darom pre kostol.", noT: "Sedliaci ťa vypískali.", ok: { merit: 8, money: 200, fac: ["cech", -3] }, no: { merit: -3 } },
      { t: "Poslať vec biskupovi", st: "retorika", base: .9, okT: "Biskup ocenil tvoju opatrnosť.", noT: "Vec sa zdržala.", ok: { merit: 5 }, no: { merit: 0 } } ] },
    { id: "kacir", t: "Kacír v okolí", txt: function (n) { return "V okolí kážu kacírsky kazateľ, ktorý ľudí vzbudzuje proti Cirkvi. " + n + " sa musí rozhodnúť."; }, ch: [
      { t: "Presvedčiť ho slovom", st: "retorika", base: .5, okT: "Kazateľ ustúpil a ľudia sa vrátili do kostola.", noT: "Kazateľ ťa nepočúval a vzbudil dav.", ok: { merit: 22, fac: ["cir", 4] }, no: { merit: -6 } },
      { t: "Nahlásiť ho inkvizícii", st: "charizma", base: .85, okT: "Veci ďalej vybavuje inkvizícia. Hlavné mesto ti ďakuje.", noT: "Ľud je rozhorčený, že si ho udal.", ok: { merit: 12, rf: 2, fac: ["pat", -2] }, no: { merit: 3, fac: ["cech", -3] } },
      { t: "Nechať to tak", st: "charizma", base: .9, okT: "Veci sa upokojili samy.", noT: "Kazateľ získal ďalších prívržencov.", ok: { merit: 0 }, no: { merit: -5, fac: ["cir", -3] } } ] },
    { id: "zbierka", t: "Zbierka na stavbu chrámu", txt: function (n) { return n + " má zorganizovať zbierku na stavbu nového chrámu."; }, ch: [
      { t: "Prosiť bohatých kupcov", st: "charizma", base: .6, okT: "Kupci sa zložili a chrám vyrastá.", noT: "Zbierka sa vydarila len v malom.", ok: { merit: 16, fac: ["kup", 3] }, no: { merit: 2 } },
      { t: "Zorganizovať slávnosť", cost: 150, st: "charizma", base: .85, okT: "Slávnosť prilákala dav a zbierka rástla.", noT: "Počasie slávnosť pokazilo.", ok: { merit: 14, money: 250, fac: ["cir", 3] }, no: { merit: -2 } },
      { t: "Pýtať príspevok od rodu", cost: 400, st: "retorika", base: .95, okT: "Dar rodu prispel a chrám pokračuje.", noT: "Zbierka sa aj tak zadrhla.", ok: { merit: 12, fac: ["cir", 6] }, no: { merit: 3 } } ] },
    { id: "mor", t: "Mor vo farnosti", txt: function (n) { return "Vo farnosti prepukla choroba. Ľudia utekajú, kňazi váhajú. " + n + " musí zvoliť."; }, ch: [
      { t: "Starať sa o chorých", st: "charizma", base: .65, okT: "Zachránil si veľa životov a ľudia ťa menujú svätcom.", noT: "Nakazil si sa a ledva si prežil.", ok: { merit: 26, fac: ["cir", 5] }, no: { merit: 6, die: .2 } },
      { t: "Slúžiť omše z bezpečnej vzdialenosti", st: "retorika", base: .85, okT: "Ľudia boli vďační aspoň za slová.", noT: "Ľudia ťa obvinili zo zbabelosti.", ok: { merit: 6 }, no: { merit: -5 } },
      { t: "Utiecť do kláštora", st: "charizma", base: .95, okT: "Prežil si a pokračuješ.", noT: "Ľudia ti to nezabudnú.", ok: { merit: -3 }, no: { merit: -10 } } ] },
    { id: "synoda", t: "Synoda duchovných", txt: function (n) { return n + " vystupuje na synode duchovných, kde sa hádajú o reforme Cirkvi."; }, ch: [
      { t: "Obhajovať reformu", st: "retorika", base: .5, okT: "Tvoj prejav zaujal a získal ti sympatie.", noT: "Konzervatívni duchovní ťa utíšili.", ok: { merit: 24, sk: "retorika" }, no: { merit: -6 } },
      { t: "Hájiť tradíciu", st: "retorika", base: .75, okT: "Biskupi ťa podporili.", noT: "Prejav zapadol.", ok: { merit: 14, rf: 1 }, no: { merit: 0 } },
      { t: "Mlčať a pozorovať", st: "charizma", base: .95, okT: "Zapamätal si, kto je kto.", noT: "Nikto si ťa nevšimol.", ok: { merit: 4, sk: "charizma" }, no: { merit: 0 } } ] },
    { id: "simonia", t: "Pokušenie simónie", txt: function (n) { return "Podozrivý obchodník ponúka " + n + " úplatok za dobrú hodnosť v diecéze."; }, ch: [
      { t: "Odmietnuť", st: "charizma", base: .95, okT: "Tvoja čestnosť sa rozšírila.", noT: "Nik si toho nevšimol.", ok: { merit: 10, fac: ["cir", 3] }, no: { merit: 2 } },
      { t: "Prijať úplatok", st: "retorika", base: .6, okT: "Hodnosť sa zrýchlila, ale ticho.", noT: "Aféra sa prezradila. Škandál.", ok: { merit: 30, money: -300 }, no: { merit: -22, fac: ["cir", -10], rf: -3 } },
      { t: "Udať ho biskupovi", st: "retorika", base: .8, okT: "Biskup ťa odmenil.", noT: "Obchodník sa vyhrážal pomstou.", ok: { merit: 14, fac: ["cir", 4] }, no: { merit: 2 } } ] }
  ];

  function chance(c, who, kind) {
    var b = c.base;
    if (kind === "mil") b += (who.skills[c.st] || 1) * .025 + (who.mil.eq || 0) * .04;
    else b += ((who.skills || {})[c.st] || 1) * .025;
    return Math.max(.08, Math.min(.95, b));
  }
  function misModal(kind, who, m) {
    var t = tier(), p = P();
    var nm = who.name, ch = m.ch.map(function (c, i) {
      var pc = Math.round(chance(c, who, kind) * 100), cost = (c.cost || 0) * t;
      return { t: c.t + (cost ? " · " + zl(cost) : "") + " (~" + pc + " %)", a: "misPick", d: { k: kind, w: who.id, m: m.id, i: i }, pri: i === 0 };
    });
    return {
      title: m.t, wide: 1,
      html: (kind === "mil" ? cPor(who) : clPor(who)) + "<p>" + H(m.txt(nm)) + "</p><p class=\"muted\">" + (kind === "mil" ? MRANK[who.mil.rank | 0] + ", zásluhy " + Math.round(who.mil.merit || 0) : rankN(who) + ", zásluhy " + Math.round(who.merit || 0)) + ".</p>",
      btns: ch
    };
  }
  A.misPick = function (e) {
    var p = P(), t = tier(), kind = e.k, list = kind === "mil" ? MIL : CLR, m = list.filter(function (x) { return x.id === e.m; })[0];
    if (!m) return;
    var c = m.ch[+e.i];
    var who = kind === "mil" ? p.kids.filter(function (x) { return x.id == e.w && x.mil && !x.mil.out; })[0] : clergy().filter(function (x) { return x.id == e.w; })[0];
    if (!who || !c) return;
    var cost = (c.cost || 0) * t;
    if (cost && p.money < cost) { msgNow("Nemáš dosť peňazí.", "bad"); return queue(misModal(kind, who, m)); }
    if (cost) { p.money -= cost; led(p, kind === "mil" ? "vojsko" : "cirkev", -cost); }
    var ok = Math.random() < chance(c, who, kind), ef = ok ? c.ok : c.no, txt = ok ? c.okT : c.noT, extra = [];
    var key = kind === "mil" ? who.mil : who;
    key.merit = Math.max(0, (key.merit || 0) + (ef.merit || 0));
    if (ef.merit) extra.push("zásluhy " + (ef.merit > 0 ? "+" : "") + ef.merit);
    if (ef.money) { p.money += ef.money; led(p, kind === "mil" ? "vojsko" : "cirkev", ef.money); extra.push((ef.money > 0 ? "+" : "") + zl(ef.money)); }
    if (ef.rf) { p_rf(ef.rf); extra.push("priazeň kráľa " + (ef.rf > 0 ? "+" : "") + ef.rf); }
    if (ef.fac) { facAdj(ef.fac[0], ef.fac[1]); extra.push(FACT[ef.fac[0]].n + " " + (ef.fac[1] > 0 ? "+" : "") + ef.fac[1]); }
    if (ef.sk) { var sk = kind === "mil" ? who.skills : who.skills; sk[ef.sk] = Math.min(10, (sk[ef.sk] || 1) + 1); extra.push("zručnosť +1"); }
    var died = false;
    if (ef.hurt && kind === "mil") { who.mil.hurt = S.year; extra.push("zranený"); }
    if (ef.die && Math.random() < ef.die * (kind === "mil" ? Math.max(.4, 1 - (who.mil.eq || 0) * .2) : 1)) {
      died = true;
      if (kind === "mil") { try { milDeath(who, "pri misii „" + m.t + "“"); } catch (er) { } }
      else { who.alive = false; who.dd = S.year; chron((who.g === "f" ? "Zomrela " : "Zomrel ") + rankN(who).toLowerCase() + " " + who.name + " z rodu " + p.name + " pri misii „" + m.t + "“.", "smrt", "bad"); }
    }
    chron((kind === "mil" ? "Vojak " : "Duchovný ") + who.name + " z rodu " + p.name + ": " + m.t + ". " + txt, kind === "mil" ? "vojna" : "cirkev", ok ? "good" : "bad");
    queue({ title: ok ? "Úspech" : "Neúspech", html: "<p>" + H(txt) + "</p>" + (died ? "<p><b>" + H(who.name) + " pri tom zahynul" + (who.g === "f" ? "a" : "") + ".</b></p>" : "") + (extra.length ? "<p class=\"muted\">" + extra.map(H).join(" · ") + "</p>" : ""), btns: [{ t: "Pokračovať", a: "mclose", pri: 1 }] });
    render();
  };

  function misYear() {
    var p = P();
    var ms = [];
    try { ms = p.kids.filter(function (k) { return k.mil && !k.mil.out && k.mil.hurt !== S.year; }); } catch (e) { }
    if (ms.length && Math.random() < .55) S.pend.push(misModal("mil", ms[Math.floor(Math.random() * ms.length)], MIL[Math.floor(Math.random() * MIL.length)]));
    var cl = [];
    try { cl = clergy().filter(function (c) { return c.rank < 7; }); } catch (e) { }
    if (cl.length && Math.random() < .55) S.pend.push(misModal("cler", cl[Math.floor(Math.random() * cl.length)], CLR[Math.floor(Math.random() * CLR.length)]));
  }

  var oY = yearEnd;
  yearEnd = function () {
    oY();
    try {
      if (S.over) return;
      var po = pol();
      announce();
      /* koalícia: ročný pokrok */
      if (po.coal && po.coal.until > S.year) facAdj(po.coal.k, 3); else if (po.coal) po.coal = null;
      /* špitál */
      if (po.hosp > S.year) { var p = P(); [p.head, p.spouse].filter(Boolean).forEach(function (x) { x.health = Math.min(100, (x.health || 0) + 8); }); }
      misYear();
    } catch (e) { console.warn(e); }
  };
})();

;
