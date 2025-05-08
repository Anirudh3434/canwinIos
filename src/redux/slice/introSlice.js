import { createSlice } from '@reduxjs/toolkit';

const introductionSlice = createSlice({
  name: 'introduction',
  initialState: {
    fullName: '',
    profileHeadline: '',
    education: '',
    expertise: '',
  },
  reducers: {
    setFullName: (state, action) => {
      state.fullName = action.payload;
    },
    setProfileHeadline: (state, action) => {
      state.profileHeadline = action.payload;
    },
    setExpertise: (state, action) => {
      state.expertise = action.payload;
    },
    setIntroDetail: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setFullName, setProfileHeadline, setExpertise, setIntroDetail } =
  introductionSlice.actions;
export default introductionSlice.reducer;
