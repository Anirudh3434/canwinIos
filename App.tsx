import React, { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import StackNavigator from './src/navigator/StackNavigator';
import store from './src/redux/store';
import AppStatus from './src/hooks/AppStatus';

export default function App() {
  const getPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);
        console.log('✅ Permissions granted');
      } catch (err) {
        console.warn('❌ Permissions error:', err);
      }
    }
  };

  useEffect(() => {
    console.log('📲 App mounted');
    getPermissions();
  }, []);

  return (
    <>
      <Provider store={store}>
        <AppStatus />
        <StackNavigator />
      </Provider>
      <Toast />
    </>
  );
}
