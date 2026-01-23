import React from 'react';
import { LyricsListProps } from "@/types";

const LyricsList: React.FC<LyricsListProps> = ({ lyrics, selectedLineId, onSelectLine, onClearTimestamp }) => {
    return (
        <div className="space-y-4">
            {lyrics.map((line, index) => (
                <div
                    key={line.id}
                    className={`p-4 rounded-lg shadow-md transition-colors cursor-pointer ${
                        selectedLineId === line.id
                            ? 'bg-blue-100 border-2 border-blue-500'
                            : line.isSynced
                                ? 'bg-green-100'
                                : 'bg-gray-100'
                    }`}
                    onClick={() => onSelectLine(line.id)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <span className="font-bold text-gray-700 mr-2">{index + 1}.</span>
                            <span className="text-gray-800">{line.text}</span>
                        </div>
                        <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {line.timestamp !== null ? `${Math.floor(line.timestamp / 60)}:${(line.timestamp % 60).toFixed(2).padStart(5, '0')}` : 'Not synced'}
              </span>
                            <button
                                className="bg-red-500 hover:bg-red-700 text-white text-sm py-1 px-2 rounded"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering the line selection
                                    onClearTimestamp(line.id);
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LyricsList;
