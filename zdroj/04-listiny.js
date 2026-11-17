/* ==== js/listiny.js ==== */
/* Prešporok 1400 – okná ako listiny: pečať s erbom rodu, zvitkové tyče a datovanie v rímskych číslach. Autor a vývojár: Dávid Mucha. */
(function () {
  "use strict";
  var modal = document.getElementById("modal"), body = document.getElementById("mbody");
  function rod(cls) { var d = document.createElement("div"); d.className = "rod " + cls; d.setAttribute("aria-hidden", "true"); return d; }
  function dress() {
    if (modal.hidden) return;
    var wrap = modal.querySelector(".mwrap"), mbox = modal.querySelector(".mbox");
    if (wrap && mbox && !wrap.querySelector(".rod")) {
      wrap.insertBefore(rod("rod-t"), mbox);
      wrap.appendChild(rod("rod-b"));
    }
    if (!S) return;
    var seal = modal.querySelector(".seal");
    if (seal) {
      var arms = null; try { arms = armsOf(0); } catch (e) { }
      var key = JSON.stringify(arms);
      if (seal.dataset.arms !== key) { try { seal.innerHTML = shield(0, 30, arms); seal.dataset.arms = key; } catch (e) { } }
    }
    if (body && !body.querySelector(".datel,.gm") && body.querySelector("h2")) {
      var p = document.createElement("p");
      p.className = "datel";
      try { p.textContent = "Dané v meste " + CITY(P().city).n + ", " + SEASONS[S.season].toLowerCase() + " Pána " + ROMAN(S.year) + " · rod " + P().name; } catch (e) { return; }
      body.appendChild(p);
    }
  }
  new MutationObserver(dress).observe(modal, { attributes: true, attributeFilter: ["hidden"], childList: true, subtree: true });
})();

;
