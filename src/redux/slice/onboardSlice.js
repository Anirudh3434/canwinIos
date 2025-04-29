import { createSlice } from '@reduxjs/toolkit';

const onboardSlice = createSlice({
  name: 'onboard',
  initialState: {
    jobRole: '',
    location: '',
  },
  reducers: {
    setJobRole: (state, action) => {
      state.jobRole = action.payload;
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
  },
});

export const { setJobRole, setLocation } = onboardSlice.actions;
export default onboardSlice.reducer;
