const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorhandler"); // Corrected file name case
const catchAsyncErrors = require("./catchAsyncErrors");

// Middleware to authenticate user based on JWT
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    let token;

    // Retrieve token from cookies or Authorization header
    if (req.cookies.token) {
        token = req.cookies.token; // Token from cookies
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1]; // Extract token from "Bearer <token>"
    }

    // If token is not found, return an unauthorized error
    if (!token) {
        return next(new ErrorHandler("Access denied. Please log in to continue.", 401));
    }

    try {
        // Verify the JWT token
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);

        // Log decoded data for debugging purposes in development
        if (process.env.NODE_ENV === "development") {
            console.log("Decoded user data:", decodedData);
        }

        // Fetch user details (excluding password) and attach it to req.user
        req.user = await User.findById(decodedData.id).select("-password").lean();

        // If user not found, return an error
        if (!req.user) {
            return next(new ErrorHandler("User not found. Please register or log in.", 404));
        }

        // User is authenticated, proceed to the next middleware
        next();
    } catch (error) {
        // Handle JWT-specific errors
        if (error.name === "JsonWebTokenError") {
            console.error("Invalid JWT token:", error);
            return next(new ErrorHandler("Invalid session. Please log in again.", 401));
        } else if (error.name === "TokenExpiredError") {
            console.error("JWT token has expired:", error);
            return next(new ErrorHandler("Session expired. Please log in again.", 401));
        }

        // Handle any other errors
        console.error("JWT Verification Error:", error);
        return next(new ErrorHandler("Invalid session. Please log in again.", 401));
    }
});

// Middleware to authorize specific user roles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Check if the user is authenticated
        if (!req.user) {
            return next(new ErrorHandler("User not authenticated.", 403));
        }

        // Check if the user's role is authorized
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Access denied. Role '${req.user.role}' is not authorized.`, 403));
        }

        // User is authorized, proceed to the next middleware
        next();
    };
};

// Middleware to ensure both authentication and authorization
exports.protect = (req, res, next) => {
    // Use the isAuthenticatedUser middleware to check authentication
    exports.isAuthenticatedUser(req, res, (error) => {
        if (error) return next(error); // If an error occurred, handle it immediately

        // If authentication is successful, continue to next middleware
        next();
    });
};
