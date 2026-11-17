# Prešporok 1400

*[English version](README.en.md)*

Obchodná a dynastická hra zo stredovekej Európy, ktorá beží priamo v prehliadači na počítači.

**▶ [Spustiť hru](https://davidmucha1999.github.io/presporok-1400/)**

Netreba nič inštalovať. Hra je určená pre počítač s klávesnicou a myšou (Chrome, Edge alebo Firefox). Prvé načítanie trvá pár sekúnd.

## Čo v hre je

- **Obchod a remeslá** – dielne s remeslami a výrobnými reťazcami, robotníci, kvalita tovaru, sklady v mestách, karavány a ceny podľa ponuky a dopytu.
- **Mestá Európy roku 1400** – od Prešporku cez Viedeň, Budín, Krakov, Prahu, Norimberg a Benátky až po Paríž a Londýn, každé s vlastným pôdorysom.
- **Rod a rodina** – sídlo, ktoré rastie od chalupy po hrad, sobáše, deti a dedičia, rodokmeň a predkovia.
- **Politika a postup** – voľby v rade, mestské úrady, cirkev, dvor a tituly od slobodníka po kráľa.
- **Živé mesto** – ilustrované scény každej sekcie, ročné obdobia, počasie a udalosti v kronike.
- **3D mesto** – prechádzka mestom s budovami presne podľa mapy: vstup do dielní a sídiel, trh so stánkami, rozhovory s hlavami rodov, zákazky na námestí, deň a noc, počasie a pohľad z výšky.

## Ovládanie v skratke

| Režim | Klávesy |
|---|---|
| Hra | `1`–`9`, `0`, `-`, `=` karty, `M` mesto, `D` dielne, `T` trh, `R` rod, `Medzerník` ukončiť štvrťrok, `Z` vrátiť akciu, `F` celá obrazovka, `?` všetky skratky |
| 3D mesto | `W` `A` `S` `D` alebo šípky chôdza, `Shift` beh, ťahanie myšou pohľad, `E` použiť, `M` pohľad z výšky, `T` miesta, `Q` kvalita grafiky |

## Architektúra

```
zdroj/01-game.js … 37-dielnescena.js, 99-zaver.js   zdrojové moduly
        │  node nastroje/zostav.js
        ▼
js/hra.js  ──  index.html načíta jeden súbor (so záložným načítaním po moduloch)
nastroje/kontrola.js  ──  automatická kontrola rozhrania a 3D mesta (index.html?kontrola)
```

- **Moduly:** číslo v názve určuje poradie. `01-game.js` je jadro (stav hry, ekonomika, pravidlá, hlavné obrazovky, väčšina generovanej SVG grafiky). Ďalšie moduly pridávajú funkcie tak, že obalia existujúce funkcie, takže každá funkcia hry má vlastný súbor.
- **Stav a rozhranie:** celá hra je jeden objekt stavu `S`, ktorý sa ukladá skomprimovaný (lz-string) do `localStorage`. `render()` vykreslí rozhranie zo stavu, tlačidlá s atribútom `data-a` volajú akcie v objekte `A` a tie zmenia stav a vykreslia znova.
- **Grafika:** mapy miest, budovy, erby, portréty aj scény sa generujú v kóde ako SVG.
- **3D mesto:** stavia sa z tých istých údajov ako 2D mapa (ulice, hradby, pozemky a budovy na nich), takže vždy zodpovedá hre. Používa vlastné spracovanie obrazu (HDR, ACES, opar, bloom, tiene oblakov, mokrá zem z hĺbkovej mapy). Pre výkon zlučuje nehybné objekty (asi 930 do 100), skrýva drobnosti v diaľke a mení rozlíšenie podľa FPS. Vykresľovacích volaní je tak o 25–37 % menej.

## Technické údaje

- Čistý JavaScript, HTML a CSS bez frameworku. 3D mesto používa [three.js](https://threejs.org/) (r128) s vlastným spracovaním obrazu (HDR, tone mapping, bloom, tiene oblakov) a optimalizáciou vykresľovania (zlučovanie geometrie, úroveň detailu, dynamické rozlíšenie).
- Zdrojový kód je rozdelený do modulov v priečinku `zdroj/`. Skript `node nastroje/zostav.js` ich skontroluje, spojí do `js/hra.js` a zvýši verziu v `index.html`.
- Automatická kontrola (`index.html?kontrola`) prejde všetky sekcie hry aj 3D mesto a nahlási chyby vykreslenia, zakryté ovládanie, presahujúce panely, prekrývajúce sa budovy a nedostupné miesta.
- Postup hry sa ukladá len v prehliadači hráča.
- Kód vznikal s pomocou AI nástrojov.

Autor: Dávid Mucha
