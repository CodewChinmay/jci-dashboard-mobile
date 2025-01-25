import React, { useState } from "react";
import Formregistrations from "./Formregistrations";

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState("dashboard");

  return (
    <div className="dashboard flex flex-col space-y-3 p-4">
      {activeComponent === "dashboard" && (
        <>
          <h1 className="text-2xl">This is Dashboard Section</h1>
          <div
            className="forms bg-blue-400 rounded h-[120px] w-[250px] cursor-pointer"
            onClick={() => setActiveComponent("formregistrations")}
          >
            <h1 className="text-white p-3 text-2xl">Member Registrations</h1>
          </div>
          <div
            className="gallery bg-blue-400 rounded h-[120px] w-[250px] cursor-pointer"
            onClick={() => alert("Gallery section clicked!")} // Placeholder for further logic
          >
            <h1 className="text-white p-3 text-2xl">Gallery</h1>
          </div>
          <div
            className="carousel bg-blue-400 rounded h-[120px] w-[250px] cursor-pointer"
            onClick={() => alert("Carousel section clicked!")} // Placeholder for further logic
          >
            <h1 className="text-white p-3 text-2xl">Carousel</h1>
          </div>
        </>
      )}
      {activeComponent === "formregistrations" && (
        <div>
          <Formregistrations />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
