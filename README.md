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

> **Answer:**
>
> * **Scope:** A classic script runs in the global scope — top-level `var`/`function` declarations become properties of `window` and are visible to (and can clash with) every other script on the page. An ES module has its own module scope: top-level declarations stay local to the file and are only exposed to other files if explicitly exported.
> * **Strict mode:** Modules are always executed in strict mode automatically. Classic scripts are sloppy-mode by default, which allowed things like the original code's undeclared/mistyped variables to fail more silently.
> * **Loading:** A classic `<script>` is fetched and executed synchronously, in document order, blocking HTML parsing unless `async`/`defer` is set. A `<script type="module">` is always deferred (parsed after the document), fetched asynchronously, and — crucially — its `import`/`export` graph is resolved by the browser first, so a module is only ever executed once no matter how many other modules import it. Module loading also enforces CORS, which is why the page now needs to be served over HTTP instead of opened via `file://`.
> * **Bindings:** exported values are *live bindings*, not copies. If a module updates an exported variable, every module that imported it sees the new value immediately. Classic scripts have no such mechanism.
>
> **Module boundaries:** each file now owns exactly one feature and exposes only the functions it wants other code to call (`initSearchHighlighter`, `initCommentToggle`/`initCommentForm`, `loadBears`). Everything else — helper functions, DOM references, request parameters stays private to that module instead of leaking into the global scope

#### Task 2: Correct the application behavior

Fix the semantic and functional issues according to the app requirements. Use appropriate DOM queries and event handling, and ensure the bear list has the same order and number of entries as the source page.

**Theory question:** Describe event propagation (capturing, target, and bubbling). Where could event delegation be useful in this application, and what trade-off would it introduce?

> **Answer:**
>
> An event goes through three phases: first **capturing**, where it travels down from `window` through all ancestors to the element that was actually clicked (only listeners registered with `{ capture: true }` run here). Then the **target** phase, where it reaches that element itself. Then **bubbling**, where it travels back up through the same ancestors to `window` — this is the default phase and what most listeners use.
>
> Delegation could make sense for `.comment-container` and `.more_bears`, since both get new elements added after the page already loaded (new comments on submit, new bear cards once the Wikipedia data arrives). For per-item actions like a "delete comment" button, a listener bound directly to the button wouldn't exist yet for comments added later. Instead, one listener on the parent plus `event.target.closest(...)` in the bubbling phase would find out which child was clicked.
>
> Trade-off: one shared listener always needs extra `closest()`/`matches()` logic to figure out what was actually clicked and to filter out clicks that shouldn't count, which is more error-prone than just binding a handler directly to one element.

#### Task 3: Make failures explicit

Add error handling with `try`/`catch` and show useful, user-facing error messages. Check whether each image can be loaded and render a placeholder when it cannot. Do not represent a failed request as valid empty data.

**Theory question:** How do synchronous exceptions and rejected promises travel through this application? Explain where errors should be caught and why catching every error at its source can make failures harder to diagnose.

