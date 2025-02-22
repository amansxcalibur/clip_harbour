import "./App.css";
import SearchBar from "./components/search/search_bar";
import SearchResults from "./components/search/results";
import { BrowserRouter } from "react-router-dom";

function App() {
   return (
   <main className="bg-[#f4f4f4] min-h-screen flex flex-col font-montreal">
      <BrowserRouter>
         <div className="">
               <div className="flex justify-center">
               <SearchBar/>
               </div>
         </div>
         <div className="h-[1px] bg-black w-full my-[1vw]"></div>
         <div className="flex-1 flex">
               <SearchResults/>
         </div>
      </BrowserRouter>
   </main>
   );
}

export default App;
