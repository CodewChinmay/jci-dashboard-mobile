import { useEffect, useState } from "react";
import { RefreshCcw, Trash2, MoveLeft, UserPlus, Ban } from "lucide-react";
import axios from "axios";
import "./pdf.css";

const registrations = () => {
    const [data, setData] = useState([]); // Store all member data
    const [headers, setHeaders] = useState([]); // Store dynamic headers for table
    const [selectedRow, setSelectedRow] = useState(null); // Store selected row for detailed view

    // Fetch data from the API
    const getData = async (type = "all") => {
        try {
            let url = "http://localhost:5000/api/v1/membership/getforms";
            if (type === "old") {
                url = "http://localhost:5000/api/v1/membership/getforms?old=true";
            }
            const response = await fetch(url);
            const fetchedData = await response.json();
            setData(fetchedData);

            if (fetchedData && fetchedData.length > 0) {
                // Dynamically extract headers from the first data item
                const extractHeaders = (item) => {
                    const getAllKeys = (obj, prefix = "") =>
                        Object.keys(obj).reduce((acc, key) => {
                            const newKey = prefix ? `${prefix}.${key}` : key;
                            if (
                                typeof obj[key] === "object" &&
                                obj[key] !== null &&
                                !Array.isArray(obj[key])
                            ) {
                                return [...acc, ...getAllKeys(obj[key], newKey)];
                            }
                            return [...acc, newKey];
                        }, []);
                    return getAllKeys(item);
                };

                const uniqueHeaders = [
                    ...new Set(
                        extractHeaders(fetchedData[0]).filter(
                            (header) => !header.toLowerCase().includes("id")
                        )
                    ),
                ];
                setHeaders(uniqueHeaders);
            }
        } catch (error) {
            console.error(`Error fetching data: ${error}`);
        }
    };

    // Handle Highlight (Accept Member)
    const handleHighlight = async (Formid, currentStatus) => {
        const newStatus = !currentStatus; // Toggle between true/false

        try {
            // Make the API request to update the highlight status using Formid
            const response = await axios.patch(
                `http://localhost:5000/api/v1/membership/highlight/${Formid}`,
                { highlighted: newStatus } // Correct structure for the request body
            );

            if (response.status === 200) {
                // Update the state immediately after the change is made
                setData((prevData) =>
                    prevData.map((member) =>
                        member.Formid === Formid ? { ...member, highlighted: newStatus } : member
                    )
                );

                alert(`Member ${newStatus ? "highlighted" : "unhighlighted"} successfully!`);
            } else {
                alert("Failed to update highlighted status.");
            }
        } catch (error) {
            console.error("Error updating highlight status:", error);
            alert("An error occurred while updating the highlighted status.");
        }
    };

    // Delete a member by ID
    const deleteMember = async (formid) => {
        // Ask for confirmation before proceeding with the deletion
        const confirmDelete = window.confirm("Are you sure you want to delete this member?");

        if (!confirmDelete) {
            return; // If the user clicks "No", don't delete the member
        }

        try {
            console.log("Deleting member with Formid:", formid);

            // Send the DELETE request to the backend
            const response = await fetch(
                `http://localhost:5000/api/v1/membership/delete/${formid}`,
                {
                    method: "DELETE",
                }
            );

            if (response.ok) {
                alert("Member successfully deleted!");
                // Remove the deleted member from the local state to immediately reflect changes
                setData((prevData) => prevData.filter((item) => item.Formid !== formid));
                closeModal(); // Close modal after deletion
            } else {
                const error = await response.json();
                console.error("Error deleting member:", error.message);
                alert(`Failed to delete the member: ${error.message}`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while deleting the member.");
        }
    };

    useEffect(() => {
        getData(); // Fetch data on initial load
    }, []);

    // Helper function to get nested values for table cells
    const getNestedValue = (obj, path) =>
        path
            .split(".")
            .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : "N/A"), obj);

    // Open the detailed view modal for a specific row
    const openModal = (row) => {
        setSelectedRow(row);
    };

    // Close the modal
    const closeModal = () => {
        setSelectedRow(null);
    };

    // Table View
    if (!data || data.length === 0) {
        return <div className="text-center text-gray-500">No data available</div>;
    }

    if (selectedRow) {
        return (
            <div
                className="p-6 bg-gray-100 overflow-hidden overflow-y-scroll"
                style={{
                    height: "calc(100vh - 80px)", // Dynamically calculate height
                }}
            >
                <div className="buttons flex space-x-4 mb-4">
                    <button
                        className="px-6 py-2 bg-blue-500 text-white rounded-md flex items-center"
                        onClick={closeModal}
                    >
                        <MoveLeft className="mr-2" />
                        Close
                    </button>
                    <button
                        className="px-6 py-2 bg-red-500 text-white rounded-md flex items-center"
                        onClick={() => {
                            console.log(selectedRow.Formid);
                            deleteMember(selectedRow.Formid); // Ensure Id is correctly passed
                        }}
                    >
                        <Trash2 className="mr-2" />
                        Delete
                    </button>

                    <button
                        className={`px-6 py-2 rounded-md flex items-center ${
                            selectedRow.highlighted ? "bg-green-600" : "bg-gray-400"
                        } text-white`}
                        onClick={() => {
                            console.log(selectedRow.Formid);
                            handleHighlight(selectedRow.Formid, selectedRow.highlighted);
                        }} // Accept Member / Highlight
                    >
                        <UserPlus className="mr-2" />
                        {selectedRow.highlighted ? "Member Accepted" : "Accept Member"}
                    </button>
                </div>

                <div id="pdf-content" className="bg-white mx-auto p-6 border-4 border-cyan-600">
                    {/* Personal Information Section */}
                    <section className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b-2 border-cyan-700 pb-2">
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <strong>Name:</strong> <span>{selectedRow.Name || "N/A"}</span>
                            </div>
                            <div>
                                <strong>D.O.B:</strong> <span>{selectedRow.Dob || "N/A"}</span>
                            </div>
                            <div>
                                <strong>Mobile Number:</strong>{" "}
                                <span>{selectedRow.Mobileno || "N/A"}</span>
                            </div>
                            <div>
                                <strong>Blood Group:</strong> <span>{selectedRow.Bloodgroup || "N/A"}</span>
                            </div>
                            <div>
                                <strong>Education:</strong> <span>{selectedRow.Education || "N/A"}</span>
                            </div>
                            <div>
                                <strong>Postal Address:</strong> <span>{selectedRow.Postaladdress || "N/A"}</span>
                            </div>
                        </div>
                    </section>

                    {/* Family Details Section */}
                    <section className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b-2 border-cyan-700 pb-2">
                            Family Details
                        </h3>
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <strong>Married Status:</strong> <span>{selectedRow.Mstatus || "N/A"}</span>
                            </div>
                            <div>
                                <strong>Wife's Name:</strong> <span>{selectedRow.Wifename || "N/A"}</span>
                            </div>
                            <div>
                                <strong>Wife's D.O.B:</strong> <span>{selectedRow.Wdob || "N/A"}</span>
                            </div>
                            <div>
                                <strong>Wife's Mobile Number:</strong>{" "}
                                <span>{selectedRow.Wmobileno || "N/A"}</span>
                            </div>
                            <div>
                                <strong>Child's Name:</strong> <span>{selectedRow.Childname || "N/A"}</span>
                            </div>
                        </div>
                    </section>

                    {/* Professional Information Section */}
                    <section className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b-2 border-cyan-700 pb-2">
                            Professional Information
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <strong>Occupation:</strong>{" "}
                                <span>{selectedRow.Occupation || "N/A"}</span>
                            </div>
                            <div>
                                <strong>Occupation Details:</strong>{" "}
                                <span>{selectedRow.Occupationdetail || "N/A"}</span>
                            </div>
                        </div>
                    </section>

                    {/* Additional Information Section */}
                    <section className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b-2 border-cyan-700 pb-2">
                            Additional Information
                        </h3>
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <strong>Address:</strong> <span>{selectedRow.Address || "N/A"}</span>
                            </div>
                            <div>
                                <strong>Expectations:</strong>{" "}
                                <span>{selectedRow.Expectation || "N/A"}</span>
                            </div>
                            <div>
                                <strong>JC Name:</strong> <span>{selectedRow.Jcname || "N/A"}</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 overflow-hidden overflow-x-scroll scrollbar-custom" style={{ width: "calc(100vw - 300px)" }}>
            <div className="flex items-center mb-5" >
                <h1 className="text-xl font-semibold">Form Registrations</h1>
                <button
                    className="ml-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    onClick={() => getData()}
                >
                    <RefreshCcw />
                </button>
            </div>
            <table className="" >
                <thead>
                <tr className="bg-gray-100">
                    <th className="py-2 px-4 whitespace-nowrap">SR No.</th>
                    {headers.map((header) => (
                        <th key={header} className="py-2 px-4">
                            {header.replace(/_/g, " ")}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((item, index) => (
                    <tr
                        key={index}
                        className={`hover:bg-gray-200 cursor-pointer ${item.highlighted ? "bg-green-300" : ""}`} // Green if highlighted
                        onClick={() => openModal(item)}
                    >
                        <td className="py-2 px-4">{index + 1}</td>
                        {headers.map((header) => (
                            <td key={header} className="py-2 px-4 whitespace-nowrap">
                                {getNestedValue(item, header)}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default registrations;
