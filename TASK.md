Build a local comic book pipeline app called "RIKU — Comic Studio" for generating an anime manga comic series.

## Stack
- Frontend: Next.js 15 + TypeScript + Tailwind CSS
- Backend: Python FastAPI (runs on port 8000)
- Image gen: pluggable (Higgsfield API now, Google Vertex AI later)
- Storage: local filesystem under ./data/

## App Structure

### Data model (./data/)
- story.json — full 80-page story script
- pages/{page_number}/ — per-page folder
  - panels/{1..5}.png — generated panel images
  - page.jpg — final composited manga page
  - page_text.jpg — page with text overlay (captions, speech bubbles, SFX)
  - meta.json — panel prompts, layout type, text content, status

### UI Pages (Next.js)

1. **/ — Dashboard**
   - Stats: pages written / panels generated / pages completed
   - Quick actions: New Page, Generate All Pending, Preview Chapter

2. **/story — Story Editor**
   - Full 80-page script editor
   - Each page has: page number, scene description, panel breakdown (1-5 panels)
   - Each panel has: description, dialogue/caption text, SFX text
   - Save button → writes to story.json

3. **/generate — Generator**
   - Shows all pages with status: Draft | Generating | Generated | Composited
   - "Generate Page" button per page → calls FastAPI → generates panels
   - "Composite Page" button → calls FastAPI → runs Pillow compositor
   - "Generate All" → queues all draft pages
   - Real-time status via polling

4. **/viewer — Comic Viewer**
   - Full-screen manga reader
   - Browse pages: prev/next arrows + page number input
   - Toggle: show panels | show composited page | show text page
   - Chapter jump: go to page 1, 41 (chapter 2)
   - Export chapter: downloads all pages as zip

5. **/settings — Settings**
   - API key inputs: Higgsfield API Key, Google Vertex AI key (future)
   - Image provider toggle: Higgsfield | Vertex AI
   - Character anchor prompt (locked template for Riku)
   - Page size: 1200×1800 (default)
   - Gutter size: 10px

### FastAPI Backend (server.py)

Endpoints:
- POST /api/generate-panel — generates single panel image
  - body: { page: int, panel: int, prompt: str, provider: "higgsfield"|"vertex" }
  - returns: { url: str, saved_path: str }
- POST /api/composite-page — composites panels into manga page
  - body: { page: int, layout: "A"|"B"|"C"|"D"|"E" }
  - A=2panel, B=3panel, C=4panel, D=5panel, E=splash
  - returns: { page_path: str }
- POST /api/add-text — adds text overlays to composited page
  - body: { page: int, panels: [{type: "caption"|"speech"|"sfx", text: str, x: int, y: int}] }
  - returns: { text_page_path: str }
- GET /api/story — returns story.json
- POST /api/story — saves story.json
- GET /api/page/{page_num} — returns page meta + image paths
- GET /api/status — returns overall generation status

### Image generation (providers/higgsfield.py)
- Uses Higgsfield nano-banana-pro
- API key: 981166a3-7319-41e6-bd11-64c266061ce2:1fcd8dc35bc90cef8772c54f7db54d0f47abac4732dc7f10d75309068c26eb6f
- Polls status_url until completed
- Downloads and saves to data/pages/{page}/panels/{panel}.png

### Page Compositor (compositor.py)
Layout engine using Pillow:
- Layout A: 2 panels — full-width top (50%) + full-width bottom (50%)
- Layout B: 3 panels — full-width top (42%) + left col (44%) / right col (56%) bottom
- Layout C: 4 panels — 2×2 grid
- Layout D: 5 panels — full-width top (35%) + 3 across middle (30%) + full-width bottom (35%)
- Layout E: 1 panel — full-page splash
- Black gutters (10px), near-black background (#080808)
- Output: 1200×1800 JPEG

### Text Overlay (text_overlay.py)
- Caption box: dark rounded rect + white text (Helvetica bold)
- Speech bubble: white oval + tail + black text
- SFX text: large bold with black outline, color configurable
- Positions defined per-panel in story.json

## Character Anchor (use in EVERY Riku panel prompt)
```
anime manga illustration, Japanese teenage girl named Riku, long flowing crimson red hair, 
sharp golden amber eyes, curvy athletic figure, dark navy sailor school uniform seifuku, 
fitted short skirt, slightly unbuttoned collar showing collarbone, white collar with red ribbon, 
wielding a silver katana with red tassel, Demon Slayer art style, ultra detailed, vibrant colors
```

## Design (dark, premium)
- Background: #080810 (very dark blue-black)
- Cards: #12121e
- Accent: #e63946 (crimson red — matches Riku's hair)
- Text: white / rgba(255,255,255,0.6) secondary
- Font: Inter
- The UI should feel like a professional manga production tool

## Startup
- Create start.sh: runs FastAPI on port 8000 + Next.js on port 3000 simultaneously
- Create README with setup instructions

## When done
- Run: openclaw system event --text "Done: Riku Comic Studio app built at /tmp/riku-comic-app" --mode now
