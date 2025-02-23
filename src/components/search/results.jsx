import { useState } from "react";
import { Link } from "react-router-dom";
import { useVideo } from "../../providers/video_context";

export default function SearchResults({ open, setOpen }) {
   const [curr, setCurr] = useState(0);
   const { setSelectedVideo, searchResults } = useVideo();
   const handleHover = (index) => {
      setCurr(index);
   };
   if (searchResults && searchResults[0]?.title === "Loading...") {
      return (
         <div className="flex flex-col gap-4 p-6 w-full">
            {[...Array(5)].map((_, index) => (
               <div key={index} className="animate-pulse flex items-center space-x-6 border-b border-gray-200 p-4 w-full">
                  <div className="h-[4vw] w-[15vw] bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-4">
                     <div className="h-[1.2vw] bg-gray-200 rounded w-3/4"></div>
                     <div className="h-[1vw] bg-gray-200 rounded w-1/2"></div>
                  </div>
               </div>
            ))}
         </div>
      );
   }

   
   else if (!searchResults) {
      return (
         <div className="ml-[2vw] text-[1.5vw]">
            No results yet! Search something.
         </div>
      )
   }
   return (
      <div className="flex flex-1">
         <div className="flex flex-[2] flex-col w-full">
            {searchResults.map((key, index) => (
               <Link
                  to={"/val"}
                  onMouseEnter={() => handleHover(index)}
                  onClick={() => setSelectedVideo(searchResults[index])}
                  key={index}
                  className="group flex relative gap-x-[.5vw] border-b-[1px] border-solid border-black text-[1.4vw] max-md:text-[5vw] text-black hover:text-white bg-transparent z-10 p-[.7vw] max-md:p-[2.1vw] transition-all ease-in-out duration-500"
               >
                  <p className="max-md:hover:ml-[3vw]">{searchResults[index].title}</p>
                  <p className="flex-1 flex justify-center max-md:hover:ml-[3vw]">{searchResults[index].uploader}</p>
                  <p className="max-md:hover:ml-[3vw]">{searchResults[index].duration}</p>
                  {/* <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-[#ffc506] transition-all ease-in-out duration-500 group-hover:w-full"></span> */}
                  <span className="absolute left-0 bottom-0 h-0 w-full bg-black transition-all ease-in-out duration-400 z-[-1] group-hover:h-full"></span>
               </Link>
            ))}
         </div>
         <div className={`flex-1 flex max-h-[20vw] max-md:hidden ${open ? "hidden" : ""} p-[1vw]`}>
            <img
               src={searchResults[curr].thumbnail}
               alt="Thumbnail"
               className={`object-cover object-top flex-1 bg-green-50 shadow-[0_0px_2px_rgba(0,_0,_0,_0.7)]`}
            />
         </div>
      </div>
   );
}
