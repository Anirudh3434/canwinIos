/**
 * Developed by Aman Kumar
 * Date: 2025-01-30
 * Description: Signup Step 2 , Manually Enter email, phone to send OPT on Provided number,email.
 */

import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
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
  const [data, setData] = useState();

  useEffect(() => {
    const fetchBasicDetail = async () => {
      try {
        const user_id = await AsyncStorage.getItem('userId');
        if (user_id) {
          console.log('User ID:', user_id);
          const response = await axios.get(API_ENDPOINTS.BASIC_DETAILS, {
            params: { user_id },
          });
          setData(response.data);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchBasicDetail();
  }, []);

  const navigation = useNavigation();

  const [selectedOption, setSelectedOption] = useState('email'); // Default to email

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
              onPress={() => {
                if (selectedOption === 'email') {
                  navigation.navigate('Email', { data: data });
                } else {
                  navigation.navigate('Phone', { data: data });
                }
              }}
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
