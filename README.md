# Timișoara Stories Unlocked

Timișoara Stories Unlocked is a location-based historical adventure for Android and
iOS. Players visit historical places, solve riddles, and collect story fragments that
form a complete story about the city.

## Repository layout

- `backend/` — Flask REST API and its tests
- `mobile/` — Expo + React Native + TypeScript client
- `database/` — database notes and future migrations
- `docs/` — project documentation

## MVP vertical slice

The first increment supports:

1. Listing a seeded historical location.
2. Opening its challenge when the player is within the configured proximity radius.
3. Submitting an answer to the backend for validation.
4. Awarding the related story fragment once.
5. Viewing collection progress.

The local MVP stores player progress in `backend/data/progress.json` so a backend
restart does not erase the demo journey. The Supabase schema remains the production
persistence target; the local file must not be used for a multi-process deployment.

## Run the backend

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
flask --app app run --debug
```

The API is available at `http://127.0.0.1:5000`.

Run backend tests with:

```bash
cd backend
pytest
```

Check backend style with:

```bash
cd backend
ruff check .
```

## Supabase database

Apply [`database/migrations/001_initial_schema.sql`](./database/migrations/001_initial_schema.sql)
and then [`database/seed.sql`](./database/seed.sql) in the Supabase SQL editor or through
the Supabase CLI. The migration enables Row Level Security for player-owned tables and
stores accepted challenge answers as SHA-256 digests rather than plain text.

## Run the mobile app

Install Node.js and the Expo CLI, then:

```bash
cd mobile
npm install
npm start
```

The mobile app uses Expo SDK 58 and requires Node.js `22.13.0` or newer. If you use
nvm, run `nvm use` from the `mobile/` directory before installing dependencies.

The mobile app expects the API at `http://127.0.0.1:5000` by default. When testing
on a physical device, create `mobile/.env.local` with the host machine's LAN address:

```text
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:5000
```

Restart Expo after changing this value. The computer and phone must be on the same
network, and the Flask server must listen on `0.0.0.0`.

The mobile app contains no Supabase service-role key, database password, or accepted
challenge answer. Keep local credentials in ignored `.env.local` files and never
expose privileged Supabase keys through `EXPO_PUBLIC_*` variables.

For the local end-to-end demo, progress is written atomically to the ignored
`backend/data/progress.json` file. The automated journey test covers location
loading, challenge retrieval, answer validation, reward creation, duplicate
submission, and progress after a backend restart. Device permission prompts and
real GPS movement still require manual testing on a development build.

The mobile foundation includes Home, Map, and Collection stack routes, a typed API
client, and reusable loading/error/action components. Install dependencies with
`npm install` before starting Expo.

## Map and device testing

The map uses MapLibre with the public demo style at
`https://demotiles.maplibre.org/style.json`. MapLibre is a native module, so it
requires an Expo development build rather than standard Expo Go:

```bash
cd mobile
npx expo prebuild
npx expo run:android
```

The Map screen asks for foreground location permission, continues to work when
permission is denied, shows backend locations as selectable pins, and checks the
selected location every 10 seconds or after 25 metres of movement. A challenge is
marked available when the player is within 100 metres. The radius should eventually
come from the backend location configuration rather than being hard-coded.

## Challenge flow

Selecting an unlocked map location opens the challenge screen. The screen fetches
only the public prompt and hint, then sends the submitted answer to
`POST /challenges/<id>/solve`. Answer validation and reward creation remain on the
Flask server; accepted answers are never included in the mobile bundle.

Frontend checks:

```bash
cd mobile
npm run lint
npm run typecheck
```

## Scope decisions

The MVP intentionally does not include multiplayer, leaderboards, augmented reality,
offline synchronization, or AI-generated historical content. See
[`PROJECT_SPEC.md`](./PROJECT_SPEC.md) for the source of truth.
