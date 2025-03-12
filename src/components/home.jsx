import React, { useEffect, useState } from "react";
import { Package, Users, Star, UserPlus, UserRoundX } from "lucide-react";

export default function Home({ setActiveContent }) {
    const [packages, setPackages] = useState([]);
    const [review, setReview] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [data, setData] = useState([]);

    useEffect(() => {
        async function fetchData(url, setter, requiresData = false) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch data");
                const result = await response.json();
                console.log(result);
                setter(requiresData ? result.data || [] : result || []);
            } catch (error) {
                console.error("Error fetching data:", error);
                setter([]);
            }
        }

        fetchData("https://jciamravati.in/api/v1/membership/getforms", setPackages);
        fetchData("https://jciamravati.in/api/v1/membership/generalmembers", setReview);
        fetchData("https://jciamravati.in/api/v1/membership/Rejectedmembers", setBlogs);
        fetchData("https://triphouse.co.in/api/v1/contact/getdata", setData);
    }, []);

    const stats = [
        {
            title: "Registration Requests",
            count: packages.length,
            icon: <Users className="w-6 h-6 text-white" />,
            bg: "bg-blue-400",
        },
        {
            title: "General Members",
            count: review.length,
            icon: <Star className="w-6 h-6 text-white" />,
            bg: "bg-green-400",
        },
        {
            title: "Rejected Members",
            count: blogs.length,
            icon: <UserRoundX className="w-6 h-6 text-white" />,
            bg: "bg-red-400",
        },
        // Uncomment if needed:
        // {
        //   title: "Contact",
        //   count: data.length,
        //   icon: <UserPlus className="w-6 h-6 text-purple-600" />,
        //   bg: "bg-purple-100",
        // },
        // {
        //   title: "Visit Website",
        //   count: 0,
        //   icon: <Globe className="w-6 h-6 text-green-600" />,
        //   bg: "bg-green-100",
        //   redirectUrl: "https://triphouse.co.in/",
        // },
    ];

    return (
        <>
            <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
            <div
                className="p-2 hide-scrollbar"
                style={{ height: "calc(100vh - 180px)", overflowY: "scroll" }}
            >
                <h1 className="text-2xl font-bold text-gray-800 mb-5">Dashboard</h1>
                <div className="grid grid-cols-1 gap-4">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center justify-between p-4 rounded-md shadow-md transition-shadow duration-200 cursor-pointer bg-white hover:shadow-lg"
                            onClick={() => {
                                setActiveContent(stat.title);
                                if (stat.redirectUrl) {
                                    window.location.href = stat.redirectUrl;
                                }
                            }}
                        >
                            <div className="flex flex-col items-center space-y-2">
                                <div
                                    className={`w-12 h-12 ${stat.bg} rounded-full flex items-center justify-center`}
                                >
                                    {stat.icon}
                                </div>
                                <h3 className="text-lg font-medium text-gray-800">
                                    {stat.title}
                                </h3>
                            </div>
                            {stat.redirectUrl ? null : (
                                <p className="text-3xl font-bold text-gray-800 mt-4">
                                    {stat.count}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
