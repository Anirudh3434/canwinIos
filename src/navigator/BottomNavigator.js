import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Animated, Pressable, BackHandler, StatusBar } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/color';


import Home from '../screens/Home/Home';
import ComHome from '../screens/Home/ComHome';
import Chat from '../screens/Message/Chat';
import Profile from '../screens/Account/Profile';
import ComProfile from '../screens/Account/ComProfile';
import Application from '../screens/Application/application';
import Apply from '../screens/Apply/Apply';
import Sidebar from '../Components/sideBar';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../redux/slice/sideBarSlice';
import axios from 'axios';
import { API_ENDPOINTS } from '../api/apiConfig';
import HomeSkeleton from '../Components/Skuleton/HomeSkuleton';
import ComHomeSkeleton from '../Components/Skuleton/ComHomeSkulton';
import ProfileSkeleton from '../Components/Skuleton/profile_skelton';
import { setNewMessage } from '../redux/slice/NewMessageSlice';
import NewMessage from '../service/NewMessage';

const Tab = createBottomTabNavigator();

export default function MyTabs() {
  const [initialRoute, setInitialRoute] = useState('Home');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [error, setError] = useState(null);

  const [chats, setChats] = useState([]);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const sideOpen = useSelector((state) => state.sidebar.isOpen);

  const sidebarAnim = useRef(new Animated.Value(-300)).current; // Sidebar animation

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const lastTab = await AsyncStorage.getItem('lastTab');
        const storedUserId = await AsyncStorage.getItem('userId');

        if (lastTab) setInitialRoute(lastTab);
        if (storedUserId) {
          setUserId(storedUserId);

          // Check if userId is valid before making API call
          if (!storedUserId) {
            throw new Error('User ID not found in storage');
          }

          // Make API call to get role information
          const response = await axios.get(API_ENDPOINTS.STEP, {
            params: { user_id: storedUserId },
          });

          // Better handling of the response data
          if (response.data && response.data.data && response.data.data.role_id !== undefined) {
            const userRoleId = parseInt(response.data.data.role_id, 10);

            setRoleId(userRoleId);

            // Also store roleId in AsyncStorage for backup
            await AsyncStorage.setItem('userRoleId', userRoleId.toString());
          } else {
            // Fallback to check if role_id might be at a different location in the response
            if (response.data && response.data.role_id !== undefined) {
              const userRoleId = parseInt(response.data.role_id, 10);

              setRoleId(userRoleId);
              await AsyncStorage.setItem('userRoleId', userRoleId.toString());
            } else {
              throw new Error('Role ID not found in API response');
            }
          }
        } else {
          throw new Error('User ID not found in storage');
        }
      } catch (error) {
        console.error('❌ Error initializing app:', error);

        // Try to recover roleId from AsyncStorage if API call fails
        try {
          const storedRoleId = await AsyncStorage.getItem('userRoleId');
          if (storedRoleId) {
            setRoleId(parseInt(storedRoleId, 10));
          } else {
            // Default to role 1 if we can't determine the role

            setRoleId(1);
            setError(error.message || 'Failed to load user role');
          }
        } catch (storageError) {
          console.error('Failed to recover roleId from storage:', storageError);
          setRoleId(1); // Default to role 1 as fallback
          setError('Failed to determine user role');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);


useEffect(() => {
    // Android back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);

    // iOS & Android navigation gestures
    const unsubscribe = navigation.addListener('beforeRemove', false);

    return () => {
      backHandler.remove();
      unsubscribe();
    };
  }, [navigation]);
 

  const handleTabPress = async (routeName) => {
    try {
      await AsyncStorage.setItem('lastTab', routeName);
    } catch (error) {
      console.error('Failed to save last tab:', error);
    }
  };

  // ✅ Sidebar animation handler
  const animateSidebar = (open) => {
    Animated.timing(sidebarAnim, {
      toValue: open ? 0 : -300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    animateSidebar(sideOpen);
  }, [sideOpen]);

  const closeSidebar = () => {
    if (sideOpen) {
      dispatch(toggleSidebar()); // Close the sidebar
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    initializeApp();
  };

  // Fix: use initialRoute instead of undefined lastTab variable
  if (loading && initialRoute === 'Home') {
    return (
      <View style={styles.loadingContainer}>
        <HomeSkeleton />
      </View>
    );
  }
  if (loading && initialRoute === 'ComHome') {
    return (
      <View style={styles.loadingContainer}>
        <ComHomeSkeleton />
      </View>
    );
  }

  if (loading && initialRoute === 'Profile') {
    return (
      <View style={styles.loadingContainer}>
        <ProfileSkeleton />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <HomeSkeleton />
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User ID not found. Please log in again.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleRetry}>
          <Text style={styles.backButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.backButton, { marginTop: 10, backgroundColor: '#777' }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Ensure roleId is defined before rendering tabs
  const safeRoleId = roleId !== null ? roleId : 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar color='black' translucent={false} barStyle={'dark-content'} />
      {/* ✅ Sidebar with outside click detection */}
      {sideOpen && (
        <Pressable style={styles.overlayTouchable} onPress={closeSidebar}>
          <Animated.View
            style={[styles.sidebarContainer, { transform: [{ translateX: sidebarAnim }] }]}
          >
            <Sidebar />
          </Animated.View>
        </Pressable>
      )}

      <Tab.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          tabBarStyle: [
            {
              ...styles.tabBar,
              height: Platform.OS === 'ios' ? 50 : 60,
              borderWidth: Platform.OS === 'ios' ? 0 : 1,
              borderColor: Platform.OS === 'ios' ? 'transparent' : '#ADADAD',
            },
          ],
          tabBarShowLabel: false,
          gestureEnabled: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={safeRoleId === 1 ? Home : ComHome}
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('../../assets/image/home.png')}
                resizeMode="stretch"
                style={[styles.icon, { tintColor: focused ? '#7D53A1' : '#ADADAD' }]}
              />
            ),
            headerShown: false,
          }}
          listeners={{ tabPress: () => handleTabPress('Home') }}
        />

        {safeRoleId === 1 ? (
          <Tab.Screen
            name="Apply"
            component={Apply}
            options={{
              tabBarIcon: ({ focused }) => (
                <Image
                  source={require('../../assets/image/apply.png')}
                  resizeMode="stretch"
                  style={[
                    styles.icon,
                    { tintColor: focused ? '#7D53A1' : '#ADADAD', width: 30, height: 30 },
                  ]}
                />
              ),
              headerShown: false,
            }}
            listeners={{ tabPress: () => handleTabPress('Apply') }}
          />
        ) : (
          <Tab.Screen
            name="Application"
            component={Application}
            options={{
              tabBarIcon: ({ focused }) => (
                <Image
                  source={require('../../assets/image/application.png')}
                  resizeMode="stretch"
                  style={[
                    styles.icon,
                    { tintColor: focused ? '#7D53A1' : '#ADADAD', height: 20, width: 24 },
                  ]}
                />
              ),
              headerShown: false,
            }}
            listeners={{ tabPress: () => handleTabPress('Application') }}
          />
        )}

        <Tab.Screen
          name="Chat"
          component={Chat}
          options={{
            tabBarIcon: ({ focused }) => (
              <View>
                <Image
                  source={require('../../assets/image/comment.png')}
                  resizeMode="stretch"
                  style={[styles.icon, { tintColor: focused ? '#7D53A1' : '#ADADAD' }]}
                />
              </View>
            ),
            headerShown: false,
          }}
          listeners={{ tabPress: () => handleTabPress('Chat') === dispatch(setNewMessage(false)) }}
        />

        <Tab.Screen
          name="Profile"
          component={safeRoleId === 1 ? Profile : ComProfile}
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('../../assets/image/profile.png')}
                resizeMode="stretch"
                style={[styles.icon, { tintColor: focused ? '#7D53A1' : '#ADADAD' }]}
              />
            ),
            headerShown: false,
          }}
          listeners={{ tabPress: () => handleTabPress('Profile') }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFEEEE',
  },
  errorText: {
    fontSize: 18,
    color: '#FF0000',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: '#7D53A1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '75%',
    backgroundColor: '#fff',
    zIndex: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 15,
  },
  tabBar: {
    height: 50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,

    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',

    // iOS Top Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 2,

    // Android won't reflect top shadows — use elevation visually instead if needed
    elevation: 2, // avoid bottom shadow
  },
  icon: {
    height: 24,
    width: 24,
    marginTop: 20,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7D53A1',
    position: 'absolute',
    top: 18,
    right: 0,
  },
});
