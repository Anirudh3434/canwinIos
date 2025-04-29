import React, { useState } from 'react';
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
} from 'react-native';
import { Colors } from '../../theme/color';
import { useNavigation } from '@react-navigation/native';
import { AppBar } from '@react-native-material/core';
import { useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/slice/sideBarSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

export default function ComHome() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Dropdown states
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [interviewDate, setInterviewDate] = useState(new Date());
  const [interviewTime, setInterviewTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [modeItems, setModeItems] = useState([
    { label: 'Online', value: 'online' },
    { label: 'Offline', value: 'offline' },
  ]);
  const [items, setItems] = useState([
    { label: 'Accept', value: 'accept' },
    { label: 'Reject', value: 'reject' },
    { label: 'Schedule to Interview', value: 'schedule' },
  ]);


  console.log(typeof interviewTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  console.log(interviewDate.toLocaleDateString())

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: Colors.bg, paddingBottom: 40 }]}>
      <StatusBar backgroundColor={Colors.bg} translucent={false} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={{ flex: 1 }}>
          <AppBar
            color={Colors.bg}
            elevation={6}
            style={{ paddingHorizontal: 10, paddingVertical: 10 }}
            leading={
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => dispatch(toggleSidebar())}
                  style={styles.iconContainer}
                >
                  <Ionicons name="arrow-back" size={24} />
                </TouchableOpacity>
                <Text style={styles.nameText}>Applicants</Text>
              </View>
            }
          />

          <ScrollView style={styles.mainContainer}>
            <View style={styles.cardContainer}>
              {/* Header Section */}
              <View style={styles.cardHeaderSection}>
                <View style={styles.cardHeader}>
                  <Image
                    style={styles.seekerImage}
                    source={require('../../../assets/image/a16.png')}
                  />
                  <View>
                    <Text style={styles.seekerName}>John Doe</Text>
                    <Text style={styles.seekerDate}>Full stack developer</Text>
                  </View>
                </View>
                <Image
                  style={styles.cardImage}
                  source={require('../../../assets/image/meesageIcon.png')}
                />
              </View>

              <View style={styles.divider} />

              {/* Action Buttons */}
              <View style={styles.actionContainer}>
                <TouchableOpacity style={styles.resumeButton} onPress={() => {}}>
                  <Text style={styles.buttonText}>See Resume</Text>
                </TouchableOpacity>
              </View>

              {/* Status Dropdown */}
              <View style={styles.dropdownContainer}>
                <DropDownPicker
                  listMode="SCROLLVIEW"
                  scrollViewProps={{ nestedScrollEnabled: true }}
                  open={open}
                  value={selectedStatus}
                  items={items}
                  setOpen={setOpen}
                  setValue={setSelectedStatus}
                  setItems={setItems}
                  placeholder="Select status"
                  containerStyle={styles.dropdown}
                  style={[
                    styles.picker,
                    {
                      borderColor:
                        selectedStatus === 'schedule' || selectedStatus === 'accept'
                          ? Colors.primary
                          : 'red' || (selectedStatus == '' && '#E8E8E8'),
                      color:
                        selectedStatus === 'schedule' || selectedStatus === 'accept'
                          ? Colors.primary
                          : 'red',
                    },
                  ]}
                  dropDownContainerStyle={styles.dropDownContainer}
                />
              </View>

              {/* Schedule Section */}
              {selectedStatus === 'schedule' && (
                <View style={styles.scheduleContainer}>
                  {/* Date and Time Row */}
                  <View style={styles.dateTimeRow}>
                    {/* Date Picker */}
                    <View style={styles.dateTimeBox}>
                      <Text style={styles.dropdownLabel}>Date</Text>
                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => setShowDatePicker(true)}
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
                        onPress={() => setShowTimePicker(true)}
                      >
                        <Text style={styles.timeText}>
                          {interviewTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
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

                  {/* Interview Mode */}
                  <View style={styles.modeContainer}>
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
                    />
                  </View>
                </View>
              )}

              {/* Message Input */}
              {selectedStatus && (
                <View style={styles.messageContainer}>
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
              )}
            </View>
          </ScrollView>
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Send to applicant</Text>
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
    width: 20,
    height: 20,
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
    borderWidth: 1,
    borderColor: '#E8E8E8',
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
    zIndex: 1000,
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
    zIndex: 1000,
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
    bottom: isSmallScreen ? -20 : -30,
    left: 0,
    right: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
