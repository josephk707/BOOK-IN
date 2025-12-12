// src/CustomerDashboard.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerDashboard.css";

const API_URL = "http://localhost:5000/api/v1/getshop";

const SERVICE_CATEGORIES = [
  "Beauty & Personal Care",
  "Fitness & Wellness",
  "Coaching & Skill Development",
  "Home & Lifestyle Services",
  "Events & Entertainment",
  "Health & Medical Support",
  "Tech & Digital Services",
  "Education & Tutoring",
  "Travel & Experiences",
  "Pet Care & Training",
  "Business & Professional Services",
  "Creative & Production Services",
];

const SORT_OPTIONS = [
  "Top Rated First",
  "Nearby Locations",
  "Lowest Price",
  "Quickest Availability",
];

// Fallback static data (used only if API fails)
const FALLBACK_SHOPS = [
  {
    id: 1,
    name: "Elite Hair Studio",
    category: "Haircuts",
    rating: 4.9,
    reviews: 342,
    distanceKm: 1.2,
    location: "Downtown Plaza",
    price: 450,
    durationMin: 60,
    slots: ["09:00", "11:00", "14:00", "17:00"],
  },
  {
    id: 2,
    name: "Serenity Spa & Wellness",
    category: "Spa & Massage",
    rating: 4.8,
    reviews: 567,
    distanceKm: 2.5,
    location: "Wellness Center",
    price: 350,
    durationMin: 45,
    slots: ["09:00", "10:30", "14:00", "15:30", "17:00"],
  },
  {
    id: 3,
    name: "Glow Beauty Lounge",
    category: "Beauty & Skin",
    rating: 4.9,
    reviews: 423,
    distanceKm: 0.8,
    location: "Beauty District",
    price: 400,
    durationMin: 50,
    slots: ["10:00", "12:00", "16:00"],
  },
  {
    id: 4,
    name: "PowerFit Training Center",
    category: "Fitness & Training",
    rating: 4.7,
    reviews: 289,
    distanceKm: 3.1,
    location: "Sports Complex",
    price: 500,
    durationMin: 60,
    slots: ["06:00", "07:30", "18:00", "19:30"],
  },
];

const CustomerDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard"); // dashboard | bookings | favorites | profile
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSort, setSelectedSort] = useState("Top Rated First");
  const [sortOpen, setSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [shops, setShops] = useState(FALLBACK_SHOPS);
  const [loadingShops, setLoadingShops] = useState(false);
  const [shopError, setShopError] = useState("");

  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [userLocation, setUserLocation] = useState("");
  const [recommended, setRecommended] = useState([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "User",
    email: "",
    phone: "",
    dob: "",
    address: "",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // ---- Fetch shops from backend ----
  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoadingShops(true);
        setShopError("");

        const res = await axios.get(API_URL);

        // Adjust this based on your backend response structure:
        // e.g. { success: true, data: [...] }
        const apiData = res.data.data || res.data;

        // Map API shops into the shape used by the UI.
        // Change these mappings depending on what your /getshop returns.
        const mappedShops = apiData.map((shop, index) => ({
          id: shop.id || shop._id || index,
          name: shop.name,
          category: shop.masterCategory || shop.category || "Haircuts",
          rating: shop.rating || 4.5,
          reviews: shop.reviews || 0,
          distanceKm: shop.distanceKm || 1.0,
          location: shop.location || "Unknown",
          price: shop.services?.[0]?.price || shop.price || 400,
          durationMin: shop.services?.[0]?.duration || shop.durationMin || 45,
          // Extract time slots from timeSlots array
          slots: shop.timeSlots?.map(t => t.startTime) || 
                 shop.timeSlot?.slots || 
                 shop.slots || 
                 ["09:00", "11:00", "14:00"],
        }));

        setShops(mappedShops);
      } catch (err) {
        console.error("Error fetching shops:", err);
        setShopError("Could not load shops from server. Showing demo data.");
        setShops(FALLBACK_SHOPS);
      } finally {
        setLoadingShops(false);
      }
    };

    fetchShops();
  }, []);

  // ---- Geo-location detection and recommendations ----
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const geo = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await geo.json();
          const cityName = data.address.city || data.address.town || "Unknown";
          setUserLocation(cityName);
        } catch {
          setUserLocation("Unknown");
        }
      },
      (err) => console.warn("Location access denied:", err)
    );
  }, []);

  // Fetch recommendations function
  const fetchRecommendations = async (location) => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/recommend", {
        params: { location, category: selectedCategory || undefined }
      });
      setRecommended(res.data.data || []);
    } catch (error) {
      console.warn("Failed to fetch recommendations:", error);
      setRecommended([]);
    }
  };

  // ----- derived data -----  
  const visibleShops = useMemo(() => {
    let list = shops;

    // Filter by selected category if one is chosen
    if (selectedCategory) {
      list = list.filter((shop) => shop.category === selectedCategory);
    }

    // Filter by search query (matches name, location, or category)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (shop) =>
          shop.name.toLowerCase().includes(q) ||
          shop.location.toLowerCase().includes(q) ||
          shop.category.toLowerCase().includes(q)
      );
    }

    // Sort options
    switch (selectedSort) {
      case "Top Rated First":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case "Nearby Locations":
        list = [...list].sort((a, b) => a.distanceKm - b.distanceKm);
        break;
      case "Lowest Price":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "Quickest Availability":
        list = [...list].sort((a, b) => a.durationMin - b.durationMin);
        break;
      default:
        break;
    }

    return list;
  }, [shops, selectedCategory, selectedSort, searchQuery]);

  const favoriteShops = shops.filter((s) => favorites.includes(s.id));

  // ----- handlers -----  
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedShop(null);
    setSelectedSlot(null);
  };

  const handleShopClick = (shop) => {
    setSelectedShop(shop);
    setSelectedSlot(null);
  };

  const handleToggleFavorite = (shopId) => {
    setFavorites((prev) =>
      prev.includes(shopId)
        ? prev.filter((id) => id !== shopId)
        : [...prev, shopId]
    );
  };

  const handleSlotClick = (slot) => {
    if (!selectedShop) return;
    setSelectedSlot(slot);
    setShowConfirmModal(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedShop || !selectedSlot) return;

    const newBooking = {
      id: Date.now(),
      shopId: selectedShop.id,
      shopName: selectedShop.name,
      category: selectedShop.category,
      time: selectedSlot,
      durationMin: selectedShop.durationMin,
      price: selectedShop.price,
      location: selectedShop.location,
      status: "Pending payment",
    };

    setBookings((prev) => [...prev, newBooking]);
    setShowConfirmModal(false);
  };

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsEditingProfile(false);
  };

  // ----- render helpers -----  
  const renderShopCard = (shop) => {
    const isFav = favorites.includes(shop.id);
    return (
      <div
        key={shop.id}
        className="cd-shop-card"
        onClick={() => handleShopClick(shop)}
      >
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
              setSelectedShop(shop);
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
        <p className="cd-header-sub">
          Search and reserve top-rated services instantly
        </p>
      </div>

      <div className="cd-main">
        {/* left big column */}
        <div>
          <section className="cd-content">
            {/* Search Bar */}
            <div className="cd-searchbar">
              <input
                type="text"
                placeholder="🔍 Search shops, services, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <h2 className="cd-category-header">
              What are you looking for today?
            </h2>
            <div className="cd-categories">
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`cd-chip ${
                    selectedCategory === cat ? "cd-chip-active" : ""
                  }`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Smart Recommendations */}
            {recommended.length > 0 && (
              <div className="cd-recommendations">
                <h3 className="cd-section-title">✨ Recommended for You in {userLocation}</h3>
                <div className="cd-recommendations-grid">
                  {recommended.slice(0, 3).map((rec) => (
                    <div key={rec._id} className="cd-rec-card">
                      <div className="cd-rec-name">{rec.name}</div>
                      <div className="cd-rec-meta">
                        {rec.masterCategory} • {rec.location}
                      </div>
                      <div className="cd-rec-score">Match: {rec.relevanceScore}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="cd-toolbar">
              <div
                className="cd-sort-dropdown"
                onClick={() => setSortOpen((o) => !o)}
              >
                <span>{selectedSort}</span>
                <span>▾</span>
                {sortOpen && (
                  <div
                    className="cd-sort-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`cd-sort-item ${
                          selectedSort === opt ? "active" : ""
                        }`}
                        onClick={() => {
                          setSelectedSort(opt);
                          setSortOpen(false);
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {shopError && <p className="cd-error">{shopError}</p>}
            {loadingShops && (
              <p className="cd-muted">Loading shops from server...</p>
            )}

            <h3 className="cd-section-title">Featured Shops</h3>
            <div className="cd-shops-grid">
              {visibleShops.map(renderShopCard)}
            </div>
          </section>
        </div>

        {/* right quick book column */}
        <aside className="cd-right">
          <div className="cd-quick-card">
            <h3 className="cd-section-title">Quick Book</h3>
            {!selectedShop ? (
              <p className="cd-muted">
                Select a shop to view available slots.
              </p>
            ) : (
              <>
                <div className="cd-quick-shop-name">
                  {selectedShop.name}
                </div>
                <div className="cd-quick-location">
                  {selectedShop.location} • {selectedShop.distanceKm} km
                </div>
                <h4 className="cd-quick-sub">Available Slots</h4>
                <div className="cd-slot-list">
                  {selectedShop.slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className="cd-slot-item"
                      onClick={() => handleSlotClick(slot)}
                    >
                      <span>⏰ {slot}</span>
                      <span>
                        ₹{selectedShop.price} • {selectedShop.durationMin} min
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  );

  const renderBookings = () => (
    <div className="cd-bookings-page">
      <h1 className="cd-header-title">My Bookings</h1>
      {bookings.length === 0 ? (
        <p className="cd-muted">
          No bookings yet. Book a service from the dashboard.
        </p>
      ) : (
        <div className="cd-booking-list">
          {bookings.map((b) => (
            <div key={b.id} className="cd-booking-card">
              <div className="cd-booking-title">{b.shopName}</div>
              <div className="cd-booking-meta">
                <span>{b.category}</span>
                <span>• {b.location}</span>
                <span>• {b.time}</span>
                <span>
                  • ₹{b.price} / {b.durationMin} min
                </span>
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
        <p className="cd-muted">
          No favorites yet. Click the heart icon on a shop to add it.
        </p>
      ) : (
        <div className="cd-shops-grid">{favoriteShops.map(renderShopCard)}</div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="cd-profile-page">
      <h1 className="cd-header-title">Profile Settings</h1>
      <p className="cd-header-sub">
        Manage your account information and preferences
      </p>

      <div className="cd-profile-card">
        <div className="cd-profile-top">
          <div className="cd-profile-avatar" />
          <div>
            <div className="cd-profile-name">{profile.fullName || "User"}</div>
            <div className="cd-profile-badges">
              <span className="cd-badge">Premium Member</span>
              <span className="cd-badge-outline">Member since Jan 2024</span>
            </div>
          </div>
          <button
            type="button"
            className="cd-btn-primary"
            onClick={() => setIsEditingProfile(true)}
          >
            Edit Profile
          </button>
        </div>

        <form
          className="cd-profile-form"
          onSubmit={handleSaveProfile}
        >
          <div className="cd-profile-grid">
            <div className="cd-field">
              <label>Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                disabled={!isEditingProfile}
                onChange={(e) =>
                  handleProfileChange("fullName", e.target.value)
                }
              />
            </div>
            <div className="cd-field">
              <label>Email Address</label>
              <input
                type="email"
                value={profile.email}
                disabled={!isEditingProfile}
                onChange={(e) => handleProfileChange("email", e.target.value)}
              />
            </div>
            <div className="cd-field">
              <label>Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                disabled={!isEditingProfile}
                onChange={(e) => handleProfileChange("phone", e.target.value)}
              />
            </div>
            <div className="cd-field">
              <label>Date of Birth</label>
              <input
                type="date"
                value={profile.dob}
                disabled={!isEditingProfile}
                onChange={(e) => handleProfileChange("dob", e.target.value)}
              />
            </div>
            <div className="cd-field cd-field-full">
              <label>Address</label>
              <input
                type="text"
                value={profile.address}
                disabled={!isEditingProfile}
                onChange={(e) =>
                  handleProfileChange("address", e.target.value)
                }
              />
            </div>
          </div>

          {isEditingProfile && (
            <div className="cd-profile-actions">
              <button
                type="button"
                className="cd-btn-outline"
                onClick={() => setIsEditingProfile(false)}
              >
                Cancel
              </button>
              <button type="submit" className="cd-btn-primary">
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );

  return (
    <div className="cd-root">
      {/* Sidebar */}
      <aside className="cd-sidebar">
        <div>
          <div className="cd-logo">
            <img
              src="/logo.jpg.png"
              alt="BookieReserve Logo"
              className="cd-logo-image"
            />
            <div>
              <div className="cd-logo-title">BookieReserve</div>
              <div className="cd-logo-sub">Customer Portal</div>
            </div>
          </div>

          <nav className="cd-nav">
            <button
              type="button"
              className={`cd-nav-item ${
                activeSection === "dashboard" ? "active" : ""
              }`}
              onClick={() => setActiveSection("dashboard")}
            >
              <span>📊</span>
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              className={`cd-nav-item ${
                activeSection === "bookings" ? "active" : ""
              }`}
              onClick={() => setActiveSection("bookings")}
            >
              <span>📅</span>
              <span>My Bookings</span>
            </button>
            <button
              type="button"
              className={`cd-nav-item ${
                activeSection === "favorites" ? "active" : ""
              }`}
              onClick={() => setActiveSection("favorites")}
            >
              <span>❤️</span>
              <span>Favorites</span>
            </button>
            <button
              type="button"
              className={`cd-nav-item ${
                activeSection === "profile" ? "active" : ""
              }`}
              onClick={() => setActiveSection("profile")}
            >
              <span>👤</span>
              <span>Profile</span>
            </button>
          </nav>
        </div>

        <div>
          <div className="cd-sidebar-user">
            <div className="cd-sidebar-avatar" />
            <div className="cd-sidebar-userinfo">
              <div className="cd-sidebar-username">
                {profile.fullName || "User"}
              </div>
              <span className="cd-sidebar-badge">Premium Member</span>
            </div>
          </div>
          <button
            type="button"
            className="cd-logout"
            onClick={() => navigate("/")}
          >
            ⏏ Logout
          </button>
        </div>
      </aside>

      {/* Main content based on section */}
      <div className="cd-main-wrapper">
        {activeSection === "dashboard" && renderDashboard()}
        {activeSection === "bookings" && renderBookings()}
        {activeSection === "favorites" && renderFavorites()}
        {activeSection === "profile" && renderProfile()}
      </div>

      {/* Confirm booking modal */}
      {showConfirmModal && selectedShop && selectedSlot && (
        <div
          className="cd-modal-backdrop"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="cd-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="cd-modal-title">Confirm Booking?</h3>
            <div className="cd-modal-body">
              <div className="cd-modal-shop">
                {selectedShop.name}
              </div>
              <div className="cd-modal-lines">
                <div>Time: {selectedSlot}</div>
                <div>Duration: {selectedShop.durationMin} minutes</div>
                <div>Price: ₹{selectedShop.price}</div>
              </div>
            </div>
            <div className="cd-modal-actions">
              <button
                type="button"
                className="cd-btn-outline"
                onClick={() => setShowConfirmModal(false)}
              >
                No
              </button>
              <button
                type="button"
                className="cd-btn-primary"
                onClick={handleConfirmBooking}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;

