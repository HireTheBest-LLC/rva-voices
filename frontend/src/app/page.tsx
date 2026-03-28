"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/Header";

const StoryMap = dynamic(() => import("@/components/StoryMap").then(m => ({ default: m.StoryMap })), { ssr: false });
const StoryDetailPanel = dynamic(() => import("@/components/StoryMap").then(m => ({ default: m.StoryDetailPanel })), { ssr: false });
import { SubmitStory } from "@/components/SubmitStory";
import { InsightsDashboard } from "@/components/InsightsDashboard";
import { AboutPage } from "@/components/AboutPage";
import { sampleStories, themes, neighborhoods, Story } from "@/data/stories";
import { MapPin, Filter, Star, Play } from "lucide-react";

type View = "map" | "submit" | "insights" | "about";

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("map");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [featuredDismissed, setFeaturedDismissed] = useState(false);

  const featuredStory = sampleStories.find((s) => s.featured);

  const handleStorySelect = useCallback((story: Story) => {
    setSelectedStory(story);
  }, []);

  const filteredCount = sampleStories.filter((s) => {
    if (selectedTheme && s.theme !== selectedTheme) return false;
    if (selectedNeighborhood && s.neighborhood !== selectedNeighborhood) return false;
    return true;
  }).length;

  return (
    <div className="h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header currentView={currentView} onViewChange={setCurrentView} />

      {currentView === "map" && (
        <div className="flex-1 relative overflow-hidden">
          {/* Featured Story Banner */}
          {featuredStory && !featuredDismissed && !selectedStory && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-2rem)] max-w-lg">
              <div className="bg-white rounded-xl shadow-2xl border border-amber-200 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Star className="w-4 h-4 fill-white" />
                    <span className="text-sm">Featured Story</span>
                  </div>
                  <button onClick={() => setFeaturedDismissed(true)} className="text-white/80 hover:text-white text-xs">Dismiss</button>
                </div>
                <button
                  onClick={() => setSelectedStory(featuredStory)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-amber-50 transition-colors text-left"
                >
                  <div className="w-14 h-14 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <Play className="w-6 h-6 text-amber-600 ml-0.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm truncate" style={{ fontFamily: "'Playfair Display', serif" }}>{featuredStory.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">100 Avenue of Champions · {featuredStory.neighborhood}</p>
                    <p className="text-xs text-amber-600 mt-0.5">Click to watch</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Filter bar */}
          <div className={`absolute ${featuredStory && !featuredDismissed && !selectedStory ? "top-[120px]" : "top-4"} left-4 z-[1000] flex flex-col gap-2 transition-all`}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-sm"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(selectedTheme || selectedNeighborhood) && (
                <span className="w-5 h-5 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center text-xs">
                  {(selectedTheme ? 1 : 0) + (selectedNeighborhood ? 1 : 0)}
                </span>
              )}
            </button>

            {showFilters && (
              <div className="bg-white rounded-lg shadow-lg p-4 w-64">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-700">Filter Stories</span>
                  {(selectedTheme || selectedNeighborhood) && (
                    <button
                      onClick={() => { setSelectedTheme(null); setSelectedNeighborhood(null); }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <label className="block text-xs text-gray-500 mb-1">Neighborhood</label>
                <select
                  value={selectedNeighborhood || ""}
                  onChange={(e) => setSelectedNeighborhood(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3 bg-gray-50"
                >
                  <option value="">All Neighborhoods</option>
                  {neighborhoods.map((n) => <option key={n.name} value={n.name}>{n.name}</option>)}
                </select>

                <label className="block text-xs text-gray-500 mb-1">Theme</label>
                <select
                  value={selectedTheme || ""}
                  onChange={(e) => setSelectedTheme(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                >
                  <option value="">All Themes</option>
                  {themes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>

                <p className="text-xs text-gray-400 mt-3">{filteredCount} stories shown</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="absolute bottom-6 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
            <p className="text-xs text-gray-500 mb-2">Story Types</p>
            <div className="flex flex-wrap gap-2">
              {[
                { type: "featured", label: "Featured", color: "linear-gradient(135deg,#f59e0b,#d97706)", icon: "⭐" },
                { type: "voice", label: "Voice Memo", color: "#dc2626", icon: "🎙️" },
                { type: "photo", label: "Photo", color: "#2563eb", icon: "📷" },
                { type: "text", label: "Text", color: "#059669", icon: "📝" },
                { type: "video", label: "Video", color: "#7c3aed", icon: "🎥" },
              ].map((item) => (
                <div key={item.type} className="flex items-center gap-1.5 text-xs">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]" style={{ background: item.color }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Share CTA */}
          <div className={`absolute ${featuredStory && !featuredDismissed && !selectedStory ? "top-[120px]" : "top-4"} right-4 z-[1000] transition-all`}>
            <button
              onClick={() => setCurrentView("submit")}
              className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-lg shadow-lg hover:bg-amber-600 transition-colors text-sm"
            >
              <MapPin className="w-4 h-4" />
              Share Your Story
            </button>
          </div>

          <StoryMap
            stories={sampleStories}
            selectedTheme={selectedTheme}
            selectedNeighborhood={selectedNeighborhood}
            onStorySelect={handleStorySelect}
          />

          <StoryDetailPanel story={selectedStory} onClose={() => setSelectedStory(null)} />
        </div>
      )}

      {currentView === "submit" && <SubmitStory onBack={() => setCurrentView("map")} />}
      {currentView === "insights" && <InsightsDashboard />}
      {currentView === "about" && <AboutPage />}
    </div>
  );
}
