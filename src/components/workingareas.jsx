import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Star, Pencil } from "lucide-react";
import "../App.css";

const Workingareas = () => {
  const [formData, setFormData] = useState({
    workingArea: "",
    date: "",
    title: "",
    description: "",
    time: "",
    location: "",
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [submittedData, setSubmittedData] = useState([]);
  const [selectedWorkingArea, setSelectedWorkingArea] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  // Fetch data from the GET API on component load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
            "http://localhost:5000/api/v1/workingareas/getrecord"
        );
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

    // Convert "true" and "false" to booleans for filtering
    if (name === "selectedWorkingArea") {
      setSelectedWorkingArea(value === "true" ? true : value === "false" ? false : value);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { workingArea, date, title, description, time, location } = formData;

    if (selectedImages.length === 0) {
      alert("Please select at least one image before submitting.");
      return;
    }

    if (!workingArea || !date || !title || !description || !time) {
      alert("Please fill in all required fields.");
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

        const workingAreaData = {
          workingarea: workingArea,
          date,
          title,
          description,
          imagename: filenames.join(","),
          time,
          location,
          highlighted: false, // Add highlighted field here
        };

        const postResponse = await axios.post(
            "http://localhost:5000/api/v1/workingareas/upload",
            workingAreaData,
            { headers: { "Content-Type": "application/json" } }
        );

        setSubmittedData((prev) => [...prev, postResponse.data.data]); // Update state with new data
        alert("Data submitted successfully.");
      } else {
        alert("Image upload failed. Please check the response structure.");
      }

      setSelectedImages([]);
      setPreviewImages([]);
      setFormData({
        workingArea: "",
        date: "",
        title: "",
        description: "",
        time: "",
        location: "",
      });
    } catch (error) {
      console.error("Error uploading images and data:", error.response?.data || error.message);
      alert("Failed to upload the images and data. Please try again.");
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

      await axios.delete(`http://localhost:5000/api/v1/workingareas/deleterecord/${id}`);
      alert("Item and related data deleted successfully!");

      setSubmittedData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete the item. Please try again.");
    }
  };

  const handleHighlight = async (id) => {
    const currentItem = submittedData.find((data) => data.id === id);
    const newHighlightStatus = !currentItem.highlighted;

    try {
      const response = await axios.patch(
          `http://localhost:5000/api/v1/workingareas/highlight/${id}`,
          { highlighted: newHighlightStatus },
          { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        setSubmittedData((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, highlighted: newHighlightStatus } : item
            )
        );
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error updating highlighted status:", error);
      alert("Failed to update highlighted status.");
    }
  };

  const filteredData =
      selectedWorkingArea === "All"
          ? submittedData
          : selectedWorkingArea === true
              ? submittedData.filter((data) => data.highlighted === true)
              : selectedWorkingArea === false
                  ? submittedData.filter((data) => data.highlighted === false)
                  : submittedData.filter((data) => data.workingarea === selectedWorkingArea);

  const clearForm = () => {
    setFormData({
      workingArea: "",
      date: "",
      time: "",
      title: "",
      location: "",
      description: "",
      images: []
    });
    setPreviewImages([]);
  };

  return (
      <div
          className="flex flex-col items-center overflow-hidden overflow-y-scroll"
          style={{ height: "calc(100vh - 80px)" }}
      >
        <h1 className="text-4xl font-bold mt-5 uppercase">Working Areas</h1>
        <div className="w-full flex flex-col gap-4 p-4 ">
          {/* Form Section */}

          <div className="border-t-8 border-cyan-500 rounded-lg p-6 h-[500px] overflow-hidden overflow-y-scroll scrollbar-custom">
            <div className="controls flex justify-between items-center mb-4">
              <h2 className="text-2xl">Add Activity</h2>
              <h3 onClick={clearForm} className="underline text-1xl  hover:text-cyan-500">Clear</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Row 1: Working Area, Date, Time */}
              <div className="flex flex-wrap gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Working Area
                  </label>
                  <select
                      name="workingArea"
                      value={formData.workingArea}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-cyan-300"
                      required
                  >
                    <option value="">Select a Working Area</option>
                    <option value="Management" >Management</option>
                    <option value="Business">Business</option>
                    <option value="Community">Community</option>
                    <option value="International Growth and Development">
                      International Growth and Development
                    </option>
                    <option value="Training">Training</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Date
                  </label>
                  <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 shadow-sm focus:outline-none focus:ring focus:ring-cyan-300"
                      required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Time
                  </label>
                  <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-cyan-300"
                      required
                  />
                </div>
              </div>

              {/* Row 2: Title, Description */}
              <div className="flex flex-wrap gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Title
                  </label>
                  <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-cyan-300"
                      placeholder="Add Event Title"
                      required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Location
                  </label>
                  <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-cyan-300"
                      placeholder="Add Event Location"
                      required
                  />
                </div>
                <div className="flex-[2]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Description
                  </label>
                  <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-cyan-300"
                      placeholder="Add Description about your Event"
                      rows="4"
                      required
                  ></textarea>
                </div>
              </div>

              {/* Row 3: Upload Images */}
              <div className="flex flex-wrap gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Images
                  </label>
                  <input
                      type="file"
                      multiple
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border-2 border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-cyan-300"
                      required
                  />
                </div>
              </div>

              {/* Row 4: Image Previews */}
              <div className="flex flex-wrap gap-2">
                {previewImages.map((image, index) => (
                    <img
                        key={index}
                        src={image}
                        alt={`Preview ${index}`}
                        className="w-20 h-20 object-cover rounded-md"
                    />
                ))}
              </div>

              {/* Submit Button */}
              <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-700 shadow-md"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>

          {/* Display Submitted Data Section */}
          <div className="border-t-8 border-cyan-500 rounded-lg p-6 h-[500px] overflow-hidden overflow-y-scroll scrollbar-custom">
            <h2 className="text-2xl font-semibold mb-4">
              Activities{" "}
              <span className="text-cl font-normal text-gray-600">
              ({filteredData.length})
            </span>
            </h2>

            {/* Dropdown to filter data */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Working Area
              </label>
              <select
                  value={selectedWorkingArea}
                  onChange={handleChange}
                  name="selectedWorkingArea"
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-cyan-300"
              >
                <option value="All">All</option>
                <option value="true">Highlited Activities</option>
                <option value="Management">Management</option>
                <option value="Business">Business</option>
                <option value="Community">Community</option>
                <option value="International Growth and Development">
                  International Growth and Development
                </option>
                <option value="Training">Training</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredData.length === 0 ? (
                  <p className="text-gray-500">
                    No data available for the selected working area.
                  </p>
              ) : (
                  filteredData.map((data) => (
                      <div
                          key={data.id}
                          className="p-4 flex justify-between items-center border-cyan-500 border border-t-4 rounded-lg bg-gray-100"
                      >
                        <div>
                          <p className="text-md font-medium text-gray-600">
                            <span className="font-bold">Date:</span> {data.date}
                          </p>
                          <p className="text-3xl font-medium text-gray-700">
                            <span className="font-bold">Title:</span> {data.title}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Star
                              onClick={() => handleHighlight(data.id)}
                              className={`cursor-pointer p-2 h-10 w-10 rounded-sm ${
                                  data.highlighted ? "text-yellow-100 bg-yellow-400" : "bg-gray-300 text-gray-500"
                              }`}
                          />
                          <Trash2
                              onClick={() => handleDelete(data.id, data.imagename)}
                              className="cursor-pointer text-gray-500 bg-gray-300 rounded-sm p-2 h-10 w-10 hover:bg-white hover:text-red-700"
                          />
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

export default Workingareas;
