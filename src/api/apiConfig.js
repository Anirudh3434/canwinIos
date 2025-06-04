/*
 * Developed by Aman Kumar and Anirudh
 * Date: 2025-01-27
 * Description: This File is created to store the Api Configurations
 */

import Notification from '../screens/Home/Notification';

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
  DOCS: `${BASE_URL}/user-docs`,
  VISIBLE: `${BASE_URL}/user-visibility`,
  APPLICATION_COUNT: `${BASE_URL}/get-application-count`,

  NODE_SERVER: 'http://192.168.0.67:4000',

  GET_JOB_BY_ID: `${BASE_URL}/get-job-by-id`,
  CHAT_ACTIVE_STATUS: `${BASE_URL}/chat-active-status`,


  //Company API
  EMPLOYER: `${BASE_URL}/employers`,
  COMPANY_DETAILS: `${BASE_URL}/company-detail`,
  VERIFY_DOCS: `${BASE_URL}/verification-docs`,
  JOB_POSTING: `${BASE_URL}/jobs`,
  JOBS: `${BASE_URL}/jobs`,
  JOB_APPLY: `${BASE_URL}/apply_job`,
  RECOMMEND_JOBS: `${BASE_URL}/job-recommendation`,
  SAVE_JOBS: `${BASE_URL}/saved-jobs`,
  FETCH_JOB_APPlicants: `${BASE_URL}/job-applicants`,

  // Others API

  COUNTRY: `${BASE_URL}/countries`,
  STATE: `${BASE_URL}/states`,
  EDUCATION_LIST: `${BASE_URL}/education`,
  SKILL_LIST: `${BASE_URL}/skills`,
  JOB_DEPARTMENT: `${BASE_URL}/job-department`,
  JOB_CATEGORY: `${BASE_URL}/job-categories`,
  JOBS_FILTER: `${BASE_URL}/filtering`,
  FETCH_JOB_POSTING: `${BASE_URL}/emp-job-posted`,
  ADD_FCM: `${BASE_URL}/fcm_token`,
  FCM: `${BASE_URL}/get_fcm_token`,
  APPLICATION_LOGS: `${BASE_URL}/application_logs`,
  CHAT_ROOM: `${BASE_URL}/chat-room`,
  MESSAGE: `${BASE_URL}/message`,
  GET_NOTIFICATION: `${BASE_URL}/user_notifications`,

  GET_ALL_JOB_APPLICANTS: `${BASE_URL}/all-emp-application`,

  // Delete API

  DELETE_EDUCATION: `${BASE_URL}/delete_education`,
  DELETE_PROJECT: `${BASE_URL}/delete-project`,
  DELETE_EMPLOYMENT: `${BASE_URL}/delete_employmet_detail`,
  DELETE_LANGUAGE: `${BASE_URL}/delete_language`,
  DELETE_PROJECT: `${BASE_URL}/delete_projects`,
  UNSAVED_JOBS: `${BASE_URL}/delete_saved_jobs`,
  OFFER_LETTER: `${BASE_URL}/offer_letter`,
  SERVICE_PROVIDER: `${BASE_URL}/user_service`,
  GET_CHAT: `${BASE_URL}/get-chats`,
};

export { BASE_URL, API_ENDPOINTS };
