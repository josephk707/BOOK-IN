import React, { useState, useEffect } from "react";
import axios from "axios";
import ServiceManager from "./ServiceManager";
import SlotManager from "./SlotManager";
import "./NeonForm.css";

const EditProfile = ({ shopId, existingData, onSave, onCreate }) => {
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

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
    { date: "", status: "Free", start: "", end: "" }
  ]);

  const addSlot = () => setTimeSlots([...timeSlots, { date: "", status: "Free", start: "", end: "" }]);

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

  // Load existing data when component mounts or when existingData changes
  useEffect(() => {
    if (existingData) {
      // Map backend field names to frontend field names
      setBusinessName(existingData.name || "");
      setLocation(existingData.location || "");

      // Map services: backend has serviceName, frontend uses name
      if (existingData.services && existingData.services.length > 0) {
        setServices(existingData.services.map(s => ({
          name: s.serviceName || "",
          duration: s.duration || "",
          price: s.price || "",
        })));
      }

      // Map timeSlots: backend has startTime/endTime, frontend uses start/end
      if (existingData.timeSlots && existingData.timeSlots.length > 0) {
        setTimeSlots(existingData.timeSlots.map(t => ({
          date: t.date || "",
          status: t.status || "Free",
          start: t.startTime || "",
          end: t.endTime || "",
        })));
      }
    } else if (shopId) {
      // Fallback: load data from API if no existingData provided
      loadShopData();
    }
  }, [existingData, shopId]);

  const loadShopData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/v1/getshopbyid/${shopId}`);

      if (response.data && response.data.data) {
        const shop = response.data.data;

        // Map backend field names to frontend field names
        setBusinessName(shop.name || "");
        setLocation(shop.location || "");

        // Map services: backend has serviceName, frontend uses name
        if (shop.services && shop.services.length > 0) {
          setServices(shop.services.map(s => ({
            name: s.serviceName || "",
            duration: s.duration || "",
            price: s.price || "",
          })));
        }

        // Map timeSlots: backend has startTime/endTime, frontend uses start/end
        if (shop.timeSlots && shop.timeSlots.length > 0) {
          setTimeSlots(shop.timeSlots.map(t => ({
            date: t.date || "",
            status: t.status || "Free",
            start: t.startTime || "",
            end: t.endTime || "",
          })));
        }
      }
    } catch (error) {
      console.error("Error loading shop data:", error);
      alert("Failed to load shop data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!businessName.trim() || !location.trim()) {
      alert("Please fill in business name and location.");
      return;
    }

    if (services.some(s => !s.name.trim())) {
      alert("Please provide names for all services.");
      return;
    }

    try {
      setLoading(true);

      // Map frontend field names to backend field names
      const payload = {
        name: businessName, // backend expects 'name', not 'businessName'
        location,
        services: services.map(s => ({
          serviceName: s.name, // backend expects 'serviceName', not 'name'
          duration: Number(s.duration) || 30,
          price: Number(s.price) || 0,
        })),
        timeSlots: timeSlots.map(t => ({
          date: t.date,
          status: t.status,
          startTime: t.start, // backend expects 'startTime', not 'start'
          endTime: t.end, // backend expects 'endTime', not 'end'
        })),
      };

      // Use the callback if provided, otherwise fallback to direct API call
      if (onSave) {
        await onSave(payload);
      } else if (shopId) {
        await axios.put(
          `http://localhost:5000/api/v1/updateshopbyid/${shopId}`,
          payload
        );
        alert("Profile updated successfully!");
      } else if (onCreate) {
        await onCreate(payload);
      } else {
        // Fallback for new shop creation
        const response = await axios.post(`http://localhost:5000/api/v1/createshop`, payload);
        alert("Shop created successfully!");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Save failed: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-wrapper">
      {loading && (
        <div style={{ textAlign: "center", padding: "20px", color: "#ff73fa" }}>
          Loading shop data...
        </div>
      )}

      {/* BUSINESS INFO */}
      <div className="section-card">
        <h3 className="section-title">Business Information</h3>

        <input
          type="text"
          className="neon-input"
          placeholder="Business Name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />

        <input
          type="text"
          className="neon-input"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
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

      {/* SAVE BUTTON */}
      <button className="save-btn" onClick={saveChanges} disabled={loading}>
        {loading ? "💾 Saving..." : "💾 Save Changes"}
      </button>
    </div>
  );
};

export default EditProfile;