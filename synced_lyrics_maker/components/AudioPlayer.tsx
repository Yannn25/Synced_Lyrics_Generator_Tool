import React from 'react';

const AudioPlayer: React.FC  = () => {
    return(
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
            {/* Input file for audio upload*/}
            <div className="mb-4">
                <label htmlFor="audio-file" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Audio File
                </label>
                <input
                    id="audio-file"
                    type="file"
                    accept="audio/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            {/* Audio player */}
            <div className="flex items-center justify-center space-x-4 mb-4">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Play
                </button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Pause
                </button>
            </div>

            {/* Progress bar */}
            <div>
                <progress className="w-full" max="100"></progress>
            </div>

            {/* Time display */}
            <div className="text-center text-lg font-mono text-gray-800 mb-4">
                00:00 / 00:00
            </div>

            {/* Button Sync Current Line */}
            <div className="text-center">
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Sync Current Line
                </button>
            </div>
        </div>
    );
};

export default AudioPlayer;