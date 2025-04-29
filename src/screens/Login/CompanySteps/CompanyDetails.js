import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Image,
  BackHandler
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';
import { RadioButton } from 'react-native-paper';
import style from '../../../theme/style';
import { Colors } from '../../../theme/color';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../api/apiConfig';
import { setCompanyDetails } from '../../../redux/slice/CompanyDetail';
import { useDispatch } from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';

const CompanyDetails = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // State variables matching the JSON structure
  const [accountType, setAccountType] = useState('company');
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [noOfEmployees, setNoOfEmployees] = useState('');
  const [designation, setDesignation] = useState('');
  const [countryId, setCountryId] = useState(null);
  const [stateId, setStateId] = useState(null);
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  // Validation states

  const [userId, setUserId] = useState(null);

const fetchUserId = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    setUserId(+userId);
  } catch (error) { 
    console.error('Error fetching user ID:', error);
  }
}





  const [errors, setErrors] = useState({
    accountType: false,
    companyName: false,
    industry: false,
    countryId: false,
    stateId: false,
    city: false,
    pincode: false,
    companyAddress: false,
  });

  // Dropdown states
  const [industryOpen, setIndustryOpen] = useState(false);
  const [industryValue, setIndustryValue] = useState(null);
  const [industryItems, setIndustryItems] = useState([
    { label: 'Technology', value: 'Technology' },
    { label: 'Healthcare', value: 'Healthcare' },
    { label: 'Finance', value: 'Finance' },
    { label: 'Education', value: 'Education' },
    { label: 'Manufacturing', value: 'Manufacturing' },
    { label: 'Retail', value: 'Retail' },
    { label: 'Software Development', value: 'Software Development' },
    { label: 'IT Services', value: 'IT Services' },
  ]);

  const [countryOpen, setCountryOpen] = useState(false);
  const [countryValue, setCountryValue] = useState(null);
  const [countryItems, setCountryItems] = useState([]);


  const [stateOpen, setStateOpen] = useState(false);
  const [stateValue, setStateValue] = useState(null);
  const [stateItems, setStateItems] = useState([]);


  const pickImage = () => {
  ImagePicker.openPicker({
    width: 300,
    height: 300,
    cropping: true,
    cropperCircleOverlay: true,
  })
  .then(async (image) => {
    const base64Data = await RNFS.readFile(image.path, 'base64');
    const blob = {
      name: image.filename || 'company.jpg',
      type: image.mime,
      uri: image.path,
      data: base64Data,
    };

    setCompanyLogo(blob);
    uploadDocument(blob, 'CL');
  })
  .catch((error) => {
    console.log('ImagePicker Error: ', error);
  });
};



