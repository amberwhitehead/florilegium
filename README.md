# Flowers

A poem with a growing procedural garden. Plain JavaScript and SVG, built with Vite into one self-contained HTML file. Based on Kevin Raymond's MIT-licensed [Florilegium](https://github.com/kevinraymond/florilegium); the original Lua/LaTeX sources remain intact. See [upstream documentation](README.upstream.md).

## Run and build

Node.js 22.12+ (or 20.19+).

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Development and preview use port 8000. Deploy **dist/index.html** to any static host, including a subdirectory. It contains all scripts and styles: no assets, runtime dependencies, account, API, or backend. The built file also works opened locally; development source should be served through Vite.

## Garden

Your poem edits title, poet, and verses. Tune garden controls fullness, flower size/type, branch reach, animation speed, thorn coverage/size, vine-tip details, page theme, and flower ink. Apply regrows the same seed; Grow again advances it. Pause/resume and reduced-motion preferences are supported. Local settings are saved when browser storage is available.

## Share

Share → Copy link captures the displayed poem, applied settings, and seed in a versioned URL fragment. Opening the link overrides local preferences for that view and replays the animation from the beginning. Shared poems are rendered as text, not HTML. A hash change also loads a different shared garden. Invalid links display a message and retain the current/saved garden.

Anyone with the link can read its poem. The fragment is not sent to the static host. Long poems produce long links, which some messaging services may truncate. Localhost/file links are local only: upload dist/index.html, open its public URL, and use Share there. Hosting is not configured by this project.

The seed reproduces the garden at the same viewport and font metrics. Other screen sizes reflow the poem and regenerate a fitting garden; reduced-motion users see the finished composition. Links replay from the beginning, not from the sender's paused time. Unapplied tuning changes are not included.

## Source and history

- `web/`: page, drawing engine, state codec, and codec tests.
- `vite.config.js`: single-file output configuration.
- `main`: the poetry garden extension.
- `upstream-main`: the preserved original checkout.
- `origin`: still points to the original upstream repository; no push or hosted fork has been made.

MIT; see LICENSE.
