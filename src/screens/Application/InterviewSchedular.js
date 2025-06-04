import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  BackHandler,
  StatusBar,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  Image,
  SafeAreaView,
} from 'react-native';
import { AppBar } from '@react-native-material/core';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/color';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InterviewCard from '../../Components/Cards/interviewSchedular';

const InterviewScheduler = () => {
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState('Upcoming');
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortVisible, setSortVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  const [sortStatus, setSortStatus] = useState(null);

  // Fetch user ID from AsyncStorage
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          setUserId(id);
        } else {
          setError('User ID not found');
        }
      } catch (err) {
        console.error('Error fetching user ID:', err);
        setError('Error fetching user data');
      }
    };

    fetchUserId();
  }, []);

  // Fetch interviews when userId is available
  useEffect(() => {
    if (userId) {
      fetchInterviews();
    }
  }, [userId, activeTab, sortStatus]);

  const backAction = () => {
    if (navigation.isFocused()) {
      navigation.navigate('MyTabs');
      return true;
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [navigation]);

  const fetchInterviews = async () => {
    setIsLoading(true);

    console.log('sortStatus', sortStatus);

    try {
      const response = await axios.get(API_ENDPOINTS.GET_ALL_JOB_APPLICANTS, {
        params: {
          user_id: +userId,
          status: activeTab === 'Upcoming' ? 'Interview Scheduled' : 'Interview Completed',
        },
      });

      if (response.data && response.data.data) {
        setInterviews(response.data.data);
      } else {
        setInterviews([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      setError(error.message || 'Failed to fetch interviews');
      setIsLoading(false);
    }
  };

  // // Filter interviews based on active tab
  // const filteredInterviews = interviews.filter(interview => {
  //   if (activeTab === 'Upcoming') {
  //     return interview.status === 'Scheduled' || interview.status === 'Pending' || interview.status === 'Rescheduled';
  //   } else {
  //     return interview.status === 'Completed';
  //   }
  // });

  // Handle sort menu toggle
  const toggleSortMenu = () => {
    setSortVisible(!sortVisible);
  };

  // Handle status selection for filtering
  const handleStatusSelect = (status) => {
    setSortStatus(status);
    setSortVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.bg} barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        {/* Header */}
        <AppBar
          color={Colors.bg}
          elevation={1}
          style={{ paddingHorizontal: 10, paddingVertical: 10 }}
          leading={
            <View style={styles.headerLeading}>
              <TouchableOpacity onPress={() => navigation.navigate('MyTabs')}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Interview Scheduler</Text>
            </View>
          }
        />

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Upcoming' && styles.activeTab]}
            onPress={() => setActiveTab('Upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'Upcoming' && styles.activeTabText]}>
              Upcoming
            </Text>
            {activeTab === 'Upcoming' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'Completed' && styles.activeTab]}
            onPress={() => setActiveTab('Completed')}
          >
            <Text style={[styles.tabText, activeTab === 'Completed' && styles.activeTabText]}>
              Completed
            </Text>
            {activeTab === 'Completed' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* Interview List */}
        <View style={styles.listContainer}>
          {isLoading ? (
            <Text style={styles.loadingText}>Loading interviews...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <FlatList
              data={interviews}
              renderItem={({ item }) => (
                <InterviewCard
                  job={item}
                  onPress={() => navigation.navigate('JobDetails', { job: item })}
                />
              )}
              keyExtractor={(item) =>
                item?.applicant_user_id?.toString() || Math.random().toString()
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No {activeTab.toLowerCase()} interviews found</Text>
              }
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 5,
  },
  headerImage: {
    width: 14,
    height: 14,
    tintColor: Colors.primary,
  },

  tabContainer: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    position: 'relative',
  },
  activeTab: {
    borderBottomColor: '#FFCC2A',
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.disable,
  },
  activeTabText: {
    fontWeight: '500',
    color: '#000000',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FFCC2A',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#E8E8E8FF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  candidateName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginBottom: 4,
  },
  positionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  positionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.disable,
    marginRight: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.disable,
  },
  menuButton: {
    padding: 8,
  },
  menuDots: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  cardContent: {
    flexDirection: 'row',
    backgroundColor: '#F2FFFD',
    borderRadius: 10,
    padding: 10,
    overflow: 'hidden',
  },
  infoContainer: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    width: 120,
  },
  infoSeparator: {
    fontSize: 12,
    color: Colors.disable,
    marginHorizontal: 8,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
  },
  verticalBar: {
    width: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#757575',
  },
});

export default InterviewScheduler;
