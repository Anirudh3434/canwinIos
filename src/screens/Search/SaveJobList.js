import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  FlatList,
  BackHandler,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { Colors } from '../../theme/color';
import style from '../../theme/style';
import JobDetailModal from '../Home/JobDetail';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Skeleton job card using package
const SkeletonJobCard = () => (
  <View style={styles.card}>
    <SkeletonPlaceholder speed={800} highlightColor="#F2F8FC" flexDirection="column">
      <SkeletonPlaceholder.Item
        width="100%"
        height={150}
        borderRadius={10}
        flexDirection="row-reverse"
        justifyContent="space-between"
      >
        <SkeletonPlaceholder.Item width="70%" height={100} borderRadius={10}>
          <SkeletonPlaceholder.Item width="80%" height={40} borderRadius={10} />
          <SkeletonPlaceholder.Item width="25%" height={20} borderRadius={8} marginTop={5} />
          <SkeletonPlaceholder.Item width="60%" height={20} borderRadius={8} marginTop={10} />
          <SkeletonPlaceholder.Item width="60%" height={20} borderRadius={8} marginTop={5} />
          <SkeletonPlaceholder.Item width="60%" height={20} borderRadius={8} marginTop={5} />
        </SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item width="25%" height={100} borderRadius={10}>
          <SkeletonPlaceholder.Item width={70} height={70} borderRadius={50} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  </View>
);

function SaveJobList() {
  const [jobs, setJobs] = useState([]);
  const route = useRoute();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [successPop, setSuccessPop] = useState(false);

  const fetchSaveJob = async () => {
    setIsLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const response = await axios.get(API_ENDPOINTS.SAVE_JOBS, {
        params: { user_id: parseInt(userId, 10) }
      });
      
      if (response.data && response.data.data) {
        setJobs(response.data.data);
      } else {
        setJobs([]);
      }
      setHasError(false);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      setHasError(true);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refetchJobs = () => {
    fetchSaveJob();
  };

  useEffect(() => {
    fetchSaveJob();
  }, []);

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

  const handleSuccessPopup = () => {
    setSuccessPop(true);
    // Optional: Uncomment to auto-hide the popup after 3 seconds
    // setTimeout(() => {
    //   setSuccessPop(false);
    // }, 3000);
  };

  const openJobDetail = (job) => {
    setSelectedJob(job);
    setModalVisible(true);
  };

  const closeJobDetail = () => {
    setModalVisible(false);
  };

  const renderJobCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openJobDetail(item)} activeOpacity={0.7}>
      <View style={styles.jobDetails}>
        <Text style={styles.cardTitle}>{item.job_title}</Text>
        <Text style={styles.cardText}>{item.company_name}</Text>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color="gray" />
          <Text style={styles.detailText}>{item.job_location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="briefcase-outline" size={14} color="gray" />
          <Text style={styles.detailText}>
            {item.min_experience}-{item.max_experience} years{' '}
          </Text>
        </View>
        <View style={[styles.detailRow, { marginTop: 10 }]}>
          <Text
            style={[
              styles.detailText,
              { fontFamily: 'Poppins-Regular', fontSize: 10, color: Colors.disable },
            ]}
          >
            {item.daysAgo}
          </Text>
        </View>
      </View>
      <View style={styles.ratingContainer}>
        <Image
          source={ { uri: item.company_logo } }
          style={styles.jobImage}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );

  const renderSkeletonLoading = () => (
    <FlatList
      data={Array(5).fill({})}
      renderItem={() => <SkeletonJobCard />}
      keyExtractor={(_, index) => `skeleton-${index}`}
      contentContainerStyle={styles.listContainer}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={50} color="#757575" />
      <Text style={styles.emptyText}>
        No jobs found
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={50} color="#D32F2F" />
      <Text style={styles.errorText}>Failed to load jobs</Text>
      <TouchableOpacity style={styles.retryButton} onPress={refetchJobs}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg, flex: 1 }]}>
      <StatusBar
        barStyle={modalVisible ? 'light-content' : 'dark-content'}
        backgroundColor={modalVisible ? 'rgba(0, 0, 0, 0.5)' : 'white'}
      />
      {successPop && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Image
              source={require('../../../assets/image/success1.png')}
              style={styles.modalImage}
            />
            <Text style={styles.modalTitle}>Apply Success</Text>
            <Text style={styles.modalMessage}>
              Your job application has been submitted successfully.
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSuccessPop(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('MyTabs')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.resultsText}>
            Saved Jobs
          </Text>
        </View>
      </View>
      {isLoading ? (
        renderSkeletonLoading()
      ) : hasError ? (
        renderErrorState()
      ) : jobs && jobs.length > 0 ? (
        <FlatList
          data={jobs}
          renderItem={renderJobCard}
          keyExtractor={(item) => item.job_id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
      <JobDetailModal
        visible={modalVisible}
        onClose={closeJobDetail}
        job={selectedJob}
        onSuccess={handleSuccessPopup}
      />
    </SafeAreaView>
  );
}

export default SaveJobList;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'column',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerText: {
    marginLeft: 10,
  },
  resultsText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row-reverse',
    gap: 30,
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
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginBottom: 8,
    color: 'black',
  },
  ratingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  rating: {
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
    objectFit: 'contain'
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
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: 'black',
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
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Error and empty state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#424242',
    marginTop: 15,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#424242',
    marginTop: 15,
    textAlign: 'center',
  },
});