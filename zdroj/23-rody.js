/* ==== js/rody.js ==== */
/* Prešporok 1400 – verné postavy rodov a sídla podľa úrovne a mesta. Autor: Dávid Mucha. */
(function () {
  "use strict";
  var INK = "#2b2117", UID = 0;
  var cl = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  function hx(c) { var m = /^#([0-9a-f]{6})$/i.exec(c || ""); if (!m) { m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(c || ""); if (!m) return null; return [parseInt(m[1] + m[1], 16), parseInt(m[2] + m[2], 16), parseInt(m[3] + m[3], 16)]; } var n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function mix(a, b, t) { var A = hx(a), B = hx(b); if (!A || !B) return a; return "rgb(" + A.map(function (v, i) { return Math.round(v + (B[i] - v) * t); }).join(",") + ")"; }
  function hash(s) { s = String(s || ""); var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function esc2(t) { try { return esc(t); } catch (e) { return String(t).replace(/[<>&"]/g, ""); } }
  function dcol(id) { try { return DC(id) || "#7a1f18"; } catch (e) { return "#7a1f18"; } }
  function shG(id, x, y, s) { try { return shieldG(id, x, y, s); } catch (e) { return ""; } }
  function widow(d) { try { return !!(d && !d.spouse && (d.tree || []).some(function (r) { return r && r.dd && r.role === "spouse"; })); } catch (e) { return false; } }
  function favW(f) { f = f | 0; return f >= 40 ? "dar" : f >= 15 ? "pohár" : f < 0 ? "okenica" : ""; }
  function phase() { try { return todPh(); } catch (e) { return 1; } }
  function weather() { try { return wxOf(); } catch (e) { return "jasno"; } }

  /* ============ POSTAVA ============ */
  function fig(o) {
    var L = o.look || {}, age = o.age == null ? 30 : (o.age | 0), fem = !!o.fem, kid = age < 16, old = age >= 62;
    var skin = SKIN[L.skin] || SKIN[1], skinD = mix(skin, "#000000", .16);
    var hair = HAIRC[L.hc == null ? 1 : L.hc] || HAIRC[1];
    if (age >= 60) hair = HAIRC[6]; else if (age >= 48) hair = mix(hair, "#cfc8bc", .4);
    var eye = EYEC[L.eyes] || EYEC[0];
    var B = OUT[o.body] || OUT.b0, dc = o.dc || "#7a1f18";
    var mourn = !!o.mourn;
    var robe = mourn ? "#25211e" : (B.col === "dyn" ? dc : B.col);
    var rd = mix(robe, "#000000", .25);
    var ob = o.body || "b0";
    var longG = !fem && /^b(3|8|4|5|9)$/.test(ob);
    var rich = /^b(5|9)$/.test(ob);
    var uid = "ry" + (++UID), ph = o.ph || 0;
    var hs = kid ? 1 + (16 - age) * .018 : 1;
    var s = "";
    s += '<ellipse cx="0" cy="1" rx="' + (fem ? 19 : 16) + '" ry="4.2" fill="rgba(40,25,10,.3)"/>';
    s += '<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -.9;0 0" dur="' + (3 + ph % 3 * .4).toFixed(1) + 's" begin="-' + (ph % 5) + 's" repeatCount="indefinite"/>';
    /* plášť za postavou */
    if (!mourn && /^b(3|8|5|9)$/.test(ob)) s += '<path d="M-14 -68Q-25 -30 -23 -2L23 -2Q25 -30 14 -68Z" fill="' + (rich ? "#8e1424" : rd) + '" stroke="' + INK + '" stroke-width=".8"/>';
    /* nohy */
    if (!fem && !longG) {
      var h1 = ob === "b0" ? "#6a5a46" : mix(dc, "#000000", .45), h2 = (ob === "b4" || ob === "b8") ? mix(dc, "#ffffff", .5) : h1;
      s += '<path d="M-7 -26V-5" stroke="' + h1 + '" stroke-width="7"/><path d="M7 -26V-5" stroke="' + h2 + '" stroke-width="7"/>';
    }
    s += '<ellipse cx="-7.5" cy="-1" rx="6.5" ry="3" fill="#2a1d14" stroke="' + INK + '" stroke-width=".6"/><ellipse cx="7.5" cy="-1" rx="6.5" ry="3" fill="#2a1d14" stroke="' + INK + '" stroke-width=".6"/>';
    /* telo */
    var body, hemY;
    if (fem) { body = "M-10 -67Q-13 -45 -20 -3L20 -3Q13 -45 10 -67Q0 -71 -10 -67Z"; hemY = -5; }
    else if (longG) { body = "M-12 -67Q-16 -40 -18 -8L18 -8Q16 -40 12 -67Q0 -71 -12 -67Z"; hemY = -9; }
    else { body = "M-12 -67Q-15 -50 -14 -24L14 -24Q15 -50 12 -67Q0 -71 -12 -67Z"; hemY = -25; }
    s += '<clipPath id="' + uid + '"><rect x="0" y="-80" width="30" height="82"/></clipPath>';
    s += '<path d="' + body + '" fill="' + robe + '" stroke="' + INK + '" stroke-width="1"/><path d="' + body + '" fill="rgba(0,0,0,.16)" clip-path="url(#' + uid + ')"/>';
    if (fem && (ob === "b0" || ob === "b1")) s += '<path d="M-11 -42L-13 -4L13 -4L11 -42Z" fill="#efe8d6" opacity=".92" stroke="' + INK + '" stroke-width=".5"/>';
    if (!mourn) {
      var trim = B.trim || (/^b(4|9|8)$/.test(ob) ? "#e3be4f" : rich ? "#f6f2ea" : (o.tier >= 2 ? mix(robe, "#ffffff", .35) : ""));
      if (trim) s += '<path d="M' + (fem ? -19 : longG ? -17.5 : -14) + " " + hemY + "H" + (fem ? 19 : longG ? 17.5 : 14) + '" stroke="' + trim + '" stroke-width="3"/>';
    }
    /* opasok */
    s += '<path d="M' + (fem ? -11 : -13.5) + " " + (fem ? -45 : -43) + "H" + (fem ? 11 : 13.5) + '" stroke="#4a2f1a" stroke-width="4"/>';
    if (!mourn && o.tier >= 1) s += '<rect x="-2.6" y="' + (fem ? -47 : -45) + '" width="5.2" height="4" fill="#e3be4f" stroke="' + INK + '" stroke-width=".4"/>';
    if (!fem && !kid && !mourn) s += '<rect x="9" y="-42" width="6" height="8" rx="1.5" fill="#6b4423" stroke="' + INK + '" stroke-width=".5"/>';
    /* golier */
    if (!mourn) {
      if (B.collar) s += '<path d="M-8 -68Q0 -61 8 -68L6 -63Q0 -58 -6 -63Z" fill="' + B.collar + '" stroke="' + INK + '" stroke-width=".6"/>';
      if (/^b(3|7|5|9)$/.test(ob)) s += '<path d="M-13 -67Q0 -57 13 -67Q14 -62 8 -60Q0 -54 -8 -60Q-14 -62 -13 -67Z" fill="' + (rich ? "#f6f2ea" : "#7a5434") + '" stroke="' + INK + '" stroke-width=".6"/>' + (rich ? '<path d="M-8 -62v2M-3 -59v2M3 -59v2M8 -62v2" stroke="#111" stroke-width="1.4"/>' : "");
      if (ob === "b7") s += shG(o.d, -6, -64, .6);
      if (ob === "b4") s += '<path d="M-6 -62l6 8 6 -8M-8 -48l8 8 8 -8" stroke="#e3be4f" stroke-width="1" fill="none"/>';
    }
    /* šperky */
    var J = o.jewel || "j0";
    if (!mourn) {
      if (J === "j1") s += '<path d="M-8 -66Q0 -55 8 -66" stroke="#cfd3d8" stroke-width="1.5" fill="none"/>';
      if (J === "j4") s += '<circle cx="-6" cy="-58" r="2.6" fill="#c8302a" stroke="#e3be4f" stroke-width="1"/>';
      if (J === "j2") s += '<path d="M-9 -66Q0 -52 9 -66" stroke="#e3be4f" stroke-width="2" fill="none"/><circle cx="0" cy="-54.5" r="3.2" fill="#e3be4f" stroke="' + INK + '" stroke-width=".5"/>';
      if (J === "j5") s += '<path d="M-9 -66Q0 -52 9 -66" stroke="#e3be4f" stroke-width="1.6" fill="none"/><path d="M0 -58v9M-3.5 -54.5h7" stroke="#c8302a" stroke-width="2.2"/>';
      if (J === "j3") s += '<path d="M-9 -66Q0 -53 9 -66" stroke="#f6f2ea" stroke-width="2.2" stroke-dasharray="1.8 1.2" fill="none"/><circle cx="0" cy="-54" r="2.4" fill="#3a6fb0" stroke="#e3be4f" stroke-width=".8"/>';
      if (J === "j6") s += '<path d="M-11 -67Q0 -52 11 -67" stroke="#e3be4f" stroke-width="4.5" fill="none"/><path d="M-9 -63Q0 -52 9 -63" stroke="#c8302a" stroke-width="1.3" stroke-dasharray="1.5 3" fill="none"/>';
    }
    /* ruky */
    var sw = (ob === "b8" || ob === "b4") ? 9 : 7;
    s += '<path d="M-11 -64Q-17 -52 -17 -39" stroke="' + robe + '" stroke-width="' + sw + '" fill="none" stroke-linecap="round"/><path d="M11 -64Q17 -52 17 -39" stroke="' + robe + '" stroke-width="' + sw + '" fill="none" stroke-linecap="round"/>';
    if (!mourn && o.tier >= 2) s += '<path d="M-17 -39h0M17 -39h0" stroke="#e3be4f" stroke-width="' + (sw + 1) + '" stroke-linecap="butt" stroke-dasharray="0 0"/>';
    /* predmet v ruke */
    var tl = o.tool || "";
    if (tl === "kovac") s += '<path d="M17 -38L24 -56" stroke="#5a3a20" stroke-width="2.6"/><rect x="19" y="-62" width="11" height="6" fill="#4a4a50" stroke="' + INK + '" stroke-width=".6" transform="rotate(25 24 -59)"/>';
    else if (tl === "pekar") s += '<ellipse cx="22" cy="-41" rx="8" ry="4.2" fill="#e4b56a" stroke="' + INK + '" stroke-width=".7"/><path d="M17 -42q3 -3 6 0M21 -43q3 -3 6 0" stroke="#b9852a" stroke-width=".8" fill="none"/>';
    else if (tl === "krcma") s += '<rect x="17" y="-50" width="8" height="11" rx="1.5" fill="#b88a3a" stroke="' + INK + '" stroke-width=".7"/><ellipse cx="21" cy="-50" rx="4.6" ry="2" fill="#f7f0d8" stroke="' + INK + '" stroke-width=".5"/>';
    else if (tl === "tkac") s += '<rect x="15" y="-50" width="16" height="9" rx="4" fill="' + mix(dc, "#ffffff", .15) + '" stroke="' + INK + '" stroke-width=".7"/><path d="M19 -50v9M23 -50v9" stroke="rgba(255,255,255,.4)" stroke-width="1"/>';
    else if (tl === "lekaren") s += '<path d="M19 -52h5v4l4 7a3 3 0 0 1 -3 4h-7a3 3 0 0 1 -3 -4l4 -7z" fill="#5fa86a" stroke="' + INK + '" stroke-width=".7"/>';
    else if (tl === "pisaren") s += '<rect x="16" y="-52" width="9" height="14" fill="#f4efe2" stroke="' + INK + '" stroke-width=".7"/><path d="M18 -48h5M18 -45h5M18 -42h3" stroke="#2b4c8f" stroke-width=".8"/><circle cx="21" cy="-38" r="2" fill="#a5312a"/>';
    else if (tl === "ker") s += '<path d="M17 -38V-70" stroke="#c9a24a" stroke-width="2.4"/><circle cx="17" cy="-73" r="4.2" fill="#e3be4f" stroke="' + INK + '" stroke-width=".7"/>';
    else if (tl === "kvet") s += '<path d="M17 -38l5 -10" stroke="#3f7a3a" stroke-width="1.4"/><circle cx="22.5" cy="-50" r="3" fill="#e08aa0" stroke="' + INK + '" stroke-width=".5"/>';
    else if (tl === "lopta") s += '<circle cx="21" cy="-34" r="4.4" fill="#c8602a" stroke="' + INK + '" stroke-width=".6"/>';
    else if (tl === "mech") s += '<path d="M14 -40q3 -6 9 -4q2 7 -3 10q-5 0 -6 -6z" fill="#8a6a3a" stroke="' + INK + '" stroke-width=".7"/><circle cx="21" cy="-45" r="1.4" fill="#e3be4f"/>';
    if (old) s += '<path d="M-17 -40L-21 -2" stroke="#5a3a20" stroke-width="2.8" stroke-linecap="round"/><path d="M-17 -40q-4 -3 -7 0" stroke="#5a3a20" stroke-width="2.8" fill="none" stroke-linecap="round"/>';
    s += '<circle cx="-17" cy="-38" r="3.4" fill="' + skin + '" stroke="' + INK + '" stroke-width=".5"/><circle cx="17" cy="-38" r="3.4" fill="' + skin + '" stroke="' + INK + '" stroke-width=".5"/>';
    /* krk */
    s += '<rect x="-3.6" y="-75" width="7.2" height="9" fill="' + skinD + '"/>';
    /* hlava */
    s += '<g transform="translate(0,-83) scale(' + hs.toFixed(2) + ')">';
    var back = "", front = "", hat = o.hat || "h0", crown = hat === "h7" || hat === "h6";
    var young = kid;
    /* vlasy za hlavou */
    if (fem && !mourn) {
      if (L.hair === 0 || L.hair === 4 || young) back += '<path d="M-10.8 -4Q-13.5 12 -9.5 25L9.5 25Q13.5 12 10.8 -4Z" fill="' + hair + '"/>';
    }
    /* šatky a závoje (za tvárou) */
    if (fem && !kid && !mourn) {
      if (hat === "h1" || hat === "h4") back += '<path d="M-11.5 8Q-14 -14 0 -13.5Q14 -14 11.5 8L12 19Q0 24 -12 19Z" fill="#f1ece0" stroke="' + INK + '" stroke-width=".8"/>';
      if (hat === "h2" || hat === "h5") back += '<path d="M3 -36Q18 -30 19 0L12 18Q14 -8 3 -32Z" fill="rgba(245,240,230,.88)" stroke="' + INK + '" stroke-width=".6"/>';
      if (hat === "h3" || crown) back += '<path d="M-9 -9Q-16 4 -14 22L-8 20Q-9 6 -7 -6Z M9 -9Q16 4 14 22L8 20Q9 6 7 -6Z" fill="rgba(245,240,230,.8)" stroke="' + INK + '" stroke-width=".5"/>';
    }
    if (mourn) back += '<path d="M-12.5 8Q-15 -15 0 -14.5Q15 -15 12.5 8L15 26Q0 31 -15 26Z" fill="#1d1a18" stroke="#000" stroke-width=".8"/>';
    s += back;
    s += '<circle cx="-9" cy="0" r="2.2" fill="' + skinD + '"/><circle cx="9" cy="0" r="2.2" fill="' + skinD + '"/>';
    s += '<ellipse cx="0" cy="0" rx="9" ry="10.4" fill="' + skin + '" stroke="' + INK + '" stroke-width=".9"/><ellipse cx="3" cy="1" rx="6" ry="9" fill="rgba(0,0,0,.08)"/>';
    /* vlasy vpredu */
    if (!mourn) {
      var hf = "";
      var hsx = L.hair == null ? 0 : L.hair;
      if (fem) {
        hf += '<path d="M-9.8 0Q-10.6 -12 0 -11.6Q10.6 -12 9.8 0Q7 -7.5 0 -8.8Q-7 -7.5 -9.8 0Z" fill="' + hair + '"/>';
        if (hsx === 1 || young && hsx % 2) hf += '<path d="M-9 3Q-13 14 -11 30" stroke="' + hair + '" stroke-width="4.6" fill="none"/><path d="M9 3Q13 14 11 30" stroke="' + hair + '" stroke-width="4.6" fill="none"/><circle cx="-11" cy="30" r="2" fill="#a5312a"/><circle cx="11" cy="30" r="2" fill="#a5312a"/>';
        if (hsx === 2) hf += '<circle cx="0" cy="-12.5" r="4.2" fill="' + hair + '" stroke="' + INK + '" stroke-width=".5"/>';
        if (hsx === 4) hf += [-7, -3.5, 0, 3.5, 7].map(function (x, i) { return '<circle cx="' + x + '" cy="' + (-10.2 + Math.abs(x) * .22) + '" r="1.7" fill="' + ["#e08aa0", "#f4e27a", "#fff", "#c6a0e0", "#e08aa0"][i] + '"/>'; }).join("");
      } else if (age >= 17 || !young) {
        if (hsx === 0) hf += '<path d="M-9.6 -1Q-10.5 -12.5 0 -11.8Q10.5 -12.5 9.6 -1Q8 -6.5 0 -7.8Q-8 -6.5 -9.6 -1Z" fill="' + hair + '"/>';
        else if (hsx === 1) hf += '<path d="M-9.6 -1Q-10.5 -12.5 0 -11.8Q10.5 -12.5 9.6 -1Q8 -6.5 0 -7.8Q-8 -6.5 -9.6 -1Z" fill="' + hair + '"/><path d="M-10 -1Q-12.5 9 -9.5 15L-6 12Q-8 5 -7.5 -2Z M10 -1Q12.5 9 9.5 15L6 12Q8 5 7.5 -2Z" fill="' + hair + '"/>';
        else if (hsx === 2) hf += '<path d="M-10.6 5Q-12.5 -13 0 -13Q12.5 -13 10.6 5L7 3.5Q6 -5 0 -6.2Q-6 -5 -7 3.5Z" fill="' + hair + '"/>';
        else if (hsx === 3) hf += [-3, -2, -1, 0, 1, 2, 3].map(function (i) { return '<circle cx="' + (i * 3.2) + '" cy="' + (-9.2 + Math.abs(i) * 1.1) + '" r="3.5" fill="' + hair + '"/>'; }).join("");
        else hf += '<path d="M-9.9 -3Q-10.8 3 -8.6 6L-7 2Q-7.6 -2 -7 -5Z M9.9 -3Q10.8 3 8.6 6L7 2Q7.6 -2 7 -5Z" fill="' + hair + '"/>';
      } else {
        hf += '<path d="M-9.6 -1Q-10.5 -12.5 0 -11.8Q10.5 -12.5 9.6 -1Q8 -6.5 0 -7.8Q-8 -6.5 -9.6 -1Z" fill="' + hair + '"/>';
      }
      s += hf;
    }
    /* tvár */
    var sick = (o.health == null ? 100 : o.health) < 40;
    s += '<ellipse cx="-3.8" cy="-.8" rx="2.1" ry="1.5" fill="#fbf8ee"/><ellipse cx="3.8" cy="-.8" rx="2.1" ry="1.5" fill="#fbf8ee"/>';
    s += '<circle cx="-3.8" cy="-.7" r="1.15" fill="' + eye + '"/><circle cx="3.8" cy="-.7" r="1.15" fill="' + eye + '"/><circle cx="-3.8" cy="-.7" r=".5" fill="#111"/><circle cx="3.8" cy="-.7" r=".5" fill="#111"/>';
    s += '<path d="M-6.4 -3.8Q-3.8 -5.4 -1.6 -3.8M1.6 -3.8Q3.8 -5.4 6.4 -3.8" stroke="' + (age >= 48 ? "#8a8478" : mix(hair, "#000000", .1)) + '" stroke-width=".9" fill="none"/>';
    s += '<path d="M0 -1.4Q1.8 2.2 .2 3" stroke="' + skinD + '" stroke-width=".8" fill="none"/>';
    s += '<path d="M-2.6 6.4Q0 8 2.6 6.4" stroke="#8a3a2c" stroke-width=".9" fill="none"/>';
    if (fem || kid) s += '<circle cx="-5.6" cy="3.6" r="1.7" fill="rgba(230,110,105,.3)"/><circle cx="5.6" cy="3.6" r="1.7" fill="rgba(230,110,105,.3)"/>';
    if (age >= 52) s += '<path d="M-6.6 -6.4h13M-6 -8h12" stroke="rgba(90,60,40,.28)" stroke-width=".6"/><path d="M-7 1.2l-1.4 1.6M7 1.2l1.4 1.6" stroke="rgba(90,60,40,.35)" stroke-width=".6"/>';
    if (sick) s += '<ellipse cx="0" cy="0" rx="9" ry="10.4" fill="rgba(150,175,130,.35)"/>';
    /* brada */
    if (!fem && !kid && age >= 17 && !mourn) {
      var bd = L.beard | 0;
      if (bd === 1) s += '<path d="M-8.4 0Q-8.6 11 0 11.2Q8.6 11 8.4 0Q6 7 0 7.4Q-6 7 -8.4 0Z" fill="' + mix(hair, skin, .55) + '"/>';
      if (bd === 2) s += '<path d="M-8.8 -1Q-9.5 11 0 12.4Q9.5 11 8.8 -1Q6 5 0 5Q-6 5 -8.8 -1Z" fill="' + hair + '" stroke="' + INK + '" stroke-width=".4"/>';
      if (bd === 3) s += '<path d="M-9 -1Q-11 14 0 24Q11 14 9 -1Q6 5 0 5Q-6 5 -9 -1Z" fill="' + hair + '" stroke="' + INK + '" stroke-width=".4"/>';
      if (bd === 4) s += '<path d="M-6.2 4.6Q0 1.8 6.2 4.6Q8.5 3.8 9.2 6.2Q6 6.2 4 6.6Q0 4.8 -4 6.6Q-6 6.2 -9.2 6.2Q-8.5 3.8 -6.2 4.6Z" fill="' + hair + '"/>';
    }
    /* pokrývka hlavy */
    if (!mourn && !kid) {
      var dk = mix(dc, "#000000", .3);
      if (fem) {
        if (hat === "h0" && o.role === "spouse") front += '<path d="M-10.8 6Q-13 -14 0 -13Q13 -14 10.8 6L8.2 4Q7 -4 0 -6Q-7 -4 -8.2 4Z" fill="#f1ece0" stroke="' + INK + '" stroke-width=".8"/>';
        if (hat === "h2") front += '<path d="M-7.5 -9L3 -38L8.5 -9Z" fill="' + dc + '" stroke="' + INK + '" stroke-width=".9"/><path d="M-7 -12Q0 -9.5 8 -12" stroke="#e3be4f" stroke-width="2" fill="none"/>';
        if (hat === "h5") front += '<path d="M-7.5 -9L3 -40L8.5 -9Z" fill="' + dk + '" stroke="' + INK + '" stroke-width=".9"/><path d="M-7 -12Q0 -9.5 8 -12" stroke="#e3be4f" stroke-width="2.4" fill="none"/><circle cx="0" cy="-12" r="2" fill="#c8302a" stroke="#e3be4f" stroke-width=".7"/>';
        if (hat === "h3") front += '<path d="M-9.4 -6.5Q0 -12 9.4 -6.5L9.4 -9.4Q0 -15 -9.4 -9.4Z" fill="#e3be4f" stroke="' + INK + '" stroke-width=".6"/><circle cx="0" cy="-11" r="1.5" fill="#c8302a"/>';
      } else {
        if (hat === "h1") front += '<ellipse cx="0" cy="-8.5" rx="14.5" ry="3.7" fill="#6b5a44" stroke="' + INK + '" stroke-width=".8"/><path d="M-8 -8.5Q-9 -22 0 -22Q9 -22 8 -8.5Z" fill="#7a6650" stroke="' + INK + '" stroke-width=".8"/><path d="M-8.2 -11.5Q0 -9.4 8.2 -11.5" stroke="' + dc + '" stroke-width="2.2" fill="none"/>';
        if (hat === "h4") front += '<ellipse cx="0" cy="-10" rx="9.8" ry="4.6" fill="' + dc + '" stroke="' + INK + '" stroke-width=".8"/><path d="M-6 -12Q0 -22 9 -13Q3 -10 -6 -12Z" fill="' + dk + '" stroke="' + INK + '" stroke-width=".6"/><path d="M8.5 -10Q18 -2 13 15" stroke="' + dc + '" stroke-width="4.2" fill="none" stroke-linecap="round"/>';
        if (hat === "h2") front += '<ellipse cx="2" cy="-11.5" rx="12.5" ry="5" transform="rotate(-8 2 -11.5)" fill="' + dk + '" stroke="' + INK + '" stroke-width=".8"/><path d="M8 -14Q20 -31 25 -17" stroke="#2f8a7a" stroke-width="2.4" fill="none"/><path d="M8 -14Q18 -25 24 -17" stroke="#c9a24a" stroke-width=".8" fill="none"/>';
        if (hat === "h5") front += '<ellipse cx="0" cy="-9" rx="11.8" ry="4.1" fill="' + dc + '" stroke="' + INK + '" stroke-width=".8"/><path d="M-9 -9Q-10 -24 0 -23Q10 -24 9 -9Z" fill="' + dk + '" stroke="' + INK + '" stroke-width=".8"/><circle cx="-6" cy="-12.5" r="2.3" fill="#c8302a" stroke="#e3be4f" stroke-width=".9"/><path d="M5 -20Q16 -30 22 -22" stroke="#f6f2ea" stroke-width="2" fill="none"/>';
        if (hat === "h3") front += '<path d="M-9.4 -6.5Q0 -12 9.4 -6.5L9.4 -9.4Q0 -15 -9.4 -9.4Z" fill="#e3be4f" stroke="' + INK + '" stroke-width=".6"/><circle cx="-4" cy="-10.6" r="1.1" fill="#c8302a"/><circle cx="4" cy="-10.6" r="1.1" fill="#3a6fb0"/>';
      }
      if (hat === "h6") front += '<path d="M-9.6 -7L-9.6 -13L-5 -10.4L-2.6 -15.5L0 -10.8L2.6 -15.5L5 -10.4L9.6 -13L9.6 -7Z" fill="#e3be4f" stroke="' + INK + '" stroke-width=".7"/><circle cx="0" cy="-9" r="1.2" fill="#3a6fb0"/>';
      if (hat === "h7") front += '<path d="M-9.6 -7Q0 -13 9.6 -7L9.6 -10Q0 -16 -9.6 -10Z" fill="#f6f2ea" stroke="' + INK + '" stroke-width=".6"/><path d="M-10 -9L-11.5 -22L-5.6 -15.5L0 -25L5.6 -15.5L11.5 -22L10 -9Z" fill="#e3be4f" stroke="' + INK + '" stroke-width=".8"/><circle cx="0" cy="-14" r="1.7" fill="#c8302a"/><circle cx="-6" cy="-12" r="1.1" fill="#3a6fb0"/><circle cx="6" cy="-12" r="1.1" fill="#3a8a4a"/>';
    }
    if (mourn && !fem) front += '<path d="M-9.6 -7Q-9 -17 0 -17Q9 -17 9.6 -7Z" fill="#1d1a18" stroke="#000" stroke-width=".6"/>';
    s += front + "</g>";
    s += "</g>";
    return s;
  }

  function placeFig(o, x, y, sc) {
    var kid = (o.age | 0) < 16, old = (o.age | 0) >= 62;
    var k = (kid ? cl(.5 + (o.age | 0) * .034, .5, .98) : old ? .95 : 1) * sc;
    var dr = "";
    if (o.dress && typeof dressSVG === "function") {
      try {
        var raw = dressSVG(o.dress.d, o.dress.p, o.dress.role, { mourn: o.mourn, winter: (S.season | 0) === 3 }, 140), s2 = .5 * sc;
        if (/^<svg/.test(raw)) dr = raw.replace(/^<svg[^>]*>/, '<svg x="' + (-70 * s2).toFixed(1) + '" y="' + (-240 * s2).toFixed(1) + '" width="' + (140 * s2).toFixed(1) + '" height="' + (254 * s2).toFixed(1) + '" viewBox="-70 -240 140 254" overflow="visible">');
      } catch (e) { dr = ""; }
    }
    var g = '<g transform="translate(' + x + "," + y + ')">' + (dr || '<g transform="scale(' + k.toFixed(3) + ')' + (old ? " skewX(-5)" : "") + '">' + fig(o) + "</g>");
    if (o.name) g += '<text y="17" text-anchor="middle" font-family="Almendra SC,EB Garamond,serif" font-size="13" fill="' + INK + '">' + esc2(String(o.name).slice(0, 14)) + "</text>";
    if (o.sub) g += '<text y="30" text-anchor="middle" font-family="EB Garamond,serif" font-style="italic" font-size="11" fill="#5a4a34">' + esc2(o.sub) + "</text>";
    return g + "</g>";
  }

  function craftOf(d) {
    try { var b = S.bld.filter(function (z) { return z.owner === d.id && !z.halt; })[0] || S.bld.filter(function (z) { return z.owner === d.id; })[0]; return b ? b.type : ""; } catch (e) { return ""; }
  }
  function toolFor(d, role, p) {
    var age = p.age | 0;
    if (role === "kid") return age < 11 ? "lopta" : "";
    if (role === "spouse") return d.title >= 5 ? "kvet" : "";
    var t = craftOf(d);
    if (d.title >= 9) return "ker";
    if (/kovac|zbrojar|podkov/.test(t)) return "kovac";
    if (/pekar/.test(t)) return "pekar";
    if (/krcma|vinar|pasovanie|pivovar/.test(t)) return "krcma";
    if (/tkac|sukn|krajc/.test(t)) return "tkac";
    if (/lekaren|bylin/.test(t)) return "lekaren";
    if (/pisaren|knih/.test(t)) return "pisaren";
    return "mech";
  }
  function figOf(d, e, extra) {
    var p = e.p, role = e.role, L = lookOf(p), out;
    try { out = outfitOf(d, role); } catch (er) { out = { body: "b0", hat: "h0", jewel: "j0" }; }
    var tier = 0; try { tier = TIER[cl(d.title || 0, 0, 11)]; } catch (er) { }
    var o = {
      d: d.id, dc: dcol(d.id), look: L, age: p.age, fem: (L.g || p.gender) === "f", body: out.body, hat: out.hat, jewel: out.jewel,
      mourn: role === "head" && widow(d), health: p.health, tier: tier, role: role, name: p.name, ph: hash(p.name), tool: toolFor(d, role, p)
    };
    var kind = role === "head" ? "hlava" : role === "spouse" ? (o.fem ? "manželka" : "manžel") : (o.fem ? "dcéra" : "syn");
    o.dress = { d: d, p: p, role: role };
    o.sub = kind + " · " + (p.age | 0) + " r.";
    for (var k in extra) o[k] = extra[k];
    return o;
  }

  /* ============ SÍDLO ============ */
  function styleOf(d) {
    var key = "pre", st = {};
    try { key = CITY_DEF[CITY(d.city != null ? d.city : S.ci).def].key; } catch (e) { try { key = CITY_DEF[CC().def].key; } catch (e2) { } }
    try { st = CSTY[key] || {}; } catch (e) { }
    var pal = st.stucco || st.plaster, wall = "#efe6d4";
    if (pal) wall = pal[d.id % pal.length]; else if (st.brick) wall = "#b4573b"; else if (st.tudor) wall = "#f1e8d2"; else if (st.lime) wall = st.lime;
    var roof = st.slateAll ? "#4f5d78" : (st.roof || "#a5312a");
    return { key: key, st: st, wall: wall, roof: roof, brick: st.brick, tudor: st.tudor, thatch: !st.noThatch };
  }

  function defsSvg() {
    return '<defs>' +
      '<pattern id="rybrk" width="14" height="7" patternUnits="userSpaceOnUse"><path d="M0 .5H14M0 4H14M7 .5V4M0 4V7.5" stroke="rgba(60,20,10,.45)" stroke-width=".8" fill="none"/></pattern>' +
      '<pattern id="rystn" width="22" height="12" patternUnits="userSpaceOnUse"><path d="M0 .5H22M0 6.5H22M11 .5V6.5M0 6.5V12.5" stroke="rgba(40,35,30,.4)" stroke-width=".8" fill="none"/></pattern>' +
      '<pattern id="rytil" width="10" height="8" patternUnits="userSpaceOnUse"><path d="M0 7Q5 1 10 7" stroke="rgba(0,0,0,.28)" stroke-width=".9" fill="none"/></pattern>' +
      '<pattern id="rythk" width="5" height="9" patternUnits="userSpaceOnUse"><path d="M1 0V9M3.5 1V9" stroke="rgba(90,60,20,.45)" stroke-width=".9"/></pattern>' +
      '<pattern id="rypln" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M3 0V8" stroke="rgba(60,40,20,.35)" stroke-width=".8"/></pattern>' +
      '<pattern id="rybar" width="7" height="14" patternUnits="userSpaceOnUse"><path d="M3.5 0V14" stroke="#2b2117" stroke-width="1.3"/></pattern>' +
      '<radialGradient id="ryglow"><stop offset="0" stop-color="#ffd37a" stop-opacity=".95"/><stop offset="1" stop-color="#ffd37a" stop-opacity="0"/></radialGradient>' +
      '</defs>';
  }

  function seat(d, l) {
    var se = S.season | 0, ph = phase(), wx = weather();
    var lv = d.royal ? 6 : cl(d.house | 0, 0, 6);
    var K = styleOf(d);
    var W = 860, H = 364, gy = 236;
    var lit = ph >= 2, win = lit ? "#ffcf6a" : "#9aafc4";
    var dc = dcol(d.id), arms = null; try { arms = armsOf(d.id); } catch (e) { }
    var hu = d.hu || [];
    var has = function (k) { return hu.indexOf(k) >= 0; };
    var snow = se === 3, roofC = snow ? "#eef3f6" : K.roof;
    var sky = ["#d7ecb0", "#c5d8ef", "#e7c39a", "#d5dee8"][se] || "#d7ecb0";
    var sky2 = ph === 0 ? "#f8e2b8" : ph === 2 ? "#e08a4a" : ph === 3 ? "#1a2744" : sky;
    if (wx === "búrka" || wx === "dážď") sky2 = "#7f93a8";
    var ground = ["#8ab052", "#6aa046", "#a8863f", "#e8eef2"][se] || "#8ab052";
    var leaf = ["#6faa4a", "#3f7a3a", "#c9782a", "#d9e2e6"][se], leaf2 = ["#8cc464", "#4f8d44", "#e0a030", "#eef3f6"][se];
    var s = defsSvg();
    s += '<rect y="-50" width="' + W + '" height="' + (H + 50) + '" fill="' + sky2 + '"/>';
    if (ph === 3) s += '<circle cx="700" cy="46" r="15" fill="#f4efd2"/><circle cx="706" cy="42" r="13" fill="' + sky2 + '"/>' + [60, 180, 330, 520, 620, 790].map(function (x, i) { return '<circle cx="' + x + '" cy="' + (18 + i * 9 % 40) + '" r="1.2" fill="#fff"/>'; }).join("");
    else if (se === 1 && ph < 2) s += '<circle cx="740" cy="52" r="20" fill="#fbe39a" opacity=".95"/>';
    s += '<g opacity=".8"><g><animateTransform attributeName="transform" type="translate" values="0 0;90 0;0 0" dur="60s" repeatCount="indefinite"/><ellipse cx="140" cy="62" rx="46" ry="14" fill="#fff"/><ellipse cx="168" cy="56" rx="28" ry="12" fill="#fff"/></g><g><animateTransform attributeName="transform" type="translate" values="0 0;-70 0;0 0" dur="75s" repeatCount="indefinite"/><ellipse cx="520" cy="40" rx="40" ry="11" fill="#fff"/><ellipse cx="544" cy="35" rx="24" ry="9" fill="#fff"/></g></g>';
    s += '<path d="M0 170C180 130 340 190 520 144S740 120 860 158V' + gy + 'H0Z" fill="' + (snow ? "#e7eef2" : "#9bb56a") + '" opacity=".72"/>';
    /* vzdialené mesto podľa štýlu */
    var far = ""; var tr = 1; try { tr = CC().tier || 1; } catch (e) { }
    for (var i = 0; i < 6 + tr * 2; i++) {
      var fx = 20 + i * (800 / (5 + tr * 2)) + (i % 2) * 8, fh = 22 + (i * 17 % 26), fw = 26 + (i * 7 % 14);
      if (fx > 540 && fx < 860 && false) continue;
      far += '<rect x="' + fx + '" y="' + (176 - fh) + '" width="' + fw + '" height="' + fh + '" fill="' + mix(K.wall, "#9bb56a", .35) + '" opacity=".75"/><path d="M' + (fx - 3) + " " + (176 - fh) + "L" + (fx + fw / 2) + " " + (176 - fh - 12) + "L" + (fx + fw + 3) + " " + (176 - fh) + 'Z" fill="' + mix(K.roof, "#9bb56a", .3) + '" opacity=".75"/>';
    }
    far += '<path d="M600 176V108L612 90L624 108V176Z" fill="' + mix("#c9c0a8", "#9bb56a", .3) + '" opacity=".8"/><path d="M612 90V76" stroke="#d6aa4c" stroke-width="2"/>';
    s += far;
    s += '<rect y="' + (gy - 6) + '" width="' + W + '" height="' + (H - gy + 6) + '" fill="' + ground + '"/>';
    /* cesta */
    s += '<path d="M0 306H860V' + H + 'H0Z" fill="#9a8460"/><path d="M0 306H860" stroke="#6f5c3c" stroke-width="3"/>' + Array.from({ length: 22 }, function (_, i) { return '<ellipse cx="' + (20 + i * 40 + (i % 2) * 14) + '" cy="' + (322 + (i % 3) * 12) + '" rx="9" ry="3" fill="rgba(60,45,25,.28)"/>'; }).join("");
    if (snow) s += '<path d="M0 306H860" stroke="#fff" stroke-width="5" opacity=".7"/>';
    /* stromy */
    function tree(x, y, k) {
      var t = '<g transform="translate(' + x + "," + y + ') scale(' + k + ')"><path d="M-3 0L-4 -26H4L3 0Z" fill="#6b4a2a" stroke="' + INK + '" stroke-width=".8"/>';
      if (se === 3) t += '<path d="M0 -24L-14 -44M0 -24L12 -48M0 -30L-6 -54" stroke="#6b4a2a" stroke-width="2.4"/><circle cx="-14" cy="-44" r="3" fill="#fff"/><circle cx="12" cy="-48" r="3" fill="#fff"/>';
      else t += '<circle cx="0" cy="-40" r="19" fill="' + leaf + '" stroke="' + INK + '" stroke-width=".8"/><circle cx="-9" cy="-32" r="12" fill="' + leaf2 + '" opacity=".8"/><circle cx="10" cy="-46" r="11" fill="' + leaf2 + '" opacity=".6"/>' + (se === 0 ? '<circle cx="-6" cy="-44" r="2" fill="#f6c8d4"/><circle cx="8" cy="-36" r="2" fill="#f6c8d4"/><circle cx="2" cy="-52" r="2" fill="#fff"/>' : "");
      return t + "</g>";
    }
    /* ---------- pomocné prvky domu ---------- */
    var INKs = ' stroke="' + INK + '" stroke-width="1.5"';
    function wallR(x, y, w, h) {
      var t = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + K.wall + '"' + INKs + '/>';
      if (K.brick) t += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="url(#rybrk)" opacity=".7"/>';
      if (K.tudor) { t += '<g stroke="#4a3426" stroke-width="3">'; for (var xx = x + 14; xx < x + w; xx += 38) t += '<path d="M' + xx + " " + y + "V" + (y + h) + '"/>'; t += '<path d="M' + x + " " + (y + h * .5) + "H" + (x + w) + '"/></g><path d="M' + (x + 14) + " " + (y + h * .5) + "L" + (x + 52) + " " + y + "M" + (x + 90) + " " + (y + h * .5) + "L" + (x + 52) + " " + (y + h) + '" stroke="#4a3426" stroke-width="2.4" fill="none"/>'; }
      return t;
    }
    function stoneR(x, y, w, h, c) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + (c || "#bdb4a0") + '"' + INKs + '/><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="url(#rystn)"/>'; }
    function roofP(xa, xb, y, pk, thatch) {
      var m = (xa + xb) / 2, t = '<path d="M' + (xa - 14) + " " + y + "L" + m + " " + (y - pk) + "L" + (xb + 14) + " " + y + 'Z" fill="' + (thatch && !snow ? "#b89a4e" : roofC) + '"' + INKs + '/>';
      t += '<path d="M' + (xa - 14) + " " + y + "L" + m + " " + (y - pk) + "L" + (xb + 14) + " " + y + 'Z" fill="url(#' + (thatch ? "rythk" : "rytil") + ')" opacity="' + (snow ? ".25" : ".9") + '"/>';
      t += '<path d="M' + (xa - 14) + " " + (y + 1) + "H" + (xb + 14) + '" stroke="rgba(0,0,0,.25)" stroke-width="3"/>';
      if (snow) t += '<path d="M' + (xa - 14) + " " + y + "Q" + (xa + 10) + " " + (y + 5) + " " + (xa + 28) + " " + y + "T" + (xa + 60) + " " + y + '" fill="none" stroke="#fff" stroke-width="3"/>';
      return t;
    }
    function winR(x, y, w, h, arch, shut) {
      var t = "";
      if (!shut) t += '<rect x="' + (x - 6) + '" y="' + y + '" width="6" height="' + h + '" fill="' + mix(dc, "#ffffff", .1) + '" stroke="' + INK + '" stroke-width=".8"/><rect x="' + (x + w) + '" y="' + y + '" width="6" height="' + h + '" fill="' + mix(dc, "#ffffff", .1) + '" stroke="' + INK + '" stroke-width=".8"/>';
      var body = arch ? "M" + x + " " + (y + h) + "V" + (y + w / 2) + "A" + (w / 2) + " " + (w / 2) + " 0 0 1 " + (x + w) + " " + (y + w / 2) + "V" + (y + h) + "Z" : "M" + x + " " + y + "h" + w + "v" + h + "h-" + w + "Z";
      t += '<path d="' + body + '" fill="' + win + '" stroke="' + INK + '" stroke-width="1.2"/><path d="M' + (x + w / 2) + " " + y + "V" + (y + h) + "M" + x + " " + (y + h * .5) + "h" + w + '" stroke="' + INK + '" stroke-width=".9"/>';
      if (lit) t += '<circle cx="' + (x + w / 2) + '" cy="' + (y + h / 2) + '" r="' + (w * 1.1) + '" fill="url(#ryglow)" opacity=".7"/>';
      return t;
    }
    function crenel(x, y, w, c) { var t = "", n = Math.max(4, Math.round(w / 12)), st = w / n; for (var i = 0; i < n; i += 2) t += '<rect x="' + (x + i * st).toFixed(1) + '" y="' + (y - 7) + '" width="' + st.toFixed(1) + '" height="8" fill="' + (c || "#cfc6b0") + '" stroke="' + INK + '" stroke-width=".9"/>'; return t; }
    function cone(cx, y, w, h, c) {
      return '<path d="M' + (cx - w / 2 - 5) + " " + y + "L" + cx + " " + (y - h) + "L" + (cx + w / 2 + 5) + " " + y + 'Z" fill="' + (snow ? "#eef3f6" : c || K.roof) + '"' + INKs + '/><path d="M' + (cx - w / 2 - 5) + " " + y + "L" + cx + " " + (y - h) + "L" + (cx + w / 2 + 5) + " " + y + 'Z" fill="url(#rytil)" opacity=".7"/>';
    }
    function flag(x, y, k) {
      var c1 = arms ? arms.f : dc, c2 = "#e3be4f";
      var wave = 'M0 0Q14 -6 28 0T56 0V24Q42 30 28 24T0 24Z', w2 = 'M0 0Q14 6 28 0T56 0V24Q42 18 28 24T0 24Z';
      return '<g transform="translate(' + x + "," + y + ") scale(" + (k || 1) + ')"><path d="M0 8V-36" stroke="#4a3a2a" stroke-width="2.4"/><circle cx="0" cy="-37" r="2.4" fill="#e3be4f"/><g transform="translate(1,-34) scale(.7)"><path d="' + wave + '" fill="' + c1 + '" stroke="' + INK + '" stroke-width="1.2"><animate attributeName="d" values="' + wave + ";" + w2 + ";" + wave + '" dur="1.8s" repeatCount="indefinite"/></path><rect x="0" y="9" width="56" height="5" fill="' + c2 + '" opacity=".85"/></g></g>';
    }
    function smoke(x, y) {
      var t = ""; for (var i = 0; i < 3; i++) t += '<circle cx="' + x + '" cy="' + y + '" r="4" fill="rgba(235,235,238,.8)"><animate attributeName="cy" from="' + y + '" to="' + (y - 46) + '" dur="3.6s" begin="-' + (i * 1.2) + 's" repeatCount="indefinite"/><animate attributeName="cx" from="' + x + '" to="' + (x + 12) + '" dur="3.6s" begin="-' + (i * 1.2) + 's" repeatCount="indefinite"/><animate attributeName="opacity" from=".7" to="0" dur="3.6s" begin="-' + (i * 1.2) + 's" repeatCount="indefinite"/><animate attributeName="r" from="3" to="9" dur="3.6s" begin="-' + (i * 1.2) + 's" repeatCount="indefinite"/></circle>';
      return t;
    }
    function lantern(x, y) {
      return '<path d="M' + x + " " + (y - 14) + "V" + (y - 6) + '" stroke="' + INK + '" stroke-width="1.4"/><rect x="' + (x - 3.4) + '" y="' + (y - 6) + '" width="6.8" height="10" rx="1.6" fill="' + (lit ? "#ffd37a" : "#5a4a3a") + '" stroke="' + INK + '" stroke-width="1"/>' + (lit ? '<circle cx="' + x + '" cy="' + (y - 1) + '" r="20" fill="url(#ryglow)"><animate attributeName="opacity" values=".7;1;.75;.95;.7" dur="2.2s" repeatCount="indefinite"/></circle>' : "");
    }
    function doorR(x, w, h) {
      var t = '<path d="M' + x + " " + gy + "V" + (gy - h + w / 2) + "A" + (w / 2) + " " + (w / 2) + " 0 0 1 " + (x + w) + " " + (gy - h + w / 2) + "V" + gy + 'Z" fill="#5a3a20" stroke="' + INK + '" stroke-width="1.5"/>';
      t += '<path d="M' + (x + w / 2) + " " + (gy - h) + "V" + gy + '" stroke="' + INK + '" stroke-width="1"/>';
      for (var i = 0; i < 3; i++) t += '<circle cx="' + (x + 4) + '" cy="' + (gy - 8 - i * 10) + '" r=".9" fill="#d6aa4c"/>';
      t += '<circle cx="' + (x + w - 5) + '" cy="' + (gy - h * .45) + '" r="1.6" fill="#d6aa4c"/>';
      return t;
    }
    var ARMSK = [.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.3][lv];

    /* ---------- hlavná budova ---------- */
    var x0 = lv === 6 ? 170 : 150, WW = [170, 200, 250, 290, 330, 300, 330][lv], house = "", dx, doorW = [24, 30, 36, 40, 46, 50, 60][lv], doorH = [40, 48, 58, 64, 72, 78, 90][lv];
    var x1 = x0 + WW, top, peakY, peakX = x0 + WW / 2, flagAt = null;
    dx = lv === 6 ? x0 + 150 : x0 + Math.round(WW * .3);
    var thatch = lv === 0 && K.thatch;
    if (lv === 0) {
      var hh = 62; top = gy - hh;
      house += wallR(x0, top, WW, hh) + roofP(x0, x1, top, 44, thatch);
      house += doorR(dx, doorW, doorH) + winR(x0 + WW - 52, top + 14, 22, 24, false, false);
      house += '<rect x="' + (x1 - 34) + '" y="' + (top - 34) + '" width="14" height="22" fill="#a39a86"' + INKs + '/>' + smoke(x1 - 27, top - 36);
      peakY = top - 44;
      /* plot, studňa, sliepky */
      house += '<g stroke="#6b4a2a" stroke-width="2">' + Array.from({ length: 9 }, function (_, i) { return '<path d="M' + (x0 - 60 + i * 12) + " " + (gy + 4) + 'v-16"/>'; }).join("") + '</g><path d="M' + (x0 - 62) + " " + (gy - 7) + "H" + (x0 + 40) + '" stroke="#6b4a2a" stroke-width="2"/>';
      house += '<g transform="translate(' + (x1 + 40) + "," + (gy + 8) + ')"><ellipse cy="2" rx="16" ry="5" fill="#8a8272" stroke="' + INK + '"/><rect x="-14" y="-12" width="28" height="14" fill="#a39a86" stroke="' + INK + '"/><path d="M-14 -12L0 -22L14 -12" fill="#8a6a3a" stroke="' + INK + '"/></g>';
      house += [0, 1, 2].map(function (i) { return '<g transform="translate(' + (x0 - 20 + i * 18) + "," + (gy + 22) + ')"><ellipse rx="6" ry="4.4" fill="' + (i === 1 ? "#d9843a" : "#f4f0e6") + '" stroke="' + INK + '" stroke-width=".6"><animateTransform attributeName="transform" type="translate" values="0 0;2 0;0 0" dur="' + (2 + i * .6) + 's" repeatCount="indefinite"/></ellipse><circle cx="-5" cy="-3.6" r="2.4" fill="#f4f0e6" stroke="' + INK + '" stroke-width=".5"/><path d="M-7.4 -3.8l-2 .8" stroke="#e8a030" stroke-width="1.3"/></g>'; }).join("");
    } else if (lv === 1) {
      var h1v = 108; top = gy - h1v;
      house += wallR(x0, top, WW, h1v) + '<path d="M' + x0 + " " + (gy - 50) + "H" + x1 + '" stroke="' + INK + '" stroke-width="2"/>' + roofP(x0, x1, top, 52, false);
      house += winR(x0 + 24, top + 22, 24, 30, false, false) + winR(x1 - 56, top + 22, 24, 30, false, false);
      house += winR(x1 - 66, gy - 40, 38, 28, false, true);
      house += doorR(dx, doorW, doorH);
      /* markíza + tabuľa */
      house += '<path d="M' + (x1 - 78) + " " + (gy - 46) + "H" + (x1 - 16) + "L" + (x1 - 22) + " " + (gy - 58) + "H" + (x1 - 72) + 'Z" fill="' + dc + '"' + INKs + '/><path d="M' + (x1 - 64) + " " + (gy - 58) + "v12M" + (x1 - 52) + " " + (gy - 58) + "v12M" + (x1 - 40) + " " + (gy - 58) + "v12M" + (x1 - 28) + " " + (gy - 58) + 'v12" stroke="#f4efe2" stroke-width="3"/>';
      house += '<rect x="' + (x1 - 30) + '" y="' + (top - 38) + '" width="14" height="24" fill="#a39a86"' + INKs + '/>' + smoke(x1 - 23, top - 40);
      peakY = top - 52;
    } else if (lv === 2) {
      var h2 = 132; top = gy - h2;
      house += wallR(x0, gy - 66, WW, 66) + '<rect x="' + (x0 - 10) + '" y="' + top + '" width="' + (WW + 20) + '" height="66" fill="' + K.wall + '"' + INKs + '/>' + (K.brick ? '<rect x="' + (x0 - 10) + '" y="' + top + '" width="' + (WW + 20) + '" height="66" fill="url(#rybrk)" opacity=".7"/>' : "");
      house += '<path d="M' + (x0 - 10) + " " + (gy - 66) + "h" + (WW + 20) + '" stroke="#5a4a3a" stroke-width="6"/>';
      house += roofP(x0 - 10, x1 + 10, top, 56, false);
      house += [0, 1, 2].map(function (i) { return winR(x0 + 14 + i * (WW - 60) / 2, top + 14, 22, 36, true, false); }).join("");
      house += winR(x0 + 14, gy - 52, 28, 30, true, false) + winR(x1 - 64, gy - 52, 28, 30, true, false);
      house += stoneR(dx - 7, gy - doorH - 6, doorW + 14, doorH + 6, "#cfc6b0") + doorR(dx, doorW, doorH) + stoneR(dx - 10, gy - 4, doorW + 20, 6, "#bdb4a0");
      house += '<rect x="' + (x1 - 28) + '" y="' + (top - 40) + '" width="14" height="26" fill="#a39a86"' + INKs + '/>' + '<rect x="' + (x0 + 30) + '" y="' + (top - 36) + '" width="14" height="22" fill="#a39a86"' + INKs + '/>' + smoke(x1 - 21, top - 42);
      peakY = top - 56;
    } else if (lv === 3) {
      var h3 = 146; top = gy - h3;
      house += stoneR(x0, gy - 40, WW, 40, "#c9c0aa") + wallR(x0, top, WW, h3 - 40);
      house += roofP(x0, x1, top, 60, false);
      house += [0, 1, 2].map(function (i) { return '<g transform="translate(' + (x0 + 36 + i * (WW - 100) / 2) + ',' + (top - 14) + ')"><path d="M-12 14V-6L0 -22L12 -6V14Z" fill="' + K.wall + '"' + INKs + '/><path d="M-16 -4L0 -26L16 -4Z" fill="' + roofC + '"' + INKs + '/>' + winR(-6, -4, 12, 16, true, true) + "</g>"; }).join("");
      house += [0, 1, 2].map(function (i) { return winR(x0 + 20 + i * (WW - 66) / 2, top + 26, 24, 38, true, false); }).join("");
      house += [0, 1].map(function (i) { return winR(x0 + 20 + i * (WW - 66), gy - 34, 24, 26, true, false); }).join("");
      house += '<rect x="' + (dx - 24) + '" y="' + (gy - doorH - 34) + '" width="' + (doorW + 48) + '" height="5" fill="#bdb4a0"' + INKs + '/><path d="M' + (dx - 20) + " " + (gy - doorH - 30) + "v10M" + (dx - 10) + " " + (gy - doorH - 30) + "v10M" + (dx + doorW + 10) + " " + (gy - doorH - 30) + "v10M" + (dx + doorW + 20) + " " + (gy - doorH - 30) + 'v10" stroke="' + INK + '" stroke-width="2"/>';
      house += stoneR(dx - 7, gy - doorH - 6, doorW + 14, doorH + 6, "#cfc6b0") + doorR(dx, doorW, doorH);
      /* krídlo */
      house += wallR(x1, gy - 100, 90, 100) + roofP(x1 - 2, x1 + 92, gy - 100, 40, false) + winR(x1 + 14, gy - 82, 22, 30, true, false) + winR(x1 + 54, gy - 82, 22, 30, true, false) + winR(x1 + 34, gy - 40, 22, 26, true, false);
      house += '<rect x="' + (x1 - 20) + '" y="' + (top - 46) + '" width="16" height="30" fill="#a39a86"' + INKs + '/>' + smoke(x1 - 12, top - 48);
      x1 += 90; peakY = top - 60;
    } else if (lv === 4) {
      var h4 = 168; top = gy - h4;
      house += stoneR(x0, gy - 56, WW, 56, "#cfc6b0") + wallR(x0, top, WW, h4 - 56);
      house += '<path d="M' + (x0 - 6) + " " + (top + 2) + "H" + (x1 + 6) + '" stroke="#bdb4a0" stroke-width="7"/>' + crenel(x0 - 6, top, WW + 12, "#d9d1bb");
      house += roofP(x0 + 20, x1 - 20, top - 6, 44, false);
      for (var q = 0; q < 6; q++) house += '<rect x="' + (x0 + 2 + q * (WW - 10) / 5) + '" y="' + (top + 4) + '" width="8" height="' + (h4 - 4) + '" fill="#d9d1bb" opacity=".8" stroke="' + INK + '" stroke-width=".7"/>';
      house += [0, 1, 2, 3].map(function (i) { return winR(x0 + 30 + i * (WW - 84) / 3, top + 22, 22, 34, true, false); }).join("");
      house += [0, 1, 2, 3].filter(function (i) { return Math.abs(x0 + 30 + i * (WW - 84) / 3 - dx) > 24; }).map(function (i) { return winR(x0 + 30 + i * (WW - 84) / 3, gy - 112 + 40, 22, 34, true, false); }).join("");
      house += '<rect x="' + (dx - 34) + '" y="' + (gy - doorH - 34) + '" width="' + (doorW + 68) + '" height="6" fill="#d9d1bb"' + INKs + '/><path d="M' + (dx - 30) + " " + (gy - doorH - 28) + "v12M" + (dx - 18) + " " + (gy - doorH - 28) + "v12M" + (dx + doorW + 18) + " " + (gy - doorH - 28) + "v12M" + (dx + doorW + 30) + " " + (gy - doorH - 28) + 'v12" stroke="' + INK + '" stroke-width="2.4"/>';
      house += stoneR(dx - 8, gy - doorH - 6, doorW + 16, doorH + 6, "#d9d1bb") + doorR(dx, doorW, doorH);
      house += stoneR(x0 - 6, gy - 8, WW + 12, 8, "#bdb4a0");
      peakY = top - 50;
    } else if (lv === 5) {
      var h5 = 150; top = gy - h5;
      house += stoneR(x0, top, WW, h5, "#c2b9a3") + crenel(x0 - 4, top, WW + 8, "#d0c7b1");
      house += [0, 1, 2].map(function (i) { return '<path d="M' + (x0 + 34 + i * 80) + " " + (top + 30) + 'v22" stroke="' + INK + '" stroke-width="4"/>'; }).join("") + winR(x0 + 150, top + 28, 20, 30, true, true);
      house += '<path d="M' + (dx - 4) + " " + gy + "V" + (gy - doorH - 8) + "A" + (doorW / 2 + 4) + " " + (doorW / 2 + 4) + " 0 0 1 " + (dx + doorW + 4) + " " + (gy - doorH - 8) + "V" + gy + 'Z" fill="#cfc6b0"' + INKs + '/>' + doorR(dx, doorW, doorH);
      var tx = x1 - 8; /* veža */
      house += stoneR(tx, gy - 220, 76, 220, "#b8af99") + cone(tx + 38, gy - 220, 70, 62) + winR(tx + 28, gy - 190, 18, 28, true, true) + winR(tx + 28, gy - 130, 18, 28, true, true);
      house += '<path d="M' + (tx + 26) + " " + gy + "v-26h24v26" + '" fill="#2a2118"' + INKs + '/>';
      x1 = tx + 76; peakX = tx + 38; peakY = gy - 282; flagAt = [tx + 38, gy - 282];
      house += stoneR(x0 - 70, gy - 70, 70, 70, "#b8af99") + crenel(x0 - 72, gy - 70, 74, "#d0c7b1");
    } else {
      /* hrad */
      var kx = x0 + 80, kw = 200;
      house += stoneR(x0 - 30, gy - 72, WW + 60, 72, "#b8af99") + crenel(x0 - 32, gy - 72, WW + 64, "#d0c7b1");
      house += stoneR(kx, gy - 190, kw, 190, "#c2b9a3") + crenel(kx - 4, gy - 190, kw + 8, "#d0c7b1");
      house += [0, 1, 2].map(function (i) { return winR(kx + 30 + i * 62, gy - 150, 20, 34, true, true); }).join("") + [0, 1].map(function (i) { return winR(kx + 62 + i * 62, gy - 100, 18, 28, true, true); }).join("");
      house += '<path d="M' + (kx + kw / 2 - 40) + " " + gy + "V" + (gy - 76) + "A40 40 0 0 1 " + (kx + kw / 2 + 40) + " " + (gy - 76) + "V" + gy + 'Z" fill="#cfc6b0"' + INKs + '/><path d="M' + (kx + kw / 2 - 30) + " " + gy + "V" + (gy - 70) + "A30 30 0 0 1 " + (kx + kw / 2 + 30) + " " + (gy - 70) + "V" + gy + 'Z" fill="#241a12" stroke="' + INK + '"/><path d="M' + (kx + kw / 2 - 30) + " " + (gy - 40) + "H" + (kx + kw / 2 + 30) + "M" + (kx + kw / 2 - 20) + " " + (gy - 66) + "V" + gy + "M" + (kx + kw / 2 - 8) + " " + (gy - 74) + "V" + gy + "M" + (kx + kw / 2 + 8) + " " + (gy - 74) + "V" + gy + "M" + (kx + kw / 2 + 20) + " " + (gy - 66) + 'V' + gy + '" stroke="#6a6a70" stroke-width="2"/>';
      [x0 - 40, x1 + 4].forEach(function (tx, i) {
        house += stoneR(tx, gy - 170, 56, 170, "#b8af99") + cone(tx + 28, gy - 170, 52, 56) + winR(tx + 19, gy - 140, 16, 26, true, true) + winR(tx + 19, gy - 90, 16, 26, true, true);
        house += flag(tx + 28, gy - 226, .8);
      });
      house += stoneR(kx + kw, gy - 210, 0, 0, "#b8af99");
      top = gy - 190; peakX = kx + kw / 2; peakY = gy - 190; flagAt = [kx + kw / 2, gy - 190];
      x1 = x1 + 60; x0 = x0 - 40;
      house += '<path d="M' + (kx + 6) + " " + (gy - 190) + 'v-14h40" stroke="none"/>' + '<g>' + [kx + 4, kx + kw - 24].map(function (x) { return '<rect x="' + x + '" y="' + (gy - 218) + '" width="20" height="28" fill="#b8af99"' + INKs + '/>' + cone(x + 10, gy - 218, 20, 24); }).join("") + "</g>";
    }
    /* erb nad dverami */
    var armsSvg = "", ax, ay;
    if (lv === 0) { ax = dx + doorW + 8; ay = gy - 56; }
    else if (lv === 5 || lv === 6) { ax = (lv === 6 ? dx + 20 + 10 : dx + doorW / 2) - 10 * ARMSK + (lv === 6 ? 18 : 0); ay = gy - doorH - 12 - 24 * ARMSK; if (lv === 6) { ax = x0 + 80 + 100 - 10 * ARMSK; ay = gy - 190 + 14; } }
    else { ax = dx + doorW / 2 - 10 * ARMSK; ay = gy - doorH - 12 - 24 * ARMSK; if (lv >= 3) ay -= 14; }
    armsSvg = '<g><rect x="' + (ax - 4) + '" y="' + (ay - 4) + '" width="' + (20 * ARMSK + 8) + '" height="' + (24 * ARMSK + 8) + '" rx="3" fill="rgba(246,238,214,.55)" stroke="#8f6211" stroke-width="1"/>' + shG(d.id, ax, ay, ARMSK) + "</g>";
    house += armsSvg;
    /* lampy pri dverách */
    if (lv >= 1) house += lantern(dx - 12, gy - doorH + 6) + lantern(dx + doorW + 12, gy - doorH + 6);
    else house += lantern(dx - 8, gy - doorH + 4);
    /* vlajka */
    if (lv >= 1 && lv !== 6) house += flag(flagAt ? flagAt[0] : peakX, flagAt ? flagAt[1] : peakY, lv >= 4 ? 1.1 : .9);
    else if (lv === 6) house += flag(flagAt[0], flagAt[1] - 40, 1.2);
    if (lv === 4 || lv === 3) house += '<g stroke="#2b2117" stroke-width="1.6">' + Array.from({ length: 18 }, function (_, i) { return '<path d="M' + (x0 - 14 + i * ((x1 - x0 + 28) / 17)) + " " + (gy + 6) + 'v-14"/>'; }).join("") + '</g><path d="M' + (x0 - 14) + " " + (gy - 4) + "H" + (x1 + 14) + '" stroke="#2b2117" stroke-width="2"/>';

    /* ---------- prístavby ---------- */
    var ann = "";
    if (has("stajne")) {
      ann += '<g><rect x="30" y="' + (gy - 56) + '" width="96" height="56" fill="#9a7a4a"' + INKs + '/><rect x="30" y="' + (gy - 56) + '" width="96" height="56" fill="url(#rypln)"/><path d="M22 ' + (gy - 56) + "L78 " + (gy - 86) + "L134 " + (gy - 56) + 'Z" fill="' + (snow ? "#eef3f6" : "#b89a4e") + '"' + INKs + '/><path d="M22 ' + (gy - 56) + "L78 " + (gy - 86) + "L134 " + (gy - 56) + 'Z" fill="url(#rythk)" opacity=".6"/><path d="M52 ' + gy + "V" + (gy - 40) + "H104V" + gy + '" fill="#241a12" stroke="' + INK + '"/>' +
        '<g transform="translate(78,' + gy + ')"><path d="M-22 -2L-26 -16H-14L-8 -30H-1L3 -14H18L24 -4H16L12 0Z" fill="#6b4423" stroke="' + INK + '"><animateTransform attributeName="transform" type="rotate" values="0 0 0;-2 0 0;0 0 0" dur="3s" repeatCount="indefinite"/></path><circle cx="-24" cy="-18" r="4.6" fill="#6b4423" stroke="' + INK + '"/></g></g>';
    }
    var rx = x1 + 12;
    if (has("kaplnka")) {
      ann += '<g>' + stoneR(rx, gy - 88, 66, 88, "#d0c7b1") + '<path d="M' + (rx - 6) + " " + (gy - 88) + "L" + (rx + 33) + " " + (gy - 124) + "L" + (rx + 72) + " " + (gy - 88) + 'Z" fill="' + (snow ? "#eef3f6" : "#4f5d78") + '"' + INKs + '/><path d="M' + (rx + 33) + " " + (gy - 124) + "v-18M" + (rx + 26) + " " + (gy - 136) + 'h14" stroke="#e2b85a" stroke-width="3"/><path d="M' + (rx + 20) + " " + gy + "V" + (gy - 34) + "A13 13 0 0 1 " + (rx + 46) + " " + (gy - 34) + "V" + gy + 'Z" fill="#241a12" stroke="' + INK + '"/>' + winR(rx + 24, gy - 74, 18, 24, true, true) + "</g>";
      rx += 78;
    }
    if (has("sien")) {
      ann += '<g>' + wallR(rx, gy - 76, 112, 76) + roofP(rx, rx + 112, gy - 76, 34, false) + [0, 1, 2].map(function (i) { return winR(rx + 14 + i * 34, gy - 62, 20, 36, true, true); }).join("") + "</g>";
      rx += 124;
    }
    if (has("veza")) {
      ann += '<g>' + stoneR(rx, gy - 190, 54, 190, "#b8af99") + crenel(rx - 3, gy - 190, 60, "#d0c7b1") + '<path d="M' + (rx - 2) + " " + (gy - 190) + "L" + (rx + 27) + " " + (gy - 226) + "L" + (rx + 56) + " " + (gy - 190) + 'Z" fill="' + (snow ? "#eef3f6" : "#6f4a3a") + '"' + INKs + '/>' + winR(rx + 18, gy - 160, 16, 26, true, true) + winR(rx + 18, gy - 110, 16, 26, true, true) + flag(rx + 27, gy - 226, .8) + "</g>";
      rx += 66;
    }
    if (has("kniznica")) {
      ann += '<g transform="translate(' + (x0 + WW * .72) + "," + (gy - 150) + ')"><rect x="-13" y="-4" width="26" height="40" rx="13" fill="#e3be4f" stroke="' + INK + '"/><rect x="-9" y="0" width="18" height="32" rx="9" fill="' + (lit ? "#ffd37a" : "#7a9cc4") + '" stroke="' + INK + '" stroke-width=".8"/><path d="M-6 8H6M-6 16H6M-6 24H6" stroke="#5a3a20" stroke-width="2.4"/></g>';
    }
    /* ---------- popredie: záhrada, stromy ---------- */
    var fore = "";
    fore += tree(60, 296, 1.2) + tree(840, 292, 1.1);
    if (lv >= 2) fore += tree(rx > 780 ? 800 : Math.min(840, rx + 20), 292, .9);
    if (has("zahrada")) {
      fore += '<g transform="translate(110,282)"><ellipse cx="0" cy="8" rx="38" ry="11" fill="#9bb56a" opacity=".6"/><ellipse cx="0" cy="4" rx="26" ry="8" fill="#a39a86" stroke="' + INK + '"/><ellipse cx="0" cy="2" rx="20" ry="5.5" fill="#6fa8d8"/><rect x="-3" y="-16" width="6" height="18" fill="#a39a86" stroke="' + INK + '" stroke-width=".8"/>' + [-1, 0, 1].map(function (i) { return '<path d="M0 -16Q' + (i * 14) + ' -30 ' + (i * 18) + ' -8" fill="none" stroke="#bfe0f6" stroke-width="2" opacity=".9"><animate attributeName="opacity" values=".4;1;.4" dur="' + (1.2 + i * .3) + 's" repeatCount="indefinite"/></path>'; }).join("") + "</g>";
      fore += [0, 1, 2, 3, 4].map(function (i) { return '<circle cx="' + (176 + i * 22) + '" cy="' + (290 + (i % 2) * 6) + '" r="9" fill="' + (se === 3 ? "#e8eef2" : leaf) + '" stroke="' + INK + '" stroke-width=".8"/>' + (se < 3 ? '<circle cx="' + (176 + i * 22) + '" cy="' + (287 + (i % 2) * 6) + '" r="2.4" fill="' + ["#e0507a", "#f4d03a", "#fff", "#c06ae0", "#ff8a3a"][i] + '"/>' : ""); }).join("");
    }
    /* ---------- rodina ---------- */
    var fam = [];
    if (d.head && !d.head.dd) fam.push({ p: d.head, role: "head" });
    if (d.spouse && !d.spouse.dd) fam.push({ p: d.spouse, role: "spouse" });
    (d.kids || []).filter(function (k) { return k && !k.dd; }).slice(0, 4).forEach(function (k) { fam.push({ p: k, role: "kid" }); });
    var figs = "", n = fam.length, stepX = n > 1 ? 68 : 0, cxm = lv === 6 ? 340 : x0 + (x1 - x0) / 2, startX = Math.max(60, Math.min(cxm - (n - 1) * stepX / 2, 800 - (n - 1) * stepX));
    fam.forEach(function (e, i) { figs += placeFig(figOf(d, e, {}), startX + i * stepX, 328, 1); });
    var wash = ph === 0 ? "rgba(255,214,140,.25)" : ph === 2 ? "rgba(214,96,28,.22)" : ph === 3 ? "rgba(14,24,60,.3)" : "";
    var over = "";
    if (wash) over += '<rect y="-50" width="' + W + '" height="' + (H + 50) + '" fill="' + wash + '" pointer-events="none"/>';
    if (snow) over += '<rect y="-50" width="' + W + '" height="' + (H + 50) + '" fill="rgba(255,255,255,.1)"/>' + Array.from({ length: 28 }, function (_, i) { return '<circle cx="' + (i * 31 % W) + '" cy="0" r="2" fill="#fff" opacity=".85"><animate attributeName="cy" from="-6" to="' + H + '" dur="' + (5 + i % 5) + 's" begin="-' + (i % 7) + 's" repeatCount="indefinite"/></circle>'; }).join("");
    if (wx === "búrka" || wx === "dážď") over += '<rect y="-50" width="' + W + '" height="' + (H + 50) + '" fill="rgba(42,58,78,.3)"/>' + Array.from({ length: 30 }, function (_, i) { return '<path d="M' + (10 + i * 29) + ' 0l-6 16" stroke="rgba(226,236,244,.6)" stroke-width="1.2"><animateTransform attributeName="transform" type="translate" from="0 -20" to="-14 ' + H + '" dur="' + (.8 + i % 4 * .15) + 's" begin="-' + (i % 5 * .2) + 's" repeatCount="indefinite"/></path>'; }).join("");
    var title = d.name, hName = (HOUSES[lv] || {}).n || "";
    var cn = ""; try { cn = CITY(d.city != null ? d.city : S.ci).n; } catch (e) { }
    var txt = '<g transform="translate(0,-44)"><rect x="12" y="10" width="' + (Math.max(String(title).length * 14, 150) + 20) + '" height="52" rx="4" fill="rgba(246,238,214,.72)" stroke="#8f6211" stroke-width=".8"/><text x="24" y="36" font-family="Almendra SC,serif" font-size="24" fill="' + INK + '">' + esc2(title) + '</text><text x="24" y="54" font-family="EB Garamond,serif" font-style="italic" font-size="15" fill="#4a3a2a">' + esc2(hName) + (cn ? " · " + esc2(cn) : "") + "</text></g>";
    return '<div class="streetwrap"><svg class="street" viewBox="0 -50 ' + W + " " + (H + 50) + '" role="img" aria-label="' + esc2(title + ", " + hName) + '">' + s + ann + house + fore + figs + over + txt + "</svg></div>";
  }

  /* ============ SPRIEVOD RODOV ============ */
  function miniHouse(lv, K, c, base) {
    var w = [34, 40, 48, 54, 60, 52, 66][lv], h = [20, 30, 38, 42, 48, 40, 54][lv], x = -w / 2;
    var t = '<g opacity=".55"><rect x="' + x + '" y="' + (base - h) + '" width="' + w + '" height="' + h + '" fill="' + K.wall + '" stroke="' + INK + '" stroke-width="1"/>';
    if (lv >= 5) t += '<rect x="' + (w / 2 - 4) + '" y="' + (base - h - 22) + '" width="16" height="' + (h + 22) + '" fill="#b8af99" stroke="' + INK + '"/><path d="M' + (w / 2 - 7) + " " + (base - h - 22) + "L" + (w / 2 + 4) + " " + (base - h - 38) + "L" + (w / 2 + 15) + " " + (base - h - 22) + 'Z" fill="' + K.roof + '" stroke="' + INK + '"/>';
    else t += '<path d="M' + (x - 5) + " " + (base - h) + "L0 " + (base - h - 16) + "L" + (-x + 5) + " " + (base - h) + 'Z" fill="' + K.roof + '" stroke="' + INK + '"/>';
    return t + '<rect x="-4" y="' + (base - 14) + '" width="8" height="14" fill="#3a2a1a"/></g>';
  }
  function procession() {
    var C = CC();
    var rows = S.dyn.filter(function (d) { return d && !d.royal && !d.gone && (d.city === C.id || d.id === 0); }).sort(function (a, b) { return prestige(b) - prestige(a); }).slice(0, 6);
    if (!rows.length) return "";
    var gap = 212, w = 24 + rows.length * gap, body = "";
    body += defsSvg();
    rows.forEach(function (d, i) {
      var x = 20 + i * gap, lv = cl(d.house | 0, 0, 6), K = styleOf(d), dc = dcol(d.id), cx = 96;
      var g = '<g transform="translate(' + x + ',0)">';
      g += '<path d="M6 10H186" stroke="#5a3a20" stroke-width="4" stroke-linecap="round"/><circle cx="6" cy="10" r="3.4" fill="#e3be4f"/><circle cx="186" cy="10" r="3.4" fill="#e3be4f"/>';
      g += '<path d="M24 11H168V72L96 98L24 72Z" fill="' + dc + '" stroke="#e3be4f" stroke-width="2.4"><animate attributeName="d" values="M24 11H168V72L96 98L24 72Z;M24 11H168V70L96 102L24 74Z;M24 11H168V72L96 98L24 72Z" dur="4s" repeatCount="indefinite"/></path><path d="M30 17H162V69L96 92L30 69Z" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1"/>';
      g += '<rect x="' + (cx - 26) + '" y="24" width="52" height="58" rx="5" fill="rgba(246,238,214,.75)" stroke="#8f6211"/>' + shG(d.id, cx - 21, 28, 2.1);
      g += '<g transform="translate(' + cx + ',0)">' + miniHouse(lv, K, dc, 226) + "</g>";
      g += '<path d="M40 222H152L146 234H46Z" fill="#cfc6b0" stroke="' + INK + '"/><ellipse cx="96" cy="222" rx="56" ry="8" fill="#e0d8c4" stroke="' + INK + '"/>';
      var fam = [];
      if (d.head && !d.head.dd) fam.push({ p: d.head, role: "head" });
      if (d.spouse && !d.spouse.dd && d.title >= 1) fam.push({ p: d.spouse, role: "spouse" });
      var px = fam.length > 1 ? [76, 124] : [96];
      fam.forEach(function (e, j) { g += placeFig(figOf(d, e, { name: "", sub: "" }), px[j], 222, j ? .78 : .86); });
      var hd = d.head || {};
      g += '<text x="96" y="254" text-anchor="middle" font-family="Almendra SC,serif" font-size="15" fill="' + INK + '">' + esc2(d.name) + '</text>';
      var tn = ""; try { tn = TITLES[d.title].n; } catch (e) { }
      g += '<text x="96" y="269" text-anchor="middle" font-family="EB Garamond,serif" font-style="italic" font-size="12" fill="#4a3a2a">' + esc2((hd.name || "") + (tn ? " · " + tn : "")) + "</text>";
      var fw = d.id === 0 ? "" : favW(d.favor);
      g += '<text x="96" y="284" text-anchor="middle" font-family="EB Garamond,serif" font-size="12" fill="#7a1f18">' + esc2(((HOUSES[lv] || {}).n || "") + (fw ? " · " + fw : "")) + "</text>";
      body += g + "</g>";
    });
    return '<div class="lifewrap"><svg class="sprievod ry" viewBox="0 0 ' + w + ' 292" style="height:300px!important" role="img" aria-label="Sprievod rodov">' + body + "</svg></div>";
  }

  /* ============ NAPOJENIE ============ */
  var oLP = window.lotPanel;
  if (typeof oLP === "function") {
    window.lotPanel = function () {
      var h = oLP.apply(this, arguments);
      try {
        if (S.sel != null) {
          var l = S.lots[S.sel];
          if (l && l.res != null) {
            var d = S.dyn[l.res];
            if (d && d.head) h = h.replace(/<div class="streetwrap">[\s\S]*?<\/svg><\/div>/, function () { return seat(d, l); });
          }
        }
      } catch (e) { console.warn("rody sídlo", e); }
      return h;
    };
  }
  var oM = window.vMesto;
  if (typeof oM === "function") {
    window.vMesto = function () {
      var h = oM.apply(this, arguments);
      try { h = h.replace(/<div class="lifewrap"><svg class="sprievod"[\s\S]*?<\/svg><\/div>/, function () { return procession(); }); } catch (e) { console.warn("rody sprievod", e); }
      return h;
    };
  }
  window.RODY = { fig: fig, seat: seat, procession: procession, placeFig: placeFig, figOf: figOf };
})();

;
