import React from "react";
import "./NeonForm.css";

const SlotManager = ({ timeSlots, updateSlot, addSlot, deleteSlot }) => {
  return (
    <div className="section-card">
      <h3 className="section-title">Time Slots</h3>

      {timeSlots.map((slot, index) => (
        <div key={index} className="row-item">

          <input
            type="date"
            className="neon-input"
            value={slot.date}
            onChange={(e) => updateSlot(index, "date", e.target.value)}
          />

          <select
            className="neon-input"
            value={slot.status}
            onChange={(e) => updateSlot(index, "status", e.target.value)}
          >
            <option value="Free">Free</option>
            <option value="Booked">Booked</option>
          </select>

          <input
            type="time"
            className="neon-input"
            value={slot.start}
            onChange={(e) => updateSlot(index, "start", e.target.value)}
          />

          <input
            type="time"
            className="neon-input"
            value={slot.end}
            onChange={(e) => updateSlot(index, "end", e.target.value)}
          />

          <button
            className="delete-btn"
            onClick={() => deleteSlot(index)}
          >
            ✖
          </button>
        </div>
      ))}

      <button onClick={addSlot} className="add-btn">+ Add Time Slot</button>
    </div>
  );
};

export default SlotManager;