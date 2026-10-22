import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Volume2, 
  ArrowRight, 
  Mic, 
  HelpCircle,
  CheckCircle2,
  Key,
  ShieldCheck,
  ExternalLink,
  Settings,
  X,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n/translations';
import { answerAgriculturalQueryAsync, speakText } from '../services/voiceAssistantService';
import { AiChatService, ApiKeyConfig } from '../services/aiChatService';

interface AskFarmAiViewProps {
  language: LanguageCode;
  onNavigateToTab?: (tab: string) => void;
  onOpenVoiceModal?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  actionTab?: string;
  providerUsed?: string;
}

export const AskFarmAiView: React.FC<AskFarmAiViewProps> = ({
  language,
  onNavigateToTab,
  onOpenVoiceModal
}) => {
  const t = translations[language];
  const aiService = AiChatService.getInstance();

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // API Key State & Modal
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [keyConfig, setKeyConfig] = useState<ApiKeyConfig>(() => aiService.getApiKeyConfig());
  const [keySaveSuccess, setKeySaveSuccess] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: language === 'hi' 
        ? 'नमस्ते किसान साथी! मैं आपका 24/7 कृषि AI सहायक हूँ। आप फसल रोग, खाद, बीज, मौसम, मंडी भाव या निर्यात के बारे में कोई भी सवाल पूछ सकते हैं।'
        : language === 'mr'
        ? 'रामराम शेतकरी मित्र! मी आपला २४/७ कृषी AI सहाय्यक आहे. कांदा करपा, खत व्यवस्थापन, बियाणे, बाजारभाव किंवा UAE निर्यातीबद्दल कोणताही प्रश्न विचारा.'
        : 'Welcome! I am your 24/7 AI Farm Assistant. Ask me anything about crop diseases, pest spray dosages, drip fertigation, mandi prices, or UAE export specs.',
      time: 'Just now',
      providerUsed: aiService.hasActiveKey() ? 'live_gemini' : 'expert_agronomist_engine'
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    language === 'mr' ? 'कांद्यावरील जांभळा करपा रोगावर काय फवारणी करावी?' : language === 'hi' ? 'प्याज के बैंगनी धब्बा रोग पर क्या स्प्रे करें?' : 'What spray to use for onion purple blotch?',
    language === 'mr' ? 'ठिबक सिंचनातून १९:१९:१९ व ००:५२:३४ खत कधी द्यावे?' : language === 'hi' ? 'ड्रिप से 19:19:19 और 00:52:34 खाद कब दें?' : 'When to apply 19:19:19 & 00:52:34 fertigation?',
    language === 'mr' ? 'दुबई/UAE साठी कांद्याचा कोणता साईझ आणि पॅकिंग लागते?' : language === 'hi' ? 'दुबई/UAE निर्यात के लिए प्याज का क्या साइज चाहिए?' : 'What is the required onion grade & size for UAE export?',
    language === 'mr' ? 'टोमॅटो फळ पोखरणाऱ्या अळीवर जैविक उपाय काय?' : language === 'hi' ? 'टमाटर फल छेदक इल्ली का जैविक नियंत्रण क्या है?' : 'Organic control for tomato fruit borer caterpillar?',
    language === 'mr' ? 'मिरचीतील चुरडा-मुरडा (थ्रिप्स) रोखण्यासाठी काय करावे?' : language === 'hi' ? 'मिर्च में थ्रिप्स व पत्ता मरोड़ पर क्या करें?' : 'Best chemical & organic spray for chilli thrips?'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ sender: m.sender, text: m.text }));
      const aiRes = await answerAgriculturalQueryAsync(query, language, history);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiRes.answerText,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        actionTab: aiRes.actionSuggestion,
        providerUsed: aiRes.providerUsed
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'Unable to connect to AI server. Please verify your internet connection or check your API key.',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    aiService.setApiKey(apiKeyInput.trim());
    const updated = aiService.getApiKeyConfig();
    setKeyConfig(updated);
    setKeySaveSuccess(updated.apiKey ? 'API Key saved successfully! Real-time AI answers activated.' : 'Custom API Key removed. Reverted to offline agronomist engine.');
    setTimeout(() => {
      setKeySaveSuccess('');
      setShowKeyModal(false);
    }, 1500);
  };

  const handleSpeechToggle = (msg: ChatMessage) => {
    if (speakingMessageId === msg.id) {
      window.speechSynthesis?.cancel();
      setSpeakingMessageId(null);
    } else {
      speakText(msg.text, language);
      setSpeakingMessageId(msg.id);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans text-slate-900 dark:text-slate-100">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-[#064e3b] text-white p-6 sm:p-8 shadow-xl border border-emerald-600/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span>Real-Time Farm Agronomist AI • कृषी शास्त्रज्ञ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-white">
              {language === 'mr' ? 'कृषिमार्केट AI सहाय्यक' : language === 'hi' ? 'कृषिमार्केट AI सहायक' : 'Ask Farm AI Assistant'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              {language === 'mr'
                ? 'रोग-कीड नियंत्रण, खतांचे डोस, बियाणे, बाजारभाव व जागतिक निर्यातीबद्दल कोणताही प्रश्न विचारा.'
                : language === 'hi'
                ? 'फसल रोग, कीटनाशक, खाद, मौसम, मंडी भाव व निर्यात के बारे में कोई भी प्रश्न बेझिझक पूछें।'
                : 'Ask any question about crop health, chemical/organic spray dosages, fertilizer schedules, mandi rates, and export lots.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live API Key Status Button */}
            <button
              onClick={() => {
                setApiKeyInput(keyConfig.apiKey);
                setShowKeyModal(true);
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border shadow-sm transition-all ${
                keyConfig.apiKey
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 hover:bg-emerald-900'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 font-black'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>{keyConfig.apiKey ? 'Real AI Key: Connected' : 'Connect Real Gemini Key'}</span>
            </button>

            {onOpenVoiceModal && (
              <button
                onClick={onOpenVoiceModal}
                className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/30 flex items-center gap-2 backdrop-blur-sm transition-all"
              >
                <Mic className="w-4 h-4 text-amber-300" />
                <span>Voice Mode</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Provider Status Strip */}
        <div className="mt-4 pt-3 border-t border-emerald-600/40 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${keyConfig.apiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>
              Engine: <strong>{keyConfig.apiKey ? (keyConfig.provider === 'gemini' ? 'Google Gemini 1.5 Flash (Live Unlimited)' : 'OpenAI Live') : 'Indian Agronomist Expert Engine (Offline Mode)'}</strong>
            </span>
          </div>
          <span className="text-[11px] text-emerald-300/80 hidden sm:inline">
            ICAR / KVK / MPKV Rahuri Verified Agronomy Rules
          </span>
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[580px] overflow-hidden">
        
        {/* Chat History */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-2 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
              }`}>
                <div className="text-xs sm:text-sm whitespace-pre-line leading-relaxed font-normal">
                  {msg.text}
                </div>

                <div className={`flex items-center justify-between text-[10px] pt-1 border-t ${
                  msg.sender === 'user' 
                    ? 'border-emerald-500/40 text-emerald-100' 
                    : 'border-slate-100 dark:border-slate-700 text-slate-400'
                }`}>
                  <span className="font-mono">{msg.time}</span>

                  {msg.sender === 'ai' && (
                    <div className="flex items-center gap-3">
                      {msg.providerUsed === 'live_gemini' && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                          ★ Live Gemini
                        </span>
                      )}

                      <button
                        onClick={() => handleSpeechToggle(msg)}
                        className={`hover:text-emerald-600 flex items-center gap-1 font-bold ${
                          speakingMessageId === msg.id ? 'text-amber-500 animate-pulse' : ''
                        }`}
                        title="Read out loud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{speakingMessageId === msg.id ? 'Stop' : 'Listen'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Direct Action Navigation Pill */}
                {msg.actionTab && onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab(msg.actionTab!)}
                    className="mt-2 w-full py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between hover:bg-emerald-100 transition-colors"
                  >
                    <span>View related platform module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-xs text-slate-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                <span>Consulting Indian Agronomy Intelligence...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Suggested:
            </span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="py-1 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs whitespace-nowrap border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Text Box */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                language === 'mr'
                  ? 'उदा. कांदा करपा नियंत्रण, १९:१९:१९ खतांचा डोस, किंवा आजचे भाव...'
                  : language === 'hi'
                  ? 'उदा. प्याज का बैंगनी धब्बा रोग, खाद का डोस, या आज के मंडी भाव...'
                  : 'Ask any question (crop disease, fertilizer dosage, onion export specs, prices)...'
              }
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-md shadow-emerald-600/30 transition-all shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* CONNECT REAL AI KEY MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-heading">
                <Key className="w-5 h-5 text-emerald-600" />
                <span>Connect Real AI API Key</span>
              </h3>
              <button 
                onClick={() => setShowKeyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Connect a <strong>Google Gemini API Key</strong> (or OpenAI key) to unlock 100% real-time answers for ANY agricultural question in Marathi, Hindi, and English.
              </p>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Free Google Gemini API Key:</span>
                </div>
                <div>
                  You can get a free, permanent Gemini API key in 10 seconds from Google AI Studio:
                </div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1 pt-1"
                >
                  <span>Open Google AI Studio (Get Free Key)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Paste API Key (Gemini: AIzaSy... or OpenAI: sk-...)
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {keySaveSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{keySaveSuccess}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setApiKeyInput('');
                  handleSaveApiKey();
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors"
              >
                Clear Key (Use Offline)
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-colors"
              >
                Save & Activate Key
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
