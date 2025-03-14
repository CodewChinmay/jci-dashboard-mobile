import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { PlusCircle, Trash2, X, Star } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

// Custom Confirmation Modal Component
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="mb-4 text-gray-800">{message}</p>
        <div className="flex justify-end gap-4">
          <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
);

// Custom Alert Modal Component for validation
const AlertModal = ({ message, onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="mb-4 text-gray-800">{message}</p>
        <div className="flex justify-end">
          <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            OK
          </button>
        </div>
      </div>
    </div>
);

const Gallery = () => {
  const [selectedImages, setSelectedImages] = useState([]); // Selected image files
  const [previewImages, setPreviewImages] = useState([]); // Preview URLs for selected images
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Create a ref for the file input element
  const fileInputRef = useRef(null);

  // Fetch images from the server and sort them by id
  const fetchImages = async () => {
    try {
      const response = await axios.get("https://jciamravati.in/api/v1/gallery/images");
      console.log("Gallery API Response:", response.data);
      const baseUrl =
          "https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati";

      let mappedImages = [];
      if (response.data.images && Array.isArray(response.data.images)) {
        mappedImages = response.data.images.map((img) => ({
          url: `${baseUrl}/${img.name}?q=50%&&f=webp`,
          id: img.id,
          name: img.name,
          highlighted: img.highlighted,
        }));
      } else if (response.data.imageNames && Array.isArray(response.data.imageNames)) {
        mappedImages = response.data.imageNames.map((name, index) => ({
          url: `${baseUrl}/${name}?q=50%&&f=webp`,
          id: index, // fallback id
          name: name,
          highlighted: false,
        }));
      } else {
        console.error("Invalid response format:", response.data);
      }
      // Sort the images by id so that the order remains consistent
      mappedImages.sort((a, b) => (a.id > b.id ? 1 : -1));
      setImages(mappedImages);
    } catch (error) {
      console.error("Error fetching gallery images:", error.message);
      setImages([]);
      toast.error("Error fetching gallery images.");
    }
  };

  // Delete an image after confirmation
  const deleteImage = async (imageName) => {
    try {
      const response = await axios.delete(
          `https://jciamravati.in/api/v1/gallery/delete/${imageName}`
      );
      if (response.status === 200) {
        toast.success(response.data.message);
        fetchImages();
      } else {
        toast.error("Failed to delete image.");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Error deleting image.");
    }
  };

  // Toggle highlight status of an image
  const toggleHighlight = async (image) => {
    try {
      const newHighlighted = !image.highlighted;
      const response = await axios.patch(
          `https://jciamravati.in/api/v1/gallery/highlight/${image.id}`,
          { highlighted: newHighlighted }
      );
      toast.success(response.data.message);
      setImages((prevImages) =>
          prevImages.map((img) =>
              img.id === image.id ? { ...img, highlighted: newHighlighted } : img
          )
      );
    } catch (error) {
      console.error("Error updating highlight status:", error);
      toast.error("Failed to update highlight status.");
    }
  };

  // Handle image selection for upload
  const handleImageChange = (e) => {
    const files = e.target.files;
    const imagesArray = Array.from(files);
    // All selected images appear in preview
    setSelectedImages(imagesArray);
    setPreviewImages(imagesArray.map((file) => URL.createObjectURL(file)));
  };

  // Remove a selected image from preview and selection arrays
  const removePreview = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle image upload submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Enforce a maximum of 5 images per submission
    if (selectedImages.length > 5) {
      setShowValidationModal(true);
      return;
    }
    if (selectedImages.length === 0) {
      toast.error("Please select at least one image before submitting.");
      return;
    }
    const formData = new FormData();
    selectedImages.forEach((image) => formData.append("file", image));
    setIsSubmitting(true);
    try {
      const uploadResponse = await axios.post(
          "https://media.bizonance.in/api/v1/image/upload/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success(`${uploadResponse.data.message}`);
      if (uploadResponse.data.message === "Images uploaded successfully") {
        const filenames = uploadResponse.data.uploadedImages.map((image) => image.filename);
        await axios.post(
            "https://jciamravati.in/api/v1/gallery/upload",
            { filenames },
            { headers: { "Content-Type": "application/json" } }
        );
      }
      // Reset selected images and preview images on successful submit
      setSelectedImages([]);
      setPreviewImages([]);
      // Clear the file input using the ref
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      fetchImages();
    } catch (error) {
      console.error("Error uploading images:", error.response?.data || error.message);
      toast.error("Failed to upload the images. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open the lightbox when the image is clicked
  const handleOpenLightbox = (image) => {
    setLightboxImage(image);
  };

  // Close the lightbox
  const handleCloseLightbox = () => {
    setLightboxImage(null);
  };

  // When delete button is clicked, open the custom confirmation modal
  const handleDeleteClick = (imageName) => {
    setConfirmModal({
      message: "Are you sure you want to delete this image?",
      onConfirm: () => {
        deleteImage(imageName);
        setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
      <div
          id="gallery-parent"
          className="p-4 overflow-hidden overflow-y-scroll scrollbar-custom"
          style={{ height: "calc(100vh - 140px)"}}
      >
        <h1 className="text-3xl font-bold text-gray-700 mb-6 text-center">
          Gallery Images
        </h1>
        <p className="text-sm text-gray-500 text-center mb-4">
          Note: Only 5 images can be submitted per submit.
        </p>
        {/* Input & Preview Section */}
        <form onSubmit={handleSubmit} className="mb-4 w-full">
          <input
              type="file"
              id="imageUpload"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleImageChange}
              className="w-full border border-gray-300 p-2 rounded mb-2"
          />
          {previewImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {previewImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                          src={image}
                          alt={`Preview ${index}`}
                          className="w-20 h-20 object-cover rounded border border-gray-300 cursor-pointer"
                          onClick={() => handleOpenLightbox(image)}
                      />
                      <button
                          type="button"
                          onClick={() => removePreview(index)}
                          className="absolute top-0 right-0 bg-gray-200 rounded-full p-1 hover:bg-gray-400"
                      >
                        <X className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                ))}
              </div>
          )}
          <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-cyan-500 text-white rounded"
          >
            {isSubmitting ? "Uploading..." : "Submit"}
          </button>
        </form>
        {/* Gallery Section */}
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
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => handleOpenLightbox(image.url)}
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        {/* Star button to toggle highlight */}
                        <button
                            type="button"
                            onClick={() => toggleHighlight(image)}
                            className={`p-2 rounded-full shadow hover:bg-gray-100 ${
                                image.highlighted ? "bg-yellow-500" : "bg-white"
                            }`}
                        >
                          <Star
                              className={`w-5 h-5 ${
                                  image.highlighted ? "text-white" : "text-gray-800"
                              }`}
                          />
                        </button>
                        {/* Delete button */}
                        <button
                            type="button"
                            className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                            onClick={() => handleDeleteClick(image.name)}
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
        {/* Lightbox */}
        {lightboxImage && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
              <button
                  type="button"
                  className="absolute top-4 right-4 bg-white p-2 rounded-full shadow hover:bg-gray-100"
                  onClick={handleCloseLightbox}
              >
                <X className="w-6 h-6 text-gray-800" />
              </button>
              <img src={lightboxImage} alt="Lightbox" className="max-w-4xl max-h-full" />
            </div>
        )}
        {/* Confirmation Modal */}
        {confirmModal && (
            <ConfirmModal
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={confirmModal.onCancel}
            />
        )}
        {/* Validation Modal */}
        {showValidationModal && (
            <AlertModal
                message="Only 5 images can be submitted per submit. Please remove the extra images."
                onClose={() => setShowValidationModal(false)}
            />
        )}
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />
      </div>
  );
};

export default Gallery;
