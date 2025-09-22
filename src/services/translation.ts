import axios from 'axios';

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' }
];

export class TranslationService {
  private static instance: TranslationService;
  private apiKey: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1';

  private constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Groq API key not found. Translation functionality will be disabled.');
    }
  }

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  /**
   * Translate text to the target language using Groq API
   * @param text The text to translate
   * @param targetLanguage The target language code
   * @param sourceLanguage The source language code (default: 'en')
   * @returns Promise that resolves to translated text
   */
  public async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage: string = 'en'
  ): Promise<string> {
    if (!this.apiKey) {
      console.warn('Groq API key not found. Using fallback translation.');
      return this.getFallbackTranslation(text, targetLanguage);
    }

    if (targetLanguage === 'en') {
      return text; // No translation needed for English
    }

    try {
      // Get target language name
      const targetLang = SUPPORTED_LANGUAGES.find(lang => lang.code === targetLanguage);
      if (!targetLang) {
        throw new Error(`Unsupported language: ${targetLanguage}`);
      }

      const prompt = `Translate the following medical question to ${targetLang.name} (${targetLang.nativeName}).
      
      Important instructions:
      1. Translate only the question text, maintaining the medical context and terminology
      2. Keep the translation accurate and natural-sounding
      3. Do not translate any medical terms that should remain in their original form (like specific disease names, medications, etc.)
      4. Maintain the same level of formality and clarity
      5. Return ONLY the translated text, nothing else
      
      Text to translate: "${text}"
      
      Translation:`;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are a professional medical translator. Your task is to translate medical questions accurately while maintaining context and clarity.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const translatedText = response.data.choices[0]?.message?.content?.trim();
      
      if (!translatedText) {
        throw new Error('No translation received from API');
      }

      return translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      // Fallback to simple translation if API fails
      return this.getFallbackTranslation(text, targetLanguage);
    }
  }

  /**
   * Fallback translation method for when API is not available
   */
  private getFallbackTranslation(text: string, targetLanguage: string): string {
    const targetLang = SUPPORTED_LANGUAGES.find(lang => lang.code === targetLanguage);
    if (!targetLang) {
      return text;
    }

    // Simple fallback translations for common medical questions
    const fallbackTranslations: { [key: string]: { [key: string]: string } } = {
      'hi': {
        'How long have you been experiencing these symptoms?': 'आप इन लक्षणों का अनुभव कितने समय से कर रहे हैं?',
        'Have you taken any medication for these symptoms?': 'क्या आपने इन लक्षणों के लिए कोई दवा ली है?',
        'Do you have any allergies to medications?': 'क्या आपको किसी दवा से एलर्जी है?',
        'Have you had similar symptoms in the past?': 'क्या आपको पहले भी ऐसे लक्षण हुए हैं?',
        'Are you currently taking any other medications?': 'क्या आप वर्तमान में कोई अन्य दवाएं ले रहे हैं?'
      },
      'ta': {
        'How long have you been experiencing these symptoms?': 'இந்த அறிகுறிகளை நீங்கள் எவ்வளவு நேரமாக அனுபவித்து வருகிறீர்கள்?',
        'Have you taken any medication for these symptoms?': 'இந்த அறிகுறிகளுக்கு நீங்கள் எந்த மருந்தையும் எடுத்துக்கொண்டீர்களா?',
        'Do you have any allergies to medications?': 'மருந்துகளுக்கு உங்களுக்கு எந்த ஒவ்வாமை உள்ளதா?',
        'Have you had similar symptoms in the past?': 'கடந்த காலத்தில் உங்களுக்கு இதே போன்ற அறிகுறிகள் இருந்தனவா?',
        'Are you currently taking any other medications?': 'நீங்கள் தற்போது வேறு எந்த மருந்துகளையும் எடுத்துக்கொண்டீர்களா?'
      },
      'pa': {
        'How long have you been experiencing these symptoms?': 'ਤੁਸੀਂ ਇਹ ਲੱਛਣਾਂ ਦਾ ਤਜਰਬਾ ਕਿੰਨੇ ਸਮੇਂ ਤੋਂ ਕਰ ਰਹੇ ਹੋ?',
        'Have you taken any medication for these symptoms?': 'ਕੀ ਤੁਸੀਂ ਇਹਨਾਂ ਲੱਛਣਾਂ ਲਈ ਕੋਈ ਦਵਾਈ ਲਈ ਹੈ?',
        'Do you have any allergies to medications?': 'ਕੀ ਤੁਹਾਨੂੰ ਕਿਸੇ ਦਵਾਈ ਨਾਲ ਐਲਰਜੀ ਹੈ?',
        'Have you had similar symptoms in the past?': 'ਕੀ ਤੁਹਾਨੂੰ ਪਹਿਲਾਂ ਵੀ ਇਹੋ ਜਿਹੇ ਲੱਛਣ ਹੋਏ ਹਨ?',
        'Are you currently taking any other medications?': 'ਕੀ ਤੁਸੀਂ ਵਰਤਮਾਨ ਵਿੱਚ ਕੋਈ ਹੋਰ ਦਵਾਈਆਂ ਲੈ ਰਹੇ ਹੋ?'
      }
    };

    // Return fallback translation if available, otherwise return original text
    return fallbackTranslations[targetLanguage]?.[text] || text;
  }

  /**
   * Get language by code
   * @param code The language code
   * @returns The language object or undefined
   */
  public getLanguageByCode(code: string): SupportedLanguage | undefined {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  }

  /**
   * Get all supported languages
   * @returns Array of supported languages
   */
  public getSupportedLanguages(): SupportedLanguage[] {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Detect language from text (basic implementation)
   * @param text The text to analyze
   * @returns Promise that resolves to detected language code
   */
  public async detectLanguage(text: string): Promise<string> {
    // This is a simplified implementation
    // In a production environment, you might want to use a more sophisticated language detection service
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a language detection expert. Identify the language of the given text and respond with only the language code (e.g., "en", "es", "fr", etc.).'
            },
            {
              role: 'user',
              content: `What language is this text written in? Respond with only the language code: "${text.substring(0, 100)}"`
            }
          ],
          max_tokens: 10,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const detectedCode = response.data.choices[0]?.message?.content?.trim().toLowerCase();
      
      // Validate that the detected code is in our supported languages
      const supportedCode = SUPPORTED_LANGUAGES.find(lang => lang.code === detectedCode);
      return supportedCode ? detectedCode : 'en'; // Default to English if not supported
    } catch (error) {
      console.error('Language detection failed:', error);
      return 'en'; // Default to English on error
    }
  }
}
