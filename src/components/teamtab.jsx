import { useState } from "react";
// import { PackageIcon, PlusCircleIcon } from "lucide-react"; // Import icons

import AddTeam from "./addteam";

import Team from "./team";

import Designations from "./adddesign.jsx";

function Teamtab() {
  const [activeContent, setActiveContent] = useState("Board Member");

  const content = [
    { title: "Board Member", content: <Team />  },
    { title: "Add Team", content: <AddTeam /> },
      { title: "Add Designations", content: <Designations /> },
    
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
              flex items-center gap-2 px-10 py-2 text-sm font-medium text-center whitespace-nowrap 
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

export default Teamtab;
