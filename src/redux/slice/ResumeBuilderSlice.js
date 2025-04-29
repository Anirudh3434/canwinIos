import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  personalDetails: {
    fullName: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    profileImage: null,
  },
  employment: {
    employmentList: [],
  },
  education: {
    educationList: [],
  },
  projects: {
    projectList: [],
  },
  skills: {
    skillList: [],
  },
  socialLinks: {
    links: [],
  },
  additionalSections: {
    courses: [],
    internships: [],
    hobbies: [],
    languages: [],
  },
  resumePreview: {
    isPreviewReady: false,
    templateSelected: null,
  },
};

const resumeBuilderSlice = createSlice({
  name: 'resumeBuilder',
  initialState,
  reducers: {
    // Personal Details Actions
    updatePersonalDetails: (state, action) => {
      state.personalDetails = { ...state.personalDetails, ...action.payload };
    },

    // Employment Actions
    addOrUpdateEmployment: (state, action) => {
      const index = state.employment.employmentList.findIndex(
        (emp) => emp.id === action.payload.id
      );
      if (index === -1) {
        state.employment.employmentList.push(action.payload);
      } else {
        state.employment.employmentList[index] = action.payload;
      }
    },
    setEmploymentList: (state, action) => {
      state.employment.employmentList = action.payload;
    },
    removeEmployment: (state, action) => {
      state.employment.employmentList = state.employment.employmentList.filter(
        (emp) => emp.id !== action.payload
      );
    },

    // Education Actions
    addOrUpdateEducation: (state, action) => {
      const index = state.education.educationList.findIndex((edu) => edu.id === action.payload.id);
      if (index === -1) {
        state.education.educationList.push(action.payload);
      } else {
        state.education.educationList[index] = action.payload;
      }
    },
    setEducationList: (state, action) => {
      state.education.educationList = action.payload;
    },
    removeEducation: (state, action) => {
      state.education.educationList = state.education.educationList.filter(
        (edu) => edu.id !== action.payload
      );
    },

    // Projects Actions
    addOrUpdateProject: (state, action) => {
      const index = state.projects.projectList.findIndex(
        (project) => project.id === action.payload.id
      );
      if (index === -1) {
        state.projects.projectList.push(action.payload);
      } else {
        state.projects.projectList[index] = action.payload;
      }
    },
    setProjectList: (state, action) => {
      state.projects.projectList = action.payload;
    },
    removeProject: (state, action) => {
      state.projects.projectList = state.projects.projectList.filter(
        (project) => project.id !== action.payload
      );
    },

    // Skills Actions
    addOrUpdateSkill: (state, action) => {
      const index = state.skills.skillList.findIndex(
        (skill) => skill.skillName === action.payload.skillName
      );
      if (index === -1) {
        state.skills.skillList.push(action.payload);
      } else {
        state.skills.skillList[index] = action.payload;
      }
    },
    setSkillList: (state, action) => {
      state.skills.skillList = action.payload;
    },
    removeSkill: (state, action) => {
      state.skills.skillList = state.skills.skillList.filter(
        (skill) => skill.skillName !== action.payload.skillName
      );
    },

    // Social Links Actions
    addOrUpdateSocialLink: (state, action) => {
      const index = state.socialLinks.links.findIndex((link) => link.id === action.payload.id);
      if (index === -1) {
        state.socialLinks.links.push(action.payload);
      } else {
        state.socialLinks.links[index] = action.payload;
      }
    },
    setSocialLinks: (state, action) => {
      state.socialLinks.links = action.payload;
    },
    removeSocialLink: (state, action) => {
      state.socialLinks.links = state.socialLinks.links.filter(
        (link) => link.id !== action.payload
      );
    },

    // Additional Sections Actions
    addOrUpdateCourse: (state, action) => {
      const index = state.additionalSections.courses.findIndex(
        (course) => course.id === action.payload.id
      );
      if (index === -1) {
        state.additionalSections.courses.push(action.payload);
      } else {
        state.additionalSections.courses[index] = action.payload;
      }
    },
    setCourses: (state, action) => {
      state.additionalSections.courses = action.payload;
    },
    addOrUpdateInternship: (state, action) => {
      const index = state.additionalSections.internships.findIndex(
        (internship) => internship.id === action.payload.id
      );
      if (index === -1) {
        state.additionalSections.internships.push(action.payload);
      } else {
        state.additionalSections.internships[index] = action.payload;
      }
    },
    setInternships: (state, action) => {
      state.additionalSections.internships = action.payload;
    },
    addOrUpdateHobby: (state, action) => {
      const index = state.additionalSections.hobbies.findIndex(
        (hobby) => hobby.id === action.payload.id
      );
      if (index === -1) {
        state.additionalSections.hobbies.push(action.payload);
      } else {
        state.additionalSections.hobbies[index] = action.payload;
      }
    },
    setHobbies: (state, action) => {
      state.additionalSections.hobbies = action.payload;
    },
    addOrUpdateLanguage: (state, action) => {
      const index = state.additionalSections.languages.findIndex(
        (language) => language.id === action.payload.id
      );
      if (index === -1) {
        state.additionalSections.languages.push(action.payload);
      } else {
        state.additionalSections.languages[index] = action.payload;
      }
    },
    setLanguages: (state, action) => {
      state.additionalSections.languages = action.payload;
    },

    // Resume Preview Actions
    setResumePreview: (state, action) => {
      state.resumePreview = {
        isPreviewReady: true,
        templateSelected: action.payload,
      };
    },

    // Reset Entire Resume
    resetResume: () => initialState,
  },
});

export const {
  updatePersonalDetails,
  addOrUpdateEmployment,
  setEmploymentList,
  removeEmployment,
  addOrUpdateEducation,
  setEducationList,
  removeEducation,
  addOrUpdateProject,
  setProjectList,
  removeProject,
  addOrUpdateSkill,
  setSkillList,
  removeSkill,
  addOrUpdateSocialLink,
  setSocialLinks,
  removeSocialLink,
  addOrUpdateCourse,
  setCourses,
  addOrUpdateInternship,
  setInternships,
  addOrUpdateHobby,
  setHobbies,
  addOrUpdateLanguage,
  setLanguages,
  setResumePreview,
  resetResume,
} = resumeBuilderSlice.actions;

export default resumeBuilderSlice.reducer;
