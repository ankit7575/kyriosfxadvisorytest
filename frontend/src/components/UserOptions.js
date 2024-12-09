import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../actions/userActions";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { loadUser } from "../actions/userActions"; // Import loadUser action

const UserOptions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector((state) => state.user);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Toggle the dropdown state
  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

  // Handle logout
  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action
    navigate("/login"); // Redirect to the login page after logout
  };

  // Determine the appropriate dashboard link based on the user's role
  const getDashboardLink = () => {
    if (user?.role === "admin") return "/admin/dashboard";
    if (["referral", "trader"].includes(user?.role)) return "/";
    return null; // No dashboard link for other roles
  };

  const dashboardLink = getDashboardLink(); // Store the calculated link

  // Redirect if the user is not authenticated or not verified
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login"); // Redirect to the login page if not authenticated
    } else if (user?.emailVerified === false) {
      navigate("/validate-form"); // Redirect to the email verification page if not verified
    } else {
      dispatch(loadUser()); // Automatically load user data after authentication
    }
  }, [isAuthenticated, user?.emailVerified, navigate, dispatch]);

  // Conditionally render the user options menu
  return (
    <div className="user-options">
      <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
        <DropdownToggle caret>
          {user?.name || "User"} {/* Display user's name or fallback */}
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Account</DropdownItem>
          <DropdownItem>
            <Link to="/profile" className="dropdown-link">
              Profile
            </Link>
          </DropdownItem>

          {/* Conditionally render the dashboard link */}
          {dashboardLink && (
            <DropdownItem>
              <Link to={dashboardLink} className="dropdown-link">
                Dashboard
              </Link>
            </DropdownItem>
          )}

          {/* Conditionally render the verify email link if the user is not verified */}
          {user?.emailVerified === false && (
            <DropdownItem>
              <Link to="/validate-form" className="dropdown-link">
                Verify Email
              </Link>
            </DropdownItem>
          )}

          <DropdownItem divider />
          <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default UserOptions;
