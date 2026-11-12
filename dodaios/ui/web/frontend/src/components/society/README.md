# Agent workspace

This directory presents the agent roster, conversations, instructions, memory,
permissions, tools, browser sessions and routines. Agent identity is a static
monogram. Creating, configuring, sharing, pausing and archiving agents use the
existing society APIs.

The former Verse worlds, arcade, progression, animated companions, wardrobe,
figure viewers and their assets have been removed. No agent operation waits
for a spawn, retirement or completion animation.

`figures/figureRecipe.ts`, the metadata-only `figureRegistry.ts` and the
remaining `companion/` schemas are compatibility code. Existing agent rows and
shared templates carry these fields. Keep them readable until a separate data
migration can retire that contract; they no longer load geometry or render an
avatar. The memory graph's independent 3D option is unaffected.

All visible copy uses the existing i18n catalogs. Tests cover the roster,
profile, create dialog, permissions, conversations and static activity labels.
