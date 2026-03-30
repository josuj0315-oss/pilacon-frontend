# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Ncloud SMS phone verification

This frontend assumes that phone verification is handled by the backend, and that the backend calls Ncloud SENS.

Set the API base URL in `.env`:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

Expected backend endpoints:

1. `POST /auth/phone/request`
   Request body: `{ "phone": "01012345678" }`
2. `POST /auth/phone/verify`
   Request body: `{ "phone": "01012345678", "code": "123456" }`
   Response example: `{ "verified": true, "verificationToken": "..." }`
3. `POST /auth/signup`
   Request body should accept `phone` and optionally `phoneVerificationToken`

Do not call Ncloud directly from the browser. The Ncloud access key, secret key, and SMS signature generation must stay on the server.
