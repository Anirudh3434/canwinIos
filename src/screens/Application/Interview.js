import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { Colors } from '../../theme/color';
import { useNavigation } from '@react-navigation/native';
import { AppBar } from '@react-native-material/core';
import { useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

export default function Interview() {
  const navigation = useNavigation();

  const route = useRoute();
  const { profileDetail, job, reschedule } = route.params;

  const [statusOpen, setStatusOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [interviewDate, setInterviewDate] = useState(new Date());
  const [interviewTime, setInterviewTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modeItems, setModeItems] = useState([
    { label: 'Online', value: 'online' },
    { label: 'Offline', value: 'offline' },
  ]);
  const [interviewLink, setInterviewLink] = useState('');

  // Function to generate message based on interview details
  useEffect(() => {
    if (selectedMode) {
      const formattedDate = interviewDate.toLocaleDateString('en-GB');
      const formattedTime = interviewTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      setMessage(
        `Your interview with ${
          profileDetail?.introduction?.full_name || 'the recruiter'
        } is scheduled for ${formattedDate} at ${formattedTime}. The interview will be conducted ${
          selectedMode === 'online' ? 'online' : 'in person'
        }.`
      );
    }
  }, [interviewDate, interviewTime, selectedMode, profileDetail]);

  // Close other dropdowns when one is opened
  useEffect(() => {
    if (modeOpen) {
      setStatusOpen(false);
    }
  }, [modeOpen]);

  useEffect(() => {
    if (modeOpen) {
      setStatusOpen(false);
    }
  }, [modeOpen]);

  const handleSubmit = async () => {
    console.log('handleSubmit');
    if (!selectedMode) {
      Alert.alert('Missing Information', 'Please select an interview mode');
      return;
    }

    setIsLoading(true);
    const formattedDate = interviewDate.toLocaleDateString('en-GB');
    const formattedTime = interviewTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    console.log('formattedDate', formattedDate);

    const application_id = job.application_id;

    console.log('application_id', application_id);

    const payload = {
      user_id: +job.applicant_user_id,
      job_id: job.job_id,
      application_status: 'Interview Scheduled',
      interview_date: formattedDate,
      interview_time: formattedTime,
      interview_type: selectedMode,
      interview_link: interviewLink,
    };

    console.log('payload', payload);

    try {
      const response = await axios.post(API_ENDPOINTS.JOB_APPLY, payload);
      console.log('response', response);

      // Get FCM token for notification
      const { data } = await axios.get(`${API_ENDPOINTS.FCM}?user_id=${job.applicant_user_id}`);
      const fcmToken = data?.data?.fcm_token;

      if (!fcmToken) {
        console.warn('No FCM token found');
      } else {
        // Send notification
        await axios.post(`${API_ENDPOINTS.NODE_SERVER}/notify/interview-reminder`, {
          fcm_token: fcmToken,
          job_id: job.job_id,
          application_id : job.application_id,
          user_id: job.applicant_user_id,
          message: `Your interview with ${
            profileDetail?.introduction?.full_name || 'the recruiter'
          } is scheduled for ${formattedDate} at ${formattedTime}. The interview will be conducted ${
            selectedMode === 'online' ? 'online' : 'in person'
          }.`,
        });
      }

      // Update application logs
      const getApplicationLogs = async () => {
        const { data } = await axios.get(API_ENDPOINTS.APPLICATION_LOGS, {
          params: { application_id },
        });
        return data.data;
      };

      const updateApplicationLog = async (newStatus) => {
        try {
          const logs = await getApplicationLogs();
          const alreadyUpdated = logs.some((item) => item.new_status === newStatus);
          if (alreadyUpdated) return;

          const old_status = logs.length > 0 ? logs[logs.length - 1]?.new_status : 'None';

          await axios.post(API_ENDPOINTS.APPLICATION_LOGS, {
            application_id,
            old_status,
            new_status: newStatus,
          });
        } catch (error) {
          console.error('Error updating application log:', error);
        }
      };

      await updateApplicationLog('Interview Scheduled');

      Alert.alert('Success', 'Interview details sent to applicant successfully', [
        { text: 'OK', onPress: () => navigation.navigate('InterviewSchedular') },
      ]);
    } catch (error) {
      console.error('Error in handleSubmit:', error?.response || error);
      Alert.alert('Error', 'Failed to schedule interview. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to determine if the button should be disabled
  const isButtonDisabled = !selectedMode || !message || !interviewLink || isLoading;

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: Colors.bg }]}>
      <StatusBar backgroundColor={Colors.bg} translucent={false} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={{ flex: 1 }}>
          <AppBar
            color={Colors.bg}
            elevation={1}
            style={{ paddingHorizontal: 10, paddingVertical: 10 }}
            leading={
              <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
                  <Ionicons name="arrow-back" size={24} />
                </TouchableOpacity>
                <Text style={styles.nameText}>Applicants</Text>
              </View>
            }
          />

          <ScrollView style={styles.mainContainer} nestedScrollEnabled={true}>
            <View style={styles.cardContainer}>
              {/* Header Section */}
              <View style={styles.cardHeaderSection}>
                <View style={styles.cardHeader}>
                  <Image
                    style={styles.seekerImage}
                    source={
                      profileDetail?.docs?.pp_url
                        ? { uri: profileDetail?.docs?.pp_url }
                        : require('../../../assets/image/profileIcon.png')
                    }
                  />
                  <View>
                    <Text style={styles.seekerName}>
                      {profileDetail?.introduction?.full_name || 'Applicant'}
                    </Text>
                    <Text style={styles.seekerDate}>
                      {profileDetail?.professional?.job_title || 'Job Applicant'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Image
                    style={styles.cardImage}
                    source={require('../../../assets/image/meesageIcon.png')}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Schedule Section */}
              <View style={styles.scheduleContainer}>
                {/* Date and Time Row */}
                <View style={styles.dateTimeRow}>
                  {/* Date Picker */}
                  <View style={styles.dateTimeBox}>
                    <Text style={styles.dropdownLabel}>Date</Text>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => {
                        setShowTimePicker(false);
                        setShowDatePicker(true);
                      }}
                    >
                      <Text style={styles.timeText}>
                        {interviewDate.toLocaleDateString('en-GB')}
                      </Text>
                      <Ionicons name="calendar-outline" size={24} color="black" />
                    </TouchableOpacity>

                    {/* Date Picker Modal */}
                    {showDatePicker && (
                      <DateTimePicker
                        value={interviewDate}
                        mode="date"
                        display="default"
                        minimumDate={new Date()}
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(Platform.OS === 'ios');
                          if (selectedDate) {
                            setInterviewDate(selectedDate);
                          }
                        }}
                      />
                    )}
                  </View>

                  {/* Time Picker */}
                  <View style={styles.dateTimeBox}>
                    <Text style={styles.dropdownLabel}>Time</Text>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => {
                        setShowDatePicker(false);
                        setShowTimePicker(true);
                      }}
                    >
                      <Text style={styles.timeText}>
                        {interviewTime.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </Text>
                      <Ionicons name="time-outline" size={24} color="black" />
                    </TouchableOpacity>

                    {/* Time Picker Modal */}
                    {showTimePicker && (
                      <DateTimePicker
                        value={interviewTime}
                        mode="time"
                        display="default"
                        onChange={(event, selectedTime) => {
                          setShowTimePicker(Platform.OS === 'ios');
                          if (selectedTime) {
                            setInterviewTime(selectedTime);
                          }
                        }}
                      />
                    )}
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Interview Mode - with proper z-index handling */}
                <View style={[styles.modeContainer, { zIndex: 1000 }]}>
                  <Text style={styles.dropdownLabel}>Interview Mode</Text>
                  <DropDownPicker
                    listMode="SCROLLVIEW"
                    scrollViewProps={{ nestedScrollEnabled: true }}
                    open={modeOpen}
                    value={selectedMode}
                    items={modeItems}
                    setOpen={setModeOpen}
                    setValue={setSelectedMode}
                    setItems={setModeItems}
                    containerStyle={styles.dropdown}
                    style={styles.picker}
                    dropDownContainerStyle={styles.dropDownContainer}
                    onOpen={() => setStatusOpen(false)}
                  />
                </View>
              </View>

              {/* Message Input */}
              <View style={[styles.messageContainer, { zIndex: 500 }]}>
                <Text style={styles.dropdownLabel}>Message</Text>
                <TextInput
                  placeholder="Enter Message"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={6}
                  style={styles.textArea}
                />
              </View>

              <View style={[styles.messageContainer, { zIndex: 500 }]}>
                <Text style={styles.dropdownLabel}>Interview Link</Text>
                <TextInput
                  placeholder="Enter Interview Link"
                  value={interviewLink}
                  onChangeText={setInterviewLink}
                  style={[styles.textArea, { height: 45 }]}
                />
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isButtonDisabled}
            style={[styles.button, isButtonDisabled && { backgroundColor: '#A9A9A9' }]}
          >
            <Text style={styles.buttonText}>
              {isLoading
                ? 'Scheduling...'
                : reschedule
                ? 'Reschedule Interview'
                : 'Schedule Interview'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
  },
  mainContainer: {
    paddingBottom: 50,
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
    padding: 10,
  },
  header: {
    width: 250,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    marginTop: 5,
    fontSize: isSmallScreen ? 18 : 20,
    fontFamily: 'Poppins-SemiBold',
  },
  cardContainer: {
    marginBottom: 50,
    marginVertical: isSmallScreen ? 5 : 10,
    width: '100%',
    borderRadius: 8,
    padding: isSmallScreen ? 10 : 15,
  },
  cardHeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seekerImage: {
    width: isSmallScreen ? 40 : 50,
    height: isSmallScreen ? 40 : 50,
    marginRight: 10,
    borderRadius: isSmallScreen ? 20 : 25,
  },
  seekerName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: isSmallScreen ? 14 : 20,
    color: '#333',
  },
  seekerDate: {
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
    fontSize: isSmallScreen ? 8 : 11,
  },
  cardImage: {
    width: isSmallScreen ? 30 : 40,
    height: isSmallScreen ? 30 : 40,
  },
  divider: {
    borderTopColor: '#F0F0F0',
    borderTopWidth: 1,
    marginVertical: 15,
  },
  dropdownContainer: {
    marginTop: 10,
    marginBottom: 20,
    zIndex: 1000,
  },
  dropdownLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: isSmallScreen ? 12 : 14,
    color: 'black',
    marginBottom: 5,
  },
  dropdown: {
    height: isSmallScreen ? 40 : 50,
    width: '100%',
    borderColor: Colors.primary,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  picker: {
    backgroundColor: 'white',
    borderColor: '#E8E8E8',
    borderRadius: 8,
  },
  dropDownContainer: {
    borderColor: Colors.primary,
    backgroundColor: '#F9FFFE',
  },
  actionContainer: {
    flexDirection: 'column',
    gap: 10,
    marginVertical: 10,
  },
  resumeButton: {
    backgroundColor: '#14B6AA',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    fontSize: isSmallScreen ? 14 : 16,
    textAlign: 'center',
  },
  scheduleContainer: {
    marginTop: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: isSmallScreen ? 10 : 15,
    marginBottom: isSmallScreen ? 15 : 20,
  },
  dateTimeBox: {
    flex: 1,
  },
  timeButton: {
    flexDirection: 'row',
    height: isSmallScreen ? 40 : 50,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? 8 : 10,
  },
  timeText: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  modeContainer: {
    marginTop: 10,
  },
  messageContainer: {
    marginTop: 30,
  },
  textArea: {
    height: isSmallScreen ? 80 : 100,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: isSmallScreen ? 8 : 10,
    textAlignVertical: 'top',
    backgroundColor: 'white',
    fontFamily: 'Poppins-Regular',
    fontSize: isSmallScreen ? 12 : 14,
    color: '#333',
  },
  button: {
    backgroundColor: '#14B6AA',
    paddingVertical: isSmallScreen ? 12 : 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  submitContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
