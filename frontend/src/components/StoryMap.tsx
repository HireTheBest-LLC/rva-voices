import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Story, neighborhoods } from "@/data/stories";
import { Camera, Mic, FileText, Video, X, Star } from "lucide-react";

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
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        box-shadow: 0 0 0 4px rgba(245,158,11,0.3), 0 4px 12px rgba(0,0,0,0.35);
        border: 3px solid white;
        cursor: pointer;
        animation: pulse-featured 2s ease-in-out infinite;
      ">⭐</div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
  }
  return L.divIcon({
    className: "custom-story-marker",
    html: `<div style="
      background: ${typeColors[type]};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 3px solid white;
      cursor: pointer;
    ">${typeIcons[type]}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function createNeighborhoodIcon() {
  return L.divIcon({
    className: "neighborhood-marker",
    html: `<div style="
      background: rgba(30,58,95,0.85);
      color: white;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.7);
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

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

      const popupLabel = story.featured ? `<span style="background:#f59e0b;color:white;padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:600;margin-bottom:4px;display:inline-block;">⭐ FEATURED STORY</span><br/>` : "";

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

interface StoryDetailPanelProps {
  story: Story | null;
  onClose: () => void;
}

export function StoryDetailPanel({ story, onClose }: StoryDetailPanelProps) {
  if (!story) return null;

  const TypeIcon = story.type === "photo" ? Camera : story.type === "video" ? Video : story.type === "voice" ? Mic : FileText;

  return (
    <div className="absolute top-0 right-0 w-full sm:w-[420px] h-full bg-white/95 backdrop-blur-sm z-[1000] overflow-y-auto shadow-2xl">
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white shadow hover:bg-gray-100 z-10">
        <X className="w-5 h-5" />
      </button>

      {/* YouTube embed for video stories */}
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
        <img src={story.imageUrl} alt={story.title} className="w-full h-56 object-cover" />
      ) : null}

      <div className="p-6">
        {story.featured && (
          <div className="flex items-center gap-1.5 mb-3 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full w-fit">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs text-amber-700">Featured Story</span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-xs" style={{ background: typeColors[story.type] }}>
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

        {story.type === "voice" && !story.youtubeUrl && (
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors">
                <span className="ml-0.5">&#9654;</span>
              </button>
              <div className="flex-1">
                <div className="h-1 bg-gray-300 rounded-full">
                  <div className="h-1 bg-red-600 rounded-full w-1/3" />
                </div>
                <p className="text-xs text-gray-500 mt-1">2:34 / 7:12</p>
              </div>
            </div>
          </div>
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
