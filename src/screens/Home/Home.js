'use client';

import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Image,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  BackHandler,
  ToastAndroid, // Import ToastAndroid for Android
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { Colors } from '../../theme/color';
import style from '../../theme/style';
import { useNavigation } from '@react-navigation/native';
import { AppBar } from '@react-native-material/core';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import { useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/slice/sideBarSlice';
const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;
import ProfileImageFallback from '../../Components/profileImageFallback';
import JobDetailModal from './JobDetail';
import useRecommenedJob from '../../hooks/Jobs/recommenedJob';
import useRecentJobs from '../../hooks/Jobs/recentAddJobs';
import JobSuccess from '../../Components/Popups/JobSuccess';

export default function  Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [successPop, setSuccessPop] = useState(false);
  const [jobDetailModalVisible, setJobDetailModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [docs, setDocs] = useState();
  const [backPressCount, setBackPressCount] = useState(0);
  const dispatch = useDispatch();

  const closeJobDetail = () => {
    setJobDetailModalVisible(false);
  };

  const fetchUserIdAndDetail = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        const response = await axios.get(API_ENDPOINTS.INTRODUCTION + `?user_id=${storedUserId}`);
        const docsResponse = await axios.get(API_ENDPOINTS.DOCS + `?user_id=${storedUserId}`);

        setDocs(docsResponse.data.data);
        setName(response.data.data.full_name);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const backAction = () => {
    if (jobDetailModalVisible) {
      setJobDetailModalVisible(false);
      return true;
    }

    if (successPop) {
      setSuccessPop(false);
      return true;
    }

    if (navigation.isFocused()) {
      BackHandler.exitApp();
      return true;
    }

    return false; // Ensure the default back behavior if none of the conditions are met
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [backPressCount, jobDetailModalVisible, successPop, navigation]);

  useEffect(() => {
    fetchUserIdAndDetail();

    // Better implementation of interval with cleanup
    const interval = setInterval(() => {
      fetchUserIdAndDetail();
    }, 3000); // Adjusted interval to 3 seconds

    // Cleanup interval when component unmounts
    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleSuccess = () => {
    setSuccessPop(true);
  };

  const {
    recommendedJobs,
    recommendedLoading,
    recommendedError,
    refetch: refetchRecommendedJobs,
  } = useRecommenedJob();



  const { recentJobs, recentLoading, recentError, refetch: refetchRecentJobs } = useRecentJobs();

  // Limit jobs to only 4
  const limitedRecommendedJobs = recommendedJobs?.slice(0, 4) || [];
  const limitedRecentJobs = recentJobs?.slice(0, 4) || [];

  // Handle refresh action
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refetch all data
      await Promise.all([
        fetchUserIdAndDetail(),
        refetchRecommendedJobs && refetchRecommendedJobs(),
        refetchRecentJobs && refetchRecentJobs(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchRecommendedJobs, refetchRecentJobs]);

  const handleJobPress = (job) => {
    setSelectedJob(job);
    setJobDetailModalVisible(true);
  };

  // Navigate to full job list views
  const navigateToAllRecommendedJobs = () => {
    navigation.navigate('recommendedJobsList', { jobs: 'recommendedJobs' });
  };

  const navigateToAllRecentJobs = () => {
    navigation.navigate('recommendedJobsList', { jobs: 'recentJobs' });
  };

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      {successPop && <JobSuccess setSuccessPop={setSuccessPop} />}

      <StatusBar backgroundColor={Colors.bg} translucent={false} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        {/* Main Content */}
        <View style={{ flex: 1 }}>
          {/* Header - Only show when sidebar is closed */}
          {!sidebarOpen && (
            <AppBar
              color={Colors.bg}
              elevation={6}
              style={{ paddingHorizontal: 10, paddingVertical: 10 }}
              leading={
                <View
                  style={{
                    width: 300,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      dispatch(toggleSidebar());
                    }}
                    style={{
                      width: 20,
                      height: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Image
                      style={{ width: 15, height: 15 }}
                      source={require('../../../assets/image/menu.png')}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('Search')}
                    style={{
                      width: 280,
                      borderWidth: 1,
                      marginLeft: 20,
                      height: 40,
                      borderColor: '#E8E8E8FF',
                      borderRadius: 20,
                      padding: 5,
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 5,
                    }}
                  >
                    <Icon name="search" size={16} color="#94A3B8" style={{ marginLeft: 8 }} />
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#94A3B8',
                        marginLeft: 8,
                        fontFamily: 'Poppins-small',
                      }}
                    >
                      Search job here
                    </Text>
                  </TouchableOpacity>
                </View>
              }
              trailing={
                <View style={{ flexDirection: 'row' }}>
                  <Image
                    style={{ width: 22, height: 22, objectFit: 'contain', marginRight: 0 }}
                    source={require('../../../assets/image/notification.png')}
                  />
                </View>
              }
            />
          )}

          <View style={[{ backgroundColor: Colors.bg, flex: 1, paddingBottom: 10 }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 0, paddingHorizontal: 10 }}
              scrollEventThrottle={16}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[Colors.primary]}
                  tintColor={Colors.primary}
                  title="Pull to refresh"
                  titleColor={Colors.active}
                />
              }
            >
              {/* User Cards */}
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={{ width: '100%', marginTop: 20, paddingRight: 10 }}
              >
                {/* Profile Card */}
                <View style={styles.card}>
                  <View style={styles.cardImageContainer}>
                    <Image
                      style={styles.cardImage}
                      source={
                        docs?.pp_url ==''
                          ? { uri: docs.pp_url }
                          : require('../../../assets/image/profileIcon.png')
                      }
                    />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>{name || 'User'}</Text>
                    <Text style={styles.cardSubtitle}>Updated 7d ago</Text>
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate('Profile');
                      }}
                    >
                      <Text style={styles.cardAction}>View Profile</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Search Appearance Card */}
                <View style={styles.card}>
                  <View style={styles.cardIconContainer}>
                    <View style={styles.cardIconCircle}>
                      <Text>13</Text>
                    </View>
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>Search appearence</Text>
                    <Text style={styles.cardSubtitle}>Last 90 days</Text>
                    <TouchableOpacity>
                      <Text style={styles.cardAction}>View all</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Recruiter Actions Card */}
                <View style={styles.card}>
                  <View style={styles.cardIconContainer}>
                    <View style={styles.cardIconCircle}>
                      <Text>13</Text>
                    </View>
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>Recruiter actions</Text>
                    <Text style={styles.cardSubtitle}>Last 90 days</Text>
                    <TouchableOpacity>
                      <Text style={styles.cardAction}>View all</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              {/* For You Section */}
              <Text
                style={[style.s18, { color: Colors.active, marginTop: 15, paddingHorizontal: 15 }]}
              >
                For you
              </Text>

              <View style={{ alignItems: 'center', marginTop: 10 }}>
                <Image
                  source={require('../../../assets/image/s8.png')}
                  resizeMode="stretch"
                  style={{ height: height / 5, width: width - 30 }}
                />
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 10,
                }}
              >
                <View style={[style.indicator]}></View>
                <View style={[style.indicator]}></View>
                <View
                  style={[
                    style.indicator,
                    { paddingHorizontal: 16, backgroundColor: Colors.primary },
                  ]}
                ></View>
              </View>

              {/* Recommended Jobs */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 20,
                  paddingHorizontal: 15,
                  justifyContent: 'space-between',
                }}
              >
                <Text style={[style.s18, { color: Colors.active }]}>Recommended Jobs</Text>

                <TouchableOpacity onPress={navigateToAllRecommendedJobs}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              {recommendedLoading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  style={{ paddingHorizontal: 10, marginTop: 10 }}
                >
                  {limitedRecommendedJobs?.length > 0 ? (
                    limitedRecommendedJobs.map((job, index) => (
                      <TouchableOpacity
                        key={`recommended-${index}`}
                        onPress={() => handleJobPress(job)}
                      >
                        <View style={styles.jobCardContainer}>
                          <View style={styles.jobCard}>
                            <View style={styles.jobCardHeader}>
                              {job.company_logo ? (
                                <Image
                                  source={{ uri: job.company_logo }}
                                  resizeMode="stretch"
                                  style={styles.jobCardLogo}
                                />
                              ) : (
                                <ProfileImageFallback
                                  size={40}
                                  fontSize={15}
                                  fullname={job.company_name}
                                />
                              )}
                            </View>

                            <View style={styles.jobCardContent}>
                              <View>
                                <Text style={[style.s16, { color: Colors.active }]}>
                                  {job.job_title?.length > 20
                                    ? job.job_title.slice(0, 20) + '...'
                                    : job.job_title}
                                </Text>
                                <Text>{job.company_name.toLowerCase()}</Text>
                              </View>

                              <View style={styles.jobCardLocation}>
                                <Icon name="location" size={12} color="#9A9A9A" />
                                <Text style={styles.jobCardLocationText}>{job.job_location}</Text>
                              </View>
                              <View style={styles.jobCardLocation}>
                                <Icon name="time-outline" size={12} color="#9A9A9A" />
                                <Text style={styles.jobCardLocationText}>{job.daysAgo}</Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyJobsContainer}>
                      <Icon name="briefcase-outline" size={30} color="#9A9A9A" />
                      <Text style={styles.emptyJobsText}>No recommended jobs available</Text>
                      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                        <Text style={styles.refreshButtonText}>Refresh</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              )}

              {/* Recent Jobs Section */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 20,
                  paddingHorizontal: 15,
                  justifyContent: 'space-between',
                }}
              >
                <Text style={[style.s18, { color: Colors.active }]}>Recent Jobs</Text>

                <TouchableOpacity onPress={navigateToAllRecentJobs}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              {recentLoading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  style={{ paddingHorizontal: 10, marginTop: 10, paddingBottom: 20 }}
                >
                  {limitedRecentJobs?.length > 0 ? (
                    limitedRecentJobs.map((job, index) => (
                      <TouchableOpacity key={`recent-${index}`} onPress={() => handleJobPress(job)}>
                        <View style={styles.jobCardContainer}>
                          <View style={styles.jobCard}>
                            <View style={styles.jobCardHeader}>
                              {job.company_logo ? (
                                <Image
                                  source={{ uri: job.company_logo }}
                                  resizeMode="stretch"
                                  style={styles.jobCardLogo}
                                />
                              ) : (
                                <ProfileImageFallback
                                  size={40}
                                  fontSize={15}
                                  fullname={job.company_name}
                                />
                              )}
                            </View>

                            <View style={styles.jobCardContent}>
                              <View>
                                <Text style={[style.s16, { color: Colors.active }]}>
                                  {job.job_title?.length > 20
                                    ? job.job_title.slice(0, 20) + '...'
                                    : job.job_title}
                                </Text>
                                <Text>{job.company_name}</Text>
                              </View>

                              <View style={styles.jobCardLocation}>
                                <Icon name="location" size={12} color="#9A9A9A" />
                                <Text style={styles.jobCardLocationText}>{job.job_location}</Text>
                              </View>
                              <View style={styles.jobCardLocation}>
                                <Icon name="time-outline" size={12} color="#9A9A9A" />
                                <Text style={styles.jobCardLocationText}>{job.daysAgo}</Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyJobsContainer}>
                      <Icon name="briefcase-outline" size={30} color="#9A9A9A" />
                      <Text style={styles.emptyJobsText}>No recent jobs available</Text>
                      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                        <Text style={styles.refreshButtonText}>Refresh</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Job Detail Modal */}
        <JobDetailModal
          visible={jobDetailModalVisible}
          onClose={closeJobDetail}
          job={selectedJob}
          onSuccess={handleSuccess}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  closeOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '80%',
    zIndex: 1001,
    backgroundColor: Colors.bg,
  },
  card: {
    minWidth: 220,
    height: 80,
    borderWidth: 1,
    borderColor: '#E8E8E8FF',
    borderRadius: 8,
    shadowColor: Colors.active,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    gap: 20,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  cardImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 100,
    overflow: 'hidden',
  },
  cardImage: {
    objectFit: 'contain',
    height: '100%',
    width: '100%',
  },
  cardIconContainer: {
    width: 40,
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 100,
    borderColor: '#E9E9E9',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: Colors.active,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  cardSubtitle: {
    color: '#94A3B8',
    fontSize: 8,
    fontFamily: 'Poppins-small',
  },
  cardAction: {
    fontWeight: '700',
    marginTop: 5,
    fontSize: 10,
    fontFamily: 'Poppins-small',
    color: '#7D53A1',
  },
  jobCardContainer: {
    padding: 5,
    marginBottom: 5,
    marginRight: 10,
  },
  jobCard: {
    borderWidth: 1,
    padding: 12,
    width: 250,
    height: 160,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderColor: '#E9E9E9',
    borderRadius: 8,
    shadowColor: Colors.active,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  jobCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  jobCardLogo: {
    height: 40,
    width: 40,
    borderRadius: 50,
  },
  jobCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  jobCardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  jobCardLocationText: {
    color: '#9A9A9A',
    marginLeft: 5,
    marginTop: 0,
    fontFamily: 'Poppins-small',
    fontSize: 10,
  },
  jobCardTime: {
    marginTop: 5,
    color: '#A6A5A5',
    fontSize: 10,
  },
  viewAllText: {
    color: '#7D53A1',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    fontWeight: '600',
  },
  loaderContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  emptyJobsContainer: {
    width: width - 30,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9E9E9',
    marginHorizontal: 5,
  },
  emptyJobsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#9A9A9A',
    marginTop: 10,
  },
  refreshButton: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
});