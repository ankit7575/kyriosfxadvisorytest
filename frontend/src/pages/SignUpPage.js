import React, { useState } from "react";
import { useDispatch } from "react-redux"; // Import useDispatch
import SignUpAndVerifyForm from "../components/Auth/SignUpForm";
import TermsModal from "../components/Modals/TermsModal";
import { register } from "../actions/userActions"; // Import register action
import '../styles/global.css';

const SignUpPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(null); // Form data state
  const [loading, setLoading] = useState(false); // Loading state for registration
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const dispatch = useDispatch(); // Initialize dispatch

  // Handles form submission from SignUpAndVerifyForm
  const handleRegistration = (data) => {
    setFormData(data);
    setShowModal(true); // Show modal to accept terms
  };

  // Handles terms acceptance and dispatches registration action
  const handleTermsAccept = async () => {
    if (!formData) return; // Ensure formData exists before proceeding
  
    setLoading(true); // Set loading state to true while registering
    setErrorMessage(""); // Clear any previous error message
  
    try {
      await dispatch(register(formData)); // Dispatch register action with formData
      // Registration successful, you can handle any follow-up actions here (e.g., showing a success message)
      // Redirect is removed, so no automatic navigation happens here
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Registration failed. Please try again."); // Set error message if registration fails
    } finally {
      setLoading(false); // Reset loading state after completion
    }
  };

  // Handles terms decline (closes modal)
  const handleTermsDecline = () => {
    setShowModal(false); // Close the modal if the user declines
    setErrorMessage("You must accept the terms and conditions to proceed.");
  };

  return (
    <div className="registration-page">
      <div className="registration-form-box">
        <h1>Create Your Account</h1>
        {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Display error message */}
        
        {/* Pass handleRegistration to child form component */}
        <SignUpAndVerifyForm onSubmit={handleRegistration} />

        {/* Terms Modal */}
        <TermsModal 
          show={showModal} 
          onClose={handleTermsDecline} 
          onAccept={handleTermsAccept} 
        />

        {loading && <p>Registering, please wait...</p>} {/* Show loading state */}
      </div>
    </div>
  );
};

export default SignUpPage;
