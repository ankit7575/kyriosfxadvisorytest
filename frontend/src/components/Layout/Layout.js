import React from "react";
import PropTypes from 'prop-types'; // Import PropTypes
import CustomerNavigation from "../Menu/CustomerNavigation"; // Adjust the path as needed
import AdminNavigation from "../Menu/AdminNavigation"; // Adjust the path as needed
import './Layout.css'; // Import CSS for layout styles

const Layout = ({ children, userRole }) => {
  return (
    <div className="layout">
      <aside className="sidebar"> {/* Sidebar for navigation */}
        {userRole === 'admin' ? <AdminNavigation /> : <CustomerNavigation />}
      </aside>
      <main className="main-content"> {/* Use semantic HTML for better accessibility */}
        {children} {/* This is where your page content will be rendered */}
      </main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired, // Validate children as React node
  userRole: PropTypes.string.isRequired, // Validate userRole as a required string
};

export default Layout;
