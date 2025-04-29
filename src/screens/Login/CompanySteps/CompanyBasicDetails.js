import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RadioButton } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../theme/color';
import { useNavigation } from '@react-navigation/native';
import style from '../../../theme/style';

const CompanyBasicDetails = () => {
  const [accountType, setAccountType] = useState('company');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const navigation = useNavigation();

  // Email validation regex
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email input and validation
  const handleEmailChange = (text) => {
    setEmail(text);
    if (text && !validateEmail(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  // Disable button if full name is empty, email is empty, or email is invalid
  const isButtonDisabled = !fullName || !email || !!emailError;

  return (
    <SafeAreaView style={style.area}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Basic Details</Text>
        <Text style={styles.mobile}>Mobile: {''}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Official email ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email ID"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.button, isButtonDisabled && styles.disabledButton]}
          disabled={isButtonDisabled}
          onPress={() => navigation.navigate('EmailVerify')}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CompanyBasicDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  backButton: {
    backgroundColor: 'white',
    padding: 8,
  },
  container: {
    width: '100%',
    height: '80%',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    width: 300,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
    textAlign: 'center',
  },
  mobile: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  accountTypeLabel: {
    fontFamily: 'Poppins-Regular',
    color: '#9F9F9F',
    width: '100%',
    fontSize: 14,
    marginBottom: 8,
  },
  radioContainer: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    marginBottom: 24,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 17,
    marginBottom: 8,
  },
  inputContainer: {
    width: '100%',
    marginTop: 24, // Increased margin
  },
  button: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 50,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#D3D3D3',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
});
