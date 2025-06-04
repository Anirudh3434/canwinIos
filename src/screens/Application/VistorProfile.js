import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../theme/color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_ENDPOINTS } from '../../api/apiConfig';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VisitorProfile = () => {
  const route = useRoute();
  const { profileDetail, user_id, job, seeker } = route.params || {};

  console.log('seeker', seeker);

  console.log('job', job);
 
  const navigation = useNavigation();

  const [employerInfo, setEmployerInfo] = useState({
    name: '',
    companyName: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileViewed, setIsProfileViewed] = useState(null);

  // Unified function to load necessary data and perform required operations
  const initializeProfile = async () => {
    try {
      setIsLoading(true);

      // Step 1: Get employer information
      const employerData = await getEmployerInfo();
      if (!employerData) {
        throw new Error('Failed to load employer information');
      }

      // Step 2: Check if profile was already viewed
      const viewStatus = await checkProfileViewStatus();
      setIsProfileViewed(viewStatus);

      // Step 3: If not viewed before, update status and send notifications
      if (!viewStatus && employerData.name && employerData.companyName) {
        await updateProfileStatus(employerData);
      }
    } catch (error) {
      console.error('Error initializing profile:', error);
      Alert.alert('Error', 'There was a problem loading profile information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get employer name and company details
  const getEmployerInfo = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.warn('User ID not found in AsyncStorage');
        return null;
      }

      // Make parallel API calls for better performance
      const [introResponse, companyResponse] = await Promise.all([
        axios.get(API_ENDPOINTS.INTRODUCTION, { params: { user_id: userId } }),
        axios.get(API_ENDPOINTS.COMPANY_DETAILS, { params: { user_id: userId } }),
      ]);

      const name = introResponse?.data?.data?.full_name || '';
      const companyName = companyResponse?.data?.data?.company_name || '';

      const employerData = { name, companyName };
      setEmployerInfo(employerData);

      return employerData;
    } catch (error) {
      console.error('Error fetching employer info:', error?.response || error);
      return null;
    }
  };

  // Check if this profile was previously viewed
  const checkProfileViewStatus = async () => {
    if (!seeker?.application_id) {
      console.warn('No application ID available');
      return false;
    }

    try {
      const response = await axios.get(API_ENDPOINTS.APPLICATION_LOGS, {
        params: { application_id: seeker.application_id },
      });

      return response.data.data.some((item) => item.new_status === 'Profile Viewed');
    } catch (error) {
      console.error('Error checking profile view status:', error);
      return false;
    }
  };

  // Update profile status and send notifications
  const updateProfileStatus = async (employerData) => {
    if (!user_id || !job || !seeker?.application_id) {
      console.warn('Missing required data for updating profile status');
      return false;
    }

    try {
      // 1. Get FCM token
      const { data: fcmData } = await axios.get(`${API_ENDPOINTS.FCM}?user_id=${user_id}`);
      const fcmToken = fcmData?.data?.fcm_token;

      if (!fcmToken) {
        console.warn('No FCM token found');
        return false;
      }

      // 2. Get current application status
      const logsResponse = await axios.get(API_ENDPOINTS.APPLICATION_LOGS, {
        params: { application_id: seeker.application_id },
      });

      const logs = logsResponse.data.data;
      const oldStatus = logs.length > 0 ? logs[logs.length - 1].new_status : null;

      // 3. Make all required API calls in parallel
      await Promise.all([
        // Send profile viewed notification
        axios.post(`${API_ENDPOINTS.NODE_SERVER}/notify/profile-viewed`, {
          fcm_token: fcmToken,
          job_id: seeker.job_id,
          application_id : seeker.application_id,
          user_id: user_id,
          message: `Your profile has been viewed by ${employerData.name} from ${employerData.companyName}`,
        }),

        // Update application status
        axios.post(API_ENDPOINTS.JOB_APPLY, {
          user_id,
          job_id: job,
          application_status: 'Application Viewed',
        }),

        // Send status change notification
        axios.post(`${API_ENDPOINTS.NODE_SERVER}/notify/application_status`, {
          fcm_token: fcmToken,
          user_id: user_id,
          job_id: seeker.job_id,
          application_id : seeker.application_id,
          message: `Your Application Status changed to Application Viewed`,
        }),

        // Update application logs if old status exists
        oldStatus
          ? axios.post(API_ENDPOINTS.APPLICATION_LOGS, {
              application_id: seeker.application_id,
              old_status: oldStatus,
              new_status: 'Profile Viewed',
            })
          : Promise.resolve(),
      ]);

      return true;
    } catch (error) {
      console.error('Error updating profile status:', error);
      return false;
    }
  };

  // Initialize on component mount
  useEffect(() => {
    initializeProfile();
  }, []);

  // Safely access profile data with nullish coalescing
  const getProfileData = {
    fullName: profileDetail?.introduction?.full_name || 'N/A',
    expertise: profileDetail?.introduction?.expertise || 'N/A',
    location:
      profileDetail?.basic_details?.current_state && profileDetail?.basic_details?.current_city
        ? `${profileDetail.basic_details.current_state}, ${profileDetail.basic_details.current_city}`
        : 'No location',
    experience: profileDetail?.basic_details?.experience || 'No experience',
    currentCompany:
      profileDetail?.employment?.find((item) => item?.isCurrentCompany === 'Yes')
        ?.curr_company_name || 'No company',
    salary:
      profileDetail?.careerPreference?.currency &&
      profileDetail?.careerPreference?.current_annual_salary
        ? `${profileDetail.careerPreference.currency} ${profileDetail.careerPreference.current_annual_salary}`
        : 'Not specified',
    availability: profileDetail?.basic_details?.availability_to_join || 'Not specified',
    bio: profileDetail?.profileSummary?.profile_summary || 'No bio available',
    skills: profileDetail?.skill || [],
    employment: profileDetail?.employment || [],
    education: profileDetail?.education || [],
    email: profileDetail?.basic_details?.email || 'N/A',
    phone: profileDetail?.basic_details?.mobile_number || 'N/A',
    profilePic: profileDetail?.docs?.pp_url,
  };

  // Handle navigation to manage application
  const handleManageApplication = () => {
    navigation.navigate('ManageApplication', {
      profileDetail,
      user_id,
      job,
      seeker,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'white', paddingBottom: 30 }]}>
      <LinearGradient
        colors={['#14B6AA', '#61709F', '#80559A']}
        start={{ x: 0, y: 1.5 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBackground}
      >
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.profileHeaderContent}>
        <Image
          source={
            getProfileData.profilePic
              ? { uri: getProfileData.profilePic }
              : require('../../../assets/image/profileIcon.png')
          }
          style={styles.profileImage}
        />
      </View>

      <View style={styles.profileInfoContainer}>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{getProfileData.fullName}</Text>
          <Text style={styles.role}>{getProfileData.expertise}</Text>
        </View>
        <TouchableOpacity onPress={handleManageApplication} style={styles.manageApplication}>
          <Text style={styles.manageApplicationText}>Manage Application</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Basic Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Details</Text>
          <View style={styles.sectionItemContainer}>
            <Text style={styles.sectionItemLabel}>Location</Text>
            <Text style={styles.sectionItemValue}>{getProfileData.location}</Text>
          </View>
          <View style={styles.sectionItemContainer}>
            <Text style={styles.sectionItemLabel}>Experience</Text>
            <Text style={styles.sectionItemValue}>{getProfileData.experience}</Text>
          </View>
          <View style={styles.sectionItemContainer}>
            <Text style={styles.sectionItemLabel}>Current Company</Text>
            <Text style={styles.sectionItemValue}>{getProfileData.currentCompany}</Text>
          </View>
          <View style={styles.sectionItemContainer}>
            <Text style={styles.sectionItemLabel}>Expected Salary</Text>
            <Text style={styles.sectionItemValue}>{getProfileData.salary}</Text>
          </View>
          <View style={[styles.sectionItemContainer, { borderBottomWidth: 0 }]}>
            <Text style={styles.sectionItemLabel}>Availability</Text>
            <Text style={styles.sectionItemValue}>{getProfileData.availability}</Text>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Short Bio</Text>
          <Text style={styles.bioText}>{getProfileData.bio}</Text>
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {getProfileData.skills.length > 0 ? (
              getProfileData.skills.map((skill, index) => (
                <View key={index} style={styles.skillPill}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyStateText}>No skills listed</Text>
            )}
          </View>
        </View>

        {/* Work Experience Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Experience</Text>
          {getProfileData.employment.length > 0 ? (
            getProfileData.employment.map((item, index) => (
              <View style={styles.jobEntry} key={index}>
                <View style={styles.jobTitleContainer}>
                  <Text style={styles.companyName}>{item.curr_company_name}</Text>
                  <Text style={styles.jobPeriod}>
                    {item.joining_date}
                    {item.isCurrentCompany === 'Yes' &&
                      ` (${item.total_exp_in_years || 0}y ${item.total_exp_in_months || 0}m)`}
                  </Text>
                </View>
                <View style={styles.jobDescriptionContainer}>
                  <Text style={styles.jobDescription}>{item.curr_job_title}</Text>
                  {item.skill_used && (
                    <Text style={styles.jobDescription}>
                      • {item.skill_used.split(', ').join(', ')}
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyStateText}>No work experience listed</Text>
          )}
        </View>

        {/* Education Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          <View style={styles.educationContainer}>
            {getProfileData.education.length > 0 ? (
              getProfileData.education.map((item, index) => (
                <Text key={index} style={styles.educationText}>
                  {item.education === 'X' || item.education === 'XII'
                    ? `• Class ${item.education} - ${item.institute_name} (${item.year_of_start})`
                    : `• ${item.course_name || ''} ${
                        item.specialization_name ? `in ${item.specialization_name}` : ''
                      } - ${item.institute_name || ''} (${item.year_of_start || ''})`}
                </Text>
              ))
            ) : (
              <Text style={styles.emptyStateText}>No education details listed</Text>
            )}
          </View>
        </View>

        {/* Portfolio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          <View style={styles.sectionItemContainer}>
            <Text style={styles.sectionItemLabel}>Email</Text>
            <Text style={styles.sectionItemValue}>{getProfileData.email}</Text>
          </View>
          <View style={[styles.sectionItemContainer, { borderBottomWidth: 0 }]}>
            <Text style={styles.sectionItemLabel}>Phone</Text>
            <Text style={styles.sectionItemValue}>{getProfileData.phone}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerBackground: {
    position: 'relative',
    width: '90%',
    height: 120,
    borderRadius: 30,
    marginTop: 10,
    alignSelf: 'center',
  },
  backIcon: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  profileHeaderContent: {
    position: 'relative',
    alignItems: 'center',
    paddingTop: 40,
  },
  profileImage: {
    position: 'absolute',
    bottom: 10,
    left: 40,
    width: 80,
    height: 80,
    borderRadius: 50,
    zIndex: 100,
  },
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  role: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666',
  },
  manageApplication: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  manageApplicationText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: Colors.primary,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 10,
    borderColor: '#E6E6E6',
    borderWidth: 1,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  educationContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  sectionItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionItemLabel: {
    fontSize: 12,
    color: '#667085',
    fontFamily: 'Poppins-Medium',
  },
  sectionItemValue: {
    fontSize: 12,
    color: 'black',
    fontFamily: 'Poppins-Regular',
    textAlign: 'left',
    maxWidth: '60%',
  },
  bioText: {
    fontSize: 12,
    color: 'black',
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillPill: {
    borderWidth: 1,
    borderColor: '#DFDFDF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#667085',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  jobEntry: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: (index) => (index < getProfileData.employment.length - 1 ? 1 : 0),
    borderBottomColor: '#F0F0F0',
  },
  jobTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  jobPeriod: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  jobDescription: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  educationText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  emptyStateText: {
    fontStyle: 'italic',
    color: '#999',
    fontSize: 12,
  },
});

export default VisitorProfile;
