/*
 * Developed by Aman Kumar and Anirudh
 * Date: 2025-01-27
 * Description: This File is created to store the Api Configurations
 */

const BASE_URL = 'https://devcrm20.abacasys.com/ords/canwinn/mobile_api';

const API_ENDPOINTS = {
  // Auth API

  REGISTER_USER: `${BASE_URL}/users`,
  AUTHENTICATION: `${BASE_URL}/authentication`,
  STEP: `${BASE_URL}/register-steps`,

  //Profile API

  PERSONAL_DETAILS: `${BASE_URL}/personal-detail`,
  EMPLOYMENT: `${BASE_URL}/user-employment-detail`,
  BASIC_DETAILS: `${BASE_URL}/user-basic-detail`,
  INTRODUCTION: `${BASE_URL}/user-introduction`,
  LANGUAGE: `${BASE_URL}/user-languages`,
  CAREER: `${BASE_URL}/career-preferences`,
  Profile_SUMMARY: `${BASE_URL}/profile-summary`,
  PROFESSIONAL_DETAIL: `${BASE_URL}/professional-detail`,
  EDUCATION: `${BASE_URL}/user-education`,
  PROJECTS: `${BASE_URL}/user-projects`,
  SKILLS: `${BASE_URL}/user-skills`,
  DOCS : `${BASE_URL}/user-docs`,
  VISIBLE : `${BASE_URL}/user-visibility`,

  //Company API
  EMPLOYER: `${BASE_URL}/employers`,
  COMPANY_DETAILS: `${BASE_URL}/company-detail`,
  JOB_POSTING: `${BASE_URL}/jobs`,
  JOBS: `${BASE_URL}/jobs`,
  JOB_APPLY: `${BASE_URL}/apply_job`,
  RECOMMEND_JOBS: `${BASE_URL}/job-recommendation`,

  // Others API

  COUNTRY: `${BASE_URL}/countries`,
  STATE: `${BASE_URL}/states`,
  EDUCATION_LIST: `${BASE_URL}/education`,
  SKILL_LIST: `${BASE_URL}/skills`,
  JOB_DEPARTMENT: `${BASE_URL}/job-department`,
  JOB_CATEGORY: `${BASE_URL}/job-categories`,
  JOBS_FILTER: `${BASE_URL}/filtering`,


  FETCH_JOB_POSTING: `${BASE_URL}/emp-job-posted`,

};

export { BASE_URL, API_ENDPOINTS };
