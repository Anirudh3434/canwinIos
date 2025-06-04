import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  BackHandler,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../theme/color';
import style from '../../theme/style';

import { AppBar } from '@react-native-material/core';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../../api/apiConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { initPusher, disconnectPusher } from '../../service/pusher';
import { useFetchProfileDetail } from '../../hooks/profileData';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

const isSmallScreen = width < 375;

export default function Message() {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params;
  const scrollViewRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const isFocused = useRef(false);
  const channelName = `chat_id_${item?.chat_id}`;
  const [recieverFCM, setRecieverFCM] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [profileDetail, setProfileDetail] = useState({});
  const [chatActiveStatus, setChatActiveStatus] = useState('');
  
  // Hardcoded online/offline status
  const [isOnline] = useState(true); // Change to false to show offline
  
  const getUserId = async () => {
    try {
      const response = await AsyncStorage.getItem('userId');
      setUserId(+response);
    } catch (error) {
      console.error('Error getting userId:', error);
    }
  };

  const FetchRecieveFCM = async (id) => {
    try {
      const response = await axios.get(API_ENDPOINTS.FCM, {
        params: { user_id: id },
      });
      console.log('Reciever FCM', response?.data?.data?.fcm_token);
      return response?.data?.data?.fcm_token;
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const FetchSenderName = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.INTRODUCTION, {
        params: { user_id: userId },
      });
      console.log(response?.data?.data?.full_name);
      setSenderName(response?.data?.data?.full_name);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchChatActiveStatus = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CHAT_ACTIVE_STATUS, {
        params: { user_id: item.other_user },
      });
      setChatActiveStatus(response.data.chat_status);
    } catch (error) {
      console.error('Error fetching chat active status:', error);
    }
  };

  setInterval(() => {
    fetchChatActiveStatus();
  }, 5000);

  useEffect(() => {
    getUserId();
    FetchSenderName();
  }, [userId]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('MyTabs');
      return true; // Prevent default behavior
    });

    return () => backHandler.remove();
  }, [navigation]);

  
  const FetchDetail = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.INTRODUCTION, {
        params: { user_id: item.other_user },
      });

      const Docs = await axios.get(API_ENDPOINTS.DOCS, {
        params: { user_id: item.other_user },
      });

      setProfileDetail({...response.data.data , ...Docs.data.data});
    } catch (error) {
      console.error('Error fetching profile detail:', error);
    }
  };

  const fetchCompanyDetails = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.COMPANY_DETAILS, {
        params: { user_id: item.other_user },
      });
      setCompanyLogo(response.data.data.company_logo);
    } catch (error) {
      console.error('Error fetching profile detail:', error);
    }
  };

  useEffect(() => {
    FetchDetail();
    fetchCompanyDetails();
  }, [item.other_user]);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Just now';

    const date = new Date(dateString);
    if (isNaN(date)) return 'Invalid date';

    const options = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    return date.toLocaleString('en-GB', options).replace(',', '');
  };

  const FetchMessage = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.MESSAGE, {
        params: { chat_id: item?.chat_id },
      });
      setMessage(response.data.data);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const payload = {
        chat_id: item?.chat_id,
        message_text: newMessage,
        sender: userId,
      };
      console.log(payload);

      const response = await axios.post(API_ENDPOINTS.MESSAGE, payload);
      console.log(response.data);
      if (response.data.success === true) {
        console.log('Message sent successfully');
        setNewMessage('');
      }

      // Trigger Pusher event
      try {
        await axios.post(API_ENDPOINTS.NODE_SERVER + '/trigger', {
          channel_name: channelName,
        });
        console.log('Trigger sent successfully');
      } catch (triggerErr) {
        console.log('Trigger error:', triggerErr.message);
      }

      FetchMessage();
      setNewMessage('');
    } catch (error) {
      console.error('Send message error:', error.message);
    }

    console.log('Sender Name', item?.other_user);

    const recieverFCM = await FetchRecieveFCM(+item?.other_user);

    const payload = {
      "fcm_token": recieverFCM,
      "sender_name": senderName,
      "user_id": +item?.other_user,
      "message": newMessage,
      "sender_id": +userId
    };

    console.log('Message payload', payload);

    try {
      const sendNotification = await axios.post(API_ENDPOINTS.NODE_SERVER + '/notify/message', payload);
      console.log(sendNotification.data);
    } catch (error) {
      console.log('sendNotification error', error);
    }
  };

  useEffect(() => {
    getUserId();
    FetchMessage();
  }, [item?.chat_id]);

  // Handle screen focus/blur with proper Pusher management
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 Message screen focused for chat:', item?.chat_id);
      isFocused.current = true;

      // Initialize Pusher connection
      console.log('🔔 Connecting to Pusher channel:', channelName);
      initPusher(channelName, () => {
        console.log('📨 Message received from Pusher for chat:', item?.chat_id);
        if (isFocused.current) {
          FetchMessage();
        }
      });

      setTimeout(() => {
        initPusher(channelName, () => {
          console.log('📨 Message received from Pusher for chat:', item?.chat_id);
          if (isFocused.current) {
            FetchMessage();
          }
        });
      }, 200);

      // Cleanup function that runs when component loses focus
      return () => {
        console.log('📱 Message screen unfocused for chat:', item?.chat_id);
        isFocused.current = false;
        console.log('🔌 Disconnecting from Pusher channel:', channelName);
        disconnectPusher(channelName);
      };
    }, [item?.chat_id, channelName])
  );

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Message component unmounting');
      isFocused.current = false;
      disconnectPusher(channelName);
    };
  }, [channelName]);

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar translucent={false} backgroundColor={Colors.bg} barStyle={'dark-content'} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={{ flex: 1, backgroundColor: Colors.bg }}>
          {/* WhatsApp-like Header */}
          <View style={{ backgroundColor: Colors.bg, marginTop: Platform.OS === 'ios' ? 10 : 0 }}>
            <AppBar
              color={Colors.bg}
              elevation={1}
              style={{ paddingHorizontal: 15, paddingVertical: 12 }}
              leading={
                <View style={styles.whatsappHeader}>
                  {/* Back Button */}
                  <TouchableOpacity
                    onPress={() => navigation.navigate('MyTabs')}
                    style={styles.backButton}
                  >
                    <Ionicons name="arrow-back" size={24} color={Colors.active || '#000'} />
                  </TouchableOpacity>

                  {/* Profile Image with Online Indicator */}
                  <View style={styles.profileImageContainer}>
                    <Image
                      source={
                        profileDetail?.pp_url || companyLogo
                          ? { uri: companyLogo ? companyLogo : profileDetail?.pp_url }
                          : require('../../../assets/image/profileIcon.png')
                        }
                      style={styles.profileImage}
                    />
                    {/* Online Status Indicator */}
                    { chatActiveStatus === 'Y' && <View style={styles.onlineIndicator} />}
                  </View>

                  <View style={styles.nameStatusContainer}>
                    <Text style={styles.nameText} numberOfLines={1}>
                      {profileDetail?.full_name || 'User'}

                    </Text>
                    <Text style={styles.statusText} numberOfLines={1}>
                      {chatActiveStatus === 'Y' ? 'Online' : 'Offline'}
                    </Text> 
                  </View>
                </View>
              }
            />
          </View>

          {/* Messages ScrollView */}
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            style={{
              flex: 1,
              marginTop: 10,
              paddingHorizontal: 20,
            }}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {message.map((item, index) => {
              const isSender = item.sender === userId;
              return (
                <View
                  key={index}
                  style={{ alignItems: isSender ? 'flex-end' : 'flex-start', marginTop: 10 }}
                >
                  <View
                    style={{
                      alignSelf: isSender ? 'flex-end' : 'flex-start',
                      paddingHorizontal: 30,
                      paddingVertical: 10,
                      backgroundColor: isSender ? '#27B1A2' : '#FCEED4',
                      borderTopLeftRadius: isSender ? 15 : 15,
                      borderTopRightRadius: isSender ? 0 : 15,
                      borderBottomLeftRadius: isSender ? 15 : 0,
                      borderBottomRightRadius: isSender ? 15 : 15,
                    }}
                  >
                    <Text style={[style.r14, { color: isSender ? '#fff' : '#262626' }]}>
                      {item.message_text}
                    </Text>
                  </View>
                  <Text style={[style.r10, { color: '#969696', marginTop: 5 }]}>
                    {formatDateTime(item.created_at)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Input Container - Now at bottom */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
            <View
              style={[
                style.inputContainer,
                {
                  marginVertical: 20,
                  height: 55,
                  borderColor: '#DADADA',
                  borderRadius: 30,
                },
              ]}
            >
              <TextInput
                placeholder="Type message..."
                placeholderTextColor={'#B0B0B0'}
                selectionColor={Colors.primary}
                style={[style.r14, { color: Colors.active, flex: 1 }]}
                value={newMessage}
                onChangeText={setNewMessage}
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
                blurOnSubmit={false}
              />
              <TouchableOpacity onPress={handleSendMessage}>
                <Image
                  source={require('../../../assets/image/a19.png')}
                  resizeMode="stretch"
                  style={{ height: 42, width: 42, marginRight: -5 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  whatsappHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  backButton: {
    marginRight: 5,
    padding: 2,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  nameStatusContainer: {
    flexDirection: 'column'
  },
  nameText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#000000',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
  },
});