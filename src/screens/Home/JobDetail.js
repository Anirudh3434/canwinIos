import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../theme/color';
import DocumentPicker from 'react-native-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import { API_ENDPOINTS } from '../../api/apiConfig';
import RNFS from 'react-native-fs';

const JobDetailModal = ({ visible, onClose, job, onSuccess, IsSaved, isSaveList, onRefetch }) => {
  // State variables
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [resume, setResume] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResume, setIsResume] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');
  const [save, setSave] = useState(IsSaved || false);
  const route = useRoute();
  const [applicationCount, setApplicationCount] = useState(0);

  const jobDetail = route.params;

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

      if (response.data.status === 'success' && response.data.data) {
        const hasResume =
          response.data.data.resume_file_name && response.data.data.resume_file_name !== '';
        setIsResume(hasResume);
        if (hasResume) {
          setResumeFileName(response.data.data.resume_file_name);
        }
      }
    } catch (error) {
      console.error('Error fetching docs:', error);
      setIsResume(false);
    }
  };

  const fetchUserData = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      // Fetch user introduction data
      const introResponse = await axios.get(`${API_ENDPOINTS.INTRODUCTION}?user_id=${userId}`);

      // Fetch personal details
      const personalResponse = await axios.get(`${API_ENDPOINTS.BASIC_DETAILS}?user_id=${userId}`);

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

  const FetchApplicationCount = async () => {
    console.log('callinng ......');

    try {
      const response = await axios.get(API_ENDPOINTS.APPLICATION_COUNT, {
        params: {
          job_id: job?.job_id,
        },
      });
      setApplicationCount(response.data.count);
      console.log('response', response.data);
    } catch (error) {
      console.log('Error fetching application count:', error);
    }
  };

  useEffect(() => {
    FetchApplicationCount();
  }, [job?.job_id]);

  // Use effect hooks
  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchDocs();
    }
  }, [userId]);

  // Document picker
  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx],
      });

      const file = res[0];
      const filePath = file.uri.replace('file://', '');
      const base64Data = await RNFS.readFile(filePath, 'base64');

      const blob = {
        name: file.name,
        type: file.type,
        data: base64Data,
      };

      setResume(blob);
      uploadDocument(blob, 'R');
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled document picker');
      } else {
        console.error('Error picking document:', err);
      }
    }
  };

  const uploadDocument = async (data, type) => {
    if (!userId) return;

    const payload = {
      user_id: userId,
      type: type,
      file_name: data.name,
      mime_type: data.type,
      blob_file: data.data,
    };

    try {
      const response = await axios.post(API_ENDPOINTS.DOCS, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // Increase timeout for big uploads
      });

      console.log('Upload response:', response.data);

      // Update resume status after successful upload
      if (response.data.status === 'success') {
        setIsResume(true);
        setResumeFileName(data.name);
      }
    } catch (error) {
      console.error('Upload failed:', error.response?.data || error.message);
      Alert.alert('Upload Failed', 'Failed to upload resume. Please try again.');
    }
  };

  // Form submission
  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not logged in. Please log in to apply.');
      return;
    }

    if (!isResume && !resume) {
      Alert.alert('Resume Required', 'Please upload your resume to apply for this job.');
      return;
    }

    if (!job || !job?.job_id) {
      Alert.alert('Error', 'Job information is missing. Please try again later.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(API_ENDPOINTS.JOB_APPLY, {
        user_id: userId,
        job_id: job?.job_id,
        application_status: 'Applied',
      });

      console.log('response', response);

      if (response.data.status === 'success') {
        const changeStatus = await axios.post(API_ENDPOINTS.APPLICATION_LOGS, {
          application_id: response.data.application_id,
          new_status: 'Applied',
        });

        if (changeStatus.data.status === 'success') {
          setShowApplicationForm(false);
          onClose();
        }

        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }
      } else {
        Alert.alert('Error', response.data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // File input component
  const FileInput = () => {
    return (
      <View>
        {!isResume && !resume ? (
          <View style={styles.AlertContainer}>
            <Ionicons name="alert" size={24} color={Colors.primary} />
            <Text style={styles.AlertText}>Resume not uploaded</Text>
          </View>
        ) : (
          <View style={styles.AlertContainer}>
            <Ionicons name="checkmark" size={24} color={Colors.primary} />
            <Text style={styles.AlertText}>Resume available</Text>
          </View>
        )}
        <TouchableOpacity style={styles.fileInput} onPress={pickDocument}>
          <Ionicons name="document-attach-outline" size={24} color={Colors.primary} />
          <Text style={styles.fileInputText}>
            {resume
              ? resume.name
              : isResume
              ? resumeFileName || 'Resume Available'
              : 'Upload Resume'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const shareJob = async () => {
    if (!job || !job?.job_id) {
      Alert.alert('Error', 'Job information is missing. Cannot share at this time.');
      return;
    }

    const jobId = job?.job_id;
    const deepLink = `https://canwinn.abacasys.com/job?job_id=${jobId}`;

    try {
      await Share.share({
        message: `Check out this job opportunity: ${job?.job_title} at ${job?.company_name}\n${deepLink}`,
      });
    } catch (error) {
      console.error('Error sharing job:', error);
      Alert.alert('Error', 'Failed to share job. Please try again.');
    }
  };

  const handleSaveJob = async () => {
    if (!userId) {
      Alert.alert('Error', 'Please log in to save jobs.');
      return;
    }

    if (!job || !job?.job_id) {
      Alert.alert('Error', 'Job information is missing. Cannot save at this time.');
      return;
    }

    try {
      if (!save) {
        // Save the job
        const response = await axios.post(API_ENDPOINTS.SAVE_JOBS, {
          user_id: userId,
          job_id: job?.job_id,
        });

        console.log('Save job response:', response.data);

        if (
          response.data.status === 'success' &&
          response.data.message === 'Data inserted successfully'
        ) {
          setSave(true);
          Alert.alert('Success', 'Job saved successfully');
        } else if (response.data.message === 'You have already saved this job') {
          Alert.alert('Info', 'Job already saved');
        } else {
          Alert.alert('Error', response.data.message || 'Failed to save job');
        }
      } else {
        console.log(userId, +job?.job_id);
        const payload = {
          user_id: userId,
          job_id: +job?.job_id,
        };

        console.log(payload);
        const response = await axios.delete(API_ENDPOINTS.UNSAVED_JOBS, {
          data: payload,
        });

        console.log('Unsave job response:', response.data);

        if (response.data.status === 'success') {
          Alert.alert('Success', 'Job unsaved successfully');
          setSave(false);
          if (isSaveList) {
            onRefetch();
            onClose();
          }
        } else {
          Alert.alert('Error', response.data.message || 'Failed to unsave job');
        }
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  // Safely parse qualifications and skills
  const qualifications =
    job?.job_requirments && typeof job.job_requirments === 'string' && job.job_requirments !== ''
      ? job.job_requirments.split(',')
      : [];

  const skills =
    job?.job_skills && typeof job.job_skills === 'string' && job.job_skills !== ''
      ? job.job_skills.split(',')
      : [];

  // Handle education safely
  const educationItems =
    job?.education && typeof job.education === 'string' && job.education !== ''
      ? job.education.split(',')
      : [];

  if (!job) {
    return (
      <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.formTitle}>Error: Job information not available</Text>
            <TouchableOpacity style={styles.applyButton} onPress={onClose}>
              <Text style={styles.applyButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
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
              <TouchableOpacity
                onPress={handleSaveJob}
                style={{ backgroundColor: 'white', borderRadius: 50, padding: 8 }}
              >
                <Ionicons
                  name={save ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={shareJob}
                style={{ backgroundColor: 'white', borderRadius: 50, padding: 8 }}
              >
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
              <View style={{ width: 150, height: 5, backgroundColor: 'black', borderRadius: 10 }} />
            </View>

            <View style={styles.jobDetailHeader}>
              <Image source={{ uri: job?.company_logo }} style={styles.jobDetailImage} />
              <View style={styles.jobTitleContainer}>
                <Text style={styles.jobCompany}>{job?.company_name || 'Company'}</Text>
                <Text style={styles.jobPosition}>{job?.job_title || 'Position'}</Text>
              </View>
            </View>

            <ScrollView
              style={styles.badgeContainer}
              showsHorizontalScrollIndicator={false}
              horizontal={true}
            >
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{job?.employment_type || 'Full Time'}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{job?.workplace_type || 'Remote'}</Text>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {job?.min_experience || 0}-{job?.max_experience || 0} Years
                </Text>
              </View>

              {educationItems.map((item, index) => (
                <View key={index} style={styles.badge}>
                  <Text style={styles.badgeText}>{item.trim()}</Text>
                </View>
              ))}
            </ScrollView>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>Job Detail</Text>
              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="people-outline" size={22} color="#7C7C7C" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Applicant Applied</Text>
                    <Text style={styles.infoValue}>{applicationCount}</Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="cash-outline" size={22} color="#7C7C7C" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Salary</Text>
                    <Text style={styles.infoValue}>
                      {job?.min_salary || '0'} - {job?.max_salary || '0'} LPA
                    </Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="location-outline" size={22} color="#7C7C7C" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>{job?.job_location || 'Not specified'}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Skills Required</Text>
              <View style={[styles.requirementsList, { flexDirection: 'row', flexWrap: 'wrap' }]}>
                {skills.length > 0 ? (
                  skills.map((item, index) => (
                    <View key={index} style={styles.skillChip}>
                      <Ionicons name="checkmark" size={10} color="gray" />
                      <Text style={styles.skillText}>{item.trim()}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.requirementText}>No Skills Listed</Text>
                )}
              </View>

              <Text style={styles.sectionTitle}>Job Description</Text>
              <Text style={styles.descriptionText}>
                {job?.job_description || 'No description available'}
              </Text>

              <Text style={styles.sectionTitle}>About Company</Text>
              <Text style={styles.descriptionText}>{job?.about || 'No information available'}</Text>

              <Text style={styles.sectionTitle}>Requirements</Text>
              <View style={styles.requirementsList}>
                {qualifications.length > 0 ? (
                  qualifications.map((item, index) => (
                    <View key={index} style={styles.requirementItem}>
                      <View style={styles.bulletPoint} />
                      <Text style={styles.requirementText}>{item.trim()}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.requirementText}>No specific requirements listed</Text>
                )}
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
                <View style={[styles.inputContainer]}>
                  <Ionicons name="person-outline" size={24} color="#D5D9DF" />
                  <Text style={styles.inputText}>{name || 'Not available'}</Text>
                </View>
                <View style={[styles.inputContainer]}>
                  <Ionicons name="mail-outline" size={24} color="#D5D9DF" />
                  <Text style={styles.inputText}>{email || 'Not available'}</Text>
                </View>
                <View style={[styles.inputContainer]}>
                  <Ionicons name="call-outline" size={24} color="#D5D9DF" />
                  <Text style={styles.inputText}>{mobile || 'Not available'}</Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  disabled={isLoading}
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.applyButtonText}>
                    {isLoading ? 'Applying...' : 'Apply Job'}
                  </Text>
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
    borderRadius: 50,
    marginRight: 15,
    backgroundColor: '#F6F6F6',
  },
  AlertContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    gap: 20,
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
  AlertText: {
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
    marginBottom: 5,
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
  inputText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#424242',
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
  closeButton: {
    padding: 5,
  },
});

export default JobDetailModal;
