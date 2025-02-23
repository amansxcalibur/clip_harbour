import { useState } from "react";
import FolderPicker from "./save_destination";
import { useContext } from "react";
import { DownloadPathContext } from "../../providers/download_path_context";
import CheckboxIcon from "../ui/checkbox";
import Download from "../svg/download";
import { invoke } from "@tauri-apps/api/core";

export default function DownloadConfig({ selectedVideo, curr }) {
   const { downloadPath } = useContext(DownloadPathContext)
   const [formData, setFormData] = useState({
      url: "",
      output_dir: "",
      output_ext: "webm",
      format: "",
      proxy_url: null,
      subtitles: false,
      embed_metadata: false,
      embed_thumbnail: false,
   });

   const format = selectedVideo.formats[curr];
   const ext = format.ext;

   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: type === "checkbox" ? checked : value,
      }));
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      let config = formData;
      config.output_dir = downloadPath || "/tmp/";
      console.log(downloadPath)
      config.format = format.id;
      config.url = selectedVideo.url;
      config.title = selectedVideo.title;
      invoke("start_download", { config: config })
   };

   return (
      <form onSubmit={handleSubmit} className="px-[2vw]">
         <div className="text-[1.5vw] my-[1vw]">
            <FolderPicker />
         </div>
         <div className="text-[1.5vw] grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2">
               <CheckboxIcon name="subtitles" checked={formData.subtitles} handleChange={handleChange} />
               Download Subtitles
            </label>

            <label className="flex items-center gap-2">
               <CheckboxIcon name="embed_metadata" checked={formData.embed_metadata} handleChange={handleChange} />
               Embed Metadata
            </label>

            <label className="flex items-center gap-2">
               <CheckboxIcon name="embed_thumbnail" checked={formData.embed_thumbnail} handleChange={handleChange} />
               Embed Thumbnail
            </label>
         </div>

         <div className="flex justify-center items-center p-[1vw] flex-col gap-y-[1vw]">
            <div className="flex">
               <div className="flex flex-col">
                  <p className="text-[1vw]">Source format</p>
                  <p className="text-[2vw]">{ext || "Unknown"}</p>
               </div>
               <p className="mx-5">to</p>
               <div className="flex flex-col">
                  <label htmlFor="format-select" className="text-[1vw]">
                     Choose Format:
                  </label>
                  <select
                     name="format"
                     value={formData.format}
                     onChange={handleChange}
                     className="text-[2vw]"
                     id="format-select"
                  >
                     <option value="mp4">MP4</option>
                     <option value="mkv">MKV</option>
                  </select>
               </div>
            </div>
            <div className="flex justify-center text-[1.5vw] mb-[1vw]">
               <button type="submit" className="bg-black text-white hover:bg-[#dfdfdf] hover:text-black rounded-[2vw] px-5 py-2 flex items-center transition duration-300">
                  <p className="pr-2">Download {ext || ""}</p>
                  <p className="size-7"><Download /></p>
               </button>
            </div>
         </div>
      </form>
   );
}
