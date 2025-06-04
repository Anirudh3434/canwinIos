import {
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React from 'react';
import style from '../../theme/style';
import { Colors } from '../../theme/color';
import { AppBar } from '@react-native-material/core';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import OfferLeter from '../../Components/Cards/OfferLetterEmpCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import { useEffect, useState } from 'react';

const OfferLetter = () => {
  const fetchUserId = async () => {
    const userId = await AsyncStorage.getItem('userId');
    return userId;
  };

  const [offerLetter, setOfferLetter] = useState([]);

  const fetchOfferLetter = async () => {
    const userId = await fetchUserId();
    console.log('userId', userId);
    const response = await axios.get(API_ENDPOINTS.GET_ALL_JOB_APPLICANTS, {
      params: {
        user_id: userId,
        status: 'Offer',
      },
    });
    console.log('response', response.data.data);

    setOfferLetter(response?.data?.data);
  };

  useEffect(() => {
    fetchOfferLetter();
  }, []);
  console.log('offerLetter', offerLetter);

  const navigation = useNavigation();

  return (
    <SafeAreaView style={style.area}>
      <KeyboardAvoidingView style={style.container}>
        <AppBar
          color={Colors.bg}
          elevation={1}
          style={{ paddingHorizontal: 10, paddingVertical: 10 }}
          leading={
            <View style={styles.headerLeading}>
              <TouchableOpacity onPress={() => navigation.navigate('MyTabs')}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Offer Letters</Text>
            </View>
          }
        />

        <View>
          <FlatList
            data={offerLetter}
            renderItem={({ item }) => <OfferLeter offerLetter={item} />}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
            ListEmptyComponent={<Text style={style.emptyText}>No Offer Letters Found</Text>}
            ListFooterComponent={<View style={{ height: 20 }}></View>}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OfferLetter;

const styles = StyleSheet.create({
  headerLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 5,
  },
});
