import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppBar } from '@react-native-material/core';
import { Colors } from '../../theme/color';
import { useNavigation, useRoute } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { sanitizeData, formatCSV, sanitizeString } from '../../hooks/santize';

const AddJob = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState('job-details');

  const { job } = route.params || {};

  // States for form inputs
  const [jobTitle, setJobTitle] = useState(job?.job_title || '');
  const [jobDescription, setJobDescription] = useState(job?.job_description || '');
  const [workplaceType, setWorkplaceType] = useState(job?.WORKPLACE_TYPE || null);
  const [minSalary, setMinSalary] = useState(job?.MIN_SALARY || '');
  const [maxSalary, setMaxSalary] = useState(job?.MAX_SALARY || '');
  const [email, setEmail] = useState(job?.EMAIL || '');
  const [skills, setSkills] = useState(job?.JOB_SKILLS.split(',') || []);
  const [skillNames, setSkillNames] = useState(job?.JOB_SKILLS.split(',') || []);
  const [skillList, setSkillList] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [requirements, setRequirements] = useState(job?.JOB_REQUIRMENTS.split(',') || []);
  const [newRequirement, setNewRequirement] = useState('');
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState(false);
  const [showAttachment, setShowAttachment] = useState(false);
  const [DepartmentList, setDepartmentList] = useState([]);
  const [educationList, setEducationList] = useState([]);
  const [selectedEducations, setSelectedEducations] = useState(job?.EDUCATION.split(',') || []);
  const [job_status, setJobStatus] = useState(job?.STATUS || 'Active');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(job?.job_category_id?.toString() || '1');

  // Location states
  const [locations, setLocations] = useState(job?.JOB_LOCATION.split(',') || []);
  const [newLocation, setNewLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);

  const [receiveApplicantsBy, setReceiveApplicantsBy] = useState(job?.RECEIVE_APPLICANTS_BY);
  const [employmentType, setEmploymentType] = useState(job?.EMPLOYMENT_TYPE);
  const [minExperience, setMinExperience] = useState(job?.MIN_EXPERIENCE);
  const [maxExperience, setMaxExperience] = useState(job?.MAX_EXPERIENCE);
  const [department, setDepartment] = useState(job?.DEPARTMENT);
  const [comp_id, setComp_id] = useState(job?.COMPANY_ID);
  const [emp_id, setEmp_id] = useState(job?.employer_id);

  // Dropdown open states - IMPORTANT: Only one dropdown can be open at a time
  const [workplaceTypeOpen, setWorkplaceTypeOpen] = useState(false);
  const [employmentTypeOpen, setEmploymentTypeOpen] = useState(false);
  const [receiveByOpen, setReceiveByOpen] = useState(false);
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [skillOpen, setSkillOpen] = useState(false);
  const [educationOpen, setEducationOpen] = useState(false);

  // Handle opening one dropdown and closing others to avoid z-index conflicts
  const handleOpenDropdown = (dropdown) => {
    // Close all dropdowns
    setWorkplaceTypeOpen(false);
    setEmploymentTypeOpen(false);
    setReceiveByOpen(false);
    setDepartmentOpen(false);
    setCategoryOpen(false);
    setSkillOpen(false);
    setEducationOpen(false);

    // Open the requested dropdown
    switch (dropdown) {
      case 'workplace':
        setWorkplaceTypeOpen(true);
        break;
      case 'employment':
        setEmploymentTypeOpen(true);
        break;
      case 'receive':
        setReceiveByOpen(true);
        break;
      case 'department':
        setDepartmentOpen(true);
        break;
      case 'category':
        setCategoryOpen(true);
        break;
      case 'skill':
        setSkillOpen(true);
        break;
      case 'education':
        setEducationOpen(true);
        break;
      default:
        break;
    }
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim() !== '') {
      setRequirements([...requirements, newRequirement.trim()]);
      setShowAttachment(false);
      setNewRequirement('');
    }
  };

  const handleEducationSelect = (education) => {
    // Create a copy of the current selections to work with
    let updatedSelections = [...selectedEducations];

    // Check if this education is already selected
    const existed = selectedEducations?.includes(education.education_name);

    if (existed) {
      // If already selected, remove it
      updatedSelections.splice(updatedSelections.indexOf(education.education_name), 1);
    } else {
      // If not selected, add it
      updatedSelections.push(education.education_name);
    }

    // Update state with the new selections
    setSelectedEducations(updatedSelections);
  };

  const fetchEmpAndCompId = async () => {
    const userId = await AsyncStorage.getItem('userId');

    try {
      const empResponse = await axios.get(API_ENDPOINTS.EMPLOYER, { params: { user_id: +userId } });

      setEmp_id(empResponse.data.data.emp_id);

      const CompResponse = await axios.get(API_ENDPOINTS.COMPANY_DETAILS, {
        params: { user_id: +userId },
      });

      setComp_id(CompResponse.data.data.company_id);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDepartment = async () => {
    try {
      const department = await axios.get(API_ENDPOINTS.JOB_DEPARTMENT);

      const departmentlist = department.data.data.map((item) => ({
        label: item.dept_name,
        value: item.dept_name,
      }));

      setDepartmentList(departmentlist);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEducation = async () => {
    try {
      const education = await axios.get(API_ENDPOINTS.EDUCATION_LIST);

      setEducationList(education.data.data);
    } catch (error) {
      console.error(error);
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

  useEffect(() => {
    const skillIds = job?.JOB_SKILLS.split(',').map((id) => +id);
    const selectedSkills = skillList.filter((skill) => skillIds?.includes(skill.value));
    setSkills(selectedSkills.map((skill) => skill.value));
    setSkillNames(selectedSkills.map((skill) => skill.label));
  }, [skillList]);

  useEffect(() => {
    fetchDepartment();
    fetchEmpAndCompId();
    fetchEducation();
    fetchSkills();
  }, []);

  // Add a skill from dropdown selection
  const handleAddSkillFromDropdown = () => {
    if (selectedSkill) {
      // Find the selected skill object from skillList
      const selectedSkillObj = skillList.find((skill) => skill.value === selectedSkill);

      // Check if skill already exists in the skills array
      if (selectedSkillObj && !skills?.includes(selectedSkillObj.value)) {
        setSkills([...skills, selectedSkillObj.value]);
        setSkillNames([...skillNames, selectedSkillObj.label]);
        setSelectedSkill(null); // Reset selection
        setSkillOpen(false); // Close dropdown after selection
      }
    }
  };

  // Remove a skill
  const removeSkill = (skillToRemove, index) => {
    const newSkills = [...skills];
    const newSkillNames = [...skillNames];
    newSkills.splice(index, 1);
    newSkillNames.splice(index, 1);
    setSkills(newSkills);
    setSkillNames(newSkillNames);
  };

  // Add a location
  const handleAddLocation = () => {
    if (newLocation.trim() !== '') {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation('');
      setShowLocationInput(false);
    }
  };

  // Remove a location
  const removeLocation = (locationToRemove) => {
    setLocations(locations.filter((location) => location !== locationToRemove));
  };

  const handlePost = async () => {
    setLoading(true);
    if (jobTitle === '') {
      setLoading(false);
      Alert.alert('Job Title is required');
      return;
    }
    if (jobDescription === '') {
      setLoading(false);
      Alert.alert('Job Description is required');
      return;
    }
    if (workplaceType === '') {
      setLoading(false);
      Alert.alert('Workplace Type is required');
      return;
    }
    if (department === '') {
      setLoading(false);
      Alert.alert('Department is required');
      return;
    }
    if (employmentType === '') {
      setLoading(false);
      Alert.alert('Employment Type is required');
      return;
    }
    if (receiveApplicantsBy === '') {
      setLoading(false);
      Alert.alert('Receive Applicants By is required');
      return;
    }
    if (email === '') {
      setLoading(false);
      Alert.alert('Email is required');
      return;
    }

    if (minSalary > maxSalary) {
      setLoading(false);
      Alert.alert('Minimum Salary should be less than Maximum Salary');
      return;
    }

    if (minSalary < 0 || maxSalary < 0) {
      setLoading(false);
      Alert.alert('Salary should be greater than 0');
      return;
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLoading(false);
      Alert.alert('Please enter a valid email address');
      return;
    }
    if (skills.length === 0) {
      setLoading(false);
      Alert.alert('Please add at least one skill');
      return;
    }
    if (locations.length === 0) {
      setLoading(false);
      Alert.alert('Please add at least one location');
      return;
    }
    if (minExperience === '') {
      setLoading(false);
      Alert.alert('Minimum Experience is required');
      return;
    }
    if (maxExperience === '') {
      setLoading(false);
      Alert.alert('Maximum Experience is required');
      return;
    }

    try {
      const basePayload = {
        job_title: sanitizeData(jobTitle),
        job_description: sanitizeData(jobDescription),
        job_location: locations.join(','),
        workplace_type: sanitizeData(workplaceType),
        department: sanitizeData(department),
        employment_type: sanitizeData(employmentType),
        receive_applicants_by: 'email',
        email: sanitizeString(email),
        job_skills: skills.join(','),
        job_requirments: requirements.join(','),
        min_experience: parseInt(minExperience),
        max_experience: parseInt(maxExperience),
        min_salary: parseInt(minSalary) || 0,
        max_salary: parseInt(maxSalary) || 0,
        employer_id: parseInt(emp_id),
        education: selectedEducations.join(','),
        company_id: parseInt(comp_id),
        status: job_status,
      };

      // Add conditional fields
      const payload = job
        ? {
            ...basePayload,
            job_id: job.job_id,
            job_category_id: 1,
          }
        : {
            ...basePayload,
            job_category_id: parseInt(selectedCategory),
          };

      const response = await axios.post(API_ENDPOINTS.JOB_POSTING, payload);
      if (response.data.status === 'success') {
        console.log(response.data);
        setLoading(false);
        setScreen(true);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (!screen) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <AppBar
            elevation={0}
            leading={
              <View style={{ padding: 10, gap: 10 }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back" size={20} color="black" />
                </TouchableOpacity>
                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 20, marginLeft: 10 }}>
                  Describe Your Jobs
                </Text>
              </View>
            }
            backgroundColor="white"
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'job-details' && styles.activeTab]}
            onPress={() => setActiveTab('job-details')}
          >
            <Text style={[styles.tabText, activeTab === 'job-details' && styles.activeTabText]}>
              Job Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'requirements' && styles.activeTab]}
            onPress={() => setActiveTab('requirements')}
          >
            <Text style={[styles.tabText, activeTab === 'requirements' && styles.activeTabText]}>
              Requirements
            </Text>
          </TouchableOpacity>
        </View>

        {job && (
          <View style={styles.switchContainer}>
            <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 14 }}>Job Status: </Text>
            <Switch
              value={job_status === 'Active'}
              onValueChange={(value) => setJobStatus(value ? 'Active' : 'Inactive')}
              trackColor={{ false: '#767577', true: Colors.primary }}
            />
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 14,
                backgroundColor: job_status === 'Active' ? '#E4FFFD' : '#FFEFEF',
                padding: 5,
                borderRadius: 5,
                color: job_status === 'Active' ? Colors.primary : '#ff5c5c',
              }}
            >
              {job_status}
            </Text>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollView}>
          {/* Form Fields */}
          {activeTab === 'job-details' && (
            <View style={styles.formContainer}>
              {/* Job Title */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Job Title <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Job Title"
                  placeholderTextColor="#A9A9A9"
                  value={jobTitle}
                  onChangeText={setJobTitle}
                />
              </View>

              {/* Workplace Type */}
              <View style={[styles.fieldContainer]}>
                <Text style={styles.label}>
                  Workplace Type <Text style={styles.required}>*</Text>
                </Text>
                <DropDownPicker
                  listMode="SCROLLVIEW"
                  scrollViewProps={{ nestedScrollEnabled: true }}
                  open={workplaceTypeOpen}
                  setOpen={(open) => {
                    if (open) handleOpenDropdown('workplace');
                    else setWorkplaceTypeOpen(false);
                  }}
                  value={workplaceType}
                  setValue={setWorkplaceType}
                  items={[
                    { label: 'In-person', value: 'in-person' },
                    { label: 'Remote', value: 'remote' },
                    { label: 'Hybrid', value: 'hybrid' },
                  ]}
                  placeholder="Select Workplace Type"
                  placeholderStyle={{ color: '#A9A9A9' }}
                  style={styles.dropdownInput}
                  dropDownContainerStyle={styles.dropdownContainer}
                  zIndex={6000}
                  zIndexInverse={1000}
                />
              </View>

              {/* Work Experience */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Work Experience <Text style={styles.required}>*</Text>
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <TextInput
                    style={[styles.input, { width: 80 }]}
                    placeholderTextColor="#A9A9A9"
                    value={minExperience}
                    onChangeText={setMinExperience}
                    keyboardType="numeric"
                  />
                  <Text> - </Text>
                  <TextInput
                    style={[styles.input, { width: 80 }]}
                    placeholderTextColor="#A9A9A9"
                    value={maxExperience}
                    onChangeText={setMaxExperience}
                    keyboardType="numeric"
                  />
                  <Text>Years</Text>
                </View>
              </View>

              {/* Job Location */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Job Location <Text style={styles.required}>*</Text>
                </Text>

                {/* Location Tags */}
                {locations.length > 0 && (
                  <View style={styles.skillsContainer}>
                    {locations.map((location, index) => (
                      <View key={index} style={styles.skillTag}>
                        <Text style={styles.skillText}>{location}</Text>
                        <TouchableOpacity onPress={() => removeLocation(location)}>
                          <Ionicons name="close" size={18} color="#50B5A3" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {showLocationInput ? (
                  <View style={styles.addSkillInputContainer}>
                    <TextInput
                      style={styles.addSkillInput}
                      placeholder="Enter location"
                      placeholderTextColor="#A9A9A9"
                      value={newLocation}
                      onChangeText={setNewLocation}
                    />
                    <TouchableOpacity style={styles.addSkillButton} onPress={handleAddLocation}>
                      <Text style={styles.addSkillText}>Add</Text>
                      <Ionicons name="add" size={18} color="#50B5A3" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addLocationButton}
                    onPress={() => setShowLocationInput(true)}
                  >
                    <Ionicons name="add" size={18} color="#50B5A3" />
                    <Text style={styles.addLocationText}>Add Location</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Department */}
              <View style={[styles.fieldContainer]}>
                <Text style={styles.label}>
                  Department <Text style={styles.required}>*</Text>
                </Text>
                <DropDownPicker
                  listMode="SCROLLVIEW"
                  scrollViewProps={{ nestedScrollEnabled: true }}
                  open={departmentOpen}
                  setOpen={(open) => {
                    if (open) handleOpenDropdown('department');
                    else setDepartmentOpen(false);
                  }}
                  value={department}
                  setValue={setDepartment}
                  items={DepartmentList}
                  placeholder="Select Department"
                  placeholderStyle={{ color: '#A9A9A9' }}
                  style={styles.dropdownInput}
                  dropDownContainerStyle={styles.dropdownContainer}
                  zIndex={5000}
                  zIndexInverse={1500}
                  arrowColor="#A9A9A9"
                />
              </View>

              {/* Employment Type */}
              <View style={[styles.fieldContainer]}>
                <Text style={styles.label}>
                  Employment Type <Text style={styles.required}>*</Text>
                </Text>
                <DropDownPicker
                  listMode="SCROLLVIEW"
                  scrollViewProps={{ nestedScrollEnabled: true }}
                  open={employmentTypeOpen}
                  setOpen={(open) => {
                    if (open) handleOpenDropdown('employment');
                    else setEmploymentTypeOpen(false);
                  }}
                  value={employmentType}
                  setValue={setEmploymentType}
                  items={[
                    { label: 'Full-time', value: 'full-time' },
                    { label: 'Part-time', value: 'part-time' },
                    { label: 'Contract', value: 'contract' },
                    { label: 'Internship', value: 'internship' },
                  ]}
                  placeholder="Select Employment Type"
                  placeholderStyle={{ color: '#A9A9A9' }}
                  style={[styles.dropdownInput]}
                  dropDownContainerStyle={[styles.dropdownContainer]}
                  zIndex={3000}
                  zIndexInverse={2500}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Education <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.educationBadgesContainer}>
                  {educationList.map((item, index) => {
                    // Check if this education is selected

                    const isSelected = selectedEducations.some(
                      (education) => education === item.education_name
                    );

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[styles.educationBadge, isSelected && styles.selectedEducationBadge]}
                        onPress={() => handleEducationSelect(item)}
                      >
                        <Text
                          style={[
                            styles.educationBadgeText,
                            isSelected && styles.selectedEducationBadgeText,
                          ]}
                        >
                          {item.education_name}
                        </Text>
                        {isSelected && (
                          <View style={styles.checkmarkContainer}>
                            <Ionicons name="checkmark" size={14} color="white" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Job Description */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Job Description <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description"
                  placeholderTextColor="#A9A9A9"
                  multiline={true}
                  numberOfLines={5}
                  value={jobDescription}
                  onChangeText={setJobDescription}
                  maxLength={250}
                />
                <Text style={styles.wordCount}>{jobDescription.length}/250</Text>
              </View>

              {/* Salary */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Salary <Text style={styles.required}>*</Text>
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <TextInput
                    style={[styles.input, { width: '45%' }]}
                    placeholder="Min Salary"
                    placeholderTextColor="#A9A9A9"
                    value={minSalary}
                    onChangeText={setMinSalary}
                    keyboardType="numeric"
                  />
                  <Text>-</Text>
                  <TextInput
                    style={[styles.input, { width: '45%' }]}
                    placeholder="Max Salary"
                    placeholderTextColor="#A9A9A9"
                    value={maxSalary}
                    onChangeText={setMaxSalary}
                    keyboardType="numeric"
                  />
        
                </View>
              </View>

              {/* Add Skills */}
              <View style={[styles.fieldContainer]}>
                <Text style={styles.label}>
                  Add Skills <Text style={styles.required}>*</Text>
                </Text>

                {/* Skills Tags */}
                <View style={styles.skillsContainer}>
                  {skillNames.map((skill, index) => (
                    <View key={index} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                      <TouchableOpacity onPress={() => removeSkill(skill, index)}>
                        <Ionicons name="close" size={18} color="#50B5A3" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                {/* Skill dropdown and add button */}
                <View style={styles.addSkillInputContainer}>
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
              </View>

              {/* How would you like to receive your applicants? */}
              <View style={[styles.fieldContainer, { marginTop: 20, marginBottom: 10 }]}>
                <Text style={styles.sectionTitle}>Enter Email to receive your applicants</Text>
              </View>

              {/* Email Address */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Email Address <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#A9A9A9"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
              </View>
            </View>
          )}

          {activeTab === 'requirements' && (
            <View style={styles.formContainer}>
              {requirements
                .filter((item) => item != '')
                .map((requirement, index) => (
                  <View key={index} style={styles.requirementsContainer}>
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#80559A',
                        borderRadius: 100,
                        width: 14,
                        height: 14,
                      }}
                    >
                      <Ionicons name="checkmark" size={10} color="white" />
                    </View>
                    <Text style={styles.requirementText}>{requirement}</Text>
                  </View>
                ))}

              {showAttachment && (
                <View style={styles.attachmentContainer}>
                  <TextInput
                    value={newRequirement}
                    onChangeText={setNewRequirement}
                    style={styles.attachmentInput}
                    placeholder="Add Requirements"
                    placeholderTextColor="#A9A9A9"
                  />
                  <TouchableOpacity onPress={handleAddRequirement}>
                    <Ionicons name="add" size={20} color="#50B5A3" />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.addRequirementButton}
                onPress={() => setShowAttachment(!showAttachment)}
              >
                <Ionicons name="add" size={18} color={Colors.primary} />
                <Text style={styles.addRequirementText}>Add New Requirements</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Post a job button - Fixed at bottom */}
        {activeTab === 'requirements' && (
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity onPress={handlePost} style={styles.postJobButton}>
              <Text style={styles.postJobButtonText}>{loading ? 'Posting...' : 'Post a job'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  } else {
    return (
      <View style={styles.secondaryContainer}>
        <Image style={styles.image} source={require('../../../assets/image/addJobS.png')} />
        <Text style={styles.title}> {job ? 'Job Vacancy Updated' : 'Job Vacancy Posted'}</Text>
        <Text style={styles.description}>
          Now you can see all the applier CV/Resume and invite them to the next step.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('MyTabs')}
          style={[styles.primaryButton, { marginTop: 50 }]}
        >
          <Text style={styles.primaryButtonText}>Go To Application</Text>
        </TouchableOpacity>
        {!job && (
          <TouchableOpacity
            onPress={() => {
              setScreen(false);
              setActiveTab('job-details');
              setJobTitle('');
              setJobDescription('');
              setWorkplaceType(null);
              setDepartment('');
              setEmploymentType('');
              setReceiveApplicantsBy('email');
              setEmail('');
              setMinExperience('');
              setMaxExperience('');
              setMinSalary('');
              setMaxSalary('');
              setSkills([]);
              setSkillNames([]);
              setSelectedSkill(null);
              setRequirements([]);
              setLocations([]);
              setNewLocation('');
              setNewRequirement('');
              setSelectedEducations([]);
              setSelectedCategory('1');
              setJobStatus('Active');
            }}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Post Another Vacancy</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
};

export default AddJob;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    height: '100%',
  },
  header: {
    marginTop: 10,
    paddingVertical: 10,
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingBottom: 40, // Increased padding to make room for fixed buttons
  },
  switchContainer: {
    paddingHorizontal: 20,
    width: '100%',

    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tabContainer: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: Colors.primary,
  },
  activeTabText: {
    color: 'white',
  },
  formContainer: {
    marginTop: 20,
    width: '100%',
  },
  fieldContainer: {
    marginBottom: 20,
    position: 'relative', // Important for z-index to work properly
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: 'black',
    marginBottom: 8,
  },
  required: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    borderRadius: 10,
    fontFamily: 'Poppins-Regular',
    backgroundColor: 'white',
    width: '100%',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  wordCount: {
    alignSelf: 'flex-end',
    marginTop: 5,
    color: '#A9A9A9',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
    borderRadius: 10,
    minHeight: 60,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#F8F8F8',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 10,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#50B5A3',
    marginRight: 5,
    marginBottom: 5,
  },
  skillText: {
    color: '#50B5A3',
    marginRight: 5,
    fontFamily: 'Poppins-Regular',
  },
  addSkillInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addSkillInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    borderRadius: 10,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#F8F8F8',
  },
  addSkillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  addSkillText: {
    color: '#50B5A3',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginRight: 5,
  },
  addLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  addLocationText: {
    color: '#50B5A3',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginLeft: 5,
  },
  requirementsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    marginBottom: 10,
  },
  requirementText: {
    marginLeft: 10,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    marginBottom: 20,
  },
  attachmentInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    marginRight: 10,
  },
  addRequirementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  addRequirementText: {
    color: Colors.primary,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginLeft: 5,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  postJobButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  postJobButtonText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  secondaryContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: 'black',
    marginBottom: 10,
    textAlign: 'center',
  },
  educationBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 5,
  },
  educationBadge: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
  },
  selectedEducationBadge: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9F7',
  },
  educationBadgeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666',
  },
  selectedEducationBadgeText: {
    color: Colors.primary,
    fontFamily: 'Poppins-Medium',
  },
  checkmarkContainer: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'gray',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: 'black',
    marginBottom: 10,
  },
});
