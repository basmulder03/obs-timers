# OBS Timers

Native HTML/CSS/JS timer overlays for OBS, hosted on GitHub Pages.

## Features

- Countdown, stopwatch, count-up, and interval timers
- Query-parameter based configuration for scene-specific URLs
- Dashboard to generate URLs and manage presets
- Browser `localStorage` preset persistence
- Optional command bridge page for start/pause/reset/toggle

## Run locally

Because this project uses ES modules, run it with a local web server.

Example with Python:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## GitHub Pages deploy

1. Push this repository to GitHub.
2. In repository settings, open **Pages** and set **Source** to **GitHub Actions**.
3. The workflow `.github/workflows/deploy-pages.yml` deploys automatically on pushes to `main`.
4. Your dashboard is available at:
   - `https://<username>.github.io/obs-timers/`

## OBS usage

1. Add a **Browser Source** in OBS.
2. Paste a generated timer URL from the dashboard.
3. Set Width/Height for your scene (for example, 1920x1080).
4. For transparent overlays, keep `bg=transparent`.

## Timer URL examples

- Countdown:
  - `https://<username>.github.io/obs-timers/timers/countdown.html?duration=300&autostart=1&target=main`
- Stopwatch:
  - `https://<username>.github.io/obs-timers/timers/stopwatch.html?autostart=0&showMs=1&target=main`
- Interval:
  - `https://<username>.github.io/obs-timers/timers/interval.html?work=1500&rest=300&rounds=4&finalMode=stop&target=focus`

## Command bridge

Control an active timer by loading `timers/control.html` with command parameters:

- `cmd=start|pause|reset|toggle`
- `target=<timerTarget>`
- `syncToken=<uniqueNumber>`

Example:

`https://<username>.github.io/obs-timers/timers/control.html?cmd=reset&target=main&syncToken=1739384700`

The command bridge writes to `localStorage`, and timer pages listening on the same origin and matching `target` will react.

## Query params

Common params for all timer overlays:

- `target` (default `default`)
- `autostart=0|1` (default `0`)
- `showMs=0|1` (default `0`)
- `font` (default `Barlow Condensed`)
- `color` hex like `%23FFFFFF`
- `bg=transparent|solid`
- `size` number (font size in px)
- `shadow=0|1`

Type-specific params:

- Countdown: `duration` (seconds), `endMode=stop|loop|overtime`
- Count-up: `start` (seconds)
- Interval: `work` (seconds), `rest` (seconds), `rounds`, `finalMode=stop|loop`, `autoNext=0|1`
