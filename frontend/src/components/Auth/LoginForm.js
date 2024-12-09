import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../actions/userActions";
import { useNavigate } from "react-router-dom";
import "./Form.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector((state) => state.user);

  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Effect to handle authentication and error state
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); // Redirect to the validate form if authenticated
    }

  }, [dispatch, error, isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      // Prevent submission with empty fields
      return;
    }

    dispatch(login(loginEmail, loginPassword));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="login-form-container">
      <form className="login-form" onSubmit={handleSubmit}>
      

        {/* Email Field */}
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          aria-label="Email"
          className="form-input"
          placeholder="Enter your email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          required
        />

        {/* Password Field */}
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            aria-label="Password"
            className="form-input password-input"
            placeholder="Enter your password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
          />
          <span
            className="toggle-password"
            onClick={togglePasswordVisibility}
            role="button"
            aria-label="Toggle password visibility"
            tabIndex="0"
            onKeyPress={(e) => e.key === "Enter" && togglePasswordVisibility()} // Accessibility support
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size="lg" />
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <p className="error-message" role="alert" aria-live="assertive">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="login-button"
          disabled={loading || !loginEmail || !loginPassword} // Disable when fields are empty or loading
        >
          {loading ? "Logging In..." : "Log In"}
        </button>

        {/* Register Link */}
        <button
          type="button"
          className="register-button"
          onClick={() => navigate("/signup")}
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
