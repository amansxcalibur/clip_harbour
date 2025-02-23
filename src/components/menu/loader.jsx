import { useEffect } from "react";
import Pause from "../svg/pause";
import Play from "../svg/play";
import Stop from "../svg/stop";
import { invoke } from "@tauri-apps/api/core";

export default function Loader({ id, download }) {
    useEffect(() => {
        console.log("here ", download)
    }, [download])
    return (
        <li key={id} className="flex flex-col">
            <div className="flex-1">{download.title || "title"}</div>
            <div className="flex items-center -mt-1">
                <div className="flex-1">{download.status || "Error"}</div>
                {download.status == "downloading" ?
                    <button onClick={async () => { invoke("pause_download", { id: parseInt(id) }) }} disabled={download.status == 'finished'} className={`size-5 ${download.status == 'finished' ? "opacity-50" : ""}`}><Pause /></button>
                    :
                    <button onClick={async () => { invoke("resume_download", { id: parseInt(id) }) }} disabled={download.status == 'finished'} className={`size-5 ${download.status == 'finished' ? "opacity-50" : ""}`}><Play /></button>
                }
                <button onClick={async () => { invoke("stop_download", { id: parseInt(id) }) }} disabled={download.status == 'finished'} className={`size-5 ${download.status == 'cancelled' || download.status == 'finished' ? "opacity-50" : ""}`}><Stop /></button>
            </div>
            <div className="relative flex justify-start border border-black border-solid">
                <div className="bg-black min-h-7" style={{ width: download.percentage }}></div>
                <p className="mix-blend-difference top-0 left-0 text-white absolute">{download.percentage}</p>
            </div>
        </li>
    )
}
