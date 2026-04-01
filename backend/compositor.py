from PIL import Image, ImageDraw
from pathlib import Path
import os

def composite_page(
    panel_paths: list[str],
    output_path: str,
    layout: str = "C",
    page_width: int = 1200,
    page_height: int = 1800,
    gutter: int = 10,
) -> str:
    bg = Image.new("RGB", (page_width, page_height), "#080808")

    panels = []
    for p in panel_paths:
        if os.path.exists(p):
            panels.append(Image.open(p))

    if not panels:
        raise ValueError("No panel images found")

    g = gutter
    rects = _get_layout_rects(layout, page_width, page_height, g, len(panels))

    for i, rect in enumerate(rects):
        if i < len(panels):
            x, y, w, h = rect
            panel = panels[i].resize((w, h), Image.LANCZOS)
            bg.paste(panel, (x, y))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    bg.save(output_path, "JPEG", quality=95)
    return output_path


def _get_layout_rects(layout: str, pw: int, ph: int, g: int, num_panels: int) -> list[tuple]:
    """Return list of (x, y, w, h) rects for each panel slot."""
    w = pw - 2 * g  # usable width
    h = ph - 2 * g  # usable height

    if layout == "A":  # 2 panels stacked
        panel_h = (h - g) // 2
        return [
            (g, g, w, panel_h),
            (g, g + panel_h + g, w, panel_h),
        ]
    elif layout == "B":  # 3 panels: full top + 2 bottom
        top_h = int(h * 0.42)
        bot_h = h - top_h - g
        left_w = int(w * 0.44)
        right_w = w - left_w - g
        return [
            (g, g, w, top_h),
            (g, g + top_h + g, left_w, bot_h),
            (g + left_w + g, g + top_h + g, right_w, bot_h),
        ]
    elif layout == "C":  # 4 panels: 2x2 grid
        panel_w = (w - g) // 2
        panel_h = (h - g) // 2
        return [
            (g, g, panel_w, panel_h),
            (g + panel_w + g, g, panel_w, panel_h),
            (g, g + panel_h + g, panel_w, panel_h),
            (g + panel_w + g, g + panel_h + g, panel_w, panel_h),
        ]
    elif layout == "D":  # 5 panels: full top + 3 middle + full bottom
        top_h = int(h * 0.35)
        bot_h = int(h * 0.35)
        mid_h = h - top_h - bot_h - 2 * g
        col_w = (w - 2 * g) // 3
        return [
            (g, g, w, top_h),
            (g, g + top_h + g, col_w, mid_h),
            (g + col_w + g, g + top_h + g, col_w, mid_h),
            (g + 2 * (col_w + g), g + top_h + g, col_w, mid_h),
            (g, g + top_h + g + mid_h + g, w, bot_h),
        ]
    elif layout == "E":  # splash: single full page
        return [(g, g, w, h)]
    else:
        raise ValueError(f"Unknown layout: {layout}")
