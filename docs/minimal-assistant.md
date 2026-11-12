# Minimal assistant: Verse retirement and macOS icon geometry

## Scope and dependency audit

The main navigation already had no Verse route. The remaining game surface
was reachable through agent appearance menus, profile tabs and the create
form. The import graph also retained the figure viewer, animated companion
renderers and legacy model assets through those controls and the default
recipe's asset registry.

Removed:

- Island, Mars, arcade and 3D room renderers, wardrobe and figure editors,
  animated companions, spawn/retirement ceremonies and completion flourishes.
- Agent appearance actions and tabs; agent identities now use static initials.
- XP/ranks/rewards service startup, action endpoints and agent-hire awards;
  achievement toast presentation and ship/world game dictionaries.
- Independent game assets and obsolete tests for the removed functionality.
- `@react-three/fiber` and `@react-three/drei` and their unused lockfile subtree.

Preserved:

- Agent runtimes, models, permissions, creation, sharing, pausing and archiving.
- Conversations, typing/activity status, memory, tools, routines, webhooks,
  computer/browser connections and the independent memory graph.
- Existing avatar/recipe schemas and catalog metadata, because stored agent
  records and shared templates still carry them. They load no geometry and
  expose no cosmetic editor. Removing their wire/storage fields needs a separate
  migration, rather than silently invalidating existing records.
- Historical event definitions and on-disk progression data. This change neither
  loads the progression database nor deletes user data.
- Generic terminal presentation/borrowing code, shared by essential IDE paths.

The retired APIs are `/api/progression/*` and the custom figure asset routes.
No remaining UI imports their clients. This is separate from the ordinary
agent, memory and device APIs.

## macOS icon

The existing 1024 px logo occupied the entire canvas. Both the release ICNS
builder and the source-install iconset builder now call
`dodaios/setup/macos_icon.py`: the unchanged artwork occupies an 824 px content
box centred in a transparent 1024 px canvas. Smaller sizes use the same ratio
and Lanczos resampling. Windows/Linux icons and the source logo are unchanged.

The release ICNS includes 16, 32, 64, 128, 256, 512 and 1024 px members, including
Retina representations. The 16 px Finder member is explicitly added because
Pillow does not emit it by default. `--check` verifies both membership and safe
areas. The macOS packaging script regenerates the icon on every build, so a
stale tracked ICNS cannot bypass the corrected geometry.

Dock, Finder and Cmd-Tab obtain the same icon via the existing app-bundle
configuration. No signing, bundle identity or LaunchServices setting changes.

## Verification

From the repository root:

```bash
python packaging/macos/make_icns.py --check
pytest -q tests/unit/packaging/test_macos_icon_geometry.py \
  tests/unit/packaging/test_macos_build_script.py \
  tests/unit/packaging/test_macos_privacy_strings.py \
  tests/unit/setup/test_macos_app_bundle.py tests/unit/setup/test_macos_dock.py
pytest -q tests/unit/society/test_roster.py \
  tests/unit/society/test_agent_config_pane.py \
  tests/unit/ui/web/test_society_routes.py \
  tests/unit/ui/web/test_society_team_routes.py \
  tests/contract/test_society_one_click_create.py
cd dodaios/ui/web/frontend
npm ci
npm test -- --maxWorkers=3
npm run build
```

The implementation environment is Linux. A native macOS build correctly refuses
to run there. `DRY_RUN=1 bash packaging/macos/build.sh` exercises the packaging
command plan, not compilation, signing or a real macOS display.

On a Mac with the documented build dependencies:

```bash
bash packaging/macos/build.sh
python scripts/ci/check_frozen_macos_app.py --app dist/Dodaios.app
```

Open the new app from Finder and compare its icon with native apps in the Dock,
in Finder at several icon/list sizes, and in Cmd-Tab, including on Retina.
Use the newly built app rather than an older cached bundle. Native optical
comparison remains a Mac validation step; PNG/ICNS checks are not a substitute.

### Results in this checkout

- macOS icon/bundle/packaging tests: **119 passed**.
- Agent create/configure/archive, team, browser and memory tests: **78 passed**.
- Full frontend run: **7,452 assertions passed**; three suites could not load
  because a temporary dependency symlink put material-icon assets outside
  Vite's allowed root. After installing dependencies inside this checkout,
  those suites passed. The focused asset/i18n rerun passed 340 tests and the
  explorer rerun passed six. The symlink is no longer used.
