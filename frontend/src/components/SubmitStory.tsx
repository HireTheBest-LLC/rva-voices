import { useState } from "react";
import { Camera, Mic, Video, FileText, Upload, CheckCircle, ArrowLeft, ArrowRight, Shield, AlertTriangle } from "lucide-react";
import { themes, neighborhoods } from "@/data/stories";

const steps = ["Consent", "Your Story", "Media", "Review"];

export function SubmitStory({ onBack }: { onBack: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    consentGiven: false,
    consentUnderstand: false,
    consentWithdraw: false,
    name: "",
    anonymous: false,
    neighborhood: "",
    theme: "",
    title: "",
    story: "",
    type: "text" as "photo" | "video" | "voice" | "text",
    mediaFile: null as File | null,
  });

  const canProceedFromConsent = form.consentGiven && form.consentUnderstand && form.consentWithdraw;
  const canProceedFromStory = form.title && form.story && form.neighborhood && form.theme && (form.name || form.anonymous);
  const canSubmit = canProceedFromConsent && canProceedFromStory;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif" }}>Thank You for Sharing</h1>
          <p className="text-gray-600 mt-3 mb-6">
            Your story has been submitted for review. Once approved, it will appear on the Richmond Stories Map for the community to experience.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You may withdraw your story at any time by contacting us at stories@rvalegacy.org
          </p>
          <button onClick={onBack} className="px-6 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#162d4a] transition-colors">
            Return to Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto p-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Map
        </button>

        <h1 className="mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Tell Us Your Story</h1>
        <p className="text-gray-600 mb-8">Share your lived experience to help preserve Richmond's history and inform the city's future.</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-colors ${
                i <= currentStep ? "bg-[#1e3a5f] text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i <= currentStep ? "text-[#1e3a5f]" : "text-gray-400"}`}>{step}</span>
              {i < steps.length - 1 && <div className={`h-0.5 flex-1 ${i < currentStep ? "bg-[#1e3a5f]" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step 0: Consent */}
        {currentStep === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-[#1e3a5f]" />
              <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Informed Consent</h2>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800 leading-relaxed">
              <p className="mb-3">Before you share your story, please understand how it will be used:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Your story may be displayed publicly on the Richmond Stories Map.</li>
                <li>Your story may be used to help the City of Richmond understand community perspectives and inform decisions.</li>
                <li>You choose whether to share your name or remain anonymous.</li>
                <li>You may withdraw your story at any time by contacting us.</li>
                <li>Your story will not be used for commercial purposes without separate permission.</li>
                <li>Audio/video submissions will be reviewed before publishing.</li>
              </ul>
              <p className="mt-3 text-xs text-blue-600">
                Consent framework informed by Oral History Association guidelines (oralhistory.org/informed-consent/).
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.consentGiven} onChange={(e) => setForm({ ...form, consentGiven: e.target.checked })} className="mt-1 w-5 h-5 rounded accent-[#1e3a5f]" />
                <span className="text-sm">I consent to sharing my story on the Richmond Stories Map and understand it may be publicly visible.</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.consentUnderstand} onChange={(e) => setForm({ ...form, consentUnderstand: e.target.checked })} className="mt-1 w-5 h-5 rounded accent-[#1e3a5f]" />
                <span className="text-sm">I understand my story may help inform City decisions and community understanding.</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.consentWithdraw} onChange={(e) => setForm({ ...form, consentWithdraw: e.target.checked })} className="mt-1 w-5 h-5 rounded accent-[#1e3a5f]" />
                <span className="text-sm">I understand I can withdraw my story at any time.</span>
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                disabled={!canProceedFromConsent}
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-white rounded-lg disabled:opacity-40 hover:bg-[#162d4a] transition-colors"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Story Details */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Your Story</h2>

            <div>
              <label className="block text-sm mb-1">Your Name</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, anonymous: false })}
                  disabled={form.anonymous}
                  placeholder="First name and last initial"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 disabled:opacity-40"
                />
                <label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
                  <input type="checkbox" checked={form.anonymous} onChange={(e) => setForm({ ...form, anonymous: e.target.checked, name: "" })} className="accent-[#1e3a5f]" />
                  Stay anonymous
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Neighborhood</label>
                <select value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30">
                  <option value="">Select...</option>
                  {neighborhoods.map((n) => <option key={n.name} value={n.name}>{n.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Theme</label>
                <select value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30">
                  <option value="">Select...</option>
                  {themes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Story Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Give your story a title"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Your Story</label>
              <p className="text-xs text-gray-500 mb-2">Prompts: What do you remember about your neighborhood? What has changed? What should never be forgotten?</p>
              <textarea
                value={form.story}
                onChange={(e) => setForm({ ...form, story: e.target.value })}
                rows={6}
                placeholder="Share your story here..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 resize-none"
              />
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentStep(0)} className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Back</button>
              <button
                disabled={!canProceedFromStory}
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-white rounded-lg disabled:opacity-40 hover:bg-[#162d4a] transition-colors"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Media */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Add Media (Optional)</h2>
            <p className="text-sm text-gray-600">Enhance your story with a photo, video, or voice memo.</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["text", "photo", "video", "voice"] as const).map((t) => {
                const Icon = t === "photo" ? Camera : t === "video" ? Video : t === "voice" ? Mic : FileText;
                return (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, type: t })}
                    className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                      form.type === t ? "border-[#1e3a5f] bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${form.type === t ? "text-[#1e3a5f]" : "text-gray-400"}`} />
                    <span className="text-xs capitalize">{t === "text" ? "Text Only" : t}</span>
                  </button>
                );
              })}
            </div>

            {form.type !== "text" && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#1e3a5f] transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  Drag & drop your {form.type} file here, or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  {form.type === "photo" ? "JPG, PNG up to 10MB" : form.type === "video" ? "MP4, MOV up to 100MB" : "MP3, WAV, M4A up to 50MB"}
                </p>
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setCurrentStep(1)} className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Back</button>
              <button
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#162d4a] transition-colors"
              >
                Review <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Review Your Submission</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Name</span>
                <span>{form.anonymous ? "Anonymous" : form.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Neighborhood</span>
                <span>{form.neighborhood}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Theme</span>
                <span>{form.theme}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Media Type</span>
                <span className="capitalize">{form.type}</span>
              </div>
              <div className="py-2 border-b border-gray-100">
                <span className="text-gray-500">Title</span>
                <p className="mt-1">{form.title}</p>
              </div>
              <div className="py-2">
                <span className="text-gray-500">Story</span>
                <p className="mt-1 text-gray-700 leading-relaxed">{form.story}</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <p className="text-xs text-green-700">Consent confirmed. You can withdraw your story at any time.</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Based on voluntarily submitted stories — not a representative sample of all Richmond residents.
              </p>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentStep(2)} className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Back</button>
              <button
                onClick={() => setSubmitted(true)}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Your Story
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
