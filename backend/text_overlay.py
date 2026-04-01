from PIL import Image, ImageDraw, ImageFont
import os
import math

def _get_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Try to load a good font, fall back to default."""
    font_names = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for name in font_names:
        if os.path.exists(name):
            try:
                return ImageFont.truetype(name, size)
            except Exception:
                continue
    return ImageFont.load_default()


def add_caption(draw: ImageDraw.Draw, text: str, x: int, y: int, max_width: int = 300):
    """Dark rounded rect with white text."""
    font = _get_font(18, bold=True)
    lines = _wrap_text(text, font, max_width - 20)
    line_height = 22
    box_h = len(lines) * line_height + 16
    box_w = max_width

    # Draw rounded rect background
    draw.rounded_rectangle(
        [x, y, x + box_w, y + box_h],
        radius=8,
        fill=(20, 20, 30, 220),
    )

    ty = y + 8
    for line in lines:
        draw.text((x + 10, ty), line, fill="white", font=font)
        ty += line_height


def add_speech_bubble(draw: ImageDraw.Draw, text: str, x: int, y: int, max_width: int = 250):
    """White oval with tail and black text."""
    font = _get_font(16)
    lines = _wrap_text(text, font, max_width - 30)
    line_height = 20
    box_h = len(lines) * line_height + 24
    box_w = max_width

    # Draw ellipse (bubble)
    draw.ellipse([x, y, x + box_w, y + box_h], fill="white", outline=(180, 180, 180))

    # Draw tail (triangle pointing down)
    tail_x = x + box_w // 2
    tail_y = y + box_h
    draw.polygon(
        [(tail_x - 10, tail_y - 5), (tail_x + 10, tail_y - 5), (tail_x, tail_y + 20)],
        fill="white",
    )

    ty = y + 12
    for line in lines:
        bbox = font.getbbox(line)
        tw = bbox[2] - bbox[0]
        tx = x + (box_w - tw) // 2
        draw.text((tx, ty), line, fill="black", font=font)
        ty += line_height


def add_sfx(draw: ImageDraw.Draw, text: str, x: int, y: int, color: str = "#e63946"):
    """Large bold text with black outline."""
    font = _get_font(48, bold=True)
    # Draw outline
    for dx in range(-3, 4):
        for dy in range(-3, 4):
            if dx * dx + dy * dy <= 9:
                draw.text((x + dx, y + dy), text, fill="black", font=font)
    # Draw text
    draw.text((x, y), text, fill=color, font=font)


def add_text_to_page(
    page_path: str,
    output_path: str,
    overlays: list[dict],
) -> str:
    """Add text overlays to a composited page.

    overlays: list of {type: "caption"|"speech"|"sfx", text: str, x: int, y: int, color?: str}
    """
    img = Image.open(page_path).convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for item in overlays:
        t = item["type"]
        text = item["text"]
        x = item.get("x", 50)
        y = item.get("y", 50)

        if t == "caption":
            add_caption(draw, text, x, y)
        elif t == "speech":
            add_speech_bubble(draw, text, x, y)
        elif t == "sfx":
            add_sfx(draw, text, x, y, item.get("color", "#e63946"))

    result = Image.alpha_composite(img, overlay).convert("RGB")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    result.save(output_path, "JPEG", quality=95)
    return output_path


def _wrap_text(text: str, font, max_width: int) -> list[str]:
    """Wrap text to fit within max_width pixels."""
    words = text.split()
    lines = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        bbox = font.getbbox(test)
        if bbox[2] - bbox[0] <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines or [""]
