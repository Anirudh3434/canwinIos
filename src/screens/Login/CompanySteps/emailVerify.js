import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../theme/color';
import { useNavigation } from '@react-navigation/native';
import style from '../../../theme/style';

const VerifyEmailScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0); // Track focused input

  const navigation = useNavigation();

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text.length === 1 && index < 3) {
      setFocusedIndex(index + 1); // Update focused index
      inputRefs[index + 1].current.focus();
    }
  };

  return (
    <SafeAreaView style={style.area}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Verify email ID</Text>
        <Text style={styles.emailText}>We have sent an OTP to your email ID</Text>
        <Text style={styles.email}>dva80994@gmail.com</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={[styles.otpInput, focusedIndex === index && styles.focusedInput]} // Apply focused style
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              maxLength={1}
              keyboardType="number-pad"
              ref={inputRefs[index]}
              onFocus={() => setFocusedIndex(index)} // Set focused index on focus
            />
          ))}
        </View>

        <Text style={styles.resendText}>
          Didn't receive it? Resend in <Text style={{ color: Colors.primary }}>00:52</Text>
        </Text>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ComDetail');
          }}
          style={styles.verifyButton}
        >
          <Text style={styles.verifyButtonText}>Verify & Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '80%',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 30,
    width: 300,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 5,
  },
  email: {
    fontFamily: 'Poppins-semiBold',
    color: '#7F7F7FFF',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 20,
  },
  otpContainer: {
    marginTop: 40,
    flexDirection: 'row',
    marginBottom: 10,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: 55,
    height: 60,
    marginHorizontal: 10,
    fontSize: 20,
    textAlign: 'center',
  },
  resendText: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 30,
  },
  verifyButton: {
    width: '100%',
    backgroundColor: Colors.primary, // Teal color
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  focusedInput: {
    borderColor: Colors.primary, // Highlighted border color
    borderWidth: 2,
  },
  resendText: {
    fontFamily: 'Poppins-Regular',
    color: '#9F9F9F',
    marginBottom: 40,
  },
});

export default VerifyEmailScreen;
