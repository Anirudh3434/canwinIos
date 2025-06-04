import { createSlice } from '@reduxjs/toolkit';

const newMessageSlice = createSlice({
  name: 'newMessage',
  initialState: {
    newMessage: false,
  },
  reducers: {
    setNewMessage: (state, action) => {
      state.newMessage = action.payload;
    },
  },
});

export const { setNewMessage } = newMessageSlice.actions;
export default newMessageSlice.reducer;
