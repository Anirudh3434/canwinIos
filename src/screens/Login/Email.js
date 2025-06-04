/**
 * Developed by Aman Kumar
 * Date: 2025-01-31
 * Description: Manually Enter email to send OPT on Provided email.
 */

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
} from 'react-native';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import style from '../../theme/style';
import { Colors } from '../../theme/color';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppBar } from '@react-native-material/core';
import { ActivityIndicator } from 'react-native-paper';
import auth from '@react-native-firebase/auth';

export default function Email() {
  const navigation = useNavigation();
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const route = useRoute();

  const { data } = route.params;
  const [email, setEmail] = useState(data.data.email);

  const sendMagicLink = async (email) => {
    setIsLoading(true);
    const actionCodeSettings = {
      url: 'https://jobile.com/email',
      handleCodeInApp: true,
      android: {
        packageName: 'com.jobile',
        installApp: true,
        minimumVersion: '12',
      },
    };

    try {
      await auth().sendSignInLinkToEmail(email, actionCodeSettings);
      setIsLoading(false);
      alert('Verification link has been sent to your email.');
    } catch (error) {
      console.error('Error sending magic link: ', error);
      setIsLoading(false);
      alert('Error sending magic link. Please try again.');
    }
  };
  if (isLoading) {
    return (
      <View style={[style.area, { backgroundColor: Colors.bg }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  } else
    return (
      <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
        <StatusBar backgroundColor={Colors.bg} translucent={true} barStyle={'dark-content'} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : null}
        >
          <View style={[style.main, { backgroundColor: Colors.bg, marginTop: 30 }]}>
            <AppBar
              color={Colors.bg}
              elevation={0}
              leading={
                <TouchableOpacity onPress={() => navigation.navigate('VId')} style={[style.icon]}>
                  <Icon name="arrow-back" size={24} color={'#6C6C6C'} />
                </TouchableOpacity>
              }
            />

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
              <Text style={[style.m22, { color: Colors.txt, marginTop: 10 }]}>Email Address</Text>
              <Text style={[style.r16, { color: Colors.disable1 }]}>
                Your identity helps you discover new people and opportunities
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
                <Icon name="mail-outline" size={20} color={Colors.disable2}></Icon>
                <TextInput
                  placeholder="Email"
                  value={email}
                  placeholderTextColor={Colors.disable2}
                  selectionColor={Colors.primary}
                  onFocus={() => setIsFocused('Email')}
                  onBlur={() => setIsFocused(false)}
                  style={[
                    style.m16,
                    { color: Colors.active, flex: 1, marginBottom: -8, marginLeft: 10 },
                  ]}
                />
              </View>

              <TouchableOpacity
                onPress={() => sendMagicLink(email)}
                style={[style.btn, { marginTop: 40, marginBottom: 20 }]}
              >
                <Text style={[style.btntxt, { marginBottom: -8 }]}>VERIFY YOUR EMAIL</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
}
