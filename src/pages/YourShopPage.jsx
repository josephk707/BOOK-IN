import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase"; // ✅ make sure path is correct
import "./YourShopPage.css";
import { Link } from "react-router-dom";

const BASE_URL = "http://localhost:5000/api/v1/getshopbyid";

const YourShopPage = () => {
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log(shopData)
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const user = auth.currentUser;

        // Wait until Firebase Auth initializes (user may be null on first render)
        if (!user) {
          console.warn("User not logged in yet");
          return;
        }

        const response = await axios.get(`${BASE_URL}/${user.uid}`);

        setShopData(response.data);
      } catch (error) {
        console.error("❌ Error fetching shop data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Delay until auth is ready
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchShop();
      else setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
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
        <p>
          <strong>📍 Location:</strong> {shopData.location}
        </p>
        <p>
          <strong>🏷️ Category:</strong> {shopData.category}
        </p>
      </div>

      <div className="shop-section">
        <h3>🛠️ Services Offered</h3>
        <ul>
          {shopData.services?.map((srv, idx) => (
            <li key={idx}>
              {srv.serviceName} — {srv.serviceDuration} mins — ₹{srv.servicePrice}
            </li>
          ))}
        </ul>
      </div>

      <div className="shop-section">
        <h3>⏰ Available Time Slots</h3>
        <ul>
          {shopData.timeSlots?.map((slot, idx) => (
            <li key={idx}>
              {slot.date} | {slot.startTime} - {slot.endTime} | {slot.status}
            </li>
          ))}
        </ul>
      </div>
<Link to={"/business-dashboard"}>dashboard</Link>
    </div>
  );
};

export default YourShopPage;
