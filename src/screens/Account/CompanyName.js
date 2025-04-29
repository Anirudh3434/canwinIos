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
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import DropDownPicker from 'react-native-dropdown-picker';
import { API_ENDPOINTS } from '../../api/apiConfig';

const MAX_CHARS = 500;

const CompanyProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { data } = route.params;
  const company = data?.data;
  console.log(company);

  const [about, setAbout] = useState(company?.about ?? '');
  const [country, setCountry] = useState(company?.country?.toString() ?? '');
  const [state, setState] = useState(company?.state?.toString() ?? '');
  const [city, setCity] = useState(company?.city ?? '');
  const [companyName] = useState(company?.company_name ?? '');
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [countryValue, setCountryValue] = useState(company?.country || null);
  const [stateValue, setStateValue] = useState(company?.state || null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // State for validation errors

  // Fetch country list on component mount
  useEffect(() => {
    fetchCountry();
  }, []);

  // Fetch states when country is selected
  useEffect(() => {
    if (countryValue) {
      fetchState(countryValue);
      setCountry(countryValue.toString());
      // Reset state selection when country changes
      setStateValue(null);
      setState('');
    } else {
      // Clear state list when no country is selected
      setStateList([]);
      setStateValue(null);
      setState('');
    }
  }, [countryValue]);

  // Update state value when state is selected
  useEffect(() => {
    if (stateValue) {
      setState(stateValue.toString());
    }
  }, [stateValue]);

  const handleTextChange = (text) => {
    if (text.length <= MAX_CHARS) {
      setAbout(text);
    }
  };

  const fetchCountry = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.COUNTRY);
      const formattedCountries = response.data.data.map((country) => ({
        label: country.country_name,
        value: country.country_id,
      }));
      setCountryList(formattedCountries);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };

  const fetchState = async (countryId) => {
    if (!countryId) {
      setStateList([]);
      return;
    }
    try {
      const response = await axios.get(`${API_ENDPOINTS.STATE}?country_id=${countryId}`);
      const formattedStates = response.data.data.map((state) => ({
        label: state.state_name,
        value: state.state_id,
      }));
      setStateList(formattedStates);
    } catch (error) {
      console.error('Error fetching state data:', error);
      setStateList([]);
    }
  };

  const handleSave = async () => {
    const newErrors = {};

    if (!countryValue) {
      newErrors.country = 'Please select a country.';
    }
    if (!stateValue) {
      newErrors.state = 'Please select a state.';
    }
    if (!city.trim()) {
      newErrors.city = 'Please enter the city.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    } else {
      setErrors({}); // Clear errors if all fields are valid
    }

    const payload = {
      company_id: parseInt(company?.company_id ?? 0),
      company_type: company?.company_type ?? '',
      company_logo: company?.company_logo ?? '',
      company_name: companyName,
      industry: company?.industry ?? '',
      city: city,
      company_address: company?.company_address ?? '',
      company_email: company?.company_email ?? '',
      company_website: company?.company_website ?? '',
      about: about ?? '',
      hr_email: company?.hr_email ?? '',
      company_gstin: company?.company_gstin ?? '',
      verified_status: company?.verified_status ?? 'N',
      no_of_employees: parseInt(company?.no_of_employees ?? 0),
      country: parseInt(country) || 0,
      state: parseInt(state) || 0,
      pincode: parseInt(company?.pincode ?? 0),
      founded_year: parseInt(company?.founded_year ?? 0),
    };

    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.COMPANY_DETAILS, payload);
      const res = response?.data;
      if (res?.status === 'success') {
        setLoading(false);
        navigation.navigate('MyTabs');
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
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Company Profile</Text>
        </View>
        <TouchableOpacity disabled={loading} onPress={handleSave}>
          <Text style={styles.saveButton}> {loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {/* Company Name (Non-editable) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Company Name</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={companyName}
            editable={false}
            placeholderTextColor="#C8C8C8"
          />
        </View>
        {/* Country Dropdown */}
        <View style={[styles.inputContainer, { zIndex: 3000 }]}>
          <Text style={styles.label}>Country</Text>
          <DropDownPicker
            open={countryOpen}
            value={countryValue}
            items={countryList}
            setOpen={setCountryOpen}
            setValue={setCountryValue}
            setItems={setCountryList}
            placeholder="Select Country"
            style={[styles.dropdown, errors.country && styles.errorInput]}
            dropDownContainerStyle={styles.dropdownContainer}
            maxHeight={200}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
            zIndex={3000}
            searchable={true}
            searchPlaceholder="Search for a country..."
            searchTextInputStyle={styles.searchTextInput}
            searchContainerStyle={styles.searchContainer}
            listItemContainerStyle={styles.listItemContainer}
          />
          {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
        </View>
        {/* State Dropdown */}
        <View style={[styles.inputContainer, { zIndex: 2000 }]}>
          <Text style={styles.label}>State</Text>
          <DropDownPicker
            open={stateOpen}
            value={stateValue}
            items={stateList}
            setOpen={setStateOpen}
            setValue={setStateValue}
            setItems={setStateList}
            placeholder={countryValue ? 'Select State' : 'Select Country first'}
            style={[styles.dropdown, errors.state && styles.errorInput]}
            dropDownContainerStyle={styles.dropdownContainer}
            maxHeight={200}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
            disabled={!countryValue}
            disabledStyle={styles.disabledDropdown}
            zIndex={2000}
            searchable={true}
            searchPlaceholder="Search for a state..."
            searchTextInputStyle={styles.searchTextInput}
            searchContainerStyle={styles.searchContainer}
            listItemContainerStyle={styles.listItemContainer}
          />
          {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
        </View>
        {/* City */}
        <View style={[styles.inputContainer, { zIndex: 1000 }]}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={[styles.input, errors.city && styles.errorInput]}
            placeholder="Enter city"
            value={city}
            onChangeText={setCity}
            placeholderTextColor="#C8C8C8"
          />
          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
        </View>
        {/* Add some space at the bottom to ensure content is not hidden by dropdowns */}
        <View style={{ height: 100 }} />
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
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 5,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    color: '#666',
  },
  dropdown: {
    borderColor: '#D5D9DF',
    borderRadius: 5,
    backgroundColor: '#fff',
    minHeight: 50,
  },
  dropdownContainer: {
    borderColor: '#D5D9DF',
    backgroundColor: '#fff',
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledDropdown: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  searchContainer: {
    borderBottomColor: '#F5F5F5',
    padding: 8,
  },
  searchTextInput: {
    borderColor: '#D5D9DF',
    borderRadius: 5,
    backgroundColor: '#F5F5F5',
    padding: 8,
    fontSize: 14,
  },
  listItemContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
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
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});

export default CompanyProfile;