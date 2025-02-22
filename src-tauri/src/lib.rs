use serde::Deserialize;
use tauri::Emitter;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

#[derive(Deserialize, Debug)]
struct DownloadConfig {
    url: String,
    output_dir: Option<String>,
    format: Option<String>,
}

fn parse_config(config: DownloadConfig) -> Vec<String> {
    let mut args = vec![config.url];

    let optional_args = [
        config.output_dir.map(|o| vec!["-P".to_string(), o]),
        config.format.map(|f| vec!["-f".to_string(), f]),
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
        .args(parse_config(config));
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![start_download])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
