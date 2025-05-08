/*
 * Developed by Aman Kumar and Anirudh Bhardwaj
 * Date: 2025-01-29
 * Description: Signup Process Step 1.
 */
import React, { useState, useEffect } from 'react';
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
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { AppBar } from '@react-native-material/core';
import Icon from 'react-native-vector-icons/Ionicons';

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import style from '../../theme/style';
import { Colors } from '../../theme/color';
import { API_ENDPOINTS } from '../../api/apiConfig';
import auth from '@react-native-firebase/auth';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox } from 'react-native-paper';

const width = Dimensions.get('screen').width;

export default function Signup() {
  // Navigation
  const route = useRoute();
  const { userType } = route.params || {}; // Receive the Role Type (Job Seeker or Company)
  const navigation = useNavigation();

  const [isChecked, setIsChecked] = useState(false);
  const toggleCheckbox = () => setIsChecked((prev) => !prev);

  console.log('User Type:', userType);

  GoogleSignin.configure({
    webClientId: '576594960088-9g80r1o2160i4pm4q26nu1nm0hai1d8s.apps.googleusercontent.com',
  });

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  const handleInputChange = (field, value) => {
    // Special handling for phone to only allow digits
    if (field === 'phone' && !/^\d{0,10}$/.test(value)) {
      return;
    }

    setFormData({
      ...formData,
      [field]: value,
    });

    // Clear error when typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { fullName, email, phone, password } = formData;

    // Validate fullName
    if (!fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    } else if (!/^[A-Za-z][A-Za-z\s]*$/.test(fullName)) {
      newErrors.fullName = 'Full Name should not start with a number.';
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Validate phone
    if (!phone.trim()) {
      newErrors.phone = 'Please enter your phone number.';
    }

    if (phone && !/^[0-9]{10}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number.';
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Please enter your password.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignin = async () => {
    console.log('Starting Google sign-in');
    try {
      setIsLoading(true);

      // Check if the device supports Google Play Services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Google sign-in process
      const signInResult = await GoogleSignin.signIn();
      console.log('Google sign-in successful');

      const idToken = signInResult?.idToken || signInResult?.data?.idToken;
      if (!idToken) {
        throw new Error('No ID token found in Google sign-in response');
      }

      // Create Google credential
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign in with Firebase credential
      const authResult = await auth().signInWithCredential(googleCredential);

      const user = authResult?.user;
      if (!user) {
        throw new Error('User object not found after authentication');
      }

      const userInfo = {
        name: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        uid: user.uid,
      };
      console.log('Google User Info:', userInfo);

      if (!userInfo.email) {
        throw new Error('Email not provided by Google authentication');
      }

      // Set default user type if undefined
      const role = userType || 'User';

      try {
        const params = {
          email: userInfo.email,
          password: 'default', // Placeholder password
          name: userInfo.name || 'Google User',
          status: 'Active',
          role_type: role,
        };

        // Register the user
        const response = await axios.post(API_ENDPOINTS.REGISTER_USER, params);
        console.log('API Response:', response.data);

        let userId;
        let roleId;

        if (response.data.status === 'success') {
          console.log('this part excute');
          userId = response.data?.user_id;

          if (userId) {
            await AsyncStorage.setItem('userId', userId.toString());
            console.log('Successfully stored user ID:', userId);
            roleId = response.data?.role_id;
            await AsyncStorage.setItem('roleId', roleId.toString());
            const stepResponse = await axios.post(API_ENDPOINTS.STEP, {
              user_id: userId,
              role_id: roleId,
              steps: '1',
            });
            console.log('Step Response:', stepResponse.data);
          }

          const introResponse = await axios.post(API_ENDPOINTS.INTRODUCTION, {
            user_full_name: userInfo.name,
            user_id: userId,
          });
          const basicDetailsResponse = await axios.post(API_ENDPOINTS.BASIC_DETAILS, {
            email: userInfo.email,
            user_id: userId,
          });

          console.log('Intro Response:', introResponse.data);
          console.log('Basic Details Response:', basicDetailsResponse.data);
        } else if (response.data.code === -20001) {
          // User already exists, fetch the user ID
          console.log('User already exists, fetching user ID');

          const loginResponse = await axios.get(
            `${API_ENDPOINTS.AUTHENTICATION}?email=${userInfo.email}`
          );
          console.log('Login Response:', loginResponse.data);

          userId = loginResponse.data?.data?.user_id;
          roleId = loginResponse.data?.data?.role_id;

          if (userId && roleId) {
            await AsyncStorage.setItem('userId', userId.toString());
            console.log('Successfully stored user ID:', userId);
            await AsyncStorage.setItem('roleId', roleId.toString());
            console.log('Successfully stored role ID:', roleId);
          }
        } else {
          console.error('Failed registration:', response.data);
          Alert.alert('Error', 'Failed to register or retrieve user ID.');
          return;
        }

        // Navigate to the main screen
        if (userId) {
          navigation.navigate('Validate');
        } else {
          console.error('User ID not found in API response');
          Alert.alert('Error', 'Failed to retrieve user ID.');
        }

        return authResult;
      } catch (apiError) {
        console.error('API Error:', apiError);
        const errorMessage = apiError.response?.data?.message || 'An API error occurred.';
        Alert.alert('API Error', errorMessage);
        throw apiError;
      }
    } catch (error) {
      console.error('Google Sign-in Error:', error);
      Alert.alert(
        'Google Sign-in Error',
        error.message || 'An error occurred during Google sign-in.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const { fullName, email, phone, password } = formData;

    try {
      // ✅ Check if the email already exists
      const methods = await auth().fetchSignInMethodsForEmail(email);

      let firebaseUser;

      if (methods.length > 0) {
        console.log('✅ User already exists. Linking accounts.');

        // 🔥 User already exists → Link account
        const credential = auth.EmailAuthProvider.credential(email, password);
        const currentUser = await auth().signInWithCredential(credential);

        firebaseUser = currentUser.user;
      } else {
        console.log('🔥 New user. Creating Firebase account.');

        // ✅ Create new user
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        firebaseUser = userCredential.user;
      }

      // ✅ Firebase User Created or Linked → Store UID
      if (firebaseUser) {
        console.log('✅ Firebase UID:', firebaseUser.uid);

        // ✅ Store Firebase UID in AsyncStorage
        await AsyncStorage.setItem('firebaseUID', firebaseUser.uid);
      }

      // ✅ Store in Your Own Database
      const params = {
        email: email.toLowerCase(),
        password,
        name: fullName,
        phone,
        status: 'Active',
        role_type: userType || 'User', // Provide a default role type
      };

      const response = await axios.post(API_ENDPOINTS.REGISTER_USER, params);
      console.log('API Response:', response.data);

      if (response.status === 200 || response.status === 201) {
        const responseData = response.data;

        if (responseData.status === 'success') {
          setErrors({});

          // ✅ Store the User ID from your backend
          const userId = responseData.user_id || responseData.data?.user_id;
          const roleId = responseData.role_id || responseData.data?.role_id;

          if (userId) {
            await AsyncStorage.setItem('userId', userId);

            const stepResponse = await axios.post(API_ENDPOINTS.STEP, {
              user_id: userId,
              role_id: userType === 'Job Seeker' ? 1 : 2,
              steps: '1',
            });
            console.log('Step Response:', stepResponse.data);

            // ✅ Store Intro & Basic Details
            const introResponse = await axios.post(API_ENDPOINTS.INTRODUCTION, {
              user_full_name: fullName,
              user_id: userId,
            });

            const basicDetailsResponse = await axios.post(API_ENDPOINTS.BASIC_DETAILS, {
              mobile_no: phone,
              email: email,
              user_id: userId,
            });

            console.log(
              '✅ Intro & Basic Details Added:',
              introResponse.data,
              basicDetailsResponse.data
            );

            // ✅ Navigate to Main Screen
            if (introResponse.data.status !== 'error') {
              if (userType === 'Job Seeker') {
                navigation.navigate('Validate');
              } else {
                navigation.navigate('Validate');
              }
            }
          } else {
            Alert.alert('Error', 'User ID not found in response');
          }
        } else if (responseData.status === 'error' || responseData.data?.status === 'error') {
          const cleanMessage =
            responseData.message?.split(':')[1]?.trim() || 'Something went wrong.';
          setErrors((prev) => ({ ...prev, email: cleanMessage }));
        }
      } else {
        console.error('API Error:', response.status, response.data);
        Alert.alert('Error', 'An error occurred during signup.');
      }
    } catch (error) {
      console.error('❌ Signup Error:', error);

      // ✅ Firebase-specific error handling
      if (error.code === 'auth/email-already-in-use') {
        setErrors((prev) => ({ ...prev, email: 'That email address is already in use.' }));
      } else if (error.code === 'auth/invalid-email') {
        setErrors((prev) => ({ ...prev, email: 'That email address is invalid.' }));
      } else if (error.code === 'auth/weak-password') {
        setErrors((prev) => ({
          ...prev,
          password: 'Password is too weak. Use at least 6 characters.',
        }));
      } else if (error.response && error.response.data && error.response.data.message) {
        // ✅ Axios specific error handling
        setErrors((prev) => ({ ...prev, email: error.response.data.message }));
      } else {
        Alert.alert('Error', error.message || 'An unexpected error occurred during signup.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    field,
    placeholder,
    icon,
    keyboardType = 'default',
    secureTextEntry = false,
    maxLength = null
  ) => {
    const isFocused = focusedField === field;
    const value = formData[field];
    const error = errors[field];

    return (
      <View>
        <View
          style={[
            style.inputContainer,
            {
              marginTop: 15,
              borderColor: isFocused ? Colors.primary : Colors.bord,
            },
          ]}
        >
          {field === 'fullName' ? (
            <Icon name={icon} size={22} color={Colors.disable2} />
          ) : (
            <Icon name={icon} size={20} color={Colors.disable2} />
          )}
          <TextInput
            placeholder={placeholder}
            placeholderTextColor={Colors.disable2}
            selectionColor={Colors.primary}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            value={value}
            onChangeText={(text) => handleInputChange(field, text)}
            style={[
              style.m16,
              {
                color: Colors.active,
                flex: 1,
                marginBottom: -8,
                marginLeft: 10,
              },
            ]}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            maxLength={maxLength}
          />
          {field === 'password' && (
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Icon
                name={!isPasswordVisible ? 'eye-off' : 'eye'}
                color={Colors.disable}
                size={20}
              />
            </TouchableOpacity>
          )}
        </View>
        {error ? <Text style={style.errorBox}>{error}</Text> : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      {/* {isLoading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20
        }}>
       
          <Text style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            fontFamily: 'Poppins-Medium'
          }}>Loading...</Text>
        </View>
      )} */}
      <StatusBar backgroundColor="transparent" translucent={true} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? '' : null}>
        <View
          style={[style.main, { backgroundColor: Colors.bg, paddingBottom: 40, marginTop: 10 }]}
        >
          <AppBar
            color={Colors.bg}
            elevation={0}
            leading={
              <TouchableOpacity onPress={() => navigation.navigate('On1')} style={[style.icon]}>
                <Icon name="arrow-back" size={24} color={'#6C6C6C'} />
              </TouchableOpacity>
            }
          />

          <ScrollView showsVerticalScrollIndicator={false} style={[{ marginTop: 10 }]}>
            <Text
              style={[
                {
                  color: Colors.txt,
                  marginTop: 10,
                  fontSize: 30,
                  fontWeight: 'bold',
                  textAlign: 'center',
                },
              ]}
            >
              Create an account
            </Text>
            <Text
              style={[style.r14, { color: Colors.disable1, textAlign: 'center', marginBottom: 10 }]}
            >
              Please fill registration form below
            </Text>

            {renderInput('fullName', 'Full Name', 'person-outline')}
            {renderInput('email', 'Email', 'mail-outline', 'email-address')}
            {renderInput('password', 'Password', 'lock-closed-outline', 'default', true)}
            {renderInput('phone', 'Mobile Number', 'call-outline', 'phone-pad', false, 10)}

            <TouchableOpacity
              onPress={handleSignup}
              disabled={isLoading || !isChecked}
              style={[
                style.btn,
                {
                  marginTop: 30,
                  marginBottom: 20,
                  opacity: isLoading ? 0.7 : 1,
                  backgroundColor: isChecked ? Colors.primary : Colors.disable2,
                },
              ]}
            >
              <Text style={[style.btntxt, { marginBottom: -8 }]}>
                {isLoading ? 'SIGNING UP...' : 'SIGN UP'}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Checkbox
                status={isChecked ? 'checked' : 'unchecked'}
                onPress={() => setIsChecked(!isChecked)}
                color={isChecked ? '#80559A' : '#000000'}
                uncheckedColor="#E2E8F0"
              />
              <Text style={[style.r14, { color: Colors.txt }]}>
                I agree to the
                <Text style={[style.m14, { color: '#80559A', marginLeft: 10 }]}> terms </Text>
                and{' '}
                <Text style={[style.m14, { color: '#80559A', marginLeft: 10 }]}>conditions</Text>
              </Text>
            </View>

            <View>
              <Text
                style={[style.r14, { color: Colors.disable2, textAlign: 'center', marginTop: 20 }]}
              >
                Or sign in with
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 20,
              }}
            >
              <TouchableOpacity
                onPress={handleGoogleSignin}
                style={[style.btnoutline, { width: width / 3.5 }]}
              >
                <Image
                  source={require('../../../assets/image/a1.png')}
                  resizeMode="stretch"
                  style={{ height: 30, width: 30 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Linkedin')}
                style={[style.btnoutline, { marginLeft: 15, width: width / 3.5 }]}
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
                marginTop: 30,
              }}
            >
              <Text style={[style.r14, { color: Colors.disable2, textAlign: 'center' }]}>
                Already have an account?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login', { userType: userType })}
              >
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
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
