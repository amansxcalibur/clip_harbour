import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Options from "./options";
import Arrow from "../svg/arrow";
import Plus from "../svg/plus";
import Download from "../svg/download";
import { invoke } from "@tauri-apps/api/core";
import { useVideo } from "../../providers/video_context";

export default function FileDesc() {
   const [curr, setCurr] = useState(0);
   const [collapse, setCollapse] = useState(false);
   const [formats, setFormats] = useState();
   const { selectedVideo } = useVideo();

   // Fetch video formats when the page loads
   useEffect(() => {
      const fetchFormats = async () => {
         try {
            const result = await invoke("get_formats", { videoDetails: selectedVideo });
            setFormats(result.formats);
         } catch (error) {
            console.error("Failed to fetch formats:", error);
         }
      };
      fetchFormats();
   }, []);

   // Show loading indicator if formats are not loaded
   if (!formats) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <p className="text-2xl font-bold animate-pulse">Loading...</p>
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
               <div onClick={() => { setCollapse(!collapse) }} className={`${collapse ? "" : "min-h-[30vh]"} flex flex-col`}>
                  <button className={`${collapse ? "text-black" : "bg-black text-[#ffffff]"} min-h-[7vh] border border-black border-solid flex items-center text-[2vw] pl-[2vw] sticky top-0`}>
                     {collapse ? <></> : <span className="size-10"><Plus /></span>}
                     Key Data
                  </button>
                  <div className={`grid grid-cols-2 px-[2vw] py-[1vw] gap-[0.3vw] ${collapse ? "hidden" : ""}`}>
                     {Object.keys(formats[0]).map((key, index) => (
                        <div className="flex text-[1.3vw]">
                           <p className="-rotate-90 size-7 mr-[0.5vw]"><Arrow /></p>
                           {key}:<span className="font-medium ml-[0.3vw]">{formats[curr][key]}</span>
                        </div>
                     ))}
                  </div>

               </div>
               <button onClick={() => { setCollapse(!collapse) }} className={`w-full sticky top-0 hover:bg-black hover:text-[#ffffff] ${collapse ? "bg-black text-[#ffffff] border-[#ffffff] border-b" : "border-black border-y"} min-h-[7vh] border-solid flex items-center pl-[2vw] text-[2vw]`}>
                  {collapse ? <span className="size-10"><Plus /></span> : <></>}Available
               </button>
               <Options setCurr={setCurr} curr={curr} collapse={collapse} formats={formats} />
            </div>
            <div className="flex-1 flex flex-col">
               <div className="bg-orange-500 min-h-[30vw] flex border-black border border-solid"></div>
               <div className="min-h-[10vh] flex flex-col items-start">
                  <p className="text-[2vw] ml-[1vw]">{data.title}</p>
               </div>
               <div className="flex justify-center items-center">
                  <div className="flex flex-col">
                     <p className="text-[0.7vw]">Final format</p>
                     <p>MP4</p>
                  </div>
                  <p className="mx-3">to</p>
                  <div className="flex flex-col">
                     <label for="cars" className="text-[0.7vw]">Choose a car:</label>
                     <select name="cars" id="cars">
                        <option value="volvo">Volvo</option>
                        <option value="saab">Saab</option>
                        <option value="mercedes">Mercedes</option>
                        <option value="audi">Audi</option>
                     </select>
                  </div>
               </div>
               <div className={`flex justify-center text-[1.3vw] mb-[1vw] ${collapse ? "hidden" : ""}`}>
                  <button className="bg-black text-white hover:bg-[#ffffff] hover:text-black rounded-[2vw] px-5 py-2 flex items-center">
                     <p className="pr-2">Download {data.formats[curr].ext}</p>
                     <p className="size-7"><Download /></p></button>
               </div>
            </div>
            <div className="min-h-[7vh] border-y border-solid border-black flex items-center pl-[2vw] text-[2vw]">Available</div>
            <Options setCurr={setCurr} curr={curr} formats={formats} />
         </div>
         <div className="flex-1 flex flex-col">
            <div className="bg-orange-500 min-h-[30vw] flex border-black border border-solid">

               <img
                  src={selectedVideo.thumbnail}
                  alt="Thumbnail"
                  width="400"
                  height="225"
                  className={`m-[1vw] object-cover object-top flex-1 bg-green-50 shadow-[0_0px_2px_rgba(0,_0,_0,_0.7)]`}
               />

            </div>

         </div>
      </div>
   )
}
