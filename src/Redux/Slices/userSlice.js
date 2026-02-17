import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: null,

  // ✅ NEW: Rider booking state (persisted across app restarts)
  riderActiveBooking: null,
  riderBookingStatus: 1, // Button status: 1-4
  riderSelectedVehicleId: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    clearUserInfo: state => {
      state.userInfo = null;
    },

    // ✅ NEW: Rider Booking Actions
    setRiderActiveBooking: (state, action) => {
      state.riderActiveBooking = action.payload;
    },
    setRiderBookingStatus: (state, action) => {
      state.riderBookingStatus = action.payload;
    },
    setRiderSelectedVehicleId: (state, action) => {
      state.riderSelectedVehicleId = action.payload;
    },
    clearRiderBookingState: state => {
      state.riderActiveBooking = null;
      state.riderBookingStatus = 1;
      state.riderSelectedVehicleId = null;
    },
  },
});

export const {
  setUserInfo,
  clearUserInfo,
  // ✅ NEW: Rider actions
  setRiderActiveBooking,
  setRiderBookingStatus,
  setRiderSelectedVehicleId,
  clearRiderBookingState,
} = userSlice.actions;

// Existing selectors
export const selectUserInfo = state => state.user.userInfo;

// ✅ NEW: Rider selectors
export const selectRiderActiveBooking = state => state.user.riderActiveBooking;
export const selectRiderBookingStatus = state => state.user.riderBookingStatus;
export const selectRiderSelectedVehicleId = state =>
  state.user.riderSelectedVehicleId;

export default userSlice.reducer;
