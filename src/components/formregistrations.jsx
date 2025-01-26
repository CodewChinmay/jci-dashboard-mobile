import React, { useEffect, useState } from "react";
import { RefreshCcw, Trash2, CheckCircle, MoveLeft, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./pdf.css";

const Formregistrations = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null); // Store selected row for detailed view
  const [readRows, setReadRows] = useState(new Set()); // Track "read" rows

  const downloadPDF = () => {
    if (!selectedRow || !selectedRow.Name) {
      alert("No row selected or the name is missing.");
      return;
    }

    const element = document.getElementById("pdf-content");
    const fileName = `${selectedRow.Name.replace(/\s+/g, "_")}_form.pdf`; // Replace spaces with underscores for the file name.

    html2canvas(element, { scale: 3 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgHeight = (canvasHeight * pdfWidth) / canvasWidth; // Scale the height proportionally

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add remaining pages if content overflows
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(fileName); // Save the file with the dynamic name
    });
  };

  // Fetch data from the API
  const getData = async (type = "all") => {
    try {
      // Update URL to include highlighted filter
      const url = `http://localhost:5000/api/v1/membership/acceptedforms`;

      // Fetch data from the API
      const response = await fetch(url);

      // Handle non-OK responses
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const fetchedData = await response.json();

      // Ensure fetchedData is an array
      if (!Array.isArray(fetchedData)) {
        throw new Error("Unexpected data format: expected an array.");
      }

      // Set filtered data
      setData(fetchedData);

      // Process headers if data exists
      if (fetchedData.length > 0) {
        // Dynamically extract headers from the first data item
        const extractHeaders = (item) => {
          const getAllKeys = (obj, prefix = "") =>
              Object.keys(obj).reduce((acc, key) => {
                const newKey = prefix ? `${prefix}.${key}` : key;
                if (
                    typeof obj[key] === "object" &&
                    obj[key] !== null &&
                    !Array.isArray(obj[key])
                ) {
                  return [...acc, ...getAllKeys(obj[key], newKey)];
                }
                return [...acc, newKey];
              }, []);
          return getAllKeys(item);
        };

        const uniqueHeaders = [
          ...new Set(
              extractHeaders(fetchedData[0]).filter(
                  (header) => !header.toLowerCase().includes("id")
              )
          ),
        ];
        setHeaders(uniqueHeaders);
      } else {
        console.warn("No data available to process headers.");
        setHeaders([]); // Clear headers if no data
      }
    } catch (error) {
      console.error(`Error fetching data: ${error.message}`);
    }
  };




  useEffect(() => {
    getData();
  }, []);

  // Helper function to get nested values
  const getNestedValue = (obj, path) =>
      path
          .split(".")
          .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : "N/A"), obj);

  // Open the detailed view modal for a specific row
  const openModal = (row) => {
    setSelectedRow(row);
  };

  // Close the modal
  const closeModal = () => {
    setSelectedRow(null);
  };

  // Table View
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  if (selectedRow) {
    return (
        <div
            className="p-6 bg-gray-100 overflow-hidden overflow-y-scroll"
            style={{ height: "calc(100vh - 80px)" }}
        >
          {/* Action Buttons */}
          <div className="buttons flex space-x-4 mb-4">
            <button
                className="px-6 py-2 bg-blue-500 text-white rounded-md flex items-center"
                onClick={closeModal}
            >
              <MoveLeft className="mr-2" />
              Back
            </button>
            <button
                className="px-6 py-2 bg-green-500 text-white rounded-md flex items-center"
                onClick={downloadPDF}
            >
              <Download className="mr-2" />
              Download
            </button>
            {/*<button*/}
            {/*    className="px-6 py-2 bg-red-500 text-white rounded-md flex items-center"*/}
            {/*    onClick={() => alert("Delete functionality pending!")} // Placeholder for delete logic*/}
            {/*>*/}
            {/*  <Trash2 className="mr-2" />*/}
            {/*  Delete*/}
            {/*</button>*/}
          </div>

          {/* PDF Content */}
          <div
              id="pdf-content"
              className="bg-white mx-auto p-4 border-4 border-cyan-600"
              style={{ width: "793px", height: "1121px" }} // A4 size
          >
            {/* Header Section */}
            <header className="text-center mb-4">
              <div className="flex justify-between items-center">
                <img src="/jciamravati.png" className="h-20" alt="JCI Amravati Logo" />
                <div>
                  <h1 className="text-3xl font-bold">JCI AMRAVATI</h1>
                  <h2 className="text-2xl font-semibold">ESTD. 1959</h2>
                  <h3 className="text-2xl font-bold text-cyan-600">MEMBERSHIP FORM 2025</h3>
                </div>
                <img src="/About-group.jpeg" className="h-28" alt="Group Photo" />
              </div>
            </header>

            {/* Personal Information Section */}
            <section className="mb-6">
              <div className="grid grid-cols-10 gap-4">
                <p className="font-medium col-span-3">Name: <span className="underline">{selectedRow.Name || "N/A"}</span></p>
                <p className="font-medium col-span-3">D.O.B: <span className="underline">{selectedRow.Dob || "N/A"}</span></p>
                <p className="font-medium col-span-4">Mobile Number: <span className="underline">{selectedRow.Mobileno || "N/A"}</span></p>
                <p className="font-medium col-span-2">Blood Group: <span className="underline">{selectedRow.Bloodgroup || "N/A"}</span></p>
                <p className="font-medium col-span-3">Education: <span className="underline">{selectedRow.Education || "N/A"}</span></p>
                <p className="font-medium col-span-5">Postal Address: <span className="underline">{selectedRow.Postaladdress || "N/A"}</span></p>
              </div>
            </section>

            {/* Family Details Section */}
            <section className="mb-6">
              <div className="grid grid-cols-10 gap-4">
                <p className="font-medium col-span-3">Married Status: <span className="font-normal">{selectedRow.Mstatus || "N/A"}</span></p>
                <p className="font-medium col-span-4">Wife's Name: <span className="font-normal">{selectedRow.Wifename || "N/A"}</span></p>
                <p className="font-medium col-span-3">Wife's D.O.B: <span className="font-normal">{selectedRow.Wdob || "N/A"}</span></p>
                <p className="font-medium col-span-5">Wife's Mobile Number: <span className="font-normal">{selectedRow.Wmobileno || "N/A"}</span></p>
                <p className="font-medium col-span-5">Child's Name: <span className="font-normal">{selectedRow.Childname || "N/A"}</span></p>
              </div>
            </section>

            {/* Professional Information Section */}
            <section className="mb-6">
              <div className="grid grid-cols-3 gap-4">
                <p className="font-medium">Occupation: <span className="font-normal">{selectedRow.Occupation || "N/A"}</span></p>
                <p className="font-medium">Occupation Details: <span className="font-normal">{selectedRow.Occupationdetail || "N/A"}</span></p>
              </div>
            </section>

            {/* Additional Information Section */}
            <section className="mb-6">
              <div className="grid grid-cols-10 gap-4">
                <p className="font-medium col-span-5">Address: <span className="font-normal">{selectedRow.Address || "N/A"}</span></p>
                <p className="font-medium col-span-5">Expectations: <span className="font-normal">{selectedRow.Expectation || "N/A"}</span></p>
                <p className="font-medium">JC Name: <span className="font-normal">{selectedRow.Jcname || "N/A"}</span></p>
              </div>
            </section>

            {/* Footer Section */}
            <footer className="text-center mt-10">
              <p className="italic text-sm text-gray-500">
                "Join JCI to be a better version of yourself and contribute to the community."
              </p>
            </footer>
          </div>
        </div>


    );
  }

  return (
      <div className="p-6">
        <div className="flex items-center mb-5">
          <h1 className="text-xl font-semibold">Accepted Registrations</h1>
          <button
              className="ml-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={() => getData()}
          >
            <RefreshCcw />
          </button>
        </div>
        <table className="border border-gray-200 w-full">
          <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 whitespace-nowrap">SR No.</th>
            {headers.map((header) => (
                <th key={header} className="py-2 px-4">
                  {header.replace(/_/g, " ")}
                </th>
            ))}
          </tr>
          </thead>
          <tbody>
          {data.map((item, index) => (
              <tr
                  key={index}
                  className={`hover:bg-gray-200 cursor-pointer `} // Highlighted row styling
                  onClick={() => openModal(item)}
              >
                <td className="py-2 px-4">{index + 1}</td>
                {headers.map((header) => (
                    <td key={header} className="py-2 px-4 whitespace-nowrap">
                      {getNestedValue(item, header)}
                    </td>
                ))}
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
};

export default Formregistrations;
