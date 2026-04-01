import json
import os
import zipfile
import io
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from providers import higgsfield, vertex
from compositor import composite_page
from text_overlay import add_text_to_page

app = FastAPI(title="RIKU — Comic Studio")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR.parent / "data"

# Ensure data directory exists
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Mount static files
app.mount("/data", StaticFiles(directory=str(DATA_DIR)), name="data")

CHARACTER_ANCHOR = (
    "anime manga illustration, Japanese teenage girl named Riku, "
    "long flowing crimson red hair, sharp golden amber eyes, curvy athletic figure, "
    "dark navy sailor school uniform seifuku, fitted short skirt, "
    "slightly unbuttoned collar showing collarbone, white collar with red ribbon, "
    "wielding a silver katana with red tassel, Demon Slayer art style, "
    "ultra detailed, vibrant colors"
)

DEFAULT_SETTINGS = {
    "higgsfield_api_key": "981166a3-7319-41e6-bd11-64c266061ce2:1fcd8dc35bc90cef8772c54f7db54d0f47abac4732dc7f10d75309068c26eb6f",
    "vertex_api_key": "",
    "provider": "higgsfield",
    "character_anchor": CHARACTER_ANCHOR,
    "page_width": 1200,
    "page_height": 1800,
    "gutter_size": 10,
}


def _read_json(path: Path, default=None):
    if path.exists():
        with open(path, "r") as f:
            return json.load(f)
    return default


