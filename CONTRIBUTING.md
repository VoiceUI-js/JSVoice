
# Contributing to JSVoice

Thanks for your interest in contributing! 🎉  
We welcome improvements from the community, especially during **Hacktoberfest**.

---

## 🧭 Project Layout (for Contributors)

```

jsvoice/
└─ src/
├─ modules/
│  ├─ actions/             # Interactive actions live here
│  │  ├─ ClickAction.js
│  │  ├─ FillInputAction.js
│  │  ├─ ScrollAction.js
│  │  └─ ZoomAction.js
│  ├─ BuiltInActions.js
│  ├─ CommandProcessor.js
│  └─ RecognitionManager.js
├─ utils/
│  └─ helpers.js
├─ JSVoice.js              # Public class (facade – keep API stable)
└─ index.js                # Package entry (re-exports JSVoice)
examples/                     # Runnable demos of the library
docs/                         # Documentation improvements go here

````

> ✨ **Goal:** Encourage contributors to add **new actions** under `actions/`, **examples** under `examples/`, and improve documentation in `docs/`.

---

## 🚀 Getting Started

1. **Fork** this repository and **clone** your fork:
```bash
   git clone https://github.com/<your-username>/jsvoice.git
   cd jsvoice
````

2. **Install dependencies** (Node.js 16+ recommended):

   ```bash
   npm install
   ```
3. **Create a feature branch**:

   ```bash
   git checkout -b feat/add-dark-mode-action
   ```
4. Make your changes (code, examples, or docs).
5. **Commit** with a clear message:

   ```bash
   git commit -m "feat: add dark mode toggle action"
   ```
6. **Push** and open a Pull Request to the `main` branch:

   ```bash
   git push origin feat/add-dark-mode-action
   ```

---
## 🧩 Adding a New Interactive Action

All actions live in `src/modules/actions/`. An action is a tiny module that:

1. Create a new file in `src/modules/actions/`, e.g. `ToggleDarkModeAction.js`.
2. Implement the action with:
   * `name` → unique action name
   * `test(phrase)` → return `true` if the spoken phrase matches
   * `run(phrase, ctx)` → perform the action
3. Import and register it inside `src/modules/BuiltInActions.js`.
4. Add a runnable **demo** for it inside `examples/<your-action>/`.

---
## example
### 1) Create the file

Create `src/modules/actions/<YourActionName>.js` (PascalCase for the filename). Example skeleton:

```js
// src/modules/actions/ToggleDarkModeAction.js

/**
 * Action contract:
 *  - export default { name, test(phrase), run(phrase, ctx) }
 *  - test: returns true if the phrase is for this action
 *  - run: performs the action, returns true on success (sync or async)
 *
 * ctx:
 *  - ctx.win (Window), ctx.doc (Document)
 *  - ctx.onStatusChange?(msg: string)
 *  - ctx.onActionPerformed?(actionName: string, payload?: any)
 */

const phrases = [
  'toggle dark mode',
  'switch theme',
  'dark mode on',
  'dark mode off'
];

export default {
  name: 'toggleDarkMode',

  test(phrase) {
    const p = phrase.toLowerCase().trim();
    return phrases.some(x => p.includes(x));
  },

  run(phrase, ctx) {
    const root = ctx.doc.documentElement;
    const prev = root.dataset.theme || 'light';

    // naive toggle: light <-> dark
    const next =
      phrase.includes('off') ? 'light' :
      phrase.includes('on')  ? 'dark'  :
      (prev === 'dark' ? 'light' : 'dark');

    root.dataset.theme = next;

    ctx.onStatusChange?.(`Theme: ${next}`);
    ctx.onActionPerformed?.('toggleDarkMode', { theme: next });

    return true;
  }
};
```

### 2) Register the action

Open `src/modules/BuiltInActions.js` and **import + add** your action to the exported list:

```js
// src/modules/BuiltInActions.js
import ScrollAction from './actions/ScrollAction';
import ZoomAction from './actions/ZoomAction';
import ClickAction from './actions/ClickAction';
import FillInputAction from './actions/FillInputAction';
import ToggleDarkModeAction from './actions/ToggleDarkModeAction'; // ← add this

// Export an array – order matters if phrases overlap
export default [
  ScrollAction,
  ZoomAction,
  ClickAction,
  FillInputAction,
  ToggleDarkModeAction, // ← and list it here
];
```

