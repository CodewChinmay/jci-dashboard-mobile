import React from "react";
import logo from '../assets/jciamravati.png';
import { LogOut, RefreshCw, Menu } from 'lucide-react'; // Use PascalCase for imported icons

import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    navigate('/');
  }
  return (
    <div className="navbar flex items-center justify-between p-4 shadow-lg h-[80px]">
      <div className="div flex place-items-center space-x-3">


        <Menu className="w-10 h-10 p-2 transition rounded-full hover:bg-gray-200"/>
        <img src={logo} alt="JCI Logo" className="logo h-[50px]" />
      </div>
      <div className="div">
      {/* <RefreshCw size={50} className="shadow-xl bg-blue-200 rounded text-dark hover:text-white hover:bg-gray-600 p-2 h-9 w-9"/> Use the LogOut icon as a component */}

      <LogOut onClick={handleLogout} size={50} className="shadow-xl bg-blue-200 rounded text-dark hover:text-white hover:bg-gray-600 p-2 h-9 w-9"/> {/* Use the LogOut icon as a component */}
      </div>
     
    </div>
  );
};

export default Navbar;
