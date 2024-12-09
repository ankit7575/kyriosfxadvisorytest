import React from "react";
import Layout from "../../../components/Layout/Layout"; // Adjust path if needed
import ReferNewUser from "../../../components/Dashboard/Customer/ReferNewUser/ReferNewUser"

const ReferNewUserPage = () => {
  return (
    <Layout> {/* Pass userRole to Layout */}
      <ReferNewUser /> {/* First instance of CustomerHome */}
    </Layout>
  );
};

export default ReferNewUserPage;