### 3) Add tests (optional)

Create a test like `tests/actions/ToggleDarkModeAction.test.js`:

```js
import Action from '../../src/modules/actions/ToggleDarkModeAction';

const fakeCtx = () => ({
  win: global.window,
  doc: global.document,
  onStatusChange: jest.fn(),
  onActionPerformed: jest.fn(),
});

describe('ToggleDarkModeAction', () => {
  test('matches phrases', () => {
    expect(Action.test('toggle dark mode')).toBe(true);
    expect(Action.test('please switch theme')).toBe(true);
    expect(Action.test('zoom in')).toBe(false);
  });

  test('toggles dataset theme', () => {
    const ctx = fakeCtx();
    document.documentElement.dataset.theme = 'light';
    const ok = Action.run('toggle dark mode', ctx);
    expect(ok).toBe(true);
    expect(document.documentElement.dataset.theme).toMatch(/dark|light/);
    expect(ctx.onActionPerformed).toHaveBeenCalledWith('toggleDarkMode', expect.any(Object));
  });
});
```

Run tests:

```bash
npm test
```

## 4)📖 Documentation Contributions

* Add guides, API explanations, or tutorials in the **`docs/`** folder.
* Link them from the main README if they’re important for users.
* Examples:

  * `docs/getting-started.md`
  * `docs/adding-actions.md`
  * `docs/browser-support.md`

---

## 🧪 Creating a Runnable Example

All demos live in the **top-level** `examples/` folder.

### 1) Add a subfolder

Create `examples/toggle-dark-mode/` with at least:

```
examples/
└─ toggle-dark-mode/
   ├─ index.html
   └─ demo.js
```

### 2) Minimal `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>JSVoice Demo — Toggle Dark Mode</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root[data-theme="dark"] { background:#111; color:#eee; }
      :root[data-theme="light"] { background:#fff; color:#111; }
      body { font-family: ui-sans-serif, system-ui; padding: 24px; }
      button { font-size: 16px; padding: 8px 12px; }
      #status { margin-top: 12px; }
    </style>
  </head>
  <body data-theme="light">
    <h1>JSVoice — Toggle Dark Mode</h1>
    <button id="micBtn">🎤 Mic</button>
    <p id="status">Say “toggle dark mode” / “dark mode on/off”.</p>

    <!-- Assuming a UMD build exists; otherwise replace with a dev import path -->
    <script src="../../dist/jsvoice.umd.js"></script>
    <script src="./demo.js" type="module"></script>
  </body>
</html>
```

### 3) `demo.js`

```js
// If publishing UMD: const JSVoice = window.JSVoice;
import JSVoice from '../../dist/jsvoice.esm.js'; // adjust to your build output

const status = document.getElementById('status');
const micBtn = document.getElementById('micBtn');

const voice = new JSVoice({
  onStatusChange: (msg) => status.textContent = msg,
  onError: (e) => console.error(e),
});

micBtn.addEventListener('click', () => voice.toggle());
```

> ✅ Keep examples **self-contained**, no bundlers. They should work when opened via a local server (e.g., `npx http-server` from repo root).




---

## 📌 Guidelines

* Keep the **public API (`JSVoice.js`) stable**.
* Prefer **small PRs** focused on one change.
* Update **README**, `docs/`, or `examples/` if your change affects usage.
* Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

  * `feat:` new feature
  * `fix:` bug fix
  * `docs:` documentation only
  * `refactor:` code refactor without changing features
  * `chore:` tooling/config changes

---

## 🏷 Labels We Use

* `good first issue` — beginner-friendly
* `help wanted` — we’d love assistance
* `enhancement` — new features/improvements
* `bug` — fixes needed
* `docs` — documentation tasks
* `hacktoberfest` — Hacktoberfest-eligible tasks

---

## 🔄 Pull Request Checklist

* [ ] Code compiles without errors
* [ ] Example added under `examples/` (if relevant)
* [ ] Docs updated under `docs/` (if relevant)
* [ ] README/docs updated (if necessary)
* [ ] PR description explains **what** & **why**

---

## 🙏 Code of Conduct

By participating, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).
Be kind, be respectful, and have fun.

---

## 🎃 Hacktoberfest

We welcome Hacktoberfest contributions! Look for issues labeled `hacktoberfest`, `good first issue`, or `help wanted`.

---

Thanks for helping improve **JSVoice** 💜



