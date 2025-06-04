import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { AppBar } from '@react-native-material/core';
import style from '../../theme/style';
import { Colors } from '../../theme/color';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const JobOfferLetter = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { job, name, job_title, profile_image } = route.params;

  console.log('job', job);

  const [jobtitle, setJobtitle] = useState(job_title);
  const [startDate, setStartDate] = useState('01/07/2025');
  const [salary, setSalary] = useState('₹8.5 LPA');
  const [location, setLocation] = useState('Mohali, Punjab');
  const [offerLetter, setOfferLetter] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);



  const fetchFcmToken = async () => {
    const response = await axios.get(API_ENDPOINTS.FCM + `?user_id=${job.applicant_user_id}`);
    console.log('response', response.data.data.fcm_token);
    setFcmToken(response.data.data.fcm_token);
  };


  useEffect(() => {
    fetchFcmToken();
  }, []);

  const handleSend = async () => {
    if (!offerLetter) {
      Alert.alert('Missing Offer Letter', 'Please upload an offer letter before sending.');
      return;
    }

    try {
      // Upload the file to the backend
      const payload = {
        user_id: job.applicant_user_id,
        type: 'OL',
        file_name: offerLetter.name,
        mime_type: offerLetter.type,
        blob_file: offerLetter.data,
      };

      console.log('Payload:', payload);
      const response = await axios.post(API_ENDPOINTS.DOCS, payload);

      console.log('Response:', response.data);

      // Send offer letter details
      const offerLetterPayload = {
        job_title: jobtitle,
        salary_offer: salary,
        location,
        application_id: job.application_id,
        job_id: job.job_id,
        start_date: startDate,
        user_id: job.applicant_user_id,
        offer_letter_url: response.data.offer_letter,
      };

      const offerLetterResponse = await axios.post(API_ENDPOINTS.OFFER_LETTER, offerLetterPayload);

      const notifyResponse = await axios.post(API_ENDPOINTS.NODE_SERVER + '/notify/offer-letter', {
        fcm_token: fcmToken,
        user_id: job.applicant_user_id,
        job_id: job.job_id,
        application_id: job.application_id,
        message: 'You received an offer letter',
      });
      console.log('notifyResponse', notifyResponse.data);

      console.log('Offer Letter Response:', offerLetterResponse.data);

      Alert.alert('Success', 'Offer letter sent successfully!');

      // Update application status
      await axios.post(API_ENDPOINTS.APPLICATION_LOGS, {
        application_id: job.application_id,
        old_status: 'Interview Completed',
        new_status: 'Offer Letter Sent',
      });

      const statusPayload = {
        applicant_id: +job.application_id,
        user_id: +job.applicant_user_id,
        job_id: job.job_id,
        application_status: 'Offer Letter Sent',
      };

      const statusResponse = await axios.post(API_ENDPOINTS.JOB_APPLY, statusPayload);
      console.log('statusResponse', statusResponse.data);

      navigation.navigate('MyTabs');
    } catch (error) {
      Alert.alert('Error', 'Failed to send offer letter.');
      console.error('Send Error:', error);
    }
  };

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

      setOfferLetter(blob);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled document picker');
      } else {
        console.error('Error picking document:', err);
        Alert.alert('Error', 'Failed to pick document.');
      }
    }
  };

  return (
    <SafeAreaView style={style.area}>
      <AppBar
        color={Colors.bg}
        elevation={1}
        style={{ paddingHorizontal: 10, paddingVertical: 10 }}
        leading={
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
              <Ionicons name="arrow-back" size={24} />
            </TouchableOpacity>
            <Text style={styles.nameText}>Send Offer Letter</Text>
          </View>
        }
      />

      <View style={styles.profileContainer}>
        <View style={styles.profileImage}>
          <Image source={{ uri: profile_image }} style={styles.avatar} />
        </View>
        <Text style={styles.profileName}>{name}</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Job Title</Text>
          <TextInput style={styles.textInput} value={jobtitle} onChangeText={setJobtitle} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Start Date</Text>
          <View style={styles.dateInputContainer}>
            <TextInput style={styles.textInput} value={startDate} onChangeText={setStartDate} />
            <TouchableOpacity style={styles.calendarIcon}>
              <Text>📅</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Salary Offered</Text>
          <TextInput style={styles.textInput} value={salary} onChangeText={setSalary} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Location</Text>
          <TextInput style={styles.textInput} value={location} onChangeText={setLocation} />
        </View>
      </View>

      <View style={{ alignItems: 'center' }}>
      <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
        <Ionicons name={offerLetter?.name ? 'document-outline' : 'cloud-upload-outline'} size={24} color="black" />
        <Text style={styles.uploadText}>
          {offerLetter?.name ? offerLetter.name.slice(0, 35) + '...' : 'Upload Offer Letter (pdf/doc)'}
        </Text>
      </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
        <Text style={styles.sendButtonText}>Send to Candidate</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
    marginBottom: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    marginVertical: 4,
  },
  formContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    position: 'absolute',
    right: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 20,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 8,
    width: '90%',
  },
  uploadIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  uploadText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  sendButton: {
    backgroundColor: Colors.primary || '#47c480',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 16,
  },
  sendButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
});

export default JobOfferLetter;
