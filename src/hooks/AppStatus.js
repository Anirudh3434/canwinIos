import { AppState } from 'react-native';
import { useEffect, useRef } from 'react';
import { API_ENDPOINTS } from '../api/apiConfig';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppStatus = () => {
  const appState = useRef(AppState.currentState);

  const fetchUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      return userId;
    } catch (error) {
      console.error('Error getting userId:', error);
      return null;
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
        updateAppStatus('Y');
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        console.log('App has gone to the background!');
        updateAppStatus('N');
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const updateAppStatus = async (status) => {

   


    try {
      const userId = await fetchUserId();
      if (!userId) return;

      await axios.post(API_ENDPOINTS.CHAT_ACTIVE_STATUS, {
        user_id: userId,
        status: status,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return null;
};

export default AppStatus;
