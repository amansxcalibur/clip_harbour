<div align="center">
<h1>Clip Harbour</h1>
 
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Built with Tauri](https://img.shields.io/badge/Built%20with-Tauri-blue)](https://tauri.app)

</div>

## Overview
Clip Harbour is a user friendly and feature-rich cross-platform GUI for downloading videos and audio from various websites like YouTube. Built with [Tauri](https://github.com/tauri-apps/tauri) and powered by [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) and [`ffmpeg`](https://www.ffmpeg.org/) Clip Harbour provides an easy to use graphical interface for one of the most powerful video downloading tools out there.

Go check out our [demo video](https://www.youtube.com/watch?v=VYv4jSYCPak)!

# Table of Contents

- [Motivation](#why-does-this-exist)
- [Features](#features)
- [Usage](#usage)
- [For Developers](#development-setup)
- [License](#license)

## Why does this exist?
While `yt-dlp` is a powerful command-line tool, it can be difficult for beginners to use due to its complexity and command-line nature. This project was created to bridge that gap.  

Although there are a few existing frontends like [ezytdl](https://github.com/sylviiu/ezytdl) or [youtube-dl-gui](https://github.com/jely2002/youtube-dl-gui), many are either outdated, lack active maintenance, or fail to fully utilize `yt-dlp`'s capabilities. Our goal is to address these shortcomings by providing a modern and feature-rich alternative. Here are a few standout features of this project - 

- **Compatibility**: Clip Harbour is built using [Tauri](https://github.com/tauri-apps/tauri), a cross-platform framework that enables the app to run seamlessly on Windows, Linux and MacOS.
- **Size**: Unlike Electron, Tauri leverages the system's native web renderer, keeping the binary lightweight—ours is just around ~8MB! We have also bundled a [custom minimal](ffmpeg_build.sh) version of `ffmpeg`, reducing its size by 93%. No more bloatware accusations on r/archlinux! ;)
- **Feature Rich**: We've tried our best to expose as many features of `yt-dlp` as we could. You can find a list of supported features under [Features](#features) (more PR's are welcome!)

## Features
  * Integration with `yt-dlp` with support for parallel downloads as well as multiple download options.
  * Ability to search for videos on youtube in addition to entering specific URLs.
  * Integration with `ffmpeg` for on-demand conversion between different video/audio formats.
  * Detailed statistics regarding the current download progress including download speed, ETA, file size, bytes downloaded etc.
  * Ability to embed thumbnails and subtitles directly into the video file.

## Usage
Just head on over to the [releases](https://github.com/amansxcalibur/clip_harbour/releases) page and download the binary that is specific to your OS!

**Note:** You will need to have python installed to run the versions that are suffixed with `_python`

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
