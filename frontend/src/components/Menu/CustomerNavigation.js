import React, { useState, useEffect } from "react"; // Import React and hooks
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks
import { useLocation, Link } from "react-router-dom"; // Import missing hooks from react-router-dom
import { loadUser } from "../../actions/userActions"; // Assuming you have an action to load user data
import "./Navigation.css";
import logo from "../assets/img/logo.png";

function CustomerNavigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isError, setIsError] = useState(false); // State to track error

  const dispatch = useDispatch(); // Dispatch hook to dispatch actions

  // Accessing the user data, loading, and error state from Redux
  const { user, loading, error } = useSelector((state) => state.user);

  // Fetch user profile when the component mounts
  useEffect(() => {
    console.log("Dispatching loadUser action...");
    dispatch(loadUser()); // Dispatch the action to load user data
  }, [dispatch]);

  // Check if there is an error when loading user
  useEffect(() => {
    if (error) {
      console.error("Error loading user:", error); // Log the error
      setIsError(true); // Set error state to true
    }
  }, [error]);

  // Loading state
  if (loading) {
    return <p>Loading...</p>; // Display loading text while fetching user data
  }

  // If an error occurs, show logout button
  if (isError || error) {
    return (
      <div>
        <p className="error-message">{`Error: ${error || "Failed to load user"}`}</p>
        <Link to="/logout" className="logout-button">Logout</Link> {/* Show logout button */}
        <li>
            <Link className={`menu-item ${location.pathname === "/logout" ? "active" : ""}`} to="/logout">Logout</Link>
          </li>
      </div>
    );
  }

  // If user is not available, display this message
  if (!user) {
    return <p>No user profile data available. Check the Redux state or API response.</p>;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <>
      <nav className="navbar">
        <div className="menu-toggle" onClick={toggleMobileMenu}>
          <span className={`bar ${isMobileMenuOpen ? "open" : ""}`}></span>
          <span className={`bar ${isMobileMenuOpen ? "open" : ""}`}></span>
          <span className={`bar ${isMobileMenuOpen ? "open" : ""}`}></span>
        </div>
        <ul className={`menu ${isMobileMenuOpen ? "open" : ""}`}>
          <li>
            <img src={logo} alt="Company Logo" className="logo" />
          </li>
          {/* <li>
            <Link className={`menu-item ${location.pathname === "/" ? "active" : ""}`} to="/">Dashboard</Link>
          </li>
          <li>
            <Link className={`menu-item ${location.pathname === "/refer-new-user" ? "active" : ""}`} to="/refer-new-user">Refer a New User</Link>
          </li>
          <li>
            <Link className={`menu-item ${location.pathname === "/all-team-referral" ? "active" : ""}`} to="/all-team-referral">All Team Referral</Link>
          </li>
          <li>
            <Link className={`menu-item ${location.pathname === "/all-fortnightly-profit" ? "active" : ""}`} to="/all-fortnightly-profit">All Fortnightly Profit</Link>
          </li>
          <li>
            <Link className={`menu-item ${location.pathname === "/all-referral-incentives" ? "active" : ""}`} to="/all-referral-incentives">All Referral Incentives</Link>
          </li>
          <li>
            <Link className={`menu-item ${location.pathname === "/trade-authentication" ? "active" : ""}`} to="/trade-authentication">Trade Authentication</Link>
          </li>
          <li>
            <Link className={`menu-item ${location.pathname === "/profile" ? "active" : ""}`} to="/profile">My Profile</Link>
          </li>
          <li>
            <Link className={`menu-item ${location.pathname === "/payout-records" ? "active" : ""}`} to="/payout-records">Payout Records</Link>
          </li>
          <li>
            <Link className={`menu-item ${location.pathname === "/support" ? "active" : ""}`} to="/support">Support</Link>
          </li> */}
          <li>
            <Link className={`menu-item ${location.pathname === "/logout" ? "active" : ""}`} to="/logout">Logout</Link>
          </li>
        </ul>
      </nav>
      <div className="container">
        <div className="referral-number">REF Number: {user?.referralId}</div>
      </div>
    </>
  );
}

export default CustomerNavigation;
