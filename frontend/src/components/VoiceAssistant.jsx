import { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, Sparkles, Globe, 
  Trash2, Play, Pause, RefreshCw, Check, ArrowRight, Wand2
} from 'lucide-react';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-IN', name: 'English (India)' },
  { code: 'hi-IN', name: 'Hindi (हिंदी)' },
  { code: 'te-IN', name: 'Telugu (తెలుగు)' },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
  { code: 'es-ES', name: 'Spanish (Español)' },
  { code: 'fr-FR', name: 'French (Français)' },
  { code: 'de-DE', name: 'German (Deutsch)' },
  { code: 'ar-SA', name: 'Arabic (العربية)' },
  { code: 'zh-CN', name: 'Chinese (中文)' },
];

export default function VoiceAssistant({ 
  value, 
  onChange, 
  onAutoSubmit, 
  placeholder = "Speak anything out loud... your words will auto-type here in real-time!" 
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [autoPunctuate, setAutoPunctuate]   = useState(true);
  const [textVal, setTextVal]               = useState(value || '');

  const recognitionRef = useRef(null);
  const textareaRef    = useRef(null);
  const valueRef       = useRef(value || '');
  const isListeningRef = useRef(isListening);

  useEffect(() => {
    setTextVal(value || '');
    valueRef.current = value || '';
  }, [value]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const handleInputChange = (newVal) => {
    setTextVal(newVal);
    onChange(newVal);
    valueRef.current = newVal;
  };

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
    };
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice typing requires Google Chrome, Safari, or Microsoft Edge!');
      return;
    }

    if (isListening) {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      setLiveTranscript('');
      toast.success('Voice typing stopped');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      let sessionBaseText = valueRef.current || '';

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };

      recognition.onresult = (event) => {
        let interimText = '';
        let finalText   = '';

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript + ' ';
          } else {
            interimText += transcript;
          }
        }

        const currentSpoken = (finalText + interimText).trim();
        if (currentSpoken) {
          let formatted = currentSpoken;
          if (autoPunctuate && formatted.length > 0) {
            formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
          }

          const combinedText = sessionBaseText 
            ? `${sessionBaseText.trim()} ${formatted}`
            : formatted;

          setTextVal(combinedText);
          onChange(combinedText);
          setLiveTranscript(formatted);

          if (textareaRef.current) {
            textareaRef.current.value = combinedText;
          }

          // If final phrase completed, update sessionBaseText
          if (finalText.trim()) {
            sessionBaseText = combinedText;
          }

          // Voice Command: "Generate image"
          if (formatted.toLowerCase().includes('generate image') || formatted.toLowerCase().includes('start generating')) {
            if (onAutoSubmit) {
              onAutoSubmit();
              isListeningRef.current = false;
              try { recognition.stop(); } catch (e) {}
              setIsListening(false);
            }
          }
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission blocked. Please allow microphone in browser settings! 🎙️');
          isListeningRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          try { 
            recognition.start(); 
          } catch (e) {
            setIsListening(false);
            setLiveTranscript('');
          }
        } else {
          setIsListening(false);
          setLiveTranscript('');
        }
      };

      recognitionRef.current = recognition;
      toast.success(`🎙️ Voice typing active! Speak now...`);
      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const handleTextToSpeech = () => {
    if (!textVal || !textVal.trim()) {
      toast.error('Please speak or type some text first to read out loud!');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textVal);
    utterance.lang = selectedLang;
    utterance.rate = 0.95; // Clear natural speed for easy listening
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend   = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleClear = () => {
    setTextVal('');
    onChange('');
    if (textareaRef.current) textareaRef.current.value = '';
    setLiveTranscript('');
    toast.success('Text cleared');
  };

  return (
    <div className="space-y-3 font-display">
      {/* HEADER CONTROLS BAR */}
      <div className="flex items-center justify-between flex-wrap gap-2 bg-dark-300/80 p-2.5 rounded-xl border border-white/10 backdrop-blur-md">
        
        {/* Left: Language Selector */}
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-purple-400" />
          <select 
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-dark-400 text-xs text-gray-200 font-semibold px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-purple-500/40 focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Main Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Real-time Voice Typing Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
              isListening
                ? 'bg-red-600 text-white shadow-red-500/40 animate-pulse border border-red-400'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25 hover:scale-105'
            }`}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
            <span>{isListening ? 'Stop Voice Typing' : 'Real-Time Voice Typing 🎙️'}</span>
          </button>

          {/* Voice Over Read Aloud Button */}
          <button
            type="button"
            onClick={handleTextToSpeech}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
            title="Read out loud (Voice Over)"
          >
            {isSpeaking ? <Pause size={14} /> : <Volume2 size={14} />}
            <span>{isSpeaking ? 'Reading...' : 'Voice Over 🔊'}</span>
          </button>

          {/* Clear Button */}
          {textVal && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-white/5 transition-all"
              title="Clear text"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* TEXTAREA INPUT WITH LIVE VOICE DISPLAY */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={textVal}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`input-field resize-none leading-relaxed text-sm md:text-base font-normal tracking-wide transition-all ${
            isListening ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] bg-purple-950/20' : ''
          }`}
        />

        {/* ACTIVE LIVE RECORDING CARD */}
        {isListening && (
          <div className="mt-2 p-3.5 rounded-xl border border-purple-500/40 bg-purple-950/40 backdrop-blur-md flex items-center justify-between animate-fade-in shadow-xl">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-red-500 text-white flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <Mic size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Live Auto-Typing Active</p>
                </div>
                <p className="text-xs text-purple-200 mt-0.5">
                  {liveTranscript ? `"${liveTranscript}"` : 'Speak out loud into your microphone now...'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleListening}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all shadow cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* HELPER TIP FOR NON-FAST TYPERS */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
        <span className="flex items-center gap-1">
          <Sparkles size={12} className="text-purple-400" />
          <span>Don't type fast? Speak naturally in your accent — words auto-type instantly!</span>
        </span>
        <span className="hidden sm:block text-gray-400 font-mono">
          Language: {LANGUAGES.find(l => l.code === selectedLang)?.name}
        </span>
      </div>
    </div>
  );
}
