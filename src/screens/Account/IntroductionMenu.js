import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';

const IntroductionScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const { data, id } = route.params || {};

  const [fullName, setFullName] = useState(data?.full_name || '');
  const [profileHeadline, setProfileHeadline] = useState(data?.profile_headline || '');
  const [expertise, setExpertise] = useState(data?.expertise || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSave = async () => {
    const newErrors = {};
    if (fullName.trim() === '') {
      newErrors.fullName = 'Full Name is required';
    }
    if (profileHeadline.trim() === '') {
      newErrors.profileHeadline = 'Profile Headline is required';
    }
    if (expertise.trim() === '') {
      newErrors.expertise = 'Expertise is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    } else {
      setErrors({});
    }

    const params = {
      user_id: id,
      user_full_name: fullName,
      profile_headline: profileHeadline,
      user_expertise: expertise,
    };

    setLoading(true);

    try {
      const response = await axios.post(API_ENDPOINTS.INTRODUCTION, params);
      console.log('API Response:', response.data);

      if (response.data.status === 'success') {
        navigation.navigate('MyTabs');
      } else {
        Alert.alert('Error', response.data?.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', 'Failed to save data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Introduction</Text>
          </View>

          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <Text style={styles.saveButton}>{loading ? 'Saving...': 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.errorInput]}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
            />
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Expertise</Text>
            <TextInput
              style={[styles.input, errors.expertise && styles.errorInput]}
              placeholder="Expertise"
              value={expertise}
              onChangeText={setExpertise}
            />
            {errors.expertise && <Text style={styles.errorText}>{errors.expertise}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Profile Headline</Text>
            <TextInput
              style={[styles.multilineInput, errors.profileHeadline && styles.errorInput]}
              placeholder="Profile Headline"
              value={profileHeadline}
              onChangeText={setProfileHeadline}
              multiline
              textAlignVertical="top"
            />
            {errors.profileHeadline && <Text style={styles.errorText}>{errors.profileHeadline}</Text>}
            <Text style={styles.characterCount}>{profileHeadline.length}/250</Text>
          </View>
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
  container: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  header: {
    padding: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#00000014',
    shadowColor: '#00000014',
    shadowOffset: { width: -2, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 5,
    marginLeft: 4,
  },
  saveButton: {
    color: '#14B6AA',
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#14B6AA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 5,
    fontWeight: 'bold',
  },
  form: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#656565',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  multilineInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    height: 100,
  },
  characterCount: {
    alignSelf: 'flex-end',
    color: '#888',
    marginTop: 5,
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  loader: {
    marginTop: 20,
  },
});

export default IntroductionScreen;