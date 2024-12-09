import axiosInstance from './axiosInstance';  // Import the axios instance with retry logic
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  CLEAR_ERRORS,
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
  LOAD_USER_REQUEST,
  LOAD_USER_SUCCESS,
  LOAD_USER_FAIL,
  REFRESH_TOKEN_REQUEST,
  REFRESH_TOKEN_SUCCESS,
  REFRESH_TOKEN_FAIL,
  UPDATE_USER_REQUEST, 
  UPDATE_USER_SUCCESS, 
  UPDATE_USER_FAIL, 
  UPDATE_USER_PASSWORD_REQUEST,
  UPDATE_USER_PASSWORD_SUCCESS,
  UPDATE_USER_PASSWORD_FAIL,
} from '../constants/userConstants';

// Helper function for error handling
const getErrorMessage = (error) => {
  if (error.response) {
    return error.response.data?.message || 'Something went wrong';
  } else if (error.message) {
    return error.message;
  }
  return 'Something went wrong';
};


const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const setRefreshToken = (refreshToken) => localStorage.setItem('refreshToken', refreshToken);
const removeRefreshToken = () => localStorage.removeItem('refreshToken');


// Action creators for user actions
export const register = (formData) => async (dispatch) => {
  dispatch({ type: REGISTER_REQUEST });

  try {
    const { data } = await axiosInstance.post('/register', formData);
    
    // Dispatch success action with the returned data
    dispatch({ type: REGISTER_SUCCESS, payload: data });
    
    // Store the user's email in session storage
    sessionStorage.setItem("userEmail", formData.email);

    // Navigate to the validation form
    // Note: This assumes you handle navigation in the calling component.
    window.location.href = "/validate-form";
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    dispatch({
      type: REGISTER_FAIL,
      payload: errorMessage,
    });
  } finally {
    // Only clear errors when an action completes
    dispatch({ type: CLEAR_ERRORS });
  }
};

export const login = (email, password) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  try {
    const { data } = await axiosInstance.post('/login', { email, password });
    // Set the token and refresh token
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);

    dispatch({ type: LOGIN_SUCCESS, payload: data });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    dispatch({
      type: LOGIN_FAIL,
      payload: errorMessage,
    });
  } finally {
    // Clear errors after each action completes
    dispatch({ type: CLEAR_ERRORS });
  }
};

// Verify OTP action
export const verifyOtp = (otpData) => async (dispatch) => {
  dispatch({ type: VERIFY_OTP_REQUEST });

  try {
    // Send OTP data for verification
    const { data } = await axiosInstance.post('/verify-otp', otpData);

    // If OTP verification is successful, dispatch the success action
    dispatch({ type: VERIFY_OTP_SUCCESS, payload: data });

    // Check if the response contains a token (successful OTP verification)
    if (data.token) {
      // Store the token in localStorage
      setToken(data.token);

      // After successful OTP verification, directly load user data without needing login
      dispatch(loadUser());  // Load user data

      // Redirect to the login page after successful OTP verification
      window.location.href = "/login";  // Redirect to the login page
    } else {
      // Handle case where OTP verification does not return a valid token
      dispatch({
        type: VERIFY_OTP_FAIL,
        payload: 'OTP verification failed, please try again.',
      });
    }
  } catch (error) {
    // Handle OTP verification failure
    const errorMessage = getErrorMessage(error);
    dispatch({
      type: VERIFY_OTP_FAIL,
      payload: errorMessage,
    });
  } finally {
    // Clear any errors after the OTP verification process completes
    dispatch({ type: CLEAR_ERRORS });
  }
};



// Forgot Password action
export const forgotPassword = (email) => async (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });  // Clear errors before starting forgot password process
  dispatch({ type: FORGOT_PASSWORD_REQUEST });

  try {
    const { data } = await axiosInstance.post('/password/forgot', { email });
    dispatch({ type: FORGOT_PASSWORD_SUCCESS, payload: data.message });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    dispatch({
      type: FORGOT_PASSWORD_FAIL,
      payload: errorMessage,
    });
  }
};

