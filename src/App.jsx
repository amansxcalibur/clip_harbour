import "./App.css";

import FileDesc from "./components/download/file_desc";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SideBar from "./components/menu/sidebar";
import { useState } from "react";
import { VideoProvider } from "./providers/video_context";
import { DownloadPathProvider } from "./providers/download_path_context";
import Home from "./home";

function App() {
   const [open, setOpen] = useState(false);
   return (
      <VideoProvider>
         <DownloadPathProvider>
         <main className="bg-[#f4f4f4] min-h-screen flex flex-col font-montreal">
            <BrowserRouter>
               <Routes>
                  <Route path='/' element={
                      <Home open={open} setOpen={setOpen}/>
                  } />
                  <Route path='/val' element={
                     <div className="flex flex-1">
                        <SideBar open={open} setOpen={setOpen} />
                        <FileDesc />
                     </div>
                  } />
               </Routes>
            </BrowserRouter>
         </main>
         </DownloadPathProvider>
      </VideoProvider>
   );
}

export default App;
