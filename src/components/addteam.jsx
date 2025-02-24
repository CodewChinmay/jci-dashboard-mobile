import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import "../App.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

const Addteam = () => {
  const [formData, setFormData] = useState({
    name: "",
    post: "",
    role: "",
    imagename: "",
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [submittedData, setSubmittedData] = useState([]);
  const [selectedTeamRole, setSelectedTeamRole] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for autocomplete suggestions (Member Name)
  const [generalMembers, setGeneralMembers] = useState([]);
  const [filteredGeneralMembers, setFilteredGeneralMembers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // States for designation autocomplete (using objects)
  const [designationList, setDesignationList] = useState([]);
  const [filteredDesignations, setFilteredDesignations] = useState([]);
  const [showDesignationSuggestions, setShowDesignationSuggestions] = useState(false);

  // State for custom Role dropdown
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const roleOptions = ["Past President", "LGB Member"];

  // States for prefix dropdown (separate from Member Name)
  const [selectedPrefix, setSelectedPrefix] = useState("");
  const [showPrefixDropdown, setShowPrefixDropdown] = useState(false);
  const prefixOptions = ["JC", "HGF", "JFD", "JFM", "JCI Sen."];

  // Ref for prefix dropdown container
  const prefixRef = useRef(null);
  // Ref for file input so we can clear it after submission
  const fileInputRef = useRef(null);

  // Close prefix dropdown if click occurs outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (prefixRef.current && !prefixRef.current.contains(event.target)) {
        setShowPrefixDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch team data on component load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://jciamravati.in/api/v1/team/getteam");
        setSubmittedData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching team data:", error);
      }
    };

    fetchData();
  }, []);

  // Fetch general members for autocomplete suggestions
  useEffect(() => {
    const fetchGeneralMembers = async () => {
      try {
        const response = await axios.get("https://jciamravati.in/api/v1/membership/generalmembers");
        setGeneralMembers(response.data);
      } catch (error) {
        console.error("Error fetching general members:", error);
      }
    };

    fetchGeneralMembers();
  }, []);

  // Fetch designations for autocomplete suggestions
  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const response = await axios.get("https://jciamravati.in/api/v1/designation/getdesign");
        setDesignationList(response.data);
      } catch (error) {
        console.error("Error fetching designations:", error);
      }
    };

    fetchDesignations();
  }, []);

  // Toggle the suggestion dropdown for Member Name
  const toggleSuggestions = () => {
    if (!showSuggestions && formData.name.trim() === "") {
      const sortedAll = [...generalMembers].sort((a, b) => a.Name.localeCompare(b.Name));
      setFilteredGeneralMembers(sortedAll);
    }
    setShowSuggestions((prev) => !prev);
  };

  // Toggle the suggestion dropdown for Designation
  const toggleDesignationSuggestions = () => {
    if (!showDesignationSuggestions && formData.post.trim() === "") {
      const sortedAll = [...designationList].sort((a, b) => a.designation.localeCompare(b.designation));
      setFilteredDesignations(sortedAll);
    }
    setShowDesignationSuggestions((prev) => !prev);
  };

  // Toggle prefix dropdown
  const togglePrefixDropdown = () => {
    setShowPrefixDropdown((prev) => !prev);
  };

  // Update form data and autocomplete suggestions for Member Name and Designation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "name") {
      if (value.length > 0) {
        const filtered = generalMembers.filter((member) =>
            member.Name.toLowerCase().includes(value.toLowerCase())
        );
        const sortedFiltered = filtered.sort((a, b) => a.Name.localeCompare(b.Name));
        setFilteredGeneralMembers(sortedFiltered);
        setShowSuggestions(true);
      } else {
        const sortedAll = [...generalMembers].sort((a, b) => a.Name.localeCompare(b.Name));
        setFilteredGeneralMembers(sortedAll);
        setShowSuggestions(true);
      }
    }

    if (name === "post") {
      if (value.length > 0) {
        const filtered = designationList.filter((item) =>
            item.designation.toLowerCase().includes(value.toLowerCase())
        );
        const sortedFiltered = filtered.sort((a, b) => a.designation.localeCompare(b.designation));
        setFilteredDesignations(sortedFiltered);
        setShowDesignationSuggestions(true);
      } else {
        const sortedAll = [...designationList].sort((a, b) => a.designation.localeCompare(b.designation));
        setFilteredDesignations(sortedAll);
        setShowDesignationSuggestions(true);
      }
    }
  };

  const handleSelectSuggestion = (memberName) => {
    setFormData((prev) => ({ ...prev, name: memberName }));
    setFilteredGeneralMembers([]);
    setShowSuggestions(false);
  };

  const handleSelectDesignation = (designationObj) => {
    setFormData((prev) => ({ ...prev, post: designationObj.designation }));
    setFilteredDesignations([]);
    setShowDesignationSuggestions(false);
  };

  const handlePrefixSelect = (prefix) => {
    setSelectedPrefix(prefix);
    setShowPrefixDropdown(false);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    const imagePreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(imagePreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, post, role } = formData;

    if (!name || !post || !role || selectedImages.length === 0) {
      toast.error("Please fill in all required fields and upload an image.");
      return;
    }

    // Combine selected prefix and name
    const fullName = selectedPrefix ? `${selectedPrefix} ${name}` : name;

    const uploadFormData = new FormData();
    selectedImages.forEach((image) => uploadFormData.append("file", image));

    setIsSubmitting(true);

    try {
      const uploadResponse = await axios.post(
          "https://media.bizonance.in/api/v1/image/upload/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati",
          uploadFormData,
          { headers: { "Content-Type": "multipart/form-data" } }
      );

      const { message, uploadedImages } = uploadResponse.data;

      if (message === "Images uploaded successfully" && Array.isArray(uploadedImages)) {
        const filenames = uploadedImages.map((image) => image.filename);

        const teamData = {
          name: fullName,
          post,
          role,
          imagename: filenames.join(","),
        };

        const postResponse = await axios.post(
            "https://jciamravati.in/api/v1/team/uploadteam",
            teamData,
            { headers: { "Content-Type": "application/json" } }
        );

        setSubmittedData((prev) => [...prev, postResponse.data.data]);
        toast.success("Data submitted successfully.");
      } else {
        toast.error("Image upload failed. Please check the response structure.");
      }

      // Clear the form after successful submission
      setSelectedImages([]);
      setPreviewImages([]);
      setFormData({
        name: "",
        post: "",
        role: "",
        imagename: "",
      });
      setSelectedPrefix("");
      setShowSuggestions(false);
      setShowDesignationSuggestions(false);
      setShowRoleDropdown(false);
      // Reset file input value
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading images and data:", error.response?.data || error.message);
      toast.error("Failed to upload the images and data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, imagename) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    try {
      const filenames = imagename.split(",");
      for (const file of filenames) {
        const link = `https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati/${file}/?delete=both`;
        await axios.get(link);
      }

      await axios.delete(`https://jciamravati.in/api/v1/team/deleteteam/${id}`);
      toast.error("Item and related data deleted successfully!");
      setSubmittedData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete the item. Please try again.");
    }
  };

  const filteredData =
      selectedTeamRole === "All"
          ? submittedData
          : submittedData.filter((data) => data.role === selectedTeamRole);

  return (
      <div
          className="flex flex-col items-center overflow-hidden overflow-y-scroll custom-scrollbar"
          style={{ height: "calc(100vh - 140px)" }}
      >
        <div className="w-full flex flex-col gap-4 p-4">
          {/* Form Section */}
          <div className="p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Enter Details</h2>
            <form onSubmit={handleSubmit} className="space-y-3 relative">
              <div className="grid grid-cols-12 gap-4">
                {/* Prefix Dropdown: 3 columns */}
                <div className="relative col-span-3" ref={prefixRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Title
                  </label>
                  <div
                      onClick={togglePrefixDropdown}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm cursor-pointer flex justify-between items-center"
                  >
                    <span>{selectedPrefix || "Select Title"}</span>
                    <span className="text-gray-600">
                    {showPrefixDropdown ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </span>
                  </div>
                  {showPrefixDropdown && (
                      <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto">
                        {prefixOptions.map((prefix, index) => (
                            <li
                                key={index}
                                onClick={() => handlePrefixSelect(prefix)}
                                className="p-2 cursor-pointer hover:bg-gray-100"
                            >
                              {prefix}
                            </li>
                        ))}
                      </ul>
                  )}
                </div>

                {/* Member Name Input with Autocomplete: 9 columns */}
                <div className="relative col-span-9">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Name
                  </label>
                  <div className="relative">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onClick={toggleSuggestions}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        autoComplete="off"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none"
                        required
                    />
                    <span
                        onClick={toggleSuggestions}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                    >
                    {showSuggestions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </span>
                  </div>
                  {showSuggestions && filteredGeneralMembers.length > 0 && (
                      <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-60 overflow-y-auto">
                        {filteredGeneralMembers.map((member, index) => (
                            <li
                                key={index}
                                onMouseDown={() => handleSelectSuggestion(member.Name)}
                                className="p-2 cursor-pointer hover:bg-gray-100"
                            >
                              {member.Name}
                            </li>
                        ))}
                      </ul>
                  )}
                </div>
              </div>

              {/* Designation Input with Autocomplete */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Designation
                </label>
                <div className="relative">
                  <input
                      type="text"
                      name="post"
                      value={formData.post}
                      onChange={handleChange}
                      onClick={toggleDesignationSuggestions}
                      onBlur={() => setTimeout(() => setShowDesignationSuggestions(false), 150)}
                      autoComplete="off"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none"
                      required
                  />
                  <span
                      onClick={toggleDesignationSuggestions}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                  >
                  {showDesignationSuggestions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
                </div>
                {showDesignationSuggestions && filteredDesignations.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-60 overflow-y-auto">
                      {filteredDesignations.map((designationObj, index) => (
                          <li
                              key={index}
                              onMouseDown={() => handleSelectDesignation(designationObj)}
                              className="p-2 cursor-pointer hover:bg-gray-100"
                          >
                            {designationObj.designation}
                          </li>
                      ))}
                    </ul>
                )}
              </div>

              {/* Custom Role Dropdown */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Team
                </label>
                <div
                    onClick={() => setShowRoleDropdown((prev) => !prev)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm cursor-pointer flex justify-between items-center"
                >
                  <span>{formData.role || "Select Team"}</span>
                  <span className="text-gray-600">
                  {showRoleDropdown ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
                </div>
                {showRoleDropdown && (
                    <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto">
                      {roleOptions.map((roleOption, index) => (
                          <li
                              key={index}
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, role: roleOption }));
                                setShowRoleDropdown(false);
                              }}
                              className="p-2 cursor-pointer hover:bg-gray-100"
                          >
                            {roleOption}
                          </li>
                      ))}
                    </ul>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Profile Photo
                </label>
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none"
                    required
                />
              </div>

              {/* Preview Images */}
              <div className="flex flex-wrap gap-2">
                {previewImages.map((image, index) => (
                    <img
                        key={index}
                        src={image}
                        alt={`Preview ${index}`}
                        className="w-20 h-20 object-cover rounded-full"
                    />
                ))}
              </div>

              {/* Submit Button */}
              <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-700"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />
      </div>
  );
};

export default Addteam;
