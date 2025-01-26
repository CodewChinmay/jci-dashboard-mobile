import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
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

  // Fetch data from the GET API on component load
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

    // Check for required fields
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
            teamData,
            { headers: { "Content-Type": "application/json" } }
        );

        setSubmittedData((prev) => [...prev, postResponse.data.data]);
        alert("Data submitted successfully.");
      } else {
        alert("Image upload failed. Please check the response structure.");
      }

      // Reset form
      setSelectedImages([]);
      setPreviewImages([]);
      setFormData({
        name: "",
        post: "",
        role: "",
        imagename: "",
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
        await axios.get(link);
      }

      await axios.delete(`http://localhost:5000/api/v1/team/deleteteam/${id}`);
      alert("Item and related data deleted successfully!");
      setSubmittedData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete the item. Please try again.");
    }
  };

  const filteredData =
      selectedTeamRole === "All" ? submittedData : submittedData.filter((data) => data.role === selectedTeamRole);

  return (
      <div className="flex flex-col items-center overflow-hidden overflow-y-scroll" style={{ height: "calc(100vh - 80px)" }}>
        <h1 className="text-4xl font-bold mt-5 uppercase">Team</h1>
        <div className="w-full flex flex-col gap-4 p-4">
          {/* Form Section */}
          <div className="border-t-8 border-cyan-500 rounded-lg p-6 h-[500px] overflow-hidden overflow-y-scroll scrollbar-custom">
            <h2 className="text-2xl font-semibold mb-4">Enter Details</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm"
                    required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <input
                    type="text"
                    name="post"
                    value={formData.post}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm"
                    required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm"
                    required
                >
                  <option value="past president">Past president</option>
                  <option value="LGB member">LGB member</option>
                  <option value="General member">General member</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                <input
                    type="file"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm"
                    required
                />
              </div>

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

              <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-700"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>

          {/* Display Submitted Data Section */}
          <div className="border-t-8 border-cyan-500 rounded-lg p-6 h-[500px] overflow-hidden overflow-y-scroll scrollbar-custom">
            <h2 className="text-2xl font-semibold mb-4">
              Submitted Data <span className="text-cl font-normal text-gray-600">({filteredData.length})</span>
            </h2>

            {/* Dropdown to filter data */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
              <select
                  value={selectedTeamRole}
                  onChange={(e) => setSelectedTeamRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm"
              >
                <option value="All">All</option>
                <option value="past president">Past president</option>
                <option value="LGB member">LGB member</option>
                <option value="General member">General member</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredData.length === 0 ? (
                  <p className="text-gray-500">No data available for the selected role.</p>
              ) : (
                  filteredData.map((data) => (
                      <div
                          key={data.id}
                          className="p-4 flex justify-between items-center border-cyan-500 border border-t-4 rounded-lg bg-gray-100"
                      >
                        <img
                            src={`https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati/${data.imagename.split(",")[0]}`}
                            alt="Team Member"
                            className="w-16 h-16 object-cover rounded-full mr-4"
                        />
                        <div className="flex-1">
                          <p className="text-lg font-medium text-gray-700">
                            <span className="font-bold">Name:</span> {data.name}
                          </p>
                          <p className="text-md text-gray-600">
                            <span className="font-bold">Designation:</span> {data.post}
                          </p>
                        </div>
                        <Trash2
                            onClick={() => handleDelete(data.id, data.imagename)}
                            className="cursor-pointer text-white bg-gray-500 rounded-sm p-2 h-10 w-10 hover:bg-white hover:text-red-700"
                        />
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
