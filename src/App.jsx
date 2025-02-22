import "./App.css";
import SearchBar from "./components/search/search_bar";
import SearchResults from "./components/search/results";
import FileDesc from "./components/download/file_desc";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SideBar from "./components/menu/sidebar";
import { useState } from "react";
import { VideoProvider } from "./providers/video_context";

function App() {
   const [open, setOpen] = useState(false);
   return (
      <VideoProvider>
         <main className="bg-[#f4f4f4] min-h-screen flex flex-col font-montreal">
            <BrowserRouter>
               <Routes>
                  <Route path='/' element={
                     <div className="flex flex-1">
                        <SideBar open={open} setOpen={setOpen} />
                        <div className="flex-1 flex flex-col">
                           <div className="flex justify-center">
                              <SearchBar />
                           </div>

                           <div className="h-[1px] bg-black w-full my-[1vw]"></div>
                           <div className="flex-1 flex">
                              <SearchResults open={open} setOpen={setOpen} />
                           </div>
                        </div>
                     </div>
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
      </VideoProvider>
   );
}

export default App;
