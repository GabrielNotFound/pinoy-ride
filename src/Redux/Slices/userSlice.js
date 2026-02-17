import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: null,
  hasShownLoginSuccess: false,
  savedPlaces: [], // Array of saved locations

  // ✅ NEW: Customer booking state (persisted across app restarts)
  activeBooking: null,
  bookingStatus: 0,
  riderDetails: null,
  pickupLocation: null,
  dropoffLocation: null,
  selectedService: null,
  isBooked: false,
  isConfirmed: false,
  inquireBookingResponse: null,
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
    setHasShownLoginSuccess: (state, action) => {
      state.hasShownLoginSuccess = action.payload;
    },

    // Saved Places Actions
    addSavedPlace: (state, action) => {
      const place = action.payload;

      if (!place.label || !place.address || !place.lat || !place.long) {
        console.warn('Invalid place data:', place);
        return;
      }
      state.savedPlaces.push(place);
    },
    updateSavedPlace: (state, action) => {
      const updatedPlace = action.payload;

      if (
        !updatedPlace.label ||
        !updatedPlace.address ||
        !updatedPlace.lat ||
        !updatedPlace.long
      ) {
        console.warn('Invalid place data:', updatedPlace);
        return;
      }

      const index = state.savedPlaces.findIndex(
        place => place.id === updatedPlace.id,
      );
      if (index !== -1) {
        state.savedPlaces[index] = updatedPlace;
      }
    },
    removeSavedPlace: (state, action) => {
      state.savedPlaces = state.savedPlaces.filter(
        place => place.id !== action.payload,
      );
    },
    clearSavedPlaces: state => {
      state.savedPlaces = [];
    },

    // ✅ NEW: Customer Booking Actions
    setActiveBooking: (state, action) => {
      state.activeBooking = action.payload;
    },
    setBookingStatus: (state, action) => {
      state.bookingStatus = action.payload;
    },
    setRiderDetails: (state, action) => {
      state.riderDetails = action.payload;
    },
    setPickupLocation: (state, action) => {
      state.pickupLocation = action.payload;
    },
    setDropoffLocation: (state, action) => {
      state.dropoffLocation = action.payload;
    },
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    setIsBooked: (state, action) => {
      state.isBooked = action.payload;
    },
    setIsConfirmed: (state, action) => {
      state.isConfirmed = action.payload;
    },
    setInquireBookingResponse: (state, action) => {
      state.inquireBookingResponse = action.payload;
    },
    // ✅ Clear all booking state (on completion/cancellation)
    clearBookingState: state => {
      state.activeBooking = null;
      state.bookingStatus = 0;
      state.riderDetails = null;
      state.pickupLocation = null;
      state.dropoffLocation = null;
      state.selectedService = null;
      state.isBooked = false;
      state.isConfirmed = false;
      state.inquireBookingResponse = null;
    },
  },
});

export const {
  setUserInfo,
  clearUserInfo,
  setHasShownLoginSuccess,
  addSavedPlace,
  updateSavedPlace,
  removeSavedPlace,
  clearSavedPlaces,
  // ✅ NEW: Booking actions
  setActiveBooking,
  setBookingStatus,
  setRiderDetails,
  setPickupLocation,
  setDropoffLocation,
  setSelectedService,
  setIsBooked,
  setIsConfirmed,
  setInquireBookingResponse,
  clearBookingState,
} = userSlice.actions;

// Existing selectors
export const selectUserInfo = state => state.user.userInfo;
export const selectHasShownLoginSuccess = state =>
  state.user.hasShownLoginSuccess;
export const selectSavedPlaces = state => state.user.savedPlaces;

// ✅ NEW: Booking selectors
export const selectActiveBooking = state => state.user.activeBooking;
export const selectBookingStatus = state => state.user.bookingStatus;
export const selectRiderDetails = state => state.user.riderDetails;
export const selectPickupLocation = state => state.user.pickupLocation;
export const selectDropoffLocation = state => state.user.dropoffLocation;
export const selectSelectedService = state => state.user.selectedService;
export const selectIsBooked = state => state.user.isBooked;
export const selectIsConfirmed = state => state.user.isConfirmed;
export const selectInquireBookingResponse = state =>
  state.user.inquireBookingResponse;

export default userSlice.reducer;
