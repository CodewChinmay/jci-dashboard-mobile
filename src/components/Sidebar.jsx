"use client"

import { useState, useEffect } from "react"
import {
  Users,
  UserRoundX,
  UserRoundCheck,
  HomeIcon,
  Briefcase,
  ImagePlus,
  PencilRuler,
  UserRoundPlus,
  Eye,
  CircleHelp,
} from "lucide-react"
import { Images, User } from "pixora-icons"

import Formregistrations from "./formregistrations.jsx"
import Addmember from "./addmember.jsx"
import Registrations from "./registrations.jsx"
import RejectedForms from "./Rejectedmembers.jsx"
import Gallery from "./gallerytab.jsx"
import Carousel from "./carousel.jsx"
import Workingtab from "./workingtab.jsx"
import Teamtab from "./teamtab.jsx"
import Home from "./home.jsx"
import siteframe from "./siteframe.jsx"
import Siteframe from "./siteframe.jsx"
import Help from "./Helpcenter.jsx"

const sidebarItems = [
  { title: "Home", Content: Home, Icon: HomeIcon },
  { title: "Registration Requests", Content: Registrations, Icon: User },
  { title: "Add Member", Content: Addmember, Icon: UserRoundPlus },
  { title: "General Members", Icon: UserRoundCheck, Content: Formregistrations },
  { title: "Rejected Members", Icon: UserRoundX, Content: RejectedForms },
  { title: "Board Member", Icon: Briefcase, Content: Teamtab },
  { title: "Gallery", Icon: Images, Content: Gallery },
  { title: "Sliding Images", Icon: Images, Content: Carousel },
  { title: "Working Areas", Icon: PencilRuler, Content: Workingtab },
  { title: "Site Preview", Icon: Eye, Content: Siteframe },
  { title: "Help Center", Icon: CircleHelp, Content: Help },
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

  // Renders each sidebar button with a custom tooltip (visible only when sidebar is collapsed)
  const renderSidebarButton = (item, index) => {
    const hoverBg = isMobile ? "hover:bg-gray-200" : "hover:bg-gray-300"
    const isActive = activeContent === item.title

    return (
        <div key={index} className="relative group">
          <button
              onClick={() => {
                setActiveContent(item.title)
                if (isMobile) setIsOpen(false)
              }}
              className={`flex items-center ${
                  isOpen ? "justify-start space-x-3 whitespace-nowrap" : "justify-center"
              } py-2 px-4 text-left transition-colors duration-200 ease-in-out rounded-r-full text-md ${
                  isActive ? "bg-cyan-600 text-white whitespace-nowrap" : `text-gray-700 ${hoverBg}`
              }`}
              title={item.title} // Fallback native tooltip for accessibility
          >
            <item.Icon className="transition-all duration-300 w-6 h-6" />
            {isOpen && <span className="font-medium">{item.title}</span>}
          </button>
          {/* Custom tooltip appears only when sidebar is collapsed */}
          {!isOpen && (
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {item.title}
              </div>
          )}
        </div>
    )
  }

  const renderSidebarContent = () => (
      <div
          className={`sidebar bg-gray-200 ${
              isOpen ? "w-64" : "w-20"
          } flex flex-col shadow-md pt-4 space-y-3 transition-all duration-300 pr-5 ${
              isMobile ? "fixed top-50 h-full left-0 z-50 transform" : "h-full"
          } ${isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"}`}
      >
        {/* For non-mobile, render all items */}
        {!isMobile &&
            sidebarItems.map((item, index) => renderSidebarButton(item, index))}

        {/* For mobile, show only items from index 4 onward as per the comment */}
        {isMobile &&
            sidebarItems.slice(4).map((item, index) => renderSidebarButton(item, index))}
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
            className={`content flex-1 overflow-y-auto bg-white ${
                isMobile ? "pt-16 pb-20 px-4" : ""
            }`}
        >
          {getContent(activeContent)}
        </div>
      </div>
  )
}

export default Sidebar
