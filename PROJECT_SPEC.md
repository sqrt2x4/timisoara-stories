# Project specification

## Product

Timișoara Stories Unlocked turns the city into an interactive historical adventure.
Students and young adults are the primary audience; tourists and local history
enthusiasts are secondary audiences.

## MVP

- Interactive map with curated historical locations.
- Location permission and proximity feedback.
- Riddles and hints unlocked near a location.
- Server-side answer validation.
- Story fragments and collection progress.
- Romanian and English-ready content model.

## Non-goals for the first release

- Multiplayer
- Leaderboards
- Augmented reality
- Offline mode
- AI-generated historical content

## Architecture

The Expo mobile app communicates with a Flask REST API over HTTPS. The API owns
challenge validation and reward logic. PostgreSQL/Supabase will provide persistent
storage and authentication after the in-memory vertical slice is validated.

The client must never contain accepted answers, database credentials, or privileged
service keys. Proximity is a gameplay gate, not proof of physical presence.

## Initial API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Service health check |
| GET | `/locations` | List historical locations |
| GET | `/locations/<id>` | Get a location and challenge summary |
| GET | `/challenges/<id>` | Get a challenge prompt |
| POST | `/challenges/<id>/solve` | Validate an answer and award a fragment |
| GET | `/collection` | Get collected fragments and progress |

## Definition of done for the first increment

- A new player can load a location.
- A challenge answer is validated on the server.
- Correct answers award a fragment exactly once.
- Incorrect answers do not award a fragment.
- Collection progress is visible.
- Backend tests cover the success, failure, and duplicate-reward paths.
