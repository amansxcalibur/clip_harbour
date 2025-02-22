import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Options from "./options";
import Arrow from "../svg/arrow";
import Plus from "../svg/plus";
import { invoke } from "@tauri-apps/api/core";
import { useVideo } from "../../providers/video_context";
import DownloadConfig from "./download_config";

export default function FileDesc() {
   const [curr, setCurr] = useState(0);
   const [collapse, setCollapse] = useState(false);
   const [formats, setFormats] = useState([]);
   const { selectedVideo } = useVideo();

   useEffect(() => {
      const fetchFormats = async () => {
         if (!selectedVideo) return;
         try {
            const result = await invoke("get_formats", { videoDetails: selectedVideo });
            console.log("Fetching formats for", selectedVideo);
            setFormats(result.formats || []);
         } catch (error) {
            console.error("Failed to fetch formats:", error);
         }
      };
      fetchFormats();
   }, [selectedVideo]);

   if (!formats.length) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <p className="text-[3vw] font-light animate-pulse ml-[4vw]">Fetching...</p>
         </div>
      );
   }

   return (
      <div className="flex-1 min-h-full flex-col">
         <div className="flex">
            <Link to='/' className="rotate-90 size-16 border border-solid rounded-full border-black"><Arrow /></Link>
         </div>
         <div className="flex">
            <div className="flex-[1.5] max-h-[87vh] overflow-scroll">
               <div onClick={() => setCollapse(!collapse)} className={`${collapse ? "" : "min-h-[30vh]"} flex flex-col`}>
                  <button className={`${collapse ? "text-black" : "bg-black text-[#ffffff]"} min-h-[7vh] border border-black border-solid flex items-center text-[2vw] pl-[2vw] sticky top-0`}>
                     <span className="size-10"><Plus /></span> Key Data
                  </button>
                  <div className={`grid grid-cols-2 px-[2vw] py-[1vw] gap-[0.3vw] ${collapse ? "hidden" : ""}`}>
                     {Object.keys(formats[0] || {}).map((key, index) => (
                        <div key={index} className="flex text-[1.3vw]">
                           <p className="-rotate-90 size-7 mr-[0.5vw]"><Arrow /></p>
                           {key}: <span className="font-medium ml-[0.3vw]">{formats[curr][key]}</span>
                        </div>
                     ))}
                  </div>
               </div>
               <button onClick={() => setCollapse(!collapse)} className={`w-full sticky top-0 hover:bg-black hover:text-[#ffffff] ${collapse ? "bg-black text-[#ffffff] border-[#ffffff] border-b" : "border-black border-y"} min-h-[7vh] border-solid flex items-center pl-[2vw] text-[2vw]`}>
                  <span className="size-10"><Plus /></span> Available Formats
               </button>
               <Options setCurr={setCurr} curr={curr} collapse={collapse} formats={formats} />
            </div>
            <div className="flex-1 flex flex-col">
               <div className="bg-orange-500 flex border-black border border-solid">
                  <img
                     src={selectedVideo?.thumbnail}
                     alt="Thumbnail"
                     className="object-cover object-top flex-1 bg-green-50 shadow-[0_0px_2px_rgba(0,_0,_0,_0.7)]"
                  />
               </div>
               <div className="flex flex-col items-start">
                  <p className="text-[2vw] ml-[1vw]">{selectedVideo?.title}</p>
                  <p className="text-[1.5vw] ml-[1vw] underline">{selectedVideo?.url}</p>
               </div>
               <DownloadConfig ext={formats[curr].ext}/>
            </div>
         </div>
      </div>
   );
}
