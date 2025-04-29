'use client';

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
import { useDispatch, useSelector } from 'react-redux';
import { addEducation, updateEducation } from '../../redux/slice/eductionSlice';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height, width } = Dimensions.get('window');

const EducationDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const scrollViewRef = React.useRef(null);

  const [user_id, setUserId] = useState(null);
  const { req, edu, id } = route.params || {};

  const [loading, setLoading] = useState(false);

  const educationLevelOptions = [
    'X',
    'XII',
    "Bachelor's Degree",
    "Master's Degree",
    'Doctorate',
    'Diploma',
  ];

  const [educationLevel, setEducationLevel] = useState(edu?.education || '');
  const [board, setBoard] = useState(edu?.board_name || '');
  const [marks, setMarks] = useState(edu?.marks || '');
  const [instituteName, setInstituteName] = useState(edu?.institute_name || '');
  const [yearOfCompletion, setYearOfCompletion] = useState(edu?.year_of_completion || '');
  const [startYear, setStartYear] = useState(edu?.year_of_start || '');
  const [courseName, setCourseName] = useState(edu?.course_name || '');
  const [specialization, setSpecialization] = useState(edu?.specialization_name || '');
  const [filterEducationOptions, setFilterEducationOptions] = useState(educationLevelOptions);

  const [boardOpen, setBoardOpen] = useState(false);

  const [instituteNameError, setInstituteNameError] = useState('');
  const [yearOfCompletionError, setYearOfCompletionError] = useState('');
  const [marksError, setMarksError] = useState('');
  const [courseNameError, setCourseNameError] = useState('');
  const [startYearError, setStartYearError] = useState('');

  const education = useSelector((state) => state.education);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        if (id) {
          setUserId(id);
        } else {
          const storedUserId = await AsyncStorage.getItem('userId');
          if (storedUserId) {
            setUserId(parseInt(storedUserId));
          }
        }
      } catch (error) {
        console.error('Failed to retrieve userId:', error);
      }
    };

    fetchUserId();
  }, [id]);

  console.log('user_id:', user_id);

  useEffect(() => {
    if (!edu) {
      const availableOptions = education.educationList
        ? educationLevelOptions.filter(
            (option) => !education.educationList.some((item) => item.education === option)
          )
        : educationLevelOptions;

      setFilterEducationOptions(availableOptions);
    } else {
      const availableOptions = education.educationList
        ? educationLevelOptions.filter(
            (option) =>
              !education.educationList.some(
                (item) => item.education === option && item.id !== edu.id
              )
          )
        : educationLevelOptions;

      setFilterEducationOptions(availableOptions);
    }
  }, [education, edu]);

  const boardOptions = [
    { label: 'CBSE', value: 'CBSE' },
    { label: 'ICSE', value: 'ICSE' },
    { label: 'State Board', value: 'State Board' },
    { label: 'International Baccalaureate', value: 'International Baccalaureate' },
    { label: 'Cambridge (IGCSE)', value: 'Cambridge (IGCSE)' },
    { label: 'Other', value: 'Other' },
  ];

