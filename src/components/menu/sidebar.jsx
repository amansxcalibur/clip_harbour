import FolderPicker from "../download/save_destination";
import { useState } from "react";
import { listen } from "@tauri-apps/api/event";
import Loader from "./loader";

export default function SideBar({ open, setOpen }) {
   const [downloads, setDownloads] = useState({});

   listen("status", (event) => {
      setDownloads(event.payload);
   });

   return (
      <div className="bg-red-800 relative flex">
         <div className={`bg-[#ffffff] text-black ${open ? 'min-w-[30vw]' : 'min-w-[2vw]'} flex flex-col`}>
            <button className="text-5xl" onClick={() => setOpen(true)}>AA</button>

            <div className="p-4 text-lg flex-1 flex flex-col">
               <p className="text-[2vw]">Queue</p>
               <ul className="mt-3 flex flex-col  flex-1">
                  {Object.entries(downloads).map(([id, download]) => (
                     <Loader id={id} download={download} />
                  ))}
                  <li className="flex justify-end hover:text-[#a1a1a1]">View all</li>
                  <li className="text-[2vw] py-[1vw] hover:bg-black transition duration-300 hover:text-[#ffffff]">History</li>
               </ul>
               <div className={`${open ? "" : "hidden"}`}>
                  <FolderPicker />
               </div>
               <div>
                  <a href="/">Go /</a>
               </div>
            </div>

            <ul className="">
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
