import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { setPersonalDetails } from '../../../redux/slice/personalDetail';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../api/apiConfig';
import { useRoute } from '@react-navigation/native';

const PersonalDetail = () => {
  const personal = useSelector((state) => state.personalDetails);
  const route = useRoute();
  const { id, data = {} } = route.params || {};
  console.log('data', data, 'id', id);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Initialize state with data from route params or defaults
  const [gender, setGender] = useState(data.gender || '');
  const [moreInfo, setMoreInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // Date picker state
  const [dateOfBirth, setDateOfBirth] = useState(
    data.date_of_birth ? convertToDate(data.date_of_birth) : new Date()
  );
  const [dateOfBirthText, setDateOfBirthText] = useState(data.date_of_birth || '');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [category, setCategory] = useState(data.category || '');
  const [maritalStatus, setMaritalStatus] = useState(data.marital_status || '');
  const [hasDisability, setHasDisability] = useState(data.disability);
  const [hasCareerBreak, setHasCareerBreak] = useState(data.careerbreak);

  useEffect(() => {
    if (data.date_of_birth) {
      setDateOfBirthText(data.date_of_birth);
    }
  }, [data.date_of_birth]);

  // Helper function to convert DD/MM/YYYY to a Date object
  function convertToDate(dateString) {
    if (!dateString) return new Date();
    const parts = dateString.split('/');
    if (parts.length !== 3) return new Date();
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JavaScript
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  // Function to format date as DD/MM/YYYY
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(Platform.OS === 'ios');
    setDateOfBirth(currentDate);
    setDateOfBirthText(formatDate(currentDate));
  };

  const moreInfoOptions = [
    'Single Parent',
    'Working Mother',
    'LGBTQ+',
    'Serve in Military',
    'Retired(60+)',
  ];

  const maritalOptions = [
    'Married',
    'Divorced',
    'Widowed',
    'Single/Unmarried',
    'Separated',
    'Other',
  ];

  const categoryOptions = [
    'General',
    'Schedule Caste(SC)',
    'Schedule Tribe(ST)',
    'OBC-Creamy',
    'OBC-Non-Creamy',
    'Others',
  ];

  const handleMoreInfoToggle = (item) => {
    if (moreInfo.includes(item)) {
      setMoreInfo(moreInfo.filter((i) => i !== item));
    } else {
      setMoreInfo([...moreInfo, item]);
    }
  };

  const handleSave = async () => {
    const params = {
      gender,
      date_of_birth: dateOfBirthText,
      category,
      disability: hasDisability,
      careerbreak: hasCareerBreak,
      more_info: moreInfo,
      marital_status: maritalStatus, // Fixed field name (was martial_status)
      user_id: id,
    };

    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.PERSONAL_DETAILS, params);
      console.log(response.data);
      if (response.status === 200) {
        dispatch(
          setPersonalDetails({
            gender,
            moreInfo,
            dateOfBirth: dateOfBirthText,
            category,
            maritalStatus,
            hasDisability,
            hasCareerBreak,
            user_id: id,
          })
        );
        setLoading(false);
        navigation.navigate('MyTabs');
      } else {
        Alert.alert('Something Went Wrong', response.data?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('API Error:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to save data. Please try again.');
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
          <Text style={styles.title}>Personal Details</Text>
        </View>
        <TouchableOpacity onPress={handleSave}>
          <Text disabled={loading} style={styles.saveButton}>
            {' '}
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={gender === 'Male' ? styles.badgeButtonSelected : styles.badgeButtonUnselected}
              onPress={() => setGender('Male')}
            >
              <Text style={styles.buttonText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={
                gender === 'Female' ? styles.badgeButtonSelected : styles.badgeButtonUnselected
              }
              onPress={() => setGender('Female')}
            >
              <Text style={styles.buttonText}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={
                gender === 'Transgender' ? styles.badgeButtonSelected : styles.badgeButtonUnselected
              }
              onPress={() => setGender('Transgender')}
            >
              <Text style={styles.buttonText}>Transgender</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Uncommented the More Info section */}
        {/* <View style={styles.inputContainer}>
          <Text style={styles.label}>More Info</Text>
          <View style={[styles.buttonRow, { flexWrap: 'wrap', gap: 10 }]}>
            {moreInfoOptions.map((item) => (
              <TouchableOpacity
                key={item}
                style={
                  moreInfo.includes(item)
                    ? styles.badgeButtonSelected
                    : styles.badgeButtonUnselected
                }
                onPress={() => handleMoreInfoToggle(item)}
              >
                <Text style={[styles.buttonText, { fontSize: 12 }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Marital status</Text>
          <View style={[styles.buttonRow, { flexWrap: 'wrap', gap: 10 }]}>
            {maritalOptions.map((item) => (
              <TouchableOpacity
                key={item}
                style={
                  maritalStatus === item ? styles.badgeButtonSelected : styles.badgeButtonUnselected
                }
                onPress={() => setMaritalStatus(item)}
              >
                <Text style={[styles.buttonText, { fontSize: 12 }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
            <Text style={dateOfBirthText ? styles.dateTextSelected : styles.dateTextPlaceholder}>
              {dateOfBirthText || 'DD/MM/YYYY'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#667085" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Disability</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={
                hasDisability === 'Yes' ? styles.badgeButtonSelected : styles.badgeButtonUnselected
              }
              onPress={() => setHasDisability('Yes')}
            >
              <Text style={styles.buttonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={
                hasDisability === 'No' ? styles.badgeButtonSelected : styles.badgeButtonUnselected
              }
              onPress={() => setHasDisability('No')}
            >
              <Text style={styles.buttonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Career Break</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={
                hasCareerBreak === 'Yes' ? styles.badgeButtonSelected : styles.badgeButtonUnselected
              }
              onPress={() => setHasCareerBreak('Yes')}
            >
              <Text style={styles.buttonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={
                hasCareerBreak === 'No' ? styles.badgeButtonSelected : styles.badgeButtonUnselected
              }
              onPress={() => setHasCareerBreak('No')}
            >
              <Text style={styles.buttonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <View style={[styles.buttonRow, { flexWrap: 'wrap', gap: 10 }]}>
            {categoryOptions.map((item) => (
              <TouchableOpacity
                key={item}
                style={
                  category === item ? styles.badgeButtonSelected : styles.badgeButtonUnselected
                }
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.buttonText, { fontSize: 12 }]}>{item}</Text>
              </TouchableOpacity>
            ))}
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
  datePickerButton: {
    width: '90%',
    height: 50,
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dateTextPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  dateTextSelected: {
    fontSize: 16,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 20,
  },
  badgeButtonSelected: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEFFFE',
    borderWidth: 1,
    borderColor: '#14B6AA',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeButtonUnselected: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDE0E5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: {
    color: '#667085',
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  experienceInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  experienceInput: {
    width: 70,
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  AmountInput: {
    width: 150,
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  unitLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#667085',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownOptions: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D5D9DF',
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownScrollContent: {
    paddingVertical: 5,
  },
  option: {
    padding: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  inputText: {
    fontSize: 16,
    color: '#999',
  },
  selectedInputText: {
    color: '#333',
  },
  activeInput: {
    borderColor: '#14B6AA',
  },
});

export default PersonalDetail;
