# Prešporok 1400

*[Slovenská verzia](README.md)*

A medieval RPG set in Prešporok (today's Bratislava) in the year 1400, running directly in the desktop browser. The game itself is in Slovak. You start as a peasant with no property, walk a 3D town, do every job with your own hands and work your way up to craftsman, burgher with a coat of arms, and nobleman.

**▶ [Play the game](https://davidmucha1999.github.io/presporok-1400/)**

Nothing to install. Built for a desktop computer with keyboard and mouse (Chrome, Edge or Firefox). The first load takes a few seconds.

## What is in the game

- **Day by day** – the clock runs while you walk the town. Morning, day, evening and night change the light. Sleeping starts a new day; a season lasts 30 days.
- **Hunger and fatigue** – eat at the bread seller on the square, sleep in the hay barn, the lodging house or at home.
- **Jobs you actually perform** – mowing grain in the field, picking grapes in the vineyard, fishing on the Danube, carrying sacks for a merchant and helping in the workshops of the town's families. Workshops have three kinds of tasks depending on the craft: rhythm strikes, stopping at the right moment, and repeating a sequence of moves.
- **Skills and crafts** – work raises a skill, which raises the wage and makes the task easier. A day labourer can be accepted as a journeyman, and a journeyman can take the master's examination.
- **Ranks** – peasant, day labourer, journeyman, master, burgher, councillor, nobleman. Your own coat of arms only comes with burgher rights.
- **Housing and property** – lodging house, a rented room, your own cottage or house, and for a master his own workshop with workers.
- **A large town** – 160 plots in five districts: the surroundings, the suburb under the castle, the craftsmen's quarter, the market quarter with the port, and the upper town. The guards do not let a peasant into the upper town.
- **A living town** – market prices, ten families, elections and town offices keep running in the background. A burgher gets access to the town books: town hall, families, Church, court, and the book of his own family with marriage and heirs.

## Controls

| What | Keys |
|---|---|
| Movement | `W` `A` `S` `D` or arrows to walk, `Shift` run, drag the mouse to look, wheel to zoom, `V` first-person view, `M` bird's-eye view |
| Game | `E` use a place or work, `B` character journal, `T` places, `N` minimap, `Esc` menu (save, settings), `Q` graphics quality |

A short tutorial walks you through the first steps.

## Architecture

The game is plain JavaScript, HTML and CSS with no framework and no server. The only libraries are [three.js](https://threejs.org/) r128 for the 3D town and lz-string for compressing saves.

```
zdroj/01-game.js … 41-byvanie.js, 99-zaver.js   source modules
        │  node nastroje/zostav.js
        ▼
js/hra.js  ──  index.html loads one bundle (with a per-module fallback loader)
nastroje/kontrola.js  ──  automated checks (index.html?kontrola)
```

### From a strategy game to an RPG

The project started as a quarter-based trading and dynasty strategy game with a 2D interface and twelve cities. It was rebuilt in steps: first the whole game moved into the 3D town, then it became a single-city, day-based RPG. The old rules were not thrown away:

- The economy (prices from supply and demand, AI families, elections, workshops with workers) still runs in the background, one old turn per 30 game days.
- Its pages are shown as a parchment docked next to the object you interact with in the 3D town, with the camera turning to that object.
- The RPG layer sits on top in three modules: `39-rpg.js` (clock, hunger, fatigue, sleep, the large town and its districts, the character journal, the tutorial), `40-praca.js` (job sites and tasks, skills, journeyman, master) and `41-byvanie.js` (lodging, houses, the player's own workshop, burgher rights). The character's state lives in `S.rpg`.

### Source modules and build

- The code lives in numbered modules in `zdroj/`; the number defines the load order. Later modules extend earlier behaviour by wrapping existing functions, so each feature stays in its own file.
- `nastroje/zostav.js` (Node.js, no dependencies) checks the syntax of each module separately, concatenates them into `js/hra.js` and bumps the cache-busting version in `index.html`. It also refreshes a fallback list: if the bundle fails to load, the loader loads the modules one by one.

### Game state and UI

- The whole game is one state object (`S`), serialized to JSON, compressed with lz-string and stored in `localStorage`. Nothing leaves the player's browser.
- Buttons carry a `data-a` attribute and a single delegated click handler dispatches them to action functions in the `A` object.

### 3D town (`zdroj/35-mesto3d.js`)

- **Generated layout.** Streets, walls, gates, the river and building plots come from a layout generator whose size depends on the number of plots; the RPG enlarges the town from 45 to 160 plots and assigns districts by position.
- **Image pipeline.** The scene renders into an HDR target followed by a custom post-processing shader: ACES tone mapping, distance haze, bloom, a sun or moon disc, cloud shadows and wet ground in rain.
- **Procedural characters.** Townspeople are generated entirely in code, with no external models: a skinned body, a sculpted head, a painted face with expressions, eyes that blink and look at the player, strand-based hair and beards, layered clothing by role and wealth, and procedural walking, idling, greeting and gesturing.
- **Job sites.** The field, vineyard, fisherman and merchant's cart are added to the scene after each town build and look for a free spot away from roads, water and houses.
- **Performance.** Static meshes with identical materials are merged, small distant objects are hidden, the pixel ratio adapts to the frame rate, and on a slow machine the graphics quality drops automatically.

### Automated checks (`nastroje/kontrola.js`)

Opening `index.html?kontrola` with a saved game runs 31 checks and shows a table of findings: the toolbar, the character journal, the job sites and places with the tutorial, the pause menu, every page of the original books (errors, pages outside the window, overflowing content) and the 3D town (it builds and renders, no buildings overlap, every place can be reached, dialogue panels open, the bird's-eye view works). The check restores the save afterwards.

## Known limitations

- Production by hired workers, elections and ageing advance once per 30 game days.
- Prices of titles and houses from the original game are not yet rebalanced for RPG wages.
- Saves from before the RPG rework run in the original mode.

## Technical notes

- The game state is saved only in the player's browser.
- The code was written with the help of AI tools. Game design, rules, scope and testing were done by the author.

Author: Dávid Mucha
