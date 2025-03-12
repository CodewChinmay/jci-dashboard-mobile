import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

const AddMember = () => {
    const [formData, setFormData] = useState({
        Name: "",
        Dob: "",
        Bloodgroup: "",
        Education: "",
        Occupation: "",
        Postaladdress: "",
        Mobileno: "",
        Mstatus: "Single",
        Wifename: "",
        Wdob: "",
        Wmobileno: "",
        Childname: "",
        Occupationdetail: "",
        Expectation: "",
        Jcname: "",
        acceptreject: "accepted",
    });
    const [errors, setErrors] = useState({});

    // Handle input changes and clear field-specific errors
    const handleChange = (e) => {
        const { name, value } = e.target;
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Clear spouse/child details if marital status is "Single"
    useEffect(() => {
        if (formData.Mstatus === "Single") {
            setFormData((prev) => ({
                ...prev,
                Childname: "",
                Occupationdetail: "",
                Wifename: "",
                Wdob: "",
                Wmobileno: "",
            }));
        }
    }, [formData.Mstatus]);

    // Validate form inputs
    const validateForm = () => {
        const newErrors = {};

        // Personal Information
        if (!formData.Name.trim()) newErrors.Name = "Name is required.";
        if (!formData.Dob) newErrors.Dob = "Date of Birth is required.";
        if (!formData.Bloodgroup)
            newErrors.Bloodgroup = "Blood Group is required.";
        if (!formData.Education.trim())
            newErrors.Education = "Education is required.";
        if (!formData.Occupation)
            newErrors.Occupation = "Occupation is required.";

        // Contact Information
        if (!formData.Postaladdress.trim())
            newErrors.Postaladdress = "Postal Address is required.";
        if (!formData.Mobileno.trim())
            newErrors.Mobileno = "Mobile number is required.";
        else if (!/^[0-9]{10}$/.test(formData.Mobileno))
            newErrors.Mobileno = "Mobile number must be 10 digits.";

        // Marital Status (if Married, spouse and occupation details are required)
        if (formData.Mstatus === "Married") {
            if (!formData.Wifename.trim())
                newErrors.Wifename = "Spouse Name is required for married status.";
            if (!formData.Wdob)
                newErrors.Wdob = "Spouse Date of Birth is required for married status.";
            if (!formData.Wmobileno.trim())
                newErrors.Wmobileno = "Spouse Mobile number is required.";
            else if (!/^[0-9]{10}$/.test(formData.Wmobileno))
                newErrors.Wmobileno = "Spouse Mobile number must be 10 digits.";
            if (!formData.Occupationdetail.trim())
                newErrors.Occupationdetail =
                    "Occupation details are required for married status.";
        }

        // Expectations & Proposal
        if (!formData.Expectation.trim())
            newErrors.Expectation = "Your expectations are required.";
        if (!formData.Jcname.trim())
            newErrors.Jcname = "Proposed By (JC Name) is required.";

        return newErrors;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const response = await fetch(
                "https://jciamravati.in/api/v1/membership/create",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const result = await response.json();
            if (response.ok) {
                toast.success("Form submitted successfully!");
                setFormData({
                    Name: "",
                    Dob: "",
                    Bloodgroup: "",
                    Education: "",
                    Occupation: "",
                    Postaladdress: "",
                    Mobileno: "",
                    Mstatus: "Single",
                    Wifename: "",
                    Wdob: "",
                    Wmobileno: "",
                    Childname: "",
                    Occupationdetail: "",
                    Expectation: "",
                    Jcname: "",
                    acceptreject: "accepted",
                });
                setErrors({});
            } else {
                toast.error(
                    `Failed to submit form: ${result.message || "Unknown error"}`
                );
            }
        } catch (error) {
            toast.error("An error occurred while submitting the form.");
            console.error(error);
        }
    };

    return (
        <div className="flex items-center justify-center bg-gray-100 p-4 min-h-screen overflow-auto">
            <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg mt-10 mx-auto">
                <div className="bg-cyan-500 text-white px-6 md:px-8 py-4 md:py-6">
                    <h2 className="text-xl md:text-3xl font-bold">Add Member</h2>
                </div>
                <div className="p-4 md:p-8">
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
                    >
                        {/* Personal Information Section */}
                        <div className="col-span-1 md:col-span-2">
                            <h4 className="text-lg md:text-2xl font-semibold border-b pb-2">
                                Personal Information
                            </h4>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm md:text-base">
                                Your Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="Name"
                                value={formData.Name}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm md:text-base"
                            />
                            {errors.Name && (
                                <p className="text-red-500 text-xs mt-1">{errors.Name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm md:text-base">
                                Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="Dob"
                                value={formData.Dob}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm md:text-base"
                            />
                            {errors.Dob && (
                                <p className="text-red-500 text-xs mt-1">{errors.Dob}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm md:text-base">
                                Blood Group <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="Bloodgroup"
                                value={formData.Bloodgroup}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm md:text-base"
                            >
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                            {errors.Bloodgroup && (
                                <p className="text-red-500 text-xs mt-1">{errors.Bloodgroup}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm md:text-base">
                                Education <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="Education"
                                value={formData.Education}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm md:text-base"
                            />
                            {errors.Education && (
                                <p className="text-red-500 text-xs mt-1">{errors.Education}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm md:text-base">
                                Occupation <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="Occupation"
                                value={formData.Occupation}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm md:text-base"
                            >
                                <option value="">Select Occupation</option>
                                <option value="Business Owner">Business Owner</option>
                                <option value="Self Employed">Self Employed</option>
                                <option value="Working Professional">
                                    Working Professional
                                </option>
                                <option value="Student">Student</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.Occupation && (
                                <p className="text-red-500 text-xs mt-1">{errors.Occupation}</p>
                            )}
                        </div>

                        {/* Contact Information Section */}
                        <div className="col-span-1 md:col-span-2 mt-4">
                            <h4 className="text-lg md:text-2xl font-semibold border-b pb-2">
                                Contact Information
                            </h4>
                        </div>

                        <div className="col-span-1">
                            <label className="block text-gray-700 text-sm md:text-base">
                                Postal Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="Postaladdress"
                                value={formData.Postaladdress}
                                onChange={handleChange}
                                rows="3"
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm md:text-base"
                            ></textarea>
                            {errors.Postaladdress && (
                                <p className="text-red-500 text-xs mt-1">{errors.Postaladdress}</p>
                            )}
                        </div>

                        <div className="col-span-1">
                            <label className="block text-gray-700 text-sm md:text-base">
                                Mobile Number (WhatsApp) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="Mobileno"
                                value={formData.Mobileno}
                                onChange={(e) => {
                                    const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
                                    if (digitsOnly.length <= 10) {
                                        setFormData({ ...formData, Mobileno: digitsOnly });
                                    }
                                }}
                                maxLength="10"
                                pattern="[0-9]{10}"
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm md:text-base"
                            />
                            <small className="text-gray-500">Format: 9876543210</small>
                            {errors.Mobileno && (
                                <p className="text-red-500 text-xs mt-1">{errors.Mobileno}</p>
                            )}
                        </div>

                        {/* Marital Status Section */}
                        <div className="col-span-1 md:col-span-2 mt-4">
                            <h4 className="text-lg md:text-2xl font-semibold border-b pb-2">
                                Marital Status
                            </h4>
                        </div>

                        <div className="col-span-1">
                            <label className="block text-gray-700 text-sm md:text-base">
                                Marital Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="Mstatus"
                                value={formData.Mstatus}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm md:text-base"
                            >
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                            </select>
                        </div>

                        {formData.Mstatus === "Married" && (
                            <>
                                <div>
                                    <label className="block text-gray-700 text-sm md:text-base">
                                        Spouse Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="Wifename"
                                        value={formData.Wifename}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm md:text-base"
                                    />
                                    {errors.Wifename && (
                                        <p className="text-red-500 text-xs mt-1">{errors.Wifename}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm md:text-base">
                                        Spouse Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        name="Wdob"
                                        value={formData.Wdob}
                                        onChange={handleChange}
                                        className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm md:text-base"
                                    />
                                    {errors.Wdob && (
                                        <p className="text-red-500 text-xs mt-1">{errors.Wdob}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm md:text-base">
                                        Spouse Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="Wmobileno"
                                        value={formData.Wmobileno}
                                        onChange={handleChange}
                                        pattern="[0-9]{10}"
                                        className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm md:text-base"
                                    />
                                    {errors.Wmobileno && (
                                        <p className="text-red-500 text-xs mt-1">{errors.Wmobileno}</p>
                                    )}
                                </div>

                                <div className="col-span-1">
                                    <label className="block text-gray-700 text-sm md:text-base">
                                        Children's Names
                                    </label>
                                    <input
                                        type="text"
                                        name="Childname"
                                        value={formData.Childname}
                                        onChange={handleChange}
                                        placeholder="Separate names with commas"
                                        className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm md:text-base"
                                    />
                                </div>

                                <div className="col-span-1">
                                    <label className="block text-gray-700 text-sm md:text-base">
                                        Occupation Details <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="Occupationdetail"
                                        value={formData.Occupationdetail}
                                        onChange={handleChange}
                                        rows="2"
                                        required
                                        className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm md:text-base"
                                    ></textarea>
                                    {errors.Occupationdetail && (
                                        <p className="text-red-500 text-xs mt-1">{errors.Occupationdetail}</p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Expectations & Proposal Section */}
                        <div className="col-span-1 md:col-span-2 mt-4">
                            <h4 className="text-lg md:text-2xl font-semibold border-b pb-2">
                                Expectations & Proposal
                            </h4>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-gray-700 text-sm md:text-base">
                                Your Expectations <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="Expectation"
                                value={formData.Expectation}
                                onChange={handleChange}
                                rows="4"
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm md:text-base"
                            ></textarea>
                            {errors.Expectation && (
                                <p className="text-red-500 text-xs mt-1">{errors.Expectation}</p>
                            )}
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-gray-700 text-sm md:text-base">
                                Proposed By (JC Member Name) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="Jcname"
                                value={formData.Jcname}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm md:text-base"
                            />
                            {errors.Jcname && (
                                <p className="text-red-500 text-xs mt-1">{errors.Jcname}</p>
                            )}
                        </div>

                        <div className="col-span-1 md:col-span-2 mt-6">
                            <button
                                type="submit"
                                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-md"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />
        </div>
    );
};

export default AddMember;
