import { useState, useEffect } from "react";
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
      output_ext: null,
      format: "",
      proxy_url: null,
      subtitles: false,
      embed_metadata: false,
      embed_thumbnail: false,
      duration_raw: 0,
   });

   useEffect(() => {
      setFormData((prev) => ({
         ...prev,
         output_ext: selectedVideo.formats[curr]?.ext || null,
         duration_raw: selectedVideo.duration_raw
      }));
   }, [curr]);

   const format = selectedVideo.formats[curr];
   let source_ext = format.ext;

   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: type === "checkbox" ? checked : value,
      }));
      console.log(formData.duration_raw)
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      formData.output_dir = downloadPath || "/tmp/";
      console.log(downloadPath)
      formData.format = format.id;
      formData.url = selectedVideo.url;
      formData.title = selectedVideo.title;
      formData.output_ext = source_ext == formData.output_ext ? null : formData.output_ext;
      invoke("start_download", { config: formData })
   };

   return (
      <form onSubmit={handleSubmit} className="px-[1vw]">
         <div className="text-[1.3vw] my-[1vw]">
            <FolderPicker />
         </div>
         <div className="text-[1.3vw] grid grid-cols-2 gap-2">
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
                  <p className="text-[2vw]">{source_ext || "Unknown"}</p>
               </div>
               <p className="mx-5">to</p>
               <div className="flex flex-col">
                  <label htmlFor="output-ext-select" className="text-[1vw]">
                     Output Format:
                  </label>
                  <select
                     name="output_ext"
                     value={formData.output_ext}
                     onChange={handleChange}
                     className="text-[2vw]"
                     id="output-ext-select"
                  >
                     <option value="mp4">mp4</option>
                     <option value="mkv">mkv</option>
                     <option value="mov">mov</option>
                     <option value="webm">webm</option>
                     <option value="mp3">mp3</option>
                     <option value="m4a">m4a</option>
                  </select>
               </div>
            </div>
            <div className="flex justify-center text-[1.5vw] mb-[1vw]">
               <button type="submit" className="bg-black text-white hover:bg-[#dfdfdf] hover:text-black rounded-[2vw] px-5 py-2 flex items-center transition duration-300">
                  <p className="pr-2">Download {formData.output_ext || ""}</p>
                  <p className="size-7"><Download /></p>
               </button>
            </div>
         </div>
      </form>
   );
}
