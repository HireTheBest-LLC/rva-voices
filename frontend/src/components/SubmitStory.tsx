"use client";
import { useState, useRef, useEffect, useCallback, DragEvent } from "react";
import {
  Mic, Volume2, VolumeX, CheckCircle, XCircle, ArrowLeft, ArrowRight,
  Shield, AlertTriangle, Square, FileText, Music, Video,
  Upload, X, Loader2, Image as ImageIcon, MapPin, Search,
} from "lucide-react";
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

// ── Full UI string translations ───────────────────────────────────────────────
const UI_EN = {
  steps: ["Consent", "Your Story", "Review"],
  backToMap: "Back to Map",
  pageTitle: "Tell Us Your Story",
  pageSubtitle: "Share your lived experience to help preserve Richmond's history and inform the city's future.",
  // Step 0
  informedConsent: "Informed Consent",
  continueBtn: "Continue",
  reRecord: "Re-record",
  // Step 1
  yourStory: "Your Story",
  yourName: "Your Name",
  namePlaceholder: "First name and last initial",
  stayAnonymous: "Stay anonymous",
  neighborhood: "Neighborhood",
  theme: "Theme",
  selectOption: "Select...",
  whereIsStory: "Where is your story set?",
  richmondArea: "Richmond Area",
  specificAddress: "Specific Address",
  pinPlacedAt: (n: string) => `Pin placed at ${n} on the map.`,
  selectNeighborhoodHint: "Select a neighborhood above — your story pin will be placed at that area's center.",
  addressLabel: "Enter a Richmond street address, landmark, or intersection:",
  addressPlaceholder: "e.g. 100 N. 2nd St or Hippodrome Theatre",
  findBtn: "Find",
  locationFound: "Location found",
  noAddressFallback: (n: string) => `If no address is found, your pin will fall back to the ${n} area.`,
  selectNeighborhoodWarning: "Select a neighborhood to place your story on the map.",
  geocodeNotFound: "Address not found. Try a different address or use a neighborhood.",
  geocodeError: "Could not reach geocoding service. Check your connection.",
  storyTitle: "Story Title",
  storyTitlePlaceholder: "Give your story a title",
  yourStoryLabel: "Your Story",
  typeTab: "Type",
  voiceTab: "Voice",
  promptHint: "Not sure where to start? Choose a prompt:",
  storyPlaceholder: "Share your story here...",
  piiWarning: "Please do not include other people's full names, home addresses, or private details in your story.",
  voiceHint: "Speak your story — it will be transcribed live. Click Stop when finished.",
  startRecording: "Start Recording",
  stopRecording: (t: string) => `Stop — ${t}`,
  recordingIndicator: "Recording…",
  voiceRecorded: "Voice recorded",
  listeningIndicator: "Listening…",
  editTranscript: "Review and edit transcript if needed:",
  attachLabel: "Attach Photos, Audio, or Video",
  attachHint: (n: number) => `(optional — up to ${n} files, 100 MB each)`,
  dropHint: "Drag and drop files here, or",
  dropBrowse: "click to browse",
  dropTypes: "Images, audio files, and videos accepted",
  maxFilesError: (n: number) => `Maximum ${n} files allowed.`,
  fileSizeError: (name: string) => `"${name}" exceeds the 100 MB limit.`,
  fileTypeError: (name: string) => `"${name}" is not an accepted type (image, audio, or video).`,
  backBtn: "Back",
  reviewBtn: "Review",
  // Step 2
  reviewTitle: "Review Your Submission",
  labelName: "Name",
  labelNeighborhood: "Neighborhood",
  labelMapPin: "Map Pin",
  labelTheme: "Theme",
  labelStoryType: "Story Type",
  labelVisibility: "Visibility",
  labelTitle: "Title",
  labelStory: "Story",
  labelFiles: "Attached Files",
  anonymous: "Anonymous",
  areaCenter: (n: string) => `${n} area center`,
  storyTypeVoice: "Voice recording + transcript",
  storyTypeText: "Text",
  visibilityPublic: "Public — shown on RVA Legacy Map",
  visibilityPrivate: "Private — City staff only",
  consentNote: "Spoken consent recorded. You can withdraw your story at any time by emailing hack4rva@aireadyrva.org",
  aapor: "Illustrative prototype — based on voluntarily submitted stories, not a representative sample of all Richmond residents.",
  submitBtn: "Submit Story",
  submittingBtn: "Submitting…",
  // Success
  thankYouTitle: "Thank You for Sharing",
  thankYouBody: "Your story has been submitted for review. Once approved, it will appear on the Richmond Stories Map.",
  withdrawNote: "You may withdraw your story at any time by emailing hack4rva@aireadyrva.org",
  returnToMap: "Return to Map",
};

