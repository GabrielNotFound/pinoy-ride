import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: null,
  hasShownLoginSuccess: false,
  savedPlaces: [], // Array of saved locations
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
} = userSlice.actions;

export const selectUserInfo = state => state.user.userInfo;
export const selectHasShownLoginSuccess = state =>
  state.user.hasShownLoginSuccess;
export const selectSavedPlaces = state => state.user.savedPlaces;

export default userSlice.reducer;
