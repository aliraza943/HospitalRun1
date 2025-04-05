import React, { useState, useEffect } from "react";
import axios from "axios";

const ClientNotes = ({ client }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const [expandedNotes, setExpandedNotes] = useState({});


  const fetchNotes = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/clientelle/getNotes/${client._id}`
      );
      setNotes(response.data.notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      setError("Error fetching notes. Please try again.");
    }
  };


  useEffect(() => {
    fetchNotes();
  }, [client._id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote((prev) => ({ ...prev, [name]: value }));
  };

  const addNote = async () => {
    if (!newNote.title || !newNote.description) return;
    setLoading(true);
    setError("");

    try {
      await axios.post(
        `http://localhost:8080/api/clientelle/addNote/${client._id}`,
        newNote
      );
      setNewNote({ title: "", description: "" });
      setShowModal(false);
      fetchNotes();
    } catch (error) {
      console.error("Error adding note:", error);
      setError("There was an error adding the note. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (index) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Client Notes</h3>
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Add Note
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Modal overlay */}
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-6 rounded shadow-lg z-10 w-96">
            <h4 className="text-lg font-semibold mb-4">New Note</h4>
            {error && (
              <div className="mb-4 text-red-500">
                {error}
              </div>
            )}
            <input
              type="text"
              name="title"
              value={newNote.title}
              onChange={handleInputChange}
              placeholder="Note Title"
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              name="description"
              value={newNote.description}
              onChange={handleInputChange}
              placeholder="Note Description"
              className="w-full p-2 border rounded mb-4"
            ></textarea>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={addNote}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Note"}
              </button>
            </div>
          </div>
        </div>
      )}

      {notes.length > 0 ? (
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-gray-100">
              <th className="w-1/3 px-4 py-2 text-left">Date</th>
              <th className="w-1/3 px-4 py-2 text-left">Title</th>
              <th className="w-1/3 px-4 py-2 text-left">Note</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  {new Date(note.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">{note.title}</td>
                <td className="px-4 py-2">
                  <div className="flex items-start">
                    <div className="flex-grow">
                      <p
                        style={
                          !expandedNotes[index]
                            ? {
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }
                            : {}
                        }
                      >
                        {note.description}
                      </p>
                    </div>
                    {note.description.length > 150 && (
                      <button
                        onClick={() => toggleExpanded(index)}
                        className="text-blue-500 ml-2 focus:outline-none"
                      >
                        {expandedNotes[index] ? "▲" : "▼"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No notes available.</p>
      )}
    </div>
  );
};

export default ClientNotes;
