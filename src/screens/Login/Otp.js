import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../theme/color';
import style from '../../theme/style';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppBar } from '@react-native-material/core';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import auth from '@react-native-firebase/auth';

export default function Otp() {
  const route = useRoute();
  const { phoneNumber, confirmation, type } = route.params || {};
  const navigation = useNavigation();

  // States
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [activeInput, setActiveInput] = useState(0);
  const [timer, setTimer] = useState(70); // 5 minutes 45 seconds
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Refs
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // Fetch user ID on component mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
        }
      } catch (error) {
        console.error('Error fetching userId:', error);
      }
    };

    fetchUserId();

    // Start timer
    startTimer();

    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer functions
  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimer((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, []);

  const formatTime = useCallback((time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  }, []);

  // OTP input handlers
  const handleOtpChange = useCallback(
    (text, index) => {
      if (!/^\d*$/.test(text)) return; // Only allow digits

      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Auto-focus next input
      if (text.length === 1 && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all digits are entered
      if (text.length === 1 && index === 5) {
        const completeOtp = [...newOtp.slice(0, 5), text].join('');
        if (completeOtp.length === 6) {
          // Small delay to allow UI to update before verification
          setTimeout(() => {
            verifyOtp(completeOtp);
          }, 300);
        }
      }
    },
    [otp]
  );

  const handleKeyPress = useCallback(
    (e, index) => {
      if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  // Paste entire OTP function
  const handlePasteOtp = useCallback(async () => {
    try {
      const clipboardContent = await Clipboard.getString();

      // Check if clipboard content is a 6-digit number
      if (/^\d{6}$/.test(clipboardContent)) {
        const otpDigits = clipboardContent.split('');
        setOtp(otpDigits);

        // Focus the last input
        inputRefs.current[5]?.focus();
      }
    } catch (error) {
      console.error('Error pasting OTP:', error);
    }
  }, []);

  // API interactions
  const resendOTP = async () => {
    if (timer > 0 || isResending) return;

    setIsResending(true);

    try {
      // Reset the timer
      setTimer(70);
      startTimer();

      // Logic to resend OTP using Firebase
      const newConfirmation = await auth().signInWithPhoneNumber(phoneNumber);
      route.params.confirmation = newConfirmation;
      Alert.alert('Success', 'OTP has been resent to your number');
    } catch (error) {
      console.error('Error resending OTP:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const verifyOtp = async (manualOtp = null) => {
    const otpCode = manualOtp || otp.join('');

    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    if (isVerifying) return; // Prevent double submission
    setIsVerifying(true);

    try {
      // Verify with Firebase
      await confirmation.confirm(otpCode);

      // Update user progress in backend
      if (userId) {
        try {
          const response = await axios.post(API_ENDPOINTS.STEP, {
            user_id: userId,
            steps: '2',
          });

          if (response.data.status === 'success') {

            try {
              const updateNumber = axios.post(API_ENDPOINTS.BASIC_DETAILS, {
                user_id: userId,
                mobile_no: phoneNumber,
              })

              if(updateNumber.data.status === 'success') {
                console.log('Mobile number updated successfully');
                navigation.navigate('Validate');
              }

            } catch (error) {
              console.error('Error updating mobile number:', error);
            
              
            }

            navigation.navigate('Validate');
          } else {
            throw new Error('Failed to update progress');
          }
        } catch (error) {
          console.error('Error updating step:', error);
          Alert.alert(
            'Error',
            'Your OTP was verified, but we had trouble updating your progress. Please try again.'
          );
        }
      } else {
        Alert.alert('Error', 'User ID not found. Please restart the application and try again.');
      }
    } catch (error) {
      console.error('Invalid OTP:', error);

      // Provide more specific error messages based on Firebase error codes
      if (error.code === 'auth/invalid-verification-code') {
        Alert.alert('Error', 'The OTP you entered is incorrect. Please try again.');
      } else if (error.code === 'auth/session-expired') {
        Alert.alert('Error', 'Your verification session has expired. Please request a new OTP.');
        setTimer(0); // Enable resend button
      } else {
        Alert.alert('Error', 'Verification failed. Please try again.');
      }

      // Clear OTP fields on error
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar backgroundColor={Colors.bg} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={[style.main, { backgroundColor: Colors.bg, marginTop: 10 }]}>
          <AppBar
            color={Colors.bg}
            elevation={0}
            leading={
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={style.icon}
                disabled={isVerifying}
              >
                <Icon name="arrow-back" size={24} color={Colors.active} />
              </TouchableOpacity>
            }
          />
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
            <Text
              style={{
                color: Colors.txt,
                marginTop: 150,
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: 30,
              }}
            >
              OTP Verification
            </Text>
            <Text
              style={[style.r12, { color: Colors.disable1, marginTop: 5, textAlign: 'center' }]}
            >
              Please enter verification code sent to {type === 'email' ? 'email' : 'number'}
              <Text style={{ color: Colors.active }}> {phoneNumber}</Text>
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 20 }}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={{
                    textAlign: 'center',
                    height: 57,
                    width: 50,
                    borderRadius: 12,
                    fontSize: 20,
                    color: Colors.txt,
                    borderColor: activeInput === index ? Colors.primary : Colors.bord,
                    borderWidth: 1,
                    fontFamily: 'Poppins-SemiBold',
                    backgroundColor: isVerifying ? Colors.disable2 + '20' : Colors.bg,
                  }}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onFocus={() => setActiveInput(index)}
                  editable={!isVerifying && !isResending}
                />
              ))}
            </View>

            <Text
              style={[style.m14, { color: Colors.disable2, marginTop: 20, textAlign: 'center' }]}
            >
              Resend code in <Text style={{ color: Colors.primary }}>{formatTime(timer)}</Text>
            </Text>

            {timer === 0 && (
              <TouchableOpacity
                onPress={resendOTP}
                disabled={isResending || isVerifying}
                style={{
                  marginTop: 15,
                  alignItems: 'center',
                  opacity: isResending || isVerifying ? 0.7 : 1,
                }}
              >
                {isResending ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text
                    style={{ color: Colors.primary, fontFamily: 'Poppins-Medium', fontSize: 14 }}
                  >
                    Resend OTP
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
          <TouchableOpacity
            onPress={() => verifyOtp()}
            disabled={isVerifying || isResending || otp.join('').length !== 6}
            style={[
              style.btn,
              {
                marginVertical: 20,
                opacity: isVerifying || isResending || otp.join('').length !== 6 ? 0.7 : 1,
              },
            ]}
          >
            {isVerifying ? (
              <View
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
              >
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />
                <Text style={style.btntxt}>VERIFYING</Text>
              </View>
            ) : (
              <Text style={style.btntxt}>VERIFY</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
