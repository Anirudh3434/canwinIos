import { configureStore } from '@reduxjs/toolkit';
import personalDetailsReducer from './slice/personalDetail';
import searchHistoryReducer from './slice/SearchHistorySlice';
import sidebarReducer from './slice/sideBarSlice';
import RoleReducer from './slice/RoleSlice';
import CompanyDetailSlice from './slice/CompanyDetail';
import  socialReducer  from './slice/socialLinkSlice';
import { Social } from 'react-native-share';

const store = configureStore({
  reducer: {
    personalDetails: personalDetailsReducer,
    searchHistory: searchHistoryReducer,
    sidebar: sidebarReducer,
    role: RoleReducer,
    companyDetail: CompanyDetailSlice,
    socialLink : socialReducer
    
  },
});

export default store;
