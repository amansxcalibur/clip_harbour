use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::atomic::{AtomicUsize, Ordering};
use tauri::async_runtime::Mutex;
use tauri::Emitter;
use tauri::Manager;
use tauri_plugin_shell::process::{CommandChild, CommandEvent, Output};
use tauri_plugin_shell::ShellExt;
use tauri_plugin_dialog;

// Used to assign each process a unique ID
static PROCESS_COUNTER: AtomicUsize = AtomicUsize::new(0);

#[derive(Debug)]
struct AppState {
    process_registry: Mutex<HashMap<usize, CommandChild>>,
    download_registry: Mutex<HashMap<usize, Download>>,
}

#[derive(Deserialize, Serialize, Clone, Debug, Default)]
struct Download {
    status: String,
    #[serde(rename(deserialize = "_percent_str"))]
    percentage: Option<String>,
    #[serde(rename(deserialize = "_speed_str"))]
    speed: Option<String>,
    #[serde(rename(deserialize = "_eta_str"))]
    eta: Option<String>,
    #[serde(rename(deserialize = "_downloaded_bytes_str"))]
    bytes_downloaded: Option<String>,
    #[serde(rename(deserialize = "_total_bytes_estimate_str"))]
    file_size: Option<String>,
}

#[derive(Deserialize, Debug, Clone)]
struct DownloadConfig {
    url: String,
    output_dir: Option<String>,
    format: Option<String>,
    proxy_url: Option<String>,
    subtitles: Option<bool>,
    embed_metada: Option<bool>,
    embed_thumbnail: Option<bool>,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
struct Format {
    #[serde(rename(deserialize = "format_id"))]
    id: String,
    #[serde(rename(deserialize = "tbr"))]
    bitrate: Option<f64>,
    #[serde(rename(deserialize = "acodec"))]
    audio_codec: Option<String>,
    #[serde(rename(deserialize = "vcodec"))]
    video_codec: Option<String>,
    #[serde(rename(deserialize = "asr"))]
    sample_rate: Option<i64>,
    fps: Option<f64>,
    filesize: Option<i64>,
    resolution: Option<String>,
    dynamic_range: Option<String>,
    ext: String,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
struct Video {
    title: String,
    url: String,
    uploader: String,
    thumbnail: String,
    duration: String,
    formats: Option<Vec<Format>>,
}

fn parse_config(config: DownloadConfig) -> Vec<String> {
    let mut args = vec![
        config.url,
        "--progress-template".to_string(),
        "%(progress)j".to_string(),
        "--quiet".to_string(),
        "--progress".to_string(),
    ];

    let optional_args = [
        config.output_dir.map(|x| vec!["-P".to_string(), x]),
        config.format.map(|x| vec!["-f".to_string(), x]),
        config.proxy_url.map(|x| vec!["--proxy".to_string(), x]),
        config.subtitles.map(|_| vec!["--embed-subs".to_string()]),
        config.embed_metada.map(|_| vec!["--embed-metadata".to_string()]),
        config.embed_thumbnail.map(|_| vec!["--embed-thumbnail".to_string()]),
    ];
    args.extend(optional_args.into_iter().flatten().flatten());
    return args;
}

#[tauri::command(rename_all = "snake_case")]
fn start_download(app: tauri::AppHandle, config: DownloadConfig) {
    let config_clone = config.clone();
    let sidecar_command = app.shell().sidecar("yt-dlp").unwrap().args(parse_config(config));
    let (mut rx, mut _child) = sidecar_command.spawn().expect("Failed to spawn sidecar");

    let output_dir = config_clone.output_dir.unwrap_or_else(|| ".".to_string()); 

    let app_clone = app.clone();
    tauri::async_runtime::spawn(async move {
        let state = app.state::<AppState>();

        let process_id = PROCESS_COUNTER.fetch_add(1, Ordering::Relaxed);
        {
            let mut handle_registry = state.process_registry.lock().await;
            handle_registry.insert(process_id, _child);
        } // Explicitly release lock as the while loop is blocking

        let snapshot = {
            let mut download_registry = state.download_registry.lock().await;
            download_registry.insert(
                process_id,
                Download {
                    status: "starting..".to_string(),
                    ..Default::default()
                },
            );
            download_registry.clone()
        };

        app_clone
            .emit("status", snapshot)
            .expect("failed to emit starting event");

        let mut downloaded_file = None;

        // read events such as stdout
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line_bytes) = event {
                let data = String::from_utf8_lossy(&line_bytes);
                if let Ok(json_value) = serde_json::from_str::<Download>(&data) {
                    let snapshot = {
                        let mut download_registry = state.download_registry.lock().await;
                        download_registry.insert(process_id, json_value);
                        download_registry.clone()
                    };

                    app_clone.emit("status", snapshot).expect("failed to emit update event");
                }
                if let Some(filename) = data.strip_prefix("Destination: ") {
                    downloaded_file = Some(filename.trim().to_string());
                }
            }
        }

        if let Some(input_path) = downloaded_file {
            let output_path = format!("{}/converted.mp4", output_dir);
            println!("Calling convert_ext for: {} -> {}", input_path, output_path);

            // Call convert_ext asynchronously
            tauri::async_runtime::spawn(async move {
                convert_ext(app_clone, input_path, output_path).await;
            });
        }
    });
}

