import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, User, Lock, ShieldCheck } from "lucide-react";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || "customer";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) return alert("Please enter your email");
    if (!password) return alert("Please enter your password");
    if (password.length < 6)
      return alert("Password must be at least 6 characters");

    if (role === "business") navigate("/business-dashboard");
    else navigate("/customer-dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Animated Section */}
        <div className="login-left">
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

        {/* Right Section */}
        <div className="login-right">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">
            Welcome back! Please sign in to continue.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className={`input-group ${email ? "filled" : ""}`}>
              <span className="input-icon">
                <User size={18} />
              </span>
              <label>Email or Username</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className={`input-group ${password ? "filled" : ""}`}>
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <label>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Options */}
            <div className="options-row">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <span className="forgot-link">Forgot password?</span>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-login">
              Sign In
            </button>
          </form>

          <p className="signup-text">
            Don’t have an account?{" "}
            <span
              className="signup-link"
              onClick={() => navigate("/signup", { state: { role } })}
            >
              Create Account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
