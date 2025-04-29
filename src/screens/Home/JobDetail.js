import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../theme/color';
import DocumentPicker from 'react-native-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Added missing axios import
import { API_ENDPOINTS } from '../../api/apiConfig';

const JobDetailModal = ({ visible, onClose, job, onSuccess }) => {
  // State variables
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [resume, setResume] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResume, setIsResume] = useState(false);




  // Fetch user data
  const fetchUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(parseInt(storedUserId, 10));
      }
    } catch (error) {
      console.error('Error fetching userId:', error);
    }
  };

  const fetchDocs = async () => {
    if (!userId) return;
    try {
      const response = await axios.get(`${API_ENDPOINTS.DOCS}?user_id=${userId}`);
      if(
        response.data.data.resume_file_name !== ''
      ){
        setIsResume(true)
      }
    } catch (error) {
      console.error('Error fetching docs:', error);
    }
  };

  const fetchUserData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Fetch user introduction data
      const introResponse = await axios.get(
        `${API_ENDPOINTS.INTRODUCTION}?user_id=${userId}`
      );
  
      
      // Fetch personal details
      const personalResponse = await axios.get(
        `${API_ENDPOINTS.BASIC_DETAILS}?user_id=${userId}`
      );

      const introData = introResponse.data.data || {};
      const personalData = personalResponse.data.data || {};

      // Merge the data
      const combinedData = { ...introData, ...personalData };
      setUserData(combinedData);
      
   
      // Pre-fill form with user data if available
      if (combinedData.full_name) setName(combinedData.full_name);
      if (combinedData.email) setEmail(combinedData.email);
      if (combinedData.mobile_number) setMobile(combinedData.mobile_number);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Use effect hooks
  useEffect(() => {
    fetchUserId();
    fetchDocs();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Input handlers
  const handleInputFocus = (inputName) => {
    setFocusedInput(inputName);
  };

  const handleInputBlur = () => {
    setFocusedInput(null);
  };

  // Document picker
  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx],
      });
      setResume(res[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
 
      } else {
        console.error('Error picking document:', err);
      }
    }
  };

 

  // Form submission
  const handleSubmit = async () => {
    try {
       setIsLoading (true);
       const response = await axios.post(API_ENDPOINTS.JOB_APPLY , {
        user_id : userId,
        job_id : job.job_id,
       })
      console.log(response.data)
       if(response.data.status === 'success') {
      setShowApplicationForm(false);
      onClose();
      onSuccess();
       }
       setIsLoading(false);
      
   
      
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    }finally {
      setIsLoading(false);
    }
  };

  // File input component
  const FileInput = () => {
    return (
      <View>
        <View>
          {!isResume &&  <View style={styles.AlertContainer}>
             <Ionicons name="alert" size={24} color={Colors.primary} />
             <Text style={styles.AlertText}>Resume not uploaded</Text>
           </View>}
        </View>
        <TouchableOpacity style={styles.fileInput} onPress={pickDocument}>
          <Ionicons name="document-attach-outline" size={24} color={Colors.primary} />
          <Text style={styles.fileInputText}>
            {resume ? resume.name : 'Upload Resume'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Parse qualifications
const qualifications = job?.job_requirments && job.job_requirments !== "" 
  ? job.job_requirments.split(',') 
  : [];


 const skills = job?.job_skills && job.job_skills !== "" 
  ? job.job_skills.split(',') 
  : []; 


  return (
    <Modal 
      animationType="slide" 
      transparent={true} 
      visible={visible} 
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {!showApplicationForm && (
          <View style={styles.ButtonContainer}>
            <TouchableOpacity
              style={{ backgroundColor: 'white', borderRadius: 50, padding: 8 }}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={{ backgroundColor: 'white', borderRadius: 50, padding: 8 }}>
                <Ionicons name="bookmark-outline" size={24} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: 'white', borderRadius: 50, padding: 8 }}>
                <Ionicons name="arrow-redo-circle-outline" size={26} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!showApplicationForm ? (
          <View style={styles.modalContainer}>
            <View
              style={{
                width: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: 30,
                marginTop: 5,
              }}
            >
              <View
                style={{ width: 150, height: 5, backgroundColor: 'black', borderRadius: 10 }}
              />
            </View>

            <View style={styles.jobDetailHeader}>
              <Image
                source={require('../../../assets/image/s17.png')}
                style={styles.jobDetailImage}
              />
              <View style={styles.jobTitleContainer}>
                <Text style={styles.jobCompany}>{job?.company_name || 'Amazon'}</Text>
                <Text style={styles.jobPosition}>{job?.job_title || 'Senior Software Engineer'}</Text>
              </View>
            </View>

            <ScrollView style={styles.badgeContainer} showsVerticalScrollIndicator={false} horizontal={true}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{job?.employment_type || 'Full Time'}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{job?.workplace_type || 'Remote'}</Text>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>{job?.min_experience}-{job?.max_experience} Years</Text>
              </View>

               {
                 job?.education.split(',') ?.map((item, index) => (
                  <View key={index} style={styles.badge}>
                    <Text style={styles.badgeText}>{item.trim()}</Text>
                  </View>
                 ))
               }
            </ScrollView>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>Job Detail</Text>
              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="cash-outline" size={22} color="#7C7C7C" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Salary</Text>
                    <Text style={styles.infoValue}>
                      {job?.min_salary} - {job?.max_salary} LPA
                    </Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="location-outline" size={22} color="#7C7C7C" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>{job?.job_location}</Text>
                  </View>
                </View>
              </View>

               <Text style={styles.sectionTitle}>Skills Required</Text>
              <View style={[styles.requirementsList , {flexDirection: 'row'}]}>
              {skills.length > 0 ?  skills.map((item, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Ionicons name="checkmark" size={10} color="gray" />
                    <Text style={styles.skillText}>{item.trim()}</Text>
                  </View>
                )) : <Text style={styles.requirementText}>No Skills</Text>}
              </View>


              <Text style={styles.sectionTitle}>Job Description</Text>
              <Text style={styles.descriptionText}>
                {job?.job_description || 'No description available'}
              </Text>

              <Text style={styles.sectionTitle}>About Company</Text>
              <Text style={styles.descriptionText}>
                {job?.about || 'No description available'}
              </Text>

              <Text style={styles.sectionTitle}>Qualification</Text>
              <View style={styles.requirementsList}>
              {qualifications.length > 0 ?  qualifications.map((item, index) => (
                  <View key={index} style={styles.requirementItem}>
                    <View style={styles.bulletPoint} />
                    <Text style={styles.requirementText}>{item.trim()}</Text>
                  </View>
                )) : <Text style={styles.requirementText}>No Qualifications</Text>}
              </View>



              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowApplicationForm(true)}
              >
                <Text style={styles.applyButtonText}>Apply Now</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        ) : (
          <View style={[styles.modalContainer, { height: 600 }]}>
            <View
              style={{
                width: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: 20,
                marginTop: 5,
              }}
            >
              <View style={{ width: 150, height: 5, backgroundColor: 'black', borderRadius: 10 }} />
            </View>

            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'start',
                  justifyContent: 'space-between',
                }}
              >
                <Ionicons
                  name="arrow-back"
                  size={30}
                  color="black"
                  style={styles.closeButton}
                  onPress={() => setShowApplicationForm(false)}
                />
                <Text style={styles.formTitle}>Apply Form</Text>
                <View />
              </View>

              <View>
                <FileInput />
                <View
                  style={[styles.inputContainer]}
                >
                  <Ionicons
                    name="person-outline"
                    size={24}
                    color="#D5D9DF"
                  />
                  <Text>{name}</Text>
                </View>
                <View
                  style={[styles.inputContainer]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={24}
                    color={focusedInput === 'email' ? Colors.primary : '#D5D9DF'}
                  />
                  <Text>{email}</Text>
                </View>
                <View
                  style={[styles.inputContainer, focusedInput === 'mobile' && styles.focusedInput]}
                >
                  <Ionicons
                    name="call-outline"
                    size={24}
                    color={focusedInput === 'mobile' ? Colors.primary : '#D5D9DF'}
                  />
                  <Text>{mobile}</Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  disabled={isLoading}
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.applyButtonText}> {isLoading ? 'Applying...' : 'Apply Job'} </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  focusedInput: {
    borderColor: Colors.primary,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    height: '85%',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  ButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  jobDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  jobDetailImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
  },
  AlertContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
  },
  jobTitleContainer: {
    flex: 1,
  },
  jobCompany: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#424242',
  },
  jobPosition: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#212121',
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    height: 50,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  badge: {
    backgroundColor: '#EAEAEAFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  badgeText: {
    color: '#7C7C7C',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  AlertText:{
    fontFamily: 'Poppins-Regular',
    marginTop: 5,
    color: '#424242',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#212121',
    marginBottom: 10,
    marginTop: 10,
  },
  infoContainer: {
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 0,

  },
   skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 5,
    backgroundColor: '#DFFAF6',

  },

  skillText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#505050',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F6F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#757575',
    fontFamily: 'Poppins-Regular',
  },
  infoValue: {
    fontSize: 15,
    color: '#212121',
    fontFamily: 'Poppins-Medium',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#424242',
    fontFamily: 'Poppins-Regular',
    marginBottom: 20,
  },
  requirementsList: {
    marginBottom: 25,
  },
  requirementItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#80559A',
    marginTop: 6,
    marginRight: 10,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    color: '#424242',
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  applyButton: {
    backgroundColor: Colors.primary || '#4CAF50',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  formTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#212121',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    height: 70,
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 12,
    marginBottom: 15,
    gap: 10,
  },
  input: {
    fontSize: 16,
    height: '100%',
    marginLeft: 10,
    width: '90%',
    backgroundColor: 'transparent',
  },
  fileInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 12,
    padding: 15,
    marginBottom: 40,
  },
  fileInputText: {
    marginLeft: 10,
    color: Colors.primary,
    fontFamily: 'Poppins-Medium',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  backButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  backButtonText: {
    color: '#424242',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  submitButton: {
    backgroundColor: Colors.primary || '#4CAF50',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    flex: 2,
  },
});

export default JobDetailModal;