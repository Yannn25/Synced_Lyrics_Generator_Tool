// Interface for a single line of lyric
export interface LyricLine {
  id: string; // Unique identifier for the lyric line
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
    selectedLineId: string | null; // ID of the lyric line currently selected
    onSelectLine: (lineId: string) => void; // Function to call when a lyric line is selected
    onClearTimestamp: (lineId: string) => void; // Function to call when a lyric line timestamp is cleared
    //onUpdateLyric: (lineId: string, newText: string) => void; // Function to call when a lyric line is updated
    //onSyncLyric: (lineId: string) => void; // Function to call when a lyric line is synced
    //onRemoveLyric: (lineId: string) => void; // Function to call when a lyric line is removed
};