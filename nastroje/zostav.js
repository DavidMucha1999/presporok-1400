// Zostaví js/hra.js zo súborov v zdroj/ (v poradí podľa čísla v názve)
// a ak sa výsledok zmenil, zvýši verziu js/hra.js?v=N v index.html.
// Použitie (v priečinku hry):  node nastroje/zostav.js
// Autor: Dávid Mucha.
const fs = require("fs"), path = require("path"), cp = require("child_process");
const root = path.join(__dirname, "..");
const dir = path.join(root, "zdroj"), out = path.join(root, "js", "hra.js"), idx = path.join(root, "index.html");

const files = fs.readdirSync(dir).filter(f => /^\d+-.+\.js$/.test(f)).sort();
if (!files.length) { console.error("V priečinku zdroj/ nie sú žiadne moduly."); process.exit(1); }
const bundle = files.map(f => fs.readFileSync(path.join(dir, f), "utf8")).join("");

// kontrola syntaxe každého modulu zvlášť (presnejšie hlásenie, kde je chyba) aj celku
const tmp = path.join(require("os").tmpdir(), "presporok-kontrola.js");
fs.writeFileSync(tmp, bundle);
try { cp.execFileSync(process.execPath, ["--check", tmp], { stdio: "pipe" }); }
catch (e) {
  for (const f of files) {
    try { cp.execFileSync(process.execPath, ["--check", path.join(dir, f)], { stdio: "pipe" }); }
    catch (e2) { console.error("Chyba syntaxe v zdroj/" + f + ":\n" + String(e2.stderr).split("\n").slice(0, 6).join("\n")); process.exit(1); }
  }
  console.error("Chyba syntaxe v zostavenom súbore:\n" + String(e.stderr).split("\n").slice(0, 6).join("\n")); process.exit(1);
}

const old = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : "";
if (old === bundle) { console.log("js/hra.js je aktuálny (" + files.length + " modulov), verzia sa nemení."); process.exit(0); }
fs.writeFileSync(out, bundle);

let html = fs.readFileSync(idx, "utf8"), v = null;
// záloha pri načítaní: ak by sa js/hra.js nenačítal, zavádzač načíta moduly zo zdroj/ jednotlivo
html = html.replace(/var FALL=\[(\["[^"]*lz-string[^"]*","[^"]*",true\]),[\s\S]*?\];var scripts=/, (m, lz) =>
  "var FALL=[" + [lz].concat(files.map(f => JSON.stringify(["zdroj/" + f + "?v=" + Date.now().toString(36), "Otvára sa kniha rodu…", false]))).join(",") + "];var scripts=");
html = html.replace(/js\/hra\.js\?v=(\d+)/, (m, n) => { v = +n + 1; return "js/hra.js?v=" + v; });
if (v === null) { console.error("V index.html sa nenašlo js/hra.js?v=N."); process.exit(1); }
fs.writeFileSync(idx, html);
console.log("Zostavené js/hra.js z " + files.length + " modulov (" + Math.round(bundle.length / 1024) + " kB), verzia v=" + v + ".");
