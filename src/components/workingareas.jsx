import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Star, Plus, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Workingareas = () => {
  const [formData, setFormData] = useState({
    workingArea: "",
    dateDay: "",
    dateMonth: "",
    dateYear: "",
    title: "",
    description: "",
    time: "", // hh:mm format
    timeMeridiem: "AM", // AM or PM
    location: "",
    youtubeUrls: [],
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [submittedData, setSubmittedData] = useState([]);
  const [selectedWorkingArea, setSelectedWorkingArea] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://jciamravati.in/api/v1/workingareas/getrecord"
        );
        setSubmittedData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error fetching data.");
      }
    };

    fetchData();
  }, []);

  // Enhanced helper function to extract YouTube embed URL
  const getYoutubeEmbedUrl = (url) => {
    try {
      if (url.includes("youtube.com/embed/")) {
        return url;
      }
      const parsedUrl = new URL(url);
      let videoId = "";

      if (parsedUrl.hostname === "youtu.be") {
        videoId = parsedUrl.pathname.slice(1);
      } else if (parsedUrl.hostname.includes("youtube.com")) {
        if (parsedUrl.pathname.startsWith("/embed/")) {
          return url;
        }
        if (parsedUrl.pathname.startsWith("/shorts/")) {
          const parts = parsedUrl.pathname.split("/");
          videoId = parts[2];
        } else if (parsedUrl.pathname.startsWith("/v/")) {
          const parts = parsedUrl.pathname.split("/");
          videoId = parts[2];
        } else {
          videoId = parsedUrl.searchParams.get("v");
        }
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch (error) {
      return null;
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "selectedWorkingArea") {
      setSelectedWorkingArea(
        value === "true" ? true : value === "false" ? false : value
      );
    } else {
      setSelectedOption(value);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    const imagePreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(imagePreviews);
  };

  const handleYoutubeUrlChange = (index, value) => {
    const updatedUrls = [...formData.youtubeUrls];
    updatedUrls[index] = value;
    setFormData((prev) => ({ ...prev, youtubeUrls: updatedUrls }));
  };

  const addYoutubeUrl = () => {
    setFormData((prev) => ({ ...prev, youtubeUrls: [...prev.youtubeUrls, ""] }));
  };

  const removeYoutubeUrl = (index) => {
    setFormData((prev) => ({
      ...prev,
      youtubeUrls: prev.youtubeUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      workingArea,
      dateDay,
      dateMonth,
      dateYear,
      title,
      description,
      time,
      timeMeridiem,
      location,
      youtubeUrls,
    } = formData;

    if (selectedImages.length === 0) {
      toast.error("Please select at least one image before submitting.");
      return;
    }

    if (
      !workingArea ||
      !dateDay ||
      !dateMonth ||
      !dateYear ||
      !title ||
      !description ||
      !time
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Combine day, month, and year into a full date string (YYYY-MM-DD)
    const day = dateDay.toString().padStart(2, "0");
    const month = dateMonth.toString().padStart(2, "0");
    const fullDate = `${dateYear}-${month}-${day}`;

    // Combine time and meridiem to get 12-hour format (e.g., "12:30 PM")
    const formattedTime = `${time} ${timeMeridiem}`;

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

        const workingAreaData = {
          workingarea: workingArea,
          date: fullDate,
          title,
          description,
          imagename: filenames.join(","),
          time: formattedTime,
          location,
          youtubeUrls: youtubeUrls.filter((url) => url.trim() !== ""),
          highlighted: false,
        };

        const postResponse = await axios.post(
          "https://jciamravati.in/api/v1/workingareas/upload",
          workingAreaData,
          { headers: { "Content-Type": "application/json" } }
        );

        setSubmittedData((prev) => [...prev, postResponse.data.data]);
        toast.success("Data submitted successfully.");
        clearForm();
      } else {
        toast.error("Image upload failed. Please check the response structure.");
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
        const response = await axios.get(link);

        if (response.status !== 200) {
          console.error(`Failed to delete image: ${file}`);
          throw new Error(`Image deletion failed for ${file}`);
        }
      }

      await axios.delete(`https://jciamravati.in/api/v1/workingareas/deleterecord/${id}`);
      toast.success("Item and related data deleted successfully!");
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

  const clearForm = () => {
    setFormData({
      workingArea: "",
      dateDay: "",
      dateMonth: "",
      dateYear: "",
      time: "",
      timeMeridiem: "AM",
      title: "",
      location: "",
      description: "",
      youtubeUrls: [],
    });
    setSelectedImages([]);
    setPreviewImages([]);
    document.querySelector('input[type="file"]').value = "";
  };

  return (
    <div className="p-4 overflow-hidden overflow-y-scroll" style={{ height: "calc(100vh - 140px)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-medium text-gray-700">Working Area</label>
                  <select
                    name="workingArea"
                    value={formData.workingArea}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-medium text-gray-700">Activity Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Add Event Title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-medium text-gray-700">Activity Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Add Event Location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Activity Date</label>
                    <div className="flex space-x-2">
                      <select
                        name="dateDay"
                        value={formData.dateDay}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                        value={formData.dateMonth}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                        value={formData.dateYear}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                      >
                        <option value="">Year</option>
                        {Array.from({ length: new Date().getFullYear() - 2020 + 1 }, (_, i) => {
                          const year = 2020 + i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Activity Time</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        placeholder="hh:mm"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                      />
                      <select
                        name="timeMeridiem"
                        value={formData.timeMeridiem}
                        onChange={handleChange}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-medium text-gray-700">Upload Images</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                  {previewImages.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {previewImages.map((preview, index) => (
                        <img
                          key={index}
                          src={preview || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-medium text-gray-700">Video URLs</label>
                  {formData.youtubeUrls.map((url, index) => {
                    const embedUrl = getYoutubeEmbedUrl(url);
                    return (
                      <div key={index} className="flex flex-col mb-4">
                        <div className="flex items-center mb-2">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => handleYoutubeUrlChange(index, e.target.value)}
                            placeholder="Enter YouTube URL"
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeYoutubeUrl(index)}
                            className="ml-2 p-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        {embedUrl && (
                          <div className="relative" style={{ paddingBottom: "56.25%", height: 0, overflow: "hidden" }}>
                            <iframe
                              src={embedUrl}
                              title={`YouTube video ${index}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="absolute top-0 left-0 w-full h-full"
                            ></iframe>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={addYoutubeUrl}
                    className="mt-2 flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Video URL
                  </button>
                </div>
              </div>
              {/* Right Column */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700">Activity Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add Description about your Event"
                  rows="17"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                ></textarea>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default Workingareas;
