# Project guide

StudyTrack is a static HTML/CSS/JavaScript app published from `public/`. `public/index.html` defines the accessible page structure and sharing metadata; `public/style.css` implements the responsive dark/light UI; `public/app.js` handles view navigation, rendering, filters, task actions, and the deadline-based focus timer.

`netlify/functions/study.mts` exposes `/api/study` using the modern Request/Response API. A server-generated HTTP-only anonymous cookie scopes all database operations. Mutation requests require the same origin. Do not expose owner identifiers to the frontend, and always scope queries by owner. No login is provided. Browser state is transient; persistent records belong in Netlify Database.

`db/schema.ts` defines a composite owner/id key for problem status, tasks, and completed focus sessions. `db/index.ts` initializes Drizzle within the request. Schema changes require generated migrations under `netlify/database/migrations/`. Drizzle dependencies must use the beta release line for the Netlify adapter. Netlify applies migrations automatically.

Keep user-entered text escaped in HTML rendering. Show errors without claiming a save succeeded. Preserve reduced-motion behavior, mobile navigation, labels, and keyboard focus states. Timer completion uses an idempotent record id so retries do not double count time. Do not discard an unsaved completed session.

There is no frontend build command. The hosting pipeline validates the project. README.md documents local development.
