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
    { title: "Gallery Section", Icon: Images, Content: Gallery },
    { title: "Working Areas", Icon: PencilRuler, Content: Workingtab },
    { title: "Site Preview", Icon: Eye, Content: Siteframe },
    { title: "Help Center", Icon: CircleHelp, Content: Help },
]

function Sidebar({ isOpen: propIsOpen }) {
    // Set activeContent to "Home" by default without using localStorage
    const [activeContent, setActiveContent] = useState("Home")
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
    }, [propIsOpen, isMobile])

    const getContent = (title) => {
        const item = sidebarItems.find((item) => item.title === title)
        return item ? <item.Content setActiveContent={setActiveContent} /> : null
    }

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
                        isActive ? "bg-cyan-600 text-white whitespace-nowrap w-full" : `text-gray-700 w-full ${hoverBg}`
                    }`}
                    title={item.title}
                >
                    <item.Icon className="transition-all duration-300 w-6 h-6" />
                    {isOpen && <span className="font-medium">{item.title}</span>}
                </button>
            </div>
        )
    }

    const renderSidebarContent = () => (
        <div
            className={`sidebar bg-gray-200 ${
                isOpen ? "w-64" : "w-20"
            } flex flex-col shadow-md pt-4 space-y-3 transition-all duration-300  ${
                isMobile ? "fixed top-50 h-full left-0 z-20 transform" : "h-full"
            } ${isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"}`}
        >
            {!isMobile && sidebarItems.map((item, index) => renderSidebarButton(item, index))}
            {isMobile && sidebarItems.slice(0).map((item, index) => renderSidebarButton(item, index))}
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
            <div className={`content flex-1 ${isMobile ? "" : ""}`}>
                {getContent(activeContent)}
            </div>
        </div>
    )
}

export default Sidebar
