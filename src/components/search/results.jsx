import { useState } from "react";
import { Link } from "react-router-dom";
import data from "../../data/search_list.json"
import { useVideo } from "../../providers/video_context";

export default function SearchResults({ open, setOpen }) {
   const [curr, setCurr] = useState(null);
   const { setSelectedVideo } = useVideo();
   const handleHover = (index) => {
      setCurr(data[index]);
   };
   const handleClear = () => {
      setCurr(null);
   };
   return (
      <div className="flex flex-1">
         <div className="flex flex-[2] flex-col w-full">
            {data["search_results"].map((key, index) => (
               <Link
                  to={"/val"}
                  onMouseEnter={() => handleHover(index)}
                  onMouseLeave={() => handleClear()}
                  onClick={() => setSelectedVideo(data["search_results"][index])}
                  key={index}
                  className="group flex relative gap-x-[.5vw] border-b-[1px] border-solid border-black text-[1.4vw] max-md:text-[5vw] text-black hover:text-white bg-transparent z-10 p-[.7vw] max-md:p-[2.1vw] transition-all ease-in-out duration-500"
               >
                  <p className="max-md:hover:ml-[3vw]">{data["search_results"][index].title}</p>
                  <p className="flex-1 flex justify-center max-md:hover:ml-[3vw]">{data["search_results"][index].title}</p>
                  <p className="max-md:hover:ml-[3vw]">{data["search_results"][index].title}</p>
                  {/* <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-[#ffc506] transition-all ease-in-out duration-500 group-hover:w-full"></span> */}
                  <span className="absolute left-0 bottom-0 h-0 w-full bg-black transition-all ease-in-out duration-400 z-[-1] group-hover:h-full"></span>
               </Link>
            ))}
         </div>
         <div className={`flex-1 flex max-h-[20vw] max-md:hidden bg-orange-500 ${open ? "hidden" : ""}`}>
            {curr - 1}
            {/* <Image src={curr} alt="h" width={1} height={1} className={`${curr == '/' ? 'hidden' : ''} m-[1vw] object-cover object-top flex-1 bg-green-50 shadow-[0_0px_2px_rgba(0,_0,_0,_0.7)]`} unoptimized></Image> */}
         </div>
      </div>
   );
}