const uploadDocument = async (data, type) => {
 
  const payload = {
    user_id: userId,
    type: type,
    file_name: data.name,
    mime_type: data.type,
    blob_file: data.data
  };

  console.log('Payload:', payload);

  try {
    const response = await axios.post( API_ENDPOINTS.DOCS,payload);
    console.log(response.data);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

useEffect(() => {
  const backAction = () => {
    return true;
  };
  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    backAction
  );
  return () => backHandler.remove();
}, []);


  // Fetch countries on component mount
  useEffect(() => {
    fetchCountry();
  }, [countryOpen]);

  // Fetch states when country changes
  useEffect(() => {
    if (countryId) {
      fetchState();
    }
  }, [countryId, stateOpen]);

  const fetchCountry = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.COUNTRY);
      const formattedCountries = response.data.data.map(country => ({
        label: country.country_name,
        value: country.country_id
      }));
      setCountryItems(formattedCountries);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };

  const fetchState = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.STATE}?country_id=${countryId}`);
      console.log('states', response.data);
      const formattedStates = response.data.data.map(state => ({
        label: state.state_name,
        value: state.state_id
      }));
      setStateItems(formattedStates);
      
    } catch (error) {
      console.error('Error fetching state data:', error);
    }
  };

  const validateFields = () => {
    const newErrors = {
      accountType: accountType === '',
      companyName: companyName === '',
      industry: industryValue === null,
      countryId: countryId === null,
      stateId: stateId === null,
      city: city === '',
      pincode: pincode === '',
      companyAddress: companyAddress === '',
    };
    
    setErrors(newErrors);
    
    // Return true if there are no errors
    return !Object.values(newErrors).some(error => error);
  };

  const handleContinue = () => {
    if (!validateFields()) {
      // Fields have errors, don't proceed
      return;
    }
    
    const data = {
      company_type: accountType,
      company_logo: companyLogo,
      company_name: companyName,
      industry: industryValue,
      no_of_employees: parseInt(noOfEmployees) || 0,
      country: countryId,
      state: stateId,
      city: city,
      pincode: pincode,
      company_address: companyAddress,
    };
    
    dispatch(setCompanyDetails(data));
    navigation.navigate('KycIntro');
  };

  return (
    <SafeAreaView style={style.area}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Company details</Text>
    
          <Text style={styles.accountTypeLabel}>You're creating account as a:</Text>
          <View style={styles.radioContainer}>
            <TouchableOpacity style={styles.radioOption} onPress={() => setAccountType('company')}>
              <RadioButton
                value="company"
                status={accountType === 'company' ? 'checked' : 'unchecked'}
                onPress={() => setAccountType('company')}
                color="#14B6AA"
              />
              <Text style={styles.radioText}>Your Company</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setAccountType('consultancy')}
            >
              <RadioButton
                value="consultancy"
                status={accountType === 'consultancy' ? 'checked' : 'unchecked'}
                onPress={() => setAccountType('consultancy')}
                color="#14B6AA"
              />
              <Text style={styles.radioText}>a Consultancy</Text>
            </TouchableOpacity>
          </View>
          
        { !companyLogo &&  <TouchableOpacity style={styles.uploadLogo} onPress={pickImage}>
            <View style={styles.uploadLogoIcon}>
              <Ionicons name="cloud-upload-outline" size={30} color="#ADADAD" />
            </View>
            <Text style={styles.uploadText}>Upload Company logo</Text>
          </TouchableOpacity> 
          }

          {companyLogo && (
            <View style={{width: '100%', height: 150, borderRadius: 5 , alignItems: 'center' , justifyContent: 'center'}}>
              <Image
                source={{ uri: companyLogo.uri }}
                style={{ width: 150, height: 150, borderRadius: 100 }}
              />
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Company</Text>
            <TextInput
              value={companyName}
              onChangeText={(text) => {
                setCompanyName(text);
                setErrors({...errors, companyName: false});
              }}
              style={[
                styles.input, 
                errors.companyName && styles.inputError
              ]}
              placeholder="Enter Company Name"
            />
            {errors.companyName && <Text style={styles.errorText}>Company name is required</Text>}
          </View>
          
          <View style={[styles.inputContainer, { zIndex: 5000 }]}>
            <Text style={styles.label}>Select Industry</Text>
            <DropDownPicker
              listMode="SCROLLVIEW"
              scrollViewProps={{ nestedScrollEnabled: true }}
              open={industryOpen}
              value={industryValue}
              items={industryItems}
              setOpen={setIndustryOpen}
              setValue={(callback) => {
                setIndustryValue(callback);
                setErrors({...errors, industry: false});
              }}
              setItems={setIndustryItems}
              placeholder="Select Industry"
              style={[
                styles.dropdown,
                errors.industry && styles.dropdownError
              ]}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={5000}
              zIndexInverse={1000}
              onChangeValue={setIndustry}
            />
            {errors.industry && <Text style={[styles.errorText , {marginTop : 5}]}>Industry is required</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Number of Employees</Text>
            <TextInput
              value={noOfEmployees}
              onChangeText={setNoOfEmployees}
              style={styles.input}
              placeholder="Enter Number of Employees"
              keyboardType="number-pad"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Designation</Text>
            <TextInput
              value={designation}
              onChangeText={setDesignation}
              style={styles.input}
              placeholder="Enter Designation"
            />
          </View>
          
          <View style={[styles.inputContainer, { zIndex: 4000 }]}>
            <Text style={styles.label}>Select Country</Text>
            <DropDownPicker
              listMode="SCROLLVIEW"
              scrollViewProps={{ nestedScrollEnabled: true }}
              searchable={true}
              open={countryOpen}
              value={countryValue}
              items={countryItems}
              setOpen={setCountryOpen}
              setValue={(callback) => {
                setCountryValue(callback);
                setErrors({...errors, countryId: false});
              }}
              setItems={setCountryItems}
              placeholder="Select Country"
              style={[
                styles.dropdown,
                errors.countryId && styles.dropdownError
              ]}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={4000}
              zIndexInverse={2000}
              onChangeValue={(value) => {
                setCountryId(value);
                setStateValue(null); // Reset state when country changes
                setStateId(null);
                setErrors({...errors, countryId: false});
              }}
            />
            {errors.countryId && <Text style={[styles.errorText , {marginTop : 5}]}>Country is required</Text>}
          </View>
          
          <View style={[styles.inputContainer, { zIndex: 3000 }]}>
            <Text style={styles.label}>Select State</Text>
            <DropDownPicker
              searchable={true}
              listMode="SCROLLVIEW"
              scrollViewProps={{ nestedScrollEnabled: true }}
              open={stateOpen}
              value={stateValue}
              items={stateItems}
              setOpen={setStateOpen}
              setValue={(callback) => {
                setStateValue(callback);
                setErrors({...errors, stateId: false});
              }}
              setItems={setStateItems}
              placeholder="Select State"
              style={[
                styles.dropdown,
                errors.stateId && styles.dropdownError
              ]}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={3000}
              zIndexInverse={3000}
              onChangeValue={(value) => {
                setStateId(value);
                setErrors({...errors, stateId: false});
              }}
              disabled={!countryId}
            />
            {errors.stateId && <Text style={[styles.errorText , {marginTop : 5}]}>State is required</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={[
                styles.input,
                errors.city && styles.inputError
              ]}
              placeholder="Enter City"
              value={city}
              onChangeText={(text) => {
                setCity(text);
                setErrors({...errors, city: false});
              }}
            />
            {errors.city && <Text style={styles.errorText}>City is required</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pin Code</Text>
            <TextInput
              value={pincode}
              onChangeText={(text) => {
                setPincode(text);
                setErrors({...errors, pincode: false});
              }}
              style={[
                styles.input,
                errors.pincode && styles.inputError
              ]}
              placeholder="Enter Pin Code"
              keyboardType="number-pad"
            />
            {errors.pincode && <Text style={styles.errorText}>Pin Code is required</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Company Address</Text>
            <TextInput
              value={companyAddress}
              onChangeText={(text) => {
                setCompanyAddress(text);
                setErrors({...errors, companyAddress: false});
              }}
              style={[
                styles.TextArea,
                errors.companyAddress && styles.inputError
              ]}
              placeholder="Enter Company Address"
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
            />
            {errors.companyAddress && <Text style={[styles.errorText , {marginTop : 5}]}>Company Address is required</Text>}
          </View>
          
          <TouchableOpacity onPress={handleContinue} style={styles.button}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
   
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
  },
  hiringFor: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    width: '100%',
    color: 'gray',
    marginBottom: 10,
    textAlign: 'center',
  },
  TextArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    height: 150,
    textAlignVertical: 'top',
  },
  accountTypeLabel: {
    color: '#9F9F9F',
    marginTop: 30,
    marginBottom: 5,
    marginLeft: 8,
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioText: {
    fontSize: 16,
  },
  uploadLogo: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 10,
    paddingVertical: 20,
    marginBottom: 20,
  },
  uploadLogoIcon: {
    backgroundColor: '#F7F7F7',
    borderRadius: 50,
    padding: 10,
  },
  uploadText: {
    fontFamily: 'Poppins-Regular',
    marginLeft: 10,
    fontSize: 14,
    color: 'gray',
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 17,
    marginBottom: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 8,
  },
  inputContainer: {
    width: '100%',
    marginTop: 20,
  },
  dropdown: {
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  dropdownError: {
    borderColor: 'red',
  },
  dropdownContainer: {
    borderColor: '#E0E0E0',
  },
  button: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 50,
  },
});

export default CompanyDetails;