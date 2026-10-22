import { LanguageCode } from '../types';
import { AiChatService } from './aiChatService';

export interface VoiceAssistantResponse {
  answerText: string;
  category: 'CROP' | 'SEED' | 'PRICE' | 'WEATHER' | 'FINANCE' | 'EXOTIC' | 'GENERAL';
  actionSuggestion?: string;
  isOffTopic?: boolean;
  providerUsed?: 'live_gemini' | 'live_openai' | 'live_claude' | 'expert_agronomist_engine';
}

/**
 * Asynchronous AI query solver: Uses real Google Gemini / OpenAI API if configured,
 * or deep agronomist intelligence to answer ANY agricultural question.
 */
export async function answerAgriculturalQueryAsync(
  query: string,
  language: LanguageCode,
  history: { sender: 'user' | 'ai'; text: string }[] = []
): Promise<VoiceAssistantResponse> {
  const aiService = AiChatService.getInstance();
  const res = await aiService.askQuestion(query, language, history);

  // Determine category
  const qLower = query.toLowerCase();
  let category: VoiceAssistantResponse['category'] = 'GENERAL';
  if (qLower.includes('seed') || qLower.includes('बी') || qLower.includes('बियाणे')) category = 'SEED';
  else if (qLower.includes('price') || qLower.includes('rate') || qLower.includes('भाव') || qLower.includes('mandi')) category = 'PRICE';
  else if (qLower.includes('rain') || qLower.includes('weather') || qLower.includes('पाऊस') || qLower.includes('मौसम')) category = 'WEATHER';
  else if (qLower.includes('profit') || qLower.includes('money') || qLower.includes('खर्च') || qLower.includes('नफा')) category = 'FINANCE';
  else if (qLower.includes('plant') || qLower.includes('crop') || qLower.includes('रोग') || qLower.includes('करपा') || qLower.includes('खत')) category = 'CROP';

  return {
    answerText: res.answerText,
    category,
    actionSuggestion: res.actionSuggestion,
    providerUsed: res.providerUsed
  };
}

/**
 * Synchronous fallback compatible with legacy callers.
 */
export function answerAgriculturalQuery(
  query: string,
  language: LanguageCode
): VoiceAssistantResponse {
  const aiService = AiChatService.getInstance();
  const res = aiService.getDeepAgronomistAnswer(query, language);
  return {
    answerText: res.answerText,
    category: 'GENERAL',
    actionSuggestion: res.actionSuggestion,
    providerUsed: 'expert_agronomist_engine'
  };
}

// Web Speech API Voice Synthesizer
export function speakText(text: string, language: LanguageCode) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Strip markdown formatting before speaking
  const cleanText = text
    .replace(/[*_#`~]/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/⚠️.*?\n\n/g, '')
    .trim();

  window.speechSynthesis.cancel(); // Stop any ongoing speech
  const utterance = new SpeechSynthesisUtterance(cleanText);
  
  if (language === 'hi') {
    utterance.lang = 'hi-IN';
  } else if (language === 'mr') {
    utterance.lang = 'mr-IN';
  } else {
    utterance.lang = 'en-IN';
  }
  
  utterance.rate = 0.95; // Slightly slower for clarity
  utterance.pitch = 1.0;
  
  window.speechSynthesis.speak(utterance);
}
