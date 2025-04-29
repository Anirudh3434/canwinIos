import { createSlice } from '@reduxjs/toolkit';

const basicDetailsSlice = createSlice({
  name: 'basicDetails',
  initialState: {},
  reducers: {
    setWorkStatus: (state, action) => {
      state.workStatus = action.payload;
    },
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload;
    },
    setMobileNumber: (state, action) => {
      state.mobileNumber = action.payload;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setAvailabilityToJoin: (state, action) => {
      state.availabilityToJoin = action.payload;
    },
    setBasicDetails: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  setWorkStatus,
  setCurrentCity,
  setMobileNumber,
  setEmail,
  setAvailabilityToJoin,
  setBasicDetails, // Export the new action
} = basicDetailsSlice.actions;
export default basicDetailsSlice.reducer;
