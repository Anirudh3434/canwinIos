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
import { API_ENDPOINTS } from '../../api/apiConfig';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../redux/slice/sideBarSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';
import JobCard from '../../Components/Cards/JobCard';
import JobSeekerCard from '../../Components/Cards/JobSeekerCard';
import ProfileImageFallback from '../../Components/profileImageFallback';

const width = Dimensions.get('screen').width;

export default function ComHome() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const dispatch = useDispatch();
  const [vacancies, setVacancies] = useState([]);
  const sidebarOpen = useSelector((state) => state.sidebar.isOpen);

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
      console.log('Fetching....');
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        console.log('Stored User ID:', storedUserId);

        if (storedUserId) {
          const introRes = await axios.get(
            API_ENDPOINTS.INTRODUCTION + `?user_id=${+storedUserId}`
          );
          setName(introRes.data.data.full_name);

          console.log('Job posting fetching....');

          const jobsRes = await axios.get(API_ENDPOINTS.FETCH_JOB_POSTING, {
            params: { user_id: +storedUserId, status: 'Active' },
          });
          const data = await jobsRes.data.data;
          console.log('Job postings:', data);
          setVacancies(data || []);
        }
      } catch (error) {
        console.error('Error fetching user data or job postings:', error);
      }
    };

    fetchData();
  }, []);

  console.log('Vacancies:', vacancies);

  const seeker = [
    { name: 'Aarav Mehta', date: '12 Jan, 2025', skills: ['JavaScript', 'React', 'Redux'] },
    { name: 'Aarav Mehta', date: '12 Jan, 2025', skills: ['JavaScript', 'React', 'Redux'] },
  ];

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
              <View
                style={{ flexDirection: 'row', gap: 20, marginRight: 10, alignItems: 'center' }}
              >
                <Image
                  style={{ width: 25, height: 25, objectFit: 'contain' }}
                  source={require('../../../assets/image/notification.png')}
                />
                <ProfileImageFallback press={handlePress} fullname={name} size={40} fontSize={20} />
              </View>
            }
          />

          <ScrollView>
            <View style={{ flex: 1, paddingVertical: 10 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Search')}
                style={styles.searchBox}
              >
                <Text style={styles.searchText}>Search job here</Text>
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

                {vacancies.length === 0 ? (
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
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {vacancies.map((item) => (
                      <JobCard
                        key={item.id}
                        job={item}
                        onSeeResume={() => {}}
                        onSeeDetails={() => {}}
                        home={true}
                      />
                    ))}
                  </ScrollView>
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
                  <Text style={styles.link}>See All</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {seeker.map((item, index) => (
                    <JobSeekerCard
                      key={index}
                      seeker={item}
                      onSeeResume={() => {}}
                      onSeeDetails={() => {}}
                    />
                  ))}
                </ScrollView>

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent People Applied</Text>
                  <Text style={styles.link}>See All</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {seeker.map((item, index) => (
                    <JobSeekerCard
                      key={index + '_recent'}
                      seeker={item}
                      onSeeResume={() => {}}
                      onSeeDetails={() => {}}
                    />
                  ))}
                </ScrollView>
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
