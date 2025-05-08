/**
 * Developed by Aman Kumar
 * Date: 2025-01-30
 * Description: Signup Step 2 , Manually Enter email, phone to send OPT on Provided number,email.
 */

import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import style from '../../theme/style';
import { Colors } from '../../theme/color';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';

export default function VId() {
  const [userData, setUserData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null); // Initialize to null

  const navigation = useNavigation();

  useEffect(() => {
    const fetchBasicDetail = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          console.log('User ID:', userId);
          const response = await axios.get(API_ENDPOINTS.BASIC_DETAILS, {
            params: { user_id: userId },
          });
          setUserData(response.data);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchBasicDetail();
  }, []);

  const handleContinue = () => {
    if (!selectedOption) {
      Alert.alert('Please select an option to continue');
      return;
    }

    if (userData) {
      if (selectedOption === 'email') {
        navigation.navigate('Email', { data: userData });
      } else if (selectedOption === 'phone') {
        navigation.navigate('Phone', { data: userData });
      }
    } else {
      Alert.alert('Error', 'User data not loaded yet. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar backgroundColor="transparent" translucent={true} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={[style.main, { backgroundColor: Colors.bg, marginTop: 30 }]}>
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 150 }}>
            <Text
              style={[
                {
                  color: Colors.txt,
                  marginTop: 10,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: 30,
                },
              ]}
            >
              Verify your identity
            </Text>
            <Text style={[style.r12, { color: Colors.disable1, textAlign: 'center' }]}>
              Your identity helps you discover new people and opportunities
            </Text>

            {/* Email Verification Option (Commented out as per original code) */}
            {/* <TouchableOpacity
              onPress={() => setSelectedOption('email')}
              style={[
                style.inputContainer,
                {
                  marginTop: 40,
                  borderColor: selectedOption === 'email' ? '#14B6AA' : Colors.bord,
                  borderWidth: selectedOption === 'email' ? 1.5 : 1, // Highlight selected option
                  backgroundColor: selectedOption === 'email' ? '##96D8CDFF' : Colors.bg,
                },
              ]}
            >
              <Icon
                name="mail-outline"
                size={20}
                color={selectedOption === 'email' ? '#14B6AA' : Colors.disable1}
              ></Icon>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text
                  style={[
                    style.s14,
                    { color: selectedOption === 'email' ? '#14B6AA' : Colors.disable1 },
                  ]}
                >
                  Email
                </Text>
                <Text style={[style.r11, { color: Colors.disable1, lineHeight: 13 }]}>
                  Verify with your email
                </Text>
              </View>
            </TouchableOpacity> */}

            <TouchableOpacity
              onPress={() => setSelectedOption('phone')}
              style={[
                style.inputContainer,
                {
                  marginTop: 25,
                  borderColor: selectedOption === 'phone' ? '#14B6AA' : Colors.bord,
                  borderWidth: selectedOption === 'phone' ? 1.5 : 1, // Highlight selected option
                  backgroundColor: selectedOption === 'phone' ? '##A2EBDFFF' : Colors.bg,
                },
              ]}
            >
              <Icon
                name="call-outline"
                size={20}
                color={selectedOption === 'phone' ? '#14B6AA' : Colors.disable1}
              ></Icon>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text
                  style={[
                    style.s14,
                    { color: selectedOption === 'phone' ? '#14B6AA' : Colors.disable1 },
                  ]}
                >
                  Phone Number
                </Text>
                <Text style={[style.r11, { color: Colors.disable1, lineHeight: 13 }]}>
                  Verify with your phone number
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!selectedOption}
              onPress={handleContinue}
              style={[style.btn, { marginTop: 50, marginBottom: 20 }]}
            >
              <Text style={[style.btntxt, { marginBottom: -8 }]}>CONTINUE</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
