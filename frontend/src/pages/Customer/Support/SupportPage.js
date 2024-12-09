// components/Dashboard/Customer/CustomerDashboard.js
import React from "react"; // Import React
import Support from "../../../components/Dashboard/Customer/Support/Support"; // Adjust the path as needed
import Layout from "../../../components/Layout/Layout"; // Adjust the path if necessary

const SupportPage = () => {
  return (
    <Layout> {/* Pass userRole to Layout */}
      <Support /> {/* First instance of CustomerHome */}
    </Layout>
  );
};

export default SupportPage;
