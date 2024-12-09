import React, { useState, useEffect, useCallback } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearErrors, register } from "../../actions/userActions";
import TermsModal from "../Modals/TermsModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types"; // Importing PropTypes
import "./Form.css";

const SignUpForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    referralId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Clear errors after timeout or on unmount
  useEffect(() => {
    if (error) {
      const errorTimeout = setTimeout(() => dispatch(clearErrors()), 3000);
      return () => clearTimeout(errorTimeout);
    }
  }, [error, dispatch]);

  // Redirect after successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.setItem("userEmail", formData.email); // Save email to session storage
      navigate("/validate-form"); // Redirect to /validate-form
    }
  }, [isAuthenticated, formData.email, navigate]);

  const updateFormData = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData(name, value);
  };

  const handlePhoneChange = (value) => updateFormData("phone", value || "");

  const validateForm = () => {
    const { email, password, phone, name } = formData;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) return "Name is required.";
    if (!emailPattern.test(email)) return "Invalid email format.";
    if (password.length < 6) return "Password should be at least 6 characters.";
    if (!phone || phone.length < 10) return "Please enter a valid phone number.";

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
    } else {
      setShowTermsModal(true);
    }
  };

  const handleTermsAccept = async () => {
    setShowTermsModal(false);
    try {
      await dispatch(register(formData)); // Dispatch register action
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const handleTermsDecline = () => {
    setShowTermsModal(false);
    alert("You must accept the terms and conditions to proceed.");
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className="signup-form-container">
      <form className="signup-form" onSubmit={handleSubmit} noValidate>
        <InputField
          label="Name"
          id="name"
          name="name"
          value={formData.name}
          placeholder="Name"
          onChange={handleChange}
          required
        />
        <label htmlFor="phone" className="form-label">
          Phone
        </label>
        <PhoneInput
          country="in"
          value={formData.phone}
          onChange={handlePhoneChange}
          inputStyle={{ width: "100%" }}
          id="phone"
          required
        />
        <InputField
          label="Email"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <PasswordField
          label="Password"
          id="password"
          name="password"
          value={formData.password}
          placeholder="Enter your password"
          showPassword={showPassword}
          toggleVisibility={togglePasswordVisibility}
          onChange={handleChange}
          required
        />
        <InputField
          label="Referral ID (optional)"
          id="referralId"
          name="referralId"
          value={formData.referralId}
          placeholder="Referral ID (optional)"
          onChange={handleChange}
        />
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="signup-button" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
      <button onClick={() => navigate("/login")} className="login-button">
        Already have an account? Log In
      </button>
      <TermsModal
        show={showTermsModal}
        onClose={handleTermsDecline}
        onAccept={handleTermsAccept}
      />
    </div>
  );
};

const InputField = ({
  label,
  id,
  name,
  type = "text",
  value,
  placeholder,
  onChange,
  required,
}) => (
  <>
    <label htmlFor={id} className="form-label">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      required={required}
    />
  </>
);

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
};

const PasswordField = ({
  label,
  id,
  name,
  value,
  placeholder,
  showPassword,
  toggleVisibility,
  onChange,
  required,
}) => (
  <>
    <label htmlFor={id} className="form-label">
      {label}
    </label>
    <div className="password-container">
      <input
        type={showPassword ? "text" : "password"}
        id={id}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
      />
      <span
        className="toggle-password"
        onClick={toggleVisibility}
        role="button"
        tabIndex="0"
        aria-label="Toggle password visibility"
      >
        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
      </span>
    </div>
  </>
);

PasswordField.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  showPassword: PropTypes.bool.isRequired,
  toggleVisibility: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
};

export default SignUpForm;
