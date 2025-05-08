import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  BackHandler,
  Alert,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import style from '../../theme/style';
import JobCard from '../../Components/Cards/JobCard';
import { AppBar } from '@react-native-material/core';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../theme/color';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { API_ENDPOINTS } from '../../api/apiConfig';

const ManageJob = () => {
  const navigation = useNavigation();
  
  const [userId, setUserId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortVisible, setSortVisible] = useState(false);
  const [statusVisible, setStatusVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState('');
  const [menuVisibleForJobId, setMenuVisibleForJobId] = useState(null);
  
  // Fetch user ID when component mounts
  useEffect(() => {
    fetchUserId();
  }, []);
  
  // Fetch job postings when userId changes
  useEffect(() => {
    if (userId) {
      fetchJobPosting();
    }
  }, [userId]);
  
  // Handle back button and refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('MyTabs');
        return true;
      };
      
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      // Refresh data when screen is focused
      fetchUserId();
      
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [navigation])
  );
  
  const fetchUserId = async () => {
    setIsLoading(true);
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
    try {
      const response = await axios.get(API_ENDPOINTS.FETCH_JOB_POSTING, {
        params: { user_id: userId, status: '' },
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
  
  const toggleMenu = (jobId) => {
    setMenuVisibleForJobId(prevId => prevId === jobId ? null : jobId);
    setSortVisible(false);
  };
  
  const toggleSortMenu = () => {
    setSortVisible(!sortVisible);
    setStatusVisible(false);
    setMenuVisibleForJobId(null);
  };
  
  const handleStatusSelect = (status) => {
    console.log(status);
    setStatusVisible(false);
  };
  
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
  
  const renderItem = ({ item, index }) => {
    return (
      <View>
        <JobCard
          job={item}
          onMenu={() => toggleMenu(item.job_id || index)}
          onEdit={() => navigation.navigate('AddJob', { job: item })}
          onDelete={() => handleDelete(item)}
          onRepost={() => handleRepost(item)}
        />
        
        {menuVisibleForJobId === (item.job_id || index) && (
          <View style={styles.menu}>
            <TouchableOpacity
              onPress={() => {
                setMenuVisibleForJobId(null);
                handleRepost(item);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Re-Post</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                setMenuVisibleForJobId(null);
                navigation.navigate('AddJob', { job: item });
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                setMenuVisibleForJobId(null);
                handleDelete(item);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.menuItemText, { color: '#DC1F1F' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={style.area}>
      <AppBar
        color={Colors.bg}
        elevation={1}
        style={{ paddingHorizontal: 10, paddingVertical: 10 }}
        leading={
          <View style={styles.headerLeading}>
            <TouchableOpacity onPress={() => navigation.navigate('MyTabs')}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Manage Job Listing</Text>
          </View>
        }
        trailing={
          <View>
            <TouchableOpacity
              onPress={toggleSortMenu}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
            >
              <Image
                source={require('../../../assets/image/filter.png')}
                style={styles.headerImage}
              />
              <Text style={styles.headerText}>Sort</Text>
            </TouchableOpacity>
            
            {/* Sort Dropdown */}
            {sortVisible && (
              <View style={styles.dropdown}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setSelectedSort('status');
                    setStatusVisible((prev) => !prev);
                  }}
                >
                  <View
                    style={[
                      styles.bullet,
                      {
                        backgroundColor: selectedSort === 'status' ? Colors.primary : 'gray',
                      },
                    ]}
                  />
                  <Text style={styles.menuText}>By Status</Text>
                </TouchableOpacity>
                
                {statusVisible &&
                  ['Active', 'Inactive', 'Draft'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={styles.menuItem}
                      onPress={() => {
                        handleStatusSelect(status);
                        setSortVisible(false);
                      }}
                    >
                      <Text style={styles.menuText}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                  
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setSelectedSort('date');
                    console.log('Sort by Date');
                    setSortVisible(false);
                  }}
                >
                  <View
                    style={[
                      styles.bullet,
                      {
                        backgroundColor: selectedSort === 'date' ? Colors.primary : 'gray',
                      },
                    ]}
                  />
                  <Text style={styles.menuText}>By Date</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
      />
      
      <View style={styles.container}>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text style={{ color: 'red' }}>{error}</Text>
        ) : (
          <FlatList
            data={applications}
            renderItem={renderItem}
            keyExtractor={(item, index) => (item.job_id || index.toString())}
            ListEmptyComponent={<Text>No job postings found</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ManageJob;

const styles = StyleSheet.create({
  headerLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.primary,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  headerImage: {
    width: 14,
    height: 14,
    tintColor: Colors.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  menuItemText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  menuText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.darkText || '#000',
  },
  dropdown: {
    position: 'absolute',
    top: 30,
    right: 0,
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  menu: {
    position: 'absolute',
    right: 10,
    top: 50,
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 10,
    paddingVertical: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 5,
  },
});