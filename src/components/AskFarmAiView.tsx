import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Volume2, 
  ArrowRight, 
  Mic, 
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n/translations';
import { answerAgriculturalQuery, speakText } from '../services/voiceAssistantService';

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
}

export const AskFarmAiView: React.FC<AskFarmAiViewProps> = ({
  language,
  onNavigateToTab,
  onOpenVoiceModal
}) => {
  const t = translations[language];

  const [inputQuery, setInputQuery] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: language === 'hi' 
        ? 'नमस्ते किसान साथी! मैं आपका 24/7 कृषि AI सहायक हूँ। आप फसल, बीज, मंडी भाव, खाद या मौसम के बारे में कोई भी सवाल पूछ सकते हैं।'
        : language === 'mr'
        ? 'रामराम शेतकरी मित्र! मी आपला २४/७ कृषी AI सहाय्यक आहे. पीक, बियाणे, बाजारभाव, खते किंवा हवामानाबद्दल कोणताही प्रश्न विचारा.'
        : 'Welcome! I am your 24/7 AI Farm Assistant. Ask me anything about crop selection, seeds, mandi rates, storage timing, or farm money.',
      time: 'Just now'
    }
  ]);

  const quickPrompts = [
    t.voiceExample1,
    t.voiceExample2,
    t.voiceExample3,
    t.voiceExample4,
    t.voiceExample5,
    t.voiceExample6
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    const aiRes = answerAgriculturalQuery(query, language);
    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: aiRes.answerText,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      actionTab: aiRes.actionSuggestion
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInputQuery('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 text-white shadow-xl shadow-emerald-700/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold font-mono">
              <Bot className="w-3.5 h-3.5 text-amber-300" />
              <span>ASK FARM AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading">
              {t.askAiTitle}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium">
              {t.askAiSubtitle}
            </p>
          </div>

          {onOpenVoiceModal && (
            <button
              onClick={onOpenVoiceModal}
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-400/20 flex items-center gap-2 self-start md:self-auto"
            >
              <Mic className="w-4 h-4" />
              <span>Open Voice Mic</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="farmer-card flex flex-col h-[540px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
        
        {/* Chat History */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm shrink-0 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-bold'
              }`}>
                {msg.sender === 'user' ? '👨‍🌾' : '🤖'}
              </div>

              <div className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-600/10'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm'
              }`}>
                <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-400">
                  <span>{msg.time}</span>
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => speakText(msg.text, language)}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Listen</span>
                    </button>
                  )}
                </div>

                {msg.actionTab && onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab(msg.actionTab!)}
                    className="mt-2.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-200 transition-colors"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-2.5 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0 px-2">
            Quick Questions:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Text Input Area */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
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
              placeholder={t.askAiInputPlaceholder}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="submit"
              className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
