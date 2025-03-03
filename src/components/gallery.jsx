import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, Trash2, X } from "lucide-react";
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

  // Fetch images from the server
  const fetchImages = async () => {
    try {
      const response = await axios.get("https://jciamravati.in/api/v1/gallery/images");
      console.log("Gallery API Response:", response.data);
      if (!response.data || !Array.isArray(response.data.imageNames)) {
        console.error("Invalid response format:", response.data);
        setImages([]);
        return;
      }
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

  // Handle image selection for upload
  const handleImageChange = (e) => {
    const files = e.target.files;
    const imagesArray = Array.from(files);
    // Validate: if more than 5 images are selected, show validation modal
    if (imagesArray.length > 5) {
      setShowValidationModal(true);
      return;
    }
    setSelectedImages(imagesArray);
    // Create preview URL for each selected image
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
      setSelectedImages([]);
      setPreviewImages([]);
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
      <div className="p-4 overflow-hidden overflow-y-scroll" style={{ height: "calc(100vh - 80px)" }}>
        <h1 className="text-3xl font-bold text-gray-700 mb-6 text-center">Gallery Images</h1>

        {/* Note for maximum allowed images */}
        <p className="text-sm text-gray-500 text-center mb-4">
          Note: Only 5 images can be submitted per submit.
        </p>

        {/* Flex container: Input Section on the left and Preview Section on the right (on md screens) */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Input Section */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex flex-col items-center">
                <label
                    htmlFor="imageUpload"
                    className="w-[400px] h-[240px] flex items-center justify-center bg-gray-100 border-2 border-dashed border-blue-400 cursor-pointer hover:bg-gray-50 transition relative"
                >
                  {previewImages.length === 0 && (
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
                  {selectedImages.length > 0
                      ? `${selectedImages.length} image(s) selected`
                      : "Click the icon to choose images"}
                </p>
                <h3
                    onClick={() => {
                      setSelectedImages([]);
                      setPreviewImages([]);
                    }}
                    className="underline text-sm text-gray-500 hover:text-cyan-500 cursor-pointer"
                >
                  Clear Image
                </h3>
              </div>

              {/* Submit Button (full width) */}
              <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 py-3 rounded-lg text-white font-semibold transition bg-blue-500 hover:bg-blue-600 shadow-md"
              >
                {isSubmitting ? "Uploading..." : "Submit"}
              </button>
            </form>
          </div>

          {/* Preview Section: Displayed only when images are selected */}
          {previewImages.length > 0 && (
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Selected Previews</h2>
                <div className="grid grid-cols-3 gap-2">
                  {previewImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                            src={image}
                            alt={`Preview ${index}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-300 cursor-pointer"
                            onClick={() => handleOpenLightbox(image)}
                        />
                        <button
                            type="button"
                            onClick={() => removePreview(index)}
                            className="absolute top-1 right-1 bg-gray-200 rounded-full p-1 hover:bg-gray-400"
                        >
                          <X className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                  ))}
                </div>
              </div>
          )}
        </div>

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

        {/* Validation Modal for exceeding 5 images */}
        {showValidationModal && (
            <AlertModal
                message="Only 5 images can be submitted per submit."
                onClose={() => setShowValidationModal(false)}
            />
        )}

        <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />
      </div>
  );
};

export default Gallery;
