import React, { useState } from 'react';
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
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';

const ProfessionalDetail = () => {
  const route = useRoute();
  const { data, id } = route.params;

  const professional = useSelector((state) => state.professionalDetails);

  const [currentIndustry, setCurrentIndustry] = useState(data?.current_industry);
  const [currentDepartment, setCurrentDepartment] = useState(data?.current_department);
  const [currentJobRole, setCurrentJobRole] = useState(data?.current_job_role);
  const [currentRoleCategory, setCurrentRoleCategory] = useState(data?.role_category);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  // State for error messages
  const [industryError, setIndustryError] = useState('');
  const [departmentError, setDepartmentError] = useState('');
  const [roleCategoryError, setRoleCategoryError] = useState('');
  const [jobRoleError, setJobRoleError] = useState('');

  console.log(professional);

  const validateInputs = () => {
    let isValid = true;

    if (!currentIndustry?.trim()) {
      setIndustryError('Industry is required');
      isValid = false;
    } else {
      setIndustryError('');
    }

    if (!currentDepartment?.trim()) {
      setDepartmentError('Department is required');
      isValid = false;
    } else {
      setDepartmentError('');
    }

    if (!currentRoleCategory?.trim()) {
      setRoleCategoryError('Role Category is required');
      isValid = false;
    } else {
      setRoleCategoryError('');
    }

    if (!currentJobRole?.trim()) {
      setJobRoleError('Job Role is required');
      isValid = false;
    } else {
      setJobRoleError('');
    }

    return isValid;
  };

  const handleSave = async () => {
    console.log('calling save');

    if (!validateInputs()) {
      return; // Stop if any input is invalid
    }

    const params = {
      user_id: id,
      current_industry: currentIndustry,
      current_department: currentDepartment,
      role_category: currentRoleCategory,
      current_job_role: currentJobRole,
    };

    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.PROFESSIONAL_DETAIL, params);
      if (response.data.status == 'success') {
        setLoading(false);
        navigation.navigate('MyTabs');
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Professional Detail</Text>
        </View>
        <TouchableOpacity disabled={loading} onPress={handleSave}>
          <Text style={styles.saveButton}> {loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Industry</Text>
          <TextInput
            style={[styles.input, industryError && styles.inputError]}
            value={currentIndustry}
            onChangeText={setCurrentIndustry}
            placeholder="Industry"
          />
          {industryError && <Text style={styles.errorText}>{industryError}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Department</Text>
          <TextInput
            style={[styles.input, departmentError && styles.inputError]}
            value={currentDepartment}
            onChangeText={setCurrentDepartment}
            placeholder="Department"
          />
          {departmentError && <Text style={styles.errorText}>{departmentError}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Role Category</Text>
          <TextInput
            style={[styles.input, roleCategoryError && styles.inputError]}
            value={currentRoleCategory}
            onChangeText={setCurrentRoleCategory}
            placeholder="Role Category"
          />
          {roleCategoryError && <Text style={styles.errorText}>{roleCategoryError}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Job Role</Text>
          <TextInput
            style={[styles.input, jobRoleError && styles.inputError]}
            value={currentJobRole}
            onChangeText={setCurrentJobRole}
            placeholder="Job Role"
          />
          {jobRoleError && <Text style={styles.errorText}>{jobRoleError}</Text>}
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
    position: 'relative', // Added for absolute positioning of error message
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
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5, // Added marginTop for spacing
  },
  wordCount: {
    marginTop: 5,
    textAlign: 'right',
    color: '#666',
    fontSize: 14,
  },
});

export default ProfessionalDetail;