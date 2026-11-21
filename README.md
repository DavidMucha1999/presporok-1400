# Prešporok 1400

*[English version](README.en.md)*

Stredoveké RPG z Prešporka roku 1400, ktoré beží priamo v prehliadači na počítači. Začínaš ako sedliak bez majetku. Chodíš po 3D meste, prácu naozaj vykonávaš vlastnými rukami a postupne sa vypracuješ na remeselníka, mešťana s vlastným erbom a šľachtica.

**▶ [Spustiť hru](https://davidmucha1999.github.io/presporok-1400/)**

Netreba nič inštalovať. Hra je určená pre počítač s klávesnicou a myšou (Chrome, Edge alebo Firefox). Prvé načítanie trvá pár sekúnd.

## Čo v hre je

- **Deň za dňom** – hodiny plynú, kým chodíš po meste. Ráno, deň, večer a noc menia svetlo. Spánkom sa začne nový deň, ročné obdobie trvá 30 dní.
- **Hlad a únava** – najesť sa dá u pekárky na námestí, vyspať v senníku, v nocľahárni alebo doma.
- **Práca, ktorú naozaj robíš** – kosenie obilia na poli, oberanie hrozna vo vinohrade, rybolov na Dunaji, nosenie vriec pre kupca a pomocná práca v dielňach rodov. V dielňach sú tri druhy úkonov podľa remesla: údery v rytme, odhad správnej chvíle a poradie hmatov.
- **Zručnosti a remeslo** – prácou rastie zručnosť, tá zvyšuje mzdu a uľahčuje úkon. Nádenník sa dá prijať za tovariša a tovariš môže zložiť majstrovskú skúšku.
- **Hodnosti** – sedliak, nádenník, tovariš, majster, mešťan, radný, šľachtic. Vlastný erb dostaneš až s meštianskym právom.
- **Bývanie a majetok** – nocľaháreň, prenajatá izba, vlastná chalupa alebo dom a pre majstra vlastná dielňa s robotníkmi.
- **Veľký Prešporok** – mesto so 160 pozemkami a piatimi štvrťami: Okolie mesta, Podhradie, Remeselnícka štvrť, Trhová štvrť a prístav, Horné mesto. Do Horného mesta stráž sedliaka nepustí.
- **Mesto žije ďalej** – ceny na trhu, desať rodov, voľby a mestské úrady bežia na pozadí. Mešťanovi sa otvoria mestské knihy: radnica, rody, cirkev, dvor a kniha vlastného rodu so sobášom a dedičmi.

## Ovládanie v skratke

| Čo | Klávesy |
|---|---|
| Pohyb | `W` `A` `S` `D` alebo šípky chôdza, `Shift` beh, ťahanie myšou pohľad, koliesko priblíženie, `V` pohľad z očí, `M` pohľad z výšky |
| Hra | `E` použiť miesto alebo pracovať, `B` denník postavy, `T` miesta, `N` mapka, `Esc` ponuka (uloženie, nastavenia), `Q` kvalita grafiky |

Na začiatku hry ťa prvými krokmi prevedie návod.

## Architektúra

```
zdroj/01-game.js … 41-byvanie.js, 99-zaver.js   zdrojové moduly
        │  node nastroje/zostav.js
        ▼
js/hra.js  ──  index.html načíta jeden súbor (so záložným načítaním po moduloch)
nastroje/kontrola.js  ──  automatická kontrola hry (index.html?kontrola)
```

- **Moduly:** číslo v názve určuje poradie. Neskoršie moduly pridávajú funkcie tak, že obalia existujúce funkcie, takže každá časť hry má vlastný súbor.
- **RPG vrstva:** `39-rpg.js` (deň a hodiny, hlad, únava, spánok, veľké mesto so štvrťami, denník postavy, návod), `40-praca.js` (pracoviská a úkony, zručnosti, tovariš, majster) a `41-byvanie.js` (nocľaháreň, dom, vlastná dielňa, meštianske právo). Stav postavy je v `S.rpg`.
- **Pôvodné hospodárstvo:** hra vznikla ako obchodná a dynastická stratégia po štvrťrokoch. Jej pravidlá (ceny podľa ponuky a dopytu, rody, voľby, dielne s robotníkmi) ostali a bežia na pozadí, jedno kolo za 30 herných dní. Jej stránky sa ukazujú ako pergamen pri predmete v 3D meste.
- **Stav a rozhranie:** celá hra je jeden objekt stavu `S`, ktorý sa ukladá skomprimovaný (lz-string) do `localStorage`. Tlačidlá s atribútom `data-a` volajú akcie v objekte `A`.
- **3D mesto (`35-mesto3d.js`):** stavia sa z pôdorysu mesta, ktorý sa generuje z počtu pozemkov (ulice, hradby, brány, rieka). Používa vlastné spracovanie obrazu (HDR, ACES, opar, bloom, tiene oblakov, mokrá zem). Pre výkon zlučuje nehybné objekty, skrýva drobnosti v diaľke, mení rozlíšenie podľa FPS a na pomalom počítači si samo zníži kvalitu.
- **Postavy:** sú celé generované v kóde, bez externých modelov. Telo je jeden povrch s kostrou, hlava je tvarovaná podľa pohlavia a veku, tvár je namaľovaná do textúry s výrazmi, oči žmurkajú a pozerajú sa na hráča. Vlasy a brady sú z prameňov, odev je vo vrstvách podľa role a bohatstva. Chôdza sa počíta zo skutočnej rýchlosti, postavy dýchajú, obzerajú sa, zdravia a gestikulujú.
- **Pracoviská:** pole, vinohrad, rybár aj kupec s vozom sa stavajú do scény po každom postavení mesta a hľadajú si voľné miesto mimo ciest, vody a domov.

## Technické údaje

- Čistý JavaScript, HTML a CSS bez frameworku. 3D mesto používa [three.js](https://threejs.org/) (r128).
- Skript `node nastroje/zostav.js` skontroluje syntax každého modulu, spojí ich do `js/hra.js` a zvýši verziu v `index.html`.
- Automatická kontrola (`index.html?kontrola`) prejde lištu, denník postavy, pracoviská a miesta, návod, ponuku, stránky pôvodných kníh aj 3D mesto a nahlási chyby, stránky mimo okna, prekrývajúce sa budovy a nedostupné miesta.
- Postup hry sa ukladá len v prehliadači hráča.
- Kód vznikal s pomocou AI nástrojov. Návrh hry, pravidlá, rozsah a testovanie sú prácou autora.

## Známe obmedzenia

- Výroba robotníkov vo vlastnej dielni, voľby a starnutie sa posúvajú raz za 30 herných dní.
- Ceny titulov a domov z pôvodnej hry zatiaľ nie sú prepočítané na zárobok v RPG.
- Staré uložené hry spred prestavby na RPG bežia v pôvodnom režime.

Autor: Dávid Mucha
