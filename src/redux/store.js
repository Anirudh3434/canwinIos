import { configureStore } from '@reduxjs/toolkit';
import onboardReducer from './slice/onboardSlice';
import introductionReducer from './slice/introSlice';
import basicDetailsReducer from './slice/basicDetailSlice';
import educationReducer from './slice/eductionSlice';
import profileSummaryReducer from './slice/profileSummarySlice';
import professionalDetailsReducer from './slice/professionalDetailSlice';
import personalDetailsReducer from './slice/personalDetail';
import careerPreferenceReducer from './slice/careerPrefSlice';
import employmentReducer from './slice/employment';
import projectReducer from './slice/projectSlice';
import skillReducer from './slice/skillSlice';
import languageReducer from './slice/languageSlice';
import resumeBuilderReducer from './slice/ResumeBuilderSlice';
import socialLinkReducer from './slice/socialLinkSlice';
import searchHistoryReducer from './slice/SearchHistorySlice';
import sidebarReducer from './slice/sideBarSlice';
import CompanyDetailReducer from './slice/CompanyDetail';
import RoleReducer from './slice/RoleSlice';

const store = configureStore({
  reducer: {
    onboard: onboardReducer,
    introduction: introductionReducer,
    basicDetails: basicDetailsReducer,
    education: educationReducer,
    profileSummary: profileSummaryReducer,
    professionalDetails: professionalDetailsReducer,
    personalDetails: personalDetailsReducer,
    careerPreference: careerPreferenceReducer,
    employment: employmentReducer,
    project: projectReducer,
    skill: skillReducer,
    language: languageReducer,
    resumeBuilder: resumeBuilderReducer,
    socialLink: socialLinkReducer,
    searchHistory: searchHistoryReducer,
    sidebar: sidebarReducer,
    companyDetail: CompanyDetailReducer,
    role: RoleReducer,
  },
});

export default store;
