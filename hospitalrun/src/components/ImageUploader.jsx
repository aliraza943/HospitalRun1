import { useState } from 'react';

export default function ImageUploader({
  images,
  setImages,
  overlayTexts,
  setOverlayTexts,
  galleryFiles,
  setGalleryFiles,
  deletedImages,
  setDeletedImages, // <- make sure to accept it in props
}) {
  const imgs = Array.isArray(images) ? images : [];
  const [newOverlayText, setNewOverlayText] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setImages([...imgs, previewUrl]);
    setGalleryFiles([...galleryFiles, file]);
    e.target.value = '';
  };

  const handleAddOverlayText = () => {
    if (!newOverlayText.trim()) return;
    setOverlayTexts([...overlayTexts, newOverlayText.trim()]);
    setNewOverlayText('');
  };

  const handleRemoveOverlayText = (index) => {
    setOverlayTexts(overlayTexts.filter((_, i) => i !== index));
  };

  const handleRemoveImage = (index) => {
    if (imgs.length <= 1) {
      alert("At least one image must remain.");
      return;
    }

    const removedImage = imgs[index];

    setDeletedImages([...deletedImages, removedImage]); // 👈 track it here
    setImages(imgs.filter((_, i) => i !== index));
    setGalleryFiles(galleryFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-10">
      {/* Upload Image */}
      <div>
        <label className="block mb-2 font-medium">Upload Gallery Images</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-4"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
          {imgs.map((img, idx) => (
            <div key={idx} className="relative border p-2 rounded shadow space-y-2">
              <img
                src={img}
                alt={`Image ${idx + 1}`}
                className="w-full h-40 object-cover rounded"
              />
              <button
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay Text Section */}
      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">Overlay Texts</h2>
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newOverlayText}
            onChange={(e) => setNewOverlayText(e.target.value)}
            placeholder="Enter overlay text"
            className="flex-grow border p-2 rounded"
          />
          <button
            onClick={handleAddOverlayText}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Add Text
          </button>
        </div>

        {overlayTexts.length > 0 ? (
          <ul className="space-y-2">
            {overlayTexts.map((text, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center border p-2 rounded"
              >
                <span>{text}</span>
                <button
                  onClick={() => handleRemoveOverlayText(idx)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No overlay texts added yet.</p>
        )}
      </div>
    </div>
  );
}
