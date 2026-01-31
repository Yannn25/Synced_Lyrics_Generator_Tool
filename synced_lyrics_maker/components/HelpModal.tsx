'use client'

import React, { useState } from "react";
import ShortcutsHint from "@/components/ShortcutsHints";

const HelpModal: React.FC = () => {
    const [showHelp, setShowHelp] = useState(false);

    return (
        <>
            {/* Help button */}
            <button
                onClick={() => setShowHelp(!showHelp)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-700/50 border border-white/10 hover:bg-slate-600/50 hover:border-primary-darkest/50 transition-all flex items-center justify-center text-slate-400 hover:text-primary-dark z-20"
                title="Aide"
            >
                <span className="text-sm font-bold">?</span>
            </button>

            {/* Help modal */}
            {showHelp && (
                <>
                    <div
                        className="fixed inset-0 z-100"
                        onClick={() => setShowHelp(false)}
                    />
                    <div className="absolute top-8 right-0 z-1 w-120 shadow-2xl rounded-xl overflow-hidden bg-slate-800">
                        <div className="relative">
                            <button
                                onClick={() => setShowHelp(false)}
                                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10"
                            >×
                            </button>
                            <ShortcutsHint />
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default HelpModal;