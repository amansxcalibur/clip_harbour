use serde::Deserialize;
use tauri::Emitter;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

#[derive(Deserialize, Debug)]
struct DownloadConfig {
    url: String,
    output_dir: Option<String>,
    format: Option<String>,
    proxy_url: Option<String>,
    subtitles: Option<bool>,
    embed_metada: Option<bool>,
    embed_thumbnail: Option<bool>,
}

fn parse_config(config: DownloadConfig) -> Vec<String> {
    let mut args = vec![config.url];

    let optional_args = [
        config.output_dir.map(|x| vec!["-P".to_string(), x]),
        config.format.map(|x| vec!["-f".to_string(), x]),
        config.proxy_url.map(|x| vec!["--proxy".to_string(), x]),
        config.subtitles.map(|_| vec!["--write-subs".to_string()]),
        config.embed_metada.map(|_| vec!["--embed-metadata".to_string()]),
        config.embed_thumbnail.map(|_| vec!["--embed-thumbnail".to_string()]),
    ];
    args.extend(optional_args.into_iter().flatten().flatten());
    return args;
}

#[tauri::command(rename_all = "snake_case")]
fn start_download(app: tauri::AppHandle, config: DownloadConfig) {
    let sidecar_command = app.shell().sidecar("yt-dlp").unwrap().args(parse_config(config));
    let (mut rx, mut _child) = sidecar_command.spawn().expect("Failed to spawn sidecar");

    tauri::async_runtime::spawn(async move {
        // read events such as stdout
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line_bytes) = event {
                let line = String::from_utf8_lossy(&line_bytes);
                app.emit("status", Some(format!("'{}'", line)))
                    .expect("failed to emit event");
            }
        }
    });
}

#[tauri::command(rename_all = "snake_case")]
fn get_favicon(url: String) -> String {
    let full_url = format!("http://www.google.com/s2/favicons?domain={}", url);
    full_url
}

#[tauri::command(rename_all = "snake_case")]
fn get_thumbnail_url(app: tauri::AppHandle,url: String) -> String {
    let args = vec!["--get-thumbnail".to_string(),url];
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![start_download])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
