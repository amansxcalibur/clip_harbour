import FolderPicker from "../download/save_destination";
import { useState } from "react";
import { listen } from "@tauri-apps/api/event";
import Loader from "./loader";
import Queue from "../svg/queue";
import History from "../../../public/icons/history.png"
import Folder from "../svg/folder";
import CircularProgressBar from "../ui/circle_progress";

export default function SideBar({ open, setOpen }) {
   const [downloads, setDownloads] = useState({});

   listen("status", (event) => {
      setDownloads(event.payload);
   });

   return (
      <div className="bg-red-800 relative flex" onMouseEnter={()=>{setOpen(true)}} onMouseLeave={()=>{setOpen(false)}}>
         <div className={`bg-[#ffffff] text-black ${open ? 'min-w-[30vw]' : 'min-w-[2vw]'} flex flex-col`}>
            <button className="text-5xl" onClick={() => setOpen(true)}><a href="/">CH</a></button>

            <div className="p-4 text-lg flex-1 flex flex-col">
               {open?
                  <p className="text-[2vw]">Queue</p>
               :
               <div className="size-13"><Queue/></div>}
               
               <ul className={`mt-3 flex flex-col flex-1 ${open?"":"items-center"} max-h-[70vh] overflow-scroll`}>
                  {Object.entries(downloads).map(([id, download]) => (
                     <>{
                        open?
                        <Loader id={id} download={download}/>
                        :
                        <>
                        {download.status=='finished'?
                           <div key={id} className="w-5 h-5 m-2 bg-black"></div>:
                           <CircularProgressBar percent={download.percentage}/>
                        }</>
                     }</>
                  ))}
                  <li className={`flex ${open?"justify-end":"justify-center"} hover:text-[#a1a1a1]`}>
                     {open?<p>View all</p>
                     :
                     <>...</>
                  } 
                  </li>
                  <li className="text-[2vw]">
                     {open?
                     <p className="py-[1vw] hover:bg-black transition duration-300 hover:text-[#ffffff]">History</p>
                     :
                     <><img src={History} className="py-[1vw] hover:bg-[#dfdfdf] transition duration-300 hover:text-[#ffffff] w-[2.5vw]"/></>
                     }
                  </li>
               </ul>
               <div className="">
                  {open?<>
                  <p className="text-[2vw] mb-[0.5vw]">Current Path</p>
                  <FolderPicker />
                  </>
                  :
                  <div className="size-13">
                     <Folder/>
                  </div>
                  }
               </div>
            </div>

            {/* <button className="text-5xl" onClick={() => setOpen(false)}>
               {open ? <>Collapse</> : <></>}
            </button> */}
         </div>
      </div>
   );
}
