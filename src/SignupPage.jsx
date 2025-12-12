import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import "./SignupPage.css";

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || "customer";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password) {
      alert("Please fill all required fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    if (!agreeTerms) {
      alert("Please agree to Terms & Conditions");
      return;
    }

    alert("Account created successfully!");
    if (role === "business") navigate("/business-dashboard");
    else navigate("/customer-dashboard");
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        {/* Left Animated Side */}
        <div className="signup-left">
          <div className={`left-content ${animate ? "animate" : ""}`}>
            <img
              src="/logo.jpg.png"
              alt="BookieReserve Logo"
              className="logo-image-large"
            />
            <h1 className="brand-name">
              Bookie<span>Reserve</span>
            </h1>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="signup-right">
          <h1 className="signup-title">Create your account</h1>

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="input-group">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            <div className="terms-group">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <label htmlFor="terms">
                I agree to the{" "}
                <span className="terms-link">Terms & Conditions</span>
              </label>
            </div>

            <button type="submit" className="btn-create">
              Create Account
            </button>
          </form>

          {/* Social Login */}
          <div className="social-section">
            <p className="social-text">or sign up using</p>
            <div className="social-buttons">
              <button className="social-btn facebook">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path
                    fill="currentColor"
                    d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z"
                  />
                </svg>
              </button>
              <button className="social-btn google">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <p className="login-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/login", { state: { role } })}>
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
