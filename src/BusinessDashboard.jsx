import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CreatableSelect from "react-select/creatable";
import "./BusinessDashboard.css";

const API_URL = "http://localhost:5000/api/v1/createshop";

// Cloudinary configuration for image uploads
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/demo/image/upload"; // Using demo for now - replace with your cloud name
const CLOUDINARY_UPLOAD_PRESET = "ml_default"; // Using default preset - replace with your upload preset

const CATEGORIES = [
  { value: "beauty", label: "Beauty & Personal Care", icon: "💄" },
  { value: "fitness", label: "Fitness & Wellness", icon: "💪" },
  { value: "coaching", label: "Coaching & Skill Development", icon: "🎓" },
  { value: "home", label: "Home & Lifestyle Services", icon: "🏠" },
  { value: "events", label: "Events & Entertainment", icon: "🎉" },
  { value: "health", label: "Health & Medical Support", icon: "🩺" },
  { value: "tech", label: "Tech & Digital Services", icon: "💻" },
  { value: "education", label: "Education & Tutoring", icon: "📚" },
  { value: "travel", label: "Travel & Experiences", icon: "✈️" },
  { value: "petcare", label: "Pet Care & Training", icon: "🐾" },
  { value: "business", label: "Business & Professional Services", icon: "📈" },
  { value: "creative", label: "Creative & Production Services", icon: "🎨" },
];

// Map short value to full enum value for backend
const getCategoryEnumValue = (shortValue) => {
  const cat = CATEGORIES.find(c => c.value === shortValue);
  return cat ? cat.label : shortValue;
};

// Category -> Suggested services mapping
const CATEGORY_SERVICES = {
  "Beauty & Personal Care": [
    "Makeup & Styling",
    "Bridal Makeup",
    "Party Makeup",
    "Hair Styling",
    "Saree Draping",
    "Facial / Skincare",
    "Waxing / Threading",
    "Body Spa & Massage",
    "Nail Extensions",
    "Lash Extensions",
    "Brow Shaping",
  ],
  "Fitness & Wellness": [
    "Personal Fitness Training",
    "Yoga / Pilates",
    "Zumba / Dance Fitness",
    "Nutrition & Diet Plans",
    "Physiotherapy / Rehab",
    "Reiki / Sound Healing",
  ],
  "Coaching & Skill Development": [
    "Music / Singing",
    "Dance Training",
    "Art & Craft",
    "Photography Training",
    "Public Speaking",
    "Life & Career Coaching",
    "Astrology / Tarot",
  ],
  "Home & Lifestyle Services": ["Home Cleaning", "Appliance Repair", "Interior Design"],
  "Events & Entertainment": ["Event Planning", "DJ / Music", "Photography"],
  "Health & Medical Support": ["General Consultation", "Physiotherapy", "Nursing"],
  "Tech & Digital Services": ["Laptop Repair", "Web Development", "Graphic Design"],
  "Education & Tutoring": ["Math Tutoring", "Language Lessons", "Test Prep"],
  "Travel & Experiences": ["Local Tours", "Travel Planning", "Adventure Activities"],
  "Pet Care & Training": ["Pet Grooming", "Pet Training", "Pet Sitting"],
  "Business & Professional Services": ["Accounting", "Legal Consultation", "Consulting"],
  "Creative & Production Services": ["Video Production", "Photography", "Content Creation"],
};

const BusinessDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();

  const [businessData, setBusinessData] = useState({
    _id: "", // Add business ID for updates
    name: "",
    location: "",
    category: "",
    logo: "", // Business logo URL
    coverImage: "", // Cover image URL
    services: [
      { serviceName: "", serviceDuration: "", servicePrice: "" }
    ],
    timeSlots: [
      { date: "", status: "free", startTime: "", endTime: "" }
    ],
  });

  const [stats, setStats] = useState({
    services: 0,
    slots: 0,
    bookings: 0,
  });

  const [bookings, setBookings] = useState([
    {
      id: 1,
      customerName: "John Doe",
      serviceName: "Haircut",
      time: "10:30 AM, 16 Dec 2025",
      status: "pending",
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalBooking, setModalBooking] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStart, setRescheduleStart] = useState("");
  const [rescheduleEnd, setRescheduleEnd] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  // Auto-load business data when editprofile tab is selected
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (activeTab === "editprofile" && !businessData._id) {
        try {
          // In a real app, this ID would come from authentication
          // For demo purposes, using a sample ID
          const sampleBusinessId = "693ba36c4c367a85dc413c0a";
          const response = await axios.get(`http://localhost:5000/api/v1/getshopbyid/${sampleBusinessId}`);

          if (response.data && response.data.data) {
            const business = response.data.data;
            setBusinessData({
              _id: business._id,
              name: business.name || "",
              location: business.location || "",
              category: "", // This would need to be derived from masterCategory
              logo: business.logo || "",
              coverImage: business.coverImage || "",
              services: business.services ? business.services.map(s => ({
                serviceName: s.serviceName || "",
                serviceDuration: s.duration || "",
                servicePrice: s.price || "",
              })) : [{ serviceName: "", serviceDuration: "", servicePrice: "" }],
              timeSlots: business.timeSlots ? business.timeSlots.map(t => ({
                date: t.date || "",
                status: t.status || "free",
                startTime: t.startTime || "",
                endTime: t.endTime || "",
              })) : [{ date: "", status: "free", startTime: "", endTime: "" }],
            });
          }
        } catch (error) {
          console.error("Error fetching business data:", error);
          setMessage("⚠️ Could not load business data. Please enter details manually.");
        }
      }
    };

    fetchBusinessData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleChange = (e) => {
    setBusinessData({ ...businessData, [e.target.name]: e.target.value });
  };

  // Service handlers
  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...businessData.services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };

    // Auto-suggest duration and price when serviceName is selected
    if (field === "serviceName") {
      switch (value) {
        case "Personal Fitness Training":
          updatedServices[index].serviceDuration = 60;
          updatedServices[index].servicePrice = 600;
          break;
        case "Yoga / Pilates":
          updatedServices[index].serviceDuration = 45;
          updatedServices[index].servicePrice = 400;
          break;
        case "Facial / Skincare":
          updatedServices[index].serviceDuration = 50;
          updatedServices[index].servicePrice = 500;
          break;
        case "Makeup & Styling":
          updatedServices[index].serviceDuration = 90;
          updatedServices[index].servicePrice = 1500;
          break;
        case "Hair Styling":
          updatedServices[index].serviceDuration = 45;
          updatedServices[index].servicePrice = 700;
          break;
        default:
          break;
      }
    }

    setBusinessData({ ...businessData, services: updatedServices });
  };

  const addService = () => {
    setBusinessData({
      ...businessData,
      services: [...businessData.services, { serviceName: "", serviceDuration: "", servicePrice: "" }]
    });
  };

  // Time slot handlers
  const handleSlotChange = (index, field, value) => {
    const updatedSlots = [...businessData.timeSlots];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    setBusinessData({ ...businessData, timeSlots: updatedSlots });
  };

  const addTimeSlot = () => {
    setBusinessData({
      ...businessData,
      timeSlots: [...businessData.timeSlots, { date: "", status: "free", startTime: "", endTime: "" }]
    });
  };

  // Remove specific service by index
  const removeService = (index) => {
    const updatedServices = businessData.services.filter((_, i) => i !== index);
    setBusinessData({ ...businessData, services: updatedServices });
  };

  // Remove specific time slot by index
  const removeTimeSlot = (index) => {
    const updatedSlots = businessData.timeSlots.filter((_, i) => i !== index);
    setBusinessData({ ...businessData, timeSlots: updatedSlots });
  };

  // Confirm booking handler
  const handleConfirmBooking = async (bookingId) => {
    try {
      // Optionally call backend to confirm booking
      // await axios.put(`http://localhost:5000/api/v1/bookings/${bookingId}/confirm`);

      const updated = bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "confirmed" } : b
      );

      setBookings(updated);
      setMessage("✅ Booking confirmed successfully!");
    } catch (error) {
      console.error("Error confirming booking:", error);
      setMessage("⚠️ Failed to confirm booking. Try again.");
    }
  };

  // Reject booking handler
  const handleRejectBooking = async (bookingId) => {
    try {
      // Optionally call backend to reject booking
      // await axios.put(`http://localhost:5000/api/v1/bookings/${bookingId}/reject`);

      const updated = bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "rejected" } : b
      );

      setBookings(updated);
      setMessage("⚠️ Booking rejected");
    } catch (error) {
      console.error("Error rejecting booking:", error);
      setMessage("⚠️ Failed to reject booking. Try again.");
    }
  };

  const openRescheduleModal = (booking) => {
    setModalBooking(booking);
    // try to parse time into fields if needed; leave simple defaults
    setRescheduleDate("");
    setRescheduleStart("");
    setRescheduleEnd("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalBooking(null);
  };

  const handleRescheduleSubmit = async () => {
    if (!modalBooking) return;
    try {
      // Optionally call backend to update booking
      // await axios.put(`http://localhost:5000/api/v1/bookings/${modalBooking.id}/reschedule`, { date: rescheduleDate, startTime: rescheduleStart, endTime: rescheduleEnd });

      const updated = bookings.map((b) =>
        b.id === modalBooking.id
          ? { ...b, time: `${rescheduleStart} - ${rescheduleEnd} on ${rescheduleDate}`, status: "pending" }
          : b
      );

      setBookings(updated);
      setMessage("✅ Booking rescheduled");
      closeModal();
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      setMessage("⚠️ Failed to reschedule. Try again.");
    }
  };

  const handleSaveBusiness = async () => {
    const { name, location, category, services, timeSlots } = businessData;

    if (!name || !location || !category) {
      setMessage("⚠️ Please fill business name, location, and select a category.");
      return;
    }

    // basic validation for first service
    if (!services || services.length === 0 || services.some(s => !s.serviceName || !s.serviceDuration || !s.servicePrice)) {
      setMessage("⚠️ Please add at least one service with name, duration, and price.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const payload = {
        name,
        location,
        masterCategory: getCategoryEnumValue(category),
        services: services.map(s => ({
          serviceName: s.serviceName,
          duration: Number(s.serviceDuration),
          price: Number(s.servicePrice),
        })),
        timeSlots: timeSlots.map(t => ({
          date: t.date,
          status: t.status,
          startTime: t.startTime,
          endTime: t.endTime,
        })),
      };

      const response = await axios.post(API_URL, payload);

      console.log("Create shop response:", response.data);

      if (response.status === 200 || response.status === 201) {
        setMessage("✅ Business saved successfully!");
      } else {
        setMessage("⚠️ Backend not responding. Saved locally for demo!");
      }

      setStats((prev) => ({
        services: prev.services + (services ? services.length : 0),
        slots: prev.slots + (timeSlots ? timeSlots.length : 0),
        bookings: prev.bookings,
      }));

      // reset form to initial shape
      setBusinessData({
        name: "",
        location: "",
        category: "",
        services: [ { serviceName: "", serviceDuration: "", servicePrice: "" } ],
        timeSlots: [ { date: "", status: "free", startTime: "", endTime: "" } ],
      });

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      const errorDetails = error.response?.data?.error || error.response?.data || "";
      console.error("Error creating shop:", { errorMessage, errorDetails, fullError: error });
      setMessage(
        "⚠️ " + (typeof errorMessage === 'string' ? errorMessage : "Failed to save business. Check console for details.")
      );

      // keep existing stats behavior but count items if available
      setStats((prev) => ({
        services: prev.services + (businessData.services ? businessData.services.length : 0),
        slots: prev.slots + (businessData.timeSlots ? businessData.timeSlots.length : 0),
        bookings: prev.bookings,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (type) => {
    try {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.click();

      fileInput.onchange = async () => {
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        setMessage("⏳ Uploading image...");

        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (data.secure_url) {
          setBusinessData((prev) => ({
            ...prev,
            [type === "logo" ? "logo" : "coverImage"]: data.secure_url,
          }));
          setMessage("✅ Image uploaded successfully!");
        } else {
          setMessage("⚠️ Image upload failed, please try again.");
        }
      };
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("⚠️ Upload error: " + err.message);
    }
  };

  const handleUpdateBusiness = async () => {
    if (!businessData._id) {
      setMessage("⚠️ Business ID missing. Please load your business profile first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const payload = {
        name: businessData.name,
        location: businessData.location,
        logo: businessData.logo,
        coverImage: businessData.coverImage,
        services: businessData.services.map(s => ({
          serviceName: s.serviceName,
          duration: Number(s.serviceDuration),
          price: Number(s.servicePrice),
        })),
        timeSlots: businessData.timeSlots.map(t => ({
          date: t.date,
          status: t.status,
          startTime: t.startTime,
          endTime: t.endTime,
        })),
      };

      const response = await axios.put(
        `http://localhost:5000/api/v1/updateshopbyid/${businessData._id}`,
        payload
      );

      if (response.status === 200) {
        setMessage("✅ Business updated successfully!");
      } else {
        setMessage("⚠️ Update failed, please try again.");
      }
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
      setMessage(
        "⚠️ " + (error.response?.data?.message || "Server error while updating.")
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const renderDashboard = () => (
    <section className="content animate-fade">
      {/* Hero Illustration */}
      <div className="hero-section">
        <img
          src="https://undraw.co/api/illustrations/business-dashboard.svg"
          alt="Business Dashboard"
          className="hero-img"
        />
        <h2>Welcome to Your Business Dashboard</h2>
        <p>Organize, manage, and visualize your business effortlessly.</p>
      </div>

      <div className="card glass">
        <h3>Business Setup</h3>
        <p className="placeholder-text">Create or update your business profile</p>

        <div className="actions-left" style={{ marginBottom: '20px' }}>
          <button
            className="btn-primary glow"
            onClick={() => setActiveTab("editprofile")}
          >
            ✏️ Edit Business Profile
          </button>
        </div>

        <div className="grid-2 relaxed-grid">
          <div className="field">
            <label>Business Name</label>
            <input
              name="name"
              type="text"
              placeholder="Enter your business name"
              value={businessData.name}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>Location</label>
            <input
              name="location"
              type="text"
              placeholder="Enter location"
              value={businessData.location}
              onChange={handleChange}
            />
          </div>
        </div>

        <h3>Choose Category</h3>
        <div className="field">
          <label>Select Main Category</label>
          <select
            name="category"
            value={businessData.category || ""}
            onChange={(e) => {
              const newCategory = e.target.value;
              setBusinessData({
                ...businessData,
                category: newCategory,
                services: businessData.services.map(service => ({ ...service, serviceName: "" }))
              });
            }}
          >
            <option value="">-- Select a Category --</option>
            {Object.keys(CATEGORY_SERVICES).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <h3>Service Details</h3>

        {businessData.services.map((service, index) => (
          <div key={index} className="service-block glass-box">
            <div className="grid-3 relaxed-grid">
              <div className="field">
                <label>Service Name</label>
                <CreatableSelect
                  isClearable
                  placeholder="Select or type a service"
                  options={(CATEGORY_SERVICES[businessData.category] || []).map((srv) => ({
                    label: srv,
                    value: srv,
                  }))}
                  value={
                    businessData.services[index]?.serviceName
                      ? { label: businessData.services[index].serviceName, value: businessData.services[index].serviceName }
                      : null
                  }
                  onChange={(option) =>
                    handleServiceChange(index, "serviceName", option?.value || "")
                  }
                  styles={theme === "dark" ? {
                    control: (base) => ({
                      ...base,
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "8px",
                      color: "#fff",
                      boxShadow: "none",
                      minHeight: "42px",
                    }),
                    singleValue: (base) => ({ ...base, color: "#fff" }),
                    input: (base) => ({ ...base, color: "#fff" }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: "rgba(20, 20, 40, 0.95)",
                      borderRadius: "8px",
                      color: "#fff",
                      zIndex: 10,
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? "#a855f7" : "transparent",
                      color: state.isFocused ? "#fff" : "#ccc",
                      cursor: "pointer",
                    }),
                    placeholder: (base) => ({ ...base, color: "#aaa" }),
                  } : {
                    control: (base) => ({
                      ...base,
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      color: "#333",
                      boxShadow: "none",
                      minHeight: "42px",
                    }),
                    singleValue: (base) => ({ ...base, color: "#333" }),
                    input: (base) => ({ ...base, color: "#333" }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      color: "#333",
                      zIndex: 10,
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? "#e0e0e0" : "transparent",
                      color: state.isFocused ? "#333" : "#666",
                      cursor: "pointer",
                    }),
                    placeholder: (base) => ({ ...base, color: "#999" }),
                  }}
                />
              </div>
              <div className="field">
                <label>Duration (min)</label>
                <input
                  type="number"
                  placeholder="30"
                  value={service.serviceDuration}
                  onChange={(e) => handleServiceChange(index, "serviceDuration", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Price (₹)</label>
                <input
                  type="number"
                  placeholder="500"
                  value={service.servicePrice}
                  onChange={(e) => handleServiceChange(index, "servicePrice", e.target.value)}
                />
              </div>
            </div>

            {businessData.services.length > 1 && (
              <button
                type="button"
                className="btn-remove small"
                onClick={() => removeService(index)}
              >
                ❌ Remove
              </button>
            )}
          </div>
        ))}

        <div className="actions-left">
          <button
            type="button"
            className="btn-secondary small"
            onClick={addService}
          >
            ➕ Add Another Service
          </button>
        </div>

        <h3>Time Slots</h3>

        {businessData.timeSlots.map((slot, index) => (
          <div key={index} className="time-slot-block glass-box">
            <div className="grid-4 relaxed-grid">
              <div className="field">
                <label>Date</label>
                <input
                  type="date"
                  value={slot.date}
                  onChange={(e) => handleSlotChange(index, "date", e.target.value)}
                />
              </div>

              <div className="field">
                <label>Status</label>
                <select
                  value={slot.status}
                  onChange={(e) => handleSlotChange(index, "status", e.target.value)}
                >
                  <option value="free">Free</option>
                  <option value="booked">Booked</option>
                </select>
              </div>

              <div className="field">
                <label>Start Time</label>
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => handleSlotChange(index, "startTime", e.target.value)}
                />
              </div>

              <div className="field">
                <label>End Time</label>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => handleSlotChange(index, "endTime", e.target.value)}
                />
              </div>
            </div>

            {businessData.timeSlots.length > 1 && (
              <button
                type="button"
                className="btn-remove small"
                onClick={() => removeTimeSlot(index)}
              >
                ❌ Remove
              </button>
            )}
          </div>
        ))}

        <div className="actions-left">
          <button
            type="button"
            className="btn-secondary small"
            onClick={addTimeSlot}
          >
            ➕ Add Another Time Slot
          </button>
        </div>

        {message && (
          <p className={`status-msg ${message.includes("✅") ? "success" : "error"}`}>
            {message}
          </p>
        )}

        

        <div className="actions-right">
          <button
            className="btn-primary glow"
            type="button"
            onClick={handleSaveBusiness}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Business"}
          </button>
        </div>
      </div>
    </section>
  );

  const renderBookings = () => (
    <section className="content animate-fade">
      <div className="card glass">
        <h3>Bookings</h3>
        <p className="placeholder-text">Your customer bookings appear here.</p>

        {bookings.length === 0 ? (
          <p>No bookings yet.</p>
        ) : (
          bookings.map((booking) => (
            <div
              className={`booking-card ${booking.status === "confirmed" ? "confirmed" : ""}`}
              key={booking.id}
            >
              <div>
                <h4>{booking.customerName}</h4>
                <p>
                  {booking.serviceName} - {booking.time}
                </p>
                {booking.status === "confirmed" && (
                  <span className="status-badge">✅ Confirmed</span>
                )}
                {booking.status === "rejected" && (
                  <span className="status-badge" style={{ background: '#e74c3c' }}>❌ Rejected</span>
                )}
              </div>

              <div>
                {booking.status === "pending" && (
                  <>
                    <button
                      className="btn-primary small"
                      onClick={() => handleConfirmBooking(booking.id)}
                    >
                      Confirm
                    </button>
                    <button
                      className="btn-outline small"
                      style={{ marginLeft: '10px' }}
                      onClick={() => handleRejectBooking(booking.id)}
                    >
                      Reject
                    </button>
                    <button
                      className="btn-secondary small"
                      style={{ marginLeft: '10px' }}
                      onClick={() => openRescheduleModal(booking)}
                    >
                      Reschedule
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}

        {/* Reschedule Modal */}
        {modalOpen && modalBooking && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h4>Reschedule Booking</h4>
                <button onClick={closeModal} className="btn-ghost">✕</button>
              </div>
              <div className="modal-body">
                <p><strong>{modalBooking.customerName}</strong> — {modalBooking.serviceName}</p>
                <label>Date</label>
                <input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
                <label>Start Time</label>
                <input type="time" value={rescheduleStart} onChange={(e) => setRescheduleStart(e.target.value)} />
                <label>End Time</label>
                <input type="time" value={rescheduleEnd} onChange={(e) => setRescheduleEnd(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button className="btn-secondary small" onClick={handleRescheduleSubmit}>Save</button>
                <button className="btn-outline small" onClick={closeModal} style={{ marginLeft: '8px' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {message && (
          <p className={`status-msg ${message.includes("✅") ? "success" : "error"}`}>
            {message}
          </p>
        )}
      </div>
    </section>
  );

  const renderSettings = () => (
    <section className="content animate-fade">
      <div className="card glass">
        <h3>Settings</h3>
        <p className="placeholder-text">Manage your business effortlessly</p>

        <div className="grid-2 relaxed-grid">
          <div className="field">
            <label>Business Email</label>
            <input type="email" placeholder="name@business.com" />
          </div>
          <div className="field">
            <label>Contact Phone</label>
            <input type="tel" placeholder="+91 98765 43210" />
          </div>
          <div className="field">
            <label>Time Zone</label>
            <select>
              <option>Asia/Kolkata (IST)</option>
              <option>UTC</option>
              <option>Europe/London</option>
            </select>
          </div>
          <div className="field">
            <label>Notification Email</label>
            <input type="email" placeholder="alerts@business.com" />
          </div>
        </div>

        <div className="actions-right">
          <button className="btn-primary glow" type="button">
            Save Settings
          </button>
        </div>
      </div>
    </section>
  );

  const renderEditProfile = () => (
    <section className="content animate-fade">
      <div className="card glass">
        <h3>✏️ Edit Business Profile</h3>
        <p className="placeholder-text">Update your business information, logo, and banner.</p>

        {/* Cover Image Preview */}
        <div className="cover-preview">
          {businessData.coverImage ? (
            <img src={businessData.coverImage} alt="Cover" className="cover-img" />
          ) : (
            <div className="cover-placeholder">No cover uploaded</div>
          )}
          <button
            className="btn-primary glow small"
            onClick={() => handleImageUpload("cover")}
          >
            Upload Cover
          </button>
        </div>

        {/* Logo Preview */}
        <div className="logo-preview">
          {businessData.logo ? (
            <img src={businessData.logo} alt="Logo" className="logo-img" />
          ) : (
            <div className="logo-placeholder">No logo uploaded</div>
          )}
          <button
            className="btn-primary glow small"
            onClick={() => handleImageUpload("logo")}
          >
            Upload Logo
          </button>
        </div>

        <div className="grid-2 relaxed-grid">
          <div className="field">
            <label>Business Name</label>
            <input
              name="name"
              type="text"
              placeholder="Enter business name"
              value={businessData.name}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>Location</label>
            <input
              name="location"
              type="text"
              placeholder="Enter your location"
              value={businessData.location}
              onChange={handleChange}
            />
          </div>
        </div>

        <h3>Services</h3>
        {businessData.services.map((service, index) => (
          <div key={index} className="grid-3 relaxed-grid">
            <div className="field">
              <label>Service Name</label>
              <input
                type="text"
                value={service.serviceName}
                onChange={(e) =>
                  handleServiceChange(index, "serviceName", e.target.value)
                }
              />
            </div>
            <div className="field">
              <label>Duration (min)</label>
              <input
                type="number"
                value={service.serviceDuration}
                onChange={(e) =>
                  handleServiceChange(index, "serviceDuration", e.target.value)
                }
              />
            </div>
            <div className="field">
              <label>Price (₹)</label>
              <input
                type="number"
                value={service.servicePrice}
                onChange={(e) =>
                  handleServiceChange(index, "servicePrice", e.target.value)
                }
              />
            </div>
          </div>
        ))}

        <div className="actions-right">
          <button className="btn-primary glow" onClick={handleUpdateBusiness} disabled={loading}>
            {loading ? "Updating..." : "💾 Save Changes"}
          </button>
        </div>

        {message && (
          <p className={`status-msg ${message.includes("✅") ? "success" : "error"}`}>
            {message}
          </p>
        )}
      </div>
    </section>
  );

  return (
    <div className="bd-app">
      {/* Sidebar */}
      <aside className="sidebar glass">
        <div>
          <div className="logo">
            <img
              src="/logo.jpg.png"
              alt="BookieReserve Logo"
              className="logo-image"
            />
            <div className="logo-text">
              <h1>BookieReserve</h1>
              <p>Business Dashboard</p>
            </div>
          </div>

          <nav className="nav">
            {["dashboard", "bookings", "settings", "editprofile"].map((tab) => (
              <button
                key={tab}
                className={`nav-item ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                <span className="nav-icon">
                  {tab === "dashboard"
                    ? "📊"
                    : tab === "bookings"
                      ? "📅"
                      : tab === "settings"
                        ? "⚙️"
                        : "✏️"}
                </span>
                <span>
                  {tab === "editprofile" ? "Edit Profile" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <button className="bd-logout" onClick={() => navigate("/")}>
          ⏏ Logout
        </button>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="topbar glass">
          <div>
            <h2>
              {activeTab === "dashboard"
                ? "Dashboard"
                : activeTab === "bookings"
                  ? "Bookings"
                  : activeTab === "settings"
                    ? "Settings"
                    : "Edit Profile"}
            </h2>
            <p>Manage your business effortlessly</p>
          </div>

          <div className="topbar-actions">
            <button onClick={toggleTheme} className="btn-ghost">
              {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </button>
          </div>
        </header>

        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "bookings" && renderBookings()}
        {activeTab === "settings" && renderSettings()}
        {activeTab === "editprofile" && renderEditProfile()}

        {/* Right Panel */}
        <aside className="right-panel glass animate-float">
          <div className="card glass">
            <h3>Quick Stats</h3>
            <div className="stat-row">
              <div className="stat">
                <span>Services</span>
                <strong>{stats.services}</strong>
              </div>
              <div className="stat">
                <span>Time Slots</span>
                <strong>{stats.slots}</strong>
              </div>
              <div className="stat">
                <span>Bookings</span>
                <strong>{stats.bookings}</strong>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default BusinessDashboard;

