import { createSlice } from '@reduxjs/toolkit';

const projectSlice = createSlice({
  name: 'project',
  initialState: {
    projectList: [],
  },
  reducers: {
    addProject: (state, action) => {
      state.projectList.push({ id: Date.now(), ...action.payload });
    },
    editProject: (state, action) => {
      const { id, projectTitle, projectStatus, workFrom, workTill, projectDetail } = action.payload;
      const existingProject = state.projectList.find((project) => project.id === id);
      if (existingProject) {
        existingProject.projectTitle = projectTitle;
        existingProject.projectStatus = projectStatus;
        existingProject.workFrom = workFrom;
        existingProject.workTill = workTill;
        existingProject.projectDetail = projectDetail;
      }
    },
    deleteProject: (state, action) => {
      state.projectList = state.projectList.filter((project) => project.id !== action.payload);
    },
  },
});

export const { addProject, editProject, deleteProject } = projectSlice.actions;
export default projectSlice.reducer;