const UI_ES: typeof UI_EN = {
  steps: ["Consentimiento", "Su Historia", "Revisión"],
  backToMap: "Volver al Mapa",
  pageTitle: "Cuéntenos Su Historia",
  pageSubtitle: "Comparta su experiencia vivida para ayudar a preservar la historia de Richmond e informar el futuro de la ciudad.",
  // Step 0
  informedConsent: "Consentimiento Informado",
  continueBtn: "Continuar",
  reRecord: "Volver a grabar",
  // Step 1
  yourStory: "Su Historia",
  yourName: "Su Nombre",
  namePlaceholder: "Primer nombre e inicial del apellido",
  stayAnonymous: "Permanecer anónimo",
  neighborhood: "Vecindario",
  theme: "Tema",
  selectOption: "Seleccionar...",
  whereIsStory: "¿Dónde se desarrolla su historia?",
  richmondArea: "Área de Richmond",
  specificAddress: "Dirección Específica",
  pinPlacedAt: (n: string) => `Pin colocado en ${n} en el mapa.`,
  selectNeighborhoodHint: "Seleccione un vecindario — el pin de su historia se colocará en el centro de esa área.",
  addressLabel: "Ingrese una dirección, punto de referencia o intersección en Richmond:",
  addressPlaceholder: "p.ej. 100 N. 2nd St o Hippodrome Theatre",
  findBtn: "Buscar",
  locationFound: "Ubicación encontrada",
  noAddressFallback: (n: string) => `Si no se encuentra la dirección, el pin usará el centro del área de ${n}.`,
  selectNeighborhoodWarning: "Seleccione un vecindario para colocar su historia en el mapa.",
  geocodeNotFound: "Dirección no encontrada. Intente una dirección diferente o use un vecindario.",
  geocodeError: "No se pudo conectar al servicio de geolocalización. Verifique su conexión.",
  storyTitle: "Título de la Historia",
  storyTitlePlaceholder: "Dé un título a su historia",
  yourStoryLabel: "Su Historia",
  typeTab: "Escribir",
  voiceTab: "Voz",
  promptHint: "¿No sabe por dónde empezar? Elija un tema:",
  storyPlaceholder: "Comparta su historia aquí...",
  piiWarning: "Por favor, no incluya nombres completos, direcciones ni datos privados de otras personas en su historia.",
  voiceHint: "Hable su historia — se transcribirá en vivo. Haga clic en Detener cuando termine.",
  startRecording: "Iniciar Grabación",
  stopRecording: (t: string) => `Detener — ${t}`,
  recordingIndicator: "Grabando…",
  voiceRecorded: "Voz grabada",
  listeningIndicator: "Escuchando…",
  editTranscript: "Revise y edite la transcripción si es necesario:",
  attachLabel: "Adjuntar Fotos, Audio o Video",
  attachHint: (n: number) => `(opcional — hasta ${n} archivos, 100 MB cada uno)`,
  dropHint: "Arrastre y suelte archivos aquí, o",
  dropBrowse: "haga clic para explorar",
  dropTypes: "Se aceptan imágenes, archivos de audio y videos",
  maxFilesError: (n: number) => `Máximo ${n} archivos permitidos.`,
  fileSizeError: (name: string) => `"${name}" supera el límite de 100 MB.`,
  fileTypeError: (name: string) => `"${name}" no es un tipo aceptado (imagen, audio o video).`,
  backBtn: "Atrás",
  reviewBtn: "Revisar",
  // Step 2
  reviewTitle: "Revise Su Envío",
  labelName: "Nombre",
  labelNeighborhood: "Vecindario",
  labelMapPin: "Pin en el Mapa",
  labelTheme: "Tema",
  labelStoryType: "Tipo de Historia",
  labelVisibility: "Visibilidad",
  labelTitle: "Título",
  labelStory: "Historia",
  labelFiles: "Archivos Adjuntos",
  anonymous: "Anónimo",
  areaCenter: (n: string) => `Centro del área de ${n}`,
  storyTypeVoice: "Grabación de voz + transcripción",
  storyTypeText: "Texto",
  visibilityPublic: "Público — visible en el Mapa RVA Legacy",
  visibilityPrivate: "Privado — solo personal de la Ciudad",
  consentNote: "Consentimiento verbal grabado. Puede retirar su historia en cualquier momento enviando un correo a hack4rva@aireadyrva.org",
  aapor: "Prototipo ilustrativo — basado en historias enviadas voluntariamente, no es una muestra representativa de todos los residentes de Richmond.",
  submitBtn: "Enviar Historia",
  submittingBtn: "Enviando…",
  // Success
  thankYouTitle: "Gracias por Compartir",
  thankYouBody: "Su historia ha sido enviada para revisión. Una vez aprobada, aparecerá en el Mapa de Historias de Richmond.",
  withdrawNote: "Puede retirar su historia en cualquier momento enviando un correo a hack4rva@aireadyrva.org",
  returnToMap: "Volver al Mapa",
};

