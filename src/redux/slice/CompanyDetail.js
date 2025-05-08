import { createSlice } from '@reduxjs/toolkit';

const CompanyDetailSlice = createSlice({
  name: 'CompanyDetail',
  initialState: {},
  reducers: {
    setCompanyDetails: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setCompanyDetails } = CompanyDetailSlice.actions;
export default CompanyDetailSlice.reducer;
