import React, { useEffect, useState, useRef } from "react";

const ClientGallery = ({ client }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!client?._id) return;

    const fetchImages = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`http://localhost:8080/api/clientelle/getImages/${client._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch images");
        const data = await response.json();
        setImages(data.images || []);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
      setLoading(false);
    };

    fetchImages();
  }, [client?._id]);

  // Trigger file selection dialog
  const handleChooseFile = () => {
    fileInputRef.current.click();
  };

  // Handle file selection and create a preview
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  // Upload the selected file when upload button is clicked
  const handleUpload = async () => {
    if (!selectedFile) {
      console.error("No file selected");
      return;
    }
  
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", selectedFile);
  
    try {
      const response = await fetch(`http://localhost:8080/api/clientelle/upload/${client._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response result:", result);
  
      if (response.ok) {
        setImages((prev) => [...prev, result.imageUrl]);
        setSelectedFile(null);
        setPreview(null);
      } else {
        console.error("Upload failed:", result.message);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };
  
  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">Gallery</h3>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {/* Choose File Button */}
      <button
        onClick={handleChooseFile}
        className="bg-green-500 text-white px-4 py-2 rounded-md mb-2 hover:bg-green-600 transition mr-2"
      >
        Choose File
      </button>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-600 transition"
        disabled={!selectedFile}
      >
        Upload Image
      </button>

      {/* Display preview if available */}
      {preview && (
        <div className="mb-4">
          <p className="mb-2">Image Preview:</p>
          <img src={preview} alt="Preview" className="w-40 h-40 object-cover rounded-md border" />
        </div>
      )}

      {/* Gallery */}
      {loading ? (
        <p>Loading images...</p>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div key={index} className="border rounded-md overflow-hidden">
              <img
                src={`http://localhost:8080/api/clientelle${img}`}
                alt="Client Gallery"
                className="w-40 h-40 object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-700">No gallery images available for this client.</p>
      )}
    </div>
  );
};

export default ClientGallery;
