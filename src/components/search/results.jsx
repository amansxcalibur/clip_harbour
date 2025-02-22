import { useState } from "react";
import { Link } from "react-router-dom";
import { useVideo } from "../../providers/video_context";

export default function SearchResults({ open, setOpen }) {
   const [curr, setCurr] = useState(0);
   const { setSelectedVideo, searchResults } = useVideo();
   const handleHover = (index) => {
      setCurr(index);
   };
   if (!searchResults) {
      return (
         <div>
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
         <div className={`flex-1 flex max-h-[20vw] max-md:hidden bg-orange-500 ${open ? "hidden" : ""}`}>
            <img
               src={searchResults[curr].thumbnail}
               alt="Thumbnail"
               width="400"
               height="225"
               className={`m-[1vw] object-cover object-top flex-1 bg-green-50 shadow-[0_0px_2px_rgba(0,_0,_0,_0.7)]`}
            />
         </div>
      </div>
   );
}
