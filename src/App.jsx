import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import BusinessDashboard from "./BusinessDashboard";
import CustomerDashboard from "./CustomerDashboard";
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ import this
import YourShopPage from "./pages/YourShopPage";
import RequireAuth from "./auth/RequireAuth";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />


        <Route
          path="/business-dashboard"
          element={
            <RequireAuth>
              <BusinessDashboard />
            </RequireAuth>


          }
        />

        <Route
          path="/your-shop"
          element={
            <RequireAuth>
              {<YourShopPage />}
            </RequireAuth>


          }
        />



        <Route
          path="/customer-dashboard"
          element={
            <RequireAuth>
              <CustomerDashboard />
            </RequireAuth>


          }
        />
      </Routes>
    </Router>
  );
}

export default App;
