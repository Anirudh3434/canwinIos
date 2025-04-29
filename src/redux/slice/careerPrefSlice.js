import { createSlice } from '@reduxjs/toolkit';

const CareerPreferenceSlice = createSlice({
  name: 'CareerPreference',
  initialState: {},
  reducers: {
    setCareerPreference: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setCareerPreference } = CareerPreferenceSlice.actions;
export default CareerPreferenceSlice.reducer;
