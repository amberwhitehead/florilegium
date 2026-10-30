# Flowers

A small browser adaptation of Florilegium's procedural garden idea, with poetry instead of academic text. Plain HTML, CSS, and JavaScript; no dependencies, assets, LaTeX, or build step.

Open `index.html` directly in a browser, or from the repository root run:

    python3 -m http.server 8000 --directory web

Then visit http://localhost:8000.

**Your poem** changes the title, poet, and verses (line breaks are preserved). The browser saves the last poem locally when storage is available. **Grow again** changes the seed; **Pause** stops and resumes the animation. Reduced-motion preferences show the finished garden immediately.

`garden.js` measures rendered word rectangles, selects reachable empty discs, and connects them to existing branches with quadratic curves. Flowers and leaves are SVG geometry. Branches avoid padded word rectangles; a resize regenerates the layout. This is a deliberately small reinterpretation, not a full port of the upstream watercolor renderer. The original Lua/PDF implementation remains at the repository root.

To extend: edit the default poem in `garden.js`, typography in `style.css`, or the `motif` function for more flowers. All code retains the upstream MIT license in `../LICENSE`.

**Tune garden** opens a collapsible parameter panel: fullness controls the number of space-filling attempts; flower size caps the free-disc radius; branch reach limits the distance to an existing stem; growth speed scales animation timing; flower ink selects a palette. Apply regrows the current seed for comparison, while Grow again advances the seed. Reset restores the original settings. Applied settings persist locally when storage is available. Growth speed respects reduced-motion preferences.

Page themes: Daylight (warm paper), Moonflower (midnight blue), Night garden (forest), and Twilight (deep plum). Choosing a theme suggests a matching flower ink; you can override the ink before applying. Themes include the controls and poem editor, and persist with the other settings. Reset returns to Daylight.

Optional thorns: the Thorns slider controls coverage from None (default) to 100%. Small curved thorns alternate along branches and unfold as growth reaches them. Their size stays modest and they are omitted near text or page edges. Thorn placement uses a separate deterministic hash: changing coverage does not change the flower arrangement. Thorns follow the selected ink, speed, pause, and reduced-motion settings; their coverage persists with the other controls.

Botanical options: Thorn size scales hooked thorns from 0.5× to 4×; larger thorns are skipped where they would touch the padded text area or page edge. Flower types include original soft blossoms, daisies, star lilies, layered rosettes, and a mixed planting. Vine-tip detail replaces a proportion of leafy branch endings with bounded spirals, bud sprays, and tiny five-petal clusters, inspired by upstream flora.lua's tendrils, cymes, and sprigs. All controls persist. These ornaments use independent choices so adjusting them preserves the branch layout.

## Vite migration

The current workflow supersedes the earlier direct-source opening instructions: run `npm run dev` from the repository root. `npm run build` emits the standalone `dist/index.html`, which is the file to open directly or deploy. See the root README for sharing and deployment details.
