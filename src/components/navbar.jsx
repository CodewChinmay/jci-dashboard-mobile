import React from "react";
import logo from '../assets/jciamravati.png';
import { LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="navbar flex items-center justify-between border-b-4 border-cyan-500 p-4 h-[80px]">
      <div className="flex items-center space-x-4">
        {/* Menu Icon to Toggle Sidebar */}
        <Menu
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          size={50}
          className={`rounded-full hover:bg-gray-200 h-12 w-12 p-2 cursor-pointer ${
            isSidebarOpen ? "bg-gray-100" : "bg-transparent"
          }`}
        />
        <img src={logo || "/placeholder.svg"} alt="JCI Logo" className="h-[60px]" />
      </div>

      <div>
        {/* Logout Icon */}
        <LogOut
          onClick={handleLogout}
          size={50}
          className="text-gray-600 hover:bg-gray-200 h-11 w-11 p-2 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Navbar;