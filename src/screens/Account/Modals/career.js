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
  Alert,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import axios from 'axios';
import { API_ENDPOINTS } from '../../../api/apiConfig';

const { width } = Dimensions.get('window');

const Career = () => {
  const route = useRoute();

  const { id, data } = route.params || {};

  const navigation = useNavigation();

  // State for preferred locations
  const [preferredLocations, setPreferredLocations] = useState(
    data?.prefered_location?.split(',') || []
  );
  const [newLocation, setNewLocation] = useState('');
  const [preferredJobRole, setPreferredJobRole] = useState(data?.prefered_job_role || '');
  const [preferredShift, setPreferredShift] = useState(data?.prefered_shift || '');
  const [employmentType, setEmploymentType] = useState(data?.prefered_employment_type || '');
  const [jobType, setJobType] = useState(data?.job_type || '');
  const [loading, setLoading] = useState(false);

  // State for salary
  const [salary, setSalary] = useState(data?.current_annual_salary || '');
  const [currency, setCurrency] = useState(data?.currency || '₹');

  // Dropdown state
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Dropdown options
  const currencyOptions = ['₹', '$', '€', '£'];

  // Handle adding a new location
  const handleAddLocation = () => {
    if (
      newLocation.trim() !== '' &&
      preferredLocations.length < 3 &&
      !preferredLocations.includes(newLocation)
    ) {
      setPreferredLocations([...preferredLocations, newLocation]);
      setNewLocation('');
    } else if (preferredLocations.length >= 3) {
      Alert.alert('Limit Reached', 'You can only add up to 3 preferred locations.');
    } else if (preferredLocations.includes(newLocation)) {
      Alert.alert('Duplicate Entry', 'This location is already in your preferences.');
    }
  };

  // Remove a location
  const handleRemoveLocation = (locationToRemove) => {
    setPreferredLocations(preferredLocations.filter((location) => location !== locationToRemove));
  };

  // Toggle dropdown
  const toggleDropdown = (event) => {
    const { pageY, pageX } = event.nativeEvent;
    setDropdownPosition({ top: pageY, left: pageX, width: width - 40 });
    setActiveDropdown(activeDropdown ? null : 'Currency');
  };

  // Handle currency selection
  const handleCurrencySelect = (selectedCurrency) => {
    setCurrency(selectedCurrency);
    setActiveDropdown(null);
  };

  // Render currency dropdown modal
  const renderDropdownModal = () => {
    if (!activeDropdown) return null;

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
              {currencyOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    index < currencyOptions.length - 1 && styles.optionBorder,
                    index % 2 === 0 && { backgroundColor: '#14B6AA19' },
                  ]}
                  onPress={() => handleCurrencySelect(option)}
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

  // Save career preferences
  const handleSave = async () => {
    const params = {
      user_id: id,
      prefered_location: preferredLocations.join(','),
      prefered_job_role: preferredJobRole,
      prefered_shift: preferredShift,
      prefered_employment_type: employmentType,
      salary_expectation: salary,
      currency: currency,
      job_type: jobType,
      current_annual_salary: salary,
    };
    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.CAREER, params);

      if (response.data.status === 'success') {
        navigation.navigate('MyTabs');
      } else {
        Alert.alert('Error', response.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Career Preferences</Text>
        </View>
        <TouchableOpacity disabled={loading} onPress={handleSave}>
          <Text style={styles.saveButton}>{loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Preferred Locations */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Preferred Locations (up to 3)</Text>
          <View style={styles.inputRowContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter location"
              value={newLocation}
              onChangeText={setNewLocation}
              placeholderTextColor="#C8C8C8"
              returnKeyType="done"
              onSubmitEditing={handleAddLocation}
            />
            <TouchableOpacity onPress={handleAddLocation} style={styles.addButton}>
              <Ionicons name="add" size={24} color="#14B6AA" />
            </TouchableOpacity>
          </View>

          <View style={styles.badgeContainer}>
            {preferredLocations.map((location, index) => (
              <View key={index} style={styles.badgeButtonSelected}>
                <Text style={styles.badgeText}>{location}</Text>
                <TouchableOpacity onPress={() => handleRemoveLocation(location)}>
                  <Ionicons name="close-circle" size={16} color="#14B6AA" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Job Role */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Preferred Job Role</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter job role"
            value={preferredJobRole}
            onChangeText={setPreferredJobRole}
            placeholderTextColor="#C8C8C8"
          />
        </View>

        {/* Salary */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Annual Salary</Text>
          <View style={styles.salaryContainer}>
            <TouchableOpacity
              style={[styles.currencyInput, activeDropdown === 'Currency' && styles.activeInput]}
              onPress={toggleDropdown}
            >
              <Text style={styles.currencyText}>{currency}</Text>
              <Ionicons
                name={activeDropdown === 'Currency' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
            <TextInput
              style={styles.salaryInput}
              placeholder="Amount"
              value={salary}
              onChangeText={setSalary}
              keyboardType="numeric"
              placeholderTextColor="#C8C8C8"
            />
          </View>
        </View>

        {/* Job Type */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Job Type</Text>
          <View style={styles.buttonRow}>
            {['Permanent', 'Contractual'].map((type) => (
              <TouchableOpacity
                key={type}
                style={jobType === type ? styles.badgeButtonSelected : styles.badgeButtonUnselected}
                onPress={() => setJobType(type)}
              >
                <Text style={jobType === type ? styles.badgeText : styles.buttonText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Employment Type */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Employment Type</Text>
          <View style={styles.buttonRow}>
            {['Full Time', 'Part Time'].map((type) => (
              <TouchableOpacity
                key={type}
                style={
                  employmentType === type
                    ? styles.badgeButtonSelected
                    : styles.badgeButtonUnselected
                }
                onPress={() => setEmploymentType(type)}
              >
                <Text style={employmentType === type ? styles.badgeText : styles.buttonText}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preferred Shift */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Preferred Shift</Text>
          <View style={styles.buttonRow}>
            {['Day', 'Night', 'Flexible'].map((shift) => (
              <TouchableOpacity
                key={shift}
                style={
                  preferredShift === shift
                    ? styles.badgeButtonSelected
                    : styles.badgeButtonUnselected
                }
                onPress={() => setPreferredShift(shift)}
              >
                <Text style={preferredShift === shift ? styles.badgeText : styles.buttonText}>
                  {shift}
                </Text>
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
    // Existing shadow properties
    shadowColor: '#00000014',
    shadowOffset: { width: -2, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    // Add elevation for Android shadow
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
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    padding: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 15,
  },
  badgeButtonSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEFFFE',
    borderWidth: 1,
    borderColor: '#14B6AA',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 8,
  },
  badgeText: {
    color: '#14B6AA',
    fontFamily: 'Poppins-Medium',
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
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginTop: 10,
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    padding: 15,
    width: 80,
  },
  currencyText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  salaryInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  activeInput: {
    borderColor: '#14B6AA',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dropdownOptions: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 200,
  },
  dropdownScrollContent: {
    paddingVertical: 5,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
});

export default Career;
