import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./components/login.jsx"
import MainApp from './components/MainApp.jsx';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<MainApp />} />
      </Routes>
    </Router>
  );
};

export default App;
