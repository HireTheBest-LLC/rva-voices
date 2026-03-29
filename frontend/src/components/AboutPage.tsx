import { Shield, Users, MapPin, ExternalLink, Heart, Cpu } from "lucide-react";

const andreyImg = "/assets/b984caee9d0845191ab4a910c716e69201708997.png";
const davidImg = "/assets/d40ffdd35b1c472dfe7bdf336df6578935396e13.png";
const edImg = "/assets/ef172b2b30f9220fa1a64cdb8414e67bfc38cee5.png";
const sidImg = "/assets/46e98006eef263e1d03a249ea93e13b8921e6af1.png";
const chasityImg = "/assets/e9344c365056b98578b9bc4c7018fcb7e5085516.png";

const team = [
  { name: "Andrey V. Karpov", role: "Founder, President, & CEO", img: andreyImg },
  { name: "David Cowart", role: "CTO", img: davidImg },
  { name: "Ed Leitao", role: "Project Management Advisor", img: edImg },
  { name: "Chasity L. Bailey", role: "HR, GRC, & Legal Advisor", img: chasityImg },
  { name: "Sid Tanu", role: "Finance & Risk Advisor", img: sidImg },
];

export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', serif" }}>About RVA Legacy Map</h1>
        <p className="text-gray-600 mt-2 leading-relaxed">
          RVA Legacy Map is an interactive storytelling platform built for the <a href="https://rvahacks.org" target="_blank" rel="noopener noreferrer" className="text-[#1e3a5f] underline">Hack for RVA</a> hackathon in Richmond, Virginia. It addresses <strong>Problem 2: Resident Stories as Civic Insight</strong> — capturing lived experiences to help preserve Richmond's social history and amplify underrepresented voices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <Shield className="w-8 h-8 text-[#1e3a5f] mb-3" />
          <h3>Consent-First Design</h3>
          <p className="text-sm text-gray-600 mt-1">Every story requires explicit, informed consent before submission. Storytellers can withdraw at any time.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <Users className="w-8 h-8 text-[#1e3a5f] mb-3" />
          <h3>Equity & Inclusion</h3>
          <p className="text-sm text-gray-600 mt-1">Designed to amplify voices from underrepresented communities. We acknowledge participation bias in all aggregate views.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <MapPin className="w-8 h-8 text-[#1e3a5f] mb-3" />
          <h3>Place-Based Stories</h3>
          <p className="text-sm text-gray-600 mt-1">Stories are anchored to Richmond's neighborhoods, connecting personal memory to shared place.</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h2 className="mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Complementing Existing Work</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          This platform is designed to <strong>complement, not duplicate</strong>, the oral history work led by Richmond's cultural institutions:
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <ExternalLink className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span><strong>StoryCorps</strong> — Richmond was a "One Small Step" model community with 500+ recorded conversations (<a href="https://storycorps.org/richmond/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">storycorps.org/richmond</a>)</span>
          </li>
          <li className="flex items-start gap-2">
            <ExternalLink className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span><strong>VCU Libraries</strong> — Historic Fulton (17 interviews) and Carver (15 interviews) oral history collections, freely accessible (<a href="https://scholarscompass.vcu.edu/ful/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">VCU Scholars Compass</a>)</span>
          </li>
          <li className="flex items-start gap-2">
            <ExternalLink className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span><strong>The Valentine</strong> — Copyright holder for Fulton collection; research database at <a href="https://thevalentine.org/collections/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">thevalentine.org/collections</a></span>
          </li>
        </ul>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h2 className="mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Privacy & Data</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          All stories are submitted with explicit consent following Oral History Association guidelines. Aggregate insights always display a non-representative sample disclaimer per AAPOR disclosure standards. This prototype is not designed for collecting PII or securing sensitive data. Audio and video submissions are reviewed before publishing.
        </p>
      </div>

      {/* Vicktoria AI & Team */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Cpu className="w-6 h-6 text-[#1e3a5f]" />
          <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Built by Vicktoria AI</h2>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          Vicktoria AI is a frontier AI tech company that focuses on creating humanlike ethical AI models that provide emotional intelligence through logic.
        </p>

        <h3 className="mb-4">Our Team</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {team.map((member) => (
            <div key={member.name} className="text-center">
              <img
                src={member.img}
                alt={member.name}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border-2 border-gray-200"
              />
              <p className="text-sm text-[#1e3a5f]">{member.name}</p>
              <p className="text-xs text-gray-500 leading-snug mt-0.5">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Heart className="w-4 h-4 text-red-400" />
          <span>Built with love by the Vicktoria AI team for Richmond at <a href="https://rvahacks.org" target="_blank" rel="noopener noreferrer" className="text-[#1e3a5f] underline">Hack for RVA 2026</a></span>
        </div>
      </div>
    </div>
  );
}