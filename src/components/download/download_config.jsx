import { useState } from "react";
import FolderPicker from "./save_destination";
import CheckboxIcon from "../ui/checkbox";
import Download from "../svg/download";
import { invoke } from "@tauri-apps/api/core";

export default function DownloadConfig({ ext }) {
const [formData, setFormData] = useState({
   url: "",
   output_dir: "",
   format: "mp4",
   proxy_url: "",
   subtitles: false,
   embed_metadata: false,
   embed_thumbnail: false,
});

const handleChange = (e) => {
   const { name, value, type, checked } = e.target;
   setFormData((prev) => ({
   ...prev,
   [name]: type === "checkbox" ? checked : value,
   }));
};

const handleSubmit = async (e) => {
   e.preventDefault();
   console.log("download now", formData)
   try {
      const inputPath = "/home/aman/tauri/sample.webm";
      const outputPath = "/home/aman/tauri/output.mp4";

      await invoke("convert_ext", {
         inputPath: inputPath,
         outputPath: outputPath
      });
      console.log("here hehehe");
   } catch (error) {
      console.error("Failed to fetch formats:", error);
   }
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
