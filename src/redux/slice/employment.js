import { createSlice } from '@reduxjs/toolkit';

const employmentSlice = createSlice({
  name: 'employment',
  initialState: {
    employmentList: [],
  },
  reducers: {
    // Set entire employment list (for API fetches)
    setEmploymentList: (state, action) => {
      state.employmentList = action.payload;
    },
    // Add a single employment entry
    addEmployment: (state, action) => {
      // Check if payload is an array
      if (Array.isArray(action.payload)) {
        // Handle array case - merge with existing data rather than duplicating
        const newItems = action.payload.filter(
          (newItem) => !state.employmentList.some((existingItem) => existingItem.id === newItem.id)
        );
        state.employmentList = [...state.employmentList, ...newItems];
      } else {
        // Check if item with same ID already exists
        const exists = state.employmentList.some((item) => item.id === action.payload.id);
        if (!exists) {
          state.employmentList.push({
            id: action.payload.id || Date.now(),
            ...action.payload,
          });
        }
      }
    },
    updateEmployment: (state, action) => {
      const { id, ...updatedFields } = action.payload;
      const index = state.employmentList.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.employmentList[index] = { ...state.employmentList[index], ...updatedFields };
      }
    },
    deleteEmployment: (state, action) => {
      state.employmentList = state.employmentList.filter((item) => item.id !== action.payload);
    },
  },
});

export const { setEmploymentList, addEmployment, updateEmployment, deleteEmployment } =
  employmentSlice.actions;

export default employmentSlice.reducer;
