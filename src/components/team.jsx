import { useState, useEffect } from "react";
import axios from "axios";
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import "../App.css";

const Team = () => {
  // States for team data and form handling
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [submittedData, setSubmittedData] = useState([]);
  const [selectedTeamRole, setSelectedTeamRole] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // States for autocomplete suggestions in the editing modal (Member Name)
  const [generalMembers, setGeneralMembers] = useState([]);
  const [filteredGeneralMembers, setFilteredGeneralMembers] = useState([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

  // States for designation autocomplete in the editing modal
  const [designationList, setDesignationList] = useState([]);
  const [filteredDesignations, setFilteredDesignations] = useState([]);
  const [showDesignationSuggestions, setShowDesignationSuggestions] = useState(false);

  // Fetch team data and sort in numeric sequence (by id)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://jciamravati.in/api/v1/team/getteam");
        const teamData = response.data.data || [];
        // Sort the team data by id in ascending order (convert id to number if needed)
        const sortedTeamData = teamData.sort((a, b) => Number(a.id) - Number(b.id));
        setSubmittedData(sortedTeamData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch general members for autocomplete
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

  // Fetch designations for autocomplete
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

  // ---------- Editing Modal Autocomplete Handlers for Member Name ----------
  const handleEditNameChange = (e) => {
    const value = e.target.value;
    setEditingData({ ...editingData, name: value });
    if (value.length > 0) {
      const filtered = generalMembers.filter((member) =>
          member.Name.toLowerCase().includes(value.toLowerCase())
      );
      const sortedFiltered = filtered.sort((a, b) => a.Name.localeCompare(b.Name));
      setFilteredGeneralMembers(sortedFiltered);
      setShowNameSuggestions(true);
    } else {
      const sortedAll = [...generalMembers].sort((a, b) => a.Name.localeCompare(b.Name));
      setFilteredGeneralMembers(sortedAll);
      setShowNameSuggestions(true);
    }
  };

  const toggleEditNameSuggestions = () => {
    if (!showNameSuggestions && editingData.name.trim() === "") {
      const sortedAll = [...generalMembers].sort((a, b) => a.Name.localeCompare(b.Name));
      setFilteredGeneralMembers(sortedAll);
    }
    setShowNameSuggestions((prev) => !prev);
  };

  const handleSelectEditNameSuggestion = (memberName) => {
    setEditingData({ ...editingData, name: memberName });
    setFilteredGeneralMembers([]);
    setShowNameSuggestions(false);
  };

  // ---------- Editing Modal Autocomplete Handlers for Designation ----------
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

  const toggleEditDesignationSuggestions = () => {
    if (!showDesignationSuggestions && editingData.post.trim() === "") {
      const sortedAll = [...designationList].sort((a, b) =>
          a.designation.localeCompare(b.designation)
      );
      setFilteredDesignations(sortedAll);
    }
    setShowDesignationSuggestions((prev) => !prev);
  };

  const handleSelectEditDesignationSuggestion = (designationObj) => {
    setEditingData({ ...editingData, post: designationObj.designation });
    setFilteredDesignations([]);
    setShowDesignationSuggestions(false);
  };

  // ---------- Other Handlers (Image Change, Delete, etc.) ----------
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    const imagePreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(imagePreviews);
  };

  const handleEditClick = (data) => {
    setEditingData(data);
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingData.name || !editingData.post || !editingData.role) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      let filenames = editingData.imagename.split(",");

      if (selectedImages.length > 0) {
        // Delete old images
        for (const file of filenames) {
          const deleteLink = `https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati/${file}/?delete=both`;
          await axios.get(deleteLink);
        }

        // Upload new images
        const uploadFormData = new FormData();
        selectedImages.forEach((image) => uploadFormData.append("file", image));
        const uploadResponse = await axios.post(
            "https://media.bizonance.in/api/v1/image/upload/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati",
            uploadFormData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );

        filenames = uploadResponse.data.uploadedImages.map((img) => img.filename);
      }

      const updatedData = {
        ...editingData,
        imagename: filenames.join(","),
      };

      const updateResponse = await axios.put(
          `https://jciamravati.in/api/v1/team/update/${editingData.id}`,
          updatedData
      );

      // Preserve the original id to keep the same key and position.
      const updatedItem = { ...updateResponse.data.data, id: editingData.id };

      setSubmittedData((prev) =>
          prev.map((item) =>
              item.id === editingData.id ? updatedItem : item
          )
      );

      alert("Data updated successfully!");
      closeEditModal();
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update. Please try again.");
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
      setSubmittedData((prev) => prev.filter((item) => item.id !== id));
      alert("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete the item. Please try again.");
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
                            className="mt-1 block w-full rounded-md border-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                          <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-60 overflow-y-auto">
                            {filteredGeneralMembers.map((member, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSelectEditNameSuggestion(member.Name)}
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                          <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-60 overflow-y-auto">
                            {filteredDesignations.map((designationObj, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSelectEditDesignationSuggestion(designationObj)}
                                    className="p-2 cursor-pointer hover:bg-gray-100"
                                >
                                  {designationObj.designation}
                                </li>
                            ))}
                          </ul>
                      )}
                    </div>

                    {/* Team Role Select */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Team</label>
                      <select
                          value={editingData.role}
                          onChange={(e) =>
                              setEditingData({ ...editingData, role: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          required
                      >
                        <option value="past president">Past President</option>
                        <option value="LGB member">LGB Member</option>
                      </select>
                    </div>

                    {/* Profile Photo File Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                      <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          multiple
                      />
                      <div className="mt-2 flex flex-wrap gap-2">
                        {previewImages.map((src, index) => (
                            <img key={index} src={src} alt="Preview" className="w-16 h-16 object-cover rounded" />
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
            <div className="mb-4 flex items-center justify-end">
              <select
                  value={selectedTeamRole}
                  onChange={(e) => setSelectedTeamRole(e.target.value)}
                  className="w-60 px-3 py-2 bg-white border border-gray-400 rounded-lg shadow-sm focus:outline-none"
              >
                <option value="All">All</option>
                <option value="Past President">Past President</option>
                <option value="LGB Member">LGB Member</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredData.length === 0 ? (
                  <p className="text-gray-500 col-span-full text-center">
                    No data available for the selected role.
                  </p>
              ) : (
                  filteredData.map((data, index) => (
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
                              onClick={() => handleDelete(data.id, data.imagename)}
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
      </div>
  );
};

export default Team;