- TypeScript and Vite production build: passed. Final artifact audit found no
  GLB files and no Verse/arcade game strings. Old generated chunks retained by
  the normal publication grace period were pruned from this isolated preview.
- Chromium settings checks with API fixtures: no Verse/game controls and no
  horizontal overflow at 1440 or 960 px. These are UI checks, not a real backend
  or native macOS smoke test. The built create-agent dialog also rendered
  without a cosmetic editor or JavaScript errors.
- Icon safe-area checks, changed Python helper lint, documentation checks,
  shell syntax and `git diff --check`: passed. The server's existing unsorted
  router import block remains an `I001` lint finding, also reproduced on main.
- Native macOS builds: Apple Silicon and Intel installers passed on GitHub's
  macOS runners (see the run below), including frozen-bundle and DMG validation.
  Dock, Finder and Cmd-Tab optical comparison is still **not validated**.
- Desktop boot-budget measurement: **not validated**. The isolated desktop
  harness did not reach its anchor within 120 seconds in this Linux environment.
  The focused API tests above do not establish a working native desktop boot.

The changes are recorded on the installer build branch. The exact added, modified
and deleted paths relative to the upstream base are listed in [minimal-assistant-files.txt](minimal-assistant-files.txt).

## Building the requested DMGs on GitHub macOS runners

The existing `desktop-installers.yml` manual workflow now accepts a `platform`
choice. Its default remains `all`; selecting `macos` runs the existing Apple
Silicon and Intel jobs without also building Windows and Linux installers.
Tag and scheduled builds retain their previous behaviour. The existing build,
app-bundle checks and artifact uploads remain the source of truth.

Once the reviewed source branch is present in the user's fork:

```bash
gh workflow run desktop-installers.yml --repo OWNER/REPOSITORY \
  --ref feat/minimal-assistant-macos-icon -f platform=macos
```

The workflow uploads `installer-macos-arm64` and `installer-macos-x64` artifacts
containing the DMGs. A manual branch build is not published as a release and is
not Apple-notarized.

The authorized build branch is now pushed to `adbr1/Dodaios`. On this new fork,
GitHub initially did not register the inherited manual workflows. The dedicated
`minimal-macos-build.yml` workflow registers through a branch-scoped push trigger
and runs the same native packaging script on Apple Silicon and Intel runners.
It uploads `Dodaios-macOS-arm64` and `Dodaios-macOS-x64`, each containing a DMG
and SHA-256 checksum. It does not publish a release or modify `main`.

The native build of source commit `b56449044789d7131112f894d034d1ea55afedb6`
is tracked at <https://github.com/adbr1/Dodaios/actions/runs/43140875764>.
Both native jobs passed the icon tests, packaging, frozen-bundle validation
and `hdiutil verify`, and uploaded their installers and SHA-256 checksums:

- [Apple Silicon artifact](https://github.com/adbr1/Dodaios/actions/runs/43140875764/artifacts/13910176114)
- [Intel artifact](https://github.com/adbr1/Dodaios/actions/runs/43140875764/artifacts/13909813965)

The artifacts are retained for 14 days. Downloading their ZIPs into this Linux
environment was blocked by its access to GitHub's artifact storage (HTTP 403).
Checksums were calculated on the native runners; they were not independently
rechecked here. Downloads remain available through the GitHub artifact links.
Both builds use ad-hoc signing and are not Apple-notarized. Finder, Dock and
Cmd-Tab visual inspection still requires opening the application on a Mac.


### Runtime Dock override

The running process previously replaced the bundle icon with a full-bleed PNG.
`apply_macos_dock_icon()` now uses the shared `render_icon()` safe area before
constructing the AppKit image from PNG bytes. On macOS, `webview.start()` receives
no raw PNG override, so it cannot undo that normalization. Linux and Windows
keep their existing icon paths. The runtime and packaging icon regression tests
pass together (19 passed, one platform-specific skip on Linux).

### French and visible Agents in the replacement installers

The replacement builds integrate French into this same minimal branch and
restore an explicit Agents navigation button. See [French localization](french-localization.md)
for verified Intel and Apple Silicon downloads, regression results and the file
list. The earlier installers linked above predate the French integration.
