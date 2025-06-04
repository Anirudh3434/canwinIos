import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFetchProfileDetail } from '../../hooks/profileData';
import { useNavigation } from '@react-navigation/native';
import { API_ENDPOINTS } from '../../api/apiConfig';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const JobSeekerCard = ({ seeker }) => {
  const { width } = useWindowDimensions();
  const [userId, setUserId] = useState(null);

  const fetchUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      setUserId(+userId);
    } catch (error) {
      console.error('Error fetching user ID:', error);
      return null;
    }
  };

  const handleMessage = async () => {
    console.log(seeker.user_id);
    console.log(userId);

    const chatResponse = await axios.get(API_ENDPOINTS.CHAT_ROOM, {
      params: {
        sender: +userId,
        receiver: +seeker.user_id,
      },
    });

    console.log(chatResponse.data);

    if (chatResponse.data.error) {
      const payload = {
        sender: +userId,
        reciever: +seeker.user_id,
      };

      console.log(payload);
      const createChat = await axios.post(API_ENDPOINTS.CHAT_ROOM, payload);

      console.log('Chat ID: ' + createChat.data.chat_id);

      navigation.navigate('Message', {
        item: createChat.data,
      });
    } else {
      console.log('Chat response ID: ' + chatResponse.data.chat_id);
      navigation.navigate('Message', {
        item: chatResponse.data,
      });
    }
  };
  useEffect(() => {
    fetchUserId();
  }, []);

  const navigation = useNavigation();

  // Move the hook call to the component level, not inside a function
  const { profileDetail, isLoading, isError, refetch } = useFetchProfileDetail(seeker?.user_id);

  if (!seeker) {
    return (
      <View style={styles.noData}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const handleSeeResume = async () => {
    const serviceResponse = await axios.get(API_ENDPOINTS.SERVICE_PROVIDER, {
      params: {
        user_id: userId,
      },
    });

    if (serviceResponse.data.resume_count > 0) {
      try {
        const getResponse = await axios.get(API_ENDPOINTS.APPLICATION_LOGS, {
          params: {
            application_id: seeker.application_id,
          },
        });

        const isResumeViewed = getResponse.data.data.some(
          (item) => item.new_status === 'Resume Viewed'
        );

        if (isResumeViewed) {
          return;
        }

        const old_status = getResponse.data.data[getResponse.data.data.length - 1].new_status;

        if (old_status) {
          try {
            const updateResponse = await axios.post(API_ENDPOINTS.APPLICATION_LOGS, {
              application_id: seeker.application_id,
              old_status: old_status,
              new_status: 'Resume Viewed',
            });
          } catch (error) {
            console.error('Error updating seeker status:', error);
          }
        }
      } catch (error) {
        console.error('Error updating seeker status:', error);
      } finally {
        const UpdateResumeCount = serviceResponse.data;

        UpdateResumeCount.resume_count = UpdateResumeCount.resume_count - 1;

        const response = await axios.post(API_ENDPOINTS.SERVICE_PROVIDER, {
          service_id: serviceResponse.data.service_id,
          resume_count: UpdateResumeCount.resume_count,
        });

        navigation.navigate('PdfViewer', {
          pdfUrl: profileDetail.docs.resume_file_url,
          fileName: profileDetail.docs.resume_file_name,
        });
      }
    } else {
      Alert.alert('Plan Alert', 'You need to upgrade your plan to view resume', [
        { text: 'OK', onPress: () => navigation.navigate('PlanPage') },
      ]);
    }
  };

  return (
    <View id={seeker.application_id} style={[styles.cardContainer,  { width: width - 40 }]}>
      {/* Header Section */}
      <View style={styles.cardHeaderSection}>
        <View style={styles.cardHeader}>
          <Image
            style={styles.seekerImage}
            source={
              profileDetail?.docs?.pp_url
                ? { uri: profileDetail.docs?.pp_url }
                : require('../../../assets/image/profileIcon.png')
            }
          />
          <View>
            <Text style={styles.seekerName}>{profileDetail?.introduction?.full_name}</Text>
            <Text style={styles.seekerDate}>Applied on: {seeker.date}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleMessage}>
          <Image
            style={styles.cardImage}
            source={require('../../../assets/image/meesageIcon.png')}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Seeker Details */}
      <View style={styles.detailsContainer}>
        {[
          profileDetail?.basicDetails?.current_state && profileDetail?.basicDetails?.current_city
            ? profileDetail?.basicDetails?.current_state +
              ',' +
              profileDetail?.basicDetails?.current_city
            : 'No location',
          profileDetail?.introduction?.expertise
            ? profileDetail?.introduction?.expertise
            : 'No role specified',
          `Applied ${seeker.date ? seeker.date : 'N/A'}`,
        ].map((item, index) => (
          <View key={index} style={styles.detailItem}>
            <View style={styles.dot} />
            <Text style={styles.detailText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Skills Section */}
      {profileDetail?.skill && profileDetail?.skill.length > 0 ? (
        <View style={styles.skillsContainer}>
          {profileDetail?.skill.map((skill, index) => (
            <View key={index} style={styles.skillBadge}>
              <Ionicons name="checkmark" size={12} color="black" />
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noSkills}>No skills provided</Text>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.resumeButton} onPress={handleSeeResume}>
          <Text style={styles.buttonText}>See Resume</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() =>
            navigation.navigate('VistorProfile', {
              profileDetail,
              user_id: seeker.user_id,
              job: seeker.job_id,
              seeker: seeker,
            })
          }
        >
          <Text style={styles.buttonTextSecondary}>See Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginRight: 10,
  },
  cardHeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seekerImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
  },
  seekerName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333',
  },
  seekerDate: {
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
    fontSize: 12,
  },
  cardImage: {
    width: 40,
    height: 40,
  },
  divider: {
    borderTopColor: '#F0F0F0',
    borderTopWidth: 1,
    marginVertical: 15,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#80559A',
    marginRight: 5,
  },
  detailText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#555',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DFFAF6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 5,
  },
  skillText: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: 12,
  },
  noSkills: {
    fontFamily: 'Poppins-Italic',
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 15,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resumeButton: {
    backgroundColor: '#14B6AA',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
  },
  detailsButton: {
    backgroundColor: '#F9FFFE',
    borderWidth: 1,
    borderColor: '#14B6AA',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonTextSecondary: {
    fontFamily: 'Poppins-SemiBold',
    color: '#14B6AA',
    fontSize: 14,
    textAlign: 'center',
  },
  noData: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginVertical: 10,
  },
  noDataText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default JobSeekerCard;
