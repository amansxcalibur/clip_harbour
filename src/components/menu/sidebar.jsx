import { Link } from "react-router-dom";
import FolderPicker from "../download/save_destination";

export default function SideBar({open, setOpen}) {
   return (
      <div className="bg-red-800">
         <div className={`bg-blue-700 ${open?'min-w-[30vw]':'min-w-[2vw]'}`}>
            <button
               className="text-5xl"
               onClick={() => {
                  setOpen(true);
               }}
            >AA
            </button>
            <ul className="mt-3 flex flex-col justify-center text-4xl">
                  {[1,2,3,4].map((key, index) => (
                     <li key={index} className="mt-1">
                        <Link to={"/"} onClick={() => setOpen(false)}>
                           {open?
                           <>Full Option</>:
                           <>A</>}
                        </Link>
                     </li>
                  ))}
                  <li className={`${open?"":"hidden"}`}>
                     <FolderPicker/>
                  </li>
                  <li>
                     <a href="/">Go /</a>
                  </li>
               </ul>
               <ul className="absolute bottom-0 mb-4">
                  <li>
                     <button className="text-4xl">
                        {open?<>Settings or something idk</>:<>S</>}
                     </button>
                  </li>
               </ul>
            <button
                  className="text-5xl"
                  onClick={() => {
                     setOpen(false);
                  }}
               >
                  {open?<>Collapse</>:<></>}
               </button>
         </div>
      </div>
   );
}
