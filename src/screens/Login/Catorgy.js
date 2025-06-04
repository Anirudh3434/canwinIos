import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  ScrollView,
  Dimensions,
  BackHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';

// Get device width and height
const { width, height } = Dimensions.get('window');

const JobSelection = () => {
  const navigation = useNavigation();
  const [prefered_job_role, setPreferedJobRole] = useState('');
  const [userid, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [step, setStep] = useState(0);

  const jobs = [
    { title: 'Designer', icon: require('../../../assets/image/s1.png') },
    { title: 'Developer', icon: require('../../../assets/image/s2.png') },
    { title: 'Marketing', icon: require('../../../assets/image/s3.png') },
    { title: 'Management', icon: require('../../../assets/image/s4.png') },
    { title: 'Research and Analytics', icon: require('../../../assets/image/s5.png') },
    { title: 'Information Technology', icon: require('../../../assets/image/s6.png') },
  ];

  useEffect(() => {
    const backAction = () => {
      // Your custom back button logic
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // Clean up on unmount
  }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const roleId = await AsyncStorage.getItem('roleId');
        setUserId(userId ? +userId : null);
        setRoleId(roleId ? +roleId : null);
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };
    fetchUserId();
  }, []);

  const handleSubmit = async () => {
    if (!prefered_job_role) {
      Alert.alert('Error', 'Please select a job role.');
      return;
    }

    if (!userid) {
      Alert.alert('Error', 'User ID not found. Please login again.');
      return;
    }

    const data = {
      user_id: userid,
      prefered_job_role: prefered_job_role,
    };

    try {
      const response = await axios.post(API_ENDPOINTS.CAREER, data);

      if (response.data.status === 'success') {
        try {
          const getStepResponse = await axios.get(`${API_ENDPOINTS.STEP}?user_id=${userid}`);

          if (getStepResponse.data.status === 'success') {
            const currentStep = getStepResponse.data.data.steps;
            setStep(currentStep);

            const stepResponse = await axios.post(API_ENDPOINTS.STEP, {
              user_id: userid,
              role_id: roleId,
              steps: +currentStep + 1,
            });

            if (stepResponse.data.status === 'success') {
              navigation.navigate('Validate');
            }
          }
        } catch (error) {
          console.log('Step update error:', error);
          Alert.alert('Error', 'Failed to update progress. Please try again.');
        }
      }
    } catch (error) {
      console.log('Career post error:', error);
      Alert.alert('Error', 'Failed to save job preference. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.bg} barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>What type of Job You're Looking For?</Text>
        <View style={styles.jobList}>
          {jobs.map((job, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.jobButton,
                prefered_job_role === job.title && styles.selectedJobButton,
              ]}
              onPress={() => setPreferedJobRole(job.title)}
            >
              <Image source={job.icon} style={styles.jobIcon} resizeMode="contain" />
              <Text style={styles.jobTitle}>{job.title}</Text>
              {prefered_job_role === job.title && (
                <Image
                  source={require('../../../assets/image/tick.png')}
                  resizeMode="contain"
                  style={styles.tickIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={handleSubmit} style={styles.proceedButton}>
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    marginTop: height * 0.06,
    paddingHorizontal: width * 0.05, // 5% horizontal padding
    paddingBottom: height * 0.1, // 10% bottom padding
  },
  title: {
    fontSize: width * 0.075, // Responsive font size
    fontWeight: 'bold',
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  jobList: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15,
    marginTop: height * 0.02,
  },
  jobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: width * 0.04,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: height * 0.015,
    width: '100%',
  },
  selectedJobButton: {
    borderColor: '#14B6AA',
    backgroundColor: '#14B6AA0A',
  },
  jobIcon: {
    width: width * 0.08,
    height: width * 0.08,
    marginRight: width * 0.04,
  },
  jobTitle: {
    fontSize: width * 0.045,
    flex: 1,
  },
  tickIcon: {
    width: width * 0.05,
    height: width * 0.05,
  },
  proceedButton: {
    backgroundColor: '#14B6AA',
    padding: width * 0.04,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: height * 0.04,
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: width * 0.05,
    fontWeight: 'bold',
  },
});

export default JobSelection;
