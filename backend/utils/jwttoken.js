const jwt = require('jsonwebtoken');

// Function to send the JWT token in the response
const sendToken = (user, statusCode, res, message = 'Login successful') => {
  // Generate JWT access token for the user
  const accessToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1d' } // Set expiration from env, default to 1 day
  );

  // Generate JWT refresh token (longer expiration time, e.g., 30 days)
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' } // Set expiration from env, default to 30 days
  );

  // Ensure COOKIE_EXPIRE is a valid number and calculate expiration time for access token
  const expireTime = Number(process.env.COOKIE_EXPIRE) || 1; // Default to 1 day if not set
  const expires = new Date(Date.now() + expireTime * 24 * 60 * 60 * 1000); // Access token expiration

  // Options for the access token cookie with added security measures
  const options = {
    expires, // Use the calculated expiration date for access token
    httpOnly: true, // Accessible only by web server
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: 'Strict', // Prevent CSRF attacks
  };

  // Set the refresh token cookie with a longer expiration (e.g., 30 days)
  const refreshOptions = {
    expires: new Date(Date.now() + (process.env.JWT_REFRESH_EXPIRE || 30) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: 'Strict',
  };

  // Set both the access token and refresh token cookies
  res.status(statusCode)
    .cookie('token', accessToken, options) // Access token cookie
    .cookie('refreshToken', refreshToken, refreshOptions) // Refresh token cookie
    .json({
      success: true,
      message, // Include the custom success message in the response
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // Include user role if necessary
      },
      accessToken, // Include the generated access token in the response
      refreshToken, // Include the refresh token in the response
    });
};

module.exports = sendToken;
