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
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height, width } = Dimensions.get('window');
const MAX_CHARS = 600;

const ProjectDetail = () => {
  const route = useRoute();
  const { req } = route.params || {};
  const { project } = route.params || {};

  // Updated format function to ensure consistent date formatting
  const formatDate = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isProgress = project?.project_status === 'In-Progress';

  console.log('Project:', project);

  const [userID, setUserID] = useState();
  const [projectTitle, setProjectTitle] = useState(project?.project_title || '');
  const [loading, setLoading] = useState(false);

  // Improve date handling by always initializing with proper date objects
  const [workFrom, setWorkFrom] = useState(project?.work_from || '');
  const [workTill, setWorkTill] = useState(project?.work_till || '');

  // Improved date conversion function that handles multiple formats
  const [workFromDate, setWorkFromDate] = useState(() => {
    if (!project?.work_from) return new Date();
    return convertToDate(project.work_from);
  });

  const [workTillDate, setWorkTillDate] = useState(() => {
    if (!project?.work_till) return new Date();
    return convertToDate(project.work_till);
  });

  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showTillDatePicker, setShowTillDatePicker] = useState(false);

  const [projectDetail, setProjectDetail] = useState(project?.project_detail || '');
  const [isInProgress, setIsInProgress] = useState(isProgress);

  const [projectTitleError, setProjectTitleError] = useState('');
  const [workFromError, setWorkFromError] = useState('');
  const [workTillError, setWorkTillError] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    const getUserID = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      console.log('Stored User ID:', storedUserId);
      setUserID(+storedUserId);
    };
    getUserID();
  }, []);

  // Improved date conversion function that handles multiple formats
  function convertToDate(dateString) {
    if (!dateString) return new Date();

    // Handle different date formats (DD/MM/YYYY or DD-MM-YYYY)
    let parts;
    if (dateString.includes('/')) {
      parts = dateString.split('/');
    } else if (dateString.includes('-')) {
      parts = dateString.split('-');
    } else {
      return new Date(); // Default to today if format is unrecognized
    }

    if (parts.length !== 3) return new Date();

    // Parse date parts (handle both DD/MM/YYYY and MM/DD/YYYY formats)
    let day, month, year;

    // If first part is likely a day (1-31)
    if (parseInt(parts[0], 10) <= 31) {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
      year = parseInt(parts[2], 10);
    } else {
      // Assume MM/DD/YYYY format
      month = parseInt(parts[0], 10) - 1;
      day = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    }

    // Ensure year has 4 digits
    if (year < 100) year += 2000;

    return new Date(year, month, day);
  }

  const handleFromDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || workFromDate;
    setShowFromDatePicker(false);

    // Format the date and update state
    setWorkFromDate(currentDate);
    const formattedDate = formatDate(currentDate);
    setWorkFrom(formattedDate);
    console.log('Selected work from date:', formattedDate);
  };

  const handleTillDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || workTillDate;
    setShowTillDatePicker(false);

    // Format the date and update state
    setWorkTillDate(currentDate);
    setWorkTill(formatDate(currentDate));
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Project ',
      'Are you sure you want to delete this Project record?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              console.log('Deleting Project with ID:', project?.project_id);
              const response = await axios.delete(API_ENDPOINTS.DELETE_PROJECT, {
                params: { project_id: project?.project_id },
              });
              console.log('Delete response:', response.data);
              if (response.data.status === 'success') {
                navigation.navigate('MyTabs');
              }
            } catch (error) {
              console.error('Error deleting Project:', error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const validateInputs = () => {
    let isValid = true;

    // Create a today date with time set to midnight for accurate comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create comparison dates with time set to midnight
    const fromDateForComparison = new Date(workFromDate);
    fromDateForComparison.setHours(0, 0, 0, 0);

    const tillDateForComparison = new Date(workTillDate);
    tillDateForComparison.setHours(0, 0, 0, 0);

    // Log the actual date objects for comparison
    console.log('Comparing dates:');
    console.log('From date:', fromDateForComparison.toISOString());
    console.log('Today:', today.toISOString());
    console.log('Is future date?', fromDateForComparison > today);

    if (!projectTitle.trim()) {
      setProjectTitleError('Please enter a project title.');
      isValid = false;
    } else {
      setProjectTitleError('');
    }

    if (!workFrom) {
      setWorkFromError('Please select a "Worked from" date.');
      isValid = false;
    } else if (fromDateForComparison > today) {
      setWorkFromError('"Worked from" date cannot be in the future.');
      isValid = false;
    } else {
      setWorkFromError('');
    }

    if (!isInProgress && !workTill) {
      setWorkTillError('Please select a "Worked till" date.');
      isValid = false;
    } else if (!isInProgress && tillDateForComparison < fromDateForComparison) {
      setWorkTillError('"Worked till" date cannot be before "Worked from" date.');
      isValid = false;
    } else {
      setWorkTillError('');
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }

    const params = project
      ? {
          project_id: +project?.project_id,
          user_id: userID,
          project_title: projectTitle,
          project_status: isInProgress ? 'In-Progress' : 'Complete',
          work_from: workFrom,
          work_till: isInProgress ? '' : workTill,
          project_detail: projectDetail,
        }
      : {
          user_id: userID,
          project_title: projectTitle,
          project_status: isInProgress ? 'In-Progress' : 'Complete',
          work_from: workFrom,
          work_till: isInProgress ? '' : workTill,
          project_detail: projectDetail,
        };

    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.PROJECTS, params);
      console.log('Project Response:', response.data);
      if (response.data.status === 'success') {
        setLoading(false);
        navigation.navigate(req === 'ResumeLocal' ? 'Resume Form' : 'MyTabs');
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleTextChange = (text) => {
    if (text.length <= MAX_CHARS) {
      setProjectDetail(text);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <View style={[styles.header, { marginTop: req === 'ResumeLocal' ? Platform.OS === 'ios' ? -10 : 20 : 0 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Projects</Text>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 30, alignItems: 'center' }}>
          <TouchableOpacity disabled={loading} onPress={handleSave}>
            <Text style={styles.saveButton}>
              {project ? (loading ? 'Saving...' : 'Edit') : loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>

          {project && (
            <TouchableOpacity style={styles.trashButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="red" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Project Title</Text>
          <TextInput
            style={[styles.input, projectTitleError && styles.inputError]}
            placeholder="Title"
            value={projectTitle}
            onChangeText={setProjectTitle}
            placeholderTextColor="#C8C8C8"
          />
          {projectTitleError && <Text style={styles.errorText}>{projectTitleError}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Project Status</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={isInProgress ? styles.badgeButtonSelected : styles.badgeButtonUnselected}
              onPress={() => setIsInProgress(true)}
            >
              <Text style={styles.buttonText}>In-Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={!isInProgress ? styles.badgeButtonSelected : styles.badgeButtonUnselected}
              onPress={() => setIsInProgress(false)}
            >
              <Text style={styles.buttonText}>Finished</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={[styles.inputContainer, { width: '48%' }]}>
            <Text style={styles.label}>Worked from</Text>
            <TouchableOpacity
              style={[styles.datePickerButton, workFromError && styles.inputError]}
              onPress={() => setShowFromDatePicker(true)}
            >
              <Text style={workFrom ? styles.dateTextSelected : styles.dateTextPlaceholder}>
                {workFrom || 'DD/MM/YYYY'}
              </Text>
              <Ionicons name="calendar-outline" size={18} color="#667085" />
            </TouchableOpacity>
            {workFromError && <Text style={styles.errorText}>{workFromError}</Text>}
            {showFromDatePicker && (
              <DateTimePicker
                value={workFromDate}
                mode="date"
                display="default"
                onChange={handleFromDateChange}
                maximumDate={new Date()} // Prevent selecting future dates
              />
            )}
          </View>

          <View style={[styles.inputContainer, { width: '48%' }]}>
            <Text style={styles.label}>Worked till</Text>
            <TouchableOpacity
              style={[styles.datePickerButton, workTillError && styles.inputError]}
              onPress={() => !isInProgress && setShowTillDatePicker(true)}
              disabled={isInProgress}
            >
              <Text
                style={
                  workTill || isInProgress ? styles.dateTextSelected : styles.dateTextPlaceholder
                }
              >
                {isInProgress ? 'Present' : workTill || 'DD/MM/YYYY'}
              </Text>
              <Ionicons name="calendar-outline" size={18} color="#667085" />
            </TouchableOpacity>
            {workTillError && <Text style={styles.errorText}>{workTillError}</Text>}
            {showTillDatePicker && !isInProgress && (
              <DateTimePicker
                value={workTillDate}
                mode="date"
                display="default"
                onChange={handleTillDateChange}
                maximumDate={new Date()} // Prevent selecting future dates
                minimumDate={workFromDate} // Prevent selecting dates before "Work from"
              />
            )}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Detail of Projects</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter Project Details"
            value={projectDetail}
            onChangeText={handleTextChange}
            multiline
            numberOfLines={8}
            placeholderTextColor="#C8C8C8"
          />
          <Text style={styles.wordCount}>
            {projectDetail.length}/{MAX_CHARS} characters
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
    marginTop: 5,
    marginLeft: 4,
    fontWeight: '600',
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
  trashButton: {
    // Style for trash button if needed
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#000',
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
  },
  datePickerButton: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTextSelected: {
    color: '#000',
    fontSize: 16,
  },
  dateTextPlaceholder: {
    color: '#C8C8C8',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
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
  textArea: {
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 120,
    backgroundColor: '#fff',
  },
  wordCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  content: {
    paddingHorizontal: 20,
  },
});

export default ProjectDetail;
