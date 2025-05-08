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
import Geolocation from 'react-native-geolocation-service';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB0za9KmGAwFEMFzQnkNezm2xW4rHPEczU'; // Your API Key

const { height, width } = Dimensions.get('window');

const LocationSelection = () => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(false);
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
    const backAction = () => {
      // Your custom back button logic
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // Clean up on unmount
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      // iOS permission handling is done by the Geolocation service itself
      return true;
    }

    try {
      // For Android 12+ (API 31+), you might need both permissions
      if (Platform.Version >= 31) {
        const fineLocationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Precise Location Permission',
            message:
              'We need access to your precise location to show relevant information near you.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }
        );

        const backgroundLocationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: 'Background Location Permission',
            message:
              'We need access to your location in the background to provide continuous service.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }
        );

        return fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED;
      }
      // For Android 10+ (API 29+)
      else if (Platform.Version >= 29) {
        const fineLocationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'We need access to your location to show relevant information near you.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }
        );

        return fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED;
      }
      // For Android 9 and below
      else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'We need access to your location to show relevant information near you.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Error requesting location permission:', err);
      return false;
    }
  };

  const fetchLocation = async () => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission not granted');
      return;
    }

    setLoading(true);

    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

        try {
          const response = await fetch(url);
          const data = await response.json();

          if (data.status === 'OK' && data.results.length > 0) {
            // Extract city name or locality from the address components
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
            Alert.alert('Failed to get location', 'Try again later');
          }
        } catch (error) {
          console.error('Error fetching location details:', error);
          Alert.alert('Error', 'Failed to fetch location');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        Alert.alert('Error', 'Failed to get location. Please ensure GPS is enabled.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
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

    const data = {
      user_id: userid,
      prefered_location: selectedLocation,
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
      console.log('Location post error:', error);
      Alert.alert('Error', 'Failed to save location preference. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Where do you want to work?</Text>

        <TouchableOpacity style={styles.locationButton} onPress={fetchLocation}>
          <Image
            source={require('../../../assets/image/location.png')}
            style={{ width: 20, height: 20 }}
          />
          {loading ? (
            <ActivityIndicator size="small" color="#14B6AA" />
          ) : (
            <Text style={styles.locationText}>
              {currentLocation ? currentLocation : 'Select Current Location'}
            </Text>
          )}
        </TouchableOpacity>

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
              <Text style={styles.jobTitle}>{location.title}</Text>
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

        <TouchableOpacity style={styles.proceedButton} onPress={handleSubmit}>
          <Text style={styles.proceedButtonText}>Proceed</Text>
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
    padding: width * 0.05, // 5% of screen width
    marginTop: height * 0.1, // 10% of screen height
  },
  title: {
    fontSize: width * 0.08, // 8% of screen width
    fontWeight: 'bold',
    marginBottom: height * 0.02, // 2% of screen height
    textAlign: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: width * 0.05,
    height: height * 0.08, // 8% of screen height
    backgroundColor: '#F9F9F9',
    padding: width * 0.04,
    borderRadius: 8,
    marginBottom: height * 0.02,
  },
  locationText: {
    flex: 1,
    fontSize: width * 0.04,
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
    marginBottom: height * 0.015,
    width: '100%',
  },
  selectedJobButton: {
    borderColor: '#14B6AA',
    backgroundColor: '#14B6AA0A',
  },
  jobTitle: {
    fontSize: width * 0.045, // 4.5% of screen width
    flex: 1,
  },
  proceedButton: {
    backgroundColor: '#14B6AA',
    padding: width * 0.04,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: height * 0.03,
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: width * 0.05,
    fontWeight: 'bold',
  },
});

export default LocationSelection;
