import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // 🔥 Add your API Key here

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

  console.log('userid', userid);
  console.log('roleId', roleId);

  const fetchLocation = () => {
    setLoading(true);

    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

        // Reverse Geocode to get city name
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

        try {
          const response = await fetch(url);
          const data = await response.json();
          if (data.status === 'OK') {
            const address = data.results[0].formatted_address;
            setCurrentLocation(address);
            setSelectedLocation(address);
          } else {
            Alert.alert('Failed to get location', 'Try again later');
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to fetch location');
          console.error(error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error(error);
        Alert.alert('Error', 'Failed to get location. Please enable GPS.');
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
            <Text>{currentLocation ? currentLocation : 'Select Current Location'}</Text>
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

        <TouchableOpacity
          style={styles.proceedButton}
          onPress={handleSubmit}
        >
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
    padding: 20,
    marginTop: 100,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    height: 60,
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  locationList: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15,
    marginTop: 20,
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
  jobTitle: {
    fontSize: 16,
    flex: 1,
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

export default LocationSelection;