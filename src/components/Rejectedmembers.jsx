import React, { useEffect, useState } from "react";
import { RefreshCcw, Trash2, MoveLeft, UserPlus, Ban, XCircle } from "lucide-react";
import axios from "axios";
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

const Rejectedmembers = () => {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const getData = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/v1/membership/Rejectedmembers");
            if (!response.ok) throw new Error('Network response was not ok');

            const fetchedData = await response.json();
            setData(fetchedData);

            if (fetchedData?.length > 0) {
                const extractHeaders = (obj, prefix = "") =>
                    Object.keys(obj).reduce((acc, key) => {
                        const newKey = prefix ? `${prefix}.${key}` : key;
                        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
                            return [...acc, ...extractHeaders(obj[key], newKey)];
                        }
                        return [...acc, newKey];
                    }, []);

                const uniqueHeaders = [...new Set(extractHeaders(fetchedData[0]).filter(
                    header => !header.toLowerCase().includes("id")
                ))];
                setHeaders(uniqueHeaders);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };




    const deleteMember = async (id) => {
        try {
            const confirmDelete = window.confirm("Are you sure you want to delete this member?");
            if (!confirmDelete) return; // Stop the delete if user cancels

            await axios.delete(`http://localhost:5000/api/v1/membership/delete/${id}`);
            console.log(`Deleted Member ${name}`)
            getData();
            closeModal();
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const openModal = (row) => setSelectedRow(row);
    const closeModal = () => setSelectedRow(null);

    const getNestedValue = (obj, path) =>
        path.split(".").reduce((acc, part) => acc?.[part] ?? "N/A", obj);

    useEffect(() => { getData(); }, []);

    if (!data.length) return <div className="text-center text-gray-500 p-4">No rejected members found</div>;

    if (selectedRow) return (
        <div className="p-6 bg-gray-50 min-h-screen" style={{ height: "calc(100vh - 80px)" }}>
            <div className="flex flex-wrap gap-4 mb-6">
                <button className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center shadow-md transition-all" onClick={closeModal}>
                    <MoveLeft className="w-4 h-4 mr-2" /> Back
                </button>
                <button
                    className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center shadow-md transition-all"
                    onClick={() => {
                        console.log(`Name: ${selectedRow.Name}, Form ID: ${selectedRow.Formid}`);
                        deleteMember(selectedRow.Formid);
                    }}
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                </button>

            </div>

            <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                {/* Rejection Details Box Positioned at Top Right */}
                <div className="absolute top-[-50px] right-4 bg-rose-200 p-4 rounded-lg border border-rose-200 shadow-sm w-72">
                    <h4 className="text-rose-700 font-semibold flex items-center mb-2">
                        <XCircle className="w-5 h-5 mr-2" /> Reject Reason
                    </h4>
                    <div className="p-3 bg-white rounded-lg border border-gray-300 text-sm">
                        {selectedRow.rejectreason || "No rejection reason provided"}
                    </div>
                </div>

                {/* Personal Information Section */}
                <Section title="Personal Information" className="relative">
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
        </div>
    );

    return (
        <div className="h-screen p-6 overflow-hidden" style={{ width: "calc(100vw - 300px)", height: "calc(100vh - 80px)" }}>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Rejected Members</h1>
                <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={getData}
                >
                    <RefreshCcw className="w-5 h-5" />
                </button>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 scrollbar-custom overflow-x-auto">
                <table className="w-full border-none min-w-[1000px]">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                        {headers.map(header => (
                            <th key={header} className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                {header.replace(/_/g, " ")}
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
                            {headers.map(header => (
                                <td key={header} className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                    {getNestedValue(item, header)}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Rejectedmembers;
