use nix::sys::signal::{kill, Signal};
use nix::unistd::Pid;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::atomic::{AtomicUsize, Ordering};
use tauri::async_runtime::Mutex;
use tauri::Emitter;
use tauri::Manager;
use tauri_plugin_dialog;
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
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
    filename: Option<String>,
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
    output_ext: Option<String>,
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

        // read stdout
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(data_bytes) = event {
                let data = String::from_utf8_lossy(&data_bytes);
                if let Ok(download) = serde_json::from_str::<Download>(&data) {
                    let snapshot = {
                        let mut download_registry = state.download_registry.lock().await;
                        // Break out of loop if download has been cancelled or process doesn't
                        // exist
                        if let Some(entry) = download_registry.get_mut(&process_id) {
                            if entry.status == "cancelled" {
                                break;
                            }
                            download_registry.insert(process_id, download);
                        } else {
                            break;
                        }
                        download_registry.clone()
                    };

                    app_clone.emit("status", snapshot).expect("failed to emit update event");
                } else {
                    eprint!("failed to parse progress update from yt-dlp")
                }
            }
        }

        if let Some(output_ext) = config.output_ext {
            println!("first some clear");
            let download_registry = state.download_registry.lock().await;
            if let Some(download) = download_registry.get(&process_id) {
                println!("second some clear");
                if let Some(filename) = download.filename.as_ref() {
                    println!("third some clear");
                    let input_path = format!("{}", filename);
                    let output_path = format!(
                        "{}.{}",
                        filename.rsplit_once('.').map(|(name, _)| name).unwrap(),
                        output_ext
                    );
                    println!("Calling convert_ext on {} -> {}", input_path, output_path);

                    tauri::async_runtime::spawn(async move {
                        convert_ext(app_clone, input_path, output_path).await;
                    });
                }
            }
        }
    });
}

#[tauri::command]
async fn convert_ext(app: tauri::AppHandle, input_path: String, output_ext: String) {
    print!("Hello rust des");
    println!("Converting: {} -> {}", input_path, output_ext);
    let args = vec![
        "-i".to_string(),
        input_path.clone(),
        "-y".to_string(),
        output_ext.clone(),
    ];
    let sidecar_command = app.shell().sidecar("ffmpeg").unwrap().args(args);
    let (mut rx, mut _child) = sidecar_command.spawn().expect("failed ffmpeg");
    println!("conversion: {} -> {}", input_path, output_ext);

    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stderr(line_bytes) = event {
            let log = String::from_utf8_lossy(&line_bytes);
            println!("FFmpeg Log: {}", log);
        }
    }

    println!("ffmpeg conversion completed: {}", output_ext);
}

#[tauri::command(rename_all = "snake_case")]
async fn stop_download(app: tauri::AppHandle, id: usize) {
    let state = app.state::<AppState>();
    let mut process_registry = state.process_registry.lock().await;

    if let Some(handle) = process_registry.remove(&id) {
        handle.kill().expect("failed to kill process");
    } else {
        eprintln!("failed to remove process from registry")
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

    let handle = process_registry
        .get(&id)
        .expect("failed to fetch process from registry");
    let pid = Pid::from_raw(handle.pid() as i32);
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

    let handle = process_registry
        .get(&id)
        .expect("failed to fetch process from registry");
    let pid = Pid::from_raw(handle.pid() as i32);
    kill(pid, Signal::SIGCONT).expect("Failed to send resume signal");
}

fn parse_video_details(mut video_details: Video) -> Video {
    video_details.url = format!("https://www.youtube.com/watch?v={}", video_details.url);

    if let Some(formats) = video_details.formats.as_mut() {
        formats.reverse();
        for format in formats.iter_mut() {
            const MB: f64 = 1024.0 * 1024.0;

            // Estimate filesize from bitrate and duration
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

    return video_details;
}

#[tauri::command(rename_all = "snake_case")]
async fn get_top_search(app: tauri::AppHandle, query: String) {
    let args = vec![format!("ytsearch5:{}", query), "--dump-json".to_string()];
    let sidecar_command = app.shell().sidecar("yt-dlp").unwrap().args(args);
    let (mut rx, mut _child) = sidecar_command.spawn().expect("Failed to spawn sidecar");
    let mut search_results: Vec<Video> = vec![];

    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stdout(data_bytes) = event {
            let data = String::from_utf8_lossy(&data_bytes);
            if let Ok(video) = serde_json::from_str::<Video>(&data) {
                let processed_video: Video = parse_video_details(video);
                search_results.push(processed_video);
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

    let data_bytes = sidecar_command.output().await.unwrap().stdout;
    let data = String::from_utf8_lossy(&data_bytes);
    let video: Video = serde_json::from_str::<Video>(&data).expect("Failed to deserialize data from URL fetch");

    return parse_video_details(video);
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
            get_top_search,
            get_url_details,
            resume_download,
            get_top_search,
            convert_ext
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
