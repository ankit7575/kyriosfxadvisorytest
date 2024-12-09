import React, { useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { jwtVerify } from "jose";
import { loadUser, logout } from "../actions/userActions"; // Combine imports for actions

const ProtectedRoute = ({ element, requiredRole = [], secretKey }) => {
  const { loading, isAuthenticated, user, registrationSuccess } = useSelector(
    (state) => state.user
  );
  const dispatch = useDispatch();

  // Ref to log user data only once
  const hasLogged = useRef(false);

  // Decode and log user data from token
  const decodeAndLogUserData = useCallback(
    async (token) => {
      try {
        const encodedKey = new TextEncoder().encode(secretKey || "default-secret-key");
        const { payload } = await jwtVerify(token, encodedKey);
        if (!hasLogged.current) {
          console.log("Decoded user data:", payload);
          hasLogged.current = true;
        }
        return payload;
      } catch (error) {
        console.error("Error verifying token:", error);
        // Handle invalid or expired token by logging out
        dispatch(logout()); // Dispatch logout if token is invalid
        return null;
      }
    },
    [secretKey, dispatch] // Ensure proper updates if the secretKey changes
  );

  useEffect(() => {
    if (isAuthenticated && user?.token) {
      decodeAndLogUserData(user.token); // Decode user data only if authenticated
      dispatch(loadUser()); // Automatically load user data after token verification
    }
  }, [isAuthenticated, user?.token, decodeAndLogUserData, dispatch]);

  // Handle loading state
  if (loading) {
    return <div className="loading-spinner">Loading...</div>; // Show loading spinner while loading
  }

  // Handle registration success redirection
  if (registrationSuccess) {
    return <Navigate to="/validate-form" replace />;
  }


  // Handle redirect if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Handle role-based access control
  if (requiredRole.length > 0 && !requiredRole.includes(user?.role)) {
    const redirectPath = user?.role === "admin" ? "/admin/dashboard" : "/";
    return <Navigate to={redirectPath} replace />;
  }

  // Render the protected element if all checks pass
  return element;
};

ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired,
  requiredRole: PropTypes.arrayOf(PropTypes.string),
  secretKey: PropTypes.string,
};

export default ProtectedRoute;
