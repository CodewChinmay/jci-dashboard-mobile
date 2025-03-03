import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

// Custom Confirmation Modal Component
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

const Team = () => {
  // States for team data and form handling
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [submittedData, setSubmittedData] = useState([]);
  const [selectedTeamRole, setSelectedTeamRole] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // States for autocomplete suggestions in the editing modal (Member Name)
  const [generalMembers, setGeneralMembers] = useState([]);
  const [filteredGeneralMembers, setFilteredGeneralMembers] = useState([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

  // States for designation autocomplete in the editing modal
  const [designationList, setDesignationList] = useState([]);
  const [filteredDesignations, setFilteredDesignations] = useState([]);
  const [showDesignationSuggestions, setShowDesignationSuggestions] = useState(false);

  // States for prefix (title) functionality
  const [selectedPrefix, setSelectedPrefix] = useState("");
  const [showPrefixDropdown, setShowPrefixDropdown] = useState(false);
  const prefixOptions = ["JC", "HGF", "JFD", "JFM", "JCI Sen."];
  const prefixRef = useRef(null);

  // States for custom team dropdowns
  const [showTeamRoleDropdownEditing, setShowTeamRoleDropdownEditing] = useState(false);
  const [showTeamFilterDropdown, setShowTeamFilterDropdown] = useState(false);

  // Constant classes for inputs and dropdown containers
  const commonInputClasses =
      "h-12 w-full px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500";
  const commonDropdownClasses =
      "w-full h-10 px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm cursor-pointer flex justify-between items-center";

  // Toggle the prefix dropdown
  const togglePrefixDropdown = () => {
    setShowPrefixDropdown((prev) => !prev);
  };

  // When a prefix is selected, update only the prefix state.
  const handlePrefixSelect = (prefix) => {
    setSelectedPrefix(prefix);
    setShowPrefixDropdown(false);
  };

  // Fetch team data and sort by id
  const fetchTeamData = async () => {
    try {
      const response = await axios.get("https://jciamravati.in/api/v1/team/getteam");
      const teamData = response.data.data || [];
      const sortedTeamData = teamData.sort((a, b) => Number(a.id) - Number(b.id));
      setSubmittedData(sortedTeamData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching team data.");
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  // Fetch general members for autocomplete
  useEffect(() => {
    const fetchGeneralMembers = async () => {
      try {
        const response = await axios.get("https://jciamravati.in/api/v1/membership/generalmembers");
        setGeneralMembers(response.data);
      } catch (error) {
        console.error("Error fetching general members:", error);
        toast.error("Error fetching general members.");
      }
    };
    fetchGeneralMembers();
  }, []);

  // Fetch designations for autocomplete
  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const response = await axios.get("https://jciamravati.in/api/v1/designation/getdesign");
        setDesignationList(response.data);
      } catch (error) {
        console.error("Error fetching designations:", error);
        toast.error("Error fetching designations.");
      }
    };
    fetchDesignations();
  }, []);

  // ---------- Member Name Autocomplete Handlers ----------
  const handleEditNameChange = (e) => {
    const value = e.target.value;
    setEditingData({ ...editingData, name: value });
    const inputValue = value.trim().toLowerCase();
    let sortedAll = [...generalMembers];
    if (inputValue) {
      sortedAll = sortedAll.sort((a, b) => {
        const aStarts = a.Name.toLowerCase().startsWith(inputValue) ? 0 : 1;
        const bStarts = b.Name.toLowerCase().startsWith(inputValue) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.Name.localeCompare(b.Name);
      });
    } else {
      sortedAll = sortedAll.sort((a, b) => a.Name.localeCompare(b.Name));
    }
    setFilteredGeneralMembers(sortedAll);
    setShowNameSuggestions(true);
  };

  // Toggle the Member Name dropdown when clicked
  const toggleEditNameSuggestions = () => {
    setShowNameSuggestions((prev) => {
      const newState = !prev;
      if (newState) {
        const inputValue = (editingData?.name || "").trim().toLowerCase();
        let sortedAll = [...generalMembers];
        if (inputValue) {
          sortedAll = sortedAll.sort((a, b) => {
            const aStarts = a.Name.toLowerCase().startsWith(inputValue) ? 0 : 1;
            const bStarts = b.Name.toLowerCase().startsWith(inputValue) ? 0 : 1;
            if (aStarts !== bStarts) return aStarts - bStarts;
            return a.Name.localeCompare(b.Name);
          });
        } else {
          sortedAll = sortedAll.sort((a, b) => a.Name.localeCompare(b.Name));
        }
        setFilteredGeneralMembers(sortedAll);
      }
      return newState;
    });
  };

  const handleSelectEditNameSuggestion = (memberName) => {
    setEditingData({ ...editingData, name: memberName });
    setShowNameSuggestions(false);
  };

  // ---------- Designation Autocomplete Handlers ----------
  const handleEditDesignationChange = (e) => {
    const value = e.target.value;
    setEditingData({ ...editingData, post: value });
    if (value.length > 0) {
      const filtered = designationList.filter((item) =>
          item.designation.toLowerCase().includes(value.toLowerCase())
      );
      const sortedFiltered = filtered.sort((a, b) =>
          a.designation.localeCompare(b.designation)
      );
      setFilteredDesignations(sortedFiltered);
      setShowDesignationSuggestions(true);
    } else {
      const sortedAll = [...designationList].sort((a, b) =>
          a.designation.localeCompare(b.designation)
      );
      setFilteredDesignations(sortedAll);
      setShowDesignationSuggestions(true);
    }
  };

  // Toggle the Designation dropdown when clicked
  const toggleEditDesignationSuggestions = () => {
    setShowDesignationSuggestions((prev) => {
      const newState = !prev;
      if (newState) {
        const inputValue = (editingData?.post || "").trim().toLowerCase();
        let sortedAll = [...designationList];
        if (inputValue) {
          sortedAll = sortedAll.sort((a, b) => {
            const aStarts = a.designation.toLowerCase().startsWith(inputValue) ? 0 : 1;
            const bStarts = b.designation.toLowerCase().startsWith(inputValue) ? 0 : 1;
            if (aStarts !== bStarts) return aStarts - bStarts;
            return a.designation.localeCompare(b.designation);
          });
        } else {
          sortedAll = sortedAll.sort((a, b) => a.designation.localeCompare(b.designation));
        }
        setFilteredDesignations(sortedAll);
      }
      return newState;
    });
  };

  const handleSelectEditDesignationSuggestion = (designationObj) => {
    setEditingData({ ...editingData, post: designationObj.designation });
    setShowDesignationSuggestions(false);
  };

  // ---------- Other Handlers ----------
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    const imagePreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(imagePreviews);
  };

  // When editing an item, remove any prefix from the member name for display but store it separately.
  const handleEditClick = (data) => {
    const regex = new RegExp(`^(${prefixOptions.join("|")})\\s+`, "i");
    const currentPrefix = regex.exec(data.name);
    if (currentPrefix) {
      setSelectedPrefix(currentPrefix[1]);
      const nameWithoutPrefix = data.name.replace(regex, "").trim();
      setEditingData({ ...data, name: nameWithoutPrefix });
    } else {
      setSelectedPrefix("");
      setEditingData(data);
    }
    setIsEditing(true);
    const existingPreviews = data.imagename
        .split(",")
        .map(
            (img) =>
                `https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati/${img}`
        );
    setPreviewImages(existingPreviews);
    setSelectedImages([]);
  };

  // On update, join the selected prefix with the member name before sending.
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingData.name || !editingData.post || !editingData.role) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      let filenames = editingData.imagename.split(",");
      if (selectedImages.length > 0) {
        for (const file of filenames) {
          const deleteLink = `https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati/${file}/?delete=both`;
          await axios.get(deleteLink);
        }
        const uploadFormData = new FormData();
        selectedImages.forEach((image) => uploadFormData.append("file", image));
        const uploadResponse = await axios.post(
            "https://media.bizonance.in/api/v1/image/upload/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati",
            uploadFormData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        filenames = uploadResponse.data.uploadedImages.map((img) => img.filename);
      }
      // Join prefix with member name on update.
      const finalName = selectedPrefix
          ? `${selectedPrefix} ${editingData.name}`
          : editingData.name;
      const updatedData = {
        ...editingData,
        name: finalName,
        imagename: filenames.join(","),
      };
      await axios.put(
          `https://jciamravati.in/api/v1/team/update/${editingData.id}`,
          updatedData
      );
      await fetchTeamData();
      toast.success("Data updated successfully!");
      closeEditModal();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setEditingData(null);
    setPreviewImages([]);
    setSelectedImages([]);
    setShowNameSuggestions(false);
    setShowDesignationSuggestions(false);
    setShowTeamRoleDropdownEditing(false);
  };

  // Custom confirm modal for deletion.
  const handleDeleteClick = (id, imagename) => {
    setConfirmModal({
      message: "Are you sure you want to delete this item?",
      onConfirm: () => {
        handleDelete(id, imagename);
        setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  const handleDelete = async (id, imagename) => {
    try {
      const filenames = imagename.split(",");
      for (const file of filenames) {
        const link = `https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati/${file}/?delete=both`;
        await axios.get(link);
      }
      await axios.delete(`https://jciamravati.in/api/v1/team/deleteteam/${id}`);
      setSubmittedData((prev) => prev.filter((item) => item.id !== id));
      toast.success("Item deleted successfully!");
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
          className="flex flex-col items-center overflow-hidden overflow-y-scroll scrollbar-custom"
          style={{ height: "calc(100vh - 140px)" }}
      >
        {/* Edit Modal */}
        {isEditing && editingData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-4">Edit Board Member</h2>
                <form onSubmit={handleUpdate}>
                  <div className="space-y-4">
                    {/* Prefix Title */}
                    <div className="relative" ref={prefixRef}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Title
                      </label>
                      <div onClick={togglePrefixDropdown} className={commonDropdownClasses}>
                        <span>{selectedPrefix || "Select Title"}</span>
                        <span className="text-gray-600">
                      {showPrefixDropdown ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                      </div>
                      {showPrefixDropdown && (
                          <ul className="absolute z-10 bg-white border-2 border-gray-300 w-full mt-1 max-h-60 overflow-y-auto transition-all duration-300 ease-in-out">
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
                    {/* Member Name with Autocomplete */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700">Member Name</label>
                      <div className="relative">
                        <input
                            type="text"
                            value={editingData.name}
                            onChange={handleEditNameChange}
                            onClick={toggleEditNameSuggestions}
                            onBlur={() => setTimeout(() => setShowNameSuggestions(false), 150)}
                            className={`mt-1 ${commonInputClasses}`}
                            required
                        />
                        <span
                            onClick={toggleEditNameSuggestions}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                        >
                      {showNameSuggestions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                      </div>
                      {showNameSuggestions && filteredGeneralMembers.length > 0 && (
                          <ul className="absolute z-10 bg-white border-2 border-gray-300 w-full max-h-60 overflow-y-auto transition-all duration-300 ease-in-out">
                            {filteredGeneralMembers.map((member, index) => (
                                <li
                                    key={index}
                                    onMouseDown={() => handleSelectEditNameSuggestion(member.Name)}
                                    className="p-2 cursor-pointer hover:bg-gray-100"
                                >
                                  {member.Name}
                                </li>
                            ))}
                          </ul>
                      )}
                    </div>
                    {/* Designation with Autocomplete */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700">Designation</label>
                      <div className="relative">
                        <input
                            type="text"
                            value={editingData.post}
                            onChange={handleEditDesignationChange}
                            onClick={toggleEditDesignationSuggestions}
                            onBlur={() => setTimeout(() => setShowDesignationSuggestions(false), 150)}
                            className={`mt-1 ${commonInputClasses}`}
                            required
                        />
                        <span
                            onClick={toggleEditDesignationSuggestions}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                        >
                      {showDesignationSuggestions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                      </div>
                      {showDesignationSuggestions && filteredDesignations.length > 0 && (
                          <ul className="absolute z-10 bg-white border-2 border-gray-300 w-full max-h-60 overflow-y-auto transition-all duration-300 ease-in-out">
                            {filteredDesignations.map((designationObj, index) => (
                                <li
                                    key={index}
                                    onMouseDown={() => handleSelectEditDesignationSuggestion(designationObj)}
                                    className="p-2 cursor-pointer hover:bg-gray-100"
                                >
                                  {designationObj.designation}
                                </li>
                            ))}
                          </ul>
                      )}
                    </div>
                    {/* Custom Team Role Dropdown for Editing Modal */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700">Team</label>
                      <div
                          className={`${commonDropdownClasses}`}
                          onClick={() => setShowTeamRoleDropdownEditing((prev) => !prev)}
                      >
                        <span>{editingData.role || "Select Team"}</span>
                        <span className="text-gray-600">
                      {showTeamRoleDropdownEditing ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                      </div>
                      {showTeamRoleDropdownEditing && (
                          <ul className="absolute z-10 bg-white border-2 border-gray-300 w-full mt-1 max-h-60 overflow-y-auto transition-all duration-300 ease-in-out">
                            {["Past President", "LGB Member"].map((role, index) => (
                                <li
                                    key={index}
                                    onMouseDown={() => {
                                      setEditingData({ ...editingData, role });
                                      setShowTeamRoleDropdownEditing(false);
                                    }}
                                    className="p-2 cursor-pointer hover:bg-gray-100"
                                >
                                  {role}
                                </li>
                            ))}
                          </ul>
                      )}
                    </div>
                    {/* Profile Photo File Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                      <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className={` ${commonInputClasses}`}
                          multiple
                      />
                      <div className="mt-2 flex flex-wrap gap-2">
                        {previewImages.map((src, index) => (
                            <img
                                key={index}
                                src={src}
                                alt="Preview"
                                className="w-16 h-16 object-cover rounded"
                            />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                          type="button"
                          onClick={closeEditModal}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isSubmitting ? "Updating..." : "Update"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
        )}
        {/* Main Content */}
        <div className="w-full flex flex-col gap-4 p-4">
          <div className="rounded-xl p-4 scrollbar-custom">
            {/* Custom Team Filter Dropdown */}
            <div className="mb-4 flex items-center justify-end">
              <div className="relative">
                <div
                    className="w-60 h-10 px-3 py-2 bg-white border-2 border-gray-400 rounded-md shadow-sm cursor-pointer flex justify-between items-center"
                    onClick={() => setShowTeamFilterDropdown((prev) => !prev)}
                >
                  <span>{selectedTeamRole}</span>
                  <span className="text-gray-600">
                  {showTeamFilterDropdown ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
                </div>
                {showTeamFilterDropdown && (
                    <ul className="absolute z-10 bg-white border-2 border-gray-400 w-60 mt-1 max-h-60 overflow-y-auto transition-all duration-300 ease-in-out">
                      {["All", "Past President", "LGB Member"].map((role, index) => (
                          <li
                              key={index}
                              onMouseDown={() => {
                                setSelectedTeamRole(role);
                                setShowTeamFilterDropdown(false);
                              }}
                              className="p-2 cursor-pointer hover:bg-gray-100"
                          >
                            {role}
                          </li>
                      ))}
                    </ul>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredData.length === 0 ? (
                  <p className="text-gray-500 col-span-full text-center">
                    No data available for the selected role.
                  </p>
              ) : (
                  filteredData.map((data) => (
                      <div
                          key={data.id}
                          className="p-6 flex flex-col items-center gap-4 border bg-white shadow-lg rounded-xl transition-all hover:shadow-xl"
                      >
                        <img
                            src={`https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati/${data.imagename.split(",")[0]}`}
                            alt="Team Member"
                            className="w-24 h-24 object-cover rounded-full border-2 border-gray-300"
                        />
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-700">{data.name}</p>
                          <p className="text-md text-gray-600">{data.post}</p>
                        </div>
                        <div className="flex space-x-4">
                          <button
                              onClick={() => handleEditClick(data)}
                              className="p-2 bg-cyan-500 text-black rounded-full hover:bg-cyan-600"
                          >
                            <Pencil size={20} />
                          </button>
                          <button
                              onClick={() => handleDeleteClick(data.id, data.imagename)}
                              className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                  ))
              )}
            </div>
          </div>
        </div>
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />
        {confirmModal && (
            <ConfirmModal
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={confirmModal.onCancel}
            />
        )}
      </div>
  );
};

export default Team;
