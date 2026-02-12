# OBS Timers

Custom HTML/CSS/JS timers for OBS Browser Source, designed to be hosted on GitHub Pages.

Use the dashboard to generate scene-ready URLs for multiple timer styles, save presets, and optionally trigger timer commands from a separate control URL.

## What you get

- Countdown timer
- Stopwatch
- Count-up timer
- Interval timer (work/rest/rounds)
- URL-based customization (one URL per scene setup)
- Preset save/load/delete in browser `localStorage`
- Optional control bridge for `start`, `pause`, `reset`, and `toggle`

## Project structure

```text
.
|- index.html                     # Dashboard (URL builder + preview + presets)
|- timers/
|  |- countdown.html
|  |- stopwatch.html
|  |- countup.html
|  |- interval.html
|  \- control.html               # Optional command bridge
|- assets/
|  |- css/
|  |  |- base.css
|  |  \- themes.css
|  \- js/
|     |- core/
|     |  |- format.js
|     |  |- storage.js
|     |  |- time-engine.js
|     |  \- url-config.js
|     \- pages/
|        |- dashboard.js
|        |- overlay-common.js
|        |- countdown.js
|        |- stopwatch.js
|        |- countup.js
|        |- interval.js
|        \- control.js
\- .github/workflows/deploy-pages.yml
```

## Local development

This project uses ES modules, so run it behind a local web server.

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## Deploy to GitHub Pages

1. Push your repository to GitHub.
2. Open repository **Settings -> Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main` (or run the workflow manually).
5. After deploy, your dashboard is available at:
   - `https://<username>.github.io/obs-timers/`

This repo includes:

- `.github/workflows/deploy-pages.yml` for automatic deployment
- `.nojekyll` for static hosting compatibility

## Using in OBS

1. In OBS, add a **Browser Source**.
2. Paste a timer URL generated from the dashboard.
3. Set source size (for example `1920x1080`).
4. For alpha overlays, use `bg=transparent`.
5. If updates do not appear immediately, refresh the Browser Source.

## URL examples

Countdown:

```text
https://<username>.github.io/obs-timers/timers/countdown.html?duration=300&autostart=1&target=main
```

Stopwatch:

```text
https://<username>.github.io/obs-timers/timers/stopwatch.html?autostart=0&showMs=1&target=main
```

Count-up:

```text
https://<username>.github.io/obs-timers/timers/countup.html?start=90&autostart=1&target=warmup
```

Interval:

```text
https://<username>.github.io/obs-timers/timers/interval.html?work=1500&rest=300&rounds=4&finalMode=stop&target=focus
```

## Command bridge (optional)

`timers/control.html` can send runtime commands to overlays sharing the same origin and `target`.

Parameters:

- `cmd=start|pause|reset|toggle`
- `target=<timerTarget>`
- `syncToken=<uniqueValue>`

Example:

```text
https://<username>.github.io/obs-timers/timers/control.html?cmd=reset&target=main&syncToken=1739384700
```

## Query parameters

Common (all timer overlays):

- `target` (default: `default`)
- `autostart=0|1` (default: `0`)
- `showMs=0|1` (default: `0`)
- `font` (default: `Barlow Condensed`)
- `color` (hex, for example `%23FFFFFF`)
- `bg=transparent|solid`
- `size` (font size in px)
- `shadow=0|1`
- `theme=steel|amber|ice`

Countdown:

- `duration` (seconds)
- `endMode=stop|loop|overtime`

Count-up:

- `start` (seconds)

Interval:

- `work` (seconds)
- `rest` (seconds)
- `rounds` (1-200)
- `autoNext=0|1`
- `finalMode=stop|loop`

## Notes

- Presets are stored per browser in `localStorage`.
- Control bridge communication also uses `localStorage`; it is origin-scoped.
- For best OBS readability, use high-contrast colors and verify at your output resolution.
