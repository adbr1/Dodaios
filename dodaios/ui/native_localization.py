"""Adapt the existing backend catalog to pywebview's native menu keys."""

from __future__ import annotations

from dodaios.i18n.catalog import keys, t

_PREFIX = "ui.webview."


def webview_localization(language: str) -> dict[str, str]:
    """Native menus use the saved UI language when the desktop starts."""
    return {
        key.removeprefix(_PREFIX): t(key, language) for key in keys() if key.startswith(_PREFIX)
    }
