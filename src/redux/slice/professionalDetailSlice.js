import { createSlice, current } from '@reduxjs/toolkit';
import { addEducation } from './eductionSlice';

const ProfessionalDetailSlice = createSlice({
  name: 'ProfessionalDetail',
  initialState: {},
  reducers: {
    setProfessionalDetails: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setProfessionalDetails } = ProfessionalDetailSlice.actions;
export default ProfessionalDetailSlice.reducer;
