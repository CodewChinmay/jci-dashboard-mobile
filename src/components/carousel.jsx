import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, Eye, Trash2, X, RefreshCw } from "lucide-react";
import { Carousel } from "react-bootstrap";

const carousel = () => {
  const [selectedImages, setSelectedImages] = useState([]); // Store selected image files
  const [previewImages, setPreviewImages] = useState([]); // Store preview URLs
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Fetch images from the server
  const fetchImages = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/v1/carousel/images");
      const baseUrl =
          "https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati";
      const mappedImages = response.data.imageNames.map((name) => ({
        url: `${baseUrl}/${name}?q=50%&&f=webp`,
        id: name,
        name: name,
      }));

      setImages(mappedImages);
    } catch (error) {
      console.error("Error fetching gallery images:", error.message);
    }
  };

  // Handle image deletion
  const deleteImage = async (imageName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/carousel/delete/${imageName}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        fetchImages(); // Fetch updated images after successful deletion
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };
  
  
  

  // Handle image selection
  const handleImageChange = (e) => {
    const files = e.target.files;
    const imagesArray = Array.from(files);
    setSelectedImages(imagesArray);
    setPreviewImages(imagesArray.map((file) => URL.createObjectURL(file)));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedImages.length === 0) {
      alert("Please select at least one image before submitting.");
      return;
    }

    const formData = new FormData();
    selectedImages.forEach((image) => formData.append("file", image));

    setIsSubmitting(true);

    try {
      const uploadResponse = await axios.post(
          "https://media.bizonance.in/api/v1/image/upload/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
      );

      alert(`Images uploaded successfully: ${uploadResponse.data.message}`);

      if (uploadResponse.data.message === "Images uploaded successfully") {
        const filenames = uploadResponse.data.uploadedImages.map((image) => image.filename);

        await axios.post(
            "http://localhost:5000/api/v1/carousel/upload",
            { filenames },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
        );
      }

      setSelectedImages([]);
      setPreviewImages([]);
      fetchImages();
    } catch (error) {
      console.error("Error uploading images:", error.response?.data || error.message);
      alert("Failed to upload the images. Please try again.");
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
          <div className="flex flex-col items-center">
            <label
                htmlFor="imageUpload"
                className="w-[400px] h-[240px] flex items-center justify-center bg-gray-100 border-2 border-dashed border-blue-400 cursor-pointer hover:bg-gray-50 transition relative"
            >
              {previewImages.length > 0 ? (
                  <img
                      src={previewImages[previewImages.length - 1]} // Display the last selected image
                      alt="Selected Preview"
                      className="w-full h-full object-cover rounded-lg"
                  />
              ) : (
                  <PlusCircle className="w-12 h-12 text-blue-400" />
              )}
            </label>
            <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageChange}
                multiple
                className="hidden"
            />
            <p className="text-sm text-gray-500 mt-3 text-center">
              {selectedImages.length > 0 ? `${selectedImages.length} image(s) selected` : "Click the icon to choose images"}
            </p>
            <h3 onClick={() => {
              setSelectedImages([]);
              setPreviewImages([]);
            }} className="underline text-1xl  hover:text-cyan-500">Clear</h3>
          </div>

          <div className="flex justify-end space-x-5">
            <button
                type="button"
                className={`px-3 py-1 rounded-full text-white font-semibold transition bg-cyan-500 hover:bg-cyan-600`}
                onClick={fetchImages}
            >
              <RefreshCw />
            </button>
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
                      <img
                          src={image.url}
                          alt={`Uploaded Image ${index + 1}`}
                          className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                            className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                            onClick={() => handleOpenLightbox(image.url)}
                        >
                          <Eye className="w-5 h-5 text-blue-500" />
                        </button>
                        <button
                            className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                            onClick={() => deleteImage(image.name)}

                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                        {/* <button
                            className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                            onClick={() => deleteImage(image.name)}

                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button> */}
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