def _write_json(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


def _get_settings() -> dict:
    settings_path = DATA_DIR / "settings.json"
    settings = _read_json(settings_path, DEFAULT_SETTINGS.copy())
    # Ensure all default keys exist
    for k, v in DEFAULT_SETTINGS.items():
        if k not in settings:
            settings[k] = v
    return settings


def _get_page_dir(page_num: int) -> Path:
    return DATA_DIR / "pages" / f"page_{page_num:03d}"


def _get_page_meta(page_num: int) -> dict:
    page_dir = _get_page_dir(page_num)
    meta_path = page_dir / "meta.json"
    return _read_json(meta_path, {"page": page_num, "panels": {}, "status": "pending"})


def _save_page_meta(page_num: int, meta: dict):
    page_dir = _get_page_dir(page_num)
    page_dir.mkdir(parents=True, exist_ok=True)
    _write_json(page_dir / "meta.json", meta)


# --- Models ---

class GeneratePanelRequest(BaseModel):
    page: int
    panel: int
    prompt: str
    provider: str = "higgsfield"


class CompositePageRequest(BaseModel):
    page: int
    layout: str = "C"


class TextOverlay(BaseModel):
    type: str
    text: str
    x: int = 50
    y: int = 50
    color: str = "#e63946"


class AddTextRequest(BaseModel):
    page: int
    overlays: list[TextOverlay]


# --- Endpoints ---

@app.get("/api/story")
async def get_story():
    story_path = DATA_DIR / "story.json"
    data = _read_json(story_path)
    if data is None:
        raise HTTPException(status_code=404, detail="story.json not found")
    return data


@app.post("/api/story")
async def save_story(story: dict):
    story_path = DATA_DIR / "story.json"
    _write_json(story_path, story)
    return {"status": "saved"}


@app.get("/api/page/{page_num}")
async def get_page(page_num: int):
    meta = _get_page_meta(page_num)
    page_dir = _get_page_dir(page_num)

    # Collect image paths
    images = {}
    if page_dir.exists():
        for f in page_dir.iterdir():
            if f.suffix in (".png", ".jpg", ".jpeg"):
                images[f.stem] = str(f.relative_to(DATA_DIR))

    return {"meta": meta, "images": images}


@app.get("/api/status")
async def get_status():
    pages_dir = DATA_DIR / "pages"
    status_counts = {"pending": 0, "panels_done": 0, "composited": 0, "text_added": 0, "total": 0}

    if pages_dir.exists():
        for page_dir in sorted(pages_dir.iterdir()):
            if page_dir.is_dir() and page_dir.name.startswith("page_"):
                meta = _read_json(page_dir / "meta.json", {})
                s = meta.get("status", "pending")
                status_counts["total"] += 1
                if s in status_counts:
                    status_counts[s] += 1
                else:
                    status_counts[s] = status_counts.get(s, 0) + 1

    return status_counts


@app.post("/api/generate-panel")
async def generate_panel(req: GeneratePanelRequest):
    settings = _get_settings()

    # Prepend character anchor to prompt
    anchor = settings.get("character_anchor", CHARACTER_ANCHOR)
    full_prompt = f"{anchor}, {req.prompt}"

    page_dir = _get_page_dir(req.page)
    page_dir.mkdir(parents=True, exist_ok=True)
    save_path = str(page_dir / f"panel_{req.panel}.png")

    provider = req.provider or settings.get("provider", "higgsfield")

    try:
        if provider == "higgsfield":
            api_key = settings.get("higgsfield_api_key", "")
            result = await higgsfield.generate_image(full_prompt, api_key, save_path)
        elif provider == "vertex":
            api_key = settings.get("vertex_api_key", "")
            result = await vertex.generate_image(full_prompt, api_key, save_path)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown provider: {provider}")
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Update page meta
    meta = _get_page_meta(req.page)
    meta["panels"][str(req.panel)] = {
        "prompt": req.prompt,
        "path": save_path,
        "provider": provider,
    }
    meta["status"] = "panels_done"
    _save_page_meta(req.page, meta)

    # Build URL relative to data mount
    rel_path = str(Path(save_path).relative_to(DATA_DIR))
    return {"url": f"/data/{rel_path}", "saved_path": save_path}


@app.post("/api/composite-page")
async def composite_page_endpoint(req: CompositePageRequest):
    settings = _get_settings()
    meta = _get_page_meta(req.page)

    # Gather panel paths in order
    panel_paths = []
    for key in sorted(meta.get("panels", {}).keys(), key=lambda x: int(x)):
        panel_info = meta["panels"][key]
        panel_paths.append(panel_info["path"])

    if not panel_paths:
        raise HTTPException(status_code=400, detail="No panels found for this page")

    page_dir = _get_page_dir(req.page)
    output_path = str(page_dir / "composited.jpg")

    try:
        composite_page(
            panel_paths=panel_paths,
            output_path=output_path,
            layout=req.layout,
            page_width=settings.get("page_width", 1200),
            page_height=settings.get("page_height", 1800),
            gutter=settings.get("gutter_size", 10),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    meta["status"] = "composited"
    meta["layout"] = req.layout
    meta["composited_path"] = output_path
    _save_page_meta(req.page, meta)

    rel_path = str(Path(output_path).relative_to(DATA_DIR))
    return {"page_path": f"/data/{rel_path}"}


@app.post("/api/add-text")
async def add_text(req: AddTextRequest):
    meta = _get_page_meta(req.page)
    composited_path = meta.get("composited_path")

    if not composited_path or not os.path.exists(composited_path):
        raise HTTPException(status_code=400, detail="Page not yet composited")

    page_dir = _get_page_dir(req.page)
    output_path = str(page_dir / "final.jpg")

    overlays = [o.model_dump() for o in req.overlays]

    try:
        add_text_to_page(composited_path, output_path, overlays)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    meta["status"] = "text_added"
    meta["final_path"] = output_path
    meta["overlays"] = overlays
    _save_page_meta(req.page, meta)

    rel_path = str(Path(output_path).relative_to(DATA_DIR))
    return {"text_page_path": f"/data/{rel_path}"}


@app.get("/api/settings")
async def get_settings():
    return _get_settings()


@app.post("/api/settings")
async def save_settings(settings: dict):
    settings_path = DATA_DIR / "settings.json"
    _write_json(settings_path, settings)
    return {"status": "saved"}


@app.get("/api/export/{chapter}")
async def export_chapter(chapter: str):
    # ch1 = pages 1-40, ch2 = pages 41-80, etc.
    try:
        ch_num = int(chapter.replace("ch", ""))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid chapter format. Use ch1, ch2, etc.")

    start_page = (ch_num - 1) * 40 + 1
    end_page = ch_num * 40

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        found = False
        for page_num in range(start_page, end_page + 1):
            page_dir = _get_page_dir(page_num)
            meta = _get_page_meta(page_num)

            # Prefer final (with text), then composited
            final_path = meta.get("final_path")
            composited_path = meta.get("composited_path")

            page_file = None
            if final_path and os.path.exists(final_path):
                page_file = final_path
            elif composited_path and os.path.exists(composited_path):
                page_file = composited_path

            if page_file:
                found = True
                arcname = f"{chapter}/page_{page_num:03d}.jpg"
                zf.write(page_file, arcname)

    if not found:
        raise HTTPException(status_code=404, detail=f"No pages found for {chapter}")

    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={chapter}_export.zip"},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
