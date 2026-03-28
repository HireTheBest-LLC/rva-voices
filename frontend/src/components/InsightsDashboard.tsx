import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { sampleStories, themes } from "@/data/stories";
import { AlertTriangle, ExternalLink } from "lucide-react";

const themeData = themes.map((t) => ({
  name: t,
  count: sampleStories.filter((s) => s.theme === t).length,
})).filter((d) => d.count > 0).sort((a, b) => b.count - a.count);

const neighborhoodData = Array.from(
  sampleStories.reduce((acc, s) => {
    acc.set(s.neighborhood, (acc.get(s.neighborhood) || 0) + 1);
    return acc;
  }, new Map<string, number>())
).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

const typeData = [
  { name: "Voice Memo", value: sampleStories.filter((s) => s.type === "voice").length },
  { name: "Photo", value: sampleStories.filter((s) => s.type === "photo").length },
  { name: "Text", value: sampleStories.filter((s) => s.type === "text").length },
  { name: "Video", value: sampleStories.filter((s) => s.type === "video").length },
].filter((d) => d.value > 0);

const COLORS = ["#dc2626", "#2563eb", "#059669", "#7c3aed"];

export function InsightsDashboard() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', serif" }}>Story Insights Dashboard</h1>
        <p className="text-gray-600 mt-1">Themes and patterns emerging from community-submitted stories.</p>
      </div>

      {/* Disclaimer - E-014 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-800">
            <strong>Non-representative sample:</strong> Based on voluntarily submitted stories — not a representative sample of all Richmond residents. These insights reflect only the voices of those who chose to participate and should not be interpreted as representative of any neighborhood, demographic, or community.
          </p>
          <p className="text-xs text-amber-600 mt-1">Per AAPOR disclosure standards (aapor.org/standards-and-ethics/disclosure-standards/)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <p className="text-3xl text-[#1e3a5f]">{sampleStories.length}</p>
          <p className="text-sm text-gray-500 mt-1">Stories Shared</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <p className="text-3xl text-[#1e3a5f]">{neighborhoodData.length}</p>
          <p className="text-sm text-gray-500 mt-1">Neighborhoods Represented</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <p className="text-3xl text-[#1e3a5f]">{themeData.length}</p>
          <p className="text-sm text-gray-500 mt-1">Themes Identified</p>
        </div>
      </div>

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
              <Pie data={typeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, value }) => `${name} (${value})`}>
                {typeData.map((entry, i) => (
                  <Cell key={`type-${entry.name}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Oral History Resources - E-010, E-011, E-012 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Richmond Oral History Resources</h2>
        <p className="text-sm text-gray-600 mb-4">
          This platform complements — not duplicates — the incredible oral history work already being done in Richmond. Explore these collections:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* E-010 */}
          <a href="https://archive.storycorps.org/" target="_blank" rel="noopener noreferrer" className="block border border-gray-200 rounded-lg p-4 hover:border-[#1e3a5f] hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[#1e3a5f]">StoryCorps Richmond</h4>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#1e3a5f]" />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Richmond was a "One Small Step" model community. 500+ conversations recorded, including 25+ in-person sessions at the Library of Virginia (Oct 2023).
            </p>
            <p className="text-xs text-blue-600 mt-2">archive.storycorps.org</p>
          </a>

          {/* E-011 */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <h4 className="text-[#1e3a5f]">VCU Libraries Collections</h4>
            <a href="https://scholarscompass.vcu.edu/ful/" target="_blank" rel="noopener noreferrer" className="block p-2 bg-gray-50 rounded hover:bg-blue-50 transition-colors group">
              <div className="flex items-center justify-between">
                <span className="text-xs">Historic Fulton Oral History</span>
                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-[#1e3a5f]" />
              </div>
              <p className="text-xs text-gray-500 mt-1">17 interviews, 32 participants. Streaming audio + searchable transcripts.</p>
            </a>
            <a href="https://scholarscompass.vcu.edu/car/" target="_blank" rel="noopener noreferrer" className="block p-2 bg-gray-50 rounded hover:bg-blue-50 transition-colors group">
              <div className="flex items-center justify-between">
                <span className="text-xs">Carver-VCU Partnership</span>
                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-[#1e3a5f]" />
              </div>
              <p className="text-xs text-gray-500 mt-1">15 interviews (1999–2000). MP3 + PDF transcripts.</p>
            </a>
          </div>

          {/* E-012 */}
          <a href="https://thevalentine.org/collections/" target="_blank" rel="noopener noreferrer" className="block border border-gray-200 rounded-lg p-4 hover:border-[#1e3a5f] hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[#1e3a5f]">The Valentine</h4>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#1e3a5f]" />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Copyright holder for the Historic Fulton collection. Research database and Richmond history collections available online.
            </p>
            <p className="text-xs text-amber-600 mt-2">Non-commercial use of Fulton material permitted; commercial use requires permission.</p>
          </a>
        </div>
      </div>
    </div>
  );
}