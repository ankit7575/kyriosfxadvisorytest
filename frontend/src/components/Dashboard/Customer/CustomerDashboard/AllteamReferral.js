import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { viewReferralData } from '../../../../actions/fundsAction';  // Import the action

const AllTeamReferral = () => {
  const dispatch = useDispatch();

  // Access state from Redux
  const { referralData, referralDataLoading, error } = useSelector((state) => state.fund);

  const [filteredReferrals, setFilteredReferrals] = useState([]);
  const [selectedStage, setSelectedStage] = useState('All');

  // Dispatch the action to fetch referral data on component mount
  useEffect(() => {
    dispatch(viewReferralData());
  }, [dispatch]);

  // When referral data changes, update filtered referrals
  useEffect(() => {
    if (referralData && referralData.length > 0) {
      setFilteredReferrals(referralData);  // Initially showing all referrals
    }
  }, [referralData]);

  // Handle the click event on category buttons (stages)
  const handleCategoryClick = (stage) => {
    setSelectedStage(stage);
    if (stage === 'All') {
      setFilteredReferrals(referralData); // Show all referrals
    } else {
      const filtered = referralData.filter(referral => referral.referralStage === stage);
      setFilteredReferrals(filtered);
    }
  };

  // Get the appropriate CSS class based on the referral status
  const getStatusClass = (status) => {
    if (status === "hold") {
      return "status-hold"; // Custom class for "hold" status
    }
    return "status-active"; // Default class for active status
  };

  // Handle loading and error states at the end
  if (referralDataLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="table-container">
      <h2>All Team Referral</h2>

      {/* Category Buttons */}
      <div className="category-buttons">
        <button
          className={`category-btn ${selectedStage === 'All' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('All')}
        >
          All
        </button>
        <button
          className={`category-btn ${selectedStage === 'directReferral' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('directReferral')}
        >
          Direct Referral
        </button>
        <button
          className={`category-btn ${selectedStage === 'stage2Referral' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('stage2Referral')}
        >
          Stage 2 Referral
        </button>
        <button
          className={`category-btn ${selectedStage === 'stage3Referral' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('stage3Referral')}
        >
          Stage 3 Referral
        </button>
      </div>

      {/* Referral Data Table */}
      <table className="referral-table">
        <thead>
          <tr>
            <th>#</th> {/* Added column for sequential number */}
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Status</th>
            <th>Role</th>
            <th>Referral Stage</th>
          </tr>
        </thead>
        <tbody>
          {filteredReferrals && filteredReferrals.length > 0 ? (
            filteredReferrals.map((referral, index) => (
              <tr key={referral.userId} className={getStatusClass(referral.status)}>
                {/* Sequential Numbering */}
                <td>{index + 1}</td> {/* This will display 1, 2, 3, etc. */}
                <td>{referral.name}</td>
                <td>{referral.phone}</td>
                <td>{referral.email}</td>
                <td>
                  <span className={`status-text ${referral.status === "hold" ? "hold" : "active"}`}>
                    {typeof referral.status === 'string' ? referral.status : 'Unknown'}
                  </span>
                  {referral.status === "hold" && (
                    <div className="tooltip">
                      Cannot pay fortnightly profit due to hold status.
                    </div>
                  )}
                </td>
                <td>{referral.role}</td>
                <td>{referral.referralStage}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No referrals found.</td> {/* Adjusted colSpan to include new column */}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AllTeamReferral;
