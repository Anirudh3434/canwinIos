import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import { Colors } from '../../theme/color';
import style from '../../theme/style';

const ApplicationTrack = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params;
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const backAction = () => {
    navigation.navigate('MyTabs');
    return true;
  };

  console.log('item', item);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.APPLICATION_LOGS, {
        params: { application_id: item.application_id },
      });

      const res = response?.data;
      setLogs(res?.data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const CustomTimeline = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    }

    if (logs.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No status updates available</Text>
        </View>
      );
    }

    return (
      <View style={styles.timelineContainer}>
        {logs.map((log, index) => {
          const isLast = index === logs.length - 1;
          const date = new Date(log.created_at);
          const formattedDate = date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
          });

          return (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineBulletContainer}>
                <View style={styles.timelineBullet}>
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
                {!isLast && <View style={styles.timelineConnector} />}
              </View>

              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineTitle,
                    { color: index === 0 ? Colors.primary : Colors.disable },
                  ]}
                >
                  {log.new_status}
                </Text>
                {log.new_status === 'Offer Letter Sent' && (
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('OfferLetterView', { jobId: item.job_id });
                    }}
                    style={styles.timelineDescription}
                  >
                    <Text style={styles.timelineDescription}>Click here to view</Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.timelineDate}>{formattedDate}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderSimilarJob = ({ item: job, index }) => (
    <View style={styles.jobCard} key={index}>
      <View style={styles.jobCardHeader}>
        <View style={styles.companyLogo}>
          <Text style={index === 0 ? styles.logoText : styles.logoAlt}>
            {index === 0 ? 'A' : 'm'}
          </Text>
        </View>
        <View style={styles.jobCardDetails}>
          <Text style={styles.jobCardTitle}>Executive N-CMD</Text>
          <Text style={styles.jobCardCompany}>Asian Paints</Text>
          <View style={styles.jobCardRating}>
            <Text style={styles.starIcon}>★</Text>
            <Text style={styles.ratingText}>3.9</Text>
            <Text style={styles.reviewCount}>(355 reviews)</Text>
          </View>
          <View style={styles.jobCardLocation}>
            <Text style={styles.locationText}>📍 Jakarta, Indonesia</Text>
          </View>
          <View style={styles.jobCardExperience}>
            <Text style={styles.experienceText}>📄 0-3 Yrs</Text>
          </View>
          <Text style={styles.jobCardTimeAgo}>1d ago</Text>
        </View>
      </View>
    </View>
  );

  const similarJobs = [{ id: 1 }, { id: 2 }];

  const ListHeaderComponent = () => (
    <>
      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Your application status</Text>
        <CustomTimeline />
      </View>
      <View style={styles.similarJobsSection}>
        <Text style={styles.sectionTitle}>Similar Jobs</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={style.area}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('MyTabs')}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <View style={styles.jobHeader}>
        <View style={styles.logoContainer}>
          <Image source={{ uri: item?.company_logo }} style={styles.logo} />
        </View>
        <Text style={styles.jobTitle}>{item.job_title}</Text>
        <Text style={styles.companyName}>{item.company_name}</Text>

        <View style={[styles.ratingContainer, { justifyContent: 'space-between' }]}>
          <View style={styles.ratingContainer}>
            <Text style={styles.starIcon}>★</Text>
            <Text style={styles.ratingText}>3.9</Text>
            <Text style={styles.reviewCount}>(355 reviews)</Text>
          </View>
          <Text style={styles.viewDescription}>View Description</Text>
        </View>
      </View>

      <FlatList
        style={styles.scrollView}
        data={similarJobs}
        renderItem={renderSimilarJob}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeaderComponent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default ApplicationTrack;

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 15,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 30 : 0,
    left: 10,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  jobHeader: {
    paddingTop: Platform.OS === 'ios' ? 30 : 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logoContainer: {
    marginBottom: 15,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 50,
    resizeMode: 'cover',
  },
  jobTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  companyName: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    color: '#ffc120',
    fontSize: 16,
    marginRight: 3,
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 12,
    marginRight: 5,
    fontFamily: 'Poppins-SemiBold',
  },
  reviewCount: {
    color: '#777',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginRight: 5,
  },
  viewDescription: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'right',
  },
  statusSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 20,
  },
  timelineContainer: {
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  timelineBulletContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  timelineBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineConnector: {
    position: 'absolute',
    top: 20,
    left: 9,
    bottom: -15,
    width: 2,
    backgroundColor: Colors.primary,
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 10,
  },
  timelineTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.disable,
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: Colors.disable,
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 8,
    fontFamily: 'Poppins-Regular',
    color: '#888',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  similarJobsSection: {
    padding: 20,
  },
  jobCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  jobCardHeader: {
    flexDirection: 'row',
  },
  companyLogo: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f3f8',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logoText: {
    color: '#3476F6',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoAlt: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  jobCardDetails: {
    flex: 1,
  },
  jobCardTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  jobCardCompany: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  jobCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  jobCardLocation: {
    marginTop: 5,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  jobCardExperience: {
    marginTop: 5,
  },
  experienceText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  jobCardTimeAgo: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    marginTop: 5,
  },
});
