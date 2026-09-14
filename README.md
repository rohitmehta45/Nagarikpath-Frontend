# NagarikPath Frontend

React 19 + Vite 8 client for NagarikPath / Nagarik DataBridge. It provides public content plus citizen, officer, and administrator workflows. This is an academic prototype, not a production government system.

## Setup

From `frontend/`:

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

Vite is configured in `vite.config.js` to run at `http://localhost:3000` with `strictPort: true`; if port 3000 is busy it exits instead of silently moving to another port. The API base URL comes from `VITE_API_URL`:

```env
VITE_API_URL=http://localhost:5000/api
```

`src/services/api.js` uses that value or falls back to the same local API URL. For deployment, set `VITE_API_URL=https://your-api.example/api` at build time. Never put secrets in a `VITE_*` variable: it is exposed to the browser. `.env.example` is a safe template; `.env` stays local and ignored.

## Structure

```text
src/
|- components/  pages and reusable UI (auth, dashboards, DataBridge, profile)
|- data/        static prototype content
|- services/    Axios API client
|- utils/       navigation and application helpers
|- App.jsx      route selection
`- main.jsx     React entry point
```

The existing visual system, content pages, role headers, dashboards, and responsive styles are maintained in JSX/CSS components.

## Authentication

Login posts email/password to `POST /api/auth/login`. Successful authentication stores `databridge_token` and `databridge_user` in local storage; the Axios interceptor sends `Authorization: Bearer <token>`. Login failures stay failures and display the API message (for example, `Invalid email or password`). Logout removes both keys.

Registration validates name, email, optional phone, password length, and confirmation; the server always assigns the `CITIZEN` role. The frontend never submits a role.

Application API values use `SUBMITTED`, `DOCUMENT_VERIFICATION`, `OFFICER_REVIEW`, `ADDITIONAL_INFORMATION_REQUIRED`, `FINAL_DECISION`, `COMPLETED`, and `REJECTED`. Use the helper label when showing these values to people.

## Commands

```bash
npm run dev      # Vite server at localhost:3000
npm run lint     # oxlint
npm run build    # production build in dist/
npm run preview  # preview the built site
```

## Deployment and troubleshooting

Build with `npm run build` and deploy the `dist/` output using the host's Vite workflow (the repository includes `vercel.json`). Configure the deployed API through `VITE_API_URL`, then configure the backend CORS `CLIENT_URL` to the frontend origin.

- `ERR_CONNECTION_REFUSED` at port 5000: start/configure the backend and MongoDB.
- `401`: sign in again and verify `databridge_token` exists.
- CORS error: the frontend origin must equal backend `CLIENT_URL` (or local `http://localhost:3000`).
- `404`: confirm the API path against the backend API documentation.
