import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';

const useSearchFetchJobs = (input) => {
  const [SearchJobs, setSearchJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('input:', input);

  const getJobs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.JOBS);
      const jobData = response?.data?.data || [];

      const today = new Date();

      const jobsWithDaysAgo = jobData.map(job => {
        const [day, month, year] = job.created_at.split('-');
        const jobDate = new Date(`${year}-${month}-${day}`);
        const timeDiff = today - jobDate;
        const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        return {
          ...job,
          daysAgo: daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`,
        };
      });

      const filteredJobs = jobsWithDaysAgo.filter(job => {
        const matchesSearch =
          job.company_name.toLowerCase().includes(input.input.toLowerCase()) ||
          job.job_title.toLowerCase().includes(input.input.toLowerCase()) ||
          job.department.toLowerCase().includes(input.input.toLowerCase()) ||
          job.job_skills
            .split(',')
            .map(skill => skill.trim().toLowerCase())
            .includes(input.input.toLowerCase());

        return matchesSearch;
      });

      setSearchJobs(filteredJobs);
    } catch (err) {
      setError(err);
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [input]);

  useEffect(() => {
    getJobs();
  }, []);

  console.log('SearchJobs:', SearchJobs);

  return { SearchJobs, loading, error, refetch: getJobs };
};

export default useSearchFetchJobs;