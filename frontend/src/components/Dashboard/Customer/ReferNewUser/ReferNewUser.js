import React, { useState } from "react";
import PhoneInput from "react-phone-input-2"; // Import PhoneInput
import "react-phone-input-2/lib/style.css"; // Import styles for PhoneInput

const ReferNewUser = () => {
  const [referralData, setReferralData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setReferralData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePhoneChange = (value) => {
    setReferralData((prevData) => ({
      ...prevData,
      phone: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Simulate an API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          Math.random() > 0.2 ? resolve() : reject("Failed to refer new user.");
        }, 1000);
      });

      setSuccess(true); // Show success message
      setReferralData({ name: "", email: "", phone: "" }); // Reset form
    } catch (err) {
      setError(err); // Display error message
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  return (
    <section className="refer-new-user">
      <h1>Refer a New User</h1>

      {/* Display error message */}
      {error && <div className="error">{error}</div>}

      {/* Display success message */}
      {success && <div className="success">Referral submitted successfully!</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={referralData.name}
            onChange={handleChange}
            placeholder="Enter the name"
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={referralData.email}
            onChange={handleChange}
            placeholder="Enter the email"
            required
          />
        </div>
        <div>
          <label htmlFor="phone">Phone Number:</label>
          <PhoneInput
            country={"in"} // Default country set to India
            value={referralData.phone}
            onChange={handlePhoneChange}
            inputStyle={{ width: "100%" }} // Set input width to full
            placeholder="Enter phone number"
            required
          />
        </div>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Refer New User"}
        </button>
      </form>
    </section>
  );
};

export default ReferNewUser;
