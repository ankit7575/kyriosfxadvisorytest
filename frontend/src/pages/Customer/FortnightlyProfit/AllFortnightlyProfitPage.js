// components/Dashboard/Customer/CustomerDashboard.js
import React from "react"; // Import React
import FortnightlyProfit from "../../../components/Dashboard/Customer/FortnightlyProfit/FortnightlyProfit"; // Adjust the path as needed
import Layout from "../../../components/Layout/Layout"; // Adjust the path if necessary

const AllteamReferralPage = () => {
  return (
    <Layout> {/* Pass userRole to Layout */}
      <FortnightlyProfit /> {/* First instance of CustomerHome */}
    </Layout>
  );
};

export default AllteamReferralPage;
