// src/actions/fundsAction.js
import axiosInstance from './axiosInstance';  // Import the axios instance with retry logic
import {
  VIEW_REFERRAL_DATA_REQUEST,
  VIEW_REFERRAL_DATA_SUCCESS,
  VIEW_REFERRAL_DATA_FAIL,
  CLEAR_ERRORS,
} from '../constants/fundConstants';

// Helper function to extract error messages
const getErrorMessage = (error) => {
  if (error.response) {
    return error.response.data?.message || 'Something went wrong';
  } else if (error.message) {
    return error.message;
  }
  return 'Something went wrong';
};




// View Referral Data
export const viewReferralData = () => async (dispatch) => {
  dispatch({ type: VIEW_REFERRAL_DATA_REQUEST });
  try {
    const { data } = await axiosInstance.get('/viewReferralData');
    dispatch({ type: VIEW_REFERRAL_DATA_SUCCESS, payload: data.referrals });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    dispatch({
      type: VIEW_REFERRAL_DATA_FAIL,
      payload: errorMessage,
    });
  }
};

// Clear errors action
export const clearErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};
