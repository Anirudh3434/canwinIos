import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../theme/color';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const JobCard = ({ job, onRepost, onDelete, onEdit, onMenu, home, onClick }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  // Format salary range for display
  const formatSalary = () => {
    if (job?.MIN_SALARY && job?.MAX_SALARY) {
      return `${(job.MIN_SALARY / 100000).toFixed(1)}-${(job.MAX_SALARY / 100000).toFixed(1)} LPA`;
    } else if (job?.salary_range) {
      return job.salary_range;
    } else {
      return 'Not specified';
    }
  };

  // Handle job status display
  const getStatusStyles = () => {
    const status = job?.STATUS || job?.status || 'Inactive';
    const isActive = status === 'Active';

    return {
      containerStyle: {
        backgroundColor: isActive ? '#E4FFFD' : '#FFEFEF',
      },
      textStyle: {
        color: isActive ? Colors.primary : '#DC1F1F',
      },
      text: isActive ? 'Active' : 'Inactive',
    };
  };

  const statusStyles = getStatusStyles();

  return (
    <Pressable onPress={onClick} style={styles.cardContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={styles.cardHeader}>
          <Image style={styles.jobLogo} source={{ uri: job?.company_logo }} />
          <View>
            <Text style={styles.jobTitle} numberOfLines={2} ellipsizeMode="tail">
              {job?.job_title?.length > 20
                ? job.job_title.slice(0, 20) + '...'
                : job?.job_title || job?.title || 'Job Title'}
            </Text>
            <Text style={styles.jobLocation}>
              {job
                ? job.location || job.JOB_LOCATION
                  ? (job.location || job.JOB_LOCATION).length > 30
                    ? (job.location || job.JOB_LOCATION).slice(0, 30) + '...'
                    : job.location || job.JOB_LOCATION
                  : 'Location not specified'
                : 'Location not specified'}
            </Text>
            <Text style={styles.jobDate}>Posted: {job.created_at || 'Recently'}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={[styles.statusContainer, statusStyles.containerStyle]}>
              <Text style={[styles.statusText, statusStyles.textStyle]}>{statusStyles.text}</Text>
            </View>
            {!home && (
              <TouchableOpacity
                style={{ padding: 5 }}
                onPress={() => onMenu && onMenu(!menuVisible)}
              >
                <Ionicons name="ellipsis-vertical" size={16} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.salaryText}>{formatSalary()}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    width: width - 40,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  jobLogo: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 50,
  },
  jobTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    maxWidth: 180,
    color: '#333',
  },
  jobLocation: {
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
    fontSize: 12,
  },
  jobDate: {
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  statusContainer: {
    borderRadius: 8,
    padding: 5,
  },
  statusText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  salaryText: {
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
    fontSize: 14,
  },
});

export default JobCard;
