import React, { useState, useEffect, useCallback } from 'react';
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

const CompanyContactUs = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { data, id } = route.params;
  const company = data?.data;
  const [headOffice, setHeadOffice] = useState(company?.company_address || '');
  const [email, setEmail] = useState(company?.hr_email || '');
  const [loading, setLoading] = useState(false);

  const payload = {
    company_id: parseInt(company?.company_id ?? 0),
    company_type: company?.company_type ?? '',
    company_logo: company?.company_logo ?? '',
    company_name: company?.company_name ?? '',
    industry: company?.industry ?? '',
    city: company?.city ?? '',
    company_address: headOffice ?? '',
    company_email: company?.company_email ?? '',
    company_website: company?.company_website ?? '',
    about: company?.about ?? '',
    hr_email: email ?? '',
    company_gstin: company?.company_gstin ?? '',
    verified_status: company?.verified_status ?? 'N',
    no_of_employees: parseInt(company?.no_of_employees ?? 0),
    country: parseInt(company?.country ?? 0),
    state: parseInt(company?.state ?? 0),
    pincode: parseInt(company?.pincode ?? 0),
    founded_year: parseInt(company?.founded_year ?? 0),
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSave = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.COMPANY_DETAILS, payload);
      const res = response?.data;

      if (res?.status === 'success') {
        navigation.navigate('MyTabs');
        setLoading(false);
      } else {
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
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Company Details</Text>
        </View>
        <TouchableOpacity
          disabled={loading}
          onPress={handleSave}
          style={styles.saveButtonContainer}
        >
          <Text style={styles.saveButtonText}> {loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.inputContainer}>
          <Text style={styles.label}>HR Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#C8C8C8"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Head Office</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Head Office"
            value={headOffice}
            onChangeText={setHeadOffice}
            placeholderTextColor="#C8C8C8"
          />
        </View>

        <View style={styles.bottomPadding} />
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
    borderBottomWidth: 1,
    borderColor: '#00000014',
    shadowColor: '#00000014',
    shadowOffset: { width: -2, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 5,
    marginLeft: 4,
  },
  saveButtonContainer: {
    borderWidth: 1,
    borderColor: '#14B6AA',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  saveButtonText: {
    color: '#14B6AA',
    fontSize: 18,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    color: '#000000',
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'Poppins-Medium',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  bottomPadding: {
    height: 50,
  },
});

export default CompanyContactUs;
