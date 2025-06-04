import {
  View,
  Text,
  Dimensions,
  KeyboardAvoidingView,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Colors } from '../../theme/color';
import style from '../../theme/style';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AppBar } from '@react-native-material/core';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import Chats from '../../Components/Cards/chats';
import { initPusher, disconnectPusher } from '../../service/pusher';
import { useDispatch } from 'react-redux';
import { setNewMessage } from '../../redux/slice/NewMessageSlice';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

export default function Chat() {
  const dispatch = useDispatch();

  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const subscribedChannelsRef = useRef(new Set());
  const isInitialMount = useRef(true);
  const isFocused = useRef(false);

  const FetchUserid = async () => {
    try {
      const response = await AsyncStorage.getItem('userId');
      setUserId(+response);
    } catch (error) {
      console.error('Error getting userId:', error);
    }
  };

  const FetchChat = async () => {
    console.log('📥 Fetching chat...');
    setLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.GET_CHAT, {
        params: { user_id: userId },
      });

      setChats(response.data.data);
    } catch (error) {
      console.error('❌ Error fetching chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChannels = () => {
    if (chats.length === 0 || !isFocused.current) return;

    console.log('🔔 Starting channel subscriptions...');

    chats.forEach((item) => {
      const channelName = `chat_id_${item.chat_id}`;

      // Only subscribe if not already subscribed
      if (!subscribedChannelsRef.current.has(channelName)) {
        console.log('🔔 Subscribing to:', channelName);

        initPusher(channelName, () => {
          console.log('📨 Message received for:', channelName.split('chat_id_')[1]);
          if (isFocused.current) {
            FetchChat();
          }
        });

        subscribedChannelsRef.current.add(channelName);
        console.log('✅ Subscribed to:', channelName);
      }
    });
  };

  const unsubscribeFromAllChannels = () => {
    console.log('🔕 Unsubscribing from all channels');

    // Disconnect from each channel
    subscribedChannelsRef.current.forEach((channelName) => {
      console.log('🔌 Disconnecting from:', channelName);
      disconnectPusher(channelName);
    });

    subscribedChannelsRef.current.clear();
  };

  // Initial setup
  useEffect(() => {
    FetchUserid();
  }, []);

  useEffect(() => {
    if (userId !== null && isInitialMount.current) {
      FetchChat();
      isInitialMount.current = false;
    }
  }, [userId]);

  useEffect(() => {
    if (chats.length > 0 && isFocused.current && subscribedChannelsRef.current.size === 0) {
      subscribeToChannels();
    }
  }, [chats, isFocused.current]);

  // Handle screen focus/blur
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 Chat screen focused');
      isFocused.current = true;

      // Only fetch if we have userId
      if (userId !== null) {
        FetchChat();
      }

      // Subscribe to channels if chats are already loaded
      if (chats.length > 0) {
        subscribeToChannels();
      }

      return () => {
        console.log('📱 Chat screen unfocused');
        isFocused.current = false;
        unsubscribeFromAllChannels();
      };
    }, [userId, chats.length])
  );

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Chat component unmounting');
      isFocused.current = false;
      unsubscribeFromAllChannels();
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
        <StatusBar translucent={false} backgroundColor={Colors.bg} barStyle={'dark-content'} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={[style.r14, { color: Colors.txt }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar translucent={false} backgroundColor={Colors.bg} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View
          style={[
            style.main,
            {
              backgroundColor: Colors.bg,
              marginTop: Platform.OS === 'ios' ? 10 : 0,
              position: 'static',
            },
          ]}
        >
          <AppBar
            color={Colors.bg}
            elevation={0}
            centerTitle={true}
            title="Messages"
            titleStyle={[style.subtitle, { color: Colors.active }]}
          />

          <FlatList
            data={chats}
            keyExtractor={(item) => item.chat_id.toString()}
            renderItem={({ item }) => <Chats item={item} newChatId={[]} />}
            showsVerticalScrollIndicator={false}
          />

          <View
            style={{
              position: 'absolute',
              right: 20,
              bottom: 20,
              alignSelf: 'center',
            }}
          >
         
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
