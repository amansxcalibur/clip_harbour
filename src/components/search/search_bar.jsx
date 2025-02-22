import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

export default function SearchBar() {
    const [searchValue, setSearchValue] = useState("");

    async function Search() {
        invoke("get_top_search", { query: searchValue });
    }

    //     const filteredTeams = [1,2,3,4,5].filter((row) => {
    //       const matchesSearch =
    //           !searchedVal.length ||
    //           row.teamName?.toLowerCase().includes(searchedVal.toLowerCase()) ||
    //           row.teamId?.toString().toLowerCase().includes(searchedVal.toLowerCase()) ||
    //           row.institution?.toLowerCase().includes(searchedVal.toLowerCase()) ||
    //           row.site?.toLowerCase().includes(searchedVal.toLowerCase());

    //       const matchesToggle = !showWomenOnly || row.isWomenOnly;
    //       const matchesSite = !selectedSite || row.site === selectedSite;

    //       return matchesSearch && matchesToggle && matchesSite;
    //   });

    return (
        <div className="">
            <input id="search" onChange={(e) => setSearchValue(e.target.value)} type="text" className="text-black text-base font-bold min-h-[3.5vw] min-w-[25vw] font-light text-[1vw] border border-[#bebebe] border-solid px-[1vw]" placeholder="Search or Enter URL" />
            <button className="min-w-10" onClick={Search}>Search</button>
        </div>
    )
}
