import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Star, Pencil, X, Plus } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Custom Confirmation Modal Component
// eslint-disable-next-line react/prop-types
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <p className="text-gray-800 mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
              onClick={onCancel}
              title="Cancel Action"
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
          >
            Cancel
          </button>
          <button
              onClick={onConfirm}
              title="Confirm Action"
              className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
);

const Workingdata = () => {
  const [submittedData, setSubmittedData] = useState([]);
  const [selectedWorkingArea, setSelectedWorkingArea] = useState("All");
  const [editingData, setEditingData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  // Helper to format date from YYYY-MM-DD to DD-MM-YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  // Fetch and sort data (by id in ascending order)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
            "https://jciamravati.in/api/v1/workingareas/getrecord"
        );
        const records = response.data.data || [];
        const sortedRecords = records.sort(
            (a, b) => Number(a.id) - Number(b.id)
        );
        setSubmittedData(sortedRecords);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data.");
      }
    };
    fetchData();
  }, []);

  const handleDeleteConfirmed = async (id) => {
    try {
      await axios.delete(
          `https://jciamravati.in/api/v1/workingareas/deleterecord/${id}`
      );
      toast.success("Item deleted successfully!");
      setSubmittedData((prev) => prev.filter((item) => item.id !== id));
      if (editingData && editingData.id === id) {
        setIsModalOpen(false);
        setEditingData(null);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete the item. Please try again.");
    }
  };

  const handleDeleteClick = (id, imagename) => {
    setConfirmModal({
      message: "Are you sure you want to delete this event?",
      onConfirm: () => {
        handleDeleteConfirmed(id);
        setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null),
    });
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

  // When editing, split the date into day, month, and year.
  const handleEdit = (data) => {
    let dateDay = "",
        dateMonth = "",
        dateYear = "";
    if (data.date) {
      const parts = data.date.split("-");
      if (parts.length === 3) {
        dateYear = parseInt(parts[0], 10);
        dateMonth = parseInt(parts[1], 10);
        dateDay = parseInt(parts[2], 10);
      }
    }
    let imagesArray = [];
    if (data.images) {
      imagesArray = data.images;
    } else if (data.imagename) {
      imagesArray = data.imagename.split(",");
    }
    setEditingData({ ...data, dateDay, dateMonth, dateYear, images: imagesArray });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingData) return;
    const { dateDay, dateMonth, dateYear } = editingData;
    if (!dateDay || !dateMonth || !dateYear) {
      toast.error("Please fill in the date fields.");
      return;
    }
    const day = dateDay.toString().padStart(2, "0");
    const month = dateMonth.toString().padStart(2, "0");
    const fullDate = `${dateYear}-${month}-${day}`;
    const imagename = (editingData.images || []).join(",");
    const updatedData = { ...editingData, date: fullDate, imagename };
    delete updatedData.dateDay;
    delete updatedData.dateMonth;
    delete updatedData.dateYear;
    delete updatedData.images;
    try {
      const response = await axios.patch(
          `https://jciamravati.in/api/v1/workingareas/updatedata/${editingData.id}`,
          updatedData
      );
      if (response.status === 200) {
        setSubmittedData((prevData) =>
            prevData.map((item) =>
                item.id === editingData.id ? { ...item, ...updatedData } : item
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

  // Allow multiple image uploads and only accept images.
  const handleFileUpload = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("file", file);
      });
      try {
        const response = await axios.post(
            "https://media.bizonance.in/api/v1/image/upload/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
        );
        const { uploadedImages } = response.data;
        let filenames = [];
        if (Array.isArray(uploadedImages)) {
          filenames = uploadedImages.map((img) => img.filename);
        } else {
          filenames = [response.data.filename];
        }
        const newImages = [...(editingData.images || []), ...filenames];
        setEditingData({ ...editingData, images: newImages });
      } catch (err) {
        console.error("Error uploading image:", err);
        toast.error("Failed to upload image.");
      }
    }
  };

  // Filter data based on the selected working area.
  const filteredData =
      selectedWorkingArea === "All"
          ? submittedData
          : selectedWorkingArea === "highlighted"
              ? submittedData.filter((data) => data.highlighted)
              : submittedData.filter((data) => data.workingarea === selectedWorkingArea);

  return (
      <div
          className="p-6 bg-gray-50 overflow-hidden"
          style={{ height: "calc(100vh - 140px)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by:
              </label>
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
                <option value="International Growth and Development">
                  International Growth
                </option>
                <option value="Training">Training</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
              {filteredData.map((data) => {
                // Determine the first available image from either an images array or the imagename string.
                let firstImage = "";
                if (data.images && Array.isArray(data.images) && data.images.length > 0) {
                  firstImage = data.images[0];
                } else if (data.imagename) {
                  const imagesArray = data.imagename.includes(",")
                      ? data.imagename.split(",")
                      : [data.imagename];
                  firstImage = imagesArray[0];
                }

                return (
                    <div
                        key={data.id}
                        className="flex flex-col border border-gray-300 bg-white rounded-lg shadow-sm"
                    >
                      {/* Display the event image (if available) on the upper side of the card */}
                      {firstImage && (
                          <img
                              src={`https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati/${firstImage}`}
                              alt={data.title}
                              className="w-full h-40 object-cover rounded-t-lg"
                          />
                      )}
                      <div className="p-4 flex flex-col flex-grow space-y-1">
                        <p className="text-sm font-bold text-gray-600 whitespace-nowrap">
                           {data.workingarea}
                        </p>
                        <p className="text-lg font-semibold text-gray-800">
                          <span className="font-bold">Title:</span> {data.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-bold">Date:</span> {formatDate(data.date)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-bold">Time:</span> {data.time}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-bold">Location:</span> {data.location}
                        </p>
                        <div className="mt-auto flex gap-3 justify-end">
                          <button
                              title="Edit"
                              onClick={() => handleEdit(data)}
                              className="p-2 bg-cyan-600 text-white rounded-full"
                          >
                            <Pencil size={20} />
                          </button>
                          <button
                              title="Toggle Highlight"
                              onClick={() => handleHighlight(data.id)}
                              className={`p-2 rounded-full ${
                                  data.highlighted
                                      ? "bg-yellow-300 text-yellow-900"
                                      : "bg-gray-200 text-gray-600"
                              }`}
                          >
                            <Star size={20} />
                          </button>
                          <button
                              title="Delete"
                              onClick={() => handleDeleteClick(data.id, data.imagename)}
                              className="p-2 bg-red-100 text-red-600 rounded-full"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
          </div>
        </div>

        {isModalOpen && editingData && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-4 rounded-lg shadow-lg w-[800px]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Edit Record</h2>
                  <button
                      title="Close"
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Working Area */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Working Area
                      </label>
                      <select
                          value={editingData.workingarea}
                          onChange={(e) =>
                              setEditingData({
                                ...editingData,
                                workingarea: e.target.value,
                              })
                          }
                          className="text-gray-600 w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          required
                      >
                        <option value="">Select a Working Area</option>
                        <option value="Management">Management</option>
                        <option value="Business">Business</option>
                        <option value="Community">Community</option>
                        <option value="International Growth and Development">
                          International Growth and Development
                        </option>
                        <option value="Training">Training</option>
                      </select>
                    </div>

                    {/* Activity Title */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Activity Title
                      </label>
                      <input
                          type="text"
                          value={editingData.title}
                          onChange={(e) =>
                              setEditingData({ ...editingData, title: e.target.value })
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                      />
                    </div>

                    {/* Date with dropdowns */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Date
                      </label>
                      <div className="flex space-x-2">
                        <select
                            name="dateDay"
                            value={editingData.dateDay || ""}
                            onChange={(e) =>
                                setEditingData({
                                  ...editingData,
                                  dateDay: e.target.value,
                                })
                            }
                            className="text-gray-400 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        >
                          <option value="">Day</option>
                          {Array.from({ length: 31 }, (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1}
                              </option>
                          ))}
                        </select>
                        <select
                            name="dateMonth"
                            value={editingData.dateMonth || ""}
                            onChange={(e) =>
                                setEditingData({
                                  ...editingData,
                                  dateMonth: e.target.value,
                                })
                            }
                            className="text-gray-400 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        >
                          <option value="">Month</option>
                          {Array.from({ length: 12 }, (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1}
                              </option>
                          ))}
                        </select>
                        <select
                            name="dateYear"
                            value={editingData.dateYear || ""}
                            onChange={(e) =>
                                setEditingData({
                                  ...editingData,
                                  dateYear: e.target.value,
                                })
                            }
                            className="text-gray-400 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        >
                          <option value="">Year</option>
                          {Array.from(
                              { length: new Date().getFullYear() - 2020 + 1 },
                              (_, i) => {
                                const year = 2020 + i;
                                return (
                                    <option key={year} value={year}>
                                      {year}
                                    </option>
                                );
                              }
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Time
                      </label>
                      <input
                          type="time"
                          value={editingData.time}
                          onChange={(e) =>
                              setEditingData({ ...editingData, time: e.target.value })
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                      />
                    </div>

                    {/* Location */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <input
                          type="text"
                          value={editingData.location}
                          onChange={(e) =>
                              setEditingData({
                                ...editingData,
                                location: e.target.value,
                              })
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                      />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                          value={editingData.description}
                          onChange={(e) =>
                              setEditingData({
                                ...editingData,
                                description: e.target.value,
                              })
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                      />
                    </div>

                    {/* Images */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Images
                      </label>
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
                                  title="Remove Image"
                                  onClick={() => {
                                    const newImages = editingData.images.filter(
                                        (_, i) => i !== index
                                    );
                                    setEditingData({ ...editingData, images: newImages });
                                  }}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                              >
                                <X size={16} />
                              </button>
                            </div>
                        ))}
                        {/* Plus Icon for Uploading New Images */}
                        <div
                            title="Upload Image"
                            className="relative w-24 h-24 border border-dashed border-gray-300 flex items-center justify-center rounded-md cursor-pointer"
                        >
                          <Plus size={24} className="text-gray-600" />
                          <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* YouTube URLs */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700">
                        YouTube URLs
                      </label>
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
                                title="Remove YouTube URL"
                                onClick={() =>
                                    setEditingData({
                                      ...editingData,
                                      youtubeUrls: editingData.youtubeUrls.filter(
                                          (_, i) => i !== index
                                      ),
                                    })
                                }
                                className="text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                      ))}
                      <button
                          type="button"
                          title="Add YouTube URL"
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

                  <button
                      type="submit"
                      title="Update Record"
                      className="w-full bg-blue-600 text-white p-2 rounded-md mt-2"
                  >
                    Update
                  </button>
                </form>
              </div>
            </div>
        )}

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
};

export default Workingdata;
