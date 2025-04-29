/**
 * Developed by Aman Kumar
 * Date: 2025-01-31
 * Description: Manually Enter Number to send OTP on Provided number.
 */

import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import React, { useState, useRef } from 'react';
import { Colors } from '../../theme/color';
import style from '../../theme/style';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppBar } from '@react-native-material/core';
import Icon from 'react-native-vector-icons/Ionicons';
import PhoneInput from 'react-native-phone-number-input';
import auth from '@react-native-firebase/auth';

export default function Phone() {
  const route = useRoute();
  const navigation = useNavigation();
  const { data } = route.params;
  const [phoneNumber, setPhoneNumber] = useState();
  const phoneInput = useRef(null);

  console.log(phoneNumber);




  const sendOtp = async () => {
    try {
      console.log(phoneNumber)
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      console.log(confirmation);
      navigation.navigate('Otp', { confirmation, type: 'phone' });
    } catch (error) {
      console.error('OTP send error:', error);
      alert('Failed to send OTP. Please check the number.');
    }
  };

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar backgroundColor={Colors.bg} translucent={false} barStyle={'dark-content'} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[style.main, { backgroundColor: Colors.bg, marginTop: 10 }]}>
          <AppBar
            color={Colors.bg}
            elevation={0}
            leading={
              <TouchableOpacity onPress={() => navigation.navigate('VId')} style={[style.icon]}>
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
              Phone Number
            </Text>
            <Text
              style={[style.r12, { color: Colors.disable1, marginTop: 5, textAlign: 'center' }]}
            >
              Your identity helps you discover new people and opportunities
            </Text>

            <PhoneInput
  ref={phoneInput}
  defaultValue={phoneNumber}
  defaultCode="IN" // <- This sets default to India
  layout="first"
  onChangeFormattedText={text => setPhoneNumber(text)}
  codeTextStyle={{ color: Colors.txt }}
  textInputProps={{ placeholderTextColor: '#9E9E9E' }}
  textInputStyle={{ color: Colors.txt }}
  containerStyle={{
    height: 64,
    width: '100%',
    borderColor: Colors.primary,
    borderRadius: 10,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    marginTop: 20,
    marginBottom: 20,
  }}
  textContainerStyle={{
    paddingVertical: 0,
    borderRadius: 50,
    backgroundColor: Colors.bg,
  }}
/>
          </ScrollView>

          <TouchableOpacity onPress={sendOtp} style={[style.btn, { marginVertical: 20 }]}>
            <Text style={[style.btntxt]}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}