# Ako upravovať hru

1. **Upravuj súbory v `zdroj/`**, nie `js/hra.js`. Každý modul je samostatný súbor a číslo na začiatku názvu určuje poradie (`01-game.js` … `38-hra3d.js`, posledný je `99-zaver.js`). Nový modul pomenuj číslom medzi 38 a 99, napríklad `39-novymodul.js`. Hra beží len v 3D: rámec celej hry (úvodná obrazovka, kniha rodu, ponuka, návod) je v `38-hra3d.js`, 3D mesto v `35-mesto3d.js`. Pôvodné 2D panely sa ukazujú už iba ako stránky knihy.
2. **Zostav hru:**
   ```
   node nastroje/zostav.js
   ```
   Skript skontroluje syntax každého modulu, spojí ich do `js/hra.js` a ak sa niečo zmenilo, zvýši `js/hra.js?v=N` v `index.html`. Ak nájde chybu, vypíše, v ktorom module je, a `js/hra.js` nechá tak. Zároveň v `index.html` obnoví záložný zoznam modulov: keby sa `js/hra.js` nenačítal, hra sa načíta z `zdroj/` po jednom module.
3. **Skontroluj hru:** otvor hru s adresou `index.html?kontrola` (napríklad `http://localhost:8417/?kontrola`). Treba mať uloženú hru, kontrola sa spustí po jej načítaní a ukáže tabuľku nálezov. Overí lištu 3D mesta a návod, ponuku (Esc) a potom každú záložku knihy rodu aj s podsekciami: či sa otvorí bez chyby, či je stránka celá v okne, či ju neprekrývajú záložky a či z nej nič nepretŕča. Záložky inštitúcií (Svet, Radnica, …) skontroluje, len keď sú odomknuté (rok 1405 alebo titul). Nakoniec postaví 3D mesto nanovo a overí, že sa vykreslí, že každý pozemok z mapy má v 3D svoje miesto, že sa budovy neprekrývajú, že sa dá dôjsť ku každej budove a postave, že sa otvoria panely rozhovorov a že funguje pohľad z výšky. Ukáže aj FPS. 3D mesto sa dá vynechať adresou `?kontrola&bez3d`. Uloženú hru nemení. Pre inú veľkosť okna zmeň okno a obnov stránku. Ručne sa dá spustiť v konzole príkazom `KONTROLA()`.
4. **Ulož verziu do gitu:**
   ```
   git add -A
   git commit -m "čo sa zmenilo"
   ```
   Staršiu verziu nájdeš cez `git log`, rozdiely cez `git diff`.
