import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  StatusBar,
  KeyboardAvoidingView,
  TouchableOpacity,
  BackHandler,
  Platform,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/color';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Shortlisted from '../../Components/Cards/ShortlistedCard';
import { AppBar } from '@react-native-material/core';

const ShorlistedCandidate = () => {
  const navigation = useNavigation();

  const [shortlisted, setShortlisted] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortVisible, setSortVisible] = useState(false);
  const [userId, setUserId] = useState(null);

  // Fetch user ID from AsyncStorage
  const fetchUserId = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    } catch (error) {
      console.error('Error fetching user ID:', error);
    }
  };

  // Fetch shortlisted candidates
  const fetchInterviews = async () => {
    if (!userId) {
      console.log('User ID not found in AsyncStorage');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(API_ENDPOINTS.GET_ALL_JOB_APPLICANTS, {
        params: { user_id: +userId, status: 'Shortlisted' },
      });

      if (response.data && response.data.data) {
        setShortlisted(response.data.data);
      } else {
        setShortlisted([]);
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch interviews');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Initial load: fetch userId first, then fetch interviews when userId is available
  useEffect(() => {
    fetchUserId();
  }, []);

  // When userId changes, fetch interviews if userId exists
  useEffect(() => {
    if (userId) {
      fetchInterviews();
    }
  }, [userId]);

  const toggleSortMenu = () => {
    setSortVisible(!sortVisible);
  };

  const handleStatusSelect = (status) => {
    // Filter by status logic would go here
    console.log(`Filtering by status: ${status}`);
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
              <Text style={styles.headerTitle}>Shortlisted Candidates</Text>
            </View>
          }
        />

        <View style={styles.listContainer}>
          {isLoading ? (
            <Text style={styles.loadingText}>Loading interviews...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <FlatList
              data={shortlisted}
              renderItem={({ item }) => (
                <Shortlisted
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
                <Text style={styles.emptyText}>No shortlisted candidates found</Text>
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
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 5,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.primary,
    fontWeight: '500',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  dropdownContent: {
    padding: 8,
    minWidth: 180,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCCCCC',
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
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
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingVertical: 16,
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

export default ShorlistedCandidate;
