import { useState, useEffect } from "react";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import "../App.css";

const Team = () => {
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/v1/team/getteam");
        setSubmittedData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      alert("Please fill in all required fields and upload an image.");
      return;
    }

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
          name,
          post,
          role,
          imagename: filenames.join(","),
        };

        const postResponse = await axios.post(
          "http://localhost:5000/api/v1/team/uploadteam",
          teamData
        );

        setSubmittedData((prev) => [...prev, postResponse.data.data]);
        alert("Data submitted successfully.");
        
        setSelectedImages([]);
        setPreviewImages([]);
        setFormData({
          name: "",
          post: "",
          role: "",
          imagename: "",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to upload. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (data) => {
    setEditingData(data);
    setIsEditing(true);
    const existingPreviews = data.imagename.split(',').map(img => 
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
      let filenames = editingData.imagename.split(',');

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

        filenames = uploadResponse.data.uploadedImages.map(img => img.filename);
      }

      const updatedData = {
        ...editingData,
        imagename: filenames.join(','),
      };

      const updateResponse = await axios.put(
        `http://localhost:5000/api/v1/team/update/${editingData.id}`,
        updatedData
      );

      setSubmittedData(prev =>
        prev.map(item => item.id === editingData.id ? updateResponse.data.data : item)
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

  const handleDelete = async (id, imagename) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    try {
      const filenames = imagename.split(",");
      for (const file of filenames) {
        const link = `https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati/${file}/?delete=both`;
        await axios.get(link);
      }

      await axios.delete(`http://localhost:5000/api/v1/team/deleteteam/${id}`);
      setSubmittedData((prev) => prev.filter((item) => item.id !== id));
      alert("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setEditingData(null);
    setPreviewImages([]);
    setSelectedImages([]);
  };

  const filteredData = selectedTeamRole === "All" 
    ? submittedData 
    : submittedData.filter((data) => data.role === selectedTeamRole);

  return (
    <div className="flex flex-col items-center overflow-hidden overflow-y-scroll scrollbar-custom" style={{ height: "calc(100vh - 140px)" }}>
      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Edit Team Member</h2>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editingData.name}
                    onChange={(e) => setEditingData({...editingData, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Post</label>
                  <input
                    type="text"
                    value={editingData.post}
                    onChange={(e) => setEditingData({...editingData, post: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={editingData.role}
                    onChange={(e) => setEditingData({...editingData, role: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="past president">Past President</option>
                    <option value="LGB member">LGB Member</option>
                    <option value="General member">General Member</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Image</label>
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
                    {isSubmitting ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full flex flex-col gap-4 p-4">
        {/* Add New Member Form */}
      

        {/* Team Display Section */}
        <div className="rounded-xl p-4 scrollbar-custom">
          <div className="mb-4 flex items-center justify-between">
            <label className="block text-xl font-medium text-gray-700">Team</label>
            <select
              value={selectedTeamRole}
              onChange={(e) => setSelectedTeamRole(e.target.value)}
              className="w-60 px-3 py-2 bg-white border border-gray-400 rounded-lg shadow-sm focus:outline-none"
            >
              <option value="All">All</option>
              <option value="past president">Past president</option>
              <option value="LGB member">LGB member</option>
              <option value="General member">General member</option>
            </select>
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
                  <p className="text-md text-gray-600 capitalize">{data.role}</p>
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
                      <Pencil size={20}/>
                    </button>
                    <button
                      onClick={() => handleDelete(data.id, data.imagename)}
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                    >
                      <Trash2 size={20}/>
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