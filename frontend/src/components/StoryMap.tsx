"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Story, neighborhoods } from "@/data/stories";
import { Camera, Mic, FileText, Video, X, Star, Play, Square, Volume2 } from "lucide-react";

const typeIcons: Record<string, string> = {
  photo: "📷",
  video: "🎥",
  voice: "🎙️",
  text: "📝",
};

const typeColors: Record<string, string> = {
  photo: "#2563eb",
  video: "#7c3aed",
  voice: "#dc2626",
  text: "#059669",
};

function createStoryIcon(type: string, featured?: boolean) {
  if (featured) {
    return L.divIcon({
      className: "custom-story-marker",
      html: `<div style="
        background: linear-gradient(135deg, #f59e0b, #d97706);
        width: 48px; height: 48px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 22px;
        box-shadow: 0 0 0 4px rgba(245,158,11,0.3), 0 4px 12px rgba(0,0,0,0.35);
        border: 3px solid white; cursor: pointer;
        animation: pulse-featured 2s ease-in-out infinite;
      ">⭐</div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
  }
  return L.divIcon({
    className: "custom-story-marker",
    html: `<div style="
      background: ${typeColors[type] ?? "#374151"};
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 3px solid white; cursor: pointer;
    ">${typeIcons[type] ?? "📌"}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function createNeighborhoodIcon() {
  return L.divIcon({
    className: "neighborhood-marker",
    html: `<div style="
      background: rgba(30,58,95,0.85); color: white;
      width: 14px; height: 14px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.7);
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

// ── Fallback image used when an imageUrl fails to load ──────────────────────
const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1080' height='720' viewBox='0 0 1080 720'%3E%3Crect fill='%231e3a5f' width='1080' height='720'/%3E%3Ctext fill='%23ffffff' font-family='sans-serif' font-size='48' text-anchor='middle' x='540' y='380'%3ERVA Legacy Map%3C/text%3E%3C/svg%3E";

interface StoryMapProps {
  stories: Story[];
  selectedTheme: string | null;
  selectedNeighborhood: string | null;
  onStorySelect: (story: Story) => void;
}

export function StoryMap({ stories, selectedTheme, selectedNeighborhood, onStorySelect }: StoryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [37.5407, -77.4360],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    neighborhoods.forEach((n) => {
      L.marker([n.lat, n.lng], { icon: createNeighborhoodIcon() })
        .bindTooltip(n.name, {
          permanent: true,
          direction: "top",
          offset: [0, -10],
          className: "neighborhood-tooltip",
        })
        .addTo(map);
    });

    markersRef.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!markersRef.current) return;
    markersRef.current.clearLayers();

    const filtered = stories.filter((s) => {
      if (selectedTheme && s.theme !== selectedTheme) return false;
      if (selectedNeighborhood && s.neighborhood !== selectedNeighborhood) return false;
      return true;
    });

    filtered.forEach((story) => {
      const marker = L.marker([story.lat, story.lng], {
        icon: createStoryIcon(story.type, story.featured),
        zIndexOffset: story.featured ? 1000 : 0,
      });

      const popupLabel = story.featured
        ? `<span style="background:#f59e0b;color:white;padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:600;margin-bottom:4px;display:inline-block;">⭐ FEATURED STORY</span><br/>`
        : "";

      marker.bindPopup(`
        <div style="min-width:220px;font-family:Inter,sans-serif;">
          ${popupLabel}
          <h3 style="margin:0 0 4px;font-size:14px;font-weight:600;">${story.title}</h3>
          <p style="margin:0 0 4px;font-size:12px;color:#666;">${story.author} · ${story.neighborhood}</p>
          <p style="margin:0;font-size:12px;line-height:1.4;">${story.excerpt.slice(0, 100)}...</p>
          ${story.sourceAttribution ? `<p style="margin:4px 0 0;font-size:10px;color:#888;font-style:italic;">${story.sourceAttribution}</p>` : ""}
        </div>
      `);

      marker.on("click", () => onStorySelect(story));
      marker.addTo(markersRef.current!);
    });

    if (selectedNeighborhood) {
      const n = neighborhoods.find((n) => n.name === selectedNeighborhood);
      if (n) mapInstance.current?.flyTo([n.lat, n.lng], 15, { duration: 1 });
    }
  }, [stories, selectedTheme, selectedNeighborhood, onStorySelect]);

  return (
    <div ref={mapRef} className="w-full h-full" style={{ minHeight: "400px" }} />
  );
}

// ── Gender detection from author first name ──────────────────────────────────
// Used to select a gender-appropriate neural voice for the TTS reader.
// Covers the most common English, Spanish, and African-American names found
// in Richmond community storytelling contexts.
const MALE_FIRST_NAMES = new Set([
  "james","john","robert","michael","william","david","richard","joseph",
  "thomas","charles","christopher","daniel","matthew","anthony","mark",
  "donald","steven","paul","andrew","kenneth","george","joshua","kevin",
  "brian","edward","ronald","timothy","jason","jeffrey","ryan","gary",
  "jacob","nicholas","eric","jonathan","stephen","larry","scott","frank",
  "justin","raymond","gregory","samuel","benjamin","patrick","jack","henry",
  "walter","dennis","jerry","carlos","harold","arthur","peter","roger",
  "willie","ralph","joe","eugene","wayne","alan","juan","louis","adam",
  "jesse","harry","albert","fred","clarence","howard","victor","marcus",
  "tyrone","darius","devonte","malik","jamal","darnell","lamar","terrell",
  "andre","leon","leroy","clarence","reginald","rodney","earnest","otis",
]);

const FEMALE_FIRST_NAMES = new Set([
  "mary","patricia","jennifer","linda","barbara","elizabeth","susan",
  "jessica","sarah","karen","lisa","nancy","betty","margaret","sandra",
  "ashley","dorothy","kimberly","emily","donna","michelle","carol",
  "amanda","melissa","deborah","stephanie","rebecca","sharon","laura",
  "cynthia","kathleen","amy","angela","shirley","anna","brenda","pamela",
  "emma","nicole","helen","samantha","katherine","christine","debra",
  "rachel","carolyn","janet","catherine","maria","heather","diane","julie",
  "joyce","victoria","vicktoria","ruth","virginia","kelly","lauren",
  "christina","joan","evelyn","judith","alice","ann","jean","cheryl",
  "marie","danielle","denise","tammy","grace","teresa","natalie","gloria",
  "beverly","irene","andrea","louise","frances","diana","aisha","keisha",
  "latasha","tamika","shanice","monique","destiny","jasmine","imani",
  "niesha","latoya","shaniqua","tiffany","shonda","lakisha","rochelle",
]);

type Gender = "male" | "female" | "neutral";

function detectGender(author: string): Gender {
  // Extract first word, strip punctuation, lowercase
  const first = author.split(/\s+/)[0].replace(/[^a-z]/gi, "").toLowerCase();
  if (MALE_FIRST_NAMES.has(first)) return "male";
  if (FEMALE_FIRST_NAMES.has(first)) return "female";
  return "neutral";
}

// ── Neural voice selection ────────────────────────────────────────────────────
// Priority lists ordered best-to-worst quality per gender.
// Covers Chrome (Google neural), Edge (Microsoft Online Natural),
// macOS (Siri/System voices), and Windows SAPI fallbacks.
const FEMALE_VOICE_PRIORITY = [
  "Microsoft Aria Online (Natural)",   // Edge — best Windows neural female
  "Microsoft Ava Online (Natural)",    // Edge alternative
  "Microsoft Jenny Online (Natural)",
  "Google US English",                 // Chrome — neural quality, female timbre
  "Samantha",                          // macOS — highest quality system voice
  "Karen",                             // macOS Australian
  "Moira",                             // macOS Irish
  "Victoria",                          // macOS
  "Tessa",                             // macOS South African
  "Microsoft Zira Desktop",            // Windows SAPI
  "Microsoft Zira",
];

const MALE_VOICE_PRIORITY = [
  "Microsoft Guy Online (Natural)",    // Edge — best Windows neural male
  "Microsoft Andrew Online (Natural)", // Edge alternative
  "Microsoft Ryan Online (Natural)",
  "Microsoft Davis Online (Natural)",
  "Google UK English Male",            // Chrome
  "Alex",                              // macOS — premium default male
  "Daniel",                            // macOS British
  "Tom",                               // macOS
  "Fred",                              // macOS
  "Microsoft David Desktop",           // Windows SAPI
  "Microsoft David",
];

/**
 * Returns the highest-quality available SpeechSynthesisVoice for the given
 * gender. Falls back through progressively looser matches before giving up.
 *
 * IMPORTANT: getVoices() is async on first call — always call this after the
 * voiceschanged event has fired (handled inside VoicePlayer via voicesReady).
 */
function selectBestVoice(gender: Gender): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const priority = gender === "male" ? MALE_VOICE_PRIORITY
    : gender === "female" ? FEMALE_VOICE_PRIORITY
    : [...FEMALE_VOICE_PRIORITY, ...MALE_VOICE_PRIORITY];

  // 1. Exact name match
  for (const name of priority) {
    const v = voices.find((v) => v.name === name);
    if (v) return v;
  }

  // 2. Partial name match (catches locale suffixes like "Aria (United States)")
  for (const name of priority) {
    const keyword = name.split(" ")[1] ?? name.split(" ")[0]; // e.g. "Aria", "Guy"
    const v = voices.find((v) => v.name.includes(keyword) && v.lang.startsWith("en"));
    if (v) return v;
  }

  // 3. Gender keyword in voice name (some browsers expose this)
  const keyword = gender === "female" ? "female" : gender === "male" ? "male" : null;
  if (keyword) {
    const v = voices.find((v) =>
      v.lang.startsWith("en") && v.name.toLowerCase().includes(keyword)
    );
    if (v) return v;
  }

  // 4. Any English voice
  return voices.find((v) => v.lang === "en-US")
    ?? voices.find((v) => v.lang.startsWith("en"))
    ?? null;
}

/** Speech tuning parameters per gender — adjusted for naturalness */
function speechParams(gender: Gender) {
  if (gender === "female") return { rate: 0.87, pitch: 1.08, volume: 1.0 };
  if (gender === "male")   return { rate: 0.83, pitch: 0.91, volume: 1.0 };
  return                          { rate: 0.87, pitch: 1.0,  volume: 1.0 };
}

// ── Audio player for voice stories ──────────────────────────────────────────
function VoicePlayer({ story }: { story: Story }) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [voicesReady, setVoicesReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices — getVoices() is async; voiceschanged fires when ready.
  // We also call it immediately in case the browser already has them cached.
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const onVoicesChanged = () => setVoicesReady(true);
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoicesReady(true);
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
      return () => window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
    }
  }, []);

  // Cleanup on unmount or story change
  useEffect(() => {
    return () => { stopAll(); };
  }, [story.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopAll = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    if (timerRef.current) clearInterval(timerRef.current);
    setPlaying(false);
    setElapsed(0);
  }, []);

  const handleToggle = useCallback(() => {
    if (playing) { stopAll(); return; }

    // Real audio file — play directly, no TTS needed
    if (story.audioUrl && audioRef.current) {
      audioRef.current.play().then(() => {
        setPlaying(true);
        timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
      }).catch(() => setPlaying(false));
      audioRef.current.onended = () => stopAll();
      return;
    }

    // TTS fallback: gender-matched neural voice reads the story aloud
    if (!window.speechSynthesis) return;
    const gender = detectGender(story.author);
    const voice = selectBestVoice(gender);
    const params = speechParams(gender);

    const text = `${story.title}. By ${story.author}. ${story.excerpt}`;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = params.rate;
    u.pitch = params.pitch;
    u.volume = params.volume;
    if (voice) u.voice = voice;
    u.onend = () => stopAll();
    u.onerror = () => stopAll();
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
    setPlaying(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  }, [playing, story, stopAll]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const gender = detectGender(story.author);
  const voiceLabel = gender === "male" ? "Male narrator" : gender === "female" ? "Female narrator" : "Narrator";

  return (
    <div className="bg-gray-100 rounded-lg p-4 mb-4">
      {story.audioUrl && (
        <audio ref={audioRef} src={story.audioUrl} preload="metadata" className="hidden" />
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggle}
          disabled={!story.audioUrl && !voicesReady}
          aria-label={playing ? "Stop story audio" : "Play story audio"}
          className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shrink-0 disabled:opacity-40"
        >
          {playing
            ? <Square className="w-4 h-4 fill-white" />
            : <Play className="w-4 h-4 fill-white ml-0.5" />}
        </button>
        <div className="flex-1">
          <div className="h-1.5 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-1000"
              style={{ width: playing ? "100%" : "0%", transitionDuration: playing ? "120s" : "0.3s" }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">{playing ? fmt(elapsed) : "0:00"}</p>
            {!story.audioUrl && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> {voiceLabel}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Story detail side panel ──────────────────────────────────────────────────
interface StoryDetailPanelProps {
  story: Story | null;
  onClose: () => void;
}

export function StoryDetailPanel({ story, onClose }: StoryDetailPanelProps) {
  if (!story) return null;

  const TypeIcon = story.type === "photo" ? Camera
    : story.type === "video" ? Video
    : story.type === "voice" ? Mic
    : FileText;

  return (
    <div className="story-detail-panel absolute bottom-0 sm:top-0 right-0 w-full sm:w-[420px] max-h-[85dvh] sm:h-full bg-white/95 backdrop-blur-sm z-[1000] overflow-y-auto shadow-2xl rounded-t-2xl sm:rounded-none">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close story panel"
        className="absolute top-4 right-4 p-2 rounded-full bg-white shadow hover:bg-gray-100 z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Hero — YouTube > image > nothing */}
      {story.youtubeUrl ? (
        <div className="w-full aspect-video bg-black">
          <iframe
            src={story.youtubeUrl}
            title={story.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : story.imageUrl ? (
        <img
          src={story.imageUrl}
          alt={story.title}
          className="w-full h-56 object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
            (e.currentTarget as HTMLImageElement).onerror = null;
          }}
        />
      ) : null}

      <div className="p-6">
        {story.featured && (
          <div className="flex items-center gap-1.5 mb-3 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full w-fit">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs text-amber-700">Featured Story</span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-xs"
            style={{ background: typeColors[story.type] ?? "#374151" }}
          >
            <TypeIcon className="w-3 h-3" />
            {story.type.charAt(0).toUpperCase() + story.type.slice(1)}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs">
            {story.theme}
          </span>
        </div>

        <h2 className="mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{story.title}</h2>
        <p className="text-sm text-gray-500 mb-4">
          By {story.author} · {story.neighborhood} · {new Date(story.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        {story.featured && (
          <p className="text-xs text-gray-400 mb-3">100 Avenue of Champions, Richmond, VA 23230</p>
        )}

        <p className="text-gray-700 leading-relaxed mb-4">{story.excerpt}</p>

        {/* Audio player — for all voice stories */}
        {story.type === "voice" && !story.youtubeUrl && (
          <VoicePlayer story={story} />
        )}

        {story.sourceAttribution && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-700">
              <span className="font-semibold">Source:</span> {story.sourceAttribution}
            </p>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-700">
            This story was shared with explicit consent from the storyteller. Stories on this platform are voluntarily submitted and do not represent all Richmond voices.
          </p>
        </div>
      </div>
    </div>
  );
}
