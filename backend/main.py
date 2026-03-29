import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

SUBMISSIONS_FILE = Path(os.getenv("SUBMISSIONS_FILE", "./submissions.json"))

ALLOWED_TYPES = {
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "audio/webm", "audio/ogg", "audio/mpeg", "audio/mp4", "audio/wav",
    "video/mp4", "video/webm", "video/ogg",
}
MAX_FILE_BYTES = 100 * 1024 * 1024  # 100 MB per file

app = FastAPI(title="RVA Voices API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files at /uploads/<filename>
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


def load_submissions() -> list:
    if SUBMISSIONS_FILE.exists():
        with open(SUBMISSIONS_FILE) as f:
            return json.load(f)
    return []


def save_submissions(data: list) -> None:
    with open(SUBMISSIONS_FILE, "w") as f:
        json.dump(data, f, indent=2)


async def save_upload(file: UploadFile, submission_id: str) -> dict:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"File type not allowed: {file.content_type}")

    content = await file.read()
    if len(content) > MAX_FILE_BYTES:
        raise HTTPException(status_code=400, detail=f"File too large (max 100 MB): {file.filename}")

    ext = Path(file.filename or "upload").suffix or ".bin"
    filename = f"{submission_id}_{uuid.uuid4().hex[:8]}{ext}"
    dest = UPLOAD_DIR / filename
    dest.write_bytes(content)

    return {
        "original_name": file.filename,
        "saved_as": filename,
        "content_type": file.content_type,
        "size_bytes": len(content),
        "url": f"/uploads/{filename}",
    }


@app.post("/api/submit")
async def submit_story(
    name: str = Form(""),
    anonymous: str = Form("false"),
    neighborhood: str = Form(...),
    theme: str = Form(...),
    title: str = Form(...),
    story: str = Form(""),
    lang: str = Form("en"),
    consent_audio: Optional[UploadFile] = File(None),
    story_audio: Optional[UploadFile] = File(None),
    media_files: list[UploadFile] = File(default=[]),
):
    submission_id = uuid.uuid4().hex

    saved_files = []

    if consent_audio and consent_audio.filename:
        saved = await save_upload(consent_audio, submission_id)
        saved["role"] = "consent_audio"
        saved_files.append(saved)

    if story_audio and story_audio.filename:
        saved = await save_upload(story_audio, submission_id)
        saved["role"] = "story_audio"
        saved_files.append(saved)

    for mf in media_files:
        if mf and mf.filename:
            saved = await save_upload(mf, submission_id)
            saved["role"] = "media"
            saved_files.append(saved)

    record = {
        "id": submission_id,
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "lang": lang,
        "name": "" if anonymous == "true" else name,
        "anonymous": anonymous == "true",
        "neighborhood": neighborhood,
        "theme": theme,
        "title": title,
        "story": story,
        "files": saved_files,
        "status": "pending_review",
    }

    submissions = load_submissions()
    submissions.append(record)
    save_submissions(submissions)

    return JSONResponse({"ok": True, "id": submission_id, "files_saved": len(saved_files)})


@app.get("/api/health")
def health():
    return {"status": "ok"}
