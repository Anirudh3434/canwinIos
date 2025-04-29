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
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import DropDownPicker from 'react-native-dropdown-picker';

const BasicDetail = () => {
  const route = useRoute();
  const { data, id } = route.params || {};
  const navigation = useNavigation();

  // State for form fields
  const [workStatus, setWorkStatus] = useState(data?.work_status || '');
  const [country, setCountry] = useState(data?.current_country || '');
  const [state, setState] = useState(data?.current_state || '');
  const [city, setCity] = useState(data?.current_city || '');
  const [mobileNumber, setMobileNumber] = useState(data?.mobile_number || '');
  const [email, setEmail] = useState(data?.email || '');
  const [availability, setAvailability] = useState(data?.availability_to_join || '');

  // Error state variables
  const [mobileNumberError, setMobileNumberError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [workStatusError, setWorkStatusError] = useState('');
  const [countryError, setCountryError] = useState('');
  const [stateError, setStateError] = useState('');
  const [cityError, setCityError] = useState('');
  const [availabilityError, setAvailabilityError] = useState('');

  // API data states
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dropdown open states
  const [workStatusOpen, setWorkStatusOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data?.current_country && data?.current_state) {
      const filterCountry = countries.filter((country) => country.label === data.current_country);
      const filterState = states.filter((state) => state.label === data.current_state);
      console.log('filterCountry', filterCountry);
      setCountry(filterCountry[0]?.value);
      setState(filterState[0]?.value);
    }
  }, [countries, states]);

  // Hardcoded dropdown items for work status and availability
  const [workStatusItems] = useState([
    { label: 'Employed', value: 'Employed' },
    { label: 'Unemployed', value: 'Unemployed' },
    { label: 'Freelancer', value: 'Freelancer' },
    { label: 'Student', value: 'Student' },
    { label: 'Other', value: 'Other' },
  ]);

  const [availabilityItems] = useState([
    { label: 'Immediately', value: 'Immediately' },
    { label: '15 Days or less', value: '15 Days or less' },
    { label: '1 Month', value: '1 Month' },
    { label: '2 Months', value: '2 Months' },
    { label: '3 Months', value: '3 Months' },
    { label: 'More than 3 Months', value: 'More than 3 Months' },
  ]);

  console.log(data?.current_city);

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (country && country !== '') {
      fetchStates(country);
    } else {
      setStates([]);
      setState('');
      setCities([]);
    }
  }, [country]);

  // API functions
  const fetchCountries = async () => {
    try {
      setIsLoading(true);

      const response = await axios.get(API_ENDPOINTS.COUNTRY);

      console.log(response.data);

      if (response.data) {
        const formattedCountries = response.data?.data?.map((item) => ({
          label: item.country_name,
          value: item.country_id,
          code: item.country_code,
        }));
        setCountries(formattedCountries);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      Alert.alert('Error', 'Failed to load countries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStates = async (countryId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_ENDPOINTS.STATE, { params: { country_id: countryId } });

      if (response.data) {
        const formattedStates = response.data?.data?.map((item) => ({
          label: item.state_name,
          value: item.state_id,
        }));
        setStates(formattedStates);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateInputs = () => {
    let isValid = true;

    if (!workStatus) {
      setWorkStatusError('Work Status is required');
      isValid = false;
    } else {
      setWorkStatusError('');
    }

    if (!country) {
      setCountryError('Country is required');
      isValid = false;
    } else {
      setCountryError('');
    }

    if (!state) {
      setStateError('State is required');
      isValid = false;
    } else {
      setStateError('');
    }

    if (!city?.trim()) {
      setCityError('City is required');
      isValid = false;
    } else {
      setCityError('');
    }

    if (!availability) {
      setAvailabilityError('Availability to Join is required');
      isValid = false;
    } else {
      setAvailabilityError('');
    }

    if (!mobileNumber?.trim()) {
      setMobileNumberError('Mobile number is required');
      isValid = false;
    } else if (mobileNumber.length !== 10 || isNaN(mobileNumber)) {
      setMobileNumberError('Mobile number must be 10 digits');
      isValid = false;
    } else {
      setMobileNumberError('');
    }

    if (!email?.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address');
        isValid = false;
      } else {
        setEmailError('');
      }
    }

    return isValid;
  };

  const handleCountrySelect = useCallback((selectedCountry) => {
    setCountry(selectedCountry);
    setState('');
  }, []);

  const handleStateSelect = useCallback((selectedState) => {
    setState(selectedState);
  }, []);

  const onDropdownOpen = useCallback((setOpen) => {
    Keyboard.dismiss();
    setWorkStatusOpen(false);
    setCountryOpen(false);
    setStateOpen(false);
    setCityOpen(false);
    setAvailabilityOpen(false);
    setOpen(true);
  }, []);

  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }

    const params = {
      user_id: id,
      work_status: workStatus,
      current_country: country || '',
      current_state: state || '',
      current_city: city || '',
      mobile_no: mobileNumber,
      email: email,
      availability_to_join: availability,
    };

    console.log('Params:', params);

    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.BASIC_DETAILS, params);
      if (response.status === 200) {
        navigation.navigate('MyTabs');
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to save data');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getDropdownHeight = (isOpen, numItems) => {
    return isOpen ? Math.min(numItems * 50, 200) : 0;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Basic Details</Text>
        </View>
        <TouchableOpacity disabled={loading} onPress={handleSave} style={styles.saveButtonContainer}>
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Work Status Dropdown */}
        <View style={[styles.inputContainer, { zIndex: 500 }]}>
          <Text style={styles.label}>Work Status</Text>
          <DropDownPicker
            listMode="SCROLLVIEW"
            scrollViewProps={{ nestedScrollEnabled: true }}
            open={workStatusOpen}
            value={workStatus}
            items={workStatusItems}
            setOpen={(open) =>
              open ? onDropdownOpen(setWorkStatusOpen) : setWorkStatusOpen(false)
            }
            setValue={setWorkStatus}
            placeholder="Select Work Status"
            placeholderStyle={styles.placeholderStyle}
            style={[styles.dropdownStyle, workStatusError && styles.dropdownError]}
            dropDownContainerStyle={[
              styles.dropDownContainerStyle,
              { height: getDropdownHeight(workStatusOpen, workStatusItems.length) },
            ]}
            listItemContainerStyle={styles.listItemContainerStyle}
            listItemLabelStyle={styles.listItemLabelStyle}
            zIndex={500}
            zIndexInverse={1000}
          />
          {workStatusError && <Text style={styles.errorText}>{workStatusError}</Text>}
        </View>

        {/* Country Dropdown */}
        <View style={[styles.inputContainer, { zIndex: 400 }]}>
          <Text style={styles.label}>Country</Text>
          <DropDownPicker
            listMode="SCROLLVIEW"
            scrollViewProps={{ nestedScrollEnabled: true }}
            open={countryOpen}
            value={country}
            items={countries}
            setOpen={(open) => (open ? onDropdownOpen(setCountryOpen) : setCountryOpen(false))}
            setValue={handleCountrySelect}
            placeholder="Select Country"
            placeholderStyle={styles.placeholderStyle}
            style={[styles.dropdownStyle, countryError && styles.dropdownError]}
            dropDownContainerStyle={[
              styles.dropDownContainerStyle,
              { height: getDropdownHeight(countryOpen, countries.length) },
            ]}
            listItemContainerStyle={styles.listItemContainerStyle}
            listItemLabelStyle={styles.listItemLabelStyle}
            zIndex={400}
            zIndexInverse={2000}
            searchable={true}
            searchPlaceholder="Search for a country..."
            loading={isLoading}
          />
          {countryError && <Text style={styles.errorText}>{countryError}</Text>}
        </View>

        {/* State Dropdown */}
        <View style={[styles.inputContainer, { zIndex: 300 }]}>
          <Text style={styles.label}>State</Text>
          <DropDownPicker
            listMode="SCROLLVIEW"
            scrollViewProps={{ nestedScrollEnabled: true }}
            open={stateOpen}
            value={state}
            items={states}
            setOpen={(open) => (open ? onDropdownOpen(setStateOpen) : setStateOpen(false))}
            setValue={handleStateSelect}
            placeholder={country ? 'Select State' : 'Please select a country first'}
            placeholderStyle={styles.placeholderStyle}
            style={[styles.dropdownStyle, !country && styles.disabledDropdown, stateError && styles.dropdownError]}
            dropDownContainerStyle={[
              styles.dropDownContainerStyle,
              { height: getDropdownHeight(stateOpen, states.length) },
            ]}
            disabled={!country}
            disabledStyle={styles.disabledDropdown}
            listItemContainerStyle={styles.listItemContainerStyle}
            listItemLabelStyle={styles.listItemLabelStyle}
            zIndex={300}
            zIndexInverse={3000}
            searchable={true}
            searchPlaceholder="Search for a state..."
            loading={country && isLoading}
          />
          {stateError && <Text style={styles.errorText}>{stateError}</Text>}
        </View>

        {/* City Dropdown */}
        <View style={[styles.inputContainer, { zIndex: 200 }]}>
          <Text style={styles.label}>Current City</Text>
          <TextInput
            style={[styles.input, cityError && styles.inputError]}
            value={city}
            onChangeText={setCity}
            placeholder="Enter City"
            placeholderTextColor="#C8C8C8"
          />
          {cityError && <Text style={styles.errorText}>{cityError}</Text>}
        </View>

        {/* Availability Dropdown */}
        <View style={[styles.inputContainer, { zIndex: 100 }]}>
          <Text style={styles.label}>Availability to Join</Text>
          <DropDownPicker
            listMode="SCROLLVIEW"
            scrollViewProps={{ nestedScrollEnabled: true }}
            open={availabilityOpen}
            value={availability}
            items={availabilityItems}
            setOpen={(open) =>
              open ? onDropdownOpen(setAvailabilityOpen) : setAvailabilityOpen(false)
            }
            setValue={setAvailability}
            placeholder="Select Availability"
            placeholderStyle={styles.placeholderStyle}
            style={[styles.dropdownStyle, availabilityError && styles.dropdownError]}
            dropDownContainerStyle={[
              styles.dropDownContainerStyle,
              { height: getDropdownHeight(availabilityOpen, availabilityItems.length) },
            ]}
            listItemContainerStyle={styles.listItemContainerStyle}
            listItemLabelStyle={styles.listItemLabelStyle}
            zIndex={100}
            zIndexInverse={5000}
          />
          {availabilityError && <Text style={styles.errorText}>{availabilityError}</Text>}
        </View>

        {/* Mobile Number Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={[styles.input, mobileNumberError && styles.inputError]}
            placeholder="Enter Mobile Number"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
            placeholderTextColor="#C8C8C8"
            maxLength={10}
          />
          {mobileNumberError && <Text style={styles.errorText}>{mobileNumberError}</Text>}
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, emailError && styles.inputError]}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#C8C8C8"
            autoCapitalize="none"
          />
          {emailError && <Text style={styles.errorText}>{emailError}</Text>}
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
    position: 'relative', // For positioning error messages
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
  dropdownStyle: {
    borderColor: '#D5D9DF',
    borderRadius: 8,
    height: 55,
    backgroundColor: '#fff',
  },
  dropDownContainerStyle: {
    borderColor: '#D5D9DF',
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  listItemContainerStyle: {
    height: 50,
  },
  listItemLabelStyle: {
    color: '#333',
    fontSize: 16,
  },
  placeholderStyle: {
    color: '#C8C8C8',
    fontSize: 16,
  },
  disabledDropdown: {
    backgroundColor: '#f9f9f9',
    borderColor: '#E5E5E5',
  },
  bottomPadding: {
    height: 50,
  },
  inputError: {
    borderColor: 'red',
  },
  dropdownError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});

export default BasicDetail;