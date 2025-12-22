// src/CustomerDashboard.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerDashboard.css";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const db = getFirestore();

const API_URL = "http://localhost:5000/api/v1/getshop";
const BOOKING_API = "http://localhost:5000/api/v1/bookings";

const SERVICE_CATEGORIES = [
  {
    name: "Beauty & Personal Care",
    subcategories: [
      "Makeup & Styling",
      "Bridal Makeup",
      "Party Makeup",
      "Hair Styling",
      "Saree Draping",
      "Facial / Skincare treatments",
      "Waxing / Threading",
      "Body spa & massage",
      "Nails & Brows",
      "Nail extensions",
      "Lash extensions",
      "Brow shaping / microblading",
    ],
  },
  {
    name: "Fitness & Wellness",
    subcategories: [
      "Personal Fitness Training",
      "Yoga / Pilates",
      "Zumba / Dance Fitness",
      "Nutrition & Diet Plans",
      "Physiotherapy / Rehab",
      "Alternative Healing (Reiki, Sound Healing, Hypnotherapy)",
    ],
  },
  {
    name: "Coaching & Skill Development",
    subcategories: [
      "Music / Singing",
      "Instruments (Guitar, Piano, Drums, etc.)",
      "Dance Training",
      "Art & Craft (Painting, Pottery, DIY)",
      "Photography & Videography Training",
      "Personality, Confidence & Public Speaking Coaching",
      "Life & Career Coaching (non-academic)",
      "Astrology / Tarot",
    ],
  },
];


const SORT_OPTIONS = [
  "Top Rated First",
  "Nearby Locations",
  "Lowest Price",
  "Quickest Availability",
];

