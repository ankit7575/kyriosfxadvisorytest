const User = require('../models/userModel'); // Import the User model
const { v4: uuidv4 } = require('uuid'); // Import uuid for generating unique profitEntryId
const catchAsyncErrors = require('../middleware/catchAsyncErrors');  // Assuming this is the async error handler
const ErrorHandler = require('../utils/errorhandler');  // Custom error handler

// Add Fortnightly Profit and Referral Incentive
exports.addFortnightlyProfit = async (req, res) => {
  try {
    const { userId, profitAmount } = req.body;

    // Validate input: Check that userId and profitAmount are provided
    if (!userId || !profitAmount) {
      return res.status(400).json({ message: "User ID and profit amount are required." });
    }

    // Find the main user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Define incentives for referral levels
    const directIncentive = profitAmount * 0.15;
    const stage2Incentive = profitAmount * 0.075;
    const stage3Incentive = profitAmount * 0.075;

    // Generate a unique profitEntryId for this profit entry
    const profitEntryId = uuidv4();

    // Add or update the main user's fortnightly profit entry
    const profitEntry = {
      profitEntryId: profitEntryId, // Use the same profitEntryId for all related entries
      date: new Date(),
      fortnightlyProfit: profitAmount,
    };

    // Add the current fortnightly profit to the user's data (new entry if it doesn't exist)
    if (!user.fortnightlyProfit) {
      user.fortnightlyProfit = [];
    }

    // Adding multiple profit entries under the same user
    user.fortnightlyProfit.push({
      history: [profitEntry],
    });

    // Function to add referral incentive to a user's referral history
    const addReferralIncentive = async (referralUser, incentiveData, profitAmount, user) => {
      if (!referralUser) return;

      const incentiveEntry = {
        profitEntryId: profitEntryId, // Ensure the same profitEntryId is used for incentives
        fortnightlyProfit: [{
          history: [{
            date: new Date(),
            fortnightlyProfit: profitAmount,
            stage3Incentive: incentiveData.incentiveStage3 || 0,
            stage2Incentive: incentiveData.incentiveStage2 || 0,
            directIncentive: incentiveData.incentiveDirect || 0,
          }]
        }],
        createdAt: new Date(),
      };

      // Process referral incentives for direct, stage2, stage3
      const referralLevels = [
        { level: 'directReferral', incentive: incentiveData.incentiveDirect, stage: 1 },
        { level: 'stage2Referral', incentive: incentiveData.incentiveStage2, stage: 2 },
        { level: 'stage3Referral', incentive: incentiveData.incentiveStage3, stage: 3 }
      ];

      for (let { level, incentive, stage } of referralLevels) {
        if (incentive) {
          const referralHistory = referralUser.referral[level].find(ref => ref.user && ref.user.toString() === user._id.toString());

          if (referralHistory) {
            // Add history if it exists
            referralHistory.history.push(incentiveEntry);
          } else {
            // Create a new entry if not exists
            referralUser.referral[level].push({
              user: user._id,  // Add the user _id
              name: user.name,  // Add the user name
              history: [incentiveEntry],  // Add the incentive entry
            });
          }
        }
      }

      // Save the updated referral user's data to the database
      await referralUser.save();
    };

    // Function to process referral incentives at different stages (direct, stage 2, and stage 3)
    const processReferralIncentives = async (currentUser, stage) => {
      const referralById = currentUser.referralbyId;

      if (!referralById) return; // Stop if no referring user

      // Fetch the referring user by referralId (not _id)
      const referrerUser = await User.findOne({ referralId: referralById });
      if (!referrerUser) return;

      // Determine which incentive to apply based on the stage
      const incentiveData = stage === 1
        ? { incentiveDirect: directIncentive }
        : stage === 2
        ? { incentiveStage2: stage2Incentive }
        : { incentiveStage3: stage3Incentive };

      // Add incentive to the referrer's history
      await addReferralIncentive(referrerUser, incentiveData, profitAmount, currentUser);

      // Recurse to next referral stage if applicable
      if (stage < 3) {
        await processReferralIncentives(referrerUser, stage + 1);
      }
    };

    // Start processing referrals from stage 1
    await processReferralIncentives(user, 1);

    // Save the main user's data after updating the fortnightly profit
    await user.save();

    // Respond with a success message
    res.status(200).json({ message: "Fortnightly profit added and referral incentives updated.", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteFortnightlyProfit = async (req, res) => {
  try {
    const { userId, profitEntryId } = req.body;

    // Validate input: Ensure both userId and profitEntryId are provided
    if (!userId || !profitEntryId) {
      return res.status(400).json({ message: "User ID and profit entry ID are required." });
    }

    // Find the main user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find the fortnightly profit entry to delete by profitEntryId
    const profitIndex = user.fortnightlyProfit.findIndex(entry => 
      entry.history.some(profit => profit.profitEntryId === profitEntryId)
    );

    if (profitIndex === -1) {
      return res.status(404).json({ message: "Fortnightly profit entry not found." });
    }

    // Remove the profit entry from the user's data
    user.fortnightlyProfit[profitIndex].history = user.fortnightlyProfit[profitIndex].history.filter(
      profit => profit.profitEntryId !== profitEntryId
    );

    // If there are no more profits in that entry, delete the entire profit history object
    if (user.fortnightlyProfit[profitIndex].history.length === 0) {
      user.fortnightlyProfit.splice(profitIndex, 1);
    }

    // Function to remove the referral incentive from referral users
    const removeReferralIncentive = async (referralUser, profitEntryId, user) => {
      if (!referralUser) return;

      // Iterate over the referral levels to find the specific incentive to remove
      const referralLevels = ['directReferral', 'stage2Referral', 'stage3Referral'];

      for (let level of referralLevels) {
        const referralHistory = referralUser.referral[level].find(ref => ref.user && ref.user.toString() === user._id.toString());

        if (referralHistory) {
          // Remove the specific incentive entry by profitEntryId
          referralHistory.history = referralHistory.history.filter(entry => entry.profitEntryId !== profitEntryId);

          // If there are no more entries in the history, remove the level
          if (referralHistory.history.length === 0) {
            referralUser.referral[level] = referralUser.referral[level].filter(ref => ref.user.toString() !== user._id.toString());
          }
        }
      }

      // Save the updated referral user's data to the database
      await referralUser.save();
    };

    // Function to process removal of referral incentives up the chain
    const processReferralIncentivesRemoval = async (currentUser) => {
      const referralById = currentUser.referralbyId;

      if (!referralById) return; // Stop if no referring user

      // Fetch the referring user by referralId (not _id)
      const referrerUser = await User.findOne({ referralId: referralById });
      if (!referrerUser) return;

      // Remove the incentive from the referrer's history
      await removeReferralIncentive(referrerUser, profitEntryId, currentUser);

      // Recurse to remove incentives up the chain if applicable
      await processReferralIncentivesRemoval(referrerUser);
    };

    // Start processing referral incentives removal
    await processReferralIncentivesRemoval(user);

    // Save the main user's data after removing the fortnightly profit entry
    await user.save();

    // Respond with a success message
    res.status(200).json({ message: "Fortnightly profit and associated referral incentives deleted successfully.", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Profit Incentive Controller
exports.deleteProfitIncentive = async (req, res) => {
  try {
    const { userId, profitEntryId } = req.body;

    // Validate input: Ensure both userId and profitEntryId are provided
    if (!userId || !profitEntryId) {
      return res.status(400).json({ message: "User ID and profit entry ID are required." });
    }

    // Find the main user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Function to remove the referral incentive from referral users
    const removeReferralIncentive = async (referralUser, profitEntryId, user) => {
      if (!referralUser) return;

      // Iterate over the referral levels to find the specific incentive to remove
      const referralLevels = ['directReferral', 'stage2Referral', 'stage3Referral'];

      for (let level of referralLevels) {
        const referralHistory = referralUser.referral[level].find(ref => ref.user && ref.user.toString() === user._id.toString());

        if (referralHistory) {
          // Remove the specific incentive entry by profitEntryId
          referralHistory.history = referralHistory.history.filter(entry => 
            entry.fortnightlyProfit.some(profit => profit.profitEntryId !== profitEntryId)
          );

          // If there are no more entries in the history, remove the level
          if (referralHistory.history.length === 0) {
            referralUser.referral[level] = referralUser.referral[level].filter(ref => ref.user.toString() !== user._id.toString());
          }
        }
      }

      // Save the updated referral user's data to the database
      await referralUser.save();
    };

    // Function to process removal of referral incentives up the chain
    const processReferralIncentivesRemoval = async (currentUser) => {
      const referralById = currentUser.referralbyId;

      if (!referralById) return; // Stop if no referring user

      // Fetch the referring user by referralId (not _id)
      const referrerUser = await User.findOne({ referralId: referralById });
      if (!referrerUser) return;

      // Remove the incentive from the referrer's history
      await removeReferralIncentive(referrerUser, profitEntryId, currentUser);

      // Recurse to remove incentives up the chain if applicable
      await processReferralIncentivesRemoval(referrerUser);
    };

    // Start processing referral incentives removal
    await processReferralIncentivesRemoval(user);

    // Respond with a success message
    res.status(200).json({ message: "Referral incentives and associated profit entry deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// View Incentive Data Controller (Refactored with Authentication)
exports.viewIncentiveData = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user?._id;  // Get the user ID from the authenticated user object

  console.log("Attempting to retrieve incentive data for user ID:", userId);

  // Validate user ID
  if (!userId) {
      console.error("User ID is undefined or null.");
      return next(new ErrorHandler('User ID is required to fetch incentive data.', 400));
  }

  try {
      // Find the user by ID and populate the referral fields
      const user = await User.findById(userId)
          .populate('referral.directReferral.user', 'name')
          .populate('referral.stage2Referral.user', 'name')
          .populate('referral.stage3Referral.user', 'name');

      if (!user) {
          console.error("User not found in the database for user ID:", userId);
          return next(new ErrorHandler('User not found', 404));
      }

      // Extract incentive data and include the user name in the response
      const incentiveData = {
          userName: user.name, // Include user name here
          fortnightlyProfit: user.fortnightlyProfit,
          referralIncentives: {
              directReferral: user.referral.directReferral.map(referral => ({
                name: user.name,  // Add the user name
                  history: referral.history.map(entry => ({
                      createdAt: entry.createdAt,
                      fortnightlyProfit: entry.fortnightlyProfit,
                      directIncentive: entry.directIncentive
                  }))
              })),
              stage2Referral: user.referral.stage2Referral.map(referral => ({
                name: user.name,  // Add the user name
                  history: referral.history.map(entry => ({
                      createdAt: entry.createdAt,
                      fortnightlyProfit: entry.fortnightlyProfit,
                      stage2Incentive: entry.stage2Incentive
                  }))
              })),
              stage3Referral: user.referral.stage3Referral.map(referral => ({
                name: user.name,  // Add the user name
                  history: referral.history.map(entry => ({
                      createdAt: entry.createdAt,
                      fortnightlyProfit: entry.fortnightlyProfit,
                      stage3Incentive: entry.stage3Incentive
                  }))
              }))
          }
      };

      // Respond with the incentive data
      res.status(200).json({
          success: true,
          message: "Incentive data fetched successfully.",
          incentiveData
      });
  } catch (error) {
      console.error("Error retrieving incentive data:", error);
      return next(new ErrorHandler('Error retrieving incentive data', 500));
  }
});

// View Fortnightly Profit Data Controller (Refactored with Authentication)
exports.viewFortnightlyProfitData = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user?._id;  // Get the user ID from the authenticated user object

  console.log("Attempting to retrieve fortnightly profit data for user ID:", userId);

  // Validate user ID
  if (!userId) {
    console.error("User ID is undefined or null.");
    return next(new ErrorHandler('User ID is required to fetch profit data.', 400));
  }

  try {
    // Find the user by ID and populate the referral fields
    const user = await User.findById(userId);

    if (!user) {
      console.error("User not found in the database for user ID:", userId);
      return next(new ErrorHandler('User not found', 404));
    }

    // Extract fortnightly profit data
    const fortnightlyProfitData = user.fortnightlyProfit.map(profit => ({
      profitEntryId: profit.history[0].profitEntryId,
      date: profit.history[0].date,
      fortnightlyProfit: profit.history[0].fortnightlyProfit
    }));

    // Respond with the fortnightly profit data
    res.status(200).json({
      success: true,
      message: "Fortnightly profit data fetched successfully.",
      fortnightlyProfitData
    });
  } catch (error) {
    console.error("Error retrieving fortnightly profit data:", error);
    return next(new ErrorHandler('Error retrieving fortnightly profit data', 500));
  }
});

// View All Incentive Data for Admin Controller (With Pagination, Filtering, and Sorting)
exports.viewAllIncentiveDataAdmin = catchAsyncErrors(async (req, res, next) => {
  const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc', filterByName } = req.query; // Pagination, sorting, and filtering

  const filter = {};
  if (filterByName) {
    filter['name'] = { $regex: filterByName, $options: 'i' };  // Case-insensitive search by name
  }

  try {
    // Pagination: Convert the page and limit to numbers
    const skip = (page - 1) * limit;

    // Sorting: Define the sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Find users with incentive data, apply filtering, sorting, and pagination
    const users = await User.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort(sort)
      .select('name fortnightlyProfit referral')  // Only select necessary fields
      .populate('referral.directReferral.user', 'name')
      .populate('referral.stage2Referral.user', 'name')
      .populate('referral.stage3Referral.user', 'name');

    // Get the total count of users for pagination purposes
    const totalUsers = await User.countDocuments(filter);

    // Calculate total pages for pagination
    const totalPages = Math.ceil(totalUsers / limit);

    // Prepare the incentive data for each user
    const incentiveData = users.map(user => ({
      userName: user.name,  // Include user name
      fortnightlyProfit: user.fortnightlyProfit,
      referralIncentives: {
        directReferral: user.referral.directReferral.map(referral => ({
          name: referral.user.name,
          history: referral.history.map(entry => ({
            createdAt: entry.createdAt,
            fortnightlyProfit: entry.fortnightlyProfit,
            directIncentive: entry.directIncentive
          }))
        })),
        stage2Referral: user.referral.stage2Referral.map(referral => ({
          name: referral.user.name,
          history: referral.history.map(entry => ({
            createdAt: entry.createdAt,
            fortnightlyProfit: entry.fortnightlyProfit,
            stage2Incentive: entry.stage2Incentive
          }))
        })),
        stage3Referral: user.referral.stage3Referral.map(referral => ({
          name: referral.user.name,
          history: referral.history.map(entry => ({
            createdAt: entry.createdAt,
            fortnightlyProfit: entry.fortnightlyProfit,
            stage3Incentive: entry.stage3Incentive
          }))
        }))
      }
    }));

    // Respond with the incentive data and pagination info
    res.status(200).json({
      success: true,
      message: "All incentive data fetched successfully.",
      incentiveData,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: Number(page),
        usersPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error("Error retrieving incentive data for admin:", error);
    return next(new ErrorHandler('Error retrieving incentive data for admin', 500));
  }
});

// View Fortnightly Profit Data for Admin Controller (With Pagination, Filtering, and Sorting)
exports.viewFortnightlyProfitDataAdmin = catchAsyncErrors(async (req, res, next) => {
  const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc', filterByName, filterByProfit } = req.query; // Pagination, sorting, and filtering

  const filter = {};
  if (filterByName) {
    filter['name'] = { $regex: filterByName, $options: 'i' };  // Case-insensitive search by name
  }
  if (filterByProfit) {
    filter['fortnightlyProfit.fortnightlyProfit'] = { $gte: filterByProfit };  // Filter by minimum profit
  }

  try {
    // Pagination: Convert the page and limit to numbers
    const skip = (page - 1) * limit;

    // Sorting: Define the sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Find users with fortnightly profit data, apply filtering, sorting, and pagination
    const users = await User.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort(sort)
      .select('name fortnightlyProfit') // Only select necessary fields
      .populate('referral.directReferral.user', 'name')
      .populate('referral.stage2Referral.user', 'name')
      .populate('referral.stage3Referral.user', 'name');

    // Get the total count of users for pagination purposes
    const totalUsers = await User.countDocuments(filter);

    // Calculate total pages for pagination
    const totalPages = Math.ceil(totalUsers / limit);

    // Prepare the fortnightly profit data for each user
    const fortnightlyProfitData = users.map(user => ({
      userName: user.name,  // Include user name
      fortnightlyProfit: user.fortnightlyProfit.map(profit => ({
        profitEntryId: profit.history[0].profitEntryId,
        date: profit.history[0].date,
        fortnightlyProfit: profit.history[0].fortnightlyProfit
      }))
    }));

    // Respond with the fortnightly profit data and pagination info
    res.status(200).json({
      success: true,
      message: "Fortnightly profit data fetched successfully.",
      fortnightlyProfitData,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: Number(page),
        usersPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error("Error retrieving fortnightly profit data for admin:", error);
    return next(new ErrorHandler('Error retrieving fortnightly profit data for admin', 500));
  }
});

// Delete a specific fortnightly profit entry for a user
exports.deleteFortnightlyProfit = catchAsyncErrors(async (req, res, next) => {
  const { userId, profitEntryId } = req.body; // Expect userId and profitEntryId

  // Validate input
  if (!userId || !profitEntryId) {
    return res.status(400).json({ message: "User ID and profit entry ID are required." });
  }

  // Find the user by ID
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Remove the specified profit entry
  const profitIndex = user.fortnightlyProfit.findIndex(
    (entry) => entry.history[0].profitEntryId === profitEntryId
  );

  if (profitIndex !== -1) {
    user.fortnightlyProfit.splice(profitIndex, 1);
    await user.save();

    res.status(200).json({ message: "Fortnightly profit entry deleted successfully." });
  } else {
    res.status(404).json({ message: "Profit entry not found." });
  }
});

// Delete a specific profit incentive entry (e.g., for direct, stage 2, stage 3 referrals)
exports.deleteProfitIncentive = catchAsyncErrors(async (req, res, next) => {
  const { userId, profitEntryId, level } = req.body; // Expect userId, profitEntryId, and level (direct, stage2, stage3)

  if (!userId || !profitEntryId || !level) {
    return res.status(400).json({ message: "User ID, profit entry ID, and level are required." });
  }

  // Find the user by ID
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Locate the referral history based on the level
  const referralLevel = user.referral[level];
  if (!referralLevel) {
    return res.status(404).json({ message: "Referral level not found." });
  }

  // Find the incentive entry to delete
  const referralHistory = referralLevel.find(
    (referral) => referral.history.some((entry) => entry.profitEntryId === profitEntryId)
  );

  if (referralHistory) {
    // Find and remove the incentive entry from the history
    referralHistory.history = referralHistory.history.filter(
      (entry) => entry.profitEntryId !== profitEntryId
    );

    await user.save();
    res.status(200).json({ message: "Profit incentive entry deleted successfully." });
  } else {
    res.status(404).json({ message: "Profit incentive entry not found." });
  }
});

// View All Incentive Data for Admin (Pagination, Sorting, Filtering)
exports.viewAllIncentiveDataAdmin = catchAsyncErrors(async (req, res, next) => {
  const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc', filterByName } = req.query;

  const filter = {};
  if (filterByName) {
    filter['name'] = { $regex: filterByName, $options: 'i' };
  }

  const skip = (page - 1) * limit;
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  try {
    // Fetch users with incentives and populate data as needed
    const users = await User.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort(sort)
      .select('name referral')
      .populate('referral.directReferral.user', 'name')
      .populate('referral.stage2Referral.user', 'name')
      .populate('referral.stage3Referral.user', 'name');

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      message: "All incentive data fetched successfully.",
      users,
      pagination: { totalUsers, totalPages, currentPage: page, usersPerPage: limit }
    });
  } catch (error) {
    console.error("Error fetching incentive data for admin:", error);
    return next(new ErrorHandler('Error fetching incentive data for admin', 500));
  }
});

// View Referral Data Controller
exports.viewReferralData = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    return next(new ErrorHandler("User ID is required to fetch referral data.", 400));
  }

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Helper function to get user details by ID
    const getUserDetails = async (userId) => {
      const user = await User.findById(userId).select("name phone email status role");
      if (user) {
        return {
          userId: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          status: user.status,
          role: user.role
        };
      }
      return null;
    };

    // Gather all referrals with user details for each referral stage
    const directReferrals = await Promise.all(
      user.referral.directReferral.map(async (ref) => {
        const userDetails = await getUserDetails(ref.user);
        return userDetails
          ? { ...userDetails, referralStage: "directReferral" }
          : { referralStage: "directReferral" };
      })
    );

    const stage2Referrals = await Promise.all(
      user.referral.stage2Referral.map(async (ref) => {
        const userDetails = await getUserDetails(ref.user);
        return userDetails
          ? { ...userDetails, referralStage: "stage2Referral" }
          : { referralStage: "stage2Referral" };
      })
    );

    const stage3Referrals = await Promise.all(
      user.referral.stage3Referral.map(async (ref) => {
        const userDetails = await getUserDetails(ref.user);
        return userDetails
          ? { ...userDetails, referralStage: "stage3Referral" }
          : { referralStage: "stage3Referral" };
      })
    );

    // Combine all referrals into a single array
    let allReferrals = [...directReferrals, ...stage2Referrals, ...stage3Referrals];

    // Remove duplicate referrals based on userId
    const uniqueReferralsMap = new Map();

    allReferrals.forEach(referral => {
      if (!uniqueReferralsMap.has(referral.userId)) {
        uniqueReferralsMap.set(referral.userId, referral);
      }
    });

    // Convert map values to an array (unique referrals)
    const uniqueReferrals = Array.from(uniqueReferralsMap.values());

    // Respond with the formatted referral data
    res.status(200).json({
      success: true,
      message: "Referral data fetched successfully.",
      referrals: uniqueReferrals,
    });
  } catch (error) {
    console.error("Error retrieving referral data:", error);
    return next(new ErrorHandler("Error retrieving referral data", 500));
  }
});
