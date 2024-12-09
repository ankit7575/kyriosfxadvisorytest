const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const crypto = require('crypto');
const path = require("path");
const fs = require("fs");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { sendEmail } = require("../utils/sendEmail");
const otpService = require("../utils/otpService");
const generatePdf = require("./generatePdf");
const sendToken = require("../utils/jwttoken");
const { v4: uuidv4 } = require('uuid'); // Import uuid for generating unique profitEntryId

const tempUserStore = {}; // Temporary storage for unverified users
const TEMP_USER_EXPIRATION = 90 * 1000; // 1.5 minutes

// Constants
const REFERRAL_PREFIX = 'REF-';
const OTP_LENGTH = 7;
const EMAIL_VERIFY_MESSAGE = "Please verify your email to complete registration.";

// Generate unique referral ID
const generateReferralId = () => `${REFERRAL_PREFIX}${Math.random().toString(36).substr(2, OTP_LENGTH).toUpperCase()}`;

// User input validation
const validateUserInput = ({ email, phone, password }) => {
  if (!validator.isEmail(email)) throw new ErrorHandler("Invalid email format", 400);
  if (!phone || phone.length < 10) return "Please enter a valid phone number.";
  if (!validator.isStrongPassword(password, { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1 })) {
    throw new ErrorHandler("Password must be at least 6 characters and contain a mix of letters and numbers", 400);
  }
};

// Automatically clear expired temporary user after 1.5 minutes
const clearExpiredTempUser = (email) => {
  setTimeout(() => {
    delete tempUserStore[email]; // Remove user after expiration
  }, TEMP_USER_EXPIRATION);
};

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, referralId } = req.body;

  try {
    validateUserInput({ email, phone, password });
  } catch (error) {
    return next(error);
  }

  // Check if the user already exists in temporary storage
  if (tempUserStore[email]) {
    return next(new ErrorHandler("User already exists in temporary storage", 400));
  }

  // Check if the referral ID exists
  if (referralId) {
    const referringUser = await User.findOne({ referralId });
    if (!referringUser) {
      return next(new ErrorHandler("Referral ID does not exist. Registration unsuccessful.", 400));
    }
  }

  // Generate a new referral ID
  const newReferralId = generateReferralId();

  // Create a temporary user object
  const tempUser = {
    name,
    email,
    phone,
    password, // Store the raw password, which will be hashed later
    referralbyId: referralId,
    otpVerified: false,
    referralId: newReferralId,
    createdAt: Date.now(),
  };

  // Save the temporary user
  tempUserStore[email] = tempUser;

  // Automatically clean up the temporary user after 1.5 minutes
  clearExpiredTempUser(email);

  // Generate and send OTP
  const otp = otpService.generateOtp();
  await otpService.sendOtp(email, otp);

  // Generate the registration PDF
  const pdfPath = await generatePdf.generatePdf({
    name: tempUser.name,
    email: tempUser.email,
    phone: tempUser.phone,
  });

  // Send the welcome email with OTP
  await sendEmail({
    email: tempUser.email,
    subject: "Welcome to Kyrios Fx Advisory - Registration Complete",
    message: `Dear ${tempUser.name},\n\nYour registration has been successfully completed. ${EMAIL_VERIFY_MESSAGE}`,
    attachments: [{ filename: `${tempUser.name}_registration.pdf`, path: pdfPath }],
  });

  // Respond with a success message and redirect information
  res.status(201).json({
    message: "User registered successfully. Please verify your email with the OTP.",
    otpSent: true,
    redirectTo: "/verification", // Add the redirect path
  });
});

// Verify OTP and complete registration
exports.verifyOtpAndCompleteRegistration = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;

  // Validate OTP
  if (!otp) {
    return next(new ErrorHandler("OTP is required", 400));
  }

  const tempUser = tempUserStore[email];
  if (!tempUser) {
    return next(new ErrorHandler("User not found in temporary storage", 404));
  }

  // Check if OTP has expired
  if (Date.now() - tempUser.createdAt > TEMP_USER_EXPIRATION) {
    delete tempUserStore[email];
    return next(new ErrorHandler("OTP expired, please re-register.", 400));
  }

  // Verify OTP
  const isValidOtp = otpService.verifyOtp(email, otp);
  if (!isValidOtp) {
    return next(new ErrorHandler("Invalid or expired OTP", 400));
  }

  // Mark OTP as verified
  tempUser.otpVerified = true;

  // Set role based on email (admin for specific emails, else referral)
  const userRole = (email === "ankitvashist765@gmail.com" || email === "kyriosfxadvisory01@gmail.com") ? "admin" : "referral";

  // Create new user and save to the database
  const newUser = new User({
    name: tempUser.name,
    email: tempUser.email,
    phone: tempUser.phone,
    password: tempUser.password, // Raw password will be hashed later by the schema pre-save hook
    referralbyId: tempUser.referralbyId,
    referralId: tempUser.referralId,
    emailVerified: true,
    otpVerified: true,
    status: "active",
    role: userRole, // Set role based on email
  });

  await newUser.save();

  // Handle referrals and update referral history
  if (newUser.referralbyId) {
    const referringUser = await User.findOne({ referralId: newUser.referralbyId });

    if (referringUser) {
      // Add direct referral to the referring user
      referringUser.referral.directReferral.push({
        user: newUser._id,  // Save user _id
        name: newUser.name,  // Save user name
        history: [] // Removed fortnightlyProfit history
      });
      await referringUser.save();

      if (referringUser.referralbyId) {
        const level2User = await User.findOne({ referralId: referringUser.referralbyId });
        if (level2User) {
          // Add stage 2 referral
          level2User.referral.stage2Referral.push({
            user: newUser._id,  // Save user _id
            name: newUser.name,  // Save user name
            history: [] // Removed fortnightlyProfit history
          });
          await level2User.save();

          if (level2User.referralbyId) {
            const level3User = await User.findOne({ referralId: level2User.referralbyId });
            if (level3User) {
              // Add stage 3 referral
              level3User.referral.stage3Referral.push({
                user: newUser._id,  // Save user _id
                name: newUser.name,  // Save user name
                history: [] // Removed fortnightlyProfit history
              });
              await level3User.save();
            }
          }
        }
      }
    }
  }

  // Generate a token for the new user
  sendToken(newUser, 200, res, "Email verified and registration completed successfully.");

  // Remove temporary user data from the store
  delete tempUserStore[email];
});



