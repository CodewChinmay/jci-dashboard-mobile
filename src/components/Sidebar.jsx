"use client"

import { useState, useEffect } from "react"
import { Users, UserRoundX, UserRoundCheck, HomeIcon, Briefcase, ImagePlus, PencilRuler, Menu } from "lucide-react"
import Formregistrations from "./formregistrations.jsx"
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
  { title: "General Members", Icon: UserRoundCheck, Content: Formregistrations },
  { title: "Rejected Members", Icon: UserRoundX, Content: RejectedForms },
  { title: "Team", Icon: Briefcase, Content: Teamtab },
  { title: "Gallery", Icon: ImagePlus, Content: Gallery },
  { title: "Carousel", Icon: ImagePlus, Content: Carousel },
  { title: "Working Areas", Icon: PencilRuler, Content: Workingtab },
]

function Sidebar({ isOpen: propIsOpen}) {
  const [activeContent, setActiveContent] = useState(sidebarItems[0].title)
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
      propIsOpen:false
    }
  }, [propIsOpen],[isMobile])

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
              setActiveContent(item.title);
              if (isMobile) setIsOpen(false);
            }}
            className={`flex items-center ${
              isOpen ? "justify-start space-x-3 whitespace-nowrap" : "justify-center"
            } py-2 px-4 text-left transition-colors duration-200 ease-in-out rounded-r-full text-md 
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

      {/* Show only items from index 4 onward in mobile sidebar */}
      {isMobile &&
        sidebarItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveContent(item.title);
              setIsOpen(false);
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

  // const renderMobileBottomBar = () => (
  //   <div className="fixed bottom-0 left-0 right-0 bg-gray-100 shadow-md z-50">
  //     <div className="flex justify-around items-center h-16 px-1 space-x-4">
  //       {sidebarItems.slice(0, 4).map((item, index) => {
  //         const { Icon } = item
  //         return (
  //           <button
  //             key={index}
  //             onClick={() => setActiveContent(item.title)}
  //             className={`flex flex-col items-center justify-center h-full transition-colors duration-200 ease-in-out
  //               ${activeContent === item.title ? "bg-blue-300 text-white" : "text-gray-700"}`}
  //           >
  //             <Icon className="w-6 h-6 mb-1" />
  //             <span className="text-xs">{item.title}</span>
  //           </button>
  //         )
  //       })}
  //     </div>
  //   </div>
  // )

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
        style={{
          marginLeft: isMobile ? 0 : isOpen ? "" : "",
          transition: "",
        }}
      >
        {getContent(activeContent)}
      </div>
      {/* {isMobile && renderMobileBottomBar()} */}
    </div>
  )
}

export default Sidebar
