import React from 'react';

const LyricsInput: React.FC  = () => {
    return(
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
            <label htmlFor="lyrics-textarea" className="block text-sm font-medium text-gray-700 mb-2">
                Paste your lyrics here
            </label>

            <textarea
                id="lyrics-textarea"
                rows={10}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800"
                placeholder="Enter your lyrics here, one line per lyrics..."
            />

            <button className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Load Lyrics
            </button>

            {/* Help message */}
            <p className="mt-2 text-sm text-gray-500 text-center">
                One line per lyrics
            </p>
        </div>
    );
};

export default LyricsInput;