import reactLogo from "./assets/react.svg";
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
  }

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
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
