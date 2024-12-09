import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUser, updateUserProfile, updateUserPassword } from "../../../../actions/userActions";
import './Profile.css'; // Import the CSS file for styling
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons for eye visibility toggle

const Profile = () => {
  const dispatch = useDispatch();

  // Accessing the user data, loading, and error state from Redux
  const { user, loading, error } = useSelector((state) => state.user);

  // Local state for editing profile and password
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // States for password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch user profile when the component mounts
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission for updating profile (name, phone)
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile({ name: formData.name, phone: formData.phone }));
    setIsEditing(false); // Exit editing mode
  };

  // Handle form submission for updating password
  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      return alert("New password and confirm password do not match");
    }

    dispatch(updateUserPassword(formData.currentPassword, formData.newPassword));
    setFormData((prevData) => ({
      ...prevData,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  // Loading state
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Error state
  if (error) {
    return <p className="error-message">{`Error: ${error}`}</p>;
  }

  // If user is not available
  if (!user) {
    return <p>No user profile data available. Check the Redux state or API response.</p>;
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">
        Welcome, {formData.name || "User"}
      </h1>

      <div className="profile-card">
        {/* Profile Info Section */}
        {isEditing ? (
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone:</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Save Changes</button>
              <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Phone:</strong> {formData.phone}</p>
            <button className="btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
          </div>
        )}

        {/* Password Update Section */}
        <div className="password-update">
          <h2 className="section-title">Update Password</h2>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password:</label>
              <div className="password-field">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                />
                <button type="button" onClick={() => setShowCurrentPassword((prev) => !prev)} className="password-toggle">
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password:</label>
              <div className="password-field">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                />
                <button type="button" onClick={() => setShowNewPassword((prev) => !prev)} className="password-toggle">
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password:</label>
              <div className="password-field">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} className="password-toggle">
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
