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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';

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

  console.log('user id:', userid);
  console.log('role id:', roleId);

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
      console.log(response.data);

      if (response.data.status === 'success') {
        try {
          // Get current step
          const getStepResponse = await axios.get(`${API_ENDPOINTS.STEP}?user_id=${userid}`);

          if (getStepResponse.data.status === 'success') {
            const currentStep = getStepResponse.data.data.steps;
            setStep(currentStep);

            // Post new step
            const stepResponse = await axios.post(API_ENDPOINTS.STEP, {
              user_id: userid,
              role_id: roleId,
              steps: +currentStep + 1,
            });

            console.log(stepResponse.data);
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
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>What type of Job You're Looking For?</Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 15,
            marginTop: 20,
          }}
        >
          {jobs.map((job, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.jobButton, 
                prefered_job_role === job.title && styles.selectedJobButton
              ]}
              onPress={() => setPreferedJobRole(job.title)}
            >
              <Image source={job.icon} style={styles.jobIcon} resizeMode="contain" />
              <Text style={styles.jobTitle}>{job.title}</Text>
              {prefered_job_role === job.title && (
                <Image
                  source={require('../../../assets/image/tick.png')}
                  resizeMode="contain"
                  style={{ width: 20, height: 20 }}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          onPress={handleSubmit}
          style={styles.proceedButton}
        >
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  jobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  selectedJobButton: {
    borderColor: '#14B6AA',
    backgroundColor: '#14B6AA0A',
  },
  jobIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  jobTitle: {
    fontSize: 16,
    flex: 1,
  },
  checkmark: {
    fontSize: 20,
    color: '#14B6AA',
  },
  proceedButton: {
    backgroundColor: '#14B6AA',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default JobSelection;  