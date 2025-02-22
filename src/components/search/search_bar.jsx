export default function SearchBar(){
    var countDown;
    const functionForSearching=(val)=>{
        console.log("api searching", val)
    }

    const delayedSearch=(e)=>{
      console.log(e.target.value, " hekllo")
    clearTimeout(countDown); 
    countDown = setTimeout(()=>{
        functionForSearching(e.target.value)
    },2000); 
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

    return(
        <div className="">
            <input id="search" type="text" className="min-h-[3.5vw] min-w-[25vw] font-light text-[1vw] border border-[#bebebe] border-solid px-[1vw]" placeholder="Search or Enter URL" onChange={delayedSearch} />
            <button className="min-w-10" >Hello</button>
        </div>
    )
}