import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../../api/apiConfig';

export default function LinkedinVerify() {
  const role = useSelector((state) => state.role.role);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const [userData, setUserData] = useState(null);
  const scaleAnim = useState(new Animated.Value(0))[0];

  console.log('role', role);
  useEffect(() => {
    const params = route.params;

    if (params && params.userData) {
      try {
        setUserData(params.userData);
        console.log('✅ User Data:', params.userData);

        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('❌ Error decoding user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    } else {
      console.warn('🚫 No user data found in params');
      setLoading(false);
    }
  }, [route.params]);

  const handleLinkedinPress = async () => {
    setLoading(true);
    if (!userData) {
      Alert.alert('Error', 'No user data available.');
      return;
    }
    console.log('starting');

    try {
      const { email, firstName, lastName, picture } = userData; // Include picture from userData
      const password = userData.password || 'linkedin_default_pass';
      const name = `${firstName} ${lastName}`;

      const params = {
        email,
        name,
        password,
        phone: '',
        status: 'Active',
        role_type: role,
      };

      console.log('Params:', params);

      const response = await axios.post(API_ENDPOINTS.REGISTER_USER, params);
      console.log('API Response:', response.data);

      let userId;

      if (response.data.status === 'success') {
        console.log('Registration successful');
        userId = response.data?.user_id;
        role_Id = response.data?.role_id;

        if (userId) {
          await AsyncStorage.setItem('userId', userId);
          console.log('Successfully stored user ID:', userId);
          await AsyncStorage.setItem('roleId', role_Id);
          console.log('Successfully stored role ID:', role_Id);

          const introResponse = await axios.post(API_ENDPOINTS.INTRODUCTION, {
            user_full_name: name,
            user_id: userId,
          });
          const basicDetailsResponse = await axios.post(API_ENDPOINTS.BASIC_DETAILS, {
            email: email,
            user_id: userId,
          });

          console.log('Intro Response:', introResponse.data);
          console.log('Basic Details Response:', basicDetailsResponse.data);
        }
      } else if (response.data.code === -20001) {
        console.log('User already exists, fetching user ID');

        const loginResponse = await axios.get(`${API_ENDPOINTS.AUTHENTICATION}?email=${email}`);
        console.log('Login Response:', loginResponse.data);

        userId = loginResponse.data?.data?.user_id;
        let role_Id = loginResponse.data?.data?.role_id;

        console.log('User ID:', userId);
        console.log('Role ID:', role_Id);

        const getStepsResponse = await axios.get(API_ENDPOINTS.STEP, {
          params: { user_id: +userId },
        });

        if (getStepsResponse.data.status == 'error') {
          const stepsResponse = await axios.post(API_ENDPOINTS.STEP, {
            user_id: userId,
            role_id: role_Id,
            steps: '1',
          });
        }

        if (userId) {
          await AsyncStorage.setItem('userId', userId);
          await AsyncStorage.setItem('roleId', role_Id);
        }
      } else {
        console.error('Failed registration:', response.data);
        Alert.alert('Error', 'Failed to register or retrieve user ID.');
        return;
      }

      if (userId) {
        navigation.navigate('Validate');
      } else {
        console.error('User ID not found in API response');
        Alert.alert('Error', 'Failed to retrieve user ID.');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error during LinkedIn process:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="red" />
        <Text style={styles.errorText}>No user data found!</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: userData.picture || 'https://via.placeholder.com/150' }}
        style={styles.profileImage}
      />

      <Animated.View style={[styles.verifiedBadge, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons name="checkmark-circle" size={20} color="#fff" />
        <Text style={styles.verifiedText}>LinkedIn Verified</Text>
      </Animated.View>

      <Text style={styles.userName}>
        {userData.firstName} {userData.lastName}
      </Text>

      <View style={styles.emailContainer}>
        <MaterialIcons name="email" size={20} color="#0073b1" />
        <Text style={styles.email}>{userData.email}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.homeButton}
          disabled={loading}
          onPress={handleLinkedinPress}
        >
          z
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Continue with LinkedIn'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#0073b1',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0073b1',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 5,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  email: {
    fontSize: 16,
    color: '#555',
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  homeButton: {
    backgroundColor: '#0073b1',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
  },
});
