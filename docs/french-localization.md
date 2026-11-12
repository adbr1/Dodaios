# French interface in the minimal assistant fork

## Shipped scope

French (France) is an interface language in Settings > Language & app and in
the first-run wizard. The existing UI locale code is `fr`; the document and
regional formatting use `fr-FR`. The implementation uses the existing Zustand
translator, its lazy JSON sections and its English fallback. It adds no i18n
framework or runtime dependency.

The catalog contains 13,283 entries across the root dictionary and twelve
lazy sections: agent management, memory, onboarding, appshot editing, providers,
computers, local models, marketplace, custom CLI, change review, self-building
and trust. Retired Verse dictionaries and game namespaces are not restored.
Technical names, model identifiers, filenames, CLI commands and product names
remain intact. Provider-generated errors and content are not translated by the
static UI catalog. The language of model replies remains the existing separate
setting; Automatic follows the user's conversation language. French is also
available as an explicit reply-language choice.

The interface language is accepted by the backend route, config schema, config
writer and control override validator. It is saved in the existing TOML setting
and localStorage cache, broadcast through the existing event, and restored when
the frontend or backend starts again. Dates and numbers use the existing
format helpers with the French locale. Startup/recovery copy comes from the
same locale dictionaries instead of a second handwritten table in HTML.
Native capture controls and notices include French. The existing backend phrase
catalog adds 354 French system/status/error entries and native webview menu
labels. Native menus use the saved interface language when the desktop starts. The existing shared macOS
privacy-string table also generates `fr-FR.lproj/InfoPlist.strings` before signing.

## Agents remain available

The upstream base already marked the named Agents section as retired and omitted
it from the compact sidebar. This fork restores its listed navigation entry and
an explicit Agents button in both expanded and collapsed sidebars. Agent roster,
creation, conversations, tools, memory and routines use their existing views and
APIs. The previously removed game renderers and appearance editors stay removed.

## Verification and maintenance

```bash
cd dodaios/ui/web/frontend
npm ci
npm test -- --maxWorkers=3
npm run build
cd ../../../..
python scripts/ci/check_french_frontend.py --dist dodaios/ui/web/dist
pytest -q tests/integration/test_ui_language_route.py \
  tests/unit/ui/test_french_ui_locale.py \
  tests/unit/packaging/test_macos_privacy_strings.py
```

`fr-locale-parity.test.ts` compares every French dictionary with its English
counterpart, including all interpolation occurrences. It exercises lazy loading,
English fallback, localStorage reload and server hydration. The real
`FrenchLanguageSelection.test.tsx` selects Français in the rendered settings and
checks the resulting labels and persistence. Sidebar tests exercise the Agents
button at expanded and rail widths.

For a native macOS package, the branch workflow runs these regression tests,
creates the DMG with the existing packaging script, validates the frozen bundle
and checks its actual frontend files with:

```bash
python scripts/ci/check_french_frontend.py --app dist/Dodaios.app
```

The artifact check rejects a bundle lacking any French lazy section or the
visible Agents button, even if the source checkout contains the translations.
It is a content check; interactive selection is covered separately. A development
DMG is ad-hoc signed and not Apple-notarized. Live native GUI and OS permission
dialog rendering require a Mac; a Linux browser fixture does not establish them.

When adding English keys, add the matching French keys and preserve every
placeholder. Prefer concise infinitives for actions, sentence case, consistent
vouvoiement and standard technical names (API, CLI, Git, prompt, plugin, Skill).
Rebuild the frontend before inspecting the desktop UI: it serves `dist`, not the
source tree. Do not commit generated frontend files.

## Verification results for the installer source

- Full frontend suite: 781 files, 7,608 tests passed. Follow-up regression runs
  after the final locale and reply-language edits passed 282 tests, then 61
  selection/navigation/parity tests after the last wording refinements.
- TypeScript and Vite production compilation passed. The artifact checker passed
  against the newly built `dist`.
- Chromium checks against that production build and API fixtures selected French,
  retained it across reload, found no horizontal page overflow at 1440 and
  960 px, opened Agents through the restored button and opened its French
  creation dialog. No page JavaScript errors were reported. These fixtures do
  not establish a live provider connection or actual agent execution.
- Backend catalog, language resolution, UI persistence, native menus and WebView
  profile regression group: 262 passed, one platform-specific skip.
- Agent roster/create/configure/archive and team API group: 78 passed.
- macOS icon, privacy localization and frozen-bundle validation tests: 95 passed,
  one platform-specific skip locally. Reply/settings route group: 10 passed.
  Legacy voice acknowledgement/failure groups: 102 passed. Counts overlap.
- Ruff passed on the changed Python files apart from two pre-existing findings
  in `desktop_app.py`: E501 at line 525 and S112 at line 1047. New helpers pass
  formatting checks. Documentation checks and `git diff --check` passed.
- Native macOS installer builds for source commit
  `e6528e270bbafd13c8f5e6b2949ca23157232428` are tracked at
  <https://github.com/adbr1/Dodaios/actions/runs/43204113111>.

The exact file list for this repair is in
[french-localization-files.txt](french-localization-files.txt).

## Verified installer downloads

- [Apple Silicon DMG artifact](https://github.com/adbr1/Dodaios/actions/runs/43206892246/artifacts/13940692915):
  native ARM64 on the supported macOS 26 runner, source commit
  `df46981f63df664d9501b2d7b765543e7441d309`. Native icon, translation,
  settings/navigation tests, frozen-bundle validation, packaged French checks
  and DMG verification all passed.
- [Intel DMG artifact](https://github.com/adbr1/Dodaios/actions/runs/43204113111/artifacts/13936204995):
  macOS 15 Intel runner, application source commit
  `e6528e270bbafd13c8f5e6b2949ca23157232428`. The same tests and artifact
  validations passed. The run is marked cancelled because its redundant ARM64
  retry was stopped after a runner was acquired for the separate ARM64 build;
  the successful Intel job and its uploaded artifact are preserved.

The application code in these two source commits is identical. The intervening
changes add verification documentation/tests and a separate ARM64 workflow. The
original ARM64 job could not acquire a macOS 15 hosted runner within 15 minutes;
GitHub reported capacity constraints. The separate branch-only workflow uses the
supported macOS 26 ARM64 pool and explicitly verifies `uname -m` before building.

GitHub retains each ZIP for 14 days. Each ZIP contains the DMG and its SHA-256
checksum. The checksums and `hdiutil verify` were executed on the native runners;
the artifact storage download was blocked from this Linux environment, so no
independent local checksum verification is claimed. These are ad-hoc-signed,
non-notarized development builds, with no release or main-branch merge.

To replace an older installed build, quit Dodaios with Command-Q, mount the new
DMG, replace the copy in Applications and launch that copy. Select Français under
Settings > Language & app > Interface Language. Agents is directly available in
the sidebar; no stored agents or conversations are deleted by these changes.
