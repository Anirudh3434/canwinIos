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
  BackHandler,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors } from '../../theme/color';
import style from '../../theme/style';
import { useNavigation } from '@react-navigation/native';
import { AppBar } from '@react-native-material/core';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import messaging from '@react-native-firebase/messaging';
import { API_ENDPOINTS } from '../../api/apiConfig';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../redux/slice/sideBarSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';
import JobCard from '../../Components/Cards/JobCard';
import JobSeekerCard from '../../Components/Cards/JobSeekerCard';

const width = Dimensions.get('screen').width;

export default function ComHome() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const dispatch = useDispatch();
  const [vacancies, setVacancies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentSeeker, setRecentSeeker] = useState([]);
  const sidebarOpen = useSelector((state) => state.sidebar.isOpen);
  const [fcmToken, setFcmToken] = useState(null);
  const [flag, setFlag] = useState(true);

  const handlePress = () => {
    navigation.navigate('Profile');
  };

  const backAction = () => {
    if (navigation.isFocused()) {
      BackHandler.exitApp();
      return true;
    }
    return false;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const storedUserId = await AsyncStorage.getItem('userId');

        if (storedUserId) {
          const introRes = await axios.get(
            API_ENDPOINTS.INTRODUCTION + `?user_id=${+storedUserId}`
          );
          setName(introRes.data.data.full_name);

          const jobsRes = await axios.get(API_ENDPOINTS.FETCH_JOB_POSTING, {
            params: { user_id: +storedUserId, status: 'Active' },
          });
          const data = jobsRes.data.data;
          setVacancies(data || []);
        }
      } catch (error) {
        console.error('Error fetching user data or job postings:', error);
        // Set vacancies to empty array in case of error
        setVacancies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    FetchRecentSeeker();
  }, []);

  const getFCMToken = async () => {
    try {
      const token = await messaging().getToken();
      setFcmToken(token);
      setFlag(false);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  };

  const FetchRecentSeeker = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');

      console.log('storedUserId', storedUserId);

      if (storedUserId) {
        const jobsRes = await axios.get(API_ENDPOINTS.GET_ALL_JOB_APPLICANTS, {
          params: { user_id: +storedUserId },
        });
        const data = jobsRes.data.data;
        setRecentSeeker(data || []);
      }
    } catch (error) {
      console.error('Error fetching user data or job postings:', error);
      // Set vacancies to empty array in case of error
      setRecentSeeker([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (flag) {
      getFCMToken();
    }
    requestUserPermission();
  }, []);


  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }
  };

  const sendFCMToken = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      console.log('fcmToken', fcmToken);
      if (storedUserId) {
        const response = await axios.put(API_ENDPOINTS.ADD_FCM, {
          user_id: +storedUserId,
          fcm_token: fcmToken,
        });
      }
    } catch (error) {
      console.error('Error sending FCM token:', error);
    }
  };


  useEffect(() => {
    if (fcmToken) {
      sendFCMToken();
    }
  }, [fcmToken]);

  console.log('recentSeeker', recentSeeker);

  // Initialize seeker array with default data
  const seeker = [];

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg, paddingBottom: 10 }]}>
      <StatusBar backgroundColor={Colors.bg} translucent={false} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={{ flex: 1 }}>
          <AppBar
            color={Colors.bg}
            elevation={6}
            style={{ paddingHorizontal: 10, paddingVertical: 10 }}
            leading={
              <View style={{ width: 250, flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                <TouchableOpacity
                  onPress={() => dispatch(toggleSidebar())}
                  style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Image
                    style={{ width: 14, height: 14 }}
                    source={require('../../../assets/image/menu.png')}
                  />
                </TouchableOpacity>
                <Text style={styles.nameText}>{name || 'User'}</Text>
              </View>
            }
            trailing={
              <TouchableOpacity
                onPress={() => navigation.navigate('Notification')}
                style={{ flexDirection: 'row', gap: 20, marginRight: 10, alignItems: 'center' }}
              >
                <Image
                  style={{ width: 25, height: 25, objectFit: 'contain' }}
                  source={require('../../../assets/image/notification.png')}
                />
              </TouchableOpacity>
            }
          />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ flex: 1, paddingVertical: 10 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('SearchCandiate')}
                style={styles.searchBox}
              >
                <Text style={styles.searchText}>Search Candidates</Text>
                <Icon name="search" size={16} color="#94A3B8" />
              </TouchableOpacity>

              <View style={{ padding: 20 }}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>My Vacancies</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Application')}
                    style={styles.link}
                  >
                    <Text style={styles.link}>See All</Text>
                  </TouchableOpacity>
                </View>

                {isLoading ? (
                  <View style={styles.fallbackContainer}>
                    <Text>Loading vacancies...</Text>
                  </View>
                ) : vacancies && vacancies.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {vacancies.map((item) => (
                      <JobCard
                        key={item.job_id}
                        job={item}
                        onclickl={() => navigation.navigate('JobDetail', { job: item })}
                        onSeeResume={() => {}}
                        onSeeDetails={() => {}}
                        home={true}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.fallbackContainer}>
                    <Text style={styles.fallbackTitle}>No Vacancies Yet</Text>
                    <Text style={styles.fallbackSubtitle}>
                      Start posting jobs to attract the right talent.
                    </Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('AddJob')}
                      style={styles.postJobBtn}
                    >
                      <Ionicons name="add-circle-outline" size={16} color="#fff" />
                      <Text style={styles.postJobBtnText}>Post Your First Job</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.resumeSection}>
                  <Text>Only 4 resume left Today!</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('PlanPage')}
                    style={styles.upgradeButton}
                  >
                    <Ionicons name="flash" size={12} color="white" />
                    <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Suggested Candidates</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('SuggestedCandidates')}>
                    <Text style={styles.link}>See All</Text>
                  </TouchableOpacity>
                </View>

                {seeker && seeker.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {seeker.map((item, index) => (
                      <JobSeekerCard
                        key={`suggested_${index}`}
                        onclick={() => navigation.navigate('JobDetail', { job: item })}
                        onSeeResume={() => {}}
                        onSeeDetails={() => {}}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.fallbackContainer}>
                    <Text style={styles.fallbackSubtitle}>No suggested candidates available.</Text>
                  </View>
                )}

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent People Applied</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('RecentApplications')}>
                    <Text style={styles.link}>See All</Text>
                  </TouchableOpacity>
                </View>

                {recentSeeker && recentSeeker.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {recentSeeker.map((item, index) => {
                      let customitem = {
                        application_id: item.application_id,
                        user_id: item.applicant_user_id,
                        application_status: item.application_status,
                        job_id: item.job_id,
                      };
                      return (
                        <JobSeekerCard
                          seeker={customitem}
                          onSeeResume={() => {}}
                          onSeeDetails={() =>
                            navigation.navigate('VistorProfile', { applicant: item })
                          }
                        />
                      );
                    })}
                  </ScrollView>
                ) : (
                  <View style={styles.fallbackContainer}>
                    <Text style={styles.fallbackSubtitle}>No recent applications.</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nameText: {
    marginTop: 5,
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  searchBox: {
    width: '90%',
    borderWidth: 1,
    marginLeft: 20,
    height: 40,
    borderColor: '#E8E8E8FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  searchText: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'Poppins-small',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  link: {
    fontFamily: 'Poppins-Medium',
    color: Colors.primary,
    fontSize: 14,
  },
  resumeSection: {
    backgroundColor: '#14B6AA0A',
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButton: {
    backgroundColor: 'blue',
    padding: 5,
    borderRadius: 20,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Poppins-small',
  },

  fallbackContainer: {
    alignItems: 'center',
    height: 150,
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
  },
  fallbackImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
    resizeMode: 'contain',
    opacity: 0.7,
  },
  fallbackTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 5,
  },
  fallbackSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#888',
    textAlign: 'center',
    marginBottom: 10,
  },
  postJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 25,
    gap: 6,
  },
  postJobBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
});
