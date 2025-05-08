import { useEffect, useState, useCallback } from 'react';
import { API_ENDPOINTS } from '../api/apiConfig';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setPersonalDetails } from '../redux/slice/personalDetail';
import { setEmploymentList } from '../redux/slice/employment';

export const useFetchProfileDetail = (id) => {
  const dispatch = useDispatch();

  const [profileDetail, setProfileDetail] = useState({
    PersonalDetail: {},
    employment: [],
    basicDetails: {},
    introduction: {},
    language: {},
    careerPreference: {},
    profileSummary: {},
    professionalDetail: {},
    education: [],
    skill: [],
    projects: [],
    docs: [],
  });

  const [loadingStates, setLoadingStates] = useState({
    global: false,
    personalDetails: false,
    employment: false,
    basicDetails: false,
    introduction: false,
    language: false,
    careerPreference: false,
    profileSummary: false,
    professionalDetail: false,
    education: false,
    skill: false,
    projects: false,
    docs: false,
  });

  const [errors, setErrors] = useState({});

  // Helper function to update loading state for a specific section
  const updateLoadingState = (section, isLoading) => {
    setLoadingStates((prev) => ({
      ...prev,
      [section]: isLoading,
    }));
  };

  // Helper function to update error state
  const updateError = (section, error) => {
    setErrors((prev) => ({
      ...prev,
      [section]: error,
    }));
  };

  // Generic fetch function to reduce code duplication
  const fetchData = useCallback(
    async (endpoint, section, params = {}, transformer = null) => {
      if (!id) return;

      updateLoadingState(section, true);

      try {
        const response = await axios.get(`${endpoint}`, {
          params: { user_id: id, ...params },
        });

        if (response.data.status === 'success') {
          const responseData = response.data.data;
          const transformedData = transformer ? transformer(responseData) : responseData;

          // Update local state
          setProfileDetail((prev) => ({
            ...prev,
            [section]: transformedData,
          }));

          // Special handling for redux dispatch actions
          if (section === 'PersonalDetail') {
            dispatch(setPersonalDetails(responseData));
          } else if (section === 'employment') {
            dispatch(setEmploymentList(responseData));
          }

          return transformedData;
        } else {
          const errorMessage = response.data.message || `Failed to fetch ${section}`;
          console.error(errorMessage);
          updateError(section, errorMessage);
          return null;
        }
      } catch (error) {
        const errorMessage = error.message || `${section} API Error`;
        console.error(`${section} API Error:`, error);
        updateError(section, errorMessage);
        return null;
      } finally {
        updateLoadingState(section, false);
      }
    },
    [id, dispatch]
  );

  // Main function to fetch all profile details
  const fetchAllDetails = useCallback(async () => {
    if (!id) return;

    setLoadingStates((prev) => ({ ...prev, global: true }));

    // Clear previous errors
    setErrors({});

    // Run all API calls in parallel
    await Promise.allSettled([
      fetchData(API_ENDPOINTS.PERSONAL_DETAILS, 'PersonalDetail'),
      fetchData(API_ENDPOINTS.EMPLOYMENT, 'employment'),
      fetchData(API_ENDPOINTS.BASIC_DETAILS, 'basicDetails'),
      fetchData(API_ENDPOINTS.INTRODUCTION, 'introduction'),
      fetchData(API_ENDPOINTS.LANGUAGE, 'language'),
      fetchData(API_ENDPOINTS.CAREER, 'careerPreference'),
      fetchData(API_ENDPOINTS.Profile_SUMMARY, 'profileSummary'),
      fetchData(API_ENDPOINTS.PROFESSIONAL_DETAIL, 'professionalDetail'),
      fetchData(API_ENDPOINTS.EDUCATION, 'education'),
      fetchData(API_ENDPOINTS.SKILLS, 'skill', {}, (data) => data?.skill_name?.split(',') || []),
      fetchData(API_ENDPOINTS.PROJECTS, 'projects'),
      fetchData(API_ENDPOINTS.DOCS, 'docs'),
    ]);

    setLoadingStates((prev) => ({ ...prev, global: false }));
  }, [id, fetchData]);

  // Function to refetch a specific section or all data
  const refetch = useCallback(
    (section = null) => {
      if (section) {
        // Refetch specific section
        const endpoints = {
          PersonalDetail: API_ENDPOINTS.PERSONAL_DETAILS,
          employment: API_ENDPOINTS.EMPLOYMENT,
          basicDetails: API_ENDPOINTS.BASIC_DETAILS,
          introduction: API_ENDPOINTS.INTRODUCTION,
          language: API_ENDPOINTS.LANGUAGE,
          careerPreference: API_ENDPOINTS.CAREER,
          profileSummary: API_ENDPOINTS.Profile_SUMMARY,
          professionalDetail: API_ENDPOINTS.PROFESSIONAL_DETAIL,
          education: API_ENDPOINTS.EDUCATION,
          skill: API_ENDPOINTS.SKILLS,
          projects: API_ENDPOINTS.PROJECTS,
          docs: API_ENDPOINTS.DOCS,
        };

        if (endpoints[section]) {
          const transformer =
            section === 'skill' ? (data) => data?.skill_name?.split(',') || [] : null;

          return fetchData(endpoints[section], section, {}, transformer);
        }
        return Promise.resolve(null);
      } else {
        // Refetch all data
        return fetchAllDetails();
      }
    },
    [fetchData, fetchAllDetails]
  );

  // Initial data fetch
  useEffect(() => {
    if (id) {
      fetchAllDetails();
    } else {
      console.log('No user ID available yet, skipping fetch');
    }
  }, [id, fetchAllDetails]);

  return {
    profileDetail,
    isLoading: loadingStates.global,
    loadingStates,
    errors,
    refetch,
  };
};
