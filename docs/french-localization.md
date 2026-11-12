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
