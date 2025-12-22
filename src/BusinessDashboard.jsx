// src/BusinessDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CreatableSelect from "react-select/creatable";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import "./BusinessDashboard.css";
import { getAuth } from "firebase/auth";



const API_URL = "http://localhost:5000/api/v1/createshop";

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

const CATEGORY_SERVICES = {
  "Beauty & Personal Care": [
    {
      subCategory: "Makeup Services",
      services: [
        "Party makeup",
        "Engagement makeup",
        "Photoshoot makeup",
        "Editorial / glam",
        "HD vs Airbrush makeup",
      ],
    },
    {
      subCategory: "Hair Services",
      services: [
        "Styling (blow-dry, curls, straightening)",
        "Braiding",
        "Updos",
        "Basic grooming",
      ],
    },
    {
      subCategory: "Skin & Facial Care",
      services: [
        "Basic facials",
        "Advanced facials",
        "Acne care",
        "Anti-ageing facials",
        "Clean-ups",
        "De-tan",
        "Body polishing",
      ],
    },
    {
      subCategory: "Grooming & Body Care",
      services: [
        "Waxing",
        "Threading",
        "Body scrub",
        "Massage (non-therapeutic)",
      ],
    },
    {
      subCategory: "Nail & Lash Services",
      services: [
        "Nail extensions",
        "Gel polish",
        "Nail art",
        "Lash extensions",
        "Brow lamination / tinting",
      ],
    },
    {
      subCategory: "Spa & Wellness Body Treatments",
      services: [
        "Spa massages",
        "Aroma therapy",
        "Reflexology",
        "Head massage",
        "Foot spa",
      ],
    },
  ],
  "Fitness & Wellness": [
    "Personal Fitness Training", "Yoga / Pilates", "Zumba / Dance Fitness",
    "Nutrition & Diet Plans", "Physiotherapy / Rehab", "Reiki / Sound Healing",
  ],
  "Coaching & Skill Development": [
    "Music / Singing", "Dance Training", "Art & Craft", "Photography Training",
    "Public Speaking", "Life & Career Coaching", "Astrology / Tarot",
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


const BASE_URL = "http://localhost:5000/api/v1/getshopbyid";

const UPDATE_URL = "http://localhost:3000/api/v1/updateshopbyid";


const BusinessDashboard = () => {
  const [activeTab, setActiveTab] = useState("your-shop");
  const [theme, setTheme] = useState("dark");
  const navigate = useNavigate();

  const [businessData, setBusinessData] = useState({
    name: "",
    location: "",
    shopemail: "",
    category: "",
    services: [
      {
        serviceName: "",
        serviceDuration: "",
        servicePrice: "",
        date: "",
        startTime: "",
        endTime: "",
      },
    ],
  });


  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [shopData, setShopData] = useState(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);


  const [bookings, setBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);


  const getUserId = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");
    return user.uid;
  };



  const getUserDetails = async () => {
    const uid = getUserId();
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("User data not found");
    }

    return docSnap.data();
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setBookingLoading(true);
        const userId = getUserId();

        const res = await axios.get(
          `http://localhost:5000/api/v1/bookings/business/${userId}`
        );

        setBookings(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setBookingLoading(false);
      }
    };

    fetchBookings();
  }, []);





  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const fetchYourShop = async () => {
      if (activeTab !== "your-shop") return;

      const user = auth.currentUser;
      if (!user) return;

      try {
        setShopLoading(true);

        const response = await axios.get(`${BASE_URL}/${user.uid}`);
        setShopData(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          setShopData(null);
        } else {
          console.error("Error fetching shop:", error);
        }
      } finally {
        setShopLoading(false);
      }
    };


    fetchYourShop();
  }, [activeTab]);

  console.log(shopData)

  useEffect(() => {
    const fetchBusinessData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const docRef = doc(db, "businesses", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBusinessData(docSnap.data());
          console.log("✅ Business data loaded from Firestore");
        }
      } catch (error) {
        console.error("⚠️ Error loading business data:", error);
      }
    };
    fetchBusinessData();
  }, []);

  const handleChange = (e) =>
    setBusinessData({ ...businessData, [e.target.name]: e.target.value });

  const handleServiceChange = (index, field, value) => {
    const updated = [...businessData.services];
    updated[index][field] = value;
    setBusinessData({ ...businessData, services: updated });
  };

  const addService = () =>
    setBusinessData(prev => ({
      ...prev,
      services: [
        ...prev.services,
        {
          serviceName: "",
          serviceDuration: "",
          servicePrice: "",
          date: "",
          startTime: "",
          endTime: "",
          modeOfService: "online",
          providerGender: "any",
          groupType: "1on1",
          experienceYears: 0,
          languages: [],
          paymentType: "pay_confirm",
        },
      ],
    }));



  const handleSaveBusiness = async () => {
    try {
      setLoading(true);

      const user = auth.currentUser;
      if (!user) {
        setMessage("⚠️ User not logged in");
        return;
      }

      const payload = {
        name: businessData.name,
        location: businessData.location,
        shopemail: businessData.shopemail,
        masterCategory: businessData.category,
        userId: user.uid,
        services: businessData.services.map(s => ({
          serviceName: s.serviceName,
          duration: Number(s.serviceDuration) || 30,
          price: Number(s.servicePrice) || 0,
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
          modeOfService: s.modeOfService,
          providerGender: s.providerGender || "any",
          groupType: s.groupType || "1on1",
          experienceYears: Number(s.experienceYears) || 0,
          languages: Array.isArray(s.languages) ? s.languages : ["tamil"],
          paymentType: s.paymentType || "pay_confirm",
        })),
      };

      await axios.post(API_URL, payload);

      setMessage("✅ Business saved successfully");
      setActiveTab("your-shop");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to save business");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBusiness = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user || !shopData?._id) {
        setMessage("⚠️ Unable to update shop");
        return;
      }

      const payload = {
        name: businessData.name,
        location: businessData.location,
        shopemail: businessData.shopemail,
        category: businessData.category,
        services: businessData.services,
      };

      await axios.put(
        `http://localhost:5000/api/v1/updateshopbyid/${shopData._id}`,
        payload
      );


      setMessage("✅ Business updated successfully!");
      setIsEditMode(false);
      setActiveTab("your-shop");
    } catch (error) {
      console.error(error);
      setMessage("⚠️ Failed to update business");
    } finally {
      setLoading(false);
    }
  };


  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  // ✅ Render Create Shop Tab
  const renderDashboard = () => (
    <section className="content animate-fade">
      <div className="hero-section">
        {/* <img
          src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1500&q=80"
          alt="Business Team"
          className="hero-img"
        /> */}
        <h2>
          Welcome back,{" "}
          <span style={{ color: "#6ec1e4" }}>
            {businessData.name || "Business Owner"}
          </span>
          !
        </h2>
        <p>Organize, manage, and visualize your business effortlessly.</p>
      </div>

      <div className="card glass">
        <h3>Business Setup</h3>
        <p>Create or update your business profile</p>

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

          <div className="field">
            <label>email</label>
            <input
              name="shopemail"
              type="text"
              placeholder="Enter email"
              value={businessData.shopemail}
              onChange={handleChange}
            />
          </div>
        </div>

        <h3>Choose Category</h3>
        <div className="field">
          <label>Select Main Category</label>
          <select
            name="category"
            value={businessData.category}
            onChange={handleChange}
          >
            <option value="">-- Select a Category --</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.label}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        <h3>Service Details</h3>
        {businessData.services.map((service, i) => (
          <div key={i} className="service-block glass-box">
            <div className="grid-3 relaxed-grid">

              {/* SERVICE NAME */}
              <div className="field">
                <label>Service Name</label>
                <CreatableSelect
                  isClearable
                  placeholder="Select or type a service"
                  options={
                    (CATEGORY_SERVICES[businessData.category] || []).flatMap(cat =>
                      cat.services.map(srv => ({ label: srv, value: srv }))
                    )
                  }
                  value={
                    service.serviceName
                      ? { label: service.serviceName, value: service.serviceName }
                      : null
                  }
                  onChange={(opt) =>
                    handleServiceChange(i, "serviceName", opt?.value || "")
                  }
                />
              </div>

              {/* DURATION */}
              <div className="field">
                <label>Duration (min)</label>
                <input
                  type="number"
                  value={service.serviceDuration}
                  onChange={(e) =>
                    handleServiceChange(i, "serviceDuration", e.target.value)
                  }
                />
              </div>

              {/* PRICE */}
              <div className="field">
                <label>Price (₹)</label>
                <input
                  type="number"
                  value={service.servicePrice}
                  onChange={(e) =>
                    handleServiceChange(i, "servicePrice", e.target.value)
                  }
                />
              </div>

              {/* DATE */}
              <div className="field">
                <label>Date</label>
                <input
                  type="date"
                  value={service.date}
                  onChange={(e) =>
                    handleServiceChange(i, "date", e.target.value)
                  }
                />
              </div>

              {/* TIME */}
              <div className="field">
                <label>Start Time</label>
                <input
                  type="time"
                  value={service.startTime}
                  onChange={(e) =>
                    handleServiceChange(i, "startTime", e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>End Time</label>
                <input
                  type="time"
                  value={service.endTime}
                  onChange={(e) =>
                    handleServiceChange(i, "endTime", e.target.value)
                  }
                />
              </div>

              {/* MODE OF SERVICE */}
              <div className="field">
                <label>Mode of Service</label>
                <select
                  value={service.modeOfService}
                  onChange={(e) =>
                    handleServiceChange(i, "modeOfService", e.target.value)
                  }
                >
                  <option value="online">Online</option>
                  <option value="home">Home Service</option>
                  <option value="studio">Studio / Salon</option>
                </select>
              </div>

              {/* PROVIDER GENDER */}
              <div className="field">
                <label>Provider Gender</label>
                <select
                  value={service.providerGender}
                  onChange={(e) =>
                    handleServiceChange(i, "providerGender", e.target.value)
                  }
                >
                  <option value="any">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* GROUP TYPE */}
              <div className="field">
                <label>Group Type</label>
                <select
                  value={service.groupType}
                  onChange={(e) =>
                    handleServiceChange(i, "groupType", e.target.value)
                  }
                >
                  <option value="1on1">1-on-1</option>
                  <option value="group">Group Class</option>
                  <option value="workshop">Workshop</option>
                </select>
              </div>

              {/* EXPERIENCE */}
              <div className="field">
                <label>Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  value={service.experienceYears}
                  onChange={(e) =>
                    handleServiceChange(i, "experienceYears", e.target.value)
                  }
                />
              </div>

              {/* LANGUAGES */}
              <div className="field">
                <label>Languages</label>
                <CreatableSelect
                  isMulti
                  placeholder="EN, HI, TA..."
                  value={Array.isArray(service.languages)
                    ? service.languages.map(l => ({ label: l, value: l }))
                    : []
                  }

                  onChange={(opts) =>
                    handleServiceChange(
                      i,
                      "languages",
                      opts.map(o => o.value)
                    )
                  }
                />
              </div>

              {/* PAYMENT TYPE */}
              <div className="field">
                <label>Payment Type</label>
                <select
                  value={service.paymentType}
                  onChange={(e) =>
                    handleServiceChange(i, "paymentType", e.target.value)
                  }
                >
                  <option value="pay_later">Pay Later</option>
                  <option value="pay_confirm">Pay to Confirm</option>
                  <option value="deposit">Online Deposit</option>
                </select>
              </div>
            </div>
          </div>
        ))}


        <button className="btn-secondary small" onClick={addService}>
          ➕ Add Another Service
        </button>



        {message && <p className="status-msg">{message}</p>}

        <div className="actions-right">
          <button
            className="btn-primary glow"
            onClick={isEditMode ? handleUpdateBusiness : handleSaveBusiness}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : isEditMode
                ? "Update Business"
                : "Save Business"}
          </button>

        </div>
      </div>
    </section>
  );


  const renderBookings = () => (
    <div className="cd-bookings-page">
      <h1 className="cd-header-title">My Bookings</h1>

      {bookingLoading ? (
        <p className="cd-muted">Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p className="cd-muted">No bookings yet.</p>
      ) : (
        <div className="cd-booking-list">
          {bookings.map((b) => (
            <div key={b._id} className="cd-booking-card">
              <div className="cd-booking-title">{b.shopName}</div>

              <div className="cd-booking-meta">
                <span>⏰ {b.time}</span>
                <span>₹{b.price}</span>
              </div>

              {/* 👤 Customer Info */}
              {b.customer && (
                <div className="cd-customer-info">
                  <p><strong>Customer:</strong> {b.customer.fullName}</p>
                  <p><strong>Email:</strong> {b.customer.email}</p>
                  <p><strong>Phone:</strong> {b.customer.phone}</p>
                </div>
              )}

              <div className="cd-booking-status">
                Status: {b.status}
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );



  // ✅ Render Settings Tab
  const renderSettings = () => (
    <section className="content animate-fade">
      <div className="card glass">
        <h3>Settings</h3>
        <p>Manage your preferences</p>
      </div>
    </section>
  );

  // ✅ Render Your Shop Tab
  const renderyourshop = () => {
    if (shopLoading) {
      return (
        <div className="shop-container glass">
          <h2>Loading your shop...</h2>
        </div>
      );
    }

    if (!shopData) {
      return (
        <div className="shop-container glass">
          <h2>No shop found!</h2>
          <button onClick={() => setActiveTab("create shop")}>Create Shop</button>
          <p>You haven’t set up your business yet.</p>
        </div>
      );
    }

    return (
      <div className="shop-container glass">
        <h1 className="shop-title">
          Welcome, <span>{shopData.name}</span>!
        </h1>

        <div className="shop-info">
          <p><strong>📍 Location:</strong> {shopData.location}</p>
          <p><strong>🏷️ Category:</strong> {shopData.category}</p>
          <p><strong>📧 Email:</strong> {shopData.shopemail}</p>
        </div>

        <div className="shop-section">
          <h3>🛠️ Services Offered</h3>
        

            {shopData?.services?.length > 0 ? (
              <ul>
                {shopData.services.map((srv, idx) => (
                  <li key={idx} className="service-item">
                    <strong>{srv.serviceName}</strong>
                    <br />
                    ⏱ Duration: {srv.duration} mins
                    <br />
                    💰 Price: ₹{srv.price}
                    <br />
                    📅 {srv.date}
                    <br />
                    ⏰ {srv.startTime} - {srv.endTime}
                    <br />
                    🌐 Mode: {srv.modeOfService}
                    <br />
                    👤 Provider: {srv.providerGender}
                    <br />
                    👥 Type: {srv.groupType}
                    <br />
                    🧠 Experience: {srv.experienceYears} years
                    <br />
                    🗣 Languages: {srv.languages?.join(", ")}
                    <br />
                    💳 Payment: {srv.paymentType}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No services added yet.</p>
            )}
       

        </div>

        <button
          onClick={() => {
            setBusinessData({
              name: shopData.name,
              location: shopData.location,
              shopemail: shopData.shopemail,
              category: shopData.category,
              services: shopData.services,
            });
            setIsEditMode(true);
            setActiveTab("edit-shop");
          }}
        >
          ✏️ Edit Business
        </button>
      </div>
    );
  };


  return (
    <div className="bd-app">
      {/* Sidebar */}
      <aside className="sidebar glass">
        <div className="logo">
          <img src="/logo.jpg.png" alt="Logo" className="logo-image" />
          <div className="logo-text">
            <h1>BookieReserve</h1>
            <p>Business Dashboard</p>
          </div>
        </div>

        <nav className="nav">
          {["create shop", "bookings", "your-shop", "settings"].map((tab) => (
            <button
              key={tab}
              className={`nav-item ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="nav-icon">
                {tab === "create shop"
                  ? "📊"
                  : tab === "bookings"
                    ? "📅"
                    : tab === "your-shop"
                      ? "🏪"
                      : "⚙️"}
              </span>
              <span>
                {tab === "your-shop"
                  ? "Your Shop"
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>


            </button>
          ))}
        </nav>

        <button className="bd-logout" onClick={() => navigate("/")}>
          ⏏ Logout
        </button>
      </aside>

      {/* Main Section */}
      <main className="main">
        <header className="topbar glass">
          <div>
            <h2>
              {activeTab === "create shop"
                ? "Create Shop"
                : activeTab === "bookings"
                  ? "bookings"
                  : activeTab === "settings"
                    ? "Settings"
                    : activeTab === "Your Shop"
                      ? "Settings"
                      : "Your Shop"}
            </h2>
            <p>Manage your business effortlessly</p>
          </div>



          <div className="topbar-actions">
            <button onClick={toggleTheme} className="btn-ghost">
              {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </button>
          </div>
        </header>

        {activeTab === "create shop" && renderDashboard()}
        {activeTab === "edit-shop" && renderDashboard()}

        {activeTab === "bookings" && renderBookings()}
        {activeTab === "settings" && renderSettings()}
        {activeTab === "your-shop" && renderyourshop()}

      </main>
    </div>
  );
};

export default BusinessDashboard;
