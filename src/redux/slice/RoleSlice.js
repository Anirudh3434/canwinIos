import { createSlice } from '@reduxjs/toolkit';

const RoleSlice = createSlice({
  name: 'role',
  initialState: { role: null },
  reducers: {
    setRole(state, action) {
      state.role = action.payload;
    },
  },
});
export const { setRole } = RoleSlice.actions;
export default RoleSlice.reducer; //export reducer to store.js
