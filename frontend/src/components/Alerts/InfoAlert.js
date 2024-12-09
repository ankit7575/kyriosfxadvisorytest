import React from "react";
import PropTypes from "prop-types"; // Import PropTypes for prop validation
import "./InfoAlert.css"; // Import a CSS file for custom styling

const InfoAlert = ({ message }) => {
  if (!message) return null; // If no message, don't render the alert

  return (
    <div className="info-alert">
      <div className="alert-content">
        <span className="info-icon" role="img" aria-label="info">
          ℹ️
        </span>
        <span className="info-message">{message}</span>
      </div>
    </div>
  );
};

// Add PropTypes validation for the message prop
InfoAlert.propTypes = {
  message: PropTypes.string, // 'message' should be a string
};

export default InfoAlert;
