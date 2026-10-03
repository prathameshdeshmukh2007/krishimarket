import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  X, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw,
  MessageSquare,
  Bot
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n/translations';
import { answerAgriculturalQuery, speakText } from '../services/voiceAssistantService';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  onNavigateToTab?: (tab: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
  onNavigateToTab
}) => {
  const t = translations[language];

  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [actionTab, setActionTab] = useState<string | undefined>(undefined);
  const [isOffTopic, setIsOffTopic] = useState<boolean>(false);

  const sampleQuestions = [
    t.voiceExample1,
    t.voiceExample2,
    t.voiceExample3,
    t.voiceExample4,
    t.voiceExample5,
    t.voiceExample6
  ];

  useEffect(() => {
    if (!isOpen) {
      setTranscript('');
      setAiResponse('');
      setIsListening(false);
      window.speechSynthesis?.cancel();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAskQuery = (queryText: string) => {
    setTranscript(queryText);
    setIsListening(false);

    const result = answerAgriculturalQuery(queryText, language);
    setAiResponse(result.answerText);
    setActionTab(result.actionSuggestion);
    setIsOffTopic(!!result.isOffTopic);

    // Speak AI response in chosen language
    speakText(result.answerText, language);
  };

  const handleToggleListening = () => {
    // If Web Speech API is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Browser doesn't support Web Speech API, use standard prompt fallback
      setIsListening(true);
      setTimeout(() => {
        handleAskQuery(sampleQuestions[0]);
      }, 1500);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setTranscript(t.voiceListening);

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        handleAskQuery(spoken);
      };

      recognition.onerror = () => {
        setIsListening(false);
        handleAskQuery(sampleQuestions[0]);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed', e);
      setIsListening(false);
      handleAskQuery(sampleQuestions[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
              🎙️
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading">
                {t.voiceAssistantTitle}
              </h2>
              <p className="text-xs text-slate-900 font-medium">
                English • हिन्दी • मराठी Multi-lingual AI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/10 text-slate-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-center max-h-[80vh] overflow-y-auto">
          
          {/* Main Microphone Button */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <button
              onClick={handleToggleListening}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${
                isListening
                  ? 'bg-rose-500 scale-110 ring-8 ring-rose-500/30 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-105 shadow-emerald-500/30'
              }`}
            >
              {isListening ? (
                <MicOff className="w-10 h-10 animate-spin" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>

            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-heading">
              {isListening ? t.voiceListening : t.voiceTapToSpeak}
            </span>
          </div>

          {/* User Spoken Query */}
          {transcript && (
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 text-left border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">
                Farmer Question:
              </span>
              "{transcript}"
            </div>
          )}

          {/* AI Response Card */}
          {aiResponse && (
            <div className={`p-5 rounded-2xl text-left space-y-3 ${
              isOffTopic 
                ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider font-heading">
                    AI Voice Answer:
                  </span>
                </div>

                <button
                  onClick={() => speakText(aiResponse, language)}
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px] font-bold"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Replay Voice</span>
                </button>
              </div>

              <p className="text-sm font-medium leading-relaxed">
                {aiResponse}
              </p>

              {actionTab && onNavigateToTab && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToTab(actionTab);
                  }}
                  className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                >
                  <span>Open Related Section</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Quick Tap Suggested Questions */}
          <div className="space-y-2.5 text-left pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-heading">
              {t.commonQuestionsHeading}
            </span>

            <div className="grid grid-cols-1 gap-2">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAskQuery(q)}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 text-left transition-colors flex items-center justify-between"
                >
                  <span>"{q}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
