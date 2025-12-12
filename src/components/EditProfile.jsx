import React, { useState, useEffect } from "react";
import axios from "axios";
import ServiceManager from "./components/ServiceManager";
import SlotManager from "./components/SlotManager";
import "./components/NeonForm.css";

const EditProfile = ({ shopId }) => {
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // SERVICES STATE
  const [services, setServices] = useState([
    { name: "", duration: "", price: "" }
  ]);

  const addService = () => setServices([...services, { name: "", duration: "", price: "" }]);

  const updateService = (index, field, value) => {
    const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };

  const deleteService = (index) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  // TIME SLOTS STATE
  const [timeSlots, setTimeSlots] = useState([
    { date: "", status: "free", start: "", end: "" }
  ]);

  const addSlot = () => setTimeSlots([...timeSlots, { date: "", status: "free", start: "", end: "" }]);

  const updateSlot = (index, field, value) => {
    const updated = [...timeSlots];
    updated[index][field] = value;
    setTimeSlots(updated);
  };

  const deleteSlot = (index) => {
    if (timeSlots.length > 1) {
      setTimeSlots(timeSlots.filter((_, i) => i !== index));
    }
  };

  // Load existing data when component mounts
  useEffect(() => {
    const loadBusinessData = async () => {
      if (shopId) {
        try {
          const response = await axios.get(`http://localhost:5000/api/v1/getshopbyid/${shopId}`);
          if (response.data && response.data.data) {
            const business = response.data.data;
            setBusinessName(business.name || "");
            setLocation(business.location || "");

            // Load services
            if (business.services && business.services.length > 0) {
              setServices(business.services.map(s => ({
                name: s.serviceName || "",
                duration: s.duration || "",
                price: s.price || ""
              })));
            }

            // Load time slots
            if (business.timeSlots && business.timeSlots.length > 0) {
              setTimeSlots(business.timeSlots.map(t => ({
                date: t.date || "",
                status: t.status || "free",
                start: t.startTime || "",
                end: t.endTime || ""
              })));
            }
          }
        } catch (error) {
          console.error("Error loading business data:", error);
          setMessage("⚠️ Could not load business data. Please enter details manually.");
        }
      }
    };

    loadBusinessData();
  }, [shopId]);

  const saveChanges = async () => {
    if (!businessName.trim() || !location.trim()) {
      setMessage("⚠️ Please fill in business name and location.");
      return;
    }

    if (services.some(s => !s.name.trim())) {
      setMessage("⚠️ Please provide names for all services.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const payload = {
        name: businessName,
        location: location,
        services: services.map(s => ({
          serviceName: s.name,
          duration: Number(s.duration) || 30,
          price: Number(s.price) || 0,
        })),
        timeSlots: timeSlots.map(t => ({
          date: t.date,
          status: t.status,
          startTime: t.start,
          endTime: t.end,
        })),
      };

      await axios.put(
        `http://localhost:5000/api/v1/updateshopbyid/${shopId}`,
        payload
      );

      setMessage("✅ Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      setMessage("⚠️ Update failed: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-wrapper">

      {/* BUSINESS INFO */}
      <div className="section-card">
        <h3 className="section-title">Business Information</h3>

        <div className="row-item" style={{marginBottom: '15px'}}>
          <input
            type="text"
            className="neon-input"
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>

        <div className="row-item">
          <input
            type="text"
            className="neon-input"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      {/* SERVICES MANAGER */}
      <ServiceManager
        services={services}
        updateService={updateService}
        addService={addService}
        deleteService={deleteService}
      />

      {/* TIME SLOT MANAGER */}
      <SlotManager
        timeSlots={timeSlots}
        updateSlot={updateSlot}
        addSlot={addSlot}
        deleteSlot={deleteSlot}
      />

      {/* STATUS MESSAGE */}
      {message && (
        <div className={`status-msg ${message.includes("✅") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      {/* SAVE BUTTON */}
      <button className="save-btn" onClick={saveChanges} disabled={loading}>
        {loading ? "💾 Updating..." : "💾 Save Changes"}
      </button>
    </div>
  );
};

export default EditProfile;