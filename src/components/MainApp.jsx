import React, { useState } from 'react';
import Navbar from './navbar.jsx'
import Menu from './Sidebar.jsx'

function App() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
      <div>
        <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}  />
        <Menu isOpen={isSidebarOpen} />
      </div>
  );
}

export default App
