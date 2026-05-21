# Pilacon Frontend

## Environment layout

This app uses one codebase with three explicit environment files.

- `.env.local`
- `.env.development`
- `.env.production`

`APP_ENV` selects which file is injected by `vite.config.js`.

## Central env access

Client code should read environment values only through `src/config/env.js`.

Current managed values:

- `APP_ENV`
- `API_BASE_URL`
- `SENTRY_DSN`

## Commands

```bash
npm install
npm run dev
npm run dev:remote
npm run build
npm run preview
```

Command behavior:

- `npm run dev`: local frontend -> backend local API
- `npm run dev:remote`: dev frontend -> shared dev API
- `npm run build`: production bundle -> prod API

## Env setup

Start from `.env.example`, then fill in the matching real file with non-placeholder values.

Required entries kept in each file:

- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`
- `JWT_SECRET`
- `API_BASE_URL`
- `BASIC_AUTH_USER`
- `BASIC_AUTH_PASSWORD`

Only `API_BASE_URL` and `SENTRY_DSN` are exposed to the browser. The remaining values stay as deployment metadata so the frontend and backend env sets remain aligned.
