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
        <div className="flex flex-col gap-3">
          <label htmlFor="audio-file" className="text-sm font-bold text-foreground">
             Upload Audio File
          </label>
          <input
              ref={fileInputRef}
              id="audio-file"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="input file:mr-4 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-primary-darkest file:to-primary-dark file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:from-primary-dark hover:file:to-primary file:shadow-lg file:transition-all file:cursor-pointer"
          />
          <p className="text-xs text-slate-400">
            Formats : mp3, wav, m4a, flac, ogg…
          </p>
        </div>

        {/* Error message */}
        {error && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/50 px-4 py-3 text-sm text-red-400">
              ⚠️ {error}
            </div>
        )}

        {/* Message if audio file is not loaded */}
        {!isLoaded && !error && (
            <div className="rounded-lg bg-slate-700/30 px-4 py-6 text-center text-sm text-slate-400">
              Veuillez charger un fichier audio pour commencer
            </div>
        )}

        {/* Audio controls - Shown if audio is loaded */}
        { isLoaded && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="justify-center">
                  <button
                      onClick={() => seek(currentTime - 5)}
                      className="btn-ghost"
                  >
                    -5
                  </button>
                  <button
                      onClick={ togglePlay }
                      className="btn-primary"
                  >
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                  </button>
                  <button
                    onClick={() => seek(currentTime + 5)}
                    className="btn-ghost"
                  >
                    +5
                  </button>
                </div>

                <div className="ml-auto text-sm font-mono text-primary-dark">
                  { formatTime(currentTime) }
                  <span className="text-slate-500"> / </span>
                  { formatTime(duration) }
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex flex-col gap-3">
                <input
                    type="range"
                    min="0"
                    max={ duration || 100 }
                    step="0.1"
                    value={ currentTime }
                    onChange={handleSeek}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700/50 accent-primary-darkest [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-primary-darkest [&::-webkit-slider-thumb]:to-primary-dark [&::-webkit-slider-thumb]:shadow-lg"
                />
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{ formatTime(currentTime) }</span>
                  <span>{ formatTime(duration) }</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-primary-darkest/30 bg-gradient-to-r from-slate-800/50 to-slate-700/50 px-5 py-4 shadow-lg">
                <div>
                  <div className="text-sm font-bold text-foreground flex items-center gap-2">
                    Sync Current Line
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Sélectionne une ligne, puis synchronise
                  </div>
                </div>

                <button
                    className="btn-primary"
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