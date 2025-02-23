import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVideo } from "../../providers/video_context";

export default function SearchBar() {
    const [searchValue, setSearchValue] = useState("");
    const navigate = useNavigate();
    const { setSelectedVideo , setSearchResults } = useVideo();

    async function Search() {
        setSearchResults(null)
        setSearchResults([{ title: "Loading...", uploader: "", duration: "" }]);
        if (searchValue.includes("http")) {
            
            setSelectedVideo(null)
            invoke("get_url_details", { url: searchValue }).then((videoDetails) => setSelectedVideo(videoDetails));
            navigate("/val");
            return;
        }
        await invoke("get_top_search", { query: searchValue });
    }

    return (
        <div className="">
            <input id="search" onKeyDown={(e) => {if (e.key == "Enter") Search()}} onChange={(e) => setSearchValue(e.target.value)} type="text" className="text-black text-base font-bold min-h-[3.5vw] min-w-[25vw] font-light text-[1vw] border border-[#bebebe] border-solid px-[1vw]" placeholder="Search or Enter URL" />
            <button className="min-w-10" onClick={Search}>Search</button>
        </div>
    )
}
