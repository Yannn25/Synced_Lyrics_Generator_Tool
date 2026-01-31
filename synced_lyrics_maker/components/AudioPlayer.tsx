'use client'

import React, {useRef} from "react";
import { useAudio } from "@/hooks/useAudio";
import { formatTime } from "@/utils/formatTime";

interface AudioPlayerProps {
  audio: ReturnType<typeof useAudio>;
  onSyncLine: () => void;
  canSync: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audio, onSyncLine, canSync}) => {
  const {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    isLoaded,
    error,
    loadAudio,
    togglePlay,
    seek,
  } = audio;

  const fileInputRef = useRef< HTMLInputElement | null >(null);

  // Handling audio File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadAudio(file);
    }
  };

  // Handling progress bar
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  // Calculation of the percentage of the progress bar
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="card">
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      <div className="card-header">
        <div>
          <h2 className="card-title">Audio</h2>
          <p className="card-subtitle">Charge un fichier puis contrôle la lecture.</p>
        </div>
      </div>

      <div className="card-body flex flex-col gap-5">

        {/* Upload audio file  */}
        <div className="flex flex-col gap-2">
          <label htmlFor="audio-file" className="text-sm font-semibold text-foreground">
             Fichier audio
          </label>
          <input
              ref={fileInputRef}
              id="audio-file"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="input file:mr-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-primary-darkest file:to-primary-dark file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:from-primary-dark hover:file:to-primary file:shadow-md file:transition-all file:cursor-pointer"
          />
        </div>

        {/* Error message */}
        {error && (
            <div className="rounded-lg bg-red-500/15 border border-red-500/40 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
        )}

        {/* Message if audio file is not loaded */}
        {!isLoaded && !error && (
            <div className="rounded-xl bg-slate-700/20 border border-white/5 px-4 py-8 text-center">
              <p className="text-sm text-slate-400">Charger un fichier audio pour commencer</p>
            </div>
        )}

        {/* Audio controls - Shown if audio is loaded */}
        { isLoaded && (
            <>
              {/* Progress bar avec timestamp */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm font-mono">
                  <span className="text-primary-dark font-bold">{formatTime(currentTime)}</span>
                  <span className="text-slate-500">{formatTime(duration)}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max={ duration || 100 }
                    step="0.01"
                    value={ currentTime }
                    onChange={handleSeek}
                    className="progress-bar"
                    style={{
                      background: `linear-gradient(to right, #0ea5e9 0%, #38bdf8 ${progressPercentage}%, rgba(51, 65, 85, 0.6) ${progressPercentage}%)`
                    }}
                />
              </div>

              {/* Contrôles de lecture */}
              <div className="flex items-center justify-center gap-3">
                <button
                    onClick={() => seek(Math.max(0, currentTime - 5))}
                    className="btn-ghost px-3 py-2 text-sm"
                    title="Reculer de 5s"
                >
                  -5s
                </button>
                <button
                    onClick={ togglePlay }
                    className="btn-primary px-6 py-3"
                >
                  {isPlaying ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                        Pause
                      </span>
                  ) : (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Play
                      </span>
                  )}
                </button>
                <button
                    onClick={() => seek(Math.min(duration, currentTime + 5))}
                    className="btn-ghost px-3 py-2 text-sm"
                    title="Avancer de 5s"
                >
                  +5s
                </button>
              </div>

              {/* Sync section */}
              <div className="flex items-center justify-between gap-4 rounded-xl border border-primary-darkest/20 bg-primary-darkest/5 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Synchroniser</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {canSync ? "Ligne prête à synchroniser" : "Sélectionne une ligne"}
                  </p>
                </div>
                <button
                    className="btn-primary px-4 py-2"
                    onClick={ onSyncLine }
                    disabled={ !canSync }
                >
                  Sync
                </button>
              </div>
            </>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;