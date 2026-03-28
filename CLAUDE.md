# CLAUDE.md — RVA Voices App Repo

## What this repo is
This is the application code for **RVA Voices** (richmondstories.online).
Team: Vicktoria.AI | Richmond Civic Hackathon 2026 | Pillar 7: A City That Tells Its Stories | Problem #2: Resident Stories as Civic Insight.

---

## Hackbot behavior
You are operating as Hackbot for the Vicktoria.AI team.
Follow all behavior rules defined in the pillar repo CLAUDE.md located at:
`C:\Users\david\OneDrive\Documents\HTB\GitWork\pillar-city-storytelling-main\pillar-city-storytelling-main\CLAUDE.md`

When that file conflicts with this file, this file takes precedence for app-specific decisions.

---

## Reference material location
All hackathon research, rubric, and build guides live at:
`C:\Users\david\OneDrive\Documents\HTB\GitWork\pillar-city-storytelling-main\pillar-city-storytelling-main\`

### Key files to read before verifying any code

| File | Purpose |
|------|---------|
| `CHALLENGE.md` | Judging rubric and category weights — verify all features against this |
| `research/G2_risks_consent_privacy.md` | Consent and PII requirements — verify Surface 1 against this |
| `research/G5_risks_guardrails.md` | Guardrails checklist — verify dashboard against this |
| `04_build_guides/richmond_theme_vocabulary.js` | Theme extraction engine — copy to app |
| `04_build_guides/richmond_story_prompts.js` | Guided prompts + consent preamble — copy to app |
| `demo_script.md` | Demo path and judge Q&A — verify app surfaces match this |
| `project_one_pager.md` | Full MVP scope and acceptance criteria |

---

## Application architecture

### Stack
- **Frontend:** Next.js 16 (App Router, TypeScript, Tailwind) — `/frontend`
- **Backend:** FastAPI (Python) — `/backend`
- **Database:** AWS DynamoDB (two tables)
- **Audio storage:** AWS S3 (`rvavoices-audio` bucket)
- **Hosting:** EC2 t3.micro at 3.235.16.98
- **Domain:** richmondstories.online (SSL via Let's Encrypt)
- **Process manager:** PM2

### DynamoDB tables
- `rvavoices-stories` — partition key: `id` (String)
- `rvavoices-identities` — partition key: `story_id` (String)

### S3 bucket
- `rvavoices-audio` — private, pre-signed URLs only, CORS configured for richmondstories.online

### Theme extraction
- Zero external API — keyword matching via `richmond_theme_vocabulary.js`
- No paid AI services — team constraint from team_profile.md

---

## Three surfaces to build

### Surface 1 — /submit (resident story submission)
- Oral consent audio plays on load (English/Spanish toggle)
- Resident states name and consent aloud — recording captures this
- Neighborhood selector → guided prompt → voice OR typed story
- Stores to DynamoDB + audio to S3
- Anonymized by default

### Surface 2 — /explore (public story map)
- Leaflet map with story pins by neighborhood
- Click pin → anonymized story card (no PII)
- No login required
- Only shows staff-approved stories (is_public: true)

### Surface 3 — /dashboard (staff/historian view)
- Login required (STAFF_TOKEN env var)
- Theme frequency chart (Recharts or Chart.js)
- Filter by neighborhood and keyword
- All stories visible (including pending review)
- Disclaimer always visible: "Illustrative prototype — not a representative sample"

---

## Rubric verification rules
Before marking any feature complete, verify against CHALLENGE.md weights:

| Category | Weight | Check |
|----------|--------|-------|
| Impact | 5 | Does this feature address Problem #2 directly? |
| User Value | 4 | Does this serve Dorothy (resident) or Priya (planner) specifically? |
| Feasibility | 3 | Could a City dept pilot this within a year? |
| Innovation | 3 | Does this bring fresh thinking beyond a basic form? |
| Execution | 3 | Does it work in the live demo path? |
| Equity | 3 | Does it serve non-digitally-comfortable users? |

---

## Non-negotiable requirements (never skip these)
- Consent must be obtained before any story is recorded or stored
- Disclaimer must appear on every theme/insight view
- No PII stored without explicit opt-in
- Archival stories must be labeled "Archival — The Valentine / VCU"
- Anonymous submission must be the default
- Staff dashboard must require authentication
- Audio stored in S3 only — never in DynamoDB

---

## Team
| Member | Role | Owns |
|--------|------|------|
| Ed Leitao | Product Lead | User flows, content, prompts |
| David Cowart | Full-stack Engineer | All code, EC2, AWS |
| Andrey Karpov | Researcher/Writer | Evidence log, seed stories |
| Chasity Bailey | Legal Researcher | Consent language, EULA, privacy |

## Communication preferences
- Bullets over prose
- Concise — no fluff
- Citations required for civic claims
- Suggest → confirm → act

---

## EC2 deployment
```bash
# SSH
ssh -i "C:\Users\david\.ssh\RichmondStories.pem" ubuntu@3.235.16.98

# Deploy frontend
cd ~/rva-voices/frontend && git pull && npm run build && pm2 restart frontend

# Deploy backend
cd ~/rva-voices/backend && git pull && pm2 restart backend

# Backend venv activation
source ~/rvavoices-backend/venv/bin/activate
```

## Environment variables
```
# backend/.env
S3_BUCKET=rvavoices-audio
AWS_REGION=us-east-1
STAFF_TOKEN=replace-with-strong-random-token
DYNAMODB_STORIES_TABLE=rvavoices-stories
DYNAMODB_IDENTITIES_TABLE=rvavoices-identities

# frontend/.env.local
NEXT_PUBLIC_API_URL=https://richmondstories.online/api
```

---

## Consent audio files
- `oral_consent_en.txt` — English oral consent script
- `oral_consent_es.txt` — Spanish oral consent script
- Record as `consent_en.mp3` and `consent_es.mp3` and upload to S3 or serve as static assets

---

## Standard fallback language
If a feature cannot be verified against the rubric:
- "This repository does not contain that information."
- "I cannot verify that from the materials in this repository."
- "That would require additional City or partner guidance."
