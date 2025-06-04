import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Image, View, Text, StyleSheet } from 'react-native';
import { useFetchProfileDetail } from '../../hooks/profileData';
import { Colors } from '../../theme/color';
import style from '../../theme/style';
import { API_ENDPOINTS } from '../../api/apiConfig';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const Chats = ({ item, newChatId }) => {
  const [message, setMessage] = useState([]);
  const [profileDetail, setProfileDetail] = useState({});
  const [companyLogo, setCompanyLogo] = useState('');

  const [chatActiveStatus, setChatActiveStatus] = useState('');



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

  const navigation = useNavigation();


  const FetchMessage = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.MESSAGE, {
        params: { chat_id: item.chat_id },
      });
      setMessage( response.data.data);
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  setInterval(() => {
    fetchChatActiveStatus();
  }, 5000);


  useEffect(() => {
    FetchMessage();
  }, [item.chat_id]);


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

  useEffect(() => {
    fetchChatActiveStatus();
  }, [item.other_user]);

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('Message', { item: item });
      }}
      style={styles.cardContainer}
    >
      <Image
        source={
          profileDetail?.pp_url || companyLogo
            ? { uri: companyLogo ? companyLogo : profileDetail?.pp_url }
            : require('../../../assets/image/profileIcon.png')
        }
        resizeMode="stretch"
        style={{ height: 60, width: 60, borderRadius: 50, borderWidth: 1, borderColor: '#eeeeee' }}
      />
      <View style={{ flex: 1, marginLeft: 10, marginTop: 5, gap: 10 }}>
        <Text style={styles.nameText}>{profileDetail?.full_name}</Text>
        <Text style={styles.messageText}>
          {message[message.length - 1]?.message_text || 'Start the conversation'}
        </Text>
      </View>
      {chatActiveStatus === 'Y' ? (
        <View style={styles.newMessageIndicator} />
      ) : null}
    </TouchableOpacity>
  );
};

export default Chats;

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    gap: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingVertical: 20,
  },
  nameText: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: Colors.txt,
  },
  messageText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: Colors.txt,
  },
  newMessageIndicator: {
    width: 20,
    height: 20,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: Colors.primary,
    position: 'absolute',
    left: 40,
    top: 20,
  },
});
