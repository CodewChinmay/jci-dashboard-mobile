import React, { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import axios from "axios";

const Header = () => {
    const [selectedImage, setSelectedImage] = useState(null); // For storing selected image
    const [imagePreview, setImagePreview] = useState(null); // For displaying image preview
    const [imageUrl, setImageUrl] = useState(null); // For storing the final uploaded image URL or filename
    const [images, setImages] = useState([]); // For storing fetched images
    const [isSubmitting, setIsSubmitting] = useState(false); // For handling form submission state

    // Fetch images on component mount
    useEffect(() => {
        fetchImages();
    }, []);

    // Fetch the list of images from the backend
    const fetchImages = async () => {
        try {
            const response = await axios.get("https://jciamravati.in/api/v1/header/getJCIlogo");

            if (response.data && response.data.logoNames) {
                // Construct base URL for image fetching
                const baseUrl = "https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati";

                // Map the image names to create full URLs
                const mappedImages = response.data.logoNames.map((name) => ({
                    url: `${baseUrl}/${name}?q=50&f=webp`, // Ensure URL is properly formatted
                    id: name, // Using the image name as ID
                }));

                setImages(mappedImages); // Set the images state
            } else {
                console.error("Invalid response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching gallery images:", error.message);
        }
    };

    // Handle image selection (Pencil icon)
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file)); // Create a preview of the image
        }
    };

    // Handle image upload (Pencil icon clicked)
    const handleImageUpload = async () => {
        if (!selectedImage) {
            alert("Please select an image first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedImage); // Appending the selected image

        setIsSubmitting(true); // Set submitting state to true

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

            alert(`Image uploaded successfully: ${uploadResponse.data.message}`);

            if (uploadResponse.data.message === "Images uploaded successfully") {
                const filename = uploadResponse.data.uploadedImages[0].filename;

                // Set the image URL or filename for display
                setImageUrl(filename);

                // Send the filename to your local API
                await axios.post(
                    "https://jciamravati.in/api/v1/header/upload",
                    { filenames: [filename] },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
            }

            setSelectedImage(null); // Clear selected image after upload
            setImagePreview(null); // Clear image preview
            fetchImages(); // Refresh the images list after upload
        } catch (error) {
            console.error("Error uploading image:", error.response?.data || error.message);
            alert("Failed to upload the image. Please try again.");
        } finally {
            setIsSubmitting(false); // Set submitting state to false
        }
    };

    // Handle image deletion (Trash icon clicked)
    const handleImageDelete = async (imageName) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this image?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`https://jciamravati.in/api/v1/header/delete/${imageName}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Image deleted successfully!");
                fetchImages(); // Refresh the images list after delete
            } else {
                const data = await response.json();
                alert(data.error || "Failed to delete the image.");
            }
        } catch (error) {
            console.error("Error deleting image:", error);
            alert("Error deleting image.");
        }
    };


    return (
        <header className="py-4">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Row: Logo, Edit, Delete */}
                    <div className="flex items-center justify-between bg-gray-300 p-4 shadow-md">
                        <div className="flex items-center space-x-4">
                            <div className="w-[140px] h-[80px] bg-white flex items-center justify-center">
                                {/* Display the first uploaded image or default circle */}
                                {images.length > 0 ? (
                                    <img
                                        src={images[0].url} // Use the correct URL here
                                        alt="Logo"
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Logo"
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <span className="text-gray-500 font-semibold">Logo</span>
                                )}
                            </div>
                            <span className="text-gray-700 text-lg font-semibold">JCI Amravati Logo</span>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => document.getElementById("imageInput").click()}
                                className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none"
                            >
                                <Pencil size={20} />
                            </button>
                            <button
                                onClick={() => handleImageDelete(images[0]?.id)} // Safely access the first image's ID
                                className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Second Row: Another Logo, Edit, Delete */}
                    <div className="flex items-center justify-between bg-gray-300 p-4 shadow-md">
                        <div className="flex items-center space-x-4">
                            <div className="w-[140px] h-[80px] bg-white flex items-center justify-center">
                                {images.length > 1 ? (
                                    <img
                                        src={images[1].url} // Use the correct URL here
                                        alt="Logo"
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <span className="text-gray-500 font-semibold">Logo</span>
                                )}
                            </div>
                            <span className="text-gray-700 text-lg font-semibold">Riseup</span>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => document.getElementById("imageInput").click()}
                                className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none"
                            >
                                <Pencil size={20} />
                            </button>
                            <button
                                onClick={() => handleImageDelete(images[1]?.id)} // Safely access the second image's ID
                                className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <input
                    type="file"
                    id="imageInput"
                    className="hidden"
                    onChange={handleImageSelect}
                />

                {imagePreview && (
                    <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700">Image Preview</h3>
                        <img
                            src={imagePreview}
                            alt="Selected"
                            className="w-32 h-32 object-cover mt-2 rounded-md"
                        />
                        <button
                            onClick={handleImageUpload}
                            className="mt-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 focus:outline-none"
                        >
                            {isSubmitting ? "Uploading..." : "Upload Image"}
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
