import React, { useState } from "react";




const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState("dashboard");

  return (
    <div className="dashboard flex flex-col space-y-3 p-4">
      {activeComponent === "dashboard" && (
        <>
          <h1 className="text-2xl">Dashboard</h1>
          <div
            className="forms bg-cyan-500 h-[120px] w-[250px] cursor-pointer"
            onClick={() => setActiveComponent("formregistrations")}
          >
            <h1 className="text-white p-3 text-2xl">Member Registrations</h1>
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
