import React from "react";
import PropTypes from "prop-types"; // Import PropTypes for prop validation
import "./SuccessAlert.css"; // Import a CSS file for custom styling

const SuccessAlert = ({ message }) => {
  if (!message) return null; // If no success message, do not render the alert

  return (
    <div className="success-alert" role="alert">
      <div className="alert-content">
        <span className="success-icon" role="img" aria-label="success">
          ✅
        </span>
        <span className="success-message">{message}</span>
      </div>
    </div>
  );
};

// Add PropTypes validation for the message prop
SuccessAlert.propTypes = {
  message: PropTypes.string, // 'message' should be a string
};

export default SuccessAlert;
