// Automatická kontrola sekcií hry. Spustenie: otvor hru s adresou  index.html?kontrola
// Prejde všetky sekcie a podsekcie a nakoniec 3D mesto (vynechá ho  ?kontrola&bez3d ). Pre každú sekciu overí:
//  - že pri vykreslení nevznikla chyba,
//  - že každé klikacie miesto v scéne je naozaj na vrchu (kliknutie myšou ho zasiahne),
//  - že pergamenový panel je celý v okne a neprekrýva ho lišta ani iné ovládanie,
//  - že obsah panelu nepretŕča do strán.
// Uloženú hru nemení: na konci vráti pôvodnú sekciu aj všetky záznamy v localStorage.
// Autor: Dávid Mucha.
(function () {
  "use strict";
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const VIEWS = [
    ["mesto"], ["dielne"],
    ["trh"], ["trh", { ttab: "kar" }], ["trh", { ttab: "kraj" }], ["trh", { ttab: "cen" }],
    ["rod"], ["rod", { rodSec: "rodina" }], ["rod", { rodSec: "sidlo" }], ["rod", { rodSec: "postup" }],
    ["rod", { rodSec: "rodokmen" }], ["rod", { rodSec: "sluzby" }], ["rod", { rodSec: "predkovia" }],
    ["kronika"], ["svet"], ["radnica"], ["majetok"], ["stat"], ["rody"], ["kariera"], ["dvor"], ["cirkev"]
  ];
  const UI = ".hbrail,.hbbox,.hbbot,header.top";
  const area = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const name = el => el ? (el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "")) : "nič";
  const shown = el => { if (!el.isConnected) return false; const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; const cs = getComputedStyle(el); return cs.visibility !== "hidden" && cs.display !== "none"; };

  // prvok je orezaný niektorým predkom v paneli (overflow) alebo je vnútri obrázka SVG – nepretŕča
  const clipped = (el, stop) => { if (el.ownerSVGElement) return true; for (let p = el.parentElement; p && p !== stop; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.overflowX !== "visible" || cs.overflowY !== "visible") return true; } return false; };
  async function run() {
    for (let i = 0; i < 1200 && !(typeof S !== "undefined" && S && S.dyn && typeof render === "function"); i++) await wait(100);
    if (typeof S === "undefined" || !S || !S.dyn) { show([{ sekcia: "–", stav: "chyba", nalez: "Hra sa do 2 minút nespustila. Pokračuj v uloženej hre alebo založ rod a obnov stránku." }]); return; }
    // počkať, kým zmizne clona načítania
    for (let i = 0; i < 300 && [...document.querySelectorAll(".boot-veil,#boot")].some(shown); i++) await wait(100);
    const ls = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); ls[k] = localStorage.getItem(k); } } catch (e) { }
    const keep = { view: S.view, ttab: S.ttab, rodSec: S.rodSec };
    const errs = [];
    const onErr = e => errs.push(String(e.message || e.reason || e));
    addEventListener("error", onErr); addEventListener("unhandledrejection", onErr);
    const ce = console.error, cw = console.warn;
    console.error = function () { errs.push([...arguments].map(String).join(" ")); return ce.apply(this, arguments); };
    console.warn = function () { if ([...arguments].some(a => a instanceof Error)) errs.push([...arguments].map(String).join(" ")); return cw.apply(this, arguments); };
    const rows = [];
    try {
      for (const [view, extra] of VIEWS) {
        const label = view + (extra ? ":" + Object.values(extra)[0] : "");
        errs.length = 0;
        try { S.view = view; S.ttab = extra && extra.ttab || ""; S.rodSec = extra && extra.rodSec || ""; render(); }
        catch (e) { errs.push(String(e)); }
        await wait(1000); // scéna sa pripája cez setTimeout, panel sa rozširuje 0,35 s a kamera sa dolaďuje po 0,42 s
        const found = [];
        for (const m of errs) found.push("chyba: " + m.slice(0, 160));
        // klikacie miesta v scéne
        let hots = 0, under = 0;
        for (const h of document.querySelectorAll("#dscene .khot")) {
          if (!shown(h)) continue; const r = h.getBoundingClientRect();
          const x = r.left + r.width / 2, y = r.top + r.height / 2;
          if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
          hots++; const top = document.elementFromPoint(x, y);
          if (top === h || h.contains(top)) continue;
          // pod panelom alebo ovládaním je miesto aj zakryté očiam – to nevadí
          if (top && top.closest("#dside," + UI)) { under++; continue; }
          found.push(`klikacie miesto „${h.title || h.getAttribute("aria-label") || "?"}“ zakrýva ${name(top)}`);
        }
        // pergamenový panel
        const sd = document.getElementById("dside");
        if (sd && shown(sd)) {
          const r = sd.getBoundingClientRect();
          if (r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) found.push(`panel presahuje okno (${Math.round(r.left)},${Math.round(r.top)}–${Math.round(r.right)},${Math.round(r.bottom)})`);
          for (const u of document.querySelectorAll(UI)) { if (!shown(u) || sd.contains(u)) continue; const a = area(r, u.getBoundingClientRect()); if (a > 400) found.push(`panel prekrýva ${name(u)} (${Math.round(a)} px²)`); }
          for (const el of sd.querySelectorAll("*")) {
            if (!shown(el) || clipped(el, sd)) continue; const er = el.getBoundingClientRect();
            if (er.right > r.right + 4 || er.left < r.left - 4) { found.push(`v paneli pretŕča ${name(el)} (${Math.round(er.left)}–${Math.round(er.right)} pri paneli ${Math.round(r.left)}–${Math.round(r.right)})`); break; }
          }
        }
        rows.push({ sekcia: label, stav: found.length ? (found.some(f => f.startsWith("chyba")) ? "chyba" : "pozor") : "v poriadku", klikacich: hots, podPanelom: under, nalez: found.join(" · ") });
      }
      if (typeof A !== "undefined" && typeof A.m3d === "function" && !/[?&]bez3d\b/.test(location.search)) { S.view = "mesto"; render(); await wait(600); for (const r of await check3d(errs)) rows.push(r); }
    } finally {
      console.error = ce; console.warn = cw; removeEventListener("error", onErr); removeEventListener("unhandledrejection", onErr);
      try { S.view = keep.view; S.ttab = keep.ttab; S.rodSec = keep.rodSec; render(); } catch (e) { }
      await wait(300);
      try { for (const k in ls) localStorage.setItem(k, ls[k]); } catch (e) { }
    }
    show(rows);
  }

  // 3D mesto: otvorí ho, a overí stavbu, budovy z mapy, prekrývanie, dostupnosť miest, panely rozhovorov a pohľad z výšky
  async function check3d(errs) {
    const out = [], row = (sekcia, found, extra) => out.push(Object.assign({ sekcia, stav: found.length ? (found.some(f => f.startsWith("chyba")) ? "chyba" : "pozor") : "v poriadku", nalez: found.join(" · ") }, extra || {}));
    errs.length = 0; window.__m3 = null;
    try { A.m3d(); } catch (e) { errs.push(String(e)); }
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
    try { M.close(); } catch (e) { } window.__m3 = null; await wait(300);
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
    box.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><h2 style="margin:0">Kontrola sekcií – ${bad ? bad + " s nálezom" : "všetko v poriadku"}</h2><button type="button" style="font:inherit;padding:4px 12px">Zavrieť</button></div>
<p style="margin:6px 0 10px">Okno ${innerWidth}×${innerHeight}. Pre kontrolu inej veľkosti zmeň veľkosť okna a obnov stránku.</p>
<table style="width:100%;border-collapse:collapse">${["<tr><th align=left>Sekcia</th><th align=left>Stav</th><th>Klikacích miest</th><th>z toho pod panelom</th><th align=left>Nález</th></tr>", ...rows.map(r => `<tr style="border-top:1px solid #c9b48a;background:${r.stav === "chyba" ? "#f3c9c0" : r.stav === "pozor" ? "#f6e3a8" : "transparent"}"><td>${esc(r.sekcia)}</td><td>${esc(r.stav)}</td><td align=center>${r.klikacich ?? ""}</td><td align=center>${r.podPanelom ?? ""}</td><td>${esc(r.nalez || "")}</td></tr>`)].join("")}</table>`;
    box.querySelector("button").onclick = () => box.remove();
    document.body.appendChild(box);
  }

  window.KONTROLA = run;
  if (/[?&]kontrola\b/.test(location.search)) run();
})();
