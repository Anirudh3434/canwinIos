import { createSlice } from '@reduxjs/toolkit';

const languageSlice = createSlice({
  name: 'language',
  initialState: {
    languageList: [],
  },
  reducers: {
    addLanguage: (state, action) => {
      state.languageList.push({ id: Date.now(), ...action.payload });
    },
    editLanguage: (state, action) => {
      const { id, languageName, proficiency, comfortable } = action.payload;
      const existingLanguage = state.languageList.find((lang) => lang.id === id);
      if (existingLanguage) {
        existingLanguage.languageName = languageName;
        existingLanguage.proficiency = proficiency;
        existingLanguage.comfortable = comfortable;
      }
    },
    deleteLanguage: (state, action) => {
      state.languageList = state.languageList.filter((lang) => lang.id !== action.payload);
    },
  },
});

export const { addLanguage, editLanguage, deleteLanguage } = languageSlice.actions;
export default languageSlice.reducer;
