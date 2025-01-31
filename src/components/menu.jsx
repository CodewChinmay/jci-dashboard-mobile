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
import Sidebar from "./dashboard.jsx";
import Formregistrations from "./formregistrations.jsx";
import Registrations from "./registrations.jsx";
import RejectedForms from './Rejectedmembers.jsx';
import Gallery from "./gallery.jsx";
import Carousel from "./carousel.jsx";
import Team from "./team.jsx";
import Workingareas from "./workingareas.jsx";
import Header from "./Header.jsx";
import bizologo from "@/assets/bizonancelogo.png";

import Workingtab from "./workingtab.jsx";
import Teamtab from "./teamtab.jsx";

const Menu = () => {
  const [activeComponent, setActiveComponent] = useState("Dashboard");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} />, component: <Sidebar /> },
    { name: "Registration Requests", icon: <Users size={20} />, component: <Registrations /> },
    { name: "General Members", icon: <UserRoundCheck size={20} />, component: <Formregistrations /> },
    { name: "Rejected Members", icon: <UserRoundX size={20} />, component: <RejectedForms /> }
  ];

  const dropdownItems = [
    // { name: "Header", icon: <Pencil size={18} />, component: <Header /> },
    { name: "Team", icon: <Briefcase size={18} />, component: <Teamtab /> },
    { name: "Gallery", icon: <ImagePlus size={18} />, component: <Gallery /> },
    { name: "Carousel", icon: <ImagePlus size={18} />, component: <Carousel /> },
    { name: "Working Areas", icon: <PencilRuler size={18} />, component: <Workingtab /> }
  ];

  const getActiveComponent = (name) => {
    const item = [...menuItems, ...dropdownItems].find(
        (item) => item.name === name
    );
    return item ? item.component : <Dashboard />;
  };

  return (
      <div className="flex bg-gray-200" style={{ height: "calc(100vh - 80px)" }}>
        {/* Menu Sidebar */}

        <div className="menu   min-w-[280px] shadow-xl shadow-gray-1000 flex flex-col pt-4 pr-5  border-gray-200">
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-1">
              {/* Main Menu Items */}
              {menuItems.map((item, index) => (
                  <button
                      key={index}
                      onClick={() => {
                        setActiveComponent(item.name);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-r-full transition-all duration-200
                  ${activeComponent === item.name
                          ? "bg-cyan-600 text-white shadow-md rounded-r-full"
                          : "text-gray-600 hover:bg-gray-200 hover:text-gray-800"}`}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.name}</span>
                  </button>
              ))}

              {/* Dropdown Section */}
              <div className="mt-6">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3  transition-all duration-200
                  ${isDropdownOpen ? "" : "text-gray-600 hover:bg-gray-200"}`}
                >
                  <div className="flex items-center space-x-3">
                    <PencilRuler size={20} />
                    <span className="text-sm font-medium">Website Editor</span>
                  </div>
                  {isDropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {/* Dropdown Items */}
                {isDropdownOpen && (
                    <div className=" space-y-2 rounded-lg ">
                      {dropdownItems.map((item, index) => (
                          <button
                              key={index}
                              onClick={() => {
                                setActiveComponent(item.name);
                                setIsDropdownOpen(true);
                              }}
                              className={`w-full flex items-center space-x-3 px-4 py-2.5 transition-all duration-200
                        ${activeComponent === item.name
                                  ? "bg-cyan-600 text-white shadow-md rounded-r-full"
                                  : "text-gray-600 hover:bg-gray-200 hover:text-gray-600"}`}
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

          {/*<div className="div flex">*/}
          {/*  <p>Designed and Managed by</p>*/}
          {/*  <img src={bizologo} className="w-12" alt=""/>*/}
          {/*</div>*/}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-0 bg-gradient-to-r from-gray-200 via-gray-100/90 to-white">
          <div className="">
            {getActiveComponent(activeComponent)}
          </div>
        </div>
      </div>
  );
};

export default Menu;