import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors } from '../../theme/color';
import style from '../../theme/style';
import Icon from 'react-native-vector-icons/Ionicons';
import ProfileImageFallback from '../profileImageFallback';
import { API_ENDPOINTS } from '../../api/apiConfig';
import axios from 'axios';

const JobCard3 = ({ job, index, handleJobPress }) => {
  const [applicationCount, setApplicationCount] = useState(0);

  const FetchApplicationCount = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.APPLICATION_COUNT, {
        params: {
          job_id: job.job_id,
        },
      });
      setApplicationCount(response.data.count);
      console.log('response', response.data);
    } catch (error) {
      console.log('Error fetching application count:', error);
    }
  };

  useEffect(() => {
    FetchApplicationCount();
  }, []);

  return (
    <TouchableOpacity key={`recent-${index}`} onPress={() => handleJobPress(job)}>
      <View style={styles.jobCardContainer}>
        <View style={styles.jobCard}>
          <View style={styles.jobCardHeader}>
            {job.company_logo ? (
              <Image
                source={{ uri: job.company_logo }}
                resizeMode="stretch"
                style={styles.jobCardLogo}
              />
            ) : (
              <ProfileImageFallback size={40} fontSize={15} fullname={job.company_name} />
            )}
          </View>

          <View style={styles.jobCardContent}>
            <View>
              <Text style={[style.s16, { color: Colors.active }]}>
                {job.job_title?.length > 20 ? job.job_title.slice(0, 20) + '...' : job.job_title}
              </Text>
              <Text>{job.company_name}</Text>
            </View>

            <View style={styles.jobCardLocation}>
              <Icon name="location" size={12} color="#9A9A9A" />
              <Text style={styles.jobCardLocationText}>{job.job_location}</Text>
            </View>

            <View style={styles.jobCardLocation}>
              <Icon name="time-outline" size={12} color="#9A9A9A" />
              <Text style={styles.jobCardLocationText}>{job.daysAgo}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.applicationCountContainer}>
        <Icon name="person" size={12} color="#9A9A9A" />
        <Text style={styles.applicationCountText}>{applicationCount} applied</Text>
      </View>
    </TouchableOpacity>
  );
};

export default JobCard3;

const styles = StyleSheet.create({
  jobCardContainer: {
    padding: 5,
    marginBottom: 5,
    marginRight: 10,
  },
  jobCard: {
    borderWidth: 1,
    padding: 12,
    width: 250,
    height: 180,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderColor: '#E9E9E9',
    borderRadius: 8,
    shadowColor: Colors.active,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  jobCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  jobCardLogo: {
    height: 40,
    width: 40,
    borderRadius: 50,
  },
  jobCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  jobCardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  jobCardLocationText: {
    color: '#9A9A9A',
    marginLeft: 5,
    marginTop: 0,
    fontFamily: 'Poppins-small',
    fontSize: 10,
  },
  applicationCountContainer: {
    position: 'absolute',
    top: 10,
    right: 30,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    alignSelf: 'flex-start',
    backgroundColor: '#F3F3F3',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  applicationCountText: {
    color: '#666',
    marginLeft: 4,
    fontSize: 10,
    fontFamily: 'Poppins-small',
  },
});
