

// components/Dashboard/Customer/CustomerDashboard.js
import React from "react"; // Import React
import TradeAuthentication from "../../../components/Dashboard/Customer/TradeAuthentication/TradeAuthentication"; // Adjust the path as needed
import Layout from "../../../components/Layout/Layout"; // Adjust the path if necessary

const TradeAuthenticationPage = () => {
  return (
    <Layout> {/* Pass userRole to Layout */}
      <TradeAuthentication /> {/* First instance of CustomerHome */}
    </Layout>
  );
};

export default TradeAuthenticationPage;
