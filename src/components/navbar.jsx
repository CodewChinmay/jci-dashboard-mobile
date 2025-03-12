import React, { useState } from "react";
import logo from '../assets/jci.png';
import { LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleLogout = () => {
        setShowConfirm(true);
    };

    const confirmLogout = () => {
        setShowConfirm(false);
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

            {/* Logout Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <p className="text-lg font-semibold">Are you sure you want to log out?</p>
                        <div className="flex justify-center mt-4 space-x-4">
                            <button
                                onClick={confirmLogout}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Logout
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;
