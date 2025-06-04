import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';

const useRecentJobs = () => {
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState(null);

  const fetchRecentJobs = useCallback(async () => {
    setRecentLoading(true);
    try {
      const jobRes = await axios.get('https://devcrm20.abacasys.com/ords/canwinn/mobile_api/jobs');

      // Handle the data structure directly as an array without .data property
      const jobsArray = Array.isArray(jobRes.data) ? jobRes.data : jobRes.data.data || [];

      const today = new Date();

      const filteredJobs = jobsArray.map((job) => {
        const timeDiff = today - new Date(job.created_at);
        const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        return {
          ...job,
          daysAgo: daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`,
        };
      });
      const recentJobs = filteredJobs.filter(
        (job) =>
          job.daysAgo === 'Today' || job.daysAgo === '1 day ago' || job.daysAgo === '2 days ago'
      );
      setRecentJobs(recentJobs);
    } catch (err) {
      setRecentError(err);
      console.error('Error fetching recent jobs:', err);
    } finally {
      setRecentLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentJobs();
  }, [fetchRecentJobs]);

  return { recentJobs, recentLoading, recentError, refetch: fetchRecentJobs };
};

export default useRecentJobs;
