import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TeamSetup = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [cards, setCards] = useState([
    { staffId: '', description: '', image: null, preview: null },
    { staffId: '', description: '', image: null, preview: null },
    { staffId: '', description: '', image: null, preview: null },
  ]);
  const [confirmedData, setConfirmedData] = useState(null);

  const token = localStorage.getItem('token');

  // 1) Load providers list
  useEffect(() => {
    fetch("http://localhost:8080/api/staff", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (res.status === 401) {
          navigate("/unauthorized", { state: { message: "Token expired. Please log in again." }});
          return null;
        }
        if (res.status === 403) {
          navigate("/unauthorized", { state: { message: "Not authorized to manage staff." }});
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        const providers = data.filter(s => s.role === "provider");
        setStaffList(providers);
      })
      .catch(err => console.error("Error fetching staff:", err));
  }, [navigate, token]);

  // 2) Load any previously-saved cards and prefill the inputs
  useEffect(() => {
    fetch("http://localhost:8080/api/website/get-cards", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        let loadedCards = [];
  
        if (data.success && data.cards && data.cards.length) {
          loadedCards = data.cards.map(card => ({
            staffId: card.staffId?._id || card.staffId,
            description: card.description || '',
            image: null,
            preview: card.image || null,
            existingImage: card.image || '',
          }));
        }
  
        // Ensure there are 3 cards (fill with empty ones if needed)
        while (loadedCards.length < 3) {
          loadedCards.push({
            staffId: '',
            description: '',
            image: null,
            preview: null,
            existingImage: '',
          });
        }
  
        setCards(loadedCards);
      })
      .catch(console.error);
  }, []);
  
  const handleChange = (index, field, value) => {
    const updated = [...cards];
    updated[index][field] = value;
    setCards(updated);
  };

  const handleImageUpload = (index, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...cards];
      updated[index].image = file;
      updated[index].preview = reader.result;
      updated[index].existingImage = ''; // Clear existing image when uploading new one
      setCards(updated);
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    // Create a copy of the cards data for sending to the server
    const meta = cards.map((card, index) => ({
      index: index, // Add index to track position
      staffId: card.staffId || '',
      description: card.description || '',
      image: card.existingImage || '', // Send existing image path if no new image
      name: (() => {
        const s = staffList.find(x => x._id === card.staffId);
        return s ? s.name : '';
      })()
    }));
  
    const formData = new FormData();
    formData.append('cards', JSON.stringify(meta));
    
    // Add images to form data with index to ensure correct order
    cards.forEach((card, index) => {
      if (card.image) {
        formData.append('images', card.image);
        formData.append('imageIndices', index);
      }
    });
  
    // Log what's being sent
    console.log("Sending cards meta:", meta);
    console.log("Uploading images:", cards.filter(card => card.image).map(c => c.image?.name));
  
    fetch('http://localhost:8080/api/website/save-cards', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConfirmedData(data.cards);
        } else {
          console.error('Server error', data);
        }
      })
      .catch(console.error);
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Meet Your Team</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium mb-1">Select Provider:</label>
            <select
              className="w-full border rounded p-2 mb-4"
              value={card.staffId}
              onChange={e => handleChange(idx, 'staffId', e.target.value)}
            >
              <option value="">-- Choose --</option>
              {staffList.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>

            <label className="block text-sm font-medium mb-1">Description:</label>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows={3}
              value={card.description}
              onChange={e => handleChange(idx, 'description', e.target.value)}
            />

            <label className="block text-sm font-medium mb-1">Upload Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => handleImageUpload(idx, e.target.files[0])}
              className="mb-4"
            />

            {/* Preview for new uploaded image */}
            {card.image && card.preview && (
              <img
                src={card.preview}
                alt="Preview"
                className="w-full h-40 object-cover rounded"
              />
            )}
            
            {/* Preview for existing image */}
            {!card.image && card.existingImage && (
              <img
                src={`http://localhost:8080${card.existingImage}`}
                alt="Preview"
                className="w-full h-40 object-cover rounded"
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Confirm
      </button>

      {confirmedData && (
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-4">Confirmed Team Members:</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {confirmedData.map((member, i) => (
              <div key={i} className="bg-white rounded shadow p-4 text-center">
                {member.image && (
                  <img
                    src={`http://localhost:8080${member.image}`}
                    alt={member.name || "Team member"}
                    className="w-24 h-24 rounded-full mx-auto object-cover mb-2"
                  />
                )}
                <h4 className="font-semibold">{member.staffId?.name || member.name || "Team Member"}</h4>
                <p className="text-sm text-gray-600 mt-1">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamSetup;