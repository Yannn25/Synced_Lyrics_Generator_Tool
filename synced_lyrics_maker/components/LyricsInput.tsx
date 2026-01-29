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
              <h2 className="card-title">Lyrics input</h2>
              <p className="card-subtitle">1 ligne = 1 lyric.</p>
            </div>
          </div>

          <div className="card-body flex flex-col gap-4">
            <label htmlFor="lyrics-textarea" className="text-sm font-bold text-foreground">
               Coller vos lyrics ici ou écrivez-les manuellement
            </label>

            <textarea
              id="lyrics-textarea"
              className="textarea"
              rows={10}
              placeholder="Colle tes lyrics ici, une ligne par parole..."
              value={lyricsText}
              onChange={e => setLyricsText(e.target.value)}
/*
              onKeyDown={e => e.key === 'Enter' && handleLoadLyrics()}
*/
            />

            <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-slate-400">
                  { lineCount > 0 ? `${lineCount} ligne(s) détectée(s)` : 'Aucune ligne détectée' }
                </p>

                { isLoaded && (
                    <span className="text-xs text-green-400 font-bold">
                        ✓ Lyrics chargées !
                    </span>
                )}

              <button
                  className="btn-primary"
                  onClick={handleLoadLyrics}
                  disabled={!lyricsText.trim()}
              >
                  Load Lyrics
              </button>
            </div>
          </div>
        </div>
    );
};

export default LyricsInput;