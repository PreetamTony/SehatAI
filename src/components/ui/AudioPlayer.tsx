import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { TextToSpeechService } from '../../services/textToSpeech';

interface AudioPlayerProps {
  text: string;
  autoPlay?: boolean;
  className?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  text,
  autoPlay = false,
  className = '',
  onPlayStart,
  onPlayEnd
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsService = TextToSpeechService.getInstance();

  useEffect(() => {
    // Cleanup audio URL when component unmounts
    return () => {
      if (audioUrl) {
        ttsService.cleanupAudioUrl(audioUrl);
      }
    };
  }, [audioUrl, ttsService]);

  useEffect(() => {
    if (autoPlay && text && !isPlaying && !isLoading) {
      handlePlay();
    }
  }, [autoPlay, text, isPlaying, isLoading]);

  const generateAudio = async (): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = await ttsService.synthesizeSpeech(text, { voice: 'Aaliyah-PlayAI' });
      setAudioUrl(url);
      return url;
    } catch (err) {
      setError('Failed to generate audio. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = async () => {
    try {
      if (!audioUrl) {
        await generateAudio();
      }

      if (audioUrl && !audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.muted = isMuted;
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
          onPlayEnd?.();
        };
        
        audioRef.current.onerror = () => {
          setError('Audio playback failed');
          setIsPlaying(false);
        };
      }

      if (audioRef.current) {
        audioRef.current.muted = isMuted;
        await audioRef.current.play();
        setIsPlaying(true);
        onPlayStart?.();
      }
    } catch (err) {
      console.error('Failed to play audio:', err);
      setError('Failed to play audio');
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const handleRetry = () => {
    setAudioUrl(null);
    setError(null);
    if (audioRef.current) {
      audioRef.current = null;
    }
  };

  if (error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          Retry
        </button>
        <span className="text-red-600 text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={isPlaying ? handlePause : handlePlay}
        disabled={isLoading}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          isLoading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : isPlaying
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
      </button>

      <button
        onClick={handleToggleMute}
        className={`p-2 rounded-lg transition-colors ${
          isMuted
            ? 'bg-gray-100 text-gray-500'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
};
