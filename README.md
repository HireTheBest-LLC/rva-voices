# RVA Legacy Map — Richmond Stories Project

Built with love by the Vicktoria AI team for Richmond at [Hack for RVA 2026](https://rvahacks.org).

A civic storytelling platform that lets Richmond residents share their lived experiences, pin them to a neighborhood map, and surface themes for City staff and cultural partners. Addresses **Problem 2: Resident Stories as Civic Insight** from the Richmond MAP Hackathon challenge.

---

## Architecture

```
rva-voices/
├── frontend/        Next.js 15 + Tailwind v4 + Leaflet map
└── backend/         Python FastAPI — story submissions + file storage
```

The frontend and backend are developed and deployed independently. In production, Nginx proxies `/api/*` requests to the FastAPI backend and serves the Next.js static build.

---

## Prerequisites

| Tool | Minimum version | Notes |
|------|----------------|-------|
| Node.js | 18 LTS | 20 LTS recommended |
| npm | 9 | Bundled with Node 18+ |
| Python | 3.10 | 3.11+ recommended |
| Git | any | — |

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/<your-org>/rva-voices.git
cd rva-voices
```

### 2. Start the backend

```bash
cd backend

# Create and activate a Python virtual environment
python -m venv venv

# Mac / Linux
source venv/bin/activate

# Windows (Git Bash / PowerShell)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server (hot-reload enabled)
uvicorn main:app --reload --port 8000
```

The API is now available at `http://localhost:8000`.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Liveness probe — returns `{"status":"ok"}` |
| `/api/stories` | GET | Returns public-visibility stories with valid coordinates |
| `/api/submit` | POST | Accepts multipart form with story text, audio, and media files |
| `/uploads/<file>` | GET | Serves uploaded files (photos, audio, video) |

Submitted stories are stored in `backend/submissions.json`. Uploaded files go to `backend/uploads/`. Both are created automatically on first run.

### 3. Start the frontend

In a second terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the Next.js dev server
npm run dev
```

The app is now available at `http://localhost:3000`.

> **API proxy:** Add the following to `frontend/next.config.js` (or `next.config.ts`) to proxy `/api/*` to the local backend:
>
> ```js
> /** @type {import('next').NextConfig} */
> const nextConfig = {
>   async rewrites() {
>     return [{ source: "/api/:path*", destination: "http://localhost:8000/api/:path*" }];
>   },
> };
> module.exports = nextConfig;
> ```
>
> If the backend is not running, story submission fails gracefully and the map displays seed data only.

---

## Running Tests

### Frontend (Jest + React Testing Library)

```bash
cd frontend

# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run a specific test file by name pattern
npx jest --testPathPatterns="stories.data"
npx jest --testPathPatterns="insightsDashboard"
npx jest --testPathPatterns="submitStory"
```

**Test files:**

| File | What it covers |
|------|---------------|
| `src/__tests__/stories.data.test.ts` | Seed story data integrity — coordinates, types, unique IDs, consent flags, Unsplash URL hygiene, theme/neighborhood consistency |
| `src/__tests__/submitStory.guided-prompts.test.tsx` | Guided prompt list content (3–5 items), age gate checkbox, bilingual toggle, consent step rendering |
| `src/__tests__/insightsDashboard.test.tsx` | Live `/api/stories` fetch, AAPOR disclaimer, `+N submitted` badge, graceful backend failure, scale-up section, oral history links |

### Backend (pytest)

```bash
cd backend

# Activate venv first
source venv/bin/activate        # Mac / Linux
venv\Scripts\activate           # Windows

# Run all tests with verbose output
python -m pytest tests/ -v
```

**Test classes:**

| Class | What it covers |
|-------|---------------|
| `TestHealth` | `/api/health` liveness probe |
| `TestGetStories` | Visibility filtering (public/private), coordinate filtering, anonymous author display, excerpt truncation to 300 chars |
| `TestSubmitStory` | Text-only submission, visibility field stored correctly, invalid visibility defaults to `private`, image upload type detection, disallowed file type rejection (HTTP 400), missing required fields (HTTP 422), anonymous flag clears name |

---

## Environment Variables

All variables have safe defaults for local development.

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `UPLOAD_DIR` | `./uploads` | Directory where uploaded media files are stored |
| `SUBMISSIONS_FILE` | `./submissions.json` | JSON file storing all story submissions |

Set these as shell exports or in a `.env` file in `backend/`:

```bash
export UPLOAD_DIR=/var/rva-voices/uploads
export SUBMISSIONS_FILE=/var/rva-voices/submissions.json
```

---

## Production Deployment (EC2 Ubuntu 24.04)

This describes the current production setup on an AWS EC2 t3.micro instance with Nginx + PM2.

### First-time server setup

```bash
# 1. Install system packages
sudo apt update && sudo apt install -y nginx nodejs npm python3-venv git

# 2. Install PM2 process manager globally
sudo npm install -g pm2

# 3. Clone the repository
git clone https://github.com/<your-org>/rva-voices.git ~/rva-voices
cd ~/rva-voices
```

### Deploy the backend

```bash
cd ~/rva-voices/backend

# Create venv and install dependencies
python3 -m venv venv
venv/bin/pip install -r requirements.txt

# Create data directories
mkdir -p uploads

# Start with PM2 (binds to loopback — Nginx proxies publicly)
pm2 start "venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000" \
  --name rva-backend \
  --cwd ~/rva-voices/backend

# Persist PM2 process list across reboots
pm2 save
pm2 startup   # run the printed sudo command to register PM2 as a systemd service
```

### Deploy the frontend

```bash
cd ~/rva-voices/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Start with PM2
pm2 start "npm start" \
  --name rva-frontend \
  --cwd ~/rva-voices/frontend

pm2 save
```

### Configure Nginx

Create `/etc/nginx/sites-available/rva-voices`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Proxy /api/* and /uploads/* to FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 110M;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:8000;
    }

    # Proxy everything else to Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/rva-voices /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Enable HTTPS with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Certbot auto-renews certificates. Test renewal: `sudo certbot renew --dry-run`.

### Deploy updates

```bash
cd ~/rva-voices

# Pull latest changes from main
git pull origin main

# Rebuild frontend
cd frontend && npm install && npm run build && cd ..

# Reinstall backend deps if requirements.txt changed
cd backend && venv/bin/pip install -r requirements.txt && cd ..

# Restart both services
pm2 restart rva-frontend rva-backend
```

---

## Project Structure

```
frontend/src/
├── app/
│   ├── page.tsx              # Main page — map view, filters, featured banner
│   └── layout.tsx            # Root layout — fonts, metadata
├── components/
│   ├── Header.tsx            # Nav bar with mobile hamburger menu
│   ├── StoryMap.tsx          # Leaflet map + VoicePlayer + StoryDetailPanel
│   ├── SubmitStory.tsx       # 3-step consent → story → review form
│   ├── InsightsDashboard.tsx # Live charts + scale-up framing + oral history links
│   └── AboutPage.tsx         # Project mission and team info
├── data/
│   └── stories.ts            # Seed stories, neighborhoods, themes
└── __tests__/
    ├── stories.data.test.ts
    ├── submitStory.guided-prompts.test.tsx
    └── insightsDashboard.test.tsx

backend/
├── main.py                   # FastAPI app — /api/submit, /api/stories, /api/health
├── requirements.txt
├── submissions.json          # Created automatically on first submission
├── uploads/                  # Created automatically on first file upload
└── tests/
    └── test_api.py           # pytest suite — 15 tests covering all endpoints
```

---

## Key Design Decisions

### Consent-first (G2 compliance)
Every submission requires a recorded verbal consent statement before the story form is accessible. The consent audio is stored alongside the submission. The form is bilingual (English / Spanish) throughout all three steps.

### Privacy by default (Gap #18)
Submissions default to `visibility: "private"` (City staff only). Submitters must explicitly opt in to public display via a radio group. `GET /api/stories` excludes all private submissions from the public map.

### Guided prompts (Gap #16 / Shape D acceptance criterion)
Five bilingual prompt chips above the story textarea give storytellers a concrete starting point. Clicking a chip pre-fills the textarea with the full prompt text, which the storyteller can then edit.

### Age gate (Gap #21 / COPPA)
A required checkbox on the consent step confirms the submitter is 18+ or has parental permission. The Continue button is disabled until both the age checkbox and the voice consent recording are complete.

### Live dashboard data (Gap #17)
`InsightsDashboard` fetches `/api/stories` on mount and merges live submissions with seed data. All chart counts reflect real submissions, and a `+N submitted` badge appears when the backend returns results.

### Non-representative sample disclosure (G1 / AAPOR)
A prominent AAPOR-compliant disclaimer appears before every chart and is embedded in the consent text. The dashboard includes a "What Scales with More Stories" section that honestly frames the tool as an illustrative prototype with a clear 200-story scale-up path.

---

## Known Limitations and Planned Next Steps

| Limitation | Status | Planned fix |
|-----------|--------|-------------|
| No EXIF stripping on uploaded photos — GPS coordinates leak via image metadata | Known | Add `Pillow`-based EXIF stripping in `save_upload()` (v2) |
| Age verification is self-attestation only — COPPA requires verifiable parental consent for under-13 | Known | Add email-based parental consent workflow |
| Moderation is manual — submissions sit as `pending_review` with no admin UI | Known | Add password-protected admin review dashboard |
| Digital-only intake under-represents residents without home broadband | By design | Plan in-person pop-up kiosks at RRHA community centers (90-day pilot) |
| English and Spanish only | By design | Add Kinyarwanda, Arabic, Vietnamese translations (community partnership required) |

---

## License

Built for the Richmond Civic Hackathon (Hack for RVA 2026). Seed story data inspired by the Historic Fulton Oral History Project (The Valentine / VCU Libraries) — non-commercial use permitted per rights statement at scholarscompass.vcu.edu/ful/.
