import React, { useState, useEffect } from "react";
import { RefreshCcw, FileX2, FileCheck2 } from "lucide-react";
import "./pdf.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Section = ({ title, children }) => (
    <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center pb-2 border-b border-gray-200">
            {title}
        </h3>
        {children}
    </section>
);

const InfoGrid = ({ cols = "3", children }) => (
    <div className={`grid grid-cols-3 md:grid-cols-${cols} gap-4`}>
        {children}
    </div>
);

const InfoItem = ({ label, value }) => (
    <div className="space-y-1">
        <span className="block text-sm font-medium text-gray-500">{label}</span>
        <p className="text-gray-800">{value || "N/A"}</p>
    </div>
);

const registrations = () => {
    // State variables
    const [data, setData] = useState([]); // Store fetched data
    const [selectedRow, setSelectedRow] = useState(null); // Store the selected row for modal
    const [loading, setLoading] = useState(true); // Track loading state
    const [showRejectPopup, setShowRejectPopup] = useState(false); // Show/hide reject popup
    const [rejectReason, setRejectReason] = useState(""); // Store reject reason
    const [showAcceptPopup, setShowAcceptPopup] = useState(false); // Show/hide accept popup

    // Fixed table columns for listing in table view
    const tableColumns = [
        { label: "Name", key: "Name" },
        { label: "D.O.B", key: "Dob" },
        { label : "Occupation", key: "Occupation" },
        { label: "Mobile Number", key: "Mobileno" },
        { label: "JC Name", key: "Jcname" },

    ];

    // Fetch data from the API
    const getData = async () => {
        try {
            setLoading(true); // Set loading to true before fetching
            const response = await fetch("https://jciamravati.in/api/v1/membership/getforms");
            const fetchedData = await response.json();
            setData(fetchedData);
        } catch (error) {
            console.error(`Error fetching data: ${error}`);
        } finally {
            setLoading(false); // Set loading to false after fetching is done
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        getData();
    }, []);

    // Helper function to get nested values
    const getNestedValue = (obj, path) =>
        path
            .split(".")
            .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : "N/A"), obj);

    // Open modal with the selected row data
    const openModal = (row) => {
        setSelectedRow(row);
    };

    // Close modal
    const closeModal = () => {
        setSelectedRow(null);
    };

    // Show reject popup
    const showRejectForm = () => {
        setShowRejectPopup(true);
    };

    // Close reject popup
    const closeRejectPopup = () => {
        setShowRejectPopup(false);
        setRejectReason(""); // Reset reason input
    };

    // Show accept popup
    const showAcceptForm = () => {
        setShowAcceptPopup(true);
    };

    // Close accept popup
    const closeAcceptPopup = () => {
        setShowAcceptPopup(false);
    };

    // Reject form with reason
    const rejectForm = async (formId, reason) => {
        try {
            const response = await fetch(
                `https://jciamravati.in/api/v1/membership/reject/${formId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rejectreason: reason }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message); // Use success toast instead of alert
                getData(); // Refresh the data
                closeRejectPopup(); // Close the popup
            } else {
                toast.error(data.error || "Failed to reject form"); // Use error toast
            }
        } catch (error) {
            console.error("Rejection error:", error);
            toast.error("Failed to reject form. Please try again.");
        }
    };

    // Accept form confirmation and update
    const acceptForm = async (Formid) => {
        try {
            const response = await fetch(`https://jciamravati.in/api/v1/membership/accept/${Formid}`, {
                method: "PATCH",
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message); // Show success message
                getData(); // Refresh data
                closeAcceptPopup(); // Close the popup after acceptance
            } else {
                alert(data.error); // Show error message if any
            }
        } catch (error) {
            console.error("Error accepting form:", error);
            alert("Failed to accept the form. Please try again later.");
        }
    };

    // If no data is available and it's not loading
    if (!data || data.length === 0) {
        return (
            <div className="text-center text-gray-500">
                {loading ? "Loading..." : "No data available"}
            </div>
        );
    }

    // If a row is selected, show its details in a modal (show all data)
    if (selectedRow) {
        return (
            <div
                className="p-6 bg-gray-100 overflow-hidden"
                style={{ height: "calc(100vh - 80px)" }}
            >
                <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />
                <div className="buttons flex space-x-4 mb-4">
                    {/* Back button */}
                    <button
                        className="px-6 py-2 bg-blue-500 text-white rounded-md flex items-center"
                        onClick={closeModal}
                    >
                        Back
                    </button>
                    {/* Reject button */}
                    <button
                        className="px-6 py-2 bg-red-500 text-white rounded-md flex items-center"
                        onClick={showRejectForm}
                    >
                        <FileX2 className="mr-2" />
                        Reject
                    </button>
                    {/* Accept button */}
                    <button
                        className="px-6 py-2 bg-green-500 text-white rounded-md flex items-center"
                        onClick={showAcceptForm}
                    >
                        <FileCheck2 className="mr-2" />
                        Accept
                    </button>
                </div>

                {/* PDF Content */}
                <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden p-8">
                    {/* Personal Information Section */}
                    <Section title="Personal Information" className="relative">
                        <InfoGrid cols="3">
                            <InfoItem label="Name" value={selectedRow.Name || "N/A"} />
                            <InfoItem label="D.O.B" value={selectedRow.Dob || "N/A"} />
                            <InfoItem label="Mobile Number" value={selectedRow.Mobileno || "N/A"} />
                            <InfoItem label="JC Name" value={selectedRow.Jcname || "N/A"} />
                            <InfoItem label="Blood Group" value={selectedRow.Bloodgroup || "N/A"} />
                            <InfoItem label="Education" value={selectedRow.Education || "N/A"} />
                            <InfoItem label="Postal Address" value={selectedRow.Postaladdress || "N/A"} />
                            <InfoItem label="Married Status" value={selectedRow.Mstatus || "N/A"} />
                            <InfoItem label="Wife's Name" value={selectedRow.Wifename || "N/A"} />
                            <InfoItem label="Wife's D.O.B" value={selectedRow.Wdob || "N/A"} />
                            <InfoItem label="Wife's Mobile Number" value={selectedRow.Wmobileno || "N/A"} />
                            <InfoItem label="Child's Name" value={selectedRow.Childname || "N/A"} />
                            <InfoItem label="Occupation" value={selectedRow.Occupation || "N/A"} />
                            <InfoItem label="Occupation Details" value={selectedRow.Occupationdetail || "N/A"} />
                            <InfoItem label="Address" value={selectedRow.Address || "N/A"} />
                            <InfoItem label="Expectations" value={selectedRow.Expectation || "N/A"} />
                        </InfoGrid>
                    </Section>
                </div>

                {/* Reject Popup */}
                {showRejectPopup && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
                            <h3 className="text-lg font-semibold mb-4">Reject Form?</h3>
                            <textarea
                                className="w-full p-2 border mb-4 rounded"
                                placeholder="Reason for rejection"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                required
                            />
                            <div className="flex justify-end space-x-3">
                                <button
                                    className="px-4 py-2 bg-gray-300 rounded"
                                    onClick={closeRejectPopup}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-500 text-white rounded"
                                    onClick={() => rejectForm(selectedRow.Formid, rejectReason)}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Accept Popup */}
                {showAcceptPopup && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
                            <h3 className="text-lg font-semibold mb-4">
                                Are you sure you want to accept this form?
                            </h3>
                            <div className="flex space-x-4">
                                <button
                                    className="px-4 py-2 bg-gray-300 rounded-md"
                                    onClick={closeAcceptPopup}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-green-500 text-white rounded-md"
                                    onClick={() => acceptForm(selectedRow.Formid)}
                                >
                                    Accept
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Default table view (show only selected columns)
    return (
        <div className="bg-gray-50 h-screen p-2 overflow-hidden overflow-y-scroll scrollbar-custom" style={{ height: "calc(100vh - 80px)" }}>
            <div className="flex items-center justify-between ">
                <h1 className="bg-white text-gray-600 border-t-2 border-cyan-600 rounded-t-xl font-semibold">
                    Registration Requests
                </h1>
                <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={getData}
                >
                    <RefreshCcw className="w-5 h-5" />
                </button>
            </div>

            <div className="bg-white shadow rounded-r-xl rounded-b-xl scrollbar-custom overflow-x-auto">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading...</div>
                ) : (
                    <table className="w-full border-none">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                            {tableColumns.map((col) => (
                                <th key={col.key} className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {data.map((item, index) => (
                            <tr
                                key={index}
                                className={`hover:bg-gray-50 cursor-pointer ${item.highlighted ? "bg-green-50" : ""}`}
                                onClick={() => openModal(item)}
                            >
                                <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                                {tableColumns.map((col) => (
                                    <td key={col.key} className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                        {getNestedValue(item, col.key)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default registrations;
