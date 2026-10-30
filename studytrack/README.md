# StudyTrack

StudyTrack is a responsive DSA tracker and study planner based on a slate, indigo, and cyan interface. It includes twelve linked practice problems, topic and status filters, dated tasks, and a 25-minute focus timer with five-minute breaks.

The frontend uses plain HTML, CSS, and JavaScript, with Netlify Functions and Netlify Database using Drizzle ORM for persistence. Each browser receives an anonymous HTTP-only cookie that isolates its records. Clearing cookies loses access to that browser’s history; cross-device accounts are not included. Theme choice and an unfinished countdown are temporary. Completed study sessions and task/problem progress are stored in Postgres.

## Preview and deployment

**Quick preview:** Open `public/index.html` directly in a browser. The stylesheet and JavaScript use relative paths, so the page renders correctly from a local file. Direct-file previews and standard GitHub Pages deployments use browser storage (`localStorage`); data stays in that browser and is not shared across devices.

**Netlify with database persistence:** Install dependencies with `npm install`, then run `netlify dev --port 8889` from a linked Netlify project. Open `http://localhost:8889`. Netlify supplies the database connection and applies the migrations through its deployment workflow. Deploy the repository to Netlify to use the server-side database. No frontend build step is needed.

GitHub stores the source code, but GitHub Pages does not execute the Netlify Functions or provide the Netlify Database. On GitHub Pages, the planner and progress tracker therefore use browser-local storage instead.

Define schema changes in `db/schema.ts` and generate migrations with `npx drizzle-kit generate --name describe_change`. Do not manually push or apply migrations to production.


## Repository note

The original change view did not include the generated `package-lock.json` contents. Run `npm install` in this repository to generate a fresh lockfile before committing, if you want one tracked.
