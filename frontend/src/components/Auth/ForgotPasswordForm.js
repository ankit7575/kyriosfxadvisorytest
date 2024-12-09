// src/pages/Customer/ForgotPassword.js

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../../actions/userActions"; // Ensure this action exists in userActions
import "./Form.css";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.user); // Ensure your reducer handles loading, error, and message

  const [email, setEmail] = useState("");

  // Clear error and message when component re-renders or on form submit
  useEffect(() => {
    if (error || message) {
      const timeout = setTimeout(() => {
        // Reset error and message after 5 seconds (optional)
        dispatch({ type: "CLEAR_ERRORS" });  // Dispatch action to clear error
      }, 5000);
      return () => clearTimeout(timeout);  // Cleanup timeout on unmount
    }
  }, [dispatch, error, message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotPassword(email)); // Trigger forgot password action
  };

  return (
    <div className="forgot-password-container">
      <form className="forgot-password-form" onSubmit={handleSubmit}>
    
        <p className="form-description">
          Enter your email address to receive a password reset link.
        </p>
        
        <label htmlFor="email" className="form-label">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-input"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && (
          <p className="error-message" role="alert" aria-live="assertive">
            {error}
          </p>
        )}
        {message && (
          <p className="success-message" role="alert" aria-live="assertive">
            {message}
          </p>
        )}

        <button type="submit" className="form-button" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
