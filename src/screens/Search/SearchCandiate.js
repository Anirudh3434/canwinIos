import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  StatusBar,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  BackHandler,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Colors } from '../../theme/color';
import style from '../../theme/style';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

export default function SearchCandiate() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Basic search fields
  const [title, setTitle] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [maxExperience, setMaxExperience] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');

  // Advanced search fields
  const [department, setDepartment] = useState('');
  const [industry, setIndustry] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [designation, setDesignation] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedNoticePeriod, setSelectedNoticePeriod] = useState([]);
  const [selectedEducation, setSelectedEducation] = useState([]);

  const searchHistory = useSelector((state) => state.searchHistory);

  const noticePeriods = ['Immediate', '15 Days', '1 Month', '2 Months', '3 Months', '6 Months'];
  const educationLevels = ['Class X', 'Class XII', 'Diploma', 'Bachelor', 'Master', 'PhD'];
  const genderOptions = ['Male', 'Female', 'Other'];

  const toggleNoticePeriod = (period) => {
    setSelectedNoticePeriod((prev) =>
      prev.includes(period) ? prev.filter((p) => p !== period) : [...prev, period]
    );
  };

  const toggleEducation = (education) => {
    setSelectedEducation((prev) =>
      prev.includes(education) ? prev.filter((e) => e !== education) : [...prev, education]
    );
  };

  const handleSearch = async () => {
    if (loading) return;
    setLoading(true);

    if (!title.trim()) {
      Alert.alert('Error', 'Job Title is required');
      setLoading(false);
      return;
    }

  

    try {
      const response = await axios.get(
        'https://devcrm20.abacasys.com/ords/canwinn/mobile_api/search-candidate',
        { params: {
          job_title: title.trim(),
          min_experience: minExperience.trim(),
          max_experience: maxExperience.trim(),
          country: country.trim(),
          state: state.trim(),
          min_salary: minSalary.trim(),
          max_salary: maxSalary.trim(),
          department: department.trim(),
          industry: industry.trim(),
          company_name: companyName.trim(),
          designation: designation.trim(),
          gender: selectedGender,
          notice_period: selectedNoticePeriod,
          education: selectedEducation,
        } 
      }
      );
      console.log(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }

    
    
    



  };


  const backAction = () => {
    if (navigation.isFocused()) {
      navigation.navigate('MyTabs');
      return true;
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  const renderBadge = (text, isSelected, onPress, type = 'default') => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.badge,
        isSelected && styles.selectedBadge,
        type === 'gender' && styles.genderBadge,
      ]}
    >
      <Text style={[styles.badgeText, isSelected && styles.selectedBadgeText]}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar backgroundColor={Colors.bg} translucent={false} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('MyTabs')}>
              <Icon name="arrow-back" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Search Candidate</Text>
          </View>

          {/* Job Title */}
          <View style={styles.inputSection}>
            <Text style={styles.labelText}>Job Title *</Text>
            <TextInput
              placeholder="Enter Job Title"
              placeholderTextColor={Colors.disable2}
              selectionColor={Colors.primary}
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />
          </View>

          {/* Experience */}
          <View style={styles.inputSection}>
            <Text style={styles.labelText}>Experience (in years)</Text>
            <View style={styles.rowContainer}>
              <TextInput
                placeholder="Min Years"
                placeholderTextColor={Colors.disable2}
                selectionColor={Colors.primary}
                value={minExperience}
                onChangeText={setMinExperience}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                placeholder="Max Years"
                placeholderTextColor={Colors.disable2}
                selectionColor={Colors.primary}
                value={maxExperience}
                onChangeText={setMaxExperience}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.inputSection}>
            <Text style={styles.labelText}>Location</Text>
            <View style={styles.rowContainer}>
              <TextInput
                placeholder="Country"
                placeholderTextColor={Colors.disable2}
                selectionColor={Colors.primary}
                value={country}
                onChangeText={setCountry}
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                placeholder="State"
                placeholderTextColor={Colors.disable2}
                selectionColor={Colors.primary}
                value={state}
                onChangeText={setState}
                style={[styles.input, styles.halfInput]}
              />
            </View>
          </View>

          {/* Salary */}
          <View style={styles.inputSection}>
            <Text style={styles.labelText}>Salary Range</Text>
            <View style={styles.rowContainer}>
              <TextInput
                placeholder="Min Salary"
                placeholderTextColor={Colors.disable2}
                selectionColor={Colors.primary}
                value={minSalary}
                onChangeText={setMinSalary}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                placeholder="Max Salary"
                placeholderTextColor={Colors.disable2}
                selectionColor={Colors.primary}
                value={maxSalary}
                onChangeText={setMaxSalary}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
            </View>
          </View>

          {/* More Options Button */}
          <View style={styles.moreOptionsContainer}>
            <TouchableOpacity
              onPress={() => setShowMoreOptions(!showMoreOptions)}
              style={styles.moreOptionsButton}
            >
              <Text style={styles.moreOptionsText}>More Options</Text>
            </TouchableOpacity>
          </View>

          {/* Advanced Options - Collapsible */}
          {showMoreOptions && (
            <View style={styles.advancedOptionsContainer}>
              {/* Department */}
              <View style={styles.inputSection}>
                <Text style={styles.labelText}>Department</Text>
                <TextInput
                  placeholder="e.g. IT, HR, Finance"
                  placeholderTextColor={Colors.disable2}
                  selectionColor={Colors.primary}
                  value={department}
                  onChangeText={setDepartment}
                  style={styles.input}
                />
              </View>

              {/* Industry */}
              <View style={styles.inputSection}>
                <Text style={styles.labelText}>Industry</Text>
                <TextInput
                  placeholder="e.g. Technology, Healthcare"
                  placeholderTextColor={Colors.disable2}
                  selectionColor={Colors.primary}
                  value={industry}
                  onChangeText={setIndustry}
                  style={styles.input}
                />
              </View>

              {/* Company Name */}
              <View style={styles.inputSection}>
                <Text style={styles.labelText}>Company Name</Text>
                <TextInput
                  placeholder="Enter company name"
                  placeholderTextColor={Colors.disable2}
                  selectionColor={Colors.primary}
                  value={companyName}
                  onChangeText={setCompanyName}
                  style={styles.input}
                />
              </View>

              {/* Designation */}
              <View style={styles.inputSection}>
                <Text style={styles.labelText}>Designation</Text>
                <TextInput
                  placeholder="e.g. Senior Developer, Manager"
                  placeholderTextColor={Colors.disable2}
                  selectionColor={Colors.primary}
                  value={designation}
                  onChangeText={setDesignation}
                  style={styles.input}
                />
              </View>

              {/* Gender */}
              <View style={styles.inputSection}>
                <Text style={styles.labelText}>Gender</Text>
                <View style={styles.badgeContainer}>
                  {genderOptions.map((gender) =>
                    renderBadge(
                      gender,
                      selectedGender === gender,
                      () => setSelectedGender(selectedGender === gender ? '' : gender),
                      'gender'
                    )
                  )}
                </View>
              </View>

              {/* Notice Period */}
              <View style={styles.inputSection}>
                <Text style={styles.labelText}>Notice Period</Text>
                <View style={styles.badgeContainer}>
                  {noticePeriods.map((period) =>
                    renderBadge(period, selectedNoticePeriod.includes(period), () =>
                      toggleNoticePeriod(period)
                    )
                  )}
                </View>
              </View>

              {/* Education */}
              <View style={styles.inputSection}>
                <Text style={styles.labelText}>Education</Text>
                <View style={styles.badgeContainer}>
                  {educationLevels.map((education) =>
                    renderBadge(education, selectedEducation.includes(education), () =>
                      toggleEducation(education)
                    )
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Search Button */}
          <View style={styles.searchButtonContainer}>
            <TouchableOpacity
              onPress={handleSearch}
              style={[styles.searchButton, loading && styles.searchButtonDisabled]}
              disabled={loading}
            >
              <Text style={styles.searchButtonText}>
                {loading ? 'Searching...' : 'Search Candidates'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  title: {
    fontSize: width < 375 ? 18 : 22,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  labelText: {
    fontSize: width < 375 ? 13 : 15,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    fontSize: width < 375 ? 14 : 16,

    color: '#333',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  moreOptionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  moreOptionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 20,

    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  moreOptionsText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  advancedOptionsContainer: {
    marginHorizontal: 10,
    marginBottom: 20,
    borderRadius: 15,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
    marginBottom: 5,
  },
  selectedBadge: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderBadge: {
    minWidth: 70,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedBadgeText: {
    color: '#FFF',
    fontWeight: '600',
  },
  searchButtonContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  searchButtonText: {
    color: 'white',
    fontSize: width < 375 ? 16 : 18,
    fontFamily: 'Poppins-SemiBold',
  },
});
