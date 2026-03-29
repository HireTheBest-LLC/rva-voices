"use client";
/**
 * InsightsDashboard — Story Insights for RVA Legacy Map
 *
 * Gap #17 fix: This component now fetches live submission data from /api/stories
 * and merges it with the seed sampleStories so the dashboard reflects real
 * submissions rather than hardcoded counts.
 *
 * Gap #22 fix: A "What scales with more stories" section explains the roadmap
 * to City staff and frames the demo honestly as a prototype.
 *
 * Equity note (G1): A prominent AAPOR-compliant disclaimer is shown before all
 * charts to prevent representational harm.
 */
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { sampleStories, themes, Story } from "@/data/stories";
import { AlertTriangle, ExternalLink, TrendingUp } from "lucide-react";

const COLORS = ["#dc2626", "#2563eb", "#059669", "#7c3aed"];

/** Derive chart data from any array of stories */
function buildChartData(stories: Story[]) {
  const themeData = themes
    .map((t) => ({ name: t, count: stories.filter((s) => s.theme === t).length }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  const neighborhoodMap = stories.reduce((acc, s) => {
    acc.set(s.neighborhood, (acc.get(s.neighborhood) || 0) + 1);
    return acc;
  }, new Map<string, number>());
  const neighborhoodData = Array.from(neighborhoodMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const typeData = [
    { name: "Voice Memo", value: stories.filter((s) => s.type === "voice").length },
    { name: "Photo",      value: stories.filter((s) => s.type === "photo").length },
    { name: "Text",       value: stories.filter((s) => s.type === "text").length },
    { name: "Video",      value: stories.filter((s) => s.type === "video").length },
  ].filter((d) => d.value > 0);

  return { themeData, neighborhoodData, typeData };
}

export function InsightsDashboard() {
  // Gap #17: fetch live submitted stories from the backend API
  const [liveStories, setLiveStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stories")
      .then((r) => r.json())
      .then((data: any[]) => {
        const mapped: Story[] = data.map((s) => ({
          id: s.id,
          title: s.title,
          author: s.author,
          neighborhood: s.neighborhood,
          lat: s.lat,
          lng: s.lng,
          excerpt: s.excerpt,
          type: (["photo", "video", "voice", "text"].includes(s.type) ? s.type : "text") as Story["type"],
          theme: s.theme,
          date: s.date,
          consentGiven: true,
        }));
        setLiveStories(mapped);
      })
      .catch(() => {
        // Backend unreachable — show seed data only, no crash
      })
      .finally(() => setLoading(false));
  }, []);

  // Merge seed stories with live submitted stories for all charts
  const allStories = [...sampleStories, ...liveStories];
  const { themeData, neighborhoodData, typeData } = buildChartData(allStories);
  const submittedCount = liveStories.length;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', serif" }}>Story Insights Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Themes and patterns emerging from community-submitted stories.
          {submittedCount > 0 && (
            <span className="ml-2 text-sm text-green-700 font-medium">
              {submittedCount} new submission{submittedCount !== 1 ? "s" : ""} included.
            </span>
          )}
        </p>
      </div>

      {/* AAPOR-compliant disclaimer — required by G1 research (representational bias) */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-800">
            <strong>Non-representative sample:</strong> This dashboard reflects stories submitted
            voluntarily by community members — an opt-in, nonprobability sample. It does not
            represent a statistically randomized survey of all Richmond residents. Because
            participation requires digital access, certain neighborhoods and demographic groups
            may be underrepresented. These findings are illustrative of community sentiment,
            not generalizable to the entire city.
          </p>
          <p className="text-xs text-amber-600 mt-1">
            Per AAPOR Transparency Initiative disclosure standards
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <p className="text-3xl text-[#1e3a5f]">{loading ? "…" : allStories.length}</p>
          <p className="text-sm text-gray-500 mt-1">Stories Shared</p>
          {submittedCount > 0 && (
            <p className="text-xs text-green-600 mt-0.5">+{submittedCount} submitted</p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <p className="text-3xl text-[#1e3a5f]">{loading ? "…" : neighborhoodData.length}</p>
          <p className="text-sm text-gray-500 mt-1">Neighborhoods Represented</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <p className="text-3xl text-[#1e3a5f]">{loading ? "…" : themeData.length}</p>
          <p className="text-sm text-gray-500 mt-1">Themes Identified</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="mb-4">Stories by Theme</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={themeData} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1e3a5f" radius={[0, 4, 4, 0]}>
                {themeData.map((entry) => (
                  <Cell key={`theme-${entry.name}`} fill="#1e3a5f" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="mb-4">Submission Types</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name} (${value})`}
              >
                {typeData.map((entry, i) => (
                  <Cell key={`type-${entry.name}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gap #22 — Scale-up framing.
          H3 research recommends framing the demo as "imagine 200 stories" to
          help judges and City staff understand the tool's potential without
          over-claiming on small-n data. */}
      <div className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/20 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-[#1e3a5f]" />
          <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[#1e3a5f]">
            What Scales with More Stories
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          This is an illustrative prototype. At 200+ submissions, this dashboard becomes
          a genuine planning tool for City staff and cultural partners:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              stat: "~200 stories",
              description: "Theme frequency becomes statistically meaningful — \"Displacement & Change\" rising across three neighborhoods signals a planning priority.",
            },
            {
              stat: "Geographic gaps",
              description: "Neighborhoods with zero submissions become visible — revealing which communities need targeted in-person or multilingual outreach.",
            },
            {
              stat: "Language split",
              description: "Ratio of Spanish to English submissions shows whether underrepresented communities are being reached, driving partnership decisions.",
            },
          ].map((item) => (
            <div key={item.stat} className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-[#1e3a5f] mb-1">{item.stat}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4 italic">
          Proposed next step: 4–6 week pilot with 3 community partner organizations to collect 200 stories,
          paired with in-person pop-up sessions in RRHA communities for residents without home broadband.
        </p>
      </div>

      {/* Oral History Resources — E-010, E-011, E-012 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Richmond Oral History Resources
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          This platform complements — not duplicates — the incredible oral history work already
          being done in Richmond. Explore these collections:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="https://archive.storycorps.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-gray-200 rounded-lg p-4 hover:border-[#1e3a5f] hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[#1e3a5f]">StoryCorps Richmond</h4>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#1e3a5f]" />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Richmond was a "One Small Step" model community. 500+ conversations recorded,
              including 25+ in-person sessions at the Library of Virginia (Oct 2023).
            </p>
            <p className="text-xs text-blue-600 mt-2">archive.storycorps.org</p>
          </a>

          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <h4 className="text-[#1e3a5f]">VCU Libraries Collections</h4>
            <a
              href="https://scholarscompass.vcu.edu/ful/"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 bg-gray-50 rounded hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs">Historic Fulton Oral History</span>
                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-[#1e3a5f]" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                17 interviews, 32 participants. Streaming audio + searchable transcripts.
              </p>
            </a>
            <a
              href="https://scholarscompass.vcu.edu/car/"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 bg-gray-50 rounded hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs">Carver-VCU Partnership</span>
                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-[#1e3a5f]" />
              </div>
              <p className="text-xs text-gray-500 mt-1">15 interviews (1999–2000). MP3 + PDF transcripts.</p>
            </a>
          </div>

          <a
            href="https://thevalentine.org/collections/"
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-gray-200 rounded-lg p-4 hover:border-[#1e3a5f] hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[#1e3a5f]">The Valentine</h4>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#1e3a5f]" />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Copyright holder for the Historic Fulton collection. Research database and
              Richmond history collections available online.
            </p>
            <p className="text-xs text-amber-600 mt-2">
              Non-commercial use of Fulton material permitted; commercial use requires permission.
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
