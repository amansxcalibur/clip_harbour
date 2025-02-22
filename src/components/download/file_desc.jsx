import { Link } from "react-router-dom";
import Options from "./options";
import Arrow from "../svg/arrow";
import Plus from "../svg/plus";
import Download from "../svg/download";
import data from "../../data/available_options.json"
import { useState } from "react";

export default function FileDesc(){
   const [curr, setCurr] = useState(0);
   return(
      <div className="flex-1 min-h-full flex-col">
         <div className="min-h-[10vh] flex flex-col items-start">
               <Link to='/' className="rotate-90 size-16 border border-solid rounded-full border-black"><Arrow/></Link>
               <p className="text-[2vw]">{data.title}</p>
         </div>
         <div className="flex">
               <div className="flex-[1.5]">
                  <div className="min-h-[30vh] flex flex-col">
                     <p className="bg-black text-[#ffffff] min-h-[7vh] flex items-center text-[2vw] pl-[2vw]">
                        <span className="size-10"><Plus/></span>
                        Key Data
                     </p>
                     <div className="grid grid-cols-2 px-[2vw] py-[2vw] gap-[0.3vw]">
                           {Object.keys(data.formats[0]).map((key, index)=>(
                              <div className="flex text-[1.3vw]">
                                 <p className="-rotate-90 size-7 mr-[0.5vw]"><Arrow/></p>
                                 {key}:<span className="font-medium ml-[0.3vw]">{data.formats[curr][key]}</span>
                              </div>
                           ))}
                     </div>
                     {/* <div className="flex justify-center items-center">
                           <div className="flex flex-col">
                              <p className="text-[0.7vw]">Final format</p>
                              <p>MP4</p>
                           </div>
                           <p className="mx-3">to</p>
                           <div className="flex flex-col">
                              <label for="cars" className="text-[0.7vw]">Choose a car:</label>
                              <select name="cars" id="cars">
                              <option value="volvo">Volvo</option>
                              <option value="saab">Saab</option>
                              <option value="mercedes">Mercedes</option>
                              <option value="audi">Audi</option>
                              </select> 
                           </div>
                     </div> */}
                     <div className="flex justify-center text-[1.3vw] mb-[1vw]">
                           <button className="bg-black text-white hover:bg-[#ffffff] hover:text-black rounded-[2vw] px-5 py-2 flex items-center">
                              <p className="pr-2">Download {data.formats[curr].ext}</p>
                              <p className="size-7"><Download/></p></button>
                     </div>
                  </div>
                  <div className="min-h-[7vh] border-y border-solid border-black flex items-center pl-[2vw] text-[2vw]">Available</div>
                  <Options setCurr={setCurr} curr={curr}/>
               </div>
               <div className="flex-1 flex flex-col">
                  <div className="bg-orange-500 min-h-[30vw] flex border-black border border-solid"></div>
               </div>
         </div>
      </div>
   )
}