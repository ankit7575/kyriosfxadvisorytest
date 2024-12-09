import {
    VIEW_REFERRAL_DATA_REQUEST,
    VIEW_REFERRAL_DATA_SUCCESS,
    VIEW_REFERRAL_DATA_FAIL,
    CLEAR_ERRORS,
  } from "../constants/fundConstants";
  
  // Initial state for the fund reducer
  const initialState = {
    referralData: null, // Stores referral data
    loading: false, // General loading state for async actions
    referralDataLoading: false, // Specific loading state for referral data
    error: null, // Stores error messages
    message: null, // Stores success messages
  };
  
  export const fundReducer = (state = initialState, action) => {
    switch (action.type) {
      // Request actions: Set loading and reset previous error/message
      case VIEW_REFERRAL_DATA_REQUEST:
        return {
          ...state,
          loading: true, // Set general loading state to true
          referralDataLoading: true, // Specific referral data loading state
          error: null, // Reset error
          message: null, // Reset message
        };
  
      // Success actions: Handle successful referral data fetch
      case VIEW_REFERRAL_DATA_SUCCESS:
        return {
          ...state,
          referralDataLoading: false, // Stop referral data loading
          referralData: action.payload, // Store referral data from action
          error: null, // Reset error on success
        };
  
      // Failure actions: Handle failures for referral data fetching
      case VIEW_REFERRAL_DATA_FAIL:
        return {
          ...state,
          loading: false, // Stop general loading
          referralDataLoading: false, // Stop referral data specific loading
          error: action.payload, // Store error message from action
          message: null, // Clear any success message
        };
  
      // Clear errors action: Resets error and message
      case CLEAR_ERRORS:
        return {
          ...state,
          error: null, // Clear error
          message: null, // Clear message
        };
  
      // Default case: Return current state if no action matches
      default:
        return state;
    }
  };
  