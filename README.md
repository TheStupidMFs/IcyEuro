# IcyEuro — Enter the Icyverse

Official creator hub for IcyEuro, built around a cinematic entrance, live Twitch broadcast, latest VOD fallback, clips, story and the Stupid MFs connection.

## Required media

Place these files in `assets/`:

- `entrance.mp4` — cinematic entrance montage
- `icyverse.mp3` — entrance soundtrack
- `icy-map-bg.png` — tactical background texture
- `icyeuro-logo.png` — transparent horizontal logo
- `icyeuro-character.png` — transparent full-body character
- `icyeuro-photo.png` — real portrait (reserved for future use)

## Twitch automation

The frontend requests `/api/twitch`. The included Cloudflare Pages Function:

1. Checks whether **IcyEuro** is currently live.
2. Embeds the live channel when online.
3. Fetches and embeds the latest archived Twitch VOD when offline.
4. Pulls the latest three Twitch clips with their thumbnails, titles and view counts.
5. Falls back to the standard Twitch channel player if the API is not configured.

Create a Twitch developer application and configure these encrypted deployment variables:

- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`

Never commit the secret to GitHub.

## Deploy

Recommended: Cloudflare Pages.

- Framework preset: None
- Build command: leave blank
- Output directory: `/`
- Add the Twitch environment variables under **Settings → Variables and Secrets**

Twitch embeds require the final production hostname in the player `parent` parameter. The site calculates this automatically.

## Local preview

Use any static server rather than opening `index.html` directly:

```bash
npx serve .
```

The API endpoint only runs through a Pages-compatible development environment such as Wrangler.
