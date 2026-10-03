import { LanguageCode } from '../types';

export interface VoiceAssistantResponse {
  answerText: string;
  category: 'CROP' | 'SEED' | 'PRICE' | 'WEATHER' | 'FINANCE' | 'EXOTIC' | 'GENERAL';
  actionSuggestion?: string;
  isOffTopic?: boolean;
}

export function answerAgriculturalQuery(
  query: string,
  language: LanguageCode
): VoiceAssistantResponse {
  const q = query.toLowerCase().trim();

  // Non-agricultural check guardrail
  const agriKeywords = [
    'crop', 'plant', 'grow', 'seed', 'soil', 'weather', 'rain', 'price', 'mandi',
    'market', 'tomato', 'onion', 'potato', 'grape', 'fruit', 'vegetable', 'money',
    'profit', 'expense', 'cost', 'fertilizer', 'pesticide', 'dragon', 'strawberry',
    'avocado', 'broccoli', 'lettuce', 'sell', 'store', 'buyer', 'offer', 'water',
    'irrigation', 'kisan', 'kheti', 'sheti', 'bhav', 'dar', 'paus', 'barish', 'khad',
    'biyane', 'beej', 'vikri', 'nafa', 'kharch', 'fasal', 'bikri', 'munafa'
  ];

  const hasAgriMatch = agriKeywords.some(k => q.includes(k));

  if (!hasAgriMatch && q.length > 3) {
    if (language === 'hi') {
      return {
        answerText: 'मैं केवल खेती, फसल, बीज, मौसम, मंडी भाव और कृषि से जुड़े प्रश्नों में मदद कर सकता हूँ।',
        category: 'GENERAL',
        isOffTopic: true
      };
    } else if (language === 'mr') {
      return {
        answerText: 'मी केवळ शेती, पीक, बियाणे, हवामान, बाजारभाव आणि कृषी संबंधित प्रश्नांमध्ये मदत करू शकतो.',
        category: 'GENERAL',
        isOffTopic: true
      };
    } else {
      return {
        answerText: 'I can help with farming, crops, seeds, weather, mandi prices, and agriculture-related questions.',
        category: 'GENERAL',
        isOffTopic: true
      };
    }
  }

  // 1. "What should I plant?" / Crop Selection
  if (q.includes('plant') || q.includes('what should i') || q.includes('पेरावे') || q.includes('बोएं') || q.includes('lagwad') || q.includes('fasal')) {
    if (language === 'hi') {
      return {
        answerText: 'आपकी मिट्टी और आगामी त्योहारी मांग के अनुसार टमाटर (अभिनव / शिवम) और प्याज (भीमा सुपर) की बुवाई सबसे उपयुक्त है। टमाटर में त्वरित नकदी प्रवाह और प्याज में सुरक्षित भंडारण क्षमता मिलती है।',
        category: 'CROP',
        actionSuggestion: 'navPlantAi'
      };
    } else if (language === 'mr') {
      return {
        answerText: 'तुमच्या काळ्या कसदार मातीत आणि आगामी सणासुदीच्या मागणीनुसार टोमॅटो (अभिनव किंवा शिवम) आणि कांदा (भीमा सुपर) ची लागवड सर्वात फायदेशीर ठरेल. टोमॅटोमुळे जलद उत्पन्न मिळते तर कांदा सुरक्षित साठवणूक देतो.',
        category: 'CROP',
        actionSuggestion: 'navPlantAi'
      };
    } else {
      return {
        answerText: 'Based on your recorded soil and current market demand, Hybrid Tomato (Abhinav / Shivam) and Red Onion (Bhima Super) are recommended. Tomato gives rapid cash flow while onion offers dry storage resilience.',
        category: 'CROP',
        actionSuggestion: 'navPlantAi'
      };
    }
  }

  // 2. "Which seed should I use?" / Seeds
  if (q.includes('seed') || q.includes('variety') || q.includes('बी') || q.includes('बियाणे') || q.includes('beej')) {
    if (language === 'hi') {
      return {
        answerText: 'टमाटर के लिए सिंजेंटा अभिनव या सेमीनिस शिवम एफ-1 बीज सबसे अच्छे हैं। प्याज के लिए ICAR का भीमा सुपर बीज अधिक उपज और रोग प्रतिरोधक क्षमता देता है।',
        category: 'SEED',
        actionSuggestion: 'navSeedAi'
      };
    } else if (language === 'mr') {
      return {
        answerText: 'टोमॅटोसाठी सिजेंटा अभिनव किंवा सेमिनीस शिवम एफ-१ हे वाण उत्तम आहे. कांद्यासाठी ICAR चे भीमा सुपर किंवा गरवा कांदा बियाणे अधिक उत्पादन आणि रोगप्रतिकारशक्ती देते.',
        category: 'SEED',
        actionSuggestion: 'navSeedAi'
      };
    } else {
      return {
        answerText: 'For Tomato, Syngenta Abhinav F1 and Seminis Shivam are certified top performers. For Onion, ICAR Bhima Super offers high disease resistance and superior bulb yield.',
        category: 'SEED',
        actionSuggestion: 'navSeedAi'
      };
    }
  }

  // 3. "Will it rain tomorrow?" / Weather
  if (q.includes('rain') || q.includes('weather') || q.includes('हवामान') || q.includes('पाऊस') || q.includes('मौसम') || q.includes('barish') || q.includes('paus')) {
    if (language === 'hi') {
      return {
        answerText: 'नासिक और आसपास के इलाकों में कल मध्यम बारिश की 75% संभावना है। तापमान 29°C रहेगा। खेत की जलनिकासी नालियों को खुला रखें ताकि पानी न जमा हो।',
        category: 'WEATHER',
        actionSuggestion: 'navNews'
      };
    } else if (language === 'mr') {
      return {
        answerText: 'नाशिक व परिसरात उद्या मध्यम पावसाची ७५% शक्यता आहे. तापमान २९°C राहील. शेतात पाणी साचू नये म्हणून पाण्याचा निचरा योग्य राखा.',
        category: 'WEATHER',
        actionSuggestion: 'navNews'
      };
    } else {
      return {
        answerText: 'There is a 75% probability of moderate rainfall tomorrow with temperatures around 29°C. Ensure drainage trenches are clear around vegetable root zones.',
        category: 'WEATHER',
        actionSuggestion: 'navNews'
      };
    }
  }

  // 4. "How much profit did I make?" / Farm Money
  if (q.includes('profit') || q.includes('money') || q.includes('expense') || q.includes('नफा') || q.includes('खर्च') || q.includes('मुनाफा')) {
    if (language === 'hi') {
      return {
        answerText: 'आपके दर्ज रिकॉर्ड के अनुसार: कुल कमाई ₹88,250 और कुल खर्च ₹27,000 है। आपका शुद्ध मुनाफा ₹61,250 है। मुनाफा मार्जिन 69% है।',
        category: 'FINANCE',
        actionSuggestion: 'navFarmMoney'
      };
    } else if (language === 'mr') {
      return {
        answerText: 'तुमच्या शेताच्या नोंदीनुसार: एकूण कमाई ₹८८,२५० आणि एकूण शेती खर्च ₹२७,००० आहे. तुमचा निव्वळ नफा ₹६१,२५० झाला आहे.',
        category: 'FINANCE',
        actionSuggestion: 'navFarmMoney'
      };
    } else {
      return {
        answerText: 'According to your farm records: Total Earnings are ₹88,250 and Total Expenses are ₹27,000. Your current Net Profit is ₹61,250 (69% profit margin).',
        category: 'FINANCE',
        actionSuggestion: 'navFarmMoney'
      };
    }
  }

  // 5. "How can I grow dragon fruit?" / Exotic crops
  if (q.includes('dragon') || q.includes('exotic') || q.includes('strawberry') || q.includes('avocado') || q.includes('ब्रोकोली') || q.includes('ड्रॅगन')) {
    if (language === 'hi') {
      return {
        answerText: 'ड्रैगन फ्रूट के लिए प्रति एकड़ 450 सीमेंट पोल (3x3 मीटर दूरी) की आवश्यकता होती है। प्रत्येक पोल पर 4 पौधे लगाएं। यह कम पानी में उगता है और मंडी में ₹120-₹180 प्रति किलो भाव मिलता है।',
        category: 'EXOTIC',
        actionSuggestion: 'navExoticCrops'
      };
    } else if (language === 'mr') {
      return {
        answerText: 'ड्रॅगन फ्रूटसाठी एकरी ४५० सिमेंट खांब (३x३ मीटर अंतर) लागतात. प्रति खांब ४ रोपे लावावीत. याला अत्यंत कमी पाणी लागते आणि बाजारात ₹१२० ते ₹१८० प्रतिकिलो दर मिळतो.',
        category: 'EXOTIC',
        actionSuggestion: 'navExoticCrops'
      };
    } else {
      return {
        answerText: 'Dragon Fruit is planted around reinforced RCC poles (approx. 450 poles/acre). It requires very low water via drip lines and commands ₹120–₹180/kg wholesale realization.',
        category: 'EXOTIC',
        actionSuggestion: 'navExoticCrops'
      };
    }
  }

  // 6. Market Prices & Sell/Store
  if (q.includes('price') || q.includes('trend') || q.includes('bhav') || q.includes('भाव') || q.includes('sell') || q.includes('store') || q.includes('विक्री')) {
    if (language === 'hi') {
      return {
        answerText: 'आज पिंपलगांव मंडी में टमाटर का मॉडल भाव ₹24.50 प्रति किलो (₹2,450/क्विंटल) है और आवक कम होने से भाव बढ़ रहा है। AI सलाह: 7-10 दिनों के लिए भंडारण करें।',
        category: 'PRICE',
        actionSuggestion: 'navMarketPrice'
      };
    } else if (language === 'mr') {
      return {
        answerText: 'आज पिंपळगाव बाजार समितीत टोमॅटोचा सरासरी भाव ₹२४.५० प्रतिकिलो (₹२,४५०/क्विंटल) असून आवक कमी झाल्याने दर वाढत आहे. AI सल्ला: ७ ते १० दिवस साठवणूक करावी.',
        category: 'PRICE',
        actionSuggestion: 'navMarketPrice'
      };
    } else {
      return {
        answerText: 'Today’s modal rate for Tomato in Pimpalgaon APMC is ₹24.50/kg (₹2,450/quintal) with rising trend due to lower mandi arrivals. AI Advice: STORE for 7–10 days for higher realization.',
        category: 'PRICE',
        actionSuggestion: 'navMarketPrice'
      };
    }
  }

  // Default General Response
  if (language === 'hi') {
    return {
      answerText: 'मैं आपकी खेती, बीज चयन, मौसम, मंडी भाव और फसल बिक्री में मदद के लिए तैयार हूँ। आप कोई भी विशिष्ट सवाल पूछ सकते हैं।',
      category: 'GENERAL'
    };
  } else if (language === 'mr') {
    return {
      answerText: 'मी आपल्या शेती, बियाणे, हवामान, बाजारभाव आणि पीक विक्रीत मदत करण्यास सदैव तयार आहे. कोणताही विशिष्ट प्रश्न विचारा.',
      category: 'GENERAL'
    };
  } else {
    return {
      answerText: 'I am ready to help with crop selection, certified seeds, weather forecasts, APMC mandi rates, and sell/store decisions. How can I assist you?',
      category: 'GENERAL'
    };
  }
}

// Web Speech API Voice Synthesizer
export function speakText(text: string, language: LanguageCode) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  window.speechSynthesis.cancel(); // Stop any ongoing speech
  const utterance = new SpeechSynthesisUtterance(text);
  
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
