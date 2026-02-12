# Community Sharing

This site includes a repo-backed shared configuration gallery.

## How to share

1. Build your timer URL in Builder.
2. Use **Copy Share Template** and paste it into a JSON snippet.
3. Create `data/shared/<your-preset>.json`.
4. Add that filename in `data/shared/index.json`.
4. Open a pull request.

## Entry fields

- `id` unique slug
- `title` display name
- `author` your handle
- `description` short explanation
- `timerType` countdown/stopwatch/countup/interval
- `url` full or relative timer URL
- `tags` array of short tags
