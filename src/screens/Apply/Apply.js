import {
  View,
  Text,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  Modal,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { Colors } from '../../theme/color';
import style from '../../theme/style';
import { useNavigation } from '@react-navigation/native';
import { AppBar } from '@react-native-material/core';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_ENDPOINTS } from '../../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function Apply() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setError('User ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(API_ENDPOINTS.JOB_APPLY, {
        params: { user_id: userId },
      });

      const res = response?.data;
      console.log('res', res);
      if (res?.status === 'success') {
        setApplications(res?.data || []);
      } else {
        setError('Failed to fetch applications');
      }
    } catch (error) {
      console.error('API Error:', error);
      setError('Something went wrong while fetching applications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  console.log(applications);

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Image style={styles.emptyImage} source={require('../../../assets/image/NoApply.png')} />
        <Text style={styles.title}>You haven't applied yet!</Text>
        <Text style={styles.subtitle}>
          Search for jobs and start applying. You can track your applications here!
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Search')}
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Start my job search</Text>
        </TouchableOpacity>
      </View>
    ),
    [navigation]
  );

  const renderJobCard = async ({ item }) => {
    const logs = await axios.get(API_ENDPOINTS.APPLICATION_LOGS, {
      params: { application_id: item.application_id },
    });

    const status = logs?.data?.data[0]?.new_status;
    const date = logs?.data?.data[0]?.created_at;

    console.log('status', status);
    console.log('date', date);

    const todayDate = new Date();
    const applicationDate = new Date(date);

    const timeDiff = todayDate.getTime() - applicationDate.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    console.log('dayDiff', dayDiff);

    return (
      <View style={styles.card}>
        <View style={styles.jobDetails}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ApplicationTrack', { item: item })}
            activeOpacity={0.7}
          >
            <Text style={styles.cardTitle}>{item.job_title}</Text>
            <Text style={styles.cardText}>{item.company_name}</Text>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="gray" />
              <Text style={styles.detailText}>{item.job_location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="briefcase-outline" size={16} color="gray" />
              <Text style={styles.detailText}>
                {item.min_experience}-{item.max_experience} years{' '}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 1 }}>
            <View style={[styles.detailRow, { marginTop: 10 }]}>
              <Text
                style={[
                  styles.detailText,
                  {
                    color:
                      status === 'Rejected'
                        ? 'red'
                        : status === 'Shortlisted' ||
                          status === 'Interview Scheduled' ||
                          status === 'Interview Completed' ||
                          status === 'Offer Letter Sent'
                        ? Colors.primary
                        : '#6C6C6C',
                  },
                ]}
              >
                {status}
              </Text>
            </View>
            <View style={[styles.detailRow, { marginTop: 10 }]}>
              <Text style={styles.detailText}>
                {dayDiff == 0 ? 'Today' : dayDiff + ' days ago'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <Image source={{ uri: item.company_logo }} style={styles.jobImage} resizeMode="contain" />
          <View style={styles.ratingInfo}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color="#FFC107" />
              <Text style={styles.rating}>3.5</Text>
            </View>
            <Text style={styles.reviews}>(5 reviews)</Text>
          </View>
        </View>
      </View>
    );
  };

  // Main render function
  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar translucent={false} backgroundColor={Colors.bg} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <View style={[{ backgroundColor: Colors.bg }]}>
          <View style={styles.header}>
            <Ionicons
              name="arrow-back"
              size={24}
              color="black"
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.headerTitle}>Tracking Your Applied Jobs</Text>
          </View>

          {/* Error message if there's an error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchApplications}
                activeOpacity={0.7}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Content area */}
          {loading && applications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.subtitle}>Loading applications...</Text>
            </View>
          ) : applications.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={applications}
              renderItem={renderJobCard}
              keyExtractor={(item) => item.application_id.toString()}
              contentContainerStyle={styles.applicationsList}
              showsVerticalScrollIndicator={false}
              refreshing={refreshing}
              onRefresh={onRefresh}
              initialNumToRender={5}
              maxToRenderPerBatch={10}
              windowSize={5}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    width: '100%',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: Platform.OS === 'ios' ? 0 : 20,
  },
  headerTitle: {
    fontSize: 20,
    paddingTop: 10,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 10,
  },
  emptyImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  applicationsList: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 27,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginHorizontal: 20,
    color: '#666',
  },
  button: {
    marginTop: 40,
    borderRadius: 10,
    width: 250,
    height: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Poppins-Medium',
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    marginVertical: 15,
    marginLeft: 5,
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobId: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  cardContent: {
    marginBottom: 15,
  },
  jobTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 5,
  },
  jobCompany: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#555',
    marginBottom: 3,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 5,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 20,
    backgroundColor: '#FDFDFD',
    borderColor: '#E9E9E9',
    borderWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginBottom: 8,
    color: '#424242',
  },
  ratingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  skillContainer: {
    gap: 5,
  },
  rating: {
    marginTop: 8,
    fontSize: 13,
    color: '#6C6C6C',
    fontFamily: 'Poppins-Regular',
  },
  reviews: {
    fontSize: 11,
    color: '#6C6C6C',
    fontFamily: 'Poppins-Regular',
  },
  jobImage: {
    width: 60,
    height: 60,
    borderRadius: 50,
  },
  jobDetails: {
    flex: 1,
    marginRight: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: Colors.disable,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingInfo: {
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    width: 280,
    elevation: 5,
  },
  modalImage: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'Poppins-Bold',
  },
  modalMessage: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  jobPosition: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  viewButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  historyButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  historyButtonText: {
    color: '#333',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  errorContainer: {
    position: 'absolute',
    bottom: '5%',
    left: '50%',
    transform: [{ translateX: '-55%' }],
    zIndex: 100,
    padding: 15,
    backgroundColor: '#FFEBEE',
    marginHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    fontFamily: 'Poppins-Medium',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#D32F2F',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Medium',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.active,
  },
  closeButton: {
    fontSize: 22,
    color: '#666',
    padding: 5,
  },
  loaderContainer: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  emptyLogsContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLogsText: {
    fontFamily: 'Poppins-Medium',
    color: '#666',
    fontSize: 16,
  },
  // Timeline styles - completely redesigned
  timelineContainer: {
    padding: 15,
  },
  timelineWrapper: {
    paddingLeft: 10,
  },
  timelineItemContainer: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timelineDotContainer: {
    alignItems: 'center',
    width: 20,
    height: '100%',
  },
  timelineDot: {
    marginTop: 3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    top: 18,
    width: 2,
    height: '100%',
    backgroundColor: Colors.primary,
    opacity: 0.5,
    left: 9,
  },
  timelineContent: {
    marginLeft: 15,
    flex: 1,
    paddingBottom: 10,
  },
  timelineStatus: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
    height: '100%',
  },
  timelineDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  timelineNotes: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
});
