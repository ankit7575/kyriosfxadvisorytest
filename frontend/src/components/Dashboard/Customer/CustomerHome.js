import React, { useEffect } from "react"; // Import React and hooks
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks
import { loadUser } from "../../../actions/userActions"; // Assuming you have an action to load user data
import './CustomerHome.css';

const CustomerHome = () => {
  const dispatch = useDispatch(); // Dispatch hook to dispatch actions

  // Accessing the user data, loading, and error state from Redux
  const { user, loading, error } = useSelector((state) => state.user);

  // Fetch user profile when the component mounts
  useEffect(() => {
    console.log("Dispatching loadUser action...");
    dispatch(loadUser()); // Dispatch the action to load user data
  }, [dispatch]);

  // Debugging state - Log out the Redux state
  useEffect(() => {
    console.log("Current Redux state:", user); // Log the user profile to see what is available
    console.log("Loading state:", loading);  // Check if it's loading
    console.log("Error state:", error);  // Check for any error messages
  }, [user, loading, error]);

  // Loading state
  if (loading) {
    return <p>Loading...</p>; // Display loading text while fetching user data
  }

  // Error state
  if (error) {
    return <p className="error-message">{`Error: ${error}`}</p>; // Display error if fetching data fails
  }

  // If user is not available, display this message
  if (!user) {
    return <p>No user profile data available. Check the Redux state or API response.</p>;
  }

  return (
    <div className="customer-dashboard">
      <h1 className="dashboard-title">
        Welcome, {user?.name || "User"} {/* Fallback in case name is missing */}
      </h1>

      {/* User profile details */}
      <div className="user-details card">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Phone:</strong> {user?.phone}</p>
        <p><strong>Referral ID:</strong> {user?.referralId}</p>
        <p><strong>Capital:</strong> ${user?.capital}</p>
        <p><strong>Fortnightly Profit:</strong> ${user?.fortnightlyProfit}</p>
        <p><strong>Company Profit Due Status:</strong> {user?.companyProfitDueStatus}</p>
        <p><strong>Referral Request Status:</strong> {user?.referRequestStatus}</p>
        <p><strong>Account Status:</strong> {user?.accountStatus}</p>
      </div>
    </div>
  );
};

export default CustomerHome;
