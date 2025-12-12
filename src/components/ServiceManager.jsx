import React from "react";
import "./NeonForm.css";

const ServiceManager = ({ services, updateService, addService, deleteService }) => {
  return (
    <div className="section-card">
      <h3 className="section-title">Services</h3>

      {services.map((service, index) => (
        <div key={index} className="row-item">

          <input
            type="text"
            placeholder="Service Name"
            value={service.name}
            className="neon-input"
            onChange={(e) => updateService(index, "name", e.target.value)}
          />

          <input
            type="number"
            placeholder="Duration (min)"
            value={service.duration}
            className="neon-input"
            onChange={(e) => updateService(index, "duration", e.target.value)}
          />

          <input
            type="number"
            placeholder="Price ₹"
            value={service.price}
            className="neon-input"
            onChange={(e) => updateService(index, "price", e.target.value)}
          />

          <button
            onClick={() => deleteService(index)}
            className="delete-btn"
          >
            ✖
          </button>
        </div>
      ))}

      <button onClick={addService} className="add-btn">+ Add Service</button>
    </div>
  );
};

export default ServiceManager;