// Reset Password action
export const resetPassword = (token, newPassword, confirmPassword) => async (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });  // Clear errors before starting password reset
  dispatch({ type: RESET_PASSWORD_REQUEST });

  try {
    const { data } = await axiosInstance.put(
      `/password/reset/${token}`,
      { password: newPassword, confirmPassword }
    );
    dispatch({ type: RESET_PASSWORD_SUCCESS, payload: data });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    dispatch({
      type: RESET_PASSWORD_FAIL,
      payload: errorMessage,
    });
  }
};

// Load user data action
export const loadUser = () => async (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });  // Clear errors before loading user data
  dispatch({ type: LOAD_USER_REQUEST });

  try {
    const token = getToken();  // Get the token from localStorage
    if (!token) {
      throw new Error('Please log in');
    }

    // Make a request to the server to get the user data using the stored token
    const { data } = await axiosInstance.get('/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Dispatch success action with the user data
    dispatch({
      type: LOAD_USER_SUCCESS,
      payload: data,
    });
  } catch (error) {
    // Handle error in loading user data
    const errorMessage = getErrorMessage(error);
    dispatch({
      type: LOAD_USER_FAIL,
      payload: errorMessage,
    });
  }
};
// Logout action
export const logout = () => async (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });  // Clear errors before logging out
  try {
    await axiosInstance.post('/logout');
    removeToken();
    removeRefreshToken();
    dispatch({ type: LOGOUT_USER });
    window.location.reload(); // Optionally, force reload to initiate fresh login
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Logout failed:', error);  // Log error only in development
    }
    dispatch({
      type: LOGOUT_USER_FAIL,
      payload: error.message || 'Logout failed due to an error.',
    });
  }
};

// Refresh Token action
export const refreshToken = () => async (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });  // Clear errors before refreshing token
  dispatch({ type: REFRESH_TOKEN_REQUEST });

  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token, cannot refresh session');
    }

    const { data } = await axiosInstance.post('/refresh-token', { refreshToken });

    setToken(data.token);
    setRefreshToken(data.refreshToken);

    dispatch({
      type: REFRESH_TOKEN_SUCCESS,
      payload: data,
    });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    dispatch({
      type: REFRESH_TOKEN_FAIL,
      payload: errorMessage,
    });
  }
};

// Update User Profile Action
export const updateUserProfile = (userData) => async (dispatch, getState) => {
  dispatch({ type: CLEAR_ERRORS });  // Clear errors before updating profile
  try {
    dispatch({ type: UPDATE_USER_REQUEST });

    const { user } = getState().user;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.token}`,
      },
    };

    const { data } = await axiosInstance.put('/update-profile', userData, config);

    dispatch({
      type: UPDATE_USER_SUCCESS,
      payload: data.user,
    });

  } catch (error) {
    dispatch({
      type: UPDATE_USER_FAIL,
      payload: error.response ? error.response.data.message : error.message,
    });
  }
};

// Update User Password Action
export const updateUserPassword = (oldPassword, newPassword) => async (dispatch, getState) => {
  dispatch({ type: CLEAR_ERRORS });  // Clear errors before updating password
  try {
    dispatch({ type: UPDATE_USER_PASSWORD_REQUEST });

    const { user: { user } } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
    };

    const body = { oldPassword, newPassword };

    const response = await axiosInstance.put('/api/v1/user/update-password', body, config);

    dispatch({
      type: UPDATE_USER_PASSWORD_SUCCESS,
      payload: response.data.message,
    });
  } catch (error) {
    dispatch({
      type: UPDATE_USER_PASSWORD_FAIL,
      payload: error.response ? error.response.data.message : error.message,
    });
  }
};

// Clear errors action
export const clearErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};
