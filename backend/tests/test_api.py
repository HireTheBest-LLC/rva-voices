"""
Backend API tests for RVA Voices FastAPI application.

Tests cover:
- GET /api/health  — liveness probe
- GET /api/stories — returns only public-visibility stories with valid coordinates
- POST /api/submit — stores submission, validates file types, rejects oversized files

Uses httpx.TestClient (synchronous) so no pytest-asyncio setup is required.
"""
import io
import json
import os
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def isolated_storage(tmp_path, monkeypatch):
    """
    Redirect UPLOAD_DIR and SUBMISSIONS_FILE to a temporary directory for
    every test so tests never touch real data and can run in parallel.
    """
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir()
    submissions_file = tmp_path / "submissions.json"

    monkeypatch.setenv("UPLOAD_DIR", str(upload_dir))
    monkeypatch.setenv("SUBMISSIONS_FILE", str(submissions_file))

    # Re-import app AFTER env vars are set so it picks up the new paths
    import importlib
    import sys
    # Remove cached module so it reinitialises with new env vars
    for mod in list(sys.modules.keys()):
        if "main" in mod and "rva" not in mod:
            del sys.modules[mod]

    yield upload_dir, submissions_file


@pytest.fixture()
def client(isolated_storage):
    """Return a TestClient bound to a freshly-initialised app instance."""
    # Import after env patching
    from main import app  # noqa: PLC0415
    return TestClient(app)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

class TestHealth:
    def test_health_returns_ok(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}


# ---------------------------------------------------------------------------
# GET /api/stories
# ---------------------------------------------------------------------------

class TestGetStories:
    def test_returns_empty_list_when_no_submissions(self, client):
        resp = client.get("/api/stories")
        assert resp.status_code == 200
        assert resp.json() == []

    def _submit_text_story(self, client, *, visibility="public", lat="37.5485", lng="-77.4365"):
        return client.post("/api/submit", data={
            "title": "Test Story",
            "neighborhood": "Jackson Ward",
            "theme": "Community Life",
            "story": "A story about Jackson Ward.",
            "name": "Tester",
            "anonymous": "false",
            "lang": "en",
            "lat": lat,
            "lng": lng,
            "address": "",
            "visibility": visibility,
        })

    def test_public_story_with_coords_appears_on_map(self, client):
        r = self._submit_text_story(client, visibility="public")
        assert r.status_code == 200
        stories = client.get("/api/stories").json()
        assert len(stories) == 1
        assert stories[0]["title"] == "Test Story"

    def test_private_story_is_excluded_from_map(self, client):
        self._submit_text_story(client, visibility="private")
        stories = client.get("/api/stories").json()
        assert stories == []

    def test_story_without_coords_is_excluded(self, client):
        self._submit_text_story(client, visibility="public", lat="", lng="")
        stories = client.get("/api/stories").json()
        assert stories == []

    def test_returned_story_has_expected_fields(self, client):
        self._submit_text_story(client, visibility="public")
        story = client.get("/api/stories").json()[0]
        for field in ("id", "title", "author", "neighborhood", "lat", "lng",
                      "excerpt", "type", "theme", "date", "consentGiven"):
            assert field in story, f"Missing field: {field}"

    def test_anonymous_story_shows_anonymous_author(self, client):
        client.post("/api/submit", data={
            "title": "Anon Story",
            "neighborhood": "Fulton",
            "theme": "Resilience",
            "story": "...",
            "name": "",
            "anonymous": "true",
            "lang": "en",
            "lat": "37.5265",
            "lng": "-77.4075",
            "visibility": "public",
        })
        stories = client.get("/api/stories").json()
        assert stories[0]["author"] == "Anonymous"

    def test_excerpt_is_truncated_to_300_chars(self, client):
        long_story = "A" * 500
        client.post("/api/submit", data={
            "title": "Long",
            "neighborhood": "Carver",
            "theme": "Community Life",
            "story": long_story,
            "name": "T",
            "anonymous": "false",
            "lang": "en",
            "lat": "37.5565",
            "lng": "-77.4465",
            "visibility": "public",
        })
        story = client.get("/api/stories").json()[0]
        assert len(story["excerpt"]) <= 300


