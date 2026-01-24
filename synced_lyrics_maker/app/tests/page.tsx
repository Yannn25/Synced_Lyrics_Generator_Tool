'use client';

import { useState, useRef, useEffect } from 'react';
import { useAudio } from '@/hooks/useAudio';
import { useLyrics } from '@/hooks/useLyrics';
import { useExport } from '@/hooks/useExport';

// Données de test
const sampleLyricsText = `Ceci est la première ligne
Voici le refrain qui se répète
Une autre ligne de test
Voici le refrain qui se répète
La dernière ligne du test`;

export default function TestPage() {
    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-8 text-center">🧪 Tests des Hooks</h1>

            <div className="content-center max-w-4xl mx-auto space-y-8">
                <TestUseAudio />
                <TestUseLyrics />
                <TestUseExport />
            </div>
        </div>
    );
}

// ============================================
// TEST 1: useAudio
// ============================================
function TestUseAudio() {
    const {
        audioRef,
        isPlaying,
        currentTime,
        duration,
        isLoaded,
        loadAudio,
        togglePlay,
        play,
        pause,
        seek,
        getCurrentTimestamp
    } = useAudio();

    const [logs, setLogs] = useState<string[]>([]);
    const fileInputRef = useRef< HTMLInputElement | null >(null);

    const log = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            log(`📁 Fichier sélectionné: ${file.name}`);
            loadAudio(file);
            log('⏳ Chargement de l\'audio...');
        }
    };

    useEffect(() => {
        if (isLoaded) {
            log(`✅ Audio chargé! Durée: ${duration.toFixed(2)}s`);
        }
    }, [isLoaded, duration]);

    useEffect(() => {
        if (isPlaying) {
            log('▶️ Lecture démarrée');
        }
    }, [isPlaying]);

    const testTogglePlay = () => {
        log(`🔄 togglePlay() appelé (état actuel: ${isPlaying ? 'playing' : 'paused'})`);
        togglePlay();
    };

    const testSeek = (time: number) => {
        log(`⏩ seek(${time}) appelé`);
        seek(time);
    };

    const testGetTimestamp = () => {
        const ts = getCurrentTimestamp();
        log(`⏱️ getCurrentTimestamp() = ${ts.toFixed(3)}s`);
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-400">🎵 Test useAudio</h2>

            {/* Audio element caché */}
            <audio ref={audioRef} />

            {/* États actuels */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <StateBox label="isLoaded" value={isLoaded} />
                <StateBox label="isPlaying" value={isPlaying} />
                <StateBox label="currentTime" value={`${currentTime.toFixed(2)}s`} />
                <StateBox label="duration" value={`${duration.toFixed(2)}s`} />
            </div>

            {/* Contrôles */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        1. Charger un fichier audio
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    <TestButton onClick={testTogglePlay} disabled={!isLoaded}>
                        togglePlay()
                    </TestButton>
                    <TestButton onClick={() => play()} disabled={!isLoaded}>
                        play()
                    </TestButton>
                    <TestButton onClick={() => pause()} disabled={!isLoaded}>
                        pause()
                    </TestButton>
                    <TestButton onClick={() => testSeek(0)} disabled={!isLoaded}>
                        seek(0)
                    </TestButton>
                    <TestButton onClick={() => testSeek(10)} disabled={!isLoaded}>
                        seek(10)
                    </TestButton>
                    <TestButton onClick={testGetTimestamp} disabled={!isLoaded}>
                        getCurrentTimestamp()
                    </TestButton>
                </div>
            </div>

            {/* Logs */}
            <LogBox logs={logs} onClear={() => setLogs([])} />

            {/* Checklist */}
            <CheckList items={[
                'Charger un fichier audio → isLoaded devient true',
                'togglePlay() → isPlaying alterne true/false',
                'currentTime se met à jour pendant la lecture',
                'seek(10) → currentTime passe à ~10s',
                'getCurrentTimestamp() retourne la position exacte'
            ]} />
        </div>
    );
}

// ============================================
// TEST 2: useLyrics
// ============================================
function TestUseLyrics() {
    const {
        lyrics,
        selectedLineId,
        loadLyrics,
        selectLine,
        syncLine,
        updateTimestamp,
        clearTimestamp,
        syncAndAdvance
    } = useLyrics();

    const [logs, setLogs] = useState<string[]>([]);

    const log = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    const testLoadLyrics = () => {
        log('📝 loadLyrics() appelé avec texte sample');
        loadLyrics(sampleLyricsText);
        log(`✅ ${sampleLyricsText.split('\n').length} lignes chargées`);
    };

    const testSelectLine = (lineId: string | null) => {
        log(`👆 selectLine("${lineId}")`);
        selectLine(lineId);
    };

    const testSyncLine = () => {
        if (selectedLineId) {
            const timestamp = Math.random() * 60; // Timestamp aléatoire pour le test
            log(`⏱️ syncLine("${selectedLineId}", ${timestamp.toFixed(2)})`);
            syncLine(selectedLineId, timestamp);
        } else {
            log('⚠️ Aucune ligne sélectionnée!');
        }
    };

    const testSyncAndAdvance = () => {
        if (selectedLineId) {
            const timestamp = Math.random() * 60;
            log(`⏭️ syncAndAdvance("${selectedLineId}", ${timestamp.toFixed(2)})`);
            syncAndAdvance(selectedLineId, timestamp);
        } else {
            log('⚠️ Aucune ligne sélectionnée!');
        }
    };

    const testClearTimestamp = () => {
        if (selectedLineId) {
            log(`🗑️ clearTimestamp("${selectedLineId}")`);
            clearTimestamp(selectedLineId);
        } else {
            log('⚠️ Aucune ligne sélectionnée!');
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-green-400">📝 Test useLyrics</h2>

            {/* États actuels */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <StateBox label="lyrics.length" value={lyrics.length} />
                <StateBox label="selectedLineId" value={selectedLineId || 'null'} />
            </div>

            {/* Contrôles */}
            <div className="flex flex-wrap gap-2 mb-4">
                <TestButton onClick={testLoadLyrics}>
                    loadLyrics()
                </TestButton>
                <TestButton onClick={testSyncLine} disabled={!selectedLineId}>
                    syncLine()
                </TestButton>
                <TestButton onClick={testSyncAndAdvance} disabled={!selectedLineId}>
                    syncAndAdvance()
                </TestButton>
                <TestButton onClick={testClearTimestamp} disabled={!selectedLineId}>
                    clearTimestamp()
                </TestButton>
                <TestButton onClick={() => testSelectLine(null)}>
                    selectLine(null)
                </TestButton>
            </div>

            {/* Liste des lyrics */}
            {lyrics.length > 0 && (
                <div className="bg-gray-900 rounded p-4 mb-4 max-h-48 overflow-y-auto">
                    <p className="text-sm text-gray-400 mb-2">Cliquez sur une ligne pour la sélectionner:</p>
                    {lyrics.map((line) => (
                        <div
                            key={line.id}
                            onClick={() => testSelectLine(line.id)}
                            className={`p-2 rounded cursor-pointer mb-1 flex justify-between items-center ${
                                selectedLineId === line.id
                                    ? 'bg-green-600'
                                    : line.isSynced
                                    ? 'bg-gray-700'
                                    : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                        >
                            <span className="truncate">{line.text}</span>
                            <span className="text-xs text-gray-400 ml-2">
                                {line.isSynced ? `${line.timestamp?.toFixed(2)}s` : '---'}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Logs */}
            <LogBox logs={logs} onClear={() => setLogs([])} />

            {/* Checklist */}
            <CheckList items={[
                'loadLyrics() → lyrics.length > 0',
                'Cliquer sur une ligne → selectedLineId change',
                'syncLine() → la ligne devient synced avec timestamp',
                'syncAndAdvance() → sync + sélectionne la ligne suivante',
                'clearTimestamp() → remet timestamp à null'
            ]} />
        </div>
    );
}

// ============================================
// TEST 3: useExport
// ============================================
function TestUseExport() {
    const {
        exportLRC,
        exportJSON,
        downloadFile,
        generateFilename,
        quickExport,
        getExportStats
    } = useExport();

    const [logs, setLogs] = useState<string[]>([]);

    // Données de test avec timestamps
    const testLyrics = [
        { id: '1', text: 'Première ligne', timestamp: 0.5, isSynced: true },
        { id: '2', text: 'Deuxième ligne', timestamp: 3.2, isSynced: true },
        { id: '3', text: 'Ligne non synchronisée', timestamp: null, isSynced: false },
        { id: '4', text: 'Dernière ligne synced', timestamp: 8.7, isSynced: true },
    ];

    const log = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    const testExportLRC = () => {
        const lrc = exportLRC(testLyrics);
        log('📄 exportLRC() appelé');
        log(`Résultat:\n${lrc}`);
    };

    const testExportJSON = () => {
        const json = exportJSON(testLyrics);
        log('📄 exportJSON() appelé');
        log(`Résultat:\n${json}`);
    };

    const testGenerateFilename = () => {
        const lrcName = generateFilename('lrc');
        const jsonName = generateFilename('json');
        log(`📁 generateFilename('lrc') = ${lrcName}`);
        log(`📁 generateFilename('json') = ${jsonName}`);
    };

    const testGetStats = () => {
        const stats = getExportStats(testLyrics);
        log(`📊 getExportStats() = ${JSON.stringify(stats)}`);
    };

    const testQuickExportLRC = () => {
        try {
            log('⬇️ quickExport(LRC) appelé - téléchargement lancé!');
            const result = quickExport(testLyrics, 'lrc');
            log(`✅ Fichier: ${result.filename}, ${result.syncedCount} lignes`);
        } catch (error) {
            log(`❌ Erreur: ${error}`);
        }
    };

    const testQuickExportJSON = () => {
        try {
            log('⬇️ quickExport(JSON) appelé - téléchargement lancé!');
            const result = quickExport(testLyrics, 'json');
            log(`✅ Fichier: ${result.filename}, ${result.syncedCount} lignes`);
        } catch (error) {
            log(`❌ Erreur: ${error}`);
        }
    };

    const testEmptyExport = () => {
        try {
            log('🧪 Test export avec 0 lignes synced...');
            quickExport([{ id: '1', text: 'test', timestamp: null, isSynced: false }], 'lrc');
        } catch (error) {
            log(`✅ Erreur attendue: ${error}`);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-purple-400">📤 Test useExport</h2>

            {/* Données de test affichées */}
            <div className="bg-gray-900 rounded p-4 mb-4">
                <p className="text-sm text-gray-400 mb-2">Données de test:</p>
                <pre className="text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(testLyrics, null, 2)}
                </pre>
            </div>

            {/* Contrôles */}
            <div className="flex flex-wrap gap-2 mb-4">
                <TestButton onClick={testExportLRC}>
                    exportLRC()
                </TestButton>
                <TestButton onClick={testExportJSON}>
                    exportJSON()
                </TestButton>
                <TestButton onClick={testGenerateFilename}>
                    generateFilename()
                </TestButton>
                <TestButton onClick={testGetStats}>
                    getExportStats()
                </TestButton>
                <TestButton onClick={testQuickExportLRC} className="bg-purple-600 hover:bg-purple-700">
                    ⬇️ quickExport(LRC)
                </TestButton>
                <TestButton onClick={testQuickExportJSON} className="bg-purple-600 hover:bg-purple-700">
                    ⬇️ quickExport(JSON)
                </TestButton>
                <TestButton onClick={testEmptyExport} className="bg-red-600 hover:bg-red-700">
                    🧪 Test erreur
                </TestButton>
            </div>

            {/* Logs */}
            <LogBox logs={logs} onClear={() => setLogs([])} />

            {/* Checklist */}
            <CheckList items={[
                'exportLRC() → retourne format [mm:ss.xx]texte',
                'exportJSON() → retourne JSON valide',
                'generateFilename() → nom avec date',
                'quickExport() → déclenche téléchargement',
                'Export avec 0 lignes synced → erreur'
            ]} />
        </div>
    );
}

// ============================================
// COMPOSANTS UTILITAIRES
// ============================================

function StateBox({ label, value }: { label: string; value: string | number | boolean }) {
    const displayValue = typeof value === 'boolean' ? (value ? '✅ true' : '❌ false') : value;
    const bgColor = typeof value === 'boolean'
        ? (value ? 'bg-green-900/50' : 'bg-red-900/50')
        : 'bg-gray-700';

    return (
        <div className={`${bgColor} rounded p-3 text-center`}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="font-mono font-bold">{displayValue}</p>
        </div>
    );
}

function TestButton({
    children,
    onClick,
    disabled = false,
    className = ''
}: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-3 py-2 rounded text-sm font-mono transition-colors ${
                disabled 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : className || 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
        >
            {children}
        </button>
    );
}

function LogBox({ logs, onClear }: { logs: string[]; onClear: () => void }) {
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-400">📋 Logs:</p>
                <button
                    onClick={onClear}
                    className="text-xs text-gray-500 hover:text-gray-300"
                >
                    Effacer
                </button>
            </div>
            <div className="bg-black rounded p-3 h-32 overflow-y-auto font-mono text-xs">
                {logs.length === 0 ? (
                    <p className="text-gray-600">Aucun log...</p>
                ) : (
                    logs.map((log, i) => (
                        <p key={i} className="text-green-400 whitespace-pre-wrap">{log}</p>
                    ))
                )}
                <div ref={logEndRef} />
            </div>
        </div>
    );
}

function CheckList({ items }: { items: string[] }) {
    return (
        <div className="mt-4 border-t border-gray-700 pt-4">
            <p className="text-sm text-gray-400 mb-2">✅ Checklist de validation:</p>
            <ul className="text-sm space-y-1">
                {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <span className="text-gray-500">☐</span>
                        <span className="text-gray-300">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}