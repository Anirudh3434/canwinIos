// SearchHistorySlice.js
import { createSlice } from '@reduxjs/toolkit';

const searchHistorySlice = createSlice({
  name: 'searchHistory',
  initialState: [],
  reducers: {
    addSearch: (state, action) => {
      // Add the new search to the state array
      state.push(action.payload);

      // Optional: Limit the number of saved searches (e.g., keep only the last 10)
      if (state.length > 10) {
        state.shift(); // Remove the oldest search
      }
    },
    clearSearchHistory: (state) => {
      return [];
    },
  },
});

export const { addSearch, clearSearchHistory } = searchHistorySlice.actions;
export default searchHistorySlice.reducer;
