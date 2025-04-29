import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  BackHandler,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import style from '../../theme/style';
import { Colors } from '../../theme/color';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import { Checkbox } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', auth: '' });
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const route = useRoute();
  const { userType } = route.params || {};

  // Load saved credentials when component mounts
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '576594960088-9g80r1o2160i4pm4q26nu1nm0hai1d8s.apps.googleusercontent.com',
    });

    // Load saved credentials
    loadSavedCredentials();

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true // This prevents the back button from working
    );

    // Cleanup the event listener
    return () => backHandler.remove();
  }, []);

  // Load saved credentials from AsyncStorage
  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('rememberedEmail');
      const savedPassword = await AsyncStorage.getItem('rememberedPassword');
      const savedRememberMe = await AsyncStorage.getItem('rememberMeChecked');

      if (savedEmail && savedPassword && savedRememberMe === 'true') {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setIsChecked(true);
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  };

  // Save credentials to AsyncStorage
  const saveCredentials = async () => {
    try {
      if (isChecked) {
        await AsyncStorage.setItem('rememberedEmail', email);
        await AsyncStorage.setItem('rememberedPassword', password);
        await AsyncStorage.setItem('rememberMeChecked', 'true');
      } else {
        // Clear saved credentials if "Remember Me" is unchecked
        await AsyncStorage.removeItem('rememberedEmail');
        await AsyncStorage.removeItem('rememberedPassword');
        await AsyncStorage.removeItem('rememberMeChecked');
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };

  // Handle API call after successful Firebase authentication
  const handleUserAuthentication = async (firebaseUser) => {
    console.log('🔥 Firebase User Email:', firebaseUser.email);

    try {
      // 🔥 Check if the user exists in your backend

      console.log('🔥 Checking user existence...');

      const authResponse = await axios.get(
        `${API_ENDPOINTS.AUTHENTICATION}?email=${firebaseUser.email}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('🔥 Auth Response:', authResponse.data);

      // Handle case where authResponse.data is a plain value (e.g., 401)
      if (authResponse.data.code === 401) {
        console.log('🔹 User not found. Registering...');

        // ✅ Register new user
        const registerResponse = await axios.post(API_ENDPOINTS.REGISTER_USER, {
          email: firebaseUser.email,
          password: 'Google Sign-in',
          name: firebaseUser.displayName || 'Google User',
          status: 'Active',
          role_type: userType,
        });

        console.log('🔥 Registration Response:', registerResponse.data);

        if (registerResponse.data.status === 'success') {
          const userId = registerResponse.data?.user_id;
          const roleId = registerResponse.data?.role_id;

          if (userId) {
            await AsyncStorage.setItem('userId', userId.toString());
            console.log('✅ Stored new user ID:', userId);
            await AsyncStorage.setItem('roleId', roleId.toString());
            console.log('✅ Stored new role ID:', roleId);

            // ✅ Store Intro & Basic Details
            const stepResponse = await axios.post(API_ENDPOINTS.STEP, {
              user_id: userId,
              role_id: userType === 'Job Seeker' ? 1 : 2,
              steps: '1',
            });
            console.log('Step Response:', stepResponse.data);

            try {
              const introResponse = await axios.post(API_ENDPOINTS.INTRODUCTION, {
                user_full_name: firebaseUser.displayName || 'Google User',
                user_id: userId,
              });

              const basicDetailsResponse = await axios.post(API_ENDPOINTS.BASIC_DETAILS, {
                email: firebaseUser.email,
                user_id: userId,
              });

              console.log('✅ Intro Response:', introResponse.data);
              console.log('✅ Basic Details Response:', basicDetailsResponse.data);
            } catch (error) {
              console.error('❌ Error during additional API calls:', error);
            }
          }
        }

        return false; // ✅ Return false after registration
      }

      // ✅ User exists → Proceed with login
      const data = authResponse.data;
      
      // Check if data and data.data exist before accessing properties
      if (data && data.data && data.data.user_id) {
        const user_id = data.data.user_id;
        const role_id = data.data.role_id || 1; // Default to role 1 if not provided

        console.log('🔥 Existing User Data:', data);

        await AsyncStorage.setItem('userId', user_id.toString());
        console.log('✅ Stored existing user ID:', user_id);
        await AsyncStorage.setItem('roleId', role_id.toString());
        console.log('✅ Stored existing role ID:', role_id);

        if (data.status === 'success') {
          if (role_id == 1) {
            navigation.navigate('Validate');
          } else {
            navigation.navigate('Validate');
          }
          return true;
        }
      } else {
        console.warn('❌ Failed to retrieve user data - unexpected response format');
        setErrors({ auth: 'Failed to retrieve user data from server' });
        return false;
      }
    } catch (error) {
      console.error('❌ API Error:', error);
      setErrors({ auth: 'Server error. Please try again later.' });
      return false;
    }
  };

  const handleGoogleSignin = async () => {
    setLoading(true);
    try {
      // Check if device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Get the user's ID token
      const signInResult = await GoogleSignin.signIn();

      // Get ID token from result
      let idToken = signInResult.data?.idToken || signInResult.idToken;
      if (!idToken) {
        throw new Error('No ID token found');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign in with Firebase
      const userCredential = await auth().signInWithCredential(googleCredential);
      const user = userCredential.user;

      // Call API to get user ID
      const success = await handleUserAuthentication(user);

      if (!success) {
        // If API call failed, show alert but don't navigate
        Alert.alert(
          'Authentication Issue',
          'Signed in with Google, but unable to retrieve user data.'
        );
      }
    } catch (error) {
      console.error('Google Sign-in Error:', error);
      if (error.code === 12501) {
        // User canceled the sign-in flow
        console.log('User canceled Google sign-in.');
      } else {
        Alert.alert('Google Sign-in Error', error.message || 'An error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    let valid = true;
    let errorMessages = { email: '', password: '', auth: '' };

    if (!email) {
      errorMessages.email = 'Please enter your email address.';
      valid = false;
    } else {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(email)) {
        errorMessages.email = 'Please enter a valid email address.';
        valid = false;
      }
    }

    if (!password) {
      errorMessages.password = 'Please enter your password.';
      valid = false;
    }

    setErrors(errorMessages);
    return valid;
  };

  const handleLogin = async () => {
    setErrors({ email: '', password: '', auth: '' });

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Save credentials before login
      await saveCredentials();

      // Sign in with Firebase
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Call API to get user ID
      await handleUserAuthentication(user);
    } catch (error) {
      console.error('Login Error:', error);
      let authError = 'Credentials are wrong. Please check your credentials.';

      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-email':
            authError = 'The email address is not valid.';
            break;
          case 'auth/user-disabled':
            authError = 'This user account has been disabled.';
            break;
          case 'auth/user-not-found':
            authError = 'No user found with this email address.';
            break;
          case 'auth/wrong-password':
            authError = 'Incorrect password. Please try again.';
            break;
          case 'auth/too-many-requests':
            authError = 'Too many unsuccessful login attempts. Please try again later.';
            break;
        }
      }
      setErrors((prev) => ({ ...prev, auth: authError }));
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field) => {
    setErrors((prev) => ({ ...prev, [field]: '', auth: '' }));
  };

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar backgroundColor="transparent" translucent={true} barStyle="dark-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={[style.main, { backgroundColor: Colors.bg, marginTop: 50 }]}>
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
            <Text
              style={[
                {
                  color: Colors.txt,
                  marginTop: 50,
                  fontSize: 30,
                  fontWeight: 'bold',
                  textAlign: 'center',
                },
              ]}
            >
              Sign In
            </Text>
            <Text style={[{ color: Colors.disable1, textAlign: 'center' }]}>
              Please sign in to your registered account
            </Text>

            {/* Display authentication error message if present */}
            {errors.auth ? (
              <View
                style={{
                  backgroundColor: '#FFEBEE',
                  padding: 10,
                  borderRadius: 5,
                  marginTop: 20,
                  borderLeftWidth: 4,
                  borderLeftColor: '#D32F2F',
                }}
              >
                <Text style={{ color: '#D32F2F', fontWeight: '500' }}>{errors.auth}</Text>
              </View>
            ) : null}

            <View>
              <View
                style={[
                  style.inputContainer,
                  {
                    marginTop: 50,
                    borderColor:
                      isFocused === 'Email'
                        ? Colors.primary
                        : errors.email
                        ? '#D32F2F'
                        : Colors.bord,
                  },
                ]}
              >
                <Icon
                  name="mail-outline"
                  size={20}
                  color={errors.email ? '#D32F2F' : Colors.disable2}
                />
                <TextInput
                  placeholder="Email"
                  placeholderTextColor={Colors.disable2}
                  selectionColor={Colors.primary}
                  onFocus={() => setIsFocused('Email')}
                  onBlur={() => setIsFocused(false)}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearError('email');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[
                    style.m16,
                    {
                      color: Colors.active,
                      flex: 1,
                      marginBottom: -8,
                      marginLeft: 10,
                    },
                  ]}
                />
              </View>
              {errors.email ? (
                <Text style={[style.errorBox, { color: '#D32F2F' }]}>{errors.email}</Text>
              ) : null}
            </View>

            <View>
              <View
                style={[
                  style.inputContainer,
                  {
                    marginTop: 15,
                    borderColor:
                      isFocused === 'Password'
                        ? Colors.primary
                        : errors.password
                        ? '#D32F2F'
                        : Colors.bord,
                  },
                ]}
              >
                <Icons
                  name="lock-outline"
                  size={22}
                  color={errors.password ? '#D32F2F' : Colors.disable2}
                />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor={Colors.disable2}
                  secureTextEntry={!isPasswordVisible}
                  selectionColor={Colors.primary}
                  onFocus={() => setIsFocused('Password')}
                  onBlur={() => setIsFocused(false)}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError('password');
                  }}
                  style={[
                    style.m16,
                    {
                      color: Colors.active,
                      flex: 1,
                      marginBottom: -8,
                      marginLeft: 10,
                    },
                  ]}
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Icon
                    name={!isPasswordVisible ? 'eye-off' : 'eye'}
                    color={Colors.disable}
                    size={20}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={[style.errorBox, { color: '#D32F2F' }]}>{errors.password}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[
                style.btn,
                {
                  marginTop: 30,
                  marginBottom: 6,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[style.btntxt, { marginBottom: -8 }]}>
                {loading ? 'SIGNING IN...' : 'SIGN IN'}
              </Text>
            </TouchableOpacity>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={style.flexBoxRow}>
                <View style={style.checkboxCont}>
                  <Checkbox
                    status={isChecked ? 'checked' : 'unchecked'}
                    onPress={() => setIsChecked(!isChecked)}
                    color={isChecked ? '#80559A' : '#000000'}
                    uncheckedColor="#E2E8F0"
                  />
                </View>
                <Text style={[style.r14, { color: '#000000', marginTop: 5 }]}>Remember Me</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Forgot')}>
                <Text style={[style.m14, { color: '#80559A', marginLeft: 10 }]}>
                  Forgot Password
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 60,
                marginHorizontal: 50,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: '#94A3B8' }} />
              <Text
                style={[style.r14, { color: '#000000', textAlign: 'center', marginHorizontal: 10 }]}
              >
                Or sign in with
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#94A3B8' }} />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 10,
                marginBottom: 30,
                gap: 50,
              }}
            >
              <TouchableOpacity
                style={[style.btnoutline]}
                onPress={handleGoogleSignin}
                disabled={loading}
              >
                <Image
                  source={require('../../../assets/image/a1.png')}
                  resizeMode="stretch"
                  style={{ height: 30, width: 30 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Linkedin')}
                style={[style.btnoutline, { marginLeft: 50 }]}
              >
                <Image
                  source={require('../../../assets/image/linkedin.png')}
                  resizeMode="stretch"
                  style={{ height: 30, width: 30 }}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 20,
                justifyContent: 'center',
                marginTop: 5,
              }}
            >
              <Text
                style={[
                  style.r14,
                  {
                    color: '#000000',
                    textAlign: 'center',
                    textDecorationLine: 'underline',
                  },
                ]}
              >
                Don't have any account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('On1')}>
                <Text
                  style={[
                    style.m14,
                    {
                      color: '#80559A',
                      textAlign: 'center',
                      textDecorationLine: 'underline',
                      marginLeft: 8,
                    },
                  ]}
                >
                  SIGN UP
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}