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
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-700/60 border border-white/10 hover:bg-slate-600/60 hover:border-primary-darkest/40 transition-all flex items-center justify-center text-slate-400 hover:text-primary-dark z-20"
                title="Aide"
            >
                <span className="text-xs font-bold">?</span>
            </button>

            {/* Help modal */}
            {showHelp && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 z-40 bg-black/30"
                        onClick={() => setShowHelp(false)}
                    />
                    {/* Modal */}
                    <div className="fixed top-20 right-4 md:right-8 z-50 w-72 shadow-2xl rounded-xl overflow-hidden">
                        <div className="relative">
                            <button
                                onClick={() => setShowHelp(false)}
                                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
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