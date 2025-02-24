import React, { useState, useEffect, useRef } from "react";
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

    // Update form state on change
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Clear error for this field when user starts typing
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Basic form validation function
    const validateForm = () => {
        const newErrors = {};
        // Personal Information
        if (!formData.Name.trim()) newErrors.Name = "Name is required.";
        if (!formData.Dob) newErrors.Dob = "Date of Birth is required.";
        if (!formData.Bloodgroup) newErrors.Bloodgroup = "Blood Group is required.";
        if (!formData.Education.trim()) newErrors.Education = "Education is required.";
        if (!formData.Occupation) newErrors.Occupation = "Occupation is required.";

        // Contact Information
        if (!formData.Postaladdress.trim())
            newErrors.Postaladdress = "Postal Address is required.";
        if (!formData.Mobileno.trim())
            newErrors.Mobileno = "Mobile number is required.";
        else if (!/^[0-9]{10}$/.test(formData.Mobileno))
            newErrors.Mobileno = "Mobile number must be 10 digits.";

        // Marital Status (if Married, spouse details are required)
        if (formData.Mstatus === "Married") {
            if (!formData.Wifename.trim())
                newErrors.Wifename = "Spouse Name is required for married status.";
            if (!formData.Wdob)
                newErrors.Wdob = "Spouse Date of Birth is required for married status.";
            if (!formData.Wmobileno.trim())
                newErrors.Wmobileno = "Spouse Mobile number is required.";
            else if (!/^[0-9]{10}$/.test(formData.Wmobileno))
                newErrors.Wmobileno = "Spouse Mobile number must be 10 digits.";
        }

        // Additional Information
        if (!formData.Occupationdetail.trim())
            newErrors.Occupationdetail = "Occupation details are required.";

        // Expectations & Proposal
        if (!formData.Expectation.trim())
            newErrors.Expectation = "Your expectations are required.";
        if (!formData.Jcname.trim())
            newErrors.Jcname = "Proposed By (JC Name) is required.";

        return newErrors;
    };

    // Form submit handler with validation check
    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return; // stop submission if there are errors
        }

        try {
            const response = await fetch("https://jciamravati.in/api/v1/membership/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success("Form submitted successfully!");
                // Reset form if needed
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
                toast.error(`Failed to submit form: ${result.message || "Unknown error"}`);
            }
        } catch (error) {
            toast.error("An error occurred while submitting the form.");
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-cyan-500 text-white px-8 py-6">
                    <h2 className="text-3xl font-bold">Add Member</h2>
                </div>
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                        {/* Personal Information Section */}
                        <div className="col-span-2">
                            <h4 className="text-2xl font-semibold border-b pb-2">
                                Personal Information
                            </h4>
                        </div>

                        <div>
                            <label className="block text-gray-700">
                                Your Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="Name"
                                value={formData.Name}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            />
                            {errors.Name && <p className="text-red-500 text-xs mt-1">{errors.Name}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-700">
                                Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="Dob"
                                value={formData.Dob}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            />
                            {errors.Dob && <p className="text-red-500 text-xs mt-1">{errors.Dob}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-700">
                                Blood Group <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="Bloodgroup"
                                value={formData.Bloodgroup}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2"
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
                            <label className="block text-gray-700">
                                Education <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="Education"
                                value={formData.Education}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            />
                            {errors.Education && (
                                <p className="text-red-500 text-xs mt-1">{errors.Education}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-700">
                                Occupation <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="Occupation"
                                value={formData.Occupation}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            >
                                <option value="">Select Occupation</option>
                                <option value="Business Owner">Business Owner</option>
                                <option value="Self Employed">Self Employed</option>
                                <option value="Working Professional">Working Professional</option>
                                <option value="Student">Student</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.Occupation && (
                                <p className="text-red-500 text-xs mt-1">{errors.Occupation}</p>
                            )}
                        </div>

                        {/* Contact Information Section */}
                        <div className="col-span-2 mt-6">
                            <h4 className="text-2xl font-semibold border-b pb-2">
                                Contact Information
                            </h4>
                        </div>

                        <div className="col-span-1">
                            <label className="block text-gray-700">
                                Postal Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="Postaladdress"
                                value={formData.Postaladdress}
                                onChange={handleChange}
                                rows="3"
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            ></textarea>
                            {errors.Postaladdress && (
                                <p className="text-red-500 text-xs mt-1">{errors.Postaladdress}</p>
                            )}
                        </div>

                        <div className="col-span-1">
                            <label className="block text-gray-700">
                                Mobile Number (WhatsApp) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="Mobileno"
                                value={formData.Mobileno}
                                onChange={(e) => {
                                    // Remove non-digit characters
                                    const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
                                    // Only update state if length is 10 or less
                                    if (digitsOnly.length <= 10) {
                                        setFormData({ ...formData, Mobileno: digitsOnly });
                                    }
                                }}
                                maxLength="10"
                                pattern="[0-9]{10}"
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            />
                            <small className="text-gray-500">Format: 9876543210</small>
                            {errors.Mobileno && (
                                <p className="text-red-500 text-xs mt-1">{errors.Mobileno}</p>
                            )}
                        </div>

                        {/* Marital Status Section */}
                        <div className="col-span-2 mt-6">
                            <h4 className="text-2xl font-semibold border-b pb-2">
                                Marital Status
                            </h4>
                        </div>

                        <div>
                            <label className="block text-gray-700">
                                Marital Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="Mstatus"
                                value={formData.Mstatus}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            >
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                            </select>
                        </div>

                        {formData.Mstatus === "Married" && (
                            <>
                                <div>
                                    <label className="block text-gray-700">Spouse Name</label>
                                    <input
                                        type="text"
                                        name="Wifename"
                                        value={formData.Wifename}
                                        onChange={handleChange}
                                        className="mt-1 w-full border border-gray-300 rounded-md p-2"
                                    />
                                    {errors.Wifename && (
                                        <p className="text-red-500 text-xs mt-1">{errors.Wifename}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700">Spouse Date of Birth</label>
                                    <input
                                        type="date"
                                        name="Wdob"
                                        value={formData.Wdob}
                                        onChange={handleChange}
                                        className="mt-1 w-full border border-gray-300 rounded-md p-2"
                                    />
                                    {errors.Wdob && (
                                        <p className="text-red-500 text-xs mt-1">{errors.Wdob}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700">Spouse Mobile Number</label>
                                    <input
                                        type="tel"
                                        name="Wmobileno"
                                        value={formData.Wmobileno}
                                        onChange={handleChange}
                                        pattern="[0-9]{10}"
                                        className="mt-1 w-full border border-gray-300 rounded-md p-2"
                                    />
                                    {errors.Wmobileno && (
                                        <p className="text-red-500 text-xs mt-1">{errors.Wmobileno}</p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Additional Information Section */}
                        <div className="col-span-2 mt-6">
                            <h4 className="text-2xl font-semibold border-b pb-2">
                                Additional Information
                            </h4>
                        </div>

                        <div>
                            <label className="block text-gray-700">Children's Names</label>
                            <input
                                type="text"
                                name="Childname"
                                value={formData.Childname}
                                onChange={handleChange}
                                placeholder="Separate names with commas"
                                className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700">
                                Occupation Details <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="Occupationdetail"
                                value={formData.Occupationdetail}
                                onChange={handleChange}
                                rows="2"
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            ></textarea>
                            {errors.Occupationdetail && (
                                <p className="text-red-500 text-xs mt-1">{errors.Occupationdetail}</p>
                            )}
                        </div>

                        {/* Expectations and Proposal Section */}
                        <div className="col-span-2 mt-6">
                            <h4 className="text-2xl font-semibold border-b pb-2">
                                Expectations & Proposal
                            </h4>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-gray-700">
                                Your Expectations <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="Expectation"
                                value={formData.Expectation}
                                onChange={handleChange}
                                rows="4"
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            ></textarea>
                            {errors.Expectation && (
                                <p className="text-red-500 text-xs mt-1">{errors.Expectation}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-700">
                                Proposed By (JC Name) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="Jcname"
                                value={formData.Jcname}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            />
                            {errors.Jcname && (
                                <p className="text-red-500 text-xs mt-1">{errors.Jcname}</p>
                            )}
                        </div>

                        <div className="col-span-2 mt-8">
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
