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
* other Playgrounds TBA by Thomas Berger

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
