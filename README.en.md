# Prešporok 1400

*[Slovenská verzia](README.md)*

A trading and dynasty game set in medieval Europe, running directly in the desktop browser. The game itself is in Slovak.

**▶ [Play the game](https://davidmucha1999.github.io/presporok-1400/)**

Nothing to install. Built for a desktop computer with keyboard and mouse (Chrome, Edge or Firefox). The first load takes a few seconds.

## What is in the game

- **Trade and crafts** – workshops with production chains, workers, goods quality, warehouses in each city, caravans and prices driven by supply and demand.
- **European cities around 1400** – from Prešporok (today's Bratislava) through Vienna, Buda, Kraków, Prague, Nuremberg and Venice to Paris and London, each with its own town layout.
- **Family and dynasty** – a family seat that grows from a cottage to a castle, marriages, children and heirs, family tree and ancestors.
- **Politics and advancement** – council elections, city offices, the Church, the royal court and titles from freeman to king.
- **Living town** – illustrated scenes for every section, seasons, weather and a chronicle of events.
- **3D town** – walk through the town with buildings placed exactly as on the map: enter workshops and family seats, shop at market stalls, talk to other families, take commissions on the square, townspeople who walk, look at you, greet you and chat with each other, day and night, weather and a bird's-eye view.

## Controls

| Mode | Keys |
|---|---|
| Game | `1`–`9`, `0`, `-`, `=` tabs, `M` town, `D` workshops, `T` market, `R` family, `Space` end the quarter, `Z` undo, `F` fullscreen, `?` all shortcuts |
| 3D town | `W` `A` `S` `D` or arrows to walk, `Shift` run, drag the mouse to look, `E` interact, `M` bird's-eye view, `T` places, `Q` graphics quality |

## Architecture

The game is plain JavaScript, HTML and CSS with no framework and no server. The only libraries are [three.js](https://threejs.org/) r128 for the 3D town and lz-string for compressing saves.

```
zdroj/01-game.js … 37-dielnescena.js, 99-zaver.js   source modules (~12,000 dense lines)
        │  node nastroje/zostav.js
        ▼
js/hra.js  ──  index.html loads one bundle (with a per-module fallback loader)
nastroje/kontrola.js  ──  automated UI and 3D checks (index.html?kontrola)
```

### Source modules and build

- The code lives in numbered modules in `zdroj/`. The number defines the load order: `01-game.js` holds the core (game state, economy, rules, the main views and most of the procedural SVG art), and the later modules add features on top of it: politics, caravans, sounds, city growth, offices, illustrated scenes, the 3D town and more.
- Later modules extend earlier behaviour by wrapping existing functions (for example `render` or the building renderer), so each feature stays in its own file and can be removed without touching the core.
- `nastroje/zostav.js` (Node.js, no dependencies) checks the syntax of each module separately to report the exact file with an error, concatenates them into `js/hra.js` and bumps the cache-busting version `?v=N` in `index.html`. It also refreshes a fallback list in `index.html`: if the bundle fails to load, the loader loads the modules one by one.

### Game state and UI

- The whole game is one state object (`S`): cities, markets, families, buildings, orders, the chronicle. It is serialized to JSON, compressed with lz-string and stored in `localStorage` in several save slots. Nothing leaves the player's browser.
- The UI is rendered from state into HTML strings by `render()`. Buttons carry a `data-a` attribute and a single delegated click handler dispatches them to action functions in the `A` object. Actions change the state and call `render()` again.
- The economy runs in quarter-year turns: production, prices from supply and demand, AI families that trade, build and run for office, and random events written to the chronicle.
- Almost all graphics are generated in code: city maps, buildings, coats of arms, portraits and the illustrated scenes are SVG built from the game state. Only backgrounds and a few illustrations are image files.

### 3D town (`zdroj/35-mesto3d.js`)

- **Built from the same data as the 2D map.** Streets, walls, gates, river and building plots are converted from map coordinates to world coordinates. Every building is chosen by what really stands on the plot: the craft and level of a workshop, the level of a family seat, public buildings. The 3D town therefore always matches the game.
- **Image pipeline.** The scene renders into an HDR (half-float) target followed by a custom post-processing shader: ACES tone mapping, distance haze, bloom, a sun or moon disc, cloud shadows and wet ground in rain. Cloud shadows and puddles reconstruct world position from the depth buffer.
- **Game connection.** Interaction points (enter a workshop, talk to a family head, buy at a stall, accept a commission) call the same actions as the 2D interface. Workshops under construction get scaffolding with workers, and idle ones get weeds and a boarded door, mirroring the 2D map.
- **Procedural characters.** Townspeople are generated entirely in code, with no external models. Each body is one smooth skinned mesh on a small skeleton, so elbows, knees, shoulders and neck bend smoothly. The face is painted into a canvas texture with expressions (blink, smile, talking) and age wrinkles, hair is built from strands and hands have fingers. Clothing is layered by role and wealth (shirt, apron, hood with shoulder cape, veil, hats, buttons, fur) with folds, a fabric texture, baked occlusion in the folds and a rim light that follows the time of day. Animation is procedural: the gait is derived from the measured speed so feet do not slide, the pelvis drops, sways and twists with each step, arms swing with a lag, and running adds a forward lean and bent elbows. Standing figures breathe, shift their weight, change arm poses, look around, turn their head to the player and nod in greeting. Arms or legs driven by other code (a guard's spear, a seated person) are detected automatically and left alone. Pedestrians steer around each other and the player, and distant figures are animated less often and drawn without shadows.
- **Performance.** A quality switch (`Q`) and three optimizations:
  - Static meshes with identical material properties are merged into one geometry two seconds after the town opens (about 930 objects into about 100).
  - Small distant objects are moved to a hidden render layer, a simple level of detail.
  - The pixel ratio adapts to the measured frame rate.

  Draw calls dropped by 25–37 % (street view about 3,270 → 2,450, bird's-eye view about 4,790 → 3,030) with no visible change.

### Automated checks (`nastroje/kontrola.js`)

Opening `index.html?kontrola` walks through every section and sub-section of the game and then the 3D town, and shows a table of findings:

- **2D sections:** render errors, clickable spots covered by other elements, panels that overflow the window or overlap the toolbar, content sticking out of panels.
- **3D town:**
  - the scene builds and actually renders;
  - every plot from the map has its building, and no buildings overlap;
  - every building and character can be reached on the walking path network, and the player does not spawn inside an obstacle;
  - dialogue panels open and fit the window;
  - the bird's-eye view works.

The check restores the save and `localStorage` afterwards.

## Notable challenges

- **Keeping 2D and 3D consistent.** An earlier version filled the 3D town with generated row houses for atmosphere. It looked busy but no longer matched the map, so the 3D town now shows only real buildings and the automated check verifies the match.
- **Rendering a whole town in the browser.** WebGL draw calls were the bottleneck rather than polygons, which led to geometry merging, layer-based LOD and dynamic resolution instead of simplifying the models.
- **One deployable file without a bundler.** A small Node script with per-module syntax checks and a fallback loader keeps development modular while shipping a single file.

## Technical notes

- The game state is saved only in the player's browser.
- The code was written with the help of AI tools. Game design, rules, scope and testing were done by the author.

Author: Dávid Mucha
