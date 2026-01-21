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
