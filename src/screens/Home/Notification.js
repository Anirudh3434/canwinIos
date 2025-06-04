import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
  Platform,
  RefreshControl,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import style from '../../theme/style';
import { Colors } from '../../theme/color';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppBar } from '@react-native-material/core';
import { API_ENDPOINTS } from '../../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Notification = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);







  const fetchNotifications = async () => {
    try {
      const userId = await FetchUserid();
      const response = await axios.get(API_ENDPOINTS.GET_NOTIFICATION, {
        params: { user_id: userId },
      });
      // Sort by date and time in descending order (newest first)
      const sortedNotifications = response.data.data.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB - dateA;
      });
      setNotifications(sortedNotifications);
    } catch (error) {
      
    }
  };

   const FetchUserid = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      return userId;
    } catch (error) {
      console.error('Error getting userId:', error);
    }
  };


  const handleClearAll = async () => {
    try {
      const userId = await FetchUserid();
      await axios.delete(API_ENDPOINTS.GET_NOTIFICATION, {
        params: { user_id: userId },
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  console.log('notifications', notifications);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications().finally(() => setRefreshing(false));
  }, []);

  // Function to format date for grouping
  const formatDateGroup = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to compare dates only
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    } else {
      // Format as "Jan 15, 2024"
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  // Group notifications by date
  const groupNotificationsByDate = (notifications) => {
    const grouped = {};
    
    notifications.forEach(notification => {
      const dateGroup = formatDateGroup(notification.date);
      if (!grouped[dateGroup]) {
        grouped[dateGroup] = [];
      }
      grouped[dateGroup].push(notification);
    });

    return grouped;
  };

  const getIconConfig = (title) => {
    switch (title) {
      case 'Your Profile was Viewed':
        return {
          name: 'person-outline',
          color: '#4A90E2',
          backgroundColor: '#E8F3FF',
        };
      case 'Application Update':
        return {
          name: 'construct-outline',
          color: '#F5A623',
          backgroundColor: '#FFF8E1',
        };
      case 'Interview Reminder':
        return {
          name: 'calendar-outline',
          color: '#7ED321',
          backgroundColor: '#F0F9E8',
        };
      case 'Job Application':
        return {
          name: 'briefcase-outline',
          color: '#BD10E0',
          backgroundColor: '#F8E8FF',
        };

      case 'Offer Letter':
        return {
          name: 'document-outline',
          color: '#F5A623',
          backgroundColor: '#FFF8E1',
        };
      default:
        return {
          name: 'chatbubble-ellipses-outline',
          color: '#50D2C2',
          backgroundColor: '#E8FDFA',
        };
    }
  };

  const handleNotificationPress = async (item) => {
    try {
      console.log('Notification item:', item);
  
      const userId = await FetchUserid();

      console.log('User ID:', userId);
  
      const genericTitles = ['Job Application', 'Application Update', 'Interview Reminder', 'Your Profile was Viewed'];

      console.log('Generic titles:', genericTitles);
  
      if (item.title === 'Offer Letter') {
        navigation.navigate('OfferLetterView', { jobId: item.job_id });
      } 
      
      else if (!genericTitles.includes(item.title)) {
        const chatResponse = await axios.get(API_ENDPOINTS.CHAT_ROOM, {
          params: {
            sender: userId,
            receiver: item.sender_id,
          },
        });
  
       navigation.navigate('Message', {
         item: chatResponse.data,
       });
       
      } 
      
      else {
        console.log('Job ID:', item.job_id);
        const response = await axios.get(API_ENDPOINTS.GET_JOB_BY_ID, {
          params: { job_id: item.job_id },
        });
  
        const dataWithApplicationId = {
          ...response.data.data,
          application_id: item.application_id,
        };
  
        console.log('Job details with application ID:', dataWithApplicationId);
  
        navigation.navigate('ApplicationTrack', { item: dataWithApplicationId });
      }
  
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };
  

  const NotificationItem = ({ item }) => {
    const iconConfig = getIconConfig(item.title);

    const is_read =item.is_read == "Y";
    
    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        style={{
          flexDirection: 'row',
          marginBottom: 2,
          paddingHorizontal: 16,
          paddingVertical: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#E9F2F1',
          backgroundColor: is_read ? '#ffffff' : '#F5FFFE',
        }}
      >
        {/* Icon Container */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: iconConfig.backgroundColor,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          <Icon
            name={iconConfig.name}
            size={20}
            color={iconConfig.color}
          />
        </View>

        {/* Content Container */}
        <View style={{ flex: 1 }}>
          <View
            style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: 4,
            }}
          >
            <Text 
              style={[
                style.s14, 
                { 
                  color: Colors.txt, 
                  fontWeight: '600',
                  flex: 1,
                  marginRight: 8,
                }
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text 
              style={[
                style.r12, 
                { 
                  color: Colors.disable,
                  fontSize: 11,
                }
              ]}
            >
              {item.time}
            </Text>
          </View>
          <Text 
            style={[
              style.r12, 
              { 
                color: '#666666',
                lineHeight: 16,
              }
            ]}
            numberOfLines={2}
          >
            {item.message}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const SectionHeader = ({ title }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 12,
        marginTop: 16,
      }}
    >
      <Text
        style={{
          color: Colors.disable,
          fontSize: 13,
          fontFamily: 'Poppins-Medium',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Text>
     
    </View>
  );

  const groupedNotifications = groupNotificationsByDate(notifications);
  const dateGroups = Object.keys(groupedNotifications);


  const sortedDateGroups = dateGroups.sort((a, b) => {
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Yesterday') return -1;
    if (b === 'Yesterday') return 1;
    return new Date(b) - new Date(a);
  });

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar backgroundColor={Colors.bg} translucent={false} barStyle="dark-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={{ backgroundColor: Colors.bg, flex: 1 }}>
          <AppBar
            color={Colors.bg}
            title="Notifications"
            centerTitle
            titleStyle={[style.titleStyle, { color: Colors.txt, fontWeight: '600' }]}
            elevation={2}
            style={{ 
              backgroundColor: Colors.bg, 
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderBottomWidth: 0.5,
              borderBottomColor: '#E0E0E0',
            }}
            leading={
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={[
                  style.icon,
                  {
                 
            
             
                  }
                ]}
              >
                <Icon name="arrow-back" size={25} color="#6C6C6C" />
              </TouchableOpacity>
            }
            trailing={
              <TouchableOpacity
              onPress={handleClearAll}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: '#F0F0F0',
                }}
              >
                <Text style={[style.r14, { color: '#666666', fontSize: 12 }]}>Clear All</Text>
              </TouchableOpacity>
            }
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
                colors={[Colors.primary]}
              />
            }
          >
            {notifications.length > 0 ? (
              sortedDateGroups.map((dateGroup, groupIndex) => (
                <View key={dateGroup}>
                  <SectionHeader title={dateGroup} />
                  <View style={{ backgroundColor: Colors.white }}>
                    {groupedNotifications[dateGroup].map((item, index) => (
                      <NotificationItem key={item.id || `${groupIndex}-${index}`} item={item} />
                    ))}
                  </View>
                </View>
              ))
            ) : (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 40,
                  marginTop: 100,
                }}
              >
                <Icon
                  name="notifications-off-outline"
                  size={48}
                  color={Colors.disable}
                  style={{ marginBottom: 12 }}
                />
                <Text
                  style={[
                    style.r14,
                    {
                      color: Colors.disable,
                      textAlign: 'center',
                    },
                  ]}
                >
                  No notifications yet
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Notification;