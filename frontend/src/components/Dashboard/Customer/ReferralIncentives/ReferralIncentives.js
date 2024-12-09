import React, { useState, useEffect } from 'react';

const demoData = {
  success: true,
  incentiveData: {
    referralIncentives: {
      "directReferral": [
        {
          "user": "67433cb25ec2bf0553a957e5",
          "name": "ankit",
          "history": [
            {
              "fortnightlyProfitIncentive": [
                {
                  "date": { "$date": "2024-11-24T14:48:49.514Z" },
                  "fortnightlyProfit": 100,
                  "directIncentive": 15,
                  "_id": { "$oid": "67433cd15ec2bf0553a957f4" }
                }
              ]
            },
            {
              "fortnightlyProfitIncentive": [
                {
                  "date": { "$date": "2024-11-24T14:52:53.243Z" },
                  "fortnightlyProfit": 100,
                  "directIncentive": 15,
                  "_id": { "$oid": "67433dc55ec2bf0553a95804" }
                }
              ]
            }
          ]
        },
        {
          "user": "67433cb25ec2bf0553a57875",
          "name": "rohit",
          "history": [
            {
              "fortnightlyProfitIncentive": [
                {
                  "date": { "$date": "2024-11-24T14:48:49.514Z" },
                  "fortnightlyProfit": 100,
                  "directIncentive": 15,
                  "_id": { "$oid": "67433cd15ec2bf0553a957f4" }
                }
              ]
            },
            {
              "fortnightlyProfitIncentive": [
                {
                  "date": { "$date": "2024-11-24T14:52:53.243Z" },
                  "fortnightlyProfit": 100,
                  "directIncentive": 15,
                  "_id": { "$oid": "67433dc55ec2bf0553a95804" }
                }
              ]
            }
          ]
        }
      ],
      "stage2Referral": [
        {
          "user": "674253255ec2bf0553a957e5",
          "name": "happy",
          "history": [
            {
              "fortnightlyProfitIncentive": [
                {
                  "date": { "$date": "2024-11-24T14:48:49.514Z" },
                  "fortnightlyProfit": 100,
                  "directIncentive": 15,
                  "_id": { "$oid": "67433cd15ec2bf0553a957f4" }
                }
              ]
            }
          ]
        }
      ],
      "stage3Referral": [
        {
          "user": "67433c57587c2bf0553a957e5",
          "name": "rampal",
          "history": [
            {
              "fortnightlyProfitIncentive": [
                {
                  "date": { "$date": "2024-11-24T14:48:49.514Z" },
                  "fortnightlyProfit": 100,
                  "directIncentive": 15,
                  "_id": { "$oid": "67433cd15ec2bf0553a957f4" }
                }
              ]
            }
          ]
        }
      ]
    }
  }
};

const ReferralIncentives = () => {
  const [referrals, setReferrals] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All Referral Incentives");

  useEffect(() => {
    if (demoData.success) {
      const directReferrals = demoData.incentiveData.referralIncentives.directReferral.map((ref) => ({
        ...ref,
        category: "Direct",
      }));

      const stage2Referrals = demoData.incentiveData.referralIncentives.stage2Referral.map((ref) => ({
        ...ref,
        category: "Stage 2",
      }));

      const stage3Referrals = demoData.incentiveData.referralIncentives.stage3Referral.map((ref) => ({
        ...ref,
        category: "Stage 3",
      }));

      const allReferrals = [...directReferrals, ...stage2Referrals, ...stage3Referrals].map((referral) => ({
        ...referral,
        status: "Active",
        latest: referral.history
          .map((entry) => entry.fortnightlyProfitIncentive)
          .flat()
          .sort((a, b) => new Date(b.date.$date) - new Date(a.date.$date))[0], // Get the latest history
        history: referral.history.map((entry) =>
          entry.fortnightlyProfitIncentive.map((item) => ({
            date: new Date(item.date.$date).toLocaleDateString(),
            profit: item.fortnightlyProfit,
            incentive: item.directIncentive,
          }))
        ).flat(),
      }));

      setReferrals(allReferrals);
    }
  }, []);

  const toggleRow = (index) => {
    setExpandedRows((prev) =>
      prev.includes(index)
        ? prev.filter((row) => row !== index)
        : [...prev, index]
    );
  };

  const filteredReferrals =
    filterCategory === "All Referral Incentives"
      ? referrals
      : referrals.filter((ref) => ref.category === filterCategory);

  return (
    <div className="table-container">
      <h2>Referral Incentives</h2>

      {/* Category Buttons */}
      <div className="category-buttons">
        {["All Referral Incentives", "Direct", "Stage 2", "Stage 3"].map((category) => (
          <button
            key={category}
            className={`category-button ${
              filterCategory === category ? "active" : ""
            }`}
            onClick={() => setFilterCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Table */}
      <table className="referral-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Status</th>
            <th>Date</th>
            <th>Fortnightly Profit</th>
            <th>Incentive</th>
          </tr>
        </thead>
        <tbody>
          {filteredReferrals.map((referral, index) => (
            <>
              {/* Main Row */}
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{referral.name}</td>
                <td>{referral.status}</td>
                <td>{new Date(referral.latest.date.$date).toLocaleDateString()}</td>
                <td>{referral.latest.fortnightlyProfit}</td>
                <td>{referral.latest.directIncentive}</td>
                <td>
                  <button
                    className="dropdown-arrow"
                    onClick={() => toggleRow(index)}
                  >
                    {expandedRows.includes(index) ? "▼" : "▶"}
                  </button>
                </td>
              </tr>

              {/* Expanded Row */}
              {expandedRows.includes(index) && (
                <tr>
                  <td colSpan={6}>
                    <table className="history-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Date</th>
                          <th>Fortnightly Profit</th>
                          <th>Incentive</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referral.history.map((item, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{item.date}</td>
                            <td>{item.profit}</td>
                            <td>{item.incentive}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReferralIncentives;

