import React from 'react';

const ExportPanel: React.FC = () => {
    return (
        <div className="bg-primary-lightest text-primary-darkest p-6 rounded-lg shadow-md max-w-md mx-auto">
            <div className="text-center text-xl">
                Export Your Lyrics
            </div>

            <div className="mt-4 flex gap-3 justify-center">
                <button className="px-4 py-2 rounded bg-primary-lightest text-primary-darkest hover:bg-primary-dark">
                    Export as JSON
                </button>
                <button className="px-4 py-2 rounded bg-primary-lightest text-primary-darkest hover:bg-primary-dark">
                    Export as LRC
                </button>
            </div>
        </div>
    );
};

export default ExportPanel;