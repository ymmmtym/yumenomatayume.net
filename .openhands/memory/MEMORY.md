# Project Memory — yumenomatayume.net

HonoX + Cloudflare Workers blog. Package manager: bun.

## Environment quirks (costly to rediscover)

- `bun` is not on PATH by default here. The real binary lives at `~/.local/lib/node_modules/bun/node_modules/@oven/bun-linux-x64/bin/bun` (107 MB). Prepend `export PATH="$HOME/.local/lib/node_modules/bun/node_modules/@oven/bun-linux-x64/bin:$PATH"`.
- The environment is reset between sessions: the bun install above often disappears. Reinstall with `npm install -g bun --prefix /tmp/buninstall`, then symlink `bun` → `/tmp/buninstall/lib/node_modules/bun/node_modules/@oven/bun-linux-x64/bin/bun`. NOTE: the npm package's own `bin/bun.exe` / `bin/bunx.exe` are ERROR STUBS ("Bun's postinstall script was not run"); do NOT use them.
- Do NOT create a shell wrapper named `bun` on PATH: `bun` re-execs itself by name, so a wrapper recurses forever (100% CPU hang), and writing a wrapper over the package's own `bin/bun` path silently clobbers the 107 MB binary. A `bunx` wrapper is fine though: the smoke test spawns the literal command `bunx`, and the npm package ships no working `bunx`, so create `/tmp/bins/bunx` containing `exec "<real-bun-path>" x "$@"` (verified: `bunx --version` = 1.4.4 and `bun run test:smoke` passes). If bun breaks, reinstall it with `npm i bun@1.4.4` in a temp dir and copy `@oven/bun-linux-x64/bin/bun` back.
- `bunx tsc` works only because TypeScript is a transitive dep; it is NOT declared in package.json on `main`. Pinning `typescript` as a devDependency is needed for a reliable `tsc --noEmit` in CI (done in PR #183).
- `mcp/` is a separate subproject (own package.json + package-lock, npm). Its `npm run build` (tsc) was failing on `Cannot find name 'process'` — fixed by adding `"types": ["node"]` to `mcp/tsconfig.json`. Typecheck it with `npm ci && npm run typecheck` from `mcp/`, independently of the root tsconfig.

## Known root causes

- TypeScript 7 (native Go compiler, npm `latest` since 2026-07) ships NO JavaScript compiler API: its package root export is only a version stub, so `ts.TypeFlags` is `undefined`. `tsc --noEmit`/`tsc` still work (binary ships separately). Any tool that `require`s the `typescript` JS API breaks: `honox` → `precinct` → `detective-typescript` → `@typescript-eslint/typescript-estree` → `ts-api-utils` reads `ts.TypeFlags.Intrinsic` and crashes `vite build` with `Cannot read properties of undefined (reading 'Intrinsic')`. The crash is at MODULE LOAD, so it fires when Vite loads `vite.config.ts` (`honox/vite` imports the island-injection plugin → precinct) regardless of whether islands are used. `mcp/` is unaffected (no precinct).
- FIX that worked (PR #187, commit b64b982): add `"ts-api-utils": "1.4.3"` to root `devDependencies`, which forces estree's `^2.x` to nest at `precinct/node_modules/detective-typescript/.../typescript-estree/node_modules/ts-api-utils@2.1.0`, resolving precinct's bundled `typescript@5.9.3` instead of the hoisted root v7.
  - IMPORTANT — that pin was SILENTLY REVERTED by Renovate PR #188 (`ts-api-utils` → `2.5.0`). `main` is currently green ONLY because the committed `bun.lock` still pins estree@**8.48.0** with a NESTED `ts-api-utils@2.1.0` (bun kept the nested entry from the 1.4.3 era). CI uses `bun install --frozen-lockfile`, so it stays green.
  - LATENT BREAKAGE: `rm bun.lock && bun install` resolves estree to the newer **8.72.2**, hoists a single `ts-api-utils@2.5.0`, which then resolves the ROOT `typescript@7` stub → `vite build` crashes again with `Cannot read properties of undefined (reading 'Intrinsic')` (verified: build=1). Do NOT regenerate the lock without re-pinning.
  - `overrides`/`resolutions` do NOT work here. A durable fix would re-anchor the devDep (or pin estree) so a fresh lock regen stays safe.
  - `typescript@^6.0.3` (last JS-API release) runs `build` and `tsc` fine but still fails `tsc --noEmit` on `vite.config.ts` (TS2769 SourceMapInput/IndexSourceMap, rolldown vs rollup types) — a separate pre-existing issue, not TS7-specific.
- Dark-mode toggle knob does NOT slide (the theme colors still switch). In `app/components/Header.tsx` the knob `<svg>` carried `peer-checked:translate-x-5`, but Tailwind compiles `peer-checked:` to the FOLLOWING-SIBLING selector `:is(:where(.peer):checked~*)`. The `<svg>` is a grandchild of the `label` (nested inside the track `<span>`), so `input.peer ~ svg` never matches → knob stays put in both themes; only the track colour (`peer-checked:bg-brand-600` on the sibling span) changes. Verified on production with headless Chromium/CDP: `getComputedStyle(svg).translate` is `none` in both states. Fix: move the transform to the track span as `peer-checked:[&>svg]:translate-x-5` (compiles to `...:is(:where(.peer):checked~*)>svg`); then `translate` = `20px` when dark. Rule of thumb: `peer-*` variants only reach siblings/descendants-of-siblings, never children of the peer itself.
- `app/style.css` `@theme` block must NOT start with `--color-*: initial`. That reset removes the entire default Tailwind palette; the file only redefines gray/purple/indigo/pink, so any `blue-*` / `yellow-*` / `cyan-*` utility used in `app/` emits no CSS (badges, warning callout, search highlight, focus rings all silently unstyled). Verified on production CSS. Fixed in PR #184.
- Verify Tailwind class output by grepping the built file `dist/static/style-*.css` (filename hash changes each build).

## Conventions

- Blog articles: `app/content/blog/`; article images: `public/images/`.
- App source under `app/`; routes in `app/routes/`, components in `app/components/`.
- Repository skills live in `.claude/skills/*/SKILL.md` (ui-ux-enhancement, linear-issue-blog-article, article-proofreading). AGENTS.md says to read the relevant skill before working.
- Run `bun run build` before handoff; `bun run test:smoke` (spawns `bunx wrangler dev` on :8787 — needs `bunx` on PATH; symlink the real bun binary, don't write a wrapper) and `bun test` are the checks. CI also typechecks `mcp/` (`npm ci && npm run typecheck`).
- Renovate config: `renovate.json` (repo root, `config:recommended`). Validate with the standalone binary `~/.bun/install/cache/.bunx-*/renovate@latest/node_modules/.bin/renovate-config-validator <file>` (no token needed; `bun x renovate config-validator` wrongly demands a GitHub token).

## Working notes

- 2026-11-18: Split combined PR #195 into PR #196 (`/privacy`, Closes #194, branch `feat/privacy-policy`) and PR #197 (`/form`, Closes #193, branch `feat/contact-form`); both CI-green and mergeable_state=clean. #195 closed. Issue #133 (Renovate dashboard) closed as not_planned per user request.
  Both PRs touch `scripts/smoke-test.ts` and `app/routes/_renderer.tsx`. To avoid a merge conflict in the shared `PATHS` line, each branch appends its path with a SEPARATE statement at a DIFFERENT anchor (`PATHS.push("/form")` right after the array; `PATHS.push("/privacy")` after the constants block) instead of editing the array literal. Footer edits merge cleanly because the two `<a>` insertions are adjacent-but-distinct lines.
- See `2026-11-15.md` for the issue-#160 / #136–#139 session detail, the #187/#188/#190 ts-api-utils saga, and the #189 dark-mode fix.
- Visual design polish (#137/#138/#139, umbrella #136) merged in PR #186 (`7ff42c9`, 2026-11-15).
  Introduced the `--color-brand-*` violet scale in `app/style.css`, a sticky blurred header
  (`app/components/Header.tsx`), and the hero (`.hero-glow` / `.text-gradient`) on `app/routes/index.tsx`.
  #133 was a Renovate Dependency Dashboard (bot-managed control panel). Closed 2026-11-18 per user instruction; Renovate may recreate it. Note: this file's earlier claim that closing is pointless still holds for Renovate behavior, but the user explicitly asked to close it.
- PR #187 (typescript v7) fixed and mergeable 2026-11-15 (commit `b64b982`); issue #136 closed as completed.