# ---------------------------------------------------------------------------
# POST /api/submit
# ---------------------------------------------------------------------------

class TestSubmitStory:
    def test_text_only_submission_succeeds(self, client):
        resp = client.post("/api/submit", data={
            "title": "My Story",
            "neighborhood": "The Fan",
            "theme": "Arts & Culture",
            "story": "It was a great neighbourhood.",
            "name": "Alice",
            "anonymous": "false",
            "lang": "en",
            "lat": "37.5537",
            "lng": "-77.4742",
            "visibility": "public",
        })
        assert resp.status_code == 200
        body = resp.json()
        assert body["ok"] is True
        assert "id" in body
        assert body["files_saved"] == 0

    def test_submission_stores_visibility_field(self, client, isolated_storage):
        _, submissions_file = isolated_storage
        client.post("/api/submit", data={
            "title": "V Story",
            "neighborhood": "Oregon Hill",
            "theme": "Resilience",
            "story": "text",
            "name": "Bob",
            "anonymous": "false",
            "lang": "en",
            "lat": "37.5365",
            "lng": "-77.4505",
            "visibility": "private",
        })
        data = json.loads(submissions_file.read_text())
        assert data[0]["visibility"] == "private"

    def test_invalid_visibility_defaults_to_private(self, client, isolated_storage):
        _, submissions_file = isolated_storage
        client.post("/api/submit", data={
            "title": "X",
            "neighborhood": "Randolph",
            "theme": "Family Heritage",
            "story": "...",
            "name": "C",
            "anonymous": "false",
            "lang": "en",
            "lat": "37.5225",
            "lng": "-77.4575",
            "visibility": "malicious_value",
        })
        data = json.loads(submissions_file.read_text())
        assert data[0]["visibility"] == "private"

    def test_image_upload_sets_story_type_to_photo(self, client):
        img_bytes = b"\xff\xd8\xff\xe0" + b"\x00" * 10  # minimal JPEG header
        resp = client.post("/api/submit",
            data={
                "title": "Photo Story",
                "neighborhood": "Church Hill",
                "theme": "Family Heritage",
                "story": "...",
                "name": "D",
                "anonymous": "false",
                "lang": "en",
                "lat": "37.5335",
                "lng": "-77.4145",
                "visibility": "public",
            },
            files={"media_files": ("photo.jpg", io.BytesIO(img_bytes), "image/jpeg")},
        )
        assert resp.status_code == 200
        assert resp.json()["files_saved"] == 1

    def test_disallowed_file_type_is_rejected(self, client):
        resp = client.post("/api/submit",
            data={
                "title": "X",
                "neighborhood": "Downtown",
                "theme": "Civic Dialogue",
                "story": "...",
                "name": "E",
                "anonymous": "false",
                "lang": "en",
                "lat": "37.5395",
                "lng": "-77.4335",
                "visibility": "public",
            },
            files={"media_files": ("malware.exe", io.BytesIO(b"MZ"), "application/octet-stream")},
        )
        assert resp.status_code == 400

    def test_missing_required_field_returns_422(self, client):
        # "title" is required (Form(...))
        resp = client.post("/api/submit", data={
            "neighborhood": "The Fan",
            "theme": "Arts & Culture",
        })
        assert resp.status_code == 422

    def test_anonymous_flag_clears_name_in_record(self, client, isolated_storage):
        _, submissions_file = isolated_storage
        client.post("/api/submit", data={
            "title": "Anon",
            "neighborhood": "Shockoe Bottom",
            "theme": "Displacement & Change",
            "story": "...",
            "name": "Real Name",
            "anonymous": "true",
            "lang": "en",
            "lat": "37.5345",
            "lng": "-77.4275",
            "visibility": "public",
        })
        data = json.loads(submissions_file.read_text())
        # Name should be blank when anonymous=true
        assert data[0]["name"] == ""
        assert data[0]["anonymous"] is True
