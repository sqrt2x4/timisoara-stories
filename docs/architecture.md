# Architecture

```text
Expo mobile app
        |
        | HTTPS / JSON REST
        v
Flask API  --->  PostgreSQL / Supabase (planned)
```

The backend owns challenge validation and reward creation. The client only displays
challenge prompts and the resulting collection state. Location checks are a gameplay
gate and should not be treated as secure proof of presence.
