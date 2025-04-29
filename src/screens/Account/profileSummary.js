import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { setProfileSummary } from '../../redux/slice/profileSummarySlice';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
const MAX_CHARS = 500; // Changed from words to characters

const ProfileSummary = () => {
  const route = useRoute();

  const { data, id } = route.params || {};
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  console.log('profile', data);

  const [profileSummary, setProfileSummaryState] = useState(data?.profile_summary || '');

  const handleSave = async () => {
    const params = {
      profile_summary: profileSummary,
      user_id: id,
    };
    console.log('profileSummary', profileSummary);

    try {
      setLoading(true);
      const response = axios.post(API_ENDPOINTS.Profile_SUMMARY, params);
      if ((await response).data.status === 'success') {
        setLoading(false)
        navigation.navigate('MyTabs');
      }
    } catch (error) {
      setLoading(false)
      console.error(error);
    }
  };

  const handleTextChange = (text) => {
    if (text.length <= MAX_CHARS) {
      setProfileSummaryState(text);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Profile Summary</Text>
        </View>
        <TouchableOpacity disabled={loading} onPress={handleSave}>
          <Text style={styles.saveButton}> {loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Profile Summary</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter Profile Summary"
            value={profileSummary}
            onChangeText={handleTextChange}
            multiline
            numberOfLines={8}
            placeholderTextColor="#C8C8C8"
          />
          <Text style={styles.wordCount}>
            {profileSummary.length}/{MAX_CHARS} characters
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#00000014',
    shadowColor: '#00000014',
    shadowOffset: { width: -2, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 5,
    marginLeft: 4,
  },
  saveButton: {
    color: '#14B6AA',
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#14B6AA',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 5,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#000',
    marginBottom: 5,
  },
  textArea: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 5,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    height: 180,
    minHeight: 180,
  },
  wordCount: {
    marginTop: 5,
    textAlign: 'right',
    color: '#666',
    fontSize: 14,
  },
});

export default ProfileSummary;
