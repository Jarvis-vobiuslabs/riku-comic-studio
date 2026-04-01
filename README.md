# RIKU — Comic Studio

A local manga production pipeline for generating an anime comic series featuring Riku.

## Stack

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS v4
- **Backend**: Python FastAPI
- **Image Generation**: Higgsfield API (pluggable — Vertex AI planned)
- **Storage**: Local filesystem (`./data/`)

## Setup

### Prerequisites

- Node.js 20.9+
- Python 3.10+
- pip

### Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
pip install -r requirements.txt
```

### Start the App

```bash
./start.sh
```

This launches both services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Start Services Individually

```bash
# Backend
cd backend
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload

# Frontend
cd frontend
npm run dev
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — stats, quick actions |
| `/story` | Story Editor — write page scripts with panel breakdowns |
| `/generate` | Generator — generate panel images, composite pages, add text |
| `/viewer` | Comic Viewer — full-screen manga reader with keyboard nav |
| `/settings` | Settings — API keys, provider config, page dimensions |

## Data Structure

```
data/
├── story.json          # Full story script
├── settings.json       # App configuration
└── pages/
    └── page_001/
        ├── panel_1.png   # Generated panel images
        ├── panel_2.png
        ├── composited.jpg # Composited manga page
        ├── final.jpg      # Page with text overlays
        └── meta.json      # Page generation metadata
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/story` | Get story script |
| POST | `/api/story` | Save story script |
| GET | `/api/page/{num}` | Get page metadata and images |
| GET | `/api/status` | Get generation status counts |
| POST | `/api/generate-panel` | Generate a single panel image |
| POST | `/api/composite-page` | Composite panels into a page |
| POST | `/api/add-text` | Add text overlays to page |
| GET | `/api/settings` | Get settings |
| POST | `/api/settings` | Save settings |
| GET | `/api/export/ch{n}` | Export chapter as zip |

## Page Layouts

- **A** — 2 panels: top/bottom split
- **B** — 3 panels: full top + 2 bottom columns
- **C** — 4 panels: 2x2 grid
- **D** — 5 panels: top + 3 middle + bottom
- **E** — Splash: single full-page panel
