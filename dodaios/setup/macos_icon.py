"""Shared macOS icon geometry for frozen and source-installed app bundles.

Keep the existing artwork inside an 824 px content box on a 1024 px canvas.
The transparent 100 px inset matches the optical footprint of macOS app tiles;
scaling the entire source preserves the logo, its border and its proportions.
Pillow is loaded only when an icon is actually rendered.
"""
from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from PIL import Image

CONTENT_RATIO = 824 / 1024


def render_icon(source: Image.Image, size: int) -> Image.Image:
    """Return a square RGBA icon with a proportional transparent safe area."""
    from PIL import Image

    if source.width != source.height:
        raise ValueError("An app icon master must be square")
    content_size = max(1, round(size * CONTENT_RATIO))
    artwork = source.convert("RGBA").resize(
        (content_size, content_size), Image.Resampling.LANCZOS
    )
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    offset = (size - content_size) // 2
    canvas.alpha_composite(artwork, (offset, offset))
    return canvas
