import { createSlice } from '@reduxjs/toolkit';

const educationSlice = createSlice({
  name: 'education',
  initialState: {
    educationList: [],
  },
  reducers: {
    addEducation: (state, action) => {
      state.educationList.push(action.payload);
    },
    removeEducation: (state, action) => {
      state.educationList = state.educationList.filter((edu) => edu.id !== action.payload);
    },
    updateEducation: (state, action) => {
      const index = state.educationList.findIndex((edu) => edu.id === action.payload.id);
      if (index !== -1) {
        state.educationList[index] = action.payload;
      }
    },
  },
});

export const { addEducation, removeEducation, updateEducation } = educationSlice.actions;
export default educationSlice.reducer;
