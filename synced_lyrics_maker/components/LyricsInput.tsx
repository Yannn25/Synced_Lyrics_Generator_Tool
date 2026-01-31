'use client'

import React, { useState } from "react";

interface LyricsInputProps {
    onLoadLyrics: (text: string) => void;
}

const LyricsInput: React.FC<LyricsInputProps> = ({ onLoadLyrics }) => {
    const [lyricsText, setLyricsText] = useState<string>('');
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    const handleLoadLyrics = () => {
        if(lyricsText.trim()) {
            onLoadLyrics(lyricsText);
            setLyricsText(''); // Cleanup the textarea
            setIsLoaded(true);
            setTimeout(() => setIsLoaded(false), 3000); // Show the success message for 3 seconds
        }
    };

    const lineCount = lyricsText.split('\n').filter(line => line.trim()).length;

    return (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Lyrics</h2>
              <p className="card-subtitle">Une ligne par parole</p>
            </div>
          </div>

          <div className="card-body flex flex-col gap-4">
            <textarea
              id="lyrics-textarea"
              className="textarea font-mono text-sm"
              rows={8}
              placeholder="Verse 1&#10;Chorus&#10;Verse 2&#10;..."
              value={lyricsText}
              onChange={e => setLyricsText(e.target.value)}
            />

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                        {lineCount > 0 ? `${lineCount} ligne${lineCount > 1 ? 's' : ''}` : 'Vide'}
                    </span>

                    {isLoaded && (
                        <span className="text-xs text-emerald-400 font-medium animate-pulse">
                            Chargé
                        </span>
                    )}
                </div>

              <button
                  className="btn-primary"
                  onClick={handleLoadLyrics}
                  disabled={!lyricsText.trim()}
              >
                  Charger
              </button>
            </div>
          </div>
        </div>
    );
};

export default LyricsInput;