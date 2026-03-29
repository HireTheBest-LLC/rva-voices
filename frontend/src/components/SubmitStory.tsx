"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Volume2, VolumeX, CheckCircle, ArrowLeft, ArrowRight, Shield, AlertTriangle, Square, FileText } from "lucide-react";
import { themes, neighborhoods } from "@/data/stories";

const CONSENT_EN = {
  lang: "en-US",
  playBtn: "Play Consent Aloud",
  stopPlayBtn: "Stop Audio",
  recordBtn: "Record My Consent",
  stopBtn: "Stop Recording",
  consentRecorded: "Consent recorded. You may now continue.",
  listenFirst: "Listen to the consent statement, then record yourself saying the consent phrase aloud.",
  promptLabel: "PLEASE SAY THE FOLLOWING OUT LOUD TO GIVE CONSENT:",
  prompt: `"My name is [STATE YOUR FULL NAME]. I have listened to this consent statement. I understand how my story will be used. I agree to share my story with RVA Voices."`,
  text: `This is RVA Voices — a project to help Richmond hear from people like you.

Before you share your story, please listen carefully.

ONE — What you are sharing.
You are sharing a story about your life and your neighborhood. You can share by speaking or by typing. You can use your name, or you can stay anonymous — it is your choice.

TWO — How your story will be used.
Your story may be seen by City of Richmond staff and historians. It will be used to help understand Richmond's history and neighborhoods. It will not be sold. It will not be used to train AI systems.

THREE — Who can see it.
City staff can see all stories. Your story will only be shown to the public if you say it is okay.

FOUR — Your rights.
You are sharing this freely. No one is making you do this. You will not be paid. You can ask us to remove your story at any time by emailing hack4rva@aireadyrva.org.

FIVE — One important limit.
The stories we collect come from people who choose to participate. They do not represent every person in Richmond. We will always say that clearly.

If you are under 18, please do not submit without a parent's permission.`,
};

const CONSENT_ES = {
  lang: "es-US",
  playBtn: "Reproducir Consentimiento",
  stopPlayBtn: "Detener Audio",
  recordBtn: "Grabar Mi Consentimiento",
  stopBtn: "Detener Grabación",
  consentRecorded: "Consentimiento grabado. Puede continuar.",
  listenFirst: "Escuche la declaración de consentimiento, luego grabe su acuerdo en voz alta.",
  promptLabel: "POR FAVOR DIGA LO SIGUIENTE EN VOZ ALTA PARA DAR SU CONSENTIMIENTO:",
  prompt: `"Mi nombre es [DIGA SU NOMBRE COMPLETO]. He escuchado esta declaración de consentimiento. Entiendo cómo se usará mi historia. Acepto compartir mi historia con RVA Voices."`,
  text: `Esto es RVA Voices — un proyecto para ayudar a Richmond a escuchar a personas como usted.

UNO — Lo que usted está compartiendo.
Usted está compartiendo una historia sobre su vida y su vecindario. Puede compartirla hablando o escribiendo. Puede usar su nombre o puede quedarse en el anonimato — es su decisión.

DOS — Cómo se usará su historia.
Su historia puede ser vista por el personal de la Ciudad de Richmond y por historiadores. Se usará para ayudar a entender la historia y los vecindarios de Richmond. No se venderá. No se usará para entrenar sistemas de inteligencia artificial.

TRES — Quién puede verla.
El personal de la Ciudad puede ver todas las historias. Su historia solo se mostrará al público si usted lo autoriza.

CUATRO — Sus derechos.
Usted comparte esto libremente. Nadie lo está obligando. No recibirá pago. Puede pedirnos que eliminemos su historia en cualquier momento enviando un correo a hack4rva@aireadyrva.org.

CINCO — Un límite importante.
Las historias que recopilamos vienen de personas que eligen participar. No representan a todas las personas de Richmond. Siempre lo indicaremos claramente.

Si usted tiene menos de 18 años, por favor no envíe su historia sin el permiso de un padre o tutor.`,
};

const steps = ["Consent", "Your Story", "Review"];

