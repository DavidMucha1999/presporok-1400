// Automatická kontrola hry v 3D. Spustenie: otvor hru s adresou  index.html?kontrola  (s uloženou hrou)
// Prejde všetky záložky knihy rodu a ich podsekcie, ponuku (Esc), lištu a návod, a nakoniec 3D mesto (vynechá ho  ?kontrola&bez3d ).
// Pre každú záložku overí:
//  - že pri otvorení nevznikla chyba a kniha sa naozaj otvorila,
//  - že pergamenová stránka je celá v okne a neprekrývajú ju záložky dole,
//  - že obsah stránky nepretŕča do strán.
// Uloženú hru nemení: na konci zavrie knihu, vráti pôvodnú sekciu aj všetky záznamy v localStorage.
// Autor: Dávid Mucha.
(function () {
  "use strict";
  const wait = ms => new Promise(r => setTimeout(r, ms));
  // [záložka knihy, podsekcia, zamknutá do roku 1405 / titulu]
  const BOOK = [
    ["mesto"], ["dielne"],
    ["trh"], ["trh", { ttab: "kar" }], ["trh", { ttab: "kraj" }], ["trh", { ttab: "cen" }],
    ["rod"], ["rod", { rodSec: "rodina" }], ["rod", { rodSec: "sidlo" }], ["rod", { rodSec: "postup" }],
    ["rod", { rodSec: "rodokmen" }], ["rod", { rodSec: "sluzby" }], ["rod", { rodSec: "predkovia" }],
    ["dennik"],
    ["svet", null, 1], ["radnica", null, 1], ["majetok", null, 1], ["stat", null, 1], ["rody", null, 1], ["kariera", null, 1], ["dvor", null, 1], ["cirkev", null, 1]
  ];
  const area = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const name = el => el ? (el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "")) : "nič";
  const shown = el => { if (!el.isConnected) return false; const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; const cs = getComputedStyle(el); return cs.visibility !== "hidden" && cs.display !== "none"; };

  // prvok je orezaný niektorým predkom v paneli (overflow) alebo je vnútri obrázka SVG – nepretŕča
  const clipped = (el, stop) => { if (el.ownerSVGElement) return true; for (let p = el.parentElement; p && p !== stop; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.overflowX !== "visible" || cs.overflowY !== "visible") return true; } return false; };
  const stav = found => found.length ? (found.some(f => f.startsWith("chyba")) ? "chyba" : "pozor") : "v poriadku";
  // stránka knihy: celá v okne, záložky dole ju neprekrývajú, obsah nepretŕča
  function page(found) {
    const pg = document.body.classList.contains("p3d-book2") ? document.getElementById("app") : document.getElementById("dside");
    if (!pg || !shown(pg)) { found.push("chyba: kniha sa neotvorila"); return; }
    const r = pg.getBoundingClientRect();
    if (r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) found.push(`stránka presahuje okno (${Math.round(r.left)},${Math.round(r.top)}–${Math.round(r.right)},${Math.round(r.bottom)})`);
    for (const u of document.querySelectorAll("#m3d .m3top>*")) { if (!shown(u)) continue; const a = area(r, u.getBoundingClientRect()); if (a > 60) { found.push(`stránka prekrýva lištu (${name(u)}, ${Math.round(a)} px²)`); break; } }
    if (r.width > innerWidth * .62) found.push("stránka zakrýva skoro celé mesto");
    for (const el of pg.querySelectorAll("*")) {
      if (!shown(el) || clipped(el, pg)) continue; const er = el.getBoundingClientRect();
      if (er.right > r.right + 4 || er.left < r.left - 4) { found.push(`v knihe pretŕča ${name(el)} (${Math.round(er.left)}–${Math.round(er.right)} pri stránke ${Math.round(r.left)}–${Math.round(r.right)})`); break; }
    }
  }
  async function run() {
    for (let i = 0; i < 1200 && !(typeof S !== "undefined" && S && S.dyn && typeof render === "function" && document.querySelector("#m3d canvas")); i++) await wait(100);
    if (typeof S === "undefined" || !S || !S.dyn || S.__demo) { show([{ sekcia: "–", stav: "chyba", nalez: "Nie je načítaná uložená hra. Pokračuj v uloženej hre alebo založ rod a obnov stránku s ?kontrola." }]); return; }
    for (let i = 0; i < 300 && [...document.querySelectorAll("#p3dload,#boot")].some(shown); i++) await wait(100);
    await wait(1500);
    const ls = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); ls[k] = localStorage.getItem(k); } } catch (e) { }
    const keep = { view: S.view, ttab: S.ttab, rodSec: S.rodSec, tut3: S.tut3, guideOff: S.guideOff };
    const errs = [];
    const onErr = e => errs.push(String(e.message || e.reason || e));
    addEventListener("error", onErr); addEventListener("unhandledrejection", onErr);
    const ce = console.error, cw = console.warn;
    console.error = function () { errs.push([...arguments].map(String).join(" ")); return ce.apply(this, arguments); };
    console.warn = function () { if ([...arguments].some(a => a instanceof Error)) errs.push([...arguments].map(String).join(" ")); return cw.apply(this, arguments); };
    const rows = []; window.__kontrola = 1;
    const wo = (() => { try { if (S.rpg) return (S.rpg.rank | 0) >= 4; return S.year >= 1405 || ((P() || {}).title || 0) >= 2; } catch (e) { return true; } })();
    try {
      // 1) lišta 3D mesta a návod
      { const f = [], top = document.querySelector("#m3d .m3top");
        for (const [a, t] of [["p3dReg", "Kniha miest"], ["gameMenu", "Ponuka"]]) { const b = document.querySelector(`#m3d [data-a="${a}"]`); if (!b || !shown(b)) f.push(`na lište chýba tlačidlo ${t}`); }
        if (S.rpg) { rows.push({ sekcia: "3D: lišta", stav: stav(f), klikacich: document.querySelectorAll("#m3d .m3top button").length, nalez: f.join(" · ") }); } else {
        S.tut3 = 0; S.guideOff = 0; await wait(700);
        const co = document.getElementById("p3dcoach");
        if (!co || !shown(co)) f.push("návod sa neukázal");
        else { const r = co.getBoundingClientRect(); if (r.left < 0 || r.right > innerWidth || r.top < 0) f.push("návod presahuje okno");
          for (const u of document.querySelectorAll("#m3d .m3top>*,#m3d .m3nav>*")) { if (!shown(u)) continue; const a = area(r, u.getBoundingClientRect()); if (a > 200) { f.push(`návod prekrýva ${name(u)} (${Math.round(a)} px²)`); break; } } }
        S.tut3 = 5; await wait(700);
        if (S.year < (S.startY || 1400) + 4 && typeof window.guideSteps === "function" && window.guideSteps().some(x => !x[1]) && !(document.getElementById("p3dcoach"))) f.push("po návode sa neukázali Prvé kroky rodu");
        S.tut3 = keep.tut3; S.guideOff = keep.guideOff;
        rows.push({ sekcia: "3D: lišta a návod", stav: stav(f), klikacich: document.querySelectorAll("#m3d .m3top button").length, nalez: f.join(" · ") }); } }
      // 1b) kniha miest (B) a tabule v meste
      { const f = []; errs.length = 0; try { A.p3dReg(); } catch (e) { errs.push(String(e)); } await wait(300);
        const rg = document.getElementById("p3dreg");
        if (!rg || !shown(rg)) f.push("chyba: kniha miest sa neotvorila");
        else { const r = rg.getBoundingClientRect(); if (r.top < -1 || r.bottom > innerHeight + 1 || r.right > innerWidth + 1) f.push("kniha miest presahuje okno");
          if (S.rpg) { for (const t of ["Denník postavy", "Hlad", "Únava", "Kam ísť"]) if (!rg.textContent.includes(t)) f.push(`v denníku postavy chýba „${t}“`); }
          else for (const v of ["dielne", "trh", "rod", "mesto"]) if (!rg.querySelector(`[data-r="${v}"]`)) f.push(`v knihe miest chýba ${v}`); }
        try { A.p3dReg(); } catch (e) { } await wait(200); if (document.getElementById("p3dreg")) f.push("kniha miest sa nezavrela");
        let nb = 0; try { nb = window.__m3.chk().inter.filter(it => it.kind === "board").length; } catch (e) { } if (nb < 1) f.push("v meste nie je žiadna tabuľa");
        errs.forEach(m => f.push("chyba: " + m.slice(0, 160)));
        rows.push({ sekcia: "3D: kniha miest a tabule", stav: stav(f), klikacich: nb, nalez: f.join(" · ") }); }
      // 1c) RPG: pracoviská, miesta v meste a návod
      if (S.rpg && window.RPG && RPG.jobs) { const f = [], M = window.__m3; await wait(1200);
        for (const [v, n] of [["pole", "pole s gazdom"], ["vino", "vinohrad"], ["ryby", "rybár"], ["nosic", "kupec s vozom"], ["sennik", "senník"], ["jedlo", "pekárka"], ["nocl", "nocľaháreň"], ["pisar", "mestský pisár"], ["dielna", "dielňa rodu"]]) { let p = null; try { p = M.placeOf(v); } catch (e) { } if (!p) f.push(`v meste chýba ${n}`); }
        for (const key of ["pole", "vino"]) { const n = RPG.jobs.cl(key).length; if (n && n !== 12) f.push(`${key}: ${n} miest namiesto 12`); }
        const t0 = S.rpg.tut, g0 = S.rpg.goalOff; S.rpg.tut = 0; await wait(900); const rc = document.getElementById("rpgcoach");
        if (!rc || !shown(rc)) f.push("návod RPG sa neukázal"); else { const r = rc.getBoundingClientRect(); for (const el of document.querySelectorAll("#m3d .m3top>*,#m3d .m3nav>*")) { if (!shown(el)) continue; const ar = area(r, el.getBoundingClientRect()); if (ar > 200) { f.push(`návod RPG prekrýva ${name(el)} (${Math.round(ar)} px²)`); break; } } }
        S.rpg.tut = 5; S.rpg.goalOff = 0; await wait(900); if (RPG.next && RPG.next() && !document.getElementById("rpgcoach")) f.push("po návode sa neukázal ďalší cieľ");
        S.rpg.tut = t0; S.rpg.goalOff = g0;
        rows.push({ sekcia: "RPG: pracoviská, miesta a návod", stav: stav(f), klikacich: M.interA ? M.interA().filter(it => it.kind === "job").length : 0, nalez: f.join(" · ") }); }
      // 2) ponuka (Esc)
      { const f = []; errs.length = 0; try { A.gameMenu(); } catch (e) { errs.push(String(e)); } await wait(400);
        const md = document.getElementById("modal");
        if (!md || md.hidden) f.push("chyba: ponuka sa neotvorila");
        else { for (const t of ["Pokračovať", "Uložiť hru", "Uložené hry", "Nastavenia", "hlavného menu"]) if (!md.textContent.includes(t)) f.push(`v ponuke chýba „${t}“`);
          if (/2D/.test(md.textContent)) f.push("ponuka ešte ponúka 2D");
          const bx = md.querySelector(".mbox"); if (bx) { const r = bx.getBoundingClientRect(); if (r.top < -1 || r.bottom > innerHeight + 1) f.push("ponuka presahuje okno"); } }
        errs.forEach(m => f.push("chyba: " + m.slice(0, 160)));
        try { closeModal(true); } catch (e) { } await wait(300);
        rows.push({ sekcia: "3D: ponuka (Esc)", stav: stav(f), klikacich: md ? md.querySelectorAll("button").length : 0, nalez: f.join(" · ") }); }
      // 3) kniha rodu: každá záložka a podsekcia
      for (const [view, extra, gated] of BOOK) {
        const label = "kniha: " + view + (extra ? ":" + Object.values(extra)[0] : "");
        if (S.rpg && view === "svet") { rows.push({ sekcia: label, stav: "v poriadku", klikacich: 0, nalez: "v RPG sa hrá len v Prešporku (stránka sa nepoužíva)" }); continue; }
        if (gated && !wo) { rows.push({ sekcia: label, stav: "v poriadku", klikacich: 0, nalez: "zamknuté (v RPG do meštianskeho práva, inak do roku 1405 alebo titulu)" }); continue; }
        errs.length = 0; const found = [];
        try { A.p3dBook(view); await wait(150); if (extra) { S.ttab = extra.ttab || ""; S.rodSec = extra.rodSec || ""; render(); } } catch (e) { errs.push(String(e)); }
        await wait(1000);
        for (const m of errs) found.push("chyba: " + m.slice(0, 160));
        if (!document.body.classList.contains("p3d-book")) found.push("chyba: kniha sa zavrela" + (document.querySelector(".toast") ? " (" + document.querySelector(".toast").textContent.slice(0, 80) + ")" : ""));
        else page(found);
        rows.push({ sekcia: label, stav: stav(found), klikacich: document.querySelectorAll("#dside button,#dside [data-a]").length, nalez: found.join(" · ") });
      }
      try { A.p3dBook("dielne"); await wait(300); A.p3dBook(null); } catch (e) { } await wait(400);
      if (document.body.classList.contains("p3d-book")) rows.push({ sekcia: "kniha: zavretie", stav: "pozor", nalez: "kniha sa nezavrela" });
      if (typeof A !== "undefined" && !/[?&]bez3d\b/.test(location.search)) { for (const r of await check3d(errs)) rows.push(r); }
    } finally {
      console.error = ce; console.warn = cw; window.__kontrola = 0; removeEventListener("error", onErr); removeEventListener("unhandledrejection", onErr);
      try { A.p3dBook(null); S.view = keep.view; S.ttab = keep.ttab; S.rodSec = keep.rodSec; S.tut3 = keep.tut3; S.guideOff = keep.guideOff; render(); } catch (e) { }
      await wait(300);
      try { for (const k in ls) localStorage.setItem(k, ls[k]); } catch (e) { }
    }
    show(rows);
  }

  // 3D mesto: otvorí ho, a overí stavbu, budovy z mapy, prekrývanie, dostupnosť miest, panely rozhovorov a pohľad z výšky
  async function check3d(errs) {
    const out = [], row = (sekcia, found, extra) => out.push(Object.assign({ sekcia, stav: found.length ? (found.some(f => f.startsWith("chyba")) ? "chyba" : "pozor") : "v poriadku", nalez: found.join(" · ") }, extra || {}));
    errs.length = 0; window.__m3 = null;
    try { if (window.__m3re && document.getElementById("m3d")) window.__m3re(); else A.m3d(); } catch (e) { errs.push(String(e)); }
    for (let i = 0; i < 250 && !(window.__m3 && window.__m3.chk); i++) await wait(100);
    const M = window.__m3;
    if (!M || !M.chk) { row("3D mesto: otvorenie", ["chyba: 3D mesto sa do 25 s neotvorilo" + (errs.length ? " (" + errs[0].slice(0, 120) + ")" : "")]); return out; }
    await wait(3500);
    let c; try { c = M.chk(); } catch (e) { row("3D mesto: otvorenie", ["chyba: " + String(e).slice(0, 160)]); return out; }
    // 1) stavba scény
    { const f = errs.map(m => "chyba: " + m.slice(0, 160)); const cv = document.querySelector("#m3d canvas"), r = cv && cv.getBoundingClientRect();
      if (!cv || r.width < 50 || r.height < 50) f.push("chyba: plátno 3D mesta nie je vidieť");
      let calls = 0; try { calls = M.ren().info.render.calls; } catch (e) { }
      const fe = document.querySelector("#m3d .m3fps"), fps = fe ? fe.textContent : "";
      if (!calls && !document.hidden) f.push("scéna sa nevykreslila (0 volaní)");
      row("3D mesto: stavba", f, { klikacich: c.inter.length }); if (fps) { const o = out[out.length - 1]; o.nalez = (o.nalez ? o.nalez + " · " : "") + fps; } }
    // 2) budovy z mapy a ich prekrývanie
    { const f = [], KS = ["pub", "mine", "home", "seat", "info", "lot"], lotI = c.inter.filter(it => KS.includes(it.kind) && !/^Sídlo: prestavať/.test(it.text));
      if (lotI.length < c.lots) f.push(`na mape je ${c.lots} pozemkov, v 3D má miesto len ${lotI.length}`);
      for (let i = 0; i < c.lotb.length; i++) for (let j = i + 1; j < c.lotb.length; j++) { const a = c.lotb[i], b = c.lotb[j], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (d < (a[2] + b[2]) * .8) f.push(`budovy na pozemkoch ${a[3]} a ${b[3]} sa prekrývajú (${d.toFixed(1)} m)`); }
      row("3D mesto: budovy z mapy", f, { klikacich: lotI.length }); }
    // 3) miesta, kam sa dá prísť
    { const f = [], seen = [];
      for (const it of c.inter) { if (!it.text) f.push(`miesto bez textu (${it.kind})`); for (const o of seen) if (o.text !== it.text && Math.hypot(o.x - it.x, o.z - it.z) < .6) f.push(`„${it.text}“ a „${o.text}“ stoja na tom istom mieste`); seen.push(it); }
      const st = c.solids.find(q => Math.hypot(q[0] - c.p[0], q[1] - c.p[1]) < q[2] * .6); if (st) f.push("hráč sa objaví vnútri prekážky");
      if (c.nav) { for (const it of c.inter) { if (!["pub", "mine", "home", "seat", "lot", "npc"].includes(it.kind) || !it.act) continue; let ok = null; try { ok = c.nav(c.p, [it.x, it.z]); } catch (e) { } if (!ok) f.push(`nedá sa prejsť k „${it.text}“`); } }
      else f.push("chýba sieť ciest pre chodcov");
      row("3D mesto: miesta a cesty", f.slice(0, 12).concat(f.length > 12 ? [`… a ďalších ${f.length - 12}`] : []), { klikacich: c.inter.filter(it => it.act).length }); }
    // 4) panely rozhovorov (objednávateľ, hlásnik, stánky, hlavy rodov)
    { const f = [], pn = document.querySelector("#m3d .m3panel"); let n = 0;
      const acts = M.chkActs ? M.chkActs() : [];
      for (const a of acts) { errs.length = 0; try { a.act(); } catch (e) { errs.push(String(e)); } await wait(150); n++;
        errs.forEach(m => f.push(`chyba v paneli „${a.text}“: ${m.slice(0, 120)}`));
        if (pn && shown(pn)) { const r = pn.getBoundingClientRect(); if (r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) f.push(`panel „${a.text}“ presahuje okno`);
          for (const el of pn.querySelectorAll("*")) { if (!shown(el) || clipped(el, pn)) continue; const er = el.getBoundingClientRect(); if (er.right > r.right + 4 || er.left < r.left - 4) { f.push(`v paneli „${a.text}“ pretŕča ${name(el)}`); break; } }
          const x = pn.querySelector("[data-m3=x]"); if (x) x.click(); } else f.push(`„${a.text}“ neotvorí panel`);
        await wait(80); }
      row("3D mesto: rozhovory a panely", f, { klikacich: n }); }
    // 5) pohľad z výšky
    { errs.length = 0; try { M.zoom(95, 1.0, true); } catch (e) { errs.push(String(e)); } await wait(1500); try { M.zoom(9, .32, false); } catch (e) { } await wait(300);
      row("3D mesto: pohľad z výšky", errs.map(m => "chyba: " + m.slice(0, 160))); }
    await wait(300);
    return out;
  }

  function show(rows) {
    window.KONTROLA_VYSLEDOK = rows;
    try { console.table(rows); } catch (e) { }
    const bad = rows.filter(r => r.stav !== "v poriadku").length;
    const box = document.createElement("div");
    box.id = "kontrola";
    box.style.cssText = "position:fixed;inset:40px 15%;z-index:99999;background:#f4ead2;color:#2a1a0a;border:3px solid #5a3a14;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.6);padding:16px 20px;overflow:auto;font:14px/1.4 Georgia,serif";
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    box.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><h2 style="margin:0">Kontrola hry v 3D – ${bad ? bad + " s nálezom" : "všetko v poriadku"}</h2><button type="button" style="font:inherit;padding:4px 12px">Zavrieť</button></div>
<p style="margin:6px 0 10px">Okno ${innerWidth}×${innerHeight}. Pre kontrolu inej veľkosti zmeň veľkosť okna a obnov stránku.</p>
<table style="width:100%;border-collapse:collapse">${["<tr><th align=left>Sekcia</th><th align=left>Stav</th><th>Klikacích miest</th><th>z toho pod panelom</th><th align=left>Nález</th></tr>", ...rows.map(r => `<tr style="border-top:1px solid #c9b48a;background:${r.stav === "chyba" ? "#f3c9c0" : r.stav === "pozor" ? "#f6e3a8" : "transparent"}"><td>${esc(r.sekcia)}</td><td>${esc(r.stav)}</td><td align=center>${r.klikacich ?? ""}</td><td align=center>${r.podPanelom ?? ""}</td><td>${esc(r.nalez || "")}</td></tr>`)].join("")}</table>`;
    box.querySelector("button").onclick = () => box.remove();
    document.body.appendChild(box);
  }

  window.KONTROLA = run;
  if (/[?&]kontrola\b/.test(location.search)) run();
})();