#[tauri::command]
async fn convert_ext(app: tauri::AppHandle, input_path: String, output_path: String) {
    print!("Hello rust des");
    println!("Converting: {} -> {}", input_path, output_path);
    let args = vec![
        "-i".to_string(), input_path.clone(),
        "-y".to_string(),
        output_path.clone()
    ];
    let sidecar_command = app.shell().sidecar("ffmpeg").unwrap().args(args);
    let (mut rx, mut _child) = sidecar_command.spawn().expect("failed ffmpeg");
    println!("conversion: {} -> {}", input_path, output_path);

    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stderr(line_bytes) = event {
            let log = String::from_utf8_lossy(&line_bytes);
            println!("FFmpeg Log: {}", log);
        }
    }

    println!("ffmpeg conversion completed: {}", output_path);
}

#[tauri::command(rename_all = "snake_case")]
async fn stop_download(app: tauri::AppHandle, id: usize) {
    let state = app.state::<AppState>();
    let mut registry = state.process_registry.lock().await;
    if let Some(handle) = registry.remove(&id) {
        handle.kill().expect("failed to kill process");
    }
}

#[tauri::command(rename_all = "snake_case")]
fn get_favicon(url: String) -> String {
    let full_url = format!("http://www.google.com/s2/favicons?domain={}", url);
    full_url
}

#[tauri::command(rename_all = "snake_case")]
fn get_thumbnail_url(app: tauri::AppHandle, url: String) -> String {
    let args = vec!["--get-thumbnail".to_string(), url];
    let sidecar_command = app.shell().sidecar("yt-dlp").unwrap().args(args);
    let (mut rx, mut _child) = sidecar_command.spawn().expect("Failed to spawn sidecar");
    let mut thumbnail_url = String::new();
    while let Some(event) = rx.blocking_recv() {
        if let CommandEvent::Stdout(line_bytes) = event {
            thumbnail_url = String::from_utf8_lossy(&line_bytes).to_string();
            break;
        }
    }
    thumbnail_url.trim().to_string()
}

#[tauri::command(rename_all = "snake_case")]
async fn get_top_search(app: tauri::AppHandle, query: String) {
    let args = vec![
        format!("ytsearch5:{}", query),
        "--print".to_string(),
        r#"{"title":%(title)j, "url":%(id)j, "duration":%(duration_string)j, "uploader":%(uploader)j, "thumbnail":%(thumbnail)j}"#.to_string(),
    ];
    let sidecar_command = app.shell().sidecar("yt-dlp").unwrap().args(args);
    let (mut rx, mut _child) = sidecar_command.spawn().expect("Failed to spawn sidecar");
    let mut search_results: Vec<Video> = vec![];

    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stdout(line_bytes) = event {
            let data = String::from_utf8_lossy(&line_bytes);
            if let Ok(video_details) = serde_json::from_str::<Video>(&data) {
                search_results.push(video_details);
                app.emit("search-update", search_results.clone())
                    .expect("failed to send search update");
            }
        }
    }
}

#[tauri::command]
async fn get_formats(app: tauri::AppHandle, mut video_details: Video) -> Video {
    let sidecar_command = app.shell().sidecar("yt-dlp").unwrap().args([
        video_details.url.clone(),
        "--print".to_string(),
        "%(formats)j".to_string(),
    ]);

    let output: Output = sidecar_command.output().await.unwrap();

    let data = String::from_utf8_lossy(&output.stdout);
    let formats: Vec<Format> = serde_json::from_str::<Vec<Format>>(&data).unwrap();
    video_details.formats = Some(formats);
    return video_details;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(AppState {
                process_registry: Mutex::new(HashMap::<usize, CommandChild>::new()),
                download_registry: Mutex::new(HashMap::<usize, Download>::new()),
            });
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            start_download,
            stop_download,
            get_thumbnail_url,
            get_favicon,
            get_formats,
            get_top_search,
            convert_ext
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
