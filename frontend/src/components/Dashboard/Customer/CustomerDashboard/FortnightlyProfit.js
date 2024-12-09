import React, { useEffect, useState } from 'react';
import './FortnightlyProfit.css';  // Importing CSS for styling

// Mock data (you might be fetching this from an API)
const demoData = {
  success: true,
  message: "Fortnightly profit data fetched successfully.",
  fortnightlyProfitData: [
    {
      profitEntryId: "dd3f39af-a998-4dd5-8eba-6aa9c35cee2a",
      date: "2024-11-26T02:49:37.479Z",
      fortnightlyProfit: 550,
      status: 'due', // Added status to indicate payment due
    },
    {
      profitEntryId: "89034be5-7fc9-4800-b3e8-aff969b7c496",
      date: "2024-11-26T03:12:45.857Z",
      fortnightlyProfit: 500,
      status: 'paid', // Status showing payment completed
    },
    {
      profitEntryId: "06668150-f5b4-44e9-9364-4d8802c8605c",
      date: "2024-11-26T03:12:50.591Z",
      fortnightlyProfit: 5500,
      status: 'paid', // Status showing payment completed
    },
  ],
};

const FortnightlyProfit = () => {
  const [fortnightlyProfitData, setFortnightlyProfitData] = useState([]);

  // Fetching data on component mount
  useEffect(() => {
    if (demoData.success) {
      setFortnightlyProfitData(demoData.fortnightlyProfitData);
    }
  }, []);

  // Helper function to get the status class for conditional styling
  const getStatusClass = (status) => {
    return status === 'due' ? 'due-payment' : 'paid-payment';
  };

  // Calculate total profit
  const totalProfit = fortnightlyProfitData.reduce((total, data) => total + data.fortnightlyProfit, 0);

  return (
    <div className="table-container">
      <h2>Fortnightly Profit Data</h2>

      {/* Displaying Total Profit */}
      <div className="total-profit">
        <strong>Total Company Profit: </strong> {totalProfit}
      </div>

      {/* Table displaying fortnightly profit data */}
      <table className="referral-table">
        <thead>
          <tr>
            <th>Profit Entry ID</th>
            <th>Date</th>
            <th>Fortnightly Profit</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {fortnightlyProfitData.map((data, index) => (
            <tr key={data.profitEntryId} className={getStatusClass(data.status)}>
              {/* Sequential ID starting from 1 */}
              <td>{index + 1}</td> 
              <td>{new Date(data.date).toLocaleString()}</td> {/* Formatting date */}
              <td>{data.fortnightlyProfit}</td>
              <td>{data.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FortnightlyProfit;
