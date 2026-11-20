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
- **3D mesto** – prechádzka mestom s budovami presne podľa mapy: vstup do dielní a sídiel, trh so stánkami, rozhovory s hlavami rodov, zákazky na námestí, mešťania, ktorí chodia, pozerajú sa na teba, zdravia a rozprávajú sa, deň a noc, počasie a pohľad z výšky.

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
- **Postavy:** sú celé generované v kóde, bez externých modelov. Telo je jeden hladký povrch s kostrou (SkinnedMesh), takže sa lakte, kolená, plecia a krk ohýbajú plynulo. Hlava je tvarovaná (obočie, očné jamky, lícne kosti, nos, brada) podľa pohlavia, veku a variantu a tvár je namaľovaná do textúry s výrazmi (žmurknutie, úsmev, reč) a vráskami podľa veku. Vlasy sú z prameňov, ruky majú prsty, postavy majú rôznu stavbu tela (chudé, zavalité, s bruchom), dobovú obuv a deti vlastné proporcie. Odev je vo vrstvách podľa role a bohatstva (košeľa, zástera, kapucňa s pelerínou, závoj, klobúky, gombíky, kožušina) so záhybmi, textúrou látky, zatienením v záhyboch a jemným svetlým obrysom podľa dennej doby. Chôdza sa počíta zo skutočnej rýchlosti, aby nohy nekĺzali, telo pri kroku klesá a kolíše, ruky sa kývu s oneskorením. V stoji postavy dýchajú, prenášajú váhu, obzerajú sa, pozerajú na hráča a zdravia ho. Pelerína, plášť, zástera, dlhé vlasy a závoj sa hýbu na pružine s oneskorením pri chôdzi, otáčaní a vo vetre. V rozhovore postavy gestikulujú, chodci nosia vrecia a vedrá na jarme a deti behajú. Pod každou postavou je mäkký kontaktný tieň. Chodci sa obchádzajú a postavy v diaľke sa animujú zriedkavejšie.
- **3D mesto:** stavia sa z tých istých údajov ako 2D mapa (ulice, hradby, pozemky a budovy na nich), takže vždy zodpovedá hre. Používa vlastné spracovanie obrazu (HDR, ACES, opar, bloom, tiene oblakov, mokrá zem z hĺbkovej mapy). Pre výkon zlučuje nehybné objekty (asi 930 do 100), skrýva drobnosti v diaľke a mení rozlíšenie podľa FPS. Vykresľovacích volaní je tak o 25–37 % menej.

## Technické údaje

- Čistý JavaScript, HTML a CSS bez frameworku. 3D mesto používa [three.js](https://threejs.org/) (r128) s vlastným spracovaním obrazu (HDR, tone mapping, bloom, tiene oblakov) a optimalizáciou vykresľovania (zlučovanie geometrie, úroveň detailu, dynamické rozlíšenie).
- Zdrojový kód je rozdelený do modulov v priečinku `zdroj/`. Skript `node nastroje/zostav.js` ich skontroluje, spojí do `js/hra.js` a zvýši verziu v `index.html`.
- Automatická kontrola (`index.html?kontrola`) prejde všetky sekcie hry aj 3D mesto a nahlási chyby vykreslenia, zakryté ovládanie, presahujúce panely, prekrývajúce sa budovy a nedostupné miesta.
- Postup hry sa ukladá len v prehliadači hráča.
- Kód vznikal s pomocou AI nástrojov.

Autor: Dávid Mucha
