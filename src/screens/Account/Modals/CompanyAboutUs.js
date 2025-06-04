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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../api/apiConfig';

const MAX_CHARS = 500;

export const CompanyAboutUs = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { data } = route.params;
  const company = data?.data;

  const [about, setAbout] = useState(company?.about ?? '');
  const [loading, setLoading] = useState(false);

  const handleTextChange = (text) => {
    if (text.length <= MAX_CHARS) {
      setAbout(text);
    }
  };

  const handleSave = async () => {
    const payload = {
      company_id: parseInt(company?.company_id ?? 0),
      company_type: company?.company_type ?? '',
      company_logo: company?.company_logo ?? '',
      company_name: company?.company_name ?? '',
      industry: company?.industry ?? '',
      city: company?.city ?? '',
      company_address: company?.company_address ?? '',
      company_email: company?.company_email ?? '',
      company_website: company?.company_website ?? '',
      about: about ?? '',
      hr_email: company?.hr_email ?? '',
      company_gstin: company?.company_gstin ?? '',
      verified_status: company?.verified_status ?? 'N',
      no_of_employees: parseInt(company?.no_of_employees ?? 0),
      country: parseInt(company?.country ?? 0),
      state: parseInt(company?.state ?? 0),
      pincode: parseInt(company?.pincode ?? 0),
      founded_year: parseInt(company?.founded_year ?? 0),
    };

    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.COMPANY_DETAILS, payload);
      const res = response?.data;

      if (res?.status === 'success') {
        navigation.navigate('MyTabs');
        setLoading(false);
      } else {
        Alert.alert('Error', res.message || 'Update failed');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong while saving');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>About Us</Text>
        </View>
        <TouchableOpacity disabled={loading} onPress={handleSave}>
          <Text style={styles.saveButton}> {loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inputContainer}>
          <Text style={styles.label}>About</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Write About the Company"
            value={about}
            onChangeText={handleTextChange}
            multiline
            placeholderTextColor="#C8C8C8"
          />
          <Text style={styles.wordCount}>
            {about.length}/{MAX_CHARS} characters
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

export default CompanyAboutUs;
