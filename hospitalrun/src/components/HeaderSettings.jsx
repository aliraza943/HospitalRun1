import { useRef } from 'react';

export default function HeaderSettings({ headerSettings, setHeaderSettings }) {
  // For file input access.
  const fileInputRef = useRef(null);

  // Handle logo file upload.
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Save the file object directly instead of converting to a base64 string.
      setHeaderSettings((prevSettings) => ({
        ...prevSettings,
        logoFile: file,
        logoPreview: URL.createObjectURL(file),
      }));
      
    }
  };

  // Update the header text color.
  const handleTextColorChange = (e) => {
    const newColor = e.target.value;
    setHeaderSettings((prevSettings) => ({
      ...prevSettings,
      headerTextColor: newColor,
    }));
  };

  // Update the header background color.
  const handleBgColorChange = (e) => {
    const newColor = e.target.value;
    setHeaderSettings((prevSettings) => ({
      ...prevSettings,
      headerBgColor: newColor,
    }));
  };

  // Update the font class.
  const handleFontClassChange = (e) => {
    const newFont = e.target.value;
    setHeaderSettings((prevSettings) => ({
      ...prevSettings,
      fontClass: newFont,
    }));
  };

  return (
    <div className="p-4 border rounded shadow max-w-lg mx-auto">
      {/* File input for Logo */}
      <div className="mb-4">
        <label className="block font-medium mb-1">
          Upload Logo:
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="mt-1 p-2 border rounded w-full"
          />
        </label>
      </div>
      {/* Header Text Color */}
      <div className="mb-4">
        <label className="block font-medium mb-1">
          Header Text Color:
          <input
            type="color"
            value={headerSettings.headerTextColor}
            onChange={handleTextColorChange}
            className="mt-1 p-1"
          />
        </label>
      </div>
      {/* Header Background Color */}
      <div className="mb-4">
        <label className="block font-medium mb-1">
          Header Background Color:
          <input
            type="color"
            value={headerSettings.headerBgColor}
            onChange={handleBgColorChange}
            className="mt-1 p-1"
          />
        </label>
      </div>
      {/* Font Class */}
      <div className="mb-4">
        <label className="block font-medium mb-1">
          Font Class:
          <select
            value={headerSettings.fontClass}
            onChange={handleFontClassChange}
            className="mt-1 p-2 border rounded w-full"
          >
            <option value="font-sans">Sans (Tailwind default)</option>
            <option value="font-serif">Serif (Tailwind default)</option>
            <option value="font-mono">Mono (Tailwind default)</option>
            <option value="font-cursive">"Comic Sans MS", cursive</option>
            <option value="font-fantasy">"Papyrus", fantasy</option>
          </select>
        </label>
      </div>
    </div>
  );
}