const validateInputs = () => {
  let isValid = true;

  if (!educationLevel) {
    alert('Please select an education level');
    isValid = false;
  }

  if ((educationLevel === 'X' || educationLevel === 'XII') && !board) {
    alert('Please select a board');
    isValid = false;
  }

  if (!instituteName) {
    setInstituteNameError('Please enter institution name');
    isValid = false;
  } else {
    setInstituteNameError('');
  }

  if (!yearOfCompletion) {
    setYearOfCompletionError('Please enter the year of completion');
    isValid = false;
  } else if (!/^\d{4}$/.test(yearOfCompletion)) {
    setYearOfCompletionError('Please enter a valid 4-digit year');
    isValid = false;
  } else {
    setYearOfCompletionError('');
  }

  if (!marks) {
    setMarksError('Please enter marks');
    isValid = false;
  } else {
    const parsedMarks = Number.parseFloat(marks);
    if (isNaN(parsedMarks) || parsedMarks < 0 || parsedMarks > 100) {
      setMarksError('Please enter valid marks between 0 and 100');
      isValid = false;
      console.log('Please enter valid marks between 0 and 100');
    } else {
      setMarksError('');
    }
  }

  if (educationLevel !== 'X' && educationLevel !== 'XII') {
    if (!courseName) {
      setCourseNameError('Please enter course name');
      isValid = false;
      console.log('Please enter course name');
    } else {
      setCourseNameError('');
    }

    if (!startYear) {
      setStartYearError('Please enter start year');
      isValid = false;
      console.log('Please enter start year');
    } else if (!/^\d{4}$/.test(startYear)) {
      setStartYearError('Please enter a valid 4-digit start year');
      isValid = false;
      console.log('Please enter a valid 4-digit start year');
    } else if (
      yearOfCompletion &&
      /^\d{4}$/.test(yearOfCompletion) &&
      parseInt(startYear) > parseInt(yearOfCompletion)
    ) {
      setStartYearError('Start year cannot be after completion year');
      setYearOfCompletionError('Completion year cannot be before start year');
      console.log('Start year cannot be after completion year');
      isValid = false;
    } else {
      setStartYearError('');
      setYearOfCompletionError('');
    }
  }

  return isValid;
};

  const handleSave = async () => {
    console.log('clicked');

    if (!validateInputs()) {
      console.log('Validation failed');
      return;
    }

    const params = {
      user_id: user_id,
      education: educationLevel,
      board_name: board,
      institute_name: instituteName,
      year_of_start: startYear || yearOfCompletion - 1,
      year_of_completion: yearOfCompletion,
      course_name: courseName,
      specialization_name: specialization,
      marks: marks.toString(),
      ...(edu ? { education_id: edu?.education_id } : {}),
    };

    console.log('Payload:', params);

    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.EDUCATION, params);
      console.log(response.data);

      if (response.data.status === 'success') {
        navigation.navigate(req === 'ResumeLocal' ? 'Resume Form' : 'MyTabs');
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={[styles.header, { marginTop: req === 'ResumeLocal' ? 40 : 0 }]}>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Education</Text>
        </View>
        <TouchableOpacity disabled={loading} onPress={handleSave}>
          <Text style={styles.saveButton}>{edu ? loading ? 'Saving...' : 'Edit' : loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Education</Text>
          <View style={styles.badgeContainer}>
            {filterEducationOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setEducationLevel(option)}
                style={
                  educationLevel === option
                    ? styles.badgeButtonSelected
                    : styles.badgeButtonUnselected
                }
              >
                <Text
                  style={
                    educationLevel === option
                      ? styles.badgeTextSelected
                      : styles.badgeTextUnselected
                  }
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {(educationLevel === 'X' || educationLevel === 'XII') && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Board</Text>
            <DropDownPicker
              listMode="SCROLLVIEW"
              scrollViewProps={{ nestedScrollEnabled: true }}
              open={boardOpen}
              value={board}
              items={boardOptions}
              setOpen={setBoardOpen}
              setValue={setBoard}
              style={styles.dropdownStyle}
              textStyle={styles.dropdownTextStyle}
              dropDownContainerStyle={styles.dropdownContainerStyle}
              placeholder="Select Board"
              placeholderStyle={styles.placeholderStyle}
              zIndex={3000}
              zIndexInverse={1000}
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            {educationLevel === 'X' || educationLevel === 'XII'
              ? 'School Name'
              : 'University/College Name'}
          </Text>
          <TextInput
            style={[styles.input, instituteNameError && styles.inputError]}
            placeholder={
              educationLevel === 'X' || educationLevel === 'XII'
                ? 'Enter School Name'
                : 'Enter University/College Name'
            }
            value={instituteName}
            onChangeText={setInstituteName}
            placeholderTextColor="#C8C8C8"
          />
          {instituteNameError && <Text style={styles.errorText}>{instituteNameError}</Text>}
        </View>

        {(educationLevel === 'X' || educationLevel === 'XII') && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Passing Year</Text>
            <TextInput
              style={[styles.input, yearOfCompletionError && styles.inputError]}
              placeholder="Enter Year of Completion"
              value={yearOfCompletion}
              onChangeText={setYearOfCompletion}
              keyboardType="numeric"
              placeholderTextColor="#C8C8C8"
            />
            {yearOfCompletionError && <Text style={styles.errorText}>{yearOfCompletionError}</Text>}
          </View>
        )}

        {educationLevel !== 'X' && educationLevel !== 'XII' && (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Course Name</Text>
              <TextInput
                style={[styles.input, courseNameError && styles.inputError]}
                placeholder="Enter Course Name"
                value={courseName}
                onChangeText={setCourseName}
                placeholderTextColor="#C8C8C8"
              />
              {courseNameError && <Text style={styles.errorText}>{courseNameError}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Specialization</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Specialization"
                value={specialization}
                onChangeText={setSpecialization}
                placeholderTextColor="#C8C8C8"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Duration</Text>
              <View style={styles.rowContainer}>
                <View style={styles.halfInputContainer}>
                  <Text style={styles.smallLabel}>Start Year</Text>
                  <TextInput
                    style={[styles.halfInput, startYearError && styles.inputError]}
                    placeholder="Start Year"
                    value={startYear}
                    onChangeText={setStartYear}
                    keyboardType="numeric"
                    placeholderTextColor="#C8C8C8"
                  />
                  {startYearError && <Text style={styles.errorText}>{startYearError}</Text>}
                </View>
                <View style={styles.halfInputContainer}>
                  <Text style={styles.smallLabel}>End Year</Text>
                  <TextInput
                    style={[styles.halfInput, yearOfCompletionError && styles.inputError]}
                    placeholder="End Year"
                    value={yearOfCompletion}
                    onChangeText={setYearOfCompletion}
                    keyboardType="numeric"
                    placeholderTextColor="#C8C8C8"
                  />
                  {yearOfCompletionError && <Text style={styles.errorText}>{yearOfCompletionError}</Text>}
                </View>
              </View>
            </View>
          </>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Marks</Text>
          <TextInput
            style={[styles.input, marksError && styles.inputError]}
            placeholder="Enter Marks"
            value={marks}
            onChangeText={setMarks}
            keyboardType="decimal-pad"
            placeholderTextColor="#C8C8C8"
          />
          {marksError && <Text style={styles.errorText}>{marksError}</Text>}
        </View>
        <View>
          <Text style={styles.helperText}>% marks of 100 maximum</Text>
        </View>

        {/* Add padding at the bottom for better scrolling experience */}
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
    width: '100%',
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
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#14B6AA',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 5,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  label: {
    marginTop: 10,
    color: '#000000',
    fontSize: 16,
    marginBottom: 10,
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
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    fontFamily: 'Poppins-Regular',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeButtonSelected: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEFFFE',
    borderWidth: 1,
    borderColor: '#14B6AA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeButtonUnselected: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDE0E5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeTextSelected: {
    fontSize: 14,
    color: '#14B6AA',
    fontFamily: 'Poppins-Medium',
  },
  badgeTextUnselected: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  helperText: {
    marginTop: -10,
    marginBottom: 10,
    color: '#606060',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  bottomPadding: {
    height: 50,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfInputContainer: {
    flex: 1,
  },
  halfInput: {
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  smallLabel: {
    fontSize: 14,
    color: '#606060',
    marginBottom: 5,
    fontFamily: 'Poppins-Regular',
  },
  // Dropdown styles
  dropdownStyle: {
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    backgroundColor: '#fff',
    minHeight: 50,
  },
  dropdownTextStyle: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  dropdownContainerStyle: {
    borderColor: '#D5D9DF',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeholderStyle: {
    color: '#C8C8C8',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
});

export default EducationDetails;