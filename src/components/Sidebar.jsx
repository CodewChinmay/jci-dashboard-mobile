"use client"

import { useState, useEffect } from "react"
import { Users, UserRoundX, UserRoundCheck, HomeIcon, Briefcase, ImagePlus, PencilRuler, UserRoundPlus  } from "lucide-react"
import Formregistrations from "./formregistrations.jsx"
import Addmember from "./addmember.jsx"
import Registrations from "./registrations.jsx"
import RejectedForms from "./Rejectedmembers.jsx"
import Gallery from "./gallery.jsx"
import Carousel from "./carousel.jsx"
import Workingtab from "./workingtab.jsx"
import Teamtab from "./teamtab.jsx"
import Home from "./home.jsx"

const sidebarItems = [
  { title: "Home", Content: Home, Icon: HomeIcon },
  { title: "Registration Requests", Content: Registrations, Icon: Users },
  { title: "Add Member", Content: Addmember, Icon: UserRoundPlus  },
  { title: "General Members", Icon: UserRoundCheck, Content: Formregistrations },
  { title: "Rejected Members", Icon: UserRoundX, Content: RejectedForms },
  { title: "Board Member", Icon: Briefcase, Content: Teamtab },
  { title: "Gallery", Icon: ImagePlus, Content: Gallery },
  { title: "Carousel", Icon: ImagePlus, Content: Carousel },
  { title: "Working Areas", Icon: PencilRuler, Content: Workingtab },
]

function Sidebar({ isOpen: propIsOpen }) {
  // Initialize activeContent from localStorage or default to the first sidebar item
  const [activeContent, setActiveContent] = useState(() => {
    const savedActiveContent = localStorage.getItem("activeContent")
    return savedActiveContent ? JSON.parse(savedActiveContent) : sidebarItems[0].title
  })

  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(propIsOpen)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  useEffect(() => {
    setIsOpen(propIsOpen)
    if (isMobile) {
      // Optionally, you can adjust the logic for mobile here
    }
  }, [propIsOpen, isMobile])

  // Persist activeContent to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("activeContent", JSON.stringify(activeContent))
  }, [activeContent])

  const getContent = (title) => {
    const item = sidebarItems.find((item) => item.title === title)
    return item ? <item.Content setActiveContent={setActiveContent} /> : null
  }

  const renderSidebarContent = () => (
    <div
      className={`sidebar bg-gray-200 ${
        isOpen ? "w-64" : "w-20"
      } flex flex-col shadow-md pt-4 space-y-3 transition-all duration-300 pr-5 ${
        isMobile ? "fixed top-50 h-full left-0 z-50 transform" : "h-full"
      } ${isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"}`}
    >
      {/* Hide first four items in mobile sidebar */}
      {!isMobile &&
        sidebarItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveContent(item.title)
              if (isMobile) setIsOpen(false)
            }}
            className={`flex items-center ${
              isOpen ? "justify-start space-x-3 whitespace-nowrap" : "justify-center"
            } py-2 px-4 text-left transition-colors duration-200 ease-in-out rounded-r-full text-md 
              ${
                activeContent === item.title
                  ? "bg-cyan-600 text-white whitespace-nowrap"
                  : "text-gray-700 hover:bg-gray-300"
              }`}
          >
            <item.Icon className={`transition-all duration-300 w-6 h-6`} />
            {isOpen && <span className="font-medium">{item.title}</span>}
          </button>
        ))}

      {/* Show only items from index 4 onward in mobile sidebar */}
      {isMobile &&
        sidebarItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveContent(item.title)
              setIsOpen(false)
            }}
            className={`flex items-center ${
              isOpen ? "justify-start space-x-3 whitespace-nowrap" : "justify-center"
            }  py-2 px-4 text-left transition-colors duration-200 ease-in-out rounded-r-full text-md 
              ${
                activeContent === item.title
                  ? "bg-cyan-600 text-white whitespace-nowrap"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
          >
            <item.Icon className={`transition-all duration-300 w-6 h-6`} />
            {isOpen && <span className="font-medium">{item.title}</span>}
          </button>
        ))}
    </div>
  )

  return (
    <div className={`flex ${isMobile ? "flex-col" : "h-[calc(100vh-5rem)]"}`}>
      {isMobile && (
        <button onClick={() => setIsOpen(!isOpen)} className="">
          {/* <Menu className="w-6 h-6" /> */}
        </button>
      )}
      {renderSidebarContent()}
      <div
        className={`content flex-1 overflow-y-auto bg-white ${isMobile ? "pt-16 pb-20 px-4" : ""}`}
      >
        {getContent(activeContent)}
      </div>
    </div>
  )
}

export default Sidebar