exports.refreshToken = catchAsyncErrors(async (req, res, next) => {
    const { refreshToken } = req.cookies; // Assuming the refresh token is sent in cookies
  
    // Check if refresh token exists
    if (!refreshToken) {
      return next(new ErrorHandler('No refresh token provided', 401));
    }
  
    try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  
      // Find the user associated with the refresh token
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new ErrorHandler('User not found', 404));
      }
  
      // Generate a new access token
      const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '1d', // Set your desired expiration for access tokens
      });
  
      // Send the new access token in the response
      res.status(200).json({
        success: true,
        accessToken: newAccessToken,
      });
    } catch (error) {
      return next(new ErrorHandler('Invalid or expired refresh token', 401));
    }
  });
  

  exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
  
    // Validate required fields
    if (!email || !password) {
      return next(new ErrorHandler('Please enter email and password', 400));
    }
  
    // Find user by email and select password field
    const user = await User.findOne({ email }).select('+password'); // Ensure password is included
  
    // Check if user exists
    if (!user) {
      return next(new ErrorHandler('Invalid email or password', 401));
    }
  
    // Check if the user's account is verified
    if (!user.emailVerified) {
      return next(new ErrorHandler('Please verify your email before logging in', 401));
    }
  
    // Compare password
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return next(new ErrorHandler('Invalid email or password', 401));
    }
  
    // Use sendToken to send token and cookie
    sendToken(user, 200, res, "Login successful");
  });
  


  

// Logout user (clear access and refresh tokens)
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
    // Clear the refresh token cookie
    res.cookie('refreshToken', '', {
      expires: new Date(0),  // Set expiration to a date in the past to clear the cookie
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",  // Use secure cookies in production
      sameSite: 'Strict',  // Prevent CSRF attacks
    });

    // Clear the access token cookie if you are also storing it in cookies
    res.cookie('token', '', {
      expires: new Date(0),  // Set expiration to a date in the past to clear the cookie
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",  // Use secure cookies in production
      sameSite: 'Strict',  // Prevent CSRF attacks
    });

    // Send a success response
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
});



// Forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    const resetToken = user.getResetPasswordToken();
    console.log("Generated Reset Token (unhashed):", resetToken); // Log the unhashed token
    console.log("Stored Hashed Token in DB:", user.resetPasswordToken); // Log the hashed token

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
    const message = `Your password reset token is: \n\n ${resetPasswordUrl} \n\n If you have not requested this email, please ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Recovery',
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler('Error sending email: ' + error.message, 500));
    }
});


// Reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.params;

    if (!token) {
        return next(new ErrorHandler('Reset token is required', 400));
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log("Provided Hashed Token:", hashedToken); // Log the hashed token from request

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler('Reset Password Token is invalid or has expired', 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Passwords do not match', 400));
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    sendToken(user, 200, res, 'Password change successful');
});

// Update user password
exports.updateUserPassword = catchAsyncErrors(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
        return next(new ErrorHandler('Please provide both current and new passwords', 400));
    }

    // Check if user is authenticated (ensure user is available in req.user)
    if (!req.user) {
        return next(new ErrorHandler('User not authenticated', 401));
    }

    // Fetch the user from the database
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    // Check if the current password matches
    const isPasswordMatched = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler('Current password is incorrect', 401));
    }

    // Validate new password strength (optional but recommended)
    if (newPassword.length < 6) {
        return next(new ErrorHandler('New password must be at least 6 characters long', 400));
    }

// Hash the new password and update the user record
try {
    // Hash the new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save(); // Save the updated password to the database

    // Use sendToken to send token and cookie
    sendToken(user, 200, res, "Password updated successfully"); // Replace with your custom success message

} catch (error) {
    // Log any errors
    logErrorToFile(error.message); // Log the error message to a file or an external logging service
    return next(new ErrorHandler('Error updating password. Please try again later.', 500));
}
});





// Update user profile
exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    const { 
        name,
        email,
        phone
    } = req.body;

    // Fetch the user from the database
    const user = await User.findById(req.user._id); // Use _id instead of id

    // If the user is not found, return an error
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    // Check if the new email is already in use by another user
    if (email && email.toLowerCase().trim() !== user.email) {
        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });
        if (existingUser) {
            return next(new ErrorHandler('Email is already in use by another account.', 400));
        }
        user.email = email.toLowerCase().trim(); // Update email only if it's unique
    }

    // Update user fields with new values or retain existing ones
    user.name = name || user.name;
    user.phone = phone || user.phone;

    // Save the updated user profile
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
            name: user.name,
            email: user.email,
            phone: user.phone,
        }, // Optionally exclude sensitive fields like password
    });
});

// Get user details for the authenticated user
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user?._id; // Safely get the user ID

    console.log("Attempting to retrieve user details for user ID:", userId);

    // Validate the user ID
    if (!userId) {
        console.error("User ID is undefined or null.");
        return next(new ErrorHandler('User ID is required to fetch details.', 400));
    }

    try {
        // Find the user by ID and exclude the password from the response
        const user = await User.findById(userId).select('-password').lean();

        // Log the fetched user object
        if (user) {
            console.log("User fetched from database:", user);
            // Return user details
            return res.status(200).json({
                success: true,
                user,
            });
        } else {
            console.error("User not found in the database for user ID:", userId);
            return next(new ErrorHandler('User not found', 404));
        }
    } catch (error) {
        // Log the complete error for debugging
        console.error("Error retrieving user details:", error); // Log the error object

        // Check if the error is a Mongoose error
        if (error instanceof mongoose.Error) {
            console.error("Mongoose Error:", error);
        }

        // Log the error to a file for persistent storage
        logErrorToFile(error); // Ensure this function is correctly defined and imported

        // Handle other errors
        return next(new ErrorHandler('Error retrieving user details', 500));
    }
});



// Get All Users (Admin) with Pagination, Filtering, and Sorting
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    // Destructure query parameters for pagination, filtering, and sorting
    const {
        page = 1, limit = 10, sort = 'createdAt', order = 'desc', ...filters
    } = req.query;

    // Set up pagination and sorting options
    const pageOptions = {
        skip: (page - 1) * limit,
        limit: parseInt(limit),
    };
    const sortOptions = {
        [sort]: order === 'asc' ? 1 : -1
    };

    // Filter users based on query parameters
    const users = await User.find(filters, '-password') // Exclude password for security
        .sort(sortOptions)
        .skip(pageOptions.skip)
        .limit(pageOptions.limit);

    // Get total count for pagination purposes
    const totalUsers = await User.countDocuments(filters);

    res.status(200).json({
        success: true,
        page: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        users,
    });
});




// Get Single User (Admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const userId = req.params.id;

    // Check if the userId is a valid ObjectId format
    const isObjectId = mongoose.isValidObjectId(userId);

    let user;

    try {
        if (isObjectId) {
            // Fetch the user from the database using ObjectId
            user = await User.findById(userId).select('-password'); // Exclude sensitive fields
        } else {
            // Fetch the user by UUID if the ID is not an ObjectId
            user = await User.findOne({
                id: userId
            }).select('-password'); // Exclude sensitive fields
        }

        // Check if the user was found
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        // Return the found user details
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        // Log the error for debugging purposes
        logErrorToFile(error.message); // Assuming logErrorToFile is available for logging
        return next(new ErrorHandler('Error fetching user details', 500));
    }
});




// Update User Role (Admin)
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const {
        role
    } = req.body;

    // Validate that a role is provided
    if (!role) {
        return next(new ErrorHandler('Role must be provided', 400));
    }

    // Validate that the role is one of the allowed values
    const allowedRoles = ['admin', 'trader', 'referral']; // Adjust based on your application's roles
    if (!allowedRoles.includes(role)) {
        return next(new ErrorHandler(`Role must be one of the following: ${allowedRoles.join(', ')}`, 400));
    }

    // Find the user by ID
    const user = await User.findById(req.params.id);

    // Check if the user exists
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    // Update the user's role
    user.role = role; // Directly assign the new role
    await user.save();

    // Return a success response
    res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        user,
    });
});


// Delete User (Admin) not working
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        await user.remove();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting user',
        });
    }
});

  

// Controller method to update user status
exports.updateUserStatus = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body; // Expect status to be 'active' or 'inactive'

    // Validate status value
    if (!['active', 'inactive'].includes(status)) {
        return next(new ErrorHandler("Invalid status. Status must be 'active' or 'inactive'.", 400));
    }

    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Update user's status
    user.status = status;
    await user.save();

    res.status(200).json({
        success: true,
        message: `User status updated to ${status}.`,
    });
});



