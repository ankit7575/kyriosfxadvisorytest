import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";

// Import components
import ProtectedRoute from "./components/ProtectedRoute";
import UserOptions from "./components/UserOptions";

// Authentication pages
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import SignUpAndVerifyForm from "./pages/SignUpPage";
import ValidateForm from "./components/Auth/ValidateForm";
import ResetPasswordPage from "./pages/ResetPassword";
import LogoutPage from "./pages/Logoutpage";
import LoginPage from "./pages/LoginPage";

// Customer dashboard pages
import CustomerDashboardPage from "./pages/Customer/CustomerDashboard/CustomerDashboardPage";
import AllteamReferralPage from "./pages/Customer/TeamInfo/AllteamReferralPage";
import AllFortnightlyProfitPage from "./pages/Customer/FortnightlyProfit/AllFortnightlyProfitPage";
import AllReferralIncentivesPage from "./pages/Customer/ReferralIncentives/ReferralIncentivesPage";
import TradeAuthenticationPage from "./pages/Customer/TradeAuthentication/TradeAuthenticationPage";
import ReferNewUserPage from "./pages/Customer/ReferNewUser/ReferNewUserPage";
import ProfilePage from "./pages/Customer/Profile/ProfilePage";
import SupportPage from "./pages/Customer/Support/SupportPage";
import PayoutRecordPage from "./pages/Customer/PayoutRecord/PayoutRecordPage";

// Admin dashboard pages
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";

// 404 Not Found page
import NotFoundPage from "./pages/NotFoundPage";

// Redux store and actions
import store from "./store/store";
import { loadUser } from "./actions/userActions";

const App = () => {
  const { isAuthenticated, user } = useSelector((state) => state.user);

  useEffect(() => {
    // Load user data when the app initializes
    store.dispatch(loadUser());
  }, []);

  return (
    <Router>
      {/* Show UserOptions only when user is authenticated */}
      {isAuthenticated && user && <UserOptions user={user} />}

      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<SignUpAndVerifyForm />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/validate-form" element={<ValidateForm />} />
        <Route path="/password/reset/:token" element={<ResetPasswordPage />} />
        <Route path="/logout" element={<LogoutPage />} />

        {/* Customer Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute requiredRole={["referral", "trader"]} element={<CustomerDashboardPage />} />
          }
        />
        
        <Route
          path="/all-team-referral"
          element={
            <ProtectedRoute requiredRole={["referral", "trader"]} element={<AllteamReferralPage />} />
          }
        />
        <Route
          path="/all-fortnightly-profit"
          element={
            <ProtectedRoute requiredRole={["referral", "trader"]} element={<AllFortnightlyProfitPage />} />
          }
        />
        <Route
          path="/all-referral-incentives"
          element={
            <ProtectedRoute requiredRole={["referral", "trader"]} element={<AllReferralIncentivesPage />} />
          }
        />
        <Route
          path="/trade-authentication"
          element={
            <ProtectedRoute requiredRole={["referral", "trader"]} element={<TradeAuthenticationPage />} />
          }
        />
        <Route
          path="/refer-new-user"
          element={
            <ProtectedRoute requiredRole={["referral", "trader"]} element={<ReferNewUserPage />} />
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requiredRole={["referral", "trader"]} element={<ProfilePage />} />
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute requiredRole={["referral", "trader"]} element={<SupportPage />} />
          }
        />
        <Route
          path="/payout-records"
          element={
            <ProtectedRoute requiredRole={["referral", "trader"]} element={<PayoutRecordPage />} />
          }
        />

        {/* Admin Protected Routes */}
        {[
          "/admin/dashboard",
          "/admin/all-trade-authentication",
          "/admin/all-team-referral",
          "/admin/all-fortnightly-profit",
          "/admin/all-referral-incentives",
          "/admin/payout-records",
          "/admin/all-support-requests",
          "/admin/profile",
        ].map((path) => (
          <Route
            key={path}
            path={path}
            element={<ProtectedRoute requiredRole={["admin"]} element={<AdminDashboard />} />}
          />
        ))}

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
