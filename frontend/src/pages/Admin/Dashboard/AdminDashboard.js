import React from "react";
import Layout from "../../../components/Layout/Layout"; // Adjust path if needed
import '../../../styles/global.css'; // Import CSS for additional styling if needed
import Homeprofile from "../../../components/Dashboard/Admin/AdminDashboard"

const AdminDashboard = () => {

  return (
    <Layout userRole="admin"> {/* Specify the user role to render AdminNavigation */}
   <Homeprofile/>
    </Layout>
  );
};

export default AdminDashboard;
