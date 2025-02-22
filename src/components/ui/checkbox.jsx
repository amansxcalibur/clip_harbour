import { useState } from "react";

const CheckboxIcon = ({ checked, handleChange, name }) => {
    // const [checked, setChecked] = useState(false)
    // const handleChange = () => {
    //    setChecked(!checked);
    // };
    return (
       <label>
          <input type="checkbox" className="hidden" name={name} onChange={handleChange} />
          <svg
             viewBox="0 0 64 64"
             className="size-[1.5vw] overflow-visible max-sm:size-[8vw]"
          >
             <path
                d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16"
                pathLength="575.0541381835938"
                className="fill-none stroke-gray-500 stroke-[3] transition-all duration-500 ease-in-out"
                style={{
                   strokeLinecap: 'round',
                   strokeLinejoin: 'round',
                   strokeDasharray: checked ? '70.51 9999999' : '241 9999999',
                   strokeDashoffset: checked ? '-262.27' : '0',
                }}
             />
          </svg>
       </label>
    );
 };
 
 export default CheckboxIcon; 