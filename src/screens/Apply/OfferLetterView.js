import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFetchProfileDetail } from '../../hooks/profileData';
import { Colors } from '../../theme/color';

const OfferLetterView = () => {
  const [userId, setUserId] = useState(null);
  const [offerLetter, setOfferLetter] = useState(null);

  const navigation = useNavigation();

  const route = useRoute();
  const { jobId } = route.params;
  console.log(jobId);

  const fetchUserId = async () => {
    try {
      const UserId = await AsyncStorage.getItem('userId');
      console.log(UserId);
      setUserId(UserId);
    } catch (error) {
      console.error('Error fetching user id:', error);
    }
  };

  // Modified download function to actually download the PDF
  const handleDownloadPdf = async () => {
    console.log('Download PDF pressed');

    if (!offerLetter?.offer_letter) {
      Alert.alert('Error', 'No offer letter available to download');
      return;
    }

    try {
      // For React Native, you can use Linking to open the PDF URL
      // This will open in the device's default PDF viewer/browser
      await Linking.openURL(offerLetter.offer_letter);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      Alert.alert('Error', 'Failed to download PDF');
    }
  };

  const handleAcceptOffer = async () => {
    try {
      const payload = {
        user_id: +userId,
        job_id: jobId,
        application_status: 'Offer Accepted',
      };

      const response = await axios.post(API_ENDPOINTS.JOB_APPLY, payload);
      console.log('response', response.data);

      if (response.data.status === 'success') {
        try {
          const reponse = await axios.post(API_ENDPOINTS.APPLICATION_LOGS, {
            application_id: +offerLetter?.application_id,
            old_status: 'Offer Sent',
            new_status: 'Offer Accepted',
          });
          console.log('reponse', reponse.data);

          if (reponse.data.status === 'success') {
            Alert.alert('Success', 'Offer accepted successfully', [{ text: 'OK' }]);
          }
        } catch (error) {
          console.log('error', error);
        }
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleRejectOffer = async () => {
    try {
      const payload = {
        user_id: +userId,
        job_id: offerLetter?.job_id,
        application_status: 'Offer Rejected',
      };

      const response = await axios.post(API_ENDPOINTS.JOB_APPLY, payload);
      console.log('response', response.data);

      if (response.data.status === 'success') {
        try {
          const reponse = await axios.post(API_ENDPOINTS.APPLICATION_LOGS, {
            application_id: +offerLetter?.application_id,
            old_status: 'Offer Sent',
            new_status: 'Offer Rejected',
          });
          console.log('reponse', reponse.data);

          if (reponse.data.status === 'success') {
            Alert.alert('Success', 'Offer rejected successfully', [{ text: 'OK' }]);
          }
        } catch (error) {
          console.log('error', error);
        }
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleGoBack = () => {
    console.log('Go Back pressed');
    navigation.goBack();
  };

  const { profileDetail } = useFetchProfileDetail(userId);

  const fetchOfferLetter = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.OFFER_LETTER, {
        params: { user_id: userId, job_id: jobId },
      });
      const res = response?.data;
      console.log('res', res);
      setOfferLetter(res);
    } catch (error) {
      console.error('Error fetching offer letter:', error);
    }
  };

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchOfferLetter();
    }
  }, [userId]);

  console.log('offerLetter', offerLetter);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offer Letter</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: profileDetail?.docs?.pp_url,
              }}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.candidateName}>{profileDetail?.introduction?.full_name}</Text>
          <Text style={styles.designation}>{offerLetter?.job_title}</Text>
        </View>

        {/* Offer Letter Preview */}
        <View style={styles.letterPreview}>
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Offer Details</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Salary:</Text>
              <Text style={styles.detailValue}>{offerLetter?.salary_offer}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Start Date:</Text>
              <Text style={styles.detailValue}>{offerLetter?.start_date}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>{offerLetter?.location}</Text>
            </View>
          </View>

          {/* Modified: Show placeholder instead of WebView to prevent auto-download */}
          <View style={styles.letterContent}>
            <View style={styles.pdfPlaceholder}>
              <Ionicons name="document-text-outline" size={48} color="#00bfa5" />
              <Text style={styles.pdfPlaceholderText}>Offer Letter PDF</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPdf}>
            <Ionicons name="download-outline" size={24} color="white" />
            <Text style={styles.downloadText}>Download & View PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptOffer}>
            <Text style={styles.acceptButtonText}>Accept Offer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rejectButton} onPress={handleRejectOffer}>
            <Text style={styles.rejectButtonText}>Reject Offer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  backArrow: {
    fontSize: 24,
    color: '#333333',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#000000',
  },
  headerRight: {
    width: 34, // Same width as back button for centering
  },
  scrollContainer: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  candidateName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 5,
  },
  designation: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
  },
  detailsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
    fontFamily: 'Poppins-SemiBold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    width: '100%',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Poppins-Regular',
  },
  detailValue: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Poppins-Regular',
  },
  letterPreview: {
    flexDirection: 'column',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  letterHeader: {
    marginBottom: 15,
  },
  letterDate: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'right',
  },
  letterContent: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '80%',
    height: 200,
    backgroundColor: '#f9f9f9',
  },
  // New styles for PDF placeholder
  pdfPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  pdfPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginTop: 10,
  },
  pdfPlaceholderSubtext: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
  },
  webview: {
    height: 200,
    width: '100%',
  },
  letterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
  },
  letterText: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
    marginBottom: 12,
  },
  downloadButton: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  downloadIcon: {
    color: '#ffffff',
    fontSize: 16,
    marginRight: 8,
  },
  downloadText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 15,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rejectButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OfferLetterView;
