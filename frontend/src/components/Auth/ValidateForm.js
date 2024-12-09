import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyOtp, clearErrors } from "../../actions/userActions";
import { useNavigate } from "react-router-dom";
import "./Form.css";

const ValidateForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Extract state from the Redux store
  const { loading, error, isAuthenticated } = useSelector((state) => state.user);

  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");

  // Fetch email from sessionStorage on component mount
  useEffect(() => {
    try {
      const storedEmail = sessionStorage.getItem("userEmail");
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        navigate("/signup"); // Redirect to signup if no email is found
      }
    } catch (err) {
      console.error("Error fetching email from sessionStorage:", err);
      navigate("/signup");
    }

    // Clear errors when the component unmounts
    return () => {
      dispatch(clearErrors());
    };
  }, [navigate, dispatch]);

  // Handle input changes
  const handleChange = (e) => {
    setVerificationCode(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      alert("Please enter the verification code.");
      return;
    }

    // Create the payload for verification
    const payload = {
      email,
      otp: verificationCode.trim(),
    };

    // Dispatch the verifyOtp action with navigate
    dispatch(verifyOtp(payload));
  };

  // Redirect to login page after successful OTP verification (if authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/login"); // Redirect to login page if authenticated
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="registration-page">
      <div className="registration-form-box">
        <div className="signup-form-container">
          <form className="validate-form" onSubmit={handleSubmit}>
            <h2>Verify Your Email</h2>
            <p>
              We have sent a verification code to your email: <strong>{email}</strong>
            </p>

            <label htmlFor="verificationCode" className="form-label">
              Verification Code
            </label>
            <input
              type="text"
              id="verificationCode"
              name="verificationCode"
              placeholder="Enter Verification Code"
              value={verificationCode}
              onChange={handleChange}
              required
              aria-describedby="verificationCodeError"
            />

            {/* Display error message if any */}
            {error && (
              <p
                id="verificationCodeError"
                className="error-message"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </p>
            )}

            <button type="submit" className="verify-button" disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>

          {/* Redirect to login page */}
          <div className="login-button-container">
            <button onClick={() => navigate("/login")} className="login-button">
              Already have an account? Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidateForm;
