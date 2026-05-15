# Lagom Eurovision

A real-time Eurovision Song Contest scoring app for watching with friends. Create a room, invite people with a room name, and rate each contestant across three categories: music, performance, and vibes.

Built with Convex, React, Vite, and Tailwind.

## Get started

```sh
npm install
npm run dev
```

## Year Support

The app supports multiple Eurovision years. It defaults to the latest year (currently **2026**).

### Accessing Previous Years

You can join rooms for earlier years by navigating to a year-prefixed sub-path. No UI toggle is exposed; simply change the URL:

| Page | Default (2026) | 2025 |
|---|---|---|
| Contestant List | `/room/:roomName/contestants` | `/2025/room/:roomName/contestants` |
| Rate Contestant | `/room/:roomName/contestant/:id` | `/2025/room/:roomName/contestant/:id` |
| Overview | `/room/:roomName/overview` | `/2025/room/:roomName/overview` |

Once on a year-prefixed route, all navigation (prev/next contestant, overview, back buttons) preserves the year automatically.

### Adding a New Year

To bump the default year (e.g. to 2027), update `src/lib/contestants.ts`:

1. Add a new `contestants2027` array with the contestant data.
2. Change `DEFAULT_YEAR = 2027`.
3. Add `2027` to `VALID_YEARS`.
