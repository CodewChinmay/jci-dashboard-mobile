import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Star, Pencil, X, Plus } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Workingdata = () => {
  const [submittedData, setSubmittedData] = useState([]);
  const [selectedWorkingArea, setSelectedWorkingArea] = useState("All");
  const [editingData, setEditingData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch and sort data in numeric sequence (by id)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://jciamravati.in/api/v1/workingareas/getrecord");
        const records = response.data.data || [];
        // Sort records by id in ascending order
        const sortedRecords = records.sort((a, b) => Number(a.id) - Number(b.id));
        setSubmittedData(sortedRecords);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data.");
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id, imagename) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(`https://jciamravati.in/api/v1/workingareas/deleterecord/${id}`);
      toast.success("Item deleted successfully!");
      setSubmittedData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete the item. Please try again.");
    }
  };

  const handleHighlight = async (id) => {
    const currentItem = submittedData.find((data) => data.id === id);
    const newHighlightStatus = !currentItem.highlighted;

    try {
      const response = await axios.patch(
          `https://jciamravati.in/api/v1/workingareas/highlight/${id}`,
          { highlighted: newHighlightStatus },
          { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        setSubmittedData((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, highlighted: newHighlightStatus } : item
            )
        );
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Error updating highlighted status:", error);
      toast.error("Failed to update highlighted status.");
    }
  };

  const handleEdit = (data) => {
    setEditingData(data);
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingData) return;

    try {
      const response = await axios.patch(
          `https://jciamravati.in/api/v1/workingareas/updatedata/${editingData.id}`,
          editingData
      );
      if (response.status === 200) {
        setSubmittedData((prevData) =>
            prevData.map((item) =>
                item.id === editingData.id ? { ...item, ...editingData } : item
            )
        );
        setIsModalOpen(false);
        toast.success("Data updated successfully!");
      }
    } catch (error) {
      console.error("Error updating record:", error);
      toast.error("Failed to update data.");
    }
  };

  // Handles uploading a new image file
  const handleFileUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
            "https://media.bizonance.in/api/v1/image/upload/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
        );
        // Assume the API returns the uploaded file name in response.data.filename
        const uploadedFileName = response.data.filename || file.name;
        const newImages = [...(editingData.images || []), uploadedFileName];
        setEditingData({ ...editingData, images: newImages });
        toast.success("Image uploaded successfully!");
      } catch (err) {
        console.error("Error uploading image:", err);
        toast.error("Failed to upload image.");
      }
    }
  };

  const filteredData =
      selectedWorkingArea === "All"
          ? submittedData
          : selectedWorkingArea === "highlighted"
              ? submittedData.filter((data) => data.highlighted)
              : submittedData.filter((data) => data.workingarea === selectedWorkingArea);

  return (
      <div className="p-6 bg-gray-50 overflow-hidden" style={{ height: "calc(100vh - 140px)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by:</label>
              <select
                  value={selectedWorkingArea}
                  onChange={(e) => setSelectedWorkingArea(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="All">All Activities</option>
                <option value="highlighted">Highlighted Activities</option>
                <option value="Management">Management</option>
                <option value="Business">Business</option>
                <option value="Community">Community</option>
                <option value="International Growth and Development">International Growth</option>
                <option value="Training">Training</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
              {filteredData.map((data) => (
                  <div
                      key={data.id}
                      className="p-4 flex flex-col justify-between border border-gray-300 bg-white rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {data.date} at {data.time}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">{data.title}</h3>
                      <p className="text-sm text-gray-600">{data.location}</p>
                    </div>
                    <div className="flex gap-5 mt-4 justify-end">
                      <button
                          title="Edit"
                          onClick={() => handleEdit(data)}
                          className="p-2 bg-cyan-600 text-white rounded-full"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                          onClick={() => handleHighlight(data.id)}
                          className={`p-2 rounded-full ${
                              data.highlighted ? "bg-yellow-300 text-yellow-900" : "bg-gray-200 text-gray-600"
                          }`}
                      >
                        <Star size={20} />
                      </button>
                      <button
                          onClick={() => handleDelete(data.id, data.imagename)}
                          className="p-2 bg-red-100 text-red-600 rounded-full"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {isModalOpen && editingData && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-4 rounded-lg shadow-lg w-[800px]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Edit Record</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-600">
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Working Area */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Working Area</label>
                      <select
                          value={editingData.workingarea}
                          onChange={(e) => setEditingData({ ...editingData, workingarea: e.target.value })}
                          className="text-gray-600 w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          required
                      >
                        <option value="">Select a Working Area</option>
                        <option value="Management">Management</option>
                        <option value="Business">Business</option>
                        <option value="Community">Community</option>
                        <option value="International Growth and Development">International Growth and Development</option>
                        <option value="Training">Training</option>
                      </select>
                    </div>

                    {/* Activity Title */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700">Activity Title</label>
                      <input
                          type="text"
                          value={editingData.title}
                          onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                      />
                    </div>

                    {/* Date */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <input
                          type="date"
                          value={editingData.date}
                          onChange={(e) => setEditingData({ ...editingData, date: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                      />
                    </div>

                    {/* Time */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700">Time</label>
                      <input
                          type="time"
                          value={editingData.time}
                          onChange={(e) => setEditingData({ ...editingData, time: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                      />
                    </div>

                    {/* Location */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <input
                          type="text"
                          value={editingData.location}
                          onChange={(e) => setEditingData({ ...editingData, location: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                      />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                          value={editingData.description}
                          onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                      />
                    </div>

                    {/* Images */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700">Images</label>
                      <div className="flex flex-wrap gap-2">
                        {editingData.images?.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                  src={`https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati/${image}`}
                                  alt={`Selected ${index}`}
                                  className="w-24 h-24 object-cover rounded-md"
                              />
                              <button
                                  type="button"
                                  onClick={() => {
                                    const newImages = editingData.images.filter((_, i) => i !== index);
                                    setEditingData({ ...editingData, images: newImages });
                                  }}
                                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                              >
                                X
                              </button>
                            </div>
                        ))}
                        {/* Plus Icon for Uploading New Image */}
                        <div className="relative w-24 h-24 border border-dashed border-gray-300 flex items-center justify-center rounded-md cursor-pointer">
                          <Plus size={24} className="text-gray-600" />
                          <input
                              type="file"
                              onChange={handleFileUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* YouTube URLs */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700">YouTube URLs</label>
                      {editingData.youtubeUrls?.map((url, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => {
                                  const newUrls = [...editingData.youtubeUrls];
                                  newUrls[index] = e.target.value;
                                  setEditingData({ ...editingData, youtubeUrls: newUrls });
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                  setEditingData({
                                    ...editingData,
                                    youtubeUrls: editingData.youtubeUrls.filter((_, i) => i !== index),
                                  });
                                }}
                                className="text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                      ))}
                      <button
                          type="button"
                          onClick={() =>
                              setEditingData({
                                ...editingData,
                                youtubeUrls: [...(editingData.youtubeUrls || []), ""],
                              })
                          }
                          className="text-blue-500 text-sm"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md mt-2">
                    Update
                  </button>
                </form>
              </div>
            </div>
        )}

        <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />
      </div>
  );
};

export default Workingdata;
