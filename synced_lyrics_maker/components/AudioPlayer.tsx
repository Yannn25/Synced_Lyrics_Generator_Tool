import React from "react";

const AudioPlayer: React.FC = () => {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Audio</h2>
          <p className="card-subtitle">Charge un fichier puis contrôle la lecture.</p>
        </div>
      </div>

      <div className="card-body flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <label htmlFor="audio-file" className="text-sm font-bold text-foreground">
             Upload Audio File
          </label>

          <input
            id="audio-file"
            type="file"
            accept="audio/*"
            className="input file:mr-4 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-primary-darkest file:to-primary-dark file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:from-primary-dark hover:file:to-primary file:shadow-lg file:transition-all file:cursor-pointer"
          />
          <p className="text-xs text-slate-400">
            Formats : mp3, wav, m4a, flac, ogg…
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary">▶ Play</button>
          <button className="btn-ghost">⏸ Pause</button>
          <div className="ml-auto text-sm font-mono text-primary-dark">
            00:00.00 <span className="text-slate-500">/</span> 00:00.00
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="0"
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700/50 accent-primary-darkest [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-primary-darkest [&::-webkit-slider-thumb]:to-primary-dark [&::-webkit-slider-thumb]:shadow-lg"
          />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>0%</span>
            <span>100%</span>
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

          <button className="btn-primary">Sync</button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;