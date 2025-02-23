export default function CircularProgressBar({percentage}){
    return(
        <div className="relative size-12">
      <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        {/* Background Circle */}
        <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200" strokeWidth="2"></circle>
        {/* Progress Circle */}
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          className="stroke-current text-black"
          strokeWidth="2"
          strokeDasharray="100"
          strokeDashoffset={100 - percentage}
          strokeLinecap="round"
        ></circle>
      </svg>
      {/* Percentage Text */}
      {/* <div className="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
        <span className="text-center text-[0.5rem] font-bold text-blue-600">
          {percentage}%
        </span>
      </div> */}
    </div>
    )
}