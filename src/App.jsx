import { invoke } from "@tauri-apps/api/core";
import { listen } from '@tauri-apps/api/event';

listen('status', (event) => {
  console.log(event.payload);
})

import "./App.css";

function App() {
  async function download() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    await invoke("start_download", { config: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", output_dir: "/tmp/" } });
    let result = await invoke ("get_top_search", { query: "india"})
    console.log(result)
  }

  return (
    <main className="container font-montreal">
      <h1>Welcome to Tauri + React</h1>

      <div className="row bg-amber-400">
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
      >
        <input
          id="greet-input"
          placeholder="Enter a name..."
        />
        <button type="button" onClick={download}>Download</button>
      </form>
    </main>
  );
}

export default App;
