import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '../assets/jciamravati.png';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (userId === 'jci123' && password === '123') {
      navigate('/main'); // Navigate to MainApp
    } else {
      setError('Invalid User ID or Password');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
        <img src={logo} alt="" className='w-[160px] mb-3' />
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Login</h2>
        <form onSubmit={handleLogin} className="mt-4 w-full">
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="mb-3">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="userId">
              User ID
            </label>
            <input
              id="userId"
              type="text"
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
