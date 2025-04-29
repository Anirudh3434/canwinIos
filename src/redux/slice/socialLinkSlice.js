import { createSlice, current } from '@reduxjs/toolkit';

const SocialLinkSlice = createSlice({
  name: 'SocialLink',
  initialState: {
    linkedin: '',
    twitter: '',
    github: '',
    website: '',
  },
  reducers: {
    setSocialLinks: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setSocialLinks } = SocialLinkSlice.actions;
export default SocialLinkSlice.reducer;
