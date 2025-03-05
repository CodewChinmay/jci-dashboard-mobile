import React, { useState, useEffect } from "react";
import axios from "axios";
import { Star, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Updated helper function to support YouTube Shorts
const extractYoutubeId = (url) => {
    if (!url) return "";
    // Check for YouTube Shorts URL pattern
    const shortsMatch = url.match(/\/shorts\/([^?]+)/);
    if (shortsMatch && shortsMatch[1]) return shortsMatch[1];
    // Handle shortened youtu.be URLs
    const shortUrlMatch = url.match(/youtu\.be\/([^?]+)/);
    if (shortUrlMatch && shortUrlMatch[1]) return shortUrlMatch[1];
    // Handle full-length URLs with "v" parameter
    const regex = /[?&]v=([^&#]*)/;
    const match = url.match(regex);
    if (match && match[1]) return match[1];
    // Fallback: return the last segment
    const parts = url.split("/");
    return parts[parts.length - 1];
};

// Custom Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
                <p className="text-gray-800 mb-4">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const YoutubeGallery = () => {
    const [youtubeUrls, setYoutubeUrls] = useState([]);
    const [newUrl, setNewUrl] = useState("");
    const [loading, setLoading] = useState(false);
    // State for confirmation modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState(null);

    // Fetch all YouTube URL records
    const fetchYoutubeUrls = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://jciamravati.in/api/v1/youtube/get");
            // Assuming response.data.data is an array of YouTube URL objects
            setYoutubeUrls(response.data.data);
        } catch (error) {
            console.error("Error fetching YouTube URLs:", error);
            toast.error("Error fetching YouTube URLs");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchYoutubeUrls();
    }, []);

    // Handler to add a new YouTube URL
    const handleAddUrl = async (e) => {
        e.preventDefault();
        if (!newUrl.trim()) {
            toast.error("Please enter a valid YouTube URL");
            return;
        }
        try {
            const response = await axios.post("https://jciamravati.in/api/v1/youtube/create", {
                url: newUrl,
                highlighted: false,
            });
            toast.success(response.data.message);
            setNewUrl("");
            fetchYoutubeUrls();
        } catch (error) {
            console.error("Error adding YouTube URL:", error);
            toast.error("Error adding YouTube URL");
        }
    };

    // Handler to toggle highlight status
    const handleToggleHighlight = async (id, currentStatus) => {
        try {
            const response = await axios.patch(
                `https://jciamravati.in/api/v1/youtube/yt/highlight/${id}`,
                { highlighted: !currentStatus }
            );
            toast.success(response.data.message);
            fetchYoutubeUrls();
        } catch (error) {
            console.error("Error toggling highlight:", error);
            toast.error("Error toggling highlight");
        }
    };

    // Handler to delete a URL record (called after confirmation)
    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`https://jciamravati.in/api/v1/youtube/delete/${id}`);
            toast.success(response.data.message);
            fetchYoutubeUrls();
        } catch (error) {
            console.error("Error deleting URL:", error);
            toast.error("Error deleting URL");
        }
    };

    // Function to open delete confirmation modal
    const openDeleteModal = (id) => {
        setVideoToDelete(id);
        setDeleteModalOpen(true);
    };

    // Confirm deletion
    const confirmDelete = async () => {
        if (videoToDelete) {
            await handleDelete(videoToDelete);
            setVideoToDelete(null);
        }
        setDeleteModalOpen(false);
    };

    // Close the modal without deleting
    const closeModal = () => {
        setDeleteModalOpen(false);
        setVideoToDelete(null);
    };

    return (
        <div className="container mx-auto px-4 py-4">
            {/* Form to add a new YouTube URL */}
            <div className="bg-white rounded-lg shadow-xl p-4 mb-6">
                <form onSubmit={handleAddUrl}>
                    <label htmlFor="youtubeUrl" className="block text-gray-700 font-medium mb-2">
                        Add YouTube URL
                    </label>
                    <div className="flex">
                        <input
                            type="text"
                            id="youtubeUrl"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            placeholder="Enter YouTube URL"
                            className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="bg-red-500 text-white px-3 py-2 rounded-r-lg hover:bg-blue-600 transition"
                        >
                            +
                        </button>
                    </div>
                </form>
            </div>

            {loading ? (
                <p className="text-center">Loading...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {youtubeUrls.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-lg shadow-xl overflow-hidden relative"
                        >
                            <img
                                src={`https://img.youtube.com/vi/${extractYoutubeId(item.url)}/0.jpg`}
                                alt="YouTube Thumbnail"
                                className="w-full h-48 object-cover"
                            />
                            {/* Absolute icons container */}
                            <div className="absolute top-2 right-2 flex space-x-2">
                                <button
                                    onClick={() => handleToggleHighlight(item.id, item.highlighted)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full transition ${
                                        item.highlighted
                                            ? "bg-yellow-500 text-white"
                                            : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
                                    }`}
                                >
                                    <Star className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => openDeleteModal(item.id)}
                                    className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeModal}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this video?"
            />
        </div>
    );
};

export default YoutubeGallery;
