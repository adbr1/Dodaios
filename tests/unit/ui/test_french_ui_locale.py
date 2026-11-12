"""French native chrome uses the selected interface language, not fallback copy."""

from __future__ import annotations

from types import SimpleNamespace

from dodaios.appshot import card_actions, recording_labels
from dodaios.ui.native_localization import webview_localization
from dodaios.ui.pets import context_menu, notices


def test_native_menu_uses_saved_french_choice(tmp_path) -> None:
    config = tmp_path / "jarvis.toml"
    config.write_text('[ui]\nlanguage = "fr"\n', encoding="utf-8")
    labels, _shortcut = context_menu.preferences(config)
    assert tuple(labels) == (
        "Ouvrir l’application",
        "Réinitialiser la position",
        "Masquer le compagnon",
    )


def test_french_capture_controls_are_complete() -> None:
    config = SimpleNamespace(ui=SimpleNamespace(language="fr"))
    french = card_actions.card_labels(config)
    english = card_actions.card_labels(SimpleNamespace(ui=SimpleNamespace(language="en")))
    assert french.keys() == english.keys()
    assert french["save"] == "Enregistrer"
    assert recording_labels.LABELS["fr"].keys() == recording_labels.LABELS["en"].keys()
    assert recording_labels.LABELS["fr"]["stop"] == "Arrêter et enregistrer"


def test_french_completion_notices_keep_the_agent_name() -> None:
    assert notices.label("task_done", "fr") == "Tâche terminée"
    assert notices.label("result_ready", "fr", name="Ada") == "Ada a terminé"
    assert notices.label("result_failed", "fr", name="Ada") == "Ada a échoué"


def test_native_macos_menus_and_notifications_use_the_french_catalog() -> None:
    from dodaios.i18n import t

    native = webview_localization("fr")
    assert native["cocoa.menu.edit"] == "Édition"
    assert native["cocoa.menu.view"] == "Présentation"
    assert native["cocoa.menu.quit"] == "Quitter"
    assert t("notify.finished_title", "fr", agent="Ada") == "Ada a terminé"
    assert webview_localization("unknown")["cocoa.menu.edit"] == "Edit"
