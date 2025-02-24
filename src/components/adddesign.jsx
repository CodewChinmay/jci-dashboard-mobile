import React, { useState, useEffect } from "react";
import { Trash, PlusCircle } from "lucide-react";

const adddesign = () => {
    const [designations, setDesignations] = useState([]);
    const [newDesignation, setNewDesignation] = useState("");
    const [loading, setLoading] = useState(false);

    // Base API URL for designation endpoints
    const API_URL = "https://jciamravati.in/api/v1/designation";

    // Fetch all designations from the backend API
    const fetchDesignations = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/getdesign`);
            if (!response.ok) {
                throw new Error("Failed to fetch designations");
            }
            const data = await response.json();
            setDesignations(data);
        } catch (error) {
            console.error("Error fetching designations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDesignations();
    }, []);

    // Add a new designation using the backend API
    const handleAddDesignation = async (e) => {
        e.preventDefault();
        if (!newDesignation.trim()) return;

        try {
            const response = await fetch(`${API_URL}/createdesign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ designation: newDesignation.trim() }),
            });
            if (!response.ok) {
                throw new Error("Failed to add designation");
            }
            const createdDesignation = await response.json();
            // Update the local list with the new designation
            setDesignations((prev) => [...prev, createdDesignation]);
            setNewDesignation("");
        } catch (error) {
            console.error("Error adding designation:", error);
        }
    };

    // Delete a designation using the backend API
    const handleDeleteDesignation = async (id) => {
        try {
            const response = await fetch(`${API_URL}/deletedesign/${id}`, {
                method: "GET", // Note: deletion is implemented as a GET request per your routes
            });
            if (!response.ok) {
                throw new Error("Failed to delete designation");
            }
            // Remove the designation from the local state
            setDesignations((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            console.error("Error deleting designation:", error);
        }
    };

    return (
        <div className=" flex items-center">
            <div className="bg-white w-full">
                <div className="p-6">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                        Designations
                    </h1>

                    <form onSubmit={handleAddDesignation} className="flex mb-6">
                        <input
                            type="text"
                            placeholder="Enter new designation"
                            value={newDesignation}
                            onChange={(e) => setNewDesignation(e.target.value)}
                            className="w-full border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                            type="submit"
                            className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-r-lg px-4 py-2 flex items-center"
                        >
                            <PlusCircle size={20} className="mr-1" />
                            Add
                        </button>
                    </form>

                    {loading ? (
                        <p className="text-center text-gray-600">Loading designations...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Designation
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {designations.map((designation) => (
                                    <tr key={designation.id} className="hover:bg-gray-100">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                            {designation.designation}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDeleteDesignation(designation.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default adddesign;
