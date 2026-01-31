// Interface for a single line of lyric
export interface LyricLine {
  id: number;
  text: string; // Text of the lyric line
  timestamp: number | null; // Timestamp of the lyric line in milliseconds (optional can be null if not synced)
  isSynced: boolean; // Whether the lyric line is synced with the audio
  isEditing: boolean; // Whether the lyric line is currently being edited
}


// Interface for the JSON format who will be exported
export interface SyncedLyricItem {
    time: number; // Timestamp of the lyric line in milliseconds
    text: string; // Text of the lyric line
}

// Type for the JSON file containing the lyric lines
export type SyncedLyricsJSON = SyncedLyricItem[];

// Type for the LRC format who will be exported(simple string with a specific format)
export type LRCFormat = string;

// Props for the LyricsList component
export type LyricsListProps = {
    lyrics: LyricLine[]; // Array of lyric lines to display
    selectedLineId: number | null; // ID of the lyric line currently selected
    onSelectLine: (lineId: number) => void; // Function to call when a lyric line is selected
    onClearTimestamp: (lineId: number) => void; // Function to call when a lyric line timestamp is cleared
    onUpdateTimestamp: (lineId: number, timestamp: number | null) => void; // Function to call when a timestamp is manually edited
    //onUpdateLyric: (lineId: string, newText: string) => void; // Function to call when a lyric line is updated
};

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoaded: boolean;
}

// Props for the AudioPlayer component
export type AudioPlayerProps = {
    audioFile: File | null; // Audio file to play
    onAudioLoad: (file: File) => void; // Function to call when the audio file is loaded
    onAudioPlay: () => void; // Function to call when the audio is played
    onAudioPause: () => void; // Function to call when the audio is paused
    onAudioSeek: (time: number) => void; // Function to call when the audio is seeked
    onAudioTimeUpdate: (time: number) => void; // Function to call when the audio time is updated
};

export interface CurrentLyricDisplayProps {
    activeLine: LyricLine | null;
    previousLine: LyricLine | null;
    nextLine: LyricLine | null;
    progress: number;
}