/**
 * Guided story prompts (Gap #16 — Shape D acceptance criterion: 3–5 prompt options).
 * Bilingual: clicking a prompt chip pre-fills the story textarea so storytellers
 * have a starting point rather than a blank page.
 */
const GUIDED_PROMPTS_EN = [
  "Tell us about a place in your neighborhood that is gone but you miss.",
  "What was your neighborhood like when you were growing up?",
  "When did you feel Richmond changing around you?",
  "What does your community do that the City doesn't know about?",
  "What do you want future Richmonders to know about where you live?",
];

const GUIDED_PROMPTS_ES = [
  "Cuéntenos sobre un lugar de su vecindario que ya no existe pero que extraña.",
  "¿Cómo era su vecindario cuando usted estaba creciendo?",
  "¿Cuándo sintió que Richmond estaba cambiando a su alrededor?",
  "¿Qué hace su comunidad que la Ciudad no sabe?",
  "¿Qué quiere que los futuros residentes de Richmond sepan sobre el lugar donde vive?",
];

const ACCEPTED = "image/*,audio/*,video/*";
const MAX_FILES = 5;
const MAX_BYTES = 100 * 1024 * 1024;

interface MediaFile {
  file: File;
  preview: string;
  type: "image" | "audio" | "video" | "other";
}

function mediaType(f: File): MediaFile["type"] {
  if (f.type.startsWith("image/")) return "image";
  if (f.type.startsWith("audio/")) return "audio";
  if (f.type.startsWith("video/")) return "video";
  return "other";
}

const playfair = { fontFamily: "'Playfair Display', serif" };

