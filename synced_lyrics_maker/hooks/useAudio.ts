import { useState, useRef, useEffect, useCallback } from 'react';
import { AudioState } from '@/types';

/**
 * Custom hook for managing audio playback
 * Handles loading, playing, pausing, and seeking audio files
 * Returns current time, duration, and playback state
 */

export function useAudio() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [state, setState] = useState<AudioState>({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isLoaded: false,
    });
    const [error, setError] = useState<string | null>(null);
  
    // Load audio file
    const loadAudio = useCallback((file: File) => {
        const url = URL.createObjectURL(file);
        if (audioRef.current) {
            audioRef.current.src = url;
            setError(null);
        }
    }, []);

    // Play audio
    const play = useCallback(() => {
       if(audioRef.current && state.isLoaded) {
            audioRef.current.play();
            setState(prev => ({ ...prev, isPlaying: true }));
       }
    }, [state.isLoaded]);

    // Pause audio
    const pause = useCallback(() => {
        if(audioRef.current) {
            audioRef.current.pause();
            setState(prev => ({ ...prev, isPlaying: false }));
        }
    }, []);

    // Play/Pause toggle
    const togglePlay = useCallback(() => {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          this.play();
        } else {
          this.pause();
        }
      }
    }, [play, pause]);
  
    // Get exact timestamp for syncing (critical for syncing!)
    const getCurrentTimestamp = useCallback( () => {
      return audioRef.current?.currentTime ?? 0;
    }, []);
  
    // Seek (progress bar)
    const seek = useCallback( (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
    }, []);
  
    // Setup event listeners
    useEffect( () => {
        const audio = audioRef.current;
        if(!audio) return;

        const handleLoadedMetadata = () => {
            setState(prev => ({
                ...prev,
                duration: audio.duration,
                isLoaded: true,
            }));
        };

        const handleTimeUpdate = () => {
            setState(prev => ({
                ...prev,
                currentTime: audio.currentTime,
            }));
        };

        const handleEnded = () => {
            setState( prev => ({
                ...prev,
                isPlaying: false,
                currentTime: 0,
            }));
        };

        const handleError = () => {
            setError('Impossible de lire le fichier audio');
            setState(prev => ({
                ...prev,
                isLoaded: false,
                isPlaying: false,
            }));
        };

        // Attach event listeners
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        //Cleanup
        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, []);

    return {
        audioRef,
        ...state,
        error,
        loadAudio,
        play,
        pause,
        togglePlay,
        getCurrentTimestamp,
        seek,
    };
}