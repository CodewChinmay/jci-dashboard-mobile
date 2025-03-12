import { useState } from "react";
import Workingareas from "./gallery.jsx";
import Workingdata from "./video.jsx";
import Sliding from "./carousel.jsx"

function GalleryTab() {
    // Set default active content to a valid title, e.g., "Images"
    const [activeContent, setActiveContent] = useState("Sliding Images");

    const content = [
        { title: "Sliding Images", content: <Sliding />},
        { title: "Image Gallery ", content: <Workingareas /> },
        { title: "Video Gallery", content: <Workingdata /> },

    ];

    function getContent(title) {
        const item = content.find((item) => item.title === title);
        return item ? item.content : null;
    }

    return (
        <div className="flex flex-col">
            <div className="flex h-15 pt-2 bg-gradient-to-r from-gray-200 via-gray-100/90 to-white">
                {content.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveContent(item.title)}
                        className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium text-center whitespace-nowrap 
              ${activeContent === item.title
                            ? "bg-white text-gray-600 border-t-2 border-cyan-600 rounded-t-xl font-semibold text-4xl"
                            : "text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                        }
              ${index === 0 ? "ml-0" : ""}
            `}
                    >
                        {item.icon}
                        <span>{item.title}</span>
                    </button>
                ))}
            </div>
            {/* Content Section */}
            <div className="flex-grow bg-white">{getContent(activeContent)}</div>
        </div>
    );
}

export default GalleryTab;
