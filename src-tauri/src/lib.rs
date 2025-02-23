use nix::sys::signal::{kill, Signal};
use nix::unistd::Pid;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::atomic::{AtomicUsize, Ordering};
use tauri::async_runtime::Mutex;
use tauri::Emitter;
use tauri::Manager;
use tauri_plugin_dialog;
use tauri_plugin_shell::process::{CommandChild, CommandEvent, Output};
use tauri_plugin_shell::ShellExt;
use tokio::time::{sleep, Duration};

// Used to assign each process a unique ID
static PROCESS_COUNTER: AtomicUsize = AtomicUsize::new(0);

#[derive(Debug)]
struct AppState {
    process_registry: Mutex<HashMap<usize, CommandChild>>,
    download_registry: Mutex<HashMap<usize, Download>>,
}

#[derive(Deserialize, Serialize, Clone, Debug, Default)]
struct Download {
    #[serde(skip_deserializing)]
    title: String,
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
    title: String,
    output_dir: Option<String>,
    format: Option<String>,
    proxy_url: Option<String>,
    embed_subtitles: Option<bool>,
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
    #[serde(rename(deserialize = "filesize"), skip_serializing)]
    filesize_raw: Option<i64>,
    #[serde(skip_deserializing)]
    filesize: Option<String>,

    fps: Option<f64>,
    resolution: Option<String>,
    dynamic_range: Option<String>,
    ext: String,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
struct Video {
    title: String,
    #[serde(rename(deserialize = "id"))]
    url: String,
    uploader: String,
    thumbnail: String,
    #[serde(rename(deserialize = "duration"), skip_serializing)]
    duration_raw: i64,
    #[serde(rename(deserialize = "duration_string"))]
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
        config.embed_subtitles.map(|_| vec!["--embed-subs".to_string()]),
        config.embed_metada.map(|_| vec!["--embed-metadata".to_string()]),
        config.embed_thumbnail.map(|_| vec!["--embed-thumbnail".to_string()]),
    ];
    args.extend(optional_args.into_iter().flatten().flatten());
    return args;
}

#[tauri::command(rename_all = "snake_case")]
fn start_download(app: tauri::AppHandle, config: DownloadConfig) {
    let sidecar_command = app
        .shell()
        .sidecar("yt-dlp")
        .unwrap()
        .args(parse_config(config.clone()));
    let (mut rx, mut _child) = sidecar_command.spawn().expect("Failed to spawn sidecar");

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
                    title: config.title,
                    status: "starting..".to_string(),
                    ..Default::default()
                },
            );
            download_registry.clone()
        };

        app_clone
            .emit("status", snapshot)
            .expect("failed to emit starting event");

        // read events such as stdout
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line_bytes) = event {
                let data = String::from_utf8_lossy(&line_bytes);
                if let Ok(json_value) = serde_json::from_str::<Download>(&data) {
                    let snapshot = {
                        let mut download_registry = state.download_registry.lock().await;
                        if let Some(entry) = download_registry.get_mut(&process_id) {
                            if entry.status == "cancelled" {
                                break;
                            }
                            download_registry.insert(process_id, json_value);
                        } else {
                            break;
                        }
                        download_registry.clone()
                    };

                    app_clone.emit("status", snapshot).expect("failed to emit update event");
                }
            } else {
                eprint!("failed to parse progress update from yt-dlp")
            }
        }
    });
}

#[tauri::command]
async fn stop_download(app: tauri::AppHandle, id: usize) {
    let state = app.state::<AppState>();
    let mut process_registry = state.process_registry.lock().await;

    if let Some(handle) = process_registry.remove(&id) {
        handle.kill().expect("failed to kill process");
    }

    let mut download_registry = state.download_registry.lock().await;
    download_registry.get_mut(&id).expect("failed to fetch download").status = "cancelled".to_string();
    app.emit("status", download_registry.clone())
        .expect("failed to emit kill event");
    sleep(Duration::from_secs(5)).await;
    download_registry.remove(&id);
    app.emit("status", download_registry.clone())
        .expect("failed to emit cleanup event");
}

#[tauri::command]
async fn pause_download(app: tauri::AppHandle, id: usize) {
    let state = app.state::<AppState>();
    let process_registry = state.process_registry.lock().await;

    let handle = process_registry.get(&id).expect("failed to fetch process");
    let pid_raw: i32 = handle.pid().try_into().unwrap();
    let pid = Pid::from_raw(pid_raw);
    kill(pid, Signal::SIGTSTP).expect("Failed to send pause signal");

    let mut download_registry = state.download_registry.lock().await;
    download_registry.get_mut(&id).expect("failed to fetch download").status = "paused".to_string();
    app.emit("status", download_registry.clone())
        .expect("failed to emit pause event");
}

#[tauri::command]
async fn resume_download(app: tauri::AppHandle, id: usize) {
    let state = app.state::<AppState>();
    let process_registry = state.process_registry.lock().await;

    let handle = process_registry.get(&id).expect("failed to fetch process");
    let pid_raw: i32 = handle.pid().try_into().unwrap();
    let pid = Pid::from_raw(pid_raw);
    kill(pid, Signal::SIGCONT).expect("Failed to send resume signal");
}

#[tauri::command(rename_all = "snake_case")]
fn get_favicon(url: String) -> String {
    let full_url = format!("http://www.google.com/s2/favicons?domain={}", url);
    full_url
}

fn parse_video_details(video_details: &mut Video) {
    video_details.url = format!("https://www.youtube.com/watch?v={}", video_details.url);
    if let Some(formats) = video_details.formats.as_mut() {
        formats.reverse();
        for format in formats.iter_mut() {
            const MB: f64 = 1024.0 * 1024.0;

            // Calculate filesize from bitrate and duration
            format.filesize = Some(if let Some(filesize) = format.filesize_raw {
                format!("{:.2} MB", filesize as f64 / MB)
            } else if let Some(bitrate) = format.bitrate {
                let estimated_size = (bitrate * video_details.duration_raw as f64) / (8.0 * 1024.0);
                format!("~{:.2} MB", estimated_size)
            } else {
                "Unknown".to_string()
            });
        }
    }
}

#[tauri::command(rename_all = "snake_case")]
async fn get_top_search(app: tauri::AppHandle, query: String) {
    let args = vec![format!("ytsearch5:{}", query), "--dump-json".to_string()];
    let sidecar_command = app.shell().sidecar("yt-dlp").unwrap().args(args);
    let (mut rx, mut _child) = sidecar_command.spawn().expect("Failed to spawn sidecar");
    let mut search_results: Vec<Video> = vec![];

    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stdout(line_bytes) = event {
            let data = String::from_utf8_lossy(&line_bytes);

            if let Ok(mut video_details) = serde_json::from_str::<Video>(&data) {
                parse_video_details(&mut video_details);
                search_results.push(video_details);
                app.emit("search-update", search_results.clone())
                    .expect("failed to send search update");
            }
        }
    }
}

#[tauri::command(rename_all = "snake_case")]
async fn get_url_details(app: tauri::AppHandle, url: String) -> Video {
    let args = vec![url, "--dump-json".to_string()];
    let sidecar_command = app.shell().sidecar("yt-dlp").unwrap().args(args);

    let output: Output = sidecar_command.output().await.unwrap();
    let data = String::from_utf8_lossy(&output.stdout);
    let mut video: Video = serde_json::from_str::<Video>(&data).expect("Failed to deserialize data from URL fetch");
    video.url = format!("https://www.youtube.com/watch?v={}", video.url);
    video
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
            pause_download,
            get_favicon,
            get_top_search,
            get_url_details,
            resume_download,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
