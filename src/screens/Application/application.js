import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  ToastAndroid,
} from 'react-native';
import { AppBar } from '@react-native-material/core';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../theme/style';
import { Colors } from '../../theme/color';
import JobCard from '../../Components/Cards/JobCard';
import { API_ENDPOINTS } from '../../api/apiConfig';
import JobSeekerCard from '../../Components/Cards/JobSeekerCard';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const Application = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [menuVisibleForJobId, setMenuVisibleForJobId] = useState(null);
  const [selectedJobIndex, setSelectedJobIndex] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState('All Vacancies');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleJobApplicants = (index) => {
    setSelectedJobIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  // Helper function to show toast across platforms
  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else if (Platform.OS === 'ios') {
      // For iOS we'll use Alert as a fallback since there's no ToastIOS
      Alert.alert('', message, [{ text: 'OK' }], { cancelable: true });
    }
  };

  const handleJobClick = async (job) => {
    try {
      const response = await axios.get(API_ENDPOINTS.FETCH_JOB_APPlicants, {
        params: { job_id: job.job_id },
      });

      if (response.data && response.data.status === 'success') {
        const applicantsData = response.data.data;

        // Check if applicants are available before updating state
        if (!applicantsData || applicantsData.length === 0) {
          console.log('No applicants found for this job');
          showToast('No applicants found for this job');
          return;
        }

        // Create a copy of the applications array
        const updatedApplications = [...applications];

        // Find the specific job by job_id
        const jobIndex = updatedApplications.findIndex((item) => item.job_id === job.job_id);

        if (jobIndex !== -1) {
          // Update the job with applicants data
          updatedApplications[jobIndex] = {
            ...updatedApplications[jobIndex],
            applicants: applicantsData,
          };

          // Update the state with the new data
          setApplications(updatedApplications);

          // Automatically toggle the job applicants view
          toggleJobApplicants(jobIndex);
        }
      } else {
        showToast('No applicants found for this job');
      }
    } catch (error) {
      console.error('Error fetching job applicants:', error);
      showToast('No applicants found for this job');
    }
  };

  const fetchUserId = async () => {
    try {
      const storedUserid = await AsyncStorage.getItem('userId');
      if (storedUserid) {
        const parsedId = parseInt(storedUserid, 10);
        if (!isNaN(parsedId)) {
          setUserId(parsedId);
        } else {
          setError('Invalid user ID format');
        }
      } else {
        setError('User ID not found');
      }
    } catch (error) {
      setError('Error fetching user ID');
      console.error('Error fetching user ID:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJobPosting = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      let status = 'Active';
      if (selectedBadge === 'Inactive') {
        status = 'Inactive';
      }

      if (selectedBadge === 'All Vacancies') {
        status = '';
      }

      const response = await axios.get(API_ENDPOINTS.FETCH_JOB_POSTING, {
        params: { user_id: userId, status },
      });

      if (response.data && response.data.data) {
        setApplications(response.data.data);
      } else {
        setApplications([]);
      }
    } catch (error) {
      setError('Error fetching job postings');
      console.error('Error fetching job postings:', error);
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeeResume = (seeker) => {
    navigation.navigate('Resume', { seeker });
  };

  // Initialize user data
  useEffect(() => {
    fetchUserId();
  }, []);

  // Fetch job postings when userId or selectedBadge changes
  useEffect(() => {
    if (userId) {
      fetchJobPosting();
    }
  }, [userId, selectedBadge]);

  const toggleMenu = (jobId) => {
    setMenuVisibleForJobId((prevId) => (prevId === jobId ? null : jobId));
  };

  const badgeOptions = ['All Vacancies', 'Active', 'Inactive'];

  const renderEmptyState = () => (
    <View style={styles.mainContainer}>
      <Image
        style={styles.image}
        source={require('../../../assets/image/NoApplication.png')}
        defaultSource={require('../../../assets/image/NoApplication.png')}
      />
      <Text style={styles.title}>Empty</Text>
      <Text style={styles.description}>
        Create a job vacancy for your company and start finding new high-quality employees
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('AddJob')}
        style={styles.button}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Create vacancies</Text>
      </TouchableOpacity>
    </View>
  );

  const handleRepost = (job) => {
    if (!job) {
      Alert.alert('Error', 'Invalid job data');
      return;
    }

    const payload = {
      employer_id: job.employer_id || userId,
      job_title: job.job_title || '',
      job_description: job.job_description || '',
      job_category_id: job.job_category_id || 0,
      created_at: job.created_at || new Date().toISOString(),
      workplace_type: job.WORKPLACE_TYPE || '',
      min_experience: job.MIN_EXPERIENCE || 0,
      max_experience: job.MAX_EXPERIENCE || 0,
      min_salary: job.MIN_SALARY || 0,
      max_salary: job.MAX_SALARY || 0,
      department: job.DEPARTMENT || '',
      employment_type: job.EMPLOYMENT_TYPE || '',
      receive_applicants_by: job.RECEIVE_APPLICANTS_BY || '',
      email: job.EMAIL || '',
      company_id: job.COMPANY_ID || 0,
      job_skills: job.JOB_SKILLS || '',
      job_location: job.JOB_LOCATION || '',
      job_requirements: job.JOB_REQUIRMENTS || '',
      education: job.EDUCATION || '',
      status: job.STATUS || 'Active',
    };

    Alert.alert(
      'Confirm Repost',
      'Are you sure you want to repost this job?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const response = await axios.post(API_ENDPOINTS.JOB_POSTING, payload);
              if (response.data) {
                Alert.alert('Success', 'Job reposted successfully');
                fetchJobPosting();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to repost job');
              console.error('Error reposting job:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDelete = (job) => {
    if (!job || !job.job_id) {
      Alert.alert('Error', 'Invalid job data');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this job posting?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Replace with your actual delete endpoint
              await axios.delete(`${API_ENDPOINTS.JOB_POSTING}/${job.job_id}`);
              Alert.alert('Success', 'Job deleted successfully');
              fetchJobPosting();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete job');
              console.error('Error deleting job:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (isLoading && !applications.length) {
    return (
      <SafeAreaView style={[style.area, styles.safeArea]}>
        <AppBar
          color="white"
          elevation={0}
          centerTitle
          title="Application"
          titleStyle={styles.appBarTitle}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !applications.length) {
    return (
      <SafeAreaView style={[style.area, styles.safeArea]}>
        <AppBar
          color="white"
          elevation={0}
          centerTitle
          title="Application"
          titleStyle={styles.appBarTitle}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserId} activeOpacity={0.7}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[style.area, styles.safeArea]}>
      <AppBar
        color="white"
        elevation={0}
        centerTitle
        title="Application"
        titleStyle={styles.appBarTitle}
      />

      {applications.length > 0 && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddJob')}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}

      {/* Search Bar */}
      {selectedJobIndex === null && applications.length > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate('Search')}
          style={styles.searchContainer}
          activeOpacity={0.7}
        >
          <Text style={styles.searchText}>Search job here</Text>
          <Icon name="search" size={16} color="#94A3B8" />
        </TouchableOpacity>
      )}

      {/* Badge Container */}
      <View style={styles.badgeContainer}>
        {badgeOptions.map((badge) => (
          <TouchableOpacity
            key={badge}
            style={selectedBadge === badge ? styles.badge : styles.unSelectedBadge}
            onPress={() => setSelectedBadge(badge)}
            activeOpacity={0.7}
          >
            <Text style={selectedBadge === badge ? styles.badgeText : styles.unSelectedBadgeText}>
              {badge}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Application List or Empty State */}
      {applications.length > 0 ? (
        <FlatList
          data={applications}
          keyExtractor={(item, index) => (item.job_id ? item.job_id.toString() : `job-${index}`)}
          renderItem={({ item, index }) => (
            <View key={item.job_id || index} style={styles.listContainer}>
              <View style={{ zIndex: 1 }}>
                <JobCard
                  job={item}
                  onClick={() => {
                    handleJobClick(item);
                  }}
                  home={true}
                />
              </View>

              {selectedJobIndex === index &&
                item.applicants?.length > 0 &&
                (() => {
                  const filteredApplicants = item.applicants.filter(
                    (applicant) =>
                      !['shortlisted', 'schedule', 'reject'].includes(
                        applicant.application_status.toLowerCase()
                      )
                  );

                  if (filteredApplicants.length === 0) {
                    showToast('No applicants found for this job');
                    setSelectedJobIndex(null);
                  }

                  return (
                    <View style={styles.applicantContainer}>
                      <Text style={styles.applicantTitle}>Applicants</Text>

                      <FlatList
                        data={filteredApplicants}
                        keyExtractor={(applicant, appIndex) => `applicant-${appIndex}`}
                        renderItem={({ item: applicant }) => (
                          <JobSeekerCard
                            seeker={applicant}
                            onSeeResume={() => {}}
                            onSeeDetails={() => navigation.navigate('VistorProfile', { applicant })}
                          />
                        )}
                        contentContainerStyle={styles.applicantListContainer}
                      />
                    </View>
                  );
                })()}
            </View>
          )}
          contentContainerStyle={styles.mainListContainer}
        />
      ) : (
        renderEmptyState()
      )}
    </SafeAreaView>
  );
};

export default Application;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'white',
    flex: 1,
  },
  appBarTitle: {
    color: Colors.active,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
  addButton: {
    zIndex: 999,
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#80559A',
    padding: 10,
    borderRadius: 50,
    elevation: 5,
  },
  searchContainer: {
    width: '90%',
    height: 40,
    borderWidth: 1,
    borderColor: '#E8E8E8FF',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: 'white',
  },
  searchText: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: 'Poppins-Regular',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: Colors.txt,
    marginBottom: 10,
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.txt,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  mainListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80, // Extra padding to account for the floating action button
  },
  listContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  applicantContainer: {
    width: '100%',
    borderRadius: 10,
    marginTop: 10,
  },
  applicantTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: Colors.active,
    marginBottom: 10,
  },
  applicantListContainer: {
    gap: 10,
  },
  badgeContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unSelectedBadge: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  unSelectedBadgeText: {
    color: Colors.primary,
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  menu: {
    position: 'absolute',
    width: 120,
    top: 50,
    right: 10,
    backgroundColor: 'white',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    zIndex: 100,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  menuItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.txt,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#DC1F1F',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
});
