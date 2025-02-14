import React, { useState, useEffect } from "react"
import axios from "axios"
import { Trash2, Star, Pencil, X } from "lucide-react"

const Workingdata = () => {
  const [submittedData, setSubmittedData] = useState([])
  const [selectedWorkingArea, setSelectedWorkingArea] = useState("All")
  const [editingData, setEditingData] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://jciamravati.in/api/v1/workingareas/getrecord")
        setSubmittedData(response.data.data || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        alert("Failed to fetch data.")
      }
    }
    fetchData()
  }, [])

  const handleDelete = async (id, imagename) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return

    try {
      await axios.delete(`https://jciamravati.in/api/v1/workingareas/deleterecord/${id}`)
      alert("Item deleted successfully!")
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
          { headers: { "Content-Type": "application/json" } }
      )

      if (response.status === 200) {
        setSubmittedData((prev) =>
            prev.map((item) => (item.id === id ? { ...item, highlighted: newHighlightStatus } : item))
        )
        alert(response.data.message)
      }
    } catch (error) {
      console.error("Error updating highlighted status:", error)
      alert("Failed to update highlighted status.")
    }
  }

  const handleEdit = (data) => {
    setEditingData(data)
    setIsModalOpen(true)
  }

  const handleUpdate = async (id, updatedData) => {
    try {
      const response = await fetch(`https://jciamravati.in/api/v1/workingareas/updatedata/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update record");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating record on frontend:", error);
      throw error;
    }
  };

  const filteredData =
  selectedWorkingArea === "All"
    ? submittedData
    : selectedWorkingArea === "highlighted"
    ? submittedData.filter(data => data.highlighted)
    : submittedData.filter(data => data.workingarea === selectedWorkingArea)

  return (
      <div className="p-6 bg-gray-50 overflow-hidden" style={{ height: "calc(100vh - 140px)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by:</label>
            <select
              value={selectedWorkingArea}
              onChange={(e) => setSelectedWorkingArea(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Activities</option>
              <option value="highlighted">Highlighted Activities</option>
              <option value="Management">Management</option>
              <option value="Business">Business</option>
              <option value="Community">Community</option>
              <option value="International Growth and Development">International Growth</option>
              <option value="Training">Training</option>
            </select>
          </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
              {filteredData.map((data) => (
                  <div key={data.id} className="p-4 flex flex-col justify-between border border-gray-300 bg-white rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {data.date} at {data.time}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {data.title}
                      </h3>
                      <p className="text-sm text-gray-600">{data.location}</p>
                    </div>
                    <div className="flex gap-5 mt-4 justify-end">
                      <button title="Edit" onClick={() => handleEdit(data)} className="p-2 bg-cyan-600 text-white rounded-full">
                        <Pencil size={20} />
                      </button>
                      <button onClick={() => handleHighlight(data.id)} className={`p-2 rounded-full ${
                          data.highlighted ? "bg-yellow-300 text-yellow-900" : "bg-gray-200 text-gray-600"
                      }`}>
                        <Star size={20} />
                      </button>
                      <button onClick={() => handleDelete(data.id, data.imagename)} className="p-2 bg-red-100 text-red-600 rounded-full">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
{isModalOpen && editingData && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-[800px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Record</h2>
          <button onClick={() => setIsModalOpen(false)} className="text-gray-600">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Working Area</label>
              <select
                  name="workingArea"
                  value={editingData.workingArea}
                  onChange={(e) => setEditingData({ ...editingData, workingArea: e.target.value })}
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
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">Activity Title</label>
              <input
                  type="text"
                  value={editingData.title}
                  onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                  type="date"
                  value={editingData.date}
                  onChange={(e) => setEditingData({ ...editingData, date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <input
                  type="time"
                  value={editingData.time}
                  onChange={(e) => setEditingData({ ...editingData, time: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                  type="text"
                  value={editingData.location}
                  onChange={(e) => setEditingData({ ...editingData, location: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                  value={editingData.description}
                  onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md mt-2">
            Update
          </button>
        </form>
      </div>
    </div>
) }
      </div>
  )
}

export default Workingdata
