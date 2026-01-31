# Synced Lyrics Generator Tool

A web-based tool that allows users to manually synchronize lyrics with audio files and export them in JSON or LRC format.

## How It Works

1. **Upload Audio** – Load any audio file (MP3, WAV, FLAC, OGG, M4A)
2. **Paste Lyrics** – Enter your lyrics in the text area (one line per lyric)
3. **Synchronize** – Play the audio and press `Enter` when each line should appear to capture the timestamp
4. **Edit** – Click on any timestamp to manually adjust it, or double-click on text to edit lyrics
5. **Preview** – Use the preview mode to see how your synced lyrics will look in a streaming app
6. **Export** – Download your synced lyrics as JSON or LRC file

## Features

- Real-time audio playback with progress bar and ±5s navigation
- One-click synchronization with keyboard shortcut (`Enter`)
- Inline editing for timestamps and lyrics text
- Visual feedback for synced/unsynced lines
- Full-screen preview mode simulating streaming apps
- Export to JSON format `[{time: number, text: string}, ...]`
- Export to LRC format `[mm:ss.cc]Lyrics text`

## Assumptions & Limitations

- **Manual sync only** – No AI/automatic speech recognition; all synchronization is done manually
- **Audio duration** – Designed for typical song lengths (under 60 minutes)
- **Browser-based** – Requires a modern browser with HTML5 audio support
- **Single audio file** – One audio file at a time per session
- **No persistence** – Data is not saved; refreshing the page clears all progress
- **Timestamp precision** – Timestamps are captured with centisecond precision (0.01s)

## Tech Stack

- Next.js 15 (React 19)
- TypeScript
- Tailwind CSS
- pnpm

## Getting Started

```bash
cd synced_lyrics_maker
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## License

MIT
