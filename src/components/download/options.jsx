import { Link } from "react-router-dom";
import { useState } from "react";
import data from "../../data/available_options.json"

export default function Options({curr, setCurr}) {
  //  const handleHover = (index) => {
  //     setCurr(data[index])
  //  }
  //  const handleClear = () => {
  //     setCurr(null);
  //  }
  return (
    <div className="flex flex-1">
      <div className="flex flex-[2] flex-col w-full max-h-[36vh] overflow-auto">
        {data.formats.map((key, index) => (
          <p
            onClick={()=>{setCurr(index)}}
            // to={"/val"}
            // onMouseEnter={() => handleHover(index)}
            // onMouseLeave={() => handleClear()}
            key={key}
            className={`${index==curr?"bg-black text-white":"bg-transparent"} group flex relative gap-x-[.5vw] border-b-[1px] border-solid border-black text-[1.4vw] max-md:text-[5vw] text-black hover:text-white z-10 p-[.7vw] max-md:p-[2.1vw] transition-all ease-in-out duration-500`}
          >
            <p className="max-md:hover:ml-[3vw]">{data.formats[index].ext}</p>
            <p className="flex-1 flex justify-center max-md:hover:ml-[3vw]">{data.formats[index].vcodec}</p>
            <p className="max-md:hover:ml-[3vw]">{data.formats[index].filesize}</p>
            {/* <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-[#ffc506] transition-all ease-in-out duration-500 group-hover:w-full"></span> */}
            <span className="absolute left-0 bottom-0 h-0 w-full bg-black transition-all ease-in-out duration-400 z-[-1] group-hover:h-full"></span>
          </p>
        ))}
      </div>
    </div>
  );
}
