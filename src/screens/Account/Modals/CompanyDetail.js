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
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../api/apiConfig';
import DropDownPicker from 'react-native-dropdown-picker';

const CompanyDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();

  // Safely extract company data with proper fallback
  const { data } = route.params || {};
  const company = data?.data || {};

  // State initialization with proper type conversion and null checks
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [founded, setFounded] = useState('');
  const [employee, setEmployee] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [industryList, setIndustryList] = useState([
    { label: 'Technology', value: 'Technology' },
    { label: 'Healthcare', value: 'Healthcare' },
    { label: 'Finance', value: 'Finance' },
    { label: 'Education', value: 'Education' },
    { label: 'Manufacturing', value: 'Manufacturing' },
    { label: 'Retail', value: 'Retail' },
    { label: 'Software Development', value: 'Software Development' },
    { label: 'IT Services', value: 'IT Services' },
  ]);

  // Safely set initial values from company data
  useEffect(() => {
    if (company) {
      setEmail(company.company_email || '');
      setWebsite(company.company_website || '');
      setFounded(company.founded_year ? company.founded_year.toString() : '');
      setEmployee(company.no_of_employees ? company.no_of_employees.toString() : '');
      setIndustry(company.industry || '');
    }
  }, [company]);

  const validateInputs = () => {
    const newErrors = {};

    // Email validation
    if (email && !validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Founded year validation
    if (
      founded &&
      (isNaN(founded) ||
        parseInt(founded, 10) < 1800 ||
        parseInt(founded, 10) > new Date().getFullYear())
    ) {
      newErrors.founded = 'Please enter a valid founding year';
    }

    // Employee count validation
    if (employee && (isNaN(employee) || parseInt(employee, 10) < 0)) {
      newErrors.employee = 'Please enter a valid employee count';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSave = async () => {
    // Validate inputs before submission
    if (!validateInputs()) {
      return;
    }

    // Safely prepare the payload with proper type conversions
    const payload = {
      company_id: company?.company_id ? parseInt(company.company_id, 10) : 0,
      company_type: company?.company_type || '',
      company_logo: company?.company_logo || '',
      company_name: company?.company_name || '',
      industry: industry || '',
      city: company?.city || '',
      company_address: company?.company_address || '',
      company_email: email || '',
      company_website: website || '',
      about: company?.about || '',
      hr_email: company?.hr_email || '',
      company_gstin: company?.company_gstin || '',
      verified_status: company?.verified_status || 'N',
      no_of_employees: employee ? parseInt(employee, 10) : 0,
      country: company?.country ? parseInt(company.country, 10) : 0,
      state: company?.state ? parseInt(company.state, 10) : 0,
      pincode: company?.pincode ? parseInt(company.pincode, 10) : 0,
      founded_year: founded ? parseInt(founded, 10) : 0,
    };

    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.COMPANY_DETAILS, payload);
      const res = response?.data;

      if (res?.status === 'success') {
        setLoading(false);
        navigation.navigate('MyTabs');
      } else {
        Alert.alert('Error', res?.message || 'Update failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', 'Something went wrong while saving');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
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
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email ? styles.errorInput : null]}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#C8C8C8"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Website</Text>
          <TextInput
            style={[styles.input, errors.website ? styles.errorInput : null]}
            placeholder="Website"
            value={website}
            onChangeText={setWebsite}
            placeholderTextColor="#C8C8C8"
            autoCapitalize="none"
          />
          {errors.website && <Text style={styles.errorText}>{errors.website}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Founded</Text>
          <TextInput
            style={[styles.input, errors.founded ? styles.errorInput : null]}
            placeholder="Enter Founded Year"
            value={founded}
            onChangeText={setFounded}
            keyboardType="numeric"
            placeholderTextColor="#C8C8C8"
          />
          {errors.founded && <Text style={styles.errorText}>{errors.founded}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Employee</Text>
          <TextInput
            style={[styles.input, errors.employee ? styles.errorInput : null]}
            placeholder="Enter Employee Count"
            value={employee}
            onChangeText={setEmployee}
            keyboardType="numeric"
            placeholderTextColor="#C8C8C8"
          />
          {errors.employee && <Text style={styles.errorText}>{errors.employee}</Text>}
        </View>

        {/* Use conditional rendering to solve zIndex clash */}
        {!open && (
          <View style={[styles.inputContainer, { zIndex: 1 }]}>
            <Text style={styles.label}>Industry</Text>
            <DropDownPicker
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
                keyboardShouldPersistTaps: 'handled',
              }}
              open={open}
              value={industry}
              items={industryList}
              setOpen={setOpen}
              setValue={setIndustry}
              placeholder="Select Industry"
              style={[styles.dropdown, errors.industry ? styles.dropdownError : null]}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={1000}
              zIndexInverse={3000}
              onChangeValue={(value) => {
                setIndustry(value);
                // Close dropdown after selection to avoid layout issues
                setTimeout(() => setOpen(false), 100);
              }}
            />
            {errors.industry && <Text style={styles.errorText}>{errors.industry}</Text>}
          </View>
        )}

        {open && (
          <View style={[styles.inputContainer, { zIndex: 1000 }]}>
            <Text style={styles.label}>Industry</Text>
            <DropDownPicker
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
                keyboardShouldPersistTaps: 'handled',
              }}
              open={open}
              value={industry}
              items={industryList}
              setOpen={setOpen}
              setValue={setIndustry}
              placeholder="Select Industry"
              style={[styles.dropdown, errors.industry ? styles.dropdownError : null]}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={1000}
              zIndexInverse={3000}
              onChangeValue={(value) => {
                setIndustry(value);
                // Close dropdown after selection to avoid layout issues
                setTimeout(() => setOpen(false), 100);
              }}
            />
            {errors.industry && <Text style={styles.errorText}>{errors.industry}</Text>}
          </View>
        )}

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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
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
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
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
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  dropdown: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    paddingVertical: 10, // Reduced vertical padding
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  dropdownError: {
    borderColor: 'red',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    marginTop: 5,
    zIndex: 5000,
  },
});

export default CompanyDetails;
