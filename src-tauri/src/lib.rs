// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn open_url(url: &str) -> Result<(), String> {
    webbrowser::open(url).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, open_url])
        .setup(|app| {
            // 设置应用图标和窗口属性
            let window = app.get_webview_window("main").unwrap();
            
            // 设置窗口标题
            window.set_title("藏宝书签").unwrap();
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}