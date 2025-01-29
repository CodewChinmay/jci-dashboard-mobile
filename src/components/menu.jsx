import React, { useState } from "react";
import {
  Home,
  Users,
  UserRoundCheck,
  Briefcase,
  ChevronDown,
  ChevronUp,
  PencilRuler,
  ImagePlus,
  Pencil,
  UserRoundX
} from "lucide-react";
import Dashboard from "./dashboard.jsx";
import Formregistrations from "./Formregistrations.jsx";
import Registrations from "./registrations.jsx";
import RejectedForms from './Rejectedmembers.jsx';
import Gallery from "./gallery.jsx";
import Carousel from "./carousel.jsx";
import Team from "./team.jsx";
import Workingareas from "./Workingareas.jsx";
import Header from "./Header.jsx";
import bizologo from "@/assets/bizonancelogo.png";

const Menu = () => {
  const [activeComponent, setActiveComponent] = useState("Dashboard");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} />, component: <Dashboard /> },
    { name: "Registration Requests", icon: <Users size={20} />, component: <Registrations /> },
    { name: "General Members", icon: <UserRoundCheck size={20} />, component: <Formregistrations /> },
    { name: "Rejected Members", icon: <UserRoundX size={20} />, component: <RejectedForms /> }
  ];

  const dropdownItems = [
    // { name: "Header", icon: <Pencil size={18} />, component: <Header /> },
    { name: "Team", icon: <Briefcase size={18} />, component: <Team /> },
    { name: "Gallery", icon: <ImagePlus size={18} />, component: <Gallery /> },
    { name: "Carousel", icon: <ImagePlus size={18} />, component: <Carousel /> },
    { name: "Working Areas", icon: <PencilRuler size={18} />, component: <Workingareas /> }
  ];

  const getActiveComponent = (name) => {
    const item = [...menuItems, ...dropdownItems].find(
        (item) => item.name === name
    );
    return item ? item.component : <Dashboard />;
  };

  return (
      <div className="flex bg-gray-50" style={{ height: "calc(100vh - 80px)" }}>
        {/* Menu Sidebar */}
        <div className="menu bg-white min-w-[280px] shadow-xl flex flex-col p-4 border-r border-gray-100">
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-1">
              {/* Main Menu Items */}
              {menuItems.map((item, index) => (
                  <button
                      key={index}
                      onClick={() => setActiveComponent(item.name)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${activeComponent === item.name
                          ? "bg-cyan-500 text-white shadow-md"
                          : "text-gray-600 hover:bg-blue-50 hover:text-cyan-600"}`}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.name}</span>
                  </button>
              ))}

              {/* Dropdown Section */}
              <div className="mt-6">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                  ${isDropdownOpen ? "bg-blue-50 text-cyan-600" : "text-gray-600 hover:bg-blue-50"}`}
                >
                  <div className="flex items-center space-x-3">
                    <PencilRuler size={20} />
                    <span className="text-sm font-medium">Website Editor</span>
                  </div>
                  {isDropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {/* Dropdown Items */}
                {isDropdownOpen && (
                    <div className="ml-8 space-y-2 pl-2 border-l-4 rounded-lg border-cyan-400">
                      {dropdownItems.map((item, index) => (
                          <button
                              key={index}
                              onClick={() => {
                                setActiveComponent(item.name);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200
                        ${activeComponent === item.name
                                  ? "bg-cyan-500 text-white shadow-md"
                                  : "text-gray-600 hover:bg-cyan-50 hover:text-cyan-600"}`}
                          >
                            {item.icon}
                            <span className="text-sm">{item.name}</span>
                          </button>
                      ))}
                    </div>
                )}
              </div>

            </div>

          </div>

          <div className="div flex">
            <p>Designed and Managed by</p>
            <img src={bizologo} className="w-12" alt=""/>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="">
            {getActiveComponent(activeComponent)}
          </div>
        </div>
      </div>
  );
};

export default Menu;