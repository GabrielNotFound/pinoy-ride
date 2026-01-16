import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: null,
  hasShownLoginSuccess: false,
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
  },
});

export const { setUserInfo, clearUserInfo, setHasShownLoginSuccess } =
  userSlice.actions;
export const selectUserInfo = state => state.user.userInfo;
export const selectHasShownLoginSuccess = state =>
  state.user.hasShownLoginSuccess;
export default userSlice.reducer;
