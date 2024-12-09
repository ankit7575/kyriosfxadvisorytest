import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, clearErrors } from '../actions/userActions';

const LogoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.user); // Retrieve error from state

  useEffect(() => {
    const handleLogout = async () => {
      await dispatch(logout()); // Trigger the logout action
      navigate('/login'); // Redirect to the login page
    };

    handleLogout();

    // Clear any leftover errors in case of any failed logout attempts
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch, navigate]);

  return (
    <div className="logout-page">
      <h2>Logging Out...</h2>
      <p>Please wait while we log you out.</p>
      {error && <p className="error-message">Logout failed: {error}</p>} {/* Display error if logout fails */}
    </div>
  );
};

export default LogoutPage;
