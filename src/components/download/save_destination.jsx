import { useContext } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { DownloadPathContext } from "../../providers/download_path_context";

export default function FolderPicker() {
  const { downloadPath, setDownloadPath } = useContext(DownloadPathContext)

  async function handleSelectFolder() {
    try {
      const folder = await open({
        directory: true,
        multiple: false,
        title: "Select a download destination"
      });
      if (folder) {
        setDownloadPath(folder);
        console.log("Selected folder:", downloadPath);
      } else {
        console.log("No folder selected");
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
    }
  }

  return (
    <div>
      <p className="pl-2 pb-2 text-gray">Current Path: {downloadPath || "No folder selected"}</p>
      <button type="button" onClick={handleSelectFolder} className="p-2 bg-black hover:bg-[#dfdfdf] hover:text-black text-white white rounded-full px-[1vw]">
        Choose Path
      </button>
    </div>
  );
}
