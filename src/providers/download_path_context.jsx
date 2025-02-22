import { useState, createContext } from "react";

export const DownloadPathContext = createContext();

export const DownloadPathProvider = ({ children }) => {
  const [downloadPath, setDownloadPath] = useState(null);

  return (
    <DownloadPathContext.Provider value={{ downloadPath, setDownloadPath }}>
      {children}
    </DownloadPathContext.Provider>
  );
}
