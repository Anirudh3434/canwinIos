import { createSlice } from '@reduxjs/toolkit';

const profileSummarySlice = createSlice({
  name: 'profileSummary',
  initialState: {
    profileSummary: 'Write profile summary here...',
  },
  reducers: {
    setProfileSummary: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setProfileSummary } = profileSummarySlice.actions;
export default profileSummarySlice.reducer;
