// components/Dashboard/Customer/CustomerDashboard.js
import React from "react"; // Import React
import Profile from "../../../components/Dashboard/Customer/Profile/Profile"; // Adjust the path as needed
import Layout from "../../../components/Layout/Layout"; // Adjust the path if necessary

const ProfilePage = () => {
  return (
    <Layout> {/* Pass userRole to Layout */}
      <Profile /> {/* First instance of CustomerHome */}
    </Layout>
  );
};

export default ProfilePage;
