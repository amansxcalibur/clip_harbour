import { createContext, useState, useContext } from "react";
import { listen } from "@tauri-apps/api/event";

const VideoContext = createContext();

export function VideoProvider({ children }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  listen('search-update', (event) => {
    setSearchResults(event.payload);
  })

  return (
    <VideoContext.Provider value={{ selectedVideo, setSelectedVideo, searchResults, setSearchResults }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  return useContext(VideoContext);
}
