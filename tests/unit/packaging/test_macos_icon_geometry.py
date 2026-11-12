"""The app has one optical footprint in Dock, Finder and the app switcher."""
from __future__ import annotations

import runpy
from pathlib import Path

import pytest

from dodaios.setup.macos_icon import CONTENT_RATIO, render_icon

Image = pytest.importorskip("PIL.Image")
ROOT = Path(__file__).resolve().parents[3]


@pytest.mark.parametrize("size", [16, 32, 64, 128, 256, 512, 1024])
def test_icon_has_a_proportional_transparent_safe_area(size: int) -> None:
    source = Image.new("RGBA", (1024, 1024), (20, 40, 60, 255))
    result = render_icon(source, size)
    content = round(size * CONTENT_RATIO)
    offset = (size - content) // 2
    assert result.size == (size, size)
    assert result.getchannel("A").getbbox() == (
        offset, offset, offset + content, offset + content
    )
    assert result.getpixel((0, 0)) == (0, 0, 0, 0)
    assert result.getpixel((size // 2, size // 2)) == (20, 40, 60, 255)


def test_padding_preserves_the_existing_logo() -> None:
    with Image.open(ROOT / "assets/icons/dodaios-1024.png") as source:
        expected = source.convert("RGBA").resize((824, 824), Image.Resampling.LANCZOS)
        actual = render_icon(source, 1024).crop((100, 100, 924, 924))
        # Transparent RGB is immaterial; compare exactly how the logo composites.
        background = Image.new("RGBA", expected.size, "white")
        assert Image.alpha_composite(background, actual).tobytes() == (
            Image.alpha_composite(background, expected).tobytes()
        )


def test_icns_build_and_check_cover_finder_and_retina_sizes(tmp_path: Path) -> None:
    generator = runpy.run_path(str(ROOT / "packaging/macos/make_icns.py"))
    target = tmp_path / "dodaios.icns"
    generator["build"](target)
    assert generator["verify"](target) == [16, 32, 64, 128, 256, 512, 1024]
    assert generator["verify"](ROOT / "assets/icons/dodaios.icns") == [
        16, 32, 64, 128, 256, 512, 1024
    ]
