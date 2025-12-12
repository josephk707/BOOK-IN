import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Building2, Sun, Moon } from "lucide-react";
import "./HomePage.css";

const HomePage = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const [showCustomer, setShowCustomer] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const customerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onDocClick(e) {
      if (customerRef.current && !customerRef.current.contains(e.target)) {
        setShowCustomer(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    if (darkMode) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
  }, [darkMode]);

  return (
    <div className="home-page">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="logo-section">
            <img
              src="/logo.jpg.png"
              alt="Bookie Reserve Logo"
              className="header-logo-image"
            />
            <div className="logo-pill">BOOKIE RESERVE</div>
          </div>

          <nav className="nav-links">
            <button className="nav-link active">Home</button>
            <button className="nav-link" onClick={() => setShowAbout(true)}>
              About
            </button>

            <div className="nav-item" ref={customerRef}>
              <button
                className="nav-link"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCustomer((s) => !s);
                }}
              >
                Customer Service
              </button>
              {showCustomer && (
                <div className="customer-dropdown">
                  <div className="customer-email">
                    Bookiereserve@gmail.com
                  </div>
                </div>
              )}
            </div>

            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-left">
          <span className="badge">Smart Scheduling Platform</span>
          <div className="title-container">
            <h1 className="title">Book Smarter, Live Better</h1>
            <p className="subtitle">
              BookieReserve is your all-in-one booking solution for salons,
              hotels, cafés, and clinics. Eliminate wait times, skip phone
              calls, and manage appointments effortlessly with real-time
              availability and instant confirmations.
            </p>
          </div>
          <div className="calendar-preview">
            <Calendar size={18} />
            <p>
              Next Available: <strong>Today, 4:00 PM</strong>
            </p>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-image-card floating">
            <img
              src="/hero-dashboard.png"
              alt="Booking Dashboard"
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="get-started">
        <h2 className="section-title">Get Started</h2>
        <p className="section-subtitle">Choose your account type to begin</p>

        <div className="role-cards">
          <div
            className={`role-card ${
              selectedRole === "customer" ? "role-card-active" : ""
            }`}
            onClick={() => setSelectedRole("customer")}
          >
            <div className="role-icon">
              <Calendar size={28} strokeWidth={1.5} />
            </div>
            <h3 className="role-title">Book an Appointment</h3>
            <p className="role-desc">
              Reserve services at salons, hotels, cafés, and clinics
            </p>
          </div>

          <div
            className={`role-card ${
              selectedRole === "business" ? "role-card-active" : ""
            }`}
            onClick={() => setSelectedRole("business")}
          >
            <div className="role-icon">
              <Building2 size={28} strokeWidth={1.5} />
            </div>
            <h3 className="role-title">Business</h3>
            <p className="role-desc">
              Manage appointments and grow your business
            </p>
          </div>
        </div>

        {selectedRole && (
          <div className="auth-buttons">
            <button
              className="btn-outline"
              onClick={() =>
                navigate("/login", { state: { role: selectedRole } })
              }
            >
              Login →
            </button>
            <button
              className="btn-primary"
              onClick={() =>
                navigate("/signup", { state: { role: selectedRole } })
              }
            >
              Sign Up 👤
            </button>
          </div>
        )}
      </section>

      {/* About Modal */}
      {showAbout && (
        <div className="about-overlay" onClick={() => setShowAbout(false)}>
          <div className="about-modal" onClick={(e) => e.stopPropagation()}>
            <img
              src="/about-illustration.png"
              alt="About Bookie Reserve"
              className="about-image"
            />
            <h2>About Bookie Reserve</h2>
            <p>
              Bookie Reserve is a modern appointment booking platform designed
              for simplicity and speed. Whether you run a salon, a clinic, or a
              café, we empower you to manage bookings, track availability, and
              grow your business — all from one place.
            </p>
            <button className="btn-close" onClick={() => setShowAbout(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
