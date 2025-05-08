import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';

const useFetchJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getJobs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.JOBS);
      const jobData = response?.data?.data;

      console.log(' response', response);

      const today = new Date();

      const jobsWithDaysAgo = jobData.map((job) => {
        const [day, month, year] = job.created_at.split('-');
        const jobDate = new Date(`${year}-${month}-${day}`);

        const timeDiff = today - jobDate;
        const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        return {
          ...job,
          daysAgo: daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`,
        };
      });

      setJobs(jobsWithDaysAgo);
    } catch (err) {
      setError(err);
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getJobs();
  }, [getJobs]);

  console.log('Jobs:', jobs);

  return { jobs, loading, error, refetch: getJobs };
};

export default useFetchJobs;
