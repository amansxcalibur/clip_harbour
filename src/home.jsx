import SearchBar from "./components/search/search_bar";
import SearchResults from "./components/search/results";
import { useVideo } from "./providers/video_context";
import SideBar from "./components/menu/sidebar";
import { useState } from "react";

export default function Home({open, setOpen}){
    const [isFocused, setIsFocused] = useState(false);
    const { setSelectedVideo, searchResults } = useVideo();
    return(
        <div className="flex flex-1">
            <SideBar open={open} setOpen={setOpen} />
            <div className="flex-1 flex flex-col">
                <div className={`flex transition-all duration-300 ${isFocused || searchResults ? "justify-center mt-2" : "justify-center mt-[40vh]"}`}>
                <SearchBar setIsFocused={setIsFocused} isFocused={isFocused} />
                </div>

                <div className="h-[1px] bg-black w-full my-[1vw]"></div>
                <div className="flex-1 flex">
                <SearchResults open={open} setOpen={setOpen} />
                </div>
            </div>
        </div>
    )
}