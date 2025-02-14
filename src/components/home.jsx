import React, { useEffect, useState } from "react";
import { Users, Star, UserRoundX } from "lucide-react";

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
        setter([]); // Ensure state is always set even on error
      }
    }

    fetchData("https://jciamravati.in/api/v1/membership/getforms", setPackages);
    fetchData("https://jciamravati.in/api/v1/membership/generalmembers", setReview);
    fetchData("https://jciamravati.in/api/v1/membership/Rejectedmembers", setBlogs);
    fetchData("https://triphouse.co.in/api/v1/contact/getdata", setData);
  }, []);

  // Dashboard statistics configuration
  const stats = [
    {
      title: "Registration Requests",
      count: packages.length,
      icon: <Users className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-100",
    },
    {
      title: "General Members",
      count: review.length,
      icon: <Star className="w-6 h-6 text-green-600" />,
      bg: "bg-green-100",
    },
    {
      title: "Rejected Members",
      count: blogs.length,
      icon: <UserRoundX className="w-6 h-6 text-red-600" />,
      bg: "bg-red-100",
    },
    // Uncomment and update the code below if needed:
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
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            onClick={() => {
              setActiveContent(stat.title);
              if (stat.redirectUrl) {
                window.location.href = stat.redirectUrl;
              }
            }}
            className="flex justify-between bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-full flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-700">{stat.title}</h3>
              </div>
            </div>
            {!stat.redirectUrl && (
              <p className="text-4xl font-bold text-gray-900">{stat.count}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
