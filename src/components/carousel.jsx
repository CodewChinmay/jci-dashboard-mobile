import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, Eye, Trash2, X } from "lucide-react";

const carousel = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Fetch images from the server
  const fetchImages = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/v1/carousel/images");
      console.log(response.data.imageNames);

      // Map the image names to full URLs
      const baseUrl =
        "https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati";
      const mappedImages = response.data.imageNames.map((name) => ({
        url: `${baseUrl}/${name}?q=50%&&f=webp`,
        id: name, // Assuming the name can be used as a unique identifier
      }));

      setImages(mappedImages);
    } catch (error) {
      console.error("Error fetching carousel images:", error.message);
      alert("Failed to fetch carousel images. Please try again.");
    }
  };

  // Handle image deletion
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/v1/carousel/${id}`);
      if (response.status === 200) {
        setImages(images.filter((image) => image.id !== id));
      } else {
        alert("Failed to delete image. Server responded with an error.");
      }
    } catch (error) {
      console.error("Error deleting image:", error.response || error);
      alert("Failed to delete image. Please check the console for more details.");
    }
  };

  // Handle file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedImage) {
      alert("Please select an image before submitting.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", selectedImage);
  
    setIsSubmitting(true);
  
    try {
      // Upload image to the external API
      const uploadResponse = await axios.post(
        "https://media.bizonance.in/api/v1/image/upload/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      alert(`Image uploaded successfully: ${uploadResponse.data.message}`);
      console.log(uploadResponse.data.uploadedImages);
  
      if (uploadResponse.data.message === "Images uploaded successfully") {
        // Extract filenames from the response
        const filenames = uploadResponse.data.uploadedImages.map((image) => image.filename);
  
        // Send the response to the local API with filenames
        await axios.post(
          "http://localhost:5000/api/v1/carousel/upload",
          { filenames }, // Only send the filenames
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
  
      // Reset state
      setSelectedImage(null);
      setPreviewImage(null);
      fetchImages();
    } catch (error) {
      console.error("Error uploading image:", error.response?.data || error.message);
      alert("Failed to upload the image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open lightbox
  const handleOpenLightbox = (image) => {
    setLightboxImage(image);
  };

  // Close lightbox
  const handleCloseLightbox = () => {
    setLightboxImage(null);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="p-4 overflow-hidden overflow-y-scroll" style={{ height: "calc(100vh - 80px)" }}>
      <h1 className="text-3xl font-bold text-gray-700 mb-6 text-center">Carousel Upload and Preview</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex gap-8 items-start justify-center">
          <div className="flex-1 place-items-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Upload Section</h2>
            <label
              htmlFor="imageUpload"
              className="w-[300px] h-[150px] flex items-center justify-center bg-gray-100 border-2 border-dashed border-blue-400 cursor-pointer hover:bg-gray-50 transition"
            >
              <PlusCircle className="w-12 h-12 text-blue-400" />
            </label>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-3 text-center">
              {selectedImage ? selectedImage.name : "Click the icon to choose an image"}
            </p>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">Preview Section</h2>
            {previewImage ? (
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg shadow-md overflow-hidden">
                <img src={previewImage} alt="Selected Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <p className="text-gray-500 text-center">No image selected for preview</p>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-10 py-3 rounded-lg text-white font-semibold transition ${
              isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 shadow-md"
            }`}
          >
            {isSubmitting ? "Uploading..." : "Submit"}
          </button>
        </div>
      </form>

      <div className="mt-10">
        <div className="grid grid-cols-3 gap-6">
          {images.length > 0 ? (
            images.map((image, index) => (
              <div
                key={image.id || index}
                className="relative w-full h-60 bg-gray-100 rounded-lg overflow-hidden shadow-md"
              >
                <img src={image.url} alt={`Uploaded Image ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                    onClick={() => handleOpenLightbox(image.url)}
                  >
                    <Eye className="w-5 h-5 text-blue-500" />
                  </button>
                  <button
                    className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                    onClick={() => handleDelete(image.id)}
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No images available</p>
          )}
        </div>
      </div>

      {lightboxImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow hover:bg-gray-100"
            onClick={handleCloseLightbox}
          >
            <X className="w-6 h-6 text-gray-800" />
          </button>
          <img src={lightboxImage} alt="Lightbox" className="max-w-4xl max-h-full" />
        </div>
      )}
    </div>
  );
};

export default carousel;
