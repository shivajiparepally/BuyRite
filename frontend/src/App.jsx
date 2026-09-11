import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Account from "./pages/Account.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminPromotions from "./pages/admin/AdminPromotions.jsx";
import AdminHours from "./pages/admin/AdminHours.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { AgeGate } from "./components/AgeGate.jsx";

export default function App() {
  return (
    <AgeGate>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOrders />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route path="hours" element={<AdminHours />} />
        </Route>
      </Routes>
    </AgeGate>
  );
}
