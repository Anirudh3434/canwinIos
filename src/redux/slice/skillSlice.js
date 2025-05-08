import { createSlice } from '@reduxjs/toolkit';

const SkillSlice = createSlice({
  name: 'skill',
  initialState: {
    skillList: [],
  },
  reducers: {
    addSkill: (state, action) => {
      // Check if skill with same ID already exists
      const exists = state.skillList.some((skill) => skill.id === action.payload.id);
      if (!exists) {
        state.skillList.push(action.payload);
      }
    },
    removeSkill: (state, action) => {
      state.skillList = state.skillList.filter((skill) => skill.id !== action.payload);
    },
  },
});

export const { addSkill, removeSkill } = SkillSlice.actions;
export default SkillSlice.reducer;
