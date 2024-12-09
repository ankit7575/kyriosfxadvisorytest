// components/Dashboard/Customer/CustomerDashboard.js
import React from "react"; // Import React
import AllteamReferral from "../../../components/Dashboard/Customer/TeamInfo/AllteamReferral"; // Adjust the path as needed
import Layout from "../../../components/Layout/Layout"; // Adjust the path if necessary

const AllteamReferralPage = () => {
  return (
    <Layout> {/* Pass userRole to Layout */}
      <AllteamReferral /> {/* First instance of CustomerHome */}
    </Layout>
  );
};

export default AllteamReferralPage;
