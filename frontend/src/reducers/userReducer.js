import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  VERIFY_OTP_REQUEST,
  VERIFY_OTP_SUCCESS,
  VERIFY_OTP_FAIL,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAIL,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAIL,
  LOGOUT_USER,
  LOGOUT_USER_FAIL,
  CLEAR_ERRORS,
  LOAD_USER_REQUEST,
  LOAD_USER_SUCCESS,
  LOAD_USER_FAIL,
  REFRESH_TOKEN_REQUEST,
  REFRESH_TOKEN_SUCCESS,
  REFRESH_TOKEN_FAIL,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAIL,
  UPDATE_USER_RESET,
  UPDATE_USER_PASSWORD_REQUEST,
  UPDATE_USER_PASSWORD_SUCCESS,
  UPDATE_USER_PASSWORD_FAIL,
} from "../constants/userConstants";

// Initial state for the user reducer
const initialState = {
  user: null, // Default user as `null`
  loading: false, // Loading state for async actions
  isAuthenticated: false, // Tracks if user is authenticated
  refreshToken: null, // Stores the refresh token
  error: null, // Stores error messages
  message: null, // Stores success messages
  isUserLoaded: false, // Tracks if the user data is loaded
  referralData: null, // Stores referral data
  referralDataLoading: false, // Loading state for referral data
  isUserUpdated: false, // Tracks if the user profile is updated
  isPasswordUpdated: false, // Tracks if password was successfully updated
};

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    // Request actions: Set loading and reset previous error/message
    case LOGIN_REQUEST:
    case REGISTER_REQUEST:
    case VERIFY_OTP_REQUEST:
    case FORGOT_PASSWORD_REQUEST:
    case RESET_PASSWORD_REQUEST:
    case REFRESH_TOKEN_REQUEST:
    case UPDATE_USER_REQUEST:
    case UPDATE_USER_PASSWORD_REQUEST:
      return {
        ...state,
        loading: true,
        error: null, // Clear previous errors
        message: null, // Clear previous messages
      };

    // LOAD_USER_REQUEST should only be allowed if user data isn't already loaded
    case LOAD_USER_REQUEST:
      if (state.isUserLoaded) {
        return state; // Prevent redundant request if user data is already loaded
      }
      return {
        ...state,
        loading: true,
        error: null,
        message: null,
      };

    // Success actions: Handle successful user-related actions
    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
    case LOAD_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.user || action.payload, // Handle `user` or direct payload
        isAuthenticated: true,
        refreshToken: action.payload.refreshToken || state.refreshToken, // Update refresh token if available
        error: null,
        message: null,
        isUserLoaded: true,
      };

    case VERIFY_OTP_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.user || action.payload, // Handle `user` or direct payload
        isAuthenticated: true,
        refreshToken: action.payload.refreshToken || state.refreshToken, // Update refresh token if available
        error: null,
        message: null,
        isUserLoaded: true,
      };

    case UPDATE_USER_SUCCESS: // Handle user profile update success
      return {
        ...state,
        loading: false,
        user: { ...state.user, ...action.payload }, // Merge updated fields into user data
        isUserUpdated: true,
        error: null,
        message: "User profile updated successfully.", // Optional success message
      };

    case UPDATE_USER_PASSWORD_SUCCESS: // Handle password update success
      return {
        ...state,
        loading: false,
        isPasswordUpdated: true, // Indicate password was updated successfully
        message: "Password updated successfully.", // Success message
        error: null,
      };

    // Success actions for password-related processes
    case FORGOT_PASSWORD_SUCCESS:
    case RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        message: action.payload, // Success message from payload
        error: null,
      };

    // Success action for refresh token
    case REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        loading: false,
        refreshToken: action.payload.refreshToken, // Update refresh token
        error: null,
      };

    // Failure actions: Handle failures for user actions
    case LOGIN_FAIL:
    case REGISTER_FAIL:
    case VERIFY_OTP_FAIL:
    case FORGOT_PASSWORD_FAIL:
    case RESET_PASSWORD_FAIL:
    case LOAD_USER_FAIL:
    case REFRESH_TOKEN_FAIL:
    case UPDATE_USER_FAIL:
    case UPDATE_USER_PASSWORD_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload, // Store error message
        message: null, // Clear success messages
        isUserUpdated: false, // Reset update flag on failure
        isPasswordUpdated: false, // Reset password update flag on failure
      };

    // Logout success: Reset the user state
    case LOGOUT_USER:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        refreshToken: null,
        error: null,
        message: null,
        referralData: null, // Clear referral data on logout
      };

    // Logout failure: Handle logout failure
    case LOGOUT_USER_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload, // Store error message
        message: null,
      };

    // Reset update state
    case UPDATE_USER_RESET:
      return {
        ...state,
        isUserUpdated: false,
        message: null, // Clear success message
      };

    // Clear errors action: Resets error and message
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
        message: null,
      };

    // Default case: Return current state if no action matches
    default:
      return state;
  }
};
