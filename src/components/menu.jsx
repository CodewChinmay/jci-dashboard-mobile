import { useState } from "react";
import {
  Home,
  Users,
  Briefcase,
  ChevronDown,
  ChevronUp,
  PencilRuler,
  ImagePlus,
  Pencil
} from "lucide-react";
import Dashboard from "./dashboard.jsx";
import Formregistrations from "./Formregistrations.jsx";
import Registrations from "./registrations.jsx";
import Gallery from "./gallery.jsx";
import Carousel from "./carousel.jsx";
import Team from "./team.jsx";
import Workingareas from "./Workingareas.jsx";
import Header from "./Header.jsx";


const Menu = () => {
  // State to track the active component
  const [activeComponent, setActiveComponent] = useState("Dashboard");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Array of main menu items
  const menuItems = [
    { name: "Dashboard", icon: <Home />, component: <Dashboard /> },
    { name: "Form Registrations", icon: <Users />, component: <Registrations /> },
    { name: "Accepted Members", icon: <Users />, component: <Formregistrations /> },

  ];

  // Array of dropdown menu items
  const dropdownItems = [
    { name: "Header", icon: <Pencil />, component: <Header /> },
    { name: "Team", icon: <Briefcase />, component: <Team /> },
    { name: "Gallery", icon: <ImagePlus />, component: <Gallery /> },
    { name: "Carousel", icon: <ImagePlus />, component: <Carousel /> },

    { name: "Working Areas", icon: <PencilRuler/>, component: <Workingareas/> }
  ];

  // Function to get the component for the active menu
  const getActiveComponent = (name) => {
    const item = [...menuItems, ...dropdownItems].find(
        (item) => item.name === name
    );
    return item ? item.component : <Dashboard />;
  };

  return (
      <div className="flex">
        {/* Menu Sidebar */}
        <div
            className="menu border-r-4 border-gray-200 min-w-[300px] shadow-lg flex flex-col items-end space-y-2 p-4"
            style={{ height: "calc(100vh - 80px)" }}
        >
          {/* Render main menu items */}
          {menuItems.map((item, index) => (
              <button
                  key={index}
                  onClick={() => setActiveComponent(item.name)}
                  className="text-black py-2 px-4 rounded hover:bg-cyan-600 hover:text-white transition-colors text-left w-full flex items-center space-x-3"
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
          ))}

          {/* Dropdown Menu */}
          <div className="w-full">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-black py-2 px-4 rounded hover:bg-cyan-600 hover:text-white transition-colors text-left w-full flex items-center space-x-3"
            >
              <PencilRuler />
              <span>Website Editor</span>
              {isDropdownOpen ? <ChevronUp className="ml-auto" /> : <ChevronDown className="ml-auto" />}
            </button>

            {/* Render dropdown items if open */}
            {isDropdownOpen && (
                <div className="bg-gray-100 mt-2 space-y-2 rounded shadow-md">
                  {dropdownItems.map((item, index) => (
                      <button
                          key={index}
                          onClick={() => {
                            setActiveComponent(item.name);
                            setIsDropdownOpen(false); // Close dropdown on selection
                          }}
                          className="bg-white text-black py-2 px-4 rounded hover:bg-cyan-600 hover:text-white transition-colors text-left w-full flex space-x-3"
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </button>
                  ))}
                </div>
            )}
          </div>

          {/* Working Areas with Sub-items */}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* Conditionally render the active component */}
          {getActiveComponent(activeComponent)}
        </div>
      </div>
  );
};

export default Menu;
