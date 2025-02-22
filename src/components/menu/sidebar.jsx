import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listen } from "@tauri-apps/api/event";

export default function SideBar({ open, setOpen }) {
   const [downloads, setDownloads] = useState({});

   useEffect(() => {
      const unlistenPromise = listen("status", (event) => {
         console.log("Received event:", event.payload);
         setDownloads(event.payload);
      });

      return () => {
         unlistenPromise.then((unlisten) => unlisten()).catch(console.error);
      };
   }, []);

   return (
      <div className="bg-red-800 relative">
         <div className={`bg-blue-700 ${open ? 'min-w-[30vw]' : 'min-w-[2vw]'}`}>
            <button className="text-5xl" onClick={() => setOpen(true)}>AA</button>

            <div className="p-4 text-white text-lg">
               <h3 className="font-bold">Downloads</h3>
               <ul>
                  {Object.entries(downloads).map(([id, download]) => (
                     <li key={id} className="mt-2">
                        <p className="font-semibold">{download.title || "Download"}</p>
                        <p className="text-sm">📥 {download.status}</p>
                     </li>
                  ))}
                  <li className={`${open ? "" : "hidden"}`}>
                     <FolderPicker />
                  </li>
                  <li>
                     <a href="/">Go /</a>
                  </li>
               </ul>
            </div>

            <ul className="mt-3 flex flex-col justify-center text-4xl">
               {[1, 2, 3, 4].map((key, index) => (
                  <li key={index} className="mt-1">
                     <Link to={"/"} onClick={() => setOpen(false)}>
                        {open ? <>Full Option</> : <>A</>}
                     </Link>
                  </li>
               ))}
            </ul>

            <ul className="absolute bottom-0 mb-4">
               <li>
                  <button className="text-4xl">
                     {open ? <>Settings or something idk</> : <>S</>}
                  </button>
               </li>
            </ul>

            <button className="text-5xl" onClick={() => setOpen(false)}>
               {open ? <>Collapse</> : <></>}
            </button>
         </div>
      </div>
   );
}
