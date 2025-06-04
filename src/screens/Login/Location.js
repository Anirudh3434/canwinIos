// LocationSelection.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  PermissionsAndroid,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  BackHandler,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB0za9KmGAwFEMFzQnkNezm2xW4rHPEczU';

const { height, width } = Dimensions.get('window');

const LocationSelection = () => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userid, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [step, setStep] = useState(0);

  const navigation = useNavigation();

  const locations = [
    { title: 'Delhi' },
    { title: 'Mumbai' },
    { title: 'Bangalore' },
    { title: 'Hyderabad' },
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

  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (err) {
      console.warn('Error requesting location permission:', err);
      return false;
    }
  };

  const fetchLocation = async () => {
    setLocationError(null);
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission not granted');
      return;
    }

    setLoading(true);

    // Configure geolocation options
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
      locationProvider: 'auto',
    });

    // First try with lower accuracy but faster response
    Geolocation.getCurrentPosition(
      async (position) => {
        handleLocationSuccess(position);
      },
      (error) => {
        console.log('Initial location attempt failed, trying with higher timeout:', error);
        // If the first attempt fails, try again with higher accuracy and timeout
        Geolocation.getCurrentPosition(
          async (position) => {
            handleLocationSuccess(position);
          },
          (finalError) => {
            handleLocationError(finalError);
          },
          {
            enableHighAccuracy: true,
            timeout: 30000, // Extended timeout
            maximumAge: 10000,
          }
        );
      },
      {
        enableHighAccuracy: false, // Lower accuracy for faster response
        timeout: 10000,
        maximumAge: 60000, // Accept older cached positions
      }
    );
  };

  const handleLocationSuccess = async (position) => {
    const { latitude, longitude } = position.coords;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        let cityName = null;
        const addressComponents = data.results[0].address_components;

        for (const component of addressComponents) {
          if (
            component.types.includes('locality') ||
            component.types.includes('administrative_area_level_2') ||
            component.types.includes('administrative_area_level_1')
          ) {
            cityName = component.long_name;
            break;
          }
        }

        const address = cityName || data.results[0].formatted_address;
        setCurrentLocation(address);
        setSelectedLocation(address);
      } else {
        setLocationError('Could not determine location name');
        Alert.alert(
          'Location Service Issue',
          'Unable to get your location details. Please select from the list below.'
        );
      }
    } catch (error) {
      console.error('Error fetching location details:', error);
      setLocationError('Failed to fetch location details');
      Alert.alert('Error', 'Failed to fetch location details. Please select from the list below.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationError = (error) => {
    console.error('Geolocation error:', error);
    setLoading(false);
    setLocationError(error.message || 'Failed to get location');

    // Provide helpful error message based on error code
    let errorMessage = 'Failed to get your location. ';

    switch (error.code) {
      case 1: // PERMISSION_DENIED
        errorMessage += 'Please check that location permissions are enabled.';
        break;
      case 2: // POSITION_UNAVAILABLE
        errorMessage += 'Location information is unavailable. Please ensure GPS is enabled.';
        break;
      case 3: // TIMEOUT
        errorMessage += 'Request timed out. Please try again or select a location from the list.';
        break;
      default:
        errorMessage += 'Please try again or select a location from the list.';
    }

    Alert.alert('Location Error', errorMessage);
  };

  const handleSubmit = async () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location.');
      return;
    }

    if (!userid) {
      Alert.alert('Error', 'User ID not found. Please login again.');
      return;
    }

    setLoading(true);

    const data = {
      user_id: userid,
      prefered_location: selectedLocation,
    };

    try {
      const response = await axios.post(API_ENDPOINTS.CAREER, data);
      if (response.data.status === 'success') {
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
      }
    } catch (error) {
      console.log('Location post error:', error);
      Alert.alert('Error', 'Failed to save location preference. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Where do you want to work?</Text>

        <TouchableOpacity
          style={[styles.locationButton, locationError && styles.locationButtonError]}
          onPress={fetchLocation}
          disabled={loading}
        >
          <Image
            source={require('../../../assets/image/location.png')}
            style={{ width: 20, height: 20 }}
          />
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#14B6AA" />
              <Text style={styles.loadingText}>Detecting location...</Text>
            </View>
          ) : (
            <Text style={styles.locationText}>
              {currentLocation ? currentLocation : 'Select Current Location'}
            </Text>
          )}
        </TouchableOpacity>

        {locationError && (
          <Text style={styles.errorText}>Please select a location from the list below</Text>
        )}

        <View style={styles.locationList}>
          {locations.map((location, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.jobButton,
                selectedLocation === location.title && styles.selectedJobButton,
              ]}
              onPress={() => setSelectedLocation(location.title)}
            >
              <Text
                style={[
                  styles.jobTitle,
                  selectedLocation === location.title && styles.selectedJobTitle,
                ]}
              >
                {location.title}
              </Text>
              {selectedLocation === location.title && (
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
          style={[
            styles.proceedButton,
            !selectedLocation && styles.proceedButtonDisabled,
            loading && styles.proceedButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedLocation || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.proceedButtonText}>Proceed</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: width * 0.05,
    marginTop: height * 0.1,
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: width * 0.05,
    height: height * 0.08,
    backgroundColor: '#F9F9F9',
    padding: width * 0.04,
    borderRadius: 8,
    marginBottom: height * 0.02,
  },
  locationButtonError: {
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  loaderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: width * 0.02,
  },
  loadingText: {
    fontSize: width * 0.04,
    color: '#14B6AA',
  },
  locationText: {
    flex: 1,
    fontSize: width * 0.04,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: width * 0.035,
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  locationList: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: height * 0.02,
    marginTop: height * 0.02,
  },
  jobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: width * 0.04,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '100%',
    justifyContent: 'space-between',
  },
  selectedJobButton: {
    borderColor: '#14B6AA',
    backgroundColor: '#E6FAF9',
  },
  jobTitle: {
    fontSize: width * 0.045,
  },
  selectedJobTitle: {
    fontWeight: '500',
    color: '#14B6AA',
  },
  proceedButton: {
    marginTop: height * 0.05,
    backgroundColor: '#14B6AA',
    padding: width * 0.04,
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedButtonDisabled: {
    backgroundColor: '#B4DCD9',
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
});

export default LocationSelection;
