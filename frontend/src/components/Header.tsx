import { MapPin, PlusCircle, BarChart3, BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";

type View = "map" | "submit" | "insights" | "about";

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: "map", label: "Explore Map", icon: <MapPin className="w-4 h-4" /> },
    { view: "submit", label: "Share Story", icon: <PlusCircle className="w-4 h-4" /> },
    { view: "insights", label: "Insights", icon: <BarChart3 className="w-4 h-4" /> },
    { view: "about", label: "About", icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-[#1e3a5f] text-white relative z-[2000]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <button onClick={() => onViewChange("map")} className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <span className="block text-sm font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>Richmond Stories</span>
            <span className="block text-xs text-blue-200">RVA Legacy Map</span>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                currentView === item.view ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden bg-[#162d4a] border-t border-white/10 px-4 py-2">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => { onViewChange(item.view); setMenuOpen(false); }}
              className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                currentView === item.view ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