export function SubmitStory({ onBack }: { onBack: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [lang, setLang] = useState<"en" | "es">("en");
  const consent = lang === "en" ? CONSENT_EN : CONSENT_ES;

  // Consent audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [consentRecorded, setConsentRecorded] = useState(false);
  const [isRecordingConsent, setIsRecordingConsent] = useState(false);
  const [consentTime, setConsentTime] = useState(0);

  // Story input state
  const [storyMode, setStoryMode] = useState<"text" | "voice">("text");
  const [isRecordingStory, setIsRecordingStory] = useState(false);
  const [storyBlob, setStoryBlob] = useState<Blob | null>(null);
  const [storyTime, setStoryTime] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");

  const [form, setForm] = useState({
    name: "", anonymous: false,
    neighborhood: "", theme: "",
    title: "", story: "",
  });

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);

  const canProceedFromStory = !!(form.title && form.story && form.neighborhood && form.theme && (form.name || form.anonymous));

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Cancel audio on lang change
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  }, [lang]);

  const playConsent = useCallback(() => {
    if (!window.speechSynthesis) return;
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(consent.text + "\n\n" + consent.promptLabel + "\n" + consent.prompt);
    u.lang = consent.lang;
    u.rate = 0.88;
    u.onend = () => setIsPlaying(false);
    u.onerror = () => setIsPlaying(false);
    setIsPlaying(true);
    window.speechSynthesis.speak(u);
  }, [isPlaying, consent]);

  const startConsentRec = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        setConsentRecorded(true);
        stream.getTracks().forEach(t => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };
      rec.start();
      recorderRef.current = rec;
      setIsRecordingConsent(true);
      setConsentTime(0);
      timerRef.current = setInterval(() => setConsentTime(t => t + 1), 1000);
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
    } catch {
      alert("Microphone access is required to record consent. Please allow microphone access and try again.");
    }
  }, []);

  const stopConsentRec = useCallback(() => {
    recorderRef.current?.stop();
    setIsRecordingConsent(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startStoryRec = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        setStoryBlob(new Blob(chunksRef.current, { type: "audio/webm" }));
        stream.getTracks().forEach(t => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };
      rec.start();
      recorderRef.current = rec;
      setIsRecordingStory(true);
      setStoryTime(0);
      setLiveTranscript("");
      timerRef.current = setInterval(() => setStoryTime(t => t + 1), 1000);

      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = consent.lang;
        let finalText = "";
        recognition.onresult = (event: any) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) finalText += event.results[i][0].transcript + " ";
            else interim += event.results[i][0].transcript;
          }
          setLiveTranscript(finalText + interim);
          if (finalText) setForm(f => ({ ...f, story: finalText.trim() }));
        };
        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch {
      alert("Microphone access is required to record your story.");
    }
  }, [consent.lang]);

  const stopStoryRec = useCallback(() => {
    recorderRef.current?.stop();
    recognitionRef.current?.stop();
    setIsRecordingStory(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif" }}>Thank You for Sharing</h1>
          <p className="text-gray-600 mt-3 mb-6">
            Your story has been submitted for review. Once approved, it will appear on the Richmond Stories Map.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You may withdraw your story at any time by emailing hack4rva@aireadyrva.org
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

        <div className="flex items-center justify-between mb-2">
          <h1 style={{ fontFamily: "'Playfair Display', serif" }}>Tell Us Your Story</h1>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            <button onClick={() => setLang("en")} className={`px-3 py-1.5 transition-colors ${lang === "en" ? "bg-[#1e3a5f] text-white" : "hover:bg-gray-50"}`}>EN</button>
            <button onClick={() => setLang("es")} className={`px-3 py-1.5 transition-colors ${lang === "es" ? "bg-[#1e3a5f] text-white" : "hover:bg-gray-50"}`}>ES</button>
          </div>
        </div>
        <p className="text-gray-600 mb-8">Share your lived experience to help preserve Richmond's history and inform the city's future.</p>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-colors ${i <= currentStep ? "bg-[#1e3a5f] text-white" : "bg-gray-200 text-gray-500"}`}>
                {i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i <= currentStep ? "text-[#1e3a5f]" : "text-gray-400"}`}>{step}</span>
              {i < steps.length - 1 && <div className={`h-0.5 flex-1 ${i < currentStep ? "bg-[#1e3a5f]" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* ── STEP 0: CONSENT ── */}
        {currentStep === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-[#1e3a5f] shrink-0" />
              <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Informed Consent</h2>
            </div>

            {/* Play consent */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-3">{consent.listenFirst}</p>
              <button
                onClick={playConsent}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isPlaying ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-[#1e3a5f] text-white hover:bg-[#162d4a]"}`}
              >
                {isPlaying
                  ? <><VolumeX className="w-4 h-4" /> {consent.stopPlayBtn}</>
                  : <><Volume2 className="w-4 h-4" /> {consent.playBtn}</>}
              </button>
            </div>

            {/* Scrollable consent text */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-44 overflow-y-auto text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {consent.text}
            </div>

            {/* Spoken consent prompt */}
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-amber-800 mb-2 uppercase tracking-wide">{consent.promptLabel}</p>
              <p className="text-sm text-amber-900 italic leading-relaxed">{consent.prompt}</p>
            </div>

            {/* Record consent */}
            <div className="space-y-3">
              {!consentRecorded ? (
                <div className="flex items-center gap-3 flex-wrap">
                  {!isRecordingConsent ? (
                    <button
                      onClick={startConsentRec}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <Mic className="w-4 h-4" /> {consent.recordBtn}
                    </button>
                  ) : (
                    <button
                      onClick={stopConsentRec}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" /> {consent.stopBtn} — {fmt(consentTime)}
                    </button>
                  )}
                  {isRecordingConsent && (
                    <span className="flex items-center gap-1.5 text-sm text-red-600">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Recording…
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700">{consent.consentRecorded}</span>
                  <button
                    onClick={() => { setConsentRecorded(false); setConsentTime(0); }}
                    className="ml-auto text-xs text-gray-400 hover:text-gray-600"
                  >
                    Re-record
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                disabled={!consentRecorded}
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-white rounded-lg disabled:opacity-40 hover:bg-[#162d4a] transition-colors"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1: YOUR STORY ── */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Your Story</h2>

            {/* Name */}
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

            {/* Neighborhood + Theme */}
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

            {/* Title */}
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

            {/* Story — mode toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm">Your Story</label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                  <button
                    onClick={() => { setStoryMode("text"); if (isRecordingStory) stopStoryRec(); }}
                    className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${storyMode === "text" ? "bg-[#1e3a5f] text-white" : "hover:bg-gray-50"}`}
                  >
                    <FileText className="w-3 h-3" /> Type
                  </button>
                  <button
                    onClick={() => setStoryMode("voice")}
                    className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${storyMode === "voice" ? "bg-[#1e3a5f] text-white" : "hover:bg-gray-50"}`}
                  >
                    <Mic className="w-3 h-3" /> Voice
                  </button>
                </div>
              </div>

              {storyMode === "text" ? (
                <>
                  <p className="text-xs text-gray-500 mb-2">What do you remember about your neighborhood? What has changed? What should never be forgotten?</p>
                  <textarea
                    value={form.story}
                    onChange={(e) => setForm({ ...form, story: e.target.value })}
                    rows={6}
                    placeholder="Share your story here..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 resize-none"
                  />
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">Speak your story — it will be transcribed live. Click Stop when finished.</p>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      {!isRecordingStory ? (
                        <button
                          onClick={startStoryRec}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <Mic className="w-4 h-4" /> Start Recording
                        </button>
                      ) : (
                        <button
                          onClick={stopStoryRec}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm"
                        >
                          <Square className="w-3.5 h-3.5 fill-white" /> Stop — {fmt(storyTime)}
                        </button>
                      )}
                      {isRecordingStory && (
                        <span className="flex items-center gap-1.5 text-sm text-red-600">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Recording…
                        </span>
                      )}
                      {storyBlob && !isRecordingStory && (
                        <span className="flex items-center gap-1.5 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" /> Voice recorded
                        </span>
                      )}
                    </div>

                    {/* Live transcript display */}
                    {(isRecordingStory || liveTranscript) && (
                      <div className="border border-gray-200 rounded-lg bg-white p-3 min-h-[72px] text-sm text-gray-700 leading-relaxed">
                        {liveTranscript || <span className="text-gray-400 italic">Listening…</span>}
                      </div>
                    )}
                  </div>

                  {/* Editable transcript */}
                  {form.story && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Review and edit transcript if needed:</p>
                      <textarea
                        value={form.story}
                        onChange={(e) => setForm({ ...form, story: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 resize-none text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentStep(0)} className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Back</button>
              <button
                disabled={!canProceedFromStory}
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-white rounded-lg disabled:opacity-40 hover:bg-[#162d4a] transition-colors"
              >
                Review <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: REVIEW ── */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Review Your Submission</h2>

            <div className="space-y-3 text-sm">
              {[
                { label: "Name", value: form.anonymous ? "Anonymous" : form.name },
                { label: "Neighborhood", value: form.neighborhood },
                { label: "Theme", value: form.theme },
                { label: "Story Type", value: storyBlob ? "Voice recording + transcript" : "Text" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
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
              <p className="text-xs text-green-700">
                Spoken consent recorded. You can withdraw your story at any time by emailing hack4rva@aireadyrva.org
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Illustrative prototype — based on voluntarily submitted stories, not a representative sample of all Richmond residents.
              </p>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentStep(1)} className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Back</button>
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
