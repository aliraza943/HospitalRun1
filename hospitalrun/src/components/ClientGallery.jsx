import React, { useEffect, useState, useRef } from "react";

const ClientGallery = ({ client }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const imagesPerPage = 3;
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!client?._id) return;

    const fetchImages = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          `http://localhost:8080/api/clientelle/getImages/${client._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch images");
        const data = await response.json();
        setImages(data.images || []);
        console.log(data.images)
      } catch (error) {
        console.error("Error fetching images:", error);
      }
      setLoading(false);
    };

    fetchImages();
  }, [client?._id]);

  const handleChooseFile = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const validateForm = () => {
    if (!description.trim()) {
      setError("Please enter a description");
      return false;
    }
    if (!date) {
      setError("Please select a date");
      return false;
    }
    setError("");
    return true;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("No file selected");
      return;
    }

    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("description", description);
    formData.append("date", date);

    try {
      const response = await fetch(
        `http://localhost:8080/api/clientelle/upload/${client._id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const result = await response.json();

      if (response.ok) {
        setImages((prev) => [
          ...prev,
          { url: result.imageUrl, description, date },
        ]);
        setSelectedFile(null);
        setPreview(null);
        setDescription("");
        setDate(new Date().toISOString().split("T")[0]);
        setShowModal(false);
      } else {
        setError(result.message || "Upload failed");
      }
    } catch (error) {
      setError("Error uploading image");
      console.error("Error uploading image:", error);
    }
  };

  const openImageViewer = (index) => {
    setCurrentImageIndex(index);
    setViewerOpen(true);
  };

  const navigateToNextImage = (e) => {
    if (e) e.stopPropagation();
    const nextIndex = (currentImageIndex + 1) % images.length;
    setCurrentImageIndex(nextIndex);
  };

  const navigateToPrevImage = (e) => {
    if (e) e.stopPropagation();
    const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
    setCurrentImageIndex(prevIndex);
  };

  const navigateToPage = (direction) => {
    if (direction === "next") {
      setCurrentPage((prev) =>
        Math.min(prev + 1, Math.ceil(images.length / imagesPerPage) - 1)
      );
    } else {
      setCurrentPage((prev) => Math.max(prev - 1, 0));
    }
  };

  // Get current page's images
  const getCurrentPageImages = () => {
    const startIndex = currentPage * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    return images.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(images.length / imagesPerPage);

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">Gallery</h3>

      <button
        onClick={() => {
          setShowModal(true);
          setError("");
          setDescription("");
          setDate(new Date().toISOString().split("T")[0]);
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-600 transition"
      >
        Upload
      </button>

      {loading ? (
        <p>Loading images...</p>
      ) : images.length > 0 ? (
        // Wrapping the grid in a relative container so we can position pagination arrows
        <div className="relative mb-8 pl-12 pr-12">
        <button
          onClick={() => navigateToPage("prev")}
          disabled={currentPage === 0}
          className={`absolute left-[-20px] top-1/2 transform -translate-y-1/2 z-10 px-3 py-2 rounded-md ${
            currentPage === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          aria-label="Previous page"
        >
          &#8592;
        </button>
      
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {getCurrentPageImages().map((img, index) => {
            const actualIndex = currentPage * imagesPerPage + index;
            return (
              <div
                key={actualIndex}
                className="border rounded-md overflow-hidden cursor-pointer hover:shadow-md transition"
                onClick={() => openImageViewer(actualIndex)}
              >
                <div className="relative">
                  <img
                    src={`http://localhost:8080/api/clientelle${img.url}`}
                    alt="Client Gallery"
                    className="w-full h-40 object-cover"
                  />
                </div>
                <div className="p-2 bg-gray-50">
                  <p className="text-sm font-medium">{img.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
  {new Date(img.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}
</p>
                </div>
              </div>
            );
          })}
        </div>
      
        <button
          onClick={() => navigateToPage("next")}
          disabled={currentPage >= totalPages - 1}
          className={`absolute right-[-20px] top-1/2 transform -translate-y-1/2 z-10 px-3 py-2 rounded-md ${
            currentPage >= totalPages - 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          aria-label="Next page"
        >
          &#8594;
        </button>
      </div>
            ) : (
        <p className="text-gray-700">
          No gallery images available for this client.
        </p>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md w-96 relative">
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreview(null);
                setDescription("");
                setDate(new Date().toISOString().split("T")[0]);
                setShowModal(false);
                setError("");
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">Upload Image</h2>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />

            <button
              onClick={handleChooseFile}
              className="bg-green-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-green-600 transition"
            >
              Choose File
            </button>

            {preview && (
              <div className="mb-4">
                <p className="mb-2">Image Preview:</p>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-md border"
                />
              </div>
            )}

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                  setDescription("");
                  setDate(new Date().toISOString().split("T")[0]);
                  setShowModal(false);
                  setError("");
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                disabled={!selectedFile}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {viewerOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={(e) => navigateToPrevImage(e)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-60 p-3 rounded-full text-xl hover:bg-opacity-80 z-10"
              aria-label="Previous image"
            >
              &#8592;
            </button>

            <div className="max-w-4xl w-full mx-12">
              <img
                src={`http://localhost:8080/api/clientelle${images[currentImageIndex].url}`}
                alt="Gallery view"
                className="max-h-screen max-w-full object-contain mx-auto"
              />
              <div className="mt-4 text-white text-center">
                <p className="font-medium text-lg">
                  {images[currentImageIndex].description}
                </p>
                <p className="text-sm opacity-80 mt-1">
                {new Date(images[currentImageIndex].date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}
                </p>
              </div>
            </div>

            <button
              onClick={(e) => navigateToNextImage(e)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-60 p-3 rounded-full text-xl hover:bg-opacity-80 z-10"
              aria-label="Next image"
            >
              &#8594;
            </button>

            <button
              onClick={() => setViewerOpen(false)}
              className="absolute top-4 right-4 bg-white bg-opacity-70 p-2 rounded-full hover:bg-opacity-90 z-10"
              aria-label="Close viewer"
            >
              &#10005;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientGallery;
