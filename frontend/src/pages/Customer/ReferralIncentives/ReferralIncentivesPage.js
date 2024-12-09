// components/Dashboard/Customer/CustomerDashboard.js
import React from "react"; // Import React
import ReferralIncentives from "../../../components/Dashboard/Customer/ReferralIncentives/ReferralIncentives"; // Adjust the path as needed
import Layout from "../../../components/Layout/Layout"; // Adjust the path if necessary

const ReferralIncentivesPage = () => {
  return (
    <Layout> {/* Pass userRole to Layout */}
      <ReferralIncentives /> {/* First instance of CustomerHome */}
    </Layout>
  );
};

export default ReferralIncentivesPage;
