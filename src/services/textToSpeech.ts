import axios from 'axios';

interface TextToSpeechOptions {
  voice?: string;
  responseFormat?: 'wav' | 'mp3';
  speed?: number;
}

export class TextToSpeechService {
  private static instance: TextToSpeechService;
  private apiKey: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1';

  private constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Groq API key not found. Text-to-speech functionality will be disabled.');
    }
  }

  public static getInstance(): TextToSpeechService {
    if (!TextToSpeechService.instance) {
      TextToSpeechService.instance = new TextToSpeechService();
    }
    return TextToSpeechService.instance;
  }

  /**
   * Convert text to speech using Groq's playai-tts model
   * @param text The text to convert to speech
   * @param options Additional options for voice and format
   * @returns Promise that resolves to audio blob URL
   */
  public async synthesizeSpeech(
    text: string, 
    options: TextToSpeechOptions = {}
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured');
    }

    const defaultOptions: TextToSpeechOptions = {
      voice: 'Aaliyah-PlayAI',
      responseFormat: 'wav',
      speed: 1.0,
      ...options
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/audio/speech`,
        {
          model: 'playai-tts',
          voice: defaultOptions.voice,
          response_format: defaultOptions.responseFormat,
          input: text,
          speed: defaultOptions.speed
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );

      // Create blob URL from the audio response
      const audioBlob = new Blob([response.data], { 
        type: `audio/${defaultOptions.responseFormat}` 
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return audioUrl;
    } catch (error) {
      console.error('Text-to-speech synthesis failed:', error);
      throw new Error('Failed to synthesize speech');
    }
  }

  /**
   * Play audio directly from text
   * @param text The text to speak
   * @param options Additional options
   * @returns Promise that resolves when audio finishes playing
   */
  public async speakText(
    text: string, 
    options: TextToSpeechOptions = {}
  ): Promise<void> {
    try {
      const audioUrl = await this.synthesizeSpeech(text, options);
      
      return new Promise((resolve, reject) => {
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };
        
        audio.play().catch(reject);
      });
    } catch (error) {
      console.error('Failed to speak text:', error);
      throw error;
    }
  }

  /**
   * Get available voices for playai-tts
   * @returns Array of available voice names
   */
  public getAvailableVoices(): string[] {
    return [
      'Aaliyah-PlayAI',
      'Christopher-PlayAI',
      'Evelyn-PlayAI',
      'Fin-PlayAI',
      'Jason-PlayAI',
      'Jessica-PlayAI',
      'Laura-PlayAI',
      'Liam-PlayAI',
      'Matilda-PlayAI',
      'Roger-PlayAI'
    ];
  }

  /**
   * Clean up any created blob URLs
   * @param audioUrl The blob URL to revoke
   */
  public cleanupAudioUrl(audioUrl: string): void {
    URL.revokeObjectURL(audioUrl);
  }
}
