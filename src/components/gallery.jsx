import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, Eye, Trash2, X, RefreshCw } from "lucide-react";

const Gallery = () => {
  const [selectedImages, setSelectedImages] = useState([]); // Changed to hold an array of images
  const [previewImages, setPreviewImages] = useState([]); // Changed to hold an array of previews
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Fetch images from the server
  const fetchImages = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/v1/gallery/images");
      const baseUrl =
          "https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati";
      const mappedImages = response.data.imageNames.map((name) => ({
        url: `${baseUrl}/${name}?q=50%&&f=webp`,
        id: name, // Assuming this is the image's identifier
        name: name // Add the image name to the mapped data
      }));

      setImages(mappedImages);
    } catch (error) {
      console.error("Error fetching gallery images:", error.message);
    }
  };

  // Handle image deletion
  const deleteImage = async (imageName) => {
    try {
      // Fetch image details from your server if necessary
      const response = await fetch(`http://localhost:5000/api/v1/gallery/delete/${imageName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data.message); // Image deleted from database
        alert(data.message);

        // Now, delete the image from the external server
        const filenames = [imageName]; // Assume you have the image name, adjust if necessary

        for (const file of filenames) {
          const link = `https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati/${file}/?delete=both`;
          const externalResponse = await axios.get(link);

          if (externalResponse.status !== 200) {
            console.error(`Failed to delete image from external server: ${file}`);
            throw new Error(`Image deletion failed for ${file}`);
          } else {
            console.log(`Image deleted from external server: ${file}`);
          }
        }

        fetchImages();  // Optionally fetch images again to refresh the UI
      } else {
        console.error(data.error); // Error deleting image from database
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };


  // Handle multiple image selection
  const handleImageChange = (e) => {
    const files = e.target.files;
    const imagesArray = Array.from(files); // Convert the FileList to an array
    setSelectedImages(imagesArray);
    setPreviewImages(imagesArray.map(file => URL.createObjectURL(file)));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedImages.length === 0) {
      alert("Please select at least one image before submitting.");
      return;
    }

    const formData = new FormData();
    selectedImages.forEach(image => formData.append("file", image));

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
            "http://localhost:5000/api/v1/gallery/upload",
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
        <h1 className="text-3xl font-bold text-gray-700 mb-6 text-center">Gallery Upload and Preview</h1>

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
                  multiple // Allow multiple image selection
                  className="hidden"
              />
              <p className="text-sm text-gray-500 mt-3 text-center">
                {selectedImages.length > 0 ? `${selectedImages.length} image(s) selected` : "Click the icon to choose images"}
              </p>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">Preview Section</h2>
              {previewImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {previewImages.map((image, index) => (
                        <div key={index} className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg shadow-md overflow-hidden">
                          <img src={image} alt={`Selected Preview ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                  </div>
              ) : (
                  <p className="text-gray-500 text-center">No images selected for preview</p>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-5">
            <button
                type="button"
                className={`px-3 py-1 rounded-full text-white font-semibold transition bg-cyan-500 hover:bg-cyan-600`} onClick={fetchImages}
            >
              <RefreshCw/>
            </button>
            <button
                type="submit"
                disabled={isSubmitting}
                className={`px-10 py-3 rounded-lg text-white font-semibold transition ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 shadow-md"}`}
            >
              {isSubmitting ? "Uploading..." : "Submit"}
            </button>
          </div>
        </form>

        <div className="mt-10">
          <div className="grid grid-cols-3 gap-6">
            {images.length > 0 ? (
                images.map((image, index) => (
                    <div key={image.id || index} className="relative w-full h-60 bg-gray-100 rounded-lg overflow-hidden shadow-md">
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
                            onClick={() => deleteImage(image.name)} // Use image.name to call the delete function
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

export default Gallery;