export function SubmitStory({ onBack }: { onBack: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [lang, setLang] = useState<"en" | "es">("en");
  const consent = lang === "en" ? CONSENT_EN : CONSENT_ES;
  const ui = lang === "en" ? UI_EN : UI_ES;
  const guidedPrompts = lang === "en" ? GUIDED_PROMPTS_EN : GUIDED_PROMPTS_ES;

  const [isPlaying, setIsPlaying] = useState(false);
  const [consentRecorded, setConsentRecorded] = useState(false);
  /**
   * Gap #21 — Age gate.
   * COPPA / G2 require confirming the submitter is 18+ (or has parental consent).
   * Blocks progression from Step 0 until checked.
   */
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [isRecordingConsent, setIsRecordingConsent] = useState(false);
  const [consentTime, setConsentTime] = useState(0);
  const [consentError, setConsentError] = useState("");
  const consentBlobRef = useRef<Blob | null>(null);
  const consentTranscriptRef = useRef("");

  const [storyMode, setStoryMode] = useState<"text" | "voice">("text");
  const [isRecordingStory, setIsRecordingStory] = useState(false);
  const [storyBlob, setStoryBlob] = useState<Blob | null>(null);
  const [storyTime, setStoryTime] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Location state
  const [locationMode, setLocationMode] = useState<"neighborhood" | "address">("neighborhood");
  const [addressInput, setAddressInput] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<{ lat: number; lng: number; display: string } | null>(null);
  const [geocodeError, setGeocodeError] = useState("");

  const [form, setForm] = useState({
    name: "", anonymous: false,
    neighborhood: "", theme: "",
    title: "", story: "",
    lat: 0, lng: 0, address: "",
    /**
     * Gap #18 — Visibility preference.
     * Consent text promises stories are shown publicly only with permission.
     * This field captures that choice so the backend can store and honor it.
     * Default: "private" (opt-in to public, not opt-out).
     */
    visibility: "private" as "private" | "public",
  });

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);

  const hasLocation = form.lat !== 0 && form.lng !== 0;
  const canProceedFromStory = !!(
    form.title && form.story && form.neighborhood && form.theme &&
    (form.name || form.anonymous) && hasLocation
  );
  // Age gate must be confirmed before leaving Step 0 (Gap #21)
  const canProceedFromConsent = consentRecorded && ageConfirmed;

  // When neighborhood changes, auto-update lat/lng from the neighborhoods list
  const handleNeighborhoodChange = useCallback((name: string) => {
    const found = neighborhoods.find(n => n.name === name);
    if (found && locationMode === "neighborhood") {
      setForm(f => ({ ...f, neighborhood: name, lat: found.lat, lng: found.lng, address: "" }));
      setGeocodeResult(null);
      setGeocodeError("");
    } else {
      setForm(f => ({ ...f, neighborhood: name }));
    }
  }, [locationMode]);


  // When switching to neighborhood mode, re-resolve from current selection
  const switchToNeighborhoodMode = useCallback(() => {
    setLocationMode("neighborhood");
    setGeocodeResult(null);
    setGeocodeError("");
    const found = neighborhoods.find(n => n.name === form.neighborhood);
    if (found) {
      setForm(f => ({ ...f, lat: found.lat, lng: found.lng, address: "" }));
    } else {
      setForm(f => ({ ...f, lat: 0, lng: 0, address: "" }));
    }
  }, [form.neighborhood]);

  const geocodeAddress = useCallback(async () => {
    const q = addressInput.trim();
    if (!q) return;
    setGeocoding(true);
    setGeocodeError("");
    setGeocodeResult(null);
    try {
      const query = encodeURIComponent(`${q}, Richmond, VA`);
      const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=us`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      if (!data.length) {
        setGeocodeError(ui.geocodeNotFound);
        return;
      }
      const { lat, lon, display_name } = data[0];
      const latN = parseFloat(lat);
      const lngN = parseFloat(lon);
      setGeocodeResult({ lat: latN, lng: lngN, display: display_name });
      setForm(f => ({ ...f, lat: latN, lng: lngN, address: q }));
    } catch {
      setGeocodeError(ui.geocodeError);
    } finally {
      setGeocoding(false);
    }
  }, [addressInput]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
      mediaFiles.forEach(m => URL.revokeObjectURL(m.preview));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    const u = new SpeechSynthesisUtterance(
      consent.text + "\n\n" + consent.promptLabel + "\n" + consent.prompt
    );
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
      consentTranscriptRef.current = "";
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        // Stop the mic stream and timer; blob is built after recognition ends.
        stream.getTracks().forEach(t => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };
      rec.start();
      recorderRef.current = rec;
      setIsRecordingConsent(true);
      setConsentTime(0);
      setConsentError("");
      timerRef.current = setInterval(() => setConsentTime(t => t + 1), 1000);
      window.speechSynthesis?.cancel();
      setIsPlaying(false);

      // Run SpeechRecognition in parallel to capture what the user says.
      // Validation is deferred to recognition.onend so all results are available.
      const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = lang === "en" ? "en-US" : "es-ES";
        recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              consentTranscriptRef.current += event.results[i][0].transcript + " ";
            }
          }
        };
        // onend fires AFTER all onresult callbacks — safe to validate here.
        recognition.onend = () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const transcript = consentTranscriptRef.current.toLowerCase().trim();
          const REJECTION_WORDS = [
            "no", "nope", "i do not", "i don't", "i dont", "i do not consent",
            "refuse", "disagree", "i do not agree", "i don't agree",
            "no acepto", "no estoy de acuerdo", "me niego", "no doy",
          ];
          const AGREEMENT_WORDS = [
            "i agree", "i do agree", "i consent", "i have listened", "i understand",
            "agree", "yes", "acepto", "sí", "si", "de acuerdo", "estoy de acuerdo",
          ];
          const rejected = REJECTION_WORDS.some(w => transcript.includes(w));
          const agreed   = AGREEMENT_WORDS.some(w => transcript.includes(w));

          if (rejected || !agreed) {
            consentBlobRef.current = null;
            setConsentRecorded(false);
            setConsentError(
              lang === "en"
                ? "Consent not detected. Please re-record and clearly say the consent phrase to continue."
                : "No se detectó consentimiento. Por favor vuelva a grabar y diga claramente la frase de consentimiento para continuar."
            );
          } else {
            consentBlobRef.current = blob;
            setConsentRecorded(true);
            setConsentError("");
          }
        };
        recognition.start();
        // Stop recognition when recorder stops; onend fires automatically after.
        recorderRef.current.addEventListener("stop", () => recognition.stop(), { once: true });
      } else {
        // SpeechRecognition unavailable — accept the recording without transcript check.
        recorderRef.current.addEventListener("stop", () => {
          consentBlobRef.current = new Blob(chunksRef.current, { type: "audio/webm" });
          setConsentRecorded(true);
          setConsentError("");
        }, { once: true });
      }
    } catch {
      alert("Microphone access is required to record consent. Please allow microphone access and try again.");
    }
  }, [lang]);

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

  const addFiles = useCallback((incoming: FileList | File[]) => {
    setFileError("");
    const arr = Array.from(incoming);
    const next: MediaFile[] = [];

    for (const f of arr) {
      if (mediaFiles.length + next.length >= MAX_FILES) {
        setFileError(ui.maxFilesError(MAX_FILES));
        break;
      }
      if (f.size > MAX_BYTES) {
        setFileError(ui.fileSizeError(f.name));
        continue;
      }
      const mtype = mediaType(f);
      if (mtype === "other") {
        setFileError(ui.fileTypeError(f.name));
        continue;
      }
      next.push({ file: f, preview: URL.createObjectURL(f), type: mtype });
    }

    if (next.length > 0) setMediaFiles(prev => [...prev, ...next]);
  }, [mediaFiles.length]);

  const removeFile = useCallback((idx: number) => {
    setMediaFiles(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("anonymous", String(form.anonymous));
      fd.append("neighborhood", form.neighborhood);
      fd.append("theme", form.theme);
      fd.append("title", form.title);
      fd.append("story", form.story);
      fd.append("lang", lang);
      fd.append("lat", String(form.lat));
      fd.append("lng", String(form.lng));
      fd.append("address", form.address);
      // Gap #18: pass submitter's public/private choice to backend
      fd.append("visibility", form.visibility);

      if (consentBlobRef.current) {
        fd.append("consent_audio", consentBlobRef.current, "consent.webm");
      }
      if (storyBlob) {
        fd.append("story_audio", storyBlob, "story.webm");
      }
      for (const mf of mediaFiles) {
        fd.append("media_files", mf.file, mf.file.name);
      }

      const res = await fetch("/api/submit", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || "Submission failed");
      }
      setSubmitted(true);
    } catch (e: any) {
      setSubmitError(e.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [form, lang, storyBlob, mediaFiles]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 style={playfair}>{ui.thankYouTitle}</h1>
          <p className="text-gray-600 mt-3 mb-6">{ui.thankYouBody}</p>
          <p className="text-sm text-gray-500 mb-6">{ui.withdrawNote}</p>
          <button type="button" onClick={onBack} className="px-6 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#162d4a] transition-colors">
            {ui.returnToMap}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto p-6">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {ui.backToMap}
        </button>

        <div className="flex items-center justify-between mb-2">
          <h1 style={playfair}>{ui.pageTitle}</h1>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            <button type="button" onClick={() => setLang("en")} className={`px-3 py-1.5 transition-colors ${lang === "en" ? "bg-[#1e3a5f] text-white" : "hover:bg-gray-50"}`}>EN</button>
            <button type="button" onClick={() => setLang("es")} className={`px-3 py-1.5 transition-colors ${lang === "es" ? "bg-[#1e3a5f] text-white" : "hover:bg-gray-50"}`}>ES</button>
          </div>
        </div>
        <p className="text-gray-600 mb-8">{ui.pageSubtitle}</p>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {ui.steps.map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-colors ${i <= currentStep ? "bg-[#1e3a5f] text-white" : "bg-gray-200 text-gray-500"}`}>
                {i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i <= currentStep ? "text-[#1e3a5f]" : "text-gray-400"}`}>{step}</span>
              {i < ui.steps.length - 1 && <div className={`h-0.5 flex-1 ${i < currentStep ? "bg-[#1e3a5f]" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* ── STEP 0: CONSENT ── */}
        {currentStep === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-[#1e3a5f] shrink-0" />
              <h2 style={playfair}>{ui.informedConsent}</h2>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-3">{consent.listenFirst}</p>
              <button
                type="button"
                onClick={playConsent}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isPlaying ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-[#1e3a5f] text-white hover:bg-[#162d4a]"}`}
              >
                {isPlaying
                  ? <><VolumeX className="w-4 h-4" /> {consent.stopPlayBtn}</>
                  : <><Volume2 className="w-4 h-4" /> {consent.playBtn}</>}
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-44 overflow-y-auto text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {consent.text}
            </div>

            <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-amber-800 mb-2 uppercase tracking-wide">{consent.promptLabel}</p>
              <p className="text-sm text-amber-900 italic leading-relaxed">{consent.prompt}</p>
            </div>

            <div className="space-y-3">
              {!consentRecorded ? (
                <div className="flex items-center gap-3 flex-wrap">
                  {!isRecordingConsent ? (
                    <button
                      type="button"
                      onClick={startConsentRec}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <Mic className="w-4 h-4" /> {consent.recordBtn}
                    </button>
                  ) : (
                    <button
                      type="button"
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
                    type="button"
                    onClick={() => { setConsentRecorded(false); consentBlobRef.current = null; setConsentTime(0); setConsentError(""); consentTranscriptRef.current = ""; }}
                    className="ml-auto text-xs text-gray-400 hover:text-gray-600"
                  >
                    {ui.reRecord}
                  </button>
                </div>
              )}
              {consentError && (
                <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{consentError}</p>
                </div>
              )}
            </div>

            {/* Gap #21 — Age gate: COPPA + G2 require confirming 18+ before proceeding */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 accent-[#1e3a5f] shrink-0"
                aria-label="Age confirmation"
              />
              <span className="text-sm text-gray-700">
                {lang === "en"
                  ? "I confirm I am 18 years of age or older, or I have a parent or guardian's permission to submit this story."
                  : "Confirmo que tengo 18 años o más, o cuento con el permiso de un padre o tutor para enviar esta historia."}
              </span>
            </label>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={!canProceedFromConsent}
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-white rounded-lg disabled:opacity-40 hover:bg-[#162d4a] transition-colors"
              >
                {ui.continueBtn} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1: YOUR STORY ── */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
            <h2 style={playfair}>{ui.yourStory}</h2>

            {/* Name */}
            <div>
              <label htmlFor="story-name" className="block text-sm mb-1">{ui.yourName}</label>
              <div className="flex items-center gap-3">
                <input
                  id="story-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, anonymous: false })}
                  disabled={form.anonymous}
                  placeholder={ui.namePlaceholder}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 disabled:opacity-40"
                />
                <label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={form.anonymous}
                    onChange={(e) => setForm({ ...form, anonymous: e.target.checked, name: "" })}
                    className="accent-[#1e3a5f]"
                  />
                  {ui.stayAnonymous}
                </label>
              </div>
            </div>

            {/* Neighborhood + Theme */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="story-neighborhood" className="block text-sm mb-1">{ui.neighborhood}</label>
                <select
                  id="story-neighborhood"
                  title={ui.neighborhood}
                  value={form.neighborhood}
                  onChange={(e) => handleNeighborhoodChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
                >
                  <option value="">{ui.selectOption}</option>
                  {neighborhoods.map((n) => <option key={n.name} value={n.name}>{n.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="story-theme" className="block text-sm mb-1">{ui.theme}</label>
                <select
                  id="story-theme"
                  title={ui.theme}
                  value={form.theme}
                  onChange={(e) => setForm({ ...form, theme: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
                >
                  <option value="">{ui.selectOption}</option>
                  {themes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* ── Map Pin Location ── */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1e3a5f] shrink-0" />
                <span className="text-sm font-medium">{ui.whereIsStory}</span>
              </div>

              {/* Mode toggle */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs w-fit bg-white">
                <button
                  type="button"
                  onClick={switchToNeighborhoodMode}
                  className={`px-4 py-2 transition-colors ${locationMode === "neighborhood" ? "bg-[#1e3a5f] text-white" : "hover:bg-gray-50"}`}
                >
                  {ui.richmondArea}
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode("address")}
                  className={`px-4 py-2 transition-colors ${locationMode === "address" ? "bg-[#1e3a5f] text-white" : "hover:bg-gray-50"}`}
                >
                  {ui.specificAddress}
                </button>
              </div>

              {locationMode === "neighborhood" ? (
                <div>
                  {form.neighborhood && hasLocation ? (
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span dangerouslySetInnerHTML={{ __html: ui.pinPlacedAt(`<strong>${form.neighborhood}</strong>`) }} />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">{ui.selectNeighborhoodHint}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="location-address" className="block text-xs text-gray-500">
                    {ui.addressLabel}
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="location-address"
                      type="text"
                      value={addressInput}
                      onChange={(e) => { setAddressInput(e.target.value); setGeocodeResult(null); setGeocodeError(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); geocodeAddress(); } }}
                      placeholder={ui.addressPlaceholder}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
                    />
                    <button
                      type="button"
                      onClick={geocodeAddress}
                      disabled={!addressInput.trim() || geocoding}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#162d4a] transition-colors text-sm disabled:opacity-40"
                    >
                      {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      {ui.findBtn}
                    </button>
                  </div>

                  {geocodeResult && (
                    <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">{ui.locationFound}</p>
                        <p className="text-xs text-green-600 mt-0.5 leading-snug">{geocodeResult.display}</p>
                      </div>
                    </div>
                  )}

                  {geocodeError && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {geocodeError}
                    </p>
                  )}

                  {!geocodeResult && !geocodeError && form.neighborhood && (
                    <p className="text-xs text-gray-400">{ui.noAddressFallback(form.neighborhood)}</p>
                  )}
                </div>
              )}

              {!hasLocation && form.neighborhood === "" && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {ui.selectNeighborhoodWarning}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="story-title" className="block text-sm mb-1">{ui.storyTitle}</label>
              <input
                id="story-title"
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={ui.storyTitlePlaceholder}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              />
            </div>

            {/* Story — mode toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">{ui.yourStoryLabel}</span>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => { setStoryMode("text"); if (isRecordingStory) stopStoryRec(); }}
                    className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${storyMode === "text" ? "bg-[#1e3a5f] text-white" : "hover:bg-gray-50"}`}
                  >
                    <FileText className="w-3 h-3" /> {ui.typeTab}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoryMode("voice")}
                    className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${storyMode === "voice" ? "bg-[#1e3a5f] text-white" : "hover:bg-gray-50"}`}
                  >
                    <Mic className="w-3 h-3" /> {ui.voiceTab}
                  </button>
                </div>
              </div>

              {storyMode === "text" ? (
                <>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">{ui.promptHint}</p>
                    <div className="flex flex-wrap gap-2">
                      {guidedPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, story: prompt + " " }))}
                          className="text-xs px-3 py-1.5 rounded-full border border-[#1e3a5f]/30 text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-colors bg-white"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    id="story-text"
                    title="Your story"
                    value={form.story}
                    onChange={(e) => setForm({ ...form, story: e.target.value })}
                    rows={6}
                    placeholder={ui.storyPlaceholder}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 resize-none"
                  />
                  {/* Gap #19 — Third-party PII warning (G2 blueprint requirement) */}
                  <p className="text-xs text-gray-400 mt-1.5">{ui.piiWarning}</p>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">{ui.voiceHint}</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      {!isRecordingStory ? (
                        <button
                          type="button"
                          onClick={startStoryRec}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <Mic className="w-4 h-4" /> {ui.startRecording}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopStoryRec}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm"
                        >
                          <Square className="w-3.5 h-3.5 fill-white" /> {ui.stopRecording(fmt(storyTime))}
                        </button>
                      )}
                      {isRecordingStory && (
                        <span className="flex items-center gap-1.5 text-sm text-red-600">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> {ui.recordingIndicator}
                        </span>
                      )}
                      {storyBlob && !isRecordingStory && (
                        <span className="flex items-center gap-1.5 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" /> {ui.voiceRecorded}
                        </span>
                      )}
                    </div>
                    {(isRecordingStory || liveTranscript) && (
                      <div className="border border-gray-200 rounded-lg bg-white p-3 min-h-[72px] text-sm text-gray-700 leading-relaxed">
                        {liveTranscript || <span className="text-gray-400 italic">{ui.listeningIndicator}</span>}
                      </div>
                    )}
                  </div>
                  {form.story && (
                    <div>
                      <label htmlFor="story-transcript" className="text-xs text-gray-500 mb-1 block">{ui.editTranscript}</label>
                      <textarea
                        id="story-transcript"
                        title="Story transcript"
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

            {/* ── Media Upload ── */}
            <div>
              <label htmlFor="media-upload" className="block text-sm mb-1">
                {ui.attachLabel}
                <span className="ml-2 text-xs text-gray-400">{ui.attachHint(MAX_FILES)}</span>
              </label>

              <input
                ref={fileInputRef}
                id="media-upload"
                type="file"
                accept={ACCEPTED}
                multiple
                title="Upload media files"
                className="hidden"
                onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
              />
              <div
                role="button"
                tabIndex={0}
                aria-label="Upload media files — click or drag and drop"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragOver ? "border-[#1e3a5f] bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-gray-50"}`}
              >
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">{ui.dropHint} <span className="text-[#1e3a5f] underline">{ui.dropBrowse}</span></p>
                <p className="text-xs text-gray-400 mt-1">{ui.dropTypes}</p>
              </div>

              {fileError && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {fileError}
                </p>
              )}

              {mediaFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {mediaFiles.map((mf, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-2">
                      {mf.type === "image" && (
                        <img src={mf.preview} alt={mf.file.name} className="w-12 h-12 object-cover rounded-md shrink-0" />
                      )}
                      {mf.type === "audio" && (
                        <div className="w-12 h-12 bg-blue-50 rounded-md flex items-center justify-center shrink-0">
                          <Music className="w-5 h-5 text-blue-500" />
                        </div>
                      )}
                      {mf.type === "video" && (
                        <div className="w-12 h-12 bg-purple-50 rounded-md flex items-center justify-center shrink-0">
                          <Video className="w-5 h-5 text-purple-500" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{mf.file.name}</p>
                        <p className="text-xs text-gray-400">{(mf.file.size / 1024 / 1024).toFixed(1)} MB · {mf.type}</p>
                        {mf.type === "audio" && (
                          <audio src={mf.preview} controls className="mt-1 h-7 w-full" />
                        )}
                        {mf.type === "video" && (
                          <video src={mf.preview} controls className="mt-1 w-full max-h-24 rounded" />
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
                        title={`Remove ${mf.file.name}`}
                        aria-label={`Remove ${mf.file.name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gap #18 — Visibility preference.
                Consent text says stories are public "only if you say it is okay."
                This radio group captures that choice explicitly (default: private). */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-2">
              <p className="text-sm font-medium text-gray-700">
                {lang === "en" ? "Who can see your story?" : "¿Quién puede ver su historia?"}
              </p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="visibility" value="private" checked={form.visibility === "private"} onChange={() => setForm(f => ({ ...f, visibility: "private" }))} className="mt-0.5 accent-[#1e3a5f]" />
                <span className="text-sm text-gray-700">{ui.visibilityPrivate}</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="visibility" value="public" checked={form.visibility === "public"} onChange={() => setForm(f => ({ ...f, visibility: "public" }))} className="mt-0.5 accent-[#1e3a5f]" />
                <span className="text-sm text-gray-700">{ui.visibilityPublic}</span>
              </label>
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => setCurrentStep(0)} className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">{ui.backBtn}</button>
              <button
                type="button"
                disabled={!canProceedFromStory}
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-white rounded-lg disabled:opacity-40 hover:bg-[#162d4a] transition-colors"
              >
                {ui.reviewBtn} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: REVIEW ── */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
            <h2 style={playfair}>{ui.reviewTitle}</h2>

            <div className="space-y-3 text-sm">
              {[
                { label: ui.labelName,       value: form.anonymous ? ui.anonymous : form.name },
                { label: ui.labelNeighborhood, value: form.neighborhood },
                { label: ui.labelMapPin,     value: form.address ? `${form.address} (${form.lat.toFixed(4)}, ${form.lng.toFixed(4)})` : ui.areaCenter(form.neighborhood) },
                { label: ui.labelTheme,      value: form.theme },
                { label: ui.labelStoryType,  value: storyBlob ? ui.storyTypeVoice : ui.storyTypeText },
                { label: ui.labelVisibility, value: form.visibility === "public" ? ui.visibilityPublic : ui.visibilityPrivate },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
              <div className="py-2 border-b border-gray-100">
                <span className="text-gray-500">{ui.labelTitle}</span>
                <p className="mt-1">{form.title}</p>
              </div>
              <div className="py-2 border-b border-gray-100">
                <span className="text-gray-500">{ui.labelStory}</span>
                <p className="mt-1 text-gray-700 leading-relaxed">{form.story}</p>
              </div>
              {mediaFiles.length > 0 && (
                <div className="py-2">
                  <span className="text-gray-500">{ui.labelFiles}</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {mediaFiles.map((mf, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs bg-gray-100 rounded-full px-3 py-1">
                        {mf.type === "image" && <ImageIcon className="w-3 h-3" />}
                        {mf.type === "audio" && <Music className="w-3 h-3" />}
                        {mf.type === "video" && <Video className="w-3 h-3" />}
                        <span className="truncate max-w-[120px]">{mf.file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <p className="text-xs text-green-700">{ui.consentNote}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">{ui.aapor}</p>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700">{submitError}</p>
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                {ui.backBtn}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> {ui.submittingBtn}</>
                  : ui.submitBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
