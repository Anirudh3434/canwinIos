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
  Modal,
  Platform,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';

const { width } = Dimensions.get('window');

const Employment = () => {
  const route = useRoute();
  const { emp, req, id } = route.params || {};
  const dispatch = useDispatch();
  const navigation = useNavigation();


  // State variables
  const [years, setYears] = useState('');
  const [months, setMonths] = useState('');
  const [isCurrent, setIsCurrent] = useState(true);
  const [employmentType, setEmploymentType] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [salary, setSalary] = useState('');
  const [currency, setCurrency] = useState('');
  const [skill, setSkill] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [selected, setSelected] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillNames, setSkillNames] = useState([]);
  const [skillList, setSkillList] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillOpen, setSkillOpen] = useState(false);

  // Error state variables
  const [companyNameError, setCompanyNameError] = useState('');
  const [jobTitleError, setJobTitleError] = useState('');
  const [salaryError, setSalaryError] = useState('');
  const [formattedDateError, setFormattedDateError] = useState('');

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          const id = parseInt(storedUserId);
          setUserId(+id); // Set userId state
        }
      } catch (error) {
        console.error('Failed to retrieve userId:', error);
      }
    };
    fetchUserId();
    fetchSkills();
  }, []);

  const convertToDate = (dateString) => {
    if (!dateString) return new Date();
    // Handle both formats: DD/MM/YYYY and DD-MM-YYYY
    const parts = dateString.includes('/') ? dateString.split('/') : dateString.split('-');
    if (parts.length !== 3) return new Date();
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  };

  // ✅ Format date as DD/MM/YYYY
  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return '';
    // Format as DD/MM/YYYY to match your UI display format
    return dayjs(date).format('DD/MM/YYYY');
  };

  // ✅ Load data from props
  useEffect(() => {
    if (emp) {
      setYears(emp.total_exp_in_years || '');
      setMonths(emp.total_exp_in_months || '');
      setIsCurrent(emp.isCurrentCompany === 'Yes');
      setEmploymentType(emp.employment_type || '');
      setCompanyName(emp.curr_company_name || '');
      setJobTitle(emp.curr_job_title || '');
      setSalary(emp.curr_annual_salary || '');
      setNoticePeriod(emp.notice_period || '');
      setCurrency(emp.currency || '');
      setSkill(emp?.skill_used || '');

      if (emp.skill_used) {
        setSkillNames(emp.skill_used.split(',') || []);
        // You might need to map these to IDs if needed
      }

      if (emp.joining_date) {
        const dateObj = convertToDate(emp.joining_date);
        setSelected(dateObj);
        setFormattedDate(formatDate(dateObj));
      }
    }
  }, [emp]);

  // ✅ Handle date change from DatePicker
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || selected;
    setShowDatePicker(false);
    setSelected(currentDate);
    setFormattedDate(formatDate(currentDate));
  };

  const NoticePeroidOptions = [
    '1 month',
    '2 months',
    '3 months',
    'Less than 15 days',
    'More than 15 days',
    'Serving Notice Period',
  ];

  const handleDelete = async () => {

    Alert.alert(
      'Delete Employment ',
      'Are you sure you want to delete this Employment record?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              console .log('Deleting employment with ID:', emp.emp_id);
              const response = await axios.delete(API_ENDPOINTS.DELETE_EMPLOYMENT, {params: {employment_id: emp?.emp_id}});
              console.log('Delete response:', response.data);
              console.log(response.data);
              if (response.data.status === 'success') {
                navigation.navigate('MyTabs');
              }
            } catch (error) {
              console.error('Error deleting employment:', error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  }

  const validateInputs = () => {
    let isValid = true;

    if (!companyName.trim()) {
      setCompanyNameError('Company name is required');
      isValid = false;
    } else {
      setCompanyNameError('');
    }

    if (!jobTitle.trim()) {
      setJobTitleError('Job title is required');
      isValid = false;
    } else {
      setJobTitleError('');
    }

    if (!salary.trim()) {
      setSalaryError('Salary is required');
      isValid = false;
    } else if (isNaN(salary)) {
      setSalaryError('Salary must be a number');
      isValid = false;
    } else {
      setSalaryError('');
    }

    if (!formattedDate) {
      setFormattedDateError('Joining date is required');
      isValid = false;
    } else {
      setFormattedDateError('');
    }

    return isValid;
  };

  const handleSave = async () => {
    console.log('Clicked');

    if (!validateInputs()) {
      return;
    }

    // Create employment data object
    const employmentData = {
      user_id: userId,
      isCurrentCompany: isCurrent ? 'Yes' : 'No',
      curr_annual_salary: +salary,
      employment_type: employmentType,
      joining_date: formattedDate,
      end_date: '11/08/2010', // Replace with dynamic value if needed
      total_exp_in_years: years,
      total_exp_in_months: months,
      curr_job_title: jobTitle,
      curr_company_name: companyName,
      notice_period: noticePeriod,
      currency: currency,
      skill_used: skillNames.join(','),
    };

    // If editing existing employment, add the ID
    if (emp) {
      employmentData.emp_id = emp.emp_id;
    }

    // For API requests
    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.EMPLOYMENT, employmentData);
      console.log('Response:', response.data);

      if (response.data.status === 'success') {
        navigation.navigate(req === 'ResumeLocal' ? 'Resume Form' : 'MyTabs');
        setLoading(false);
      } else {
        console.error('Failed to save employment details:', response.data);
        setLoading(false);
      }
    } catch (error) {
      console.error('API Error:', error);
      alert('Failed to save data. Please try again.');
      setLoading(false);
    }
  };

  const getOptionsForDropdown = (dropdownType) => {
    switch (dropdownType) {
      case 'Currency':
        return ['₹', '$', '€', '£'];
      default:
        return [];
    }
  };

  const fetchSkills = async () => {
    try {
      const skills = await axios.get(API_ENDPOINTS.SKILL_LIST);
      const skillList = skills.data.data.map((item) => ({
        label: item.skill_name,
        value: item.skill_id,
      }));
      setSkillList(skillList);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddSkillFromDropdown = () => {
    if (selectedSkill) {
      // Find the selected skill object from skillList
      const selectedSkillObj = skillList.find((skill) => skill.value === selectedSkill);

      // Check if skill already exists in the skills array
      if (selectedSkillObj && !skills.includes(selectedSkillObj.value)) {
        setSkills([...skills, selectedSkillObj.value]);
        setSkillNames([...skillNames, selectedSkillObj.label]);
        setSelectedSkill(null); // Reset selection
        setSkillOpen(false); // Close dropdown after selection
      }
    }
  };

  const handleOpenDropdown = (type) => {
    // Close other dropdowns if needed
    if (type === 'skill') {
      setSkillOpen(true);
    }
  };

  const handleSelect = (option, dropdownType) => {
    switch (dropdownType) {
      case 'Currency':
        setCurrency(option);
        break;
    }
    setActiveDropdown(null);
  };

  const toggleDropdown = (dropdownType, event) => {
    const { pageY, pageX } = event.nativeEvent;
    setDropdownPosition({ top: pageY, left: pageX, width: width - 40 });

    if (activeDropdown === dropdownType) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdownType);
    }
  };

  const renderDropdownModal = () => {
    if (!activeDropdown) return null;

    const options = getOptionsForDropdown(activeDropdown);

    return (
      <Modal
        transparent={true}
        visible={!!activeDropdown}
        animationType="none"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActiveDropdown(null)}
        >
          <View
            style={[
              styles.dropdownOptions,
              {
                top: dropdownPosition.top + 28,
                left: dropdownPosition.left - 54,
                width: 80,
              },
            ]}
          >
            <ScrollView
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.dropdownScrollContent}
            >
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    index < options.length - 1 && styles.optionBorder,
                    index % 2 === 0 && { backgroundColor: '#14B6AA19' },
                  ]}
                  onPress={() => handleSelect(option, activeDropdown)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={[styles.header, { marginTop: req === 'ResumeLocal' ? 40 : 0 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Employment</Text>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 30 , alignItems: 'center' }}>
       
            
       
             <TouchableOpacity disabled={loading} onPress={handleSave}>
                 <Text style={styles.saveButton}>
                   {emp ? (loading ? 'Saving...' : 'Edit') : loading ? 'Saving...' : 'Save'}
                 </Text>
               </TouchableOpacity>
       
       
         {emp &&    <TouchableOpacity style={styles.trashButton} onPress={handleDelete}>
               <Ionicons name="trash-outline" size={20} color="red" />
             </TouchableOpacity>}
             </View>
      </View>
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Is this your current company?</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={isCurrent ? styles.badgeButtonSelected : styles.badgeButtonUnselected}
              onPress={() => setIsCurrent(true)}
            >
              <Text style={styles.buttonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={!isCurrent ? styles.badgeButtonSelected : styles.badgeButtonUnselected}
              onPress={() => setIsCurrent(false)}
            >
              <Text style={styles.buttonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Employment type</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={
                employmentType === 'Full-Time'
                  ? styles.badgeButtonSelected
                  : styles.badgeButtonUnselected
              }
              onPress={() => setEmploymentType('Full-Time')}
            >
              <Text style={styles.buttonText}>Full-Time</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={
                employmentType === 'Part-Time'
                  ? styles.badgeButtonSelected
                  : styles.badgeButtonUnselected
              }
              onPress={() => setEmploymentType('Part-Time')}
            >
              <Text style={styles.buttonText}>Part-Time</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Total Experience</Text>
          <View style={styles.experienceContainer}>
            <View style={styles.experienceInputGroup}>
              <TextInput
                style={styles.experienceInput}
                placeholder=""
                keyboardType="numeric"
                value={years}
                onChangeText={setYears}
                maxLength={2}
              />
              <Text style={styles.unitLabel}>Years</Text>
            </View>

            <View style={styles.experienceInputGroup}>
              <TextInput
                style={styles.experienceInput}
                placeholder=""
                keyboardType="numeric"
                value={months}
                onChangeText={(text) => {
                  const numValue = parseInt(text);
                  if (!text || (numValue >= 0 && numValue <= 11)) {
                    setMonths(text);
                  }
                }}
                maxLength={2}
              />
              <Text style={styles.unitLabel}>Months</Text>
            </View>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Company Name</Text>
          <TextInput
            style={[styles.input, companyNameError && styles.inputError]}
            placeholder="Company Name"
            value={companyName}
            onChangeText={setCompanyName}
          />
          {companyNameError && <Text style={styles.errorText}>{companyNameError}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Job Title</Text>
          <TextInput
            style={[styles.input, jobTitleError && styles.inputError]}
            placeholder="Job Title"
            value={jobTitle}
            onChangeText={setJobTitle}
          />
          {jobTitleError && <Text style={styles.errorText}>{jobTitleError}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date of Join</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[styles.datePickerButton, formattedDateError && styles.inputError]}
          >
            <Text style={formattedDate ? styles.dateTextSelected : styles.dateTextPlaceholder}>
              {formattedDate || 'Select Date'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#667085" />
          </TouchableOpacity>
          {formattedDateError && <Text style={styles.errorText}>{formattedDateError}</Text>}

          {showDatePicker &&
            (Platform.OS === 'ios' ? (
              <Modal
                transparent={true}
                visible={showDatePicker}
                animationType="slide"
                onRequestClose={() => setShowDatePicker(false)}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setShowDatePicker(false)}
                >
                  <View style={styles.datePickerContainer}>
                    <View style={styles.datePickerHeader}>
                      <Text style={styles.datePickerTitle}>Select Date</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={styles.datePickerDoneButton}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={selected instanceof Date ? selected : new Date()}
                      mode="date"
                      display="spinner"
                      onChange={(event, date) => {
                        if (date) {
                          setSelected(date); // Store as Date object
                          setFormattedDate(formatDate(date)); // Display formatted date
                        }
                        setShowDatePicker(false);
                      }}
                      style={{ width: '100%' }}
                      textColor="#333"
                    />
                  </View>
                </TouchableOpacity>
              </Modal>
            ) : (
              <DateTimePicker
                value={selected instanceof Date ? selected : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  if (date) {
                    setSelected(date); // Store as Date object
                    setFormattedDate(formatDate(date)); // Display formatted date
                  }
                  setShowDatePicker(false);
                }}
              />
            ))}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Skills</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <DropDownPicker
                searchable={true}
                listMode="SCROLLVIEW"
                scrollViewProps={{ nestedScrollEnabled: true }}
                open={skillOpen}
                setOpen={(open) => {
                  if (open) handleOpenDropdown('skill');
                  else setSkillOpen(false);
                }}
                value={selectedSkill}
                setValue={setSelectedSkill}
                items={skillList}
                placeholder="Select Skill"
                style={[styles.dropdownInput]}
                dropDownContainerStyle={[styles.dropdownContainer, { maxHeight: 200 }]}
                zIndex={2000}
                zIndexInverse={3000}
              />
            </View>
            <TouchableOpacity
              style={[styles.addSkillButton, { marginLeft: 10 }]}
              onPress={handleAddSkillFromDropdown}
            >
              <Text style={styles.addSkillText}>Add</Text>
              <Ionicons name="add" size={18} color="#50B5A3" />
            </TouchableOpacity>
          </View>

          {skillNames.length > 0 && (
            <View style={styles.skillsContainer}>
              {skillNames.map((skillName, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skillName}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newSkillNames = [...skillNames];
                      newSkillNames.splice(index, 1);
                      setSkillNames(newSkillNames);

                      const newSkills = [...skills];
                      newSkills.splice(index, 1);
                      setSkills(newSkills);
                    }}
                  >
                    <Ionicons name="close-circle" size={16} color="#667085" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current annual salary</Text>
          <View style={styles.experienceContainer}>
            <View style={styles.experienceInputGroup}>
              <TouchableOpacity
                style={[
                  styles.input,
                  activeDropdown === 'Currency' && styles.activeInput,
                  { width: 80, height: 60 },
                ]}
                onPress={(e) => toggleDropdown('Currency', e)}
              >
                <Text style={[styles.inputText, currency && styles.selectedInputText]}>
                  {currency || '$'}
                </Text>
                <Ionicons
                  name={
                    activeDropdown === 'Currency' ? 'chevron-up-outline' : 'chevron-down-outline'
                  }
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.experienceInputGroup}>
              <TextInput
                style={[styles.AmountInput, salaryError && styles.inputError]}
                placeholder=""
                keyboardType="numeric"
                value={salary}
                onChangeText={setSalary}
                maxLength={10}
              />
              <Text style={styles.unitLabel}>per year</Text>
            </View>
          </View>
          {salaryError && <Text style={styles.errorText}>{salaryError}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notice period*</Text>
          <View style={[styles.buttonRow, { flexWrap: 'wrap' }]}>
            {NoticePeroidOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={
                  noticePeriod === option
                    ? styles.badgeButtonSelected
                    : styles.badgeButtonUnselected
                }
                onPress={() => setNoticePeriod(option)}
              >
                <Text style={[styles.buttonText, { fontSize: 12 }]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {renderDropdownModal()}
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
    position: 'relative', // Added for error message positioning
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
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTextPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  dateTextSelected: {
    fontSize: 16,
    color: '#333',
  },
  datePickerButton: {
    width: '100%',
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
  datePickerContainer: {
    width: width * 0.9,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  datePickerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },
  datePickerDoneButton: {
    fontSize: 16,
    color: '#14B6AA',
    fontFamily: 'Poppins-Medium',
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    height: 50,
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    borderColor: '#D5D9DF',
    backgroundColor: '#fff',
    borderWidth: 1,
  },
  addSkillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    height: 50,
  },
  addSkillText: {
    color: '#50B5A3',
    marginRight: 5,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderWidth: 1,
    borderColor: '#DDE0E5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#667085',
    fontSize: 12,
    marginRight: 5,
  },
});

export default Employment;
