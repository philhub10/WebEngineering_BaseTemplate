# Web Engineering Coding Playground Template

This repository is designed as the foundation for coding playgrounds in the Web Engineering course. It offers a structured space for experimenting with and mastering various web development technologies and practices. 
The project is based on [this](https://developer.mozilla.org/en-US/docs/Learn/Accessibility/Accessibility_troubleshooting) repository from MDN.

The project introduces a lot of code smells for you to tackle. 
**Let's get coding!**

## Submission Details and Deadlines
* Coding playgrounds are **individual** work
* Use this base template to create your project repository.
* Submit your repository link once.
* Each playground must be submitted via a new branch in that repository (last commit within deadline will be graded).
  * Naming conventions of branch: <code>playground-1</code>, <code>playground-2</code>, ...
* Each playground consists of 5 tasks, 1 point each. A task is complete only when both its implementation work and its theory question have been answered.

### Submission Deadlines
* [1st Playground](#1-js-playground): 14.09.2026
* [2nd Playground](#2-dependency--and-build-management-playground): 28.09.2026
* [3rd Playground](#3-migrate-to-a-frontend-framework): 04.10.2026
* [4th Playground](#4-http-api-design-and-the-backend-for-frontend): 12.11.2026
* [5th Playground](#5-persistence-and-data-modelling): 19.11.2026
* [6th Playground](#6-authentication-authorisation-and-web-security): 25.11.2026
* [7th Playground](#7-caching-realtime-and-background-jobs): 01.12.2026

#### Playgrounds 4 to 7 (backend part, Thomas Berger)
* Individual work, same repository, one branch per playground (playground-4 ... playground-7). The last commit before the deadline counts.
* Deadlines: PG4 12.11.2026, PG5 19.11.2026, PG6 25.11.2026, PG7 01.12.2026, each at 23:59. Tick the Moodle checklist by the same time.
* Presentations: in the following unit, 8 to 10 minutes per student, chosen by Thomas Berger. Show the running code, explain your decisions, answer the theory question and follow-up questions.
* Stack for the lecture examples: Node (current LTS), TypeScript (strict, ESM), Fastify, zod, PostgreSQL, Drizzle ORM. Other libraries are fine if you document why in your README.
* Everything must start with `docker compose up --build` on a clean clone and with `npm run dev` for development. No secrets in git.

## Features

- Wonderful UI-design :heart_eyes:
- Loads bear data using [Wikipedia API](https://www.mediawiki.org/wiki/API:Main_page) :bear:
  - Original Wikipedia Page can be found [here](https://en.wikipedia.org/wiki/List_of_ursids)
- Worst JS coding practices :cold_sweat:
- No Build and Dependency Management at all :fire:


# Coding Playground Description

## 1. JS Playground
The provided base project template contains bad coding and templating practices and bugs for you to fix. Take a look into the component files and get a grasp of the inner workings of the provided project. The app should provide the requirements described below. Some are implemented poorly or do not work at all. 

### App Requirements
* On page load the app requests the Wikipedia API to extract bear information from Wikipedia's [list of ursids](https://en.wikipedia.org/wiki/List_of_ursids). The page then renders the provided image, the common name, the scientific name and it's range.
  * the bears should be ordered in the same order and number (no duplicates) as in the corresponding Wiki page.
  * if there is no image available, the app should show a placeholder image.
* Users are able to toggle the comment section.
* Users are able to leave their name and a comment (both should not be empty).
* Users are able to search the web page contents using a search query, whereby only the html contents with tag <code>article</code> should be highlighted.

### Tasks
Fix the application code and support them with short code examples where useful.

#### Task 1: Introduce ES modules

Split the code into separate script files and use ES modules (`import`/`export`). Choose module boundaries that separate concerns and avoid circular dependencies.

**Theory question:** How does an ES module differ from a classic script with respect to scope, strict mode, loading, and bindings? Explain why the module boundaries you chose make the application easier to maintain.

#### Task 2: Correct the application behavior

Fix the semantic and functional issues according to the app requirements. Use appropriate DOM queries and event handling, and ensure the bear list has the same order and number of entries as the source page.

**Theory question:** Describe event propagation (capturing, target, and bubbling). Where could event delegation be useful in this application, and what trade-off would it introduce?

#### Task 3: Make failures explicit

Add error handling with `try`/`catch` and show useful, user-facing error messages. Check whether each image can be loaded and render a placeholder when it cannot. Do not represent a failed request as valid empty data.

**Theory question:** How do synchronous exceptions and rejected promises travel through this application? Explain where errors should be caught and why catching every error at its source can make failures harder to diagnose.

#### Task 4: Refactor asynchronous control flow

Replace promise callback chains with `async`/`await` and refactor suitable callbacks to arrow functions. Run independent asynchronous operations concurrently where doing so is safe.

**Theory question:** Explain the relationship between `async`/`await`, promises, the microtask queue, and the browser event loop. Also explain why an arrow function is not always an interchangeable replacement for a regular function, particularly regarding `this`.

#### Task 5: Remove remaining code smells

Find and eliminate the remaining bad coding practices. Consider scope, accidental globals, mutation and shared references, function responsibilities, naming, duplication, and DOM update patterns. Document each relevant finding, why it is problematic, and how you fixed it below.

**Theory question:** Select one of your refactorings and explain how JavaScript scope, closures, references, or prototypes caused the original risk. State how you verified that your refactoring preserved behavior.

> **What bad coding practices did you find? Why is it a bad practice and how did you fix it?**
> 
> _Present your findings here..._
>
> ```js
> console.log('Make use of markdown codesnippets to show and explain good/bad practices!')
> ```


## 2. Dependency- and Build Management Playground
Build the application with ``npm`` and a build and a dependency management tool of your choice (e.g. [Vite](https://vitejs.dev/), [Webpack](https://webpack.js.org/), or others). 

### Tasks

#### Task 1: Establish the build

Set up the project with `npm` and a build tool of your choice (for example, Vite or Webpack). Keep source files separate from generated distribution files and commit the package-manager lockfile.

**Theory question:** Distinguish source, build, distribution, and deployment. What does your build tool do in development and in a production build, and why is the lockfile important for reproducibility?

#### Task 2: Migrate to TypeScript

Use TypeScript as the primary development language and adapt the source files and configuration accordingly. Enable strict checking, model the application's domain data, and validate data received from external APIs before treating it as a typed value.

**Theory question:** TypeScript uses structural typing and erases types during compilation. Explain both concepts and why a compile-time type alone cannot guarantee the shape of a Wikipedia API response at runtime.

#### Task 3: Add static analysis and formatting

Configure ESLint and Prettier using the rulesets below. Resolve all reported errors in the application code and avoid disabling rules without a written justification.

**Theory question:** What different problems do a linter, a formatter, and the TypeScript compiler detect? Give one concrete example for each from this project.

#### Task 4: Provide a consistent command interface

Define the following tasks within `npm scripts`:

  * `dev`: starts the development server.
  * `build`: runs the typescript compiler and bundles your application - bundling depends on your chosen build tool (e.g. Vite, Webpack) but typically bundles multiple files into one, applies optimizations like minification and obfuscation and outputs final results to a `dist` or `build` directory.
  * `lint`: runs ESLint on all  `.js` and `.ts` files in your projects `/src` directory.
  * `lint:fix`: runs and also fixes all issues found by ESLint.
  * `format`: formats all `.js` and `.ts` files in your projects `/src` directory.
  * `format:check`: checks if the files in the `/src` directory are formatted according to Prettier's rules.

The `build`, `lint`, and `format:check` commands must exit with a non-zero status when their checks fail.

**Theory question:** Why are stable, composable commands such as these useful as an interface for developers and CI? Explain idempotence and identify which of your scripts should be idempotent.

#### Task 5: Enforce quality before integration

Configure a pre-commit hook that checks staged code using [husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged). Configure a continuous-integration workflow that installs dependencies from the lockfile and runs the non-mutating build, type, lint, and formatting checks for every push or pull request.

**Theory question:** Compare a local pre-commit hook with a CI quality gate. Why is CI still necessary when hooks are configured, and why should CI use non-mutating checks rather than automatically rewriting source files?


**ESLint Configurations**

Use ESLint configs [standard-with-typescript](https://www.npmjs.com/package/eslint-config-standard-with-typescript) and [TypeScript ESLint Plugin](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin).
Your `.eslintrc` file should have the following extensions:
```.eslintrc.yml
...
extends:
  - standard-with-typescript
  - plugin:@typescript-eslint/recommended
  - plugin:prettier/recommended
  - prettier
...
```
 
**Prettier Configurations**

Apply the following ruleset for Prettier:
``` .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 80
}
```

## 3. Migrate to a Frontend Framework
In this playground you will migrate your application to React with TypeScript while retaining the build and quality pipeline from Playground 2.

### Tasks

#### Task 1: Establish the React application

Add React (or another framework of your choice) to the existing Vite and TypeScript project and migrate the page entry point to a React root. Preserve the build, linting, formatting, and CI setup from Playground 2, adapting scripts and configuration where necessary.

**Theory question:** Contrast imperative DOM updates with React's declarative model. What happens during React's render, reconciliation, and commit phases, and why should code outside React not modify DOM nodes owned by the React root? If you chose not to use React, answer the same questions in the context of your chosen framework.

#### Task 2: Design the component tree

Decompose the interface into components organised by feature. Use props where appropriate, keep rendering pure, and render bear collections with stable keys.

**Theory question:** Explain how component boundaries and typed props act as contracts. What makes a key stable, why does React need keys during reconciliation, and why is an array index unsuitable when list entries can change order?

#### Task 3: Model state and interaction

Implement the comment toggle, comment form, and search behavior with React events and state. Use controlled inputs, immutable updates, and derived values rather than duplicate state. Lift state only to the closest common owner that needs it.

**Theory question:** Distinguish props, stored state, and derived values. Explain why direct mutation can produce incorrect React behavior and when lifting state is preferable to introducing context.

#### Task 4: Load and represent remote data

Load and validate the bear data within the React application. Represent loading, success, empty, and error states explicitly; prevent stale requests from overwriting newer results; and retain the image fallback behavior from Playground 1.

**Theory question:** Why is fetching data a synchronization with an external system rather than part of pure rendering? Explain how cleanup or cancellation prevents race conditions when a component unmounts or a request becomes irrelevant.

#### Task 5: Add client-side routing and verify the migration

Add at least a list route and a bear-detail route using a stable bear identifier as a route parameter. Use query parameters for optional search/filter view state where appropriate. Verify that every requirement from Playground 1 still works and that all Playground 2 quality commands pass.

**Theory question:** Distinguish client-side rendering, a single-page application, and client-side routing. Compare route parameters with query parameters, and describe one benefit and one cost of the SPA architecture used here.

## 4. HTTP, API Design and the Backend for Frontend

Your Playground 3 app calls the Wikipedia API from the browser. In this playground you move that call behind your own backend and give the comment section a real API. Stack for the examples: Node (current LTS), TypeScript, Fastify, zod. Alternatives (Express, Hono, ...) are allowed if your README explains why.

### Tasks

#### Task 1: Set up the API workspace

Turn the repository into an npm workspace with `apps/web` (the existing React app) and `apps/api` (a new Fastify service in TypeScript, strict mode, ESM). The API exposes `GET /health` returning JSON with status, version and uptime. Add a Dockerfile for both apps and a `compose.yaml` so that `docker compose up --build` serves the web app and the API; `npm run dev` starts both with hot reload, with Vite proxying `/api` to the API. Extend ESLint, Prettier, Husky and the CI workflow from Playground 2 so that both workspaces are checked.

**Done:** on a clean clone `docker compose up --build` serves the web app, `curl -i localhost:3000/health` returns 200 with JSON, and CI is green for both workspaces.

**Theory question:** Explain Node's event loop on the server: why does one slow synchronous operation delay every concurrent request, and how does async I/O avoid that? What is a health endpoint for, and who calls it?

#### Task 2: Move the Wikipedia call behind a BFF

Implement `GET /api/bears` and `GET /api/bears/:id`. The API fetches the "List of ursids" page server-side (with a descriptive `User-Agent`, as Wikimedia's policy requires), parses it and returns a normalised, typed `Bear` (`id` as a stable slug of the binomial name, `name`, `binomial`, `imageUrl`, `range`), validated with zod before it leaves the server. Use a timeout for the upstream call; if Wikipedia fails or returns something unexpected, respond with 502 or 504, never with an empty list. Switch the frontend to the BFF: the browser no longer talks to Wikipedia.

**Done:** the web app shows the same bears as before, exclusively via `/api/bears`; with the upstream blocked (for example a wrong hostname in the environment) the UI shows its error state, not an empty page.

**Theory question:** What is a Backend for Frontend, and what moves from the browser to the server when you introduce one (shape of the data, secrets, headers, CORS, failure handling)? Why is an empty 200 on upstream failure worse than a 502?

#### Task 3: Design the comments API

Design and implement a comments resource with `GET /api/bears/:id/comments`, `POST /api/bears/:id/comments` (201 Created with a `Location` header) and `DELETE /api/comments/:commentId` (204 No Content). Validate the request body with zod (author and text non-empty, sensible length limits) and answer 400 for invalid input and 404 for unknown bears or comments. Store comments in memory for now (a `Map`) and connect the comment section of the React app to the API.

**Done:** comments created in the UI survive a page reload but not an API restart (you can explain why; Playground 5 fixes it); `curl` demonstrates 201, 204, 400 and 404.

**Theory question:** Explain safe, idempotent and cacheable methods. Why is POST used for creating and why must DELETE be idempotent? What happens when a client retries a POST after a timeout, and what does that mean for the API?

#### Task 4: One error format for everything

Introduce typed error classes and a central Fastify error handler that renders every error as RFC 9457 Problem Details (`application/problem+json`): validation errors as 400 with an `errors` array, unknown resources as 404, upstream failures as 502 or 504, anything unexpected as 500 without stack trace or internals. Every response carries a request id (`x-request-id`, generated or taken from the incoming request) that also appears in the log line and in the problem's `instance` field. The frontend parses problem responses and shows `detail` to the user.

**Done:** `curl -i` shows `application/problem+json` and a request id for a 400, a 404, a 502 and a provoked 500; the request id is found in the API log.

**Theory question:** Why should an API have exactly one error contract? Which information must never leave the server in an error, and how do request ids connect a user's complaint to a log line?

#### Task 5: CORS and the API contract

In development Vite proxies `/api`, so the browser sees one origin. Now serve the built web app from a different origin (for example `vite preview` on port 4173 without the proxy) and observe the failing requests. Configure `@fastify/cors` with an allow-list of origins from the environment and the methods and headers your API needs, and watch the preflight of a `DELETE` and of a JSON `POST` in the browser's network tab. Finally generate an OpenAPI 3.1 document from your zod route schemas (`@fastify/swagger`) and serve it at `/api/docs`.

**Done:** the preflight (OPTIONS) and the successful cross-origin request are visible in DevTools; `/api/docs` lists every route including the Problem Details schema.

**Theory question:** Who enforces CORS, the browser or the server? What is the difference between a simple and a preflighted request? Why can `Access-Control-Allow-Origin: *` not be combined with credentials, and why does a BFF make most CORS problems disappear?

## 5. Persistence and Data Modelling

Your comments live in a `Map` and die with the process. In this playground bears and comments move into PostgreSQL, with migrations, a repository layer and a transaction that survives concurrency. Stack for the examples: PostgreSQL via Docker Compose, Drizzle ORM and drizzle-kit, the `pg` driver. Prisma or another tool is allowed if your README explains why.

### Tasks

#### Task 1: Add PostgreSQL to the stack

Add a `db` service (PostgreSQL, current major version) to `compose.yaml` with a named volume and a healthcheck; the API starts only when the database is healthy and reads its connection string from `DATABASE_URL`. Use a connection pool, not a connection per request, and validate all environment variables with zod at startup. Add `GET /health/ready`, which returns 200 only if the database answers a trivial query, while `/health` stays a pure liveness check.

**Done:** on a clean clone `docker compose up --build` starts db and api; `/health/ready` returns a 503 Problem while the database is stopped and 200 once it is back.

**Theory question:** Liveness versus readiness: who uses each, and what goes wrong if the readiness check includes too many dependencies? Why is a connection pool necessary, and what limits its size?

#### Task 2: Model bears and comments and write the first migration

Define the schema in Drizzle: `bears` (id = slug as primary key, name, binomial, image_url, range, fetched_at) and `comments` (uuid id, bear_id with a foreign key and `ON DELETE CASCADE`, author, text, created_at), plus the indexes you expect to need. Generate the SQL migration with drizzle-kit, commit it, and add `npm run db:migrate` and `npm run db:seed`; the seed fetches the bears through your BFF code from Playground 4 (or from a committed fixture file) and upserts them. `GET /api/bears` now reads from the database.

**Done:** on an empty database `db:migrate` and `db:seed` create the tables and the bears, the migration SQL is in the repository, and the UI works without a live Wikipedia call.

**Theory question:** Why migrations instead of creating tables from code at startup? What does forward-only mean, and what goes wrong when two branches both create migration 0003? Natural key (slug) versus surrogate key (uuid): when is which appropriate?

#### Task 3: Introduce a repository layer

Define `BearRepository` and `CommentRepository` as TypeScript interfaces and implement them with Drizzle. Route handlers and services depend on the interfaces only; the implementation is injected (Fastify decorators or plugin options). Keep the in-memory implementation from Playground 4 and use it in your tests. Comments are now persisted.

**Done:** no route handler contains SQL or ORM calls; comments survive an API restart; the test suite runs against the in-memory repositories without a database.

**Theory question:** What does the repository hide, and what does it cost? Explain the N+1 problem using "comments for all bears" and show how your repository avoids it.

#### Task 4: Pagination, filtering and one measured index

Make `GET /api/bears/:id/comments` cursor-paginated (`limit`, `cursor` based on `created_at` and `id`, response contains `nextCursor`) and add `?q=` to `GET /api/bears` to filter by name. Write a script that seeds 100,000 comments, run `EXPLAIN ANALYZE` for the comments query without and with an index on (`bear_id`, `created_at`, `id`), and record both plans and timings in your README.

**Done:** the UI pages through comments; the README shows the two query plans and the measured difference; the index lives in a migration.

**Theory question:** Why does offset pagination get slower and skip or repeat rows, and how does a cursor avoid that? What is a B-tree index, why does the column order in a composite index matter, and why may PostgreSQL ignore an index on a small table?

#### Task 5: Transactions and the lost update

Add a report feature: `POST /api/comments/:id/report` increments `report_count` on the comment, and at three reports the comment is hidden (`hidden_at`). First implement it naively (read, increment in TypeScript, write) and write a script that sends 50 concurrent reports for one comment; observe the final count. Then fix it inside a transaction with a row lock (`SELECT ... FOR UPDATE`) or an atomic `UPDATE ... SET report_count = report_count + 1 ... RETURNING`, and run the script again. The transaction boundary belongs in the service, not in the repository.

**Done:** the race is reproducible with the naive version, the fixed version ends with exactly 50, and both the script and your explanation are in the repository.

**Theory question:** Explain ACID and the lost-update anomaly. What does PostgreSQL's default isolation level (read committed) guarantee, and what not? Compare pessimistic locking, atomic updates and optimistic concurrency with a version column.

## 6. Authentication, Authorisation and Web Security

Anyone can post and delete comments. In this playground the API gets users, a login, authorisation rules and the hardening every public API needs. Libraries for the examples: `argon2`, `@fastify/cookie`, `@fastify/session` (or a JWT library if you argue for it), `@fastify/helmet`, `@fastify/rate-limit`.

### Tasks

#### Task 1: Users and password storage

Add a `users` table via migration (id, email unique, password_hash, role, created_at) and `POST /api/auth/register`. Validate with zod (email format, password at least 12 characters, no composition rules), hash the password with argon2id and store only the hash. A duplicate email yields a 409 Problem.

**Done:** registering works from the UI, `SELECT password_hash FROM users` shows argon2 hashes only, duplicate registration yields 409.

**Theory question:** Why hash instead of encrypt, what do salt and work factor do, and why is a deliberately slow hash a feature? Why do current guidelines (NIST SP 800-63B) prefer length over composition rules? What is the trade-off between a clear 409 and user enumeration?

#### Task 2: Login and session, with a written decision

Implement `POST /api/auth/login`, `POST /api/auth/logout` and `GET /api/auth/me`. Decide between a server-side session (cookie with a session id, sessions stored in PostgreSQL) and a JWT, and write the decision as a ten-line ADR in your README (context, options, decision, consequences). Whatever you choose, set the cookie flags correctly (`HttpOnly`, `Secure` in production, `SameSite=Lax`, `Path`) and make logout actually invalidate the credential. The React app shows the logged-in user and a logout button.

**Done:** `/api/auth/me` returns the user after login and a 401 Problem after logout or without a cookie; the ADR is in the README.

**Theory question:** Compare session cookies and JWTs regarding revocation, statelessness, size and storage in the browser. What does an XSS attacker get in each case, and how does `SameSite` relate to CSRF?

#### Task 3: Authorisation for comments

Comments get an `author_id`. Creating a comment requires a login (401 otherwise); deleting is allowed for the author and for users with the role `moderator` (403 otherwise). Seed one moderator. Enforce the rules in one place on the server (a `preHandler` or a policy function) and let the UI only reflect them by hiding the delete button where the call would fail.

**Done:** a curl matrix (anonymous, author, other user, moderator) shows 401, 204, 403 and 204 for `DELETE`; the UI matches.

**Theory question:** Authentication versus authorisation, 401 versus 403. Explain RBAC and ownership checks, what an IDOR vulnerability is (OWASP A01 Broken Access Control) and why hiding a button in the client is not a security control.

#### Task 4: Harden the API

Add rate limiting to login and register (429 with `Retry-After`), security headers via `@fastify/helmet`, a strict CORS configuration with credentials, a request body size limit, and zod validation on every input (params, query, body, environment). Secrets (session secret, database password) come only from the environment; commit a `.env.example`, never a `.env`, and add a secret scan (for example gitleaks) to the pre-commit hook or the CI workflow.

**Done:** a brute-force script against `/api/auth/login` receives 429 after the configured number of attempts; `curl -I` shows the security headers; the secret scan runs in CI.

**Theory question:** Map your measures to the OWASP Top 10: which items do they address? Explain token bucket versus fixed window rate limiting, and what "defence in depth" means for this API.

#### Task 5: Security review and one attack test

Write a short security review of the bear API in your README: choose three OWASP Top 10 risks, explain how each applies to this application, what mitigates it and what residual risk remains. Then write one automated test (vitest with `fastify.inject()`) that reproduces an attack, for example an injection attempt through `?q=`, a stored XSS payload in a comment, an IDOR delete or a cross-site POST, and shows that the mitigation holds.

**Done:** the review is in the README, the test is in the repository and passes in CI; in the presentation you walk through attack, mitigation and residual risk.

**Theory question:** Why do parameterised queries stop SQL injection while input validation alone does not? Where is stored XSS mitigated (output encoding in React, Content Security Policy) and what is the server's share of the responsibility?

## 7. Caching, Realtime and Background Jobs

The API works and is secure; now it has to stay fast and alive under load. In this playground you add HTTP caching, a server-side cache, live comments via Server-Sent Events, a job queue and idempotent writes. No new infrastructure is required: the cache is in-process and the queue is a PostgreSQL table.

### Tasks

#### Task 1: HTTP caching with ETags

Give `GET /api/bears` and `GET /api/bears/:id` a `Cache-Control` policy (for example `public, max-age=60, stale-while-revalidate=300`) and an `ETag`; answer `If-None-Match` with 304 and an empty body. Comments and everything behind a login get `Cache-Control: private, no-store` or `no-cache` with validation, as appropriate. Verify the behaviour in the browser's network tab and with curl.

**Done:** a repeated request to `/api/bears` with `If-None-Match` returns 304; a data change produces a new ETag; authenticated responses are never stored by a shared cache.

**Theory question:** Freshness versus validation, private versus public caches, `no-store` versus `no-cache`, and what `Vary` is for. Map the client-side strategies from the PWA unit (cache first, network first, stale-while-revalidate) to server headers.

#### Task 2: Server-side cache for the upstream

Put an in-process cache (TTL and maximum size, for example `lru-cache`) in front of the Wikipedia fetch and the bear list query (cache-aside). Add request coalescing so that 50 concurrent cold requests cause exactly one upstream call, and invalidate the cache when the seed or a refresh changes the bears. Expose hit and miss counters at `/metrics`. Measure `GET /api/bears` with autocannon before and after and record the numbers in your README.

**Done:** the README shows requests per second and p99 latency before and after; a counter proves one upstream call for 50 parallel cold requests; `/metrics` shows hits and misses.

**Theory question:** Cache-aside versus read-through, TTL versus event-based invalidation, and the cache stampede problem. When would you move the cache to Redis, and what changes for cache keys and invalidation with several API instances?

#### Task 3: Live comments with Server-Sent Events

Add `GET /api/bears/:id/comments/stream` (`text/event-stream`) that pushes `comment.created` and `comment.deleted` events from an in-process event bus; include event ids, a heartbeat every 15 seconds and support for `Last-Event-ID` so that a reconnecting client receives what it missed. The React app subscribes with `EventSource` and updates the list without reloading.

**Done:** a comment posted in one browser window appears in a second window within a second; after an API restart the second window reconnects and catches up.

**Theory question:** Compare polling, long polling, SSE and WebSockets and justify SSE for this case. What does ordering per entity mean, how does the server deal with a slow consumer (backpressure), and why does the in-process bus stop working with two API instances?

#### Task 4: Background jobs with a PostgreSQL queue

Create a `jobs` table (id, type, payload, status, attempts, run_at, locked_at, last_error) and a worker process (`npm run worker`, also a Compose service) that claims jobs with `SELECT ... FOR UPDATE SKIP LOCKED`, runs a handler, retries with exponential backoff and moves a job to `dead` after three failures. Use it for at least one real case: for example a moderation job that hides comments containing words from a block list, or a nightly refresh of the bear data from Wikipedia.

**Done:** creating a comment enqueues a job that completes asynchronously; killing the worker in the middle of a job and restarting it completes the job; a job that always fails ends in `dead` after three attempts.

**Theory question:** Why not do the work in the request? Explain at-least-once versus at-most-once delivery, why `SKIP LOCKED` is needed, what a visibility timeout is, and when you would switch to a broker such as Redis with BullMQ or RabbitMQ.

#### Task 5: Idempotency end to end

Support an `Idempotency-Key` header on `POST /api/bears/:id/comments`: store key, request fingerprint and response per user; a replay with the same key returns the stored 201, a replay with a different body returns 422, and concurrent duplicates lead to exactly one comment. Make your job handlers idempotent as well: running the same job twice has no additional effect.

**Done:** a script sends the same POST 20 times concurrently with one key, exactly one comment exists and all 20 responses are identical; re-running a completed job changes nothing.

**Theory question:** Why is exactly-once delivery impossible end to end, and how do idempotent operations give the same guarantee in practice? Connect this to the idempotent HTTP methods from Playground 4 and to the retries in Task 4.

---

## In-Class Accessibility Workshop
You might have noticed that the base project has a number of accessibility issues - your task is to explore the existing site and fix them. Use the tools presented in our accessibility workshop to test the accessibility of your app and write a summary of your reports below.

### Tasks
* Accessibility Checks:
  * **Color**: Test the current color contrast (text/background), report the results of the test, and then fix them by changing the assigned colors.
  * **Semantic HTML**: Report on what happens when you try to navigate the page using a screen reader. Fix those navigation issues.
  * **Audio**: The ``<audio>`` player isn't accessible to hearing impaired people — can you add some kind of accessible alternative for these users?
  * **Forms**:
    * The ``<input>`` element in the search form at the top could do with a label, but we don't want to add a visible text label that would potentially spoil the design and isn't really needed by sighted users. Fix this issue by adding a label that is only accessible to screen readers.
    * The two ``<input>`` elements in the comment form have visible text labels, but they are not unambiguously associated with their labels — how do you achieve this? Note that you'll need to update some of the CSS rule as well.
  * **Comment Section**: The show/hide comment control button is not currently keyboard-accessible. Can you make it keyboard accessible, both in terms of focusing it using the tab key, and activating it using the return key?
  * **The table**: The data table is not currently very accessible — it is hard for screen reader users to associate data rows and columns together, and the table also has no kind of summary to make it clear what it shows. Can you add some features to your HTML to fix this problem?


>
> _Note your findings here..._
>

<p>© 2026 Leon Freudenthaler (Hochschule Campus Wien). All rights reversed.</p>
