import React from "react";

const LyricsInput: React.FC = () => {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Lyrics input</h2>
          <p className="card-subtitle">1 ligne = 1 lyric.</p>
        </div>
      </div>

      <div className="card-body flex flex-col gap-4">
        <label htmlFor="lyrics-textarea" className="text-sm font-bold text-foreground">
           Paste Your Lyrics
        </label>

        <textarea
          id="lyrics-textarea"
          className="textarea"
          rows={10}
          placeholder="Colle tes lyrics ici, une ligne par parole..."
        />

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
             Supprime les lignes vides pour un meilleur résultat
          </p>
          <button className="btn-primary">Load Lyrics</button>
        </div>
      </div>
    </div>
  );
};

export default LyricsInput;