import { createSlice, current } from '@reduxjs/toolkit';
import { addEducation } from './eductionSlice';

const PersonalDetailSlice = createSlice({
  name: 'PersonalDetail',
  initialState: {},
  reducers: {
    setPersonalDetails: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setPersonalDetails } = PersonalDetailSlice.actions;
export default PersonalDetailSlice.reducer;
