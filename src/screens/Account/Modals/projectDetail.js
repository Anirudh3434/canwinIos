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

  const isProgress = project?.project_status === 'In-Progress';

  const [userID, setUserID] = useState();
  const [projectTitle, setProjectTitle] = useState(project?.project_title || '');
  const [loading, setLoading] = useState(false);

  const [workFrom, setWorkFrom] = useState(project?.work_from || '');
  const [workTill, setWorkTill] = useState(project?.work_till || '');
  const [workFromDate, setWorkFromDate] = useState(
    project?.work_from ? convertToDate(project.work_from) : new Date()
  );
  const [workTillDate, setWorkTillDate] = useState(
    project?.work_till ? convertToDate(project.work_till) : new Date()
  );
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

  function convertToDate(dateString) {
    if (!dateString) return new Date();
    const parts = dateString.split('/');
    if (parts.length !== 3) return new Date();
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleFromDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || workFromDate;
    setShowFromDatePicker(false);
    setWorkFromDate(currentDate);
    setWorkFrom(formatDate(currentDate));
  };

  const handleTillDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || workTillDate;
    setShowTillDatePicker(false);
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
              console .log('Deleting Project with ID:' , project?.project_id);
              const response = await axios.delete(API_ENDPOINTS.DELETE_PROJECT, {params: {project_id: project?.project_id}});
              console.log('Delete response:', response.data);
              console.log(response.data);
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
  }

  const validateInputs = () => {
    let isValid = true;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison

    if (!projectTitle.trim()) {
      setProjectTitleError('Please enter a project title.');
      isValid = false;
    } else {
      setProjectTitleError('');
    }

    if (!workFrom) {
      setWorkFromError('Please select a "Worked from" date.');
      isValid = false;
    } else if (workFromDate > today) {
      setWorkFromError('"Worked from" date cannot be in the future.');
      isValid = false;
    } else {
      setWorkFromError('');
    }

    if (!isInProgress && !workTill) {
      setWorkTillError('Please select a "Worked till" date.');
      isValid = false;
    } else if (!isInProgress && workTillDate < workFromDate) {
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
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={[styles.header, { marginTop: req === 'ResumeLocal' ? 40 : 0 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Projects</Text>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 30 , alignItems: 'center' }}>
                      
                           
                      
                            <TouchableOpacity disabled={loading} onPress={handleSave}>
                                <Text style={styles.saveButton}>
                                  {project ? (loading ? 'Saving...' : 'Edit') : loading ? 'Saving...' : 'Save'}
                                </Text>
                              </TouchableOpacity>
                      
                      
                        {project &&    <TouchableOpacity style={styles.trashButton} onPress={handleDelete}>
                              <Ionicons name="trash-outline" size={20} color="red" />
                            </TouchableOpacity>}
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
  inputContainer: {
    marginBottom: 20,
    position: 'relative', // Added for error text positioning
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
