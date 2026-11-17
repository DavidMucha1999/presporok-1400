# Ako upravovať hru

1. **Upravuj súbory v `zdroj/`**, nie `js/hra.js`. Každý modul je samostatný súbor a číslo na začiatku názvu určuje poradie (`01-game.js` … `37-dielnescena.js`, posledný je `99-zaver.js`). Nový modul pomenuj číslom medzi 37 a 99, napríklad `38-novymodul.js`.
2. **Zostav hru:**
   ```
   node nastroje/zostav.js
   ```
   Skript skontroluje syntax každého modulu, spojí ich do `js/hra.js` a ak sa niečo zmenilo, zvýši `js/hra.js?v=N` v `index.html`. Ak nájde chybu, vypíše, v ktorom module je, a `js/hra.js` nechá tak. Zároveň v `index.html` obnoví záložný zoznam modulov: keby sa `js/hra.js` nenačítal, hra sa načíta z `zdroj/` po jednom module.
3. **Skontroluj sekcie:** otvor hru s adresou `index.html?kontrola` (napríklad `http://localhost:8417/?kontrola`). Po spustení hry kontrola prejde všetky sekcie a podsekcie a ukáže tabuľku nálezov. Overí chyby pri vykreslení, či sa dá kliknúť na každé miesto v scéne, či je panel celý v okne a či z neho nič nepretŕča. Nakoniec otvorí 3D mesto a overí, že sa postaví bez chyby a vykreslí, že každý pozemok z mapy má v 3D svoje miesto, že sa budovy neprekrývajú, že sa dá dôjsť ku každej budove a postave, že sa otvoria panely rozhovorov (objednávateľ, hlásnik, stánky, hlavy rodov) a že funguje pohľad z výšky. Ukáže aj FPS. 3D časť sa dá vynechať adresou `?kontrola&bez3d`. Uloženú hru nemení. Pre inú veľkosť okna zmeň okno a obnov stránku.
4. **Ulož verziu do gitu:**
   ```
   git add -A
   git commit -m "čo sa zmenilo"
   ```
   Staršiu verziu nájdeš cez `git log`, rozdiely cez `git diff`.
