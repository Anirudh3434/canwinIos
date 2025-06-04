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
  Alert,
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
  const [currency, setCurrency] = useState('₹'); // Set default currency
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
  const [employmentTypeError, setEmploymentTypeError] = useState('');
  const [experienceError, setExperienceError] = useState('');

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          const id = parseInt(storedUserId, 10);
          setUserId(id); // Fixed: removed unnecessary +id
        }
      } catch (error) {
        console.error('Failed to retrieve userId:', error);
      }
    };
    fetchUserId();
    fetchSkills();
  }, []);

  // Fixed: Improved date conversion with better error handling
  const convertToDate = (dateString) => {
    if (!dateString) return new Date();
    
    try {
      // Handle both formats: DD/MM/YYYY and DD-MM-YYYY
      const parts = dateString.includes('/') ? dateString.split('/') : dateString.split('-');
      if (parts.length !== 3) return new Date();
      
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
      const year = parseInt(parts[2], 10);
      
      // Validate date parts
      if (isNaN(day) || isNaN(month) || isNaN(year) || 
          day < 1 || day > 31 || month < 0 || month > 11 || year < 1900) {
        return new Date();
      }
      
      return new Date(year, month, day);
    } catch (error) {
      console.error('Error converting date:', error);
      return new Date();
    }
  };

  // Fixed: Consistent date formatting
  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    return dayjs(date).format('DD/MM/YYYY');
  };

  // Fixed: Better data loading with proper skill handling
  useEffect(() => {
    if (emp) {
      setYears(emp.total_exp_in_years?.toString() || '');
      setMonths(emp.total_exp_in_months?.toString() || '');
      setIsCurrent(emp.isCurrentCompany === 'Yes');
      setEmploymentType(emp.employment_type || '');
      setCompanyName(emp.curr_company_name || '');
      setJobTitle(emp.curr_job_title || '');
      setSalary(emp.curr_annual_salary?.toString() || '');
      setNoticePeriod(emp.notice_period || '');
      setCurrency(emp.currency || '₹');

      // Fixed: Better skill handling
      if (emp.skill_used) {
        const skillNamesArray = emp.skill_used.split(',').map(skill => skill.trim()).filter(Boolean);
        setSkillNames(skillNamesArray);
        // Note: You might need to map skill names to IDs if your API requires skill IDs
      }

      // Fixed: Better date handling
      if (emp.joining_date) {
        const dateObj = convertToDate(emp.joining_date);
        setSelected(dateObj);
        setFormattedDate(formatDate(dateObj));
      }
    }
  }, [emp]);

  // Fixed: Consistent date change handling
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelected(selectedDate);
      setFormattedDate(formatDate(selectedDate));
      setFormattedDateError(''); // Clear error when date is selected
    }
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
      'Delete Employment',
      'Are you sure you want to delete this employment record?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              setLoading(true);
              console.log('Deleting employment with ID:', emp.emp_id);
              const response = await axios.delete(API_ENDPOINTS.DELETE_EMPLOYMENT, {
                params: { employment_id: emp?.emp_id },
              });
              
              if (response.data.status === 'success') {
                navigation.navigate('MyTabs');
              } else {
                Alert.alert('Error', 'Failed to delete employment record');
              }
            } catch (error) {
              console.error('Error deleting employment:', error);
              Alert.alert('Error', 'Failed to delete employment record');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  // Fixed: Comprehensive validation
  const validateInputs = () => {
    let isValid = true;

    // Reset all errors
    setCompanyNameError('');
    setJobTitleError('');
    setSalaryError('');
    setFormattedDateError('');
    setEmploymentTypeError('');
    setExperienceError('');

    // Company name validation
    if (!companyName.trim()) {
      setCompanyNameError('Company name is required');
      isValid = false;
    }

    // Job title validation
    if (!jobTitle.trim()) {
      setJobTitleError('Job title is required');
      isValid = false;
    }

    // Employment type validation
    if (!employmentType) {
      setEmploymentTypeError('Employment type is required');
      isValid = false;
    }

    // Experience validation
    if (!years && !months) {
      setExperienceError('Please enter your total experience');
      isValid = false;
    } else {
      const yearsNum = parseInt(years) || 0;
      const monthsNum = parseInt(months) || 0;
      
      if (yearsNum < 0 || monthsNum < 0 || monthsNum > 11) {
        setExperienceError('Please enter valid experience values');
        isValid = false;
      }
    }

    // Salary validation (only for current employment)
    if (isCurrent) {
      if (!salary.trim()) {
        setSalaryError('Salary is required for current employment');
        isValid = false;
      } else if (isNaN(parseFloat(salary)) || parseFloat(salary) <= 0) {
        setSalaryError('Please enter a valid salary amount');
        isValid = false;
      }
    }

    // Date validation
    if (!formattedDate) {
      setFormattedDateError('Joining date is required');
      isValid = false;
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }

    // Fixed: Better data preparation
    const employmentData = {
      user_id: userId,
      isCurrentCompany: isCurrent ? 'Yes' : 'No',
      employment_type: employmentType,
      joining_date: formattedDate,
      total_exp_in_years: parseInt(years) || 0,
      total_exp_in_months: parseInt(months) || 0,
      curr_job_title: jobTitle,
      curr_company_name: companyName,
      skill_used: skillNames.join(','),
    };

    // Add current employment specific fields
    if (isCurrent) {
      employmentData.curr_annual_salary = parseFloat(salary);
      employmentData.currency = currency;
      employmentData.notice_period = noticePeriod;
    } else {
      // For previous employment, you might want to add end_date
      employmentData.end_date = ''; // You should add an end date picker for previous employment
    }

    // If editing existing employment, add the ID
    if (emp?.emp_id) {
      employmentData.emp_id = emp.emp_id;
    }

    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.EMPLOYMENT, employmentData);
      
      if (response.data.status === 'success') {
        navigation.navigate(req === 'ResumeLocal' ? 'Resume Form' : 'MyTabs');
      } else {
        Alert.alert('Error', 'Failed to save employment details. Please try again.');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', 'Failed to save data. Please try again.');
    } finally {
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
      const response = await axios.get(API_ENDPOINTS.SKILL_LIST);
      if (response.data?.data) {
        const skillList = response.data.data.map((item) => ({
          label: item.skill_name,
          value: item.skill_id,
        }));
        setSkillList(skillList);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  // Fixed: Better skill addition logic
  const handleAddSkillFromDropdown = () => {
    if (selectedSkill) {
      const selectedSkillObj = skillList.find((skill) => skill.value === selectedSkill);
      
      if (selectedSkillObj) {
        // Check if skill already exists
        const skillExists = skills.includes(selectedSkillObj.value) || 
                           skillNames.includes(selectedSkillObj.label);
        
        if (!skillExists) {
          setSkills([...skills, selectedSkillObj.value]);
          setSkillNames([...skillNames, selectedSkillObj.label]);
        }
        
        setSelectedSkill(null);
        setSkillOpen(false);
      }
    }
  };

  // Fixed: Better skill removal
  const handleRemoveSkill = (index) => {
    const newSkillNames = skillNames.filter((_, i) => i !== index);
    const newSkills = skills.filter((_, i) => i !== index);
    setSkillNames(newSkillNames);
    setSkills(newSkills);
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
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <View style={[styles.header, { marginTop: req === 'ResumeLocal' ? Platform.OS === 'ios' ? -10 : 20 : 0 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Employment</Text>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 30, alignItems: 'center' }}>
          <TouchableOpacity disabled={loading} onPress={handleSave}>
            <Text style={[styles.saveButton, loading && styles.disabledButton]}>
              {emp ? (loading ? 'Updating...' : 'Update') : loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>

          {emp && (
            <TouchableOpacity style={styles.trashButton} onPress={handleDelete} disabled={loading}>
              <Ionicons name="trash-outline" size={20} color={loading ? "#ccc" : "red"} />
            </TouchableOpacity>
          )}
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
          <Text style={styles.label}>Employment type *</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={
                employmentType === 'Full-Time'
                  ? styles.badgeButtonSelected
                  : styles.badgeButtonUnselected
              }
              onPress={() => {
                setEmploymentType('Full-Time');
                setEmploymentTypeError('');
              }}
            >
              <Text style={styles.buttonText}>Full-Time</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={
                employmentType === 'Part-Time'
                  ? styles.badgeButtonSelected
                  : styles.badgeButtonUnselected
              }
              onPress={() => {
                setEmploymentType('Part-Time');
                setEmploymentTypeError('');
              }}
            >
              <Text style={styles.buttonText}>Part-Time</Text>
            </TouchableOpacity>
          </View>
          {employmentTypeError && <Text style={styles.errorText}>{employmentTypeError}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Total Experience *</Text>
          <View style={styles.experienceContainer}>
            <View style={styles.experienceInputGroup}>
              <TextInput
                style={[styles.experienceInput, experienceError && styles.inputError]}
                placeholder="0"
                keyboardType="numeric"
                value={years}
                onChangeText={(text) => {
                  setYears(text);
                  setExperienceError('');
                }}
                maxLength={2}
              />
              <Text style={styles.unitLabel}>Years</Text>
            </View>

            <View style={styles.experienceInputGroup}>
              <TextInput
                style={[styles.experienceInput, experienceError && styles.inputError]}
                placeholder="0"
                keyboardType="numeric"
                value={months}
                onChangeText={(text) => {
                  const numValue = parseInt(text);
                  if (!text || (numValue >= 0 && numValue <= 11)) {
                    setMonths(text);
                    setExperienceError('');
                  }
                }}
                maxLength={2}
              />
              <Text style={styles.unitLabel}>Months</Text>
            </View>
          </View>
          {experienceError && <Text style={styles.errorText}>{experienceError}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{isCurrent ? 'Current Company Name' : 'Company Name'} *</Text>
          <TextInput
            style={[styles.input, companyNameError && styles.inputError]}
            placeholder="Enter company name"
            value={companyName}
            onChangeText={(text) => {
              setCompanyName(text);
              setCompanyNameError('');
            }}
          />
          {companyNameError && <Text style={styles.errorText}>{companyNameError}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{isCurrent ? 'Current Job Title' : 'Job Title'} *</Text>
          <TextInput
            style={[styles.input, jobTitleError && styles.inputError]}
            placeholder="Enter job title"
            value={jobTitle}
            onChangeText={(text) => {
              setJobTitle(text);
              setJobTitleError('');
            }}
          />
          {jobTitleError && <Text style={styles.errorText}>{jobTitleError}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date of Joining *</Text>
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

          {showDatePicker && (
            Platform.OS === 'ios' ? (
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
                      onChange={handleDateChange}
                      style={{ width: '100%' }}
                      textColor="#333"
                      maximumDate={new Date()} // Prevent future dates
                    />
                  </View>
                </TouchableOpacity>
              </Modal>
            ) : (
              <DateTimePicker
                value={selected instanceof Date ? selected : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()} // Prevent future dates
              />
            )
          )}
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
                setOpen={setSkillOpen}
                value={selectedSkill}
                setValue={setSelectedSkill}
                items={skillList}
                placeholder="Select Skill"
                style={styles.dropdownInput}
                dropDownContainerStyle={[styles.dropdownContainer, { maxHeight: 200 }]}
                zIndex={2000}
                zIndexInverse={3000}
              />
            </View>
            <TouchableOpacity
              style={[styles.addSkillButton, { marginLeft: 10 }]}
              onPress={handleAddSkillFromDropdown}
              disabled={!selectedSkill}
            >
              <Text style={[styles.addSkillText, !selectedSkill && { color: '#ccc' }]}>Add</Text>
              <Ionicons name="add" size={18} color={!selectedSkill ? "#ccc" : "#50B5A3"} />
            </TouchableOpacity>
          </View>

          {skillNames.length > 0 && (
            <View style={styles.skillsContainer}>
              {skillNames.map((skillName, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skillName}</Text>
                  <TouchableOpacity onPress={() => handleRemoveSkill(index)}>
                    <Ionicons name="close-circle" size={16} color="#667085" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {isCurrent && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current annual salary *</Text>
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
                    {currency}
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
                  placeholder="Enter amount"
                  keyboardType="numeric"
                  value={salary}
                  onChangeText={(text) => {
                    setSalary(text);
                    setSalaryError('');
                  }}
                  maxLength={10}
                />
                <Text style={styles.unitLabel}>per year</Text>
              </View>
            </View>
            {salaryError && <Text style={styles.errorText}>{salaryError}</Text>}
          </View>
        )}

        {isCurrent && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Notice period</Text>
            <View style={[styles.buttonRow, { flexWrap: 'wrap' }]}>
              {NoticePeroidOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    noticePeriod === option
                      ? styles.badgeButtonSelected
                      : styles.badgeButtonUnselected,
                    { marginBottom: 10 }
                  ]}
                  onPress={() => setNoticePeriod(option)}
                >
                  <Text style={[styles.buttonText, { fontSize: 12 }]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
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
