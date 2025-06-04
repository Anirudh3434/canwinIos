import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useRecommenedJob = () => {
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [recommendedError, setRecommendedError] = useState(null);

  const fetchRecommendedJobs = useCallback(async () => {
    setRecommendedLoading(true);

    try {
      // 1. Get userId
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.warn('❗ No user ID found in AsyncStorage.');
        return;
      }

      // 2. Get user skills
      const skillRes = await axios.get(`${API_ENDPOINTS.SKILLS}?user_id=${userId}`);
      const skillString = skillRes?.data?.data?.skill_name;

      if (!skillString || skillString.trim() === '') {
        console.warn('❗ No skills found for this user.');
        return;
      }

      // ✅ Only fetch jobs if skills are available
      const jobRes = await axios.get(API_ENDPOINTS.RECOMMEND_JOBS, {
        params: { skills: skillString },
      });

      setRecommendedJobs(jobRes.data.data.data);

      const today = new Date();

      const filteredJobs = jobRes.data.data.map((job) => {
        const [day, month, year] = job.created_at.split('-');
        const jobDate = new Date(`${year}-${month}-${day}`);
        const timeDiff = today - jobDate;
        const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        return {
          ...job,
          daysAgo: daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`,
        };
      });
      setRecommendedJobs(filteredJobs);
    } catch (err) {
      setRecommendedError(err);
      console.error('❌ Error fetching recommended jobs:', err);
    } finally {
      setRecommendedLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendedJobs();
  }, [fetchRecommendedJobs]);

  return {
    recommendedJobs,
    recommendedLoading,
    recommendedError,
    refetch: fetchRecommendedJobs,
  };
};

export default useRecommenedJob;
