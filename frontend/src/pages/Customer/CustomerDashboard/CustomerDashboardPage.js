// components/Dashboard/Customer/CustomerDashboard.js
import React, { useState, useEffect } from "react"; // Import React
import Layout from "../../../components/Layout/Layout"; // Adjust the path if necessary
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks
import { loadUser } from "../../../actions/userActions"; // Assuming you have an action to load user data
import LoginForm from "../../../components/Auth/LoginForm"; // Assuming you have a LoginForm component
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

const CustomerDashboardPage = () => {
  const [isError, setIsError] = useState(false); // State to track error
  const dispatch = useDispatch(); // Dispatch hook to dispatch actions
  const navigate = useNavigate(); // Hook to handle redirection

  // Function to handle registration redirect
  const handleRegistrationRedirect = () => {
    navigate("/"); // Redirect to the registration page
  };

  // Function to handle forgot password redirect
  const handleForgotPasswordRedirect = () => {
    navigate("/forgot-password"); // Redirect to the forgot password page
  };

  // Accessing the user data, loading, and error state from Redux
  const { user, loading, error } = useSelector((state) => state.user);

  // Fetch user profile when the component mounts
  useEffect(() => {
    console.log("Dispatching loadUser action...");
    dispatch(loadUser()); // Dispatch the action to load user data
  }, [dispatch]);

  // Check if there is an error when loading user
  useEffect(() => {
    if (error) {
      console.error("Error loading user:", error); // Log the error
      setIsError(true); // Set error state to true
    }
  }, [error]);

  // Loading state
  if (loading) {
    return <p>Loading...</p>; // Display loading text while fetching user data
  }

  // If there is an error (e.g. inactive account), show the login form with redirection option
  if (isError || error) {
    return (
      <div className="registration-page">
        <div className="registration-form-box">
          <h1>Log In</h1>

          {/* Error message for inactive or other errors */}
          <p className="error-message">
            Your account is inactive . Please log in.
          </p>

          {/* Login form component */}
          <LoginForm onRegister={handleRegistrationRedirect} />

          {/* Button to redirect to forgot password */}
          <div className="forgot-password-container pt-2">
            <button 
              onClick={handleForgotPasswordRedirect} 
              className="forgot-password-button"
              aria-label="Redirect to forgot password page"
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is not available, display this message
  if (!user) {
    return <p>No user profile data available. Check the Redux state or API response.</p>;
  }

  return (
    <Layout> {/* Pass userRole to Layout */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            {/* <Profile /> */}
            <div className="registration-page">
      <div className="registration-form-box">
        <h1>Your ID will be Activated Tomorrow</h1>
       
      </div>
    </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerDashboardPage;
