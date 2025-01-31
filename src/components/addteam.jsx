import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
import "../App.css";

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
      <div className="flex flex-col items-center overflow-hidden overflow-y-scroll custom-scrollbar" style={{ height: "calc(100vh - 140px)" }}>
        {/* <h1 className="text-4xl font-bold mt-5 uppercase">Team</h1> */}
        <div className="w-full flex flex-col gap-4 p-4">
          {/* Form Section */}
          <div className=" p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Enter Details</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none"
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
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none"
                    required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-white px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none"
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
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none"
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

        </div>
      </div>
  );
};

export default Addteam;