> **Answer:**
>
> A `throw` inside a `.then()` callback does not crash the app synchronously — the promise machinery catches it automatically and turns the promise returned by that `.then()` into a rejected one. From there it behaves exactly like a rejected `fetch()` promise: it skips every following `.then()` (their callbacks simply don't run) and keeps propagating down the chain until it reaches a `.catch()`. This is exactly what happens in `js/bears.js`: `res.ok` being false throws inside the first `.then()`, and the `try`/`catch` around `extractBears(...)` in the second `.then()` re-throws with a clearer message — both cases skip ahead to the `.catch()` at the end of that chain.
>
> Errors should be caught at a **useful boundary**, not at every place they could occur. In this app that means two different boundaries: `fetchImageUrl()` catches locally and resolves to `PLACEHOLDER_IMAGE`, because one missing bear image is not fatal and the rest of the page should still work. `loadBears()` catches once at the end of its own chain and shows a user-facing error message to tell the user the whole request failed.
>
> If every `fetch`, `.json()`, or property access gets its own try/catch that just logs and returns `undefined`/`{}`, the caller only ever sees empty data — never the actual error. That makes a genuine "no bears" result indistinguishable from a broken request, which is exactly the "failed request as valid empty data" problem this task warns about. Catching once at a meaningful boundary instead keeps the real error message and lets the app show one clear, consistent message to the user instead of many silent, slightly different failures.

#### Task 4: Refactor asynchronous control flow

Replace promise callback chains with `async`/`await` and refactor suitable callbacks to arrow functions. Run independent asynchronous operations concurrently where doing so is safe.

**Theory question:** Explain the relationship between `async`/`await`, promises, the microtask queue, and the browser event loop. Also explain why an arrow function is not always an interchangeable replacement for a regular function, particularly regarding `this`.

> **Answer:**
>
> JavaScript can only run one piece of code at a time (it's single-threaded) — everything currently running sits on the **call stack**, and nothing else happens until the stack is empty again. If a slow operation ran directly on that stack, the whole page (clicks, scrolling, rendering) would freeze until it finished.
>
> `fetch()` avoids that: calling it does not do the actual networking on the JS thread. It immediately returns a pending **promise** and hands the real request off to the browser itself, so the call stack empties right away and the page stays interactive while the request travels over the network. `async`/`await` is just syntax on top of this: an `async` function always returns a promise, and `await` pauses *that function* until the promise it's waiting on settles — it does not pause the browser or block other code from running in the meantime.
>
> Once the response comes back, the code after `await` (or a promise's `.then()`) doesn't run instantly — it gets placed in a waiting line first. The **event loop** is the browser's loop that keeps checking "is the call stack empty?" and, if so, decides what runs next. There are two such waiting lines: the **macrotask queue** (things like timers, click/input events, rendering) and the **microtask queue** (promise callbacks — i.e. `.then()` and everything after an `await`). The rule the event loop follows is: once the call stack is empty, run through the *entire* microtask queue first — one by one, even if a microtask adds another microtask while running — and only once that queue is completely empty does it move on to a single item from the macrotask queue.
>
> Arrow functions do not get their own `this` — they use whatever `this` was in scope where they were defined. Regular `function`s get a `this` set by how they are *called*. This matters directly in `search.js`: the submit handler reads `this.q.value`, which only works because the browser calls it with `this` bound to the `<form>` element it's attached to. Turning that handler into an arrow function would make `this` resolve to the surrounding module scope instead of the form, and `this.q` would be `undefined`.

#### Task 5: Remove remaining code smells

Find and eliminate the remaining bad coding practices. Consider scope, accidental globals, mutation and shared references, function responsibilities, naming, duplication, and DOM update patterns. Document each relevant finding, why it is problematic, and how you fixed it below.

**Theory question:** Select one of your refactorings and explain how JavaScript scope, closures, references, or prototypes caused the original risk. State how you verified that your refactoring preserved behavior.

> **What bad coding practices did you find? Why is it a bad practice and how did you fix it?**
>
> **1. `innerHTML +=` in a loop (`js/bears.js`, `renderBears`) — DOM update pattern**
>
> Each iteration read the container's current `innerHTML`, appended the new bear's HTML as a string, and reassigned it. That forces the browser to re-parse and rebuild *every already-rendered bear* on every single iteration, and it also destroys and recreates the existing "More Bears" heading each time. Fixed by building the HTML for all bears once and inserting it in a single call:
>
> ```js
> // Before: re-parses the whole container on every bear
> uniqueBears.forEach((bear) => {
>   moreBears.innerHTML += html;
> });
>
> // After: one HTML string, inserted once
> const bearsHtml = bears.map((bear) => /* ... */).join('');
> moreBears.insertAdjacentHTML('beforeend', bearsHtml);
> ```
>
> **2. `extractBears` mixed parsing, fetching, and rendering — function responsibilities**
>
> One function parsed the wikitext, fetched every image, deduplicated the results, *and* wrote HTML into the DOM. Split into `getBears(wikitext)` (pure data: parsing + fetching, no DOM access) and `renderBears(bears)` (DOM only):
>
> ```js
> const bears = await getBears(data.parse.wikitext['*']);
> renderBears(bears);
> ```
>
> **3. Duplicated "fetch + check status + parse JSON" logic — duplication**
>
> `fetchImageUrl` and `loadBears` each repeated the same `fetch(...).then(res => { if (!res.ok) throw ...; return res.json(); })` shape. Extracted into one shared helper:
>
> ```js
> async function fetchJson(url, context) {
>   const res = await fetch(url);
>   if (!res.ok) {
>     throw new Error(context + ' responded with status ' + res.status);
>   }
>   return res.json();
> }
> ```
>
> **4. Comment `<li>` attached to the DOM before its children — mutation and shared references / DOM update pattern**
>
> `js/comment.js` called `list.appendChild(listItem)` *before* `namePara`/`commentPara` were appended to `listItem`. It still worked (DOM references stay live), but it means the browser attaches an empty `<li>` and then mutates it twice more in place, instead of building the small subtree once and attaching it a single time:
>
> ```js
> // Before: attach empty node, then mutate it in the live DOM
> list.appendChild(listItem);
> listItem.appendChild(namePara);
> listItem.appendChild(commentPara);
>
> // After: build the subtree first, attach once
> listItem.appendChild(namePara);
> listItem.appendChild(commentPara);
> commentList.appendChild(listItem);
> ```
>
> **5. Leftover `var` declarations — scope**
>
> Several functions in `js/comment.js`, `js/search.js`, and two spots in `js/bears.js` still used `var` even though none of those bindings were ever reassigned. `var` is function-scoped (not block-scoped) and allows accidental redeclaration, so every remaining `var` was switched to `const`, making the "this is never reassigned" guarantee explicit and checked by the engine.
>
> **Accidental globals:** already eliminated in Task 1 — since every script is now an ES module, top-level `const`/`function` declarations live in module scope instead of becoming properties on `window`, so there was nothing further to fix here specifically for this task.


## 2. Dependency- and Build Management Playground
Build the application with ``npm`` and a build and a dependency management tool of your choice (e.g. [Vite](https://vitejs.dev/), [Webpack](https://webpack.js.org/), or others). 

### Tasks

#### Task 1: Establish the build

Set up the project with `npm` and a build tool of your choice (for example, Vite or Webpack). Keep source files separate from generated distribution files and commit the package-manager lockfile.

**Theory question:** Distinguish source, build, distribution, and deployment. What does your build tool do in development and in a production build, and why is the lockfile important for reproducibility?

> **Answer:**
>
> * **Source:** the version-controlled files that are actually edited (`index.html`, `style.css`, `js/*.js`) — kept in the project root and `js`, never generated.
> * **Build:** the process that transforms source into a runnable form. In development this is done on the fly; for production it's an explicit step (`npm run build`) that produces optimized output.
> * **Distribution:** the concrete build output (`dist/`) — a self-contained set of static files that can be handed to any static host, independent of the source tooling used to create it.
> * **Deployment:** copying/publishing the distribution artifacts to the environment where users actually reach them (a web server, CDN, hosting platform).
>
> **Vite in development (`npm run dev`):** starts a dev server that serves each source file as a native ES module over HTTP and transforms files individually and on demand via esbuild — there is no bundling step. This is what makes startup near-instant regardless of project size and enables hot module replacement, at the cost of shipping many small unoptimized module requests (fine for localhost, not for production).
>
> **Vite in production (`npm run build`):** uses Rollup internally to bundle all modules into a small number of files, minifies JS/CSS, tree-shakes unused code, content-hashes filenames for cache-busting, and copies static assets from `public/` — writing the final deployable files to `dist/`.
>
> **Lockfile:** `package.json` typically declares dependency versions as ranges (e.g. `^8.3.0`), so `npm install` run at different times can legitimately resolve different actual versions. `package-lock.json` pins the exact resolved version and integrity hash of every direct *and* transitive dependency.

#### Task 2: Migrate to TypeScript

Use TypeScript as the primary development language and adapt the source files and configuration accordingly. Enable strict checking, model the application's domain data, and validate data received from external APIs before treating it as a typed value.

**Theory question:** TypeScript uses structural typing and erases types during compilation. Explain both concepts and why a compile-time type alone cannot guarantee the shape of a Wikipedia API response at runtime.

> **Answer:**
>
> * **Structural typing:** TypeScript checks types by shape, not by name. An object counts as a `Bear` as soon as it has `name`, `binomial`, `range`, and `image` — nobody has to write `implements Bear` anywhere, unlike in Java or C#.
> * **Type erasure:** Types only exist while `tsc` is checking the code. Once compiled, every type, interface, and `as` cast is gone — the JavaScript running in the browser doesn't know what a `Bear` or `WikipediaParseResult` is anymore.
> * **Why that's a problem here:** `fetch` just gives us raw JSON. Writing `data as WikipediaParseResult` only tells the compiler "trust me" — it doesn't check anything at runtime, and that promise disappears the moment `tsc` finishes. So if Wikipedia ever sends something unexpected, the type alone would not catch it. That's why `src/bears.ts` still checks the real value with `if (data.parse?.wikitext === undefined)` before using it — only an actual runtime check, not a compile-time type, can verify what came back over the network.

#### Task 3: Add static analysis and formatting

Configure ESLint and Prettier using the rulesets below. Resolve all reported errors in the application code and avoid disabling rules without a written justification.

> **Note on the ESLint config:** `eslint-config-standard-with-typescript` is deprecated (`eslint-config-love` is recommended instead) and only works with ESLint 8's old `.eslintrc` format. This project uses `eslint-config-love` with a flat `eslint.config.js` instead — same rule set, maintained, works with current ESLint. Three rules couldn't be satisfied structurally and are disabled for one line each with a reason in the comment..

**Theory question:** What different problems do a linter, a formatter, and the TypeScript compiler detect? Give one concrete example for each from this project.

> **Answer:**
>
> * **Compiler (`tsc`):** wrong *types*. Example: `nameMatch.groups.name` could be `undefined` — `tsc` won't allow it as a plain `string` without a check.
> * **Linter (ESLint):** valid code that's still risky or bad style. Example: `if (!moreBears)` on a nullable DOM element got flagged — had to write `if (moreBears === null)` instead.
> * **Formatter (Prettier):** only *layout* — line breaks, quotes, spacing. Never logic, never types.

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

> **Answer:**
>
> A fixed set of `npm run <script>` names gives developers and CI the same entry points regardless of which build tool, linter, or formatter sits behind them. A developer (or a CI workflow file) only needs to know `npm run build`/`lint`/`format:check` — they don't need to know that this project happens to use Vite, `eslint-config-love`, or Prettier, and swapping any of those tools later would not require touching CI configuration.
>
> **Idempotence** means running an operation multiple times has the same effect (and produces the same result) as running it once — repeating it does not change the outcome further or cause errors.
>
> * `lint`, `format:check`, and `build` are read-only checks (build only reads source and writes to `dist`, which is regenerated identically each time from the same source) — running any of them twice in a row with no source changes leaves the repository in the same state and reports the same result both times.
> * `format` and `lint:fix` are also idempotent in the meaningful sense: they rewrite files to a canonical form (Prettier's formatting rules, ESLint's auto-fixes), so once a file is already in that canonical form, running the script again won't keep re-formatting or re-fixing.
> * `dev` is the exception — it starts a long-running server process rather than performing a one-shot check, so "idempotent" doesn't really apply to it.

#### Task 5: Enforce quality before integration

Configure a pre-commit hook that checks staged code using [husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged). Configure a continuous-integration workflow that installs dependencies from the lockfile and runs the non-mutating build, type, lint, and formatting checks for every push or pull request.

**Theory question:** Compare a local pre-commit hook with a CI quality gate. Why is CI still necessary when hooks are configured, and why should CI use non-mutating checks rather than automatically rewriting source files?

> **Answer:**
>
> A **local pre-commit hook** runs on the developer's own machine, right before a commit is created, and only against the files that are actually staged for that commit. It only lints/formats the changed files, not the whole project.
>
> A **CI quality gate** runs on a server, triggered by `push`/`pull_request`, against the full project in a clean environment with dependencies installed via `npm ci` from the committed `package-lock.json`.
>
> **Why CI is still necessary even with hooks configured:**
> * Hooks are **bypassable** — they can be skipped with `git commit --no-verify`, and a fresh clone doesn't have hooks installed at all until `npm install` runs `prepare`/`husky`.
> * Hooks only see **staged files**, not the whole project, so they can miss issues introduced by files not touched in that commit.
> * Hooks run in whatever environment the developer's machine happens to be in. CI runs in a clean, reproducible environment installed strictly from the lockfile.
> * CI is the **only gate that can't be skipped** before code is merged/reviewed, since it runs on the server regardless of what happened locally.
>
> **Why CI should use non-mutating checks instead of auto-fixing:** CI's job is to *verify* a specific commit, not to *change* it. If CI silently rewrote files (e.g. ran `eslint --fix`/`prettier --write` and let the job pass), a "green" CI run would no longer correspond to the code that was actually pushed/reviewed.


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

> **Answer:** (Angular was chosen instead of React)
>
> Until now the code was entirely imperative: `bears.ts`, `comment.ts`, and `search.ts` call `document.querySelector`, then push updates onto specific nodes by hand (`.insertAdjacentHTML`, `.style.display = ...`, `.textContent = ...`). Angular's model is declarative: the template (`app.html`) describes what the DOM should look like as a function of the component's state, and the framework's own change-detection takes care of reconciling the live DOM to match whenever that state changes.
>
> Angular doesn't use React's exact three-phase vocabulary, but has a close analogue:
> * **Creation:** when a component is instantiated, Angular runs its compiled template function once in "creation mode," building the component's actual DOM nodes and wiring up the static structure.
> * **Change detection (≈ render/reconciliation):** afterwards, whenever something could have changed (a signal being read/written), Angular re-runs each affected component's template function in "update mode." This re-evaluates every binding expression and compares each new value against the one stored from the previous run.
> * **DOM update (≈ commit):** Angular's compiler already knows, for every binding, exactly which DOM node and property it maps to. So where React re-renders a virtual tree and then diffs it against the previous one to discover what to patch, Angular skips that diffing step entirely and writes straight to the one property that actually changed.
>
> Code outside Angular must not touch DOM nodes owned by an Angular root: the framework keeps its own record of "what I last rendered into this node" so that the next change-detection run only has to touch what's different.

#### Task 2: Design the component tree

Decompose the interface into components organised by feature. Use props where appropriate, keep rendering pure, and render bear collections with stable keys.

**Theory question:** Explain how component boundaries and typed props act as contracts. What makes a key stable, why does React need keys during reconciliation, and why is an array index unsuitable when list entries can change order?

> **Answer:**
>
> A component only exposes what it declares as input (Angular: `input<T>()`) — everything about how it renders internally stays private, so parent and child can change independently as long as the input type stays the same. Typed props make that contract machine-checked: `BearCard` declares `bear = input.required<Bear>()`, so passing the wrong shape fails at compile time instead of breaking silently at runtime.
>
> A stable key is a value tied to an item's own identity (not its position) that stays the same across re-renders. `track bear.name` is safe since `getBears` already deduplicates bears by name.
>
> Angular's `@for`/React's list rendering diff the old list against the new one to decide which DOM nodes to keep, move or destroy instead of rebuilding everything. An index is unsuitable once order can change: deleting `A` from `[A, B, C]` leaves `[B, C]`, so index 0 now means `B` instead of `A` and index 1 means `C` instead of `B` — by position alone it looks like every item changed, when really only `A` was removed and `B`/`C` are unchanged. A key tied to identity (not position) matches `B` to `B` and `C` to `C` correctly.

#### Task 3: Model state and interaction

Implement the comment toggle, comment form, and search behavior with React events and state. Use controlled inputs, immutable updates, and derived values rather than duplicate state. Lift state only to the closest common owner that needs it.

**Theory question:** Distinguish props, stored state, and derived values. Explain why direct mutation can produce incorrect React behavior and when lifting state is preferable to introducing context.

> **Answer:**
>
> A prop (Angular: `input()`) is data a component receives from its parent and never changes itself — `CommentToggle`'s `expanded` and `CommentList`'s `comments` are both read-only from the child's side. Stored state is data a component owns and can change on its own, like `CommentsSection`'s `comments`/`commentsExpanded` signals or `CommentForm`'s draft `name`/`text` signals. A derived value isn't stored at all — it's computed on the spot from existing props/state, like `CommentToggle`'s `expanded() ? 'Hide comments' : 'Show comments'` label; storing that as its own state would risk it drifting out of sync with `expanded`.
>
> Both React and Angular (with signals/`OnPush`) decide whether to re-render by comparing a new value to the previous one by reference. Mutating an array/object in place keeps the same reference, so the comparison sees "unchanged" and skips re-rendering even though the data changed.
>
> Lift state to the closest common owner when only a bounded group of components need to coordinate over it — here, `commentsExpanded` and `comments` live in `CommentsSection` since only its three children touch them. Context (Angular: a shared service) becomes preferable once state is needed by many components spread across unrelated branches of the tree, where lifting would mean threading props through components that don't otherwise care about that data.

#### Task 4: Load and represent remote data

Load and validate the bear data within the React application. Represent loading, success, empty, and error states explicitly; prevent stale requests from overwriting newer results; and retain the image fallback behavior from Playground 1.

**Theory question:** Why is fetching data a synchronization with an external system rather than part of pure rendering? Explain how cleanup or cancellation prevents race conditions when a component unmounts or a request becomes irrelevant.

> **Answer:**
>
> Pure rendering describes the UI from the current state/props alone, the same way every time, with no observable side effect and nothing left running afterward. In Fetching, the result depends on something outside the component (the Wikipedia API, the network, timing), it takes unpredictable time. That's why it belongs in a lifecycle hook like `ngOnInit` rather than directly in a template or computed signal — it's synchronizing component state with an external system, not deriving it from existing state.
>
> Because the fetch keeps running after the function that started it returns, two things can go wrong by the time it resolves: the component that asked for it may no longer exist (navigated away, destroyed), or a newer, more relevant request may have started since, making the old one's eventual result stale. `BearList` guards both: `fetchBears()` aborts any previous `AbortController` before starting a new one, and `ngOnDestroy` aborts it when the component is destroyed.

#### Task 5: Add client-side routing and verify the migration

Add at least a list route and a bear-detail route using a stable bear identifier as a route parameter. Use query parameters for optional search/filter view state where appropriate. Verify that every requirement from Playground 1 still works and that all Playground 2 quality commands pass.

**Theory question:** Distinguish client-side rendering, a single-page application, and client-side routing. Compare route parameters with query parameters, and describe one benefit and one cost of the SPA architecture used here.

> **Answer:**
>
> Client-side rendering means the browser, not a server, builds the HTML from JavaScript — the server only ever sends `src/index.html` (basically just `<app-root></app-root>` and a script tag) and Angular renders everything into it. A single-page application means the whole app lives on one page load: navigating from the bear list to a bear's detail page never requests a new HTML document, the existing JS just swaps what's displayed. Client-side routing is the mechanism that makes that swapping feel like separate pages: the Router matches the current URL against `app.routes.ts` and decides which component renders into `<router-outlet>`.
>
> A route parameter (`:name` in `bears/:name`) identifies *which* resource a route renders. A query parameter (`?q=...`) is optional view state layered on top of a route.
>
> Benefit: navigating between the list and a bear's detail page doesn't re-download or re-initialize the app, and state outside `<router-outlet>` (like a half-typed search query in `SearchForm`) survives the navigation, since `App`'s header/nav/footer are never destroyed. Cost: since we chose client-side rendering with no server-side rendering (`ng new` was run with `--ssr=false`), the server only ever sends a near-empty `index.html`; a crawler or link-preview bot that doesn't execute JavaScript sees no bear content at all, on either route — hurting SEO and link previews in a way a server-rendered page wouldn't.

## 4. HTTP, API Design and the Backend for Frontend

Your Playground 3 app calls the Wikipedia API from the browser. In this playground you move that call behind your own backend and give the comment section a real API. Stack for the examples: Node (current LTS), TypeScript, Fastify, zod. Alternatives (Express, Hono, ...) are allowed if your README explains why.

### Tasks

#### Task 1: Set up the API workspace

Turn the repository into an npm workspace with `apps/web` (the existing React app) and `apps/api` (a new Fastify service in TypeScript, strict mode, ESM). The API exposes `GET /health` returning JSON with status, version and uptime. Add a Dockerfile for both apps and a `compose.yaml` so that `docker compose up --build` serves the web app and the API; `npm run dev` starts both with hot reload, with Vite proxying `/api` to the API. Extend ESLint, Prettier, Husky and the CI workflow from Playground 2 so that both workspaces are checked.

**Done:** on a clean clone `docker compose up --build` serves the web app, `curl -i localhost:3000/health` returns 200 with JSON, and CI is green for both workspaces.

**Theory question:** Explain Node's event loop on the server: why does one slow synchronous operation delay every concurrent request, and how does async I/O avoid that? What is a health endpoint for, and who calls it?

> **Answer:**
>
> Node runs all JavaScript on a single thread. The **event loop** takes the next ready callback (an incoming request or a finished DB query) and runs it to completion on that thread. Only when the call stack is empty again the next callback can run.
>
> That is why one slow **synchronous** operation delays *every* concurrent request: while it runs, the event loop is blocked, so no other request handler, timer or I/O callback can run.
>
> **Async I/O** avoids that by not waiting on the JS thread. A fetch, a socket read or a DB query is handed to the operating system (or libuv's thread pool); the handler awaits, which returns control to the event loop right away, and other requests are served in the meantime. When the I/O is done, its callback is queued and the handler continues.
>
> A **health endpoint** is a URL that reports whether the process is alive and able to serve requests. It is mostly called by machines, not users: container engines like Podman/Docker (a compose healthcheck, so dependent services only start once it is healthy), Kubernetes liveness/readiness probes and CI/deploy scripts checking that a new release came up.

#### Task 2: Move the Wikipedia call behind a BFF

Implement `GET /api/bears` and `GET /api/bears/:id`. The API fetches the "List of ursids" page server-side (with a descriptive `User-Agent`, as Wikimedia's policy requires), parses it and returns a normalised, typed `Bear` (`id` as a stable slug of the binomial name, `name`, `binomial`, `imageUrl`, `range`), validated with zod before it leaves the server. Use a timeout for the upstream call; if Wikipedia fails or returns something unexpected, respond with 502 or 504, never with an empty list. Switch the frontend to the BFF: the browser no longer talks to Wikipedia.

**Done:** the web app shows the same bears as before, exclusively via `/api/bears`; with the upstream blocked (for example a wrong hostname in the environment) the UI shows its error state, not an empty page.

**Theory question:** What is a Backend for Frontend, and what moves from the browser to the server when you introduce one (shape of the data, secrets, headers, CORS, failure handling)? Why is an empty 200 on upstream failure worse than a 502?

> **Answer:**
>
> A **Backend for Frontend (BFF)** is a thin server owned by the frontend team that serves exactly one frontend and gives it the data in the shape it needs. Here `apps/api` is the BFF: the browser only calls `/api/...`, the BFF calls Wikipedia.
>
> What moves to the server:
>
> * **Data shape:** parsing the wikitext and validating with zod happen on the server, and the browser receives a typed `Bear`.
> * **Secrets and headers:** keys, tokens and the `User-Agent` live in the server's environment, never in the browser.
> * **CORS:** the browser only talks to its own origin, and server-to-server calls are not subject to CORS.
> * **Failure handling:** timeouts, validating the upstream answer and mapping failures to 502/504 happen in one place.
>
> **Empty 200 vs. 502:** `200 []` falsely says "success, no bears". The client shows "No bears found" instead of an error, caches may store the empty list, and monitoring misses the outage. A 502 is honest: the upstream failed, the client shows its error state and can retry, and monitoring sees the failure.

#### Task 3: Design the comments API

Design and implement a comments resource with `GET /api/bears/:id/comments`, `POST /api/bears/:id/comments` (201 Created with a `Location` header) and `DELETE /api/comments/:commentId` (204 No Content). Validate the request body with zod (author and text non-empty, sensible length limits) and answer 400 for invalid input and 404 for unknown bears or comments. Store comments in memory for now (a `Map`) and connect the comment section of the React app to the API.

**Done:** comments created in the UI survive a page reload but not an API restart (you can explain why; Playground 5 fixes it); `curl` demonstrates 201, 204, 400 and 404.

**curl demo** (API running on `localhost:3000`, e.g. via `npm run dev`):

201 Created with `Location` header:
```bash
curl -i -X POST localhost:3000/api/bears/ursus-arctos/comments -H 'content-type: application/json' -d '{"author":"Lena","text":"Saw one in Slovenia"}'
```

200 OK, list the comments of a bear:
```bash
curl -i localhost:3000/api/bears/ursus-arctos/comments
```

204 No Content (creates a comment, then deletes it):
```bash
ID=$(curl -s -X POST localhost:3000/api/bears/ursus-arctos/comments -H 'content-type: application/json' -d '{"author":"Lena","text":"to be deleted"}' | sed -E 's/.*"id":"([^"]+)".*/\1/'); curl -i -X DELETE localhost:3000/api/comments/$ID
```

400 Bad Request, empty text:
```bash
curl -i -X POST localhost:3000/api/bears/ursus-arctos/comments -H 'content-type: application/json' -d '{"author":"Lena","text":"   "}'
```

400 Bad Request, comment id is not a UUID:
```bash
curl -i -X DELETE localhost:3000/api/comments/42
```

404 Not Found, unknown bear:
```bash
curl -i localhost:3000/api/bears/teddy-bear/comments
```

404 Not Found, unknown comment:
```bash
curl -i -X DELETE localhost:3000/api/comments/00000000-0000-4000-8000-000000000000
```

**Theory question:** Explain safe, idempotent and cacheable methods. Why is POST used for creating and why must DELETE be idempotent? What happens when a client retries a POST after a timeout, and what does that mean for the API?

> **Answer:**
>
> * **Safe:** the request does not change server state (`GET`, `HEAD`, `OPTIONS`).
> * **Idempotent:** sending the request several times has the same effect on the server as sending it once (all safe methods, plus `PUT` and `DELETE`).
> * **Cacheable:** the response may be stored and reused (mainly `GET` and `HEAD`).
>
> **POST** is not idempotent: every call creates a new resource whose id the server chooses, so it answers `201 Created` with a `Location` header. **DELETE** must be idempotent so that clients and proxies can safely retry it: after the first call the comment is gone, and repeating the call changes nothing more (it may answer 404 instead of 204, but the server state is the same).
>
> **Retrying a POST after a timeout:** the client cannot know whether the first request was processed, so a retry may create a **duplicate** comment. An API that must prevent this accepts an `Idempotency-Key` header: the server stores the key with the result and returns the stored result for a repeated key instead of creating the resource again. This API does not do that yet, so duplicates are possible.

#### Task 4: One error format for everything

Introduce typed error classes and a central Fastify error handler that renders every error as RFC 9457 Problem Details (`application/problem+json`): validation errors as 400 with an `errors` array, unknown resources as 404, upstream failures as 502 or 504, anything unexpected as 500 without stack trace or internals. Every response carries a request id (`x-request-id`, generated or taken from the incoming request) that also appears in the log line and in the problem's `instance` field. The frontend parses problem responses and shows `detail` to the user.

**Done:** `curl -i` shows `application/problem+json` and a request id for a 400, a 404, a 502 and a provoked 500; the request id is found in the API log.

**curl demo** (API running on `localhost:3000`, e.g. via `npm run dev`). Every response has `content-type: application/problem+json` and an `x-request-id` header whose value is repeated in the problem's `instance`.

400 Bad Request, validation error with an `errors` array (also sends its own request id, which the API reuses):
```bash
curl -i -X POST localhost:3000/api/bears/ursus-arctos/comments -H 'content-type: application/json' -H 'x-request-id: 6f2b0c1e-8d1a-4f43-9ae8-2f1d2a9b7c55' -d '{"author":"","text":"   "}'
```

404 Not Found, unknown bear:
```bash
curl -i localhost:3000/api/bears/teddy-bear
```

404 Not Found, unknown route:
```bash
curl -i localhost:3000/api/nope
```

502 Bad Gateway, upstream unreachable (start the API with a wrong Wikipedia hostname first):
```bash
WIKIPEDIA_BASE_URL=https://no-such-host.invalid npm run dev:api
curl -i localhost:3000/api/bears
```

500 Internal Server Error, provoked through the debug route (only registered when `ENABLE_DEBUG_ROUTES` is true). The response has a generic `detail`; the real message with internals only appears in the log:
```bash
curl -i localhost:3000/api/debug/error
```

Find the request id in the API log (the terminal running `npm run dev`): every log line of that request carries it as `reqId`, e.g.
```json
{"level":50,"reqId":"bfc46e56-a52e-4d08-aa45-b02fa173b969","err":{"type":"Error","message":"Simulated failure: ..."},"msg":"request failed"}
```

**Theory question:** Why should an API have exactly one error contract? Which information must never leave the server in an error, and how do request ids connect a user's complaint to a log line?

> **Answer:**
>
> **One error contract:** if every error has the same shape (RFC 9457 Problem Details, `application/problem+json`), a client needs exactly one code path to handle failures: check the `status` and `type`, show `detail`, and for validation errors highlight the fields from `errors`. With mixed formats every client has to guess the format per endpoint and breaks as soon as one changes. One contract can also be documented once in the OpenAPI document and handled in one place on the server (the central error handler), so no route can forget it.
>
> **What must never leave the server:** stack traces, SQL statements and database errors, file paths, internal hostnames, IPs and ports, upstream URLs and their raw responses, configuration values, secrets and tokens. For 4xx errors `detail` tells the client what to change; for 5xx errors `detail` stays generic and everything else goes to the log only.
>
> **Request ids:** each request gets an id (taken from an incoming `x-request-id` or generated as a UUID). The same id is sent back in the `x-request-id` header, in the problem's `instance` (`urn:uuid:<id>`) and in every log line of that request (`reqId`). The frontend shows it for server errors ("Reference: ..."), so a user can report it. The support then searches the logs for that id and finds the exact request with the full error and stack trace.

#### Task 5: CORS and the API contract

In development Vite proxies `/api`, so the browser sees one origin. Now serve the built web app from a different origin (for example `vite preview` on port 4173 without the proxy) and observe the failing requests. Configure `@fastify/cors` with an allow-list of origins from the environment and the methods and headers your API needs, and watch the preflight of a `DELETE` and of a JSON `POST` in the browser's network tab. Finally generate an OpenAPI 3.1 document from your zod route schemas (`@fastify/swagger`) and serve it at `/api/docs`.

**Done:** the preflight (OPTIONS) and the successful cross-origin request are visible in DevTools; `/api/docs` lists every route including the Problem Details schema.

**Cross-origin setup:** the web app is Angular, not Vite, so instead of `vite preview` there is a `cross-origin` Angular configuration. It serves the app on port 4173 and, via `define` in `angular.json`, sets `API_BASE_URL` to `http://localhost:3000`, so the browser calls the API directly instead of through the proxy. The default builds keep `API_BASE_URL` empty (same origin, behind the dev proxy or nginx).

The API only accepts the origins listed in `CORS_ORIGINS` (comma-separated). The web app always runs on `http://localhost:4173`; the demo only changes the API's allow-list. Keep the browser's DevTools open on the Network tab (and the Console) the whole time.

**Step 1: the origin is not allowed, so the bears fail to load**
```bash
CORS_ORIGINS=http://localhost:9999 npm run dev:api   # API on :3000, only allows :9999
npm run preview:cross-origin -w apps/web             # web app on http://localhost:4173
```
http://localhost:4173. `GET /api/bears` shows a CORS error, the Console says *"blocked by CORS policy: No 'Access-Control-Allow-Origin' header"*, and the bear list shows its error state. There is no preflight, because a `GET` is a simple request.

**Step 2: allow the origin, everything works**

Stop the API and start it with the correct origin:
```bash
CORS_ORIGINS=http://localhost:4173 npm run dev:api
```
Reload http://localhost:4173. The bears load. Click a bear card to open its detail page (e.g. `/bears/ursus-arctos`), then click "Show comments".
* Adding a comment ("Submit comment"): an `OPTIONS /api/bears/<id>/comments` preflight (because of `content-type: application/json`) answered with 204.
* Deleting a comment ("Delete"): an `OPTIONS /api/comments/<id>` preflight, followed by the `DELETE` (204).

**Step 3: the preflight fails, the comment is not created**

Leave the detail page open in the browser (its data is already loaded). Stop the API and start it again with the wrong origin:
```bash
CORS_ORIGINS=http://localhost:9999 npm run dev:api
```
Add a comment. The `OPTIONS` preflight comes back without `Access-Control-Allow-Origin`, so the browser marks it as a CORS error and **never sends the `POST`**: the request does not reach the API.

**API docs:** the OpenAPI 3.1 document is generated from the zod route schemas: the UI is at http://localhost:3000/api/docs.

**Theory question:** Who enforces CORS, the browser or the server? What is the difference between a simple and a preflighted request? Why can `Access-Control-Allow-Origin: *` not be combined with credentials, and why does a BFF make most CORS problems disappear?

> **Answer:**
>
> **Who enforces CORS:** the **browser**. The server only *declares* with `Access-Control-Allow-*` headers which origins may read its responses; the browser checks these headers and blocks the page's JavaScript if they do not match. Without a browser there is no CORS: `curl` or another server can call the API with any `Origin` header, and the request is executed. So CORS is not access control for the API.
>
> **Simple vs. preflighted request:** a *simple* request uses `GET`, `HEAD` or `POST`, only CORS-safelisted headers, and a `Content-Type` of `text/plain`, `multipart/form-data` or `application/x-www-form-urlencoded`. The browser sends it directly and only checks the response headers. Everything else (`DELETE`, `PUT`, a `POST` with `content-type: application/json` or custom headers) is *preflighted*.
>
> **`*` with credentials:** with credentials (cookies, HTTP auth) the response may contain data of the logged-in user. If `*` were allowed together with credentials, *any* website could make requests in the user's name and read the private answers. Therefore it is forbidden: with `Access-Control-Allow-Credentials: true` the server must name the exact origin.
>
> **Why a BFF makes most CORS problems disappear:** the browser loads the web app and calls `/api` from the **same origin** (dev proxy, nginx), so there is no cross-origin request and no CORS. The BFF calls Wikipedia server-to-server, where CORS does not apply. CORS only becomes relevant again when the frontend and API are served from different origins.

## 5. Persistence and Data Modelling

Your comments live in a `Map` and die with the process. In this playground bears and comments move into PostgreSQL, with migrations, a repository layer and a transaction that survives concurrency. Stack for the examples: PostgreSQL via Docker Compose, Drizzle ORM and drizzle-kit, the `pg` driver. Prisma or another tool is allowed if your README explains why.

### Tasks

#### Task 1: Add PostgreSQL to the stack

Add a `db` service (PostgreSQL, current major version) to `compose.yaml` with a named volume and a healthcheck; the API starts only when the database is healthy and reads its connection string from `DATABASE_URL`. Use a connection pool, not a connection per request, and validate all environment variables with zod at startup. Add `GET /health/ready`, which returns 200 only if the database answers a trivial query, while `/health` stays a pure liveness check.

**Done:** on a clean clone `docker compose up --build` starts db and api; `/health/ready` returns a 503 Problem while the database is stopped and 200 once it is back.

**Demo**:
```bash
podman compose up --build  
```
200, liveness, never touches the database:
```bash
curl -i localhost:3000/health
```

200 `{"status":"ready"}`:
```bash
curl -i localhost:3000/health/ready
```

Stop the database:
```bash
podman compose stop db
```

503 `application/problem+json`, the cause only appears in the log:
```bash
curl -i localhost:3000/health/ready
```

Still 200, the process itself is fine:
```bash
curl -i localhost:3000/health
```

Start the database again:
```bash
podman compose start db
```

200 again, no API restart needed:
```bash
curl -i localhost:3000/health/ready
```

**Theory question:** Liveness versus readiness: who uses each, and what goes wrong if the readiness check includes too many dependencies? Why is a connection pool necessary, and what limits its size?

> **Answer:**
>
> * **Liveness** (`/health`): "Is the process alive?" Called by the container engine or Kubernetes. If it fails, the container is **restarted**. That's why it must not check the database: a database outage would otherwise restart every API instance.
> * **Readiness** (`/health/ready`): "Can this instance serve requests now?" Called by the load balancer or Kubernetes. If it fails, the instance only gets **no traffic** until it is ready again. Nothing is restarted.
>
> **Too many dependencies:** if readiness also checked Wikipedia or other optional services, one of them going down would mark *all* instances as not ready. The whole API would be offline, even for requests that would have worked without that service.
>
> **Why a pool:** opening a database connection is slow (network handshake, login, and PostgreSQL starts a new process per connection). A pool keeps a few connections open and reuses them. If all are busy, a request waits briefly.
>
> **What limits its size:** the database. PostgreSQL allows only `max_connections` (default 100) in total, shared by all API instances, workers and tools. Every connection costs memory on the server.

#### Task 2: Model bears and comments and write the first migration

Define the schema in Drizzle: `bears` (id = slug as primary key, name, binomial, image_url, range, fetched_at) and `comments` (uuid id, bear_id with a foreign key and `ON DELETE CASCADE`, author, text, created_at), plus the indexes you expect to need. Generate the SQL migration with drizzle-kit, commit it, and add `npm run db:migrate` and `npm run db:seed`; the seed fetches the bears through your BFF code from Playground 4 (or from a committed fixture file) and upserts them. `GET /api/bears` now reads from the database.

**Done:** on an empty database `db:migrate` and `db:seed` create the tables and the bears, the migration SQL is in the repository, and the UI works without a live Wikipedia call.

**Theory question:** Why migrations instead of creating tables from code at startup? What does forward-only mean, and what goes wrong when two branches both create migration 0003? Natural key (slug) versus surrogate key (uuid): when is which appropriate?

> **Answer:**
>
> **Why migrations:** `CREATE TABLE IF NOT EXISTS` at startup only creates tables, it never changes them. A new column or index would never reach a database that already exists. Migrations are numbered SQL files in git: every database (laptop, CI, production) runs the same steps in the same order, the SQL can be reviewed in the pull request, and `drizzle.__drizzle_migrations` records which files already ran.
>
> **Forward-only:** a migration that already ran somewhere is never edited. A mistake is fixed with a new migration (`0004_fix_...`).
>
> **Two branches with 0003:** both branches create a `0003` based on `0002`. On merge, `drizzle/meta/_journal.json` conflicts, and both snapshots claim to follow `0002`, so the next `generate` compares against the wrong state. A database where one branch already ran may silently skip the other `0003`. The fix: rebase, delete your own unapplied migration and generate it again on top of `main`.
>
> **Natural vs. surrogate key:**
> * **Natural key** (e.g. slug `ursus-arctos`): fits when the value is unique, never changes and is known at insert time.
> * **Surrogate key** (e.g. UUID): fits when there is no such value, as with comments (two comments can have the same text and author). UUIDv7 is time-ordered, so new rows are inserted at the end of the index.

#### Task 3: Introduce a repository layer

Define `BearRepository` and `CommentRepository` as TypeScript interfaces and implement them with Drizzle. Route handlers and services depend on the interfaces only; the implementation is injected (Fastify decorators or plugin options). Keep the in-memory implementation from Playground 4 and use it in your tests. Comments are now persisted.

**Done:** no route handler contains SQL or ORM calls; comments survive an API restart; the test suite runs against the in-memory repositories without a database.

**Theory question:** What does the repository hide, and what does it cost? Explain the N+1 problem using "comments for all bears" and show how your repository avoids it.

> **Answer:**
>
> **What it hides:** how and where the data is stored. Routes and services call `repos.comments.create(...)` and get a `Comment` back; they don't know about SQL or Drizzle. That's why switching from Drizzle to e.g. Prisma would only touch `repositories/drizzle/`.
>
> **What it costs:**
> * Every query is written twice: once in the interface and once per implementation (here even three times with the in-memory version).
> * The in-memory version can hide bugs that only the database has: constraints, sorting or time zones.
>
> **N+1 problem:** to show all bears with their comments, a naive code loads the bears (1 query) and then runs one comments query per bear inside a loop (N queries). With 8 bears that's 9 round trips to the database.
>
> **How the repository avoids it:** `CommentRepository.listByBears(bearIds)` loads the comments for all bears in **one** query with `WHERE bear_id IN (...)` and groups them in memory by `bear_id`. Together with `bears.list()` that's always 2 queries.
> ```ts
> const bears = await repos.bears.list();
> const comments = await repos.comments.listByBears(bears.map((b) => b.id));
> ```

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
