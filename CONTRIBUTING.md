# Contributing

Thanks for improving OBS Timers.

## Share a community configuration

1. Build your timer URL in `index.html`.
2. Use **Copy Share Template** in the Builder.
3. Create a new file in `data/shared/` (for example `my-preset.json`).
4. Add the filename to `data/shared/index.json`.
4. Open a pull request.

## Shared config schema

Each preset file in `data/shared/` should include:

- `id` unique slug
- `title` short display name
- `author` creator handle
- `description` one-sentence context
- `timerType` one of `countdown`, `stopwatch`, `countup`, `interval`
- `url` timer URL (relative or absolute)
- `tags` array of short tags

## Docs

Docs are authored in `docs-src/*.md` and converted to static pages in `docs/` with:

```bash
npm run build:pages
```
