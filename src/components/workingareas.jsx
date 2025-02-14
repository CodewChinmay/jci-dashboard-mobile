import React, { useState, useEffect } from "react"
import axios from "axios"
import { Trash2, Star, Plus, X, } from "lucide-react"


const Workingareas = () => {
  const [formData, setFormData] = useState({
    workingArea: "",
    date: "",
    title: "",
    description: "",
    time: "",
    location: "",
    youtubeUrls: [],
  })
  const [selectedImages, setSelectedImages] = useState([])
  const [previewImages, setPreviewImages] = useState([])
  const [submittedData, setSubmittedData] = useState([])
  const [selectedWorkingArea, setSelectedWorkingArea] = useState("All")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedOption, setSelectedOption] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://jciamravati.in/api/v1/workingareas/getrecord")
        setSubmittedData(response.data.data || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "selectedWorkingArea") {
      setSelectedWorkingArea(value === "true" ? true : value === "false" ? false : value)
    } else {
      setSelectedOption(value)
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedImages(files)

    const imagePreviews = files.map((file) => URL.createObjectURL(file))
    setPreviewImages(imagePreviews)
  }

  const handleYoutubeUrlChange = (index, value) => {
    const updatedUrls = [...formData.youtubeUrls]
    updatedUrls[index] = value
    setFormData((prev) => ({ ...prev, youtubeUrls: updatedUrls }))
  }

  const addYoutubeUrl = () => {
    setFormData((prev) => ({ ...prev, youtubeUrls: [...prev.youtubeUrls, ""] }))
  }

  const removeYoutubeUrl = (index) => {
    setFormData((prev) => ({
      ...prev,
      youtubeUrls: prev.youtubeUrls.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { workingArea, date, title, description, time, location, youtubeUrls } = formData

    if (selectedImages.length === 0) {
      alert("Please select at least one image before submitting.")
      return
    }

    if (!workingArea || !date || !title || !description || !time) {
      alert("Please fill in all required fields.")
      return
    }

    const uploadFormData = new FormData()
    selectedImages.forEach((image) => uploadFormData.append("file", image))

    setIsSubmitting(true)

    try {
      const uploadResponse = await axios.post(
          "https://media.bizonance.in/api/v1/image/upload/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati",
          uploadFormData,
          { headers: { "Content-Type": "multipart/form-data" } },
      )

      const { message, uploadedImages } = uploadResponse.data

      if (message === "Images uploaded successfully" && Array.isArray(uploadedImages)) {
        const filenames = uploadedImages.map((image) => image.filename)

        const workingAreaData = {
          workingarea: workingArea,
          date,
          title,
          description,
          imagename: filenames.join(","),
          time,
          location,
          youtubeUrls: youtubeUrls.filter((url) => url.trim() !== ""),
          highlighted: false,
        }

        const postResponse = await axios.post("https://jciamravati.in/api/v1/workingareas/upload", workingAreaData, {
          headers: { "Content-Type": "application/json" },
        })

        setSubmittedData((prev) => [...prev, postResponse.data.data])
        alert("Data submitted successfully.")
        clearForm()
      } else {
        alert("Image upload failed. Please check the response structure.")
      }
    } catch (error) {
      console.error("Error uploading images and data:", error.response?.data || error.message)
      alert("Failed to upload the images and data. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id, imagename) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?")
    if (!confirmDelete) return

    try {
      const filenames = imagename.split(",")
      for (const file of filenames) {
        const link = `https://media.bizonance.in/api/v1/image/download/eca82cda-d4d7-4fe5-915a-b0880bb8de74/jci-amravati/${file}/?delete=both`
        const response = await axios.get(link)

        if (response.status !== 200) {
          console.error(`Failed to delete image: ${file}`)
          throw new Error(`Image deletion failed for ${file}`)
        }
      }

      await axios.delete(`https://jciamravati.in/api/v1/workingareas/deleterecord/${id}`)
      alert("Item and related data deleted successfully!")

      setSubmittedData((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Error deleting item:", error)
      alert("Failed to delete the item. Please try again.")
    }
  }

  const handleHighlight = async (id) => {
    const currentItem = submittedData.find((data) => data.id === id)
    const newHighlightStatus = !currentItem.highlighted

    try {
      const response = await axios.patch(
          `https://jciamravati.in/api/v1/workingareas/highlight/${id}`,
          { highlighted: newHighlightStatus },
          { headers: { "Content-Type": "application/json" } },
      )

      if (response.status === 200) {
        setSubmittedData((prev) =>
            prev.map((item) => (item.id === id ? { ...item, highlighted: newHighlightStatus } : item)),
        )
        alert(response.data.message)
      }
    } catch (error) {
      console.error("Error updating highlighted status:", error)
      alert("Failed to update highlighted status.")
    }
  }

  

  const clearForm = () => {
    setFormData({
      workingArea: "",
      date: "",
      time: "",
      title: "",
      location: "",
      description: "",
      youtubeUrls: [],
    })
    setSelectedImages([])
    setPreviewImages([])
    document.querySelector('input[type="file"]').value = ""
  }

  return (
      <div className="p-4 overflow-hidden overflow-y-scroll" style={{ height: "calc(100vh - 140px)" }}>
        {/* <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Working Areas</h1> */}
        <div className="max-w-7xl mx-auto ">

          {/*<div className="buttons flex">*/}
          {/*  <h1 className="text-1xl bg-gray-500 rounded-t-lg a w-[120px]">Team</h1>*/}
          {/*  <h1 className="text-1xl bg-gray-300 rounded-tr-lg">Add Team</h1>*/}
          {/*</div>*/}
          <div className="bg-white p-4">
            {/* <h2 className="text-2xl font-semibold mb-6 text-gray-700">Add New Activity</h2> */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Working Area</label>
                  <select
                      name="workingArea"
                      value={formData.workingArea}
                      onChange={handleChange}
                      className="text-gray-600 w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                  >
                    <option value="">Select a Working Area</option>
                    <option value="Management">Management</option>
                    <option value="Business">Business</option>
                    <option value="Community">Community</option>
                    <option value="International Growth and Development">International Growth and Development</option>
                    <option value="Training">Training</option>
                  </select>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Title</label>
                  <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Add Event Title"
                      required
                  />
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Location</label>
                  <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Add Event Location"
                      required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Activity Date</label>
                      <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          className="text-gray-400 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Activity Time</label>
                      <input
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
                    <input
                        type="file"
                        multiple
                        onChange={handleImageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        required
                    />
                    {previewImages.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {previewImages.map((preview, index) => (
                              <img
                                  key={index}
                                  src={preview || "/placeholder.svg"}
                                  alt={`Preview ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-md"
                              />
                          ))}
                        </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Video URLs</label>
                    {formData.youtubeUrls.map((url, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input
                              type="url"
                              value={url}
                              onChange={(e) => handleYoutubeUrlChange(index, e.target.value)}
                              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              placeholder="Enter YouTube URL"
                          />
                          <button
                              type="button"
                              onClick={() => removeYoutubeUrl(index)}
                              className="ml-2 p-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            <X size={16} />
                          </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addYoutubeUrl}
                        className="mt-2 flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Video URL
                    </button>
                  </div>
                </div>
                <div>


                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Description</label>
                  <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Add Description about your Event"
                      rows="17"
                      required
                  ></textarea>

                </div>

              </div>


              <div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
  )
}

export default Workingareas

