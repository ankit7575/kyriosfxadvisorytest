const express = require("express");
const rateLimit = require("express-rate-limit");
const {
    registerUser,
    verifyOtpAndCompleteRegistration,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    updateUserPassword,
    updateUserProfile,
    getUserDetails,
    getAllUsers,
    getSingleUser,
    updateUserRole,
    deleteUser,
    updateUserStatus,
    refreshToken
} = require("../controller/userController");

const { 
    addFortnightlyProfit,
    deleteFortnightlyProfit,
    deleteProfitIncentive,
    viewIncentiveData,
    viewFortnightlyProfitData,
    viewAllIncentiveDataAdmin,
    viewFortnightlyProfitDataAdmin,
    viewReferralData,
} = require("../controller/fundsController");

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for login attempts (5 requests per 15 minutes)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many login attempts from this IP, please try again later.',
});

// User registration and login routes
router.post("/register", registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/logout", logoutUser);
router.post("/verify-otp", verifyOtpAndCompleteRegistration);
router.get("/me", isAuthenticatedUser, getUserDetails);
router.post("/refresh-token", refreshToken);  // Add this line for refresh token
// Password recovery routes
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

// User profile update routes
router.put("/update-password", isAuthenticatedUser, updateUserPassword);
router.put("/update-profile", isAuthenticatedUser, updateUserProfile);

// Admin routes
router.get("/admin/users", isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);
router.get("/admin/users/:id", isAuthenticatedUser, authorizeRoles('admin'), getSingleUser);
router.put("/admin/users/:id/role", isAuthenticatedUser, authorizeRoles('admin'), updateUserRole);
router.delete('/admin/users/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteUser);

// Route to update user status (Admin only)
router.patch('/admin/users/:id/status', isAuthenticatedUser, authorizeRoles('admin'), updateUserStatus);

// Route to add fortnightly profit for a specific user (Admin only)
router.post('/admin/addFortnightlyProfit', isAuthenticatedUser, authorizeRoles("admin"), addFortnightlyProfit);

// Route to delete a specific fortnightly profit entry (Admin only)
router.post('/admin/deleteFortnightlyProfit', isAuthenticatedUser, authorizeRoles("admin"), deleteFortnightlyProfit);

// Route to delete a specific profit incentive entry (Admin only)
router.post('/admin/deleteProfitIncentive', isAuthenticatedUser, authorizeRoles("admin"), deleteProfitIncentive);

// Route to view incentive data (authenticated user only)
router.get("/viewIncentiveData", isAuthenticatedUser, viewIncentiveData);

// Route to view fortnightly profit data (authenticated user only)
router.get("/viewFortnightlyProfitData", isAuthenticatedUser, viewFortnightlyProfitData);

// Route to view fortnightly profit data (authenticated user only)
router.get("/viewReferralData", isAuthenticatedUser, viewReferralData);




// Admin route to view all incentive data (with pagination, filtering, and sorting)
router.get("/admin/viewAllIncentiveDataAdmin", isAuthenticatedUser, authorizeRoles("admin"), viewAllIncentiveDataAdmin);

// Admin route to view fortnightly profit data for all users (Admin only)
router.get("/admin/viewFortnightlyProfitDataAdmin", isAuthenticatedUser, authorizeRoles("admin"), viewFortnightlyProfitDataAdmin);


module.exports = router;
