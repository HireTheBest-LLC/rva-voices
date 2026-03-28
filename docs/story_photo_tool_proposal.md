# Story Photo Tool — Team Lead Review
**RVA Voices | Vicktoria.AI | Richmond Civic Hackathon 2026**
Prepared by: Hackbot | Date: 2026-03-28

---

## What This Solves

We have audio recordings of resident stories. This tool automatically finds publicly licensed photos of Richmond neighborhoods and events that match the story content, then combines them with the original audio into a short video — without changing or replacing the resident's voice.

**Demo use case:** One approved seed story (e.g., Jackson Ward) is displayed on the /explore map as a featured video story. Judges see a rich media card instead of text only.

---

## How It Works (3 Steps)

### Step 1 — Transcribe the audio (Whisper)
- **Tool:** OpenAI Whisper — open-source, runs locally on EC2, no API key, no cost
- Converts the resident's spoken story to text
- Keywords from the transcript feed into our existing `richmond_theme_vocabulary.js` theme engine
- Original audio file is never modified

### Step 2 — Retrieve matching photos
Two sources, both free and copyright-safe:

| Source | Cost | Key Required | License Filter | Best For |
|--------|------|--------------|----------------|----------|
| **Wikimedia Commons API** | Free | No | CC / Public Domain enforced | Historical Richmond neighborhoods |
| **Flickr API** | Free tier | Free account only | CC licenses only | Recent city events and community photos |

Photos are retrieved as **thumbnail URLs only** — we never download or republish full-resolution images. Each result includes the original source link and credit line for attribution.

### Step 3 — Assemble the video (MoviePy)
- **Tool:** MoviePy — open-source Python library, no cost
- Combines retrieved photos into a slideshow timed to the audio length
- Original resident voice plays over the photos unchanged
- Output: MP4 file → uploaded to S3 → displayed on /explore map

---

## Challenge Compliance

| Requirement | Status | How Met |
|-------------|--------|---------|
| No paid APIs | Pass | Whisper is local; Wikimedia has no key; Flickr is free tier |
| No external AI for story analysis | Pass | Whisper is inference-only, local; no data sent to cloud |
| Copyright safe | Pass | CC-license filter enforced in both photo APIs |
| Finder not publisher (G4) | Pass | Thumbnail URLs only; source + attribution stored per photo |
| Resident voice preserved | Pass | Audio file untouched; video uses original recording |
| No PII exposure | Pass | Photo search uses themes/keywords, not resident name or address |
| Disclaimer shown | Pass | "Illustrative prototype" disclaimer applies to all story views |

---

## What This Is NOT

- It does **not** modify or synthesize the resident's voice
- It does **not** use paid image services (Getty, Shutterstock, etc.)
- It does **not** claim the photos are "of" the specific resident or event
- It is **not** part of the live recording flow (Surface 1 is unchanged)

---

## Recommended Demo Path

This feature is best used as a **pre-built demo asset**, not a live feature:

1. Take one approved seed story (Jackson Ward or Church Hill)
2. Run the tool offline before Sunday
3. Upload the output video to S3
4. Display it as a "Featured Story" card on the /explore map
5. Judges see: map pin → click → video plays with resident voice + neighborhood photos

This adds significant visual impact to the demo without adding risk to the live submission flow.

---

## Dependencies to Install on EC2

```bash
source ~/rvavoices-backend/venv/bin/activate
pip install openai-whisper moviepy pillow requests
```

Whisper `base` model (~140MB) downloads on first run. No GPU required on t3.micro for base model — inference is slower but functional for a one-time demo asset.

---

## Open Questions for Team Lead

1. Do we want this as a live feature (triggered post-approval) or demo-only asset?
2. Should the photo attribution credit line appear on the story card in /explore?
3. Is there a specific seed story Andrey has ready that we should use for the demo video?
4. Flickr free key requires an account — does anyone on the team have a Flickr account to register for the key?

---

## Contacts

| Question | Owner |
|----------|-------|
| Story selection for demo video | Andrey Karpov |
| Flickr API key registration | David Cowart |
| Demo path approval | Ed Leitao |
| Copyright/attribution language on story card | Chasity Bailey |
