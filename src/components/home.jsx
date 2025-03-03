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
                console.log(result)
                setter(requiresData ? result.data || [] : result || []);
            } catch (error) {
                console.error("Error fetching data:", error);
                setter([]); // Ensure state is always set

            }
        }

        fetchData("https://jciamravati.in/api/v1/membership/getforms", setPackages, false);
        fetchData("https://jciamravati.in/api/v1/membership/generalmembers", setReview);
        fetchData("https://jciamravati.in/api/v1/membership/Rejectedmembers", setBlogs);
        fetchData("https://triphouse.co.in/api/v1/contact/getdata", setData);
    }, []);

    const stats = [
        { title: "Registration Requests", count: packages.length, icon: <Users className="w-6 h-6 text-white" />, bg: "bg-blue-400" },
        { title: "General Members", count: review.length, icon: <Star className="w-6 h-6 text-white" />, bg: "bg-green-400" },
        { title: "Rejected Members", count: blogs.length, icon: <UserRoundX className="w-6 h-6 text-white" />, bg: "bg-red-400" },
        // { title: "Contact", count: data.length, icon: <UserPlus className="w-6 h-6 text-purple-600" />, bg: "bg-purple-100" },
        // { title: "Visit Website", count: 0, icon: <Globe className="w-6 h-6 text-green-600" />, bg: "bg-green-100", redirectUrl: "https://triphouse.co.in/" }
    ];

    return (
        <div className="min-h-screen p-2 px-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-5">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="text-cyan-600 p-6 rounded-md shadow-[0_0_30px_rgba(0,0,0,0.2)] transition-shadow duration-200 flex justify-between items-center cursor-pointer"
                        onClick={() => {
                            setActiveContent(stat.title);
                            if (stat.redirectUrl) {
                                window.location.href = stat.redirectUrl;
                            }
                        }}
                    >

                    <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                {stat.icon}
                            </div>
                            <h3 className="text-lg font-medium text-black white">{stat.title}</h3>
                        </div>
                        {stat.redirectUrl ? null : (
                            <p className="text-3xl font-bold text-black">{stat.count}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}