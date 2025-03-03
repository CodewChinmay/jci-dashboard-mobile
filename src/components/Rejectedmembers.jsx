import React, { useState, useEffect } from "react";
import { RefreshCcw, Trash2, MoveLeft } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./pdf.css";

// Reusable Components
const Section = ({ title, children }) => (
    <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center pb-2 border-b border-gray-200">
            {title}
        </h3>
        {children}
    </section>
);

const InfoGrid = ({ cols = "3", children }) => (
    <div className={`grid grid-cols-3 md:grid-cols-${cols} gap-4`}>{children}</div>
);

const InfoItem = ({ label, value }) => (
    <div className="space-y-1">
        <span className="block text-sm font-medium text-gray-500">{label}</span>
        <p className="text-gray-800">{value || "N/A"}</p>
    </div>
);

// Custom Confirmation Modal Component (to be rendered within the selected row view)
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="mb-4 text-gray-800">{message}</p>
            <div className="flex justify-end gap-4">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Confirm
                </button>
            </div>
        </div>
    </div>
);

const Rejectedmembers = () => {
    const [data, setData] = useState([]);
    // We no longer need dynamic headers for the table view.
    const [selectedRow, setSelectedRow] = useState(null);
    // confirmModal will be shown only in the selected row view
    const [confirmModal, setConfirmModal] = useState(null);

    // Fixed table columns for listing only Name, D.O.B, Mobile Number, and JC Name
    const tableColumns = [
        { label: "Name", key: "Name" },
        { label: "D.O.B", key: "Dob" },
        { label : "Occupation", key: "Occupation" },
        { label: "Mobile Number", key: "Mobileno" },
        { label: "JC Name", key: "Jcname" },
    ];

    // Fetch rejected members data
    const getData = async () => {
        try {
            const response = await fetch("https://jciamravati.in/api/v1/membership/Rejectedmembers");
            if (!response.ok) throw new Error("Network response was not ok");
            const fetchedData = await response.json();
            setData(fetchedData);
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Error fetching data.");
        }
    };

    // Delete a member after confirmation
    const deleteMember = async (id) => {
        try {
            await axios.delete(`https://jciamravati.in/api/v1/membership/delete/${id}`);
            toast.success("Member deleted successfully!");
            getData();
            closeModal();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete the member. Please try again.");
        }
    };

    // Show confirmation modal within selected row view
    const handleDeleteClick = (id) => {
        setConfirmModal({
            message: "Are you sure you want to delete this member?",
            onConfirm: () => {
                deleteMember(id);
                setConfirmModal(null);
            },
            onCancel: () => setConfirmModal(null),
        });
    };

    const openModal = (row) => setSelectedRow(row);
    const closeModal = () => {
        setSelectedRow(null);
        setConfirmModal(null);
    };

    const getNestedValue = (obj, path) =>
        path.split(".").reduce((acc, part) => acc?.[part] ?? "N/A", obj);

    useEffect(() => {
        getData();
    }, []);

    // If no data, show message
    if (!data.length)
        return <div className="text-center text-gray-500 p-4">No rejected members found</div>;

    // Selected row (detailed) view with confirm modal inside
    if (selectedRow)
        return (
            <div className="p-6" style={{ height: "calc(100vh - 80px)" }}>
                <div className="flex flex-wrap gap-4 mb-6">
                    <button
                        className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center shadow-md transition-all"
                        onClick={closeModal}
                    >
                        <MoveLeft className="w-4 h-4 mr-2" /> Back
                    </button>
                    <button
                        className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center shadow-md transition-all"
                        onClick={() => handleDeleteClick(selectedRow.Formid)}
                    >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </button>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Rejected Members</h2>
                    <div className="text-rose-700 font-bold text-lg">
                        {selectedRow.rejectreason || "No rejection reason provided"}
                    </div>
                </div>
                <div className="relative bg-white rounded-xl shadow-lg p-8">
                    <Section title="Personal Information">
                        <InfoGrid cols="3">
                            <InfoItem label="Name" value={selectedRow.Name || "N/A"} />
                            <InfoItem label="D.O.B" value={selectedRow.Dob || "N/A"} />
                            <InfoItem label="Mobile Number" value={selectedRow.Mobileno || "N/A"} />
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
                            <InfoItem label="JC Name" value={selectedRow.Jcname || "N/A"} />
                        </InfoGrid>
                    </Section>
                </div>
                {/* Render the confirm modal only in selected row view */}
                {confirmModal && (
                    <ConfirmModal
                        message={confirmModal.message}
                        onConfirm={confirmModal.onConfirm}
                        onCancel={confirmModal.onCancel}
                    />
                )}
                <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />
            </div>
        );

    // Main table view (show only fixed columns)
    return (
        <div className="p-2 overflow-hidden" style={{ height: "calc(100vh - 80px)" }}>
            <div className="flex items-center justify-between">
                <h1 className="bg-white text-gray-600 border-t-2 border-cyan-600 rounded-t-xl font-semibold">
                    Rejected Members
                </h1>
                <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={getData}
                >
                    <RefreshCcw className="w-5 h-5" />
                </button>
            </div>
            <div className="bg-white shadow rounded-r-xl rounded-b-xl scrollbar-custom overflow-hidden overflow-x-scroll">
                <table className="w-full border-none">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                        {tableColumns.map((col) => (
                            <th
                                key={col.key}
                                className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {data.map((item, index) => (
                        <tr
                            key={index}
                            className={`hover:bg-gray-50 cursor-pointer ${
                                item.highlighted ? "bg-green-50" : ""
                            }`}
                            onClick={() => openModal(item)}
                        >
                            <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                            {tableColumns.map((col) => (
                                <td
                                    key={col.key}
                                    className="px-4 py-3 text-gray-600 whitespace-nowrap"
                                >
                                    {getNestedValue(item, col.key)}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />
        </div>
    );
};

export default Rejectedmembers;
