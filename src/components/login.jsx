import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import logo from "../assets/jciamravati.png"
import bizologo from "../assets/bizonancelogo.png"

const Login = () => {
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    if (userId === "jci123" && password === "123") {
      navigate("/main") // Navigate to MainApp
    } else {
      setError("Invalid User ID or Password")
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  return (
      <div className="flex justify-center flex-col items-center h-screen bg-gray-100">
        <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <img src={logo || "/placeholder.svg"} alt="" className="w-[160px] mb-3" />
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
              <div className="relative">
                <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login
            </button>
          </form>
        </div>

        <div className="div mt-4 place-items-center">
          <p>Designed and Managed by</p>
          <img src={bizologo || "/placeholder.svg"} className="w-12 mx-13 mt-3 " alt="" />
        </div>
      </div>
  )
}

export default Login