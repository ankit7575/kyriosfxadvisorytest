// components/Dashboard/Customer/CustomerDashboard.js
import React from "react"; // Import React
import PayoutRecord from "../../../components/Dashboard/Customer/PayoutRecord/PayoutRecord"; // Adjust the path as needed
import Layout from "../../../components/Layout/Layout"; // Adjust the path if necessary

const PayoutRecordPage = () => {
  return (
    <Layout> {/* Pass userRole to Layout */}
      <PayoutRecord /> {/* First instance of CustomerHome */}
    </Layout>
  );
};

export default PayoutRecordPage;
