import React from 'react';

export default function TextSectionEditor({ sectionData, setSectionData, onImageSelect }) {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // For preview only (optional)
    const reader = new FileReader();
    reader.onloadend = () => {
      setSectionData((prev) => ({ ...prev, imageSrc: reader.result }));
    };
    reader.readAsDataURL(file);

    // Send the file to parent for upload
    if (onImageSelect) {
      onImageSelect(file);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-md space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1">Heading</label>
        <input
          type="text"
          className="w-full border px-2 py-1 rounded"
          value={sectionData.heading}
          onChange={(e) => setSectionData((prev) => ({ ...prev, heading: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Text</label>
        <textarea
          className="w-full border px-2 py-1 rounded"
          value={sectionData.text}
          onChange={(e) => setSectionData((prev) => ({ ...prev, text: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Upload Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {sectionData.imageSrc && (
          <img src={sectionData.imageSrc} alt="Preview" className="mt-2 max-h-48 rounded" />
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Map Coordinates (lat,lng)</label>
        <input
          type="text"
          className="w-full border px-2 py-1 rounded"
          value={sectionData.mapCoords}
          onChange={(e) => setSectionData((prev) => ({ ...prev, mapCoords: e.target.value }))}
        />
        <p className="text-xs text-gray-500 mt-1">
          Find coords on Google Maps: Right click &gt; "What's here?"
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Map Label</label>
        <input
          type="text"
          className="w-full border px-2 py-1 rounded"
          value={sectionData.mapLabel}
          onChange={(e) => setSectionData((prev) => ({ ...prev, mapLabel: e.target.value }))}
        />
      </div>
    </div>
  );
}
