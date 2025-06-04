import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

import { Colors } from '../../theme/color';
import { useFetchProfileDetail } from '../../hooks/profileData';
import { useNavigation } from '@react-navigation/native';
import { API_ENDPOINTS } from '../../api/apiConfig';
import axios from 'axios';
import { Alert } from 'react-native';

const InterviewCard = ({ job }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  const [profileDetail, setProfileDetail] = useState({});
  const [Docs, setDocs] = useState({});

  console.log('job', job);

  const user_id = +job.applicant_user_id;

  const FetchDetail = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.INTRODUCTION, {
        params: { user_id: user_id },
      });

      console.log('response', response.data);

      const Docs = await axios.get(API_ENDPOINTS.DOCS, {
        params: { user_id: user_id },
      });

      setProfileDetail({...response.data.data , ...Docs.data.data});
    } catch (error) {
      console.error('Error fetching profile detail:', error);
    }
  };

  
  const FetchDocs = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.DOCS, {
        params: { user_id: user_id },
      });
      setDocs(response.data.data);
    } catch (error) {
      console.error('Error fetching profile detail:', error);
    }
  };


  useEffect(() => {
    FetchDetail();
    FetchDocs();
  }, [user_id]);
  
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleJobOffer = () => {
    console.log('Job offer for:', job);
    navigation.navigate('JobOfferLetter', {
      job: job,
      name: profileDetail?.full_name,
      profile_image: profileDetail?.pp_url,
      job_title: job?.job_title,
    });
    setMenuVisible(false);
  };

  const handleReschedule = () => {
    console.log('Reschedule interview for:', job);
    navigation.navigate('Interview', { job: job, profileDetail: profileDetail, reschedule: true });
    setMenuVisible(false);
  };

  const handleComplete = async () => {
    try {
      const payload = {
        applicant_id: +job.application_id,
        user_id: +job.applicant_user_id,
        job_id: job.job_id,
        application_status: 'Interview Completed',
      };

      const response = await axios.post(API_ENDPOINTS.JOB_APPLY, payload);
      console.log('response', response.data);

      if (response.data.status === 'success') {
        try {
          const reponse = await axios.post(API_ENDPOINTS.APPLICATION_LOGS, {
            application_id: +job.application_id,
            old_status: 'Interview Scheduled',
            new_status: 'Interview Completed',
          });
          console.log('reponse', reponse.data);

          if (reponse.data.status === 'success') {
            Alert.alert('Success', 'Interview completed successfully', [{ text: 'OK' }]);
          }
        } catch (error) {
          console.log('error', error);
        }
      }
    } catch (error) {
      console.log('error', error);
    }

    setMenuVisible(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: profileDetail?.pp_url || 'https://via.placeholder.com/60' }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.candidateName}>
              {profileDetail?.full_name || 'Unknown Candidate'}
            </Text>
            <View style={styles.positionContainer}>
              <Text style={styles.positionText}>{job?.job_title || 'Position Not Specified'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <Text style={styles.menuDots}>⋮</Text>
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {menuVisible && (
          <View style={styles.dropdown}>
            {job.application_status === 'Interview Scheduled' && (
              <TouchableOpacity style={styles.menuItem} onPress={handleReschedule}>
                <Text style={styles.menuItemText}>Reschedule Interview</Text>
              </TouchableOpacity>
            )}
            {job.application_status === 'Interview Scheduled' && (
              <TouchableOpacity style={styles.menuItem} onPress={handleComplete}>
                <Text style={styles.menuItemText}>Complete Interview</Text>
              </TouchableOpacity>
            )}

            {job.application_status === 'Interview Completed' && (
              <TouchableOpacity style={styles.menuItem} onPress={handleJobOffer}>
                <Text style={styles.menuItemText}>Send Job Offer</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.cardContent}>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date & Time</Text>
            <Text style={styles.infoSeparator}>-</Text>
            <Text style={styles.infoValue}>{job?.interview_date || 'Not scheduled'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Interview Mode</Text>
            <Text style={styles.infoSeparator}>-</Text>
            <Text
              style={[
                styles.infoValue,
                {
                  color: job?.interview_type === 'Online' ? Colors.primary : Colors.disable,
                },
              ]}
            >
              {job?.interview_type || 'Not specified'}
            </Text>
          </View>
        </View>
        <View style={styles.verticalBar} />
      </View>
    </View>
  );
};

export default InterviewCard;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 24,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    top: 20,
    right: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
    minWidth: 180,
    padding: 8,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  dangerMenuItem: {
    borderBottomWidth: 0,
  },
  dangerMenuText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#FF3B30',
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
  menuButton: {},
  menuDots: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingRight: 10,
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
