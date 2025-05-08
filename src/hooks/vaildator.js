import { StyleSheet, Text, View, ActivityIndicator, BackHandler } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../api/apiConfig';
import axios from 'axios';
import { CommonActions } from '@react-navigation/native';

export default function Validator() {
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);
  const [steps, setSteps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleBackButton = () => {
      // Prevent back button behavior when loading
      return loading; // Return true to prevent default back press, false to allow it
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    const getUserId = async () => {
      try {
        console.log('Fetching User ID...');
        const storedUserId = await AsyncStorage.getItem('userId');
        console.log('User ID:', storedUserId);
        setUserId(storedUserId);
      } catch (err) {
        console.error('❌ Error fetching user ID:', err);
        setError(err);
        setLoading(false);
      }
    };
    getUserId();

    return () => backHandler.remove(); // Remove the listener on unmount
  }, [loading]); // Add loading as a dependency so the effect re-runs when loading changes

  // ✅ Fetch Steps when userId is set
  useEffect(() => {
    const fetchSteps = async () => {
      if (!userId) return;

      try {
        console.log('Fetching Steps...');
        const response = await axios.get(`${API_ENDPOINTS.STEP}?user_id=${userId}`);
        console.log('Steps Response:', response.data);
        setSteps(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching steps:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchSteps();
  }, [userId]);

  // ✅ Navigate based on steps
  useEffect(() => {
    if (steps) {
      const { role_id, steps: step } = steps;
      const roleRoutes = {
        1: ['VId', 'Category', 'Location', 'MyTabs'],
        2: ['VId', 'ComDetail', 'KycReview', 'MyTabs'],
      };

      const routeName = roleRoutes[role_id]?.[parseInt(step) - 1];
      if (routeName) {
        navigation.navigate(routeName);
      }
    }
  }, [steps, navigation]);

  // ✅ Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#80559A" />
      </View>
    );
  }

  // ✅ Error State
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red' }}>Error: {error.message}</Text>
      </View>
    );
  }

  return null; // Navigation or fallback
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