const CustomerDashboard = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSort, setSelectedSort] = useState("Top Rated First");
  const [sortOpen, setSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [shops, setShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(false);
  const [shopError, setShopError] = useState("");

  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "User",
    shopemail: "",
    phone: "",
    dob: "",
    address: "",
  });

  const [filters, setFilters] = useState({
    modeOfService: "",
    providerGender: "",
    groupType: "",
    experienceYears: "",
    languages: [],
    paymentType: "",
  });

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));


  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [selectedSubCategory, setSelectedSubCategory] = useState("");


  // Save user in Firestore
  const saveUserToDB = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    await setDoc(
      doc(db, "users", user.uid),
      { email: user.email, createdAt: serverTimestamp() },
      { merge: true }
    );
  };

  const getCustomerId = () => getAuth().currentUser?.uid;
  const getCustomerEmail = () => getAuth().currentUser?.email || "";

  // Fetch shops from API
  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoadingShops(true);
        setShopError("");
        const res = await axios.get(API_URL);
        const apiData = res.data.data;

        const mappedShops = apiData.map((shop) => ({
          id: shop._id,
          name: shop.name,
          shopemail: shop.shopemail,
          category: shop.masterCategory || shop.category,
          rating: shop.rating || 4.5,
          reviews: shop.reviews || 0,
          distanceKm: shop.distanceKm || 1,
          location: shop.location,

          providerGender: shop.providerGender,
          experienceYears: shop.experienceYears || 0,
          languages: shop.languages || [],

          services: shop.services?.map((s) => ({
            serviceName: s.serviceName,
            servicePrice: s.price,
            serviceDuration: s.duration,
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime,
            status: s.status,

            modeOfService: s.modeOfService,
            groupType: s.groupType,
            paymentType: s.paymentType,
          })) || [],
        }));


        setShops(mappedShops);
      } catch (err) {
        console.error("Error fetching shops:", err);
        setShopError("Failed to load shops");
      } finally {
        setLoadingShops(false);
      }
    };
    fetchShops();
  }, []);

  // Derived filtered & sorted shops
  const visibleShops = useMemo(() => {
    let list = shops;

    // CATEGORY
    if (selectedCategory) {
      list = list.filter((s) => s.category === selectedCategory);
    }

    // PROVIDER GENDER
    if (filters.providerGender) {
      list = list.filter(
        (s) => s.providerGender === filters.providerGender
      );
    }

    // EXPERIENCE
    if (filters.experienceYears) {
      list = list.filter(
        (s) => s.experienceYears >= Number(filters.experienceYears)
      );
    }

    // LANGUAGES
    if (filters.languages.length > 0) {
      list = list.filter((s) =>
        filters.languages.every((lang) => s.languages.includes(lang))
      );
    }

    // SERVICE LEVEL FILTERS
    list = list.filter((shop) =>
      shop.services.some((srv) => {
        if (filters.modeOfService && srv.modeOfService !== filters.modeOfService)
          return false;
        if (filters.groupType && srv.groupType !== filters.groupType)
          return false;
        if (filters.paymentType && srv.paymentType !== filters.paymentType)
          return false;
        return true;
      })
    );

    // SEARCH
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q)
      );
    }

    // SORT
    switch (selectedSort) {
      case "Top Rated First":
        return [...list].sort((a, b) => b.rating - a.rating);
      case "Nearby Locations":
        return [...list].sort((a, b) => a.distanceKm - b.distanceKm);
      case "Lowest Price":
        return [...list].sort(
          (a, b) => a.services[0].servicePrice - b.services[0].servicePrice
        );
      default:
        return list;
    }
  }, [shops, filters, selectedCategory, selectedSort, searchQuery]);






  const favoriteShops = shops.filter((s) => favorites.includes(s.id));

  // ---- Handlers ----
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory("");
    setSelectedShop(null);
  };


  const handleShopClick = (shop) => {
    setSelectedShop(shop);
    setSelectedSlot(null);
    setSelectedService(null);
  };

  const handleSlotClick = (service) => {
    setSelectedSlot(service);
    setSelectedService({
      serviceName: service.serviceName,
      startTime: service.startTime,
      endTime: service.endTime,
      date: service.date,
      duration: service.serviceDuration,
      price: service.servicePrice,
    });
    setShowConfirmModal(true);
  };

  const handleToggleFavorite = (shopId) => {
    setFavorites((prev) =>
      prev.includes(shopId) ? prev.filter((id) => id !== shopId) : [...prev, shopId]
    );
  };

  const handleConfirmBooking = async () => {
    if (!selectedShop || !selectedService) return;

    try {
      const payload = {
        customerId: getCustomerId(),
        customerEmail: getCustomerEmail(),
        shopId: selectedShop.id,
        shopemail: selectedShop.shopemail,
        shopName: selectedShop.name,
        category: selectedShop.category,
        location: selectedShop.location,
        time: selectedService.startTime,
        serviceName: selectedService.serviceName,
        durationMin: selectedService.duration,
        price: selectedService.price,
        date: selectedService.date,
        status: "confirmed",
      };

      const res = await axios.post(BOOKING_API, payload);

      setBookings((prev) => [...prev, res.data.data]);
      setShowConfirmModal(false);
      setSelectedShop(null);
      setSelectedSlot(null);
      setSelectedService(null);
    } catch (error) {
      console.error("Booking failed:", error);
    }
  };

  const handleProfileChange = (field, value) =>
    setProfile((prev) => ({ ...prev, [field]: value }));

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsEditingProfile(false);
  };

  // ---- Render ----
  const renderShopCard = (shop) => {
    const isFav = favorites.includes(shop.id);
    return (
      <div key={shop.id} className="cd-shop-card" onClick={() => handleShopClick(shop)}>
        <div className="cd-shop-main">
          <div className="cd-shop-icon">✂️</div>
          <div className="cd-shop-info">
            <div className="cd-shop-name">{shop.name}</div>
            <div className="cd-shop-meta">
              <span>⭐ {shop.rating.toFixed(1)}</span>
              <span>({shop.reviews} reviews)</span>
              <span>• {shop.location}</span>
              <span>• {shop.distanceKm} km</span>
            </div>
          </div>
          <button
            className={`cd-heart ${isFav ? "active" : ""}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(shop.id);
            }}
          >
            ♥
          </button>
        </div>
        <div className="cd-shop-footer">
          <div className="cd-shop-price">
            ₹{shop.price} • {shop.durationMin} min
          </div>
          <button
            type="button"
            className="cd-btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              handleShopClick(shop);
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    );
  };

  
const renderDashboard = () => (
  <>
    <div className="cd-header">
      <h1 className="cd-header-title">Dashboard</h1>
      <p className="cd-header-sub">Search and reserve services instantly</p>
    </div>

    <div className="cd-main">
      <section className="cd-content">
        {/* Search */}
        <input
          className="cd-simple-search"
          type="text"
          placeholder="Search shops, services, locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Categories */}
        <div className="cd-simple-categories">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              className="cd-simple-btn"
              onClick={() => handleCategoryClick(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Subcategories */}
        {selectedCategory && (
          <div className="cd-simple-subcategories">
            {SERVICE_CATEGORIES.find((c) => c.name === selectedCategory)
              ?.subcategories.map((sub) => (
                <button
                  key={sub}
                  className="cd-simple-btn-sm"
                  onClick={() => setSelectedSubCategory(sub)}
                >
                  {sub}
                </button>
              ))}
          </div>
        )}

        {/* Filters */}
        <div className="cd-simple-filters">
          <select onChange={(e) => updateFilter("modeOfService", e.target.value)}>
            <option value="">Mode of Service</option>
            <option value="online">Online</option>
            <option value="home">Home</option>
            <option value="studio">Studio</option>
          </select>

          <select onChange={(e) => updateFilter("providerGender", e.target.value)}>
            <option value="">Provider Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <select onChange={(e) => updateFilter("groupType", e.target.value)}>
            <option value="">Group Type</option>
            <option value="1on1">1-on-1</option>
            <option value="group">Group</option>
            <option value="workshop">Workshop</option>
          </select>
        </div>

        {/* Shops */}
        {shopError && <p className="cd-error">{shopError}</p>}
        {loadingShops && <p className="cd-muted">Loading shops...</p>}
        <div className="cd-shops-grid">{visibleShops.map(renderShopCard)}</div>
      </section>

      {/* Right Sidebar */}
      <aside className="cd-right">
        {selectedShop ? (
          <div className="cd-quick-card">
            <h3>Quick Book</h3>
            {selectedShop.services?.map((service, idx) => (
              <button
                key={idx}
                className={`cd-slot-item ${selectedSlot === service ? "selected" : ""}`}
                onClick={() => handleSlotClick(service)}
                disabled={service.status !== "free"}
              >
                {service.serviceName} • {service.date} • {service.startTime}-{service.endTime} • ₹{service.servicePrice}
              </button>
            ))}
          </div>
        ) : (
          <div className="cd-quick-card">Select a shop to see available slots</div>
        )}
      </aside>
    </div>
  </>
);

  const renderBookings = () => (
    <div className="cd-bookings-page">
      <h1 className="cd-header-title">My Bookings</h1>
      {bookings.length === 0 ? (
        <p className="cd-muted">No bookings yet. Book a service from the dashboard.</p>
      ) : (
        <div className="cd-booking-list">
          {bookings.map((b) => (
            <div key={b._id} className="cd-booking-card">
              <div className="cd-booking-title">{b.shopName}</div>
              <div className="cd-booking-meta">
                <span>{b.category}</span> • <span>{b.location}</span> • <span>{b.time}</span> • <span>₹{b.price} / {b.durationMin} min</span>
              </div>
              <div className="cd-booking-status">{b.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFavorites = () => (
    <div className="cd-bookings-page">
      <h1 className="cd-header-title">Favorites</h1>
      {favoriteShops.length === 0 ? (
        <p className="cd-muted">No favorites yet. Click the heart icon on a shop to add it.</p>
      ) : (
        <div className="cd-shops-grid">{favoriteShops.map(renderShopCard)}</div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="cd-profile-page">
      <h1 className="cd-header-title">Profile Settings</h1>
      <p className="cd-header-sub">Manage your account information and preferences</p>

      <div className="cd-profile-card">
        <div className="cd-profile-top">
          <div className="cd-profile-avatar" />
          <div>
            <div className="cd-profile-name">{profile.fullName || "User"}</div>
          </div>
          <button type="button" className="cd-btn-primary" onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
        </div>

        <form className="cd-profile-form" onSubmit={handleSaveProfile}>
          <div className="cd-profile-grid">
            <div className="cd-field">
              <label>Full Name</label>
              <input type="text" value={profile.fullName} disabled={!isEditingProfile} onChange={(e) => handleProfileChange("fullName", e.target.value)} />
            </div>
            <div className="cd-field">
              <label>Email</label>
              <input type="email" value={profile.shopemail} disabled={!isEditingProfile} onChange={(e) => handleProfileChange("shopemail", e.target.value)} />
            </div>
            <div className="cd-field">
              <label>Phone</label>
              <input type="tel" value={profile.phone} disabled={!isEditingProfile} onChange={(e) => handleProfileChange("phone", e.target.value)} />
            </div>
            <div className="cd-field">
              <label>DOB</label>
              <input type="date" value={profile.dob} disabled={!isEditingProfile} onChange={(e) => handleProfileChange("dob", e.target.value)} />
            </div>
            <div className="cd-field cd-field-full">
              <label>Address</label>
              <input type="text" value={profile.address} disabled={!isEditingProfile} onChange={(e) => handleProfileChange("address", e.target.value)} />
            </div>
          </div>

          {isEditingProfile && (
            <div className="cd-profile-actions">
              <button type="button" className="cd-btn-outline" onClick={() => setIsEditingProfile(false)}>Cancel</button>
              <button type="submit" className="cd-btn-primary">Save Changes</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );

  return (
    <div className="cd-root">
      <aside className="cd-sidebar">
        <div className="cd-logo">
          <img src="/logo.jpg.png" alt="BookieReserve Logo" className="cd-logo-image" />
          <div>
            <div className="cd-logo-title">BookieReserve</div>
            <div className="cd-logo-sub">Customer Portal</div>
          </div>
        </div>

        <nav className="cd-nav">
          <button className={`cd-nav-item ${activeSection === "dashboard" ? "active" : ""}`} onClick={() => setActiveSection("dashboard")}>📊 Dashboard</button>
          <button className={`cd-nav-item ${activeSection === "bookings" ? "active" : ""}`} onClick={() => setActiveSection("bookings")}>📅 My Bookings</button>
          <button className={`cd-nav-item ${activeSection === "favorites" ? "active" : ""}`} onClick={() => setActiveSection("favorites")}>❤️ Favorites</button>
          <button className={`cd-nav-item ${activeSection === "profile" ? "active" : ""}`} onClick={() => setActiveSection("profile")}>👤 Profile</button>
        </nav>

        <button type="button" className="cd-logout" onClick={() => navigate("/")}>⏏ Logout</button>
      </aside>

      <div className="cd-main-wrapper">
        {activeSection === "dashboard" && renderDashboard()}
        {activeSection === "bookings" && renderBookings()}
        {activeSection === "favorites" && renderFavorites()}
        {activeSection === "profile" && renderProfile()}
      </div>

      {/* Confirm Booking Modal */}
      {showConfirmModal && selectedShop && selectedService && (
        <div className="cd-modal-backdrop" onClick={() => setShowConfirmModal(false)}>
          <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="cd-modal-title">Confirm Booking?</h3>
            <div className="cd-modal-body">
              <div className="cd-modal-shop">{selectedShop.name}</div>
              <div>
                <div>Service: {selectedService.serviceName}</div>
                <div>Date: {selectedService.date}</div>
                <div>Time: {selectedService.startTime} - {selectedService.endTime}</div>
                <div>Duration: {selectedService.duration} min</div>
                <div>Price: ₹{selectedService.price}</div>
              </div>
            </div>
            <div className="cd-modal-actions">
              <button className="cd-btn-outline" onClick={() => setShowConfirmModal(false)}>No</button>
              <button className="cd-btn-primary" onClick={handleConfirmBooking}>Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
