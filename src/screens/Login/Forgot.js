import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import style from '../../theme/style';
import { Colors } from '../../theme/color';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppBar } from '@react-native-material/core';
import auth from '@react-native-firebase/auth';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

export default function Forgot() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleForgotPassword = async () => {
    if (loading || timer > 0) return;

    setLoading(true);
    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert('Password Reset', 'A password reset link has been sent to your email.');
      setTimer(60); // Start 1-minute cooldown
    } catch (error) {
      console.error('Forgot Password Error:', error);
      let errorMessage = 'An error occurred. Please try again.';
      navigation.navigate('Login');

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found. Please check your email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/missing-email') {
        errorMessage = 'Email address is required.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar backgroundColor="transparent" translucent={true} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={[style.main, { backgroundColor: Colors.bg, marginTop: 30 }]}>
          <AppBar
            color={Colors.bg}
            elevation={0}
            leading={
              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={[style.icon]}>
                <Icon name="arrow-back" size={24} color={'#6C6C6C'} />
              </TouchableOpacity>
            }
          />

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
            <Text style={[style.m22, { color: Colors.txt, marginTop: 10 }]}>Forgot Password?</Text>
            <Text style={[style.r16, { color: Colors.disable1 }]}>
              Please enter the address associated with your account
            </Text>

            <View
              style={[
                style.inputContainer,
                {
                  marginTop: 40,
                  borderColor: isFocused === 'Email' ? Colors.primary : Colors.bord,
                },
              ]}
            >
              <Icon name="mail-outline" size={20} color={Colors.disable2} />
              <TextInput
                placeholder="Email"
                placeholderTextColor={Colors.disable2}
                selectionColor={Colors.primary}
                onFocus={() => setIsFocused('Email')}
                onBlur={() => setIsFocused(false)}
                style={[
                  style.m16,
                  {
                    color: Colors.active,
                    flex: 1,
                    marginBottom: -8,
                    marginLeft: 10,
                  },
                ]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              onPress={handleForgotPassword}
              disabled={loading || timer > 0}
              style={[
                style.btn,
                {
                  marginTop: 70,
                  marginBottom: 20,
                  opacity: loading || timer > 0 ? 0.6 : 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : timer > 0 ? (
                <Text style={[style.btntxt, { marginBottom: -8 }]}>
                  Resend in {timer}s
                </Text>
              ) : (
                <Text style={[style.btntxt, { marginBottom: -8 }]}>SEND ME EMAIL</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
