// import { View, Text } from 'react-native';
import React from 'react';
import StackNavigator from './src/navigator/StackNavigator';
import 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import store from './src/redux/store';
export default function App() {
  const linking = {
    prefixes: ['myapp://linkedin/callback'],
    config: {
      screens: {
        Home: 'MyTabs/:token',
      },
    },
  };
  return (
    <>
      <Provider store={store}>
        <StackNavigator />
      </Provider>
      <Toast />
    </>
  );
}
