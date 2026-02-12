# Getting Started

Use this project to create timer overlays for OBS Browser Source.

## Quick setup

1. Open the Builder page.
2. Customize your timer.
3. Copy the generated Timer URL.
4. In OBS, add a Browser Source and paste the URL.

## URL-first workflow

All timer settings are encoded in query params. This makes scene setups shareable and reproducible.

Example:

```text
timers/countdown.html?duration=300&renderer=seven&target=main
```

## Presets

Builder presets are saved in local browser storage and can be exported as JSON.
