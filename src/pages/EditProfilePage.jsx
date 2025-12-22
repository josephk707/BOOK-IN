import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EditProfile.css";

const API_BASE = "http://localhost:5000/api/v1";

export default function EditProfile({ shopId, onSave }) {
  const [formData, setFormData] = useState(null);
  const [message, setMessage] = useState("");
  const services = existingData?.services || [];
const timeSlots = existingData?.timeSlots || [];


  // ----------------------------------------------------
  // LOAD SHOP DATA WHEN PAGE OPENS
  // ----------------------------------------------------
  useEffect(() => {
    if (!shopId) return;

    axios
      .get(${API_BASE}/getshopbyid/${shopId})
      .then((res) => setFormData(res.data))
      .catch((err) => {
        console.error("LOAD FAILED:", err);
        setMessage("Failed to load shop data");
      });
  }, [shopId]);

  if (!formData || Object.keys(formData).length === 0)
  return <p style={{ textAlign: "center" }}>No shop found.</p>;


  // ----------------------------------------------------
  // HANDLE INPUT CHANGE
  // ----------------------------------------------------
  const handleField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // ----------------------------------------------------
  // HANDLE SERVICE CHANGE
  // ----------------------------------------------------
  const handleService = (index, field, value) => {
    const updated = [...formData.services];
    updated[index][field] = value;
    setFormData({ ...formData, services: updated });
  };

  // ADD NEW SERVICE
  const addService = () => {
    setFormData({
      ...formData,
      services: [
        ...formData.services,
        { serviceName: "", duration: "", price: "" },
      ],
    });
  };

  // REMOVE SERVICE
  const removeService = (index) => {
    const updated = formData.services.filter((_, i) => i !== index);
    setFormData({ ...formData, services: updated });
  };

  // ----------------------------------------------------
  // HANDLE TIME SLOT CHANGE
  // ----------------------------------------------------
  const handleSlot = (index, field, value) => {
    const updated = [...formData.timeSlots];
    updated[index][field] = value;
    setFormData({ ...formData, timeSlots: updated });
  };

  const addSlot = () => {
    setFormData({
      ...formData,
      timeSlots: [
        ...formData.timeSlots,
        { date: "", status: "free", startTime: "", endTime: "" },
      ],
    });
  };

  const removeSlot = (index) => {
    const updated = formData.timeSlots.filter((_, i) => i !== index);
    setFormData({ ...formData, timeSlots: updated });
  };

  // ----------------------------------------------------
  // SAVE UPDATED PROFILE
  // ----------------------------------------------------
  const saveChanges = async () => {
    try {
      const res = await axios.put(
        ${API_BASE}/updateshopbyid/${shopId},
        formData
      );

      setMessage("✔ Profile Updated Successfully!");

      // send updated data back to parent (Dashboard)
      if (onSave) onSave(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update profile");
    }
  };

  return (
    <div className="edit-wrapper">
      <h2>Edit Profile</h2>

      <div className="edit-card">
        {/* BUSINESS INFO */}
        <label>Business Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleField("name", e.target.value)}
        />

        <label>Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => handleField("location", e.target.value)}
        />

        {/* SERVICES */}
        <h3>Services</h3>
        {formData.services.map((srv, i) => (
          <div className="edit-block" key={i}>
            <input
              type="text"
              placeholder="Service Name"
              value={srv.serviceName}
              onChange={(e) => handleService(i, "serviceName", e.target.value)}
            />
            <input
              type="number"
              placeholder="Duration"
              value={srv.duration}
              onChange={(e) => handleService(i, "duration", e.target.value)}
            />
            <input
              type="number"
              placeholder="Price"
              value={srv.price}
              onChange={(e) => handleService(i, "price", e.target.value)}
            />

            <button className="remove-btn" onClick={() => removeService(i)}>
              ✖
            </button>
          </div>
        ))}

        <button className="add-btn" onClick={addService}>
          ➕ Add Service
        </button>

        {/* TIME SLOTS */}
        <h3>Time Slots</h3>
        {formData.timeSlots.map((slot, i) => (
          <div className="edit-block" key={i}>
            <input
              type="date"
              value={slot.date}
              onChange={(e) => handleSlot(i, "date", e.target.value)}
            />
            <select
              value={slot.status}
              onChange={(e) => handleSlot(i, "status", e.target.value)}
            >
              <option value="free">Free</option>
              <option value="booked">Booked</option>
            </select>
            <input
              type="time"
              value={slot.startTime}
              onChange={(e) => handleSlot(i, "startTime", e.target.value)}
            />
            <input
              type="time"
              value={slot.endTime}
              onChange={(e) => handleSlot(i, "endTime", e.target.value)}
            />

            <button className="remove-btn" onClick={() => removeSlot(i)}>
              ✖
            </button>
          </div>
        ))}

        <button className="add-btn" onClick={addSlot}>
          ➕ Add Slot
        </button>

        {message && <p className="edit-msg">{message}</p>}

        <button className="save-btn" onClick={saveChanges}>
          💾 Save Changes
        </button>
      </div>
    </div>
  );
}