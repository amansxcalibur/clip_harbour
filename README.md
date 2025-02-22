# Clip Harbour

Clip Harbour is an intuitive and feature-rich cross-platform GUI for downloading video and audio from various websites. Built with [Tauri](https://github.com/tauri-apps/tauri) and powered by the popular [yt-dlp](https://github.com/yt-dlp/yt-dlp) command-line tool, Clip Harbour provides an easy to use graphical interface for one of the most powerful video downloading tools out there.

## Why does this exist?
While `yt-dlp` is an incredibly powerful command-line tool, it can be difficult for beginners to use due to its complexity and the need to remember various command-line arguments. Clip Harbour was made as a way to bridge this gap.

Additionally, while there are a few existing frontends like [ezytdl](https://github.com/sylviiu/ezytdl) or [youtube-dl-gui](https://github.com/jely2002/youtube-dl-gui), we found that a lot of them were either unmaintained or did not make full use of `yt-dlp`'s capabilities. Here are a list of features that make our app unique:
- **Compatibility**: Clip Harbour is built using [Tauri](https://github.com/tauri-apps/tauri), a cross-platform framework which enables the app to run seamlessly on Windows, Linux and MacOS.
- **Size**: One key advantage that Tauri has over similar frameworks like Electron is its efficient use of the system's native web renderer instead of bundling its own. This significantly reduces the final binary size&mdash;ours is just around 10MB! No more worries about being called out for bloatware on r/archlinux ;)
- **Feature Rich**: We've tried our best to expose as many features of `yt-dlp` as we could. You can find a list of supported features under [Features](#features) (more PR's are welcome!)

## Features
  * Integration with `yt-dlp` and full support for parallel downloads as well as multiple download presets.
  * Detailed statistics regarding the current download progress including download speed, ETA, file size, bytes downloaded etc.
  * Optional setting of a proxy URL to bypass geowalled content.
  * Embedding thumbnails and subtitles directly into the video file.

## Development Setup
### Prerequisites
Make sure you have the following installed on your system:
- [Node.js and npm](https://nodejs.org/)
- [Python](https://www.python.org/) (required for running the `yt-dlp` sidecar)
- [Rust and Cargo](https://www.rust-lang.org/tools/install) (required for Tauri CLI)

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/amansxcalibur/clip_harbour
   cd clip_harbour
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Install Tauri CLI** (if you haven't already):
   ```bash
   cargo install tauri-cli
   ```
4. **Run the development server**:
   ```bash
   npm run dev
   ```
5. **Run the Tauri application**:
   ```bash
   npm run tauri dev
   ```
## License
This project is licensed under the GNU GPL-3.0. You are free to use, modify, and distribute this software under the terms of the [GPL-3.0 license](https://github.com/amansxcalibur/clip_harbour/blob/main/LICENSE.md)
